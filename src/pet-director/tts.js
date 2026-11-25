// Helper đọc tiếng Anh ngắn (TTS) cho nút Nghe trong <PetSpeech>, đồng bộ nhép miệng PetRig.
export function speakEnglishText(text, { rate = 0.85, onStart, onEnd } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
    onEnd?.();
    return false;
  }
  const clean = String(text)
    .replace(/\s*[\(\[\{][^()\[\]{}]*[\)\]\}]/g, '')
    .replace(/_+/g, ', ')
    .replace(/\//g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) {
    onEnd?.();
    return false;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'en-US';
    u.rate = rate;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onEnd?.();
    };
    u.onstart = () => onStart?.();
    u.onend = finish;
    u.onerror = finish;
    onStart?.();
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    onEnd?.();
    return false;
  }
}
