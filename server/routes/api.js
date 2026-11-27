import express from 'express';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { sendPushToUser, getPublicKey, isPushReady } from '../config/push.js';
import { pickPetIcon } from '../utils/pet-icon.js';
import { PET_BATTLE_DATA } from '../../shared/game-config.js';
import { computePowerScore, canEvolve, simulateBattle, canMatch, resolveSnapshot } from '../../shared/battle-engine.js';
import {
  getWallet,
  grantLessonAndUnitRewards,
  exchangeStone,
  combineShards,
  mergeLessonScores,
  sanitizeLearnerGroup,
  sanitizeActivePath,
  isValidLessonId,
} from '../utils/wallet.js';
import { grantArenaTickets } from '../utils/arena-manager.js';
import { getUserStreakState, recordActivity } from '../utils/streak-manager.js';
import { processInviteActivationReward, releaseDeferredTicketsForMonth } from '../utils/invite-rewards.js';
import { ensureFriendCode, getFriendshipStatus, computeDuelLeaguePointDelta } from '../utils/friends-manager.js';
import { validateNickname } from '../../shared/friends.js';

const router = express.Router();

// ── GET /api/me – thông tin user hiện tại ─────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [[user]] = await pool.execute(
      'SELECT id, email, display_name, avatar_url, nickname, friend_code, created_at, last_seen_at, is_admin FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    res.json({ ...user, isAdmin: Boolean(user.is_admin) });
  } catch (err) {
    console.error('GET /api/me error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/me/friend-code – lấy hoặc cấp lười mã bạn bè (FR-FRD-02) ───────
router.get('/me/friend-code', requireAuth, async (req, res) => {
  try {
    const info = await ensureFriendCode(req.user.id);
    if (!info) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    res.json(info);
  } catch (err) {
    console.error('GET /api/me/friend-code error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── PUT /api/me/nickname – đặt/đổi biệt danh (FR-FRD-05) ────────────────────
router.put('/me/nickname', requireAuth, async (req, res) => {
  try {
    const check = validateNickname(req.body?.nickname);
    if (!check.ok) {
      return res.status(400).json({ error: check.error, messageVi: check.error });
    }
    const nickname = check.value;
    await pool.execute('UPDATE users SET nickname = ? WHERE id = ?', [nickname, req.user.id]);
    await pool.execute(
      `INSERT INTO user_progress (user_id, nickname)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE nickname = VALUES(nickname)`,
      [req.user.id, nickname]
    );
    res.json({ ok: true, nickname });
  } catch (err) {
    console.error('PUT /api/me/nickname error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/me/invite-notifications – thông báo thưởng mời 1 lần (FR-RWD-05)
router.get('/me/invite-notifications', requireAuth, async (req, res) => {
  try {
    // Tiện dịp người dùng mở app: giải ngân vé dời sang tháng mới nếu có (BR-04)
    await releaseDeferredTicketsForMonth(req.user.id).catch(() => {});

    const [rows] = await pool.execute(
      `SELECT id, kind, ref_id, payload, created_at
         FROM invite_notifications
        WHERE user_id = ? AND seen = 0
        ORDER BY id ASC
        LIMIT 20`,
      [req.user.id]
    );
    const items = rows.map((r) => {
      let data = {};
      try { data = typeof r.payload === 'string' ? JSON.parse(r.payload) : (r.payload || {}); } catch {}
      return { id: r.id, kind: r.kind, refId: r.ref_id, data, createdAt: r.created_at };
    });
    res.json({ items });
  } catch (err) {
    console.error('GET /api/me/invite-notifications error:', err);
    res.json({ items: [] });
  }
});

// ── POST /api/me/invite-notifications/seen – đánh dấu đã xem ────────────────
router.post('/me/invite-notifications/seen', requireAuth, async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((x) => Number(x)).filter((n) => Number.isInteger(n) && n > 0)
      : [];
    if (ids.length === 0) return res.json({ ok: true });
    const placeholders = ids.map(() => '?').join(',');
    await pool.execute(
      `UPDATE invite_notifications SET seen = 1 WHERE user_id = ? AND id IN (${placeholders})`,
      [req.user.id, ...ids]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/me/invite-notifications/seen error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/progress – lấy tiến trình học ──────────────────────────────────
router.get('/progress', requireAuth, async (req, res) => {
  try {
    const [[row]] = await pool.execute(
      `SELECT total_xp, available_xp, streak, last_active_date, lessons_completed,
              quizzes_completed, perfect_quizzes, words_learned,
              completed_lessons, word_status, active_days,
              achievements, daily_tasks, daily_date,
              srs_data, checkpoint_scores, skill_xp,
              daily_journal, learner_group, active_path,
              lesson_scores, placement, updated_at
       FROM user_progress WHERE user_id = ?`,
      [req.user.id]
    );
    if (!row) return res.status(404).json({ error: 'Progress chưa được khởi tạo.' });

    // Parse JSON fields – trả về default nếu NULL
    const parseJSON = (val, fallback) => {
      if (val == null) return fallback;
      if (typeof val === 'object') return val;
      try { return JSON.parse(val); } catch { return fallback; }
    };

    // Lấy số dư ví server v2 (Sữa tính từ total_xp trừ ledger, Gem, Đá, Mảnh đá)
    const wallet = await getWallet(req.user.id);

    // Lấy trạng thái Giữ nhịp & streak server-side (GĐ3)
    const tz = req.headers['x-timezone'] || 'Asia/Ho_Chi_Minh';
    const streakState = await getUserStreakState(req.user.id, tz);

    // Chuyển về camelCase để khớp với frontend userData
    res.json({
      totalXP:          row.total_xp,
      availableXP:      wallet.milk,
      wallet,
      streak:           streakState ? streakState.currentStreak : row.streak,
      streakState,
      lastActiveDate:   row.last_active_date,
      lessonsCompleted: row.lessons_completed,
      quizzesCompleted: row.quizzes_completed,
      perfectQuizzes:   row.perfect_quizzes,
      wordsLearned:     row.words_learned,
      completedLessons: parseJSON(row.completed_lessons, []),
      wordStatus:       parseJSON(row.word_status, {}),
      activeDays:       parseJSON(row.active_days, []),
      achievements:     parseJSON(row.achievements, []),
      dailyTasks:       parseJSON(row.daily_tasks, { lessonDone: false, vocabDone: false }),
      dailyDate:        row.daily_date,
      srsData:          parseJSON(row.srs_data, {}),
      checkpointScores: parseJSON(row.checkpoint_scores, {}),
      skillXP:          parseJSON(row.skill_xp, { listening: 0, speaking: 0, reading: 0, writing: 0 }),
      dailyJournal:     parseJSON(row.daily_journal, {}),
      learnerGroup:     row.learner_group || null,
      activePath:       row.active_path || null,
      lessonScores:     parseJSON(row.lesson_scores, {}),
      placement:        parseJSON(row.placement, null),
      updatedAt:        row.updated_at,
    });
  } catch (err) {
    console.error('GET /api/progress error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/wallet – Lấy số dư ví Kinh tế v2 ───────────────────────────────
router.get('/wallet', requireAuth, async (req, res) => {
  try {
    const wallet = await getWallet(req.user.id);
    res.json(wallet);
  } catch (err) {
    console.error('GET /api/wallet error:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy ví.' });
  }
});

// ── POST /api/wallet/exchange-stone – Đổi 15 Gem lấy 1 Đá (tối đa 1/tuần) ──
router.post('/wallet/exchange-stone', requireAuth, async (req, res) => {
  try {
    const result = await exchangeStone(req.user.id);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error('POST /api/wallet/exchange-stone error:', err);
    res.status(500).json({ error: 'Lỗi server khi đổi đá.' });
  }
});

// ── POST /api/wallet/combine-shards – Ghép 10 mảnh thành 1 Đá ──────────────
router.post('/wallet/combine-shards', requireAuth, async (req, res) => {
  try {
    const result = await combineShards(req.user.id);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error('POST /api/wallet/combine-shards error:', err);
    res.status(500).json({ error: 'Lỗi server khi ghép mảnh đá.' });
  }
});

// ── POST /api/pets/:instanceId/evolve – Tiến hoá pet qua server ─────────────
router.post('/pets/:instanceId/evolve', requireAuth, async (req, res) => {
  const { instanceId } = req.params;
  try {
    const [[pRow]] = await pool.execute(
      'SELECT pet_data FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    if (!pRow || !pRow.pet_data) {
      return res.status(404).json({ error: 'Chưa có dữ liệu pet.' });
    }
    const petData = typeof pRow.pet_data === 'string' ? JSON.parse(pRow.pet_data) : pRow.pet_data;
    const pet = petData.collection?.[instanceId];
    if (!pet) {
      return res.status(404).json({ error: 'Không tìm thấy pet trong bộ sưu tập.' });
    }

    const currentStage = Math.max(0, Math.floor(Number(pet.evolution) || 0));
    if (currentStage >= 4) {
      return res.status(400).json({ error: 'Pet đã đạt cấp tối đa (C5).' });
    }

    const wallet = await getWallet(req.user.id);
    const check = canEvolve(pet, wallet);
    if (!check.ok) {
      const reasonMsg = check.reason === 'insufficient'
        ? 'Chưa đủ điều kiện tài nguyên hoặc điểm kỹ năng để tiến hoá.'
        : 'Không thể tiến hoá lúc này.';
      return res.status(400).json({ error: reasonMsg, checks: check.checks });
    }

    const cost = check.cost;
    const evolveRef = `${instanceId}:${check.to}`;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (cost.milk > 0) {
        await conn.execute(
          `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
           VALUES (?, 'milk', ?, 'evolve', ?)`,
          [req.user.id, -cost.milk, evolveRef]
        );
      }
      if (cost.gem > 0) {
        await conn.execute(
          `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
           VALUES (?, 'gem', ?, 'evolve', ?)`,
          [req.user.id, -cost.gem, evolveRef]
        );
      }
      if (cost.stone > 0) {
        await conn.execute(
          `INSERT INTO wallet_ledger (user_id, currency, amount, reason, ref_id)
           VALUES (?, 'stone', ?, 'evolve', ?)`,
          [req.user.id, -cost.stone, evolveRef]
        );
      }

      pet.evolution = check.to;
      pet.needsUpdatedAt = new Date().toISOString();
      petData.collection[instanceId] = pet;

      await conn.execute(
        'UPDATE user_progress SET pet_data = ? WHERE user_id = ?',
        [JSON.stringify(petData), req.user.id]
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const updatedWallet = await getWallet(req.user.id);
    res.json({ ok: true, pet, evolution: pet.evolution, wallet: updatedWallet });
  } catch (err) {
    console.error('POST /api/pets/:instanceId/evolve error:', err);
    res.status(500).json({ error: 'Lỗi server khi tiến hoá pet.' });
  }
});

// ── PUT /api/progress – lưu toàn bộ tiến trình ──────────────────────────────
router.put('/progress', requireAuth, async (req, res) => {
  const d = { ...(req.body || {}) };
  // Whitelist fields – v2: loại bỏ availableXP và skillXP khỏi whitelist; thêm 4 trường Lộ trình 3 nhóm
  const allowed = [
    'totalXP','streak','lastActiveDate','lessonsCompleted','quizzesCompleted',
    'perfectQuizzes','wordsLearned','completedLessons','wordStatus',
    'activeDays','achievements','dailyTasks','dailyDate',
    'srsData','checkpointScores','dailyJournal',
    'learnerGroup','activePath','lessonScores','placement',
    'timezone','lastAccuracy','lastMilkEarned'
  ];
  for (const key of Object.keys(d)) {
    if (!allowed.includes(key)) delete d[key];
  }

  const rawCompleted = Array.isArray(d.completedLessons) ? d.completedLessons : [];
  const rawCheckpointScores = typeof d.checkpointScores === 'object' && d.checkpointScores !== null ? d.checkpointScores : {};

  try {
    // Đọc giá trị hiện có trong DB để gộp lesson_scores theo MAX, phát hiện bài mới lần đầu (BR-01) và tránh client cũ ghi đè null
    const [[existing]] = await pool.execute(
      'SELECT learner_group, active_path, lesson_scores, placement, completed_lessons FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    const parseJSON = (val, fallback) => {
      if (val == null) return fallback;
      if (typeof val === 'object') return val;
      try { return JSON.parse(val); } catch { return fallback; }
    };

    const existingCompleted = new Set(parseJSON(existing?.completed_lessons, []));
    const newlyCompletedValidIds = rawCompleted.filter(
      (id) => isValidLessonId(id) && !existingCompleted.has(id)
    );

    const existingLessonScores = parseJSON(existing?.lesson_scores, {});
    const mergedLessonScores = mergeLessonScores(existingLessonScores, d.lessonScores);

    const nextLearnerGroup = 'learnerGroup' in d
      ? sanitizeLearnerGroup(d.learnerGroup)
      : (existing?.learner_group || null);
    const nextActivePath = 'activePath' in d
      ? sanitizeActivePath(d.activePath)
      : (existing?.active_path || null);
    const nextPlacement = 'placement' in d
      ? (d.placement && typeof d.placement === 'object' ? d.placement : null)
      : parseJSON(existing?.placement, null);

    const params = [
      req.user.id,
      d.totalXP          ?? 0,
      d.totalXP          ?? 0,
      d.streak           ?? 0,
      d.lastActiveDate   ?? null,
      d.lessonsCompleted ?? 0,
      d.quizzesCompleted ?? 0,
      d.perfectQuizzes   ?? 0,
      d.wordsLearned     ?? 0,
      JSON.stringify(rawCompleted),
      JSON.stringify(d.wordStatus       ?? {}),
      JSON.stringify(d.activeDays       ?? []),
      JSON.stringify(d.achievements     ?? []),
      JSON.stringify(d.dailyTasks       ?? { lessonDone: false, vocabDone: false }),
      d.dailyDate        ?? null,
      JSON.stringify(d.srsData          ?? {}),
      JSON.stringify(rawCheckpointScores),
      JSON.stringify({ listening: 0, speaking: 0, reading: 0, writing: 0 }),
      JSON.stringify(d.dailyJournal     ?? {}),
      nextLearnerGroup,
      nextActivePath,
      JSON.stringify(mergedLessonScores),
      nextPlacement ? JSON.stringify(nextPlacement) : null,
    ];

    await pool.execute(
      `INSERT INTO user_progress
         (user_id, total_xp, available_xp, streak, last_active_date,
          lessons_completed, quizzes_completed, perfect_quizzes, words_learned,
          completed_lessons, word_status, active_days, achievements,
          daily_tasks, daily_date, srs_data, checkpoint_scores, skill_xp,
          daily_journal, learner_group, active_path, lesson_scores, placement)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         -- XP lifetime chỉ tăng; XP đã tiêu (total - available) chỉ tăng → client cũ/stale không thể "hồi" ví
         available_xp      = GREATEST(0, CAST(GREATEST(total_xp, VALUES(total_xp)) AS SIGNED)
                               - GREATEST(CAST(total_xp AS SIGNED) - CAST(available_xp AS SIGNED),
                                          CAST(VALUES(total_xp) AS SIGNED) - CAST(VALUES(available_xp) AS SIGNED))),
         total_xp          = GREATEST(total_xp, VALUES(total_xp)),
         streak            = VALUES(streak),
         last_active_date  = VALUES(last_active_date),
         lessons_completed = VALUES(lessons_completed),
         quizzes_completed = VALUES(quizzes_completed),
         perfect_quizzes   = VALUES(perfect_quizzes),
         words_learned     = VALUES(words_learned),
         completed_lessons = VALUES(completed_lessons),
         word_status       = VALUES(word_status),
         active_days       = VALUES(active_days),
         achievements      = VALUES(achievements),
         daily_tasks       = VALUES(daily_tasks),
         daily_date        = VALUES(daily_date),
         srs_data          = VALUES(srs_data),
         checkpoint_scores = VALUES(checkpoint_scores),
         daily_journal     = VALUES(daily_journal),
         learner_group     = VALUES(learner_group),
         active_path       = VALUES(active_path),
         lesson_scores     = VALUES(lesson_scores),
         placement         = VALUES(placement),
         updated_at        = CURRENT_TIMESTAMP`,
      params
    );

    // Cấp Gem và Đá nguyên tố theo mốc bài học và theo unit (D2, D11, L6)
    await grantLessonAndUnitRewards(
      req.user.id,
      rawCompleted,
      rawCheckpointScores,
      mergedLessonScores
    );

    // FR-RWD-02: Ghi ngày bài mới lần đầu & kiểm tra thưởng mời bạn ("học thật" BR-01..04)
    let inviteReward = null;
    try {
      inviteReward = await processInviteActivationReward(req.user.id, {
        newlyCompletedIds: newlyCompletedValidIds,
      });
    } catch (invErr) {
      console.warn('processInviteActivationReward warning:', invErr.message);
    }

    // GĐ5 · D4: Cấp vé đấu Đấu trường (+2 vé mỗi bài học mới)
    if (newlyCompletedValidIds.length > 0) {
      try {
        await grantArenaTickets(req.user.id, newlyCompletedValidIds.length * 2);
      } catch (ticketErr) {
        console.warn('grantArenaTickets warning:', ticketErr.message);
      }
    }

    // GĐ3: Tính streak server-side theo múi giờ, tự dùng khăn, đồng hồ Cowdi, khế ước 7 ngày
    const tz = req.headers['x-timezone'] || d.timezone || 'Asia/Ho_Chi_Minh';
    const isLesson = newlyCompletedValidIds.length > 0 || Number(d.lastMilkEarned) > 0;
    const accuracy = Number(d.lastAccuracy) || 100;
    const baseMilk = Number(d.lastMilkEarned) || 0;

    const streakResult = await recordActivity(req.user.id, {
      timezone: tz,
      isLesson,
      accuracy,
      baseMilkEarned: baseMilk,
    });

    // Luôn trả về ví chuẩn { milk, gem, stone, stone_shard } mới nhất từ server
    const wallet = await getWallet(req.user.id);

    const streakState = await getUserStreakState(req.user.id, tz);

    res.json({
      ok: true,
      wallet,
      streak: streakResult.currentStreak,
      streakState,
      streakResult,
      inviteReward: inviteReward?.activated ? { activated: true, receiverMilkGranted: inviteReward.receiverMilkGranted } : null,
    });
  } catch (err) {
    console.error('PUT /api/progress error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── PUT /api/word-status – lưu chỉ wordStatus (lightweight, <50KB) ──────────
router.put('/word-status', requireAuth, async (req, res) => {
  const { wordStatus, wordsLearned } = req.body;
  if (!wordStatus || typeof wordStatus !== 'object') {
    return res.status(400).json({ error: 'wordStatus is required.' });
  }
  try {
    await pool.execute(
      `UPDATE user_progress SET word_status = ?, words_learned = ? WHERE user_id = ?`,
      [JSON.stringify(wordStatus), wordsLearned ?? 0, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/word-status error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/pet-data – lấy dữ liệu pet ─────────────────────────────────────
router.get('/pet-data', requireAuth, async (req, res) => {
  try {
    const [[row]] = await pool.execute(
      'SELECT pet_data FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    if (!row || !row.pet_data) return res.json(null);
    // pet_data là LONGTEXT (JSON string) – cần parse trước khi trả về
    const data = typeof row.pet_data === 'string' ? JSON.parse(row.pet_data) : row.pet_data;
    res.json(data);
  } catch (err) {
    console.error('GET /api/pet-data error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── PUT /api/pet-data – lưu dữ liệu pet ─────────────────────────────────────
router.put('/pet-data', requireAuth, async (req, res) => {
  const d = req.body;
  // Whitelist top-level fields (D12: bỏ coins và totalCoinsEarned)
  const allowed = ['activePetId', 'nickname', 'collection', 'ownedItems', 'dailyQuests', 'weeklyQuests', 'petAchievements'];
  const clean = {};
  for (const key of allowed) {
    if (d[key] !== undefined) clean[key] = d[key];
  }
  try {
    // Bảo vệ cấp pet & điểm kỹ năng: đọc pet_data cũ từ DB (mục 0.5.2 & 6.2)
    const [[oldRow]] = await pool.execute(
      'SELECT pet_data FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    let oldData = null;
    if (oldRow?.pet_data) {
      oldData = typeof oldRow.pet_data === 'string' ? JSON.parse(oldRow.pet_data) : oldRow.pet_data;
    }

    if (clean.collection && typeof clean.collection === 'object') {
      for (const [id, pet] of Object.entries(clean.collection)) {
        if (!pet || typeof pet !== 'object') continue;
        const oldPet = oldData?.collection?.[id];
        if (oldPet) {
          // Cấp tiến hoá do server quản lý qua POST /api/pets/:instanceId/evolve
          pet.evolution = oldPet.evolution ?? 0;
          // Kẹp điểm kỹ năng không bao giờ giảm
          pet.skills = pet.skills || {};
          for (const k of ['listening', 'speaking', 'reading', 'writing']) {
            pet.skills[k] = Math.max(Number(oldPet?.skills?.[k]) || 0, Number(pet.skills?.[k]) || 0);
          }
        }
      }
    }

    await pool.execute(
      `INSERT INTO user_progress (user_id, pet_data)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE pet_data = VALUES(pet_data)`,
      [req.user.id, JSON.stringify(clean)]
    );
    // Đồng bộ tên hiển thị từ AccountPage sang users.nickname & user_progress.nickname
    if (typeof clean.nickname === 'string' && clean.nickname.trim()) {
      const syncedNick = clean.nickname.trim().slice(0, 32);
      await pool.execute('UPDATE users SET nickname = ? WHERE id = ?', [syncedNick, req.user.id]).catch(() => {});
      await pool.execute('UPDATE user_progress SET nickname = ? WHERE user_id = ?', [syncedNick.slice(0, 20), req.user.id]).catch(() => {});
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/pet-data error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/leaderboard – bảng xếp hạng pet (ẩn danh) ──────────────────────
router.get('/leaderboard', async (req, res) => {
  const type = req.query.type || 'power'; // power | collection | skill
  const skill = req.query.skill || 'listening';
  try {
    const [rows] = await pool.execute(
      `SELECT up.pet_data, up.league_points, up.duel_wins, up.duel_losses, u.display_name
       FROM user_progress up
       LEFT JOIN users u ON u.id = up.user_id
       WHERE up.pet_data IS NOT NULL`
    );
    const entries = [];
    for (const row of rows) {
      const data = typeof row.pet_data === 'string' ? JSON.parse(row.pet_data) : row.pet_data;
      if (!data || !data.collection) continue;
      const nick = data.nickname || row.display_name || 'Ẩn danh';
      const collection = data.collection;
      const collectionCount = Object.keys(collection).length;
      // Find best pet (for power), active pet (for display)
      let bestPower = 0;
      let bestSkill = 0;
      let activePetSpecies = null;
      let activePetXp = 0;
      let activePetEvolution = 0;
      let activePetName = 'Pet';
      if (data.activePetId && collection[data.activePetId]) {
        const ap = collection[data.activePetId];
        activePetSpecies = ap.speciesId;
        activePetXp = ap.totalXpEarned || 0;
        activePetEvolution = ap.evolution || 0;
        activePetName = ap.customName || 'Pet';
      }
      for (const pet of Object.values(collection)) {
        const sk = pet.skills || {};
        // Skill tên cũ (perception/speech/intelligence/creativity) vẫn có thể còn trong dữ liệu chưa migrate.
        const skills = {
          listening: sk.listening || sk.perception || 0,
          speaking: sk.speaking || sk.speech || 0,
          reading: sk.reading || sk.intelligence || 0,
          writing: sk.writing || sk.creativity || 0,
        };
        // Power score v2 (mục 4.3) — độ hiếm lấy theo loài từ shared config.
        const power = PET_BATTLE_DATA[pet.speciesId]
          ? computePowerScore({ speciesId: pet.speciesId, evolution: pet.evolution || 0, skills, rarity: PET_BATTLE_DATA[pet.speciesId].rarity })
          : 0;
        if (power > bestPower) bestPower = power;
        const skillVal = skills[skill] || 0;
        if (skillVal > bestSkill) bestSkill = skillVal;
      }
      entries.push({
        nickname: nick, power: bestPower, collectionCount, skill: bestSkill,
        speciesId: activePetSpecies, evolution: activePetEvolution, totalXpEarned: activePetXp, petName: activePetName,
        leaguePoints: row.league_points || 0,
        duelWins: row.duel_wins || 0,
        duelLosses: row.duel_losses || 0,
      });
    }
    // Sort by requested type
    if (type === 'power') entries.sort((a, b) => b.power - a.power);
    else if (type === 'collection') entries.sort((a, b) => b.collectionCount - a.collectionCount);
    else entries.sort((a, b) => b.skill - a.skill);

    res.json(entries.slice(0, 50));
  } catch (err) {
    console.error('GET /api/leaderboard error:', err);
    res.json([]);
  }
});

// ═══════════════════════════════════════════════════════════════════
//   SOCIAL FEATURES — PET DUEL + LEAGUE RANKINGS
// ═══════════════════════════════════════════════════════════════════

function getLeague(points) {
  if (points >= 1000) return 'master';
  if (points >= 600) return 'diamond';
  if (points >= 300) return 'gold';
  if (points >= 100) return 'silver';
  return 'bronze';
}

function parsePetSummary(rawPetData) {
  const pd = typeof rawPetData === 'string' ? JSON.parse(rawPetData) : rawPetData;
  if (!pd?.collection || !pd?.activePetId) return null;
  const pet = pd.collection[pd.activePetId];
  if (!pet) return null;
  // `totalXpEarned` giữ lại cho client cũ đang cache; v2 hiển thị theo `evolution`.
  return { speciesId: pet.speciesId, evolution: pet.evolution || 0, totalXpEarned: pet.totalXpEarned || 0, customName: pet.customName };
}

function safeParse(val, fallback) {
  if (val == null) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

const DUEL_VALID_CATEGORIES = ['all', 'vocabulary', 'grammar', 'sentences', 'listening'];
const DUEL_VALID_COUNTS = [10, 20, 30];

function formatDuelRow(row) {
  const challengerPetSnap = row.challenger_pet_snapshot ? safeParse(row.challenger_pet_snapshot, null) : parsePetSummary(row.challenger_pet);
  const opponentPetSnap = row.opponent_pet_snapshot ? safeParse(row.opponent_pet_snapshot, null) : parsePetSummary(row.opponent_pet);

  return {
    id: row.id,
    challengerId: row.challenger_id,
    opponentId: row.opponent_id,
    isFriendDuel: Boolean(row.is_friend_duel),
    status: row.status,
    challengerScore: row.challenger_score,
    challengerTime: row.challenger_time,
    opponentScore: row.opponent_score,
    opponentTime: row.opponent_time,
    winnerId: row.winner_id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    challengerNick: row.challenger_nick || 'Ẩn danh',
    opponentNick: row.opponent_nick || null,
    challengerPet: challengerPetSnap,
    opponentPet: opponentPetSnap,
    challengerHpPct: row.challenger_hp_pct != null ? Number(row.challenger_hp_pct) : null,
    opponentHpPct: row.opponent_hp_pct != null ? Number(row.opponent_hp_pct) : null,
    battleLog: safeParse(row.battle_log, null),
    category: row.category || 'all',
    message: row.message || null,
    questionCount: (() => { try { const q = typeof row.quiz_data === 'string' ? JSON.parse(row.quiz_data) : row.quiz_data; return Array.isArray(q) ? q.length : 0; } catch { return 0; } })(),
  };
}

// ── GET /api/my-stats – thống kê đấu trường + league ────────────────────────
router.get('/my-stats', requireAuth, async (req, res) => {
  try {
    const [[row]] = await pool.execute(
      'SELECT league_points, duel_wins, duel_losses, duel_streak FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    if (!row) return res.json({ leaguePoints: 0, duelWins: 0, duelLosses: 0, duelStreak: 0, league: 'bronze' });
    const lp = row.league_points || 0;
    res.json({
      leaguePoints: lp,
      duelWins: row.duel_wins || 0,
      duelLosses: row.duel_losses || 0,
      duelStreak: row.duel_streak || 0,
      league: getLeague(lp),
    });
  } catch (err) {
    console.error('GET /api/my-stats error:', err);
    res.json({ leaguePoints: 0, duelWins: 0, duelLosses: 0, duelStreak: 0, league: 'bronze' });
  }
});

// ── POST /api/duel – Tạo thách đấu mới (hỗ trợ opponentId cho bạn bè FR-VIS-02)
router.post('/duel', requireAuth, async (req, res) => {
  const { quizData, answers, time, questionTimes, category, message, opponentId } = req.body;
  if (!Array.isArray(quizData) || quizData.length < 5 || quizData.length > 30) {
    return res.status(400).json({ error: 'Quiz data không hợp lệ.' });
  }
  if (!Array.isArray(answers) || answers.length !== quizData.length) {
    return res.status(400).json({ error: 'Answers không hợp lệ.' });
  }

  let targetOpponentId = null;
  let isFriendDuel = 0;
  if (opponentId !== undefined && opponentId !== null && opponentId !== '') {
    targetOpponentId = Number(opponentId);
    if (!Number.isInteger(targetOpponentId) || targetOpponentId <= 0 || targetOpponentId === Number(req.user.id)) {
      return res.status(400).json({ error: 'Đối thủ không hợp lệ.' });
    }
    const rel = await getFriendshipStatus(req.user.id, targetOpponentId);
    if (!rel || rel.status !== 'accepted') {
      return res.status(403).json({ error: 'Bạn chỉ có thể thách đấu trực tiếp người đã là bạn bè.' });
    }
    isFriendDuel = 1;
  }
  // Sanitize quiz data
  const cleanQuiz = quizData.map(q => ({
    question: String(q.question || '').slice(0, 500),
    options: (q.options || []).slice(0, 6).map(o => String(o).slice(0, 200)),
    correct: parseInt(q.correct) || 0,
    category: String(q.category || 'vocabulary').slice(0, 30),
    ...(q.speak ? { speak: String(q.speak).slice(0, 200) } : {}),
  }));
  // Score challenger's answers
  const score = answers.reduce((s, a, i) => s + (parseInt(a) === cleanQuiz[i].correct ? 1 : 0), 0);
  const safeTime = Math.max(0, Math.min(parseInt(time) || 0, 600));
  const cleanQTimes = Array.isArray(questionTimes) && questionTimes.length === cleanQuiz.length
    ? questionTimes.map(t => Math.max(0, Math.min(parseFloat(t) || 0, 300)))
    : new Array(cleanQuiz.length).fill(0);
  const safeCategory = DUEL_VALID_CATEGORIES.includes(category) ? category : 'all';
  const safeMessage = typeof message === 'string' ? message.slice(0, 100) : null;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  try {
    // Lấy pet active của challenger để lưu snapshot trận đấu v2
    const [[pRow]] = await pool.execute(
      'SELECT pet_data FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    let petSnapshot = null;
    if (pRow?.pet_data) {
      const pData = typeof pRow.pet_data === 'string' ? JSON.parse(pRow.pet_data) : pRow.pet_data;
      if (pData?.activePetId && pData?.collection?.[pData.activePetId]) {
        petSnapshot = resolveSnapshot(pData.collection[pData.activePetId]);
      }
    }
    if (!petSnapshot) {
      petSnapshot = resolveSnapshot({ speciesId: 'cowdi', evolution: 0 });
    }

    const [result] = await pool.execute(
      `INSERT INTO challenges
         (challenger_id, opponent_id, is_friend_duel, status, quiz_data, challenger_answers, challenger_score, challenger_time,
          challenger_question_times, challenger_pet_snapshot, category, message, expires_at)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        targetOpponentId,
        isFriendDuel,
        JSON.stringify(cleanQuiz),
        JSON.stringify(answers.map(a => parseInt(a) || 0)),
        score,
        safeTime,
        JSON.stringify(cleanQTimes),
        JSON.stringify(petSnapshot),
        safeCategory,
        safeMessage,
        expiresAt,
      ]
    );
    // BR-06: Trận bạn bè KHÔNG cộng league points; vẫn thưởng Sữa
    const milkEarned = Math.max(0, score * 5);
    const createLpDelta = computeDuelLeaguePointDelta({ isFriendDuel: Boolean(isFriendDuel), phase: 'create' });
    await pool.execute(
      `UPDATE user_progress
       SET league_points = COALESCE(league_points, 0) + ?,
           total_xp = COALESCE(total_xp, 0) + ?
       WHERE user_id = ?`,
      [createLpDelta, milkEarned, req.user.id]
    );
    const wallet = await getWallet(req.user.id);
    res.json({ ok: true, challengeId: result.insertId, score, milkEarned, isFriendDuel: Boolean(isFriendDuel), wallet });
  } catch (err) {
    console.error('POST /api/duel error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/duel/open – Danh sách thách đấu đang chờ ───────────────────────
// IMPORTANT: This route must be before /api/duel/:id
router.get('/duel/open', requireAuth, async (req, res) => {
  try {
    // Expire old challenges
    await pool.execute(
      "UPDATE challenges SET status = 'expired' WHERE status = 'pending' AND expires_at < NOW()"
    );

    // Lấy cấp pet hiện tại của người dùng để ghép trận (chênh tối đa 1 cấp)
    const [[userRow]] = await pool.execute(
      'SELECT pet_data FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    let userStage = 0;
    if (userRow?.pet_data) {
      const uData = typeof userRow.pet_data === 'string' ? JSON.parse(userRow.pet_data) : userRow.pet_data;
      if (uData?.activePetId && uData?.collection?.[uData.activePetId]) {
        userStage = Math.max(0, Math.floor(Number(uData.collection[uData.activePetId].evolution) || 0));
      }
    }

    const [rows] = await pool.execute(
      `SELECT c.*,
              p1.pet_data AS challenger_pet,
              COALESCE(p1.nickname, u1.display_name, 'Ẩn danh') AS challenger_nick
       FROM challenges c
       LEFT JOIN user_progress p1 ON c.challenger_id = p1.user_id
       LEFT JOIN users u1 ON c.challenger_id = u1.id
       WHERE c.status = 'pending'
         AND c.challenger_id != ?
         AND COALESCE(c.is_friend_duel, 0) = 0
         AND c.opponent_id IS NULL
         AND c.expires_at > NOW()
       ORDER BY c.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    // Lọc theo canMatch (chênh tối đa 1 cấp)
    const matched = rows.filter(r => {
      let chStage = 0;
      if (r.challenger_pet_snapshot) {
        const snap = safeParse(r.challenger_pet_snapshot, null);
        chStage = snap?.evolution ?? 0;
      } else if (r.challenger_pet) {
        const chSummary = parsePetSummary(r.challenger_pet);
        chStage = chSummary?.evolution ?? 0;
      }
      return canMatch(chStage, userStage);
    }).slice(0, 20);

    res.json(matched.map(formatDuelRow));
  } catch (err) {
    console.error('GET /api/duel/open error:', err);
    res.json([]);
  }
});

// ── GET /api/duel – Thách đấu của tôi (gửi + nhận) ─────────────────────────
router.get('/duel', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*,
              p1.pet_data AS challenger_pet,
              COALESCE(p1.nickname, u1.display_name, 'Ẩn danh') AS challenger_nick,
              p2.pet_data AS opponent_pet,
              COALESCE(p2.nickname, u2.display_name, 'Ẩn danh') AS opponent_nick
       FROM challenges c
       LEFT JOIN user_progress p1 ON c.challenger_id = p1.user_id
       LEFT JOIN users u1 ON c.challenger_id = u1.id
       LEFT JOIN user_progress p2 ON c.opponent_id = p2.user_id
       LEFT JOIN users u2 ON c.opponent_id = u2.id
       WHERE c.challenger_id = ? OR c.opponent_id = ?
       ORDER BY c.created_at DESC
       LIMIT 50`,
      [req.user.id, req.user.id]
    );
    res.json(rows.map(formatDuelRow));
  } catch (err) {
    console.error('GET /api/duel error:', err);
    res.json([]);
  }
});

// ── GET /api/duel/:id – Chi tiết thách đấu (câu hỏi cho opponent) ──────────
router.get('/duel/:id', requireAuth, async (req, res) => {
  const challengeId = parseInt(req.params.id);
  if (!challengeId) return res.status(400).json({ error: 'ID không hợp lệ.' });
  try {
    const [[row]] = await pool.execute(
      `SELECT c.*,
              COALESCE(p1.nickname, u1.display_name, 'Ẩn danh') AS challenger_nick,
              p1.pet_data AS challenger_pet
       FROM challenges c
       LEFT JOIN user_progress p1 ON c.challenger_id = p1.user_id
       LEFT JOIN users u1 ON c.challenger_id = u1.id
       WHERE c.id = ?`,
      [challengeId]
    );
    if (!row) return res.status(404).json({ error: 'Không tìm thấy thách đấu.' });
    if (row.is_friend_duel && row.opponent_id != null &&
        Number(row.opponent_id) !== Number(req.user.id) &&
        Number(row.challenger_id) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Trận thách đấu bạn bè này dành cho người khác.' });
    }

    const quizData = typeof row.quiz_data === 'string' ? JSON.parse(row.quiz_data) : row.quiz_data;
    // Strip correct answers so opponent can't cheat
    const questions = (quizData || []).map(({ question, options, category, speak }) => ({
      question, options, category,
      ...(speak ? { speak } : {}),
    }));

    // Send challenger's per-question results (correct/wrong) without revealing answers
    const challengerAnswers = safeParse(row.challenger_answers, []);
    const challengerQTimes = safeParse(row.challenger_question_times, []);
    const challengerResults = (quizData || []).map((q, i) => ({
      correct: parseInt(challengerAnswers[i]) === q.correct,
      time: typeof challengerQTimes[i] === 'number' ? challengerQTimes[i] : null,
    }));

    const challengerPet = row.challenger_pet_snapshot
      ? safeParse(row.challenger_pet_snapshot, null)
      : parsePetSummary(row.challenger_pet);

    res.json({
      id: row.id,
      challengerId: row.challenger_id,
      status: row.status,
      challengerNick: row.challenger_nick || 'Ẩn danh',
      challengerPet,
      challengerResults,
      challengerTime: row.challenger_time,
      category: row.category || 'all',
      message: row.message || null,
      questions,
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error('GET /api/duel/:id error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── POST /api/duel/:id/join – Chấp nhận + nộp bài ──────────────────────────
router.post('/duel/:id/join', requireAuth, async (req, res) => {
  const challengeId = parseInt(req.params.id);
  const { answers, time, questionTimes } = req.body;
  if (!challengeId) return res.status(400).json({ error: 'ID không hợp lệ.' });
  if (!Array.isArray(answers)) return res.status(400).json({ error: 'Answers không hợp lệ.' });

  try {
    const [[challenge]] = await pool.execute(
      "SELECT * FROM challenges WHERE id = ? AND status = 'pending' AND challenger_id != ?",
      [challengeId, req.user.id]
    );
    if (!challenge) return res.status(404).json({ error: 'Thách đấu không tồn tại hoặc đã kết thúc.' });

    const isFriendDuel = Boolean(challenge.is_friend_duel);
    if (challenge.opponent_id != null && Number(challenge.opponent_id) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Trận thách đấu bạn bè này dành cho người khác.' });
    }
    if (isFriendDuel) {
      const rel = await getFriendshipStatus(challenge.challenger_id, req.user.id);
      if (!rel || rel.status !== 'accepted') {
        return res.status(403).json({ error: 'Hai bạn hiện không còn là bạn bè nên không thể tham gia trận này.' });
      }
    }

    const quizData = typeof challenge.quiz_data === 'string' ? JSON.parse(challenge.quiz_data) : challenge.quiz_data;
    if (answers.length !== quizData.length) return res.status(400).json({ error: 'Số câu trả lời không khớp.' });

    // Score opponent's answers server-side
    const opponentScore = answers.reduce((s, a, i) => s + (parseInt(a) === quizData[i].correct ? 1 : 0), 0);
    const safeTime = Math.max(0, Math.min(parseInt(time) || 0, 1800));
    const challengerScore = challenge.challenger_score;
    const challengerTime = challenge.challenger_time;

    // Normalize per-question times (đơn vị: giây, ví dụ 1.2s -> chuyển sang ms cho battle-engine)
    const cleanOppQTimes = Array.isArray(questionTimes) && questionTimes.length === quizData.length
      ? questionTimes.map(t => Math.max(0, Math.min(parseFloat(t) || 0, 300)))
      : new Array(quizData.length).fill(0);
    const challengerQTimes = safeParse(challenge.challenger_question_times, new Array(quizData.length).fill(0));
    const challengerAnswers = safeParse(challenge.challenger_answers, []);

    // ── Lấy pet snapshot 2 bên cho battle engine v2 ──
    let challengerPetSnap = challenge.challenger_pet_snapshot
      ? safeParse(challenge.challenger_pet_snapshot, null)
      : null;
    if (!challengerPetSnap) {
      const [[chProgRow]] = await pool.execute(
        'SELECT pet_data FROM user_progress WHERE user_id = ?',
        [challenge.challenger_id]
      );
      const chData = safeParse(chProgRow?.pet_data, null);
      const chPet = chData?.activePetId ? chData.collection?.[chData.activePetId] : null;
      challengerPetSnap = resolveSnapshot(chPet || { speciesId: 'cowdi', evolution: 0 });
    }

    const [[oppProgRow]] = await pool.execute(
      'SELECT pet_data FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    const oppData = safeParse(oppProgRow?.pet_data, null);
    const oppPet = oppData?.activePetId ? oppData.collection?.[oppData.activePetId] : null;
    const opponentPetSnap = resolveSnapshot(oppPet || { speciesId: 'cowdi', evolution: 0 });

    // Chuẩn bị mảng answers cho simulateBattle
    const answersA = quizData.map((q, i) => ({
      correct: parseInt(challengerAnswers[i]) === q.correct,
      timeMs: Math.round((Number(challengerQTimes[i]) || 0) * 1000),
    }));
    const answersB = quizData.map((q, i) => ({
      correct: parseInt(answers[i]) === q.correct,
      timeMs: Math.round((Number(cleanOppQTimes[i]) || 0) * 1000),
    }));

    // Chạy engine trận đấu thuần túy trên server (D9: đánh đủ 10 câu, stopAtZero = false)
    const battleRes = simulateBattle(
      challengerPetSnap,
      opponentPetSnap,
      answersA,
      answersB,
      String(challengeId),
      { stopAtZero: false }
    );

    let winnerId = null;
    if (battleRes.winner === 'opponent') winnerId = req.user.id;
    else if (battleRes.winner === 'challenger') winnerId = challenge.challenger_id;

    const challengerHpPct = Math.round(battleRes.challenger.hpPct * 100);
    const opponentHpPct = Math.round(battleRes.opponent.hpPct * 100);

    // Update challenge
    await pool.execute(
      `UPDATE challenges SET
         opponent_id = ?, opponent_answers = ?, opponent_score = ?, opponent_time = ?,
         opponent_question_times = ?, opponent_pet_snapshot = ?, battle_log = ?,
         challenger_hp_pct = ?, opponent_hp_pct = ?, winner_id = ?, status = 'completed'
       WHERE id = ?`,
      [
        req.user.id,
        JSON.stringify(answers.map(a => parseInt(a) || 0)),
        opponentScore,
        safeTime,
        JSON.stringify(cleanOppQTimes),
        JSON.stringify(opponentPetSnap),
        JSON.stringify(battleRes.log),
        challengerHpPct,
        opponentHpPct,
        winnerId,
        challengeId,
      ]
    );

    // D4: Thưởng Sữa cho trận đấu Đấu trường
    // Người thắng: 8 Sữa · Hòa: 5 Sữa · Thua: 2 Sữa; cộng thêm 5 Sữa / câu đúng
    const isOppWin = winnerId === req.user.id;
    const isChWin = winnerId === challenge.challenger_id;
    const isDraw = !winnerId;

    const oppBonus = isOppWin ? 8 : (isDraw ? 5 : 2);
    const chBonus = isChWin ? 8 : (isDraw ? 5 : 2);

    const opponentMilk = (opponentScore * 5) + oppBonus;
    const challengerMilk = (Number(challenge.challenger_score || 0) * 5) + chBonus;

    // Update league points (BR-06: trận bạn bè = 0 LP) + duel stats + Sữa (total_xp) for both players
    if (isOppWin) {
      const oppLp = computeDuelLeaguePointDelta({ isFriendDuel, phase: 'join', outcome: 'win' });
      const chLp = computeDuelLeaguePointDelta({ isFriendDuel, phase: 'join', outcome: 'loss' });
      await pool.execute(
        `UPDATE user_progress
         SET duel_wins = COALESCE(duel_wins,0) + 1,
             duel_streak = COALESCE(duel_streak,0) + 1,
             league_points = COALESCE(league_points,0) + ?,
             total_xp = COALESCE(total_xp,0) + ?
         WHERE user_id = ?`,
        [oppLp, opponentMilk, req.user.id]
      );
      await pool.execute(
        `UPDATE user_progress
         SET duel_losses = COALESCE(duel_losses,0) + 1,
             duel_streak = 0,
             league_points = COALESCE(league_points,0) + ?,
             total_xp = COALESCE(total_xp,0) + ?
         WHERE user_id = ?`,
        [chLp, challengerMilk, challenge.challenger_id]
      );
    } else if (isChWin) {
      const chLp = computeDuelLeaguePointDelta({ isFriendDuel, phase: 'join', outcome: 'win' });
      const oppLp = computeDuelLeaguePointDelta({ isFriendDuel, phase: 'join', outcome: 'loss' });
      await pool.execute(
        `UPDATE user_progress
         SET duel_wins = COALESCE(duel_wins,0) + 1,
             duel_streak = COALESCE(duel_streak,0) + 1,
             league_points = COALESCE(league_points,0) + ?,
             total_xp = COALESCE(total_xp,0) + ?
         WHERE user_id = ?`,
        [chLp, challengerMilk, challenge.challenger_id]
      );
      await pool.execute(
        `UPDATE user_progress
         SET duel_losses = COALESCE(duel_losses,0) + 1,
             duel_streak = 0,
             league_points = COALESCE(league_points,0) + ?,
             total_xp = COALESCE(total_xp,0) + ?
         WHERE user_id = ?`,
        [oppLp, opponentMilk, req.user.id]
      );
    } else {
      const drawLp = computeDuelLeaguePointDelta({ isFriendDuel, phase: 'join', outcome: 'draw' });
      await pool.execute(
        `UPDATE user_progress
         SET league_points = COALESCE(league_points,0) + ?,
             total_xp = COALESCE(total_xp,0) + ?
         WHERE user_id = ?`,
        [drawLp, opponentMilk, req.user.id]
      );
      await pool.execute(
        `UPDATE user_progress
         SET league_points = COALESCE(league_points,0) + ?,
             total_xp = COALESCE(total_xp,0) + ?
         WHERE user_id = ?`,
        [drawLp, challengerMilk, challenge.challenger_id]
      );
    }

    const wallet = await getWallet(req.user.id);

    res.json({
      ok: true,
      opponentScore,
      challengerScore,
      opponentTime: safeTime,
      challengerTime,
      opponentPoints: opponentHpPct,
      challengerPoints: challengerHpPct,
      opponentHpPct,
      challengerHpPct,
      battleLog: battleRes.log,
      winnerId,
      challengerPet: challengerPetSnap,
      opponentPet: opponentPetSnap,
      wallet,
      milkEarned: opponentMilk,
    });

    // ── Push notification cho challenger biết duel của họ đã có người chơi ──
    try {
      const [[chRow]] = await pool.execute(
        'SELECT pet_data FROM user_progress WHERE user_id = ?',
        [challenge.challenger_id]
      );
      const { petName, icon, badge } = pickPetIcon(chRow?.pet_data);
      const opponentName = req.user.display_name || 'Một người';
      const isWin = winnerId === challenge.challenger_id;
      const isDraw = winnerId === null;

      const title = isDraw
        ? `🤝 Duel của ${petName} hòa rồi!`
        : isWin
          ? `🏆 ${petName} thắng duel!`
          : `⚔️ ${petName} bị đánh bại!`;
      const body = isDraw
        ? `${opponentName} vừa hoà với bạn ${challengerScore}-${opponentScore}.`
        : isWin
          ? `${opponentName} đã thua ${opponentScore}-${challengerScore}. Vào nhận Sữa và vinh quang nào!`
          : `${opponentName} đã thắng ${opponentScore}-${challengerScore}. Phục thù ngay!`;

      sendPushToUser(challenge.challenger_id, {
        title, body, icon, badge,
        tag: `duel-${challengeId}`, url: '/duel',
        renotify: true,
      }).catch(() => {});
    } catch (pushErr) {
      console.warn('Push duel result failed:', pushErr.message);
    }
  } catch (err) {
    console.error('POST /api/duel/:id/join error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/rankings – bảng xếp hạng giải đấu ─────────────────────────────
router.get('/rankings', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT up.nickname, up.pet_data, up.league_points,
              up.duel_wins, up.duel_losses, up.duel_streak, u.display_name
       FROM user_progress up
       LEFT JOIN users u ON u.id = up.user_id
       WHERE up.pet_data IS NOT NULL
       ORDER BY COALESCE(up.league_points, 0) DESC
       LIMIT 50`
    );
    const entries = rows.map(row => {
      const pd = typeof row.pet_data === 'string' ? JSON.parse(row.pet_data) : row.pet_data;
      const lp = row.league_points || 0;
      const pet = parsePetSummary(row.pet_data);
      return {
        nickname: row.nickname || pd?.nickname || row.display_name || 'Ẩn danh',
        leaguePoints: lp,
        league: getLeague(lp),
        duelWins: row.duel_wins || 0,
        duelLosses: row.duel_losses || 0,
        duelStreak: row.duel_streak || 0,
        pet,
      };
    });
    res.json(entries);
  } catch (err) {
    console.error('GET /api/rankings error:', err);
    res.json([]);
  }
});

// ── GET /api/student-rankings – xếp hạng học tập ────────────────────────────
// ── Composite ranking score: cân bằng các module, ưu tiên chất lượng ───────
// Trọng số (mỗi event đóng góp ~điểm có ý nghĩa rõ rệt):
//   - XP (cap 50k để chống cày)        : 0.4 / xp
//   - Mỗi bài học hoàn thành           : 50
//   - Mỗi từ vựng đã thuộc             : 8
//   - Mỗi quiz hoàn thành              : 12
//   - Mỗi quiz đạt điểm tối đa         : 30  (chất lượng)
//   - Streak dài nhất (cap 365 ngày)  : 25 / ngày  (kiên trì — lấy kỷ lục, không lấy chuỗi hiện tại)
//   - Mỗi ngày học khác nhau           : 8
//   - Mỗi thành tựu                    : 120
function computeRankScore(e) {
  const xpCapped = Math.min(e.totalXP || 0, 50000);
  const streakCapped = Math.min(e.bestStreak || 0, 365);
  return Math.round(
    xpCapped * 0.4 +
    (e.lessonsCompleted || 0) * 50 +
    (e.wordsLearned || 0) * 8 +
    (e.quizzesCompleted || 0) * 12 +
    (e.perfectQuizzes || 0) * 30 +
    streakCapped * 25 +
    (e.activeDaysCount || 0) * 8 +
    (e.achievementCount || 0) * 120
  );
}

// active_days lưu chuỗi Date.toDateString() ("Wed Sep 10 2026").
// Trả về { current, best }: chuỗi liên tiếp kết thúc hôm nay/hôm qua & chuỗi dài nhất từng đạt.
function computeStreaks(activeDays) {
  const days = [...new Set((activeDays || [])
    .map((s) => Math.floor(new Date(s).getTime() / 86400000))
    .filter((n) => Number.isFinite(n)))].sort((a, b) => a - b);
  let best = 0, run = 0;
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i] - days[i - 1] === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  const today = Math.floor(Date.now() / 86400000);
  const last = days[days.length - 1];
  const current = last != null && today - last <= 1 ? run : 0;
  return { current, best };
}

router.get('/student-rankings', async (req, res) => {
  const sort = req.query.sort || 'score'; // score | xp | streak | lessons | words | quizzes | achievements
  try {
    const [rows] = await pool.execute(
      `SELECT up.total_xp, up.streak, up.lessons_completed, up.quizzes_completed,
              up.perfect_quizzes, up.words_learned, up.achievements, up.active_days,
              up.nickname, up.pet_data, u.display_name
       FROM user_progress up
       LEFT JOIN users u ON u.id = up.user_id
       WHERE up.total_xp > 0 OR up.lessons_completed > 0`
    );
    const entries = rows.map(row => {
      const pd = typeof row.pet_data === 'string' ? JSON.parse(row.pet_data) : row.pet_data;
      const achList = typeof row.achievements === 'string' ? JSON.parse(row.achievements || '[]') : (row.achievements || []);
      const activeDays = typeof row.active_days === 'string' ? JSON.parse(row.active_days || '[]') : (row.active_days || []);
      const pet = parsePetSummary(row.pet_data);
      const streaks = computeStreaks(Array.isArray(activeDays) ? activeDays : []);
      const e = {
        nickname: row.nickname || pd?.nickname || row.display_name || 'Ẩn danh',
        totalXP: row.total_xp || 0,
        streak: streaks.current,
        bestStreak: Math.max(streaks.best, streaks.current),
        lessonsCompleted: row.lessons_completed || 0,
        quizzesCompleted: row.quizzes_completed || 0,
        perfectQuizzes: row.perfect_quizzes || 0,
        wordsLearned: row.words_learned || 0,
        achievementCount: Array.isArray(achList) ? achList.length : 0,
        activeDaysCount: Array.isArray(activeDays) ? activeDays.length : 0,
        pet,
      };
      e.rankScore = computeRankScore(e);
      return e;
    });
    // Sort
    const sortMap = {
      score: (a, b) => b.rankScore - a.rankScore,
      xp: (a, b) => b.totalXP - a.totalXP,
      streak: (a, b) => (b.bestStreak - a.bestStreak) || (b.streak - a.streak),
      lessons: (a, b) => b.lessonsCompleted - a.lessonsCompleted,
      words: (a, b) => b.wordsLearned - a.wordsLearned,
      quizzes: (a, b) => b.quizzesCompleted - a.quizzesCompleted,
      achievements: (a, b) => b.achievementCount - a.achievementCount,
    };
    entries.sort(sortMap[sort] || sortMap.score);
    res.json(entries.slice(0, 50));
  } catch (err) {
    console.error('GET /api/student-rankings error:', err);
    res.json([]);
  }
});

// ============================================================
//  PUSH NOTIFICATION
// ============================================================

// ── GET /api/push/vapid-public-key – public VAPID để FE subscribe ─────────
router.get('/push/vapid-public-key', (_req, res) => {
  if (!isPushReady()) return res.status(503).json({ error: 'Push notification chưa sẵn sàng.' });
  res.json({ publicKey: getPublicKey() });
});

// ── POST /api/push/subscribe – đăng ký 1 thiết bị nhận push ───────────────
router.post('/push/subscribe', requireAuth, async (req, res) => {
  if (!isPushReady()) return res.status(503).json({ error: 'Push chưa sẵn sàng.' });
  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Subscription không hợp lệ.' });
  }
  try {
    const userAgent = (req.headers['user-agent'] || '').slice(0, 250);
    await pool.execute(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth_key, user_agent)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), p256dh = VALUES(p256dh),
                               auth_key = VALUES(auth_key), user_agent = VALUES(user_agent)`,
      [req.user.id, endpoint, keys.p256dh, keys.auth, userAgent]
    );
    // Bật cờ push_enabled
    await pool.execute(
      'UPDATE user_progress SET push_enabled = 1 WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/push/subscribe error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── DELETE /api/push/subscribe – tắt notif cho 1 thiết bị ─────────────────
router.delete('/push/subscribe', requireAuth, async (req, res) => {
  const { endpoint } = req.body || {};
  try {
    if (endpoint) {
      await pool.execute(
        'DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
        [req.user.id, endpoint]
      );
    } else {
      // Không cung cấp endpoint → xóa hết các subscription của user
      await pool.execute('DELETE FROM push_subscriptions WHERE user_id = ?', [req.user.id]);
    }
    // Tắt cờ nếu không còn subscription nào
    const [[count]] = await pool.execute(
      'SELECT COUNT(*) AS n FROM push_subscriptions WHERE user_id = ?',
      [req.user.id]
    );
    if (count.n === 0) {
      await pool.execute('UPDATE user_progress SET push_enabled = 0 WHERE user_id = ?', [req.user.id]);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/push/subscribe error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── POST /api/push/test – gửi push thử (dev only) ─────────────────────────
router.post('/push/test', requireAuth, async (req, res) => {
  try {
    const [[row]] = await pool.execute(
      'SELECT pet_data FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    const { petName, icon, badge } = pickPetIcon(row?.pet_data);
    const result = await sendPushToUser(req.user.id, {
      title: `${petName} chào bạn! 👋`,
      body: 'Push notification đã hoạt động — Cowdi sẽ nhắc bạn học mỗi ngày 💪',
      icon, badge,
      tag: 'test', url: '/',
    });
    res.json(result);
  } catch (err) {
    console.error('POST /api/push/test error:', err);
    res.status(500).json({ error: 'Lỗi gửi push.' });
  }
});

// ============================================================
//  STUDY SCHEDULE — lịch học do user tự đặt
// ============================================================

const DEFAULT_SCHEDULE = {
  enabled: false,
  daysOfWeek: [1, 2, 3, 4, 5],
  timeLocal: '19:00',
  timezone: 'Asia/Ho_Chi_Minh',
  message: '',
};

function parseDays(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; } catch { return []; }
  }
  return [];
}

function validateSchedule(body) {
  const out = {};
  out.enabled = !!body.enabled;
  const days = parseDays(body.daysOfWeek).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  out.daysOfWeek = [...new Set(days)].sort();
  const time = String(body.timeLocal || '').trim();
  out.timeLocal = /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : '19:00';
  out.timezone = String(body.timezone || 'Asia/Ho_Chi_Minh').slice(0, 60);
  out.message = String(body.message || '').slice(0, 200);
  return out;
}

// ── GET /api/schedule – lấy lịch học của user ──────────────────────
router.get('/schedule', requireAuth, async (req, res) => {
  try {
    const [[row]] = await pool.execute(
      `SELECT enabled, days_of_week, time_local, timezone, message, last_fired_at
       FROM study_schedules WHERE user_id = ?`,
      [req.user.id]
    );
    if (!row) return res.json(DEFAULT_SCHEDULE);
    res.json({
      enabled:    !!row.enabled,
      daysOfWeek: parseDays(row.days_of_week),
      timeLocal:  row.time_local,
      timezone:   row.timezone,
      message:    row.message || '',
      lastFiredAt: row.last_fired_at,
    });
  } catch (err) {
    console.error('GET /api/schedule error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── PUT /api/schedule – tạo / cập nhật lịch học ────────────────────
router.put('/schedule', requireAuth, async (req, res) => {
  const data = validateSchedule(req.body || {});
  try {
    await pool.execute(
      `INSERT INTO study_schedules
         (user_id, enabled, days_of_week, time_local, timezone, message)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         enabled       = VALUES(enabled),
         days_of_week  = VALUES(days_of_week),
         time_local    = VALUES(time_local),
         timezone      = VALUES(timezone),
         message       = VALUES(message)`,
      [
        req.user.id,
        data.enabled ? 1 : 0,
        JSON.stringify(data.daysOfWeek),
        data.timeLocal,
        data.timezone,
        data.message,
      ]
    );
    res.json({ ok: true, ...data });
  } catch (err) {
    console.error('PUT /api/schedule error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

export default router;
