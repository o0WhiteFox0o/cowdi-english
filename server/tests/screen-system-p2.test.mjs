import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createScreensRouter } from '../routes/screens.js';
import { mixLesson } from '../../src/features/lesson/screens/mixer.js';
import { simulate1000 } from '../../src/admin/screens/ruleChecker.js';
import { SCREEN_CATALOG } from '../../src/features/lesson/screens/catalog.js';
import { SCREEN_CONFIG } from '../../src/data/config/screens.js';
import { ALL_LESSONS } from '../../src/data/lessons/index.js';

/** Mock MySQL pool đủ cho screen-config-manager + transactions */
function createMockPool() {
  const state = {
    users: [
      { id: 1, name: 'Admin Sonny', email: 'admin@cowdi.net', is_admin: 1 },
      { id: 2, name: 'Tester Bé An', email: 'tester@cowdi.net', is_admin: 0 },
      { id: 3, name: 'User Thường', email: 'normal@cowdi.net', is_admin: 0 },
    ],
    screen_config: new Map(),
    screen_weights: new Map(),
    screen_testers: new Map(),
    screen_config_log: [],
    tickMs: Date.parse('2026-11-27T15:00:00.000Z'),
  };

  const nextNow = () => {
    state.tickMs += 1000;
    return new Date(state.tickMs);
  };

  const execSql = async (sql, params = []) => {
    const q = sql.replace(/\s+/g, ' ').trim();

    if (/^CREATE TABLE/i.test(q)) return [{ affectedRows: 0 }];

    if (/^INSERT IGNORE INTO screen_config/i.test(q)) {
      const [code, status, note] = params;
      if (!state.screen_config.has(code)) {
        state.screen_config.set(code, { code, status, note, updated_by: null, updated_at: nextNow() });
      }
      return [{ affectedRows: 1 }];
    }

    if (/^INSERT IGNORE INTO screen_weights/i.test(q)) {
      const [group_id, level, weight] = params;
      const k = `${group_id}:${level}`;
      if (!state.screen_weights.has(k)) {
        state.screen_weights.set(k, { group_id, level, weight, updated_by: null, updated_at: nextNow() });
      }
      return [{ affectedRows: 1 }];
    }

    if (/^SELECT code, status, updated_at FROM screen_config$/i.test(q)) {
      return [[...state.screen_config.values()]];
    }

    if (/^SELECT group_id, level, weight, updated_at FROM screen_weights$/i.test(q)) {
      return [[...state.screen_weights.values()]];
    }

    if (/^SELECT user_id FROM screen_testers WHERE user_id = \?/i.test(q)) {
      const hit = state.screen_testers.get(Number(params[0]));
      return [hit ? [{ user_id: hit.user_id }] : []];
    }

    if (/^SELECT sc\.code, sc\.status/i.test(q)) {
      const rows = [...state.screen_config.values()].map((r) => {
        const u = state.users.find((x) => x.id === r.updated_by);
        return { ...r, updated_by_name: u?.name || null, updated_by_email: u?.email || null };
      });
      return [rows];
    }

    if (/^SELECT sw\.group_id, sw\.level/i.test(q)) {
      return [[...state.screen_weights.values()]];
    }

    if (/^SELECT code, status, note FROM screen_config WHERE code = \?/i.test(q)) {
      const row = state.screen_config.get(params[0]);
      return [row ? [row] : []];
    }

    if (/^INSERT INTO screen_config \(code, status, note/i.test(q)) {
      const [code, status, note, updated_by] = params;
      state.screen_config.set(code, { code, status, note, updated_by, updated_at: nextNow() });
      return [{ affectedRows: 1 }];
    }

    if (/^SELECT level, weight FROM screen_weights WHERE group_id = \?/i.test(q)) {
      const rows = [...state.screen_weights.values()].filter((r) => r.group_id === params[0]);
      return [rows];
    }

    if (/^INSERT INTO screen_weights \(group_id, level, weight/i.test(q)) {
      const [group_id, level, weight, updated_by] = params;
      state.screen_weights.set(`${group_id}:${level}`, { group_id, level, weight, updated_by, updated_at: nextNow() });
      return [{ affectedRows: 1 }];
    }

    if (/^INSERT INTO screen_config_log/i.test(q)) {
      const [target, old_value, new_value, changed_by] = params;
      state.screen_config_log.push({
        id: state.screen_config_log.length + 1,
        target,
        old_value,
        new_value,
        changed_by,
        changed_at: nextNow(),
      });
      return [{ insertId: state.screen_config_log.length }];
    }

    if (/^SELECT st\.user_id, st\.note/i.test(q)) {
      const rows = [...state.screen_testers.values()].map((t) => {
        const u = state.users.find((x) => x.id === t.user_id);
        const a = state.users.find((x) => x.id === t.added_by);
        return { ...t, name: u?.name, email: u?.email, added_by_name: a?.name };
      });
      return [rows];
    }

    if (/^SELECT id, name, email, is_admin FROM users/i.test(q)) {
      const kw = String(params[0] || '').replace(/%/g, '').toLowerCase();
      return [state.users.filter((u) => u.email.toLowerCase().includes(kw) || u.name.toLowerCase().includes(kw))];
    }

    if (/^SELECT id, name, email FROM users WHERE id = \?/i.test(q)) {
      const u = state.users.find((x) => x.id === Number(params[0]));
      return [u ? [u] : []];
    }

    if (/^INSERT INTO screen_testers/i.test(q)) {
      const [user_id, note, added_by] = params;
      state.screen_testers.set(Number(user_id), { user_id: Number(user_id), note, added_by, added_at: nextNow() });
      return [{ affectedRows: 1 }];
    }

    if (/^SELECT user_id, note FROM screen_testers WHERE user_id = \?/i.test(q)) {
      const hit = state.screen_testers.get(Number(params[0]));
      return [hit ? [hit] : []];
    }

    if (/^DELETE FROM screen_testers WHERE user_id = \?/i.test(q)) {
      state.screen_testers.delete(Number(params[0]));
      return [{ affectedRows: 1 }];
    }

    if (/^SELECT l\.id, l\.target/i.test(q)) {
      const rows = [...state.screen_config_log].reverse().map((l) => {
        const u = state.users.find((x) => x.id === l.changed_by);
        return { ...l, actor_name: u?.name, actor_email: u?.email };
      });
      return [rows];
    }

    throw new Error(`Unhandled mock SQL: ${q}`);
  };

  const conn = {
    execute: execSql,
    query: execSql,
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
  };

  return {
    state,
    execute: execSql,
    query: execSql,
    getConnection: async () => conn,
  };
}

async function createTestServer(mockPool) {
  const app = express();
  app.use(express.json());
  const authMiddleware = (req, res, next) => {
    const uid = Number(req.headers['x-test-user'] || 0);
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { id: uid };
    next();
  };
  const adminMiddleware = (req, res, next) => {
    const u = mockPool.state.users.find((x) => x.id === req.user?.id);
    if (!u || !u.is_admin) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
  app.use('/api', createScreensRouter({ pool: mockPool, authMiddleware, adminMiddleware }));
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

test('Đợt 2 (A1–A3, A5, A8): Phân quyền admin, đổi trạng thái + log, ETag 304, tài khoản thử & validate trọng số', async () => {
  const mockPool = createMockPool();
  const srv = await createTestServer(mockPool);
  try {
    // A1: Người không phải admin gọi API admin → 403
    const r403 = await fetch(`${srv.baseUrl}/api/admin/screens`, { headers: { 'x-test-user': '3' } });
    assert.equal(r403.status, 403);

    // Đọc config ban đầu + ETag
    const rInit = await fetch(`${srv.baseUrl}/api/screens/config`, { headers: { 'x-test-user': '3' } });
    assert.equal(rInit.status, 200);
    const etag1 = rInit.headers.get('etag');
    const cfg1 = await rInit.json();
    assert.equal(cfg1.isTester, false);
    assert.equal(cfg1.status['T-08'], 'on');

    // A3: If-None-Match đúng version → 304
    const r304 = await fetch(`${srv.baseUrl}/api/screens/config`, {
      headers: { 'x-test-user': '3', 'if-none-match': etag1 },
    });
    assert.equal(r304.status, 304);

    // Chặn đặt on/test cho mã chưa có component (F-02 — Đợt 4)
    const rUnsupported = await fetch(`${srv.baseUrl}/api/admin/screens/F-02`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-test-user': '1' },
      body: JSON.stringify({ status: 'test' }),
    });
    assert.equal(rUnsupported.status, 400);

    // Chặn sửa trạng thái T-03
    const rT03 = await fetch(`${srv.baseUrl}/api/admin/screens/T-03`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-test-user': '1' },
      body: JSON.stringify({ status: 'on' }),
    });
    assert.equal(rT03.status, 400);

    // A2: Đổi trạng thái T-08 → 'test' tạo 1 dòng log + version mới trong GET /api/screens/config
    const rPut = await fetch(`${srv.baseUrl}/api/admin/screens/T-08`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-test-user': '1' },
      body: JSON.stringify({ status: 'test', note: 'Thử nghiệm T-08' }),
    });
    assert.equal(rPut.status, 200);

    const rLogs = await fetch(`${srv.baseUrl}/api/admin/screen-log`, { headers: { 'x-test-user': '1' } });
    const { logs } = await rLogs.json();
    assert.equal(logs.length, 1);
    assert.equal(logs[0].target, 'status:T-08');

    const rAfter = await fetch(`${srv.baseUrl}/api/screens/config`, { headers: { 'x-test-user': '3' } });
    const cfgAfter = await rAfter.json();
    assert.notEqual(cfgAfter.version, cfg1.version);
    assert.equal(cfgAfter.status['T-08'], 'test');

    // A5: Thêm user 2 vào screen_testers → user 2 nhận isTester=true, user 3 nhận false
    const rAddTester = await fetch(`${srv.baseUrl}/api/admin/screen-testers`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user': '1' },
      body: JSON.stringify({ userId: 2, note: 'Nhóm thử' }),
    });
    assert.equal(rAddTester.status, 201);

    const cfgTester = await (await fetch(`${srv.baseUrl}/api/screens/config`, { headers: { 'x-test-user': '2' } })).json();
    const cfgNormal = await (await fetch(`${srv.baseUrl}/api/screens/config`, { headers: { 'x-test-user': '3' } })).json();
    assert.equal(cfgTester.isTester, true);
    assert.equal(cfgNormal.isTester, false);

    // Kiểm với mixLesson: user thường KHÔNG thấy T-08 (đang 'test'), tester THẤY T-08
    const sampleLesson = {
      id: 't-sample',
      vocabulary: [
        { word: 'apple', meaning: 'táo', example: 'I eat a red apple.', exampleVi: 'Tôi ăn táo đỏ.' },
        { word: 'milk', meaning: 'sữa', example: 'She drinks warm milk.', exampleVi: 'Cô ấy uống sữa ấm.' },
        { word: 'book', meaning: 'sách', example: 'We read a good book.', exampleVi: 'Chúng tôi đọc sách hay.' },
        { word: 'home', meaning: 'nhà', example: 'They walk back home.', exampleVi: 'Họ đi bộ về nhà.' },
      ],
      grammar: [{
        title: 'G1',
        examples: [
          { en: 'I eat a red apple.', vi: 'Tôi ăn táo đỏ.' },
          { en: 'She drinks warm milk.', vi: 'Cô ấy uống sữa ấm.' },
          { en: 'We read a good book.', vi: 'Chúng tôi đọc sách hay.' },
        ],
      }],
      reading: { passage: 'I eat a red apple and drink milk.' },
      quiz: [{ question: 'Apple?', options: ['táo', 'cam', 'lê', 'nho'], correct: 0 }],
    };
    const mixNormal = mixLesson({ lesson: sampleLesson, group: 'intermediate', config: cfgNormal, isTester: cfgNormal.isTester, seed: 5 });
    const mixTester = mixLesson({ lesson: sampleLesson, group: 'intermediate', config: cfgTester, isTester: cfgTester.isTester, seed: 5 });
    assert.ok(mixNormal.screens.every((s) => s.code !== 'T-08' && s.code !== 'F-09'));
    assert.ok(mixTester.screens.some((s) => s.code === 'T-08' || s.code === 'F-09'));

    // A8: Trọng số sai (âm, >1, tổng = 0) → 400
    for (const bad of [{ friendly: -0.1, focus: 0.5 }, { friendly: 1.5, focus: 0.5 }, { friendly: 0, focus: 0 }]) {
      const rBad = await fetch(`${srv.baseUrl}/api/admin/screen-weights/exam`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', 'x-test-user': '1' },
        body: JSON.stringify(bad),
      });
      assert.equal(rBad.status, 400);
    }

    // Trọng số hợp lệ → 200 + ghi log
    const rWeightOk = await fetch(`${srv.baseUrl}/api/admin/screen-weights/exam`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-test-user': '1' },
      body: JSON.stringify({ friendly: 0.3, focus: 0.7 }),
    });
    assert.equal(rWeightOk.status, 200);
  } finally {
    await srv.close();
  }
});

test('Đợt 2 (A7 + mô phỏng 1 000 lần): Ma trận dữ liệu khớp RPT-SCREEN-COVERAGE và 0 vi phạm luật', () => {
  const nonPicture = ALL_LESSONS.filter((l) => l.format !== 'picture');
  assert.equal(nonPicture.length, 209);
  const t08Count = nonPicture.filter((l) => SCREEN_CATALOG.find((s) => s.code === 'T-08').canRun(l).ok).length;
  assert.equal(t08Count, 175);

  const sim = simulate1000({
    lesson: nonPicture[0],
    group: 'intermediate',
    config: SCREEN_CONFIG,
    isTester: false,
    registry: SCREEN_CATALOG,
    runs: 1000,
  });
  assert.equal(sim.violations, 0);
});
