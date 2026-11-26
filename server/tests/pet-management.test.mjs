import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import { createPetMotionAdminRouter } from '../routes/petMotionAdmin.js';
import { createPetMotionPublicRouter } from '../routes/petMotionPublic.js';
import {
  ALL_PET_IDS,
  createMotionCache,
  isValidPetIdFormat,
  validatePetCatalogPayload,
} from '../utils/petMotion.js';

// 1x1 PNG hợp lệ (magic bytes chuẩn)
const TINY_PNG = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000000020001e221bc330000000049454e44ae426082',
  'hex'
);

function createMockCatalogDb() {
  const catalog = new Map();
  const rigs = new Map();
  const approvals = [];
  const history = [];

  return {
    catalog,
    rigs,
    history,
    async execute(sql, params = []) {
      const q = sql.replace(/\s+/g, ' ').trim();
      if (q.startsWith('SELECT pet_id, name, species') && q.includes('FROM pet_catalog')) {
        let rows = Array.from(catalog.values());
        if (q.includes('WHERE is_active = 1')) rows = rows.filter((r) => r.is_active === 1);
        return [rows];
      }
      if (q.startsWith('SELECT pet_id') && q.includes('FROM pet_catalog WHERE pet_id = ?')) {
        const row = catalog.get(params[0]);
        return [row ? [row] : []];
      }
      if (q.startsWith('INSERT INTO pet_catalog')) {
        const isUpdateInsert = q.includes('VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())');
        const row = isUpdateInsert
          ? {
              pet_id: params[0], name: params[1], species: params[2], emoji: params[3],
              element: params[4], pet_group: params[5], rarity: params[6], description: params[7],
              evolutions_json: params[8], unlock_json: params[9], is_custom: params[10],
              is_active: params[11], created_by: params[12], updated_by: params[13],
              created_at: new Date(), updated_at: new Date(),
            }
          : {
              pet_id: params[0], name: params[1], species: params[2], emoji: params[3],
              element: params[4], pet_group: params[5], rarity: params[6], description: params[7],
              evolutions_json: params[8], unlock_json: params[9], is_custom: 1,
              is_active: params[10], created_by: params[11], updated_by: params[12],
              created_at: new Date(), updated_at: new Date(),
            };
        catalog.set(row.pet_id, row);
        return [{ affectedRows: 1 }];
      }
      if (q.startsWith('UPDATE pet_catalog SET')) {
        const petId = params[11];
        const prev = catalog.get(petId);
        if (prev) {
          catalog.set(petId, {
            ...prev,
            name: params[0], species: params[1], emoji: params[2], element: params[3],
            pet_group: params[4], rarity: params[5], description: params[6],
            evolutions_json: params[7], unlock_json: params[8], is_active: params[9],
            updated_by: params[10], updated_at: new Date(),
          });
        }
        return [{ affectedRows: prev ? 1 : 0 }];
      }
      if (q.startsWith('DELETE FROM pet_catalog WHERE pet_id = ?')) {
        const existed = catalog.delete(params[0]);
        return [{ affectedRows: existed ? 1 : 0 }];
      }
      if (q.startsWith('SELECT pet_stage, draft_rig, avatar_path')) {
        return [Array.from(rigs.values())];
      }
      if (q.startsWith('SELECT pet_stage, avatar_path FROM pet_rigs WHERE avatar_path IS NOT NULL')) {
        return [Array.from(rigs.values()).filter((r) => r.avatar_path)];
      }
      if (q.startsWith('SELECT pet_stage FROM pet_rigs WHERE pet_stage = ?')) {
        const r = rigs.get(params[0]);
        return [r ? [r] : []];
      }
      if (q.startsWith('INSERT INTO pet_rigs')) {
        const hasAvatarLiteralImages = q.includes("VALUES (?, ?, '{}', ?, 'draft', ?)");
        rigs.set(params[0], {
          pet_stage: params[0],
          draft_rig: params[1],
          draft_images: hasAvatarLiteralImages ? '{}' : params[2],
          avatar_path: hasAvatarLiteralImages ? params[2] : params[3],
          status: 'draft',
          updated_at: new Date(),
          approved_at: null,
        });
        return [{ affectedRows: 1 }];
      }
      if (q.startsWith('UPDATE pet_rigs SET avatar_path = ?')) {
        const r = rigs.get(params[2]);
        if (r) r.avatar_path = params[0];
        return [{ affectedRows: r ? 1 : 0 }];
      }
      if (q.startsWith('DELETE FROM pet_rigs WHERE pet_stage IN')) {
        for (const k of params) rigs.delete(k);
        return [{ affectedRows: 1 }];
      }
      if (q.startsWith('DELETE FROM pet_motion_approvals') || q.startsWith('DELETE FROM pet_motion_clips')) {
        return [{ affectedRows: 0 }];
      }
      if (q.startsWith('SELECT pet_stage, COUNT(*) AS approved_count')) {
        return [approvals];
      }
      if (q.startsWith('INSERT INTO pet_motion_history')) {
        history.push({ kind: params[0], ref_key: params[1], data: JSON.parse(params[2]) });
        return [{ affectedRows: 1 }];
      }
      return [[]];
    },
  };
}

