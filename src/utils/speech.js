export const SpeechRecognitionAPI = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

export function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

export function scorePronunciation(expected, spoken) {
  const expWords = normalizeText(expected).split(' ');
  const spkWords = normalizeText(spoken).split(' ');
  if (!expWords.length || !spkWords.length) return { score: 0, matched: [], missed: [], extra: [] };

  const matched = [];
  const missed = [];
  const usedSpk = new Set();

  for (const ew of expWords) {
    let found = false;
    for (let i = 0; i < spkWords.length; i++) {
      if (!usedSpk.has(i) && spkWords[i] === ew) {
        matched.push(ew);
        usedSpk.add(i);
        found = true;
        break;
      }
    }
    // Fuzzy: allow 1-char diff for words >= 4 chars
    if (!found) {
      for (let i = 0; i < spkWords.length; i++) {
        if (!usedSpk.has(i) && ew.length >= 4 && levenshtein(ew, spkWords[i]) <= 1) {
          matched.push(ew);
          usedSpk.add(i);
          found = true;
          break;
        }
      }
    }
    if (!found) missed.push(ew);
  }

  const extra = spkWords.filter((_, i) => !usedSpk.has(i));
  const score = Math.round((matched.length / expWords.length) * 100);
  return { score, matched, missed, extra };
}

export function getScoreLabel(score) {
  if (score >= 90) return { text: 'Xuất sắc! 🌟', color: '#00B894', icon: '🌟' };
  if (score >= 70) return { text: 'Tốt lắm! 👍', color: '#00B894', icon: '👍' };
  if (score >= 50) return { text: 'Khá ổn! 💪', color: '#FDCB6E', icon: '💪' };
  if (score >= 30) return { text: 'Cố thêm! 📖', color: '#E17055', icon: '📖' };
  return { text: 'Thử lại nhé! 🔄', color: '#D63031', icon: '🔄' };
}

/* ══════════════════════════════════════════════
   TEXT-TO-SPEECH (TTS) — Dùng chung cho Flashcard & các màn học
   SDD-FLASHCARD-AUDIO-UX v1.4 (F1, F2)
   ══════════════════════════════════════════════ */

export function cleanSpeechText(text) {
  return String(text || '')
    .replace(/\s*[\(\[\{][^()\[\]{}]*[\)\]\}]/g, '')
    .replace(/_+/g, ', ')
    .replace(/\//g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch { /* bỏ qua */ }
}

/** Kiểm tra trình duyệt có giọng đọc tiếng Việt (vi / vi-VN) hay không. */
export function hasVietnameseVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    return voices.some((v) => v?.lang && v.lang.toLowerCase().startsWith('vi'));
  } catch {
    return false;
  }
}

/**
 * Đọc văn bản bằng Web Speech API.
 * Trả về Promise: resolve khi đọc xong hoặc bị huỷ chủ động; reject khi trình duyệt chặn ('not-allowed') hoặc lỗi phát.
 * @param {string} text
 * @param {number|object} [rateOrOpts]  hỗ trợ cả speakWord(text, 0.85) lẫn speakWord(text, { rate, lang, onStart, onEnd })
 * @param {object} [extraOpts]
 */
export function speakWord(text, rateOrOpts = {}, extraOpts = {}) {
  const opts = typeof rateOrOpts === 'number'
    ? { rate: rateOrOpts, ...extraOpts }
    : { ...(rateOrOpts || {}), ...extraOpts };
  const { rate = 0.85, lang = 'en-US', onStart, onEnd } = opts;

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.reject(new Error('speechSynthesis-unavailable'));
  }
  const clean = cleanSpeechText(text);
  if (!clean) {
    onEnd?.();
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err) => {
      if (settled) return;
      settled = true;
      onEnd?.();
      if (err) reject(err);
      else resolve();
    };

    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = lang;
      u.rate = rate;
      u.onstart = () => onStart?.();
      u.onend = () => finish(null);
      u.onerror = (e) => {
        const code = e?.error || 'speech-error';
        // 'canceled' / 'interrupted' xảy ra khi người dùng chuyển thẻ hoặc bấm đọc lại → không coi là lỗi chặn
        if (code === 'canceled' || code === 'interrupted') {
          finish(null);
        } else {
          finish(new Error(code));
        }
      };
      onStart?.();
      window.speechSynthesis.speak(u);
    } catch (err) {
      finish(err);
    }
  });
}
