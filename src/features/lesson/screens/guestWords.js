/**
 * Khách quen (STD-SCREEN-SYSTEM Q8, PHASE3 §5).
 * - Lấy từ các bài ĐÃ HOÀN THÀNH (trừ bài hiện tại) có trạng thái F3 là `learning` hoặc `review` (không lấy `known`, `new`).
 * - Ưu tiên `review`, sau đó `lastSeenAt` cũ nhất.
 * - Giới hạn 2–3 từ, không quá 30% tổng số item của màn. Bài đầu tiên → trả mảng rỗng.
 */

import { wordStatus, getWordId } from '../../vocab/wordProgress.js';

export function pickGuestWords({
  currentLesson,
  allLessons = [],
  completedLessons = [],
  wordProgress = {},
  rules = {},
  screenItemCount = 8,
  maxGuests = 3,
}) {
  if (!Array.isArray(completedLessons) || completedLessons.length === 0) return [];
  const capByRatio = Math.floor(screenItemCount * 0.3);
  const limit = Math.min(maxGuests, capByRatio);
  if (limit <= 0) return [];

  const currentIds = new Set((currentLesson?.vocabulary || []).map((v) => getWordId(v)));
  const completedSet = new Set(completedLessons.filter((id) => id !== currentLesson?.id));
  if (completedSet.size === 0) return [];

  const seen = new Set();
  const candidates = [];

  for (const l of allLessons) {
    if (!completedSet.has(l.id)) continue;
    for (const v of l.vocabulary || []) {
      const wid = getWordId(v);
      if (!wid || currentIds.has(wid) || seen.has(wid)) continue;
      const entry = wordProgress[wid];
      const st = wordStatus(entry, rules);
      if (st !== 'learning' && st !== 'review') continue;
      seen.add(wid);
      candidates.push({
        ...v,
        wordId: wid,
        isGuest: true,
        guestStatus: st,
        lastSeenMs: entry?.lastSeenAt ? (Date.parse(entry.lastSeenAt) || 0) : 0,
      });
    }
  }

  candidates.sort((a, b) => {
    const pA = a.guestStatus === 'review' ? 0 : 1;
    const pB = b.guestStatus === 'review' ? 0 : 1;
    if (pA !== pB) return pA - pB;
    return a.lastSeenMs - b.lastSeenMs;
  });

  return candidates.slice(0, limit);
}
