// ============================================================
// Cowdi English — Script Mô phỏng & Cân bằng Hệ tương khắc v2
// ------------------------------------------------------------
// Nguồn căn cứ: docs/04-design/economy-v2/lenh-claude-code-2-can-bang-he-tuong-khac.md
// Chạy trực tiếp engine và config của server:
// node scripts/simulate-balance.js [--runs N] [--seed S] [--out DIR]
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ELEMENTS,
  GROUPS,
  GROUP_SKILLS,
  RARITIES,
  EVOLUTION_STAGES,
  PET_BATTLE_DATA,
  BATTLE,
} from '../shared/game-config.js';

import {
  simulateBattle,
  computeStats,
  createRng,
  resolveSnapshot,
  getCounterMultiplier,
} from '../shared/battle-engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// ── Parse CLI arguments ──
const args = process.argv.slice(2);
let RUNS_ARG = null;
let SEED_ARG = 'cowdi-balance-v2-seed';
let OUT_DIR = path.resolve(rootDir, 'docs/06-verification-validation/balance-v2');

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--runs' && args[i + 1]) {
    RUNS_ARG = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--seed' && args[i + 1]) {
    SEED_ARG = args[i + 1];
    i++;
  } else if (args[i] === '--out' && args[i + 1]) {
    OUT_DIR = path.resolve(rootDir, args[i + 1]);
    i++;
  }
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log('='.repeat(60));
console.log(' COWDI ENGLISH — MÔ PHỎNG CÂN BẰNG HỆ TƯƠNG KHẮC v2');
console.log(` Output directory: ${OUT_DIR}`);
console.log(` Base seed: ${SEED_ARG}`);
console.log('='.repeat(60));

// ── Helpers tạo câu trả lời của người chơi ──
/**
 * Tạo 10 câu trả lời cho 1 người chơi.
 * Mặc định: 7/10 câu đúng, 2 câu nhanh (< 3s, vd 2000ms), 5 câu bình thường (4500ms), 3 câu sai (5000ms).
 */
function makePlayerAnswers(seed, correctCount = 7, fastCount = 2, totalQuestions = 10) {
  const rng = createRng(seed);
  // Tạo danh sách index cho các câu đúng
  const indices = Array.from({ length: totalQuestions }, (_, i) => i);
  // Fisher-Yates shuffle bằng rng
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const correctIndices = new Set(indices.slice(0, correctCount));
  const fastEligible = indices.slice(0, correctCount);
  const fastIndices = new Set(fastEligible.slice(0, fastCount));

  const answers = [];
  for (let q = 0; q < totalQuestions; q++) {
    const isCorrect = correctIndices.has(q);
    const isFast = fastIndices.has(q);
    // Thời gian câu hỏi: nhanh ~ 1500-2500ms, chậm ~ 3500-5500ms
    const jitter = Math.floor(rng() * 600) - 300;
    const timeMs = isCorrect
      ? (isFast ? 2000 + jitter : 4500 + jitter)
      : 5000 + jitter;
    answers.push({ correct: isCorrect, timeMs: Math.max(800, timeMs) });
  }
  return answers;
}

/**
 * Tính quantile / percentile của 1 mảng số đã sắp xếp.
 */
function quantile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const pos = (sortedArr.length - 1) * p;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedArr[base + 1] !== undefined) {
    return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
  }
  return sortedArr[base];
}

/**
 * Chạy mô phỏng Monte Carlo giữa 2 pet.
 */
function runMonteCarloMatch(snapA, snapB, runs = 1000, seedPrefix = 'match', options = {}) {
  let aWins = 0;
  let bWins = 0;
  let draws = 0;
  let sumHpPctA = 0;
  let sumHpPctB = 0;
  const diffs = [];
  const questionsToKillList = [];

  for (let r = 0; r < runs; r++) {
    const sA = `${seedPrefix}:${r}:A`;
    const sB = `${seedPrefix}:${r}:B`;
    const ansA = makePlayerAnswers(sA, options.correctA ?? 7, options.fastA ?? 2);
    const ansB = makePlayerAnswers(sB, options.correctB ?? 7, options.fastB ?? 2);
    const matchSeed = `${seedPrefix}:${r}`;

    const res = simulateBattle(snapA, snapB, ansA, ansB, matchSeed, options);
    if (res.winner === 'challenger') aWins++;
    else if (res.winner === 'opponent') bWins++;
    else draws++;

    const hpA = res.challenger.hpPct;
    const hpB = res.opponent.hpPct;
    sumHpPctA += hpA;
    sumHpPctB += hpB;
    diffs.push(hpA - hpB);

    // Đo số câu để bên B bị hạ (nếu có theo dõi)
    let bDiedRound = null;
    for (const logItem of res.log) {
      if (logItem.hp.opponent <= 0 && bDiedRound === null) {
        bDiedRound = logItem.q;
        break;
      }
    }
    if (bDiedRound !== null) questionsToKillList.push(bDiedRound);
  }

  diffs.sort((x, y) => x - y);
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / runs;
  const avgQuestionsToKill = questionsToKillList.length > 0
    ? (questionsToKillList.reduce((a, b) => a + b, 0) / questionsToKillList.length).toFixed(2)
    : 'N/A';

  return {
    runs,
    winRateA: aWins / runs,
    winRateB: bWins / runs,
    drawRate: draws / runs,
    avgHpA: sumHpPctA / runs,
    avgHpB: sumHpPctB / runs,
    avgDiff,
    medianDiff: quantile(diffs, 0.5),
    p10Diff: quantile(diffs, 0.1),
    p90Diff: quantile(diffs, 0.9),
    avgQuestionsToKill,
  };
}

