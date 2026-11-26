// src/components/learn/useAutoSpeak.js
// Tự đọc từ khi thẻ trở thành thẻ đang xem — SDD-FLASHCARD-AUDIO-UX v1.4, mục F1.
// Dùng speakWord / stopSpeaking SẴN CÓ trong src/utils/speech.js.

import { useEffect, useRef, useState } from 'react';
import { speakWord, stopSpeaking } from '../../utils/speech';

/**
 * @param {string}  text       từ tiếng Anh của thẻ đang xem
 * @param {object}  opts
 * @param {boolean} opts.enabled    công tắc "Tự đọc" && !muted (loa tổng đang bật)
 * @param {number}  opts.rate       rules.ttsRate của nhóm
 * @param {number}  [opts.delay]    mặc định 300 ms
 * @param {function} [opts.onStart] callback bổ sung (vd đồng bộ nhép miệng PetRig)
 * @param {function} [opts.onEnd]   callback bổ sung
 * @returns {{ speaking: boolean, hint: boolean }}
 *   hint = true khi trình duyệt chặn tự phát → cho nút loa nhấp nháy nhẹ 2 lần
 */
export function useAutoSpeak(text, { enabled, rate = 0.85, delay = 300, onStart, onEnd } = {}) {
  const [speaking, setSpeaking] = useState(false);
  const [hint, setHint] = useState(false);
  const cbRef = useRef({ onStart, onEnd });
  cbRef.current = { onStart, onEnd };

  useEffect(() => {
    setHint(false);
    if (!enabled || !text) return undefined;
    let active = true;
    const t = setTimeout(() => {
      Promise.resolve(
        speakWord(text, {
          rate,
          lang: 'en-US',
          onStart: () => {
            if (!active) return;
            setSpeaking(true);
            cbRef.current.onStart?.();
          },
          onEnd: () => {
            if (!active) return;
            setSpeaking(false);
            cbRef.current.onEnd?.();
          },
        }),
      ).catch(() => {
        if (active) setHint(true);
      });
    }, delay);

    return () => {
      active = false;
      clearTimeout(t);
      stopSpeaking();
      setSpeaking(false);
      cbRef.current.onEnd?.();
    };
  }, [text, enabled, rate, delay]);

  // Rời trang / ẩn tab → dừng âm thanh ngay (U-7)
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) {
        stopSpeaking();
        setSpeaking(false);
        cbRef.current.onEnd?.();
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      stopSpeaking();
      cbRef.current.onEnd?.();
    };
  }, []);

  return { speaking, hint };
}

/** Công tắc "Tự đọc", lưu localStorage. Bọc try/catch vì storage có thể bị chặn. */
const AUTO_KEY = 'cowdi.flashcard.autoSpeak';
export function readAutoSpeak() {
  try { return localStorage.getItem(AUTO_KEY) !== '0'; } catch { return true; }
}
export function writeAutoSpeak(on) {
  try { localStorage.setItem(AUTO_KEY, on ? '1' : '0'); } catch { /* bỏ qua */ }
}
