import test from 'node:test';
import assert from 'node:assert/strict';
import { mixLesson } from './mixer.js';
import { SCREEN_CATALOG } from './catalog.js';
import { SCREEN_CONFIG } from '../../../data/config/screens.js';
import { GOLDEN_LESSONS } from '../../../data/lessons/_golden/index.js';

const MOCK_REGISTRY = [
  { code: 'T-01', level: 'focus',    slot: 'intro',  canRun: () => ({ ok: true, missing: [] }) },
  { code: 'T-02', level: 'focus',    slot: 'intro',  canRun: () => ({ ok: true, missing: [] }) },
  { code: 'F-01', level: 'friendly', slot: 'intro',  canRun: () => ({ ok: true, missing: [] }) },
  { code: 'T-05', level: 'focus',    slot: 'listen', canRun: () => ({ ok: true, missing: [] }) },
  { code: 'F-03', level: 'friendly', slot: 'listen', canRun: () => ({ ok: true, missing: [] }) },
  { code: 'T-06', level: 'focus',    slot: 'speak',  canRun: () => ({ ok: true, missing: [] }) },
  { code: 'F-04', level: 'friendly', slot: 'speak',  canRun: () => ({ ok: true, missing: [] }) },
  { code: 'T-04', level: 'focus',    slot: 'read',   canRun: (l) => ({ ok: Boolean(l?.reading?.passage), missing: l?.reading?.passage ? [] : ['reading.passage'] }) },
  { code: 'F-08', level: 'friendly', slot: 'read',   canRun: (l) => ({ ok: Boolean(l?.reading?.passage), missing: l?.reading?.passage ? [] : ['reading.passage'] }) },
  { code: 'T-08', level: 'focus',    slot: 'write',  canRun: () => ({ ok: true, missing: [] }) },
  { code: 'F-09', level: 'friendly', slot: 'write',  canRun: () => ({ ok: true, missing: [] }) },
  { code: 'T-07', level: 'focus',    slot: 'boss',   canRun: () => ({ ok: true, missing: [] }) },
  { code: 'F-06', level: 'friendly', slot: 'boss',   canRun: () => ({ ok: true, missing: [] }) },
];

const MOCK_CONFIG_ALL_ON = {
  status: Object.fromEntries(MOCK_REGISTRY.map((s) => [s.code, 'on'])),
  weights: SCREEN_CONFIG.weights,
};

const FULL_LESSON = {
  id: 'mock-full',
  vocabulary: [
    { word: 'apple', meaning: 'táo', example: 'I eat a fresh apple every day.', exampleVi: 'Tôi ăn một quả táo tươi mỗi ngày.' },
    { word: 'milk', meaning: 'sữa', example: 'She drinks warm milk in the morning.', exampleVi: 'Cô ấy uống sữa ấm vào buổi sáng.' },
    { word: 'book', meaning: 'sách', example: 'We read a fun book at school.', exampleVi: 'Chúng tôi đọc một cuốn sách hay ở trường.' },
    { word: 'friend', meaning: 'bạn bè', example: 'He meets his best friend at noon.', exampleVi: 'Cậu ấy gặp người bạn thân lúc trưa.' },
  ],
  grammar: [
    {
      title: 'Simple Present',
      examples: [
        { en: 'I eat an apple every day.', vi: 'Tôi ăn một quả táo mỗi ngày.' },
        { en: 'She drinks warm milk today.', vi: 'Cô ấy uống sữa ấm hôm nay.' },
        { en: 'We read a fun book together.', vi: 'Chúng tôi cùng đọc sách vui.' },
      ],
    },
  ],
  reading: { passage: 'I eat an apple and drink milk every morning.' },
  quiz: [{ question: 'What is apple?', options: ['táo', 'cam', 'lê', 'nho'], correct: 0 }],
};

// Chọn các bài golden không phải picture (hoặc đủ dữ liệu) để test M1
const NON_PICTURE_GOLDEN = GOLDEN_LESSONS.filter((l) => l.type !== 'picture');

test('M1: 1 000 seed × bài golden — intro đầu, boss cuối, màn giữa không trùng kỹ năng', () => {
  const sampleLessons = NON_PICTURE_GOLDEN.length > 0 ? [...NON_PICTURE_GOLDEN, FULL_LESSON] : [FULL_LESSON];
  for (const lesson of sampleLessons) {
    for (let seed = 1; seed <= 1000; seed++) {
      const res = mixLesson({ lesson, group: 'intermediate', config: SCREEN_CONFIG, registry: SCREEN_CATALOG, seed });
      assert.equal(res.screens[0].slot, 'intro');
      assert.equal(res.screens[res.screens.length - 1].slot, 'boss');
      const midSlots = res.screens.slice(1, -1).map((s) => s.slot);
      assert.equal(new Set(midSlots).size, midSlots.length, 'kỹ năng màn giữa không được trùng');
      if (lesson === FULL_LESSON) {
        assert.equal(res.screens.length, 6);
        assert.equal(res.skipped.length, 0);
      }
    }
  }
});

