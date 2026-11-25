// ============================================================
// Cowdi English — Friends API Router (SRS-FRIENDS v1.1 §7)
// Mount tại /api/friends trong server/index.js
// ============================================================

import express from 'express';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createHourlyRateLimiter,
  getFriendsOverview,
  getFriendPetProfile,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  reportUser,
} from '../utils/friends-manager.js';

export function createFriendsRouter({
  db = pool,
  authMiddleware = requireAuth,
  rateLimiter = createHourlyRateLimiter(),
} = {}) {
  const router = express.Router();

  // ── GET /api/friends — danh sách bạn bè, lời mời, đã chặn ────────────────
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const overview = await getFriendsOverview(req.user.id, db);
      res.json(overview);
    } catch (err) {
      console.error('GET /api/friends error:', err);
      res.status(500).json({ error: 'SERVER_ERROR', messageVi: 'Lỗi server.' });
    }
  });

  // ── POST /api/friends/requests — gửi lời mời kết bạn bằng mã/QR ──────────
  router.post('/requests', authMiddleware, async (req, res) => {
    try {
      const { code, source } = req.body || {};
      const result = await sendFriendRequest(req.user.id, code, {
        source: source === 'qr' ? 'qr' : 'code',
        rateLimiter,
        db,
      });
      if (!result.ok) {
        return res.status(result.status || 400).json({
          error: result.error,
          messageVi: result.messageVi,
        });
      }
      res.json(result);
    } catch (err) {
      console.error('POST /api/friends/requests error:', err);
      res.status(500).json({ error: 'SERVER_ERROR', messageVi: 'Lỗi server.' });
    }
  });

  // ── POST /api/friends/requests/:userId/accept ────────────────────────────
  router.post('/requests/:userId/accept', authMiddleware, async (req, res) => {
    try {
      const otherId = Number(req.params.userId);
      const result = await acceptFriendRequest(req.user.id, otherId, db);
      if (!result.ok) {
        return res.status(result.status || 400).json({ error: result.error, messageVi: result.messageVi });
      }
      res.json(result);
    } catch (err) {
      console.error('POST /api/friends/requests/:userId/accept error:', err);
      res.status(500).json({ error: 'SERVER_ERROR', messageVi: 'Lỗi server.' });
    }
  });

  // ── POST /api/friends/requests/:userId/decline ───────────────────────────
  router.post('/requests/:userId/decline', authMiddleware, async (req, res) => {
    try {
      const otherId = Number(req.params.userId);
      const result = await declineFriendRequest(req.user.id, otherId, db);
      if (!result.ok) {
        return res.status(result.status || 400).json({ error: result.error, messageVi: result.messageVi });
      }
      res.json(result);
    } catch (err) {
      console.error('POST /api/friends/requests/:userId/decline error:', err);
      res.status(500).json({ error: 'SERVER_ERROR', messageVi: 'Lỗi server.' });
    }
  });

  // ── GET /api/friends/:userId/pet — thăm pet bạn bè (FR-VIS-01, BR-08) ───
  router.get('/:userId/pet', authMiddleware, async (req, res) => {
    try {
      const otherId = Number(req.params.userId);
      const result = await getFriendPetProfile(req.user.id, otherId, db);
      if (!result.ok) {
        return res.status(result.status || 400).json({ error: result.error, messageVi: result.messageVi });
      }
      res.json(result.profile);
    } catch (err) {
      console.error('GET /api/friends/:userId/pet error:', err);
      res.status(500).json({ error: 'SERVER_ERROR', messageVi: 'Lỗi server.' });
    }
  });

  // ── DELETE /api/friends/:userId — huỷ kết bạn ────────────────────────────
  router.delete('/:userId', authMiddleware, async (req, res) => {
    try {
      const otherId = Number(req.params.userId);
      const result = await removeFriend(req.user.id, otherId, db);
      if (!result.ok) {
        return res.status(result.status || 400).json({ error: result.error, messageVi: result.messageVi });
      }
      res.json(result);
    } catch (err) {
      console.error('DELETE /api/friends/:userId error:', err);
      res.status(500).json({ error: 'SERVER_ERROR', messageVi: 'Lỗi server.' });
    }
  });

  // ── POST /api/friends/:userId/block — chặn ───────────────────────────────
  router.post('/:userId/block', authMiddleware, async (req, res) => {
    try {
      const otherId = Number(req.params.userId);
      const result = await blockUser(req.user.id, otherId, db);
      if (!result.ok) {
        return res.status(result.status || 400).json({ error: result.error, messageVi: result.messageVi });
      }
      res.json(result);
    } catch (err) {
      console.error('POST /api/friends/:userId/block error:', err);
      res.status(500).json({ error: 'SERVER_ERROR', messageVi: 'Lỗi server.' });
    }
  });

  // ── DELETE /api/friends/:userId/block — bỏ chặn ──────────────────────────
  router.delete('/:userId/block', authMiddleware, async (req, res) => {
    try {
      const otherId = Number(req.params.userId);
      const result = await unblockUser(req.user.id, otherId, db);
      if (!result.ok) {
        return res.status(result.status || 400).json({ error: result.error, messageVi: result.messageVi });
      }
      res.json(result);
    } catch (err) {
      console.error('DELETE /api/friends/:userId/block error:', err);
      res.status(500).json({ error: 'SERVER_ERROR', messageVi: 'Lỗi server.' });
    }
  });

  // ── POST /api/friends/:userId/report — báo cáo ───────────────────────────
  router.post('/:userId/report', authMiddleware, async (req, res) => {
    try {
      const otherId = Number(req.params.userId);
      const result = await reportUser(req.user.id, otherId, req.body?.reason, db);
      if (!result.ok) {
        return res.status(result.status || 400).json({ error: result.error, messageVi: result.messageVi });
      }
      res.json(result);
    } catch (err) {
      console.error('POST /api/friends/:userId/report error:', err);
      res.status(500).json({ error: 'SERVER_ERROR', messageVi: 'Lỗi server.' });
    }
  });

  return router;
}

export default createFriendsRouter();
