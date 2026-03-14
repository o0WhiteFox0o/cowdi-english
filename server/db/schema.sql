-- ============================================================
--  Cowdi English – Database Schema
--  Chạy file này 1 lần để tạo database + tables
--  mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS cowdi_english
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cowdi_english;

-- ── Bảng người dùng ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  google_sub      VARCHAR(128)    NOT NULL UNIQUE COMMENT 'Google immutable user ID',
  email           VARCHAR(255)    NOT NULL UNIQUE,
  display_name    VARCHAR(255)    NOT NULL DEFAULT '',
  avatar_url      TEXT,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_google_sub (google_sub),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Bảng tiến trình học ─────────────────────────────────────
-- Lưu toàn bộ state của useUser.jsx dưới dạng JSON để đồng bộ linh hoạt
CREATE TABLE IF NOT EXISTS user_progress (
  id                  INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED    NOT NULL UNIQUE,
  total_xp            INT UNSIGNED    NOT NULL DEFAULT 0,
  streak              INT UNSIGNED    NOT NULL DEFAULT 0,
  last_active_date    VARCHAR(64)     DEFAULT NULL,
  lessons_completed   INT UNSIGNED    NOT NULL DEFAULT 0,
  quizzes_completed   INT UNSIGNED    NOT NULL DEFAULT 0,
  perfect_quizzes     INT UNSIGNED    NOT NULL DEFAULT 0,
  words_learned       INT UNSIGNED    NOT NULL DEFAULT 0,
  completed_lessons   JSON            NOT NULL DEFAULT (JSON_ARRAY()),
  word_status         JSON            NOT NULL DEFAULT (JSON_OBJECT()),
  active_days         JSON            NOT NULL DEFAULT (JSON_ARRAY()),
  achievements        JSON            NOT NULL DEFAULT (JSON_ARRAY()),
  daily_tasks         JSON            NOT NULL DEFAULT (JSON_OBJECT('lessonDone', false, 'vocabDone', false)),
  daily_date          VARCHAR(64)     DEFAULT NULL,
  pet_data            JSON            DEFAULT NULL COMMENT 'Dữ liệu hệ thống pet (collection, coins, items...)',
  nickname            VARCHAR(20)     DEFAULT NULL COMMENT 'Nickname cho leaderboard',
  updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
