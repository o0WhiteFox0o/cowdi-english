// ============================================================
// Cowdi English — Hàm thuần Phân hệ Bạn bè & Thưởng mời bạn
// Nguồn sự thật: docs/04-design/SRS-FRIENDS-v1.1.md (BR-01..BR-08)
// ESM thuần — dùng chung cho cả server/ và src/.
// ============================================================

import { INVITE_REWARDS, FRIEND_LIMITS } from './game-config.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Danh sách từ cấm cơ bản cho biệt danh (khớp nguyên từ hoặc ghép rõ rệt)
const FORBIDDEN_NICKNAME_WORDS = [
  'admin', 'moderator', 'system', 'cowdi_official',
  'fuck', 'shit', 'bitch', 'dick', 'pussy', 'porn', 'sex',
  'địt', 'dit', 'đụ', 'lồn', 'lon', 'cặc', 'cac', 'buồi', 'buoi',
  'đéo', 'deo', 'vãi lồn', 'vcl', 'vl', 'đm', 'dm', 'đmm', 'dmm', 'cc',
];

/**
 * Chuyển Date hoặc chuỗi ngày/ISO về chuỗi 'YYYY-MM-DD' theo giờ Việt Nam (Asia/Ho_Chi_Minh).
 * Nếu đầu vào đã là 'YYYY-MM-DD', trả về nguyên vẹn.
 */
export function toVietnamDate(input, tz = INVITE_REWARDS.TIMEZONE) {
  if (!input) return null;
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
    return input.trim();
  }
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/**
 * Trả về chuỗi tháng dương lịch 'YYYY-MM' theo giờ Việt Nam.
 */
export function toVietnamMonth(input = new Date(), tz = INVITE_REWARDS.TIMEZONE) {
  const dateStr = toVietnamDate(input, tz);
  return dateStr ? dateStr.slice(0, 7) : null;
}

/**
 * Khoảng cách theo ngày (b - a) giữa 2 chuỗi 'YYYY-MM-DD'.
 */
export function diffCalendarDays(dateA, dateB) {
  if (!dateA || !dateB) return Number.NaN;
  const a = new Date(`${dateA}T12:00:00Z`);
  const b = new Date(`${dateB}T12:00:00Z`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return Number.NaN;
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/**
 * BR-01: Kiểm tra người được mời đã đạt "Học thật" chưa.
 * Điều kiện:
 * - Trong 14 ngày kể từ `claimedAt` (now - claimedAt <= 14 ngày)
 * - Hoàn thành >= 3 bài MỚI trên >= 2 ngày khác nhau (theo giờ Việt Nam)
 *
 * @param {Array<string|Date>} newLessonDates Danh sách ngày/timestamp hoàn thành lần đầu của từng bài mới
 * @param {string|Date} claimedAt Thời điểm nhận thiệp
 * @param {string|Date} [now] Thời điểm kiểm tra (mặc định hiện tại)
 * @returns {boolean}
 */
export function isActivated(newLessonDates, claimedAt, now = new Date()) {
  if (!Array.isArray(newLessonDates) || newLessonDates.length < INVITE_REWARDS.MIN_NEW_LESSONS) {
    return false;
  }
  const claimedDateObj = claimedAt instanceof Date ? claimedAt : new Date(claimedAt);
  const nowDateObj = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(claimedDateObj.getTime()) || Number.isNaN(nowDateObj.getTime())) {
    return false;
  }

  // Không quá 14 ngày kể từ claimed_at
  const elapsedMs = nowDateObj.getTime() - claimedDateObj.getTime();
  if (elapsedMs < 0 || elapsedMs > INVITE_REWARDS.WINDOW_DAYS * MS_PER_DAY) {
    return false;
  }

  const claimDayVn = toVietnamDate(claimedDateObj);
  const nowDayVn = toVietnamDate(nowDateObj);
  if (!claimDayVn || !nowDayVn) return false;

  const validDates = [];
  for (const raw of newLessonDates) {
    const dayVn = toVietnamDate(raw);
    if (!dayVn) continue;
    const fromClaim = diffCalendarDays(claimDayVn, dayVn);
    const toNow = diffCalendarDays(dayVn, nowDayVn);
    if (fromClaim < 0 || fromClaim > INVITE_REWARDS.WINDOW_DAYS || toNow < 0) continue;
    validDates.push(dayVn);
  }

  if (validDates.length < INVITE_REWARDS.MIN_NEW_LESSONS) {
    return false;
  }

  const distinctDays = new Set(validDates);
  return distinctDays.size >= INVITE_REWARDS.MIN_DISTINCT_DAYS;
}

/**
 * BR-03: Trả về danh sách các mốc thưởng mới đạt được nhưng chưa từng được cấp.
 *
 * @param {number} count Tổng số thiệp đã học thật trọn đời (`rewarded_sender = 1`)
 * @param {Iterable<number|string>} [alreadyGranted] Danh sách mốc đã cấp (vd: [3, 5] hoặc ['3'])
 * @returns {Array<{ count: number, tickets: number, titleId: string|null, titleVi: string|null }>}
 */
export function milestonesReached(count, alreadyGranted = []) {
  const n = Math.max(0, Math.floor(Number(count) || 0));
  const grantedSet = new Set();
  for (const item of alreadyGranted || []) {
    const num = Number(item);
    if (Number.isFinite(num)) grantedSet.add(num);
  }
  return INVITE_REWARDS.MILESTONES.filter((m) => n >= m.count && !grantedSet.has(m.count));
}

/**
 * Trả về mốc kế tiếp chưa đạt (dùng cho thanh tiến độ trong InviteSheet, FR-RWD-06).
 */
export function getNextMilestone(activatedCount) {
  const n = Math.max(0, Math.floor(Number(activatedCount) || 0));
  return INVITE_REWARDS.MILESTONES.find((m) => m.count > n) || null;
}

/**
 * Chuẩn hoá cặp user_id cho bảng friendships (luôn đảm bảo user_low < user_high).
 */
export function normalizeFriendPair(userIdA, userIdB) {
  const a = Number(userIdA);
  const b = Number(userIdB);
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0 || a === b) {
    return null;
  }
  return a < b ? { userLow: a, userHigh: b } : { userLow: b, userHigh: a };
}

