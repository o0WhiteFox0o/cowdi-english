// Chạy: node --test src/features/vocab/wordProgress.test.js   (Node ≥ 18)
// Giữ nguyên 16 ca kiểm thử gốc từ reference/wordProgress.test.js + bổ sung ca cho normalizeWordId & mergeProgressMap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyProgress, wordStatus, isMaybeForgotten, applyEncounter, applyAnswer,
  applyQuestionResult, mergeProgress, mergeProgressMap, orderCards, migrateLegacyKnown,
  normalizeWordId, WORD_STATUS_UI,
} from './wordProgress.js';

const MID = { knownAtPoints: 4, maybeForgetDays: 14 };
const BEG = { knownAtPoints: 5, maybeForgetDays: 7 };
const T0 = '2026-11-26T05:00:00.000Z';
const day = (n) => new Date(Date.parse(T0) + n * 86400000).toISOString();

test('S-1 chưa tương tác → new', () => {
  assert.equal(wordStatus(undefined, MID), 'new');
  assert.equal(wordStatus(emptyProgress(), MID), 'new');
});

test('S-2 lật nhiều lần trong một lượt chỉ +1', () => {
  const run = new Set();
  let p;
  for (let i = 0; i < 8; i++) p = applyEncounter(p, run, 'x', MID, T0);
  assert.equal(p.points, 1);
  assert.equal(wordStatus(p, MID), 'learning');
});

test('S-3 bốn lượt flashcard cùng ngày → known', () => {
  let p;
  for (let i = 0; i < 4; i++) p = applyEncounter(p, new Set(), 'x', MID, T0);
  assert.equal(p.points, 4);
  assert.equal(wordStatus(p, MID), 'known');
});

test('S-4 đúng ở 2 lượt quiz khác nhau → known', () => {
  let p = applyAnswer(undefined, new Set(), 'y', true, MID, T0);
  p = applyAnswer(p, new Set(), 'y', true, MID, T0);
  assert.equal(p.points, 4);
  assert.equal(wordStatus(p, MID), 'known');
});

test('S-5 hai câu cùng kiểm tra một từ trong một quiz chỉ +2', () => {
  const run = new Set();
  let p = applyAnswer(undefined, run, 'y', true, MID, T0);
  p = applyAnswer(p, run, 'y', true, MID, T0);
  assert.equal(p.points, 2);
  assert.equal(p.correctTotal, 2);
});

test('S-6/7/8 sai → review; nhìn thẻ vẫn review; đúng → thoát review', () => {
  let p;
  for (let i = 0; i < 4; i++) p = applyEncounter(p, new Set(), 'x', MID, T0);
  p = applyAnswer(p, new Set(), 'x', false, MID, T0);
  assert.equal(p.points, 0);
  assert.equal(wordStatus(p, MID), 'review');
  p = applyEncounter(p, new Set(), 'x', MID, T0);
  assert.equal(p.points, 1);
  assert.equal(wordStatus(p, MID), 'review');
  p = applyAnswer(p, new Set(), 'x', true, MID, T0);
  assert.equal(p.points, 3);
  assert.equal(wordStatus(p, MID), 'learning');
});

test('S-9/10 lâu không gặp chỉ là cờ, không đổi trạng thái; gặp lại thì mất cờ', () => {
  let p;
  for (let i = 0; i < 4; i++) p = applyEncounter(p, new Set(), 'x', MID, T0);
  const later = Date.parse(day(15));
  assert.equal(wordStatus(p, MID), 'known');
  assert.equal(isMaybeForgotten(p, MID, later), true);
  assert.equal(p.points, 4);
  p = applyEncounter(p, new Set(), 'x', MID, day(15));
  assert.equal(isMaybeForgotten(p, MID, later), false);
});

test('Cờ "Lâu chưa gặp" không áp cho từ chưa known', () => {
  const p = applyEncounter(undefined, new Set(), 'x', MID, T0);
  assert.equal(isMaybeForgotten(p, MID, Date.parse(day(100))), false);
});

