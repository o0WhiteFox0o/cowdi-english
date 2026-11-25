// Lưu trạng thái Pet Director vào localStorage, tách theo userId.
// Mọi thao tác đọc/ghi bọc trong try/catch để không bao giờ gây lỗi trên trình duyệt hạn chế.
import { REPEAT_BLOCK_MS, SESSION_IDLE_RESET_MS } from './rules.js';

function getBrowserStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // ignore
  }
  return null;
}

export function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
  };
}

function emptySession(now) {
  return {
    id: `s_${now}`,
    startedAt: now,
    lastActiveAt: now,
    moodNudged: false,
    appOpened: false,
    lastSpeechAt: 0,
    shownThoughts: {},
  };
}

export function createDirectorStorage(userId = 'guest', backend = getBrowserStorage()) {
  const safeUid = String(userId || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_');
  const prefix = `cowdi.dir.${safeUid}.`;
  const store = backend || createMemoryStorage();

  function readJson(key, fallback) {
    try {
      const raw = store.getItem(prefix + key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      store.setItem(prefix + key, JSON.stringify(value));
    } catch {
      // ignore quota / private mode errors
    }
  }

  return {
    getSeenTips() {
      return readJson('seenTips', {});
    },

    markTipSeen(screen) {
      if (!screen) return;
      const tips = this.getSeenTips();
      if (tips[screen]) return;
      tips[screen] = true;
      writeJson('seenTips', tips);
    },

    getRecentLines(now = Date.now()) {
      const raw = readJson('recentLines', {});
      const cleaned = {};
      let pruned = false;
      for (const [id, ts] of Object.entries(raw)) {
        if (typeof ts === 'number' && now - ts < REPEAT_BLOCK_MS) {
          cleaned[id] = ts;
        } else {
          pruned = true;
        }
      }
      if (pruned) writeJson('recentLines', cleaned);
      return cleaned;
    },

    markLineUsed(lineId, now = Date.now()) {
      if (!lineId) return;
      const recent = this.getRecentLines(now);
      recent[lineId] = now;
      writeJson('recentLines', recent);
    },

    getSession(now = Date.now()) {
      const s = readJson('session', null);
      if (!s || typeof s.startedAt !== 'number') {
        const fresh = emptySession(now);
        writeJson('session', fresh);
        return fresh;
      }
      const lastTouch = typeof s.lastActiveAt === 'number' ? s.lastActiveAt : s.startedAt;
      if (now - lastTouch > SESSION_IDLE_RESET_MS) {
        const fresh = emptySession(now);
        writeJson('session', fresh);
        return fresh;
      }
      return {
        ...emptySession(now),
        ...s,
        shownThoughts: { ...(s.shownThoughts || {}) },
      };
    },

    updateSession(patch, now = Date.now()) {
      const cur = this.getSession(now);
      const next = {
        ...cur,
        ...patch,
        lastActiveAt: now,
        shownThoughts: {
          ...(cur.shownThoughts || {}),
          ...(patch.shownThoughts || {}),
        },
      };
      writeJson('session', next);
      return next;
    },

    getSeenWords(lessonId) {
      if (!lessonId) return [];
      const data = readJson('seenWords', null);
      if (!data || data.lessonId !== lessonId || !Array.isArray(data.words)) {
        return [];
      }
      return data.words;
    },

    hasSeenWord(lessonId, word) {
      if (!lessonId || !word) return false;
      const key = String(word).trim().toLowerCase();
      return this.getSeenWords(lessonId).includes(key);
    },

    markWordSeen(lessonId, word) {
      if (!lessonId || !word) return;
      const key = String(word).trim().toLowerCase();
      const words = this.getSeenWords(lessonId);
      if (!words.includes(key)) {
        words.push(key);
        writeJson('seenWords', { lessonId, words });
      }
    },

    resetSeenWords(lessonId) {
      writeJson('seenWords', { lessonId: lessonId || null, words: [] });
    },
  };
}
