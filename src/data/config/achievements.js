// ── Achievements ─────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'first_lesson',  icon: '📖', title: 'Bài học đầu tiên', desc: 'Hoàn thành bài học đầu tiên',          check: (s) => s.lessonsCompleted >= 1  },
  { id: 'five_lessons',  icon: '📚', title: 'Chăm chỉ',         desc: 'Hoàn thành 5 bài học',                 check: (s) => s.lessonsCompleted >= 5  },
  { id: 'first_quiz',    icon: '🎯', title: 'Thử sức',          desc: 'Hoàn thành quiz đầu tiên',             check: (s) => s.quizzesCompleted >= 1  },
  { id: 'perfect_quiz',  icon: '💯', title: 'Hoàn hảo',         desc: 'Đạt điểm tuyệt đối trong 1 quiz',     check: (s) => s.perfectQuizzes >= 1    },
  { id: 'word_master_10',icon: '🃏', title: 'Thu thập từ',      desc: 'Học thuộc 10 từ vựng',                 check: (s) => s.wordsLearned >= 10     },
  { id: 'word_master_50',icon: '📝', title: 'Từ điển sống',     desc: 'Học thuộc 50 từ vựng',                 check: (s) => s.wordsLearned >= 50     },
  { id: 'streak_3',      icon: '🔥', title: 'Bền bỉ',           desc: 'Đạt streak 3 ngày',                   check: (s) => s.streak >= 3            },
  { id: 'streak_7',      icon: '⚡', title: 'Không thể cản',    desc: 'Đạt streak 7 ngày',                   check: (s) => s.streak >= 7            },
  { id: 'xp_100',        icon: '⭐', title: 'Ngôi sao mới',     desc: 'Đạt 100 XP',                          check: (s) => s.totalXP >= 100         },
  { id: 'xp_500',        icon: '🌟', title: 'Siêu sao',         desc: 'Đạt 500 XP',                          check: (s) => s.totalXP >= 500         },
];
