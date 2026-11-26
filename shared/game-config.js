// ============================================================
// Cowdi English — Cấu hình cân bằng Kinh tế & Chiến đấu v2.1
// ------------------------------------------------------------
// Nguồn sự thật: docs/04-design/SDD-ECONOMY-BATTLE-v2.1.md
// Thuật ngữ:     docs/00-general/GLO-ECONOMY-BATTLE-VI-EN.md
//
// Quy ước (mục 0.5.1): mọi key là tiếng Anh, chữ hiển thị tiếng Việt
// nằm ở `labelVi` / `descVi`. Không hard-code số trong logic — mọi hằng
// số cân bằng nằm ở file này. File này là ESM thuần, import được từ cả
// src/ (Vite) và server/ (Node ESM).
//
// Các mục ghi [MỞ] là giá trị mặc định chưa chốt.
// ============================================================

function deepFreeze(obj) {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const v of Object.values(obj)) deepFreeze(v);
  }
  return obj;
}

// ---------- Kỹ năng (thứ tự chuẩn Nghe / Nói / Đọc / Viết) ----------
export const SKILL_KEYS = deepFreeze(['listening', 'speaking', 'reading', 'writing']);

export const SKILLS = deepFreeze({
  listening: { labelVi: 'Nghe', stat: 'hp' },
  speaking:  { labelVi: 'Nói',  stat: 'atk' },   // Nói còn tăng critMult (4.1)
  reading:   { labelVi: 'Đọc',  stat: 'def' },
  writing:   { labelVi: 'Viết', stat: 'agi' },
});

// ---------- Chỉ số (mục 4) ----------
export const STATS = deepFreeze({
  hp:       { labelVi: 'HP' },
  atk:      { labelVi: 'Tấn công' },
  def:      { labelVi: 'Phòng thủ' },
  agi:      { labelVi: 'Nhanh nhẹn' },
  critMult: { labelVi: 'Hệ số crit' },
});

// Hệ số căn bậc hai theo điểm kỹ năng thô (4.1). Không có trần.
export const STAT_FORMULA = deepFreeze({
  hpPerSqrtListening: 4.9,
  atkPerSqrtSpeaking: 0.5,
  defPerSqrtReading: 2.45,
  agiPerSqrtWriting: 1.47,
  critMultBase: 1.4,               // hệ Kim ghi đè bằng ELEMENTS.metal.critMultBase
  critMultPerSqrtSpeaking: 0.012,
});

// ---------- Tiền tệ & vật phẩm (mục 2) ----------
export const CURRENCIES = deepFreeze({
  milk:        { labelVi: 'Sữa',               icon: '🥛' },
  gem:         { labelVi: 'Gem',               icon: '💎' },
  stone:       { labelVi: 'Đá nguyên tố',      icon: '🪨' },
  stone_shard: { labelVi: 'Mảnh đá nguyên tố', icon: '🧩' },
});

export const ECONOMY = deepFreeze({
  // 2.2 — 1 Gem mỗi 2 bài học hoàn thành lần đầu.
  GEM_PER_NEW_LESSONS: 2,
  // 2.2, D2 — Thưởng Gem theo unit (mỗi unit nhận 1 lần).
  GEM_PER_UNIT: 1,
  GEM_PER_UNIT_PERFECT: 2,
  // 2.3 — 1 Đá mỗi 10 bài học hoàn thành lần đầu.
  STONE_PER_NEW_LESSONS: 10,
  // 2.3, D10 — Đá dùng chung 1 loại (chưa tách theo 10 hệ).
  STONE_PER_ELEMENT: false,
  // 2.3 — Gem nạp tiền KHÔNG được thay Đá trực tiếp.
  GEM_CAN_REPLACE_STONE: false,
  // 2.3, D3 — Đổi Gem lấy đá (tối đa 1 lần/tuần, reset thứ Hai).
  GEM_PER_STONE: 15,
  STONE_EXCHANGE_PER_WEEK: 1,
  // 2.3 — Ghép mảnh đá thành đá nguyên tố (10 mảnh = 1 đá).
  SHARDS_PER_STONE: 10,
});

// Lý do ghi ledger (6.1). `purchase` có sẵn dù chưa làm nạp tiền.
export const LEDGER_REASONS = deepFreeze([
  'lesson_first', 'lesson_milestone', 'unit_complete', 'unit_perfect',
  'stone_exchange', 'shard_combine', 'evolve', 'purchase', 'migration', 'coin_migration', 'admin',
  'shop_freeze', 'shop_return_ticket', 'contract_deposit', 'contract_payout', 'shop_clock', 'clock_bonus',
  'invite_activated', 'invite_welcome', 'invite_milestone',
]);

