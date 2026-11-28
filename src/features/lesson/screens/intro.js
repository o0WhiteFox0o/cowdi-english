/**
 * Chọn câu dẫn nhập cho từng màn theo thứ tự ưu tiên (GEMINI-STORY-INTRO-S2 §1):
 *   1. lessonSlotIntro(lesson.id, slot) từ shared/story-season2.js (lấy theo kỹ năng/slot)
 *   2. Kho screen_intro (mã màn × vùng, luật không lặp 10 ải)
 *   3. Fallback câu chung theo mã màn / vùng
 */

import { lessonSlotIntro } from '../../../../shared/story-season2.js';
import { getScreenTitle } from '../../../../shared/screen-scenarios.js';
import { SCREEN_PLAY_RULES } from '../../../data/config/screens.js';
import { selectScreenIntro } from './introSelector.js';

function applyPetName(text, petName) {
  if (!text) return '';
  if (!petName) return text.replace(/\{pet\}/g, 'Cowdi');
  return text.replace(/\{pet\}/g, String(petName));
}

/**
 * @param {object} lesson
 * @param {'intro'|'listen'|'read'|'write'|'speak'|'boss'} slot
 * @param {string|null} region
 * @param {{ code?: string, intros?: Array, recentIntros?: Array, vars?: object, seed?: number }} [opts]
 * @returns {{ source: 'story'|'screen_intro'|'fallback', vi: string, en: string, id: string|number|null, audioUrl?: string|null }}
 */
export function getSlotIntro(lesson, slot, region = null, opts = {}) {
  const { code = '', intros = [], recentIntros = [], vars = {}, seed = 1 } = opts;

  // 1. Kịch bản riêng của bài theo kỹ năng (slot)
  const storySlot = lesson?.id && slot ? lessonSlotIntro(lesson.id, slot) : null;
  if (storySlot?.vi) {
    return {
      source: 'story',
      vi: applyPetName(storySlot.vi, vars.pet),
      en: storySlot.en || '',
      id: null,
    };
  }

  // 2. Kho screen_intro đã duyệt (luật không lặp 10 ải)
  if (code) {
    const picked = selectScreenIntro({
      intros,
      screenCode: code,
      region,
      recentIntros,
      vars,
      seed,
    });
    if (picked?.text) {
      return {
        source: 'screen_intro',
        vi: picked.text,
        en: '',
        id: picked.id ?? null,
        audioUrl: picked.audioUrl ?? null,
      };
    }
  }

  // 3. Fallback chung theo mã màn × vùng
  const title = code ? getScreenTitle(code, region, '') : '';
  const generic = (code && SCREEN_PLAY_RULES[code]) || (title ? `Cùng vượt qua màn ${title} nha!` : 'Cùng vượt qua màn này nhé!');
  return {
    source: 'fallback',
    vi: generic,
    en: '',
    id: null,
  };
}
