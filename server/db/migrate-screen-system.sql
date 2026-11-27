-- Migration: Hệ thống Màn học Đợt 2 — Cấu hình server & Admin kiểm tra màn
-- Chuẩn tương thích MySQL 5.5 / 5.6+ (RK-005: không dùng DATETIME DEFAULT CURRENT_TIMESTAMP, không dùng USE <db>;)
-- Chạy an toàn idempotent qua: node scripts/run-screen-system-p2-migration.js

CREATE TABLE IF NOT EXISTS screen_config (
  code        VARCHAR(8)  PRIMARY KEY,
  status      ENUM('on','test','off','todo','retired') NOT NULL DEFAULT 'off',
  note        VARCHAR(255) DEFAULT NULL,
  updated_by  INT DEFAULT NULL,
  updated_at  DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS screen_weights (
  group_id    VARCHAR(16) NOT NULL,
  level       ENUM('focus','friendly') NOT NULL,
  weight      DECIMAL(4,3) NOT NULL,
  updated_by  INT DEFAULT NULL,
  updated_at  DATETIME DEFAULT NULL,
  PRIMARY KEY (group_id, level)
);

CREATE TABLE IF NOT EXISTS screen_testers (
  user_id     INT PRIMARY KEY,
  note        VARCHAR(255) DEFAULT NULL,
  added_by    INT DEFAULT NULL,
  added_at    DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS screen_config_log (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  target      VARCHAR(48) NOT NULL,
  old_value   TEXT,
  new_value   TEXT,
  changed_by  INT NOT NULL,
  changed_at  DATETIME DEFAULT NULL,
  KEY idx_scl_changed (changed_at)
);

-- Seed 19 mã màn (8 T + 11 F) — chạy lại an toàn với INSERT IGNORE
INSERT IGNORE INTO screen_config (code, status, note, updated_at) VALUES
  ('T-01', 'on',      NULL, NOW()),
  ('T-02', 'on',      NULL, NOW()),
  ('T-03', 'retired', 'Không chiếm vị trí · dùng làm mẹo pet', NOW()),
  ('T-04', 'on',      NULL, NOW()),
  ('T-05', 'on',      NULL, NOW()),
  ('T-06', 'on',      NULL, NOW()),
  ('T-07', 'on',      NULL, NOW()),
  ('T-08', 'on',      NULL, NOW()),
  ('F-01', 'todo',    NULL, NOW()),
  ('F-02', 'todo',    NULL, NOW()),
  ('F-03', 'todo',    NULL, NOW()),
  ('F-04', 'todo',    NULL, NOW()),
  ('F-05', 'todo',    NULL, NOW()),
  ('F-06', 'todo',    NULL, NOW()),
  ('F-07', 'todo',    NULL, NOW()),
  ('F-08', 'todo',    NULL, NOW()),
  ('F-09', 'todo',    NULL, NOW()),
  ('F-10', 'todo',    NULL, NOW()),
  ('F-11', 'todo',    NULL, NOW());

-- Seed trọng số 3 nhóm học theo STD-SCREEN-SYSTEM §3.3
INSERT IGNORE INTO screen_weights (group_id, level, weight, updated_at) VALUES
  ('beginner',     'friendly', 1.000, NOW()),
  ('beginner',     'focus',    0.000, NOW()),
  ('intermediate', 'friendly', 0.500, NOW()),
  ('intermediate', 'focus',    0.500, NOW()),
  ('exam',         'friendly', 0.250, NOW()),
  ('exam',         'focus',    0.750, NOW());
