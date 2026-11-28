import { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../../../../components/Icon';
import { EmojiText } from '../../../../components/Emoji';
import {
  SpeechRecognitionAPI,
  extractBestTranscript,
  tokenizeText,
  scorePronunciation,
  getScoreLabel,
  speakWord,
  stopSpeaking,
} from '../../../../utils/speech';

/**
 * T-06 Nói theo (Slot Nói — mức Tập trung).
 * Tái sử dụng nguyên vẹn layout tab Nói theo của LessonDetailPage (btn-lg, vòng tròn điểm 80×80, highlight từng từ, progress bar)
 * + fallback "Nghe và nhắc lại" khi không có / từ chối mic.
 */
export default function T06Speak({ items = [], rules, onEvent, onDone, play }) {
  const startRef = useRef(Date.now());
  const recRef = useRef(null);
  const ttsRate = rules?.ttsRate ?? 0.85;
  const passThreshold = rules?.speakPassThreshold ?? 50;

  const sentences = useMemo(() => items.slice(0, 4), [items]);
  const [idx, setIdx] = useState(0);
  const [speakPlaying, setSpeakPlaying] = useState(false);
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
      <div className="card shadow-sm text-center p-4">
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
      rec.continuous = false;
      recRef.current = rec;
      let latestSpoken = '';
      let settled = false;
      let watchdog = setTimeout(() => {
        if (!settled) {
          try { rec.stop(); } catch { /* ignore */ }
        }
      }, 10000);

      const finishRecognition = (spokenText) => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        setIsRecording(false);
        onEvent?.('mic_end', {});
        const spoken = String(spokenText || '').trim();
        if (!spoken) {
          setRecError('Chưa nghe rõ giọng nói — bạn thử bấm nói lại hoặc chọn Không dùng micro nhé!');
          return;
        }
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

      rec.onstart = () => {
        setIsRecording(true);
        onEvent?.('mic_start', {});
      };
      rec.onresult = (ev) => {
        const parsed = extractBestTranscript(ev.results);
        if (parsed.bestText) {
          latestSpoken = parsed.bestText;
          setTranscript(parsed.bestText);
        }
        const last = ev.results[ev.results.length - 1];
        if (last?.isFinal && parsed.bestText) {
          finishRecognition(parsed.bestText);
        }
      };
      rec.onerror = (ev) => {
        if (settled) return;
        clearTimeout(watchdog);
        if (ev.error === 'aborted') {
          settled = true;
          setIsRecording(false);
          onEvent?.('mic_end', {});
          return;
        }
        if (latestSpoken.trim() && ev.error !== 'not-allowed' && ev.error !== 'service-not-allowed') {
          finishRecognition(latestSpoken);
          return;
        }
        settled = true;
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
        finishRecognition(latestSpoken);
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

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {micFallback && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Chế độ nghe và nhắc lại (không dùng micro).</strong><br />
            <small>Bấm Nghe mẫu, đọc to theo rồi nhấn Câu tiếp để đi tiếp nhé.</small>
          </div>
        </div>
      )}

      <div className="mb-2 text-center">
        <div className="text-muted fw-bold">{idx + 1} / {sentences.length}</div>
      </div>

      {/* Sentence card gốc */}
      <div className="card shadow-sm mb-3">
        <div className="card-body text-center py-4">
          {current.label && <div className="badge bg-light text-muted mb-2">{current.label}</div>}
          <h4 className="fw-bold text-cowdi-primary mb-2">{current.en}</h4>
          <p className="text-muted mb-3">→ {current.vi}</p>

          <div className="d-flex gap-2 justify-content-center flex-wrap mb-3">
            <button
              type="button"
              className="btn btn-cowdi-primary btn-lg"
              onClick={() => {
                setSpeakPlaying(true);
                speakWord(current.en, { rate: ttsRate }).catch(() => {}).finally(() => setSpeakPlaying(false));
              }}
              disabled={isRecording}
            >
              {speakPlaying ? <><Icon name="sound" size={18} /> Đang phát...</> : <><Icon name="sound" size={18} /> Nghe</>}
            </button>
            <button
              type="button"
              className="btn btn-outline-cowdi btn-lg"
              onClick={() => speakWord(current.en, { rate: 0.55 }).catch(() => {})}
              disabled={isRecording}
            >
              <Icon name="snail" size={18} /> Chậm
            </button>
          </div>

          {!micFallback && (
            <div className="mb-3">
              {isRecording ? (
                <button
                  type="button"
                  className="btn btn-danger btn-lg rounded-pill px-4"
                  onClick={stopRecording}
                  style={{ animation: 'pulse 1s infinite' }}
                >
                  <i className="fas fa-stop me-2"></i>Dừng ghi âm...
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-lg rounded-pill px-4"
                  onClick={startRecording}
                >
                  <i className="fas fa-microphone me-2"></i>{result ? 'Nói lại' : 'Nhấn để nói'}
                </button>
              )}
            </div>
          )}

          {isRecording && (
            <div className="text-danger fw-bold mb-2" style={{ animation: 'pulse 1s infinite' }}>
              <Icon name="mic" size={16} /> Đang nghe... Hãy đọc to câu trên!
            </div>
          )}

          {isRecording && transcript && (
            <div className="alert alert-light py-2 mb-2">
              <small className="text-muted">Đang nhận diện:</small><br />
              <span className="fst-italic">{transcript}</span>
            </div>
          )}

          {recError && (
            <div className="alert alert-warning py-2 mb-2">
              <i className="fas fa-exclamation-circle me-1"></i>{recError}
            </div>
          )}

          {result && !isRecording && (
            <div className="mt-3">
              <div className="mb-3">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold"
                  style={{
                    width: 80, height: 80, fontSize: '1.5rem',
                    border: `4px solid ${getScoreLabel(result.score).color}`,
                    color: getScoreLabel(result.score).color,
                  }}
                >
                  {result.score}%
                </div>
                <div className="fw-bold mt-1" style={{ color: getScoreLabel(result.score).color }}>
                  <EmojiText>{getScoreLabel(result.score).text}</EmojiText>
                </div>
              </div>

              {transcript && (
                <div className="alert alert-light py-2 text-start">
                  <small className="text-muted d-block mb-1">Bạn nói:</small>
                  <span className="fw-bold">{transcript}</span>
                </div>
              )}

              <div className="text-start mb-2">
                <small className="text-muted d-block mb-1">Chi tiết từng từ:</small>
                <div className="d-flex flex-wrap gap-1">
                  {tokenizeText(current.en, { expand: true }).map((w, wi) => (
                    <span
                      key={wi}
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: result.matched.includes(w) ? '#00B894' : '#D63031',
                        color: '#fff',
                        fontSize: '0.85rem',
                      }}
                    >
                      {w} {result.matched.includes(w) ? '✓' : '✗'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex gap-2 justify-content-center flex-wrap">
        {!micFallback && !result && (
          <button type="button" className="btn btn-outline-secondary" onClick={() => setMicFallback(true)}>
            Không dùng micro? Nghe &amp; nhắc lại
          </button>
        )}
        <button
          type="button"
          className="btn btn-cowdi-primary px-4"
          disabled={!micFallback && !result}
          onClick={handleNext}
        >
          {idx + 1 < sentences.length ? 'Câu tiếp →' : 'Xong màn nói →'}
        </button>
      </div>

      <div className="progress mt-3" style={{ height: '6px' }}>
        <div className="progress-bar progress-bar-cowdi" style={{ width: `${((idx + 1) / sentences.length) * 100}%` }} />
      </div>
    </div>
  );
}
