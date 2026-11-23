// ============================================================
// Cowdi English — Shop & Keep Rhythm API Routes (Giai đoạn 3)
// ============================================================

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getUserStreakState,
  buyFreeze,
  buyReturnTicket,
  signContract,
  buyClock,
  setClockHour,
} from '../utils/streak-manager.js';
import { getWallet } from '../utils/wallet.js';

const router = express.Router();

function getTz(req) {
  return req.headers['x-timezone'] || req.body?.timezone || 'Asia/Ho_Chi_Minh';
}

// ── GET /api/shop/streak-state – Trạng thái Giữ nhịp & Ví ────────────────────
router.get('/streak-state', requireAuth, async (req, res) => {
  try {
    const tz = getTz(req);
    const streakState = await getUserStreakState(req.user.id, tz);
    const wallet = await getWallet(req.user.id);
    res.json({ ok: true, streakState, wallet });
  } catch (err) {
    console.error('GET /api/shop/streak-state error:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy trạng thái Giữ nhịp.' });
  }
});

// ── POST /api/shop/buy-freeze – Mua Khăn giữ lửa (400 Sữa) ─────────────────
router.post('/buy-freeze', requireAuth, async (req, res) => {
  try {
    const tz = getTz(req);
    const result = await buyFreeze(req.user.id, tz);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/shop/buy-freeze error:', err);
    res.status(500).json({ error: 'Lỗi server khi mua Khăn giữ lửa.' });
  }
});

// ── POST /api/shop/buy-return-ticket – Mua Vé quay lại (300 Sữa) ────────────
router.post('/buy-return-ticket', requireAuth, async (req, res) => {
  try {
    const tz = getTz(req);
    const result = await buyReturnTicket(req.user.id, tz);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/shop/buy-return-ticket error:', err);
    res.status(500).json({ error: 'Lỗi server khi mua Vé quay lại.' });
  }
});

// ── POST /api/shop/sign-contract – Ký Khế ước 7 ngày ────────────────────────
router.post('/sign-contract', requireAuth, async (req, res) => {
  try {
    const { tier } = req.body || {};
    const tz = getTz(req);
    const result = await signContract(req.user.id, tier, tz);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/shop/sign-contract error:', err);
    res.status(500).json({ error: 'Lỗi server khi ký Khế ước 7 ngày.' });
  }
});

// ── POST /api/shop/buy-clock – Mua Đồng hồ Cowdi (1000 Sữa) ────────────────
router.post('/buy-clock', requireAuth, async (req, res) => {
  try {
    const { hour, minute } = req.body || {};
    const tz = getTz(req);
    const result = await buyClock(req.user.id, { hour: Number(hour) || 20, minute: Number(minute) || 0 }, tz);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/shop/buy-clock error:', err);
    res.status(500).json({ error: 'Lỗi server khi mua Đồng hồ Cowdi.' });
  }
});

// ── POST /api/shop/set-clock – Đổi giờ học của Đồng hồ ──────────────────────
router.post('/set-clock', requireAuth, async (req, res) => {
  try {
    const { hour, minute } = req.body || {};
    const tz = getTz(req);
    const result = await setClockHour(req.user.id, { hour: Number(hour) || 20, minute: Number(minute) || 0 }, tz);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error('POST /api/shop/set-clock error:', err);
    res.status(500).json({ error: 'Lỗi server khi đổi giờ học.' });
  }
});

export default router;
