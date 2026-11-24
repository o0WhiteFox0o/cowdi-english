import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PET_REGISTRY } from '../../data/pets';
import { CLIPS } from '../../../shared/pet-motion.js';
import { getClipLabelVi } from '../../../shared/pet-motion-labels.js';
import { PetAvatar } from '../../pet-rig/PetAvatar';
import { PET_MOTION_API_BASE } from './api';

const PET_LIST = Object.values(PET_REGISTRY);
const ALL_CLIP_NAMES = Object.keys(CLIPS);

const BOND_MILESTONES = [
  { value: 0, label: '0 · Mới quen' },
  { value: 60, label: '60 · Vẫy chào' },
  { value: 200, label: '200 · Mừng quay lại' },
  { value: 500, label: '500 · Đạo cụ kỹ năng' },
  { value: 1200, label: '1200 · Tri kỷ (nhảy)' },
];

const TOP_SKILLS = [
  { id: 'listening', icon: '🎧', label: 'Nghe (listening)', clip: 'prop_listening' },
  { id: 'speaking', icon: '🎤', label: 'Nói (speaking)', clip: 'prop_speaking' },
  { id: 'reading', icon: '📖', label: 'Đọc (reading)', clip: 'prop_reading' },
  { id: 'writing', icon: '✏️', label: 'Viết (writing)', clip: 'prop_writing' },
];

const BATTLE_BUTTONS = [
  { event: 'battle_start', clip: 'battle_ready', label: 'Vào trận', icon: '🔥' },
  { event: 'battle_attack', clip: 'attack', label: 'Tấn công', icon: '💥' },
  { event: 'battle_crit', clip: 'crit', label: 'Chí mạng', icon: '⚡' },
  { event: 'battle_dodge', clip: 'dodge', label: 'Né đòn', icon: '💨' },
  { event: 'battle_hit', clip: 'hit', label: 'Trúng đòn', icon: '💢' },
  { event: 'battle_win', clip: 'win', label: 'Chiến thắng', icon: '🏆' },
  { event: 'battle_lose', clip: 'lose_proud', label: 'Thua tự hào', icon: '❤️‍🔥' },
];

const SAMPLE_QUIZ = [
  {
    word: 'apple',
    phonetic: '/ˈæp.əl/',
    sample: 'I eat a fresh apple every morning.',
    choices: ['Quả táo', 'Quả nho', 'Bánh mì', 'Cái bàn'],
    answer: 0,
  },
  {
    word: 'library',
    phonetic: '/ˈlaɪ.brər.i/',
    sample: 'We read English books at the library.',
    choices: ['Bệnh viện', 'Thư viện', 'Sân bay', 'Nhà bếp'],
    answer: 1,
  },
  {
    word: 'brave',
    phonetic: '/breɪv/',
    sample: 'My little pet is very brave.',
    choices: ['Buồn ngủ', 'Chậm chạp', 'Dũng cảm', 'Mặn mà'],
    answer: 2,
  },
  {
    word: 'journey',
    phonetic: '/ˈdʒɜː.ni/',
    sample: 'Learning English is a joyful journey.',
    choices: ['Hành trình', 'Cơn mưa', 'Chiếc chìa khoá', 'Bữa tối'],
    answer: 0,
  },
  {
    word: 'whisper',
    phonetic: '/ˈwɪs.pər/',
    sample: 'She spoke in a gentle whisper.',
    choices: ['Hét lớn', 'Thì thầm', 'Nhảy múa', 'Vẽ tranh'],
    answer: 1,
  },
  {
    word: 'curious',
    phonetic: '/ˈkjʊə.ri.əs/',
    sample: 'Curious learners ask great questions.',
    choices: ['Chán nản', 'Lo lắng', 'Giận dữ', 'Tò mò'],
    answer: 3,
  },
  {
    word: 'harvest',
    phonetic: '/ˈhɑː.vɪst/',
    sample: 'Farmers celebrate the autumn harvest.',
    choices: ['Mùa thu hoạch', 'Cây cầu', 'Ánh trăng', 'Lá thư'],
    answer: 0,
  },
  {
    word: 'horizon',
    phonetic: '/həˈraɪ.zən/',
    sample: 'The sun rises above the horizon.',
    choices: ['Đáy biển', 'Đỉnh núi', 'Chân trời', 'Khu rừng'],
    answer: 2,
  },
];

