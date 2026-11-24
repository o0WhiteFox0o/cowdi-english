import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import pool from '../config/database.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { PET_BATTLE_DATA } from '../../shared/game-config.js';
import { CLIPS } from '../../shared/pet-motion.js';
import {
  ALL_PET_IDS,
  EMOJI_FILE_RE,
  HASHED_IMAGE_FILE_RE,
  MAX_IMAGE_BYTES,
  buildImageUrls,
  detectImageType,
  isValidPetIdFormat,
  parseJsonCol,
  parseScopePetId,
  parseStage,
  resolveSafeStoragePath,
  sha1Short,
  timestampsMatch,
  toIsoTimestamp,
  validateClipData,
  validateClipName,
  validatePartName,
  validatePetCatalogPayload,
  validatePetId,
  validateRigData,
  validateScopeKey,
} from '../utils/petMotion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DEFAULT_STORAGE_DIR = path.resolve(__dirname, '..', 'storage', 'pets');

const TOTAL_CLIPS = Object.keys(CLIPS).length;

const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: 1,
  },
}).single('file');

function runMulterSingle(req, res) {
  return new Promise((resolve, reject) => {
    uploadSingleImage(req, res, (err) => {
      if (!err) return resolve();
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        const e = new Error('Ảnh vượt quá giới hạn 2 MB.');
        e.status = 413;
        return reject(e);
      }
      const e = new Error(err.message || 'Lỗi đọc file tải lên.');
      e.status = 400;
      return reject(e);
    });
  });
}

async function logHistory(db, kind, refKey, data, userId) {
  await db.execute(
    `INSERT INTO pet_motion_history (kind, ref_key, data_json, user_id)
     VALUES (?, ?, ?, ?)`,
    [kind, refKey, JSON.stringify(data), userId ?? null]
  );
}

/**
 * Router quản trị động tác pet (/api/admin/pet-motion/*).
 * Mọi route đều bắt buộc đi qua requireAuth + requireAdmin.
 */
