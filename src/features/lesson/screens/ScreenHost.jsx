import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_LESSONS } from '../../../data/lessons';
import { findPathForLesson } from '../../../data/path';
import { getUnitRegion, REGIONS } from '../../../../shared/regions';
import { HUMAN_CAST } from '../../../../shared/human-cast';
import { useUser } from '../../../hooks/useUser';
import { usePet } from '../../../hooks/usePet';
import { useSound } from '../../../hooks/useSound';
import { useToast } from '../../../components/layout/Toast';
import { usePetDirector } from '../../../pet-director/DirectorContext';
import PetStage from '../../../pet-director/PetStage';
import { speakWord } from '../../../utils/speech';
import { SCREEN_CONFIG } from '../../../data/config/screens';
import { hashString } from './seededRandom';
import { mixLesson } from './mixer';
import { getScreen } from './registry';
import { listenItems, speakItems, writeItems, bossItems } from './items';
import { useScreenEvents } from './screenEvents';
import { pickGuestWords } from './guestWords';
import { selectScreenIntro } from './introSelector';
import RouteHeader from './RouteHeader';
import StageIntro from './StageIntro';
import ScreenIntro from './ScreenIntro';
import StageSummary from './StageSummary';
import GrammarSheet from './GrammarSheet';
import './screens.css';

// Bộ nhớ đệm câu dẫn theo vùng (client-side ETag cache)
const INTRO_CACHE = new Map(); // region -> { etag, items }

async function fetchScreenIntrosForRegion(region) {
  const cached = INTRO_CACHE.get(region);
  const headers = {};
  if (cached?.etag) headers['If-None-Match'] = cached.etag;
  try {
    const res = await fetch(`/api/screen-intros?region=${encodeURIComponent(region)}`, { headers });
    if (res.status === 304 && cached) return cached.items;
    if (!res.ok) return cached?.items || [];
    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    const etag = res.headers.get('ETag') || null;
    INTRO_CACHE.set(region, { etag, items });
    return items;
  } catch {
    return cached?.items || [];
  }
}

function sessionKey(userId, lessonId) {
  return `cowdi_ss_session:${userId || 'anon'}:${lessonId}`;
}

function loadSession(userId, lessonId) {
  try {
    const raw = sessionStorage.getItem(sessionKey(userId, lessonId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.mix?.screens) && parsed.mix.screens.length > 0) {
      return parsed;
    }
  } catch { /* bỏ qua */ }
  return null;
}

function saveSession(userId, lessonId, state) {
  try {
    sessionStorage.setItem(sessionKey(userId, lessonId), JSON.stringify(state));
  } catch { /* bỏ qua */ }
}

function clearSession(userId, lessonId) {
  try {
    sessionStorage.removeItem(sessionKey(userId, lessonId));
  } catch { /* bỏ qua */ }
}

function buildItemsForSlot(slot, lesson) {
  switch (slot) {
    case 'listen': return listenItems(lesson);
    case 'speak':  return speakItems(lesson);
    case 'write':  return writeItems(lesson, 4);
    case 'boss':   return bossItems(lesson);
    default:       return [];
  }
}

/**
 * ScreenHost — Khung chạy 6 màn trộn tái sử dụng nguyên vẹn layout đồng hành Cowdi
 * (.pd-lesson-layout + PetStage + BookShell), bổ sung Đợt 3: Mở ải, 5 màn F, câu dẫn
 * không lặp 10 ải, khách quen, 4 chấm kỹ năng và Tổng kết mới.
 */
