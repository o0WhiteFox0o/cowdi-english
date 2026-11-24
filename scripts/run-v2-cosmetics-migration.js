/**
 * scripts/run-v2-cosmetics-migration.js
 * Runner chạy an toàn migration GĐ4: Đồ trang trí (bảng owned_cosmetics)
 * Tương thích MySQL 5.5 / 5.6+ và 8.0, an toàn khi chạy lại nhiều lần (idempotent)
 */
import pool from '../server/config/database.js';

async function run() {
  console.log('--- Bắt đầu Migration GĐ4: Đồ trang trí (owned_cosmetics) ---');
  let conn;
  try {
    conn = await pool.getConnection();

    // 1. Tạo bảng owned_cosmetics
    await conn.query(`
      CREATE TABLE IF NOT EXISTS owned_cosmetics (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        cosmetic_id VARCHAR(64) NOT NULL,
        category VARCHAR(32) NOT NULL,
        currency VARCHAR(16) NOT NULL DEFAULT 'milk',
        price_paid INT UNSIGNED NOT NULL DEFAULT 0,
        acquired_from VARCHAR(32) NOT NULL DEFAULT 'shop',
        created_at DATETIME DEFAULT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_cosmetic (user_id, cosmetic_id),
        INDEX idx_cosmetics_user_cat (user_id, category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Bảng owned_cosmetics đã sẵn sàng.');

    // 2. Di trú dữ liệu đồ đã mua cũ từ pet_data của người dùng
    const [users] = await conn.query('SELECT user_id, pet_data FROM user_progress WHERE pet_data IS NOT NULL');
    let migratedCount = 0;

    for (const u of users) {
      if (!u.pet_data) continue;
      let petDataObj = null;
      try {
        petDataObj = typeof u.pet_data === 'string' ? JSON.parse(u.pet_data) : u.pet_data;
      } catch {
        continue;
      }

      const ownedItems = Array.isArray(petDataObj?.ownedItems) ? petDataObj.ownedItems : [];
      // Cũng kiểm tra các món đang trang bị trên pet
      const collection = petDataObj?.collection || {};
      for (const pet of Object.values(collection)) {
        if (pet?.cosmetics) {
          for (const itemId of Object.values(pet.cosmetics)) {
            if (itemId && !ownedItems.includes(itemId)) {
              ownedItems.push(itemId);
            }
          }
        }
      }

      for (const itemId of ownedItems) {
        if (!itemId || typeof itemId !== 'string') continue;
        const category = itemId.startsWith('room_')
          ? 'room'
          : itemId.startsWith('effect_')
          ? 'effect'
          : itemId.startsWith('hat_')
          ? 'hat'
          : itemId.startsWith('outfit_')
          ? 'outfit'
          : 'misc';

        await conn.query(
          `INSERT IGNORE INTO owned_cosmetics (user_id, cosmetic_id, category, currency, price_paid, acquired_from, created_at)
           VALUES (?, ?, ?, 'legacy', 0, 'legacy_migration', NOW())`,
          [u.user_id, itemId, category]
        );
        migratedCount++;
      }
    }

    console.log(`✓ Đã kiểm tra và đồng bộ an toàn ${migratedCount} lượt đồ trang trí sang owned_cosmetics.`);
    console.log('--- Migration GĐ4 hoàn thành thành công! ---');
  } catch (err) {
    console.error('Lỗi khi chạy migration GĐ4:', err);
    process.exitCode = 1;
  } finally {
    if (conn) conn.release();
    try {
      await pool.end();
    } catch {}
  }
}

run();
