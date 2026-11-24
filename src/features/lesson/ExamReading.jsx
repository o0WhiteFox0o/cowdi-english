// ════════════════════════════════════════════════════════════════
// ExamReading — Màn Reading Luyện thi chuẩn v2 (U8 — MAP-CURRENT-UI.md §3)
// • Desktop: chia đôi 2 cột (trái: bài đọc phân đoạn A–E + cột từ glossary; phải: đề thi)
// • Mobile (< 992px): 2 tab chuyển nhanh (Bài đọc & Từ vựng | Câu hỏi)
// • Đủ 6 dạng EXAM_Q_TYPES: tfng, ynng, mcq, heading, sentence-completion (maxWords), matching-info
// • Đồng hồ timeLimitMin, nút "Xem bằng chứng" tô & cuộn tới evidence.quote, bảng paraphrasePairs
// ════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '../../components/Icon';
import Emoji from '../../components/Emoji';
import { gradeExamAnswer, countAnswerWords } from '../../utils/quiz-gen';

const TYPE_LABELS = {
  tfng: 'TRUE / FALSE / NOT GIVEN',
  ynng: 'YES / NO / NOT GIVEN',
  mcq: 'Trắc nghiệm',
  heading: 'Nối tiêu đề (Matching Headings)',
  'sentence-completion': 'Điền từ vào chỗ trống',
  'matching-info': 'Nối thông tin với đoạn',
};

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function renderQuoteHighlight(text, activeQuote) {
  if (!activeQuote) return text;
  const idx = text.indexOf(activeQuote);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: '#FFE066',
          padding: '2px 4px',
          borderRadius: 4,
          fontWeight: 600,
        }}
      >
        {activeQuote}
      </mark>
      {text.slice(idx + activeQuote.length)}
    </>
  );
}

