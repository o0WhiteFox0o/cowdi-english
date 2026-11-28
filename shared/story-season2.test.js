import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SEASON2_UNITS,
  SEASON2_LESSONS,
  BOSS_STAGE,
  narratorStage,
  unitBoss,
  bossFogLevel,
} from './story-season2.js';
import { getStoryPetImage, getUnitBossInfo } from '../src/features/lesson/story/petImage.js';
import { getSlotIntro } from '../src/features/lesson/screens/intro.js';

const SLOTS = ['intro', 'listen', 'read', 'write', 'speak', 'boss'];
const wordCount = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

test('S1: 12 bài × 6 slot đều có vi (≤25 chữ), en (≤8 từ), và không trùng câu dẫn', () => {
  const lessons = Object.entries(SEASON2_LESSONS);
  assert.equal(lessons.length, 12);

  const seenVi = new Set();
  for (const [id, l] of lessons) {
    assert.ok(l.introVi && wordCount(l.introVi) <= 25, `${id}.introVi quá dài hoặc thiếu`);
    if (l.introEn) assert.ok(wordCount(l.introEn) <= 8, `${id}.introEn quá 8 từ`);

    for (const slot of SLOTS) {
      const entry = l.slots?.[slot];
      assert.ok(entry && entry.vi, `Thiếu ${id}.slots.${slot}.vi`);
      assert.ok(wordCount(entry.vi) <= 25, `${id}.slots.${slot}.vi > 25 chữ`);
      if (entry.en) assert.ok(wordCount(entry.en) <= 8, `${id}.slots.${slot}.en > 8 từ`);
      assert.equal(seenVi.has(entry.vi), false, `Trùng câu dẫn tại ${id}.${slot}: ${entry.vi}`);
      seenVi.add(entry.vi);
    }
  }
  assert.equal(seenVi.size, 72);
});

test('S2: narratorStage — pet khác luôn C4, pet đồng hành giữ đúng cấp', () => {
  assert.equal(narratorStage('storm', 'cowdi', 2), 4);
  assert.equal(narratorStage('cowdi', 'cowdi', 2), 2);
  assert.equal(narratorStage('bamboo', 'flippy', 1), 4);
  assert.equal(narratorStage('flippy', 'flippy', 5), 5);
});

test('S3: unitBoss đổi sang alt khi trùng pet đồng hành; stage luôn bằng 5 (C5 Legendary)', () => {
  const b1Swap = unitBoss('int-u1', 'flippy');
  assert.equal(b1Swap.pet, 'pingu');
  assert.equal(b1Swap.stage, BOSS_STAGE);
  assert.equal(b1Swap.stage, 5);

  const b1Normal = unitBoss('int-u1', 'cowdi');
  assert.equal(b1Normal.pet, 'flippy');
  assert.equal(b1Normal.stage, 5);

  const b2Swap = unitBoss('int-u2', 'owlbert');
  assert.equal(b2Swap.pet, 'mimi');
  assert.equal(b2Swap.stage, 5);

  const b3Swap = unitBoss('int-u3', 'bamboo_spirit');
  assert.equal(b3Swap.pet, 'bamboo');
  assert.equal(b3Swap.stage, 5);
});

test('S4: getStoryPetImage với pet khác không bao giờ trả ảnh egg/baby/junior và file tồn tại', () => {
  const pets = ['cowdi', 'flippy', 'pingu', 'owlbert', 'mimi', 'bamboo', 'bamboo_spirit', 'storm'];
  const forbidden = /(egg|baby|junior)/i;

  for (const petId of pets) {
    const companionId = petId === 'cowdi' ? 'flippy' : 'cowdi';
    const img = getStoryPetImage(petId, { companionId, companionC: 1 });
    assert.ok(img, `Thiếu ảnh C4 cho ${petId}`);
    assert.equal(forbidden.test(img), false, `Pet khác ${petId} trả nhầm ảnh cấp thấp: ${img}`);
    assert.equal(fs.existsSync(`public${img}`), true, `File ảnh không tồn tại: public${img}`);
  }

  // Pet đồng hành giữ đúng cấp hiện tại (C1 = egg)
  const ownC1 = getStoryPetImage('cowdi', { companionId: 'cowdi', companionC: 1 });
  assert.match(ownC1, /egg/i);

  // Boss C5 của cả 3 unit đều trả ảnh Legendary tồn tại trên đĩa
  for (const unitId of Object.keys(SEASON2_UNITS)) {
    const info = getUnitBossInfo(unitId, 'cowdi');
    assert.ok(info?.image, `Thiếu ảnh Boss C5 cho ${unitId}`);
    assert.match(info.image, /legendary/i);
    assert.equal(fs.existsSync(`public${info.image}`), true, `File Boss không tồn tại: public${info.image}`);
  }
});

test('S5: bossFogLevel giảm dần theo số bài đã qua và về 0 khi qua checkpoint', () => {
  assert.equal(bossFogLevel('int-u3', []), 1);
  assert.equal(bossFogLevel('int-u3', ['clothing', 'house']), 0.5);
  assert.equal(bossFogLevel('int-u3', ['clothing', 'house', 'emotions', 'hobbies'], false), 0.15);
  assert.equal(bossFogLevel('int-u3', [], true), 0);
});

test('S6: getSlotIntro ưu tiên kịch bản bài theo kỹ năng; bài không có kịch bản rơi về kho screen_intro', () => {
  const mockIntros = [
    { id: 901, status: 'approved', screen_code: 'F-03', region: 'BD', text_vi: 'Câu từ kho screen_intro!' },
  ];

  // Bài có kịch bản (greetings, slot listen) → trả câu kịch bản bất kể screen_code
  const fromStory = getSlotIntro({ id: 'greetings' }, 'listen', 'BD', {
    code: 'F-03',
    intros: mockIntros,
    seed: 1,
  });
  assert.equal(fromStory.source, 'story');
  assert.equal(fromStory.vi, SEASON2_LESSONS.greetings.slots.listen.vi);
  assert.equal(fromStory.en, SEASON2_LESSONS.greetings.slots.listen.en);

  // Bài không có kịch bản Mùa 2 → rơi về kho screen_intro
  const fromBank = getSlotIntro({ id: 'pronouns' }, 'listen', 'BD', {
    code: 'F-03',
    intros: mockIntros,
    seed: 1,
  });
  assert.equal(fromBank.source, 'screen_intro');
  assert.equal(fromBank.vi, 'Câu từ kho screen_intro!');
  assert.equal(fromBank.id, 901);

  // Không có cả 2 → rơi về fallback
  const fromFallback = getSlotIntro({ id: 'pronouns' }, 'listen', 'BD', {
    code: 'F-03',
    intros: [],
    seed: 1,
  });
  assert.equal(fromFallback.source, 'fallback');
  assert.ok(fromFallback.vi.length > 0);
});
