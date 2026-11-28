-- Migration Hệ thống Màn học Đợt 4b (GEMINI-SCREEN-SYSTEM-PHASE4 §2)
-- Tương thích MySQL 5.5 / 5.6+ & 8.0 (RK-005).

UPDATE screen_config
   SET status = 'test',
       note = COALESCE(note, 'Đợt 4b · chỉ tài khoản thử'),
       updated_at = NOW()
 WHERE code IN ('F-07', 'F-10', 'F-11')
   AND status = 'todo';
