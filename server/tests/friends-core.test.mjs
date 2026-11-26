// ============================================================
// Cowdi English — Tests Bước 4: Hệ thống Bạn bè (AT-06, AT-07, BR-07, BR-08)
// ============================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

import { createInvitesRouter } from '../routes/invites.js';
import { createFriendsRouter } from '../routes/friends.js';
import { createHourlyRateLimiter } from '../utils/friends-manager.js';

function createFriendsFakeDb({ users = [], progress = [], invites = [], friendships = [] } = {}) {
  const state = {
    users: users.map((u) => ({ friend_code: null, nickname: null, ...u })),
    progress: progress.map((p) => ({ ...p })),
    invites: invites.map((i) => ({ claimed_by: null, claimed_at: null, flagged: 0, rewarded_sender: 0, ...i })),
    friendships: friendships.map((f) => ({ blocked_by: null, accepted_at: null, created_at: '2026-11-25', ...f })),
    reports: [],
    events: [],
  };

  return {
    state,
    async execute(sql, params = []) {
      const q = sql.replace(/\s+/g, ' ').trim();

      // invites claim
      if (/^SELECT sender_id, claimed_by, expires_at, created_at, creator_ip, creator_device_hash FROM invites WHERE code = \?/i.test(q)) {
        const row = state.invites.find((i) => i.code === params[0]);
        return [row ? [row] : []];
      }
      if (/^SELECT code FROM invites WHERE claimed_by = \? LIMIT 1/i.test(q)) {
        const row = state.invites.find((i) => i.claimed_by === params[0]);
        return [row ? [row] : []];
      }
      if (/^SELECT lessons_completed, completed_lessons FROM user_progress WHERE user_id = \?/i.test(q)) {
        const row = state.progress.find((p) => p.user_id === params[0]);
        return [row ? [row] : []];
      }
      if (/^UPDATE invites SET claimed_by = \?, claimed_at = NOW\(\), claim_ip = \?, claim_device_hash = \?, flagged = \? WHERE code = \? AND claimed_by IS NULL/i.test(q)) {
        const [uid, ip, dev, flagged, code] = params;
        const row = state.invites.find((i) => i.code === code && i.claimed_by == null);
        if (!row) return [{ affectedRows: 0 }];
        row.claimed_by = uid;
        row.claimed_at = new Date().toISOString();
        row.claim_ip = ip;
        row.claim_device_hash = dev;
        row.flagged = flagged;
        return [{ affectedRows: 1 }];
      }

      // users & friend_code & email lookup
      if (/^SELECT friend_code, nickname, display_name FROM users WHERE id = \?/i.test(q)) {
        const u = state.users.find((x) => x.id === params[0]);
        return [u ? [{ friend_code: u.friend_code, nickname: u.nickname, display_name: u.display_name || '' }] : []];
      }
      if (/^SELECT 1 AS x FROM users WHERE friend_code = \?/i.test(q)) {
        const exists = state.users.some((x) => x.friend_code === params[0]);
        return [exists ? [{ x: 1 }] : []];
      }
      if (/^UPDATE users SET friend_code = \? WHERE id = \? AND friend_code IS NULL/i.test(q)) {
        const [code, uid] = params;
        const u = state.users.find((x) => x.id === uid && !x.friend_code);
        if (u) u.friend_code = code;
        return [{ affectedRows: u ? 1 : 0 }];
      }
      if (/^SELECT id, nickname, display_name FROM users WHERE friend_code = \?/i.test(q)) {
        const u = state.users.find((x) => x.friend_code === params[0]);
        return [u ? [{ id: u.id, nickname: u.nickname, display_name: u.display_name || '' }] : []];
      }
      if (/^SELECT id, nickname, display_name FROM users WHERE LOWER\(email\) = \?/i.test(q)) {
        const email = String(params[0] || '').toLowerCase();
        const u = state.users.find((x) => String(x.email || '').toLowerCase() === email);
        return [u ? [{ id: u.id, nickname: u.nickname, display_name: u.display_name || '' }] : []];
      }
      if (/^SELECT u\.id, u\.nickname, u\.display_name, u\.friend_code/i.test(q)) {
        const isEmail = q.includes('LOWER(u.email)');
        const u = isEmail
          ? state.users.find((x) => String(x.email || '').toLowerCase() === String(params[0] || '').toLowerCase())
          : state.users.find((x) => x.friend_code === params[0]);
        if (!u) return [[]];
        const p = state.progress.find((x) => x.user_id === u.id) || {};
        return [[{
          id: u.id,
          nickname: u.nickname,
          display_name: u.display_name || '',
          friend_code: u.friend_code,
          progress_nickname: p.nickname || null,
          pet_data: p.pet_data || null,
          learner_group: p.learner_group || null,
          active_path: p.active_path || null,
        }]];
      }

      // friendships
      if (/^SELECT status FROM friendships WHERE user_low = \? AND user_high = \?/i.test(q) ||
          /^SELECT status, requested_by, blocked_by FROM friendships WHERE user_low = \? AND user_high = \?/i.test(q) ||
          /^SELECT status, requested_by, blocked_by, source, accepted_at FROM friendships WHERE user_low = \? AND user_high = \?/i.test(q) ||
          /^SELECT status, requested_by, source FROM friendships WHERE user_low = \? AND user_high = \?/i.test(q) ||
          /^SELECT status, blocked_by FROM friendships WHERE user_low = \? AND user_high = \?/i.test(q)) {
        const [low, high] = params;
        const row = state.friendships.find((f) => f.user_low === low && f.user_high === high);
        return [row ? [row] : []];
      }
      if (/^SELECT COUNT\(\*\) AS n FROM friendships WHERE status = 'accepted'/i.test(q)) {
        const uid = params[0];
        const n = state.friendships.filter((f) => f.status === 'accepted' && (f.user_low === uid || f.user_high === uid)).length;
        return [[{ n }]];
      }
      if (/^SELECT COUNT\(\*\) AS n FROM friendships WHERE status = 'pending' AND requested_by = \?/i.test(q)) {
        const uid = params[0];
        const n = state.friendships.filter((f) => f.status === 'pending' && f.requested_by === uid).length;
        return [[{ n }]];
      }
      if (/^INSERT INTO friendships \(user_low, user_high, status, requested_by, source, accepted_at\)/i.test(q)) {
        const [user_low, user_high, requested_by] = params;
        state.friendships.push({ user_low, user_high, status: 'accepted', requested_by, blocked_by: null, source: 'invite', accepted_at: '2026-11-25', created_at: '2026-11-25' });
        return [{ affectedRows: 1 }];
      }
      if (/^INSERT INTO friendships \(user_low, user_high, status, requested_by, source\)/i.test(q)) {
        const [user_low, user_high, requested_by, source] = params;
        state.friendships.push({ user_low, user_high, status: 'pending', requested_by, blocked_by: null, source, accepted_at: null, created_at: '2026-11-25' });
        return [{ affectedRows: 1 }];
      }
      if (/^INSERT INTO friendships \(user_low, user_high, status, requested_by, blocked_by, source\)/i.test(q)) {
        const [user_low, user_high, requested_by, blocked_by] = params;
        state.friendships.push({ user_low, user_high, status: 'blocked', requested_by, blocked_by, source: 'code', accepted_at: null, created_at: '2026-11-25' });
        return [{ affectedRows: 1 }];
      }
      if (/^UPDATE friendships SET status = 'accepted'/i.test(q)) {
        const [low, high] = params;
        const row = state.friendships.find((f) => f.user_low === low && f.user_high === high);
        if (!row) return [{ affectedRows: 0 }];
        row.status = 'accepted';
        row.accepted_at = '2026-11-25';
        return [{ affectedRows: 1 }];
      }
      if (/^UPDATE friendships SET status = 'blocked', blocked_by = \?, accepted_at = NULL/i.test(q)) {
        const [blockedBy, low, high] = params;
        const row = state.friendships.find((f) => f.user_low === low && f.user_high === high);
        if (!row) return [{ affectedRows: 0 }];
        row.status = 'blocked';
        row.blocked_by = blockedBy;
        row.accepted_at = null;
        return [{ affectedRows: 1 }];
      }
      if (/^DELETE FROM friendships WHERE user_low = \? AND user_high = \? AND status = 'pending'/i.test(q)) {
        const [low, high] = params;
        const idx = state.friendships.findIndex((f) => f.user_low === low && f.user_high === high && f.status === 'pending');
        if (idx < 0) return [{ affectedRows: 0 }];
        state.friendships.splice(idx, 1);
        return [{ affectedRows: 1 }];
      }
      if (/^DELETE FROM friendships WHERE user_low = \? AND user_high = \? AND status = 'accepted'/i.test(q)) {
        const [low, high] = params;
        const idx = state.friendships.findIndex((f) => f.user_low === low && f.user_high === high && f.status === 'accepted');
        if (idx < 0) return [{ affectedRows: 0 }];
        state.friendships.splice(idx, 1);
        return [{ affectedRows: 1 }];
      }
      if (/^DELETE FROM friendships WHERE user_low = \? AND user_high = \? AND status = 'blocked' AND blocked_by = \?/i.test(q)) {
        const [low, high, by] = params;
        const idx = state.friendships.findIndex((f) => f.user_low === low && f.user_high === high && f.status === 'blocked' && f.blocked_by === by);
        if (idx < 0) return [{ affectedRows: 0 }];
        state.friendships.splice(idx, 1);
        return [{ affectedRows: 1 }];
      }

      // Overview join query
      if (/^SELECT f\.user_low, f\.user_high, f\.status/i.test(q)) {
        const uid = params[0];
        const rows = state.friendships
          .filter((f) => f.user_low === uid || f.user_high === uid)
          .map((f) => {
            const otherId = f.user_low === uid ? f.user_high : f.user_low;
            const otherUser = state.users.find((u) => u.id === otherId) || {};
            const otherProg = state.progress.find((p) => p.user_id === otherId) || {};
            return {
              ...f,
              other_id: otherId,
              other_nickname: otherUser.nickname,
              other_display_name: otherUser.display_name || '',
              other_progress_nickname: otherProg.nickname || null,
              pet_data: otherProg.pet_data || null,
              learner_group: otherProg.learner_group || null,
              active_path: otherProg.active_path || null,
              last_active_date: otherProg.last_active_date || null,
            };
          });
        return [rows];
      }

      if (/^INSERT INTO friend_reports/i.test(q)) {
        const [reporter_id, reported_id, reason] = params;
        state.reports.push({ id: state.reports.length + 1, reporter_id, reported_id, reason, handled: 0 });
        return [{ affectedRows: 1 }];
      }

      if (/^INSERT INTO app_events/i.test(q)) {
        state.events.push({ user_id: params[0], sql: q, props: params[1] });
        return [{ affectedRows: 1 }];
      }

      throw new Error(`Unhandled SQL in friends fake DB: ${q}`);
    },
  };
}

