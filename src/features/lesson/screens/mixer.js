/**
 * Bộ trộn 6 màn thuần JS (STD-SCREEN-SYSTEM v1.0 §3, GEMINI-SCREEN-SYSTEM-PHASE1 §4).
 * Không import React, không đọc localStorage, không dùng Math.random().
 */

import { SCREEN_CATALOG } from './catalog.js';
import { SCREEN_CONFIG } from '../../../data/config/screens.js';
import { mulberry32, seededShuffle } from './seededRandom.js';

const SKILL_SLOTS = ['listen', 'speak', 'read', 'write'];

/**
 * Xáo thứ tự 4 kỹ năng giữa ổn định theo `seed` (đảm bảo vị trí đầu !== 'speak').
 * Nếu truyền `avoidOrder` (thứ tự 4 màn giữa của ải liền trước) và bị trùng → xoay ổn định sang thứ tự khác.
 */
export function computeMiddleOrder(seed, avoidOrder = null) {
  const rng = mulberry32(seed);
  const middle = seededShuffle(SKILL_SLOTS, rng);
  if (middle[0] === 'speak') {
    const swapIdx = 1 + Math.floor(rng() * 3);
    [middle[0], middle[swapIdx]] = [middle[swapIdx], middle[0]];
  }
  if (Array.isArray(avoidOrder) && avoidOrder.length === middle.length && avoidOrder.join(',') === middle.join(',')) {
    // Xoay ổn định 3 vị trí cuối (hoặc đổi vị trí 1 & 2) để luôn khác ải liền trước mà vẫn giữ middle[0] !== 'speak'
    [middle[1], middle[2], middle[3]] = [middle[2], middle[3], middle[1]];
    if (avoidOrder.join(',') === middle.join(',')) {
      [middle[1], middle[2]] = [middle[2], middle[1]];
    }
  }
  return middle;
}

