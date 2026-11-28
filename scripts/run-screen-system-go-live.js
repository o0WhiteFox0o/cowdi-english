/**
 * scripts/run-screen-system-go-live.js
 * Bật công khai toàn bộ 11 màn Thân thiện (F-01..F-11) đang ở trạng thái 'test' → 'on'
 * trên database production (idempotent, giữ nguyên các màn admin đã chủ động đặt 'off').
 */
import pool from '../server/config/database.js';
import {
  ensureScreenSystemTables,
  P3_FRIENDLY_CODES,
  P4A_FRIENDLY_CODES,
  P4B_FRIENDLY_CODES,
} from '../server/utils/screen-config-manager.js';

async function run() {
  console.log('--- Bắt đầu Go-Live Hệ thống Màn học (F-01..F-11: test → on) ---');
  try {
    await ensureScreenSystemTables(pool, { force: true });
    const allF = [...P3_FRIENDLY_CODES, ...P4A_FRIENDLY_CODES, ...P4B_FRIENDLY_CODES];
    const placeholders = allF.map(() => '?').join(',');

    const [rows] = await pool.execute(
      `SELECT code, status FROM screen_config WHERE code IN (${placeholders}) AND status IN ('test', 'todo')`,
      allF,
    );

    if (rows.length === 0) {
      console.log('• Không có màn F nào đang ở trạng thái test/todo cần bật.');
      return;
    }

    const [upd] = await pool.execute(
      `UPDATE screen_config
          SET status = 'on',
              note = 'Go-Live công khai (28/11/2026)',
              updated_at = NOW()
        WHERE code IN (${placeholders}) AND status IN ('test', 'todo')`,
      allF,
    );

    // Ghi log hệ thống (changed_by = 0 đánh dấu script Go-Live)
    await pool.execute(
      `INSERT INTO screen_config_log (target, old_value, new_value, changed_by, changed_at)
       VALUES (?, ?, ?, 0, NOW())`,
      [
        'go-live:friendly',
        JSON.stringify(rows.map((r) => ({ code: r.code, status: r.status }))),
        JSON.stringify({ status: 'on', count: upd.affectedRows || rows.length }),
      ],
    );

    console.log(`✓ Đã bật công khai ${upd.affectedRows || rows.length} màn F → 'on': ${rows.map((r) => r.code).join(', ')}`);
    console.log('--- Hoàn tất Go-Live Hệ thống Màn học ---');
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error('❌ Go-Live thất bại:', err);
  process.exit(1);
});
