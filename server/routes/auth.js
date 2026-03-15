import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';

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

export default router;
