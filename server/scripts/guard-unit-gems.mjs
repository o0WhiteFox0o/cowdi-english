/**
 * server/scripts/guard-unit-gems.mjs
 * Chặn cấp lại Gem (+1 unit_complete / +2 unit_perfect) cho các unit MỚI mà người dùng cũ
 * đã hoàn thành toàn bộ bài trước khi tách lộ trình 3 nhóm (SDD-LEARNING-GROUPS-v2.0 §6.3).
 *
 * Cách chạy trên server thật (sau migration và deploy code):
 *   node server/scripts/guard-unit-gems.mjs
 * Idempotent: chạy lại nhiều lần chỉ chèn 0 dòng từ lần thứ 2 nhờ UNIQUE KEY uq_grant.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedUnitsPath = path.resolve(__dirname, '../../shared/units.json');

/** Danh sách 44 unitId đã tồn tại ở commit a6e87a7 (trước khi tách lộ trình 3 nhóm). */
export const LEGACY_UNIT_IDS = new Set([
  'unit-1', 'unit-2', 'unit-3', 'unit-4', 'unit-5', 'unit-6', 'unit-7', 'unit-8', 'unit-9',
  'ielts-unit-foundation', 'ielts-unit-pre', 'ielts-unit-1', 'ielts-unit-2', 'ielts-unit-3', 'ielts-unit-4', 'ielts-unit-5',
  'b1-unit-1', 'b1-unit-2', 'b1-unit-3', 'b1-unit-4', 'b1-unit-5',
  'b2-unit-1', 'b2-unit-2', 'b2-unit-3', 'b2-unit-4', 'b2-unit-5',
  'toeic-unit-basics', 'toeic-unit-elementary', 'toeic-unit-daily-work', 'toeic-unit-business-comm',
  'toeic-unit-travel-finance', 'toeic-unit-industries', 'toeic-unit-advanced-vocab',
  'toeic-unit-listening', 'toeic-unit-reading', 'toeic-unit-reading-advanced',
  'toeic-unit-grammar', 'toeic-unit-advanced',
  'adv-unit-c1-foundations', 'adv-unit-c1-skills', 'adv-unit-c1-academic',
  'adv-unit-c2-style', 'adv-unit-c2-rhetoric', 'adv-unit-c2-mastery',
]);

export function loadUnitsList(filePath = sharedUnitsPath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function guardUnitGems(db, unitsList = loadUnitsList()) {
  const newUnits = unitsList.filter(
    (u) => u && u.unitId && !LEGACY_UNIT_IDS.has(u.unitId) && Array.isArray(u.lessons) && u.lessons.length > 0
  );

  const [rows] = await db.execute('SELECT user_id, completed_lessons FROM user_progress');
  let usersChecked = 0;
  let guardRowsInserted = 0;

  for (const row of rows) {
    usersChecked++;
    let completed = [];
    if (Array.isArray(row.completed_lessons)) {
      completed = row.completed_lessons;
    } else if (typeof row.completed_lessons === 'string' && row.completed_lessons.trim()) {
      try { completed = JSON.parse(row.completed_lessons); } catch { completed = []; }
    }
    if (!completed.length) continue;

    const completedSet = new Set(completed);
    for (const unit of newUnits) {
      const allDone = unit.lessons.every((lid) => completedSet.has(lid));
      if (!allDone) continue;

      for (const reason of ['unit_complete', 'unit_perfect']) {
        const [result] = await db.execute(
          `INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
           VALUES (?, 'gem', 0, ?, ?)`,
          [row.user_id, reason, unit.unitId]
        );
        guardRowsInserted += Number(result?.affectedRows || 0);
      }
    }
  }

  return { usersChecked, newUnitsCount: newUnits.length, guardRowsInserted };
}

// Chạy trực tiếp bằng CLI
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { default: pool } = await import('../config/database.js');
  try {
    const summary = await guardUnitGems(pool);
    console.log(
      `[guard-unit-gems] Kiểm tra ${summary.usersChecked} user trên ${summary.newUnitsCount} unit mới · đã chèn ${summary.guardRowsInserted} dòng chặn (0 Gem).`
    );
  } catch (err) {
    console.error('[guard-unit-gems] Lỗi:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
