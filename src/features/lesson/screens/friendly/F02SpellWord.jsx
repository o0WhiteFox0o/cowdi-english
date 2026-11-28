import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../../components/Icon';
import Emoji from '../../../../components/Emoji';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';
import { getScreenTitle } from '../../../../../shared/screen-scenarios';
import { createRng } from '../seededRandom';
import {
  isSingleSpellableWord,
  buildLetterBank,
  initSpellTurn,
  pickSpellKey,
} from './f02Logic';
import FriendlyFrame from './FriendlyFrame';
import ScreenActionModal from '../ScreenActionModal';

const TARGET_WORDS = 6;

/**
 * F-02 Ghép chính tả / Ghép chữ lên đò (slot 'write' — PHASE4 §2 F-02).
 * - 6 từ đơn (3–10 chữ cái A–Z): 5 từ bài + 1 khách quen (nếu là từ đơn).
 * - Bàn phím ≥ 8 phím chữ; chữ trùng hiện đúng số lần.
 * - Sai 2 lần cùng ô → phím chữ đúng nhấp nháy gợi ý. Nhóm Mới học hiện sẵn chữ đầu.
 */
export default function F02SpellWord({
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
  const region = extra.region || 'BD';
  const screenTitle = getScreenTitle('F-02', region, 'Ghép chính tả');

  const turns = useMemo(() => {
    const rng = createRng(seed + 202);
    const vocab = (lesson?.vocabulary || []).filter(isSingleSpellableWord);
    const shuffled = [...vocab];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const spellableGuest = (extra.guestWords || []).find(isSingleSpellableWord) || null;
    const lessonCount = Math.min(shuffled.length, spellableGuest ? TARGET_WORDS - 1 : TARGET_WORDS);
    const picked = shuffled.slice(0, lessonCount).map((v) => ({ ...v, isGuest: false }));
    if (spellableGuest && picked.length < TARGET_WORDS) {
      picked.push({ ...spellableGuest, isGuest: true });
    }

    return picked.map((v, idx) => {
      const clean = String(v.word).trim();
      const bank = buildLetterBank(clean, rng, 8);
      return {
        id: `f02-${idx}-${getWordId(v)}`,
        wordId: getWordId(v),
        word: clean,
        meaning: v.meaning,
        image: v.image || null,
        illustration: v.illustration || '🔤',
        isGuest: Boolean(v.isGuest),
        bank,
      };
    });
  }, [lesson?.vocabulary, extra.guestWords, seed]);

  const [cursor, setCursor] = useState(0);
  const current = turns[cursor] || null;
  const [turn, setTurn] = useState(() => (current ? initSpellTurn(current.word, current.bank, group) : null));
  const [shakingKeyId, setShakingKeyId] = useState(null);
  const [stats, setStats] = useState({ total: 0, firstTryCorrect: 0, guestTotal: 0, guestCorrect: 0 });
  const [petText, setPetText] = useState('Nghe từ rồi chạm từng chữ cái ghép cho đúng chính tả nhé!');
  const [petTone, setPetTone] = useState('neutral');

  useEffect(() => {
    if (!current) return undefined;
    setTurn(initSpellTurn(current.word, current.bank, group));
    setShakingKeyId(null);
    setPetTone('neutral');
    setPetText(
      group === 'beginner'
        ? 'Chữ cái đầu đã có sẵn! Chạm các chữ cái tiếp theo để ghép từ nha!'
        : 'Chạm từng chữ cái theo đúng thứ tự để ghép từ nhé!'
    );
    onEvent?.('item_shown', {
      itemId: current.id,
      wordIds: [current.wordId],
      skill: 'write',
    });
    if (!muted) {
      const t = setTimeout(() => {
        speakWord(current.word, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
      }, 220);
      return () => { clearTimeout(t); stopSpeaking(); };
    }
    return undefined;
  }, [cursor, current?.id, group, muted, defaultRate, onEvent]);

  useEffect(() => () => stopSpeaking(), []);

  const advanceNext = useCallback((nextStats) => {
    stopSpeaking();
    if (cursor + 1 < turns.length) {
      setCursor((c) => c + 1);
    } else {
      onDone?.({
        code: 'F-02',
        slot: 'write',
        total: nextStats.total,
        firstTryCorrect: nextStats.firstTryCorrect,
        guestTotal: nextStats.guestTotal,
        guestCorrect: nextStats.guestCorrect,
        durationMs: Date.now() - startTimeRef.current,
      });
    }
  }, [cursor, turns.length, onDone]);

  const handleKeyTap = (keyObj) => {
    if (!current || !turn || turn.solved) return;
    const res = pickSpellKey(turn, keyObj);
    if (res.outcome === 'ignore') return;
    setTurn(res.turn);

    if (res.outcome === 'wrong') {
      play?.('wrong');
      setShakingKeyId(keyObj.id);
      setTimeout(() => setShakingKeyId(null), 380);
      setPetTone('hint');
      if (!turn.hadWrong) {
        onEvent?.('item_wrong', {
          itemId: current.id,
          wordIds: [current.wordId],
          correct: current.word,
          skill: 'write',
          isGuest: current.isGuest,
        });
      }
      setPetText(
        res.turn.hintChar
          ? `Gợi ý: chữ tiếp theo là chữ “${res.turn.hintChar.toUpperCase()}” đang sáng lên đó!`
          : 'Chưa đúng chữ ở ô này rồi, thử chữ khác nhé!'
      );
      return;
    }

    if (res.outcome === 'correct') {
      play?.('click');
      return;
    }

    if (res.outcome === 'solved') {
      play?.('correct');
      const okFirst = !res.turn.hadWrong;
      const nextStats = {
        total: stats.total + (current.isGuest ? 0 : 1),
        firstTryCorrect: stats.firstTryCorrect + (!current.isGuest && okFirst ? 1 : 0),
        guestTotal: stats.guestTotal + (current.isGuest ? 1 : 0),
        guestCorrect: stats.guestCorrect + (current.isGuest && okFirst ? 1 : 0),
      };
      setStats(nextStats);
      setPetTone('good');
      setPetText(`Chuẩn chính tả! “${current.word}” = ${current.meaning}.`);
      onEvent?.('item_correct', {
        itemId: current.id,
        wordIds: [current.wordId],
        word: current.word,
        meaning: current.meaning,
        skill: 'write',
        isGuest: current.isGuest,
      });
      if (!muted) {
        speakWord(current.word, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
      }
      if (okFirst) {
        setTimeout(() => advanceNext(nextStats), 1100);
      }
    }
  };

  if (!current || !turn) {
    return (
      <FriendlyFrame skill="write" title={screenTitle} code="F-02" counter="0/0" petText="Bài chưa đủ từ đơn để ghép chính tả.">
        <button type="button" className="btn btn-cowdi-primary ff-tap-btn" onClick={() => onDone?.({ code: 'F-02', slot: 'write', total: 0, firstTryCorrect: 0, durationMs: 0 })}>
          Tiếp tục →
        </button>
      </FriendlyFrame>
    );
  }

  const keyById = Object.fromEntries(current.bank.map((k) => [k.id, k]));

  return (
    <FriendlyFrame
      skill="write"
      title={screenTitle}
      code="F-02"
      counter={`${cursor + 1}/${turns.length}`}
      petText={petText}
      petTone={petTone}
    >
      {/* Gợi ý: hình + nghĩa + nút nghe */}
      <div className="ff-card d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
          {current.image ? (
            <img src={current.image} alt="" width={40} height={40} style={{ objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
          ) : (
            <Emoji e={current.illustration} size={34} />
          )}
          <div style={{ minWidth: 0 }}>
            {current.isGuest && <span className="ff-guest-badge mb-1">🌿 khách quen</span>}
            <div className="fw-bold" style={{ fontSize: '1.05rem', color: '#4A3420' }}>{current.meaning}</div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-cowdi-primary rounded-pill d-inline-flex align-items-center gap-1 flex-shrink-0"
          style={{ minHeight: 38, padding: '0 12px' }}
          onClick={() => speakWord(current.word, { rate: defaultRate, lang: 'en-US' }).catch(() => {})}
          title="Nghe lại từ"
        >
          <Icon name="sound" size={16} /> Nghe
        </button>
      </div>

      {/* Các ô ghép chữ cái */}
      <div className="ff-f02-slots" aria-label="Các ô chữ cái">
        {turn.target.split('').map((_, idx) => {
          const kid = turn.filledKeyIds[idx];
          const ch = kid ? keyById[kid]?.char : '';
          const isActive = idx === turn.filledKeyIds.length && !turn.solved;
          return (
            <div
              key={idx}
              className={`ff-f02-slot${ch ? ' is-filled' : ''}${isActive ? ' is-active' : ''}`}
            >
              {ch ? ch.toUpperCase() : ''}
            </div>
          );
        })}
      </div>

      {/* Bàn phím chữ cái (≥ 8 ô) */}
      <div className="ff-f02-keyboard" role="group" aria-label="Bàn phím chữ cái">
        {current.bank.map((k) => {
          const used = turn.filledKeyIds.includes(k.id);
          const isHint = !used && turn.hintChar && k.char === turn.hintChar;
          const isShake = shakingKeyId === k.id;
          return (
            <button
              key={k.id}
              type="button"
              className={`ff-f02-key ff-tap-btn${used ? ' is-used' : ''}${isHint ? ' is-hint' : ''}${isShake ? ' is-shaking' : ''}`}
              disabled={used || turn.solved}
              onClick={() => handleKeyTap(k)}
            >
              {k.char.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Popup sau khi sửa đúng từ đã từng sai */}
      <ScreenActionModal
        open={Boolean(turn.solved && turn.hadWrong)}
        title="Đã ghép đúng từ!"
        tone="success"
        primaryLabel={cursor + 1 < turns.length ? 'Từ tiếp theo →' : 'Hoàn thành màn →'}
        onPrimary={() => advanceNext(stats)}
        secondaryLabel="🔊 Nghe lại"
        onSecondary={() => speakWord(current.word, { rate: defaultRate, lang: 'en-US' }).catch(() => {})}
      >
        <strong>{current.word}</strong> — <span className="text-muted">{current.meaning}</span>
      </ScreenActionModal>
    </FriendlyFrame>
  );
}
