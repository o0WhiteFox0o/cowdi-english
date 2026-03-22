import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { ACHIEVEMENTS, LESSONS } from '../data/lessons';
import { getAllTopicWords } from '../data/vocab-topics';
import { useAuth } from './useAuth';

const STORAGE_KEY_PREFIX = 'cowdi_english_data';
const SYNC_DIRTY_KEY = 'cowdi_sync_dirty';

function getStorageKey(userId) {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

// Tập hợp tất cả từ vựng hợp lệ từ LESSONS + VOCAB_TOPICS (dùng để lọc data rác)
const VALID_WORDS = new Set([
  ...LESSONS.flatMap((l) => l.vocabulary.map((v) => v.word)),
  ...getAllTopicWords().map((w) => w.word),
]);

const DEFAULT_DATA = {
  totalXP: 0,
  streak: 0,
  lastActiveDate: null,
  lessonsCompleted: 0,
  quizzesCompleted: 0,
  perfectQuizzes: 0,
  wordsLearned: 0,
  completedLessons: [],
  wordStatus: {},
  activeDays: [],
  dailyTasks: { lessonDone: false, vocabDone: false },
  dailyDate: null,
  achievements: [],
  srsData: {},
  checkpointScores: {},
  skillXP: { listening: 0, speaking: 0, reading: 0, writing: 0 },
  _lastModified: null,
};

// ── SRS SM-2 algorithm helpers ──────────────────────────────
const SRS_DEFAULT = { interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: null };

function srsGrade(card, quality) {
  // quality: 0-5 (0-2 = fail, 3 = hard, 4 = good, 5 = easy)
  let { interval, easeFactor, repetitions } = card;
  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  const nextReview = new Date(Date.now() + interval * 86400000).toISOString();
  return { interval, easeFactor, repetitions, nextReview };
}

function loadUserData(userId) {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      const parsed = { ...DEFAULT_DATA, ...JSON.parse(raw) };
      return sanitizeData(parsed);
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_DATA };
}

// Lọc bỏ dữ liệu rác – chỉ giữ từ vựng có trong LESSONS
function sanitizeData(data) {
  const sanitized = { ...data };

  // Lọc wordStatus: chỉ giữ từ hợp lệ với giá trị hợp lệ
  if (sanitized.wordStatus && typeof sanitized.wordStatus === 'object') {
    const clean = {};
    const validStatuses = ['new', 'learning', 'learned'];
    for (const [word, status] of Object.entries(sanitized.wordStatus)) {
      if (VALID_WORDS.has(word) && validStatuses.includes(status)) {
        clean[word] = status;
      }
    }
    sanitized.wordStatus = clean;
    sanitized.wordsLearned = Object.values(clean).filter((s) => s === 'learned').length;
  }

  // Lọc srsData: chỉ giữ từ hợp lệ
  if (sanitized.srsData && typeof sanitized.srsData === 'object') {
    const clean = {};
    for (const [word, card] of Object.entries(sanitized.srsData)) {
      if (VALID_WORDS.has(word) && card && typeof card === 'object') {
        clean[word] = card;
      }
    }
    sanitized.srsData = clean;
  }

  // Giới hạn activeDays
  if (Array.isArray(sanitized.activeDays) && sanitized.activeDays.length > 365) {
    sanitized.activeDays = sanitized.activeDays.slice(-365);
  }

  return sanitized;
}

function compactData(data) {
  const compacted = sanitizeData(data);
  // Loại bỏ internal fields khi gửi lên server
  delete compacted._lastModified;
  return compacted;
}

// Tính "trọng số tiến trình" để so sánh local vs remote
function progressWeight(data) {
  return (data.totalXP || 0)
    + (data.wordsLearned || 0) * 10
    + (data.lessonsCompleted || 0) * 20
    + Object.keys(data.wordStatus || {}).length;
}

