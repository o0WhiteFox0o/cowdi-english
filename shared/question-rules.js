// ════════════════════════════════════════════════════════════════
// QUESTION QUALITY VALIDATOR — Cowdi English
// Chuẩn: docs/05-implementation/content/STD-QUESTION-QUALITY-v1.0.md §5.1
// Pure JS — chạy được cả trong Node lẫn trình duyệt, không phụ thuộc DOM/fs.
// ════════════════════════════════════════════════════════════════

import { getWordCategory } from '../src/data/lexicon/categories.js';
import { areSynonymsOrVariants } from '../src/data/lexicon/synonyms.js';
import { isAmbiguousEmoji, CATEGORY_LOCK_PROMPT_RE } from '../src/data/lexicon/ambiguous-emoji.js';

export const QUESTION_CODES = {
  AUDIO_MISSING: 'Q-L2-AUDIO',
  LISTEN_PROMPT_MISMATCH: 'Q-L2-PROMPT',
  IMAGE_MISSING: 'Q-L2-IMAGE',
  ANSWER_LEAK: 'Q-L3-LEAK',
  EMOJI_IN_PROMPT: 'Q-L3-EMOJI',
  OPTION_COUNT: 'Q-OPT-COUNT',
  OPTION_DUP: 'Q-OPT-DUP',
  OPTION_ALL_OF_ABOVE: 'Q-OPT-ALL',
  CATEGORY_MISMATCH: 'Q-L5-CAT',
  LANG_MIX: 'Q-L5-LANG',
  SYNONYM_DISTRACTOR: 'Q-L1-SYN',
  AMBIGUOUS_EMOJI: 'Q-AMBIG-EMOJI',
  LENGTH_BIAS: 'Q-LEN',
  POSITION_BIAS: 'Q-POS',
  EXPLANATION_WEAK: 'Q-EXPL',
};

// Chỉ khớp câu lệnh bảo người học NGHE — không khớp danh từ ghép như "tai nghe", "người nghe", "bài thi nghe"
const LISTEN_INSTRUCTION_RE = /^(?:hãy\s+|lắng\s+)?nghe\b/i;

// Chỉ khớp lời dẫn hỏi trực tiếp về hình/màu/hình dạng hiện trên màn hình
const IMAGE_PROMPT_RE = /\b(hình này|màu này|hình dạng này|bức tranh này)\b/i;

// "Tất cả đều đúng" / "Cả A và B đều đúng" / "Không có đáp án nào" (STD §3.4.5)
const ALL_OF_ABOVE_RE = /^(tất cả( các đáp án| đều)? đúng|cả [a-d]( và| lẫn) [a-d] đều đúng|không có đáp án nào( đúng)?|all of the above|none of the above)\.?$/i;

// Câu hỏi về viết hoa / chính tả chữ hoa-thường
const CASE_SENSITIVE_PROMPT_RE = /(viết hoa|chữ hoa|chữ thường|capitalize|capital letter)/i;

// Câu hỏi so sánh Anh-Anh / Anh-Mỹ hoặc sắc thái trang trọng
const VARIANT_OR_NUANCE_PROMPT_RE = /(anh[\s-]anh|anh[\s-]mỹ|british|american|trang trọng|thân mật|khác biệt|phân biệt)/i;

// Câu hỏi kiểm tra ngữ âm/ngữ pháp/chính tả (không áp dụng Q-L5-CAT theo nhóm nghĩa từ đơn)
const NON_SEMANTIC_PROMPT_RE = /(phát âm|trọng âm|chính tả|âm\s+\/|vần|viết đúng|số nhiều|quá khứ|thì\s+|giới từ|mạo từ|ngữ pháp|chỗ trống|___)/i;

// Dấu tiếng Việt đặc trưng
const VI_DIACRITIC_RE = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

// Phương án siêu ngôn ngữ tiếng Việt được phép đứng cạnh phương án tiếng Anh
const METALINGUISTIC_VI_RE = /^(không cần|bỏ trống|không dùng|không có|để trống|tất cả|cả hai|không thể|cần thêm|thêm\s+)/i;

function getPrompt(q) {
  return String(q?.promptVi ?? q?.question ?? q?.prompt ?? '').trim();
}

function getAudio(q) {
  return q?.audioText || q?.speak || q?.audioUrl || q?.audio || q?.stimulus?.audioText || q?.stimulus?.audioUrl || null;
}

