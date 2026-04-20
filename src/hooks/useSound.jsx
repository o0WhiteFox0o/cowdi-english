// ============================================
// COWDI SOUND — Web Audio API sound effects
// Centralized, reusable, with mute toggle
// ============================================
import { createContext, useContext, useState, useCallback, useRef } from 'react';

const SoundContext = createContext(null);

let _ctx = null;
function getAudioCtx() {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

/* ── Helpers ── */
function tone(ctx, freq, type, vol, start, dur) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start);
  osc.stop(start + dur);
}

function noise(ctx, dur, vol, start) {
  const bufSize = ctx.sampleRate * dur;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = buf;
  src.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  src.start(start);
  src.stop(start + dur);
}

/* ══════════════════════════════════════════════
   SOUND LIBRARY — All sounds defined here
   ══════════════════════════════════════════════ */

const SOUNDS = {
  /* ── Core Feedback ── */
  correct() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 523.25, 'sine', 0.18, t, 0.4);       // C5
    tone(ctx, 659.25, 'sine', 0.18, t + 0.1, 0.35); // E5
    tone(ctx, 783.99, 'sine', 0.18, t + 0.2, 0.3);  // G5
  },

  wrong() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.setValueAtTime(150, t + 0.15);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t); osc.stop(t + 0.3);
  },

  celebration() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(ctx, f, 'sine', 0.14, t + i * 0.12, 0.4);
    });
  },

  perfect() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      tone(ctx, f, 'sine', 0.15, t + i * 0.1, 0.45);
    });
    // shimmer
    tone(ctx, 2093, 'sine', 0.06, t + 0.5, 0.6);
  },

  /* ── UI Clicks ── */
  click() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 880, 'sine', 0.08, t, 0.06);
  },

  pop() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t); osc.stop(t + 0.1);
  },

  flip() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 400, 'sine', 0.08, t, 0.05);
    tone(ctx, 600, 'sine', 0.08, t + 0.04, 0.06);
  },

  /* ── Timer ── */
  tick() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 1000, 'sine', 0.04, t, 0.03);
  },

  tickUrgent() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 1200, 'square', 0.08, t, 0.05);
    tone(ctx, 1000, 'square', 0.06, t + 0.06, 0.04);
  },

  /* ── Progression & Rewards ── */
  xpGain() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 880, 'sine', 0.1, t, 0.15);
    tone(ctx, 1100, 'sine', 0.1, t + 0.08, 0.15);
  },

  coinEarn() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 1500, 'sine', 0.1, t, 0.08);
    tone(ctx, 2000, 'sine', 0.08, t + 0.06, 0.1);
    tone(ctx, 2500, 'sine', 0.06, t + 0.12, 0.12);
  },

  levelUp() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    [440, 554.37, 659.25, 880, 1046.5, 1318.5].forEach((f, i) => {
      tone(ctx, f, 'sine', 0.12, t + i * 0.1, 0.5);
    });
  },

  achievement() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    // Fanfare: ascending + shimmer
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(ctx, f, 'sine', 0.14, t + i * 0.12, 0.5);
    });
    tone(ctx, 1046.5, 'triangle', 0.06, t + 0.6, 0.8);
  },

  streak() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 660, 'sine', 0.1, t, 0.15);
    tone(ctx, 880, 'sine', 0.12, t + 0.1, 0.2);
    tone(ctx, 1100, 'sine', 0.1, t + 0.2, 0.25);
  },

  /* ── Pet Interactions ── */
  petHappy() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 523.25, 'sine', 0.1, t, 0.12);
    tone(ctx, 659.25, 'sine', 0.12, t + 0.1, 0.12);
    tone(ctx, 783.99, 'sine', 0.1, t + 0.2, 0.15);
  },

  petUnlock() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    // Magical discovery
    [392, 440, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(ctx, f, 'sine', 0.13, t + i * 0.1, 0.55);
    });
    noise(ctx, 0.3, 0.03, t + 0.6); // sparkle
  },

  petEat() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.setValueAtTime(500, t + 0.05);
    osc.frequency.setValueAtTime(300, t + 0.1);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.start(t); osc.stop(t + 0.15);
  },

  /* ── Shop ── */
  purchase() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 800, 'sine', 0.1, t, 0.08);
    tone(ctx, 1200, 'sine', 0.1, t + 0.08, 0.1);
    tone(ctx, 1600, 'sine', 0.08, t + 0.16, 0.12);
    tone(ctx, 2000, 'sine', 0.06, t + 0.24, 0.15);
  },

  denied() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 250, 'square', 0.08, t, 0.15);
    tone(ctx, 200, 'square', 0.06, t + 0.15, 0.15);
  },

  equip() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 500, 'sine', 0.08, t, 0.06);
    tone(ctx, 750, 'sine', 0.1, t + 0.05, 0.1);
  },

  /* ── Learning ── */
  wordLearned() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 660, 'sine', 0.1, t, 0.12);
    tone(ctx, 880, 'sine', 0.12, t + 0.08, 0.15);
  },

  reviewEasy() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 523.25, 'sine', 0.1, t, 0.2);
    tone(ctx, 783.99, 'sine', 0.12, t + 0.1, 0.2);
  },

  reviewHard() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 350, 'triangle', 0.08, t, 0.15);
  },

  /* ── Toast ── */
  toastSuccess() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 660, 'sine', 0.08, t, 0.1);
    tone(ctx, 880, 'sine', 0.08, t + 0.08, 0.12);
  },

  toastError() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 220, 'square', 0.06, t, 0.12);
    tone(ctx, 180, 'square', 0.04, t + 0.1, 0.12);
  },

  toastWarning() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 440, 'triangle', 0.06, t, 0.15);
    tone(ctx, 440, 'triangle', 0.06, t + 0.18, 0.15);
  },

  /* ── Duel ── */
  duelWin() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(ctx, f, 'sine', 0.14, t + i * 0.1, 0.5);
    });
  },

  duelLose() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    [400, 350, 300, 250].forEach((f, i) => {
      tone(ctx, f, 'sine', 0.1, t + i * 0.15, 0.3);
    });
  },

  /* ── Battle FX ── */
  battleAttack() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    // Swoosh
    tone(ctx, 800, 'sawtooth', 0.08, t, 0.06);
    tone(ctx, 500, 'sawtooth', 0.06, t + 0.05, 0.08);
    tone(ctx, 300, 'sawtooth', 0.04, t + 0.1, 0.06);
  },

  battleHit() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    // Impact thud
    tone(ctx, 120, 'sine', 0.2, t, 0.1);
    tone(ctx, 80, 'sine', 0.15, t + 0.05, 0.12);
    // Noise burst via high-freq triangle
    tone(ctx, 2000, 'triangle', 0.06, t, 0.04);
  },

  battleCritical() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    // Dramatic chord
    [523.25, 659.25, 783.99].forEach(f => tone(ctx, f, 'sine', 0.12, t, 0.3));
    tone(ctx, 1046.5, 'triangle', 0.1, t + 0.1, 0.25);
    tone(ctx, 120, 'sine', 0.15, t + 0.15, 0.1);
  },

  battleDamage() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    // Low thud + high ping
    tone(ctx, 100, 'sine', 0.18, t, 0.1);
    tone(ctx, 600, 'triangle', 0.08, t + 0.05, 0.06);
  },

  battleFaint() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    // Descending tone
    [500, 400, 300, 200, 120].forEach((f, i) => {
      tone(ctx, f, 'sine', 0.1 - i * 0.015, t + i * 0.12, 0.2);
    });
  },

  battleVictory() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    // Fanfare
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      tone(ctx, f, 'sine', 0.15, t + i * 0.12, 0.6);
      tone(ctx, f * 0.5, 'triangle', 0.06, t + i * 0.12, 0.4);
    });
  },

  /* ── Word catch game ── */
  wordFall() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 300, 'sine', 0.06, t, 0.08);
  },

  /* ── Countdown beep ── */
  countdownBeep() {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    tone(ctx, 800, 'sine', 0.12, t, 0.12);
  },
};

/* ══════════════════════════════════════════════
   PROVIDER & HOOK
   ══════════════════════════════════════════════ */

const MUTE_KEY = 'cowdi_sound_muted';

export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === '1');
  const lastPlay = useRef({}); // debounce map

  const play = useCallback((name) => {
    if (muted) return;
    const fn = SOUNDS[name];
    if (!fn) return;
    // Debounce same sound within 60ms
    const now = Date.now();
    if (lastPlay.current[name] && now - lastPlay.current[name] < 60) return;
    lastPlay.current[name] = now;
    try { fn(); } catch (_) { /* silent fallback */ }
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(MUTE_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  return (
    <SoundContext.Provider value={{ play, muted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used inside SoundProvider');
  return ctx;
}
