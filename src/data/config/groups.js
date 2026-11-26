// ════════════════════════════════════════════════════════════════
// LEARNER GROUPS — Cấu hình 3 nhóm người học (Mới học · Trung bình · Luyện thi)
// Thiết kế: docs/04-design/SDD-LEARNING-GROUPS-v2.0.md §2.1
// ════════════════════════════════════════════════════════════════

export const LEARNER_GROUPS = [
  {
    id: 'beginner',
    title: 'Mới học',
    subtitle: 'Bắt đầu từ con số 0: nhìn hình, nghe và nhắc lại (Pre-A1–A1)',
    icon: 'sprout',
    color: '#7DBE4B',
    paths: ['beginner'],
    defaultPath: 'beginner',
    rules: {
      unitOrder: 'sequential',
      lessonOrder: 'sequential',          // trong unit phải học lần lượt
      lessonFormat: 'picture',            // PictureLesson.jsx; không dùng LESSON_STEPS
      lessonPassRate: 4 / 6,              // thử thách 6 câu, đúng ≥4
      speakScoring: 'none',
      ttsRate: 0.8,
      knownAtPoints: 5,
      maybeForgetDays: 7,
      checkpoint: { questionCount: 10, passRate: 0.7, allowTestOut: false, secondsPerQuestion: null },
      pretest: false,
    },
  },
  {
    id: 'intermediate',
    title: 'Trung bình',
    subtitle: 'Đã biết chút ít, muốn hiểu và dùng được câu (A2–C2)',
    icon: 'tree',
    color: '#4EA8E8',
    paths: ['intermediate', 'advanced'],
    defaultPath: 'intermediate',
    rules: {
      unitOrder: 'sequential',
      lessonOrder: 'free',
      lessonPassRate: 0.7,
      requiredSteps: ['vocab', 'grammar', 'reading', 'quiz'],
      optionalSteps: ['flashcard', 'listen', 'speak'],
      vocabBatchSize: 10,                 // bài 30 từ hiển thị theo nhóm 10
      speakScoring: 'word',               // chấm theo từ như hiện nay, không chặn
      ttsRate: 0.85,
      knownAtPoints: 4,
      maybeForgetDays: 14,
      checkpoint: { questionCount: 15, passRate: 0.7, allowTestOut: true, secondsPerQuestion: null },
      pretest: false,
    },
  },
  {
    id: 'exam',
    title: 'Luyện thi',
    subtitle: 'IELTS · TOEIC · B1 · B2',
    icon: 'medal',
    color: '#D32F2F',
    paths: ['ielts', 'toeic', 'b1', 'b2'],
    defaultPath: null,                    // bắt buộc chọn kỳ thi
    rules: {
      unitOrder: 'required-then-free',    // các unit trong path.requiredUnits học lần lượt, sau đó tuỳ chọn
      lessonOrder: 'free',
      lessonPassRate: 0.75,
      requiredSteps: ['quiz'],
      optionalSteps: ['vocab', 'flashcard', 'grammar', 'reading', 'listen', 'speak'],
      vocabBatchSize: null,
      speakScoring: 'phoneme',            // tạm fallback chấm theo từ ≥70% khi chưa có Azure API
      pronPassRate: { examPron: 70, speaking: 60 },
      ttsRate: 0.95,
      knownAtPoints: 3,
      maybeForgetDays: 14,
      checkpoint: { questionCount: 15, passRate: 0.75, allowTestOut: true, secondsPerQuestion: 45 },
      pretest: true,                      // "Làm thử trước"
    },
  },
];

export const getGroup = (id) => LEARNER_GROUPS.find((g) => g.id === id) || null;
export const getGroupOfPath = (pathId) => LEARNER_GROUPS.find((g) => g.paths.includes(pathId)) || null;
