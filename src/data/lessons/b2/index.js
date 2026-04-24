// Auto-generated — danh sách bài học của track "b2"
import { B2_ADVANCED_TOPICS_LESSON } from './b2-advanced-topics.js';
import { B2_FORMAL_WRITING_LESSON } from './b2-formal-writing.js';
import { B2_ADVANCED_GRAMMAR_LESSON } from './b2-advanced-grammar.js';
import { B2_USE_OF_ENGLISH_LESSON } from './b2-use-of-english.js';
import { B2_READING_COMPREHENSION_LESSON } from './b2-reading-comprehension.js';
import { B2_LISTENING_SKILLS_LESSON } from './b2-listening-skills.js';
import { B2_SPEAKING_PART1_LESSON } from './b2-speaking-part1.js';
import { B2_SPEAKING_PART34_LESSON } from './b2-speaking-part34.js';
import { B2_WRITING_ESSAY_LESSON } from './b2-writing-essay.js';
import { B2_WRITING_REVIEW_REPORT_LESSON } from './b2-writing-review-report.js';
import { B2_VOCAB_COLLOCATIONS_LESSON } from './b2-vocab-collocations.js';

export const TRACK_ID = "b2";
export const TRACK_LABEL = "Cambridge B2";
export const TRACK_ICON = "🇬🇧";

export const LESSONS = [
  B2_ADVANCED_TOPICS_LESSON,
  B2_FORMAL_WRITING_LESSON,
  B2_ADVANCED_GRAMMAR_LESSON,
  B2_USE_OF_ENGLISH_LESSON,
  B2_READING_COMPREHENSION_LESSON,
  B2_LISTENING_SKILLS_LESSON,
  B2_SPEAKING_PART1_LESSON,
  B2_SPEAKING_PART34_LESSON,
  B2_WRITING_ESSAY_LESSON,
  B2_WRITING_REVIEW_REPORT_LESSON,
  B2_VOCAB_COLLOCATIONS_LESSON,
].map(l => ({ ...l, track: TRACK_ID }));

export default LESSONS;
