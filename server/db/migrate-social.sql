-- ============================================================
--  Cowdi English – Social Features Migration
--  Chạy 1 lần trên database hiện có:
--  mysql -u root -p cowdi_english < migrate-social.sql
-- ============================================================

USE cowdi_english;

-- ── Bảng thách đấu (Pet Duel) ───────────────────────────────
CREATE TABLE IF NOT EXISTS challenges (
  id                INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  challenger_id     INT UNSIGNED    NOT NULL,
  opponent_id       INT UNSIGNED    DEFAULT NULL,
  status            ENUM('pending','completed','expired') NOT NULL DEFAULT 'pending',
  quiz_data         LONGTEXT        NOT NULL COMMENT 'Mảng câu hỏi: [{question, options, correct, category}]',
  challenger_answers LONGTEXT       DEFAULT NULL,
  challenger_score  INT UNSIGNED    DEFAULT 0,
  challenger_time   INT UNSIGNED    DEFAULT 0 COMMENT 'Thời gian (giây)',
  opponent_answers  LONGTEXT        DEFAULT NULL,
  opponent_score    INT UNSIGNED    DEFAULT 0,
  opponent_time     INT UNSIGNED    DEFAULT 0,
  winner_id         INT UNSIGNED    DEFAULT NULL,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at        DATETIME        NOT NULL,
  CONSTRAINT fk_chal_challenger FOREIGN KEY (challenger_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status_expires (status, expires_at),
  INDEX idx_challenger (challenger_id),
  INDEX idx_opponent (opponent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Thêm cột xếp hạng / đấu trường vào user_progress ──────
ALTER TABLE user_progress
  ADD COLUMN league_points INT UNSIGNED DEFAULT 0 AFTER nickname,
  ADD COLUMN duel_wins     INT UNSIGNED DEFAULT 0 AFTER league_points,
  ADD COLUMN duel_losses   INT UNSIGNED DEFAULT 0 AFTER duel_wins,
  ADD COLUMN duel_streak   INT UNSIGNED DEFAULT 0 AFTER duel_losses;
