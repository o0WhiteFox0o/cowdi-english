/**
 * shared/screen-scenarios.js — Bảng kịch bản hiển thị tên màn theo vùng đất (Story Bible).
 * Tên mặc định (`defaultName`) mang hướng học thuật, dùng trong danh mục & các vùng chưa có kịch bản riêng.
 * Khi học trong một vùng (BD, TG, VS...), màn tự động lấy tên phù hợp bối cảnh kịch bản vùng đó.
 */

export const SCREEN_SCENARIOS = {
  'F-01': {
    defaultName: 'Trình chiếu từ vựng',
    byRegion: {
      BD: 'Gặp từ trên Bến Đò',
      TG: 'Gặp từ Tháp Gió',
      VS: 'Gặp từ Vườn Sữa',
    },
  },
  'F-02': {
    defaultName: 'Ghép chính tả',
    byRegion: {
      BD: 'Ghép chữ lên đò',
      TG: 'Ghép chữ đón gió',
      VS: 'Ghép chữ Vườn Sữa',
    },
  },
  'F-03': {
    defaultName: 'Nghe nhận diện từ',
    byRegion: {
      BD: 'Nghe nhận diện từ',
      TG: 'Nghe nhận diện từ',
      VS: 'Nghe nhận diện từ',
    },
  },
  'F-04': {
    defaultName: 'Luyện nói vượt chướng ngại',
    byRegion: {
      BD: 'Gọi pet qua sông',
      TG: 'Gọi pet vượt gió',
      VS: 'Gọi pet vượt suối',
    },
  },
  'F-05': {
    defaultName: 'Đọc tìm từ khóa',
    byRegion: {
      BD: 'Săn chữ trong sương',
      TG: 'Săn chữ trong gió',
      VS: 'Săn chữ Vườn Sữa',
    },
  },
  'F-06': {
    defaultName: 'Boss sương mù',
    byRegion: {
      BD: 'Boss Sương Bến Đò',
      TG: 'Boss Sương Tháp Gió',
      VS: 'Boss Sương Vườn Sữa',
    },
  },
  'F-07': {
    defaultName: 'Nghe đếm số lượng',
    byRegion: {
      BD: 'Chợ nổi',
      TG: 'Phiên chợ Tháp Gió',
      VS: 'Chợ Vườn Sữa',
    },
  },
  'F-08': {
    defaultName: 'Ghép cặp từ vựng',
    byRegion: {
      BD: 'Lật cặp bên sông',
      TG: 'Lật cặp cánh đồng gió',
      VS: 'Lật cặp đồng cỏ',
    },
  },
  'F-09': {
    defaultName: 'Xếp câu hoàn chỉnh',
    byRegion: {
      BD: 'Đò chở câu',
      TG: 'Gió xếp câu',
      VS: 'Xếp câu Vườn Sữa',
    },
  },
  'F-10': {
    defaultName: 'Hội thoại phản xạ',
    byRegion: {
      BD: 'Trò chuyện với Ông Tư',
      TG: 'Trò chuyện Tháp Gió',
      VS: 'Trò chuyện Vườn Sữa',
    },
  },
  'F-11': {
    defaultName: 'Đọc kiểm chứng Đúng/Sai',
    byRegion: {
      BD: 'Đúng hay sai',
      TG: 'Đúng hay sai',
      VS: 'Đúng hay sai',
    },
  },
};

/**
 * Lấy tên hiển thị của màn theo mã & vùng đất hiện tại.
 * Không có kịch bản riêng thì trả tên học thuật mặc định hoặc fallback.
 */
export function getScreenTitle(code, region = null, fallback = '') {
  const entry = SCREEN_SCENARIOS[code];
  if (!entry) return fallback || code || '';
  if (region && entry.byRegion && entry.byRegion[region]) {
    return entry.byRegion[region];
  }
  return entry.defaultName || fallback || code || '';
}
