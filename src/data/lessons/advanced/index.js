// Auto-generated — danh sách bài học của track "advanced" (C1 – C2)
import { ADV_C1_ACADEMIC_VOCAB_LESSON } from './adv-c1-academic-vocab.js';
import { ADV_C1_WRITING_ESSAYS_LESSON } from './adv-c1-writing-essays.js';
import { ADV_C1_LISTENING_LESSON } from './adv-c1-listening.js';
import { ADV_C1_CRITICAL_THINKING_LESSON } from './adv-c1-critical-thinking.js';
import { ADV_C1_PRESENTATIONS_LESSON } from './adv-c1-presentations.js';
import { ADV_C1_RESEARCH_PAPER_LESSON } from './adv-c1-research-paper.js';
import { ADV_C1_ABSTRACT_TOPICS_LESSON } from './adv-c1-abstract-topics.js';
import { ADV_C1_PARAPHRASING_LESSON } from './adv-c1-paraphrasing.js';
import { ADV_C1_SUMMARIZING_LESSON } from './adv-c1-summarizing.js';
import { ADV_C1_PHRASAL_VERBS_LESSON } from './adv-c1-phrasal-verbs.js';
import { ADV_C1_COLLOCATIONS_LESSON } from './adv-c1-collocations.js';
import { ADV_C1_REGISTER_LESSON } from './adv-c1-register.js';
import { ADV_C1_COMPLEX_GRAMMAR_LESSON } from './adv-c1-complex-grammar.js';

import { ADV_C2_IDIOMS_LESSON } from './adv-c2-idioms.js';
import { ADV_C2_DEBATE_LESSON } from './adv-c2-debate.js';
import { ADV_C2_LITERARY_LESSON } from './adv-c2-literary.js';
import { ADV_C2_RHETORIC_LESSON } from './adv-c2-rhetoric.js';
import { ADV_C2_ADVANCED_IDIOMS_LESSON } from './adv-c2-advanced-idioms.js';
import { ADV_C2_SATIRE_IRONY_LESSON } from './adv-c2-satire-irony.js';
import { ADV_C2_PUBLIC_SPEAKING_LESSON } from './adv-c2-public-speaking.js';
import { ADV_C2_ACADEMIC_PUBLISHING_LESSON } from './adv-c2-academic-publishing.js';
import { ADV_C2_FLUENCY_LESSON } from './adv-c2-fluency.js';
import { ADV_C2_CULTURAL_REFS_LESSON } from './adv-c2-cultural-refs.js';
import { ADV_C2_ETYMOLOGY_LESSON } from './adv-c2-etymology.js';
import { ADV_C2_PHILOSOPHY_LESSON } from './adv-c2-philosophy.js';
import { ADV_C2_MASTERY_GRAMMAR_LESSON } from './adv-c2-mastery-grammar.js';

export const TRACK_ID = "advanced";
export const TRACK_LABEL = "Nâng cao C1–C2";
export const TRACK_ICON = "🏆";

export const LESSONS = [
  // CEFR C1 — Foundations (vocab & language)
  ADV_C1_ACADEMIC_VOCAB_LESSON,
  ADV_C1_COLLOCATIONS_LESSON,
  ADV_C1_PHRASAL_VERBS_LESSON,
  ADV_C1_REGISTER_LESSON,
  // CEFR C1 — Skills
  ADV_C1_WRITING_ESSAYS_LESSON,
  ADV_C1_LISTENING_LESSON,
  ADV_C1_PRESENTATIONS_LESSON,
  ADV_C1_PARAPHRASING_LESSON,
  ADV_C1_SUMMARIZING_LESSON,
  // CEFR C1 — Academic & Thinking
  ADV_C1_CRITICAL_THINKING_LESSON,
  ADV_C1_RESEARCH_PAPER_LESSON,
  ADV_C1_ABSTRACT_TOPICS_LESSON,
  ADV_C1_COMPLEX_GRAMMAR_LESSON,

  // CEFR C2 — Idioms & Style
  ADV_C2_IDIOMS_LESSON,
  ADV_C2_ADVANCED_IDIOMS_LESSON,
  ADV_C2_LITERARY_LESSON,
  ADV_C2_CULTURAL_REFS_LESSON,
  // CEFR C2 — Discourse & Rhetoric
  ADV_C2_DEBATE_LESSON,
  ADV_C2_RHETORIC_LESSON,
  ADV_C2_SATIRE_IRONY_LESSON,
  ADV_C2_PUBLIC_SPEAKING_LESSON,
  // CEFR C2 — Mastery
  ADV_C2_FLUENCY_LESSON,
  ADV_C2_ETYMOLOGY_LESSON,
  ADV_C2_PHILOSOPHY_LESSON,
  ADV_C2_ACADEMIC_PUBLISHING_LESSON,
  ADV_C2_MASTERY_GRAMMAR_LESSON,
].map(l => ({ ...l, track: TRACK_ID }));

export default LESSONS;
