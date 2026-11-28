import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createScreensRouter } from '../routes/screens.js';
import { P3_SEED_INTROS, P3_INTRO_CODES, P3_INTRO_REGIONS } from '../db/seed-screen-intros-p3.js';
import { seedDefaultScreenIntros } from '../utils/screen-config-manager.js';
import {
  createQueueState,
  advanceQueueState,
  summarizeQueueState,
  evaluateBoatTile,
  applyBossDamage,
  evaluateBossOutcome,
} from '../../src/features/lesson/screens/friendly/friendlyLogic.js';
import {
  createMemoryDeck,
  initMemoryState,
  flipMemoryCard,
  clearMemoryMismatch,
  summarizeMemoryState,
} from '../../src/features/lesson/screens/friendly/f08Logic.js';
import { selectScreenIntro, interpolateIntro } from '../../src/features/lesson/screens/introSelector.js';
import { pickGuestWords } from '../../src/features/lesson/screens/guestWords.js';
import { mixLesson } from '../../src/features/lesson/screens/mixer.js';
import { SCREEN_CATALOG } from '../../src/features/lesson/screens/catalog.js';
import { SCREEN_CONFIG } from '../../src/data/config/screens.js';
import { mulberry32 } from '../../src/features/lesson/screens/seededRandom.js';
import { ALL_LESSONS } from '../../src/data/lessons/index.js';
import { validateLesson } from '../../src/data/lessons/schema.js';
import { REGIONS, getUnitRegion } from '../../shared/regions.js';
import { isValidNpc } from '../../shared/human-cast.js';
import { emptyProgress, applyEncounter } from '../../src/features/vocab/wordProgress.js';

// ── P1: Hàng đợi item màn Thân thiện — sai quay lại sau 2–4 slot, tối đa 1 lần ──
test('P1: Hàng đợi item sai quay lại sau 2–4 vị trí, tối đa 1 lần, không có trạng thái thua', () => {
  const items = Array.from({ length: 6 }, (_, i) => ({ word: `w${i}`, isGuest: i === 5 }));
  let st = createQueueState(items);
  const rng = mulberry32(123);

  // Sai item 0 ở lượt đầu → phải được chèn lại sau 2–4 vị trí
  st = advanceQueueState(st, { correct: false, rng });
  assert.equal(st.queue.length, 7);
  const retryPos = st.queue.findIndex((e, idx) => idx > 0 && e.originIndex === 0);
  assert.ok(retryPos >= 3 && retryPos <= 5, `retryPos=${retryPos} phải nằm sau 2–4 item`);
  assert.equal(st.queue[retryPos].retried, true);

  // Chạy tới hết; cho item 0 sai lần nữa ở lượt retry → KHÔNG được chèn thêm lần 2
  while (!st.done) {
    const cur = st.queue[st.cursor];
    const ok = cur.originIndex !== 0;
    st = advanceQueueState(st, { correct: ok, rng });
  }
  assert.equal(st.done, true);
  assert.equal(st.queue.filter((e) => e.originIndex === 0).length, 2);

  const sum = summarizeQueueState(st);
  assert.equal(sum.total, 5);           // 5 từ bài (trừ 1 khách quen)
  assert.equal(sum.firstTryCorrect, 4); // w0 sai lần đầu
  assert.equal(sum.guestTotal, 1);
  assert.equal(sum.guestCorrect, 1);
});

