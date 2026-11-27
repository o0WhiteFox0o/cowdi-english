import { useCallback, useRef } from 'react';
import { usePetDirector } from '../../../pet-director/DirectorContext';

const SLOT_TO_PET_SKILL = {
  listen: 'listening',
  speak: 'speaking',
  read: 'reading',
  write: 'writing',
};

/**
 * useScreenEvents — Bộ định tuyến sự kiện chung từ mọi màn T/F (PHASE1 §5.4).
 * - Nối Pet Director (dispatch)
 * - Nối wordProgress (F3)
 * - Giữ nguyên cộng điểm kỹ năng pet.skills như các tab cũ
 * - Khi sandbox = true: chỉ dispatch cho pet, KHÔNG ghi wordProgress / pet.skills / attempt.
 */
export function useScreenEvents({
  lessonId,
  rules,
  sandbox = false,
  recordWordEncounter,
  recordQuestionResult,
  recordWordSkillHit,
  addSkillXP,
  onSkillGain,
}) {
  const { dispatch } = usePetDirector();
  const streakRef = useRef(0);
  const seenWordsRunRef = useRef(new Set());
  const quizRunRef = useRef(new Set());

  const resetRun = useCallback(() => {
    streakRef.current = 0;
    seenWordsRunRef.current = new Set();
    quizRunRef.current = new Set();
  }, []);

  const handleEvent = useCallback((type, payload = {}) => {
    switch (type) {
      case 'item_shown': {
        dispatch('question_shown', { lessonId, itemId: payload.itemId });
        if (!sandbox && Array.isArray(payload.wordIds) && typeof recordWordEncounter === 'function') {
          for (const wid of payload.wordIds) {
            if (!wid || seenWordsRunRef.current.has(wid)) continue;
            seenWordsRunRef.current.add(wid);
            recordWordEncounter(wid, seenWordsRunRef.current, rules);
          }
        }
        break;
      }
      case 'item_correct': {
        streakRef.current += 1;
        const count = streakRef.current;
        if (count === 3 || count === 5 || (count >= 10 && count % 5 === 0)) {
          dispatch('streak', { count, lessonId });
        } else {
          dispatch('answer_correct', {
            word: payload.word,
            meaning: payload.meaning,
            lessonId,
          });
        }
        if (!sandbox) {
          if (Array.isArray(payload.wordIds) && payload.wordIds.length > 0 && typeof recordQuestionResult === 'function') {
            recordQuestionResult({ targetWords: payload.wordIds }, true, quizRunRef.current, rules);
          }
          const petSkill = SLOT_TO_PET_SKILL[payload.skill];
          if (petSkill) {
            if (Array.isArray(payload.wordIds) && payload.wordIds.length > 0 && typeof recordWordSkillHit === 'function') {
              recordWordSkillHit(payload.wordIds, payload.skill, rules);
            }
            if (typeof addSkillXP === 'function') {
              addSkillXP(petSkill, 1);
            }
            if (typeof onSkillGain === 'function') {
              onSkillGain(payload.skill, 1);
            }
          }
        }
        break;
      }
      case 'item_wrong': {
        streakRef.current = 0;
        dispatch('answer_wrong', {
          word: payload.word,
          meaning: payload.meaning,
          correct: payload.correct,
          lessonId,
        });
        if (!sandbox && Array.isArray(payload.wordIds) && payload.wordIds.length > 0 && typeof recordQuestionResult === 'function') {
          recordQuestionResult({ targetWords: payload.wordIds }, false, quizRunRef.current, rules);
        }
        break;
      }
      case 'mic_start':
        dispatch('mic_start', { lessonId });
        break;
      case 'mic_end':
        dispatch('mic_end', { lessonId });
        break;
      case 'screen_done':
        break;
      default:
        break;
    }
  }, [dispatch, lessonId, rules, sandbox, recordWordEncounter, recordQuestionResult, recordWordSkillHit, addSkillXP, onSkillGain]);

  return { handleEvent, resetRun };
}
