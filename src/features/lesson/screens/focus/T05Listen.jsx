import { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../../../../components/Icon';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { mulberry32, seededShuffle, hashString } from '../seededRandom';

/**
 * T-05 Nghe câu (Slot Nghe — mức Tập trung).
 * Tách từ tab Nghe câu trong LessonDetailPage, bỏ màn mở đầu phụ (tối đa 6 câu theo PHASE1 §3).
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
      <div className="ss-empty-box">
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
    <div className="ss-screen-inner ss-t05">
      <div className="ss-subbar">
        <span className="ss-subbar-badge">{q.label || 'Nghe câu'}</span>
        <span className="ss-subbar-count">{idx + 1} / {questions.length}</span>
      </div>

      <div
        className="text-center text-white py-2 px-3 mb-2"
        style={{
          background: 'linear-gradient(135deg, #2F7FD1 0%, #5B9FE8 100%)',
          borderRadius: 14,
        }}
      >
        <p className="mb-1 opacity-90 small">
          {muted ? `🔇 Đang tắt tiếng — câu: "${q.sentence}"` : '🎧 Nghe câu tiếng Anh và chọn nghĩa đúng'}
        </p>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <button
            type="button"
            className="ss-audio-pill"
            onClick={() => speakWord(q.sentence, { rate: ttsRate }).catch(() => {})}
          >
            <Icon name="sound" size={16} /> Nghe lại
          </button>
          <button
            type="button"
            className="ss-audio-pill"
            onClick={() => speakWord(q.sentence, { rate: 0.55 }).catch(() => {})}
          >
            <Icon name="turtle" size={16} /> Chậm
          </button>
          {picked !== null && (
            <span className="ss-audio-reveal">{q.sentence}</span>
          )}
        </div>
      </div>

      <div className="row g-2 flex-grow-1 align-content-start">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === q.correct;
          const showResult = picked !== null;
          let cls = 'btn w-100 text-start py-2 px-3 quiz-option-btn ss-tap-btn';
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
                onClick={() => handlePick(i)}
                disabled={showResult}
              >
                <strong className="me-2">{String.fromCharCode(65 + i)}.</strong>
                {opt}
              </button>
            </div>
          );
        })}
      </div>

      {picked !== null && (
        <div className="ss-bottom-nav mt-2">
          <div className="flex-grow-1 small fw-bold">
            {picked === q.correct ? (
              <span className="text-success">✓ Chính xác!</span>
            ) : (
              <span className="text-danger">✗ Đáp án: {q.options[q.correct]}</span>
            )}
          </div>
          <button type="button" className="btn btn-cowdi-primary ss-tap-btn px-4" onClick={handleNext}>
            {idx + 1 < questions.length ? 'Tiếp ›' : 'Xong màn ›'}
          </button>
        </div>
      )}
    </div>
  );
}
