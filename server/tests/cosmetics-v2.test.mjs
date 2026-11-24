// ============================================================
// Cowdi English — GĐ4 Cosmetics V2 Tests
// Kiểm tra dữ liệu 6 bậc, 10 nền hệ, hào quang mốc học,
// tính giá combo giảm 20%, mua qua ledger và trang bị pet.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  COSMETIC_RARITIES,
  BACKGROUND_ITEMS,
  EFFECT_ITEMS,
  ALL_COSMETIC_ITEMS,
  COSMETIC_MAP,
  getCosmeticPrice,
  checkCosmeticUnlocked,
} from '../../shared/cosmetics-data.js';
import {
  getUserCosmetics,
  buyCosmetic,
  equipCosmetic,
} from '../utils/cosmetics-manager.js';

test('1. Kiểm tra cấu hình 6 bậc phẩm chất theo Quyết định D14', () => {
  assert.equal(COSMETIC_RARITIES.common.price, 800, 'Bậc Thường: 800 Sữa');
  assert.equal(COSMETIC_RARITIES.common.currency, 'milk');

  assert.equal(COSMETIC_RARITIES.rare.price, 2000, 'Bậc Hiếm: 2 000 Sữa');
  assert.equal(COSMETIC_RARITIES.rare.currency, 'milk');

  assert.equal(COSMETIC_RARITIES.epic.price, 40, 'Bậc Sử thi: 40 Gem');
  assert.equal(COSMETIC_RARITIES.epic.currency, 'gem');

  assert.equal(COSMETIC_RARITIES.legendary.price, 90, 'Bậc Huyền thoại: 90 Gem');
  assert.equal(COSMETIC_RARITIES.legendary.currency, 'gem');

  assert.equal(COSMETIC_RARITIES.achievement.price, 0, 'Bậc Mốc học: 0 (Miễn phí)');
  assert.equal(COSMETIC_RARITIES.season.price, 0, 'Bậc Mùa: 0');
});

test('2. Kiểm tra danh sách Nền: đủ 10 nền theo hệ và các nền chủ đề', () => {
  assert.ok(BACKGROUND_ITEMS.length >= 19, 'Có ít nhất 19 Nền');

  const elementRooms = BACKGROUND_ITEMS.filter((i) => i.element);
  assert.equal(elementRooms.length, 10, 'Đúng 10 Nền theo 10 hệ thú cưng');

  const expectedElements = ['fire', 'water', 'wood', 'metal', 'earth', 'light', 'dark', 'wind', 'thunder', 'neutral'];
  for (const elem of expectedElements) {
    const found = elementRooms.find((r) => r.element === elem);
    assert.ok(found, `Phải có nền cho hệ ${elem}`);
    assert.equal(found.rarity, 'rare', `Nền hệ ${elem} phải có phẩm chất Hiếm`);
    assert.equal(found.priceMilk, 2000, `Nền hệ ${elem} có giá 2 000 Sữa`);
  }
});

test('3. Kiểm tra danh sách Hào quang: đủ 6 hào quang mốc học và hào quang Gem', () => {
  assert.equal(EFFECT_ITEMS.length, 15, 'Đúng 15 hào quang theo thiết kế');

  const milestoneAuras = EFFECT_ITEMS.filter((i) => i.rarity === 'achievement');
  assert.equal(milestoneAuras.length, 6, 'Có 6 hào quang mốc học');

  const streakAura = milestoneAuras.find((i) => i.id === 'effect_streak_fire');
  assert.ok(streakAura, 'Có hào quang Lửa streak');
  assert.equal(streakAura.unlockCondition.type, 'streak');
  assert.equal(streakAura.unlockCondition.value, 7);

  const almightyAura = milestoneAuras.find((i) => i.id === 'effect_almighty');
  assert.ok(almightyAura, 'Có hào quang Toàn năng');
  assert.equal(almightyAura.unlockCondition.type, 'all_skills');
  assert.equal(almightyAura.unlockCondition.value, 1800);

  const dragonAura = EFFECT_ITEMS.find((i) => i.id === 'effect_golden_dragon');
  assert.ok(dragonAura, 'Có hào quang Rồng vàng');
  assert.equal(dragonAura.rarity, 'legendary');
  assert.equal(dragonAura.priceGem, 90, 'Rồng vàng giá 90 Gem');
});

