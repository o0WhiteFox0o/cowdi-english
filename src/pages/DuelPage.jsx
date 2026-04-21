import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePet } from '../hooks/usePet';
import { useUser } from '../hooks/useUser';
import { generateDuelQuiz } from '../data/duel-quiz-pool';
import { PET_REGISTRY, getPetEvolution } from '../data/pets';
import { useToast } from '../components/Toast';
import { useSound } from '../hooks/useSound';

// ── League definitions ──────────────────────────────────────
const LEAGUES = {
  bronze:  { name: 'Đồng',      icon: '🥉', color: '#CD7F32', bg: '#FFF3E0', min: 0 },
  silver:  { name: 'Bạc',       icon: '🥈', color: '#9E9E9E', bg: '#F5F5F5', min: 100 },
  gold:    { name: 'Vàng',      icon: '🥇', color: '#FFC107', bg: '#FFFDE7', min: 300 },
  diamond: { name: 'Kim cương', icon: '💎', color: '#00BCD4', bg: '#E0F7FA', min: 600 },
  master:  { name: 'Cao thủ',   icon: '👑', color: '#E91E63', bg: '#FCE4EC', min: 1000 },
};

// ── Element theming ──────────────────────────────────────────
const ELEMENT_THEME = {
  fire:    { color: '#FF6B35', label: '🔥 Lửa',    skillName: 'Fireball' },
  water:   { color: '#0096FF', label: '💧 Nước',    skillName: 'Aqua Blast' },
  nature:  { color: '#2ECC71', label: '🌿 Thiên nhiên', skillName: 'Leaf Storm' },
  cosmic:  { color: '#9B59B6', label: '🌟 Vũ trụ',  skillName: 'Star Pulse' },
  earth:   { color: '#8B5A2B', label: '🪨 Đất',     skillName: 'Rock Smash' },
  neutral: { color: '#95A5A6', label: '⚪ Trung tính', skillName: 'Tackle' },
};

function getLeague(points) {
  if (points >= 1000) return 'master';
  if (points >= 600) return 'diamond';
  if (points >= 300) return 'gold';
  if (points >= 100) return 'silver';
  return 'bronze';
}

