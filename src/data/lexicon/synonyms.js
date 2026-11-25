// ════════════════════════════════════════════════════════════════
// Lexicon: Bảng từ đồng nghĩa & biến thể chính tả Anh-Mỹ (Q-L1-SYN)
// Chuẩn: docs/05-implementation/content/STD-QUESTION-QUALITY-v1.0.md §3.4.3–3.4.4
// Pure JS — chạy được cả Node và trình duyệt.
// ════════════════════════════════════════════════════════════════

export const SYNONYM_GROUPS = [
  ['hello', 'hi'],
  ['bye', 'goodbye'],
  ['thanks', 'thank you'],
  ['chef', 'cook'],
  ['mom', 'mother', 'mum'],
  ['dad', 'father'],
  ['grandma', 'grandmother'],
  ['grandpa', 'grandfather'],
  ['big', 'large'],
  ['small', 'little'],
  ['home', 'house'],
  ['kid', 'child'],
  ['happy', 'glad'],
  ['sad', 'unhappy'],
  ['fast', 'quick'],
  ['start', 'begin'],
  ['car', 'automobile'],
  ['bike', 'bicycle'],
  ['movie', 'film'],
  ['sick', 'ill'],
  ['smart', 'clever'],
  ['angry', 'mad'],
  ['scared', 'afraid'],
  ['shop', 'store'],
  ['couch', 'sofa'],
  ['taxi', 'cab'],
  ['gift', 'present'],
  ['vacation', 'holiday'],
];

export const SPELLING_VARIANT_GROUPS = [
  ['color', 'colour'],
  ['favorite', 'favourite'],
  ['center', 'centre'],
  ['gray', 'grey'],
  ['theater', 'theatre'],
  ['neighbor', 'neighbour'],
  ['program', 'programme'],
  ['traveling', 'travelling'],
  ['canceled', 'cancelled'],
  ['realize', 'realise'],
  ['organize', 'organise'],
  ['apologize', 'apologise'],
  ['defense', 'defence'],
  ['license', 'licence'],
  ['check', 'cheque'],
];

const ALL_GROUPS = [...SYNONYM_GROUPS, ...SPELLING_VARIANT_GROUPS];

const GROUP_INDEX = new Map();
ALL_GROUPS.forEach((group, idx) => {
  for (const term of group) {
    const key = term.toLowerCase();
    if (!GROUP_INDEX.has(key)) GROUP_INDEX.set(key, new Set());
    GROUP_INDEX.get(key).add(idx);
  }
});

function normTerm(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/^[.,!?;:"'()]+|[.,!?;:"'()]+$/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Kiểm tra hai chuỗi có phải cặp đồng nghĩa hoặc biến thể chính tả Anh-Mỹ trong bảng không.
 * Trả về true nếu khác chuỗi nhưng cùng nhóm.
 */
export function areSynonymsOrVariants(a, b) {
  const na = normTerm(a);
  const nb = normTerm(b);
  if (!na || !nb || na === nb) return false;
  const ga = GROUP_INDEX.get(na);
  const gb = GROUP_INDEX.get(nb);
  if (!ga || !gb) return false;
  for (const id of ga) {
    if (gb.has(id)) return true;
  }
  return false;
}
