// Sinh mỗi topic thành 1 file trong src/data/vocab/<id>.js
// Đọc dữ liệu đã merge từ vocab-topics.js hiện tại rồi ghi ra file riêng.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'src/data/vocab');

// Ép import theo URL để dùng ESM an toàn trên Windows
const src = pathToFileURL(resolve(ROOT, 'src/data/vocab-topics.js')).href;
const { VOCAB_TOPICS } = await import(src);

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// Serialize 1 object JS đẹp, KHÔNG quote key đơn giản, string dùng dấu nháy đơn
function jsKey(k) {
  return /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
}
function serialize(value, indent = 0) {
  const pad = '  '.repeat(indent);
  const padInner = '  '.repeat(indent + 1);
  if (value === null) return 'null';
  if (typeof value === 'string') {
    // Dùng JSON.stringify để escape an toàn (giữ " wrapping)
    return JSON.stringify(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => padInner + serialize(v, indent + 1));
    return '[\n' + items.join(',\n') + '\n' + pad + ']';
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    const items = keys.map(
      (k) => padInner + jsKey(k) + ': ' + serialize(value[k], indent + 1)
    );
    return '{\n' + items.join(',\n') + '\n' + pad + '}';
  }
  return 'undefined';
}

const indexImports = [];
const indexRefs = [];

for (const topic of VOCAB_TOPICS) {
  const fileName = topic.id.replace(/_/g, '-') + '.js';
  const filePath = resolve(OUT_DIR, fileName);
  const varName =
    topic.id
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^(\d)/, '_$1')
      .toUpperCase() + '_TOPIC';

  const body =
    '// Auto-generated from scripts/split-vocab.mjs\n' +
    '// Topic: ' + topic.id + ' — ' + (topic.nameVi || topic.name) + '\n\n' +
    'export const ' + varName + ' = ' + serialize(topic, 0) + ';\n\n' +
    'export default ' + varName + ';\n';
  writeFileSync(filePath, body, 'utf8');

  indexImports.push(
    "import { " + varName + " } from './" + fileName.replace(/\.js$/, '.js') + "';"
  );
  indexRefs.push(varName);

  const count = topic.subtopics.reduce((s, sub) => s + sub.words.length, 0);
  console.log('wrote', fileName, '(' + count + ' words)');
}

// index.js — ghép lại thành VOCAB_TOPICS + helpers
const indexSrc = `// Auto-generated from scripts/split-vocab.mjs — đừng sửa trực tiếp file này
// Mỗi chủ đề được tách thành một file riêng trong thư mục này để dễ phát triển.

${indexImports.join('\n')}

export const VOCAB_TOPICS = [
  ${indexRefs.join(',\n  ')},
];

/** Lấy toàn bộ từ vựng (flat) */
export function getAllTopicWords() {
  return VOCAB_TOPICS.flatMap((topic) =>
    topic.subtopics.flatMap((sub) => sub.words)
  );
}

/** Tổng số từ trên tất cả chủ đề */
export function getTopicWordCount() {
  return VOCAB_TOPICS.reduce(
    (sum, topic) =>
      sum + topic.subtopics.reduce((s, sub) => s + sub.words.length, 0),
    0
  );
}

/** Số từ của một chủ đề */
export function getTopicSize(topicId) {
  const topic = VOCAB_TOPICS.find((t) => t.id === topicId);
  if (!topic) return 0;
  return topic.subtopics.reduce((sum, sub) => sum + sub.words.length, 0);
}

/** Số từ của một subtopic */
export function getSubtopicSize(topicId, subtopicId) {
  const topic = VOCAB_TOPICS.find((t) => t.id === topicId);
  if (!topic) return 0;
  const sub = topic.subtopics.find((s) => s.id === subtopicId);
  return sub ? sub.words.length : 0;
}
`;
writeFileSync(resolve(OUT_DIR, 'index.js'), indexSrc, 'utf8');
console.log('wrote index.js');
