import { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../../../../components/Icon';
import { speakWord, stopSpeaking, scoreTypedSentence, normalizeText } from '../../../../utils/speech';
import { mulberry32, seededShuffle, hashString } from '../seededRandom';
import { pickGrammarTip } from '../items';

/** Strip trailing punctuation from a word token for tile display/comparison */
function cleanTileWord(w) {
  return String(w || '').replace(/^[.,!?;:]+|[.,!?;:]+$/g, '');
}

/** Pick 2 distractor words from lesson vocabulary that are not already in the sentence */
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
 * T-08 Viết câu (Slot Viết — màn mới Đợt 1, GEMINI-SCREEN-SYSTEM-PHASE1 §8).
 * - Xếp câu (mặc định): câu tiếng Việt + thẻ từ tiếng Anh xáo + 2 từ nhiễu; đủ số từ tự chấm.
 * - Gõ câu: nhóm exam, hoặc câu thứ 4 với nhóm intermediate; chấm qua speech.js (rút gọn + dung sai typo 1 ký tự từ >= 5 chữ).
 * - Đúng: tô xanh, đọc câu EN, tự sang câu sau sau 1,2s.
 * - Sai: hiện đáp án đúng, từ sai tô cam, pet nói mẹo ngữ pháp (thay T-03), chờ 1 chạm "Tiếp"; câu sai quay lại cuối màn 1 lần.
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
  const [feedback, setFeedback] = useState(null); // { ok, exact, typoWords, wrongIndices, petText }
  const firstTryFailedRef = useRef(new Set());
  const retriedRef = useRef(new Set());
  const autoTimerRef = useRef(null);

  const grammarTip = useMemo(() => pickGrammarTip(lesson, cursor), [lesson, cursor]);
  const current = queue[cursor];

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
      <div className="ss-empty-box">
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
      const tip = grammarTip || `Đáp án đúng: “${current.en}”`;
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
    if (feedback) return;
    if (selectedIds.includes(tileId)) return;
    const next = [...selectedIds, tileId];
    setSelectedIds(next);

    // Đủ số từ thì tự chấm (không cần nút Kiểm tra)
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
    <div className="ss-screen-inner ss-t08">
      <div className="ss-subbar">
        <span className="ss-subbar-badge">
          {current.mode === 'type' ? '⌨️ Gõ câu' : '🧩 Xếp câu'}
          {current.isRetry ? ' · Ôn lại' : ''}
        </span>
        <span className="ss-subbar-count">{Math.min(cursor + 1, queue.length)} / {queue.length}</span>
      </div>

      {/* Câu tiếng Việt + nút loa (chỉ bật đọc câu EN sau khi đã trả lời) */}
      <div className="card shadow-sm mb-2">
        <div className="card-body py-2 px-3 d-flex align-items-center gap-2">
          <div className="flex-grow-1">
            <div className="fw-bold" style={{ fontSize: '1.05rem', lineHeight: 1.35 }}>
              {current.vi}
            </div>
          </div>
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
      </div>

      {current.mode === 'arrange' ? (
        <>
          {/* Dòng trả lời: cao tối thiểu 2 hàng thẻ */}
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
                {chosenTiles.map((t, i) => (
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

          {/* Kho thẻ từ: flex-wrap, thẻ cao >= 48px */}
          <div className="ss-t08-bank">
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
        <form onSubmit={handleTypeSubmit} className="ss-t08-type-form flex-grow-1">
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

      {/* Vùng phản hồi pet cố định 64px (PHASE1 §8.3) */}
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
  );
}
