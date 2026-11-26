import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSEO } from '../../hooks/useSEO';
import { SEO_CONFIGS } from '../../data/seo-config';
import { LESSONS, getGroup, getGroupOfPath } from '../../data/lessons';
import { EXAM_LESSONS } from '../../data/lessons';
import { normalizeWordId } from '../vocab/wordProgress';
import { usePet } from '../../hooks/usePet';
import { useUser, GAME_XP_DAILY_CAP } from '../../hooks/useUser';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import { PET_REGISTRY, getEvolutionInfo } from '../../data/pets';
import Icon from '../../components/Icon';
import Emoji from '../../components/Emoji';


const COWDI_JUNIOR_IMG = '/assets/images/pets/Cowdi/Cowdi_junior.webp';

// XP mini-game đi qua trần ngày (useUser.addXP source='game'); trả về chuỗi toast phù hợp
function gameXpMsg(granted, raw, tail = '') {
  if (granted <= 0) return `Hôm nay đã đạt trần XP mini-game — vào Bài tập/Ôn tập để nhận thêm nhé! ${tail}`;
  if (granted < raw) return `+${granted} XP (đã gần trần XP game hôm nay) ${tail}`;
  return `+${granted} XP! ${tail}`;
}

function resolvePetImg(speciesId, stage) {
  if (!speciesId) return null;
  const evo = getEvolutionInfo(speciesId, stage);
  return evo?.image || null;
}

function hpColor(hp) {
  if (hp > 60) return '#2ecc71';
  if (hp > 30) return '#f39c12';
  return '#e74c3c';
}

// ── Compact Battle Arena ─────────────────────────────────────────────────────
function MiniGameArena({ playerHp, opponentHp, battleAnim, damagePopup, myPetImg, myPetEmoji, myPetName }) {
  return (
    <div className="battle-arena minigame-battle-arena mb-3">
      <div className="battle-ground-line"></div>

      {/* Player HUD (Top-Left, above Player Pet) */}
      <div className="battle-hud battle-hud-mine">
        <div className="d-flex justify-content-between align-items-center mb-1 gap-2">
          <div className="d-flex align-items-center gap-1 text-truncate">
            {myPetImg ? (
              <img src={myPetImg} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '0.9rem' }}>{myPetEmoji || '🐮'}</span>
            )}
            <span className="fw-bold text-truncate" style={{ fontSize: '0.78rem' }}>{myPetName || 'Tôi'}</span>
          </div>
          <span className="fw-bold" style={{ fontSize: '0.75rem', color: hpColor(playerHp) }}>
            {playerHp}/100
          </span>
        </div>
        <div className="hp-bar">
          <div className="hp-bar-fill" style={{ width: `${playerHp}%`, backgroundColor: hpColor(playerHp) }}></div>
        </div>
      </div>

      {/* Opponent HUD (Top-Right, above Opponent Pet) */}
      <div className="battle-hud battle-hud-opponent">
        <div className="d-flex justify-content-between align-items-center mb-1 gap-2">
          <span className="fw-bold" style={{ fontSize: '0.75rem', color: hpColor(opponentHp) }}>
            {opponentHp}/100
          </span>
          <div className="d-flex align-items-center gap-1 text-truncate">
            <span className="fw-bold text-truncate" style={{ fontSize: '0.78rem' }}>Cowdi Jr.</span>
            <img src={COWDI_JUNIOR_IMG} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
          </div>
        </div>
        <div className="hp-bar">
          <div className="hp-bar-fill" style={{ width: `${opponentHp}%`, backgroundColor: hpColor(opponentHp) }}></div>
        </div>
      </div>

      {/* My Pet (Bottom-Left) */}
      <div className={`battle-pet battle-pet-mine ${
        battleAnim === 'attack-mine' ? 'anim-attack-mine' :
        battleAnim === 'damage-mine' ? 'anim-damage' :
        playerHp <= 0 ? 'anim-faint' : ''
      }`}>
        {myPetImg ? (
          <img src={myPetImg} alt="My pet" />
        ) : (
          <div className="pet-emoji-lg emoji-big"><Emoji e={myPetEmoji || '🐮'} size={96} /></div>
        )}
      </div>

      {/* Opponent: Cowdi Junior (Bottom-Right) */}
      <div className={`battle-pet battle-pet-opponent ${
        battleAnim === 'attack-opponent' ? 'anim-attack-opponent' :
        battleAnim === 'damage-opponent' ? 'anim-damage' :
        opponentHp <= 0 ? 'anim-faint' : ''
      }`}>
        <img src={COWDI_JUNIOR_IMG} alt="Cowdi Junior" />
      </div>

      {/* Damage popup */}
      {damagePopup && (
        <div className={`damage-number ${damagePopup.target === 'opponent' ? 'damage-number-opponent' : 'damage-number-mine'}`}>
          {damagePopup.isCritical ? <><Icon name="boom" size={24} />{' '}</> : ''}-{damagePopup.amount}
        </div>
      )}
    </div>
  );
}

