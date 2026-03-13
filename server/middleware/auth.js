import jwt from 'jsonwebtoken';

/**
 * Middleware xác thực JWT từ header Authorization: Bearer <token>
 * Gắn req.user = { id, email, display_name, avatar_url }
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
    next();
  } catch {
    return res.status(401).json({ error: 'Token hết hạn hoặc không hợp lệ.' });
  }
}
