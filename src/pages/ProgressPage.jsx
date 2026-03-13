import { useMemo } from 'react';
import { useUser } from '../hooks/useUser';
import { ACHIEVEMENTS, LEVELS, LESSONS } from '../data/lessons';

export default function ProgressPage() {
  const { userData } = useUser();

  const level = useMemo(() => {
    let cur = LEVELS[0];
    for (const l of LEVELS) {
      if (userData.totalXP >= l.xpRequired) cur = l;
      else break;
    }
    return cur;
  }, [userData.totalXP]);

  const nextLevel = LEVELS.find((l) => l.xpRequired > userData.totalXP);
  const progress = nextLevel
    ? ((userData.totalXP - level.xpRequired) / (nextLevel.xpRequired - level.xpRequired)) * 100
    : 100;

  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
        date:    d.getDate(),
        active:  userData.activeDays.includes(d.toDateString()),
        isToday: i === 0,
      });
    }
    return days;
  }, [userData.activeDays]);

  const allWords = useMemo(() => LESSONS.flatMap((l) => l.vocabulary), []);
  const wordStats = useMemo(() => {
    const learned  = Object.values(userData.wordStatus).filter((s) => s === 'learned').length;
    const learning = Object.values(userData.wordStatus).filter((s) => s === 'learning').length;
    return { total: allWords.length, learned, learning, new: allWords.length - learned - learning };
  }, [allWords, userData.wordStatus]);

  return (
    <div className="fade-in">
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <i className="fas fa-chart-line text-cowdi me-2"></i>Tiến trình học tập
        </h2>
      </div>

      {/* Level */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">🏆 Cấp độ</h5>
          <div className="d-flex align-items-center gap-3">
            <div className="level-badge-lg">Lv.{level.level}</div>
            <div className="flex-grow-1">
              <div className="fw-bold mb-1">{level.title}</div>
              <div className="progress" style={{ height: '12px' }}>
                <div
                  className="progress-bar progress-bar-cowdi"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <small className="text-muted d-block mt-1">
                {userData.totalXP} / {nextLevel ? nextLevel.xpRequired : level.xpRequired} XP
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">🔥 Streak: {userData.streak} ngày</h5>
          <div className="streak-calendar">
            {calendarDays.map((d, i) => (
              <div
                key={i}
                className={`calendar-day ${d.active ? 'active' : ''} ${d.isToday ? 'today' : ''}`}
                title={d.active ? 'Đã học' : 'Chưa học'}
              >
                {d.date}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="row g-3 mb-4">
        {[
          { icon: '⭐', value: userData.totalXP,          label: 'Tổng XP' },
          { icon: '📚', value: userData.lessonsCompleted,  label: 'Bài đã hoàn thành' },
          { icon: '🎯', value: userData.quizzesCompleted,  label: 'Quiz đã làm' },
          { icon: '💯', value: userData.perfectQuizzes,    label: 'Quiz hoàn hảo' },
        ].map((s, i) => (
          <div className="col-6 col-md-3" key={i}>
            <div className="card text-center shadow-sm h-100">
              <div className="card-body py-3">
                <div className="fs-3 mb-1">{s.icon}</div>
                <div className="fs-2 fw-bold text-cowdi-primary">{s.value}</div>
                <div className="text-muted small">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vocabulary stats */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">🃏 Từ vựng ({wordStats.total} từ)</h5>
          <div className="vocab-stat-bar">
            <div
              className="vocab-bar-fill learned"
              style={{ width: `${(wordStats.learned / wordStats.total) * 100}%` }}
            >
              {wordStats.learned > 0 && `✅ ${wordStats.learned}`}
            </div>
            <div
              className="vocab-bar-fill learning"
              style={{ width: `${(wordStats.learning / wordStats.total) * 100}%` }}
            >
              {wordStats.learning > 0 && `📝 ${wordStats.learning}`}
            </div>
            <div
              className="vocab-bar-fill new"
              style={{ width: `${(wordStats.new / wordStats.total) * 100}%` }}
            >
              {wordStats.new > 0 && `🆕 ${wordStats.new}`}
            </div>
          </div>
          <div className="d-flex gap-4 flex-wrap small text-muted">
            <span>✅ Đã thuộc: {wordStats.learned}</span>
            <span>📝 Đang học: {wordStats.learning}</span>
            <span>🆕 Chưa học: {wordStats.new}</span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            🏅 Thành tích ({userData.achievements.length}/{ACHIEVEMENTS.length})
          </h5>
          <div className="row g-2">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = userData.achievements.includes(ach.id);
              return (
                <div className="col-12 col-md-6" key={ach.id}>
                  <div className={`d-flex align-items-center gap-3 rounded p-3 ${unlocked ? 'bg-warning bg-opacity-10 border border-warning' : 'bg-light opacity-50'}`}>
                    <div className="fs-3">{unlocked ? ach.icon : '🔒'}</div>
                    <div>
                      <div className="fw-bold small">{ach.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>{ach.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
