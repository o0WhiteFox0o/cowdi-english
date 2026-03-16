import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LESSONS } from '../data/lessons';
import { useUser } from '../hooks/useUser';
import { useToast } from '../components/Toast';

// Build a lookup map: word → vocab object (with lesson info)
function buildWordMap() {
  const map = {};
  for (const lesson of LESSONS) {
    for (const v of lesson.vocabulary) {
      map[v.word] = { ...v, lessonTitle: lesson.title, lessonIcon: lesson.icon };
    }
  }
  return map;
}

export default function ReviewPage() {
  const navigate = useNavigate();
  const { userData, reviewWord, getWordsForReview, addXP, addWordToSRS } = useUser();
  const showToast = useToast();

  const wordMap = useMemo(buildWordMap, []);
  const dueWords = useMemo(() => getWordsForReview(), [getWordsForReview]);

  const [sessionStarted, setSessionStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionScore, setSessionScore] = useState({ easy: 0, good: 0, hard: 0, again: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  // How many words are in SRS
  const totalSRS = Object.keys(userData.srsData || {}).length;
  const totalVocab = LESSONS.reduce((sum, l) => sum + l.vocabulary.length, 0);
  const untracked = totalVocab - totalSRS;

  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  }, []);

  // Add all learned/learning words that aren't in SRS yet
  function addAllLearnedToSRS() {
    for (const [word, status] of Object.entries(userData.wordStatus || {})) {
      if ((status === 'learned' || status === 'learning') && !userData.srsData?.[word]) {
        addWordToSRS(word);
      }
    }
    // Also add completed lesson words
    for (const lesson of LESSONS) {
      if (userData.completedLessons.includes(lesson.id)) {
        for (const v of lesson.vocabulary) {
          if (!userData.srsData?.[v.word]) addWordToSRS(v.word);
        }
      }
    }
    showToast('Đã thêm từ vào hệ thống ôn tập! 📚', 'success');
  }

  function handleGrade(quality) {
    const word = dueWords[idx]?.word;
    if (!word) return;
    reviewWord(word, quality);

    // Track session stats
    const label = quality >= 5 ? 'easy' : quality >= 4 ? 'good' : quality >= 3 ? 'hard' : 'again';
    setSessionScore((prev) => ({ ...prev, [label]: prev[label] + 1 }));

    // Next card
    if (idx + 1 < Math.min(dueWords.length, 20)) {
      setIdx((i) => i + 1);
      setFlipped(false);
    } else {
      // Session done
      const totalReviewed = idx + 1;
      addXP(totalReviewed * 3);
      setSessionDone(true);
      showToast(`Ôn tập xong ${totalReviewed} từ! +${totalReviewed * 3} XP 🎉`, 'success');
    }
  }

  /* ── Session complete ── */
  if (sessionDone) {
    const total = sessionScore.easy + sessionScore.good + sessionScore.hard + sessionScore.again;
    return (
      <div className="fade-in text-center py-5">
        <div style={{ fontSize: '4rem' }}>🧠✅</div>
        <h2 className="fw-bold mt-3">Ôn tập xong!</h2>
        <p className="lead text-muted">Bạn đã ôn {total} từ hôm nay</p>
        <div className="d-flex gap-3 justify-content-center flex-wrap my-4">
          <div className="badge bg-success fs-6 px-3 py-2">😎 Dễ: {sessionScore.easy}</div>
          <div className="badge bg-primary fs-6 px-3 py-2">👍 Tốt: {sessionScore.good}</div>
          <div className="badge bg-warning text-dark fs-6 px-3 py-2">😤 Khó: {sessionScore.hard}</div>
          <div className="badge bg-danger fs-6 px-3 py-2">🔄 Lại: {sessionScore.again}</div>
        </div>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <button className="btn btn-cowdi-primary" onClick={() => navigate(0)}>Ôn tiếp</button>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/lessons')}>Học bài mới</button>
        </div>
      </div>
    );
  }

  /* ── Review session ── */
  if (sessionStarted && dueWords.length > 0) {
    const card = dueWords[idx];
    const info = wordMap[card.word];
    const sessionTotal = Math.min(dueWords.length, 20);

    return (
      <div className="fade-in" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setSessionStarted(false)}>
            <i className="fas fa-arrow-left me-1"></i>Thoát
          </button>
          <span className="text-muted fw-bold">{idx + 1} / {sessionTotal}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${((idx + 1) / sessionTotal) * 100}%` }}></div>
        </div>

        {/* Card */}
        <div
          className="flashcard-wrapper mx-auto mb-4"
          onClick={() => { setFlipped(!flipped); if (!flipped && info) speakWord(info.word); }}
          style={{ maxWidth: 460, height: 280 }}
        >
          <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
            <div className="flashcard-front text-center">
              <span style={{ fontSize: '2rem' }}>{info?.illustration || '📚'}</span>
              <h2 className="fw-bold mt-2">{card.word}</h2>
              <p className="opacity-75 mb-0">{info?.phonetic}</p>
              <small className="mt-3 opacity-50">👆 Nhấn để xem đáp án</small>
            </div>
            <div className="flashcard-back text-center">
              <h3 className="fw-bold text-cowdi-primary mb-2">{info?.meaning}</h3>
              <p className="fst-italic text-muted mb-1">"{info?.example}"</p>
              {info && <small className="text-muted">{info.lessonIcon} {info.lessonTitle}</small>}
            </div>
          </div>
        </div>

        {/* Grade buttons — show after flip */}
        {flipped && (
          <div className="fade-in">
            <p className="text-center text-muted mb-2">Bạn nhớ từ này thế nào?</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button className="btn btn-danger" onClick={() => handleGrade(1)}>🔄 Quên</button>
              <button className="btn btn-warning" onClick={() => handleGrade(3)}>😤 Khó</button>
              <button className="btn btn-primary" onClick={() => handleGrade(4)}>👍 Nhớ</button>
              <button className="btn btn-success" onClick={() => handleGrade(5)}>😎 Dễ</button>
            </div>
          </div>
        )}

        <button className="btn btn-sm btn-outline-secondary d-block mx-auto mt-3" onClick={() => info && speakWord(info.word)}>
          🔊 Nghe phát âm
        </button>
      </div>
    );
  }

  /* ── Landing / overview ── */
  return (
    <div className="fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="card shadow-sm mb-4 bg-cowdi-gradient text-white">
        <div className="card-body text-center py-4">
          <div style={{ fontSize: '3rem' }}>🧠</div>
          <h2 className="fw-bold mt-2">Ôn tập thông minh</h2>
          <p className="mb-0 opacity-75">Hệ thống SRS giúp bạn nhớ từ vựng lâu dài</p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <div className="fs-3 fw-bold text-cowdi-primary">{dueWords.length}</div>
              <small className="text-muted">Cần ôn hôm nay</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <div className="fs-3 fw-bold text-success">{totalSRS}</div>
              <small className="text-muted">Từ đang theo dõi</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <div className="fs-3 fw-bold text-warning">{totalVocab}</div>
              <small className="text-muted">Tổng từ vựng</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <div className="fs-3 fw-bold text-secondary">{untracked}</div>
              <small className="text-muted">Chưa ôn tập</small>
            </div>
          </div>
        </div>
      </div>

      {dueWords.length > 0 ? (
        <button className="btn btn-cowdi-primary btn-lg w-100 mb-3" onClick={() => { setSessionStarted(true); setIdx(0); setFlipped(false); setSessionDone(false); setSessionScore({ easy: 0, good: 0, hard: 0, again: 0 }); }}>
          🧠 Bắt đầu ôn tập ({Math.min(dueWords.length, 20)} từ)
        </button>
      ) : (
        <div className="card shadow-sm mb-3">
          <div className="card-body text-center py-4">
            <div style={{ fontSize: '3rem' }}>🎉</div>
            <p className="fw-bold mt-2 mb-1">Không có từ nào cần ôn hôm nay!</p>
            <p className="text-muted small">Quay lại sau hoặc thêm từ mới vào hệ thống</p>
          </div>
        </div>
      )}

      {untracked > 0 && (
        <button className="btn btn-outline-cowdi w-100 mb-3" onClick={addAllLearnedToSRS}>
          ➕ Thêm {untracked > 0 ? 'từ đã học' : 'tất cả từ'} vào ôn tập
        </button>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="fw-bold mb-2">📊 Cách hoạt động</h6>
          <ul className="text-muted small mb-0">
            <li>Từ mới → ôn sau <strong>1 ngày</strong></li>
            <li>Nhớ tốt → <strong>3 → 7 → 14 → 30 ngày...</strong></li>
            <li>Quên → quay lại <strong>1 ngày</strong></li>
            <li>Thuật toán SM-2 tự động điều chỉnh theo trí nhớ của bạn</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
