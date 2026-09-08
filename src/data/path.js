// ── Linear learning path helpers (Duolingo-style, no skipping) ──────────────
import { UNITS } from './config/units.js';
import { EXAM_PATHS } from './lessons/paths.js';

/** All paths: the general path + each exam path. */
export const ALL_PATHS = [
  { id: 'general', title: 'Lộ trình chung', icon: '🌱', color: '#7DBE4B', units: UNITS },
  ...EXAM_PATHS,
];

export function getPathById(id) {
  return ALL_PATHS.find((p) => p.id === id) || ALL_PATHS[0];
}

/**
 * Build the ordered node list of a path.
 * Node: { type: 'lesson'|'checkpoint', key, lessonId?, unit, unitIndex,
 *         status: 'done'|'current'|'locked', index }
 * Rule: a node is unlocked only when every previous node is done.
 */
export function buildPathNodes(path, userData) {
  const completed = new Set(userData?.completedLessons || []);
  const scores = userData?.checkpointScores || {};
  const nodes = [];
  let prevDone = true;
  let currentAssigned = false;

  path.units.forEach((unit, unitIndex) => {
    unit.lessons.forEach((lessonId) => {
      const done = completed.has(lessonId);
      let status = 'locked';
      if (done) status = 'done';
      else if (prevDone && !currentAssigned) { status = 'current'; currentAssigned = true; }
      nodes.push({ type: 'lesson', key: `l:${lessonId}`, lessonId, unit, unitIndex, status, index: nodes.length });
      prevDone = prevDone && done;
    });

    if (unit.checkpoint) {
      const passed = !!scores[unit.id]?.passed;
      let status = 'locked';
      if (passed) status = 'done';
      else if (prevDone && !currentAssigned) { status = 'current'; currentAssigned = true; }
      nodes.push({ type: 'checkpoint', key: `c:${unit.id}`, unit, unitIndex, status, index: nodes.length });
      prevDone = prevDone && passed;
    }
  });

  return nodes;
}

/** Which path (if any) contains this lesson. */
export function findPathForLesson(lessonId) {
  for (const path of ALL_PATHS) {
    for (const unit of path.units) {
      if (unit.lessons.includes(lessonId)) return { path, unit };
    }
  }
  return null;
}

/**
 * Lock state of a lesson. Lessons outside every path are always open.
 * Returns { locked, path, unit, blocker } where blocker is the node that must
 * be finished first (lesson id or checkpoint unit).
 */
export function getLessonAccess(lessonId, userData) {
  const found = findPathForLesson(lessonId);
  if (!found) return { locked: false };
  const nodes = buildPathNodes(found.path, userData);
  const idx = nodes.findIndex((n) => n.type === 'lesson' && n.lessonId === lessonId);
  if (idx <= 0) return { locked: false, ...found };
  const node = nodes[idx];
  if (node.status !== 'locked') return { locked: false, ...found };
  const blocker = nodes.slice(0, idx).find((n) => n.status !== 'done') || nodes[idx - 1];
  return { locked: true, ...found, blocker };
}

/** Next lesson the learner should do on the general path (or null when done). */
export function getNextPathLesson(userData, pathId = 'general') {
  const nodes = buildPathNodes(getPathById(pathId), userData);
  const cur = nodes.find((n) => n.status === 'current');
  if (!cur) return null;
  if (cur.type === 'lesson') return { type: 'lesson', lessonId: cur.lessonId, unit: cur.unit };
  return { type: 'checkpoint', unit: cur.unit };
}

/** Progress summary of a path. */
export function getPathProgress(path, userData) {
  const nodes = buildPathNodes(path, userData);
  const total = nodes.length;
  const done = nodes.filter((n) => n.status === 'done').length;
  const currentIdx = nodes.findIndex((n) => n.status === 'current');
  const currentUnit = currentIdx >= 0 ? nodes[currentIdx].unit : path.units[path.units.length - 1];
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0, currentUnit, nodes };
}