// ---------- Bạn bè & Thưởng mời bạn (SRS-FRIENDS v1.1, BR-01..BR-07) ----------
export const INVITE_REWARDS = deepFreeze({
  MIN_NEW_LESSONS: 3,
  MIN_DISTINCT_DAYS: 2,
  WINDOW_DAYS: 14,
  TIMEZONE: 'Asia/Ho_Chi_Minh',
  SENDER_GEM: 3,
  SENDER_GEM_MAX_PER_MONTH: 10,
  RECEIVER_MILK: 500,
  TICKETS_MAX_PER_MONTH: 3,
  ANTI_FRAUD_HOURS: 24,
  DAILY_INVITE_LIMIT: 5,
  WEEKLY_INVITE_LIMIT: 20,
  EXPIRY_DAYS: 7,
  MILESTONES: [
    { count: 3,  tickets: 1, titleId: 'title_invite_guide',      titleVi: 'Người dẫn đường' },
    { count: 5,  tickets: 1, titleId: null,                      titleVi: null },
    { count: 10, tickets: 2, titleId: 'title_invite_sower',      titleVi: 'Người gieo mầm' },
    { count: 20, tickets: 2, titleId: 'title_invite_ambassador', titleVi: 'Đại sứ Cowdi' },
  ],
});

export const FRIEND_LIMITS = deepFreeze({
  MAX_FRIENDS: 100,
  MAX_PENDING_REQUESTS: 20,
  MAX_REQUESTS_PER_HOUR: 20,
  CODE_LENGTH: 8,
  CODE_ALPHABET: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  NICKNAME_MIN: 2,
  NICKNAME_MAX: 20,
  PATH_CACHE_MS: 5 * 60 * 1000,
  MAX_AVATARS_PER_NODE: 3,
});

// ---------- Vật phẩm Giữ nhịp (GĐ3, D1) ----------
export const KEEP_RHYTHM_ITEMS = deepFreeze({
  freeze: {
    id: 'streak_freeze',
    nameVi: 'Khăn giữ lửa',
    priceMilk: 400,
    maxInventory: 2,
    maxBuyPerWeek: 2,
    milestoneGifts: [7, 30, 100], // Mốc streak tặng 1 khăn nếu kho < 2 (D13)
  },
  returnTicket: {
    id: 'return_ticket',
    nameVi: 'Vé quay lại',
    priceMilk: 300,
    cooldownDays: 30,
    minBrokenStreak: 7,
    minInactiveDays: 2,
    maxInactiveDays: 14,
    requiredLessons: 2,
    requiredHours: 24,
    restoreRatio: 0.5, // Khôi phục 50% streak cũ
  },
  contract: {
    id: 'streak_contract_7d',
    nameVi: 'Khế ước 7 ngày',
    durationDays: 7,
    rewardMultiplier: 1.5,
    minAccuracy: 70, // Bài làm lại cần >= 70% để tính
    tiers: {
      starter: { id: 'starter', labelVi: 'Khởi động', deposit: 300, lessonsPerDay: 1, payout: 450, profit: 150 },
      diligent: { id: 'diligent', labelVi: 'Chăm chỉ', deposit: 700, lessonsPerDay: 2, payout: 1050, profit: 350 },
      breakthrough: { id: 'breakthrough', labelVi: 'Bứt phá', deposit: 1500, lessonsPerDay: 3, payout: 2250, profit: 750 },
    },
  },
  clock: {
    id: 'cowdi_clock',
    nameVi: 'Đồng hồ Cowdi',
    priceMilk: 1000,
    bonusMilkPercent: 0.10, // +10% Sữa
    maxBonusLessonsPerDay: 3,
    windowMinutes: 60, // ±1 giờ (trong khoảng 60 phút trước và sau giờ đã chọn)
    freeChangePerWeek: 1,
  },
});

// ---------- Tiến hoá (mục 3, 4.2) ----------
// stage = pet.evolution (0–4) ↔ C1–C5.
export const EVOLUTION_STAGES = deepFreeze([
  { stage: 0, code: 'C1', hp: 100, atk: 10 },
  { stage: 1, code: 'C2', hp: 120, atk: 12 },
  { stage: 2, code: 'C3', hp: 150, atk: 15 },
  { stage: 3, code: 'C4', hp: 180, atk: 18 },
  { stage: 4, code: 'C5', hp: 200, atk: 20 },
]);
export const MAX_EVOLUTION = EVOLUTION_STAGES.length - 1;

