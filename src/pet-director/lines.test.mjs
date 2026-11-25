// Kiểm tra kho câu: độ dài, từ cấm, trùng id. Chạy: node --test src/pet-director/lines.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import common from '../data/pet-lines/common.js';
import { BANNED_PHRASES, MAX_SPEECH_CHARS } from './rules.js';

const SAMPLE = { petName: 'Cowdi', word: 'thanks', meaning: 'cảm ơn', lessonTitle: 'Xin chào',
  streak: 5, lessonsToday: 2, score: 9, total: 10, daysAway: 3 };
const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => String(SAMPLE[k] ?? `{${k}}`));
const ALL = [...common]; // thêm cowdi.js và các pet khác vào đây khi có

test('mọi câu ≤ 60 ký tự sau khi điền biến mẫu', () => {
  for (const l of ALL) assert.ok([...fill(l.vi)].length <= MAX_SPEECH_CHARS, `${l.id}: quá dài`);
});

test('không câu nào chứa từ cấm', () => {
  for (const l of ALL) for (const b of BANNED_PHRASES)
    assert.ok(!fill(l.vi).toLowerCase().includes(b), `${l.id}: chứa "${b}"`);
});

test('id không trùng', () => {
  const seen = new Set();
  for (const l of ALL) { assert.ok(!seen.has(l.id), `trùng ${l.id}`); seen.add(l.id); }
});

test('biến dùng trong câu đều được khai báo trong when.needs (trừ petName)', () => {
  for (const l of ALL) {
    const vars = [...l.vi.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((v) => v !== 'petName');
    const needs = l.when?.needs || [];
    for (const v of vars) assert.ok(needs.includes(v),
      `${l.id}: dùng {${v}} nhưng thiếu trong when.needs`);
  }
});