// ── P2: firstTry của F-08 theo đúng định nghĩa (chuỗi lật giả) ──
test('P2: F-08 firstTry đúng định nghĩa — chỉ mất firstTry khi sai sau lúc đã thấy cả 2 thẻ của cặp', () => {
  const pairs = [
    { pairId: 'p1', wordId: 'apple', word: 'apple', meaning: 'táo', isGuest: false },
    { pairId: 'p2', wordId: 'milk', word: 'milk', meaning: 'sữa', isGuest: false },
    { pairId: 'p3', wordId: 'cat', word: 'cat', meaning: 'mèo', isGuest: true },
  ];
  const deck = createMemoryDeck(pairs, mulberry32(7));
  let st = initMemoryState(deck);

  // Lượt 1: lật p1:en rồi p2:vi (sai lần khám phá đầu — chưa từng thấy cả 2 thẻ p1 hay p2)
  st = flipMemoryCard(st, 'p1:en').state;
  st = flipMemoryCard(st, 'p2:vi').state;
  assert.equal(st.wrongFlips, 1);
  st = clearMemoryMismatch(st);

  // Lượt 2: lật p3:en rồi p1:vi (p1:vi vừa xuất hiện ở thẻ 2 nên người học mới thấy đủ cặp p1 lần đầu → KHÔNG mất firstTry)
  st = flipMemoryCard(st, 'p3:en').state;
  st = flipMemoryCard(st, 'p1:vi').state;
  assert.equal(st.wrongFlips, 2);
  assert.equal(st.consecutiveWrong, 2);
  st = clearMemoryMismatch(st);

  // Lượt 3: ghép đúng p1 ngay sau lần đầu đã thấy cả 2 thẻ → p1 ĐƯỢC tính firstTry = true!
  st = flipMemoryCard(st, 'p1:en').state;
  const rP1 = flipMemoryCard(st, 'p1:vi');
  st = rP1.state;
  assert.equal(rP1.outcome, 'match');
  assert.equal(rP1.isFirstTry, true);
  assert.equal(st.consecutiveWrong, 0);

  // Lượt 4: lật p2:en (đã thấy p2:vi từ lượt 1!) nhưng lại chọn sai p3:en → p2 MẤT firstTry!
  st = flipMemoryCard(st, 'p2:en').state;
  st = flipMemoryCard(st, 'p3:en').state;
  st = clearMemoryMismatch(st);

  // Lượt 5: ghép p2 → firstTry = false
  st = flipMemoryCard(st, 'p2:en').state;
  const rP2 = flipMemoryCard(st, 'p2:vi');
  st = rP2.state;
  assert.equal(rP2.outcome, 'match');
  assert.equal(rP2.isFirstTry, false);

  // Lượt 6: ghép p3 (guest) ngay → firstTry = true, tính riêng ở guestCorrect
  st = flipMemoryCard(st, 'p3:en').state;
  const rP3 = flipMemoryCard(st, 'p3:vi');
  st = rP3.state;
  assert.equal(rP3.isFirstTry, true);

  const summary = summarizeMemoryState(st);
  assert.deepEqual(summary, {
    total: 2,
    firstTryCorrect: 1,
    guestTotal: 1,
    guestCorrect: 1,
  });
});

// ── P3: F-09 đặt sai 1 thẻ → câu tính sai lần đầu, vẫn hoàn thành được ──
test('P3: F-09 đặt sai 1 thẻ làm câu mất firstTry nhưng vẫn hoàn thành khi xếp đúng hết', () => {
  const words = ['I', 'like', 'warm', 'milk'];
  let hadWrong = false;

  // Đặt sai từ đầu tiên
  const step1Bad = evaluateBoatTile({ expectedWords: words, filledCount: 0, tileWord: 'milk', hadWrong });
  assert.equal(step1Bad.isRight, false);
  assert.equal(step1Bad.hadWrong, true);
  assert.equal(step1Bad.completed, false);
  hadWrong = step1Bad.hadWrong;

  // Sau đó đặt đúng cả 4 từ
  let lastRes = null;
  for (let i = 0; i < words.length; i++) {
    lastRes = evaluateBoatTile({ expectedWords: words, filledCount: i, tileWord: words[i], hadWrong });
    assert.equal(lastRes.isRight, true);
    hadWrong = lastRes.hadWrong;
  }
  assert.equal(lastRes.completed, true);
  assert.equal(lastRes.firstTry, false);

  // Câu không sai lần nào → firstTry = true
  let cleanRes = null;
  for (let i = 0; i < words.length; i++) {
    cleanRes = evaluateBoatTile({ expectedWords: words, filledCount: i, tileWord: words[i], hadWrong: false });
  }
  assert.equal(cleanRes.completed, true);
  assert.equal(cleanRes.firstTry, true);
});

