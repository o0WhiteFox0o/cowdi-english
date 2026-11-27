// ============================================================
// Cowdi English — Gacha API Routes (GĐ6–GĐ7 · D5, D7)
// ============================================================

import express from 'express';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import {
  getGachaInfo,
  buyGachaTicket,
  pullStandardGacha,
} from '../utils/gacha-manager.js';

export function createGachaRouter({ db = pool, authMiddleware = requireAuth } = {}) {
  const router = express.Router();

  // GET /api/gacha/info
  router.get('/info', authMiddleware, async (req, res) => {
    try {
      const info = await getGachaInfo(req.user.id, db);
      res.json(info);
    } catch (err) {
      console.error('GET /api/gacha/info error:', err);
      res.status(500).json({ error: 'Không tải được thông tin Gacha.' });
    }
  });

  // POST /api/gacha/buy-ticket (50 Gem -> 1 vé)
  router.post('/buy-ticket', authMiddleware, async (req, res) => {
    try {
      const result = await buyGachaTicket(req.user.id, db);
      if (!result.ok) {
        return res.status(400).json({ error: result.error, wallet: result.wallet });
      }
      res.json(result);
    } catch (err) {
      console.error('POST /api/gacha/buy-ticket error:', err);
      res.status(500).json({ error: 'Không mua được vé Gacha.' });
    }
  });

  // POST /api/gacha/pull (1 vé -> quay bể thường 67/22/8/3)
  router.post('/pull', authMiddleware, async (req, res) => {
    try {
      const result = await pullStandardGacha(req.user.id, db);
      if (!result.ok) {
        return res.status(400).json({ error: result.error, wallet: result.wallet });
      }
      res.json(result);
    } catch (err) {
      console.error('POST /api/gacha/pull error:', err);
      res.status(500).json({ error: 'Lỗi khi quay Gacha.' });
    }
  });

  return router;
}

export default createGachaRouter();
