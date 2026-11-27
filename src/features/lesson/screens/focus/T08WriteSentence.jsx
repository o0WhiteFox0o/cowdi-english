import { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../../../../components/Icon';
import { speakWord, stopSpeaking, scoreTypedSentence, normalizeText } from '../../../../utils/speech';
import { mulberry32, seededShuffle, hashString } from '../seededRandom';
import { pickGrammarTip } from '../items';

function cleanTileWord(w) {
  return String(w || '').replace(/^[.,!?;:]+|[.,!?;:]+$/g, '');
}

function pickDistractors(targetWords, vocabulary, rng) {
  const inSentence = new Set(targetWords.map((w) => w.toLowerCase()));
  const pool = [];
  for (const v of vocabulary || []) {
    const raw = String(v?.word || '').trim();
    if (!raw || raw.includes(' ')) continue;
    const lower = raw.toLowerCase();
    if (!inSentence.has(lower) && !pool.some((p) => p.toLowerCase() === lower)) {
      pool.push(raw);
    }
  }
  const fallback = ['always', 'never', 'very', 'good', 'today', 'happy'];
  for (const fb of fallback) {
    if (pool.length >= 4) break;
    if (!inSentence.has(fb) && !pool.some((p) => p.toLowerCase() === fb)) pool.push(fb);
  }
  return seededShuffle(pool, rng).slice(0, 2);
}

/**
 * T-08 Viết câu (Slot Viết — màn mới Đợt 1).
 * Dùng chung phong cách card Cowdi (.card.shadow-sm + .quiz-sticky-action-bar) để đồng nhất hoàn toàn với các màn cũ.
 */
export default function T08WriteSentence({
  lesson,
  group = 'intermediate',
  items = [],
  rules,
  onEvent,
  onDone,
  muted,
  play,
  seed = 1,
}) {
  const startRef = useRef(Date.now());
  const ttsRate = rules?.ttsRate ?? 0.85;

  const initialQueue = useMemo(() => {
    return items.slice(0, 4).map((item, idx) => {
      const targetWords = (item.words || []).map(cleanTileWord).filter(Boolean);
      const rng = mulberry32(hashString(`t08:${lesson?.id || ''}:${seed}:${idx}`));
      const distractors = pickDistractors(targetWords, lesson?.vocabulary || [], rng);
      const bank = seededShuffle(
        [...targetWords, ...distractors].map((w, ti) => ({ id: `${idx}-${ti}-${w}`, text: w })),
        rng,
      );
      const mode = group === 'exam' || (group === 'intermediate' && idx === 3) ? 'type' : 'arrange';
      return {
        ...item,
        uid: `w-${idx}`,
        origIdx: idx,
        targetWords,
        bank,
        mode,
        isRetry: false,
      };
    });
  }, [items, lesson?.id, lesson?.vocabulary, group, seed]);

  const [queue, setQueue] = useState(initialQueue);
  const [cursor, setCursor] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [typedText, setTypedText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const firstTryFailedRef = useRef(new Set());
  const retriedRef = useRef(new Set());
  const autoTimerRef = useRef(null);

  const current = queue[cursor];
  const grammarTip = useMemo(() => pickGrammarTip(lesson, current), [lesson, current]);

  useEffect(() => {
    setQueue(initialQueue);
    setCursor(0);
    setSelectedIds([]);
    setTypedText('');
    setFeedback(null);
    firstTryFailedRef.current = new Set();
    retriedRef.current = new Set();
  }, [initialQueue]);

  useEffect(() => {
    if (!current) return;
    onEvent?.('item_shown', { itemId: current.uid, wordIds: current.wordIds || [] });
  }, [cursor, current, onEvent]);

  useEffect(() => () => {
    clearTimeout(autoTimerRef.current);
    stopSpeaking();
  }, []);

  if (!current) {
    return (
      <div className="card shadow-sm text-center p-4">
        <p className="text-muted mb-3">Bài này chưa đủ câu viết.</p>
        <button
          type="button"
          className="btn btn-cowdi-primary"
          onClick={() => onDone?.({ code: 'T-08', slot: 'write', total: 0, firstTryCorrect: 0, durationMs: 0 })}
        >
          Tiếp ›
        </button>
      </div>
    );
  }

  const advanceNext = (nextQueueOverride) => {
    clearTimeout(autoTimerRef.current);
    stopSpeaking();
    const activeQueue = nextQueueOverride || queue;
    if (cursor + 1 < activeQueue.length) {
      setCursor((c) => c + 1);
      setSelectedIds([]);
      setTypedText('');
      setFeedback(null);
    } else {
      const total = initialQueue.length;
      const firstTryCorrect = Math.max(0, total - firstTryFailedRef.current.size);
      onDone?.({
        code: 'T-08',
        slot: 'write',
        total,
        firstTryCorrect,
        durationMs: Date.now() - startRef.current,
      });
    }
  };

  const applyGrade = (ok, details = {}) => {
    const isFirst = !current.isRetry && !firstTryFailedRef.current.has(current.uid);
    if (!muted) {
      speakWord(current.en, { rate: ttsRate }).catch(() => {});
    }

    if (ok) {
      play?.('correct');
      const typoHint = details.typoWords?.length
        ? `Gần hoàn hảo! Chú ý chính tả: ${details.typoWords.map((t) => `"${t.expected}"`).join(', ')}.`
        : 'Đúng rồi! Giỏi quá!';
      setFeedback({ ok: true, ...details, petText: typoHint });
      onEvent?.('item_correct', {
        itemId: current.uid,
        wordIds: current.wordIds || [],
        firstTry: isFirst,
        skill: 'write',
      });
      autoTimerRef.current = setTimeout(() => advanceNext(), 1200);
    } else {
      play?.('wrong');
      firstTryFailedRef.current.add(current.uid);
      let nextQ = queue;
      if (!retriedRef.current.has(current.uid)) {
        retriedRef.current.add(current.uid);
        nextQ = [...queue, { ...current, isRetry: true }];
        setQueue(nextQ);
      }
      const fallbackTip = current.mode === 'arrange'
        ? 'Xem lại vị trí các từ tô cam phía trên, bấm loa nghe câu mẫu rồi thử lại ở cuối màn nhé!'
        : `Xem kỹ câu đúng “${current.en}”, bấm loa nghe lại rồi thử ở cuối màn nhé!`;
      const tip = grammarTip || fallbackTip;
      setFeedback({ ok: false, ...details, petText: tip });
      onEvent?.('item_wrong', {
        itemId: current.uid,
        wordIds: current.wordIds || [],
        correct: current.en,
        skill: 'write',
      });
    }
  };

  const handleBankTap = (tileId) => {
    if (feedback || selectedIds.includes(tileId)) return;
    const next = [...selectedIds, tileId];
    setSelectedIds(next);

    if (next.length === current.targetWords.length) {
      const chosenWords = next.map((id) => current.bank.find((t) => t.id === id)?.text || '');
      const wrongIndices = [];
      for (let i = 0; i < current.targetWords.length; i++) {
        if (normalizeText(chosenWords[i]) !== normalizeText(current.targetWords[i])) {
          wrongIndices.push(i);
        }
      }
      applyGrade(wrongIndices.length === 0, { exact: wrongIndices.length === 0, wrongIndices });
    }
  };

  const handleAnswerTap = (tileId) => {
    if (feedback) return;
    setSelectedIds((prev) => prev.filter((id) => id !== tileId));
  };

  const handleTypeSubmit = (e) => {
    e.preventDefault();
    if (feedback || !typedText.trim()) return;
    const res = scoreTypedSentence(current.en, typedText);
    applyGrade(res.ok, res);
  };

  const chosenTiles = selectedIds.map((id) => current.bank.find((t) => t.id === id)).filter(Boolean);
  const defaultPetTip = cursor === 0 && !feedback && grammarTip
    ? `💡 Mẹo: ${grammarTip}`
    : (current.mode === 'type' ? 'Gõ câu tiếng Anh tương ứng nhé!' : 'Chạm từng thẻ từ để ghép thành câu đúng!');

  return (
    <div className="card shadow-sm" style={{ borderRadius: 16, maxWidth: 720, margin: '0 auto' }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-light text-muted">
            {current.mode === 'type' ? '⌨️ Gõ câu' : '🧩 Xếp câu'}
            {current.isRetry ? ' · Ôn lại' : ''}
          </span>
          <small className="text-muted fw-bold">{Math.min(cursor + 1, queue.length)} / {queue.length}</small>
        </div>
        <div className="progress mb-3" style={{ height: 6, borderRadius: 999 }}>
          <div
            className="progress-bar progress-bar-cowdi"
            style={{ width: `${((cursor + 1) / queue.length) * 100}%`, transition: 'width .3s' }}
          />
        </div>

        {/* Câu tiếng Việt */}
        <div className="bg-light rounded p-3 mb-3 d-flex align-items-center gap-2">
          <div className="flex-grow-1 fw-bold fs-5">{current.vi}</div>
          {feedback && (
            <button
              type="button"
              className="btn btn-sm btn-outline-cowdi ss-tap-btn"
              onClick={() => speakWord(current.en, { rate: ttsRate }).catch(() => {})}
              aria-label="Nghe câu tiếng Anh"
            >
              <Icon name="sound" size={16} />
            </button>
          )}
        </div>

        {current.mode === 'arrange' ? (
          <>
            <div className={`ss-t08-answer-line${feedback ? (feedback.ok ? ' is-ok' : ' is-wrong') : ''}`}>
              {feedback && !feedback.ok ? (
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  {current.targetWords.map((w, i) => {
                    const isMismatch = feedback.wrongIndices?.includes(i);
                    return (
                      <span key={i} className={`ss-word-chip is-static${isMismatch ? ' is-wrong-word' : ' is-ok-word'}`}>
                        {w}
                      </span>
                    );
                  })}
                </div>
              ) : chosenTiles.length === 0 ? (
                <span className="text-muted small">Chạm thẻ từ bên dưới để xếp câu ({current.targetWords.length} từ)…</span>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {chosenTiles.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`ss-word-chip is-placed${feedback?.ok ? ' is-ok-word' : ''}`}
                      onClick={() => handleAnswerTap(t.id)}
                      disabled={Boolean(feedback)}
                    >
                      {t.text}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ss-t08-bank mb-2">
              {current.bank.map((t) => {
                const used = selectedIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`ss-word-chip${used ? ' is-used' : ''}`}
                    disabled={used || Boolean(feedback)}
                    onClick={() => handleBankTap(t.id)}
                  >
                    {t.text}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <form onSubmit={handleTypeSubmit} className="mb-3">
            <input
              type="text"
              className={`form-control form-control-lg mb-2${feedback ? (feedback.ok ? ' is-valid' : ' is-invalid') : ''}`}
              placeholder="Nhập câu tiếng Anh..."
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              disabled={Boolean(feedback)}
              autoComplete="off"
              spellCheck={false}
            />
            {!feedback && (
              <button
                type="submit"
                className="btn btn-cowdi-primary w-100 ss-tap-btn"
                disabled={!typedText.trim()}
              >
                Kiểm tra
              </button>
            )}
            {feedback && !feedback.ok && (
              <div className="alert alert-warning py-2 px-3 small mb-0">
                <strong>Đáp án đúng:</strong> {current.en}
              </div>
            )}
          </form>
        )}

        {/* Thanh mẹo / phản hồi pet */}
        <div className={`ss-t08-pet-bar${feedback ? (feedback.ok ? ' is-ok' : ' is-wrong') : ''}`}>
          <div className="ss-t08-pet-bubble">
            {feedback ? feedback.petText : defaultPetTip}
          </div>
          {feedback && !feedback.ok && (
            <button
              type="button"
              className="btn btn-cowdi-primary ss-tap-btn px-3"
              onClick={() => advanceNext()}
            >
              Tiếp ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
