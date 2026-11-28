export const SpeechRecognitionAPI = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

const CONTRACTION_MAP = [
  [/\bi'm\b/g, 'i am'],
  [/\byou're\b/g, 'you are'],
  [/\bwe're\b/g, 'we are'],
  [/\bthey're\b/g, 'they are'],
  [/\bhe's\b/g, 'he is'],
  [/\bshe's\b/g, 'she is'],
  [/\bit's\b/g, 'it is'],
  [/\bthat's\b/g, 'that is'],
  [/\bthere's\b/g, 'there is'],
  [/\bwhat's\b/g, 'what is'],
  [/\bwho's\b/g, 'who is'],
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'],
  [/\bcan't\b/g, 'cannot'],
  [/\bcan not\b/g, 'cannot'],
  [/\bwon't\b/g, 'will not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bwasn't\b/g, 'was not'],
  [/\bweren't\b/g, 'were not'],
  [/\bhaven't\b/g, 'have not'],
  [/\bhasn't\b/g, 'has not'],
  [/\bi've\b/g, 'i have'],
  [/\bi'll\b/g, 'i will'],
  [/\blet's\b/g, 'let us'],
];

export function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function expandContractions(text) {
  let out = normalizeText(text);
  for (const [re, rep] of CONTRACTION_MAP) {
    out = out.replace(re, rep);
  }
  return out.replace(/\s+/g, ' ').trim();
}

export function tokenizeText(text, { expand = false } = {}) {
  const norm = expand ? expandContractions(text) : normalizeText(text);
  return norm ? norm.split(' ').filter(Boolean) : [];
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
  const expWords = tokenizeText(expected, { expand: true });
  const spkWords = tokenizeText(spoken, { expand: true });
  if (!expWords.length || !spkWords.length) {
    return { score: 0, matched: [], missed: [...expWords], extra: [...spkWords] };
  }

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

/**
 * Chấm gõ câu cho T-08 Viết câu (GEMINI-SCREEN-SYSTEM-PHASE1 §8.2):
 * - Chuẩn hoá dấu câu cuối + rút gọn tương đương (I'm ↔ I am, don't ↔ do not, ...)
 * - Sai 1 ký tự trong từ >= 5 chữ cái: tính đúng nhưng trả typoWords để pet nhắc chính tả.
 */
export function scoreTypedSentence(expected, typed) {
  const expWords = tokenizeText(expected, { expand: true });
  const gotWords = tokenizeText(typed, { expand: true });
  if (!expWords.length || !gotWords.length) {
    return { ok: false, exact: false, typoWords: [], wrongIndices: expWords.map((_, i) => i) };
  }
  if (expWords.length === gotWords.length) {
    const typoWords = [];
    const wrongIndices = [];
    for (let i = 0; i < expWords.length; i++) {
      const e = expWords[i];
      const g = gotWords[i];
      if (e === g) continue;
      if (e.length >= 5 && levenshtein(e, g) <= 1) {
        typoWords.push({ expected: e, got: g, index: i });
      } else {
        wrongIndices.push(i);
      }
    }
    if (wrongIndices.length === 0) {
      return { ok: true, exact: typoWords.length === 0, typoWords, wrongIndices: [] };
    }
    return { ok: false, exact: false, typoWords, wrongIndices };
  }
  // Khác số từ → tô các vị trí lệch so với câu gốc
  const wrongIndices = [];
  const maxLen = Math.max(expWords.length, gotWords.length);
  for (let i = 0; i < maxLen; i++) {
    if (expWords[i] !== gotWords[i]) wrongIndices.push(i);
  }
  return { ok: false, exact: false, typoWords: [], wrongIndices };
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
 * Gộp toàn bộ transcript (cả isFinal lẫn interim mới nhất) từ SpeechRecognitionEvent.
 * Trên điện thoại (iOS Safari / Android Chrome), trình duyệt thường kết thúc phiên (onend)
 * mà chỉ trả kết quả interim (isFinal = false). Dùng hàm này giúp không bao giờ mất câu người học vừa đọc.
 */
export function extractBestTranscript(results) {
  if (!results || typeof results.length !== 'number') {
    return { finalText: '', interimText: '', bestText: '', hasFinal: false };
  }
  let finalText = '';
  let interimText = '';
  let hasFinal = false;
  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    const t = String(res?.[0]?.transcript || '').trim();
    if (!t) continue;
    if (res.isFinal) {
      hasFinal = true;
      finalText += `${t} `;
    } else {
      interimText += `${t} `;
    }
  }
  const cleanFinal = finalText.trim();
  const cleanInterim = interimText.trim();
  const bestText = `${cleanFinal} ${cleanInterim}`.trim();
  return { finalText: cleanFinal, interimText: cleanInterim, bestText, hasFinal };
}

/**
 * Đọc văn bản bằng Web Speech API.
 * Trả về Promise: resolve khi đọc xong, hết thời gian chờ an toàn hoặc bị huỷ chủ động;
 * reject khi trình duyệt chặn ('not-allowed') hoặc lỗi phát.
 * @param {string} text
 * @param {number|object} [rateOrOpts]  hỗ trợ cả speakWord(text, 0.85) lẫn speakWord(text, { rate, lang, onStart, onEnd, timeoutMs })
 * @param {object} [extraOpts]
 */
export function speakWord(text, rateOrOpts = {}, extraOpts = {}) {
  const opts = typeof rateOrOpts === 'number'
    ? { rate: rateOrOpts, ...extraOpts }
    : { ...(rateOrOpts || {}), ...extraOpts };
  const { rate = 0.85, lang = 'en-US', onStart, onEnd, timeoutMs } = opts;

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
    let started = false;
    let maxTimer = null;
    let startWatchdog = null;

    const clearTimers = () => {
      if (maxTimer) { clearTimeout(maxTimer); maxTimer = null; }
      if (startWatchdog) { clearTimeout(startWatchdog); startWatchdog = null; }
    };

    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearTimers();
      onEnd?.();
      if (err) reject(err);
      else resolve();
    };

    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = lang;
      u.rate = rate;
      u.onstart = () => {
        started = true;
        if (startWatchdog) { clearTimeout(startWatchdog); startWatchdog = null; }
        onStart?.();
      };
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

      // Watchdog cho điện thoại (iOS Safari / Android Chrome):
      // Nếu trình duyệt chặn ngầm hoặc không bắn onend/onerror → tự thoát thay vì treo vĩnh viễn.
      const safeRate = Math.max(0.4, Number(rate) || 0.85);
      const hardTimeout = Number.isFinite(timeoutMs)
        ? Math.max(500, timeoutMs)
        : Math.min(18000, Math.max(4500, Math.round((clean.length * 160) / safeRate) + 2500));
      maxTimer = setTimeout(() => finish(null), hardTimeout);
      startWatchdog = setTimeout(() => {
        if (!started && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          finish(null);
        }
      }, 2400);

      onStart?.();
      window.speechSynthesis.speak(u);
    } catch (err) {
      finish(err);
    }
  });
}
