// ============================================================
// Cowdi English — Battle engine v2.1 (hàm thuần, dùng chung client/server)
// ------------------------------------------------------------
// Nguồn: docs/04-design/SDD-ECONOMY-BATTLE-v2.1.md mục 3–5.
// Server là nơi quyết định kết quả; client chỉ dùng để hiển thị.
// Không có side effect, không đọc Math.random — mọi ngẫu nhiên đi qua
// RNG có seed (createRng) để server tính lại / replay được.
// ============================================================

import {
  SKILL_KEYS, STAT_FORMULA, EVOLUTION_STAGES, EVOLUTION_COSTS, MAX_EVOLUTION,
  RARITIES, RARITY_ALIASES, ELEMENTS, COUNTERS, COUNTER_MULT,
  GROUPS, GROUP_SKILLS, BATTLE, PET_BATTLE_DATA, POWER_SCORE,
  PET_SKILLS, TRIGGER_TYPES, TRIGGER_PRIORITY_ORDER, ARENA_CONFIG,
} from './game-config.js';

// ---------- Tiện ích ----------
const round1 = (x) => Math.round(x * 10) / 10;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const sqrtPts = (v) => Math.sqrt(Math.max(0, Math.floor(Number(v) || 0)));

/** Chuẩn hoá điểm kỹ năng về { listening, speaking, reading, writing } (số nguyên ≥ 0). */
export function normalizeSkills(skills) {
  const out = {};
  for (const k of SKILL_KEYS) out[k] = Math.max(0, Math.floor(Number(skills?.[k]) || 0));
  return out;
}

/** starter → common; độ hiếm lạ → common. */
export function normalizeRarity(rarity) {
  const r = RARITY_ALIASES[rarity] ?? rarity;
  return RARITIES[r] ? r : 'common';
}

function clampStage(stage) {
  const s = Math.floor(Number(stage) || 0);
  return Math.min(MAX_EVOLUTION, Math.max(0, s));
}

/**
 * Chuẩn hoá snapshot pet. Nếu thiếu element/group thì lấy từ PET_BATTLE_DATA theo speciesId.
 * snapshot: { speciesId, evolution (0–4), skills, element?, group?, rarity }
 */
export function resolveSnapshot(snap = {}) {
  const data = PET_BATTLE_DATA[snap.speciesId] || {};
  const element = ELEMENTS[snap.element] ? snap.element : (data.element || 'neutral');
  const group = GROUPS[snap.group] ? snap.group : (data.group || null);
  return {
    speciesId: snap.speciesId ?? null,
    evolution: clampStage(snap.evolution),
    skills: normalizeSkills(snap.skills),
    element,
    group,
    rarity: normalizeRarity(snap.rarity),
  };
}

/** Kỹ năng nhóm có hiệu lực chưa (cấp mở theo độ hiếm, 4.3). */
export function isGroupSkillUnlocked(snap) {
  const s = resolveSnapshot(snap);
  if (!s.group) return false;
  return s.evolution >= RARITIES[s.rarity].groupSkillFromStage;
}

/** Key kỹ năng nhóm đang có hiệu lực, hoặc null. */
export function activeGroupSkill(snap) {
  const s = resolveSnapshot(snap);
  return isGroupSkillUnlocked(s) ? GROUPS[s.group].skill : null;
}

// ---------- Chỉ số (4.1) ----------
/**
 * Tính chỉ số chiến đấu từ snapshot. Không theo cấp kỹ năng, không trần.
 * @returns {{hp:number, atk:number, def:number, agi:number, critMult:number}}
 */
export function computeStats(snapshot) {
  const s = resolveSnapshot(snapshot);
  const base = EVOLUTION_STAGES[s.evolution];
  const rar = RARITIES[s.rarity];
  const el = ELEMENTS[s.element];
  const f = STAT_FORMULA;
  const sk = s.skills;

  const hp = Math.round((base.hp + f.hpPerSqrtListening * sqrtPts(sk.listening) + rar.hp) * (1 + el.hpPct));
  const atk = round1((base.atk + f.atkPerSqrtSpeaking * sqrtPts(sk.speaking) + rar.atk) * (1 + el.atkPct));
  const def = f.defPerSqrtReading * sqrtPts(sk.reading) + el.def;
  const agi = f.agiPerSqrtWriting * sqrtPts(sk.writing) + el.agi;
  const dragonBonus = activeGroupSkill(s) === 'dragonBlood' ? GROUP_SKILLS.dragonBlood.critMultBonus : 0;
  const critMult = (el.critMultBase ?? f.critMultBase) + f.critMultPerSqrtSpeaking * sqrtPts(sk.speaking) + dragonBonus;

  return { hp, atk, def, agi, critMult };
}

