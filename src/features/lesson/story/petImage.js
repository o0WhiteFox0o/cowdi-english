/**
 * Luật hình ảnh Pet & NPC cho Kịch bản Dẫn nhập Mùa 2 (GEMINI-STORY-INTRO-S2 §2).
 *
 * - Pet đồng hành của người học: hiện đúng cấp hiện tại (companionC = pet.stage + 1).
 * - Pet KHÁC dẫn truyện: chỉ dùng cấp C4 (Super) hoặc C5 (Legendary), không bao giờ C1–C3.
 * - Boss Màn 6: luôn là pet cấp C5 (Legendary), tự đổi sang `alt` nếu trùng pet đồng hành.
 */

import { PET_REGISTRY } from '../../../data/pets.js';
import {
  BOSS_STAGE,
  evolutionIndex,
  narratorStage,
  unitBoss,
} from '../../../../shared/story-season2.js';

const STORY_SEEN_KEY = 'cowdi_story_seen_v1';

/**
 * Lấy ảnh pet trong cảnh dẫn truyện theo luật C4/C5.
 * @param {string} petId
 * @param {{ companionId?: string, companionC?: number }} [opts]
 * @returns {string|null}
 */
export function getStoryPetImage(petId, { companionId = null, companionC = 1 } = {}) {
  const pet = PET_REGISTRY[petId];
  if (!pet || !Array.isArray(pet.evolutions)) return null;
  const safeCompanionC = Math.min(5, Math.max(1, Number(companionC) || 1));
  const c = narratorStage(petId, companionId, safeCompanionC);
  const idx = evolutionIndex(c);
  return pet.evolutions[idx]?.image || null;
}

/**
 * Lấy thông tin + ảnh Boss C5 cho một unit Mùa 2.
 * @param {string} unitId
 * @param {string|null} companionId
 */
export function getUnitBossInfo(unitId, companionId = null) {
  const boss = unitBoss(unitId, companionId);
  if (!boss) return null;
  const pet = PET_REGISTRY[boss.pet];
  const image = pet?.evolutions?.[evolutionIndex(BOSS_STAGE)]?.image || null;
  return {
    ...boss,
    name: pet?.name || boss.pet,
    image,
  };
}

/**
 * Đường dẫn ảnh chân dung nhân vật người (khi nhân sự bàn giao vào public/image/npc/).
 */
export function getHumanNpcImage(npcId) {
  if (!npcId) return null;
  return `/image/npc/${npcId}.webp`;
}

/**
 * Đọc/ghi cờ đã xem cảnh truyện (màn kết tập checkpoint / tới vùng) trong localStorage.
 */
export function isStorySeen(key) {
  if (!key) return false;
  try {
    if (typeof localStorage === 'undefined') return false;
    const raw = localStorage.getItem(STORY_SEEN_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return Boolean(map && map[key]);
  } catch {
    return false;
  }
}

export function markStorySeen(key) {
  if (!key) return;
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(STORY_SEEN_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[key] = Date.now();
    localStorage.setItem(STORY_SEEN_KEY, JSON.stringify(map));
  } catch {
    /* ignore storage errors */
  }
}
