import express from 'express';
import fs from 'node:fs/promises';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { DEFAULT_STORAGE_DIR } from './petMotionAdmin.js';
import {
  EMOJI_FILE_RE,
  HASHED_IMAGE_FILE_RE,
  buildAssetUrl,
  createMotionCache,
  isValidPetIdFormat,
  parseJsonCol,
  parseStage,
  resolveApprovedPetMotion,
  resolveSafeStoragePath,
  validatePetId,
} from '../utils/petMotion.js';
import { readFacingMap } from '../utils/petFacingStore.js';

/**
 * Router công khai cho người học đã đăng nhập (/api/pet-motion/*):
 * - GET /api/pet-motion/assets/published/:petId/:stage/:file (công khai, cache immutable 1 năm)
 * - GET /api/pet-motion/:petId (đã đăng nhập, chỉ trả dữ liệu đã duyệt, có cache phía server)
 */
export function createPetMotionPublicRouter({
  db = pool,
  storageDir = DEFAULT_STORAGE_DIR,
  motionCache = createMotionCache(),
  authMiddleware = requireAuth,
} = {}) {
  const router = express.Router();

  // ── GET /api/pet-motion/assets/emojis/:file(/raw) ──────────────
  // Phục vụ ảnh emoji tự thiết kế công khai (immutable 1 năm; hỗ trợ /raw tránh Nginx chặn 404)
  router.get(['/assets/emojis/:file', '/assets/emojis/:file/raw'], async (req, res) => {
    const { file } = req.params;
    if (!EMOJI_FILE_RE.test(file)) {
      return res.status(400).json({ error: 'Đường dẫn emoji không hợp lệ.' });
    }
    const absPath = resolveSafeStoragePath(storageDir, 'emojis', file);
    if (!absPath) {
      return res.status(400).json({ error: 'Đường dẫn emoji không hợp lệ.' });
    }
    try {
      const buf = await fs.readFile(absPath);
      const mime = file.endsWith('.webp') ? 'image/webp' : 'image/png';
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(buf);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'Không tìm thấy ảnh emoji.' });
      }
      console.error('GET emoji asset error:', err);
      res.status(500).json({ error: 'Lỗi đọc ảnh emoji.' });
    }
  });

  // ── GET /api/pet-motion/catalog ────────────────────────────────
  // Danh mục pet bổ sung/chỉnh sửa từ admin (pet_catalog) + avatar đã tải lên
  router.get('/catalog', async (_req, res) => {
    try {
      let catalogRows = [];
      try {
        const [rows] = await db.execute(
          `SELECT pet_id, name, species, emoji, element, pet_group, rarity, description,
                  evolutions_json, unlock_json, is_custom, is_active
             FROM pet_catalog
            WHERE is_active = 1
            ORDER BY created_at ASC, pet_id ASC`
        );
        catalogRows = Array.isArray(rows) ? rows : [];
      } catch {
        catalogRows = [];
      }

      let avatarRows = [];
      try {
        const [rows] = await db.execute(
          `SELECT pet_stage, avatar_path FROM pet_rigs WHERE avatar_path IS NOT NULL`
        );
        avatarRows = Array.isArray(rows) ? rows : [];
      } catch {
        avatarRows = [];
      }

      const avatars = {};
      for (const r of avatarRows) {
        if (r.pet_stage && r.avatar_path) {
          avatars[r.pet_stage] = buildAssetUrl('/api/pet-motion/assets', r.avatar_path);
        }
      }

      const pets = catalogRows.map((c) => ({
        id: c.pet_id,
        name: c.name,
        species: c.species,
        emoji: c.emoji,
        element: c.element,
        group: c.pet_group,
        rarity: c.rarity,
        description: c.description || '',
        evolutions: parseJsonCol(c.evolutions_json, []),
        unlockCondition: parseJsonCol(c.unlock_json, null),
        isCustom: Boolean(c.is_custom),
      }));

      const facing = await readFacingMap(storageDir);
      res.json({ pets, avatars, facing });
    } catch (err) {
      console.error('GET /api/pet-motion/catalog error:', err);
      res.status(500).json({ error: 'Lỗi tải danh mục pet.' });
    }
  });

  // ── GET /api/pet-motion/assets/avatars/:petId/:file(/raw) ──────
  // Phục vụ ảnh avatar tĩnh đã bổ sung từ trang quản trị (immutable 1 năm; hỗ trợ /raw tránh Nginx chặn 404)
  router.get(['/assets/avatars/:petId/:file', '/assets/avatars/:petId/:file/raw'], async (req, res) => {
    const { petId, file } = req.params;
    if (!(validatePetId(petId) || isValidPetIdFormat(petId)) || !/^c[1-5]-[0-9a-f]{8}\.(png|webp)$/.test(file)) {
      return res.status(400).json({ error: 'Đường dẫn ảnh không hợp lệ.' });
    }
    const absPath = resolveSafeStoragePath(storageDir, 'avatars', petId, file);
    if (!absPath) {
      return res.status(400).json({ error: 'Đường dẫn ảnh không hợp lệ.' });
    }
    try {
      const buf = await fs.readFile(absPath);
      const mime = file.endsWith('.webp') ? 'image/webp' : 'image/png';
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(buf);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'Không tìm thấy ảnh avatar.' });
      }
      console.error('GET avatar asset error:', err);
      res.status(500).json({ error: 'Lỗi đọc ảnh.' });
    }
  });

  // ── GET /api/pet-motion/assets/published/:petId/:stage/:file(/raw) ─
  // Phục vụ ảnh đã xuất bản công khai với Cache-Control immutable (tên file chứa sha1 hash).
  // Hỗ trợ hậu tố /raw để không bị rule regex .(png|webp)$ của Nginx chặn nhầm.
  // TUYỆT ĐỐI không phục vụ thư mục draft/.
  router.get(
    ['/assets/published/:petId/:stage/:file', '/assets/published/:petId/:stage/:file/raw'],
    async (req, res) => {
    const { petId, stage, file } = req.params;
    const stageNum = parseStage(stage);
    if (!(validatePetId(petId) || isValidPetIdFormat(petId)) || !stageNum || !HASHED_IMAGE_FILE_RE.test(file)) {
      return res.status(400).json({ error: 'Đường dẫn ảnh không hợp lệ.' });
    }

    const absPath = resolveSafeStoragePath(storageDir, 'published', petId, `c${stageNum}`, file);
    if (!absPath) {
      return res.status(400).json({ error: 'Đường dẫn ảnh không hợp lệ.' });
    }

    try {
      const buf = await fs.readFile(absPath);
      const mime = file.endsWith('.webp') ? 'image/webp' : 'image/png';
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(buf);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'Không tìm thấy ảnh đã xuất bản.' });
      }
      console.error('GET published asset error:', err);
      res.status(500).json({ error: 'Lỗi đọc ảnh.' });
    }
  });

  // ── GET /api/pet-motion/:petId ─────────────────────────────────
  // Chỉ trả dữ liệu đã duyệt của 5 cấp cho người học đã đăng nhập.
  // Cấp chưa duyệt rig thì KHÔNG có trong kết quả.
  router.get('/:petId', authMiddleware, async (req, res) => {
    const { petId } = req.params;
    if (!(validatePetId(petId) || isValidPetIdFormat(petId))) {
      return res.status(400).json({ error: 'petId không hợp lệ.' });
    }

    if (motionCache?.has(petId)) {
      return res.json(motionCache.get(petId));
    }

    try {
      const stageKeys = [1, 2, 3, 4, 5].map((s) => `${petId}/c${s}`);
      const placeholders = stageKeys.map(() => '?').join(',');

      const [rigRows] = await db.execute(
        `SELECT pet_stage, published_rig, published_images, status
           FROM pet_rigs
          WHERE pet_stage IN (${placeholders}) AND status = 'approved'`,
        stageKeys
      );

      if (rigRows.length === 0) {
        motionCache?.set(petId, {});
        return res.json({});
      }

      const [approvalRows] = await db.execute(
        `SELECT pet_stage, clip, approved
           FROM pet_motion_approvals
          WHERE pet_stage IN (${placeholders}) AND approved = 1`,
        stageKeys
      );

      const [clipRows] = await db.execute(
        `SELECT scope_key, clip, published_json
           FROM pet_motion_clips
          WHERE scope_key IN ('', ${placeholders}) AND published_json IS NOT NULL`,
        stageKeys
      );

      const payload = resolveApprovedPetMotion({
        petId,
        rigRows,
        approvalRows,
        clipRows,
      });

      motionCache?.set(petId, payload);
      res.json(payload);
    } catch (err) {
      console.error('GET /api/pet-motion/:petId error:', err);
      res.status(500).json({ error: 'Lỗi tải dữ liệu chuyển động pet.' });
    }
  });

  return router;
}

export default createPetMotionPublicRouter();
