/**
 * Pure logic dùng chung cho 5 màn Thân thiện (không import React/JSX — chạy trực tiếp trong node --test).
 * - Hàng đợi item (P1): sai quay lại sau 2–4 slot, tối đa 1 lần.
 * - F-09 Đò chở câu (P3): chấm từng thẻ, sai 1 thẻ → firstTry = false, vẫn hoàn thành.
 * - F-06 Boss sương mù (P4): pet HP tối thiểu 10%, đạt/chưa đạt theo lessonPassRate.
 */

export function createQueueState(items = []) {
  return {
    queue: items.map((item, idx) => ({
      entryId: `${idx}:0`,
      originIndex: idx,
      item,
      isGuest: Boolean(item?.isGuest),
      retried: false,
    })),
    cursor: 0,
    firstTryByOrigin: {},
    guestCorrectByOrigin: {},
    done: items.length === 0,
  };
}

export function advanceQueueState(state, { correct, rng = Math.random }) {
  if (state.done || state.cursor >= state.queue.length) {
    return { ...state, done: true };
  }
  const cur = state.queue[state.cursor];
  const nextQueue = [...state.queue];
  const firstTryByOrigin = { ...state.firstTryByOrigin };
  const guestCorrectByOrigin = { ...state.guestCorrectByOrigin };

  if (firstTryByOrigin[cur.originIndex] === undefined) {
    firstTryByOrigin[cur.originIndex] = Boolean(correct);
  }
  if (cur.isGuest && guestCorrectByOrigin[cur.originIndex] === undefined) {
    guestCorrectByOrigin[cur.originIndex] = Boolean(correct);
  }

  if (!correct && !cur.retried) {
    const offset = 2 + Math.floor(rng() * 3); // 2..4
    const insertAt = Math.min(nextQueue.length, state.cursor + 1 + offset);
    nextQueue.splice(insertAt, 0, {
      ...cur,
      entryId: `${cur.originIndex}:1`,
      retried: true,
    });
  }

  const nextCursor = state.cursor + 1;
  return {
    queue: nextQueue,
    cursor: nextCursor,
    firstTryByOrigin,
    guestCorrectByOrigin,
    done: nextCursor >= nextQueue.length,
  };
}

export function summarizeQueueState(state) {
  const uniqueOrigins = new Map();
  for (const entry of state.queue) {
    if (!uniqueOrigins.has(entry.originIndex)) {
      uniqueOrigins.set(entry.originIndex, entry);
    }
  }
  let total = 0;
  let firstTryCorrect = 0;
  let guestTotal = 0;
  let guestCorrect = 0;

  for (const [originIdx, entry] of uniqueOrigins.entries()) {
    const okFirst = Boolean(state.firstTryByOrigin[originIdx]);
    if (entry.isGuest) {
      guestTotal += 1;
      if (okFirst) guestCorrect += 1;
    } else {
      total += 1;
      if (okFirst) firstTryCorrect += 1;
    }
  }
  return { total, firstTryCorrect, guestTotal, guestCorrect };
}

/** F-09: chấm từng thẻ đặt lên đò (test P3). */
export function evaluateBoatTile({ expectedWords, filledCount, tileWord, hadWrong }) {
  const expected = String(expectedWords[filledCount] || '').trim().toLowerCase();
  const actual = String(tileWord || '').trim().toLowerCase();
  const isRight = expected === actual;
  const nextHadWrong = Boolean(hadWrong) || !isRight;
  const completed = isRight && filledCount + 1 >= expectedWords.length;
  return {
    isRight,
    hadWrong: nextHadWrong,
    firstTry: completed ? !nextHadWrong : null,
    completed,
  };
}

/** F-06: tính HP Pet và Boss sau mỗi lượt trả lời (test P4: pet HP không bao giờ < 10%). */
export function applyBossDamage({ petHp = 100, bossHp = 100, isCorrect, totalQuestions = 10 }) {
  const step = totalQuestions > 0 ? 100 / totalQuestions : 10;
  if (isCorrect) {
    return {
      petHp: Math.max(10, Math.min(100, petHp)),
      bossHp: Math.max(0, Math.round((bossHp - step) * 10) / 10),
    };
  }
  return {
    petHp: Math.max(10, Math.round((petHp - 10) * 10) / 10),
    bossHp: Math.max(0, Math.min(100, bossHp)),
  };
}

/** F-06: kết cục Boss theo lessonPassRate (test P4). */
export function evaluateBossOutcome({ score, total, passRate = 0.7 }) {
  const pct = total > 0 ? score / total : 1;
  const passed = pct >= passRate;
  const perfect = total > 0 && score === total;
  const bossState = !passed ? 'remain' : (perfect ? 'dissolve' : 'flee');
  return { passed, perfect, pct, bossState };
}