function fmtTimeSec(date = new Date()) {
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function buildDraftStageClips(detail) {
  const out = {};
  for (const name of ALL_CLIP_NAMES) {
    const ov = detail?.clips?.override?.[name]?.draft;
    const sh = detail?.clips?.shared?.[name]?.draft;
    const base = CLIPS[name];
    const resolved = ov || sh || base;
    if (resolved) out[name] = resolved;
  }
  return out;
}

/**
 * Tab "Xem trước khi học" (chỉ quản trị viên, chỉ đọc — không ghi gì lên server).
 * Dùng chung runtime PetRig (qua <PetAvatar>) với app người học để kiểm thử đúng những gì học sinh sẽ thấy.
 */
export default function StudyPreviewTab({
  api,
  initialPetId,
  initialStage,
  onBackToOverview,
  onOpenEditor,
  onSyncParams,
}) {
  const [petId, setPetId] = useState(() =>
    initialPetId && PET_REGISTRY[initialPetId] ? initialPetId : 'bamboo_spirit'
  );
  const [stage, setStage] = useState(() => {
    const s = Number(initialStage);
    return s >= 1 && s <= 5 ? s : 1;
  });
  // 'learner' = GET /api/pet-motion/:petId (chỉ bản đã duyệt + quy tắc fallback mục 4)
  // 'draft'   = dữ liệu bản nháp đang chỉnh trên server (chỉ đọc)
  const [source, setSource] = useState('learner');
  const [mode, setMode] = useState('home'); // 'home' | 'lesson' | 'battle'
  const [bond, setBond] = useState(250);
  const [topSkill, setTopSkill] = useState('reading');
  const [fastForward, setFastForward] = useState(false);

  const [motion, setMotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadNonce, setReloadNonce] = useState(0);

  const [activeClip, setActiveClip] = useState(null);
  const [logs, setLogs] = useState([]);

  // Quiz state (8 câu mẫu)
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizPicked, setQuizPicked] = useState(null); // { idx, ok }
  const [quizFinished, setQuizFinished] = useState(false);

  // Giữ để nói & Pet đọc mẫu
  const [micHolding, setMicHolding] = useState(false);
  const [micLevelUi, setMicLevelUi] = useState(0);
  const [speakingSample, setSpeakingSample] = useState(false);

  const petRef = useRef(null);
  const blobUrlsRef = useRef([]);
  const logIdRef = useRef(1);
  const micRafRef = useRef(0);
  const voiceTimerRef = useRef(null);
  const evolveSyncRef = useRef(null);
  const nextQuestionTimerRef = useRef(null);

  const petObj = PET_REGISTRY[petId] || PET_LIST[0];
  const stageEvo = petObj?.evolutions?.[stage - 1] || petObj?.evolutions?.[0];

  const revokeDraftBlobs = useCallback(() => {
    for (const url of blobUrlsRef.current) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // bỏ qua
      }
    }
    blobUrlsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      revokeDraftBlobs();
      cancelAnimationFrame(micRafRef.current);
      clearInterval(voiceTimerRef.current);
      clearTimeout(evolveSyncRef.current);
      clearTimeout(nextQuestionTimerRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // bỏ qua
        }
      }
    };
  }, [revokeDraftBlobs]);

  // Đồng bộ ?view=preview&pet=...&stage=... lên URL (không làm mất context khi reload)
  useEffect(() => {
    onSyncParams?.(petId, stage);
  }, [petId, stage, onSyncParams]);

  // Tải dữ liệu chỉ-đọc theo nguồn đã chọn (Bản người học thấy / Bản nháp)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    setMotion(null);

    async function fetchData() {
      revokeDraftBlobs();

      if (source === 'learner') {
        const data = await api.getLearnerMotion(petId);
        if (!cancelled) {
          setMotion(data || {});
        }
        return;
      }

      // Nguồn "Bản nháp": chỉ đọc chi tiết 5 cấp để nút Tiến hoá cũng chuyển cấp mượt mà
      const details = await Promise.all(
        [1, 2, 3, 4, 5].map((s) => api.getDetail(petId, s).catch(() => null))
      );
      if (cancelled) return;

      const built = {};
      const createdUrls = [];

      await Promise.all(
        details.map(async (detail, idx) => {
          const s = idx + 1;
          const draftRig = detail?.rig?.draftRig;
          if (!detail?.rig?.hasRig || !draftRig || !Array.isArray(draftRig.slots) || !draftRig.slots.length) {
            return;
          }
          const images = {};
          const draftImageUrls = detail.rig.draftImageUrls || {};
          await Promise.all(
            Object.entries(draftImageUrls).map(async ([part, url]) => {
              if (!url) return;
              try {
                const { objectUrl } = await api.loadImage(url, { authenticated: true });
                if (objectUrl) {
                  createdUrls.push(objectUrl);
                  images[part] = objectUrl;
                }
              } catch {
                // bỏ qua ảnh lỗi để rig vẫn hiển thị phần còn lại
              }
            })
          );
          built[`c${s}`] = {
            rig: draftRig,
            images,
            clips: buildDraftStageClips(detail),
          };
        })
      );

      if (cancelled) {
        for (const u of createdUrls) {
          try {
            URL.revokeObjectURL(u);
          } catch {
            // bỏ qua
          }
        }
        return;
      }

      blobUrlsRef.current = createdUrls;
      setMotion(built);
    }

    fetchData()
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.message || 'Không tải được dữ liệu động tác của pet.');
          setMotion({});
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api, petId, source, reloadNonce, revokeDraftBlobs]);

  // Theo dõi clip thực tế đang phát trên PetRig
  useEffect(() => {
    const id = setInterval(() => {
      const cur = petRef.current?.getCurrentClip?.() ?? null;
      setActiveClip((prev) => (prev === cur ? prev : cur));
    }, 200);
    return () => clearInterval(id);
  }, []);

  const handleDiagnostic = useCallback((diag) => {
    if (!diag) return;
    setActiveClip(diag.currentClip ?? null);
    setLogs((prev) => {
      const entry = {
        id: logIdRef.current++,
        time: fmtTimeSec(),
        event: diag.event || 'event',
        requested: diag.requested || null,
        played: diag.played || null,
        fallback: Boolean(diag.fallback),
        skipped: Boolean(diag.skipped),
        reason: diag.reason || null,
        note: diag.note || '',
        currentClip: diag.currentClip ?? null,
      };
      return [entry, ...prev].slice(0, 100);
    });
  }, []);

  const emitEvent = useCallback((eventName, data = {}) => {
    petRef.current?.emit(eventName, data);
  }, []);

  // Đổi chế độ Ở nhà / Bài học / Trận đấu
  const handleSwitchMode = (nextMode) => {
    stopVoiceSample();
    stopMicHold();
    setMode(nextMode);
    if (nextMode === 'lesson') {
      resetQuiz(true);
    } else if (nextMode === 'battle') {
      setTimeout(() => emitEvent('battle_start'), 0);
    }
  };

  // Quiz 8 câu mẫu
  const resetQuiz = (emitStart = true) => {
    clearTimeout(nextQuestionTimerRef.current);
    setQuizIdx(0);
    setQuizStreak(0);
    setQuizCorrect(0);
    setQuizPicked(null);
    setQuizFinished(false);
    if (emitStart) {
      setTimeout(() => {
        emitEvent('lesson_start');
        emitEvent('question_shown');
      }, 0);
    }
  };

  const handlePickChoice = (choiceIdx) => {
    if (quizFinished || quizPicked) return;
    const q = SAMPLE_QUIZ[quizIdx];
    const ok = choiceIdx === q.answer;
    setQuizPicked({ idx: choiceIdx, ok });

    if (ok) {
      const nextStreak = quizStreak + 1;
      setQuizStreak(nextStreak);
      setQuizCorrect((c) => c + 1);
      if (nextStreak === 3 || nextStreak === 5 || nextStreak === 10) {
        emitEvent('streak', { count: nextStreak });
      } else {
        emitEvent('answer_correct');
      }
    } else {
      setQuizStreak(0);
      emitEvent('answer_wrong');
    }

    clearTimeout(nextQuestionTimerRef.current);
    nextQuestionTimerRef.current = setTimeout(() => {
      if (quizIdx + 1 >= SAMPLE_QUIZ.length) {
        setQuizFinished(true);
        setQuizPicked(null);
        emitEvent('lesson_done', { text: 'Hoàn thành bài học!' });
      } else {
        setQuizIdx((i) => i + 1);
        setQuizPicked(null);
        emitEvent('question_shown');
      }
    }, 1050);
  };

  // Giữ để nói -> mic_start + giả lập setMicLevel -> mic_end
  const stopMicHold = useCallback(() => {
    cancelAnimationFrame(micRafRef.current);
    micRafRef.current = 0;
    setMicHolding((wasHolding) => {
      if (wasHolding) {
        petRef.current?.setMicLevel(0);
        petRef.current?.emit('mic_end');
      }
      return false;
    });
    setMicLevelUi(0);
  }, []);

  const startMicHold = () => {
    if (micHolding) return;
    stopVoiceSample();
    setMicHolding(true);
    emitEvent('mic_start');
    const t0 = performance.now();
    const tick = (now) => {
      const s = (now - t0) / 1000;
      const lv = Math.max(
        0.12,
        Math.min(0.95, 0.48 + 0.28 * Math.sin(s * 9.5) + 0.16 * Math.sin(s * 23.1))
      );
      petRef.current?.setMicLevel(lv);
      setMicLevelUi(lv);
      micRafRef.current = requestAnimationFrame(tick);
    };
    micRafRef.current = requestAnimationFrame(tick);
  };

  // Pet đọc mẫu -> pet_speak_start + setVoiceLevel + speechSynthesis -> pet_speak_end
  const stopVoiceSample = useCallback(() => {
    clearInterval(voiceTimerRef.current);
    voiceTimerRef.current = null;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // bỏ qua
      }
    }
    setSpeakingSample((wasSpeaking) => {
      if (wasSpeaking) {
        petRef.current?.setVoiceLevel(0);
        petRef.current?.emit('pet_speak_end');
      }
      return false;
    });
  }, []);

  const handlePetSpeakSample = () => {
    if (speakingSample) {
      stopVoiceSample();
      return;
    }
    stopMicHold();
    const q = SAMPLE_QUIZ[quizIdx] || SAMPLE_QUIZ[0];
    const spokenText = `${q.word}. ${q.sample}`;
    setSpeakingSample(true);
    emitEvent('pet_speak_start', { text: `${q.word} ${q.phonetic}`, ms: 3400 });

    const startedAt = performance.now();
    voiceTimerRef.current = setInterval(() => {
      const s = (performance.now() - startedAt) / 1000;
      const lv = Math.max(0.18, Math.min(0.92, 0.52 + 0.32 * Math.sin(s * 14)));
      petRef.current?.setVoiceLevel(lv);
    }, 60);

    const finish = () => {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
      petRef.current?.setVoiceLevel(0);
      setSpeakingSample((was) => {
        if (was) petRef.current?.emit('pet_speak_end');
        return false;
      });
    };

    if (typeof window !== 'undefined' && window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined') {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(spokenText);
        utter.lang = 'en-US';
        utter.rate = 0.92;
        utter.onend = finish;
        utter.onerror = finish;
        window.speechSynthesis.speak(utter);
        return;
      } catch {
        // rơi xuống timer dự phòng bên dưới
      }
    }
    setTimeout(finish, 2600);
  };

  // Nút Tiến hoá ở chế độ Ở nhà
  const handleEvolveDemo = () => {
    const nextStage = stage < 5 ? stage + 1 : 1;
    emitEvent('evolve_ok', { stage: nextStage });
    clearTimeout(evolveSyncRef.current);
    evolveSyncRef.current = setTimeout(() => {
      setStage(nextStage);
    }, 1500);
  };

  const stageData = motion?.[`c${stage}`] || null;
  const stageHasRig = Boolean(stageData?.rig && Array.isArray(stageData.rig.slots));
  const stageClipCount = stageData?.clips ? Object.keys(stageData.clips).length : 0;

  // Tổng hợp các clip bị bỏ qua vì chưa duyệt từ nhật ký để admin biết còn thiếu gì
  const missingClips = useMemo(() => {
    const set = new Set();
    for (const row of logs) {
      if ((row.skipped || row.fallback) && row.requested && row.reason !== 'unapproved_rig') {
        if (row.skipped || row.played !== row.requested) {
          set.add(row.requested);
        }
      }
    }
    return Array.from(set);
  }, [logs]);

  const currentQuestion = SAMPLE_QUIZ[quizIdx] || SAMPLE_QUIZ[0];

  return (
    <div className="pm-admin pm-preview fade-in">
      {/* Thanh công cụ trên cùng */}
      <div className="pm-toolbar">
        <div className="pm-row">
          <button type="button" className="pm-btn" onClick={onBackToOverview}>
            ← Tổng quan {PET_LIST.length} pet
          </button>
          <button
            type="button"
            className="pm-btn"
            onClick={() => onOpenEditor(petId, stage)}
          >
            ✎ Mở bàn chỉnh {petObj.name} C{stage}
          </button>

          <select
            className="pm-select"
            aria-label="Chọn pet xem trước"
            value={petId}
            onChange={(e) => {
              setPetId(e.target.value);
              setLogs([]);
            }}
          >
            {PET_LIST.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species})
              </option>
            ))}
          </select>

          <select
            className="pm-select"
            aria-label="Chọn cấp tiến hoá"
            value={stage}
            onChange={(e) => setStage(Number(e.target.value))}
          >
            {petObj.evolutions.map((ev, idx) => (
              <option key={idx} value={idx + 1}>
                C{idx + 1} · {ev.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pm-row">
          {/* Công tắc nguồn dữ liệu: Bản người học thấy vs Bản nháp */}
          <div className="pm-seg" role="group" aria-label="Nguồn dữ liệu động tác">
            <button
              type="button"
              className={source === 'learner' ? 'on' : ''}
              onClick={() => {
                setSource('learner');
                setLogs([]);
              }}
            >
              👁 Bản người học thấy
            </button>
            <button
              type="button"
              className={source === 'draft' ? 'on' : ''}
              onClick={() => {
                setSource('draft');
                setLogs([]);
              }}
            >
              📝 Bản nháp
            </button>
          </div>

          <button
            type="button"
            className="pm-btn"
            onClick={() => setReloadNonce((n) => n + 1)}
            disabled={loading}
            title="Tải lại dữ liệu mới nhất từ server (chỉ đọc)"
          >
            ↻ Tải lại
          </button>
        </div>
      </div>

      {/* Thanh trạng thái nguồn dữ liệu (chỉ đọc) */}
      <div className={`pm-preview-banner ${source === 'learner' ? 'is-learner' : 'is-draft'}`}>
        <div>
          <strong>
            {source === 'learner'
              ? 'Chế độ Bản người học thấy (GET /api/pet-motion/' + petId + ')'
              : 'Chế độ Bản nháp (dữ liệu đang chỉnh trên server)'}
          </strong>
          <span className="ms-2">
            · Chỉ đọc, không ghi dữ liệu lên server · Dùng chung <code>PetRig</code> với app người học.
          </span>
        </div>
        <div className="pm-row">
          {loading ? (
            <span className="pm-badge none">Đang tải…</span>
          ) : stageHasRig ? (
            <span className={`pm-badge ${source === 'learner' ? 'ok' : 'draft'}`}>
              {source === 'learner'
                ? `Rig đã duyệt · ${stageClipCount}/${ALL_CLIP_NAMES.length} clip đã duyệt`
                : `Rig nháp · ${stageClipCount}/${ALL_CLIP_NAMES.length} clip`}
            </span>
          ) : (
            <span className="pm-badge warn">
              {source === 'learner'
                ? `C${stage} chưa duyệt rig → người học thấy ảnh tĩnh`
                : `C${stage} chưa tạo rig`}
            </span>
          )}
        </div>
      </div>

      {loadError && <div className="alert alert-danger py-2 small">{loadError}</div>}

      {/* Khung chính 2 cột: Sân khấu PetRig (trái) + Điều khiển 3 chế độ & Nhật ký sự kiện (phải) */}
      <div className="pm-preview-grid">
        {/* Cột trái: Sân khấu PetAvatar thật + Gắn bó + Kỹ năng mạnh nhất */}
        <div className="pm-card pm-preview-stage-card">
          <div className="pm-preview-mode-tabs" role="tablist" aria-label="Chế độ xem trước">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'home'}
              className={`pm-btn ${mode === 'home' ? 'primary' : ''}`}
              onClick={() => handleSwitchMode('home')}
            >
              🏠 Ở nhà
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'lesson'}
              className={`pm-btn ${mode === 'lesson' ? 'primary' : ''}`}
              onClick={() => handleSwitchMode('lesson')}
            >
              📚 Bài học
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'battle'}
              className={`pm-btn ${mode === 'battle' ? 'primary' : ''}`}
              onClick={() => handleSwitchMode('battle')}
            >
              ⚔️ Trận đấu
            </button>
          </div>

          <div className={`pm-preview-stage mode-${mode}`}>
            {loading ? (
              <div className="spinner-border text-success" />
            ) : (
              <PetAvatar
                key={`${petId}:${source}:${reloadNonce}`}
                ref={petRef}
                petId={petId}
                stage={stage}
                group={petObj.group}
                bond={bond}
                topSkill={topSkill}
                mode={mode}
                motion={motion || {}}
                basePath={PET_MOTION_API_BASE}
                fallbackSrc={stageEvo?.image}
                timeScale={fastForward ? 10 : 1}
                onDiagnostic={handleDiagnostic}
                className="pm-preview-canvas"
              />
            )}

            <div className="pm-preview-hud-top">
              <span className="pm-preview-pill">
                {petObj.name} · C{stage}
              </span>
              <span className={`pm-preview-pill ${activeClip ? 'ok' : ''}`}>
                Clip: <strong>{activeClip || (stageHasRig ? 'tư thế nghỉ' : 'ảnh tĩnh')}</strong>
              </span>
              {fastForward && <span className="pm-preview-pill fast">⏩ ×10</span>}
            </div>

            {mode === 'home' && stageHasRig && (
              <div className="pm-preview-hint">
                Chạm đầu / chạm thân / kéo thả / chạm 6 lần liên tục (chóng mặt) trực tiếp trên pet
              </div>
            )}
          </div>

          {/* Mục 5: Thanh Gắn bó 0–1500 & Kỹ năng mạnh nhất */}
          <div className="pm-preview-bond-box">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label htmlFor="pm-bond-range" className="small fw-bold">
                💖 Gắn bó: <span className="text-success">{bond}</span> / 1500
              </label>
              <span className="small text-muted">
                {bond >= 1200
                  ? 'Tri kỷ (hào quang + dance)'
                  : bond >= 500
                  ? `Đạo cụ ${TOP_SKILLS.find((s) => s.id === topSkill)?.clip}`
                  : bond >= 200
                  ? 'Mừng quay lại (greet_return)'
                  : bond >= 60
                  ? 'Vẫy chào (wave)'
                  : 'Chưa mở cử chỉ gắn bó'}
              </span>
            </div>
            <input
              id="pm-bond-range"
              type="range"
              min={0}
              max={1500}
              step={10}
              value={bond}
              onChange={(e) => setBond(Number(e.target.value))}
              className="w-100"
            />
            <div className="pm-preview-milestones">
              {BOND_MILESTONES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`pm-chip-btn ${bond === m.value ? 'active' : ''}`}
                  onClick={() => setBond(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="mt-2 pt-2 border-top">
              <div className="small fw-bold mb-1">🎯 Kỹ năng mạnh nhất (mở từ mốc 500 gắn bó)</div>
              <div className="pm-preview-skills">
                {TOP_SKILLS.map((sk) => (
                  <button
                    key={sk.id}
                    type="button"
                    className={`pm-chip-btn ${topSkill === sk.id ? 'active' : ''}`}
                    onClick={() => setTopSkill(sk.id)}
                  >
                    {sk.icon} {sk.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Bảng điều khiển theo chế độ + Nhật ký sự kiện */}
        <div className="pm-preview-right">
          {/* Bảng điều khiển tương ứng 3 chế độ */}
          <div className="pm-card">
            {mode === 'home' && (
              <div>
                <h6 className="fw-bold mb-1">🏠 Chế độ Ở nhà</h6>
                <p className="small text-muted mb-2">
                  Tương tác trực tiếp trên pet bên trái (chạm đầu, chạm thân, kéo thả, chạm liên tục để chóng mặt)
                  hoặc bấm các sự kiện bên dưới:
                </p>

                <div className="pm-preview-actions">
                  <button
                    type="button"
                    className="pm-btn"
                    onClick={() => emitEvent('feed')}
                  >
                    🍎 Cho ăn (<code>feed</code>)
                  </button>
                  <button
                    type="button"
                    className="pm-btn"
                    onClick={() => emitEvent('app_open', { daysAway: 1 })}
                    title="Gắn bó ≥ 200 phát greet_return; ≥ 60 phát wave"
                  >
                    👋 Vắng 1 ngày rồi mở app
                  </button>
                  <button
                    type="button"
                    className="pm-btn"
                    onClick={() => emitEvent('app_open', { daysAway: 0 })}
                    title="Gắn bó ≥ 60 phát wave"
                  >
                    🌅 Mở app hôm nay
                  </button>
                  <button
                    type="button"
                    className="pm-btn primary"
                    onClick={handleEvolveDemo}
                  >
                    ✨ Tiến hoá (C{stage} → C{stage < 5 ? stage + 1 : 1})
                  </button>
                </div>

                <div className="pm-preview-fast-row mt-3 pt-2 border-top">
                  <label className="d-flex align-items-center gap-2 small fw-bold m-0" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={fastForward}
                      onChange={(e) => setFastForward(e.target.checked)}
                    />
                    ⏩ Tua nhanh ×10 (kiểm tra <code>sleepy</code> sau 6s &amp; <code>sleep</code> sau 12s rảnh)
                  </label>
                </div>
              </div>
            )}

            {mode === 'lesson' && (
              <div>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                  <h6 className="fw-bold m-0">
                    📚 Quiz mẫu 8 câu từ vựng
                  </h6>
                  <div className="d-flex align-items-center gap-2 small">
                    <span className="pm-badge ok">Đúng: {quizCorrect}/{SAMPLE_QUIZ.length}</span>
                    <span className="pm-badge draft">🔥 Chuỗi: {quizStreak}</span>
                    <button type="button" className="pm-btn pm-btn-sm" onClick={() => resetQuiz(true)}>
                      Làm lại
                    </button>
                  </div>
                </div>

                {quizFinished ? (
                  <div className="pm-quiz-done">
                    <div className="fw-bold mb-1">
                      🎉 Hoàn thành 8/8 câu ({quizCorrect} câu đúng) · Đã phát <code>lesson_done</code>
                    </div>
                    <button type="button" className="pm-btn primary pm-btn-sm" onClick={() => resetQuiz(true)}>
                      Học lại 8 câu
                    </button>
                  </div>
                ) : (
                  <div className="pm-quiz-box">
                    <div className="pm-quiz-head">
                      <span className="small text-muted fw-bold">
                        Câu {quizIdx + 1}/{SAMPLE_QUIZ.length}
                      </span>
                      <span className="pm-quiz-word">
                        {currentQuestion.word} <small>{currentQuestion.phonetic}</small>
                      </span>
                    </div>
                    <div className="pm-quiz-choices">
                      {currentQuestion.choices.map((ch, idx) => {
                        let cls = 'pm-quiz-choice';
                        if (quizPicked) {
                          if (idx === currentQuestion.answer) cls += ' is-correct';
                          else if (idx === quizPicked.idx && !quizPicked.ok) cls += ' is-wrong';
                        }
                        return (
                          <button
                            key={ch}
                            type="button"
                            className={cls}
                            disabled={Boolean(quizPicked)}
                            onClick={() => handlePickChoice(idx)}
                          >
                            {String.fromCharCode(65 + idx)}. {ch}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Giữ để nói & Pet đọc mẫu */}
                <div className="pm-preview-voice-row mt-3 pt-2 border-top">
                  <button
                    type="button"
                    className={`pm-btn ${micHolding ? 'primary' : ''}`}
                    onPointerDown={startMicHold}
                    onPointerUp={stopMicHold}
                    onPointerLeave={stopMicHold}
                    onPointerCancel={stopMicHold}
                  >
                    🎤 {micHolding ? 'Đang nghe… thả để dừng' : 'Giữ để nói (mic)'}
                  </button>

                  {micHolding && (
                    <div className="pm-mic-meter" aria-label="Mức âm lượng micro giả lập">
                      <div style={{ width: `${Math.round(micLevelUi * 100)}%` }} />
                    </div>
                  )}

                  <button
                    type="button"
                    className={`pm-btn ${speakingSample ? 'warn' : ''}`}
                    onClick={handlePetSpeakSample}
                  >
                    🔊 {speakingSample ? 'Dừng đọc mẫu' : 'Pet đọc mẫu'}
                  </button>
                </div>

                {/* Nút bắn nhanh sự kiện bài học (chuỗi 3-5-10, lên cấp, xong bài) */}
                <div className="pm-preview-quick-row mt-2 pt-2 border-top">
                  <span className="small text-muted fw-semibold">Thử nhanh sự kiện:</span>
                  <button type="button" className="pm-chip-btn" onClick={() => emitEvent('streak', { count: 3 })}>
                    Chuỗi 3
                  </button>
                  <button type="button" className="pm-chip-btn" onClick={() => emitEvent('streak', { count: 5 })}>
                    Chuỗi 5
                  </button>
                  <button type="button" className="pm-chip-btn" onClick={() => emitEvent('streak', { count: 10 })}>
                    Chuỗi 10
                  </button>
                  <button type="button" className="pm-chip-btn" onClick={() => emitEvent('skill_level_up')}>
                    Lên cấp kỹ năng
                  </button>
                  <button
                    type="button"
                    className="pm-chip-btn"
                    onClick={() => emitEvent('lesson_done', { text: 'Tuyệt vời!' })}
                  >
                    Xong bài
                  </button>
                  <label className="ms-auto d-inline-flex align-items-center gap-1 small fw-semibold" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={fastForward}
                      onChange={(e) => setFastForward(e.target.checked)}
                    />
                    ×10 (chờ <code>think</code> 0.8s)
                  </label>
                </div>
              </div>
            )}

            {mode === 'battle' && (
              <div>
                <h6 className="fw-bold mb-1">⚔️ Chế độ Trận đấu</h6>
                <p className="small text-muted mb-2">
                  Phát từng sự kiện Đấu trường để kiểm tra phản hồi chiến đấu của pet:
                </p>
                <div className="pm-preview-actions">
                  {BATTLE_BUTTONS.map((b) => (
                    <button
                      key={b.event}
                      type="button"
                      className="pm-btn"
                      onClick={() => emitEvent(b.event)}
                    >
                      {b.icon} {b.label} (<code>{b.event}</code>)
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mục 6: Nhật ký sự kiện */}
          <div className="pm-card pm-log-card">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
              <div>
                <h6 className="fw-bold m-0">📋 Nhật ký sự kiện ({logs.length})</h6>
                <div className="small text-muted">
                  Dòng <span className="text-danger fw-bold">đỏ</span> = clip bị bỏ qua vì chưa duyệt ·
                  Dòng <span style={{ color: '#9a5a08', fontWeight: 700 }}>cam</span> = lùi về clip nền.
                </div>
              </div>
              <button
                type="button"
                className="pm-btn pm-btn-sm"
                onClick={() => setLogs([])}
                disabled={logs.length === 0}
              >
                Xoá nhật ký
              </button>
            </div>

            {missingClips.length > 0 && (
              <div className="pm-missing-strip">
                <span className="small fw-bold text-danger">Thiếu chưa duyệt:</span>
                {missingClips.map((clipName) => (
                  <button
                    key={clipName}
                    type="button"
                    className="pm-missing-chip"
                    onClick={() => onOpenEditor(petId, stage, clipName)}
                    title={`Mở bàn chỉnh để sửa & duyệt "${clipName}"`}
                  >
                    {clipName} ↗
                  </button>
                ))}
              </div>
            )}

            <div className="pm-log-list" role="log" aria-live="polite">
              {logs.length === 0 ? (
                <div className="small text-muted text-center py-3">
                  Chưa có sự kiện nào. Hãy chạm vào pet, trả lời quiz hoặc bấm một nút sự kiện để kiểm tra.
                </div>
              ) : (
                logs.map((row) => {
                  const isMissing = row.skipped;
                  const isFallback = !isMissing && row.fallback;
                  const rowCls = isMissing
                    ? 'is-missing'
                    : isFallback
                    ? 'is-fallback'
                    : row.played
                    ? 'is-ok'
                    : 'is-info';

                  return (
                    <div key={row.id} className={`pm-log-row ${rowCls}`}>
                      <span className="pm-log-time">{row.time}</span>
                      <code className="pm-log-evt">{row.event}</code>
                      <span className="pm-log-arrow">→</span>
                      <span className="pm-log-detail">
                        {row.reason === 'unapproved_rig' ? (
                          <strong>Chưa duyệt rig C{stage} (đang hiện ảnh tĩnh)</strong>
                        ) : isMissing ? (
                          <>
                            <strong>{row.requested} chưa duyệt</strong>
                            <span className="pm-log-sub">
                              {' '}
                              (bỏ qua · giữ {row.currentClip || 'tư thế nghỉ'})
                            </span>
                          </>
                        ) : isFallback ? (
                          <>
                            <strong>{row.played}</strong>
                            <span className="pm-log-sub">
                              {' '}
                              ({row.requested} chưa duyệt → lùi về {row.played})
                            </span>
                          </>
                        ) : row.played ? (
                          <>
                            <strong>{row.played}</strong>
                            <span className="pm-log-sub"> · {getClipLabelVi(row.played)}</span>
                          </>
                        ) : (
                          <span className="pm-log-sub">{row.note || 'giữ nguyên'}</span>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
