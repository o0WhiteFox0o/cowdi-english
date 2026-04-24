// Tách các bài học thành từng file riêng trong src/data/lessons/<track>/<lesson-id>.js
// Track suy ra từ examTag (ielts/b1/b2/toeic) hoặc 'general' cho LESSONS.
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'src/data/lessons');

// Import dữ liệu hiện tại từ file monolith
const lessonsSrc = pathToFileURL(resolve(ROOT, 'src/data/lessons.js')).href;
const examSrc = pathToFileURL(resolve(ROOT, 'src/data/exam-paths.js')).href;
const { LESSONS, QUIZ_BANK } = await import(lessonsSrc);
const { EXAM_LESSONS, EXAM_PATHS } = await import(examSrc);

// Nếu thư mục đích đã tồn tại (file cũ), xoá sạch để đảm bảo đồng bộ
if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

// Serializer JS gọn
function jsKey(k) { return /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k); }
function serialize(value, indent = 0) {
  const pad = '  '.repeat(indent);
  const padInner = '  '.repeat(indent + 1);
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return '[\n' + value.map(v => padInner + serialize(v, indent + 1)).join(',\n') + '\n' + pad + ']';
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    return '{\n' + keys.map(k => padInner + jsKey(k) + ': ' + serialize(value[k], indent + 1)).join(',\n') + '\n' + pad + '}';
  }
  return 'undefined';
}

function toVarName(id) {
  return id.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^(\d)/, '_$1').toUpperCase() + '_LESSON';
}

const trackMeta = {
  general: { label: 'Chủ đề tổng hợp', icon: '📚' },
  ielts:   { label: 'IELTS',           icon: '🎓' },
  b1:      { label: 'Cambridge B1',    icon: '🅱️' },
  b2:      { label: 'Cambridge B2',    icon: '🇬🇧' },
  toeic:   { label: 'TOEIC',           icon: '💼' },
};

// Gắn track cho từng bài
function lessonTrack(l) {
  if (l.examTag && trackMeta[l.examTag]) return l.examTag;
  return 'general';
}

const all = [
  ...LESSONS.map(l => ({ ...l, track: 'general' })),
  ...EXAM_LESSONS.map(l => ({ ...l, track: lessonTrack(l) })),
];

// Ghi từng bài thành 1 file trong track folder
const trackIndexes = {}; // track -> [{id, varName, file}]
for (const lesson of all) {
  const track = lesson.track;
  const trackDir = resolve(OUT_DIR, track);
  if (!existsSync(trackDir)) mkdirSync(trackDir, { recursive: true });
  const fileName = lesson.id + '.js';
  const varName = toVarName(lesson.id);

  // Loại bỏ trường 'track' khỏi object serialize (sẽ thêm lại ở index)
  const { track: _omit, ...pure } = lesson;

  const body =
    '// Auto-generated — chỉnh sửa bài học bằng cách sửa trực tiếp file này.\n' +
    `// Track: ${track} — ${lesson.title}\n\n` +
    `export const ${varName} = ${serialize(pure, 0)};\n\n` +
    `export default ${varName};\n`;
  writeFileSync(resolve(trackDir, fileName), body, 'utf8');

  (trackIndexes[track] ||= []).push({ id: lesson.id, varName, fileName });
  console.log('wrote', track + '/' + fileName);
}

// Ghi index.js cho mỗi track
for (const [track, list] of Object.entries(trackIndexes)) {
  const trackDir = resolve(OUT_DIR, track);
  const meta = trackMeta[track];
  const imports = list.map(x => `import { ${x.varName} } from './${x.fileName}';`).join('\n');
  const refs = list.map(x => x.varName).join(',\n  ');
  const body =
`// Auto-generated — danh sách bài học của track "${track}"
${imports}

export const TRACK_ID = ${JSON.stringify(track)};
export const TRACK_LABEL = ${JSON.stringify(meta.label)};
export const TRACK_ICON = ${JSON.stringify(meta.icon)};

export const LESSONS = [
  ${refs},
].map(l => ({ ...l, track: TRACK_ID }));

export default LESSONS;
`;
  writeFileSync(resolve(trackDir, 'index.js'), body, 'utf8');
  console.log('wrote', track + '/index.js');
}

// Ghi paths.js (EXAM_PATHS)
writeFileSync(
  resolve(OUT_DIR, 'paths.js'),
  '// Auto-generated — các lộ trình luyện thi (IELTS / B1 / B2 / TOEIC)\n\n' +
  'export const EXAM_PATHS = ' + serialize(EXAM_PATHS, 0) + ';\n',
  'utf8'
);
console.log('wrote paths.js');

// Ghi quiz-bank.js
writeFileSync(
  resolve(OUT_DIR, 'quiz-bank.js'),
  '// Auto-generated — ngân hàng câu hỏi cho Practice Page\n\n' +
  'export const QUIZ_BANK = ' + serialize(QUIZ_BANK, 0) + ';\n',
  'utf8'
);
console.log('wrote quiz-bank.js');

// Ghi index.js tổng hợp
const trackNames = Object.keys(trackIndexes);
const indexSrc =
`// Auto-generated — tổng hợp toàn bộ bài học
${trackNames.map(t => `import { LESSONS as ${t.toUpperCase()}_LESSONS } from './${t}/index.js';`).join('\n')}
import { withStandards } from './standards.js';
import { withReading } from './reading.js';

export { EXAM_PATHS } from './paths.js';
export { QUIZ_BANK } from './quiz-bank.js';
export { STANDARDS, classifyLesson } from './standards.js';
export { buildPassage } from './reading.js';

// Re-export configs (giữ các import cũ vẫn hoạt động)
export { LEVELS } from '../config/levels.js';
export { UNITS } from '../config/units.js';
export { ACHIEVEMENTS } from '../config/achievements.js';
export { COWDI_MESSAGES } from '../config/messages.js';

// Track metadata (dùng cho UI filter/tab)
export const TRACKS = [
${trackNames.map(t => `  { id: ${JSON.stringify(t)}, label: ${JSON.stringify(trackMeta[t].label)}, icon: ${JSON.stringify(trackMeta[t].icon)} }`).join(',\n')},
];

// LESSONS = chỉ các bài chủ đề chung (tương thích import cũ)
export const LESSONS = withReading(withStandards(GENERAL_LESSONS));

// EXAM_LESSONS = các bài luyện thi (tương thích import cũ)
export const EXAM_LESSONS = withReading(withStandards([
  ...IELTS_LESSONS,
  ...B1_LESSONS,
  ...B2_LESSONS,
  ...TOEIC_LESSONS,
]));

// Tất cả bài học (general + exam), dùng cho filter tổng
export const ALL_LESSONS = [...LESSONS, ...EXAM_LESSONS];
`;
writeFileSync(resolve(OUT_DIR, 'index.js'), indexSrc, 'utf8');
console.log('wrote lessons/index.js');

console.log('\nTotal:', all.length, 'lessons →',
  Object.entries(trackIndexes).map(([t, l]) => `${t}:${l.length}`).join(', '));
