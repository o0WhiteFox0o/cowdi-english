import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Icon from '../../../../components/Icon';
import Emoji from '../../../../components/Emoji';
import { speakWord, stopSpeaking as cancelSpeech } from '../../../../utils/speech';
import { resolveWordImage } from '../../../../utils/imageOverrides';
import { getWordId } from '../../../vocab/wordProgress';
import { getScreenTitle } from '../../../../../shared/screen-scenarios';
import FriendlyFrame from './FriendlyFrame';
import WordSkillDots from './WordSkillDots';
import ScreenActionModal from '../ScreenActionModal';

const MAX_CARDS = 13;

function stripOuterQuotes(text) {
  return String(text || '').trim().replace(/^[“"']+|[”"']+$/g, '').trim();
}

function highlightWordInExample(example, word) {
  const cleanExample = stripOuterQuotes(example);
  if (!cleanExample || !word) return cleanExample || '';
  const escaped = String(word).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!escaped) return cleanExample;
  const parts = cleanExample.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === String(word).trim().toLowerCase()
      ? <mark key={i} style={{ background: '#FEF08A', color: '#4A3420', borderRadius: 4, padding: '0 3px', fontWeight: 800 }}>{part}</mark>
      : <span key={i}>{part}</span>
  );
}

/**
 * F-01 Gặp từ (slot 'intro'):
 * - Vào mỗi từ chỉ tự đọc từ vựng chính 1 lần (không tự đọc câu ví dụ, không tự nhảy thẻ).
 * - Câu ví dụ bên dưới có nút loa riêng, chỉ đọc khi người học nhấn vào.
 * - Người học tự nhấn "Tiếp →" khi đã nắm vững để sang từ tiếp theo.
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [speakingTarget, setSpeakingTarget] = useState(null); // 'word' | 'example' | null
  const [imgFailed, setImgFailed] = useState(false);
  const startTimeRef = useRef(Date.now());
  const holdTimerRef = useRef(null);
  const longPressedRef = useRef(false);
  const defaultRate = rules?.ttsRate || 0.85;
  const wordProgress = extra.wordProgress || {};

  const current = words[index] || null;
  const currentId = current ? getWordId(current) : '';
  const wordImgSrc = current ? (current.image || resolveWordImage(current.word)) : null;

  useEffect(() => {
    setImgFailed(false);
  }, [current?.word, wordImgSrc]);

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
    setSpeakingTarget(null);
    if (index + 1 < words.length) {
      setIndex((i) => i + 1);
    } else {
      setConfirmOpen(true);
    }
  }, [index, words.length]);

  const goPrev = useCallback(() => {
    cancelSpeech();
    setSpeakingTarget(null);
    if (index > 0) {
      setIndex((i) => i - 1);
    }
  }, [index]);

  const playWord = useCallback(
    (rate = defaultRate) => {
      if (!current?.word) return;
      setSpeakingTarget('word');
      speakWord(current.word, {
        rate,
        lang: 'en-US',
        onEnd: () => setSpeakingTarget((t) => (t === 'word' ? null : t)),
      }).catch(() => setSpeakingTarget(null));
    },
    [current, defaultRate]
  );

  const playExample = useCallback(() => {
    if (!current?.example) return;
    setSpeakingTarget('example');
    speakWord(current.example, {
      rate: defaultRate,
      lang: 'en-US',
      onEnd: () => setSpeakingTarget((t) => (t === 'example' ? null : t)),
    }).catch(() => setSpeakingTarget(null));
  }, [current, defaultRate]);

  // Gửi sự kiện item_shown cho mỗi thẻ (không có đúng/sai)
  useEffect(() => {
    if (!current) return;
    onEvent?.('item_shown', {
      itemId: `f01-${index}`,
      wordIds: currentId ? [currentId] : [],
      skill: 'intro',
    });
  }, [current, currentId, index, onEvent]);

  // Vào mỗi từ chỉ tự đọc từ vựng chính ĐÚNG 1 LẦN (không tự đọc câu ví dụ, không tự qua từ)
  useEffect(() => {
    if (!current || muted) return undefined;
    let cancelled = false;
    const timerId = setTimeout(() => {
      if (cancelled) return;
      setSpeakingTarget('word');
      speakWord(current.word, {
        rate: defaultRate,
        lang: 'en-US',
        onEnd: () => {
          if (!cancelled) setSpeakingTarget((t) => (t === 'word' ? null : t));
        },
      }).catch(() => {
        if (!cancelled) setSpeakingTarget(null);
      });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
      cancelSpeech();
      setSpeakingTarget(null);
    };
  }, [current, muted, defaultRate]);

  const handleSpeakerDown = (e) => {
    e.stopPropagation();
    longPressedRef.current = false;
    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      playWord(0.55);
    }, 450);
  };

  const handleSpeakerUp = (e) => {
    e.stopPropagation();
    clearTimeout(holdTimerRef.current);
    if (!longPressedRef.current) {
      playWord(defaultRate);
    }
  };

  const screenTitle = getScreenTitle('F-01', extra?.region, 'Gặp từ mới');

  if (!current) {
    return (
      <FriendlyFrame skill="intro" title={screenTitle} code="F-01" counter="0/0" petText="Bài này chưa có từ vựng để học.">
        <button type="button" className="btn btn-cowdi-primary ff-tap-btn" onClick={finishScreen}>Tiếp tục →</button>
      </FriendlyFrame>
    );
  }

  const petGuide =
    speakingTarget === 'example'
      ? 'Nghe kỹ câu ví dụ nhé! Thấy ổn rồi thì nhấn Tiếp → nào.'
      : 'Nghe từ mới, bấm câu ví dụ nếu muốn nghe thêm, thấy ổn thì nhấn Tiếp → nhé!';

  return (
    <FriendlyFrame
      skill="intro"
      title={screenTitle}
      code="F-01"
      counter={`Từ ${index + 1}/${words.length}`}
      petText={petGuide}
    >
      <div className="ff-card ff-f01-card">
        <div className="d-flex justify-content-end align-items-center gap-2 mb-1">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill d-inline-flex align-items-center gap-1"
            style={{ minHeight: 38, padding: '0 12px' }}
            onClick={() => playWord(0.55)}
            title="Nghe chậm từ vựng"
          >
            🐢 Chậm
          </button>
          <button
            type="button"
            className="btn btn-sm btn-cowdi-primary rounded-pill d-inline-flex align-items-center gap-1"
            style={{ minHeight: 38, padding: '0 14px' }}
            onPointerDown={handleSpeakerDown}
            onPointerUp={handleSpeakerUp}
            onPointerLeave={() => clearTimeout(holdTimerRef.current)}
            title="Chạm đọc lại từ chính · Giữ để đọc chậm"
          >
            <Icon name="sound" size={16} /> {speakingTarget === 'word' ? 'Đang đọc...' : 'Nghe từ'}
          </button>
        </div>

        <div className="my-1 d-flex justify-content-center align-items-center" style={{ minHeight: 62 }}>
          {wordImgSrc && !imgFailed ? (
            <img
              src={wordImgSrc}
              alt={current.word}
              style={{ maxHeight: 72, maxWidth: 110, objectFit: 'contain', borderRadius: 12 }}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <Emoji e={current.illustration || '📖'} size={48} />
          )}
        </div>

        <div className="ff-f01-word">{current.word}</div>

        {group !== 'beginner' && current.phonetic && (
          <div className="text-muted small">{current.phonetic}</div>
        )}

        <div className="fw-bold fs-6 mt-1" style={{ color: '#2E7D32' }}>
          {current.meaning}
        </div>

        {current.example && (
          <div
            className="mt-2 p-2 px-3 rounded-3 d-flex align-items-center justify-content-between gap-2 text-start"
            style={{ background: '#FFFDF7', border: '1.5px solid #F0E2C4' }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="fw-semibold small" style={{ color: '#4A3420' }}>
                “{highlightWordInExample(current.example, current.word)}”
              </div>
              {current.exampleVi && (
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>{current.exampleVi}</div>
              )}
            </div>
            <button
              type="button"
              className={`btn btn-sm rounded-pill flex-shrink-0 d-inline-flex align-items-center gap-1 ${
                speakingTarget === 'example' ? 'btn-primary' : 'btn-outline-primary'
              }`}
              style={{ minHeight: 36, padding: '0 12px', fontSize: '0.78rem', fontWeight: 700 }}
              onClick={playExample}
              title="Nhấn để nghe câu ví dụ"
            >
              <Icon name="sound" size={14} /> {speakingTarget === 'example' ? 'Đang đọc...' : 'Nghe câu'}
            </button>
          </div>
        )}
      </div>

      {/* Dưới thẻ: 4 chấm kỹ năng + điều hướng chủ động */}
      <div className="d-flex align-items-center justify-content-between gap-2">
        <WordSkillDots progress={wordProgress[currentId]} compact />
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary ff-tap-btn"
            style={{ minBlockSize: 38, padding: '0 12px' }}
            disabled={index === 0}
            onClick={goPrev}
          >
            ← Trước
          </button>
          <button
            type="button"
            className="btn btn-sm btn-cowdi-primary ff-tap-btn"
            style={{ minBlockSize: 38, padding: '0 14px' }}
            onClick={goNext}
          >
            {index + 1 < words.length ? 'Tiếp →' : 'Xong màn ✓'}
          </button>
        </div>
      </div>

      <ScreenActionModal
        open={confirmOpen}
        title="Đã xem xong từ mới!"
        tone="success"
        dismissible
        onDismiss={() => setConfirmOpen(false)}
        primaryLabel="Sang màn tiếp theo →"
        onPrimary={finishScreen}
        tertiaryLabel="Xem lại"
        onTertiary={() => { setConfirmOpen(false); setIndex(0); }}
      >
        Bạn vừa học xong <strong>{words.length}</strong> từ mới. Các từ này sẽ gặp lại ngay trong các màn tiếp theo!
      </ScreenActionModal>
    </FriendlyFrame>
  );
}