function getNextLeague(current) {
  const order = ['bronze', 'silver', 'gold', 'diamond', 'master'];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

function petEmoji(petSummary) {
  if (!petSummary?.speciesId) return '🐾';
  const species = PET_REGISTRY[petSummary.speciesId];
  if (!species) return '🐾';
  const evo = getPetEvolution(petSummary.speciesId, petSummary.totalXpEarned || 0);
  return evo?.emoji || species.emoji;
}

// ── Resolve pet image or emoji ──
function resolvePetImage(speciesId, xp) {
  if (!speciesId) return null;
  const species = PET_REGISTRY[speciesId];
  if (!species) return null;
  const evo = getPetEvolution(speciesId, xp || 0);
  return evo?.image || null;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

// ── Generate duel quiz from quiz bank + lesson quizzes ──────
// generateDuelQuiz is now imported from ../data/duel-quiz-pool

export default function DuelPage() {
  const { user, authFetch } = useAuth();
  const { petData, addCoins } = usePet();
  const { addXP } = useUser();

  // Mode: lobby | creating | playing | result
  const [mode, setMode] = useState('lobby');

  // Lobby data
  const [openDuels, setOpenDuels] = useState([]);
  const [myDuels, setMyDuels] = useState([]);
  const [myStats, setMyStats] = useState({ leaguePoints: 0, duelWins: 0, duelLosses: 0, duelStreak: 0, league: 'bronze' });
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [activeDuelId, setActiveDuelId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  // Battle state
  const [myHp, setMyHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [battleAnim, setBattleAnim] = useState(null); // 'attack-mine', 'damage-opponent', etc.
  const [effectClass, setEffectClass] = useState(null); // element effect CSS class
  const [damagePopup, setDamagePopup] = useState(null); // { target, amount, isCritical }
  const [comboCount, setComboCount] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [opponentPet, setOpponentPet] = useState(null); // { speciesId, xp, name, emoji, image, element }
  const [challengerResults, setChallengerResults] = useState([]); // [{correct: bool}] per question
  const battleAnimTimeoutRef = useRef(null);

  // Result state
  const [result, setResult] = useState(null);
  const showToast = useToast();
  const { play } = useSound();

  // ── Load lobby data ─────────────────────────────────────────
  const loadLobby = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const [openRes, myRes, statsRes] = await Promise.all([
        authFetch('/api/duel/open').then(r => r.ok ? r.json() : []),
        authFetch('/api/duel').then(r => r.ok ? r.json() : []),
        authFetch('/api/my-stats').then(r => r.ok ? r.json() : {}),
      ]);
      setOpenDuels(Array.isArray(openRes) ? openRes : []);
      setMyDuels(Array.isArray(myRes) ? myRes : []);
      setMyStats(statsRes);
    } catch {
      // silent
    }
    setLoading(false);
  }, [user, authFetch]);

  useEffect(() => { loadLobby(); }, [loadLobby]);

  // Timer for quiz
  useEffect(() => {
    if (mode === 'creating' || mode === 'playing') {
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - quizStartTime) / 1000)), 200);
      return () => clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [mode, quizStartTime]);

  // ── Start creating a new duel ───────────────────────────────
  function startCreate() {
    const quiz = generateDuelQuiz(10);
    if (quiz.length < 5) {
      showToast('Không đủ câu hỏi!', 'danger');
      return;
    }
    play('click');
    setQuestions(quiz);
    setAnswers(new Array(quiz.length).fill(-1));
    setCurrentQ(0);
    setSelectedOption(null);
    setQuizStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setElapsed(0);
    setMyHp(100);
    setOpponentHp(100);
    setBattleAnim(null);
    setEffectClass(null);
    setDamagePopup(null);
    setComboCount(0);
    setChallengerResults([]); // no challenger results in creating mode
    // Pick a random opponent pet for the entire match
    const petKeys = Object.keys(PET_REGISTRY).filter(k => k !== myPetInfo.speciesId);
    const randKey = petKeys[Math.floor(Math.random() * petKeys.length)] || Object.keys(PET_REGISTRY)[0];
    const randSpecies = PET_REGISTRY[randKey];
    const randImg = resolvePetImage(randKey, 500);
    setOpponentPet({
      speciesId: randKey,
      xp: 500,
      name: randSpecies?.name || 'Đối thủ',
      emoji: randSpecies?.emoji || '🐾',
      image: randImg,
      element: randSpecies?.element || 'neutral',
    });
    setMode('creating');
  }

  // ── Get my pet element ────────────────────────────────────
  const myPetInfo = useMemo(() => {
    const pet = petData.collection[petData.activePetId];
    if (!pet) return { emoji: '🐮', element: 'neutral', speciesId: null, xp: 0 };
    const species = PET_REGISTRY[pet.speciesId];
    const evo = getPetEvolution(pet.speciesId, pet.totalXpEarned);
    return {
      emoji: evo?.emoji || species?.emoji || '🐮',
      element: species?.element || 'neutral',
      speciesId: pet.speciesId,
      xp: pet.totalXpEarned || 0,
      name: pet.customName || species?.name || 'Pet',
    };
  }, [petData]);

  const myPetImage = useMemo(() => resolvePetImage(myPetInfo.speciesId, myPetInfo.xp), [myPetInfo]);

  // ── Run battle animation sequence ───────────────────────────
  // Both pets can attack: my pet attacks if I answer correctly,
  // opponent attacks if they answered this question correctly (from challengerResults)
  function runBattleAnimation(isCorrect, isCritical, questionIdx, callback) {
    const myElement = myPetInfo.element;
    const oppElement = opponentPet?.element || 'neutral';
    const challengerTurn = challengerResults[questionIdx];
    const oppAnsweredCorrectly = typeof challengerTurn === 'object'
      ? !!challengerTurn.correct
      : !!challengerTurn;

    clearTimeout(battleAnimTimeoutRef.current);

    // Determine what happens this turn:
    // Player answers correctly → my pet attacks
    // Player answers incorrectly → opponent pet attacks
    const myPetAttacks = isCorrect;
    const oppPetAttacks = !isCorrect;

    const sequence = [];

    // Phase 1: My pet attacks (if I answered correctly)
    if (myPetAttacks) {
      sequence.push((next) => {
        setBattleAnim('attack-mine');
        play('battleAttack');
        battleAnimTimeoutRef.current = setTimeout(() => {
          setBattleAnim('damage-opponent');
          setEffectClass(`effect-${myElement}`);
          const dmg = isCritical ? 15 : 10;
          if (isCritical) {
            play('battleCritical');
          } else {
            play('battleHit');
          }
          setDamagePopup({ target: 'opponent', amount: dmg, isCritical });
          setOpponentHp(prev => Math.max(0, prev - dmg));
          battleAnimTimeoutRef.current = setTimeout(() => {
            setBattleAnim(null);
            setEffectClass(null);
            setDamagePopup(null);
            next();
          }, 500);
        }, 350);
      });
    }

    // Phase 2: Opponent pet attacks (if they answered correctly, or in creating mode if I was wrong)
    if (oppPetAttacks) {
      sequence.push((next) => {
        setBattleAnim('attack-opponent');
        play('battleAttack');
        battleAnimTimeoutRef.current = setTimeout(() => {
          setBattleAnim('damage-mine');
          setEffectClass(`effect-${oppElement}`);
          play('battleDamage');
          setDamagePopup({ target: 'mine', amount: 10, isCritical: false });
          setMyHp(prev => Math.max(0, prev - 10));
          battleAnimTimeoutRef.current = setTimeout(() => {
            setBattleAnim(null);
            setEffectClass(null);
            setDamagePopup(null);
            next();
          }, 500);
        }, 350);
      });
    }

    // If neither attacks (shouldn't happen often), just advance
    if (sequence.length === 0) {
      callback();
      return;
    }

    // Run sequence
    let idx = 0;
    function runNext() {
      if (idx >= sequence.length) {
        callback();
        return;
      }
      sequence[idx++](runNext);
    }
    runNext();
  }

  // ── Select an answer (battle version) ──────────────────────
  function selectAnswer(optionIdx) {
    if (selectedOption !== null || submitting) return;
    setSelectedOption(optionIdx);

    const q = questions[currentQ];
    const hasKnownCorrectAnswer = Number.isInteger(q?.correct);
    const isCorrect = hasKnownCorrectAnswer ? optionIdx === q.correct : true;
    const answerTime = (Date.now() - (questionStartTime || Date.now())) / 1000;
    const isCritical = answerTime < 3 && (hasKnownCorrectAnswer ? isCorrect : true);

    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIdx;
    setAnswers(newAnswers);

    if (isCorrect) {
      setComboCount(prev => prev + 1);
      play('correct');
    } else {
      setComboCount(0);
      play('wrong');
    }

    // Run battle animation, then advance
    runBattleAnimation(isCorrect, isCritical, currentQ, () => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOption(null);
        setQuestionStartTime(Date.now());
      } else {
        finishQuiz(newAnswers);
      }
    });
  }

  // ── Finish quiz ─────────────────────────────────────────────
  async function finishQuiz(finalAnswers) {
    setSubmitting(true);
    clearInterval(timerRef.current);
    const time = Math.floor((Date.now() - quizStartTime) / 1000);

    if (mode === 'creating') {
      // Score locally (we know correct answers)
      const score = finalAnswers.reduce((s, a, i) => s + (a === questions[i].correct ? 1 : 0), 0);
      try {
        const res = await authFetch('/api/duel', {
          method: 'POST',
          body: JSON.stringify({ quizData: questions, answers: finalAnswers, time }),
        });
        const data = await res.json();
        if (data.ok) {
          setResult({ mode: 'created', score, total: questions.length, time, challengeId: data.challengeId });
          setMode('result');
          addXP(score * 5);
          addCoins(10);
          play('celebration');
        } else {
          showToast(data.error || 'Lỗi tạo thách đấu.', 'danger');
          setMode('lobby');
        }
      } catch {
        showToast('Lỗi kết nối server.', 'danger');
        setMode('lobby');
      }
    } else if (mode === 'playing') {
      try {
        const res = await authFetch(`/api/duel/${activeDuelId}/join`, {
          method: 'POST',
          body: JSON.stringify({ answers: finalAnswers, time }),
        });
        const data = await res.json();
        if (data.ok) {
          const isWin = data.winnerId === user.id;
          const isDraw = !data.winnerId;
          setResult({
            mode: 'played',
            myScore: data.opponentScore,
            theirScore: data.challengerScore,
            myTime: time,
            theirTime: data.challengerTime,
            winnerId: data.winnerId,
            isWin,
            isDraw,
            total: questions.length,
          });
          setMode('result');
          addXP(data.opponentScore * 5);
          addCoins(isWin ? 50 : isDraw ? 25 : 10);
          play(isWin ? 'duelWin' : isDraw ? 'celebration' : 'duelLose');
        } else {
          showToast(data.error || 'Lỗi nộp bài.', 'danger');
          setMode('lobby');
        }
      } catch {
        showToast('Lỗi kết nối server.', 'danger');
        setMode('lobby');
      }
    }
    setSubmitting(false);
  }

  // ── Play an open duel ───────────────────────────────────────
  async function playDuel(duelId) {
    try {
      const res = await authFetch(`/api/duel/${duelId}`);
      const data = await res.json();
      if (data?.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(-1));
        setCurrentQ(0);
        setSelectedOption(null);
        setQuizStartTime(Date.now());
        setQuestionStartTime(Date.now());
        setElapsed(0);
        setActiveDuelId(duelId);
        setMyHp(100);
        setOpponentHp(100);
        setBattleAnim(null);
        setEffectClass(null);
        setDamagePopup(null);
        setComboCount(0);
        // Store challenger's per-question results for battle animation
        setChallengerResults(data.challengerResults || []);
        // Use challenger's pet as opponent
        if (data.challengerPet?.speciesId) {
          const cSpecies = PET_REGISTRY[data.challengerPet.speciesId];
          const cImg = resolvePetImage(data.challengerPet.speciesId, data.challengerPet.totalXpEarned);
          setOpponentPet({
            speciesId: data.challengerPet.speciesId,
            xp: data.challengerPet.totalXpEarned || 0,
            name: data.challengerPet.customName || cSpecies?.name || 'Đối thủ',
            emoji: cSpecies?.emoji || '🐾',
            image: cImg,
            element: cSpecies?.element || 'neutral',
          });
        } else {
          setOpponentPet({ speciesId: null, xp: 0, name: 'Đối thủ', emoji: '🐾', image: null, element: 'neutral' });
        }
        setMode('playing');
      } else {
        showToast('Thách đấu không khả dụng.', 'danger');
      }
    } catch {
      showToast('Lỗi kết nối server.', 'danger');
    }
  }

  // ── Return to lobby ─────────────────────────────────────────
  function backToLobby() {
    setMode('lobby');
    setResult(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQ(0);
    setSelectedOption(null);
    setActiveDuelId(null);
    loadLobby();
  }

  // My pet emoji (for lobby)
  const myPetEmoji = myPetInfo.emoji;

  // ── Not logged in ───────────────────────────────────────────
  if (!user) {
    return (
      <div className="text-center py-5 fade-in">
        <div className="fs-1 mb-3">⚔️</div>
        <h2 className="fw-bold">Đấu trường Pet</h2>
        <p className="text-muted">Đăng nhập để thách đấu với người chơi khác!</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: BATTLE MODE (creating / playing)
  // ═══════════════════════════════════════════════════════════
  if (mode === 'creating' || mode === 'playing') {
    const q = questions[currentQ];
    const progress = ((currentQ) / questions.length) * 100;
    const isCorrect = selectedOption !== null && mode === 'creating' ? selectedOption === q.correct : null;
    const elementTheme = ELEMENT_THEME[myPetInfo.element] || ELEMENT_THEME.neutral;

    // HP bar color
    const hpColor = (hp) => hp > 50 ? '#2ECC71' : hp > 25 ? '#F39C12' : '#E74C3C';

    return (
      <div className="fade-in">
        {/* Battle Header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold small">
            {mode === 'creating' ? '⚔️ Tạo thách đấu' : '🎯 Chấp nhận thách đấu'}
          </span>
          <div className="d-flex align-items-center gap-2">
            {comboCount >= 3 && (
              <span className="badge bg-warning text-dark combo-badge">🔥 x{comboCount}</span>
            )}
            <span className="badge bg-dark">⏱️ {elapsed}s</span>
          </div>
        </div>

        {/* Progress */}
        <div className="progress mb-2" style={{ height: 4 }}>
          <div className="progress-bar bg-cowdi-primary" style={{ width: `${progress}%`, transition: 'width 0.3s' }}></div>
        </div>

        {/* ═══ BATTLE ARENA ═══ */}
        <div className="battle-arena mb-3">
          <div className="battle-ground-line"></div>

          {/* Element effect overlay */}
          {effectClass && <div className={`battle-effect ${effectClass}`}></div>}

          {/* Critical flash */}
          {damagePopup?.isCritical && <div className="battle-effect effect-critical"></div>}

          {/* Opponent HUD (top-left) */}
          <div className="battle-hud battle-hud-opponent">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-bold small">{opponentPet?.name || 'Đối thủ'}</span>
              <span className="small text-muted">{opponentHp}/100</span>
            </div>
            <div className="hp-bar">
              <div className="hp-bar-fill" style={{ width: `${opponentHp}%`, backgroundColor: hpColor(opponentHp) }}></div>
            </div>
          </div>

          {/* My HUD (bottom-right) */}
          <div className="battle-hud battle-hud-mine">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-bold small">{myPetInfo.name}</span>
              <span className="small text-muted">{myHp}/100</span>
            </div>
            <div className="hp-bar">
              <div className="hp-bar-fill" style={{ width: `${myHp}%`, backgroundColor: hpColor(myHp) }}></div>
            </div>
            <div className="text-end mt-1">
              <span className="badge" style={{ backgroundColor: elementTheme.color, fontSize: '0.6rem', color: '#fff' }}>
                {elementTheme.label}
              </span>
            </div>
          </div>

          {/* My Pet (bottom-left) */}
          <div className={`battle-pet battle-pet-mine ${
            battleAnim === 'attack-mine' ? 'anim-attack-mine' :
            battleAnim === 'damage-mine' ? 'anim-damage' :
            myHp <= 0 ? 'anim-faint' : ''
          }`}>
            {myPetImage ? (
              <img src={myPetImage} alt={myPetInfo.name} />
            ) : (
              <div className="pet-emoji-lg">{myPetInfo.emoji}</div>
            )}
          </div>

          {/* Opponent Pet (top-right) */}
          <div className={`battle-pet battle-pet-opponent ${
            battleAnim === 'attack-opponent' ? 'anim-attack-opponent' :
            battleAnim === 'damage-opponent' ? 'anim-damage' :
            opponentHp <= 0 ? 'anim-faint' : ''
          }`}>
            {opponentPet?.image ? (
              <img src={opponentPet.image} alt={opponentPet.name} />
            ) : (
              <div className="pet-emoji-lg">{opponentPet?.emoji || '🐾'}</div>
            )}
          </div>

          {/* Damage Popup */}
          {damagePopup && (
            <div className={`damage-number ${damagePopup.target === 'opponent' ? 'damage-number-opponent' : 'damage-number-mine'}`}>
              {damagePopup.isCritical ? '💥 ' : ''}-{damagePopup.amount}
            </div>
          )}
        </div>

        {/* Question card */}
        <div className="card shadow-sm mb-3" style={{ borderLeft: `4px solid ${elementTheme.color}` }}>
          <div className="card-body py-2">
            <div className="d-flex justify-content-between mb-1">
              <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>Câu {currentQ + 1}/{questions.length}</span>
              <span className="badge bg-light text-dark" style={{ fontSize: '0.65rem' }}>{q?.category}</span>
            </div>
            <h6 className="fw-bold mb-0">{q?.question}</h6>
          </div>
        </div>

        {/* Options */}
        <div className="d-grid gap-2">
          {(q?.options || []).map((opt, idx) => {
            let btnClass = 'btn btn-outline-secondary text-start py-2 px-3';
            if (selectedOption !== null) {
              if (mode === 'creating') {
                if (idx === q.correct) btnClass = 'btn btn-success text-start py-2 px-3';
                else if (idx === selectedOption && idx !== q.correct) btnClass = 'btn btn-danger text-start py-2 px-3';
              } else {
                if (idx === selectedOption) btnClass = 'btn btn-primary text-start py-2 px-3';
              }
            }
            return (
              <button
                key={`${currentQ}-${idx}`}
                className={btnClass}
                onClick={() => selectAnswer(idx)}
                disabled={selectedOption !== null}
              >
                <span className="fw-bold me-2">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Score tracker (for creating mode) */}
        {mode === 'creating' && currentQ > 0 && (
          <div className="text-center mt-2">
            <span className="text-muted small">
              Đúng: {answers.slice(0, currentQ).filter((a, i) => a === questions[i].correct).length}/{currentQ}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: BATTLE RESULT MODE
  // ═══════════════════════════════════════════════════════════
  if (mode === 'result' && result) {
    const league = LEAGUES[myStats.league] || LEAGUES.bronze;
    const elementTheme = ELEMENT_THEME[myPetInfo.element] || ELEMENT_THEME.neutral;

    if (result.mode === 'created') {
      return (
        <div className="text-center fade-in py-4">
          <div className="fs-1 mb-2">⚔️</div>
          <h3 className="fw-bold">Thách đấu đã tạo!</h3>
          <div className="card shadow-sm mx-auto mt-3" style={{ maxWidth: 340 }}>
            <div className="card-body">
              {/* Battle Pet Display */}
              <div className="mb-2">
                {myPetImage ? (
                  <img src={myPetImage} alt={myPetInfo.name} style={{ maxWidth: 80, maxHeight: 80, objectFit: 'contain' }} />
                ) : (
                  <div className="fs-1">{myPetInfo.emoji}</div>
                )}
              </div>
              <h4 className="fw-bold">{result.score}/{result.total}</h4>
              <div className="mb-2">
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <span className="small text-muted">HP còn lại:</span>
                  <div className="hp-bar" style={{ width: 100 }}>
                    <div className="hp-bar-fill" style={{
                      width: `${myHp}%`,
                      backgroundColor: myHp > 50 ? '#2ECC71' : myHp > 25 ? '#F39C12' : '#E74C3C'
                    }}></div>
                  </div>
                  <span className="small fw-bold">{myHp}%</span>
                </div>
              </div>
              <p className="text-muted mb-1">⏱️ {result.time}s</p>
              <p className="text-muted small">Đang chờ đối thủ chấp nhận...</p>
              <div className="d-flex justify-content-center gap-2 mt-2">
                <span className="badge bg-warning text-dark">+{result.score * 5} XP</span>
                <span className="badge bg-success">+10 🪙</span>
                <span className="badge bg-info text-dark">+5 LP</span>
              </div>
            </div>
          </div>
          <button className="btn btn-cowdi-primary mt-4" onClick={backToLobby}>
            ← Quay về đấu trường
          </button>
        </div>
      );
    }

    // Played result — VS battle result
    return (
      <div className="text-center fade-in py-4">
        <div className="fs-1 mb-2">
          {result.isWin ? '🎉' : result.isDraw ? '🤝' : '😢'}
        </div>
        <h3 className="fw-bold" style={{ color: result.isWin ? '#2ECC71' : result.isDraw ? '#F39C12' : '#E74C3C' }}>
          {result.isWin ? 'CHIẾN THẮNG!' : result.isDraw ? 'HÒA!' : 'THẤT BẠI!'}
        </h3>

        {/* Battle VS comparison */}
        <div className="d-flex justify-content-center align-items-center gap-3 my-4">
          {/* My pet */}
          <div className="text-center">
            <div className="mb-1">
              {myPetImage ? (
                <img src={myPetImage} alt={myPetInfo.name} style={{ maxWidth: 70, maxHeight: 70, objectFit: 'contain' }} />
              ) : (
                <div className="fs-2">{myPetInfo.emoji}</div>
              )}
            </div>
            <div className="fw-bold small">{myPetInfo.name}</div>
            <div className="hp-bar mx-auto mt-1" style={{ width: 80 }}>
              <div className="hp-bar-fill" style={{
                width: `${myHp}%`,
                backgroundColor: myHp > 50 ? '#2ECC71' : myHp > 25 ? '#F39C12' : '#E74C3C'
              }}></div>
            </div>
            <h3 className={`fw-bold mb-0 ${result.isWin ? 'text-success' : ''}`}>{result.myScore}/{result.total}</h3>
            <small className="text-muted">⏱️ {result.myTime}s</small>
          </div>

          <div className="fs-3 text-muted fw-bold">VS</div>

          {/* Opponent pet */}
          <div className="text-center">
            <div className="mb-1">
              {opponentPet?.image ? (
                <img src={opponentPet.image} alt={opponentPet.name} style={{ maxWidth: 70, maxHeight: 70, objectFit: 'contain' }} />
              ) : (
                <div className="fs-2">{opponentPet?.emoji || '🐾'}</div>
              )}
            </div>
            <div className="fw-bold small">{opponentPet?.name || 'Đối thủ'}</div>
            <div className="hp-bar mx-auto mt-1" style={{ width: 80 }}>
              <div className="hp-bar-fill" style={{
                width: `${opponentHp}%`,
                backgroundColor: opponentHp > 50 ? '#2ECC71' : opponentHp > 25 ? '#F39C12' : '#E74C3C'
              }}></div>
            </div>
            <h3 className={`fw-bold mb-0 ${!result.isWin && !result.isDraw ? 'text-success' : ''}`}>{result.theirScore}/{result.total}</h3>
            <small className="text-muted">⏱️ {result.theirTime}s</small>
          </div>
        </div>

        {/* Rewards */}
        <div className="card shadow-sm mx-auto" style={{ maxWidth: 340 }}>
          <div className="card-body">
            <h6 className="fw-bold mb-2">🎁 Phần thưởng</h6>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <span className="badge bg-warning text-dark">+{result.myScore * 5} XP</span>
              <span className="badge bg-success">+{result.isWin ? 50 : result.isDraw ? 25 : 10} 🪙</span>
              <span className="badge bg-info text-dark">
                +{result.isWin ? 30 : result.isDraw ? 15 : 5} LP
              </span>
            </div>
          </div>
        </div>

        <button className="btn btn-cowdi-primary mt-4" onClick={backToLobby}>
          ← Quay về đấu trường
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: LOBBY MODE
  // ═══════════════════════════════════════════════════════════
  const league = LEAGUES[myStats.league] || LEAGUES.bronze;
  const nextLeagueKey = getNextLeague(myStats.league);
  const nextLeague = nextLeagueKey ? LEAGUES[nextLeagueKey] : null;
  const progressToNext = nextLeague ? Math.min(100, ((myStats.leaguePoints - league.min) / (nextLeague.min - league.min)) * 100) : 100;

  // Split my duels
  const pendingDuels = myDuels.filter(d => d.status === 'pending' && d.challengerId === user.id);
  const completedDuels = myDuels.filter(d => d.status === 'completed');

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold"><span className="me-2">⚔️</span>Đấu trường Pet</h2>
        <p className="text-muted small">Thách đấu quiz với người chơi khác!</p>
      </div>

      {/* My Stats Card */}
      <div className="card shadow-sm mb-4" style={{ background: league.bg }}>
        <div className="card-body">
          <div className="d-flex align-items-center gap-3">
            <div className="text-center">
              <div className="fs-1">{league.icon}</div>
              <div className="fw-bold small" style={{ color: league.color }}>{league.name}</div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between small mb-1">
                <span className="fw-bold">{myStats.leaguePoints} LP</span>
                {nextLeague && <span className="text-muted">{nextLeague.icon} {nextLeague.min} LP</span>}
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar" style={{ width: `${progressToNext}%`, backgroundColor: league.color }}></div>
              </div>
              <div className="d-flex gap-3 mt-2">
                <span className="small"><span className="text-success fw-bold">{myStats.duelWins}W</span></span>
                <span className="small"><span className="text-danger fw-bold">{myStats.duelLosses}L</span></span>
                {myStats.duelStreak > 0 && <span className="small">🔥 {myStats.duelStreak}</span>}
              </div>
            </div>
            <div>{myPetImage ? <img src={myPetImage} alt={myPetInfo.name} style={{ width: 48, height: 48, objectFit: 'contain' }} /> : <span className="fs-2">{myPetEmoji}</span>}</div>
          </div>
        </div>
      </div>

      {/* Create button */}
      <button className="btn btn-cowdi-primary w-100 py-3 mb-4 fw-bold fs-5" onClick={startCreate}>
        ⚔️ Tạo thách đấu mới
      </button>

      {/* Open duels */}
      <h6 className="fw-bold mb-2">
        🎯 Thách đấu đang chờ
        <span className="badge bg-danger ms-2">{openDuels.length}</span>
      </h6>
      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-muted"></div>
        </div>
      ) : openDuels.length > 0 ? (
        <div className="d-grid gap-2 mb-4">
          {openDuels.map(duel => (
            <div key={duel.id} className="card shadow-sm card-hover" style={{ cursor: 'pointer' }} onClick={() => playDuel(duel.id)}>
              <div className="card-body d-flex align-items-center gap-2 py-2">
                {resolvePetImage(duel.challengerPet?.speciesId, duel.challengerPet?.totalXpEarned) ? (
                  <img src={resolvePetImage(duel.challengerPet?.speciesId, duel.challengerPet?.totalXpEarned)} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                ) : (
                  <span className="fs-3">{petEmoji(duel.challengerPet)}</span>
                )}
                <div className="flex-grow-1">
                  <div className="fw-bold small">{duel.challengerNick}</div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {duel.questionCount} câu · {timeAgo(duel.createdAt)}
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-danger fw-bold">Đấu!</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted small py-3 mb-4">
          Chưa có thách đấu nào. Hãy tạo một cái! 🎯
        </div>
      )}

      {/* My pending duels */}
      {pendingDuels.length > 0 && (
        <>
          <h6 className="fw-bold mb-2">⏳ Đang chờ đối thủ</h6>
          <div className="d-grid gap-2 mb-4">
            {pendingDuels.map(duel => (
              <div key={duel.id} className="card shadow-sm">
                <div className="card-body d-flex align-items-center gap-2 py-2">
                  {myPetImage ? <img src={myPetImage} alt={myPetInfo.name} style={{ width: 36, height: 36, objectFit: 'contain' }} /> : <span className="fs-3">{myPetEmoji}</span>}
                  <div className="flex-grow-1">
                    <div className="fw-bold small">Thách đấu #{duel.id}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                      Điểm: {duel.challengerScore}/{duel.questionCount} · {timeAgo(duel.createdAt)}
                    </div>
                  </div>
                  <span className="badge bg-warning text-dark">Chờ...</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Completed duels */}
      {completedDuels.length > 0 && (
        <>
          <h6 className="fw-bold mb-2">📜 Lịch sử đấu</h6>
          <div className="d-grid gap-2 mb-4">
            {completedDuels.slice(0, 10).map(duel => {
              const isChallenger = duel.challengerId === user.id;
              const myScore = isChallenger ? duel.challengerScore : duel.opponentScore;
              const theirScore = isChallenger ? duel.opponentScore : duel.challengerScore;
              const isWin = duel.winnerId === user.id;
              const isDraw = !duel.winnerId;
              const opponentNick = isChallenger ? (duel.opponentNick || 'Đối thủ') : duel.challengerNick;
              const opponentPetData = isChallenger ? duel.opponentPet : duel.challengerPet;

              return (
                <div key={duel.id} className={`card shadow-sm ${isWin ? 'border-success' : isDraw ? 'border-warning' : 'border-danger'}`}>
                  <div className="card-body d-flex align-items-center gap-2 py-2">
                    <span className={`fw-bold ${isWin ? 'text-success' : isDraw ? 'text-warning' : 'text-danger'}`}>
                      {isWin ? '✅' : isDraw ? '🤝' : '❌'}
                    </span>
                    {resolvePetImage(opponentPetData?.speciesId, opponentPetData?.totalXpEarned) ? (
                      <img src={resolvePetImage(opponentPetData?.speciesId, opponentPetData?.totalXpEarned)} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                    ) : (
                      <span className="fs-4">{petEmoji(opponentPetData)}</span>
                    )}
                    <div className="flex-grow-1">
                      <div className="fw-bold small">vs {opponentNick}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{timeAgo(duel.createdAt)}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold small">
                        <span className={isWin ? 'text-success' : ''}>{myScore}</span>
                        <span className="text-muted"> : </span>
                        <span className={!isWin && !isDraw ? 'text-success' : ''}>{theirScore}</span>
                      </div>
                      <span className={`badge ${isWin ? 'bg-success' : isDraw ? 'bg-warning text-dark' : 'bg-danger'}`} style={{ fontSize: '0.6rem' }}>
                        {isWin ? '+30 LP' : isDraw ? '+15 LP' : '+5 LP'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
