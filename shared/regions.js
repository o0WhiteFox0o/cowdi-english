// shared/regions.js — Vùng đất theo unit (Story Bible mục 6.4, STORY-BIBLE-IMPLEMENTATION 2b.1)
// Bản đầy đủ cho Đợt 3 hệ thống màn. KHÔNG tự đổi tên vùng / mã vùng.

export const RING = ['VS', 'RM', 'RT', 'BS', 'CN', 'TG', 'CNS', 'DDL']; // thứ tự vòng, chiều kim đồng hồ
export const SPECIAL = ['BD', 'CBL'];

export const REGIONS = {
  VS:  { nameVi: 'Vườn Sữa',        hosts: ['cowdi', 'bamboo', 'bamboo_spirit'], realRef: 'Cồn Sơn, Cần Thơ' },
  RM:  { nameVi: 'Rẫy Mầm',         hosts: ['paddy', 'sprout', 'mushroom', 'radish', 'ginseng'], realRef: 'Làng hoa Sa Đéc, Đồng Tháp' },
  RT:  { nameVi: 'Rừng Tràm',       hosts: ['foxie', 'leo', 'shadow'], realRef: 'Rừng tràm Trà Sư, An Giang' },
  BS:  { nameVi: 'Bến Sóng',        hosts: ['pingu', 'leafy', 'flippy'], realRef: 'Biển Mũi Nai, Hà Tiên, An Giang' },
  CN:  { nameVi: 'Chợ Nổi',         hosts: ['bun'], realRef: 'Chợ nổi Cái Răng, Cần Thơ' },
  TG:  { nameVi: 'Tháp Gió',        hosts: ['mimi', 'owlbert', 'storm'], realRef: 'Cánh đồng điện gió Bạc Liêu, Cà Mau' },
  CNS: { nameVi: 'Chín Nhánh Sông', hosts: ['sparky', 'draco'], realRef: 'Cồn Long–Lân–Quy–Phụng, sông Tiền' },
  DDL: { nameVi: 'Đồi Đèn Lồng',    hosts: ['monk', 'pumpkin', 'prisma'], realRef: 'Hồ Thủy Liêm, Núi Cấm, An Giang' },
  BD:  { nameVi: 'Bến Đò Ông Tư',   hosts: [], humanHost: 'ong_tu', realRef: 'Bến đò Cô Bắc → Cồn Sơn, Cần Thơ' },
  CBL: { nameVi: 'Cổng Biển Lớn',   hosts: [], realRef: 'Mũi Cà Mau' },
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

// ── Bổ sung cho hệ thống màn (Đợt 3) ─────────────────────────────────────────

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

/** Trả về URL ảnh vùng nếu file thực sự tồn tại; trả null nếu vùng chưa vẽ (dùng màu nền REGION_COLOR, tránh 404). */
export function getRegionImageUrl(regionId, variantId = 'sang-suong') {
  if (!regionId) return null;
  const exact = `${regionId}-${variantId}`;
  if (AVAILABLE_REGION_ART.has(exact)) return `/image/regions/${exact}.webp`;
  const fallback = `${regionId}-sang-suong`;
  if (AVAILABLE_REGION_ART.has(fallback)) return `/image/regions/${fallback}.webp`;
  return null;
}

// Màu nền vùng khi chưa có ảnh public/image/regions/<region>-<variant>.webp
// sky = nền trên, ground = dải dưới (nước/cỏ/đất).
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

// Màu tô Boss sương theo vùng (dùng với public/image/boss/fog.svg hoặc bản CSS).
// body = thân sương, shade = vùng tối, eye = mắt/miệng.
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

// Tóm tắt vùng để soạn câu dẫn (chỉ dùng chi tiết có trong Story Bible; không bịa địa danh mới).
export const REGION_BRIEF = {
  BD: 'Bến đò ngang của ông Tư, đò chở khách qua sông sang Cù Lao. Cảnh: bến gỗ, chiếc đò, mặt sông, sương sớm.',
  TG: 'Tháp Gió: cánh đồng có những tháp gió quay, gió lộng. Pet chủ nhà: Mimi, Owlbert, Storm.',
  VS: 'Vườn Sữa: vườn của Cowdi trên cù lao, có đàn gà, rừng trúc của Bamboo. Pet chủ nhà: Cowdi, Bamboo, Bamboo Spirit.',
};
