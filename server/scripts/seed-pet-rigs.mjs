#!/usr/bin/env node
/**
 * Nạp dữ liệu rig mẫu (radish, bamboo) từ public/pets/ vào bảng pet_rigs
 * với trạng thái 'draft' và chép ảnh sang server/storage/pets/draft/.
 *
 * Cách chạy:
 *   node server/scripts/seed-pet-rigs.mjs
 *   node server/scripts/seed-pet-rigs.mjs --dry-run
 *   node server/scripts/seed-pet-rigs.mjs --files-only
 *   node server/scripts/seed-pet-rigs.mjs --force   (ghi đè draft đã tồn tại)
 */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(SERVER_ROOT, '..');

export const DEFAULT_SEED_PETS = ['radish', 'bamboo_spirit'];
export const DEFAULT_SOURCE_DIR = path.join(REPO_ROOT, 'public', 'pets');
export const DEFAULT_STORAGE_DIR = path.join(SERVER_ROOT, 'storage', 'pets');

function sha1Short(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
}

/**
 * Đọc rig.json + ảnh PNG từ public/pets/<petId>/c1..c5/, tính hash và chép sang
 * <storageDir>/draft/<petId>/c<n>/<part>-<sha1_8>.png (trừ khi dryRun = true).
 */
export async function collectSeedRigs({
  sourceDir = DEFAULT_SOURCE_DIR,
  storageDir = DEFAULT_STORAGE_DIR,
  pets = DEFAULT_SEED_PETS,
  dryRun = false,
} = {}) {
  const records = [];

  for (const petId of pets) {
    const petDir = path.join(sourceDir, petId);
    const rigPath = path.join(petDir, 'rig.json');
    const rawRig = await fs.readFile(rigPath, 'utf8');
    const rigAll = JSON.parse(rawRig);

    for (let stage = 1; stage <= 5; stage++) {
      const stageKey = `c${stage}`;
      const stageRig = rigAll[stageKey];
      if (!stageRig) continue;

      const stageSrcDir = path.join(petDir, stageKey);
      const entries = await fs.readdir(stageSrcDir, { withFileTypes: true });
      const pngFiles = entries
        .filter((e) => e.isFile() && /\.(png|webp)$/i.test(e.name))
        .map((e) => e.name)
        .sort();

      const draftImages = {};
      const copiedFiles = [];
      const destDir = path.join(storageDir, 'draft', petId, stageKey);

      if (!dryRun) {
        await fs.mkdir(destDir, { recursive: true });
      }

      for (const fileName of pngFiles) {
        const ext = path.extname(fileName).toLowerCase();
        const part = path.basename(fileName, path.extname(fileName));
        const srcFile = path.join(stageSrcDir, fileName);
        const buf = await fs.readFile(srcFile);
        const hash = sha1Short(buf);
        const hashedName = `${part}-${hash}${ext}`;
        const relPath = `draft/${petId}/${stageKey}/${hashedName}`;
        const destFile = path.join(destDir, hashedName);

        if (!dryRun) {
          await fs.writeFile(destFile, buf);
        }

        draftImages[part] = relPath;
        copiedFiles.push({ part, srcFile, destFile, relPath, bytes: buf.length });
      }

      records.push({
        petStage: `${petId}/${stageKey}`,
        petId,
        stage,
        draftRig: stageRig,
        draftImages,
        copiedFiles,
      });
    }
  }

  return records;
}

/**
 * Nạp danh sách rig vào bảng `pet_rigs` (trạng thái `draft`, idempotent).
 */
export async function seedPetRigs({
  db,
  sourceDir = DEFAULT_SOURCE_DIR,
  storageDir = DEFAULT_STORAGE_DIR,
  pets = DEFAULT_SEED_PETS,
  force = false,
  dryRun = false,
  filesOnly = false,
} = {}) {
  const records = await collectSeedRigs({ sourceDir, storageDir, pets, dryRun });

  if (dryRun || filesOnly) {
    return {
      total: records.length,
      inserted: 0,
      updated: 0,
      skipped: records.length,
      records,
    };
  }

  if (!db || typeof db.execute !== 'function') {
    throw new Error('Thiếu kết nối database (db.execute).');
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const rec of records) {
    const rigJson = JSON.stringify(rec.draftRig);
    const imagesJson = JSON.stringify(rec.draftImages);

    if (force) {
      const [result] = await db.execute(
        `INSERT INTO pet_rigs (pet_stage, draft_rig, draft_images, status)
         VALUES (?, ?, ?, 'draft')
         ON DUPLICATE KEY UPDATE
           draft_rig = VALUES(draft_rig),
           draft_images = VALUES(draft_images)`,
        [rec.petStage, rigJson, imagesJson]
      );
      if (result.affectedRows === 1) inserted++;
      else updated++;
    } else {
      const [result] = await db.execute(
        `INSERT IGNORE INTO pet_rigs (pet_stage, draft_rig, draft_images, status)
         VALUES (?, ?, ?, 'draft')`,
        [rec.petStage, rigJson, imagesJson]
      );
      if (result.affectedRows === 1) {
        inserted++;
        await db.execute(
          `INSERT INTO pet_motion_history (kind, ref_key, data_json, user_id)
           VALUES ('rig', ?, ?, NULL)`,
          [
            rec.petStage,
            JSON.stringify({
              action: 'seed',
              status: 'draft',
              draft_rig: rec.draftRig,
              draft_images: rec.draftImages,
            }),
          ]
        );
      } else {
        skipped++;
      }
    }
  }

  return { total: records.length, inserted, updated, skipped, records };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const filesOnly = args.has('--files-only');
  const force = args.has('--force');

  let pool = null;
  try {
    if (!dryRun && !filesOnly) {
      const mod = await import('../config/database.js');
      pool = mod.default;
    }

    const summary = await seedPetRigs({
      db: pool,
      dryRun,
      filesOnly,
      force,
    });

    const totalImages = summary.records.reduce((n, r) => n + r.copiedFiles.length, 0);
    if (dryRun) {
      console.log(`[dry-run] Tìm thấy ${summary.total} pet-cấp (${totalImages} ảnh) sẵn sàng nạp:`);
      for (const rec of summary.records) {
        console.log(`  - ${rec.petStage}: ${Object.keys(rec.draftImages).join(', ')}`);
      }
    } else if (filesOnly) {
      console.log(`[files-only] Đã chép ${totalImages} ảnh của ${summary.total} pet-cấp vào ${DEFAULT_STORAGE_DIR}/draft/`);
    } else {
      console.log(
        `✅ Seed pet_rigs xong: tổng ${summary.total} pet-cấp (${totalImages} ảnh) — ` +
        `thêm mới: ${summary.inserted}, cập nhật: ${summary.updated}, bỏ qua (đã có): ${summary.skipped}.`
      );
    }
  } finally {
    if (pool) await pool.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('❌ Lỗi seed-pet-rigs:', err.message || err);
    process.exit(1);
  });
}