/** Power score cho leaderboard (gợi ý 4.3). Phase 2 mới nối vào app. */
export function computePowerScore(snapshot) {
  const st = computeStats(snapshot);
  const p = POWER_SCORE;
  return Math.round(st.hp / p.hpDiv + st.atk * p.atkMul + st.def / p.defDiv + st.agi / p.agiDiv);
}

// ---------- Tiến hoá (3.2–3.3) ----------
/**
 * Kiểm tra pet có tiến hoá được không.
 * @param pet    { speciesId, evolution, skills }
 * @param wallet { milk, gem, stone }
 * @returns {{ ok, reason, from, to, cost, checks: Array<{key, kind, have, need, ok}> }}
 *   reason: null | 'max_stage' | 'unknown_species' | 'insufficient'
 */
export function canEvolve(pet, wallet) {
  const from = clampStage(pet?.evolution);
  if (from >= MAX_EVOLUTION) {
    return { ok: false, reason: 'max_stage', from, to: null, cost: null, checks: [] };
  }
  const step = EVOLUTION_COSTS[from];
  const cost = { milk: step.milk, gem: step.gem, stone: step.stone };
  const skills = normalizeSkills(pet?.skills);
  const checks = [];

  for (const cur of ['milk', 'gem', 'stone']) {
    const have = Math.max(0, Math.floor(Number(wallet?.[cur]) || 0));
    checks.push({ key: cur, kind: 'currency', have, need: cost[cur], ok: have >= cost[cur] });
  }

  if (step.req.type === 'total') {
    const have = SKILL_KEYS.reduce((sum, k) => sum + skills[k], 0);
    checks.push({ key: 'totalSkills', kind: 'skillTotal', have, need: step.req.min, ok: have >= step.req.min });
  } else {
    const req = PET_BATTLE_DATA[pet?.speciesId]?.evolveReq?.[step.req.key];
    if (!req) {
      return { ok: false, reason: 'unknown_species', from, to: step.to, cost, checks };
    }
    SKILL_KEYS.forEach((k, i) => {
      checks.push({ key: k, kind: 'skill', have: skills[k], need: req[i], ok: skills[k] >= req[i] });
    });
  }

  const ok = checks.every((c) => c.ok);
  return { ok, reason: ok ? null : 'insufficient', from, to: step.to, cost, checks };
}

// ---------- Khắc hệ (5.4) ----------
/** Hệ số khắc khi `attackerEl` đánh `defenderEl`: 1.2 / 0.8 / 1. Khắc lẫn nhau → 1.2 cả hai chiều. */
export function getCounterMultiplier(attackerEl, defenderEl) {
  if (COUNTERS[attackerEl]?.includes(defenderEl)) return COUNTER_MULT.strong;
  if (COUNTERS[defenderEl]?.includes(attackerEl)) return COUNTER_MULT.weak;
  return COUNTER_MULT.normal;
}

// ---------- Né & crit tương đối (5.3) ----------
/** Xác suất crit (chưa tính trả lời nhanh / choáng). Không trần; kẹp [0,1] khi gieo. */
export function getCritChance(attSnap, defSnap) {
  const a = resolveSnapshot(attSnap);
  const aSt = computeStats(a);
  const dSt = computeStats(defSnap);
  return Math.max(0, (aSt.agi - dSt.agi) * BATTLE.AGI_DIFF_FACTOR) + ELEMENTS[a.element].critFlat;
}

