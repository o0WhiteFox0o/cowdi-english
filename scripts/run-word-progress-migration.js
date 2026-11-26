/**
 * scripts/run-word-progress-migration.js
 * Runner Node idempotent (tương thích MySQL 5.5 / 5.6+ trên aaPanel và MySQL 8.0)
 * thêm cột user_progress.word_progress LONGTEXT cho Flashcard v1.4 (DEC-09).
 */
import pool from '../server/config/database.js';

async function run() {
  console.log('--- Bắt đầu Migration Flashcard v1.4 (user_progress.word_progress) ---');
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.execute(
      `SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'user_progress'
          AND COLUMN_NAME = 'word_progress'`
    );
    if (rows.length === 0) {
      await conn.query(
        `ALTER TABLE user_progress ADD COLUMN word_progress LONGTEXT DEFAULT NULL COMMENT 'Flashcard v1.4 memory points JSON map'`
      );
      console.log('✓ Đã thêm cột user_progress.word_progress (LONGTEXT)');
    } else {
      console.log('• Cột user_progress.word_progress đã tồn tại (bỏ qua)');
    }
    console.log('--- Hoàn tất Migration Flashcard v1.4 ---');
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('❌ Migration thất bại:', err);
  process.exit(1);
});