// Chi phí theo cấp hiện tại `from` (3.2). Tài nguyên bị trừ; điểm kỹ năng chỉ là điều kiện.
//   req.type 'total'    → tổng 4 kỹ năng ≥ min
//   req.type 'perSkill' → từng kỹ năng ≥ PET_BATTLE_DATA[id].evolveReq[req.key]
export const EVOLUTION_COSTS = deepFreeze([
  { from: 0, to: 1, milk: 500,   gem: 0,  stone: 0,  req: { type: 'total', min: 60 } },
  { from: 1, to: 2, milk: 1500,  gem: 1,  stone: 0,  req: { type: 'total', min: 160 } },
  { from: 2, to: 3, milk: 5000,  gem: 25, stone: 1,  req: { type: 'perSkill', key: 'c4' } },
  { from: 3, to: 4, milk: 20000, gem: 50, stone: 10, req: { type: 'perSkill', key: 'c5' } },
]);

// ---------- Độ hiếm (4.3) ----------
// Ánh xạ độ hiếm trong code (pets.js) → độ hiếm thiết kế.
export const RARITY_ALIASES = deepFreeze({ starter: 'common' });

export const RARITIES = deepFreeze({
  common:    { labelVi: 'Thường',      hp: 0,  atk: 0, groupSkillFromStage: 2 }, // C3
  rare:      { labelVi: 'Hiếm',        hp: 8,  atk: 1, groupSkillFromStage: 1 }, // C2
  event:     { labelVi: 'Sự kiện',     hp: 8,  atk: 1, groupSkillFromStage: 1 }, // C2
  epic:      { labelVi: 'Sử thi',      hp: 15, atk: 2, groupSkillFromStage: 0 }, // C1
  legendary: { labelVi: 'Huyền thoại', hp: 25, atk: 3, groupSkillFromStage: 0 }, // C1
});

// ---------- 10 hệ (5.5) ----------
// hpPct/atkPct: nhân (1 + x). def/agi: cộng phẳng. critFlat: crit phẳng không bị triệt tiêu.
export const ELEMENTS = deepFreeze({
  metal: {
    labelVi: 'Kim', hpPct: 0, atkPct: 0.12, def: 0, agi: 0, critFlat: 0.08,
    critMultBase: 1.7,
    descVi: 'Crit gây sát thương mạnh hơn (hệ số gốc ×1.7 thay ×1.4).',
  },
  wood: {
    labelVi: 'Mộc', hpPct: 0.13, atkPct: 0, def: 0, agi: 0, critFlat: 0,
    healOnCorrectPct: 0.01,
    descVi: 'Hồi 1% HP tối đa mỗi câu đúng.',
  },
  water: {
    labelVi: 'Thủy', hpPct: 0.12, atkPct: 0, def: 0, agi: 6, critFlat: 0,
    healOnDodgePct: 0.05,
    descVi: 'Hồi 5% HP tối đa mỗi lần né.',
  },
  fire: {
    labelVi: 'Hỏa', hpPct: 0, atkPct: 0.11, def: 0, agi: 0, critFlat: 0.03,
    burnPct: 0.01, burnTurns: 2,
    descVi: 'Mỗi đòn trúng gây bỏng 1% HP tối đa của đối thủ mỗi lượt trong 2 lượt.',
  },
  earth: {
    labelVi: 'Thổ', hpPct: 0.05, atkPct: 0, def: 12, agi: 0, critFlat: 0,
    critBonusTakenFactor: 0.5,
    descVi: 'Giảm 50% phần sát thương cộng thêm khi bị crit.',
  },
  dark: {
    labelVi: 'Bóng tối', hpPct: 0, atkPct: 0.08, def: 0, agi: 9, critFlat: 0.06,
    lifestealPct: 0.10,
    descVi: 'Hút 10% sát thương gây ra.',
  },
  light: {
    labelVi: 'Ánh sáng', hpPct: 0.03, atkPct: 0, def: 4, agi: 0, critFlat: 0,
    shieldHits: 1,
    descVi: 'Lá chắn chặn đòn trúng đầu tiên.',
  },
  neutral: {
    labelVi: 'Vô', hpPct: 0.13, atkPct: 0.04, def: 4, agi: 3, critFlat: 0,
    descVi: 'Không khắc, không bị khắc.',
  },
  wind: {
    labelVi: 'Phong', hpPct: 0.03, atkPct: 0, def: 0, agi: 14, critFlat: 0.08,
    extraFastAnswers: 2,
    descVi: 'Thêm 2 câu đúng được tính là trả lời nhanh.',
  },
  thunder: {
    labelVi: 'Lôi', hpPct: 0, atkPct: 0.07, def: 0, agi: 5, critFlat: 0.15,
    stunOnCrit: true,
    descVi: 'Crit gây choáng: đối thủ không crit được ở đòn kế tiếp của họ.',
  },
});

