import { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../../../../components/Icon';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { mulberry32, seededShuffle, hashString } from '../seededRandom';

/**
 * T-05 Nghe câu (Slot Nghe — mức Tập trung).
 * Tái sử dụng nguyên vẹn layout tab Nghe câu của LessonDetailPage (gradient hồng-tím, 2x2 options, .quiz-sticky-action-bar).
 */
export default function T05Listen({ lesson, items = [], rules, onEvent, onDone, muted, play, seed }) {
  const startRef = useRef(Date.now());
  const ttsRate = rules?.ttsRate ?? 0.85;

  const questions = useMemo(() => {
    if (!items.length) return [];
    const rng = mulberry32(hashString(`t05:${lesson?.id || ''}:${seed || 1}`));
    const picked = seededShuffle(items, rng).slice(0, Math.min(6, items.length));
    return picked.map((s) => {
      const others = items.filter((x) => x.vi !== s.vi);
      const distractors = seededShuffle(others, rng).slice(0, 3).map((x) => x.vi);
      while (distractors.length < 3) {
        const extra = items.find((x) => x.vi !== s.vi && !distractors.includes(x.vi))?.vi;
        if (extra) distractors.push(extra);
        else distractors.push(`(khác ${distractors.length + 1})`);
      }
      const options = seededShuffle([s.vi, ...distractors], rng);
      return {
        sentence: s.en,
        meaning: s.vi,
        label: s.label,
        wordIds: s.wordIds || [],
        options,
        correct: options.indexOf(s.vi),
      };
    });
  }, [items, lesson?.id, seed]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);

  const q = questions[idx];

  useEffect(() => {
    if (!q) return;
    onEvent?.('item_shown', { itemId: `t05-${idx}`, wordIds: q.wordIds });
    if (!muted) {
      const t = setTimeout(() => {
        speakWord(q.sentence, { rate: ttsRate }).catch(() => {});
      }, 280);
      return () => {
        clearTimeout(t);
        stopSpeaking();
      };
    }
    return undefined;
  }, [idx, q, muted, ttsRate, onEvent]);

  useEffect(() => () => stopSpeaking(), []);

  if (!q) {
    return (
      <div className="card shadow-sm text-center p-4">
        <p className="text-muted mb-3">Bài này chưa đủ câu nghe.</p>
        <button
          type="button"
          className="btn btn-cowdi-primary"
          onClick={() => onDone?.({ code: 'T-05', slot: 'listen', total: 0, firstTryCorrect: 0, durationMs: 0 })}
        >
          Tiếp ›
        </button>
      </div>
    );
  }

  const handlePick = (optIdx) => {
    if (picked !== null) return;
    setPicked(optIdx);
    const ok = optIdx === q.correct;
    if (ok) {
      setFirstTryCorrect((c) => c + 1);
      play?.('correct');
      onEvent?.('item_correct', { itemId: `t05-${idx}`, wordIds: q.wordIds, firstTry: true, skill: 'listen' });
    } else {
      play?.('wrong');
      onEvent?.('item_wrong', { itemId: `t05-${idx}`, wordIds: q.wordIds, correct: q.options[q.correct], skill: 'listen' });
    }
  };

  const handleNext = () => {
    stopSpeaking();
    if (idx + 1 < questions.length) {
      setIdx((i) => i + 1);
      setPicked(null);
    } else {
      onDone?.({
        code: 'T-05',
        slot: 'listen',
        total: questions.length,
        firstTryCorrect,
        durationMs: Date.now() - startRef.current,
      });
    }
  };

  return (
    <div className="card shadow-sm" style={{ borderRadius: 16, maxWidth: 720, margin: '0 auto' }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-light text-muted">{q.label || 'Nghe câu'}</span>
          <small className="text-muted fw-bold">{idx + 1} / {questions.length}</small>
        </div>
        <div className="progress mb-3" style={{ height: 6, borderRadius: 999 }}>
          <div
            className="progress-bar progress-bar-cowdi"
            style={{ width: `${((idx + 1) / questions.length) * 100}%`, transition: 'width .3s' }}
          />
        </div>

        {/* Audio area — giữ nguyên thiết kế cũ */}
        <div
          className="text-center text-white py-2 px-3 mb-2"
          style={{
            background: 'linear-gradient(135deg, #FF6B9D 0%, #A29BFE 100%)',
            borderRadius: 14,
            boxShadow: '0 4px 14px rgba(255,107,157,.2)',
          }}
        >
          <p className="mb-1 opacity-90 small">
            {muted ? `🔇 Đang tắt tiếng — "${q.sentence}"` : '🎧 Nghe câu sau và chọn nghĩa đúng'}
          </p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <button
              type="button"
              onClick={() => speakWord(q.sentence, { rate: ttsRate }).catch(() => {})}
              style={{
                background: 'rgba(255,255,255,.22)',
                border: '1px solid rgba(255,255,255,.4)',
                color: '#fff',
                borderRadius: 999,
                padding: '5px 14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Icon name="sound" size={16} /> Nghe lại
            </button>
            <button
              type="button"
              onClick={() => speakWord(q.sentence, { rate: 0.55 }).catch(() => {})}
              style={{
                background: 'rgba(255,255,255,.22)',
                border: '1px solid rgba(255,255,255,.4)',
                color: '#fff',
                borderRadius: 999,
                padding: '5px 14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Icon name="turtle" size={16} /> Chậm
            </button>
            {picked !== null && (
              <span
                style={{
                  background: '#fff',
                  color: '#E0527E',
                  borderRadius: 999,
                  padding: '5px 14px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                <Icon name="note" size={14} /> {q.sentence}
              </span>
            )}
          </div>
        </div>

        {/* Options 2x2 gốc */}
        <div className="row g-2">
          {q.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrect = i === q.correct;
            const showResult = picked !== null;
            let cls = 'btn w-100 text-start py-2 px-3 quiz-option-btn';
            if (showResult) {
              if (isCorrect) cls += ' btn-success';
              else if (isPicked) cls += ' btn-danger';
              else cls += ' btn-outline-secondary';
            } else {
              cls += ' btn-outline-cowdi';
            }
            return (
              <div className="col-12 col-md-6" key={i}>
                <button
                  type="button"
                  className={cls}
                  style={{ borderRadius: 12, fontSize: '.92rem' }}
                  onClick={() => handlePick(i)}
                  disabled={showResult}
                >
                  <strong className="me-2">{String.fromCharCode(65 + i)}.</strong>
                  {opt}
                  {showResult && isCorrect && <span className="float-end"><Icon name="check" size={16} /></span>}
                  {showResult && isPicked && !isCorrect && <span className="float-end"><Icon name="x" size={16} /></span>}
                </button>
              </div>
            );
          })}
        </div>

        {/* Sticky Feedback + Next bar gốc */}
        {picked !== null && (
          <div className={`quiz-sticky-action-bar mt-2 fade-in ${picked === q.correct ? 'is-correct' : 'is-wrong'}`}>
            <div className="quiz-sticky-feedback">
              {picked === q.correct ? (
                <span className="text-success fw-bold">
                  <Icon name="check" size={16} /> Chính xác! <em>“{q.sentence}”</em>
                </span>
              ) : (
                <span className="text-danger fw-bold">
                  <Icon name="x" size={16} /> Đáp án: <em>“{q.options[q.correct]}”</em>
                </span>
              )}
            </div>
            <div className="quiz-sticky-actions">
              <button type="button" className="btn btn-cowdi-primary px-4" onClick={handleNext}>
                {idx + 1 < questions.length ? 'Câu tiếp theo →' : 'Xong màn nghe →'}
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-3">
          <small className="text-muted">
            Điểm hiện tại: <strong>{firstTryCorrect}</strong> / {idx + (picked !== null ? 1 : 0)}
          </small>
        </div>
      </div>
    </div>
  );
}
