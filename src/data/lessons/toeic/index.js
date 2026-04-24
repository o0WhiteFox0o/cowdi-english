// Auto-generated — danh sách bài học của track "toeic"
import { TOEIC_BASICS_OFFICE_LESSON } from './toeic-basics-office.js';
import { TOEIC_BASICS_DAILY_LESSON } from './toeic-basics-daily.js';
import { TOEIC_ELEMENTARY_CONVO_LESSON } from './toeic-elementary-convo.js';
import { TOEIC_ELEMENTARY_EMAILS_LESSON } from './toeic-elementary-emails.js';
import { TOEIC_BUSINESS_COMM_LESSON } from './toeic-business-comm.js';
import { TOEIC_LISTENING_READING_LESSON } from './toeic-listening-reading.js';
import { TOEIC_LISTENING_PART12_LESSON } from './toeic-listening-part12.js';
import { TOEIC_LISTENING_PART34_LESSON } from './toeic-listening-part34.js';
import { TOEIC_READING_PART5_LESSON } from './toeic-reading-part5.js';
import { TOEIC_READING_PART6_LESSON } from './toeic-reading-part6.js';
import { TOEIC_READING_PART7_LESSON } from './toeic-reading-part7.js';
import { TOEIC_VOCAB_HR_FINANCE_LESSON } from './toeic-vocab-hr-finance.js';
import { TOEIC_VOCAB_MARKETING_LOGISTICS_LESSON } from './toeic-vocab-marketing-logistics.js';
import { TOEIC_ADVANCED_MEETINGS_LESSON } from './toeic-advanced-meetings.js';
import { TOEIC_ADVANCED_REPORTS_LESSON } from './toeic-advanced-reports.js';

export const TRACK_ID = "toeic";
export const TRACK_LABEL = "TOEIC";
export const TRACK_ICON = "💼";

export const LESSONS = [
  // Band 10 – 250 (Basics)
  TOEIC_BASICS_OFFICE_LESSON,
  TOEIC_BASICS_DAILY_LESSON,
  // Band 255 – 495 (Elementary)
  TOEIC_ELEMENTARY_CONVO_LESSON,
  TOEIC_ELEMENTARY_EMAILS_LESSON,
  // Band 500 – 695 (Intermediate)
  TOEIC_BUSINESS_COMM_LESSON,
  TOEIC_LISTENING_READING_LESSON,
  TOEIC_LISTENING_PART12_LESSON,
  TOEIC_READING_PART5_LESSON,
  TOEIC_VOCAB_HR_FINANCE_LESSON,
  TOEIC_VOCAB_MARKETING_LOGISTICS_LESSON,
  // Band 700 – 895 (Upper-Intermediate)
  TOEIC_LISTENING_PART34_LESSON,
  TOEIC_READING_PART6_LESSON,
  TOEIC_READING_PART7_LESSON,
  // Band 900 – 990 (Advanced)
  TOEIC_ADVANCED_MEETINGS_LESSON,
  TOEIC_ADVANCED_REPORTS_LESSON,
].map(l => ({ ...l, track: TRACK_ID }));

export default LESSONS;
