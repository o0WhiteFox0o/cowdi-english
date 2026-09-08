// Inventory emoji usage in src/. Usage: node scripts/emoji-inventory.mjs [--files]
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const RE = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu;
const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(jsx?|css)$/.test(n)) files.push(p);
  }
})('src');

const counts = new Map();
const perFile = new Map();
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const m = src.match(RE) || [];
  if (!m.length) continue;
  perFile.set(f, m.length);
  for (const e of m) counts.set(e, (counts.get(e) || 0) + 1);
}
if (process.argv.includes('--files')) {
  for (const [f, c] of [...perFile].sort((a, b) => b[1] - a[1])) console.log(String(c).padStart(4), f);
} else {
  for (const [e, c] of [...counts].sort((a, b) => b[1] - a[1])) console.log(String(c).padStart(4), e, [...e].map((ch) => ch.codePointAt(0).toString(16)).join(' '));
}
console.log(`\n${counts.size} distinct emoji, ${[...counts.values()].reduce((a, b) => a + b, 0)} occurrences, ${perFile.size} files`);
