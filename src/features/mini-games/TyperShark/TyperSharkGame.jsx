import { useState, useEffect, useRef, useCallback } from 'react';

// ── Word pool ─────────────────────────────────────────────────
const WORD_POOL = [
  // Beginner
  'cat','dog','run','fly','sun','hot','cold','big','small','fast',
  'slow','good','bad','yes','no','red','blue','green','old','new',
  // Intermediate
  'apple','water','house','money','happy','angry','learn','study',
  'speak','write','listen','family','school','friend','travel',
  'weather','nature','health','market','animal',
  // Advanced
  'beautiful','adventure','knowledge','important','different',
  'understand','education','environment','technology','experience',
  'communicate','opportunity','development','comfortable','achievement',
  'vocabulary','pronunciation','celebration','relationship','professional',
];

const LEVELS_CFG = [
  { name: 'Dễ',      speed: 0.4, spawnRate: 2800, maxWords: 3, color: '#28a745', wordLen: [3,5]  },
  { name: 'Vừa',     speed: 0.7, spawnRate: 2200, maxWords: 4, color: '#ffc107', wordLen: [4,7]  },
  { name: 'Khó',     speed: 1.1, spawnRate: 1600, maxWords: 5, color: '#fd7e14', wordLen: [5,10] },
  { name: 'Cực khó', speed: 1.6, spawnRate: 1100, maxWords: 6, color: '#dc3545', wordLen: [6,15] },
];

let wordIdCounter = 0;