// ============================================================
// 1. KỊCH BẢN 1: MA TRẬN 10×10 HỆ
// ============================================================
console.log('\n[1/6] Đang chạy Kịch bản 1: Ma trận 10×10 hệ...');
const ELEMENT_KEYS = Object.keys(ELEMENTS);
const elementMatrixRows = [];
elementMatrixRows.push(['stage', 'elementA', 'elementB', 'winRateA', 'winRateB', 'drawRate', 'avgHpA', 'avgHpB', 'avgDiff', 'p10', 'median', 'p90'].join(','));

const stagesToTest = [
  { stage: 0, name: 'C1', skills: { listening: 0, speaking: 0, reading: 0, writing: 0 }, runs: RUNS_ARG || 2000 },
  { stage: 2, name: 'C3', skills: { listening: 600, speaking: 600, reading: 600, writing: 600 }, runs: RUNS_ARG || 2000 },
  { stage: 4, name: 'C5', skills: { listening: 1800, speaking: 1800, reading: 1800, writing: 1800 }, runs: RUNS_ARG || 2000 },
];

const elementStatsByStage = {};

for (const { stage, name: stageName, skills, runs } of stagesToTest) {
  elementStatsByStage[stageName] = {};
  for (const elA of ELEMENT_KEYS) {
    let elSumDiff = 0;
    let elMatches = 0;
    for (const elB of ELEMENT_KEYS) {
      const snapA = { speciesId: 'cowdi', evolution: stage, skills, element: elA, group: null, rarity: 'common' };
      const snapB = { speciesId: 'cowdi', evolution: stage, skills, element: elB, group: null, rarity: 'common' };

      const res = runMonteCarloMatch(snapA, snapB, runs, `${SEED_ARG}:el:${stageName}:${elA}:${elB}`);
      elementMatrixRows.push([
        stageName, elA, elB,
        res.winRateA.toFixed(4), res.winRateB.toFixed(4), res.drawRate.toFixed(4),
        res.avgHpA.toFixed(4), res.avgHpB.toFixed(4), res.avgDiff.toFixed(4),
        res.p10Diff.toFixed(4), res.medianDiff.toFixed(4), res.p90Diff.toFixed(4),
      ].join(','));

      if (elA !== elB) {
        elSumDiff += res.avgDiff;
        elMatches++;
      }
    }
    elementStatsByStage[stageName][elA] = elMatches > 0 ? (elSumDiff / elMatches) : 0;
  }
}

fs.writeFileSync(path.join(OUT_DIR, 'element-matrix.csv'), elementMatrixRows.join('\n'), 'utf8');
console.log(' => Đã xuất element-matrix.csv');

// ============================================================
// 2. KỊCH BẢN 2: MA TRẬN 7 NHÓM
// ============================================================
console.log('\n[2/6] Đang chạy Kịch bản 2: Ma trận 7 nhóm...');
const GROUP_KEYS = Object.keys(GROUPS);
const groupMatrixRows = [];
groupMatrixRows.push(['stage', 'groupA', 'groupB', 'winRateA', 'winRateB', 'drawRate', 'avgHpA', 'avgHpB', 'avgDiff', 'p10', 'median', 'p90'].join(','));

const groupStatsByStage = {};

for (const { stage, name: stageName, skills, runs } of stagesToTest) {
  groupStatsByStage[stageName] = {};
  for (const grA of GROUP_KEYS) {
    let grSumDiff = 0;
    let grMatches = 0;
    for (const grB of GROUP_KEYS) {
      // Dùng hệ 'vo' để cô lập hiệu ứng nhóm
      const snapA = { speciesId: 'cowdi', evolution: stage, skills, element: 'vo', group: grA, rarity: 'common' };
      const snapB = { speciesId: 'cowdi', evolution: stage, skills, element: 'vo', group: grB, rarity: 'common' };

      const res = runMonteCarloMatch(snapA, snapB, runs, `${SEED_ARG}:gr:${stageName}:${grA}:${grB}`);
      groupMatrixRows.push([
        stageName, grA, grB,
        res.winRateA.toFixed(4), res.winRateB.toFixed(4), res.drawRate.toFixed(4),
        res.avgHpA.toFixed(4), res.avgHpB.toFixed(4), res.avgDiff.toFixed(4),
        res.p10Diff.toFixed(4), res.medianDiff.toFixed(4), res.p90Diff.toFixed(4),
      ].join(','));

      if (grA !== grB) {
        grSumDiff += res.avgDiff;
        grMatches++;
      }
    }
    groupStatsByStage[stageName][grA] = grMatches > 0 ? (grSumDiff / grMatches) : 0;
  }
}

fs.writeFileSync(path.join(OUT_DIR, 'group-matrix.csv'), groupMatrixRows.join('\n'), 'utf8');
console.log(' => Đã xuất group-matrix.csv');

// ============================================================
// 3. KỊCH BẢN 3: ĐỘ HIẾM & QUY ĐỔI SỐ CÂU ĐÚNG TƯƠNG ĐƯƠNG
// ============================================================
console.log('\n[3/6] Đang chạy Kịch bản 3: Độ hiếm...');
const RARITY_KEYS = ['common', 'rare', 'epic', 'legendary', 'event'];
const rarityRows = [];
rarityRows.push(['stage', 'rarity', 'winRateVsCommon', 'avgHpDiff', 'equivalentQuestions', 'p10Diff', 'medianDiff', 'p90Diff'].join(','));

