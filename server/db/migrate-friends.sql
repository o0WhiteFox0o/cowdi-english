-- ============================================================
--  Cowdi English – Phân hệ Bạn bè & Thưởng mời bạn (SRS-FRIENDS v1.1)
--  Tương thích MySQL 5.5 / 5.6+ và MySQL 8.0 (chạy lại an toàn, idempotent)
--  KHÔNG dùng USE <db>; KHÔNG dùng kiểu JSON; tối đa 1 TIMESTAMP auto / bảng.
--  Chạy: mysql -u root -p <ten_database> < server/db/migrate-friends.sql
--   hoặc: node scripts/run-friends-migration.js
-- ============================================================

-- Helper idempotent: thêm cột nếu chưa tồn tại
DROP PROCEDURE IF EXISTS cowdi_friends_add_col;
DELIMITER $$
CREATE PROCEDURE cowdi_friends_add_col(
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

-- Helper idempotent: thêm index nếu chưa tồn tại
DROP PROCEDURE IF EXISTS cowdi_friends_add_idx;
DELIMITER $$
CREATE PROCEDURE cowdi_friends_add_idx(
  IN tbl VARCHAR(64),
  IN idx_name VARCHAR(64),
  IN idx_ddl TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = tbl
       AND INDEX_NAME = idx_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE ', tbl, ' ADD ', idx_ddl);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

-- ── 1. Mở rộng bảng users ────────────────────────────────────
CALL cowdi_friends_add_col('users', 'friend_code', 'CHAR(8) DEFAULT NULL');
CALL cowdi_friends_add_col('users', 'nickname', 'VARCHAR(32) DEFAULT NULL');
CALL cowdi_friends_add_idx('users', 'uq_users_friend_code', 'UNIQUE INDEX uq_users_friend_code (friend_code)');

-- ── 2. Mở rộng bảng invites (chống gian lận IP/thiết bị) ────
CALL cowdi_friends_add_col('invites', 'creator_ip', 'VARCHAR(45) DEFAULT NULL');
CALL cowdi_friends_add_col('invites', 'creator_device_hash', 'CHAR(64) DEFAULT NULL');
CALL cowdi_friends_add_col('invites', 'claim_ip', 'VARCHAR(45) DEFAULT NULL');
CALL cowdi_friends_add_col('invites', 'claim_device_hash', 'CHAR(64) DEFAULT NULL');
CALL cowdi_friends_add_col('invites', 'flagged', 'TINYINT(1) NOT NULL DEFAULT 0');

-- ── 3. Mở rộng bảng challenges (thách đấu bạn bè không tính LP)
CALL cowdi_friends_add_col('challenges', 'is_friend_duel', 'TINYINT(1) NOT NULL DEFAULT 0');

-- ── 4. Mở rộng wallet_ledger.currency thêm gacha_ticket ──────
ALTER TABLE wallet_ledger
  MODIFY COLUMN currency ENUM('milk','gem','stone','stone_shard','gacha_ticket') NOT NULL;

DROP PROCEDURE cowdi_friends_add_col;
DROP PROCEDURE cowdi_friends_add_idx;

-- ── 5. Bảng friendships (user_low < user_high) ───────────────
CREATE TABLE IF NOT EXISTS friendships (
  user_low     INT UNSIGNED NOT NULL,
  user_high    INT UNSIGNED NOT NULL,
  status       ENUM('pending','accepted','blocked') NOT NULL,
  requested_by INT UNSIGNED NOT NULL,
  blocked_by   INT UNSIGNED DEFAULT NULL,
  source       ENUM('invite','code','qr') NOT NULL DEFAULT 'code',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accepted_at  DATETIME DEFAULT NULL,
  PRIMARY KEY (user_low, user_high),
  INDEX idx_friendships_high_status (user_high, status),
  INDEX idx_friendships_low_status (user_low, status),
  CONSTRAINT fk_friend_low  FOREIGN KEY (user_low)  REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_friend_high FOREIGN KEY (user_high) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 6. Bảng friend_reports ───────────────────────────────────
CREATE TABLE IF NOT EXISTS friend_reports (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT UNSIGNED NOT NULL,
  reported_id INT UNSIGNED NOT NULL,
  reason      VARCHAR(40) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  handled     TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_friend_reports_handled (handled, created_at),
  CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_report_reported FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 7. Bảng ghi ngày hoàn thành lần đầu mỗi bài (BR-01) ──────
CREATE TABLE IF NOT EXISTS user_lesson_first_completions (
  user_id        INT UNSIGNED NOT NULL,
  lesson_id      VARCHAR(64) NOT NULL,
  completed_date DATE NOT NULL COMMENT 'YYYY-MM-DD theo giờ Việt Nam (Asia/Ho_Chi_Minh)',
  completed_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id),
  INDEX idx_ulfc_user_date (user_id, completed_date),
  CONSTRAINT fk_ulfc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 8. Bảng hàng đợi vé gacha mốc mời bạn (BR-04: 3 vé/tháng)
CREATE TABLE IF NOT EXISTS invite_ticket_queue (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  milestone     INT UNSIGNED NOT NULL,
  ticket_index  TINYINT UNSIGNED NOT NULL COMMENT '1..N trong mốc',
  granted_month CHAR(7) DEFAULT NULL COMMENT 'YYYY-MM khi đã cấp; NULL = dời sang tháng sau',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  granted_at    DATETIME DEFAULT NULL,
  UNIQUE KEY uq_inv_ticket (user_id, milestone, ticket_index),
  INDEX idx_inv_ticket_pending (user_id, granted_month),
  CONSTRAINT fk_inv_ticket_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 9. Bảng thông báo 1 lần trong app cho thưởng mời (FR-RWD-05)
CREATE TABLE IF NOT EXISTS invite_notifications (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  kind       VARCHAR(32) NOT NULL COMMENT 'invite_activated | invite_welcome | invite_milestone',
  ref_id     VARCHAR(64) NOT NULL,
  payload    LONGTEXT NOT NULL COMMENT 'JSON chi tiết thưởng hiển thị 1 lần',
  seen       TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_inv_notif (user_id, kind, ref_id),
  INDEX idx_inv_notif_unseen (user_id, seen),
  CONSTRAINT fk_inv_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 10. Bảng ghi sự kiện phân tích (NFR-06) ──────────────────
CREATE TABLE IF NOT EXISTS app_events (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED DEFAULT NULL,
  name       VARCHAR(64) NOT NULL,
  props      LONGTEXT DEFAULT NULL COMMENT 'JSON sự kiện (LONGTEXT tương thích MySQL 5.5/5.6)',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_app_events_name_time (name, created_at),
  INDEX idx_app_events_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