function getVisual(q) {
  const s = q?.stimulus || {};
  const pw = q?.promptWord || {};
  return {
    image: q?.image || s.image || pw.image || null,
    emoji: q?.emoji || s.emoji || pw.emoji || null,
    swatch: q?.swatch || s.swatch || pw.swatch || null,
  };
}

function normalizeOption(opt, { preserveCase = false } = {}) {
  let s = String(opt ?? '').trim().replace(/\s+/g, ' ');
  // Bỏ dấu câu cuối (., !, ?) nhưng GIỮ dấu nháy đơn ' để phân biệt "Its" ≠ "It's" ≠ "its'"
  s = s.replace(/[.!?]+$/g, '').trim();
  return preserveCase ? s : s.toLowerCase();
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function classifyOptionLang(opt) {
  const s = String(opt || '').trim();
  if (!s) return 'neutral';
  // Số / ký hiệu / thời gian / mã
  if (/^[\d\s.,:%/$€£+\-–—()]+$/.test(s)) return 'neutral';
  if (METALINGUISTIC_VI_RE.test(s)) return 'meta';
  // Dạng song ngữ "word (nghĩa)" hoặc "A = B" hoặc chứa dấu ngoặc giải thích
  if (/[=–—]/.test(s) || /\([^)]+\)/.test(s)) return 'bilingual';
  const hasVi = VI_DIACRITIC_RE.test(s);
  if (hasVi) return 'vi';
  // Kiểm tra chữ cái ASCII
  const asciiWords = s.match(/[A-Za-z]+/g) || [];
  if (asciiWords.length === 0) return 'neutral';
  return 'en';
}

function isPureMeaningPrompt(prompt) {
  return /nghĩa là/i.test(prompt);
}

/**
 * Kiểm tra một câu hỏi đơn lẻ theo 14 mã của STD-QUESTION-QUALITY v1.0.
 * @param {object} q - Câu hỏi (hỗ trợ cả khung cũ `{ question, options, correct }` và khung chuẩn `{ promptVi, stimulus, ... }`)
 * @param {object} [opts]
 * @param {boolean} [opts.strict=false] - true với bài contentVersion === 2 (Q-EXPL thành lỗi)
 * @param {string}  [opts.questionType] - ghi đè type (ví dụ 'heading' cho phép 5 options)
 * @returns {{ errors: Array<{code:string, message:string}>, warnings: Array<{code:string, message:string}> }}
 */