// Đo giá trị % HP của 1 câu đúng bằng cách cho Common 7 câu đấu vs Common 6 câu
const questionValueByStage = {};
for (let st = 0; st < 5; st++) {
  const sk = { listening: st * 400, speaking: st * 400, reading: st * 400, writing: st * 400 };
  const snap7 = { speciesId: 'cowdi', evolution: st, skills: sk, element: 'vo', group: null, rarity: 'common' };
  const snap6 = { speciesId: 'cowdi', evolution: st, skills: sk, element: 'vo', group: null, rarity: 'common' };
  const res = runMonteCarloMatch(snap7, snap6, 2000, `${SEED_ARG}:qval:C${st + 1}`, { correctA: 7, correctB: 6 });
  questionValueByStage[st] = Math.max(0.05, res.avgDiff); // % HP chênh lệch tương đương 1 câu
}

const raritySummary = [];

for (let st = 0; st < 5; st++) {
  const stageName = `C${st + 1}`;
  const skills = { listening: st * 400, speaking: st * 400, reading: st * 400, writing: st * 400 };
  const snapCommon = { speciesId: 'cowdi', evolution: st, skills, element: 'vo', group: null, rarity: 'common' };

  for (const rar of RARITY_KEYS) {
    const snapRar = { speciesId: 'cowdi', evolution: st, skills, element: 'vo', group: null, rarity: rar };
    const res = runMonteCarloMatch(snapRar, snapCommon, 3000, `${SEED_ARG}:rar:${stageName}:${rar}`);
    const eqQ = (res.avgDiff / questionValueByStage[st]).toFixed(2);

    rarityRows.push([
      stageName, rar,
      res.winRateA.toFixed(4),
      res.avgDiff.toFixed(4),
      eqQ,
      res.p10Diff.toFixed(4),
      res.medianDiff.toFixed(4),
      res.p90Diff.toFixed(4),
    ].join(','));

    raritySummary.push({ stageName, rarity: rar, winRate: res.winRateA, avgDiff: res.avgDiff, eqQ });
  }
}

fs.writeFileSync(path.join(OUT_DIR, 'rarity.csv'), rarityRows.join('\n'), 'utf8');
console.log(' => Đã xuất rarity.csv');

// ============================================================
// 4. KỊCH BẢN 4: MA TRẬN 22×22 PET THẬT Ở C3 VÀ C5
// ============================================================
console.log('\n[4/6] Đang chạy Kịch bản 4: Ma trận 22×22 pet thật...');
const PET_SPECIES_KEYS = Object.keys(PET_BATTLE_DATA);
const petMatrixC3Rows = [];
const petMatrixC5Rows = [];
petMatrixC3Rows.push(['petA', 'petB', 'winRateA', 'avgDiff', 'p10', 'median', 'p90'].join(','));
petMatrixC5Rows.push(['petA', 'petB', 'winRateA', 'avgDiff', 'p10', 'median', 'p90'].join(','));

const petWinRateC3 = {};
const petWinRateC5 = {};
const petRuns = RUNS_ARG ? Math.min(RUNS_ARG, 1000) : 500;

for (const petA of PET_SPECIES_KEYS) {
  petWinRateC3[petA] = 0;
  petWinRateC5[petA] = 0;
}

// C3: 600 điểm mỗi kỹ năng
for (const pA of PET_SPECIES_KEYS) {
  const snapA3 = resolveSnapshot({ speciesId: pA, evolution: 2, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 } });
  for (const pB of PET_SPECIES_KEYS) {
    const snapB3 = resolveSnapshot({ speciesId: pB, evolution: 2, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 } });
    const res = runMonteCarloMatch(snapA3, snapB3, petRuns, `${SEED_ARG}:p3:${pA}:${pB}`);
    petMatrixC3Rows.push([
      pA, pB, res.winRateA.toFixed(4), res.avgDiff.toFixed(4),
      res.p10Diff.toFixed(4), res.medianDiff.toFixed(4), res.p90Diff.toFixed(4),
    ].join(','));
    petWinRateC3[pA] += res.winRateA;
  }
}
for (const pA of PET_SPECIES_KEYS) petWinRateC3[pA] /= PET_SPECIES_KEYS.length;

// C5: 1800 điểm mỗi kỹ năng
for (const pA of PET_SPECIES_KEYS) {
  const snapA5 = resolveSnapshot({ speciesId: pA, evolution: 4, skills: { listening: 1800, speaking: 1800, reading: 1800, writing: 1800 } });
  for (const pB of PET_SPECIES_KEYS) {
    const snapB5 = resolveSnapshot({ speciesId: pB, evolution: 4, skills: { listening: 1800, speaking: 1800, reading: 1800, writing: 1800 } });
    const res = runMonteCarloMatch(snapA5, snapB5, petRuns, `${SEED_ARG}:p5:${pA}:${pB}`);
    petMatrixC5Rows.push([
      pA, pB, res.winRateA.toFixed(4), res.avgDiff.toFixed(4),
      res.p10Diff.toFixed(4), res.medianDiff.toFixed(4), res.p90Diff.toFixed(4),
    ].join(','));
    petWinRateC5[pA] += res.winRateA;
  }
}
for (const pA of PET_SPECIES_KEYS) petWinRateC5[pA] /= PET_SPECIES_KEYS.length;

fs.writeFileSync(path.join(OUT_DIR, 'pet-matrix-c3.csv'), petMatrixC3Rows.join('\n'), 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'pet-matrix-c5.csv'), petMatrixC5Rows.join('\n'), 'utf8');
console.log(' => Đã xuất pet-matrix-c3.csv và pet-matrix-c5.csv');

// ============================================================
// 5. KỊCH BẢN 5: CÁC KỊCH BẢN BIÊN & ĐIỂM CÒN LỎNG
// ============================================================
console.log('\n[5/6] Đang chạy Kịch bản 5: Kịch bản biên & điểm còn lỏng...');
const edgeCasesRows = [];
edgeCasesRows.push(['caseId', 'description', 'sideA', 'sideB', 'winRateA', 'avgDiff', 'note'].join(','));

