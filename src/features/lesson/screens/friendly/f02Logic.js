/**
 * Pure logic cho F-02 Ghép chính tả / Ghép chữ lên đò (PHASE4 §2 F-02 + test Q2).
 * - Từ đơn (không dấu cách), 3–10 chữ cái A–Z.
 * - Bàn phím có đủ mọi chữ cái của từ (chữ trùng hiện đúng số lần) + chữ nhiễu cho đủ tối thiểu 8 ô.
 * - Nhóm Mới học: hiện sẵn chữ cái đầu.
 * - Sai chữ ở vị trí → tính sai lần đầu; sai 2 lần cùng ô → bật gợi ý nhấp nháy chữ đúng.
 */

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export function isSingleSpellableWord(w) {
  const s = String(w?.word ?? w ?? '').trim();
  return /^[A-Za-z]{3,10}$/.test(s);
}

/**
 * Tạo bàn phím phím chữ cái cho 1 từ:
 * - Luôn có đủ từng chữ cái của từ (đúng số lần lặp).
 * - Thêm chữ nhiễu để tổng số phím >= 8 (nếu từ 9-10 chữ thì giữ đúng số chữ của từ, không cắt mất chữ nào!).
 */
export function buildLetterBank(word, rng = Math.random, minKeys = 8) {
  const clean = String(word || '').trim().toLowerCase();
  const letters = clean.split('');
  const keys = letters.map((ch, idx) => ({
    id: `t-${idx}`,
    char: ch,
    isTarget: true,
  }));

  const targetCount = Math.max(minKeys, letters.length);
  const needDistractors = Math.max(0, targetCount - keys.length);
  const usedChars = new Set(letters);
  const candidates = ALPHABET.split('').filter((c) => !usedChars.has(c));

  for (let i = 0; i < needDistractors && candidates.length > 0; i++) {
    const pickIdx = Math.floor(rng() * candidates.length);
    const ch = candidates.splice(pickIdx, 1)[0];
    keys.push({ id: `d-${i}`, char: ch, isTarget: false });
  }

  // Fisher-Yates shuffle
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  return keys;
}

/**
 * Khởi tạo trạng thái cho 1 từ.
 * Nhóm beginner: điền sẵn chữ cái đầu tiên (khóa 1 phím khớp trong bank).
 */
export function initSpellTurn(word, bank, group = 'intermediate') {
  const target = String(word || '').trim().toLowerCase();
  const filledKeyIds = [];
  if (group === 'beginner' && target.length > 0) {
    const firstKey = bank.find((k) => k.char === target[0]);
    if (firstKey) filledKeyIds.push(firstKey.id);
  }
  return {
    target,
    filledKeyIds,
    hadWrong: false,
    wrongAtCurrentSlot: 0,
    hintChar: null,
    solved: filledKeyIds.length >= target.length,
  };
}

/**
 * Xử lý 1 lần chạm phím chữ cái ở F-02.
 */
export function pickSpellKey(turn, keyObj) {
  if (turn.solved || !keyObj || turn.filledKeyIds.includes(keyObj.id)) {
    return { turn, outcome: 'ignore' };
  }
  const pos = turn.filledKeyIds.length;
  const expected = turn.target[pos];
  const actual = String(keyObj.char || '').toLowerCase();

  if (actual === expected) {
    const filledKeyIds = [...turn.filledKeyIds, keyObj.id];
    const solved = filledKeyIds.length >= turn.target.length;
    return {
      outcome: solved ? 'solved' : 'correct',
      turn: {
        ...turn,
        filledKeyIds,
        wrongAtCurrentSlot: 0,
        hintChar: null,
        solved,
      },
    };
  }

  const wrongAtCurrentSlot = turn.wrongAtCurrentSlot + 1;
  return {
    outcome: 'wrong',
    turn: {
      ...turn,
      hadWrong: true,
      wrongAtCurrentSlot,
      hintChar: wrongAtCurrentSlot >= 2 ? expected : turn.hintChar,
    },
  };
}
