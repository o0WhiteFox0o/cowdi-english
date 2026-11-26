// <PetDirectorProvider> & hook usePetDirector()
// Kết nối PetDirector thuần JS với React, PetAvatar (Pet-motion), useUser, usePet và useAuth.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { PET_REGISTRY, getPetMood } from '../data/pets';
import { bondOf } from '../pet-rig/PetAvatar';
import { ALL_LESSONS } from '../data/lessons';
import { getNextPathLesson } from '../data/path';
import { PetDirector } from './PetDirector.js';
import { createDirectorStorage } from './storage.js';
import { IDLE_TICK_MS, THOUGHT_TTL_MS } from './rules.js';
import { speakEnglishText } from './tts.js';
import './pet-director.css';

const DirectorContext = createContext(null);

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function calcDaysAway(lastDateStr) {
  if (!lastDateStr) return 0;
  const t = new Date(lastDateStr).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

export function PetDirectorProvider({ children }) {
  const { user } = useAuth();
  const { userData } = useUser();
  const { getActivePetWithDecay } = usePet();

  const userId = user?.id ? String(user.id) : 'guest';
  const directorRef = useRef(null);
  if (!directorRef.current) {
    directorRef.current = new PetDirector({
      userId,
      storage: createDirectorStorage(userId),
    });
  }

  useEffect(() => {
    directorRef.current.setUserId(userId, typeof window !== 'undefined' ? window.localStorage : undefined);
  }, [userId]);

  // Stack đăng ký slot: slot đăng ký sau cùng là slot đang hoạt động
  // Mỗi entry: { id, slot, primaryRef, extraRefs }
  const slotsRef = useRef([]);
  const seqRef = useRef(0);
  const [activeSlot, setActiveSlot] = useState(null);

  const [speech, setSpeech] = useState(null);
  const [thought, setThought] = useState(null);
  const speechTimerRef = useRef(null);
  const thoughtTimerRef = useRef(null);
  const lipSyncTimerRef = useRef(null);

  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const petName = activePet?.customName || species?.name || 'Cowdi';
  const mood = activePet ? getPetMood(activePet.needs) : 'happy';
  const stage = activePet ? Math.max(1, Math.min(5, (activePet.evolution || 0) + 1)) : 1;
  const bond = activePet ? bondOf(activePet.skills) : 0;
  const group = species?.group || 'farm';
  const hungry = Boolean(activePet?.needs && (activePet.needs.energy ?? 100) < 35);

  const lessonsToday = userData?.dailyJournal?.[todayKey()]?.lessons || 0;
  const daysAway = calcDaysAway(userData?.lastActiveDate || activePet?.needsUpdatedAt);

  const nextInfo = useMemo(() => {
    const next = getNextPathLesson(userData || {});
    if (!next) return { lessonTitle: null, href: '/learning-path' };
    if (next.type === 'lesson') {
      const lesson = ALL_LESSONS.find((l) => l.id === next.lessonId);
      return {
        lessonTitle: lesson?.title || next.lessonId,
        href: `/lessons/${next.lessonId}`,
      };
    }
    return {
      lessonTitle: next.unit?.checkpoint?.title || next.unit?.title || 'Kiểm tra Unit',
      href: `/learning-path?tab=${userData?.activePath || 'intermediate'}`,
    };
  }, [userData]);

  // Giữ bản mới nhất của ngữ cảnh để dispatch luôn ổn định reference (không gây re-run effect ở các trang)
  const ctxRef = useRef({});
  ctxRef.current = {
    petId: activePet?.speciesId || 'cowdi',
    petName,
    mood,
    stage,
    bond,
    group,
    hungry,
    lessonsToday,
    daysAway,
    lessonTitle: nextInfo.lessonTitle,
    nextLessonHref: nextInfo.href,
  };

  const getActiveEntry = useCallback(() => {
    const list = slotsRef.current;
    return list.length ? list[list.length - 1] : null;
  }, []);

  const stopLipSync = useCallback((entry) => {
    clearTimeout(lipSyncTimerRef.current);
    const target = entry || getActiveEntry();
    const avatar = target?.primaryRef?.current;
    if (avatar) {
      avatar.setVoiceLevel?.(0);
      avatar.emit?.('pet_speak_end');
    }
  }, [getActiveEntry]);

  const startLipSync = useCallback((durationMs) => {
    clearTimeout(lipSyncTimerRef.current);
    const entry = getActiveEntry();
    const avatar = entry?.primaryRef?.current;
    if (!avatar) return;
    avatar.emit?.('pet_speak_start');
    avatar.setVoiceLevel?.(0.65);
    lipSyncTimerRef.current = setTimeout(() => {
      stopLipSync(entry);
    }, durationMs);
  }, [getActiveEntry, stopLipSync]);

  const dismissSpeech = useCallback(() => {
    clearTimeout(speechTimerRef.current);
    setSpeech(null);
    directorRef.current?.clearActiveSpeech();
    stopLipSync();
  }, [stopLipSync]);

  const dismissThought = useCallback(() => {
    clearTimeout(thoughtTimerRef.current);
    setThought(null);
  }, []);

  // Đăng ký slot cho trang hiện tại; trả về hàm cleanup
  const register = useCallback((slot, primaryRef, extraRefs = null) => {
    const id = ++seqRef.current;
    const entry = { id, slot, primaryRef, extraRefs };
    slotsRef.current = [...slotsRef.current, entry];
    setActiveSlot(slot);

    return () => {
      clearTimeout(speechTimerRef.current);
      clearTimeout(thoughtTimerRef.current);
      clearTimeout(lipSyncTimerRef.current);
      slotsRef.current = slotsRef.current.filter((e) => e.id !== id);
      const top = slotsRef.current.length ? slotsRef.current[slotsRef.current.length - 1] : null;
      setActiveSlot(top ? top.slot : null);
      setSpeech(null);
      setThought(null);
      directorRef.current?.clearActiveSpeech();
    };
  }, []);

  const emitToSlot = useCallback((entry, rigEvent, rigData) => {
    if (!entry || !rigEvent) return;
    const target = rigData?.target;
    const extras = entry.extraRefs;

    // Hỗ trợ chỉ định mục tiêu cho DuelPage ('mine' | 'opp' | 'both') hoặc mirror avatar (HomePage)
    if (target === 'opp' && extras && !Array.isArray(extras) && extras.opp) {
      extras.opp.current?.emit?.(rigEvent, rigData);
      return;
    }
    if (target === 'both') {
      entry.primaryRef?.current?.emit?.(rigEvent, rigData);
      if (Array.isArray(extras)) {
        extras.forEach((r) => r?.current?.emit?.(rigEvent, rigData));
      } else if (extras && typeof extras === 'object') {
        Object.values(extras).forEach((r) => r?.current?.emit?.(rigEvent, rigData));
      }
      return;
    }

    entry.primaryRef?.current?.emit?.(rigEvent, rigData);
    if (Array.isArray(extras)) {
      extras.forEach((r) => r?.current?.emit?.(rigEvent, rigData));
    }
  }, []);

  const dispatch = useCallback((event, payload = {}) => {
    const entry = getActiveEntry();
    if (!entry) return null;

    const screen = payload.screen || entry.slot;
    const decision = directorRef.current.dispatch(event, payload, {
      ...ctxRef.current,
      screen,
    });
    if (!decision) return null;

    if (decision.rigEvent) {
      emitToSlot(entry, decision.rigEvent, decision.rigData);
    }

    if (decision.speech) {
      clearTimeout(speechTimerRef.current);
      setSpeech({ ...decision.speech, slot: entry.slot });
      const lipMs = Math.min(2200, Math.max(900, decision.speech.vi.length * 38));
      startLipSync(lipMs);
      speechTimerRef.current = setTimeout(() => {
        setSpeech(null);
        directorRef.current?.clearActiveSpeech();
      }, decision.speech.ttlMs);
    }

    if (decision.thought) {
      clearTimeout(thoughtTimerRef.current);
      setThought({ icon: decision.thought, slot: entry.slot });
      thoughtTimerRef.current = setTimeout(() => {
        setThought(null);
      }, THOUGHT_TTL_MS);
    }

    return decision;
  }, [getActiveEntry, emitToSlot, startLipSync]);

  const speakText = useCallback((text) => {
    const entry = getActiveEntry();
    const avatar = entry?.primaryRef?.current;
    speakEnglishText(text, {
      onStart: () => {
        clearTimeout(lipSyncTimerRef.current);
        avatar?.emit?.('pet_speak_start');
        avatar?.setVoiceLevel?.(0.7);
      },
      onEnd: () => {
        avatar?.setVoiceLevel?.(0);
        avatar?.emit?.('pet_speak_end');
      },
    });
  }, [getActiveEntry]);

  // Tự gửi idle_tick mỗi 30 giây khi ứng dụng đang mở
  useEffect(() => {
    const iv = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      dispatch('idle_tick');
    }, IDLE_TICK_MS);
    return () => clearInterval(iv);
  }, [dispatch]);

  const value = useMemo(
    () => ({
      register,
      dispatch,
      speech,
      thought,
      activeSlot,
      dismissSpeech,
      dismissThought,
      speakText,
      nextLessonHref: nextInfo.href,
      nextLessonTitle: nextInfo.lessonTitle,
    }),
    [register, dispatch, speech, thought, activeSlot, dismissSpeech, dismissThought, speakText, nextInfo]
  );

  return <DirectorContext.Provider value={value}>{children}</DirectorContext.Provider>;
}

export function usePetDirector() {
  const ctx = useContext(DirectorContext);
  if (!ctx) {
    // Fallback an toàn nếu component được render ngoài Provider (vd unit test độc lập)
    return {
      register: () => () => {},
      dispatch: () => null,
      speech: null,
      thought: null,
      activeSlot: null,
      dismissSpeech: () => {},
      dismissThought: () => {},
      speakText: () => {},
      nextLessonHref: '/learning-path',
      nextLessonTitle: null,
    };
  }
  return ctx;
}
