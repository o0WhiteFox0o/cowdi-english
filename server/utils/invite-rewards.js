// ============================================================
// Cowdi English — Invite Activation Rewards & Anti-Fraud Service
// Nguồn sự thật: docs/04-design/SRS-FRIENDS-v1.1.md (FR-RWD, BR-01..05)
// ============================================================

import crypto from 'node:crypto';
import pool from '../config/database.js';
import { INVITE_REWARDS } from '../../shared/game-config.js';
import {
  isActivated,
  milestonesReached,
  getNextMilestone,
  toVietnamDate,
  toVietnamMonth,
  splitMonthlyTicketAllowance,
} from '../../shared/friends.js';

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Băm SHA-256 của User-Agent + device ID lưu ở localStorage (cowdi_device).
 */
export function computeDeviceHash(userAgent = '', deviceId = '') {
  const ua = String(userAgent || '').trim();
  const did = String(deviceId || '').trim();
  if (!ua && !did) return null;
  return crypto.createHash('sha256').update(`${ua}|${did}`).digest('hex');
}

/**
 * Lấy IP chuẩn từ request Express (đã bật trust proxy = 1).
 */
export function getClientIp(req) {
  const raw = req?.ip || req?.socket?.remoteAddress || '';
  return String(raw).replace(/^::ffff:/, '').slice(0, 45) || null;
}

/**
 * FR-RWD-01: Trùng IP hoặc thiết bị với lần tạo thiệp trong vòng 24 giờ -> flagged = true.
 */
export function isSameDeviceOrIpWithin24h({
  creatorIp,
  creatorDeviceHash,
  createdAt,
  claimIp,
  claimDeviceHash,
  now = new Date(),
}) {
  const createdMs = createdAt ? new Date(createdAt).getTime() : Number.NaN;
  const nowMs = (now instanceof Date ? now : new Date(now)).getTime();
  if (!Number.isFinite(createdMs) || !Number.isFinite(nowMs)) return false;
  if (nowMs - createdMs > INVITE_REWARDS.ANTI_FRAUD_HOURS * MS_PER_HOUR) {
    return false;
  }
  const sameIp = Boolean(creatorIp && claimIp && creatorIp === claimIp);
  const sameDevice = Boolean(creatorDeviceHash && claimDeviceHash && creatorDeviceHash === claimDeviceHash);
  return sameIp || sameDevice;
}

/**
 * BR-04: Giải ngân vé gacha từ invite_ticket_queue theo trần 3 vé / tháng dương lịch (giờ VN).
 * Có thể gọi trong transaction hoặc độc lập khi người dùng mở app sang tháng mới.
 */
export async function releaseDeferredTicketsForMonth(userId, now = new Date(), db = pool) {
  const monthStr = toVietnamMonth(now);
  const [[usedRow]] = await db.execute(
    `SELECT COUNT(*) AS n
       FROM invite_ticket_queue
      WHERE user_id = ? AND granted_month = ?`,
    [userId, monthStr]
  );
  const alreadyGrantedThisMonth = Number(usedRow?.n || 0);

  const [pendingRows] = await db.execute(
    `SELECT id, milestone, ticket_index
       FROM invite_ticket_queue
      WHERE user_id = ? AND granted_month IS NULL
      ORDER BY milestone ASC, ticket_index ASC`,
    [userId]
  );

  const { grantNow, deferred } = splitMonthlyTicketAllowance(pendingRows.length, alreadyGrantedThisMonth);
  let grantedCount = 0;

  for (let i = 0; i < grantNow; i++) {
    const row = pendingRows[i];
    const [upd] = await db.execute(
      `UPDATE invite_ticket_queue
          SET granted_month = ?, granted_at = NOW()
        WHERE id = ? AND granted_month IS NULL`,
      [monthStr, row.id]
    );
    if (upd?.affectedRows === 1) {
      const refId = `m:${row.milestone}:${row.ticket_index}`;
      await db.execute(
        `INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'gacha_ticket', 1, 'invite_milestone', ?)`,
        [userId, refId]
      );
      grantedCount++;
    }
  }

  return {
    month: monthStr,
    grantedNow: grantedCount,
    grantedThisMonth: alreadyGrantedThisMonth + grantedCount,
    deferredRemaining: Math.max(0, pendingRows.length - grantedCount),
  };
}

/**
 * Ghi nhận ngày hoàn thành lần đầu của từng bài học mới (giờ Việt Nam)
 * và kiểm tra + trao thưởng mời bạn trong cùng transaction (FR-RWD-02..05, BR-01..04).
 */