const ALL_VOCAB = [...LESSONS, ...EXAM_LESSONS].flatMap((l) => l.vocabulary || []);
const ALL_SENTENCES = [...LESSONS, ...EXAM_LESSONS].flatMap((l) =>
  (l.grammar || []).flatMap((g) =>
    g.examples.filter((ex) => ex.en.split(' ').length >= 3 && ex.en.split(' ').length <= 10)
      .map((ex) => ({ en: ex.en.replace(/[.!?]$/, ''), vi: ex.vi }))
  )
);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Shared TTS helper ───────────────────────────────────────────────────────
function speakText(text, rate = 0.9) {
  if (!('speechSynthesis' in window) || !text) return;
  speechSynthesis.cancel();
  const clean = String(text)
    .replace(/\s*[\(\[\{][^()\[\]{}]*[\)\]\}]/g, '')
    .replace(/_+/g, ', ')
    .replace(/\//g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'en-US';
  u.rate = rate;
  speechSynthesis.speak(u);
}

function SpeakBtn({ text, rate = 0.9, size = 'sm', label = <Icon name="sound" size={16} /> }) {
  return (
    <button
      className={`btn btn-${size} btn-outline-info`}
      style={{ lineHeight: 1, padding: '3px 8px' }}
      onClick={(e) => { e.stopPropagation(); speakText(text, rate); }}
      title={`Nghe phát âm: ${text}`}
      type="button"
    >
      {label}
    </button>
  );
}

const GAMES = [
  {
    id: 'word-catch',
    icon: '🎯',
    title: 'Cowdi Bắt Từ',
    enTitle: 'Word Catch',
    desc: 'Bắt từ rơi',
    badge: 'Luyện từ',
    bg: '#DDD6FE',
    border: '#5B4BD8',
    banner: '#4338CA',
    art: '/image/minigames/minigame_cowdi_bat_tu.webp'
  },
  {
    id: 'sentence-puzzle',
    icon: '🧩',
    title: 'Ghép câu',
    enTitle: 'Sentence',
    desc: 'Ghép thành câu',
    badge: 'Luyện câu',
    bg: '#A7F3D0',
    border: '#059669',
    banner: '#047857',
    art: '/image/minigames/minigame_ghep_cau.webp'
  },
  {
    id: 'memory-match',
    icon: '🃏',
    title: 'Lật thẻ nhớ',
    enTitle: 'Memory Match',
    desc: 'Ghép cặp từ nhớ',
    badge: 'Ghi nhớ',
    bg: '#FED7AA',
    border: '#EA580C',
    banner: '#C2410C',
    art: '/image/minigames/minigame_lat_the_nho.webp'
  },
  {
    id: 'spelling-bee',
    icon: '🐝',
    title: 'Spelling Bee',
    enTitle: 'Spelling Bee',
    desc: 'Đánh vần từ',
    badge: 'Chính tả',
    bg: '#FEF08A',
    border: '#CA8A04',
    banner: '#92400E',
    art: '/image/minigames/minigame_spelling_bee.webp'
  },
  {
    id: 'speed-match',
    icon: '⚡',
    title: 'Tốc độ ánh sáng',
    enTitle: 'Speed Match',
    desc: 'Ghép từ 60s',
    badge: 'Phản xạ',
    bg: '#BAE6FD',
    border: '#0284C7',
    banner: '#0369A1',
    art: '/image/minigames/minigame_toc_do_anh_sang.webp'
  },
  {
    id: 'word-scramble',
    icon: '🔤',
    title: 'Xáo chữ',
    enTitle: 'Scramble',
    desc: 'Xếp lại chữ cái',
    badge: 'Xếp chữ',
    bg: '#E9D5FF',
    border: '#7C3AED',
    banner: '#6D28D9',
    art: '/image/minigames/minigame_xao_chu.webp'
  },
];

function MiniGameResultCard({ matchResult, score, rounds, onRestart, onExit }) {
  const isWin = matchResult === 'victory';

  return (
    <div
      className={`card shadow-sm p-4 text-center my-3 border-2 ${isWin ? 'border-success' : 'border-danger'}`}
      style={{
        backgroundColor: isWin ? '#f4fbf5' : '#fff5f5',
        borderRadius: '16px',
        animation: 'cowdiSlideUp 0.25s ease-out',
        maxWidth: 500,
        margin: '0 auto',
      }}
    >
      <div style={{ fontSize: '4.2rem' }} className="emoji-big">
        {isWin ? '🏆' : '💔'}
      </div>
      <h3 className={`fw-bold mt-2 ${isWin ? 'text-success' : 'text-danger'}`}>
        {isWin ? 'CHIẾN THẮNG K.O!' : 'BẠN ĐÃ BỊ HẠ GỤC!'}
      </h3>
      <p className="text-muted mb-3" style={{ fontSize: '0.95rem' }}>
        {isWin
          ? `Xuất sắc! Bạn đã hạ gục Cowdi Jr. sau ${rounds} lượt đấu!`
          : `Cowdi Jr. đã giành phần thắng sau ${rounds} lượt. Đừng nản lòng, hãy phục thù nhé!`}
      </p>

      <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
        <div className="p-2 px-3 rounded bg-white border shadow-sm" style={{ minWidth: 120 }}>
          <span className="text-muted small d-block">Số câu đúng</span>
          <strong className="fs-5 text-dark">{score} câu</strong>
        </div>
        <div className="p-2 px-3 rounded bg-white border shadow-sm" style={{ minWidth: 120 }}>
          <span className="text-muted small d-block">{isWin ? 'Phần thưởng' : 'Điểm tích luỹ'}</span>
          <strong className={`fs-5 ${isWin ? 'text-warning' : 'text-primary'}`}>
            +{isWin ? score * 6 : Math.max(5, score * 3)} XP {isWin ? '· +20 🥛' : ''}
          </strong>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-2">
        <button type="button" className="btn btn-cowdi-primary px-4 py-2 fw-bold" onClick={onRestart}>
          <Icon name="rocket" size={18} /> {isWin ? 'Đấu tiếp' : 'Thử lại ngay'}
        </button>
        <button type="button" className="btn btn-outline-secondary px-3 py-2" onClick={onExit}>
          Chọn game khác
        </button>
      </div>
    </div>
  );
}

export default function MiniGamePage() {
  useSEO(SEO_CONFIGS['/mini-games']);
  const [game, setGame] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const { petData, onQuizComplete, addCoins } = usePet();
  const { userData, gameXpRemainingToday, addXP, recordQuestionResult } = useUser();
  const gameRunSetRef = useRef(new Set());
  const gameRules = useMemo(() => (
    getGroupOfPath(userData.activePath)?.rules
    || getGroup(userData.learnerGroup)?.rules
    || getGroup('intermediate')?.rules
  ), [userData.activePath, userData.learnerGroup]);
  const showToast = useToast();
  const { play } = useSound();

  // Battle state
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [battleAnim, setBattleAnim] = useState(null);
  const [damagePopup, setDamagePopup] = useState(null);
  const [matchResult, setMatchResult] = useState(null); // 'victory' | 'defeat' | null
  const [matchScore, setMatchScore] = useState(0);      // số câu đúng
  const [matchRounds, setMatchRounds] = useState(0);    // tổng số câu
  const battleAnimRef = useRef(null);

  const myPetInfo = useMemo(() => {
    const pet = petData?.collection?.[petData?.activePetId];
    if (!pet) return { emoji: '🐮', speciesId: null, evolution: 0, name: 'Tôi' };
    const species = PET_REGISTRY[pet.speciesId];
    const evo = getEvolutionInfo(pet.speciesId, pet.evolution);
    return {
      emoji: evo?.emoji || species?.emoji || '🐮',
      speciesId: pet.speciesId,
      evolution: pet.evolution || 0,
      name: pet.customName || evo?.name || species?.name || 'Tôi',
    };
  }, [petData]);

  const myPetImg = useMemo(() => resolvePetImg(myPetInfo.speciesId, myPetInfo.evolution), [myPetInfo]);

  function resetBattle() {
    gameRunSetRef.current = new Set();
    setPlayerHp(100);
    setOpponentHp(100);
    setBattleAnim(null);
    setDamagePopup(null);
    setMatchResult(null);
    setMatchScore(0);
    setMatchRounds(0);
    setGameKey((k) => k + 1);
  }

  function handleCorrect(targetWord) {
    if (matchResult) return;
    if (targetWord) {
      recordQuestionResult({ targetWords: [normalizeWordId(targetWord)] }, true, gameRunSetRef.current, gameRules);
    }
    clearTimeout(battleAnimRef.current);
    setBattleAnim('attack-mine');
    setMatchScore((s) => s + 1);
    setMatchRounds((r) => r + 1);
    const dmg = Math.floor(Math.random() * 5) + 16; // 16-20 dmg
    setDamagePopup({ target: 'opponent', amount: dmg, isCritical: false });

    setTimeout(() => {
      setBattleAnim('damage-opponent');
    }, 250);

    battleAnimRef.current = setTimeout(() => {
      setBattleAnim(null);
      setDamagePopup(null);
    }, 700);

    setOpponentHp((h) => {
      const nextHp = Math.max(0, h - dmg);
      if (nextHp <= 0) {
        setTimeout(() => triggerMatchEnd('victory', matchScore + 1, matchRounds + 1), 750);
      }
      return nextHp;
    });
  }

  function handleWrong(targetWord) {
    if (matchResult) return;
    if (targetWord) {
      recordQuestionResult({ targetWords: [normalizeWordId(targetWord)] }, false, gameRunSetRef.current, gameRules);
    }
    clearTimeout(battleAnimRef.current);
    setBattleAnim('attack-opponent');
    setMatchRounds((r) => r + 1);
    const dmg = Math.floor(Math.random() * 5) + 16; // 16-20 dmg
    setDamagePopup({ target: 'mine', amount: dmg, isCritical: false });

    setTimeout(() => {
      setBattleAnim('damage-mine');
    }, 250);

    battleAnimRef.current = setTimeout(() => {
      setBattleAnim(null);
      setDamagePopup(null);
    }, 700);

    setPlayerHp((h) => {
      const nextHp = Math.max(0, h - dmg);
      if (nextHp <= 0) {
        setTimeout(() => triggerMatchEnd('defeat', matchScore, matchRounds + 1), 750);
      }
      return nextHp;
    });
  }

  function triggerMatchEnd(result, finalScore, finalRounds) {
    setMatchResult(result);
    if (result === 'victory') {
      play('perfect');
      const raw = Math.max(15, finalScore * 6);
      const xp = addXP(raw, 'game');
      onQuizComplete('vocab', finalScore, finalRounds);
      addCoins(20);
      showToast(gameXpMsg(xp, raw, '🏆 HẠ GỤC ĐỐI THỦ! +20 🥛'), 'success');
    } else {
      play('wrong');
      const raw = Math.max(5, finalScore * 3);
      const xp = addXP(raw, 'game');
      showToast(gameXpMsg(xp, raw, '💔 Bạn đã bị hạ gục!'), 'info');
    }
  }

  function startGame(id) {
    resetBattle();
    setGame(id);
  }

  if (!game) {
    return (
      <div className="fade-in">
        <div className="text-center mb-4">
          <h2 className="fw-bold"><Icon name="gamepad" size={32} /> Mini Games</h2>
          <p className="text-muted">Chơi game vui mà vẫn học tiếng Anh!</p>
          <div className="d-inline-flex align-items-center gap-2 book-slip" style={{ fontSize: '.9rem' }}>
            <Icon name="star" size={18} />
            <span>XP game hôm nay: <b>{GAME_XP_DAILY_CAP - gameXpRemainingToday}/{GAME_XP_DAILY_CAP}</b></span>
            <div className="book-bar" style={{ width: 90 }}><i style={{ width: `${Math.round(((GAME_XP_DAILY_CAP - gameXpRemainingToday) / GAME_XP_DAILY_CAP) * 100)}%` }} /></div>
            {gameXpRemainingToday === 0 && <small className="text-muted">— hết trần, học để nhận thêm!</small>}
          </div>
        </div>
        <div className="topic-cards-grid" style={{ maxWidth: 780, margin: '0 auto' }}>
          {GAMES.map((g) => (
            <div
              key={g.id}
              className="topic-card-item"
              style={{
                '--card-bg': g.bg,
                '--card-border': g.border,
                '--card-banner': g.banner,
              }}
              onClick={() => startGame(g.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startGame(g.id); }}
            >
              {/* Inner Illustration Frame with Glass Reflection */}
              <div className="topic-card-frame">
                <img
                  src={g.art}
                  alt={g.title}
                  className="topic-card-art"
                  loading="lazy"
                />
              </div>

              {/* Middle Pill Banner */}
              <div className="topic-card-banner">
                <span className="topic-card-banner-decor">◆</span>
                <span className="topic-card-banner-title">{g.enTitle || g.title}</span>
                <span className="topic-card-banner-decor">◆</span>
              </div>

              {/* Bottom Footer matching Image 1 */}
              <div className="topic-card-footer">
                <div className="topic-card-footer-left">
                  <span className="topic-card-vi">{g.title}</span>
                  <span className="topic-card-lessons">
                    <i className="fas fa-gamepad me-1"></i>{g.badge}
                  </span>
                </div>
                <div className="topic-card-footer-right">
                  <span className="topic-card-count">+XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // (Pet Word Run / TyperShark đã có trang riêng tại /typing)

  return (
    <div className="fade-in">
      <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => setGame(null)}>
        ← Quay lại
      </button>

      <MiniGameArena
        playerHp={playerHp}
        opponentHp={opponentHp}
        battleAnim={battleAnim}
        damagePopup={damagePopup}
        myPetImg={myPetImg}
        myPetEmoji={myPetInfo.emoji}
        myPetName={myPetInfo.name}
      />

      {matchResult ? (
        <MiniGameResultCard
          matchResult={matchResult}
          score={matchScore}
          rounds={matchRounds}
          onRestart={resetBattle}
          onExit={() => setGame(null)}
        />
      ) : (
        <>
          {game === 'word-catch' && <WordCatchGame key={gameKey} onCorrect={handleCorrect} onWrong={handleWrong} />}
          {game === 'sentence-puzzle' && <SentencePuzzleGame key={gameKey} onCorrect={handleCorrect} onWrong={handleWrong} />}
          {game === 'memory-match' && <MemoryMatchGame key={gameKey} onCorrect={handleCorrect} onWrong={handleWrong} />}
          {game === 'spelling-bee' && <SpellingBeeGame key={gameKey} onCorrect={handleCorrect} onWrong={handleWrong} />}
          {game === 'speed-match' && <SpeedMatchGame key={gameKey} onCorrect={handleCorrect} onWrong={handleWrong} />}
          {game === 'word-scramble' && <WordScrambleGame key={gameKey} onCorrect={handleCorrect} onWrong={handleWrong} />}
        </>
      )}
    </div>
  );
}

// ── Word Catch Game ──────────────────────────────────────────────────────────
function WordCatchGame({ onCorrect, onWrong }) {
  const { play } = useSound();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [answered, setAnswered] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const generateRound = useCallback(() => {
    const shuffled = shuffle(ALL_VOCAB);
    const word = shuffled[0];
    const wrongOptions = shuffled.slice(1, 4).map((w) => w.meaning);
    const allOptions = shuffle([...wrongOptions, word.meaning]);
    setCurrent(word);
    setOptions(allOptions);
    setAnswered(null);
    setTimeLeft(8);
  }, []);

  useEffect(() => { generateRound(); }, []);

  // Auto-speak word when new round starts
  useEffect(() => { if (current) speakText(current.word); }, [current]);

  useEffect(() => {
    if (answered !== null || !current) return;
    if (timeLeft > 0) {
      if (timeLeft <= 3) play('tickUrgent'); else play('tick');
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    // Time out
    play('wrong');
    onWrong?.(current?.word);
    setAnswered(-1);
    setTimeout(() => nextRound(), 1200);
  }, [timeLeft, answered, current]);

  function handleAnswer(meaning) {
    if (answered !== null) return;
    const correct = meaning === current.meaning;
    setAnswered(meaning);
    if (correct) { setScore((s) => s + 1); play('correct'); onCorrect?.(current?.word); }
    else { play('wrong'); onWrong?.(current?.word); }
    setTimeout(() => nextRound(), 1000);
  }

  function nextRound() {
    setRound((r) => r + 1);
    generateRound();
  }

  if (!current) return null;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted small fw-semibold">Câu {round + 1}</span>
        <span className="badge bg-warning text-dark">Điểm: {score}</span>
        <span className={`badge ${timeLeft <= 3 ? 'bg-danger' : 'bg-secondary'}`}><Icon name="timer" size={12} /> {timeLeft}s</span>
      </div>

      {/* Falling word */}
      <div className="card shadow-sm mb-4 text-center" style={{ animation: 'wordFall 0.5s ease-out' }}>
        <div className="card-body py-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
            <div className="fs-3 fw-bold text-cowdi-primary">{current.word}</div>
            <SpeakBtn text={current.word} />
          </div>
          {current.phonetic && <div className="text-muted small">{current.phonetic}</div>}
        </div>
      </div>

      {/* Options */}
      <div className="row g-2">
        {options.map((opt, i) => {
          let cls = 'btn w-100 fw-bold';
          if (answered !== null) {
            cls += opt === current.meaning ? ' btn-success' : opt === answered ? ' btn-danger' : ' btn-outline-secondary';
          } else {
            cls += ' btn-outline-primary';
          }
          return (
            <div className="col-6" key={i}>
              <button className={cls} onClick={() => handleAnswer(opt)} disabled={answered !== null}>
                {opt}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sentence Puzzle Game ─────────────────────────────────────────────────────
function SentencePuzzleGame({ onCorrect, onWrong }) {
  const { play } = useSound();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(null);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);

  const generateRound = useCallback(() => {
    const sentence = shuffle(ALL_SENTENCES)[0];
    const words = sentence.en.split(' ');
    const mixed = shuffle(words);
    setCurrent(sentence);
    setShuffledWords(mixed.map((w, i) => ({ word: w, id: `${w}_${i}` })));
    setSelected([]);
    setResult(null);
  }, []);

  useEffect(() => { generateRound(); }, []);

  function toggleWord(wordObj) {
    if (result !== null) return;
    play('pop');
    if (selected.find((s) => s.id === wordObj.id)) {
      setSelected(selected.filter((s) => s.id !== wordObj.id));
    } else {
      setSelected([...selected, wordObj]);
    }
  }

  function checkAnswer() {
    const answer = selected.map((s) => s.word).join(' ');
    const correct = answer === current.en;
    setResult(correct);
    if (correct) { setScore((s) => s + 1); play('correct'); onCorrect?.(); }
    else { play('wrong'); onWrong?.(); }
    setTimeout(() => {
      setRound((r) => r + 1);
      generateRound();
    }, 1500);
  }

  if (!current) return <div className="text-center text-muted">Đang tải...</div>;

  const remaining = shuffledWords.filter((w) => !selected.find((s) => s.id === w.id));

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted small fw-semibold">Câu {round + 1}</span>
        <span className="badge bg-warning text-dark">Điểm: {score}</span>
      </div>

      {/* Vietnamese hint */}
      <div className="card shadow-sm mb-3">
        <div className="card-body text-center py-3">
          <div className="text-muted small">Dịch câu này sang tiếng Anh:</div>
          <div className="fs-5 fw-bold">{current.vi}</div>
          {result !== null && (
            <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
              <span className="text-muted small fst-italic">{current.en}</span>
              <SpeakBtn text={current.en} label={<><Icon name="sound" size={16} /> Nghe câu</>} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Answer area */}
      <div className="card shadow-sm mb-3" style={{ minHeight: 60 }}>
        <div className="card-body d-flex gap-2 flex-wrap py-2">
          {selected.length === 0 ? (
            <span className="text-muted small">Nhấn vào các từ bên dưới để ghép câu...</span>
          ) : (
            selected.map((s) => (
              <button key={s.id}
                className={`btn btn-sm ${result === true ? 'btn-success' : result === false ? 'btn-danger' : 'btn-cowdi-primary'}`}
                onClick={() => toggleWord(s)}>
                {s.word}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Word bank */}
      <div className="d-flex gap-2 flex-wrap mb-3 justify-content-center">
        {remaining.map((w) => (
          <button key={w.id} className="btn btn-sm btn-outline-secondary" onClick={() => toggleWord(w)}>
            {w.word}
          </button>
        ))}
      </div>

      {result !== null && (
        <div className={`text-center fw-bold mb-3 ${result ? 'text-success' : 'text-danger'}`}>
          {result ? <><Icon name="check" size={18} /> Chính xác!</> : <><Icon name="x" size={18} /> Đáp án: {current.en}</>}
        </div>
      )}

      {/* Check button */}
      {result === null && selected.length > 0 && (
        <div className="text-center">
          <button className="btn btn-cowdi-primary" onClick={checkAnswer}>
            ✓ Kiểm tra
          </button>
        </div>
      )}
    </div>
  );
}

// ── Memory Match Game ────────────────────────────────────────────────────────
function MemoryMatchGame({ onCorrect, onWrong }) {
  const { play } = useSound();

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);
  const pairCount = 6;

  useEffect(() => { initGame(); }, []);

  function initGame() {
    const words = shuffle(ALL_VOCAB).slice(0, pairCount);
    const cardPairs = words.flatMap((w, i) => [
      { id: `en_${i}`, pairId: i, text: w.word, type: 'en' },
      { id: `vi_${i}`, pairId: i, text: w.meaning, type: 'vi' },
    ]);
    setCards(shuffle(cardPairs));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLockBoard(false);
  }

  function handleFlip(idx) {
    if (lockBoard || flipped.includes(idx) || matched.has(cards[idx].pairId)) return;
    play('flip');
    // Speak English card text when revealed
    if (cards[idx].type === 'en') speakText(cards[idx].text);
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLockBoard(true);
      const [a, b] = newFlipped;
      if (cards[a].pairId === cards[b].pairId) {
        play('correct');
        onCorrect?.();
        const newMatched = new Set(matched);
        newMatched.add(cards[a].pairId);
        setMatched(newMatched);
        setFlipped([]);
        setLockBoard(false);
        if (newMatched.size === pairCount) {
          setTimeout(() => {
            play('celebration');
            initGame();
          }, 800);
        }
      } else {
        play('wrong');
        onWrong?.();
        setTimeout(() => { setFlipped([]); setLockBoard(false); }, 800);
      }
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted small fw-semibold">Đã ghép: {matched.size}/{pairCount} cặp</span>
        <span className="badge bg-secondary">Lượt: {moves}</span>
      </div>
      <div className="row g-2">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.has(card.pairId);
          return (
            <div className="col-4 col-md-3" key={card.id}>
              <div
                className={`card text-center shadow-sm ${isFlipped ? (matched.has(card.pairId) ? 'border-success' : 'border-primary') : ''}`}
                style={{ cursor: isFlipped ? 'default' : 'pointer', minHeight: 70, transition: 'all 0.2s', opacity: matched.has(card.pairId) ? 0.6 : 1 }}
                onClick={() => handleFlip(i)}
              >
                <div className="card-body p-2 d-flex align-items-center justify-content-center">
                  {isFlipped ? (
                    <div className="d-flex flex-column align-items-center gap-1">
                      <span className={`fw-bold small ${card.type === 'en' ? 'text-primary' : 'text-success'}`}>{card.text}</span>
                      {card.type === 'en' && (
                        <button className="btn btn-link p-0" style={{ fontSize: '0.75rem', lineHeight: 1 }}
                          onClick={(e) => { e.stopPropagation(); speakText(card.text); }} title="Nghe">
                          <Icon name="sound" size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="fs-4"><Icon name="question" size={24} /></span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Spelling Bee Game ────────────────────────────────────────────────────────
function SpellingBeeGame({ onCorrect, onWrong }) {
  const { play } = useSound();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null); // true/false/null
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);

  const generateRound = useCallback(() => {
    // Pick words with 3-10 chars for reasonable spelling
    const pool = ALL_VOCAB.filter((w) => w.word.length >= 3 && w.word.length <= 12);
    const word = shuffle(pool)[0];
    setCurrent(word);
    setInput('');
    setResult(null);
    setShowHint(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => { generateRound(); }, []);

  const speakWord = useCallback((text, rate = 0.75) => {
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
      u.rate = rate;
      speechSynthesis.speak(u);
    }
  }, []);

  useEffect(() => {
    if (current) speakWord(current.word);
  }, [current]);

  function checkSpelling() {
    if (!input.trim()) return;
    const isCorrect = input.trim().toLowerCase() === current.word.toLowerCase();
    setResult(isCorrect);
    if (isCorrect) {
      setScore((s) => s + 1);
      play('correct');
      onCorrect?.();
    } else {
      play('wrong');
      onWrong?.();
    }
    setTimeout(() => {
      setRound((r) => r + 1);
      generateRound();
    }, 1500);
  }

  if (!current) return null;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted small fw-semibold">Từ {round + 1}</span>
        <span className="badge bg-warning text-dark">Điểm: {score}</span>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body text-center py-4">
          <div className="fs-1 mb-2 emoji-big"><Icon name="bee" size={44} /></div>
          <p className="text-muted mb-2">Nghĩa: <strong>{current.meaning}</strong></p>
          {current.phonetic && <p className="text-muted small mb-2">{current.phonetic}</p>}
          <div className="d-flex gap-2 justify-content-center mb-3">
            <button className="btn btn-cowdi-primary" onClick={() => speakWord(current.word)}>
              <Icon name="sound" size={18} /> Nghe
            </button>
            <button className="btn btn-outline-cowdi" onClick={() => speakWord(current.word, 0.45)}>
              <Icon name="snail" size={18} /> Chậm
            </button>
            <button className="btn btn-outline-secondary" onClick={() => setShowHint(true)} disabled={showHint}>
              <Icon name="bulb" size={18} /> Gợi ý
            </button>
          </div>
          {showHint && (
            <div className="alert alert-light py-1 mb-3">
              <small>{current.word[0]}{'_'.repeat(current.word.length - 2)}{current.word[current.word.length - 1]} ({current.word.length} chữ cái)</small>
            </div>
          )}
          <div className="input-group" style={{ maxWidth: 300, margin: '0 auto' }}>
            <input
              ref={inputRef}
              type="text"
              className={`form-control text-center fw-bold ${result === true ? 'is-valid' : result === false ? 'is-invalid' : ''}`}
              placeholder="Nhập từ..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && result === null && checkSpelling()}
              disabled={result !== null}
              autoComplete="off"
              spellCheck="false"
            />
            <button className="btn btn-cowdi-primary" onClick={checkSpelling} disabled={result !== null || !input.trim()}>
              ✓
            </button>
          </div>
          {result === false && (
            <div className="text-danger small mt-2">Đáp án: <strong>{current.word}</strong></div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Speed Match Game ─────────────────────────────────────────────────────────
function SpeedMatchGame({ onCorrect, onWrong }) {
  const { play } = useSound();

  const [phase, setPhase] = useState('ready'); // ready | playing
  const [current, setCurrent] = useState(null);   // { word, meaning, ... }
  const [choices, setChoices] = useState([]);      // 4 options
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [qTimer, setQTimer] = useState(5);         // per-question countdown
  const [flash, setFlash] = useState(null);        // null | 'correct' | 'wrong'
  const [frozen, setFrozen] = useState(false);     // 400ms button lock after new question
  const [selected, setSelected] = useState(null);  // index of tapped choice
  const qRef = useRef(null);

  function generateQuestion() {
    const pool = shuffle(ALL_VOCAB);
    const correct = pool[0];
    const opts = shuffle([correct, ...pool.slice(1, 4)]);
    setCurrent(correct);
    setChoices(opts);
    setQTimer(5);
    setFlash(null);
    setSelected(null);
    setFrozen(true);
    setTimeout(() => setFrozen(false), 400);
    speakText(correct.word);
  }

  function startGame() {
    setPhase('playing');
    setScore(0);
    setStreak(0);
    setTotal(0);
    generateQuestion();
  }

  // Per-question 5s countdown → auto-skip on timeout
  useEffect(() => {
    if (phase !== 'playing' || flash !== null) return;
    if (qTimer <= 0) {
      setFlash('wrong');
      setTotal((t) => t + 1);
      setStreak(0);
      play('wrong');
      onWrong?.();
      setTimeout(generateQuestion, 800);
      return;
    }
    qRef.current = setTimeout(() => setQTimer((t) => t - 1), 1000);
    return () => clearTimeout(qRef.current);
  }, [qTimer, phase, flash]);

  function handleChoice(idx) {
    if (frozen || phase !== 'playing' || flash !== null) return;
    clearTimeout(qRef.current);
    setSelected(idx);
    setTotal((t) => t + 1);
    if (choices[idx]?.word === current?.word) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setFlash('correct');
      play('correct');
      onCorrect?.();
    } else {
      setStreak(0);
      setFlash('wrong');
      play('wrong');
      onWrong?.();
    }
    setTimeout(generateQuestion, 800);
  }

  if (phase === 'ready') {
    return (
      <div className="text-center py-5" style={{ maxWidth: 420, margin: '0 auto' }}>
        <div className="fs-1 mb-3 emoji-big"><Icon name="bolt" size={44} /></div>
        <h4 className="fw-bold">Tốc độ ánh sáng</h4>
        <p className="text-muted mb-1">Từ tiếng Anh hiện lên — chọn <strong>nghĩa đúng</strong> trong 4 đáp án.</p>
        <p className="text-muted">Mỗi câu có <strong>5 giây</strong>. Đấu sinh tử tới khi K.O!</p>
        <button className="btn btn-cowdi-primary btn-lg" onClick={startGame}><Icon name="rocket" size={20} /> Bắt đầu!</button>
      </div>
    );
  }

  const qPct = (qTimer / 5) * 100;
  const qColor = qTimer <= 2 ? '#e17055' : qTimer <= 3 ? '#fdcb6e' : '#00b894';

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      {/* Header bar */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-muted small fw-semibold">Câu {total + 1}</span>
        <span className="badge bg-warning text-dark fs-6"><Icon name="check" size={14} /> {score}</span>
        {streak >= 3 && <span className="badge bg-danger fs-6"><Icon name="fire" size={14} /> {streak}</span>}
      </div>

      {/* Per-question timer bar */}
      <div className="progress mb-3" style={{ height: 6 }}>
        <div
          className="progress-bar"
          style={{ width: `${qPct}%`, backgroundColor: qColor, transition: 'width 1s linear, background-color 0.3s' }}
        />
      </div>

      {/* Word card */}
      {current && (
        <div
          className={`card shadow-sm mb-3 border-2 ${flash === 'correct' ? 'border-success bg-success bg-opacity-10' : flash === 'wrong' ? 'border-danger bg-danger bg-opacity-10' : 'border-0'}`}
          style={{ transition: 'background 0.2s' }}
        >
          <div className="card-body text-center py-4">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <h2 className="fw-bold text-cowdi-primary mb-0">{current.word}</h2>
              <SpeakBtn text={current.word} />
            </div>
            {flash === 'correct' && <div className="text-success fw-bold mt-2"><Icon name="check" size={16} /> Chính xác!</div>}
            {flash === 'wrong' && selected !== null && (
              <div className="text-danger small mt-2"><Icon name="x" size={14} /> Đáp án đúng: <strong>{current.meaning}</strong></div>
            )}
            {flash === 'wrong' && selected === null && (
              <div className="text-danger small mt-2"><Icon name="clock" size={14} /> Hết giờ! Đáp án: <strong>{current.meaning}</strong></div>
            )}
          </div>
        </div>
      )}

      {/* 4 choices */}
      <div className="row g-2">
        {choices.map((c, i) => {
          let variant = 'outline-secondary';
          if (flash !== null) {
            if (c.word === current?.word) variant = 'success';
            else if (i === selected && flash === 'wrong') variant = 'danger';
          }
          return (
            <div className="col-6" key={i}>
              <button
                className={`btn btn-${variant} w-100 text-start py-2 px-3`}
                style={{ fontSize: '0.88rem', minHeight: 52, opacity: frozen ? 0.6 : 1 }}
                onClick={() => handleChoice(i)}
                disabled={frozen || flash !== null}
              >
                {c.meaning}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Word Scramble Game ───────────────────────────────────────────────────────
function WordScrambleGame({ onCorrect, onWrong }) {
  const { play } = useSound();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(null);
  const [scrambled, setScrambled] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);

  const generateRound = useCallback(() => {
    const pool = ALL_VOCAB.filter((w) => w.word.length >= 4 && w.word.length <= 10 && /^[a-zA-Z]+$/.test(w.word));
    const word = shuffle(pool)[0];
    let letters = shuffle(word.word.split(''));
    // Ensure scrambled != original
    let attempts = 0;
    while (letters.join('') === word.word && attempts < 10) {
      letters = shuffle(word.word.split(''));
      attempts++;
    }
    setCurrent(word);
    setScrambled(letters.map((ch, i) => ({ ch, id: `${ch}_${i}` })));
    setSelected([]);
    setResult(null);
  }, []);

  useEffect(() => { generateRound(); }, []);

  function toggleLetter(letterObj) {
    if (result !== null) return;
    play('pop');
    if (selected.find((s) => s.id === letterObj.id)) {
      setSelected(selected.filter((s) => s.id !== letterObj.id));
    } else {
      const newSelected = [...selected, letterObj];
      setSelected(newSelected);
      // Auto-check when all letters placed
      if (newSelected.length === scrambled.length) {
        const answer = newSelected.map((s) => s.ch).join('');
        const correct = answer.toLowerCase() === current.word.toLowerCase();
        setResult(correct);
        if (correct) { setScore((s) => s + 1); play('correct'); onCorrect?.(); }
        else { play('wrong'); onWrong?.(); }
        setTimeout(() => {
          setRound((r) => r + 1);
          generateRound();
        }, 1200);
      }
    }
  }

  if (!current) return null;

  const remaining = scrambled.filter((l) => !selected.find((s) => s.id === l.id));

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted small fw-semibold">Từ {round + 1}</span>
        <span className="badge bg-warning text-dark">Điểm: {score}</span>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body text-center py-4">
          <p className="text-muted mb-2">Nghĩa: <strong>{current.meaning}</strong></p>
          {current.phonetic && <p className="text-muted small mb-1">{current.phonetic}</p>}
          {result !== null && (
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span className="text-muted small fst-italic">{current.word}</span>
              <SpeakBtn text={current.word} label={<Icon name="sound" size={16} />} />
              <SpeakBtn text={current.word} rate={0.5} label={<Icon name="snail" size={16} />} />
            </div>
          )}

          {/* Answer slots */}
          <div className="d-flex gap-1 justify-content-center mb-3 flex-wrap">
            {selected.length > 0 ? selected.map((s) => (
              <button key={s.id}
                className={`btn btn-sm fw-bold ${result === true ? 'btn-success' : result === false ? 'btn-danger' : 'btn-cowdi-primary'}`}
                style={{ width: 36, height: 40, fontSize: '1.1rem' }}
                onClick={() => toggleLetter(s)} disabled={result !== null}>
                {s.ch}
              </button>
            )) : (
              scrambled.map((_, i) => (
                <div key={i} className="border rounded d-inline-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 40, borderStyle: 'dashed' }}>
                  <span className="text-muted">_</span>
                </div>
              ))
            )}
          </div>

          {result === false && (
            <div className="text-danger small mb-2">Đáp án: <strong>{current.word}</strong></div>
          )}

          {/* Letter bank */}
          <div className="d-flex gap-1 justify-content-center flex-wrap">
            {remaining.map((l) => (
              <button key={l.id}
                className="btn btn-outline-secondary fw-bold"
                style={{ width: 40, height: 44, fontSize: '1.2rem' }}
                onClick={() => toggleLetter(l)}>
                {l.ch}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
