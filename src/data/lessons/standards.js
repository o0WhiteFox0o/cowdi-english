// ════════════════════════════════════════════════════════════════
// STANDARDS — phân loại bài học theo các chuẩn trình độ
// CEFR (A1→C2), IELTS, TOEIC, VSTEP
// Mỗi bài học có thể thuộc nhiều chuẩn cùng lúc.
// File này được viết tay — split-lessons.mjs sẽ KHÔNG ghi đè.
// ════════════════════════════════════════════════════════════════

export const STANDARDS = [
  {
    id: 'cefr',
    label: 'CEFR',
    icon: '🌐',
    description: 'Khung tham chiếu chung châu Âu',
    bands: [
      { id: 'A1', label: 'A1 – Khởi đầu',     color: '#4CAF50' },
      { id: 'A2', label: 'A2 – Sơ cấp',        color: '#8BC34A' },
      { id: 'B1', label: 'B1 – Trung cấp',     color: '#FFC107' },
      { id: 'B2', label: 'B2 – Trung cao cấp', color: '#FF9800' },
      { id: 'C1', label: 'C1 – Cao cấp',       color: '#FF5722' },
      { id: 'C2', label: 'C2 – Thành thạo',    color: '#F44336' },
    ],
  },
  {
    id: 'ielts',
    label: 'IELTS',
    icon: '🎓',
    description: 'International English Language Testing System',
    bands: [
      { id: '3.0-4.0', label: 'Band 3.0 – 4.0',  color: '#4CAF50' },
      { id: '4.5-5.5', label: 'Band 4.5 – 5.5',  color: '#FFC107' },
      { id: '6.0-7.0', label: 'Band 6.0 – 7.0',  color: '#FF9800' },
      { id: '7.5+',    label: 'Band 7.5+',       color: '#F44336' },
    ],
  },
  {
    id: 'toeic',
    label: 'TOEIC',
    icon: '💼',
    description: 'Test of English for International Communication',
    bands: [
      { id: '10-250',  label: '10 – 250',  color: '#4CAF50' },
      { id: '255-495', label: '255 – 495', color: '#8BC34A' },
      { id: '500-695', label: '500 – 695', color: '#FFC107' },
      { id: '700-895', label: '700 – 895', color: '#FF9800' },
      { id: '900-990', label: '900 – 990', color: '#F44336' },
    ],
  },
  {
    id: 'vstep',
    label: 'VSTEP',
    icon: '🇻🇳',
    description: 'Vietnamese Standardized Test of English Proficiency',
    bands: [
      { id: 'B1', label: 'Bậc 3 – B1', color: '#FFC107' },
      { id: 'B2', label: 'Bậc 4 – B2', color: '#FF9800' },
      { id: 'C1', label: 'Bậc 5 – C1', color: '#F44336' },
    ],
  },
];

/**
 * Phân loại 1 bài học vào các chuẩn.
 * Trả về object {cefr, ielts, toeic, vstep} — mỗi trường là band id hoặc null.
 */
export function classifyLesson(lesson) {
  const { id = '', level = '', track = 'general' } = lesson;
  const s = { cefr: null, ielts: null, toeic: null, vstep: null };

  // Override trực tiếp qua các field khai báo (ưu tiên cao nhất)
  if (lesson.cefrLevel)   s.cefr = lesson.cefrLevel;
  if (lesson.ieltsBand)   s.ielts = lesson.ieltsBand;
  if (lesson.toeicBand)   s.toeic = lesson.toeicBand;
  if (lesson.vstepLevel)  s.vstep = lesson.vstepLevel;

  if (track === 'general') {
    // Chủ đề cơ bản → ánh xạ theo level (nếu chưa có cefrLevel override)
    if (!s.cefr) {
      if (level === 'beginner')      s.cefr = 'A1';
      else if (level === 'intermediate') s.cefr = 'A2';
      else                               s.cefr = 'B1';
    }
  } else if (track === 'advanced') {
    // Track C1-C2: cần khai báo cefrLevel; mặc định C1 nếu thiếu
    if (!s.cefr) s.cefr = 'C1';
    if (!s.vstep && s.cefr === 'C1') s.vstep = 'C1';
  } else if (track === 'b1') {
    s.cefr = 'B1';
    s.vstep = 'B1';
  } else if (track === 'b2') {
    s.cefr = 'B2';
    s.vstep = 'B2';
  } else if (track === 'ielts') {
    // Ưu tiên ieltsBand khai báo tường minh trên bài học
    if (lesson.ieltsBand) {
      s.ielts = lesson.ieltsBand;
      if (lesson.ieltsBand === '3.0-4.0')      { s.cefr = 'A2'; }
      else if (lesson.ieltsBand === '4.5-5.5') { s.cefr = 'B1'; s.vstep = 'B1'; }
      else if (lesson.ieltsBand === '6.0-7.0') { s.cefr = 'B2'; s.vstep = 'B2'; }
      else if (lesson.ieltsBand === '7.5+')    { s.cefr = 'C1'; s.vstep = 'C1'; }
    } else if (/-advanced\b|task2|grammar-advanced/.test(id)) {
      // Các bài có hậu tố -advanced hoặc task2 → band cao
      s.ielts = '7.5+';
      s.cefr = 'C1';
      s.vstep = 'C1';
    } else {
      s.ielts = '6.0-7.0';
      s.cefr = 'B2';
      s.vstep = 'B2';
    }
  } else if (track === 'toeic') {
    // Ưu tiên toeicBand khai báo tường minh trên bài học
    if (lesson.toeicBand) {
      s.toeic = lesson.toeicBand;
      if (lesson.toeicBand === '10-250')        { s.cefr = 'A1'; }
      else if (lesson.toeicBand === '255-495')  { s.cefr = 'A2'; }
      else if (lesson.toeicBand === '500-695')  { s.cefr = 'B1'; s.vstep = 'B1'; }
      else if (lesson.toeicBand === '700-895')  { s.cefr = 'B2'; s.vstep = 'B2'; }
      else if (lesson.toeicBand === '900-990')  { s.cefr = 'C1'; s.vstep = 'C1'; }
    } else if (/part34|part6|part7/.test(id)) {
      // Part 3/4 và Part 6/7 là band cao hơn; Part 1/2 & Part 5 và vocab base → band trung
      s.toeic = '700-895';
      s.cefr = 'B2';
    } else {
      s.toeic = '500-695';
      s.cefr = 'B1';
      s.vstep = 'B1';
    }
  }

  return s;
}

/** Thêm trường `standards` vào mỗi lesson */
export function withStandards(lessons) {
  return lessons.map((l) => ({ ...l, standards: classifyLesson(l) }));
}