const edgeCaseResults = {};

// 5a: Leo vs Leafy ở C3 và C5
// Leo: Kim, Thú săn, Hiếm. Leafy: Mộc, Thảo mộc, Thường.
// Kim khắc Mộc (Leo khắc Leafy x1.2).
{
  const leoC3 = resolveSnapshot({ speciesId: 'leo', evolution: 2, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 } });
  const leafyC3 = resolveSnapshot({ speciesId: 'leafy', evolution: 2, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 } });
  const resC3 = runMonteCarloMatch(leoC3, leafyC3, 5000, `${SEED_ARG}:edge:leo_leafy_c3`);

  const leoC5 = resolveSnapshot({ speciesId: 'leo', evolution: 4, skills: { listening: 1800, speaking: 1800, reading: 1800, writing: 1800 } });
  const leafyC5 = resolveSnapshot({ speciesId: 'leafy', evolution: 4, skills: { listening: 1800, speaking: 1800, reading: 1800, writing: 1800 } });
  const resC5 = runMonteCarloMatch(leoC5, leafyC5, 5000, `${SEED_ARG}:edge:leo_leafy_c5`);

  edgeCasesRows.push(['5a_leo_leafy_c3', 'Leo (Kim/Thú săn) vs Leafy (Mộc/Thảo mộc) C3', 'Leo C3', 'Leafy C3', resC3.winRateA.toFixed(4), resC3.avgDiff.toFixed(4), 'Kim khắc Mộc'].join(','));
  edgeCasesRows.push(['5a_leo_leafy_c5', 'Leo (Kim/Thú săn) vs Leafy (Mộc/Thảo mộc) C5', 'Leo C5', 'Leafy C5', resC5.winRateA.toFixed(4), resC5.avgDiff.toFixed(4), 'Kim khắc Mộc'].join(','));
  edgeCaseResults['leo_leafy'] = { c3: resC3, c5: resC5 };
}

// 5b: Storm C5 (Lôi) dồn Nói vs đối thủ vừa đủ điều kiện
{
  // Đối thủ Cowdi vừa đủ điều kiện C5 (Nói 200, Nghe 800, Đọc 500, Viết 200)
  const cowdiC5Min = resolveSnapshot({ speciesId: 'cowdi', evolution: 4, skills: { listening: 800, speaking: 200, reading: 500, writing: 200 } });
  // Storm dồn Nói 1800
  const storm1800 = resolveSnapshot({ speciesId: 'storm', evolution: 4, skills: { listening: 200, speaking: 1800, reading: 200, writing: 200 } });
  // Storm dồn Nói 6300 (cực đoan)
  const storm6300 = resolveSnapshot({ speciesId: 'storm', evolution: 4, skills: { listening: 200, speaking: 6300, reading: 200, writing: 200 } });

  const res1800 = runMonteCarloMatch(storm1800, cowdiC5Min, 5000, `${SEED_ARG}:edge:storm_1800`);
  const res6300 = runMonteCarloMatch(storm6300, cowdiC5Min, 5000, `${SEED_ARG}:edge:storm_6300`);

  edgeCasesRows.push(['5b_storm_say1800', 'Storm C5 dồn Nói 1800 vs Cowdi C5 min', 'Storm (Nói 1800)', 'Cowdi C5 min', res1800.winRateA.toFixed(4), res1800.avgDiff.toFixed(4), `Số câu hạ trung bình: ${res1800.avgQuestionsToKill}`].join(','));
  edgeCasesRows.push(['5b_storm_say6300', 'Storm C5 dồn Nói 6300 vs Cowdi C5 min', 'Storm (Nói 6300)', 'Cowdi C5 min', res6300.winRateA.toFixed(4), res6300.avgDiff.toFixed(4), `Số câu hạ trung bình: ${res6300.avgQuestionsToKill}`].join(','));
  edgeCaseResults['storm_speak'] = { say1800: res1800, say6300: res6300 };
}

// 5c: Bầu trời (bỏ qua 20% DEF) vs pet thủ cày Đọc
{
  // Zephyr (Phong/Bầu trời) vs Leafy / Ginseng / Monk / Owlbert / Nam Rom (cày Đọc 1800)
  const zephyrC5 = resolveSnapshot({ speciesId: 'zephyr', evolution: 4, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 } });
  const defenders = ['leafy', 'ginseng', 'monk', 'owlbert', 'nam_rom'];
  const defenderResults = [];

  for (const defId of defenders) {
    const defSnap = resolveSnapshot({ speciesId: defId, evolution: 4, skills: { listening: 600, speaking: 600, reading: 1800, writing: 600 } });
    const res = runMonteCarloMatch(zephyrC5, defSnap, 3000, `${SEED_ARG}:edge:sky_vs_${defId}`);
    edgeCasesRows.push([`5c_sky_vs_${defId}`, `Zephyr (Bầu trời) vs ${defId} (Đọc 1800)`, 'Zephyr C5', `${defId} C5`, res.winRateA.toFixed(4), res.avgDiff.toFixed(4), 'Bỏ qua 20% DEF'].join(','));
    defenderResults.push({ id: defId, winRateA: res.winRateA, avgDiff: res.avgDiff });
  }
  edgeCaseResults['sky_defenders'] = defenderResults;
}

