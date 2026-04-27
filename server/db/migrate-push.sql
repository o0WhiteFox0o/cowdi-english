-- ============================================================
--  Migration: Push Notification + Background Sync support
--  Idempotent — chạy lại an toàn
--  Áp dụng:  mysql -u root -p cowdi_english < migrate-push.sql
-- ============================================================

USE cowdi_english;

-- ── Bảng lưu Push Subscription của user ────────────────────
-- Mỗi user có thể có nhiều thiết bị (mobile, desktop, tablet)
-- Note: endpoint(191) là giới hạn an toàn cho UNIQUE KEY trên utf8mb4
--       với MySQL/MariaDB cũ (innodb_large_prefix=OFF). 191*4 = 764 < 767.
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED    NOT NULL,
  endpoint    VARCHAR(500)    NOT NULL,
  p256dh      VARCHAR(255)    NOT NULL COMMENT 'Public key encryption',
  auth_key    VARCHAR(255)    NOT NULL COMMENT 'Auth secret',
  user_agent  VARCHAR(255)    DEFAULT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used   TIMESTAMP       NULL DEFAULT NULL,
  CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_endpoint (endpoint(191)),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ── Cờ user opt-in nhận thông báo (mặc định OFF) ───────────
-- Add column nếu chưa có
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'cowdi_english'
    AND TABLE_NAME = 'user_progress'
    AND COLUMN_NAME = 'push_enabled'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE user_progress ADD COLUMN push_enabled TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''Cờ user bật/tắt push''',
  'SELECT ''column push_enabled exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ── Cờ thời điểm streak reminder gửi gần nhất (chống spam) ─
SET @col_exists2 := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'cowdi_english'
    AND TABLE_NAME = 'user_progress'
    AND COLUMN_NAME = 'last_reminder_at'
);
SET @sql2 := IF(@col_exists2 = 0,
  'ALTER TABLE user_progress ADD COLUMN last_reminder_at DATETIME DEFAULT NULL COMMENT ''Thời điểm gửi streak reminder gần nhất''',
  'SELECT ''column last_reminder_at exists'' AS msg'
);
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
