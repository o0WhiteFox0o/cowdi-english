/**
 * Pure logic cho F-07 Nghe đếm số lượng / Chợ nổi (PHASE4 §2 F-07, test Q4).
 * - Chuyển danh từ số ít sang số nhiều (bất quy tắc + quy tắc -es / -ies / -s).
 * - Sinh 4 giỏ luôn khác nhau, đúng 1 giỏ đúng (1 đúng, 1 sai số lượng, 1 sai món, 1 sai cả hai).
 */

const IRREGULAR_PLURALS = {
  child: 'children',
  person: 'people',
  man: 'men',
  woman: 'women',
  tooth: 'teeth',
  foot: 'feet',
  mouse: 'mice',
  goose: 'geese',
  fish: 'fish',
  sheep: 'sheep',
  deer: 'deer',
  knife: 'knives',
  leaf: 'leaves',
  wolf: 'wolves',
  scarf: 'scarves',
  loaf: 'loaves',
  wife: 'wives',
  life: 'lives',
  shelf: 'shelves',
  tomato: 'tomatoes',
  potato: 'potatoes',
  mango: 'mangoes',
  hero: 'heroes',
  ox: 'oxen',
};

const NUM_WORDS = {
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
};

export function pluralizeNoun(word, explicitPlural = '') {
  if (explicitPlural && String(explicitPlural).trim()) {
    return String(explicitPlural).trim();
  }
  const raw = String(word || '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (IRREGULAR_PLURALS[lower]) return IRREGULAR_PLURALS[lower];

  // Cụm 2 từ (vd "living room") → đổi từ cuối
  if (lower.includes(' ')) {
    const parts = lower.split(/\s+/);
    const last = parts.pop();
    return [...parts, pluralizeNoun(last)].join(' ');
  }

  // Phụ âm + y → ies (library -> libraries, baby -> babies)
  if (/[^aeiou]y$/i.test(lower)) {
    return `${lower.slice(0, -1)}ies`;
  }
  // s, sh, ch, x, z → es
  if (/(s|sh|ch|x|z)$/i.test(lower)) {
    return `${lower}es`;
  }
  return `${lower}s`;
}

export function extractMarketItems(lesson) {
  const vocab = Array.isArray(lesson?.vocabulary) ? lesson.vocabulary : [];
  return vocab.filter((v) => {
    if (!v?.word || !(v.image || v.illustration)) return false;
    if (v.countable === false) return false;
    const isMarkedCountable = v.countable === true || Boolean(v.plural);
    return isMarkedCountable;
  });
}

export function canRunF07(lesson) {
  const items = extractMarketItems(lesson);
  return items.length >= 4
    ? { ok: true, missing: [] }
    : { ok: false, missing: ['≥ 4 danh từ đếm được có hình/emoji & số nhiều'] };
}

export function buildMarketOrderSentence(item, count) {
  const n = Math.max(1, Math.min(5, Number(count) || 1));
  const wordLower = String(item?.word || '').trim().toLowerCase();
  if (n === 1) {
    return `One ${wordLower}, please.`;
  }
  const plural = pluralizeNoun(wordLower, item?.plural);
  return `${NUM_WORDS[n] || n} ${plural}, please.`;
}

/**
 * Sinh đúng 4 giỏ khác nhau hoàn toàn:
 * - 1 giỏ đúng (đúng món + đúng số lượng)
 * - 1 giỏ sai số lượng (đúng món + sai số lượng)
 * - 1 giỏ sai món (sai món + đúng số lượng)
 * - 1 giỏ sai cả hai (sai món + sai số lượng)
 */
export function buildMarketBaskets(targetItem, targetCount, pool, maxCount = 5, rng = Math.random) {
  const others = pool.filter((p) => String(p.word).toLowerCase() !== String(targetItem.word).toLowerCase());
  const otherItem = others.length > 0
    ? others[Math.floor(rng() * others.length)]
    : { word: 'apple', meaning: 'quả táo', illustration: '🍎', plural: 'apples' };

  const countChoices = [];
  for (let n = 1; n <= Math.max(2, maxCount); n++) {
    if (n !== targetCount) countChoices.push(n);
  }
  const otherCount = countChoices[Math.floor(rng() * countChoices.length)] || (targetCount === 1 ? 2 : 1);

  const baskets = [
    { id: 'b-ok',   item: targetItem, count: targetCount, isCorrect: true,  kind: 'correct' },
    { id: 'b-qty',  item: targetItem, count: otherCount,  isCorrect: false, kind: 'wrong_qty' },
    { id: 'b-item', item: otherItem,  count: targetCount, isCorrect: false, kind: 'wrong_item' },
    { id: 'b-both', item: otherItem,  count: otherCount,  isCorrect: false, kind: 'wrong_both' },
  ];

  for (let i = baskets.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [baskets[i], baskets[j]] = [baskets[j], baskets[i]];
  }
  return baskets;
}