export function validateQuestion(q, opts = {}) {
  const errors = [];
  const warnings = [];
  const { strict = false, questionType = null } = opts;

  const pushErr = (code, message) => errors.push({ code, message });
  const pushWarn = (code, message) => warnings.push({ code, message });

  if (!q || typeof q !== 'object') {
    pushErr(QUESTION_CODES.OPTION_COUNT, 'Câu hỏi rỗng hoặc không phải object');
    return { errors, warnings };
  }

  const prompt = getPrompt(q);
  const type = String(questionType || q.type || q.kind || '').trim();
  const audio = getAudio(q);
  const visual = getVisual(q);
  const options = Array.isArray(q.options) ? q.options : null;
  const correct = q.correct ?? (typeof q.answer === 'number' ? q.answer : undefined);

  // 1. Q-L2-AUDIO & Q-L2-PROMPT
  const isListenType = type.startsWith('listen-');
  const asksListen = LISTEN_INSTRUCTION_RE.test(prompt);
  if ((isListenType || asksListen) && !audio) {
    pushErr(QUESTION_CODES.AUDIO_MISSING, `Câu hỏi yêu cầu nghe ("${prompt.slice(0, 60)}") nhưng thiếu audioText/audioUrl/speak`);
  }
  if (asksListen && type && !isListenType) {
    pushErr(QUESTION_CODES.LISTEN_PROMPT_MISMATCH, `Lời dẫn yêu cầu nghe nhưng type="${type}" không bắt đầu bằng "listen-"`);
  }

  // 2. Q-L2-IMAGE
  const isImageType = type === 'image-pick-word';
  if ((isImageType || IMAGE_PROMPT_RE.test(prompt)) && !visual.image && !visual.emoji && !visual.swatch) {
    pushErr(QUESTION_CODES.IMAGE_MISSING, `Lời dẫn nhắc tới hình/màu ("${prompt.slice(0, 60)}") nhưng thiếu image/emoji/swatch`);
  }

  // 3. Q-L3-EMOJI
  if (visual.emoji && prompt.includes(visual.emoji)) {
    pushErr(QUESTION_CODES.EMOJI_IN_PROMPT, `Lặp emoji ${visual.emoji} của stimulus ngay trong lời dẫn "${prompt}"`);
  }

  // 4. Q-OPT-COUNT
  const maxOpts = (type === 'heading' || type === 'matching-info') ? 5 : 4;
  const minOpts = 3;
  if (!options || options.length < minOpts || options.length > maxOpts) {
    pushErr(
      QUESTION_CODES.OPTION_COUNT,
      `Số lựa chọn phải trong ${minOpts}–${maxOpts}, đang có ${options ? options.length : 0}`
    );
  }
  const hasValidCorrect = options && Number.isInteger(correct) && correct >= 0 && correct < options.length;
  if (!hasValidCorrect) {
    pushErr(QUESTION_CODES.OPTION_COUNT, `Chỉ số correct=${correct} nằm ngoài phạm vi lựa chọn`);
  }

  // 5. Q-OPT-DUP & Q-OPT-ALL
  if (options && options.length > 0) {
    const preserveCase = CASE_SENSITIVE_PROMPT_RE.test(prompt);
    const seen = new Map();
    for (let i = 0; i < options.length; i++) {
      const raw = String(options[i] ?? '').trim();
      const norm = normalizeOption(raw, { preserveCase });
      if (seen.has(norm)) {
        pushErr(QUESTION_CODES.OPTION_DUP, `Trùng lựa chọn "${raw}" (vị trí ${seen.get(norm)} và ${i})`);
      } else {
        seen.set(norm, i);
      }
      if (ALL_OF_ABOVE_RE.test(raw)) {
        pushErr(QUESTION_CODES.OPTION_ALL_OF_ABOVE, `Không dùng phương án "${raw}" (STD §3.4.5)`);
      }
    }
  }

  if (hasValidCorrect) {
    const correctOpt = String(options[correct] ?? '').trim();
    const distractors = options.filter((_, i) => i !== correct).map((o) => String(o ?? '').trim());

    // 6. Q-L3-LEAK (lộ đáp án đúng trong prompt hoặc stimulus.text)
    if (type !== 'word-pick-meaning') {
      // Case A: `"Word" nghĩa là:` có đáp án đúng y hệt `"Word"` (ví dụ "Yoga" -> "Yoga")
      const quotedMeaningMatch = prompt.match(/["“']([^"”']+)["”']\s*(?:\(([^)]+)\)\s*)?nghĩa là/i);
      if (quotedMeaningMatch) {
        const askedTerm = normalizeOption(quotedMeaningMatch[1]);
        const parenHint = quotedMeaningMatch[2] ? normalizeOption(quotedMeaningMatch[2]) : '';
        const normAns = normalizeOption(correctOpt);
        if (askedTerm && normAns && askedTerm === normAns) {
          pushErr(QUESTION_CODES.ANSWER_LEAK, `Lộ đáp án: câu hỏi "${prompt}" có đáp án đúng trùng nguyên từ hỏi "${correctOpt}"`);
        } else if (parenHint && normAns && normAns.length >= 3 && new RegExp(`(^|[^a-zA-ZÀ-ỹ])${escapeRegex(normAns)}([^a-zA-ZÀ-ỹ]|$)`, 'i').test(parenHint)) {
          pushErr(QUESTION_CODES.ANSWER_LEAK, `Lộ đáp án trong gợi ý ngoặc đơn (${quotedMeaningMatch[2]}): đáp án đúng là "${correctOpt}"`);
        }
      } else if (
        type === 'image-pick-word' ||
        type.startsWith('listen-') ||
        type === 'meaning-pick-word'
      ) {
        // Case B: câu hình/nghe/nghĩa->từ nhưng lại ghi thẳng chữ đáp án đúng trong lời dẫn hoặc stimulus.text
        const normAns = normalizeOption(correctOpt);
        const hayText = `${prompt} ${q?.stimulus?.text || ''}`.trim();
        if (normAns.length >= 3 && !isPureMeaningPrompt(prompt)) {
          const leakRe = new RegExp(`(^|[^a-zA-ZÀ-ỹ])${escapeRegex(normAns)}([^a-zA-ZÀ-ỹ]|$)`, 'i');
          // Không báo lỗi nếu đó là listen-pick-image mà options là emoji + meaning (không phải tiếng Anh)
          if (type !== 'listen-pick-image' && leakRe.test(hayText)) {
            pushErr(QUESTION_CODES.ANSWER_LEAK, `Lộ đáp án "${correctOpt}" trong lời dẫn/stimulus "${hayText}"`);
          }
        }
      }
    }

    // 7. Q-L1-SYN (đáp án nhiễu đồng nghĩa hoặc biến thể chính tả Anh-Mỹ)
    if (!VARIANT_OR_NUANCE_PROMPT_RE.test(prompt)) {
      for (const d of distractors) {
        if (areSynonymsOrVariants(correctOpt, d)) {
          pushErr(
            QUESTION_CODES.SYNONYM_DISTRACTOR,
            `Đáp án nhiễu "${d}" đồng nghĩa / biến thể chính tả với đáp án đúng "${correctOpt}"`
          );
        }
      }
    }

    // 8. Q-L5-CAT (đáp án nhiễu khác nhóm nghĩa answerCategory)
    const explicitCat = q.answerCategory || q.promptWord?.category || null;
    if (Array.isArray(q.choiceWords) && q.choiceWords.length === options.length && explicitCat) {
      for (const cw of q.choiceWords) {
        if (cw?.category && cw.category !== explicitCat) {
          pushErr(
            QUESTION_CODES.CATEGORY_MISMATCH,
            `Lựa chọn "${cw.word}" thuộc nhóm "${cw.category}" khác answerCategory="${explicitCat}"`
          );
        }
      }
    } else if (explicitCat) {
      for (const opt of options) {
        const cat = getWordCategory(opt);
        if (cat && cat !== explicitCat) {
          pushErr(
            QUESTION_CODES.CATEGORY_MISMATCH,
            `Lựa chọn "${opt}" thuộc nhóm "${cat}" khác answerCategory="${explicitCat}"`
          );
        }
      }
    } else if (!NON_SEMANTIC_PROMPT_RE.test(prompt)) {
      // Nếu tất cả options là từ đơn tiếng Anh nằm trong từ điển nhóm nghĩa thì kiểm tra đồng nhất nhóm
      const cats = options.map((o) => getWordCategory(o));
      const correctCat = cats[correct];
      if (correctCat && cats.every((c) => Boolean(c))) {
        const mismatched = options.filter((_, idx) => cats[idx] !== correctCat);
        if (mismatched.length > 0) {
          pushErr(
            QUESTION_CODES.CATEGORY_MISMATCH,
            `Đáp án đúng "${correctOpt}" thuộc nhóm "${correctCat}" nhưng nhiễu "${mismatched.join(', ')}" khác nhóm`
          );
        }
      }
    }

    // 9. Q-L5-LANG (lẫn tiếng Anh và tiếng Việt trong cùng danh sách lựa chọn)
    const langs = options.map(classifyOptionLang);
    const hasEn = langs.includes('en');
    const hasVi = langs.includes('vi');
    if (hasEn && hasVi && !langs.includes('bilingual')) {
      // Chặn trường hợp tên riêng ngắn tiếng Anh trong câu tiếng Việt (ví dụ "Tom", "Lan")
      const enOpts = options.filter((_, i) => langs[i] === 'en');
      const allProperNames = enOpts.every((o) => /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(String(o).trim()));
      if (!allProperNames) {
        pushErr(
          QUESTION_CODES.LANG_MIX,
          `Lựa chọn lẫn tiếng Anh và tiếng Việt: [${options.join(' | ')}]`
        );
      }
    }

    // 10. Q-AMBIG-EMOJI (cảnh báo)
    if (visual.emoji && !visual.image && !visual.swatch && isAmbiguousEmoji(visual.emoji)) {
      if (!CATEGORY_LOCK_PROMPT_RE.test(prompt)) {
        pushWarn(
          QUESTION_CODES.AMBIGUOUS_EMOJI,
          `Emoji "${visual.emoji}" dễ hiểu nhầm nhưng lời dẫn "${prompt}" chưa khoá loại đáp án`
        );
      }
    }

    // 11. Q-LEN (cảnh báo: đáp án đúng dài nhất và dài hơn trung bình nhiễu > 50%, lệch ≥ 12 ký tự)
    if (distractors.length >= 2) {
      const correctLen = correctOpt.length;
      const distLens = distractors.map((d) => d.length);
      const maxDistLen = Math.max(...distLens);
      const avgDistLen = distLens.reduce((a, b) => a + b, 0) / distLens.length;
      if (correctLen > maxDistLen && avgDistLen > 0 && correctLen > avgDistLen * 1.5 && correctLen - avgDistLen >= 12) {
        pushWarn(
          QUESTION_CODES.LENGTH_BIAS,
          `Đáp án đúng dài ${correctLen} ký tự (>1.5× trung bình nhiễu ${avgDistLen.toFixed(1)} ký tự)`
        );
      }
    }

    // 12. Q-EXPL (thiếu explanation hoặc chỉ lặp đáp án)
    const expl = String(q.explanation || '').trim();
    const pushExpl = strict ? pushErr : pushWarn;
    if (!expl) {
      pushExpl(QUESTION_CODES.EXPLANATION_WEAK, 'Thiếu explanation');
    } else {
      const normExpl = normalizeOption(expl);
      const normAns = normalizeOption(correctOpt);
      const explWords = expl.split(/\s+/).filter(Boolean).length;
      if (normExpl === normAns || explWords < 3) {
        pushExpl(QUESTION_CODES.EXPLANATION_WEAK, `Explanation quá ngắn hoặc chỉ lặp đáp án ("${expl}")`);
      }
    }
  }

  return { errors, warnings };
}

