import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/Icon';
import { EmojiText } from '../../../components/Emoji';
import { useUser } from '../../../hooks/useUser';
import { usePet } from '../../../hooks/usePet';
import { useSound } from '../../../hooks/useSound';
import { useToast } from '../../../components/layout/Toast';
import { usePetDirector } from '../../../pet-director/DirectorContext';
import PetStage from '../../../pet-director/PetStage';
import { speakWord } from '../../../utils/speech';
import { SCREEN_CONFIG, SLOT_META } from '../../../data/config/screens';
import { hashString } from './seededRandom';
import { mixLesson } from './mixer';
import { getScreen } from './registry';
import { listenItems, speakItems, writeItems, bossItems } from './items';
import { useScreenEvents } from './screenEvents';
import RouteHeader from './RouteHeader';
import ScreenIntro from './ScreenIntro';
import GrammarSheet from './GrammarSheet';
import './screens.css';

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

function resultCircleColor(res) {
  if (!res || !res.total) return '#27AE60';
  const ratio = res.firstTryCorrect / res.total;
  if (ratio >= 0.8) return '#27AE60';
  if (ratio >= 0.5) return '#F2C94C';
  return '#E67E22';
}

/**
 * ScreenHost — Khung chạy 6 màn trộn tái sử dụng nguyên vẹn layout đồng hành Cowdi (.pd-lesson-layout + PetStage + BookShell).
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
    recordLessonMix,
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
  const [phase, setPhase] = useState('intro'); // 'intro' | 'play' | 'summary'
  const [paused, setPaused] = useState(false);
  const [grammarOpen, setGrammarOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [introPetLine, setIntroPetLine] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    setSession(initSession());
    setPhase('intro');
    setPaused(false);
    setSummaryData(null);
    setStreakCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, seedOverride, sandbox]);

  useEffect(() => {
    if (!sandbox && phase !== 'summary') {
      saveSession(userId, lesson?.id, session);
    }
  }, [sandbox, phase, userId, lesson?.id, session]);

  const { handleEvent: routeEvent, resetRun } = useScreenEvents({
    lessonId: lesson?.id,
    rules,
    sandbox,
    recordWordEncounter,
    recordQuestionResult,
    addSkillXP,
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

  useEffect(() => {
    if (phase !== 'intro' || !currentEntry) return;
    const dec = dispatch('screen_enter', {
      screen: 'lesson',
      slot: currentEntry.slot,
      code: currentEntry.code,
      lessonId: lesson?.id,
      lessonTitle: lesson?.title,
    });
    setIntroPetLine(dec?.speech?.vi || '');
  }, [phase, currentEntry, dispatch, lesson?.id, lesson?.title]);

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

  const handleScreenDone = useCallback((result) => {
    const normalized = {
      code: result?.code || currentEntry?.code,
      slot: result?.slot || currentEntry?.slot,
      total: Number(result?.total) || 0,
      firstTryCorrect: Number(result?.firstTryCorrect) || 0,
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
    };

    if (!sandbox && typeof onFinishLessonAttempt === 'function') {
      attemptOutcome = onFinishLessonAttempt({
        finalScore: bossScore,
        total: bossTotal,
      }) || attemptOutcome;
    }

    const logEntry = {
      lessonId: lesson?.id,
      at: new Date().toISOString(),
      seed: session.seed,
      order: session.mix?.order || screens.map((s) => s.slot),
      screens: screens.map((s) => s.code),
      skipped: session.mix?.skipped || [],
      results: nextResults,
      passed: Boolean(attemptOutcome.passed),
    };
    const nextLastMix = {};
    for (const s of screens) nextLastMix[s.slot] = s.code;

    if (!sandbox) {
      if (typeof recordLessonMix === 'function') {
        recordLessonMix(logEntry, nextLastMix);
      }
      clearSession(userId, lesson?.id);
    }

    setSummaryData({
      bossScore,
      bossTotal,
      passed: Boolean(attemptOutcome.passed),
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
    userId,
  ]);

  const handleReplay = () => {
    resetRun();
    setStreakCount(0);
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
    setPhase('intro');
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

  // Giữ nguyên layout đồng hành V2 như LessonDetailPage cũ
  const isCenteredLayout =
    phase !== 'play' ||
    ['T-02', 'T-05', 'T-06', 'T-07', 'T-08'].includes(currentEntry?.code);
  const isFlashcardLayout = phase === 'play' && currentEntry?.code === 'T-02';

  const stageHint = phase === 'summary'
    ? 'Xong bài học rồi!'
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
      mode={phase === 'summary' ? 'home' : 'lesson'}
      compact={phase === 'play' && currentEntry?.code === 'T-07'}
      streak={streakCount}
      subtitle={stageHint}
      onSpeak={(en) => speakWord(en, { rate: defaultTtsRate, lang: 'en-US' }).catch(() => {})}
    />
  ) : null;

  return (
    <div className={`fade-in position-relative ss-host-flow${sandbox ? ' is-sandbox' : ''}`}>
      {phase !== 'summary' && (
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
            <div className="text-center py-3 fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
              <div className={`quiz-result-icon emoji-big ${summaryData.passed ? 'bounce-in' : ''}`} style={{ fontSize: '4.5rem' }}>
                <Icon name={summaryData.passed ? 'trophy' : 'muscle'} size={88} />
              </div>
              <h2 className="fw-bold mt-2">
                {summaryData.passed
                  ? 'Hoàn thành bài học!'
                  : `Chưa đạt — cần ≥${Math.round((rules?.lessonPassRate || 0.7) * 100)}%`}
              </h2>
              <div className="display-4 fw-bold text-cowdi-primary my-2">
                {summaryData.bossScore}/{summaryData.bossTotal}
              </div>
              <p className="lead text-muted">
                <EmojiText>{summaryData.passed ? 'Xuất sắc! Cowdi rất tự hào! 🐮✨' : 'Ôn lại rồi chinh phục lại nhé! 🐮💪'}</EmojiText>
              </p>

              {/* Hàng vòng kỹ năng màu theo kết quả (PHASE1 §6) */}
              <div className="ss-summary-circles my-3" aria-label="Kết quả từng màn kỹ năng">
                {screens.map((sc, i) => {
                  const res = summaryData.results[i];
                  const meta = SLOT_META[sc.slot] || SLOT_META.intro;
                  const bg = resultCircleColor(res);
                  return (
                    <div key={`${sc.slot}-${i}`} className="ss-summary-circle-item">
                      <div
                        className="ss-summary-circle"
                        style={{ background: bg }}
                        title={`${meta.label} (${sc.code}): ${res?.firstTryCorrect ?? 0}/${res?.total ?? 0}`}
                      >
                        <Icon name={meta.icon} size={15} />
                      </div>
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>{meta.label}</small>
                    </div>
                  );
                })}
              </div>

              {!sandbox && (
                <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap my-3">
                  <span className="badge bg-primary fs-6 px-3 py-2">🥛 +{summaryData.milk} Sữa</span>
                  {summaryData.gem > 0 && <span className="badge bg-info text-dark fs-6 px-3 py-2">💎 +{summaryData.gem} Gem</span>}
                  {summaryData.stone > 0 && <span className="badge bg-success fs-6 px-3 py-2">💠 +{summaryData.stone} Đá nguyên tố</span>}
                </div>
              )}

              {summaryData.wrongAnswers?.length > 0 && (
                <div className="card text-start shadow-sm my-3">
                  <div className="card-body">
                    <h6 className="fw-bold text-danger mb-2">Các câu cần ôn lại ({summaryData.wrongAnswers.length})</h6>
                    <div className="d-flex flex-column gap-2">
                      {summaryData.wrongAnswers.map((w, wi) => (
                        <div key={wi} className="p-2 rounded bg-light small">
                          <div className="fw-bold">{w.question}</div>
                          <div className="text-danger">Bạn chọn: {w.picked}</div>
                          <div className="text-success fw-bold">Đáp án đúng: {w.correct}</div>
                          {w.explanation && <div className="text-muted mt-1">{w.explanation}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="d-flex gap-2 justify-content-center mt-4 flex-wrap">
                {summaryData.passed && pathNext?.type === 'lesson' && pathNext.lessonId !== lesson?.id && !sandbox && (
                  <button
                    type="button"
                    className="btn btn-cowdi-primary d-inline-flex align-items-center gap-2"
                    onClick={() => navigate(`/lessons/${pathNext.lessonId}`)}
                  >
                    <Icon name="play" size={18} /> Bài tiếp theo
                  </button>
                )}
                <button type="button" className="btn btn-warning d-inline-flex align-items-center gap-2" onClick={handleReplay}>
                  <Icon name="refresh" size={16} /> Làm lại (xáo mới)
                </button>
                {hasGrammar && (
                  <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={() => setGrammarOpen(true)}>
                    <Icon name="book" size={16} /> Xem ngữ pháp
                  </button>
                )}
                <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={handleConfirmExit}>
                  <Icon name="road" size={16} /> Lộ trình
                </button>
              </div>
            </div>
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
