// Sinh shared/lesson-ids.json và shared/units.json từ src/data/
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
const units = ALL_PATHS.flatMap((p) =>
  p.units.map((u) => ({
    pathId: p.id,
    unitId: u.id,
    lessons: u.lessons,
    hasCheckpoint: Boolean(u.checkpoint),
  }))
);

const sharedDir = path.join(root, 'shared');
fs.mkdirSync(sharedDir, { recursive: true });

fs.writeFileSync(path.join(sharedDir, 'lesson-ids.json'), JSON.stringify(lessonIds, null, 2) + '\n');
fs.writeFileSync(path.join(sharedDir, 'units.json'), JSON.stringify(units, null, 2) + '\n');

console.log(`[build-lesson-ids] Exported ${lessonIds.length} lesson IDs and ${units.length} units to shared/`);