// Merge: giữ lại nhiều từ vựng hơn giữa local và remote
function mergeProgress(local, remote) {
  // So sánh _lastModified nếu có
  const localTime = local._lastModified ? new Date(local._lastModified).getTime() : 0;
  const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;

  // Nếu remote cũ hơn local → giữ local
  if (localTime > remoteTime) return local;

  // Nếu remote mới hơn → dùng remote nhưng merge wordStatus (giữ "learned" > "learning" > "new")
  const mergedWordStatus = { ...(local.wordStatus || {}) };
  const remoteWordStatus = remote.wordStatus || {};
  const statusPriority = { learned: 3, learning: 2, new: 1 };

  for (const [word, rStatus] of Object.entries(remoteWordStatus)) {
    const lStatus = mergedWordStatus[word] || 'new';
    if ((statusPriority[rStatus] || 0) >= (statusPriority[lStatus] || 0)) {
      mergedWordStatus[word] = rStatus;
    }
  }

  // Dùng remote làm base nhưng với merged wordStatus
  const cleaned = Object.fromEntries(
    Object.entries(remote).filter(([, v]) => v != null)
  );
  const merged = { ...DEFAULT_DATA, ...cleaned };
  merged.wordStatus = mergedWordStatus;
  merged.wordsLearned = Object.values(mergedWordStatus).filter((s) => s === 'learned').length;

  // Giữ completedLessons nhiều hơn
  const localLessons = new Set(local.completedLessons || []);
  const remoteLessons = new Set(remote.completedLessons || []);
  const allLessons = [...new Set([...localLessons, ...remoteLessons])];
  merged.completedLessons = allLessons;
  merged.lessonsCompleted = allLessons.length;

  // Giữ achievements nhiều hơn
  merged.achievements = [...new Set([...(local.achievements || []), ...(remote.achievements || [])])];

  // Giữ XP cao nhất
  merged.totalXP = Math.max(local.totalXP || 0, remote.totalXP || 0);

  // Merge srsData – giữ version có repetitions cao hơn cho mỗi từ
  const mergedSrs = { ...(local.srsData || {}) };
  for (const [word, rCard] of Object.entries(remote.srsData || {})) {
    const lCard = mergedSrs[word];
    if (!lCard || (rCard.repetitions || 0) > (lCard.repetitions || 0)) {
      mergedSrs[word] = rCard;
    }
  }
  merged.srsData = mergedSrs;

  // Merge checkpointScores – giữ score cao hơn
  const mergedCheckpoints = { ...(local.checkpointScores || {}) };
  for (const [uid, rScore] of Object.entries(remote.checkpointScores || {})) {
    const lScore = mergedCheckpoints[uid];
    if (!lScore || (rScore.score / rScore.total) > (lScore.score / lScore.total)) {
      mergedCheckpoints[uid] = rScore;
    }
  }
  merged.checkpointScores = mergedCheckpoints;

  // Merge skillXP – keep highest per skill
  const localSkill = local.skillXP || { listening: 0, speaking: 0, reading: 0, writing: 0 };
  const remoteSkill = remote.skillXP || { listening: 0, speaking: 0, reading: 0, writing: 0 };
  merged.skillXP = {
    listening: Math.max(localSkill.listening || 0, remoteSkill.listening || 0),
    speaking: Math.max(localSkill.speaking || 0, remoteSkill.speaking || 0),
    reading: Math.max(localSkill.reading || 0, remoteSkill.reading || 0),
    writing: Math.max(localSkill.writing || 0, remoteSkill.writing || 0),
  };

  return sanitizeData(merged);
}

// Đánh dấu rằng local có data chưa sync lên server
function markSyncDirty(userId) {
  try { localStorage.setItem(`${SYNC_DIRTY_KEY}_${userId || ''}`, '1'); } catch { /* ignore */ }
}
function clearSyncDirty(userId) {
  try { localStorage.removeItem(`${SYNC_DIRTY_KEY}_${userId || ''}`); } catch { /* ignore */ }
}
function isSyncDirty(userId) {
  try { return localStorage.getItem(`${SYNC_DIRTY_KEY}_${userId || ''}`) === '1'; } catch { return false; }
}