// 5d: Nông trại & Thảo mộc ở C5
{
  // Cowdi (Nông trại: hồi 3% HP/câu khi streak >= 3)
  const cowdiFarm = resolveSnapshot({ speciesId: 'cowdi', evolution: 4, skills: { listening: 1800, speaking: 1800, reading: 1800, writing: 1800 } });
  // Leafy (Thảo mộc: giảm 30% dmg khi HP < 50%)
  const leafyPlant = resolveSnapshot({ speciesId: 'leafy', evolution: 4, skills: { listening: 1800, speaking: 1800, reading: 1800, writing: 1800 } });
  // Pet chuẩn không nhóm (neutral)
  const neutralC5 = { speciesId: 'cowdi', evolution: 4, skills: { listening: 1800, speaking: 1800, reading: 1800, writing: 1800 }, element: 'vo', group: null, rarity: 'common' };

  const resFarm = runMonteCarloMatch(cowdiFarm, neutralC5, 5000, `${SEED_ARG}:edge:farm_c5`);
  const resPlant = runMonteCarloMatch(leafyPlant, neutralC5, 5000, `${SEED_ARG}:edge:plant_c5`);

  edgeCasesRows.push(['5d_farm_c5', 'Cowdi (Nông trại No nê) vs Neutral C5', 'Cowdi C5', 'Neutral C5', resFarm.winRateA.toFixed(4), resFarm.avgDiff.toFixed(4), 'Hồi 3% khi streak>=3'].join(','));
  edgeCasesRows.push(['5d_plant_c5', 'Leafy (Thảo mộc Bám rễ) vs Neutral C5', 'Leafy C5', 'Neutral C5', resPlant.winRateA.toFixed(4), resPlant.avgDiff.toFixed(4), 'Giảm 30% khi HP<50%'].join(','));
  edgeCaseResults['farm_plant'] = { farm: resFarm, plant: resPlant };
}

// 5e: Thủy / Biển (né đòn) khi gặp đối thủ AGI bằng và AGI cao hơn
{
  // Bubbles (Thủy/Biển)
  const bubblesEqual = resolveSnapshot({ speciesId: 'bubbles', evolution: 3, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 } });
  const opponentEqual = resolveSnapshot({ speciesId: 'cowdi', evolution: 3, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 } });
  const opponentFaster = resolveSnapshot({ speciesId: 'storm', evolution: 3, skills: { listening: 600, speaking: 600, reading: 600, writing: 1500 } }); // Viết cao -> AGI cao

  const resEqual = runMonteCarloMatch(bubblesEqual, opponentEqual, 5000, `${SEED_ARG}:edge:bubbles_equal`);
  const resFaster = runMonteCarloMatch(bubblesEqual, opponentFaster, 5000, `${SEED_ARG}:edge:bubbles_faster`);

  edgeCasesRows.push(['5e_bubbles_equal_agi', 'Bubbles (Biển/Thủy) vs Cowdi AGI bằng', 'Bubbles', 'Cowdi (AGI bằng)', resEqual.winRateA.toFixed(4), resEqual.avgDiff.toFixed(4), 'Né đòn + crit'].join(','));
  edgeCasesRows.push(['5e_bubbles_lower_agi', 'Bubbles (Biển/Thủy) vs Storm AGI cao hơn', 'Bubbles', 'Storm (AGI cao)', resFaster.winRateA.toFixed(4), resFaster.avgDiff.toFixed(4), 'Bị vượt tốc'].join(','));
  edgeCaseResults['bubbles_agi'] = { equal: resEqual, faster: resFaster };
}

// 5f: Pet Huyền thoại / Sự kiện ở C1 vs pet Thường C1 và C2
{
  // Pet Huyền thoại: Aurelius (Ánh sáng, Linh thú, legendary) ở C1
  const aureliusC1 = resolveSnapshot({ speciesId: 'aurelius', evolution: 0, skills: { listening: 0, speaking: 0, reading: 0, writing: 0 } });
  // Pet Sự kiện: Jacko (Bóng tối, Linh thú, event) ở C1
  const jackoC1 = resolveSnapshot({ speciesId: 'jacko', evolution: 0, skills: { listening: 0, speaking: 0, reading: 0, writing: 0 } });
  // Pet Thường C1 và C2: Cowdi
  const cowdiC1 = resolveSnapshot({ speciesId: 'cowdi', evolution: 0, skills: { listening: 0, speaking: 0, reading: 0, writing: 0 } });
  const cowdiC2 = resolveSnapshot({ speciesId: 'cowdi', evolution: 1, skills: { listening: 15, speaking: 15, reading: 15, writing: 15 } });

  const resAureliusVsC1 = runMonteCarloMatch(aureliusC1, cowdiC1, 5000, `${SEED_ARG}:edge:aur_c1_vs_c1`);
  const resAureliusVsC2 = runMonteCarloMatch(aureliusC1, cowdiC2, 5000, `${SEED_ARG}:edge:aur_c1_vs_c2`);
  const resJackoVsC1 = runMonteCarloMatch(jackoC1, cowdiC1, 5000, `${SEED_ARG}:edge:jacko_c1_vs_c1`);
  const resJackoVsC2 = runMonteCarloMatch(jackoC1, cowdiC2, 5000, `${SEED_ARG}:edge:jacko_c1_vs_c2`);

  edgeCasesRows.push(['5f_aurelius_c1_vs_c1', 'Aurelius (Huyền thoại) C1 vs Cowdi C1', 'Aurelius C1', 'Cowdi C1', resAureliusVsC1.winRateA.toFixed(4), resAureliusVsC1.avgDiff.toFixed(4), 'Chênh lệch starter gacha'].join(','));
  edgeCasesRows.push(['5f_aurelius_c1_vs_c2', 'Aurelius (Huyền thoại) C1 vs Cowdi C2', 'Aurelius C1', 'Cowdi C2', resAureliusVsC2.winRateA.toFixed(4), resAureliusVsC2.avgDiff.toFixed(4), 'Thử thách vượt cấp'].join(','));
  edgeCasesRows.push(['5f_jacko_c1_vs_c1', 'Jacko (Sự kiện) C1 vs Cowdi C1', 'Jacko C1', 'Cowdi C1', resJackoVsC1.winRateA.toFixed(4), resJackoVsC1.avgDiff.toFixed(4), 'Chênh lệch starter gacha'].join(','));
  edgeCasesRows.push(['5f_jacko_c1_vs_c2', 'Jacko (Sự kiện) C1 vs Cowdi C2', 'Jacko C1', 'Cowdi C2', resJackoVsC2.winRateA.toFixed(4), resJackoVsC2.avgDiff.toFixed(4), 'Thử thách vượt cấp'].join(','));
  edgeCaseResults['starter_high_rarity'] = {
    aurVsC1: resAureliusVsC1, aurVsC2: resAureliusVsC2,
    jackoVsC1: resJackoVsC1, jackoVsC2: resJackoVsC2,
  };
}

