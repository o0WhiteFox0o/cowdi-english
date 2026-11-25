// ============================================================
// Cowdi English — Tests Bước 3: Thưởng mời bạn & Chống gian lận
// Bao phủ AT-02, AT-03, AT-04, AT-05, FR-RWD-01..07, FR-FRD-05.
// ============================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  computeDeviceHash,
  isSameDeviceOrIpWithin24h,
  processInviteActivationReward,
  releaseDeferredTicketsForMonth,
  getInviteStats,
} from '../utils/invite-rewards.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

/**
 * In-memory fake DB mô phỏng đầy đủ bảng:
 * users, invites, user_lesson_first_completions, wallet_ledger,
 * invite_ticket_queue, invite_notifications, owned_cosmetics, app_events
 */
function createRewardsFakeDb({ users = [], invites = [] } = {}) {
  const state = {
    users: users.map((u) => ({ ...u })),
    invites: invites.map((i) => ({ rewarded_sender: 0, rewarded_at: null, flagged: 0, ...i })),
    firstCompletions: [], // { user_id, lesson_id, completed_date }
    ledger: [],           // { id, user_id, currency, amount, reason, ref_id, created_at }
    ticketQueue: [],      // { id, user_id, milestone, ticket_index, granted_month, granted_at }
    notifications: [],    // { id, user_id, kind, ref_id, payload, seen }
    cosmetics: [],        // { user_id, cosmetic_id, category, acquired_from }
    events: [],           // { user_id, name, props }
  };

  let nextId = 1;

  const conn = {
    async beginTransaction() {},
    async commit() {},
    async rollback() {},
    release() {},
    async execute(sql, params = []) {
      const q = sql.replace(/\s+/g, ' ').trim();

      if (/^INSERT IGNORE INTO user_lesson_first_completions/i.test(q)) {
        const [user_id, lesson_id, completed_date] = params;
        const exists = state.firstCompletions.some((r) => r.user_id === user_id && r.lesson_id === lesson_id);
        if (!exists) {
          state.firstCompletions.push({ user_id, lesson_id, completed_date });
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }

      if (/^SELECT code, sender_id, claimed_at, rewarded_sender, flagged FROM invites WHERE claimed_by = \? AND rewarded_sender = 0/i.test(q)) {
        const [uid] = params;
        const row = state.invites.find((i) => i.claimed_by === uid && Number(i.rewarded_sender) === 0);
        return [row ? [row] : []];
      }

      if (/^SELECT completed_date FROM user_lesson_first_completions WHERE user_id = \?/i.test(q)) {
        const [uid] = params;
        return [state.firstCompletions.filter((r) => r.user_id === uid)];
      }

      if (/^UPDATE invites SET rewarded_sender = 1, rewarded_at = NOW\(\) WHERE code = \? AND rewarded_sender = 0/i.test(q)) {
        const [code] = params;
        const row = state.invites.find((i) => i.code === code && Number(i.rewarded_sender) === 0);
        if (!row) return [{ affectedRows: 0 }];
        row.rewarded_sender = 1;
        row.rewarded_at = new Date().toISOString();
        return [{ affectedRows: 1 }];
      }

      if (/^SELECT nickname FROM users WHERE id = \?/i.test(q)) {
        const [uid] = params;
        const u = state.users.find((x) => x.id === uid);
        return [u ? [{ nickname: u.nickname || null }] : []];
      }

      if (/^SELECT COUNT\(\*\) AS n FROM wallet_ledger WHERE user_id = \? AND currency = 'gem' AND reason = 'invite_activated'/i.test(q)) {
        const [uid, monthStr] = params;
        const n = state.ledger.filter(
          (r) => r.user_id === uid && r.currency === 'gem' && r.reason === 'invite_activated' && r.month === monthStr
        ).length;
        return [[{ n }]];
      }

      if (/^INSERT IGNORE INTO wallet_ledger/i.test(q)) {
        let user_id, currency, amount, reason, ref_id;
        if (q.includes("'gem', ?, 'invite_activated'")) {
          [user_id, amount, ref_id] = params;
          currency = 'gem'; reason = 'invite_activated';
        } else if (q.includes("'milk', ?, 'invite_welcome'")) {
          [user_id, amount, ref_id] = params;
          currency = 'milk'; reason = 'invite_welcome';
        } else if (q.includes("'gacha_ticket', 1, 'invite_milestone'")) {
          [user_id, ref_id] = params;
          currency = 'gacha_ticket'; amount = 1; reason = 'invite_milestone';
        } else {
          throw new Error(`Unhandled wallet_ledger SQL: ${q}`);
        }
        const dup = state.ledger.some(
          (r) => r.user_id === user_id && r.currency === currency && r.reason === reason && r.ref_id === ref_id
        );
        if (dup) return [{ affectedRows: 0 }];
        state.ledger.push({
          id: nextId++,
          user_id,
          currency,
          amount,
          reason,
          ref_id,
          month: state.currentMonthHint || '2026-11',
        });
        return [{ affectedRows: 1 }];
      }

      if (/^INSERT IGNORE INTO invite_notifications/i.test(q)) {
        let user_id, kind, ref_id, payload;
        if (q.includes("'invite_activated'")) {
          [user_id, ref_id, payload] = params; kind = 'invite_activated';
        } else if (q.includes("'invite_welcome'")) {
          [user_id, ref_id, payload] = params; kind = 'invite_welcome';
        } else {
          [user_id, ref_id, payload] = params; kind = 'invite_milestone';
        }
        const dup = state.notifications.some((n) => n.user_id === user_id && n.kind === kind && n.ref_id === ref_id);
        if (dup) return [{ affectedRows: 0 }];
        state.notifications.push({ id: nextId++, user_id, kind, ref_id, payload, seen: 0 });
        return [{ affectedRows: 1 }];
      }

      if (/^SELECT COUNT\(\*\) AS n FROM invites WHERE sender_id = \? AND rewarded_sender = 1/i.test(q)) {
        const [uid] = params;
        const n = state.invites.filter((i) => i.sender_id === uid && Number(i.rewarded_sender) === 1).length;
        return [[{ n }]];
      }

      if (/^SELECT DISTINCT milestone FROM invite_ticket_queue WHERE user_id = \?/i.test(q)) {
        const [uid] = params;
        const set = new Set(state.ticketQueue.filter((r) => r.user_id === uid).map((r) => r.milestone));
        return [[...set].map((milestone) => ({ milestone }))];
      }

      if (/^INSERT IGNORE INTO invite_ticket_queue/i.test(q)) {
        const [user_id, milestone, ticket_index] = params;
        const dup = state.ticketQueue.some(
          (r) => r.user_id === user_id && r.milestone === milestone && r.ticket_index === ticket_index
        );
        if (dup) return [{ affectedRows: 0 }];
        state.ticketQueue.push({
          id: nextId++,
          user_id,
          milestone,
          ticket_index,
          granted_month: null,
          granted_at: null,
        });
        return [{ affectedRows: 1 }];
      }

      if (/^INSERT IGNORE INTO owned_cosmetics/i.test(q)) {
        const [user_id, cosmetic_id] = params;
        const dup = state.cosmetics.some((c) => c.user_id === user_id && c.cosmetic_id === cosmetic_id);
        if (dup) return [{ affectedRows: 0 }];
        state.cosmetics.push({ user_id, cosmetic_id, category: 'title', acquired_from: 'invite_milestone' });
        return [{ affectedRows: 1 }];
      }

      if (/^SELECT COUNT\(\*\) AS n FROM invite_ticket_queue WHERE user_id = \? AND granted_month = \?/i.test(q)) {
        const [uid, monthStr] = params;
        const n = state.ticketQueue.filter((r) => r.user_id === uid && r.granted_month === monthStr).length;
        return [[{ n }]];
      }

      if (/^SELECT id, milestone, ticket_index FROM invite_ticket_queue WHERE user_id = \? AND granted_month IS NULL/i.test(q)) {
        const [uid] = params;
        const rows = state.ticketQueue
          .filter((r) => r.user_id === uid && r.granted_month === null)
          .sort((a, b) => a.milestone - b.milestone || a.ticket_index - b.ticket_index);
        return [rows];
      }

      if (/^UPDATE invite_ticket_queue SET granted_month = \?, granted_at = NOW\(\) WHERE id = \? AND granted_month IS NULL/i.test(q)) {
        const [monthStr, id] = params;
        const row = state.ticketQueue.find((r) => r.id === id && r.granted_month === null);
        if (!row) return [{ affectedRows: 0 }];
        row.granted_month = monthStr;
        row.granted_at = new Date().toISOString();
        return [{ affectedRows: 1 }];
      }

      if (/^INSERT INTO app_events/i.test(q)) {
        const [user_id, props] = params;
        state.events.push({ user_id, name: 'invite_activated', props });
        return [{ affectedRows: 1 }];
      }

      if (/^SELECT COUNT\(\*\) AS sent_count/i.test(q)) {
        const [uid] = params;
        const mine = state.invites.filter((i) => i.sender_id === uid);
        return [[{
          sent_count: mine.length,
          claimed_count: mine.filter((i) => i.claimed_by != null).length,
          activated_count: mine.filter((i) => Number(i.rewarded_sender) === 1).length,
        }]];
      }

      if (/^SELECT COALESCE\(SUM\(amount\), 0\) AS total FROM wallet_ledger WHERE user_id = \? AND currency = 'gacha_ticket'/i.test(q)) {
        const [uid] = params;
        const total = state.ledger
          .filter((r) => r.user_id === uid && r.currency === 'gacha_ticket')
          .reduce((s, r) => s + r.amount, 0);
        return [[{ total }]];
      }

      if (/^SELECT cosmetic_id FROM owned_cosmetics WHERE user_id = \? AND category = 'title'/i.test(q)) {
        const [uid] = params;
        return [state.cosmetics.filter((c) => c.user_id === uid && c.category === 'title')];
      }

      throw new Error(`Unhandled SQL in rewards fake DB: ${q}`);
    },
  };

  return {
    state,
    execute: conn.execute,
    async getConnection() { return conn; },
  };
}

describe('Bước 3 — Thưởng mời bạn, chống gian lận & mốc vé gacha (AT-02..AT-05)', () => {
  it('AT-02: 3 bài mới trong 1 ngày -> chưa thưởng; sang ngày khác học thêm -> người gửi +3 Gem, người nhận +500 Sữa', async () => {
    const db = createRewardsFakeDb({
      users: [{ id: 1, nickname: 'Lan' }, { id: 2, nickname: 'Minh' }],
      invites: [{ code: 'INV00001', sender_id: 1, claimed_by: 2, claimed_at: '2026-11-01T08:00:00+07:00', flagged: 0 }],
    });

    // Ngày 1: học liền 3 bài mới -> chưa đạt BR-01 (>=2 ngày)
    const r1 = await processInviteActivationReward(2, {
      newlyCompletedIds: ['greetings', 'family', 'colors'],
      now: '2026-11-01T20:00:00+07:00',
      db,
    });
    assert.equal(r1.activated, false);
    assert.equal(db.state.ledger.length, 0);

    // Ngày 2: học thêm bài thứ 4 -> đạt BR-01 -> cộng +3 Gem cho người gửi, +500 Sữa cho người nhận
    const r2 = await processInviteActivationReward(2, {
      newlyCompletedIds: ['numbers'],
      now: '2026-11-02T09:00:00+07:00',
      db,
    });
    assert.equal(r2.activated, true);
    assert.equal(r2.senderGemGranted, 3);
    assert.equal(r2.receiverMilkGranted, 500);
    assert.equal(db.state.ledger.filter((l) => l.user_id === 1 && l.currency === 'gem')[0].amount, 3);
    assert.equal(db.state.ledger.filter((l) => l.user_id === 2 && l.currency === 'milk')[0].amount, 500);
    assert.equal(db.state.notifications.length, 2);

    // Gọi lại lần nữa -> idempotent, không cộng trùng
    const r3 = await processInviteActivationReward(2, {
      newlyCompletedIds: ['school'],
      now: '2026-11-03T09:00:00+07:00',
      db,
    });
    assert.equal(r3.activated, false);
    assert.equal(db.state.ledger.length, 2);
  });

  it('AT-03: Nhận thiệp trùng IP hoặc thiết bị trong 24h -> flagged = 1, không thưởng ai', async () => {
    const devHash = computeDeviceHash('Mozilla/5.0', 'dev-abc-123');
    assert.equal(
      isSameDeviceOrIpWithin24h({
        creatorIp: '203.0.113.10',
        creatorDeviceHash: 'hashA',
        createdAt: '2026-11-01T08:00:00+07:00',
        claimIp: '203.0.113.10',
        claimDeviceHash: 'hashB',
        now: '2026-11-01T12:00:00+07:00',
      }),
      true
    );
    assert.equal(
      isSameDeviceOrIpWithin24h({
        creatorIp: '1.1.1.1',
        creatorDeviceHash: devHash,
        createdAt: '2026-11-01T08:00:00+07:00',
        claimIp: '2.2.2.2',
        claimDeviceHash: devHash,
        now: '2026-11-01T12:00:00+07:00',
      }),
      true
    );

    const db = createRewardsFakeDb({
      users: [{ id: 1, nickname: 'Lan' }, { id: 2, nickname: 'Clone' }],
      invites: [{ code: 'INVFLAG1', sender_id: 1, claimed_by: 2, claimed_at: '2026-11-01T08:00:00+07:00', flagged: 1 }],
    });

    await processInviteActivationReward(2, {
      newlyCompletedIds: ['greetings', 'family'],
      now: '2026-11-01T09:00:00+07:00',
      db,
    });
    const res = await processInviteActivationReward(2, {
      newlyCompletedIds: ['colors'],
      now: '2026-11-02T09:00:00+07:00',
      db,
    });
    assert.equal(res.activated, false);
    assert.equal(res.reason, 'flagged');
    assert.equal(db.state.ledger.length, 0);
  });

  it('AT-04: Người gửi đạt mốc 3 bạn học thật -> +1 vé gacha & danh hiệu "Người dẫn đường" đúng 1 lần', async () => {
    const db = createRewardsFakeDb({
      users: [{ id: 1, nickname: 'Lan' }, { id: 4, nickname: 'Hoa' }],
      invites: [
        { code: 'PAST0001', sender_id: 1, claimed_by: 2, claimed_at: '2026-11-01T08:00:00+07:00', rewarded_sender: 1 },
        { code: 'PAST0002', sender_id: 1, claimed_by: 3, claimed_at: '2026-11-01T08:00:00+07:00', rewarded_sender: 1 },
        { code: 'CUR00003', sender_id: 1, claimed_by: 4, claimed_at: '2026-11-01T08:00:00+07:00', rewarded_sender: 0 },
      ],
    });

    await processInviteActivationReward(4, { newlyCompletedIds: ['greetings', 'family'], now: '2026-11-01T10:00:00+07:00', db });
    const res = await processInviteActivationReward(4, { newlyCompletedIds: ['colors'], now: '2026-11-02T10:00:00+07:00', db });

    assert.equal(res.activated, true);
    assert.equal(res.totalActivated, 3);
    assert.equal(db.state.ledger.filter((l) => l.user_id === 1 && l.currency === 'gacha_ticket').length, 1);
    assert.ok(db.state.cosmetics.some((c) => c.user_id === 1 && c.cosmetic_id === 'title_invite_guide'));

    // Kiểm tra stats & chạy lại release -> không cộng thêm vé
    const stats = await getInviteStats(1, '2026-11-02T12:00:00+07:00', db);
    assert.equal(stats.activatedCount, 3);
    assert.equal(stats.totalGachaTickets, 1);
    assert.equal(stats.ticketsGrantedThisMonth, 1);
    assert.equal(stats.nextMilestone.count, 5);
  });

  it('AT-05: 4 vé mốc trong cùng tháng -> nhận 3 vé tháng này, vé thứ 4 tự cấp khi sang tháng sau', async () => {
    // Giả lập người gửi đạt tới mốc 10 trong cùng tháng 2026-11 (mốc 3: +1, mốc 5: +1, mốc 10: +2 -> tổng 4 vé)
    const pastInvites = Array.from({ length: 9 }, (_, i) => ({
      code: `P000000${i + 1}`,
      sender_id: 1,
      claimed_by: 100 + i,
      claimed_at: '2026-11-01T08:00:00+07:00',
      rewarded_sender: 1,
    }));
    pastInvites.push({
      code: 'P0000010',
      sender_id: 1,
      claimed_by: 200,
      claimed_at: '2026-11-01T08:00:00+07:00',
      rewarded_sender: 0,
    });

    const db = createRewardsFakeDb({
      users: [{ id: 1, nickname: 'Lan' }, { id: 200, nickname: 'An' }],
      invites: pastInvites,
    });

    await processInviteActivationReward(200, { newlyCompletedIds: ['greetings', 'family'], now: '2026-11-02T10:00:00+07:00', db });
    const res = await processInviteActivationReward(200, { newlyCompletedIds: ['colors'], now: '2026-11-03T10:00:00+07:00', db });

    assert.equal(res.activated, true);
    assert.equal(res.ticketRelease.grantedNow, 3, 'Chỉ cấp tối đa 3 vé trong tháng 2026-11');
    assert.equal(res.ticketRelease.deferredRemaining, 1, 'Vé thứ 4 dời sang tháng sau');
    assert.equal(db.state.ledger.filter((l) => l.user_id === 1 && l.currency === 'gacha_ticket').length, 3);

    // Sang tháng sau 2026-12: mở app -> tự giải ngân vé thứ 4
    const nextMonthRelease = await releaseDeferredTicketsForMonth(1, '2026-12-01T09:00:00+07:00', db);
    assert.equal(nextMonthRelease.grantedNow, 1);
    assert.equal(nextMonthRelease.deferredRemaining, 0);
    assert.equal(db.state.ledger.filter((l) => l.user_id === 1 && l.currency === 'gacha_ticket').length, 4);
  });

  it('AuthCallbackPage.jsx chuyển hướng về /i/:code khi có cowdi_pending_invite', () => {
    const src = fs.readFileSync(path.join(repoRoot, 'src/pages/AuthCallbackPage.jsx'), 'utf8');
    assert.ok(src.includes('cowdi_pending_invite'), 'Phải kiểm tra cowdi_pending_invite sau đăng nhập OAuth');
    assert.ok(src.includes('/i/'), 'Phải điều hướng về trang thiệp /i/:code');
  });
});