// ── P4: F-06 pet HP không bao giờ < 10%; đạt/chưa đạt khớp lessonPassRate ──
test('P4: F-06 pet HP tối thiểu 10% dù sai liên tục; Boss tan biến/bỏ chạy/ở lại đúng ngưỡng', () => {
  let petHp = 100;
  let bossHp = 100;
  for (let i = 0; i < 20; i++) {
    const next = applyBossDamage({ petHp, bossHp, isCorrect: false, totalQuestions: 10 });
    petHp = next.petHp;
    bossHp = next.bossHp;
    assert.ok(petHp >= 10, `petHp=${petHp} bị tụt dưới 10%`);
  }
  assert.equal(petHp, 10);

  assert.equal(evaluateBossOutcome({ score: 10, total: 10, passRate: 0.7 }).bossState, 'dissolve');
  assert.equal(evaluateBossOutcome({ score: 8, total: 10, passRate: 0.7 }).bossState, 'flee');
  assert.equal(evaluateBossOutcome({ score: 6, total: 10, passRate: 0.7 }).passed, false);
  assert.equal(evaluateBossOutcome({ score: 6, total: 10, passRate: 0.7 }).bossState, 'remain');
});

// ── P5: Chọn câu dẫn không lặp trong 10 ải gần nhất ──
test('P5: Chọn câu dẫn — không lặp lại trong cửa sổ tối đa theo số câu (4 câu đầu khác nhau, 11 ải xoay vòng công bằng)', () => {
  // Kho 10 câu approved cho BD + 2 câu '*' → 10 ải liên tiếp hoàn toàn không trùng câu nào!
  const intros10 = Array.from({ length: 10 }, (_, i) => ({
    id: `DN-F03-BD-${String(i + 1).padStart(2, '0')}`,
    screen_code: 'F-03',
    region: 'BD',
    text_vi: `Câu dẫn số ${i + 1} ở {region}.`,
    status: 'approved',
  }));
  const recent = [];
  const pickedIds = [];
  for (let attempt = 1; attempt <= 11; attempt++) {
    const res = selectScreenIntro({
      intros: intros10,
      screenCode: 'F-03',
      region: 'BD',
      recentIntros: recent,
      vars: { region: 'Bến Đò Ông Tư' },
      seed: attempt * 17,
    });
    assert.ok(res);
    assert.ok(res.text.includes('Bến Đò Ông Tư'));
    pickedIds.push(res.id);
    recent.push({ lessonAttemptAt: `2026-11-${String(attempt).padStart(2, '0')}`, ids: [res.id] });
  }
  // 10 ải đầu: 10 câu hoàn toàn khác nhau
  assert.equal(new Set(pickedIds.slice(0, 10)).size, 10);
  // Ải 11: lấy lại câu dùng lâu nhất (câu của ải 1)
  assert.equal(pickedIds[10], pickedIds[0]);

  // Thiếu biến bắt buộc → bỏ câu đó
  assert.equal(interpolateIntro('Chào {npc} ở {region}', { region: 'BD' }), null);
});

