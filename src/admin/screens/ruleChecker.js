/**
 * Kiểm tra 7 luật trộn & mô phỏng 1.000 lần cho Tab Trộn thử (GEMINI-SCREEN-SYSTEM-PHASE2 §3.3).
 */

import { mixLesson } from '../../features/lesson/screens/mixer.js';
import { SCREEN_CATALOG } from '../../features/lesson/screens/catalog.js';

export function checkMixRules({ result, lesson, group, lastMix = {}, config, isTester = false, registry = SCREEN_CATALOG }) {
  const screens = result?.screens || [];
  const allowed = isTester ? new Set(['on', 'test']) : new Set(['on']);
  const statusMap = config?.status || {};

  // 1) Màn đầu là Gặp từ (intro)
  const r1 = screens.length > 0 && screens[0].slot === 'intro';

  // 2) Màn cuối là Boss
  const r2 = screens.length > 0 && screens[screens.length - 1].slot === 'boss';

  // 3) Mỗi kỹ năng có trong bài xuất hiện đúng 1 lần
  const midSlots = screens.slice(1, -1).map((s) => s.slot);
  const r3 = new Set(midSlots).size === midSlots.length;

  // 4) Màn 2 không là Nói (speak) — trừ trường hợp hiếm bài chỉ có 1 màn giữa duy nhất là speak
  const r4 = screens.length < 3 || midSlots.length <= 1 || screens[1].slot !== 'speak';

  // 5) Không lặp lastMix khi slot có >= 2 ứng viên hợp lệ
  let r5 = true;
  for (const s of screens) {
    if (s.slot === 'boss' && group === 'exam') continue;
    if (!lastMix?.[s.slot]) continue;
    const eligible = registry.filter((m) =>
      m.slot === s.slot &&
      allowed.has(statusMap[m.code] ?? 'off') &&
      (typeof m.canRun !== 'function' || m.canRun(lesson).ok),
    );
    if (eligible.length >= 2 && s.code === lastMix[s.slot]) {
      r5 = false;
      break;
    }
  }

  // 6) Ràng buộc nhóm (exam → boss = T-07; intermediate → >=1 focus & >=1 friendly nếu có ứng viên cả 2 mức)
  let r6 = true;
  if (group === 'exam') {
    r6 = screens.length > 0 && screens[screens.length - 1].code === 'T-07';
  } else if (group === 'intermediate' && midSlots.length >= 2) {
    const midEligible = registry.filter((m) =>
      midSlots.includes(m.slot) &&
      allowed.has(statusMap[m.code] ?? 'off') &&
      (typeof m.canRun !== 'function' || m.canRun(lesson).ok),
    );
    const hasFriendlyPool = midEligible.some((m) => m.level === 'friendly');
    const hasFocusPool = midEligible.some((m) => m.level === 'focus');
    const midPicked = screens.slice(1, -1);
    if (hasFriendlyPool && !midPicked.some((s) => s.level === 'friendly')) r6 = false;
    if (hasFocusPool && !midPicked.some((s) => s.level === 'focus')) r6 = false;
  }

  // 7) Không có màn trạng thái 'test' khi isTester = false
  const r7 = isTester || screens.every((s) => (statusMap[s.code] ?? 'off') !== 'test');

  return [
    { id: 1, label: 'Màn đầu là Gặp từ (intro)', ok: r1 },
    { id: 2, label: 'Màn cuối là Boss', ok: r2 },
    { id: 3, label: 'Mỗi kỹ năng có trong bài xuất hiện đúng 1 lần', ok: r3 },
    { id: 4, label: 'Màn 2 không phải Nói (speak)', ok: r4 },
    { id: 5, label: 'Không lặp lastMix khi có ≥ 2 lựa chọn', ok: r5 },
    { id: 6, label: 'Thỏa ràng buộc nhóm học (STD §3.3)', ok: r6 },
    { id: 7, label: 'Không chọn màn test khi isTester = false', ok: r7 },
  ];
}

export function simulate1000({ lesson, group, lastMix = {}, config, isTester = false, registry = SCREEN_CATALOG, runs = 1000 }) {
  const slotCodeCounts = {}; // { slot: { code: count } }
  const posSkillCounts = { 2: {}, 3: {}, 4: {}, 5: {} };
  let violations = 0;

  for (let i = 1; i <= runs; i++) {
    const res = mixLesson({ lesson, group, lastMix, config, isTester, registry, seed: i * 97 + 13 });
    const checks = checkMixRules({ result: res, lesson, group, lastMix, config, isTester, registry });
    if (checks.some((c) => !c.ok)) violations++;

    res.screens.forEach((sc, idx) => {
      if (!slotCodeCounts[sc.slot]) slotCodeCounts[sc.slot] = {};
      slotCodeCounts[sc.slot][sc.code] = (slotCodeCounts[sc.slot][sc.code] || 0) + 1;
      const pos = idx + 1;
      if (pos >= 2 && pos <= 5) {
        posSkillCounts[pos][sc.slot] = (posSkillCounts[pos][sc.slot] || 0) + 1;
      }
    });
  }

  return { runs, violations, slotCodeCounts, posSkillCounts };
}
