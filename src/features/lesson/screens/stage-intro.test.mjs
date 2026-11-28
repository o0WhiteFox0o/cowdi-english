import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SCREEN_CATALOG } from './catalog.js';
import { SHORT_NAME } from '../../../data/config/screens.js';
import { resolveLessonStory } from '../story/resolveStory.js';
import { getStoryPetImage, getHumanNpcImage } from '../story/petImage.js';

test('U7: Mọi mã màn trong registry/catalog đều có SHORT_NAME không rỗng và ≤ 11 ký tự', () => {
  assert.ok(SCREEN_CATALOG.length >= 18);
  for (const entry of SCREEN_CATALOG) {
    const short = SHORT_NAME[entry.code];
    assert.ok(typeof short === 'string' && short.trim().length > 0, `Thiếu SHORT_NAME cho ${entry.code}`);
    assert.ok(
      short.length <= 11,
      `SHORT_NAME[${entry.code}] ("${short}") dài ${short.length} ký tự (tối đa 11)`,
    );
  }
});

test('U4: Bài at-restaurant (Bến Sóng, BS): người dẫn Leafy C4, Boss Legendary Pingu', () => {
  const story = resolveLessonStory({
    lesson: { id: 'at-restaurant', title: 'Ở nhà hàng' },
    unitId: 'int-u6',
    region: 'BS',
    companionId: 'cowdi',
    companionC: 2,
    companionName: 'Cowdi',
  });
  assert.equal(story.narratorId, 'leafy');
  const narratorImg = getStoryPetImage(story.narratorId, { companionId: 'cowdi', companionC: 2 });
  assert.match(narratorImg, /Leafy_Super\.webp$/i);
  assert.equal(fs.existsSync(`public${narratorImg}`), true);

  assert.equal(story.boss.pet, 'pingu');
  assert.equal(story.boss.stage, 5);
  assert.match(story.boss.image, /Pingu_Legendary\.webp$/i);
  assert.equal(fs.existsSync(`public${story.boss.image}`), true);
});

test('U5: Bài greetings: người dẫn ông Tư (/image/npc/ong_tu.webp) và câu kịch bản riêng', () => {
  const story = resolveLessonStory({
    lesson: { id: 'greetings', title: 'Chào hỏi cơ bản' },
    unitId: 'int-u1',
    region: 'BD',
    companionId: 'cowdi',
    companionC: 2,
    companionName: 'Cowdi',
  });
  assert.equal(story.isSeason2, true);
  assert.equal(story.narratorId, 'ong_tu');
  const npcImg = getHumanNpcImage(story.narratorId);
  assert.equal(npcImg, '/image/npc/ong_tu.webp');
  assert.equal(fs.existsSync(`public${npcImg}`), true);
  assert.ok(story.openVi && story.openVi.length > 0);
});
