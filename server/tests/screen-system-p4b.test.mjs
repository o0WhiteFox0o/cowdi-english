import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../src/features/lesson/screens/seededRandom.js';
import {
  pluralizeNoun,
  buildMarketOrderSentence,
  buildMarketBaskets,
  canRunF07,
} from '../../src/features/lesson/screens/friendly/f07Logic.js';
import {
  evaluateDialogReply,
  canRunF10,
} from '../../src/features/lesson/screens/friendly/f10Logic.js';
import {
  selectTrueFalseDeck,
  canRunF11,
} from '../../src/features/lesson/screens/friendly/f11Logic.js';
import { validateLesson } from '../../src/data/lessons/schema.js';
import { ALL_LESSONS } from '../../src/data/lessons/index.js';
import { P4B_SEED_INTROS, P4B_INTRO_CODES, P4B_INTRO_REGIONS } from '../db/seed-screen-intros-p4b.js';
import { getScreenTitle } from '../../shared/screen-scenarios.js';

// ── Q4: F-07 4 giỏ luôn khác nhau, đúng 1 giỏ đúng + 20 danh từ số nhiều ────
test('Q4: F-07 20 danh từ số nhiều chuẩn & 4 giỏ luôn khác nhau với đúng 1 giỏ đúng', () => {
  const samples = [
    ['apple', 'apples'],
    ['book', 'books'],
    ['cat', 'cats'],
    ['boy', 'boys'],
    ['bus', 'buses'],
    ['box', 'boxes'],
    ['dish', 'dishes'],
    ['watch', 'watches'],
    ['dress', 'dresses'],
    ['baby', 'babies'],
    ['library', 'libraries'],
    ['family', 'families'],
    ['mango', 'mangoes'],
    ['tomato', 'tomatoes'],
    ['potato', 'potatoes'],
    ['tooth', 'teeth'],
    ['foot', 'feet'],
    ['child', 'children'],
    ['scarf', 'scarves'],
    ['leaf', 'leaves'],
  ];
  assert.equal(samples.length, 20);
  for (const [singular, expectedPlural] of samples) {
    assert.equal(pluralizeNoun(singular), expectedPlural, `${singular} → ${expectedPlural}`);
  }

  assert.equal(buildMarketOrderSentence({ word: 'Mango', plural: 'mangoes' }, 1), 'One mango, please.');
  assert.equal(buildMarketOrderSentence({ word: 'Mango', plural: 'mangoes' }, 3), 'Three mangoes, please.');

  const pool = [
    { word: 'Book', meaning: 'Quyển sách', illustration: '📖', countable: true, plural: 'books' },
    { word: 'Pencil', meaning: 'Bút chì', illustration: '✏️', countable: true, plural: 'pencils' },
    { word: 'Desk', meaning: 'Bàn học', illustration: '🪵', countable: true, plural: 'desks' },
    { word: 'Notebook', meaning: 'Quyển vở', illustration: '📓', countable: true, plural: 'notebooks' },
  ];

  const rng = createRng(99);
  for (let i = 0; i < 30; i++) {
    const target = pool[i % pool.length];
    const count = 1 + (i % 5);
    const baskets = buildMarketBaskets(target, count, pool, 5, rng);
    assert.equal(baskets.length, 4);
    assert.equal(baskets.filter((b) => b.isCorrect).length, 1);
    const sigs = new Set(baskets.map((b) => `${b.item.word}:${b.count}`));
    assert.equal(sigs.size, 4, 'Cả 4 giỏ phải khác nhau hoàn toàn');
  }
});

// ── Q5 & Q3: F-10 bộ test 20 câu mẫu (đạt / không đạt) + không mic không ghi ─
test('Q5 & Q3: F-10 chấm tất định (không AI) khớp 20 câu mẫu & không mic không ghi skillsHit.speak', () => {
  const prompt = {
    id: 'greet-1',
    npc: 'ong_tu',
    askEn: 'How are you today?',
    answers: [
      { en: "I'm fine, thank you.", vi: 'Con khoẻ, cảm ơn ông.' },
      { en: "I'm good. And you?", vi: 'Con ổn. Còn ông?' },
    ],
    keywords: ['fine'],
  };

  // Q3: Không dùng mic (chạm chọn) → qua màn, recordSkillHit = false
  assert.deepEqual(
    evaluateDialogReply({ spoken: "I'm fine, thank you.", prompt, group: 'intermediate', micUsed: false }),
    { passed: true, recordSkillHit: false, reason: 'nomic_tap', overlap: 1 },
  );

  // Mới học: không chấm
  assert.equal(evaluateDialogReply({ spoken: 'hello', prompt, group: 'beginner', micUsed: true }).passed, true);

  // 20 câu mẫu (10 đạt, 10 không đạt)
  const cases = [
    ["I'm fine, thank you.", true],
    ['I am fine thanks', true],
    ['fine', true],
    ['Yes I am fine today', true],
    ["I'm good and you", true],
    ['I am good and you?', true],
    ['I am good', true], // 3/5 = 60% of "i am good and you"
    ['thank you i am fine', true],
    ['very fine thank you sir', true],
    ['good and you i am', true],
    ['', false],
    ['hello there', false],
    ['goodbye', false],
    ['my name is minh', false],
    ['red apple', false],
    ['blue sky today', false],
    ['sorry i am late', false],
    ['one two three four', false],
    ['where is the library', false],
    ['see you tomorrow', false],
  ];
  assert.equal(cases.length, 20);
  for (const [spoken, expectedPass] of cases) {
    const res = evaluateDialogReply({ spoken, prompt, group: 'intermediate', micUsed: true });
    assert.equal(res.passed, expectedPass, `Câu "${spoken}" kỳ vọng passed=${expectedPass}, nhận ${res.passed}`);
  }
});

