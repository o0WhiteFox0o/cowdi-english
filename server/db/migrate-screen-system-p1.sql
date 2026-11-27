-- Migration: Hệ thống Màn học Đợt 1 (STD-SCREEN-SYSTEM v1.0 / PHASE1 §6)
-- Tương thích MySQL 5.5 / 5.6+ (dùng LONGTEXT, không dùng JSON, không dùng USE <db>;)
-- Chạy an toàn idempotent qua: node scripts/run-screen-system-p1-migration.js

ALTER TABLE user_progress
  ADD COLUMN lesson_mix_log LONGTEXT DEFAULT NULL COMMENT 'Screen System P1: 30 lessonMixLog entries JSON',
  ADD COLUMN last_mix LONGTEXT DEFAULT NULL COMMENT 'Screen System P1: lastMix map by slot JSON';
