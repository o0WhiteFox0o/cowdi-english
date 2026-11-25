// ============================================================
// Cowdi English — Hàm thuần tính vị trí bạn bè trên lộ trình (FR-MAP)
// Dùng CHÍNH buildPathNodes & getNextPathLesson từ src/data/path.js,
// không viết lại luật mở khoá lộ trình.
// ============================================================

import { buildPathNodes, getNextPathLesson } from '../../data/path.js';

/**
 * Chuyển payload tối thiểu từ /api/friends/path-progress sang shape userData
 * tương thích với buildPathNodes / getNextPathLesson.
 */
export function toFriendUserData(friend) {
  const checkpointScores = {};
  for (const unitId of friend?.passedUnits || []) {
    if (typeof unitId === 'string' && unitId) {
      checkpointScores[unitId] = { passed: true };
    }
  }
  return {
    activePath: friend?.activePath || null,
    learnerGroup: friend?.learnerGroup || null,
    completedLessons: Array.isArray(friend?.completedLessons) ? friend.completedLessons : [],
    checkpointScores,
  };
}

/**
 * Tính vị trí của từng bạn bè trên lộ trình `path`:
 * - FR-MAP-02: dùng getNextPathLesson(friendData, path.id); xong cả lộ trình -> node cuối + finished=true (👑).
 * - FR-MAP-03: bạn xuất hiện trên P khi P là activePath của họ HOẶC họ đã xong >= 1 bài thuộc P.
 * - FR-MAP-05: các bạn còn lại gom vào otherPathFriends.
 */
export function computeFriendPathLayout(friends = [], path) {
  if (!path || !Array.isArray(friends) || friends.length === 0) {
    return { onPathFriends: [], otherPathFriends: [], byNodeKey: {} };
  }

  // Xây danh sách node chuẩn của lộ trình để tra chỉ số
  const baseNodes = buildPathNodes(path, { completedLessons: [], checkpointScores: {} });
  const nodeIndexByKey = new Map();
  const pathLessonIds = new Set();
  for (const n of baseNodes) {
    nodeIndexByKey.set(n.key, n.index);
    if (n.type === 'lesson' && n.lessonId) pathLessonIds.add(n.lessonId);
  }
  const lastNode = baseNodes[baseNodes.length - 1] || null;

  const onPathFriends = [];
  const otherPathFriends = [];
  const byNodeKey = {};

  for (const friend of friends) {
    const completed = Array.isArray(friend.completedLessons) ? friend.completedLessons : [];
    const hasCompletedInPath = completed.some((lid) => pathLessonIds.has(lid));
    const isOnThisPath = friend.activePath === path.id || hasCompletedInPath;

    if (!isOnThisPath) {
      otherPathFriends.push(friend);
      continue;
    }

    const friendUserData = toFriendUserData(friend);
    const nextNode = getNextPathLesson(friendUserData, path.id);

    let nodeKey = null;
    let nodeIndex = 0;
    let finished = false;

    if (!nextNode) {
      // Đã xong toàn bộ lộ trình -> đứng tại node cuối + vương miện 👑
      finished = true;
      if (lastNode) {
        nodeKey = lastNode.key;
        nodeIndex = baseNodes.length; // đứng sau mọi node chưa xong
      }
    } else if (nextNode.type === 'lesson') {
      nodeKey = `l:${nextNode.lessonId}`;
      nodeIndex = nodeIndexByKey.get(nodeKey) ?? 0;
    } else if (nextNode.type === 'checkpoint') {
      nodeKey = `c:${nextNode.unit.id}`;
      nodeIndex = nodeIndexByKey.get(nodeKey) ?? 0;
    }

    const placed = {
      ...friend,
      nodeKey,
      nodeIndex,
      finished,
    };
    onPathFriends.push(placed);

    if (nodeKey) {
      if (!byNodeKey[nodeKey]) byNodeKey[nodeKey] = [];
      byNodeKey[nodeKey].push(placed);
    }
  }

  return { onPathFriends, otherPathFriends, byNodeKey };
}

/**
 * FR-MAP-06: Tìm người bạn gần nhất đang đi trước người dùng trên cùng lộ trình.
 */
export function findNearestFriendAhead(onPathFriends = [], userCurrentIndex) {
  if (!Number.isFinite(userCurrentIndex) || userCurrentIndex < 0) return null;
  let best = null;
  for (const f of onPathFriends) {
    if (!Number.isFinite(f.nodeIndex) || f.nodeIndex <= userCurrentIndex) continue;
    const stepsAhead = f.nodeIndex - userCurrentIndex;
    if (!best || stepsAhead < best.stepsAhead) {
      best = { friend: f, stepsAhead };
    }
  }
  return best;
}

/**
 * FR-MAP-07 & AT-09: Phát hiện bạn bè vừa bị người dùng vượt qua sau khi hoàn thành bài mới.
 * Nếu vị trí không tăng (VD: học lại bài cũ -> nextIndex <= prevIndex) thì luôn trả [].
 */
export function detectPassedFriends(prevIndex, nextIndex, onPathFriends = []) {
  if (!Number.isFinite(prevIndex) || !Number.isFinite(nextIndex) || nextIndex <= prevIndex) {
    return [];
  }
  return onPathFriends.filter(
    (f) => Number.isFinite(f.nodeIndex) && f.nodeIndex >= prevIndex && f.nodeIndex < nextIndex
  );
}