/**
 * Kiểm tra định dạng mã bạn bè 8 ký tự (FR-FRD-02).
 */
export function normalizeFriendCode(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidFriendCode(raw) {
  const code = normalizeFriendCode(raw);
  if (code.length !== FRIEND_LIMITS.CODE_LENGTH) return false;
  for (const ch of code) {
    if (!FRIEND_LIMITS.CODE_ALPHABET.includes(ch)) return false;
  }
  return true;
}

/**
 * Chuẩn hoá và kiểm tra định dạng email hợp lệ cho tìm kiếm khớp chính xác.
 */
export function normalizeEmail(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw) {
  const email = normalizeEmail(raw);
  if (!email || email.length > 191) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * Phân tích nội dung quét được từ mã QR (link thiệp /i/:code, link /friends?add=:code,
 * mã bạn bè 8 ký tự thuần, hoặc email).
 */
export function parseQrPayload(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return null;

  // Thử parse URL (ví dụ https://cowdi.net/friends?add=ABCD2345 hoặc https://cowdi.net/i/ABCD2345)
  try {
    const url = new URL(text);
    const inviteMatch = url.pathname.match(/^\/i\/([A-Za-z0-9]{4,12})\/?$/);
    if (inviteMatch) {
      return { type: 'invite', code: inviteMatch[1].toUpperCase() };
    }
    const addCode = url.searchParams.get('add');
    if (addCode && isValidFriendCode(addCode)) {
      return { type: 'friend_code', code: normalizeFriendCode(addCode) };
    }
  } catch {
    // Không phải URL đầy đủ — kiểm tra path tương đối hoặc chuỗi mã/email
  }

  const relInvite = text.match(/^\/?i\/([A-Za-z0-9]{4,12})\/?$/);
  if (relInvite) {
    return { type: 'invite', code: relInvite[1].toUpperCase() };
  }

  const relAdd = text.match(/[?&]add=([A-Za-z0-9]{8})/i);
  if (relAdd && isValidFriendCode(relAdd[1])) {
    return { type: 'friend_code', code: normalizeFriendCode(relAdd[1]) };
  }

  if (isValidFriendCode(text)) {
    return { type: 'friend_code', code: normalizeFriendCode(text) };
  }

  if (isValidEmail(text)) {
    return { type: 'email', email: normalizeEmail(text) };
  }

  return null;
}

/**
 * Kiểm tra & chuẩn hoá biệt danh 2–20 ký tự, lọc từ cấm cơ bản (FR-FRD-05).
 */
export function validateNickname(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Vui lòng nhập biệt danh.' };
  }
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (cleaned.length < FRIEND_LIMITS.NICKNAME_MIN || cleaned.length > FRIEND_LIMITS.NICKNAME_MAX) {
    return {
      ok: false,
      error: `Biệt danh cần từ ${FRIEND_LIMITS.NICKNAME_MIN} đến ${FRIEND_LIMITS.NICKNAME_MAX} ký tự.`,
    };
  }
  // Không chứa thẻ HTML hoặc ký tự điều khiển
  if (/[<>`"'\\]/.test(cleaned) || /[\u0000-\u001F\u007F]/.test(cleaned)) {
    return { ok: false, error: 'Biệt danh chứa ký tự không hợp lệ.' };
  }

  const lower = cleaned.toLowerCase();
  const tokens = lower.split(/[\s._-]+/).filter(Boolean);
  for (const bad of FORBIDDEN_NICKNAME_WORDS) {
    if (bad.includes(' ')) {
      if (lower.includes(bad)) {
        return { ok: false, error: 'Biệt danh chứa từ không phù hợp. Hãy chọn tên khác nhé!' };
      }
    } else if (tokens.includes(bad) || (bad.length >= 4 && lower.includes(bad))) {
      return { ok: false, error: 'Biệt danh chứa từ không phù hợp. Hãy chọn tên khác nhé!' };
    }
  }

  return { ok: true, value: cleaned };
}

/**
 * Tính số vé được giải ngân ngay trong tháng này so với phần phải dời sang tháng sau (BR-04).
 */
export function splitMonthlyTicketAllowance(pendingCount, alreadyGrantedThisMonth) {
  const pending = Math.max(0, Math.floor(Number(pendingCount) || 0));
  const used = Math.max(0, Math.floor(Number(alreadyGrantedThisMonth) || 0));
  const remainingQuota = Math.max(0, INVITE_REWARDS.TICKETS_MAX_PER_MONTH - used);
  const grantNow = Math.min(pending, remainingQuota);
  const deferred = pending - grantNow;
  return { grantNow, deferred, remainingQuota };
}