export function createPetMotionAdminRouter({
  db = pool,
  storageDir = DEFAULT_STORAGE_DIR,
  motionCache = null,
  authMiddleware = requireAuth,
  adminMiddleware = requireAdmin,
} = {}) {
  const router = express.Router();

  router.use(authMiddleware, adminMiddleware);

  const invalidateCacheForScope = (scopeKey) => {
    if (!motionCache) return;
    if (scopeKey === '') motionCache.invalidateAll();
    else {
      const pid = parseScopePetId(scopeKey);
      if (pid) motionCache.invalidate(pid);
    }
  };

  async function loadCatalogRowsSafe() {
    try {
      const [rows] = await db.execute(
        `SELECT pet_id, name, species, emoji, element, pet_group, rarity, description,
                evolutions_json, unlock_json, is_custom, is_active, created_at, updated_at
           FROM pet_catalog
          ORDER BY created_at DESC, pet_id ASC`
      );
      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      if (err?.code === 'ER_NO_SUCH_TABLE' || /pet_catalog/i.test(err?.message || '')) {
        return [];
      }
      return [];
    }
  }

  async function isKnownPetId(petId) {
    if (validatePetId(petId)) return true;
    if (!isValidPetIdFormat(petId)) return false;
    try {
      const [[row]] = await db.execute(
        'SELECT pet_id FROM pet_catalog WHERE pet_id = ?',
        [petId]
      );
      return Boolean(row);
    } catch {
      return false;
    }
  }

  async function isKnownScopeKey(scopeKey) {
    if (validateScopeKey(scopeKey)) return true;
    if (typeof scopeKey !== 'string') return false;
    const match = scopeKey.match(/^([a-z][a-z0-9_]{1,31})\/c([1-5])$/);
    if (!match) return false;
    return isKnownPetId(match[1]);
  }

  // ── GET /api/admin/pet-motion/assets/draft/:petId/:stage/:file ──
  // Phục vụ ảnh nháp CHỈ cho admin (chặn mọi user chưa đăng nhập / user thường)
  router.get('/assets/draft/:petId/:stage/:file', async (req, res) => {
    const { petId, stage, file } = req.params;
    const stageNum = parseStage(stage);
    if (!(await isKnownPetId(petId)) || !stageNum || !HASHED_IMAGE_FILE_RE.test(file)) {
      return res.status(400).json({ error: 'Đường dẫn ảnh nháp không hợp lệ.' });
    }

    const absPath = resolveSafeStoragePath(storageDir, 'draft', petId, `c${stageNum}`, file);
    if (!absPath) {
      return res.status(400).json({ error: 'Đường dẫn không hợp lệ.' });
    }

    try {
      const buf = await fs.readFile(absPath);
      const mime = file.endsWith('.webp') ? 'image/webp' : 'image/png';
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'private, no-store');
      res.send(buf);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'Không tìm thấy ảnh nháp.' });
      }
      console.error('GET draft asset error:', err);
      res.status(500).json({ error: 'Lỗi đọc ảnh nháp.' });
    }
  });

  // ── GET /api/admin/pet-motion/emojis ───────────────────────────
  // Danh sách emoji tự thiết kế (PNG/WebP) đã tải lên
  router.get('/emojis', async (_req, res) => {
    const emojiDir = resolveSafeStoragePath(storageDir, 'emojis');
    if (!emojiDir) return res.json({ emojis: [] });
    try {
      await fs.mkdir(emojiDir, { recursive: true });
      const entries = await fs.readdir(emojiDir, { withFileTypes: true });
      const files = [];
      for (const e of entries) {
        if (!e.isFile() || !EMOJI_FILE_RE.test(e.name)) continue;
        const st = await fs.stat(path.join(emojiDir, e.name));
        files.push({
          id: e.name,
          name: e.name.replace(/-[0-9a-f]{8}\.(png|webp)$/, ''),
          url: `/api/pet-motion/assets/emojis/${e.name}`,
          mtime: st.mtimeMs,
        });
      }
      files.sort((a, b) => b.mtime - a.mtime);
      res.json({ emojis: files });
    } catch (err) {
      console.error('GET /api/admin/pet-motion/emojis error:', err);
      res.status(500).json({ error: 'Lỗi tải danh sách emoji tự thiết kế.' });
    }
  });

  // ── POST /api/admin/pet-motion/emojis ──────────────────────────
  // Tải lên emoji tự thiết kế (PNG/WebP thật ≤ 2 MB)
  router.post('/emojis', async (req, res) => {
    try {
      await runMulterSingle(req, res);
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'Thiếu file ảnh tải lên (field "file").' });
    }
    if (req.file.buffer.length > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'Ảnh vượt quá giới hạn 2 MB.' });
    }
    const detected = detectImageType(req.file.buffer);
    if (!detected) {
      return res.status(400).json({
        error: 'File không phải ảnh PNG hoặc WebP hợp lệ (chữ ký file không khớp).',
      });
    }

    const rawName = String(req.body?.name || req.file.originalname || 'emoji')
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 32) || 'emoji';
    const hash = sha1Short(req.file.buffer);
    const fileName = `${rawName}-${hash}${detected.ext}`;
    const absPath = resolveSafeStoragePath(storageDir, 'emojis', fileName);
    if (!absPath) {
      return res.status(400).json({ error: 'Đường dẫn lưu emoji không hợp lệ.' });
    }

    try {
      await fs.mkdir(path.dirname(absPath), { recursive: true });
      await fs.writeFile(absPath, req.file.buffer);
      await logHistory(
        db,
        'clip',
        `emoji:${fileName}`,
        { action: 'upload_custom_emoji', file: fileName, bytes: req.file.buffer.length, mime: detected.mime },
        req.user.id
      );
      res.json({
        ok: true,
        emoji: {
          id: fileName,
          name: rawName,
          url: `/api/pet-motion/assets/emojis/${fileName}`,
        },
      });
    } catch (err) {
      console.error('POST /api/admin/pet-motion/emojis error:', err);
      res.status(500).json({ error: 'Lỗi lưu emoji tự thiết kế.' });
    }
  });

  // ── DELETE /api/admin/pet-motion/emojis/:file ──────────────────
  router.delete('/emojis/:file', async (req, res) => {
    const { file } = req.params;
    if (!EMOJI_FILE_RE.test(file)) {
      return res.status(400).json({ error: 'Tên file emoji không hợp lệ.' });
    }
    const absPath = resolveSafeStoragePath(storageDir, 'emojis', file);
    if (!absPath) {
      return res.status(400).json({ error: 'Đường dẫn không hợp lệ.' });
    }
    try {
      await fs.unlink(absPath);
      await logHistory(db, 'clip', `emoji:${file}`, { action: 'delete_custom_emoji', file }, req.user.id);
      res.json({ ok: true, deleted: file });
    } catch (err) {
      if (err.code === 'ENOENT') return res.status(404).json({ error: 'Không tìm thấy emoji.' });
      console.error('DELETE /api/admin/pet-motion/emojis error:', err);
      res.status(500).json({ error: 'Lỗi xoá emoji.' });
    }
  });

  // ── GET /api/admin/pet-motion/overview ─────────────────────────
  // Ma trận pet × 5 cấp (gộp 23 pet gốc + pet tự thêm/sửa trong pet_catalog)
  router.get('/overview', async (_req, res) => {
    try {
      const [rigRows] = await db.execute(
        'SELECT pet_stage, draft_rig, avatar_path, status, updated_at, approved_at FROM pet_rigs'
      );
      const [approvalRows] = await db.execute(
        `SELECT pet_stage, COUNT(*) AS approved_count
           FROM pet_motion_approvals
          WHERE approved = 1
          GROUP BY pet_stage`
      );
      const catalogRows = await loadCatalogRowsSafe();

      const rigMap = new Map(rigRows.map((r) => [r.pet_stage, r]));
      const approvalMap = new Map(
        approvalRows.map((r) => [r.pet_stage, Number(r.approved_count || 0)])
      );
      const catalogMap = new Map(catalogRows.map((c) => [c.pet_id, c]));

      const allOrderedIds = [...ALL_PET_IDS];
      for (const c of catalogRows) {
        if (!allOrderedIds.includes(c.pet_id)) {
          allOrderedIds.push(c.pet_id);
        }
      }

      const pets = allOrderedIds.map((petId) => {
        const base = PET_BATTLE_DATA[petId] || null;
        const cat = catalogMap.get(petId) || null;
        const stages = {};
        for (let s = 1; s <= 5; s++) {
          const key = `${petId}/c${s}`;
          const rig = rigMap.get(key);
          const draftRig = rig ? parseJsonCol(rig.draft_rig, null) : null;
          const hasRig = Boolean(draftRig && Array.isArray(draftRig.slots) && draftRig.slots.length > 0);
          stages[`c${s}`] = {
            petStage: key,
            hasRig,
            rigStatus: hasRig ? rig.status : 'none',
            approvedClips: approvalMap.get(key) || 0,
            totalClips: TOTAL_CLIPS,
            avatarUrl: rig?.avatar_path ? `/api/pet-motion/assets/${rig.avatar_path}` : null,
            updatedAt: toIsoTimestamp(rig?.updated_at),
            approvedAt: toIsoTimestamp(rig?.approved_at),
          };
        }
        return {
          petId,
          group: cat?.pet_group || base?.group || 'farm',
          element: cat?.element || base?.element || 'neutral',
          rarity: cat?.rarity || base?.rarity || 'common',
          name: cat?.name || null,
          species: cat?.species || null,
          emoji: cat?.emoji || null,
          description: cat?.description || null,
          evolutions: cat ? parseJsonCol(cat.evolutions_json, null) : null,
          unlock: cat ? parseJsonCol(cat.unlock_json, null) : null,
          isCustom: cat ? Boolean(cat.is_custom) : false,
          isActive: cat ? Boolean(cat.is_active) : true,
          stages,
        };
      });

      res.json({
        totalPets: allOrderedIds.length,
        totalClips: TOTAL_CLIPS,
        pets,
      });
    } catch (err) {
      console.error('GET /api/admin/pet-motion/overview error:', err);
      res.status(500).json({ error: 'Lỗi tải tổng quan quản lý pet.' });
    }
  });

  // ── POST /api/admin/pet-motion/pets ────────────────────────────
  // Admin tạo loài Pet mới vào bảng pet_catalog
  router.post('/pets', async (req, res) => {
    const parsed = validatePetCatalogPayload(req.body, { isCreate: true });
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }
    const d = parsed.data;
    if (validatePetId(d.petId)) {
      return res.status(409).json({ error: `Mã pet "${d.petId}" đã tồn tại trong danh sách pet gốc.` });
    }
    try {
      const [[dup]] = await db.execute('SELECT pet_id FROM pet_catalog WHERE pet_id = ?', [d.petId]);
      if (dup) {
        return res.status(409).json({ error: `Mã pet "${d.petId}" đã tồn tại.` });
      }
      const userId = req.user?.id ?? null;
      await db.execute(
        `INSERT INTO pet_catalog
           (pet_id, name, species, emoji, element, pet_group, rarity, description,
            evolutions_json, unlock_json, is_custom, is_active, created_by, updated_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, NOW())`,
        [
          d.petId,
          d.name,
          d.species,
          d.emoji,
          d.element,
          d.group,
          d.rarity,
          d.description,
          JSON.stringify(d.evolutions),
          JSON.stringify(d.unlock),
          d.isActive ? 1 : 0,
          userId,
          userId,
        ]
      );
      await logHistory(db, 'rig', `catalog:${d.petId}`, { action: 'create_pet', pet: d }, userId);
      motionCache?.invalidateAll();
      res.status(201).json({ ok: true, pet: { ...d, isCustom: true } });
    } catch (err) {
      console.error('POST /api/admin/pet-motion/pets error:', err);
      res.status(500).json({ error: 'Lỗi tạo pet mới. Hãy đảm bảo đã chạy migration pet_catalog.' });
    }
  });

  // ── PUT /api/admin/pet-motion/pets/:petId ──────────────────────
  // Admin chỉnh sửa thông tin Pet (pet mới hoặc cập nhật metadata pet gốc)
  router.put('/pets/:petId', async (req, res) => {
    const { petId } = req.params;
    if (!(await isKnownPetId(petId))) {
      return res.status(404).json({ error: 'Không tìm thấy pet để cập nhật.' });
    }
    const parsed = validatePetCatalogPayload(req.body, { isCreate: false });
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }
    const d = parsed.data;
    const isBuiltIn = validatePetId(petId);
    const userId = req.user?.id ?? null;

    try {
      const [[existing]] = await db.execute('SELECT pet_id, is_custom FROM pet_catalog WHERE pet_id = ?', [petId]);
      if (existing) {
        await db.execute(
          `UPDATE pet_catalog
              SET name = ?, species = ?, emoji = ?, element = ?, pet_group = ?, rarity = ?,
                  description = ?, evolutions_json = ?, unlock_json = ?, is_active = ?, updated_by = ?
            WHERE pet_id = ?`,
          [
            d.name,
            d.species,
            d.emoji,
            d.element,
            d.group,
            d.rarity,
            d.description,
            JSON.stringify(d.evolutions),
            JSON.stringify(d.unlock),
            d.isActive ? 1 : 0,
            userId,
            petId,
          ]
        );
      } else {
        await db.execute(
          `INSERT INTO pet_catalog
             (pet_id, name, species, emoji, element, pet_group, rarity, description,
              evolutions_json, unlock_json, is_custom, is_active, created_by, updated_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            petId,
            d.name,
            d.species,
            d.emoji,
            d.element,
            d.group,
            d.rarity,
            d.description,
            JSON.stringify(d.evolutions),
            JSON.stringify(d.unlock),
            isBuiltIn ? 0 : 1,
            d.isActive ? 1 : 0,
            userId,
            userId,
          ]
        );
      }
      await logHistory(db, 'rig', `catalog:${petId}`, { action: 'update_pet', pet: { ...d, petId } }, userId);
      motionCache?.invalidate(petId);
      res.json({ ok: true, pet: { ...d, petId, isCustom: existing ? Boolean(existing.is_custom) : !isBuiltIn } });
    } catch (err) {
      console.error('PUT /api/admin/pet-motion/pets/:petId error:', err);
      res.status(500).json({ error: 'Lỗi cập nhật thông tin pet.' });
    }
  });

  // ── DELETE /api/admin/pet-motion/pets/:petId ───────────────────
  // Admin xoá Pet tự thêm (bảo vệ 23 pet gốc không cho xoá)
  router.delete('/pets/:petId', async (req, res) => {
    const { petId } = req.params;
    if (validatePetId(petId)) {
      return res.status(400).json({ error: 'Không thể xoá pet gốc của hệ thống.' });
    }
    if (!isValidPetIdFormat(petId)) {
      return res.status(400).json({ error: 'petId không hợp lệ.' });
    }
    try {
      const [[existing]] = await db.execute('SELECT pet_id, is_custom FROM pet_catalog WHERE pet_id = ?', [petId]);
      if (!existing || !existing.is_custom) {
        return res.status(404).json({ error: 'Không tìm thấy pet tự thêm để xoá.' });
      }
      const stageKeys = [1, 2, 3, 4, 5].map((s) => `${petId}/c${s}`);
      const placeholders = stageKeys.map(() => '?').join(',');
      await db.execute(`DELETE FROM pet_motion_approvals WHERE pet_stage IN (${placeholders})`, stageKeys);
      await db.execute(`DELETE FROM pet_motion_clips WHERE scope_key IN (${placeholders})`, stageKeys);
      await db.execute(`DELETE FROM pet_rigs WHERE pet_stage IN (${placeholders})`, stageKeys);
      await db.execute('DELETE FROM pet_catalog WHERE pet_id = ?', [petId]);

      for (const bucket of ['avatars', 'draft', 'published']) {
        const dirPath = resolveSafeStoragePath(storageDir, bucket, petId);
        if (dirPath) {
          await fs.rm(dirPath, { recursive: true, force: true }).catch(() => {});
        }
      }
      await logHistory(db, 'rig', `catalog:${petId}`, { action: 'delete_pet', petId }, req.user?.id ?? null);
      motionCache?.invalidate(petId);
      res.json({ ok: true, deleted: petId });
    } catch (err) {
      console.error('DELETE /api/admin/pet-motion/pets/:petId error:', err);
      res.status(500).json({ error: 'Lỗi xoá pet.' });
    }
  });

  // ── POST /api/admin/pet-motion/:petId/:stage/avatar ────────────
  // Bổ sung / đổi ảnh avatar tĩnh cho pet-cấp (PNG/WebP ≤ 2 MB, kiểm tra magic bytes)
  router.post('/:petId/:stage/avatar', async (req, res) => {
    const { petId } = req.params;
    const stageNum = parseStage(req.params.stage);
    if (!(await isKnownPetId(petId)) || !stageNum) {
      return res.status(400).json({ error: 'petId hoặc cấp tiến hoá (1-5) không hợp lệ.' });
    }

    try {
      await runMulterSingle(req, res);
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'Thiếu file ảnh tải lên (field "file").' });
    }
    if (req.file.buffer.length > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'Ảnh vượt quá giới hạn 2 MB.' });
    }
    const detected = detectImageType(req.file.buffer);
    if (!detected) {
      return res.status(400).json({
        error: 'File không phải ảnh PNG hoặc WebP hợp lệ (chữ ký file không khớp).',
      });
    }

    const stageKey = `c${stageNum}`;
    const petStage = `${petId}/${stageKey}`;
    const hash = sha1Short(req.file.buffer);
    const fileName = `${stageKey}-${hash}${detected.ext}`;
    const relPath = `avatars/${petId}/${fileName}`;
    const absPath = resolveSafeStoragePath(storageDir, 'avatars', petId, fileName);
    if (!absPath) {
      return res.status(400).json({ error: 'Đường dẫn lưu file không hợp lệ.' });
    }

    const userId = req.user.id;
    try {
      await fs.mkdir(path.dirname(absPath), { recursive: true });
      await fs.writeFile(absPath, req.file.buffer);

      const [[existing]] = await db.execute(
        'SELECT pet_stage FROM pet_rigs WHERE pet_stage = ?',
        [petStage]
      );
      if (existing) {
        await db.execute(
          'UPDATE pet_rigs SET avatar_path = ?, updated_by = ? WHERE pet_stage = ?',
          [relPath, userId, petStage]
        );
      } else {
        const emptyRig = { size: [200, 200], ground: [100, 199], slots: [], eyes: [], mouth: null };
        await db.execute(
          `INSERT INTO pet_rigs (pet_stage, draft_rig, draft_images, avatar_path, status, updated_by)
           VALUES (?, ?, '{}', ?, 'draft', ?)`,
          [petStage, JSON.stringify(emptyRig), relPath, userId]
        );
      }

      await logHistory(
        db,
        'rig',
        petStage,
        { action: 'upload_avatar', avatar_path: relPath, bytes: req.file.buffer.length, mime: detected.mime },
        userId
      );

      res.json({
        ok: true,
        petStage,
        avatarPath: relPath,
        avatarUrl: `/api/pet-motion/assets/${relPath}`,
      });
    } catch (err) {
      console.error('POST /api/admin/pet-motion/:petId/:stage/avatar error:', err);
      res.status(500).json({ error: 'Lỗi lưu ảnh avatar.' });
    }
  });

  // ── GET /api/admin/pet-motion/clip/affected?clip=<clip> ────────
  // Trả về danh sách pet-cấp hiện đang duyệt động tác X (dùng trước khi xuất bản bản chung)
  router.get('/clip/affected', async (req, res) => {
    const clip = String(req.query.clip || '');
    if (!validateClipName(clip)) {
      return res.status(400).json({ error: 'Tên động tác không hợp lệ.' });
    }
    try {
      const [rows] = await db.execute(
        `SELECT pet_stage, approved_at
           FROM pet_motion_approvals
          WHERE clip = ? AND approved = 1
          ORDER BY pet_stage ASC`,
        [clip]
      );
      res.json({
        clip,
        affectedPetStages: rows.map((r) => ({
          petStage: r.pet_stage,
          approvedAt: toIsoTimestamp(r.approved_at),
        })),
      });
    } catch (err) {
      console.error('GET /api/admin/pet-motion/clip/affected error:', err);
      res.status(500).json({ error: 'Lỗi lấy danh sách pet-cấp bị ảnh hưởng.' });
    }
  });

  // ── PUT /api/admin/pet-motion/clip ─────────────────────────────
  // Lưu bản nháp keyframe (chung '' hoặc riêng 'bamboo/c3')
  router.put('/clip', async (req, res) => {
    const { scope_key, clip, data, expected_updated_at } = req.body || {};

    if (!(await isKnownScopeKey(scope_key))) {
      return res.status(400).json({ error: 'scope_key không hợp lệ.' });
    }
    if (!validateClipName(clip)) {
      return res.status(400).json({ error: 'Tên động tác không hợp lệ.' });
    }
    const dataErr = validateClipData(data);
    if (dataErr) {
      return res.status(400).json({ error: dataErr });
    }

    try {
      const [[existing]] = await db.execute(
        `SELECT id, draft_json, published_json, status, updated_at
           FROM pet_motion_clips
          WHERE scope_key = ? AND clip = ?`,
        [scope_key, clip]
      );

      if (existing && expected_updated_at && !timestampsMatch(existing.updated_at, expected_updated_at)) {
        return res.status(409).json({
          error: 'Động tác này vừa được quản trị viên khác chỉnh sửa. Vui lòng tải lại trước khi lưu.',
          conflict: true,
          currentUpdatedAt: toIsoTimestamp(existing.updated_at),
          currentDraft: parseJsonCol(existing.draft_json, null),
        });
      }

      const draftStr = JSON.stringify(data);
      const userId = req.user.id;

      await db.execute(
        `INSERT INTO pet_motion_clips (scope_key, clip, draft_json, status, updated_by)
         VALUES (?, ?, ?, 'draft', ?)
         ON DUPLICATE KEY UPDATE
           draft_json = VALUES(draft_json),
           status     = 'draft',
           updated_by = VALUES(updated_by)`,
        [scope_key, clip, draftStr, userId]
      );

      const [[saved]] = await db.execute(
        `SELECT status, updated_at, approved_at, published_json IS NOT NULL AS has_published
           FROM pet_motion_clips
          WHERE scope_key = ? AND clip = ?`,
        [scope_key, clip]
      );

      await logHistory(
        db,
        'clip',
        `${scope_key}:${clip}`,
        { action: 'save_draft', scope_key, clip, data },
        userId
      );

      res.json({
        ok: true,
        scope_key,
        clip,
        status: saved?.status || 'draft',
        hasPublished: Boolean(saved?.has_published),
        updatedAt: toIsoTimestamp(saved?.updated_at),
        approvedAt: toIsoTimestamp(saved?.approved_at),
      });
    } catch (err) {
      console.error('PUT /api/admin/pet-motion/clip error:', err);
      res.status(500).json({ error: 'Lỗi lưu bản nháp động tác.' });
    }
  });

  // ── DELETE /api/admin/pet-motion/clip ──────────────────────────
  // Bỏ bản chỉnh (về bản gốc)
  router.delete('/clip', async (req, res) => {
    const scope_key = req.body?.scope_key ?? req.query?.scope_key;
    const clip = req.body?.clip ?? req.query?.clip;

    if (!(await isKnownScopeKey(scope_key))) {
      return res.status(400).json({ error: 'scope_key không hợp lệ.' });
    }
    if (!validateClipName(clip)) {
      return res.status(400).json({ error: 'Tên động tác không hợp lệ.' });
    }

    try {
      const [[existing]] = await db.execute(
        'SELECT draft_json, published_json FROM pet_motion_clips WHERE scope_key = ? AND clip = ?',
        [scope_key, clip]
      );

      await db.execute(
        'DELETE FROM pet_motion_clips WHERE scope_key = ? AND clip = ?',
        [scope_key, clip]
      );

      await logHistory(
        db,
        'clip',
        `${scope_key}:${clip}`,
        {
          action: 'delete_edit',
          scope_key,
          clip,
          previousDraft: parseJsonCol(existing?.draft_json, null),
          previousPublished: parseJsonCol(existing?.published_json, null),
        },
        req.user.id
      );

      invalidateCacheForScope(scope_key);

      res.json({ ok: true, scope_key, clip, deleted: Boolean(existing) });
    } catch (err) {
      console.error('DELETE /api/admin/pet-motion/clip error:', err);
      res.status(500).json({ error: 'Lỗi xoá bản chỉnh động tác.' });
    }
  });

  // ── POST /api/admin/pet-motion/clip/publish ────────────────────
  // Xuất bản bản chung hoặc bản riêng (chép draft_json -> published_json)
  router.post('/clip/publish', async (req, res) => {
    const { scope_key, clip, resetApprovals = true } = req.body || {};

    if (!(await isKnownScopeKey(scope_key))) {
      return res.status(400).json({ error: 'scope_key không hợp lệ.' });
    }
    if (!validateClipName(clip)) {
      return res.status(400).json({ error: 'Tên động tác không hợp lệ.' });
    }

    try {
      const [[row]] = await db.execute(
        'SELECT id, draft_json FROM pet_motion_clips WHERE scope_key = ? AND clip = ?',
        [scope_key, clip]
      );

      if (!row) {
        return res.status(404).json({ error: 'Chưa có bản nháp để xuất bản.' });
      }

      const draftData = parseJsonCol(row.draft_json, null);
      const userId = req.user.id;

      await db.execute(
        `UPDATE pet_motion_clips
            SET published_json = draft_json,
                status         = 'approved',
                approved_by    = ?,
                approved_at    = NOW()
          WHERE scope_key = ? AND clip = ?`,
        [userId, scope_key, clip]
      );

      let affectedPetStages = [];
      let resetCount = 0;

      if (scope_key === '') {
        const [approvedRows] = await db.execute(
          'SELECT pet_stage FROM pet_motion_approvals WHERE clip = ? AND approved = 1 ORDER BY pet_stage ASC',
          [clip]
        );
        affectedPetStages = approvedRows.map((r) => r.pet_stage);

        if (resetApprovals !== false && affectedPetStages.length > 0) {
          const [upd] = await db.execute(
            `UPDATE pet_motion_approvals
                SET approved = 0, approved_by = ?, approved_at = NOW()
              WHERE clip = ? AND approved = 1`,
            [userId, clip]
          );
          resetCount = Number(upd.affectedRows || affectedPetStages.length);

          await logHistory(
            db,
            'approval',
            `*:${clip}`,
            { action: 'reset_after_shared_publish', clip, affectedPetStages },
            userId
          );
        }
      }

      await logHistory(
        db,
        'clip',
        `${scope_key}:${clip}`,
        { action: 'publish', scope_key, clip, data: draftData, resetApprovals: scope_key === '' ? resetApprovals !== false : false },
        userId
      );

      invalidateCacheForScope(scope_key);

      res.json({
        ok: true,
        scope_key,
        clip,
        status: 'approved',
        affectedPetStages,
        resetCount,
      });
    } catch (err) {
      console.error('POST /api/admin/pet-motion/clip/publish error:', err);
      res.status(500).json({ error: 'Lỗi xuất bản động tác.' });
    }
  });

  // ── GET /api/admin/pet-motion/:petId/:stage ────────────────────
  // Trả rig nháp + URL ảnh nháp, clip nháp (chung + riêng), trạng thái duyệt từng clip
  router.get('/:petId/:stage', async (req, res) => {
    const { petId } = req.params;
    const stageNum = parseStage(req.params.stage);
    if (!(await isKnownPetId(petId)) || !stageNum) {
      return res.status(400).json({ error: 'petId hoặc cấp tiến hoá (1-5) không hợp lệ.' });
    }

    const petStage = `${petId}/c${stageNum}`;

    try {
      const [[rigRow]] = await db.execute(
        `SELECT pet_stage, draft_rig, draft_images, published_rig, published_images,
                status, updated_by, updated_at, approved_by, approved_at
           FROM pet_rigs
          WHERE pet_stage = ?`,
        [petStage]
      );

      const [clipRows] = await db.execute(
        `SELECT scope_key, clip, draft_json, published_json, status, updated_at, approved_at
           FROM pet_motion_clips
          WHERE scope_key IN ('', ?)`,
        [petStage]
      );

      const [approvalRows] = await db.execute(
        `SELECT clip, approved, approved_by, approved_at
           FROM pet_motion_approvals
          WHERE pet_stage = ?`,
        [petStage]
      );

      const sharedClips = {};
      const overrideClips = {};
      for (const row of clipRows) {
        const draft = parseJsonCol(row.draft_json, null);
        const published = parseJsonCol(row.published_json, null);
        const item = {
          draft,
          published,
          status: row.status,
          hasUnpublishedChanges: !published || JSON.stringify(draft) !== JSON.stringify(published),
          updatedAt: toIsoTimestamp(row.updated_at),
          approvedAt: toIsoTimestamp(row.approved_at),
        };
        if (row.scope_key === '') sharedClips[row.clip] = item;
        else overrideClips[row.clip] = item;
      }

      const approvals = {};
      for (const row of approvalRows) {
        approvals[row.clip] = {
          approved: Boolean(row.approved),
          approvedBy: row.approved_by,
          approvedAt: toIsoTimestamp(row.approved_at),
        };
      }

      const draftRig = rigRow ? parseJsonCol(rigRow.draft_rig, null) : null;
      const draftImages = rigRow ? parseJsonCol(rigRow.draft_images, {}) : {};
      const publishedRig = rigRow ? parseJsonCol(rigRow.published_rig, null) : null;
      const publishedImages = rigRow ? parseJsonCol(rigRow.published_images, null) : null;

      const hasUnpublishedRigChanges = Boolean(
        rigRow &&
          (!publishedRig ||
            JSON.stringify(draftRig) !== JSON.stringify(publishedRig) ||
            JSON.stringify(
              Object.fromEntries(
                Object.entries(draftImages).map(([k, v]) => [k, path.basename(String(v))])
              )
            ) !==
              JSON.stringify(
                Object.fromEntries(
                  Object.entries(publishedImages || {}).map(([k, v]) => [k, path.basename(String(v))])
                )
              ))
      );

      res.json({
        petId,
        stage: stageNum,
        petStage,
        rig: {
          hasRig: Boolean(rigRow),
          status: rigRow ? rigRow.status : 'none',
          hasUnpublishedChanges: hasUnpublishedRigChanges,
          draftRig,
          draftImages,
          draftImageUrls: buildImageUrls(draftImages, '/api/admin/pet-motion/assets'),
          publishedRig,
          publishedImages,
          publishedImageUrls: buildImageUrls(publishedImages, '/api/pet-motion/assets'),
          updatedAt: toIsoTimestamp(rigRow?.updated_at),
          approvedAt: toIsoTimestamp(rigRow?.approved_at),
        },
        clips: {
          shared: sharedClips,
          override: overrideClips,
        },
        approvals,
      });
    } catch (err) {
      console.error('GET /api/admin/pet-motion/:petId/:stage error:', err);
      res.status(500).json({ error: 'Lỗi tải chi tiết động tác pet.' });
    }
  });

  // ── PUT /api/admin/pet-motion/:petId/:stage/rig ────────────────
  // Lưu rig nháp (slots, pivot, off, sc, eyes, mouth…). KHÔNG làm mất bản đã xuất bản của người học.
  router.put('/:petId/:stage/rig', async (req, res) => {
    const { petId } = req.params;
    const stageNum = parseStage(req.params.stage);
    if (!(await isKnownPetId(petId)) || !stageNum) {
      return res.status(400).json({ error: 'petId hoặc cấp tiến hoá (1-5) không hợp lệ.' });
    }

    const rig = req.body?.rig ?? req.body;
    const expectedUpdatedAt = req.body?.expected_updated_at;
    const rigErr = validateRigData(rig);
    if (rigErr) {
      return res.status(400).json({ error: rigErr });
    }

    const petStage = `${petId}/c${stageNum}`;
    const userId = req.user.id;

    try {
      const [[existing]] = await db.execute(
        'SELECT draft_rig, draft_images, status, updated_at FROM pet_rigs WHERE pet_stage = ?',
        [petStage]
      );

      if (existing && expectedUpdatedAt && !timestampsMatch(existing.updated_at, expectedUpdatedAt)) {
        return res.status(409).json({
          error: 'Rig này vừa được quản trị viên khác chỉnh sửa. Vui lòng tải lại trước khi lưu.',
          conflict: true,
          currentUpdatedAt: toIsoTimestamp(existing.updated_at),
          currentDraftRig: parseJsonCol(existing.draft_rig, null),
        });
      }

      const rigStr = JSON.stringify(rig);
      if (existing) {
        await db.execute(
          'UPDATE pet_rigs SET draft_rig = ?, updated_by = ? WHERE pet_stage = ?',
          [rigStr, userId, petStage]
        );
      } else {
        await db.execute(
          `INSERT INTO pet_rigs (pet_stage, draft_rig, draft_images, status, updated_by)
           VALUES (?, ?, '{}', 'draft', ?)`,
          [petStage, rigStr, userId]
        );
      }

      const [[saved]] = await db.execute(
        'SELECT status, updated_at, approved_at FROM pet_rigs WHERE pet_stage = ?',
        [petStage]
      );

      await logHistory(db, 'rig', petStage, { action: 'save_draft_rig', rig }, userId);

      res.json({
        ok: true,
        petStage,
        status: saved?.status || 'draft',
        updatedAt: toIsoTimestamp(saved?.updated_at),
        approvedAt: toIsoTimestamp(saved?.approved_at),
      });
    } catch (err) {
      console.error('PUT /api/admin/pet-motion/:petId/:stage/rig error:', err);
      res.status(500).json({ error: 'Lỗi lưu rig nháp.' });
    }
  });

  // ── POST /api/admin/pet-motion/:petId/:stage/parts/:part ───────
  // Upload ảnh bộ phận (PNG/WebP thật ≤ 2 MB, kiểm tra magic bytes)
  router.post('/:petId/:stage/parts/:part', async (req, res) => {
    const { petId, part } = req.params;
    const stageNum = parseStage(req.params.stage);

    if (!(await isKnownPetId(petId))) {
      return res.status(400).json({ error: 'petId không tồn tại trong danh sách pet.' });
    }
    if (!stageNum) {
      return res.status(400).json({ error: 'Cấp tiến hoá phải từ 1 đến 5.' });
    }
    if (!validatePartName(part)) {
      return res.status(400).json({ error: 'Tên bộ phận không hợp lệ.' });
    }

    try {
      await runMulterSingle(req, res);
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Thiếu file ảnh tải lên (field "file").' });
    }

    if (req.file.buffer.length > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'Ảnh vượt quá giới hạn 2 MB.' });
    }

    const detected = detectImageType(req.file.buffer);
    if (!detected) {
      return res.status(400).json({
        error: 'File không phải ảnh PNG hoặc WebP hợp lệ (chữ ký file không khớp).',
      });
    }

    const stageKey = `c${stageNum}`;
    const petStage = `${petId}/${stageKey}`;
    const hash = sha1Short(req.file.buffer);
    const fileName = `${part}-${hash}${detected.ext}`;
    const relPath = `draft/${petId}/${stageKey}/${fileName}`;
    const absPath = resolveSafeStoragePath(storageDir, 'draft', petId, stageKey, fileName);

    if (!absPath) {
      return res.status(400).json({ error: 'Đường dẫn lưu file không hợp lệ.' });
    }

    const userId = req.user.id;

    try {
      await fs.mkdir(path.dirname(absPath), { recursive: true });
      await fs.writeFile(absPath, req.file.buffer);

      const [[existing]] = await db.execute(
        'SELECT draft_images FROM pet_rigs WHERE pet_stage = ?',
        [petStage]
      );

      const images = existing ? parseJsonCol(existing.draft_images, {}) : {};
      images[part] = relPath;

      if (existing) {
        await db.execute(
          'UPDATE pet_rigs SET draft_images = ?, updated_by = ? WHERE pet_stage = ?',
          [JSON.stringify(images), userId, petStage]
        );
      } else {
        const emptyRig = { size: [200, 200], ground: [100, 199], slots: [], eyes: [], mouth: null };
        await db.execute(
          `INSERT INTO pet_rigs (pet_stage, draft_rig, draft_images, status, updated_by)
           VALUES (?, ?, ?, 'draft', ?)`,
          [petStage, JSON.stringify(emptyRig), JSON.stringify(images), userId]
        );
      }

      const [[saved]] = await db.execute(
        'SELECT updated_at FROM pet_rigs WHERE pet_stage = ?',
        [petStage]
      );

      await logHistory(
        db,
        'rig',
        petStage,
        { action: 'upload_part', part, path: relPath, bytes: req.file.buffer.length, mime: detected.mime },
        userId
      );

      res.json({
        ok: true,
        petStage,
        part,
        path: relPath,
        url: `/api/admin/pet-motion/assets/${relPath}`,
        bytes: req.file.buffer.length,
        mime: detected.mime,
        updatedAt: toIsoTimestamp(saved?.updated_at),
      });
    } catch (err) {
      console.error('POST /api/admin/pet-motion/:petId/:stage/parts/:part error:', err);
      res.status(500).json({ error: 'Lỗi lưu ảnh bộ phận.' });
    }
  });

  // ── POST /api/admin/pet-motion/:petId/:stage/approve-rig ───────
  // Duyệt bộ phận + rig (chép ảnh draft -> published, chép draft_rig -> published_rig)
  router.post('/:petId/:stage/approve-rig', async (req, res) => {
    const { petId } = req.params;
    const stageNum = parseStage(req.params.stage);
    if (!(await isKnownPetId(petId)) || !stageNum) {
      return res.status(400).json({ error: 'petId hoặc cấp tiến hoá (1-5) không hợp lệ.' });
    }

    const stageKey = `c${stageNum}`;
    const petStage = `${petId}/${stageKey}`;
    const userId = req.user.id;

    try {
      const [[rigRow]] = await db.execute(
        'SELECT draft_rig, draft_images FROM pet_rigs WHERE pet_stage = ?',
        [petStage]
      );

      if (!rigRow) {
        return res.status(404).json({ error: 'Chưa có rig nháp cho pet-cấp này.' });
      }

      const draftRig = parseJsonCol(rigRow.draft_rig, null);
      const draftImages = parseJsonCol(rigRow.draft_images, {});
      if (!draftRig || !Array.isArray(draftRig.slots) || draftRig.slots.length === 0) {
        return res.status(400).json({ error: 'Rig nháp chưa có bộ phận (slots) nào để duyệt.' });
      }

      const publishedImages = {};
      const pubDir = resolveSafeStoragePath(storageDir, 'published', petId, stageKey);
      if (!pubDir) {
        return res.status(400).json({ error: 'Đường dẫn xuất bản không hợp lệ.' });
      }
      await fs.mkdir(pubDir, { recursive: true });

      for (const [part, draftRel] of Object.entries(draftImages)) {
        if (typeof draftRel !== 'string' || !draftRel.startsWith('draft/')) continue;
        const srcAbs = resolveSafeStoragePath(storageDir, draftRel);
        const fileName = path.basename(draftRel);
        if (!srcAbs || !HASHED_IMAGE_FILE_RE.test(fileName)) {
          return res.status(400).json({ error: `Ảnh bộ phận ${part} có đường dẫn không hợp lệ.` });
        }
        const pubRel = `published/${petId}/${stageKey}/${fileName}`;
        const destAbs = resolveSafeStoragePath(storageDir, pubRel);
        if (!destAbs) {
          return res.status(400).json({ error: 'Đường dẫn xuất bản không hợp lệ.' });
        }
        await fs.copyFile(srcAbs, destAbs);
        publishedImages[part] = pubRel;
      }

      await db.execute(
        `UPDATE pet_rigs
            SET published_rig    = draft_rig,
                published_images = ?,
                status           = 'approved',
                approved_by      = ?,
                approved_at      = NOW()
          WHERE pet_stage = ?`,
        [JSON.stringify(publishedImages), userId, petStage]
      );

      const [[saved]] = await db.execute(
        'SELECT approved_at FROM pet_rigs WHERE pet_stage = ?',
        [petStage]
      );

      await logHistory(
        db,
        'rig',
        petStage,
        { action: 'approve_rig', published_rig: draftRig, published_images: publishedImages },
        userId
      );

      motionCache?.invalidate(petId);

      res.json({
        ok: true,
        petStage,
        status: 'approved',
        publishedImages,
        publishedImageUrls: buildImageUrls(publishedImages, '/api/pet-motion/assets'),
        approvedAt: toIsoTimestamp(saved?.approved_at),
      });
    } catch (err) {
      console.error('POST /api/admin/pet-motion/:petId/:stage/approve-rig error:', err);
      res.status(500).json({ error: 'Lỗi duyệt bộ phận + rig.' });
    }
  });

  // ── POST /api/admin/pet-motion/:petId/:stage/approve ───────────
  // Duyệt hoặc bỏ duyệt 1 động tác trên pet-cấp này.
  // Nếu approved = true và pet-cấp này đang có bản nháp riêng -> tự xuất bản bản riêng đó.
  router.post('/:petId/:stage/approve', async (req, res) => {
    const { petId } = req.params;
    const stageNum = parseStage(req.params.stage);
    const { clip, approved } = req.body || {};

    if (!(await isKnownPetId(petId)) || !stageNum) {
      return res.status(400).json({ error: 'petId hoặc cấp tiến hoá (1-5) không hợp lệ.' });
    }
    if (!validateClipName(clip)) {
      return res.status(400).json({ error: 'Tên động tác không hợp lệ.' });
    }
    if (typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'Trường approved phải là true hoặc false.' });
    }

    const petStage = `${petId}/c${stageNum}`;
    const userId = req.user.id;

    try {
      let autoPublishedOverride = false;

      if (approved) {
        const [[overrideRow]] = await db.execute(
          'SELECT id, draft_json FROM pet_motion_clips WHERE scope_key = ? AND clip = ?',
          [petStage, clip]
        );
        if (overrideRow) {
          await db.execute(
            `UPDATE pet_motion_clips
                SET published_json = draft_json,
                    status         = 'approved',
                    approved_by    = ?,
                    approved_at    = NOW()
              WHERE scope_key = ? AND clip = ?`,
            [userId, petStage, clip]
          );
          autoPublishedOverride = true;
          await logHistory(
            db,
            'clip',
            `${petStage}:${clip}`,
            { action: 'auto_publish_on_approve', scope_key: petStage, clip, data: parseJsonCol(overrideRow.draft_json, null) },
            userId
          );
        }
      }

      await db.execute(
        `INSERT INTO pet_motion_approvals (pet_stage, clip, approved, approved_by, approved_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           approved    = VALUES(approved),
           approved_by = VALUES(approved_by),
           approved_at = NOW()`,
        [petStage, clip, approved ? 1 : 0, userId]
      );

      await logHistory(
        db,
        'approval',
        `${petStage}:${clip}`,
        { action: approved ? 'approve' : 'unapprove', petStage, clip, approved, autoPublishedOverride },
        userId
      );

      motionCache?.invalidate(petId);

      res.json({
        ok: true,
        petStage,
        clip,
        approved,
        autoPublishedOverride,
      });
    } catch (err) {
      console.error('POST /api/admin/pet-motion/:petId/:stage/approve error:', err);
      res.status(500).json({ error: 'Lỗi cập nhật trạng thái duyệt động tác.' });
    }
  });

  return router;
}

export default createPetMotionAdminRouter();
