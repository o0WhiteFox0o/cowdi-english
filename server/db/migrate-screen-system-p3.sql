-- server/db/migrate-screen-system-p3.sql
-- Hệ thống Màn học Đợt 3 (GEMINI-SCREEN-SYSTEM-PHASE3 + ADDENDUM)
-- Tương thích MySQL 5.5 / 5.6+ & 8.0 (RK-005):
--   - KHÔNG dùng `USE <db>;`
--   - KHÔNG dùng kiểu JSON (dùng LONGTEXT)
--   - KHÔNG dùng `DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` (dùng DATETIME DEFAULT NULL)

-- 1. Bảng kho câu dẫn màn & mở ải theo vùng
CREATE TABLE IF NOT EXISTS screen_intro (
  id          VARCHAR(32) PRIMARY KEY,
  screen_code VARCHAR(8)  NOT NULL,
  region      VARCHAR(4)  NOT NULL,
  text_vi     VARCHAR(160) NOT NULL,
  audio_url   VARCHAR(255) DEFAULT NULL,
  status      ENUM('draft','approved','disabled') NOT NULL DEFAULT 'draft',
  updated_by  INT DEFAULT NULL,
  updated_at  DATETIME DEFAULT NULL,
  KEY idx_si_lookup (screen_code, region, status)
);

-- 2. Chuyển 5 màn Thân thiện Đợt 3 từ 'todo' → 'test' (KHÔNG bật 'on')
UPDATE screen_config
   SET status = 'test', updated_at = NOW()
 WHERE code IN ('F-01', 'F-03', 'F-06', 'F-08', 'F-09')
   AND status = 'todo';

-- 3. Bổ sung 3 cột tiến độ Đợt 3 vào user_progress (chạy idempotent qua scripts/run-screen-system-p3-migration.js)
--    ALTER TABLE user_progress ADD COLUMN recent_intros    LONGTEXT NULL;
--    ALTER TABLE user_progress ADD COLUMN lesson_stars     LONGTEXT NULL;
--    ALTER TABLE user_progress ADD COLUMN lesson_star_paid LONGTEXT NULL;
