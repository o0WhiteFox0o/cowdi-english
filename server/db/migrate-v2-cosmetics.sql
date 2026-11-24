-- ============================================================
-- Cowdi English — Migration Kinh tế v2: Giai đoạn 4 (Đồ trang trí)
-- Tạo bảng owned_cosmetics và đồng bộ đồ đã có từ pet_data
-- Tương thích MySQL 5.5 / 5.6+ và MySQL 8.0 (chạy lại an toàn)
-- ============================================================

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
