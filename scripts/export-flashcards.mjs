/**
 * Script xuất toàn bộ danh sách Flashcard (từ VOCAB_TOPICS & ALL_LESSONS)
 * kèm slug tên file ảnh, mức độ ưu tiên (P1/P2/P3) và AI image prompt gợi ý.
 *
 * Chạy: node scripts/export-flashcards.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VOCAB_TOPICS } from '../src/data/vocab/index.js';
import { ALL_LESSONS } from '../src/data/lessons/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs', '05-implementation', 'flashcards-export');

const STYLE_SUFFIX =
  'cute kawaii 2D flat-shaded vector illustration, clean bold outlines, soft pastel colors, centered single subject on pure white background, sticker style, educational flashcard icon, NO text, NO letters, NO words, NO watermark';

function toSlug(word) {
  return String(word || '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function resolvePriority(lesson) {
  const track = lesson.track || '';
  const cefr = lesson.cefrLevel || '';
  if (track === 'starter' || cefr === 'A1' || cefr === 'A2' || (track === 'general' && !cefr)) {
    return 'P1';
  }
  if (track === 'general' || track === 'b1' || track === 'b2') {
    return 'P2';
  }
  return 'P3';
}

function buildPrompt(entry) {
  const word = entry.word;
  const meaning = entry.meaning ? `(${entry.meaning})` : '';
  const example = entry.example ? `, visual context: "${entry.example}"` : '';
  const pos = (entry.pos || '').toLowerCase();

  let subjectHint = `clear visual representation of "${word}"`;
  if (pos.includes('verb') || pos === 'v') {
    subjectHint = `cute chibi cow mascot Cowdi or friendly character demonstrating the action "${word}"`;
  } else if (pos.includes('adj')) {
    subjectHint = `expressive cute character or clear visual scene showing the concept "${word}"`;
  } else if (entry.topics.includes('numbers')) {
    subjectHint = `playful colorful illustrated object group or cute counting visual representing "${word}"`;
  } else if (entry.topics.includes('animals')) {
    subjectHint = `adorable friendly cartoon animal "${word}"`;
  } else if (entry.topics.includes('eating') || entry.topics.includes('drinking')) {
    subjectHint = `appetizing cute illustrated "${word}"`;
  }

  return `${subjectHint} ${meaning}${example}, ${STYLE_SUFFIX}`.replace(/\s+/g, ' ').trim();
}

function escapeCsv(val) {
  const s = String(val ?? '');
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows, headers) {
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => escapeCsv(r[h])).join(','));
  }
  // UTF-8 BOM để mở Excel không bị lỗi font tiếng Việt
  return '\uFEFF' + lines.join('\r\n');
}

const map = new Map();

function upsertWord({
  word,
  meaning,
  phonetic,
  pos,
  example,
  illustration,
  image,
  source,
  topicId,
  groupLabel,
  priority,
}) {
  const key = String(word || '').trim().toLowerCase();
  if (!key) return;

  if (!map.has(key)) {
    map.set(key, {
      id: key,
      slug: toSlug(key),
      word: String(word).trim(),
      pos: pos || '',
      phonetic: phonetic || '',
      meaning: meaning || '',
      example: example || '',
      illustration: illustration || '',
      existingImage: image || '',
      sources: new Set(),
      topics: new Set(),
      groups: new Set(),
      priority,
    });
  }

  const entry = map.get(key);
  entry.sources.add(source);
  if (topicId) entry.topics.add(topicId);
  if (groupLabel) entry.groups.add(groupLabel);
  if (!entry.pos && pos) entry.pos = pos;
  if (!entry.phonetic && phonetic) entry.phonetic = phonetic;
  if (!entry.meaning && meaning) entry.meaning = meaning;
  if (!entry.example && example) entry.example = example;
  if (!entry.illustration && illustration) entry.illustration = illustration;
  if (!entry.existingImage && image) entry.existingImage = image;

  // Giữ priority cao nhất (P1 > P2 > P3)
  if (priority < entry.priority) {
    entry.priority = priority;
  }
}

// 1. Quét VOCAB_TOPICS
for (const topic of VOCAB_TOPICS) {
  for (const sub of topic.subtopics || []) {
    for (const w of sub.words || []) {
      const firstEx = Array.isArray(w.examples) && w.examples[0]?.en ? w.examples[0].en : w.example;
      upsertWord({
        word: w.word,
        meaning: w.meaning,
        phonetic: w.phonetic,
        pos: w.pos,
        example: firstEx,
        illustration: w.illustration,
        image: w.image,
        source: 'vocab_topic',
        topicId: topic.id,
        groupLabel: `${topic.nameVi} (${sub.nameVi})`,
        priority: 'P2',
      });
    }
  }
}

// 2. Quét ALL_LESSONS
for (const lesson of ALL_LESSONS) {
  const prio = resolvePriority(lesson);
  const label = `Unit ${lesson.unit ?? '-'} · ${lesson.title || lesson.id}`;
  for (const w of lesson.vocabulary || []) {
    const firstEx = Array.isArray(w.examples) && w.examples[0]?.en ? w.examples[0].en : w.example;
    upsertWord({
      word: w.word,
      meaning: w.meaning,
      phonetic: w.phonetic,
      pos: w.pos,
      example: firstEx,
      illustration: w.illustration,
      image: w.image,
      source: 'lesson',
      topicId: lesson.track || 'lesson',
      groupLabel: label,
      priority: prio,
    });
  }
}

// Xử lý trùng slug (hiếm gặp, ví dụ "a/b" vs "ab")
const usedSlugs = new Map();
const records = [];
for (const entry of map.values()) {
  let slug = entry.slug || 'word';
  const count = usedSlugs.get(slug) || 0;
  usedSlugs.set(slug, count + 1);
  if (count > 0) slug = `${slug}_${count + 1}`;

  const topicsArr = [...entry.topics];
  const row = {
    priority: entry.priority,
    slug,
    image_filename: `${slug}.webp`,
    word: entry.word,
    pos: entry.pos,
    phonetic: entry.phonetic,
    meaning: entry.meaning,
    example: entry.example,
    current_emoji: entry.illustration,
    existing_image: entry.existingImage,
    sources: [...entry.sources].join('+'),
    groups: [...entry.groups].slice(0, 3).join(' | '),
    ai_prompt: buildPrompt({ ...entry, topics: topicsArr }),
  };
  records.push(row);
}

// Sắp xếp theo priority (P1 -> P2 -> P3), rồi theo alphabet
records.sort((a, b) => {
  if (a.priority !== b.priority) return a.priority.localeCompare(b.priority);
  return a.word.localeCompare(b.word);
});

fs.mkdirSync(OUT_DIR, { recursive: true });

const headers = [
  'priority',
  'slug',
  'image_filename',
  'word',
  'pos',
  'phonetic',
  'meaning',
  'example',
  'current_emoji',
  'existing_image',
  'sources',
  'groups',
  'ai_prompt',
];

fs.writeFileSync(path.join(OUT_DIR, 'flashcards-all.csv'), toCsv(records, headers), 'utf8');
fs.writeFileSync(
  path.join(OUT_DIR, 'flashcards-p1-basic.csv'),
  toCsv(records.filter((r) => r.priority === 'P1'), headers),
  'utf8',
);
fs.writeFileSync(path.join(OUT_DIR, 'flashcards-all.json'), JSON.stringify(records, null, 2), 'utf8');

const summary = records.reduce(
  (acc, r) => {
    acc[r.priority] = (acc[r.priority] || 0) + 1;
    if (r.existing_image) acc.hasImage += 1;
    return acc;
  },
  { total: records.length, P1: 0, P2: 0, P3: 0, hasImage: 0 },
);

console.log('Exported flashcards:', summary);
