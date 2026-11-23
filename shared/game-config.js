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
  milk:  { labelVi: 'Sữa',          icon: '🥛' },
  gem:   { labelVi: 'Gem',          icon: '💎' },
  stone: { labelVi: 'Đá nguyên tố', icon: '🪨' },
});

export const ECONOMY = deepFreeze({
  // [MỞ] 2.2 — 1 Gem mỗi 2 bài học hoàn thành lần đầu.
  GEM_PER_NEW_LESSONS: 2,
  // 2.3 — 1 Đá mỗi 10 bài học hoàn thành lần đầu.
  STONE_PER_NEW_LESSONS: 10,
  // [MỞ] 2.3 — Đá dùng chung 1 loại (chưa tách theo 10 hệ).
  STONE_PER_ELEMENT: false,
  // [MỞ] 2.3 — Gem nạp tiền KHÔNG được thay Đá.
  GEM_CAN_REPLACE_STONE: false,
});

// Lý do ghi ledger (6.1). `purchase` có sẵn dù chưa làm nạp tiền.
export const LEDGER_REASONS = deepFreeze([
  'lesson_first', 'lesson_milestone', 'evolve', 'purchase', 'migration', 'admin',
]);

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
