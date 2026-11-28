import { useState, useEffect, useRef } from 'react';
import Icon from '../../../../components/Icon';
import Emoji from '../../../../components/Emoji';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';
import ScreenActionModal from '../ScreenActionModal';

/**
 * T-01 Từ vựng (Màn 1 — mức Tập trung).
 * Thiết kế không cuộn ở 360×640: xem lần lượt từng từ (hoặc cặp 2 từ trên màn rộng),
 * nút loa gọn không tràn viền; xác nhận qua màn bằng popup ScreenActionModal.
 */
export default function T01Vocab({ lesson, rules, onEvent, onDone }) {
  const words = lesson?.vocabulary || [];
  const [index, setIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const startRef = useRef(Date.now());
  const seenRef = useRef(new Set());
  const ttsRate = rules?.ttsRate ?? 0.85;

  const current = words[index] || null;

  useEffect(() => {
    if (!current) return;
    const wid = getWordId(current);
    if (wid && !seenRef.current.has(wid)) {
      seenRef.current.add(wid);
      onEvent?.('item_shown', { itemId: wid, wordIds: [wid], word: current.word, meaning: current.meaning });
    }
  }, [current, onEvent]);

  useEffect(() => () => stopSpeaking(), []);

  const handleFinish = () => {
    stopSpeaking();
    setConfirmOpen(false);
    // Đánh dấu đã gặp toàn bộ từ nếu user chọn qua màn sớm
    for (const v of words) {
      const wid = getWordId(v);
      if (wid && !seenRef.current.has(wid)) {
        seenRef.current.add(wid);
        onEvent?.('item_shown', { itemId: wid, wordIds: [wid], word: v.word, meaning: v.meaning });
      }
    }
    onDone?.({
      code: 'T-01',
      slot: 'intro',
      total: words.length,
      firstTryCorrect: words.length,
      durationMs: Date.now() - startRef.current,
    });
  };

  if (!current) {
    return (
      <div className="card shadow-sm text-center p-4">
        <p className="text-muted mb-3">Bài này chưa có từ vựng.</p>
        <button type="button" className="btn btn-cowdi-primary ss-tap-btn" onClick={handleFinish}>
          Qua màn tiếp ›
        </button>
      </div>
    );
  }

  const isLast = index + 1 >= words.length;
  const pct = words.length > 0 ? Math.round(((index + 1) / words.length) * 100) : 100;

  return (
    <div className="fade-in d-flex flex-column gap-2">
      {/* Header gọn 1 dòng + nút mở popup xác nhận qua màn */}
      <div className="d-flex align-items-center justify-content-between gap-2">
        <span className="small fw-bold text-muted">
          Từ {index + 1} / {words.length}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-outline-success rounded-pill fw-bold"
          onClick={() => setConfirmOpen(true)}
        >
          ✓ Qua màn
        </button>
      </div>

      <div className="progress" style={{ height: 5, borderRadius: 999 }}>
        <div className="progress-bar progress-bar-cowdi" style={{ width: `${pct}%` }} />
      </div>

      {/* Thẻ từ đơn gọn — vừa khít 360×640, không tràn nút loa */}
      <div className="ss-t01-card shadow-sm">
        <div className="ss-t01-top">
          <div className="ss-t01-word-wrap">
            <Emoji e={current.illustration || lesson.icon || '📖'} size={34} />
            <div style={{ minWidth: 0 }}>
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <h5 className="ss-t01-word">{current.word}</h5>
                {current.pos && (
                  <span className="badge bg-light text-secondary border" style={{ fontSize: '0.7rem' }}>
                    {current.pos}
                  </span>
                )}
              </div>
              {current.phonetic && (
                <div className="text-muted font-monospace small">{current.phonetic}</div>
              )}
            </div>
          </div>

          <div className="ss-t01-actions">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill d-inline-flex align-items-center gap-1"
              onClick={() => speakWord(current.word, { rate: ttsRate }).catch(() => {})}
              title="Nghe phát âm"
              aria-label={`Nghe ${current.word}`}
            >
              <Icon name="sound" size={14} /> Nghe
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill"
              onClick={() => speakWord(current.word, { rate: 0.55 }).catch(() => {})}
              title="Nghe chậm"
              aria-label={`Nghe chậm ${current.word}`}
            >
              <Icon name="snail" size={14} />
            </button>
          </div>
        </div>

        <p className="fw-bold fs-5 mt-2 mb-2" style={{ color: '#2E7D32' }}>{current.meaning}</p>

        {current.example && (
          <div className="bg-light rounded-3 p-2 d-flex align-items-center gap-2">
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="fst-italic small" style={{ color: '#4A3420' }}>“{current.example}”</div>
              {current.exampleVi && (
                <div className="text-secondary small mt-1">→ {current.exampleVi}</div>
              )}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-circle"
              style={{ width: 34, height: 34, padding: 0, flexShrink: 0 }}
              onClick={() => speakWord(current.example, { rate: ttsRate }).catch(() => {})}
              title="Nghe ví dụ"
              aria-label="Nghe câu ví dụ"
            >
              <Icon name="sound" size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Điều hướng Trước / Tiếp gọn 1 dòng */}
      <div className="ss-t01-nav">
        <button
          type="button"
          className="btn btn-outline-secondary ss-tap-btn px-3"
          disabled={index === 0}
          onClick={() => { stopSpeaking(); setIndex((i) => Math.max(0, i - 1)); }}
        >
          ← Trước
        </button>
        <button
          type="button"
          className="btn btn-cowdi-primary ss-tap-btn px-4"
          onClick={() => {
            stopSpeaking();
            if (isLast) setConfirmOpen(true);
            else setIndex((i) => i + 1);
          }}
        >
          {isLast ? 'Hoàn thành ✓' : 'Từ tiếp →'}
        </button>
      </div>

      {/* Popup xác nhận qua màn (không chiếm diện tích màn học) */}
      <ScreenActionModal
        open={confirmOpen}
        title="Xong phần Từ vựng!"
        tone="success"
        dismissible
        onDismiss={() => setConfirmOpen(false)}
        primaryLabel="Sang màn tiếp theo →"
        onPrimary={handleFinish}
        tertiaryLabel="Xem lại từ"
        onTertiary={() => setConfirmOpen(false)}
      >
        Bạn đã xem <strong>{seenRef.current.size}/{words.length}</strong> từ mới của bài. Sẵn sàng chuyển sang màn kế tiếp chưa?
      </ScreenActionModal>
    </div>
  );
}