export default function ScreenHost({
  lesson,
  group = 'intermediate',
  rules,
  config = SCREEN_CONFIG,
  isTester = false,
  sandbox = false,
  seedOverride = null,
  onFinishLessonAttempt,
  pathNext,
  pathQuerySuffix = '',
  onSandboxEvent,
  onExitOverride,
}) {
  const navigate = useNavigate();
  const {
    userData,
    addXP,
    addSkillXP,
    recordWordEncounter,
    recordQuestionResult,
    recordWordSkillHit,
    recordLessonMix,
    recordRecentIntros,
  } = useUser();
  const { getActivePetWithDecay } = usePet();
  const { play, muted } = useSound();
  const showToast = useToast();
  const { dispatch } = usePetDirector();

  const activePet = getActivePetWithDecay();
  const petRef = useRef(null);
  const exitDialogRef = useRef(null);
  const defaultTtsRate = rules?.ttsRate || 0.85;

  const userId = userData?.userId || userData?.id || 'local';
  const attemptCount = (userData?.lessonMixLog || []).filter((x) => x.lessonId === lesson?.id).length;

  // Xác định vùng đất & lộ trình chứa bài hiện tại
  const lessonPathInfo = useMemo(() => (lesson?.id ? findPathForLesson(lesson.id) : null), [lesson?.id]);
  const region = useMemo(() => {
    const uid = lessonPathInfo?.unit?.id;
    return (uid && getUnitRegion(uid)) || 'BD';
  }, [lessonPathInfo]);

  const pathLessons = useMemo(() => {
    if (!lessonPathInfo?.path) return ALL_LESSONS;
    const idSet = new Set(
      (lessonPathInfo.path.units || []).flatMap((u) => u.lessons || [])
    );
    return ALL_LESSONS.filter((l) => idSet.has(l.id));
  }, [lessonPathInfo]);

  // Tải kho câu dẫn approved cho vùng hiện tại
  const [regionIntros, setRegionIntros] = useState(() => INTRO_CACHE.get(region)?.items || []);
  useEffect(() => {
    let active = true;
    fetchScreenIntrosForRegion(region).then((items) => {
      if (active) setRegionIntros(items);
    });
    return () => { active = false; };
  }, [region]);

  const initSession = () => {
    if (!sandbox) {
      const existing = loadSession(userId, lesson?.id);
      if (existing) return existing;
    }
    const seed = seedOverride != null
      ? seedOverride
      : hashString(`${userId}:${lesson?.id}:${attemptCount + 1}`);
    const mix = mixLesson({
      lesson,
      group,
      lastMix: sandbox ? {} : (userData?.lastMix || {}),
      config,
      isTester,
      seed,
    });
    const created = { seed, mix, currentIndex: 0, results: [] };
    if (!sandbox) saveSession(userId, lesson?.id, created);
    return created;
  };

  const [session, setSession] = useState(initSession);
  const [phase, setPhase] = useState(() => (session.currentIndex > 0 ? 'intro' : 'stage_intro'));
  const [paused, setPaused] = useState(false);
  const [grammarOpen, setGrammarOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [introPetLine, setIntroPetLine] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [skillGains, setSkillGains] = useState({ listen: 0, read: 0, write: 0, speak: 0 });
  const usedIntroIdsRef = useRef([]);

  useEffect(() => {
    const fresh = initSession();
    setSession(fresh);
    setPhase(fresh.currentIndex > 0 ? 'intro' : 'stage_intro');
    setPaused(false);
    setSummaryData(null);
    setStreakCount(0);
    setSkillGains({ listen: 0, read: 0, write: 0, speak: 0 });
    usedIntroIdsRef.current = [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, seedOverride, sandbox]);

  useEffect(() => {
    if (!sandbox && phase !== 'summary') {
      saveSession(userId, lesson?.id, session);
    }
  }, [sandbox, phase, userId, lesson?.id, session]);

  const handleSkillGain = useCallback((skill, amt = 1) => {
    setSkillGains((prev) => ({ ...prev, [skill]: (prev[skill] || 0) + amt }));
  }, []);

  const { handleEvent: routeEvent, resetRun } = useScreenEvents({
    lessonId: lesson?.id,
    rules,
    sandbox,
    recordWordEncounter,
    recordQuestionResult,
    recordWordSkillHit,
    addSkillXP,
    onSkillGain: handleSkillGain,
  });

  const handleEvent = useCallback((type, payload) => {
    if (type === 'item_correct') setStreakCount((c) => c + 1);
    else if (type === 'item_wrong') setStreakCount(0);
    routeEvent(type, payload);
    if (sandbox && typeof onSandboxEvent === 'function') {
      onSandboxEvent({ at: Date.now(), type, payload });
    }
  }, [routeEvent, sandbox, onSandboxEvent]);

  const screens = session.mix?.screens || [];
  const currentEntry = screens[session.currentIndex] || null;
  const currentMeta = currentEntry ? getScreen(currentEntry.code) : null;

  // Biến nội suy cho câu dẫn ({npc}, {region}, {word1}, {word2})
  const introVars = useMemo(() => {
    const npcId = lesson?.story?.npc || REGIONS[region]?.humanHost || 'ong_tu';
    const npcName = HUMAN_CAST[npcId]?.nameVi || REGIONS[region]?.nameVi || 'ông Tư';
    const vocab = lesson?.vocabulary || [];
    return {
      npc: npcName,
      region: REGIONS[region]?.nameVi || 'Bến Đò Ông Tư',
      word1: vocab[0]?.word || '',
      word2: vocab[1]?.word || '',
    };
  }, [lesson?.story?.npc, lesson?.vocabulary, region]);

  // Câu dẫn Mở ải (OPEN) khi bài chưa có story.introVi
  const openIntro = useMemo(() => {
    return selectScreenIntro({
      intros: regionIntros,
      screenCode: 'OPEN',
      region,
      recentIntros: userData?.recentIntros || [],
      vars: introVars,
      seed: session.seed + 7,
    });
  }, [regionIntros, region, userData?.recentIntros, introVars, session.seed]);

  // Chọn câu dẫn cho từng màn hiện tại (ưu tiên kho approved không lặp 10 ải → fallback Director)
  useEffect(() => {
    if (phase !== 'intro' || !currentEntry) return;
    const picked = selectScreenIntro({
      intros: regionIntros,
      screenCode: currentEntry.code,
      region,
      recentIntros: userData?.recentIntros || [],
      vars: introVars,
      seed: session.seed + session.currentIndex * 31,
    });

    if (picked?.text) {
      setIntroPetLine(picked.text);
      if (picked.id && !usedIntroIdsRef.current.includes(picked.id)) {
        usedIntroIdsRef.current.push(picked.id);
      }
      return;
    }

    const dec = dispatch('screen_enter', {
      screen: 'lesson',
      slot: currentEntry.slot,
      code: currentEntry.code,
      lessonId: lesson?.id,
      lessonTitle: lesson?.title,
    });
    setIntroPetLine(dec?.speech?.vi || '');
  }, [phase, currentEntry, regionIntros, region, userData?.recentIntros, introVars, session.seed, session.currentIndex, dispatch, lesson?.id, lesson?.title]);

  // Khách quen (Q8, §5) — chốt cho ải hiện tại
  const guestWords = useMemo(() => {
    if (sandbox) return [];
    return pickGuestWords({
      currentLesson: lesson,
      allLessons: pathLessons,
      completedLessons: userData?.completedLessons || [],
      wordProgress: userData?.wordProgress || {},
      rules,
      screenItemCount: 8,
      maxGuests: 3,
    });
  }, [sandbox, lesson, pathLessons, userData?.completedLessons, userData?.wordProgress, rules]);

  useEffect(() => {
    const dlg = exitDialogRef.current;
    if (!dlg) return;
    if (exitOpen && !dlg.open) dlg.showModal();
    else if (!exitOpen && dlg.open) dlg.close();
  }, [exitOpen]);

  useEffect(() => {
    const dlg = exitDialogRef.current;
    if (!dlg) return undefined;
    const onNativeClose = () => {
      dlg.returnValue = '';
      setExitOpen(false);
    };
    dlg.addEventListener('close', onNativeClose);
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e) => {
        const r = dlg.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const onDown = (e) => { pressedOutside = isOutside(e); };
      const onUp = (e) => { if (pressedOutside && isOutside(e)) dlg.close(); };
      dlg.addEventListener('pointerdown', onDown);
      dlg.addEventListener('pointerup', onUp);
      return () => {
        dlg.removeEventListener('close', onNativeClose);
        dlg.removeEventListener('pointerdown', onDown);
        dlg.removeEventListener('pointerup', onUp);
      };
    }
    return () => dlg.removeEventListener('close', onNativeClose);
  }, []);

  const currentItems = useMemo(() => {
    if (!currentEntry) return [];
    return buildItemsForSlot(currentEntry.slot, lesson);
  }, [currentEntry, lesson]);

  const handleStartFromStageIntro = useCallback(() => {
    // 1 chạm vận hành mở khoá audio cho toàn ải (P10)
    play?.('click');
    if (openIntro?.id && !lesson?.story?.introVi && !usedIntroIdsRef.current.includes(openIntro.id)) {
      usedIntroIdsRef.current.push(openIntro.id);
    }
    setPhase('intro');
  }, [play, openIntro?.id, lesson?.story?.introVi]);

  const handleScreenDone = useCallback((result) => {
    const normalized = {
      code: result?.code || currentEntry?.code,
      slot: result?.slot || currentEntry?.slot,
      total: Number(result?.total) || 0,
      firstTryCorrect: Number(result?.firstTryCorrect) || 0,
      guestTotal: Number(result?.guestTotal) || 0,
      guestCorrect: Number(result?.guestCorrect) || 0,
      audioOff: Boolean(result?.audioOff),
      durationMs: Number(result?.durationMs) || 0,
    };
    handleEvent('screen_done', normalized);

    const nextResults = [...(session.results || []), normalized];
    const nextIdx = session.currentIndex + 1;

    if (nextIdx < screens.length) {
      setSession((prev) => ({
        ...prev,
        currentIndex: nextIdx,
        results: nextResults,
      }));
      setPhase('intro');
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const bossScore = Number(result?.score ?? normalized.firstTryCorrect) || 0;
    const bossTotal = Number(normalized.total) || 0;
    let attemptOutcome = {
      passed: bossTotal === 0 ? true : (bossScore / bossTotal) >= (rules?.lessonPassRate ?? 0.7),
      milk: 0,
      gem: 0,
      stone: 0,
      stars: 0,
      accuracy: bossTotal > 0 ? bossScore / bossTotal : 1,
      bossPerfect: bossTotal > 0 && bossScore === bossTotal,
    };

    if (!sandbox && typeof onFinishLessonAttempt === 'function') {
      attemptOutcome = onFinishLessonAttempt({
        finalScore: bossScore,
        total: bossTotal,
        results: nextResults,
      }) || attemptOutcome;
    }

    const attemptAt = new Date().toISOString();
    const logEntry = {
      lessonId: lesson?.id,
      at: attemptAt,
      seed: session.seed,
      order: session.mix?.order || screens.map((s) => s.slot),
      screens: screens.map((s) => s.code),
      skipped: session.mix?.skipped || [],
      results: nextResults,
      passed: Boolean(attemptOutcome.passed),
      stars: Number(attemptOutcome.stars) || 0,
    };
    const nextLastMix = {};
    for (const s of screens) nextLastMix[s.slot] = s.code;

    if (!sandbox) {
      if (typeof recordLessonMix === 'function') {
        recordLessonMix(logEntry, nextLastMix);
      }
      if (typeof recordRecentIntros === 'function' && usedIntroIdsRef.current.length > 0) {
        recordRecentIntros(usedIntroIdsRef.current, attemptAt);
      }
      clearSession(userId, lesson?.id);
    }

    setSummaryData({
      bossScore,
      bossTotal,
      passed: Boolean(attemptOutcome.passed),
      stars: Number(attemptOutcome.stars) || 0,
      accuracy: attemptOutcome.accuracy ?? 0,
      bossPerfect: Boolean(attemptOutcome.bossPerfect),
      milk: attemptOutcome.milk ?? attemptOutcome.xp ?? 0,
      gem: attemptOutcome.gem ?? 0,
      stone: attemptOutcome.stone ?? 0,
      wrongAnswers: result?.wrongAnswers || [],
      results: nextResults,
    });
    setPhase('summary');
  }, [
    currentEntry,
    handleEvent,
    session,
    screens,
    rules?.lessonPassRate,
    sandbox,
    onFinishLessonAttempt,
    lesson?.id,
    recordLessonMix,
    recordRecentIntros,
    userId,
  ]);

  const handleReplay = () => {
    resetRun();
    setStreakCount(0);
    setSkillGains({ listen: 0, read: 0, write: 0, speak: 0 });
    usedIntroIdsRef.current = [];
    if (!sandbox) clearSession(userId, lesson?.id);
    const nextSeed = hashString(`${userId}:${lesson?.id}:${attemptCount + 2}:${Date.now()}`);
    const mix = mixLesson({
      lesson,
      group,
      lastMix: sandbox ? {} : (userData?.lastMix || {}),
      config,
      isTester,
      seed: nextSeed,
    });
    const fresh = { seed: nextSeed, mix, currentIndex: 0, results: [] };
    if (!sandbox) saveSession(userId, lesson?.id, fresh);
    setSession(fresh);
    setSummaryData(null);
    setPhase('stage_intro');
  };

  const handleConfirmExit = () => {
    setExitOpen(false);
    if (typeof onExitOverride === 'function') {
      onExitOverride();
    } else {
      navigate(`/learning-path${pathQuerySuffix}`);
    }
  };

  const ActiveComponent = currentMeta?.Component || null;
  const hasGrammar = (lesson?.grammar || []).length > 0;
  const showGrammarBtn = phase === 'play' && currentEntry?.slot === 'write' && hasGrammar;
  const isFriendlyScreen = Boolean(currentEntry?.code?.startsWith('F-'));

  const isCenteredLayout =
    phase !== 'play' ||
    isFriendlyScreen ||
    ['T-02', 'T-05', 'T-06', 'T-07', 'T-08'].includes(currentEntry?.code);
  const isFlashcardLayout = phase === 'play' && currentEntry?.code === 'T-02';

  const stageHint = phase === 'summary'
    ? 'Xong bài học rồi!'
    : phase === 'stage_intro'
      ? `Sẵn sàng vượt ải tại ${REGIONS[region]?.nameVi || 'Bến Đò Ông Tư'}!`
      : phase === 'intro'
        ? `Chuẩn bị: ${currentMeta?.name || ''}`
        : currentEntry?.code === 'T-06'
          ? 'Nghe → Nhấn mic → Nói → Xem điểm!'
          : currentEntry?.code === 'T-05'
            ? 'Nghe kỹ và chọn nghĩa đúng nha!'
            : currentEntry?.code === 'T-02'
              ? 'Nghe rồi chạm để lật!'
              : currentEntry?.code === 'T-08'
                ? 'Xếp hoặc gõ câu đúng nhé!'
                : '';

  const petDock = activePet ? (
    <PetStage
      pet={activePet}
      petRef={petRef}
      mode={phase === 'summary' ? 'home' : (phase === 'play' && currentEntry?.code === 'F-06' ? 'battle' : 'lesson')}
      compact={phase === 'play' && (currentEntry?.code === 'T-07' || isFriendlyScreen)}
      streak={streakCount}
      subtitle={stageHint}
      onSpeak={(en) => speakWord(en, { rate: defaultTtsRate, lang: 'en-US' }).catch(() => {})}
    />
  ) : null;

  return (
    <div className={`fade-in position-relative ss-host-flow${sandbox ? ' is-sandbox' : ''}`}>
      {phase !== 'summary' && phase !== 'stage_intro' && (
        <RouteHeader
          lesson={lesson}
          screens={screens}
          currentIndex={session.currentIndex}
          currentScreenMeta={currentMeta}
          paused={paused}
          onRequestExit={() => setExitOpen(true)}
          onTogglePause={() => setPaused((p) => !p)}
          showGrammarButton={showGrammarBtn}
          onOpenGrammar={() => setGrammarOpen(true)}
        />
      )}

      <div
        className={`pd-lesson-layout${isCenteredLayout ? ' pd-lesson-layout--centered' : ''}${isFlashcardLayout ? ' pd-lesson-layout--flashcard' : ''}`}
      >
        {petDock && (
          <aside className="pd-lesson-stage-col">
            {petDock}
          </aside>
        )}

        <div className="pd-lesson-content-col">
          {phase === 'stage_intro' && (
            <StageIntro
              lesson={lesson}
              region={region}
              screens={screens}
              passRate={rules?.lessonPassRate ?? 0.7}
              openIntroText={openIntro?.text || ''}
              onStart={handleStartFromStageIntro}
            />
          )}

          {phase === 'intro' && currentEntry && (
            <ScreenIntro
              screen={currentEntry}
              screenMeta={currentMeta}
              index={session.currentIndex}
              total={screens.length}
              group={group}
              petLine={introPetLine}
              onFinish={() => setPhase('play')}
            />
          )}

          {phase === 'play' && ActiveComponent && !paused && (
            <ActiveComponent
              key={`${currentEntry.code}-${session.currentIndex}-${session.seed}`}
              lesson={lesson}
              group={group}
              items={currentItems}
              rules={rules}
              seed={session.seed}
              muted={muted}
              play={play}
              sandbox={sandbox}
              onEvent={handleEvent}
              onDone={handleScreenDone}
              onOpenGrammar={() => setGrammarOpen(true)}
              extra={{
                wordProgress: userData?.wordProgress || {},
                guestWords,
                region,
                addXP,
                showToast,
                petRef,
              }}
            />
          )}

          {phase === 'play' && paused && (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <h3 className="fw-bold mb-2">⏸ Đang tạm dừng</h3>
                <p className="text-muted mb-3">
                  Màn {session.currentIndex + 1}/{screens.length}: {currentMeta?.name}
                </p>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <button type="button" className="btn btn-cowdi-primary ss-tap-btn" onClick={() => setPaused(false)}>
                    ▶ Tiếp tục học
                  </button>
                  <button type="button" className="btn btn-outline-secondary ss-tap-btn" onClick={() => setExitOpen(true)}>
                    Thoát ra lộ trình
                  </button>
                </div>
              </div>
            </div>
          )}

          {phase === 'summary' && summaryData && (
            <StageSummary
              lesson={lesson}
              group={group}
              rules={rules}
              screens={screens}
              summaryData={summaryData}
              wordProgress={userData?.wordProgress || {}}
              skillGains={skillGains}
              sandbox={sandbox}
              hasGrammar={hasGrammar}
              pathNext={pathNext}
              play={play}
              onNextLesson={() => pathNext?.lessonId && navigate(`/lessons/${pathNext.lessonId}`)}
              onReplay={handleReplay}
              onOpenGrammar={() => setGrammarOpen(true)}
              onExit={handleConfirmExit}
            />
          )}
        </div>
      </div>

      {/* Bottom sheet Xem ngữ pháp (thay T-03) */}
      <GrammarSheet open={grammarOpen} onClose={() => setGrammarOpen(false)} lesson={lesson} />

      {/* Hộp xác nhận thoát trong app (native <dialog>, không dùng window.confirm) */}
      <dialog
        ref={exitDialogRef}
        className="ss-exit-dialog"
        closedby="any"
        aria-labelledby="ss-exit-title"
      >
        <h1 id="ss-exit-title" className="h5 fw-bold mb-2">Thoát bài học?</h1>
        <p className="text-muted small mb-3">
          Tiến độ màn hiện tại được lưu tạm — bạn quay lại sẽ tiếp tục đúng màn này nhé.
        </p>
        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-outline-danger ss-tap-btn"
            onClick={handleConfirmExit}
          >
            Thoát
          </button>
          <button
            type="button"
            className="btn btn-cowdi-primary ss-tap-btn"
            onClick={() => exitDialogRef.current?.close()}
            autoFocus
          >
            Tiếp tục học
          </button>
        </div>
      </dialog>
    </div>
  );
}