test('4. Kiểm tra giảm giá combo 20% khi mua cùng chủ đề', () => {
  const rareItem = { priceMilk: 2000, priceGem: 0 };
  const epicItem = { priceMilk: 0, priceGem: 40 };
  const legItem = { priceMilk: 0, priceGem: 90 };

  const singlePrice = getCosmeticPrice(rareItem, false);
  assert.equal(singlePrice.milk, 2000);

  const comboRarePrice = getCosmeticPrice(rareItem, true);
  assert.equal(comboRarePrice.milk, 1600, 'Giảm 20% của 2000 = 1600 Sữa');

  const comboEpicPrice = getCosmeticPrice(epicItem, true);
  assert.equal(comboEpicPrice.gem, 32, 'Giảm 20% của 40 = 32 Gem');

  const comboLegPrice = getCosmeticPrice(legItem, true);
  assert.equal(comboLegPrice.gem, 72, 'Giảm 20% của 90 = 72 Gem');
});

test('5. Kiểm tra logic mở khoá mốc học tập (checkCosmeticUnlocked)', () => {
  const streakItem = { unlockCondition: { type: 'streak', value: 7 } };
  assert.equal(checkCosmeticUnlocked(streakItem, { streak: 3 }), false);
  assert.equal(checkCosmeticUnlocked(streakItem, { streak: 7 }), true);
  assert.equal(checkCosmeticUnlocked(streakItem, { streak: 15 }), true);

  const listeningItem = { unlockCondition: { type: 'skill_listening', value: 600 } };
  assert.equal(checkCosmeticUnlocked(listeningItem, { skills: { listening: 590 } }), false);
  assert.equal(checkCosmeticUnlocked(listeningItem, { skills: { listening: 650 } }), true);

  const almightyItem = { unlockCondition: { type: 'all_skills', value: 1800 } };
  assert.equal(
    checkCosmeticUnlocked(almightyItem, { skills: { listening: 1800, speaking: 1800, reading: 1799, writing: 1800 } }),
    false,
    'Thiếu 1 kỹ năng chưa đạt 1800 không được mở'
  );
  assert.equal(
    checkCosmeticUnlocked(almightyItem, { skills: { listening: 1850, speaking: 1900, reading: 1800, writing: 2000 } }),
    true,
    'Cả 4 kỹ năng >= 1800 mở thành công'
  );
});