export default function TyperSharkGame({ onExit }) {
  const [gameState, setGameState] = useState('idle'); // idle | playing | paused | gameover
  const [words, setWords]           = useState([]);
  const [input, setInput]           = useState('');
  const [score, setScore]           = useState(0);
  const [lives, setLives]           = useState(3);
  const [level, setLevel]           = useState(0);
  const [combo, setCombo]           = useState(0);
  const [maxCombo, setMaxCombo]     = useState(0);
  const [wordsKilled, setWordsKilled] = useState(0);
  const [particles, setParticles]   = useState([]);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [activeWord, setActiveWord] = useState(null);

  const inputRef     = useRef(null);
  const gameAreaRef  = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef  = useRef(null);
  const spawnTimerRef = useRef(0);

  // Mutable refs to avoid stale closures in rAF loop
  const wordsRef       = useRef([]);
  const livesRef       = useRef(3);
  const levelRef       = useRef(0);
  const scoreRef       = useRef(0);
  const comboRef       = useRef(0);
  const wordsKilledRef = useRef(0);
  const gameStateRef   = useRef('idle');

  useEffect(() => { wordsRef.current      = words;     }, [words]);
  useEffect(() => { livesRef.current      = lives;     }, [lives]);
  useEffect(() => { levelRef.current      = level;     }, [level]);
  useEffect(() => { scoreRef.current      = score;     }, [score]);
  useEffect(() => { comboRef.current      = combo;     }, [combo]);
  useEffect(() => { wordsKilledRef.current= wordsKilled;}, [wordsKilled]);
  useEffect(() => { gameStateRef.current  = gameState; }, [gameState]);

  const triggerShake = () => {
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 500);
  };

  const addParticle = (x, y, text) => {
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, x, y, text }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 800);
  };

  const spawnWord = useCallback(() => {
    const cfg = LEVELS_CFG[levelRef.current];
    if (wordsRef.current.length >= cfg.maxWords) return;
    const pool = WORD_POOL.filter(w => w.length >= cfg.wordLen[0] && w.length <= cfg.wordLen[1]);
    const text = pool[Math.floor(Math.random() * pool.length)];
    const newWord = {
      id: ++wordIdCounter,
      text,
      x: 5 + Math.random() * 80,
      y: -4,
      speed: cfg.speed * (0.8 + Math.random() * 0.4),
    };
    setWords(prev => [...prev, newWord]);
    wordsRef.current = [...wordsRef.current, newWord];
  }, []);

  const gameLoop = useCallback((timestamp) => {
    if (gameStateRef.current !== 'playing') return;
    const delta = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;

    spawnTimerRef.current += delta * 1000;
    const cfg = LEVELS_CFG[levelRef.current];
    if (spawnTimerRef.current >= cfg.spawnRate) {
      spawnTimerRef.current = 0;
      spawnWord();
    }

    let hitBottom = false;
    setWords(prev => {
      const updated = prev.map(w => ({ ...w, y: w.y + w.speed * delta * 60 }));
      const alive   = updated.filter(w => {
        if (w.y >= 95) { hitBottom = true; return false; }
        return true;
      });
      wordsRef.current = alive;
      return alive;
    });

    if (hitBottom) {
      const nl = livesRef.current - 1;
      livesRef.current = nl;
      setLives(nl);
      setCombo(0); comboRef.current = 0;
      triggerShake();
      if (nl <= 0) { setGameState('gameover'); gameStateRef.current = 'gameover'; return; }
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [spawnWord]);

  useEffect(() => {
    if (gameState === 'playing') {
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [gameState, gameLoop]);

  // Auto level-up
  useEffect(() => {
    if      (score >= 800 && level < 3) { setLevel(3); levelRef.current = 3; }
    else if (score >= 400 && level < 2) { setLevel(2); levelRef.current = 2; }
    else if (score >= 150 && level < 1) { setLevel(1); levelRef.current = 1; }
  }, [score, level]);

  const startGame = () => {
    wordIdCounter = 0;
    setWords([]); wordsRef.current = [];
    setInput('');
    setScore(0);  scoreRef.current = 0;
    setLives(3);  livesRef.current = 3;
    setLevel(0);  levelRef.current = 0;
    setCombo(0);  comboRef.current = 0;
    setMaxCombo(0);
    setWordsKilled(0); wordsKilledRef.current = 0;
    setParticles([]);
    setActiveWord(null);
    spawnTimerRef.current = 0;
    lastTimeRef.current   = null;
    setGameState('playing'); gameStateRef.current = 'playing';
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInput = (e) => {
    if (gameState !== 'playing') return;
    const val = e.target.value.toLowerCase().replace(/\s+/g, '');
    setInput(val);

    const current = wordsRef.current;
    const match   = current.find(w => w.text.startsWith(val) && val.length > 0);
    setActiveWord(match ? match.id : null);

    const exact = current.find(w => w.text === val);
    if (exact) {
      const rect = gameAreaRef.current?.getBoundingClientRect();
      const px   = (exact.x / 100) * (rect?.width  || 400);
      const py   = (exact.y / 100) * (rect?.height || 500);
      const nc   = comboRef.current + 1;
      const pts  = 10 + exact.text.length + nc * 2;
      const nk   = wordsKilledRef.current + 1;
      const ns   = scoreRef.current + pts;

      addParticle(px, py, `+${pts}`);
      comboRef.current       = nc;
      wordsKilledRef.current = nk;
      scoreRef.current       = ns;

      setCombo(nc);
      setMaxCombo(prev => Math.max(prev, nc));
      setWordsKilled(nk);
      setScore(ns);
      setWords(prev => prev.filter(w => w.id !== exact.id));
      wordsRef.current = wordsRef.current.filter(w => w.id !== exact.id);
      setActiveWord(null);
      setInput('');
    }
  };

  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused'); gameStateRef.current = 'paused';
    } else if (gameState === 'paused') {
      setGameState('playing'); gameStateRef.current = 'playing';
      lastTimeRef.current = null;
      inputRef.current?.focus();
    }
  };

  const cfg = LEVELS_CFG[level];

  return (
    <div style={{
      background: 'linear-gradient(180deg,#0a0a1a 0%,#0d1b2a 50%,#051020 100%)',
      minHeight: '100vh', fontFamily: "'Segoe UI',sans-serif", color: '#e0e8ff',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 20px', background:'rgba(0,0,0,0.5)',
        borderBottom:'1px solid rgba(0,150,255,0.3)',
      }}>
        <button onClick={onExit} style={{
          background:'none', border:'1px solid rgba(255,255,255,0.3)',
          color:'#aaa', borderRadius:8, padding:'6px 14px', cursor:'pointer',
        }}>← Thoát</button>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:22}}>🦈</span>
          <span style={{fontSize:20,fontWeight:700,color:'#00cfff'}}>TyperShark</span>
        </div>
        {gameState !== 'idle' ? (
          <div style={{display:'flex',gap:20,fontSize:14}}>
            <span>⭐ <b style={{color:'#ffd700'}}>{score}</b></span>
            <span style={{color:cfg.color,fontWeight:700}}>● {cfg.name}</span>
            <span>{'❤️'.repeat(lives)}{'🖤'.repeat(3-lives)}</span>
          </div>
        ) : <div style={{width:80}}/>}
      </div>

      {/* ── IDLE ── */}
      {gameState === 'idle' && (
        <div style={{
          display:'flex',flexDirection:'column',alignItems:'center',
          justifyContent:'center',minHeight:'80vh',gap:24,textAlign:'center',padding:'0 20px',
        }}>
          <div style={{fontSize:80}}>🦈</div>
          <h1 style={{fontSize:36,fontWeight:800,color:'#00cfff',margin:0}}>TyperShark English</h1>
          <p style={{color:'#8899bb',maxWidth:400,lineHeight:1.6}}>
            Từ tiếng Anh rơi từ trên xuống — gõ đúng để tiêu diệt cá mập!<br/>
            Đừng để từ chạm đáy — bạn sẽ mất mạng 💀
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,maxWidth:400,width:'100%'}}>
            {LEVELS_CFG.map((l,i) => (
              <div key={i} style={{
                padding:'12px 16px',borderRadius:10,
                border:`1px solid ${l.color}44`,background:`${l.color}11`,fontSize:13,
              }}>
                <div style={{color:l.color,fontWeight:700}}>{l.name}</div>
                <div style={{color:'#667'}}>Tốc độ ×{l.speed} | Tối đa {l.maxWords} từ</div>
              </div>
            ))}
          </div>
          <button onClick={startGame} style={{
            padding:'14px 48px',fontSize:18,fontWeight:700,
            background:'linear-gradient(135deg,#0066ff,#00cfff)',
            color:'#fff',border:'none',borderRadius:50,cursor:'pointer',
            boxShadow:'0 4px 20px rgba(0,150,255,0.4)',marginTop:8,
          }}>🎮 Bắt đầu chơi</button>
        </div>
      )}

      {/* ── PLAYING / PAUSED ── */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <div style={{
            display:'flex',justifyContent:'space-between',
            padding:'8px 20px',background:'rgba(0,0,0,0.3)',fontSize:13,color:'#8899bb',
          }}>
            <span>🎯 Đã diệt: <b style={{color:'#00cfff'}}>{wordsKilled}</b></span>
            <span>⚡ Combo: <b style={{color:combo>3?'#ffd700':'#fff'}}>×{combo}</b></span>
            <span>📈 Level: <b style={{color:cfg.color}}>{level+1}/4</b></span>
          </div>

          <div ref={gameAreaRef} style={{
            position:'relative', height:'calc(100vh - 180px)', overflow:'hidden',
            transform: shakeScreen ? 'translateX(-6px)' : 'none',
            transition:'transform 0.05s',
          }}>
            {/* grid lines */}
            {[...Array(8)].map((_,i) => (
              <div key={i} style={{position:'absolute',top:0,bottom:0,left:`${(i+1)*12}%`,width:1,background:'rgba(0,100,200,0.08)'}}/>
            ))}
            {/* danger zone */}
            <div style={{
              position:'absolute',bottom:0,left:0,right:0,height:'8%',
              background:'linear-gradient(transparent,rgba(220,53,69,0.15))',
              borderTop:'1px solid rgba(220,53,69,0.3)',
            }}>
              <div style={{position:'absolute',bottom:4,left:'50%',transform:'translateX(-50%)',fontSize:11,color:'rgba(220,53,69,0.6)',letterSpacing:3}}>
                ⚠ DANGER ZONE ⚠
              </div>
            </div>

            {/* words */}
            {words.map(word => {
              const isActive = word.id === activeWord;
              const typed    = isActive ? input.length : 0;
              return (
                <div key={word.id} style={{
                  position:'absolute', left:`${word.x}%`, top:`${word.y}%`,
                  transform:'translateX(-50%)', display:'flex',
                  flexDirection:'column', alignItems:'center',
                  filter: isActive ? 'drop-shadow(0 0 8px #00cfff)' : 'none',
                  zIndex: isActive ? 10 : 1,
                }}>
                  <div style={{fontSize:20,marginBottom:2}}>🦈</div>
                  <div style={{
                    padding:'4px 10px', borderRadius:8,
                    background: isActive ? 'rgba(0,80,160,0.9)' : 'rgba(0,20,60,0.85)',
                    border:`1px solid ${isActive ? '#00cfff' : 'rgba(0,100,200,0.4)'}`,
                    fontSize:15, fontWeight:600, letterSpacing:1, whiteSpace:'nowrap',
                    boxShadow: isActive ? '0 0 12px rgba(0,200,255,0.4)' : 'none',
                  }}>
                    <span style={{color:'#00cfff'}}>{word.text.slice(0,typed)}</span>
                    <span style={{color:'#cdd'}}>{word.text.slice(typed)}</span>
                  </div>
                </div>
              );
            })}

            {/* particles */}
            {particles.map(p => (
              <div key={p.id} style={{
                position:'absolute', left:p.x, top:p.y,
                color:'#ffd700', fontWeight:800, fontSize:16,
                pointerEvents:'none', animation:'floatUp 0.8s ease-out forwards',
                textShadow:'0 0 8px #ffaa00',
              }}>{p.text}</div>
            ))}

            {/* paused overlay */}
            {gameState === 'paused' && (
              <div style={{
                position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,
              }}>
                <div style={{fontSize:48}}>⏸</div>
                <div style={{fontSize:24,fontWeight:700}}>Tạm dừng</div>
                <button onClick={togglePause} style={{
                  padding:'10px 32px',fontSize:16,fontWeight:700,
                  background:'#0066ff',color:'#fff',border:'none',borderRadius:50,cursor:'pointer',
                }}>▶ Tiếp tục</button>
              </div>
            )}
          </div>

          {/* input bar */}
          <div style={{
            padding:'12px 20px',background:'rgba(0,0,0,0.5)',
            borderTop:'1px solid rgba(0,150,255,0.2)',display:'flex',gap:10,alignItems:'center',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={e => e.key==='Escape' && togglePause()}
              disabled={gameState !== 'playing'}
              placeholder="Gõ từ tiếng Anh ở đây..."
              autoComplete="off" spellCheck="false"
              style={{
                flex:1, padding:'12px 16px', fontSize:18, fontWeight:600,
                background:'rgba(0,30,80,0.8)',
                border:`2px solid ${activeWord ? '#00cfff' : 'rgba(0,100,200,0.4)'}`,
                borderRadius:12, color:'#e0f0ff', outline:'none', letterSpacing:2,
                boxShadow: activeWord ? '0 0 16px rgba(0,200,255,0.3)' : 'none',
              }}
            />
            <button onClick={togglePause} style={{
              padding:'10px 16px',fontSize:18,background:'rgba(255,255,255,0.1)',
              border:'1px solid rgba(255,255,255,0.2)',color:'#fff',borderRadius:10,cursor:'pointer',
            }}>{gameState === 'playing' ? '⏸' : '▶'}</button>
          </div>
        </>
      )}

      {/* ── GAME OVER ── */}
      {gameState === 'gameover' && (
        <div style={{
          display:'flex',flexDirection:'column',alignItems:'center',
          justifyContent:'center',minHeight:'80vh',gap:20,textAlign:'center',padding:'0 20px',
        }}>
          <div style={{fontSize:64}}>💀</div>
          <h2 style={{fontSize:32,fontWeight:800,color:'#ff4444',margin:0}}>Game Over!</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,maxWidth:360,width:'100%'}}>
            {[
              {icon:'⭐',label:'Điểm số',value:score,color:'#ffd700'},
              {icon:'🦈',label:'Từ tiêu diệt',value:wordsKilled,color:'#00cfff'},
              {icon:'⚡',label:'Combo cao nhất',value:`×${maxCombo}`,color:'#ff9900'},
              {icon:'📈',label:'Level đạt được',value:`${level+1}/4`,color:cfg.color},
            ].map((s,i) => (
              <div key={i} style={{
                padding:14,borderRadius:12,
                background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{fontSize:24}}>{s.icon}</div>
                <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{fontSize:12,color:'#667'}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:12,marginTop:8}}>
            <button onClick={startGame} style={{
              padding:'12px 36px',fontSize:16,fontWeight:700,
              background:'linear-gradient(135deg,#0066ff,#00cfff)',
              color:'#fff',border:'none',borderRadius:50,cursor:'pointer',
              boxShadow:'0 4px 20px rgba(0,150,255,0.4)',
            }}>🔄 Chơi lại</button>
            <button onClick={onExit} style={{
              padding:'12px 36px',fontSize:16,fontWeight:700,
              background:'rgba(255,255,255,0.1)',color:'#ccc',
              border:'1px solid rgba(255,255,255,0.2)',borderRadius:50,cursor:'pointer',
            }}>🏠 Menu</button>
          </div>
        </div>
      )}

      <style>{`@keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-50px) scale(1.3)}}`}</style>
    </div>
  );
}
