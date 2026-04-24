-- ============================================================
--  Cowdi English – Duel v2 Migration
--  Thêm: category, message, per-question times
--  Chạy 1 lần: mysql -u root -p cowdi_english < migrate-duel-v2.sql
--  An toàn chạy lại (idempotent).
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

-- ── Thêm các cột mới vào bảng challenges ─────────────────────
CALL cowdi_add_col_if_missing('challenges', 'category',
  'VARCHAR(30) DEFAULT ''all'' COMMENT ''Chủ đề: all|vocabulary|grammar|sentences|listening''');
CALL cowdi_add_col_if_missing('challenges', 'message',
  'VARCHAR(280) DEFAULT NULL COMMENT ''Lời nhắn thách đấu (tuỳ chọn)''');
CALL cowdi_add_col_if_missing('challenges', 'challenger_question_times',
  'LONGTEXT DEFAULT NULL COMMENT ''JSON: [s1,s2,...] thời gian trả lời từng câu (giây)''');
CALL cowdi_add_col_if_missing('challenges', 'opponent_question_times',
  'LONGTEXT DEFAULT NULL COMMENT ''JSON: thời gian trả lời từng câu của đối thủ''');

DROP PROCEDURE cowdi_add_col_if_missing;
