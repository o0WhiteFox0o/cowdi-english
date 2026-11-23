import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import jwt from 'jsonwebtoken';

import { createRequireAuth, createRequireAdmin } from '../middleware/auth.js';
import { createPetMotionAdminRouter } from '../routes/petMotionAdmin.js';
import { createPetMotionPublicRouter } from '../routes/petMotionPublic.js';
import { createMotionCache, detectImageType, resolveApprovedPetMotion } from '../utils/petMotion.js';
import { CLIPS } from '../../shared/pet-motion.js';

const TEST_SECRET = 'test_pet_motion_step2_secret_987654321';

// Minimal valid 1x1 PNG bytes
const TINY_PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82,
]);

// Minimal valid WebP header bytes
const TINY_WEBP = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.from([0x14, 0x00, 0x00, 0x00]),
  Buffer.from('WEBP'),
  Buffer.from('VP8 '),
  Buffer.from([0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
]);

// Fake Windows PE (.exe) renamed to .png
const FAKE_EXE_AS_PNG = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00This is an exe', 'binary');

/**
 * In-memory DB mock mô phỏng chính xác 4 bảng pet-motion + users.is_admin.
 */
function createInMemoryDb() {
  const users = new Map([
    [1, { is_admin: 0 }],
    [2, { is_admin: 1 }],
  ]);
  const rigs = new Map();       // pet_stage -> row
  const clips = new Map();      // `${scope_key}::${clip}` -> row
  const approvals = new Map();  // `${pet_stage}::${clip}` -> row
  const history = [];
  let clipIdSeq = 1;
  let clock = Date.now();
  const nextNow = () => {
    clock += 2000; // +2s mỗi lần update để test timestamp mismatch chính xác theo giây
    return new Date(clock);
  };

  return {
    rigs,
    clips,
    approvals,
    history,
    async execute(sql, params = []) {
      const q = sql.replace(/\s+/g, ' ').trim();

      if (/^SELECT is_admin FROM users WHERE id = \?$/i.test(q)) {
        const u = users.get(params[0]);
        return [u ? [{ is_admin: u.is_admin }] : []];
      }

      if (/^INSERT INTO pet_motion_history/i.test(q)) {
        const [kind, ref_key, data_json, user_id] = params;
        history.push({ kind, ref_key, data_json: JSON.parse(data_json), user_id });
        return [{ affectedRows: 1 }];
      }

      // ── pet_rigs ──
      if (/^SELECT draft_images FROM pet_rigs WHERE pet_stage = \?$/i.test(q)) {
        const r = rigs.get(params[0]);
        return [r ? [{ draft_images: r.draft_images }] : []];
      }
      if (/^SELECT draft_rig, draft_images FROM pet_rigs WHERE pet_stage = \?$/i.test(q)) {
        const r = rigs.get(params[0]);
        return [r ? [{ draft_rig: r.draft_rig, draft_images: r.draft_images }] : []];
      }
      if (/^SELECT draft_rig, draft_images, status, updated_at FROM pet_rigs WHERE pet_stage = \?$/i.test(q)) {
        const r = rigs.get(params[0]);
        return [r ? [{ draft_rig: r.draft_rig, draft_images: r.draft_images, status: r.status, updated_at: r.updated_at }] : []];
      }
      if (/^SELECT updated_at FROM pet_rigs WHERE pet_stage = \?$/i.test(q)) {
        const r = rigs.get(params[0]);
        return [r ? [{ updated_at: r.updated_at }] : []];
      }
      if (/^SELECT approved_at FROM pet_rigs WHERE pet_stage = \?$/i.test(q)) {
        const r = rigs.get(params[0]);
        return [r ? [{ approved_at: r.approved_at }] : []];
      }
      if (/^SELECT status, updated_at, approved_at FROM pet_rigs WHERE pet_stage = \?$/i.test(q)) {
        const r = rigs.get(params[0]);
        return [r ? [{ status: r.status, updated_at: r.updated_at, approved_at: r.approved_at }] : []];
      }
      if (/^SELECT pet_stage, draft_rig, draft_images, published_rig, published_images, status, updated_by, updated_at, approved_by, approved_at FROM pet_rigs WHERE pet_stage = \?$/i.test(q)) {
        const r = rigs.get(params[0]);
        return [r ? [r] : []];
      }
      if (/^SELECT pet_stage, published_rig, published_images, status FROM pet_rigs WHERE pet_stage IN/i.test(q)) {
        const set = new Set(params);
        return [[...rigs.values()].filter((r) => set.has(r.pet_stage) && r.status === 'approved')];
      }
      if (/^INSERT INTO pet_rigs \(pet_stage, draft_rig, draft_images, status, updated_by\)/i.test(q)) {
        const hasImagesParam = params.length === 4;
        const pet_stage = params[0];
        const draft_rig = params[1];
        const draft_images = hasImagesParam ? params[2] : '{}';
        const updated_by = hasImagesParam ? params[3] : params[2];
        rigs.set(pet_stage, {
          pet_stage,
          draft_rig,
          draft_images,
          published_rig: null,
          published_images: null,
          status: 'draft',
          updated_by,
          updated_at: nextNow(),
          approved_by: null,
          approved_at: null,
        });
        return [{ affectedRows: 1 }];
      }
      if (/^UPDATE pet_rigs SET draft_images = \?, updated_by = \? WHERE pet_stage = \?$/i.test(q)) {
        const [draft_images, updated_by, pet_stage] = params;
        const r = rigs.get(pet_stage);
        r.draft_images = draft_images;
        r.updated_by = updated_by;
        r.updated_at = nextNow();
        return [{ affectedRows: 1 }];
      }
      if (/^UPDATE pet_rigs SET draft_rig = \?, updated_by = \? WHERE pet_stage = \?$/i.test(q)) {
        const [draft_rig, updated_by, pet_stage] = params;
        const r = rigs.get(pet_stage);
        r.draft_rig = draft_rig;
        r.updated_by = updated_by;
        r.updated_at = nextNow();
        return [{ affectedRows: 1 }];
      }
      if (/^UPDATE pet_rigs SET published_rig = draft_rig, published_images = \?, status = 'approved'/i.test(q)) {
        const [published_images, approved_by, pet_stage] = params;
        const r = rigs.get(pet_stage);
        r.published_rig = r.draft_rig;
        r.published_images = published_images;
        r.status = 'approved';
        r.approved_by = approved_by;
        r.approved_at = nextNow();
        return [{ affectedRows: 1 }];
      }

      // ── pet_motion_clips ──
      if (/^SELECT id, draft_json, published_json, status, updated_at FROM pet_motion_clips WHERE scope_key = \? AND clip = \?$/i.test(q)) {
        const row = clips.get(`${params[0]}::${params[1]}`);
        return [row ? [row] : []];
      }
      if (/^SELECT id, draft_json FROM pet_motion_clips WHERE scope_key = \? AND clip = \?$/i.test(q)) {
        const row = clips.get(`${params[0]}::${params[1]}`);
        return [row ? [{ id: row.id, draft_json: row.draft_json }] : []];
      }
      if (/^SELECT draft_json, published_json FROM pet_motion_clips WHERE scope_key = \? AND clip = \?$/i.test(q)) {
        const row = clips.get(`${params[0]}::${params[1]}`);
        return [row ? [{ draft_json: row.draft_json, published_json: row.published_json }] : []];
      }
      if (/^SELECT status, updated_at, approved_at, published_json IS NOT NULL AS has_published FROM pet_motion_clips/i.test(q)) {
        const row = clips.get(`${params[0]}::${params[1]}`);
        return [row ? [{ status: row.status, updated_at: row.updated_at, approved_at: row.approved_at, has_published: row.published_json !== null }] : []];
      }
      if (/^SELECT scope_key, clip, draft_json, published_json, status, updated_at, approved_at FROM pet_motion_clips WHERE scope_key IN/i.test(q)) {
        const target = params[0];
        return [[...clips.values()].filter((c) => c.scope_key === '' || c.scope_key === target)];
      }
      if (/^SELECT scope_key, clip, published_json FROM pet_motion_clips WHERE scope_key IN/i.test(q)) {
        const set = new Set(['', ...params]);
        return [[...clips.values()].filter((c) => set.has(c.scope_key) && c.published_json !== null)];
      }
      if (/^INSERT INTO pet_motion_clips/i.test(q)) {
        const [scope_key, clip, draft_json, updated_by] = params;
        const key = `${scope_key}::${clip}`;
        const existing = clips.get(key);
        if (existing) {
          existing.draft_json = draft_json;
          existing.status = 'draft';
          existing.updated_by = updated_by;
          existing.updated_at = nextNow();
        } else {
          clips.set(key, {
            id: clipIdSeq++,
            scope_key,
            clip,
            draft_json,
            published_json: null,
            status: 'draft',
            updated_by,
            updated_at: nextNow(),
            approved_by: null,
            approved_at: null,
          });
        }
        return [{ affectedRows: 1 }];
      }
      if (/^UPDATE pet_motion_clips SET published_json = draft_json/i.test(q)) {
        const [approved_by, scope_key, clip] = params;
        const row = clips.get(`${scope_key}::${clip}`);
        row.published_json = row.draft_json;
        row.status = 'approved';
        row.approved_by = approved_by;
        row.approved_at = nextNow();
        return [{ affectedRows: 1 }];
      }
      if (/^DELETE FROM pet_motion_clips WHERE scope_key = \? AND clip = \?$/i.test(q)) {
        const existed = clips.delete(`${params[0]}::${params[1]}`);
        return [{ affectedRows: existed ? 1 : 0 }];
      }

      // ── pet_motion_approvals ──
      if (/^SELECT pet_stage, approved_at FROM pet_motion_approvals WHERE clip = \? AND approved = 1/i.test(q)) {
        return [[...approvals.values()].filter((a) => a.clip === params[0] && a.approved === 1)];
      }
      if (/^SELECT pet_stage FROM pet_motion_approvals WHERE clip = \? AND approved = 1/i.test(q)) {
        return [[...approvals.values()].filter((a) => a.clip === params[0] && a.approved === 1)];
      }
      if (/^SELECT clip, approved, approved_by, approved_at FROM pet_motion_approvals WHERE pet_stage = \?$/i.test(q)) {
        return [[...approvals.values()].filter((a) => a.pet_stage === params[0])];
      }
      if (/^SELECT pet_stage, clip, approved FROM pet_motion_approvals WHERE pet_stage IN/i.test(q)) {
        const set = new Set(params);
        return [[...approvals.values()].filter((a) => set.has(a.pet_stage) && a.approved === 1)];
      }
      if (/^INSERT INTO pet_motion_approvals/i.test(q)) {
        const [pet_stage, clip, approved, approved_by] = params;
        approvals.set(`${pet_stage}::${clip}`, {
          pet_stage,
          clip,
          approved,
          approved_by,
          approved_at: nextNow(),
        });
        return [{ affectedRows: 1 }];
      }
      if (/^UPDATE pet_motion_approvals SET approved = 0/i.test(q)) {
        const [approved_by, clip] = params;
        let count = 0;
        for (const row of approvals.values()) {
          if (row.clip === clip && row.approved === 1) {
            row.approved = 0;
            row.approved_by = approved_by;
            row.approved_at = nextNow();
            count++;
          }
        }
        return [{ affectedRows: count }];
      }

      throw new Error(`Unexpected SQL in Step 2 test: ${q}`);
    },
  };
}

