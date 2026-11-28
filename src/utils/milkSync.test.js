import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLocalWallet, reconcileMilk } from './milkSync.js';

// Mô phỏng server: Sữa = total_xp + ledger; PUT /api/progress: total_xp = GREATEST(cũ, client)
function makeServer({ totalXp, ledgerMilk }) {
  const s = { totalXp, ledgerMilk };
  s.get = () => ({ totalXP: s.totalXp, wallet: { milk: s.totalXp + s.ledgerMilk, gem: 0, stone: 0, stone_shard: 0 } });
  s.put = (clientTotal) => { s.totalXp = Math.max(s.totalXp, clientTotal); return s.get().wallet; };
  return s;
}

// Một lần F5: đọc localStorage → GET /progress → merge → PUT → lưu localStorage
function reload(server, localStorageData, dirty = false) {
  const local = normalizeLocalWallet({ ...localStorageData });
  const merged = { ...local, ...reconcileMilk(local, server.get(), { dirty }) };
  const wallet = server.put(merged.totalXP);
  return { ...merged, wallet, availableXP: wallet.milk };
}

test('M1: ledger dương (gacha, đấu trường...) — F5 nhiều lần KHÔNG tự cộng Sữa', () => {
  const server = makeServer({ totalXp: 1000, ledgerMilk: 300 });
  let ls = { totalXP: 1000, wallet: { milk: 1300 } };
  for (let i = 0; i < 5; i++) ls = reload(server, ls);
  assert.equal(server.get().wallet.milk, 1300);
  assert.equal(server.totalXp, 1000);
  assert.equal(ls.wallet.milk, 1300);
});

test('M2: normalizeLocalWallet không được nâng totalXP lên bằng Sữa', () => {
  const out = normalizeLocalWallet({ totalXP: 1000, wallet: { milk: 1600 } });
  assert.equal(out.totalXP, 1000);
  assert.equal(out.wallet.milk, 1600);
});

test('M3: XP học chưa kịp đồng bộ (dirty) vẫn được giữ, đúng 1 lần', () => {
  const server = makeServer({ totalXp: 1000, ledgerMilk: 300 });
  // Học xong +50 rồi tắt máy trước khi PUT
  let ls = { totalXP: 1050, wallet: { milk: 1350 } };
  ls = reload(server, ls, true);
  assert.equal(server.get().wallet.milk, 1350);
  ls = reload(server, ls, false);
  ls = reload(server, ls, false);
  assert.equal(server.get().wallet.milk, 1350);
});

test('M4: máy sạch nhưng totalXP local cao bất thường (dữ liệu hỏng từ bản cũ) → theo server', () => {
  const r = reconcileMilk({ totalXP: 5000 }, { totalXP: 1000, wallet: { milk: 1300 } }, { dirty: false });
  assert.equal(r.totalXP, 1000);
  assert.equal(r.wallet.milk, 1300);
});
