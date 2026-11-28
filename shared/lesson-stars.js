/**
 * shared/lesson-stars.js — Công thức Sao ★ 1–3 & Thưởng Sữa theo sao (STD-SCREEN-SYSTEM Q13, PHASE3 §7b).
 * Thuần JS, dùng chung client & server.
 * Thay thế khoản "+30 trọn điểm" cũ → Sữa tối đa lần đầu (Boss 10 câu) vẫn là 190.
 */

export const STAR_BONUS = [0, 0, 15, 30];

export const STAR_RULES = {
  beginner:     { two: 0.75, three: 0.90 },
  intermediate: { two: 0.80, three: 0.95 },
  exam:         { two: 0.80, three: 0.95 },
};

/**
 * Tính kết quả ải: qua ải, độ chính xác lần đầu và số sao (0–3).
 * Không tính: slot 'intro'; item khách quen; slot 'speak' khi group === 'intermediate'.
 * Boss có tính.
 */
export function computeLessonResult({
  group = 'intermediate',
  results = [],
  bossCorrect = 0,
  bossTotal = 0,
  passRate = 0.7,
}) {
  const passed = bossTotal > 0 ? (bossCorrect / bossTotal) >= passRate : true;
  const rule = STAR_RULES[group] || STAR_RULES.intermediate;

  let gradedTotal = 0;
  let gradedFirstTryCorrect = 0;
  let hasBossInResults = false;

  for (const r of Array.isArray(results) ? results : []) {
    if (!r) continue;
    const slot = r.slot;
    if (slot === 'intro') continue;
    if (slot === 'speak' && group === 'intermediate') continue;
    if (slot === 'boss') hasBossInResults = true;

    const total = Math.max(0, Number(r.total) || 0);
    const guestTotal = Math.max(0, Number(r.guestTotal) || 0);
    // Nếu caller truyền total đã bao gồm khách quen (có guestIncluded) thì trừ ra; mặc định total là item chính
    const nonGuestTotal = r.guestIncluded ? Math.max(0, total - guestTotal) : total;
    const firstTryCorrect = Math.max(0, Math.min(nonGuestTotal, Number(r.firstTryCorrect) || 0));

    gradedTotal += nonGuestTotal;
    gradedFirstTryCorrect += firstTryCorrect;
  }

  if (!hasBossInResults && bossTotal > 0) {
    gradedTotal += bossTotal;
    gradedFirstTryCorrect += Math.max(0, Math.min(bossTotal, bossCorrect));
  }

  const accuracy = gradedTotal > 0
    ? gradedFirstTryCorrect / gradedTotal
    : (bossTotal > 0 ? bossCorrect / bossTotal : 1);

  if (!passed) {
    return { passed: false, accuracy, stars: 0, gradedTotal, gradedFirstTryCorrect, rule };
  }

  const bossPerfect = bossTotal === 0 || bossCorrect >= bossTotal;
  let stars = 1;
  if (accuracy >= rule.three && bossPerfect) {
    stars = 3;
  } else if (accuracy >= rule.two) {
    stars = 2;
  }

  return { passed: true, accuracy, stars, gradedTotal, gradedFirstTryCorrect, rule };
}

/**
 * Tính Sữa nhận được từ kết quả ải:
 * - Lần đầu qua ải: bossCorrect*10 + STAR_BONUS[stars] + 60
 * - Làm lại (đã qua trước đó): max(5, round(bossCorrect*10 / 3)) + chênh lệch thưởng sao nếu stars > prevStarsPaid
 * - Chưa qua: max(5, round(bossCorrect*10 / 3))
 */
export function lessonMilk({
  bossCorrect = 0,
  stars = 0,
  isFirstPass = false,
  prevStarsPaid = 0,
}) {
  const safeBoss = Math.max(0, Number(bossCorrect) || 0);
  const safeStars = Math.max(0, Math.min(3, Number(stars) || 0));
  const safePaid = Math.max(0, Math.min(3, Number(prevStarsPaid) || 0));

  if (safeStars >= 1 && isFirstPass) {
    return safeBoss * 10 + (STAR_BONUS[safeStars] || 0) + 60;
  }

  const repeatBase = Math.max(5, Math.round((safeBoss * 10) / 3));
  if (safeStars >= 1 && safeStars > safePaid) {
    const starDiff = Math.max(0, (STAR_BONUS[safeStars] || 0) - (STAR_BONUS[safePaid] || 0));
    return repeatBase + starDiff;
  }

  return repeatBase;
}

/** Gợi ý 1 dòng điều kiện cho sao tiếp theo chưa đạt (hiển thị trên màn Tổng kết). */
export function nextStarHint(stars, group = 'intermediate') {
  const rule = STAR_RULES[group] || STAR_RULES.intermediate;
  if (stars === 0) return 'Đạt ngưỡng câu Boss để qua ải và nhận ★ đầu tiên.';
  if (stars === 1) return `★ thứ 2: trả lời đúng ≥ ${Math.round(rule.two * 100)}% ngay lần đầu.`;
  if (stars === 2) return `★ thứ 3: đúng ≥ ${Math.round(rule.three * 100)}% lần đầu và Boss trọn điểm.`;
  return null;
}
