import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LESSONS } from '../../data/lessons';
import { VOCAB_TOPICS } from '../../data/vocab-topics';
import { useUser } from '../../hooks/useUser';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import StudyJournalCard from './StudyJournalCard';

const SESSION_SIZE = 20;

/* ──────────────────────────────────────────────────────────────────
   STYLES — Inline tokens dùng riêng cho Review module
   ────────────────────────────────────────────────────────────────── */
const TOKENS = {
  primary: '#FF6B9D',
  primaryDark: '#E0527E',
  accent: '#A29BFE',
  goldBg: 'linear-gradient(135deg, #fff7e6 0%, #ffe9c2 100%)',
  goldBorder: '#f0c36d',
  successBg: 'linear-gradient(135deg, #e8f8f0 0%, #c8edd9 100%)',
  warningBg: 'linear-gradient(135deg, #fff5e6 0%, #ffe1b8 100%)',
  dangerBg: 'linear-gradient(135deg, #ffe9ee 0%, #ffd0db 100%)',
  cardShadow: '0 2px 12px rgba(255, 107, 157, 0.08)',
};

/* ──────────────────────────────────────────────────────────────────
   DATA HELPERS
   ────────────────────────────────────────────────────────────────── */

function buildWordMap() {
  const map = {};
  for (const lesson of LESSONS) {
    for (const v of lesson.vocabulary) {
      map[v.word] = { ...v, sourceTitle: lesson.title, sourceIcon: lesson.icon };
    }
  }
  for (const topic of VOCAB_TOPICS) {
    for (const sub of topic.subtopics || []) {
      for (const w of sub.words || []) {
        const existing = map[w.word];
        if (existing) {
          map[w.word] = {
            ...w,
            ...existing,
            memoryTip: existing.memoryTip || w.memoryTip,
            illustration: existing.illustration || w.illustration,
            related: existing.related || w.related,
          };
        } else {
          map[w.word] = {
            ...w,
            sourceTitle: `${topic.nameVi} › ${sub.nameVi || sub.name}`,
            sourceIcon: sub.icon || topic.icon,
          };
        }
      }
    }
  }
  return map;
}

function previewInterval(card, quality) {
  const c = card || { interval: 1, easeFactor: 2.5, repetitions: 0 };
  let { interval = 1, easeFactor = 2.5, repetitions = 0 } = c;
  if (quality >= 3) {
    if (repetitions === 0) {
      interval = quality >= 5 ? 2 : 1;
    } else if (repetitions === 1) {
      if (quality >= 5) interval = 5;
      else if (quality >= 4) interval = 3;
      else interval = 2;
    } else {
      if (quality === 3) interval = Math.max(2, Math.round(interval * 1.2));
      else if (quality === 4) interval = Math.round(interval * easeFactor);
      else interval = Math.round(interval * easeFactor * 1.15);
    }
  } else {
    interval = 1;
  }
  return interval;
}

function formatDays(d) {
  if (d <= 0) return 'hôm nay';
  if (d === 1) return '1 ngày';
  if (d < 7) return `${d} ngày`;
  if (d < 30) return `${Math.round(d / 7)} tuần`;
  if (d < 365) return `${Math.round(d / 30)} tháng`;
  return `${Math.round(d / 365)} năm`;
}

