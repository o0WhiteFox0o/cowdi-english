// ── 3-Group Learning Path Engine (Mới học · Trung bình · Luyện thi) ─────────
// Thiết kế: docs/04-design/SDD-LEARNING-GROUPS-v2.0.md §3.4, §4.6, §6.1–6.2
import { BEGINNER_UNITS, INTERMEDIATE_UNITS, EXAM_INTRO_UNIT, EXAM_PRON_UNIT } from './config/units.js';
import { getGroup, getGroupOfPath } from './config/groups.js';
import { EXAM_PATHS } from './lessons/paths.js';

const BEGINNER_PATH = {
  id: 'beginner',
  groupId: 'beginner',
  title: 'Mới học (Starter)',
  subtitle: 'Nhìn hình, nghe và nhắc lại (Pre-A1–A1)',
  icon: '🌱',
  color: '#7DBE4B',
  description: 'Lộ trình cơ bản từ con số 0 với thẻ hình minh hoạ và mẫu câu ngắn.',
  targetLevel: 'Pre-A1 – A1',
  units: BEGINNER_UNITS,
};

const INTERMEDIATE_PATH = {
  id: 'intermediate',
  groupId: 'intermediate',
  title: 'Trung bình',
  subtitle: 'Giao tiếp, ngữ pháp & đọc hiểu (A2–B1)',
  icon: '🌳',
  color: '#4EA8E8',
  description: 'Lộ trình 10 unit từ làm quen đến giao tiếp, đời sống và công việc.',
  targetLevel: 'CEFR A2 – B1',
  units: INTERMEDIATE_UNITS,
};

/** Tất cả 7 lộ trình: beginner, intermediate, ielts, b1, b2, toeic, advanced */
export const ALL_PATHS = [
  BEGINNER_PATH,
  INTERMEDIATE_PATH,
  ...EXAM_PATHS,
];

export function getPathById(id) {
  if (id === 'general') return INTERMEDIATE_PATH;
  return ALL_PATHS.find((p) => p.id === id) || INTERMEDIATE_PATH;
}

/** Lộ trình `advanced` (C1–C2) mở khi đã qua `int-u10` hoặc vượt tầng C kiểm tra đầu vào. */
export function isAdvancedUnlocked(userData) {
  const scores = userData?.checkpointScores || {};
  if (scores['int-u10']?.passed) return true;
  if (userData?.placement?.tierScores?.C >= 5) return true;
  return false;
}

/**
 * Kiểm tra một unit đã qua hay chưa (mọi source: checkpoint / placement / legacy).
 */
export function isUnitPassed(unit, userData) {
  if (!unit || unit.comingSoon || !(unit.lessons?.length)) return true;
  const scores = userData?.checkpointScores || {};
  if (unit.checkpoint) return Boolean(scores[unit.id]?.passed);
  const completed = new Set(userData?.completedLessons || []);
  return unit.lessons.every((id) => completed.has(id));
}

/**
 * Xây danh sách node có thứ tự của một lộ trình theo luật nhóm (L3).
 * Trạng thái node: 'done' | 'current' | 'open' | 'placed' | 'locked'
 */