// ── P6: Khách quen ≤ 30%, không lấy known, bài đầu tiên rỗng ──
test('P6: Khách quen ≤ 30% item, ưu tiên review, không lấy known, bài đầu tiên trả rỗng', () => {
  const rules = { knownAtPoints: 4 };
  const l1 = {
    id: 'l1',
    vocabulary: [
      { word: 'knownWord', meaning: 'đã thuộc' },
      { word: 'reviewWord', meaning: 'cần ôn' },
      { word: 'learnOld', meaning: 'đang nhớ cũ' },
      { word: 'learnNew', meaning: 'đang nhớ mới' },
      { word: 'newWord', meaning: 'từ mới' },
    ],
  };
  const l2 = { id: 'l2', vocabulary: [{ word: 'currentWord', meaning: 'hiện tại' }] };

  // Bài đầu tiên (completedLessons rỗng) → rỗng
  assert.deepEqual(
    pickGuestWords({ currentLesson: l2, allLessons: [l1, l2], completedLessons: [], wordProgress: {}, rules }),
    [],
  );

  const wp = {
    knownword: { ...emptyProgress(), points: 4, lastSeenAt: '2026-11-01T00:00:00Z' },
    reviewword: { ...emptyProgress(), points: 0, wrongPending: true, lastSeenAt: '2026-11-20T00:00:00Z' },
    learnold: applyEncounter(undefined, new Set(), 'learnold', rules, '2026-11-02T00:00:00Z'),
    learnnew: applyEncounter(undefined, new Set(), 'learnnew', rules, '2026-11-25T00:00:00Z'),
  };

  const picked = pickGuestWords({
    currentLesson: l2,
    allLessons: [l1, l2],
    completedLessons: ['l1'],
    wordProgress: wp,
    rules,
    screenItemCount: 8, // 30% of 8 = 2
    maxGuests: 3,
  });

  assert.equal(picked.length, 2); // ≤ 30% của 8
  assert.equal(picked[0].word, 'reviewWord'); // ưu tiên review
  assert.equal(picked[1].word, 'learnOld');   // rồi lastSeenAt cũ nhất
  assert.ok(picked.every((w) => w.word !== 'knownWord' && w.word !== 'newWord'));
});

// ── P8: Tài khoản thường không gặp màn F ('test'); tài khoản thử gặp ──
test('P8: Tài khoản thường không bao giờ trộn ra màn F (status=test); tài khoản thử có gặp màn F', () => {
  const greetings = ALL_LESSONS.find((l) => l.id === 'greetings');
  assert.ok(greetings);

  for (let seed = 1; seed <= 40; seed++) {
    const mNormal = mixLesson({ lesson: greetings, group: 'intermediate', config: SCREEN_CONFIG, isTester: false, seed });
    assert.ok(mNormal.screens.every((s) => !s.code.startsWith('F-')), `seed=${seed} user thường bị dính màn F!`);
  }

  let sawFriendlyForTester = false;
  for (let seed = 1; seed <= 40; seed++) {
    const mTester = mixLesson({ lesson: greetings, group: 'intermediate', config: SCREEN_CONFIG, isTester: true, seed });
    if (mTester.screens.some((s) => s.code.startsWith('F-'))) {
      sawFriendlyForTester = true;
      break;
    }
  }
  assert.equal(sawFriendlyForTester, true);
});

