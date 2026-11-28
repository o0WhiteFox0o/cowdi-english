// src/features/vocab/wordProgress.js
// Mô hình điểm nhớ (memory points) cho từng từ — SDD-FLASHCARD-AUDIO-UX v1.4, mục F3.
// Module thuần (pure): không đọc/ghi storage, không gọi API. Lớp lưu trữ gọi các hàm này.

export const POINTS = { encounter: 1, correct: 2 };
export const POINTS_CAP_EXTRA = 5;          // points tối đa = knownAtPoints + 5
export const TRACKED_SKILLS = ['listen', 'read', 'write', 'speak'];
const DAY_MS = 24 * 60 * 60 * 1000;

/** 4 chấm kỹ năng của một từ (Screen System Đợt 3, mục 6). */
export function emptySkillsHit() {
  return { listen: null, read: null, write: null, speak: null };
}

function normalizeSkillsHit(raw) {
  const base = emptySkillsHit();
  if (!raw || typeof raw !== 'object') return base;
  for (const k of TRACKED_SKILLS) {
    base[k] = typeof raw[k] === 'string' && raw[k] ? raw[k] : null;
  }
  return base;
}

export function countSkillsHit(p) {
  const sh = p?.skillsHit;
  if (!sh || typeof sh !== 'object') return 0;
  let n = 0;
  for (const k of TRACKED_SKILLS) {
    if (sh[k]) n += 1;
  }
  return n;
}

export function missingSkills(p) {
  const sh = p?.skillsHit || {};
  return TRACKED_SKILLS.filter((k) => !sh[k]);
}

export function isMasteredAllSkills(p) {
  return countSkillsHit(p) === TRACKED_SKILLS.length;
}

/** Nhãn UI và màu chấm chuẩn (F3.2 — khai báo một chỗ theo R4). */
export const WORD_STATUS_UI = {
  new:      { label: 'Chưa gặp', color: '#D3D1C7' },
  learning: { label: 'Đang nhớ', color: '#97C459' },
  known:    { label: 'Đã thuộc', color: '#3B6D11' },
  review:   { label: 'Cần ôn',   color: '#EF9F27' },
};

/** Chuẩn hoá ID từ ổn định khi bộ từ chưa có trường id riêng (F3.4). */
export function normalizeWordId(word) {
  return String(word || '').trim().toLowerCase();
}

/** Lấy wordId từ một object từ vựng hoặc chuỗi. */
export function getWordId(w) {
  if (!w) return '';
  if (typeof w === 'string') return normalizeWordId(w);
  return w.id || normalizeWordId(w.word);
}

/** Bản ghi rỗng cho một từ chưa có dữ liệu. */
export function emptyProgress() {
  return {
    points: 0,
    wrongPending: false,
    lastSeenAt: null,
    lastCorrectAt: null,
    lastWrongAt: null,
    encounterTotal: 0,
    correctTotal: 0,
    wrongTotal: 0,
    skillsHit: emptySkillsHit(),
  };
}

const capPoints = (points, rules) =>
  Math.min(points, rules.knownAtPoints + POINTS_CAP_EXTRA);

/**
 * Trạng thái suy ra (không lưu).
 * @returns {'new'|'learning'|'known'|'review'}
 */
export function wordStatus(p, rules) {
  if (!p) return 'new';
  if (p.wrongPending) return 'review';
  if (p.points >= rules.knownAtPoints) return 'known';
  return p.points > 0 ? 'learning' : 'new';
}

/**
 * Cờ dự đoán "Lâu chưa gặp" — chỉ để hiển thị và sắp xếp, KHÔNG đổi trạng thái.
 */
export function isMaybeForgotten(p, rules, now = Date.now()) {
  if (wordStatus(p, rules) !== 'known') return false;
  const last = Math.max(toMs(p.lastSeenAt), toMs(p.lastCorrectAt));
  if (!last) return false;
  return now - last >= rules.maybeForgetDays * DAY_MS;
}

/**
 * Lượt gặp trên flashcard (lật thẻ hoặc bấm loa trên thẻ). Tự đọc KHÔNG gọi hàm này.
 * runSet: Set các wordId đã cộng điểm gặp trong lượt mở flashcard hiện tại.
 */
export function applyEncounter(p, runSet, wordId, rules, nowIso = new Date().toISOString()) {
  const cur = p || emptyProgress();
  const next = { ...cur, lastSeenAt: nowIso };          // vẫn cập nhật lastSeenAt để xoá cờ "Lâu chưa gặp"
  if (runSet.has(wordId)) return next;
  runSet.add(wordId);
  next.points = capPoints(cur.points + POINTS.encounter, rules);
  next.encounterTotal = cur.encounterTotal + 1;
  return next;
}

/**
 * Kết quả một câu hỏi kiểm tra từ này.
 * runSet: Set các wordId đã cộng điểm đúng trong lượt làm bài hiện tại.
 */
export function applyAnswer(p, runSet, wordId, correct, rules, nowIso = new Date().toISOString()) {
  const cur = p || emptyProgress();
  const skillsHit = normalizeSkillsHit(cur.skillsHit);
  if (!correct) {
    return {
      ...cur,
      points: 0,
      wrongPending: true,
      wrongTotal: cur.wrongTotal + 1,
      lastWrongAt: nowIso,
      skillsHit,
    };
  }
  const add = runSet.has(wordId) ? 0 : POINTS.correct;
  runSet.add(wordId);
  return {
    ...cur,
    points: capPoints(cur.points + add, rules),
    wrongPending: false,
    correctTotal: cur.correctTotal + 1,
    lastCorrectAt: nowIso,
    skillsHit,
  };
}

