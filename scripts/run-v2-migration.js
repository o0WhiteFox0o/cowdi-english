import pool from '../server/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { grantLessonAndUnitRewards, getWallet } from '../server/utils/wallet.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('--- BẮT ĐẦU MIGRATION KINH TẾ V2 & BỎ COINS ---');

  // 1. Tạo bảng wallet_ledger
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS wallet_ledger (
      id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id     INT UNSIGNED NOT NULL,
      currency    ENUM('milk','gem','stone','stone_shard') NOT NULL,
      amount      INT NOT NULL COMMENT 'dương = nhận, âm = tiêu',
      reason      VARCHAR(40) NOT NULL COMMENT 'lesson_first, lesson_milestone, unit_complete, unit_perfect, stone_exchange, shard_combine, evolve, coin_migration, purchase, migration, admin…',
      ref_id      VARCHAR(64) DEFAULT NULL COMMENT 'lessonId, unitId, petInstanceId, orderId…',
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_currency (user_id, currency),
      UNIQUE KEY uq_grant (user_id, currency, reason, ref_id),
      CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await pool.query(createTableSql);
  console.log('✓ Bảng wallet_ledger đã sẵn sàng.');

  // 2. Đảm bảo cột available_xp tồn tại trên user_progress rồi di trú legacy_spent Sữa
  const [availCol] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_progress' AND COLUMN_NAME = 'available_xp'`
  );
  if (availCol.length === 0) {
    await pool.query(
      `ALTER TABLE user_progress ADD COLUMN available_xp INT UNSIGNED NOT NULL DEFAULT 0 AFTER total_xp`
    );
    await pool.query(
      `UPDATE user_progress SET available_xp = total_xp WHERE available_xp = 0 AND total_xp > 0`
    );
    console.log('✓ Đã bổ sung cột available_xp vào user_progress.');
  }

  const legacySpentSql = `
    INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
    SELECT
      user_id,
      'milk',
      -(CAST(total_xp AS SIGNED) - CAST(available_xp AS SIGNED)),
      'migration',
      'legacy_spent'
    FROM user_progress
    WHERE CAST(total_xp AS SIGNED) > CAST(available_xp AS SIGNED)
      AND (CAST(total_xp AS SIGNED) - CAST(available_xp AS SIGNED)) > 0;
  `;
  const [resSpent] = await pool.query(legacySpentSql);
  console.log('✓ Di trú legacy_spent Sữa:', resSpent.affectedRows, 'hàng bị ảnh hưởng.');

  // 3. Di trú Coins → Sữa (1 coin = 3 Sữa, D12) — parse JSON bằng Node để tương thích cả MySQL 5.6+
  const [petRows] = await pool.query(
    'SELECT user_id, pet_data FROM user_progress WHERE pet_data IS NOT NULL'
  );
  let coinsMigrated = 0;
  for (const row of petRows) {
    let petData = null;
    try {
      petData = typeof row.pet_data === 'string' ? JSON.parse(row.pet_data) : row.pet_data;
      if (typeof petData === 'string') petData = JSON.parse(petData);
    } catch {
      petData = null;
    }
    const coins = Math.floor(Number(petData?.coins) || 0);
    if (coins > 0) {
      const [resCoins] = await pool.query(
        `INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'milk', ?, 'coin_migration', 'v2_drop_coins')`,
        [row.user_id, coins * 3]
      );
      coinsMigrated += resCoins.affectedRows || 0;
    }
  }
  console.log('✓ Di trú Coins → Sữa (x3):', coinsMigrated, 'hàng bị ảnh hưởng.');

  // 2. Thêm các cột cho Duel v2 nếu bảng challenges chưa có
  const duelCols = [
    ['challenger_pet_snapshot', 'LONGTEXT DEFAULT NULL COMMENT \'JSON: snapshot pet của challenger\''],
    ['opponent_pet_snapshot', 'LONGTEXT DEFAULT NULL COMMENT \'JSON: snapshot pet của opponent\''],
    ['battle_log', 'LONGTEXT DEFAULT NULL COMMENT \'JSON: log chi tiết từng đòn của trận đấu\''],
    ['challenger_hp_pct', 'DECIMAL(5,2) DEFAULT NULL COMMENT \'% HP còn lại của challenger\''],
    ['opponent_hp_pct', 'DECIMAL(5,2) DEFAULT NULL COMMENT \'% HP còn lại của opponent\''],
    ['challenger_question_times', 'LONGTEXT DEFAULT NULL COMMENT \'JSON: thời gian trả lời của challenger\''],
    ['opponent_question_times', 'LONGTEXT DEFAULT NULL COMMENT \'JSON: thời gian trả lời của opponent\''],
  ];

  for (const [col, colDef] of duelCols) {
    try {
      const [colCheck] = await pool.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'challenges' AND COLUMN_NAME = ?`,
        [col]
      );
      if (colCheck.length === 0) {
        await pool.query(`ALTER TABLE challenges ADD COLUMN ${col} ${colDef}`);
        console.log(`✓ Đã thêm cột ${col} vào bảng challenges`);
      }
    } catch (err) {
      console.warn(`Bỏ qua cột ${col}:`, err.message);
    }
  }

  // 3. Cấp hồi tố Gem và Đá cho tất cả người dùng hiện có theo completed_lessons & unit (D2, D11)
  const [cpCol] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_progress' AND COLUMN_NAME = 'checkpoint_scores'`
  );
  const selectSql =
    cpCol.length > 0
      ? 'SELECT user_id, completed_lessons, checkpoint_scores FROM user_progress'
      : 'SELECT user_id, completed_lessons, NULL AS checkpoint_scores FROM user_progress';
  const [users] = await pool.query(selectSql);
  console.log(`Đang quét ${users.length} người dùng để cấp Gem & Đá hồi tố...`);

  let countMigrated = 0;
  for (const u of users) {
    try {
      let completedLessons = [];
      try {
        completedLessons = typeof u.completed_lessons === 'string' ? JSON.parse(u.completed_lessons) : (u.completed_lessons || []);
        // Handle double-escaped or corrupted json strings if any
        if (typeof completedLessons === 'string') {
          completedLessons = JSON.parse(completedLessons);
        }
      } catch {
        completedLessons = [];
      }

      let checkpointScores = {};
      try {
        checkpointScores = typeof u.checkpoint_scores === 'string' ? JSON.parse(u.checkpoint_scores) : (u.checkpoint_scores || {});
        if (typeof checkpointScores === 'string') {
          checkpointScores = JSON.parse(checkpointScores);
        }
      } catch {
        checkpointScores = {};
      }

      if (Array.isArray(completedLessons) && completedLessons.length > 0) {
        await grantLessonAndUnitRewards(u.user_id, completedLessons, checkpointScores, {});
      }

      const wallet = await getWallet(u.user_id);
      countMigrated++;
      if (countMigrated <= 5) {
        console.log(`User ${u.user_id}: ví sau migration -> Sữa: ${wallet.milk}, Gem: ${wallet.gem}, Đá: ${wallet.stone}`);
      }
    } catch (err) {
      console.error(`Lỗi cấp thưởng cho user ${u.user_id}:`, err.message);
    }
  }

  console.log(`--- HOÀN TẤT MIGRATION CHO ${countMigrated} NGƯỜI DÙNG ---`);
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Migration thất bại:', err);
  process.exit(1);
});
