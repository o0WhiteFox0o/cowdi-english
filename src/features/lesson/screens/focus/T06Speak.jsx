import { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../../../../components/Icon';
import { EmojiText } from '../../../../components/Emoji';
import {
  SpeechRecognitionAPI,
  tokenizeText,
  scorePronunciation,
  getScoreLabel,
  speakWord,
  stopSpeaking,
} from '../../../../utils/speech';

/**
 * T-06 Nói theo (Slot Nói — mức Tập trung).
 * Tách từ tab Nói theo trong LessonDetailPage (tối đa 4 câu theo PHASE1 §3).
 * Nếu không có mic hoặc người dùng từ chối mic → tự chuyển chế độ "Nghe và nhắc lại" (không chấm), vẫn hoàn thành được.
 */
export default function T06Speak({ items = [], rules, onEvent, onDone, play }) {
  const startRef = useRef(Date.now());
  const recRef = useRef(null);
  const ttsRate = rules?.ttsRate ?? 0.85;
  const passThreshold = rules?.speakPassThreshold ?? 50;

  const sentences = useMemo(() => items.slice(0, 4), [items]);
  const [idx, setIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [micFallback, setMicFallback] = useState(!SpeechRecognitionAPI);
  const [recError, setRecError] = useState('');
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const attemptedRef = useRef(new Set());

  const current = sentences[idx];

  useEffect(() => {
    if (!current) return;
    onEvent?.('item_shown', { itemId: `t06-${idx}`, wordIds: current.wordIds || [] });
  }, [idx, current, onEvent]);

  useEffect(() => () => {
    stopSpeaking();
    try { recRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  if (!current) {
    return (
      <div className="ss-empty-box">
        <p className="text-muted mb-3">Bài này chưa đủ câu luyện nói.</p>
        <button
          type="button"
          className="btn btn-cowdi-primary"
          onClick={() => onDone?.({ code: 'T-06', slot: 'speak', total: 0, firstTryCorrect: 0, durationMs: 0 })}
        >
          Tiếp ›
        </button>
      </div>
    );
  }

  const startRecording = () => {
    if (!SpeechRecognitionAPI) {
      setMicFallback(true);
      return;
    }
    stopSpeaking();
    setTranscript('');
    setResult(null);
    setRecError('');

    try {
      const rec = new SpeechRecognitionAPI();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      recRef.current = rec;
      let finalText = '';

      rec.onstart = () => {
        setIsRecording(true);
        onEvent?.('mic_start', {});
      };
      rec.onresult = (ev) => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const text = ev.results[i][0]?.transcript || '';
          if (ev.results[i].isFinal) finalText += `${text} `;
          else interim += text;
        }
        setTranscript((finalText || interim).trim());
      };
      rec.onerror = (ev) => {
        setIsRecording(false);
        onEvent?.('mic_end', {});
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed' || ev.error === 'audio-capture') {
          setMicFallback(true);
          setRecError('Không truy cập được micro — chuyển sang chế độ nghe và nhắc lại nhé!');
        } else {
          setRecError('Chưa nghe rõ, bạn thử bấm nói lại hoặc chuyển nghe-nhắc lại nhé.');
        }
      };
      rec.onend = () => {
        setIsRecording(false);
        onEvent?.('mic_end', {});
        const spoken = finalText.trim();
        if (!spoken) return;
        const sc = scorePronunciation(current.en, spoken);
        setResult(sc);
        const ok = sc.score >= passThreshold;
        const isFirst = !attemptedRef.current.has(idx);
        attemptedRef.current.add(idx);
        if (ok) {
          if (isFirst) setFirstTryCorrect((c) => c + 1);
          play?.('correct');
          onEvent?.('item_correct', { itemId: `t06-${idx}`, wordIds: current.wordIds || [], firstTry: isFirst, skill: 'speak' });
        } else {
          play?.('wrong');
          onEvent?.('item_wrong', { itemId: `t06-${idx}`, wordIds: current.wordIds || [], correct: current.en, skill: 'speak' });
        }
      };
      rec.start();
    } catch {
      setMicFallback(true);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try { recRef.current?.stop(); } catch { /* ignore */ }
  };

  const handleNext = () => {
    stopSpeaking();
    stopRecording();
    if (idx + 1 < sentences.length) {
      setIdx((i) => i + 1);
      setTranscript('');
      setResult(null);
      setRecError('');
    } else {
      onDone?.({
        code: 'T-06',
        slot: 'speak',
        total: sentences.length,
        firstTryCorrect: micFallback ? sentences.length : firstTryCorrect,
        durationMs: Date.now() - startRef.current,
        micFallback,
      });
    }
  };

  const lbl = result ? getScoreLabel(result.score) : null;

  return (
    <div className="ss-screen-inner ss-t06">
      <div className="ss-subbar">
        <span className="ss-subbar-badge">{current.label || 'Nói theo'}</span>
        <span className="ss-subbar-count">{idx + 1} / {sentences.length}</span>
      </div>

      {micFallback && (
        <div className="alert alert-warning py-2 px-3 mb-2 small">
          Chế độ <strong>Nghe và nhắc lại</strong> (không cần micro): bấm nghe mẫu, tự đọc to rồi bấm Tiếp.
        </div>
      )}

      <div className="card shadow-sm flex-grow-1 d-flex flex-column justify-content-center">
        <div className="card-body text-center py-3">
          <h4 className="fw-bold text-cowdi-primary mb-1">{current.en}</h4>
          <p className="text-muted small mb-3">→ {current.vi}</p>

          <div className="d-flex gap-2 justify-content-center flex-wrap mb-3">
            <button
              type="button"
              className="btn btn-cowdi-primary ss-tap-btn"
              disabled={isRecording}
              onClick={() => speakWord(current.en, { rate: ttsRate }).catch(() => {})}
            >
              <Icon name="sound" size={16} /> Nghe mẫu
            </button>
            <button
              type="button"
              className="btn btn-outline-cowdi ss-tap-btn"
              disabled={isRecording}
              onClick={() => speakWord(current.en, { rate: 0.55 }).catch(() => {})}
            >
              <Icon name="snail" size={16} /> Chậm
            </button>
          </div>

          {!micFallback && (
            <div className="mb-2">
              {isRecording ? (
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 ss-tap-btn"
                  onClick={stopRecording}
                >
                  ⏹ Dừng ghi âm...
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-danger rounded-pill px-4 ss-tap-btn"
                  onClick={startRecording}
                >
                  🎤 {result ? 'Nói lại' : 'Nhấn để nói'}
                </button>
              )}
            </div>
          )}

          {recError && <div className="text-warning small mt-1">{recError}</div>}

          {result && !isRecording && (
            <div className="mt-2">
              <span className="badge rounded-pill px-3 py-2" style={{ background: lbl.color, color: '#fff', fontSize: '0.95rem' }}>
                {result.score}% · <EmojiText>{lbl.text}</EmojiText>
              </span>
              {transcript && <div className="small text-muted mt-1">Bạn nói: “{transcript}”</div>}
              <div className="d-flex flex-wrap gap-1 justify-content-center mt-2">
                {tokenizeText(current.en, { expand: true }).map((w, wi) => (
                  <span
                    key={wi}
                    className="badge rounded-pill"
                    style={{ background: result.matched.includes(w) ? '#00B894' : '#D63031', color: '#fff' }}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ss-bottom-nav mt-2">
        {!micFallback && !result && (
          <button
            type="button"
            className="btn btn-outline-secondary ss-tap-btn"
            onClick={() => setMicFallback(true)}
          >
            Không dùng mic
          </button>
        )}
        <button
          type="button"
          className="btn btn-cowdi-primary ss-tap-btn flex-grow-1"
          disabled={!micFallback && !result}
          onClick={handleNext}
        >
          {idx + 1 < sentences.length ? 'Câu tiếp ›' : 'Xong luyện nói ›'}
        </button>
      </div>
    </div>
  );
}
