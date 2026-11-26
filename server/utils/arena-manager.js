// ============================================================
// Cowdi English — Arena Manager v2 (GĐ5 · D4, D15, D16, D17)
// Quản lý vé đấu, xếp hạng LP, đối thủ AI, phần thưởng và ledger.
// ============================================================

import pool from '../config/database.js';
import { ARENA_CONFIG, PET_BATTLE_DATA, PET_SKILLS } from '../../shared/game-config.js';
import { simulateBattle, resolveSnapshot, computeStats } from '../../shared/battle-engine.js';
import { getIsoWeekString } from './wallet.js';

/** Lấy bậc xếp hạng từ điểm LP */
export function getTierFromLp(lp) {
  const n = Math.max(0, Number(lp) || 0);
  const tiers = ARENA_CONFIG.TIERS;
  if (n >= tiers.master.minLp) return 'master';
  if (n >= tiers.diamond.minLp) return 'diamond';
  if (n >= tiers.platinum.minLp) return 'platinum';
  if (n >= tiers.gold.minLp) return 'gold';
  if (n >= tiers.silver.minLp) return 'silver';
  return 'bronze';
}

/** Chuẩn hoá định dạng ngày YYYY-MM-DD */
function getTodayDateString(date = new Date()) {
  return date.toISOString().split('T')[0];
}

let arenaTablesEnsured = false;

/**
 * Tự động tạo bảng arena_profiles, arena_matches, arena_clovers nếu chưa có (idempotent).
 */
