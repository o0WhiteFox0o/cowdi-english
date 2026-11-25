// ============================================================
// Cowdi English — Server OG Landing cho thiệp mời GET /i/:code
// Theo SRS-FRIENDS v1.1 (FR-LND-01, FR-LND-02)
// Đọc dist/index.html 1 lần (cache bộ nhớ), thay thẻ og:* và twitter:*
// ============================================================

import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

// Tên hiển thị tiếng Việt / thương hiệu của các loài pet (fallback khi speciesId hợp lệ)
const PET_LABELS = {
  cowdi: 'Cowdi',
  bamboo: 'Bamboo',
  bun: 'Bánh Bao',
  paddy: 'Paddy',
  sprout: 'Sprout',
  mushroom: 'Nấm Rơm',
  radish: 'Củ Cải Trắng',
  ginseng: 'Ginseng',
  foxie: 'Foxie',
  leo: 'Leo',
  shadow: 'Shadow',
  pingu: 'Pingu',
  leafy: 'Leafy',
  flippy: 'Flippy',
  mimi: 'Mimi',
  owlbert: 'Owlbert',
  storm: 'Storm',
  sparky: 'Sparky',
  draco: 'Draco',
  pumpkin: 'Pumpkin',
  monk: 'Monk',
  prisma: 'Prisma',
  bamboo_spirit: 'Linh Trúc',
};

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getPetLabel(speciesId) {
  const key = String(speciesId || 'cowdi').trim().toLowerCase();
  return PET_LABELS[key] || 'Cowdi';
}

/**
 * Kiểm tra ảnh OG riêng 1200x630 tại public/image/og/<species>.png (dev)
 * hoặc image/og/<species>.png (production dist giải nén ở root).
 */
export function resolveOgImage(speciesId, siteOrigin, ogDirs) {
  const safeSpecies = String(speciesId || 'cowdi')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');
  const dirs = ogDirs || [
    path.join(repoRoot, 'public', 'image', 'og'),
    path.join(repoRoot, 'image', 'og'),
  ];

  for (const dir of dirs) {
    if (safeSpecies && fs.existsSync(path.join(dir, `${safeSpecies}.png`))) {
      return {
        url: `${siteOrigin}/image/og/${safeSpecies}.png`,
        width: '1200',
        height: '630',
      };
    }
  }

  return {
    url: `${siteOrigin}/pwa-512x512.png`,
    width: '512',
    height: '512',
  };
}

function replaceMetaTag(html, attrName, attrVal, newContent) {
  const escapedContent = escapeHtml(newContent);
  const re = new RegExp(
    `<meta\\s+${attrName}=["']${attrVal.replace(/[:.]/g, '\\$&')}["']\\s+content=["'][^"']*["']\\s*\\/?>`,
    'i'
  );
  const tag = `<meta ${attrName}="${attrVal}" content="${escapedContent}" />`;
  if (re.test(html)) {
    return html.replace(re, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

/**
 * Thay các thẻ Open Graph / Twitter / <title> trong HTML gốc cho 1 thiệp hợp lệ.
 */
export function injectInviteOg(baseHtml, { code, senderName, petSpecies, message, siteOrigin, ogDirs }) {
  const safeSender = String(senderName || 'Một người bạn').trim().slice(0, 32) || 'Một người bạn';
  const petName = getPetLabel(petSpecies);
  const title = `${safeSender} tặng bạn một quả trứng ${petName}`;
  const cleanMsg = message ? String(message).trim().slice(0, 140) : '';
  const description = cleanMsg
    ? `"${cleanMsg}" — Vào Cowdi English nhận trứng ${petName} và học tiếng Anh cùng nhau!`
    : `Vào Cowdi English nhận trứng ${petName} miễn phí và học tiếng Anh cùng ${safeSender} mỗi ngày!`;

  const origin = String(siteOrigin || 'https://cowdi.net').replace(/\/+$/, '');
  const canonicalUrl = `${origin}/i/${encodeURIComponent(code)}`;
  const image = resolveOgImage(petSpecies, origin, ogDirs);

  let html = baseHtml;
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)} | Cowdi English</title>`);
  html = replaceMetaTag(html, 'property', 'og:title', title);
  html = replaceMetaTag(html, 'property', 'og:description', description);
  html = replaceMetaTag(html, 'property', 'og:image', image.url);
  html = replaceMetaTag(html, 'property', 'og:image:width', image.width);
  html = replaceMetaTag(html, 'property', 'og:image:height', image.height);
  html = replaceMetaTag(html, 'property', 'og:url', canonicalUrl);
  html = replaceMetaTag(html, 'name', 'twitter:title', title);
  html = replaceMetaTag(html, 'name', 'twitter:description', description);
  html = replaceMetaTag(html, 'name', 'twitter:image', image.url);
  return html;
}

function loadIndexHtmlTemplate(explicitPath) {
  const candidates = [
    explicitPath,
    process.env.INDEX_HTML_PATH,
    path.join(repoRoot, 'dist-prod', 'index.html'),
    path.join(repoRoot, 'dist', 'index.html'),
    path.join(repoRoot, 'index.html'),
  ].filter(Boolean);

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf8');
      }
    } catch { /* try next candidate */ }
  }
  return '<!doctype html><html lang="vi"><head><meta charset="UTF-8" /><title>Cowdi English</title></head><body><div id="root"></div></body></html>';
}

export function createInviteLandingRouter({ db = pool, indexHtmlPath, ogDirs } = {}) {
  const router = express.Router();
  let cachedHtml = null;

  function getTemplate() {
    if (cachedHtml === null) {
      cachedHtml = loadIndexHtmlTemplate(indexHtmlPath);
    }
    return cachedHtml;
  }

  router.get('/:code', async (req, res) => {
    const baseHtml = getTemplate();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');

    const rawCode = String(req.params.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    if (!rawCode) {
      return res.status(200).send(baseHtml);
    }

    try {
      const [[row]] = await db.execute(
        `SELECT i.code, i.sender_name, i.pet_species, i.message, i.expires_at,
                u.nickname AS sender_nickname, u.display_name AS sender_display_name
           FROM invites i
           LEFT JOIN users u ON u.id = i.sender_id
          WHERE i.code = ?`,
        [rawCode]
      );

      // FR-LND-02: Mã không tồn tại hoặc hết hạn -> trả OG chung, không lỗi
      if (!row || (row.expires_at && new Date(row.expires_at) < new Date())) {
        return res.status(200).send(baseHtml);
      }

      const siteOrigin = (process.env.FRONTEND_URL || `${req.protocol}://${req.get('host') || 'cowdi.net'}`).replace(/\/+$/, '');
      const senderName = row.sender_nickname || row.sender_display_name || row.sender_name || 'Một người bạn';

      const html = injectInviteOg(baseHtml, {
        code: row.code,
        senderName,
        petSpecies: row.pet_species || 'cowdi',
        message: row.message || null,
        siteOrigin,
        ogDirs,
      });
      return res.status(200).send(html);
    } catch (err) {
      console.error('GET /i/:code OG render error:', err.message);
      return res.status(200).send(baseHtml);
    }
  });

  return router;
}

export default createInviteLandingRouter;
