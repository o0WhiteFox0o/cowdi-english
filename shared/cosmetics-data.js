// ── Cấu hình hệ thống Đồ trang trí Kinh tế v2 (Cowdi English) ─────────────
// Bám sát tài liệu thiết kế: docs/04-design/economy-v2/de-xuat-trang-tri-nen-hao-quang.md
// Quyết định D14: Thường (800 Sữa), Hiếm (2 000 Sữa), Sử thi (40 Gem), Huyền thoại (90 Gem)

export const COSMETIC_RARITIES = {
  common: {
    id: 'common',
    label: 'Thường',
    color: '#6B7C93',
    bg: '#F1F3F5',
    currency: 'milk',
    price: 800,
  },
  rare: {
    id: 'rare',
    label: 'Hiếm',
    color: '#1976D2',
    bg: '#E3F2FD',
    currency: 'milk',
    price: 2000,
  },
  epic: {
    id: 'epic',
    label: 'Sử thi',
    color: '#7B1FA2',
    bg: '#F3E5F5',
    currency: 'gem',
    price: 40,
  },
  legendary: {
    id: 'legendary',
    label: 'Huyền thoại',
    color: '#E65100',
    bg: '#FFF3E0',
    currency: 'gem',
    price: 90,
  },
  achievement: {
    id: 'achievement',
    label: 'Mốc học',
    color: '#2E7D32',
    bg: '#E8F5E9',
    currency: 'free',
    price: 0,
  },
  season: {
    id: 'season',
    label: 'Mùa',
    color: '#C2185B',
    bg: '#FCE4EC',
    currency: 'season',
    price: 0,
  },
};

