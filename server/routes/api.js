import express from 'express';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/me – thông tin user hiện tại ───────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [[user]] = await pool.execute(
      'SELECT id, email, display_name, avatar_url, created_at, last_seen_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    res.json(user);
  } catch (err) {
    console.error('GET /api/me error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/progress – lấy tiến trình học ──────────────────────────────────
router.get('/progress', requireAuth, async (req, res) => {
  try {
    const [[row]] = await pool.execute(
      `SELECT total_xp, streak, last_active_date, lessons_completed,
              quizzes_completed, perfect_quizzes, words_learned,
              completed_lessons, word_status, active_days,
              achievements, daily_tasks, daily_date, updated_at
       FROM user_progress WHERE user_id = ?`,
      [req.user.id]
    );
    if (!row) return res.status(404).json({ error: 'Progress chưa được khởi tạo.' });

    // Chuyển về camelCase để khớp với frontend userData
    res.json({
      totalXP:          row.total_xp,
      streak:           row.streak,
      lastActiveDate:   row.last_active_date,
      lessonsCompleted: row.lessons_completed,
      quizzesCompleted: row.quizzes_completed,
      perfectQuizzes:   row.perfect_quizzes,
      wordsLearned:     row.words_learned,
      completedLessons: row.completed_lessons,
      wordStatus:       row.word_status,
      activeDays:       row.active_days,
      achievements:     row.achievements,
      dailyTasks:       row.daily_tasks,
      dailyDate:        row.daily_date,
      updatedAt:        row.updated_at,
    });
  } catch (err) {
    console.error('GET /api/progress error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── PUT /api/progress – lưu toàn bộ tiến trình ──────────────────────────────
router.put('/progress', requireAuth, async (req, res) => {
  const d = req.body;
  // Whitelist fields – không cho phép inject tuỳ ý
  const allowed = [
    'totalXP','streak','lastActiveDate','lessonsCompleted','quizzesCompleted',
    'perfectQuizzes','wordsLearned','completedLessons','wordStatus',
    'activeDays','achievements','dailyTasks','dailyDate'
  ];
  for (const key of Object.keys(d)) {
    if (!allowed.includes(key)) delete d[key];
  }

  try {
    await pool.execute(
      `UPDATE user_progress SET
         total_xp          = ?,
         streak            = ?,
         last_active_date  = ?,
         lessons_completed = ?,
         quizzes_completed = ?,
         perfect_quizzes   = ?,
         words_learned     = ?,
         completed_lessons = ?,
         word_status       = ?,
         active_days       = ?,
         achievements      = ?,
         daily_tasks       = ?,
         daily_date        = ?
       WHERE user_id = ?`,
      [
        d.totalXP          ?? 0,
        d.streak           ?? 0,
        d.lastActiveDate   ?? null,
        d.lessonsCompleted ?? 0,
        d.quizzesCompleted ?? 0,
        d.perfectQuizzes   ?? 0,
        d.wordsLearned     ?? 0,
        JSON.stringify(d.completedLessons ?? []),
        JSON.stringify(d.wordStatus       ?? {}),
        JSON.stringify(d.activeDays       ?? []),
        JSON.stringify(d.achievements     ?? []),
        JSON.stringify(d.dailyTasks       ?? { lessonDone: false, vocabDone: false }),
        d.dailyDate        ?? null,
        req.user.id,
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/progress error:', err);
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
    res.json(row.pet_data);
  } catch (err) {
    console.error('GET /api/pet-data error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── PUT /api/pet-data – lưu dữ liệu pet ─────────────────────────────────────
router.put('/pet-data', requireAuth, async (req, res) => {
  const d = req.body;
  // Whitelist top-level fields
  const allowed = ['activePetId', 'nickname', 'coins', 'totalCoinsEarned', 'collection', 'ownedItems', 'dailyQuests', 'weeklyQuests', 'petAchievements'];
  const clean = {};
  for (const key of allowed) {
    if (d[key] !== undefined) clean[key] = d[key];
  }
  try {
    await pool.execute(
      'UPDATE user_progress SET pet_data = ? WHERE user_id = ?',
      [JSON.stringify(clean), req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/pet-data error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/leaderboard – bảng xếp hạng pet (ẩn danh) ──────────────────────
router.get('/leaderboard', async (req, res) => {
  const type = req.query.type || 'power'; // power | collection | skill
  const skill = req.query.skill || 'speech';
  try {
    const [rows] = await pool.execute(
      'SELECT pet_data FROM user_progress WHERE pet_data IS NOT NULL'
    );
    const entries = [];
    for (const row of rows) {
      const data = typeof row.pet_data === 'string' ? JSON.parse(row.pet_data) : row.pet_data;
      if (!data || !data.collection) continue;
      const nick = data.nickname || 'Ẩn danh';
      const collection = data.collection;
      const collectionCount = Object.keys(collection).length;
      // Find best pet
      let bestPower = 0;
      let bestSkill = 0;
      let bestPetEmoji = '🐮';
      for (const pet of Object.values(collection)) {
        const speciesBase = { starter: 1.0, common: 1.0, rare: 1.1, epic: 1.2, legendary: 1.3, event: 1.1 };
        const evoMul = [0.5, 0.8, 1.0, 1.3, 1.5][pet.evolution || 0] || 1.0;
        const sk = pet.skills || {};
        const base = (sk.speech || 0) + (sk.intelligence || 0) + (sk.perception || 0) + (sk.creativity || 0);
        const power = Math.floor(base * evoMul);
        if (power > bestPower) {
          bestPower = power;
          bestPetEmoji = pet.speciesId ? '🐮' : '🐮'; // simplified
        }
        const skillVal = sk[skill] || 0;
        if (skillVal > bestSkill) bestSkill = skillVal;
      }
      entries.push({ nickname: nick, power: bestPower, collectionCount, skill: bestSkill });
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

export default router;
