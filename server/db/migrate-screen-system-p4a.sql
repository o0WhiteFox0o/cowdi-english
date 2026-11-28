-- Migration Hệ thống Màn học Đợt 4a (GEMINI-SCREEN-SYSTEM-PHASE4 §1.2, §2)
-- Tương thích MySQL 5.5 / 5.6+ & 8.0 (RK-005): không có USE <db>, không có user_id.

CREATE TABLE IF NOT EXISTS screen_stat_daily (
  day        DATE NOT NULL,
  code       VARCHAR(8) NOT NULL,
  group_id   VARCHAR(16) NOT NULL,
  starts     INT NOT NULL DEFAULT 0,
  completes  INT NOT NULL DEFAULT 0,
  quits      INT NOT NULL DEFAULT 0,
  items      INT NOT NULL DEFAULT 0,
  first_try  INT NOT NULL DEFAULT 0,
  sum_ms     BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (day, code, group_id)
);

-- Chuyển 3 màn F Đợt 4a từ 'todo' → 'test' (giữ nguyên nếu admin đã đổi trạng thái)
UPDATE screen_config
   SET status = 'test',
       note = COALESCE(note, 'Đợt 4a · chỉ tài khoản thử'),
       updated_at = NOW()
 WHERE code IN ('F-02', 'F-04', 'F-05')
   AND status = 'todo';
