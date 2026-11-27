import { useEffect, useRef } from 'react';
import Icon from '../../../../components/Icon';
import Emoji from '../../../../components/Emoji';
import { speakWord, stopSpeaking } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';

/**
 * T-01 Từ vựng (Màn 1 — mức Tập trung).
 * Tái sử dụng nguyên vẹn layout lưới 2 cột .vocab-card quen thuộc của LessonDetailPage,
 * bỏ tab Nhóm 1/2 và nút tự đánh dấu "Đã thuộc".
 */
export default function T01Vocab({ lesson, rules, onEvent, onDone }) {
  const words = lesson?.vocabulary || [];
  const startRef = useRef(Date.now());
  const seenRef = useRef(new Set());
  const ttsRate = rules?.ttsRate ?? 0.85;

  useEffect(() => {
    for (const v of words) {
      const wid = getWordId(v);
      if (!seenRef.current.has(wid)) {
        seenRef.current.add(wid);
        onEvent?.('item_shown', { itemId: wid, wordIds: [wid], word: v.word, meaning: v.meaning });
      }
    }
    return () => stopSpeaking();
  }, [words, onEvent]);

  const handleFinish = () => {
    stopSpeaking();
    onDone?.({
      code: 'T-01',
      slot: 'intro',
      total: words.length,
      firstTryCorrect: words.length,
      durationMs: Date.now() - startRef.current,
    });
  };

  return (
    <div className="fade-in">
      <div className="row g-3">
        {words.map((v) => (
          <div className="col-12 col-md-6" key={v.word}>
            <div className="card shadow-sm h-100 card-hover vocab-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.5rem' }}>
                      <Emoji e={v.illustration || lesson.icon} size={28} />
                    </span>
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h5 className="fw-bold text-cowdi-primary mb-0">{v.word}</h5>
                        {v.pos && <span className="badge bg-light text-secondary border small">{v.pos}</span>}
                      </div>
                      <small className="text-muted font-monospace">{v.phonetic}</small>
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => speakWord(v.word, { rate: ttsRate }).catch(() => {})}
                      title="Nghe phát âm"
                      aria-label={`Nghe ${v.word}`}
                    >
                      <Icon name="sound" size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => speakWord(v.word, { rate: 0.55 }).catch(() => {})}
                      title="Nghe chậm"
                      aria-label={`Nghe chậm ${v.word}`}
                    >
                      <Icon name="snail" size={14} />
                    </button>
                  </div>
                </div>
                <p className="fw-bold mb-1">{v.meaning}</p>
                {v.example && (
                  <div className="bg-light rounded p-2 d-flex align-items-center gap-2">
                    <div className="flex-grow-1">
                      <small className="fst-italic text-muted d-block">“{v.example}”</small>
                      {v.exampleVi && <small className="text-secondary d-block mt-1">→ {v.exampleVi}</small>}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => speakWord(v.example, { rate: ttsRate }).catch(() => {})}
                      title="Nghe ví dụ"
                      style={{ flexShrink: 0 }}
                    >
                      <Icon name="sound" size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lesson-step-footer mt-3">
        <div className="lesson-step-footer-txt">
          <small className="text-muted">Màn 1 · {words.length} từ mới</small>
          <b>Nghe qua các từ rồi sang màn tiếp nhé</b>
        </div>
        <button
          type="button"
          className="btn btn-cowdi-primary btn-lg d-inline-flex align-items-center gap-2"
          onClick={handleFinish}
        >
          Tiếp › <Icon name="play" size={18} />
        </button>
      </div>
    </div>
  );
}
