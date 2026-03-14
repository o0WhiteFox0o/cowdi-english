-- ============================================================
--  Cowdi English – Pet System Migration
--  Chạy 1 lần trên database hiện có để thêm cột pet_data
--  mysql -u root -p cowdi_english < migrate-pet.sql
-- ============================================================

USE cowdi_english;

-- Thêm cột pet_data để lưu toàn bộ dữ liệu pet system
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS pet_data JSON DEFAULT NULL
    COMMENT 'Dữ liệu hệ thống pet (collection, coins, items...)'
  AFTER daily_date;

-- Thêm cột nickname cho leaderboard ẩn danh
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS nickname VARCHAR(20) DEFAULT NULL
    COMMENT 'Nickname cho leaderboard'
  AFTER pet_data;
