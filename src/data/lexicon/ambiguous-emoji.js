// ════════════════════════════════════════════════════════════════
// Lexicon: Bảng emoji dễ hiểu nhầm (STD-QUESTION-QUALITY §3.2.4)
// Pure JS — chạy được cả Node và trình duyệt.
// ════════════════════════════════════════════════════════════════

export const AMBIGUOUS_EMOJI = {
  '🔴': ['red', 'circle', 'ball', 'dot'],
  '🔵': ['blue', 'circle', 'ball', 'dot'],
  '🟡': ['yellow', 'circle', 'ball', 'dot'],
  '🟢': ['green', 'circle', 'ball', 'dot'],
  '🟠': ['orange', 'circle', 'ball', 'dot'],
  '🟣': ['purple', 'circle', 'ball', 'dot'],
  '❤️': ['heart', 'red', 'love'],
  '⭐': ['star', 'yellow'],
  '🍎': ['apple', 'red', 'fruit'],
  '🐃': ['buffalo', 'ox', 'cow'],
  '🐂': ['ox', 'buffalo', 'cow'],
  '🐄': ['cow', 'buffalo', 'ox'],
  '🏠': ['house', 'home'],
  '🏡': ['house', 'home'],
  '👦': ['boy', 'child', 'kid'],
  '🧒': ['child', 'kid', 'boy'],
  '🚗': ['car', 'taxi'],
  '🚕': ['taxi', 'car'],
  '☀️': ['sun', 'sunny', 'hot'],
  '🌧️': ['rain', 'rainy', 'cloud'],
};

/** Lời dẫn đã khoá loại đáp án cụ thể (không còn mơ hồ "Hình này là gì?"). */
export const CATEGORY_LOCK_PROMPT_RE = /(màu\s+(này|gì)|hình\s+dạng|con\s+(gì|vật)|số\s+mấy|là\s+ai\b|nghề\s+(gì|nào)|món\s+(gì|ăn)|đồ\s+vật|phương\s+tiện|thời\s+tiết|đặc\s+điểm|nơi\s+nào)/i;

export function isAmbiguousEmoji(emoji) {
  return Boolean(emoji && Object.prototype.hasOwnProperty.call(AMBIGUOUS_EMOJI, emoji));
}
