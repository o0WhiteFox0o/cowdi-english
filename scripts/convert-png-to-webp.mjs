// Convert all .png files in the project (excluding node_modules, dist*, .git)
// to .webp using sharp. Deletes the original .png after a successful conversion.
// Usage:
//   node scripts/convert-png-to-webp.mjs            # convert + delete PNG
//   node scripts/convert-png-to-webp.mjs --keep     # keep the original PNG
//   node scripts/convert-png-to-webp.mjs --dry      # list only, no writes

import { readdir, stat, unlink, access } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const EXCLUDES = new Set(['node_modules', '.git', 'dist', 'dist-prod', 'build', '.next', '.cache']);

const args = process.argv.slice(2);
const KEEP = args.includes('--keep');
const DRY = args.includes('--dry');
const QUALITY = 85;

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.') continue;
    if (EXCLUDES.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.isFile() && extname(e.name).toLowerCase() === '.png') out.push(p);
  }
  return out;
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const files = await walk(ROOT);
console.log(`Found ${files.length} PNG file(s).`);
if (DRY) {
  for (const f of files) console.log('  ', f);
  process.exit(0);
}

let okCount = 0;
let skipCount = 0;
let failCount = 0;
let totalIn = 0;
let totalOut = 0;

for (const src of files) {
  const dst = src.slice(0, -4) + '.webp';
  try {
    if (await exists(dst)) {
      console.log(`SKIP (webp exists): ${src}`);
      skipCount++;
      continue;
    }
    const inStat = await stat(src);
    await sharp(src).webp({ quality: QUALITY }).toFile(dst);
    const outStat = await stat(dst);
    totalIn += inStat.size;
    totalOut += outStat.size;
    okCount++;
    const saved = inStat.size - outStat.size;
    const pct = ((saved / inStat.size) * 100).toFixed(1);
    console.log(`OK   ${src} -> ${fmt(inStat.size)} -> ${fmt(outStat.size)} (-${pct}%)`);
    if (!KEEP) await unlink(src);
  } catch (err) {
    failCount++;
    console.error(`FAIL ${src}: ${err.message}`);
  }
}

console.log('---');
console.log(`Converted: ${okCount}, Skipped: ${skipCount}, Failed: ${failCount}`);
if (okCount > 0) {
  const saved = totalIn - totalOut;
  const pct = totalIn > 0 ? ((saved / totalIn) * 100).toFixed(1) : '0';
  console.log(`Total size: ${fmt(totalIn)} -> ${fmt(totalOut)} (saved ${fmt(saved)}, -${pct}%)`);
}
console.log(KEEP ? '(kept original PNG files)' : '(original PNG files deleted)');
