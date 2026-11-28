import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../../components/Icon';
import { speakWord, stopSpeaking as cancelSpeech } from '../../../../utils/speech';
import { createRng } from '../seededRandom';
import { getScreenTitle } from '../../../../../shared/screen-scenarios';
import { writeItems, pickGrammarTip } from '../items';
import { evaluateBoatTile } from './friendlyLogic';
import FriendlyFrame from './FriendlyFrame';
import ScreenActionModal from '../ScreenActionModal';

export { evaluateBoatTile };

function buildDockTiles(item, lesson, rng) {
  const words = item.words || [];
  const wordSet = new Set(words.map((w) => w.toLowerCase()));

  // Lấy 2 từ nhiễu cùng bài (từ vocabulary hoặc câu khác)
  const distractorPool = [];
  for (const v of lesson?.vocabulary || []) {
    const first = String(v?.word || '').trim().split(/\s+/)[0];
    if (first && !wordSet.has(first.toLowerCase())) distractorPool.push(first);
  }
  const uniqueDistractors = [...new Set(distractorPool)];
  for (let i = uniqueDistractors.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [uniqueDistractors[i], uniqueDistractors[j]] = [uniqueDistractors[j], uniqueDistractors[i]];
  }
  const distractors = uniqueDistractors.slice(0, 2);

  const tiles = [
    ...words.map((w, i) => ({ id: `w-${i}`, text: w })),
    ...distractors.map((w, i) => ({ id: `d-${i}`, text: w })),
  ];
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
}

/**
 * F-09 Đò chở câu (slot 'write' — PHASE3 §2 F-09).
 * - 4 câu từ writeItems(lesson, 4); không chèn khách quen.
 * - Chấm từng thẻ: đặt sai vị trí → rung, bật về bến, câu tính sai lần đầu; đúng hết → đò chạy qua sông, đọc câu.
 * - Nút "Ngữ pháp" ở nhãn màn + mẹo pet theo đúng điểm ngữ pháp câu đang làm.
 */
