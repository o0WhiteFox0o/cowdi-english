import express from 'express';
import crypto from 'crypto';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { INVITE_REWARDS, FRIEND_LIMITS } from '../../shared/game-config.js';
import {
  computeDeviceHash,
  getClientIp,
  isSameDeviceOrIpWithin24h,
  getInviteStats,
} from '../utils/invite-rewards.js';
import { createAutoFriendshipFromInvite } from '../utils/friends-manager.js';

const EXPIRY_DAYS  = INVITE_REWARDS.EXPIRY_DAYS;
const DAILY_LIMIT  = INVITE_REWARDS.DAILY_INVITE_LIMIT;
const WEEKLY_LIMIT = INVITE_REWARDS.WEEKLY_INVITE_LIMIT;

// ── Helper: tạo mã ngẫu nhiên 8 ký tự (A-Z, 2-9 — bỏ ký tự khó đọc) ───────
export function generateCode(length = FRIEND_LIMITS.CODE_LENGTH) {
  const ALPHABET = FRIEND_LIMITS.CODE_ALPHABET;
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function createInvitesRouter({ db = pool, authMiddleware = requireAuth, onClaimed } = {}) {
  const router = express.Router();

  // ── GET /api/invites/mine/list — lịch sử thiệp đã gửi ────────────────────
  router.get('/mine/list', authMiddleware, async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT code, pet_species, message,
                (claimed_by IS NOT NULL) AS claimed,
                claimed_at, rewarded_sender, rewarded_at, expires_at, created_at
           FROM invites
          WHERE sender_id = ?
          ORDER BY created_at DESC LIMIT 50`,
        [req.user.id]
      );
      res.json(rows);
    } catch (err) {
      console.error('GET /api/invites/mine/list error:', err);
      res.status(500).json({ error: 'Lỗi server.' });
    }
  });

  // ── GET /api/invites/mine/stats — thống kê mời bạn & mốc thưởng (FR-RWD-06)
  router.get('/mine/stats', authMiddleware, async (req, res) => {
    try {
      const stats = await getInviteStats(req.user.id, new Date(), db);
      res.json(stats);
    } catch (err) {
      console.error('GET /api/invites/mine/stats error:', err);
      res.status(500).json({ error: 'Lỗi server.' });
    }
  });

  // ── POST /api/invites — tạo thiệp mời mới ────────────────────────────────
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const { pet_species = 'cowdi', message = null, deviceId = '' } = req.body || {};
      const safePet = String(pet_species).slice(0, 32);
      const safeMsg = message ? String(message).slice(0, 280) : null;

      // Rate limit (BR-05: 5/ngày, 20/tuần)
      const [[dayRow]] = await db.execute(
        'SELECT COUNT(*) AS n FROM invites WHERE sender_id = ? AND created_at >= (NOW() - INTERVAL 1 DAY)',
        [req.user.id]
      );
      if ((dayRow?.n || 0) >= DAILY_LIMIT) {
        return res.status(429).json({ error: `Bạn đã gửi đủ ${DAILY_LIMIT} thiệp hôm nay. Thử lại sau nha!` });
      }
      const [[weekRow]] = await db.execute(
        'SELECT COUNT(*) AS n FROM invites WHERE sender_id = ? AND created_at >= (NOW() - INTERVAL 7 DAY)',
        [req.user.id]
      );
      if ((weekRow?.n || 0) >= WEEKLY_LIMIT) {
        return res.status(429).json({ error: `Bạn đã gửi đủ ${WEEKLY_LIMIT} thiệp tuần này.` });
      }

      // FR-FRD-05: dùng biệt danh cho sender_name (không lộ tên thật Google & ảnh Google)
      const [[user]] = await db.execute(
        'SELECT nickname FROM users WHERE id = ?',
        [req.user.id]
      );
      if (!user?.nickname) {
        return res.status(400).json({
          code: 'NICKNAME_REQUIRED',
          error: 'Hãy đặt biệt danh trước khi tạo thiệp mời nhé!',
        });
      }

      const creatorIp = getClientIp(req);
      const clientDeviceId = req.headers['x-device-id'] || deviceId || '';
      const creatorDeviceHash = computeDeviceHash(req.headers['user-agent'], clientDeviceId);

      // Sinh mã, đảm bảo unique (thử tối đa 5 lần)
      let code = null;
      for (let i = 0; i < 5; i++) {
        const candidate = generateCode();
        const [[exists]] = await db.execute('SELECT 1 AS x FROM invites WHERE code = ?', [candidate]);
        if (!exists) { code = candidate; break; }
      }
      if (!code) return res.status(500).json({ error: 'Không tạo được mã. Thử lại.' });

      await db.execute(
        `INSERT INTO invites
           (code, sender_id, sender_name, sender_avatar, pet_species, message,
            creator_ip, creator_device_hash, expires_at)
         VALUES (?, ?, ?, NULL, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
        [code, req.user.id, user.nickname, safePet, safeMsg, creatorIp, creatorDeviceHash, EXPIRY_DAYS]
      );

      const [[row]] = await db.execute(
        'SELECT code, expires_at FROM invites WHERE code = ?',
        [code]
      );

      // NFR-06: ghi sự kiện invite_shared
      db.execute(
        `INSERT INTO app_events (user_id, name, props) VALUES (?, 'invite_shared', ?)`,
        [req.user.id, JSON.stringify({ code, petSpecies: safePet })]
      ).catch(() => {});

      res.json({
        code,
        url: `/i/${code}`,
        expires_at: row.expires_at,
      });
    } catch (err) {
      console.error('POST /api/invites error:', err);
      res.status(500).json({ error: 'Lỗi server.' });
    }
  });

  // ── GET /api/invites/:code — đọc thông tin thiệp (không cần auth) ────────
  router.get('/:code', async (req, res) => {
    try {
      const code = String(req.params.code || '').toUpperCase().slice(0, 12);
      const [[row]] = await db.execute(
        `SELECT i.code, i.sender_name, i.pet_species, i.message,
                i.claimed_by, i.claimed_at, i.expires_at, i.created_at,
                u.nickname AS sender_nickname
           FROM invites i
           LEFT JOIN users u ON u.id = i.sender_id
          WHERE i.code = ?`,
        [code]
      );
      if (!row) return res.status(404).json({ error: 'Thiệp không tồn tại hoặc đã hết hạn.' });

      const expired = new Date(row.expires_at) < new Date();
      // NFR-03: chỉ trả biệt danh, không trả ảnh Google / email / IP
      res.json({
        code: row.code,
        sender_name: row.sender_nickname || row.sender_name || 'Một người bạn',
        pet_species: row.pet_species,
        message: row.message,
        claimed: !!row.claimed_by,
        claimed_at: row.claimed_at,
        expires_at: row.expires_at,
        created_at: row.created_at,
        expired,
      });
    } catch (err) {
      console.error('GET /api/invites/:code error:', err);
      res.status(500).json({ error: 'Lỗi server.' });
    }
  });

  // ── POST /api/invites/:code/claim — user đã đăng nhập nhận thiệp ─────────
  router.post('/:code/claim', authMiddleware, async (req, res) => {
    try {
      const code = String(req.params.code || '').toUpperCase().slice(0, 12);
      const [[row]] = await db.execute(
        `SELECT sender_id, claimed_by, expires_at, created_at,
                creator_ip, creator_device_hash
           FROM invites
          WHERE code = ?`,
        [code]
      );
      if (!row) return res.status(404).json({ error: 'Thiệp không tồn tại.' });
      if (new Date(row.expires_at) < new Date()) return res.status(410).json({ error: 'Thiệp đã hết hạn.' });
      if (row.sender_id === req.user.id) return res.status(400).json({ error: 'Bạn không thể tự nhận thiệp của mình.' });
      if (row.claimed_by && row.claimed_by !== req.user.id) {
        return res.status(409).json({ error: 'Thiệp đã được người khác nhận.' });
      }
      if (row.claimed_by === req.user.id) {
        return res.json({ ok: true, already: true });
      }

      // BR-05: Thiệp chỉ dành cho người mới (chưa từng nhận thiệp khác & chưa hoàn thành bài học nào)
      const [[prevClaim]] = await db.execute(
        'SELECT code FROM invites WHERE claimed_by = ? LIMIT 1',
        [req.user.id]
      );
      if (prevClaim) {
        return res.status(409).json({ error: 'Tài khoản này đã từng nhận thiệp mời rồi.' });
      }

      const [[prog]] = await db.execute(
        'SELECT lessons_completed, completed_lessons FROM user_progress WHERE user_id = ?',
        [req.user.id]
      );
      let completedCount = Number(prog?.lessons_completed || 0);
      if (completedCount === 0 && prog?.completed_lessons) {
        try {
          const parsed = typeof prog.completed_lessons === 'string'
            ? JSON.parse(prog.completed_lessons)
            : prog.completed_lessons;
          if (Array.isArray(parsed)) completedCount = parsed.length;
        } catch {}
      }
      if (completedCount > 0) {
        return res.status(409).json({
          error: 'Thiệp mời chỉ dành cho tài khoản mới. Bạn có thể kết bạn bằng mã bạn bè nhé!',
        });
      }

      // FR-RWD-01: lưu IP & device_hash, gắn flagged = 1 nếu trùng trong 24h
      const claimIp = getClientIp(req);
      const clientDeviceId = req.headers['x-device-id'] || req.body?.deviceId || '';
      const claimDeviceHash = computeDeviceHash(req.headers['user-agent'], clientDeviceId);
      const flagged = isSameDeviceOrIpWithin24h({
        creatorIp: row.creator_ip,
        creatorDeviceHash: row.creator_device_hash,
        createdAt: row.created_at,
        claimIp,
        claimDeviceHash,
      }) ? 1 : 0;

      const [upd] = await db.execute(
        `UPDATE invites
            SET claimed_by = ?, claimed_at = NOW(),
                claim_ip = ?, claim_device_hash = ?, flagged = ?
          WHERE code = ? AND claimed_by IS NULL`,
        [req.user.id, claimIp, claimDeviceHash, flagged, code]
      );
      if (!upd || upd.affectedRows !== 1) {
        return res.status(409).json({ error: 'Thiệp đã được người khác nhận.' });
      }

      // FR-FRD-01 & FR-RWD-03: Nhận thiệp thành công -> tự tạo quan hệ accepted (kể cả khi flagged)
      await createAutoFriendshipFromInvite(row.sender_id, req.user.id, db);

      if (typeof onClaimed === 'function') {
        await onClaimed({ senderId: row.sender_id, receiverId: req.user.id, code, flagged: Boolean(flagged), db });
      }

      // NFR-06: ghi sự kiện invite_claimed
      db.execute(
        `INSERT INTO app_events (user_id, name, props) VALUES (?, 'invite_claimed', ?)`,
        [req.user.id, JSON.stringify({ code, flagged: Boolean(flagged) })]
      ).catch(() => {});

      res.json({ ok: true, flagged: Boolean(flagged) });
    } catch (err) {
      console.error('POST /api/invites/:code/claim error:', err);
      res.status(500).json({ error: 'Lỗi server.' });
    }
  });

  return router;
}

export default createInvitesRouter();