// ---------- Vòng khắc (5.4) ----------
// attacker → danh sách hệ mà attacker khắc.
export const COUNTERS = deepFreeze({
  metal: ['wood'],
  wood: ['earth'],
  earth: ['water'],
  water: ['fire'],
  fire: ['metal'],
  light: ['dark'],
  dark: ['light'],
  wind: ['thunder'],
  thunder: ['wind'],
  neutral: [],
});

export const COUNTER_MULT = deepFreeze({ strong: 1.2, weak: 0.8, normal: 1 });

// ---------- 7 nhóm & kỹ năng nhóm (5.6) — cùng nhóm cùng giá trị ----------
export const GROUPS = deepFreeze({
  farm:   { labelVi: 'Nông trại', skill: 'wellFed' },
  herb:   { labelVi: 'Thảo mộc',  skill: 'deepRoots' },
  hunter: { labelVi: 'Thú săn',   skill: 'huntersInstinct' },
  sea:    { labelVi: 'Biển',      skill: 'waveRider' },
  sky:    { labelVi: 'Bầu trời',  skill: 'highGround' },
  dragon: { labelVi: 'Rồng',      skill: 'dragonBlood' },
  spirit: { labelVi: 'Linh thể',  skill: 'spiritAura' },
});

export const GROUP_SKILLS = deepFreeze({
  wellFed: {
    labelVi: 'No đủ', streakMin: 3, healPct: 0.02,
    descVi: 'Từ câu đúng thứ 3 liên tiếp trở đi, mỗi câu đúng hồi 2% HP tối đa.',
  },
  deepRoots: {
    labelVi: 'Bám rễ', hpThreshold: 0.5, damageReduction: 0.30,
    descVi: 'Khi HP dưới 50%, giảm 30% sát thương nhận.',
  },
  huntersInstinct: {
    labelVi: 'Bản năng săn', streakMin: 3, atkBonusPct: 0.10,
    descVi: 'Sau chuỗi 3 câu đúng liên tiếp, +10% Tấn công đến hết trận.',
  },
  waveRider: {
    labelVi: 'Lướt sóng', dodgeFlat: 0.03, critAfterDodge: true,
    descVi: '+3% né; né được thì câu đúng kế tiếp chắc chắn crit.',
  },
  highGround: {
    labelVi: 'Tầm cao', defIgnorePct: 0.20,
    descVi: 'Đòn đánh bỏ qua 20% phòng thủ của đối thủ.',
  },
  dragonBlood: {
    labelVi: 'Long huyết', critMultBonus: 0.1, effectMultOnCrit: 2,
    descVi: 'Hệ số crit +0.1; đòn crit làm hiệu ứng hệ (bỏng, hồi, hút…) mạnh gấp đôi.',
  },
  spiritAura: {
    labelVi: 'Linh khí', immunities: 1, damageReduction: 0.04,
    descVi: 'Miễn hiệu ứng xấu đầu tiên (bỏng, choáng); giảm 4% sát thương nhận.',
  },
});

// ---------- Chiến đấu (5.1, 5.3) ----------
export const BATTLE = deepFreeze({
  // [MỞ] 0.5.6 — trận mới cố định 10 câu. Engine vẫn chạy được N câu bất kỳ.
  DUEL_QUESTIONS: 10,
  // [MỞ] 5.1 — HP về 0 giữa trận vẫn chấm hết các câu (HP kẹp ở 0).
  STOP_AT_ZERO: false,
  // 5.1 — ghép trận chênh tối đa 1 cấp tiến hoá.
  MATCH_MAX_STAGE_DIFF: 1,
  // 5.3 — trả lời nhanh (< 3 giây) luôn crit.
  FAST_ANSWER_MS: 3000,
  // 5.3 — mỗi điểm chênh AGI = 0.5% né/crit.
  AGI_DIFF_FACTOR: 0.005,
});