test('Quản lý Pet (pet_catalog): validate payload, CRUD, upload avatar pet mới, bảo vệ pet gốc & SQL MySQL 5.6+', async (t) => {
  const storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cowdi-pet-mgmt-'));
  const db = createMockCatalogDb();
  const motionCache = createMotionCache();

  const app = express();
  app.use(express.json());
  const fakeAdminAuth = (req, _res, next) => {
    req.user = { id: 1, is_admin: 1 };
    next();
  };
  app.use(
    '/api/admin/pet-motion',
    createPetMotionAdminRouter({
      db,
      storageDir,
      motionCache,
      authMiddleware: fakeAdminAuth,
      adminMiddleware: (_req, _res, next) => next(),
    })
  );
  app.use(
    '/api/pet-motion',
    createPetMotionPublicRouter({
      db,
      storageDir,
      motionCache,
      authMiddleware: fakeAdminAuth,
    })
  );

  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  t.after(async () => {
    server.close();
    await fs.rm(storageDir, { recursive: true, force: true });
  });

  await t.test('1. Validation petId & payload chuẩn', () => {
    assert.equal(isValidPetIdFormat('banh_mi'), true);
    assert.equal(isValidPetIdFormat('../evil'), false);
    assert.equal(isValidPetIdFormat('pets'), false);
    const bad = validatePetCatalogPayload({ petId: 'ok_pet', name: 'Test', element: 'invalid' }, { isCreate: true });
    assert.ok(bad.error);
    const good = validatePetCatalogPayload({
      petId: 'banh_mi',
      name: 'Bánh Mì',
      species: 'Bánh mì Việt',
      element: 'earth',
      group: 'farm',
      rarity: 'rare',
    }, { isCreate: true });
    assert.equal(good.error, null);
    assert.equal(good.data.evolutions.length, 5);
  });

  await t.test('2. POST /pets tạo pet mới, chặn trùng pet gốc cowdi', async () => {
    const dupRes = await fetch(`${baseUrl}/api/admin/pet-motion/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petId: 'cowdi', name: 'Fake Cowdi', element: 'neutral', group: 'farm', rarity: 'common' }),
    });
    assert.equal(dupRes.status, 409);

    const createRes = await fetch(`${baseUrl}/api/admin/pet-motion/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        petId: 'banh_mi',
        name: 'Bánh Mì',
        species: 'Bánh mì giòn',
        emoji: '🥖',
        element: 'earth',
        group: 'farm',
        rarity: 'rare',
        description: 'Thơm giòn, luôn tiếp sức học từ mới',
      }),
    });
    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    assert.equal(created.ok, true);
    assert.equal(created.pet.petId, 'banh_mi');

    const ovRes = await fetch(`${baseUrl}/api/admin/pet-motion/overview`);
    const ov = await ovRes.json();
    assert.equal(ov.totalPets, ALL_PET_IDS.length + 1);
    const found = ov.pets.find((p) => p.petId === 'banh_mi');
    assert.ok(found);
    assert.equal(found.isCustom, true);
    assert.equal(found.name, 'Bánh Mì');
  });

  await t.test('3. Upload avatar PNG cho pet mới & xuất hiện trên GET /api/pet-motion/catalog', async () => {
    const form = new FormData();
    form.append('file', new Blob([TINY_PNG], { type: 'image/png' }), 'banh_mi_c3.png');
    const upRes = await fetch(`${baseUrl}/api/admin/pet-motion/banh_mi/3/avatar`, {
      method: 'POST',
      body: form,
    });
    assert.equal(upRes.status, 200);
    const upJson = await upRes.json();
    assert.match(upJson.avatarUrl, /^\/api\/pet-motion\/assets\/avatars\/banh_mi\/c3-[0-9a-f]{8}\.png\/raw$/);

    // Tải ảnh qua URL /raw mới VÀ URL cũ không có /raw đều trả 200 image/png
    const rawImgRes = await fetch(`${baseUrl}${upJson.avatarUrl}`);
    assert.equal(rawImgRes.status, 200);
    assert.equal(rawImgRes.headers.get('content-type'), 'image/png');
    const legacyImgRes = await fetch(`${baseUrl}${upJson.avatarUrl.replace(/\/raw$/, '')}`);
    assert.equal(legacyImgRes.status, 200);

    const catRes = await fetch(`${baseUrl}/api/pet-motion/catalog`);
    assert.equal(catRes.status, 200);
    const cat = await catRes.json();
    assert.equal(cat.pets.length, 1);
    assert.equal(cat.pets[0].id, 'banh_mi');
    assert.equal(cat.avatars['banh_mi/c3'], upJson.avatarUrl);
  });

  await t.test('4. PUT sửa pet mới & DELETE chặn xoá pet gốc, xoá sạch pet tự thêm', async () => {
    const updRes = await fetch(`${baseUrl}/api/admin/pet-motion/pets/banh_mi`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bánh Mì Sài Gòn',
        species: 'Bánh mì thịt',
        emoji: '🥖',
        element: 'fire',
        group: 'farm',
        rarity: 'epic',
      }),
    });
    assert.equal(updRes.status, 200);
    const upd = await updRes.json();
    assert.equal(upd.pet.name, 'Bánh Mì Sài Gòn');

    const delBuiltIn = await fetch(`${baseUrl}/api/admin/pet-motion/pets/cowdi`, { method: 'DELETE' });
    assert.equal(delBuiltIn.status, 400);

    const delCustom = await fetch(`${baseUrl}/api/admin/pet-motion/pets/banh_mi`, { method: 'DELETE' });
    assert.equal(delCustom.status, 200);
    assert.equal(db.catalog.has('banh_mi'), false);
  });

  await t.test('5. File migration server/db/migrate-pet-catalog.sql tương thích MySQL 5.6+', async () => {
    const sql = await fs.readFile(path.resolve(process.cwd(), 'server/db/migrate-pet-catalog.sql'), 'utf8');
    assert.match(sql, /CREATE TABLE IF NOT EXISTS pet_catalog/i);
    assert.doesNotMatch(sql, /^\s*USE\s+/im);
    assert.doesNotMatch(sql, /\bJSON\b/i);
    assert.match(sql, /LONGTEXT/i);
  });
});
