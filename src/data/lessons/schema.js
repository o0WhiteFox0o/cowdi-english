// ════════════════════════════════════════════════════════════════
// LESSON SCHEMA v2 — Cowdi English
// Chuẩn dữ liệu bài học theo 3 cấp (starter / intermediate / exam).
// Tài liệu: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md
//
// Nguyên tắc: v2 chỉ THÊM trường, không đổi nghĩa trường cũ, để
// LessonDetailPage hiện tại vẫn chạy được (xem toLegacyShape).
// Bài v2 khai báo `contentVersion: 2` và bị kiểm tra nghiêm (lỗi = build hỏng).
// Bài cũ (không có contentVersion) chỉ bị báo cáo, không làm hỏng build.
// File này không import gì, chạy được cả trong trình duyệt lẫn Node.
// ════════════════════════════════════════════════════════════════

export const CONTENT_VERSION = 2;

/** Cấp nội dung của một bài. */
export function levelOf(lesson) {
  if (lesson.format === 'picture' || lesson.track === 'starter') return 'starter';
  if (['ielts', 'toeic', 'b1', 'b2', 'exam'].includes(lesson.track)) return 'exam';
  return 'intermediate';
}

/** Ngưỡng theo cấp. Sửa ở đây thì sửa luôn bảng trong STD-LESSON-CONTENT. */
export const RULES = {
  starter: {
    words: [5, 6],
    patternWords: [2, 6],
  },
  intermediate: {
    vocab: [10, 20],
    grammarPoints: 2,
    examplesPerPoint: 4,
    readingWords: [60, 120],
    readingQuestions: [3, 5],
    readingVocabCoverage: 0.6,
    quiz: 8,
    quizWithExplanation: 1.0,
    listenSentences: 6,
  },
  exam: {
    vocab: [10, 20],
    grammarPoints: 2,
    examplesPerPoint: 4,
    readingWords: [250, 700],
    paragraphs: [4, 7],
    glossary: [10, 20],
    synonymsPerTerm: 2,
    paraphrasePairs: 5,
    examQuestions: 10,
    examQuestionTypes: 2,
    quiz: 8,
    quizWithExplanation: 1.0,
    listenSentences: 6,
  },
};

const EXAM_Q_TYPES = ['tfng', 'ynng', 'mcq', 'heading', 'sentence-completion', 'matching-info'];
const HUMAN_CAST_IDS = ['mai', 'minh', 'lan', 'tom', 'khoa', 'ong_tu'];

