import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { ACHIEVEMENTS } from '../data/lessons';
import { useAuth } from './useAuth';

const STORAGE_KEY_PREFIX = 'cowdi_english_data';

function getStorageKey(userId) {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

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
  // SRS – Spaced Repetition data per word
  // { [word]: { interval, easeFactor, nextReview (ISO string), repetitions } }
  srsData: {},
  // Learning Path – checkpoint best scores { [unitId]: { score, total, passed } }
  checkpointScores: {},
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
      return { ...DEFAULT_DATA, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_DATA };
}

function saveUserData(data, userId) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
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

    // Login – ưu tiên lấy từ backend, fallback localStorage theo user
    authFetch('/api/progress')
      .then((r) => r.ok ? r.json() : null)
      .then((remote) => {
        const localForUser = loadUserData(uid);
        if (remote && remote.totalXP >= localForUser.totalXP) {
          // Loại bỏ null values để DEFAULT_DATA giữ nguyên defaults
          const cleaned = Object.fromEntries(
            Object.entries(remote).filter(([, v]) => v != null)
          );
          setUserData({ ...DEFAULT_DATA, ...cleaned });
        } else {
          setUserData(localForUser);
        }
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
    saveUserData(userData, user?.id || null);
    // Debounce sync lên backend 3 giây sau lần thay đổi cuối
    if (user) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        authFetch('/api/progress', {
          method: 'PUT',
          body: JSON.stringify(userData),
        }).catch(() => {/* silent fail – localStorage là fallback */});
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
      const next = { ...prev, wordStatus, wordsLearned, dailyTasks };
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
