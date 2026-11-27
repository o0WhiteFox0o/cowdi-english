import { useState, useRef, useEffect } from 'react';
import Icon from '../../../../components/Icon';
import Emoji from '../../../../components/Emoji';
import ExamReading from '../../ExamReading';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';

/**
 * T-04 Đoạn văn (Slot Đọc — mức Tập trung).
 * Tách từ ReadingPassage / ExamReading trong LessonDetailPage.
 * Cuộn trong khung đoạn văn nếu dài (không cuộn cấp trang). Xong khi trả lời hết câu hỏi hiểu bài.
 */
export default function T04Reading({ lesson, rules, onEvent, onDone, sandbox, play, extra }) {
  const reading = lesson?.reading;
  const startRef = useRef(Date.now());
  const ttsRate = rules?.ttsRate ?? 0.85;

  const [showTranslation, setShowTranslation] = useState(false);
  const [activeWord, setActiveWord] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  useEffect(() => {
    onEvent?.('item_shown', { itemId: `reading-${lesson?.id}`, wordIds: [] });
    return () => stopSpeaking();
  }, [lesson?.id, onEvent]);

  // Hỗ trợ bài đọc học thuật có examQuestions[]
  if (Array.isArray(reading?.examQuestions) && reading.examQuestions.length > 0) {
    return (
      <div className="ss-screen-inner ss-scroll-inner">
        <ExamReading
          lesson={lesson}
          onSpeak={(t) => speakWord(t, { rate: ttsRate }).catch(() => {})}
          onSpeakSlow={(t) => speakWord(t, { rate: 0.55 }).catch(() => {})}
          addXP={sandbox ? undefined : extra?.addXP}
          showToast={extra?.showToast}
          play={play}
        />
        <div className="ss-bottom-nav mt-2">
          <button
            type="button"
            className="btn btn-cowdi-primary ss-tap-btn flex-grow-1"
            onClick={() => onDone?.({
              code: 'T-04',
              slot: 'read',
              total: reading.examQuestions.length,
              firstTryCorrect: reading.examQuestions.length,
              durationMs: Date.now() - startRef.current,
            })}
          >
            Tiếp tục ›
          </button>
        </div>
      </div>
    );
  }

  if (!reading?.passage) {
    return (
      <div className="ss-empty-box">
        <p className="text-muted mb-3">Bài này chưa có đoạn văn.</p>
        <button
          type="button"
          className="btn btn-cowdi-primary"
          onClick={() => onDone?.({ code: 'T-04', slot: 'read', total: 0, firstTryCorrect: 0, durationMs: 0 })}
        >
          Tiếp ›
        </button>
      </div>
    );
  }

  const vocabMap = {};
  (lesson.vocabulary || []).forEach((v) => {
    vocabMap[v.word.toLowerCase()] = v;
  });

  const handleWordClick = (raw) => {
    const clean = raw.toLowerCase().replace(/[^a-z\s'-]/g, '').trim();
    const found = vocabMap[clean] || Object.values(vocabMap).find((v) => clean.includes(v.word.toLowerCase()));
    if (found) {
      setActiveWord(found);
      speakWord(found.word, { rate: ttsRate }).catch(() => {});
    }
  };

  const renderHighlightedText = (text) => {
    const highlights = (reading.highlights || [])
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    if (!highlights.length) return text;
    const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = String(text || '').split(re);
    return parts.map((part, i) => {
      const isHit = highlights.some((h) => h.toLowerCase() === part.toLowerCase());
      if (!isHit) return <span key={i}>{part}</span>;
      return (
        <button
          key={i}
          type="button"
          className="reading-hl-word"
          onClick={() => handleWordClick(part)}
          style={{
            background: '#FFF3CD',
            border: 'none',
            borderBottom: '2px solid #E9A400',
            borderRadius: 4,
            padding: '0 3px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {part}
        </button>
      );
    });
  };

  const questions = reading.questions || [];

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    let correct = 0;
    questions.forEach((q, qi) => {
      const ok = answers[qi] === q.correct;
      const wordIds = Array.isArray(q.targetWords) ? q.targetWords.map((w) => getWordId(w)) : [];
      if (ok) {
        correct++;
        onEvent?.('item_correct', { itemId: `t04-q-${qi}`, wordIds, firstTry: true, skill: 'read' });
      } else {
        onEvent?.('item_wrong', { itemId: `t04-q-${qi}`, wordIds, correct: q.options?.[q.correct], skill: 'read' });
      }
    });
    play?.(correct === questions.length ? 'correct' : 'click');
    setScoreResult({ correct, total: questions.length });
  };

  const finishScreen = () => {
    stopSpeaking();
    const total = questions.length;
    const firstTryCorrect = scoreResult ? scoreResult.correct : total;
    onDone?.({
      code: 'T-04',
      slot: 'read',
      total,
      firstTryCorrect,
      durationMs: Date.now() - startRef.current,
    });
  };

  return (
    <div className="ss-screen-inner ss-t04">
      <div className="ss-scroll-inner">
        <div className="d-flex gap-2 mb-2 flex-wrap align-items-center">
          <button
            type="button"
            className="btn btn-sm btn-cowdi-primary ss-tap-btn"
            onClick={() => speakWord(reading.passage, { rate: ttsRate }).catch(() => {})}
          >
            <Icon name="sound" size={14} /> Nghe đoạn
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-cowdi ss-tap-btn"
            onClick={() => speakWord(reading.passage, { rate: 0.55 }).catch(() => {})}
          >
            <Icon name="snail" size={14} /> Chậm
          </button>
          {reading.translation && (
            <button
              type="button"
              className={`btn btn-sm ss-tap-btn ${showTranslation ? 'btn-warning' : 'btn-outline-secondary'}`}
              onClick={() => setShowTranslation((v) => !v)}
            >
              <Emoji e="🇻🇳" size={13} /> {showTranslation ? 'Ẩn dịch' : 'Xem dịch'}
            </button>
          )}
        </div>

        <div className="card shadow-sm mb-2">
          <div className="card-body py-2 px-3" style={{ lineHeight: 1.75, fontSize: '0.98rem', whiteSpace: 'pre-line' }}>
            {Array.isArray(reading.paragraphs) && reading.paragraphs.length > 0 ? (
              reading.paragraphs.map((p) => (
                <div key={p.label} className="mb-2">
                  <span className="badge bg-primary me-2">{p.label}</span>
                  {renderHighlightedText(p.en)}
                </div>
              ))
            ) : (
              renderHighlightedText(reading.passage)
            )}
          </div>
        </div>

        {activeWord && (
          <div className="card shadow-sm border-warning mb-2">
            <div className="card-body py-2 px-3 d-flex align-items-center gap-2">
              <div className="flex-grow-1 small">
                <strong>{activeWord.word}</strong>{' '}
                <span className="text-muted">{activeWord.phonetic}</span>
                {' → '}
                <span className="text-cowdi-primary fw-bold">{activeWord.meaning}</span>
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setActiveWord(null)}>✕</button>
            </div>
          </div>
        )}

        {showTranslation && reading.translation && (
          <div className="alert alert-light border py-2 px-3 mb-2 small" style={{ whiteSpace: 'pre-line' }}>
            {reading.translation}
          </div>
        )}

        {questions.length > 0 && (
          <div className="card shadow-sm">
            <div className="card-body py-2 px-3">
              <h6 className="fw-bold text-cowdi-primary mb-2 small">
                <Icon name="question" size={14} /> Câu hỏi hiểu bài ({questions.length})
              </h6>
              {questions.map((q, qi) => (
                <div key={qi} className="mb-2">
                  <div className="fw-bold small mb-1">{qi + 1}. {q.question}</div>
                  <div className="d-flex flex-column gap-1">
                    {q.options.map((opt, oi) => {
                      const picked = answers[qi] === oi;
                      const isCorrect = oi === q.correct;
                      let cls = 'btn btn-sm text-start';
                      if (submitted) {
                        if (isCorrect) cls += ' btn-success';
                        else if (picked) cls += ' btn-danger';
                        else cls += ' btn-outline-secondary';
                      } else {
                        cls += picked ? ' btn-cowdi-primary' : ' btn-outline-secondary';
                      }
                      return (
                        <button
                          key={oi}
                          type="button"
                          className={cls}
                          disabled={submitted}
                          onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && q.explanation && (
                    <div className="alert alert-info py-1 px-2 mt-1 mb-0 small">{q.explanation}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ss-bottom-nav">
        {questions.length > 0 && !submitted ? (
          <button
            type="button"
            className="btn btn-cowdi-primary ss-tap-btn flex-grow-1"
            disabled={Object.keys(answers).length < questions.length}
            onClick={handleSubmit}
          >
            Kiểm tra ({Object.keys(answers).length}/{questions.length})
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-cowdi-primary ss-tap-btn flex-grow-1"
            onClick={finishScreen}
          >
            {scoreResult ? `Tiếp (${scoreResult.correct}/${scoreResult.total} đúng) ›` : 'Tiếp ›'}
          </button>
        )}
      </div>
    </div>
  );
}
