import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { SEO_CONFIGS } from '../../data/seo-config';
import { useAuth } from '../../hooks/useAuth';
import { usePet } from '../../hooks/usePet';
import { useUser } from '../../hooks/useUser';
import { generateDuelQuiz } from '../../data/quiz/duel-quiz-pool';
import { PET_REGISTRY, getEvolutionInfo, ELEMENT_COLORS } from '../../data/pets';
import { PetAvatar, bondOf, topSkillOf } from '../../pet-rig/PetAvatar';
import { usePetDirector } from '../../pet-director/DirectorContext';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';
import { speakWord, stopSpeaking } from '../../utils/speech';
import Icon from '../../components/Icon';
import Emoji, { EmojiText } from '../../components/Emoji';
import { ARENA_CONFIG, PET_SKILLS } from '../../../shared/game-config.js';
import '../../styles/arena.css';

// ── League definitions (D15: 6 bậc LP) ──────────────────────────────────────
const LEAGUES = {
  bronze:   { name: 'Đồng',      icon: '🥉', color: '#CD7F32', bg: '#FFF3E0', min: 0 },
  silver:   { name: 'Bạc',       icon: '🥈', color: '#9E9E9E', bg: '#F5F5F5', min: 200 },
  gold:     { name: 'Vàng',      icon: '🥇', color: '#FFC107', bg: '#FFFDE7', min: 500 },
  platinum: { name: 'Bạch kim',  icon: '💠', color: '#26C6DA', bg: '#E0F7FA', min: 900 },
  diamond:  { name: 'Kim cương', icon: '💎', color: '#00ACC1', bg: '#E0F2FE', min: 1400 },
  master:   { name: 'Cao thủ',   icon: '👑', color: '#E91E63', bg: '#FCE4EC', min: 2000 },
};

// ── Element theming ──────────────────────────────────────────
// Tên hệ lấy từ shared/game-config.js (qua ELEMENT_COLORS); ở đây chỉ giữ màu/emoji/tên chiêu.
// Màu hệ đồng bộ 10 hệ nguyên tố chuẩn tại STD-ART-STYLE-v1.1 (art-spec.json / cowdi-tokens.css).
const ELEMENT_FX = {
  metal:   { color: '#E8C46A', emoji: '⚙️', skillName: 'Steel Strike' },
  wood:    { color: '#7FB05A', emoji: '🌿', skillName: 'Leaf Storm' },
  water:   { color: '#6FB3D9', emoji: '💧', skillName: 'Aqua Blast' },
  fire:    { color: '#F08A5D', emoji: '🔥', skillName: 'Fireball' },
  earth:   { color: '#B98D5E', emoji: '🪨', skillName: 'Rock Smash' },
  dark:    { color: '#6B6BAA', emoji: '🌑', skillName: 'Shadow Bite' },
  light:   { color: '#F5D97A', emoji: '✨', skillName: 'Holy Ray' },
  neutral: { color: '#D9CFC4', emoji: '⚪', skillName: 'Tackle' },
  wind:    { color: '#8FD1C4', emoji: '🌪️', skillName: 'Gale Slash' },
  thunder: { color: '#9B8CE0', emoji: '⚡', skillName: 'Thunder Bolt' },
};
const ELEMENT_THEME = Object.fromEntries(
  Object.entries(ELEMENT_FX).map(([k, fx]) => [k, { ...fx, label: `${fx.emoji} ${ELEMENT_COLORS[k]?.name || k}` }]),
);

function getLeague(points) {
  if (points >= 2000) return 'master';
  if (points >= 1400) return 'diamond';
  if (points >= 900) return 'platinum';
  if (points >= 500) return 'gold';
  if (points >= 200) return 'silver';
  return 'bronze';
}