// ── Q6: F-11 tỉ lệ đúng/sai nằm trong khoảng 40–60% ─────────────────────────
test('Q6: F-11 chọn 6–8 thẻ với tỉ lệ đúng/sai trong khoảng 40–60%', () => {
  const sampleItems = [
    { en: 'A', vi: 'A', isTrue: true },
    { en: 'B', vi: 'B', isTrue: true },
    { en: 'C', vi: 'C', isTrue: true },
    { en: 'D', vi: 'D', isTrue: true },
    { en: 'E', vi: 'E', isTrue: true },
    { en: 'F', vi: 'F', isTrue: false, whyVi: 'sai' },
    { en: 'G', vi: 'G', isTrue: false, whyVi: 'sai' },
    { en: 'H', vi: 'H', isTrue: false, whyVi: 'sai' },
    { en: 'I', vi: 'I', isTrue: false, whyVi: 'sai' },
  ];

  for (let seed = 1; seed <= 20; seed++) {
    const deck = selectTrueFalseDeck(sampleItems, createRng(seed), 8);
    assert.ok(deck.length >= 6 && deck.length <= 8);
    const ratio = deck.filter((c) => c.isTrue).length / deck.length;
    assert.ok(ratio >= 0.4 && ratio <= 0.6, `Tỉ lệ đúng ${ratio} nằm ngoài 40–60%`);
  }
});

// ── Q8: Validator bắt lỗi đúng với dialogPrompts & trueFalse sai mẫu ────────
test('Q8: Validator báo lỗi đúng với dialogPrompts & trueFalse sai mẫu', () => {
  const baseLesson = ALL_LESSONS.find((l) => l.id === 'greetings');
  assert.ok(baseLesson);

  // 1. npc ngoài HUMAN_CAST + keyword không có trong answers[].en + câu > 12 từ
  const badDialog = {
    ...baseLesson,
    dialogPrompts: [{
      id: 'bad-1',
      npc: 'stranger_xyz',
      askEn: 'This question is intentionally written with way more than twelve English words here.',
      askVi: 'Câu hỏi quá dài',
      answers: [{ en: 'I am happy.', vi: 'Con vui.' }],
      keywords: ['missingword'],
      replyEn: 'Good!',
      replyVi: 'Tốt!',
    }],
  };
  const r1 = validateLesson(badDialog);
  assert.ok(r1.errors.some((e) => e.includes('HUMAN_CAST')));
  assert.ok(r1.errors.some((e) => e.includes('12 từ')));
  assert.ok(r1.errors.some((e) => e.includes('missingword')));

  // 2. trueFalse thiếu whyVi khi isTrue=false + chỉ có câu sai + ảnh không tồn tại
  const badTf = {
    ...baseLesson,
    trueFalse: [
      { en: 'False 1.', vi: 'Sai 1', image: '/image/not-exists-xyz.webp', isTrue: false },
      { en: 'False 2.', vi: 'Sai 2', illustration: '❌', isTrue: false, whyVi: 'Vì sai' },
    ],
  };
  const r2 = validateLesson(badTf, { imageExists: () => false });
  assert.ok(r2.errors.some((e) => e.includes('whyVi')));
  assert.ok(r2.errors.some((e) => e.includes('ảnh không tồn tại')));
  assert.ok(r2.errors.some((e) => e.includes('cả câu đúng')));
});

// ── Độ phủ 12 bài int-u1..u3, kịch bản tên & 36 câu dẫn draft Đợt 4b ───────
test('Đợt 4b: 12 bài int-u1..u3 chạy được F-10 & F-11, ≥6 bài chạy F-07, đủ 36 câu dẫn draft', () => {
  const int12Ids = [
    'greetings', 'family', 'colors', 'numbers',
    'school', 'weather', 'jobs', 'body',
    'clothing', 'house', 'emotions', 'hobbies',
  ];
  let f07Count = 0;
  for (const id of int12Ids) {
    const lesson = ALL_LESSONS.find((l) => l.id === id);
    assert.ok(lesson, `Thiếu bài ${id}`);
    assert.equal(canRunF10(lesson).ok, true, `${id} phải chạy được F-10`);
    assert.equal(canRunF11(lesson).ok, true, `${id} phải chạy được F-11`);
    if (canRunF07(lesson).ok) f07Count++;
  }
  assert.ok(f07Count >= 6, `Kỳ vọng ≥ 6/12 bài chạy được F-07, đang có ${f07Count}`);

  assert.equal(getScreenTitle('F-07', 'BD'), 'Chợ nổi');
  assert.equal(getScreenTitle('F-07', null), 'Nghe đếm số lượng');
  assert.equal(getScreenTitle('F-10', 'BD'), 'Trò chuyện với Ông Tư');
  assert.equal(getScreenTitle('F-11', 'VS'), 'Đúng hay sai');

  assert.equal(P4B_SEED_INTROS.length, P4B_INTRO_CODES.length * P4B_INTRO_REGIONS.length * 4);
  assert.equal(P4B_SEED_INTROS.length, 36);
  const banned = /\b(gem|tiền|mua|ngu|kém|dốt)\b/i;
  for (const row of P4B_SEED_INTROS) {
    assert.equal(row.status, 'draft');
    const words = row.textVi.trim().split(/\s+/).length;
    assert.ok(words <= 25, `${row.id} vượt 25 chữ (${words} chữ)`);
    assert.doesNotMatch(row.textVi, banned, `${row.id} chứa từ cấm`);
  }
});
