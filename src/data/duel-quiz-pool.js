// ============================================================
//  Duel Quiz Pool — Tổng hợp toàn bộ câu hỏi thách đấu
//  Nguồn: QUIZ_BANK (vocab/grammar/sentences/listening)
//         + lesson quizzes + VOCAB_TOPICS (auto-generate)
//  ~1100+ câu, mix beginner / intermediate / advanced
// ============================================================

import { QUIZ_BANK, LESSONS } from './lessons.js';
import { VOCAB_TOPICS } from './vocab-topics.js';

// ── Lazy-cached pool ─────────────────────────────────────────
let _cachedPool = null;

/**
 * Tự động tạo câu hỏi từ VOCAB_TOPICS.
 * Mỗi từ → 1 câu "'{word}' nghĩa là:" với 3 đáp án sai
 * lấy từ các từ trong cùng sub-topic / topic.
 */
function buildVocabTopicsQuestions() {
  // Flatten tất cả từ và ghi nhớ vị trí topic/subtopic
  const allWords = [];
  for (const topic of VOCAB_TOPICS) {
    for (const sub of topic.subtopics || []) {
      for (const w of sub.words || []) {
        if (w.word && w.meaning) {
          allWords.push({
            word: w.word,
            meaning: w.meaning,
            topicId: topic.id,
            subtopicId: sub.id,
          });
        }
      }
    }
  }

  const questions = [];

  for (let i = 0; i < allWords.length; i++) {
    const current = allWords[i];

    // Ưu tiên lấy đáp án sai cùng sub-topic, sau đó cùng topic, rồi global
    const sameSub   = allWords.filter((w, j) => j !== i && w.subtopicId === current.subtopicId);
    const sameTopic = allWords.filter((w, j) => j !== i && w.topicId === current.topicId && w.subtopicId !== current.subtopicId);
    const other     = allWords.filter((w, j) => j !== i && w.topicId !== current.topicId);

    // Chọn distractor theo offset tĩnh (deterministic) để tránh câu hỏi thay đổi
    const pickN = (pool, n, usedMeanings, offset = 0) => {
      const result = [];
      const start = (i * 11 + offset) % Math.max(pool.length, 1);
      for (let k = 0; k < pool.length && result.length < n; k++) {
        const w = pool[(start + k) % pool.length];
        if (!usedMeanings.has(w.meaning)) {
          result.push(w.meaning);
          usedMeanings.add(w.meaning);
        }
      }
      return result;
    };

    const used = new Set([current.meaning]);
    const distractors = [];

    distractors.push(...pickN(sameSub,   2, used, 0));
    if (distractors.length < 3) distractors.push(...pickN(sameTopic, 3 - distractors.length, used, 3));
    if (distractors.length < 3) distractors.push(...pickN(other,     3 - distractors.length, used, 7));

    if (distractors.length < 3) continue; // không đủ đáp án sai → bỏ qua

    // Vị trí đáp án đúng xoay vòng 0-3 theo chỉ số
    const correctIdx = i % 4;
    const options = distractors.slice(0, 3);
    options.splice(correctIdx, 0, current.meaning);

    questions.push({
      question: `"${current.word}" nghĩa là:`,
      options,
      correct: correctIdx,
      category: 'vocabulary',
      level: 'intermediate',
    });
  }

  return questions;
}

/**
 * Xây dựng toàn bộ pool (lazy — chỉ build lần đầu).
 * Trả về mảng các câu hỏi đã được gắn nhãn `level`.
 */
function buildPool() {
  if (_cachedPool) return _cachedPool;

  const pool = [];

  // ── 1. QUIZ_BANK.vocab (base + VOCAB_EXTRA) ──────────────
  for (const q of QUIZ_BANK.vocab || []) {
    if (q.options?.length >= 2) pool.push({ ...q, category: 'vocabulary', level: 'intermediate' });
  }

  // ── 2. QUIZ_BANK.grammar (base + GRAMMAR_EXTRA) ──────────
  for (const q of QUIZ_BANK.grammar || []) {
    if (q.options?.length >= 2) pool.push({ ...q, category: 'grammar', level: 'advanced' });
  }

  // ── 3. QUIZ_BANK.sentences (SENTENCES_EXTRA) ─────────────
  for (const q of QUIZ_BANK.sentences || []) {
    if (q.options?.length >= 2) pool.push({ ...q, category: 'sentences', level: 'advanced' });
  }

  // ── 4. QUIZ_BANK.listening ────────────────────────────────
  for (const q of QUIZ_BANK.listening || []) {
    if (q.options?.length >= 2) pool.push({ ...q, category: 'listening', level: 'intermediate' });
  }

  // ── 5. Quiz từ mỗi lesson (gắn level theo bài) ───────────
  for (const lesson of LESSONS) {
    const lvl = lesson.level === 'advanced'
      ? 'advanced'
      : lesson.level === 'intermediate'
        ? 'intermediate'
        : 'beginner';
    for (const q of (lesson.quiz || [])) {
      if (q.options?.length >= 2) pool.push({ ...q, category: 'vocabulary', level: lvl });
    }
  }

  // ── 6. Tự sinh từ VOCAB_TOPICS (~700 câu mới) ────────────
  const topicQs = buildVocabTopicsQuestions();
  pool.push(...topicQs);

  // ── Loại trùng theo nội dung câu hỏi ─────────────────────
  const seen = new Set();
  const unique = pool.filter(q => {
    if (seen.has(q.question)) return false;
    seen.add(q.question);
    return true;
  });

  _cachedPool = unique;
  return unique;
}

// ── Fisher-Yates shuffle ─────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Sinh ra `count` câu hỏi ngẫu nhiên cho một trận đấu,
 * mix đa trình độ: ~20% beginner · ~50% intermediate · ~30% advanced.
 */
export function generateDuelQuiz(count = 10) {
  const pool = buildPool();

  const byLevel = { beginner: [], intermediate: [], advanced: [] };
  for (const q of pool) {
    const lvl = q.level || 'intermediate';
    (byLevel[lvl] || byLevel.intermediate).push(q);
  }

  const shuffledBeg  = shuffle(byLevel.beginner);
  const shuffledMid  = shuffle(byLevel.intermediate);
  const shuffledAdv  = shuffle(byLevel.advanced);

  const nBeg = Math.max(1, Math.round(count * 0.20));
  const nAdv = Math.max(1, Math.round(count * 0.30));
  const nMid = count - nBeg - nAdv;

  const picks = [
    ...shuffledBeg.slice(0, nBeg),
    ...shuffledMid.slice(0, nMid),
    ...shuffledAdv.slice(0, nAdv),
  ];

  // Bổ sung nếu thiếu (ví dụ một cấp độ không đủ câu)
  if (picks.length < Math.min(count, pool.length)) {
    const used = new Set(picks.map(q => q.question));
    for (const q of shuffle(pool)) {
      if (picks.length >= count) break;
      if (!used.has(q.question)) {
        picks.push(q);
        used.add(q.question);
      }
    }
  }

  // Xáo trộn lần cuối để không nhóm theo cấp độ
  return shuffle(picks.slice(0, Math.min(count, pool.length)));
}
