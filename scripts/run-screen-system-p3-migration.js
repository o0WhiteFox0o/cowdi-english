/**
 * scripts/run-screen-system-p3-migration.js
 * Runner Node idempotent (tương thích MySQL 5.5 / 5.6+ & 8.0, RK-005):
 * 1) Đảm bảo bảng screen_config..log + screen_intro
 * 2) Cập nhật 5 màn F Đợt 3 ('F-01','F-03','F-06','F-08','F-09') từ 'todo' → 'test'
 * 3) Seed 156 câu dẫn bản nháp (status = 'draft') bằng INSERT IGNORE
 * 4) Thêm 3 cột LONGTEXT vào user_progress: recent_intros, lesson_stars, lesson_star_paid
 */
import pool from '../server/config/database.js';
import {
  ensureScreenSystemTables,
  seedDefaultScreenIntros,
  P3_FRIENDLY_CODES,
} from '../server/utils/screen-config-manager.js';

async function columnExists(table, column) {
  const [rows] = await pool.execute(
    `SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
      LIMIT 1`,
    [table, column],
  );
  return rows.length > 0;
}

async function ensureUserProgressColumn(column) {
  if (await columnExists('user_progress', column)) {
    console.log(`• Cột user_progress.${column} đã tồn tại, bỏ qua.`);
    return;
  }
  await pool.query(`ALTER TABLE user_progress ADD COLUMN ${column} LONGTEXT NULL`);
  console.log(`✓ Đã thêm cột user_progress.${column}`);
}

async function run() {
  console.log('--- Bắt đầu Migration Hệ thống Màn học Đợt 3 ---');
  try {
    await ensureScreenSystemTables(pool, { force: true });
    console.log('✓ Đã đảm bảo 5 bảng Hệ thống Màn học (bao gồm screen_intro).');

    // Chuyển 5 mã F Đợt 3 từ 'todo' sang 'test' (giữ nguyên nếu admin đã sửa)
    const placeholders = P3_FRIENDLY_CODES.map(() => '?').join(',');
    const [upd] = await pool.execute(
      `UPDATE screen_config SET status = 'test', updated_at = NOW()
        WHERE code IN (${placeholders}) AND status = 'todo'`,
      P3_FRIENDLY_CODES,
    );
    console.log(`✓ Đã chuyển ${upd.affectedRows || 0} màn F Đợt 3 từ 'todo' → 'test'.`);

    const seeded = await seedDefaultScreenIntros(pool);
    console.log(`✓ Đã seed kho câu dẫn Đợt 3 (tổng chuẩn ${seeded.total} câu draft).`);

    await ensureUserProgressColumn('recent_intros');
    await ensureUserProgressColumn('lesson_stars');
    await ensureUserProgressColumn('lesson_star_paid');

    console.log('--- Hoàn tất Migration Hệ thống Màn học Đợt 3 ---');
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error('❌ Migration Đợt 3 thất bại:', err);
  process.exit(1);
});
