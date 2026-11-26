// ============================================================
// Cowdi English — Tests Bước 5: Thăm pet & Thách đấu bạn bè (FR-VIS, AT-10)
// ============================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

import { createFriendsRouter } from '../routes/friends.js';
import { computeDuelLeaguePointDelta } from '../utils/friends-manager.js';

function createVisitFakeDb({ users = [], progress = [], friendships = [] } = {}) {
  return {
    async execute(sql, params = []) {
      const q = sql.replace(/\s+/g, ' ').trim();
      if (/^SELECT status, requested_by, blocked_by, source, accepted_at FROM friendships/i.test(q)) {
        const [low, high] = params;
        const row = friendships.find((f) => f.user_low === low && f.user_high === high);
        return [row ? [row] : []];
      }
      if (/^SELECT u\.id, u\.nickname, u\.display_name, up\.nickname AS progress_nickname, up\.pet_data/i.test(q)) {
        const uid = params[0];
        const u = users.find((x) => x.id === uid);
        if (!u) return [[]];
        const p = progress.find((x) => x.user_id === uid) || {};
        return [[{
          id: u.id,
          nickname: u.nickname,
          display_name: u.display_name || '',
          progress_nickname: p.nickname || null,
          pet_data: p.pet_data || null,
          learner_group: p.learner_group || null,
          active_path: p.active_path || null,
          last_active_date: p.last_active_date || null,
        }]];
      }
      throw new Error(`Unhandled SQL in visit fake DB: ${q}`);
    },
  };
}

function fakeAuth(req, _res, next) {
  req.user = { id: Number(req.headers['x-test-uid'] || 1) };
  next();
}

async function withFriendsApp(db, fn) {
  const app = express();
  app.use(express.json());
  app.use('/api/friends', createFriendsRouter({ db, authMiddleware: fakeAuth }));
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

describe('Bước 5 — Thăm pet bạn bè & Thách đấu bạn bè không tính LP (FR-VIS, AT-10)', () => {
  it('FR-VIS-01 & BR-08: Thăm pet bạn bè trả đúng trường tối thiểu, chặn người lạ/bị chặn với 403', async () => {
    const db = createVisitFakeDb({
      users: [
        { id: 1, nickname: 'Mai', email: 'mai@secret.com', display_name: 'Nguyen Mai', avatar_url: 'https://google/mai.png' },
        { id: 2, nickname: 'Nam', email: 'nam@secret.com', display_name: 'Tran Nam', avatar_url: 'https://google/nam.png' },
        { id: 3, nickname: 'Lạ', email: 'stranger@secret.com', display_name: 'Stranger' },
      ],
      progress: [
        {
          user_id: 2,
          learner_group: 'intermediate',
          active_path: 'intermediate',
          last_active_date: '2026-11-25',
          pet_data: JSON.stringify({
            activePetId: 'foxie_1',
            collection: {
              foxie_1: {
                speciesId: 'foxie',
                evolution: 2,
                cosmetics: { room: 'room_forest', effect: 'effect_streak_fire' },
                skills: { listening: 99, speaking: 88 },
              },
            },
          }),
        },
      ],
      friendships: [
        { user_low: 1, user_high: 2, status: 'accepted', requested_by: 1, blocked_by: null, source: 'invite' },
        { user_low: 1, user_high: 3, status: 'blocked', requested_by: 1, blocked_by: 1, source: 'code' },
      ],
    });

    await withFriendsApp(db, async (base) => {
      // Bạn bè accepted -> 200 & chỉ trả đúng trường BR-08
      const okRes = await fetch(`${base}/api/friends/2/pet`, { headers: { 'x-test-uid': '1' } });
      assert.equal(okRes.status, 200);
      const prof = await okRes.json();
      assert.equal(prof.userId, 2);
      assert.equal(prof.nickname, 'Nam');
      assert.equal(prof.petId, 'foxie');
      assert.equal(prof.petEvolution, 2);
      assert.equal(prof.cosmetics.room, 'room_forest');
      assert.equal(prof.learnerGroup, 'intermediate');
      assert.equal(prof.activePath, 'intermediate');

      const raw = JSON.stringify(prof);
      assert.equal(raw.includes('nam@secret.com'), false, 'Không lộ email');
      assert.equal(raw.includes('Tran Nam'), false, 'Không lộ tên thật Google');
      assert.equal(raw.includes('google/nam.png'), false, 'Không lộ ảnh Google');
      assert.equal(raw.includes('skills'), false, 'Không lộ điểm kỹ năng / điểm bài');

      // Người bị chặn -> 403
      const blockedRes = await fetch(`${base}/api/friends/3/pet`, { headers: { 'x-test-uid': '1' } });
      assert.equal(blockedRes.status, 403);

      // Người không phải bạn -> 403
      const strangerRes = await fetch(`${base}/api/friends/99/pet`, { headers: { 'x-test-uid': '1' } });
      assert.equal(strangerRes.status, 403);
    });
  });

  it('AT-10 / BR-06: Trận Duel bạn bè (isFriendDuel=true) luôn trả 0 LP ở mọi pha; trận thường vẫn tính LP', () => {
    // Trận bạn bè: tạo trận, thắng, thua, hoà đều = 0 LP
    assert.equal(computeDuelLeaguePointDelta({ isFriendDuel: true, phase: 'create' }), 0);
    assert.equal(computeDuelLeaguePointDelta({ isFriendDuel: true, phase: 'join', outcome: 'win' }), 0);
    assert.equal(computeDuelLeaguePointDelta({ isFriendDuel: true, phase: 'join', outcome: 'loss' }), 0);
    assert.equal(computeDuelLeaguePointDelta({ isFriendDuel: true, phase: 'join', outcome: 'draw' }), 0);

    // Trận thường: giữ nguyên +5 / +30 / +15 / +5 LP
    assert.equal(computeDuelLeaguePointDelta({ isFriendDuel: false, phase: 'create' }), 5);
    assert.equal(computeDuelLeaguePointDelta({ isFriendDuel: false, phase: 'join', outcome: 'win' }), 30);
    assert.equal(computeDuelLeaguePointDelta({ isFriendDuel: false, phase: 'join', outcome: 'draw' }), 15);
    assert.equal(computeDuelLeaguePointDelta({ isFriendDuel: false, phase: 'join', outcome: 'loss' }), 5);
  });
});
