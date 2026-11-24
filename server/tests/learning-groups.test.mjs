// Kiểm tra GĐ B — Server Wallet, lesson_scores merge, migration SQL & guard-unit-gems
// Theo docs/04-design/SDD-LEARNING-GROUPS-v2.0.md §8 GĐ B
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  grantLessonAndUnitRewards,
  mergeLessonScores,
  sanitizeLearnerGroup,
  sanitizeActivePath,
  getWalletHistory,
} from '../utils/wallet.js';
import { guardUnitGems, LEGACY_UNIT_IDS } from '../scripts/guard-unit-gems.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Fake MySQL DB in-memory cho wallet_ledger + user_progress */
function createWalletFakeDb({ usersProgress = [] } = {}) {
  const ledger = [];
  const uqKeys = new Set();
  const progressByUser = new Map(usersProgress.map((u) => [u.user_id, u]));

  return {
    ledger,
    async execute(sql, params = []) {
      const q = sql.replace(/\s+/g, ' ').trim();

      if (/^SELECT user_id, completed_lessons FROM user_progress$/i.test(q)) {
        return [[...progressByUser.values()]];
      }

      if (/^SELECT total_xp FROM user_progress WHERE user_id = \?$/i.test(q)) {
        const u = progressByUser.get(params[0]);
        return [[{ total_xp: u?.total_xp || 0 }]];
      }

      if (/^SELECT currency, SUM\(amount\) AS total FROM wallet_ledger/i.test(q)) {
        const uid = params[0];
        const sums = {};
        for (const r of ledger) {
          if (r.user_id !== uid) continue;
          sums[r.currency] = (sums[r.currency] || 0) + r.amount;
        }
        return [Object.entries(sums).map(([currency, total]) => ({ currency, total }))];
      }

      if (/^SELECT id, currency, amount, reason, ref_id, created_at FROM wallet_ledger WHERE user_id = \? AND amount <> 0/i.test(q)) {
        const [uid, lim] = params;
        return [ledger.filter((r) => r.user_id === uid && r.amount !== 0).slice(0, lim)];
      }

      // INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id) VALUES (...)
      if (/^INSERT IGNORE INTO wallet_ledger/i.test(q)) {
        let user_id, currency, amount, reason, ref_id;
        if (q.includes("'gem', 1, 'lesson_milestone'")) {
          [user_id, ref_id] = params;
          currency = 'gem'; amount = 1; reason = 'lesson_milestone';
        } else if (q.includes("'stone', 1, 'lesson_milestone'")) {
          [user_id, ref_id] = params;
          currency = 'stone'; amount = 1; reason = 'lesson_milestone';
        } else if (q.includes("'gem', ?, 'unit_complete'")) {
          [user_id, amount, ref_id] = params;
          currency = 'gem'; reason = 'unit_complete';
        } else if (q.includes("'gem', ?, 'unit_perfect'")) {
          [user_id, amount, ref_id] = params;
          currency = 'gem'; reason = 'unit_perfect';
        } else if (q.includes("'gem', 0, ?, ?")) {
          [user_id, reason, ref_id] = params;
          currency = 'gem'; amount = 0;
        } else {
          throw new Error(`Unhandled INSERT SQL in test fake: ${q}`);
        }

        const key = `${user_id}|${currency}|${reason}|${ref_id}`;
        if (uqKeys.has(key)) {
          return [{ affectedRows: 0 }];
        }
        uqKeys.add(key);
        ledger.push({ id: ledger.length + 1, user_id, currency, amount, reason, ref_id, created_at: '2026-11-24' });
        return [{ affectedRows: 1 }];
      }

      throw new Error(`Unhandled SQL in test fake: ${q}`);
    },
  };
}

const INT_U1_LESSONS = ['greetings', 'family', 'colors', 'numbers'];