/** Xác suất bên thủ né đòn của bên công. */
export function getDodgeChance(attSnap, defSnap) {
  const d = resolveSnapshot(defSnap);
  const aSt = computeStats(attSnap);
  const dSt = computeStats(d);
  const flat = activeGroupSkill(d) === 'waveRider' ? GROUP_SKILLS.waveRider.dodgeFlat : 0;
  return Math.max(0, (dSt.agi - aSt.agi) * BATTLE.AGI_DIFF_FACTOR) + flat;
}

// ---------- Sát thương 1 đòn (5.2) ----------
/**
 * Sát thương 1 đòn trúng (đã qua né & lá chắn). Số nguyên.
 * opts: { crit=false, atkBonusPct=0 (Bản năng săn), defenderHpRatio=1 (cho Bám rễ) }
 * @returns {{ damage, normal, critRaw, counter }}
 */
export function computeDamage(attSnap, defSnap, opts = {}) {
  const a = resolveSnapshot(attSnap);
  const d = resolveSnapshot(defSnap);
  const aSt = computeStats(a);
  const dSt = computeStats(d);
  const { crit = false, atkBonusPct = 0, defenderHpRatio = 1 } = opts;

  const ignore = activeGroupSkill(a) === 'highGround' ? GROUP_SKILLS.highGround.defIgnorePct : 0;
  const effDef = dSt.def * (1 - ignore);
  const counter = getCounterMultiplier(a.element, d.element);
  const atk = aSt.atk * (1 + atkBonusPct);

  const normal = Math.round(atk * counter * 100 / (100 + effDef));
  let dmg = normal;
  let critRaw = null;
  if (crit) {
    critRaw = Math.round(normal * aSt.critMult);
    const factor = ELEMENTS[d.element].critBonusTakenFactor;
    dmg = factor != null ? normal + Math.round((critRaw - normal) * factor) : critRaw;
  }

  // Giảm sát thương nhận (nhân dồn, làm tròn 1 lần).
  let reduce = 1;
  const dSkill = activeGroupSkill(d);
  if (dSkill === 'deepRoots' && defenderHpRatio < GROUP_SKILLS.deepRoots.hpThreshold) {
    reduce *= 1 - GROUP_SKILLS.deepRoots.damageReduction;
  }
  if (dSkill === 'spiritAura') reduce *= 1 - GROUP_SKILLS.spiritAura.damageReduction;
  if (reduce !== 1) dmg = Math.round(dmg * reduce);

  return { damage: Math.max(0, dmg), normal, critRaw, counter };
}