// ── 1. Danh sách 19 Nền (Backgrounds / Rooms) ──────────────────────────
export const BACKGROUND_ITEMS = [
  // Đồ cũ xếp lại
  {
    id: 'room_forest',
    category: 'room',
    name: 'Rừng xanh',
    emoji: '🌲',
    rarity: 'common',
    theme: 'nature',
    priceMilk: 800,
    priceGem: 0,
    bgStyle: 'linear-gradient(180deg, #A5D6A7 0%, #81C784 45%, #66BB6A 100%)',
    bgImage: '/image/icons-ui/cosmetics/bg_forest.webp',
    description: 'Rừng cây yên bình, lá xanh mơn mởn tràn đầy năng lượng thiên nhiên.',
    note: 'Tĩnh · 800 🥛',
  },
  {
    id: 'room_beach',
    category: 'room',
    name: 'Bãi biển',
    emoji: '🏖️',
    rarity: 'common',
    theme: 'ocean',
    priceMilk: 800,
    priceGem: 0,
    bgStyle: 'linear-gradient(180deg, #4FC3F7 0%, #81D4FA 40%, #FFE082 80%, #FFD54F 100%)',
    bgImage: '/image/icons-ui/cosmetics/bg_beach.webp',
    description: 'Gió biển trong lành, bãi cát vàng ấm áp xua tan mệt mỏi.',
    note: 'Tĩnh · 800 🥛',
  },
  {
    id: 'room_space',
    category: 'room',
    name: 'Vũ trụ',
    emoji: '🚀',
    rarity: 'rare',
    theme: 'space',
    priceMilk: 2000,
    priceGem: 0,
    bgStyle: 'linear-gradient(180deg, #0D1B2A 0%, #1B263B 45%, #415A77 100%)',
    bgImage: '/image/icons-ui/cosmetics/bg_space.webp',
    description: 'Không gian ngân hà bao la với hàng triệu vì sao lấp lánh.',
    note: 'Hiệu ứng sao · 2 000 🥛',
  },
  {
    id: 'room_castle',
    category: 'room',
    name: 'Lâu đài',
    emoji: '🏰',
    rarity: 'epic',
    theme: 'royal',
    priceMilk: 0,
    priceGem: 40,
    bgStyle: '#EDE7F6',
    description: 'Lâu đài cổ tích nguy nga tráng lệ dành cho học giả xuất chúng.',
    note: 'Hoạt ảnh · 40 💎',
  },
  {
    id: 'room_library',
    category: 'room',
    name: 'Thư viện cổ',
    emoji: '📚',
    rarity: 'common',
    theme: 'academic',
    priceMilk: 800,
    priceGem: 0,
    bgStyle: '#FFF8E1',
    description: 'Thiên đường tri thức ngập tràn sách cổ và tài liệu học tập quý giá.',
    note: 'Tĩnh · 800 🥛',
  },
  {
    id: 'room_library',
    category: 'room',
    name: 'Thư viện',
    emoji: '📚',
    rarity: 'common',
    theme: 'academic',
    priceMilk: 800,
    priceGem: 0,
    bgStyle: '#FFF8E1',
    description: 'Thư viện yên tĩnh với hàng ngàn cuốn sách hay mở rộng tầm nhìn.',
    note: 'Tĩnh · 800 🥛',
  },
  {
    id: 'room_study_level',
    category: 'room',
    name: 'Phòng học theo trình độ',
    emoji: '📚',
    rarity: 'achievement',
    theme: 'academic',
    priceMilk: 0,
    priceGem: 0,
    bgStyle: '#FFF8E1',
    description: 'Kệ sách và bằng khen đầy dần theo lộ trình học tập của bạn.',
    unlockCondition: { type: 'level_or_unit', value: 1 },
    note: 'Mở theo Lộ trình học',
  },

  // 10 Nền theo hệ (Hiếm - 2 000 Sữa)
  {
    id: 'room_volcano',
    category: 'room',
    name: 'Núi lửa',
    emoji: '🌋',
    element: 'fire',
    rarity: 'rare',
    theme: 'element_fire',
    priceMilk: 2000,
    priceGem: 0,
    bgStyle: 'linear-gradient(180deg, #E53935 0%, #D32F2F 40%, #FF8F00 85%, #FF6F00 100%)',
    bgImage: '/image/icons-ui/cosmetics/bg_volcano.webp',
    description: 'Hỏa diệm sơn sục sôi ý chí nhiệt huyết và kiên trì rèn luyện.',
    note: 'Hệ Hỏa · 2 000 🥛',
  },
  {
    id: 'room_deep_sea',
    category: 'room',
    name: 'Đáy biển',
    emoji: '🌊',
    element: 'water',
    rarity: 'rare',
    theme: 'element_water',
    priceMilk: 2000,
    priceGem: 0,
    bgStyle: 'linear-gradient(180deg, #0277BD 0%, #01579B 50%, #004D40 100%)',
    bgImage: '/image/icons-ui/cosmetics/bg_ocean.webp',
    description: 'Đáy đại dương sâu thẳm tĩnh lặng giúp tập trung trí tuệ.',
    note: 'Hệ Thủy · 2 000 🥛',
  },
  {
    id: 'room_bamboo',
    category: 'room',
    name: 'Rừng trúc',
    emoji: '🎋',
    element: 'wood',
    rarity: 'rare',
    theme: 'element_wood',
    priceMilk: 2000,
    priceGem: 0,
    bgStyle: 'linear-gradient(180deg, #81C784 0%, #AED581 40%, #DCEDC8 85%, #C5E1A5 100%)',
    bgImage: '/image/icons-ui/cosmetics/bg_bamboo.webp',
    description: 'Rừng trúc xanh thanh tịnh ngát hương trà mộc mạc.',
    note: 'Hệ Mộc · 2 000 🥛',
  },
  {
    id: 'room_gold_mine',
    category: 'room',
    name: 'Mỏ vàng',
    emoji: '⚙️',
    element: 'metal',
    rarity: 'rare',
    theme: 'element_metal',
    priceMilk: 2000,
    priceGem: 0,
    bgStyle: '#FFFDE7',
    description: 'Kho báu kim loại rực rỡ lấp lánh như thành quả học tập.',
    note: 'Hệ Kim · 2 000 🥛',
  },
  {
    id: 'room_cave',
    category: 'room',
    name: 'Hang đá',
    emoji: '🪨',
    element: 'earth',
    rarity: 'rare',
    theme: 'element_earth',
    priceMilk: 2000,
    priceGem: 0,
    bgStyle: '#EFEBE9',
    description: 'Thạch động vững chãi như nền móng ngữ pháp kiên cố.',
    note: 'Hệ Thổ · 2 000 🥛',
  },
  {
    id: 'room_light_temple',
    category: 'room',
    name: 'Đền ánh sáng',
    emoji: '☀️',
    element: 'light',
    rarity: 'rare',
    theme: 'element_light',
    priceMilk: 2000,
    priceGem: 0,
    bgStyle: '#FFF9C4',
    description: 'Ánh hào quang rực rỡ soi sáng con đường tri thức.',
    note: 'Hệ Ánh sáng · 2 000 🥛',
  },
  {
    id: 'room_night_forest',
    category: 'room',
    name: 'Rừng đêm',
    emoji: '🌑',
    element: 'dark',
    rarity: 'rare',
    theme: 'element_dark',
    priceMilk: 2000,
    priceGem: 0,
    bgStyle: '#263238',
    description: 'Màn đêm yên ắng của ánh trăng tĩnh mịch cho buổi học đêm.',
    note: 'Hệ Bóng tối · 2 000 🥛',
  },
  {
    id: 'room_cloud_peak',
    category: 'room',
    name: 'Đỉnh mây',
    emoji: '🌪️',
    element: 'wind',
    rarity: 'rare',
    theme: 'element_wind',
    priceMilk: 2000,
    priceGem: 0,
    bgStyle: '#E0F2F1',
    description: 'Đỉnh núi cao nơi ngọn gió tự do phiêu du.',
    note: 'Hệ Phong · 2 000 🥛',
  },
  {
    id: 'room_thunder_sky',
    category: 'room',
    name: 'Mây giông',
    emoji: '⚡',
    element: 'thunder',
    rarity: 'rare',
    theme: 'element_thunder',
    priceMilk: 2000,
    priceGem: 0,
    bgStyle: '#EDE7F6',
    description: 'Bầu trời sấm sét quyền năng bứt phá mọi giới hạn.',
    note: 'Hệ Lôi · 2 000 🥛',
  },
  {
    id: 'room_arena_ring',
    category: 'room',
    name: 'Võ đài',
    emoji: '🥋',
    element: 'neutral',
    rarity: 'rare',
    theme: 'element_neutral',
    priceMilk: 2000,
    priceGem: 0,
    bgStyle: '#FBE9E7',
    description: 'Sàn đấu danh vọng rực lửa tinh thần thi đua.',
    note: 'Hệ Vô · 2 000 🥛',
  },

  // Nền cao cấp Gem & Thẻ mùa
  {
    id: 'room_cherry',
    category: 'room',
    name: 'Vườn anh đào',
    emoji: '🌸',
    rarity: 'epic',
    theme: 'cherry',
    priceMilk: 0,
    priceGem: 40,
    bgStyle: '#FCE4EC',
    description: 'Khu vườn anh đào lãng mạn cánh hoa bay trong gió xuân.',
    note: 'Sử thi · 40 💎',
  },
  {
    id: 'room_aurora',
    category: 'room',
    name: 'Cực quang',
    emoji: '🌌',
    rarity: 'legendary',
    theme: 'cosmic',
    priceMilk: 0,
    priceGem: 90,
    bgStyle: '#0D1B2A',
    description: 'Dải cực quang huyền ảo chuyển động và đổi màu theo hệ của thú cưng.',
    note: 'Huyền thoại · 90 💎',
  },
  {
    id: 'room_heaven',
    category: 'room',
    name: 'Thiên đình',
    emoji: '☁️',
    rarity: 'legendary',
    theme: 'mythic',
    priceMilk: 0,
    priceGem: 90,
    bgStyle: '#F3E5F5',
    description: 'Cõi bồng lai tiên cảnh mây trôi thanh thoát, cổng trời mở khi tiến hoá.',
    note: 'Huyền thoại · 90 💎',
  },
  {
    id: 'room_floating_market',
    category: 'room',
    name: 'Chợ nổi',
    emoji: '🛶',
    rarity: 'season',
    theme: 'vietnam',
    priceMilk: 0,
    priceGem: 0,
    bgStyle: '#E0F7FA',
    description: 'Khung cảnh chợ nổi miền Tây sông nước nhộn nhịp đậm đà bản sắc.',
    note: 'Phần thưởng Thẻ mùa',
  },
];

