import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  detectMediaImageType,
  readMediaManifest,
  writeMediaManifest,
} from './media.js';

test('detectMediaImageType: nhận diện đúng PNG, WebP, JPEG và từ chối file giả', () => {
  const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const webpBuf = Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
  const jpgBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const fakeBuf = Buffer.from('<svg>not allowed</svg>');

  assert.deepEqual(detectMediaImageType(pngBuf), { ext: '.png', mime: 'image/png' });
  assert.deepEqual(detectMediaImageType(webpBuf), { ext: '.webp', mime: 'image/webp' });
  assert.deepEqual(detectMediaImageType(jpgBuf), { ext: '.jpg', mime: 'image/jpeg' });
  assert.equal(detectMediaImageType(fakeBuf), null);
});

test('readMediaManifest & writeMediaManifest: ghi và đọc an toàn trong thư mục tạm', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cowdi-media-test-'));
  try {
    assert.deepEqual(await readMediaManifest(tmpDir), {});
    const sample = {
      'word:apple': {
        url: '/api/media/files/vocab/word_apple-12345678.webp/raw',
        category: 'vocab',
      },
    };
    await writeMediaManifest(tmpDir, sample);
    const loaded = await readMediaManifest(tmpDir);
    assert.deepEqual(loaded, sample);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
