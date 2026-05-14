import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useUser } from './useUser';
import {
  PET_REGISTRY, getPetEvolution, calculatePowerScore, checkUnlockCondition,
  QUIZ_TO_SKILL, DAILY_QUESTS, WEEKLY_QUESTS, PET_ACHIEVEMENTS,
} from '../data/pets';

const PET_STORAGE_PREFIX = 'cowdi_pet_data';

function getPetStorageKey(userId) {
  return userId ? `${PET_STORAGE_PREFIX}_${userId}` : PET_STORAGE_PREFIX;
}

// ── Migrate old skill names → new 4-language-skill names ───────────────────
function migrateSkills(skills) {
  if (!skills) return { listening: 0, speaking: 0, reading: 0, writing: 0 };
  // Already migrated?
  if ('listening' in skills || 'speaking' in skills || 'reading' in skills || 'writing' in skills) {
    return {
      listening: skills.listening || 0,
      speaking: skills.speaking || 0,
      reading: skills.reading || 0,
      writing: skills.writing || 0,
    };
  }
  // Old format: speech→speaking, intelligence→reading, perception→listening, creativity→writing
  return {
    listening: skills.perception || 0,
    speaking: skills.speech || 0,
    reading: skills.intelligence || 0,
    writing: skills.creativity || 0,
  };
}

function migratePetCollection(collection) {
  if (!collection) return {};
  const migrated = {};
  for (const [id, pet] of Object.entries(collection)) {
    migrated[id] = { ...pet, skills: migrateSkills(pet.skills) };
  }
  return migrated;
}

const DEFAULT_PET_DATA = {
  activePetId: null,
  nickname: '',
  coins: 0,
  totalCoinsEarned: 0,
  collection: {},
  ownedItems: [],
  dailyQuests: { date: null, completed: [] },
  weeklyQuests: { week: null, completed: [], lessonsThisWeek: 0, perfectThisWeek: 0 },
  petAchievements: [],
};

