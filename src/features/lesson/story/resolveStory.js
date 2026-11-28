/**
 * Hàm gom một chỗ cho dẫn nhập & Boss của mọi bài học (GEMINI-STORY-FALLBACK §1).
 *
 * Thứ tự ưu tiên:
 *   SEASON2_LESSONS[lesson.id] → story-defaults (UNIT_NARRATOR / REGION_BOSS / defaultOpenIntro)
 */

import { PET_REGISTRY } from '../../../data/pets.js';
import { REGIONS, getUnitRegion } from '../../../../shared/regions.js';
import {
  BOSS_STAGE,
  SEASON2_LESSONS,
  SEASON2_UNITS,
  evolutionIndex,
  unitBoss,
} from '../../../../shared/story-season2.js';
import {
  REGION_BOSS,
  UNIT_NARRATOR,
  defaultNarrator,
  defaultOpenIntro,
  regionBoss,
} from '../../../../shared/story-defaults.js';

/**
 * @param {{
 *   lesson?: object|null,
 *   unitId?: string|null,
 *   region?: string|null,
 *   companionId?: string|null,
 *   companionC?: number,
 *   companionName?: string|null,
 * }} params
 */
export function resolveLessonStory({
  lesson = null,
  unitId = null,
  region = null,
  companionId = 'cowdi',
  companionC = 1,
  companionName = null,
} = {}) {
  const safeCompanionId = companionId || 'cowdi';
  const safeCompanionName =
    (companionName && String(companionName).trim()) ||
    PET_REGISTRY[safeCompanionId]?.name ||
    'Cowdi';

  const lessonStory = lesson?.id ? SEASON2_LESSONS[lesson.id] || null : null;
  const resolvedUnitId = lessonStory?.unit || unitId || null;
  const resolvedRegion =
    region ||
    (resolvedUnitId && getUnitRegion(resolvedUnitId)) ||
    'BD';
  const regionInfo = REGIONS[resolvedRegion] || REGIONS.BD;

  if (lessonStory) {
    const unitStory = SEASON2_UNITS[lessonStory.unit] || null;
    const rawBoss = unitBoss(lessonStory.unit, safeCompanionId);
    const bossPet = rawBoss ? PET_REGISTRY[rawBoss.pet] : null;
    const boss = rawBoss
      ? {
          ...rawBoss,
          name: bossPet?.name || rawBoss.pet,
          image: bossPet?.evolutions?.[evolutionIndex(BOSS_STAGE)]?.image || null,
        }
      : null;

    const landmarkName =
      unitStory?.landmarks && typeof lessonStory.landmark === 'number'
        ? unitStory.landmarks[lessonStory.landmark] || null
        : null;

    return {
      isSeason2: true,
      unitId: lessonStory.unit,
      region: resolvedRegion,
      narratorId: lessonStory.npc,
      openVi: lessonStory.introVi,
      openEn: lessonStory.introEn || '',
      landmarkName,
      afterVi: lessonStory.afterVi || '',
      lessonStory,
      unitStory,
      boss,
      companionId: safeCompanionId,
      companionC,
    };
  }

  // Fallback qua story-defaults (unit → vùng)
  const narratorId =
    UNIT_NARRATOR[resolvedUnitId]?.by ??
    defaultNarrator(resolvedRegion, REGIONS, safeCompanionId);

  const openDef = defaultOpenIntro({
    unitId: resolvedUnitId,
    regionName: regionInfo.nameVi,
    companionName: safeCompanionName,
  });

  const regBossEntry = REGION_BOSS[resolvedRegion];
  let boss = null;
  if (regBossEntry) {
    const pickedPetId =
      regBossEntry.pet === safeCompanionId ? regBossEntry.alt : regBossEntry.pet;
    const bossPet = PET_REGISTRY[pickedPetId];
    const bossName = bossPet?.name || pickedPetId;
    const built = regionBoss(resolvedRegion, safeCompanionId, bossName);
    if (built) {
      boss = {
        ...built,
        name: bossName,
        image: bossPet?.evolutions?.[evolutionIndex(BOSS_STAGE)]?.image || null,
      };
    }
  }

  return {
    isSeason2: false,
    unitId: resolvedUnitId,
    region: resolvedRegion,
    narratorId,
    openVi: openDef.vi,
    openEn: openDef.en || '',
    landmarkName: null,
    afterVi: '',
    lessonStory: null,
    unitStory: null,
    boss,
    companionId: safeCompanionId,
    companionC,
  };
}
