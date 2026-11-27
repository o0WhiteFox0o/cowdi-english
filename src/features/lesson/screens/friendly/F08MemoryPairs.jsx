import { useState, useMemo, useEffect, useRef } from 'react';
import { speakWord, stopSpeaking as cancelSpeech } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';
import { createRng } from '../seededRandom';
import FriendlyFrame from './FriendlyFrame';
import {
  createMemoryDeck,
  initMemoryState,
  flipMemoryCard,
  clearMemoryMismatch,
  summarizeMemoryState,
} from './f08Logic';

const TARGET_PAIRS = 6;

/**
 * F-08 Lật cặp đồng cỏ (slot 'read' — PHASE3 §2 F-08).
 * - 6 cặp (12 thẻ, lưới 3×4) = 5 từ bài + 1 khách quen (nếu có).
 * - Lật thẻ EN tự đọc; 3 chấm "lượt lật sai" chỉ để hiển thị (không thua).
 * - Sau 2 lần lật sai liên tiếp: pet gợi ý nghĩa của thẻ vừa lật.
 */
export default function F08MemoryPairs({
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
  const mismatchTimerRef = useRef(null);
  const doneCalledRef = useRef(false);

  const initialCards = useMemo(() => {
    const rng = createRng(seed + 808);
    const vocab = (lesson?.vocabulary || []).filter((v) => v?.word && v?.meaning);
    const guest = (extra.guestWords || [])[0] || null;

    const shuffledVocab = [...vocab];
    for (let i = shuffledVocab.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffledVocab[i], shuffledVocab[j]] = [shuffledVocab[j], shuffledVocab[i]];
    }

    const lessonCount = Math.min(shuffledVocab.length, guest ? TARGET_PAIRS - 1 : TARGET_PAIRS);
    const pairs = shuffledVocab.slice(0, lessonCount).map((v, idx) => ({
      pairId: `l-${idx}-${getWordId(v)}`,
      wordId: getWordId(v),
      word: v.word,
      meaning: v.meaning,
      isGuest: false,
    }));
    if (guest && pairs.length < TARGET_PAIRS) {
      pairs.push({
        pairId: `g-0-${getWordId(guest)}`,
        wordId: getWordId(guest),
        word: guest.word,
        meaning: guest.meaning,
        isGuest: true,
      });
    }
    return createMemoryDeck(pairs, rng);
  }, [lesson?.vocabulary, extra.guestWords, seed]);

  const [mem, setMem] = useState(() => initMemoryState(initialCards));
  const [petText, setPetText] = useState('Chạm từng thẻ cỏ để ghép đúng từ tiếng Anh với nghĩa nhé!');
  const [petTone, setPetTone] = useState('neutral');

  const totalPairs = Math.floor(initialCards.length / 2);

  useEffect(() => () => {
    clearTimeout(mismatchTimerRef.current);
    cancelSpeech();
  }, []);

  // Kiểm tra hoàn thành
  useEffect(() => {
    if (totalPairs > 0 && mem.matchedPairIds.length >= totalPairs && !doneCalledRef.current) {
      doneCalledRef.current = true;
      const summary = summarizeMemoryState(mem);
      const t = setTimeout(() => {
        onDone?.({
          code: 'F-08',
          slot: 'read',
          total: summary.total,
          firstTryCorrect: summary.firstTryCorrect,
          guestTotal: summary.guestTotal,
          guestCorrect: summary.guestCorrect,
          durationMs: Date.now() - startTimeRef.current,
        });
      }, 650);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [mem, totalPairs, onDone]);

  const handleTileClick = (card) => {
    const res = flipMemoryCard(mem, card.id);
    if (res.outcome === 'ignore') return;
    setMem(res.state);

    if (card.side === 'en' && !muted) {
      speakWord(card.text, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
    }

    if (res.outcome === 'first') {
      onEvent?.('item_shown', {
        itemId: card.id,
        wordIds: [card.wordId],
        skill: 'read',
      });
    } else if (res.outcome === 'match') {
      play?.('correct');
      setPetTone('good');
      setPetText(`Ghép chuẩn rồi! “${card.side === 'en' ? card.text : res.state.cards.find((c) => c.pairId === card.pairId && c.side === 'en')?.text}” = ${card.meaning}.`);
      onEvent?.('item_correct', {
        itemId: card.pairId,
        wordIds: [card.wordId],
        word: card.text,
        meaning: card.meaning,
        skill: 'read',
        isGuest: card.isGuest,
      });
    } else if (res.outcome === 'mismatch') {
      play?.('wrong');
      setPetTone('hint');
      if (res.state.consecutiveWrong >= 2) {
        const enCard = res.state.cards.find((c) => c.pairId === card.pairId && c.side === 'en');
        setPetText(`Mẹo nhỏ: “${enCard?.text || card.text}” có nghĩa là “${card.meaning}” nha!`);
      } else {
        setPetText('Chưa khớp cặp rồi, nhớ kỹ vị trí hai thẻ này nhé!');
      }
      onEvent?.('item_wrong', {
        itemId: card.pairId,
        wordIds: [card.wordId],
        skill: 'read',
        isGuest: card.isGuest,
      });
      clearTimeout(mismatchTimerRef.current);
      mismatchTimerRef.current = setTimeout(() => {
        setMem((prev) => clearMemoryMismatch(prev));
      }, 900);
    }
  };

  const missDotsActive = Math.min(3, mem.wrongFlips);

  return (
    <FriendlyFrame
      skill="read"
      title="Lật cặp đồng cỏ"
      code="F-08"
      counter={`Lật đúng cặp ${mem.matchedPairIds.length}/${totalPairs}`}
      extraRight={(
        <div className="ff-f08-miss-dots" title={`Số lượt lật sai: ${mem.wrongFlips}`} aria-label={`Lượt lật sai: ${mem.wrongFlips}`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`ff-f08-miss-dot${i < missDotsActive ? ' is-active' : ''}`} />
          ))}
        </div>
      )}
      petText={petText}
      petTone={petTone}
    >
      <div className="ff-f08-grid" role="grid" aria-label="Lưới 12 thẻ lật cặp">
        {mem.cards.map((card) => {
          const isMatched = mem.matchedPairIds.includes(card.pairId);
          const isFlipped = mem.flippedIds.includes(card.id) || isMatched;
          const isWrong = mem.pendingMismatch && mem.flippedIds.includes(card.id);
          let cls = 'ff-f08-tile ff-tap-btn';
          if (card.side === 'en') cls += ' is-en';
          if (isFlipped) cls += ' is-flipped';
          if (isMatched) cls += ' is-matched';
          if (isWrong) cls += ' is-wrong';

          return (
            <button
              key={card.id}
              type="button"
              className={cls}
              disabled={isMatched || mem.pendingMismatch}
              onClick={() => handleTileClick(card)}
              aria-pressed={isFlipped}
            >
              {isFlipped ? (
                <span>
                  {card.isGuest && !isMatched && (
                    <span className="d-block" style={{ fontSize: '0.62rem', color: '#8A5A00' }}>🌿 khách quen</span>
                  )}
                  {card.text}
                </span>
              ) : (
                <span aria-hidden="true" style={{ fontSize: '1.35rem' }}>🌿</span>
              )}
            </button>
          );
        })}
      </div>
    </FriendlyFrame>
  );
}
