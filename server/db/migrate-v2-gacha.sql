-- ============================================================
--  Cowdi English – Kinh tế v2: Lõi Gacha & Quay khởi đầu (GĐ6–GĐ7)
--  Idempotent — chạy lại an toàn, tương thích MySQL 5.5/5.6+.
-- ============================================================

-- ── 1. Bảng gacha_history (Lịch sử 100 lượt quay gần nhất/user) ──
CREATE TABLE IF NOT EXISTS gacha_history (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  pool_type     VARCHAR(32) NOT NULL DEFAULT 'standard' COMMENT 'standard | starter_pull',
  tier          VARCHAR(32) NOT NULL COMMENT 'common | rare | epic | event | legendary | limited',
  reward_type   VARCHAR(32) NOT NULL COMMENT 'pet | milk | arena_ticket | streak_shield | stone_shard | cosmetic | gem',
  reward_id     VARCHAR(64) DEFAULT NULL,
  reward_amount INT NOT NULL DEFAULT 1,
  is_duplicate  TINYINT(1) NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_gacha_user_time (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Mở rộng bảng invites: starter_choice, starter_species ────
-- Lưu ý: Chạy an toàn qua thủ tục kiểm tra INFORMATION_SCHEMA nếu cần,
-- hoặc ứng dụng tự đảm bảo cột qua ensureGachaSchema() khi khởi động.
SET @col_choice = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invites' AND COLUMN_NAME = 'starter_choice'
);
SET @sql_choice = IF(@col_choice = 0,
  'ALTER TABLE invites ADD COLUMN starter_choice VARCHAR(16) DEFAULT NULL COMMENT ''cowdi | pull''',
  'SELECT 1'
);
PREPARE stmt1 FROM @sql_choice;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @col_species = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invites' AND COLUMN_NAME = 'starter_species'
);
SET @sql_species = IF(@col_species = 0,
  'ALTER TABLE invites ADD COLUMN starter_species VARCHAR(32) DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt2 FROM @sql_species;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
