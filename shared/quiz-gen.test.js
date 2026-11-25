// ════════════════════════════════════════════════════════════════
// Unit tests cho src/utils/quiz-gen.js (Q2 — STD-QUESTION-QUALITY v1.0)
// Chạy 500 lượt trên toàn bộ 12 bài Starter + bể Tầng A + checkpoint.
// ════════════════════════════════════════════════════════════════
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  generatePictureChallenge,
  buildCheckpointQuestions,
  CATEGORY_PROMPTS,
} from '../src/utils/quiz-gen.js';
import { ALL_LESSONS, BEGINNER_UNITS, INTERMEDIATE_UNITS } from '../src/data/lessons/index.js';

const STARTER_LESSONS = ALL_LESSONS.filter((l) => l.track === 'starter' && l.format === 'picture');

function buildTierAPool() {
  const starterUnits = BEGINNER_UNITS.filter((u) => !u.comingSoon && u.lessons.length > 0);
  const words = [];
  const seen = new Set();
  for (const u of starterUnits) {
    for (const lid of u.lessons) {
      const l = ALL_LESSONS.find((x) => x.id === lid);
      for (const w of l?.words || []) {
        const k = w.word.toLowerCase();
        if (!seen.has(k)) {
          seen.add(k);
          words.push({ ...w, category: w.category || l?.category });
        }
      }
    }
  }
  return words;
}

describe('Q2 — generatePictureChallenge & Starter categories', () => {
  it('1. Toàn bộ 12 bài Starter đều có category và các bài màu có swatch + emoji vuông', () => {
    assert.ok(STARTER_LESSONS.length >= 12, `Cần ≥12 bài starter, hiện có ${STARTER_LESSONS.length}`);
    for (const l of STARTER_LESSONS) {
      assert.ok(typeof l.category === 'string' && l.category.length > 0, `Bài ${l.id} thiếu category`);
      if (l.category === 'color') {
        for (const w of l.words) {
          assert.ok(/^#[0-9A-Fa-f]{6}$/.test(w.swatch || ''), `Màu ${w.word} thiếu swatch hex`);
          assert.ok(!['🔴', '🔵', '🟡', '🟢', '🟠', '⚫', '⚪', '🟤', '🟣'].includes(w.emoji), `Màu ${w.word} vẫn dùng hình tròn ${w.emoji}`);
        }
      }
    }
  });

  it('2. Chạy 500 lần trên bể Tầng A: 100% lựa chọn cùng category, không trùng, không lặp emoji, không image-pick-word cho greeting', () => {
    const pool = buildTierAPool();
    assert.ok(pool.length >= 60, `Bể Tầng A cần ≥60 từ, hiện có ${pool.length}`);

    for (let run = 0; run < 500; run++) {
      const qs = generatePictureChallenge(pool, null, 6);
      assert.equal(qs.length, 6, `Lượt ${run}: phải sinh đủ 6 câu`);

      for (const q of qs) {
        assert.ok(q.options.length >= 3 && q.options.length <= 4, `Số options bất thường: ${q.options.length}`);
        assert.ok(q.correct >= 0 && q.correct < q.options.length, 'correct ngoài phạm vi');

        // Không trùng options
        const norm = new Set(q.options.map((o) => String(o).trim().toLowerCase()));
        assert.equal(norm.size, q.options.length, `Trùng option ở câu "${q.question}": ${q.options.join(', ')}`);

        // Toàn bộ choiceWords phải cùng category với promptWord
        const expectedCat = q.promptWord.category;
        assert.ok(expectedCat, `Thiếu category cho ${q.promptWord.word}`);
        for (const cw of q.choiceWords) {
          assert.equal(
            cw.category,
            expectedCat,
            `Lệch category: đáp án "${q.promptWord.word}" (${expectedCat}) nhưng nhiễu "${cw.word}" (${cw.category})`
          );
        }

        // Không lặp emoji trong question
        if (q.promptWord.emoji) {
          assert.ok(
            !q.question.includes(q.promptWord.emoji),
            `Lặp emoji ${q.promptWord.emoji} trong lời dẫn "${q.question}"`
          );
        }

        // Nhóm greeting không được sinh image-pick-word
        if (expectedCat === 'greeting') {
          assert.notEqual(q.kind, 'image-pick-word', 'Không được sinh image-pick-word cho greeting');
        }

        // Lời dẫn theo category cho image-pick-word
        if (q.kind === 'image-pick-word' && CATEGORY_PROMPTS[expectedCat]) {
          assert.equal(q.question, CATEGORY_PROMPTS[expectedCat]);
        }
      }

      // Không có ≥3 câu liên tiếp cùng chỉ số correct
      let streak = 1;
      for (let i = 1; i < qs.length; i++) {
        if (qs[i].correct === qs[i - 1].correct) {
          streak++;
          assert.ok(streak < 3, `Lượt ${run}: có ${streak} câu liên tiếp cùng vị trí correct=${qs[i].correct}`);
        } else {
          streak = 1;
        }
      }
    }
  });

  it('3. Chạy trên từng bài Starter với pattern: không lỗi, không lặp emoji, tôn trọng allowListening=false', () => {
    for (const lesson of STARTER_LESSONS) {
      const words = lesson.words.map((w) => ({ ...w, category: w.category || lesson.category }));
      const qs = generatePictureChallenge(words, lesson.pattern, 6);
      assert.equal(qs.length, 6, `Bài ${lesson.id} phải sinh đủ 6 câu`);
      for (const q of qs) {
        if (q.promptWord.emoji) {
          assert.ok(!q.question.includes(q.promptWord.emoji), `Bài ${lesson.id} lặp emoji trong "${q.question}"`);
        }
      }

      const qsNoTts = generatePictureChallenge(words, lesson.pattern, 6, { allowListening: false });
      assert.equal(qsNoTts.length, 6, `Bài ${lesson.id} (no TTS) phải sinh đủ 6 câu`);
      for (const q of qsNoTts) {
        assert.notEqual(q.kind, 'listen-pick-image', `allowListening=false vẫn sinh listen-pick-image ở ${lesson.id}`);
      }
    }
  });

  it('4. buildCheckpointQuestions không còn đưa câu tự sinh _type="grammar" vào đề kiểm tra unit', () => {
    for (const unit of INTERMEDIATE_UNITS) {
      const qs = buildCheckpointQuestions(unit, 15, ALL_LESSONS, 'intermediate');
      for (const q of qs) {
        assert.notEqual(q._type, 'grammar', `Unit ${unit.id} vẫn lọt câu tự sinh _type="grammar"`);
      }
    }
  });
});