// ── Kiểm dữ liệu 156 câu dẫn bản nháp & 12 bài story int-u1..u3 ──
test('Seed 156 câu dẫn draft + 12 bài int-u1..u3 có story hợp lệ theo Story Bible & isValidNpc', () => {
  // 13 mã × 3 vùng × 4 câu = 156
  assert.equal(P3_SEED_INTROS.length, 156);
  const banned = /thảo nguyên gió|cô ba|bác bảy|\bgem\b|tiền mặt|đô la/i;
  for (const row of P3_SEED_INTROS) {
    assert.equal(row.status, 'draft');
    assert.ok(P3_INTRO_CODES.includes(row.screenCode));
    assert.ok(P3_INTRO_REGIONS.includes(row.region));
    const wc = row.textVi.trim().split(/\s+/).length;
    assert.ok(wc <= 25, `${row.id} dài ${wc} chữ (> 25)`);
    assert.ok(!banned.test(row.textVi), `${row.id} chứa từ cấm: ${row.textVi}`);
  }
  // Đảm bảo không trùng ID
  assert.equal(new Set(P3_SEED_INTROS.map((r) => r.id)).size, 156);

  // 12 bài int-u1..u3 đều có story.npc hợp lệ theo vùng và introVi ≤ 30 chữ
  const target12 = [
    ['greetings', 'int-u1'], ['family', 'int-u1'], ['colors', 'int-u1'], ['numbers', 'int-u1'],
    ['school', 'int-u2'], ['weather', 'int-u2'], ['jobs', 'int-u2'], ['body', 'int-u2'],
    ['clothing', 'int-u3'], ['house', 'int-u3'], ['emotions', 'int-u3'], ['hobbies', 'int-u3'],
  ];
  for (const [lid, uid] of target12) {
    const lesson = ALL_LESSONS.find((l) => l.id === lid);
    assert.ok(lesson, `Thiếu bài ${lid}`);
    assert.ok(lesson.story, `Bài ${lid} thiếu story`);
    const reg = getUnitRegion(uid);
    const speakerId = lesson.story.dialogue?.speaker_id || lesson.story.npc;
    const introVi = lesson.story.intro_vi ?? lesson.story.introVi;
    assert.equal(isValidNpc(speakerId, reg, REGIONS), true, `NPC ${speakerId} không hợp lệ ở vùng ${reg}`);
    assert.ok(lesson.story.dialogue?.text_en, `Bài ${lid} thiếu dialogue.text_en`);
    const wc = introVi.trim().split(/\s+/).length;
    assert.ok(wc <= 30, `story.intro_vi bài ${lid} dài ${wc} chữ (> 30)`);
    const vRes = validateLesson(lesson);
    assert.equal(vRes.errors.length, 0, `Bài ${lid} lỗi schema: ${vRes.errors.join('; ')}`);
  }
});

// ── Kiểm coverage 5 màn F trên 39 bài nhóm Trung bình ≥ 50% (Đợt 3 Bước 0) ──
test('Coverage 5 màn F (F-01, F-03, F-06, F-08, F-09) trên nhóm Trung bình đạt 100%', () => {
  const intLessons = ALL_LESSONS.filter((l) => l.unit && l.unit.startsWith('int-u'));
  assert.equal(intLessons.length, 39);
  for (const code of ['F-01', 'F-03', 'F-06', 'F-08', 'F-09']) {
    const meta = SCREEN_CATALOG.find((s) => s.code === code);
    assert.ok(meta, `Thiếu ${code} trong SCREEN_CATALOG`);
    const okCount = intLessons.filter((l) => meta.canRun(l).ok).length;
    assert.equal(okCount, 39, `${code} chỉ chạy được ${okCount}/39 bài Trung bình`);
  }
});

