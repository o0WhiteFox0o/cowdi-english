import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDuelQuizPool,
  generateDuelQuiz,
  resolveLessonCategory,
  resolveQuestionSpeak,
  isPlayableDuelQuestion,
} from './duel-quiz-pool.js';

test('Duel quiz pool: mọi câu hỏi đều hợp lệ và câu nghe luôn có speak', () => {
  const pool = getDuelQuizPool();
  assert.ok(pool.length > 500, `Expected >500 questions in pool, got ${pool.length}`);

  const byCat = {};
  for (const q of pool) {
    byCat[q.category] = (byCat[q.category] || 0) + 1;
    assert.ok(isPlayableDuelQuestion(q), `Unplayable question leaked into pool: ${q.question}`);
    if (q.category === 'listening') {
      assert.ok(
        String(q.speak || '').trim().length > 0,
        `Listening question missing speak: ${q.question}`
      );
    }
    if (q.audioText) {
      assert.equal(
        q.speak,
        q.audioText,
        `Question with audioText must expose speak: ${q.question}`
      );
    }
    if (q.skill === 'grammar') {
      assert.equal(q.category, 'grammar', `Grammar question mislabeled as ${q.category}: ${q.question}`);
    }
    if (q.skill === 'listening') {
      assert.equal(q.category, 'listening', `Listening question mislabeled as ${q.category}: ${q.question}`);
    }
  }

  assert.ok((byCat.listening || 0) >= 100, `Expected >=100 listening questions (QUIZ_BANK + lesson audioText), got ${byCat.listening}`);
  assert.ok((byCat.grammar || 0) >= 200, `Expected >=200 grammar questions, got ${byCat.grammar}`);
  assert.ok((byCat.vocabulary || 0) >= 500, `Expected >=500 vocabulary questions, got ${byCat.vocabulary}`);
});

test('resolveLessonCategory: không gán sai câu ngữ pháp / câu nghe thành vocabulary', () => {
  assert.equal(
    resolveLessonCategory({ question: 'Chọn câu nối lý do đúng:', options: ['a', 'b'], correct: 0 }),
    'grammar'
  );
  assert.equal(
    resolveLessonCategory({ skill: 'listening', audioText: 'Hello world', question: 'Nghe và chọn ý đúng:', options: ['a', 'b'], correct: 0 }),
    'listening'
  );
  assert.equal(
    resolveLessonCategory({ skill: 'grammar', question: 'She ___ to school.', options: ['go', 'goes'], correct: 1 }),
    'grammar'
  );
});

test('resolveQuestionSpeak: ưu tiên speak/audioText và trích được từ tiếng Anh trong ngoặc kép', () => {
  assert.equal(resolveQuestionSpeak({ audioText: 'Two thousand students.' }), 'Two thousand students.');
  assert.equal(resolveQuestionSpeak({ question: '"Apple" nghĩa là:' }), 'Apple');
});

test('generateDuelQuiz: sinh đủ câu cho mọi chuyên mục và không bị thiếu speak ở câu nghe', () => {
  for (const cat of ['all', 'vocabulary', 'grammar', 'sentences', 'listening']) {
    const qs = generateDuelQuiz(20, cat);
    assert.equal(qs.length, 20, `Category ${cat} should return 20 questions`);
    for (const q of qs) {
      if (cat !== 'all') {
        assert.equal(q.category, cat, `Expected category ${cat}, got ${q.category}`);
      }
      if (q.category === 'listening') {
        assert.ok(q.speak, `Generated listening question missing speak: ${q.question}`);
      }
    }
  }
});