const wc = (s) => (String(s || '').trim().match(/[A-Za-z0-9'’-]+/g) || []).length;
const isStr = (s) => typeof s === 'string' && s.trim().length > 0;
const inRange = (n, [a, b]) => n >= a && n <= b;
const has = (text, term) => {
  const esc = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z])${esc}([^a-z]|$)`).test(String(text).toLowerCase());
};
/** Như has() nhưng chấp nhận biến thể từng chữ (-s/-es/-ed/-d/-ing/-ies, be → is/was…), ví dụ "turned out" cho "Turn out". */
const BE = '(?:be|is|are|am|was|were|been|being)';
const wordForm = (w) => {
  if (w === 'be') return BE;
  const e = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!/^[a-z']+$/.test(w)) return e;
  if (/y$/.test(w)) return `${e.slice(0, -1)}(?:y|ies|ied|ying)`;
  if (/e$/.test(w)) return `${e.slice(0, -1)}(?:e|es|ed|ing)`;
  return `${e}(?:s|es|ed|d|ing|${e.slice(-1)}ed|${e.slice(-1)}ing)?`;
};
const hasForm = (text, term) => {
  const parts = term.toLowerCase().trim().split(/\s+/).map(wordForm);
  return new RegExp(`(^|[^a-z])${parts.join('\\s+')}([^a-z]|$)`).test(String(text).toLowerCase());
};
/** Từ vựng dạng cụm có ký hiệu (…, ?, /) thì bỏ qua kiểm tra "ví dụ chứa từ". */
const checkable = (w) => !/[…?\/()!+]|\.\.\./.test(String(w));

function checkMcq(q, where, err) {
  if (!isStr(q.question)) err(`${where}: thiếu question`);
  if (!Array.isArray(q.options) || q.options.length < 2) err(`${where}: cần ≥2 options`);
  else {
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) err(`${where}: correct ngoài phạm vi`);
    if (new Set(q.options.map((o) => String(o).trim())).size !== q.options.length) err(`${where}: options bị trùng`);
  }
}

/**
 * Kiểm tra một bài. Trả về { level, errors[], warnings[] }.
 * strict = true: vi phạm chuẩn là error. strict = false: chỉ lỗi cấu trúc là error, còn lại warning.
 */
export function validateLesson(lesson, { strict = lesson?.contentVersion === CONTENT_VERSION, imageExists = null } = {}) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const std = (m) => (strict ? errors : warnings).push(m);
  const level = levelOf(lesson);

  if (!isStr(lesson.id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(lesson.id)) err('id phải là kebab-case');
  if (!isStr(lesson.title)) err('thiếu title');
  if (!isStr(lesson.icon)) std('thiếu icon');

  // Tuỳ chọn: story { npc, introVi } cho Màn Mở ải (Screen System Đợt 3 §3)
  if (lesson.story !== undefined) {
    if (!lesson.story || typeof lesson.story !== 'object') {
      err('story phải là object { npc, introVi }');
    } else {
      if (!isStr(lesson.story.npc)) err('story.npc không được trống');
      if (!isStr(lesson.story.introVi)) err('story.introVi không được trống');
      else {
        const viWords = lesson.story.introVi.trim().split(/\s+/).filter(Boolean).length;
        if (viWords > 30) std(`story.introVi dài ${viWords} chữ (tối đa 30 chữ)`);
      }
    }
  }

  // ── Starter ────────────────────────────────────────────────
  if (level === 'starter') {
    const R = RULES.starter;
    const words = lesson.words || [];
    if (lesson.format !== 'picture') err('bài starter phải có format: "picture"');
    if (!isStr(lesson.category)) std('bài starter thiếu category (color, shape, animal, number, person, greeting, adjective…)');
    if (!inRange(words.length, R.words)) std(`words: cần ${R.words.join('–')} từ, đang có ${words.length}`);
    const seen = new Set();
    words.forEach((w, i) => {
      const at = `words[${i}]`;
      if (!isStr(w.word)) err(`${at}: thiếu word`);
      if (!isStr(w.meaning)) err(`${at}: thiếu meaning`);
      if (!isStr(w.image) && !isStr(w.emoji)) err(`${at}: cần image hoặc emoji`);
      if (isStr(w.image) && !/^\/image\/words\/[a-z0-9-]+\.webp$/.test(w.image)) std(`${at}: image phải là /image/words/<slug>.webp`);
      if (wc(w.word) > 3) std(`${at}: từ cấp 1 nên ≤3 chữ`);
      if (w.phonetic) std(`${at}: cấp 1 không dùng phiên âm IPA`);
      const k = String(w.word).toLowerCase();
      if (seen.has(k)) err(`${at}: trùng từ "${w.word}"`);
      seen.add(k);
    });
    const p = lesson.pattern;
    if (!p || !isStr(p.en) || !isStr(p.vi)) std('pattern: cần en và vi');
    else {
      if (!p.en.includes('___')) std('pattern.en phải có chỗ trống ___');
      if (!inRange(wc(p.en.replace('___', 'x')), R.patternWords)) std(`pattern.en: ${R.patternWords.join('–')} từ`);
    }
    if (lesson.grammar?.length) std('cấp 1 không có phần ngữ pháp');
    return { level, errors, warnings };
  }

  // ── Intermediate + Exam ────────────────────────────────────
  const R = RULES[level];
  const vocab = lesson.vocabulary || [];
  if (!Array.isArray(lesson.vocabulary)) err('thiếu vocabulary[]');
  if (!Array.isArray(lesson.grammar)) err('thiếu grammar[] (để [] nếu không có)');
  if (!inRange(vocab.length, R.vocab)) std(`vocabulary: cần ${R.vocab.join('–')} từ, đang có ${vocab.length}`);
  const seen = new Set();
  vocab.forEach((v, i) => {
    const at = `vocabulary[${i}] "${v.word}"`;
    if (!isStr(v.word) || !isStr(v.meaning)) err(`${at}: thiếu word/meaning`);
    if (!isStr(v.phonetic)) std(`${at}: thiếu phonetic`);
    if (!isStr(v.example)) std(`${at}: thiếu example`);
    else if (checkable(v.word) && !hasForm(v.example, v.word)) std(`${at}: example không chứa đúng từ`);
    if (!isStr(v.exampleVi)) std(`${at}: thiếu exampleVi (bản dịch câu ví dụ)`);
    if (v.countable !== undefined && typeof v.countable !== 'boolean') err(`${at}: countable phải là boolean`);
    if (v.plural !== undefined && !isStr(v.plural)) err(`${at}: plural phải là chuỗi không rỗng`);
    const k = String(v.word).toLowerCase();
    if (seen.has(k)) err(`${at}: trùng từ`);
    seen.add(k);
  });

  const grammar = lesson.grammar || [];
  if (grammar.length < R.grammarPoints) std(`grammar: cần ≥${R.grammarPoints} điểm, đang có ${grammar.length}`);
  let listenable = 0;
  grammar.forEach((g, i) => {
    const at = `grammar[${i}] "${g.title}"`;
    if (!isStr(g.title) || !isStr(g.explanation)) err(`${at}: thiếu title/explanation`);
    const ex = g.examples || [];
    if (ex.length < R.examplesPerPoint) std(`${at}: cần ≥${R.examplesPerPoint} ví dụ, đang có ${ex.length}`);
    ex.forEach((e, j) => {
      if (!isStr(e.en) || !isStr(e.vi)) err(`${at}.examples[${j}]: thiếu en/vi`);
      if (wc(e.en) >= 2) listenable++;
    });
  });
  if (listenable < R.listenSentences) std(`phần Nghe câu: cần ≥${R.listenSentences} câu ví dụ ngữ pháp (≥2 từ), đang có ${listenable}`);

  // Reading
  const r = lesson.reading;
  const authored = r && isStr(r.passage) && !r.autoGenerated;
  if (!authored) std('reading: chưa có đoạn văn viết tay (đang dùng đoạn ghép tự động)');
  else {
    const n = wc(r.passage);
    if (!inRange(n, R.readingWords)) std(`reading.passage: cần ${R.readingWords.join('–')} từ, đang có ${n}`);
    if (!isStr(r.translation)) std('reading.translation: thiếu bản dịch');
    if (level === 'intermediate') {
      const used = vocab.filter((v) => hasForm(r.passage, String(v.word).split(/[\/(]/)[0].trim())).length;
      if (vocab.length && used / vocab.length < R.readingVocabCoverage) std(`reading: chỉ dùng ${used}/${vocab.length} từ của bài (cần ≥${R.readingVocabCoverage * 100}%)`);
      const qn = (r.questions || []).length;
      if (!inRange(qn, R.readingQuestions)) std(`reading.questions: cần ${R.readingQuestions.join('–')} câu, đang có ${qn}`);
    }
    (r.questions || []).forEach((q, i) => {
      checkMcq(q, `reading.questions[${i}]`, err);
      if (!isStr(q.explanation)) std(`reading.questions[${i}]: thiếu explanation`);
    });
    for (const h of r.highlights || []) {
      if (/\s/.test(h)) std(`reading.highlights "${h}": UI hiện tại chỉ tô được từ đơn`);
    }
  }

  // Exam extras
  if (level === 'exam' && authored) {
    const paras = r.paragraphs || [];
    if (!inRange(paras.length, R.paragraphs)) std(`reading.paragraphs: cần ${R.paragraphs.join('–')} đoạn, đang có ${paras.length}`);
    const labels = paras.map((p) => p.label);
    paras.forEach((p, i) => {
      if (!/^[A-H]$/.test(p.label || '')) err(`reading.paragraphs[${i}]: label phải là A–H`);
      if (!isStr(p.en) || !isStr(p.vi)) err(`reading.paragraphs[${i}]: thiếu en/vi`);
    });
    if (paras.length && r.passage.trim() !== paras.map((p) => p.en).join('\n\n').trim()) err('reading.passage phải bằng paragraphs[].en nối bằng \\n\\n');
    const gl = r.glossary || [];
    if (!inRange(gl.length, R.glossary)) std(`reading.glossary: cần ${R.glossary.join('–')} mục, đang có ${gl.length}`);
    gl.forEach((g, i) => {
      const at = `glossary[${i}] "${g.term}"`;
      if (!isStr(g.term) || !isStr(g.meaningVi)) err(`${at}: thiếu term/meaningVi`);
      if (!labels.includes(g.paragraph)) err(`${at}: paragraph không tồn tại`);
      else if (!has(paras.find((p) => p.label === g.paragraph).en, g.term)) err(`${at}: không có trong đoạn ${g.paragraph}`);
      if ((g.synonyms || []).length < R.synonymsPerTerm && !isStr(g.definitionEn)) std(`${at}: cần ≥${R.synonymsPerTerm} synonyms hoặc definitionEn`);
    });
    const pp = r.paraphrasePairs || [];
    if (pp.length < R.paraphrasePairs) std(`reading.paraphrasePairs: cần ≥${R.paraphrasePairs}, đang có ${pp.length}`);
    pp.forEach((x, i) => {
      if (!labels.includes(x.paragraph)) err(`paraphrasePairs[${i}]: paragraph không tồn tại`);
      else if (!has(paras.find((p) => p.label === x.paragraph).en, x.inPassage)) err(`paraphrasePairs[${i}]: "${x.inPassage}" không có trong đoạn ${x.paragraph}`);
    });
    const eq = r.examQuestions || [];
    if (eq.length < R.examQuestions) std(`reading.examQuestions: cần ≥${R.examQuestions}, đang có ${eq.length}`);
    const types = new Set(eq.map((q) => q.type));
    if (types.size < R.examQuestionTypes) std(`reading.examQuestions: cần ≥${R.examQuestionTypes} dạng câu hỏi`);
    eq.forEach((q, i) => {
      const at = `examQuestions[${i}]`;
      if (!EXAM_Q_TYPES.includes(q.type)) err(`${at}: type không hợp lệ`);
      if (!isStr(q.prompt)) err(`${at}: thiếu prompt`);
      if (q.answer === undefined || q.answer === '') err(`${at}: thiếu answer`);
      if (!isStr(q.explanation)) std(`${at}: thiếu explanation`);
      const ev = q.evidence;
      if (q.answer !== 'NOT GIVEN') {
        if (!ev || !labels.includes(ev.paragraph) || !isStr(ev.quote)) std(`${at}: cần evidence {paragraph, quote}`);
        else if (!paras.find((p) => p.label === ev.paragraph).en.includes(ev.quote)) err(`${at}: evidence.quote không khớp nguyên văn đoạn ${ev.paragraph}`);
      }
      if (q.type === 'mcq' || q.type === 'heading') checkMcq({ question: q.prompt, options: q.options, correct: q.answer }, at, err);
      if (q.type === 'sentence-completion') {
        if (ev?.quote && !has(ev.quote, String(q.answer))) err(`${at}: đáp án không nằm trong evidence.quote`);
        if (!Number.isInteger(q.maxWords)) std(`${at}: thiếu maxWords`);
        else if (wc(q.answer) > q.maxWords) err(`${at}: đáp án dài hơn maxWords`);
        if (!String(q.prompt).includes('______')) std(`${at}: prompt cần chỗ trống ______`);
      }
    });
    if (!Number.isFinite(r.timeLimitMin)) std('reading.timeLimitMin: thiếu thời gian gợi ý');
  }

  // Quiz
  const quiz = lesson.quiz || [];
  if (quiz.length < R.quiz) std(`quiz: cần ≥${R.quiz} câu, đang có ${quiz.length}`);
  quiz.forEach((q, i) => {
    checkMcq(q, `quiz[${i}]`, err);
    if (q.targetWords !== undefined) {
      if (!Array.isArray(q.targetWords) || q.targetWords.some((t) => !isStr(t))) {
        err(`quiz[${i}]: targetWords phải là mảng chuỗi không rỗng`);
      }
    }
  });
  const withEx = quiz.filter((q) => isStr(q.explanation)).length;
  if (quiz.length && withEx / quiz.length < R.quizWithExplanation) std(`quiz: ${quiz.length - withEx} câu thiếu explanation`);

  // ── Tuỳ chọn Đợt 4b: dialogPrompts[] (F-10) & trueFalse[] (F-11) ──────────
  if (lesson.dialogPrompts !== undefined) {
    if (!Array.isArray(lesson.dialogPrompts)) {
      err('dialogPrompts phải là mảng');
    } else {
      lesson.dialogPrompts.forEach((dp, i) => {
        const at = `dialogPrompts[${i}]`;
        if (!dp || typeof dp !== 'object') { err(`${at}: phải là object`); return; }
        if (!isStr(dp.id)) err(`${at}: thiếu id`);
        if (!isStr(dp.npc) || !HUMAN_CAST_IDS.includes(dp.npc)) {
          err(`${at}: npc "${dp.npc || ''}" phải nằm trong HUMAN_CAST (${HUMAN_CAST_IDS.join(', ')})`);
        }
        if (!isStr(dp.askEn) || !isStr(dp.askVi)) err(`${at}: thiếu askEn/askVi`);
        else if (wc(dp.askEn) > 12) err(`${at}: askEn dài ${wc(dp.askEn)} từ (tối đa 12 từ)`);
        if (!isStr(dp.replyEn) || !isStr(dp.replyVi)) err(`${at}: thiếu replyEn/replyVi`);
        else if (wc(dp.replyEn) > 12) err(`${at}: replyEn dài ${wc(dp.replyEn)} từ (tối đa 12 từ)`);

        if (!Array.isArray(dp.answers) || dp.answers.length < 1) {
          err(`${at}: cần ≥1 câu trong answers[]`);
        } else {
          dp.answers.forEach((a, j) => {
            if (!isStr(a?.en) || !isStr(a?.vi)) err(`${at}.answers[${j}]: thiếu en/vi`);
            else if (wc(a.en) > 12) err(`${at}.answers[${j}]: en dài ${wc(a.en)} từ (tối đa 12 từ)`);
          });
        }

        if (!Array.isArray(dp.keywords) || dp.keywords.length < 1) {
          err(`${at}: cần ≥1 từ khoá trong keywords[]`);
        } else {
          const ansList = Array.isArray(dp.answers) ? dp.answers.map((a) => String(a?.en || '')) : [];
          for (const kw of dp.keywords) {
            if (!isStr(kw)) { err(`${at}: keyword không được trống`); continue; }
            const found = ansList.some((ans) => has(ans, kw));
            if (!found) err(`${at}: keyword "${kw}" không xuất hiện trong bất kỳ answers[].en nào`);
          }
        }
      });
    }
  }

  if (lesson.trueFalse !== undefined) {
    if (!Array.isArray(lesson.trueFalse)) {
      err('trueFalse phải là mảng');
    } else {
      let trueCnt = 0;
      let falseCnt = 0;
      lesson.trueFalse.forEach((tf, i) => {
        const at = `trueFalse[${i}]`;
        if (!tf || typeof tf !== 'object') { err(`${at}: phải là object`); return; }
        if (!isStr(tf.en) || !isStr(tf.vi)) err(`${at}: thiếu en/vi`);
        if (typeof tf.isTrue !== 'boolean') err(`${at}: isTrue phải là boolean`);
        else if (tf.isTrue) trueCnt++;
        else {
          falseCnt++;
          if (!isStr(tf.whyVi)) err(`${at}: câu sai (isTrue: false) bắt buộc có whyVi`);
        }
        if (isStr(tf.image)) {
          if (!tf.image.startsWith('/image/')) err(`${at}: image phải bắt đầu bằng /image/`);
          else if (typeof imageExists === 'function' && !imageExists(tf.image)) {
            err(`${at}: ảnh không tồn tại (${tf.image})`);
          }
        } else if (!isStr(tf.illustration) && !isStr(tf.sceneBrief)) {
          err(`${at}: cần image hoặc illustration/sceneBrief`);
        }
      });
      if (lesson.trueFalse.length >= 2 && (trueCnt === 0 || falseCnt === 0)) {
        err('trueFalse: trong bài phải có cả câu đúng (true) và câu sai (false)');
      }
    }
  }

  return { level, errors, warnings };
}

// ── Lớp tương thích với LessonDetailPage hiện tại ─────────────

/** TFNG/heading/mcq → { question, options, correct, explanation } cho ReadingPassage hiện tại. */
export function examQuestionsToMcq(examQuestions = []) {
  const out = [];
  for (const q of examQuestions) {
    if (q.type === 'tfng' || q.type === 'ynng') {
      const options = q.type === 'tfng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
      out.push({ type: q.type, question: q.prompt, options, correct: options.indexOf(q.answer), explanation: q.explanation });
    } else if (q.type === 'mcq' || q.type === 'heading') {
      out.push({ type: q.type, question: q.prompt, options: q.options, correct: q.answer, explanation: q.explanation });
    }
    // sentence-completion / matching-info: cần UI mới, chưa đổi được sang trắc nghiệm.
  }
  return out;
}

/**
 * Đưa bài v2 về hình dạng mà LessonDetailPage hiện tại đọc được.
 * — starter: words → vocabulary, sinh quiz chữ (vì bước Quiz bị ẩn khi quiz rỗng).
 * — exam: thêm reading.questions từ examQuestions nếu chưa có.
 * Bỏ hàm này khi PictureLesson và màn Reading mới đã xong.
 */
export function toLegacyShape(lesson) {
  if (levelOf(lesson) === 'starter') {
    const words = lesson.words || [];
    const fill = (w) => (lesson.pattern?.en || '___').replace('___', w);
    const vocabulary = words.map((w) => ({
      word: w.word, phonetic: '', meaning: w.meaning, example: fill(w.word), exampleVi: (lesson.pattern?.vi || '___').replace('___', w.meaning),
      illustration: w.emoji || '🖼️', image: w.image,
    }));
    const quiz = words.map((w, i) => {
      const others = words.filter((x) => x !== w).slice(i % 2, (i % 2) + 3).map((x) => x.word);
      const options = [w.word, ...others];
      const rot = i % options.length;
      const opts = [...options.slice(rot), ...options.slice(0, rot)];
      return { question: `"${w.meaning}" tiếng Anh là từ nào?`, options: opts, correct: opts.indexOf(w.word), explanation: `"${w.word}" nghĩa là ${w.meaning}.` };
    });
    return { level: 'beginner', ...lesson, vocabulary, grammar: [], quiz };
  }
  const r = lesson.reading;
  if (r?.examQuestions && !(r.questions || []).length) {
    return { ...lesson, reading: { ...r, questions: examQuestionsToMcq(r.examQuestions) } };
  }
  return lesson;
}