export function buildPathNodes(path, userData) {
  if (!path) return [];
  const group = getGroupOfPath(path.id) || getGroup('intermediate');
  const rules = group.rules;
  const completed = new Set(userData?.completedLessons || []);
  const scores = userData?.checkpointScores || {};
  const requiredUnits = Array.isArray(path.requiredUnits) ? path.requiredUnits : [];

  const nodes = [];
  let prevSequentialPassed = true;
  let currentAssigned = false;

  // Tìm Unit cao nhất mà người dùng đã có bài hoàn thành (để không khoá nhầm các Unit trước đó và đặt con bò đúng chỗ)
  let highestCompletedUnitIndex = -1;
  path.units.forEach((u, idx) => {
    if (!u.comingSoon && Array.isArray(u.lessons) && u.lessons.some((id) => completed.has(id))) {
      highestCompletedUnitIndex = idx;
    }
  });

  path.units.forEach((unit, unitIndex) => {
    if (unit.comingSoon || !Array.isArray(unit.lessons) || unit.lessons.length === 0) {
      return;
    }

    // 1. Xác định unit đã mở chưa
    let unitUnlocked = false;
    if (rules.unitOrder === 'required-then-free' && requiredUnits.length > 0) {
      const reqIdx = requiredUnits.indexOf(unit.id);
      if (reqIdx === 0) {
        unitUnlocked = true;
      } else if (reqIdx > 0) {
        unitUnlocked = requiredUnits.slice(0, reqIdx).every((rid) => Boolean(scores[rid]?.passed));
      } else {
        unitUnlocked = requiredUnits.every((rid) => Boolean(scores[rid]?.passed));
      }
    } else {
      unitUnlocked = prevSequentialPassed || unitIndex <= highestCompletedUnitIndex;
    }

    const cpRecord = scores[unit.id];
    const isImpliedCompleted = rules.unitOrder !== 'required-then-free' && unitIndex < highestCompletedUnitIndex;
    const unitPassed = (unit.checkpoint ? Boolean(cpRecord?.passed) : unit.lessons.every((id) => completed.has(id))) || isImpliedCompleted;
    const isPlacedUnit = Boolean(cpRecord?.passed && (cpRecord.source === 'placement' || cpRecord.source === 'legacy')) || isImpliedCompleted;
    const allLessonsDone = unit.lessons.every((id) => completed.has(id));

    // 2. Tạo node cho từng bài trong unit
    let prevLessonDone = true;
    const unitLessonNodes = [];

    unit.lessons.forEach((lessonId) => {
      const done = completed.has(lessonId);
      let status = 'locked';
      if (done) {
        status = 'done';
      } else if (unitUnlocked) {
        if (isPlacedUnit) {
          status = 'placed';
        } else if (rules.lessonOrder === 'sequential') {
          status = prevLessonDone ? 'open' : 'locked';
        } else {
          status = 'open';
        }
      }
      const node = {
        type: 'lesson',
        key: `l:${lessonId}`,
        lessonId,
        unit,
        unitIndex,
        status,
        index: nodes.length,
      };
      nodes.push(node);
      unitLessonNodes.push(node);
      prevLessonDone = prevLessonDone && done;
    });

    // 3. Tạo node kiểm tra unit (checkpoint)
    let cpNode = null;
    if (unit.checkpoint) {
      let cpStatus = 'locked';
      if (unitPassed) {
        cpStatus = 'done';
      } else if (unitUnlocked && (allLessonsDone || rules.checkpoint?.allowTestOut)) {
        cpStatus = 'open';
      }
      cpNode = {
        type: 'checkpoint',
        key: `c:${unit.id}`,
        unit,
        unitIndex,
        status: cpStatus,
        source: cpRecord?.source || null,
        isTestOut: !allLessonsDone && Boolean(rules.checkpoint?.allowTestOut) && cpStatus !== 'done',
        index: nodes.length,
      };
      nodes.push(cpNode);
    }

    // 4. Chọn đúng 1 node `current` (bài chưa done đầu tiên trong unit mở đầu tiên chưa qua;
    //    nếu xong hết bài thì là checkpoint của unit đó)
    if (!currentAssigned && unitUnlocked && !unitPassed) {
      const firstOpenLesson = unitLessonNodes.find((n) => n.status === 'open');
      if (firstOpenLesson) {
        firstOpenLesson.status = 'current';
        currentAssigned = true;
      } else if (allLessonsDone && cpNode && cpNode.status === 'open') {
        cpNode.status = 'current';
        currentAssigned = true;
      }
    }

    prevSequentialPassed = prevSequentialPassed && unitPassed;
  });

  // Nếu người dùng đã có tiến độ ở Unit cao hơn (vd Unit 4) mà chưa xong hết, ưu tiên đặt con bò ('current') tại Unit cao nhất đó
  if (highestCompletedUnitIndex >= 0) {
    const existingCurrent = nodes.find((n) => n.status === 'current');
    if (!existingCurrent || existingCurrent.unitIndex !== highestCompletedUnitIndex) {
      const preferredOpen = nodes.find((n) => n.unitIndex === highestCompletedUnitIndex && n.status === 'open');
      if (preferredOpen) {
        if (existingCurrent) existingCurrent.status = 'open';
        preferredOpen.status = 'current';
      }
    }
  }

  return nodes;
}

