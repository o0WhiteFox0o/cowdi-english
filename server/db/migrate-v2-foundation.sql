-- ============================================================
--  Cowdi English – Kinh tế & Chiến đấu v2: Nền tảng (GĐ1)
--  Chạy 1 lần trên database cowdi_english:
--  mysql -u root -p cowdi_english < server/db/migrate-v2-foundation.sql
--  Idempotent — chạy lại an toàn, không làm mất/trùng dữ liệu.
-- ============================================================

USE cowdi_english;

-- Helper: thêm cột nếu chưa có
DROP PROCEDURE IF EXISTS cowdi_add_col_if_missing;
DELIMITER $$
CREATE PROCEDURE cowdi_add_col_if_missing(
  IN tbl VARCHAR(64),
  IN col VARCHAR(64),
  IN col_def TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = tbl
       AND COLUMN_NAME = col
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE ', tbl, ' ADD COLUMN ', col, ' ', col_def);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

-- ── 1. Bảng wallet_ledger ────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_ledger (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  currency    ENUM('milk','gem','stone','stone_shard') NOT NULL,
  amount      INT NOT NULL COMMENT 'dương = nhận, âm = tiêu',
  reason      VARCHAR(40) NOT NULL COMMENT 'lesson_first, lesson_milestone, unit_complete, unit_perfect, stone_exchange, shard_combine, evolve, purchase, migration, admin…',
  ref_id      VARCHAR(64) DEFAULT NULL COMMENT 'lessonId, unitId, petInstanceId, orderId…',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_currency (user_id, currency),
  UNIQUE KEY uq_grant (user_id, currency, reason, ref_id),
  CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Thêm các cột cho Duel v2 vào bảng challenges ──────────
CALL cowdi_add_col_if_missing('challenges', 'challenger_pet_snapshot',
  'LONGTEXT DEFAULT NULL COMMENT ''JSON: snapshot pet của challenger (speciesId, evolution, skills, element, group, rarity)''');
CALL cowdi_add_col_if_missing('challenges', 'opponent_pet_snapshot',
  'LONGTEXT DEFAULT NULL COMMENT ''JSON: snapshot pet của opponent lúc tham gia''');
CALL cowdi_add_col_if_missing('challenges', 'battle_log',
  'LONGTEXT DEFAULT NULL COMMENT ''JSON: log chi tiết từng đòn của trận đấu tính từ server''');
CALL cowdi_add_col_if_missing('challenges', 'challenger_hp_pct',
  'DECIMAL(5,2) DEFAULT NULL COMMENT ''% HP còn lại của challenger sau 10 câu''');
CALL cowdi_add_col_if_missing('challenges', 'opponent_hp_pct',
  'DECIMAL(5,2) DEFAULT NULL COMMENT ''% HP còn lại của opponent sau 10 câu''');
CALL cowdi_add_col_if_missing('challenges', 'challenger_question_times',
  'LONGTEXT DEFAULT NULL COMMENT ''JSON: [s1,s2,...] thời gian trả lời từng câu''');
CALL cowdi_add_col_if_missing('challenges', 'opponent_question_times',
  'LONGTEXT DEFAULT NULL COMMENT ''JSON: thời gian trả lời từng câu của đối thủ''');

DROP PROCEDURE cowdi_add_col_if_missing;

-- ── 3. Di trú Sữa người chơi cũ (idempotent qua uq_grant) ─────
-- Ghi nhận số Sữa đã tiêu trước v2: legacy_spent = total_xp - available_xp
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
