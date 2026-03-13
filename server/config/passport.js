import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './database.js';

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleSub  = profile.id;
        const email      = profile.emails?.[0]?.value || '';
        const name       = profile.displayName        || '';
        const avatar     = profile.photos?.[0]?.value || null;

        // Upsert user – tạo mới hoặc cập nhật avatar/name nếu đã có
        const [rows] = await pool.execute(
          `INSERT INTO users (google_sub, email, display_name, avatar_url)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             display_name = VALUES(display_name),
             avatar_url   = VALUES(avatar_url),
             last_seen_at = CURRENT_TIMESTAMP`,
          [googleSub, email, name, avatar]
        );

        // Lấy user vừa insert/update
        const [[user]] = await pool.execute(
          'SELECT id, google_sub, email, display_name, avatar_url FROM users WHERE google_sub = ?',
          [googleSub]
        );

        // Tạo dòng progress nếu chưa tồn tại
        await pool.execute(
          `INSERT IGNORE INTO user_progress (user_id) VALUES (?)`,
          [user.id]
        );

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Passport session serialize (chỉ dùng trong OAuth dance, không lưu lâu dài)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const [[user]] = await pool.execute(
      'SELECT id, google_sub, email, display_name, avatar_url FROM users WHERE id = ?',
      [id]
    );
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