function pickWeighted(candidates, weightsForGroup, rng) {
  if (candidates.length === 1) return candidates[0];
  const weights = candidates.map((c) => {
    const w = weightsForGroup?.[c.level];
    return typeof w === 'number' && w > 0 ? w : 0;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) {
    return candidates[Math.floor(rng() * candidates.length)];
  }
  let r = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r < 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

function getEligible(registry, slot, lesson, statusMap, isTester) {
  const allowedStatuses = isTester ? new Set(['on', 'test']) : new Set(['on']);
  const out = [];
  const reasons = [];
  for (const s of registry) {
    if (s.slot !== slot) continue;
    const st = statusMap?.[s.code] ?? 'off';
    if (!allowedStatuses.has(st)) {
      reasons.push(`${s.code}: status=${st}`);
      continue;
    }
    const check = typeof s.canRun === 'function' ? s.canRun(lesson) : { ok: true, missing: [] };
    if (!check?.ok) {
      reasons.push(`${s.code}: thiếu ${(check?.missing || []).join(', ')}`);
      continue;
    }
    out.push(s);
  }
  return { eligible: out, reasons };
}

/**
 * Trộn 6 màn cho 1 bài học.
 * @returns {{ screens: Array<{ slot: string, code: string, level: string }>, order: string[], skipped: string[], log: string[] }}
 */
export function mixLesson({
  lesson,
  group = 'intermediate',
  lastMix = {},
  config = SCREEN_CONFIG,
  isTester = false,
  registry = SCREEN_CATALOG,
  seed = 1,
  avoidOrder = null,
}) {
  const rng = mulberry32(seed);
  const log = [];
  const statusMap = config?.status || SCREEN_CONFIG.status;
  const weightsForGroup = config?.weights?.[group] || SCREEN_CONFIG.weights[group] || { friendly: 0.5, focus: 0.5 };

  // Bước 1: Hoán vị 4 kỹ năng giữa ổn định theo seed (tránh trùng ải liền trước nếu truyền avoidOrder)
  const middle = computeMiddleOrder(seed, avoidOrder);
  // Tiêu thụ 1 nhịp rng tương đương trước đây để giữ phân phối trọng số ổn định
  rng();
  if (Array.isArray(avoidOrder) && avoidOrder.length === 4) {
    log.push(`order: xáo ổn định theo seed (tránh trùng [${avoidOrder.join(',')}]) → [${middle.join(',')}]`);
  }
  const initialOrder = ['intro', ...middle, 'boss'];

  // Bước 2: Chọn ứng viên từng slot
  const chosenBySlot = new Map();
  const candidatesBySlot = new Map();
  const skipped = [];

  for (const slot of initialOrder) {
    // Ràng buộc nhóm exam: Màn 6 luôn T-07 (STD 3.3)
    if (slot === 'boss' && group === 'exam') {
      const t07 = registry.find((s) => s.code === 'T-07') || { code: 'T-07', level: 'focus', slot: 'boss' };
      chosenBySlot.set(slot, t07);
      candidatesBySlot.set(slot, [t07]);
      log.push('boss: nhóm exam ép chọn T-07');
      continue;
    }

    const { eligible, reasons } = getEligible(registry, slot, lesson, statusMap, isTester);
    let pool = eligible;
    if (pool.length > 1 && lastMix?.[slot]) {
      const filtered = pool.filter((c) => c.code !== lastMix[slot]);
      if (filtered.length > 0) {
        pool = filtered;
        log.push(`${slot}: tránh lặp lastMix[${slot}]=${lastMix[slot]}`);
      }
    }

    if (pool.length === 0) {
      if (slot === 'intro' || slot === 'boss') {
        const fallbackCode = slot === 'intro' ? 'T-01' : 'T-07';
        const fb = registry.find((s) => s.code === fallbackCode) || { code: fallbackCode, level: 'focus', slot };
        chosenBySlot.set(slot, fb);
        candidatesBySlot.set(slot, [fb]);
        log.push(`${slot}: fallback ${fallbackCode} (${reasons.join('; ') || 'không có ứng viên'})`);
      } else {
        skipped.push(slot);
        log.push(`${slot}: skip: ${reasons.join('; ') || 'không còn ứng viên'}`);
      }
      continue;
    }

    candidatesBySlot.set(slot, pool);
    const picked = pickWeighted(pool, weightsForGroup, rng);
    chosenBySlot.set(slot, picked);
    log.push(`${slot}: chọn ${picked.code} (${picked.level}) từ [${pool.map((p) => p.code).join(', ')}]`);
  }

  // Bước 3: Ràng buộc nhóm intermediate — các màn giữa có >= 1 friendly và >= 1 focus (khi có slot đủ ứng viên mức thiếu)
  const activeMiddleSlots = middle.filter((sl) => chosenBySlot.has(sl));
  if (group === 'intermediate' && activeMiddleSlots.length >= 2) {
    for (const requiredLevel of ['friendly', 'focus']) {
      const hasLevel = activeMiddleSlots.some((sl) => chosenBySlot.get(sl)?.level === requiredLevel);
      if (hasLevel) continue;

      // Tìm các slot có ứng viên thuộc mức thiếu, ưu tiên slot có nhiều ứng viên nhất
      const eligibleSlots = activeMiddleSlots
        .map((sl) => {
          const allPool = candidatesBySlot.get(sl) || [];
          const levelPool = allPool.filter((c) => c.level === requiredLevel);
          return { sl, totalCount: allPool.length, levelPool };
        })
        .filter((x) => x.levelPool.length > 0)
        .sort((a, b) => b.totalCount - a.totalCount);

      if (eligibleSlots.length > 0) {
        const target = eligibleSlots[0];
        const forced = target.levelPool[Math.floor(rng() * target.levelPool.length)];
        const prev = chosenBySlot.get(target.sl);
        chosenBySlot.set(target.sl, forced);
        log.push(`intermediate: ép ${target.sl} từ ${prev?.code} → ${forced.code} để đủ ≥1 ${requiredLevel}`);
      } else {
        log.push(`intermediate: bỏ qua ràng buộc ≥1 ${requiredLevel} (chưa có ứng viên ${requiredLevel} ở màn giữa)`);
      }
    }
  }

  // Bước 4: Xây thứ tự cuối cùng; sau khi bỏ slot, nếu order[1] trở thành 'speak' → đổi với slot kỹ năng kế tiếp
  const finalMiddle = [...activeMiddleSlots];
  if (finalMiddle.length >= 2 && finalMiddle[0] === 'speak') {
    [finalMiddle[0], finalMiddle[1]] = [finalMiddle[1], finalMiddle[0]];
    log.push(`order: sau khi skip, đổi chỗ speak từ vị trí 2 sang vị trí 3 (${finalMiddle[0]})`);
  }

  const finalOrder = ['intro', ...finalMiddle, 'boss'];
  const screens = finalOrder.map((slot) => {
    const picked = chosenBySlot.get(slot);
    return { slot, code: picked.code, level: picked.level };
  });

  return { screens, order: finalOrder, skipped, log };
}
