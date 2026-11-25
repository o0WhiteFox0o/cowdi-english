// Kiểm tra kho câu: độ dài, từ cấm, trùng id, biến when.needs, và chỉ tiêu GĐ2 (SDD §5.2–5.3).
// Chạy: node --test src/pet-director/lines.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_PET_LINES, common, cowdi } from '../data/pet-lines/index.js';
import { BANNED_PHRASES, MAX_SPEECH_CHARS } from './rules.js';

const SAMPLE = {
  petName: 'Cowdi', word: 'thanks', meaning: 'cảm ơn', lessonTitle: 'Xin chào',
  streak: 5, lessonsToday: 2, score: 9, total: 10, daysAway: 3,
};
const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => String(SAMPLE[k] ?? `{${k}}`));
const ALL = ALL_PET_LINES;

test('mọi câu ≤ 60 ký tự sau khi điền biến mẫu', () => {
  for (const l of ALL) {
    const filled = fill(l.vi);
    assert.ok([...filled].length <= MAX_SPEECH_CHARS, `${l.id}: quá dài (${[...filled].length}): "${filled}"`);
  }
});

test('không câu nào chứa từ cấm (nguyên tắc P3)', () => {
  for (const l of ALL) {
    for (const b of BANNED_PHRASES) {
      assert.ok(!fill(l.vi).toLowerCase().includes(b), `${l.id}: chứa "${b}"`);
    }
  }
});

test('id không trùng', () => {
  const seen = new Set();
  for (const l of ALL) {
    assert.ok(!seen.has(l.id), `trùng ${l.id}`);
    seen.add(l.id);
  }
});

test('biến dùng trong câu đều được khai báo trong when.needs (trừ petName)', () => {
  for (const l of ALL) {
    const vars = [...l.vi.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((v) => v !== 'petName');
    const needs = l.when?.needs || [];
    for (const v of vars) {
      assert.ok(needs.includes(v), `${l.id}: dùng {${v}} nhưng thiếu trong when.needs`);
    }
  }
});

test('common.js trung tính cho mọi loài pet (không chứa âm thanh riêng "Moo~")', () => {
  for (const l of common) {
    assert.ok(!/moo/i.test(l.vi), `${l.id}: common.js không nên có tiếng bò "Moo"`);
  }
});

test('cowdi.js đạt đủ chỉ tiêu số lượng tối thiểu Giai đoạn 2 (§5.2)', () => {
  const countBy = (ev) => cowdi.filter((l) => l.event === ev).length;
  const mins = {
    answer_correct: 30,
    answer_wrong: 30,
    streak: 15,
    lesson_done: 20,
    app_open: 25,
    mood_nudge: 20,
    page_tip: 8,
    pet_tap: 60,
    skill_level_up: 10,
    evolve_ok: 10,
    feed: 10,
  };
  for (const [ev, min] of Object.entries(mins)) {
    assert.ok(countBy(ev) >= min, `cowdi.js thiếu câu cho "${ev}": ${countBy(ev)} < ${min}`);
  }
  for (const screen of ['lesson', 'path', 'home', 'pet']) {
    const n = cowdi.filter((l) => l.event === 'page_tip' && l.when?.screen?.includes(screen)).length;
    assert.ok(n >= 2, `cowdi.js thiếu page_tip cho màn "${screen}": ${n} < 2`);
  }
});
