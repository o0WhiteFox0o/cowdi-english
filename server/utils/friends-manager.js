// ============================================================
// Cowdi English — Friends Manager Service (SRS-FRIENDS v1.1)
// Quản lý friend_code, friendships (user_low < user_high),
// giới hạn BR-07, chặn, báo cáo và bảo mật dữ liệu BR-08 / NFR-03.
// ============================================================

import crypto from 'node:crypto';
import pool from '../config/database.js';
import { FRIEND_LIMITS } from '../../shared/game-config.js';
import {
  normalizeFriendPair,
  normalizeFriendCode,
  isValidFriendCode,
} from '../../shared/friends.js';

const REPORT_REASONS = new Set([
  'inappropriate_nickname',
  'spam',
  'harassment',
  'other',
]);

// Bộ đếm rate limit gửi lời mời kết bạn theo giờ (in-memory sliding window)
export function createHourlyRateLimiter(maxPerHour = FRIEND_LIMITS.MAX_REQUESTS_PER_HOUR) {
  const buckets = new Map(); // userId -> number[] timestamps
  return {
    checkAndConsume(userId, nowMs = Date.now()) {
      const cutoff = nowMs - 60 * 60 * 1000;
      const list = (buckets.get(userId) || []).filter((ts) => ts > cutoff);
      if (list.length >= maxPerHour) {
        buckets.set(userId, list);
        return false;
      }
      list.push(nowMs);
      buckets.set(userId, list);
      return true;
    },
    reset() {
      buckets.clear();
    },
  };
}

