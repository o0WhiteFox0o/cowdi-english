import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { LESSONS } from '../../data/lessons';
import { EXAM_LESSONS } from '../../data/exam/index';
import { usePet } from '../../hooks/usePet';
import { useUser } from '../../hooks/useUser';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import { PET_REGISTRY, getPetEvolution } from '../../data/pets';
import TyperSharkGame from './TyperShark/TyperSharkGame';

const COWDI_JUNIOR_IMG = '/assets/images/pets/Cowdi/Cowdi_junior.webp';

function resolvePetImg(speciesId, xp) {
  if (!speciesId) return null;
  const evo = getPetEvolution(speciesId, xp || 0);
  return evo?.image || null;
}

function hpColor(hp) {
  if (hp > 60) return '#2ecc71';
  if (hp > 30) return '#f39c12';
  return '#e74c3c';
}

// ── Compact Battle Arena ─────────────────────────────────────────────────────
function MiniGameArena({ playerHp, opponentHp, battleAnim, damagePopup, myPetImg, myPetEmoji }) {
  return (
    <div className="battle-arena mb-3" style={{ minHeight: 200 }}>
      <div className="battle-ground-line"></div>

      {/* Opponent HUD */}
      <div className="battle-hud battle-hud-opponent">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="fw-bold" style={{ fontSize: '0.75rem' }}>Cowdi Jr.</span>
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>{opponentHp}/100</span>
        </div>
        <div className="hp-bar">
          <div className="hp-bar-fill" style={{ width: `${opponentHp}%`, backgroundColor: hpColor(opponentHp) }}></div>
        </div>
      </div>

      {/* Player HUD */}
      <div className="battle-hud battle-hud-mine">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="fw-bold" style={{ fontSize: '0.75rem' }}>Tôi</span>
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>{playerHp}/100</span>
        </div>
        <div className="hp-bar">
          <div className="hp-bar-fill" style={{ width: `${playerHp}%`, backgroundColor: hpColor(playerHp) }}></div>
        </div>
      </div>

      {/* My Pet */}
      <div className={`battle-pet battle-pet-mine ${
        battleAnim === 'attack-mine' ? 'anim-attack-mine' :
        battleAnim === 'damage-mine' ? 'anim-damage' :
        playerHp <= 0 ? 'anim-faint' : ''
      }`}>
        {myPetImg ? (
          <img src={myPetImg} alt="My pet" />
        ) : (
          <div className="pet-emoji-lg">{myPetEmoji || '🐮'}</div>
        )}
      </div>

      {/* Opponent: Cowdi Junior */}
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
          {damagePopup.isCritical ? '💥 ' : ''}-{damagePopup.amount}
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
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  speechSynthesis.speak(u);
}

function SpeakBtn({ text, rate = 0.9, size = 'sm', label = '🔊' }) {
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
  { id: 'word-catch',      icon: '🎯', title: 'Cowdi Bắt Từ',    desc: 'Chọn nghĩa đúng cho từ rơi xuống!',   color: '#6C5CE7' },
  { id: 'sentence-puzzle', icon: '🧩', title: 'Ghép câu',         desc: 'Sắp xếp từ thành câu đúng!',          color: '#00B894' },
  { id: 'memory-match',    icon: '🃏', title: 'Lật thẻ nhớ',      desc: 'Ghép cặp từ Anh-Việt bằng trí nhớ!',  color: '#FDCB6E' },
  { id: 'spelling-bee',    icon: '🐝', title: 'Spelling Bee',      desc: 'Nghe từ và đánh vần chính xác!',       color: '#E17055' },
  { id: 'speed-match',     icon: '⚡', title: 'Tốc độ ánh sáng',  desc: 'Ghép từ nhanh nhất trong 60s!',        color: '#0984E3' },
  { id: 'word-scramble',   icon: '🔤', title: 'Xáo chữ',          desc: 'Sắp xếp lại chữ cái thành từ đúng!',  color: '#A29BFE' },
  { id: 'typershark',      icon: '🦈', title: 'TyperShark',        desc: 'Gõ tiêu diệt cá mập! Luyện typing siêu tốc!', color: '#0066ff' },
];

export default function MiniGamePage() {
  const [game, setGame] = useState(null);
  const { petData } = usePet();

  // Battle state
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [battleAnim, setBattleAnim] = useState(null);
  const [damagePopup, setDamagePopup] = useState(null);
  const battleAnimRef = useRef(null);

  const myPetInfo = useMemo(() => {
    const pet = petData?.collection?.[petData?.activePetId];
    if (!pet) return { emoji: '🐮', speciesId: null, xp: 0 };
    const species = PET_REGISTRY[pet.speciesId];
    const evo = getPetEvolution(pet.speciesId, pet.totalXpEarned || 0);
    return {
      emoji: evo?.emoji || species?.emoji || '🐮',
      speciesId: pet.speciesId,
      xp: pet.totalXpEarned || 0,
    };
  }, [petData]);

  const myPetImg = useMemo(() => resolvePetImg(myPetInfo.speciesId, myPetInfo.xp), [myPetInfo]);

  function resetBattle() {
    setPlayerHp(100);
    setOpponentHp(100);
    setBattleAnim(null);
    setDamagePopup(null);
  }

  function handleCorrect() {
    clearTimeout(battleAnimRef.current);
    setBattleAnim('attack-mine');
    const dmg = Math.floor(Math.random() * 6) + 8; // 8-13
    setDamagePopup({ target: 'opponent', amount: dmg, isCritical: false });
    setOpponentHp((h) => Math.max(5, h - dmg));
    battleAnimRef.current = setTimeout(() => {
      setBattleAnim(null);
      setDamagePopup(null);
    }, 700);
  }

  function handleWrong() {
    clearTimeout(battleAnimRef.current);
    setBattleAnim('attack-opponent');
    const dmg = Math.floor(Math.random() * 5) + 6; // 6-10
    setDamagePopup({ target: 'mine', amount: dmg, isCritical: false });
    setPlayerHp((h) => Math.max(5, h - dmg));
    battleAnimRef.current = setTimeout(() => {
      setBattleAnim(null);
      setDamagePopup(null);
    }, 700);
  }

  function startGame(id) {
    resetBattle();
    setGame(id);
  }

  if (!game) {
    return (
      <div className="fade-in">
        <div className="text-center mb-4">
          <h2 className="fw-bold">🎮 Mini Games</h2>
          <p className="text-muted">Chơi game vui mà vẫn học tiếng Anh!</p>
        </div>
        <div className="row g-3 justify-content-center" style={{ maxWidth: 700, margin: '0 auto' }}>
          {GAMES.map((g) => (
            <div className="col-6 col-md-4" key={g.id}>
              <div className="card text-center card-hover shadow-sm h-100" style={{ cursor: 'pointer', borderTop: `3px solid ${g.color}` }}
                onClick={() => startGame(g.id)} role="button">
                <div className="card-body py-4">
                  <div className="fs-1 mb-2">{g.icon}</div>
                  <h6 className="card-title fw-bold">{g.title}</h6>
                  <p className="card-text text-muted small mb-0">{g.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TyperShark — full-screen, bypass battle arena
  if (game === 'typershark') {
    return <TyperSharkGame onExit={() => setGame(null)} />;
  }

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
      />

      {game === 'word-catch' && <WordCatchGame onCorrect={handleCorrect} onWrong={handleWrong} />}
      {game === 'sentence-puzzle' && <SentencePuzzleGame onCorrect={handleCorrect} onWrong={handleWrong} />}
      {game === 'memory-match' && <MemoryMatchGame onCorrect={handleCorrect} onWrong={handleWrong} />}
      {game === 'spelling-bee' && <SpellingBeeGame onCorrect={handleCorrect} onWrong={handleWrong} />}
      {game === 'speed-match' && <SpeedMatchGame onCorrect={handleCorrect} onWrong={handleWrong} />}
      {game === 'word-scramble' && <WordScrambleGame onCorrect={handleCorrect} onWrong={handleWrong} />}
    </div>
  );
}

// ── Word Catch Game ──────────────────────────────────────────────────────────
function WordCatchGame({ onCorrect, onWrong }) {
  const { addXP } = useUser();
  const { onQuizComplete, addCoins } = usePet();
  const showToast = useToast();
  const { play } = useSound();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [total] = useState(10);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [answered, setAnswered] = useState(null);
  const [finished, setFinished] = useState(false);
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
    if (finished || answered !== null || !current) return;
    if (timeLeft > 0) {
      if (timeLeft <= 3) play('tickUrgent'); else play('tick');
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    // Time out
    play('wrong');
    onWrong?.();
    setAnswered(-1);
    setTimeout(() => nextRound(), 1200);
  }, [timeLeft, finished, answered, current]);

  function handleAnswer(meaning) {
    if (answered !== null) return;
    const correct = meaning === current.meaning;
    setAnswered(meaning);
    if (correct) { setScore((s) => s + 1); play('correct'); onCorrect?.(); }
    else { play('wrong'); onWrong?.(); }
    setTimeout(() => nextRound(), 1000);
  }

  function nextRound() {
    if (round + 1 >= total) {
      setFinished(true);
      const xp = score * 5;
      addXP(xp);
      onQuizComplete('vocab', score, total);
      if (score >= 8) addCoins(15);
      score >= 8 ? play('perfect') : play('celebration');
      showToast(`+${xp} XP! ${score >= 8 ? '+15🪙' : ''} 🎮`, 'success');
    } else {
      setRound((r) => r + 1);
      generateRound();
    }
  }

  if (finished) {
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: '4rem' }}>{score >= 8 ? '🏆' : score >= 5 ? '👍' : '💪'}</div>
        <h3 className="fw-bold mt-2">Kết quả: {score}/{total}</h3>
        <div className="badge bg-warning text-dark fs-5 my-2">+{score * 5} XP</div>
        <div>
          <button className="btn btn-cowdi-primary mt-3" onClick={() => { setRound(0); setScore(0); setFinished(false); generateRound(); }}>
            Chơi lại
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted small">Câu {round + 1}/{total}</span>
        <span className="badge bg-warning text-dark">Điểm: {score}</span>
        <span className={`badge ${timeLeft <= 3 ? 'bg-danger' : 'bg-secondary'}`}>⏱ {timeLeft}s</span>
      </div>

      <div className="progress mb-3" style={{ height: 6 }}>
        <div className="progress-bar progress-bar-cowdi" style={{ width: `${((round + 1) / total) * 100}%` }}></div>
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
  const { addXP } = useUser();
  const { onQuizComplete, addCoins } = usePet();
  const showToast = useToast();
  const { play } = useSound();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [total] = useState(8);
  const [current, setCurrent] = useState(null);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [finished, setFinished] = useState(false);

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
      if (round + 1 >= total) {
        setFinished(true);
        const xp = score * 8;
        addXP(xp);
        onQuizComplete('sentences', correct ? score + 1 : score, total);
        if (score >= 6) addCoins(15);
        score >= 6 ? play('perfect') : play('celebration');
        showToast(`+${xp} XP! 🧩`, 'success');
      } else {
        setRound((r) => r + 1);
        generateRound();
      }
    }, 1500);
  }

  if (finished) {
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: '4rem' }}>{score >= 6 ? '🏆' : score >= 4 ? '👍' : '💪'}</div>
        <h3 className="fw-bold mt-2">Kết quả: {score}/{total}</h3>
        <div className="badge bg-warning text-dark fs-5 my-2">+{score * 8} XP</div>
        <div>
          <button className="btn btn-cowdi-primary mt-3" onClick={() => { setRound(0); setScore(0); setFinished(false); generateRound(); }}>
            Chơi lại
          </button>
        </div>
      </div>
    );
  }

  if (!current) return <div className="text-center text-muted">Đang tải...</div>;

  const remaining = shuffledWords.filter((w) => !selected.find((s) => s.id === w.id));

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted small">Câu {round + 1}/{total}</span>
        <span className="badge bg-warning text-dark">Điểm: {score}</span>
      </div>

      <div className="progress mb-3" style={{ height: 6 }}>
        <div className="progress-bar progress-bar-cowdi" style={{ width: `${((round + 1) / total) * 100}%` }}></div>
      </div>

      {/* Vietnamese hint */}
      <div className="card shadow-sm mb-3">
        <div className="card-body text-center py-3">
          <div className="text-muted small">Dịch câu này sang tiếng Anh:</div>
          <div className="fs-5 fw-bold">{current.vi}</div>
          {result !== null && (
            <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
              <span className="text-muted small fst-italic">{current.en}</span>
              <SpeakBtn text={current.en} label="🔊 Nghe câu" size="sm" />
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
          {result ? '✅ Chính xác!' : `❌ Đáp án: ${current.en}`}
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
  const { addXP } = useUser();
  const { onQuizComplete, addCoins } = usePet();
  const showToast = useToast();
  const { play } = useSound();

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);
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
    setFinished(false);
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
            setFinished(true);
            const stars = moves <= pairCount * 2 ? 3 : moves <= pairCount * 3 ? 2 : 1;
            const xp = stars * 15;
            addXP(xp);
            onQuizComplete('vocab', pairCount, pairCount);
            if (stars >= 2) addCoins(10);
            play('celebration');
            showToast(`+${xp} XP! ${stars >= 2 ? '+10🪙' : ''} 🃏`, 'success');
          }, 400);
        }
      } else {
        play('wrong');
        onWrong?.();
        setTimeout(() => { setFlipped([]); setLockBoard(false); }, 800);
      }
    }
  }

  if (finished) {
    const stars = moves <= pairCount * 2 ? 3 : moves <= pairCount * 3 ? 2 : 1;
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: '4rem' }}>{stars === 3 ? '🌟' : stars === 2 ? '⭐' : '👍'}</div>
        <h3 className="fw-bold mt-2">Hoàn thành!</h3>
        <p className="text-muted">{moves} lượt lật · {stars} sao</p>
        <div className="badge bg-warning text-dark fs-5 my-2">+{stars * 15} XP</div>
        <div><button className="btn btn-cowdi-primary mt-3" onClick={initGame}>Chơi lại</button></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted small">Ghép {pairCount} cặp</span>
        <span className="badge bg-secondary">Lượt: {moves}</span>
        <span className="badge bg-success">{matched.size}/{pairCount} cặp</span>
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
                          🔊
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="fs-4">❓</span>
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
  const { addXP } = useUser();
  const { onQuizComplete, addCoins } = usePet();
  const showToast = useToast();
  const { play } = useSound();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [total] = useState(10);
  const [current, setCurrent] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null); // true/false/null
  const [finished, setFinished] = useState(false);
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
      const u = new SpeechSynthesisUtterance(text);
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
      if (round + 1 >= total) {
        setFinished(true);
        const finalScore = isCorrect ? score + 1 : score;
        const xp = finalScore * 8;
        addXP(xp);
        onQuizComplete('vocab', finalScore, total);
        if (finalScore >= 7) addCoins(15);
        finalScore >= 7 ? play('perfect') : play('celebration');
        showToast(`+${xp} XP! ${finalScore >= 7 ? '+15🪙' : ''} 🐝`, 'success');
      } else {
        setRound((r) => r + 1);
        generateRound();
      }
    }, 1500);
  }

  if (finished) {
    const finalScore = score;
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: '4rem' }}>{finalScore >= 8 ? '🏆' : finalScore >= 5 ? '🐝' : '💪'}</div>
        <h3 className="fw-bold mt-2">Kết quả: {finalScore}/{total}</h3>
        <div className="badge bg-warning text-dark fs-5 my-2">+{finalScore * 8} XP</div>
        <div><button className="btn btn-cowdi-primary mt-3" onClick={() => { setRound(0); setScore(0); setFinished(false); generateRound(); }}>Chơi lại</button></div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted small">Từ {round + 1}/{total}</span>
        <span className="badge bg-warning text-dark">Điểm: {score}</span>
      </div>
      <div className="progress mb-3" style={{ height: 6 }}>
        <div className="progress-bar progress-bar-cowdi" style={{ width: `${((round + 1) / total) * 100}%` }}></div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body text-center py-4">
          <div className="fs-1 mb-2">🐝</div>
          <p className="text-muted mb-2">Nghĩa: <strong>{current.meaning}</strong></p>
          {current.phonetic && <p className="text-muted small mb-2">{current.phonetic}</p>}
          <div className="d-flex gap-2 justify-content-center mb-3">
            <button className="btn btn-cowdi-primary" onClick={() => speakWord(current.word)}>
              🔊 Nghe
            </button>
            <button className="btn btn-outline-cowdi" onClick={() => speakWord(current.word, 0.45)}>
              🐌 Chậm
            </button>
            <button className="btn btn-outline-secondary" onClick={() => setShowHint(true)} disabled={showHint}>
              💡 Gợi ý
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
  const { addXP } = useUser();
  const { onQuizComplete, addCoins } = usePet();
  const showToast = useToast();
  const { play } = useSound();

  const [phase, setPhase] = useState('ready'); // ready | playing | finished
  const [current, setCurrent] = useState(null);   // { word, meaning, ... }
  const [choices, setChoices] = useState([]);      // 4 options
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);   // global timer
  const [qTimer, setQTimer] = useState(5);         // per-question countdown
  const [flash, setFlash] = useState(null);        // null | 'correct' | 'wrong'
  const [frozen, setFrozen] = useState(false);     // 400ms button lock after new question
  const [selected, setSelected] = useState(null);  // index of tapped choice
  const globalRef = useRef(null);
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
    setTimeLeft(60);
    generateQuestion();
  }

  // Global 60s countdown
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      setPhase('finished');
      const xp = score * 4;
      addXP(xp);
      onQuizComplete('vocab', score, Math.max(total, score));
      if (score >= 15) addCoins(20);
      else if (score >= 8) addCoins(10);
      play('celebration');
      showToast(`+${xp} XP! ⚡`, 'success');
      return;
    }
    globalRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(globalRef.current);
  }, [timeLeft, phase]);

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
        <div className="fs-1 mb-3">⚡</div>
        <h4 className="fw-bold">Tốc độ ánh sáng</h4>
        <p className="text-muted mb-1">Từ tiếng Anh hiện lên — chọn <strong>nghĩa đúng</strong> trong 4 đáp án.</p>
        <p className="text-muted">Mỗi câu có <strong>5 giây</strong>. Tổng thời gian <strong>60 giây</strong>!</p>
        <button className="btn btn-cowdi-primary btn-lg" onClick={startGame}>🚀 Bắt đầu!</button>
      </div>
    );
  }

  if (phase === 'finished') {
    const acc = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: '4rem' }}>{score >= 20 ? '🏆' : score >= 12 ? '⚡' : '💪'}</div>
        <h3 className="fw-bold mt-2">{score} câu đúng / {total} câu</h3>
        <div className="text-muted mb-2">Độ chính xác: {acc}%</div>
        <div className="badge bg-warning text-dark fs-5 my-2">+{score * 4} XP</div>
        <div><button className="btn btn-cowdi-primary mt-3" onClick={startGame}>Chơi lại</button></div>
      </div>
    );
  }

  const qPct = (qTimer / 5) * 100;
  const qColor = qTimer <= 2 ? '#e17055' : qTimer <= 3 ? '#fdcb6e' : '#00b894';

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      {/* Header bar */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className={`badge ${timeLeft <= 10 ? 'bg-danger' : 'bg-secondary'} fs-6`}>⏱ {timeLeft}s</span>
        <span className="badge bg-warning text-dark fs-6">✅ {score}</span>
        {streak >= 3 && <span className="badge bg-danger fs-6">🔥 {streak}</span>}
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
            {flash === 'correct' && <div className="text-success fw-bold mt-2">✅ Chính xác!</div>}
            {flash === 'wrong' && selected !== null && (
              <div className="text-danger small mt-2">❌ Đáp án đúng: <strong>{current.meaning}</strong></div>
            )}
            {flash === 'wrong' && selected === null && (
              <div className="text-danger small mt-2">⏰ Hết giờ! Đáp án: <strong>{current.meaning}</strong></div>
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
  const { addXP } = useUser();
  const { onQuizComplete, addCoins } = usePet();
  const showToast = useToast();
  const { play } = useSound();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [total] = useState(10);
  const [current, setCurrent] = useState(null);
  const [scrambled, setScrambled] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [finished, setFinished] = useState(false);

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
          if (round + 1 >= total) {
            setFinished(true);
            const finalScore = correct ? score + 1 : score;
            const xp = finalScore * 6;
            addXP(xp);
            onQuizComplete('vocab', finalScore, total);
            if (finalScore >= 7) addCoins(12);
            finalScore >= 7 ? play('perfect') : play('celebration');
            showToast(`+${xp} XP! ${finalScore >= 7 ? '+12🪙' : ''} 🔤`, 'success');
          } else {
            setRound((r) => r + 1);
            generateRound();
          }
        }, 1200);
      }
    }
  }

  if (finished) {
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: '4rem' }}>{score >= 8 ? '🏆' : score >= 5 ? '🔤' : '💪'}</div>
        <h3 className="fw-bold mt-2">Kết quả: {score}/{total}</h3>
        <div className="badge bg-warning text-dark fs-5 my-2">+{score * 6} XP</div>
        <div><button className="btn btn-cowdi-primary mt-3" onClick={() => { setRound(0); setScore(0); setFinished(false); generateRound(); }}>Chơi lại</button></div>
      </div>
    );
  }

  if (!current) return null;

  const remaining = scrambled.filter((l) => !selected.find((s) => s.id === l.id));

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted small">Từ {round + 1}/{total}</span>
        <span className="badge bg-warning text-dark">Điểm: {score}</span>
      </div>
      <div className="progress mb-3" style={{ height: 6 }}>
        <div className="progress-bar progress-bar-cowdi" style={{ width: `${((round + 1) / total) * 100}%` }}></div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body text-center py-4">
          <p className="text-muted mb-2">Nghĩa: <strong>{current.meaning}</strong></p>
          {current.phonetic && <p className="text-muted small mb-1">{current.phonetic}</p>}
          {result !== null && (
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span className="text-muted small fst-italic">{current.word}</span>
              <SpeakBtn text={current.word} label="🔊" />
              <SpeakBtn text={current.word} rate={0.5} label="🐌" />
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