/**
 * Kiểm tra toàn bộ một bộ câu hỏi (từng câu + Q-POS phân bố vị trí đáp án đúng).
 */
export function validateQuestionSet(questions = [], opts = {}) {
  const errors = [];
  const warnings = [];
  const byQuestion = [];

  for (let i = 0; i < questions.length; i++) {
    const res = validateQuestion(questions[i], opts);
    byQuestion.push(res);
    for (const e of res.errors) errors.push({ index: i, ...e });
    for (const w of res.warnings) warnings.push({ index: i, ...w });
  }

  // Q-POS: kiểm tra phân bố vị trí đáp án đúng và chuỗi ≥3 câu liên tiếp
  const validCorrects = questions
    .map((q) => q?.correct ?? (typeof q?.answer === 'number' ? q.answer : null))
    .filter((c) => Number.isInteger(c) && c >= 0);

  if (validCorrects.length >= 3) {
    // 1) Kiểm tra ≥3 câu liên tiếp cùng vị trí
    let streak = 1;
    let maxStreak = 1;
    let streakVal = validCorrects[0];
    for (let i = 1; i < validCorrects.length; i++) {
      if (validCorrects[i] === validCorrects[i - 1]) {
        streak++;
        if (streak > maxStreak) {
          maxStreak = streak;
          streakVal = validCorrects[i];
        }
      } else {
        streak = 1;
      }
    }
    if (maxStreak >= 3) {
      warnings.push({
        index: -1,
        code: QUESTION_CODES.POSITION_BIAS,
        message: `Có ${maxStreak} câu liên tiếp cùng vị trí đáp án đúng (${String.fromCharCode(65 + streakVal)})`,
      });
    }

    // 2) Kiểm tra tỷ lệ một vị trí > 35% (áp dụng với bộ ≥ 8 câu để tránh nhiễu ở bộ nhỏ 4-6 câu)
    if (validCorrects.length >= 8) {
      const counts = new Map();
      for (const c of validCorrects) counts.set(c, (counts.get(c) || 0) + 1);
      for (const [pos, cnt] of counts.entries()) {
        const pct = cnt / validCorrects.length;
        if (pct > 0.35) {
          warnings.push({
            index: -1,
            code: QUESTION_CODES.POSITION_BIAS,
            message: `Vị trí ${String.fromCharCode(65 + pos)} chiếm ${cnt}/${validCorrects.length} (${Math.round(pct * 100)}%, >35%)`,
          });
        }
      }
    }
  }

  return { errors, warnings, byQuestion };
}

/**
 * Kiểm tra danh sách words[] của bài Starter (phát hiện cặp từ đồng nghĩa như hello/hi).
 */
export function validateStarterWords(words = []) {
  const errors = [];
  const warnings = [];
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const a = words[i]?.word;
      const b = words[j]?.word;
      if (areSynonymsOrVariants(a, b)) {
        errors.push({
          code: QUESTION_CODES.SYNONYM_DISTRACTOR,
          message: `Bài Starter có cặp từ đồng nghĩa "${a}" và "${b}" trong cùng danh sách words[]`,
        });
      }
    }
  }
  return { errors, warnings };
}
