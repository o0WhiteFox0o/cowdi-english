import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';
import pool from '../config/database.js';

const router = express.Router();
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Bước 1: Redirect người dùng tới Google ──────────────────────────────────
// Frontend gọi: window.location.href = 'http://localhost:3001/auth/google'
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account', // luôn hiện màn hình chọn tài khoản
  })
);

// ── Bước 2: Google redirect về đây sau khi user đồng ý ──────────────────────
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND}/?login=failed` }),
  (req, res) => {
    // Tạo JWT chứa thông tin cơ bản của user
    const token = jwt.sign(
      {
        id:           req.user.id,
        email:        req.user.email,
        display_name: req.user.display_name,
        avatar_url:   req.user.avatar_url,
        is_admin:     req.user.is_admin ? 1 : 0,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Redirect về frontend với token
    res.redirect(`${FRONTEND}/auth-callback?token=${token}`);
  }
);

// ── Kiểm tra session (tuỳ chọn – debug) ─────────────────────────────────────
router.get('/status', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) return res.json({ loggedIn: false });
  try {
    const user = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    res.json({ loggedIn: true, user });
  } catch {
    res.json({ loggedIn: false });
  }
});

// ── Dev-only login (CHỈ bật khi NODE_ENV !== 'production' && ENABLE_DEV_LOGIN === 'true') ──
// Dùng để test ở localhost khi Google OAuth chưa khai báo localhost callback.
if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEV_LOGIN === 'true') {
  router.get('/dev-login', async (req, res) => {
    const host = req.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return res.status(403).json({ error: 'Chỉ cho phép đăng nhập thử ở localhost.' });
    }
    const role = req.query.role === 'user' ? 'user' : 'admin';
    const isAdminFlag = role === 'admin' ? 1 : 0;
    const email = role === 'admin' ? 'admin@cowdi.local' : 'learner@cowdi.local';
    const googleSub = role === 'admin' ? 'dev_admin_1' : 'dev_learner_1';
    const displayName = role === 'admin' ? 'Quản trị viên (Dev)' : 'Học viên (Dev)';

    try {
      await pool.execute(
        `INSERT INTO users (google_sub, email, display_name, is_admin)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), is_admin = VALUES(is_admin)`,
        [googleSub, email, displayName, isAdminFlag]
      );
      const [[user]] = await pool.execute(
        'SELECT id, email, display_name, avatar_url, is_admin FROM users WHERE email = ?',
        [email]
      );
      await pool.execute('INSERT IGNORE INTO user_progress (user_id) VALUES (?)', [user.id]);

      const token = jwt.sign(
        {
          id:           user.id,
          email:        user.email,
          display_name: user.display_name,
          avatar_url:   user.avatar_url,
          is_admin:     user.is_admin ? 1 : 0,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.redirect(`${FRONTEND}/auth-callback?token=${token}`);
    } catch (err) {
      console.error('GET /auth/dev-login error:', err);
      res.status(500).json({ error: 'Lỗi đăng nhập dev.' });
    }
  });
}

export default router;