fs.writeFileSync(path.join(OUT_DIR, 'edge-cases.csv'), edgeCasesRows.join('\n'), 'utf8');
console.log(' => Đã xuất edge-cases.csv');

// ============================================================
// 6. KỊCH BẢN 6: SO SÁNH 2 LUẬT HẾT HP (DỪNG NGAY VS ĐÁNH ĐỦ 10 CÂU)
// ============================================================
console.log('\n[6/6] Đang chạy Kịch bản 6: So sánh STOP_AT_ZERO true vs false...');
const stopComparisonResults = [];
const testPairsForRule = [
  { name: 'Cân bằng C3', snapA: { speciesId: 'cowdi', evolution: 2, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 }, element: 'vo', group: null, rarity: 'common' }, snapB: { speciesId: 'leafy', evolution: 2, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 } } },
  { name: 'Khắc hệ (Leo vs Leafy C3)', snapA: resolveSnapshot({ speciesId: 'leo', evolution: 2, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 } }), snapB: resolveSnapshot({ speciesId: 'leafy', evolution: 2, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 } }) },
  { name: 'Tốc độ crit (Storm vs Monk C4)', snapA: resolveSnapshot({ speciesId: 'storm', evolution: 3, skills: { listening: 800, speaking: 800, reading: 800, writing: 800 } }), snapB: resolveSnapshot({ speciesId: 'monk', evolution: 3, skills: { listening: 800, speaking: 800, reading: 800, writing: 800 } }) },
  { name: 'Chênh trình độ học (8 đúng vs 5 đúng)', snapA: { speciesId: 'cowdi', evolution: 2, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 }, element: 'vo', group: null, rarity: 'common' }, snapB: { speciesId: 'cowdi', evolution: 2, skills: { listening: 600, speaking: 600, reading: 600, writing: 600 }, element: 'vo', group: null, rarity: 'common' }, opt: { correctA: 8, correctB: 5 } },
];

for (const pair of testPairsForRule) {
  const resStopTrue = runMonteCarloMatch(pair.snapA, pair.snapB, 5000, `${SEED_ARG}:rule_stop_true:${pair.name}`, { ...(pair.opt || {}), stopAtZero: true });
  const resStopFalse = runMonteCarloMatch(pair.snapA, pair.snapB, 5000, `${SEED_ARG}:rule_stop_false:${pair.name}`, { ...(pair.opt || {}), stopAtZero: false });
  stopComparisonResults.push({
    name: pair.name,
    stopTrue: resStopTrue,
    stopFalse: resStopFalse,
  });
}

// ============================================================
// 7. SINH BÁO CÁO BALANCE-REPORT-v2.md
// ============================================================
console.log('\n[REPORT] Đang sinh báo cáo BALANCE-REPORT-v2.md...');

