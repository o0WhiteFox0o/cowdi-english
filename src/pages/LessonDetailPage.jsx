import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LESSONS } from '../data/lessons';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { useToast } from '../components/Toast';

/* ── Tiny helpers ────────────────────────────────── */

function playCorrectSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);    // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
  } catch (_) { /* silent fallback */ }
}

function playWrongSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (_) { /* silent fallback */ }
}

function playCelebrationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch (_) { /* silent fallback */ }
}

/** Spawn emoji confetti particles */
function spawnConfetti(containerRef) {
  if (!containerRef.current) return;
  const emojis = ['🎉', '⭐', '🌟', '✨', '🐮', '💯', '🎊'];
  for (let i = 0; i < 18; i++) {
    const span = document.createElement('span');
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.className = 'confetti-particle';
    span.style.left = `${Math.random() * 100}%`;
    span.style.animationDelay = `${Math.random() * 0.5}s`;
    span.style.fontSize = `${1 + Math.random() * 1.2}rem`;
    containerRef.current.appendChild(span);
    setTimeout(() => span.remove(), 1800);
  }
}

/* ── Component ───────────────────────────────────── */

export default function LessonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData, addXP, markLessonCompleted, incrementQuizzes, setWordStatus, getWordStatus } = useUser();
  const { onLessonComplete, addCoins } = usePet();
  const showToast = useToast();
  const lesson = LESSONS.find((l) => l.id === id);

  const confettiRef = useRef(null);

  // Tabs: vocab, flashcard, grammar, speak, quiz
  const [tab, setTab] = useState('vocab');
  const [quizMode, setQuizMode] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [finished, setFinished] = useState(false);
  const [correctAnim, setCorrectAnim] = useState(false);
  const [wrongAnim, setWrongAnim] = useState(false);

  // Flashcard state
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [fcMastered, setFcMastered] = useState(new Set());

  // Speak-along state
  const [speakIdx, setSpeakIdx] = useState(0);
  const [speakPlaying, setSpeakPlaying] = useState(false);

  const speakWord = useCallback((text, rate = 0.8) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = rate;
      speechSynthesis.speak(u);
    }
  }, []);

  const speakSlow = useCallback((text) => speakWord(text, 0.55), [speakWord]);

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
  const vocab = lesson.vocabulary;

  /* ── speakAlong sentences: combine vocab examples + grammar examples ── */
  const speakSentences = [
    ...vocab.map((v) => ({ en: v.example, vi: v.meaning, label: v.word })),
    ...lesson.grammar.flatMap((g) => g.examples.map((ex) => ({ en: ex.en, vi: ex.vi, label: g.title }))),
  ];

  /* ── Quiz answer handler ── */
  function handleAnswer(idx) {
    if (answered !== null) return;
    setAnswered(idx);
    const isCorrect = idx === quiz[qIndex].correct;
    if (isCorrect) {
      setScore((s) => s + 1);
      setCorrectAnim(true);
      playCorrectSound();
      setTimeout(() => setCorrectAnim(false), 700);
    } else {
      setWrongAnim(true);
      playWrongSound();
      setTimeout(() => setWrongAnim(false), 500);
    }
    setTimeout(() => {
      if (qIndex + 1 < quiz.length) {
        setQIndex((i) => i + 1);
        setAnswered(null);
      } else {
        setFinished(true);
        const finalScore = isCorrect ? score + 1 : score;
        const isPerfect = finalScore === quiz.length;
        const xp = finalScore * 10;
        addXP(xp);
        markLessonCompleted(lesson.id);
        incrementQuizzes(isPerfect);
        onLessonComplete();
        addCoins(10);
        playCelebrationSound();
        spawnConfetti(confettiRef);
        showToast(`+${xp} XP! +10 🪙 Bạn đã hoàn thành bài học! 🎉`, 'success');
      }
    }, 1200);
  }

  function restartQuiz() {
    setQIndex(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
    setCorrectAnim(false);
    setWrongAnim(false);
  }

  /* ── Flashcard helpers ── */
  function fcNext() {
    setFcFlipped(false);
    setTimeout(() => setFcIndex((i) => Math.min(i + 1, vocab.length - 1)), 200);
  }
  function fcPrev() {
    setFcFlipped(false);
    setTimeout(() => setFcIndex((i) => Math.max(i - 1, 0)), 200);
  }
  function fcToggleMastered(word) {
    setFcMastered((prev) => {
      const next = new Set(prev);
      if (next.has(word)) {
        next.delete(word);
        setWordStatus(word, 'learning');
      } else {
        next.add(word);
        setWordStatus(word, 'learned');
        playCorrectSound();
      }
      return next;
    });
  }

  /* ══════════════════════════════════════════
     QUIZ RESULT SCREEN
     ══════════════════════════════════════════ */
  if (quizMode && finished) {
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <div className="text-center py-5 fade-in position-relative" ref={confettiRef}>
        <div className={`quiz-result-icon ${pct >= 80 ? 'bounce-in' : ''}`} style={{ fontSize: '5rem' }}>
          {pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}
        </div>
        <h2 className="fw-bold mt-3">Kết quả</h2>
        <div className="display-4 fw-bold text-cowdi-primary my-3">{score}/{quiz.length}</div>
        <p className="lead text-muted">
          {pct}% — {pct >= 80 ? 'Xuất sắc! Cowdi rất tự hào! 🐮✨' : pct >= 50 ? 'Khá tốt! Cố thêm nhé! 🐮' : 'Cố gắng thêm nhé! Cowdi tin bạn! 🐮💪'}
        </p>
        {pct === 100 && <div className="badge bg-warning text-dark fs-6 mb-3">💯 PERFECT SCORE!</div>}
        <div className="d-flex gap-3 justify-content-center mt-4 flex-wrap">
          <button className="btn btn-cowdi-primary" onClick={restartQuiz}>🔄 Làm lại</button>
          <button className="btn btn-outline-secondary" onClick={() => setQuizMode(false)}>📚 Quay lại bài học</button>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/lessons')}>📋 Danh sách bài</button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     QUIZ IN PROGRESS
     ══════════════════════════════════════════ */
  if (quizMode) {
    const q = quiz[qIndex];
    return (
      <div className="fade-in position-relative" style={{ maxWidth: 680, margin: '0 auto' }} ref={confettiRef}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => { setQuizMode(false); restartQuiz(); }}>
            <i className="fas fa-arrow-left me-1"></i>Thoát
          </button>
          <span className="text-muted fw-bold">Câu {qIndex + 1}/{quiz.length}</span>
          <span className="badge bg-warning text-dark fs-6">⭐ {score}</span>
        </div>
        <div className="progress mb-4" style={{ height: '8px' }}>
          <div
            className="progress-bar progress-bar-cowdi"
            role="progressbar"
            style={{ width: `${((qIndex + 1) / quiz.length) * 100}%` }}
          ></div>
        </div>
        <div className={`card shadow-sm mb-4 ${correctAnim ? 'correct-flash' : ''} ${wrongAnim ? 'wrong-shake' : ''}`}>
          <div className="card-body py-4">
            <p className="fs-5 fw-bold mb-0 text-center">{q.question}</p>
          </div>
        </div>
        <div className="row g-2">
          {q.options.map((opt, i) => {
            let cls = 'btn w-100 quiz-option-btn';
            if (answered !== null) {
              if (i === q.correct) cls += ' btn-success correct-pop';
              else if (i === answered) cls += ' btn-danger wrong-shake';
              else cls += ' btn-outline-secondary';
            } else {
              cls += ' btn-outline-primary';
            }
            return (
              <div className="col-12 col-md-6" key={i}>
                <button className={cls} onClick={() => handleAnswer(i)} disabled={answered !== null}>
                  <span className="me-2 fw-bold text-muted">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              </div>
            );
          })}
        </div>
        {answered !== null && (
          <div className={`text-center mt-3 fw-bold fs-5 fade-in ${answered === q.correct ? 'text-success' : 'text-danger'}`}>
            {answered === q.correct ? '✅ Chính xác! Giỏi lắm!' : `❌ Đáp án đúng: ${q.options[q.correct]}`}
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════
     MAIN LESSON VIEW
     ══════════════════════════════════════════ */
  return (
    <div className="fade-in position-relative" ref={confettiRef}>
      {/* Header */}
      <div className="card shadow-sm mb-4">
        <div className={`card-header-level ${lesson.level}`}></div>
        <div className="card-body">
          <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate('/lessons')}>
            <i className="fas fa-arrow-left me-1"></i>Quay lại
          </button>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span style={{ fontSize: '2.5rem' }}>{lesson.icon}</span>
            <div>
              <h2 className="fw-bold mb-1">{lesson.title}</h2>
              <p className="text-muted mb-1">{lesson.description}</p>
              <span className={`badge badge-level-${lesson.level}`}>{lesson.level === 'beginner' ? '🟢 Cơ bản' : lesson.level === 'intermediate' ? '🟡 Trung cấp' : '🔴 Nâng cao'}</span>
              {userData.completedLessons.includes(lesson.id) && (
                <span className="badge bg-success ms-2">✅ Đã hoàn thành</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'vocab', label: '📝 Từ vựng', variant: 'primary' },
          { key: 'flashcard', label: '🃏 Flashcard', variant: 'primary' },
          { key: 'grammar', label: '📖 Ngữ pháp', variant: 'primary' },
          { key: 'speak', label: '🎤 Nói theo', variant: 'primary' },
        ].map((t) => (
          <button
            key={t.key}
            className={`btn btn-sm ${tab === t.key ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        <button
          className="btn btn-sm btn-warning fw-bold ms-auto"
          onClick={() => { setQuizMode(true); restartQuiz(); }}
        >
          🎯 Làm Quiz
        </button>
      </div>

      {/* ── VOCAB TAB ── */}
      {tab === 'vocab' && (
        <div className="row g-3">
          {vocab.map((v) => {
            const status = getWordStatus(v.word);
            return (
              <div className="col-12 col-md-6" key={v.word}>
                <div className="card shadow-sm h-100 card-hover vocab-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.5rem' }}>{v.illustration || lesson.icon}</span>
                        <div>
                          <h5 className="fw-bold text-cowdi-primary mb-0">{v.word}</h5>
                          <small className="text-muted font-monospace">{v.phonetic}</small>
                        </div>
                      </div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => speakWord(v.word)} title="Nghe phát âm">
                          🔊
                        </button>
                        <button
                          className={`btn btn-sm ${status === 'learned' ? 'btn-success' : status === 'learning' ? 'btn-outline-warning' : 'btn-outline-secondary'}`}
                          onClick={() => setWordStatus(v.word, status === 'learned' ? 'new' : status === 'learning' ? 'learned' : 'learning')}
                          title={status === 'learned' ? 'Đã thuộc' : status === 'learning' ? 'Đang học' : 'Đánh dấu học'}
                        >
                          {status === 'learned' ? '✅' : status === 'learning' ? '📖' : '➕'}
                        </button>
                      </div>
                    </div>
                    <p className="fw-bold mb-1">{v.meaning}</p>
                    <div className="bg-light rounded p-2 d-flex align-items-center gap-2">
                      <small className="fst-italic text-muted flex-grow-1">"{v.example}"</small>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => speakWord(v.example)} title="Nghe ví dụ" style={{ flexShrink: 0 }}>
                        🔊
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── FLASHCARD TAB ── */}
      {tab === 'flashcard' && (
        <div className="d-flex flex-column align-items-center">
          <div className="mb-3 text-muted">
            <span className="fw-bold">{fcIndex + 1}</span> / {vocab.length}
            {fcMastered.size > 0 && <span className="ms-3 text-success fw-bold">✅ {fcMastered.size} đã thuộc</span>}
          </div>
          <div className="flashcard-wrapper" onClick={() => { setFcFlipped(!fcFlipped); if (!fcFlipped) speakWord(vocab[fcIndex].word); }}>
            <div className={`flashcard-inner ${fcFlipped ? 'flipped' : ''}`}>
              <div className="flashcard-front text-center">
                <span style={{ fontSize: '2.5rem' }} className="mb-2">{vocab[fcIndex].illustration || lesson.icon}</span>
                <h2 className="fw-bold mb-1">{vocab[fcIndex].word}</h2>
                <p className="mb-0 opacity-75">{vocab[fcIndex].phonetic}</p>
                <small className="mt-2 opacity-50">👆 Nhấn để lật</small>
              </div>
              <div className="flashcard-back text-center">
                <h3 className="fw-bold text-cowdi-primary mb-2">{vocab[fcIndex].meaning}</h3>
                <p className="fst-italic text-muted mb-0">"{vocab[fcIndex].example}"</p>
              </div>
            </div>
          </div>
          <div className="d-flex gap-3 mt-4 align-items-center flex-wrap justify-content-center">
            <button className="btn btn-outline-secondary" disabled={fcIndex === 0} onClick={fcPrev}>
              <i className="fas fa-chevron-left"></i> Trước
            </button>
            <button
              className={`btn ${fcMastered.has(vocab[fcIndex].word) ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => fcToggleMastered(vocab[fcIndex].word)}
            >
              {fcMastered.has(vocab[fcIndex].word) ? '✅ Đã thuộc' : '✅ Thuộc rồi!'}
            </button>
            <button className="btn btn-outline-secondary" disabled={fcIndex === vocab.length - 1} onClick={fcNext}>
              Tiếp <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <button className="btn btn-sm btn-outline-secondary mt-3" onClick={() => speakWord(vocab[fcIndex].word)} title="Nghe phát âm">
            🔊 Nghe phát âm
          </button>
          {/* Progress dots */}
          <div className="d-flex gap-1 mt-3 flex-wrap justify-content-center">
            {vocab.map((v, i) => (
              <div
                key={i}
                className="rounded-circle"
                style={{
                  width: 12, height: 12, cursor: 'pointer',
                  background: fcMastered.has(v.word) ? '#00B894' : i === fcIndex ? 'var(--cowdi-primary)' : '#ddd',
                  transition: 'background 0.2s',
                }}
                onClick={() => { setFcFlipped(false); setTimeout(() => setFcIndex(i), 150); }}
                title={v.word}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── GRAMMAR TAB ── */}
      {tab === 'grammar' && (
        <div className="row g-3">
          {lesson.grammar.map((g, i) => (
            <div className="col-12" key={i}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title fw-bold text-cowdi-primary">📖 {g.title}</h5>
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

      {/* ── SPEAK ALONG TAB ── */}
      {tab === 'speak' && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card shadow-sm mb-4 bg-cowdi-gradient text-white">
            <div className="card-body text-center py-4">
              <div style={{ fontSize: '3rem' }}>🐮🎤</div>
              <h4 className="fw-bold mt-2">Nói theo Cowdi!</h4>
              <p className="mb-0 opacity-75">Nghe → Nhắc lại → Tự tin nói tiếng Anh!</p>
            </div>
          </div>
          <div className="mb-3 text-center text-muted fw-bold">
            {speakIdx + 1} / {speakSentences.length}
          </div>
          <div className="card shadow-sm mb-3">
            <div className="card-body text-center py-4">
              <div className="badge bg-light text-muted mb-2">{speakSentences[speakIdx].label}</div>
              <h4 className="fw-bold text-cowdi-primary mb-2">{speakSentences[speakIdx].en}</h4>
              <p className="text-muted mb-3">→ {speakSentences[speakIdx].vi}</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button
                  className="btn btn-cowdi-primary btn-lg"
                  onClick={() => { speakWord(speakSentences[speakIdx].en); setSpeakPlaying(true); setTimeout(() => setSpeakPlaying(false), 2000); }}
                >
                  {speakPlaying ? '🔊 Đang phát...' : '🔊 Nghe'}
                </button>
                <button
                  className="btn btn-outline-cowdi btn-lg"
                  onClick={() => speakSlow(speakSentences[speakIdx].en)}
                >
                  🐌 Nghe chậm
                </button>
              </div>
            </div>
          </div>
          <div className="d-flex gap-3 justify-content-center">
            <button className="btn btn-outline-secondary" disabled={speakIdx === 0} onClick={() => setSpeakIdx((i) => i - 1)}>
              <i className="fas fa-chevron-left"></i> Trước
            </button>
            <button className="btn btn-outline-secondary" disabled={speakIdx === speakSentences.length - 1} onClick={() => setSpeakIdx((i) => i + 1)}>
              Tiếp <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          {/* Progress */}
          <div className="progress mt-3" style={{ height: '6px' }}>
            <div className="progress-bar progress-bar-cowdi" style={{ width: `${((speakIdx + 1) / speakSentences.length) * 100}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

