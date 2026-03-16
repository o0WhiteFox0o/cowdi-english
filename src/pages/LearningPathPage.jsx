import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LESSONS, UNITS, QUIZ_BANK } from '../data/lessons';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { useToast } from '../components/Toast';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build checkpoint questions from unit lessons' vocab + quiz
function buildCheckpointQuestions(unit, count) {
  const lessonIds = unit.lessons;
  const questions = [];

  // Grab quiz questions from lessons in this unit
  for (const lesson of LESSONS) {
    if (lessonIds.includes(lesson.id)) {
      for (const q of lesson.quiz || []) {
        questions.push(q);
      }
    }
  }

  // Also pull from QUIZ_BANK matching unit vocab
  const unitWords = new Set();
  for (const lesson of LESSONS) {
    if (lessonIds.includes(lesson.id)) {
      for (const v of lesson.vocabulary) unitWords.add(v.word.toLowerCase());
    }
  }

  for (const q of [...QUIZ_BANK.vocab, ...QUIZ_BANK.grammar]) {
    const qLower = q.question.toLowerCase();
    for (const w of unitWords) {
      if (qLower.includes(w)) { questions.push(q); break; }
    }
  }

  // Deduplicate by question text and shuffle
  const unique = [];
  const seen = new Set();
  for (const q of questions) {
    if (!seen.has(q.question)) { seen.add(q.question); unique.push(q); }
  }
  return shuffleArray(unique).slice(0, count);
}