// ── 2. Danh sách 15 Hào quang (Effects / Auras) ──────────────────────
export const EFFECT_ITEMS = [
  // Đồ cũ xếp lại
  {
    id: 'effect_leaves',
    category: 'effect',
    name: 'Lá rơi',
    emoji: '🍃',
    rarity: 'common',
    theme: 'nature',
    priceMilk: 800,
    priceGem: 0,
    description: 'Từng chiếc lá phong bay nhẹ nhàng êm dịu quanh thú cưng.',
    note: 'Tĩnh · 800 🥛',
  },
  {
    id: 'effect_bubbles',
    category: 'effect',
    name: 'Bong bóng',
    emoji: '🫧',
    rarity: 'common',
    theme: 'ocean',
    priceMilk: 800,
    priceGem: 0,
    description: 'Bong bóng nước lấp lánh bồng bềnh vui tươi.',
    note: 'Tĩnh · 800 🥛',
  },
  {
    id: 'effect_snow',
    category: 'effect',
    name: 'Tuyết rơi',
    emoji: '❄️',
    rarity: 'rare',
    theme: 'winter',
    priceMilk: 2000,
    priceGem: 0,
    description: 'Từng bông tuyết trắng xóa bay lượn tạo cảm giác mát lạnh.',
    note: 'Hiệu ứng · 2 000 🥛',
  },
  {
    id: 'effect_stars',
    category: 'effect',
    name: 'Sao sáng',
    emoji: '✨',
    rarity: 'rare',
    theme: 'space',
    priceMilk: 2000,
    priceGem: 0,
    description: 'Ánh sao lung linh tỏa sáng tôn vinh tiến bộ mỗi ngày.',
    note: 'Hiệu ứng · 2 000 🥛',
  },
  {
    id: 'effect_fire',
    category: 'effect',
    name: 'Ngọn lửa',
    emoji: '🔥',
    rarity: 'rare',
    theme: 'fire',
    priceMilk: 2000,
    priceGem: 0,
    description: 'Ngọn lửa rực cháy nhiệt huyết đam mê chinh phục mục tiêu.',
    note: 'Hiệu ứng · 2 000 🥛',
  },

  // Hào quang mốc học (không bán, tự mở khi đạt điều kiện)
  {
    id: 'effect_streak_fire',
    category: 'effect',
    name: 'Lửa streak',
    emoji: '🔥',
    rarity: 'achievement',
    theme: 'achievement',
    priceMilk: 0,
    priceGem: 0,
    description: 'Ngọn lửa bền bỉ tôn vinh chuỗi ngày học liên tục không ngừng nghỉ.',
    unlockCondition: { type: 'streak', value: 7 },
    note: 'Streak ≥ 7 ngày',
  },
  {
    id: 'effect_soundwave',
    category: 'effect',
    name: 'Sóng âm',
    emoji: '🎧',
    rarity: 'achievement',
    theme: 'achievement',
    priceMilk: 0,
    priceGem: 0,
    description: 'Vòng sóng âm nhịp nhàng thể hiện đôi tai thính nhạy của thú cưng.',
    unlockCondition: { type: 'skill_listening', value: 600 },
    note: 'Kỹ năng Nghe ≥ 600',
  },
  {
    id: 'effect_music_notes',
    category: 'effect',
    name: 'Nốt nhạc',
    emoji: '🎵',
    rarity: 'achievement',
    theme: 'achievement',
    priceMilk: 0,
    priceGem: 0,
    description: 'Những nốt nhạc du dương bay bổng mỗi khi cất lời phát âm.',
    unlockCondition: { type: 'skill_speaking', value: 600 },
    note: 'Kỹ năng Nói ≥ 600',
  },
  {
    id: 'effect_flying_words',
    category: 'effect',
    name: 'Chữ bay',
    emoji: '🔤',
    rarity: 'achievement',
    theme: 'achievement',
    priceMilk: 0,
    priceGem: 0,
    description: 'Dòng chữ tri thức bay lượn tượng trưng cho vốn đọc hiểu sâu rộng.',
    unlockCondition: { type: 'skill_reading', value: 600 },
    note: 'Kỹ năng Đọc ≥ 600',
  },
  {
    id: 'effect_ink_brush',
    category: 'effect',
    name: 'Mực vẽ',
    emoji: '🖋️',
    rarity: 'achievement',
    theme: 'achievement',
    priceMilk: 0,
    priceGem: 0,
    description: 'Nét mực tinh tế của ngòi bút sáng tạo không giới hạn.',
    unlockCondition: { type: 'skill_writing', value: 600 },
    note: 'Kỹ năng Viết ≥ 600',
  },
  {
    id: 'effect_almighty',
    category: 'effect',
    name: 'Toàn năng',
    emoji: '🌈',
    rarity: 'achievement',
    theme: 'achievement',
    priceMilk: 0,
    priceGem: 0,
    description: 'Hào quang cầu vồng vĩ đại — hiếm nhất game, dành cho học giả toàn diện.',
    unlockCondition: { type: 'all_skills', value: 1800 },
    note: 'Cả 4 kỹ năng ≥ 1 800',
  },

  // Hào quang Gem cao cấp
  {
    id: 'effect_cherry_petals',
    category: 'effect',
    name: 'Cánh hoa anh đào',
    emoji: '🌸',
    rarity: 'epic',
    theme: 'cherry',
    priceMilk: 0,
    priceGem: 40,
    description: 'Cánh hoa rơi tao nhã, mua cùng nền Vườn anh đào được giảm 20%!',
    note: 'Sử thi · 40 💎',
  },
  {
    id: 'effect_fireflies',
    category: 'effect',
    name: 'Đom đóm',
    emoji: '🪲',
    rarity: 'epic',
    theme: 'nature',
    priceMilk: 0,
    priceGem: 40,
    description: 'Đốm sáng đom đóm lập lòe ấm áp bay lượn quanh thú cưng.',
    note: 'Sử thi · 40 💎',
  },
  {
    id: 'effect_golden_dragon',
    category: 'effect',
    name: 'Rồng vàng',
    emoji: '🐉',
    rarity: 'legendary',
    theme: 'mythic',
    priceMilk: 0,
    priceGem: 90,
    description: 'Rồng thần uy dũng uốn lượn bảo vệ thú cưng, gầm vang khi vào Đấu trường.',
    note: 'Huyền thoại · 90 💎',
  },
  {
    id: 'effect_galaxy_spin',
    category: 'effect',
    name: 'Thiên hà xoay',
    emoji: '🌀',
    rarity: 'legendary',
    theme: 'cosmic',
    priceMilk: 0,
    priceGem: 90,
    description: 'Vòng xoáy ngân hà huyền ảo xoay chuyển và đổi màu theo hệ của thú cưng.',
    note: 'Huyền thoại · 90 💎',
  },
];

