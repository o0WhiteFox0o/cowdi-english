import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Icon from '../../../../components/Icon';
import Emoji from '../../../../components/Emoji';
import { speakWord, stopSpeaking as cancelSpeech } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';
import FriendlyFrame from './FriendlyFrame';
import WordSkillDots from './WordSkillDots';

const MAX_CARDS = 13; // TODO (Đợt 4): nếu bài > 13 từ thì chia 2 lượt, xen giữa 3 câu F-03 ngắn.
const PAUSE_AFTER_SPEECH_MS = 1500;

function highlightWordInExample(example, word) {
  if (!example || !word) return example || '';
  const escaped = String(word).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!escaped) return example;
  const parts = String(example).split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === String(word).trim().toLowerCase()
      ? <mark key={i} style={{ background: '#FEF08A', color: '#4A3420', borderRadius: 4, padding: '0 3px', fontWeight: 800 }}>{part}</mark>
      : <span key={i}>{part}</span>
  );
}

/**
 * F-01 Gặp từ trình chiếu (slot 'intro' — PHASE3 §2 F-01).
 */
export default function F01Slideshow({
  lesson,
  group = 'intermediate',
  rules,
  muted = false,
  onEvent,
  onDone,
  extra = {},
}) {
  const words = useMemo(() => (lesson?.vocabulary || []).slice(0, MAX_CARDS), [lesson?.vocabulary]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const startTimeRef = useRef(Date.now());
  const holdTimerRef = useRef(null);
  const longPressedRef = useRef(false);
  const defaultRate = rules?.ttsRate || 0.85;
  const wordProgress = extra.wordProgress || {};

  const current = words[index] || null;
  const currentId = current ? getWordId(current) : '';

  const finishScreen = useCallback(() => {
    cancelSpeech();
    onDone?.({
      code: 'F-01',
      slot: 'intro',
      total: words.length,
      firstTryCorrect: words.length,
      durationMs: Date.now() - startTimeRef.current,
    });
  }, [onDone, words.length]);

  const goNext = useCallback(() => {
    cancelSpeech();
    if (index + 1 < words.length) {
      setIndex((i) => i + 1);
      setProgressPct(0);
    } else {
      finishScreen();
    }
  }, [index, words.length, finishScreen]);

  const goPrev = useCallback(() => {
    cancelSpeech();
    if (index > 0) {
      setIndex((i) => i - 1);
      setProgressPct(0);
    }
  }, [index]);

  // Gửi sự kiện item_shown cho mỗi thẻ (không có đúng/sai)
  useEffect(() => {
    if (!current) return;
    onEvent?.('item_shown', {
      itemId: `f01-${index}`,
      wordIds: currentId ? [currentId] : [],
      skill: 'intro',
    });
  }, [current, currentId, index, onEvent]);

  // Nhịp tự động: 300ms đọc từ → đọc câu ví dụ → thanh tiến độ 1,5s → thẻ sau
  useEffect(() => {
    if (!current || paused) return undefined;
    let cancelled = false;
    let rafId = null;
    let timerId = null;

    const run = async () => {
      setProgressPct(0);
      await new Promise((r) => { timerId = setTimeout(r, 300); });
      if (cancelled) return;

      if (!muted) {
        await speakWord(current.word, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
        if (cancelled) return;
        if (current.example) {
          await speakWord(current.example, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
          if (cancelled) return;
        }
      }

      const waitStart = Date.now();
      const tick = () => {
        if (cancelled) return;
        const elapsed = Date.now() - waitStart;
        const pct = Math.min(100, Math.round((elapsed / PAUSE_AFTER_SPEECH_MS) * 100));
        setProgressPct(pct);
        if (elapsed >= PAUSE_AFTER_SPEECH_MS) {
          goNext();
        } else {
          rafId = requestAnimationFrame(tick);
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    run();
    return () => {
      cancelled = true;
      clearTimeout(timerId);
      if (rafId) cancelAnimationFrame(rafId);
      cancelSpeech();
    };
  }, [current, paused, muted, defaultRate, goNext]);

  const handleSpeakerDown = (e) => {
    e.stopPropagation();
    longPressedRef.current = false;
    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      if (current) speakWord(current.word, { rate: 0.55, lang: 'en-US' }).catch(() => {});
    }, 450);
  };

  const handleSpeakerUp = (e) => {
    e.stopPropagation();
    clearTimeout(holdTimerRef.current);
    if (!longPressedRef.current && current) {
      speakWord(current.word, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
    }
  };

  if (!current) {
    return (
      <FriendlyFrame skill="intro" title="Gặp từ trình chiếu" code="F-01" counter="0/0" petText="Bài này chưa có từ vựng để trình chiếu.">
        <button type="button" className="btn btn-cowdi-primary ff-tap-btn" onClick={finishScreen}>Tiếp tục →</button>
      </FriendlyFrame>
    );
  }

  return (
    <FriendlyFrame
      skill="intro"
      title="Gặp từ trình chiếu"
      code="F-01"
      counter={`Từ ${index + 1}/${words.length}`}
      petText={paused ? 'Đang dừng thẻ. Chạm vào thẻ để tiếp tục trình chiếu nhé!' : 'Nghe thật kỹ, chạm thẻ để dừng hoặc giữ nút loa để nghe chậm!'}
    >
      <div
        className="ff-card ff-f01-card"
        onClick={() => setPaused((p) => !p)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPaused((p) => !p); } }}
        aria-label={`Thẻ từ ${current.word}. Chạm để ${paused ? 'tiếp tục' : 'tạm dừng'}.`}
      >
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="badge rounded-pill text-bg-light border" style={{ color: '#7C6550' }}>
            {paused ? '⏸ Đang dừng' : '▶ Tự chạy'}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-cowdi-primary rounded-pill d-inline-flex align-items-center gap-1"
            style={{ minHeight: 40, padding: '0 14px' }}
            onPointerDown={handleSpeakerDown}
            onPointerUp={handleSpeakerUp}
            onPointerLeave={() => clearTimeout(holdTimerRef.current)}
            onClick={(e) => e.stopPropagation()}
            title="Chạm đọc lại · Giữ đọc chậm"
          >
            <Icon name="sound" size={16} /> Nghe
          </button>
        </div>

        <div className="my-2 d-flex justify-content-center align-items-center" style={{ minHeight: 72 }}>
          {current.image ? (
            <img
              src={current.image}
              alt={current.word}
              style={{ maxHeight: 76, maxWidth: 120, objectFit: 'contain', borderRadius: 12 }}
            />
          ) : (
            <Emoji e={current.illustration || '📖'} size={58} />
          )}
        </div>

        <div className="ff-f01-word">{current.word}</div>

        {group !== 'beginner' && current.phonetic && (
          <div className="text-muted small mt-1">{current.phonetic}</div>
        )}

        <div className="fw-bold fs-5 mt-1" style={{ color: '#2E7D32' }}>
          {current.meaning}
        </div>

        {current.example && (
          <div className="mt-2 p-2 rounded-3" style={{ background: '#FFFDF7', border: '1px solid #F0E2C4' }}>
            <div className="fw-semibold" style={{ fontSize: '1rem', color: '#4A3420' }}>
              “{highlightWordInExample(current.example, current.word)}”
            </div>
            {current.exampleVi && (
              <div className="small text-muted mt-1">{current.exampleVi}</div>
            )}
          </div>
        )}

        <div className="ff-f01-progress" aria-hidden="true">
          <div className="ff-f01-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Dưới thẻ: "Từ này sẽ gặp lại trong ải" + 4 chấm kỹ năng (PHASE3 §2 F-01) */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 px-1">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="small fw-semibold" style={{ color: '#7C6550' }}>Từ này sẽ gặp lại trong ải</span>
          <WordSkillDots progress={wordProgress[currentId]} showLabels />
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary ff-tap-btn"
            style={{ minHeight: 42, padding: '0 12px' }}
            disabled={index === 0}
            onClick={goPrev}
          >
            ← Trước
          </button>
          <button
            type="button"
            className="btn btn-sm btn-cowdi-primary ff-tap-btn"
            style={{ minHeight: 42, padding: '0 14px' }}
            onClick={goNext}
          >
            {index + 1 < words.length ? 'Tiếp →' : 'Xong màn ✓'}
          </button>
        </div>
      </div>
    </FriendlyFrame>
  );
}