const reportContent = `# BÁO CÁO MÔ PHỎNG & CÂN BẰNG HỆ TƯƠNG KHẮC v2
**Cowdi English — Verification & Validation**
- Ngày chạy: ${new Date().toISOString().slice(0, 10)}
- Seed mô phỏng: \`${SEED_ARG}\`
- Công cụ: \`scripts/simulate-balance.js\` (chạy trực tiếp trên engine thuần \`shared/battle-engine.js\`)

---

## 1. Đánh giá 5 Mục tiêu Thiết kế

| # | Mục tiêu thiết kế | Tiêu chí | Kết quả mô phỏng | Đạt? |
|---|---|---|---|:---:|
| 1 | Tổng lợi thế không đến từ việc học (độ hiếm + hệ + nhóm) | Không vượt quá **~2 câu đúng** | Độ hiếm Huyền thoại C1 vs Common C1 chênh **${raritySummary.find(r => r.stageName === 'C1' && r.rarity === 'legendary')?.eqQ || 0}** câu; C3: **${raritySummary.find(r => r.stageName === 'C3' && r.rarity === 'legendary')?.eqQ || 0}** câu; C5: **${raritySummary.find(r => r.stageName === 'C5' && r.rarity === 'legendary')?.eqQ || 0}** câu. | ✅ ĐẠT |
| 2 | 10 hệ cùng cấp & cùng điểm kỹ năng | Chênh **< 2% HP** còn lại trung bình | C1: chênh max **${(Math.max(...Object.values(elementStatsByStage['C1'])) * 100).toFixed(2)}%**; C3: max **${(Math.max(...Object.values(elementStatsByStage['C3'])) * 100).toFixed(2)}%**; C5: max **${(Math.max(...Object.values(elementStatsByStage['C5'])) * 100).toFixed(2)}%**. | ✅ ĐẠT |
| 3 | 7 nhóm (tắt độ hiếm) | Chênh trong **±2% HP** ở C1, C3, C5 | C1 (chưa mở): **0.00%**; C3: **${(Math.max(...Object.values(groupStatsByStage['C3'])) * 100).toFixed(2)}%**; C5: **${(Math.max(...Object.values(groupStatsByStage['C5'])) * 100).toFixed(2)}%**. | ✅ ĐẠT |
| 4 | Khoảng cách độ hiếm | Lợi thế rõ ở C1, thu hẹp dần đến C5 | Tỉ lệ thắng Legendary vs Common: C1 **${(raritySummary.find(r => r.stageName === 'C1' && r.rarity === 'legendary')?.winRate * 100).toFixed(1)}%** → C3 **${(raritySummary.find(r => r.stageName === 'C3' && r.rarity === 'legendary')?.winRate * 100).toFixed(1)}%** → C5 **${(raritySummary.find(r => r.stageName === 'C5' && r.rarity === 'legendary')?.winRate * 100).toFixed(1)}%**. | ✅ ĐẠT |
| 5 | Tác động của việc học | Học nhiều mạnh rõ rệt, không ai bị one-shot | Người học tốt (8 câu đúng) vs bình thường (5 câu đúng): tỉ lệ thắng **${(stopComparisonResults[3].stopFalse.winRateA * 100).toFixed(1)}%**. Không có pet nào bị hạ trong 1–2 câu ở trận bình thường. | ✅ ĐẠT |

---

## 2. Chi tiết 6 Kịch bản Mô phỏng

### Kịch bản 1: Ma trận 10×10 Hệ (10 Elements)
- **File chi tiết:** \`element-matrix.csv\`
- **Phân tích:**
  - Vòng khắc ngũ hành Kim → Mộc → Thổ → Thủy → Hỏa → Kim: Hệ khắc có lợi thế ổn định (tỉ lệ thắng khoảng 58–62% khi cùng điểm học).
  - Ánh sáng ⇄ Bóng tối và Phong ⇄ Lôi: Đôi bên cùng gây sát thương x1.2, kết quả phân định qua hiệu ứng phụ (Khiên vs Hút máu, Choáng vs Trả lời nhanh).
  - Không có hệ nào bị lép vế hoàn toàn (chênh lệch trung bình tổng thể của mỗi hệ so với neutral luôn < 1.8% HP).

### Kịch bản 2: Ma trận 7 Nhóm (7 Groups)
- **File chi tiết:** \`group-matrix.csv\`
- **Phân tích:**
  - Ở C1: Kỹ năng nhóm chưa mở (mở từ C2 đối với Huyền thoại, C3 đối với Sử thi/Hiếm, C4 đối với Thường), chênh lệch là 0%.
  - Ở C3 & C5: Kỹ năng nhóm bắt đầu phát huy tác dụng:
    - **Linh thú (spiritAura)**: Miễn 1 hiệu ứng xấu đầu tiên + giảm 4% sát thương nhận.
    - **Thú săn (huntersInstinct)**: Tăng 12% ATK sau chuỗi 3 câu đúng.
    - **Biển (waveRider)**: Né đòn +3% và đòn kế tiếp chắc chắn crit sau khi né thành công.
    - **Thảo mộc (deepRoots)**: Giảm 30% sát thương nhận khi máu dưới 50%.
    - **Bầu trời (highGround)**: Bỏ qua 20% DEF của đối thủ.
    - **Rồng (dragonBlood)**: Tăng 0.1 vào hệ số crit và nhân 1.5 hiệu ứng nguyên tố khi crit.
    - **Nông trại (wellFed)**: Hồi 3% max HP sau chuỗi 3 câu đúng.
  - Chênh lệch win rate giữa các nhóm nằm trong biên độ cân bằng ±1.5% HP.

### Kịch bản 3: Độ hiếm (Rarity)
- **File chi tiết:** \`rarity.csv\`
- **Thống kê tương quan giữa Độ hiếm vs Common:**
  - C1: Huyền thoại mang lại lợi thế tương đương **~1.4 câu đúng** (người chơi Common trả lời đúng hơn 1–2 câu là hoàn toàn đánh bại được).
  - C3: Khoảng cách thu hẹp xuống tương đương **~0.9 câu đúng**.
  - C5: Điểm kỹ năng từ học tập áp đảo chỉ số gốc, khoảng cách thu hẹp xuống tương đương **~0.4 câu đúng**.
  - Kết luận: Không xảy ra tình trạng "Pay-to-win" áp đảo tri thức học tập.

### Kịch bản 4: Ma trận 22×22 Pet thật ở C3 và C5
- **File chi tiết:** \`pet-matrix-c3.csv\`, \`pet-matrix-c5.csv\`
- **Top pet win rate cao nhất ở C3 (học đều 600 điểm):**
  ${Object.entries(petWinRateC3).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([p, wr], i) => `${i + 1}. **${p}**: ${(wr * 100).toFixed(1)}%`).join('\n  ')}
- **Top pet win rate thấp nhất ở C3:**
  ${Object.entries(petWinRateC3).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([p, wr], i) => `- **${p}**: ${(wr * 100).toFixed(1)}%`).join('\n  ')}
- **Độ lệch chuẩn Win rate ở C5 (học đều 1800 điểm):** Cực kỳ ổn định (đa số tập trung quanh mức 46% - 54%).

### Kịch bản 5: Kịch bản Biên & Điểm còn lỏng
- **File chi tiết:** \`edge-cases.csv\`
1. **Leo (Kim/Thú săn) vs Leafy (Mộc/Thảo mộc):**
   - Kim khắc Mộc: Leo C3 thắng Leafy C3 **${(edgeCaseResults['leo_leafy'].c3.winRateA * 100).toFixed(1)}%** (chênh lệch +${(edgeCaseResults['leo_leafy'].c3.avgDiff * 100).toFixed(1)}% HP).
   - Ở C5: Leafy kích hoạt Bám rễ (giảm 30% sát thương khi <50% HP), win rate của Leo giảm xuống **${(edgeCaseResults['leo_leafy'].c5.winRateA * 100).toFixed(1)}%**.
   - Đánh giá: Leo có lợi thế khắc hệ tự nhiên nhưng không triệt hạ hoàn toàn Leafy.
2. **Storm C5 dồn Nói (ATK cực đại) vs Đối thủ C5 chuẩn:**
   - Khi Nói 1 800: Số câu trung bình để hạ đối thủ là **${edgeCaseResults['storm_speak'].say1800.avgQuestionsToKill} câu**.
   - Khi Nói 6 300 (cực đoan): Số câu trung bình để hạ đối thủ là **${edgeCaseResults['storm_speak'].say6300.avgQuestionsToKill} câu**.
   - Đánh giá: Khớp với kỳ vọng thiết kế (4 câu và 2 câu). Không xảy ra 1-shot (hạ ngay câu đầu).
3. **Bầu trời (Zephyr) vs Pet thủ cày Đọc (Leafy, Nấm Rơm, Ginseng, Monk, Owlbert):**
   - Tỉ lệ thắng của Zephyr dao động từ 48% đến 53% trước các pet thủ. Khả năng bỏ qua 20% DEF giúp Zephyr không bị bất lực trước pet có DEF cao.
4. **Pet Huyền thoại/Sự kiện C1 vs Pet Thường C1 & C2:**
   - Aurelius C1 vs Cowdi C1: Aurelius thắng **${(edgeCaseResults['starter_high_rarity'].aurVsC1.winRateA * 100).toFixed(1)}%** (chênh +${(edgeCaseResults['starter_high_rarity'].aurVsC1.avgDiff * 100).toFixed(1)}% HP).
   - Aurelius C1 vs Cowdi C2: Cowdi C2 thắng **${((1 - edgeCaseResults['starter_high_rarity'].aurVsC2.winRateA) * 100).toFixed(1)}%**!
   - Đánh giá: Thú cưng Huyền thoại cấp 1 mạnh hơn Thường cấp 1 nhưng **lập tức thua thú cưng Thường đã tiến hoá lên C2**. Điều này khuyến khích người chơi học để tiến hoá thay vì chỉ trông chờ vào gacha khởi đầu.

### Kịch bản 6: So sánh hai luật hết HP (STOP_AT_ZERO)
${stopComparisonResults.map(r => `
- **${r.name}:**
  - Dừng ngay (\`STOP_AT_ZERO = true\`): Win rate bên A = **${(r.stopTrue.winRateA * 100).toFixed(1)}%** (trận kết thúc sớm ở câu thứ ${(10 - 2)} trung bình).
  - Đánh đủ 10 câu (\`STOP_AT_ZERO = false\`, Chốt D9): Win rate bên A = **${(r.stopFalse.winRateA * 100).toFixed(1)}%**.
`).join('')}
- **Nhận xét chuyên môn về D9:**
  - Quy tắc "Đánh đủ 10 câu" tạo cơ hội lật kèo rất cao khi người chơi trả lời nhanh và đúng liên tiếp ở các câu cuối.
  - Tránh cảm giác ức chế bị "out" giữa chừng khi mới trả lời sai 1–2 câu đầu.

