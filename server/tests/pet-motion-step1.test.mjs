import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import express from 'express';
import jwt from 'jsonwebtoken';

import { createRequireAuth, createRequireAdmin } from '../middleware/auth.js';
import { createPetMotionAdminRouter } from '../routes/petMotionAdmin.js';
import { seedPetRigs, DEFAULT_SOURCE_DIR } from '../scripts/seed-pet-rigs.mjs';

const TEST_SECRET = 'test_pet_motion_jwt_secret_1234567890';

/**
 * Fake MySQL pool in-memory hỗ trợ đúng các câu lệnh SQL của Step 1
 * (users.is_admin, pet_rigs, pet_motion_approvals, pet_motion_history).
 */
function createFakeDb({ users = new Map() } = {}) {
  const petRigs = new Map();
  const approvals = new Map();
  const history = [];

  return {
    petRigs,
    approvals,
    history,
    async execute(sql, params = []) {
      const q = sql.replace(/\s+/g, ' ').trim();

      if (/^SELECT is_admin FROM users WHERE id = \?$/i.test(q)) {
        const u = users.get(params[0]);
        return [u ? [{ is_admin: u.is_admin }] : []];
      }

      if (/^INSERT IGNORE INTO pet_rigs/i.test(q)) {
        const [petStage, draftRig, draftImages] = params;
        if (petRigs.has(petStage)) return [{ affectedRows: 0 }];
        petRigs.set(petStage, {
          pet_stage: petStage,
          draft_rig: JSON.parse(draftRig),
          draft_images: JSON.parse(draftImages),
          published_rig: null,
          published_images: null,
          status: 'draft',
          updated_at: new Date().toISOString(),
          approved_at: null,
        });
        return [{ affectedRows: 1 }];
      }

      if (/^INSERT INTO pet_motion_history/i.test(q)) {
        const [refKey, dataJson] = params;
        history.push({ kind: 'rig', ref_key: refKey, data_json: JSON.parse(dataJson) });
        return [{ affectedRows: 1 }];
      }

      if (/^SELECT pet_stage, draft_rig, avatar_path, status, updated_at, approved_at FROM pet_rigs$/i.test(q)) {
        return [[...petRigs.values()]];
      }

      if (/FROM pet_motion_approvals/i.test(q)) {
        return [[]];
      }

      throw new Error(`Unexpected SQL in test: ${q}`);
    },
  };
}

