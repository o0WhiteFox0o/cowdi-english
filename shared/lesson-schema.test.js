// Kiểm tra chuẩn nội dung bài học: bài golden phải đạt chuẩn, và validator phải bắt được lỗi cố ý.
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLesson, toLegacyShape, examQuestionsToMcq } from '../src/data/lessons/schema.js';
import { GOLDEN_LESSONS } from '../src/data/lessons/_golden/index.js';
import { withReading } from '../src/data/lessons/reading.js';
import { withStandards } from '../src/data/lessons/standards.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const byId = Object.fromEntries(GOLDEN_LESSONS.map((l) => [l.id, l]));

test('3 bài golden đạt chuẩn v2, không lỗi không cảnh báo', () => {
  for (const l of GOLDEN_LESSONS) {
    const r = validateLesson(l);
    assert.deepEqual(r.errors, [], `${l.id}: ${r.errors.join(' | ')}`);
    assert.deepEqual(r.warnings, [], `${l.id}: ${r.warnings.join(' | ')}`);
  }
});

test('golden chạy được trên UI hiện tại sau toLegacyShape', () => {
  for (const l of GOLDEN_LESSONS) {
    const x = toLegacyShape(l);
    assert.ok(Array.isArray(x.vocabulary) && x.vocabulary.length >= 5, l.id);
    assert.ok(Array.isArray(x.grammar), l.id);
    assert.ok(x.quiz.length > 0, `${l.id}: quiz rỗng thì bước Quiz bị ẩn`);
    for (const q of x.quiz) assert.ok(q.correct >= 0 && q.correct < q.options.length, l.id);
  }
});

test('evidence.quote sai một chữ bị bắt', () => {
  const m = clone(byId['ielts-read-rooftop-farms']);
  m.reading.examQuestions[0].evidence.quote += 'x';
  assert.ok(validateLesson(m).errors.some((e) => e.includes('evidence.quote')));
});

test('đáp án điền từ dài hơn maxWords bị bắt', () => {
  const m = clone(byId['ielts-read-rooftop-farms']);
  const i = m.reading.examQuestions.findIndex((q) => q.type === 'sentence-completion');
  m.reading.examQuestions[i].maxWords = 1;
  m.reading.examQuestions[i].answer = 'social value';
  m.reading.examQuestions[i].evidence = { paragraph: 'E', quote: 'should be judged as much by their social value as by their yield' };
  assert.ok(validateLesson(m).errors.some((e) => e.includes('maxWords')));
});

test('bài v2 thiếu explanation hoặc quiz ngắn bị coi là lỗi', () => {
  const m = clone(byId.greetings);
  m.quiz = m.quiz.slice(0, 5);
  delete m.quiz[0].explanation;
  const r = validateLesson(m);
  assert.ok(r.errors.some((e) => e.includes('≥8')));
  assert.ok(r.errors.some((e) => e.includes('explanation')));
});

test('bài cũ (không contentVersion) chỉ bị cảnh báo, trừ lỗi cấu trúc', () => {
  const m = clone(byId.greetings);
  delete m.contentVersion;
  m.quiz = m.quiz.slice(0, 5);
  assert.deepEqual(validateLesson(m).errors, []);
  m.quiz[0].options = ['a', 'a', 'b', 'c'];
  assert.ok(validateLesson(m).errors.some((e) => e.includes('trùng')));
});

test('starter: trùng từ, có phiên âm bị bắt', () => {
  const m = clone(byId['s1-pets']);
  m.words[1].word = 'cat';
  m.words[2].phonetic = '/fɪʃ/';
  const r = validateLesson(m);
  assert.ok(r.errors.some((e) => e.includes('trùng')));
  assert.ok(r.errors.some((e) => e.includes('IPA')));
});

test('TFNG đổi sang trắc nghiệm đúng chỉ số', () => {
  const [q] = examQuestionsToMcq([{ type: 'tfng', prompt: 'x', answer: 'NOT GIVEN' }]);
  assert.deepEqual(q.options, ['TRUE', 'FALSE', 'NOT GIVEN']);
  assert.equal(q.correct, 2);
});

test('withReading bảo toàn đầy đủ các trường v2 của bài Exam Reading', () => {
  const [processed] = withReading(withStandards([toLegacyShape(byId['ielts-read-rooftop-farms'])]));
  assert.ok(Array.isArray(processed.reading.paragraphs) && processed.reading.paragraphs.length >= 4);
  assert.ok(Array.isArray(processed.reading.glossary) && processed.reading.glossary.length >= 10);
  assert.ok(Array.isArray(processed.reading.paraphrasePairs) && processed.reading.paraphrasePairs.length >= 5);
  assert.ok(Array.isArray(processed.reading.examQuestions) && processed.reading.examQuestions.length >= 10);
  assert.equal(processed.reading.timeLimitMin, 20);
  assert.ok(processed.reading.questions.length > 0);
});
