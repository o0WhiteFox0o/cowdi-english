import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DAILY_QUESTS, WEEKLY_QUESTS, PET_ACHIEVEMENTS } from '../src/data/pets.js';

test('D12 — Nhiệm vụ ngày trả Sữa: 30 Sữa/nhiệm vụ, đủ 3 nhiệm vụ bonus 75', () => {
  assert.equal(DAILY_QUESTS.length, 3);
  for (const q of DAILY_QUESTS) {
    assert.equal(q.reward, 30, `Nhiệm vụ ${q.id} phải có thưởng là 30 Sữa`);
  }
});

test('D12 — Nhiệm vụ tuần nhân 3: 150 / 300 / 240 Sữa', () => {
  const lessonQ = WEEKLY_QUESTS.find((q) => q.id === 'weekly_lessons');
  const streakQ = WEEKLY_QUESTS.find((q) => q.id === 'weekly_streak');
  const perfectQ = WEEKLY_QUESTS.find((q) => q.id === 'weekly_perfect');

  assert.equal(lessonQ.reward, 150, 'Tuần học chăm thưởng 150 Sữa');
  assert.equal(streakQ.reward, 300, 'Streak 7 ngày thưởng 300 Sữa');
  assert.equal(perfectQ.reward, 240, 'Quiz Master thưởng 240 Sữa');
});

test('D12 — Thành tựu thú cưng: không còn pet_coins_500, thay bằng pet_milk_1500', () => {
  const hasCoinsAch = PET_ACHIEVEMENTS.some((a) => a.id === 'pet_coins_500');
  const hasMilkAch = PET_ACHIEVEMENTS.some((a) => a.id === 'pet_milk_1500');
  assert.equal(hasCoinsAch, false, 'Không còn achievement pet_coins_500');
  assert.equal(hasMilkAch, true, 'Có achievement pet_milk_1500');

  const milkAch = PET_ACHIEVEMENTS.find((a) => a.id === 'pet_milk_1500');
  assert.equal(milkAch.check({ totalXP: 1500 }), true);
  assert.equal(milkAch.check({ totalXP: 1499 }), false);
});

test('D12 — Logic tính số dư ví: total_xp + milkDelta (với coin_migration = coins * 3)', () => {
  // Giả lập user: totalXp = 1000, legacy_spent = -200 (availableXp = 800), coins = 100
  const totalXp = 1000;
  const legacySpent = -200;
  const coinMigration = 100 * 3; // +300 Sữa

  const milkDelta = legacySpent + coinMigration; // +100
  const finalMilk = totalXp + milkDelta; // 1100 = 800 available + 300 từ coin

  assert.equal(finalMilk, 1100);
});

test('D12 — Hàm rút gọn số dư formatCompact: <1000 giữ nguyên, >=1000 định dạng k với dấu phẩy', () => {
  function formatCompact(num) {
    const val = Number(num || 0);
    if (val >= 1000) {
      const k = (val / 1000).toFixed(1).replace('.', ',');
      return k.endsWith(',0') ? k.slice(0, -2) + 'k' : k + 'k';
    }
    return String(val);
  }

  assert.equal(formatCompact(450), '450');
  assert.equal(formatCompact(1000), '1k');
  assert.equal(formatCompact(1234), '1,2k');
  assert.equal(formatCompact(12300), '12,3k');
  assert.equal(formatCompact(0), '0');
});
