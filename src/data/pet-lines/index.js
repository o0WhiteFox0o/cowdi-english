// Gộp kho câu thoại của mọi loài pet.
// Giai đoạn 1: dùng common.js. Giai đoạn 2: bổ sung cowdi.js và các pet khác.
import common from './common.js';

const BY_PET = {
  // cowdi sẽ được gắn vào ở Gói E (GĐ2)
};

/**
 * Lấy danh sách câu thoại phù hợp cho petId: câu riêng pet trước, fallback common sau.
 */
export function getLines(petId) {
  const specific = petId && BY_PET[petId] ? BY_PET[petId] : [];
  return specific.length ? [...specific, ...common] : common;
}

export function getPetSpecificLines(petId) {
  return (petId && BY_PET[petId]) || [];
}

export const ALL_PET_LINES = [
  ...common,
  ...Object.values(BY_PET).flat(),
];

export { common };
