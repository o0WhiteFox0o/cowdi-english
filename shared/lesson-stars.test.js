import test from 'node:test';
import assert from 'node:assert/strict';
import { computeLessonResult, lessonMilk, STAR_BONUS } from './lesson-stars.js';

test('S1: Boss 10/10, chính xác 96% → ★★★, lần đầu 190 Sữa', () => {
  const res = computeLessonResult({
    group: 'intermediate',
    results: [
      { code: 'F-01', slot: 'intro', total: 8, firstTryCorrect: 0 },
      { code: 'F-03', slot: 'listen', total: 6, firstTryCorrect: 6 },
      { code: 'F-08', slot: 'read', total: 5, firstTryCorrect: 5 },
      { code: 'F-09', slot: 'write', total: 4, firstTryCorrect: 3 },
      { code: 'F-06', slot: 'boss', total: 10, firstTryCorrect: 10 },
    ],
    bossCorrect: 10,
    bossTotal: 10,
    passRate: 0.7,
  });
  assert.equal(res.passed, true);
  assert.ok(res.accuracy >= 0.95);
  assert.equal(res.stars, 3);
  assert.equal(lessonMilk({ bossCorrect: 10, stars: 3, isFirstPass: true }), 190);
});

test('S2: Boss 9/10, chính xác 88% → ★★, lần đầu 165 Sữa', () => {
  const res = computeLessonResult({
    group: 'intermediate',
    results: [
      { code: 'F-03', slot: 'listen', total: 6, firstTryCorrect: 5 },
      { code: 'F-08', slot: 'read', total: 5, firstTryCorrect: 4 },
      { code: 'F-09', slot: 'write', total: 4, firstTryCorrect: 4 },
      { code: 'F-06', slot: 'boss', total: 10, firstTryCorrect: 9 },
    ],
    bossCorrect: 9,
    bossTotal: 10,
    passRate: 0.7,
  });
  assert.equal(res.passed, true);
  assert.equal(res.stars, 2);
  assert.equal(lessonMilk({ bossCorrect: 9, stars: 2, isFirstPass: true }), 165);
});

test('S3: Làm lại từ ★★ lên ★★★ → +15 thưởng sao một lần; làm lại nữa vẫn ★★★ → không thêm', () => {
  const baseRepeat = Math.max(5, Math.round((10 * 10) / 3)); // 33
  const upgraded = lessonMilk({ bossCorrect: 10, stars: 3, isFirstPass: false, prevStarsPaid: 2 });
  assert.equal(upgraded, baseRepeat + (STAR_BONUS[3] - STAR_BONUS[2])); // 33 + 15 = 48

  const again = lessonMilk({ bossCorrect: 10, stars: 3, isFirstPass: false, prevStarsPaid: 3 });
  assert.equal(again, baseRepeat);
});

test('S4: Chưa qua → 0 sao lần này, Sữa 1/3', () => {
  const res = computeLessonResult({
    group: 'intermediate',
    results: [{ code: 'F-06', slot: 'boss', total: 10, firstTryCorrect: 5 }],
    bossCorrect: 5,
    bossTotal: 10,
    passRate: 0.7,
  });
  assert.equal(res.passed, false);
  assert.equal(res.stars, 0);
  assert.equal(lessonMilk({ bossCorrect: 5, stars: 0, isFirstPass: true }), Math.max(5, Math.round(50 / 3)));
});

test('S5: Item khách quen và Màn 1 không ảnh hưởng accuracy; Nói không tính ở nhóm Trung bình', () => {
  const res = computeLessonResult({
    group: 'intermediate',
    results: [
      { code: 'F-01', slot: 'intro', total: 10, firstTryCorrect: 0 },
      { code: 'T-06', slot: 'speak', total: 4, firstTryCorrect: 0 }, // bỏ qua ở intermediate
      { code: 'F-03', slot: 'listen', total: 6, firstTryCorrect: 6, guestTotal: 2, guestCorrect: 0 },
      { code: 'F-06', slot: 'boss', total: 10, firstTryCorrect: 10 },
    ],
    bossCorrect: 10,
    bossTotal: 10,
    passRate: 0.7,
  });
  assert.equal(res.accuracy, 1);
  assert.equal(res.stars, 3);
});
