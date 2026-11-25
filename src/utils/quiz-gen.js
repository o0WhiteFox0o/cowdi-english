// ════════════════════════════════════════════════════════════════
// QUIZ & CHECKPOINT GENERATOR (dùng chung cho LessonDetailPage, LearningPathPage, PlacementTest)
// — U2: bài contentVersion === 2 ưu tiên 100% câu soạn tay trong lesson.quiz
// — H5: kiểm tra unit chỉ lấy câu từ các bài thuộc chính unit đó (bỏ QUIZ_BANK khớp chuỗi)
// — Cấp 1 (picture): sinh tự động 3 dạng câu hỏi từ words[] & pattern
// ════════════════════════════════════════════════════════════════

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sinh câu tự động từ vocabulary và grammar của một bài học. */
export function generateAutoQuestions(lesson) {
  const vocab = lesson?.vocabulary || [];
  const questions = [];

  // Type 1: Word → Meaning
  for (const v of vocab) {
    const distractors = shuffleArray(vocab.filter((w) => w.word !== v.word && w.meaning !== v.meaning))
      .slice(0, 3)
      .map((w) => w.meaning);
    if (distractors.length < 3) continue;
    const options = shuffleArray([v.meaning, ...distractors]);
    questions.push({
      question: `"${v.word}" nghĩa là:`,
      options,
      correct: options.indexOf(v.meaning),
      _type: 'word2meaning',
    });
  }

  // Type 2: Meaning → Word
  for (const v of vocab) {
    const distractors = shuffleArray(vocab.filter((w) => w.word !== v.word))
      .slice(0, 3)
      .map((w) => w.word);
    if (distractors.length < 3) continue;
    const options = shuffleArray([v.word, ...distractors]);
    questions.push({
      question: `Từ nào có nghĩa "${v.meaning}"?`,
      options,
      correct: options.indexOf(v.word),
      _type: 'meaning2word',
    });
  }

  // Type 3: Grammar fill-in-blank
  if (lesson?.grammar) {
    for (const g of lesson.grammar) {
      for (const ex of g.examples || []) {
        const words = String(ex.en || '').split(/\s+/);
        if (words.length >= 4) {
          const candidates = words
            .map((w, i) => ({ w: w.replace(/[.,!?;:'"]/g, ''), i }))
            .filter((c) => c.i > 0 && c.i < words.length - 1 && c.w.length >= 3);
          if (candidates.length > 0) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            const blank = words.map((w, i) => (i === pick.i ? '___' : w)).join(' ');
            const otherWords = shuffleArray(
              words.filter((_, i) => i !== pick.i && _.replace(/[.,!?;:'"]/g, '').length >= 3)
            ).slice(0, 2);
            const vocabDistractor = vocab.length > 0
              ? vocab[Math.floor(Math.random() * vocab.length)].word.toLowerCase()
              : 'something';
            const distractors = [...new Set([...otherWords.map((w) => w.replace(/[.,!?;:'"]/g, '')), vocabDistractor])]
              .filter((d) => d.toLowerCase() !== pick.w.toLowerCase())
              .slice(0, 3);
            if (distractors.length >= 3) {
              const options = shuffleArray([pick.w, ...distractors.slice(0, 3)]);
              questions.push({
                question: `Điền vào chỗ trống: "${blank}"`,
                options,
                correct: options.indexOf(pick.w),
                _type: 'grammar',
              });
            }
          }
        }
      }
    }
  }

  return questions;
}

/**
 * Sinh đề quiz cho một bài học.
 * — U2: nếu bài là contentVersion === 2, dùng TOÀN BỘ lesson.quiz (xáo), chỉ bù câu tự sinh nếu < 10.
 * — Bài cũ: trộn câu tự sinh + tối đa 3 câu gốc, lấy 10 câu.
 */
export function generateQuizFromLesson(lesson) {
  const original = (lesson?.quiz || []).map((q) => ({ ...q, _type: 'original' }));

  if (lesson?.contentVersion === 2 && original.length > 0) {
    const picked = shuffleArray(original);
    if (picked.length < 10) {
      const seen = new Set(picked.map((q) => q.question));
      for (const q of shuffleArray(generateAutoQuestions(lesson))) {
        if (picked.length >= 10) break;
        if (!seen.has(q.question)) {
          seen.add(q.question);
          picked.push(q);
        }
      }
    }
    return shuffleArray(picked);
  }

  const questions = [...generateAutoQuestions(lesson), ...original];

  const byType = {};
  for (const q of shuffleArray(questions)) {
    const t = q._type;
    if (!byType[t]) byType[t] = [];
    byType[t].push(q);
  }

  const selected = [];
  const maxPerType = { word2meaning: 4, meaning2word: 3, grammar: 2, original: 3 };
  for (const [type, qs] of Object.entries(byType)) {
    const limit = maxPerType[type] || 3;
    selected.push(...qs.slice(0, limit));
  }

  const selectedSet = new Set(selected);
  for (const q of shuffleArray(questions)) {
    if (selected.length >= 10) break;
    if (!selectedSet.has(q)) {
      selected.push(q);
      selectedSet.add(q);
    }
  }

  return shuffleArray(selected).slice(0, Math.max(10, (lesson?.quiz || []).length));
}

export const CATEGORY_PROMPTS = {
  color: 'Màu này là gì?',
  shape: 'Hình dạng này là gì?',
  animal: 'Đây là con gì?',
  number: 'Đây là số mấy?',
  person: 'Đây là ai?',
  adjective: 'Hình này chỉ đặc điểm nào?',
  food: 'Đây là món gì?',
  job: 'Đây là nghề gì?',
  body: 'Đây là bộ phận nào?',
  place: 'Đây là nơi nào?',
  object: 'Đây là đồ vật gì?',
};

export const NON_DRAWABLE_CATEGORIES = new Set(['greeting']);

function promptForCategory(category) {
  return CATEGORY_PROMPTS[category] || 'Đây là gì?';
}

function balanceCorrectPositions(questions) {
  // Tránh ≥3 câu liên tiếp cùng chỉ số correct bằng cách đảo vị trí option nếu cần
  let streak = 1;
  for (let i = 1; i < questions.length; i++) {
    const prev = questions[i - 1];
    const cur = questions[i];
    if (cur.correct === prev.correct) {
      streak++;
      if (streak >= 3 && Array.isArray(cur.options) && cur.options.length > 1) {
        const swapIdx = (cur.correct + 1) % cur.options.length;
        const nextOpts = [...cur.options];
        [nextOpts[cur.correct], nextOpts[swapIdx]] = [nextOpts[swapIdx], nextOpts[cur.correct]];
        cur.options = nextOpts;
        if (Array.isArray(cur.choiceWords) && cur.choiceWords.length === nextOpts.length) {
          const nextCW = [...cur.choiceWords];
          [nextCW[cur.correct], nextCW[swapIdx]] = [nextCW[swapIdx], nextCW[cur.correct]];
          cur.choiceWords = nextCW;
        }
        cur.correct = swapIdx;
        streak = 1;
      }
    } else {
      streak = 1;
    }
  }
  return questions;
}

/**
 * Sinh câu hỏi thử thách / kiểm tra cho bài cấp 1 (`format: 'picture'`).
 * 3 dạng: listen-pick-image, image-pick-word, pattern-fill.
 * Tuân thủ STD-QUESTION-QUALITY v1.0:
 * - Đáp án nhiễu lấy cùng `category` (không trộn khác nhóm).
 * - Nhóm `greeting` không sinh dạng `image-pick-word` (dùng `listen-pick-image`).
 * - Không chèn emoji vào lời dẫn `question` (tránh lặp emoji).
 * - Hỗ trợ `opts.allowListening` và `opts.validator` (thử tối đa 3 lần).
 */
export function generatePictureChallenge(words = [], pattern = null, count = 6, opts = {}) {
  if (!Array.isArray(words) || words.length < 2) return [];
  const { allowListening = true, validator = null } = opts;

  const hasPattern = Boolean(pattern?.en?.includes('___'));
  const baseTypes = [];
  if (allowListening) baseTypes.push('listen-pick-image');
  baseTypes.push('image-pick-word');
  if (hasPattern) baseTypes.push('pattern-fill');

  const hasAnyCategory = words.some((w) => Boolean(w.category));
  const eligible = words.filter((target) => {
    const samePool = hasAnyCategory && target.category
      ? words.filter((w) => w.word !== target.word && w.category === target.category)
      : words.filter((w) => w.word !== target.word);
    // Cần tối thiểu 2 đáp án nhiễu cùng nhóm (tổng 3 lựa chọn); trừ trường hợp mảng gốc chỉ có 2 từ
    const minDistractors = words.length >= 3 ? 2 : 1;
    if (samePool.length < minDistractors) return false;
    // Nếu không có TTS và từ thuộc nhóm không vẽ được (greeting) và không có mẫu câu → bỏ
    if (!allowListening && !hasPattern && NON_DRAWABLE_CATEGORIES.has(target.category)) return false;
    return true;
  });

  if (eligible.length === 0) return [];

  const pool = shuffleArray(eligible);
  const questions = [];
  let cursor = 0;
  let guard = 0;
  const maxAttempts = Math.max(count * 6, 24);

  while (questions.length < count && guard < maxAttempts) {
    guard++;
    const target = pool[cursor % pool.length];
    cursor++;

    let kind = baseTypes[questions.length % baseTypes.length];
    if (kind === 'image-pick-word' && NON_DRAWABLE_CATEGORIES.has(target.category)) {
      kind = allowListening ? 'listen-pick-image' : (hasPattern ? 'pattern-fill' : null);
      if (!kind) continue;
    }

    const sameCategoryPool = hasAnyCategory && target.category
      ? words.filter((w) => w.word !== target.word && w.category === target.category)
      : words.filter((w) => w.word !== target.word);

    const distractorCount = sameCategoryPool.length >= 3 ? 3 : sameCategoryPool.length;
    if (words.length >= 3 && distractorCount < 2) continue;

    let built = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const distractors = shuffleArray(sameCategoryPool).slice(0, distractorCount);
      const choiceWords = shuffleArray([target, ...distractors]);
      let candidate;

      if (kind === 'listen-pick-image') {
        candidate = {
          kind,
          type: 'listen-pick-image',
          answerCategory: target.category || undefined,
          question: 'Nghe và chọn hình đúng',
          speak: target.word,
          audioText: target.word,
          audio: target.audio || null,
          promptWord: target,
          choiceWords,
          options: choiceWords.map((w) => (w.swatch ? w.meaning : `${w.emoji || '🖼️'} ${w.meaning}`)),
          correct: choiceWords.findIndex((w) => w.word === target.word),
          explanation: `"${target.word}" nghĩa là ${target.meaning}.`,
        };
      } else if (kind === 'image-pick-word') {
        candidate = {
          kind,
          type: 'image-pick-word',
          answerCategory: target.category || undefined,
          question: promptForCategory(target.category),
          promptWord: target,
          choiceWords,
          options: choiceWords.map((w) => w.word),
          correct: choiceWords.findIndex((w) => w.word === target.word),
          explanation: `Đáp án đúng là "${target.word}" (${target.meaning}).`,
        };
      } else {
        const sentence = pattern.en.replace('___', '______');
        candidate = {
          kind: 'pattern-fill',
          type: 'fill-blank',
          answerCategory: target.category || undefined,
          question: `Chọn từ điền vào câu (${target.meaning}): "${sentence}"`,
          speak: pattern.en.replace('___', target.word),
          promptWord: target,
          choiceWords,
          options: choiceWords.map((w) => w.word),
          correct: choiceWords.findIndex((w) => w.word === target.word),
          explanation: `${pattern.en.replace('___', target.word)} — ${pattern.vi.replace('___', target.meaning)}.`,
        };
      }

      if (typeof validator === 'function') {
        const check = validator(candidate);
        if (check?.errors?.length) continue;
      }
      built = candidate;
      break;
    }

    if (built) questions.push(built);
  }

  return balanceCorrectPositions(shuffleArray(questions));
}

/**
 * Xây đề kiểm tra cuối unit (sửa H5 — SDD-LEARNING-GROUPS §5.4).
 * Chỉ lấy câu từ các bài thuộc chính unit đó (KHÔNG dùng QUIZ_BANK khớp chuỗi).
 * Rải đều: mỗi bài trong unit có ít nhất 1 câu nếu đủ.
 */
export function buildCheckpointQuestions(unit, count, allLessons = [], groupId = 'intermediate') {
  const unitLessons = (unit?.lessons || [])
    .map((lid) => allLessons.find((l) => l.id === lid))
    .filter(Boolean);

  if (unitLessons.length === 0) return [];

  // Nhóm Mới học (Starter): sinh câu hỏi hình/âm thanh từ toàn bộ words của unit (gắn category từng bài)
  if (groupId === 'beginner' || unitLessons.every((l) => l.format === 'picture')) {
    const allWords = [];
    const seenW = new Set();
    for (const l of unitLessons) {
      for (const w of l.words || []) {
        const key = String(w.word || '').toLowerCase();
        if (!seenW.has(key)) {
          seenW.add(key);
          allWords.push({ ...w, category: w.category || l.category });
        }
      }
    }
    return generatePictureChallenge(allWords, null, count);
  }

  // Nhóm Trung bình & Luyện thi:
  // 1) Chuẩn bị bể câu cho từng bài (ưu tiên câu quiz gốc; câu tự sinh bỏ _type === 'grammar' — Q2.6)
  const perLessonPools = unitLessons.map((lesson) => {
    const orig = shuffleArray((lesson.quiz || []).map((q) => ({ ...q, _lessonId: lesson.id })));
    const auto = shuffleArray(
      generateAutoQuestions(lesson)
        .filter((q) => q._type !== 'grammar')
        .map((q) => ({ ...q, _lessonId: lesson.id }))
    );
    return { lessonId: lesson.id, orig, auto };
  });

  const picked = [];
  const seen = new Set();
  const tryPush = (q) => {
    if (!q || !q.question || seen.has(q.question)) return false;
    seen.add(q.question);
    picked.push(q);
    return true;
  };

  // Vòng 1: lấy ít nhất 1 câu từ mỗi bài trong unit (ưu tiên câu gốc)
  for (const p of perLessonPools) {
    if (picked.length >= count) break;
    let added = false;
    while (p.orig.length && !added) added = tryPush(p.orig.shift());
    while (p.auto.length && !added) added = tryPush(p.auto.shift());
  }

  // Vòng 2: lấy tiếp các câu quiz gốc còn lại của unit
  const remainingOrig = shuffleArray(perLessonPools.flatMap((p) => p.orig));
  for (const q of remainingOrig) {
    if (picked.length >= count) break;
    tryPush(q);
  }

  // Vòng 3: nếu vẫn thiếu count, bù bằng câu tự sinh từ từ vựng/ngữ pháp của chính unit
  if (picked.length < count) {
    const remainingAuto = shuffleArray(perLessonPools.flatMap((p) => p.auto));
    for (const q of remainingAuto) {
      if (picked.length >= count) break;
      tryPush(q);
    }
  }

  if (picked.length < 8) {
    console.warn(`[buildCheckpointQuestions] Unit "${unit?.id}" chỉ có ${picked.length} câu (khuyến nghị ≥8).`);
  }

  return shuffleArray(picked).slice(0, Math.min(count, picked.length));
}

/** Đếm số từ trong câu trả lời điền từ (sentence-completion — U8). */
export function countAnswerWords(text) {
  return (String(text || '').trim().match(/[A-Za-z0-9'’-]+/g) || []).length;
}

/** Chuẩn hoá chuỗi so khớp đáp án điền từ (không phân biệt hoa/thường, bỏ thừa dấu/khoảng trắng). */
function normalizeCompletion(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[.,!?;:"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Chấm 1 câu hỏi trong `reading.examQuestions` (hỗ trợ đủ 6 dạng EXAM_Q_TYPES — U8).
 * Trả về { answered, isCorrect, overWordLimit }.
 */
export function gradeExamAnswer(q, rawAnswer) {
  if (rawAnswer === undefined || rawAnswer === null || rawAnswer === '') {
    return { answered: false, isCorrect: false, overWordLimit: false };
  }
  if (q.type === 'sentence-completion') {
    const str = String(rawAnswer).trim();
    if (!str) return { answered: false, isCorrect: false, overWordLimit: false };
    const wc = countAnswerWords(str);
    const overWordLimit = Number.isInteger(q.maxWords) && wc > q.maxWords;
    const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
    const normUser = normalizeCompletion(str);
    const isCorrect = !overWordLimit && accepted.some((a) => normalizeCompletion(a) === normUser);
    return { answered: true, isCorrect, overWordLimit };
  }
  if (q.type === 'mcq' || q.type === 'heading') {
    return { answered: true, isCorrect: Number(rawAnswer) === Number(q.answer), overWordLimit: false };
  }
  // tfng, ynng, matching-info
  return {
    answered: true,
    isCorrect: String(rawAnswer).trim().toUpperCase() === String(q.answer).trim().toUpperCase(),
    overWordLimit: false,
  };
}