function fakeAuth(req, _res, next) {
  req.user = { id: Number(req.headers['x-test-uid'] || 1) };
  next();
}

async function withApp(db, rateLimiter, fn) {
  const app = express();
  app.use(express.json());
  app.use('/api/invites', createInvitesRouter({ db, authMiddleware: fakeAuth }));
  app.use('/api/friends', createFriendsRouter({ db, authMiddleware: fakeAuth, rateLimiter }));
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

describe('Bước 4 — Hệ thống Bạn bè (AT-06, AT-07, BR-07, NFR-03)', () => {
  it('AT-06: Nhận thiệp thành công (kể cả thiệp flagged cùng IP) -> tự động trở thành bạn accepted', async () => {
    const db = createFriendsFakeDb({
      users: [
        { id: 1, nickname: 'Mai', email: 'mai@secret.com', display_name: 'Nguyen Mai', avatar_url: 'https://lh3.google/mai.jpg' },
        { id: 2, nickname: 'Nam', email: 'nam@secret.com', display_name: 'Tran Nam', avatar_url: 'https://lh3.google/nam.jpg' },
      ],
      invites: [{
        code: 'INV23456',
        sender_id: 1,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
        creator_ip: '127.0.0.1',
        creator_device_hash: 'same-hash',
      }],
    });

    await withApp(db, createHourlyRateLimiter(), async (base) => {
      const claimRes = await fetch(`${base}/api/invites/INV23456/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-uid': '2' },
        body: JSON.stringify({}),
      });
      assert.equal(claimRes.status, 200);
      const claimJson = await claimRes.json();
      assert.equal(claimJson.ok, true);
      assert.equal(claimJson.flagged, true, 'Cùng IP 127.0.0.1 trong 24h -> flagged');

      // Kiểm tra danh sách bạn của user 1: đã có user 2 ở trạng thái accepted và KHÔNG rò email/display_name/avatar_url
      const listRes = await fetch(`${base}/api/friends`, { headers: { 'x-test-uid': '1' } });
      const listJson = await listRes.json();
      assert.equal(listJson.friends.length, 1);
      assert.equal(listJson.friends[0].userId, 2);
      assert.equal(listJson.friends[0].nickname, 'Nam');
      assert.equal(listJson.friends[0].source, 'invite');
      const rawText = JSON.stringify(listJson);
      assert.equal(rawText.includes('nam@secret.com'), false);
      assert.equal(rawText.includes('Tran Nam'), false);
      assert.equal(rawText.includes('lh3.google'), false);
    });
  });

  it('AT-07: Kết bạn bằng mã, tự chấp nhận khi 2 bên cùng gửi, chặn -> cấm gửi lời mời, báo cáo & rate limit', async () => {
    const db = createFriendsFakeDb({
      users: [
        { id: 1, nickname: 'Lan', friend_code: 'LAN23456' },
        { id: 2, nickname: 'Hùng', friend_code: 'HUNG2345' },
        { id: 3, nickname: 'Khoa', friend_code: 'KHOA2345' },
      ],
    });

    await withApp(db, createHourlyRateLimiter(20), async (base) => {
      // 1 gửi lời mời cho 2 bằng mã -> pending
      const r1 = await fetch(`${base}/api/friends/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-uid': '1' },
        body: JSON.stringify({ code: 'HUNG2345' }),
      });
      assert.equal(r1.status, 200);
      assert.equal((await r1.json()).status, 'pending');

      // 2 gửi ngược lại cho 1 -> tự accepted (FR-FRD-03)
      const r2 = await fetch(`${base}/api/friends/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-uid': '2' },
        body: JSON.stringify({ code: 'LAN23456' }),
      });
      assert.equal(r2.status, 200);
      const j2 = await r2.json();
      assert.equal(j2.status, 'accepted');
      assert.equal(j2.autoAccepted, true);

      // 1 chặn 2 -> 2 không gửi lời mời được (403) và biến mất khỏi danh sách bạn
      const blk = await fetch(`${base}/api/friends/2/block`, {
        method: 'POST',
        headers: { 'x-test-uid': '1' },
      });
      assert.equal(blk.status, 200);

      const blockedReq = await fetch(`${base}/api/friends/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-uid': '2' },
        body: JSON.stringify({ code: 'LAN23456' }),
      });
      assert.equal(blockedReq.status, 403);

      // 2 không thể tự bỏ chặn khi 1 là người chặn
      const wrongUnblock = await fetch(`${base}/api/friends/1/block`, {
        method: 'DELETE',
        headers: { 'x-test-uid': '2' },
      });
      assert.equal(wrongUnblock.status, 404);

      // 1 báo cáo 2 -> lưu vào friend_reports
      const rep = await fetch(`${base}/api/friends/2/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-uid': '1' },
        body: JSON.stringify({ reason: 'spam' }),
      });
      assert.equal(rep.status, 200);
      assert.equal(db.state.reports.length, 1);

      // 1 bỏ chặn 2 -> thành công
      const unblk = await fetch(`${base}/api/friends/2/block`, {
        method: 'DELETE',
        headers: { 'x-test-uid': '1' },
      });
      assert.equal(unblk.status, 200);
    });

    // Tìm kiếm chính xác bằng email và gửi lời mời kết bạn bằng email (không rò email trong response)
    const dbEmail = createFriendsFakeDb({
      users: [
        { id: 1, display_name: 'Minh Lan', email: 'lan@cowdi.vn', friend_code: 'LAN23456' },
        { id: 2, display_name: 'Hùng Nguyễn', email: 'hung@cowdi.vn', friend_code: 'HUNG2345' },
      ],
    });
    await withApp(dbEmail, createHourlyRateLimiter(20), async (base) => {
      const lookRes = await fetch(`${base}/api/friends/lookup?q=HUNG%40cowdi.vn`, {
        headers: { 'x-test-uid': '1' },
      });
      assert.equal(lookRes.status, 200);
      const lookJson = await lookRes.json();
      assert.equal(lookJson.found, true);
      assert.equal(lookJson.user.nickname, 'Hùng Nguyễn');
      assert.equal(JSON.stringify(lookJson).includes('hung@cowdi.vn'), false, 'Không trả lại email');

      const reqRes = await fetch(`${base}/api/friends/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-uid': '1' },
        body: JSON.stringify({ query: 'hung@cowdi.vn' }),
      });
      assert.equal(reqRes.status, 200);
      assert.equal((await reqRes.json()).status, 'pending');
    });

    // Kiểm tra rate limit (giả lập giới hạn 2 lời mời/giờ)
    const tightLimiter = createHourlyRateLimiter(2);
    await withApp(db, tightLimiter, async (base) => {
      await fetch(`${base}/api/friends/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-uid': '3' },
        body: JSON.stringify({ code: 'NOTEXIST' }),
      });
      await fetch(`${base}/api/friends/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-uid': '3' },
        body: JSON.stringify({ code: 'NOTEXIST' }),
      });
      const third = await fetch(`${base}/api/friends/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-uid': '3' },
        body: JSON.stringify({ code: 'LAN23456' }),
      });
      assert.equal(third.status, 429);
    });
  });
});