export default function LearningPathPage() {
  const { userData, addXP, incrementQuizzes, saveCheckpointScore } = useUser();
  const { addCoins } = usePet();
  const showToast = useToast();

  // Checkpoint test state
  const [testUnit, setTestUnit] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testIdx, setTestIdx] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [testAnswered, setTestAnswered] = useState(null);
  const [testFinished, setTestFinished] = useState(false);

  const lessonMap = useMemo(() => {
    const m = {};
    for (const l of LESSONS) m[l.id] = l;
    return m;
  }, []);

  // Compute unit status
  const unitStatuses = useMemo(() => {
    return UNITS.map((unit, uIdx) => {
      const completedInUnit = unit.lessons.filter((lid) => userData.completedLessons.includes(lid)).length;
      const totalInUnit = unit.lessons.length;
      const allLessonsDone = completedInUnit === totalInUnit;
      const checkpoint = userData.checkpointScores?.[unit.id];
      const passed = checkpoint?.passed || false;

      // Locked if previous unit's checkpoint not passed (unit-1 is always unlocked)
      let locked = false;
      if (uIdx > 0) {
        const prevUnit = UNITS[uIdx - 1];
        const prevCheckpoint = userData.checkpointScores?.[prevUnit.id];
        locked = !prevCheckpoint?.passed;
      }

      return { ...unit, completedInUnit, totalInUnit, allLessonsDone, checkpoint, passed, locked };
    });
  }, [userData.completedLessons, userData.checkpointScores]);

  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  }, []);

  // Start checkpoint test
  function startCheckpoint(unit) {
    const qs = buildCheckpointQuestions(unit, unit.checkpoint.questionCount);
    if (qs.length === 0) return;
    setTestUnit(unit);
    setTestQuestions(qs);
    setTestIdx(0);
    setTestScore(0);
    setTestAnswered(null);
    setTestFinished(false);
  }

  function handleTestAnswer(idx) {
    if (testAnswered !== null) return;
    setTestAnswered(idx);
    const q = testQuestions[testIdx];
    if (idx === q.correct) setTestScore((s) => s + 1);

    setTimeout(() => {
      if (testIdx + 1 < testQuestions.length) {
        setTestIdx((i) => i + 1);
        setTestAnswered(null);
      } else {
        const finalScore = idx === q.correct ? testScore + 1 : testScore;
        const total = testQuestions.length;
        const pct = finalScore / total;
        const passed = pct >= testUnit.checkpoint.passRate;
        saveCheckpointScore(testUnit.id, finalScore, total);
        const xp = finalScore * 10 + (passed ? 50 : 0);
        addXP(xp);
        incrementQuizzes(pct >= 1);
        addCoins(passed ? 30 : 5);
        setTestFinished(true);
        showToast(passed ? `Vượt qua! +${xp} XP 🎉` : `Chưa đạt – cần ≥70%. Cố gắng thêm! 💪`, passed ? 'success' : 'warning');
      }
    }, 1000);
  }

  /* ── Checkpoint test in progress ── */
  if (testUnit && !testFinished) {
    const q = testQuestions[testIdx];
    return (
      <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setTestUnit(null)}>✕ Thoát</button>
          <span className="fw-bold" style={{ color: testUnit.color }}>
            {testUnit.icon} {testUnit.checkpoint.title}
          </span>
          <span className="badge bg-warning text-dark fs-6">⭐ {testScore}/{testQuestions.length}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar" style={{ width: `${((testIdx + 1) / testQuestions.length) * 100}%`, backgroundColor: testUnit.color }}></div>
        </div>

        {q.speak && (
          <div className="text-center mb-3">
            <button className="btn btn-cowdi-primary" onClick={() => speakWord(q.speak)}>🔊 Nghe phát âm</button>
          </div>
        )}

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <span className="text-muted small">Câu {testIdx + 1}/{testQuestions.length}</span>
            <p className="fs-5 fw-bold mb-0 mt-1">{q.question}</p>
          </div>
        </div>

        <div className="row g-2">
          {q.options.map((opt, i) => {
            let cls = 'btn w-100 quiz-option-btn';
            if (testAnswered !== null) {
              cls += i === q.correct ? ' btn-success' : i === testAnswered ? ' btn-danger' : ' btn-outline-secondary';
            } else {
              cls += ' btn-outline-primary';
            }
            return (
              <div className="col-12 col-md-6" key={i}>
                <button className={cls} onClick={() => handleTestAnswer(i)} disabled={testAnswered !== null}>{opt}</button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Checkpoint test results ── */
  if (testUnit && testFinished) {
    const total = testQuestions.length;
    const pct = Math.round((testScore / total) * 100);
    const passed = testScore / total >= testUnit.checkpoint.passRate;
    return (
      <div className="text-center py-5 fade-in">
        <div style={{ fontSize: '5rem' }}>{passed ? '🏆' : '💪'}</div>
        <h2 className="fw-bold mt-3">{testUnit.checkpoint.title}</h2>
        <p className="text-muted">{testUnit.icon} {testUnit.title} – {testUnit.subtitle}</p>
        <div className="display-4 fw-bold my-3" style={{ color: passed ? '#4CAF50' : '#F44336' }}>{testScore}/{total}</div>
        <p className="lead text-muted">{pct}% — {passed ? 'Đạt! Unit tiếp theo đã mở! 🎉' : 'Chưa đạt (cần ≥70%). Ôn lại bài nhé!'}</p>
        <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
          {!passed && (
            <button className="btn btn-cowdi-primary" onClick={() => startCheckpoint(testUnit)}>Làm lại</button>
          )}
          <button className="btn btn-outline-secondary" onClick={() => setTestUnit(null)}>Quay lại lộ trình</button>
        </div>
      </div>
    );
  }

  /* ── Visual Learning Path / Roadmap ── */
  return (
    <div className="fade-in">
      <div className="text-center mb-4">
        <h2 className="fw-bold"><i className="fas fa-route text-cowdi me-2"></i>Lộ trình học tập</h2>
        <p className="text-muted">Hoàn thành từng unit để mở khoá kiến thức mới!</p>
      </div>

      <div className="learning-path" style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
        {/* Vertical connector line */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #4CAF50, #F44336)', borderRadius: 2, transform: 'translateX(-50%)', zIndex: 0 }}></div>

        {unitStatuses.map((unit, uIdx) => {
          const isEven = uIdx % 2 === 0;
          return (
            <div key={unit.id} className="position-relative mb-5" style={{ zIndex: 1 }}>
              {/* Unit node on the timeline */}
              <div
                className="d-flex align-items-start gap-3"
                style={{ flexDirection: isEven ? 'row' : 'row-reverse' }}
              >
                {/* Card side */}
                <div style={{ flex: 1 }}>
                  <div
                    className={`card shadow-sm ${unit.locked ? 'opacity-50' : ''} ${unit.passed ? 'border-success border-2' : ''}`}
                    style={{ borderLeft: unit.locked ? '' : `4px solid ${unit.color}` }}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="fs-3 me-2">{unit.icon}</span>
                          <h5 className="d-inline fw-bold">{unit.title}</h5>
                          {unit.locked && <span className="badge bg-secondary ms-2">🔒 Khoá</span>}
                          {unit.passed && <span className="badge bg-success ms-2">✅ Đã qua</span>}
                        </div>
                        <span className="text-muted small">{unit.completedInUnit}/{unit.totalInUnit} bài</span>
                      </div>
                      <p className="text-muted small mb-3">{unit.subtitle}</p>

                      {/* Lesson progress */}
                      <div className="progress mb-3" style={{ height: 8 }}>
                        <div
                          className="progress-bar"
                          style={{ width: `${(unit.completedInUnit / unit.totalInUnit) * 100}%`, backgroundColor: unit.color }}
                        ></div>
                      </div>

                      {/* Lesson chips */}
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {unit.lessons.map((lid) => {
                          const lesson = lessonMap[lid];
                          if (!lesson) return null;
                          const done = userData.completedLessons.includes(lid);
                          return (
                            <Link
                              key={lid}
                              to={unit.locked ? '#' : `/lessons/${lid}`}
                              className={`badge text-decoration-none ${done ? 'bg-success' : unit.locked ? 'bg-secondary' : 'bg-light text-dark border'}`}
                              style={{ fontSize: '0.8rem', cursor: unit.locked ? 'not-allowed' : 'pointer' }}
                              onClick={(e) => unit.locked && e.preventDefault()}
                            >
                              {lesson.icon} {lesson.title} {done && '✓'}
                            </Link>
                          );
                        })}
                      </div>

                      {/* Checkpoint button */}
                      {!unit.locked && (
                        <div>
                          {unit.checkpoint && (
                            <button
                              className={`btn btn-sm w-100 fw-bold ${unit.passed ? 'btn-outline-success' : unit.allLessonsDone ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
                              onClick={() => startCheckpoint(unit)}
                              disabled={!unit.allLessonsDone && !unit.passed}
                            >
                              {unit.passed
                                ? `✅ Đã đạt ${unit.checkpoint?.score !== undefined ? `(${userData.checkpointScores?.[unit.id]?.score}/${userData.checkpointScores?.[unit.id]?.total})` : ''} – Làm lại?`
                                : unit.allLessonsDone
                                  ? `📝 ${unit.checkpoint.title}`
                                  : `🔒 Hoàn thành ${unit.totalInUnit} bài để mở kiểm tra`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center dot */}
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  style={{
                    width: 48, height: 48,
                    backgroundColor: unit.locked ? '#adb5bd' : unit.passed ? '#4CAF50' : unit.color,
                    color: '#fff', fontSize: '1.3rem', fontWeight: 'bold',
                    border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    position: 'relative', zIndex: 2,
                  }}
                >
                  {unit.locked ? '🔒' : unit.passed ? '✅' : uIdx + 1}
                </div>

                {/* Spacer for the other side */}
                <div style={{ flex: 1 }}></div>
              </div>
            </div>
          );
        })}

        {/* Finish badge */}
        <div className="text-center position-relative" style={{ zIndex: 1 }}>
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto"
            style={{
              width: 64, height: 64,
              background: unitStatuses.every((u) => u.passed) ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#e9ecef',
              fontSize: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            }}
          >
            {unitStatuses.every((u) => u.passed) ? '🏆' : '🎯'}
          </div>
          <p className="text-muted small mt-2">
            {unitStatuses.every((u) => u.passed) ? 'Hoàn thành tất cả! Bạn thật xuất sắc! 🎉' : 'Hoàn thành tất cả unit để đạt thành tích!'}
          </p>
        </div>
      </div>
    </div>
  );
}