// ---------- Hệ, nhóm, điều kiện tiến hoá từng pet (3.3, 5.7) ----------
// evolveReq: [Nghe, Nói, Đọc, Viết] để lên C4 / C5.
// Độ hiếm KHÔNG lặp ở đây — lấy từ PET_REGISTRY[id].rarity (src/data/pets.js).
export const PET_BATTLE_DATA = deepFreeze({
  cowdi:    { element: 'neutral', group: 'farm', rarity: 'starter',   evolveReq: { c4: [250, 60, 150, 60],  c5: [600, 150, 400, 150] } },
  bamboo:   { element: 'neutral', group: 'farm', rarity: 'epic',   evolveReq: { c4: [250, 60, 150, 60],  c5: [600, 150, 400, 150] } },
  bun:      { element: 'metal',   group: 'farm', rarity: 'epic',   evolveReq: { c4: [150, 250, 60, 60],  c5: [400, 600, 150, 150] } },
  paddy:    { element: 'wood',    group: 'herb', rarity: 'common',   evolveReq: { c4: [250, 60, 150, 60],  c5: [600, 150, 400, 150] } },
  sprout:   { element: 'wood',    group: 'herb', rarity: 'rare',   evolveReq: { c4: [150, 60, 60, 250],  c5: [400, 150, 150, 600] } },
  mushroom: { element: 'earth',   group: 'herb', rarity: 'rare',   evolveReq: { c4: [150, 60, 250, 60],  c5: [400, 150, 600, 150] } },
  radish:   { element: 'earth',   group: 'herb', rarity: 'rare',   evolveReq: { c4: [150, 60, 250, 60],  c5: [400, 150, 600, 150] } },
  ginseng:  { element: 'earth',   group: 'herb', rarity: 'epic',   evolveReq: { c4: [250, 60, 150, 60],  c5: [600, 150, 400, 150] } },
  foxie:    { element: 'fire',    group: 'hunter', rarity: 'common', evolveReq: { c4: [60, 250, 60, 150],  c5: [150, 600, 150, 400] } },
  leo:      { element: 'metal',   group: 'hunter', rarity: 'epic', evolveReq: { c4: [150, 250, 60, 60],  c5: [400, 600, 150, 150] } },
  shadow:   { element: 'dark',    group: 'hunter', rarity: 'epic', evolveReq: { c4: [60, 150, 60, 250],  c5: [150, 400, 150, 600] } },
  pingu:    { element: 'water',   group: 'sea', rarity: 'common',    evolveReq: { c4: [150, 60, 60, 250],  c5: [400, 150, 150, 600] } },
  leafy:    { element: 'wood',    group: 'sea', rarity: 'common',    evolveReq: { c4: [150, 60, 250, 60],  c5: [400, 150, 600, 150] } },
  flippy:   { element: 'water',   group: 'sea', rarity: 'rare',    evolveReq: { c4: [250, 60, 60, 150],  c5: [600, 150, 150, 400] } },
  mimi:     { element: 'wind',    group: 'sky', rarity: 'rare',    evolveReq: { c4: [60, 60, 150, 250],  c5: [150, 150, 400, 600] } },
  owlbert:  { element: 'wind',    group: 'sky', rarity: 'rare',    evolveReq: { c4: [60, 60, 250, 150],  c5: [150, 150, 600, 400] } },
  storm:    { element: 'thunder', group: 'sky', rarity: 'epic',    evolveReq: { c4: [60, 150, 60, 250],  c5: [150, 400, 150, 600] } },
  sparky:   { element: 'fire',    group: 'dragon', rarity: 'rare', evolveReq: { c4: [60, 250, 60, 150],  c5: [150, 600, 150, 400] } },
  draco:    { element: 'fire',    group: 'dragon', rarity: 'legendary', evolveReq: { c4: [150, 250, 60, 60],  c5: [400, 600, 150, 150] } },
  pumpkin:       { element: 'dark',    group: 'spirit', rarity: 'event', evolveReq: { c4: [60, 60, 150, 250],  c5: [150, 150, 400, 600] } },
  monk:          { element: 'light',   group: 'spirit', rarity: 'event', evolveReq: { c4: [150, 60, 250, 60],  c5: [400, 150, 600, 150] } },
  prisma:        { element: 'light',   group: 'spirit', rarity: 'legendary', evolveReq: { c4: [250, 60, 150, 60],  c5: [600, 150, 400, 150] } },
  bamboo_spirit: { element: 'wood',    group: 'spirit', rarity: 'epic', evolveReq: { c4: [150, 250, 60, 60],  c5: [400, 600, 150, 150] } },
});

// Gợi ý 4.3 — power score cho leaderboard (Phase 2 mới dùng).
export const POWER_SCORE = deepFreeze({ hpDiv: 10, atkMul: 1, defDiv: 2, agiDiv: 2 });

// ============================================================
// HỆ THỐNG ĐẤU TRƯỜNG V2 (GĐ5 · D4, D15, D16, D17)
// ============================================================

export const TRIGGER_TYPES = deepFreeze({
  energy_full:  { priority: 1, labelVi: 'Tuyệt kỹ!', defaultVal: 5 },
  low_hp:       { priority: 2, labelVi: 'Cứu nguy!', defaultVal: 0.30 },
  combo_streak: { priority: 3, labelVi: '3 câu liên tiếp!', defaultVal: 3 },
  skill_match:  { priority: 4, labelVi: 'Đúng sở trường!', defaultVal: 1 },
  fast_answer:  { priority: 5, labelVi: 'Nhanh như chớp!', defaultVal: 5000 },
});

