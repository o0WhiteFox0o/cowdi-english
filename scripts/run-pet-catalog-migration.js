import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../server/config/env.js';
import pool from '../server/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const sqlPath = path.resolve(__dirname, '../server/db/migrate-pet-catalog.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');
  const statements = sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--'));

  for (const stmt of statements) {
    await pool.query(stmt);
  }
  console.log('✅ Đã áp dụng migration bảng pet_catalog thành công (idempotent).');
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Lỗi migration pet_catalog:', err.message);
  process.exit(1);
});
