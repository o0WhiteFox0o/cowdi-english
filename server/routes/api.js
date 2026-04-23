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
              achievements, daily_tasks, daily_date,
              srs_data, checkpoint_scores, skill_xp, updated_at
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

    // Chuyển về camelCase để khớp với frontend userData
    res.json({
      totalXP:          row.total_xp,
      streak:           row.streak,
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
    'activeDays','achievements','dailyTasks','dailyDate',
    'srsData','checkpointScores','skillXP'
  ];
  for (const key of Object.keys(d)) {
    if (!allowed.includes(key)) delete d[key];
  }

  const params = [
    req.user.id,
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
    JSON.stringify(d.srsData          ?? {}),
    JSON.stringify(d.checkpointScores ?? {}),
    JSON.stringify(d.skillXP          ?? { listening: 0, speaking: 0, reading: 0, writing: 0 }),
  ];

  try {
    await pool.execute(
      `INSERT INTO user_progress
         (user_id, total_xp, streak, last_active_date,
          lessons_completed, quizzes_completed, perfect_quizzes, words_learned,
          completed_lessons, word_status, active_days, achievements,
          daily_tasks, daily_date, srs_data, checkpoint_scores, skill_xp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         total_xp          = VALUES(total_xp),
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
         skill_xp          = VALUES(skill_xp)`,
      params
    );
    res.json({ ok: true });
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
  // Whitelist top-level fields
  const allowed = ['activePetId', 'nickname', 'coins', 'totalCoinsEarned', 'collection', 'ownedItems', 'dailyQuests', 'weeklyQuests', 'petAchievements'];
  const clean = {};
  for (const key of allowed) {
    if (d[key] !== undefined) clean[key] = d[key];
  }
  try {
    await pool.execute(
      `INSERT INTO user_progress (user_id, pet_data)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE pet_data = VALUES(pet_data)`,
      [req.user.id, JSON.stringify(clean)]
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
      let activePetName = 'Pet';
      if (data.activePetId && collection[data.activePetId]) {
        const ap = collection[data.activePetId];
        activePetSpecies = ap.speciesId;
        activePetXp = ap.totalXpEarned || 0;
        activePetName = ap.customName || 'Pet';
      }
      for (const pet of Object.values(collection)) {
        const evoMul = [0.5, 0.8, 1.0, 1.3, 1.5][pet.evolution || 0] || 1.0;
        const rarityBonus = { starter: 1.0, common: 1.0, rare: 1.1, epic: 1.2, legendary: 1.3, event: 1.1 }[pet.rarity] || 1.0;
        const sk = pet.skills || {};
        const base = (sk.listening || sk.perception || 0) + (sk.speaking || sk.speech || 0) + (sk.reading || sk.intelligence || 0) + (sk.writing || sk.creativity || 0);
        const power = Math.floor(base * evoMul * rarityBonus);
        if (power > bestPower) bestPower = power;
        const skillVal = sk[skill] || 0;
        if (skillVal > bestSkill) bestSkill = skillVal;
      }
      entries.push({
        nickname: nick, power: bestPower, collectionCount, skill: bestSkill,
        speciesId: activePetSpecies, totalXpEarned: activePetXp, petName: activePetName,
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
  return { speciesId: pet.speciesId, totalXpEarned: pet.totalXpEarned || 0, customName: pet.customName };
}

function formatDuelRow(row) {
  return {
    id: row.id,
    challengerId: row.challenger_id,
    opponentId: row.opponent_id,
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
    challengerPet: parsePetSummary(row.challenger_pet),
    opponentPet: parsePetSummary(row.opponent_pet),
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

// ── POST /api/duel – Tạo thách đấu mới ──────────────────────────────────────
router.post('/duel', requireAuth, async (req, res) => {
  const { quizData, answers, time } = req.body;
  if (!Array.isArray(quizData) || quizData.length < 5 || quizData.length > 20) {
    return res.status(400).json({ error: 'Quiz data không hợp lệ.' });
  }
  if (!Array.isArray(answers) || answers.length !== quizData.length) {
    return res.status(400).json({ error: 'Answers không hợp lệ.' });
  }
  // Sanitize quiz data
  const cleanQuiz = quizData.map(q => ({
    question: String(q.question || '').slice(0, 500),
    options: (q.options || []).slice(0, 6).map(o => String(o).slice(0, 200)),
    correct: parseInt(q.correct) || 0,
    category: String(q.category || 'vocabulary').slice(0, 30),
  }));
  // Score challenger's answers
  const score = answers.reduce((s, a, i) => s + (parseInt(a) === cleanQuiz[i].correct ? 1 : 0), 0);
  const safeTime = Math.max(0, Math.min(parseInt(time) || 0, 600));
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  try {
    const [result] = await pool.execute(
      `INSERT INTO challenges (challenger_id, status, quiz_data, challenger_answers, challenger_score, challenger_time, expires_at)
       VALUES (?, 'pending', ?, ?, ?, ?, ?)`,
      [req.user.id, JSON.stringify(cleanQuiz), JSON.stringify(answers.map(a => parseInt(a) || 0)), score, safeTime, expiresAt]
    );
    // Award league points for creating duel
    await pool.execute(
      'UPDATE user_progress SET league_points = COALESCE(league_points, 0) + 5 WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ ok: true, challengeId: result.insertId, score });
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
    const [rows] = await pool.execute(
      `SELECT c.*,
              p1.pet_data AS challenger_pet,
              COALESCE(p1.nickname, u1.display_name, 'Ẩn danh') AS challenger_nick
       FROM challenges c
       LEFT JOIN user_progress p1 ON c.challenger_id = p1.user_id
       LEFT JOIN users u1 ON c.challenger_id = u1.id
       WHERE c.status = 'pending'
         AND c.challenger_id != ?
         AND c.expires_at > NOW()
       ORDER BY c.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json(rows.map(formatDuelRow));
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

    const quizData = typeof row.quiz_data === 'string' ? JSON.parse(row.quiz_data) : row.quiz_data;
    // Strip correct answers so opponent can't cheat
    const questions = (quizData || []).map(({ question, options, category }) => ({
      question, options, category,
    }));

    // Send challenger's per-question results (correct/wrong) without revealing answers
    const challengerAnswers = typeof row.challenger_answers === 'string' ? JSON.parse(row.challenger_answers) : (row.challenger_answers || []);
    const challengerResults = (quizData || []).map((q, i) => ({
      correct: parseInt(challengerAnswers[i]) === q.correct,
    }));

    res.json({
      id: row.id,
      challengerId: row.challenger_id,
      status: row.status,
      challengerNick: row.challenger_nick || 'Ẩn danh',
      challengerPet: parsePetSummary(row.challenger_pet),
      challengerResults,
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
  const { answers, time } = req.body;
  if (!challengeId) return res.status(400).json({ error: 'ID không hợp lệ.' });
  if (!Array.isArray(answers)) return res.status(400).json({ error: 'Answers không hợp lệ.' });

  try {
    const [[challenge]] = await pool.execute(
      "SELECT * FROM challenges WHERE id = ? AND status = 'pending' AND challenger_id != ?",
      [challengeId, req.user.id]
    );
    if (!challenge) return res.status(404).json({ error: 'Thách đấu không tồn tại hoặc đã kết thúc.' });

    const quizData = typeof challenge.quiz_data === 'string' ? JSON.parse(challenge.quiz_data) : challenge.quiz_data;
    if (answers.length !== quizData.length) return res.status(400).json({ error: 'Số câu trả lời không khớp.' });

    // Score opponent's answers server-side
    const opponentScore = answers.reduce((s, a, i) => s + (parseInt(a) === quizData[i].correct ? 1 : 0), 0);
    const safeTime = Math.max(0, Math.min(parseInt(time) || 0, 600));
    const challengerScore = challenge.challenger_score;
    const challengerTime = challenge.challenger_time;

    // Determine winner (higher score wins; tie-break by faster time)
    let winnerId = null;
    if (opponentScore > challengerScore) winnerId = req.user.id;
    else if (opponentScore < challengerScore) winnerId = challenge.challenger_id;
    else if (safeTime < challengerTime) winnerId = req.user.id;
    else if (safeTime > challengerTime) winnerId = challenge.challenger_id;
    // else: draw (winnerId stays null)

    // Update challenge
    await pool.execute(
      `UPDATE challenges SET
         opponent_id = ?, opponent_answers = ?, opponent_score = ?, opponent_time = ?,
         winner_id = ?, status = 'completed'
       WHERE id = ?`,
      [req.user.id, JSON.stringify(answers.map(a => parseInt(a) || 0)), opponentScore, safeTime, winnerId, challengeId]
    );

    // Update league points + duel stats for both players
    if (winnerId === req.user.id) {
      // Opponent wins
      await pool.execute(
        'UPDATE user_progress SET duel_wins = COALESCE(duel_wins,0) + 1, duel_streak = COALESCE(duel_streak,0) + 1, league_points = COALESCE(league_points,0) + 30 WHERE user_id = ?',
        [req.user.id]
      );
      await pool.execute(
        'UPDATE user_progress SET duel_losses = COALESCE(duel_losses,0) + 1, duel_streak = 0, league_points = COALESCE(league_points,0) + 5 WHERE user_id = ?',
        [challenge.challenger_id]
      );
    } else if (winnerId === challenge.challenger_id) {
      // Challenger wins
      await pool.execute(
        'UPDATE user_progress SET duel_wins = COALESCE(duel_wins,0) + 1, duel_streak = COALESCE(duel_streak,0) + 1, league_points = COALESCE(league_points,0) + 30 WHERE user_id = ?',
        [challenge.challenger_id]
      );
      await pool.execute(
        'UPDATE user_progress SET duel_losses = COALESCE(duel_losses,0) + 1, duel_streak = 0, league_points = COALESCE(league_points,0) + 5 WHERE user_id = ?',
        [req.user.id]
      );
    } else {
      // Draw
      await pool.execute(
        'UPDATE user_progress SET league_points = COALESCE(league_points,0) + 15 WHERE user_id IN (?, ?)',
        [req.user.id, challenge.challenger_id]
      );
    }

    res.json({
      ok: true,
      opponentScore,
      challengerScore,
      opponentTime: safeTime,
      challengerTime,
      winnerId,
    });
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
router.get('/student-rankings', async (req, res) => {
  const sort = req.query.sort || 'xp'; // xp | streak | lessons | words | quizzes | achievements
  try {
    const [rows] = await pool.execute(
      `SELECT up.total_xp, up.streak, up.lessons_completed, up.quizzes_completed,
              up.perfect_quizzes, up.words_learned, up.achievements, up.active_days,
              up.nickname, up.pet_data, u.display_name
       FROM user_progress up
       LEFT JOIN users u ON u.id = up.user_id
       WHERE up.total_xp > 0 AND up.lessons_completed > 0`
    );
    const entries = rows.map(row => {
      const pd = typeof row.pet_data === 'string' ? JSON.parse(row.pet_data) : row.pet_data;
      const achList = typeof row.achievements === 'string' ? JSON.parse(row.achievements || '[]') : (row.achievements || []);
      const activeDays = typeof row.active_days === 'string' ? JSON.parse(row.active_days || '[]') : (row.active_days || []);
      const pet = parsePetSummary(row.pet_data);
      return {
        nickname: row.nickname || pd?.nickname || row.display_name || 'Ẩn danh',
        totalXP: row.total_xp || 0,
        streak: row.streak || 0,
        lessonsCompleted: row.lessons_completed || 0,
        quizzesCompleted: row.quizzes_completed || 0,
        perfectQuizzes: row.perfect_quizzes || 0,
        wordsLearned: row.words_learned || 0,
        achievementCount: Array.isArray(achList) ? achList.length : 0,
        activeDaysCount: Array.isArray(activeDays) ? activeDays.length : 0,
        pet,
      };
    });
    // Sort
    const sortMap = {
      xp: (a, b) => b.totalXP - a.totalXP,
      streak: (a, b) => b.streak - a.streak,
      lessons: (a, b) => b.lessonsCompleted - a.lessonsCompleted,
      words: (a, b) => b.wordsLearned - a.wordsLearned,
      quizzes: (a, b) => b.quizzesCompleted - a.quizzesCompleted,
      achievements: (a, b) => b.achievementCount - a.achievementCount,
    };
    entries.sort(sortMap[sort] || sortMap.xp);
    res.json(entries.slice(0, 50));
  } catch (err) {
    console.error('GET /api/student-rankings error:', err);
    res.json([]);
  }
});

export default router;