function saveUserData(data, userId) {
  try {
    const compacted = compactData(data);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(compacted));
  } catch (e) {
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      // localStorage đầy – thử xoá bớt dữ liệu cũ rồi lưu lại
      try {
        const minimal = compactData(data);
        // Trim activeDays xuống 90 ngày
        if (Array.isArray(minimal.activeDays)) {
          minimal.activeDays = minimal.activeDays.slice(-90);
        }
        localStorage.setItem(getStorageKey(userId), JSON.stringify(minimal));
      } catch {
        console.warn('localStorage quota exceeded – không thể lưu offline.');
      }
    } else {
      console.warn('Lỗi lưu localStorage:', e);
    }
  }
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { user, authFetch } = useAuth();
  const [userData, setUserData] = useState(() => loadUserData(user?.id || null));
  const syncTimerRef = useRef(null);
  const currentUserIdRef = useRef(null);
  // Guard: chỉ persist sau khi đã load đúng dữ liệu cho user hiện tại
  const readyRef = useRef(!user);

  // ── Khi user thay đổi (login/logout) – load đúng dữ liệu ───────────────────
  useEffect(() => {
    const uid = user?.id || null;
    if (uid === currentUserIdRef.current) return; // không thay đổi
    currentUserIdRef.current = uid;
    readyRef.current = false; // Block persist cho đến khi load xong

    if (!uid) {
      // Logout – reset về data không đăng nhập (anonymous)
      setUserData(loadUserData(null));
      readyRef.current = true;
      return;
    }

    // Reset về defaults ngay lập tức để không hiển thị data cũ của anonymous
    // persist bị block bởi readyRef nên KHÔNG ghi đè lên localStorage/server
    setUserData({ ...DEFAULT_DATA });

    // Login – merge backend + localStorage, không mất dữ liệu
    authFetch('/api/progress')
      .then((r) => r.ok ? r.json() : null)
      .then((remote) => {
        const localForUser = loadUserData(uid);
        let final;

        if (!remote) {
          // Server không có data → dùng local
          final = localForUser;
        } else if (isSyncDirty(uid)) {
          // Local có thay đổi chưa sync → merge thông minh
          final = mergeProgress(localForUser, remote);
        } else {
          // Sync sạch – vẫn merge để không mất wordStatus
          final = mergeProgress(localForUser, remote);
        }
        final._lastModified = new Date().toISOString();
        setUserData(final);
        readyRef.current = true;
      })
      .catch(() => {
        setUserData(loadUserData(uid));
        readyRef.current = true;
      });
  }, [user?.id]);

  // ── Persist to localStorage on every userData change ────────────────────
  useEffect(() => {
    if (!readyRef.current) return; // Chưa load xong – không ghi đè
    const dataToSave = { ...userData, _lastModified: new Date().toISOString() };
    saveUserData(dataToSave, user?.id || null);

    // Debounce sync lên backend 3 giây sau lần thay đổi cuối
    if (user) {
      markSyncDirty(user.id); // Đánh dấu có thay đổi chưa sync
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        const payload = compactData(userData);
        authFetch('/api/progress', {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
          .then((r) => {
            if (r.ok) { clearSyncDirty(user.id); return; }
            // 413 = payload quá lớn → gửi chỉ wordStatus (nhẹ, <50KB)
            if (r.status === 413) {
              return authFetch('/api/word-status', {
                method: 'PUT',
                body: JSON.stringify({
                  wordStatus: userData.wordStatus,
                  wordsLearned: userData.wordsLearned,
                }),
              }).then((r2) => { if (r2.ok) clearSyncDirty(user.id); });
            }
          })
          .catch(() => {/* silent fail – localStorage là fallback */});
      }, 3000);
    }
  }, [userData]);

  // ── Update streak on mount ───────────────────────────────────────────────
  useEffect(() => {
    setUserData((prev) => {
      const today = new Date().toDateString();
      if (prev.lastActiveDate === today) return prev;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newStreak =
        prev.lastActiveDate === yesterday.toDateString() ? prev.streak + 1 : 1;

      const activeDays = [...prev.activeDays];
      if (!activeDays.includes(today)) activeDays.push(today);

      let dailyTasks = prev.dailyTasks;
      let dailyDate  = prev.dailyDate;
      if (dailyDate !== today) {
        dailyTasks = { lessonDone: false, vocabDone: false };
        dailyDate  = today;
      }

      return {
        ...prev,
        streak: newStreak,
        lastActiveDate: today,
        activeDays,
        dailyTasks,
        dailyDate,
      };
    });
  }, []);

  const addXP = useCallback((amount) => {
    setUserData((prev) => {
      const next = { ...prev, totalXP: prev.totalXP + amount };
      return checkAchievements(next);
    });
  }, []);

  const addSkillXP = useCallback((skill, amount) => {
    setUserData((prev) => {
      const skillXP = { ...(prev.skillXP || { listening: 0, speaking: 0, reading: 0, writing: 0 }) };
      if (skill && skillXP[skill] !== undefined) {
        skillXP[skill] += amount;
      } else {
        // mixed or unknown → distribute evenly
        const each = Math.max(1, Math.floor(amount / 4));
        skillXP.listening += each;
        skillXP.speaking += each;
        skillXP.reading += each;
        skillXP.writing += each;
      }
      return { ...prev, skillXP };
    });
  }, []);

  const markLessonCompleted = useCallback((lessonId) => {
    setUserData((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      const next = {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        lessonsCompleted: prev.lessonsCompleted + 1,
        dailyTasks: { ...prev.dailyTasks, lessonDone: true },
      };
      return checkAchievements(next);
    });
  }, []);

  const incrementQuizzes = useCallback((isPerfect) => {
    setUserData((prev) => {
      const next = {
        ...prev,
        quizzesCompleted: prev.quizzesCompleted + 1,
        perfectQuizzes: isPerfect ? prev.perfectQuizzes + 1 : prev.perfectQuizzes,
      };
      return checkAchievements(next);
    });
  }, []);

  const setWordStatus = useCallback((word, status) => {
    setUserData((prev) => {
      const wordStatus = { ...prev.wordStatus, [word]: status };
      const wordsLearned = Object.values(wordStatus).filter((s) => s === 'learned').length;
      const dailyTasks = { ...prev.dailyTasks, vocabDone: true };
      const next = { ...prev, wordStatus, wordsLearned, dailyTasks, _lastModified: new Date().toISOString() };
      return checkAchievements(next);
    });
  }, []);

  const getWordStatus = useCallback(
    (word) => userData.wordStatus[word] || 'new',
    [userData.wordStatus]
  );

  // ── SRS functions ──────────────────────────────────────────
  const reviewWord = useCallback((word, quality) => {
    // quality: 0-5
    setUserData((prev) => {
      const srsData = { ...prev.srsData };
      const card = srsData[word] || { ...SRS_DEFAULT };
      srsData[word] = srsGrade(card, quality);
      return { ...prev, srsData };
    });
  }, []);

  const getWordsForReview = useCallback(() => {
    const now = Date.now();
    const due = [];
    for (const [word, card] of Object.entries(userData.srsData || {})) {
      if (!card.nextReview || new Date(card.nextReview).getTime() <= now) {
        due.push({ word, ...card });
      }
    }
    // Sort by overdue first (oldest nextReview)
    due.sort((a, b) => {
      const at = a.nextReview ? new Date(a.nextReview).getTime() : 0;
      const bt = b.nextReview ? new Date(b.nextReview).getTime() : 0;
      return at - bt;
    });
    return due;
  }, [userData.srsData]);

  // Add a word to SRS if not already tracked
  const addWordToSRS = useCallback((word) => {
    setUserData((prev) => {
      if (prev.srsData[word]) return prev;
      const srsData = { ...prev.srsData, [word]: { ...SRS_DEFAULT, nextReview: new Date().toISOString() } };
      return { ...prev, srsData };
    });
  }, []);

  // Learning Path – save checkpoint score (keep best)
  const saveCheckpointScore = useCallback((unitId, score, total) => {
    setUserData((prev) => {
      const existing = prev.checkpointScores?.[unitId];
      const pct = score / total;
      if (existing && existing.score / existing.total >= pct) return prev;
      return {
        ...prev,
        checkpointScores: {
          ...prev.checkpointScores,
          [unitId]: { score, total, passed: pct >= 0.7, date: new Date().toISOString() },
        },
      };
    });
  }, []);

  const value = {
    userData,
    addXP,
    addSkillXP,
    markLessonCompleted,
    incrementQuizzes,
    setWordStatus,
    getWordStatus,
    reviewWord,
    getWordsForReview,
    addWordToSRS,
    saveCheckpointScore,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function checkAchievements(data) {
  const newAch = [...data.achievements];
  let changed = false;
  for (const ach of ACHIEVEMENTS) {
    if (!newAch.includes(ach.id) && ach.check(data)) {
      newAch.push(ach.id);
      changed = true;
    }
  }
  return changed ? { ...data, achievements: newAch } : data;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
