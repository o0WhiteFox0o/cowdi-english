// shared/regions.js — Vùng đất, Boss vùng & Cảnh nền (Story Bible mục 6.4)
// Boss gắn với VÙNG (region.boss = { pet_id, alt_pet_id }), KHÔNG gắn với ải.
// Tên và ảnh Boss luôn tra động từ PET_REGISTRY[pet_id], không gán cứng ở đây.

export const RING = ['VS', 'RM', 'RT', 'BS', 'CN', 'TG', 'CNS', 'DDL']; // thứ tự vòng, chiều kim đồng hồ
export const SPECIAL = ['BD', 'CBL'];

export const REGIONS = {
  VS:  {
    nameVi: 'Vườn Sữa',
    hosts: ['cowdi', 'bamboo', 'bamboo_spirit'],
    realRef: 'Cồn Sơn, Cần Thơ',
    boss: { pet_id: 'bamboo_spirit', alt_pet_id: 'bamboo' },
  },
  RM:  {
    nameVi: 'Rẫy Mầm',
    hosts: ['paddy', 'sprout', 'mushroom', 'radish', 'ginseng'],
    realRef: 'Làng hoa Sa Đéc, Đồng Tháp',
    boss: { pet_id: 'sprout', alt_pet_id: 'paddy' },
  },
  RT:  {
    nameVi: 'Rừng Tràm',
    hosts: ['foxie', 'leo', 'shadow'],
    realRef: 'Rừng tràm Trà Sư, An Giang',
    boss: { pet_id: 'leo', alt_pet_id: 'foxie' },
  },
  BS:  {
    nameVi: 'Bến Sóng',
    hosts: ['pingu', 'leafy', 'flippy'],
    realRef: 'Biển Mũi Nai, Hà Tiên, An Giang',
    boss: { pet_id: 'pingu', alt_pet_id: 'leafy' },
  },
  CN:  {
    nameVi: 'Chợ Nổi',
    hosts: ['bun'],
    realRef: 'Chợ nổi Cái Răng, Cần Thơ',
    boss: { pet_id: 'foxie', alt_pet_id: 'leo' },
  },
  TG:  {
    nameVi: 'Tháp Gió',
    hosts: ['mimi', 'owlbert', 'storm'],
    realRef: 'Cánh đồng điện gió Bạc Liêu, Cà Mau',
    boss: { pet_id: 'owlbert', alt_pet_id: 'mimi' },
  },
  CNS: {
    nameVi: 'Chín Nhánh Sông',
    hosts: ['sparky', 'draco'],
    realRef: 'Cồn Long–Lân–Quy–Phụng, sông Tiền',
    boss: { pet_id: 'sparky', alt_pet_id: 'draco' },
  },
  DDL: {
    nameVi: 'Đồi Đèn Lồng',
    hosts: ['monk', 'pumpkin', 'prisma'],
    realRef: 'Hồ Thủy Liêm, Núi Cấm, An Giang',
    boss: { pet_id: 'pumpkin', alt_pet_id: 'mimi' },
  },
  BD:  {
    nameVi: 'Bến Đò Ông Tư',
    hosts: [],
    humanHost: 'ong_tu',
    realRef: 'Bến đò Cô Bắc → Cồn Sơn, Cần Thơ',
    boss: { pet_id: 'flippy', alt_pet_id: 'pingu' },
  },
  CBL: {
    nameVi: 'Cổng Biển Lớn',
    hosts: [],
    realRef: 'Mũi Cà Mau',
    boss: { pet_id: 'draco', alt_pet_id: 'sparky' },
  },
};

export const VARIANTS = [
  { id: 'sang-suong',   nameVi: 'Sáng sương' },
  { id: 'nuoc-noi',     nameVi: 'Mùa nước nổi' },
  { id: 'dem-den-long', nameVi: 'Đêm đèn lồng' },
  { id: 'mua-tet',      nameVi: 'Mùa Tết' },
];