function loadPetData(userId) {
  try {
    const raw = localStorage.getItem(getPetStorageKey(userId));
    if (raw) {
      const parsed = { ...DEFAULT_PET_DATA, ...JSON.parse(raw) };
      parsed.collection = migratePetCollection(parsed.collection);
      return parsed;
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_PET_DATA };
}

function savePetData(data, userId) {
  localStorage.setItem(getPetStorageKey(userId), JSON.stringify(data));
}

// ── Đảm bảo luôn có pet khởi tạo (Cowdi) ──────────────────────────────────
function ensureInitialPet(data) {
  if (Object.keys(data.collection).length > 0) return data;
  return {
    ...data,
    activePetId: 'cowdi_1',
    collection: {
      cowdi_1: {
        speciesId: 'cowdi',
        customName: 'Cowdi',
        evolution: 0,
        skills: { listening: 0, speaking: 0, reading: 0, writing: 0 },
        needs: { energy: 80, happiness: 80, health: 80, knowledge: 80 },
        cosmetics: { hat: null, outfit: null, room: null, effect: null },
        totalXpEarned: 0,
        needsUpdatedAt: new Date().toISOString(),
        unlockedAt: new Date().toISOString(),
      },
    },
  };
}

const PetContext = createContext(null);

export function PetProvider({ children }) {
  const { user, authFetch } = useAuth();
  const { userData, spendXP } = useUser();
  const [petData, setPetData] = useState(() => ensureInitialPet(loadPetData(user?.id || null)));
  const syncTimerRef = useRef(null);
  const currentUserIdRef = useRef(null);
  // Guard: chỉ persist sau khi đã load đúng dữ liệu cho user hiện tại
  const readyRef = useRef(!user);

  // ── Load pet data on user change ─────────────────────────────────────────
  useEffect(() => {
    const uid = user?.id || null;
    if (uid === currentUserIdRef.current) return;
    currentUserIdRef.current = uid;
    readyRef.current = false; // Block persist cho đến khi load xong

    if (!uid) {
      setPetData(ensureInitialPet(loadPetData(null)));
      readyRef.current = true;
      return;
    }
    authFetch('/api/pet-data')
      .then((r) => r.ok ? r.json() : null)
      .then((remote) => {
        const local = loadPetData(uid);
        let merged;
        if (remote && Object.keys(remote.collection || {}).length >= Object.keys(local.collection || {}).length) {
          merged = { ...DEFAULT_PET_DATA, ...remote };
          merged.collection = migratePetCollection(merged.collection);
        } else {
          merged = local;
        }
        setPetData(ensureInitialPet(merged));
        readyRef.current = true;
      })
      .catch(() => {
        setPetData(ensureInitialPet(loadPetData(uid)));
        readyRef.current = true;
      });
  }, [user?.id]);

  // ── Auto-save + sync ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!readyRef.current) return; // Chưa load xong – không ghi đè
    savePetData(petData, user?.id || null);
    if (user) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        authFetch('/api/pet-data', {
          method: 'PUT',
          body: JSON.stringify(petData),
        }).catch(() => {});
      }, 3000);
    }
  }, [petData]);

  // ── Reset daily/weekly quests ────────────────────────────────────────────
  useEffect(() => {
    const today = new Date().toDateString();
    const weekNum = getWeekNumber();
    setPetData((prev) => {
      let next = prev;
      if (prev.dailyQuests.date !== today) {
        next = { ...next, dailyQuests: { date: today, completed: [] } };
      }
      if (prev.weeklyQuests.week !== weekNum) {
        next = { ...next, weeklyQuests: { week: weekNum, completed: [], lessonsThisWeek: 0, perfectThisWeek: 0 } };
      }
      return next === prev ? prev : next;
    });
  }, []);

  // ── Compute needs decay for active pet ───────────────────────────────────
  const getActivePetWithDecay = useCallback(() => {
    const pet = petData.collection[petData.activePetId];
    if (!pet) return null;
    const now = Date.now();
    const lastUpdate = new Date(pet.needsUpdatedAt || now).getTime();
    const hoursPassed = Math.max(0, (now - lastUpdate) / (1000 * 60 * 60));
    const decay = Math.floor(hoursPassed * 2);
    return {
      ...pet,
      needs: {
        energy: Math.max(0, (pet.needs?.energy ?? 80) - decay),
        happiness: Math.max(0, (pet.needs?.happiness ?? 80) - decay),
        health: Math.max(0, (pet.needs?.health ?? 80) - Math.floor(hoursPassed * 1)),
        knowledge: Math.max(0, (pet.needs?.knowledge ?? 80) - decay),
      },
    };
  }, [petData]);

  // ── Update active pet helper ─────────────────────────────────────────────
  const updateActivePet = useCallback((updater) => {
    setPetData((prev) => {
      const id = prev.activePetId;
      if (!id || !prev.collection[id]) return prev;
      const pet = prev.collection[id];
      const updated = typeof updater === 'function' ? updater(pet) : { ...pet, ...updater };
      // Check evolution
      const species = PET_REGISTRY[updated.speciesId];
      if (species) {
        const evo = getPetEvolution(updated.speciesId, updated.totalXpEarned);
        if (evo) updated.evolution = evo.stage;
      }
      return {
        ...prev,
        collection: { ...prev.collection, [id]: updated },
      };
    });
  }, []);

  // ── Add skill points to active pet ───────────────────────────────────────
  const addSkillPoints = useCallback((quizCategory, correct, total) => {
    const skill = QUIZ_TO_SKILL[quizCategory];
    const isPerfect = correct === total;
    const points = isPerfect ? correct + 5 : correct;
    if (skill === null || skill === undefined) {
      // mixed → distribute evenly across 4 skills
      const each = Math.max(1, Math.floor(points / 4));
      updateActivePet((pet) => ({
        ...pet,
        skills: {
          listening: (pet.skills.listening || 0) + each,
          speaking: (pet.skills.speaking || 0) + each,
          reading: (pet.skills.reading || 0) + each,
          writing: (pet.skills.writing || 0) + each,
        },
        totalXpEarned: pet.totalXpEarned + correct * 10 + (isPerfect ? 20 : 0),
        needsUpdatedAt: new Date().toISOString(),
      }));
      return;
    }
    updateActivePet((pet) => ({
      ...pet,
      skills: { ...pet.skills, [skill]: (pet.skills[skill] || 0) + points },
      totalXpEarned: pet.totalXpEarned + correct * 10 + (isPerfect ? 20 : 0),
      needsUpdatedAt: new Date().toISOString(),
    }));
  }, [updateActivePet]);

  // ── Add all skills (lesson complete) ─────────────────────────────────────
  const addAllSkillPoints = useCallback((amount) => {
    updateActivePet((pet) => ({
      ...pet,
      skills: {
        listening: (pet.skills.listening || 0) + amount,
        speaking: (pet.skills.speaking || 0) + amount,
        reading: (pet.skills.reading || 0) + amount,
        writing: (pet.skills.writing || 0) + amount,
      },
      totalXpEarned: pet.totalXpEarned + amount * 10,
      needs: {
        ...pet.needs,
        energy: Math.min(100, (pet.needs?.energy ?? 80) + 30),
      },
      needsUpdatedAt: new Date().toISOString(),
    }));
  }, [updateActivePet]);

  // ── Feed pet (increase need) ─────────────────────────────────────────────
  const feedPet = useCallback((needType, amount) => {
    updateActivePet((pet) => ({
      ...pet,
      needs: {
        ...pet.needs,
        [needType]: Math.min(100, (pet.needs?.[needType] ?? 50) + amount),
      },
      needsUpdatedAt: new Date().toISOString(),
    }));
  }, [updateActivePet]);

  // ── On quiz complete → feed happiness ────────────────────────────────────
  const onQuizComplete = useCallback((quizCategory, correct, total) => {
    addSkillPoints(quizCategory, correct, total);
    const isPerfect = correct === total;
    feedPet('happiness', isPerfect ? 40 : 20);
  }, [addSkillPoints, feedPet]);

  // ── On lesson complete → feed energy + all skills ────────────────────────
  const onLessonComplete = useCallback(() => {
    addAllSkillPoints(5);
  }, [addAllSkillPoints]);

  // ── On vocab review → feed knowledge ─────────────────────────────────────
  const onVocabReview = useCallback(() => {
    feedPet('knowledge', 25);
  }, [feedPet]);

  // ── Cho Pet ăn XP ───────────────────────────────────────────────
  // Tiêu `amount` XP từ ví user → cộng vào totalXpEarned của active pet (1:1).
  // Trả về: { ok: bool, evolved: bool, newEvoStage?: number } để UI hiển thị toast.
  const feedXPToPet = useCallback((amount) => {
    if (!amount || amount <= 0) return { ok: false };
    if (!petData.activePetId || !petData.collection[petData.activePetId]) {
      return { ok: false };
    }
    if ((userData.availableXP || 0) < amount) {
      return { ok: false, reason: 'insufficient' };
    }
    if (!spendXP(amount)) {
      return { ok: false, reason: 'insufficient' };
    }
    let evolvedTo = null;
    updateActivePet((pet) => {
      const oldStage = pet.evolution || 0;
      const newTotal = (pet.totalXpEarned || 0) + amount;
      const species = PET_REGISTRY[pet.speciesId];
      let newStage = oldStage;
      if (species) {
        const evo = getPetEvolution(pet.speciesId, newTotal);
        if (evo) newStage = evo.stage;
      }
      if (newStage > oldStage) evolvedTo = newStage;
      return {
        ...pet,
        totalXpEarned: newTotal,
        evolution: newStage,
        needs: {
          ...pet.needs,
          happiness: Math.min(100, (pet.needs?.happiness ?? 80) + Math.min(30, Math.floor(amount / 20))),
          knowledge: Math.min(100, (pet.needs?.knowledge ?? 80) + Math.min(30, Math.floor(amount / 20))),
        },
        needsUpdatedAt: new Date().toISOString(),
      };
    });
    return { ok: true, evolved: evolvedTo != null, newEvoStage: evolvedTo };
  }, [petData.activePetId, petData.collection, userData.availableXP, spendXP, updateActivePet]);

  // ── Coins ────────────────────────────────────────────────────────────────
  const addCoins = useCallback((amount) => {
    setPetData((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      totalCoinsEarned: (prev.totalCoinsEarned || 0) + amount,
    }));
  }, []);

  const spendCoins = useCallback((amount) => {
    if (petData.coins < amount) return false;
    setPetData((prev) => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }, [petData.coins]);

  // ── Switch active pet ────────────────────────────────────────────────────
  const switchActivePet = useCallback((instanceId) => {
    if (!petData.collection[instanceId]) return;
    // Save current pet's needs with timestamp
    setPetData((prev) => {
      const currentId = prev.activePetId;
      const updated = { ...prev.collection };
      if (currentId && updated[currentId]) {
        updated[currentId] = { ...updated[currentId], needsUpdatedAt: new Date().toISOString() };
      }
      return { ...prev, activePetId: instanceId, collection: updated };
    });
  }, [petData.collection]);

  // ── Unlock pet ───────────────────────────────────────────────────────────
  const unlockPet = useCallback((speciesId) => {
    const species = PET_REGISTRY[speciesId];
    if (!species) return false;
    // Check if already owned
    const alreadyOwned = Object.values(petData.collection).some((p) => p.speciesId === speciesId);
    if (alreadyOwned) return false;
    // Check unlock condition
    if (!checkUnlockCondition(species.unlockCondition, userData, petData)) return false;

    const instanceId = `${speciesId}_${Date.now()}`;
    setPetData((prev) => ({
      ...prev,
      collection: {
        ...prev.collection,
        [instanceId]: {
          speciesId,
          customName: species.name,
          evolution: 0,
          skills: { listening: 0, speaking: 0, reading: 0, writing: 0 },
          needs: { energy: 100, happiness: 100, health: 100, knowledge: 100 },
          cosmetics: { hat: null, outfit: null, room: null, effect: null },
          totalXpEarned: 0,
          needsUpdatedAt: new Date().toISOString(),
          unlockedAt: new Date().toISOString(),
        },
      },
    }));
    return true;
  }, [petData, userData]);

  // ── Rename pet ───────────────────────────────────────────────────────────
  const renamePet = useCallback((instanceId, newName) => {
    setPetData((prev) => {
      if (!prev.collection[instanceId]) return prev;
      return {
        ...prev,
        collection: {
          ...prev.collection,
          [instanceId]: { ...prev.collection[instanceId], customName: newName.slice(0, 20) },
        },
      };
    });
  }, []);

  // ── Set nickname (for leaderboard) ───────────────────────────────────────
  const setNickname = useCallback((name) => {
    setPetData((prev) => ({ ...prev, nickname: name.slice(0, 20) }));
  }, []);

  // ── Buy item ─────────────────────────────────────────────────────────────
  const buyItem = useCallback((itemId, price) => {
    if (petData.coins < price) return false;
    if (petData.ownedItems.includes(itemId)) return false;
    setPetData((prev) => ({
      ...prev,
      coins: prev.coins - price,
      ownedItems: [...prev.ownedItems, itemId],
    }));
    return true;
  }, [petData.coins, petData.ownedItems]);

  // ── Equip/unequip item ───────────────────────────────────────────────────
  const equipItem = useCallback((instanceId, slot, itemId) => {
    setPetData((prev) => {
      const pet = prev.collection[instanceId];
      if (!pet) return prev;
      return {
        ...prev,
        collection: {
          ...prev.collection,
          [instanceId]: {
            ...pet,
            cosmetics: { ...pet.cosmetics, [slot]: itemId },
          },
        },
      };
    });
  }, []);

  // ── Use food item ────────────────────────────────────────────────────────
  const useFood = useCallback((itemId) => {
    const foodEffects = {
      food_pizza: { energy: 30 },
      food_milk: { energy: 20, happiness: 20, health: 20, knowledge: 20 },
      food_cake: { happiness: 40 },
      food_apple: { health: 30 },
      food_book: { knowledge: 30 },
    };
    const effects = foodEffects[itemId];
    if (!effects) return false;
    updateActivePet((pet) => {
      const needs = { ...pet.needs };
      for (const [key, val] of Object.entries(effects)) {
        needs[key] = Math.min(100, (needs[key] ?? 50) + val);
      }
      return { ...pet, needs, needsUpdatedAt: new Date().toISOString() };
    });
    return true;
  }, [updateActivePet]);

  // ── Complete daily quest ─────────────────────────────────────────────────
  const completeDailyQuest = useCallback((questId) => {
    setPetData((prev) => {
      if (prev.dailyQuests.completed.includes(questId)) return prev;
      const quest = DAILY_QUESTS.find((q) => q.id === questId);
      if (!quest || !quest.check(userData)) return prev;
      const completed = [...prev.dailyQuests.completed, questId];
      const bonus = completed.length === DAILY_QUESTS.length ? 25 : 0; // all daily complete bonus
      return {
        ...prev,
        coins: prev.coins + quest.reward + bonus,
        totalCoinsEarned: (prev.totalCoinsEarned || 0) + quest.reward + bonus,
        dailyQuests: { ...prev.dailyQuests, completed },
      };
    });
  }, [userData]);

  // ── Check pet achievements ───────────────────────────────────────────────
  const checkPetAchievements = useCallback(() => {
    setPetData((prev) => {
      const newAch = [...prev.petAchievements];
      let changed = false;
      let coinsToAdd = 0;
      for (const ach of PET_ACHIEVEMENTS) {
        if (!newAch.includes(ach.id) && ach.check(userData, prev)) {
          newAch.push(ach.id);
          coinsToAdd += 30;
          changed = true;
        }
      }
      if (!changed) return prev;
      return {
        ...prev,
        petAchievements: newAch,
        coins: prev.coins + coinsToAdd,
        totalCoinsEarned: (prev.totalCoinsEarned || 0) + coinsToAdd,
      };
    });
  }, [userData]);

  // Check achievements on data changes
  useEffect(() => {
    checkPetAchievements();
  }, [userData, petData.collection]);

  const value = {
    petData,
    getActivePetWithDecay,
    updateActivePet,
    addSkillPoints,
    addAllSkillPoints,
    feedXPToPet,
    feedPet,
    onQuizComplete,
    onLessonComplete,
    onVocabReview,
    addCoins,
    spendCoins,
    switchActivePet,
    unlockPet,
    renamePet,
    setNickname,
    buyItem,
    equipItem,
    useFood,
    completeDailyQuest,
  };

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePet must be used within PetProvider');
  return ctx;
}
