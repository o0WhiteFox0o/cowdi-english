import { useState, useEffect, useRef } from 'react';
import Icon from '../../../../components/Icon';
import Emoji from '../../../../components/Emoji';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';

/**
 * T-01 Từ vựng (Màn 1 — mức Tập trung).
 * Tách từ tab Từ vựng của LessonDetailPage, bỏ tab Nhóm & nút Hoàn thành thừa.
 * Xong khi đã xem/nghe hết từ (mỗi từ >= 1 lần).
 */
export default function T01Vocab({ lesson, rules, onEvent, onDone, muted }) {
  const words = lesson?.vocabulary || [];
  const [idx, setIdx] = useState(0);
  const seenRef = useRef(new Set());
  const startRef = useRef(Date.now());
  const ttsRate = rules?.ttsRate ?? 0.85;

  const current = words[idx];

  useEffect(() => {
    if (!current) return;
    const wid = getWordId(current);
    if (!seenRef.current.has(wid)) {
      seenRef.current.add(wid);
      onEvent?.('item_shown', { itemId: wid, wordIds: [wid], word: current.word, meaning: current.meaning });
    }
    if (!muted) {
      const t = setTimeout(() => {
        speakWord(current.word, { rate: ttsRate }).catch(() => {});
      }, 250);
      return () => {
        clearTimeout(t);
        stopSpeaking();
      };
    }
    return undefined;
  }, [idx, current, muted, ttsRate, onEvent]);

  useEffect(() => () => stopSpeaking(), []);

  if (words.length === 0) {
    return (
      <div className="ss-empty-box">
        <p className="text-muted mb-3">Bài này chưa có từ vựng.</p>
        <button
          type="button"
          className="btn btn-cowdi-primary"
          onClick={() => onDone?.({ code: 'T-01', slot: 'intro', total: 0, firstTryCorrect: 0, durationMs: Date.now() - startRef.current })}
        >
          Tiếp ›
        </button>
      </div>
    );
  }

  const isLast = idx >= words.length - 1;

  const handleNext = () => {
    stopSpeaking();
    if (!isLast) {
      setIdx((i) => i + 1);
    } else {
      onDone?.({
        code: 'T-01',
        slot: 'intro',
        total: words.length,
        firstTryCorrect: words.length,
        durationMs: Date.now() - startRef.current,
      });
    }
  };

  return (
    <div className="ss-screen-inner ss-t01">
      <div className="ss-subbar">
        <span className="ss-subbar-badge">Từ {idx + 1} / {words.length}</span>
        <div className="ss-dot-strip" aria-hidden="true">
          {words.map((w, i) => (
            <span
              key={w.word || i}
              className={`ss-dot${i === idx ? ' is-current' : i < idx ? ' is-done' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="card shadow-sm vocab-card ss-t01-card">
        <div className="card-body d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: '1.8rem' }}>
                  <Emoji e={current.illustration || lesson.icon} size={34} />
                </span>
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <h4 className="fw-bold text-cowdi-primary mb-0">{current.word}</h4>
                    {current.pos && <span className="badge bg-light text-secondary border small">{current.pos}</span>}
                  </div>
                  {current.phonetic && <small className="text-muted font-monospace">{current.phonetic}</small>}
                </div>
              </div>
              <div className="d-flex gap-1">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary ss-tap-btn"
                  onClick={() => speakWord(current.word, { rate: ttsRate }).catch(() => {})}
                  aria-label="Nghe phát âm"
                >
                  <Icon name="sound" size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary ss-tap-btn"
                  onClick={() => speakWord(current.word, { rate: 0.55 }).catch(() => {})}
                  aria-label="Nghe chậm"
                >
                  <Icon name="snail" size={16} />
                </button>
              </div>
            </div>

            <p className="fw-bold fs-5 mb-2">{current.meaning}</p>

            {current.example && (
              <div className="bg-light rounded p-2 d-flex align-items-center gap-2">
                <div className="flex-grow-1">
                  <small className="fst-italic text-muted d-block">“{current.example}”</small>
                  {current.exampleVi && <small className="text-secondary d-block mt-1">→ {current.exampleVi}</small>}
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary ss-tap-btn"
                  onClick={() => speakWord(current.example, { rate: ttsRate }).catch(() => {})}
                  aria-label="Nghe ví dụ"
                >
                  <Icon name="sound" size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ss-bottom-nav">
        <button
          type="button"
          className="btn btn-outline-secondary ss-tap-btn"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
        >
          ‹ Trước
        </button>
        <button
          type="button"
          className="btn btn-cowdi-primary ss-tap-btn flex-grow-1"
          onClick={handleNext}
        >
          {isLast ? 'Xong từ vựng ›' : 'Tiếp ›'}
        </button>
      </div>
    </div>
  );
}
