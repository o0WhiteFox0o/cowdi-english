// ════════════════════════════════════════════════════════════════
// LearningPathPage — Trang Lộ trình học 3 nhóm (SDD-LEARNING-GROUPS §5.3 & §5.4)
// — Tích hợp GroupPicker (chọn/đổi nhóm), PlacementTest (/placement)
// — Hỗ trợ trạng thái node: done / current / open / placed / locked + comingSoon
// — Kiểm tra unit mới: buildCheckpointQuestions (H5), đồng hồ 45s (exam), modal thoát, giải thích
// — Huy hiệu Gem unit đúng luật L6 & ước tính Sữa theo công thức thật (H8)
// ════════════════════════════════════════════════════════════════
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSEO } from '../hooks/useSEO';
import { SEO_CONFIGS } from '../data/seo-config';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ALL_LESSONS, getGroup, getGroupOfPath } from '../data/lessons';
import {
  ALL_PATHS,
  getPathById,
  buildPathNodes,
  isAdvancedUnlocked,
  estimateLessonMilk,
} from '../data/path';
import { buildCheckpointQuestions } from '../utils/quiz-gen';
import { PET_REGISTRY, getEvolutionInfo } from '../data/pets';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { useToast } from '../components/layout/Toast';
import GroupPicker from '../features/onboarding/GroupPicker';
import PlacementTest from '../features/placement/PlacementTest';
import Icon from '../components/Icon';
import Emoji from '../components/Emoji';

const PATH_IDS = ALL_PATHS.map((p) => p.id);
const WIGGLE = [0, 44, 72, 44, 0, -44, -72, -44];
const UNIT_ICONS = ['blocks', 'chat', 'sprout', 'leaf', 'tree', 'clover', 'star', 'trophy', 'target', 'medal'];

