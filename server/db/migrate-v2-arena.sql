-- ============================================================
--  Cowdi English – Kinh tế v2: Đấu trường (GĐ5 · D4, D15, D16, D17)
--  Chạy 1 lần trên database cowdi_english:
--  mysql -u root -p cowdi_english < server/db/migrate-v2-arena.sql
--  Idempotent — chạy lại an toàn, tương thích MySQL 5.6+.
-- ============================================================

-- ── 1. Bảng arena_profiles (Hồ sơ xếp hạng & Vé đấu của người chơi) ──
CREATE TABLE IF NOT EXISTS arena_profiles (
  user_id                INT UNSIGNED NOT NULL PRIMARY KEY,
  tickets                INT NOT NULL DEFAULT 3 COMMENT 'Số vé đấu hiện tại (max 15)',
  lp                     INT NOT NULL DEFAULT 0 COMMENT 'Điểm xếp hạng League Points',
  tier                   VARCHAR(32) NOT NULL DEFAULT 'bronze' COMMENT 'Bậc: bronze|silver|gold|platinum|diamond|master',
  wins_this_week         INT NOT NULL DEFAULT 0 COMMENT 'Số trận thắng có vé trong tuần',
  claimed_weekly_chests  VARCHAR(255) NOT NULL DEFAULT '[]' COMMENT 'JSON array các ID rương tuần đã nhận (bronze, silver, gold)',
  last_ticket_refill     DATE DEFAULT NULL COMMENT 'Ngày cấp 3 vé miễn phí gần nhất',
  last_weekly_reset      DATE DEFAULT NULL COMMENT 'Ngày reset tuần gần nhất',
  season_id              VARCHAR(32) NOT NULL DEFAULT 'season_1',
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_arena_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Bảng arena_matches (Lịch sử các trận Đấu trường v2) ────
CREATE TABLE IF NOT EXISTS arena_matches (
  id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  challenger_id        INT UNSIGNED NOT NULL,
  opponent_id          INT UNSIGNED NULL COMMENT 'NULL nếu là bot AI luyện tập',
  is_bot               TINYINT(1) NOT NULL DEFAULT 0,
  has_ticket           TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = đấu xếp hạng có vé, 0 = tự do',
  winner               VARCHAR(32) NOT NULL COMMENT 'challenger | opponent | draw',
  challenger_score     INT NOT NULL DEFAULT 0,
  opponent_score       INT NOT NULL DEFAULT 0,
  challenger_lp_delta  INT NOT NULL DEFAULT 0,
  opponent_lp_delta    INT NOT NULL DEFAULT 0,
  reward_milk          INT NOT NULL DEFAULT 0 COMMENT 'Sữa thưởng qua ledger cho challenger',
  season_id            VARCHAR(32) NOT NULL DEFAULT 'season_1',
  battle_log           MEDIUMTEXT NULL COMMENT 'JSON: diễn biến chi tiết trận đấu và hàng đợi trigger v0.2',
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_challenger_date (challenger_id, created_at),
  INDEX idx_opponent_date (opponent_id, created_at),
  INDEX idx_season_lp (season_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 3. Bảng arena_clovers (Tặng cỏ ba lá sau trận) ─────────────
CREATE TABLE IF NOT EXISTS arena_clovers (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  sent_date   DATE NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sender_receiver_date (sender_id, receiver_id, sent_date),
  INDEX idx_receiver_date (receiver_id, sent_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
