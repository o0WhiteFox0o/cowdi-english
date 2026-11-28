// ============================================================
//  Media Assets Router (/api/media/* công khai & /api/admin/media/* quản trị)
//  Cho phép Admin tải ảnh Flashcard từ vựng, Icon UI, Sảnh nền, Vật phẩm cửa hàng,
//  Story & Chủ đề lưu trực tiếp trên server (học sinh thấy ngay không cần build).
// ============================================================

import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DEFAULT_MEDIA_STORAGE_DIR = path.resolve(__dirname, '..', 'storage', 'media');

const MAX_MEDIA_BYTES = 3 * 1024 * 1024; // 3 MB
const VALID_CATEGORIES = new Set([
  'vocab',
  'icon',
  'cosmetic',
  'shop',
  'story',
  'topic',
  'subtopic',
  'minigame',
  'practice',
  'other',
]);
const KEY_RE = /^[a-z0-9][a-z0-9_:./-]{1,120}$/i;
const FILE_RE = /^[a-z0-9_-]{1,80}-[0-9a-f]{8}\.(png|webp|jpg)$/;

const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA_BYTES, files: 1 },
}).single('file');

function runMulter(req, res) {
  return new Promise((resolve, reject) => {
    uploadSingle(req, res, (err) => {
      if (!err) return resolve();
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        const e = new Error('Ảnh vượt quá giới hạn 3 MB.');
        e.status = 413;
        return reject(e);
      }
      const e = new Error(err.message || 'Lỗi đọc file ảnh tải lên.');
      e.status = 400;
      return reject(e);
    });
  });
}

/** Kiểm tra chữ ký magic bytes cho PNG / WebP / JPEG. */
export function detectMediaImageType(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { ext: '.png', mime: 'image/png' };
  }
  // WebP: RIFF....WEBP
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return { ext: '.webp', mime: 'image/webp' };
  }
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg' };
  }
  return null;
}

function sha1Short(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
}

function safeSlug(str) {
  return String(str || 'asset')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64) || 'asset';
}

function resolveSafePath(rootDir, ...segments) {
  const base = path.resolve(rootDir);
  const full = path.resolve(base, ...segments);
  if (full !== base && !full.startsWith(`${base}${path.sep}`)) return null;
  return full;
}

export async function readMediaManifest(storageDir) {
  const filePath = path.join(storageDir, 'manifest.json');
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch (err) {
    if (err?.code === 'ENOENT') return {};
    return {};
  }
}

export async function writeMediaManifest(storageDir, manifest) {
  await fs.mkdir(storageDir, { recursive: true });
  const filePath = path.join(storageDir, 'manifest.json');
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(manifest, null, 2), 'utf8');
  await fs.rename(tmpPath, filePath);
}

/** Router công khai (/api/media/*): trả manifest và phục vụ file ảnh đã upload. */
export function createMediaPublicRouter({ storageDir = DEFAULT_MEDIA_STORAGE_DIR } = {}) {
  const router = express.Router();

  router.get('/manifest', async (_req, res) => {
    try {
      const manifest = await readMediaManifest(storageDir);
      res.setHeader('Cache-Control', 'no-cache');
      res.json({ ok: true, overrides: manifest });
    } catch (err) {
      console.error('GET /api/media/manifest error:', err);
      res.status(500).json({ error: 'Lỗi tải danh sách hình ảnh.' });
    }
  });

  // Hỗ trợ hậu tố /raw để không bị rule regex ảnh tĩnh của Nginx chặn nhầm thành 404
  router.get(['/files/:category/:file', '/files/:category/:file/raw'], async (req, res) => {
    const { category, file } = req.params;
    if (!VALID_CATEGORIES.has(category) || !FILE_RE.test(file)) {
      return res.status(400).json({ error: 'Đường dẫn ảnh không hợp lệ.' });
    }
    const absPath = resolveSafePath(storageDir, 'files', category, file);
    if (!absPath) {
      return res.status(400).json({ error: 'Đường dẫn ảnh không hợp lệ.' });
    }
    try {
      const buf = await fs.readFile(absPath);
      const mime = file.endsWith('.webp')
        ? 'image/webp'
        : file.endsWith('.jpg')
          ? 'image/jpeg'
          : 'image/png';
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(buf);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'Không tìm thấy ảnh.' });
      }
      console.error('GET /api/media/files error:', err);
      res.status(500).json({ error: 'Lỗi đọc ảnh.' });
    }
  });

  return router;
}