export default function ExamReading({ lesson, onSpeak, onSpeakSlow, addXP, showToast, play }) {
  const reading = lesson.reading;
  const paragraphs = reading.paragraphs || [];
  const examQuestions = reading.examQuestions || [];
  const glossary = reading.glossary || [];
  const paraphrasePairs = reading.paraphrasePairs || [];
  const timeLimitSec = (Number(reading.timeLimitMin) || 20) * 60;
  const rewardKey = `cowdi_reading_rewarded:${lesson.id}`;

  const [mobileTab, setMobileTab] = useState('passage'); // 'passage' | 'questions'
  const [showTranslation, setShowTranslation] = useState(false);
  const [showGlossary, setShowGlossary] = useState(true);
  const [showParaphrases, setShowParaphrases] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState(null); // { paragraph, quote, qIdx }

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSec);
  const [timerRunning, setTimerRunning] = useState(false);

  // Answers & submission
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [rewarded, setRewarded] = useState(() => {
    try { return localStorage.getItem(rewardKey) === '1'; } catch { return false; }
  });

  const paraRefs = useRef({});

  useEffect(() => {
    if (!timerRunning || submitted) return;
    if (secondsLeft <= 0) {
      setTimerRunning(false);
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [timerRunning, secondsLeft, submitted]);

  // Gom glossary theo đoạn A, B, C…
  const glossaryByPara = useMemo(() => {
    const map = {};
    for (const g of glossary) {
      const p = g.paragraph || 'Chung';
      if (!map[p]) map[p] = [];
      map[p].push(g);
    }
    return map;
  }, [glossary]);

  const answeredCount = useMemo(() => {
    let n = 0;
    examQuestions.forEach((q, i) => {
      if (gradeExamAnswer(q, answers[i]).answered) n++;
    });
    return n;
  }, [examQuestions, answers]);

  const gradedResults = useMemo(() => {
    if (!submitted) return [];
    return examQuestions.map((q, i) => gradeExamAnswer(q, answers[i]));
  }, [submitted, examQuestions, answers]);

  const totalCorrect = useMemo(
    () => gradedResults.filter((r) => r.isCorrect).length,
    [gradedResults]
  );

  const handleShowEvidence = (ev, qIdx) => {
    if (!ev?.paragraph) return;
    setActiveEvidence({ paragraph: ev.paragraph, quote: ev.quote || '', qIdx });
    setMobileTab('passage');
    setTimeout(() => {
      paraRefs.current[ev.paragraph]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    setTimerRunning(false);
    let correct = 0;
    examQuestions.forEach((q, i) => {
      if (gradeExamAnswer(q, answers[i]).isCorrect) correct++;
    });
    const total = examQuestions.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    if (pct >= 80) {
      play?.('correct');
      if (!rewarded) {
        addXP?.(25);
        setRewarded(true);
        try { localStorage.setItem(rewardKey, '1'); } catch { /* ignore */ }
        showToast?.(`🎉 Đọc hiểu xuất sắc ${correct}/${total}! +25 🥛 Sữa`, 'success');
      } else {
        showToast?.(`🎉 Đúng ${correct}/${total} (${pct}%)!`, 'success');
      }
    } else if (pct >= 50) {
      play?.('click');
      if (!rewarded) {
        addXP?.(10);
        setRewarded(true);
        try { localStorage.setItem(rewardKey, '1'); } catch { /* ignore */ }
        showToast?.(`Đúng ${correct}/${total} (${pct}%). +10 🥛 Sữa`, 'info');
      } else {
        showToast?.(`Đúng ${correct}/${total} (${pct}%).`, 'info');
      }
    } else {
      play?.('wrong');
      showToast?.(`Đúng ${correct}/${total} (${pct}%). Bấm "Xem bằng chứng" để đối chiếu nhé!`, 'warning');
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setActiveEvidence(null);
    setSecondsLeft(timeLimitSec);
    setTimerRunning(false);
  };

  return (
    <div className="fade-in">
      {/* ── Top Exam Banner & Controls ── */}
      <div className="card shadow-sm mb-3 bg-cowdi-gradient text-white">
        <div className="card-body py-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="badge bg-light text-dark">{lesson.examTag || 'Exam Reading'}</span>
                {lesson.ieltsBand && <span className="badge bg-warning text-dark">Band {lesson.ieltsBand}</span>}
              </div>
              <h5 className="fw-bold mb-0 mt-1">{reading.title}</h5>
            </div>

            {/* Countdown Timer */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span
                className={`badge fs-6 px-3 py-2 ${
                  secondsLeft === 0 ? 'bg-danger' : secondsLeft <= 180 ? 'bg-warning text-dark' : 'bg-light text-dark'
                }`}
              >
                ⏱ {formatTime(secondsLeft)}
              </span>
              {!submitted && (
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={() => setTimerRunning((v) => !v)}
                >
                  {timerRunning ? '⏸ Tạm dừng' : '▶ Bấm giờ'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="d-flex gap-2 mb-3 flex-wrap align-items-center justify-content-between">
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-sm btn-cowdi-primary" onClick={() => onSpeak(reading.passage)}>
            <Icon name="sound" size={14} /> Nghe bài đọc
          </button>
          <button type="button" className="btn btn-sm btn-outline-cowdi" onClick={() => onSpeakSlow(reading.passage)}>
            <Icon name="snail" size={14} /> Nghe chậm
          </button>
          {glossary.length > 0 && (
            <button
              type="button"
              className={`btn btn-sm ${showGlossary ? 'btn-info text-dark' : 'btn-outline-secondary'}`}
              onClick={() => setShowGlossary((v) => !v)}
            >
              📗 Cột từ ({glossary.length})
            </button>
          )}
          {reading.translation && (
            <button
              type="button"
              className={`btn btn-sm ${showTranslation ? 'btn-warning' : 'btn-outline-secondary'}`}
              onClick={() => setShowTranslation((v) => !v)}
            >
              {showTranslation ? '🙈 Ẩn dịch' : <><Emoji e="🇻🇳" size={14} /> Xem dịch</>}
            </button>
          )}
          {paraphrasePairs.length > 0 && (
            <button
              type="button"
              className={`btn btn-sm ${showParaphrases ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setShowParaphrases((v) => !v)}
            >
              🔄 Paraphrase ({paraphrasePairs.length})
            </button>
          )}
        </div>

        {submitted && (
          <span className="badge bg-success fs-6 px-3 py-2">
            Kết quả: {totalCorrect}/{examQuestions.length} ({Math.round((totalCorrect / Math.max(1, examQuestions.length)) * 100)}%)
          </span>
        )}
      </div>

      {/* ── Mobile Quick-Switch Tabs (< lg) ── */}
      <div className="d-flex d-lg-none gap-2 mb-3">
        <button
          type="button"
          className={`btn flex-grow-1 ${mobileTab === 'passage' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
          onClick={() => setMobileTab('passage')}
        >
          📖 Bài đọc &amp; Từ
        </button>
        <button
          type="button"
          className={`btn flex-grow-1 ${mobileTab === 'questions' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
          onClick={() => setMobileTab('questions')}
        >
          📝 Câu hỏi ({answeredCount}/{examQuestions.length})
        </button>
      </div>

      {/* ── Split-Screen Body (Desktop 2 cột, Mobile theo tab) ── */}
      <div className="row g-3 align-items-start">
        {/* LEFT COLUMN: Passage + Glossary + Paraphrase table */}
        <div className={`col-12 col-lg-7 ${mobileTab === 'passage' ? '' : 'd-none d-lg-block'}`}>
          <div
            className="card shadow-sm"
            style={{ maxHeight: '72vh', overflowY: 'auto' }}
          >
            <div className="card-body" style={{ lineHeight: 1.85, fontSize: '1.02rem' }}>
              {paragraphs.map((p) => {
                const isEvPara = activeEvidence?.paragraph === p.label;
                const paraGlossary = glossaryByPara[p.label] || [];
                return (
                  <div
                    key={p.label}
                    ref={(el) => { paraRefs.current[p.label] = el; }}
                    className={`p-3 mb-3 rounded ${isEvPara ? 'border border-warning bg-warning-subtle' : 'bg-light'}`}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="badge bg-primary">Đoạn {p.label}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-muted p-0"
                        onClick={() => onSpeak(p.en)}
                        title={`Nghe đoạn ${p.label}`}
                      >
                        <Icon name="sound" size={14} /> Nghe đoạn
                      </button>
                    </div>
                    <p className="mb-2">
                      {isEvPara ? renderQuoteHighlight(p.en, activeEvidence.quote) : p.en}
                    </p>
                    {showTranslation && p.vi && (
                      <p className="small text-muted fst-italic border-top pt-2 mb-2">
                        🇻🇳 {p.vi}
                      </p>
                    )}
                    {showGlossary && paraGlossary.length > 0 && (
                      <div className="border-top pt-2 mt-2">
                        <div className="small fw-bold text-success mb-1">📗 Từ đồng nghĩa đoạn {p.label}:</div>
                        <div className="d-flex flex-column gap-1">
                          {paraGlossary.map((g, gi) => (
                            <div key={gi} className="small d-flex flex-wrap align-items-baseline gap-1">
                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 fw-bold text-decoration-none text-cowdi-primary"
                                onClick={() => onSpeak(g.term)}
                              >
                                {g.term}
                              </button>
                              <span className="text-muted">=</span>
                              {g.synonyms?.length > 0 && (
                                <span className="text-dark">{g.synonyms.join(', ')}</span>
                              )}
                              {g.definitionEn && (
                                <span className="fst-italic text-secondary">({g.definitionEn})</span>
                              )}
                              <span className="text-success">→ {g.meaningVi}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {showParaphrases && paraphrasePairs.length > 0 && (
                <div className="mt-3">
                  <h6 className="fw-bold text-cowdi-primary mb-2">🔄 Bảng Paraphrase (Câu hỏi ↔ Bài đọc)</h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered small mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Trong câu hỏi</th>
                          <th>Trong bài đọc</th>
                          <th>Đoạn</th>
                          <th>Quan hệ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paraphrasePairs.map((pp, pi) => (
                          <tr key={pi}>
                            <td>{pp.inQuestion}</td>
                            <td className="fw-bold">{pp.inPassage}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-primary py-0 px-2"
                                onClick={() => handleShowEvidence({ paragraph: pp.paragraph, quote: pp.inPassage }, -1)}
                              >
                                {pp.paragraph}
                              </button>
                            </td>
                            <td>
                              <span className={`badge ${pp.relation === 'opposite' ? 'bg-danger' : 'bg-success'}`}>
                                {pp.relation === 'opposite' ? 'Ngược nghĩa' : 'Cùng nghĩa'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Exam Questions */}
        <div className={`col-12 col-lg-5 ${mobileTab === 'questions' ? '' : 'd-none d-lg-block'}`}>
          <div
            className="card shadow-sm"
            style={{ maxHeight: '72vh', overflowY: 'auto' }}
          >
            <div className="card-body">
              <h6 className="fw-bold text-cowdi-primary mb-3">
                📝 Bộ câu hỏi đề thi ({answeredCount}/{examQuestions.length} đã điền)
              </h6>

              <div className="d-flex flex-column gap-3">
                {examQuestions.map((q, qi) => {
                  const res = gradedResults[qi];
                  const val = answers[qi];
                  const prevType = qi > 0 ? examQuestions[qi - 1].type : null;
                  const showTypeHeader = q.type !== prevType;

                  return (
                    <div key={qi}>
                      {showTypeHeader && (
                        <div className="badge bg-secondary-subtle text-dark mb-2">
                          {TYPE_LABELS[q.type] || q.type}
                        </div>
                      )}
                      <div
                        className={`p-3 rounded border ${
                          submitted
                            ? res?.isCorrect
                              ? 'border-success bg-success-subtle'
                              : 'border-danger bg-danger-subtle'
                            : 'bg-white'
                        }`}
                      >
                        <div className="fw-bold small mb-2">
                          Câu {qi + 1}. {q.prompt}
                        </div>

                        {/* TFNG / YNNG */}
                        {(q.type === 'tfng' || q.type === 'ynng') && (
                          <div className="d-flex gap-2 flex-wrap">
                            {(q.type === 'tfng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN']).map((opt) => {
                              const picked = val === opt;
                              const isCorrectOpt = q.answer === opt;
                              let cls = 'btn btn-sm';
                              if (submitted) {
                                cls += isCorrectOpt ? ' btn-success' : picked ? ' btn-danger' : ' btn-outline-secondary';
                              } else {
                                cls += picked ? ' btn-cowdi-primary' : ' btn-outline-primary';
                              }
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={submitted}
                                  className={cls}
                                  onClick={() => setAnswers((a) => ({ ...a, [qi]: opt }))}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* MCQ / Heading */}
                        {(q.type === 'mcq' || q.type === 'heading') && (
                          <div className="d-flex flex-column gap-1">
                            {(q.options || []).map((opt, oi) => {
                              const picked = val === oi;
                              const isCorrectOpt = oi === q.answer;
                              let cls = 'btn btn-sm text-start';
                              if (submitted) {
                                cls += isCorrectOpt ? ' btn-success' : picked ? ' btn-danger' : ' btn-outline-secondary';
                              } else {
                                cls += picked ? ' btn-cowdi-primary' : ' btn-outline-secondary';
                              }
                              return (
                                <button
                                  key={oi}
                                  type="button"
                                  disabled={submitted}
                                  className={cls}
                                  onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Matching Info */}
                        {q.type === 'matching-info' && (
                          <div className="d-flex gap-1 flex-wrap">
                            {(q.options || paragraphs.map((p) => p.label)).map((opt) => {
                              const picked = val === opt;
                              const isCorrectOpt = String(q.answer).toUpperCase() === String(opt).toUpperCase();
                              let cls = 'btn btn-sm';
                              if (submitted) {
                                cls += isCorrectOpt ? ' btn-success' : picked ? ' btn-danger' : ' btn-outline-secondary';
                              } else {
                                cls += picked ? ' btn-cowdi-primary' : ' btn-outline-primary';
                              }
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={submitted}
                                  className={cls}
                                  onClick={() => setAnswers((a) => ({ ...a, [qi]: opt }))}
                                >
                                  Đoạn {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Sentence Completion (maxWords) */}
                        {q.type === 'sentence-completion' && (() => {
                          const typed = String(val || '');
                          const wc = countAnswerWords(typed);
                          const over = Number.isInteger(q.maxWords) && wc > q.maxWords;
                          return (
                            <div>
                              <input
                                type="text"
                                className={`form-control form-control-sm ${over ? 'is-invalid' : ''}`}
                                disabled={submitted}
                                value={typed}
                                onChange={(e) => setAnswers((a) => ({ ...a, [qi]: e.target.value }))}
                                placeholder={q.maxWords ? `Điền tối đa ${q.maxWords} từ từ bài đọc…` : 'Nhập câu trả lời…'}
                              />
                              <div className="d-flex justify-content-between small mt-1">
                                <span className={over ? 'text-danger fw-bold' : 'text-muted'}>
                                  {wc}{q.maxWords ? ` / ${q.maxWords} từ` : ' từ'}
                                  {over ? ' (vượt giới hạn!)' : ''}
                                </span>
                                {submitted && (
                                  <span className="text-success fw-bold">
                                    Đáp án: {Array.isArray(q.answer) ? q.answer.join(' / ') : q.answer}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Post-submit Explanation + Evidence button */}
                        {submitted && (
                          <div className="mt-2 pt-2 border-top small">
                            {q.explanation && <div className="mb-1"><strong>Giải thích:</strong> {q.explanation}</div>}
                            {q.evidence?.paragraph && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-warning text-dark mt-1"
                                onClick={() => handleShowEvidence(q.evidence, qi)}
                              >
                                🔍 Xem bằng chứng (Đoạn {q.evidence.paragraph})
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="d-flex gap-2 mt-3 sticky-bottom bg-white pt-2 border-top">
                {!submitted ? (
                  <button
                    type="button"
                    className="btn btn-cowdi-primary w-100"
                    disabled={answeredCount === 0}
                    onClick={handleSubmit}
                  >
                    <Icon name="check" size={16} /> Nộp bài ({answeredCount}/{examQuestions.length})
                  </button>
                ) : (
                  <button type="button" className="btn btn-outline-cowdi w-100" onClick={handleReset}>
                    <Icon name="refresh" size={16} /> Làm lại đề đọc
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
