import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSEO } from '../hooks/useSEO';
import { SEO_CONFIGS } from '../data/seo-config';
import { Link, useSearchParams } from 'react-router-dom';
import { LESSONS, QUIZ_BANK } from '../data/lessons';
import { EXAM_LESSONS } from '../data/exam-paths';
import { ALL_PATHS, getPathById, buildPathNodes } from '../data/path';
import { PET_REGISTRY, getPetEvolution } from '../data/pets';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { useToast } from '../components/layout/Toast';
import Icon from '../components/Icon';
import Emoji from '../components/Emoji';

const ALL_LESSONS = [...LESSONS, ...EXAM_LESSONS];
const PATH_IDS = ALL_PATHS.map((p) => p.id);
/* Horizontal wiggle of the trail (px), cycles per node */
const WIGGLE = [0, 44, 72, 44, 0, -44, -72, -44];
/* Unit icon by position (data emojis are replaced by the Cowdi icon set) */
const UNIT_ICONS = ['abc', 'blocks', 'chat', 'sprout', 'leaf', 'tree', 'clover', 'star', 'trophy', 'target'];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build checkpoint questions from unit lessons' vocab + quiz
function buildCheckpointQuestions(unit, count) {
  const lessonIds = unit.lessons;
  const questions = [];

  // Grab quiz questions from lessons in this unit
  for (const lesson of ALL_LESSONS) {
    if (lessonIds.includes(lesson.id)) {
      for (const q of lesson.quiz || []) {
        questions.push(q);
      }
    }
  }

  // Also pull from QUIZ_BANK matching unit vocab
  const unitWords = new Set();
  for (const lesson of ALL_LESSONS) {
    if (lessonIds.includes(lesson.id)) {
      for (const v of lesson.vocabulary) unitWords.add(v.word.toLowerCase());
    }
  }

  for (const q of [...QUIZ_BANK.vocab, ...QUIZ_BANK.grammar]) {
    const qLower = q.question.toLowerCase();
    for (const w of unitWords) {
      if (qLower.includes(w)) { questions.push(q); break; }
    }
  }

  // Deduplicate by question text and shuffle
  const unique = [];
  const seen = new Set();
  for (const q of questions) {
    if (!seen.has(q.question)) { seen.add(q.question); unique.push(q); }
  }
  return shuffleArray(unique).slice(0, count);
}

