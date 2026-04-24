import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LESSONS } from '../../../data/lessons';

// ══════════════════════════════════════════════════════════════
// TyperShark — gõ từ tiếng Anh để tiêu diệt cá mập bơi vào bờ
// Cảm hứng: TyperShark (Nitrome), Typing of the Dead, ZType
// ══════════════════════════════════════════════════════════════

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
// speed (%/s): cá mập bơi từ x=100 về x=0. Thời gian qua màn = 100 / speed.
const DIFFICULTIES = [
  { key: 'easy',   name: 'Dễ',      emoji: '🐠', color: '#28a745',
    speed: 5,  spawnRate: 3500, maxWords: 3, wordLen: [3, 6],  ramp: 0,
    desc: '~20s / từ · tối đa 3 cá' },
  { key: 'medium', name: 'Vừa',     emoji: '🐟', color: '#ffc107',
    speed: 8,  spawnRate: 2800, maxWords: 4, wordLen: [4, 8],  ramp: 0.03,
    desc: '~12s / từ · tối đa 4 cá' },
  { key: 'hard',   name: 'Khó',     emoji: '🦈', color: '#fd7e14',
    speed: 12, spawnRate: 2100, maxWords: 5, wordLen: [5, 11], ramp: 0.05,
    desc: '~8s / từ · tối đa 5 cá' },
  { key: 'insane', name: 'Cực khó', emoji: '🐉', color: '#dc3545',
    speed: 16, spawnRate: 1400, maxWords: 6, wordLen: [5, 14], ramp: 0.07,
    desc: '~6s / từ · tối đa 6 cá' },
];
const RAMP_INTERVAL_MS = 30_000;
const RAMP_MAX = 0.6;
const LANES_Y = [18, 30, 42, 54, 66, 78];

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
  const [gameState, setGameState] = useState('idle');
  const [diffIdx, setDiffIdx]     = useState(1);
  const [words, setWords]         = useState([]);
  const [input, setInput]         = useState('');
  const [score, setScore]         = useState(0);
  const [lives, setLives]         = useState(3);
  const [combo, setCombo]         = useState(0);
  const [maxCombo, setMaxCombo]   = useState(0);
  const [wordsKilled, setWordsKilled] = useState(0);
  const [keysTyped, setKeysTyped]     = useState(0);
  const [charsKilled, setCharsKilled] = useState(0);
  const [startTime, setStartTime]     = useState(null);
  const [elapsed, setElapsed]         = useState(0);
  const [particles, setParticles]     = useState([]);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [lastKill, setLastKill]       = useState(null);
  const [lockedId, setLockedId]       = useState(null);
  const [rampMult, setRampMult]       = useState(1);

  // Refs để tránh stale closures trong rAF loop
  const inputRef     = useRef(null);
  const gameAreaRef  = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef  = useRef(null);
  const spawnTimerRef= useRef(0);
  const rampTimerRef = useRef(0);
  const rampMultRef  = useRef(1);

  const wordsRef        = useRef([]);
  const livesRef        = useRef(3);
  const scoreRef        = useRef(0);
  const comboRef        = useRef(0);
  const wordsKilledRef  = useRef(0);
  const charsKilledRef  = useRef(0);
  const gameStateRef    = useRef('idle');
  const diffIdxRef      = useRef(1);
  const lockedIdRef     = useRef(null);
  const inputRefVal     = useRef('');

  useEffect(() => { wordsRef.current       = words; }, [words]);
  useEffect(() => { livesRef.current       = lives; }, [lives]);
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
      if (startTime) setElapsed((Date.now() - startTime) / 1000);
    }, 250);
    return () => clearInterval(t);
  }, [gameState, startTime]);

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

    let escaped = false;
    setWords((prev) => {
      const updated = prev.map((w) => ({ ...w, x: w.x - w.speed * delta }));
      const alive = updated.filter((w) => {
        if (w.x <= -3) { escaped = true; return false; }
        return true;
      });
      wordsRef.current = alive;
      return alive;
    });

    if (escaped) {
      const nl = livesRef.current - 1;
      livesRef.current = nl;
      setLives(nl);
      setCombo(0); comboRef.current = 0;
      if (lockedIdRef.current && !wordsRef.current.some((w) => w.id === lockedIdRef.current)) {
        setLockedId(null); lockedIdRef.current = null;
        setInput(''); inputRefVal.current = '';
      }
      triggerShake();
      if (nl <= 0) {
        setGameState('gameover'); gameStateRef.current = 'gameover';
        return;
      }
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
    setLives(3); livesRef.current = 3;
    setCombo(0); comboRef.current = 0;
    setMaxCombo(0);
    setWordsKilled(0); wordsKilledRef.current = 0;
    setCharsKilled(0); charsKilledRef.current = 0;
    setKeysTyped(0);
    setParticles([]);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 22 }}>🦈</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#00cfff', letterSpacing: 1 }}>TyperShark</span>
        </div>
        {gameState === 'playing' || gameState === 'paused' ? (
          <div style={{ display: 'flex', gap: 16, fontSize: 13, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span>⭐ <b style={{ color: '#ffd700' }}>{score}</b></span>
            <span style={{ color: cfg.color, fontWeight: 700 }}>{cfg.emoji} {cfg.name}</span>
            <span title="Số mạng">{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</span>
          </div>
        ) : <div style={{ width: 100 }} />}
      </div>

      {gameState === 'idle' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '80vh', gap: 22, textAlign: 'center',
          padding: '28px 20px', position: 'relative', zIndex: 2,
        }}>
          <div style={{ fontSize: 72, filter: 'drop-shadow(0 0 16px #00cfff)' }}>🦈</div>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: '#00cfff', margin: 0, letterSpacing: 1 }}>
            TyperShark English
          </h1>
          <p style={{ color: '#8ea8c8', maxWidth: 460, lineHeight: 1.6, margin: 0 }}>
            Cá mập bơi từ <b style={{ color: '#00cfff' }}>phải sang trái</b> — gõ đúng từ tiếng Anh để tiêu diệt.
            <br />Đừng để chúng chạm bờ trái, nếu không bạn sẽ mất mạng 💀
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
            <span>🎯 Diệt <b style={{ color: '#00cfff' }}>{wordsKilled}</b></span>
            <span>⚡ Combo <b style={{ color: combo >= 5 ? '#ff5ac8' : combo >= 3 ? '#ffd700' : '#fff' }}>×{combo}</b></span>
            <span>⌨️ WPM <b style={{ color: '#8fe3ff' }}>{wpm}</b></span>
            <span>🎯 Chính xác <b style={{ color: accuracy >= 95 ? '#28ff8a' : '#fff' }}>{accuracy}%</b></span>
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
              }}>⚠ BỜ · DANGER</div>
            </div>

            <div className="ts-bubbles" aria-hidden />

            {words.map((word) => {
              const isLocked = word.id === lockedId;
              const typed = isLocked ? input.length : 0;
              const danger = word.x < 22;
              const swimDur = (1.4 / Math.max(0.4, word.speed / 8)).toFixed(2);
              return (
                <div key={word.id} style={{
                  position: 'absolute', left: `${word.x}%`, top: `${word.y}%`,
                  transform: 'translate(-50%,-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  filter: isLocked ? 'drop-shadow(0 0 10px #00cfff)' : danger ? 'drop-shadow(0 0 8px #ff4466)' : 'none',
                  zIndex: isLocked ? 10 : 2,
                  transition: 'filter 0.2s',
                }}>
                  {/* Shark bơi sang trái (mặt hướng trái) */}
                  <div style={{
                    fontSize: 30, marginBottom: 2,
                    transform: 'scaleX(-1)',
                    animation: `ts-swim ${swimDur}s ease-in-out infinite`,
                    filter: danger ? 'hue-rotate(-20deg) saturate(1.3)' : 'none',
                    display: 'inline-block',
                  }}>🦈</div>
                  <div style={{
                    padding: '3px 9px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                    background: isLocked ? 'rgba(0,100,180,0.95)' : danger ? 'rgba(120,0,20,0.85)' : 'rgba(0,20,60,0.85)',
                    border: `1px solid ${isLocked ? '#00cfff' : danger ? '#ff4466' : 'rgba(0,130,220,0.4)'}`,
                    letterSpacing: 1, whiteSpace: 'nowrap',
                    boxShadow: isLocked ? '0 0 14px rgba(0,200,255,0.55)' : 'none',
                    fontFamily: 'ui-monospace,Consolas,monospace',
                  }}>
                    <span style={{ color: '#00ffcc' }}>{word.en.slice(0, typed)}</span>
                    <span style={{ color: isLocked ? '#ffffff' : '#c5d7ea' }}>{word.en.slice(typed)}</span>
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
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '80vh', gap: 18, textAlign: 'center',
          padding: '28px 20px', position: 'relative', zIndex: 2,
        }}>
          <div style={{ fontSize: 64 }}>💀</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#ff4466', margin: 0 }}>Game Over!</h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
            gap: 10, maxWidth: 520, width: '100%',
          }}>
            {[
              { icon: '⭐', label: 'Điểm số',     value: score },
              { icon: '🦈', label: 'Cá mập diệt', value: wordsKilled },
              { icon: '⚡', label: 'Combo max',   value: `×${maxCombo}` },
              { icon: '⌨️', label: 'WPM',         value: wpm },
              { icon: '🎯', label: 'Chính xác',   value: `${accuracy}%` },
              { icon: '⏱️', label: 'Thời gian',   value: `${elapsed.toFixed(0)}s` },
            ].map((s, i) => (
              <div key={i} style={{
                padding: 12, borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#667' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => startGame(diffIdx)} style={btnPrimary(cfg.color)}>🔄 Chơi lại · {cfg.name}</button>
            <button onClick={() => setGameState('idle')} style={btnGhost}>🎚️ Đổi độ khó</button>
            <button onClick={onExit} style={btnGhost}>🏠 Menu</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ts-floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-48px) scale(1.25); }
        }
        @keyframes ts-swim {
          0%,100% { transform: scaleX(-1) translateY(0) rotate(0deg); }
          50%     { transform: scaleX(-1) translateY(-2px) rotate(-4deg); }
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
