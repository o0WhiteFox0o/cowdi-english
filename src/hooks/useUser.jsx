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
  totalXP: 0,        // Lifetime XP (KHÔNG bao giờ giảm) – dùng cho cấp độ user & leaderboard
  availableXP: 0,    // Ví XP có thể tiêu để nuôi/tiến hóa Pet. Giảm khi spendXP().
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
  dailyJournal: {},   // { 'YYYY-MM-DD': { lessons, quizzes, perfectQuizzes, words, reviews, xp } }
  _lastModified: null,
};

// ── Daily Journal helpers ──────────────────────────────────
const JOURNAL_KEYS = ['lessons', 'quizzes', 'perfectQuizzes', 'words', 'reviews', 'xp'];
const EMPTY_JOURNAL_ENTRY = { lessons: 0, quizzes: 0, perfectQuizzes: 0, words: 0, reviews: 0, xp: 0 };

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Trả về dailyJournal mới sau khi cộng `amount` vào key cho ngày hôm nay.
 * Pure function — không mutate.
 */
function bumpJournal(prev, key, amount = 1) {
  if (!JOURNAL_KEYS.includes(key) || !amount) return prev?.dailyJournal || {};
  const today = todayKey();
  const cur = prev?.dailyJournal?.[today] || { ...EMPTY_JOURNAL_ENTRY };
  return {
    ...(prev?.dailyJournal || {}),
    [today]: { ...EMPTY_JOURNAL_ENTRY, ...cur, [key]: (cur[key] || 0) + amount },
  };
}

// ── SRS SM-2 algorithm helpers ──────────────────────────────
const SRS_DEFAULT = { interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: null };

