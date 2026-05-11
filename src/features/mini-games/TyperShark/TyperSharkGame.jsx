import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LESSONS } from '../../../data/lessons';
import { useAuth } from '../../../hooks/useAuth';
import {
  COWDI_IMAGES, FOXIE_IMAGES, GINSENG_IMAGES, BAMBOO_IMAGES,
  FLIPPY_IMAGES, LEAFY_IMAGES, LEO_IMAGES, SPARKY_IMAGES,
  OWLBERT_IMAGES, MIMI_IMAGES, PADDY_IMAGES, STORM_IMAGES,
  SPROUT_IMAGES, PINGU_IMAGES, DRACO_IMAGES, PUMPKIN_IMAGES,
} from '../../../data/pets';

// ── TTS: phát âm tiếng Anh khi bắt được pet ──────────────────────────
function speakWord(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    // Huỷ phát âm trước đó để tránh xếp chồng khi combo nhanh
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'en-US';
    u.rate = 1.05;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

// ═════════════════════════════════════════════════════════════════
// Pet Word Run — gõ từ tiếng Anh để ngăn các bé Cowdi trốn mất
// Cảm hứng: TyperShark (Nitrome), Typing of the Dead, ZType
// ═════════════════════════════════════════════════════════════════

// ── Pet roster: mỗi "kẻ thù" là một bé Cowdi ngộ nghĩnh ───────────────
const PET_ROSTER = [
  { name: 'Cowdi',   image: COWDI_IMAGES.junior,   color: '#ff8fb1' },
  { name: 'Foxie',   image: FOXIE_IMAGES.junior,   color: '#ff7a3d' },
  { name: 'Ginseng', image: GINSENG_IMAGES.junior, color: '#d4a056' },
  { name: 'Bamboo',  image: BAMBOO_IMAGES.junior,  color: '#4caf6e' },
  { name: 'Flippy',  image: FLIPPY_IMAGES.junior,  color: '#3da9ff' },
  { name: 'Leafy',   image: LEAFY_IMAGES.junior,   color: '#7ad36b' },
  { name: 'Leo',     image: LEO_IMAGES.junior,     color: '#f6a623' },
  { name: 'Sparky',  image: SPARKY_IMAGES.junior,  color: '#ffcc33' },
  { name: 'Owlbert', image: OWLBERT_IMAGES.junior, color: '#a47cff' },
  { name: 'Mimi',    image: MIMI_IMAGES.junior,    color: '#ff9ec7' },
  { name: 'Lúa',     image: PADDY_IMAGES.junior,   color: '#e6c64a' },
  { name: 'Storm',   image: STORM_IMAGES.junior,   color: '#5e7cff' },
  { name: 'Măng tre',image: SPROUT_IMAGES.junior,  color: '#5fb96a' },
  { name: 'Pingu',   image: PINGU_IMAGES.junior,   color: '#6fb9e8' },
  { name: 'Draco',   image: DRACO_IMAGES.junior,   color: '#c93b3b' },
  { name: 'Pumpkin', image: PUMPKIN_IMAGES.junior, color: '#ff7a1f' },
];
function randomPet() {
  return PET_ROSTER[Math.floor(Math.random() * PET_ROSTER.length)];
}

// ── Word pool with Vietnamese meaning ────────────────────────
const FALLBACK_WORDS = [
  // ≤5
  { en: 'cat',  vi: 'mèo' },         { en: 'dog',   vi: 'chó' },
  { en: 'run',  vi: 'chạy' },        { en: 'fly',   vi: 'bay' },
  { en: 'sun',  vi: 'mặt trời' },    { en: 'hot',   vi: 'nóng' },
  { en: 'cold', vi: 'lạnh' },        { en: 'big',   vi: 'to' },
  { en: 'small',vi: 'nhỏ' },         { en: 'fast',  vi: 'nhanh' },
  { en: 'slow', vi: 'chậm' },        { en: 'good',  vi: 'tốt' },
  { en: 'bad',  vi: 'tệ' },          { en: 'yes',   vi: 'có' },
  { en: 'red',  vi: 'đỏ' },          { en: 'blue',  vi: 'xanh dương' },
  { en: 'green',vi: 'xanh lá' },     { en: 'old',   vi: 'cũ / già' },
  { en: 'new',  vi: 'mới' },         { en: 'book',  vi: 'sách' },
  // 6-8
  { en: 'apple', vi: 'táo' },        { en: 'water', vi: 'nước' },
  { en: 'house', vi: 'nhà' },        { en: 'money', vi: 'tiền' },
  { en: 'happy', vi: 'vui' },        { en: 'angry', vi: 'tức giận' },
  { en: 'learn', vi: 'học' },        { en: 'study', vi: 'học tập' },
  { en: 'speak', vi: 'nói' },        { en: 'write', vi: 'viết' },
  { en: 'listen',vi: 'nghe' },       { en: 'family',vi: 'gia đình' },
  { en: 'school',vi: 'trường học' }, { en: 'friend',vi: 'bạn bè' },
  { en: 'travel',vi: 'du lịch' },    { en: 'animal',vi: 'động vật' },
  // 9+
  { en: 'beautiful',   vi: 'đẹp' },
  { en: 'adventure',   vi: 'phiêu lưu' },
  { en: 'knowledge',   vi: 'kiến thức' },
  { en: 'important',   vi: 'quan trọng' },
  { en: 'different',   vi: 'khác biệt' },
  { en: 'understand',  vi: 'hiểu' },
  { en: 'education',   vi: 'giáo dục' },
  { en: 'environment', vi: 'môi trường' },
  { en: 'technology',  vi: 'công nghệ' },
  { en: 'experience',  vi: 'kinh nghiệm' },
  { en: 'communicate', vi: 'giao tiếp' },
  { en: 'opportunity', vi: 'cơ hội' },
  { en: 'development', vi: 'phát triển' },
  { en: 'vocabulary',  vi: 'từ vựng' },
];

function buildWordPool() {
  const fromLessons = LESSONS.flatMap((l) => l.vocabulary || [])
    .filter((v) => v?.word && v?.meaning)
    .map((v) => ({
      en: String(v.word).trim().toLowerCase(),
      vi: v.meaning,
    }))
    .filter((v) => /^[a-z]+$/.test(v.en) && v.en.length >= 3 && v.en.length <= 14);
  const seen = new Set();
  const out = [];
  for (const w of [...fromLessons, ...FALLBACK_WORDS]) {
    if (seen.has(w.en)) continue;
    seen.add(w.en);
    out.push(w);
  }
  return out;
}

// ── Difficulty presets ───────────────────────────────────────
// speed (%/s): pet chạy từ x=100 về x=0. Thời gian qua màn = 100 / speed.
const DIFFICULTIES = [
  { key: 'easy',   name: 'Dễ',      emoji: '🐤', color: '#28a745',
    speed: 5,  spawnRate: 3500, maxWords: 3, wordLen: [3, 6],  ramp: 0,
    desc: '~20s / từ · tối đa 3 bé' },
  { key: 'medium', name: 'Vừa',     emoji: '🐰', color: '#ffc107',
    speed: 8,  spawnRate: 2800, maxWords: 4, wordLen: [4, 8],  ramp: 0.03,
    desc: '~12s / từ · tối đa 4 bé' },
  { key: 'hard',   name: 'Khó',     emoji: '🐱', color: '#fd7e14',
    speed: 12, spawnRate: 2100, maxWords: 5, wordLen: [5, 11], ramp: 0.05,
    desc: '~8s / từ · tối đa 5 bé' },
  { key: 'insane', name: 'Cực khó', emoji: '🐲', color: '#dc3545',
    speed: 16, spawnRate: 1400, maxWords: 6, wordLen: [5, 14], ramp: 0.07,
    desc: '~6s / từ · tối đa 6 bé' },
];
const RAMP_INTERVAL_MS = 30_000;
const RAMP_MAX = 0.6;
const LANES_Y = [18, 30, 42, 54, 66, 78];
const GAME_DURATION_S = 180; // 3 phút
const LEADERBOARD_KEY = 'cowdi.petwordrun.leaderboard.v1';
const LEADERBOARD_MAX = 10;

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function saveLeaderboardEntry(entry) {
  try {
    const arr = loadLeaderboard();
    arr.push(entry);
    arr.sort((a, b) => b.score - a.score || b.wordsKilled - a.wordsKilled);
    const trimmed = arr.slice(0, LEADERBOARD_MAX);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch { return loadLeaderboard(); }
}

let wordIdCounter = 0;

function pickLane(existingWords) {
  const counts = LANES_Y.map((y) => {
    const inLane = existingWords.filter((w) => w.y === y);
    const nearest = inLane.length ? Math.min(...inLane.map((w) => 100 - w.x)) : Infinity;
    return { y, count: inLane.length, nearest };
  });
  counts.sort((a, b) => a.count - b.count || b.nearest - a.nearest);
  return counts[0].y;
}

// ══════════════════════════════════════════════════════════════
export default function TyperSharkGame({ onExit }) {
  const { user } = useAuth();
  const [gameState, setGameState] = useState('idle');
  const [diffIdx, setDiffIdx]     = useState(1);
  const [words, setWords]         = useState([]);
  const [input, setInput]         = useState('');
  const [score, setScore]         = useState(0);
  const [misses, setMisses]       = useState(0);
  const [combo, setCombo]         = useState(0);
  const [maxCombo, setMaxCombo]   = useState(0);
  const [wordsKilled, setWordsKilled] = useState(0);
  const [keysTyped, setKeysTyped]     = useState(0);
  const [charsKilled, setCharsKilled] = useState(0);
  const [startTime, setStartTime]     = useState(null);
  const [elapsed, setElapsed]         = useState(0);
  const [timeLeft, setTimeLeft]       = useState(GAME_DURATION_S);
  const [particles, setParticles]     = useState([]);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [lastKill, setLastKill]       = useState(null);
  const [lockedId, setLockedId]       = useState(null);
  const [rampMult, setRampMult]       = useState(1);
  const [leaderboard, setLeaderboard] = useState(() => loadLeaderboard());
  const playerName = useMemo(() => {
    if (user?.display_name) return String(user.display_name).slice(0, 24);
    try { return localStorage.getItem('cowdi.petwordrun.playerName') || 'Khách'; } catch { return 'Khách'; }
  }, [user?.display_name]);
  const [scoreSaved, setScoreSaved]   = useState(false);
  const [savedRank, setSavedRank]     = useState(null);

  // Refs để tránh stale closures trong rAF loop
  const inputRef     = useRef(null);
  const gameAreaRef  = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef  = useRef(null);
  const spawnTimerRef= useRef(0);
  const rampTimerRef = useRef(0);
  const rampMultRef  = useRef(1);

  const wordsRef        = useRef([]);
  const missesRef       = useRef(0);
  const scoreRef        = useRef(0);
  const comboRef        = useRef(0);
  const wordsKilledRef  = useRef(0);
  const charsKilledRef  = useRef(0);
  const gameStateRef    = useRef('idle');
  const diffIdxRef      = useRef(1);
  const lockedIdRef     = useRef(null);
  const inputRefVal     = useRef('');

  useEffect(() => { wordsRef.current       = words; }, [words]);
  useEffect(() => { missesRef.current      = misses; }, [misses]);
  useEffect(() => { scoreRef.current       = score; }, [score]);
  useEffect(() => { comboRef.current       = combo; }, [combo]);
  useEffect(() => { wordsKilledRef.current = wordsKilled; }, [wordsKilled]);
  useEffect(() => { charsKilledRef.current = charsKilled; }, [charsKilled]);
  useEffect(() => { gameStateRef.current   = gameState; }, [gameState]);
  useEffect(() => { diffIdxRef.current     = diffIdx; }, [diffIdx]);
  useEffect(() => { lockedIdRef.current    = lockedId; }, [lockedId]);
  useEffect(() => { inputRefVal.current    = input; }, [input]);

  const WORD_POOL = useMemo(() => buildWordPool(), []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const t = setInterval(() => {
      if (!startTime) return;
      const e = (Date.now() - startTime) / 1000;
      setElapsed(e);
      const left = Math.max(0, GAME_DURATION_S - e);
      setTimeLeft(left);
      if (left <= 0) {
        setGameState('gameover');
        gameStateRef.current = 'gameover';
      }
    }, 250);
    return () => clearInterval(t);
  }, [gameState, startTime]);

  // Auto-save điểm khi game kết thúc (không cần nhập tên)
  useEffect(() => {
    if (gameState !== 'gameover' || scoreSaved) return;
    const cfg = DIFFICULTIES[diffIdxRef.current];
    const finalElapsed = (Date.now() - (startTime || Date.now())) / 1000;
    const finalWpm = finalElapsed > 0 ? Math.round((wordsKilledRef.current / finalElapsed) * 60) : 0;
    const finalAcc = keysTyped > 0 ? Math.round((charsKilledRef.current / keysTyped) * 100) : 100;
    const name = playerName || 'Khách';
    try { localStorage.setItem('cowdi.petwordrun.playerName', name); } catch { /* ignore */ }
    const entry = {
      name,
      score: scoreRef.current,
      wordsKilled: wordsKilledRef.current,
      maxCombo,
      wpm: finalWpm,
      accuracy: finalAcc,
      misses: missesRef.current,
      difficulty: cfg.name,
      difficultyKey: cfg.key,
      date: Date.now(),
    };
    const next = saveLeaderboardEntry(entry);
    setLeaderboard(next);
    // Tìm hạng trong filter cùng độ khó
    const filtered = next.filter((e) => e.difficultyKey === cfg.key);
    const rank = filtered.findIndex((e) => e.date === entry.date) + 1;
    setSavedRank(rank > 0 ? rank : null);
    setScoreSaved(true);
  }, [gameState, scoreSaved, playerName, maxCombo, keysTyped, startTime]);

  const triggerShake = () => {
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 500);
  };
  const addParticle = (x, y, text, color = '#ffd700') => {
    const id = Date.now() + Math.random();
    setParticles((prev) => [...prev, { id, x, y, text, color }]);
    setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== id)), 900);
  };
  const flashKill = (word) => {
    setLastKill({ en: word.en, vi: word.vi });
    setTimeout(() => setLastKill((cur) => (cur && cur.en === word.en ? null : cur)), 1400);
  };

  const spawnWord = useCallback(() => {
    const cfg = DIFFICULTIES[diffIdxRef.current];
    if (wordsRef.current.length >= cfg.maxWords) return;
    const pool = WORD_POOL.filter(
      (w) => w.en.length >= cfg.wordLen[0] && w.en.length <= cfg.wordLen[1]
    );
    if (pool.length === 0) return;
    const existing = new Set(wordsRef.current.map((w) => w.en));
    const fresh = pool.filter((w) => !existing.has(w.en));
    const picked = (fresh.length ? fresh : pool)[
      Math.floor(Math.random() * (fresh.length ? fresh.length : pool.length))
    ];
    const y = pickLane(wordsRef.current);
    const speed = cfg.speed * rampMultRef.current * (0.9 + Math.random() * 0.2);
    const newWord = {
      id: ++wordIdCounter,
      en: picked.en,
      vi: picked.vi,
      x: 102,
      y,
      speed,
      pet: randomPet(),
    };
    setWords((prev) => [...prev, newWord]);
    wordsRef.current = [...wordsRef.current, newWord];
  }, [WORD_POOL]);

  const gameLoop = useCallback((ts) => {
    if (gameStateRef.current !== 'playing') return;
    const delta = lastTimeRef.current ? (ts - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = ts;

    rampTimerRef.current += delta * 1000;
    if (rampTimerRef.current >= RAMP_INTERVAL_MS) {
      rampTimerRef.current = 0;
      const cfg = DIFFICULTIES[diffIdxRef.current];
      rampMultRef.current = Math.min(1 + RAMP_MAX, rampMultRef.current + cfg.ramp);
      setRampMult(rampMultRef.current);
    }

    spawnTimerRef.current += delta * 1000;
    const cfg = DIFFICULTIES[diffIdxRef.current];
    const effSpawn = cfg.spawnRate / rampMultRef.current;
    if (spawnTimerRef.current >= effSpawn) {
      spawnTimerRef.current = 0;
      spawnWord();
    }

    // Đếm số pet thoát trong frame này (có thể >1)
    let escapedCount = 0;
    const moved = wordsRef.current.map((w) => ({ ...w, x: w.x - w.speed * delta }));
    const alive = moved.filter((w) => {
      if (w.x <= 0) { escapedCount += 1; return false; }
      return true;
    });
    wordsRef.current = alive;
    setWords(alive);

    if (escapedCount > 0) {
      const nm = missesRef.current + escapedCount;
      missesRef.current = nm;
      setMisses(nm);
      setCombo(0); comboRef.current = 0;
      if (lockedIdRef.current && !alive.some((w) => w.id === lockedIdRef.current)) {
        setLockedId(null); lockedIdRef.current = null;
        setInput(''); inputRefVal.current = '';
      }
      triggerShake();
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [spawnWord]);

  useEffect(() => {
    if (gameState === 'playing') {
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [gameState, gameLoop]);

  const startGame = (idx = diffIdx) => {
    wordIdCounter = 0;
    setDiffIdx(idx); diffIdxRef.current = idx;
    setWords([]); wordsRef.current = [];
    setInput(''); inputRefVal.current = '';
    setScore(0); scoreRef.current = 0;
    setMisses(0); missesRef.current = 0;
    setCombo(0); comboRef.current = 0;
    setMaxCombo(0);
    setWordsKilled(0); wordsKilledRef.current = 0;
    setCharsKilled(0); charsKilledRef.current = 0;
    setKeysTyped(0);
    setParticles([]);
    setLockedId(null); lockedIdRef.current = null;
    setLastKill(null);
    setStartTime(Date.now()); setElapsed(0);
    setTimeLeft(GAME_DURATION_S);
    setScoreSaved(false);
    setSavedRank(null);
    setLockedId(null); lockedIdRef.current = null;
    setLastKill(null);
    setStartTime(Date.now()); setElapsed(0);
    spawnTimerRef.current = 0;
    rampTimerRef.current = 0;
    rampMultRef.current = 1;
    setRampMult(1);
    lastTimeRef.current = null;
    setGameState('playing'); gameStateRef.current = 'playing';
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      setGameState('paused'); gameStateRef.current = 'paused';
    } else if (gameStateRef.current === 'paused') {
      setGameState('playing'); gameStateRef.current = 'playing';
      lastTimeRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' &&
        (gameStateRef.current === 'playing' || gameStateRef.current === 'paused')) {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePause]);

  const handleInput = (e) => {
    if (gameState !== 'playing') return;
    const raw = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
    const prev = inputRefVal.current;
    const current = wordsRef.current;

    if (raw.length > prev.length) {
      setKeysTyped((k) => k + (raw.length - prev.length));
    }

    // ZType-style active word lock: gõ ký tự đầu → khóa vào từ match prefix gần bờ trái nhất
    let locked = lockedIdRef.current
      ? current.find((w) => w.id === lockedIdRef.current)
      : null;

    if (locked && !locked.en.startsWith(raw)) {
      locked = null;
      setLockedId(null); lockedIdRef.current = null;
    }

    if (!locked && raw.length > 0) {
      const candidates = current
        .filter((w) => w.en.startsWith(raw))
        .sort((a, b) => a.x - b.x);
      if (candidates.length > 0) {
        locked = candidates[0];
        setLockedId(locked.id); lockedIdRef.current = locked.id;
      }
    }

    setInput(raw); inputRefVal.current = raw;

    if (locked && locked.en === raw) {
      killWord(locked);
    }
  };

  const killWord = (word) => {
    const rect = gameAreaRef.current?.getBoundingClientRect();
    const px = (word.x / 100) * (rect?.width || 800);
    const py = (word.y / 100) * (rect?.height || 500);

    const nc = comboRef.current + 1;
    const comboBonus = Math.min(20, Math.floor(nc / 3) * 2);
    const pts = 10 + word.en.length * 2 + comboBonus;
    const nk = wordsKilledRef.current + 1;
    const ns = scoreRef.current + pts;
    const nch = charsKilledRef.current + word.en.length;

    addParticle(px, py, `+${pts}`, nc >= 5 ? '#ff5ac8' : '#ffd700');
    if (nc > 0 && nc % 5 === 0) addParticle(px, py - 24, `COMBO ×${nc}!`, '#ff5ac8');

    comboRef.current = nc;
    wordsKilledRef.current = nk;
    scoreRef.current = ns;
    charsKilledRef.current = nch;

    setCombo(nc);
    setMaxCombo((prev) => Math.max(prev, nc));
    setWordsKilled(nk);
    setScore(ns);
    setCharsKilled(nch);
    setWords((prev) => prev.filter((w) => w.id !== word.id));
    wordsRef.current = wordsRef.current.filter((w) => w.id !== word.id);
    setLockedId(null); lockedIdRef.current = null;
    setInput(''); inputRefVal.current = '';
    flashKill(word);
    // Phát âm tiếng Anh + popup nghĩa (qua flashKill) khi bắt thành công
    speakWord(word.en);
  };

  const cfg = DIFFICULTIES[diffIdx];
  const accuracy = keysTyped > 0 ? Math.round((charsKilled / keysTyped) * 100) : 100;
  const wpm = elapsed > 0 ? Math.round((wordsKilled / elapsed) * 60) : 0;

  return (
    <div style={{
      background: 'radial-gradient(ellipse at top,#0d2d4a 0%,#071a2f 45%,#02060d 100%)',
      minHeight: '100vh', fontFamily: "'Segoe UI',sans-serif", color: '#e0e8ff',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="ts-caustics" />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 18px', background: 'rgba(0,0,0,0.55)',
        borderBottom: '1px solid rgba(0,180,255,0.25)', position: 'relative', zIndex: 5,
      }}>
        <button onClick={onExit} style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.3)',
          color: '#aaa', borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
        }}>← Thoát</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={COWDI_IMAGES.junior} alt="Cowdi" style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(255,200,140,0.6))' }} />
          <span style={{ fontSize: 20, fontWeight: 800, color: '#ffd28f', letterSpacing: 1 }}>Pet Word Run</span>
        </div>
        {gameState === 'playing' || gameState === 'paused' ? (
          <div style={{ display: 'flex', gap: 16, fontSize: 13, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span>⭐ <b style={{ color: '#ffd700' }}>{score}</b></span>
            <span style={{ color: cfg.color, fontWeight: 700 }}>{cfg.emoji} {cfg.name}</span>
            <span title="Thời gian còn lại" style={{
              color: timeLeft <= 30 ? '#ff5466' : timeLeft <= 60 ? '#ffd28f' : '#fff',
              fontWeight: 800, fontVariantNumeric: 'tabular-nums',
              animation: timeLeft <= 10 ? 'ts-pulse 0.6s ease-in-out infinite' : 'none',
            }}>⏳ {Math.floor(timeLeft / 60)}:{String(Math.floor(timeLeft % 60)).padStart(2, '0')}</span>
          </div>
        ) : <div style={{ width: 100 }} />}
      </div>

      {gameState === 'idle' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '80vh', gap: 22, textAlign: 'center',
          padding: '28px 20px', position: 'relative', zIndex: 2,
        }}>
          <img src={COWDI_IMAGES.super} alt="Cowdi" style={{ width: 110, height: 110, objectFit: 'contain', filter: 'drop-shadow(0 6px 24px rgba(255,180,120,0.55))' }} />
          <h1 style={{ fontSize: 34, fontWeight: 800, color: '#ffd28f', margin: 0, letterSpacing: 1 }}>
            Pet Word Run
          </h1>
          <p style={{ color: '#bdb0d0', maxWidth: 480, lineHeight: 1.6, margin: 0 }}>
            Các bé Cowdi tinh nghịch đang chạy từ <b style={{ color: '#ffd28f' }}>phải sang trái</b> để trốn mất —
            gõ đúng từ tiếng Anh trên thẻ để "bắt" bé lại.
            <br />Bạn có <b style={{ color: '#ffd28f' }}>3 phút</b> để bắt càng nhiều bé càng tốt 🐮
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
            gap: 12, maxWidth: 720, width: '100%',
          }}>
            {DIFFICULTIES.map((d, i) => {
              const selected = i === diffIdx;
              return (
                <button
                  key={d.key}
                  onClick={() => setDiffIdx(i)}
                  style={{
                    padding: '14px 14px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${selected ? d.color : 'rgba(255,255,255,0.08)'}`,
                    background: selected ? `${d.color}22` : 'rgba(255,255,255,0.03)',
                    color: '#fff', textAlign: 'left', transition: 'all 0.15s',
                    boxShadow: selected ? `0 0 18px ${d.color}55` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: d.color }}>
                    <span style={{ fontSize: 22 }}>{d.emoji}</span>{d.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#8ea8c8', marginTop: 4 }}>{d.desc}</div>
                  <div style={{ fontSize: 11, color: '#667', marginTop: 2 }}>
                    Dài từ: {d.wordLen[0]}–{d.wordLen[1]} · Ramp +{Math.round(d.ramp * 100)}%/30s
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: 12, color: '#667', maxWidth: 460 }}>
            Phím tắt: <kbd>Esc</kbd> tạm dừng · <kbd>Backspace</kbd> sửa ·
            gõ ký tự đầu của từ nào sẽ <b>khóa</b> vào từ đó.
          </div>

          <button
            onClick={() => startGame(diffIdx)}
            style={{
              padding: '14px 50px', fontSize: 18, fontWeight: 700,
              background: `linear-gradient(135deg,#0066ff,${cfg.color})`,
              color: '#fff', border: 'none', borderRadius: 50, cursor: 'pointer',
              boxShadow: `0 4px 26px ${cfg.color}66`, marginTop: 4,
            }}
          >
            🎮 Bắt đầu · {cfg.name}
          </button>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
            padding: '6px 18px', background: 'rgba(0,0,0,0.35)', fontSize: 12,
            color: '#8ea8c8', gap: 8,
          }}>
            <span>🎯 Bắt được <b style={{ color: '#ffd28f' }}>{wordsKilled}</b></span>
            <span>⚡ Combo <b style={{ color: combo >= 5 ? '#ff5ac8' : combo >= 3 ? '#ffd700' : '#fff' }}>×{combo}</b></span>
            <span>⌨️ WPM <b style={{ color: '#8fe3ff' }}>{wpm}</b></span>
            <span>🎯 Chính xác <b style={{ color: accuracy >= 95 ? '#28ff8a' : '#fff' }}>{accuracy}%</b></span>
            <span>💨 Thoát <b style={{ color: misses > 0 ? '#ff7a8c' : '#fff' }}>{misses}</b></span>
            <span>⏱️ {elapsed.toFixed(0)}s · Ramp ×{rampMult.toFixed(2)}</span>
          </div>

          <div
            ref={gameAreaRef}
            className={shakeScreen ? 'ts-shake' : ''}
            style={{
              position: 'relative',
              height: 'calc(100vh - 180px)',
              overflow: 'hidden',
            }}
          >
            {LANES_Y.map((y) => (
              <div key={y} style={{
                position: 'absolute', left: 0, right: 0, top: `${y}%`,
                borderTop: '1px dashed rgba(0,150,220,0.06)',
              }} />
            ))}

            {/* Danger zone bên trái (bờ) */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: 0, width: '10%',
              background: 'linear-gradient(90deg,rgba(220,53,69,0.25),transparent)',
              borderRight: '1px solid rgba(220,53,69,0.25)',
              pointerEvents: 'none',
            }}>
              <div style={{
                position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%) rotate(-90deg)',
                transformOrigin: 'left', fontSize: 11, letterSpacing: 4, color: 'rgba(255,80,100,0.55)',
              }}>⚠ HÀNG RÀO · DANGER</div>
            </div>

            <div className="ts-bubbles" aria-hidden />

            {words.map((word) => {
              const isLocked = word.id === lockedId;
              const typed = isLocked ? input.length : 0;
              const danger = word.x < 22;
              const runDur = (1.0 / Math.max(0.4, word.speed / 8)).toFixed(2);
              const petColor = word.pet?.color || '#ff8fb1';
              return (
                <div key={word.id} style={{
                  position: 'absolute', left: `${word.x}%`, top: `${word.y}%`,
                  transform: 'translate(-50%,-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  filter: isLocked ? `drop-shadow(0 0 14px ${petColor})` : danger ? 'drop-shadow(0 0 10px #ff4466)' : 'none',
                  zIndex: isLocked ? 10 : 2,
                  transition: 'filter 0.2s',
                }}>
                  {/* Pet card với hào quang tròn */}
                  <div style={{
                    position: 'relative', width: 80, height: 80,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: `radial-gradient(circle, ${petColor}66 0%, ${petColor}22 45%, transparent 70%)`,
                      animation: danger ? 'ts-pulse 0.6s ease-in-out infinite' : 'none',
                    }} />
                    <img
                      src={word.pet.image}
                      alt={word.pet.name}
                      style={{
                        position: 'relative', width: 64, height: 64, objectFit: 'contain',
                        transform: 'scaleX(-1)',
                        animation: `ts-run ${runDur}s ease-in-out infinite`,
                        filter: danger ? 'saturate(1.3) brightness(0.95)' : 'none',
                      }}
                    />
                  </div>
                  {/* Badge từ vựng (gradient pill) */}
                  <div style={{
                    padding: '6px 18px', borderRadius: 999, fontSize: 20, fontWeight: 800,
                    background: isLocked
                      ? `linear-gradient(135deg, #ffd28f, ${petColor})`
                      : danger
                        ? 'linear-gradient(135deg, #ff5466, #c93b3b)'
                        : `linear-gradient(135deg, ${petColor}, #6c5ce7)`,
                    border: `1.5px solid ${isLocked ? '#fff' : 'rgba(255,255,255,0.35)'}`,
                    letterSpacing: 1, whiteSpace: 'nowrap', color: '#fff',
                    boxShadow: isLocked
                      ? `0 4px 14px ${petColor}99`
                      : '0 3px 10px rgba(0,0,0,0.35)',
                    fontFamily: 'ui-monospace,Consolas,monospace',
                    textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                  }}>
                    <span style={{ color: '#fffacc' }}>{word.en.slice(0, typed)}</span>
                    <span>{word.en.slice(typed)}</span>
                  </div>
                </div>
              );
            })}

            {particles.map((p) => (
              <div key={p.id} style={{
                position: 'absolute', left: p.x, top: p.y,
                color: p.color, fontWeight: 800, fontSize: 18,
                pointerEvents: 'none', animation: 'ts-floatUp 0.9s ease-out forwards',
                textShadow: `0 0 10px ${p.color}`,
              }}>{p.text}</div>
            ))}

            {lastKill && (
              <div style={{
                position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(0,20,40,0.9)', border: '1px solid rgba(0,200,255,0.35)',
                padding: '6px 16px', borderRadius: 20, fontSize: 13, zIndex: 20,
                boxShadow: '0 4px 18px rgba(0,200,255,0.2)', animation: 'ts-pop 0.3s ease-out',
              }}>
                <b style={{ color: '#00ffcc' }}>{lastKill.en}</b>
                <span style={{ color: '#8ea8c8' }}> — {lastKill.vi}</span>
              </div>
            )}

            {gameState === 'paused' && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
                backdropFilter: 'blur(4px)',
              }}>
                <div style={{ fontSize: 52 }}>⏸</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>Tạm dừng</div>
                <div style={{ fontSize: 13, color: '#8ea8c8' }}>Esc hoặc nút bên dưới để tiếp tục</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button onClick={togglePause} style={btnPrimary(cfg.color)}>▶ Tiếp tục</button>
                  <button onClick={onExit} style={btnGhost}>🏠 Thoát</button>
                </div>
              </div>
            )}
          </div>

          <div style={{
            padding: '10px 18px', background: 'rgba(0,0,0,0.55)',
            borderTop: '1px solid rgba(0,180,255,0.2)',
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              disabled={gameState !== 'playing'}
              placeholder={lockedId ? '…tiếp tục gõ…' : 'Gõ từ tiếng Anh ở đây…'}
              autoComplete="off" spellCheck="false" autoCapitalize="off"
              style={{
                flex: 1, padding: '12px 16px', fontSize: 18, fontWeight: 600,
                background: 'rgba(0,30,70,0.8)',
                border: `2px solid ${lockedId ? '#00cfff' : 'rgba(0,130,220,0.4)'}`,
                borderRadius: 12, color: '#e0f0ff', outline: 'none', letterSpacing: 2,
                boxShadow: lockedId ? '0 0 16px rgba(0,200,255,0.35)' : 'none',
                fontFamily: 'ui-monospace,Consolas,monospace',
              }}
            />
            <button onClick={togglePause} style={{
              padding: '10px 16px', fontSize: 18,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', borderRadius: 10, cursor: 'pointer',
            }} title="Esc">
              {gameState === 'playing' ? '⏸' : '▶'}
            </button>
          </div>
        </>
      )}

      {gameState === 'gameover' && (
        <GameOverPanel
          cfg={cfg}
          score={score}
          wordsKilled={wordsKilled}
          maxCombo={maxCombo}
          wpm={wpm}
          accuracy={accuracy}
          misses={misses}
          leaderboard={leaderboard}
          playerName={playerName}
          savedRank={savedRank}
          onReplay={() => startGame(diffIdx)}
          onChangeDiff={() => setGameState('idle')}
          onExit={onExit}
        />
      )}

      <style>{`
        @keyframes ts-floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-48px) scale(1.25); }
        }
        @keyframes ts-run {
          0%,100% { transform: scaleX(-1) translateY(0) rotate(0deg); }
          50%     { transform: scaleX(-1) translateY(-4px) rotate(2deg); }
        }
        @keyframes ts-pulse {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50%     { opacity: 1; transform: scale(1.15); }
        }
        @keyframes ts-pop {
          0%   { opacity: 0; transform: translate(-50%,-6px) scale(0.9); }
          100% { opacity: 1; transform: translate(-50%,0) scale(1); }
        }
        @keyframes ts-shake {
          0%,100% { transform: translate(0,0); }
          20%     { transform: translate(-6px,2px); }
          40%     { transform: translate(5px,-2px); }
          60%     { transform: translate(-4px,1px); }
          80%     { transform: translate(3px,0); }
        }
        @keyframes ts-caustics {
          0%,100% { opacity: 0.25; transform: translate(0,0); }
          50%     { opacity: 0.45; transform: translate(-8px,4px); }
        }
        @keyframes ts-bubble {
          0%   { transform: translateY(0) scale(0.6); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(-100vh) scale(1); opacity: 0; }
        }
        .ts-shake { animation: ts-shake 0.5s ease-in-out; }
        .ts-caustics {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 40% 30% at 20% 30%, rgba(0,200,255,0.08), transparent 60%),
            radial-gradient(ellipse 30% 25% at 75% 60%, rgba(0,180,220,0.07), transparent 60%);
          animation: ts-caustics 6s ease-in-out infinite;
        }
        .ts-bubbles::before, .ts-bubbles::after {
          content: ''; position: absolute; bottom: -10px; width: 6px; height: 6px;
          border-radius: 50%; background: rgba(180,220,255,0.35);
          box-shadow: 40px 20px 0 rgba(180,220,255,0.25), 120px 60px 0 rgba(180,220,255,0.3),
                      220px 10px 0 rgba(180,220,255,0.2), 320px 80px 0 rgba(180,220,255,0.25),
                      420px 30px 0 rgba(180,220,255,0.2), 520px 100px 0 rgba(180,220,255,0.3),
                      620px 50px 0 rgba(180,220,255,0.2), 720px 20px 0 rgba(180,220,255,0.25);
          animation: ts-bubble 9s linear infinite;
        }
        .ts-bubbles::after { animation-duration: 13s; animation-delay: -4s; opacity: 0.6; }
        kbd {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2);
          padding: 1px 6px; border-radius: 4px; font-family: ui-monospace,Consolas,monospace;
          font-size: 11px; color: #bcd;
        }
      `}</style>
    </div>
  );
}

