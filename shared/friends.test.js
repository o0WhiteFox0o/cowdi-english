// ============================================================
// Cowdi English — Unit Tests cho shared/friends.js & migrate-friends.sql
// Bao phủ BR-01..BR-07 và tương thích MySQL 5.5/5.6+ (RK-005).
// ============================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { INVITE_REWARDS, FRIEND_LIMITS, LEDGER_REASONS } from './game-config.js';
import {
  toVietnamDate,
  toVietnamMonth,
  isActivated,
  milestonesReached,
  getNextMilestone,
  normalizeFriendPair,
  isValidFriendCode,
  isValidEmail,
  parseQrPayload,
  validateNickname,
  splitMonthlyTicketAllowance,
} from './friends.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Bước 1 — Cấu hình & hàm thuần Bạn bè / Thưởng mời bạn', () => {
  it('Cấu hình hằng số khớp SRS-FRIENDS v1.1 (BR-01..BR-07)', () => {
    assert.equal(INVITE_REWARDS.MIN_NEW_LESSONS, 3);
    assert.equal(INVITE_REWARDS.MIN_DISTINCT_DAYS, 2);
    assert.equal(INVITE_REWARDS.WINDOW_DAYS, 14);
    assert.equal(INVITE_REWARDS.SENDER_GEM, 3);
    assert.equal(INVITE_REWARDS.SENDER_GEM_MAX_PER_MONTH, 10);
    assert.equal(INVITE_REWARDS.RECEIVER_MILK, 500);
    assert.equal(INVITE_REWARDS.TICKETS_MAX_PER_MONTH, 3);
    assert.equal(INVITE_REWARDS.MILESTONES.length, 4);
    assert.deepEqual(
      INVITE_REWARDS.MILESTONES.map((m) => [m.count, m.tickets, m.titleVi]),
      [
        [3, 1, 'Người dẫn đường'],
        [5, 1, null],
        [10, 2, 'Người gieo mầm'],
        [20, 2, 'Đại sứ Cowdi'],
      ]
    );
    assert.equal(FRIEND_LIMITS.MAX_FRIENDS, 100);
    assert.equal(FRIEND_LIMITS.MAX_PENDING_REQUESTS, 20);
    assert.equal(FRIEND_LIMITS.MAX_REQUESTS_PER_HOUR, 20);
    assert.ok(LEDGER_REASONS.includes('invite_activated'));
    assert.ok(LEDGER_REASONS.includes('invite_welcome'));
    assert.ok(LEDGER_REASONS.includes('invite_milestone'));
  });

  it('AT-02 / BR-01: 3 bài mới trong cùng 1 ngày -> false; sang ngày thứ 2 -> true', () => {
    const claimedAt = '2026-11-01T08:00:00+07:00';
    const sameDayNow = '2026-11-01T21:00:00+07:00';

    // 3 bài trong cùng 1 ngày -> chưa đạt
    assert.equal(
      isActivated(['2026-11-01', '2026-11-01', '2026-11-01'], claimedAt, sameDayNow),
      false
    );

    // 2 bài trên 2 ngày khác nhau -> chưa đủ 3 bài
    assert.equal(
      isActivated(['2026-11-01', '2026-11-02'], claimedAt, '2026-11-02T10:00:00+07:00'),
      false
    );

    // 3 bài trên 2 ngày khác nhau trong vòng 14 ngày -> đạt!
    assert.equal(
      isActivated(['2026-11-01', '2026-11-01', '2026-11-02'], claimedAt, '2026-11-02T10:00:00+07:00'),
      true
    );

    // Kiểm tra đổi ngày đúng múi giờ Việt Nam (23:30 UTC+7 và 00:15 UTC+7 hôm sau)
    assert.equal(
      isActivated(
        ['2026-11-01T16:30:00Z', '2026-11-01T16:40:00Z', '2026-11-01T17:15:00Z'],
        '2026-11-01T01:00:00Z',
        '2026-11-01T18:00:00Z'
      ),
      true
    );
  });

  it('BR-01: Quá cửa sổ 14 ngày kể từ claimedAt -> false; bài học trước ngày claim không tính', () => {
    const claimedAt = '2026-11-01T08:00:00+07:00';

    // Ngày thứ 15 (quá 14 * 24h) -> false
    assert.equal(
      isActivated(['2026-11-01', '2026-11-02', '2026-11-16'], claimedAt, '2026-11-16T08:01:00+07:00'),
      false
    );

    // Bài học trước ngày nhận thiệp không được tính
    assert.equal(
      isActivated(['2026-10-30', '2026-10-31', '2026-11-02'], claimedAt, '2026-11-02T10:00:00+07:00'),
      false
    );
  });

  it('AT-04 / BR-03: milestonesReached trả đúng các mốc mới đạt và loại mốc đã cấp', () => {
    assert.deepEqual(milestonesReached(2, []), []);
    assert.deepEqual(
      milestonesReached(3, []).map((m) => m.count),
      [3]
    );
    assert.deepEqual(
      milestonesReached(3, [3]).map((m) => m.count),
      []
    );
    assert.deepEqual(
      milestonesReached(10, ['3', 5]).map((m) => m.count),
      [10]
    );
    assert.deepEqual(
      milestonesReached(25, [3, 5, 10]).map((m) => ({ count: m.count, tickets: m.tickets, titleVi: m.titleVi })),
      [{ count: 20, tickets: 2, titleVi: 'Đại sứ Cowdi' }]
    );
    assert.equal(getNextMilestone(0)?.count, 3);
    assert.equal(getNextMilestone(3)?.count, 5);
    assert.equal(getNextMilestone(20), null);
  });

  it('AT-05 / BR-04: splitMonthlyTicketAllowance giới hạn 3 vé/tháng và dời phần dư', () => {
    assert.deepEqual(splitMonthlyTicketAllowance(4, 0), { grantNow: 3, deferred: 1, remainingQuota: 3 });
    assert.deepEqual(splitMonthlyTicketAllowance(2, 2), { grantNow: 1, deferred: 1, remainingQuota: 1 });
    assert.deepEqual(splitMonthlyTicketAllowance(1, 3), { grantNow: 0, deferred: 1, remainingQuota: 0 });
  });

  it('normalizeFriendPair, isValidFriendCode, validateNickname hoạt động chính xác', () => {
    assert.deepEqual(normalizeFriendPair(12, 5), { userLow: 5, userHigh: 12 });
    assert.deepEqual(normalizeFriendPair(5, 12), { userLow: 5, userHigh: 12 });
    assert.equal(normalizeFriendPair(5, 5), null);

    assert.equal(isValidFriendCode('ABCD2345'), true);
    assert.equal(isValidFriendCode('abcd2345'), true);
    assert.equal(isValidFriendCode('ABCD01IO'), false); // cấm 0, 1, I, O
    assert.equal(isValidFriendCode('SHORT'), false);

    assert.equal(validateNickname('Bé Mai').ok, true);
    assert.equal(validateNickname('A').ok, false);
    assert.equal(validateNickname('Tên Quá Dài Hơn Hai Mươi Ký Tự').ok, false);
    assert.equal(validateNickname('<script>').ok, false);
    assert.equal(validateNickname('Admin Cowdi').ok, false);
    assert.equal(toVietnamDate('2026-11-25T17:30:00Z'), '2026-11-26');
    assert.equal(toVietnamMonth('2026-11-25T17:30:00Z'), '2026-11');

    // Kiểm tra email & phân tích mã QR
    assert.equal(isValidEmail('Mai@Gmail.com'), true);
    assert.equal(isValidEmail('khong-hop-le'), false);
    assert.deepEqual(parseQrPayload('https://cowdi.net/friends?add=ABCD2345'), { type: 'friend_code', code: 'ABCD2345' });
    assert.deepEqual(parseQrPayload('https://cowdi.net/i/INV23456'), { type: 'invite', code: 'INV23456' });
    assert.deepEqual(parseQrPayload('ABCD2345'), { type: 'friend_code', code: 'ABCD2345' });
    assert.deepEqual(parseQrPayload('ban@gmail.com'), { type: 'email', email: 'ban@gmail.com' });
    assert.equal(parseQrPayload('https://example.com/other'), null);
  });

  it('SQL migration server/db/migrate-friends.sql tương thích MySQL 5.5/5.6+ (không USE, không JSON)', () => {
    const sqlPath = path.resolve(__dirname, '../server/db/migrate-friends.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    assert.equal(/\bUSE\s+\w+\s*;/i.test(sql), false, 'Không dùng USE <db>;');
    assert.equal(/\bJSON\b/i.test(sql.replace(/--.*$/gm, '').replace(/COMMENT\s+'[^']*'/gi, '')), false, 'Không dùng cột kiểu JSON');
    for (const tbl of ['friendships', 'friend_reports', 'user_lesson_first_completions', 'invite_ticket_queue', 'invite_notifications', 'app_events']) {
      assert.ok(sql.includes(`CREATE TABLE IF NOT EXISTS ${tbl}`), `Phải tạo bảng ${tbl}`);
    }
  });
});
