/**
 * Registry màn học cho React (kết hợp metadata thuần JS từ catalog.js + Component JSX).
 * Chuẩn gốc: STD-SCREEN-SYSTEM-v1.0.md §2, PHASE1 §2.
 */

import { SLOTS, SCREEN_CATALOG } from './catalog.js';
import T01Vocab from './focus/T01Vocab.jsx';
import T02Flashcard from './focus/T02Flashcard.jsx';
import T04Reading from './focus/T04Reading.jsx';
import T05Listen from './focus/T05Listen.jsx';
import T06Speak from './focus/T06Speak.jsx';
import T07Quiz from './focus/T07Quiz.jsx';
import T08WriteSentence from './focus/T08WriteSentence.jsx';

const COMPONENT_MAP = {
  'T-01': T01Vocab,
  'T-02': T02Flashcard,
  'T-04': T04Reading,
  'T-05': T05Listen,
  'T-06': T06Speak,
  'T-07': T07Quiz,
  'T-08': T08WriteSentence,
};

export { SLOTS };

export const SCREENS = SCREEN_CATALOG.map((meta) => ({
  ...meta,
  Component: COMPONENT_MAP[meta.code] || null,
}));

export const getScreen = (code) => SCREENS.find((s) => s.code === code) || null;
