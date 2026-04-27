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

function evolutionStageFor(xp = 0) {
  if (xp >= 2500) return 'legendary';
  if (xp >= 1200) return 'super';
  if (xp >= 500)  return 'junior';
  if (xp >= 100)  return 'baby';
  return 'egg';
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
  const xp = pet.totalXpEarned || 0;
  const stage = evolutionStageFor(xp);

  const speciesKey = String(activeId).toLowerCase();
  const folder = (PET_NAMES[speciesKey] || 'Cowdi'); // Pascal case folder name

  return {
    petName: pet.nickname || PET_NAMES[speciesKey] || 'Cowdi',
    icon: `${FRONTEND_BASE}/assets/images/pets/${folder}/${stage}.webp`,
    badge: `${FRONTEND_BASE}/pwa-192x192.png`,
  };
}
