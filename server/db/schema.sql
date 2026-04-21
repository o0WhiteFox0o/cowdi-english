-- ============================================================
--  Cowdi English – Database Schema
--  Tương thích MySQL 5.5+
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
  email           VARCHAR(191)    NOT NULL UNIQUE,
  display_name    VARCHAR(255)    NOT NULL DEFAULT '',
  avatar_url      TEXT,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at    DATETIME        DEFAULT NULL,
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
  completed_lessons   LONGTEXT        DEFAULT NULL,
  word_status         LONGTEXT        DEFAULT NULL,
  active_days         LONGTEXT        DEFAULT NULL,
  achievements        LONGTEXT        DEFAULT NULL,
  daily_tasks         LONGTEXT        DEFAULT NULL,
  daily_date          VARCHAR(64)     DEFAULT NULL,
  srs_data            LONGTEXT        DEFAULT NULL COMMENT 'SRS SM-2 repetition data per word',
  checkpoint_scores   LONGTEXT        DEFAULT NULL COMMENT 'Learning path checkpoint scores per unit',
  skill_xp            LONGTEXT        DEFAULT NULL COMMENT 'User skill XP: listening/speaking/reading/writing',
  pet_data            LONGTEXT        DEFAULT NULL COMMENT 'Du lieu he thong pet (collection, coins, items...)',
  nickname            VARCHAR(20)     DEFAULT NULL COMMENT 'Nickname cho leaderboard',
  league_points       INT UNSIGNED    NOT NULL DEFAULT 0,
  duel_wins           INT UNSIGNED    NOT NULL DEFAULT 0,
  duel_losses         INT UNSIGNED    NOT NULL DEFAULT 0,
  duel_streak         INT UNSIGNED    NOT NULL DEFAULT 0,
  updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