export default function LearningPathPage() {
  useSEO(SEO_CONFIGS['/learning-path']);
  const { userData, addXP, incrementQuizzes, saveCheckpointScore } = useUser();
  const { addCoins, getActivePetWithDecay } = usePet();
  const showToast = useToast();

  // Checkpoint test state
  const [testUnit, setTestUnit] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testIdx, setTestIdx] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [testAnswered, setTestAnswered] = useState(null);
  const [testFinished, setTestFinished] = useState(false);

  // Path tab: 'general' or exam path id
  const [searchParams, setSearchParams] = useSearchParams();
  const [pathTab, setPathTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab && PATH_IDS.includes(tab) ? tab : 'general';
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && PATH_IDS.includes(tab)) setPathTab(tab);
    else if (!tab) setPathTab('general');
  }, [searchParams]);

  const changePath = (id) => {
    setPathTab(id);
    if (id === 'general') setSearchParams({}, { replace: true });
    else setSearchParams({ tab: id }, { replace: true });
  };

  const lessonMap = useMemo(() => {
    const m = {};
    for (const l of ALL_LESSONS) m[l.id] = l;
    return m;
  }, []);

  const activePath = useMemo(() => getPathById(pathTab), [pathTab]);
  const nodes = useMemo(() => buildPathNodes(activePath, userData), [activePath, userData.completedLessons, userData.checkpointScores]);
  const doneCount = nodes.filter((n) => n.status === 'done').length;
  const pct = nodes.length ? Math.round((doneCount / nodes.length) * 100) : 0;
  const currentNode = nodes.find((n) => n.status === 'current');

  // Mascot next to the current node
  const activePet = getActivePetWithDecay();
  const petSpecies = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const petEvo = activePet && petSpecies ? getPetEvolution(activePet.speciesId, activePet.totalXpEarned) : null;
  const petImg = petEvo?.image || '/assets/images/logo/MiniLogoCowdi.svg';

  // Scroll the current node into view when it is far down the trail
  const currentRef = useRef(null);
  useEffect(() => {
    if (!testUnit && currentRef.current && currentNode && currentNode.index > 3) {
      currentRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [pathTab, testUnit]);

  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window) {
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
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  }, []);

  // Start checkpoint test
  function startCheckpoint(unit) {
    const qs = buildCheckpointQuestions(unit, unit.checkpoint.questionCount);
    if (qs.length === 0) return;
    setTestUnit(unit);
    setTestQuestions(qs);
    setTestIdx(0);
    setTestScore(0);
    setTestAnswered(null);
    setTestFinished(false);
  }

  function handleTestAnswer(idx) {
    if (testAnswered !== null) return;
    setTestAnswered(idx);
    const q = testQuestions[testIdx];
    if (idx === q.correct) setTestScore((s) => s + 1);

    setTimeout(() => {
      if (testIdx + 1 < testQuestions.length) {
        setTestIdx((i) => i + 1);
        setTestAnswered(null);
      } else {
        const finalScore = idx === q.correct ? testScore + 1 : testScore;
        const total = testQuestions.length;
        const pct = finalScore / total;
        const passed = pct >= testUnit.checkpoint.passRate;
        // Thưởng "vượt mốc" chỉ nhận 1 lần; làm lại checkpoint đã đạt → 1/3 XP, không coin thưởng
        const alreadyPassed = !!userData.checkpointScores?.[testUnit.id]?.passed;
        saveCheckpointScore(testUnit.id, finalScore, total);
        const base = finalScore * 10 + (passed && !alreadyPassed ? 80 : 0) + (pct >= 1 ? 20 : 0);
        const xp = alreadyPassed ? Math.max(5, Math.round(base / 3)) : base;
        addXP(xp);
        incrementQuizzes(pct >= 1);
        addCoins(passed && !alreadyPassed ? 40 : passed ? 10 : 5);
        setTestFinished(true);
        showToast(passed ? `Vượt qua! +${xp} XP 🎉` : `Chưa đạt – cần ≥70%. Cố gắng thêm! 💪`, passed ? 'success' : 'warning');
      }
    }, 1000);
  }

  /* ── Checkpoint test in progress ── */
  if (testUnit && !testFinished) {
    const q = testQuestions[testIdx];
    return (
      <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setTestUnit(null)}>✕ Thoát</button>
          <span className="fw-bold" style={{ color: testUnit.color }}>
            <Emoji e={testUnit.icon} size={18} /> {testUnit.checkpoint.title}
          </span>
          <span className="badge bg-warning text-dark fs-6"><Icon name="star" size={16} /> {testScore}/{testQuestions.length}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar" style={{ width: `${((testIdx + 1) / testQuestions.length) * 100}%`, backgroundColor: testUnit.color }}></div>
        </div>

        {q.speak && (
          <div className="text-center mb-3">
            <button className="btn btn-cowdi-primary" onClick={() => speakWord(q.speak)}><Icon name="sound" size={18} /> Nghe phát âm</button>
          </div>
        )}

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <span className="text-muted small">Câu {testIdx + 1}/{testQuestions.length}</span>
            <p className="fs-5 fw-bold mb-0 mt-1">{q.question}</p>
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
                <button className={cls} onClick={() => handleTestAnswer(i)} disabled={testAnswered !== null}>{opt}</button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Checkpoint test results ── */
  if (testUnit && testFinished) {
    const total = testQuestions.length;
    const pct = Math.round((testScore / total) * 100);
    const passed = testScore / total >= testUnit.checkpoint.passRate;
    return (
      <div className="text-center py-5 fade-in">
        <div style={{ fontSize: '5rem' }} className="emoji-big"><Icon name={passed ? 'trophy' : 'muscle'} size={96} /></div>
        <h2 className="fw-bold mt-3">{testUnit.checkpoint.title}</h2>
        <p className="text-muted"><Emoji e={testUnit.icon} size={16} /> {testUnit.title} – {testUnit.subtitle}</p>
        <div className="display-4 fw-bold my-3" style={{ color: passed ? '#4CAF50' : '#F44336' }}>{testScore}/{total}</div>
        <p className="lead text-muted">{pct}% — {passed ? <>Đạt! Unit tiếp theo đã mở! <Icon name="party" size={20} /></> : 'Chưa đạt (cần ≥70%). Ôn lại bài nhé!'}</p>
        <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
          {!passed && (
            <button className="btn btn-cowdi-primary" onClick={() => startCheckpoint(testUnit)}>Làm lại</button>
          )}
          <button className="btn btn-outline-secondary" onClick={() => setTestUnit(null)}>Quay lại lộ trình</button>
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
    if (node.type === 'checkpoint') return <Icon name="trophy" size={node.status === 'locked' ? 40 : 48} />;
    if (node.status === 'locked') return <Icon name="lock" size={36} />;
    return <span className="path-node-emoji"><Emoji e={lesson?.icon || '📖'} size={36} /></span>;
  }

  /* ── Visual Learning Path (Duolingo-style trail) ── */
  const doneAll = nodes.length > 0 && doneCount === nodes.length;
  return (
    <div className="fade-in path-page">
      {/* Header: path picker + progress */}
      <div className="path-head">
        <div className="path-head-main">
          <h2 className="mb-0 d-flex align-items-center gap-2"><Icon name="road" size={34} /> Lộ trình học</h2>
          <p className="text-muted mb-0">Học lần lượt từng bài, không bỏ sót. Mỗi unit kết thúc bằng một bài kiểm tra.</p>
        </div>
        <label className="path-picker">
          <span>Lộ trình</span>
          <select className="form-select form-select-sm" value={pathTab} onChange={(e) => changePath(e.target.value)}>
            {ALL_PATHS.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="path-progress">
        <div className="book-bar"><i style={{ width: `${pct}%`, background: activePath.color }} /></div>
        <span>{doneCount}/{nodes.length} · {pct}%</span>
      </div>

      {activePath.id !== 'general' && (
        <div className="path-exam-note" style={{ '--u': activePath.color }}>
          <span className="path-exam-ico"><Icon name="medal" size={36} /></span>
          <div>
            <b>{activePath.title}</b> · {activePath.targetLevel}
            <div className="small text-muted">{activePath.description}</div>
          </div>
        </div>
      )}

      {/* Trail */}
      <div className="path-trail">
        {activePath.units.map((unit, uIdx) => {
          const unitNodes = nodes.filter((n) => n.unitIndex === uIdx);
          const unitDone = unitNodes.filter((n) => n.status === 'done').length;
          const unitLocked = unitNodes.length > 0 && unitNodes[0].status === 'locked';
          return (
            <section key={unit.id} className={`path-unit ${unitLocked ? 'locked' : ''}`} style={{ '--u': unit.color }}>
              <header className="path-unit-head">
                <div className="path-unit-ico"><Icon name={UNIT_ICONS[uIdx % UNIT_ICONS.length]} size={30} /></div>
                <div className="path-unit-txt">
                  <small>Unit {uIdx + 1} · {unitDone}/{unitNodes.length}</small>
                  <b>{unit.title}</b>
                  <span>{unit.subtitle}</span>
                </div>
                {unitLocked && <span className="path-unit-lock"><Icon name="lock" size={26} /></span>}
              </header>

              <ol className="path-nodes">
                {unitNodes.map((node) => {
                  const x = WIGGLE[node.index % WIGGLE.length];
                  const isCur = node.status === 'current';
                  const lesson = node.type === 'lesson' ? lessonMap[node.lessonId] : null;
                  const label = node.type === 'lesson' ? (lesson?.title || node.lessonId) : unit.checkpoint.title;
                  const cls = `path-node ${node.type} ${node.status}`;
                  const score = node.type === 'checkpoint' ? userData.checkpointScores?.[unit.id] : null;

                  const inner = (
                    <>
                      {isCur && <span className="path-node-tip">{node.type === 'lesson' ? 'BẮT ĐẦU' : 'KIỂM TRA'}</span>}
                      <span className="path-node-btn"><span>{nodeFace(node, lesson)}</span></span>
                      <span className="path-node-label">
                        {label}
                        {score && <small>{score.score}/{score.total}</small>}
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
                        <button type="button" className={cls} onClick={() => startCheckpoint(unit)}>{inner}</button>
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
              <Icon name="play" size={20} /> Học tiếp: {lessonMap[currentNode.lessonId]?.title}
            </Link>
          ) : (
            <button type="button" className="btn btn-warning d-inline-flex align-items-center gap-2" onClick={() => startCheckpoint(currentNode.unit)}>
              <Icon name="trophy" size={20} /> {currentNode.unit.checkpoint.title}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

