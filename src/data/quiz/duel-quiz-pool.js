// ============================================================
//  Duel Quiz Pool — Tổng hợp toàn bộ câu hỏi thách đấu
//  Nguồn: QUIZ_BANK (vocab/grammar/sentences/listening)
//         + lesson quizzes + VOCAB_TOPICS (auto-generate)
//  Chuẩn hoá category (vocabulary/grammar/sentences/listening)
//  và đảm bảo mọi câu nghe đều có `speak` hợp lệ.
// ============================================================

import { QUIZ_BANK, LESSONS } from '../lessons.js';
import { VOCAB_TOPICS } from '../vocab-topics.js';

// ── Lazy-cached pool ─────────────────────────────────────────
let _cachedPool = null;

const LISTENING_PROMPT_RE = /(?:^|\s)(?:nghe\s+và|nghe:|nghe\s+đoạn|nghe\s+câu|listen\b)/i;
const GRAMMAR_PROMPT_RE = /(?:chọn\s+câu|câu\s+nào\s+(?:đúng|viết\s+đúng)|nối\s+lý\s+do|chia\s+động\s+từ|ngữ\s+pháp|điền\s+(?:từ|vào)|___|thì\s+(?:hiện\s+tại|quá\s+khứ|tương\s+lai))/i;
const QUOTED_EN_RE = /^["“']([A-Za-z][A-Za-z0-9\s',.!?-]{0,70})["”']\s*(?:nghĩa\s+là|là\s+gì|có\s+nghĩa)/i;

/** Trích xuất văn bản tiếng Anh để đọc TTS từ câu hỏi nếu chưa có `speak`. */
export function resolveQuestionSpeak(q) {
  const direct = String(q?.speak || q?.audioText || '').trim();
  if (direct) return direct;
  const text = String(q?.question || '').trim();
  const m = text.match(QUOTED_EN_RE);
  if (m && m[1]) return m[1].trim();
  return '';
}

/** Xác định đúng nhóm câu hỏi cho Đấu trường từ `q.skill`, `audioText` hoặc ngữ nghĩa câu hỏi. */
export function resolveLessonCategory(q) {
  const skill = String(q?.skill || '').toLowerCase();
  const text = String(q?.question || '').trim();
  if (skill === 'listening' || q?.audioText || LISTENING_PROMPT_RE.test(text)) {
    return 'listening';
  }
  if (skill === 'grammar' || GRAMMAR_PROMPT_RE.test(text)) {
    return 'grammar';
  }
  if (skill === 'usage' || skill === 'strategy') {
    return 'sentences';
  }
  return 'vocabulary';
}

/** Kiểm tra câu hỏi có đủ điều kiện lên Đấu trường hay không. */
export function isPlayableDuelQuestion(q) {
  if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 2) return false;
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) return false;

  // Không cho phép đáp án rỗng hoặc trùng nhau hoàn toàn
  const trimmed = q.options.map((o) => String(o ?? '').trim());
  if (trimmed.some((o) => !o)) return false;
  if (new Set(trimmed).size !== trimmed.length) return false;

  // Câu nghe (hoặc câu có yêu cầu nghe) bắt buộc phải có văn bản TTS (`speak`)
  const text = String(q.question || '');
  if ((q.category === 'listening' || LISTENING_PROMPT_RE.test(text)) && !String(q.speak || '').trim()) {
    return false;
  }

  return true;
}

/**
 * Tự động tạo câu hỏi từ VOCAB_TOPICS.
 * Mỗi từ → 1 câu "'{word}' nghĩa là:" với 3 đáp án sai
 * lấy từ các từ trong cùng sub-topic / topic, kèm `speak: word`.
 */
function buildVocabTopicsQuestions() {
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

    const sameSub   = allWords.filter((w, j) => j !== i && w.subtopicId === current.subtopicId);
    const sameTopic = allWords.filter((w, j) => j !== i && w.topicId === current.topicId && w.subtopicId !== current.subtopicId);
    const other     = allWords.filter((w, j) => j !== i && w.topicId !== current.topicId);

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

    if (distractors.length < 3) continue;

    const correctIdx = i % 4;
    const options = distractors.slice(0, 3);
    options.splice(correctIdx, 0, current.meaning);

    questions.push({
      question: `"${current.word}" nghĩa là:`,
      speak: current.word,
      options,
      correct: correctIdx,
      category: 'vocabulary',
      level: 'intermediate',
      source: `vocab-topic:${current.topicId}`,
    });
  }

  return questions;
}

