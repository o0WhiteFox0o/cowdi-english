/**
 * scripts/run-learning-groups-migration.js
 * Runner Node idempotent (tương thích MySQL 5.5/5.6+ trên aaPanel) cho Lộ trình 3 nhóm.
 * Thêm 4 cột vào user_progress: learner_group, active_path, lesson_scores, placement.
 */
import pool from '../server/config/database.js';

const COLUMNS = [
  { name: 'learner_group', def: 'VARCHAR(16) DEFAULT NULL' },
  { name: 'active_path',   def: 'VARCHAR(32) DEFAULT NULL' },
  { name: 'lesson_scores', def: "LONGTEXT DEFAULT NULL COMMENT 'JSON {lessonId: 0-100}'" },
  { name: 'placement',     def: "LONGTEXT DEFAULT NULL COMMENT 'JSON kết quả kiểm tra đầu vào'" },
];

async function run() {
  console.log('--- Bắt đầu Migration Lộ trình 3 nhóm ---');
  const conn = await pool.getConnection();
  try {
    let added = 0;
    for (const col of COLUMNS) {
      const [rows] = await conn.execute(
        `SELECT 1 FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_progress'
            AND COLUMN_NAME = ?`,
        [col.name]
      );
      if (rows.length === 0) {
        await conn.query(`ALTER TABLE user_progress ADD COLUMN ${col.name} ${col.def}`);
        console.log(`✓ Đã thêm cột user_progress.${col.name}`);
        added++;
      } else {
        console.log(`• Cột user_progress.${col.name} đã tồn tại (bỏ qua)`);
      }
    }
    console.log(`--- Hoàn tất Migration Lộ trình 3 nhóm (đã thêm ${added} cột mới) ---`);
  } catch (err) {
    console.error('Migration Lộ trình 3 nhóm thất bại:', err);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

run();