// unitId → vùng. Unit dùng chung (exam-intro, exam-pron) chỉ một dòng.
export const UNIT_REGION = {
  's1-u1': 'VS', 's1-u2': 'RM', 's1-u3': 'RT', 's1-u4': 'DDL', 's1-u5': 'CN',
  's1-u6': 'CNS', 's1-u7': 'TG', 's1-u8': 'VS', 's1-u9': 'BS', 's1-u10': 'BD',
  'int-u1': 'BD', 'int-u2': 'TG', 'int-u3': 'VS', 'int-u4': 'CNS', 'int-u5': 'CN',
  'int-u6': 'BS', 'int-u7': 'RM', 'int-u8': 'RT', 'int-u9': 'DDL', 'int-u10': 'CN',
  'adv-unit-c1-foundations': 'RM', 'adv-unit-c1-skills': 'BS', 'adv-unit-c1-academic': 'TG',
  'adv-unit-c2-style': 'DDL', 'adv-unit-c2-rhetoric': 'CNS', 'adv-unit-c2-mastery': 'VS',
  'exam-intro': 'BD', 'exam-pron': 'TG',
  'ielts-unit-foundation': 'VS', 'ielts-unit-pre': 'RM', 'ielts-unit-1': 'BS', 'ielts-unit-2': 'TG',
  'ielts-unit-reading-v2': 'RT', 'ielts-unit-3': 'DDL', 'ielts-unit-4': 'CNS', 'ielts-unit-5': 'CN',
  'ielts-unit-topics-1': 'RM', 'ielts-unit-topics-2': 'BS', 'ielts-unit-topics-3': 'CBL',
  'toeic-unit-basics': 'VS', 'toeic-unit-elementary': 'CN', 'toeic-unit-daily-work': 'TG',
  'toeic-unit-business-comm': 'RT', 'toeic-unit-travel-finance': 'BS', 'toeic-unit-industries': 'RM',
  'toeic-unit-advanced-vocab': 'CN', 'toeic-unit-listening': 'DDL', 'toeic-unit-reading': 'TG',
  'toeic-unit-reading-advanced': 'CNS', 'toeic-unit-grammar': 'VS', 'toeic-unit-advanced': 'CBL',
  'b1-unit-1': 'BS', 'b1-unit-2': 'VS', 'b1-unit-3': 'RT', 'b1-unit-4': 'CN', 'b1-unit-5': 'CBL',
  'b2-unit-1': 'CNS', 'b2-unit-2': 'BS', 'b2-unit-3': 'DDL', 'b2-unit-4': 'RT', 'b2-unit-5': 'CBL',
};

export const getUnitRegion = (unitId) => UNIT_REGION[unitId] || null;
// Biến thể = số lần người chơi ĐÃ giải sương vùng này trước unit hiện tại, mod 4.
export const getRegionVariant = (regionId, regionClears = {}) =>
  VARIANTS[(regionClears[regionId] || 0) % VARIANTS.length];

// Danh sách ảnh vùng đất hiện có thực tế trong public/image/regions/
export const AVAILABLE_REGION_ART = new Set([
  'BD-sang-suong',
  'BD-nuoc-noi',
  'VS-sang-suong',
  'RM-sang-suong',
  'CN-sang-suong',
  'TG-sang-suong',
  'CNS-sang-suong',
]);

/** Trả về URL ảnh vùng nếu file thực sự tồn tại; trả null nếu vùng chưa vẽ (tránh 404). */
export function getRegionImageUrl(regionId, variantId = 'sang-suong') {
  if (!regionId) return null;
  const exact = `${regionId}-${variantId}`;
  if (AVAILABLE_REGION_ART.has(exact)) return `/image/regions/${exact}.webp`;
  const fallback = `${regionId}-sang-suong`;
  if (AVAILABLE_REGION_ART.has(fallback)) return `/image/regions/${fallback}.webp`;
  return null;
}

// ── Danh mục Cảnh nền (scene_id → tên cảnh + vùng + đường dẫn ảnh) ───────────
// Mỗi cảnh dùng ảnh riêng (nếu đã vẽ trong /image/scenes/) hoặc ảnh vùng tương ứng.
export const SCENES = {
  // int-u1 · Bến Đò Ông Tư
  bd_ben_go:      { id: 'bd_ben_go',      region: 'BD',  name_vi: 'Bến gỗ',                image: '/image/regions/BD-sang-suong.webp' },
  bd_ghe_khach:   { id: 'bd_ghe_khach',   region: 'BD',  name_vi: 'Ghế khách trên đò',     image: '/image/regions/BD-nuoc-noi.webp' },
  bd_co_hieu:     { id: 'bd_co_hieu',     region: 'BD',  name_vi: 'Cờ hiệu mũi đò',        image: '/image/regions/BD-sang-suong.webp' },
  bd_coc_dem:     { id: 'bd_coc_dem',     region: 'BD',  name_vi: 'Cọc đếm khách',         image: '/image/regions/BD-nuoc-noi.webp' },

  // int-u2 · Tháp Gió
  tg_hom_thu:     { id: 'tg_hom_thu',     region: 'TG',  name_vi: 'Hòm thư lớp học',       image: '/image/scenes/classroom.webp' },
  tg_chong_chong: { id: 'tg_chong_chong', region: 'TG',  name_vi: 'Chong chóng đo gió',    image: '/image/regions/TG-sang-suong.webp' },
  tg_bang_tin:    { id: 'tg_bang_tin',    region: 'TG',  name_vi: 'Bảng tin nghề nghiệp',  image: '/image/regions/TG-sang-suong.webp' },
  tg_san_tap:     { id: 'tg_san_tap',     region: 'TG',  name_vi: 'Sân tập dưới chân tháp', image: '/image/scenes/schoolyard.webp' },

  // int-u3 · Vườn Sữa
  vs_day_phoi:    { id: 'vs_day_phoi',    region: 'VS',  name_vi: 'Dây phơi đồ',           image: '/image/regions/VS-sang-suong.webp' },
  vs_nha_mai_do:  { id: 'vs_nha_mai_do',  region: 'VS',  name_vi: 'Ngôi nhà mái đỏ',       image: '/image/regions/VS-sang-suong.webp' },
  vs_loi_vao_truc:{ id: 'vs_loi_vao_truc',region: 'VS',  name_vi: 'Lối vào rừng trúc',     image: '/image/regions/VS-sang-suong.webp' },
  vs_san_hoi:     { id: 'vs_san_hoi',     region: 'VS',  name_vi: 'Sân hội cuối tuần',     image: '/image/regions/VS-sang-suong.webp' },

  // Cảnh mặc định theo từng vùng (dùng cho các bài chưa tách cảnh chi tiết)
  region_BD:      { id: 'region_BD',      region: 'BD',  name_vi: 'Bến Đò Ông Tư',         image: '/image/regions/BD-sang-suong.webp' },
  region_VS:      { id: 'region_VS',      region: 'VS',  name_vi: 'Vườn Sữa',              image: '/image/regions/VS-sang-suong.webp' },
  region_RM:      { id: 'region_RM',      region: 'RM',  name_vi: 'Rẫy Mầm',               image: '/image/regions/RM-sang-suong.webp' },
  region_RT:      { id: 'region_RT',      region: 'RT',  name_vi: 'Rừng Tràm',             image: null },
  region_BS:      { id: 'region_BS',      region: 'BS',  name_vi: 'Bến Sóng',              image: null },
  region_CN:      { id: 'region_CN',      region: 'CN',  name_vi: 'Chợ Nổi',               image: '/image/regions/CN-sang-suong.webp' },
  region_TG:      { id: 'region_TG',      region: 'TG',  name_vi: 'Tháp Gió',              image: '/image/regions/TG-sang-suong.webp' },
  region_CNS:     { id: 'region_CNS',     region: 'CNS', name_vi: 'Chín Nhánh Sông',       image: '/image/regions/CNS-sang-suong.webp' },
  region_DDL:     { id: 'region_DDL',     region: 'DDL', name_vi: 'Đồi Đèn Lồng',          image: null },
  region_CBL:     { id: 'region_CBL',     region: 'CBL', name_vi: 'Cổng Biển Lớn',         image: null },
};

