import { useState, useRef, useEffect } from 'react';
import Icon from '../../../../components/Icon';
import Emoji from '../../../../components/Emoji';
import ExamReading from '../../ExamReading';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';

/**
 * T-04 Đoạn văn (Slot Đọc — mức Tập trung).
 * Tái sử dụng nguyên vẹn layout ReadingPassage / ExamReading của LessonDetailPage.
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

  if (Array.isArray(reading?.examQuestions) && reading.examQuestions.length > 0) {
    return (
      <div className="fade-in">
        <ExamReading
          lesson={lesson}
          onSpeak={(t) => speakWord(t, { rate: ttsRate }).catch(() => {})}
          onSpeakSlow={(t) => speakWord(t, { rate: 0.55 }).catch(() => {})}
          addXP={sandbox ? undefined : extra?.addXP}
          showToast={extra?.showToast}
          play={play}
        />
        <div className="lesson-step-footer mt-3">
          <div className="lesson-step-footer-txt">
            <small className="text-muted">Đọc hiểu học thuật</small>
            <b>Hoàn tất phần đọc hiểu</b>
          </div>
          <button
            type="button"
            className="btn btn-cowdi-primary btn-lg d-inline-flex align-items-center gap-2"
            onClick={() => onDone?.({
              code: 'T-04',
              slot: 'read',
              total: reading.examQuestions.length,
              firstTryCorrect: reading.examQuestions.length,
              durationMs: Date.now() - startRef.current,
            })}
          >
            Tiếp › <Icon name="play" size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (!reading?.passage) {
    return (
      <div className="card shadow-sm text-center p-4">
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

  const submitQuiz = () => {
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
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Header gốc của ReadingPassage */}
      <div className="card shadow-sm mb-3 bg-cowdi-gradient text-white">
        <div className="card-body py-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div style={{ fontSize: '2.2rem' }} className="emoji-big"><Icon name="books" size={40} /></div>
            <div className="flex-grow-1">
              <h5 className="fw-bold mb-1">{reading.title}</h5>
              <small className="opacity-75">
                Vận dụng {(reading.highlights || []).length} từ đã học · Click vào từ in đậm để xem nghĩa
                {reading.autoGenerated && ' · (đoạn ghép từ ví dụ)'}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar gốc */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button type="button" className="btn btn-sm btn-cowdi-primary" onClick={() => speakWord(reading.passage, { rate: ttsRate }).catch(() => {})}>
          <Icon name="sound" size={14} /> Nghe toàn bộ
        </button>
        <button type="button" className="btn btn-sm btn-outline-cowdi" onClick={() => speakWord(reading.passage, { rate: 0.55 }).catch(() => {})}>
          <Icon name="snail" size={14} /> Nghe chậm
        </button>
        {reading.translation && (
          <button
            type="button"
            className={`btn btn-sm ${showTranslation ? 'btn-warning' : 'btn-outline-secondary'}`}
            onClick={() => setShowTranslation((v) => !v)}
          >
            {showTranslation ? <><Icon name="monkey" size={14} /> Ẩn dịch</> : <><Emoji e="🇻🇳" size={14} /> Xem dịch</>}
          </button>
        )}
      </div>

      {/* Passage gốc */}
      <div className="card shadow-sm mb-3">
        <div className="card-body" style={{ lineHeight: 1.9, fontSize: '1.08rem', whiteSpace: 'pre-line' }}>
          {Array.isArray(reading.paragraphs) && reading.paragraphs.length > 0 ? (
            reading.paragraphs.map((p) => (
              <div key={p.label} className="mb-3">
                <span className="badge bg-primary me-2">{p.label}</span>
                {renderHighlightedText(p.en)}
              </div>
            ))
          ) : (
            renderHighlightedText(reading.passage)
          )}
        </div>
      </div>

      {/* Active word popup gốc */}
      {activeWord && (
        <div className="card shadow-sm border-warning mb-3">
          <div className="card-body d-flex align-items-center gap-3 flex-wrap">
            <div style={{ fontSize: '2rem' }} className="emoji-big"><Emoji e={activeWord.illustration || '📖'} size={36} /></div>
            <div className="flex-grow-1">
              <div className="fw-bold fs-5">
                {activeWord.word}{' '}
                {activeWord.pos && <span className="badge bg-light text-secondary border me-1 small">{activeWord.pos}</span>}
                <small className="text-muted fw-normal">{activeWord.phonetic}</small>
              </div>
              <div className="text-cowdi-primary">→ {activeWord.meaning}</div>
              {activeWord.example && <div className="small fst-italic text-muted mt-1">“{activeWord.example}”</div>}
              {activeWord.exampleVi && <div className="small text-muted">→ {activeWord.exampleVi}</div>}
            </div>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => speakWord(activeWord.word, { rate: ttsRate }).catch(() => {})}>
              <Icon name="sound" size={14} />
            </button>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setActiveWord(null)}>✕</button>
          </div>
        </div>
      )}

      {showTranslation && reading.translation && (
        <div className="alert alert-light border" style={{ whiteSpace: 'pre-line' }}>
          <div className="fw-bold text-muted small mb-1"><Emoji e="🇻🇳" size={13} /> Dịch nghĩa</div>
          <div>{reading.translation}</div>
        </div>
      )}

      {/* Comprehension quiz gốc */}
      {questions.length > 0 ? (
        <div className="card shadow-sm mt-3">
          <div className="card-body">
            <h6 className="fw-bold text-cowdi-primary mb-3">
              <Icon name="question" size={16} /> Câu hỏi hiểu bài ({questions.length})
            </h6>
            {questions.map((q, qi) => (
              <div key={qi} className="mb-3">
                <div className="fw-bold mb-2">{qi + 1}. {q.question}</div>
                <div className="d-flex flex-column gap-2">
                  {q.options.map((opt, oi) => {
                    const picked = answers[qi] === oi;
                    const isCorrect = oi === q.correct;
                    let cls = 'btn text-start';
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
                  <div className="alert alert-info py-2 px-3 mt-2 mb-0 small">
                    <strong>Giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
            <div className="d-flex gap-2 mt-3">
              {!submitted ? (
                <button
                  type="button"
                  className="btn btn-cowdi-primary"
                  disabled={Object.keys(answers).length < questions.length}
                  onClick={submitQuiz}
                >
                  <Icon name="check" size={16} /> Nộp bài
                </button>
              ) : (
                <button type="button" className="btn btn-cowdi-primary btn-lg" onClick={finishScreen}>
                  Tiếp tục ({scoreResult?.correct ?? 0}/{questions.length} đúng) ›
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-end mt-3">
          <button type="button" className="btn btn-cowdi-primary btn-lg" onClick={finishScreen}>
            Tiếp ›
          </button>
        </div>
      )}
    </div>
  );
}