/**
 * Ghi nhận 1 chấm kỹ năng (listen | read | write | speak) khi trả lời đúng (Đợt 3, mục 6).
 * Đủ 4 chấm → points = max(points, knownAtPoints), wrongPending = false → 'known'.
 */
export function applySkillHit(p, skill, rules, nowIso = new Date().toISOString()) {
  const cur = p || emptyProgress();
  if (!TRACKED_SKILLS.includes(skill)) return cur;
  const skillsHit = { ...normalizeSkillsHit(cur.skillsHit), [skill]: nowIso };
  const allFour = TRACKED_SKILLS.every((k) => Boolean(skillsHit[k]));
  const knownAt = rules?.knownAtPoints ?? 4;
  return {
    ...cur,
    skillsHit,
    lastSeenAt: nowIso,
    lastCorrectAt: nowIso,
    points: allFour ? Math.max(cur.points || 0, knownAt) : (cur.points || 0),
    wrongPending: allFour ? false : Boolean(cur.wrongPending),
  };
}

/**
 * Áp kết quả một câu hỏi cho mọi từ trong question.targetWords.
 * Câu không có targetWords → trả về progressMap nguyên vẹn (không đoán).
 */
export function applyQuestionResult(progressMap, question, correct, runSet, rules, nowIso) {
  const targets = Array.isArray(question?.targetWords) ? question.targetWords : [];
  if (targets.length === 0) return progressMap;
  const out = { ...progressMap };
  for (const id of targets) out[id] = applyAnswer(out[id], runSet, id, correct, rules, nowIso);
  return out;
}

/** Gộp dữ liệu từ 2 thiết bị (offline rồi đồng bộ). */
export function mergeProgress(a, b) {
  if (!a) return b;
  if (!b) return a;
  const lastWrongAt = latestIso(a.lastWrongAt, b.lastWrongAt);
  const lastCorrectAt = latestIso(a.lastCorrectAt, b.lastCorrectAt);
  const wrongIsNewest = toMs(lastWrongAt) > toMs(lastCorrectAt);
  const shA = normalizeSkillsHit(a.skillsHit);
  const shB = normalizeSkillsHit(b.skillsHit);
  const mergedSkillsHit = {};
  for (const k of TRACKED_SKILLS) {
    mergedSkillsHit[k] = latestIso(shA[k], shB[k]);
  }
  return {
    points: wrongIsNewest
      ? pointsAfter(a, b, lastWrongAt)
      : Math.max(a.points, b.points),
    wrongPending: wrongIsNewest,
    lastSeenAt: latestIso(a.lastSeenAt, b.lastSeenAt),
    lastCorrectAt,
    lastWrongAt,
    encounterTotal: Math.max(a.encounterTotal, b.encounterTotal),
    correctTotal: Math.max(a.correctTotal, b.correctTotal),
    wrongTotal: Math.max(a.wrongTotal, b.wrongTotal),
    skillsHit: mergedSkillsHit,
  };
}

/** Gộp hai bản đồ wordProgress theo từng wordId. */
export function mergeProgressMap(localMap = {}, remoteMap = {}) {
  const out = {};
  const keys = new Set([...Object.keys(localMap || {}), ...Object.keys(remoteMap || {})]);
  for (const id of keys) {
    out[id] = mergeProgress(localMap?.[id], remoteMap?.[id]);
  }
  return out;
}

// Sau lần sai mới nhất, chỉ giữ điểm của bản ghi chứa lần sai đó (điểm đã về 0 rồi cộng lại nếu có).
function pointsAfter(a, b, lastWrongAt) {
  const owner = a.lastWrongAt === lastWrongAt ? a : b;
  return owner.points;
}

/**
 * Thứ tự thẻ khi mở flashcard (chốt lúc mở, không đổi giữa chừng).
 * review → known có cờ "Lâu chưa gặp" → new → learning → known. Giữ thứ tự gốc trong nhóm.
 */
export function orderCards(words, progressMap, rules, now = Date.now()) {
  const rank = (w) => {
    const id = getWordId(w);
    const p = progressMap?.[id];
    const s = wordStatus(p, rules);
    if (s === 'review') return 0;
    if (s === 'known' && isMaybeForgotten(p, rules, now)) return 1;
    if (s === 'new') return 2;
    if (s === 'learning') return 3;
    return 4;
  };
  return words
    .map((w, i) => ({ w, i, r: rank(w) }))
    .sort((x, y) => x.r - y.r || x.i - y.i)
    .map((x) => x.w);
}

/** Migration từ dữ liệu "đã thuộc" cũ (do người học tự bấm, không đáng tin) → learning 1 điểm. */
export function migrateLegacyKnown(legacyKnownIds, nowIso = new Date().toISOString()) {
  const out = {};
  for (const rawId of legacyKnownIds) {
    const id = normalizeWordId(rawId);
    if (!id) continue;
    out[id] = { ...emptyProgress(), points: 1, encounterTotal: 1, lastSeenAt: nowIso };
  }
  return out;
}

function toMs(iso) { return iso ? Date.parse(iso) || 0 : 0; }
function latestIso(x, y) { return toMs(x) >= toMs(y) ? (x ?? y ?? null) : y; }
