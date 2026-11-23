/**
 * server/utils/pet-icon.js
 * Tra cứu ảnh pet hiện tại của user dựa trên pet_data JSON đã lưu.
 * Tránh import data frontend — chỉ map theo convention thư mục public/.
 *
 * Convention: public/assets/images/pets/<SpeciesId>/<evolutionStage>.webp
 *   Cowdi/baby.webp, Foxie/junior.webp, ...
 * Fallback: pwa-192x192.png nếu thiếu data.
 */

const FRONTEND_BASE = (process.env.FRONTEND_URL || '').replace(/\/$/, '');

// Bảng tên hiển thị pet (đồng bộ với src/data/pets.js — chỉ key chính)
const PET_NAMES = {
  cowdi: 'Cowdi', foxie: 'Foxie', ginseng: 'Ginseng', leafy: 'Leafy',
  pingu: 'Pingu', sparky: 'Sparky', mimi: 'Mimi', owlbert: 'Owlbert',
  flippy: 'Flippy', leo: 'Leo', bamboo: 'Bamboo', storm: 'Storm',
  shadow: 'Shadow', prisma: 'Prisma', draco: 'Draco', pumpkin: 'Pumpkin',
};

// v2: cấp lấy trực tiếp từ pet.evolution (0–4), không tính lại từ XP.
const STAGE_NAMES = ['egg', 'baby', 'junior', 'super', 'legendary'];
function evolutionStageName(evolution = 0) {
  const s = Math.min(STAGE_NAMES.length - 1, Math.max(0, Math.floor(Number(evolution) || 0)));
  return STAGE_NAMES[s];
}

/**
 * @param {string|object|null} petDataRaw  Giá trị cột user_progress.pet_data
 * @returns {{petName: string, icon: string, badge: string}}
 */
export function pickPetIcon(petDataRaw) {
  let petData = petDataRaw;
  if (typeof petDataRaw === 'string') {
    try { petData = JSON.parse(petDataRaw); } catch { petData = null; }
  }

  const fallback = {
    petName: 'Cowdi',
    icon: `${FRONTEND_BASE}/pwa-192x192.png`,
    badge: `${FRONTEND_BASE}/pwa-192x192.png`,
  };

  if (!petData || typeof petData !== 'object') return fallback;

  const activeId = petData.activePetId || 'cowdi';
  const collection = petData.collection || {};
  const pet = collection[activeId] || {};
  const stage = evolutionStageName(pet.evolution);

  const speciesKey = String(activeId).toLowerCase();
  const folder = (PET_NAMES[speciesKey] || 'Cowdi'); // Pascal case folder name

  return {
    petName: pet.nickname || PET_NAMES[speciesKey] || 'Cowdi',
    icon: `${FRONTEND_BASE}/assets/images/pets/${folder}/${stage}.webp`,
    badge: `${FRONTEND_BASE}/pwa-192x192.png`,
  };
}