// Tất cả đồ trang trí gộp chung
export const ALL_COSMETIC_ITEMS = [...BACKGROUND_ITEMS, ...EFFECT_ITEMS];

export const COSMETIC_MAP = Object.fromEntries(
  ALL_COSMETIC_ITEMS.map((item) => [item.id, item])
);

// Tính giá mua kèm combo cùng chủ đề (giảm 20%)
export function getCosmeticPrice(item, hasSameThemeInCart = false) {
  const discount = hasSameThemeInCart ? 0.8 : 1.0;
  return {
    milk: Math.round((item.priceMilk || 0) * discount),
    gem: Math.round((item.priceGem || 0) * discount),
  };
}

/**
 * Kiểm tra xem người dùng đã đạt điều kiện mở khoá đồ Mốc học (achievement) hay chưa.
 * @param {object} item Vật phẩm từ ALL_COSMETIC_ITEMS
 * @param {object} userStats { streak, skills, lessonsCompleted, unitsCompleted }
 */
export function checkCosmeticUnlocked(item, userStats = {}) {
  if (!item || !item.unlockCondition) return true;
  const { type, value } = item.unlockCondition;
  const streak = Number(userStats.streak || 0);
  const skills = userStats.skills || userStats.skillXP || {};
  const listening = Number(skills.listening || 0);
  const speaking = Number(skills.speaking || 0);
  const reading = Number(skills.reading || 0);
  const writing = Number(skills.writing || 0);

  switch (type) {
    case 'streak':
      return streak >= value;
    case 'skill_listening':
      return listening >= value;
    case 'skill_speaking':
      return speaking >= value;
    case 'skill_reading':
      return reading >= value;
    case 'skill_writing':
      return writing >= value;
    case 'all_skills':
      return listening >= value && speaking >= value && reading >= value && writing >= value;
    case 'level_or_unit':
      return Number(userStats.unitsCompleted || userStats.lessonsCompleted || 0) >= value;
    default:
      return true;
  }
}

