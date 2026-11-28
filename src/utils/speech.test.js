import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeText,
  expandContractions,
  tokenizeText,
  extractBestTranscript,
  scorePronunciation,
  scoreTypedSentence,
  getScoreLabel,
} from './speech.js';

test('A1: chuỗi rỗng không bị chấm nhầm 100% và trả đúng missed', () => {
  const res = scorePronunciation('Hello world!', '');
  assert.equal(res.score, 0);
  assert.deepEqual(res.matched, []);
  assert.deepEqual(res.missed, ['hello', 'world']);
  assert.deepEqual(tokenizeText('   '), []);
});

test('A2: normalizeText & expandContractions xử lý rút gọn tương đương', () => {
  assert.equal(expandContractions("I'm fine, don't worry!"), 'i am fine do not worry');
  assert.equal(expandContractions("It's good, you're right, I can't wait."), 'it is good you are right i cannot wait');
  assert.equal(scorePronunciation("I'm happy today.", 'I am happy today').score, 100);
});

test('A3: scoreTypedSentence chấp nhận rút gọn và dung sai 1 ký tự với từ >= 5 chữ', () => {
  const exact = scoreTypedSentence("It's a sunny morning!", 'It is a sunny morning');
  assert.equal(exact.ok, true);
  assert.equal(exact.exact, true);
  assert.equal(exact.typoWords.length, 0);

  const typo = scoreTypedSentence('My brother plays football.', 'My broter plays fotball');
  assert.equal(typo.ok, true);
  assert.equal(typo.exact, false);
  assert.equal(typo.typoWords.length, 2);
  assert.equal(typo.typoWords[0].expected, 'brother');

  // Từ < 5 chữ sai 1 ký tự vẫn tính sai
  const shortWrong = scoreTypedSentence('I like cats.', 'I like cots');
  assert.equal(shortWrong.ok, false);
  assert.deepEqual(shortWrong.wrongIndices, [2]);

  // Rút gọn can't ↔ cannot
  const cant = scoreTypedSentence("I can't swim.", 'I cannot swim');
  assert.equal(cant.ok, true);
});

test('getScoreLabel trả về nhãn hợp lệ theo ngưỡng điểm', () => {
  assert.equal(getScoreLabel(95).icon, '🌟');
  assert.equal(getScoreLabel(75).icon, '👍');
  assert.equal(getScoreLabel(55).icon, '💪');
  assert.equal(getScoreLabel(35).icon, '📖');
  assert.equal(getScoreLabel(10).icon, '🔄');
});

test('extractBestTranscript giữ được câu interim khi trình duyệt ĐT kết thúc không bắn isFinal', () => {
  const interimOnly = [
    Object.assign([{ transcript: 'Good morning' }], { isFinal: false }),
  ];
  const r1 = extractBestTranscript(interimOnly);
  assert.equal(r1.hasFinal, false);
  assert.equal(r1.bestText, 'Good morning');

  const mixed = [
    Object.assign([{ transcript: 'Hello' }], { isFinal: true }),
    Object.assign([{ transcript: 'nice to meet you' }], { isFinal: false }),
  ];
  const r2 = extractBestTranscript(mixed);
  assert.equal(r2.hasFinal, true);
  assert.equal(r2.finalText, 'Hello');
  assert.equal(r2.bestText, 'Hello nice to meet you');
});
