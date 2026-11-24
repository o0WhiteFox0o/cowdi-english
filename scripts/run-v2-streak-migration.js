/**
 * scripts/run-v2-streak-migration.js
 * Runner chạy an toàn migration GĐ3 (user_streak_state & user_contracts)
 */
import pool from '../server/config/database.js';

function parseDateToYMD(raw) {
  if (!raw) return null;
  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

async function run() {
  console.log('--- Bắt đầu Migration GĐ3: Cửa hàng Giữ nhịp ---');
  const conn = await pool.getConnection();
  try {
    // 1. Tạo bảng user_streak_state
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_streak_state (
        user_id INT UNSIGNED NOT NULL PRIMARY KEY,
        current_streak INT UNSIGNED NOT NULL DEFAULT 0,
        best_streak INT UNSIGNED NOT NULL DEFAULT 0,
        last_active_date DATE DEFAULT NULL,
        timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
        freeze_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
        freezes_bought_this_week TINYINT UNSIGNED NOT NULL DEFAULT 0,
        last_freeze_week VARCHAR(10) DEFAULT NULL,
        broken_streak_count INT UNSIGNED NOT NULL DEFAULT 0,
        broken_at DATE DEFAULT NULL,
        return_ticket_active BOOLEAN NOT NULL DEFAULT FALSE,
        return_ticket_deadline DATETIME DEFAULT NULL,
        return_ticket_lessons_done TINYINT UNSIGNED NOT NULL DEFAULT 0,
        last_return_ticket_at DATETIME DEFAULT NULL,
        has_clock BOOLEAN NOT NULL DEFAULT FALSE,
        clock_hour TINYINT UNSIGNED DEFAULT NULL,
        clock_minute TINYINT UNSIGNED DEFAULT 0,
        clock_last_changed_week VARCHAR(10) DEFAULT NULL,
        today_clock_bonus_lessons TINYINT UNSIGNED NOT NULL DEFAULT 0,
        today_clock_bonus_date DATE DEFAULT NULL,
        created_at DATETIME DEFAULT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_streak_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Bảng user_streak_state đã sẵn sàng.');

    // 2. Tạo bảng user_contracts
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_contracts (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        tier ENUM('starter', 'diligent', 'breakthrough') NOT NULL,
        deposit_amount INT UNSIGNED NOT NULL,
        target_lessons_per_day TINYINT UNSIGNED NOT NULL,
        start_date DATE NOT NULL,
        days_completed TINYINT UNSIGNED NOT NULL DEFAULT 0,
        today_lessons_done TINYINT UNSIGNED NOT NULL DEFAULT 0,
        last_evaluated_date DATE DEFAULT NULL,
        status ENUM('active', 'completed', 'failed') NOT NULL DEFAULT 'active',
        payout_amount INT UNSIGNED NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_contracts_user_status (user_id, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Bảng user_contracts đã sẵn sàng.');

    // 3. Khởi tạo dữ liệu người dùng cũ từ user_progress
    const [progressRows] = await conn.query(`
      SELECT user_id, streak, last_active_date FROM user_progress
    `);

    let synced = 0;
    for (const row of progressRows) {
      const currentStreak = Number(row.streak) || 0;
      const lastActive = parseDateToYMD(row.last_active_date);

      await conn.query(
        `INSERT INTO user_streak_state (user_id, current_streak, best_streak, last_active_date)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           best_streak = GREATEST(best_streak, VALUES(best_streak))`,
        [row.user_id, currentStreak, currentStreak, lastActive]
      );
      synced++;
    }
    console.log(`✓ Đã đồng bộ an toàn ${synced} người dùng vào user_streak_state.`);

    console.log('--- Migration GĐ3 Hoàn tất thành công! ---');
  } catch (err) {
    console.error('Migration GĐ3 thất bại:', err);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

run();
