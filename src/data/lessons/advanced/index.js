// Auto-generated — danh sách bài học của track "advanced" (C1 – C2)
import { ADV_C1_ACADEMIC_VOCAB_LESSON } from './adv-c1-academic-vocab.js';
import { ADV_C1_WRITING_ESSAYS_LESSON } from './adv-c1-writing-essays.js';
import { ADV_C1_LISTENING_LESSON } from './adv-c1-listening.js';
import { ADV_C2_IDIOMS_LESSON } from './adv-c2-idioms.js';
import { ADV_C2_DEBATE_LESSON } from './adv-c2-debate.js';
import { ADV_C2_LITERARY_LESSON } from './adv-c2-literary.js';

export const TRACK_ID = "advanced";
export const TRACK_LABEL = "Nâng cao C1–C2";
export const TRACK_ICON = "🏆";

export const LESSONS = [
  // CEFR C1
  ADV_C1_ACADEMIC_VOCAB_LESSON,
  ADV_C1_WRITING_ESSAYS_LESSON,
  ADV_C1_LISTENING_LESSON,
  // CEFR C2
  ADV_C2_IDIOMS_LESSON,
  ADV_C2_DEBATE_LESSON,
  ADV_C2_LITERARY_LESSON,
].map(l => ({ ...l, track: TRACK_ID }));

export default LESSONS;
