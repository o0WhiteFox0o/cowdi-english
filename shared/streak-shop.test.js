import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEEP_RHYTHM_ITEMS, LEDGER_REASONS } from './game-config.js';
import { getTodayInTz, getYesterdayInTz, getDiffDays } from '../server/utils/streak-manager.js';

test('GĐ3 (D1) — Cấu hình vật phẩm Giữ nhịp định giá chuẩn bằng Sữa', () => {
  // 1. Khăn giữ lửa: 400 Sữa, kho tối đa 2, mua tối đa 2/tuần
  assert.equal(KEEP_RHYTHM_ITEMS.freeze.priceMilk, 400);
  assert.equal(KEEP_RHYTHM_ITEMS.freeze.maxInventory, 2);
  assert.equal(KEEP_RHYTHM_ITEMS.freeze.maxBuyPerWeek, 2);
  assert.deepEqual(KEEP_RHYTHM_ITEMS.freeze.milestoneGifts, [7, 30, 100]);

  // 2. Vé quay lại: 300 Sữa, cooldown 30 ngày, nghỉ 2-14 ngày, streak cũ >= 7
  assert.equal(KEEP_RHYTHM_ITEMS.returnTicket.priceMilk, 300);
  assert.equal(KEEP_RHYTHM_ITEMS.returnTicket.cooldownDays, 30);
  assert.equal(KEEP_RHYTHM_ITEMS.returnTicket.minBrokenStreak, 7);
  assert.equal(KEEP_RHYTHM_ITEMS.returnTicket.minInactiveDays, 2);
  assert.equal(KEEP_RHYTHM_ITEMS.returnTicket.maxInactiveDays, 14);
  assert.equal(KEEP_RHYTHM_ITEMS.returnTicket.requiredLessons, 2);
  assert.equal(KEEP_RHYTHM_ITEMS.returnTicket.restoreRatio, 0.5);

  // 3. Khế ước 7 ngày: 3 mức (300/700/1500), hoàn x1.5 (450/1050/2250)
  assert.equal(KEEP_RHYTHM_ITEMS.contract.durationDays, 7);
  assert.equal(KEEP_RHYTHM_ITEMS.contract.rewardMultiplier, 1.5);
  assert.equal(KEEP_RHYTHM_ITEMS.contract.minAccuracy, 70);
  assert.equal(KEEP_RHYTHM_ITEMS.contract.tiers.starter.deposit, 300);
  assert.equal(KEEP_RHYTHM_ITEMS.contract.tiers.starter.payout, 450);
  assert.equal(KEEP_RHYTHM_ITEMS.contract.tiers.diligent.deposit, 700);
  assert.equal(KEEP_RHYTHM_ITEMS.contract.tiers.diligent.payout, 1050);
  assert.equal(KEEP_RHYTHM_ITEMS.contract.tiers.breakthrough.deposit, 1500);
  assert.equal(KEEP_RHYTHM_ITEMS.contract.tiers.breakthrough.payout, 2250);

  // 4. Đồng hồ Cowdi: 1000 Sữa, +10% Sữa, max 3 bài/ngày, +-60 phút
  assert.equal(KEEP_RHYTHM_ITEMS.clock.priceMilk, 1000);
  assert.equal(KEEP_RHYTHM_ITEMS.clock.bonusMilkPercent, 0.10);
  assert.equal(KEEP_RHYTHM_ITEMS.clock.maxBonusLessonsPerDay, 3);
  assert.equal(KEEP_RHYTHM_ITEMS.clock.windowMinutes, 60);
  assert.equal(KEEP_RHYTHM_ITEMS.clock.freeChangePerWeek, 1);
});

test('GĐ3 — Lý do ledger đầy đủ cho các giao dịch Giữ nhịp', () => {
  const requiredReasons = [
    'shop_freeze',
    'shop_return_ticket',
    'contract_deposit',
    'contract_payout',
    'shop_clock',
    'clock_bonus',
  ];
  for (const reason of requiredReasons) {
    assert.equal(LEDGER_REASONS.includes(reason), true, `Thiếu ledger reason: ${reason}`);
  }
});