// ── API Kho dẫn nhập (/api/screen-intros + /api/admin/screen-intros + batch approve + ETag) ──
test('API screen_intro: seed 156 draft → duyệt hàng loạt → GET /api/screen-intros?region=BD + ETag 304', async () => {
  const state = {
    users: [{ id: 1, name: 'Admin Sonny', email: 'admin@cowdi.net', is_admin: 1 }],
    screen_intro: new Map(),
    screen_config_log: [],
    tick: Date.parse('2026-11-27T16:00:00.000Z'),
  };
  const nextNow = () => new Date(state.tick += 1000);

  const execSql = async (sql, params = []) => {
    const q = sql.replace(/\s+/g, ' ').trim();
    if (/^CREATE TABLE/i.test(q)) return [{ affectedRows: 0 }];
    if (/^INSERT IGNORE INTO screen_config/i.test(q)) return [{ affectedRows: 1 }];
    if (/^INSERT IGNORE INTO screen_weights/i.test(q)) return [{ affectedRows: 1 }];
    if (/^INSERT IGNORE INTO screen_intro/i.test(q)) {
      const [id, screen_code, region, text_vi] = params;
      if (!state.screen_intro.has(id)) {
        state.screen_intro.set(id, { id, screen_code, region, text_vi, audio_url: null, status: 'draft', updated_by: null, updated_at: nextNow() });
      }
      return [{ affectedRows: 1 }];
    }
    if (/^SELECT id, screen_code, region, text_vi, audio_url, status, updated_at FROM screen_intro WHERE status = 'approved'/i.test(q)) {
      const reg = params[0];
      const rows = [...state.screen_intro.values()].filter((r) => r.status === 'approved' && (r.region === reg || r.region === '*'));
      return [rows];
    }
    if (/^SELECT si\.id, si\.screen_code/i.test(q)) {
      return [[...state.screen_intro.values()].map((r) => ({ ...r, updated_by_name: 'Admin Sonny', updated_by_email: 'admin@cowdi.net' }))];
    }
    if (/^SELECT screen_code, region, SUM/i.test(q)) {
      const groups = new Map();
      for (const r of state.screen_intro.values()) {
        const k = `${r.screen_code}:${r.region}`;
        const cur = groups.get(k) || { screen_code: r.screen_code, region: r.region, approved_cnt: 0, total_cnt: 0 };
        cur.total_cnt += 1;
        if (r.status === 'approved') cur.approved_cnt += 1;
        groups.set(k, cur);
      }
      return [[...groups.values()]];
    }
    if (/^UPDATE screen_intro SET status = \?, updated_by = \?, updated_at = NOW\(\) WHERE id IN/i.test(q)) {
      const [status, adminId, ...ids] = params;
      let n = 0;
      for (const id of ids) {
        const row = state.screen_intro.get(id);
        if (row) {
          row.status = status;
          row.updated_by = adminId;
          row.updated_at = nextNow();
          n += 1;
        }
      }
      return [{ affectedRows: n }];
    }
    if (/^INSERT INTO screen_config_log/i.test(q)) {
      state.screen_config_log.push({ id: state.screen_config_log.length + 1, target: params[0], new_value: params[2] });
      return [{ insertId: state.screen_config_log.length }];
    }
    throw new Error(`Unhandled SQL in P3 test: ${q}`);
  };

  const conn = { execute: execSql, query: execSql, beginTransaction: async () => {}, commit: async () => {}, rollback: async () => {}, release: () => {} };
  const mockPool = { execute: execSql, query: execSql, getConnection: async () => conn };

  await seedDefaultScreenIntros(mockPool);
  assert.equal(state.screen_intro.size, 156);

  const app = express();
  app.use(express.json());
  app.use('/api', createScreensRouter({
    pool: mockPool,
    authMiddleware: (req, _res, next) => { req.user = { id: 1 }; next(); },
    adminMiddleware: (_req, _res, next) => next(),
  }));

  const srv = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${srv.address().port}`;
  try {
    // Trước khi duyệt: client GET /api/screen-intros?region=BD trả 0 câu
    const r0 = await fetch(`${baseUrl}/api/screen-intros?region=BD`);
    assert.equal(r0.status, 200);
    assert.equal((await r0.json()).items.length, 0);

    // Admin duyệt hàng loạt 4 câu F-03 của BD
    const rBatch = await fetch(`${baseUrl}/api/admin/screen-intros/batch-status`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ids: ['DN-F03-BD-01', 'DN-F03-BD-02', 'DN-F03-BD-03', 'DN-F03-BD-04'],
        status: 'approved',
      }),
    });
    assert.equal(rBatch.status, 200);
    assert.equal((await rBatch.json()).updated, 4);

    // Client GET lại → nhận đúng 4 câu approved + ETag → 304 khi lặp
    const r1 = await fetch(`${baseUrl}/api/screen-intros?region=BD`);
    assert.equal(r1.status, 200);
    const etag = r1.headers.get('etag');
    const data1 = await r1.json();
    assert.equal(data1.items.length, 4);

    const r304 = await fetch(`${baseUrl}/api/screen-intros?region=BD`, {
      headers: { 'if-none-match': etag },
    });
    assert.equal(r304.status, 304);
  } finally {
    await new Promise((resolve) => srv.close(resolve));
  }
});
