/**
 * scripts/run-screen-system-p1-migration.js
 * Runner Node idempotent (tương thích MySQL 5.5 / 5.6+ trên aaPanel và MySQL 8.0)
 * thêm 2 cột user_progress.lesson_mix_log và user_progress.last_mix (LONGTEXT) cho Hệ thống Màn học Đợt 1.
 */
import pool from '../server/config/database.js';

const COLUMNS = [
  {
    name: 'lesson_mix_log',
    ddl: "ALTER TABLE user_progress ADD COLUMN lesson_mix_log LONGTEXT DEFAULT NULL COMMENT 'Screen System P1: 30 lessonMixLog entries JSON'",
  },
  {
    name: 'last_mix',
    ddl: "ALTER TABLE user_progress ADD COLUMN last_mix LONGTEXT DEFAULT NULL COMMENT 'Screen System P1: lastMix map by slot JSON'",
  },
];

async function run() {
  console.log('--- Bắt đầu Migration Hệ thống Màn học Đợt 1 (lesson_mix_log, last_mix) ---');
  let conn;
  try {
    conn = await pool.getConnection();
    for (const col of COLUMNS) {
      const [rows] = await conn.execute(
        `SELECT 1 FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_progress'
            AND COLUMN_NAME = ?`,
        [col.name],
      );
      if (rows.length === 0) {
        await conn.query(col.ddl);
        console.log(`✓ Đã thêm cột user_progress.${col.name} (LONGTEXT)`);
      } else {
        console.log(`• Cột user_progress.${col.name} đã tồn tại (bỏ qua)`);
      }
    }
    console.log('--- Hoàn tất Migration Hệ thống Màn học Đợt 1 ---');
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('❌ Migration thất bại:', err);
  process.exit(1);
});
