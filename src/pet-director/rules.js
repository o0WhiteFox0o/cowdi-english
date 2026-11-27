// Pet Director — bảng luật (giai đoạn 1–2). Nguồn: docs/PET-DIRECTOR-INTEGRATION.md mục 4.3.
// File khởi đầu: AI tích hợp được phép thêm trường, KHÔNG đổi giá trị nếu chưa hỏi chủ dự án.

export const PRIORITY = {
  evolve_ok: 100,
  lesson_done: 90,
  streak: 80,
  skill_level_up: 70,
  answer_correct: 50,
  answer_wrong: 50,
  screen_intro: 45,
  app_open: 40,
  pet_tap: 35,
  feed: 30,
  mood_nudge: 20,
  page_tip: 10,
};

// Khoảng cách tối thiểu (ms) giữa 2 lần CÓ CHỮ của cùng loại. Động tác không bị giới hạn.
export const SPEECH_COOLDOWN_MS = {
  answer_correct: 8000,
  answer_wrong: 8000,
  pet_tap: 10000,
};

export const GLOBAL_SPEECH_GAP_MS = 20000;        // áp cho loại có ưu tiên < 50
export const GLOBAL_GAP_EXEMPT_PRIORITY = 50;

export const ONCE_PER_SESSION = ['app_open', 'mood_nudge'];
export const ONCE_PER_SCREEN_FOREVER = ['page_tip'];

export const REPEAT_BLOCK_MS = 7 * 24 * 60 * 60 * 1000; // cùng line id không lặp trong 7 ngày
export const SESSION_IDLE_RESET_MS = 30 * 60 * 1000;     // vắng > 30 phút = phiên mới
export const IDLE_TICK_MS = 30000;

export const QUIET_HOURS = { start: 21, end: 6 };        // giờ thiết bị

export const DEFAULT_TTL_MS = 4000;
export const CTA_TTL_MS = 8000;
export const THOUGHT_TTL_MS = 6000;

export const MAX_SPEECH_CHARS = 60;

// Tầng tối đa theo màn hình: 1 = chỉ động tác, 2 = + biểu tượng, 3 = + câu.
export const TIER_MAX_BY_SCREEN = {
  lesson: 3,
  path: 3,
  home: 3,
  pet: 3,
  battle: 1,
};

// mood_nudge trên Lộ trình tự hiện chỉ ở tầng 2 (biểu tượng); khi bé chạm pet mới lên tầng 3.
export const TIER_OVERRIDES = {
  'path:mood_nudge': 2,
};

// Sự kiện chỉ dùng cho điều phối, KHÔNG gửi xuống PetAvatar.emit.
export const DIRECTOR_ONLY_EVENTS = ['screen_enter', 'screen_intro', 'idle_tick', 'mood_nudge', 'page_tip', 'pet_tap'];

// Biểu tượng cho tầng 2 theo ngữ cảnh.
export const THOUGHT_FOR = {
  mood_nudge_sad: 'book',
  mood_nudge_sick: 'book',
  hungry: 'milk',
  night: 'zzz',
  lesson_done: 'trophy',
};

// Từ cấm trong mọi câu thoại (nguyên tắc P3). Test sẽ quét toàn bộ LineDB.
export const BANNED_PHRASES = ['ốm', 'yếu lắm', 'yếu quá', 'nhớ bạn lắm', 'sao lâu', 'sai rồi', 'bệnh', 'đau', '😢', '😷', '🤒', '😿', '🥺'];