export const TRIGGER_PRIORITY_ORDER = deepFreeze([
  'energy_full',
  'low_hp',
  'combo_streak',
  'skill_match',
  'fast_answer',
]);

export const ARENA_CONFIG = deepFreeze({
  // Vé đấu (D4)
  TICKETS: {
    DAILY_FREE: 3,
    PER_NEW_LESSON: 2,
    PER_UNIT_100: 3,
    MAX_CAP: 15,
  },
  // Bậc xếp hạng LP (D15)
  TIERS: {
    bronze:   { key: 'bronze',   labelVi: 'Đồng',      minLp: 0,    icon: '🥉', canLoseLp: false },
    silver:   { key: 'silver',   labelVi: 'Bạc',       minLp: 200,  icon: '🥈', canLoseLp: true },
    gold:     { key: 'gold',     labelVi: 'Vàng',      minLp: 500,  icon: '🥇', canLoseLp: true },
    platinum: { key: 'platinum', labelVi: 'Bạch kim',  minLp: 900,  icon: '💠', canLoseLp: true },
    diamond:  { key: 'diamond',  labelVi: 'Kim cương', minLp: 1400, icon: '💎', canLoseLp: true },
    master:   { key: 'master',   labelVi: 'Cao thủ',   minLp: 2000, icon: '👑', canLoseLp: true },
  },
  // Điểm LP trận xếp hạng
  LP: {
    WIN: 20,
    DRAW: 5,
    LOSS: -12,
    BOT_RATIO: 0.5, // Đối thủ luyện tập AI tính 50% LP (+10 / +2 / -6)
  },
  // Thưởng Sữa mỗi trận có vé (qua ledger)
  REWARD_MILK: {
    WIN: 8,
    DRAW: 5,
    LOSS: 2,
  },
  // Rương tuần theo số trận thắng có vé
  WEEKLY_CHESTS: {
    bronze: { id: 'bronze', winsRequired: 5,  labelVi: 'Rương Đồng',  rewardMilk: 30,  rewardGem: 0, rewardStoneShards: 0 },
    silver: { id: 'silver', winsRequired: 15, labelVi: 'Rương Bạc',   rewardMilk: 60,  rewardGem: 1, rewardStoneShards: 0 },
    gold:   { id: 'gold',   winsRequired: 30, labelVi: 'Rương Vàng',  rewardMilk: 100, rewardGem: 2, rewardStoneShards: 2 },
  },
  // Chống lạm dụng
  MAX_DAILY_REWARDED_MATCHES_PER_OPPONENT: 2,
  // Cỏ ba lá
  CLOVER: {
    MAX_DAILY_GIVE: 5,
    MILK_PER_CLOVER: 5,
    MAX_DAILY_RECEIVE_MILK: 50,
  },
  // Mùa giải
  SEASON_DURATION_WEEKS: 4,
  FAST_ANSWER_TRIGGER_MS: 5000, // <= 5s
  COMBO_STREAK_TRIGGER: 3,      // 3 câu đúng liên tiếp
  LOW_HP_TRIGGER_RATIO: 0.30,   // <= 30% HP
  ENERGY_FULL_TRIGGER: 5,       // 5 câu đúng
});