export function getSceneInfo(sceneId, fallbackRegion = 'BD') {
  if (sceneId && SCENES[sceneId]) return SCENES[sceneId];
  const regKey = `region_${fallbackRegion}`;
  if (SCENES[regKey]) return SCENES[regKey];
  return SCENES.region_BD;
}

// Màu nền vùng khi chưa có ảnh public/image/regions/<region>-<variant>.webp
export const REGION_COLOR = {
  VS:  { sky: '#E8F3DA', ground: '#B9DDA8' },
  RM:  { sky: '#FBEFD9', ground: '#C9DDA0' },
  RT:  { sky: '#DCEBDD', ground: '#7FAE86' },
  BS:  { sky: '#DCEFF8', ground: '#8EC7D6' },
  CN:  { sky: '#FFF1DC', ground: '#8EC7D6' },
  TG:  { sky: '#E6F0FA', ground: '#C8DCA0' },
  CNS: { sky: '#E2F0EE', ground: '#7DBFC0' },
  DDL: { sky: '#F3E6F0', ground: '#B7A6C9' },
  BD:  { sky: '#CFE8E4', ground: '#8EC7D6' },
  CBL: { sky: '#D9E6F2', ground: '#6FA3C8' },
};

// Màu tô Boss sương theo vùng
export const BOSS_TINT = {
  VS:  { body: '#DDE6D6', shade: '#B8C8B0', eye: '#2F3A2B' },
  RM:  { body: '#E9E3D3', shade: '#CFC4A8', eye: '#3A3324' },
  RT:  { body: '#D3DED6', shade: '#A9BCB0', eye: '#24322A' },
  BS:  { body: '#D6E4EC', shade: '#AFC6D3', eye: '#22343F' },
  CN:  { body: '#E6DED6', shade: '#C9BBAE', eye: '#3A2E26' },
  TG:  { body: '#DCE3EA', shade: '#B8C6D1', eye: '#2B3640' },
  CNS: { body: '#D3E4E2', shade: '#A9C9C5', eye: '#21383A' },
  DDL: { body: '#E2DAE6', shade: '#C2B4CC', eye: '#33263B' },
  BD:  { body: '#DCE3E9', shade: '#C9D4DD', eye: '#2B3640' },
  CBL: { body: '#D4DEE8', shade: '#AFC0D1', eye: '#22303D' },
};

export const REGION_BRIEF = {
  BD: 'Bến đò ngang của ông Tư, đò chở khách qua sông sang Cù Lao. Cảnh: bến gỗ, chiếc đò, mặt sông, sương sớm.',
  TG: 'Tháp Gió: cánh đồng có những tháp gió quay, gió lộng. Pet chủ nhà: Mimi, Owlbert, Storm.',
  VS: 'Vườn Sữa: vườn của Cowdi trên cù lao, có đàn gà, rừng trúc của Bamboo. Pet chủ nhà: Cowdi, Bamboo, Bamboo Spirit.',
};