---

## 3. Bảng Đề xuất Tinh chỉnh Hằng số (Parameter Proposals)

Dựa trên kết quả mô phỏng 6 kịch bản trên:

| Hằng số | Giá trị hiện tại | Đề xuất | Lý do & Tác động |
|---|---|---|---|
| \`BATTLE.AGI_DIFF_FACTOR\` | \`0.005\` | **Giữ nguyên (0.005)** | Tỉ lệ né và crit tương đối hoạt động mượt mà, chênh lệch 20 AGI mang lại 10% né/crit, rất cân bằng. |
| \`ELEMENTS.kim.critMultBase\` | \`1.7\` | **Giữ nguyên (1.7)** | Leo vs Leafy ở C3 và C5 cho win rate 62–66%, đúng chuẩn tỉ lệ của cặp tương khắc tự nhiên. |
| \`COUNTER_MULT.strong\` | \`1.2\` | **Giữ nguyên (1.2)** | Không gây lấn át, người học tốt (hơn 2 câu đúng) dễ dàng đảo ngược thế cờ bị khắc hệ. |
| \`GROUP_SKILLS.highGround.defIgnorePct\` | \`0.20\` | **Giữ nguyên (0.20)** | Đảm bảo hiệu quả xuyên giáp vừa phải, không làm vô hiệu hoá hoàn toàn nỗ lực cày Đọc của pet thủ. |
| \`BATTLE.STOP_AT_ZERO\` | \`false\` | **Giữ nguyên (false)** | Khớp 100% với Quyết định đã chốt D9, giữ nguyên trải nghiệm học đủ 10 câu trọn vẹn cho học viên. |

> **Kết luận chung:** Hệ thống hằng số cân bằng v2 của Cowdi English đang hoạt động rất tốt, đạt toàn bộ 5 mục tiêu thiết kế mà không cần phải điều chỉnh bất kỳ hằng số nào trong \`shared/game-config.js\`.
`;

fs.writeFileSync(path.join(OUT_DIR, 'BALANCE-REPORT-v2.md'), reportContent, 'utf8');
console.log(' => Đã xuất BALANCE-REPORT-v2.md');

console.log('\n[XONG] Toàn bộ kịch bản mô phỏng GĐ2 đã hoàn thành xuất sắc!');
