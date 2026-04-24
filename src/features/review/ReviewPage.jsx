import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LESSONS } from '../../data/lessons';
import { useUser } from '../../hooks/useUser';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';

const SESSION_SIZE = 20;

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

// Mô phỏng SM-2 cục bộ để hiển thị khoảng ôn tập kế tiếp trên nút chấm điểm.
// (trùng logic với srsGrade trong useUser.jsx)
function previewInterval(card, quality) {
  const c = card || { interval: 1, easeFactor: 2.5, repetitions: 0 };
  let { interval = 1, easeFactor = 2.5, repetitions = 0 } = c;
  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);
  } else {
    interval = 1;
  }
  return interval; // days
}

function formatDays(d) {
  if (d <= 0) return 'hôm nay';
  if (d === 1) return '1 ngày';
  if (d < 7) return `${d} ngày`;
  if (d < 30) return `${Math.round(d / 7)} tuần`;
  if (d < 365) return `${Math.round(d / 30)} tháng`;
  return `${Math.round(d / 365)} năm`;
}

export default function ReviewPage() {
  const navigate = useNavigate();
  const { userData, reviewWord, getWordsForReview, addXP, addWordToSRS } = useUser();
  const showToast = useToast();
  const { play } = useSound();

  const wordMap = useMemo(buildWordMap, []);
  const dueWords = useMemo(() => getWordsForReview(), [getWordsForReview]);

  const [sessionStarted, setSessionStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionScore, setSessionScore] = useState({ easy: 0, good: 0, hard: 0, again: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  // Thống kê kho ôn tập
  const srsEntries = Object.entries(userData.srsData || {});
  const totalSRS = srsEntries.length;
  const totalVocab = LESSONS.reduce((sum, l) => sum + l.vocabulary.length, 0);
  const untracked = totalVocab - totalSRS;
  // Từ đã "ghi nhớ lâu dài" (lặp ≥ 3 lần, khoảng ôn ≥ 7 ngày)
  const masteredCount = srsEntries.filter(
    ([, c]) => (c.repetitions || 0) >= 3 && (c.interval || 0) >= 7
  ).length;

  // Lần ôn kế tiếp khi không còn từ nào due hôm nay
  const nextReviewAt = useMemo(() => {
    const now = Date.now();
    let min = Infinity;
    for (const [, c] of srsEntries) {
      if (!c.nextReview) continue;
      const t = new Date(c.nextReview).getTime();
      if (t > now && t < min) min = t;
    }
    return min === Infinity ? null : min;
  }, [srsEntries]);

  // Có bao nhiêu từ "đã học/đang học/đã hoàn thành bài" mà CHƯA vào kho SRS
  const addableCount = useMemo(() => {
    let n = 0;
    const seen = new Set();
    for (const [word, status] of Object.entries(userData.wordStatus || {})) {
      if ((status === 'learned' || status === 'learning') && !userData.srsData?.[word]) {
        if (!seen.has(word)) { seen.add(word); n += 1; }
      }
    }
    for (const lesson of LESSONS) {
      if (userData.completedLessons.includes(lesson.id)) {
        for (const v of lesson.vocabulary) {
          if (!userData.srsData?.[v.word] && !seen.has(v.word)) {
            seen.add(v.word); n += 1;
          }
        }
      }
    }
    return n;
  }, [userData]);

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
    let added = 0;
    for (const [word, status] of Object.entries(userData.wordStatus || {})) {
      if ((status === 'learned' || status === 'learning') && !userData.srsData?.[word]) {
        addWordToSRS(word); added += 1;
      }
    }
    // Also add completed lesson words
    for (const lesson of LESSONS) {
      if (userData.completedLessons.includes(lesson.id)) {
        for (const v of lesson.vocabulary) {
          if (!userData.srsData?.[v.word]) { addWordToSRS(v.word); added += 1; }
        }
      }
    }
    if (added > 0) {
      showToast(`Đã thêm ${added} từ vào kho ôn tập! 📚`, 'success');
      play('click');
    } else {
      showToast('Tất cả từ đã học đều đã có trong kho ôn tập', 'info');
    }
  }

  function handleGrade(quality) {
    const word = dueWords[idx]?.word;
    if (!word) return;
    reviewWord(word, quality);

    // Track session stats
    const label = quality >= 5 ? 'easy' : quality >= 4 ? 'good' : quality >= 3 ? 'hard' : 'again';
    setSessionScore((prev) => ({ ...prev, [label]: prev[label] + 1 }));
    // Sound feedback based on quality
    if (quality >= 5) play('reviewEasy');
    else if (quality >= 4) play('correct');
    else if (quality >= 3) play('reviewHard');
    else play('wrong');

    // Next card
    if (idx + 1 < Math.min(dueWords.length, SESSION_SIZE)) {
      setIdx((i) => i + 1);
      setFlipped(false);
    } else {
      // Session done
      const totalReviewed = idx + 1;
      addXP(totalReviewed * 3);
      setSessionDone(true);
      play('celebration');
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
    const sessionTotal = Math.min(dueWords.length, SESSION_SIZE);

    // Preview khoảng ôn tập kế tiếp cho từng mức chấm
    const iv = {
      again: previewInterval(card, 1),
      hard:  previewInterval(card, 3),
      good:  previewInterval(card, 4),
      easy:  previewInterval(card, 5),
    };

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
          className="flashcard-wrapper mx-auto mb-3"
          onClick={() => { setFlipped(!flipped); play('flip'); if (!flipped && info) speakWord(info.word); }}
          style={{ maxWidth: 460, height: 280, cursor: 'pointer' }}
        >
          <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
            <div className="flashcard-front text-center">
              <span style={{ fontSize: '2rem' }}>{info?.illustration || '📚'}</span>
              <h2 className="fw-bold mt-2">{card.word}</h2>
              <p className="opacity-75 mb-0">{info?.phonetic}</p>
              <small className="mt-3 opacity-50">👆 Nhấn để xem nghĩa</small>
            </div>
            <div className="flashcard-back text-center">
              <h3 className="fw-bold text-cowdi-primary mb-2">{info?.meaning}</h3>
              <p className="fst-italic text-muted mb-1">"{info?.example}"</p>
              {info && <small className="text-muted">{info.lessonIcon} {info.lessonTitle}</small>}
            </div>
          </div>
        </div>

        <div className="text-center mb-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); info && speakWord(info.word); }}>
            🔊 Nghe phát âm
          </button>
        </div>

        {/* Grade buttons — luôn hiện nhưng bị khoá đến khi lật thẻ */}
        <div className="card shadow-sm">
          <div className="card-body py-3">
            <p className="text-center small mb-2">
              {flipped
                ? <><strong>Bạn nhớ từ này thế nào?</strong> — chọn mức đúng nhất để AI xếp lịch ôn</>
                : <span className="text-muted">👆 Hãy lật thẻ trước rồi chấm mức nhớ của bạn</span>}
            </p>
            <div className="row g-2">
              <div className="col-6 col-md-3">
                <button
                  className="btn btn-danger w-100 d-flex flex-column py-2"
                  disabled={!flipped}
                  onClick={() => handleGrade(1)}
                  title="Hoàn toàn không nhớ — lặp lại sớm"
                >
                  <span>🔄 Quên</span>
                  <small className="opacity-75">ôn lại sau {formatDays(iv.again)}</small>
                </button>
              </div>
              <div className="col-6 col-md-3">
                <button
                  className="btn btn-warning w-100 d-flex flex-column py-2"
                  disabled={!flipped}
                  onClick={() => handleGrade(3)}
                  title="Nhớ mơ hồ, phải cố gắng"
                >
                  <span>😤 Khó</span>
                  <small className="opacity-75">ôn lại sau {formatDays(iv.hard)}</small>
                </button>
              </div>
              <div className="col-6 col-md-3">
                <button
                  className="btn btn-primary w-100 d-flex flex-column py-2"
                  disabled={!flipped}
                  onClick={() => handleGrade(4)}
                  title="Nhớ được nhưng không chắc chắn lắm"
                >
                  <span>👍 Nhớ</span>
                  <small className="opacity-75">ôn lại sau {formatDays(iv.good)}</small>
                </button>
              </div>
              <div className="col-6 col-md-3">
                <button
                  className="btn btn-success w-100 d-flex flex-column py-2"
                  disabled={!flipped}
                  onClick={() => handleGrade(5)}
                  title="Nhớ rõ, không cần suy nghĩ"
                >
                  <span>😎 Dễ</span>
                  <small className="opacity-75">ôn lại sau {formatDays(iv.easy)}</small>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Landing / overview ── */
  const startSession = () => {
    setSessionStarted(true);
    setIdx(0);
    setFlipped(false);
    setSessionDone(false);
    setSessionScore({ easy: 0, good: 0, hard: 0, again: 0 });
  };

  // Xác định CTA chính dựa trên trạng thái
  const hasDue = dueWords.length > 0;
  const hasKho = totalSRS > 0;
  const canAdd = addableCount > 0;
  const sessionCount = Math.min(dueWords.length, SESSION_SIZE);

  // Preview 5 từ đầu sẽ gặp trong phiên
  const previewWords = dueWords.slice(0, 5).map((d) => wordMap[d.word]).filter(Boolean);

  // Thời điểm từ kế tiếp cần ôn (khi hết due)
  const nextInDays = nextReviewAt
    ? Math.max(0, Math.ceil((nextReviewAt - Date.now()) / 86400000))
    : null;

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Hero */}
      <div className="card shadow-sm mb-4 bg-cowdi-gradient text-white">
        <div className="card-body text-center py-4">
          <div style={{ fontSize: '3rem' }}>🧠</div>
          <h2 className="fw-bold mt-2 mb-1">Ôn tập thông minh</h2>
          <p className="mb-0 opacity-75">
            Lật thẻ → chấm điểm nhớ → AI xếp lịch ôn đúng lúc bạn sắp quên
          </p>
        </div>
      </div>

      {/* Primary action — 3 nhánh trạng thái rõ ràng */}
      {hasDue ? (
        /* Case A: Có từ cần ôn */
        <div className="card shadow-sm mb-4 border-2 border-cowdi-primary">
          <div className="card-body p-4">
            <div className="d-flex align-items-center mb-3">
              <div style={{ fontSize: '2.5rem' }} className="me-3">🔥</div>
              <div>
                <h5 className="fw-bold mb-1">Có {dueWords.length} từ đang chờ bạn ôn</h5>
                <p className="text-muted small mb-0">
                  Phiên này sẽ ôn {sessionCount} từ — khoảng 3-5 phút
                </p>
              </div>
            </div>

            {previewWords.length > 0 && (
              <div className="mb-3">
                <small className="text-muted">Một số từ sắp gặp:</small>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {previewWords.map((w) => (
                    <span key={w.word} className="badge bg-light text-dark border">
                      {w.illustration || '📚'} {w.word}
                    </span>
                  ))}
                  {dueWords.length > previewWords.length && (
                    <span className="badge bg-light text-muted border">+{dueWords.length - previewWords.length} từ khác</span>
                  )}
                </div>
              </div>
            )}

            <button className="btn btn-cowdi-primary btn-lg w-100" onClick={startSession}>
              🚀 Bắt đầu ôn ngay ({sessionCount} từ)
            </button>
          </div>
        </div>
      ) : hasKho ? (
        /* Case C: Đã xong hôm nay */
        <div className="card shadow-sm mb-4">
          <div className="card-body text-center py-4">
            <div style={{ fontSize: '3rem' }}>🎉</div>
            <h5 className="fw-bold mt-2 mb-1">Hôm nay bạn đã ôn xong hết!</h5>
            {nextInDays !== null ? (
              <p className="text-muted mb-3">
                Cowdi sẽ nhắc bạn ôn tiếp sau <strong>{formatDays(nextInDays)}</strong>
                {' '}({new Date(nextReviewAt).toLocaleDateString('vi-VN')})
              </p>
            ) : (
              <p className="text-muted mb-3">Chưa có lịch ôn tiếp — hãy học thêm bài mới để thêm từ vào kho.</p>
            )}
            {canAdd && (
              <button className="btn btn-outline-cowdi" onClick={addAllLearnedToSRS}>
                ➕ Thêm {addableCount} từ mới vào kho ôn tập
              </button>
            )}
            {!canAdd && (
              <button className="btn btn-outline-cowdi" onClick={() => navigate('/lessons')}>
                📚 Học bài mới để có thêm từ ôn
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Case B: Kho rỗng — người dùng mới */
        <div className="card shadow-sm mb-4 border-2 border-warning">
          <div className="card-body p-4 text-center">
            <div style={{ fontSize: '3rem' }}>👋</div>
            <h5 className="fw-bold mt-2 mb-1">Bắt đầu kho ôn tập của bạn</h5>
            <p className="text-muted small mb-3">
              Kho ôn tập đang trống. Hãy nạp vào những từ bạn đã học để Cowdi giúp bạn nhớ lâu dài.
            </p>
            {canAdd ? (
              <button className="btn btn-cowdi-primary btn-lg w-100" onClick={addAllLearnedToSRS}>
                ➕ Thêm {addableCount} từ đã học vào kho
              </button>
            ) : (
              <>
                <p className="small text-muted mb-2">Bạn cần học ít nhất 1 bài trước đã.</p>
                <button className="btn btn-cowdi-primary btn-lg w-100" onClick={() => navigate('/lessons')}>
                  📚 Vào học bài đầu tiên
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Thống kê tối giản */}
      {hasKho && (
        <div className="row g-2 mb-4">
          <div className="col-4">
            <div className="card text-center shadow-sm h-100">
              <div className="card-body py-3">
                <div className="fs-4 fw-bold text-cowdi-primary">{dueWords.length}</div>
                <small className="text-muted">Cần ôn hôm nay</small>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="card text-center shadow-sm h-100">
              <div className="card-body py-3">
                <div className="fs-4 fw-bold text-warning">{totalSRS}</div>
                <small className="text-muted">Đang theo dõi</small>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="card text-center shadow-sm h-100">
              <div className="card-body py-3">
                <div className="fs-4 fw-bold text-success">{masteredCount}</div>
                <small className="text-muted">Đã ghi nhớ lâu</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hướng dẫn 3 bước — luôn hiện */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3">✨ Cách dùng trong 3 bước</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="text-center p-2">
                <div style={{ fontSize: '2rem' }}>1️⃣</div>
                <div className="fw-bold small mt-1">Thêm từ vào kho</div>
                <p className="text-muted small mb-0">Từ các bài đã học sẽ được nạp vào hệ thống SRS.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center p-2">
                <div style={{ fontSize: '2rem' }}>2️⃣</div>
                <div className="fw-bold small mt-1">Lật thẻ & tự kiểm tra</div>
                <p className="text-muted small mb-0">Nhìn từ, đoán nghĩa, rồi lật thẻ để so đáp án.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center p-2">
                <div style={{ fontSize: '2rem' }}>3️⃣</div>
                <div className="fw-bold small mt-1">Chấm mức nhớ</div>
                <p className="text-muted small mb-0">AI tự xếp lịch: nhớ tốt → ôn thưa, quên → ôn lại sớm.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nút phụ: thêm từ — chỉ hiện khi còn từ để thêm và đã có kho */}
      {hasKho && canAdd && (
        <button className="btn btn-outline-cowdi w-100 mb-3" onClick={addAllLearnedToSRS}>
          ➕ Thêm {addableCount} từ đã học mới vào kho
        </button>
      )}

      {/* Chi tiết thuật toán (gập gọn) */}
      <details className="card shadow-sm">
        <summary className="card-body fw-bold small" style={{ cursor: 'pointer', listStyle: 'revert' }}>
          📊 Chi tiết thuật toán SM-2
        </summary>
        <div className="card-body pt-0">
          <ul className="text-muted small mb-0">
            <li>Từ mới → ôn sau <strong>1 ngày</strong></li>
            <li>Nhớ tốt liên tiếp → <strong>3 → 7 → 14 → 30 ngày...</strong></li>
            <li>Quên → khoảng ôn quay về <strong>1 ngày</strong></li>
            <li>Thuật toán SM-2 tự điều chỉnh hệ số dễ-khó theo lịch sử trả lời của bạn.</li>
          </ul>
        </div>
      </details>
    </div>
  );
}
