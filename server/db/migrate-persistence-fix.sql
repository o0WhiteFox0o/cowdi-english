-- ============================================================
--  Cowdi English – Migration: Add SRS + Checkpoint columns
--  Run this on existing database to add missing columns
--  Compatible with MySQL 5.5+
-- ============================================================

USE cowdi_english;

-- Add srs_data column for Spaced Repetition data
ALTER TABLE user_progress
  ADD COLUMN srs_data LONGTEXT DEFAULT NULL
  COMMENT 'SRS SM-2 repetition data per word'
  AFTER daily_date;

-- Add checkpoint_scores column for Learning Path scores
ALTER TABLE user_progress
  ADD COLUMN checkpoint_scores LONGTEXT DEFAULT NULL
  COMMENT 'Learning path checkpoint scores per unit'
  AFTER srs_data;