function buildWordRegex(word, flags = 'gi') {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b(${escaped}(?:s|es|ed|ing|'s)?)\\b`, flags);
}

function highlightWordInSentence(sentence, word) {
  if (!sentence) return null;
  if (!word) return sentence;
  try {
    const re = buildWordRegex(word, 'gi');
    const parts = sentence.split(re);
    return parts.map((p, i) =>
      i % 2 === 1 ? (
        <mark
          key={i}
          style={{
            background: 'linear-gradient(180deg, transparent 60%, #fff3a8 60%)',
            padding: '0 3px',
            borderRadius: 3,
            fontWeight: 600,
          }}
        >
          {p}
        </mark>
      ) : (
        <span key={i}>{p}</span>
      )
    );
  } catch {
    return sentence;
  }
}

function splitClozeSentence(sentence, word) {
  if (!sentence || !word) return null;
  try {
    const re = buildWordRegex(word, 'i');
    const m = sentence.match(re);
    if (!m) return null;
    const idx = m.index;
    return {
      before: sentence.slice(0, idx),
      answer: m[1],
      after: sentence.slice(idx + m[1].length),
    };
  } catch {
    return null;
  }
}

function checkClozeAnswer(input, expected) {
  if (!input) return false;
  const a = input.trim().toLowerCase().replace(/['"]/g, '');
  const b = expected.trim().toLowerCase().replace(/['"]/g, '');
  if (a === b) return true;
  const stem = b.replace(/(s|es|ed|ing|'s)$/i, '');
  if (a === stem) return true;
  if (a === stem + 's' || a === stem + 'es' || a === stem + 'ed' || a === stem + 'ing') return true;
  return false;
}

/* ──────────────────────────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────────────────────────── */

export default function ReviewPage() {
  const navigate = useNavigate();
  const { userData, reviewWord, getWordsForReview, addXP } = useUser();
  const showToast = useToast();
  const { play } = useSound();

  const wordMap = useMemo(buildWordMap, []);
  const dueWords = useMemo(() => getWordsForReview(), [getWordsForReview]);

  const [sessionStarted, setSessionStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  // step: 'ask' (chưa quyết) | 'hints' (đã chọn xem gợi ý) | 'grade' (đang tự đánh giá)
  const [step, setStep] = useState('ask');
  const [sessionScore, setSessionScore] = useState({ easy: 0, good: 0, hard: 0, again: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  const srsEntries = Object.entries(userData.srsData || {});
  const totalSRS = srsEntries.length;
  const masteredCount = srsEntries.filter(
    ([, c]) => (c.repetitions || 0) >= 3 && (c.interval || 0) >= 7
  ).length;

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

  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const clean = String(text || '')
        .replace(/\s*[\(\[\{][^()\[\]{}]*[\)\]\}]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!clean) return;
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'en-US';
      u.rate = 0.85;
      speechSynthesis.speak(u);
    }
  }, []);

  function handleGrade(quality) {
    const word = dueWords[idx]?.word;
    if (!word) return;
    reviewWord(word, quality);

    const label = quality >= 5 ? 'easy' : quality >= 4 ? 'good' : quality >= 3 ? 'hard' : 'again';
    setSessionScore((prev) => ({ ...prev, [label]: prev[label] + 1 }));
    if (quality >= 5) play('reviewEasy');
    else if (quality >= 4) play('correct');
    else if (quality >= 3) play('reviewHard');
    else play('wrong');

    if (idx + 1 < Math.min(dueWords.length, SESSION_SIZE)) {
      setIdx((i) => i + 1);
      setStep('ask');
    } else {
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
        <div style={{ fontSize: '4.5rem' }}>🧠✅</div>
        <h2 className="fw-bold mt-3">Ôn tập xong!</h2>
        <p className="lead text-muted">Bạn đã ôn {total} từ hôm nay</p>
        <div className="d-flex gap-2 justify-content-center flex-wrap my-4">
          <span className="badge bg-success fs-6 px-3 py-2">😎 Dễ: {sessionScore.easy}</span>
          <span className="badge bg-primary fs-6 px-3 py-2">👍 Tốt: {sessionScore.good}</span>
          <span className="badge bg-warning text-dark fs-6 px-3 py-2">😤 Khó: {sessionScore.hard}</span>
          <span className="badge bg-danger fs-6 px-3 py-2">🔄 Lại: {sessionScore.again}</span>
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

    const iv = {
      again: previewInterval(card, 1),
      hard:  previewInterval(card, 3),
      good:  previewInterval(card, 4),
      easy:  previewInterval(card, 5),
    };

    // Cowdi guide message theo từng bước
    const cowdiMsg =
      step === 'ask'
        ? `Nhìn từ "${card.word}" và thử nhớ lại nghĩa nhé! Nếu nhớ rồi thì sang từ tiếp, chưa nhớ thì để Cowdi gợi ý cho bạn 💪`
        : step === 'hints'
        ? 'Đọc nghĩa, ví dụ và mẹo nhớ bên dưới. Hãy thử điền vào chỗ trống để khắc sâu hơn nha! 🌟'
        : 'Bạn thấy mình nhớ ở mức nào? Chấm thật để Cowdi xếp lịch ôn thông minh cho bạn nhé! 🧠';

    // Nhớ liền: tự chấm "Dễ" và sang từ kế tiếp
    const handleRememberInstant = () => handleGrade(5);

    return (
      <div className="fade-in" style={{ maxWidth: 580, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setSessionStarted(false)}>
            <i className="fas fa-arrow-left me-1"></i>Thoát
          </button>
          <span className="text-muted fw-bold">{idx + 1} / {sessionTotal}</span>
        </div>
        <div className="progress mb-3" style={{ height: '8px', borderRadius: 999 }}>
          <div
            className="progress-bar progress-bar-cowdi"
            style={{ width: `${((idx + 1) / sessionTotal) * 100}%`, transition: 'width 0.4s ease' }}
          />
        </div>

        {/* Cowdi guide bubble */}
        <CowdiGuide message={cowdiMsg} step={step} />

        {/* Word display (front) — luôn hiển thị */}
        <div
          className="text-white text-center mx-auto mb-3 px-3"
          style={{
            background: `linear-gradient(135deg, ${TOKENS.primary} 0%, ${TOKENS.primaryDark} 100%)`,
            borderRadius: 20,
            padding: '28px 16px',
            maxWidth: 480,
            boxShadow: '0 6px 20px rgba(255, 107, 157, 0.25)',
          }}
        >
          <span style={{ fontSize: '2.4rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.18))' }}>
            {info?.illustration || '📚'}
          </span>
          <h2 className="fw-bold mt-2 mb-1" style={{ fontSize: '2.2rem', letterSpacing: '.5px' }}>
            {card.word}
          </h2>
          {info?.phonetic && <p className="opacity-75 mb-2">{info.phonetic}</p>}
          <button
            type="button"
            onClick={() => speakWord(card.word)}
            style={{
              background: 'rgba(255,255,255,.22)',
              border: '1px solid rgba(255,255,255,.4)',
              color: '#fff',
              borderRadius: 999,
              padding: '4px 14px',
              fontSize: '.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔊 Nghe phát âm
          </button>
        </div>

        {/* STEP 1 — Hỏi: nhớ liền hay cần gợi ý? */}
        {step === 'ask' && (
          <div className="card shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-body py-3">
              <p className="text-center fw-bold mb-3" style={{ fontSize: '.95rem' }}>
                Bạn có nhớ nghĩa của từ này không?
              </p>
              <div className="row g-2">
                <div className="col-6">
                  <button
                    className="btn btn-success w-100 d-flex flex-column py-3"
                    style={{ borderRadius: 14, minHeight: 88 }}
                    onClick={handleRememberInstant}
                    title="Tự chấm Dễ và sang từ tiếp theo"
                  >
                    <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>✅</span>
                    <span className="fw-bold mt-1">Tôi nhớ rồi</span>
                    <small className="opacity-75" style={{ fontSize: '.72rem' }}>
                      sang từ kế tiếp →
                    </small>
                  </button>
                </div>
                <div className="col-6">
                  <button
                    className="btn btn-warning text-dark w-100 d-flex flex-column py-3"
                    style={{ borderRadius: 14, minHeight: 88 }}
                    onClick={() => setStep('hints')}
                    title="Xem nghĩa, ví dụ và mẹo nhớ"
                  >
                    <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🤔</span>
                    <span className="fw-bold mt-1">Chưa nhớ rõ</span>
                    <small className="opacity-75" style={{ fontSize: '.72rem' }}>
                      xem gợi ý →
                    </small>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Gợi ý cách học */}
        {step === 'hints' && (
          <div className="card shadow-sm mb-3" style={{ borderRadius: 16 }}>
            <div className="card-body">
              {info ? (
                <>
                  <div className="text-center mb-3">
                    <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '.7rem', letterSpacing: '.5px' }}>
                      📖 Nghĩa
                    </small>
                    <h4 className="fw-bold text-cowdi-primary mb-0 mt-1">{info.meaning}</h4>
                  </div>

                  {info.memoryTip && (
                    <div
                      className="px-3 py-2 rounded-3 mb-3"
                      style={{
                        background: TOKENS.goldBg,
                        color: '#7a5b1f',
                        border: `1px dashed ${TOKENS.goldBorder}`,
                        fontSize: '.9rem',
                      }}
                    >
                      <strong>💡 Mẹo nhớ:</strong> {info.memoryTip}
                    </div>
                  )}

                  {info.example && (
                    <div
                      className="p-3 rounded-3 mb-3"
                      style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
                    >
                      <ClozePractice
                        sentence={info.example}
                        word={card.word}
                        onSpeakSentence={() => speakWord(info.example)}
                      />
                    </div>
                  )}

                  {info.related && (
                    <div className="mb-3">
                      <small className="fw-bold text-muted d-block mb-1">🔗 Từ / cụm liên quan:</small>
                      <div className="d-flex flex-wrap gap-1">
                        {info.related.split(/[,;]/).map((r, i) => {
                          const t = r.trim();
                          if (!t) return null;
                          return (
                            <span
                              key={i}
                              onClick={() => speakWord(t)}
                              title="Nhấn để nghe phát âm"
                              style={{
                                background: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: 999,
                                padding: '3px 10px',
                                fontSize: '.82rem',
                                cursor: 'pointer',
                              }}
                            >
                              {t}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(info.sourceIcon || info.sourceTitle) && (
                    <small className="text-muted d-block mb-3" style={{ fontSize: '.78rem' }}>
                      Nguồn: {info.sourceIcon} {info.sourceTitle}
                    </small>
                  )}
                </>
              ) : (
                <p className="text-muted small mb-3">
                  Chưa có dữ liệu chi tiết cho từ này. Bạn có thể tự đánh giá mức nhớ của mình bên dưới.
                </p>
              )}

              <button
                className="btn btn-cowdi-primary w-100"
                onClick={() => setStep('grade')}
              >
                ✅ Đã hiểu — Tự đánh giá mức nhớ
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Tự đánh giá */}
        {step === 'grade' && (
          <div className="card shadow-sm" style={{ borderRadius: 16, border: `2px solid ${TOKENS.primary}` }}>
            <div className="card-body py-3">
              <p className="text-center small mb-2">
                <strong>Bạn nhớ từ này thế nào?</strong> — chọn mức đúng nhất để AI xếp lịch ôn
              </p>
              <div className="row g-2">
                <GradeButton color="danger"  emoji="🔄" label="Quên" days={iv.again} onClick={() => handleGrade(1)} title="Hoàn toàn không nhớ — lặp lại sớm" />
                <GradeButton color="warning" emoji="😤" label="Khó" days={iv.hard}  onClick={() => handleGrade(3)} title="Nhớ mơ hồ, phải cố gắng" />
                <GradeButton color="primary" emoji="👍" label="Nhớ" days={iv.good}  onClick={() => handleGrade(4)} title="Nhớ được nhưng không chắc lắm" />
                <GradeButton color="success" emoji="😎" label="Dễ"  days={iv.easy}  onClick={() => handleGrade(5)} title="Nhớ rõ, không cần suy nghĩ" />
              </div>
              <button
                type="button"
                className="btn btn-link btn-sm w-100 mt-2 text-muted"
                onClick={() => setStep('hints')}
              >
                ← Xem lại gợi ý
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Landing / overview ── */
  const startSession = () => {
    setSessionStarted(true);
    setIdx(0);
    setStep('ask');
    setSessionDone(false);
    setSessionScore({ easy: 0, good: 0, hard: 0, again: 0 });
  };

  const hasDue = dueWords.length > 0;
  const hasKho = totalSRS > 0;
  const sessionCount = Math.min(dueWords.length, SESSION_SIZE);
  const previewWords = dueWords.slice(0, 5).map((d) => wordMap[d.word]).filter(Boolean);
  const nextInDays = nextReviewAt
    ? Math.max(0, Math.ceil((nextReviewAt - Date.now()) / 86400000))
    : null;

  return (
    <div className="fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Hero */}
      <div
        className="card shadow-sm mb-4 text-white border-0"
        style={{
          background: `linear-gradient(135deg, ${TOKENS.primary} 0%, ${TOKENS.accent} 100%)`,
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        <div className="card-body text-center py-4">
          <div style={{ fontSize: '3.4rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.18))' }}>🧠</div>
          <h2 className="fw-bold mt-2 mb-1">Ôn tập thông minh</h2>
          <p className="mb-0 opacity-90">
            Lật thẻ → chấm điểm nhớ → AI xếp lịch ôn đúng lúc bạn sắp quên
          </p>
        </div>
      </div>

      {/* Nhật ký học tập */}
      <StudyJournalCard />

      {/* Primary action */}
      {hasDue ? (
        <div
          className="card mb-4"
          style={{
            borderRadius: 16,
            border: `2px solid ${TOKENS.primary}`,
            boxShadow: TOKENS.cardShadow,
          }}
        >
          <div className="card-body p-4">
            <div className="d-flex align-items-center mb-3">
              <div style={{ fontSize: '2.6rem' }} className="me-3">🔥</div>
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
                    <span
                      key={w.word}
                      className="badge"
                      style={{
                        background: '#fff',
                        color: TOKENS.primaryDark,
                        border: `1px solid ${TOKENS.primary}55`,
                        fontWeight: 500,
                      }}
                    >
                      {w.illustration || '📚'} {w.word}
                    </span>
                  ))}
                  {dueWords.length > previewWords.length && (
                    <span className="badge bg-light text-muted border">
                      +{dueWords.length - previewWords.length} từ khác
                    </span>
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
        <div className="card shadow-sm mb-4" style={{ borderRadius: 16 }}>
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
            <button className="btn btn-outline-cowdi" onClick={() => navigate('/lessons')}>
              📚 Học bài mới để có thêm từ ôn
            </button>
          </div>
        </div>
      ) : (
        <div
          className="card shadow-sm mb-4"
          style={{ borderRadius: 16, border: '2px solid #ffc107' }}
        >
          <div className="card-body p-4 text-center">
            <div style={{ fontSize: '3rem' }}>👋</div>
            <h5 className="fw-bold mt-2 mb-1">Bắt đầu kho ôn tập của bạn</h5>
            <p className="text-muted small mb-3">
              Kho ôn tập sẽ <strong>tự động</strong> được nạp khi bạn học bài hoặc đánh dấu từ là "đã thuộc".
              Cowdi tự lo phần xếp lịch — bạn chỉ cần học và ôn thôi! 💪
            </p>
            <button className="btn btn-cowdi-primary btn-lg w-100" onClick={() => navigate('/lessons')}>
              📚 Vào học bài đầu tiên
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {hasKho && (
        <div className="row g-2 mb-4">
          <StatCard value={dueWords.length} label="Cần ôn hôm nay" gradient={TOKENS.dangerBg} accent={TOKENS.primary} />
          <StatCard value={totalSRS} label="Đang theo dõi" gradient={TOKENS.warningBg} accent="#f59e0b" />
          <StatCard value={masteredCount} label="Đã ghi nhớ lâu" gradient={TOKENS.successBg} accent="#10b981" />
        </div>
      )}

      {/* Vocab bank list */}
      {hasKho && (
        <VocabBankList
          srsEntries={srsEntries}
          wordMap={wordMap}
          onSpeak={speakWord}
          onStartSession={startSession}
          hasDue={hasDue}
        />
      )}

      {/* Hướng dẫn 3 bước */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: 16 }}>
        <div className="card-body">
          <h6 className="fw-bold mb-3">✨ Cách hoạt động</h6>
          <div className="row g-3">
            <StepCard num="1️⃣" title="Tự động nạp từ" desc="Học xong bài hoặc đánh dấu 'đã thuộc' → từ tự vào kho ôn." />
            <StepCard num="2️⃣" title="AI chọn 20 từ ưu tiên" desc="Ưu tiên từ khó, từ hay quên — bỏ qua từ bạn đã nhớ kỹ." />
            <StepCard num="3️⃣" title="Chấm mức nhớ" desc="Cowdi xếp lịch: nhớ tốt → ôn thưa, quên → ôn lại sớm." />
          </div>
        </div>
      </div>

      <details className="card shadow-sm" style={{ borderRadius: 16 }}>
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

/* ──────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ────────────────────────────────────────────────────────────────── */

function GradeButton({ color, emoji, label, days, disabled, onClick, title }) {
  return (
    <div className="col-6 col-md-3">
      <button
        className={`btn btn-${color} w-100 d-flex flex-column py-2`}
        disabled={disabled}
        onClick={onClick}
        title={title}
        style={{ borderRadius: 12, minHeight: 64 }}
      >
        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{emoji} {label}</span>
        <small className="opacity-75">ôn lại sau {formatDays(days)}</small>
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   COWDI GUIDE — Bubble hướng dẫn theo từng bước trong phiên ôn
   ────────────────────────────────────────────────────────────────── */
function CowdiGuide({ message, step }) {
  const tone =
    step === 'ask' ? { bg: '#eef2ff', border: '#c7d2fe', accent: '#4f46e5' }
    : step === 'hints' ? { bg: '#fff7ed', border: '#fed7aa', accent: '#c2410c' }
    : { bg: '#ecfdf5', border: '#a7f3d0', accent: '#047857' };

  return (
    <div
      className="d-flex align-items-start gap-2 mb-3 p-2 rounded-3"
      style={{
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        animation: 'fadeIn .3s ease',
      }}
    >
      <div
        style={{
          fontSize: '1.6rem',
          lineHeight: 1,
          flexShrink: 0,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          borderRadius: '50%',
          border: `2px solid ${tone.accent}`,
          boxShadow: '0 2px 6px rgba(0,0,0,.06)',
        }}
      >
        🐮
      </div>
      <div className="flex-grow-1">
        <div
          className="fw-bold"
          style={{ fontSize: '.72rem', color: tone.accent, letterSpacing: '.4px' }}
        >
          COWDI GỢI Ý
        </div>
        <div style={{ fontSize: '.85rem', color: '#374151', lineHeight: 1.45 }}>
          {message}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, gradient, accent }) {
  return (
    <div className="col-4">
      <div
        className="text-center h-100"
        style={{
          background: gradient,
          border: '1px solid rgba(0,0,0,.05)',
          borderRadius: 14,
          padding: '14px 6px',
          boxShadow: TOKENS.cardShadow,
        }}
      >
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: accent, lineHeight: 1.1 }}>
          {value}
        </div>
        <small className="text-muted d-block mt-1" style={{ fontSize: '.78rem' }}>{label}</small>
      </div>
    </div>
  );
}

function StepCard({ num, title, desc }) {
  return (
    <div className="col-md-4">
      <div className="text-center p-2">
        <div style={{ fontSize: '2rem' }}>{num}</div>
        <div className="fw-bold small mt-1">{title}</div>
        <p className="text-muted small mb-0">{desc}</p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   VOCAB BANK LIST
   ────────────────────────────────────────────────────────────────── */

function VocabBankList({ srsEntries, wordMap, onSpeak, onStartSession, hasDue }) {
  const [tab, setTab] = useState('due');
  const [query, setQuery] = useState('');
  const [openWord, setOpenWord] = useState(null);

  const now = Date.now();

  const classified = useMemo(() => {
    const due = [];
    const learning = [];
    const mastered = [];
    for (const [word, card] of srsEntries) {
      const item = { word, card, info: wordMap[word] };
      const isDue = !card.nextReview || new Date(card.nextReview).getTime() <= now;
      const isMastered = (card.repetitions || 0) >= 3 && (card.interval || 0) >= 7;
      if (isDue) due.push(item);
      if (isMastered) mastered.push(item);
      else if (!isDue) learning.push(item);
    }
    return { due, learning, mastered, all: [...due, ...learning, ...mastered] };
  }, [srsEntries, wordMap, now]);

  const list = classified[tab] || classified.all;
  const filtered = useMemo(() => {
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter(({ word, info }) =>
      word.toLowerCase().includes(q) ||
      (info?.meaning || '').toLowerCase().includes(q)
    );
  }, [list, query]);

  const tabs = [
    { id: 'due', label: 'Cần ôn hôm nay', icon: '🔥', count: classified.due.length, color: TOKENS.primary },
    { id: 'learning', label: 'Đang học', icon: '📖', count: classified.learning.length, color: '#3b82f6' },
    { id: 'mastered', label: 'Đã nhớ lâu', icon: '🏆', count: classified.mastered.length, color: '#10b981' },
    { id: 'all', label: 'Tất cả', icon: '📚', count: classified.all.length, color: '#6b7280' },
  ];

  function fmtNext(card) {
    if (!card.nextReview) return 'hôm nay';
    const t = new Date(card.nextReview).getTime();
    const days = Math.round((t - now) / 86400000);
    if (days <= 0) return 'hôm nay';
    if (days === 1) return 'ngày mai';
    if (days < 7) return `${days} ngày nữa`;
    if (days < 30) return `${Math.round(days / 7)} tuần nữa`;
    return `${Math.round(days / 30)} tháng nữa`;
  }

  function statusOf(card) {
    const isDue = !card.nextReview || new Date(card.nextReview).getTime() <= now;
    const isMastered = (card.repetitions || 0) >= 3 && (card.interval || 0) >= 7;
    if (isMastered) return { color: '#10b981', label: 'Nhớ lâu', emoji: '🏆' };
    if (isDue) return { color: TOKENS.primary, label: 'Cần ôn', emoji: '🔥' };
    return { color: '#3b82f6', label: 'Đang học', emoji: '📖' };
  }

  return (
    <details className="card shadow-sm mb-4" open style={{ borderRadius: 16 }}>
      <summary
        className="card-body fw-bold d-flex align-items-center justify-content-between"
        style={{ cursor: 'pointer', listStyle: 'revert' }}
      >
        <span>📒 Danh sách từ trong kho ôn tập</span>
        <span
          className="badge"
          style={{ background: TOKENS.primary, color: '#fff', fontSize: '.8rem' }}
        >
          {classified.all.length} từ
        </span>
      </summary>
      <div className="card-body pt-0">
        {/* Tabs */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  background: active ? t.color : '#fff',
                  color: active ? '#fff' : '#333',
                  border: `1.5px solid ${active ? t.color : '#e5e7eb'}`,
                  borderRadius: 999,
                  fontWeight: active ? 600 : 500,
                  padding: '6px 14px',
                  fontSize: '.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all .15s',
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                <span
                  style={{
                    background: active ? 'rgba(255,255,255,.25)' : '#f3f4f6',
                    color: active ? '#fff' : '#374151',
                    fontWeight: 600,
                    borderRadius: 999,
                    padding: '1px 8px',
                    fontSize: '.75rem',
                  }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="position-relative mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm trong kho (gõ từ hoặc nghĩa)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: 38, borderRadius: 10 }}
          />
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
        </div>

        {/* Quick action */}
        {tab === 'due' && hasDue && classified.due.length > 0 && (
          <button className="btn btn-cowdi-primary btn-sm w-100 mb-2" onClick={onStartSession}>
            🚀 Ôn ngay {Math.min(classified.due.length, SESSION_SIZE)} từ cần ôn
          </button>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-4">
            <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>🔎</div>
            <p className="text-muted small mb-0">
              {query.trim()
                ? 'Không tìm thấy từ nào khớp.'
                : tab === 'due'
                  ? 'Không có từ nào cần ôn ở mục này.'
                  : 'Chưa có từ nào trong nhóm này.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              maxHeight: 460,
              overflowY: 'auto',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: '#fafafa',
            }}
          >
            {filtered.map(({ word, card, info }) => (
              <VocabRow
                key={word}
                word={word}
                card={card}
                info={info}
                isOpen={openWord === word}
                onToggle={() => setOpenWord(openWord === word ? null : word)}
                onSpeak={onSpeak}
                fmtNext={fmtNext}
                status={statusOf(card)}
              />
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

/* ──────────────────────────────────────────────────────────────────
   VOCAB ROW
   ────────────────────────────────────────────────────────────────── */

function VocabRow({ word, card, info, isOpen, onToggle, onSpeak, fmtNext, status }) {
  const hasExample = !!info?.example;
  const hasRelated = !!info?.related;
  const hasTip = !!info?.memoryTip;
  const hasHint = hasExample || hasRelated || hasTip;

  return (
    <div
      style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        borderLeft: `4px solid ${status.color}`,
      }}
    >
      <div className="d-flex align-items-start gap-2 p-3">
        <div
          style={{
            fontSize: '1.6rem',
            lineHeight: 1,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${status.color}15`,
            borderRadius: 10,
            flexShrink: 0,
          }}
        >
          {info?.illustration || '📚'}
        </div>
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <strong style={{ fontSize: '1.05rem' }}>{word}</strong>
            {info?.phonetic && (
              <small className="text-muted">{info.phonetic}</small>
            )}
            <button
              type="button"
              className="btn btn-sm btn-link p-0"
              title="Nghe phát âm"
              onClick={(e) => { e.preventDefault(); onSpeak(word); }}
              style={{ fontSize: '0.95rem', textDecoration: 'none' }}
            >
              🔊
            </button>
            {hasHint && (
              <button
                type="button"
                onClick={onToggle}
                title="Xem gợi ý ghép câu, mẹo nhớ và bài tập điền chỗ trống"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 999,
                  border: `1px solid ${isOpen ? TOKENS.primary : '#d1d5db'}`,
                  background: isOpen ? TOKENS.primary : '#fff',
                  color: isOpen ? '#fff' : '#374151',
                  cursor: 'pointer',
                }}
              >
                {isOpen ? '▲ Ẩn gợi ý' : '💬 Gợi ý ghép câu'}
              </button>
            )}
          </div>
          {info?.meaning && (
            <div className="text-dark mt-1" style={{ fontSize: '.92rem' }}>{info.meaning}</div>
          )}
          {!info && (
            <div className="small text-muted fst-italic">
              Chưa có dữ liệu chi tiết cho từ này.
            </div>
          )}
        </div>
        <div className="text-end" style={{ minWidth: 100 }}>
          <div
            style={{
              display: 'inline-block',
              background: `${status.color}15`,
              color: status.color,
              borderRadius: 999,
              padding: '2px 10px',
              fontSize: '.72rem',
              fontWeight: 600,
            }}
          >
            {status.emoji} {status.label}
          </div>
          <div className="small text-muted mt-1" style={{ fontSize: '.7rem' }}>
            🗓️ {fmtNext(card)}
          </div>
          <div className="small mt-1" style={{ fontSize: '.7rem', color: '#6b7280' }}>
            🔁 {card.repetitions || 0} lần
          </div>
        </div>
      </div>

      {isOpen && hasHint && (
        <div className="px-3 pb-3">
          <div
            className="p-3 rounded-3"
            style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
          >
            {hasTip && (
              <div
                className="mb-3 px-3 py-2 rounded-3"
                style={{
                  background: TOKENS.goldBg,
                  color: '#7a5b1f',
                  border: `1px dashed ${TOKENS.goldBorder}`,
                  fontSize: '.88rem',
                }}
              >
                <strong>💡 Mẹo nhớ:</strong> {info.memoryTip}
              </div>
            )}

            {hasExample && (
              <ClozePractice
                sentence={info.example}
                word={word}
                onSpeakSentence={() => onSpeak(info.example)}
              />
            )}

            {hasRelated && (
              <div className="mt-3">
                <small className="fw-bold text-muted d-block mb-1">🔗 Từ liên quan / cụm thường gặp:</small>
                <div className="d-flex flex-wrap gap-1">
                  {info.related.split(/[,;]/).map((r, i) => {
                    const t = r.trim();
                    if (!t) return null;
                    return (
                      <span
                        key={i}
                        onClick={() => onSpeak(t)}
                        title="Nhấn để nghe phát âm"
                        style={{
                          background: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: 999,
                          padding: '3px 10px',
                          fontSize: '.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        {t}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {(info.sourceIcon || info.sourceTitle) && (
              <small className="text-muted d-block mt-3" style={{ fontSize: '.75rem' }}>
                Nguồn: {info.sourceIcon} {info.sourceTitle}
              </small>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   CLOZE PRACTICE — Bài tập điền vào chỗ trống TƯƠNG TÁC
   ────────────────────────────────────────────────────────────────── */

function ClozePractice({ sentence, word, onSpeakSentence }) {
  const [mode, setMode] = useState('view'); // view | cloze
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null); // null | 'correct' | 'wrong'
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef(null);

  const split = useMemo(() => splitClozeSentence(sentence, word), [sentence, word]);

  useEffect(() => {
    if (mode === 'cloze' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  function reset() {
    setValue('');
    setResult(null);
    setRevealed(false);
  }

  function handleCheck() {
    if (!split) return;
    if (checkClozeAnswer(value, split.answer)) {
      setResult('correct');
    } else {
      setResult('wrong');
    }
  }

  function handleReveal() {
    if (!split) return;
    setValue(split.answer);
    setRevealed(true);
    setResult('correct');
  }

  function handleSwitchToCloze() {
    setMode('cloze');
    reset();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (result === 'correct' || revealed) {
        reset();
      } else {
        handleCheck();
      }
    }
  }

  const cantCloze = !split;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
        <small className="fw-bold text-muted">📝 Câu ví dụ:</small>
        <div className="d-flex gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => { setMode('view'); reset(); }}
            style={{
              fontSize: '.72rem',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 999,
              border: `1px solid ${mode === 'view' ? TOKENS.primary : '#d1d5db'}`,
              background: mode === 'view' ? TOKENS.primary : '#fff',
              color: mode === 'view' ? '#fff' : '#374151',
              cursor: 'pointer',
            }}
          >
            👁️ Xem câu
          </button>
          <button
            type="button"
            onClick={handleSwitchToCloze}
            disabled={cantCloze}
            title={cantCloze ? 'Câu ví dụ không chứa từ này' : 'Tự điền từ vào chỗ trống'}
            style={{
              fontSize: '.72rem',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 999,
              border: `1px solid ${mode === 'cloze' ? '#f59e0b' : '#d1d5db'}`,
              background: mode === 'cloze' ? '#f59e0b' : '#fff',
              color: mode === 'cloze' ? '#fff' : '#374151',
              cursor: cantCloze ? 'not-allowed' : 'pointer',
              opacity: cantCloze ? 0.5 : 1,
            }}
          >
            ✏️ Điền chỗ trống
          </button>
          <button
            type="button"
            onClick={onSpeakSentence}
            style={{
              fontSize: '.72rem',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 999,
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            🔊 Nghe câu
          </button>
        </div>
      </div>

      {mode === 'view' ? (
        <p
          className="fst-italic mb-0"
          style={{ lineHeight: 1.6, fontSize: '.92rem', color: '#374151' }}
        >
          "{highlightWordInSentence(sentence, word)}"
        </p>
      ) : (
        <div>
          <p className="mb-2" style={{ lineHeight: 1.9, fontSize: '.95rem', color: '#374151' }}>
            <span className="fst-italic">"{split?.before}</span>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => { setValue(e.target.value); setResult(null); }}
              onKeyDown={handleKeyDown}
              placeholder="..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              style={{
                display: 'inline-block',
                minWidth: 110,
                width: `${Math.max(110, (value.length || 6) * 11)}px`,
                margin: '0 4px',
                padding: '2px 10px',
                fontSize: '.95rem',
                fontWeight: 600,
                fontStyle: 'normal',
                textAlign: 'center',
                border: 'none',
                borderBottom: `2px solid ${
                  result === 'correct' ? '#10b981'
                  : result === 'wrong' ? '#ef4444'
                  : '#f59e0b'
                }`,
                background:
                  result === 'correct' ? '#ecfdf5'
                  : result === 'wrong' ? '#fef2f2'
                  : '#fffbeb',
                color:
                  result === 'correct' ? '#047857'
                  : result === 'wrong' ? '#b91c1c'
                  : '#92400e',
                outline: 'none',
                borderRadius: 4,
              }}
            />
            <span className="fst-italic">{split?.after}"</span>
          </p>

          {result === 'correct' && (
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-2"
              style={{ background: '#ecfdf5', color: '#047857', fontSize: '.85rem' }}
            >
              ✅ <strong>Chính xác!</strong>
              {revealed && <span className="text-muted">(đã hiện đáp án)</span>}
            </div>
          )}
          {result === 'wrong' && (
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-2"
              style={{ background: '#fef2f2', color: '#b91c1c', fontSize: '.85rem' }}
            >
              ❌ <strong>Chưa đúng.</strong> Thử lại hoặc bấm "Hiện đáp án".
            </div>
          )}

          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCheck}
              disabled={!value.trim() || result === 'correct'}
              style={{
                background: TOKENS.primary,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '4px 14px',
                fontSize: '.82rem',
                fontWeight: 600,
                opacity: !value.trim() || result === 'correct' ? 0.5 : 1,
                cursor: !value.trim() || result === 'correct' ? 'not-allowed' : 'pointer',
              }}
            >
              ✓ Kiểm tra
            </button>
            <button
              type="button"
              onClick={handleReveal}
              style={{
                background: '#fff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                padding: '4px 14px',
                fontSize: '.82rem',
                cursor: 'pointer',
              }}
            >
              👁️ Hiện đáp án
            </button>
            {(result || value) && (
              <button
                type="button"
                onClick={reset}
                style={{
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  padding: '4px 14px',
                  fontSize: '.82rem',
                  cursor: 'pointer',
                }}
              >
                🔄 Thử lại
              </button>
            )}
          </div>
          <small className="text-muted d-block mt-2" style={{ fontSize: '.72rem' }}>
            💡 Mẹo: nhấn <kbd>Enter</kbd> để kiểm tra nhanh. Chấp nhận biến thể đơn giản (s/es/ed/ing).
          </small>
        </div>
      )}
    </div>
  );
}
