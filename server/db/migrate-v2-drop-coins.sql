-- ============================================================
--  Cowdi English – Kinh tế v2: Di trú Nền tảng & Bỏ Coins (D12)
--  Idempotent — chạy lại an toàn, không làm mất/trùng dữ liệu.
-- ============================================================

-- ── 1. Bảng wallet_ledger ────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_ledger (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  currency    ENUM('milk','gem','stone','stone_shard') NOT NULL,
  amount      INT NOT NULL COMMENT 'dương = nhận, âm = tiêu',
  reason      VARCHAR(40) NOT NULL COMMENT 'lesson_first, lesson_milestone, unit_complete, unit_perfect, stone_exchange, shard_combine, evolve, coin_migration, purchase, migration, admin…',
  ref_id      VARCHAR(64) DEFAULT NULL COMMENT 'lessonId, unitId, petInstanceId, orderId…',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_currency (user_id, currency),
  UNIQUE KEY uq_grant (user_id, currency, reason, ref_id),
  CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Di trú Sữa người chơi cũ: legacy_spent ─────────────────
INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
SELECT
  user_id,
  'milk',
  -(CAST(total_xp AS SIGNED) - CAST(available_xp AS SIGNED)),
  'migration',
  'legacy_spent'
FROM user_progress
WHERE CAST(total_xp AS SIGNED) > CAST(available_xp AS SIGNED)
  AND (CAST(total_xp AS SIGNED) - CAST(available_xp AS SIGNED)) > 0;

-- ── 3. Di trú Coins → Sữa (1 coin = 3 Sữa, D12) ───────────────
INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
SELECT
  user_id,
  'milk',
  CAST(JSON_UNQUOTE(JSON_EXTRACT(pet_data, '$.coins')) AS SIGNED) * 3,
  'coin_migration',
  'v2_drop_coins'
FROM user_progress
WHERE pet_data IS NOT NULL
  AND JSON_VALID(pet_data)
  AND JSON_EXTRACT(pet_data, '$.coins') IS NOT NULL
  AND CAST(JSON_UNQUOTE(JSON_EXTRACT(pet_data, '$.coins')) AS SIGNED) > 0;
