-- ============================================================
--  Cowdi English – Pet Motion Admin & Publishing Migration
--  Chạy: mysql -u <user> -p <db_name> < server/db/migrate-pet-motion.sql
--  Hoặc Import trực tiếp trong phpMyAdmin sau khi chọn database.
--  Tương thích MySQL 5.6 / 5.7 / 8.0 và MariaDB 10.x (dùng LONGTEXT thay JSON).
--  An toàn chạy lại nhiều lần (idempotent). Không xoá dữ liệu người dùng.
-- ============================================================

-- ── Đảm bảo cột is_admin trên bảng users (idempotent, đồng bộ với migrate-admin.sql) ──
DROP PROCEDURE IF EXISTS _pet_motion_ensure_is_admin;
DELIMITER $$
CREATE PROCEDURE _pet_motion_ensure_is_admin()
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
CALL _pet_motion_ensure_is_admin();
DROP PROCEDURE _pet_motion_ensure_is_admin;

-- ── 1. Bản chỉnh keyframe clip (chung '' hoặc riêng 'bamboo/c3') ──
CREATE TABLE IF NOT EXISTS pet_motion_clips (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  scope_key      VARCHAR(40)  NOT NULL COMMENT ''''' = ban chung moi pet; ''bamboo/c3'' = rieng pet-cap',
  clip           VARCHAR(40)  NOT NULL,
  draft_json     LONGTEXT     NOT NULL,
  published_json LONGTEXT     NULL COMMENT 'Ban da duyet ma nguoi hoc thay',
  status         ENUM('draft','approved') NOT NULL DEFAULT 'draft',
  updated_by     INT UNSIGNED NULL,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approved_by    INT UNSIGNED NULL,
  approved_at    TIMESTAMP    NULL DEFAULT NULL,
  UNIQUE KEY uq_clip (scope_key, clip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Trạng thái duyệt từng động tác theo từng pet-cấp ──
CREATE TABLE IF NOT EXISTS pet_motion_approvals (
  pet_stage   VARCHAR(40)  NOT NULL COMMENT 'Vi du: bamboo/c3',
  clip        VARCHAR(40)  NOT NULL,
  approved    TINYINT(1)   NOT NULL DEFAULT 0,
  approved_by INT UNSIGNED NULL,
  approved_at TIMESTAMP    NULL DEFAULT NULL,
  PRIMARY KEY (pet_stage, clip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 3. Bộ phận (ảnh) + rig của từng pet-cấp ──
CREATE TABLE IF NOT EXISTS pet_rigs (
  pet_stage        VARCHAR(40)  NOT NULL PRIMARY KEY,
  draft_rig        LONGTEXT     NOT NULL COMMENT 'rig.json cua cap do + rig edits da gop',
  draft_images     LONGTEXT     NOT NULL COMMENT '{ "head": "draft/bamboo/c3/head-<hash>.png", ... }',
  published_rig    LONGTEXT     NULL,
  published_images LONGTEXT     NULL,
  avatar_path      VARCHAR(255) NULL     COMMENT 'Anh avatar tinh bo sung tu trang quan tri (avatars/<pet>/c<n>-<hash>.<ext>)',
  status           ENUM('draft','approved') NOT NULL DEFAULT 'draft',
  updated_by       INT UNSIGNED NULL,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approved_by      INT UNSIGNED NULL,
  approved_at      TIMESTAMP    NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Đảm bảo cột avatar_path tồn tại nếu bảng pet_rigs đã tạo trước đó
DROP PROCEDURE IF EXISTS _pet_motion_ensure_avatar_path;
DELIMITER $$
CREATE PROCEDURE _pet_motion_ensure_avatar_path()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME   = 'pet_rigs'
       AND COLUMN_NAME  = 'avatar_path'
  ) THEN
    ALTER TABLE pet_rigs
      ADD COLUMN avatar_path VARCHAR(255) NULL
        COMMENT 'Anh avatar tinh bo sung tu trang quan tri' AFTER published_images;
  END IF;
END$$
DELIMITER ;
CALL _pet_motion_ensure_avatar_path();
DROP PROCEDURE _pet_motion_ensure_avatar_path;

-- ── 4. Lịch sử thay đổi để hoàn tác / kiểm tra ──
CREATE TABLE IF NOT EXISTS pet_motion_history (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kind       ENUM('clip','rig','approval') NOT NULL,
  ref_key    VARCHAR(80)  NOT NULL,
  data_json  LONGTEXT     NOT NULL,
  user_id    INT UNSIGNED NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pet_motion_history_kind_ref (kind, ref_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
