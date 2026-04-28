-- ============================================================
--  Cowdi English – Admin & Community Analytics migration
--  mysql -u root -p cowdi_english < migrate-admin.sql
-- ============================================================

USE cowdi_english;

-- ── Cột is_admin trên users (an toàn cho mọi version MySQL/MariaDB) ──
DROP PROCEDURE IF EXISTS _add_is_admin;
DELIMITER $$
CREATE PROCEDURE _add_is_admin()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME   = 'users'
       AND COLUMN_NAME  = 'is_admin'
  ) THEN
    ALTER TABLE users
      ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0
        COMMENT 'Co quyen quan tri (1 = admin)';
  END IF;
END$$
DELIMITER ;
CALL _add_is_admin();
DROP PROCEDURE _add_is_admin;

-- ── Bảng lưu lượng truy cập theo ngày (1 dòng / user / ngày) ──
CREATE TABLE IF NOT EXISTS daily_traffic (
  user_id     INT UNSIGNED NOT NULL,
  date        DATE         NOT NULL,
  hits        INT UNSIGNED NOT NULL DEFAULT 1,
  last_hit_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, date),
  INDEX idx_date (date),
  CONSTRAINT fk_traffic_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Để cấp quyền admin cho 1 user, chạy: ───────────────────
--   UPDATE users SET is_admin = 1 WHERE email = 'your@email.com';
