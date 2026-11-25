// ============================================================
// Cowdi English — Tests Bước 7: Rà soát bảo mật payload (AT-11),
// sự kiện NFR-06 & quy tắc không dùng alert/confirm/prompt (C-04).
// ============================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

import { createInvitesRouter } from '../routes/invites.js';
import { createFriendsRouter } from '../routes/friends.js';
import { createInviteLandingRouter } from '../routes/inviteLanding.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

const CANARY_PII = [
  'canary-email@secret.vn',
  'Nguyen Van Google Real',
  'https://lh3.googleusercontent.com/canary-pic',
  '203.0.113.88',
  'canary_device_hash_secret_64',
];

function assertNoPiiLeak(text, label) {
  for (const secret of CANARY_PII) {
    assert.equal(
      text.includes(secret),
      false,
      `[${label}] Rò rỉ dữ liệu nhạy cảm: ${secret}`
    );
  }
}

describe('Bước 7 — Kiểm định bảo mật AT-11, sự kiện NFR-06 & quy tắc C-04', () => {
  it('AT-11: Toàn bộ API phân hệ Bạn bè & Mời bạn không rò email, tên thật Google, ảnh Google, IP hay điểm bài', async () => {
    const fakeDb = {
      async execute(sql) {
        const q = sql.replace(/\s+/g, ' ').trim();
        if (/FROM invites i LEFT JOIN users u/i.test(q)) {
          return [[{
            code: 'SAFE2345',
            sender_name: 'Nguyen Van Google Real',
            sender_nickname: 'Bé Sóc',
            sender_avatar: 'https://lh3.googleusercontent.com/canary-pic',
            pet_species: 'cowdi',
            message: 'Cùng học nha',
            claimed_by: null,
            claimed_at: null,
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            created_at: new Date().toISOString(),
            creator_ip: '203.0.113.88',
            creator_device_hash: 'canary_device_hash_secret_64',
          }]];
        }
        if (/FROM invites WHERE sender_id = \? ORDER BY/i.test(q)) {
          return [[{
            code: 'SAFE2345',
            pet_species: 'cowdi',
            message: 'Cùng học nha',
            claimed: 0,
            claimed_at: null,
            rewarded_sender: 0,
            rewarded_at: null,
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            created_at: new Date().toISOString(),
          }]];
        }
        if (/SELECT friend_code, nickname FROM users/i.test(q)) {
          return [[{ friend_code: 'MYCD2345', nickname: 'Mình' }]];
        }
        if (/SELECT f\.user_low, f\.user_high, f\.status/i.test(q)) {
          return [[{
            user_low: 1,
            user_high: 2,
            status: 'accepted',
            requested_by: 1,
            blocked_by: null,
            source: 'invite',
            created_at: '2026-11-25',
            accepted_at: '2026-11-25',
            other_id: 2,
            other_nickname: 'Bé Sóc',
            email: 'canary-email@secret.vn',
            display_name: 'Nguyen Van Google Real',
            avatar_url: 'https://lh3.googleusercontent.com/canary-pic',
            pet_data: JSON.stringify({ activePetId: 'cowdi_1', collection: { cowdi_1: { speciesId: 'cowdi', evolution: 2 } } }),
            learner_group: 'intermediate',
            active_path: 'intermediate',
            last_active_date: '2026-11-25',
          }]];
        }
        if (/SELECT status, requested_by, blocked_by, source, accepted_at FROM friendships/i.test(q)) {
          return [[{ status: 'accepted', requested_by: 1, blocked_by: null, source: 'invite', accepted_at: '2026-11-25' }]];
        }
        if (/SELECT u\.id, u\.nickname, up\.pet_data, up\.learner_group, up\.active_path, up\.last_active_date/i.test(q)) {
          return [[{
            id: 2,
            nickname: 'Bé Sóc',
            email: 'canary-email@secret.vn',
            display_name: 'Nguyen Van Google Real',
            avatar_url: 'https://lh3.googleusercontent.com/canary-pic',
            pet_data: JSON.stringify({ activePetId: 'cowdi_1', collection: { cowdi_1: { speciesId: 'cowdi', evolution: 2, cosmetics: { room: 'room_forest' } } } }),
            learner_group: 'intermediate',
            active_path: 'intermediate',
            last_active_date: '2026-11-25',
          }]];
        }
        if (/SELECT IF\(user_low = \?, user_high, user_low\) AS friend_id/i.test(q)) {
          return [[{ friend_id: 2 }]];
        }
        if (/SELECT u\.id, u\.nickname, up\.pet_data, up\.learner_group, up\.active_path, up\.completed_lessons, up\.checkpoint_scores/i.test(q)) {
          return [[{
            id: 2,
            nickname: 'Bé Sóc',
            email: 'canary-email@secret.vn',
            display_name: 'Nguyen Van Google Real',
            avatar_url: 'https://lh3.googleusercontent.com/canary-pic',
            pet_data: JSON.stringify({ activePetId: 'cowdi_1', collection: { cowdi_1: { speciesId: 'cowdi', evolution: 2 } } }),
            learner_group: 'intermediate',
            active_path: 'intermediate',
            completed_lessons: JSON.stringify(['greetings']),
            checkpoint_scores: JSON.stringify({ 'int-u1': { passed: true, score: 14, total: 15 } }),
          }]];
        }
        return [[]];
      },
    };

    const app = express();
    app.use(express.json());
    const auth = (req, _res, next) => { req.user = { id: 1 }; next(); };
    app.use('/i', createInviteLandingRouter({ db: fakeDb, indexHtmlPath: path.join(repoRoot, 'index.html'), ogDirs: [] }));
    app.use('/api/invites', createInvitesRouter({ db: fakeDb, authMiddleware: auth }));
    app.use('/api/friends', createFriendsRouter({ db: fakeDb, authMiddleware: auth }));

    const server = await new Promise((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const endpoints = [
        '/i/SAFE2345',
        '/api/invites/SAFE2345',
        '/api/invites/mine/list',
        '/api/friends',
        '/api/friends/2/pet',
        '/api/friends/path-progress',
      ];
      for (const ep of endpoints) {
        const res = await fetch(`${base}${ep}`);
        assert.equal(res.status, 200, `${ep} phải trả 200`);
        const body = await res.text();
        assertNoPiiLeak(body, ep);
        if (ep === '/api/friends/path-progress') {
          assert.equal(body.includes('"score"'), false, 'path-progress không được trả điểm số');
        }
      }
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('NFR-06: Đủ 5 sự kiện phân tích được ghi vào bảng app_events', () => {
    const combinedServer = [
      'server/routes/invites.js',
      'server/utils/invite-rewards.js',
      'server/utils/friends-manager.js',
      'server/routes/friends.js',
    ]
      .map((rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8'))
      .join('\n');

    for (const ev of ['invite_shared', 'invite_claimed', 'invite_activated', 'friend_added', 'path_friend_passed']) {
      assert.ok(combinedServer.includes(`'${ev}'`), `Thiếu ghi sự kiện NFR-06: ${ev}`);
    }
  });

  it('C-04: Không dùng window.alert/confirm/prompt trong toàn bộ giao diện phân hệ Bạn bè & Mời bạn', () => {
    const uiFiles = [
      'src/pages/FriendsPage.jsx',
      'src/pages/FriendPetPage.jsx',
      'src/pages/InvitePage.jsx',
      'src/features/invite/InviteSheet.jsx',
      'src/features/invite/InviteRewardNotice.jsx',
      'src/features/friends/useFriendPositions.js',
      'src/pages/LearningPathPage.jsx',
    ];
    for (const rel of uiFiles) {
      const src = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
      assert.equal(/\b(?:window\.)?(?:alert|confirm|prompt)\s*\(/.test(src), false, `${rel} không được dùng alert/confirm/prompt`);
    }
  });
});
