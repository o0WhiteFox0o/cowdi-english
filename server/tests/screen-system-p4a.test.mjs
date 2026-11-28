import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createScreensRouter } from '../routes/screens.js';
import { computeStatMetrics } from '../utils/screen-config-manager.js';
import { P4A_SEED_INTROS, P4A_INTRO_CODES, P4A_INTRO_REGIONS } from '../db/seed-screen-intros-p4a.js';
import { getScreenTitle, SCREEN_SCENARIOS } from '../../shared/screen-scenarios.js';
import { createRng } from '../../src/features/lesson/screens/seededRandom.js';
import {
  isSingleSpellableWord,
  buildLetterBank,
  initSpellTurn,
  pickSpellKey,
} from '../../src/features/lesson/screens/friendly/f02Logic.js';
import {
  evaluateSpeakAttempt,
  shouldShowManualMicButton,
} from '../../src/features/lesson/screens/friendly/f04Logic.js';
import {
  extractValidHighlights,
  canRunF05,
  buildFogPassageLines,
} from '../../src/features/lesson/screens/friendly/f05Logic.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function createStatsMockPool() {
  const daily = new Map(); // key: `${day}:${code}:${group_id}`
  const today = new Date().toISOString().slice(0, 10);

  const execSql = async (sql, params = []) => {
    const q = sql.replace(/\s+/g, ' ').trim();
    if (/^CREATE TABLE/i.test(q)) return [{ affectedRows: 0 }];
    if (/^INSERT IGNORE INTO screen_config/i.test(q)) return [{ affectedRows: 1 }];
    if (/^INSERT IGNORE INTO screen_weights/i.test(q)) return [{ affectedRows: 1 }];

    if (/^INSERT INTO screen_stat_daily/i.test(q)) {
      const [code, groupId, incCompletes, incQuits, incItems, incFirstTry, incMs] = params;
      const key = `${today}:${code}:${groupId}`;
      const cur = daily.get(key) || {
        day: today,
        code,
        group_id: groupId,
        starts: 0,
        completes: 0,
        quits: 0,
        items: 0,
        first_try: 0,
        sum_ms: 0,
      };
      cur.starts += 1;
      cur.completes += Number(incCompletes) || 0;
      cur.quits += Number(incQuits) || 0;
      cur.items += Number(incItems) || 0;
      cur.first_try += Number(incFirstTry) || 0;
      cur.sum_ms += Number(incMs) || 0;
      daily.set(key, cur);
      return [{ affectedRows: 1 }];
    }

    if (/FROM screen_stat_daily/i.test(q)) {
      const hasGroup = /group_id = \?/i.test(q);
      const targetGroup = hasGroup ? params[1] : null;
      const byCode = new Map();
      for (const row of daily.values()) {
        if (targetGroup && row.group_id !== targetGroup) continue;
        const agg = byCode.get(row.code) || {
          code: row.code,
          starts: 0,
          completes: 0,
          quits: 0,
          items: 0,
          first_try: 0,
          sum_ms: 0,
        };
        agg.starts += row.starts;
        agg.completes += row.completes;
        agg.quits += row.quits;
        agg.items += row.items;
        agg.first_try += row.first_try;
        agg.sum_ms += row.sum_ms;
        byCode.set(row.code, agg);
      }
      return [[...byCode.values()].sort((a, b) => a.code.localeCompare(b.code))];
    }

    return [[]];
  };

  return {
    daily,
    query: execSql,
    execute: execSql,
    getConnection: async () => ({
      query: execSql,
      execute: execSql,
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {},
    }),
  };
}

