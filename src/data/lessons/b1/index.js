// Auto-generated — danh sách bài học của track "b1"
import { B1_EVERYDAY_LESSON } from './b1-everyday.js';
import { B1_TRAVEL_SERVICES_LESSON } from './b1-travel-services.js';
import { B1_WORK_STUDY_LESSON } from './b1-work-study.js';
import { B1_GRAMMAR_ESSENTIALS_LESSON } from './b1-grammar-essentials.js';
import { B1_READING_WRITING_LESSON } from './b1-reading-writing.js';
import { B1_LISTENING_1_LESSON } from './b1-listening-1.js';
import { B1_LISTENING_2_LESSON } from './b1-listening-2.js';
import { B1_SPEAKING_1_LESSON } from './b1-speaking-1.js';
import { B1_SPEAKING_2_LESSON } from './b1-speaking-2.js';
import { B1_VOCAB_DAILY_LIFE_LESSON } from './b1-vocab-daily-life.js';

export const TRACK_ID = "b1";
export const TRACK_LABEL = "Cambridge B1";
export const TRACK_ICON = "🅱️";

export const LESSONS = [
  B1_EVERYDAY_LESSON,
  B1_TRAVEL_SERVICES_LESSON,
  B1_WORK_STUDY_LESSON,
  B1_GRAMMAR_ESSENTIALS_LESSON,
  B1_READING_WRITING_LESSON,
  B1_LISTENING_1_LESSON,
  B1_LISTENING_2_LESSON,
  B1_SPEAKING_1_LESSON,
  B1_SPEAKING_2_LESSON,
  B1_VOCAB_DAILY_LIFE_LESSON,
].map(l => ({ ...l, track: TRACK_ID }));

export default LESSONS;
