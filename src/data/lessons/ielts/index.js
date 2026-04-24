// Auto-generated — danh sách bài học của track "ielts"
import { IELTS_FOUNDATION_VOCAB_LESSON } from './ielts-foundation-vocab.js';
import { IELTS_FOUNDATION_LISTENING_LESSON } from './ielts-foundation-listening.js';
import { IELTS_FOUNDATION_SPEAKING_LESSON } from './ielts-foundation-speaking.js';
import { IELTS_PRE_VOCAB_LESSON } from './ielts-pre-vocab.js';
import { IELTS_PRE_WRITING_LESSON } from './ielts-pre-writing.js';
import { IELTS_PRE_READING_LESSON } from './ielts-pre-reading.js';
import { IELTS_ACADEMIC_VOCAB_LESSON } from './ielts-academic-vocab.js';
import { IELTS_LISTENING_LESSON } from './ielts-listening.js';
import { IELTS_READING_LESSON } from './ielts-reading.js';
import { IELTS_WRITING_LESSON } from './ielts-writing.js';
import { IELTS_SPEAKING_LESSON } from './ielts-speaking.js';
import { IELTS_VOCAB_ENVIRONMENT_LESSON } from './ielts-vocab-environment.js';
import { IELTS_VOCAB_EDUCATION_LESSON } from './ielts-vocab-education.js';
import { IELTS_VOCAB_HEALTH_LESSON } from './ielts-vocab-health.js';
import { IELTS_GRAMMAR_ADVANCED_LESSON } from './ielts-grammar-advanced.js';
import { IELTS_TASK1_PRACTICE_LESSON } from './ielts-task1-practice.js';
import { IELTS_TASK2_ESSAYS_LESSON } from './ielts-task2-essays.js';
import { IELTS_SPEAKING_ADVANCED_LESSON } from './ielts-speaking-advanced.js';
import { IELTS_LISTENING_ADVANCED_LESSON } from './ielts-listening-advanced.js';
import { IELTS_READING_ADVANCED_LESSON } from './ielts-reading-advanced.js';

export const TRACK_ID = "ielts";
export const TRACK_LABEL = "IELTS";
export const TRACK_ICON = "🎓";

export const LESSONS = [
  // Band 3.0 – 4.0 (Foundation)
  IELTS_FOUNDATION_VOCAB_LESSON,
  IELTS_FOUNDATION_LISTENING_LESSON,
  IELTS_FOUNDATION_SPEAKING_LESSON,
  // Band 4.5 – 5.5 (Pre-Intermediate)
  IELTS_PRE_VOCAB_LESSON,
  IELTS_PRE_WRITING_LESSON,
  IELTS_PRE_READING_LESSON,
  // Band 6.0 – 7.0 (Intermediate)
  IELTS_ACADEMIC_VOCAB_LESSON,
  IELTS_LISTENING_LESSON,
  IELTS_READING_LESSON,
  IELTS_WRITING_LESSON,
  IELTS_SPEAKING_LESSON,
  IELTS_VOCAB_ENVIRONMENT_LESSON,
  IELTS_VOCAB_EDUCATION_LESSON,
  IELTS_VOCAB_HEALTH_LESSON,
  // Band 7.5+ (Advanced)
  IELTS_GRAMMAR_ADVANCED_LESSON,
  IELTS_TASK1_PRACTICE_LESSON,
  IELTS_TASK2_ESSAYS_LESSON,
  IELTS_SPEAKING_ADVANCED_LESSON,
  IELTS_LISTENING_ADVANCED_LESSON,
  IELTS_READING_ADVANCED_LESSON,
].map(l => ({ ...l, track: TRACK_ID }));

export default LESSONS;
