-- ============================================================
--  Cowdi English – Pet Management & Custom Pet Catalog Migration
--  Chạy: mysql -u <user> -p <db_name> < server/db/migrate-pet-catalog.sql
--  Hoặc chạy script: node scripts/run-pet-catalog-migration.js
--  Tương thích MySQL 5.5 / 5.6 / 5.7 / 8.0 và MariaDB 10.x
--  (Chỉ dùng LONGTEXT, tối đa 1 TIMESTAMP auto, không dùng USE <db>).
--  An toàn chạy lại nhiều lần (idempotent). Không xoá dữ liệu người dùng.
-- ============================================================

CREATE TABLE IF NOT EXISTS pet_catalog (
  pet_id          VARCHAR(40)  NOT NULL PRIMARY KEY,
  name            VARCHAR(80)  NOT NULL,
  species         VARCHAR(80)  NOT NULL DEFAULT '',
  emoji           VARCHAR(16)  NOT NULL DEFAULT '🐾',
  element         VARCHAR(24)  NOT NULL DEFAULT 'neutral',
  pet_group       VARCHAR(24)  NOT NULL DEFAULT 'farm',
  rarity          VARCHAR(24)  NOT NULL DEFAULT 'common',
  description     TEXT         NULL,
  evolutions_json LONGTEXT     NOT NULL COMMENT 'Mang 5 cap [{stage,name,xp,emoji,image}]',
  unlock_json     LONGTEXT     NULL     COMMENT 'Dieu kien mo khoa {type,value,text}',
  skill_req_json  LONGTEXT     NULL     COMMENT 'Moc ky nang C4/C5 cho battle-engine',
  is_custom       TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '1 = pet tao tu admin, 0 = override metadata pet goc',
  is_active       TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '1 = hien thi, 0 = tam an',
  created_by      INT UNSIGNED NULL,
  updated_by      INT UNSIGNED NULL,
  created_at      DATETIME     DEFAULT NULL,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
