/**
 * Trích xuất item dùng chung cho canRun() và các component màn T/F.
 * Thuần JS — không import React, dùng được trong Node test & script báo cáo phủ dữ liệu.
 */

import { generateQuizFromLesson } from '../../../utils/quiz-gen.js';
import { getWordId } from '../../vocab/wordProgress.js';

const TEMPLATE_PATTERNS = [
  /^this is (a |an |my |the )?[a-z]+[.!?]?$/i,
  /^that is (a |an |my |the )?[a-z]+[.!?]?$/i,
  /^i see (a |an |the )?[a-z]+[.!?]?$/i,
  /^it is (a |an |the )?[a-z]+[.!?]?$/i,
  /^here is (a |an |the )?[a-z]+[.!?]?$/i,
];

function cleanSentenceWords(en) {
  return String(en || '')
    .replace(/[.!?]+$/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function isTemplateSentence(en) {
  const s = String(en || '').trim();
  return TEMPLATE_PATTERNS.some((re) => re.test(s));
}

function findMatchingWordIds(en, vocabulary = []) {
  const lower = String(en || '').toLowerCase();
  const ids = [];
  for (const v of vocabulary) {
    if (!v?.word) continue;
    const w = String(v.word).toLowerCase().trim();
    if (!w) continue;
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(lower)) {
      ids.push(getWordId(v));
    }
  }
  return [...new Set(ids)];
}

/** Nguồn câu cho T-05 Nghe câu: ví dụ ngữ pháp en↔vi >= 2 từ (khớp LessonDetailPage). */
export function listenItems(lesson) {
  if (!lesson) return [];
  const vocab = lesson.vocabulary || [];
  const pairs = (lesson.grammar || []).flatMap((g) =>
    (g.examples || [])
      .filter((ex) => ex?.en && ex?.vi && cleanSentenceWords(ex.en).length >= 2)
      .map((ex) => ({
        en: ex.en.trim(),
        vi: ex.vi.trim(),
        label: g.title || '',
        wordIds: findMatchingWordIds(ex.en, vocab),
      })),
  );
  const seen = new Set();
  const out = [];
  for (const s of pairs) {
    const key = s.en.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}

/** Nguồn câu cho T-06 Nói theo: vocabulary[].example + ví dụ ngữ pháp (ưu tiên exampleVi). */
export function speakItems(lesson) {
  if (!lesson) return [];
  const vocab = lesson.vocabulary || [];
  const raw = [
    ...vocab.map((v) => ({
      en: v?.example?.trim() || '',
      vi: (v?.exampleVi || v?.meaning || '').trim(),
      label: v?.word || '',
      wordIds: v?.word ? [getWordId(v)] : [],
    })),
    ...(lesson.grammar || []).flatMap((g) =>
      (g.examples || []).map((ex) => ({
        en: ex?.en?.trim() || '',
        vi: ex?.vi?.trim() || '',
        label: g.title || '',
        wordIds: findMatchingWordIds(ex?.en, vocab),
      })),
    ),
  ].filter((s) => s.en && s.vi);

  const seen = new Set();
  const out = [];
  for (const s of raw) {
    const key = s.en.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}

/**
 * Nguồn câu cho T-08 Viết câu (và F-09 Đò chở câu — PHASE1 §8.1):
 * 1) grammar[].examples[] có en 3–8 từ và có vi
 * 2) Thiếu thì thêm vocabulary[].example 3–8 từ có exampleVi (bỏ câu template A5)
 * Ưu tiên câu chứa nhiều từ của bài; không trùng câu.
 */
export function writeItems(lesson, limit = 4) {
  if (!lesson) return [];
  const vocab = lesson.vocabulary || [];
  const seen = new Set();
  const grammarCandidates = [];
  const vocabCandidates = [];

  for (const g of lesson.grammar || []) {
    for (const ex of g.examples || []) {
      if (!ex?.en || !ex?.vi) continue;
      const en = ex.en.trim();
      const words = cleanSentenceWords(en);
      if (words.length < 3 || words.length > 8) continue;
      const key = en.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const wordIds = findMatchingWordIds(en, vocab);
      grammarCandidates.push({
        en,
        vi: ex.vi.trim(),
        words,
        label: g.title || '',
        wordIds,
        source: 'grammar',
        vocabHits: wordIds.length,
      });
    }
  }

  for (const v of vocab) {
    if (!v?.example || !v?.exampleVi) continue;
    const en = v.example.trim();
    const words = cleanSentenceWords(en);
    if (words.length < 3 || words.length > 8) continue;
    if (isTemplateSentence(en)) continue;
    const key = en.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const wordIds = findMatchingWordIds(en, vocab);
    if (wordIds.length === 0 && v.word) wordIds.push(getWordId(v));
    vocabCandidates.push({
      en,
      vi: v.exampleVi.trim(),
      words,
      label: v.word || '',
      wordIds,
      source: 'vocab',
      vocabHits: wordIds.length,
    });
  }

  // Ưu tiên grammar trước (đã sắp theo số từ bài khớp giảm dần), thiếu mới bổ sung vocab
  grammarCandidates.sort((a, b) => b.vocabHits - a.vocabHits);
  vocabCandidates.sort((a, b) => b.vocabHits - a.vocabHits);

  const combined = [...grammarCandidates, ...vocabCandidates];
  return limit > 0 ? combined.slice(0, limit) : combined;
}

/** Nguồn câu hỏi Boss (T-07 / F-06): dùng generateQuizFromLesson có sẵn. */
export function bossItems(lesson) {
  if (!lesson) return [];
  try {
    const qs = generateQuizFromLesson(lesson);
    if (Array.isArray(qs) && qs.length > 0) return qs;
  } catch { /* fallback */ }
  return Array.isArray(lesson.quiz) ? lesson.quiz : [];
}

/** Lấy mẹo ngữ pháp 1 câu cho pet ở T-08 (thay T-03, PHASE1 §7). */
export function pickGrammarTip(lesson, idx = 0) {
  const grammars = lesson?.grammar || [];
  if (grammars.length === 0) return null;
  const g = grammars[idx % grammars.length];
  if (!g) return null;
  const m = Array.isArray(g.mistakes) ? g.mistakes[0] : null;
  if (m && m.wrong && m.right) {
    return `Không nói “${m.wrong}”, nói “${m.right}”.`;
  }
  const expl = String(g.explanation || '').trim();
  if (!expl) return null;
  const firstSent = expl.split(/(?<=[.!?])\s+/)[0] || expl;
  if (firstSent.length <= 80) return firstSent;
  const cut = firstSent.slice(0, 80);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}
