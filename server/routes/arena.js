// ============================================================
// Cowdi English — Arena v2 Routes (GĐ5 · D4, D15, D16, D17)
// ============================================================

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  ensureArenaProfile,
  findArenaMatch,
  submitArenaMatch,
  claimWeeklyChest,
  sendArenaClover,
  getArenaLeaderboard,
  generateAiBotOpponent,
} from '../utils/arena-manager.js';
import { getWallet } from '../utils/wallet.js';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/arena/profile
 * Lấy hồ sơ Đấu trường: số vé, LP, bậc hiện tại, số trận thắng tuần, rương tuần đã nhận.
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const profile = await ensureArenaProfile(req.user.id);
    const wallet = await getWallet(req.user.id);
    res.json({
      profile,
      wallet,
    });
  } catch (err) {
    console.error('GET /api/arena/profile error:', err);
    res.status(500).json({ error: 'Không thể tải thông tin Đấu trường.' });
  }
});

/**
 * POST /api/arena/matchmake
 * Ghép trận Đấu trường v2 theo cấp tiến hoá (±1) và LP (±150).
 * Nếu không có người phù hợp hoặc practice = true, trả về AI bot cùng cấp.
 */
router.post('/matchmake', requireAuth, async (req, res) => {
  try {
    const { petSnapshot, practice } = req.body;
    let match = null;

    if (practice) {
      match = generateAiBotOpponent(petSnapshot);
    } else {
      match = await findArenaMatch(req.user.id, petSnapshot);
    }

    res.json({ match });
  } catch (err) {
    console.error('POST /api/arena/matchmake error:', err);
    res.status(500).json({ error: 'Không thể tìm đối thủ.' });
  }
});

/**
 * POST /api/arena/submit
 * Gửi kết quả thi đấu Đấu trường v2.
 * Server chạy engine mô phỏng v0.2, trừ vé, cấp LP, thưởng Sữa qua ledger.
 */
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const {
      opponentId,
      isBot,
      hasTicket,
      quizData,
      challengerAnswers,
      challengerTimes,
      challengerPetSnap,
      opponentPetSnap,
    } = req.body;

    if (!Array.isArray(quizData) || quizData.length < 5) {
      return res.status(400).json({ error: 'Dữ liệu câu hỏi trận đấu không hợp lệ.' });
    }

    const result = await submitArenaMatch({
      userId: req.user.id,
      opponentId: opponentId ? Number(opponentId) : null,
      isBot: Boolean(isBot),
      hasTicket: Boolean(hasTicket),
      quizData,
      challengerAnswers,
      challengerTimes,
      challengerPetSnap,
      opponentPetSnap,
    });

    res.json(result);
  } catch (err) {
    console.error('POST /api/arena/submit error:', err);
    res.status(500).json({ error: err.message || 'Lỗi xử lý kết quả trận đấu.' });
  }
});

/**
 * POST /api/arena/claim-chest
 * Mở rương tuần theo số trận thắng có vé.
 */
router.post('/claim-chest', requireAuth, async (req, res) => {
  try {
    const { chestId } = req.body;
    if (!chestId) {
      return res.status(400).json({ error: 'Thiếu chestId.' });
    }

    const result = await claimWeeklyChest(req.user.id, chestId);
    res.json(result);
  } catch (err) {
    console.error('POST /api/arena/claim-chest error:', err);
    res.status(400).json({ error: err.message || 'Không thể nhận rương.' });
  }
});

/**
 * POST /api/arena/clover
 * Tặng cỏ ba lá cho đối thủ sau trận đấu.
 */
router.post('/clover', requireAuth, async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) {
      return res.status(400).json({ error: 'Thiếu receiverId.' });
    }

    const result = await sendArenaClover(req.user.id, Number(receiverId));
    res.json(result);
  } catch (err) {
    console.error('POST /api/arena/clover error:', err);
    res.status(400).json({ error: err.message || 'Không thể tặng cỏ ba lá.' });
  }
});

/**
 * GET /api/arena/leaderboard
 * Bảng xếp hạng Đấu trường theo LP.
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const leaderboard = await getArenaLeaderboard(limit);
    res.json({ leaderboard });
  } catch (err) {
    console.error('GET /api/arena/leaderboard error:', err);
    res.status(500).json({ error: 'Không thể tải bảng xếp hạng.' });
  }
});

export default router;
