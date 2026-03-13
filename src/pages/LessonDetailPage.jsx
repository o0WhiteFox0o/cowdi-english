import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LESSONS } from '../data/lessons';
import { useUser } from '../hooks/useUser';
import { useToast } from '../components/Toast';

export default function LessonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData, addXP, markLessonCompleted } = useUser();
  const showToast = useToast();
  const lesson = LESSONS.find((l) => l.id === id);

  const [tab, setTab] = useState('vocab');
  const [quizMode, setQuizMode] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [finished, setFinished] = useState(false);

  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  }, []);

  if (!lesson) {
    return (
      <div className="text-center py-5">
        <h2>Không tìm thấy bài học</h2>
        <button className="btn btn-cowdi-primary mt-3" onClick={() => navigate('/lessons')}>
          Quay lại
        </button>
      </div>
    );
  }

  const quiz = lesson.quiz;

  function handleAnswer(idx) {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === quiz[qIndex].correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (qIndex + 1 < quiz.length) {
        setQIndex((i) => i + 1);
        setAnswered(null);
      } else {
        setFinished(true);
        const finalScore = idx === quiz[qIndex].correct ? score + 1 : score;
        const xp = finalScore * 10;
        addXP(xp);
        markLessonCompleted(lesson.id);
        showToast(`+${xp} XP! Bạn đã hoàn thành bài học! 🎉`, 'success');
      }
    }, 1000);
  }

  function restartQuiz() {
    setQIndex(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
  }

  /* ── Quiz result ── */
  if (quizMode && finished) {
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <div className="text-center py-5 fade-in">
        <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="fw-bold mt-3">Kết quả</h2>
        <div className="display-4 fw-bold text-cowdi-primary my-3">{score}/{quiz.length}</div>
        <p className="lead text-muted">
          {pct}% — {pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Khá tốt!' : 'Cố gắng thêm nhé!'}
        </p>
        <div className="d-flex gap-3 justify-content-center mt-4 flex-wrap">
          <button className="btn btn-cowdi-primary" onClick={restartQuiz}>Làm lại</button>
          <button className="btn btn-outline-secondary" onClick={() => setQuizMode(false)}>Quay lại bài học</button>
        </div>
      </div>
    );
  }

  /* ── Quiz in progress ── */
  if (quizMode) {
    const q = quiz[qIndex];
    return (
      <div className="fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <span className="text-muted">Câu {qIndex + 1}/{quiz.length}</span>
          <span className="badge bg-warning text-dark fs-6">Điểm: {score}</span>
        </div>
        <div className="progress mb-4" style={{ height: '8px' }}>
          <div
            className="progress-bar progress-bar-cowdi"
            role="progressbar"
            style={{ width: `${((qIndex + 1) / quiz.length) * 100}%` }}
          ></div>
        </div>
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <p className="fs-5 fw-bold mb-0">{q.question}</p>
          </div>
        </div>
        <div className="row g-2">
          {q.options.map((opt, i) => {
            let cls = 'btn w-100 quiz-option-btn';
            if (answered !== null) {
              cls += i === q.correct ? ' btn-success' : i === answered ? ' btn-danger' : ' btn-outline-secondary';
            } else {
              cls += ' btn-outline-primary';
            }
            return (
              <div className="col-12 col-md-6" key={i}>
                <button className={cls} onClick={() => handleAnswer(i)} disabled={answered !== null}>
                  {opt}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Lesson detail ── */
  return (
    <div className="fade-in">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate('/lessons')}>
            <i className="fas fa-arrow-left me-1"></i>Quay lại
          </button>
          <h2 className="fw-bold mb-1">{lesson.icon} {lesson.title}</h2>
          {userData.completedLessons.includes(lesson.id) && (
            <span className="badge bg-success">✅ Đã hoàn thành</span>
          )}
        </div>
      </div>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        <button
          className={`btn btn-sm ${tab === 'vocab' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
          onClick={() => setTab('vocab')}
        >
          📝 Từ vựng
        </button>
        <button
          className={`btn btn-sm ${tab === 'grammar' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
          onClick={() => setTab('grammar')}
        >
          📖 Ngữ pháp
        </button>
        <button
          className="btn btn-sm btn-warning fw-bold"
          onClick={() => { setQuizMode(true); restartQuiz(); }}
        >
          🎯 Làm Quiz
        </button>
      </div>

      {tab === 'vocab' && (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Từ vựng</th>
                    <th>Phiên âm</th>
                    <th>Nghĩa</th>
                    <th>Ví dụ</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lesson.vocabulary.map((v) => (
                    <tr key={v.word}>
                      <td className="fw-bold text-cowdi-primary">{v.word}</td>
                      <td className="text-muted font-monospace small">{v.phonetic}</td>
                      <td>{v.meaning}</td>
                      <td className="fst-italic text-muted small">{v.example}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => speakWord(v.word)}
                          title="Nghe phát âm"
                        >
                          🔊
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'grammar' && (
        <div className="row g-3">
          {lesson.grammar.map((g, i) => (
            <div className="col-12" key={i}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title fw-bold text-cowdi-primary">{g.title}</h5>
                  <p className="text-muted">{g.explanation}</p>
                  <div className="d-flex flex-column gap-2">
                    {g.examples.map((ex, j) => (
                      <div key={j} className="bg-light rounded p-3">
                        <div className="fw-bold d-flex align-items-center gap-2 flex-wrap">
                          {ex.en}
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => speakWord(ex.en)}>
                            🔊
                          </button>
                        </div>
                        <div className="text-muted fst-italic small mt-1">→ {ex.vi}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