function srsGrade(card, quality) {
  // quality: 0-5 (0-2 = fail, 3 = hard, 4 = good, 5 = easy)
  // SM-2 chuẩn + Easy bonus để các nút hiển thị khác nhau và khớp
  // với ví dụ: Khó→1 → Nhớ→3 → Dễ→8 → Dễ→21.
  let { interval, easeFactor, repetitions } = card;
  const lapses = (card.lapses || 0) + (quality < 3 ? 1 : 0);
  if (quality >= 3) {
    if (repetitions === 0) {
      interval = quality >= 5 ? 2 : 1;
    } else if (repetitions === 1) {
      if (quality >= 5) interval = 5;
      else if (quality >= 4) interval = 3;
      else interval = 2;
    } else {
      if (quality === 3) interval = Math.max(2, Math.round(interval * 1.2));
      else if (quality === 4) interval = Math.round(interval * easeFactor);
      else interval = Math.round(interval * easeFactor * 1.15); // Easy bonus
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  const nextReview = new Date(Date.now() + interval * 86400000).toISOString();
  return {
    interval,
    easeFactor,
    repetitions,
    nextReview,
    lapses,
    lastReviewedAt: new Date().toISOString(),
    lastQuality: quality,
  };
}

// Điểm "khả năng quên" — càng cao càng nên ưu tiên ôn trước.
// Dùng để chọn 20 từ thông minh thay vì lấy 20 từ đầu danh sách due.
function forgettingScore(card, now = Date.now()) {
  const interval = Math.max(0.5, card.interval || 1);
  const ef = card.easeFactor || 2.5;
  const reps = card.repetitions || 0;
  const lapses = card.lapses || 0;
  const last = card.lastReviewedAt ? new Date(card.lastReviewedAt).getTime() : 0;
  const next = card.nextReview ? new Date(card.nextReview).getTime() : now;

  // Tỉ lệ overdue: thời gian trôi kể từ kế hoạch ôn / khoảng cách dự kiến
  // = 0 nếu chưa đến hạn, > 1 khi vượt quá khoảng giãn cách
  const overdueDays = Math.max(0, (now - next) / 86400000);
  const overdueRatio = overdueDays / interval;

  // Khoảng thời gian từ lần ôn cuối (dùng cho từ chưa từng ôn → ưu tiên cao)
  const sinceLastDays = last ? (now - last) / 86400000 : interval + 1;

  let score = 0;
  // 1) Từ mới chưa được luyện kỹ → ưu tiên cao
  if (reps < 2) score += 60;
  // 2) Từ khó (EF thấp) → ưu tiên
  if (ef < 2.5) score += (2.5 - ef) * 40;
  // 3) Đã quên nhiều lần → ưu tiên (memory leech)
  score += Math.min(60, lapses * 15);
  // 4) Vượt hạn càng lâu so với chu kỳ → ưu tiên
  score += Math.min(80, overdueRatio * 50);
  // 5) Bỏ lâu chưa ôn → ưu tiên nhẹ
  score += Math.min(20, sinceLastDays / 7 * 4);
  // 6) GIẢM ưu tiên với từ đã ghi nhớ tốt (interval & repetitions cao, EF cao)
  if (reps >= 4 && interval >= 14) score -= 25;
  if (reps >= 6 && interval >= 30) score -= 25;
  if (ef >= 2.6 && reps >= 3) score -= 10;
  // 7) Vừa ôn rất gần đây (< 6h) → đẩy xuống cuối để xoay vòng phiên
  if (last && now - last < 6 * 3600 * 1000) score -= 80;

  return score;
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

  // ── Di trú XP wallet ─────────────────────────────────────
  // User cũ chưa có availableXP → khởi tạo bằng totalXP để họ có thể tiêu ngay
  // toàn bộ XP đã tích lũy. Sau lần lưu đầu tiên field sẽ tồn tại và logic sẽ
  // hoạt động bình thường.
  if (typeof sanitized.availableXP !== 'number' || sanitized.availableXP < 0) {
    sanitized.availableXP = Math.max(0, sanitized.totalXP || 0);
  }
  // Bảo vệ: ví không được vượt quá lifetime XP (chống lỗi dữ liệu)
  if (sanitized.availableXP > (sanitized.totalXP || 0)) {
    sanitized.availableXP = sanitized.totalXP || 0;
  }

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

  // Giới hạn dailyJournal: chỉ giữ 180 ngày gần nhất
  if (sanitized.dailyJournal && typeof sanitized.dailyJournal === 'object') {
    const keys = Object.keys(sanitized.dailyJournal).sort();
    if (keys.length > 180) {
      const keep = keys.slice(-180);
      const next = {};
      for (const k of keep) next[k] = sanitized.dailyJournal[k];
      sanitized.dailyJournal = next;
    }
  } else {
    sanitized.dailyJournal = {};
  }

  return sanitized;
}

function compactData(data) {
  const compacted = sanitizeData(data);
  // Loại bỏ internal fields khi gửi lên server
  delete compacted._lastModified;
  return compacted;
}

// Tính streak từ activeDays: đếm ngày liên tiếp kết thúc hôm nay
function calculateStreak(activeDays) {
  const set = new Set(activeDays || []);
  let streak = 0;
  const d = new Date();
  while (set.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
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

  // Giữ XP cao nhất (lifetime)
  merged.totalXP = Math.max(local.totalXP || 0, remote.totalXP || 0);
  // Ví availableXP: lấy GIÁ TRỊ MỚI NHẤT theo _lastModified (vì ví có thể giảm khi tiêu).
  // Nếu local mới hơn → ưu tiên local, ngược lại dùng remote. Mặc định remote.
  if (localTime > remoteTime) {
    merged.availableXP = Math.min(local.availableXP ?? local.totalXP ?? 0, merged.totalXP);
  } else {
    merged.availableXP = Math.min(remote.availableXP ?? remote.totalXP ?? 0, merged.totalXP);
  }

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

  // Merge activeDays – union of both sets
  const localDays = new Set(local.activeDays || []);
  const remoteDays = new Set(remote.activeDays || []);
  merged.activeDays = [...new Set([...localDays, ...remoteDays])];

  // Merge dailyJournal – mỗi ngày giữ counters CỘNG max(local, remote) per key
  // (an toàn nhất khi conflict: dùng max để không mất số đếm)
  const lj = local.dailyJournal || {};
  const rj = remote.dailyJournal || {};
  const journalKeys = new Set([...Object.keys(lj), ...Object.keys(rj)]);
  const mergedJournal = {};
  for (const day of journalKeys) {
    const a = lj[day] || {};
    const b = rj[day] || {};
    const out = { ...EMPTY_JOURNAL_ENTRY };
    for (const k of JOURNAL_KEYS) out[k] = Math.max(a[k] || 0, b[k] || 0);
    mergedJournal[day] = out;
  }
  merged.dailyJournal = mergedJournal;

  // Keep streak & lastActiveDate from the more recent source
  if ((local.lastActiveDate || '') > (remote.lastActiveDate || '')) {
    merged.streak = local.streak || 0;
    merged.lastActiveDate = local.lastActiveDate;
  }

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
        // Re-apply streak logic after merge so server data doesn't overwrite today
        const today = new Date().toDateString();
        if (!final.activeDays.includes(today)) final.activeDays.push(today);
        if (final.lastActiveDate !== today) {
          final.lastActiveDate = today;
          if (final.dailyDate !== today) {
            final.dailyTasks = { lessonDone: false, vocabDone: false };
            final.dailyDate = today;
          }
        }
        final.streak = calculateStreak(final.activeDays);
        setUserData(checkAchievements(final));
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
      const activeDays = [...prev.activeDays];
      if (!activeDays.includes(today)) activeDays.push(today);

      let dailyTasks = prev.dailyTasks;
      let dailyDate  = prev.dailyDate;
      if (dailyDate !== today) {
        dailyTasks = { lessonDone: false, vocabDone: false };
        dailyDate  = today;
      }

      return checkAchievements({
        ...prev,
        streak: calculateStreak(activeDays),
        lastActiveDate: today,
        activeDays,
        dailyTasks,
        dailyDate,
      });
    });
  }, []);

  const addXP = useCallback((amount) => {
    if (!amount || amount <= 0) return;
    setUserData((prev) => {
      const dailyJournal = bumpJournal(prev, 'xp', amount);
      // Cộng cả lifetime (totalXP) và ví có thể tiêu (availableXP)
      const next = {
        ...prev,
        totalXP: (prev.totalXP || 0) + amount,
        availableXP: (prev.availableXP || 0) + amount,
        dailyJournal,
      };
      return checkAchievements(next);
    });
  }, []);

  // Tiêu XP từ ví. Trả về true nếu thành công, false nếu không đủ.
  // Lifetime totalXP KHÔNG bị giảm (giữ thành tích cho leaderboard).
  const spendXP = useCallback((amount) => {
    if (!amount || amount <= 0) return false;
    let ok = false;
    setUserData((prev) => {
      const have = prev.availableXP || 0;
      if (have < amount) return prev;
      ok = true;
      return { ...prev, availableXP: have - amount };
    });
    return ok;
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
      const dailyJournal = bumpJournal(prev, 'lessons', 1);

      // 🔄 Tự động nạp toàn bộ từ vựng của bài vào kho ôn tập SRS
      // (loại bỏ thao tác "Thêm từ vào kho" thủ công)
      const lesson = LESSONS.find((l) => l.id === lessonId);
      const srsData = { ...prev.srsData };
      if (lesson?.vocabulary) {
        for (const v of lesson.vocabulary) {
          if (!srsData[v.word]) {
            srsData[v.word] = { ...SRS_DEFAULT, nextReview: new Date().toISOString() };
          }
        }
      }

      const next = {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        lessonsCompleted: prev.lessonsCompleted + 1,
        dailyTasks: { ...prev.dailyTasks, lessonDone: true },
        dailyJournal,
        srsData,
      };
      return checkAchievements(next);
    });
  }, []);

  const incrementQuizzes = useCallback((isPerfect) => {
    setUserData((prev) => {
      let dailyJournal = bumpJournal(prev, 'quizzes', 1);
      if (isPerfect) {
        dailyJournal = bumpJournal({ ...prev, dailyJournal }, 'perfectQuizzes', 1);
      }
      const next = {
        ...prev,
        quizzesCompleted: prev.quizzesCompleted + 1,
        perfectQuizzes: isPerfect ? prev.perfectQuizzes + 1 : prev.perfectQuizzes,
        dailyJournal,
      };
      return checkAchievements(next);
    });
  }, []);

  const setWordStatus = useCallback((word, status) => {
    setUserData((prev) => {
      const prevStatus = prev.wordStatus?.[word];
      const wordStatus = { ...prev.wordStatus, [word]: status };
      const wordsLearned = Object.values(wordStatus).filter((s) => s === 'learned').length;
      const dailyTasks = { ...prev.dailyTasks, vocabDone: true };
      // Chỉ bơm journal khi từ chuyển SANG 'learned' (lần đầu)
      const dailyJournal =
        status === 'learned' && prevStatus !== 'learned'
          ? bumpJournal(prev, 'words', 1)
          : prev.dailyJournal || {};

      // 🔄 Tự động thêm vào kho SRS khi từ được đánh dấu "đã thuộc"
      // hoặc đang học → không cần nút "Thêm từ vào kho" thủ công nữa.
      const srsData = { ...prev.srsData };
      if ((status === 'learned' || status === 'learning') && !srsData[word]) {
        srsData[word] = { ...SRS_DEFAULT, nextReview: new Date().toISOString() };
      }

      const next = {
        ...prev,
        wordStatus,
        wordsLearned,
        dailyTasks,
        dailyJournal,
        srsData,
        _lastModified: new Date().toISOString(),
      };
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
      const dailyJournal = bumpJournal(prev, 'reviews', 1);
      return { ...prev, srsData, dailyJournal };
    });
  }, []);

  const getWordsForReview = useCallback(() => {
    const now = Date.now();
    const due = [];
    for (const [word, card] of Object.entries(userData.srsData || {})) {
      if (!card.nextReview || new Date(card.nextReview).getTime() <= now) {
        due.push({ word, ...card, _score: forgettingScore(card, now) });
      }
    }
    // 🧠 Sắp xếp theo "khả năng quên" thay vì tuyến tính theo ngày.
    // Từ user đã nhớ kỹ (ef cao, interval dài) sẽ tụt xuống cuối,
    // nhường chỗ cho từ thực sự cần ôn. Từ vừa ôn xong (< 6h) bị
    // đẩy xuống cuối → phiên kế tiếp sẽ là 20 từ KHÁC.
    due.sort((a, b) => b._score - a._score);
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
    spendXP,
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
