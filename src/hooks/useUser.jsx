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
};

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
  const [userData, setUserData] = useState(() => loadUserData(null));
  const syncTimerRef = useRef(null);
  const currentUserIdRef = useRef(null);

  // ── Khi user thay đổi (login/logout) – load đúng dữ liệu ───────────────────
  useEffect(() => {
    const uid = user?.id || null;
    if (uid === currentUserIdRef.current) return; // không thay đổi
    currentUserIdRef.current = uid;

    if (!uid) {
      // Logout – reset về data không đăng nhập (anonymous)
      setUserData(loadUserData(null));
      return;
    }

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
      })
      .catch(() => {
        setUserData(loadUserData(uid));
      });
  }, [user?.id]);

  // ── Persist to localStorage on every userData change ────────────────────
  useEffect(() => {
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

  const value = {
    userData,
    addXP,
    markLessonCompleted,
    incrementQuizzes,
    setWordStatus,
    getWordStatus,
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
