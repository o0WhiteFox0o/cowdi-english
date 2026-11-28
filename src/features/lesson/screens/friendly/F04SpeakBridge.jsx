import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../../components/Icon';
import { usePet } from '../../../../hooks/usePet';
import { PET_REGISTRY, getEvolutionInfo } from '../../../../data/pets';
import {
  SpeechRecognitionAPI,
  extractBestTranscript,
  speakWord,
  stopSpeaking,
  scorePronunciation,
} from '../../../../utils/speech';
import { getScreenTitle } from '../../../../../shared/screen-scenarios';
import { speakItems } from '../items';
import { evaluateSpeakAttempt, shouldShowManualMicButton } from './f04Logic';
import FriendlyFrame from './FriendlyFrame';
import ScreenActionModal from '../ScreenActionModal';

export { evaluateSpeakAttempt, shouldShowManualMicButton };

const MAX_ITEMS = 5;
const MAX_RETRIES = 2;

/**
 * F-04 Luyện nói vượt chướng ngại / Gọi pet vượt suối (slot 'speak' — PHASE4 §2 F-04).
 * Điều chỉnh Sonny (28/11):
 * - Đọc câu mẫu → đếm 3-2-1 → THỬ TỰ MỞ MIC; CHỈ hiện nút mic khi trình duyệt chặn.
 * - Nhóm Mới học: không chấm điểm — nói qua mic hoặc bấm "Con đã nói" đều qua.
 * - Không mic / từ chối mic: chế độ "Nghe và nhắc lại", vẫn xong màn, KHÔNG ghi skillsHit.speak (Q3).
 */
