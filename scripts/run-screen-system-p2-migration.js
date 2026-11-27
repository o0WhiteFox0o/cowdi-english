/**
 * scripts/run-screen-system-p2-migration.js
 * Runner Node idempotent (tương thích MySQL 5.5 / 5.6+ & 8.0) tạo 4 bảng cấu hình
 * Hệ thống Màn học Đợt 2 và seed đủ 19 mã + 3 nhóm trọng số.
 */
import pool from '../server/config/database.js';
import { ensureScreenSystemTables } from '../server/utils/screen-config-manager.js';

async function run() {
  console.log('--- Bắt đầu Migration Hệ thống Màn học Đợt 2 (screen_config, weights, testers, log) ---');
  try {
    await ensureScreenSystemTables(pool, { force: true });
    console.log('✓ Đã đảm bảo đủ 4 bảng và seed 19 mã màn + 3 nhóm trọng số.');
    console.log('--- Hoàn tất Migration Hệ thống Màn học Đợt 2 ---');
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error('❌ Migration thất bại:', err);
  process.exit(1);
});