function requestJson(baseUrl, reqPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`${baseUrl}${reqPath}`, { method: 'GET', headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body ? JSON.parse(body) : null,
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

describe('Bước 1 — Phân quyền admin + migration + seed pet-motion', () => {
  let prevSecret;
  let server;
  let baseUrl;
  let tmpStorage;
  let db;

  before(async () => {
    prevSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = TEST_SECRET;

    tmpStorage = await fs.mkdtemp(path.join(os.tmpdir(), 'cowdi-pet-seed-'));
    db = createFakeDb({
      users: new Map([
        [1, { is_admin: 0 }], // user thường
        [2, { is_admin: 1 }], // admin
      ]),
    });

    const app = express();
    app.use(express.json());
    app.use(
      '/api/admin/pet-motion',
      createPetMotionAdminRouter({
        db,
        authMiddleware: createRequireAuth({ onHeartbeat: null }),
        adminMiddleware: createRequireAdmin(db),
      })
    );

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (tmpStorage) await fs.rm(tmpStorage, { recursive: true, force: true });
    if (prevSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = prevSecret;
  });

  it('từ chối 401 khi chưa đăng nhập', async () => {
    const res = await requestJson(baseUrl, '/api/admin/pet-motion/overview');
    assert.equal(res.status, 401);
  });

  it('từ chối 403 khi user thường gọi API admin (kể cả khi JWT bị giả mạo is_admin=1)', async () => {
    const userToken = jwt.sign({ id: 1, email: 'learner@cowdi.net', is_admin: 0 }, TEST_SECRET);
    const res1 = await requestJson(baseUrl, '/api/admin/pet-motion/overview', {
      Authorization: `Bearer ${userToken}`,
    });
    assert.equal(res1.status, 403);

    const staleToken = jwt.sign({ id: 1, email: 'learner@cowdi.net', is_admin: 1 }, TEST_SECRET);
    const res2 = await requestJson(baseUrl, '/api/admin/pet-motion/overview', {
      Authorization: `Bearer ${staleToken}`,
    });
    assert.equal(res2.status, 403);
  });

  it('seed nạp radish & bamboo_spirit (10 pet-cấp) ở trạng thái nháp, chép ảnh có hash và chạy lại an toàn', async () => {
    const first = await seedPetRigs({
      db,
      sourceDir: DEFAULT_SOURCE_DIR,
      storageDir: tmpStorage,
    });
    assert.equal(first.total, 10);
    assert.equal(first.inserted, 10);
    assert.equal(first.skipped, 0);
    assert.equal(db.petRigs.size, 10);
    assert.equal(db.history.length, 10);

    // Kiểm tra radish/c1 và bamboo_spirit/c3 (tách riêng khỏi bamboo gấu trúc đen trắng)
    const spiritC3 = db.petRigs.get('bamboo_spirit/c3');
    assert.ok(spiritC3);
    assert.equal(spiritC3.status, 'draft');
    assert.equal(spiritC3.published_rig, null);
    assert.equal(spiritC3.published_images, null);
    assert.match(spiritC3.draft_images.head, /^draft\/bamboo_spirit\/c3\/head-[0-9a-f]{8}\.png$/);
    assert.equal(db.petRigs.get('bamboo/c3'), undefined);

    // File thực tế đã được chép sang storage/draft/...
    const copiedHeadPath = path.join(tmpStorage, spiritC3.draft_images.head);
    const stat = await fs.stat(copiedHeadPath);
    assert.ok(stat.size > 0);

    // Chạy lại seed phải idempotent (không ghi đè dữ liệu đã có)
    const second = await seedPetRigs({
      db,
      sourceDir: DEFAULT_SOURCE_DIR,
      storageDir: tmpStorage,
    });
    assert.equal(second.inserted, 0);
    assert.equal(second.skipped, 10);
  });

  it('admin gọi /api/admin/pet-motion/overview nhận 200 với ma trận 23 pet × 5 cấp, tách riêng bamboo và bamboo_spirit', async () => {
    const adminToken = jwt.sign({ id: 2, email: 'admin@cowdi.net', is_admin: 1 }, TEST_SECRET);
    const res = await requestJson(baseUrl, '/api/admin/pet-motion/overview', {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.totalPets, 23);
    assert.equal(res.body.totalClips, 34);
    assert.equal(res.body.pets.length, 23);

    const bambooSpirit = res.body.pets.find((p) => p.petId === 'bamboo_spirit');
    const bamboo = res.body.pets.find((p) => p.petId === 'bamboo');
    const radish = res.body.pets.find((p) => p.petId === 'radish');

    for (let s = 1; s <= 5; s++) {
      assert.equal(bambooSpirit.stages[`c${s}`].hasRig, true);
      assert.equal(bambooSpirit.stages[`c${s}`].rigStatus, 'draft');
      assert.equal(bambooSpirit.stages[`c${s}`].approvedClips, 0);

      assert.equal(radish.stages[`c${s}`].hasRig, true);
      assert.equal(radish.stages[`c${s}`].rigStatus, 'draft');

      assert.equal(bamboo.stages[`c${s}`].hasRig, false);
      assert.equal(bamboo.stages[`c${s}`].rigStatus, 'none');
    }
  });

  it('file migration SQL hợp lệ và đủ 4 bảng bắt buộc (idempotent)', async () => {
    const sqlPath = path.resolve(import.meta.dirname, '..', 'db', 'migrate-pet-motion.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    for (const table of ['pet_motion_clips', 'pet_motion_approvals', 'pet_rigs', 'pet_motion_history']) {
      assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
    }
    assert.match(sql, /UNIQUE KEY uq_clip \(scope_key, clip\)/);
  });
});