// ---------- RNG có seed ----------
/** RNG xác định từ chuỗi seed (hash xmur3 → mulberry32). Trả về hàm () => [0, 1). */
export function createRng(seed) {
  const str = String(seed);
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  let a = (h ^= h >>> 16) >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Trận đấu (5.1–5.6, v0.2 trigger system) ----------
export function getPetSkill(speciesId) {
  return PET_SKILLS[speciesId] || null;
}

function makeFighter(snapshot, side) {
  const snap = resolveSnapshot(snapshot);
  const stats = computeStats(snap);
  const el = ELEMENTS[snap.element];
  const skill = activeGroupSkill(snap);
  // Pet ở giai đoạn Egg (stage 0) không có kỹ năng. Min stage mặc định là baby (stage 1)
  const petSkill = snap.evolution > 0 ? (PET_SKILLS[snap.speciesId] || null) : null;

  return {
    side,
    snap,
    stats,
    el,
    skill,
    petSkill,
    maxHp: stats.hp,
    hp: stats.hp,
    streak: 0,
    hunterActive: false,
    shield: el.shieldHits || 0,
    extraFast: el.extraFastAnswers || 0,
    immunities: skill === 'spiritAura' ? GROUP_SKILLS.spiritAura.immunities : 0,
    stunned: false,
    critNext: false,          // Lướt sóng: vừa né → câu đúng kế tiếp chắc chắn crit
    burn: null,               // { turnsLeft, damage }

    // State phục vụ trigger kỹ năng v0.2
    energy: 0,                // 0..5
    energyTriggered: false,   // Tuyệt kỹ 1 lần / trận
    lowHpTriggered: false,    // Cứu nguy 1 lần / trận
    cooldownTurns: 0,         // Số lượt hồi chiêu còn lại
    usesCount: 0,             // Số lần đã dùng kỹ năng
    tookDamageThisTurn: false,// Vừa trúng đòn ở lượt này để xét low_hp
    comboCount: 0,            // Chuỗi câu đúng riêng cho trigger combo_streak (reset về 0 khi kích hoạt)
  };
}

function heal(f, amount) {
  const amt = Math.max(0, Math.round(amount));
  const before = f.hp;
  f.hp = Math.min(f.maxHp, f.hp + amt);
  return f.hp - before;
}

function takeDamage(f, amount) {
  const before = f.hp;
  f.hp = Math.max(0, f.hp - amount);
  return before - f.hp;
}

/** Thử áp hiệu ứng xấu; Linh khí miễn lần đầu. Trả về true nếu áp được. */
function tryApplyDebuff(target) {
  if (target.immunities > 0) {
    target.immunities -= 1;
    return false;
  }
  return true;
}

function normalizeAnswer(ans) {
  if (!ans) return { correct: false, timeMs: null, category: null };
  const t = Number(ans.timeMs);
  return {
    correct: !!ans.correct,
    timeMs: Number.isFinite(t) && t >= 0 ? t : null,
    category: ans.category || ans.skill || null,
  };
}

/** Kiểm tra câu hỏi có khớp sở trường của pet không */
function isSkillMatch(specialty, category) {
  if (!specialty || !category) return false;
  const cat = String(category).toLowerCase();
  const spec = String(specialty).toLowerCase();
  return cat === spec || cat.includes(spec);
}

/** Xét trigger kích hoạt kỹ năng v0.2 */
export function evaluateTrigger(f, opp, ans, q) {
  if (!f.petSkill || !f.petSkill.activation) return null;
  if (f.hp <= 0) return null; // Pet hết HP không ra chiêu

  const act = f.petSkill.activation;
  if (f.cooldownTurns > 0) return null; // Đang hồi chiêu
  if (act.uses_per_battle != null && f.usesCount >= act.uses_per_battle) return null; // Đã hết lượt dùng

  const trigger = act.trigger;
  let triggered = false;

  switch (trigger) {
    case 'energy_full':
      // Thanh năng lượng đầy 5/5, sau câu trả lời đúng
      if (ans.correct && f.energy >= (act.value || 5) && !f.energyTriggered) {
        triggered = true;
      }
      break;
    case 'low_hp':
      // HP pet xuống dưới X% lần đầu, xét sau khi trúng đòn
      if (f.tookDamageThisTurn && !f.lowHpTriggered) {
        const threshold = act.value || 0.30;
        if (f.hp / f.maxHp <= threshold) {
          triggered = true;
        }
      }
      break;
    case 'combo_streak':
      // Trả lời đúng N câu liên tiếp, sau câu đúng
      if (ans.correct && f.comboCount >= (act.value || 3)) {
        triggered = true;
      }
      break;
    case 'skill_match':
      // Trả lời đúng câu thuộc kỹ năng sở trường
      if (ans.correct && isSkillMatch(f.petSkill.specialty, ans.category)) {
        triggered = true;
      }
      break;
    case 'fast_answer':
      // Trả lời đúng trong T giây đầu
      if (ans.correct && ans.timeMs != null && ans.timeMs <= (act.value || 5000)) {
        triggered = true;
      }
      break;
    default:
      break;
  }

  if (!triggered) return null;

  return {
    q,
    side: f.side,
    speciesId: f.snap.speciesId,
    skillId: f.petSkill.id,
    skillName: f.petSkill.nameVi,
    label: f.petSkill.labelVi,
    desc: f.petSkill.descVi,
    trigger,
    effectType: f.petSkill.effectType,
    effectVal: f.petSkill.effectVal,
  };
}

/** Cập nhật trạng thái sau khi kỹ năng được chọn kích hoạt */
function applySkillActivation(f, triggerType) {
  const act = f.petSkill.activation;
  f.usesCount += 1;
  // +1 vì cuối lượt hiện tại sẽ giảm 1 lượt hồi chiêu
  f.cooldownTurns = act.cooldown_turns ? act.cooldown_turns + 1 : 0;

  if (triggerType === 'combo_streak') {
    // Reset đếm lại từ 0 sau khi kích hoạt (v0.2 mục 1)
    f.comboCount = 0;
  } else if (triggerType === 'energy_full') {
    f.energyTriggered = true;
    f.energy = 0;
  } else if (triggerType === 'low_hp') {
    f.lowHpTriggered = true;
  }
}

/** Thi triển hiệu ứng kỹ năng trong hàng đợi */
function executeSkillEffect(f, opp, skillEvent) {
  let dealt = 0;
  let healed = 0;
  let shieldGained = 0;
  const val = skillEvent.effectVal || 0.20;

  switch (skillEvent.effectType) {
    case 'damage': {
      const dmg = Math.round(f.stats.atk * val * 100 / (100 + opp.stats.def));
      dealt = takeDamage(opp, Math.max(1, dmg));
      break;
    }
    case 'heal': {
      healed = heal(f, f.maxHp * val);
      break;
    }
    case 'heal_shield': {
      healed = heal(f, f.maxHp * val);
      f.shield += 1;
      shieldGained = 1;
      break;
    }
    case 'damage_heal': {
      const dmg = Math.round(f.stats.atk * val * 100 / (100 + opp.stats.def));
      dealt = takeDamage(opp, Math.max(1, dmg));
      healed = heal(f, f.maxHp * 0.10);
      break;
    }
    case 'damage_lifesteal': {
      const dmg = Math.round(f.stats.atk * val * 100 / (100 + opp.stats.def));
      dealt = takeDamage(opp, Math.max(1, dmg));
      healed = heal(f, dealt * 0.20);
      break;
    }
    default:
      break;
  }

  skillEvent.damageDealt = dealt;
  skillEvent.healed = healed;
  skillEvent.shieldGained = shieldGained;
}

/**
 * Mô phỏng 1 trận. Thứ tự: câu 1→N; trong mỗi câu challenger (A) đánh trước, opponent (B) sau;
 * cuối mỗi câu mới tính bỏng. Thắng theo % HP còn lại; bằng nhau → tổng thời gian ít hơn thắng.
 *
 * @param snapA    snapshot challenger
 * @param snapB    snapshot opponent
 * @param answersA mảng [{ correct: boolean, timeMs: number }] theo từng câu
 * @param answersB như trên
 * @param seed     chuỗi seed (vd. challengeId). RNG mỗi lượt = seed + câu + bên.
 * @param options  { stopAtZero = BATTLE.STOP_AT_ZERO }
 */
export function simulateBattle(snapA, snapB, answersA = [], answersB = [], seed = '', options = {}) {
  const stopAtZero = options.stopAtZero ?? BATTLE.STOP_AT_ZERO;
  const A = makeFighter(snapA, 'challenger');
  const B = makeFighter(snapB, 'opponent');
  const n = Math.max(answersA.length, answersB.length);
  const log = [];
  let ended = false;

  const hpNow = () => ({ challenger: A.hp, opponent: B.hp });

  function attack(att, def, ans, q) {
    // Luôn rút 2 số theo thứ tự cố định để kết quả không phụ thuộc nhánh logic.
    const rng = createRng(`${seed}:${q}:${att.side}`);
    const rCrit = rng();
    const rDodge = rng();

    if (!ans.correct) {
      att.streak = 0;
      log.push({ q, side: att.side, type: 'miss', hp: hpNow() });
      return;
    }
    att.streak += 1;

    // --- Crit ---
    let fast = ans.timeMs != null && ans.timeMs < BATTLE.FAST_ANSWER_MS;
    let windFast = false;
    if (!fast && att.extraFast > 0) {
      att.extraFast -= 1;
      fast = true;
      windFast = true;
    }
    const waveCrit = att.critNext;
    att.critNext = false;
    const pCrit = clamp01(getCritChance(att.snap, def.snap));
    let crit = fast || waveCrit || rCrit < pCrit;
    const stunned = att.stunned;
    if (stunned) {
      crit = false;
      att.stunned = false;
    }

    const entry = {
      q, side: att.side, type: 'attack',
      fast, windFast, waveCrit, stunned, crit,
      dodged: false, blocked: false,
      damage: 0, normal: 0, counter: getCounterMultiplier(att.snap.element, def.snap.element),
      burnApplied: false, stunApplied: false, immune: false,
      lifesteal: 0, heal: 0, dodgeHeal: 0, hunterActivated: false,
    };

    // --- Né ---
    const pDodge = clamp01(getDodgeChance(att.snap, def.snap));
    const dragonMult = (att.skill === 'dragonBlood' && crit) ? GROUP_SKILLS.dragonBlood.effectMultOnCrit : 1;

    if (rDodge < pDodge) {
      entry.dodged = true;
      if (def.el.healOnDodgePct) entry.dodgeHeal = heal(def, def.maxHp * def.el.healOnDodgePct);
      if (def.skill === 'waveRider' && GROUP_SKILLS.waveRider.critAfterDodge) def.critNext = true;
    } else if (def.shield > 0) {
      // --- Lá chắn Ánh sáng ---
      def.shield -= 1;
      entry.blocked = true;
    } else {
      // --- Trúng đòn ---
      const res = computeDamage(att.snap, def.snap, {
        crit,
        atkBonusPct: att.hunterActive ? GROUP_SKILLS.huntersInstinct.atkBonusPct : 0,
        defenderHpRatio: def.hp / def.maxHp,
      });
      entry.normal = res.normal;
      entry.damage = takeDamage(def, res.damage);

      if (att.el.burnPct) {
        if (tryApplyDebuff(def)) {
          const dmg = Math.round(def.maxHp * att.el.burnPct * dragonMult);
          // Bỏng không cộng dồn: làm mới số lượt, giữ mức sát thương cao hơn.
          def.burn = { turnsLeft: att.el.burnTurns, damage: Math.max(dmg, def.burn?.damage || 0) };
          entry.burnApplied = true;
        } else {
          entry.immune = true;
        }
      }
      if (att.el.stunOnCrit && crit) {
        if (tryApplyDebuff(def)) {
          def.stunned = true;
          entry.stunApplied = true;
        } else {
          entry.immune = true;
        }
      }
      if (att.el.lifestealPct) {
        entry.lifesteal = heal(att, res.damage * att.el.lifestealPct * dragonMult);
      }
    }

    // --- Hồi theo câu đúng (không phụ thuộc trúng/né) ---
    if (att.el.healOnCorrectPct) entry.heal += heal(att, att.maxHp * att.el.healOnCorrectPct * dragonMult);
    if (att.skill === 'wellFed' && att.streak >= GROUP_SKILLS.wellFed.streakMin) {
      entry.heal += heal(att, att.maxHp * GROUP_SKILLS.wellFed.healPct);
    }

    // --- Bản năng săn: bật sau khi đủ chuỗi, có hiệu lực từ đòn kế tiếp ---
    if (att.skill === 'huntersInstinct' && !att.hunterActive && att.streak >= GROUP_SKILLS.huntersInstinct.streakMin) {
      att.hunterActive = true;
      entry.hunterActivated = true;
    }

    entry.hp = hpNow();
    log.push(entry);
  }

  function tickBurn(f, q) {
    if (!f.burn || f.burn.turnsLeft <= 0) return;
    const dealt = takeDamage(f, f.burn.damage);
    f.burn.turnsLeft -= 1;
    if (f.burn.turnsLeft <= 0) f.burn = null;
    log.push({ q, side: f.side, type: 'burn', damage: dealt, hp: hpNow() });
  }

  for (let i = 0; i < n && !ended; i++) {
    const q = i + 1;
    const ansA = normalizeAnswer(answersA[i]);
    const ansB = normalizeAnswer(answersB[i]);

    A.tookDamageThisTurn = false;
    B.tookDamageThisTurn = false;

    // 1. Chấm câu trả lời & tích năng lượng, comboCount
    if (ansA.correct) {
      A.energy = Math.min(5, A.energy + 1);
      A.comboCount += 1;
    } else {
      A.comboCount = 0;
    }
    if (ansB.correct) {
      B.energy = Math.min(5, B.energy + 1);
      B.comboCount += 1;
    } else {
      B.comboCount = 0;
    }

    // 2. Đòn cơ bản
    const hpBeforeB = B.hp;
    attack(A, B, ansA, q);
    if (B.hp < hpBeforeB) B.tookDamageThisTurn = true;

    if (stopAtZero && (A.hp <= 0 || B.hp <= 0)) { ended = true; break; }

    const hpBeforeA = A.hp;
    attack(B, A, ansB, q);
    if (A.hp < hpBeforeA) A.tookDamageThisTurn = true;

    if (stopAtZero && (A.hp <= 0 || B.hp <= 0)) { ended = true; break; }

    // 3. Xét trigger cả 2 bên (v0.2) theo độ ưu tiên
    const triggerA = evaluateTrigger(A, B, ansA, q);
    const triggerB = evaluateTrigger(B, A, ansB, q);

    const skillQueue = [];
    if (triggerA) {
      applySkillActivation(A, triggerA.trigger);
      skillQueue.push(triggerA);
    }
    if (triggerB) {
      applySkillActivation(B, triggerB.trigger);
      skillQueue.push(triggerB);
    }

    // Sắp xếp hàng đợi kỹ năng theo ưu tiên trigger
    if (skillQueue.length > 1) {
      skillQueue.sort((x, y) => {
        const pX = TRIGGER_TYPES[x.trigger]?.priority ?? 99;
        const pY = TRIGGER_TYPES[y.trigger]?.priority ?? 99;
        return pX - pY;
      });
    }

    // 4. Thực thi hàng đợi kỹ năng lần lượt
    for (const sk of skillQueue) {
      const caster = sk.side === 'challenger' ? A : B;
      const target = sk.side === 'challenger' ? B : A;
      if (caster.hp <= 0) {
        // Pet đã hết HP thì huỷ mọi kỹ năng đang chờ (Luật chung số 4)
        sk.cancelled = true;
        continue;
      }
      executeSkillEffect(caster, target, sk);
      sk.hp = hpNow();
      log.push({ q, side: sk.side, type: 'skill', skill: sk, hp: hpNow() });
      if (stopAtZero && (A.hp <= 0 || B.hp <= 0)) {
        ended = true;
        break;
      }
    }

    if (ended) break;

    // Giảm hồi chiêu mỗi lượt
    if (A.cooldownTurns > 0) A.cooldownTurns -= 1;
    if (B.cooldownTurns > 0) B.cooldownTurns -= 1;

    tickBurn(A, q);
    tickBurn(B, q);
    if (stopAtZero && (A.hp <= 0 || B.hp <= 0)) ended = true;
  }

  const sumTime = (arr) => arr.reduce((s, a) => s + (normalizeAnswer(a).timeMs ?? 0), 0);
  const totalTimeA = sumTime(answersA);
  const totalTimeB = sumTime(answersB);

  // So % HP bằng phép nhân chéo để tránh sai số dấu phẩy động.
  const cmp = A.hp * B.maxHp - B.hp * A.maxHp;
  let winner;
  if (cmp > 0) winner = 'challenger';
  else if (cmp < 0) winner = 'opponent';
  else if (totalTimeA < totalTimeB) winner = 'challenger';
  else if (totalTimeB < totalTimeA) winner = 'opponent';
  else winner = 'draw';

  return {
    winner,
    challenger: {
      hp: A.hp,
      maxHp: A.maxHp,
      hpPct: A.hp / A.maxHp,
      totalTimeMs: totalTimeA,
      stats: A.stats,
      combo: A.streak,
      energy: A.energy,
    },
    opponent: {
      hp: B.hp,
      maxHp: B.maxHp,
      hpPct: B.hp / B.maxHp,
      totalTimeMs: totalTimeB,
      stats: B.stats,
      combo: B.streak,
      energy: B.energy,
    },
    questions: n,
    log,
  };
}

/** Ghép trận được không (chênh tối đa MATCH_MAX_STAGE_DIFF cấp). */
export function canMatch(stageA, stageB) {
  return Math.abs(clampStage(stageA) - clampStage(stageB)) <= BATTLE.MATCH_MAX_STAGE_DIFF;
}
