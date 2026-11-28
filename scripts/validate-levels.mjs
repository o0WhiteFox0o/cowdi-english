#!/usr/bin/env node
/**
 * scripts/validate-levels.mjs — Kiểm tra toàn bộ ải & vùng của Cowdi English (npm run validate:levels)
 *
 * Kiểm tra 7 tiêu chí:
 *  1. Thiếu intro_vi / dialogue.text_en / dialogue.speaker_id
 *  2. dialogue.text_en chứa ký tự tiếng Việt có dấu → lỗi sai trường
 *  3. Vùng thiếu region.boss.pet_id, pet_id không có trong PET_REGISTRY, hoặc thiếu ảnh C5 trên đĩa → lỗi
 *  4. Ải (hoặc unit) tự khai báo boss riêng (ghi đè boss của vùng) → lỗi
 *  5. boss_stage.label_vi dài hơn ngưỡng hiển thị (> 10 ký tự) → cảnh báo
 *  6. scene_id thiếu ảnh nền thật trong public/ → cảnh báo
 *  7. Nhiều vùng / nhiều ải dùng chung một boss.pet_id → cảnh báo tóm tắt
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_LESSONS } from '../src/data/lessons/index.js';
import { findPathForLesson } from '../src/data/path.js';
import { PET_REGISTRY } from '../src/data/pets.js';
import { REGIONS, SCENES, getUnitRegion } from '../shared/regions.js';
import { SEASON2_LESSONS, SEASON2_UNITS, BOSS_STAGE, evolutionIndex } from '../shared/story-season2.js';
import { resolveLessonStory } from '../src/features/lesson/story/resolveStory.js';
import { BOSS_STAGE_META, resolveBossStage } from '../src/data/config/screens.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Ký tự tiếng Việt có dấu (dùng phát hiện text_en bị nhầm trường tiếng Việt)
const VIET_DIACRITIC_RE = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
const MAX_BOSS_STAGE_LABEL_LEN = 10;

const errors = [];
const warnings = [];

function addError(scopeId, msg) {
  errors.push(`[LỖI][${scopeId}] ${msg}`);
}
function addWarn(scopeId, msg) {
  warnings.push(`[CẢNH BÁO][${scopeId}] ${msg}`);
}

// ── 1. Kiểm tra Boss của toàn bộ Vùng (REGIONS) ──────────────────────────────
const regionBossPetUsage = new Map(); // pet_id -> [regionCode...]
for (const [code, reg] of Object.entries(REGIONS)) {
  const petId = reg?.boss?.pet_id;
  if (!petId) {
    addError(`region:${code}`, 'Thiếu region.boss.pet_id');
    continue;
  }
  const list = regionBossPetUsage.get(petId) || [];
  list.push(code);
  regionBossPetUsage.set(petId, list);

  for (const field of ['pet_id', 'alt_pet_id']) {
    const pid = reg.boss[field];
    if (!pid) {
      addError(`region:${code}`, `Thiếu region.boss.${field}`);
      continue;
    }
    const pet = PET_REGISTRY[pid];
    if (!pet) {
      addError(`region:${code}`, `region.boss.${field}="${pid}" không tồn tại trong PET_REGISTRY`);
      continue;
    }
    const img = pet.evolutions?.[evolutionIndex(BOSS_STAGE)]?.image;
    if (!img) {
      addError(`region:${code}`, `Pet "${pid}" thiếu ảnh tiến hoá C5 Legendary (evolutions[4].image)`);
    } else {
      const abs = path.join(PUBLIC_DIR, img.replace(/^\/+/, ''));
      if (!fs.existsSync(abs)) {
        addError(`region:${code}`, `File ảnh Boss C5 không tồn tại trên đĩa: public${img}`);
      }
    }
  }
}

for (const [petId, codes] of regionBossPetUsage.entries()) {
  if (codes.length > 1) {
    addWarn(`boss:${petId}`, `Nhiều vùng dùng chung boss.pet_id="${petId}": ${codes.join(', ')}`);
  }
}

// ── 2. Kiểm tra nhãn boss_stage.label_vi ─────────────────────────────────────
for (const [code, meta] of Object.entries(BOSS_STAGE_META)) {
  const label = String(meta?.label_vi || '').trim();
  if (!label) {
    addError(`boss_stage:${code}`, 'Thiếu boss_stage.label_vi');
  } else if (label.length > MAX_BOSS_STAGE_LABEL_LEN) {
    addWarn(`boss_stage:${code}`, `label_vi "${label}" dài ${label.length} ký tự (vượt giới hạn ${MAX_BOSS_STAGE_LABEL_LEN} ký tự hiển thị)`);
  }
}

// ── 3. Kiểm tra không có Unit/Ải nào tự khai báo boss riêng ghi đè boss vùng ─
for (const [unitId, unitDef] of Object.entries(SEASON2_UNITS)) {
  if (unitDef && Object.prototype.hasOwnProperty.call(unitDef, 'boss')) {
    addError(`unit:${unitId}`, 'Unit tự khai báo trường boss riêng (phải dùng region.boss của vùng)');
  }
}
for (const [lessonId, s2] of Object.entries(SEASON2_LESSONS)) {
  if (s2 && Object.prototype.hasOwnProperty.call(s2, 'boss')) {
    addError(lessonId, 'Ải trong SEASON2_LESSONS tự khai báo boss riêng (ghi đè boss của vùng)');
  }
}

// ── 4. Kiểm tra từng ải trong toàn bộ ALL_LESSONS ────────────────────────────
const bossPetToLessons = new Map(); // pet_id -> [lessonId...]
const missingSceneImages = new Map(); // scene_id -> count

for (const lesson of ALL_LESSONS) {
  const id = lesson?.id || '(unknown)';

  // 4a. Không cho phép ải tự khai báo boss riêng
  if (lesson && Object.prototype.hasOwnProperty.call(lesson, 'boss')) {
    addError(id, 'Ải tự khai báo trường boss riêng (ghi đè boss của vùng)');
  }

  const pathInfo = findPathForLesson(id);
  const unitId = SEASON2_LESSONS[id]?.unit || pathInfo?.unit?.id || null;
  const region = (unitId && getUnitRegion(unitId)) || 'BD';

  const resolved = resolveLessonStory({
    lesson,
    unitId,
    region,
    companionId: 'cowdi',
    companionC: 2,
    companionName: 'Cowdi',
  });

  // 4b. Bắt buộc có intro_vi, dialogue.text_en, dialogue.speaker_id
  if (!resolved.intro_vi || !String(resolved.intro_vi).trim()) {
    addError(id, 'Thiếu intro_vi (lời dẫn truyện tiếng Việt)');
  }
  if (!resolved.dialogue?.speaker_id || !String(resolved.dialogue.speaker_id).trim()) {
    addError(id, 'Thiếu dialogue.speaker_id');
  }
  const textEn = String(resolved.dialogue?.text_en || '').trim();
  if (!textEn) {
    addError(id, 'Thiếu dialogue.text_en');
  } else if (VIET_DIACRITIC_RE.test(textEn)) {
    addError(id, `dialogue.text_en chứa ký tự tiếng Việt có dấu (sai trường): "${textEn}"`);
  }

  // 4c. Kiểm tra boss_stage của ải (nếu ải khai báo boss_stage riêng hoặc mặc định)
  const bossStage = lesson.boss_stage || resolveBossStage('F-06');
  if (!bossStage?.label_vi) {
    addError(id, 'Thiếu boss_stage.label_vi');
  } else if (bossStage.label_vi.length > MAX_BOSS_STAGE_LABEL_LEN) {
    addWarn(id, `boss_stage.label_vi "${bossStage.label_vi}" dài ${bossStage.label_vi.length} ký tự (> ${MAX_BOSS_STAGE_LABEL_LEN})`);
  }

  // 4d. Kiểm tra scene_id & ảnh nền trên đĩa
  const sceneId = resolved.scene_id;
  const sceneDef = SCENES[sceneId];
  if (!sceneId || !sceneDef) {
    addError(id, `scene_id="${sceneId}" không tồn tại trong SCENES`);
  } else if (!sceneDef.image) {
    missingSceneImages.set(sceneId, (missingSceneImages.get(sceneId) || 0) + 1);
  } else {
    const absScene = path.join(PUBLIC_DIR, sceneDef.image.replace(/^\/+/, ''));
    if (!fs.existsSync(absScene)) {
      addWarn(id, `scene_id="${sceneId}" trỏ tới ảnh không tồn tại: public${sceneDef.image}`);
    }
  }

  // 4e. Gom thống kê các ải dùng chung boss.pet_id (cùng vùng sẽ dùng chung boss vùng)
  const bPet = resolved.regionBoss?.pet_id;
  if (!bPet) {
    addError(id, `Không xác định được regionBoss.pet_id cho vùng ${region}`);
  } else {
    const arr = bossPetToLessons.get(bPet) || [];
    arr.push(id);
    bossPetToLessons.set(bPet, arr);
  }
}

// Báo cảnh báo cho các scene_id thiếu ảnh nền
for (const [sceneId, count] of missingSceneImages.entries()) {
  const sc = SCENES[sceneId];
  addWarn(`scene:${sceneId}`, `Thiếu ảnh nền cho cảnh "${sc?.name_vi || sceneId}" (ảnh hưởng ${count} ải)`);
}

// Báo cảnh báo nhóm ải dùng chung boss.pet_id (đúng luật vùng dùng chung boss, in để dễ rà phân bố)
for (const [petId, lessonIds] of bossPetToLessons.entries()) {
  if (lessonIds.length > 1) {
    const petName = PET_REGISTRY[petId]?.name || petId;
    addWarn(`boss-share:${petId}`, `${lessonIds.length} ải dùng chung Boss vùng "${petName}" (${petId})`);
  }
}

// ── In báo cáo tổng kết ──────────────────────────────────────────────────────
console.log(`\n=== VALIDATE LEVELS (${ALL_LESSONS.length} ải · ${Object.keys(REGIONS).length} vùng · ${Object.keys(SCENES).length} cảnh) ===`);
if (errors.length > 0) {
  console.log(`\n❌ LỖI (${errors.length}):`);
  for (const e of errors) console.log('  ' + e);
} else {
  console.log('\n✅ LỖI: 0 lỗi (toàn bộ 221 ải & 10 vùng đạt chuẩn cấu trúc)');
}

if (warnings.length > 0) {
  console.log(`\n⚠️  CẢNH BÁO (${warnings.length}):`);
  for (const w of warnings) console.log('  ' + w);
} else {
  console.log('\n✅ CẢNH BÁO: 0');
}
console.log('');

process.exit(errors.length > 0 ? 1 : 0);
