// ============================================================
// Cowdi English — Server Wallet & Ledger Service (Kinh tế v2)
// Quản lý Sữa, Gem, Đá, Mảnh đá nguyên tố qua wallet_ledger.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../config/database.js';
import { ECONOMY } from '../../shared/game-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedDir = path.resolve(__dirname, '../../shared');

// Tải danh sách bài học và unit hợp lệ để chống gian lận
let validLessonIdsSet = new Set();
let validUnitsList = [];
try {
  const lessonIdsRaw = fs.readFileSync(path.join(sharedDir, 'lesson-ids.json'), 'utf8');
  validLessonIdsSet = new Set(JSON.parse(lessonIdsRaw));
  const unitsRaw = fs.readFileSync(path.join(sharedDir, 'units.json'), 'utf8');
  validUnitsList = JSON.parse(unitsRaw);
} catch (err) {
  console.warn('[wallet] Could not load lesson-ids.json or units.json:', err.message);
}

/**
 * Trả về chuỗi định danh tuần ISO (YYYY-Www) để tính hạn mức theo tuần (reset 00:00 thứ Hai).
 */
export function getIsoWeekString(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Lấy số dư ví hiện tại của người dùng: { milk, gem, stone, stone_shard }.
 * - milk = total_xp - (tổng số Sữa đã tiêu trong ledger)
 * - gem, stone, stone_shard = SUM(amount) trong wallet_ledger
 */
export async function getWallet(userId, db = pool) {
  const [[progressRow]] = await db.execute(
    'SELECT total_xp FROM user_progress WHERE user_id = ?',
    [userId]
  );
  const totalXp = progressRow ? Number(progressRow.total_xp || 0) : 0;

  const [ledgerRows] = await db.execute(
    `SELECT currency, SUM(amount) AS total
     FROM wallet_ledger
     WHERE user_id = ?
     GROUP BY currency`,
    [userId]
  );

  const balances = {
    milk: 0,
    gem: 0,
    stone: 0,
    stone_shard: 0,
  };

  let milkDelta = 0;
  for (const row of ledgerRows) {
    const curr = row.currency;
    const total = Number(row.total || 0);
    if (curr === 'milk') {
      milkDelta = total; // thường là số âm (các khoản tiêu và legacy_spent)
    } else if (curr in balances) {
      balances[curr] = Math.max(0, total);
    }
  }

  balances.milk = Math.max(0, totalXp + milkDelta);

  return balances;
}

/**
 * Cấp Gem và Đá nguyên tố khi hoàn thành bài mới và theo unit (D2).
 * Chống cấp trùng lặp nhờ ràng buộc UNIQUE KEY uq_grant (user_id, currency, reason, ref_id).
 */
export async function grantLessonAndUnitRewards(userId, completedLessons = [], checkpointScores = {}, lessonScores = {}, db = pool) {
  if (!Array.isArray(completedLessons) || completedLessons.length === 0) {
    return getWallet(userId, db);
  }

  // 1. Lọc các bài học hợp lệ trong danh mục chính thức
  const validCompleted = completedLessons.filter((id) => validLessonIdsSet.has(id));
  const validCount = validCompleted.length;
  const completedSet = new Set(validCompleted);

  const gemMilestones = Math.floor(validCount / (ECONOMY.GEM_PER_NEW_LESSONS || 2));
  const stoneMilestones = Math.floor(validCount / (ECONOMY.STONE_PER_NEW_LESSONS || 10));

  // Ghi mốc Gem bài học
  for (let k = 1; k <= gemMilestones; k++) {
    await db.execute(
      `INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'gem', 1, 'lesson_milestone', ?)`,
      [userId, `gem:${k}`]
    );
  }

  // Ghi mốc Đá nguyên tố bài học
  for (let k = 1; k <= stoneMilestones; k++) {
    await db.execute(
      `INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'stone', 1, 'lesson_milestone', ?)`,
      [userId, `stone:${k}`]
    );
  }

  // 2. Thưởng Gem theo unit (D2, D11)
  for (const unit of validUnitsList) {
    const allLessonsDone = Array.isArray(unit.lessons) &&
      unit.lessons.length > 0 &&
      unit.lessons.every((id) => completedSet.has(id));

    if (!allLessonsDone) continue;

    // a) Hoàn thành unit -> +1 Gem
    await db.execute(
      `INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'gem', ?, 'unit_complete', ?)`,
      [userId, ECONOMY.GEM_PER_UNIT || 1, unit.unitId]
    );

    // b) Hoàn thành 100% unit -> thêm +2 Gem
    // Điều kiện: mọi bài học trong unit đều có điểm tuyệt đối (score >= 100 hoặc 1.0)
    // và bài checkpoint (nếu có) đạt 100% hoặc passed
    let isPerfect = true;
    for (const lessonId of unit.lessons) {
      const score = lessonScores[lessonId];
      if (score === undefined || score < 100) {
        // Nếu không có thông tin chi tiết quiz score thì không tính 100%
        isPerfect = false;
        break;
      }
    }

    if (isPerfect && unit.hasCheckpoint) {
      const cp = checkpointScores[unit.unitId];
      const cpScore = cp?.score;
      if (!cp || (cpScore !== undefined && cpScore < 100 && cpScore < 1.0) || !cp.passed) {
        isPerfect = false;
      }
    }

    if (isPerfect) {
      await db.execute(
        `INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'gem', ?, 'unit_perfect', ?)`,
        [userId, ECONOMY.GEM_PER_UNIT_PERFECT || 2, unit.unitId]
      );
    }
  }

  return getWallet(userId, db);
}

/**
 * Đổi 15 Gem lấy 1 Đá nguyên tố (D3), tối đa 1 lần / tuần (reset thứ Hai).
 */
export async function exchangeStone(userId, db = pool) {
  const weekRef = getIsoWeekString();

  // Kiểm tra đã đổi tuần này chưa
  const [[existing]] = await db.execute(
    `SELECT id FROM wallet_ledger
     WHERE user_id = ? AND reason = 'stone_exchange' AND ref_id = ?`,
    [userId, weekRef]
  );
  if (existing) {
    return { ok: false, error: 'Bạn đã đạt giới hạn đổi 1 đá / tuần. Vui lòng quay lại vào tuần sau!' };
  }

  const wallet = await getWallet(userId, db);
  const gemCost = ECONOMY.GEM_PER_STONE || 15;
  if (wallet.gem < gemCost) {
    return { ok: false, error: `Bạn cần ${gemCost} Gem để đổi 1 Đá nguyên tố (hiện có: ${wallet.gem} Gem).` };
  }

  // Thực hiện giao dịch đổi đá
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Trừ Gem
    await conn.execute(
      `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'gem', ?, 'stone_exchange', ?)`,
      [userId, -gemCost, weekRef]
    );

    // Cộng Đá
    await conn.execute(
      `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'stone', 1, 'stone_exchange', ?)`,
      [userId, 1, weekRef]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const updatedWallet = await getWallet(userId, db);
  return { ok: true, wallet: updatedWallet };
}

/**
 * Ghép 10 Mảnh đá nguyên tố thành 1 Đá nguyên tố.
 */
export async function combineShards(userId, db = pool) {
  const shardCost = ECONOMY.SHARDS_PER_STONE || 10;
  const wallet = await getWallet(userId, db);
  if (wallet.stone_shard < shardCost) {
    return { ok: false, error: `Bạn cần ${shardCost} Mảnh đá để ghép thành 1 Đá nguyên tố (hiện có: ${wallet.stone_shard} mảnh).` };
  }

  const timestampRef = Date.now().toString();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Trừ mảnh
    await conn.execute(
      `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'stone_shard', ?, 'shard_combine', ?)`,
      [userId, -shardCost, timestampRef]
    );

    // Cộng Đá
    await conn.execute(
      `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'stone', 1, 'shard_combine', ?)`,
      [userId, 1, timestampRef]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const updatedWallet = await getWallet(userId, db);
  return { ok: true, wallet: updatedWallet };
}
