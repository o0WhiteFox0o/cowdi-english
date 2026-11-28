// ============================================================
//  Placement Builder — Sinh đề Kiểm tra đầu vào đa dạng 5 dạng bài
//  Tầng A (Starter), Tầng B (int-u1..u4), Tầng C (int-u5..u10)
//  Mỗi tầng 6 câu pha trộn: Nghe, Hình/Từ vựng, Đúng/Sai, Ghép chữ, Xếp câu.
// ============================================================

import { ALL_LESSONS, BEGINNER_UNITS, INTERMEDIATE_UNITS } from '../../data/lessons/index.js';
import { shuffleArray, generatePictureChallenge, generateAutoQuestions } from '../../utils/quiz-gen.js';

const LISTEN_PROMPT_RE = /^(?:hãy\s+|lắng\s+)?nghe\b/i;

export function getQuestionAudio(q) {
  return q?.audioText || q?.speak || null;
}

export function isListeningQuestion(q) {
  if (!q) return false;
  return Boolean(
    q.audioText ||
    q.kind === 'listen-pick-image' ||
    q.format === 'listen-pick' ||
    LISTEN_PROMPT_RE.test(String(q.question || '').trim())
  );
}

function isUsableMcq(q, ttsAvailable) {
  if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 3) return false;
  if (q._type === 'grammar') return false;
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) return false;
  const audio = getQuestionAudio(q);
  const asksToListen = LISTEN_PROMPT_RE.test(String(q.question).trim());
  if (asksToListen && !audio) return false;
  if (!ttsAvailable && isListeningQuestion(q)) return false;
  return true;
}

