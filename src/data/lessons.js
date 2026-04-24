// Wrapper mỏng — mỗi bài học đã được tách ra thành file riêng trong ./lessons/<track>/
// Giữ file này để các import cũ `../data/lessons` tiếp tục hoạt động.
export {
  LESSONS,
  EXAM_LESSONS,
  ALL_LESSONS,
  EXAM_PATHS,
  QUIZ_BANK,
  TRACKS,
  STANDARDS,
  classifyLesson,
  buildPassage,
  LEVELS,
  UNITS,
  ACHIEVEMENTS,
  COWDI_MESSAGES,
} from './lessons/index.js';
