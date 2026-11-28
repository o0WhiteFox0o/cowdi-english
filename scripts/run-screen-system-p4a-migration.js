/**
 * scripts/run-screen-system-p4a-migration.js
 * Runner Node idempotent (tương thích MySQL 5.5 / 5.6+ & 8.0, RK-005):
 * 1) Đảm bảo 6 bảng Hệ thống Màn học (bao gồm screen_stat_daily không chứa user_id)
 * 2) Cập nhật 3 màn F Đợt 4a ('F-02','F-04','F-05') từ 'todo' → 'test'
 * 3) Seed 36 câu dẫn bản nháp (status = 'draft') cho F-02, F-04, F-05 bằng INSERT IGNORE
 */
import pool from '../server/config/database.js';
import {
  ensureScreenSystemTables,
  seedP4aScreenIntros,
  P4A_FRIENDLY_CODES,
} from '../server/utils/screen-config-manager.js';

async function run() {
  console.log('--- Bắt đầu Migration Hệ thống Màn học Đợt 4a ---');
  try {
    await ensureScreenSystemTables(pool, { force: true });
    console.log('✓ Đã đảm bảo 6 bảng Hệ thống Màn học (bao gồm screen_stat_daily).');

    const placeholders = P4A_FRIENDLY_CODES.map(() => '?').join(',');
    const [upd] = await pool.execute(
      `UPDATE screen_config
          SET status = 'test',
              note = COALESCE(note, 'Đợt 4a · chỉ tài khoản thử'),
              updated_at = NOW()
        WHERE code IN (${placeholders}) AND status = 'todo'`,
      P4A_FRIENDLY_CODES,
    );
    console.log(`✓ Đã chuyển ${upd.affectedRows || 0} màn F Đợt 4a từ 'todo' → 'test'.`);

    const seeded = await seedP4aScreenIntros(pool);
    console.log(`✓ Đã seed kho câu dẫn Đợt 4a (tổng chuẩn ${seeded.total} câu draft).`);

    console.log('--- Hoàn tất Migration Hệ thống Màn học Đợt 4a ---');
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error('❌ Migration Đợt 4a thất bại:', err);
  process.exit(1);
});