/** Tìm lộ trình đầu tiên chứa lessonId (fallback khi không có pathId/learnerGroup). */
export function findPathForLesson(lessonId) {
  for (const path of ALL_PATHS) {
    for (const unit of path.units) {
      if (Array.isArray(unit.lessons) && unit.lessons.includes(lessonId)) {
        return { path, unit };
      }
    }
  }
  return null;
}

/**
 * Xác định trạng thái khoá/mở của một bài học theo `pathId` (hoặc `activePath` → `learnerGroup`).
 */
export function getLessonAccess(lessonId, userData, pathId) {
  const findInPath = (pid) => {
    if (!pid) return null;
    const p = ALL_PATHS.find((x) => x.id === pid);
    if (!p) return null;
    const u = p.units.find((unit) => Array.isArray(unit.lessons) && unit.lessons.includes(lessonId));
    return u ? { path: p, unit: u } : null;
  };

  let found = findInPath(pathId) || findInPath(userData?.activePath);

  if (!found && userData?.learnerGroup) {
    const grp = getGroup(userData.learnerGroup);
    if (grp) {
      for (const pid of grp.paths) {
        found = findInPath(pid);
        if (found) break;
      }
    }
  }

  if (!found) found = findPathForLesson(lessonId);
  if (!found) return { locked: false };

  // Lộ trình advanced khoá cho tới khi qua int-u10 hoặc vượt tầng C
  if (found.path.id === 'advanced' && !isAdvancedUnlocked(userData)) {
    return {
      locked: true,
      ...found,
      blocker: { type: 'checkpoint', unit: INTERMEDIATE_UNITS[INTERMEDIATE_UNITS.length - 1] },
    };
  }

  const nodes = buildPathNodes(found.path, userData);
  const idx = nodes.findIndex((n) => n.type === 'lesson' && n.lessonId === lessonId);
  if (idx < 0) return { locked: false, ...found };
  const node = nodes[idx];
  if (node.status !== 'locked') return { locked: false, status: node.status, ...found };

  const blocker =
    nodes.slice(0, idx).find((n) => n.status === 'current') ||
    nodes.slice(0, idx).find((n) => n.status !== 'done' && n.status !== 'placed') ||
    nodes[idx - 1];
  return { locked: true, status: 'locked', ...found, blocker };
}

/** Node kế tiếp người học nên làm trên lộ trình. */
export function getNextPathLesson(userData, pathId) {
  const pid = pathId || userData?.activePath || 'intermediate';
  const nodes = buildPathNodes(getPathById(pid), userData);
  const cur = nodes.find((n) => n.status === 'current');
  if (!cur) return null;
  if (cur.type === 'lesson') return { type: 'lesson', lessonId: cur.lessonId, unit: cur.unit };
  return { type: 'checkpoint', unit: cur.unit };
}

/** Tóm tắt tiến độ của một lộ trình. */
export function getPathProgress(path, userData) {
  const nodes = buildPathNodes(path, userData);
  const total = nodes.length;
  const done = nodes.filter((n) => n.status === 'done' || n.status === 'placed').length;
  const currentIdx = nodes.findIndex((n) => n.status === 'current');
  const playableUnits = (path?.units || []).filter((u) => !u.comingSoon && u.lessons?.length > 0);
  const currentUnit = currentIdx >= 0 ? nodes[currentIdx].unit : playableUnits[playableUnits.length - 1];
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0, currentUnit, nodes };
}

