-- ============================================================
--  Cowdi English – Lộ trình 3 nhóm (Mới học · Trung bình · Luyện thi)
--  Tương thích MySQL 5.5 / 5.6+ (chỉ dùng LONGTEXT, không dùng USE <db>;)
--  Idempotent — chạy lại an toàn, không làm mất dữ liệu người dùng.
-- ============================================================

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

CALL cowdi_add_col_if_missing('user_progress', 'learner_group', 'VARCHAR(16) DEFAULT NULL');
CALL cowdi_add_col_if_missing('user_progress', 'active_path',   'VARCHAR(32) DEFAULT NULL');
CALL cowdi_add_col_if_missing('user_progress', 'lesson_scores', 'LONGTEXT DEFAULT NULL COMMENT ''JSON {lessonId: 0-100}''');
CALL cowdi_add_col_if_missing('user_progress', 'placement',     'LONGTEXT DEFAULT NULL COMMENT ''JSON kết quả kiểm tra đầu vào''');

DROP PROCEDURE cowdi_add_col_if_missing;
