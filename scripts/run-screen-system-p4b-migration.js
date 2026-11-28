/**
 * scripts/run-screen-system-p4b-migration.js
 * Runner Node idempotent gộp cả Đợt 4a + 4b (tương thích MySQL 5.5 / 5.6+ & 8.0, RK-005):
 * 1) Đảm bảo 6 bảng Hệ thống Màn học (bao gồm screen_stat_daily không chứa user_id)
 * 2) Cập nhật cả 6 màn F Đợt 4 ('F-02','F-04','F-05','F-07','F-10','F-11') từ 'todo' → 'test'
 * 3) Seed 72 câu dẫn bản nháp (36 Đợt 4a + 36 Đợt 4b) bằng INSERT IGNORE
 */
import pool from '../server/config/database.js';
import {
  ensureScreenSystemTables,
  seedP4aScreenIntros,
  seedP4bScreenIntros,
  P4A_FRIENDLY_CODES,
  P4B_FRIENDLY_CODES,
} from '../server/utils/screen-config-manager.js';

async function run() {
  console.log('--- Bắt đầu Migration Hệ thống Màn học Đợt 4 (4a + 4b) ---');
  try {
    await ensureScreenSystemTables(pool, { force: true });
    console.log('✓ Đã đảm bảo 6 bảng Hệ thống Màn học (bao gồm screen_stat_daily).');

    const allP4 = [...P4A_FRIENDLY_CODES, ...P4B_FRIENDLY_CODES];
    const placeholders = allP4.map(() => '?').join(',');
    const [upd] = await pool.execute(
      `UPDATE screen_config
          SET status = 'test',
              note = COALESCE(note, 'Đợt 4 · chỉ tài khoản thử'),
              updated_at = NOW()
        WHERE code IN (${placeholders}) AND status = 'todo'`,
      allP4,
    );
    console.log(`✓ Đã chuyển ${upd.affectedRows || 0} màn F Đợt 4 từ 'todo' → 'test'.`);

    const s4a = await seedP4aScreenIntros(pool);
    const s4b = await seedP4bScreenIntros(pool);
    console.log(`✓ Đã seed kho câu dẫn Đợt 4 (${s4a.total} câu 4a + ${s4b.total} câu 4b, trạng thái draft).`);

    console.log('--- Hoàn tất Migration Hệ thống Màn học Đợt 4 ---');
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error('❌ Migration Đợt 4 thất bại:', err);
  process.exit(1);
});
