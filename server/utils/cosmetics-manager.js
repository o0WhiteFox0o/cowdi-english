// ============================================================
// Cowdi English — Server Cosmetics Manager (Giai đoạn 4)
// Quản lý mua đồ trang trí (Nền & Hào quang) qua ledger,
// lưu trữ sở hữu vào owned_cosmetics và đồng bộ pet_data.
// ============================================================

import pool from '../config/database.js';
import {
  BACKGROUND_ITEMS,
  EFFECT_ITEMS,
  ALL_COSMETIC_ITEMS,
  COSMETIC_MAP,
  COSMETIC_RARITIES,
  getCosmeticPrice,
  checkCosmeticUnlocked,
} from '../../shared/cosmetics-data.js';
import { getWallet } from './wallet.js';

// Export alias cho kiểm thử
export const checkMilestoneUnlock = checkCosmeticUnlocked;

/**
 * Lấy danh mục Cửa hàng Đồ trang trí kèm trạng thái sở hữu của user
 */
export async function getCosmeticsCatalog(userId, db = pool) {
  const userCosmetics = await getUserCosmetics(userId, db);
  return {
    rarities: COSMETIC_RARITIES,
    backgrounds: BACKGROUND_ITEMS,
    effects: EFFECT_ITEMS,
    ownedIds: userCosmetics.ownedIds,
    userStats: userCosmetics.userStats,
  };
}

/**
 * Lấy danh sách đồ đã sở hữu và trạng thái mốc học của người dùng.
 */
export async function getUserCosmetics(userId, db = pool) {
  // 1. Đọc từ bảng owned_cosmetics
  const [ownedRows] = await db.execute(
    'SELECT cosmetic_id, category, currency, price_paid, acquired_from, created_at FROM owned_cosmetics WHERE user_id = ?',
    [userId]
  );

  const ownedIdsSet = new Set(ownedRows.map((r) => r.cosmetic_id));

  // 2. Đọc pet_data để lấy đồ cũ + stats + pet hiện tại
  const [[progRow]] = await db.execute(
    'SELECT pet_data, skill_xp, streak FROM user_progress WHERE user_id = ?',
    [userId]
  );

  let petData = null;
  if (progRow?.pet_data) {
    try {
      petData = typeof progRow.pet_data === 'string' ? JSON.parse(progRow.pet_data) : progRow.pet_data;
    } catch {
      petData = null;
    }
  }

  // Kết hợp legacy ownedItems nếu có
  if (Array.isArray(petData?.ownedItems)) {
    for (const id of petData.ownedItems) {
      if (id && typeof id === 'string') ownedIdsSet.add(id);
    }
  }

  // 3. Đọc streak từ user_streak_state (nếu có)
  const [[streakRow]] = await db.execute(
    'SELECT current_streak, best_streak FROM user_streak_state WHERE user_id = ?',
    [userId]
  );

  // Parse skill_xp
  let skills = { listening: 0, speaking: 0, reading: 0, writing: 0 };
  if (progRow?.skill_xp) {
    try {
      skills = typeof progRow.skill_xp === 'string' ? JSON.parse(progRow.skill_xp) : progRow.skill_xp;
    } catch {}
  }

  const streak = Math.max(
    Number(streakRow?.current_streak || 0),
    Number(progRow?.streak || 0)
  );

  const userStats = {
    streak,
    skills,
    unitsCompleted: 1, // mặc định mở mốc cơ bản
    lessonsCompleted: 1,
  };

  return {
    ownedIds: Array.from(ownedIdsSet),
    ownedDetails: ownedRows,
    userStats,
    petData,
  };
}

/**
 * Mua đồ trang trí bằng Sữa (milk) hoặc Gem (gem) qua ledger.
 * @param {number} userId
 * @param {string} cosmeticId
 * @param {object} options { petId, applyComboDiscount }
 */
