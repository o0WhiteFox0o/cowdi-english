-- ============================================================
--  Migration: thêm cột daily_journal cho user_progress
--  Dùng để lưu nhật ký học mỗi ngày (date → counters).
--  Idempotent — chạy lại an toàn.
-- ============================================================

USE cowdi_english;

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'cowdi_english'
    AND TABLE_NAME   = 'user_progress'
    AND COLUMN_NAME  = 'daily_journal'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE user_progress ADD COLUMN daily_journal LONGTEXT DEFAULT NULL COMMENT ''Nhật ký theo ngày: { YYYY-MM-DD: { lessons, quizzes, ... } }''',
  'SELECT ''column daily_journal exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
