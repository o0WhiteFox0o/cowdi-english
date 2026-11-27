import { useState, useEffect, useRef } from 'react';
import Icon from '../../../../components/Icon';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';

/**
 * T-07 Quiz (Slot Boss — mức Tập trung).
 * Tái sử dụng nguyên vẹn layout Zero-Scroll Quiz (.quiz-viewport-stage, .quiz-question-card, .quiz-sticky-action-bar).
 */
export default function T07Quiz({ items = [], rules, onEvent, onDone, muted, play }) {
  const startRef = useRef(Date.now());
  const ttsRate = rules?.ttsRate ?? 0.85;

  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [correctAnim, setCorrectAnim] = useState(false);
  const [wrongAnim, setWrongAnim] = useState(false);

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
      <div className="card shadow-sm text-center p-4">
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
      setCorrectAnim(true);
      setTimeout(() => setCorrectAnim(false), 600);
      play?.('correct');
      onEvent?.('item_correct', {
        itemId: `t07-${qIndex}`,
        wordIds,
        firstTry: true,
        skill: q.skill || 'boss',
        question: q,
      });
    } else {
      setWrongAnim(true);
      setTimeout(() => setWrongAnim(false), 500);
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
    <div className="fade-in position-relative quiz-viewport-stage">
      <div className="quiz-top-bar">
        <span className="text-muted fw-bold small">Boss · Câu {qIndex + 1}/{items.length}</span>
        <span className="badge bg-warning text-dark"><Icon name="star" size={14} /> {score}</span>
      </div>
      <div className="progress" style={{ height: '6px' }}>
        <div
          className="progress-bar progress-bar-cowdi"
          role="progressbar"
          style={{ width: `${((qIndex + 1) / items.length) * 100}%` }}
        />
      </div>

      <div className={`card shadow-sm quiz-question-card ${correctAnim ? 'correct-flash' : ''} ${wrongAnim ? 'wrong-shake' : ''}`}>
        <div className="card-body text-center">
          {isListeningQ && (
            <div className="mb-1">
              <span className="badge bg-info text-dark">🎧 Câu hỏi nghe</span>
            </div>
          )}
          <p className="fs-5 fw-bold mb-2">{q.question}</p>
          {isListeningQ && (answered !== null || muted) && (
            <p className="small fst-italic text-muted mb-2">“{q.audioText}”</p>
          )}
          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className={`btn btn-sm ${isListeningQ ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
              onClick={() => (isListeningQ ? speakWord(q.audioText, { rate: ttsRate, lang: 'en-US' }) : speakWord(q.question, { rate: ttsRate })).catch(() => {})}
              title="Nghe lại"
            >
              <Icon name="sound" size={14} /> Nghe lại
            </button>
            {isListeningQ && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => speakWord(q.audioText, { rate: 0.55, lang: 'en-US' }).catch(() => {})}
                title="Nghe chậm"
              >
                <Icon name="snail" size={14} /> Chậm
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row g-2" key={qIndex}>
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
            <div className="col-12 col-md-6" key={`${qIndex}-${i}`}>
              <button type="button" className={cls} onClick={() => handleAnswer(i)} disabled={answered !== null}>
                <span className="me-2 fw-bold text-muted">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            </div>
          );
        })}
      </div>

      {answered !== null && (
        <div className={`quiz-sticky-action-bar fade-in ${isRight ? 'is-correct' : 'is-wrong'}`}>
          <div className="quiz-sticky-feedback">
            <div className={`fw-bold ${isRight ? 'text-success' : 'text-danger'}`}>
              {isRight ? <><Icon name="check" size={16} /> Chính xác! Giỏi lắm!</> : <><Icon name="x" size={16} /> Đáp án đúng: {q.options[q.correct]}</>}
            </div>
            {q.explanation && (
              <div className="small text-dark mt-1">
                <strong>Giải thích:</strong> {q.explanation}
              </div>
            )}
          </div>
          <div className="quiz-sticky-actions">
            <button type="button" className="btn btn-cowdi-primary px-4" onClick={handleNext}>
              {qIndex + 1 < items.length ? 'Câu tiếp theo →' : 'Xem kết quả →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
