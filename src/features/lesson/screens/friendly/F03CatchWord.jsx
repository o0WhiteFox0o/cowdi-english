import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Icon from '../../../../components/Icon';
import { speakWord, stopSpeaking as cancelSpeech } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';
import { getScreenTitle } from '../../../../../shared/screen-scenarios';
import { createRng } from '../seededRandom';
import FriendlyFrame from './FriendlyFrame';
import { useItemQueue } from './useItemQueue';
import ScreenActionModal from '../ScreenActionModal';

const TARGET_TURNS = 8;

function pickDistractors(target, pool, rng) {
  const targetId = getWordId(target);
  const candidates = pool.filter((w) => getWordId(w) !== targetId && w.word);
  const samePos = target.pos ? candidates.filter((w) => w.pos === target.pos) : [];
  const rest = candidates.filter((w) => !samePos.includes(w));

  const shuffle = (arr) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const chosen = [...shuffle(samePos), ...shuffle(rest)].slice(0, 2);
  const options = shuffle([target, ...chosen]).map((w) => ({
    wordId: getWordId(w),
    word: w.word,
    meaning: w.meaning,
    isTarget: getWordId(w) === targetId,
  }));
  return options;
}

/**
 * F-03 Nghe nhận diện từ (slot 'listen' — PHASE3 §2 F-03, đổi từ "Bò hứng chữ" 28/11).
 * - 8 lượt = 6 từ của bài + 2 khách quen (nếu có); không đủ thì bổ sung từ bài.
 * - Có thể truyền customWords (từ Boss F-06 khi bấm "Ôn từ sai").
 * - Tắt tiếng (muted / audioOff): hiện nghĩa tiếng Việt thay âm thanh (test P9).
 */