test('M2: Không seed nào cho màn thứ 2 là speak (kể cả khi có slot bị bỏ)', () => {
  const noReadLesson = { ...FULL_LESSON, reading: null };
  for (const lesson of [FULL_LESSON, noReadLesson]) {
    for (let seed = 1; seed <= 1000; seed++) {
      const res = mixLesson({ lesson, group: 'intermediate', config: SCREEN_CONFIG, registry: SCREEN_CATALOG, seed });
      assert.notEqual(res.screens[1].slot, 'speak', `seed ${seed} bị speak ở vị trí 2`);
    }
  }
});

test('M3: Cùng input + cùng seed → cùng kết quả', () => {
  const a = mixLesson({ lesson: FULL_LESSON, group: 'intermediate', config: MOCK_CONFIG_ALL_ON, registry: MOCK_REGISTRY, seed: 424242 });
  const b = mixLesson({ lesson: FULL_LESSON, group: 'intermediate', config: MOCK_CONFIG_ALL_ON, registry: MOCK_REGISTRY, seed: 424242 });
  assert.deepEqual(a, b);
});

test('M4: lastMix được tôn trọng khi slot có >= 2 ứng viên', () => {
  const lastMix = { intro: 'T-01', listen: 'T-05', speak: 'T-06', read: 'T-04', write: 'T-08', boss: 'T-07' };
  for (let seed = 1; seed <= 200; seed++) {
    const res = mixLesson({
      lesson: FULL_LESSON,
      group: 'intermediate',
      lastMix,
      config: MOCK_CONFIG_ALL_ON,
      registry: MOCK_REGISTRY,
      seed,
    });
    for (const s of res.screens) {
      assert.notEqual(s.code, lastMix[s.slot], `slot ${s.slot} bị lặp lastMix ở seed ${seed}`);
    }
  }
});

test('M5: Trọng số exam 10 000 seed → tỉ lệ focus màn giữa trong khoảng 72–78%', () => {
  let focusCount = 0;
  let totalMid = 0;
  for (let seed = 1; seed <= 10000; seed++) {
    const res = mixLesson({
      lesson: FULL_LESSON,
      group: 'exam',
      config: MOCK_CONFIG_ALL_ON,
      registry: MOCK_REGISTRY,
      seed,
    });
    for (const s of res.screens.slice(1, -1)) {
      totalMid++;
      if (s.level === 'focus') focusCount++;
    }
  }
  const ratio = focusCount / totalMid;
  assert.ok(ratio >= 0.72 && ratio <= 0.78, `tỉ lệ focus = ${(ratio * 100).toFixed(2)}% nằm ngoài 72–78%`);
});

test('M6: Bài thiếu reading → slot read nằm trong skipped, screens có 5 màn, log có skip', () => {
  const noRead = { ...FULL_LESSON, reading: null };
  const res = mixLesson({ lesson: noRead, group: 'intermediate', config: SCREEN_CONFIG, registry: SCREEN_CATALOG, seed: 7 });
  assert.deepEqual(res.skipped, ['read']);
  assert.equal(res.screens.length, 5);
  assert.ok(res.log.some((l) => l.includes('skip')), 'log phải có ghi chú skip');
});

test('M7: Ràng buộc intermediate với registry có 2 mức → 1 000 seed đều có >=1 focus và >=1 friendly ở màn giữa', () => {
  for (let seed = 1; seed <= 1000; seed++) {
    const res = mixLesson({
      lesson: FULL_LESSON,
      group: 'intermediate',
      config: MOCK_CONFIG_ALL_ON,
      registry: MOCK_REGISTRY,
      seed,
    });
    const mids = res.screens.slice(1, -1);
    assert.ok(mids.some((s) => s.level === 'focus'), `seed ${seed} thiếu focus`);
    assert.ok(mids.some((s) => s.level === 'friendly'), `seed ${seed} thiếu friendly`);
  }
});

test('M8: Nhóm exam → boss luôn T-07', () => {
  for (let seed = 1; seed <= 500; seed++) {
    const res = mixLesson({
      lesson: FULL_LESSON,
      group: 'exam',
      config: MOCK_CONFIG_ALL_ON,
      registry: MOCK_REGISTRY,
      seed,
    });
    assert.equal(res.screens[res.screens.length - 1].code, 'T-07');
  }
});

test('M9: Màn trạng thái test không bao giờ chọn khi isTester=false; được chọn khi isTester=true', () => {
  const cfg = {
    status: { ...MOCK_CONFIG_ALL_ON.status, 'F-03': 'test' },
    weights: SCREEN_CONFIG.weights,
  };
  for (let seed = 1; seed <= 300; seed++) {
    const res = mixLesson({ lesson: FULL_LESSON, group: 'intermediate', config: cfg, registry: MOCK_REGISTRY, isTester: false, seed });
    assert.ok(res.screens.every((s) => s.code !== 'F-03'), `isTester=false vẫn dính F-03 ở seed ${seed}`);
  }
  let sawF03 = false;
  for (let seed = 1; seed <= 300; seed++) {
    const res = mixLesson({ lesson: FULL_LESSON, group: 'intermediate', config: cfg, registry: MOCK_REGISTRY, isTester: true, seed });
    if (res.screens.some((s) => s.code === 'F-03')) { sawF03 = true; break; }
  }
  assert.equal(sawF03, true, 'isTester=true phải có thể gặp màn trạng thái test');
});
