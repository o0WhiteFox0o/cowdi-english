// ============================================================
//  Pet Facing Store — Lưu & đọc cấu hình hướng xoay gốc (facing.json)
//  Nằm trong thư mục storage/pets/facing.json (an toàn, không cần ALTER TABLE).
// ============================================================

import fs from 'node:fs/promises';
import path from 'node:path';
import { isValidNativeFacing } from '../../shared/pet-facing.js';

const FACING_FILENAME = 'facing.json';

export async function readFacingMap(storageDir) {
  const filePath = path.join(storageDir, FACING_FILENAME);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const clean = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (!/^[a-z][a-z0-9_]{1,31}\/c[1-5]$/.test(key)) continue;
      if (!val || typeof val !== 'object') continue;
      if (!isValidNativeFacing(val.nativeFacing)) continue;
      clean[key] = {
        nativeFacing: val.nativeFacing,
        facingVerified: Boolean(val.facingVerified),
        updatedAt: val.updatedAt || null,
        updatedBy: val.updatedBy ?? null,
      };
    }
    return clean;
  } catch (err) {
    if (err?.code === 'ENOENT') return {};
    return {};
  }
}

export async function writeFacingMap(storageDir, map) {
  await fs.mkdir(storageDir, { recursive: true });
  const filePath = path.join(storageDir, FACING_FILENAME);
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(map, null, 2), 'utf8');
  await fs.rename(tmpPath, filePath);
}
