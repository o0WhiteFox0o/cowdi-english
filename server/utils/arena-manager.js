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

/**
 * Đảm bảo người dùng có hồ sơ Đấu trường.
 * Tự động cấp 3 vé miễn phí/ngày (max 15) và reset rương tuần vào thứ Hai.
 */
export async function ensureArenaProfile(userId, db = pool) {
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

/**
 * Tìm trận Đấu trường:
 * Ghép người chơi cùng cấp tiến hoá (±1) và LP gần nhau (±150 LP).
 * Giới hạn 2 trận/ngày với cùng đối thủ (D15).
 * Nếu không có ai phù hợp, tự động ghép với đối thủ AI luyện tập.
 */
export async function findArenaMatch(userId, userSnapshot, db = pool) {
  const profile = await ensureArenaProfile(userId, db);
  const userEvo = Math.max(0, Number(userSnapshot?.evolution) || 1);
  const today = getTodayDateString();

  // Tìm người chơi thực thoả mãn:
  // 1. Khác userId
  // 2. Có ít hơn 2 trận đấu với userId hôm nay
  // 3. LP chênh lệch trong khoảng ±150 LP
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
    [userId, profile.lp, userId, today, ARENA_CONFIG.MAX_DAILY_REWARDED_MATCHES_PER_OPPONENT, profile.lp]
  );

  // Lọc candidate có pet cấp ±1
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
        isBot: false,
        opponentId: cand.user_id,
        displayName: cand.display_name || 'Người chơi Cowdi',
        lp: cand.lp || 0,
        tier: cand.tier || 'bronze',
        petSnapshot: snap,
      };
    }
  }

  // Không có người chơi phù hợp -> Ghép với đối thủ AI luyện tập
  return generateAiBotOpponent(userSnapshot, profile.lp);
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
    const isLoss = winner === 'opponent';

    // Thưởng Sữa theo D4 (thắng 8, hoà 5, thua 2 Sữa)
    rewardMilk = isWin ? ARENA_CONFIG.REWARD_MILK.WIN : (isDraw ? ARENA_CONFIG.REWARD_MILK.DRAW : ARENA_CONFIG.REWARD_MILK.LOSS);

    // Tính LP (AI tính 50% theo D15)
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
