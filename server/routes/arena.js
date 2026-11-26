// ============================================================
// Cowdi English — Arena v2 Routes (GĐ5 · D4, D15, D16, D17)
// ============================================================

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  ensureArenaProfile,
  findArenaMatch,
  leaveArenaQueue,
  submitArenaMatch,
  claimWeeklyChest,
  sendArenaClover,
  getArenaLeaderboard,
  generateAiBotOpponent,
  createFriendRoom,
  getIncomingFriendRooms,
  getFriendRoomState,
  respondFriendRoom,
  cancelFriendRoom,
  forfeitFriendRoom,
  submitFriendRoomStep,
  submitFriendRoomAnswers,
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
 * Ghép trận Đấu trường v2:
 * - Ghép cặp ngẫu nhiên (chờ 10–15s tìm người chơi thực; hết giờ fallback Ghost Bot mang tên người chơi).
 * - Hoặc mời bạn trực tiếp (friendId).
 * - Hoặc luyện tập AI không thưởng (practice = true).
 */
router.post('/matchmake', requireAuth, async (req, res) => {
  try {
    const { petSnapshot, practice, allowBotFallback, friendId, quizData } = req.body || {};

    if (practice) {
      return res.json({
        status: 'matched',
        match: generateAiBotOpponent(petSnapshot),
      });
    }

    const result = await findArenaMatch(req.user.id, petSnapshot, {
      allowBotFallback: allowBotFallback !== undefined ? Boolean(allowBotFallback) : true,
      friendId: friendId ? Number(friendId) : null,
      quizData: Array.isArray(quizData) ? quizData : null,
    });

    res.json(result);
  } catch (err) {
    console.error('POST /api/arena/matchmake error:', err);
    res.status(500).json({ error: err.message || 'Không thể tìm đối thủ.' });
  }
});

/**
 * POST /api/arena/matchmake/cancel
 * Rời hàng đợi ghép cặp Đấu trường.
 */
router.post('/matchmake/cancel', requireAuth, (req, res) => {
  leaveArenaQueue(req.user.id);
  res.json({ ok: true });
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

// ── Phòng mời bạn đồng bộ 2 người ────────────────────────────────────────

router.post('/friend-room', requireAuth, async (req, res) => {
  try {
    const { friendId, hasTicket, quizData, petSnapshot } = req.body || {};
    const room = await createFriendRoom({
      userId: req.user.id,
      friendId,
      hasTicket: Boolean(hasTicket),
      quizData,
      petSnapshot,
    });
    res.json({ room });
  } catch (err) {
    console.error('POST /api/arena/friend-room error:', err);
    res.status(400).json({ error: err.message || 'Không thể tạo phòng mời bạn.' });
  }
});

router.get('/friend-room/incoming', requireAuth, (req, res) => {
  try {
    const rooms = getIncomingFriendRooms(req.user.id);
    res.json({ rooms });
  } catch (err) {
    console.error('GET /api/arena/friend-room/incoming error:', err);
    res.status(500).json({ error: 'Không thể tải lời mời thách đấu.' });
  }
});

router.get('/friend-room/:roomId', requireAuth, (req, res) => {
  try {
    const room = getFriendRoomState(req.params.roomId, req.user.id);
    res.json({ room });
  } catch (err) {
    res.status(404).json({ error: err.message || 'Không tìm thấy phòng đấu.' });
  }
});

router.post('/friend-room/:roomId/respond', requireAuth, async (req, res) => {
  try {
    const { accept, petSnapshot } = req.body || {};
    const room = await respondFriendRoom(req.params.roomId, req.user.id, {
      accept: Boolean(accept),
      petSnapshot,
    });
    res.json({ room });
  } catch (err) {
    console.error('POST /api/arena/friend-room/respond error:', err);
    res.status(400).json({ error: err.message || 'Không thể phản hồi lời mời.' });
  }
});

router.post('/friend-room/:roomId/cancel', requireAuth, (req, res) => {
  try {
    const out = cancelFriendRoom(req.params.roomId, req.user.id);
    res.json(out);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Không thể huỷ phòng.' });
  }
});

router.post('/friend-room/:roomId/forfeit', requireAuth, async (req, res) => {
  try {
    const room = await forfeitFriendRoom(req.params.roomId, req.user.id);
    res.json({ room });
  } catch (err) {
    console.error('POST /api/arena/friend-room/forfeit error:', err);
    res.status(400).json({ error: err.message || 'Không thể xử lý rời trận.' });
  }
});

router.post('/friend-room/:roomId/answer', requireAuth, (req, res) => {
  try {
    const { questionIndex, correct, timeMs } = req.body || {};
    const room = submitFriendRoomStep(req.params.roomId, req.user.id, {
      questionIndex,
      correct,
      timeMs,
    });
    res.json({ room });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Không thể đồng bộ đáp án câu.' });
  }
});

router.post('/friend-room/:roomId/submit', requireAuth, async (req, res) => {
  try {
    const { answers, times } = req.body || {};
    const out = await submitFriendRoomAnswers(req.params.roomId, req.user.id, { answers, times });
    res.json(out);
  } catch (err) {
    console.error('POST /api/arena/friend-room/submit error:', err);
    res.status(400).json({ error: err.message || 'Không thể nộp kết quả phòng đấu.' });
  }
});

export default router;