/**
 * Lấy chi tiết tiến độ mốc học tập của người dùng.
 * @param {object} item Vật phẩm từ ALL_COSMETIC_ITEMS
 * @param {object} userStats { streak, skills, lessonsCompleted, unitsCompleted }
 */
export function getMilestoneProgress(item, userStats = {}) {
  if (!item || !item.unlockCondition) {
    return { current: 1, target: 1, percent: 100, label: 'Mốc học', unit: '', isUnlocked: true };
  }
  const { type, value } = item.unlockCondition;
  const streak = Number(userStats.streak || 0);
  const skills = userStats.skills || userStats.skillXP || {};
  const listening = Number(skills.listening || 0);
  const speaking = Number(skills.speaking || 0);
  const reading = Number(skills.reading || 0);
  const writing = Number(skills.writing || 0);

  let current = 0;
  let label = '';
  let unit = '';

  switch (type) {
    case 'streak':
      current = streak;
      label = 'Chuỗi học liên tục (Streak)';
      unit = 'ngày';
      break;
    case 'skill_listening':
      current = listening;
      label = 'Điểm kỹ năng Nghe';
      unit = 'điểm';
      break;
    case 'skill_speaking':
      current = speaking;
      label = 'Điểm kỹ năng Nói';
      unit = 'điểm';
      break;
    case 'skill_reading':
      current = reading;
      label = 'Điểm kỹ năng Đọc';
      unit = 'điểm';
      break;
    case 'skill_writing':
      current = writing;
      label = 'Điểm kỹ năng Viết';
      unit = 'điểm';
      break;
    case 'all_skills':
      current = Math.min(listening, speaking, reading, writing);
      label = 'Cả 4 kỹ năng (mức thấp nhất hiện tại)';
      unit = 'điểm';
      break;
    case 'level_or_unit':
      current = Number(userStats.unitsCompleted || userStats.lessonsCompleted || 1);
      label = 'Bài học trên lộ trình';
      unit = 'bài';
      break;
    default:
      current = 1;
      label = 'Tiến độ học';
      unit = '';
  }

  const percent = Math.min(100, Math.round((current / value) * 100));
  const isUnlocked = current >= value;

  return {
    current,
    target: value,
    percent,
    label,
    unit,
    isUnlocked,
    note: item.note || '',
    description: item.description || '',
  };
}

