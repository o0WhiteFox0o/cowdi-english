import './config/env.js';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport.js';
import authRouter from './routes/auth.js';
import apiRouter from './routes/api.js';
import adminRouter from './routes/admin.js';
import pool from './config/database.js';
import { startReminderJob } from './jobs/reminder.js';
import { isPushReady } from './config/push.js';

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Trust proxy (Nginx reverse proxy trên aaPanel) ───────────────────────────
app.set('trust proxy', 1);

// ── CORS: chỉ cho phép frontend domain ──────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Body parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ── Session (chỉ dùng trong quá trình OAuth dance) ──────────────────────────
app.use(session({
  secret:            process.env.SESSION_SECRET || 'cowdi_session_secret',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   process.env.NODE_ENV === 'production', // HTTPS only in prod
    httpOnly: true,
    maxAge:   5 * 60 * 1000, // 5 phút – chỉ đủ cho OAuth dance
  },
}));

// ── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/api',  apiRouter);
app.use('/api/admin', adminRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Khởi động ────────────────────────────────────────────────────────────────
async function start() {
  try {
    await pool.query('SELECT 1'); // kiểm tra kết nối DB
    console.log('✅ Database kết nối thành công');
    app.listen(PORT, () => {
      console.log(`🚀 Backend chạy tại http://localhost:${PORT}`);
      console.log(`   Google OAuth: http://localhost:${PORT}/auth/google`);
      if (isPushReady()) {
        console.log('🔔 Push notifications: ENABLED');
      } else {
        console.log('🔔 Push notifications: DISABLED (missing VAPID keys)');
      }
    });
    if (isPushReady()) {
      startReminderJob();
      console.log('⏰ Reminder job: started (runs every 1h)');
    }
  } catch (err) {
    console.error('❌ Không kết nối được database:', err.message);
    console.error('   Kiểm tra .env và đảm bảo MySQL đang chạy.');
    process.exit(1);
  }
}

start();
