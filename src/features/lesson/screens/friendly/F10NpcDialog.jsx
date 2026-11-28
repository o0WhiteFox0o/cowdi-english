import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../../components/Icon';
import { SpeechRecognitionAPI, speakWord, stopSpeaking } from '../../../../utils/speech';
import { HUMAN_CAST } from '../../../../../shared/human-cast';
import { getScreenTitle } from '../../../../../shared/screen-scenarios';
import { getHumanNpcImage } from '../../story/petImage';
import { evaluateDialogReply } from './f10Logic';
import FriendlyFrame from './FriendlyFrame';
import ScreenActionModal from '../ScreenActionModal';

const MAX_PROMPTS = 3;

/**
 * F-10 Hội thoại phản xạ / Trò chuyện với Ông Tư (slot 'speak' — PHASE4 §2 F-10, Q3, Q5).
 * - Đọc câu hỏi NPC → thử tự mở mic; CHỈ hiện nút bật Mic khi trình duyệt chặn.
 * - Chấm tất định (KHÔNG AI): đủ keywords hoặc trùng ≥ 60% từ với 1 câu gợi ý.
 * - Mới học: không chấm. Không có mic: chạm chọn câu trả lời → KHÔNG ghi skillsHit.speak (Q3).
 */
export default function F10NpcDialog({
  lesson,
  group = 'intermediate',
  rules,
  muted = false,
  play,
  onEvent,
  onDone,
  extra = {},
}) {
  const startTimeRef = useRef(Date.now());
  const defaultRate = rules?.ttsRate || 0.85;
  const region = extra.region || 'BD';
  const screenTitle = getScreenTitle('F-10', region, 'Hội thoại phản xạ');

  const prompts = useMemo(
    () => (Array.isArray(lesson?.dialogPrompts) ? lesson.dialogPrompts.slice(0, MAX_PROMPTS) : []),
    [lesson?.dialogPrompts],
  );

  const [cursor, setCursor] = useState(0);
  // phase: 'asking' | 'listening' | 'blocked' | 'nomic' | 'replied'
  const [phase, setPhase] = useState('asking');
  const [transcript, setTranscript] = useState('');
  const [retries, setRetries] = useState(0);
  const [hadWrong, setHadWrong] = useState(false);
  const [missModal, setMissModal] = useState(false);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [petText, setPetText] = useState('Nghe câu hỏi rồi nói theo một trong hai gợi ý bên dưới nhé!');
  const [petTone, setPetTone] = useState('neutral');

  const recognitionRef = useRef(null);
  const timersRef = useRef([]);
  const current = prompts[cursor] || null;
  const npcId = current?.npc || 'ong_tu';
  const npcInfo = HUMAN_CAST[npcId] || HUMAN_CAST.ong_tu;
  const npcImg = getHumanNpcImage(npcId);
  const [npcImgFailed, setNpcImgFailed] = useState(false);

  useEffect(() => {
    setNpcImgFailed(false);
  }, [npcId]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) clearTimeout(id);
    timersRef.current = [];
  }, []);

  const stopMic = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    onEvent?.('mic_end', {});
  }, [onEvent]);

  const advanceNext = useCallback((wasFirstTry) => {
    clearTimers();
    stopMic();
    stopSpeaking();
    const nextFirst = firstTryCount + (wasFirstTry ? 1 : 0);
    setFirstTryCount(nextFirst);
    if (cursor + 1 < prompts.length) {
      setCursor((c) => c + 1);
    } else {
      onDone?.({
        code: 'F-10',
        slot: 'speak',
        total: prompts.length,
        firstTryCorrect: nextFirst,
        durationMs: Date.now() - startTimeRef.current,
      });
    }
  }, [clearTimers, stopMic, firstTryCount, cursor, prompts.length, onDone]);

  const triggerNpcReply = useCallback((recordSkillHit, wasFirstTry) => {
    setPhase('replied');
    play?.('correct');
    setPetTone('good');
    setPetText(`${npcInfo.nameVi}: “${current?.replyEn}” (${current?.replyVi})`);
    onEvent?.('item_correct', {
      itemId: current?.id || `f10-${cursor}`,
      wordIds: [],
      word: current?.answers?.[0]?.en || '',
      meaning: current?.answers?.[0]?.vi || '',
      skill: 'speak',
      skipSkillHit: !recordSkillHit,
    });
    if (!muted && current?.replyEn) {
      speakWord(current.replyEn, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
    }
    const tid = setTimeout(() => advanceNext(wasFirstTry), 1700);
    timersRef.current.push(tid);
  }, [play, npcInfo.nameVi, current, cursor, onEvent, muted, defaultRate, advanceNext]);

  const startMic = useCallback((isManualTap = false) => {
    if (!current) return;
    if (!SpeechRecognitionAPI) {
      setPhase('nomic');
      setPetText('Không có mic tự nhận diện — chạm chọn 1 câu trả lời bên dưới nhé!');
      return;
    }
    stopSpeaking();
    setTranscript('');
    try {
      const rec = new SpeechRecognitionAPI();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = false;
      recognitionRef.current = rec;
      setPhase('listening');
      setPetText('🎤 Đang nghe con trả lời…');
      onEvent?.('mic_start', { itemId: current.id });

      rec.onresult = (event) => {
        const last = event.results[event.results.length - 1];
        const spoken = last?.[0]?.transcript || '';
        setTranscript(spoken);
        if (last?.isFinal) {
          onEvent?.('mic_end', {});
          const evalRes = evaluateDialogReply({ spoken, prompt: current, group, micUsed: true });
          if (evalRes.passed) {
            triggerNpcReply(evalRes.recordSkillHit, !hadWrong);
          } else {
            play?.('wrong');
            setHadWrong(true);
            setPetTone('hint');
            setPetText(`Gợi ý: thử đọc “${current.answers?.[0]?.en}” nhé!`);
            onEvent?.('item_wrong', {
              itemId: current.id,
              correct: current.answers?.[0]?.en || '',
              skill: 'speak',
            });
            setMissModal(true);
          }
        }
      };

      rec.onerror = (event) => {
        onEvent?.('mic_end', {});
        const code = event?.error || '';
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          if (!isManualTap) {
            setPhase('blocked');
            setPetText('Trình duyệt cần con chạm nút Micro để bật mic nhé!');
          } else {
            setPhase('nomic');
            setPetText('Chuyển sang chế độ chạm chọn câu trả lời nhé!');
          }
        } else if (code === 'no-speech') {
          setPhase('blocked');
          setPetText('Chưa nghe rõ giọng con. Chạm nút Micro để trả lời lại nhé!');
        } else {
          setPhase('nomic');
          setPetText('Mic tạm bận — con chạm chọn 1 câu trả lời bên dưới nha!');
        }
      };

      rec.start();
    } catch {
      onEvent?.('mic_end', {});
      setPhase('blocked');
      setPetText('Chạm nút Micro bên dưới để trả lời nhé!');
    }
  }, [current, group, hadWrong, onEvent, play, triggerNpcReply]);

  useEffect(() => {
    if (!current) return undefined;
    let cancelled = false;
    clearTimers();
    stopMic();
    setPhase('asking');
    setTranscript('');
    setRetries(0);
    setHadWrong(false);
    setMissModal(false);
    setPetTone('neutral');
    setPetText(`Nghe ${npcInfo.nameVi} hỏi rồi trả lời nhé!`);

    onEvent?.('item_shown', { itemId: current.id, skill: 'speak' });

    const runAsk = async () => {
      if (!muted) {
        await speakWord(current.askEn, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
      }
      if (cancelled) return;
      if (!SpeechRecognitionAPI) {
        setPhase('nomic');
        setPetText('Chạm chọn câu trả lời phù hợp bên dưới nhé!');
        return;
      }
      startMic(false);
    };

    runAsk();
    return () => {
      cancelled = true;
      clearTimers();
      stopMic();
      stopSpeaking();
    };
  }, [cursor, current?.id]);

  const handleTapAnswer = (ans) => {
    if (!current || phase === 'replied') return;
    // Q3: Khi chạm chọn ở chế độ không mic → KHÔNG ghi skillsHit.speak; nhóm Mới học vẫn ghi nếu đang học
    const evalRes = evaluateDialogReply({
      spoken: ans.en,
      prompt: current,
      group,
      micUsed: false,
    });
    triggerNpcReply(evalRes.recordSkillHit, !hadWrong);
  };

  if (!current) return null;

  const canTapReply = phase === 'nomic' || group === 'beginner';

  return (
    <FriendlyFrame
      skill="speak"
      title={screenTitle}
      code="F-10"
      counter={`Lượt ${cursor + 1}/${prompts.length}`}
      petText={petText}
      petTone={petTone}
    >
      {/* Bóng thoại câu hỏi của NPC */}
      <div className="ff-card py-2">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="fw-bold small d-inline-flex align-items-center gap-2" style={{ color: '#9A6324' }}>
            {npcImg && !npcImgFailed ? (
              <img
                src={npcImg}
                alt={npcInfo.nameVi}
                width={30}
                height={30}
                onError={() => setNpcImgFailed(true)}
                style={{ objectFit: 'contain', borderRadius: '50%', flexShrink: 0 }}
              />
            ) : (
              <span>{npcId === 'ong_tu' ? '🚣' : npcId === 'tom' ? '👨‍🏫' : '🙂'}</span>
            )}
            <span>{npcInfo.nameVi} hỏi:</span>
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill py-0 px-2"
            style={{ fontSize: '0.74rem', minHeight: 28 }}
            onClick={() => speakWord(current.askEn, { rate: defaultRate, lang: 'en-US' }).catch(() => {})}
          >
            <Icon name="sound" size={14} /> Nghe lại
          </button>
        </div>
        <div className="fw-bold" style={{ fontSize: '1.08rem', color: '#4A3420', lineHeight: 1.3 }}>
          “{current.askEn}”
        </div>
        <div className="small text-muted">{current.askVi}</div>
      </div>

      {/* 2 câu trả lời gợi ý */}
      <div className="d-flex flex-column gap-2">
        {(current.answers || []).slice(0, 2).map((ans, idx) => (
          <button
            key={idx}
            type="button"
            className={`ff-f10-answer${canTapReply ? ' is-clickable' : ''}`}
            onClick={() => {
              if (canTapReply) handleTapAnswer(ans);
              else speakWord(ans.en, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
            }}
          >
            <div className="fw-bold" style={{ fontSize: '0.94rem', color: '#2E7D32' }}>
              {canTapReply ? '👆 ' : '💬 '}{ans.en}
            </div>
            <div className="small text-muted">{ans.vi}</div>
          </button>
        ))}
      </div>

      {/* Thanh trạng thái mic (chỉ hiện nút Mic khi bị chặn) */}
      <div className="ff-card text-center py-2">
        {phase === 'asking' && <span className="small text-primary fw-bold">🔊 Đang đọc câu hỏi…</span>}
        {phase === 'listening' && (
          <div className="d-flex flex-column align-items-center gap-1">
            <span className="badge rounded-pill text-bg-danger px-3 py-2">🎤 Đang nghe con trả lời…</span>
            {transcript && <div className="small fst-italic text-muted">“{transcript}”</div>}
          </div>
        )}
        {phase === 'blocked' && (
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-cowdi-primary ff-tap-btn px-3 d-inline-flex align-items-center gap-1"
              onClick={() => startMic(true)}
            >
              <Icon name="speak" size={16} /> Chạm để bật Mic
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary ff-tap-btn px-3"
              onClick={() => setPhase('nomic')}
            >
              Chạm chọn câu
            </button>
          </div>
        )}
        {phase === 'nomic' && (
          <div className="small text-muted">Chế độ không micro: chạm vào 1 câu gợi ý ở trên để trả lời nhé!</div>
        )}
        {phase === 'replied' && (
          <div className="text-success fw-bold small">
            ✨ {npcInfo.nameVi}: “{current.replyEn}”
          </div>
        )}
      </div>

      <ScreenActionModal
        open={missModal}
        title="Thử nói lại thêm một lần nhé!"
        tone="warning"
        primaryLabel={retries < 1 ? '🎤 Nói lại' : 'Sang lượt tiếp →'}
        onPrimary={() => {
          setMissModal(false);
          if (retries < 1) {
            setRetries((r) => r + 1);
            startMic(true);
          } else {
            advanceNext(false);
          }
        }}
        tertiaryLabel={retries < 1 ? 'Bỏ qua lượt này' : ''}
        onTertiary={retries < 1 ? () => { setMissModal(false); advanceNext(false); } : undefined}
      >
        <div>Gợi ý câu trả lời: <strong>“{current.answers?.[0]?.en}”</strong></div>
        {transcript && <div className="small text-muted mt-1">Máy nghe được: “{transcript}”</div>}
      </ScreenActionModal>
    </FriendlyFrame>
  );
}
