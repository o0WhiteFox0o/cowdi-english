import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../../components/Icon';
import Emoji from '../../../../components/Emoji';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { getScreenTitle } from '../../../../../shared/screen-scenarios';
import { createRng } from '../seededRandom';
import { selectTrueFalseDeck } from './f11Logic';
import FriendlyFrame from './FriendlyFrame';
import ScreenActionModal from '../ScreenActionModal';

/**
 * F-11 Đọc kiểm chứng Đúng/Sai (slot 'read' — PHASE4 §2 F-11, test Q6).
 * - 6–8 thẻ, tỉ lệ đúng/sai trong 40–60%.
 * - Chạm câu để nghe; 2 nút lớn Sai / Đúng HOẶC vuốt thẻ trái = Sai, phải = Đúng.
 * - Sai: popup + pet giải thích bằng item.whyVi (≤ 2 dòng).
 */
export default function F11TrueFalse({
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
  const screenTitle = getScreenTitle('F-11', region, 'Đọc kiểm chứng Đúng/Sai');

  const deck = useMemo(() => {
    const rng = createRng(seed + 1111);
    return selectTrueFalseDeck(lesson?.trueFalse || [], rng, 8);
  }, [lesson?.trueFalse, seed]);

  const [cursor, setCursor] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null); // { ok, whyVi, card }
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [petText, setPetText] = useState('Đọc câu trên thẻ rồi chọn Đúng hoặc Sai (hoặc vuốt thẻ trái/phải)!');
  const [petTone, setPetTone] = useState('neutral');

  const pointerStartX = useRef(null);
  const current = deck[cursor] || null;

  useEffect(() => {
    if (!current) return undefined;
    setLocked(false);
    setFeedback(null);
    setDragX(0);
    setPetTone('neutral');
    setPetText('Chạm câu tiếng Anh để nghe đọc, rồi chọn Đúng hay Sai nhé!');
    onEvent?.('item_shown', {
      itemId: `f11-${cursor}`,
      wordIds: current.wordIds || [],
      skill: 'read',
    });
    return () => stopSpeaking();
  }, [cursor, current?.en]);

  const advanceNext = useCallback((wasCorrect) => {
    const nextFirst = firstTryCount + (wasCorrect ? 1 : 0);
    setFirstTryCount(nextFirst);
    if (cursor + 1 < deck.length) {
      setCursor((c) => c + 1);
    } else {
      onDone?.({
        code: 'F-11',
        slot: 'read',
        total: deck.length,
        firstTryCorrect: nextFirst,
        durationMs: Date.now() - startTimeRef.current,
      });
    }
  }, [firstTryCount, cursor, deck.length, onDone]);

  const handleAnswer = useCallback((choiceBool) => {
    if (!current || locked) return;
    setLocked(true);
    setDragX(0);
    const ok = choiceBool === current.isTrue;
    if (ok) {
      play?.('correct');
      setPetTone('good');
      setPetText(current.isTrue ? 'Chính xác! Câu này hoàn toàn đúng!' : `Chuẩn luôn! ${current.whyVi || ''}`);
      onEvent?.('item_correct', {
        itemId: `f11-${cursor}`,
        wordIds: current.wordIds || [],
        word: current.en,
        meaning: current.vi,
        skill: 'read',
      });
      setTimeout(() => advanceNext(true), 850);
    } else {
      play?.('wrong');
      setPetTone('hint');
      const explain = current.whyVi || (current.isTrue ? 'Câu này là ĐÚNG nhé!' : 'Câu này là SAI nhé!');
      setPetText(explain);
      onEvent?.('item_wrong', {
        itemId: `f11-${cursor}`,
        wordIds: current.wordIds || [],
        correct: current.isTrue ? 'Đúng' : 'Sai',
        skill: 'read',
      });
      setFeedback({ ok: false, explain, card: current });
    }
  }, [current, locked, play, cursor, onEvent, advanceNext]);

  const onPointerDown = (e) => {
    if (locked) return;
    pointerStartX.current = e.clientX;
  };
  const onPointerMove = (e) => {
    if (pointerStartX.current == null || locked) return;
    const dx = Math.max(-90, Math.min(90, e.clientX - pointerStartX.current));
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (pointerStartX.current == null || locked) return;
    const dx = dragX;
    pointerStartX.current = null;
    setDragX(0);
    if (dx <= -55) handleAnswer(false);
    else if (dx >= 55) handleAnswer(true);
  };

  if (!current) return null;

  return (
    <FriendlyFrame
      skill="read"
      title={screenTitle}
      code="F-11"
      counter={`${cursor + 1}/${deck.length}`}
      petText={petText}
      petTone={petTone}
    >
      {/* Thẻ vuốt Đúng / Sai */}
      <div
        className="ff-card ff-f11-card text-center"
        style={{
          transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
          transition: pointerStartX.current == null ? 'transform 0.18s ease' : 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="d-flex justify-content-center align-items-center mb-2" style={{ minHeight: 74 }}>
          {current.image ? (
            <img
              src={current.image}
              alt=""
              style={{ maxHeight: 78, maxWidth: 160, objectFit: 'contain', borderRadius: 12 }}
              draggable={false}
            />
          ) : (
            <Emoji e={current.illustration || '📖'} size={52} />
          )}
        </div>

        <button
          type="button"
          className="btn btn-link text-decoration-none p-0 fw-bold"
          style={{ fontSize: '1.08rem', color: '#4A3420', lineHeight: 1.32 }}
          onClick={(e) => {
            e.stopPropagation();
            if (!muted) speakWord(current.en, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
          }}
          title="Chạm câu để nghe phát âm"
        >
          {current.en} <Icon name="sound" size={15} />
        </button>
        <div className="small text-muted mt-1">{current.vi}</div>
        <div className="text-muted mt-1" style={{ fontSize: '0.68rem' }}>
          ← Vuốt trái: Sai · Vuốt phải: Đúng →
        </div>
      </div>

      {/* 2 nút lớn Sai / Đúng */}
      <div className="d-grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <button
          type="button"
          className="btn btn-outline-danger ff-tap-btn fw-bold fs-6"
          onClick={() => handleAnswer(false)}
          disabled={locked}
        >
          ✕ Sai
        </button>
        <button
          type="button"
          className="btn btn-success ff-tap-btn fw-bold fs-6"
          onClick={() => handleAnswer(true)}
          disabled={locked}
        >
          ✓ Đúng
        </button>
      </div>

      <ScreenActionModal
        open={Boolean(feedback && !feedback.ok)}
        title={`Đáp án đúng là: ${feedback?.card?.isTrue ? 'Đúng ✓' : 'Sai ✕'}`}
        tone="warning"
        primaryLabel="Tiếp tục →"
        onPrimary={() => {
          setFeedback(null);
          advanceNext(false);
        }}
      >
        <div>{feedback?.explain}</div>
      </ScreenActionModal>
    </FriendlyFrame>
  );
}