test('S-11 nhóm Mới học cần 5 lượt', () => {
  let p;
  for (let i = 0; i < 4; i++) p = applyEncounter(p, new Set(), 'x', BEG, T0);
  assert.equal(wordStatus(p, BEG), 'learning');
  p = applyEncounter(p, new Set(), 'x', BEG, T0);
  assert.equal(wordStatus(p, BEG), 'known');
});

test('S-12 câu không có targetWords không đổi gì', () => {
  const map = { x: { ...emptyProgress(), points: 2 } };
  const out = applyQuestionResult(map, { id: 'q1' }, false, new Set(), MID, T0);
  assert.equal(out, map);
});

test('Câu có nhiều targetWords áp cho từng từ', () => {
  const out = applyQuestionResult({}, { targetWords: ['a', 'b'] }, true, new Set(), MID, T0);
  assert.equal(out.a.points, 2);
  assert.equal(out.b.points, 2);
});

test('S-14 migration dữ liệu "đã thuộc" cũ → learning 1 điểm', () => {
  const m = migrateLegacyKnown(['a', 'b'], T0);
  assert.equal(wordStatus(m.a, MID), 'learning');
  assert.equal(m.b.points, 1);
});

test('Điểm bị chặn trên ở knownAtPoints + 5', () => {
  let p;
  for (let i = 0; i < 30; i++) p = applyEncounter(p, new Set(), 'x', MID, T0);
  assert.equal(p.points, 9);
});

test('S-15 gộp 2 thiết bị: lần sai mới hơn thắng', () => {
  let a, b;
  for (let i = 0; i < 4; i++) a = applyEncounter(a, new Set(), 'x', MID, day(0));
  b = applyAnswer(a, new Set(), 'x', false, MID, day(1));
  const m = mergeProgress(a, b);
  assert.equal(wordStatus(m, MID), 'review');
  assert.equal(m.points, 0);
});

test('Gộp 2 thiết bị: câu đúng mới hơn lần sai → lấy điểm lớn hơn', () => {
  const base = applyAnswer(undefined, new Set(), 'x', false, MID, day(0));
  const a = applyAnswer(base, new Set(), 'x', true, MID, day(1));
  const b = applyEncounter(base, new Set(), 'x', MID, day(1));
  const m = mergeProgress(a, b);
  assert.equal(m.wrongPending, false);
  assert.equal(m.points, 2);
});

test('Thứ tự thẻ: review → lâu chưa gặp → new → learning → known', () => {
  const words = ['k', 'l', 'n', 'r', 'f'].map((id) => ({ id }));
  const map = {
    k: { ...emptyProgress(), points: 4, lastSeenAt: day(10) },
    l: { ...emptyProgress(), points: 2, lastSeenAt: day(10) },
    r: { ...emptyProgress(), wrongPending: true, lastWrongAt: day(10) },
    f: { ...emptyProgress(), points: 4, lastSeenAt: day(0) },
  };
  const ids = orderCards(words, map, MID, Date.parse(day(15))).map((w) => w.id);
  assert.deepEqual(ids, ['r', 'f', 'n', 'l', 'k']);
});

test('Bổ sung: normalizeWordId & mergeProgressMap hoạt động chuẩn cho bộ từ không có id', () => {
  assert.equal(normalizeWordId('  How are you? '), 'how are you?');
  assert.equal(WORD_STATUS_UI.review.color, '#EF9F27');
  const words = [{ word: 'Apple' }, { word: 'Banana' }];
  const local = { apple: { ...emptyProgress(), points: 4, lastSeenAt: day(0) } };
  const remote = { banana: { ...emptyProgress(), wrongPending: true, lastWrongAt: day(1) } };
  const merged = mergeProgressMap(local, remote);
  const ordered = orderCards(words, merged, MID, Date.parse(day(1))).map((w) => w.word);
  assert.deepEqual(ordered, ['Banana', 'Apple']);
});
