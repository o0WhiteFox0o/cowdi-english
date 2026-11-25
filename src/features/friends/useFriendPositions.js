import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FRIEND_LIMITS } from '../../../shared/game-config';
import {
  computeFriendPathLayout,
  findNearestFriendAhead,
  detectPassedFriends,
} from './friendPathLogic';

// Cache 5 phút phía client (FR-MAP-08)
let _cachedFriends = null;
let _cachedAt = 0;
let _cachedToken = null;
let _cachedCompletedCount = -1;

export function invalidateFriendPositionsCache() {
  _cachedAt = 0;
}

/**
 * FR-MAP-08: Tải tiến độ bạn bè (cache 5 phút, tự tải lại khi mở trang Lộ trình hoặc sau khi xong bài mới)
 * và tính vị trí trên lộ trình hiện tại bằng chính buildPathNodes / getNextPathLesson.
 */
export function useFriendPositions({
  activePath,
  nodes,
  completedLessonsCount,
  onPassedFriends,
}) {
  const { user, token, authFetch } = useAuth();
  const [friends, setFriends] = useState(() => (_cachedToken === token && _cachedFriends ? _cachedFriends : []));
  const lastReportedRef = useRef('');

  useEffect(() => {
    if (!user || !token) {
      setFriends([]);
      return;
    }

    const now = Date.now();
    const completedChanged = _cachedCompletedCount >= 0 && completedLessonsCount > _cachedCompletedCount;
    const isFresh = _cachedToken === token
      && _cachedFriends !== null
      && !completedChanged
      && (now - _cachedAt) < FRIEND_LIMITS.PATH_CACHE_MS;

    if (isFresh) {
      setFriends(_cachedFriends);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch('/api/friends/path-progress');
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const list = Array.isArray(data?.friends) ? data.friends : [];
        _cachedFriends = list;
        _cachedAt = Date.now();
        _cachedToken = token;
        _cachedCompletedCount = completedLessonsCount;
        if (!cancelled) setFriends(list);
      } catch {
        // Im lặng khi offline
      }
    })();

    return () => { cancelled = true; };
  }, [user, token, authFetch, completedLessonsCount]);

  const layout = useMemo(
    () => computeFriendPathLayout(friends, activePath),
    [friends, activePath]
  );

  // Chỉ số node current của chính người dùng (nếu đã xong cả lộ trình = nodes.length)
  const userCurrentIndex = useMemo(() => {
    if (!Array.isArray(nodes) || nodes.length === 0) return -1;
    const cur = nodes.find((n) => n.status === 'current');
    return cur ? cur.index : nodes.length;
  }, [nodes]);

  const nearestAhead = useMemo(
    () => findNearestFriendAhead(layout.onPathFriends, userCurrentIndex),
    [layout.onPathFriends, userCurrentIndex]
  );

  // FR-MAP-07: So sánh vị trí current trước & sau khi xong bài -> toast "🎉 Bạn vừa vượt qua <biệt danh>!"
  useEffect(() => {
    if (!activePath?.id || userCurrentIndex < 0) return;
    const storageKey = `cowdi_path_idx_${activePath.id}`;
    try {
      const prevRaw = sessionStorage.getItem(storageKey);
      const prevIdx = prevRaw !== null ? Number(prevRaw) : null;

      if (prevIdx !== null && Number.isFinite(prevIdx) && userCurrentIndex > prevIdx && layout.onPathFriends.length > 0) {
        const passed = detectPassedFriends(prevIdx, userCurrentIndex, layout.onPathFriends);
        const sig = `${activePath.id}:${prevIdx}->${userCurrentIndex}:${passed.map((p) => p.userId).join(',')}`;
        if (passed.length > 0 && lastReportedRef.current !== sig) {
          lastReportedRef.current = sig;
          if (typeof onPassedFriends === 'function') {
            onPassedFriends(passed);
          }
          if (token) {
            authFetch('/api/friends/events/path-passed', {
              method: 'POST',
              body: JSON.stringify({
                pathId: activePath.id,
                passedUserIds: passed.map((p) => p.userId),
              }),
            }).catch(() => {});
          }
        }
      }

      sessionStorage.setItem(storageKey, String(userCurrentIndex));
    } catch {
      // Bỏ qua nếu sessionStorage không khả dụng
    }
  }, [activePath?.id, userCurrentIndex, layout.onPathFriends, onPassedFriends, token, authFetch]);

  return {
    friends,
    onPathFriends: layout.onPathFriends,
    otherPathFriends: layout.otherPathFriends,
    byNodeKey: layout.byNodeKey,
    nearestAhead,
  };
}