export default function F09BoatSentence({
  lesson,
  items,
  rules,
  seed = 1,
  muted = false,
  play,
  onEvent,
  onDone,
  onOpenGrammar,
  extra = {},
}) {
  const startTimeRef = useRef(Date.now());
  const defaultRate = rules?.ttsRate || 0.85;

  const sentences = useMemo(() => {
    const src = Array.isArray(items) && items.length > 0 ? items : writeItems(lesson, 4);
    const rng = createRng(seed + 909);
    return src.slice(0, 4).map((s, idx) => ({
      ...s,
      id: `f09-${idx}`,
      tiles: buildDockTiles(s, lesson, rng),
    }));
  }, [items, lesson, seed]);

  const [cursor, setCursor] = useState(0);
  const [boardedIds, setBoardedIds] = useState([]); // tile ids trên đò
  const [shakingId, setShakingId] = useState(null);
  const [hadWrong, setHadWrong] = useState(false);
  const [solved, setSolved] = useState(false);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [petText, setPetText] = useState('Chạm từng từ trên bến xếp lên đò theo đúng thứ tự câu nhé!');
  const [petTone, setPetTone] = useState('neutral');

  const current = sentences[cursor] || null;

  useEffect(() => {
    if (!current) return;
    setBoardedIds([]);
    setShakingId(null);
    setHadWrong(false);
    setSolved(false);
    setPetTone('neutral');
    setPetText('Chạm từng từ trên bến để xếp thành câu tiếng Anh đúng nhé!');
    onEvent?.('item_shown', {
      itemId: current.id,
      wordIds: current.wordIds || [],
      skill: 'write',
    });
  }, [cursor, current?.id, onEvent]);

  useEffect(() => () => cancelSpeech(), []);

  const advanceNext = useCallback((nextFirstTryCount) => {
    cancelSpeech();
    if (cursor + 1 < sentences.length) {
      setCursor((c) => c + 1);
    } else {
      onDone?.({
        code: 'F-09',
        slot: 'write',
        total: sentences.length,
        firstTryCorrect: nextFirstTryCount,
        durationMs: Date.now() - startTimeRef.current,
      });
    }
  }, [cursor, sentences.length, onDone]);

  const handleDockTap = (tile) => {
    if (!current || solved || boardedIds.includes(tile.id)) return;
    const res = evaluateBoatTile({
      expectedWords: current.words,
      filledCount: boardedIds.length,
      tileWord: tile.text,
      hadWrong,
    });

    if (!res.isRight) {
      play?.('wrong');
      setShakingId(tile.id);
      setTimeout(() => setShakingId(null), 420);
      if (!hadWrong) {
        setHadWrong(true);
        onEvent?.('item_wrong', {
          itemId: current.id,
          wordIds: current.wordIds || [],
          correct: current.en,
          skill: 'write',
        });
      }
      const tip = pickGrammarTip(lesson, current);
      setPetTone('hint');
      setPetText(tip || `Từ tiếp theo cần đặt là “${current.words[boardedIds.length]}” nhé!`);
      return;
    }

    const nextBoarded = [...boardedIds, tile.id];
    setBoardedIds(nextBoarded);
    play?.('click');

    if (res.completed) {
      setSolved(true);
      play?.('correct');
      const nextCount = firstTryCount + (res.firstTry ? 1 : 0);
      setFirstTryCount(nextCount);
      setPetTone('good');
      setPetText(`Đò qua sông rồi! “${current.en}”`);
      onEvent?.('item_correct', {
        itemId: current.id,
        wordIds: current.wordIds || [],
        word: current.en,
        meaning: current.vi,
        skill: 'write',
      });
      if (!muted) {
        speakWord(current.en, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
      }
      if (!hadWrong) {
        setTimeout(() => advanceNext(nextCount), 1200);
      }
    }
  };

  const handleBoatSlotTap = (slotIdx) => {
    if (solved) return;
    if (slotIdx < boardedIds.length) {
      setBoardedIds((prev) => prev.slice(0, slotIdx));
    }
  };

  if (!current) return null;

  const tileById = Object.fromEntries(current.tiles.map((t) => [t.id, t]));

  return (
    <FriendlyFrame
      skill="write"
      title={getScreenTitle('F-09', extra?.region, 'Xếp câu hoàn chỉnh')}
      code="F-09"
      counter={`${cursor + 1}/${sentences.length}`}
      showGrammarButton={(lesson?.grammar || []).length > 0}
      onOpenGrammar={onOpenGrammar}
      petText={petText}
      petTone={petTone}
    >
      {/* Nghĩa tiếng Việt + nút loa đọc sau khi hoàn thành */}
      <div className="ff-card d-flex align-items-center justify-content-between gap-2">
        <div style={{ minWidth: 0 }}>
          <div className="text-muted" style={{ fontSize: '0.74rem' }}>Xếp câu tiếng Anh cho nghĩa:</div>
          <div className="fw-bold" style={{ fontSize: '1.02rem', color: '#4A3420', lineHeight: 1.3 }}>{current.vi}</div>
        </div>
        {solved && (
          <button
            type="button"
            className="btn btn-sm btn-cowdi-primary rounded-pill d-inline-flex align-items-center gap-1 flex-shrink-0"
            onClick={() => speakWord(current.en, { rate: defaultRate, lang: 'en-US' }).catch(() => {})}
          >
            <Icon name="sound" size={14} /> Nghe
          </button>
        )}
      </div>

      {/* Chiếc đò trên sông */}
      <div className="ff-f09-river">
        <div className={`ff-f09-boat${solved ? ' is-sailing' : ''}`} aria-label="Các ô từ trên đò">
          {current.words.map((_, idx) => {
            const tid = boardedIds[idx];
            const tObj = tid ? tileById[tid] : null;
            return (
              <button
                key={idx}
                type="button"
                className={`ff-f09-slot${tObj ? ' is-filled' : ''}`}
                disabled={!tObj || solved}
                onClick={() => handleBoatSlotTap(idx)}
                title={tObj ? 'Chạm để trả về bến' : `Ô ${idx + 1}`}
              >
                {tObj ? tObj.text : idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bến thẻ từ */}
      <div className="ff-f09-dock" aria-label="Thẻ từ trên bến">
        {current.tiles.map((tile) => {
          const onBoat = boardedIds.includes(tile.id);
          if (onBoat) return null;
          return (
            <button
              key={tile.id}
              type="button"
              className={`ff-f09-tile ff-tap-btn${shakingId === tile.id ? ' is-shaking' : ''}`}
              disabled={solved}
              onClick={() => handleDockTap(tile)}
            >
              {tile.text}
            </button>
          );
        })}
      </div>

      {/* Popup xác nhận khi xếp đúng sau lượt sai — không đẩy layout gây cuộn */}
      <ScreenActionModal
        open={Boolean(solved && hadWrong)}
        title="Đò đã qua sông!"
        tone="success"
        primaryLabel={cursor + 1 < sentences.length ? 'Câu tiếp theo →' : 'Hoàn thành màn →'}
        onPrimary={() => advanceNext(firstTryCount)}
        secondaryLabel="🔊 Nghe câu"
        onSecondary={() => speakWord(current.en, { rate: defaultRate, lang: 'en-US' }).catch(() => {})}
      >
        <div className="fw-bold text-success mb-1">✓ {current.en}</div>
        <div className="small text-muted">{current.vi}</div>
      </ScreenActionModal>
    </FriendlyFrame>
  );
}
