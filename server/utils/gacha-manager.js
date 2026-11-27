// ============================================================
// Cowdi English — Gacha & Starter Pull Manager (GĐ6–GĐ7 · D5, D7)
// - RNG an toàn phía server (crypto.randomInt).
// - Loại bỏ mọi pet chưa đủ 5/5 hình (isPetImageComplete).
// - Mọi biến động vé / Gem / Sữa / Mảnh đá đi qua wallet_ledger.
// ============================================================

import crypto from 'node:crypto';
import pool from '../config/database.js';
import {
  GACHA_CONFIG,
  PET_BATTLE_DATA,
  isPetImageComplete,
} from '../../shared/game-config.js';
import { getWallet } from './wallet.js';

function cryptoRng() {
  return crypto.randomInt(0, 1_000_000) / 1_000_000;
}

function makeRefId(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Chọn 1 phần tử theo trọng số `rate` (hoặc `weight`).
 */
export function pickWeighted(items, rng = cryptoRng) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const total = items.reduce((s, it) => s + Number(it.rate ?? it.weight ?? 0), 0);
  if (total <= 0) return items[0];
  let r = rng() * total;
  for (const it of items) {
    r -= Number(it.rate ?? it.weight ?? 0);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

/**
 * Trả về bể Pet khởi đầu (loại trừ cowdi và mọi pet chưa đủ 5 hình).
 */
export function getStarterPool() {
  const byRarity = { common: [], rare: [], epic: [], event: [], legendary: [] };
  for (const [id, info] of Object.entries(PET_BATTLE_DATA)) {
    if (id === 'cowdi') continue;
    if (!isPetImageComplete(id)) continue;
    const rarity = info?.rarity || 'common';
    if (byRarity[rarity]) {
      byRarity[rarity].push(id);
    }
  }
  return byRarity;
}

/**
 * Trả về bể Pet Gacha thường (loại trừ mọi pet chưa đủ 5 hình).
 */
export function getGachaPetPools() {
  const epic = [];
  const limited = [];
  for (const [id, info] of Object.entries(PET_BATTLE_DATA)) {
    if (id === 'cowdi') continue;
    if (!isPetImageComplete(id)) continue;
    if (info.rarity === 'epic') epic.push(id);
    if (info.rarity === 'event' || info.rarity === 'legendary') limited.push(id);
  }
  return { epic, limited };
}

/**
 * Quay 1 Pet khởi đầu (hàm thuần, hỗ trợ inject rng để test).
 */
export function rollStarterPet(rng = cryptoRng) {
  const pools = getStarterPool();
  const availableRates = GACHA_CONFIG.STARTER_POOL_RATES.filter(
    (r) => Array.isArray(pools[r.rarity]) && pools[r.rarity].length > 0
  );
  const pickedTier = pickWeighted(availableRates, rng) || availableRates[0];
  const candidates = pools[pickedTier.rarity];
  const idx = Math.min(candidates.length - 1, Math.floor(rng() * candidates.length));
  return {
    speciesId: candidates[idx],
    rarity: pickedTier.rarity,
    label: pickedTier.label,
  };
}

/**
 * Quay 1 lượt Gacha thường theo tỉ lệ 67 / 22 / 8 / 3 (hàm thuần).
 */
export function rollStandardGachaOutcome(
  { ownedPetSpecies = new Set(), streakShields = 0 } = {},
  rng = cryptoRng
) {
  const tierObj = pickWeighted(GACHA_CONFIG.STANDARD_RATES, rng) || GACHA_CONFIG.STANDARD_RATES[0];
  const tier = tierObj.tier;
  const pools = getGachaPetPools();

  if (tier === 'common') {
    const options = [
      { rewardType: 'milk', rewardId: 'milk', amount: 250, label: '250 Sữa 🥛' },
      { rewardType: 'arena_ticket', rewardId: 'arena_ticket', amount: 4, label: '4 Vé Đấu trường 🎫' },
    ];
    if (streakShields < 2) {
      options.push({ rewardType: 'streak_shield', rewardId: 'streak_shield', amount: 1, label: '1 Khăn giữ lửa 🧣' });
    }
    const pick = options[Math.min(options.length - 1, Math.floor(rng() * options.length))];
    return { tier, isDuplicate: false, ...pick };
  }

  if (tier === 'rare') {
    const options = [
      { rewardType: 'stone_shard', rewardId: 'stone_shard', amount: 3, label: '3 Mảnh đá nguyên tố 💠' },
      { rewardType: 'milk', rewardId: 'milk', amount: 600, label: '600 Sữa 🥛' },
    ];
    const pick = options[Math.min(options.length - 1, Math.floor(rng() * options.length))];
    return { tier, isDuplicate: false, ...pick };
  }

  if (tier === 'epic') {
    const candidates = pools.epic.length > 0 ? pools.epic : pools.limited;
    const speciesId = candidates[Math.min(candidates.length - 1, Math.floor(rng() * candidates.length))];
    if (ownedPetSpecies.has(speciesId)) {
      return {
        tier,
        rewardType: 'gem',
        rewardId: speciesId,
        amount: GACHA_CONFIG.DUPLICATE_EPIC_GEM,
        isDuplicate: true,
        label: `Trùng pet Sử thi → +${GACHA_CONFIG.DUPLICATE_EPIC_GEM} Gem 💎`,
      };
    }
    return {
      tier,
      rewardType: 'pet',
      rewardId: speciesId,
      amount: 1,
      isDuplicate: false,
      label: `Pet Sử thi: ${speciesId}`,
    };
  }

  // limited (3%)
  const limCandidates = pools.limited.length > 0 ? pools.limited : pools.epic;
  const speciesId = limCandidates[Math.min(limCandidates.length - 1, Math.floor(rng() * limCandidates.length))];
  if (ownedPetSpecies.has(speciesId)) {
    return {
      tier,
      rewardType: 'gem',
      rewardId: speciesId,
      amount: GACHA_CONFIG.DUPLICATE_EPIC_GEM,
      isDuplicate: true,
      label: `Trùng pet Đặc biệt → +${GACHA_CONFIG.DUPLICATE_EPIC_GEM} Gem 💎`,
    };
  }
  return {
    tier,
    rewardType: 'pet',
    rewardId: speciesId,
    amount: 1,
    isDuplicate: false,
    label: `Pet Đặc biệt: ${speciesId}`,
  };
}

let schemaEnsured = false;
export async function ensureGachaSchema(db = pool) {
  if (schemaEnsured) return;
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS gacha_history (
        id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id       INT UNSIGNED NOT NULL,
        pool_type     VARCHAR(32) NOT NULL DEFAULT 'standard',
        tier          VARCHAR(32) NOT NULL,
        reward_type   VARCHAR(32) NOT NULL,
        reward_id     VARCHAR(64) DEFAULT NULL,
        reward_amount INT NOT NULL DEFAULT 1,
        is_duplicate  TINYINT(1) NOT NULL DEFAULT 0,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_gacha_user_time (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    const [cols] = await db.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invites'
         AND COLUMN_NAME IN ('starter_choice', 'starter_species')`
    );
    const existing = new Set(cols.map((c) => c.COLUMN_NAME));
    if (!existing.has('starter_choice')) {
      await db.execute(`ALTER TABLE invites ADD COLUMN starter_choice VARCHAR(16) DEFAULT NULL`);
    }
    if (!existing.has('starter_species')) {
      await db.execute(`ALTER TABLE invites ADD COLUMN starter_species VARCHAR(32) DEFAULT NULL`);
    }
    schemaEnsured = true;
  } catch (err) {
    console.warn('[gacha] ensureGachaSchema warning:', err.message);
  }
}

function buildNewPetInstance(speciesId, source = 'gacha') {
  const now = new Date().toISOString();
  const instanceId = speciesId === 'cowdi' ? 'cowdi_1' : `${speciesId}_${Date.now()}`;
  return {
    instanceId,
    pet: {
      instanceId,
      speciesId,
      customName: '',
      evolution: 0,
      skills: { listening: 0, speaking: 0, reading: 0, writing: 0 },
      needs: { energy: 80, happiness: 80, health: 80, knowledge: 80 },
      cosmetics: { hat: null, outfit: null, room: null, effect: null },
      totalXpEarned: 0,
      source,
      needsUpdatedAt: now,
      unlockedAt: now,
    },
  };
}

function parsePetData(raw) {
  if (!raw) return { activePetId: null, collection: {}, ownedItems: [] };
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return { activePetId: null, collection: {}, ownedItems: [] }; }
  }
  return { ...raw };
}

/**
 * Cấp pet khởi đầu cho người mới nhận thiệp mời (chọn Cowdi hoặc Quay pet).
 */
export async function claimInviteStarter({ userId, code, starterChoice = 'cowdi', db = pool }) {
  await ensureGachaSchema(db);
  const choice = starterChoice === 'pull' ? 'pull' : 'cowdi';

  const [[prog]] = await db.execute(
    'SELECT pet_data FROM user_progress WHERE user_id = ?',
    [userId]
  );
  const petData = parsePetData(prog?.pet_data);
  if (!petData.collection || typeof petData.collection !== 'object') {
    petData.collection = {};
  }

  let speciesId = 'cowdi';
  let rarity = 'starter';
  let label = 'Cowdi';

  if (choice === 'pull') {
    const rolled = rollStarterPet();
    speciesId = rolled.speciesId;
    rarity = rolled.rarity;
    label = rolled.label;
  }

  const { instanceId, pet } = buildNewPetInstance(
    speciesId,
    choice === 'pull' ? 'starter_pull' : 'starter'
  );
  if (choice === 'cowdi') {
    pet.customName = 'Cowdi';
    if (!Array.isArray(petData.ownedItems)) petData.ownedItems = [];
    if (!petData.ownedItems.includes(GACHA_CONFIG.FIRST_FRIEND_SCARF_ID)) {
      petData.ownedItems.push(GACHA_CONFIG.FIRST_FRIEND_SCARF_ID);
    }
  }

  petData.collection[instanceId] = pet;
  petData.activePetId = instanceId;

  if (prog) {
    await db.execute(
      'UPDATE user_progress SET pet_data = ? WHERE user_id = ?',
      [JSON.stringify(petData), userId]
    );
  } else {
    await db.execute(
      'INSERT INTO user_progress (user_id, pet_data) VALUES (?, ?)',
      [userId, JSON.stringify(petData)]
    );
  }

  await db.execute(
    'UPDATE invites SET starter_choice = ?, starter_species = ? WHERE code = ?',
    [choice, speciesId, code]
  );

  if (choice === 'pull') {
    await db.execute(
      `INSERT INTO gacha_history (user_id, pool_type, tier, reward_type, reward_id, reward_amount, is_duplicate)
       VALUES (?, 'starter_pull', ?, 'pet', ?, 1, 0)`,
      [userId, rarity, speciesId]
    ).catch(() => {});
  }

  return {
    choice,
    speciesId,
    rarity,
    label,
    instanceId,
    pet,
    accessoryGranted: choice === 'cowdi' ? GACHA_CONFIG.FIRST_FRIEND_SCARF_NAME : null,
  };
}

/**
 * Mua 1 vé Gacha (50 Gem) qua ledger trong transaction.
 */
export async function buyGachaTicket(userId, db = pool) {
  await ensureGachaSchema(db);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const wallet = await getWallet(userId, conn);
    if (wallet.gem < GACHA_CONFIG.TICKET_PRICE_GEM) {
      await conn.rollback();
      return { ok: false, error: `Không đủ Gem (cần ${GACHA_CONFIG.TICKET_PRICE_GEM} Gem).`, wallet };
    }
    const refId = makeRefId('buy');
    await conn.execute(
      `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'gem', ?, 'gacha_ticket_purchase', ?)`,
      [userId, -GACHA_CONFIG.TICKET_PRICE_GEM, refId]
    );
    await conn.execute(
      `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'gacha_ticket', 1, 'gacha_ticket_purchase', ?)`,
      [userId, refId]
    );
    await conn.commit();
    const updatedWallet = await getWallet(userId, db);
    return { ok: true, wallet: updatedWallet };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Quay 1 lượt Gacha thường (tốn 1 gacha_ticket).
 */
export async function pullStandardGacha(userId, db = pool) {
  await ensureGachaSchema(db);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const wallet = await getWallet(userId, conn);
    if (wallet.gacha_ticket < 1) {
      await conn.rollback();
      return { ok: false, error: 'Bạn đã hết vé Gacha! Hãy mua thêm bằng 50 Gem hoặc làm nhiệm vụ.', wallet };
    }

    const [[prog]] = await conn.execute(
      'SELECT pet_data, streak_shields FROM user_progress WHERE user_id = ? FOR UPDATE',
      [userId]
    );
    const petData = parsePetData(prog?.pet_data);
    const ownedSpecies = new Set(
      Object.values(petData.collection || {}).map((p) => p?.speciesId).filter(Boolean)
    );
    const streakShields = Number(prog?.streak_shields || 0);

    const outcome = rollStandardGachaOutcome({
      ownedPetSpecies: ownedSpecies,
      streakShields,
    });

    const refId = makeRefId('pull');
    // Trừ 1 vé gacha
    await conn.execute(
      `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'gacha_ticket', -1, 'gacha_pull', ?)`,
      [userId, refId]
    );

    let grantedPet = null;
    if (outcome.rewardType === 'milk') {
      await conn.execute(
        `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'milk', ?, 'gacha_pull', ?)`,
        [userId, outcome.amount, refId]
      );
    } else if (outcome.rewardType === 'stone_shard') {
      await conn.execute(
        `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'stone_shard', ?, 'gacha_pull', ?)`,
        [userId, outcome.amount, refId]
      );
    } else if (outcome.rewardType === 'gem') {
      await conn.execute(
        `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'gem', ?, 'gacha_duplicate', ?)`,
        [userId, outcome.amount, refId]
      );
    } else if (outcome.rewardType === 'arena_ticket') {
      await conn.execute(
        `INSERT INTO arena_profiles (user_id, tickets) VALUES (?, LEAST(15, 3 + ?))
         ON DUPLICATE KEY UPDATE tickets = LEAST(15, tickets + ?)`,
        [userId, outcome.amount, outcome.amount]
      );
    } else if (outcome.rewardType === 'streak_shield') {
      await conn.execute(
        'UPDATE user_progress SET streak_shields = LEAST(2, COALESCE(streak_shields, 0) + 1) WHERE user_id = ?',
        [userId]
      );
    } else if (outcome.rewardType === 'pet') {
      const { instanceId, pet } = buildNewPetInstance(outcome.rewardId, 'gacha');
      if (!petData.collection) petData.collection = {};
      petData.collection[instanceId] = pet;
      if (!petData.activePetId) petData.activePetId = instanceId;
      grantedPet = pet;
      await conn.execute(
        'UPDATE user_progress SET pet_data = ? WHERE user_id = ?',
        [JSON.stringify(petData), userId]
      );
    }

    await conn.execute(
      `INSERT INTO gacha_history (user_id, pool_type, tier, reward_type, reward_id, reward_amount, is_duplicate)
       VALUES (?, 'standard', ?, ?, ?, ?, ?)`,
      [userId, outcome.tier, outcome.rewardType, outcome.rewardId, outcome.amount, outcome.isDuplicate ? 1 : 0]
    );

    await conn.commit();
    const updatedWallet = await getWallet(userId, db);
    return {
      ok: true,
      outcome,
      grantedPet,
      wallet: updatedWallet,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Lấy thông tin Gacha: ví, bảng tỉ lệ công khai, danh sách pet đủ 5 ảnh và lịch sử 100 lượt.
 */
export async function getGachaInfo(userId, db = pool) {
  await ensureGachaSchema(db);
  const wallet = await getWallet(userId, db);
  const [history] = await db.execute(
    `SELECT id, pool_type, tier, reward_type, reward_id, reward_amount, is_duplicate, created_at
       FROM gacha_history
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT ?`,
    [userId, GACHA_CONFIG.HISTORY_LIMIT]
  );

  return {
    wallet,
    ticketPriceGem: GACHA_CONFIG.TICKET_PRICE_GEM,
    hasPity: GACHA_CONFIG.HAS_PITY,
    standardRates: GACHA_CONFIG.STANDARD_RATES,
    starterRates: GACHA_CONFIG.STARTER_POOL_RATES,
    pools: getGachaPetPools(),
    starterPools: getStarterPool(),
    incompleteImagePets: GACHA_CONFIG.INCOMPLETE_IMAGE_PETS,
    history,
  };
}
