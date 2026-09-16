/**
 * SEO Configs cho từng route của Cowdi English
 *
 * Mỗi key là pathname của route.
 * Dùng với hook useSEO / usePageSEO.
 *
 * Hướng dẫn:
 *   - title: Ngắn gọn, có keyword chính, dưới 60 ký tự
 *   - description: 120–160 ký tự, hấp dẫn, có CTA
 *   - keywords: 5-10 từ khóa liên quan
 *   - ogImage: URL ảnh 1200×630px (để undefined = dùng default pwa-512x512.png)
 */

export const BASE_DOMAIN = 'https://cowdi.net';

export const SEO_CONFIGS = {
  '/': {
    title: 'Cowdi — Nuôi pet, học tiếng Anh, đấu bạn bè 🐮',
    description:
      'Học tiếng Anh mỗi ngày 5 phút qua game nuôi pet. Luyện IELTS/TOEIC, Duel bạn bè, leo bảng xếp hạng. Vào nhận trứng miễn phí!',
    keywords:
      'học tiếng anh, nuôi pet, cowdi, ielts, toeic, từ vựng tiếng anh, game học tiếng anh, cowdi english',
    ogType: 'website',
  },

  '/lessons': {
    title: 'Thư viện bài học tiếng Anh — Cowdi',
    description:
      'Hơn 100 bài học tiếng Anh theo chuẩn IELTS, TOEIC, CEFR (A1-C1), VSTEP. Lộ trình từ cơ bản đến nâng cao, bài học ngắn gọn 5–10 phút.',
    keywords:
      'bài học tiếng anh, ielts, toeic, cefr, vstep, từ vựng, ngữ pháp, kỹ năng tiếng anh',
    ogType: 'website',
  },

  '/vocabulary': {
    title: 'Từ vựng tiếng Anh — Cowdi',
    description:
      'Học từ vựng qua flashcard theo chủ đề: gia đình, công việc, du lịch, IELTS, TOEIC... Luyện phát âm, tự đánh giá ngay trên app.',
    keywords:
      'từ vựng tiếng anh, flashcard, học từ mới, luyện phát âm, chủ đề từ vựng, ielts vocabulary',
    ogType: 'website',
  },

  '/practice': {
    title: 'Luyện tập tiếng Anh — Cowdi',
    description:
      'Luyện từ vựng với quiz thông minh, hệ thống ôn tập dựa theo ghi nhớ cách khoảng (spaced repetition). Học hiệu quả, không quên từ.',
    keywords:
      'luyện tập tiếng anh, quiz tiếng anh, spaced repetition, ôn tập từ vựng, kiểm tra tiếng anh',
    ogType: 'website',
  },

  '/review': {
    title: 'Ôn tập — Cowdi',
    description:
      'Ôn tập những từ vựng và bài học gần đây. Đừng để quên kiến thức đã học!',
    keywords: 'ôn tập tiếng anh, review từ vựng, luyện từ cũ, cowdi review',
    ogType: 'website',
  },

  '/learning-path': {
    title: 'Lộ trình học tiếng Anh — Cowdi',
    description:
      'Lộ trình học tiếng Anh cá nhân hóa từ cơ bản đến IELTS/TOEIC. Theo dõi tiến độ, mở khóa bài học mới mỗi ngày.',
    keywords:
      'lộ trình học tiếng anh, học tiếng anh theo cấp độ, ielts roadmap, toeic roadmap, cefr',
    ogType: 'website',
  },

  '/progress': {
    title: 'Tiến độ học tập — Cowdi',
    description:
      'Xem thống kê XP, streak học liên tục, số bài đã hoàn thành và điểm số của bạn. Theo dõi hành trình học tiếng Anh!',
    keywords:
      'tiến độ học tập, thống kê học tiếng anh, xp, streak, cowdi progress',
    noindex: false,
  },

  '/pet': {
    title: 'Pet của tôi — Cowdi',
    description:
      'Chăm sóc thú cưng ảo của bạn. Pet tiến hóa theo XP bạn học được — nuôi pet, học tiếng Anh mỗi ngày!',
    keywords: 'pet ảo, nuôi pet, thú cưng, tiến hóa, cowdi pet, tamagotchi',
    ogType: 'website',
  },

  '/collection': {
    title: 'Bộ sưu tập — Cowdi',
    description:
      'Khám phá và sưu tầm các loài pet hiếm trong Cowdi. Mỗi loài có hành trình tiến hóa riêng biệt.',
    keywords: 'bộ sưu tập pet, pet hiếm, cowdi collection, gacha pet',
    ogType: 'website',
  },

  '/shop': {
    title: 'Cửa hàng — Cowdi',
    description:
      'Mua vật phẩm, skin đặc biệt cho pet của bạn bằng điểm tích lũy. Cửa hàng cập nhật item mới mỗi tuần!',
    keywords: 'cửa hàng cowdi, skin pet, vật phẩm, shop cowdi, item cowdi',
    ogType: 'website',
  },

  '/leaderboard': {
    title: 'Bảng xếp hạng — Cowdi',
    description:
      'Top 100 học viên có XP cao nhất tuần này. Bạn đứng vị trí mấy? Leo bảng ngay bằng cách học tiếng Anh mỗi ngày!',
    keywords:
      'bảng xếp hạng, leaderboard tiếng anh, top học viên, cowdi ranking',
    ogType: 'website',
  },

  '/duel': {
    title: 'Duel bạn bè — Cowdi',
    description:
      'Thách đấu từ vựng với bạn bè real-time. Ai trả lời nhanh và chính xác hơn sẽ thắng! Chơi ngay — hoàn toàn miễn phí.',
    keywords:
      'duel tiếng anh, thách đấu từ vựng, pvp tiếng anh, cowdi duel, battle tiếng anh',
    ogType: 'website',
  },

  '/mini-games': {
    title: 'Mini Games — Cowdi',
    description:
      'Luyện tiếng Anh qua các mini game vui nhộn: đoán từ, nối từ, điền từ... Học mà vui, không chán!',
    keywords: 'mini game tiếng anh, game từ vựng, học qua game, cowdi game',
    ogType: 'website',
  },

  '/typing': {
    title: 'Luyện gõ tiếng Anh — Cowdi',
    description:
      'Cải thiện tốc độ gõ tiếng Anh với bài luyện từ vựng. Gõ đúng, gõ nhanh để kiếm XP!',
    keywords: 'luyện gõ tiếng anh, typing, gõ nhanh, học tiếng anh cowdi',
    ogType: 'website',
  },

  '/account': {
    title: 'Tài khoản — Cowdi',
    description:
      'Quản lý hồ sơ cá nhân, thành tích và cài đặt tài khoản Cowdi của bạn.',
    keywords: 'tài khoản cowdi, hồ sơ, thành tích, cài đặt',
    noindex: true, // Trang cá nhân không nên index
  },

  '/student-ranking': {
    title: 'Xếp hạng học viên — Cowdi',
    description:
      'Bảng xếp hạng học viên theo lớp, trường. Giáo viên theo dõi tiến độ của học sinh.',
    keywords: 'xếp hạng học viên, cowdi cho giáo viên, lớp học cowdi',
    ogType: 'website',
  },

  '/admin': {
    title: 'Admin — Cowdi',
    description: 'Trang quản trị Cowdi English.',
    noindex: true, // Không index trang admin
  },

  '/auth-callback': {
    title: 'Đang đăng nhập — Cowdi',
    description: 'Đang xác thực tài khoản...',
    noindex: true,
  },
};

/**
 * Lấy SEO config cho một pathname.
 * Fallback về config trang chủ nếu không tìm thấy.
 */
export function getSEOConfig(pathname) {
  return SEO_CONFIGS[pathname] ?? SEO_CONFIGS['/'];
}
