import { Router } from 'express';
import defaultPool from '../config/database.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  getClientScreenConfig,
  getAdminScreenSnapshot,
  registerSupportedCodes,
  updateScreenStatus,
  updateScreenWeights,
  listAndSearchTesters,
  addScreenTester,
  removeScreenTester,
  listScreenConfigLog,
} from '../utils/screen-config-manager.js';

/**
 * Routes cấu hình Hệ thống Màn học Đợt 2 (GEMINI-SCREEN-SYSTEM-PHASE2 §2).
 * Mount tại `/api` trong server/index.js:
 * - Client: GET /api/screens/config (ETag / 304)
 * - Admin:  GET/PUT /api/admin/screens*, /api/admin/screen-weights/:group, /api/admin/screen-testers*, /api/admin/screen-log
 */
export function createScreensRouter({
  pool = defaultPool,
  authMiddleware = requireAuth,
  adminMiddleware = requireAdmin,
} = {}) {
  const router = Router();

  // ── 1. Client học viên: GET /api/screens/config ────────────────────────────
  router.get('/screens/config', authMiddleware, async (req, res) => {
    try {
      const cfg = await getClientScreenConfig(pool, req.user?.id);
      const etag = `W/"${cfg.version}:${cfg.isTester ? 1 : 0}"`;
      res.set('ETag', etag);
      res.set('Cache-Control', 'no-cache');
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
      return res.json(cfg);
    } catch (err) {
      console.error('GET /api/screens/config error:', err);
      return res.status(500).json({ error: 'Không tải được cấu hình màn học.' });
    }
  });

  // ── 2. Admin: GET /api/admin/screens ───────────────────────────────────────
  router.get('/admin/screens', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const rawSupported = req.query.supported || req.headers['x-supported-screens'];
      if (typeof rawSupported === 'string' && rawSupported.trim()) {
        registerSupportedCodes(rawSupported.split(',').map((s) => s.trim()));
      }
      const data = await getAdminScreenSnapshot(pool);
      return res.json(data);
    } catch (err) {
      console.error('GET /api/admin/screens error:', err);
      return res.status(500).json({ error: 'Lỗi tải cấu hình màn học.' });
    }
  });

  // ── 3. Admin: PUT /api/admin/screens/:code ─────────────────────────────────
  router.put('/admin/screens/:code', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { code } = req.params;
      const { status, note, supportedCodes } = req.body || {};
      const updated = await updateScreenStatus(pool, {
        code,
        status,
        note,
        supportedCodes,
        adminUserId: req.user.id,
      });
      return res.json(updated);
    } catch (err) {
      const st = err.status || 500;
      if (st >= 500) console.error('PUT /api/admin/screens/:code error:', err);
      return res.status(st).json({ error: err.message || 'Lỗi cập nhật trạng thái màn.' });
    }
  });

  // ── 4. Admin: PUT /api/admin/screen-weights/:group ─────────────────────────
  router.put('/admin/screen-weights/:group', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { group } = req.params;
      const { friendly, focus } = req.body || {};
      const updated = await updateScreenWeights(pool, {
        groupId: group,
        friendly,
        focus,
        adminUserId: req.user.id,
      });
      return res.json(updated);
    } catch (err) {
      const st = err.status || 500;
      if (st >= 500) console.error('PUT /api/admin/screen-weights/:group error:', err);
      return res.status(st).json({ error: err.message || 'Lỗi cập nhật trọng số.' });
    }
  });

  // ── 5. Admin: GET /api/admin/screen-testers?q= ─────────────────────────────
  router.get('/admin/screen-testers', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const data = await listAndSearchTesters(pool, req.query.q || '');
      return res.json(data);
    } catch (err) {
      console.error('GET /api/admin/screen-testers error:', err);
      return res.status(500).json({ error: 'Lỗi tải danh sách tài khoản thử.' });
    }
  });

  // ── 6. Admin: POST /api/admin/screen-testers ───────────────────────────────
  router.post('/admin/screen-testers', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { userId, note } = req.body || {};
      const added = await addScreenTester(pool, { userId, note, adminUserId: req.user.id });
      return res.status(201).json(added);
    } catch (err) {
      const st = err.status || 500;
      if (st >= 500) console.error('POST /api/admin/screen-testers error:', err);
      return res.status(st).json({ error: err.message || 'Lỗi thêm tài khoản thử.' });
    }
  });

  // ── 7. Admin: DELETE /api/admin/screen-testers/:userId ─────────────────────
  router.delete('/admin/screen-testers/:userId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const result = await removeScreenTester(pool, {
        userId: req.params.userId,
        adminUserId: req.user.id,
      });
      return res.json(result);
    } catch (err) {
      const st = err.status || 500;
      if (st >= 500) console.error('DELETE /api/admin/screen-testers/:userId error:', err);
      return res.status(st).json({ error: err.message || 'Lỗi xoá tài khoản thử.' });
    }
  });

  // ── 8. Admin: GET /api/admin/screen-log ────────────────────────────────────
  router.get('/admin/screen-log', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const logs = await listScreenConfigLog(pool, {
        limit: req.query.limit,
        before: req.query.before,
      });
      return res.json({ logs });
    } catch (err) {
      console.error('GET /api/admin/screen-log error:', err);
      return res.status(500).json({ error: 'Lỗi tải nhật ký thay đổi.' });
    }
  });

  return router;
}

export default createScreensRouter;