/**
 * Xây dựng toàn bộ pool (lazy — chỉ build lần đầu).
 * Trả về mảng các câu hỏi đã được chuẩn hoá `category`, `speak`, `level`.
 */
function buildPool() {
  if (_cachedPool) return _cachedPool;

  const pool = [];

  // ── 1. QUIZ_BANK.vocab (base + VOCAB_EXTRA) ──────────────
  for (const q of QUIZ_BANK.vocab || []) {
    const speak = resolveQuestionSpeak(q);
    pool.push({
      ...q,
      ...(speak ? { speak } : {}),
      category: 'vocabulary',
      level: 'intermediate',
      source: 'quiz-bank:vocab',
    });
  }

  // ── 2. QUIZ_BANK.grammar (base + GRAMMAR_EXTRA) ──────────
  for (const q of QUIZ_BANK.grammar || []) {
    const speak = resolveQuestionSpeak(q);
    pool.push({
      ...q,
      ...(speak ? { speak } : {}),
      category: 'grammar',
      level: 'advanced',
      source: 'quiz-bank:grammar',
    });
  }

  // ── 3. QUIZ_BANK.sentences (SENTENCES_EXTRA) ─────────────
  for (const q of QUIZ_BANK.sentences || []) {
    const speak = resolveQuestionSpeak(q);
    pool.push({
      ...q,
      ...(speak ? { speak } : {}),
      category: 'sentences',
      level: 'advanced',
      source: 'quiz-bank:sentences',
    });
  }

  // ── 4. QUIZ_BANK.listening (chỉ giữ câu có `speak` để TTS) ─
  for (const q of QUIZ_BANK.listening || []) {
    const speak = resolveQuestionSpeak(q);
    if (speak) {
      pool.push({
        ...q,
        speak,
        category: 'listening',
        level: 'intermediate',
        source: 'quiz-bank:listening',
      });
    }
  }

  // ── 5. Quiz từ mỗi lesson (map đúng skill/category + audioText → speak) ─
  for (const lesson of LESSONS) {
    const lvl = lesson.level === 'advanced'
      ? 'advanced'
      : lesson.level === 'intermediate'
        ? 'intermediate'
        : 'beginner';
    for (const q of (lesson.quiz || [])) {
      const category = resolveLessonCategory(q);
      const speak = resolveQuestionSpeak(q);
      pool.push({
        ...q,
        ...(speak ? { speak } : {}),
        category,
        level: lvl,
        source: `lesson:${lesson.id}`,
      });
    }
  }

  // ── 6. Tự sinh từ VOCAB_TOPICS ───────────────────────────
  const topicQs = buildVocabTopicsQuestions();
  pool.push(...topicQs);

  // ── Lọc câu không hợp lệ & loại trùng nội dung ───────────
  const seen = new Set();
  const unique = pool.filter((q) => {
    if (!isPlayableDuelQuestion(q)) return false;
    const dedupeKey = `${q.category}::${q.question}::${q.speak || ''}`;
    if (seen.has(dedupeKey)) return false;
    seen.add(dedupeKey);
    return true;
  });

  _cachedPool = unique;
  return unique;
}

/** Trả về toàn bộ pool đã chuẩn hoá (dùng cho Admin kiểm tra & unit test). */
export function getDuelQuizPool() {
  return buildPool();
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
 * @param {number} count - số câu muốn sinh
 * @param {'all'|'vocabulary'|'grammar'|'sentences'|'listening'} category - chủ đề lọc
 */
export function generateDuelQuiz(count = 10, category = 'all') {
  const fullPool = buildPool();
  const filtered = category === 'all'
    ? fullPool
    : fullPool.filter(q => q.category === category);

  // Nếu pool đã lọc không đủ câu, fallback sang 'all'
  const pool = filtered.length >= Math.min(count, 5) ? filtered : fullPool;
  const fallbackUsed = pool !== filtered;

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

  const result = shuffle(picks.slice(0, Math.min(count, pool.length)));
  result._fallbackUsed = fallbackUsed;
  return result;
}
