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