describe('Bước 2 — API admin, lưu trữ ảnh & quy tắc xuất bản pet-motion', () => {
  let prevSecret;
  let server;
  let baseUrl;
  let tmpStorage;
  let db;
  let cache;
  let adminToken;
  let userToken;

  before(async () => {
    prevSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = TEST_SECRET;
    adminToken = jwt.sign({ id: 2, email: 'admin@cowdi.net', is_admin: 1 }, TEST_SECRET);
    userToken = jwt.sign({ id: 1, email: 'user@cowdi.net', is_admin: 0 }, TEST_SECRET);

    tmpStorage = await fs.mkdtemp(path.join(os.tmpdir(), 'cowdi-pet-step2-'));
    db = createInMemoryDb();
    cache = createMotionCache();

    const authMw = createRequireAuth({ onHeartbeat: null });
    const adminMw = createRequireAdmin(db);

    const app = express();
    app.use(express.json());
    app.use(
      '/api/admin/pet-motion',
      createPetMotionAdminRouter({
        db,
        storageDir: tmpStorage,
        motionCache: cache,
        authMiddleware: authMw,
        adminMiddleware: adminMw,
      })
    );
    app.use(
      '/api/pet-motion',
      createPetMotionPublicRouter({
        db,
        storageDir: tmpStorage,
        motionCache: cache,
        authMiddleware: authMw,
      })
    );

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
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

  it('detectImageType chỉ nhận PNG/WebP thật, từ chối .exe giả dạng .png', () => {
    assert.deepEqual(detectImageType(TINY_PNG), { ext: '.png', mime: 'image/png' });
    assert.deepEqual(detectImageType(TINY_WEBP), { ext: '.webp', mime: 'image/webp' });
    assert.equal(detectImageType(FAKE_EXE_AS_PNG), null);
    assert.equal(detectImageType(Buffer.from('hello world')), null);
  });

  it('từ chối upload ảnh PNG 3 MB (413) và file .exe đổi tên thành .png (400)', async () => {
    // 1. PNG > 2 MB (3 MB)
    const bigPng = Buffer.concat([TINY_PNG, Buffer.alloc(3 * 1024 * 1024)]);
    const formBig = new FormData();
    formBig.append('file', new Blob([bigPng], { type: 'image/png' }), 'head.png');
    const rBig = await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/parts/head`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formBig,
    });
    assert.equal(rBig.status, 413);

    // 2. File .exe giả dạng .png + Content-Type: image/png
    const formExe = new FormData();
    formExe.append('file', new Blob([FAKE_EXE_AS_PNG], { type: 'image/png' }), 'head.png');
    const rExe = await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/parts/head`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formExe,
    });
    assert.equal(rExe.status, 400);
    const exeJson = await rExe.json();
    assert.match(exeJson.error, /PNG hoặc WebP/i);

    // 3. petId hoặc part không hợp lệ
    const formBadPart = new FormData();
    formBadPart.append('file', new Blob([TINY_PNG], { type: 'image/png' }), 'ok.png');
    const rBadPart = await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/parts/123bad`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formBadPart,
    });
    assert.equal(rBadPart.status, 400);
  });

  it('upload PNG/WebP hợp lệ vào draft, chặn mở ảnh nháp nếu chưa đăng nhập admin', async () => {
    const formHead = new FormData();
    formHead.append('file', new Blob([TINY_PNG], { type: 'image/png' }), 'head.png');
    const rUp = await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/parts/head`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formHead,
    });
    assert.equal(rUp.status, 200);
    const up = await rUp.json();
    assert.match(up.path, /^draft\/bamboo\/c3\/head-[0-9a-f]{8}\.png$/);
    assert.equal(up.url, `/api/admin/pet-motion/assets/${up.path}`);

    // Upload thêm body dạng WebP
    const formBody = new FormData();
    formBody.append('file', new Blob([TINY_WEBP], { type: 'image/webp' }), 'body.webp');
    const rBody = await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/parts/body`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formBody,
    });
    assert.equal(rBody.status, 200);
    const bodyUp = await rBody.json();
    assert.match(bodyUp.path, /^draft\/bamboo\/c3\/body-[0-9a-f]{8}\.webp$/);

    // Ảnh nháp KHÔNG mở được khi chưa đăng nhập (401)
    const rDraftAnon = await fetch(`${baseUrl}${up.url}`);
    assert.equal(rDraftAnon.status, 401);

    // Ảnh nháp KHÔNG mở được với user thường (403)
    const rDraftUser = await fetch(`${baseUrl}${up.url}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(rDraftUser.status, 403);

    // Admin mở được ảnh nháp (200, no-store)
    const rDraftAdmin = await fetch(`${baseUrl}${up.url}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(rDraftAdmin.status, 200);
    assert.equal(rDraftAdmin.headers.get('content-type'), 'image/png');
    assert.match(rDraftAdmin.headers.get('cache-control'), /no-store/);
  });

  it('quy tắc duyệt đầy đủ: rig nháp ẩn với người học, duyệt rig + clip mới hiện, sửa nháp không làm lộ bản chưa duyệt', async () => {
    const sampleRig = {
      size: [200, 260],
      ground: [100, 259],
      slots: [
        { name: 'body', img: 'body', z: 0, kind: 'body' },
        { name: 'head', img: 'head', z: 2, kind: 'head', pivot: [95, 130], face: true },
      ],
      eyes: [],
      mouth: null,
    };

    // Lưu rig nháp
    const rSaveRig = await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/rig`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rig: sampleRig }),
    });
    assert.equal(rSaveRig.status, 200);
    const savedRig = await rSaveRig.json();

    // Kiểm tra conflict nếu gửi expected_updated_at cũ
    const rConflict = await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/rig`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rig: sampleRig, expected_updated_at: '2020-01-01T00:00:00.000Z' }),
    });
    assert.equal(rConflict.status, 409);

    // Người học gọi GET /api/pet-motion/bamboo khi chưa duyệt rig -> {}
    const rLearn0 = await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(rLearn0.status, 200);
    assert.deepEqual(await rLearn0.json(), {});

    // Duyệt rig Bamboo C3
    const rApproveRig = await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/approve-rig`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(rApproveRig.status, 200);
    const approvedRig = await rApproveRig.json();
    assert.equal(approvedRig.status, 'approved');
    assert.ok(approvedRig.publishedImageUrls.head);

    // Ảnh đã xuất bản mở công khai được + có Cache-Control immutable 1 năm
    const rPubAsset = await fetch(`${baseUrl}${approvedRig.publishedImageUrls.head}`);
    assert.equal(rPubAsset.status, 200);
    assert.equal(rPubAsset.headers.get('cache-control'), 'public, max-age=31536000, immutable');

    // Người học thấy c3 nhưng clips vẫn rỗng (chưa duyệt clip nào)
    const rLearn1 = await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const learn1 = await rLearn1.json();
    assert.ok(learn1.c3);
    assert.deepEqual(learn1.c3.clips, {});

    // Duyệt clip idle (chưa có bản chỉnh -> lấy CLIPS.idle gốc)
    const rAppIdle = await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ clip: 'idle', approved: true }),
    });
    assert.equal(rAppIdle.status, 200);

    const learn2 = await (await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })).json();
    assert.deepEqual(learn2.c3.clips.idle, CLIPS.idle);
    assert.equal(learn2.c3.clips.cheer_small, undefined);

    // Lưu nháp bản chung cho idle -> người học VẪN thấy bản gốc (không bị lộ nháp)
    const sharedIdleDraft = { dur: 2.5, loop: true, tracks: { rot: [[0, 0, 'smooth'], [1.25, 5, 'smooth'], [2.5, 0, 'smooth']] } };
    const rPutShared = await fetch(`${baseUrl}/api/admin/pet-motion/clip`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope_key: '', clip: 'idle', data: sharedIdleDraft }),
    });
    assert.equal(rPutShared.status, 200);

    const learn3 = await (await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })).json();
    assert.deepEqual(learn3.c3.clips.idle, CLIPS.idle);

    // Xuất bản bản chung với mặc định resetApprovals=true -> bamboo/c3 quay về chờ duyệt lại
    const rPubShared = await fetch(`${baseUrl}/api/admin/pet-motion/clip/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope_key: '', clip: 'idle' }),
    });
    assert.equal(rPubShared.status, 200);
    const pubShared = await rPubShared.json();
    assert.deepEqual(pubShared.affectedPetStages, ['bamboo/c3']);
    assert.equal(pubShared.resetCount, 1);

    const learn4 = await (await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })).json();
    assert.equal(learn4.c3.clips.idle, undefined);

    // Duyệt lại idle cho bamboo/c3 -> giờ người học nhận bản chung đã xuất bản
    await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ clip: 'idle', approved: true }),
    });
    const learn5 = await (await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })).json();
    assert.deepEqual(learn5.c3.clips.idle, sharedIdleDraft);

    // Lưu bản nháp riêng cho bamboo/c3 cheer_small rồi duyệt -> tự xuất bản bản riêng
    const overrideV1 = { dur: 0.7, loop: false, tracks: { armR: [[0, 0, 'smooth'], [0.35, 75, 'smooth'], [0.7, 0, 'smooth']] } };
    await fetch(`${baseUrl}/api/admin/pet-motion/clip`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope_key: 'bamboo/c3', clip: 'cheer_small', data: overrideV1 }),
    });
    const rAppCheer = await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ clip: 'cheer_small', approved: true }),
    });
    const appCheer = await rAppCheer.json();
    assert.equal(appCheer.autoPublishedOverride, true);

    const learn6 = await (await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })).json();
    assert.deepEqual(learn6.c3.clips.cheer_small, overrideV1);

    // Sửa tiếp nháp cheer_small sau khi đã duyệt -> người học VẪN thấy overrideV1 cho tới khi duyệt lại
    const overrideV2 = { dur: 0.9, loop: false, tracks: { armR: [[0, 0, 'smooth'], [0.45, 90, 'smooth'], [0.9, 0, 'smooth']] } };
    await fetch(`${baseUrl}/api/admin/pet-motion/clip`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope_key: 'bamboo/c3', clip: 'cheer_small', data: overrideV2 }),
    });
    const learn7 = await (await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })).json();
    assert.deepEqual(learn7.c3.clips.cheer_small, overrideV1);

    // Duyệt lại cheer_small -> người học thấy overrideV2
    await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ clip: 'cheer_small', approved: true }),
    });
    const learn8 = await (await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })).json();
    assert.deepEqual(learn8.c3.clips.cheer_small, overrideV2);

    // Mọi thao tác ghi đều có lịch sử trong pet_motion_history
    assert.ok(db.history.length >= 10);
    assert.ok(savedRig.updatedAt);

    // 409 Conflict khi PUT /clip gửi expected_updated_at cũ
    const rClipConflict = await fetch(`${baseUrl}/api/admin/pet-motion/clip`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scope_key: 'bamboo/c3',
        clip: 'cheer_small',
        data: overrideV2,
        expected_updated_at: '2020-01-01T00:00:00.000Z',
      }),
    });
    assert.equal(rClipConflict.status, 409);

    // Xuất bản bản chung với resetApprovals=false -> giữ nguyên duyệt & cập nhật ngay cho người học
    const sharedIdleV2 = {
      dur: 2.2,
      loop: true,
      tracks: { rot: [[0, 0, 'smooth'], [1.1, -6, 'smooth'], [2.2, 0, 'smooth']] },
      emoji: { enabled: true, char: '🌿', pos: 'top-right' },
    };
    const rPutIdleV2 = await fetch(`${baseUrl}/api/admin/pet-motion/clip`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope_key: '', clip: 'idle', data: sharedIdleV2 }),
    });
    assert.equal(rPutIdleV2.status, 200);
    // Trước khi xuất bản: người học vẫn thấy bản cũ (không lộ emoji nháp)
    const learnBeforePub = await (await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })).json();
    assert.equal(learnBeforePub.c3.clips.idle.emoji, undefined);

    const rPubKeep = await fetch(`${baseUrl}/api/admin/pet-motion/clip/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope_key: '', clip: 'idle', resetApprovals: false }),
    });
    assert.equal(rPubKeep.status, 200);
    const pubKeep = await rPubKeep.json();
    assert.equal(pubKeep.resetCount, 0);

    const learnAfterPub = await (await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })).json();
    assert.deepEqual(learnAfterPub.c3.clips.idle.emoji, { enabled: true, char: '🌿', pos: 'top-right' });

    // Bỏ duyệt cheer_small (approved=false) -> ẩn ngay khỏi người học
    const rUnapprove = await fetch(`${baseUrl}/api/admin/pet-motion/bamboo/3/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ clip: 'cheer_small', approved: false }),
    });
    assert.equal(rUnapprove.status, 200);
    const learnAfterUnapprove = await (await fetch(`${baseUrl}/api/pet-motion/bamboo`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })).json();
    assert.equal(learnAfterUnapprove.c3.clips.cheer_small, undefined);
  });

  it('upload emoji tự thiết kế kiểm tra magic bytes, dung lượng, phân quyền và xoá được', async () => {
    // 1. User thường không được upload emoji
    const formUser = new FormData();
    formUser.append('file', new Blob([TINY_PNG], { type: 'image/png' }), 'star.png');
    const rUser = await fetch(`${baseUrl}/api/admin/pet-motion/emojis`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: formUser,
    });
    assert.equal(rUser.status, 403);

    // 2. File .exe giả dạng .png bị từ chối 400
    const formExe = new FormData();
    formExe.append('file', new Blob([FAKE_EXE_AS_PNG], { type: 'image/png' }), 'bad.png');
    const rExe = await fetch(`${baseUrl}/api/admin/pet-motion/emojis`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formExe,
    });
    assert.equal(rExe.status, 400);

    // 3. Admin upload PNG hợp lệ -> mở công khai được và xoá được
    const formOk = new FormData();
    formOk.append('file', new Blob([TINY_PNG], { type: 'image/png' }), 'sparkle.png');
    const rOk = await fetch(`${baseUrl}/api/admin/pet-motion/emojis`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formOk,
    });
    assert.equal(rOk.status, 200);
    const okJson = await rOk.json();
    assert.ok(okJson.emoji?.id);
    assert.match(okJson.emoji.url, /^\/api\/pet-motion\/assets\/emojis\/.+\.png$/);

    const rAsset = await fetch(`${baseUrl}${okJson.emoji.url}`);
    assert.equal(rAsset.status, 200);
    assert.equal(rAsset.headers.get('content-type'), 'image/png');

    const rDel = await fetch(`${baseUrl}/api/admin/pet-motion/emojis/${encodeURIComponent(okJson.emoji.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(rDel.status, 200);
  });

  it('resolveApprovedPetMotion áp dụng đúng thứ tự ưu tiên: riêng > chung > gốc', () => {
    const globalClip = { dur: 1.1, loop: false, tracks: { rot: [[0, 10, 'smooth']] } };
    const overrideClip = { dur: 1.2, loop: false, tracks: { rot: [[0, 20, 'smooth']] } };
    const res = resolveApprovedPetMotion({
      petId: 'bamboo',
      rigRows: [
        {
          pet_stage: 'bamboo/c3',
          status: 'approved',
          published_rig: { size: [100, 100], ground: [50, 99], slots: [], eyes: [] },
          published_images: { body: 'published/bamboo/c3/body-12345678.png' },
        },
        {
          pet_stage: 'bamboo/c4',
          status: 'draft',
          published_rig: null,
          published_images: null,
        },
      ],
      approvalRows: [
        { pet_stage: 'bamboo/c3', clip: 'cheer_small', approved: 1 },
        { pet_stage: 'bamboo/c3', clip: 'wave', approved: 1 },
        { pet_stage: 'bamboo/c3', clip: 'idle', approved: 1 },
        { pet_stage: 'bamboo/c4', clip: 'idle', approved: 1 },
      ],
      clipRows: [
        { scope_key: '', clip: 'cheer_small', published_json: globalClip },
        { scope_key: 'bamboo/c3', clip: 'cheer_small', published_json: overrideClip },
        { scope_key: '', clip: 'wave', published_json: globalClip },
      ],
    });

    assert.equal(res.c4, undefined);
    assert.deepEqual(res.c3.clips.cheer_small, overrideClip);
    assert.deepEqual(res.c3.clips.wave, globalClip);
    assert.deepEqual(res.c3.clips.idle, CLIPS.idle);
  });
});