describe('GĐ B — Server Lộ trình 3 nhóm (wallet, lessonScores, guard-unit-gems, SQL)', () => {
  it('1. Unit xong hết bài nhưng chưa qua kiểm tra -> không cấp unit_complete', async () => {
    const db = createWalletFakeDb({ usersProgress: [{ user_id: 1, total_xp: 500 }] });
    await grantLessonAndUnitRewards(1, INT_U1_LESSONS, {}, {}, db);
    const unitGrants = db.ledger.filter((r) => r.reason === 'unit_complete' || r.reason === 'unit_perfect');
    assert.equal(unitGrants.length, 0);
  });

  it('2. Qua kiểm tra source: placement hoặc legacy -> không cấp Gem; source: checkpoint -> cấp +1 Gem', async () => {
    const db = createWalletFakeDb({ usersProgress: [{ user_id: 2, total_xp: 500 }] });

    await grantLessonAndUnitRewards(
      2,
      INT_U1_LESSONS,
      { 'int-u1': { passed: true, source: 'placement', score: 0, total: 0 } },
      {},
      db
    );
    assert.equal(db.ledger.filter((r) => r.reason === 'unit_complete').length, 0);

    await grantLessonAndUnitRewards(
      2,
      INT_U1_LESSONS,
      { 'int-u1': { passed: true, source: 'legacy', score: 0, total: 0 } },
      {},
      db
    );
    assert.equal(db.ledger.filter((r) => r.reason === 'unit_complete').length, 0);

    // Làm kiểm tra thật -> cấp +1 Gem
    await grantLessonAndUnitRewards(
      2,
      INT_U1_LESSONS,
      { 'int-u1': { passed: true, source: 'checkpoint', score: 12, total: 15 } },
      {},
      db
    );
    const grants = db.ledger.filter((r) => r.reason === 'unit_complete' && r.ref_id === 'int-u1');
    assert.equal(grants.length, 1);
    assert.equal(grants[0].amount, 1);
  });

  it('3. Mọi bài 100% + checkpoint 15/15 -> cấp unit_perfect (+2 Gem); checkpoint 14/15 -> không cấp', async () => {
    const perfectLessons = Object.fromEntries(INT_U1_LESSONS.map((id) => [id, 100]));

    const db14 = createWalletFakeDb({ usersProgress: [{ user_id: 3, total_xp: 500 }] });
    await grantLessonAndUnitRewards(
      3,
      INT_U1_LESSONS,
      { 'int-u1': { passed: true, source: 'checkpoint', score: 14, total: 15 } },
      perfectLessons,
      db14
    );
    assert.equal(db14.ledger.filter((r) => r.reason === 'unit_complete').length, 1);
    assert.equal(db14.ledger.filter((r) => r.reason === 'unit_perfect').length, 0);

    const db15 = createWalletFakeDb({ usersProgress: [{ user_id: 4, total_xp: 500 }] });
    await grantLessonAndUnitRewards(
      4,
      INT_U1_LESSONS,
      { 'int-u1': { passed: true, source: 'checkpoint', score: 15, total: 15 } },
      perfectLessons,
      db15
    );
    const perf = db15.ledger.filter((r) => r.reason === 'unit_perfect' && r.ref_id === 'int-u1');
    assert.equal(perf.length, 1);
    assert.equal(perf[0].amount, 2);
  });

  it('4. mergeLessonScores giữ giá trị cao hơn, kẹp 0-100 và bỏ id không hợp lệ', () => {
    const dbScores = { greetings: 90, family: 100 };
    const incoming = { greetings: 60, family: 80, colors: 120, numbers: -5, 'fake-id': 100 };
    const merged = mergeLessonScores(dbScores, incoming);
    assert.equal(merged.greetings, 90);
    assert.equal(merged.family, 100);
    assert.equal(merged.colors, 100);
    assert.equal(merged.numbers, 0);
    assert.equal('fake-id' in merged, false);

    assert.equal(sanitizeLearnerGroup('beginner'), 'beginner');
    assert.equal(sanitizeLearnerGroup('invalid'), null);
    assert.equal(sanitizeActivePath('intermediate'), 'intermediate');
    assert.equal(sanitizeActivePath('general'), null);
  });

  it('5. guardUnitGems chạy 2 lần: lần 1 chèn dòng 0 Gem, lần 2 chèn 0 dòng, lọc khỏi lịch sử và chặn cấp đúp Gem', async () => {
    const db = createWalletFakeDb({
      usersProgress: [
        { user_id: 10, total_xp: 1000, completed_lessons: JSON.stringify(INT_U1_LESSONS) },
      ],
    });
    assert.equal(LEGACY_UNIT_IDS.has('unit-3'), true);
    assert.equal(LEGACY_UNIT_IDS.has('int-u1'), false);

    const run1 = await guardUnitGems(db);
    assert.equal(run1.usersChecked, 1);
    assert.equal(run1.guardRowsInserted, 2); // unit_complete + unit_perfect cho int-u1

    const run2 = await guardUnitGems(db);
    assert.equal(run2.guardRowsInserted, 0);

    // Sau khi chặn, dù có qua checkpoint 15/15 cũng không cộng thêm Gem cho int-u1
    const perfectLessons = Object.fromEntries(INT_U1_LESSONS.map((id) => [id, 100]));
    await grantLessonAndUnitRewards(
      10,
      INT_U1_LESSONS,
      { 'int-u1': { passed: true, source: 'checkpoint', score: 15, total: 15 } },
      perfectLessons,
      db
    );
    const intU1Gems = db.ledger
      .filter((r) => r.user_id === 10 && r.ref_id === 'int-u1')
      .reduce((sum, r) => sum + r.amount, 0);
    assert.equal(intU1Gems, 0);

    // Lịch sử ví lọc bỏ dòng amount = 0
    const hist = await getWalletHistory(10, 50, db);
    assert.equal(hist.every((r) => r.amount !== 0), true);
  });

  it('6. File migration SQL tương thích MySQL 5.6+ (không dùng USE, chỉ dùng LONGTEXT)', () => {
    const sqlPath = path.resolve(__dirname, '../db/migrate-learning-groups.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    assert.doesNotMatch(sql, /^\s*USE\s+/im);
    assert.doesNotMatch(sql, /'JSON\s+DEFAULT|ADD\s+COLUMN\s+\w+\s+JSON\b/i);
    assert.ok(sql.includes('LONGTEXT DEFAULT NULL'));
    for (const col of ['learner_group', 'active_path', 'lesson_scores', 'placement']) {
      assert.ok(sql.includes(col), `Thiếu cột ${col}`);
    }
    assert.ok(sql.includes('DROP PROCEDURE cowdi_add_col_if_missing'));
  });
});