export async function processInviteActivationReward(
  receiverUserId,
  { newlyCompletedIds = [], now = new Date(), db = pool } = {}
) {
  const validNew = Array.isArray(newlyCompletedIds)
    ? newlyCompletedIds.filter((id) => typeof id === 'string' && id.trim().length > 0)
    : [];
  const todayVn = toVietnamDate(now);
  const monthStr = toVietnamMonth(now);

  const useConn = typeof db.getConnection === 'function';
  const conn = useConn ? await db.getConnection() : db;

  try {
    if (useConn) await conn.beginTransaction();

    // 1. Ghi ngày hoàn thành lần đầu của bài mới (idempotent qua PRIMARY KEY (user_id, lesson_id))
    for (const lessonId of validNew) {
      await conn.execute(
        `INSERT IGNORE INTO user_lesson_first_completions (user_id, lesson_id, completed_date)
         VALUES (?, ?, ?)`,
        [receiverUserId, lessonId, todayVn]
      );
    }

    // 2. Kiểm tra người học có thiệp đã nhận & chưa thưởng không
    const [[invite]] = await conn.execute(
      `SELECT code, sender_id, claimed_at, rewarded_sender, flagged
         FROM invites
        WHERE claimed_by = ? AND rewarded_sender = 0
        LIMIT 1`,
      [receiverUserId]
    );

    if (!invite || Number(invite.flagged) === 1) {
      if (useConn) await conn.commit();
      return { activated: false, reason: !invite ? 'no_pending_invite' : 'flagged' };
    }

    // 3. Kiểm tra BR-01: >=3 bài mới trên >=2 ngày khác nhau (giờ VN) trong 14 ngày
    const [dateRows] = await conn.execute(
      `SELECT completed_date
         FROM user_lesson_first_completions
        WHERE user_id = ?`,
      [receiverUserId]
    );
    const lessonDates = dateRows.map((r) =>
      r.completed_date instanceof Date ? toVietnamDate(r.completed_date) : String(r.completed_date).slice(0, 10)
    );

    if (!isActivated(lessonDates, invite.claimed_at, now)) {
      if (useConn) await conn.commit();
      return { activated: false, reason: 'not_enough_activity' };
    }

    // 4. Đánh dấu đã thưởng nguyên tử để chống race condition
    const [markRes] = await conn.execute(
      `UPDATE invites
          SET rewarded_sender = 1, rewarded_at = NOW()
        WHERE code = ? AND rewarded_sender = 0`,
      [invite.code]
    );
    if (!markRes || markRes.affectedRows !== 1) {
      if (useConn) await conn.commit();
      return { activated: false, reason: 'already_rewarded' };
    }

    // Lấy biệt danh người được mời cho thông báo (BR-08: không dùng tên thật Google)
    const [[receiverRow]] = await conn.execute(
      'SELECT nickname FROM users WHERE id = ?',
      [receiverUserId]
    );
    const receiverNick = receiverRow?.nickname || 'Bạn mới';

    // 5. Thưởng người gửi: +3 Gem (BR-02: tối đa 10 lần / tháng dương lịch)
    const [[monthGemRow]] = await conn.execute(
      `SELECT COUNT(*) AS n
         FROM wallet_ledger
        WHERE user_id = ?
          AND currency = 'gem'
          AND reason = 'invite_activated'
          AND DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+07:00'), '%Y-%m') = ?`,
      [invite.sender_id, monthStr]
    );
    const senderGemCountThisMonth = Number(monthGemRow?.n || 0);
    let senderGemGranted = 0;

    if (senderGemCountThisMonth < INVITE_REWARDS.SENDER_GEM_MAX_PER_MONTH) {
      const [gemIns] = await conn.execute(
        `INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
         VALUES (?, 'gem', ?, 'invite_activated', ?)`,
        [invite.sender_id, INVITE_REWARDS.SENDER_GEM, invite.code]
      );
      if (gemIns?.affectedRows === 1) {
        senderGemGranted = INVITE_REWARDS.SENDER_GEM;
        await conn.execute(
          `INSERT IGNORE INTO invite_notifications (user_id, kind, ref_id, payload)
           VALUES (?, 'invite_activated', ?, ?)`,
          [
            invite.sender_id,
            invite.code,
            JSON.stringify({ gem: INVITE_REWARDS.SENDER_GEM, fromNickname: receiverNick }),
          ]
        );
      }
    }

    // 6. Thưởng người được mời: +500 Sữa quà chào mừng (BR-02)
    let receiverMilkGranted = 0;
    const [milkIns] = await conn.execute(
      `INSERT IGNORE INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
       VALUES (?, 'milk', ?, 'invite_welcome', ?)`,
      [receiverUserId, INVITE_REWARDS.RECEIVER_MILK, invite.code]
    );
    if (milkIns?.affectedRows === 1) {
      receiverMilkGranted = INVITE_REWARDS.RECEIVER_MILK;
      await conn.execute(
        `INSERT IGNORE INTO invite_notifications (user_id, kind, ref_id, payload)
         VALUES (?, 'invite_welcome', ?, ?)`,
        [
          receiverUserId,
          invite.code,
          JSON.stringify({ milk: INVITE_REWARDS.RECEIVER_MILK }),
        ]
      );
    }

    // 7. Mốc người gửi trọn đời (BR-03): 3 / 5 / 10 / 20 bạn học thật
    const [[totalActRow]] = await conn.execute(
      `SELECT COUNT(*) AS n
         FROM invites
        WHERE sender_id = ? AND rewarded_sender = 1`,
      [invite.sender_id]
    );
    const totalActivated = Number(totalActRow?.n || 0);

    const [grantedMilestoneRows] = await conn.execute(
      `SELECT DISTINCT milestone
         FROM invite_ticket_queue
        WHERE user_id = ?`,
      [invite.sender_id]
    );
    const alreadyGrantedMilestones = grantedMilestoneRows.map((r) => Number(r.milestone));
    const newlyReached = milestonesReached(totalActivated, alreadyGrantedMilestones);

    for (const m of newlyReached) {
      for (let idx = 1; idx <= m.tickets; idx++) {
        await conn.execute(
          `INSERT IGNORE INTO invite_ticket_queue (user_id, milestone, ticket_index, granted_month)
           VALUES (?, ?, ?, NULL)`,
          [invite.sender_id, m.count, idx]
        );
      }
      if (m.titleId) {
        await conn.execute(
          `INSERT IGNORE INTO owned_cosmetics (user_id, cosmetic_id, category, currency, price_paid, acquired_from, created_at)
           VALUES (?, ?, 'title', 'free', 0, 'invite_milestone', NOW())`,
          [invite.sender_id, m.titleId]
        );
      }
      await conn.execute(
        `INSERT IGNORE INTO invite_notifications (user_id, kind, ref_id, payload)
         VALUES (?, 'invite_milestone', ?, ?)`,
        [
          invite.sender_id,
          String(m.count),
          JSON.stringify({ milestone: m.count, tickets: m.tickets, titleVi: m.titleVi }),
        ]
      );
    }

    // 8. Giải ngân vé trong hạn mức tháng hiện tại (BR-04: tối đa 3 vé/tháng)
    const ticketRelease = await releaseDeferredTicketsForMonth(invite.sender_id, now, conn);

    // 9. Ghi sự kiện invite_activated (NFR-06)
    await conn.execute(
      `INSERT INTO app_events (user_id, name, props)
       VALUES (?, 'invite_activated', ?)`,
      [
        invite.sender_id,
        JSON.stringify({
          code: invite.code,
          senderGemGranted,
          receiverMilkGranted,
          totalActivated,
          newMilestones: newlyReached.map((m) => m.count),
        }),
      ]
    );

    if (useConn) await conn.commit();

    return {
      activated: true,
      code: invite.code,
      senderId: invite.sender_id,
      senderGemGranted,
      receiverMilkGranted,
      totalActivated,
      newMilestones: newlyReached,
      ticketRelease,
    };
  } catch (err) {
    if (useConn) await conn.rollback();
    throw err;
  } finally {
    if (useConn) conn.release();
  }
}

