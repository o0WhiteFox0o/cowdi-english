/**
 * Chọn câu dẫn không lặp trong 10 ải gần nhất (STD-SCREEN-SYSTEM §4.2, PHASE3 §4.2).
 */

import { mulberry32 } from './seededRandom.js';

const VAR_RE = /\{(\w+)\}/g;

export function interpolateIntro(template, vars = {}) {
  if (!template) return null;
  const needed = [...template.matchAll(VAR_RE)].map((m) => m[1]);
  for (const k of needed) {
    if (vars[k] == null || String(vars[k]).trim() === '') return null;
  }
  return template.replace(VAR_RE, (_, k) => String(vars[k]).trim());
}

/**
 * Chọn 1 câu dẫn approved cho (screenCode, region) không lặp trong 10 ải gần nhất.
 * Ưu tiên đúng vùng hơn `*`. Hết câu mới → chọn câu dùng lâu nhất.
 */
export function selectScreenIntro({
  intros = [],
  screenCode,
  region,
  recentIntros = [],
  vars = {},
  seed = 1,
}) {
  const recent10 = (Array.isArray(recentIntros) ? recentIntros : []).slice(-10);
  // Ghi vị trí gần nhất mỗi id xuất hiện (index càng nhỏ = dùng càng lâu)
  const lastUsedIdx = new Map();
  recent10.forEach((entry, idx) => {
    for (const id of entry?.ids || []) {
      lastUsedIdx.set(id, idx);
    }
  });

  const valid = (Array.isArray(intros) ? intros : [])
    .filter((item) => {
      if (!item || item.status !== 'approved') return false;
      if (item.screen_code !== screenCode && item.screenCode !== screenCode) return false;
      const r = item.region;
      if (r !== region && r !== '*') return false;
      return interpolateIntro(item.text_vi ?? item.textVi, vars) !== null;
    });

  if (valid.length === 0) return null;

  const rng = mulberry32(seed);
  const pickOne = (list) => list[Math.floor(rng() * list.length)];

  const unusedExact = valid.filter((it) => it.region === region && !lastUsedIdx.has(it.id));
  const unusedWild = valid.filter((it) => it.region === '*' && !lastUsedIdx.has(it.id));

  let chosen = null;
  if (unusedExact.length > 0) {
    chosen = pickOne(unusedExact);
  } else if (unusedWild.length > 0) {
    chosen = pickOne(unusedWild);
  } else {
    // Hết câu chưa dùng → lấy câu dùng lâu nhất (ưu tiên đúng vùng nếu cùng độ cũ)
    const sorted = [...valid].sort((a, b) => {
      const idxA = lastUsedIdx.has(a.id) ? lastUsedIdx.get(a.id) : -1;
      const idxB = lastUsedIdx.has(b.id) ? lastUsedIdx.get(b.id) : -1;
      if (idxA !== idxB) return idxA - idxB;
      return (a.region === region ? 0 : 1) - (b.region === region ? 0 : 1);
    });
    chosen = sorted[0];
  }

  return {
    id: chosen.id,
    text: interpolateIntro(chosen.text_vi ?? chosen.textVi, vars),
    audioUrl: chosen.audio_url ?? chosen.audioUrl ?? null,
    region: chosen.region,
  };
}
