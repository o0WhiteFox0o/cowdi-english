/**
 * generate-pwa-icons.mjs
 * Sinh pwa-192x192.png và pwa-512x512.png từ SVG logo vào public/
 * Chạy: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const svgPath = join(root, 'public/assets/images/logo/MiniLogoCowdi.svg');

if (!existsSync(svgPath)) {
  console.error('❌ Không tìm thấy SVG:', svgPath);
  process.exit(1);
}

const svgBuffer = readFileSync(svgPath);

const sizes = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
];

for (const { size, name } of sizes) {
  const outPath = join(root, 'public', name);
  await sharp(svgBuffer)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 248, b: 240, alpha: 1 } })
    .png()
    .toFile(outPath);
  console.log(`✅ Đã tạo: public/${name} (${size}×${size})`);
}

console.log('\n🎉 PWA icons sẵn sàng!');
