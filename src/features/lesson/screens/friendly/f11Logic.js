/**
 * Pure logic cho F-11 Đọc kiểm chứng Đúng/Sai (PHASE4 §2 F-11, test Q6).
 * - Chọn 6–8 thẻ (hoặc ít hơn nếu bài chỉ có 4–5 câu), giữ tỉ lệ đúng/sai trong khoảng 40–60%.
 */

export function canRunF11(lesson) {
  const list = Array.isArray(lesson?.trueFalse) ? lesson.trueFalse : [];
  return list.length >= 4
    ? { ok: true, missing: [] }
    : { ok: false, missing: ['trueFalse ≥ 4 thẻ Đúng/Sai'] };
}

function shuffleWith(arr, rng) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Chọn bộ thẻ Đúng/Sai sao cho tỉ lệ đúng nằm trong [0.40, 0.60] (test Q6).
 */
export function selectTrueFalseDeck(items = [], rng = Math.random, maxCards = 8) {
  const trues = shuffleWith(items.filter((x) => x && x.isTrue === true), rng);
  const falses = shuffleWith(items.filter((x) => x && x.isTrue === false), rng);
  const totalAvail = trues.length + falses.length;
  if (totalAvail === 0) return [];

  const desiredTotal = Math.min(maxCards, totalAvail);
  // Tìm cặp (tCount, fCount) trong ngân sách có sẵn sao cho tCount / total nằm trong [0.4, 0.6]
  let bestT = Math.min(trues.length, Math.round(desiredTotal / 2));
  let bestF = Math.min(falses.length, desiredTotal - bestT);

  // Điều chỉnh nếu một bên thiếu để giữ tỉ lệ gần 50% (trong 40–60%)
  const tryAdjust = () => {
    const n = bestT + bestF;
    if (n === 0) return;
    while (bestT + bestF > 0) {
      const ratio = bestT / (bestT + bestF);
      if (ratio >= 0.4 && ratio <= 0.6) break;
      if (ratio > 0.6 && bestT > 1) bestT--;
      else if (ratio < 0.4 && bestF > 1) bestF--;
      else break;
    }
  };
  tryAdjust();

  const picked = [
    ...trues.slice(0, bestT),
    ...falses.slice(0, bestF),
  ];
  return shuffleWith(picked, rng);
}
