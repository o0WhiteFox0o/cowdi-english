import '../config/env.js';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

/**
 * Middleware xác thực JWT từ header Authorization: Bearer <token>
 * Gắn req.user = { id, email, display_name, avatar_url, is_admin }
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc thiếu.' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    _runHeartbeat(payload.id);
    next();
  } catch {
    return res.status(401).json({ error: 'Token hết hạn hoặc không hợp lệ.' });
  }
}

/**
 * Middleware chỉ cho phép admin (chạy SAU requireAuth).
 * Đọc lại is_admin từ DB để tránh JWT cũ bị stale.
 */
export async function requireAdmin(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ error: 'Chưa xác thực.' });
  try {
    const [[row]] = await pool.execute(
      'SELECT is_admin FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!row || !row.is_admin) {
      return res.status(403).json({ error: 'Không có quyền truy cập.' });
    }
    req.user.is_admin = 1;
    next();
  } catch (err) {
    console.error('requireAdmin error:', err);
    res.status(500).json({ error: 'Lỗi kiểm tra quyền.' });
  }
}

// In-memory throttle: { userId: lastTimestamp }
const _hbCache = new Map();
const HB_INTERVAL_MS = 5 * 60 * 1000; // 5 phút

function _runHeartbeat(uid) {
  if (!uid) return;
  const now = Date.now();
  const last = _hbCache.get(uid) || 0;
  if (now - last < HB_INTERVAL_MS) return;
  _hbCache.set(uid, now);
  Promise.all([
    pool.execute('UPDATE users SET last_seen_at = NOW() WHERE id = ?', [uid]),
    pool.execute(
      `INSERT INTO daily_traffic (user_id, date, hits, last_hit_at)
         VALUES (?, CURDATE(), 1, NOW())
       ON DUPLICATE KEY UPDATE hits = hits + 1, last_hit_at = NOW()`,
      [uid]
    ),
  ]).catch(err => console.error('heartbeat error:', err.message));
}

/**
 * (Tuỳ chọn) Express middleware dùng cho route riêng ngoài requireAuth.
 */
export function heartbeat(req, _res, next) {
  _runHeartbeat(req.user?.id);
  next();
}
