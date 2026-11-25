// Gộp kho câu thoại của mọi loài pet.
// Câu riêng của pet hiện có: cowdi.js. Các loài khác dùng common.js trung tính.
import common from './common.js';
import cowdi from './cowdi.js';

const BY_PET = {
  cowdi,
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

export { common, cowdi };