function generateFriendCode() {
  const alphabet = FRIEND_LIMITS.CODE_ALPHABET;
  const bytes = crypto.randomBytes(FRIEND_LIMITS.CODE_LENGTH);
  let out = '';
  for (let i = 0; i < FRIEND_LIMITS.CODE_LENGTH; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/**
 * Trích xuất pet chính tối thiểu (BR-08: không có ví, không có điểm).
 */
export function extractActivePetPublic(rawPetData) {
  let pd = rawPetData;
  if (typeof pd === 'string') {
    try { pd = JSON.parse(pd); } catch { pd = null; }
  }
  if (!pd || !pd.collection || !pd.activePetId) {
    return { petId: 'cowdi', petEvolution: 0, cosmetics: {} };
  }
  const pet = pd.collection[pd.activePetId];
  if (!pet) return { petId: 'cowdi', petEvolution: 0, cosmetics: {} };
  return {
    petId: pet.speciesId || 'cowdi',
    petEvolution: Math.max(0, Math.floor(Number(pet.evolution) || 0)),
    cosmetics: pet.cosmetics && typeof pet.cosmetics === 'object' ? pet.cosmetics : {},
  };
}

/**
 * FR-FRD-02: Cấp lười mã bạn bè 8 ký tự duy nhất cho user.
 */
export async function ensureFriendCode(userId, db = pool) {
  const [[row]] = await db.execute(
    'SELECT friend_code, nickname FROM users WHERE id = ?',
    [userId]
  );
  if (!row) return null;
  if (row.friend_code) {
    return { friendCode: row.friend_code, nickname: row.nickname || null };
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = generateFriendCode();
    const [[exists]] = await db.execute(
      'SELECT 1 AS x FROM users WHERE friend_code = ?',
      [candidate]
    );
    if (exists) continue;
    await db.execute(
      'UPDATE users SET friend_code = ? WHERE id = ? AND friend_code IS NULL',
      [candidate, userId]
    );
    const [[after]] = await db.execute(
      'SELECT friend_code, nickname FROM users WHERE id = ?',
      [userId]
    );
    if (after?.friend_code) {
      return { friendCode: after.friend_code, nickname: after.nickname || null };
    }
  }
  throw new Error('Không tạo được mã bạn bè.');
}

/**
 * Đếm số bạn accepted hiện có của user.
 */
async function countAcceptedFriends(userId, db) {
  const [[row]] = await db.execute(
    `SELECT COUNT(*) AS n
       FROM friendships
      WHERE status = 'accepted' AND (user_low = ? OR user_high = ?)`,
    [userId, userId]
  );
  return Number(row?.n || 0);
}

/**
 * Đếm số lời mời đang chờ do user gửi đi.
 */
async function countPendingRequests(userId, db) {
  const [[row]] = await db.execute(
    `SELECT COUNT(*) AS n
       FROM friendships
      WHERE status = 'pending' AND requested_by = ?`,
    [userId]
  );
  return Number(row?.n || 0);
}

/**
 * FR-FRD-01 & FR-RWD-03: Nhận thiệp thành công -> tự tạo quan hệ accepted (source='invite'),
 * kể cả khi thiệp flagged = 1 (trừ trường hợp hai bên đã chặn nhau).
 */
export async function createAutoFriendshipFromInvite(senderId, receiverId, db = pool) {
  const pair = normalizeFriendPair(senderId, receiverId);
  if (!pair) return { ok: false, reason: 'invalid_pair' };

  const [[existing]] = await db.execute(
    'SELECT status FROM friendships WHERE user_low = ? AND user_high = ?',
    [pair.userLow, pair.userHigh]
  );
  if (existing?.status === 'blocked') {
    return { ok: false, reason: 'blocked' };
  }
  if (existing?.status === 'accepted') {
    return { ok: true, already: true };
  }

  if (existing) {
    await db.execute(
      `UPDATE friendships
          SET status = 'accepted', source = 'invite', accepted_at = NOW()
        WHERE user_low = ? AND user_high = ? AND status != 'blocked'`,
      [pair.userLow, pair.userHigh]
    );
  } else {
    await db.execute(
      `INSERT INTO friendships (user_low, user_high, status, requested_by, source, accepted_at)
       VALUES (?, ?, 'accepted', ?, 'invite', NOW())`,
      [pair.userLow, pair.userHigh, senderId]
    );
  }

  // NFR-06: ghi sự kiện friend_added
  db.execute(
    `INSERT INTO app_events (user_id, name, props) VALUES (?, 'friend_added', ?)`,
    [receiverId, JSON.stringify({ source: 'invite', friendId: senderId })]
  ).catch(() => {});

  return { ok: true, created: true };
}

/**
 * Kiểm tra 2 người có phải bạn bè accepted (và không chặn nhau) không.
 */
export async function getFriendshipStatus(userIdA, userIdB, db = pool) {
  const pair = normalizeFriendPair(userIdA, userIdB);
  if (!pair) return null;
  const [[row]] = await db.execute(
    'SELECT status, requested_by, blocked_by, source, accepted_at FROM friendships WHERE user_low = ? AND user_high = ?',
    [pair.userLow, pair.userHigh]
  );
  return row || null;
}

/**
 * FR-FRD-02 & FR-FRD-03: Gửi lời mời kết bạn bằng friend_code (hoặc tự accepted nếu 2 bên cùng gửi).
 */
export async function sendFriendRequest(
  requesterId,
  rawCode,
  { source = 'code', rateLimiter, db = pool } = {}
) {
  if (rateLimiter && !rateLimiter.checkAndConsume(requesterId)) {
    return {
      ok: false,
      status: 429,
      error: 'RATE_LIMITED',
      messageVi: `Bạn đã gửi quá ${FRIEND_LIMITS.MAX_REQUESTS_PER_HOUR} lời mời trong 1 giờ. Thử lại sau nhé!`,
    };
  }

  const code = normalizeFriendCode(rawCode);
  if (!isValidFriendCode(code)) {
    return {
      ok: false,
      status: 400,
      error: 'INVALID_CODE',
      messageVi: 'Mã bạn bè phải gồm 8 ký tự hợp lệ (chữ in hoa và số 2–9).',
    };
  }

  const [[target]] = await db.execute(
    'SELECT id, nickname FROM users WHERE friend_code = ?',
    [code]
  );
  if (!target) {
    return {
      ok: false,
      status: 404,
      error: 'USER_NOT_FOUND',
      messageVi: 'Không tìm thấy người dùng với mã bạn bè này.',
    };
  }

  if (Number(target.id) === Number(requesterId)) {
    return {
      ok: false,
      status: 400,
      error: 'SELF_REQUEST',
      messageVi: 'Bạn không thể tự kết bạn với chính mình.',
    };
  }

  const pair = normalizeFriendPair(requesterId, target.id);
  const safeSource = source === 'qr' ? 'qr' : 'code';

  const [[existing]] = await db.execute(
    'SELECT status, requested_by, blocked_by FROM friendships WHERE user_low = ? AND user_high = ?',
    [pair.userLow, pair.userHigh]
  );

  if (existing) {
    if (existing.status === 'blocked') {
      return {
        ok: false,
        status: 403,
        error: 'BLOCKED',
        messageVi: 'Không thể gửi lời mời kết bạn tới người dùng này.',
      };
    }
    if (existing.status === 'accepted') {
      return {
        ok: false,
        status: 409,
        error: 'ALREADY_FRIENDS',
        messageVi: 'Hai bạn đã là bạn bè rồi!',
      };
    }
    if (existing.status === 'pending') {
      if (Number(existing.requested_by) === Number(requesterId)) {
        return {
          ok: false,
          status: 409,
          error: 'ALREADY_REQUESTED',
          messageVi: 'Bạn đã gửi lời mời cho người này rồi, chờ họ đồng ý nhé!',
        };
      }
      // FR-FRD-03: Hai bên cùng gửi -> tự accepted!
      const [myCount, targetCount] = await Promise.all([
        countAcceptedFriends(requesterId, db),
        countAcceptedFriends(target.id, db),
      ]);
      if (myCount >= FRIEND_LIMITS.MAX_FRIENDS || targetCount >= FRIEND_LIMITS.MAX_FRIENDS) {
        return {
          ok: false,
          status: 409,
          error: 'FRIEND_LIMIT_REACHED',
          messageVi: `Danh sách bạn bè đã đạt tối đa ${FRIEND_LIMITS.MAX_FRIENDS} người.`,
        };
      }
      await db.execute(
        `UPDATE friendships
            SET status = 'accepted', accepted_at = NOW()
          WHERE user_low = ? AND user_high = ? AND status = 'pending'`,
        [pair.userLow, pair.userHigh]
      );
      db.execute(
        `INSERT INTO app_events (user_id, name, props) VALUES (?, 'friend_added', ?)`,
        [requesterId, JSON.stringify({ source: safeSource, mutual: true, friendId: target.id })]
      ).catch(() => {});

      return {
        ok: true,
        status: 'accepted',
        autoAccepted: true,
        friend: { userId: target.id, nickname: target.nickname || 'Người bạn' },
      };
    }
  }

  // BR-07: Kiểm tra giới hạn 100 bạn & 20 lời mời đang chờ
  const [myCount, targetCount, pendingCount] = await Promise.all([
    countAcceptedFriends(requesterId, db),
    countAcceptedFriends(target.id, db),
    countPendingRequests(requesterId, db),
  ]);
  if (myCount >= FRIEND_LIMITS.MAX_FRIENDS) {
    return {
      ok: false,
      status: 409,
      error: 'FRIEND_LIMIT_REACHED',
      messageVi: `Bạn đã đạt giới hạn tối đa ${FRIEND_LIMITS.MAX_FRIENDS} bạn bè.`,
    };
  }
  if (targetCount >= FRIEND_LIMITS.MAX_FRIENDS) {
    return {
      ok: false,
      status: 409,
      error: 'TARGET_FRIEND_LIMIT_REACHED',
      messageVi: 'Người dùng này đã đạt giới hạn tối đa bạn bè.',
    };
  }
  if (pendingCount >= FRIEND_LIMITS.MAX_PENDING_REQUESTS) {
    return {
      ok: false,
      status: 409,
      error: 'PENDING_LIMIT_REACHED',
      messageVi: `Bạn chỉ có thể giữ tối đa ${FRIEND_LIMITS.MAX_PENDING_REQUESTS} lời mời đang chờ.`,
    };
  }

  await db.execute(
    `INSERT INTO friendships (user_low, user_high, status, requested_by, source)
     VALUES (?, ?, 'pending', ?, ?)`,
    [pair.userLow, pair.userHigh, requesterId, safeSource]
  );

  return {
    ok: true,
    status: 'pending',
    friend: { userId: target.id, nickname: target.nickname || 'Người bạn' },
  };
}

/**
 * FR-FRD-03: Chấp nhận lời mời kết bạn.
 */
export async function acceptFriendRequest(userId, requesterId, db = pool) {
  const pair = normalizeFriendPair(userId, requesterId);
  if (!pair) return { ok: false, status: 400, error: 'INVALID_USER', messageVi: 'ID người dùng không hợp lệ.' };

  const [[row]] = await db.execute(
    'SELECT status, requested_by, source FROM friendships WHERE user_low = ? AND user_high = ?',
    [pair.userLow, pair.userHigh]
  );
  if (!row || row.status !== 'pending' || Number(row.requested_by) !== Number(requesterId)) {
    return { ok: false, status: 404, error: 'REQUEST_NOT_FOUND', messageVi: 'Không tìm thấy lời mời kết bạn.' };
  }

  const [myCount, otherCount] = await Promise.all([
    countAcceptedFriends(userId, db),
    countAcceptedFriends(requesterId, db),
  ]);
  if (myCount >= FRIEND_LIMITS.MAX_FRIENDS || otherCount >= FRIEND_LIMITS.MAX_FRIENDS) {
    return {
      ok: false,
      status: 409,
      error: 'FRIEND_LIMIT_REACHED',
      messageVi: `Danh sách bạn bè đã đạt tối đa ${FRIEND_LIMITS.MAX_FRIENDS} người.`,
    };
  }

  await db.execute(
    `UPDATE friendships
        SET status = 'accepted', accepted_at = NOW()
      WHERE user_low = ? AND user_high = ? AND status = 'pending'`,
    [pair.userLow, pair.userHigh]
  );

  db.execute(
    `INSERT INTO app_events (user_id, name, props) VALUES (?, 'friend_added', ?)`,
    [userId, JSON.stringify({ source: row.source || 'code', friendId: Number(requesterId) })]
  ).catch(() => {});

  return { ok: true, status: 'accepted' };
}

/**
 * FR-FRD-03: Từ chối hoặc thu hồi lời mời đang chờ.
 */
export async function declineFriendRequest(userId, otherUserId, db = pool) {
  const pair = normalizeFriendPair(userId, otherUserId);
  if (!pair) return { ok: false, status: 400, error: 'INVALID_USER', messageVi: 'ID người dùng không hợp lệ.' };

  const [del] = await db.execute(
    `DELETE FROM friendships WHERE user_low = ? AND user_high = ? AND status = 'pending'`,
    [pair.userLow, pair.userHigh]
  );
  if (!del || del.affectedRows === 0) {
    return { ok: false, status: 404, error: 'REQUEST_NOT_FOUND', messageVi: 'Không tìm thấy lời mời kết bạn.' };
  }
  return { ok: true };
}

/**
 * FR-FRD-04: Huỷ kết bạn.
 */
export async function removeFriend(userId, otherUserId, db = pool) {
  const pair = normalizeFriendPair(userId, otherUserId);
  if (!pair) return { ok: false, status: 400, error: 'INVALID_USER', messageVi: 'ID người dùng không hợp lệ.' };

  const [del] = await db.execute(
    `DELETE FROM friendships WHERE user_low = ? AND user_high = ? AND status = 'accepted'`,
    [pair.userLow, pair.userHigh]
  );
  if (!del || del.affectedRows === 0) {
    return { ok: false, status: 404, error: 'NOT_FRIENDS', messageVi: 'Hai bạn hiện chưa phải bạn bè.' };
  }
  return { ok: true };
}

/**
 * FR-FRD-04: Chặn người dùng.
 */
export async function blockUser(userId, targetId, db = pool) {
  const pair = normalizeFriendPair(userId, targetId);
  if (!pair) return { ok: false, status: 400, error: 'INVALID_USER', messageVi: 'ID người dùng không hợp lệ.' };

  const [[existing]] = await db.execute(
    'SELECT status, blocked_by FROM friendships WHERE user_low = ? AND user_high = ?',
    [pair.userLow, pair.userHigh]
  );

  if (existing) {
    await db.execute(
      `UPDATE friendships
          SET status = 'blocked', blocked_by = ?, accepted_at = NULL
        WHERE user_low = ? AND user_high = ?`,
      [userId, pair.userLow, pair.userHigh]
    );
  } else {
    await db.execute(
      `INSERT INTO friendships (user_low, user_high, status, requested_by, blocked_by, source)
       VALUES (?, ?, 'blocked', ?, ?, 'code')`,
      [pair.userLow, pair.userHigh, userId, userId]
    );
  }

  return { ok: true, status: 'blocked' };
}

/**
 * FR-FRD-04: Bỏ chặn (chỉ người đã thực hiện chặn mới bỏ chặn được).
 */
export async function unblockUser(userId, targetId, db = pool) {
  const pair = normalizeFriendPair(userId, targetId);
  if (!pair) return { ok: false, status: 400, error: 'INVALID_USER', messageVi: 'ID người dùng không hợp lệ.' };

  const [del] = await db.execute(
    `DELETE FROM friendships
      WHERE user_low = ? AND user_high = ? AND status = 'blocked' AND blocked_by = ?`,
    [pair.userLow, pair.userHigh, userId]
  );
  if (!del || del.affectedRows === 0) {
    return { ok: false, status: 404, error: 'NOT_BLOCKED', messageVi: 'Không tìm thấy bản ghi chặn của bạn.' };
  }
  return { ok: true };
}

/**
 * FR-FRD-04: Báo cáo người dùng.
 */
export async function reportUser(reporterId, reportedId, rawReason, db = pool) {
  const rep = Number(reportedId);
  if (!Number.isInteger(rep) || rep <= 0 || rep === Number(reporterId)) {
    return { ok: false, status: 400, error: 'INVALID_USER', messageVi: 'ID người dùng không hợp lệ.' };
  }
  const cleanReason = String(rawReason || 'other').trim().slice(0, 40) || 'other';
  const safeReason = REPORT_REASONS.has(cleanReason) ? cleanReason : cleanReason;

  await db.execute(
    `INSERT INTO friend_reports (reporter_id, reported_id, reason)
     VALUES (?, ?, ?)`,
    [reporterId, rep, safeReason]
  );
  return { ok: true };
}

/**
 * FR-FRD-06 & BR-08: Danh sách bạn bè, lời mời đến/đi và danh sách đã chặn.
 * Tuyệt đối KHÔNG trả email, display_name, avatar_url, IP, ví hay điểm bài.
 */
export async function getFriendsOverview(userId, db = pool) {
  const meInfo = await ensureFriendCode(userId, db);

  const [rows] = await db.execute(
    `SELECT
       f.user_low, f.user_high, f.status, f.requested_by, f.blocked_by,
       f.source, f.created_at, f.accepted_at,
       u.id AS other_id, u.nickname AS other_nickname,
       up.pet_data, up.learner_group, up.active_path, up.last_active_date
     FROM friendships f
     JOIN users u ON u.id = IF(f.user_low = ?, f.user_high, f.user_low)
     LEFT JOIN user_progress up ON up.user_id = u.id
     WHERE f.user_low = ? OR f.user_high = ?
     ORDER BY f.accepted_at DESC, f.created_at DESC`,
    [userId, userId, userId]
  );

  const friends = [];
  const incomingRequests = [];
  const outgoingRequests = [];
  const blocked = [];

  for (const r of rows) {
    const pet = extractActivePetPublic(r.pet_data);
    const baseItem = {
      userId: Number(r.other_id),
      nickname: r.other_nickname || 'Người bạn',
      petId: pet.petId,
      petEvolution: pet.petEvolution,
      learnerGroup: r.learner_group || null,
      activePath: r.active_path || null,
      lastActiveDate: r.last_active_date || null,
    };

    if (r.status === 'accepted') {
      friends.push({
        ...baseItem,
        source: r.source,
        acceptedAt: r.accepted_at,
      });
    } else if (r.status === 'pending') {
      if (Number(r.requested_by) === Number(userId)) {
        outgoingRequests.push({ ...baseItem, createdAt: r.created_at });
      } else {
        incomingRequests.push({ ...baseItem, createdAt: r.created_at });
      }
    } else if (r.status === 'blocked' && Number(r.blocked_by) === Number(userId)) {
      blocked.push({
        userId: Number(r.other_id),
        nickname: r.other_nickname || 'Người dùng',
        createdAt: r.created_at,
      });
    }
  }

  return {
    nickname: meInfo?.nickname || null,
    friendCode: meInfo?.friendCode || null,
    friends,
    incomingRequests,
    outgoingRequests,
    blocked,
    limits: {
      maxFriends: FRIEND_LIMITS.MAX_FRIENDS,
      maxPending: FRIEND_LIMITS.MAX_PENDING_REQUESTS,
    },
  };
}

/**
 * FR-VIS-01 & BR-08: Thông tin thăm pet của bạn bè (chỉ xem, chỉ bạn accepted & không chặn).
 * Tuyệt đối không trả email, tên thật Google, ảnh Google, ví hay điểm bài.
 */
export async function getFriendPetProfile(viewerId, friendId, db = pool) {
  const targetId = Number(friendId);
  if (!Number.isInteger(targetId) || targetId <= 0 || targetId === Number(viewerId)) {
    return { ok: false, status: 400, error: 'INVALID_USER', messageVi: 'ID bạn bè không hợp lệ.' };
  }

  const rel = await getFriendshipStatus(viewerId, targetId, db);
  if (!rel || rel.status !== 'accepted') {
    return {
      ok: false,
      status: 403,
      error: 'NOT_FRIENDS',
      messageVi: 'Bạn chỉ có thể thăm pet của người đã là bạn bè.',
    };
  }

  const [[row]] = await db.execute(
    `SELECT u.id, u.nickname,
            up.pet_data, up.learner_group, up.active_path, up.last_active_date
       FROM users u
       LEFT JOIN user_progress up ON up.user_id = u.id
      WHERE u.id = ?`,
    [targetId]
  );
  if (!row) {
    return { ok: false, status: 404, error: 'USER_NOT_FOUND', messageVi: 'Không tìm thấy người dùng.' };
  }

  const pet = extractActivePetPublic(row.pet_data);
  return {
    ok: true,
    profile: {
      userId: Number(row.id),
      nickname: row.nickname || 'Người bạn',
      petId: pet.petId,
      petEvolution: pet.petEvolution,
      cosmetics: pet.cosmetics,
      learnerGroup: row.learner_group || null,
      activePath: row.active_path || null,
      lastActiveDate: row.last_active_date || null,
    },
  };
}

/**
 * BR-06: Tính biến thiên League Points cho trận Duel.
 * Trận giao hữu bạn bè luôn trả 0 (không cộng, không trừ LP).
 */
export function computeDuelLeaguePointDelta({ isFriendDuel, phase, outcome }) {
  if (isFriendDuel) return 0;
  if (phase === 'create') return 5;
  if (outcome === 'win') return 30;
  if (outcome === 'draw') return 15;
  if (outcome === 'loss') return 5;
  return 0;
}