async function startTestServer(pool) {
  const app = express();
  app.use(express.json());
  const mockAuth = (req, res, next) => {
    const uid = Number(req.headers['x-test-user'] || 0);
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { id: uid, is_admin: uid === 1 ? 1 : 0 };
    return next();
  };
  const mockAdmin = (req, res, next) => {
    if (!req.user?.is_admin) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
  app.use('/api', createScreensRouter({ pool, authMiddleware: mockAuth, adminMiddleware: mockAdmin }));
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

// ── Q1: F-05 cụm nhiều từ & cuộn chỉ trong thẻ đoạn văn ─────────────────────
test('Q1: F-05 so khớp cụm nhiều từ dài nhất trước & CSS chỉ cuộn trong thẻ đoạn văn', () => {
  const lesson = {
    reading: {
      passage: 'Good morning! Good morning everyone.\nI like ice cream and green tea after morning walk.',
      highlights: ['morning', 'good morning', 'ice cream', 'green tea', 'walk'],
    },
  };
  assert.equal(canRunF05(lesson).ok, true);
  const valid = extractValidHighlights(lesson);
  assert.ok(valid.length >= 4);

  const { lines, targets } = buildFogPassageLines(lesson.reading.passage, valid);
  assert.equal(lines.length, 2);
  // Phải tách đúng cụm dài hơn "good morning" trước "morning"
  const phrases = targets.map((t) => t.key);
  assert.ok(phrases.includes('good morning'));
  assert.ok(phrases.includes('ice cream'));
  assert.ok(phrases.includes('green tea'));

  // Kiểm tra CSS F-05 có vùng cuộn riêng .ff-f05-passage
  const css = fs.readFileSync(
    path.join(ROOT, 'src/features/lesson/screens/friendly/friendly.css'),
    'utf8',
  );
  assert.match(css, /\.ff-f05-passage\s*\{[^}]*overflow-y:\s*auto/s);
});

// ── Q2: F-02 bàn phím chữ luôn đủ chữ cái + đúng số lần chữ trùng ───────────
test('Q2: F-02 bàn phím chữ đủ chữ & đúng số lần lặp; Mới học hiện sẵn chữ đầu; 2 sai bật gợi ý', () => {
  assert.equal(isSingleSpellableWord('apple'), true);
  assert.equal(isSingleSpellableWord('ice cream'), false);
  assert.equal(isSingleSpellableWord('go'), false);
  assert.equal(isSingleSpellableWord('extraordinary'), false);

  for (const word of ['apple', 'banana', 'letter', 'balloon', 'coffee', 'school']) {
    const bank = buildLetterBank(word, createRng(42));
    assert.ok(bank.length >= 8, `${word} phải có ít nhất 8 phím`);
    // Đếm đúng số lần mỗi chữ cái trong từ gốc
    const expected = {};
    for (const ch of word.toLowerCase()) expected[ch] = (expected[ch] || 0) + 1;
    const actual = {};
    for (const k of bank) actual[k.char] = (actual[k.char] || 0) + 1;
    for (const [ch, cnt] of Object.entries(expected)) {
      assert.ok((actual[ch] || 0) >= cnt, `Từ "${word}" thiếu chữ "${ch}" (cần ${cnt}, có ${actual[ch] || 0})`);
    }
  }

  // Nhóm Mới học hiện sẵn chữ đầu; Trung bình để trống
  const bankApple = buildLetterBank('apple', createRng(11));
  const turnBeg = initSpellTurn('apple', bankApple, 'beginner');
  assert.equal(turnBeg.filledKeyIds.length, 1);
  assert.equal(bankApple.find((k) => k.id === turnBeg.filledKeyIds[0])?.char, 'a');

  const turnInt = initSpellTurn('apple', bankApple, 'intermediate');
  assert.equal(turnInt.filledKeyIds.length, 0);

  // Chạm sai 2 lần cùng ô → bật hintChar = 'a'
  const wrongKey = bankApple.find((k) => k.char !== 'a');
  const r1 = pickSpellKey(turnInt, wrongKey);
  assert.equal(r1.outcome, 'wrong');
  assert.equal(r1.turn.hadWrong, true);
  assert.equal(r1.turn.hintChar, null);

  const r2 = pickSpellKey(r1.turn, wrongKey);
  assert.equal(r2.outcome, 'wrong');
  assert.equal(r2.turn.hintChar, 'a');

  // Chạm đúng chữ 'a' → lên ô 0, tắt hint
  const rightKey = bankApple.find((k) => k.char === 'a');
  const r3 = pickSpellKey(r2.turn, rightKey);
  assert.equal(r3.outcome, 'correct');
  assert.equal(r3.turn.filledKeyIds.length, 1);
  assert.equal(r3.turn.hintChar, null);
});

// ── Q3: F-04 không mic / từ chối mic vẫn qua, KHÔNG ghi skillsHit.speak ─────
test('Q3: F-04 logic chấm điểm theo nhóm, không mic không ghi skillsHit.speak & nút mic chỉ hiện khi bị chặn', () => {
  // Không có mic / bị từ chối
  assert.deepEqual(evaluateSpeakAttempt({ group: 'intermediate', score: 0, micUsed: false }), {
    passed: true,
    recordSkillHit: false,
  });
  assert.deepEqual(evaluateSpeakAttempt({ group: 'exam', score: 0, micUsed: false }), {
    passed: true,
    recordSkillHit: false,
  });

  // Mới học: không chấm điểm — nói qua mic đều qua
  assert.deepEqual(evaluateSpeakAttempt({ group: 'beginner', score: 10, micUsed: true }), {
    passed: true,
    recordSkillHit: true,
  });

  // Trung bình: >= 50%
  assert.deepEqual(evaluateSpeakAttempt({ group: 'intermediate', score: 49, micUsed: true }), {
    passed: false,
    recordSkillHit: false,
  });
  assert.deepEqual(evaluateSpeakAttempt({ group: 'intermediate', score: 50, micUsed: true }), {
    passed: true,
    recordSkillHit: true,
  });

  // Luyện thi: >= 70%
  assert.deepEqual(evaluateSpeakAttempt({ group: 'exam', score: 69, micUsed: true }), {
    passed: false,
    recordSkillHit: false,
  });
  assert.deepEqual(evaluateSpeakAttempt({ group: 'exam', score: 70, micUsed: true }), {
    passed: true,
    recordSkillHit: true,
  });

  // Chỉ hiện nút mic khi trình duyệt chặn tự mở mic
  assert.equal(shouldShowManualMicButton('countdown'), false);
  assert.equal(shouldShowManualMicButton('listening'), false);
  assert.equal(shouldShowManualMicButton('blocked'), true);
});

// ── Q7: screen_stat_daily không có user_id, sandbox không ghi, cờ cảnh báo ──
test('Q7: Thống kê ẩn danh không có cột user_id, sandbox bỏ qua, ngưỡng 30 lượt & cờ cảnh báo', async () => {
  // 1. Kiểm định nghĩa bảng screen_stat_daily trong SQL không có cột user_id
  const sql = fs.readFileSync(
    path.join(ROOT, 'server/db/migrate-screen-system-p4a.sql'),
    'utf8',
  );
  const ddlMatch = sql.match(/CREATE TABLE IF NOT EXISTS screen_stat_daily\s*\([\s\S]*?\);/i);
  assert.ok(ddlMatch, 'Thiếu DDL CREATE TABLE screen_stat_daily');
  assert.doesNotMatch(ddlMatch[0], /\buser_id\b/i);

  // 2. Kiểm ScreenHost chặn gửi thống kê khi sandbox
  const hostSrc = fs.readFileSync(
    path.join(ROOT, 'src/features/lesson/screens/ScreenHost.jsx'),
    'utf8',
  );
  assert.match(hostSrc, /if\s*\(\s*sandbox\s*\|\|/);

  // 3. Kiểm pure metrics: < 30 lượt → enoughData=false, flags=[]
  const small = computeStatMetrics({
    starts: 29, completes: 10, quits: 19, items: 100, firstTry: 20, sumMs: 29 * 200000,
  });
  assert.equal(small.enoughData, false);
  assert.deepEqual(small.flags, []);

  // >= 30 lượt: đủ 4 cờ (<80% hoàn thành, <50% hoặc >97% đúng L1, >120s)
  const hardSlow = computeStatMetrics({
    starts: 30, completes: 20, quits: 10, items: 180, firstTry: 72, sumMs: 30 * 135000,
  });
  assert.equal(hardSlow.enoughData, true);
  const hardIds = hardSlow.flags.map((f) => f.id);
  assert.ok(hardIds.includes('low_completion'));
  assert.ok(hardIds.includes('too_hard'));
  assert.ok(hardIds.includes('too_slow'));

  const tooEasy = computeStatMetrics({
    starts: 40, completes: 40, quits: 0, items: 200, firstTry: 198, sumMs: 40 * 35000,
  });
  assert.deepEqual(tooEasy.flags.map((f) => f.id), ['too_easy']);

  // 4. Kiểm API POST /api/screen-stats & GET /api/admin/screen-stats
  const pool = createStatsMockPool();
  const srv = await startTestServer(pool);
  try {
    // Gửi khi sandbox = true → KHÔNG ghi
    const rSb = await fetch(`${srv.baseUrl}/api/screen-stats`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user': '2' },
      body: JSON.stringify({ code: 'F-02', group: 'intermediate', outcome: 'done', items: 6, firstTryCorrect: 5, durationMs: 42000, sandbox: true }),
    });
    assert.equal(rSb.status, 200);
    assert.equal(pool.daily.size, 0);

    // Gửi 30 lượt thật cho F-02 (25 done, 5 quit) và 5 lượt cho T-08
    for (let i = 0; i < 25; i++) {
      await fetch(`${srv.baseUrl}/api/screen-stats`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-test-user': '2' },
        body: JSON.stringify({ code: 'F-02', group: 'intermediate', outcome: 'done', items: 6, firstTryCorrect: 4, durationMs: 45000 }),
      });
    }
    for (let i = 0; i < 5; i++) {
      await fetch(`${srv.baseUrl}/api/screen-stats`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-test-user': '2' },
        body: JSON.stringify({ code: 'F-02', group: 'intermediate', outcome: 'quit', items: 0, firstTryCorrect: 0, durationMs: 12000 }),
      });
    }

    // User thường không được xem GET /api/admin/screen-stats
    const r403 = await fetch(`${srv.baseUrl}/api/admin/screen-stats?days=7`, {
      headers: { 'x-test-user': '2' },
    });
    assert.equal(r403.status, 403);

    // Admin xem được thống kê tổng hợp + so sánh slot
    const rAdmin = await fetch(`${srv.baseUrl}/api/admin/screen-stats?days=7&group=intermediate`, {
      headers: { 'x-test-user': '1' },
    });
    assert.equal(rAdmin.status, 200);
    const data = await rAdmin.json();
    const f02 = data.byCode.find((x) => x.code === 'F-02');
    assert.ok(f02);
    assert.equal(f02.starts, 30);
    assert.equal(f02.completes, 25);
    assert.equal(f02.quits, 5);
    assert.equal(f02.enoughData, true);
    const writeSlot = data.comparison.find((x) => x.slot === 'write');
    assert.equal(writeSlot.friendly.starts, 30);
  } finally {
    await srv.close();
  }
});

