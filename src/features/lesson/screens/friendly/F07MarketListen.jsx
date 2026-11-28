import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../../components/Icon';
import Emoji from '../../../../components/Emoji';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';
import { getScreenTitle } from '../../../../../shared/screen-scenarios';
import { createRng } from '../seededRandom';
import {
  extractMarketItems,
  buildMarketOrderSentence,
  buildMarketBaskets,
} from './f07Logic';
import FriendlyFrame from './FriendlyFrame';
import ScreenActionModal from '../ScreenActionModal';

const TARGET_CUSTOMERS = 6;

/**
 * F-07 Nghe đếm số lượng / Chợ nổi (slot 'listen' — PHASE4 §2 F-07, test Q4).
 * - 6 lượt khách đặt hàng: "{n} {plural}, please." / "One {word}, please."
 * - 4 giỏ luôn khác nhau: 1 đúng, 1 sai số lượng, 1 sai món, 1 sai cả hai.
 * - Nhóm Mới học: số lượng 1–3; các nhóm khác: 1–5.
 */
export default function F07MarketListen({
  lesson,
  group = 'intermediate',
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
  const maxCount = group === 'beginner' ? 3 : 5;
  const region = extra.region || 'BD';
  const screenTitle = getScreenTitle('F-07', region, 'Nghe đếm số lượng');

  const holdTimerRef = useRef(null);
  const longPressedRef = useRef(false);

  const turns = useMemo(() => {
    const rng = createRng(seed + 707);
    const pool = extractMarketItems(lesson);
    if (pool.length === 0) return [];
    const list = [];
    for (let i = 0; i < TARGET_CUSTOMERS; i++) {
      const targetItem = pool[i % pool.length];
      const targetCount = 1 + Math.floor(rng() * maxCount);
      const sentence = buildMarketOrderSentence(targetItem, targetCount);
      const baskets = buildMarketBaskets(targetItem, targetCount, pool, maxCount, rng);
      list.push({
        id: `f07-${i}`,
        targetItem,
        targetCount,
        sentence,
        baskets,
      });
    }
    return list;
  }, [lesson, maxCount, seed]);

  const [cursor, setCursor] = useState(0);
  const [audioOff, setAudioOff] = useState(Boolean(muted));
  const [pickedId, setPickedId] = useState(null);
  const [hadWrong, setHadWrong] = useState(false);
  const [wrongModal, setWrongModal] = useState(null);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [petText, setPetText] = useState('Nghe khách đặt hàng rồi chọn đúng giỏ giao nhé!');
  const [petTone, setPetTone] = useState('neutral');

  const current = turns[cursor] || null;

  useEffect(() => {
    if (!current) return undefined;
    setPickedId(null);
    setHadWrong(false);
    setWrongModal(null);
    setPetTone('neutral');
    setPetText('Chạm nút loa để nghe lại, giữ nút để nghe chậm nha!');

    onEvent?.('item_shown', {
      itemId: current.id,
      wordIds: [getWordId(current.targetItem)],
      skill: 'listen',
    });

    if (!audioOff) {
      speakWord(current.sentence, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
    }
    return () => {
      clearTimeout(holdTimerRef.current);
      stopSpeaking();
    };
  }, [cursor, current?.id]);

  const advanceNext = useCallback((wasFirstTry) => {
    const nextFirst = firstTryCount + (wasFirstTry ? 1 : 0);
    setFirstTryCount(nextFirst);
    if (cursor + 1 < turns.length) {
      setCursor((c) => c + 1);
    } else {
      onDone?.({
        code: 'F-07',
        slot: 'listen',
        total: turns.length,
        firstTryCorrect: nextFirst,
        audioOff,
        durationMs: Date.now() - startTimeRef.current,
      });
    }
  }, [firstTryCount, cursor, turns.length, onDone, audioOff]);

  const handlePickBasket = (basket) => {
    if (!current || pickedId) return;
    setPickedId(basket.id);
    if (basket.isCorrect) {
      play?.('correct');
      setPetTone('good');
      setPetText(`Giao hàng chuẩn rồi! “${current.sentence}”`);
      onEvent?.('item_correct', {
        itemId: current.id,
        wordIds: [getWordId(current.targetItem)],
        word: current.targetItem.word,
        meaning: current.targetItem.meaning,
        skill: 'listen',
      });
      setTimeout(() => advanceNext(!hadWrong), 1000);
    } else {
      play?.('wrong');
      setHadWrong(true);
      setPetTone('hint');
      const reason = basket.kind === 'wrong_qty'
        ? 'Đúng món nhưng chưa đúng số lượng rồi!'
        : basket.kind === 'wrong_item'
          ? 'Đúng số lượng nhưng nhầm món hàng rồi!'
          : 'Chưa đúng cả món và số lượng rồi!';
      setPetText(reason);
      onEvent?.('item_wrong', {
        itemId: current.id,
        wordIds: [getWordId(current.targetItem)],
        correct: current.sentence,
        skill: 'listen',
      });
      setWrongModal({ reason, sentence: current.sentence, count: current.targetCount, item: current.targetItem });
    }
  };

  const handleSpeakerDown = () => {
    longPressedRef.current = false;
    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      if (current) speakWord(current.sentence, { rate: 0.55, lang: 'en-US' }).catch(() => {});
    }, 450);
  };

  const handleSpeakerUp = () => {
    clearTimeout(holdTimerRef.current);
    if (!longPressedRef.current && current) {
      speakWord(current.sentence, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
    }
  };

  if (!current) return null;

  return (
    <FriendlyFrame
      skill="listen"
      title={screenTitle}
      code="F-07"
      counter={`Khách ${cursor + 1}/${turns.length}`}
      petText={petText}
      petTone={petTone}
    >
      {/* Quầy khách đặt hàng */}
      <div className="ff-card text-center py-2">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="small text-muted fw-semibold">🛶 Khách đang đặt hàng</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2"
            style={{ fontSize: '0.74rem', minHeight: 28 }}
            onClick={() => setAudioOff((v) => !v)}
          >
            {audioOff ? '🔇 Hiện chữ' : '🔊 Bật loa'}
          </button>
        </div>

        {audioOff ? (
          <div className="fw-bold fs-6 py-1" style={{ color: '#2F7FD1' }}>
            “{current.sentence}”
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-cowdi-primary rounded-pill px-4 d-inline-flex align-items-center gap-2"
            style={{ minHeight: 42 }}
            onPointerDown={handleSpeakerDown}
            onPointerUp={handleSpeakerUp}
            onPointerLeave={() => clearTimeout(holdTimerRef.current)}
          >
            <Icon name="sound" size={18} /> Nghe đơn hàng
          </button>
        )}
      </div>

      {/* 4 giỏ hàng (lưới 2×2 gọn gàng, 0 cuộn ở 360×640) */}
      <div className="ff-f07-grid" role="group" aria-label="Chọn giỏ hàng đúng">
        {current.baskets.map((b) => {
          const isPicked = pickedId === b.id;
          const cls = `ff-f07-basket${isPicked ? (b.isCorrect ? ' is-right' : ' is-wrong') : ''}`;
          return (
            <button
              key={b.id}
              type="button"
              className={cls}
              onClick={() => handlePickBasket(b)}
              disabled={Boolean(pickedId)}
            >
              <div className="ff-f07-icons" aria-hidden="true">
                {Array.from({ length: b.count }).map((_, i) => (
                  b.item.image ? (
                    <img key={i} src={b.item.image} alt="" className="ff-f07-img" />
                  ) : (
                    <Emoji key={i} e={b.item.illustration || '📦'} size={22} />
                  )
                ))}
              </div>
              <div className="fw-bold small" style={{ color: '#4A3420', lineHeight: 1.2 }}>
                {b.count} × {b.item.meaning}
              </div>
            </button>
          );
        })}
      </div>

      <ScreenActionModal
        open={Boolean(wrongModal)}
        title="Chưa đúng giỏ hàng rồi!"
        tone="warning"
        primaryLabel="Nghe & chọn lại"
        onPrimary={() => {
          setWrongModal(null);
          setPickedId(null);
          if (!audioOff && current) {
            speakWord(current.sentence, { rate: 0.65, lang: 'en-US' }).catch(() => {});
          }
        }}
      >
        <div>{wrongModal?.reason}</div>
        <div className="small text-muted mt-1">
          Khách nói: <strong>“{wrongModal?.sentence}”</strong>
        </div>
      </ScreenActionModal>
    </FriendlyFrame>
  );
}
