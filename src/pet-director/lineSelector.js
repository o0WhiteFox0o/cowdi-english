// Chọn câu thoại phù hợp từ LineDB: lọc `when`, kiểm tra biến, chống lặp 7 ngày & liên tiếp, điền biến.

const VAR_REGEX = /\{(\w+)\}/g;

function hasValue(v) {
  if (v === undefined || v === null) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return Number.isFinite(v);
  return Boolean(v);
}

/**
 * Thu thập toàn bộ biến {var} được sử dụng trong chuỗi.
 */
export function extractVars(str) {
  if (!str || typeof str !== 'string') return [];
  const out = [];
  for (const m of str.matchAll(VAR_REGEX)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

/**
 * Điền biến vào chuỗi mẫu; trả về null nếu thiếu bất kỳ biến nào.
 */
export function interpolate(template, vars) {
  if (!template || typeof template !== 'string') return null;
  const needed = extractVars(template);
  for (const key of needed) {
    if (!hasValue(vars?.[key])) return null;
  }
  return template.replace(VAR_REGEX, (_, k) => String(vars[k]).trim());
}

/**
 * Kiểm tra một câu có khớp điều kiện `when` với ngữ cảnh + biến hiện tại hay không.
 */
export function matchesWhen(line, { event, screen, mood, stage, bond, group, night, vars, payload }) {
  if (line.event !== event) return false;
  const w = line.when || {};

  if (Array.isArray(w.screen) && w.screen.length > 0 && !w.screen.includes(screen)) return false;
  if (Array.isArray(w.mood) && w.mood.length > 0 && !w.mood.includes(mood)) return false;
  if (typeof w.stageMin === 'number' && (stage ?? 1) < w.stageMin) return false;
  if (typeof w.stageMax === 'number' && (stage ?? 1) > w.stageMax) return false;
  if (typeof w.bondMin === 'number' && (bond ?? 0) < w.bondMin) return false;
  if (Array.isArray(w.group) && w.group.length > 0 && !w.group.includes(group)) return false;
  if (typeof w.night === 'boolean' && Boolean(night) !== w.night) return false;

  if (typeof w.daysAwayMin === 'number') {
    if (typeof vars?.daysAway !== 'number' || vars.daysAway < w.daysAwayMin) return false;
  }
  if (typeof w.daysAwayMax === 'number') {
    if (typeof vars?.daysAway !== 'number' || vars.daysAway > w.daysAwayMax) return false;
  }
  if (typeof w.streak === 'number') {
    const s = payload?.count ?? vars?.streak;
    if (s !== w.streak) return false;
  }
  if (typeof w.perfect === 'boolean') {
    if (Boolean(payload?.perfect) !== w.perfect) return false;
  }

  // Kiểm tra các biến bắt buộc trong when.needs và trong chuỗi vi/en
  const reqVars = new Set([
    ...(Array.isArray(w.needs) ? w.needs : []),
    ...extractVars(line.vi),
    ...extractVars(line.en),
  ]);
  for (const key of reqVars) {
    if (!hasValue(vars?.[key])) return false;
  }

  return true;
}

function specificityScore(line, petId) {
  const w = line.when || {};
  let score = 0;
  // Ưu tiên câu riêng của loài pet đang dùng (id bắt đầu bằng `<petId>.`)
  if (petId && line.id?.startsWith(`${petId}.`)) score += 10;
  // Ưu tiên câu dùng dữ liệu thật (P6)
  if (Array.isArray(w.needs) && w.needs.length) score += w.needs.length * 3;
  if (typeof w.streak === 'number') score += 4;
  if (typeof w.perfect === 'boolean') score += 4;
  if (typeof w.daysAwayMin === 'number' || typeof w.daysAwayMax === 'number') score += 3;
  if (typeof w.night === 'boolean') score += 3;
  if (typeof w.bondMin === 'number' && w.bondMin > 0) score += 2;
  if (Array.isArray(w.mood) && w.mood.length) score += 2;
  return score;
}

function pickWeighted(candidates, rng = Math.random) {
  if (!candidates.length) return null;
  if (candidates.length === 1) return candidates[0];
  const total = candidates.reduce((sum, c) => sum + (Number(c.weight) > 0 ? Number(c.weight) : 1), 0);
  let r = rng() * total;
  for (const c of candidates) {
    r -= Number(c.weight) > 0 ? Number(c.weight) : 1;
    if (r <= 0) return c;
  }
  return candidates[candidates.length - 1];
}

/**
 * Chọn 1 câu hợp lệ từ danh sách lines, chống lặp trong 7 ngày và chống lặp liên tiếp cùng event.
 * Trả về { line, vi, en } hoặc null.
 */
export function selectLine(lines, params) {
  const {
    event,
    petId,
    night,
    recentLines = {},
    lastLineId = null,
    vars = {},
    rng = Math.random,
  } = params;

  if (!Array.isArray(lines) || !lines.length) return null;

  let candidates = lines.filter((line) => {
    if (!line || !line.id) return false;
    if (recentLines[line.id]) return false;
    return matchesWhen(line, params);
  });

  if (!candidates.length) return null;

  // Chống lặp 2 lần liên tiếp cùng event khi có >1 ứng viên (vẫn cho phép dùng lại sau khi hết hạn 7 ngày nếu kho chỉ có 1 câu)
  if (lastLineId && candidates.length > 1) {
    const nonRepeat = candidates.filter((c) => c.id !== lastLineId);
    if (nonRepeat.length) candidates = nonRepeat;
  }

  // Giờ yên (21:00–06:00): app_open chỉ dùng nhóm night: true theo nguyên tắc §4.3
  if (night && event === 'app_open') {
    const nightOnly = candidates.filter((c) => c.when?.night === true);
    if (!nightOnly.length) return null;
    candidates = nightOnly;
  }

  // Ưu tiên mức cụ thể cao nhất (dùng số liệu thật & câu riêng của loài pet theo P6)
  let maxSpec = -1;
  for (const c of candidates) {
    const s = specificityScore(c, petId);
    if (s > maxSpec) maxSpec = s;
  }
  const topTier = candidates.filter((c) => specificityScore(c, petId) === maxSpec);
  const chosen = pickWeighted(topTier, rng);
  if (!chosen) return null;

  const vi = interpolate(chosen.vi, vars);
  if (!vi) return null;
  const en = chosen.en ? interpolate(chosen.en, vars) : null;

  return { line: chosen, vi, en };
}