// ── Kịch bản tên màn & 36 câu dẫn nháp Đợt 4a ───────────────────────────────
test('Kịch bản tên màn theo vùng (screen-scenarios.js) & 36 câu dẫn draft Đợt 4a hợp chuẩn', () => {
  // Kịch bản tên màn
  assert.equal(getScreenTitle('F-02', 'BD'), 'Ghép chữ lên đò');
  assert.equal(getScreenTitle('F-02', 'TG'), 'Ghép chữ đón gió');
  assert.equal(getScreenTitle('F-02', null), 'Ghép chính tả');
  assert.equal(getScreenTitle('F-04', 'VS'), 'Gọi pet vượt suối');
  assert.equal(getScreenTitle('F-05', 'BD'), 'Săn chữ trong sương');
  assert.ok(Object.keys(SCREEN_SCENARIOS).includes('F-02'));
  assert.ok(Object.keys(SCREEN_SCENARIOS).includes('F-04'));
  assert.ok(Object.keys(SCREEN_SCENARIOS).includes('F-05'));

  // 36 câu dẫn draft Đợt 4a
  assert.equal(P4A_SEED_INTROS.length, P4A_INTRO_CODES.length * P4A_INTRO_REGIONS.length * 4);
  assert.equal(P4A_SEED_INTROS.length, 36);
  const banned = /\b(gem|tiền|mua|ngu|kém|dốt)\b/i;
  for (const row of P4A_SEED_INTROS) {
    assert.equal(row.status, 'draft');
    const words = row.textVi.trim().split(/\s+/).length;
    assert.ok(words <= 25, `${row.id} vượt 25 chữ (${words} chữ): ${row.textVi}`);
    assert.doesNotMatch(row.textVi, banned, `${row.id} chứa từ cấm`);
  }
});
