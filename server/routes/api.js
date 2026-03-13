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

export default router;
