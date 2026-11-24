// ============================================================
// Cowdi English — Server Streak & Keep Rhythm Manager (Giai đoạn 3)
// Quản lý Streak server-side theo múi giờ, Khăn giữ lửa, Vé quay lại,
// Khế ước 7 ngày và Đồng hồ Cowdi.
// ============================================================

import pool from '../config/database.js';
import { KEEP_RHYTHM_ITEMS } from '../../shared/game-config.js';
import { getWallet, getIsoWeekString } from './wallet.js';

/**
 * Trả về ngày hiện tại theo định dạng YYYY-MM-DD theo timezone IANA.
 */
export function getTodayInTz(tz = 'Asia/Ho_Chi_Minh') {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return fmt.format(new Date()); // en-CA gives YYYY-MM-DD
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Trả về ngày hôm qua (YYYY-MM-DD) theo timezone.
 */
export function getYesterdayInTz(tz = 'Asia/Ho_Chi_Minh') {
  const today = getTodayInTz(tz);
  const d = new Date(today + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Lấy giờ & phút hiện tại theo timezone.
 */
export function getNowInTz(tz = 'Asia/Ho_Chi_Minh') {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    return { hour: hour === 24 ? 0 : hour, minute };
  } catch {
    const d = new Date();
    return { hour: d.getUTCHours(), minute: d.getUTCMinutes() };
  }
}

/**
 * Tính số ngày chênh lệch giữa 2 chuỗi YYYY-MM-DD: date2 - date1.
 */
export function getDiffDays(date1Str, date2Str) {
  if (!date1Str || !date2Str) return 9999;
  const d1 = new Date(date1Str + 'T12:00:00Z');
  const d2 = new Date(date2Str + 'T12:00:00Z');
  return Math.round((d2 - d1) / (24 * 60 * 60 * 1000));
}

/**
 * Đảm bảo user có dòng trong user_streak_state và lấy dữ liệu mới nhất.
 */
export async function getUserStreakState(userId, tz = 'Asia/Ho_Chi_Minh', db = pool) {
  let [[row]] = await db.execute(
    'SELECT * FROM user_streak_state WHERE user_id = ?',
    [userId]
  );

  if (!row) {
    const today = getTodayInTz(tz);
    await db.execute(
      `INSERT INTO user_streak_state (user_id, timezone, current_streak, best_streak)
       VALUES (?, ?, 0, 0)
       ON DUPLICATE KEY UPDATE timezone = VALUES(timezone)`,
      [userId, tz]
    );
    [[row]] = await db.execute(
      'SELECT * FROM user_streak_state WHERE user_id = ?',
      [userId]
    );
  }

  // Lấy khế ước đang kích hoạt (nếu có)
  const [[contractRow]] = await db.execute(
    `SELECT * FROM user_contracts
     WHERE user_id = ? AND status = 'active'
     ORDER BY id DESC LIMIT 1`,
    [userId]
  );

  const todayStr = getTodayInTz(tz);
  const lastActiveStr = row.last_active_date
    ? (row.last_active_date instanceof Date
        ? row.last_active_date.toISOString().slice(0, 10)
        : String(row.last_active_date).slice(0, 10))
    : null;

  const daysSinceActive = lastActiveStr ? getDiffDays(lastActiveStr, todayStr) : 9999;
  const currentWeek = getIsoWeekString();

  // Reset giới hạn mua khăn tuần nếu sang tuần mới
  const freezesBoughtThisWeek = (row.last_freeze_week === currentWeek) ? row.freezes_bought_this_week : 0;

  // Kiểm tra tính hợp lệ của Vé quay lại
  const now = new Date();
  const returnTicketActive = !!row.return_ticket_active && row.return_ticket_deadline && new Date(row.return_ticket_deadline) > now;
  const lastTicketAt = row.last_return_ticket_at ? new Date(row.last_return_ticket_at) : null;
  const daysSinceLastTicket = lastTicketAt ? Math.floor((now - lastTicketAt) / (24 * 60 * 60 * 1000)) : 999;

  const canBuyReturnTicket =
    !returnTicketActive &&
    (row.broken_streak_count >= (KEEP_RHYTHM_ITEMS.returnTicket.minBrokenStreak || 7)) &&
    (daysSinceActive >= (KEEP_RHYTHM_ITEMS.returnTicket.minInactiveDays || 2)) &&
    (daysSinceActive <= (KEEP_RHYTHM_ITEMS.returnTicket.maxInactiveDays || 14)) &&
    (daysSinceLastTicket >= (KEEP_RHYTHM_ITEMS.returnTicket.cooldownDays || 30));

  // Kiểm tra quyền đổi giờ đồng hồ tuần này
  const clockCanChangeThisWeek = (row.clock_last_changed_week !== currentWeek);

  return {
    userId,
    currentStreak: row.current_streak,
    bestStreak: row.best_streak,
    lastActiveDate: lastActiveStr,
    timezone: row.timezone || tz,
    freezeCount: row.freeze_count,
    freezesBoughtThisWeek,
    canBuyFreeze: row.freeze_count < KEEP_RHYTHM_ITEMS.freeze.maxInventory && freezesBoughtThisWeek < KEEP_RHYTHM_ITEMS.freeze.maxBuyPerWeek,
    brokenStreakCount: row.broken_streak_count,
    returnTicketActive,
    returnTicketDeadline: row.return_ticket_deadline,
    returnTicketLessonsDone: row.return_ticket_lessons_done,
    canBuyReturnTicket,
    hasClock: !!row.has_clock,
    clockHour: row.clock_hour,
    clockMinute: row.clock_minute,
    clockCanChangeThisWeek,
    contract: contractRow ? {
      id: contractRow.id,
      tier: contractRow.tier,
      depositAmount: contractRow.deposit_amount,
      targetLessonsPerDay: contractRow.target_lessons_per_day,
      startDate: contractRow.start_date,
      daysCompleted: contractRow.days_completed,
      todayLessonsDone: contractRow.today_lessons_done,
      lastEvaluatedDate: contractRow.last_evaluated_date,
      status: contractRow.status,
    } : null,
  };
}

/**
 * Ghi nhận hoạt động học tập (bài học/quiz/active), cập nhật streak server-side,
 * tự động kích hoạt Khăn giữ lửa nếu cần, kiểm tra Đồng hồ Cowdi và Khế ước 7 ngày.
 */
export async function recordActivity(userId, {
  timezone = 'Asia/Ho_Chi_Minh',
  isLesson = false,
  accuracy = 100,
  baseMilkEarned = 0,
} = {}, db = pool) {
  const todayStr = getTodayInTz(timezone);
  const yesterdayStr = getYesterdayInTz(timezone);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Khóa và lấy bản ghi user_streak_state
    const [[row]] = await conn.execute(
      'SELECT * FROM user_streak_state WHERE user_id = ? FOR UPDATE',
      [userId]
    );

    let currentStreak = row ? row.current_streak : 0;
    let bestStreak = row ? row.best_streak : 0;
    let freezeCount = row ? row.freeze_count : 0;
    let brokenStreakCount = row ? row.broken_streak_count : 0;
    let returnTicketActive = row ? !!row.return_ticket_active : false;
    let returnTicketLessons = row ? row.return_ticket_lessons_done : 0;
    let returnTicketDeadline = row ? row.return_ticket_deadline : null;

    const lastActiveStr = row?.last_active_date
      ? (row.last_active_date instanceof Date
          ? row.last_active_date.toISOString().slice(0, 10)
          : String(row.last_active_date).slice(0, 10))
      : null;

    let consumedFreeze = false;
    let giftedFreeze = false;
    let streakReset = false;
    let restoredStreak = 0;
    let clockBonusMilk = 0;
    let contractProgress = null;

    // 2. Tính toán chuỗi streak
    if (!lastActiveStr) {
      // Lần đầu học
      currentStreak = 1;
      bestStreak = Math.max(bestStreak, 1);
    } else if (lastActiveStr === todayStr) {
      // Đã học hôm nay, giữ nguyên streak
    } else if (lastActiveStr === yesterdayStr) {
      // Học ngày tiếp theo liên tiếp
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);

      // Tặng khăn giữ lửa ở mốc 7, 30, 100 ngày nếu kho < 2 (D13)
      if (KEEP_RHYTHM_ITEMS.freeze.milestoneGifts.includes(currentStreak)) {
        if (freezeCount < KEEP_RHYTHM_ITEMS.freeze.maxInventory) {
          freezeCount += 1;
          giftedFreeze = true;
        }
      }
    } else {
      const diff = getDiffDays(lastActiveStr, todayStr);
      if (diff === 2 && freezeCount > 0) {
        // Lỡ đúng 1 ngày và CÓ khăn giữ lửa -> Tự động dùng khăn!
        freezeCount -= 1;
        consumedFreeze = true;
        currentStreak += 1; // giữ lửa và tăng tiếp cho ngày hôm nay
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        // Không có khăn hoặc nghỉ >= 2 ngày -> Streak đứt!
        brokenStreakCount = currentStreak;
        currentStreak = 1;
        streakReset = true;
      }
    }

    // 3. Tiến trình Vé quay lại (nếu đang kích hoạt và còn hạn trong 24h)
    if (returnTicketActive && returnTicketDeadline) {
      const now = new Date();
      if (new Date(returnTicketDeadline) >= now) {
        if (isLesson) {
          returnTicketLessons += 1;
          if (returnTicketLessons >= KEEP_RHYTHM_ITEMS.returnTicket.requiredLessons) {
            // Hoàn thành 2 bài trong 24h: khôi phục 50% streak cũ
            restoredStreak = Math.floor(brokenStreakCount * (KEEP_RHYTHM_ITEMS.returnTicket.restoreRatio || 0.5));
            currentStreak = Math.max(currentStreak, restoredStreak);
            bestStreak = Math.max(bestStreak, currentStreak);
            returnTicketActive = false;
            brokenStreakCount = 0;
          }
        }
      } else {
        // Hết hạn vé
        returnTicketActive = false;
      }
    }

    // 4. Đồng hồ Cowdi: +10% Sữa nếu bài học hoàn thành trong khung +-60 phút
    if (row && row.has_clock && isLesson && baseMilkEarned > 0) {
      const { hour: curH, minute: curM } = getNowInTz(timezone);
      const targetH = row.clock_hour ?? 20;
      const targetM = row.clock_minute ?? 0;

      const curTotalM = curH * 60 + curM;
      const targetTotalM = targetH * 60 + targetM;
      let diffM = Math.abs(curTotalM - targetTotalM);
      if (diffM > 720) diffM = 1440 - diffM; // xử lý qua nửa đêm

      if (diffM <= (KEEP_RHYTHM_ITEMS.clock.windowMinutes || 60)) {
        // Kiểm tra xem hôm nay đã nhận mấy bài rồi (tối đa 3 bài/ngày)
        let todayClockBonusLessons = row.today_clock_bonus_lessons || 0;
        const lastClockBonusDate = row.today_clock_bonus_date
          ? (row.today_clock_bonus_date instanceof Date
              ? row.today_clock_bonus_date.toISOString().slice(0, 10)
              : String(row.today_clock_bonus_date).slice(0, 10))
          : null;

        if (lastClockBonusDate !== todayStr) {
          todayClockBonusLessons = 0;
        }

        if (todayClockBonusLessons < (KEEP_RHYTHM_ITEMS.clock.maxBonusLessonsPerDay || 3)) {
          clockBonusMilk = Math.max(1, Math.round(baseMilkEarned * KEEP_RHYTHM_ITEMS.clock.bonusMilkPercent));
          todayClockBonusLessons += 1;

          // Ghi nhận thưởng Sữa vào ledger
          const bonusRef = `${todayStr}_lesson_${todayClockBonusLessons}`;
          await conn.execute(
            `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
             VALUES (?, 'milk', ?, 'clock_bonus', ?)`,
            [userId, clockBonusMilk, bonusRef]
          );

          await conn.execute(
            `UPDATE user_streak_state
             SET today_clock_bonus_lessons = ?, today_clock_bonus_date = ?
             WHERE user_id = ?`,
            [todayClockBonusLessons, todayStr, userId]
          );
        }
      }
    }

    // 5. Khế ước 7 ngày (nếu đang chạy)
    const [[activeContract]] = await conn.execute(
      `SELECT * FROM user_contracts
       WHERE user_id = ? AND status = 'active'
       FOR UPDATE`,
      [userId]
    );

    if (activeContract) {
      const contractStartStr = activeContract.start_date instanceof Date
        ? activeContract.start_date.toISOString().slice(0, 10)
        : String(activeContract.start_date).slice(0, 10);

      const contractLastEval = activeContract.last_evaluated_date
        ? (activeContract.last_evaluated_date instanceof Date
            ? activeContract.last_evaluated_date.toISOString().slice(0, 10)
            : String(activeContract.last_evaluated_date).slice(0, 10))
        : null;

      // Kiểm tra xem có bị lỡ ngày nào không (khăn không cứu được khế ước)
      const prevCheckDate = contractLastEval || contractStartStr;
      const diffFromPrev = getDiffDays(prevCheckDate, todayStr);

      if (diffFromPrev > 1 && contractLastEval) {
        // Đã bỏ lỡ ít nhất 1 ngày -> Khế ước thất bại, mất cọc!
        await conn.execute(
          `UPDATE user_contracts SET status = 'failed' WHERE id = ?`,
          [activeContract.id]
        );
        contractProgress = { status: 'failed', contractId: activeContract.id };
      } else if (isLesson && accuracy >= (KEEP_RHYTHM_ITEMS.contract.minAccuracy || 70)) {
        // Bài học hợp lệ (đạt >= 70%)
        let todayLessons = (contractLastEval === todayStr) ? activeContract.today_lessons_done + 1 : 1;
        let daysCompleted = activeContract.days_completed;

        if (todayLessons === activeContract.target_lessons_per_day) {
          daysCompleted += 1;
        }

        let newStatus = 'active';
        let payoutAmount = 0;

        if (daysCompleted >= (KEEP_RHYTHM_ITEMS.contract.durationDays || 7)) {
          // Hoàn thành khế ước 7 ngày -> Trả cọc x1.5!
          newStatus = 'completed';
          payoutAmount = Math.round(activeContract.deposit_amount * (KEEP_RHYTHM_ITEMS.contract.rewardMultiplier || 1.5));

          // Ghi nhận trả thưởng qua wallet_ledger
          await conn.execute(
            `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
             VALUES (?, 'milk', ?, 'contract_payout', ?)`,
            [userId, payoutAmount, String(activeContract.id)]
          );
        }

        await conn.execute(
          `UPDATE user_contracts
           SET today_lessons_done = ?,
               days_completed = ?,
               last_evaluated_date = ?,
               status = ?,
               payout_amount = ?
           WHERE id = ?`,
          [todayLessons, daysCompleted, todayStr, newStatus, payoutAmount, activeContract.id]
        );

        contractProgress = {
          id: activeContract.id,
          tier: activeContract.tier,
          todayLessonsDone: todayLessons,
          targetLessonsPerDay: activeContract.target_lessons_per_day,
          daysCompleted,
          status: newStatus,
          payoutAmount,
        };
      }
    }

    // 6. Lưu trạng thái vào user_streak_state và user_progress
    await conn.execute(
      `INSERT INTO user_streak_state
         (user_id, timezone, current_streak, best_streak, last_active_date,
          freeze_count, broken_streak_count, return_ticket_active,
          return_ticket_deadline, return_ticket_lessons_done)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         timezone = VALUES(timezone),
         current_streak = VALUES(current_streak),
         best_streak = VALUES(best_streak),
         last_active_date = VALUES(last_active_date),
         freeze_count = VALUES(freeze_count),
         broken_streak_count = VALUES(broken_streak_count),
         return_ticket_active = VALUES(return_ticket_active),
         return_ticket_deadline = VALUES(return_ticket_deadline),
         return_ticket_lessons_done = VALUES(return_ticket_lessons_done)`,
      [
        userId,
        timezone,
        currentStreak,
        bestStreak,
        todayStr,
        freezeCount,
        brokenStreakCount,
        returnTicketActive ? 1 : 0,
        returnTicketDeadline,
        returnTicketLessons,
      ]
    );

    // Đồng bộ vào user_progress.streak
    await conn.execute(
      'UPDATE user_progress SET streak = ? WHERE user_id = ?',
      [currentStreak, userId]
    );

    await conn.commit();

    return {
      currentStreak,
      bestStreak,
      lastActiveDate: todayStr,
      freezeCount,
      consumedFreeze,
      giftedFreeze,
      streakReset,
      restoredStreak,
      clockBonusMilk,
      contractProgress,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Mua Khăn giữ lửa (400 Sữa).
 */
export async function buyFreeze(userId, timezone = 'Asia/Ho_Chi_Minh', db = pool) {
  const currentWeek = getIsoWeekString();
  const state = await getUserStreakState(userId, timezone, db);

  if (state.freezeCount >= KEEP_RHYTHM_ITEMS.freeze.maxInventory) {
    return { ok: false, error: `Bạn đã sở hữu tối đa ${KEEP_RHYTHM_ITEMS.freeze.maxInventory} Khăn giữ lửa.` };
  }
  if (state.freezesBoughtThisWeek >= KEEP_RHYTHM_ITEMS.freeze.maxBuyPerWeek) {
    return { ok: false, error: `Bạn đã mua tối đa ${KEEP_RHYTHM_ITEMS.freeze.maxBuyPerWeek} Khăn trong tuần này. Vui lòng quay lại tuần sau!` };
  }

  const wallet = await getWallet(userId, db);
  const cost = KEEP_RHYTHM_ITEMS.freeze.priceMilk;
  if (wallet.milk < cost) {
    return { ok: false, error: `Bạn cần ${cost.toLocaleString('vi-VN')} Sữa để mua Khăn giữ lửa (hiện có: ${wallet.milk.toLocaleString('vi-VN')} Sữa).` };
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const timestampRef = Date.now().toString();
    // 1. Trừ Sữa trong ledger
    await conn.execute(
      `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'milk', ?, 'shop_freeze', ?)`,
      [userId, -cost, timestampRef]
    );

    // 2. Cập nhật số khăn trong user_streak_state
    const newBoughtThisWeek = state.freezesBoughtThisWeek + 1;
    await conn.execute(
      `UPDATE user_streak_state
       SET freeze_count = freeze_count + 1,
           freezes_bought_this_week = ?,
           last_freeze_week = ?
       WHERE user_id = ?`,
      [newBoughtThisWeek, currentWeek, userId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const updatedWallet = await getWallet(userId, db);
  const updatedState = await getUserStreakState(userId, timezone, db);
  return { ok: true, wallet: updatedWallet, streakState: updatedState };
}

/**
 * Mua & kích hoạt Vé quay lại (300 Sữa).
 */
export async function buyReturnTicket(userId, timezone = 'Asia/Ho_Chi_Minh', db = pool) {
  const state = await getUserStreakState(userId, timezone, db);
  if (!state.canBuyReturnTicket) {
    return { ok: false, error: 'Bạn hiện không đủ điều kiện dùng Vé quay lại (cần streak cũ ≥ 7 ngày và nghỉ từ 2 đến 14 ngày).' };
  }

  const wallet = await getWallet(userId, db);
  const cost = KEEP_RHYTHM_ITEMS.returnTicket.priceMilk;
  if (wallet.milk < cost) {
    return { ok: false, error: `Bạn cần ${cost.toLocaleString('vi-VN')} Sữa để mua Vé quay lại (hiện có: ${wallet.milk.toLocaleString('vi-VN')} Sữa).` };
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const timestampRef = Date.now().toString();
    // 1. Trừ Sữa trong ledger
    await conn.execute(
      `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'milk', ?, 'shop_return_ticket', ?)`,
      [userId, -cost, timestampRef]
    );

    // 2. Kích hoạt vé 24 giờ
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await conn.execute(
      `UPDATE user_streak_state
       SET return_ticket_active = 1,
           return_ticket_deadline = ?,
           return_ticket_lessons_done = 0,
           last_return_ticket_at = NOW()
       WHERE user_id = ?`,
      [deadline, userId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const updatedWallet = await getWallet(userId, db);
  const updatedState = await getUserStreakState(userId, timezone, db);
  return { ok: true, wallet: updatedWallet, streakState: updatedState };
}

/**
 * Ký Khế ước 7 ngày.
 */
export async function signContract(userId, tierKey, timezone = 'Asia/Ho_Chi_Minh', db = pool) {
  const tierConfig = KEEP_RHYTHM_ITEMS.contract.tiers[tierKey];
  if (!tierConfig) {
    return { ok: false, error: 'Mức khế ước không hợp lệ.' };
  }

  const state = await getUserStreakState(userId, timezone, db);
  if (state.contract) {
    return { ok: false, error: 'Bạn đang có một Khế ước 7 ngày đang diễn ra. Hoàn thành xong mới được ký tiếp!' };
  }

  const wallet = await getWallet(userId, db);
  const deposit = tierConfig.deposit;
  if (wallet.milk < deposit) {
    return { ok: false, error: `Bạn cần ${deposit.toLocaleString('vi-VN')} Sữa để đặt cọc (hiện có: ${wallet.milk.toLocaleString('vi-VN')} Sữa).` };
  }

  const todayStr = getTodayInTz(timezone);
  const conn = await db.getConnection();
  let contractId = null;

  try {
    await conn.beginTransaction();

    // 1. Tạo khế ước
    const [res] = await conn.execute(
      `INSERT INTO user_contracts
         (user_id, tier, deposit_amount, target_lessons_per_day, start_date)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, tierKey, deposit, tierConfig.lessonsPerDay, todayStr]
    );
    contractId = res.insertId;

    // 2. Trừ cọc Sữa trong ledger
    await conn.execute(
      `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'milk', ?, 'contract_deposit', ?)`,
      [userId, -deposit, String(contractId)]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const updatedWallet = await getWallet(userId, db);
  const updatedState = await getUserStreakState(userId, timezone, db);
  return { ok: true, wallet: updatedWallet, streakState: updatedState, contractId };
}

/**
 * Mua Đồng hồ Cowdi (1000 Sữa).
 */
export async function buyClock(userId, { hour = 20, minute = 0 } = {}, timezone = 'Asia/Ho_Chi_Minh', db = pool) {
  const state = await getUserStreakState(userId, timezone, db);
  if (state.hasClock) {
    return { ok: false, error: 'Bạn đã sở hữu Đồng hồ Cowdi rồi!' };
  }

  const wallet = await getWallet(userId, db);
  const cost = KEEP_RHYTHM_ITEMS.clock.priceMilk;
  if (wallet.milk < cost) {
    return { ok: false, error: `Bạn cần ${cost.toLocaleString('vi-VN')} Sữa để mua Đồng hồ Cowdi (hiện có: ${wallet.milk.toLocaleString('vi-VN')} Sữa).` };
  }

  const currentWeek = getIsoWeekString();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const timestampRef = Date.now().toString();
    // 1. Trừ Sữa trong ledger
    await conn.execute(
      `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'milk', ?, 'shop_clock', ?)`,
      [userId, -cost, timestampRef]
    );

    // 2. Kích hoạt đồng hồ
    await conn.execute(
      `UPDATE user_streak_state
       SET has_clock = 1,
           clock_hour = ?,
           clock_minute = ?,
           clock_last_changed_week = ?
       WHERE user_id = ?`,
      [hour, minute, currentWeek, userId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const updatedWallet = await getWallet(userId, db);
  const updatedState = await getUserStreakState(userId, timezone, db);
  return { ok: true, wallet: updatedWallet, streakState: updatedState };
}

/**
 * Đổi giờ học của Đồng hồ Cowdi (miễn phí 1 lần/tuần).
 */
export async function setClockHour(userId, { hour = 20, minute = 0 } = {}, timezone = 'Asia/Ho_Chi_Minh', db = pool) {
  const state = await getUserStreakState(userId, timezone, db);
  if (!state.hasClock) {
    return { ok: false, error: 'Bạn chưa sở hữu Đồng hồ Cowdi.' };
  }
  if (!state.clockCanChangeThisWeek) {
    return { ok: false, error: 'Bạn đã đổi giờ học trong tuần này rồi. Mỗi tuần được đổi miễn phí 1 lần (reset thứ Hai)!' };
  }

  const currentWeek = getIsoWeekString();
  await db.execute(
    `UPDATE user_streak_state
     SET clock_hour = ?,
         clock_minute = ?,
         clock_last_changed_week = ?
     WHERE user_id = ?`,
    [hour, minute, currentWeek, userId]
  );

  const updatedState = await getUserStreakState(userId, timezone, db);
  return { ok: true, streakState: updatedState };
}