export default function LearningPathPage() {
  useSEO(SEO_CONFIGS['/learning-path']);
  const navigate = useNavigate();
  const { userData, addXP, incrementQuizzes, saveCheckpointScore, setLearningGroup } = useUser();
  const { getActivePetWithDecay } = usePet();
  const showToast = useToast();

  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [skippedPlacement, setSkippedPlacement] = useState(false);

  // Checkpoint test state
  const [testUnit, setTestUnit] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testIdx, setTestIdx] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [testAnswered, setTestAnswered] = useState(null);
  const [testFinished, setTestFinished] = useState(false);
  const [testIsTestOut, setTestIsTestOut] = useState(false);
  const [testExitModal, setTestExitModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Path tab: ?tab=<pathId> (hỗ trợ cả ?tab=general cũ → activePath)
  const [searchParams, setSearchParams] = useSearchParams();
  const resolveTabFromUrl = useCallback(() => {
    const raw = searchParams.get('tab');
    if (raw && raw !== 'general' && PATH_IDS.includes(raw)) return raw;
    return userData.activePath && PATH_IDS.includes(userData.activePath)
      ? userData.activePath
      : 'intermediate';
  }, [searchParams, userData.activePath]);

  const [pathTab, setPathTab] = useState(resolveTabFromUrl);

  useEffect(() => {
    setPathTab(resolveTabFromUrl());
  }, [resolveTabFromUrl]);

  const changePath = (id) => {
    if (id === 'advanced' && !isAdvancedUnlocked(userData)) {
      showToast('🔒 Hoàn thành lộ trình Trung bình (Unit 10) hoặc vượt kiểm tra đầu vào để mở Nâng cao C1–C2!', 'warning');
      return;
    }
    setPathTab(id);
    const targetGroup = getGroupOfPath(id);
    if (targetGroup && userData.learnerGroup === targetGroup.id) {
      setLearningGroup(targetGroup.id, id);
    }
    setSearchParams({ tab: id }, { replace: true });
  };

  const lessonMap = useMemo(() => {
    const m = {};
    for (const l of ALL_LESSONS) m[l.id] = l;
    return m;
  }, []);

  const activePath = useMemo(() => getPathById(pathTab), [pathTab]);
  const pathGroup = useMemo(() => getGroupOfPath(activePath.id) || getGroup('intermediate'), [activePath.id]);
  const userGroup = useMemo(() => (userData.learnerGroup ? getGroup(userData.learnerGroup) : null), [userData.learnerGroup]);
  const isCrossGroup = Boolean(userGroup && userGroup.id !== pathGroup.id);

  // Bộ chọn lộ trình chỉ liệt kê các lộ trình thuộc nhóm hiện tại (hoặc nhóm của tab đang xem)
  const visibleGroup = userGroup || pathGroup;
  const visiblePaths = useMemo(
    () => ALL_PATHS.filter((p) => visibleGroup.paths.includes(p.id)),
    [visibleGroup]
  );

  const nodes = useMemo(
    () => buildPathNodes(activePath, userData),
    [activePath, userData.completedLessons, userData.checkpointScores, userData.placement]
  );
  const doneCount = nodes.filter((n) => n.status === 'done' || n.status === 'placed').length;
  const pct = nodes.length ? Math.round((doneCount / nodes.length) * 100) : 0;
  const currentNode = nodes.find((n) => n.status === 'current');

  // Mascot next to the current node
  const activePet = getActivePetWithDecay();
  const petSpecies = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const petEvo = activePet && petSpecies ? getEvolutionInfo(activePet.speciesId, activePet.evolution) : null;
  const petImg = petEvo?.image || '/assets/images/logo/MiniLogoCowdi.svg';

  const currentRef = useRef(null);
  useEffect(() => {
    if (!testUnit && currentRef.current && currentNode && currentNode.index > 3) {
      currentRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [pathTab, testUnit]);

  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window && text) {
      speechSynthesis.cancel();
      const clean = String(text || '')
        .replace(/\s*[\(\[\{][^()\[\]{}]*[\)\]\}]/g, '')
        .replace(/_+/g, ', ')
        .replace(/\//g, ', ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!clean) return;
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'en-US';
      u.rate = pathGroup?.rules?.ttsRate || 0.85;
      speechSynthesis.speak(u);
    }
  }, [pathGroup]);

  const cpRules = pathGroup.rules.checkpoint;
  const secPerQ = cpRules.secondsPerQuestion;

  // Start checkpoint test (dùng buildCheckpointQuestions mới — H5)
  function startCheckpoint(unit, isTestOut = false) {
    const qs = buildCheckpointQuestions(unit, cpRules.questionCount, ALL_LESSONS, pathGroup.id);
    if (qs.length === 0) {
      showToast('Unit này chưa đủ câu hỏi để tạo bài kiểm tra.', 'warning');
      return;
    }
    setTestUnit(unit);
    setTestQuestions(qs);
    setTestIdx(0);
    setTestScore(0);
    setTestAnswered(null);
    setTestFinished(false);
    setTestIsTestOut(isTestOut);
    setTestExitModal(false);
    setTimeLeft(secPerQ || null);
  }

  const advanceCheckpoint = useCallback((currentScore) => {
    if (testIdx + 1 < testQuestions.length) {
      setTestIdx((i) => i + 1);
      setTestAnswered(null);
      setTimeLeft(secPerQ || null);
    } else {
      const total = testQuestions.length;
      const ratio = total > 0 ? currentScore / total : 0;
      const passed = ratio >= cpRules.passRate;
      const prevCp = userData.checkpointScores?.[testUnit.id];
      const alreadyPassedReal = Boolean(prevCp?.passed && (prevCp.source ?? 'checkpoint') === 'checkpoint');

      saveCheckpointScore(testUnit.id, currentScore, total, {
        source: 'checkpoint',
        passRate: cpRules.passRate,
      });

      const base = currentScore * 10 + (passed && !alreadyPassedReal ? 80 : 0) + (ratio >= 1 ? 20 : 0);
      const xp = alreadyPassedReal ? Math.max(5, Math.round(base / 3)) : base;
      addXP(xp);
      incrementQuizzes(ratio >= 1);
      setTestFinished(true);
      const passPct = Math.round(cpRules.passRate * 100);
      showToast(
        passed ? `Vượt qua! +${xp} Sữa 🥛 🎉` : `Chưa đạt – cần ≥${passPct}%. Cố gắng thêm! 💪`,
        passed ? 'success' : 'warning'
      );
    }
  }, [testIdx, testQuestions.length, secPerQ, cpRules.passRate, userData.checkpointScores, testUnit, saveCheckpointScore, addXP, incrementQuizzes, showToast]);

  // Đồng hồ đếm ngược 45s cho nhóm Luyện thi (SDD §5.4)
  useEffect(() => {
    if (!testUnit || testFinished || !secPerQ || testAnswered !== null || testExitModal) return;
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      // Hết giờ tính sai và tự sang câu tiếp
      setTestAnswered(-1);
      const t = setTimeout(() => advanceCheckpoint(testScore), 900);
      return () => clearTimeout(t);
    }
    const iv = setTimeout(() => setTimeLeft((s) => (s != null ? s - 1 : null)), 1000);
    return () => clearTimeout(iv);
  }, [testUnit, testFinished, secPerQ, testAnswered, testExitModal, timeLeft, advanceCheckpoint, testScore]);

  function handleTestAnswer(idx) {
    if (testAnswered !== null) return;
    setTestAnswered(idx);
    const q = testQuestions[testIdx];
    const ok = idx === q.correct;
    const nextScore = ok ? testScore + 1 : testScore;
    if (ok) {
      setTestScore(nextScore);
      setTimeout(() => advanceCheckpoint(nextScore), 800);
    }
    // Trả lời sai: giữ màn để người học xem đáp án đúng + explanation rồi bấm "Tiếp"
  }

  // ── Luồng onboarding cho người chưa chọn nhóm:
  //    • Người mới hoàn toàn (0 bài đã học, chưa làm placement) → hiện Kiểm tra đầu vào trước;
  //      nếu bỏ qua kiểm tra (hoặc ?pickGroup=1) → chuyển sang màn chọn nhóm học (GroupPicker).
  //    • Người dùng cũ đã có tiến độ → hiện GroupPicker (kèm thẻ "Gợi ý cho bạn").
  const wantsPickerFromUrl = searchParams.get('pickGroup') === '1';
  const isFreshNewUser = !userData.learnerGroup
    && !userData.placement
    && (userData.completedLessons?.length || 0) === 0;
  const shouldForceOnboarding = !userData.learnerGroup && !searchParams.get('tab');

  if (shouldForceOnboarding && isFreshNewUser && !skippedPlacement && !wantsPickerFromUrl && !showGroupPicker) {
    return (
      <PlacementTest
        isNewUserOnboarding
        onSkip={() => {
          setSkippedPlacement(true);
          setShowGroupPicker(true);
        }}
      />
    );
  }

  if (shouldForceOnboarding || showGroupPicker || wantsPickerFromUrl) {
    return (
      <GroupPicker
        onDone={(gid, pid) => {
          setShowGroupPicker(false);
          if (pid) {
            setPathTab(pid);
            setSearchParams({ tab: pid }, { replace: true });
          } else if (wantsPickerFromUrl) {
            setSearchParams({}, { replace: true });
          }
        }}
      />
    );
  }

  /* ── Checkpoint test in progress ── */
  if (testUnit && !testFinished) {
    const q = testQuestions[testIdx];
    return (
      <div className="fade-in position-relative quiz-viewport-stage">
        <div className="quiz-top-bar">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setTestExitModal(true)}>
            ✕ Thoát
          </button>
          <span className="fw-bold small" style={{ color: testUnit.color }}>
            <Emoji e={testUnit.icon} size={16} /> {testUnit.checkpoint.title}
          </span>
          <div className="d-flex align-items-center gap-2">
            {secPerQ && timeLeft !== null && (
              <span className={`badge ${timeLeft <= 10 ? 'bg-danger' : 'bg-info text-dark'}`}>
                ⏱ {timeLeft}s
              </span>
            )}
            <span className="badge bg-warning text-dark">
              <Icon name="star" size={14} /> {testScore}/{testQuestions.length}
            </span>
          </div>
        </div>
        <div className="progress" style={{ height: '6px' }}>
          <div className="progress-bar" style={{ width: `${((testIdx + 1) / testQuestions.length) * 100}%`, backgroundColor: testUnit.color }}></div>
        </div>

        <div className="card shadow-sm quiz-question-card">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-1">
              <span className="text-muted small">Câu {testIdx + 1}/{testQuestions.length}</span>
              {(q.speak || q.audioText) && (
                <button type="button" className="btn btn-sm btn-cowdi-primary" onClick={() => speakWord(q.audioText || q.speak)}>
                  <Icon name="sound" size={15} /> Nghe phát âm
                </button>
              )}
            </div>
            <p className="fs-5 fw-bold mb-0">{q.question}</p>
          </div>
        </div>

        <div className="row g-2">
          {q.options.map((opt, i) => {
            let cls = 'btn w-100 quiz-option-btn';
            if (testAnswered !== null) {
              cls += i === q.correct ? ' btn-success' : i === testAnswered ? ' btn-danger' : ' btn-outline-secondary';
            } else {
              cls += ' btn-outline-primary';
            }
            return (
              <div className="col-12 col-md-6" key={i}>
                <button type="button" className={cls} onClick={() => handleTestAnswer(i)} disabled={testAnswered !== null}>
                  {opt}
                </button>
              </div>
            );
          })}
        </div>

        {testAnswered !== null && testAnswered !== q.correct && (
          <div className="quiz-sticky-action-bar is-wrong fade-in">
            <div className="quiz-sticky-feedback text-danger">
              <strong>{testAnswered === -1 ? 'Hết giờ!' : 'Chưa đúng.'}</strong> Đáp án đúng: <b>{q.options[q.correct]}</b>
              {q.explanation && <div className="small text-dark mt-1">{q.explanation}</div>}
            </div>
            <div className="quiz-sticky-actions">
              <button type="button" className="btn btn-cowdi-primary px-4" onClick={() => advanceCheckpoint(testScore)}>
                {testIdx + 1 < testQuestions.length ? 'Tiếp →' : 'Xem kết quả →'}
              </button>
            </div>
          </div>
        )}

        {/* Modal xác nhận thoát trong app (không dùng window.confirm — SDD §5.4) */}
        {testExitModal && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: 'rgba(0,0,0,0.45)', zIndex: 1080 }}
          >
            <div className="card shadow p-4" style={{ maxWidth: 380, width: '90%', borderRadius: 16 }}>
              <h5 className="fw-bold mb-2">Thoát bài kiểm tra?</h5>
              <p className="text-muted small mb-3">Tiến độ bài kiểm tra hiện tại sẽ không được lưu.</p>
              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setTestExitModal(false)}>
                  Tiếp tục làm
                </button>
                <button type="button" className="btn btn-danger" onClick={() => { setTestExitModal(false); setTestUnit(null); }}>
                  Thoát
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Checkpoint test results ── */
  if (testUnit && testFinished) {
    const total = testQuestions.length;
    const pctVal = total > 0 ? Math.round((testScore / total) * 100) : 0;
    const passPct = Math.round(cpRules.passRate * 100);
    const passed = total > 0 && testScore / total >= cpRules.passRate;
    const playableUnits = activePath.units.filter((u) => !u.comingSoon && u.lessons?.length > 0);
    const isLastUnit = playableUnits[playableUnits.length - 1]?.id === testUnit.id;
    const allUnitLessonsDone = testUnit.lessons.every((lid) => userData.completedLessons?.includes(lid));

    return (
      <div className="text-center py-5 fade-in" style={{ maxWidth: 620, margin: '0 auto' }}>
        <div style={{ fontSize: '5rem' }} className="emoji-big"><Icon name={passed ? 'trophy' : 'muscle'} size={96} /></div>
        <h2 className="fw-bold mt-3">{testUnit.checkpoint.title}</h2>
        <p className="text-muted"><Emoji e={testUnit.icon} size={16} /> {testUnit.title} – {testUnit.subtitle}</p>
        <div className="display-4 fw-bold my-3" style={{ color: passed ? '#4CAF50' : '#F44336' }}>{testScore}/{total}</div>
        <p className="lead text-muted">
          {pctVal}% —{' '}
          {passed ? (
            isLastUnit ? (
              <>Bạn đã hoàn thành lộ trình! <Icon name="party" size={20} /></>
            ) : testIsTestOut && !allUnitLessonsDone ? (
              <>Đã mở unit tiếp theo. Học xong các bài trong unit này để nhận 💎!</>
            ) : (
              <>Đạt! Unit tiếp theo đã mở! <Icon name="party" size={20} /></>
            )
          ) : (
            `Chưa đạt (cần ≥${passPct}%). Ôn lại bài nhé!`
          )}
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
          {!passed && (
            <button type="button" className="btn btn-cowdi-primary" onClick={() => startCheckpoint(testUnit, testIsTestOut)}>
              Làm lại
            </button>
          )}
          <button type="button" className="btn btn-outline-secondary" onClick={() => setTestUnit(null)}>
            Quay lại lộ trình
          </button>
        </div>
      </div>
    );
  }

  /* ── Node click handlers ── */
  function onLockedClick(node) {
    const prev = nodes[node.index - 1];
    const hint = prev
      ? prev.type === 'lesson'
        ? `Hoàn thành bài "${lessonMap[prev.lessonId]?.title || ''}" trước nhé!`
        : `Vượt qua "${prev.unit.checkpoint.title}" trước nhé!`
      : 'Bài này chưa mở.';
    showToast(`🔒 ${hint}`, 'warning');
  }

  function nodeFace(node, lesson) {
    if (node.status === 'done') return <Icon name="star" size={44} className="ic-white" />;
    if (node.status === 'placed') return <span style={{ opacity: 0.55 }}><Icon name="star" size={40} /></span>;
    if (node.type === 'checkpoint') return <Icon name="trophy" size={node.status === 'locked' ? 40 : 48} />;
    if (node.status === 'locked') return <Icon name="lock" size={36} />;
    return <span className="path-node-emoji"><Emoji e={lesson?.icon || '📖'} size={36} /></span>;
  }

  /* ── Visual Learning Path ── */
  const doneAll = nodes.length > 0 && doneCount === nodes.length;
  const advUnlocked = isAdvancedUnlocked(userData);

  return (
    <div className="fade-in path-page">
      {/* Header: chip nhóm + Đổi nhóm + chọn lộ trình trong nhóm */}
      <div className="path-head">
        <div className="path-head-main">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
            <span
              className="badge rounded-pill px-3 py-2 text-white"
              style={{ background: visibleGroup.color, fontSize: '0.85rem' }}
            >
              <Icon name={visibleGroup.icon} size={14} /> Nhóm: {visibleGroup.title}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowGroupPicker(true)}
            >
              Đổi nhóm học
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => navigate('/placement')}
            >
              🧭 Kiểm tra đầu vào
            </button>
          </div>
          <h2 className="mb-0 d-flex align-items-center gap-2">
            <Icon name="road" size={32} /> {activePath.title}
          </h2>
          <p className="text-muted mb-0 small">{activePath.description}</p>
        </div>

        {visiblePaths.length > 1 && (
          <label className="path-picker">
            <span>Lộ trình</span>
            <select
              className="form-select form-select-sm"
              value={pathTab}
              onChange={(e) => changePath(e.target.value)}
            >
              {visiblePaths.map((p) => {
                const lockedAdv = p.id === 'advanced' && !advUnlocked;
                return (
                  <option key={p.id} value={p.id}>
                    {p.title}{lockedAdv ? ' 🔒 (Hoàn thành Trung bình để mở)' : ''}
                  </option>
                );
              })}
            </select>
          </label>
        )}
      </div>

      {/* Banner nếu đang xem lộ trình thuộc nhóm khác */}
      {isCrossGroup && (
        <div className="alert alert-info d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 px-3 my-2">
          <span className="small">
            Lộ trình này thuộc nhóm <strong>{pathGroup.title}</strong>. Bạn có muốn đặt làm nhóm học chính không?
          </span>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => {
              setLearningGroup(pathGroup.id, activePath.id);
              showToast(`Đã chuyển sang nhóm ${pathGroup.title} · ${activePath.title}`, 'success');
            }}
          >
            Đặt làm nhóm chính
          </button>
        </div>
      )}

      <div className="path-progress">
        <div className="book-bar"><i style={{ width: `${pct}%`, background: activePath.color }} /></div>
        <span>{doneCount}/{nodes.length} · {pct}%</span>
      </div>
      <div className="d-flex justify-content-center gap-3 text-muted small mt-1 mb-3 flex-wrap">
        <span>💎 Gem kế tiếp: <b>{(userData.completedLessons?.length || 0) % 2}/2</b> bài mới</span>
        <span>·</span>
        <span>💠 Đá kế tiếp: <b>{(userData.completedLessons?.length || 0) % 10}/10</b> bài mới</span>
      </div>

      {/* Trail */}
      <div className="path-trail">
        {activePath.units.map((unit, uIdx) => {
          // Unit S2–S10 sắp ra mắt (không khoá luồng)
          if (unit.comingSoon || !unit.lessons?.length) {
            return (
              <section key={unit.id} className="path-unit locked" style={{ '--u': unit.color, opacity: 0.72 }}>
                <header className="path-unit-head">
                  <div className="path-unit-ico"><Emoji e={unit.icon} size={28} /></div>
                  <div className="path-unit-txt">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <small>Unit {uIdx + 1}</small>
                      <span className="badge bg-secondary">Sắp ra mắt</span>
                    </div>
                    <b>{unit.title}</b>
                    <span>{unit.subtitle}</span>
                  </div>
                </header>
              </section>
            );
          }

          const unitNodes = nodes.filter((n) => n.unitIndex === uIdx);
          const unitDone = unitNodes.filter((n) => n.status === 'done' || n.status === 'placed').length;
          const unitLocked = unitNodes.length > 0 && unitNodes.every((n) => n.status === 'locked');
          const cpScore = userData.checkpointScores?.[unit.id];
          const cpRealPassed = Boolean(cpScore?.passed && (cpScore.source ?? 'checkpoint') === 'checkpoint');
          const cpPlaced = Boolean(cpScore?.passed && (cpScore.source === 'placement' || cpScore.source === 'legacy'));
          const allLessonsDone = unit.lessons.every((lid) => userData.completedLessons?.includes(lid));
          const allLessons100 = unit.lessons.every((lid) => (userData.lessonScores?.[lid] || 0) >= 100);
          const isPerfect100 = allLessonsDone && allLessons100 && cpRealPassed && cpScore.total > 0 && cpScore.score === cpScore.total;

          return (
            <section
              key={unit.id}
              className={`path-unit ${unitLocked ? 'locked' : ''} ${isPerfect100 ? 'unit-perfect' : ''}`}
              style={{
                '--u': unit.color,
                border: isPerfect100 ? '2px solid #F59E0B' : undefined,
                boxShadow: isPerfect100 ? '0 0 12px rgba(245, 158, 11, 0.25)' : undefined,
              }}
            >
              <header className="path-unit-head">
                <div className="path-unit-ico">
                  {isPerfect100 ? <Icon name="star" size={30} /> : <Icon name={UNIT_ICONS[uIdx % UNIT_ICONS.length]} size={30} />}
                </div>
                <div className="path-unit-txt">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <small>Unit {uIdx + 1} · {unitDone}/{unitNodes.length}</small>
                    {isPerfect100 ? (
                      <span className="badge bg-warning text-dark"><Icon name="star" size={12} /> ⭐ 100% · đã nhận 💎 3</span>
                    ) : allLessonsDone && cpRealPassed ? (
                      <span className="badge bg-light text-success">✓ Đã nhận 💎 1</span>
                    ) : (
                      <small className="path-unit-gem-hint">💎 +1 khi xong bài và qua kiểm tra</small>
                    )}
                  </div>
                  <b>{unit.title}</b>
                  <span>{unit.subtitle}</span>
                  {cpPlaced && (
                    <div className="path-unit-placed-note">
                      Bạn đã vượt unit này qua kiểm tra đầu vào / tiến độ cũ. Làm bài kiểm tra unit để nhận 💎.
                    </div>
                  )}
                </div>
                {unitLocked && <span className="path-unit-lock"><Icon name="lock" size={26} /></span>}
              </header>

              <ol className="path-nodes">
                {unitNodes.map((node) => {
                  const x = WIGGLE[node.index % WIGGLE.length];
                  const isCur = node.status === 'current';
                  const lesson = node.type === 'lesson' ? lessonMap[node.lessonId] : null;
                  const label = node.type === 'lesson'
                    ? (lesson?.title || node.lessonId)
                    : (node.isTestOut ? `Kiểm tra vượt unit` : unit.checkpoint.title);
                  const cls = `path-node ${node.type} ${node.status}`;
                  const score = node.type === 'checkpoint' ? userData.checkpointScores?.[unit.id] : null;

                  const isDone = node.type === 'lesson' && userData.completedLessons?.includes(node.lessonId);
                  const newLessonCount = (userData.completedLessons?.length || 0) + 1;
                  const willGiveGem = !isDone && (newLessonCount % 2 === 0);
                  const willGiveStone = !isDone && (newLessonCount % 10 === 0);
                  const estMilk = lesson ? estimateLessonMilk(lesson, { isRepeat: isDone }) : 0;
                  const rewardHint = isDone ? `🥛 ~+${estMilk} (ôn lại 1/3)` : `🥛 ~+${estMilk} Sữa`;

                  const inner = (
                    <>
                      {isCur && (
                        <span className="path-node-tip">
                          {node.type === 'lesson' ? (
                            <>
                              BẮT ĐẦU · {rewardHint}
                              {willGiveGem && ' +💎'}
                              {willGiveStone && ' +💠'}
                            </>
                          ) : 'KIỂM TRA'}
                        </span>
                      )}
                      <span className="path-node-btn"><span>{nodeFace(node, lesson)}</span></span>
                      <span className="path-node-label">
                        {label}
                        {node.status === 'placed' && <small className="text-muted">Đã vượt</small>}
                        {score && score.total > 0 && <small>{score.score}/{score.total}</small>}
                      </span>
                    </>
                  );

                  return (
                    <li key={node.key} className="path-step" style={{ '--x': `${x}px` }} ref={isCur ? currentRef : null}>
                      {isCur && (
                        <img src={petImg} alt="" className={`path-mascot ${x >= 0 ? 'left' : 'right'}`} />
                      )}
                      {node.status === 'locked' ? (
                        <button type="button" className={cls} onClick={() => onLockedClick(node)} aria-label={`${label} (đã khoá)`}>
                          {inner}
                        </button>
                      ) : node.type === 'lesson' ? (
                        <Link to={`/lessons/${node.lessonId}`} className={cls}>{inner}</Link>
                      ) : (
                        <button type="button" className={cls} onClick={() => startCheckpoint(unit, node.isTestOut)}>{inner}</button>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}

        <div className={`path-finish ${doneAll ? 'done' : ''}`}>
          <div className="path-finish-ico"><Icon name={doneAll ? 'trophy' : 'flag'} size={44} /></div>
          <p className="text-muted">
            {doneAll ? <>Hoàn thành toàn bộ lộ trình! Bạn thật xuất sắc! <Icon name="party" size={16} /></> : `Còn ${nodes.length - doneCount} bước nữa để về đích!`}
          </p>
        </div>
      </div>

      {currentNode && (
        <div className="path-fab">
          {currentNode.type === 'lesson' ? (
            <Link to={`/lessons/${currentNode.lessonId}`} className="btn btn-cowdi-primary d-inline-flex align-items-center gap-2">
              <Icon name="play" size={20} />
              <span>Học tiếp: {lessonMap[currentNode.lessonId]?.title}</span>
              <span className="badge bg-warning text-dark ms-1">
                🥛 ~+{estimateLessonMilk(lessonMap[currentNode.lessonId], { isRepeat: false })}
              </span>
            </Link>
          ) : (
            <button type="button" className="btn btn-warning d-inline-flex align-items-center gap-2" onClick={() => startCheckpoint(currentNode.unit, currentNode.isTestOut)}>
              <Icon name="trophy" size={20} /> {currentNode.unit.checkpoint.title}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
