/**
 * scripts/run-friends-migration.js
 * Runner Node idempotent (tương thích MySQL 5.5 / 5.6+ trên aaPanel và MySQL 8.0)
 * cho Phân hệ Bạn bè & Thưởng mời bạn (SRS-FRIENDS v1.1).
 */
import pool from '../server/config/database.js';

const COLUMN_UPDATES = [
  { table: 'users', column: 'friend_code', def: 'CHAR(8) DEFAULT NULL' },
  { table: 'users', column: 'nickname', def: 'VARCHAR(32) DEFAULT NULL' },
  { table: 'invites', column: 'creator_ip', def: 'VARCHAR(45) DEFAULT NULL' },
  { table: 'invites', column: 'creator_device_hash', def: 'CHAR(64) DEFAULT NULL' },
  { table: 'invites', column: 'claim_ip', def: 'VARCHAR(45) DEFAULT NULL' },
  { table: 'invites', column: 'claim_device_hash', def: 'CHAR(64) DEFAULT NULL' },
  { table: 'invites', column: 'flagged', def: 'TINYINT(1) NOT NULL DEFAULT 0' },
  { table: 'challenges', column: 'is_friend_duel', def: 'TINYINT(1) NOT NULL DEFAULT 0' },
];

async function addColIfMissing(conn, table, column, def) {
  const [rows] = await conn.execute(
    `SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?`,
    [table, column]
  );
  if (rows.length === 0) {
    await conn.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
    console.log(`✓ Đã thêm cột ${table}.${column}`);
    return true;
  }
  console.log(`• Cột ${table}.${column} đã tồn tại (bỏ qua)`);
  return false;
}

async function addIndexIfMissing(conn, table, indexName, ddl) {
  const [rows] = await conn.execute(
    `SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?`,
    [table, indexName]
  );
  if (rows.length === 0) {
    await conn.query(`ALTER TABLE ${table} ADD ${ddl}`);
    console.log(`✓ Đã thêm index ${table}.${indexName}`);
    return true;
  }
  console.log(`• Index ${table}.${indexName} đã tồn tại (bỏ qua)`);
  return false;
}

async function run() {
  console.log('--- Bắt đầu Migration Bạn bè & Thưởng mời bạn (SRS-FRIENDS v1.1) ---');
  let conn;
  try {
    conn = await pool.getConnection();

    // 1. Thêm các cột mới cho users, invites, challenges
    for (const item of COLUMN_UPDATES) {
      await addColIfMissing(conn, item.table, item.column, item.def);
    }

    await addIndexIfMissing(
      conn,
      'users',
      'uq_users_friend_code',
      'UNIQUE INDEX uq_users_friend_code (friend_code)'
    );

    // 2. Mở rộng ENUM currency của wallet_ledger thêm gacha_ticket
    await conn.query(
      `ALTER TABLE wallet_ledger
         MODIFY COLUMN currency ENUM('milk','gem','stone','stone_shard','gacha_ticket') NOT NULL`
    );
    console.log('✓ Đã đồng bộ wallet_ledger.currency (thêm gacha_ticket)');

    // 3. Tạo các bảng mới
    await conn.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        user_low     INT UNSIGNED NOT NULL,
        user_high    INT UNSIGNED NOT NULL,
        status       ENUM('pending','accepted','blocked') NOT NULL,
        requested_by INT UNSIGNED NOT NULL,
        blocked_by   INT UNSIGNED DEFAULT NULL,
        source       ENUM('invite','code','qr') NOT NULL DEFAULT 'code',
        created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        accepted_at  DATETIME DEFAULT NULL,
        PRIMARY KEY (user_low, user_high),
        INDEX idx_friendships_high_status (user_high, status),
        INDEX idx_friendships_low_status (user_low, status),
        CONSTRAINT fk_friend_low  FOREIGN KEY (user_low)  REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_friend_high FOREIGN KEY (user_high) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Bảng friendships sẵn sàng');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS friend_reports (
        id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        reporter_id INT UNSIGNED NOT NULL,
        reported_id INT UNSIGNED NOT NULL,
        reason      VARCHAR(40) NOT NULL,
        created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        handled     TINYINT(1) NOT NULL DEFAULT 0,
        INDEX idx_friend_reports_handled (handled, created_at),
        CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_report_reported FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Bảng friend_reports sẵn sàng');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_lesson_first_completions (
        user_id        INT UNSIGNED NOT NULL,
        lesson_id      VARCHAR(64) NOT NULL,
        completed_date DATE NOT NULL,
        completed_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, lesson_id),
        INDEX idx_ulfc_user_date (user_id, completed_date),
        CONSTRAINT fk_ulfc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Bảng user_lesson_first_completions sẵn sàng');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS invite_ticket_queue (
        id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id       INT UNSIGNED NOT NULL,
        milestone     INT UNSIGNED NOT NULL,
        ticket_index  TINYINT UNSIGNED NOT NULL,
        granted_month CHAR(7) DEFAULT NULL,
        created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        granted_at    DATETIME DEFAULT NULL,
        UNIQUE KEY uq_inv_ticket (user_id, milestone, ticket_index),
        INDEX idx_inv_ticket_pending (user_id, granted_month),
        CONSTRAINT fk_inv_ticket_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Bảng invite_ticket_queue sẵn sàng');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS invite_notifications (
        id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id    INT UNSIGNED NOT NULL,
        kind       VARCHAR(32) NOT NULL,
        ref_id     VARCHAR(64) NOT NULL,
        payload    LONGTEXT NOT NULL,
        seen       TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_inv_notif (user_id, kind, ref_id),
        INDEX idx_inv_notif_unseen (user_id, seen),
        CONSTRAINT fk_inv_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Bảng invite_notifications sẵn sàng');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS app_events (
        id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id    INT UNSIGNED DEFAULT NULL,
        name       VARCHAR(64) NOT NULL,
        props      LONGTEXT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_app_events_name_time (name, created_at),
        INDEX idx_app_events_user (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Bảng app_events sẵn sàng');

    console.log('--- Hoàn tất Migration Bạn bè & Thưởng mời bạn! ---');
  } catch (err) {
    console.error('Migration Bạn bè & Thưởng mời bạn thất bại:', err);
    process.exitCode = 1;
  } finally {
    if (conn) conn.release();
    try { await pool.end(); } catch {}
  }
}

run();