test('6. Kiểm tra quy trình mua đồ qua DB Mock (buyCosmetic)', async () => {
  const executedLedger = [];
  const executedOwned = [];
  let userPetData = {
    ownedItems: [],
    collection: {
      pet_1: {
        speciesId: 'cowdi',
        cosmetics: { room: null, effect: null },
      },
    },
  };

  const mockDb = {
    async execute(query, params) {
      if (query.includes('FROM owned_cosmetics WHERE user_id = ? AND cosmetic_id = ?')) {
        const found = executedOwned.find((o) => o.cosmetic_id === params[1]);
        return [[found || null]];
      }
      if (query.includes('FROM owned_cosmetics oc WHERE oc.user_id = ?') || query.includes('FROM owned_cosmetics WHERE user_id = ?')) {
        return [executedOwned];
      }
      if (query.includes('FROM user_progress WHERE user_id = ?')) {
        return [[{ total_xp: 5000, pet_data: JSON.stringify(userPetData) }]];
      }
      if (query.includes('FROM wallet_ledger WHERE user_id = ? GROUP BY currency')) {
        return [[]]; // Số dư: 5000 Sữa (từ total_xp), 0 Gem
      }
      if (query.includes('FROM user_streak_state WHERE user_id = ?')) {
        return [[{ current_streak: 10, best_streak: 10 }]];
      }
      return [[]];
    },
    async getConnection() {
      return {
        async beginTransaction() {},
        async execute(query, params) {
          if (query.includes('INSERT INTO wallet_ledger')) {
            executedLedger.push(params);
          }
          if (query.includes('INSERT INTO owned_cosmetics')) {
            executedOwned.push({ id: 1, cosmetic_id: params[1], category: params[2] });
          }
          if (query.includes('SELECT pet_data FROM user_progress')) {
            return [[{ pet_data: JSON.stringify(userPetData) }]];
          }
          if (query.includes('UPDATE user_progress SET pet_data') || query.includes('INSERT INTO user_progress')) {
            userPetData = JSON.parse(params[1]);
          }
        },
        async commit() {},
        async rollback() {},
        release() {},
      };
    },
  };

  // Mua phòng Rừng xanh (800 Sữa)
  const buyRes = await buyCosmetic(101, 'room_forest', { petId: 'pet_1' }, mockDb);
  assert.equal(buyRes.ok, true, 'Mua thành công');
  assert.equal(buyRes.pricePaid, 800);
  assert.equal(buyRes.currency, 'milk');

  // Kiểm tra ledger trừ tiền
  assert.equal(executedLedger.length, 1);
  assert.equal(executedLedger[0][1], 'milk');
  assert.equal(executedLedger[0][2], -800);

  // Kiểm tra sở hữu và trang bị
  assert.ok(userPetData.ownedItems.includes('room_forest'));
  assert.equal(userPetData.collection.pet_1.cosmetics.room, 'room_forest');

  // Mua lại lần nữa phải bị từ chối
  const duplicateBuy = await buyCosmetic(101, 'room_forest', {}, mockDb);
  assert.equal(duplicateBuy.ok, false);
  assert.match(duplicateBuy.error, /đã sở hữu/);

  // Mua đồ mốc học phải bị từ chối (không bán bằng tiền)
  const milestoneBuy = await buyCosmetic(101, 'effect_streak_fire', {}, mockDb);
  assert.equal(milestoneBuy.ok, false);
  assert.match(milestoneBuy.error, /Mốc học/);
});

test('7. Kiểm tra trang bị đồ (equipCosmetic)', async () => {
  let userPetData = {
    ownedItems: ['room_forest', 'effect_fire'],
    collection: {
      pet_1: {
        speciesId: 'cowdi',
        cosmetics: { room: null, effect: null },
      },
    },
  };

  const mockDb = {
    async execute(query, params) {
      if (query.includes('FROM owned_cosmetics WHERE user_id = ?')) {
        return [[{ cosmetic_id: 'room_forest' }, { cosmetic_id: 'effect_fire' }]];
      }
      if (query.includes('FROM user_progress WHERE user_id = ?')) {
        return [[{ pet_data: JSON.stringify(userPetData) }]];
      }
      if (query.includes('FROM user_streak_state WHERE user_id = ?')) {
        return [[{ current_streak: 5, best_streak: 5 }]];
      }
      if (query.includes('INSERT INTO user_progress')) {
        userPetData = JSON.parse(params[1]);
        return [{ affectedRows: 1 }];
      }
      return [[]];
    },
  };

  // Trang bị đồ đã có
  const equipRes = await equipCosmetic(101, 'pet_1', 'room', 'room_forest', mockDb);
  assert.equal(equipRes.ok, true);
  assert.equal(userPetData.collection.pet_1.cosmetics.room, 'room_forest');

  // Tháo đồ (cosmeticId = null)
  const unequipRes = await equipCosmetic(101, 'pet_1', 'room', null, mockDb);
  assert.equal(unequipRes.ok, true);
  assert.equal(userPetData.collection.pet_1.cosmetics.room, null);

  // Thử trang bị đồ chưa mua
  const unownedRes = await equipCosmetic(101, 'pet_1', 'room', 'room_volcano', mockDb);
  assert.equal(unownedRes.ok, false);
  assert.match(unownedRes.error, /chưa sở hữu/);
});
