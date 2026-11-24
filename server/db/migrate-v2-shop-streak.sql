-- ============================================================
-- Cowdi English — Migration Kinh tế v2: Giai đoạn 3 (Cửa hàng Giữ nhịp)
-- Tạo bảng user_streak_state và user_contracts
-- Chạy lại an toàn (idempotent)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_streak_state (
  user_id INT UNSIGNED NOT NULL PRIMARY KEY,
  current_streak INT UNSIGNED NOT NULL DEFAULT 0,
  best_streak INT UNSIGNED NOT NULL DEFAULT 0,
  last_active_date DATE DEFAULT NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  freeze_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  freezes_bought_this_week TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_freeze_week VARCHAR(10) DEFAULT NULL,
  broken_streak_count INT UNSIGNED NOT NULL DEFAULT 0,
  broken_at DATE DEFAULT NULL,
  return_ticket_active BOOLEAN NOT NULL DEFAULT FALSE,
  return_ticket_deadline DATETIME DEFAULT NULL,
  return_ticket_lessons_done TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_return_ticket_at DATETIME DEFAULT NULL,
  has_clock BOOLEAN NOT NULL DEFAULT FALSE,
  clock_hour TINYINT UNSIGNED DEFAULT NULL,
  clock_minute TINYINT UNSIGNED DEFAULT 0,
  clock_last_changed_week VARCHAR(10) DEFAULT NULL,
  today_clock_bonus_lessons TINYINT UNSIGNED NOT NULL DEFAULT 0,
  today_clock_bonus_date DATE DEFAULT NULL,
  created_at DATETIME DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_streak_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_contracts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  tier ENUM('starter', 'diligent', 'breakthrough') NOT NULL,
  deposit_amount INT UNSIGNED NOT NULL,
  target_lessons_per_day TINYINT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  days_completed TINYINT UNSIGNED NOT NULL DEFAULT 0,
  today_lessons_done TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_evaluated_date DATE DEFAULT NULL,
  status ENUM('active', 'completed', 'failed') NOT NULL DEFAULT 'active',
  payout_amount INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contracts_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