export default function F03CatchWord({
  lesson,
  rules,
  seed = 1,
  muted = false,
  play,
  onEvent,
  onDone,
  extra = {},
  customWords = null,
}) {
  const startTimeRef = useRef(Date.now());
  const defaultRate = rules?.ttsRate || 0.85;
  const holdTimerRef = useRef(null);
  const longPressedRef = useRef(false);

  const [audioOff, setAudioOff] = useState(Boolean(muted));
  const [pickedWordId, setPickedWordId] = useState(null);
  const [phaseResult, setPhaseResult] = useState(null); // null | 'correct' | 'wrong'
  const [combo, setCombo] = useState(0);
  const [petText, setPetText] = useState('Nghe phát âm rồi chọn đúng từ tiếng Anh tương ứng nhé!');

  useEffect(() => {
    if (muted) setAudioOff(true);
  }, [muted]);

  const turns = useMemo(() => {
    const rng = createRng(seed + 303);
    const vocab = (lesson?.vocabulary || []).filter((v) => v?.word && v?.meaning);
    if (Array.isArray(customWords) && customWords.length > 0) {
      return customWords.map((w, idx) => ({
        id: `custom-${idx}`,
        wordId: getWordId(w),
        word: w.word,
        meaning: w.meaning,
        pos: w.pos,
        isGuest: false,
        options: pickDistractors(w, vocab.length >= 3 ? vocab : customWords, rng),
      }));
    }

    const guests = (extra.guestWords || []).slice(0, 2);
    const lessonNeed = Math.min(vocab.length, Math.max(1, TARGET_TURNS - guests.length));
    const shuffledVocab = [...vocab];
    for (let i = shuffledVocab.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffledVocab[i], shuffledVocab[j]] = [shuffledVocab[j], shuffledVocab[i]];
    }
    const baseItems = [
      ...shuffledVocab.slice(0, lessonNeed).map((w) => ({ ...w, isGuest: false })),
      ...guests.map((g) => ({ ...g, isGuest: true })),
    ];
    // Xen kẽ nhẹ khách quen vào giữa các lượt
    for (let i = baseItems.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [baseItems[i], baseItems[j]] = [baseItems[j], baseItems[i]];
    }

    const poolForDistractors = [...vocab, ...guests];
    return baseItems.map((w, idx) => ({
      id: `f03-${idx}-${getWordId(w)}`,
      wordId: getWordId(w),
      word: w.word,
      meaning: w.meaning,
      pos: w.pos,
      isGuest: Boolean(w.isGuest),
      options: pickDistractors(w, poolForDistractors, rng),
    }));
  }, [lesson?.vocabulary, extra.guestWords, customWords, seed]);

  const { current, cursor, totalSteps, done, submit, summary } = useItemQueue(turns, seed + 31);
  const finishedRef = useRef(false);

  const finishScreen = useCallback((finalSummary) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    cancelSpeech();
    onDone?.({
      code: 'F-03',
      slot: 'listen',
      total: finalSummary.total,
      firstTryCorrect: finalSummary.firstTryCorrect,
      guestTotal: finalSummary.guestTotal,
      guestCorrect: finalSummary.guestCorrect,
      audioOff,
      durationMs: Date.now() - startTimeRef.current,
    });
  }, [onDone, audioOff]);

  useEffect(() => {
    if (done) finishScreen(summary);
  }, [done, summary, finishScreen]);

  // Phát từ tự động khi vào lượt mới
  useEffect(() => {
    if (!current || done) return undefined;
    setPickedWordId(null);
    setPhaseResult(null);
    onEvent?.('item_shown', {
      itemId: current.entryId,
      wordIds: [current.item.wordId],
      skill: 'listen',
    });
    if (!audioOff) {
      const t = setTimeout(() => {
        speakWord(current.item.word, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
      }, 220);
      return () => { clearTimeout(t); cancelSpeech(); };
    }
    return undefined;
  }, [current?.entryId, done, audioOff, defaultRate, onEvent]);

  const handleAdvance = useCallback((wasCorrect) => {
    const snap = submit(wasCorrect);
    if (snap?.done) {
      // summary hook sẽ cập nhật và trigger finishScreen
    }
  }, [submit]);

  const handlePickBubble = (opt) => {
    if (!current || phaseResult !== null) return;
    setPickedWordId(opt.wordId);
    const target = current.item;

    if (opt.isTarget) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setPhaseResult('correct');
      play?.(nextCombo === 3 || nextCombo === 5 ? 'combo' : 'correct');
      setPetText(
        nextCombo >= 3
          ? `Tuyệt vời! ${nextCombo} câu liền luôn rồi! (${target.word} = ${target.meaning})`
          : `Chính xác! “${target.word}” nghĩa là ${target.meaning}.`
      );
      onEvent?.('item_correct', {
        itemId: current.entryId,
        wordIds: [target.wordId],
        word: target.word,
        meaning: target.meaning,
        skill: 'listen',
        isGuest: target.isGuest,
      });
      setTimeout(() => handleAdvance(true), 1200);
    } else {
      setCombo(0);
      setPhaseResult('wrong');
      play?.('wrong');
      setPetText(`Chưa đúng rồi — đáp án là “${target.word}” (${target.meaning}). Nghe lại nhé!`);
      onEvent?.('item_wrong', {
        itemId: current.entryId,
        wordIds: [target.wordId],
        word: target.word,
        meaning: target.meaning,
        correct: target.word,
        skill: 'listen',
        isGuest: target.isGuest,
      });
      if (!audioOff) {
        speakWord(target.word, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
      }
    }
  };

  const handleSpeakerDown = () => {
    longPressedRef.current = false;
    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      if (current) speakWord(current.item.word, { rate: 0.55, lang: 'en-US' }).catch(() => {});
    }, 450);
  };

  const handleSpeakerUp = () => {
    clearTimeout(holdTimerRef.current);
    if (!longPressedRef.current && current) {
      speakWord(current.item.word, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
    }
  };

  if (!current) return null;
  const item = current.item;
  const screenTitle = getScreenTitle('F-03', extra?.region, 'Nghe nhận diện từ');

  return (
    <FriendlyFrame
      skill="listen"
      title={screenTitle}
      code="F-03"
      counter={`${Math.min(cursor + 1, totalSteps)}/${totalSteps}`}
      extraRight={combo >= 3 ? <span className="ff-combo-chip">🔥 {combo}!</span> : null}
      petText={petText}
      petTone={phaseResult === 'correct' ? 'good' : phaseResult === 'wrong' ? 'hint' : 'neutral'}
    >
      <div className="ff-card text-center">
        <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
          {item.isGuest ? (
            <span className="ff-guest-badge">🌿 khách quen</span>
          ) : (
            <span className="small text-muted">{current.retried ? '🔁 Ôn lại lượt vừa sai' : 'Nghe và chọn từ đúng'}</span>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2"
            style={{ fontSize: '0.75rem', minHeight: 30 }}
            onClick={() => setAudioOff((v) => !v)}
            title="Bật/tắt chế độ không âm thanh (hiện nghĩa tiếng Việt)"
          >
            {audioOff ? '🔇 Hiện chữ' : '🔊 Bật loa'}
          </button>
        </div>

        {audioOff ? (
          <div className="py-1">
            <div className="small text-muted">Chọn từ tiếng Anh cho nghĩa:</div>
            <div className="fs-5 fw-bold" style={{ color: '#2F7FD1' }}>{item.meaning}</div>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center gap-1">
            <button
              type="button"
              className="btn btn-cowdi-primary ff-tap-btn rounded-pill px-4 d-inline-flex align-items-center gap-2"
              onPointerDown={handleSpeakerDown}
              onPointerUp={handleSpeakerUp}
              onPointerLeave={() => clearTimeout(holdTimerRef.current)}
            >
              <Icon name="sound" size={20} /> Nghe lại từ
            </button>
            <small className="text-muted" style={{ fontSize: '0.74rem' }}>Chạm nghe lại · Giữ nút để nghe chậm</small>
          </div>
        )}
      </div>

      {/* 3 lựa chọn (1 cột full-width trên 360px để không bao giờ tràn chữ) */}
      <div className="ff-f03-arena" role="group" aria-label="Chọn từ đúng">
        {item.options.map((opt) => {
          const isPicked = pickedWordId === opt.wordId;
          let cls = 'ff-f03-bubble ff-tap-btn';
          if (phaseResult === 'correct' && opt.isTarget) cls += ' is-caught';
          else if (phaseResult === 'wrong' && isPicked) cls += ' is-popped';
          else if (phaseResult === 'wrong' && opt.isTarget) cls += ' is-highlight';

          return (
            <button
              key={opt.wordId}
              type="button"
              className={cls}
              disabled={phaseResult !== null}
              onClick={() => handlePickBubble(opt)}
            >
              <span>{opt.word}</span>
              {phaseResult === 'correct' && opt.isTarget && (
                <span className="badge text-bg-success rounded-pill" style={{ fontSize: '0.72rem' }}>+1</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Popup phản hồi khi trả lời sai — không đẩy layout gây cuộn */}
      <ScreenActionModal
        open={phaseResult === 'wrong'}
        title="Chưa đúng rồi — nghe lại nhé!"
        tone="warning"
        primaryLabel="Tiếp theo →"
        onPrimary={() => handleAdvance(false)}
        secondaryLabel={!audioOff ? '🔊 Nghe lại' : ''}
        onSecondary={!audioOff ? () => speakWord(item.word, { rate: 0.65, lang: 'en-US' }).catch(() => {}) : undefined}
      >
        Đáp án đúng là <strong>{item.word}</strong> — <span className="text-muted">{item.meaning}</span>.
      </ScreenActionModal>
    </FriendlyFrame>
  );
}
