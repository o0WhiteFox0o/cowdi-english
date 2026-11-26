import { useState, useEffect, useRef, useCallback } from 'react';
import Emoji from '../Emoji';
import { speakWord, stopSpeaking, hasVietnameseVoice } from '../../utils/speech';
import { useAutoSpeak, readAutoSpeak, writeAutoSpeak } from './useAutoSpeak';
import './flashcard.css';

const SWIPE_THRESHOLD = 50;
const DEFAULT_DOT_COLOR = '#D3D1C7';
const DEFAULT_DOT_LABEL = 'Chưa gặp';

/**
 * Component Flashcard dùng chung cho LessonDetailPage và VocabularyPage.
 * SDD-FLASHCARD-AUDIO-UX v1.4 (F1, F2, F3.7, F4, F5).
 * Không tự tính điểm nhớ (R-2); mọi logic điểm/trạng thái nằm ngoài component.
 */
export default function Flashcard({
  cards = [],
  ttsRate = 0.85,
  muted = false,
  fallbackIcon = null,
  nextStepLabel = null,
  onSkipStep = null,
  onComplete = null,
  onEncounter = null,
  onSpeakStart = null,
  onSpeakEnd = null,
  getCardDotInfo = null,
  completeNotice = null,
  onStartReviewOnly = null,
  resetKey = '',
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(() => readAutoSpeak());
  const [manualSpeakingId, setManualSpeakingId] = useState(null);
  const [viVoiceReady, setViVoiceReady] = useState(() => hasVietnameseVoice());
  const touchStartX = useRef(null);

  // Reset về thẻ đầu khi đổi bài / đổi nhóm / đổi chủ đề
  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setShowMore(false);
    setManualSpeakingId(null);
  }, [resetKey]);

  // Clamp index nếu danh sách cards thay đổi độ dài
  const safeIndex = cards.length > 0 ? Math.min(index, cards.length - 1) : 0;
  const card = cards[safeIndex] || null;
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === cards.length - 1;

  // Cập nhật trạng thái giọng vi-VN khi trình duyệt nạp danh sách voices bất đồng bộ (U-11)
  useEffect(() => {
    setViVoiceReady(hasVietnameseVoice());
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
    const onVoicesChanged = () => setViVoiceReady(hasVietnameseVoice());
    try {
      window.speechSynthesis.addEventListener?.('voiceschanged', onVoicesChanged);
    } catch { /* bỏ qua */ }
    return () => {
      try {
        window.speechSynthesis.removeEventListener?.('voiceschanged', onVoicesChanged);
      } catch { /* bỏ qua */ }
    };
  }, []);

  // F1: Tự đọc khi chuyển thẻ (sau 300ms, 1 lần, không đọc khi lật thẻ)
  const { speaking: autoSpeaking, hint: autoHint } = useAutoSpeak(card?.word || '', {
    enabled: Boolean(card && autoSpeak && !muted),
    rate: ttsRate,
    delay: 300,
    onStart: onSpeakStart,
    onEnd: onSpeakEnd,
  });

  const goTo = useCallback((nextIdx) => {
    if (nextIdx < 0 || nextIdx >= cards.length) return;
    stopSpeaking();
    setManualSpeakingId(null);
    setFlipped(false);
    setShowMore(false);
    setIndex(nextIdx);
  }, [cards.length]);

  const handleFlip = useCallback(() => {
    if (!card) return;
    setFlipped((prev) => !prev);
    onEncounter?.(card);
  }, [card, onEncounter]);

  const handlePlayAudio = useCallback((e, sid, text, rate, lang = 'en-US') => {
    e.stopPropagation();
    if (!text) return;
    stopSpeaking();
    setManualSpeakingId(sid);
    onEncounter?.(card);
    Promise.resolve(
      speakWord(text, {
        rate,
        lang,
        onStart: () => {
          setManualSpeakingId(sid);
          onSpeakStart?.();
        },
        onEnd: () => {
          setManualSpeakingId((cur) => (cur === sid ? null : cur));
          onSpeakEnd?.();
        },
      }),
    ).catch(() => {
      setManualSpeakingId((cur) => (cur === sid ? null : cur));
      onSpeakEnd?.();
    });
  }, [card, onEncounter, onSpeakStart, onSpeakEnd]);

  const handleToggleAutoSpeak = () => {
    const next = !autoSpeak;
    setAutoSpeak(next);
    writeAutoSpeak(next);
    if (!next) {
      stopSpeaking();
      setManualSpeakingId(null);
      onSpeakEnd?.();
    }
  };

  const handleNextOrComplete = () => {
    if (!isLast) {
      goTo(safeIndex + 1);
      return;
    }
    stopSpeaking();
    setManualSpeakingId(null);
    onComplete?.();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches?.[0]?.clientX ?? touchStartX.current;
    const dx = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      e.preventDefault();
      if (dx < 0 && !isLast) goTo(safeIndex + 1);
      else if (dx > 0 && !isFirst) goTo(safeIndex - 1);
    }
  };

  if (!card) return null;

  // Chuẩn hoá danh sách ví dụ (hỗ trợ cả lesson.vocabulary và vocab-topics)
  const examples = Array.isArray(card.examples) && card.examples.length > 0
    ? card.examples
    : card.example
      ? [{ en: card.example, vi: card.exampleVi || '' }]
      : [];
  const primaryEx = examples[0] || null;
  const extraExamples = examples.slice(1);
  const hasMoreDetails = Boolean(extraExamples.length > 0 || card.context || card.related);

  const wordBtnSpeaking = manualSpeakingId === 'w' || (autoSpeaking && !manualSpeakingId);
  const illus = card.illustration || fallbackIcon;

  return (
    <div className="fc-root">
      {/* F3.7: Chỉ còn bộ đếm số thẻ */}
      <div className="fc-counter" aria-live="polite">
        {safeIndex + 1} / {cards.length}
      </div>

      {/* Thẻ 2 mặt đồng chiều cao */}
      <div
        className="fc-card-shell"
        role="button"
        tabIndex={0}
        aria-label={flipped ? `Mặt sau thẻ ${card.word}, chạm để lật lại` : `Thẻ từ ${card.word}, chạm để lật`}
        onClick={handleFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`fc-card-inner${flipped ? ' is-flipped' : ''}`}>
          {/* MẶT TRƯỚC (F2) */}
          <div className="fc-face fc-face--front">
            {illus && (
              <div className="fc-illus">
                <Emoji e={illus} size={46} />
              </div>
            )}
            <h2 className="fc-word">{card.word}</h2>
            {card.pos && <span className="fc-pos">{card.pos}</span>}
            {card.phonetic && <p className="fc-phonetic">{card.phonetic}</p>}
            <div className="fc-front-audio">
              <button
                type="button"
                className={`fc-audio-btn fc-audio-btn--lg${wordBtnSpeaking ? ' is-speaking' : ''}${autoHint ? ' is-hint' : ''}`}
                aria-label="Nghe lại từ"
                title="Nghe lại từ"
                onClick={(e) => handlePlayAudio(e, 'w', card.word, ttsRate, 'en-US')}
              >
                🔊
              </button>
              <button
                type="button"
                className={`fc-audio-btn fc-audio-btn--slow${manualSpeakingId === 's' ? ' is-speaking' : ''}`}
                aria-label="Nghe chậm"
                title="Nghe chậm"
                onClick={(e) => handlePlayAudio(e, 's', card.word, 0.55, 'en-US')}
              >
                🐢
              </button>
            </div>
            <span className="fc-flip-hint">Chạm để lật</span>
          </div>

          {/* MẶT SAU (F2) */}
          <div className="fc-face fc-face--back">
            <div className="fc-back-head">
              <strong>{card.word}</strong>
              {card.phonetic && <span className="fc-phonetic">{card.phonetic}</span>}
              <button
                type="button"
                className={`fc-audio-btn fc-audio-btn--sm${manualSpeakingId === 'bw' ? ' is-speaking' : ''}`}
                aria-label="Nghe lại từ"
                title="Nghe lại từ"
                onClick={(e) => handlePlayAudio(e, 'bw', card.word, ttsRate, 'en-US')}
              >
                🔊
              </button>
            </div>

            <div className="fc-back-meaning-row">
              <h3 className="fc-meaning">{card.meaning}</h3>
              {viVoiceReady && card.meaning && (
                <button
                  type="button"
                  className={`fc-audio-btn fc-audio-btn--sm${manualSpeakingId === 'vi' ? ' is-speaking' : ''}`}
                  aria-label="Nghe nghĩa tiếng Việt"
                  title="Nghe nghĩa tiếng Việt"
                  onClick={(e) => handlePlayAudio(e, 'vi', card.meaning, 0.9, 'vi-VN')}
                >
                  🔊
                </button>
              )}
            </div>

            {primaryEx && (
              <div className="fc-example-box">
                <div className="fc-example-text">
                  <div className="fc-example-en">"{primaryEx.en}"</div>
                  {primaryEx.vi && <div className="fc-example-vi">→ {primaryEx.vi}</div>}
                </div>
                <button
                  type="button"
                  className={`fc-audio-btn fc-audio-btn--sm fc-audio-btn--sm-white${manualSpeakingId === 'ex' ? ' is-speaking' : ''}`}
                  aria-label="Nghe câu ví dụ"
                  title="Nghe câu ví dụ"
                  onClick={(e) => handlePlayAudio(e, 'ex', primaryEx.en, ttsRate, 'en-US')}
                >
                  🔊
                </button>
              </div>
            )}

            {card.memoryTip && (
              <div className="fc-tip">
                💡 <strong>Mẹo nhớ:</strong> {card.memoryTip}
              </div>
            )}

            {hasMoreDetails && (
              <>
                <button
                  type="button"
                  className="fc-more-btn"
                  aria-expanded={showMore}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMore((s) => !s);
                  }}
                >
                  {showMore ? 'Thu gọn ▴' : 'Xem thêm ▾'}
                </button>
                {showMore && (
                  <div className="fc-more-box" onClick={(e) => e.stopPropagation()}>
                    {extraExamples.map((ex, idx) => (
                      <div key={idx} className="fc-example-box">
                        <div className="fc-example-text">
                          <div className="fc-example-en">"{ex.en}"</div>
                          {ex.vi && <div className="fc-example-vi">→ {ex.vi}</div>}
                        </div>
                        <button
                          type="button"
                          className={`fc-audio-btn fc-audio-btn--sm fc-audio-btn--sm-white${manualSpeakingId === `ex-${idx}` ? ' is-speaking' : ''}`}
                          aria-label="Nghe câu ví dụ"
                          onClick={(e) => handlePlayAudio(e, `ex-${idx}`, ex.en, ttsRate, 'en-US')}
                        >
                          🔊
                        </button>
                      </div>
                    ))}
                    {card.context && <div>{card.context}</div>}
                    {card.related && <div>🔗 {card.related}</div>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* F4: Hàng nút điều hướng chính */}
      <div className="fc-nav-row">
        <button
          type="button"
          className={`fc-prev-btn${isFirst ? ' is-hidden' : ''}`}
          aria-label="Thẻ trước"
          aria-hidden={isFirst}
          tabIndex={isFirst ? -1 : 0}
          onClick={() => goTo(safeIndex - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="fc-next-btn"
          onClick={handleNextOrComplete}
        >
          {isLast
            ? nextStepLabel
              ? `Hoàn thành → ${nextStepLabel} ▷`
              : 'Hoàn thành'
            : 'Tiếp ›'}
        </button>
      </div>

      {/* F3.7: Chấm tiến độ tô theo trạng thái từ */}
      <div className="fc-dots" role="tablist" aria-label="Tiến độ bộ thẻ">
        {cards.map((item, i) => {
          const info = getCardDotInfo?.(item) || {
            color: DEFAULT_DOT_COLOR,
            label: DEFAULT_DOT_LABEL,
            maybeForgotten: false,
          };
          const dotLabel = `Thẻ ${i + 1}: ${info.label}${info.maybeForgotten ? ', lâu chưa gặp' : ''}`;
          return (
            <button
              key={item.word ? `${item.word}-${i}` : i}
              type="button"
              className={`fc-dot${i === safeIndex ? ' is-current' : ''}${info.maybeForgotten ? ' is-forgotten' : ''}`}
              style={{ backgroundColor: info.color }}
              aria-label={dotLabel}
              aria-current={i === safeIndex ? 'true' : undefined}
              title={dotLabel}
              onClick={() => goTo(i)}
            />
          );
        })}
      </div>

      {/* F4: Công tắc Tự đọc + Bỏ qua sang bước kế */}
      <div className="fc-util-row">
        <button
          type="button"
          className={`fc-auto-toggle${autoSpeak ? '' : ' is-off'}`}
          aria-pressed={autoSpeak}
          onClick={handleToggleAutoSpeak}
        >
          🔁 Tự đọc: {autoSpeak ? 'Bật' : 'Tắt'}
        </button>
        {nextStepLabel && onSkipStep && (
          <button
            type="button"
            className={`fc-skip-btn${isLast ? ' is-hidden' : ''}`}
            aria-hidden={isLast}
            tabIndex={isLast ? -1 : 0}
            onClick={() => {
              stopSpeaking();
              setManualSpeakingId(null);
              onSkipStep();
            }}
          >
            Bỏ qua → {nextStepLabel}
          </button>
        )}
      </div>

      {/* F5: Thông báo hoàn thành bộ thẻ */}
      {completeNotice && (
        <div className="fc-complete-banner" role="status">
          <span>{completeNotice.text}</span>
          {completeNotice.reviewCount > 0 && onStartReviewOnly && (
            <button
              type="button"
              className="fc-review-link"
              onClick={onStartReviewOnly}
            >
              Ôn {completeNotice.reviewCount} từ này
            </button>
          )}
        </div>
      )}
    </div>
  );
}
