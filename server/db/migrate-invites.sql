-- ============================================================
--  Cowdi English – Invites (Friend Egg Gift) Migration
--  Chạy: mysql -u root -p cowdi_english < migrate-invites.sql
-- ============================================================

USE cowdi_english;

-- ── Bảng thiệp mời (Friend Egg Gift) ─────────────────────────
CREATE TABLE IF NOT EXISTS invites (
  code             VARCHAR(12)     NOT NULL PRIMARY KEY,
  sender_id        INT UNSIGNED    NOT NULL,
  sender_name      VARCHAR(255)    NOT NULL DEFAULT '',
  sender_avatar    TEXT,
  pet_species      VARCHAR(32)     NOT NULL DEFAULT 'cowdi',
  message          VARCHAR(280)    DEFAULT NULL,
  claimed_by       INT UNSIGNED    DEFAULT NULL,
  claimed_at       DATETIME        DEFAULT NULL,
  rewarded_sender  TINYINT(1)      NOT NULL DEFAULT 0,
  rewarded_at      DATETIME        DEFAULT NULL,
  created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at       DATETIME        NOT NULL,
  INDEX idx_invites_sender    (sender_id),
  INDEX idx_invites_claimed   (claimed_by),
  INDEX idx_invites_expires   (expires_at),
  CONSTRAINT fk_invite_sender  FOREIGN KEY (sender_id)  REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_invite_claimed FOREIGN KEY (claimed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
