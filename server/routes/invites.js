import express from 'express';
import crypto from 'crypto';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const EXPIRY_DAYS    = 7;
const DAILY_LIMIT    = 5;   // số thiệp tối đa / ngày / user
const WEEKLY_LIMIT   = 20;  // số thiệp tối đa / 7 ngày / user

// ── Helper: tạo mã ngẫu nhiên 8 ký tự (A-Z, 2-9 — bỏ ký tự khó đọc) ───────
function generateCode() {
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bỏ I,O,0,1
  const bytes = crypto.randomBytes(8);
  let out = '';
  for (let i = 0; i < 8; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

// ── POST /api/invites — tạo thiệp mời mới ──────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const { pet_species = 'cowdi', message = null } = req.body || {};
    const safePet = String(pet_species).slice(0, 32);
    const safeMsg = message ? String(message).slice(0, 280) : null;

    // Rate limit
    const [[dayRow]] = await pool.execute(
      'SELECT COUNT(*) AS n FROM invites WHERE sender_id = ? AND created_at >= (NOW() - INTERVAL 1 DAY)',
      [req.user.id]
    );
    if ((dayRow?.n || 0) >= DAILY_LIMIT) {
      return res.status(429).json({ error: `Bạn đã gửi đủ ${DAILY_LIMIT} thiệp hôm nay. Thử lại sau nha!` });
    }
    const [[weekRow]] = await pool.execute(
      'SELECT COUNT(*) AS n FROM invites WHERE sender_id = ? AND created_at >= (NOW() - INTERVAL 7 DAY)',
      [req.user.id]
    );
    if ((weekRow?.n || 0) >= WEEKLY_LIMIT) {
      return res.status(429).json({ error: `Bạn đã gửi đủ ${WEEKLY_LIMIT} thiệp tuần này.` });
    }

    // Lấy info người gửi
    const [[user]] = await pool.execute(
      'SELECT display_name, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );

    // Sinh mã, đảm bảo unique (thử tối đa 5 lần)
    let code = null;
    for (let i = 0; i < 5; i++) {
      const candidate = generateCode();
      const [[exists]] = await pool.execute('SELECT 1 AS x FROM invites WHERE code = ?', [candidate]);
      if (!exists) { code = candidate; break; }
    }
    if (!code) return res.status(500).json({ error: 'Không tạo được mã. Thử lại.' });

    await pool.execute(
      `INSERT INTO invites (code, sender_id, sender_name, sender_avatar, pet_species, message, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [code, req.user.id, user?.display_name || '', user?.avatar_url || null, safePet, safeMsg, EXPIRY_DAYS]
    );

    const [[row]] = await pool.execute(
      'SELECT code, expires_at FROM invites WHERE code = ?',
      [code]
    );

    res.json({
      code,
      url: `/i/${code}`,
      expires_at: row.expires_at,
    });
  } catch (err) {
    console.error('POST /api/invites error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/invites/:code — đọc thông tin thiệp (không cần auth) ─────────
router.get('/:code', async (req, res) => {
  try {
    const code = String(req.params.code || '').toUpperCase().slice(0, 12);
    const [[row]] = await pool.execute(
      `SELECT code, sender_name, sender_avatar, pet_species, message,
              claimed_by, claimed_at, expires_at, created_at
       FROM invites WHERE code = ?`,
      [code]
    );
    if (!row) return res.status(404).json({ error: 'Thiệp không tồn tại hoặc đã hết hạn.' });

    const expired = new Date(row.expires_at) < new Date();
    res.json({
      code: row.code,
      sender_name: row.sender_name,
      sender_avatar: row.sender_avatar,
      pet_species: row.pet_species,
      message: row.message,
      claimed: !!row.claimed_by,
      claimed_at: row.claimed_at,
      expires_at: row.expires_at,
      created_at: row.created_at,
      expired,
    });
  } catch (err) {
    console.error('GET /api/invites/:code error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── POST /api/invites/:code/claim — user đã đăng nhập nhận thiệp ──────────
router.post('/:code/claim', requireAuth, async (req, res) => {
  try {
    const code = String(req.params.code || '').toUpperCase().slice(0, 12);
    const [[row]] = await pool.execute(
      'SELECT sender_id, claimed_by, expires_at FROM invites WHERE code = ?',
      [code]
    );
    if (!row) return res.status(404).json({ error: 'Thiệp không tồn tại.' });
    if (new Date(row.expires_at) < new Date()) return res.status(410).json({ error: 'Thiệp đã hết hạn.' });
    if (row.sender_id === req.user.id) return res.status(400).json({ error: 'Bạn không thể tự nhận thiệp của mình.' });
    if (row.claimed_by && row.claimed_by !== req.user.id) {
      return res.status(409).json({ error: 'Thiệp đã được người khác nhận.' });
    }
    if (row.claimed_by === req.user.id) {
      return res.json({ ok: true, already: true });
    }

    await pool.execute(
      'UPDATE invites SET claimed_by = ?, claimed_at = NOW() WHERE code = ?',
      [req.user.id, code]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/invites/:code/claim error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ── GET /api/invites/mine/list — lịch sử thiệp đã gửi ──────────────────────
router.get('/mine/list', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT code, pet_species, message, claimed_by, claimed_at, expires_at, created_at
       FROM invites WHERE sender_id = ?
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/invites/mine/list error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

export default router;
