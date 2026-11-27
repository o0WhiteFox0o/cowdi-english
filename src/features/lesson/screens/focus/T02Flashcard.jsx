import { useRef, useCallback, useMemo } from 'react';
import Flashcard from '../../../../components/learn/Flashcard';
import {
  orderCards,
  wordStatus as getWordMemoryStatus,
  isMaybeForgotten,
  WORD_STATUS_UI,
  getWordId,
} from '../../../vocab/wordProgress';

/**
 * T-02 Flashcard (Màn 1 — mức Tập trung).
 * Bọc component Flashcard v1.4 sẵn có, bỏ tab Nhóm và nút Hoàn thành thừa.
 */
export default function T02Flashcard({ lesson, rules, onEvent, onDone, muted, extra }) {
  const startRef = useRef(Date.now());
  const seenRef = useRef(new Set());
  const wordProgress = extra?.wordProgress || {};
  const ttsRate = rules?.ttsRate ?? 0.85;

  const cards = useMemo(() => {
    const vocab = lesson?.vocabulary || [];
    if (!vocab.length) return [];
    return orderCards(vocab, wordProgress, rules);
  }, [lesson?.vocabulary, wordProgress, rules]);

  const handleEncounter = useCallback((cardObj) => {
    const wid = getWordId(cardObj);
    if (!seenRef.current.has(wid)) {
      seenRef.current.add(wid);
      onEvent?.('item_shown', {
        itemId: wid,
        wordIds: [wid],
        word: cardObj?.word,
        meaning: cardObj?.meaning,
      });
    }
  }, [onEvent]);

  const getDotInfo = useCallback((cardObj) => {
    const wid = getWordId(cardObj);
    const p = wordProgress[wid];
    const st = getWordMemoryStatus(p, rules);
    const ui = WORD_STATUS_UI[st] || WORD_STATUS_UI.new;
    return {
      status: st,
      color: ui.dot,
      label: ui.label,
      maybeForgotten: isMaybeForgotten(p, rules),
    };
  }, [wordProgress, rules]);

  return (
    <div className="ss-screen-inner ss-t02">
      <Flashcard
        cards={cards}
        ttsRate={ttsRate}
        muted={muted}
        fallbackIcon={lesson?.icon}
        nextStepLabel={null}
        onSkipStep={null}
        onEncounter={handleEncounter}
        getCardDotInfo={getDotInfo}
        onComplete={() => {
          onDone?.({
            code: 'T-02',
            slot: 'intro',
            total: cards.length,
            firstTryCorrect: cards.length,
            durationMs: Date.now() - startRef.current,
          });
        }}
        resetKey={`t02-${lesson?.id || 'x'}`}
      />
    </div>
  );
}
