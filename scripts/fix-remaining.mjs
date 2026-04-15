import fs from 'fs';
let c = fs.readFileSync('src/data/vocab-topics.js','utf8');
const fixes = [
  ['Selfish', "Self (bản thân) + ish → chỉ nghĩ đến bản thân", "≈ self-centered, greedy. ↔️ selfless, generous"],
  ['Crab', "Crab → cua 🦀", "crab meat, crab cake, crab stick"],
  ['Grill', "Grill → nướng (trên vỉ). BBQ grill", "grilled, grilling, BBQ grill"],
  ['Pizza', "Pizza → pizza 🍕 (gốc Ý)", "pizza sauce, pizza dough, pepperoni pizza"],
  ['Toast', "Toast → nâng cốc/bánh mì nướng 🍞", "toaster, toasty, French toast"],
  ['Valentine', "Valentine → Ngày tình nhân 14/2 💝", "Valentine\\'s Day, valentine card"],
];
for (const [word, tip, rel] of fixes) {
  const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp("(word: '" + safeWord + "'[^}]*illustration: '[^']*')\\s*}", 'g');
  c = c.replace(re, (m, inner) => {
    if (inner.includes('memoryTip')) return m;
    return inner + ", memoryTip: '" + tip + "', related: '" + rel + "' }";
  });
}
fs.writeFileSync('src/data/vocab-topics.js', c);
console.log('Fixed remaining words');
