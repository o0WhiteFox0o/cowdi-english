import express from 'express';
import pool from '../config/database.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Tất cả route dưới đây đều yêu cầu admin
router.use(requireAuth, requireAdmin);

// ── GET /api/admin/overview ───────────────────────────────────────
//   Trả về toàn bộ chỉ số dashboard: KPI + timeseries + top users + churn
router.get('/overview', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days || '30', 10) || 30, 90);

    // 1) KPI tổng
    const [[totals]] = await pool.execute(
      `SELECT
         (SELECT COUNT(*) FROM users)                                                            AS totalUsers,
         (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY))        AS newToday,
         (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))        AS newWeek,
         (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))       AS newMonth,
         (SELECT COUNT(DISTINCT user_id) FROM daily_traffic WHERE date = CURDATE())              AS dau,
         (SELECT COUNT(DISTINCT user_id) FROM daily_traffic
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY))                                   AS wau,
         (SELECT COUNT(DISTINCT user_id) FROM daily_traffic
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY))                                  AS mau,
         (SELECT IFNULL(SUM(hits), 0) FROM daily_traffic WHERE date = CURDATE())                 AS hitsToday,
         (SELECT IFNULL(SUM(hits), 0) FROM daily_traffic
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY))                                   AS hitsWeek
      `
    );

    // 2) Timeseries: signups + active users + traffic theo ngày (N ngày gần nhất)
    const [signupRows] = await pool.execute(
      `SELECT DATE(created_at) AS d, COUNT(*) AS c
         FROM users
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY d ORDER BY d ASC`,
      [days]
    );
    const [activeRows] = await pool.execute(
      `SELECT date AS d, COUNT(DISTINCT user_id) AS c, SUM(hits) AS hits
         FROM daily_traffic
        WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY date ORDER BY date ASC`,
      [days]
    );

    // Lấp ngày trống để vẽ chart liền mạch
    const series = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isoDate = (offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      return d.toISOString().slice(0, 10);
    };
    const sMap = new Map(signupRows.map(r => [String(r.d).slice(0, 10), Number(r.c)]));
    const aMap = new Map(activeRows.map(r => [String(r.d).slice(0, 10), { active: Number(r.c), hits: Number(r.hits) }]));
    for (let i = days - 1; i >= 0; i--) {
      const dStr = isoDate(i);
      const a = aMap.get(dStr) || { active: 0, hits: 0 };
      series.push({
        date: dStr,
        signups: sMap.get(dStr) || 0,
        active:  a.active,
        hits:    a.hits,
      });
    }

    // 3) Top 10 user hoạt động (7 ngày)
    const [topUsers] = await pool.execute(
      `SELECT u.id, u.email, u.display_name, u.avatar_url, u.created_at, u.last_seen_at,
              SUM(dt.hits) AS hits7d,
              COUNT(DISTINCT dt.date) AS activeDays7d,
              up.total_xp, up.streak, up.lessons_completed
         FROM daily_traffic dt
         JOIN users u           ON u.id = dt.user_id
    LEFT JOIN user_progress up  ON up.user_id = u.id
        WHERE dt.date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY u.id
        ORDER BY hits7d DESC
        LIMIT 10`
    );

    // 4) User mới đăng ký gần nhất
    const [recentSignups] = await pool.execute(
      `SELECT id, email, display_name, avatar_url, created_at, last_seen_at
         FROM users
        ORDER BY created_at DESC
        LIMIT 10`
    );

    // 5) User có nguy cơ rời (last_seen 3-14 ngày + có XP)
    const [atRisk] = await pool.execute(
      `SELECT u.id, u.email, u.display_name, u.avatar_url, u.last_seen_at,
              up.streak, up.total_xp, up.lessons_completed,
              TIMESTAMPDIFF(DAY, u.last_seen_at, NOW()) AS daysAway
         FROM users u
         JOIN user_progress up ON up.user_id = u.id
        WHERE u.last_seen_at IS NOT NULL
          AND u.last_seen_at < DATE_SUB(NOW(), INTERVAL 3 DAY)
          AND u.last_seen_at > DATE_SUB(NOW(), INTERVAL 14 DAY)
          AND up.total_xp > 100
        ORDER BY u.last_seen_at DESC
        LIMIT 15`
    );

    // 6) Retention đơn giản: trong N user mới 7 ngày trước, bao nhiêu vẫn active 7 ngày qua?
    const [[retention]] = await pool.execute(
      `SELECT
         (SELECT COUNT(*) FROM users
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
              AND created_at <  DATE_SUB(CURDATE(), INTERVAL 7 DAY))  AS cohort,
         (SELECT COUNT(DISTINCT u.id) FROM users u
            JOIN daily_traffic dt ON dt.user_id = u.id
           WHERE u.created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
             AND u.created_at <  DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             AND dt.date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY))      AS retained
      `
    );

    res.json({
      kpi: {
        totalUsers: Number(totals.totalUsers || 0),
        newToday:   Number(totals.newToday || 0),
        newWeek:    Number(totals.newWeek || 0),
        newMonth:   Number(totals.newMonth || 0),
        dau:        Number(totals.dau || 0),
        wau:        Number(totals.wau || 0),
        mau:        Number(totals.mau || 0),
        hitsToday:  Number(totals.hitsToday || 0),
        hitsWeek:   Number(totals.hitsWeek || 0),
        stickiness: totals.mau ? +(totals.dau / totals.mau).toFixed(2) : 0, // DAU/MAU
      },
      retention7d: {
        cohort:   Number(retention.cohort || 0),
        retained: Number(retention.retained || 0),
        rate:     retention.cohort ? +(retention.retained / retention.cohort).toFixed(2) : 0,
      },
      series,
      topUsers,
      recentSignups,
      atRisk,
    });
  } catch (err) {
    console.error('GET /api/admin/overview error:', err);
    res.status(500).json({ error: 'Lỗi tải dữ liệu admin.' });
  }
});

export default router;
