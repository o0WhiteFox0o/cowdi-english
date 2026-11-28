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

// ── GET /api/admin/friend-reports – danh sách báo cáo bạn bè (FR-FRD-04) ────
router.get('/friend-reports', async (req, res) => {
  try {
    const onlyOpen = req.query.handled === '0';
    const [rows] = await pool.execute(
      `SELECT r.id, r.reporter_id, r.reported_id, r.reason, r.created_at, r.handled,
              u1.nickname AS reporter_nickname, u2.nickname AS reported_nickname
         FROM friend_reports r
         LEFT JOIN users u1 ON u1.id = r.reporter_id
         LEFT JOIN users u2 ON u2.id = r.reported_id
        ${onlyOpen ? 'WHERE r.handled = 0' : ''}
        ORDER BY r.handled ASC, r.created_at DESC
        LIMIT 100`
    );
    res.json({ reports: rows });
  } catch (err) {
    console.error('GET /api/admin/friend-reports error:', err);
    res.status(500).json({ error: 'Lỗi tải báo cáo bạn bè.' });
  }
});

// ── PATCH /api/admin/friend-reports/:id/handle – đánh dấu đã xử lý ──────────
router.patch('/friend-reports/:id/handle', async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({ error: 'ID báo cáo không hợp lệ.' });
    }
    await pool.execute('UPDATE friend_reports SET handled = 1 WHERE id = ?', [reportId]);
    res.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/admin/friend-reports/:id/handle error:', err);
    res.status(500).json({ error: 'Lỗi cập nhật báo cáo.' });
  }
});

// ── GET /api/admin/users?q=&limit=30 – tìm kiếm tài khoản & ví Kinh tế v2 ───
router.get('/users', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const limit = Math.min(Math.max(parseInt(req.query.limit || '30', 10) || 30, 1), 100);
    const like = `%${q}%`;

    const [users] = await pool.execute(
      `SELECT u.id, u.email, u.display_name, u.nickname, u.is_admin, u.created_at, u.last_seen_at,
              up.total_xp, up.streak, up.lessons_completed
         FROM users u
    LEFT JOIN user_progress up ON up.user_id = u.id
        ${q ? 'WHERE u.email LIKE ? OR u.display_name LIKE ? OR u.nickname LIKE ?' : ''}
        ORDER BY u.last_seen_at DESC, u.created_at DESC
        LIMIT ${limit}`,
      q ? [like, like, like] : []
    );

    const ids = users.map((u) => u.id);
    const ledgerByUser = new Map();
    const arenaMap = new Map();

    if (ids.length > 0) {
      const ph = ids.map(() => '?').join(',');
      try {
        const [ledgers] = await pool.execute(
          `SELECT user_id, currency, COALESCE(SUM(amount), 0) AS total
             FROM wallet_ledger
            WHERE user_id IN (${ph})
            GROUP BY user_id, currency`,
          ids
        );
        for (const row of ledgers) {
          if (!ledgerByUser.has(row.user_id)) ledgerByUser.set(row.user_id, {});
          ledgerByUser.get(row.user_id)[row.currency] = Number(row.total || 0);
        }
      } catch {
        // Bảng wallet_ledger có thể chưa bật trên DB cũ
      }

      try {
        const [arenas] = await pool.execute(
          `SELECT user_id, tickets, lp, tier, wins_this_week
             FROM arena_profiles
            WHERE user_id IN (${ph})`,
          ids
        );
        for (const a of arenas) arenaMap.set(a.user_id, a);
      } catch {
        // Bảng arena_profiles có thể chưa bật trên DB cũ
      }
    }

    res.json({
      ok: true,
      users: users.map((u) => {
        const l = ledgerByUser.get(u.id) || {};
        const a = arenaMap.get(u.id);
        const totalXp = Number(u.total_xp || 0);
        const milk = Math.max(0, totalXp + Number(l.milk || 0));
        return {
          id: u.id,
          email: u.email,
          displayName: u.display_name || u.nickname || '(Chưa đặt tên)',
          isAdmin: Boolean(u.is_admin),
          createdAt: u.created_at,
          lastSeenAt: u.last_seen_at,
          totalXp,
          streak: Number(u.streak || 0),
          lessonsCompleted: Number(u.lessons_completed || 0),
          wallet: {
            milk,
            gem: Math.max(0, Number(l.gem || 0)),
            stone: Math.max(0, Number(l.stone || 0)),
            stoneShard: Math.max(0, Number(l.stone_shard || 0)),
            arenaTickets: a ? Number(a.tickets || 0) : 0,
          },
          arena: a
            ? {
                lp: Number(a.lp || 0),
                winsThisWeek: Number(a.wins_this_week || 0),
                tier: a.tier || 'bronze',
              }
            : null,
        };
      }),
    });
  } catch (err) {
    console.error('GET /api/admin/users error:', err);
    res.status(500).json({ error: 'Lỗi tải danh sách người dùng.' });
  }
});

// ── GET /api/admin/economy – tổng quan Kinh tế v2 (ví, ledger 7 ngày, đấu trường) ─
router.get('/economy', async (_req, res) => {
  const result = {
    ok: true,
    circulation: { milk: 0, gem: 0, stone: 0, stoneShard: 0, arenaTickets: 0, walletCount: 0 },
    ledger7d: [],
    arenaMatches7d: 0,
    gachaPulls7d: 0,
  };

  try {
    const [[xpRow]] = await pool.execute(
      `SELECT COUNT(*) AS walletCount, COALESCE(SUM(total_xp), 0) AS sumXp FROM user_progress`
    );
    const [curRows] = await pool.execute(
      `SELECT currency, COALESCE(SUM(amount), 0) AS total FROM wallet_ledger GROUP BY currency`
    );
    const curMap = Object.fromEntries(curRows.map((r) => [r.currency, Number(r.total || 0)]));
    let ticketSum = 0;
    try {
      const [[tRow]] = await pool.execute(`SELECT COALESCE(SUM(tickets), 0) AS total FROM arena_profiles`);
      ticketSum = Number(tRow?.total || 0);
    } catch { /* fallback 0 */ }

    result.circulation = {
      walletCount: Number(xpRow?.walletCount || 0),
      milk: Math.max(0, Number(xpRow?.sumXp || 0) + Number(curMap.milk || 0)),
      gem: Math.max(0, Number(curMap.gem || 0)),
      stone: Math.max(0, Number(curMap.stone || 0)),
      stoneShard: Math.max(0, Number(curMap.stone_shard || 0)),
      arenaTickets: ticketSum,
    };
  } catch { /* fallback 0 */ }

  try {
    const [rows] = await pool.execute(
      `SELECT currency, reason, COUNT(*) AS txCount, COALESCE(SUM(amount), 0) AS netDelta
         FROM wallet_ledger
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY currency, reason
        ORDER BY txCount DESC
        LIMIT 20`
    );
    result.ledger7d = rows.map((r) => ({
      currency: r.currency,
      reason: r.reason,
      txCount: Number(r.txCount || 0),
      netDelta: Number(r.netDelta || 0),
    }));
  } catch { /* fallback [] */ }

  try {
    const [[am]] = await pool.execute(
      `SELECT COUNT(*) AS c FROM arena_matches WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    result.arenaMatches7d = Number(am?.c || 0);
  } catch { /* fallback 0 */ }

  try {
    const [[gp]] = await pool.execute(
      `SELECT COUNT(*) AS c FROM wallet_ledger
        WHERE reason LIKE 'gacha%' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    result.gachaPulls7d = Number(gp?.c || 0);
  } catch { /* fallback 0 */ }

  res.json(result);
});

export default router;
