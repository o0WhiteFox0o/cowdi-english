import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PET_REGISTRY } from '../src/data/pets.js';
import { REGION_BOSS } from './story-defaults.js';
import { SEASON2_LESSONS } from './story-season2.js';
import { resolveLessonStory } from '../src/features/lesson/story/resolveStory.js';
import { getStoryPetImage } from '../src/features/lesson/story/petImage.js';

test('D1: alphabet (exam-pron, TG): người dẫn storm, ảnh Storm C4, câu mở chứa "giọng của gió"', () => {
  const story = resolveLessonStory({
    lesson: { id: 'alphabet', title: 'Bảng chữ cái' },
    unitId: 'exam-pron',
    region: 'TG',
    companionId: 'cowdi',
    companionC: 2,
    companionName: 'Cowdi',
  });
  assert.equal(story.narratorId, 'storm');
  const img = getStoryPetImage(story.narratorId, { companionId: 'cowdi', companionC: 2 });
  assert.match(img, /Storm_Super\.webp$/i);
  assert.match(story.openVi, /giọng của gió/i);
});

test('D2: alphabet, pet đồng hành cowdi: Boss = owlbert, ảnh Owlbert_Legendary.webp', () => {
  const story = resolveLessonStory({
    lesson: { id: 'alphabet' },
    unitId: 'exam-pron',
    region: 'TG',
    companionId: 'cowdi',
    companionC: 2,
    companionName: 'Cowdi',
  });
  assert.equal(story.boss.pet, 'owlbert');
  assert.equal(story.boss.stage, 5);
  assert.match(story.boss.image, /Owlbert_Legendary\.webp$/i);
});

test('D3: Pet đồng hành owlbert: Boss TG đổi sang mimi C5, thoại enter không nhắc "Owlbert"', () => {
  const story = resolveLessonStory({
    lesson: { id: 'alphabet' },
    unitId: 'exam-pron',
    region: 'TG',
    companionId: 'owlbert',
    companionC: 3,
    companionName: 'Owlbert',
  });
  assert.equal(story.boss.pet, 'mimi');
  assert.equal(story.boss.stage, 5);
  assert.match(story.boss.image, /Mimi_legendary\.webp$/i);
  assert.equal(/owlbert/i.test(story.boss.lines.enter.vi), false);
});

test('D4: Bài bất kỳ không có kịch bản: chuỗi Mở ải không chứa "Cowdi" khi pet đồng hành khác Cowdi', () => {
  const story = resolveLessonStory({
    lesson: { id: 'pronouns', title: 'Đại từ' },
    unitId: 'int-u4',
    region: 'CNS',
    companionId: 'flippy',
    companionC: 2,
    companionName: 'Flippy',
  });
  assert.equal(/cowdi/i.test(story.openVi), false);
  assert.match(story.openVi, /Flippy/);
});

test('D5: Mọi REGION_BOSS[*].pet và alt có trong PET_REGISTRY và có evolutions[4].image tồn tại trên đĩa', () => {
  for (const [regionCode, entry] of Object.entries(REGION_BOSS)) {
    for (const key of ['pet', 'alt']) {
      const petId = entry[key];
      const pet = PET_REGISTRY[petId];
      assert.ok(pet, `REGION_BOSS.${regionCode}.${key} (${petId}) không có trong PET_REGISTRY`);
      const img = pet.evolutions?.[4]?.image;
      assert.ok(img, `Pet ${petId} thiếu evolutions[4].image`);
      assert.equal(fs.existsSync(`public${img}`), true, `File ảnh Boss C5 không tồn tại: public${img}`);
    }
  }
});

test('D6: 12 bài int-u1..u3 vẫn ra đúng câu kịch bản (SEASON2_LESSONS)', () => {
  for (const [lessonId, expected] of Object.entries(SEASON2_LESSONS)) {
    const story = resolveLessonStory({
      lesson: { id: lessonId },
      unitId: expected.unit,
      companionId: 'cowdi',
      companionC: 2,
      companionName: 'Cowdi',
    });
    assert.equal(story.isSeason2, true);
    assert.equal(story.dialogue.speaker_id, expected.dialogue.speaker_id);
    assert.equal(story.intro_vi, expected.intro_vi);
    assert.equal(story.dialogue.text_en, expected.dialogue.text_en);
    assert.equal(story.scene_id, expected.scene_id);
    assert.ok(story.regionBoss && story.regionBoss.stage === 5);
  }
});
