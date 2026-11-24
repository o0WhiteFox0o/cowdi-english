// Kiểm tra toàn bộ bài học theo src/data/lessons/schema.js
//   node scripts/validate-lessons.mjs            → tóm tắt, exit 1 nếu có lỗi
//   node scripts/validate-lessons.mjs --verbose  → in từng cảnh báo
//   node scripts/validate-lessons.mjs --only greetings,s1-pets
//   node scripts/validate-lessons.mjs --md report.md   → ghi báo cáo markdown
// Bài v2 (contentVersion: 2): vi phạm chuẩn = lỗi. Bài cũ: chỉ lỗi cấu trúc mới là lỗi.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);

const { ALL_LESSONS } = await imp('src/data/lessons/index.js');
const { validateLesson, toLegacyShape } = await imp('src/data/lessons/schema.js');
let golden = [];
if (fs.existsSync(path.join(root, 'src/data/lessons/_golden/index.js'))) {
  ({ GOLDEN_LESSONS: golden } = await imp('src/data/lessons/_golden/index.js'));
}

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const mdOut = args.includes('--md') ? args[args.indexOf('--md') + 1] : null;

// Bài golden thay thế bài cùng id trong kho (ví dụ greetings v2).
const byId = new Map(ALL_LESSONS.map((l) => [l.id, { lesson: l, source: 'repo' }]));
for (const g of golden) byId.set(g.id, { lesson: g, source: 'golden' });

const rows = [];
for (const [id, { lesson, source }] of byId) {
  if (only && !only.includes(id)) continue;
  const res = validateLesson(lesson);
  // Bài v2 phải chạy được trên UI hiện tại sau khi qua lớp tương thích.
  if (lesson.contentVersion === 2) {
    const legacy = toLegacyShape(lesson);
    for (const k of ['vocabulary', 'grammar', 'quiz']) {
      if (!Array.isArray(legacy[k])) res.errors.push(`tương thích: thiếu ${k}[] sau toLegacyShape`);
    }
    if (!legacy.quiz?.length) res.errors.push('tương thích: quiz rỗng → bước Quiz bị ẩn, bài không bao giờ hoàn thành');
  }
  rows.push({ id, source, v2: lesson.contentVersion === 2, ...res });
}

const total = rows.length;
const bad = rows.filter((r) => r.errors.length);
const byLevel = {};
for (const r of rows) {
  const b = (byLevel[r.level] ||= { n: 0, clean: 0, warn: 0 });
  b.n++;
  if (!r.errors.length && !r.warnings.length) b.clean++;
  b.warn += r.warnings.length;
}
// Gom cảnh báo theo loại (bỏ phần số/tên riêng) để biết việc nào tốn công nhất
const kinds = {};
for (const r of rows) for (const w of r.warnings) {
  const k = w.replace(/\[\d+\]/g, '[]').replace(/"[^"]*"/g, '"…"').replace(/đang có \d+/g, '').replace(/\d+\/\d+/g, 'x/y').replace(/\s+/g, ' ').trim();
  kinds[k] = (kinds[k] || 0) + 1;
}

const lines = [];
lines.push(`Kiểm tra ${total} bài (${golden.length} bài mẫu golden).`);
for (const [lv, b] of Object.entries(byLevel)) lines.push(`  ${lv.padEnd(13)} ${b.n} bài · đạt chuẩn ${b.clean} · ${b.warn} cảnh báo`);
lines.push(`Bài có LỖI: ${bad.length}`);
for (const r of bad) lines.push(`  ✗ ${r.id}${r.v2 ? ' (v2)' : ''}: ${r.errors.join(' | ')}`);
lines.push('Cảnh báo phổ biến nhất:');
for (const [k, n] of Object.entries(kinds).sort((a, b) => b[1] - a[1]).slice(0, 15)) lines.push(`  ${String(n).padStart(4)} × ${k}`);
if (verbose) for (const r of rows) if (r.warnings.length) lines.push(`\n• ${r.id} [${r.level}]\n  - ${r.warnings.join('\n  - ')}`);
console.log(lines.join('\n'));

if (mdOut) {
  const md = [`# Báo cáo kiểm tra nội dung bài học`, '', `Sinh bởi \`scripts/validate-lessons.mjs\` lúc ${new Date().toISOString()}.`, '',
    '| Cấp | Số bài | Đạt chuẩn | Cảnh báo |', '|---|---|---|---|',
    ...Object.entries(byLevel).map(([lv, b]) => `| ${lv} | ${b.n} | ${b.clean} | ${b.warn} |`), '',
    '## Cảnh báo phổ biến', '', '| Số lần | Loại |', '|---|---|',
    ...Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, n]) => `| ${n} | ${k.replace(/\|/g, '\\|')} |`), '',
    '## Chi tiết từng bài', '',
    ...rows.filter((r) => r.errors.length || r.warnings.length).map((r) => `### ${r.id} · ${r.level}${r.v2 ? ' · v2' : ''}\n${[...r.errors.map((e) => `- ❌ ${e}`), ...r.warnings.map((w) => `- ⚠️ ${w}`)].join('\n')}\n`)];
  fs.writeFileSync(mdOut, md.join('\n'));
}
process.exitCode = bad.length ? 1 : 0; // không gọi process.exit(): tránh cắt mất output khi pipe