/** Router quản trị (/api/admin/media/*): upload & xoá ảnh trực tiếp trên server. */
export function createMediaAdminRouter({
  storageDir = DEFAULT_MEDIA_STORAGE_DIR,
  authMiddleware = requireAuth,
  adminMiddleware = requireAdmin,
} = {}) {
  const router = express.Router();
  router.use(authMiddleware, adminMiddleware);

  router.get('/manifest', async (_req, res) => {
    try {
      const manifest = await readMediaManifest(storageDir);
      res.json({ ok: true, overrides: manifest });
    } catch (err) {
      console.error('GET /api/admin/media/manifest error:', err);
      res.status(500).json({ error: 'Lỗi tải manifest ảnh.' });
    }
  });

  router.post('/upload', async (req, res) => {
    try {
      await runMulter(req, res);
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }

    const key = String(req.body?.key || '').trim();
    const rawCat = String(req.body?.category || 'other').trim().toLowerCase();
    const category = VALID_CATEGORIES.has(rawCat) ? rawCat : 'other';
    if (!KEY_RE.test(key)) {
      return res.status(400).json({ error: 'Mã tài nguyên (key) không hợp lệ.' });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'Thiếu file ảnh tải lên (field "file").' });
    }
    const detected = detectMediaImageType(req.file.buffer);
    if (!detected) {
      return res.status(400).json({ error: 'Chỉ hỗ trợ ảnh PNG, WebP hoặc JPEG hợp lệ.' });
    }

    const hash = sha1Short(req.file.buffer);
    const fileName = `${safeSlug(key)}-${hash}${detected.ext}`;
    const absPath = resolveSafePath(storageDir, 'files', category, fileName);
    if (!absPath) {
      return res.status(400).json({ error: 'Đường dẫn lưu file không hợp lệ.' });
    }

    try {
      await fs.mkdir(path.dirname(absPath), { recursive: true });
      await fs.writeFile(absPath, req.file.buffer);

      const manifest = await readMediaManifest(storageDir);
      const prev = manifest[key];
      if (prev?.file && prev?.category && prev.file !== fileName) {
        const oldPath = resolveSafePath(storageDir, 'files', prev.category, prev.file);
        if (oldPath) await fs.unlink(oldPath).catch(() => {});
      }

      const url = `/api/media/files/${category}/${fileName}/raw`;
      const entry = {
        url,
        file: fileName,
        category,
        bytes: req.file.buffer.length,
        mime: detected.mime,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.id ?? null,
      };
      manifest[key] = entry;
      await writeMediaManifest(storageDir, manifest);

      res.json({ ok: true, key, entry });
    } catch (err) {
      console.error('POST /api/admin/media/upload error:', err);
      res.status(500).json({ error: 'Lỗi lưu ảnh lên server.' });
    }
  });

  router.delete('/item', async (req, res) => {
    const key = String(req.query?.key || req.body?.key || '').trim();
    if (!KEY_RE.test(key)) {
      return res.status(400).json({ error: 'Mã tài nguyên (key) không hợp lệ.' });
    }
    try {
      const manifest = await readMediaManifest(storageDir);
      const prev = manifest[key];
      if (prev?.file && prev?.category) {
        const oldPath = resolveSafePath(storageDir, 'files', prev.category, prev.file);
        if (oldPath) await fs.unlink(oldPath).catch(() => {});
      }
      delete manifest[key];
      await writeMediaManifest(storageDir, manifest);
      res.json({ ok: true, deleted: key });
    } catch (err) {
      console.error('DELETE /api/admin/media/item error:', err);
      res.status(500).json({ error: 'Lỗi xoá ảnh trên server.' });
    }
  });

  return router;
}
