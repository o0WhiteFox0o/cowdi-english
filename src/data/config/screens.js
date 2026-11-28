/**
 * Cấu hình tĩnh Hệ thống Màn học Đợt 1 (STD-SCREEN-SYSTEM v1.0).
 * Đợt 2 sẽ tải cấu hình động từ server (GET /api/screens/config); file này thành dự phòng offline.
 */

export const SCREEN_CONFIG = {
  status: {
    'T-01': 'on',
    'T-02': 'on',
    'T-04': 'on',
    'T-05': 'on',
    'T-06': 'on',
    'T-07': 'on',
    'T-08': 'on',
    'F-01': 'test',
    'F-02': 'test',
    'F-03': 'test',
    'F-04': 'test',
    'F-05': 'test',
    'F-06': 'test',
    'F-07': 'test',
    'F-08': 'test',
    'F-09': 'test',
    'F-10': 'test',
    'F-11': 'test',
  },
  weights: {
    beginner:     { friendly: 1.0,  focus: 0.0  },
    intermediate: { friendly: 0.5,  focus: 0.5  },
    exam:         { friendly: 0.25, focus: 0.75 },
  },
};

export const SLOT_META = {
  intro:  { label: 'Gặp từ', color: '#E9A400', icon: 'book' },
  listen: { label: 'Nghe',   color: '#2F7FD1', icon: 'ear' },
  read:   { label: 'Đọc',    color: '#B26B00', icon: 'redbook' },
  write:  { label: 'Viết',   color: '#6D4FC2', icon: 'pencil' },
  speak:  { label: 'Nói',    color: '#C43D7A', icon: 'speak' },
  boss:   { label: 'Boss',   color: '#4A3420', icon: 'target' },
};

/** Tên ngắn ≤ 11 ký tự cho lưới 6 ô trong StageIntro (ui/stage-intro §3, test U7). */
export const SHORT_NAME = {
  'T-01': 'Từ vựng',   'T-02': 'Thẻ lật',    'T-04': 'Đọc hiểu',  'T-05': 'Nghe chọn',
  'T-06': 'Nói theo',  'T-07': 'Trắc nghiệm','T-08': 'Viết câu',
  'F-01': 'Thẻ từ',    'F-02': 'Ghép chữ',   'F-03': 'Nghe từ',   'F-04': 'Qua cầu',
  'F-05': 'Săn chữ',   'F-06': 'Sương',      'F-07': 'Chợ nổi',   'F-08': 'Lật cặp',
  'F-09': 'Xếp ghe',   'F-10': 'Trò chuyện', 'F-11': 'Đúng/Sai',
};

/** 1 dòng luật chơi cố định theo mã màn cho ScreenIntro (STD 4.1) */
export const SCREEN_PLAY_RULES = {
  'T-01': 'Nghe và xem từng từ mới của bài học nhé!',
  'T-02': 'Nghe phát âm, đoán nghĩa rồi lật thẻ kiểm tra.',
  'T-04': 'Đọc kỹ đoạn văn rồi trả lời câu hỏi hiểu bài.',
  'T-05': 'Nghe câu tiếng Anh rồi chọn nghĩa tiếng Việt đúng.',
  'T-06': 'Nghe câu mẫu rồi đọc to theo để luyện phát âm.',
  'T-07': 'Trả lời các câu hỏi tổng hợp để chinh phục ải này!',
  'T-08': 'Sắp xếp hoặc gõ lại câu tiếng Anh đúng theo nghĩa tiếng Việt.',
  'F-01': 'Xem và nghe lần lượt từng từ mới; chạm thẻ để dừng hoặc giữ loa nghe chậm.',
  'F-02': 'Nghe từ và chạm từng chữ cái ghép đúng chính tả.',
  'F-03': 'Nghe phát âm rồi chọn đúng từ tiếng Anh tương ứng.',
  'F-04': 'Nghe câu mẫu, đếm 3-2-1 rồi đọc to theo để đưa pet qua chướng ngại.',
  'F-05': 'Nghe từ khoá rồi chạm đúng ô sương ẩn trong đoạn văn để giải sương.',
  'F-06': 'Trả lời đúng các câu hỏi tổng hợp để đẩy lùi Boss Sương Mù!',
  'F-07': 'Nghe khách đặt hàng rồi chọn đúng giỏ có đủ món và số lượng.',
  'F-08': 'Lật hai thẻ để ghép đúng từ tiếng Anh với nghĩa tiếng Việt.',
  'F-09': 'Chạm từng thẻ từ xếp đúng thứ tự để hoàn thành câu tiếng Anh.',
  'F-10': 'Nghe câu hỏi của nhân vật rồi nói (hoặc chạm) câu trả lời phù hợp.',
  'F-11': 'Đọc câu trên thẻ rồi chọn Đúng hoặc Sai (hoặc vuốt thẻ trái/phải).',
};

export const SCREEN_SYSTEM_FF_KEY = 'cowdi_ff_screenSystemV1';

/**
 * Đọc cờ bật/tắt screenSystemV1 (mở công khai cho toàn bộ người dùng từ 28/11/2026):
 * localStorage.cowdi_ff_screenSystemV1 → import.meta.env.VITE_FF_SCREEN_SYSTEM_V1 → true.
 * Vẫn hỗ trợ đặt '0' / 'false' để quay về giao diện cũ khi cần rollback khẩn cấp (trước Đợt 4c).
 */
export function isScreenSystemEnabled() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(SCREEN_SYSTEM_FF_KEY);
      if (raw === '1' || raw === 'true') return true;
      if (raw === '0' || raw === 'false') return false;
    }
  } catch { /* bỏ qua */ }
  try {
    const envVal = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_FF_SCREEN_SYSTEM_V1 : undefined;
    if (envVal === '1' || envVal === 'true') return true;
    if (envVal === '0' || envVal === 'false') return false;
  } catch { /* bỏ qua */ }
  return true;
}

export function setScreenSystemEnabled(enabled) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SCREEN_SYSTEM_FF_KEY, enabled ? '1' : '0');
    }
  } catch { /* bỏ qua */ }
}