export async function ensureArenaTables(db = pool) {
  if (arenaTablesEnsured || db !== pool) return;
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS arena_profiles (
        user_id                INT UNSIGNED NOT NULL PRIMARY KEY,
        tickets                INT NOT NULL DEFAULT 3,
        lp                     INT NOT NULL DEFAULT 0,
        tier                   VARCHAR(32) NOT NULL DEFAULT 'bronze',
        wins_this_week         INT NOT NULL DEFAULT 0,
        claimed_weekly_chests  VARCHAR(255) NOT NULL DEFAULT '[]',
        last_ticket_refill     DATE DEFAULT NULL,
        last_weekly_reset      DATE DEFAULT NULL,
        season_id              VARCHAR(32) NOT NULL DEFAULT 'season_1',
        created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS arena_matches (
        id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        challenger_id        INT UNSIGNED NOT NULL,
        opponent_id          INT UNSIGNED NULL,
        is_bot               TINYINT(1) NOT NULL DEFAULT 0,
        has_ticket           TINYINT(1) NOT NULL DEFAULT 1,
        winner               VARCHAR(32) NOT NULL,
        challenger_score     INT NOT NULL DEFAULT 0,
        opponent_score       INT NOT NULL DEFAULT 0,
        challenger_lp_delta  INT NOT NULL DEFAULT 0,
        opponent_lp_delta    INT NOT NULL DEFAULT 0,
        reward_milk          INT NOT NULL DEFAULT 0,
        season_id            VARCHAR(32) NOT NULL DEFAULT 'season_1',
        battle_log           MEDIUMTEXT NULL,
        created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_challenger_date (challenger_id, created_at),
        INDEX idx_opponent_date (opponent_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS arena_clovers (
        id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sender_id   INT UNSIGNED NOT NULL,
        receiver_id INT UNSIGNED NOT NULL,
        sent_date   DATE NOT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_sender_receiver_date (sender_id, receiver_id, sent_date),
        INDEX idx_receiver_date (receiver_id, sent_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    arenaTablesEnsured = true;
  } catch (err) {
    console.warn('[arena] ensureArenaTables warning:', err.message);
  }
}

/**
 * Đảm bảo người dùng có hồ sơ Đấu trường.
 * Tự động cấp 3 vé miễn phí/ngày (max 15) và reset rương tuần vào thứ Hai.
 */
export async function ensureArenaProfile(userId, db = pool) {
  await ensureArenaTables(db);
  const today = getTodayDateString();
  const currentWeek = getIsoWeekString();

  const [[row]] = await db.execute(
    'SELECT * FROM arena_profiles WHERE user_id = ?',
    [userId]
  );

  if (!row) {
    const initialTickets = ARENA_CONFIG.TICKETS.DAILY_FREE;
    await db.execute(
      `INSERT INTO arena_profiles
         (user_id, tickets, lp, tier, wins_this_week, claimed_weekly_chests, last_ticket_refill, last_weekly_reset, season_id)
       VALUES (?, ?, 0, 'bronze', 0, '[]', ?, ?, 'season_1')`,
      [userId, initialTickets, today, today]
    );
    return {
      userId,
      tickets: initialTickets,
      lp: 0,
      tier: 'bronze',
      tierInfo: ARENA_CONFIG.TIERS.bronze,
      winsThisWeek: 0,
      claimedWeeklyChests: [],
      seasonId: 'season_1',
    };
  }

  let tickets = Number(row.tickets || 0);
  let lp = Number(row.lp || 0);
  let winsThisWeek = Number(row.wins_this_week || 0);
  let claimedChests = [];
  try {
    claimedChests = JSON.parse(row.claimed_weekly_chests || '[]');
  } catch {
    claimedChests = [];
  }

  let needsUpdate = false;
  const updateFields = [];
  const updateValues = [];

  // 1. Cấp 3 vé miễn phí mỗi ngày (tối đa 15 vé theo D4)
  const lastRefill = row.last_ticket_refill ? getTodayDateString(new Date(row.last_ticket_refill)) : null;
  if (lastRefill !== today) {
    tickets = Math.min(ARENA_CONFIG.TICKETS.MAX_CAP, tickets + ARENA_CONFIG.TICKETS.DAILY_FREE);
    updateFields.push('tickets = ?', 'last_ticket_refill = ?');
    updateValues.push(tickets, today);
    needsUpdate = true;
  }

  // 2. Reset rương tuần nếu sang tuần mới
  const lastReset = row.last_weekly_reset ? getIsoWeekString(new Date(row.last_weekly_reset)) : null;
  if (lastReset !== currentWeek) {
    winsThisWeek = 0;
    claimedChests = [];
    updateFields.push('wins_this_week = 0', "claimed_weekly_chests = '[]'", 'last_weekly_reset = ?');
    updateValues.push(today);
    needsUpdate = true;
  }

  // Cập nhật tier chuẩn xác theo LP
  const tier = getTierFromLp(lp);
  if (tier !== row.tier) {
    updateFields.push('tier = ?');
    updateValues.push(tier);
    needsUpdate = true;
  }

  if (needsUpdate) {
    updateValues.push(userId);
    await db.execute(
      `UPDATE arena_profiles SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    );
  }

  return {
    userId,
    tickets,
    lp,
    tier,
    tierInfo: ARENA_CONFIG.TIERS[tier],
    winsThisWeek,
    claimedWeeklyChests: claimedChests,
    seasonId: row.season_id || 'season_1',
  };
}

/**
 * Thêm vé đấu khi hoàn thành bài mới (+2) hoặc 100% unit (+3).
 * Kẹp trần tối đa 15 vé theo Quyết định D4.
 */
export async function grantArenaTickets(userId, amount, db = pool) {
  const add = Math.max(0, Math.floor(Number(amount) || 0));
  if (add <= 0) return;
  await ensureArenaProfile(userId, db);
  await db.execute(
    `UPDATE arena_profiles
     SET tickets = LEAST(?, tickets + ?)
     WHERE user_id = ?`,
    [ARENA_CONFIG.TICKETS.MAX_CAP, add, userId]
  );
}

/**
 * Tạo đối thủ AI luyện tập với pet cùng cấp tiến hoá và kỹ năng cân bằng.
 */
export function generateAiBotOpponent(userSnapshot, userLp = 0) {
  const speciesList = ['mushroom', 'foxie', 'pingu', 'leafy', 'bamboo', 'sprout', 'radish', 'leo'];
  const userSpecies = userSnapshot?.speciesId || 'cowdi';
  const available = speciesList.filter(s => s !== userSpecies);
  const botSpecies = available[Math.floor(Math.random() * available.length)] || 'mushroom';
  const botEvo = Math.max(1, Math.min(4, Number(userSnapshot?.evolution) || 1));

  // Tên bot thân thiện, gợi cảm giác đấu tập
  const botNames = {
    mushroom: 'Nấm Rơm Luyện Tập',
    foxie: 'Bé Cáo AI',
    pingu: 'Chim Cánh Cụt AI',
    leafy: 'Rùa Lá Kiên Trì',
    bamboo: 'Gấu Trúc Tập Đấu',
    sprout: 'Mầm Xanh Thử Thách',
    radish: 'Củ Cải Chăm Học',
    leo: 'Sư Tử AI',
  };

  const userSkills = userSnapshot?.skills || {};
  const avgSkill = Math.round(((userSkills.listening || 10) + (userSkills.speaking || 10) + (userSkills.reading || 10) + (userSkills.writing || 10)) / 4);

  const botSnapshot = resolveSnapshot({
    speciesId: botSpecies,
    evolution: botEvo,
    skills: {
      listening: Math.max(5, avgSkill + Math.floor(Math.random() * 10 - 5)),
      speaking:  Math.max(5, avgSkill + Math.floor(Math.random() * 10 - 5)),
      reading:   Math.max(5, avgSkill + Math.floor(Math.random() * 10 - 5)),
      writing:   Math.max(5, avgSkill + Math.floor(Math.random() * 10 - 5)),
    },
    element: PET_BATTLE_DATA[botSpecies]?.element || 'earth',
    group: PET_BATTLE_DATA[botSpecies]?.group || 'herb',
    rarity: PET_BATTLE_DATA[botSpecies]?.rarity || 'common',
  });

  return {
    isBot: true,
    botId: 0,
    displayName: botNames[botSpecies] || 'Đối thủ AI',
    lp: Math.max(0, userLp + Math.floor(Math.random() * 60 - 30)),
    tier: getTierFromLp(userLp),
    petSnapshot: botSnapshot,
  };
}

/**
 * Sinh đáp án cho bot AI: ~70-80% trả lời đúng, thời gian từ 2.5s đến 5.5s.
 */
export function generateBotAnswers(count = 10, correctRate = 0.75) {
  const answers = [];
  for (let i = 0; i < count; i++) {
    const isCorrect = Math.random() < correctRate;
    const timeMs = Math.floor(2500 + Math.random() * 3000); // 2.5s - 5.5s
    answers.push({ correct: isCorrect, timeMs });
  }
  return answers;
}

/** Hàng đợi ghép cặp in-memory (TTL 20s) để ghép người chơi đang cùng tìm trận */
const arenaMatchQueue = new Map(); // userId -> { userId, displayName, lp, tier, petSnapshot, matchedWith, joinedAt }
const QUEUE_TTL_MS = 20000;

function cleanupMatchQueue(now = Date.now()) {
  for (const [uid, entry] of arenaMatchQueue.entries()) {
    if (now - entry.joinedAt > QUEUE_TTL_MS) {
      arenaMatchQueue.delete(uid);
    }
  }
}

export function leaveArenaQueue(userId) {
  arenaMatchQueue.delete(userId);
}

/**
 * Tìm Ghost Bot: lấy tên hiển thị & pet snapshot của một người chơi thật trong DB
 * (cấp tiến hoá ±1, LP ±150, < 2 trận/ngày) nhưng đánh dấu isBot = true (thưởng 50%).
 * Nếu DB chưa có người phù hợp, fallback sang generateAiBotOpponent.
 */
export async function findGhostBotOpponent(userId, userSnapshot, userLp = 0, db = pool) {
  const userEvo = Math.max(0, Number(userSnapshot?.evolution) || 0);
  const today = getTodayDateString();

  const [candidates] = await db.execute(
    `SELECT ap.user_id, ap.lp, ap.tier, u.display_name, up.pet_data
     FROM arena_profiles ap
     JOIN users u ON u.id = ap.user_id
     LEFT JOIN user_progress up ON up.user_id = ap.user_id
     WHERE ap.user_id != ?
       AND ABS(ap.lp - ?) <= 150
       AND (
         SELECT COUNT(*)
         FROM arena_matches am
         WHERE am.challenger_id = ?
           AND am.opponent_id = ap.user_id
           AND DATE(am.created_at) = ?
       ) < ?
     ORDER BY ABS(ap.lp - ?) ASC
     LIMIT 10`,
    [userId, userLp, userId, today, ARENA_CONFIG.MAX_DAILY_REWARDED_MATCHES_PER_OPPONENT, userLp]
  );

  for (const cand of candidates) {
    let petData = null;
    try {
      petData = typeof cand.pet_data === 'string' ? JSON.parse(cand.pet_data) : cand.pet_data;
    } catch {
      petData = null;
    }
    const oppPet = petData?.activePet || (petData?.collection ? Object.values(petData.collection)[0] : null);
    if (!oppPet) continue;
    const oppEvo = Math.max(0, Number(oppPet.evolution) || 0);
    if (Math.abs(userEvo - oppEvo) <= 1) {
      const snap = resolveSnapshot({
        speciesId: oppPet.speciesId || 'cowdi',
        evolution: oppEvo,
        skills: oppPet.skills || {},
        element: oppPet.element,
        group: oppPet.group,
        rarity: oppPet.rarity,
      });
      return {
        isBot: true,
        isGhostBot: true,
        opponentId: cand.user_id,
        displayName: cand.display_name || 'Người chơi Cowdi',
        lp: cand.lp || 0,
        tier: cand.tier || 'bronze',
        petSnapshot: snap,
      };
    }
  }

  return generateAiBotOpponent(userSnapshot, userLp);
}

/**
 * Tìm trận Đấu trường (hỗ trợ hàng đợi 10-15s):
 * - Ưu tiên ghép với người chơi thực đang cùng tìm trận trong hàng đợi (tiến hoá ±1, LP ±150, < 2 trận/ngày).
 * - Nếu chưa có người và allowBotFallback = false -> trả về { status: 'waiting', waitMs }.
 * - Nếu quá 10-15s (allowBotFallback = true) -> ghép với Ghost Bot mang tên & pet người chơi thật (50% thưởng).
 */
export async function findArenaMatch(userId, userSnapshot, optionsOrDb = {}, maybeDb = pool) {
  const isDbObj = optionsOrDb && typeof optionsOrDb.execute === 'function';
  const options = isDbObj ? {} : (optionsOrDb || {});
  const db = isDbObj ? optionsOrDb : maybeDb;
  const allowBotFallback = options.allowBotFallback !== undefined ? Boolean(options.allowBotFallback) : true;
  const friendId = options.friendId ? Number(options.friendId) : null;

  const profile = await ensureArenaProfile(userId, db);
  const userEvo = Math.max(0, Number(userSnapshot?.evolution) || 0);
  const today = getTodayDateString();

  // Trường hợp 1: Mời bạn đấu trực tiếp
  if (friendId && friendId !== userId) {
    const [[friendRow]] = await db.execute(
      `SELECT u.id AS user_id, u.display_name, COALESCE(ap.lp, 0) AS lp, COALESCE(ap.tier, 'bronze') AS tier, up.pet_data
       FROM users u
       LEFT JOIN arena_profiles ap ON ap.user_id = u.id
       LEFT JOIN user_progress up ON up.user_id = u.id
       WHERE u.id = ?`,
      [friendId]
    );
    if (!friendRow) {
      throw new Error('Không tìm thấy người bạn này.');
    }
    const [[dailyRow]] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM arena_matches
       WHERE challenger_id = ? AND opponent_id = ? AND has_ticket = 1 AND DATE(created_at) = ?`,
      [userId, friendId, today]
    );
    const dailyRewardedCount = Number(dailyRow?.total || 0);

    let petData = null;
    try {
      petData = typeof friendRow.pet_data === 'string' ? JSON.parse(friendRow.pet_data) : friendRow.pet_data;
    } catch {
      petData = null;
    }
    const oppPet = petData?.activePet || (petData?.collection ? Object.values(petData.collection)[0] : null) || {};
    const snap = resolveSnapshot({
      speciesId: oppPet.speciesId || 'cowdi',
      evolution: Math.max(1, Number(oppPet.evolution) || 1),
      skills: oppPet.skills || {},
      element: oppPet.element,
      group: oppPet.group,
      rarity: oppPet.rarity,
    });

    return {
      status: 'matched',
      dailyLimitReached: dailyRewardedCount >= ARENA_CONFIG.MAX_DAILY_REWARDED_MATCHES_PER_OPPONENT,
      match: {
        isBot: false,
        isFriendMatch: true,
        opponentId: friendRow.user_id,
        displayName: friendRow.display_name || 'Bạn bè Cowdi',
        lp: friendRow.lp || 0,
        tier: friendRow.tier || 'bronze',
        petSnapshot: snap,
      },
    };
  }

  // Trường hợp 2: Ghép cặp ngẫu nhiên qua hàng đợi in-memory (10-15s)
  cleanupMatchQueue();

  // Nếu người chơi này đã được ghép bởi một người khác vừa vào trước đó
  const selfEntry = arenaMatchQueue.get(userId);
  if (selfEntry?.matchedWith) {
    const matched = selfEntry.matchedWith;
    const matchedRoomId = selfEntry.matchedRoomId;
    arenaMatchQueue.delete(userId);
    if (matchedRoomId && arenaFriendRooms.has(matchedRoomId)) {
      return { status: 'matched', match: matched, room: getFriendRoomState(matchedRoomId, userId) };
    }
    return { status: 'matched', match: matched };
  }

  // Lấy thông tin hiển thị của người tìm trận
  const [[userRow]] = await db.execute('SELECT display_name FROM users WHERE id = ?', [userId]);
  const selfDisplayName = userRow?.display_name || 'Người chơi Cowdi';

  // Quét hàng đợi xem có người chơi thực nào đang chờ phù hợp không
  for (const [otherId, cand] of arenaMatchQueue.entries()) {
    if (otherId === userId || cand.matchedWith) continue;
    const oppEvo = Math.max(0, Number(cand.petSnapshot?.evolution) || 0);
    if (Math.abs(userEvo - oppEvo) > 1) continue;
    if (Math.abs(profile.lp - (cand.lp || 0)) > 150) continue;

    const [[cntRow]] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM arena_matches
       WHERE challenger_id = ? AND opponent_id = ? AND DATE(created_at) = ?`,
      [userId, otherId, today]
    );
    if (Number(cntRow?.total || 0) >= ARENA_CONFIG.MAX_DAILY_REWARDED_MATCHES_PER_OPPONENT) continue;

    // Khớp cặp thành công! Tạo luôn phòng đồng bộ 2 người (100% thưởng, ai rời trận xử thua)
    const selfSnap = resolveSnapshot(userSnapshot);
    const sharedQuiz = Array.isArray(cand.quizData) && cand.quizData.length >= 5
      ? cand.quizData
      : (Array.isArray(options.quizData) ? options.quizData : []);

    let matchedRoomId = null;
    if (sharedQuiz.length >= 5) {
      cleanupFriendRooms();
      matchedRoomId = `fr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = Date.now();
      const candFull = await loadPlayerArenaSnap(otherId, cand.petSnapshot, db);
      const selfFull = await loadPlayerArenaSnap(userId, selfSnap, db);
      arenaFriendRooms.set(matchedRoomId, {
        roomId: matchedRoomId,
        hasTicket: true,
        status: 'accepted',
        quizData: sharedQuiz,
        challenger: { ...candFull, answers: [], times: [], answeredCount: 0, submitted: false },
        opponent: { ...selfFull, answers: [], times: [], answeredCount: 0, submitted: false },
        liveBattle: {
          settledCount: 0,
          challengerHpPct: 100,
          opponentHpPct: 100,
          challengerAnswered: 0,
          opponentAnswered: 0,
        },
        result: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    cand.matchedRoomId = matchedRoomId;
    cand.matchedWith = {
      isBot: false,
      opponentId: userId,
      displayName: selfDisplayName,
      lp: profile.lp,
      tier: profile.tier,
      petSnapshot: selfSnap,
    };
    arenaMatchQueue.delete(userId);

    const matchPayload = {
      isBot: false,
      opponentId: otherId,
      displayName: cand.displayName,
      lp: cand.lp,
      tier: cand.tier,
      petSnapshot: cand.petSnapshot,
    };

    if (matchedRoomId && arenaFriendRooms.has(matchedRoomId)) {
      return {
        status: 'matched',
        match: matchPayload,
        room: getFriendRoomState(matchedRoomId, userId),
      };
    }

    return {
      status: 'matched',
      match: matchPayload,
    };
  }

  // Chưa có ai phù hợp trong hàng đợi
  if (!allowBotFallback) {
    if (!selfEntry) {
      arenaMatchQueue.set(userId, {
        userId,
        displayName: selfDisplayName,
        lp: profile.lp,
        tier: profile.tier,
        petSnapshot: resolveSnapshot(userSnapshot),
        quizData: Array.isArray(options.quizData) ? options.quizData : null,
        matchedWith: null,
        matchedRoomId: null,
        joinedAt: Date.now(),
      });
    }
    return {
      status: 'waiting',
      waitMs: ARENA_CONFIG.MATCHMAKING_WAIT_MS,
    };
  }

  // Đã hết 10-15s chờ -> rời hàng đợi và ghép với Ghost Bot mang tên & pet người chơi thật
  arenaMatchQueue.delete(userId);
  const ghostMatch = await findGhostBotOpponent(userId, userSnapshot, profile.lp, db);
  if (isDbObj) {
    // Tương thích ngược nếu caller cũ nhận trực tiếp object match
    return ghostMatch;
  }
  return {
    status: 'matched',
    match: ghostMatch,
  };
}

/**
 * Xử lý kết quả trận đấu Đấu trường v2:
 * 1. Chạy simulateBattle (v0.2 trigger system).
 * 2. Trừ 1 vé nếu đấu xếp hạng.
 * 3. Tính điểm xếp hạng LP (thắng +20, hoà +5, thua -12; AI: 50% LP; Đồng không trừ).
 * 4. Thưởng Sữa qua ledger (thắng 8, hoà 5, thua 2 Sữa).
 * 5. Cập nhật số trận thắng tuần & lưu arena_matches.
 */
export async function submitArenaMatch(params, db = pool) {
  const {
    userId,
    opponentId,
    isBot,
    hasTicket,
    quizData,
    challengerAnswers,
    challengerTimes,
    challengerPetSnap,
    opponentPetSnap,
  } = params;

  const profile = await ensureArenaProfile(userId, db);

  // Kiểm tra vé
  const useTicket = Boolean(hasTicket && profile.tickets > 0);

  // Chuẩn bị danh sách câu trả lời hai bên
  const count = Array.isArray(quizData) ? quizData.length : 10;
  const answersA = [];
  for (let i = 0; i < count; i++) {
    const isCor = Boolean(challengerAnswers?.[i]);
    const t = Number(challengerTimes?.[i]) || 3500;
    const cat = quizData?.[i]?.category || quizData?.[i]?.skill || null;
    answersA.push({ correct: isCor, timeMs: t, category: cat });
  }

  // Đáp án đối thủ (nếu là bot thì sinh ngẫu nhiên thực tế)
  const answersB = isBot ? generateBotAnswers(count, 0.72) : generateBotAnswers(count, 0.70);

  // Chạy engine mô phỏng chiến đấu với trigger kỹ năng v0.2
  const seed = `arena:${userId}:${opponentId || 'bot'}:${Date.now()}`;
  const battleResult = simulateBattle(challengerPetSnap, opponentPetSnap, answersA, answersB, seed);

  const winner = battleResult.winner; // 'challenger' | 'opponent' | 'draw'
  const chScore = answersA.filter(a => a.correct).length;
  const oppScore = answersB.filter(a => a.correct).length;

  let chLpDelta = 0;
  let oppLpDelta = 0;
  let rewardMilk = 0;

  if (useTicket) {
    const isWin = winner === 'challenger';
    const isDraw = winner === 'draw';

    // Thưởng Sữa theo tỉ lệ Máy (1) : Người (2)
    // - Người thật: 8 / 5 / 2 Sữa
    // - Máy (Ghost Bot): 4 / 2 / 1 Sữa
    const milkTable = isBot ? ARENA_CONFIG.REWARD_MILK_BOT : ARENA_CONFIG.REWARD_MILK;
    rewardMilk = isWin ? milkTable.WIN : (isDraw ? milkTable.DRAW : milkTable.LOSS);

    // Tính LP (Máy tính 50% theo D15)
    const ratio = isBot ? ARENA_CONFIG.LP.BOT_RATIO : 1.0;
    if (isWin) {
      chLpDelta = Math.round(ARENA_CONFIG.LP.WIN * ratio);
      oppLpDelta = -Math.round(ARENA_CONFIG.LP.LOSS * ratio);
    } else if (isDraw) {
      chLpDelta = Math.round(ARENA_CONFIG.LP.DRAW * ratio);
      oppLpDelta = Math.round(ARENA_CONFIG.LP.DRAW * ratio);
    } else {
      chLpDelta = Math.round(ARENA_CONFIG.LP.LOSS * ratio);
      oppLpDelta = Math.round(ARENA_CONFIG.LP.WIN * ratio);
    }

    // Bậc Đồng không bị trừ điểm LP (D15)
    if (profile.tier === 'bronze' && chLpDelta < 0) {
      chLpDelta = 0;
    }
  }

  // Thực hiện ghi nhận DB trong Transaction
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let newLp = Math.max(0, profile.lp + chLpDelta);
    let newTier = getTierFromLp(newLp);
    let newTickets = useTicket ? Math.max(0, profile.tickets - 1) : profile.tickets;
    let newWinsThisWeek = (winner === 'challenger' && useTicket) ? profile.winsThisWeek + 1 : profile.winsThisWeek;

    // 1. Cập nhật arena_profiles
    await conn.execute(
      `UPDATE arena_profiles
       SET tickets = ?, lp = ?, tier = ?, wins_this_week = ?
       WHERE user_id = ?`,
      [newTickets, newLp, newTier, newWinsThisWeek, userId]
    );

    // 2. Ghi nhận Sữa vào wallet_ledger & user_progress.total_xp (nếu có thưởng)
    if (rewardMilk > 0) {
      await conn.execute(
        `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'milk', ?, 'arena_match', ?)`,
        [userId, rewardMilk, seed]
      );
      await conn.execute(
        'UPDATE user_progress SET total_xp = COALESCE(total_xp, 0) + ? WHERE user_id = ?',
        [rewardMilk, userId]
      );
    }

    // 3. Ghi nhận lịch sử trận đấu vào arena_matches
    const [matchInsert] = await conn.execute(
      `INSERT INTO arena_matches
         (challenger_id, opponent_id, is_bot, has_ticket, winner, challenger_score, opponent_score,
          challenger_lp_delta, opponent_lp_delta, reward_milk, season_id, battle_log)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        opponentId || null,
        isBot ? 1 : 0,
        useTicket ? 1 : 0,
        winner,
        chScore,
        oppScore,
        chLpDelta,
        oppLpDelta,
        rewardMilk,
        profile.seasonId || 'season_1',
        JSON.stringify(battleResult.log),
      ]
    );

    await conn.commit();

    return {
      matchId: matchInsert.insertId,
      winner,
      challengerScore: chScore,
      opponentScore: oppScore,
      challengerLpDelta: chLpDelta,
      rewardMilk,
      hasTicket: useTicket,
      battleResult,
      updatedProfile: {
        userId,
        tickets: newTickets,
        lp: newLp,
        tier: newTier,
        tierInfo: ARENA_CONFIG.TIERS[newTier],
        winsThisWeek: newWinsThisWeek,
        claimedWeeklyChests: profile.claimedWeeklyChests,
        seasonId: profile.seasonId,
      },
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Nhận thưởng rương tuần Đấu trường (D4 & D15):
 * Đồng (5 trận thắng): 30 Sữa.
 * Bạc (15 trận thắng): 60 Sữa + 1 Gem.
 * Vàng (30 trận thắng): 100 Sữa + 2 Gem + 2 Mảnh đá (stone_shard).
 */
export async function claimWeeklyChest(userId, chestId, db = pool) {
  const profile = await ensureArenaProfile(userId, db);
  const chestConfig = ARENA_CONFIG.WEEKLY_CHESTS[chestId];
  if (!chestConfig) {
    throw new Error('Rương tuần không hợp lệ.');
  }

  if (profile.winsThisWeek < chestConfig.winsRequired) {
    throw new Error(`Cần thắng ít nhất ${chestConfig.winsRequired} trận tuần này để mở ${chestConfig.labelVi}.`);
  }

  if (profile.claimedWeeklyChests.includes(chestId)) {
    throw new Error('Bạn đã nhận rương này trong tuần rồi.');
  }

  const currentWeek = getIsoWeekString();
  const refId = `${currentWeek}:${chestId}`;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Thưởng Sữa qua ledger
    if (chestConfig.rewardMilk > 0) {
      await conn.execute(
        `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'milk', ?, 'arena_weekly_chest', ?)`,
        [userId, chestConfig.rewardMilk, refId]
      );
      await conn.execute(
        'UPDATE user_progress SET total_xp = COALESCE(total_xp, 0) + ? WHERE user_id = ?',
        [chestConfig.rewardMilk, userId]
      );
    }

    // 2. Thưởng Gem qua ledger
    if (chestConfig.rewardGem > 0) {
      await conn.execute(
        `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'gem', ?, 'arena_weekly_chest', ?)`,
        [userId, chestConfig.rewardGem, refId]
      );
    }

    // 3. Thưởng Mảnh đá qua ledger
    if (chestConfig.rewardStoneShards > 0) {
      await conn.execute(
        `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'stone_shard', ?, 'arena_weekly_chest', ?)`,
        [userId, chestConfig.rewardStoneShards, refId]
      );
    }

    // 4. Cập nhật danh sách rương đã nhận trong tuần
    const updatedChests = [...profile.claimedWeeklyChests, chestId];
    await conn.execute(
      'UPDATE arena_profiles SET claimed_weekly_chests = ? WHERE user_id = ?',
      [JSON.stringify(updatedChests), userId]
    );

    await conn.commit();

    return {
      success: true,
      chestId,
      rewards: {
        milk: chestConfig.rewardMilk,
        gem: chestConfig.rewardGem,
        stoneShards: chestConfig.rewardStoneShards,
      },
      claimedWeeklyChests: updatedChests,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Tặng cỏ ba lá 🍀 sau trận (D4):
 * Người tặng không tốn gì (tối đa 5 lần/ngày).
 * Người nhận được +5 Sữa qua ledger (tối đa 50 Sữa/ngày từ cỏ ba lá).
 */
export async function sendArenaClover(senderId, receiverId, db = pool) {
  if (senderId === receiverId) {
    throw new Error('Không thể tự tặng cỏ ba lá cho mình.');
  }

  const today = getTodayDateString();

  // Kiểm tra người gửi đã gửi đủ 5 lần hôm nay chưa
  const [[sendCountRow]] = await db.execute(
    'SELECT COUNT(*) AS total FROM arena_clovers WHERE sender_id = ? AND sent_date = ?',
    [senderId, today]
  );
  if (Number(sendCountRow?.total || 0) >= ARENA_CONFIG.CLOVER.MAX_DAILY_GIVE) {
    throw new Error('Bạn đã tặng tối đa 5 cỏ ba lá trong ngày hôm nay.');
  }

  // Kiểm tra đã tặng người này hôm nay chưa
  const [[alreadySentRow]] = await db.execute(
    'SELECT id FROM arena_clovers WHERE sender_id = ? AND receiver_id = ? AND sent_date = ?',
    [senderId, receiverId, today]
  );
  if (alreadySentRow) {
    throw new Error('Hôm nay bạn đã tặng cỏ ba lá cho người chơi này rồi.');
  }

  // Kiểm tra người nhận đã nhận đủ 50 Sữa từ cỏ ba lá hôm nay chưa
  const [[receiveCountRow]] = await db.execute(
    'SELECT COUNT(*) AS total FROM arena_clovers WHERE receiver_id = ? AND sent_date = ?',
    [receiverId, today]
  );
  const currentReceivedMilk = Number(receiveCountRow?.total || 0) * ARENA_CONFIG.CLOVER.MILK_PER_CLOVER;
  const canGrantMilk = currentReceivedMilk < ARENA_CONFIG.CLOVER.MAX_DAILY_RECEIVE_MILK;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      'INSERT INTO arena_clovers (sender_id, receiver_id, sent_date) VALUES (?, ?, ?)',
      [senderId, receiverId, today]
    );

    if (canGrantMilk) {
      const cloverRef = `clover:${senderId}:${receiverId}:${today}`;
      await conn.execute(
        `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'milk', ?, 'arena_clover', ?)`,
        [receiverId, ARENA_CONFIG.CLOVER.MILK_PER_CLOVER, cloverRef]
      );
      await conn.execute(
        'UPDATE user_progress SET total_xp = COALESCE(total_xp, 0) + ? WHERE user_id = ?',
        [ARENA_CONFIG.CLOVER.MILK_PER_CLOVER, receiverId]
      );
    }

    await conn.commit();
    return { success: true, grantedMilk: canGrantMilk ? ARENA_CONFIG.CLOVER.MILK_PER_CLOVER : 0 };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Bảng xếp hạng Đấu trường v2 theo LP.
 */
export async function getArenaLeaderboard(limit = 50, db = pool) {
  const [rows] = await db.execute(
    `SELECT ap.user_id, ap.lp, ap.tier, ap.wins_this_week, u.display_name, up.pet_data
     FROM arena_profiles ap
     JOIN users u ON u.id = ap.user_id
     LEFT JOIN user_progress up ON up.user_id = ap.user_id
     ORDER BY ap.lp DESC, ap.wins_this_week DESC
     LIMIT ?`,
    [Math.min(100, Math.max(10, limit))]
  );

  return rows.map((r, index) => {
    let pet = null;
    try {
      const pd = typeof r.pet_data === 'string' ? JSON.parse(r.pet_data) : r.pet_data;
      pet = pd?.activePet || (pd?.collection ? Object.values(pd.collection)[0] : null);
    } catch {
      pet = null;
    }
    return {
      rank: index + 1,
      userId: r.user_id,
      displayName: r.display_name || 'Người chơi',
      lp: r.lp || 0,
      tier: r.tier || 'bronze',
      tierInfo: ARENA_CONFIG.TIERS[r.tier] || ARENA_CONFIG.TIERS.bronze,
      winsThisWeek: r.wins_this_week || 0,
      pet,
    };
  });
}

// ============================================================
// Phòng mời bạn đồng bộ 2 người (Live Friend Arena Room)
// ============================================================

const arenaFriendRooms = new Map(); // roomId -> room state
const FRIEND_ROOM_TTL_MS = 10 * 60 * 1000; // 10 phút

function cleanupFriendRooms(now = Date.now()) {
  for (const [id, r] of arenaFriendRooms.entries()) {
    if (now - r.updatedAt > FRIEND_ROOM_TTL_MS) {
      arenaFriendRooms.delete(id);
    }
  }
}

async function loadPlayerArenaSnap(userId, fallbackSnap = null, db = pool) {
  const profile = await ensureArenaProfile(userId, db);
  const [[row]] = await db.execute(
    `SELECT u.display_name, up.pet_data
     FROM users u
     LEFT JOIN user_progress up ON up.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );
  if (!row) throw new Error('Không tìm thấy người chơi.');

  let snap = fallbackSnap;
  if (!snap) {
    let petData = null;
    try {
      petData = typeof row.pet_data === 'string' ? JSON.parse(row.pet_data) : row.pet_data;
    } catch {
      petData = null;
    }
    const active = petData?.activePet || (petData?.collection ? Object.values(petData.collection)[0] : null) || {};
    const evo = active.evolution !== undefined && active.evolution !== null ? Math.max(0, Number(active.evolution) || 0) : 0;
    snap = {
      speciesId: active.speciesId || 'cowdi',
      evolution: evo,
      skills: active.skills || {},
      element: active.element,
      group: active.group,
      rarity: active.rarity,
    };
  }

  return {
    userId,
    displayName: row.display_name || 'Người chơi Cowdi',
    lp: profile.lp,
    tier: profile.tier,
    tickets: profile.tickets,
    winsThisWeek: profile.winsThisWeek,
    claimedWeeklyChests: profile.claimedWeeklyChests,
    seasonId: profile.seasonId,
    petSnapshot: resolveSnapshot(snap),
  };
}

/**
 * Tạo phòng mời bạn đấu trực tiếp (2 người cùng vào phòng khi người kia đồng ý).
 */
export async function createFriendRoom({ userId, friendId, hasTicket, quizData, petSnapshot }, db = pool) {
  cleanupFriendRooms();
  const oppId = Number(friendId);
  if (!oppId || oppId === userId) {
    throw new Error('Người bạn được mời không hợp lệ.');
  }
  if (!Array.isArray(quizData) || quizData.length < 5) {
    throw new Error('Bộ câu hỏi trận đấu không hợp lệ.');
  }

  const challenger = await loadPlayerArenaSnap(userId, petSnapshot, db);
  const opponent = await loadPlayerArenaSnap(oppId, null, db);

  const useTicket = Boolean(hasTicket);
  if (useTicket) {
    if (challenger.tickets <= 0) {
      throw new Error('Bạn không đủ vé đấu để tạo trận có thưởng.');
    }
    const today = getTodayDateString();
    const [[dailyRow]] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM arena_matches
       WHERE challenger_id = ? AND opponent_id = ? AND has_ticket = 1 AND DATE(created_at) = ?`,
      [userId, oppId, today]
    );
    if (Number(dailyRow?.total || 0) >= ARENA_CONFIG.MAX_DAILY_REWARDED_MATCHES_PER_OPPONENT) {
      throw new Error('Bạn đã đấu đủ 2 trận có thưởng với người bạn này hôm nay.');
    }
  }

  const roomId = `fr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();
  const room = {
    roomId,
    hasTicket: useTicket,
    status: 'pending', // 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'
    quizData,
    challenger: { ...challenger, answers: [], times: [], answeredCount: 0, submitted: false },
    opponent: { ...opponent, answers: [], times: [], answeredCount: 0, submitted: false },
    liveBattle: {
      settledCount: 0,
      challengerHpPct: 100,
      opponentHpPct: 100,
      challengerAnswered: 0,
      opponentAnswered: 0,
    },
    result: null,
    createdAt: now,
    updatedAt: now,
  };
  arenaFriendRooms.set(roomId, room);
  return getFriendRoomState(roomId, userId);
}

/**
 * Lấy danh sách lời mời thách đấu đang chờ gửi tới userId.
 */
export function getIncomingFriendRooms(userId) {
  cleanupFriendRooms();
  const uid = Number(userId);
  const list = [];
  for (const room of arenaFriendRooms.values()) {
    if (Number(room.opponent.userId) === uid && room.status === 'pending') {
      list.push({
        roomId: room.roomId,
        hasTicket: room.hasTicket,
        challenger: {
          userId: room.challenger.userId,
          displayName: room.challenger.displayName,
          lp: room.challenger.lp,
          tier: room.challenger.tier,
          petSnapshot: room.challenger.petSnapshot,
        },
        createdAt: room.createdAt,
      });
    }
  }
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Xem trạng thái phòng mời bạn theo góc nhìn của userId.
 */
export function getFriendRoomState(roomId, userId) {
  cleanupFriendRooms();
  const room = arenaFriendRooms.get(roomId);
  if (!room) throw new Error('Phòng đấu không tồn tại hoặc đã hết hạn.');

  const uid = Number(userId);
  const isChallenger = Number(room.challenger.userId) === uid;
  const isOpponent = Number(room.opponent.userId) === uid;
  if (!isChallenger && !isOpponent) {
    throw new Error('Bạn không thuộc phòng đấu này.');
  }

  return {
    roomId: room.roomId,
    status: room.status,
    hasTicket: room.hasTicket,
    mySide: isChallenger ? 'challenger' : 'opponent',
    quizData: room.quizData,
    challenger: {
      userId: room.challenger.userId,
      displayName: room.challenger.displayName,
      lp: room.challenger.lp,
      tier: room.challenger.tier,
      petSnapshot: room.challenger.petSnapshot,
      answeredCount: room.challenger.answeredCount || 0,
      submitted: room.challenger.submitted,
    },
    opponent: {
      userId: room.opponent.userId,
      displayName: room.opponent.displayName,
      lp: room.opponent.lp,
      tier: room.opponent.tier,
      petSnapshot: room.opponent.petSnapshot,
      answeredCount: room.opponent.answeredCount || 0,
      submitted: room.opponent.submitted,
    },
    liveBattle: room.liveBattle || null,
    result: room.result,
  };
}

/**
 * Lưu đáp án từng câu và tính ngay % HP real-time khi cả 2 bên đã qua cùng câu đó.
 */
export function submitFriendRoomStep(roomId, userId, { questionIndex, correct, timeMs }) {
  const room = arenaFriendRooms.get(roomId);
  if (!room) throw new Error('Phòng đấu không tồn tại hoặc đã hết hạn.');
  if (room.status !== 'accepted' && room.status !== 'completed') {
    throw new Error('Phòng đấu chưa sẵn sàng.');
  }

  const uid = Number(userId);
  const isChallenger = Number(room.challenger.userId) === uid;
  const isOpponent = Number(room.opponent.userId) === uid;
  if (!isChallenger && !isOpponent) {
    throw new Error('Bạn không thuộc phòng đấu này.');
  }

  const target = isChallenger ? room.challenger : room.opponent;
  const idx = Math.max(0, Math.min(room.quizData.length - 1, Number(questionIndex) || 0));
  if (!Array.isArray(target.answers)) target.answers = [];
  if (!Array.isArray(target.times)) target.times = [];

  target.answers[idx] = Boolean(correct);
  target.times[idx] = Number(timeMs) || 3500;
  target.answeredCount = Math.max(target.answeredCount || 0, idx + 1);
  room.updatedAt = Date.now();

  // Tính số câu mà CẢ HAI bên đều đã trả lời xong
  let settledCount = 0;
  for (let i = 0; i < room.quizData.length; i++) {
    if (room.challenger.answers?.[i] !== undefined && room.opponent.answers?.[i] !== undefined) {
      settledCount = i + 1;
    } else {
      break;
    }
  }

  if (settledCount > 0) {
    const buildSlice = (sideObj) => {
      const out = [];
      for (let i = 0; i < settledCount; i++) {
        out.push({
          correct: Boolean(sideObj.answers[i]),
          timeMs: Number(sideObj.times[i]) || 3500,
          category: room.quizData?.[i]?.category || room.quizData?.[i]?.skill || null,
        });
      }
      return out;
    };

    const br = simulateBattle(
      room.challenger.petSnapshot,
      room.opponent.petSnapshot,
      buildSlice(room.challenger),
      buildSlice(room.opponent),
      room.roomId
    );
    room.liveBattle = {
      settledCount,
      challengerHpPct: Math.round((br.challenger?.hpPct ?? 1) * 100),
      opponentHpPct: Math.round((br.opponent?.hpPct ?? 1) * 100),
      challengerAnswered: room.challenger.answeredCount || 0,
      opponentAnswered: room.opponent.answeredCount || 0,
      lastRound: {
        q: settledCount,
        challengerCorrect: Boolean(room.challenger.answers[settledCount - 1]),
        opponentCorrect: Boolean(room.opponent.answers[settledCount - 1]),
      },
    };
  } else {
    room.liveBattle = {
      settledCount: 0,
      challengerHpPct: 100,
      opponentHpPct: 100,
      challengerAnswered: room.challenger.answeredCount || 0,
      opponentAnswered: room.opponent.answeredCount || 0,
    };
  }

  return getFriendRoomState(roomId, userId);
}

/**
 * Bên được mời phản hồi Chấp nhận / Từ chối vào phòng.
 */
export async function respondFriendRoom(roomId, userId, { accept, petSnapshot }, db = pool) {
  const room = arenaFriendRooms.get(roomId);
  if (!room) throw new Error('Phòng đấu không tồn tại hoặc đã hết hạn.');
  if (Number(room.opponent.userId) !== Number(userId)) {
    throw new Error('Chỉ người được mời mới có thể phản hồi.');
  }
  if (room.status !== 'pending') {
    throw new Error('Lời mời này đã được xử lý hoặc đã huỷ.');
  }

  if (!accept) {
    room.status = 'declined';
    room.updatedAt = Date.now();
    return getFriendRoomState(roomId, userId);
  }

  const oppSnap = await loadPlayerArenaSnap(userId, petSnapshot, db);
  if (room.hasTicket && oppSnap.tickets <= 0) {
    throw new Error('Bạn không đủ vé để tham gia trận đấu 1 vé.');
  }
  room.opponent = { ...oppSnap, answers: [], times: [], answeredCount: 0, submitted: false };
  room.status = 'accepted';
  room.updatedAt = Date.now();
  return getFriendRoomState(roomId, userId);
}

/**
 * Bên mời huỷ lời mời khi đối thủ chưa vào phòng.
 */
export function cancelFriendRoom(roomId, userId) {
  const room = arenaFriendRooms.get(roomId);
  if (!room) return { ok: true };
  if (room.challenger.userId !== userId) {
    throw new Error('Chỉ chủ phòng mới có thể huỷ.');
  }
  if (room.status === 'pending') {
    room.status = 'cancelled';
    room.updatedAt = Date.now();
  }
  return { ok: true };
}

/**
 * Xử thua ngay lập tức khi một người rời khỏi trận đấu bạn bè giữa chừng.
 */
export async function forfeitFriendRoom(roomId, userId, db = pool) {
  const room = arenaFriendRooms.get(roomId);
  if (!room) return { ok: true };
  if (room.status === 'completed' && room.result) {
    return getFriendRoomState(roomId, userId);
  }
  if (room.status !== 'accepted') {
    return cancelFriendRoom(roomId, userId);
  }

  const uid = Number(userId);
  const isChallenger = Number(room.challenger.userId) === uid;
  const isOpponent = Number(room.opponent.userId) === uid;
  if (!isChallenger && !isOpponent) {
    throw new Error('Bạn không thuộc phòng đấu này.');
  }

  const winner = isChallenger ? 'opponent' : 'challenger';
  const chScore = (room.challenger.answers || []).filter(Boolean).length;
  const oppScore = (room.opponent.answers || []).filter(Boolean).length;

  let chLpDelta = 0;
  let oppLpDelta = 0;
  let chMilk = 0;
  let oppMilk = 0;

  if (room.hasTicket) {
    if (winner === 'challenger') {
      chMilk = ARENA_CONFIG.REWARD_MILK.WIN;
      oppMilk = ARENA_CONFIG.REWARD_MILK.LOSS;
      chLpDelta = ARENA_CONFIG.LP.WIN;
      oppLpDelta = ARENA_CONFIG.LP.LOSS;
    } else {
      chMilk = ARENA_CONFIG.REWARD_MILK.LOSS;
      oppMilk = ARENA_CONFIG.REWARD_MILK.WIN;
      chLpDelta = ARENA_CONFIG.LP.LOSS;
      oppLpDelta = ARENA_CONFIG.LP.WIN;
    }
    if (room.challenger.tier === 'bronze' && chLpDelta < 0) chLpDelta = 0;
    if (room.opponent.tier === 'bronze' && oppLpDelta < 0) oppLpDelta = 0;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const applyForfeitUpdate = async (player, lpDelta, milk, isWinner) => {
      const p = await ensureArenaProfile(player.userId, conn);
      const newLp = Math.max(0, p.lp + lpDelta);
      const newTier = getTierFromLp(newLp);
      const newTickets = room.hasTicket ? Math.max(0, p.tickets - 1) : p.tickets;
      const newWins = (isWinner && room.hasTicket) ? p.winsThisWeek + 1 : p.winsThisWeek;

      await conn.execute(
        `UPDATE arena_profiles
         SET tickets = ?, lp = ?, tier = ?, wins_this_week = ?
         WHERE user_id = ?`,
        [newTickets, newLp, newTier, newWins, player.userId]
      );
      if (milk > 0) {
        await conn.execute(
          `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
           VALUES (?, 'milk', ?, 'arena_match', ?)`,
          [player.userId, milk, `${room.roomId}:${player.userId}`]
        );
        await conn.execute(
          'UPDATE user_progress SET total_xp = COALESCE(total_xp, 0) + ? WHERE user_id = ?',
          [milk, player.userId]
        );
      }
      return {
        userId: player.userId,
        tickets: newTickets,
        lp: newLp,
        tier: newTier,
        tierInfo: ARENA_CONFIG.TIERS[newTier],
        winsThisWeek: newWins,
        claimedWeeklyChests: p.claimedWeeklyChests,
        seasonId: p.seasonId,
      };
    };

    const chProfile = await applyForfeitUpdate(room.challenger, chLpDelta, chMilk, winner === 'challenger');
    const oppProfile = await applyForfeitUpdate(room.opponent, oppLpDelta, oppMilk, winner === 'opponent');

    const [matchInsert] = await conn.execute(
      `INSERT INTO arena_matches
         (challenger_id, opponent_id, is_bot, has_ticket, winner, challenger_score, opponent_score,
          challenger_lp_delta, opponent_lp_delta, reward_milk, season_id, battle_log)
       VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        room.challenger.userId,
        room.opponent.userId,
        room.hasTicket ? 1 : 0,
        winner,
        chScore,
        oppScore,
        chLpDelta,
        oppLpDelta,
        chMilk,
        chProfile.seasonId || 'season_1',
        JSON.stringify([{ type: 'forfeit', forfeitedBy: uid }]),
      ]
    );

    await conn.commit();

    room.status = 'completed';
    room.updatedAt = Date.now();
    room.result = {
      matchId: matchInsert.insertId,
      winner,
      forfeitedBy: uid,
      challengerScore: chScore,
      opponentScore: oppScore,
      challengerLpDelta: chLpDelta,
      opponentLpDelta: oppLpDelta,
      challengerRewardMilk: chMilk,
      opponentRewardMilk: oppMilk,
      hasTicket: room.hasTicket,
      battleResult: { challenger: { hpPct: isChallenger ? 0 : 1 }, opponent: { hpPct: isOpponent ? 0 : 1 }, log: [] },
      challengerProfile: chProfile,
      opponentProfile: oppProfile,
    };

    return getFriendRoomState(roomId, userId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Nộp đáp án trong phòng mời bạn. Khi cả 2 bên đã nộp, server chạy simulateBattle bằng đáp án thật của cả hai.
 */
export async function submitFriendRoomAnswers(roomId, userId, { answers, times }, db = pool) {
  const room = arenaFriendRooms.get(roomId);
  if (!room) throw new Error('Phòng đấu không tồn tại hoặc đã hết hạn.');
  if (room.status === 'completed' && room.result) {
    return { waitingOpponent: false, ...getFriendRoomState(roomId, userId) };
  }
  if (room.status !== 'accepted') {
    throw new Error('Phòng đấu chưa sẵn sàng để nộp bài.');
  }

  const isChallenger = room.challenger.userId === userId;
  const isOpponent = room.opponent.userId === userId;
  if (!isChallenger && !isOpponent) {
    throw new Error('Bạn không thuộc phòng đấu này.');
  }

  const target = isChallenger ? room.challenger : room.opponent;
  target.answers = Array.isArray(answers) ? answers : [];
  target.times = Array.isArray(times) ? times : [];
  target.submitted = true;
  room.updatedAt = Date.now();

  if (!room.challenger.submitted || !room.opponent.submitted) {
    return {
      waitingOpponent: true,
      ...getFriendRoomState(roomId, userId),
    };
  }

  // Cả 2 bên đã hoàn thành -> chạy simulateBattle bằng đáp án thật của cả hai!
  const count = room.quizData.length;
  const buildAnswers = (sideObj) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push({
        correct: Boolean(sideObj.answers?.[i]),
        timeMs: Number(sideObj.times?.[i]) || 3500,
        category: room.quizData?.[i]?.category || room.quizData?.[i]?.skill || null,
      });
    }
    return out;
  };

  const answersA = buildAnswers(room.challenger);
  const answersB = buildAnswers(room.opponent);
  const battleResult = simulateBattle(
    room.challenger.petSnapshot,
    room.opponent.petSnapshot,
    answersA,
    answersB,
    room.roomId
  );

  const winner = battleResult.winner; // 'challenger' | 'opponent' | 'draw'
  const chScore = answersA.filter((a) => a.correct).length;
  const oppScore = answersB.filter((a) => a.correct).length;

  let chLpDelta = 0;
  let oppLpDelta = 0;
  let chMilk = 0;
  let oppMilk = 0;

  if (room.hasTicket) {
    if (winner === 'challenger') {
      chMilk = ARENA_CONFIG.REWARD_MILK.WIN;
      oppMilk = ARENA_CONFIG.REWARD_MILK.LOSS;
      chLpDelta = ARENA_CONFIG.LP.WIN;
      oppLpDelta = ARENA_CONFIG.LP.LOSS;
    } else if (winner === 'opponent') {
      chMilk = ARENA_CONFIG.REWARD_MILK.LOSS;
      oppMilk = ARENA_CONFIG.REWARD_MILK.WIN;
      chLpDelta = ARENA_CONFIG.LP.LOSS;
      oppLpDelta = ARENA_CONFIG.LP.WIN;
    } else {
      chMilk = ARENA_CONFIG.REWARD_MILK.DRAW;
      oppMilk = ARENA_CONFIG.REWARD_MILK.DRAW;
      chLpDelta = ARENA_CONFIG.LP.DRAW;
      oppLpDelta = ARENA_CONFIG.LP.DRAW;
    }
    if (room.challenger.tier === 'bronze' && chLpDelta < 0) chLpDelta = 0;
    if (room.opponent.tier === 'bronze' && oppLpDelta < 0) oppLpDelta = 0;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const applyPlayerUpdate = async (player, lpDelta, milk, isWinner) => {
      const p = await ensureArenaProfile(player.userId, conn);
      const newLp = Math.max(0, p.lp + lpDelta);
      const newTier = getTierFromLp(newLp);
      const newTickets = room.hasTicket ? Math.max(0, p.tickets - 1) : p.tickets;
      const newWins = (isWinner && room.hasTicket) ? p.winsThisWeek + 1 : p.winsThisWeek;

      await conn.execute(
        `UPDATE arena_profiles
         SET tickets = ?, lp = ?, tier = ?, wins_this_week = ?
         WHERE user_id = ?`,
        [newTickets, newLp, newTier, newWins, player.userId]
      );

      if (milk > 0) {
        await conn.execute(
          `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
           VALUES (?, 'milk', ?, 'arena_match', ?)`,
          [player.userId, milk, `${room.roomId}:${player.userId}`]
        );
        await conn.execute(
          'UPDATE user_progress SET total_xp = COALESCE(total_xp, 0) + ? WHERE user_id = ?',
          [milk, player.userId]
        );
      }

      return {
        userId: player.userId,
        tickets: newTickets,
        lp: newLp,
        tier: newTier,
        tierInfo: ARENA_CONFIG.TIERS[newTier],
        winsThisWeek: newWins,
        claimedWeeklyChests: p.claimedWeeklyChests,
        seasonId: p.seasonId,
      };
    };

    const chProfile = await applyPlayerUpdate(room.challenger, chLpDelta, chMilk, winner === 'challenger');
    const oppProfile = await applyPlayerUpdate(room.opponent, oppLpDelta, oppMilk, winner === 'opponent');

    const [matchInsert] = await conn.execute(
      `INSERT INTO arena_matches
         (challenger_id, opponent_id, is_bot, has_ticket, winner, challenger_score, opponent_score,
          challenger_lp_delta, opponent_lp_delta, reward_milk, season_id, battle_log)
       VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        room.challenger.userId,
        room.opponent.userId,
        room.hasTicket ? 1 : 0,
        winner,
        chScore,
        oppScore,
        chLpDelta,
        oppLpDelta,
        chMilk,
        chProfile.seasonId || 'season_1',
        JSON.stringify(battleResult.log),
      ]
    );

    await conn.commit();

    room.status = 'completed';
    room.updatedAt = Date.now();
    room.result = {
      matchId: matchInsert.insertId,
      winner,
      challengerScore: chScore,
      opponentScore: oppScore,
      challengerLpDelta: chLpDelta,
      opponentLpDelta: oppLpDelta,
      challengerRewardMilk: chMilk,
      opponentRewardMilk: oppMilk,
      hasTicket: room.hasTicket,
      battleResult,
      challengerProfile: chProfile,
      opponentProfile: oppProfile,
    };

    return {
      waitingOpponent: false,
      ...getFriendRoomState(roomId, userId),
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
