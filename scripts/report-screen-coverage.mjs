/**
 * Bước 0.5 (GEMINI-SCREEN-SYSTEM-PHASE1): Chạy canRun của mọi màn T (và dự kiến F Đợt 3)
 * trên toàn bộ bài học, xuất báo cáo Markdown:
 *   node scripts/report-screen-coverage.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);

const { ALL_LESSONS } = await imp('src/data/lessons/index.js');
const { SCREEN_CATALOG } = await imp('src/features/lesson/screens/catalog.js');
const { writeItems } = await imp('src/features/lesson/screens/items.js');

// Thêm chỉ số dự kiến cho 5 màn F Đợt 3 để dùng lại ở Đợt 2–3
const PHASE3_PREVIEW = [
  { code: 'F-01*', slot: 'intro',  canRun: (l) => ({ ok: (l?.vocabulary?.length || 0) >= 4, missing: (l?.vocabulary?.length || 0) >= 4 ? [] : ['vocabulary ≥ 4'] }) },
  { code: 'F-03*', slot: 'listen', canRun: (l) => ({ ok: (l?.vocabulary?.length || 0) >= 6, missing: (l?.vocabulary?.length || 0) >= 6 ? [] : ['vocabulary ≥ 6'] }) },
  { code: 'F-08*', slot: 'read',   canRun: (l) => ({ ok: (l?.vocabulary?.length || 0) >= 6, missing: (l?.vocabulary?.length || 0) >= 6 ? [] : ['vocabulary ≥ 6'] }) },
  { code: 'F-09*', slot: 'write',  canRun: (l) => ({ ok: writeItems(l, 0).length >= 3, missing: writeItems(l, 0).length >= 3 ? [] : ['câu 3–8 từ ≥ 3'] }) },
  { code: 'F-06*', slot: 'boss',   canRun: () => ({ ok: true, missing: [] }) },
];

const today = new Date().toISOString().slice(0, 10);
const outPath = path.join(root, `docs/06-verification-validation/RPT-SCREEN-COVERAGE-${today}.md`);

// Lọc bài học thuộc nhóm Trung bình & Luyện thi (bài `picture` giữ nguyên PictureLesson)
const nonPicture = ALL_LESSONS.filter((l) => l.format !== 'picture');
const pictureLessons = ALL_LESSONS.filter((l) => l.format === 'picture');

const tCounts = Object.fromEntries(SCREEN_CATALOG.map((s) => [s.code, 0]));
const fCounts = Object.fromEntries(PHASE3_PREVIEW.map((s) => [s.code, 0]));
const skippedSlotLessons = [];
const rows = [];

const SKILL_SLOTS = ['intro', 'listen', 'speak', 'read', 'write', 'boss'];

for (const lesson of nonPicture) {
  const cells = [];
  const missingBySlot = {};
  const tOkBySlot = Object.fromEntries(SKILL_SLOTS.map((sl) => [sl, 0]));

  for (const s of SCREEN_CATALOG) {
    const res = s.canRun(lesson);
    if (res.ok) {
      tCounts[s.code]++;
      tOkBySlot[s.slot]++;
      cells.push('✓');
    } else {
      cells.push(`✗ (${res.missing.join(', ')})`);
      missingBySlot[s.slot] = missingBySlot[s.slot] || [];
      missingBySlot[s.slot].push(`${s.code}: ${res.missing.join(', ')}`);
    }
  }
  for (const f of PHASE3_PREVIEW) {
    if (f.canRun(lesson).ok) fCounts[f.code]++;
  }

  const zeroSlots = SKILL_SLOTS.filter((sl) => tOkBySlot[sl] === 0);
  if (zeroSlots.length > 0) {
    skippedSlotLessons.push({
      id: lesson.id,
      title: lesson.title,
      level: lesson.level || '—',
      zeroSlots,
      details: zeroSlots.map((sl) => `${sl} (${(missingBySlot[sl] || []).join('; ')})`).join(' · '),
    });
  }
  rows.push(`| \`${lesson.id}\` | ${lesson.level || '—'} | ${cells.join(' | ')} | ${zeroSlots.length ? `⚠️ thiếu: ${zeroSlots.join(', ')}` : '6/6 ✓'} |`);
}

const pct = (n, total) => (total ? `${Math.round((n / total) * 100)}%` : '0%');

const md = [
  `# RPT-SCREEN-COVERAGE — Báo cáo Độ phủ Dữ liệu Màn học (${today})`,
  '',
  `> Sinh tự động bởi \`node scripts/report-screen-coverage.mjs\` (Bước 0.5 \`GEMINI-SCREEN-SYSTEM-PHASE1\`).`,
  `> Tổng kho: **${ALL_LESSONS.length}** bài (**${nonPicture.length}** bài áp dụng Hệ thống Màn học Đợt 1; **${pictureLessons.length}** bài \`picture\` nhóm Mới học giữ nguyên \`PictureLesson\`).`,
  '',
  '## 1. Tổng hợp độ phủ theo mã màn (Đợt 1 — 7 màn T)',
  '',
  '| Mã | Tên | Slot | Số bài chạy được | Tỉ lệ |',
  '|---|---|---|---|---|',
  ...SCREEN_CATALOG.map((s) => `| \`${s.code}\` | ${s.name} | \`${s.slot}\` | ${tCounts[s.code]} / ${nonPicture.length} | **${pct(tCounts[s.code], nonPicture.length)}** |`),
  '',
  '## 2. Dự báo độ phủ 5 màn Thân thiện Đợt 3 (tham khảo)',
  '',
  '| Mã | Slot | Số bài chạy được | Tỉ lệ |',
  '|---|---|---|---|',
  ...PHASE3_PREVIEW.map((f) => `| \`${f.code.replace('*', '')}\` | \`${f.slot}\` | ${fCounts[f.code]} / ${nonPicture.length} | **${pct(fCounts[f.code], nonPicture.length)}** |`),
  '',
  `## 3. Danh sách bài có slot không còn màn T nào chạy được (${skippedSlotLessons.length} / ${nonPicture.length} bài)`,
  '',
  skippedSlotLessons.length === 0
    ? '_Không có bài nào bị thiếu slot — 100% bài chạy đủ 6 màn!_'
    : [
        '| Lesson ID | Cấp | Slot bị bỏ (chạy < 6 màn) | Lý do thiếu |',
        '|---|---|---|---|',
        ...skippedSlotLessons.map((x) => `| \`${x.id}\` | ${x.level} | \`${x.zeroSlots.join(', ')}\` | ${x.details} |`),
      ].join('\n'),
  '',
  '## 4. Ma trận chi tiết từng bài × 7 màn T',
  '',
  `| Lesson ID | Cấp | ${SCREEN_CATALOG.map((s) => s.code).join(' | ')} | Kết luận |`,
  `|---|---|${SCREEN_CATALOG.map(() => '---').join('|')}|---|`,
  ...rows,
  '',
].join('\n');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, md, 'utf8');

console.log(`✓ Đã xuất ${path.relative(root, outPath)}`);
console.log(`  Tổng bài áp dụng: ${nonPicture.length} (bỏ qua ${pictureLessons.length} bài picture)`);
for (const s of SCREEN_CATALOG) {
  console.log(`  ${s.code} (${s.slot}): ${tCounts[s.code]}/${nonPicture.length} (${pct(tCounts[s.code], nonPicture.length)})`);
}
console.log(`  Bài có slot bị skip (chạy < 6 màn): ${skippedSlotLessons.length}/${nonPicture.length}`);