export async function buyCosmetic(userId, cosmeticId, options = {}, db = pool) {
  const item = COSMETIC_MAP[cosmeticId];
  if (!item) {
    return { ok: false, error: 'Món đồ không tồn tại trong danh mục cửa hàng.' };
  }

  if (item.rarity === 'achievement') {
    return { ok: false, error: 'Đồ Mốc học không thể mua bằng tiền, chỉ có thể mở khi đạt thành tích học tập!' };
  }

  if (item.rarity === 'season') {
    return { ok: false, error: 'Đồ Mùa chỉ có thể nhận qua Thẻ Mùa (Season Pass).' };
  }

  // 1. Kiểm tra đã sở hữu chưa
  const [[existing]] = await db.execute(
    'SELECT id FROM owned_cosmetics WHERE user_id = ? AND cosmetic_id = ?',
    [userId, cosmeticId]
  );
  if (existing) {
    return { ok: false, error: 'Bạn đã sở hữu món đồ này rồi!' };
  }

  // 2. Tính giá (hỗ trợ combo 20% nếu đã sở hữu hoặc cùng chủ đề)
  let isCombo = Boolean(options.applyComboDiscount);
  if (!isCombo && item.theme) {
    // Kiểm tra xem user đã có món đồ nào khác cùng theme chưa
    const [themeRows] = await db.execute(
      `SELECT oc.cosmetic_id FROM owned_cosmetics oc
       WHERE oc.user_id = ?`,
      [userId]
    );
    for (const r of themeRows) {
      const other = COSMETIC_MAP[r.cosmetic_id];
      if (other && other.id !== item.id && other.theme === item.theme) {
        isCombo = true;
        break;
      }
    }
  }

  const price = getCosmeticPrice(item, isCombo);
  const currency = item.priceGem > 0 ? 'gem' : 'milk';
  const amountToPay = item.priceGem > 0 ? price.gem : price.milk;

  // 3. Kiểm tra số dư ví
  const wallet = await getWallet(userId, db);
  if (currency === 'milk' && wallet.milk < amountToPay) {
    return {
      ok: false,
      error: `Bạn cần ${amountToPay.toLocaleString('vi-VN')} Sữa để mua ${item.name} (hiện có: ${wallet.milk.toLocaleString('vi-VN')} 🥛). Hãy học thêm bài để tích lũy Sữa nhé!`,
    };
  }

  if (currency === 'gem' && wallet.gem < amountToPay) {
    return {
      ok: false,
      error: `Bạn cần ${amountToPay} Gem để mua ${item.name} (hiện có: ${wallet.gem} 💎). Hãy hoàn thành các Unit để nhận thêm Gem nhé!`,
    };
  }

  // 4. Thực hiện transaction
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const timestampRef = Date.now().toString();

    // a. Trừ tiền qua ledger
    if (amountToPay > 0) {
      await conn.execute(
        `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, ?, ?, 'buy_cosmetic', ?)`,
        [userId, currency, -amountToPay, cosmeticId]
      );
    }

    // b. Ghi nhận sở hữu vào owned_cosmetics
    await conn.execute(
      `INSERT INTO owned_cosmetics (user_id, cosmetic_id, category, currency, price_paid, acquired_from, created_at)
       VALUES (?, ?, ?, ?, ?, 'shop', NOW())
       ON DUPLICATE KEY UPDATE price_paid = VALUES(price_paid)`,
      [userId, cosmeticId, item.category, currency, amountToPay]
    );

    // c. Cập nhật pet_data trong user_progress
    const [[progRow]] = await conn.execute(
      'SELECT pet_data FROM user_progress WHERE user_id = ? FOR UPDATE',
      [userId]
    );

    let petData = {};
    if (progRow?.pet_data) {
      try {
        petData = typeof progRow.pet_data === 'string' ? JSON.parse(progRow.pet_data) : progRow.pet_data;
      } catch {
        petData = {};
      }
    }

    if (!Array.isArray(petData.ownedItems)) {
      petData.ownedItems = [];
    }
    if (!petData.ownedItems.includes(cosmeticId)) {
      petData.ownedItems.push(cosmeticId);
    }

    // Tự động trang bị nếu chỉ định petId
    const targetPetId = options.petId || petData.activePetId;
    if (targetPetId && petData.collection && petData.collection[targetPetId]) {
      const pet = petData.collection[targetPetId];
      if (!pet.cosmetics) pet.cosmetics = { hat: null, outfit: null, room: null, effect: null };
      pet.cosmetics[item.category] = cosmeticId;
    }

    await conn.execute(
      `INSERT INTO user_progress (user_id, pet_data)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE pet_data = VALUES(pet_data)`,
      [userId, JSON.stringify(petData)]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  // 5. Trả về kết quả ví mới và danh sách sở hữu
  const newWallet = await getWallet(userId, db);
  const userCosmetics = await getUserCosmetics(userId, db);

  return {
    ok: true,
    cosmetic: item,
    pricePaid: amountToPay,
    currency,
    isComboDiscounted: isCombo,
    wallet: newWallet,
    ownedIds: userCosmetics.ownedIds,
    petData: userCosmetics.petData,
  };
}

/**
 * Trang bị hoặc tháo bỏ đồ trang trí trên một pet.
 * @param {number} userId
 * @param {string} petInstanceId
 * @param {'room'|'effect'|'hat'|'outfit'} slot
 * @param {string|null} cosmeticId null nếu tháo bỏ
 */
export async function equipCosmetic(userId, petInstanceId, slot, cosmeticId, db = pool) {
  const allowedSlots = ['room', 'effect', 'hat', 'outfit'];
  if (!allowedSlots.includes(slot)) {
    return { ok: false, error: `Vị trí trang bị không hợp lệ: ${slot}` };
  }

  const { ownedIds, userStats, petData } = await getUserCosmetics(userId, db);

  if (!petData?.collection || !petData.collection[petInstanceId]) {
    return { ok: false, error: 'Thú cưng không tồn tại hoặc không thuộc sở hữu của bạn.' };
  }

  if (cosmeticId) {
    const item = COSMETIC_MAP[cosmeticId];
    // Cho phép đồ cũ trong SHOP_ITEMS nếu có
    const isOwned = ownedIds.includes(cosmeticId);

    if (item && item.rarity === 'achievement') {
      // Đồ mốc học: kiểm tra điều kiện đạt mốc
      const isUnlocked = checkCosmeticUnlocked(item, userStats);
      if (!isUnlocked) {
        return { ok: false, error: `Bạn chưa đạt điều kiện mở khóa mốc học: ${item.note || item.name}` };
      }
    } else if (!isOwned) {
      return { ok: false, error: 'Bạn chưa sở hữu món đồ trang trí này.' };
    }
  }

  // Cập nhật slot trên pet
  const pet = petData.collection[petInstanceId];
  if (!pet.cosmetics) pet.cosmetics = { hat: null, outfit: null, room: null, effect: null };
  pet.cosmetics[slot] = cosmeticId || null;

  await db.execute(
    `INSERT INTO user_progress (user_id, pet_data)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE pet_data = VALUES(pet_data)`,
    [userId, JSON.stringify(petData)]
  );

  return {
    ok: true,
    petInstanceId,
    slot,
    cosmeticId: cosmeticId || null,
    cosmetics: pet.cosmetics,
    petData,
  };
}