function stripPunct(s) {
  return String(s || '')
    .trim()
    .replace(/^[“"']+|[”"']+$/g, '')
    .replace(/[.!?]+$/g, '')
    .trim();
}

function normalizeAnswer(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tạo câu Đúng/Sai (giống F-11) từ danh sách từ vựng. */
function buildTrueFalseQuestion(wordsPool, usedWords) {
  const valid = wordsPool.filter(
    (w) => w?.word && w?.meaning && !usedWords.has(w.word.toLowerCase())
  );
  if (valid.length < 2) return null;
  const shuffled = shuffleArray(valid);
  const target = shuffled[0];
  const isTrue = Math.random() < 0.5;
  let shownMeaning = target.meaning;
  if (!isTrue) {
    const distractor = shuffled.find(
      (x) => x.word.toLowerCase() !== target.word.toLowerCase() &&
        x.meaning.trim().toLowerCase() !== target.meaning.trim().toLowerCase()
    );
    if (!distractor) return null;
    shownMeaning = distractor.meaning;
  }
  usedWords.add(target.word.toLowerCase());
  return {
    format: 'true-false',
    skillLabel: '⚡ Đúng hay Sai',
    question: `“${target.word}” có nghĩa là “${shownMeaning}” — Đúng hay Sai?`,
    statementWord: target.word,
    statementMeaning: shownMeaning,
    illustration: target.illustration || target.emoji || null,
    speak: target.word,
    options: ['Đúng', 'Sai'],
    correct: isTrue ? 0 : 1,
  };
}

/** Tạo câu Ghép chữ (giống F-02) cho từ đơn sạch 3–7 chữ cái. */
function buildSpellTilesQuestion(wordsPool, usedWords) {
  const candidates = wordsPool.filter((w) => {
    const clean = String(w?.word || '').trim();
    return (
      /^[a-zA-Z]{3,7}$/.test(clean) &&
      w?.meaning &&
      !usedWords.has(clean.toLowerCase())
    );
  });
  if (candidates.length === 0) return null;
  const target = shuffleArray(candidates)[0];
  const wordUpper = target.word.trim().toUpperCase();
  const letters = wordUpper.split('');
  let scrambled = shuffleArray(letters);
  if (scrambled.join('') === wordUpper && letters.length > 1) {
    scrambled = [...letters.slice(1), letters[0]];
  }
  usedWords.add(target.word.trim().toLowerCase());
  return {
    format: 'spell-tiles',
    skillLabel: '🔤 Ghép chữ',
    question: `Ghép các chữ cái thành từ có nghĩa “${target.meaning}”:`,
    targetWord: wordUpper,
    meaning: target.meaning,
    illustration: target.illustration || target.emoji || null,
    speak: target.word.trim(),
    tiles: scrambled.map((ch, idx) => ({ id: `${idx}-${ch}`, ch })),
  };
}

/** Tạo câu Xếp thứ tự câu (giống F-09 / T-08) từ ví dụ ngắn 3–7 từ. */
function buildSentenceOrderQuestion(lessonsPool, usedSentences) {
  const candidates = [];
  for (const l of lessonsPool) {
    for (const v of l.vocabulary || []) {
      const en = stripPunct(v?.example || '');
      const vi = stripPunct(v?.exampleVi || '');
      if (!en || !vi) continue;
      if (/[—–:]/.test(en)) continue; // bỏ hội thoại 2 vế
      const tokens = en.split(/\s+/).filter(Boolean);
      if (tokens.length < 3 || tokens.length > 6) continue;
      if (usedSentences.has(en.toLowerCase())) continue;
      candidates.push({ en, vi, tokens });
    }
  }
  if (candidates.length === 0) return null;
  const picked = shuffleArray(candidates)[0];
  let scrambled = shuffleArray(picked.tokens);
  if (scrambled.join(' ') === picked.tokens.join(' ') && picked.tokens.length > 1) {
    scrambled = [...picked.tokens.slice(1), picked.tokens[0]];
  }
  usedSentences.add(picked.en.toLowerCase());
  return {
    format: 'sentence-order',
    skillLabel: '🧩 Xếp thứ tự câu',
    question: `Xếp các từ thành câu tiếng Anh đúng với nghĩa: “${picked.vi}”`,
    targetSentence: picked.en,
    meaningVi: picked.vi,
    speak: picked.en,
    tiles: scrambled.map((w, idx) => ({ id: `${idx}-${w}`, text: w })),
  };
}

/** Kiểm tra đáp án cho mọi dạng bài trong PlacementTest. */
export function evaluatePlacementAnswer(q, userAnswer) {
  if (!q) return false;
  if (q.format === 'spell-tiles') {
    return normalizeAnswer(userAnswer) === normalizeAnswer(q.targetWord);
  }
  if (q.format === 'sentence-order') {
    return normalizeAnswer(userAnswer) === normalizeAnswer(q.targetSentence);
  }
  return userAnswer === q.correct;
}

/**
 * Sinh đúng 6 câu đa dạng dạng bài cho từng tầng ('A' | 'B' | 'C').
 */
export function buildPlacementTierQuestions(tierId, { ttsAvailable = true } = {}) {
  const usedWords = new Set();
  const usedSentences = new Set();

  if (tierId === 'A') {
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

    const diverse = [];
    // 1 câu Ghép chữ + 1 câu Đúng/Sai + 4 câu Tranh/Nghe
    const spellQ = buildSpellTilesQuestion(words, usedWords);
    if (spellQ) diverse.push(spellQ);
    const tfQ = buildTrueFalseQuestion(words, usedWords);
    if (tfQ) diverse.push(tfQ);

    const remaining = Math.max(0, 6 - diverse.length);
    const picQs = generatePictureChallenge(words, null, remaining, { allowListening: ttsAvailable }).map((q) => ({
      ...q,
      format: q.kind === 'listen-pick-image' ? 'listen-pick' : 'mcq',
      skillLabel: q.kind === 'listen-pick-image' ? '🎧 Nghe chọn hình' : '📖 Nhìn hình chọn từ',
    }));

    return shuffleArray([...diverse, ...picQs]).slice(0, 6);
  }

  const unitSlice = tierId === 'B'
    ? INTERMEDIATE_UNITS.slice(0, 4)   // int-u1 .. int-u4
    : INTERMEDIATE_UNITS.slice(4, 10); // int-u5 .. int-u10

  const tierLessons = [];
  const tierWords = [];
  const seenWord = new Set();
  const mcqPool = [];

  for (const unit of unitSlice) {
    for (const lid of unit.lessons) {
      const l = ALL_LESSONS.find((x) => x.id === lid);
      if (!l) continue;
      tierLessons.push(l);
      for (const w of l.vocabulary || []) {
        const k = String(w?.word || '').trim().toLowerCase();
        if (k && !seenWord.has(k)) {
          seenWord.add(k);
          tierWords.push(w);
        }
      }
      const rawQs = (l.quiz || []).length > 0 ? l.quiz : generateAutoQuestions(l);
      for (const q of rawQs) {
        if (isUsableMcq(q, ttsAvailable)) {
          const isListen = isListeningQuestion(q);
          mcqPool.push({
            ...q,
            _unitId: unit.id,
            format: isListen ? 'listen-pick' : 'mcq',
            skillLabel: isListen ? '🎧 Nghe hiểu' : '📖 Từ vựng & Ngữ cảnh',
          });
        }
      }
    }
  }

  const result = [];
  // 1. 1 câu Xếp thứ tự câu (F-09)
  const sentQ = buildSentenceOrderQuestion(tierLessons, usedSentences);
  if (sentQ) result.push(sentQ);

  // 2. 1 câu Ghép chữ (F-02)
  const spellQ = buildSpellTilesQuestion(tierWords, usedWords);
  if (spellQ) result.push(spellQ);

  // 3. 1 câu Đúng/Sai nhanh (F-11)
  const tfQ = buildTrueFalseQuestion(tierWords, usedWords);
  if (tfQ) result.push(tfQ);

  // 4. Ưu tiên có ít nhất 1 câu Nghe hiểu (nếu TTS hỗ trợ) + bổ sung Trắc nghiệm rải đều unit cho đủ 6 câu
  const seenPrompt = new Set(result.map((x) => x.question));
  if (ttsAvailable) {
    const listenQ = shuffleArray(mcqPool).find((q) => q.format === 'listen-pick' && !seenPrompt.has(q.question));
    if (listenQ) {
      seenPrompt.add(listenQ.question);
      result.push(listenQ);
    }
  }

  const usedUnits = new Set(result.map((q) => q._unitId).filter(Boolean));
  for (const q of shuffleArray(mcqPool)) {
    if (result.length >= 6) break;
    if (seenPrompt.has(q.question)) continue;
    if (q._unitId && usedUnits.has(q._unitId) && result.length < 5) continue;
    seenPrompt.add(q.question);
    if (q._unitId) usedUnits.add(q._unitId);
    result.push(q);
  }
  // Fallback nếu vẫn < 6
  for (const q of shuffleArray(mcqPool)) {
    if (result.length >= 6) break;
    if (seenPrompt.has(q.question)) continue;
    seenPrompt.add(q.question);
    result.push(q);
  }

  return shuffleArray(result).slice(0, 6);
}
