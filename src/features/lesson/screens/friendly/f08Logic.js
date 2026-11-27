/**
 * Pure logic cho F-08 Lật cặp đồng cỏ (PHASE3 §2 F-08 + test P2).
 *
 * Định nghĩa firstTry:
 * Một cặp tính đúng lần đầu nếu LẦN ĐẦU CẢ HAI THẺ ĐÃ TỪNG LẬT,
 * người học ghép đúng ngay (không có lần lật sai liên quan cặp đó sau khi đã thấy cả hai).
 */

export function createMemoryDeck(pairs, rng = Math.random) {
  const cards = [];
  pairs.forEach((p, idx) => {
    const pairId = p.pairId || `pair-${idx}`;
    cards.push({
      id: `${pairId}:en`,
      pairId,
      side: 'en',
      text: p.word,
      meaning: p.meaning,
      wordId: p.wordId,
      isGuest: Boolean(p.isGuest),
    });
    cards.push({
      id: `${pairId}:vi`,
      pairId,
      side: 'vi',
      text: p.meaning,
      meaning: p.meaning,
      wordId: p.wordId,
      isGuest: Boolean(p.isGuest),
    });
  });

  // Fisher-Yates shuffle bằng seeded rng
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function initMemoryState(cards) {
  return {
    cards,
    flippedIds: [],
    matchedPairIds: [],
    seenCardIds: {},
    pairWrongAfterSeenBoth: {},
    pairFirstTry: {},
    wrongFlips: 0,
    consecutiveWrong: 0,
    pendingMismatch: false,
    lastFlippedCard: null,
  };
}

function hasSeenBothCards(seenCardIds, pairId) {
  return Boolean(seenCardIds[`${pairId}:en`] && seenCardIds[`${pairId}:vi`]);
}

/**
 * Xử lý 1 lượt chạm thẻ.
 * Trả về { state, outcome: 'ignore' | 'first' | 'match' | 'mismatch', matchedCard? }
 */
export function flipMemoryCard(state, cardId) {
  if (state.pendingMismatch) return { state, outcome: 'ignore' };
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return { state, outcome: 'ignore' };
  if (state.matchedPairIds.includes(card.pairId)) return { state, outcome: 'ignore' };
  if (state.flippedIds.includes(cardId)) return { state, outcome: 'ignore' };
  if (state.flippedIds.length >= 2) return { state, outcome: 'ignore' };

  const seenCardIds = { ...state.seenCardIds, [cardId]: true };

  if (state.flippedIds.length === 0) {
    return {
      outcome: 'first',
      card,
      state: {
        ...state,
        seenCardIds,
        flippedIds: [cardId],
        lastFlippedCard: card,
      },
    };
  }

  const firstId = state.flippedIds[0];
  const firstCard = state.cards.find((c) => c.id === firstId);
  const flippedIds = [firstId, cardId];

  // Cùng cặp → ghép đúng!
  if (firstCard && firstCard.pairId === card.pairId) {
    const pairId = card.pairId;
    const isFirstTry = !state.pairWrongAfterSeenBoth[pairId];
    return {
      outcome: 'match',
      card,
      pairId,
      isFirstTry,
      state: {
        ...state,
        seenCardIds,
        flippedIds: [],
        matchedPairIds: [...state.matchedPairIds, pairId],
        pairFirstTry: { ...state.pairFirstTry, [pairId]: isFirstTry },
        consecutiveWrong: 0,
        pendingMismatch: false,
        lastFlippedCard: card,
      },
    };
  }

  // Khác cặp → lật sai.
  // Nếu cặp nào trong 2 thẻ này ĐÃ TỪNG thấy cả 2 thẻ (tính cả trước lượt lật này) thì đánh dấu cặp đó mất firstTry.
  // Lưu ý: nếu lần lật này chính là lần ĐẦU TIÊN thẻ thứ 2 của cặp A xuất hiện (trước lượt này chưa thấy cả hai),
  // người học vừa mới thấy nó lần đầu nên CHƯA tính là bỏ lỡ cặp A — trừ khi trước lượt này đã thấy cả hai thẻ của cặp A!
  const pairWrongAfterSeenBoth = { ...state.pairWrongAfterSeenBoth };
  if (firstCard && hasSeenBothCards(state.seenCardIds, firstCard.pairId)) {
    pairWrongAfterSeenBoth[firstCard.pairId] = true;
  }
  if (hasSeenBothCards(state.seenCardIds, card.pairId)) {
    pairWrongAfterSeenBoth[card.pairId] = true;
  }

  return {
    outcome: 'mismatch',
    card,
    firstCard,
    state: {
      ...state,
      seenCardIds,
      flippedIds,
      pairWrongAfterSeenBoth,
      wrongFlips: state.wrongFlips + 1,
      consecutiveWrong: state.consecutiveWrong + 1,
      pendingMismatch: true,
      lastFlippedCard: card,
    },
  };
}

export function clearMemoryMismatch(state) {
  if (!state.pendingMismatch) return state;
  return {
    ...state,
    flippedIds: [],
    pendingMismatch: false,
  };
}

export function summarizeMemoryState(state) {
  const seenPairs = new Map();
  for (const c of state.cards) {
    if (!seenPairs.has(c.pairId)) seenPairs.set(c.pairId, c);
  }
  let total = 0;
  let firstTryCorrect = 0;
  let guestTotal = 0;
  let guestCorrect = 0;

  for (const [pairId, c] of seenPairs.entries()) {
    const ok = Boolean(state.pairFirstTry[pairId]);
    if (c.isGuest) {
      guestTotal += 1;
      if (ok) guestCorrect += 1;
    } else {
      total += 1;
      if (ok) firstTryCorrect += 1;
    }
  }
  return { total, firstTryCorrect, guestTotal, guestCorrect };
}
