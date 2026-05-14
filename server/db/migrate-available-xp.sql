-- ============================================================
--  Migration: thêm cột available_xp cho user_progress
--  Ví XP có thể tiêu để cho Pet ăn / tiến hóa.
--  Khởi tạo bằng total_xp để user cũ có thể tiêu toàn bộ XP đã tích.
--  Idempotent — chạy lại an toàn.
-- ============================================================

USE cowdi_english;

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'cowdi_english'
    AND TABLE_NAME   = 'user_progress'
    AND COLUMN_NAME  = 'available_xp'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE user_progress ADD COLUMN available_xp INT UNSIGNED NOT NULL DEFAULT 0 COMMENT ''Ví XP có thể tiêu để nuôi/tiến hóa Pet'' AFTER total_xp',
  'SELECT ''column available_xp exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill: user cũ → cấp available_xp = total_xp (1 lần)
UPDATE user_progress SET available_xp = total_xp WHERE available_xp = 0 AND total_xp > 0;
