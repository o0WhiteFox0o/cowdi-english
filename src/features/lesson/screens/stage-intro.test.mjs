import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SCREEN_CATALOG } from './catalog.js';
import { SHORT_NAME, BOSS_STAGE_META } from '../../../data/config/screens.js';
import { resolveLessonStory } from '../story/resolveStory.js';
import { getStoryPetImage, getHumanNpcImage } from '../story/petImage.js';
import { hashString } from './seededRandom.js';
import { computeMiddleOrder } from './mixer.js';

test('U7: Mọi mã màn trong registry/catalog đều có SHORT_NAME không rỗng và ≤ 11 ký tự; boss_stage ≤ 10 ký tự', () => {
  assert.ok(SCREEN_CATALOG.length >= 18);
  for (const entry of SCREEN_CATALOG) {
    const short = SHORT_NAME[entry.code];
    assert.ok(typeof short === 'string' && short.trim().length > 0, `Thiếu SHORT_NAME cho ${entry.code}`);
    assert.ok(
      short.length <= 11,
      `SHORT_NAME[${entry.code}] ("${short}") dài ${short.length} ký tự (tối đa 11)`,
    );
  }
  for (const [code, meta] of Object.entries(BOSS_STAGE_META)) {
    assert.ok(meta.label_vi && meta.label_vi.length <= 10, `BOSS_STAGE_META[${code}] quá dài: ${meta.label_vi}`);
  }
});

test('U4: Bài at-restaurant (Bến Sóng, BS): người dẫn Leafy C4, Boss vùng BS = Legendary Pingu', () => {
  const story = resolveLessonStory({
    lesson: { id: 'at-restaurant', title: 'Ở nhà hàng' },
    unitId: 'int-u6',
    region: 'BS',
    companionId: 'cowdi',
    companionC: 2,
    companionName: 'Cowdi',
  });
  assert.equal(story.dialogue.speaker_id, 'leafy');
  const narratorImg = getStoryPetImage(story.dialogue.speaker_id, { companionId: 'cowdi', companionC: 2 });
  assert.match(narratorImg, /Leafy_Super\.webp$/i);
  assert.equal(fs.existsSync(`public${narratorImg}`), true);

  assert.equal(story.regionBoss.pet_id, 'pingu');
  assert.equal(story.regionBoss.stage, 5);
  assert.match(story.regionBoss.image, /Pingu_Legendary\.webp$/i);
  assert.equal(fs.existsSync(`public${story.regionBoss.image}`), true);
});

test('U5: Bài greetings: tách rõ intro_vi, dialogue.text_en (tiếng Anh), speaker_id và scene_id', () => {
  const story = resolveLessonStory({
    lesson: { id: 'greetings', title: 'Chào hỏi cơ bản' },
    unitId: 'int-u1',
    region: 'BD',
    companionId: 'cowdi',
    companionC: 2,
    companionName: 'Cowdi',
  });
  assert.equal(story.isSeason2, true);
  assert.equal(story.dialogue.speaker_id, 'ong_tu');
  assert.equal(story.dialogue.text_en, 'Good morning! Nice to meet you.');
  assert.equal(story.scene_id, 'bd_ben_go');
  assert.equal(story.scene.name_vi, 'Bến gỗ');
  const npcImg = getHumanNpcImage(story.dialogue.speaker_id);
  assert.equal(npcImg, '/image/npc/ong_tu.webp');
  assert.equal(fs.existsSync(`public${npcImg}`), true);
  assert.ok(story.intro_vi && story.intro_vi.length > 0);
});

test('U8: Xáo thứ tự 6 màn theo seed = id ải ổn định và 2 ải kề nhau trong cùng unit luôn khác thứ tự', () => {
  const unitLessons = ['greetings', 'family', 'colors', 'numbers'];
  const orders = [];
  let prev = null;
  for (const lid of unitLessons) {
    const order = computeMiddleOrder(hashString(`stage:${lid}`), prev);
    assert.notEqual(order[0], 'speak', `${lid}: speak không được đứng vị trí thứ 2`);
    if (prev) {
      assert.notDeepEqual(order, prev, `${lid} trùng thứ tự màn với ải liền trước`);
    }
    // Ổn định khi gọi lại lần 2
    assert.deepEqual(computeMiddleOrder(hashString(`stage:${lid}`), prev), order);
    orders.push(order);
    prev = order;
  }
});

test('U9: lesson.story trong file bài học được ưu tiên cao nhất (cả bài Season 2 lẫn bài ngoài Season 2)', () => {
  const customS2 = resolveLessonStory({
    lesson: {
      id: 'greetings',
      title: 'Chào hỏi cơ bản',
      story: {
        scene_id: 'bd_ben_go',
        intro_vi: 'Sương dày quá, đò chưa sang sông được. Con giúp ông chào khách trên bến gỗ nha!',
        dialogue: { speaker_id: 'ong_tu', text_en: 'Good morning! Nice to meet you.' },
      },
    },
    unitId: 'int-u1',
    region: 'BD',
  });
  assert.equal(
    customS2.intro_vi,
    'Sương dày quá, đò chưa sang sông được. Con giúp ông chào khách trên bến gỗ nha!',
  );
  assert.equal(customS2.dialogue.speaker_id, 'ong_tu');

  const customFuture = resolveLessonStory({
    lesson: {
      id: 'at-restaurant',
      title: 'Ở nhà hàng',
      story: {
        scene_id: 'region_BS',
        intro_vi: 'Quán ăn ven Bến Sóng đông khách lắm. Con cùng Lan gọi món bằng tiếng Anh nha!',
        dialogue: { speaker_id: 'lan', text_en: 'Can I see the menu, please?' },
      },
    },
    unitId: 'int-u6',
    region: 'BS',
  });
  assert.equal(customFuture.intro_vi, 'Quán ăn ven Bến Sóng đông khách lắm. Con cùng Lan gọi món bằng tiếng Anh nha!');
  assert.equal(customFuture.dialogue.speaker_id, 'lan');
  assert.equal(customFuture.dialogue.text_en, 'Can I see the menu, please?');
});
