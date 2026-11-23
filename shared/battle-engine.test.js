// Chạy: npm test   (node --test shared/)
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  computeStats, canEvolve, getCounterMultiplier, getCritChance, getDodgeChance,
  computeDamage, simulateBattle, createRng, isGroupSkillUnlocked, normalizeRarity, canMatch,
} from './battle-engine.js';
import { ELEMENTS, GROUPS, GROUP_SKILLS, PET_BATTLE_DATA, EVOLUTION_COSTS, SKILL_KEYS } from './game-config.js';

const sk = (l, s, r, w) => ({ listening: l, speaking: s, reading: r, writing: w });
const near = (actual, expected, tol = 0.1, msg) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${msg ?? ''} expected ${expected} ±${tol}, got ${actual}`);

const SLOW = 10_000;
const right = (timeMs = SLOW) => ({ correct: true, timeMs });
const wrong = () => ({ correct: false, timeMs: SLOW });
const times = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
const attacks = (res, side) => res.log.filter((e) => e.side === side && e.type === 'attack');

// ---------------------------------------------------------------
describe('4.4 — ví dụ chỉ số', () => {
  const cases = [
    { name: 'Cowdi C1 (Vô, Thường) 0/0/0/0',
      snap: { speciesId: 'cowdi', evolution: 0, rarity: 'starter', skills: sk(0, 0, 0, 0) },
      exp: { hp: 113, atk: 10.4, def: 4.0, agi: 3.0, critMult: 1.4 } },
    { name: 'Leafy C4 (Mộc, Thường) 150/60/250/60',
      snap: { speciesId: 'leafy', evolution: 3, rarity: 'common', skills: sk(150, 60, 250, 60) },
      exp: { hp: 271, atk: 21.9, def: 38.7, agi: 11.4, critMult: 1.493 } },
    { name: 'Storm C5 (Lôi, Sử thi) 150/400/150/600',
      snap: { speciesId: 'storm', evolution: 4, rarity: 'epic', skills: sk(150, 400, 150, 600) },
      exp: { hp: 275, atk: 34.2, def: 30.0, agi: 41.0, critMult: 1.64 } },
  ];
  for (const c of cases) {
    test(c.name, () => {
      const st = computeStats(c.snap);
      assert.equal(st.hp, c.exp.hp, 'HP');
      near(st.atk, c.exp.atk, 0.1, 'ATK');
      near(st.def, c.exp.def, 0.1, 'DEF');
      near(st.agi, c.exp.agi, 0.1, 'AGI');
      near(st.critMult, c.exp.critMult, 0.001, 'CRITX');
    });
  }

  test('Kim dùng hệ số crit gốc 1.7; Rồng đã mở +0.1', () => {
    near(computeStats({ speciesId: 'bun', evolution: 0, rarity: 'epic', skills: sk(0, 0, 0, 0) }).critMult, 1.7, 1e-9);
    // Draco legendary mở kỹ năng nhóm từ C1
    near(computeStats({ speciesId: 'draco', evolution: 0, rarity: 'legendary', skills: sk(0, 0, 0, 0) }).critMult, 1.5, 1e-9);
    // Sparky rare chỉ mở từ C2
    near(computeStats({ speciesId: 'sparky', evolution: 0, rarity: 'rare', skills: sk(0, 0, 0, 0) }).critMult, 1.4, 1e-9);
    near(computeStats({ speciesId: 'sparky', evolution: 1, rarity: 'rare', skills: sk(0, 0, 0, 0) }).critMult, 1.5, 1e-9);
  });
});

// ---------------------------------------------------------------
describe('4.3 — độ hiếm & mở kỹ năng nhóm', () => {
  test('starter → common', () => assert.equal(normalizeRarity('starter'), 'common'));
  test('cấp mở theo độ hiếm', () => {
    const at = (rarity, evolution) => isGroupSkillUnlocked({ speciesId: 'cowdi', rarity, evolution });
    assert.equal(at('common', 1), false); assert.equal(at('common', 2), true);
    assert.equal(at('rare', 0), false);   assert.equal(at('rare', 1), true);
    assert.equal(at('event', 0), false);  assert.equal(at('event', 1), true);
    assert.equal(at('epic', 0), true);
    assert.equal(at('legendary', 0), true);
  });
});

// ---------------------------------------------------------------
describe('3.2 — chi phí tiến hoá', () => {
  const rich = { milk: 1e6, gem: 1e6, stone: 1e6 };

  test('bảng chi phí', () => {
    assert.deepEqual(EVOLUTION_COSTS.map((c) => [c.milk, c.gem, c.stone]),
      [[500, 0, 0], [1500, 1, 0], [5000, 25, 1], [20000, 50, 10]]);
  });

  test('C1→C2: Sữa 500, tổng kỹ năng ≥ 60', () => {
    const pet = { speciesId: 'cowdi', evolution: 0, skills: sk(15, 15, 15, 15) };
    const r = canEvolve(pet, { milk: 500, gem: 0, stone: 0 });
    assert.equal(r.ok, true);
    assert.equal(r.to, 1);
    assert.deepEqual(r.cost, { milk: 500, gem: 0, stone: 0 });
    assert.equal(canEvolve(pet, { milk: 499 }).ok, false);
    assert.equal(canEvolve({ ...pet, skills: sk(15, 15, 15, 14) }, rich).ok, false);
  });

  test('C2→C3: Sữa 1500, Gem 1, tổng ≥ 160', () => {
    const pet = { speciesId: 'cowdi', evolution: 1, skills: sk(160, 0, 0, 0) };
    assert.equal(canEvolve(pet, { milk: 1500, gem: 1, stone: 0 }).ok, true);
    assert.equal(canEvolve(pet, { milk: 1500, gem: 0, stone: 0 }).ok, false);
    assert.equal(canEvolve({ ...pet, skills: sk(159, 0, 0, 0) }, rich).ok, false);
  });

  test('C3→C4: từng kỹ năng ≥ mức riêng (Cowdi 250/60/150/60)', () => {
    const pet = { speciesId: 'cowdi', evolution: 2, skills: sk(250, 60, 150, 60) };
    const r = canEvolve(pet, { milk: 5000, gem: 25, stone: 1 });
    assert.equal(r.ok, true);
    assert.equal(canEvolve(pet, { milk: 5000, gem: 25, stone: 0 }).ok, false);
    // Tổng rất cao nhưng thiếu 1 điểm Nói → không được
    const bad = canEvolve({ ...pet, skills: sk(2000, 59, 2000, 2000) }, rich);
    assert.equal(bad.ok, false);
    assert.deepEqual(bad.checks.filter((c) => !c.ok).map((c) => c.key), ['speaking']);
  });

  test('C4→C5: Sữa 20000, Gem 50, Đá 10, mức C5', () => {
    const pet = { speciesId: 'foxie', evolution: 3, skills: sk(150, 600, 150, 400) };
    assert.equal(canEvolve(pet, { milk: 20000, gem: 50, stone: 10 }).ok, true);
    assert.equal(canEvolve(pet, { milk: 19999, gem: 50, stone: 10 }).ok, false);
  });

  test('C5 không tiến hoá tiếp; loài lạ ở bước per-skill bị chặn', () => {
    assert.equal(canEvolve({ speciesId: 'cowdi', evolution: 4, skills: sk(9e3, 9e3, 9e3, 9e3) }, rich).reason, 'max_stage');
    assert.equal(canEvolve({ speciesId: 'nope', evolution: 2, skills: sk(9e3, 9e3, 9e3, 9e3) }, rich).reason, 'unknown_species');
  });
});

// ---------------------------------------------------------------
describe('5.4 — vòng khắc', () => {
  const cycle = ['metal', 'wood', 'earth', 'water', 'fire'];
  test('ngũ hành Kim → Mộc → Thổ → Thủy → Hỏa → Kim', () => {
    for (let i = 0; i < cycle.length; i++) {
      const a = cycle[i];
      const b = cycle[(i + 1) % cycle.length];
      assert.equal(getCounterMultiplier(a, b), 1.2, `${a} khắc ${b}`);
      assert.equal(getCounterMultiplier(b, a), 0.8, `${b} bị ${a} khắc`);
    }
    assert.equal(getCounterMultiplier('metal', 'earth'), 1);
  });
  test('Ánh sáng ⇄ Bóng tối, Phong ⇄ Lôi: ×1.2 cả hai chiều', () => {
    assert.equal(getCounterMultiplier('light', 'dark'), 1.2);
    assert.equal(getCounterMultiplier('dark', 'light'), 1.2);
    assert.equal(getCounterMultiplier('wind', 'thunder'), 1.2);
    assert.equal(getCounterMultiplier('thunder', 'wind'), 1.2);
  });
  test('Vô không khắc, không bị khắc; cùng hệ = 1', () => {
    for (const e of Object.keys(ELEMENTS)) {
      assert.equal(getCounterMultiplier('neutral', e), 1);
      assert.equal(getCounterMultiplier(e, 'neutral'), 1);
      assert.equal(getCounterMultiplier(e, e), 1);
    }
  });
});

// ---------------------------------------------------------------
describe('5.3 — né/crit tương đối', () => {
  // Cùng hệ Vô, khác Viết → khác AGI
  const fast = { speciesId: 'cowdi', evolution: 0, rarity: 'common', skills: sk(0, 0, 0, 400) }; // AGI 29.4+3
  const slow = { speciesId: 'cowdi', evolution: 0, rarity: 'common', skills: sk(0, 0, 0, 0) };   // AGI 3

  test('AGI bằng nhau → triệt tiêu, chỉ còn phần phẳng', () => {
    assert.equal(getCritChance(slow, slow), 0);
    assert.equal(getDodgeChance(slow, slow), 0);
    const storm = { speciesId: 'storm', evolution: 0, rarity: 'common', skills: sk(0, 0, 0, 0) };
    near(getCritChance(storm, storm), 0.15, 1e-9, 'Lôi crit phẳng 15%');
  });

  test('chênh 29.4 AGI → 14.7% cho bên nhanh, 0 cho bên chậm', () => {
    near(getCritChance(fast, slow), 29.4 * 0.005, 1e-9);
    near(getDodgeChance(slow, fast), 29.4 * 0.005, 1e-9);
    assert.equal(getCritChance(slow, fast), 0);
    assert.equal(getDodgeChance(fast, slow), 0);
  });

  test('Lướt sóng (Biển) +3% né phẳng chỉ khi đã mở', () => {
    const pingu = (evolution) => ({ speciesId: 'pingu', evolution, rarity: 'common', skills: sk(0, 0, 0, 0) });
    // pingu Thủy AGI 6 > slow 3 → né 1.5% tương đối
    near(getDodgeChance(slow, pingu(0)), 0.015, 1e-9);
    near(getDodgeChance(slow, pingu(2)), 0.045, 1e-9);
  });

  test('không trần: chênh rất lớn > 100%', () => {
    const huge = { speciesId: 'mimi', evolution: 4, rarity: 'rare', skills: sk(0, 0, 0, 100000) };
    assert.ok(getCritChance(huge, slow) > 1);
  });
});

// ---------------------------------------------------------------
describe('5.2 — công thức đòn', () => {
  const plain = (speciesId, extra = {}) => ({ speciesId, evolution: 0, rarity: 'common', skills: sk(0, 0, 0, 0), ...extra });

  test('đòn thường = round(ATK × khắc × 100 / (100 + DEF))', () => {
    const a = plain('cowdi'); // ATK 10.4
    const d = plain('cowdi'); // DEF 4
    assert.equal(computeDamage(a, d).damage, Math.round(10.4 * 100 / 104));
  });

  test('Thổ giảm 50% phần cộng thêm khi bị crit', () => {
    const a = plain('cowdi', { skills: sk(0, 400, 0, 0) }); // ATK (10+10)*1.04 = 20.8, CRITX 1.64
    const earth = plain('mushroom', { rarity: 'rare' });
    const r = computeDamage(a, earth, { crit: true });
    assert.equal(r.critRaw, Math.round(r.normal * 1.64));
    assert.equal(r.damage, r.normal + Math.round((r.critRaw - r.normal) * 0.5));
    assert.ok(r.damage < r.critRaw);
    // Cùng ATK đánh bên không phải Thổ thì nhận trọn crit
    const nonEarth = computeDamage(a, plain('cowdi', { skills: sk(0, 0, 2000, 0) }), { crit: true });
    assert.equal(nonEarth.damage, nonEarth.critRaw);
  });

  test('Bầu trời (Tầm cao) bỏ qua 20% DEF khi đã mở', () => {
    const tank = plain('cowdi', { skills: sk(0, 0, 400, 0) }); // DEF 49+4 = 53
    const skyLocked = plain('mimi', { rarity: 'rare', evolution: 0, skills: sk(0, 2500, 0, 0) });
    const skyOpen = { ...skyLocked, evolution: 1 };
    const atkL = computeStats(skyLocked).atk;
    const atkO = computeStats(skyOpen).atk;
    assert.equal(computeDamage(skyLocked, tank).damage, Math.round(atkL * 100 / (100 + 53)));
    assert.equal(computeDamage(skyOpen, tank).damage, Math.round(atkO * 100 / (100 + 53 * 0.8)));
  });

  test('Bám rễ (Thảo mộc): giảm 30% khi HP < 50%, chỉ khi đã mở', () => {
    const a = plain('cowdi', { skills: sk(0, 2500, 0, 0) });
    const herb = plain('mushroom', { rarity: 'rare', evolution: 1 });
    const full = computeDamage(a, herb, { defenderHpRatio: 0.5 }).damage;
    const low = computeDamage(a, herb, { defenderHpRatio: 0.49 }).damage;
    assert.equal(low, Math.round(full * 0.7));
    const locked = { ...herb, evolution: 0 };
    assert.equal(computeDamage(a, locked, { defenderHpRatio: 0.1 }).damage, full);
  });

  test('Linh khí giảm 4% sát thương nhận', () => {
    const a = plain('cowdi', { skills: sk(0, 2500, 0, 0) });
    const monk = plain('monk', { rarity: 'event', evolution: 1 });
    const monkLocked = { ...monk, evolution: 0 };
    const base = computeDamage(a, monkLocked).damage;
    assert.equal(computeDamage(a, monk).damage, Math.round(base * 0.96));
  });

  test('sát thương luôn là số nguyên', () => {
    for (const id of Object.keys(PET_BATTLE_DATA)) {
      const r = computeDamage(plain(id, { skills: sk(37, 123, 0, 0) }), plain('cowdi', { skills: sk(0, 0, 77, 0) }), { crit: true });
      assert.ok(Number.isInteger(r.damage), id);
    }
  });
});

// ---------------------------------------------------------------
describe('5.1/5.5/5.6 — mô phỏng trận', () => {
  const cowdi = (evolution = 0, extra = {}) => ({ speciesId: 'cowdi', evolution, rarity: 'starter', skills: sk(0, 0, 0, 0), ...extra });

  test('cùng seed → cùng kết quả (replay được)', () => {
    const a = { speciesId: 'storm', evolution: 2, rarity: 'epic', skills: sk(50, 80, 30, 200) };
    const b = { speciesId: 'pingu', evolution: 2, rarity: 'common', skills: sk(120, 30, 40, 90) };
    const ansA = times(10, (i) => ({ correct: i % 3 !== 0, timeMs: 2000 + i * 500 }));
    const ansB = times(10, (i) => ({ correct: i % 4 !== 1, timeMs: 4000 }));
    const r1 = simulateBattle(a, b, ansA, ansB, 'duel-42');
    const r2 = simulateBattle(a, b, ansA, ansB, 'duel-42');
    assert.deepEqual(r1, r2);
    const rngA = createRng('x'); const rngB = createRng('x');
    assert.equal(rngA(), rngB());
  });

  test('thắng theo % HP; bằng nhau thì tổng thời gian ít hơn thắng', () => {
    const r = simulateBattle(cowdi(), cowdi(), times(10, () => right()), times(10, () => wrong()), 's');
    assert.equal(r.winner, 'challenger');
    assert.equal(r.challenger.hp, r.challenger.maxHp);
    const tie = simulateBattle(cowdi(), cowdi(), times(10, () => wrong()), times(10, () => ({ correct: false, timeMs: 9000 })), 's');
    assert.equal(tie.winner, 'opponent'); // HP bằng nhau, B nhanh hơn
    const draw = simulateBattle(cowdi(), cowdi(), times(10, () => wrong()), times(10, () => wrong()), 's');
    assert.equal(draw.winner, 'draw');
  });

  test('trả lời nhanh (< 3s) luôn crit; HP không xuống dưới 0 và vẫn chấm hết câu', () => {
    const strong = cowdi(4, { skills: sk(0, 5000, 0, 0) });
    const r = simulateBattle(strong, cowdi(), times(10, () => right(1000)), times(10, () => right()), 's');
    for (const e of attacks(r, 'challenger')) assert.equal(e.crit, true);
    assert.equal(r.opponent.hp, 0);
    assert.equal(attacks(r, 'opponent').length, 10, 'opponent vẫn đánh đủ 10 câu');
    const stop = simulateBattle(strong, cowdi(), times(10, () => right(1000)), times(10, () => right()), 's', { stopAtZero: true });
    assert.ok(attacks(stop, 'opponent').length < 10);
  });

  test('Lôi: crit gây choáng → đòn kế tiếp của đối thủ không crit', () => {
    const storm = { speciesId: 'storm', evolution: 0, rarity: 'epic', skills: sk(0, 0, 0, 0) };
    const r = simulateBattle(storm, storm, [right(1000), wrong()], [right(1000), right(1000)], 's');
    const [b1, b2] = attacks(r, 'opponent');
    assert.equal(attacks(r, 'challenger')[0].stunApplied, true);
    assert.equal(b1.stunned, true);
    assert.equal(b1.crit, false, 'bị choáng: trả lời nhanh cũng không crit');
    assert.equal(b2.stunned, false);
    assert.equal(b2.crit, true, 'hết choáng sau 1 đòn');
  });

  test('Linh khí miễn hiệu ứng xấu đầu tiên (choáng)', () => {
    const storm = { speciesId: 'storm', evolution: 0, rarity: 'epic', skills: sk(0, 0, 0, 0) };
    const monk = { speciesId: 'monk', evolution: 1, rarity: 'event', skills: sk(0, 0, 0, 0) };
    const r = simulateBattle(storm, monk, [right(1000)], [right(1000)], 's');
    const a1 = attacks(r, 'challenger')[0];
    // Đòn đầu bị lá chắn Ánh sáng chặn → chưa áp hiệu ứng nào
    assert.equal(a1.blocked, true);
    const r2 = simulateBattle(storm, monk, [right(1000), right(1000)], [wrong(), right(1000)], 's');
    const [, a2] = attacks(r2, 'challenger');
    assert.equal(a2.immune, true);
    assert.equal(a2.stunApplied, false);
    assert.equal(attacks(r2, 'opponent')[0].stunned, false);
  });

  test('Ánh sáng: lá chắn chặn đòn trúng đầu tiên', () => {
    // Cowdi AGI 3 vs Monk AGI 0 → Monk không né được Cowdi
    const monk = { speciesId: 'monk', evolution: 0, rarity: 'event', skills: sk(0, 0, 0, 0) };
    const r = simulateBattle(cowdi(), monk, [right(), right()], [wrong(), wrong()], 's');
    const [h1, h2] = attacks(r, 'challenger');
    assert.equal(h1.blocked, true);
    assert.equal(h1.damage, 0);
    assert.equal(h2.blocked, false);
    assert.ok(h2.damage > 0);
  });

  test('No đủ (Nông trại): hồi 2% HP từ câu đúng thứ 3 liên tiếp', () => {
    // Challenger Cowdi C1 (chưa mở) đánh trước, opponent Cowdi C3 (đã mở). AGI bằng nhau, Vô không crit phẳng.
    const pattern = [true, true, true, true, false, true, true, true];
    const r = simulateBattle(
      cowdi(0, { skills: sk(0, 400, 0, 0) }), cowdi(2),
      times(pattern.length, () => right()),
      pattern.map((c) => (c ? right() : wrong())), 's');
    const healAmt = Math.round(r.opponent.maxHp * GROUP_SKILLS.wellFed.healPct);
    const heals = attacks(r, 'opponent').map((e) => [e.q, e.heal]);
    assert.deepEqual(heals, [[1, 0], [2, 0], [3, healAmt], [4, healAmt], [6, 0], [7, 0], [8, healAmt]]);
    // Bên chưa mở kỹ năng không hồi
    assert.ok(attacks(r, 'challenger').every((e) => e.heal === 0));
  });

  test('Thú săn: +10% ATK sau chuỗi 3 câu đúng', () => {
    const foxie = { speciesId: 'foxie', evolution: 2, rarity: 'common', skills: sk(0, 3000, 0, 0) };
    // Leo (Kim) AGI 0 = Foxie AGI 0 → không né được
    const target = { speciesId: 'leo', evolution: 0, rarity: 'epic', skills: sk(5000, 0, 0, 0) };
    const r = simulateBattle(foxie, target, times(5, () => right()), times(5, () => wrong()), 'hunter');
    const hits = attacks(r, 'challenger');
    assert.equal(hits[1].hunterActivated, false);
    assert.equal(hits[2].hunterActivated, true);
    hits.forEach((h, i) => {
      assert.equal(h.dodged, false);
      const exp = computeDamage(foxie, target, { crit: h.crit, atkBonusPct: i >= 3 ? 0.1 : 0 }).damage;
      assert.equal(h.damage, exp, `đòn ${i + 1}`);
    });
    assert.ok(computeDamage(foxie, target, { atkBonusPct: 0.1 }).damage > computeDamage(foxie, target).damage);
  });

  test('Hỏa: bỏng 1% HP tối đa mỗi lượt trong 2 lượt', () => {
    const fire = { speciesId: 'foxie', evolution: 0, rarity: 'common', skills: sk(0, 0, 0, 0) };
    const target = { speciesId: 'leo', evolution: 0, rarity: 'epic', skills: sk(2000, 0, 0, 0) }; // AGI 0 → không né
    const r = simulateBattle(fire, target, [right(1000), wrong(), wrong(), wrong()], times(4, () => wrong()), 'burn');
    assert.equal(attacks(r, 'challenger')[0].burnApplied, true);
    const burns = r.log.filter((e) => e.type === 'burn');
    assert.deepEqual(burns.map((b) => b.q), [1, 2]);
    assert.ok(burns.every((b) => b.damage === Math.round(r.opponent.maxHp * 0.01)));
  });

  test('Phong: 2 câu đúng chậm đầu tiên vẫn tính là trả lời nhanh', () => {
    const mimi = { speciesId: 'mimi', evolution: 0, rarity: 'rare', skills: sk(0, 0, 0, 0) };
    const r = simulateBattle(mimi, cowdi(), [wrong(), right(), right(), right()], times(4, () => wrong()), 's');
    const hits = attacks(r, 'challenger');
    assert.deepEqual(hits.map((h) => h.windFast), [true, true, false]);
  });

  test('Bóng tối hút 10% sát thương gây ra', () => {
    const shadow = { speciesId: 'shadow', evolution: 0, rarity: 'epic', skills: sk(0, 2000, 0, 0) };
    const tank = cowdi(0, { skills: sk(3000, 3000, 0, 0) });
    // tank đánh trước để shadow mất máu, rồi shadow hút
    const r = simulateBattle(tank, shadow, [right()], [right()], 's');
    const s = attacks(r, 'opponent')[0];
    if (!s.dodged) assert.equal(s.lifesteal, Math.min(Math.round(s.damage * 0.1), attacks(r, 'challenger')[0].damage));
  });

  test('ghép trận chênh tối đa 1 cấp', () => {
    assert.equal(canMatch(2, 3), true);
    assert.equal(canMatch(2, 4), false);
  });
});

// ---------------------------------------------------------------
describe('dữ liệu config', () => {
  test('22 pet đủ hệ/nhóm/evolveReq hợp lệ; C5 ≥ C4', () => {
    const ids = Object.keys(PET_BATTLE_DATA);
    assert.equal(ids.length, 22);
    for (const id of ids) {
      const p = PET_BATTLE_DATA[id];
      assert.ok(ELEMENTS[p.element], `${id} element`);
      assert.ok(GROUPS[p.group], `${id} group`);
      assert.equal(p.evolveReq.c4.length, SKILL_KEYS.length);
      p.evolveReq.c4.forEach((v, i) => assert.ok(p.evolveReq.c5[i] >= v, `${id} c5 ≥ c4`));
    }
  });
  test('mọi hệ/nhóm/kỹ năng nhóm có labelVi', () => {
    for (const t of [ELEMENTS, GROUPS, GROUP_SKILLS]) {
      for (const [k, v] of Object.entries(t)) assert.ok(v.labelVi, k);
    }
  });
});