/**
 * Ước tính Sữa tối đa nhận được từ quiz của một bài học (sửa H8 — mục 4.6).
 * Khớp công thức goToNextQuestion: base = qCount * 10 + 30 (perfect), lần đầu +60, làm lại 1/3.
 */
export function estimateLessonMilk(lesson, { isRepeat = false } = {}) {
  const qCount = lesson?.format === 'picture'
    ? 6
    : Math.max(1, (lesson?.quiz || []).length || 10);
  const base = qCount * 10 + 30;
  return isRepeat ? Math.max(5, Math.round(base / 3)) : base + 60;
}

/**
 * Di trú tiến độ người dùng cũ (mục 6.1) — idempotent.
 * Đánh dấu `source: 'legacy'` cho các unit mới mà mọi bài đã nằm trong `completedLessons`
 * (chưa có checkpointScores), giữ nguyên mọi bản ghi cũ `unit-1..unit-9`.
 */
export function migrateLegacyProgress(userData) {
  if (!userData) return { changed: false, userData };
  const completed = new Set(userData.completedLessons || []);
  const existingScores = userData.checkpointScores || {};
  const nextScores = { ...existingScores };
  let changed = false;

  const targetUnits = [
    ...INTERMEDIATE_UNITS,
    EXAM_INTRO_UNIT,
    EXAM_PRON_UNIT,
    ...EXAM_PATHS.filter((p) => p.id === 'ielts')
      .flatMap((p) => p.units.filter((u) => u.id.startsWith('ielts-unit-topics-'))),
  ];

  const today = new Date().toISOString().slice(0, 10);
  for (const unit of targetUnits) {
    if (!unit.lessons?.length) continue;
    if (nextScores[unit.id]) continue;
    const allDone = unit.lessons.every((id) => completed.has(id));
    if (allDone) {
      nextScores[unit.id] = { passed: true, source: 'legacy', score: 0, total: 0, date: today };
      changed = true;
    }
  }

  if (!changed && userData.learningGroupsMigrated) {
    return { changed: false, userData };
  }

  return {
    changed: true,
    userData: {
      ...userData,
      checkpointScores: nextScores,
      learningGroupsMigrated: true,
    },
  };
}

/**
 * Gợi ý nhóm & lộ trình cho người dùng cũ (mục 6.2).
 * Trả về { groupId, pathId } hoặc null nếu user chưa học bài nào.
 */
export function suggestLegacyGroup(userData) {
  const completed = userData?.completedLessons || [];
  if (completed.length === 0) return null;
  const completedSet = new Set(completed);

  const examPathIds = ['ielts', 'toeic', 'b1', 'b2'];
  let bestExamPath = null;
  let bestExamCount = 0;

  for (const pid of examPathIds) {
    const p = EXAM_PATHS.find((x) => x.id === pid);
    if (!p) continue;
    // Chỉ đếm các bài đặc trưng của kỳ thi (trừ 2 unit dùng chung exam-intro, exam-pron)
    const specificLessons = new Set(
      p.units
        .filter((u) => u.id !== 'exam-intro' && u.id !== 'exam-pron')
        .flatMap((u) => u.lessons || [])
    );
    let cnt = 0;
    for (const lid of specificLessons) {
      if (completedSet.has(lid)) cnt++;
    }
    if (cnt > bestExamCount) {
      bestExamCount = cnt;
      bestExamPath = pid;
    }
  }

  if (bestExamPath && bestExamCount > 0) {
    return { groupId: 'exam', pathId: bestExamPath };
  }

  return { groupId: 'intermediate', pathId: 'intermediate' };
}
