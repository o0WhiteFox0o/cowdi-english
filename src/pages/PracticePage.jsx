import { useState, useCallback, useRef, useEffect } from 'react';
import { QUIZ_BANK } from '../data/lessons';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { useToast } from '../components/Toast';

const TYPE_LABELS = {
  vocab:     { icon: '📝', title: 'Từ vựng',   desc: 'Ôn tập từ vựng đã học' },
  grammar:   { icon: '📖', title: 'Ngữ pháp',  desc: 'Kiểm tra kiến thức ngữ pháp' },
  listening: { icon: '🎧', title: 'Nghe hiểu', desc: 'Luyện nghe và nhận diện từ' },
  sentences: { icon: '✍️', title: 'Hoàn thành câu', desc: 'Dịch và điền vào chỗ trống' },
  mixed:     { icon: '🎲', title: 'Tổng hợp',  desc: 'Mix tất cả các loại câu hỏi' },
};

export default function PracticePage() {
  const { addXP, incrementQuizzes } = useUser();
  const { onQuizComplete, addCoins } = usePet();
  const showToast = useToast();

  const [quizType, setQuizType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  }, []);

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startQuiz(type) {
    const bank = type === 'mixed'
      ? [...QUIZ_BANK.vocab, ...QUIZ_BANK.grammar, ...QUIZ_BANK.listening, ...QUIZ_BANK.sentences]
      : QUIZ_BANK[type] || [];
    const picked = shuffleArray(bank).slice(0, 10);
    setQuizType(type);
    setQuestions(picked);
    setQIndex(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
    setTimeLeft(30);
  }

  useEffect(() => {
    if (quizType && !finished && answered === null && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    if (timeLeft === 0 && quizType && !finished && answered === null) {
      handleAnswer(-1);
    }
  }, [timeLeft, quizType, finished, answered]);

  function handleAnswer(idx) {
    if (answered !== null) return;
    setAnswered(idx);
    const q = questions[qIndex];
    if (idx === q.correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (qIndex + 1 < questions.length) {
        setQIndex((i) => i + 1);
        setAnswered(null);
        setTimeLeft(30);
      } else {
        const finalScore = idx === q.correct ? score + 1 : score;
        const isPerfect = finalScore === questions.length;
        const xp = finalScore * 10 + (isPerfect ? 20 : 0);
        addXP(xp);
        incrementQuizzes(isPerfect);
        onQuizComplete(quizType, finalScore, questions.length);
        addCoins(finalScore * 2 + (isPerfect ? 15 : 0));
        setFinished(true);
        showToast(`+${xp} XP! +${finalScore * 2 + (isPerfect ? 15 : 0)} 🪙 ${isPerfect ? 'Hoàn hảo! 💯' : 'Tốt lắm! 🎉'}`, 'success');
      }
    }, 1000);
  }

  /* ── Type selection ── */
  if (!quizType) {
    return (
      <div className="fade-in">
        <div className="text-center mb-4">
          <h2 className="fw-bold">
            <i className="fas fa-pen text-cowdi me-2"></i>Luyện tập
          </h2>
          <p className="text-muted">Chọn loại quiz để bắt đầu!</p>
        </div>

        <div className="row g-3 justify-content-center" style={{ maxWidth: 860, margin: '0 auto' }}>
          {Object.entries(TYPE_LABELS).map(([type, info]) => (
            <div className="col-6 col-md-4" key={type}>
              <div
                className="card text-center card-hover shadow-sm h-100"
                style={{ cursor: 'pointer' }}
                onClick={() => startQuiz(type)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && startQuiz(type)}
              >
                <div className="card-body py-4">
                  <div className="fs-1 mb-2">{info.icon}</div>
                  <h5 className="card-title fw-bold">{info.title}</h5>
                  <p className="card-text text-muted small">{info.desc}</p>
                  <span className="badge bg-light text-secondary">
                    {type === 'mixed' ? 'Ngẫu nhiên' : `${QUIZ_BANK[type]?.length ?? 0} câu hỏi`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Finished ── */
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const xpEarned = score * 10 + (score === questions.length ? 20 : 0);
    return (
      <div className="text-center py-5 fade-in">
        <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="fw-bold mt-3">Kết quả luyện tập</h2>
        <div className="display-4 fw-bold text-cowdi-primary my-3">{score}/{questions.length}</div>
        <p className="lead text-muted">
          {pct}% — {pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Khá tốt!' : 'Cố gắng thêm nhé!'}
        </p>
        <div className="badge bg-warning text-dark fs-5 px-3 py-2 mb-4">+{xpEarned} XP</div>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <button className="btn btn-cowdi-primary" onClick={() => startQuiz(quizType)}>Làm lại</button>
          <button className="btn btn-outline-secondary" onClick={() => setQuizType(null)}>Chọn loại khác</button>
        </div>
      </div>
    );
  }

  /* ── Quiz in progress ── */
  const q = questions[qIndex];
  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuizType(null)}>
          ✕ Thoát
        </button>
        <span className="text-muted">Câu {qIndex + 1}/{questions.length}</span>
        <span className={`badge fs-6 ${timeLeft <= 10 ? 'bg-danger' : 'bg-secondary'}`}>
          ⏱ {timeLeft}s
        </span>
        <span className="badge bg-warning text-dark fs-6">Điểm: {score}</span>
      </div>

      <div className="progress mb-4" style={{ height: '8px' }}>
        <div
          className="progress-bar progress-bar-cowdi"
          role="progressbar"
          style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {q.speak && (
        <div className="text-center mb-3">
          <button className="btn btn-cowdi-primary" onClick={() => speakWord(q.speak)}>
            🔊 Nghe phát âm
          </button>
        </div>
      )}

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