/**
 * FR-RWD-06: Thống kê mời bạn cho InviteSheet (kèm tự giải ngân vé dời sang tháng mới).
 */
export async function getInviteStats(userId, now = new Date(), db = pool) {
  // Tự giải ngân vé dời sang tháng mới nếu có
  const ticketRelease = await releaseDeferredTicketsForMonth(userId, now, db);

  const [[countsRow]] = await db.execute(
    `SELECT
       COUNT(*) AS sent_count,
       SUM(CASE WHEN claimed_by IS NOT NULL THEN 1 ELSE 0 END) AS claimed_count,
       SUM(CASE WHEN rewarded_sender = 1 THEN 1 ELSE 0 END) AS activated_count
       FROM invites
      WHERE sender_id = ?`,
    [userId]
  );

  const [[userRow]] = await db.execute(
    'SELECT nickname FROM users WHERE id = ?',
    [userId]
  );

  const [[ticketTotalRow]] = await db.execute(
    `SELECT COALESCE(SUM(amount), 0) AS total
       FROM wallet_ledger
      WHERE user_id = ? AND currency = 'gacha_ticket'`,
    [userId]
  );

  const [titleRows] = await db.execute(
    `SELECT cosmetic_id
       FROM owned_cosmetics
      WHERE user_id = ? AND category = 'title'`,
    [userId]
  );

  const sentCount = Number(countsRow?.sent_count || 0);
  const claimedCount = Number(countsRow?.claimed_count || 0);
  const activatedCount = Number(countsRow?.activated_count || 0);
  const nextMilestone = getNextMilestone(activatedCount);

  return {
    nickname: userRow?.nickname || null,
    sentCount,
    claimedCount,
    activatedCount,
    ticketsGrantedThisMonth: ticketRelease.grantedThisMonth,
    ticketsCapThisMonth: INVITE_REWARDS.TICKETS_MAX_PER_MONTH,
    ticketsDeferredCount: ticketRelease.deferredRemaining,
    totalGachaTickets: Math.max(0, Number(ticketTotalRow?.total || 0)),
    nextMilestone,
    milestones: INVITE_REWARDS.MILESTONES.map((m) => ({
      ...m,
      reached: activatedCount >= m.count,
    })),
    titles: titleRows.map((r) => r.cosmetic_id),
  };
}