export default function F04SpeakBridge({
  lesson,
  items,
  group = 'intermediate',
  rules,
  muted = false,
  play,
  onEvent,
  onDone,
  extra = {},
}) {
  const { getActivePetWithDecay } = usePet();
  const activePet = getActivePetWithDecay();
  const petSpecies = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const petEvo = activePet && petSpecies ? getEvolutionInfo(activePet.speciesId, activePet.evolution) : null;
  const petImg = petEvo?.image || '/assets/images/logo/MiniLogoCowdi.svg';

  const startTimeRef = useRef(Date.now());
  const defaultRate = rules?.ttsRate || 0.85;
  const region = extra.region || 'BD';
  const screenTitle = getScreenTitle('F-04', region, 'Luyện nói vượt chướng ngại');

  const sentences = useMemo(() => {
    const src = Array.isArray(items) && items.length > 0 ? items : speakItems(lesson);
    return src.slice(0, MAX_ITEMS);
  }, [items, lesson]);

  const [cursor, setCursor] = useState(0);
  // phase: 'model' | 'countdown' | 'listening' | 'blocked' | 'nomic' | 'result'
  const [phase, setPhase] = useState('model');
  const [countdown, setCountdown] = useState(3);
  const [transcript, setTranscript] = useState('');
  const [scoreInfo, setScoreInfo] = useState(null); // { score, matched[], missed[], passed }
  const [retries, setRetries] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [hadWrongThisTurn, setHadWrongThisTurn] = useState(false);
  const [petText, setPetText] = useState('Nghe câu mẫu rồi đọc to theo sau tiếng đếm 3-2-1 nhé!');
  const [petTone, setPetTone] = useState('neutral');

  const recognitionRef = useRef(null);
  const timersRef = useRef([]);
  const firstTryRef = useRef(0);
  const advancedForCursorRef = useRef(-1);
  const current = sentences[cursor] || null;

  const clearAllTimers = useCallback(() => {
    for (const id of timersRef.current) clearTimeout(id);
    timersRef.current = [];
  }, []);

  const stopMic = useCallback(() => {
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      try { rec.abort(); } catch { /* ignore */ }
    }
    onEvent?.('mic_end', {});
  }, [onEvent]);

  const finishMicNow = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
  }, []);

  const advanceNext = useCallback((wasFirstTryOk) => {
    if (advancedForCursorRef.current === cursor) return;
    advancedForCursorRef.current = cursor;
    clearAllTimers();
    stopMic();
    stopSpeaking();
    const nextFirstTry = firstTryRef.current + (wasFirstTryOk ? 1 : 0);
    firstTryRef.current = nextFirstTry;
    setFirstTryCount(nextFirstTry);
    if (cursor + 1 < sentences.length) {
      setCursor((c) => c + 1);
    } else {
      onDone?.({
        code: 'F-04',
        slot: 'speak',
        total: sentences.length,
        firstTryCorrect: nextFirstTry,
        durationMs: Date.now() - startTimeRef.current,
      });
    }
  }, [clearAllTimers, stopMic, cursor, sentences.length, onDone]);

  const startMicRecognition = useCallback((isManualTap = false) => {
    if (!current) return;
    if (!SpeechRecognitionAPI) {
      setPhase('nomic');
      setPetText('Thiết bị chưa hỗ trợ nhận diện giọng nói. Con nghe mẫu và nhắc lại nhé!');
      return;
    }

    stopSpeaking();
    stopMic();
    setTranscript('');
    setScoreInfo(null);

    try {
      const rec = new SpeechRecognitionAPI();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = false;
      recognitionRef.current = rec;

      let latestSpoken = '';
      let settled = false;
      let micWatchdog = null;

      const clearMicWatchdog = () => {
        if (micWatchdog) {
          clearTimeout(micWatchdog);
          micWatchdog = null;
        }
      };

      const evaluateSpoken = (spokenText) => {
        if (settled) return;
        settled = true;
        clearMicWatchdog();
        recognitionRef.current = null;
        onEvent?.('mic_end', {});

        const clean = String(spokenText || '').trim();
        if (!clean) {
          setPhase('blocked');
          setPetText('Chưa nghe thấy giọng nói. Chạm Micro để đọc lại hoặc chọn Không dùng mic nhé!');
          return;
        }

        const res = scorePronunciation(current.en, clean);
        const evalRes = evaluateSpeakAttempt({ group, score: res.score, micUsed: true });

        setScoreInfo({ ...res, passed: evalRes.passed });
        setPhase('result');

        if (evalRes.passed) {
          play?.('correct');
          setPetTone('good');
          setPetText(group === 'beginner' ? 'Đọc hay lắm! Pet nhảy qua tảng đá rồi!' : `Tuyệt vời (${res.score}%)! Pet đã nhảy qua đá!`);
          onEvent?.('item_correct', {
            itemId: `f04-${cursor}`,
            wordIds: current.wordIds || [],
            word: current.en,
            meaning: current.vi,
            skill: 'speak',
            skipSkillHit: !evalRes.recordSkillHit,
          });
          const t = setTimeout(() => advanceNext(!hadWrongThisTurn), 1100);
          timersRef.current.push(t);
        } else {
          play?.('wrong');
          setHadWrongThisTurn(true);
          setPetTone('hint');
          setPetText(`Nghe được ${res.score}%. Pet đi vòng nhẹ — mình thử đọc lại thêm lần nữa nhé!`);
          onEvent?.('item_wrong', {
            itemId: `f04-${cursor}`,
            wordIds: current.wordIds || [],
            correct: current.en,
            skill: 'speak',
          });
        }
      };

      setPhase('listening');
      setPetText('🎤 Đang nghe con đọc… hãy nói rõ từng từ nhé!');
      onEvent?.('mic_start', { itemId: `f04-${cursor}` });

      // Watchdog 10 giây phòng thiết bị di động giữ mic không tự ngắt
      micWatchdog = setTimeout(() => {
        if (!settled) {
          try { rec.stop(); } catch { /* ignore */ }
          // Nếu trình duyệt vẫn không bắn onend sau stop(), tự chốt sau 600ms
          const fallbackTid = setTimeout(() => evaluateSpoken(latestSpoken), 600);
          timersRef.current.push(fallbackTid);
        }
      }, 10000);
      timersRef.current.push(micWatchdog);

      rec.onresult = (event) => {
        const parsed = extractBestTranscript(event.results);
        if (parsed.bestText) {
          latestSpoken = parsed.bestText;
          setTranscript(parsed.bestText);
        }
        const last = event.results[event.results.length - 1];
        if (last?.isFinal && parsed.bestText) {
          evaluateSpoken(parsed.bestText);
        }
      };

      rec.onerror = (event) => {
        if (settled) return;
        settled = true;
        clearMicWatchdog();
        recognitionRef.current = null;
        onEvent?.('mic_end', {});
        const code = event?.error || '';
        if (code === 'aborted') return;
        // Nếu đã thu được chữ (interim) trước khi gặp lỗi nhỏ, chấm luôn chữ đó
        if (latestSpoken.trim() && code !== 'not-allowed' && code !== 'service-not-allowed') {
          settled = false;
          evaluateSpoken(latestSpoken);
          return;
        }
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          if (!isManualTap) {
            setPhase('blocked');
            setPetText('Trình duyệt cần con chạm nút Micro bên dưới để bật mic nha!');
          } else {
            setPhase('nomic');
            setPetText('Không sao! Con hãy nghe mẫu và đọc to theo rồi bấm "Con đã nói" nhé.');
          }
        } else if (code === 'no-speech') {
          setPhase('blocked');
          setPetText('Chưa nghe thấy giọng nói. Chạm Micro để đọc lại hoặc bấm nghe mẫu nhé!');
        } else {
          setPhase('nomic');
          setPetText('Mic tạm bận — chuyển sang chế độ Nghe và nhắc lại nhé!');
        }
      };

      // QUAN TRỌNG cho ĐT (iOS Safari / Android Chrome):
      // Nhiều máy kết thúc ghi âm qua onend mà KHÔNG bắn isFinal=true.
      rec.onend = () => {
        if (settled) return;
        evaluateSpoken(latestSpoken);
      };

      rec.start();
    } catch {
      onEvent?.('mic_end', {});
      setPhase('blocked');
      setPetText('Chạm nút Micro bên dưới để bắt đầu nói nhé!');
    }
  }, [current, cursor, group, hadWrongThisTurn, onEvent, play, advanceNext, stopMic]);

  // Luồng mỗi câu: đọc câu mẫu → đếm 3-2-1 → thử tự mở mic
  useEffect(() => {
    if (!current) return undefined;
    let cancelled = false;
    clearAllTimers();
    stopMic();
    setPhase('model');
    setCountdown(3);
    setTranscript('');
    setScoreInfo(null);
    setRetries(0);
    setHadWrongThisTurn(false);
    setPetTone('neutral');
    setPetText('Nghe kỹ câu mẫu trước nhé…');

    onEvent?.('item_shown', {
      itemId: `f04-${cursor}`,
      wordIds: current.wordIds || [],
      skill: 'speak',
    });

    const runSequence = async () => {
      if (!muted) {
        await speakWord(current.en, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
      }
      if (cancelled) return;

      if (!SpeechRecognitionAPI) {
        setPhase('nomic');
        setPetText('Trình duyệt không có mic tự chấm. Con nghe rồi nhắc lại theo mẫu nhé!');
        return;
      }

      setPhase('countdown');
      setPetText('Chuẩn bị đọc to nào…');
      for (const n of [3, 2, 1]) {
        if (cancelled) return;
        setCountdown(n);
        await new Promise((r) => {
          const tid = setTimeout(r, 620);
          timersRef.current.push(tid);
        });
      }
      if (cancelled) return;
      startMicRecognition(false);
    };

    runSequence();
    return () => {
      cancelled = true;
      clearAllTimers();
      stopMic();
      stopSpeaking();
    };
  }, [cursor, current?.en]);

  const handleManualSaid = () => {
    const isBeginner = group === 'beginner';
    const evalRes = evaluateSpeakAttempt({ group, score: 100, micUsed: isBeginner });
    play?.('correct');
    onEvent?.('item_correct', {
      itemId: `f04-${cursor}`,
      wordIds: current?.wordIds || [],
      word: current?.en,
      meaning: current?.vi,
      skill: 'speak',
      // Q3: Khi từ chối / không có mic → KHÔNG ghi skillsHit.speak
      skipSkillHit: !evalRes.recordSkillHit,
    });
    advanceNext(!hadWrongThisTurn);
  };

  const handleRetrySpeak = () => {
    if (retries + 1 >= MAX_RETRIES) {
      advanceNext(false);
      return;
    }
    setRetries((r) => r + 1);
    startMicRecognition(true);
  };

  if (!current) return null;

  const matchedSet = new Set((scoreInfo?.matched || []).map((w) => w.toLowerCase()));

  return (
    <FriendlyFrame
      skill="speak"
      title={screenTitle}
      code="F-04"
      counter={`${cursor + 1}/${sentences.length}`}
      petText={petText}
      petTone={petTone}
    >
      {/* Dòng suối & các tảng đá vượt chướng ngại */}
      <div className="ff-f04-stream" aria-label={`Tiến độ vượt suối ${cursor + 1} trên ${sentences.length}`}>
        {sentences.map((_, idx) => {
          const isHere = idx === cursor;
          const isPassed = idx < cursor;
          return (
            <div key={idx} className={`ff-f04-stone${isPassed ? ' is-passed' : ''}${isHere ? ' is-here' : ''}`}>
              {isHere ? (
                <img src={petImg} alt="Pet" className="ff-f04-pet" />
              ) : isPassed ? '✓' : idx + 1}
            </div>
          );
        })}
      </div>

      {/* Thẻ câu mẫu */}
      <div className="ff-card text-center">
        <div className="d-flex justify-content-center gap-2 mb-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill py-0 px-2"
            style={{ minHeight: 32, fontSize: '0.78rem' }}
            onClick={() => speakWord(current.en, { rate: defaultRate, lang: 'en-US' }).catch(() => {})}
          >
            <Icon name="sound" size={14} /> Nghe mẫu
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2"
            style={{ minHeight: 32, fontSize: '0.78rem' }}
            onClick={() => speakWord(current.en, { rate: 0.55, lang: 'en-US' }).catch(() => {})}
          >
            🐢 Chậm
          </button>
        </div>

        <div className="fw-bold" style={{ fontSize: '1.18rem', color: '#4A3420', lineHeight: 1.3 }}>
          {current.en.split(/\s+/).map((tok, i) => {
            const clean = tok.toLowerCase().replace(/[^a-z0-9']/g, '');
            const hit = matchedSet.has(clean);
            return (
              <span key={i} style={{ color: hit ? '#16A34A' : undefined, marginRight: 5 }}>
                {tok}
              </span>
            );
          })}
        </div>
        <div className="small text-muted mt-1">{current.vi}</div>
      </div>

      {/* Trạng thái Mic (chỉ hiện nút Mic khi trình duyệt chặn tự mở mic) */}
      <div className="ff-card text-center py-2">
        {phase === 'model' && (
          <div className="small fw-bold text-primary">🔊 Đang đọc câu mẫu…</div>
        )}

        {phase === 'countdown' && (
          <div className="d-flex flex-column align-items-center">
            <span className="ff-f04-countdown">{countdown}</span>
            <small className="text-muted">Chuẩn bị tự mở micro…</small>
          </div>
        )}

        {phase === 'listening' && (
          <div className="d-flex flex-column align-items-center gap-2">
            <span className="badge rounded-pill text-bg-danger px-3 py-2">🎤 Đang lắng nghe…</span>
            {transcript && <div className="small fst-italic text-muted">“{transcript}”</div>}
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-sm btn-cowdi-primary rounded-pill px-3"
                onClick={finishMicNow}
              >
                ⏹ Xong — chấm điểm
              </button>
              {group === 'beginner' ? (
                <button type="button" className="btn btn-sm btn-success rounded-pill px-3" onClick={handleManualSaid}>
                  ✓ Con đã nói
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  onClick={() => { stopMic(); setPhase('nomic'); }}
                >
                  Không dùng mic
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'blocked' && (
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-cowdi-primary ff-tap-btn px-4 d-inline-flex align-items-center gap-2"
              onClick={() => startMicRecognition(true)}
            >
              <Icon name="speak" size={18} /> Chạm để bật Mic
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary ff-tap-btn px-3"
              onClick={() => { setPhase('nomic'); }}
            >
              Không dùng mic
            </button>
          </div>
        )}

        {phase === 'nomic' && (
          <div className="d-flex flex-column align-items-center gap-2">
            <div className="small text-muted">Chế độ <strong>Nghe và nhắc lại</strong> (không cần micro)</div>
            <button
              type="button"
              className="btn btn-cowdi-primary ff-tap-btn px-4"
              onClick={handleManualSaid}
            >
              ✓ Con đã nói
            </button>
          </div>
        )}

        {phase === 'result' && scoreInfo?.passed && (
          <div className="d-flex flex-column align-items-center gap-2">
            <div className="text-success fw-bold">🎉 Tuyệt vời! Pet đã nhảy qua tảng đá!</div>
            <button
              type="button"
              className="btn btn-sm btn-cowdi-primary rounded-pill px-3"
              onClick={() => advanceNext(!hadWrongThisTurn)}
            >
              {cursor + 1 < sentences.length ? 'Câu tiếp →' : 'Hoàn thành →'}
            </button>
          </div>
        )}
      </div>

      {/* Popup khi phát âm chưa đạt ngưỡng (cho phép thử lại tối đa 2 lần hoặc sang câu) */}
      <ScreenActionModal
        open={Boolean(phase === 'result' && scoreInfo && !scoreInfo.passed)}
        title="Thử đọc lại thêm lần nữa nhé!"
        tone="warning"
        primaryLabel={retries + 1 < MAX_RETRIES ? '🎤 Đọc lại' : 'Sang câu tiếp →'}
        onPrimary={handleRetrySpeak}
        tertiaryLabel={retries + 1 < MAX_RETRIES ? 'Bỏ qua câu này' : ''}
        onTertiary={retries + 1 < MAX_RETRIES ? () => advanceNext(false) : undefined}
      >
        <div>Điểm nhận diện: <strong>{scoreInfo?.score ?? 0}%</strong></div>
        {transcript && <div className="small text-muted mt-1">Máy nghe được: “{transcript}”</div>}
        <div className="small mt-1">Câu mẫu: <strong>{current.en}</strong></div>
      </ScreenActionModal>
    </FriendlyFrame>
  );
}
