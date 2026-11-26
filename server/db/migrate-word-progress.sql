-- Migration: Flashcard v1.4 — Cột word_progress (điểm nhớ từng từ)
-- Tương thích MySQL 5.5 / 5.6+ (dùng LONGTEXT, không dùng JSON, không dùng USE <db>;)
-- Chạy an toàn idempotent qua: node scripts/run-word-progress-migration.js

ALTER TABLE user_progress
  ADD COLUMN word_progress LONGTEXT DEFAULT NULL COMMENT 'Flashcard v1.4 memory points JSON map';
