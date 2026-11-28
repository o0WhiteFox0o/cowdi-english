import { useState, useMemo, useEffect, useRef } from 'react';
import Icon from '../../../../components/Icon';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';
import { getScreenTitle } from '../../../../../shared/screen-scenarios';
import { createRng } from '../seededRandom';
import { extractValidHighlights, buildFogPassageLines } from './f05Logic';
import FriendlyFrame from './FriendlyFrame';
import ScreenActionModal from '../ScreenActionModal';

/**
 * F-05 Đọc tìm từ khóa / Săn chữ trong sương (slot 'read' — PHASE4 §2 F-05).
 * - Chỉ cuộn bên trong thẻ đoạn văn (.ff-f05-passage), KHÔNG cuộn trang (test Q1).
 * - Hỗ trợ cụm nhiều từ (khớp cụm dài nhất trước).
 * - Xong phần săn → hiện bản dịch 1 lần + 2 câu hiểu bài trong reading.questions.
 */
export default function F05FogReading({
  lesson,
  rules,
  seed = 1,
  muted = false,
  play,
  onEvent,
  onDone,
  extra = {},
}) {
  const startTimeRef = useRef(Date.now());
  const defaultRate = rules?.ttsRate || 0.85;
  const region = extra.region || 'BD';
  const screenTitle = getScreenTitle('F-05', region, 'Đọc tìm từ khóa');

  const reading = lesson?.reading || {};
  const { lines, huntOrder, questions } = useMemo(() => {
    const rng = createRng(seed + 505);
    const valid = extractValidHighlights(lesson);
    const built = buildFogPassageLines(reading.passage || '', valid);
    const order = [...built.targets];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const qs = Array.isArray(reading.questions) ? reading.questions.slice(0, 2) : [];
    return { lines: built.lines, huntOrder: order, questions: qs };
  }, [lesson, reading.passage, reading.questions, seed]);

  const [huntIdx, setHuntIdx] = useState(0);
  const [revealedIds, setRevealedIds] = useState(() => new Set());
  const [shakingFogId, setShakingFogId] = useState(null);
  const [hadWrongHunt, setHadWrongHunt] = useState(false);
  const [huntFirstTryOk, setHuntFirstTryOk] = useState(0);
  const huntOkRef = useRef(0);
  const doneRef = useRef(false);

  // Sau khi săn xong: 'hunt' | 'translation' | 'quiz'
  const [stage, setStage] = useState(() => (
    huntOrder.length > 0
      ? 'hunt'
      : (reading.translation ? 'translation' : (questions.length > 0 ? 'quiz' : 'done'))
  ));
  const [qIdx, setQIdx] = useState(0);
  const [qPicked, setQPicked] = useState(null);
  const [qFirstTryOk, setQFirstTryOk] = useState(0);
  const [petText, setPetText] = useState('Nghe từ khóa rồi chạm đúng ô sương ẩn trong đoạn văn nhé!');
  const [petTone, setPetTone] = useState('neutral');

  const currentTarget = stage === 'hunt' ? (huntOrder[huntIdx] || null) : null;
  const currentQ = stage === 'quiz' ? (questions[qIdx] || null) : null;

  // Map nghĩa từ vựng cho target (hữu ích khi tắt tiếng)
  const targetMeaning = useMemo(() => {
    if (!currentTarget) return '';
    const v = (lesson?.vocabulary || []).find(
      (item) => String(item?.word || '').trim().toLowerCase() === currentTarget.key
    );
    return v?.meaning || '';
  }, [currentTarget, lesson?.vocabulary]);

  useEffect(() => {
    if (stage !== 'hunt' || !currentTarget) return undefined;
    setHadWrongHunt(false);
    onEvent?.('item_shown', {
      itemId: currentTarget.fogId,
      wordIds: [getWordId(currentTarget.canonical)],
      skill: 'read',
    });
    if (!muted) {
      const t = setTimeout(() => {
        speakWord(currentTarget.text, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
      }, 220);
      return () => { clearTimeout(t); stopSpeaking(); };
    }
    return undefined;
  }, [stage, huntIdx, currentTarget?.fogId, muted, defaultRate, onEvent]);

  useEffect(() => () => stopSpeaking(), []);

  const finishScreen = (finalQOk) => {
    if (doneRef.current) return;
    doneRef.current = true;
    stopSpeaking();
    onDone?.({
      code: 'F-05',
      slot: 'read',
      total: huntOrder.length + questions.length,
      firstTryCorrect: huntOkRef.current + finalQOk,
      durationMs: Date.now() - startTimeRef.current,
    });
  };

  const handleFogClick = (seg) => {
    if (stage !== 'hunt' || !currentTarget || revealedIds.has(seg.fogId)) return;

    if (seg.fogId === currentTarget.fogId) {
      play?.('correct');
      const nextSet = new Set(revealedIds);
      nextSet.add(seg.fogId);
      setRevealedIds(nextSet);
      const nextOk = huntOkRef.current + (hadWrongHunt ? 0 : 1);
      huntOkRef.current = nextOk;
      setHuntFirstTryOk(nextOk);
      setPetTone('good');
      setPetText(`Tan sương rồi! Từ tìm được là “${seg.text}”.`);
      onEvent?.('item_correct', {
        itemId: seg.fogId,
        wordIds: [getWordId(currentTarget.canonical)],
        word: seg.text,
        meaning: targetMeaning,
        skill: 'read',
      });

      if (huntIdx + 1 < huntOrder.length) {
        setTimeout(() => setHuntIdx((i) => i + 1), 650);
      } else {
        setTimeout(() => {
          setStage(reading.translation ? 'translation' : (questions.length > 0 ? 'quiz' : 'done'));
          if (!reading.translation && questions.length === 0) {
            finishScreen(0);
          }
        }, 650);
      }
    } else {
      play?.('wrong');
      setHadWrongHunt(true);
      setShakingFogId(seg.fogId);
      setTimeout(() => setShakingFogId(null), 380);
      setPetTone('hint');
      setPetText('Chưa phải ô này rồi — nghe lại từ khóa rồi tìm ô sương phù hợp nhé!');
      if (!muted) {
        speakWord(currentTarget.text, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
      }
      onEvent?.('item_wrong', {
        itemId: currentTarget.fogId,
        wordIds: [getWordId(currentTarget.canonical)],
        skill: 'read',
      });
    }
  };

  const handlePickQuestionOption = (optIdx) => {
    if (!currentQ || qPicked !== null) return;
    setQPicked(optIdx);
    const isRight = optIdx === currentQ.correct;
    const nextQOk = qFirstTryOk + (isRight ? 1 : 0);
    if (isRight) {
      setQFirstTryOk(nextQOk);
      play?.('correct');
      setPetTone('good');
      setPetText('Chính xác! Con hiểu rất rõ đoạn văn này!');
      onEvent?.('item_correct', { itemId: `f05-q-${qIdx}`, wordIds: [], skill: 'read' });
      setTimeout(() => {
        if (qIdx + 1 < questions.length) {
          setQIdx((i) => i + 1);
          setQPicked(null);
        } else {
          finishScreen(nextQOk);
        }
      }, 950);
    } else {
      play?.('wrong');
      setPetTone('hint');
      setPetText('Xem lại đáp án đúng trong hộp thoại rồi sang câu tiếp nhé!');
      onEvent?.('item_wrong', { itemId: `f05-q-${qIdx}`, wordIds: [], skill: 'read' });
    }
  };

  const counterText = stage === 'hunt'
    ? `${Math.min(huntIdx + 1, huntOrder.length)}/${huntOrder.length}`
    : stage === 'quiz'
      ? `Câu ${qIdx + 1}/${questions.length}`
      : 'Dịch';

  return (
    <FriendlyFrame
      skill="read"
      title={screenTitle}
      code="F-05"
      counter={counterText}
      petText={petText}
      petTone={petTone}
    >
      {stage === 'hunt' && currentTarget && (
        <>
          {/* Thanh từ khóa cần tìm */}
          <div className="ff-card d-flex align-items-center justify-content-between gap-2 py-2">
            <div style={{ minWidth: 0 }}>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>Chạm đúng ô sương của từ:</div>
              <div className="fw-bold" style={{ fontSize: '1rem', color: '#B26B00' }}>
                {muted && targetMeaning ? `${currentTarget.text} (${targetMeaning})` : currentTarget.text}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-cowdi-primary rounded-pill d-inline-flex align-items-center gap-1 flex-shrink-0"
              style={{ minHeight: 36, padding: '0 12px' }}
              onClick={() => speakWord(currentTarget.text, { rate: defaultRate, lang: 'en-US' }).catch(() => {})}
            >
              <Icon name="sound" size={14} /> Nghe
            </button>
          </div>

          {/* Thẻ đoạn văn — CHỈ cuộn bên trong thẻ này, không cuộn trang */}
          <div className="ff-card ff-f05-passage" role="region" aria-label="Đoạn văn có ô sương" tabIndex={0}>
            {lines.map((segs, li) => (
              <p key={li} className="mb-1" style={{ lineHeight: 1.65, fontSize: '0.92rem' }}>
                {segs.map((seg) => {
                  if (seg.type !== 'fog') return <span key={seg.id}>{seg.text}</span>;
                  const revealed = revealedIds.has(seg.fogId);
                  const isShaking = shakingFogId === seg.fogId;
                  return (
                    <button
                      key={seg.id}
                      type="button"
                      className={`ff-f05-fog-chip${revealed ? ' is-revealed' : ''}${isShaking ? ' is-shaking' : ''}`}
                      disabled={revealed}
                      onClick={() => handleFogClick(seg)}
                      style={{ minWidth: `${Math.max(4, seg.text.length)}ch` }}
                    >
                      {revealed ? seg.text : '☁️'}
                    </button>
                  );
                })}
              </p>
            ))}
          </div>
        </>
      )}

      {stage === 'translation' && (
        <div className="ff-card d-flex flex-column gap-2">
          <div className="fw-bold small text-success">✨ Đã giải hết sương! Bản dịch đoạn văn:</div>
          <div className="ff-f05-passage small" style={{ whiteSpace: 'pre-line', lineHeight: 1.55 }}>
            {reading.translation}
          </div>
          <button
            type="button"
            className="btn btn-cowdi-primary ff-tap-btn w-100"
            onClick={() => {
              if (questions.length > 0) setStage('quiz');
              else finishScreen(0);
            }}
          >
            {questions.length > 0 ? `Trả lời ${questions.length} câu hỏi hiểu bài →` : 'Hoàn thành màn →'}
          </button>
        </div>
      )}

      {stage === 'quiz' && currentQ && (
        <div className="d-flex flex-column gap-2">
          <div className="ff-card">
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>Hiểu đoạn văn ({qIdx + 1}/{questions.length})</div>
            <div className="fw-bold" style={{ fontSize: '0.96rem', lineHeight: 1.35 }}>{currentQ.question}</div>
          </div>
          <div className="d-flex flex-column gap-2">
            {(currentQ.options || []).map((opt, oi) => {
              let cls = 'btn w-100 text-start ff-tap-btn py-1 px-2 ';
              if (qPicked !== null) {
                if (oi === currentQ.correct) cls += 'btn-success';
                else if (oi === qPicked) cls += 'btn-danger';
                else cls += 'btn-outline-secondary';
              } else {
                cls += 'ff-choice-btn';
              }
              return (
                <button
                  key={oi}
                  type="button"
                  className={cls}
                  style={{ fontSize: '0.88rem', minBlockSize: 40 }}
                  disabled={qPicked !== null}
                  onClick={() => handlePickQuestionOption(oi)}
                >
                  <strong className="me-1">{String.fromCharCode(65 + oi)}.</strong> {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {stage === 'done' && (
        <div className="ff-card text-center d-flex flex-column gap-2 py-3">
          <div className="fw-bold text-success">✨ Đã hoàn thành phần đọc!</div>
          <button type="button" className="btn btn-cowdi-primary ff-tap-btn w-100" onClick={() => finishScreen(qFirstTryOk)}>
            Sang màn tiếp theo →
          </button>
        </div>
      )}

      <ScreenActionModal
        open={Boolean(stage === 'quiz' && currentQ && qPicked !== null && qPicked !== currentQ.correct)}
        title="Xem lại chi tiết đoạn văn nhé!"
        tone="warning"
        primaryLabel={qIdx + 1 < questions.length ? 'Câu tiếp →' : 'Hoàn thành màn →'}
        onPrimary={() => {
          if (qIdx + 1 < questions.length) {
            setQIdx((i) => i + 1);
            setQPicked(null);
          } else {
            finishScreen(qFirstTryOk);
          }
        }}
      >
        <div>Đáp án đúng: <strong>{currentQ?.options?.[currentQ?.correct]}</strong></div>
        {currentQ?.explanation && <div className="small text-muted mt-1">{currentQ.explanation}</div>}
      </ScreenActionModal>
    </FriendlyFrame>
  );
}