// Kỹ năng kích hoạt tự động theo 5 loại trigger (v0.2) cho 23 pet
export const PET_SKILLS = deepFreeze({
  cowdi: {
    id: 'milk_boost',
    nameVi: 'Sữa Tươi Tăng Lực',
    labelVi: '3 câu liên tiếp!',
    descVi: 'Hồi 15% HP tối đa sau khi trả lời đúng 3 câu liên tiếp.',
    effectType: 'heal',
    effectVal: 0.15,
    activation: {
      trigger: 'combo_streak',
      value: 3,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  bamboo: {
    id: 'bamboo_strike',
    nameVi: 'Trúc Diệp Liên Hoàn',
    labelVi: '3 câu liên tiếp!',
    descVi: 'Gây thêm sát thương bằng 25% Tấn công sau khi đạt chuỗi 3 câu đúng.',
    effectType: 'damage',
    effectVal: 0.25,
    activation: {
      trigger: 'combo_streak',
      value: 3,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  bun: {
    id: 'steamed_shield',
    nameVi: 'Hấp Hơi Nóng Hổi',
    labelVi: '3 câu liên tiếp!',
    descVi: 'Hồi 12% HP và tăng phòng thủ sau 3 câu đúng liên tiếp.',
    effectType: 'heal',
    effectVal: 0.12,
    activation: {
      trigger: 'combo_streak',
      value: 3,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  paddy: {
    id: 'golden_song',
    nameVi: 'Lúa Vàng Thính Giác',
    labelVi: 'Đúng sở trường!',
    descVi: 'Hồi 15% HP khi trả lời đúng câu hỏi kỹ năng Nghe.',
    effectType: 'heal',
    effectVal: 0.15,
    specialty: 'listening',
    activation: {
      trigger: 'skill_match',
      value: 1,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  sprout: {
    id: 'creative_bud',
    nameVi: 'Mầm Xanh Bút Lực',
    labelVi: 'Đúng sở trường!',
    descVi: 'Gây thêm 20% sát thương khi trả lời đúng câu hỏi kỹ năng Viết.',
    effectType: 'damage',
    effectVal: 0.20,
    specialty: 'writing',
    activation: {
      trigger: 'skill_match',
      value: 1,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  mushroom: {
    id: 'survival_spore',
    nameVi: 'Bào Tử Sinh Tồn',
    labelVi: 'Cứu nguy!',
    descVi: 'Khi HP dưới 30%, lập tức hồi 25% HP tối đa (1 lần/trận).',
    effectType: 'heal',
    effectVal: 0.25,
    activation: {
      trigger: 'low_hp',
      value: 0.30,
      cooldown_turns: 0,
      uses_per_battle: 1,
      min_stage: 'baby',
    },
  },
  radish: {
    id: 'deep_root_revive',
    nameVi: 'Củ Trắng Bám Rễ',
    labelVi: 'Cứu nguy!',
    descVi: 'Khi HP dưới 30%, nhận lá chắn chặn 1 đòn và hồi 15% HP (1 lần/trận).',
    effectType: 'heal_shield',
    effectVal: 0.15,
    activation: {
      trigger: 'low_hp',
      value: 0.30,
      cooldown_turns: 0,
      uses_per_battle: 1,
      min_stage: 'baby',
    },
  },
  ginseng: {
    id: 'millennium_energy',
    nameVi: 'Nhân Sâm Ngàn Năm',
    labelVi: 'Tuyệt kỹ!',
    descVi: 'Khi đầy năng lượng, giải phóng dược lực hồi 35% HP tối đa.',
    effectType: 'heal',
    effectVal: 0.35,
    activation: {
      trigger: 'energy_full',
      value: 5,
      cooldown_turns: 0,
      uses_per_battle: 1,
      min_stage: 'baby',
    },
  },
  foxie: {
    id: 'swift_flame',
    nameVi: 'Hỏa Tốc Chi Kích',
    labelVi: 'Nhanh như chớp!',
    descVi: 'Trả lời đúng trong 5 giây đầu gây thêm 25% sát thương Hỏa.',
    effectType: 'damage',
    effectVal: 0.25,
    activation: {
      trigger: 'fast_answer',
      value: 5000,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  leo: {
    id: 'roaring_pride',
    nameVi: 'Hùng Âm Vương Giả',
    labelVi: 'Đúng sở trường!',
    descVi: 'Gây thêm 30% sát thương khi trả lời đúng câu hỏi kỹ năng Nói.',
    effectType: 'damage',
    effectVal: 0.30,
    specialty: 'speaking',
    activation: {
      trigger: 'skill_match',
      value: 1,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  shadow: {
    id: 'night_strike',
    nameVi: 'Ám Dạ Đột Kích',
    labelVi: 'Nhanh như chớp!',
    descVi: 'Trả lời đúng nhanh dưới 5 giây gây thêm 20% sát thương và hút 15% lượng đó.',
    effectType: 'damage_lifesteal',
    effectVal: 0.20,
    activation: {
      trigger: 'fast_answer',
      value: 5000,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  pingu: {
    id: 'glacial_barrier',
    nameVi: 'Khiên Băng Cứu Nguy',
    labelVi: 'Cứu nguy!',
    descVi: 'Khi HP dưới 30%, dựng khiên băng hồi 20% HP và tăng 1 lá chắn (1 lần/trận).',
    effectType: 'heal_shield',
    effectVal: 0.20,
    activation: {
      trigger: 'low_hp',
      value: 0.30,
      cooldown_turns: 0,
      uses_per_battle: 1,
      min_stage: 'baby',
    },
  },
  leafy: {
    id: 'ancient_shell',
    nameVi: 'Mai Rùa Thảo Mộc',
    labelVi: 'Đúng sở trường!',
    descVi: 'Hồi 15% HP khi trả lời đúng câu hỏi kỹ năng Đọc.',
    effectType: 'heal',
    effectVal: 0.15,
    specialty: 'reading',
    activation: {
      trigger: 'skill_match',
      value: 1,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  flippy: {
    id: 'tidal_surge',
    nameVi: 'Sóng Biển Dâng Trào',
    labelVi: '3 câu liên tiếp!',
    descVi: 'Đạt chuỗi 3 câu đúng phóng sóng ngầm gây thêm 25% sát thương Thủy.',
    effectType: 'damage',
    effectVal: 0.25,
    activation: {
      trigger: 'combo_streak',
      value: 3,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  mimi: {
    id: 'gale_edge',
    nameVi: 'Gió Lốc Thần Tốc',
    labelVi: 'Nhanh như chớp!',
    descVi: 'Trả lời nhanh trong 5 giây đầu phóng lưỡi dao gió gây thêm 25% sát thương.',
    effectType: 'damage',
    effectVal: 0.25,
    activation: {
      trigger: 'fast_answer',
      value: 5000,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  owlbert: {
    id: 'wise_gaze',
    nameVi: 'Đôi Mắt Trí Tuệ',
    labelVi: 'Đúng sở trường!',
    descVi: 'Gây thêm 30% sát thương khi trả lời đúng câu hỏi kỹ năng Đọc.',
    effectType: 'damage',
    effectVal: 0.30,
    specialty: 'reading',
    activation: {
      trigger: 'skill_match',
      value: 1,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  storm: {
    id: 'thunder_surge',
    nameVi: 'Sấm Chớp Giáng Trần',
    labelVi: 'Nhanh như chớp!',
    descVi: 'Trả lời đúng nhanh dưới 5 giây gây thêm 25% sát thương Lôi.',
    effectType: 'damage',
    effectVal: 0.25,
    activation: {
      trigger: 'fast_answer',
      value: 5000,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  sparky: {
    id: 'dragon_spark',
    nameVi: 'Hỏa Long Tinh Hoa',
    labelVi: '3 câu liên tiếp!',
    descVi: 'Đạt chuỗi 3 câu đúng phun lửa rồng gây thêm 30% sát thương Hỏa.',
    effectType: 'damage',
    effectVal: 0.30,
    activation: {
      trigger: 'combo_streak',
      value: 3,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
  draco: {
    id: 'ancient_dragon_breath',
    nameVi: 'Hơi Thở Cổ Long',
    labelVi: 'Tuyệt kỹ!',
    descVi: 'Khi đầy 5 năng lượng, thi triển tuyệt kỹ gây 50% sát thương bộc phá (1 lần/trận).',
    effectType: 'damage',
    effectVal: 0.50,
    activation: {
      trigger: 'energy_full',
      value: 5,
      cooldown_turns: 0,
      uses_per_battle: 1,
      min_stage: 'baby',
    },
  },
  pumpkin: {
    id: 'spectral_fest',
    nameVi: 'Lễ Hội Ma Quái',
    labelVi: 'Tuyệt kỹ!',
    descVi: 'Khi đầy năng lượng, tung lửa ma thuật gây 45% sát thương và gây bỏng đối thủ.',
    effectType: 'damage',
    effectVal: 0.45,
    activation: {
      trigger: 'energy_full',
      value: 5,
      cooldown_turns: 0,
      uses_per_battle: 1,
      min_stage: 'baby',
    },
  },
  monk: {
    id: 'enlightened_light',
    nameVi: 'Ánh Sáng Giác Ngộ',
    labelVi: 'Cứu nguy!',
    descVi: 'Khi HP dưới 30%, tỏa hào quang hồi 25% HP và tạo 1 lá chắn chặn đòn.',
    effectType: 'heal_shield',
    effectVal: 0.25,
    activation: {
      trigger: 'low_hp',
      value: 0.30,
      cooldown_turns: 0,
      uses_per_battle: 1,
      min_stage: 'baby',
    },
  },
  prisma: {
    id: 'rainbow_aurora',
    nameVi: 'Cầu Vồng Tinh Tú',
    labelVi: 'Tuyệt kỹ!',
    descVi: 'Khi đầy năng lượng, triệu hồi cầu vồng hồi 30% HP và gây 30% sát thương ánh sáng.',
    effectType: 'heal_damage',
    effectVal: 0.30,
    activation: {
      trigger: 'energy_full',
      value: 5,
      cooldown_turns: 0,
      uses_per_battle: 1,
      min_stage: 'baby',
    },
  },
  bamboo_spirit: {
    id: 'spirit_resonance',
    nameVi: 'Linh Trúc Tâm Giao',
    labelVi: 'Đúng sở trường!',
    descVi: 'Gây thêm 25% sát thương và hồi 10% HP khi trả lời đúng kỹ năng Nói.',
    effectType: 'damage_heal',
    effectVal: 0.25,
    specialty: 'speaking',
    activation: {
      trigger: 'skill_match',
      value: 1,
      cooldown_turns: 2,
      uses_per_battle: null,
      min_stage: 'baby',
    },
  },
});