const btnPrimary = (c) => ({
  padding: '12px 32px', fontSize: 16, fontWeight: 700,
  background: `linear-gradient(135deg,#0066ff,${c})`,
  color: '#fff', border: 'none', borderRadius: 50, cursor: 'pointer',
  boxShadow: `0 4px 20px ${c}55`,
});
const btnGhost = {
  padding: '12px 32px', fontSize: 16, fontWeight: 600,
  background: 'rgba(255,255,255,0.08)', color: '#ccc',
  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 50, cursor: 'pointer',
};

// ── Game Over Panel với Leaderboard ──────────────────────────────────────────
function GameOverPanel({
  cfg, score, wordsKilled, maxCombo, wpm, accuracy, misses,
  leaderboard, playerName, savedRank,
  onReplay, onChangeDiff, onExit,
}) {
  // Lọc leaderboard theo độ khó vừa chơi (mặc định) + tab "all"
  const [tab, setTab] = useState(cfg.key);
  const filtered = tab === 'all'
    ? leaderboard
    : leaderboard.filter((e) => e.difficultyKey === tab);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start', minHeight: '80vh', gap: 16, textAlign: 'center',
      padding: '24px 16px 40px', position: 'relative', zIndex: 2,
    }}>
      <div style={{ fontSize: 56 }}>🏁</div>
      <h2 style={{ fontSize: 30, fontWeight: 800, color: '#ffd28f', margin: 0 }}>
        Hết giờ! Tổng kết 3 phút
      </h2>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
        gap: 10, maxWidth: 640, width: '100%',
      }}>
        {[
          { icon: '⭐', label: 'Điểm số',      value: score },
          { icon: '🐮', label: 'Pet bắt được', value: wordsKilled },
          { icon: '💨', label: 'Pet thoát',    value: misses },
          { icon: '⚡', label: 'Combo max',    value: `×${maxCombo}` },
          { icon: '⌨️', label: 'WPM',          value: wpm },
          { icon: '🎯', label: 'Chính xác',    value: `${accuracy}%` },
        ].map((s, i) => (
          <div key={i} style={{
            padding: 12, borderRadius: 12,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#aab' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ color: '#28ff8a', fontSize: 14 }}>
        ✓ Đã lưu điểm cho <b>{playerName}</b>
        {savedRank && <span> · Hạng <b>#{savedRank}</b> ({cfg.name})</span>}
      </div>

      {/* Leaderboard */}
      <div style={{
        width: '100%', maxWidth: 640, marginTop: 8,
        background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,210,143,0.25)',
        borderRadius: 14, padding: 14,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10, flexWrap: 'wrap', gap: 8,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffd28f', margin: 0 }}>
            🏆 Bảng xếp hạng
          </h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { key: 'all',    label: 'Tất cả'  },
              { key: 'easy',   label: 'Dễ'      },
              { key: 'medium', label: 'Vừa'     },
              { key: 'hard',   label: 'Khó'     },
              { key: 'insane', label: 'Cực khó' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '4px 10px', fontSize: 12, borderRadius: 999,
                  background: tab === t.key ? 'rgba(255,210,143,0.25)' : 'rgba(255,255,255,0.05)',
                  color: tab === t.key ? '#ffd28f' : '#aab',
                  border: `1px solid ${tab === t.key ? 'rgba(255,210,143,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  cursor: 'pointer', fontWeight: 700,
                }}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ color: '#aab', fontSize: 13, padding: 20, textAlign: 'center' }}>
            Chưa có ai trong bảng xếp hạng. Hãy là người đầu tiên!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 70px 70px 70px',
              fontSize: 11, color: '#aab', padding: '4px 8px', letterSpacing: 1,
            }}>
              <span>#</span><span style={{ textAlign: 'left' }}>Tên · Độ khó</span>
              <span>Điểm</span><span>Pet</span><span>WPM</span>
            </div>
            {filtered.slice(0, 10).map((e, i) => {
              const isMe = e.name === playerName
                && e.score === score && e.difficultyKey === cfg.key;
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
              return (
                <div key={`${e.date}-${i}`} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 70px 70px 70px',
                  alignItems: 'center', padding: '6px 8px', borderRadius: 8,
                  background: isMe ? 'rgba(255,210,143,0.18)' : i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: isMe ? '1px solid rgba(255,210,143,0.5)' : '1px solid transparent',
                  fontSize: 13,
                }}>
                  <span style={{ fontWeight: 800, color: i < 3 ? '#ffd28f' : '#fff' }}>
                    {medal || `${i + 1}`}
                  </span>
                  <span style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <b style={{ color: isMe ? '#ffd28f' : '#fff' }}>{e.name}</b>
                    <span style={{ color: '#889', fontSize: 11 }}> · {e.difficulty}</span>
                  </span>
                  <span style={{ fontWeight: 800, color: '#ffd28f' }}>{e.score}</span>
                  <span>{e.wordsKilled}</span>
                  <span style={{ color: '#8fe3ff' }}>{e.wpm}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onReplay} style={btnPrimary(cfg.color)}>🔄 Chơi lại · {cfg.name}</button>
        <button onClick={onChangeDiff} style={btnGhost}>🎚️ Đổi độ khó</button>
        <button onClick={onExit} style={btnGhost}>🏠 Menu</button>
      </div>

      <div style={{ fontSize: 11, color: '#667', marginTop: 4 }}>
        Bảng xếp hạng lưu cục bộ trên thiết bị này (top 10).
      </div>
    </div>
  );
}
