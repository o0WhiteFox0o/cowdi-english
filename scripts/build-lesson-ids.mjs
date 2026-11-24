// Sinh shared/lesson-ids.json và shared/units.json từ src/data/
// Kiểm tra:
//   1. Khử trùng unitId dùng chung (exam-intro, exam-pron) và báo lỗi nếu khác danh sách bài.
//   2. Mọi bài trong ALL_LESSONS phải thuộc ít nhất một unit (0 bài mồ côi).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const lessonsUrl = pathToFileURL(path.join(root, 'src/data/lessons.js')).href;
const pathUrl = pathToFileURL(path.join(root, 'src/data/path.js')).href;

const { ALL_LESSONS } = await import(lessonsUrl);
const { ALL_PATHS } = await import(pathUrl);

const lessonIds = ALL_LESSONS.map((l) => l.id);
const lessonIdSet = new Set(lessonIds);

// Khử trùng unit theo unitId (giữ pathId đầu tiên + mảng pathIds)
const unitsById = new Map();
for (const p of ALL_PATHS) {
  for (const u of p.units) {
    if (u.comingSoon && (!u.lessons || u.lessons.length === 0)) continue;
    const lessons = Array.isArray(u.lessons) ? u.lessons : [];
    const existing = unitsById.get(u.id);
    if (existing) {
      const sameLessons =
        existing.lessons.length === lessons.length &&
        existing.lessons.every((id, i) => id === lessons[i]);
      if (!sameLessons) {
        console.error(`[build-lesson-ids] LỖI: unitId "${u.id}" bị trùng giữa các unit có danh sách bài khác nhau!`);
        process.exit(1);
      }
      if (!existing.pathIds.includes(p.id)) existing.pathIds.push(p.id);
    } else {
      unitsById.set(u.id, {
        pathId: p.id,
        pathIds: [p.id],
        unitId: u.id,
        lessons,
        hasCheckpoint: Boolean(u.checkpoint),
      });
    }
  }
}

const units = [...unitsById.values()];

// Kiểm tra mọi bài trong unit đều tồn tại và mọi bài trong ALL_LESSONS đều thuộc ≥1 unit
const coveredLessons = new Set();
const unknownLessons = [];
for (const u of units) {
  for (const lid of u.lessons) {
    if (!lessonIdSet.has(lid)) unknownLessons.push(`${u.unitId}:${lid}`);
    coveredLessons.add(lid);
  }
}

if (unknownLessons.length > 0) {
  console.error(`[build-lesson-ids] LỖI: Các unit tham chiếu bài không tồn tại: ${unknownLessons.join(', ')}`);
  process.exit(1);
}

const orphans = lessonIds.filter((id) => !coveredLessons.has(id));
if (orphans.length > 0) {
  console.error(`[build-lesson-ids] LỖI: Có ${orphans.length} bài không thuộc unit nào: ${orphans.join(', ')}`);
  process.exit(1);
}

const sharedDir = path.join(root, 'shared');
fs.mkdirSync(sharedDir, { recursive: true });

fs.writeFileSync(path.join(sharedDir, 'lesson-ids.json'), JSON.stringify(lessonIds, null, 2) + '\n');
fs.writeFileSync(path.join(sharedDir, 'units.json'), JSON.stringify(units, null, 2) + '\n');

console.log(`[build-lesson-ids] Exported ${lessonIds.length} lesson IDs and ${units.length} unique units (0 orphans) to shared/`);
