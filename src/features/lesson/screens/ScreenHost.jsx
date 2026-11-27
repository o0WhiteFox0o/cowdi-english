import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/Icon';
import { EmojiText } from '../../../components/Emoji';
import { useUser } from '../../../hooks/useUser';
import { useSound } from '../../../hooks/useSound';
import { useToast } from '../../../components/layout/Toast';
import { usePetDirector } from '../../../pet-director/DirectorContext';
import PetStage from '../../../pet-director/PetStage';
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
  if (ratio >= 0.8) return '#27AE60'; // xanh
  if (ratio >= 0.5) return '#F2C94C'; // vàng
  return '#E67E22'; // cam
}

/**
 * ScreenHost — Khung chạy chuỗi 6 màn học (PHASE1 §5–6).
 * - Gọi mixLesson 1 lần khi vào bài, lưu sessionStorage theo lessonId để reload không xáo lại.
 * - Layout 100dvh grid (auto 1fr auto), không cuộn cấp trang ở 360×640 & 800×1280.
 * - Hỗ trợ prop `sandbox` cho Admin Đợt 2 xem trước/chơi thử không ghi dữ liệu.
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
  const { play, muted } = useSound();
  const showToast = useToast();
  const { dispatch } = usePetDirector();

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

  const exitDialogRef = useRef(null);

  // Khi đổi bài hoặc đổi seedOverride (sandbox), khởi tạo lại phiên
  useEffect(() => {
    setSession(initSession());
    setPhase('intro');
    setPaused(false);
    setSummaryData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, seedOverride, sandbox]);

  // Lưu sessionStorage mỗi khi tiến màn
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
    routeEvent(type, payload);
    if (sandbox && typeof onSandboxEvent === 'function') {
      onSandboxEvent({ at: Date.now(), type, payload });
    }
  }, [routeEvent, sandbox, onSandboxEvent]);

  const screens = session.mix?.screens || [];
  const currentEntry = screens[session.currentIndex] || null;
  const currentMeta = currentEntry ? getScreen(currentEntry.code) : null;

  // Dispatch sự kiện screen_enter khi vào ScreenIntro của từng màn
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

  // Đồng bộ native <dialog> xác nhận thoát (showModal + Safari light-dismiss fallback)
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
      return;
    }

    // Hết màn cuối (Boss) → kết thúc bài học theo công thức Đợt 1 (không đổi Sữa)
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

  return (
    <div className={`ss-host${sandbox ? ' is-sandbox' : ''}`}>
      {phase !== 'summary' && (
        <RouteHeader
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

      <main className="ss-stage">
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
            }}
          />
        )}

        {phase === 'play' && paused && (
          <div className="ss-pause-box">
            <h3 className="fw-bold mb-2">⏸ Đang tạm dừng</h3>
            <p className="text-muted small mb-3">
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
        )}

        {phase === 'summary' && summaryData && (
          <div className="ss-summary ss-scroll-inner text-center">
            <div className="mb-2">
              <Icon name={summaryData.passed ? 'trophy' : 'muscle'} size={68} />
            </div>
            <h3 className="fw-bold mb-1">
              {summaryData.passed
                ? 'Hoàn thành bài học!'
                : `Chưa đạt — cần ≥${Math.round((rules?.lessonPassRate || 0.7) * 100)}%`}
            </h3>
            <div className="fs-2 fw-bold text-cowdi-primary mb-1">
              {summaryData.bossScore}/{summaryData.bossTotal}
            </div>
            <p className="text-muted small mb-2">
              <EmojiText>{summaryData.passed ? 'Xuất sắc! Cowdi rất tự hào! 🐮✨' : 'Ôn lại rồi chinh phục lại nhé! 🐮💪'}</EmojiText>
            </p>

            {/* Hàng vòng kỹ năng màu theo kết quả (PHASE1 §6) */}
            <div className="ss-summary-circles my-2" aria-label="Kết quả từng màn kỹ năng">
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
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>{meta.label}</small>
                  </div>
                );
              })}
            </div>

            {!sandbox && (
              <div className="d-flex justify-content-center gap-2 flex-wrap my-2">
                <span className="badge bg-primary fs-6 px-3 py-2">🥛 +{summaryData.milk} Sữa</span>
                {summaryData.gem > 0 && <span className="badge bg-info text-dark fs-6 px-3 py-2">💎 +{summaryData.gem} Gem</span>}
                {summaryData.stone > 0 && <span className="badge bg-success fs-6 px-3 py-2">💠 +{summaryData.stone} Đá</span>}
              </div>
            )}

            {summaryData.wrongAnswers?.length > 0 && (
              <div className="card text-start shadow-sm my-2">
                <div className="card-body py-2 px-3">
                  <h6 className="fw-bold text-danger small mb-2">Câu cần ôn ({summaryData.wrongAnswers.length})</h6>
                  <div className="d-flex flex-column gap-1">
                    {summaryData.wrongAnswers.map((w, wi) => (
                      <div key={wi} className="p-2 rounded bg-light small">
                        <div className="fw-bold">{w.question}</div>
                        <div className="text-danger">Bạn chọn: {w.picked}</div>
                        <div className="text-success fw-bold">Đáp án: {w.correct}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex gap-2 justify-content-center flex-wrap mt-3">
              {summaryData.passed && pathNext?.type === 'lesson' && pathNext.lessonId !== lesson?.id && !sandbox && (
                <button
                  type="button"
                  className="btn btn-cowdi-primary ss-tap-btn"
                  onClick={() => navigate(`/lessons/${pathNext.lessonId}`)}
                >
                  <Icon name="play" size={16} /> Bài tiếp theo
                </button>
              )}
              <button type="button" className="btn btn-warning ss-tap-btn" onClick={handleReplay}>
                <Icon name="refresh" size={16} /> Làm lại (xáo mới)
              </button>
              {hasGrammar && (
                <button type="button" className="btn btn-outline-secondary ss-tap-btn" onClick={() => setGrammarOpen(true)}>
                  <Icon name="book" size={16} /> Xem ngữ pháp
                </button>
              )}
              <button type="button" className="btn btn-outline-secondary ss-tap-btn" onClick={handleConfirmExit}>
                <Icon name="road" size={16} /> Về lộ trình
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Thanh Pet đồng hành gọn gàng ở chân ScreenHost (khi không ở T-08 vì T-08 có vùng pet riêng) */}
      <footer className="ss-footer">
        {phase === 'play' && currentEntry?.code !== 'T-08' && (
          <div className="ss-pet-dock">
            <PetStage screen="lesson" compact />
          </div>
        )}
      </footer>

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
