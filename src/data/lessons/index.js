// Auto-generated — tổng hợp toàn bộ bài học
import { LESSONS as GENERAL_LESSONS } from './general/index.js';
import { LESSONS as IELTS_LESSONS } from './ielts/index.js';
import { LESSONS as B1_LESSONS } from './b1/index.js';
import { LESSONS as B2_LESSONS } from './b2/index.js';
import { LESSONS as TOEIC_LESSONS } from './toeic/index.js';
import { LESSONS as ADVANCED_LESSONS } from './advanced/index.js';
import { withStandards, STANDARDS, classifyLesson } from './standards.js';
import { withReading } from './reading.js';

export { EXAM_PATHS } from './paths.js';
export { QUIZ_BANK } from './quiz-bank.js';
export { STANDARDS, classifyLesson } from './standards.js';
export { buildPassage } from './reading.js';

// Re-export configs (giữ các import cũ vẫn hoạt động)
export { LEVELS } from '../config/levels.js';
export { UNITS } from '../config/units.js';
export { ACHIEVEMENTS } from '../config/achievements.js';
export { COWDI_MESSAGES } from '../config/messages.js';

// Track metadata (dùng cho UI filter/tab)
export const TRACKS = [
  { id: "general", label: "Chủ đề tổng hợp", icon: "📚" },
  { id: "ielts", label: "IELTS", icon: "🎓" },
  { id: "b1", label: "Cambridge B1", icon: "🅱️" },
  { id: "b2", label: "Cambridge B2", icon: "🇬🇧" },
  { id: "toeic", label: "TOEIC", icon: "💼" },
  { id: "advanced", label: "Nâng cao C1–C2", icon: "🏆" },
];

// LESSONS = chỉ các bài chủ đề chung (tương thích import cũ)
export const LESSONS = withReading(withStandards(GENERAL_LESSONS));

// EXAM_LESSONS = các bài luyện thi (tương thích import cũ)
export const EXAM_LESSONS = withReading(withStandards([
  ...IELTS_LESSONS,
  ...B1_LESSONS,
  ...B2_LESSONS,
  ...TOEIC_LESSONS,
  ...ADVANCED_LESSONS,
]));

// Tất cả bài học (general + exam), dùng cho filter tổng
export const ALL_LESSONS = [...LESSONS, ...EXAM_LESSONS];
