// ============================================================
// Cowdi English — Tests Bước 2: OG riêng cho /i/:code & QR client (FR-LND)
// ============================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

import {
  escapeHtml,
  injectInviteOg,
  resolveOgImage,
  createInviteLandingRouter,
} from '../routes/inviteLanding.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const SAMPLE_HTML = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

async function withServer(router, fn) {
  const app = express();
  app.use('/i', router);
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

describe('Bước 2 — OG thẻ mời /i/:code & QR tại client (FR-LND)', () => {
  it('1. injectInviteOg chèn đúng og:title, og:description, og:image, og:url và escape XSS', () => {
    const html = injectInviteOg(SAMPLE_HTML, {
      code: 'ABCD2345',
      senderName: '<script>"Mai"</script>',
      petSpecies: 'foxie',
      message: 'Học cùng <b>mình</b> nha!',
      siteOrigin: 'https://cowdi.net',
      ogDirs: [],
    });

    assert.ok(html.includes('og:title" content="&lt;script&gt;&quot;Mai&quot;&lt;/script&gt; tặng bạn một quả trứng Foxie"'));
    assert.ok(html.includes('og:url" content="https://cowdi.net/i/ABCD2345"'));
    assert.ok(html.includes('og:image" content="https://cowdi.net/pwa-512x512.png"'));
    assert.equal(html.includes('<script>"Mai"</script>'), false, 'Không được chèn thẻ script chưa escape');
    assert.equal(escapeHtml(`a&b<c>"d"'e'`), 'a&amp;b&lt;c&gt;&quot;d&quot;&#39;e&#39;');
  });

  it('2. resolveOgImage dùng public/image/og/<species>.png 1200x630 nếu tồn tại', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cowdi-og-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'cowdi.png'), 'fake-png');
      const found = resolveOgImage('cowdi', 'https://cowdi.net', [tmpDir]);
      assert.deepEqual(found, {
        url: 'https://cowdi.net/image/og/cowdi.png',
        width: '1200',
        height: '630',
      });

      const missing = resolveOgImage('draco', 'https://cowdi.net', [tmpDir]);
      assert.equal(missing.url, 'https://cowdi.net/pwa-512x512.png');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('3. Express GET /i/:code trả OG riêng khi hợp lệ và OG chung khi hết hạn / không tồn tại', async () => {
    const fakeDb = {
      async execute(_sql, [code]) {
        if (code === 'LIVE2345') {
          return [[{
            code: 'LIVE2345',
            sender_name: 'Tên Google Cũ',
            sender_nickname: 'Minh Anh',
            pet_species: 'cowdi',
            message: 'Nuôi bò cùng mình!',
            expires_at: new Date(Date.now() + 86400000).toISOString(),
          }]];
        }
        if (code === 'EXPD2345') {
          return [[{
            code: 'EXPD2345',
            sender_name: 'Ai đó',
            sender_nickname: 'Hết Hạn',
            pet_species: 'cowdi',
            message: null,
            expires_at: new Date(Date.now() - 86400000).toISOString(),
          }]];
        }
        return [[]];
      },
    };

    const router = createInviteLandingRouter({
      db: fakeDb,
      indexHtmlPath: path.join(repoRoot, 'index.html'),
      ogDirs: [],
    });

    await withServer(router, async (base) => {
      // Thiệp hợp lệ -> ưu tiên sender_nickname, không lộ sender_name Google
      const okRes = await fetch(`${base}/i/live2345`);
      assert.equal(okRes.status, 200);
      const okHtml = await okRes.text();
      assert.ok(okHtml.includes('Minh Anh tặng bạn một quả trứng Cowdi'));
      assert.equal(okHtml.includes('Tên Google Cũ'), false);

      // Thiệp hết hạn -> trả OG chung, HTTP 200
      const expRes = await fetch(`${base}/i/expd2345`);
      assert.equal(expRes.status, 200);
      const expHtml = await expRes.text();
      assert.equal(expHtml.includes('Hết Hạn tặng bạn'), false);

      // Mã không tồn tại -> trả OG chung, HTTP 200
      const missRes = await fetch(`${base}/i/NOPE9999`);
      assert.equal(missRes.status, 200);
      const missHtml = await missRes.text();
      assert.ok(missHtml.includes('Cowdi'));
    });
  });

  it('4. FR-LND-04: InviteSheet.jsx không còn phụ thuộc api.qrserver.com', () => {
    const sheetSrc = fs.readFileSync(path.join(repoRoot, 'src/features/invite/InviteSheet.jsx'), 'utf8');
    assert.equal(sheetSrc.includes('api.qrserver.com'), false, 'Phải bỏ dịch vụ QR bên ngoài');
    assert.ok(sheetSrc.includes('generateQrDataUrl'), 'Phải dùng generateQrDataUrl phía client');
  });
});