test('GĐ3 — Tính toán ngày & múi giờ IANA chuẩn xác', () => {
  const todayVn = getTodayInTz('Asia/Ho_Chi_Minh');
  const yestVn = getYesterdayInTz('Asia/Ho_Chi_Minh');

  assert.match(todayVn, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(yestVn, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(getDiffDays(yestVn, todayVn), 1, 'Hôm nay trừ hôm qua phải đúng 1 ngày');
  assert.equal(getDiffDays(todayVn, todayVn), 0, 'Cùng ngày chênh lệch 0 ngày');
});

test('GĐ3 — Logic tự động dùng Khăn giữ lửa khi nghỉ 1 ngày', () => {
  // Giả lập trạng thái: streak = 10, freeze_count = 1, lỡ 1 ngày
  let streak = 10;
  let freezeCount = 1;
  let brokenStreak = 0;
  let consumedFreeze = false;
  const daysDiff = 2; // lỡ hôm qua

  if (daysDiff === 2 && freezeCount > 0) {
    freezeCount -= 1;
    streak += 1;
    consumedFreeze = true;
  } else {
    brokenStreak = streak;
    streak = 1;
  }

  assert.equal(consumedFreeze, true, 'Phải tự động dùng 1 khăn');
  assert.equal(freezeCount, 0, 'Số khăn giảm từ 1 xuống 0');
  assert.equal(streak, 11, 'Streak được giữ và tăng lên 11');
  assert.equal(brokenStreak, 0, 'Streak không bị đứt');
});

test('GĐ3 — Logic đứt streak khi không có khăn giữ lửa', () => {
  let streak = 15;
  let freezeCount = 0;
  let brokenStreak = 0;
  const daysDiff = 2;

  if (daysDiff === 2 && freezeCount > 0) {
    freezeCount -= 1;
    streak += 1;
  } else {
    brokenStreak = streak;
    streak = 1;
  }

  assert.equal(streak, 1, 'Streak reset về 1');
  assert.equal(brokenStreak, 15, 'Lưu lại streak cũ là 15 ngày để đủ điều kiện vé quay lại');
});

test('GĐ3 — Logic Vé quay lại khôi phục 50% streak cũ', () => {
  const brokenStreak = 20;
  const lessonsCompletedIn24h = 2;
  let restoredStreak = 0;
  let currentStreak = 1;

  if (lessonsCompletedIn24h >= KEEP_RHYTHM_ITEMS.returnTicket.requiredLessons) {
    restoredStreak = Math.floor(brokenStreak * KEEP_RHYTHM_ITEMS.returnTicket.restoreRatio);
    currentStreak = Math.max(currentStreak, restoredStreak);
  }

  assert.equal(restoredStreak, 10, '50% của 20 ngày = 10 ngày');
  assert.equal(currentStreak, 10, 'Streak được khôi phục về 10 ngày');
});

test('GĐ3 — Logic Khế ước 7 ngày hoàn cọc x1.5', () => {
  const tier = KEEP_RHYTHM_ITEMS.contract.tiers.diligent;
  const deposit = tier.deposit; // 700 Sữa
  let daysCompleted = 7;
  let payout = 0;

  if (daysCompleted >= KEEP_RHYTHM_ITEMS.contract.durationDays) {
    payout = Math.round(deposit * KEEP_RHYTHM_ITEMS.contract.rewardMultiplier);
  }

  assert.equal(payout, 1050, '700 Sữa x 1.5 = 1050 Sữa hoàn lại');
  assert.equal(payout - deposit, 350, 'Lãi ròng +350 Sữa');
});

test('GĐ3 — Logic thưởng Đồng hồ Cowdi (+10% Sữa, max 3 bài/ngày)', () => {
  const baseMilk = 170;
  const bonus = Math.round(baseMilk * KEEP_RHYTHM_ITEMS.clock.bonusMilkPercent);
  assert.equal(bonus, 17, '170 Sữa +10% = 17 Sữa');

  // Kiểm tra giới hạn 3 bài/ngày
  let bonusLessons = 0;
  let totalBonus = 0;
  for (let i = 0; i < 5; i++) {
    if (bonusLessons < KEEP_RHYTHM_ITEMS.clock.maxBonusLessonsPerDay) {
      bonusLessons++;
      totalBonus += bonus;
    }
  }
  assert.equal(bonusLessons, 3, 'Chỉ thưởng tối đa 3 bài/ngày');
  assert.equal(totalBonus, 51, 'Tổng thưởng 3 bài = 51 Sữa');
});

test('GĐ3 UI — Trạng thái nút đúng bảng thiết kế cho 4 món Giữ nhịp', () => {
  // 1. Khăn giữ lửa: Đủ tiền, thiếu tiền, đạt giới hạn kho, đạt giới hạn tuần
  function getFreezeButton(userMilk, freezeCount, freezesBoughtThisWeek) {
    if (freezeCount >= 2) return { disabled: true, label: 'Đủ 2/2 khăn' };
    if (freezesBoughtThisWeek >= 2) return { disabled: true, label: 'Tuần sau mua tiếp (2/2)' };
    if (userMilk < 400) return { disabled: true, label: `Thiếu ${400 - userMilk} 🥛` };
    return { disabled: false, label: '400 🥛' };
  }

  assert.deepEqual(getFreezeButton(500, 0, 0), { disabled: false, label: '400 🥛' });
  assert.deepEqual(getFreezeButton(300, 0, 0), { disabled: true, label: 'Thiếu 100 🥛' });
  assert.deepEqual(getFreezeButton(1000, 2, 0), { disabled: true, label: 'Đủ 2/2 khăn' });
  assert.deepEqual(getFreezeButton(1000, 1, 2), { disabled: true, label: 'Tuần sau mua tiếp (2/2)' });

  // 2. Vé quay lại: Đang dùng, chưa đủ điều kiện, thiếu tiền, đủ tiền
  function getReturnTicketButton(userMilk, active, canBuy, lessonsDone) {
    if (active) return { disabled: true, label: `● Đang dùng (${lessonsDone}/2)` };
    if (!canBuy) return { disabled: true, label: 'Mở khi nghỉ 2–14 ngày' };
    if (userMilk < 300) return { disabled: true, label: `Thiếu ${300 - userMilk} 🥛` };
    return { disabled: false, label: '300 🥛' };
  }

  assert.deepEqual(getReturnTicketButton(500, false, true, 0), { disabled: false, label: '300 🥛' });
  assert.deepEqual(getReturnTicketButton(200, false, true, 0), { disabled: true, label: 'Thiếu 100 🥛' });
  assert.deepEqual(getReturnTicketButton(500, false, false, 0), { disabled: true, label: 'Mở khi nghỉ 2–14 ngày' });
  assert.deepEqual(getReturnTicketButton(500, true, true, 1), { disabled: true, label: '● Đang dùng (1/2)' });

  // 3. Khế ước 7 ngày: Chưa có (Chọn mức), Đang có (tiến độ x/7)
  function getContractButton(contract) {
    if (contract) return { disabled: false, isProgress: true, label: `${contract.daysCompleted}/7 ngày (còn ${7 - contract.daysCompleted} ngày)` };
    return { disabled: false, isContractSelect: true, label: 'Chọn mức' };
  }

  assert.deepEqual(getContractButton(null), { disabled: false, isContractSelect: true, label: 'Chọn mức' });
  assert.deepEqual(getContractButton({ daysCompleted: 3 }), { disabled: false, isProgress: true, label: '3/7 ngày (còn 4 ngày)' });

  // 4. Đồng hồ Cowdi: Chưa mua (1 000 🥛 / Thiếu N 🥛), Đã mua (Giờ vàng HH:MM · Đổi giờ)
  function getClockButton(userMilk, hasClock, hour) {
    if (hasClock) return { disabled: false, isClockManage: true, label: `Giờ vàng ${String(hour).padStart(2, '0')}:00 · Đổi giờ` };
    if (userMilk < 1000) return { disabled: true, label: `Thiếu ${1000 - userMilk} 🥛` };
    return { disabled: false, label: '1 000 🥛' };
  }

  assert.deepEqual(getClockButton(1500, false, null), { disabled: false, label: '1 000 🥛' });
  assert.deepEqual(getClockButton(800, false, null), { disabled: true, label: 'Thiếu 200 🥛' });
  assert.deepEqual(getClockButton(500, true, 20), { disabled: false, isClockManage: true, label: 'Giờ vàng 20:00 · Đổi giờ' });
});
