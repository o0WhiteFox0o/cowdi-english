-- ============================================================
--  Migration: Study Schedule (lịch học do user tự đặt)
--  Idempotent — chạy lại an toàn
--  Áp dụng:  mysql -u root -p cowdi_english < migrate-schedule.sql
-- ============================================================

USE cowdi_english;

-- ── Bảng lưu lịch học ──────────────────────────────────────
-- Mỗi user có 1 dòng (UNIQUE user_id). days_of_week là JSON
-- mảng [0..6] (0=CN, 1=T2 … 6=T7) để dễ hiển thị trong UI.
-- time_local = giờ user chọn theo TIMEZONE của họ; TZ lưu IANA
-- (vd "Asia/Ho_Chi_Minh") để job cron quy chiếu đúng.
CREATE TABLE IF NOT EXISTS study_schedules (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  enabled       TINYINT(1)   NOT NULL DEFAULT 1,
  days_of_week  VARCHAR(64)  NOT NULL DEFAULT '[1,2,3,4,5]'  COMMENT 'JSON array 0..6, 0=Sun',
  time_local    CHAR(5)      NOT NULL DEFAULT '19:00'        COMMENT 'HH:MM 24h',
  timezone      VARCHAR(64)  NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  message       VARCHAR(200) DEFAULT NULL                    COMMENT 'Lời nhắc tuỳ chỉnh (optional)',
  last_fired_at DATETIME     DEFAULT NULL                    COMMENT 'Lần gửi push gần nhất (UTC)',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT NULL                    COMMENT 'Lần sửa gần nhất (app tự set)',
  CONSTRAINT fk_schedule_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user (user_id),
  INDEX idx_enabled_time (enabled, time_local)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
