// ============================================================
// Cowdi — Đồng bộ Sữa giữa máy và server (Kinh tế v2)
//
// Mô hình server:  Sữa = total_xp + SUM(wallet_ledger.milk)
//   - total_xp  : Sữa kiếm từ học (client cộng qua addXP rồi PUT /api/progress)
//   - ledger    : mọi khoản khác (gacha, mời bạn, đồng hồ, khế ước, đấu trường, tiêu...)
//
// Quy tắc bất biến: KHÔNG BAO GIỜ suy ra totalXP từ wallet.milk.
// wallet.milk có thể lớn hơn totalXP (khi ledger dương). Nếu ép totalXP >= milk
// thì phần ledger bị gộp vào total_xp và mỗi lần F5 lại được cộng thêm một lần nữa.
// ============================================================

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Chuẩn hoá ví đọc từ localStorage. Không đụng tới totalXP.
 */
export function normalizeLocalWallet(data) {
  const w = data.wallet || {};
  const milk = typeof w.milk === 'number' ? w.milk : num(data.availableXP);
  const wallet = {
    milk: Math.max(0, milk),
    gem: typeof w.gem === 'number' ? w.gem : 0,
    stone: typeof w.stone === 'number' ? w.stone : 0,
    stone_shard: typeof w.stone_shard === 'number' ? w.stone_shard : 0,
  };
  const availableXP = typeof data.availableXP === 'number' && data.availableXP >= 0
    ? data.availableXP
    : wallet.milk;
  return { ...data, wallet, availableXP };
}

/**
 * Gộp totalXP + ví khi tải lại trang.
 * - Server là nguồn sự thật của ví.
 * - Chỉ cộng phần XP "chưa đồng bộ" khi máy thật sự còn thay đổi chưa đẩy lên (dirty);
 *   khi sạch thì totalXP local cao hơn server chỉ có thể là dữ liệu hỏng → bỏ qua.
 */
export function reconcileMilk(local, remote, { dirty = false } = {}) {
  const localTotal = num(local?.totalXP);
  const remoteTotal = num(remote?.totalXP);
  const unsyncedXP = dirty ? Math.max(0, localTotal - remoteTotal) : 0;
  const totalXP = remoteTotal + unsyncedXP;

  if (remote?.wallet && typeof remote.wallet.milk === 'number') {
    const milk = Math.max(0, num(remote.wallet.milk) + unsyncedXP);
    return {
      totalXP,
      availableXP: milk,
      wallet: {
        milk,
        gem: num(remote.wallet.gem),
        stone: num(remote.wallet.stone),
        stone_shard: num(remote.wallet.stone_shard),
      },
    };
  }

  // Server cũ chưa trả ví: giữ cách tính theo "đã tiêu chỉ tăng"
  const spentOf = (d) => Math.max(0, num(d?.totalXP) - num(d?.availableXP ?? d?.totalXP));
  const maxTotal = Math.max(localTotal, remoteTotal);
  const milk = Math.max(0, maxTotal - Math.max(spentOf(local), spentOf(remote)));
  const raw = remote?.wallet || local?.wallet || {};
  return {
    totalXP: maxTotal,
    availableXP: milk,
    wallet: { milk, gem: num(raw.gem), stone: num(raw.stone), stone_shard: num(raw.stone_shard) },
  };
}