function getNextLeague(current) {
  const order = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

function petEmoji(petSummary) {
  if (!petSummary?.speciesId) return '🐾';
  const species = PET_REGISTRY[petSummary.speciesId];
  if (!species) return '🐾';
  const evo = getEvolutionInfo(petSummary.speciesId, petSummary.evolution);
  return evo?.emoji || species.emoji;
}

// ── Resolve pet image or emoji (theo cấp pet.evolution, không theo XP) ──
function resolvePetImage(speciesId, stage) {
  if (!speciesId) return null;
  const evo = getEvolutionInfo(speciesId, stage);
  return evo?.image || null;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

// ── Category info ────────────────────────────────────────────
const CATEGORY_INFO = {
  all:        { label: 'Hỗn hợp',    icon: '🎲' },
  vocabulary: { label: 'Từ vựng',    icon: '📚' },
  grammar:    { label: 'Ngữ pháp',   icon: '🔤' },
  sentences:  { label: 'Câu',        icon: '✍️' },
  listening:  { label: 'Nghe',       icon: '🎧' },
};
const CATEGORY_KEYS = ['all', 'vocabulary', 'grammar', 'sentences', 'listening'];
const QUESTION_COUNT_OPTIONS = [10, 20, 30];
const MESSAGE_MAX = 280;

// ── Web Speech TTS helper (dùng chuẩn utils/speech.js) ───────
function speakText(text, rate = 0.9, callbacks = {}) {
  if (!text) return Promise.resolve();
  return speakWord(text, { rate, ...callbacks });
}

// ── Generate duel quiz from quiz bank + lesson quizzes ──────
// generateDuelQuiz is now imported from ../data/duel-quiz-pool

export default function DuelPage() {
  useSEO(SEO_CONFIGS['/duel']);
  const { user, authFetch } = useAuth();
  const { petData } = usePet();
  const { addXP, syncWallet } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  // FR-VIS-02: Thách đấu trực tiếp một người bạn (qua /duel?opponentId=...)
  const [friendOpponent, setFriendOpponent] = useState(null); // { id, nickname }

  // Mode: lobby | setup | creating | playing | result
  const [mode, setMode] = useState('lobby');

  useEffect(() => {
    const oppId = Number(searchParams.get('opponentId'));
    const oppNick = searchParams.get('opponentNick') || 'Bạn bè';
    if (Number.isInteger(oppId) && oppId > 0) {
      setFriendOpponent({ id: oppId, nickname: oppNick });
      setMode('setup');
      searchParams.delete('opponentId');
      searchParams.delete('opponentNick');
      setSearchParams(searchParams, { replace: true });
      return;
    }

    const roomId = searchParams.get('roomId');
    if (roomId) {
      searchParams.delete('roomId');
      setSearchParams(searchParams, { replace: true });
      (async () => {
        try {
          const res = await authFetch(`/api/arena/friend-room/${encodeURIComponent(roomId)}`);
          const data = await res.json();
          if (res.ok && data?.room && data.room.status === 'accepted') {
            enterFriendRoomMatch(data.room);
          } else {
            showToast(data?.error || 'Phòng đấu bạn bè không còn khả dụng.', 'warning');
          }
        } catch {
          showToast('Không thể tham gia phòng đấu bạn bè.', 'danger');
        }
      })();
    }
  }, [searchParams, setSearchParams]);

  // Setup state (pre-create)
  const [setupCount, setSetupCount] = useState(10);
  const [setupCategory, setSetupCategory] = useState('all');
  const [setupMessage, setSetupMessage] = useState('');

  // Lobby data
  const [openDuels, setOpenDuels] = useState([]);
  const [myDuels, setMyDuels] = useState([]);
  const [myStats, setMyStats] = useState({ leaguePoints: 0, duelWins: 0, duelLosses: 0, duelStreak: 0, league: 'bronze' });
  const [arenaProfile, setArenaProfile] = useState({ tickets: 3, lp: 0, tier: 'bronze', winsThisWeek: 0, claimedWeeklyChests: [] });
  const [loading, setLoading] = useState(true);
  const [matchmaking, setMatchmaking] = useState(false);
  const [matchWaitLeft, setMatchWaitLeft] = useState(0);
  const matchCancelRef = useRef(false);
  const matchForceBotRef = useRef(false);
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [pendingFriendRoom, setPendingFriendRoom] = useState(null); // { roomId, friendName }
  const [incomingFriendRooms, setIncomingFriendRooms] = useState([]);
  const friendRoomCancelRef = useRef(false);

  // Arena v2 match state
  const [arenaMatch, setArenaMatch] = useState(null);
  const [activeFriendRoomId, setActiveFriendRoomId] = useState(null);
  const [oppAnsweredCount, setOppAnsweredCount] = useState(0);
  const [waitingFriendFinish, setWaitingFriendFinish] = useState(false);
  const [waitingStepSync, setWaitingStepSync] = useState(false);
  const settledHandledRef = useRef(0);
  const answersRef = useRef([]);
  const timesRef = useRef([]);
  const [arenaHasTicket, setArenaHasTicket] = useState(true);
  const [energy, setEnergy] = useState(0); // 0..5
  const [skillBubble, setSkillBubble] = useState(null); // { side: 'mine' | 'opponent', text: string, effectType?: string }
  const [mySkillCooldown, setMySkillCooldown] = useState(0);
  const [myLowHpUsed, setMyLowHpUsed] = useState(false);
  const [oppEnergy, setOppEnergy] = useState(0);
  const [oppCombo, setOppCombo] = useState(0);
  const [oppSkillCooldown, setOppSkillCooldown] = useState(0);
  const [oppLowHpUsed, setOppLowHpUsed] = useState(false);
  const [cloverSent, setCloverSent] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [activeDuelId, setActiveDuelId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [audioSpeaking, setAudioSpeaking] = useState(false);
  const [audioBlockedHint, setAudioBlockedHint] = useState(false);
  const timerRef = useRef(null);

  // Battle state
  const [myHp, setMyHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [battleAnim, setBattleAnim] = useState(null); // 'attack-mine', 'damage-opponent', etc.
  const [effectClass, setEffectClass] = useState(null); // element effect CSS class
  const [damagePopup, setDamagePopup] = useState(null); // { target, amount, isCritical }
  const [comboCount, setComboCount] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [opponentPet, setOpponentPet] = useState(null); // { speciesId, xp, name, emoji, image, element }
  const [challengerResults, setChallengerResults] = useState([]); // [{correct: bool, time}] per question
  const [questionTimes, setQuestionTimes] = useState([]); // seconds per question (my side)
  const [duelCategory, setDuelCategory] = useState('all'); // category of current active duel
  const [duelMessage, setDuelMessage] = useState(null); // challenger's message
  const [challengerNick, setChallengerNick] = useState(null); // challenger's nickname (when accepting)
  const [challengerTotalTime, setChallengerTotalTime] = useState(null); // challenger's total time (seconds)
  const battleAnimTimeoutRef = useRef(null);
  const myPetRef = useRef(null);
  const oppPetRef = useRef(null);
  const resultMyPetRef = useRef(null);
  const resultOppPetRef = useRef(null);

  // Result state
  const [result, setResult] = useState(null);
  const showToast = useToast();
  const { play } = useSound();

  // ── Load lobby data ─────────────────────────────────────────
  const loadLobby = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const [openRes, myRes, statsRes, arenaRes] = await Promise.all([
        authFetch('/api/duel/open').then(r => r.ok ? r.json() : []),
        authFetch('/api/duel').then(r => r.ok ? r.json() : []),
        authFetch('/api/my-stats').then(r => r.ok ? r.json() : {}),
        authFetch('/api/arena/profile').then(r => r.ok ? r.json() : null),
      ]);
      setOpenDuels(Array.isArray(openRes) ? openRes : []);
      setMyDuels(Array.isArray(myRes) ? myRes : []);
      setMyStats(statsRes);
      if (arenaRes?.profile) {
        setArenaProfile(arenaRes.profile);
      }
      if (arenaRes?.wallet && typeof syncWallet === 'function') {
        syncWallet(arenaRes.wallet);
      }
    } catch {
      // silent
    }
    setLoading(false);
  }, [user, authFetch, syncWallet]);

  useEffect(() => { loadLobby(); }, [loadLobby]);

  // Timer for quiz
  useEffect(() => {
    if (mode === 'creating' || mode === 'playing' || mode === 'arena') {
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - quizStartTime) / 1000)), 200);
      return () => clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [mode, quizStartTime]);

  const playQuestionAudio = useCallback((text, rate = 0.9, isAuto = false) => {
    if (!text) return;
    setAudioBlockedHint(false);
    speakText(text, rate, {
      onStart: () => setAudioSpeaking(true),
      onEnd: () => setAudioSpeaking(false),
    }).catch(() => {
      setAudioSpeaking(false);
      if (isAuto) setAudioBlockedHint(true);
    });
  }, []);

  // Auto-play TTS for listening questions khi sang câu mới
  useEffect(() => {
    if (mode !== 'creating' && mode !== 'playing' && mode !== 'arena') return;
    setAudioBlockedHint(false);
    setAudioSpeaking(false);
    const q = questions[currentQ];
    const qAudio = q?.speak || q?.audioText || '';
    if (q && q.category === 'listening' && qAudio) {
      // Delay nhẹ cho UI mount xong
      const t = setTimeout(() => playQuestionAudio(qAudio, 0.9, true), 220);
      return () => {
        clearTimeout(t);
        stopSpeaking();
      };
    }
    return () => stopSpeaking();
  }, [mode, currentQ, questions, playQuestionAudio]);

  // Dừng TTS khi rời battle mode
  useEffect(() => {
    if (mode !== 'creating' && mode !== 'playing' && mode !== 'arena') {
      stopSpeaking();
      setAudioSpeaking(false);
      setAudioBlockedHint(false);
    }
  }, [mode]);

  const { register, dispatch } = usePetDirector();

  // Đăng ký slot 'battle' (luôn Tầng 1 — chỉ động tác, không chữ) theo pha trận / kết quả
  useEffect(() => {
    if (mode === 'result') {
      return register('battle', resultMyPetRef, { opp: resultOppPetRef });
    }
    if (mode === 'creating' || mode === 'playing' || mode === 'arena') {
      return register('battle', myPetRef, { opp: oppPetRef });
    }
    return undefined;
  }, [mode, register]);

  // Phát sự kiện battle_start khi vào đấu và battle_win / battle_lose khi có kết quả
  useEffect(() => {
    if (mode === 'creating' || mode === 'playing' || mode === 'arena') {
      dispatch('battle_start', { target: 'both' });
    } else if (mode === 'result' && result) {
      if (result.mode === 'created') {
        dispatch(result.score >= result.total / 2 ? 'battle_win' : 'battle_start', { target: 'mine' });
      } else if (!result.isDraw) {
        // Khi Hoà thì để cả 2 pet đứng im (idle), chỉ phát thắng/thua khi có phân định
        dispatch(result.isWin ? 'battle_win' : 'battle_lose', { target: 'mine' });
        dispatch(!result.isWin ? 'battle_win' : 'battle_lose', { target: 'opp' });
      }
    }
  }, [mode, result, dispatch]);

  // ── Open setup screen to configure a new duel ──────────────
  function openSetup() {
    play('click');
    setSetupCount(10);
    setSetupCategory('all');
    setSetupMessage('');
    setMode('setup');
  }

  // ── Start creating a new duel (after setup) ────────────────
  function startCreate() {
    const quiz = generateDuelQuiz(setupCount, setupCategory);
    if (!quiz || quiz.length < Math.min(5, setupCount)) {
      showToast('Không đủ câu hỏi cho chủ đề này!', 'danger');
      return;
    }
    if (quiz._fallbackUsed) {
      showToast('Chủ đề này không đủ câu, đã dùng pool tổng hợp.', 'info');
    }
    play('click');
    setQuestions(quiz);
    setAnswers(new Array(quiz.length).fill(-1));
    setQuestionTimes(new Array(quiz.length).fill(0));
    setCurrentQ(0);
    setSelectedOption(null);
    setQuizStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setElapsed(0);
    setMyHp(100);
    setOpponentHp(100);
    setBattleAnim(null);
    setEffectClass(null);
    setDamagePopup(null);
    setComboCount(0);
    setChallengerResults([]); // no challenger results in creating mode
    setDuelCategory(setupCategory);
    setDuelMessage(null);
    setChallengerNick(null);
    setChallengerTotalTime(null);
    // Pick a random opponent pet for the entire match
    const petKeys = Object.keys(PET_REGISTRY).filter(k => k !== myPetInfo.speciesId);
    const randKey = petKeys[Math.floor(Math.random() * petKeys.length)] || Object.keys(PET_REGISTRY)[0];
    const randSpecies = PET_REGISTRY[randKey];
    const randImg = resolvePetImage(randKey, 2);
    setOpponentPet({
      speciesId: randKey,
      evolution: 2,
      group: randSpecies?.group || 'farm',
      name: randSpecies?.name || 'Đối thủ',
      emoji: randSpecies?.emoji || '🐾',
      image: randImg,
      element: randSpecies?.element || 'neutral',
    });
    setMode('creating');
  }

  // ── Get my pet element ────────────────────────────────────
  const myPetInfo = useMemo(() => {
    const pet = petData.collection[petData.activePetId];
    if (!pet) return { emoji: '🐮', element: 'neutral', group: 'farm', skills: {}, speciesId: null, evolution: 0 };
    const species = PET_REGISTRY[pet.speciesId];
    const evo = getEvolutionInfo(pet.speciesId, pet.evolution);
    return {
      emoji: evo?.emoji || species?.emoji || '🐮',
      element: species?.element || 'neutral',
      group: species?.group || 'farm',
      skills: pet.skills || {},
      speciesId: pet.speciesId,
      evolution: pet.evolution || 0,
      name: pet.customName || species?.name || 'Pet',
    };
  }, [petData]);

  const myPetImage = useMemo(() => resolvePetImage(myPetInfo.speciesId, myPetInfo.evolution), [myPetInfo]);

  // ── Cancel Matchmaking ─────────────────────────────────────
  async function cancelMatchmaking() {
    matchCancelRef.current = true;
    setMatchmaking(false);
    setMatchWaitLeft(0);
    try {
      await authFetch('/api/arena/matchmake/cancel', { method: 'POST' });
    } catch { /* ignore */ }
  }

  // ── Open Friend Picker for Arena PvP ───────────────────────
  async function openFriendPicker() {
    play('click');
    setShowFriendPicker(true);
    setFriendsLoading(true);
    try {
      const res = await authFetch('/api/friends');
      const data = await res.json();
      setFriendsList(Array.isArray(data?.friends) ? data.friends : []);
    } catch {
      setFriendsList([]);
    }
    setFriendsLoading(false);
  }

  // Poll lời mời thách đấu bạn bè ngay trong Lobby /duel
  useEffect(() => {
    if (mode !== 'lobby') return undefined;
    let active = true;
    const fetchIncoming = async () => {
      try {
        const res = await authFetch('/api/arena/friend-room/incoming');
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data?.rooms)) {
          setIncomingFriendRooms(data.rooms);
        }
      } catch { /* ignore */ }
    };
    fetchIncoming();
    const t = setInterval(fetchIncoming, 2000);
    return () => { active = false; clearInterval(t); };
  }, [mode, authFetch]);

  async function respondIncomingFriendRoom(roomId, accept) {
    try {
      const petSnap = {
        speciesId: myPetInfo.speciesId || 'cowdi',
        evolution: myPetInfo.evolution ?? 0,
        skills: myPetInfo.skills || {},
        element: myPetInfo.element,
        group: myPetInfo.group,
      };
      const res = await authFetch(`/api/arena/friend-room/${encodeURIComponent(roomId)}/respond`, {
        method: 'POST',
        body: JSON.stringify({ accept, petSnapshot: petSnap }),
      });
      const data = await res.json();
      setIncomingFriendRooms((prev) => prev.filter((r) => r.roomId !== roomId));
      if (res.ok && accept && data?.room) {
        enterFriendRoomMatch(data.room);
      } else if (!res.ok) {
        showToast(data?.error || 'Không thể tham gia phòng.', 'danger');
      }
    } catch {
      showToast('Lỗi kết nối phòng đấu.', 'danger');
    }
  }

  // Poll real-time từng câu khi đang đấu trong Phòng Bạn bè (1 giây/lần — Lock-step cùng qua câu mới)
  useEffect(() => {
    if (mode !== 'arena' || !activeFriendRoomId) return undefined;
    let active = true;
    const syncLive = async () => {
      try {
        const res = await authFetch(`/api/arena/friend-room/${encodeURIComponent(activeFriendRoomId)}`);
        if (!res.ok) return;
        const data = await res.json();
        const room = data?.room;
        if (!active || !room) return;

        const isCh = (room.mySide || arenaMatch?.mySide || 'challenger') === 'challenger';
        const oppObj = isCh ? room.opponent : room.challenger;
        setOppAnsweredCount(oppObj?.answeredCount || 0);

        const settled = room.liveBattle?.settledCount || 0;
        if (settled > 0) {
          setMyHp(isCh ? room.liveBattle.challengerHpPct : room.liveBattle.opponentHpPct);
          setOpponentHp(isCh ? room.liveBattle.opponentHpPct : room.liveBattle.challengerHpPct);
        }

        // Nếu đối thủ rời trận (forfeit) hoặc trận đã hoàn tất -> chuyển ngay sang màn kết quả!
        if (room.status === 'completed' && room.result) {
          const finalResult = room.result;
          const isWin = finalResult.winner === (room.mySide || 'challenger');
          const isDraw = finalResult.winner === 'draw';
          const br = finalResult.battleResult || {};
          const myBr = isCh ? br.challenger : br.opponent;
          const oppBr = isCh ? br.opponent : br.challenger;
          const myHpPct = Math.round((myBr?.hpPct ?? 1) * 100);
          const theirHpPct = Math.round((oppBr?.hpPct ?? 1) * 100);
          const myProfile = isCh ? finalResult.challengerProfile : finalResult.opponentProfile;
          const rewardMilk = isCh ? (finalResult.challengerRewardMilk || 0) : (finalResult.opponentRewardMilk || 0);
          const lpDelta = isCh ? (finalResult.challengerLpDelta || 0) : (finalResult.opponentLpDelta || 0);

          setMyHp(myHpPct);
          setOpponentHp(theirHpPct);
          if (myProfile) setArenaProfile(myProfile);
          setActiveFriendRoomId(null);
          setWaitingStepSync(false);
          setWaitingFriendFinish(false);
          if (finalResult.forfeitedBy) {
            showToast('Đối thủ đã rời trận — Bạn chiến thắng!', 'success');
          }
          setResult({
            mode: 'arena',
            matchId: finalResult.matchId,
            myScore: isCh ? finalResult.challengerScore : finalResult.opponentScore,
            theirScore: isCh ? finalResult.opponentScore : finalResult.challengerScore,
            myTime: Math.floor((Date.now() - (quizStartTime || Date.now())) / 1000),
            theirTime: Math.round((oppBr?.totalTimeMs || 0) / 1000),
            myHpPct,
            theirHpPct,
            rewardMilk,
            lpDelta,
            hasTicket: finalResult.hasTicket,
            isBot: false,
            opponentId: arenaMatch?.opponentId || null,
            battleLog: br.log || [],
            isWin,
            isDraw,
            total: questions.length,
          });
          setMode('result');
          if (rewardMilk > 0) addXP(rewardMilk);
          play(isWin ? 'duelWin' : isDraw ? 'celebration' : 'duelLose');
          return;
        }

        // Nếu cả 2 đã trả lời xong câu hiện tại (currentQ) -> diễn hoạt ảnh đòn đánh của đối thủ (nếu đối thủ đúng) rồi cùng qua câu mới!
        if (waitingStepSync && settled >= currentQ + 1 && settledHandledRef.current < currentQ + 1) {
          settledHandledRef.current = currentQ + 1;
          const lr = room.liveBattle?.lastRound;
          const oppHitMe = lr && (isCh ? lr.opponentCorrect : lr.challengerCorrect);

          const advanceTurn = () => {
            setMyHp(isCh ? room.liveBattle.challengerHpPct : room.liveBattle.opponentHpPct);
            setOpponentHp(isCh ? room.liveBattle.opponentHpPct : room.liveBattle.challengerHpPct);
            setWaitingStepSync(false);
            if (currentQ < questions.length - 1) {
              setCurrentQ((prev) => prev + 1);
              setSelectedOption(null);
              setQuestionStartTime(Date.now());
            } else {
              finishQuiz(answersRef.current, timesRef.current);
            }
          };

          if (oppHitMe) {
            setBattleAnim('attack-opponent');
            dispatch('battle_attack', { target: 'opp' });
            play('battleAttack');
            setTimeout(() => {
              setBattleAnim('damage-mine');
              dispatch('battle_hit', { target: 'mine' });
              play('battleDamage');
              setTimeout(() => {
                setBattleAnim(null);
                advanceTurn();
              }, 450);
            }, 300);
          } else {
            advanceTurn();
          }
        }
      } catch { /* ignore */ }
    };
    syncLive();
    const t = setInterval(syncLive, 800);
    return () => { active = false; clearInterval(t); };
  }, [mode, activeFriendRoomId, authFetch, arenaMatch?.mySide, waitingStepSync, currentQ, questions.length]);

  // ── Enter Synchronized Friend Room Match ───────────────────
  function enterFriendRoomMatch(room) {
    const mySide = room.mySide || 'challenger';
    const oppObj = mySide === 'challenger' ? room.opponent : room.challenger;
    const oppSnap = oppObj?.petSnapshot || {};
    const oppSpecies = PET_REGISTRY[oppSnap.speciesId] || PET_REGISTRY.cowdi;
    const oppImg = resolvePetImage(oppSnap.speciesId, oppSnap.evolution ?? 0);
    const quiz = Array.isArray(room.quizData) ? room.quizData : [];

    setActiveFriendRoomId(room.roomId);
    setOppAnsweredCount(0);
    setWaitingFriendFinish(false);
    setWaitingStepSync(false);
    settledHandledRef.current = 0;
    answersRef.current = new Array(quiz.length).fill(-1);
    timesRef.current = new Array(quiz.length).fill(0);
    setPendingFriendRoom(null);
    setArenaMatch({
      isBot: false,
      isFriendRoom: true,
      mySide,
      opponentId: oppObj?.userId || null,
      displayName: oppObj?.displayName || 'Bạn bè',
      lp: oppObj?.lp || 0,
      tier: oppObj?.tier || 'bronze',
      petSnapshot: oppSnap,
    });
    setArenaHasTicket(Boolean(room.hasTicket));
    setQuestions(quiz);
    setAnswers(new Array(quiz.length).fill(-1));
    setQuestionTimes(new Array(quiz.length).fill(0));
    setCurrentQ(0);
    setSelectedOption(null);
    setQuizStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setElapsed(0);
    setMyHp(100);
    setOpponentHp(100);
      setComboCount(0);
      setEnergy(0);
      setMySkillCooldown(0);
      setMyLowHpUsed(false);
      setOppEnergy(0);
      setOppCombo(0);
      setOppSkillCooldown(0);
      setOppLowHpUsed(false);
      setSkillBubble(null);
    setCloverSent(false);
    setDuelCategory('all');
    setDuelMessage(null);
    setChallengerNick(oppObj?.displayName || 'Bạn bè');
    setOpponentPet({
      speciesId: oppSnap.speciesId || 'cowdi',
      evolution: oppSnap.evolution ?? 0,
      group: oppSnap.group || oppSpecies?.group || 'farm',
      name: oppObj?.displayName || oppSpecies?.name || 'Bạn bè',
      emoji: oppSpecies?.emoji || '🐮',
      image: oppImg,
      element: oppSnap.element || oppSpecies?.element || 'neutral',
      skills: oppSnap.skills || {},
    });
    setMode('arena');
  }

  async function cancelFriendRoomWait() {
    friendRoomCancelRef.current = true;
    const rId = pendingFriendRoom?.roomId;
    setPendingFriendRoom(null);
    setMatchmaking(false);
    if (rId) {
      try {
        await authFetch(`/api/arena/friend-room/${encodeURIComponent(rId)}/cancel`, { method: 'POST' });
      } catch { /* ignore */ }
    }
  }

  // ── Start Arena v2 Matchmaking (Ghép cặp 10-15s / Mời bạn / Luyện tập AI) ──
  async function startArenaMatch(useTicket = true, friendId = null, friendName = 'Bạn bè') {
    if (useTicket && (arenaProfile?.tickets || 0) <= 0) {
      showToast('Bạn đã hết vé đấu! Hãy học bài mới để nhận thêm vé hoặc Luyện tập AI.', 'warning');
      return;
    }
    const quiz = generateDuelQuiz(10, 'all');
    if (!quiz || quiz.length < 5) {
      showToast('Không đủ câu hỏi Đấu trường!', 'danger');
      return;
    }
    play('click');
    matchCancelRef.current = false;
    matchForceBotRef.current = false;
    friendRoomCancelRef.current = false;
    setShowFriendPicker(false);
    setActiveFriendRoomId(null);
    setMatchmaking(true);

    try {
      const petSnap = {
        speciesId: myPetInfo.speciesId || 'cowdi',
        evolution: myPetInfo.evolution ?? 0,
        skills: myPetInfo.skills || {},
        element: myPetInfo.element,
        group: myPetInfo.group,
      };

      // Luồng Mời bạn đồng bộ 2 người: tạo phòng -> chờ bạn bấm Đồng ý
      if (friendId) {
        const createRes = await authFetch('/api/arena/friend-room', {
          method: 'POST',
          body: JSON.stringify({
            friendId,
            hasTicket: useTicket,
            quizData: quiz,
            petSnapshot: petSnap,
          }),
        });
        const createData = await createRes.json();
        if (!createRes.ok || !createData?.room) {
          showToast(createData?.error || 'Không thể gửi lời mời thách đấu.', 'danger');
          setMatchmaking(false);
          return;
        }

        const roomId = createData.room.roomId;
        setPendingFriendRoom({ roomId, friendName });

        // Poll trạng thái phòng tối đa 90 giây chờ bạn đồng ý
        for (let i = 0; i < 60; i++) {
          if (friendRoomCancelRef.current) {
            setMatchmaking(false);
            setPendingFriendRoom(null);
            return;
          }
          await new Promise((r) => setTimeout(r, 1500));
          if (friendRoomCancelRef.current) {
            setMatchmaking(false);
            setPendingFriendRoom(null);
            return;
          }

          const pollRes = await authFetch(`/api/arena/friend-room/${encodeURIComponent(roomId)}`);
          const pollData = await pollRes.json();
          if (!pollRes.ok || !pollData?.room) break;
          const st = pollData.room.status;
          if (st === 'accepted') {
            setMatchmaking(false);
            enterFriendRoomMatch(pollData.room);
            return;
          }
          if (st === 'declined') {
            showToast(`${friendName} đã từ chối lời mời thách đấu.`, 'info');
            setMatchmaking(false);
            setPendingFriendRoom(null);
            return;
          }
          if (st === 'cancelled') {
            setMatchmaking(false);
            setPendingFriendRoom(null);
            return;
          }
        }

        showToast('Hết thời gian chờ bạn bè phản hồi.', 'warning');
        await cancelFriendRoomWait();
        return;
      }

      const callMatchmake = async (allowBotFallback) => {
        const res = await authFetch('/api/arena/matchmake', {
          method: 'POST',
          body: JSON.stringify({
            petSnapshot: petSnap,
            practice: !useTicket && !friendId,
            allowBotFallback,
            friendId,
            quizData: quiz,
          }),
        });
        const data = await res.json();
        return { res, data };
      };

      // Nếu là luyện tập AI hoặc mời bạn -> vào thẳng không cần chờ hàng đợi
      let { res, data } = await callMatchmake(!useTicket || Boolean(friendId));
      if (!res.ok) {
        showToast(data.error || 'Không tìm được đối thủ.', 'danger');
        setMatchmaking(false);
        return;
      }

      if (data.dailyLimitReached && useTicket) {
        showToast('Bạn đã đấu đủ 2 trận có thưởng với người bạn này hôm nay!', 'warning');
        setMatchmaking(false);
        return;
      }

      // Nếu đang chờ ghép cặp người chơi thực (10–15 giây)
      if (data.status === 'waiting') {
        const waitTotalSec = Math.round((data.waitMs || ARENA_CONFIG.MATCHMAKING_WAIT_MS || 12000) / 1000);
        setMatchWaitLeft(waitTotalSec);

        for (let sec = waitTotalSec; sec > 0; sec -= 1) {
          if (matchCancelRef.current) {
            setMatchmaking(false);
            setMatchWaitLeft(0);
            return;
          }
          setMatchWaitLeft(sec);

          if (matchForceBotRef.current) {
            break;
          }

          // Poll server mỗi 2 giây xem có người chơi thực vào ghép chưa
          if (sec % 2 === 0 && sec < waitTotalSec) {
            const poll = await callMatchmake(false);
            if (poll.res.ok && poll.data?.status === 'matched' && poll.data?.match) {
              data = poll.data;
              break;
            }
          }

          await new Promise((r) => setTimeout(r, 1000));
        }

        if (matchCancelRef.current) {
          setMatchmaking(false);
          setMatchWaitLeft(0);
          return;
        }

        // Hết 12s (hoặc user bấm Đấu ngay với Máy) -> fallback Ghost Bot mang tên người chơi
        if (!data.match) {
          const fallback = await callMatchmake(true);
          if (!fallback.res.ok || !fallback.data?.match) {
            showToast(fallback.data?.error || 'Không tìm được đối thủ.', 'danger');
            setMatchmaking(false);
            setMatchWaitLeft(0);
            return;
          }
          data = fallback.data;
        }
      }

      setMatchWaitLeft(0);
      if (data.room) {
        setMatchmaking(false);
        enterFriendRoomMatch(data.room);
        return;
      }
      if (!data.match) {
        showToast(data.error || 'Không tìm được đối thủ.', 'danger');
        setMatchmaking(false);
        return;
      }

      const m = data.match;
      const oppSnap = m.petSnapshot || {};
      const oppSpecies = PET_REGISTRY[oppSnap.speciesId] || PET_REGISTRY.mushroom;
      const oppImg = resolvePetImage(oppSnap.speciesId, oppSnap.evolution ?? 0);

      setArenaMatch(m);
      setArenaHasTicket(useTicket);
      setQuestions(quiz);
      setAnswers(new Array(quiz.length).fill(-1));
      setQuestionTimes(new Array(quiz.length).fill(0));
      setCurrentQ(0);
      setSelectedOption(null);
      setQuizStartTime(Date.now());
      setQuestionStartTime(Date.now());
      setElapsed(0);
      setMyHp(100);
      setOpponentHp(100);
      setComboCount(0);
      setEnergy(0);
      setSkillBubble(null);
      setCloverSent(false);
      setDuelCategory('all');
      setDuelMessage(null);
      setChallengerNick(m.displayName);
      setOpponentPet({
        speciesId: oppSnap.speciesId || 'mushroom',
        evolution: oppSnap.evolution || 1,
        group: oppSnap.group || oppSpecies?.group || 'herb',
        name: m.displayName || oppSpecies?.name || 'Đối thủ',
        emoji: oppSpecies?.emoji || '🍄',
        image: oppImg,
        element: oppSnap.element || oppSpecies?.element || 'earth',
        skills: oppSnap.skills || {},
      });
      setMode('arena');
    } catch {
      showToast('Lỗi kết nối máy chủ Đấu trường.', 'danger');
    }
    setMatchmaking(false);
    setMatchWaitLeft(0);
  }

  // ── Claim Weekly Chest ──────────────────────────────────────
  async function handleClaimChest(chestId) {
    try {
      play('click');
      const res = await authFetch('/api/arena/claim-chest', {
        method: 'POST',
        body: JSON.stringify({ chestId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã mở rương! Nhận +${data.rewards.milk} Sữa${data.rewards.gem ? ` +${data.rewards.gem} Gem` : ''}${data.rewards.stoneShards ? ` +${data.rewards.stoneShards} Mảnh đá` : ''}!`, 'success');
        play('celebration');
        loadLobby();
      } else {
        showToast(data.error || 'Chưa đủ điều kiện mở rương.', 'warning');
      }
    } catch {
      showToast('Lỗi kết nối server.', 'danger');
    }
  }

  // ── Send Clover after Arena Match ───────────────────────────
  async function handleSendClover(receiverId) {
    if (!receiverId || cloverSent) return;
    try {
      play('click');
      const res = await authFetch('/api/arena/clover', {
        method: 'POST',
        body: JSON.stringify({ receiverId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCloverSent(true);
        showToast('Đã tặng cỏ ba lá 🍀 (+5 Sữa cho đối thủ)!', 'success');
      } else {
        showToast(data.error || 'Không thể tặng cỏ ba lá.', 'warning');
      }
    } catch {
      showToast('Lỗi kết nối.', 'danger');
    }
  }

  // ── Run battle animation sequence ───────────────────────────
  // Both pets can attack independently:
  //  - My pet attacks if I answer this question correctly
  //  - Opponent pet attacks if THEY answered this question correctly
  //    (in 'playing' mode, derived from challengerResults persisted by the creator;
  //     in 'creating' mode there is no real opponent so we mirror: opponent attacks when I miss)
  function runBattleAnimation(isCorrect, isCritical, questionIdx, callback) {
    const myElement = myPetInfo.element;
    const oppElement = opponentPet?.element || 'neutral';
    const challengerTurn = challengerResults[questionIdx];
    const oppAnsweredCorrectly = typeof challengerTurn === 'object'
      ? !!challengerTurn.correct
      : !!challengerTurn;
    // Was the challenger faster than ~3s on this question? Use their stored time for crit.
    const oppTime = (challengerTurn && typeof challengerTurn === 'object' && typeof challengerTurn.time === 'number')
      ? challengerTurn.time
      : null;
    const oppCritical = oppAnsweredCorrectly && oppTime !== null && oppTime < 3;

    clearTimeout(battleAnimTimeoutRef.current);

    // Decide who attacks this turn
    const myPetAttacks = isCorrect;
    const oppPetAttacks = mode === 'playing'
      ? oppAnsweredCorrectly       // real challenger result
      : !isCorrect;                // creating mode mock

    // Scale damage to question count so HP=100 survives the full duel.
    // Budget total damage ≤ ~85% HP even when EVERY answer is a critical hit:
    //   max total per pet ≈ totalQ * critDmg ≤ 85
    const totalQ = Math.max(1, questions.length);
    const baseDmg = Math.max(2, Math.floor(70 / totalQ));
    const critDmg = Math.max(baseDmg + 1, Math.round(baseDmg * 1.4));

    const sequence = [];

    // Phase 1: My pet attacks (if I answered correctly)
    if (myPetAttacks) {
      sequence.push((next) => {
        setBattleAnim('attack-mine');
        dispatch(isCritical ? 'battle_crit' : 'battle_attack', { target: 'mine' });
        play('battleAttack');
        battleAnimTimeoutRef.current = setTimeout(() => {
          setBattleAnim('damage-opponent');
          dispatch('battle_hit', { target: 'opp' });
          setEffectClass(`effect-${myElement}`);
          const dmg = isCritical ? critDmg : baseDmg;
          if (isCritical) {
            play('battleCritical');
          } else {
            play('battleHit');
          }
          setDamagePopup({ target: 'opponent', amount: dmg, isCritical });
          if (!activeFriendRoomId) {
            setOpponentHp(prev => Math.max(0, prev - dmg));
          }
          battleAnimTimeoutRef.current = setTimeout(() => {
            setBattleAnim(null);
            setEffectClass(null);
            setDamagePopup(null);
            next();
          }, 500);
        }, 350);
      });
    }

    // Phase 2: Opponent pet attacks (if they answered correctly, or in creating mode if I was wrong)
    if (oppPetAttacks) {
      sequence.push((next) => {
        setBattleAnim('attack-opponent');
        dispatch(oppCritical ? 'battle_crit' : 'battle_attack', { target: 'opp' });
        play('battleAttack');
        battleAnimTimeoutRef.current = setTimeout(() => {
          setBattleAnim('damage-mine');
          dispatch('battle_hit', { target: 'mine' });
          setEffectClass(`effect-${oppElement}`);
          const oppDmg = oppCritical ? critDmg : baseDmg;
          if (oppCritical) {
            play('battleCritical');
          } else {
            play('battleDamage');
          }
          setDamagePopup({ target: 'mine', amount: oppDmg, isCritical: oppCritical });
          if (!activeFriendRoomId) {
            setMyHp(prev => Math.max(0, prev - oppDmg));
          }
          battleAnimTimeoutRef.current = setTimeout(() => {
            setBattleAnim(null);
            setEffectClass(null);
            setDamagePopup(null);
            next();
          }, 500);
        }, 350);
      });
    }

    // If neither attacks (both missed), emit battle_dodge before advancing
    if (sequence.length === 0) {
      dispatch('battle_dodge', { target: 'both' });
      callback();
      return;
    }

    // Run sequence
    let idx = 0;
    function runNext() {
      if (idx >= sequence.length) {
        callback();
        return;
      }
      sequence[idx++](runNext);
    }
    runNext();
  }

  // ── Select an answer (battle version) ──────────────────────
  function selectAnswer(optionIdx) {
    if (selectedOption !== null || submitting) return;
    setSelectedOption(optionIdx);

    const q = questions[currentQ];
    const hasKnownCorrectAnswer = Number.isInteger(q?.correct);
    const isCorrect = hasKnownCorrectAnswer ? optionIdx === q.correct : true;
    const answerTime = (Date.now() - (questionStartTime || Date.now())) / 1000;
    const isCritical = answerTime < 3 && (hasKnownCorrectAnswer ? isCorrect : true);

    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIdx;
    setAnswers(newAnswers);
    answersRef.current = newAnswers;

    // Track per-question time (seconds, 1 decimal)
    const newTimes = [...questionTimes];
    newTimes[currentQ] = Math.round(answerTime * 10) / 10;
    setQuestionTimes(newTimes);
    timesRef.current = newTimes;

    // Nếu đang ở Phòng Bạn bè đồng bộ -> gửi ngay đáp án câu hiện tại lên server
    if (mode === 'arena' && activeFriendRoomId) {
      setWaitingStepSync(true);
      authFetch(`/api/arena/friend-room/${encodeURIComponent(activeFriendRoomId)}/answer`, {
        method: 'POST',
        body: JSON.stringify({
          questionIndex: currentQ,
          correct: isCorrect,
          timeMs: Math.round(answerTime * 1000),
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const r = d?.room;
          if (!r) return;
          const isCh = (r.mySide || arenaMatch?.mySide || 'challenger') === 'challenger';
          const oppObj = isCh ? r.opponent : r.challenger;
          setOppAnsweredCount(oppObj?.answeredCount || 0);
          const settled = r.liveBattle?.settledCount || 0;
          if (settled > 0) {
            setMyHp(isCh ? r.liveBattle.challengerHpPct : r.liveBattle.opponentHpPct);
            setOpponentHp(isCh ? r.liveBattle.opponentHpPct : r.liveBattle.challengerHpPct);
          }
        })
        .catch(() => {});
    }

    const isSkillMatchClient = (specialty, category) => {
      if (!specialty || !category) return false;
      const s = String(specialty).toLowerCase();
      const c = String(category).toLowerCase();
      return c === s || c.includes(s) || s.includes(c);
    };

    const showPetSkillBubble = (side, petSkill) => {
      if (!petSkill) return;
      setSkillBubble({ side, text: `✨ ${petSkill.nameVi}`, effectType: petSkill.effectType });
      if (side === 'mine' && petSkill.effectType === 'heal' && !activeFriendRoomId) {
        const healPct = Math.max(5, Math.round((petSkill.effectVal || 0.15) * 100));
        setMyHp(prev => Math.min(100, prev + healPct));
        setDamagePopup({ target: 'mine', amount: `+${healPct} HP`, isHeal: true });
      }
      setTimeout(() => setSkillBubble(prev => (prev?.side === side ? null : prev)), 1400);
    };

    if (isCorrect) {
      const nextCombo = comboCount + 1;
      const nextEnergy = Math.min(5, energy + 1);
      setComboCount(nextCombo);
      setEnergy(nextEnergy);
      play('correct');

      // Kiểm tra hiển thị nhãn trigger v0.2 trên đầu pet
      const petSkill = myPetInfo.evolution >= 1 ? PET_SKILLS[myPetInfo.speciesId] : null;
      if (petSkill?.activation && mySkillCooldown <= 0) {
        const trig = petSkill.activation.trigger;
        let triggered = false;
        if (trig === 'energy_full' && nextEnergy >= (petSkill.activation.value || 5)) {
          triggered = true;
          setEnergy(0);
        } else if (trig === 'combo_streak' && nextCombo >= (petSkill.activation.value || 3)) {
          triggered = true;
          setComboCount(0);
        } else if (trig === 'fast_answer' && answerTime * 1000 <= (petSkill.activation.value || 5000)) {
          triggered = true;
        } else if (trig === 'skill_match' && isSkillMatchClient(petSkill.specialty, q?.category)) {
          triggered = true;
        }
        if (triggered) {
          if (petSkill.activation.cooldown_turns) {
            setMySkillCooldown(petSkill.activation.cooldown_turns);
          }
          showPetSkillBubble('mine', petSkill);
        } else if (mySkillCooldown > 0) {
          setMySkillCooldown(c => Math.max(0, c - 1));
        }
      } else if (mySkillCooldown > 0) {
        setMySkillCooldown(c => Math.max(0, c - 1));
      }
    } else {
      setComboCount(0);
      if (mySkillCooldown > 0) setMySkillCooldown(c => Math.max(0, c - 1));
      play('wrong');
    }

    // Kiểm tra trigger đối thủ (hiển thị skill đối thủ trên sân)
    const challengerTurn = challengerResults[currentQ];
    const oppCorrect = mode === 'playing'
      ? (typeof challengerTurn === 'object' ? !!challengerTurn.correct : !!challengerTurn)
      : (mode === 'arena' && !activeFriendRoomId ? Math.random() < 0.72 : !isCorrect);
    const oppSkill = opponentPet?.evolution >= 1 ? PET_SKILLS[opponentPet.speciesId] : null;
    if (oppCorrect && oppSkill?.activation && oppSkillCooldown <= 0) {
      const nextOppCombo = oppCombo + 1;
      const nextOppEnergy = Math.min(5, oppEnergy + 1);
      setOppCombo(nextOppCombo);
      setOppEnergy(nextOppEnergy);
      const oTrig = oppSkill.activation.trigger;
      let oTriggered = false;
      if (oTrig === 'energy_full' && nextOppEnergy >= (oppSkill.activation.value || 5)) {
        oTriggered = true;
        setOppEnergy(0);
      } else if (oTrig === 'combo_streak' && nextOppCombo >= (oppSkill.activation.value || 3)) {
        oTriggered = true;
        setOppCombo(0);
      } else if (oTrig === 'skill_match' && isSkillMatchClient(oppSkill.specialty, q?.category)) {
        oTriggered = true;
      }
      if (oTriggered) {
        if (oppSkill.activation.cooldown_turns) setOppSkillCooldown(oppSkill.activation.cooldown_turns);
        setTimeout(() => showPetSkillBubble('opponent', oppSkill), 450);
      }
    } else {
      if (!oppCorrect) setOppCombo(0);
      if (oppSkillCooldown > 0) setOppSkillCooldown(c => Math.max(0, c - 1));
    }

    // Run battle animation, then advance (nếu đang ở Phòng Bạn bè đồng bộ thì chờ đối thủ xong cùng câu mới qua câu kế)
    runBattleAnimation(isCorrect, isCritical, currentQ, () => {
      if (mode === 'arena' && activeFriendRoomId) {
        return; // useEffect poll (800ms) sẽ chuyển câu ngay khi settledCount >= currentQ + 1
      }
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOption(null);
        setQuestionStartTime(Date.now());
      } else {
        finishQuiz(newAnswers, newTimes);
      }
    });
  }

  // ── Finish quiz ─────────────────────────────────────────────
  async function finishQuiz(finalAnswers, finalTimes) {
    setSubmitting(true);
    clearInterval(timerRef.current);
    const time = Math.floor((Date.now() - quizStartTime) / 1000);
    const qTimes = Array.isArray(finalTimes) ? finalTimes : questionTimes;

    if (mode === 'creating') {
      // Score locally (we know correct answers)
      const score = finalAnswers.reduce((s, a, i) => s + (a === questions[i].correct ? 1 : 0), 0);
      try {
        const res = await authFetch('/api/duel', {
          method: 'POST',
          body: JSON.stringify({
            quizData: questions,
            answers: finalAnswers,
            time,
            questionTimes: qTimes,
            category: setupCategory,
            message: setupMessage.trim() || null,
            ...(friendOpponent?.id ? { opponentId: friendOpponent.id } : {}),
          }),
        });
        const data = await res.json();
        if (data.ok) {
          setResult({
            mode: 'created',
            score,
            total: questions.length,
            time,
            challengeId: data.challengeId,
            isFriendDuel: Boolean(data.isFriendDuel || friendOpponent?.id),
          });
          setFriendOpponent(null);
          setMode('result');
          const milk = data.milkEarned ?? (score * 5);
          addXP(milk);
          if (data.wallet && typeof syncWallet === 'function') {
            syncWallet(data.wallet);
          }
          play('celebration');
        } else {
          showToast(data.error || 'Lỗi tạo thách đấu.', 'danger');
          setMode('lobby');
        }
      } catch {
        showToast('Lỗi kết nối server.', 'danger');
        setMode('lobby');
      }
    } else if (mode === 'playing') {
      try {
        const res = await authFetch(`/api/duel/${activeDuelId}/join`, {
          method: 'POST',
          body: JSON.stringify({ answers: finalAnswers, time, questionTimes: qTimes }),
        });
        const data = await res.json();
        if (data.ok) {
          const isWin = data.winnerId === user.id;
          const isDraw = !data.winnerId;
          const myHpPct = data.opponentHpPct != null ? data.opponentHpPct : (100 - (data.challengerScore || 0) * 10);
          const theirHpPct = data.challengerHpPct != null ? data.challengerHpPct : (100 - (data.opponentScore || 0) * 10);
          setMyHp(myHpPct);
          setOpponentHp(theirHpPct);
          setResult({
            mode: 'played',
            myScore: data.opponentScore,
            theirScore: data.challengerScore,
            myTime: time,
            theirTime: data.challengerTime,
            myPoints: myHpPct,
            theirPoints: theirHpPct,
            myHpPct,
            theirHpPct,
            battleLog: data.battleLog || [],
            breakdown: data.breakdown || [],
            winnerId: data.winnerId,
            isWin,
            isDraw,
            total: questions.length,
          });
          setMode('result');
          const milk = data.milkEarned ?? (data.opponentScore * 5);
          addXP(milk);
          if (data.wallet && typeof syncWallet === 'function') {
            syncWallet(data.wallet);
          }
          play(isWin ? 'duelWin' : isDraw ? 'celebration' : 'duelLose');
        } else {
          showToast(data.error || 'Lỗi nộp bài.', 'danger');
          setMode('lobby');
        }
      } catch {
        showToast('Lỗi kết nối server.', 'danger');
        setMode('lobby');
      }
    } else if (mode === 'arena') {
      try {
        const chAnswersBool = finalAnswers.map((a, i) => a === questions[i].correct);
        const chTimesMs = qTimes.map((sec) => Math.round((Number(sec) || 3) * 1000));

        // Nếu đang ở phòng mời bạn đồng bộ 2 người
        if (activeFriendRoomId) {
          const subRes = await authFetch(`/api/arena/friend-room/${encodeURIComponent(activeFriendRoomId)}/submit`, {
            method: 'POST',
            body: JSON.stringify({ answers: chAnswersBool, times: chTimesMs }),
          });
          let roomPayload = await subRes.json();
          if (!subRes.ok) {
            showToast(roomPayload?.error || 'Lỗi nộp bài phòng đấu.', 'danger');
            setMode('lobby');
            return;
          }

          if (roomPayload.waitingOpponent) {
            setWaitingFriendFinish(true);
            for (let i = 0; i < 90; i++) {
              await new Promise((r) => setTimeout(r, 1000));
              const pollRes = await authFetch(`/api/arena/friend-room/${encodeURIComponent(activeFriendRoomId)}`);
              const pollData = await pollRes.json();
              if (pollRes.ok && pollData?.room) {
                const rm = pollData.room;
                const isChPoll = (rm.mySide || arenaMatch?.mySide || 'challenger') === 'challenger';
                const oppPoll = isChPoll ? rm.opponent : rm.challenger;
                setOppAnsweredCount(oppPoll?.answeredCount || 0);
                if (rm.status === 'completed' && rm.result) {
                  roomPayload = rm;
                  break;
                }
              }
            }
            setWaitingFriendFinish(false);
          }

          const finalResult = roomPayload.result;
          if (!finalResult) {
            showToast('Đối thủ chưa hoàn thành kịp thời gian.', 'warning');
            setMode('lobby');
            setActiveFriendRoomId(null);
            return;
          }

          const mySide = roomPayload.mySide || arenaMatch?.mySide || 'challenger';
          const isCh = mySide === 'challenger';
          const isWin = finalResult.winner === mySide;
          const isDraw = finalResult.winner === 'draw';
          const br = finalResult.battleResult || {};
          const myBr = isCh ? br.challenger : br.opponent;
          const oppBr = isCh ? br.opponent : br.challenger;
          const myHpPct = Math.round((myBr?.hpPct ?? 1) * 100);
          const theirHpPct = Math.round((oppBr?.hpPct ?? 1) * 100);
          const myProfile = isCh ? finalResult.challengerProfile : finalResult.opponentProfile;
          const rewardMilk = isCh ? (finalResult.challengerRewardMilk || 0) : (finalResult.opponentRewardMilk || 0);
          const lpDelta = isCh ? (finalResult.challengerLpDelta || 0) : (finalResult.opponentLpDelta || 0);

          setMyHp(myHpPct);
          setOpponentHp(theirHpPct);
          if (myProfile) setArenaProfile(myProfile);
          setActiveFriendRoomId(null);

          setResult({
            mode: 'arena',
            matchId: finalResult.matchId,
            myScore: isCh ? finalResult.challengerScore : finalResult.opponentScore,
            theirScore: isCh ? finalResult.opponentScore : finalResult.challengerScore,
            myTime: time,
            theirTime: Math.round((oppBr?.totalTimeMs || 35000) / 1000),
            myHpPct,
            theirHpPct,
            rewardMilk,
            lpDelta,
            hasTicket: finalResult.hasTicket,
            isBot: false,
            opponentId: arenaMatch?.opponentId || null,
            battleLog: br.log || [],
            isWin,
            isDraw,
            total: questions.length,
          });
          setMode('result');
          if (rewardMilk > 0) addXP(rewardMilk);
          play(isWin ? 'duelWin' : isDraw ? 'celebration' : 'duelLose');
          setSubmitting(false);
          return;
        }

        const res = await authFetch('/api/arena/submit', {
          method: 'POST',
          body: JSON.stringify({
            opponentId: arenaMatch?.opponentId || null,
            isBot: Boolean(arenaMatch?.isBot),
            hasTicket: arenaHasTicket,
            quizData: questions.map(q => ({ category: q.category || 'vocabulary' })),
            challengerAnswers: chAnswersBool,
            challengerTimes: chTimesMs,
            challengerPetSnap: {
              speciesId: myPetInfo.speciesId || 'cowdi',
              evolution: myPetInfo.evolution || 1,
              skills: myPetInfo.skills || {},
              element: myPetInfo.element,
              group: myPetInfo.group,
            },
            opponentPetSnap: arenaMatch?.petSnapshot || {},
          }),
        });
        const data = await res.json();
        if (res.ok && data.matchId) {
          const isWin = data.winner === 'challenger';
          const isDraw = data.winner === 'draw';
          const br = data.battleResult || {};
          const myHpPct = Math.round((br.challenger?.hpPct ?? 1) * 100);
          const theirHpPct = Math.round((br.opponent?.hpPct ?? 1) * 100);
          setMyHp(myHpPct);
          setOpponentHp(theirHpPct);

          if (data.updatedProfile) {
            setArenaProfile(data.updatedProfile);
          }

          setResult({
            mode: 'arena',
            matchId: data.matchId,
            myScore: data.challengerScore,
            theirScore: data.opponentScore,
            myTime: time,
            theirTime: Math.round((br.opponent?.totalTimeMs || 35000) / 1000),
            myHpPct,
            theirHpPct,
            rewardMilk: data.rewardMilk || 0,
            lpDelta: data.challengerLpDelta || 0,
            hasTicket: data.hasTicket,
            isBot: Boolean(arenaMatch?.isBot),
            opponentId: arenaMatch?.opponentId || null,
            battleLog: br.log || [],
            isWin,
            isDraw,
            total: questions.length,
          });
          setMode('result');
          if (data.rewardMilk > 0) {
            addXP(data.rewardMilk);
          }
          play(isWin ? 'duelWin' : isDraw ? 'celebration' : 'duelLose');
        } else {
          showToast(data.error || 'Lỗi nộp trận Đấu trường.', 'danger');
          setMode('lobby');
        }
      } catch {
        showToast('Lỗi kết nối máy chủ Đấu trường.', 'danger');
        setMode('lobby');
      }
    }
    setSubmitting(false);
  }

  // ── Play an open duel ───────────────────────────────────────
  async function playDuel(duelId) {
    try {
      const res = await authFetch(`/api/duel/${duelId}`);
      const data = await res.json();
      if (data?.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(-1));
        setQuestionTimes(new Array(data.questions.length).fill(0));
        setCurrentQ(0);
        setSelectedOption(null);
        setQuizStartTime(Date.now());
        setQuestionStartTime(Date.now());
        setElapsed(0);
        setActiveDuelId(duelId);
        setMyHp(100);
        setOpponentHp(100);
        setBattleAnim(null);
        setEffectClass(null);
        setDamagePopup(null);
        setComboCount(0);
        // Store challenger's per-question results for battle animation
        setChallengerResults(data.challengerResults || []);
        setDuelCategory(data.category || 'all');
        setDuelMessage(data.message || null);
        setChallengerNick(data.challengerNick || null);
        setChallengerTotalTime(typeof data.challengerTime === 'number' ? data.challengerTime : null);
        // Use challenger's pet as opponent
        if (data.challengerPet?.speciesId) {
          const cSpecies = PET_REGISTRY[data.challengerPet.speciesId];
          const cImg = resolvePetImage(data.challengerPet.speciesId, data.challengerPet.evolution);
          setOpponentPet({
            speciesId: data.challengerPet.speciesId,
            evolution: data.challengerPet.evolution || 0,
            group: cSpecies?.group || 'farm',
            name: data.challengerPet.customName || cSpecies?.name || 'Đối thủ',
            emoji: cSpecies?.emoji || '🐾',
            image: cImg,
            element: cSpecies?.element || 'neutral',
          });
        } else {
          setOpponentPet({ speciesId: null, evolution: 0, group: 'farm', name: 'Đối thủ', emoji: '🐾', image: null, element: 'neutral' });
        }
        setMode('playing');
      } else {
        showToast('Thách đấu không khả dụng.', 'danger');
      }
    } catch {
      showToast('Lỗi kết nối server.', 'danger');
    }
  }

  // Tự động xử thua nếu người chơi đóng tab / rời trang khi đang đấu Phòng Bạn bè
  useEffect(() => {
    if (mode !== 'arena' || !activeFriendRoomId) return undefined;
    const rId = activeFriendRoomId;
    const handleBeforeUnload = () => {
      try {
        authFetch(`/api/arena/friend-room/${encodeURIComponent(rId)}/forfeit`, {
          method: 'POST',
          keepalive: true,
        });
      } catch { /* ignore */ }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [mode, activeFriendRoomId, authFetch]);

  // ── Return to lobby ─────────────────────────────────────────
  function backToLobby() {
    if (mode === 'arena' && activeFriendRoomId) {
      const rId = activeFriendRoomId;
      authFetch(`/api/arena/friend-room/${encodeURIComponent(rId)}/forfeit`, {
        method: 'POST',
        keepalive: true,
      }).catch(() => {});
      showToast('Bạn đã rời trận đấu nên bị xử thua!', 'warning');
    }
    setActiveFriendRoomId(null);
    setWaitingStepSync(false);
    setWaitingFriendFinish(false);
    setMode('lobby');
    setResult(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQ(0);
    setSelectedOption(null);
    setActiveDuelId(null);
    loadLobby();
  }

  // My pet emoji (for lobby)
  const myPetEmoji = myPetInfo.emoji;

  // ── Not logged in ───────────────────────────────────────────
  if (!user) {
    return (
      <div className="text-center py-5 fade-in">
        <div className="fs-1 mb-3 emoji-big"><Icon name="swords" size={44} /></div>
        <h2 className="fw-bold">Đấu trường Pet</h2>
        <p className="text-muted">Đăng nhập để thách đấu với người chơi khác!</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: SETUP MODE (pre-create)
  // ═══════════════════════════════════════════════════════════
  if (mode === 'setup') {
    const msgLen = setupMessage.length;
    return (
      <div className="fade-in">
        {friendOpponent && (
          <div className="alert alert-info py-2 px-3 small mb-3 d-flex justify-content-between align-items-center">
            <div>
              ⚔️ Thách đấu giao hữu với <strong>{friendOpponent.nickname}</strong> (không cộng/trừ LP)
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary py-0"
              onClick={() => setFriendOpponent(null)}
            >
              Huỷ chỉ định
            </button>
          </div>
        )}
        <div className="d-flex align-items-center mb-3">
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => { play('click'); setMode('lobby'); }}>
            ← Quay lại
          </button>
          <h5 className="fw-bold mb-0"><Icon name="swords" size={20} /> Tạo thách đấu</h5>
        </div>

        {/* Số câu hỏi */}
        <div className="card shadow-sm mb-3">
          <div className="card-body py-3">
            <div className="fw-bold small mb-2"><Icon name="note" size={16} /> Số câu hỏi</div>
            <div className="d-flex gap-2">
              {QUESTION_COUNT_OPTIONS.map(n => (
                <button
                  key={n}
                  type="button"
                  className={`btn flex-grow-1 fw-bold ${setupCount === n ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
                  onClick={() => { play('click'); setSetupCount(n); }}
                >
                  {n} câu
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chủ đề */}
        <div className="card shadow-sm mb-3">
          <div className="card-body py-3">
            <div className="fw-bold small mb-2"><Icon name="target" size={16} /> Chủ đề</div>
            <div className="d-flex flex-wrap gap-2">
              {CATEGORY_KEYS.map(key => {
                const info = CATEGORY_INFO[key];
                const active = setupCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`btn btn-sm ${active ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
                    onClick={() => { play('click'); setSetupCategory(key); }}
                  >
                    <Emoji e={info.icon} size={16} /> {info.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lời nhắn */}
        <div className="card shadow-sm mb-3">
          <div className="card-body py-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold small"><Icon name="chat" size={16} /> Lời nhắn thách đấu (tuỳ chọn)</span>
              <span className={`small ${msgLen > MESSAGE_MAX ? 'text-danger' : 'text-muted'}`}>
                {msgLen}/{MESSAGE_MAX}
              </span>
            </div>
            <textarea
              className="form-control"
              rows={3}
              maxLength={MESSAGE_MAX}
              placeholder="Vd: Đến đây nào newbie! 😎"
              value={setupMessage}
              onChange={(e) => setSetupMessage(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-cowdi-primary w-100 py-3 fw-bold"
          onClick={startCreate}
          disabled={msgLen > MESSAGE_MAX}
        >
          <Icon name="rocket" size={18} /> Bắt đầu thách đấu
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: BATTLE MODE (creating / playing / arena)
  // ═══════════════════════════════════════════════════════════
  if (mode === 'creating' || mode === 'playing' || mode === 'arena') {
    const q = questions[currentQ];
    const progress = ((currentQ) / questions.length) * 100;
    const elementTheme = ELEMENT_THEME[myPetInfo.element] || ELEMENT_THEME.neutral;
    const oppTheme = ELEMENT_THEME[opponentPet?.element || 'earth'] || ELEMENT_THEME.neutral;
    const catInfo = CATEGORY_INFO[duelCategory] || CATEGORY_INFO.all;

    const hpColor = (hp) => hp > 50 ? '#2ECC71' : hp > 25 ? '#F39C12' : '#E74C3C';
    const energyPct = Math.min(100, Math.round((energy / 5) * 100));

    return (
      <div className="arena-page-container fade-in">
        {friendOpponent && (
          <div className="alert alert-info py-2 px-3 small mb-3 d-flex justify-content-between align-items-center">
            <div>
              ⚔️ Thách đấu giao hữu với <strong>{friendOpponent.nickname}</strong> (không cộng/trừ LP)
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary py-0"
              onClick={() => setFriendOpponent(null)}
            >
              Huỷ chỉ định
            </button>
          </div>
        )}

        {/* ── Top Bar ── */}
        <div className="arena-topbar">
          <div className="arena-topbar-left">
            <button
              type="button"
              className="arena-back-btn"
              title="Quay lại sảnh"
              onClick={() => { play('click'); backToLobby(); }}
            >
              ←
            </button>
            <div className="arena-title-wrap">
              <h5>
                {mode === 'arena'
                  ? (arenaMatch?.isFriendRoom
                      ? (arenaHasTicket ? 'Đấu Bạn bè (1 vé)' : 'Đấu Bạn bè (Giao hữu)')
                      : (arenaHasTicket ? 'Đấu trường Xếp hạng' : 'Đấu trường Luyện tập AI'))
                  : mode === 'creating'
                    ? 'Tạo thách đấu'
                    : 'Thách đấu'}
              </h5>
              <p className="arena-subtitle">
                Chủ đề: {catInfo.label} · Câu {currentQ + 1}/{questions.length}
                {arenaMatch?.isFriendRoom
                  ? (waitingStepSync
                      ? ` · ⏳ Đang chờ đối thủ chọn câu ${currentQ + 1}...`
                      : ` · Đối thủ: ${oppAnsweredCount}/${questions.length}`)
                  : ''}
              </p>
            </div>
          </div>

          <div className="arena-topbar-right">
            {comboCount >= 1 && (
              <div className="arena-combo-chip">
                🔥 Combo x{comboCount}
              </div>
            )}
            <div className="arena-timer-chip">
              <Icon name="timer" size={14} /> {elapsed}s
            </div>
            {(q?.speak || q?.audioText) && (
              <button
                type="button"
                className="arena-sound-btn"
                title="Nghe phát âm"
                onClick={() => playQuestionAudio(q.speak || q.audioText, 0.9, false)}
              >
                <Icon name="sound" size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress mb-3" style={{ height: 5, borderRadius: 4 }}>
          <div className="progress-bar bg-success" style={{ width: `${progress}%`, transition: 'width 0.3s' }}></div>
        </div>

        {/* ── Sân Đấu Đồi Cỏ Mây Trời ── */}
        <div className="arena-battlefield">
          <div className="arena-sun"></div>
          <div className="arena-cloud arena-cloud-1"></div>
          <div className="arena-cloud arena-cloud-2"></div>

          <div className="arena-hill-opponent"></div>
          <div className="arena-hill-mine"></div>

          {/* Element effect overlay */}
          {effectClass && <div className={`battle-effect ${effectClass}`}></div>}
          {damagePopup?.isCritical && <div className="battle-effect effect-critical"></div>}

          {/* Opponent HUD Card */}
          {(() => {
            const oppSkill = (opponentPet?.evolution || 0) >= 1 ? PET_SKILLS[opponentPet?.speciesId] : null;
            const oppTrig = oppSkill?.activation?.trigger;
            let oppBadge = '';
            if (oppSkill) {
              if (oppSkillCooldown > 0) oppBadge = `Hồi ${oppSkillCooldown}L`;
              else if (oppTrig === 'combo_streak') oppBadge = `${oppCombo}/${oppSkill.activation.value || 3} câu`;
              else if (oppTrig === 'energy_full') oppBadge = `NL ${oppEnergy}/${oppSkill.activation.value || 5}`;
              else if (oppTrig === 'fast_answer') oppBadge = `≤${Math.round((oppSkill.activation.value || 5000) / 1000)}s`;
              else if (oppTrig === 'skill_match') oppBadge = 'Sở trường';
              else if (oppTrig === 'low_hp') oppBadge = oppLowHpUsed ? 'Đã dùng' : 'HP ≤30%';
            }
            return (
              <div className="arena-hud-card arena-hud-opponent">
                <div className="arena-hud-header">
                  <div className="arena-pet-title">
                    <span>{opponentPet?.name || 'Đối thủ'}</span>
                    <span className="arena-elem-badge" style={{ backgroundColor: oppTheme.color }}>
                      {ELEMENT_COLORS[opponentPet?.element || 'earth']?.name || 'Đất'}
                    </span>
                  </div>
                  <span className="arena-pet-level">C{(opponentPet?.evolution || 0) + 1}</span>
                </div>
                <div className="arena-bar-wrap">
                  <span className="arena-bar-label">HP</span>
                  <div className="arena-bar-track">
                    <div className="arena-hp-fill" style={{ width: `${opponentHp}%`, backgroundColor: hpColor(opponentHp) }}></div>
                  </div>
                  <span className="arena-bar-val">{opponentHp}/100</span>
                </div>
                {oppSkill ? (
                  <div className="arena-skill-chip" title={oppSkill.descVi}>
                    <span className="arena-skill-name">✨ {oppSkill.nameVi}</span>
                    <span className={`arena-skill-badge is-opponent ${oppSkillCooldown > 0 ? 'is-cooldown' : ''}`}>{oppBadge}</span>
                  </div>
                ) : (
                  <div className="arena-skill-chip">
                    <span className="arena-skill-name text-muted">🥚 Chưa mở kỹ năng</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* My Pet HUD Card */}
          {(() => {
            const mySkill = (myPetInfo.evolution || 0) >= 1 ? PET_SKILLS[myPetInfo.speciesId] : null;
            const myTrig = mySkill?.activation?.trigger;
            let myBadge = '';
            if (mySkill) {
              if (mySkillCooldown > 0) myBadge = `Hồi ${mySkillCooldown}L`;
              else if (myTrig === 'combo_streak') myBadge = `${comboCount}/${mySkill.activation.value || 3} câu`;
              else if (myTrig === 'energy_full') myBadge = `NL ${energy}/${mySkill.activation.value || 5}`;
              else if (myTrig === 'fast_answer') myBadge = `≤${Math.round((mySkill.activation.value || 5000) / 1000)}s`;
              else if (myTrig === 'skill_match') myBadge = 'Sở trường';
              else if (myTrig === 'low_hp') myBadge = myLowHpUsed ? 'Đã dùng' : 'HP ≤30%';
            }
            return (
              <div className="arena-hud-card arena-hud-mine">
                <div className="arena-hud-header">
                  <div className="arena-pet-title">
                    <span>{myPetInfo.name}</span>
                    <span className="arena-elem-badge" style={{ backgroundColor: elementTheme.color }}>
                      {ELEMENT_COLORS[myPetInfo.element]?.name || 'Vô'}
                    </span>
                  </div>
                  <span className="arena-pet-level">C{(myPetInfo.evolution || 0) + 1}</span>
                </div>
                <div className="arena-bar-wrap">
                  <span className="arena-bar-label">HP</span>
                  <div className="arena-bar-track">
                    <div className="arena-hp-fill" style={{ width: `${myHp}%`, backgroundColor: hpColor(myHp) }}></div>
                  </div>
                  <span className="arena-bar-val">{myHp}/100</span>
                </div>
                {mySkill ? (
                  <div className="arena-skill-chip" title={mySkill.descVi}>
                    <span className="arena-skill-name">✨ {mySkill.nameVi}</span>
                    <span className={`arena-skill-badge ${mySkillCooldown > 0 ? 'is-cooldown' : ''}`}>{myBadge}</span>
                  </div>
                ) : (
                  <div className="arena-skill-chip">
                    <span className="arena-skill-name text-muted">🥚 Chưa mở kỹ năng</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* My Pet Avatar & Trigger Bubble */}
          <div className={`arena-pet-wrapper arena-pet-mine ${
            skillBubble?.side === 'mine' ? 'has-skill-active anim-skill-cast' : ''
          } ${
            battleAnim === 'attack-mine' ? 'anim-attack-mine' :
            battleAnim === 'damage-mine' ? 'anim-damage' :
            myHp <= 0 ? 'anim-faint' : ''
          }`}>
            {skillBubble?.side === 'mine' && (
              <div className={`arena-skill-trigger-bubble ${
                skillBubble.effectType === 'heal' ? 'is-heal' :
                skillBubble.effectType === 'shield' ? 'is-shield' : ''
              }`}>{skillBubble.text}</div>
            )}
            {damagePopup?.target === 'mine' && (
              <div className={`arena-damage-pop ${damagePopup.isHeal ? 'is-heal' : ''}`}>
                {damagePopup.isHeal ? damagePopup.amount : `-${damagePopup.amount}`}
              </div>
            )}
            <div className="pet-render-slot">
              {myPetInfo.speciesId ? (
                <PetAvatar
                  ref={myPetRef}
                  petId={myPetInfo.speciesId}
                  stage={(myPetInfo.evolution || 0) + 1}
                  group={myPetInfo.group}
                  bond={bondOf(myPetInfo.skills)}
                  topSkill={topSkillOf(myPetInfo.skills)}
                  mode="battle"
                  targetFacing="right"
                  canvasBubble={false}
                  fallbackSrc={myPetImage || undefined}
                  alt={myPetInfo.name}
                />
              ) : (
                <div className="pet-emoji-lg emoji-big"><Emoji e={myPetInfo.emoji} size={96} /></div>
              )}
            </div>
          </div>

          {/* Opponent Pet Avatar & Trigger Bubble */}
          <div className={`arena-pet-wrapper arena-pet-opponent ${
            skillBubble?.side === 'opponent' ? 'has-skill-active anim-skill-cast' : ''
          } ${
            battleAnim === 'attack-opponent' ? 'anim-attack-opponent' :
            battleAnim === 'damage-opponent' ? 'anim-damage' :
            opponentHp <= 0 ? 'anim-faint' : ''
          }`}>
            {skillBubble?.side === 'opponent' && (
              <div className={`arena-skill-trigger-bubble ${
                skillBubble.effectType === 'heal' ? 'is-heal' :
                skillBubble.effectType === 'shield' ? 'is-shield' : ''
              }`}>{skillBubble.text}</div>
            )}
            {damagePopup?.target === 'opponent' && (
              <div className={`arena-damage-pop ${damagePopup.isHeal ? 'is-heal' : ''}`}>
                {damagePopup.isHeal ? damagePopup.amount : `${damagePopup.isCritical ? '💥 ' : ''}-${damagePopup.amount}`}
              </div>
            )}
            <div className="pet-render-slot">
              {opponentPet?.speciesId ? (
                <PetAvatar
                  ref={oppPetRef}
                  petId={opponentPet.speciesId}
                  stage={(opponentPet.evolution || 0) + 1}
                  group={opponentPet.group}
                  mode="battle"
                  targetFacing="left"
                  canvasBubble={false}
                  fallbackSrc={opponentPet.image || undefined}
                  alt={opponentPet.name}
                />
              ) : (
                <div className="pet-emoji-lg emoji-big"><Emoji e={opponentPet?.emoji || '🐾'} size={96} /></div>
              )}
            </div>
          </div>
        </div>

        {/* ── Khối Câu Hỏi (Trái) & 4 Đáp Án Lớn 2x2 (Phải) ── */}
        {waitingFriendFinish ? (
          <div className="cowdi-card p-4 text-center border border-primary bg-light my-2">
            <div className="fw-bold fs-5 mb-1">⏳ Bạn đã hoàn thành {questions.length}/{questions.length} câu!</div>
            <div className="text-muted small">
              Đang chờ đối thủ trả lời xong ({oppAnsweredCount}/{questions.length} câu)... Kết quả sẽ hiện ngay khi cả hai hoàn tất.
            </div>
          </div>
        ) : (
        <div className="arena-qa-desktop">
          <div className="arena-question-card">
            <div className="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
              <span className="arena-q-category-tag">
                {(CATEGORY_INFO[q?.category] || { label: q?.category || 'CÂU HỎI' }).label.toUpperCase()}
              </span>
              {(q?.speak || q?.audioText) && (
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 fw-bold ${
                    q?.category === 'listening' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => playQuestionAudio(q.speak || q.audioText, 0.9, false)}
                >
                  <Icon name="sound" size={14} />{' '}
                  {audioSpeaking
                    ? 'Đang đọc...'
                    : q?.category === 'listening'
                      ? 'Nghe câu hỏi'
                      : 'Nghe'}
                </button>
              )}
            </div>
            {audioBlockedHint && (q?.speak || q?.audioText) && (
              <div className="small text-primary fw-semibold mb-2">
                🔊 Trình duyệt chặn tự phát — chạm nút <strong>Nghe câu hỏi</strong> để nghe nhé!
              </div>
            )}
            <div className="arena-q-word">
              {q?.word || q?.question}
            </div>
            {q?.word && q?.question && q.word !== q.question && (
              <p className="arena-q-subtext">{q.question}</p>
            )}
          </div>

          <div className="arena-options-grid">
            {(q?.options || []).map((opt, idx) => {
              let optClass = 'arena-option-btn';
              const hasKnownCorrect = Number.isInteger(q?.correct);
              if (selectedOption !== null) {
                if (hasKnownCorrect) {
                  if (idx === q.correct) optClass += ' opt-correct';
                  else if (idx === selectedOption && idx !== q.correct) optClass += ' opt-wrong';
                } else if (idx === selectedOption) {
                  optClass += ' opt-selected';
                }
              }
              return (
                <button
                  key={`${currentQ}-${idx}`}
                  type="button"
                  className={optClass}
                  onClick={() => selectAnswer(idx)}
                  disabled={selectedOption !== null}
                >
                  <span className="arena-option-key">{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: BATTLE RESULT MODE
  // ═══════════════════════════════════════════════════════════
  if (mode === 'result' && result) {
    const league = LEAGUES[myStats.league] || LEAGUES.bronze;
    const elementTheme = ELEMENT_THEME[myPetInfo.element] || ELEMENT_THEME.neutral;

    if (result.mode === 'created') {
      return (
        <div className="text-center fade-in py-4">
          <div className="fs-1 mb-2 emoji-big"><Icon name="swords" size={44} /></div>
          <h3 className="fw-bold">Thách đấu đã tạo!</h3>
          <div className="card shadow-sm mx-auto mt-3" style={{ maxWidth: 340 }}>
            <div className="card-body">
              {/* Battle Pet Display */}
              <div className="mb-2 d-flex justify-content-center">
                {myPetInfo.speciesId ? (
                  <PetAvatar
                    ref={resultMyPetRef}
                    petId={myPetInfo.speciesId}
                    stage={(myPetInfo.evolution || 0) + 1}
                    group={myPetInfo.group}
                    bond={bondOf(myPetInfo.skills)}
                    topSkill={topSkillOf(myPetInfo.skills)}
                    mode="battle"
                    canvasBubble={false}
                    fallbackSrc={myPetImage || undefined}
                    alt={myPetInfo.name}
                    style={{ width: 88, maxWidth: 88, maxHeight: 96 }}
                  />
                ) : (
                  <div className="fs-1 emoji-big"><Emoji e={myPetInfo.emoji} size={44} /></div>
                )}
              </div>
              <h4 className="fw-bold">{result.score}/{result.total}</h4>
              <div className="mb-2">
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <span className="small text-muted">HP còn lại:</span>
                  <div className="hp-bar" style={{ width: 100 }}>
                    <div className="hp-bar-fill" style={{
                      width: `${myHp}%`,
                      backgroundColor: myHp > 50 ? '#2ECC71' : myHp > 25 ? '#F39C12' : '#E74C3C'
                    }}></div>
                  </div>
                  <span className="small fw-bold">{myHp}%</span>
                </div>
              </div>
              <p className="text-muted mb-1"><Icon name="timer" size={16} /> {result.time}s</p>
              <p className="text-muted small">Đang chờ đối thủ chấp nhận...</p>
              <div className="d-flex justify-content-center gap-2 mt-2">
                <span className="badge bg-primary">+{result.score * 5} Sữa 🥛</span>
                <span className="badge bg-info text-dark">+5 LP</span>
              </div>
            </div>
          </div>
          <button className="btn btn-cowdi-primary mt-4" onClick={backToLobby}>
            ← Quay về đấu trường
          </button>
        </div>
      );
    }

    // Played result — VS battle result (Gọn 1 màn hình)
    const skillLogCount = Array.isArray(result.battleLog)
      ? result.battleLog.filter(e => e.type === 'skill').length
      : 0;
    return (
      <div className="arena-result-screen fade-in">
        {/* Header + Rewards inline */}
        <div className="arena-result-header">
          <div className="d-flex align-items-center justify-content-center gap-2">
            <span className="emoji-big">
              {result.isWin ? <Icon name="party" size={28} /> : result.isDraw ? <Icon name="handshake" size={28} /> : <Icon name="sad" size={28} />}
            </span>
            <h4 className="fw-bold mb-0" style={{ color: result.isWin ? '#2ECC71' : result.isDraw ? '#F39C12' : '#E74C3C' }}>
              {result.isWin ? 'CHIẾN THẮNG!' : result.isDraw ? 'HÒA!' : 'THẤT BẠI!'}
            </h4>
          </div>
          <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap mt-2">
            {result.mode === 'arena' ? (
              <>
                {result.hasTicket ? (
                  <span className="badge bg-primary">+{result.rewardMilk} Sữa 🥛</span>
                ) : (
                  <span className="badge bg-secondary">Đấu luyện tập (0 vé)</span>
                )}
                <span className={`badge ${result.lpDelta >= 0 ? 'bg-info text-dark' : 'bg-danger'}`}>
                  {result.lpDelta >= 0 ? `+${result.lpDelta}` : result.lpDelta} LP
                </span>
                {!result.isBot && result.opponentId && (
                  <button
                    type="button"
                    className={`btn btn-sm py-0 px-2 ${cloverSent ? 'btn-success' : 'btn-outline-success'}`}
                    style={{ fontSize: '0.75rem' }}
                    disabled={cloverSent}
                    onClick={() => handleSendClover(result.opponentId)}
                  >
                    🍀 {cloverSent ? 'Đã tặng cỏ!' : 'Tặng cỏ (+5 🥛)'}
                  </button>
                )}
              </>
            ) : (
              <>
                <span className="badge bg-primary">+{result.myScore * 5} Sữa 🥛</span>
                <span className="badge bg-info text-dark">
                  +{result.isWin ? 30 : result.isDraw ? 15 : 5} LP
                </span>
              </>
            )}
          </div>
        </div>

        {/* Compact VS Comparison */}
        <div className="arena-result-vs">
          {/* My pet */}
          <div className="text-center">
            <div className="mb-1 d-flex justify-content-center">
              {myPetInfo.speciesId ? (
                <PetAvatar
                  ref={resultMyPetRef}
                  petId={myPetInfo.speciesId}
                  stage={(myPetInfo.evolution || 0) + 1}
                  group={myPetInfo.group}
                  bond={bondOf(myPetInfo.skills)}
                  topSkill={topSkillOf(myPetInfo.skills)}
                  mode="battle"
                  canvasBubble={false}
                  fallbackSrc={myPetImage || undefined}
                  alt={myPetInfo.name}
                  style={{ width: 56, maxWidth: 56, maxHeight: 60 }}
                />
              ) : (
                <div className="emoji-big"><Emoji e={myPetInfo.emoji} size={32} /></div>
              )}
            </div>
            <div className="fw-bold text-truncate" style={{ fontSize: '0.8rem' }}>{myPetInfo.name}</div>
            <div className="hp-bar mx-auto my-1" style={{ width: '90%', height: 6 }}>
              <div className="hp-bar-fill" style={{
                width: `${myHp}%`,
                backgroundColor: myHp > 50 ? '#2ECC71' : myHp > 25 ? '#F39C12' : '#E74C3C'
              }}></div>
            </div>
            <div className="d-flex justify-content-center align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
              <span className={`fw-bold ${result.isWin ? 'text-success' : ''}`}>{result.myScore}/{result.total}</span>
              <span className="text-muted">·</span>
              <span className="text-muted"><Icon name="timer" size={12} /> {result.myTime}s</span>
            </div>
          </div>

          <div className="fw-bold text-muted" style={{ fontSize: '0.85rem' }}>VS</div>

          {/* Opponent pet */}
          <div className="text-center">
            <div className="mb-1 d-flex justify-content-center">
              {opponentPet?.speciesId ? (
                <PetAvatar
                  ref={resultOppPetRef}
                  petId={opponentPet.speciesId}
                  stage={(opponentPet.evolution || 0) + 1}
                  group={opponentPet.group}
                  mode="battle"
                  canvasBubble={false}
                  fallbackSrc={opponentPet.image || undefined}
                  alt={opponentPet.name}
                  style={{ width: 56, maxWidth: 56, maxHeight: 60 }}
                />
              ) : (
                <div className="emoji-big"><Emoji e={opponentPet?.emoji || '🐾'} size={32} /></div>
              )}
            </div>
            <div className="fw-bold text-truncate mx-auto" style={{ fontSize: '0.8rem', maxWidth: 120 }}>
              {challengerNick || opponentPet?.name || 'Đối thủ'}
            </div>
            <div className="hp-bar mx-auto my-1" style={{ width: '90%', height: 6 }}>
              <div className="hp-bar-fill" style={{
                width: `${opponentHp}%`,
                backgroundColor: opponentHp > 50 ? '#2ECC71' : opponentHp > 25 ? '#F39C12' : '#E74C3C'
              }}></div>
            </div>
            <div className="d-flex justify-content-center align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
              <span className={`fw-bold ${!result.isWin && !result.isDraw ? 'text-success' : ''}`}>{result.theirScore}/{result.total}</span>
              <span className="text-muted">·</span>
              <span className="text-muted"><Icon name="timer" size={12} /> {result.theirTime}s</span>
            </div>
          </div>
        </div>

        {/* Server Battle Log (v2) or Per-question breakdown — Internal scroll */}
        {Array.isArray(result.battleLog) && result.battleLog.length > 0 ? (
          <div className="arena-result-log-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h6 className="fw-bold mb-0" style={{ fontSize: '0.85rem' }}>⚔️ Nhật ký trận đấu (Server v2)</h6>
              {skillLogCount > 0 && (
                <span className="badge bg-success-subtle text-success" style={{ fontSize: '0.68rem' }}>
                  ✨ {skillLogCount} Skill
                </span>
              )}
            </div>
            <div className="arena-result-log-list">
              {result.battleLog.map((entry, idx) => {
                const isMine = result.mode === 'arena'
                  ? entry.side === 'challenger'
                  : entry.side === 'opponent';
                return (
                  <div key={idx} className={`py-1 border-bottom ${entry.type === 'skill' ? 'bg-success-subtle px-1 rounded' : ''}`}>
                    <span className={`badge me-1 ${entry.type === 'skill' ? 'bg-success' : 'bg-secondary'}`}>C{entry.q}</span>
                    <span className={isMine ? 'text-primary fw-bold' : 'text-danger fw-bold'}>
                      {isMine ? 'Bạn' : 'Đối thủ'}
                    </span>
                    {entry.type === 'miss' && ' trả lời sai (hụt đòn)'}
                    {entry.type === 'attack' && (
                      <>
                        {entry.crit && <span className="text-danger fw-bold"> [CRIT]</span>}
                        {entry.dodged && <span className="text-info"> [Né đòn]</span>}
                        {entry.blocked && <span className="text-warning"> [Chặn khiên]</span>}
                        {!entry.dodged && !entry.blocked && ` gây ${entry.damage} sát thương`}
                        {entry.burnApplied && ' (gây bỏng)'}
                        {entry.stunApplied && ' (gây choáng)'}
                        {entry.lifesteal > 0 && ` (hút ${entry.lifesteal} HP)`}
                      </>
                    )}
                    {entry.type === 'skill' && entry.skill && (
                      <span className="text-success fw-bold">
                        {' '}✨ [{entry.skill.label}] tung chiêu <u>{entry.skill.skillName}</u>
                        {entry.skill.damageDealt > 0 && ` gây ${entry.skill.damageDealt} sát thương`}
                        {entry.skill.healed > 0 && ` hồi ${entry.skill.healed} HP`}
                        {entry.skill.shieldGained > 0 && ` (+1 khiên)`}
                      </span>
                    )}
                    {entry.type === 'burn' && ` dính ${entry.damage} sát thương bỏng`}
                  </div>
                );
              })}
            </div>
          </div>
        ) : Array.isArray(result.breakdown) && result.breakdown.length > 0 ? (
          <div className="arena-result-log-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h6 className="fw-bold mb-0" style={{ fontSize: '0.85rem' }}><Icon name="search" size={14} /> Diễn biến từng câu</h6>
              <span className="small"><span className="fw-bold text-success">{result.myPoints}</span> - <span className="fw-bold text-danger">{result.theirPoints}</span></span>
            </div>
            <div className="arena-result-log-list">
              {result.breakdown.map((row, i) => {
                const mineOk = row.opponentCorrect;
                const theirOk = row.challengerCorrect;
                const mineT = row.opponentTime;
                const theirT = row.challengerTime;
                let tag = '—';
                let tagCls = 'bg-secondary';
                if (row.winner === 'opponent') { tag = 'Bạn thắng'; tagCls = 'bg-success'; }
                else if (row.winner === 'challenger') { tag = 'Đối thủ thắng'; tagCls = 'bg-danger'; }
                else if (row.winner === 'tie') { tag = 'Hoà'; tagCls = 'bg-warning text-dark'; }
                return (
                  <div key={i} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span className="text-muted" style={{ minWidth: 26 }}>#{i + 1}</span>
                    <span style={{ minWidth: 62 }} className="text-start">
                      <Icon name={mineOk ? 'check' : 'x'} size={13} /> {mineT ? `${mineT}s` : '-'}
                    </span>
                    <span className={`badge ${tagCls}`} style={{ fontSize: '0.62rem' }}>{tag}</span>
                    <span style={{ minWidth: 62 }} className="text-end">
                      {theirT ? `${theirT}s` : '-'} <Icon name={theirOk ? 'check' : 'x'} size={13} />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <button className="btn btn-cowdi-primary w-100 py-2 fw-bold" onClick={backToLobby}>
          ← Quay về đấu trường
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER: LOBBY MODE
  // ═══════════════════════════════════════════════════════════
  const currentLp = arenaProfile?.lp ?? myStats.leaguePoints ?? 0;
  const currentTier = arenaProfile?.tier || getLeague(currentLp);
  const league = LEAGUES[currentTier] || LEAGUES.bronze;
  const nextLeagueKey = getNextLeague(currentTier);
  const nextLeague = nextLeagueKey ? LEAGUES[nextLeagueKey] : null;
  const progressToNext = nextLeague ? Math.min(100, Math.max(0, ((currentLp - league.min) / (nextLeague.min - league.min)) * 100)) : 100;

  // Split my duels
  const pendingDuels = myDuels.filter(d => d.status === 'pending' && d.challengerId === user.id);
  const completedDuels = myDuels.filter(d => d.status === 'completed');

  const weeklyChestsList = Object.values(ARENA_CONFIG.WEEKLY_CHESTS);

  return (
    <div className="fade-in arena-page-container">
      {/* Header */}
      <div className="text-center mb-3">
        <h2 className="fw-bold"><span className="me-2"><Icon name="swords" size={32} /></span>Đấu trường Pet</h2>
        <p className="text-muted small">Học bài để nhận vé đấu · Đấu xếp hạng nhận Sữa & Rương tuần!</p>
      </div>

      {/* My Stats & Tickets Card (v2) */}
      <div className="card shadow-sm mb-3" style={{ background: league.bg, borderRadius: 16 }}>
        <div className="card-body">
          <div className="d-flex align-items-center gap-3">
            <div className="text-center">
              <div className="fs-1 emoji-big"><Emoji e={league.icon} size={44} /></div>
              <div className="fw-bold small" style={{ color: league.color }}>{league.name}</div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center small mb-1">
                <span className="fw-bold fs-6">{currentLp} LP</span>
                <span className="badge bg-white text-dark border shadow-sm px-2 py-1">
                  🎫 <strong>{arenaProfile?.tickets ?? 3}</strong>/15 vé
                </span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar" style={{ width: `${progressToNext}%`, backgroundColor: league.color }}></div>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-2 small">
                <div className="d-flex gap-3">
                  <span className="text-success fw-bold">{myStats.duelWins}W</span>
                  <span className="text-danger fw-bold">{myStats.duelLosses}L</span>
                  {nextLeague && (
                    <span className="text-muted">Mốc {nextLeague.name}: {nextLeague.min} LP</span>
                  )}
                </div>
              </div>
            </div>
            <div>{myPetImage ? <img src={myPetImage} alt={myPetInfo.name} style={{ width: 52, height: 52, objectFit: 'contain' }} /> : <span className="fs-2 emoji-big"><Emoji e={myPetEmoji} size={36} /></span>}</div>
          </div>
        </div>
      </div>

      {/* Weekly Chests Progress (D4) */}
      <div className="card shadow-sm mb-3" style={{ borderRadius: 14 }}>
        <div className="card-body py-2 px-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold small">🏆 Rương Tuần ({arenaProfile?.winsThisWeek || 0} trận thắng)</span>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>Reset thứ Hai</span>
          </div>
          <div className="row g-2">
            {weeklyChestsList.map((ch) => {
              const claimed = (arenaProfile?.claimedWeeklyChests || []).includes(ch.id);
              const unlocked = (arenaProfile?.winsThisWeek || 0) >= ch.winsRequired;
              return (
                <div key={ch.id} className="col-4">
                  <div className={`border rounded p-2 text-center ${claimed ? 'bg-light text-muted' : unlocked ? 'border-success bg-success-subtle' : 'bg-white'}`}>
                    <div className="fw-bold" style={{ fontSize: '0.78rem' }}>{ch.labelVi}</div>
                    <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                      {ch.winsRequired} thắng · +{ch.rewardMilk}🥛
                      {ch.rewardGem > 0 ? ` +${ch.rewardGem}💎` : ''}
                      {ch.rewardStoneShards > 0 ? ` +${ch.rewardStoneShards}🪨` : ''}
                    </div>
                    {claimed ? (
                      <span className="badge bg-secondary mt-1" style={{ fontSize: '0.65rem' }}>Đã nhận</span>
                    ) : unlocked ? (
                      <button
                        type="button"
                        className="btn btn-xs btn-success py-0 px-2 mt-1 fw-bold"
                        style={{ fontSize: '0.7rem' }}
                        onClick={() => handleClaimChest(ch.id)}
                      >
                        Nhận quà!
                      </button>
                    ) : (
                      <span className="text-muted d-block mt-1" style={{ fontSize: '0.65rem' }}>
                        {arenaProfile?.winsThisWeek || 0}/{ch.winsRequired}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lời mời thách đấu bạn bè đến (hiển thị ngay giữa trang /duel) */}
      {incomingFriendRooms.length > 0 && (
        <div className="cowdi-card p-3 mb-3 border border-success bg-light">
          {incomingFriendRooms.map((inv) => (
            <div key={inv.roomId} className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <div className="fw-bold text-success">
                  ⚔️ {inv.challenger?.displayName || 'Bạn bè'} mời bạn đấu trực tiếp!
                </div>
                <div className="small text-muted">
                  {inv.hasTicket ? 'Trận Xếp hạng 1 vé (100% thưởng Sữa & LP)' : 'Trận Giao hữu 0 vé (không tính LP, không thưởng)'}
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-cowdi-primary fw-bold"
                  onClick={() => respondIncomingFriendRoom(inv.roomId, true)}
                >
                  ✅ Đồng ý vào phòng
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => respondIncomingFriendRoom(inv.roomId, false)}
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Primary Arena v2 Actions: 2 chức năng chính (Ghép cặp & Mời bạn) */}
      {pendingFriendRoom ? (
        <div className="cowdi-card p-3 mb-3 text-center border border-primary bg-light">
          <div className="fw-bold mb-1">
            ⏳ Đang chờ {pendingFriendRoom.friendName} đồng ý vào phòng...
          </div>
          <div className="small text-muted mb-2">
            Khi bạn của bạn bấm "Đồng ý vào phòng", cả hai sẽ cùng thi đấu bộ 10 câu hỏi giống nhau!
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={cancelFriendRoomWait}
          >
            Huỷ lời mời
          </button>
        </div>
      ) : matchmaking && matchWaitLeft > 0 ? (
        <div className="cowdi-card p-3 mb-3 text-center border border-warning bg-light">
          <div className="fw-bold mb-1">
            ⏳ Đang tìm người chơi ghép cặp... ({matchWaitLeft}s)
          </div>
          <div className="small text-muted mb-2">
            Nếu sau {matchWaitLeft}s chưa có người đang ghép, hệ thống sẽ ghép Máy mang tên người chơi (thưởng 50%).
          </div>
          <div className="d-flex gap-2 justify-content-center">
            <button
              type="button"
              className="btn btn-sm btn-warning fw-bold"
              onClick={() => { matchForceBotRef.current = true; }}
            >
              ⚡ Đấu ngay với Máy (50%)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={cancelMatchmaking}
            >
              Huỷ tìm trận
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-6">
            <button
              type="button"
              className="btn btn-cowdi-primary w-100 py-3 fw-bold"
              disabled={matchmaking}
              onClick={() => startArenaMatch(true)}
            >
              {matchmaking ? '⏳ Đang ghép trận...' : '⚔️ Ghép cặp (1 vé · Người 8/5/2 🥛 · Máy 4/2/1 🥛)'}
            </button>
          </div>
          <div className="col-12 col-md-6">
            <button
              type="button"
              className="btn btn-outline-primary w-100 py-3 fw-bold"
              disabled={matchmaking}
              onClick={openFriendPicker}
            >
              👥 Mời bạn đấu trực tiếp (100% thưởng)
            </button>
          </div>
        </div>
      )}

      {/* Secondary Action: Luyện tập AI (0 vé · 0 thưởng) */}
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-outline-secondary w-100 py-2 fw-bold"
          disabled={matchmaking}
          onClick={() => startArenaMatch(false)}
        >
          🤖 Luyện tập AI (0 vé · 0 LP · 0 Sữa)
        </button>
      </div>

      {/* Modal chọn bạn bè đấu trực tiếp */}
      {showFriendPicker && (
        <div className="cowdi-card p-3 mb-4 border border-primary">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold mb-0">👥 Chọn bạn bè để mời đấu (100% thưởng)</h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowFriendPicker(false)}
            >
              Đóng
            </button>
          </div>
          {friendsLoading ? (
            <div className="text-center py-2 text-muted small">Đang tải danh sách bạn bè...</div>
          ) : friendsList.length === 0 ? (
            <div className="text-center py-2 text-muted small">
              Bạn chưa có bạn bè nào. Hãy vào mục Bạn bè để kết bạn trước nhé!
            </div>
          ) : (
            <div className="d-grid gap-2" style={{ maxHeight: 240, overflowY: 'auto' }}>
              {friendsList.map((fr) => (
                <div key={fr.userId || fr.id} className="d-flex justify-content-between align-items-center p-2 border rounded bg-white">
                  <div>
                    <div className="fw-bold">{fr.displayName || fr.nickname || 'Bạn bè'}</div>
                    <div className="small text-muted">Mã: {fr.friendCode || '—'}</div>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-cowdi-primary fw-bold"
                      onClick={() => startArenaMatch(true, fr.userId || fr.id, fr.displayName || fr.nickname || 'Bạn bè')}
                    >
                      Đấu 1 vé (100%)
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => startArenaMatch(false, fr.userId || fr.id, fr.displayName || fr.nickname || 'Bạn bè')}
                    >
                      Giao hữu (0 vé)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Incoming friend duels (FR-VIS-02) */}
      {myDuels.filter((d) => d.status === 'pending' && d.isFriendDuel && Number(d.opponentId) === Number(user.id)).length > 0 && (
        <>
          <h6 className="fw-bold mb-2">🤝 Lời thách đấu từ bạn bè (không tính LP)</h6>
          <div className="d-grid gap-2 mb-4">
            {myDuels
              .filter((d) => d.status === 'pending' && d.isFriendDuel && Number(d.opponentId) === Number(user.id))
              .map((duel) => (
                <div key={duel.id} className="card shadow-sm border-primary" style={{ cursor: 'pointer' }} onClick={() => joinDuel(duel.id)}>
                  <div className="card-body d-flex align-items-center gap-2 py-2">
                    <div className="flex-grow-1">
                      <div className="fw-bold small">{duel.challengerNick} thách đấu bạn!</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {duel.questionCount} câu · Giao hữu bạn bè · {timeAgo(duel.createdAt)}
                      </div>
                    </div>
                    <button className="btn btn-sm btn-cowdi-primary fw-bold">Đấu ngay!</button>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* My pending duels */}
      {pendingDuels.length > 0 && (
        <>
          <h6 className="fw-bold mb-2"><Icon name="hourglass" size={18} /> Đang chờ đối thủ</h6>
          <div className="d-grid gap-2 mb-4">
            {pendingDuels.map(duel => (
              <div key={duel.id} className="card shadow-sm">
                <div className="card-body d-flex align-items-center gap-2 py-2">
                  {myPetImage ? <img src={myPetImage} alt={myPetInfo.name} style={{ width: 36, height: 36, objectFit: 'contain' }} /> : <span className="fs-3"><Emoji e={myPetEmoji} size={28} /></span>}
                  <div className="flex-grow-1">
                    <div className="fw-bold small">Thách đấu #{duel.id}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                      Điểm: {duel.challengerScore}/{duel.questionCount} · {timeAgo(duel.createdAt)}
                    </div>
                  </div>
                  <span className="badge bg-warning text-dark">Chờ...</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Completed duels */}
      {completedDuels.length > 0 && (
        <>
          <h6 className="fw-bold mb-2"><Icon name="scroll" size={18} /> Lịch sử đấu</h6>
          <div className="d-grid gap-2 mb-4">
            {completedDuels.slice(0, 10).map(duel => {
              const isChallenger = duel.challengerId === user.id;
              const myScore = isChallenger ? duel.challengerScore : duel.opponentScore;
              const theirScore = isChallenger ? duel.opponentScore : duel.challengerScore;
              const isWin = duel.winnerId === user.id;
              const isDraw = !duel.winnerId;
              const opponentNick = isChallenger ? (duel.opponentNick || 'Đối thủ') : duel.challengerNick;
              const opponentPetData = isChallenger ? duel.opponentPet : duel.challengerPet;

              return (
                <div key={duel.id} className={`card shadow-sm ${isWin ? 'border-success' : isDraw ? 'border-warning' : 'border-danger'}`}>
                  <div className="card-body d-flex align-items-center gap-2 py-2">
                    <span className={`fw-bold ${isWin ? 'text-success' : isDraw ? 'text-warning' : 'text-danger'}`}>
                      <Icon name={isWin ? 'check' : isDraw ? 'handshake' : 'x'} size={18} />
                    </span>
                    {resolvePetImage(opponentPetData?.speciesId, opponentPetData?.evolution) ? (
                      <img src={resolvePetImage(opponentPetData?.speciesId, opponentPetData?.evolution)} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                    ) : (
                      <span className="fs-4"><Emoji e={petEmoji(opponentPetData)} size={24} /></span>
                    )}
                    <div className="flex-grow-1">
                      <div className="fw-bold small">vs {opponentNick}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{timeAgo(duel.createdAt)}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold small">
                        <span className={isWin ? 'text-success' : ''}>{myScore}</span>
                        <span className="text-muted"> : </span>
                        <span className={!isWin && !isDraw ? 'text-success' : ''}>{theirScore}</span>
                      </div>
                      <span className={`badge ${isWin ? 'bg-success' : isDraw ? 'bg-warning text-dark' : 'bg-danger'}`} style={{ fontSize: '0.6rem' }}>
                        {isWin ? '+30 LP' : isDraw ? '+15 LP' : '+5 LP'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
