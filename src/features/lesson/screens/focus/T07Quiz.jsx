import { useState, useEffect, useRef } from 'react';
import Icon from '../../../../components/Icon';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';

/**
 * T-07 Quiz (Slot Boss — mức Tập trung).
 * Tách từ Quiz trong LessonDetailPage, bỏ màn "Bắt đầu Quiz" thừa;
 * tự phát audioText nếu câu nghe, gửi sự kiện chuẩn và trả kết quả Boss về ScreenHost.
 */
export default function T07Quiz({ items = [], rules, onEvent, onDone, muted, play }) {
  const startRef = useRef(Date.now());
  const ttsRate = rules?.ttsRate ?? 0.85;

  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const q = items[qIndex];
  const isListeningQ = Boolean(q?.audioText);

  useEffect(() => {
    if (!q) return;
    const wordIds = Array.isArray(q.targetWords) ? q.targetWords.map((w) => getWordId(w)) : [];
    onEvent?.('item_shown', { itemId: `t07-${qIndex}`, wordIds });

    if (!muted) {
      const t = setTimeout(() => {
        if (q.audioText) speakWord(q.audioText, { rate: ttsRate, lang: 'en-US' }).catch(() => {});
      }, 250);
      return () => {
        clearTimeout(t);
        stopSpeaking();
      };
    }
    return undefined;
  }, [qIndex, q, muted, ttsRate, onEvent]);

  useEffect(() => () => stopSpeaking(), []);

  if (!q) {
    return (
      <div className="ss-empty-box">
        <p className="text-muted mb-3">Bài này chưa có câu hỏi Quiz.</p>
        <button
          type="button"
          className="btn btn-cowdi-primary"
          onClick={() => onDone?.({ code: 'T-07', slot: 'boss', total: 0, firstTryCorrect: 0, score: 0, wrongAnswers: [], durationMs: 0 })}
        >
          Xem kết quả ›
        </button>
      </div>
    );
  }

  const handleAnswer = (idx) => {
    if (answered !== null) return;
    setAnswered(idx);
    const ok = idx === q.correct;
    const wordIds = Array.isArray(q.targetWords) ? q.targetWords.map((w) => getWordId(w)) : [];
    if (ok) {
      setScore((s) => s + 1);
      play?.('correct');
      onEvent?.('item_correct', {
        itemId: `t07-${qIndex}`,
        wordIds,
        firstTry: true,
        skill: q.skill || 'boss',
        question: q,
      });
    } else {
      setWrongAnswers((prev) => [
        ...prev,
        {
          question: q.question,
          picked: q.options[idx],
          correct: q.options[q.correct],
          explanation: q.explanation || '',
        },
      ]);
      play?.('wrong');
      onEvent?.('item_wrong', {
        itemId: `t07-${qIndex}`,
        wordIds,
        correct: q.options[q.correct],
        skill: q.skill || 'boss',
        question: q,
      });
    }
  };

  const handleNext = () => {
    stopSpeaking();
    if (qIndex + 1 < items.length) {
      setQIndex((i) => i + 1);
      setAnswered(null);
    } else {
      onDone?.({
        code: 'T-07',
        slot: 'boss',
        total: items.length,
        firstTryCorrect: score,
        score,
        wrongAnswers,
        durationMs: Date.now() - startRef.current,
      });
    }
  };

  const isRight = answered !== null && answered === q.correct;

  return (
    <div className="ss-screen-inner ss-t07">
      <div className="ss-subbar">
        <span className="ss-subbar-badge">Boss · Câu {qIndex + 1}/{items.length}</span>
        <span className="badge bg-warning text-dark"><Icon name="star" size={13} /> {score}</span>
      </div>

      <div className="card shadow-sm mb-2">
        <div className="card-body text-center py-2 px-3">
          {isListeningQ && <span className="badge bg-info text-dark mb-1">🎧 Câu hỏi nghe</span>}
          <p className="fw-bold mb-2" style={{ fontSize: '1.05rem' }}>{q.question}</p>
          {isListeningQ && (answered !== null || muted) && (
            <p className="small fst-italic text-muted mb-1">“{q.audioText}”</p>
          )}
          {isListeningQ && (
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-cowdi-primary"
                onClick={() => speakWord(q.audioText, { rate: ttsRate, lang: 'en-US' }).catch(() => {})}
              >
                <Icon name="sound" size={14} /> Nghe lại
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => speakWord(q.audioText, { rate: 0.55, lang: 'en-US' }).catch(() => {})}
              >
                <Icon name="snail" size={14} /> Chậm
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="row g-2 flex-grow-1 align-content-start">
        {q.options.map((opt, i) => {
          let cls = 'btn w-100 text-start quiz-option-btn ss-tap-btn';
          if (answered !== null) {
            if (i === q.correct) cls += ' btn-success';
            else if (i === answered) cls += ' btn-danger';
            else cls += ' btn-outline-secondary';
          } else {
            cls += ' btn-outline-primary';
          }
          return (
            <div className="col-12 col-md-6" key={`${qIndex}-${i}`}>
              <button
                type="button"
                className={cls}
                onClick={() => handleAnswer(i)}
                disabled={answered !== null}
              >
                <span className="me-2 fw-bold">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            </div>
          );
        })}
      </div>

      {answered !== null && (
        <div className="ss-bottom-nav mt-2">
          <div className="flex-grow-1 small">
            <div className={`fw-bold ${isRight ? 'text-success' : 'text-danger'}`}>
              {isRight ? '✓ Chính xác!' : `✗ Đáp án đúng: ${q.options[q.correct]}`}
            </div>
            {q.explanation && <div className="text-muted text-truncate">{q.explanation}</div>}
          </div>
          <button type="button" className="btn btn-cowdi-primary ss-tap-btn px-4" onClick={handleNext}>
            {qIndex + 1 < items.length ? 'Tiếp ›' : 'Kết quả ›'}
          </button>
        </div>
      )}
    </div>
  );
}
