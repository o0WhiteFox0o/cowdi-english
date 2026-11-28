/**
 * Hàm gom một chỗ cho dẫn nhập, thoại nhân vật, cảnh nền & Boss vùng của mọi ải.
 *
 * Cấu trúc chuẩn tách bạch:
 *  - intro_vi: lời dẫn truyện tiếng Việt (KHÔNG phải lời nhân vật)
 *  - dialogue: { speaker_id, text_en, text_vi? } (chỉ câu thoại của nhân vật)
 *  - scene_id / scene: cảnh nền của ải (tên cảnh + ảnh nền)
 *  - regionBoss / boss: gắn với VÙNG (REGIONS[region].boss), tên & ảnh tra động từ PET_REGISTRY[pet_id]
 */

import { PET_REGISTRY } from '../../../data/pets.js';
import { REGIONS, getUnitRegion, getSceneInfo } from '../../../../shared/regions.js';
import {
  BOSS_STAGE,
  SEASON2_LESSONS,
  SEASON2_UNITS,
  evolutionIndex,
  unitBoss,
} from '../../../../shared/story-season2.js';
import {
  UNIT_NARRATOR,
  defaultNarrator,
  defaultOpenIntro,
  regionBoss,
} from '../../../../shared/story-defaults.js';

/** Tra Boss của vùng từ REGIONS[region].boss + PET_REGISTRY (không gán cứng tên/ảnh). */
function resolveRegionBossObject(regionCode, safeCompanionId, unitStoryOverride = null) {
  const regBossDef = REGIONS[regionCode]?.boss;
  if (!regBossDef?.pet_id) return null;

  const pickedPetId =
    regBossDef.pet_id === safeCompanionId ? regBossDef.alt_pet_id : regBossDef.pet_id;
  const bossPet = PET_REGISTRY[pickedPetId] || null;
  const bossName = bossPet?.name || pickedPetId;
  const bossImage = bossPet?.evolutions?.[evolutionIndex(BOSS_STAGE)]?.image || null;

  // Nếu có thoại tập riêng (unitStoryOverride) và không phải alt thì dùng thoại tập, ngược lại dùng thoại vùng
  const builtRegion = regionBoss(regionCode, safeCompanionId, bossName);
  const usingAlt = pickedPetId !== regBossDef.pet_id;
  const lines =
    !usingAlt && unitStoryOverride?.lines
      ? unitStoryOverride.lines
      : builtRegion?.lines || {};

  return {
    ...(unitStoryOverride || {}),
    ...(builtRegion || {}),
    pet_id: pickedPetId,
    pet: pickedPetId,
    name: bossName,
    stage: BOSS_STAGE,
    image: bossImage,
    lines,
  };
}

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
    const rawUnitBoss = unitBoss(lessonStory.unit, safeCompanionId);
    const boss = resolveRegionBossObject(resolvedRegion, safeCompanionId, rawUnitBoss);

    const scene = getSceneInfo(lessonStory.scene_id, resolvedRegion);
    const dialogue = {
      speaker_id: lessonStory.dialogue.speaker_id,
      text_en: lessonStory.dialogue.text_en,
      ...(lessonStory.dialogue.text_vi ? { text_vi: lessonStory.dialogue.text_vi } : {}),
    };

    return {
      isSeason2: true,
      unitId: lessonStory.unit,
      region: resolvedRegion,
      // Cấu trúc chuẩn tách bạch
      intro_vi: lessonStory.intro_vi,
      dialogue,
      scene_id: scene.id,
      scene,
      regionBoss: boss,
      // Alias tương thích ngược
      narratorId: dialogue.speaker_id,
      openVi: lessonStory.intro_vi,
      openEn: dialogue.text_en,
      landmarkName: scene.name_vi,
      afterVi: lessonStory.afterVi || '',
      lessonStory,
      unitStory,
      boss,
      companionId: safeCompanionId,
      companionC,
    };
  }

  // Fallback qua story-defaults (unit → vùng)
  const speakerId =
    UNIT_NARRATOR[resolvedUnitId]?.by ??
    defaultNarrator(resolvedRegion, REGIONS, safeCompanionId);

  const openDef = defaultOpenIntro({
    unitId: resolvedUnitId,
    regionName: regionInfo.nameVi,
    companionName: safeCompanionName,
    speakerId,
  });

  const scene = getSceneInfo(lesson?.scene_id || `region_${resolvedRegion}`, resolvedRegion);
  const boss = resolveRegionBossObject(resolvedRegion, safeCompanionId, null);
  const dialogue = {
    speaker_id: openDef.dialogue?.speaker_id || speakerId,
    text_en: openDef.dialogue?.text_en || openDef.en || "Let's learn together!",
  };

  return {
    isSeason2: false,
    unitId: resolvedUnitId,
    region: resolvedRegion,
    // Cấu trúc chuẩn tách bạch
    intro_vi: openDef.intro_vi,
    dialogue,
    scene_id: scene.id,
    scene,
    regionBoss: boss,
    // Alias tương thích ngược
    narratorId: dialogue.speaker_id,
    openVi: openDef.intro_vi,
    openEn: dialogue.text_en,
    landmarkName: scene.name_vi,
    afterVi: '',
    lessonStory: null,
    unitStory: null,
    boss,
    companionId: safeCompanionId,
    companionC,
  };
}
