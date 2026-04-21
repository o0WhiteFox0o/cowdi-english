-- Migration: Add skill_xp column to user_progress
-- Run once on the production database

ALTER TABLE user_progress
  ADD COLUMN skill_xp LONGTEXT DEFAULT NULL
    COMMENT 'User skill XP: listening/speaking/reading/writing (JSON)';
