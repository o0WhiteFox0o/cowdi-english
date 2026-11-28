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
import F01Slideshow from './friendly/F01Slideshow.jsx';
import F02SpellWord from './friendly/F02SpellWord.jsx';
import F03CatchWord from './friendly/F03CatchWord.jsx';
import F04SpeakBridge from './friendly/F04SpeakBridge.jsx';
import F05FogReading from './friendly/F05FogReading.jsx';
import F06FogBoss from './friendly/F06FogBoss.jsx';
import F07MarketListen from './friendly/F07MarketListen.jsx';
import F08MemoryPairs from './friendly/F08MemoryPairs.jsx';
import F09BoatSentence from './friendly/F09BoatSentence.jsx';
import F10NpcDialog from './friendly/F10NpcDialog.jsx';
import F11TrueFalse from './friendly/F11TrueFalse.jsx';

const COMPONENT_MAP = {
  'T-01': T01Vocab,
  'T-02': T02Flashcard,
  'T-04': T04Reading,
  'T-05': T05Listen,
  'T-06': T06Speak,
  'T-07': T07Quiz,
  'T-08': T08WriteSentence,
  'F-01': F01Slideshow,
  'F-02': F02SpellWord,
  'F-03': F03CatchWord,
  'F-04': F04SpeakBridge,
  'F-05': F05FogReading,
  'F-06': F06FogBoss,
  'F-07': F07MarketListen,
  'F-08': F08MemoryPairs,
  'F-09': F09BoatSentence,
  'F-10': F10NpcDialog,
  'F-11': F11TrueFalse,
};

export { SLOTS };

export const SCREENS = SCREEN_CATALOG.map((meta) => ({
  ...meta,
  Component: COMPONENT_MAP[meta.code] || null,
}));

export const getScreen = (code) => SCREENS.find((s) => s.code === code) || null;
