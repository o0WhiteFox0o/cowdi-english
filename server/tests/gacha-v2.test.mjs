import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GACHA_CONFIG, isPetImageComplete } from '../../shared/game-config.js';
import {
  getStarterPool,
  getGachaPetPools,
  rollStarterPet,
  rollStandardGachaOutcome,
} from '../utils/gacha-manager.js';

function makeSeededRng(seed = 123456) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

describe('GĐ6 — Lõi Gacha, Quay khởi đầu & Lọc pet đủ 5 ảnh', () => {
  it('isPetImageComplete loại bỏ pet thiếu ảnh (mushroom, bun)', () => {
    assert.equal(isPetImageComplete('mushroom'), false);
    assert.equal(isPetImageComplete('bun'), false);
    assert.equal(isPetImageComplete('cowdi'), true);
    assert.equal(isPetImageComplete('draco'), true);
  });

  it('Bể quay khởi đầu và bể Gacha không chứa cowdi hay pet thiếu ảnh', () => {
    const starter = getStarterPool();
    const allStarter = Object.values(starter).flat();
    assert.equal(allStarter.includes('cowdi'), false);
    assert.equal(allStarter.includes('mushroom'), false);
    assert.equal(allStarter.includes('bun'), false);
    assert.ok(allStarter.length >= 18);

    const gachaPools = getGachaPetPools();
    const allGacha = [...gachaPools.epic, ...gachaPools.limited];
    assert.equal(allGacha.includes('mushroom'), false);
    assert.equal(allGacha.includes('bun'), false);
  });

  it('Quay khởi đầu 5000 lượt tuân thủ tỉ lệ 50/30/13/5/2 và không ra pet thiếu ảnh', () => {
    const rng = makeSeededRng(42);
    const counts = { common: 0, rare: 0, epic: 0, event: 0, legendary: 0 };
    const N = 5000;
    for (let i = 0; i < N; i++) {
      const res = rollStarterPet(rng);
      assert.notEqual(res.speciesId, 'cowdi');
      assert.equal(isPetImageComplete(res.speciesId), true);
      counts[res.rarity] += 1;
    }
    assert.ok(Math.abs(counts.common / N - 0.50) < 0.03);
    assert.ok(Math.abs(counts.rare / N - 0.30) < 0.03);
    assert.ok(Math.abs(counts.epic / N - 0.13) < 0.025);
    assert.ok(Math.abs(counts.event / N - 0.05) < 0.02);
    assert.ok(Math.abs(counts.legendary / N - 0.02) < 0.015);
  });

  it('Gacha thường 5000 lượt tuân thủ tỉ lệ 67/22/8/3 và quy đổi trùng +10 Gem', () => {
    const rng = makeSeededRng(99);
    const counts = { common: 0, rare: 0, epic: 0, limited: 0 };
    const N = 5000;
    for (let i = 0; i < N; i++) {
      const res = rollStandardGachaOutcome({ ownedPetSpecies: new Set(), streakShields: 0 }, rng);
      if (res.rewardType === 'pet') {
        assert.equal(isPetImageComplete(res.rewardId), true);
      }
      counts[res.tier] += 1;
    }
    assert.ok(Math.abs(counts.common / N - 0.67) < 0.03);
    assert.ok(Math.abs(counts.rare / N - 0.22) < 0.03);
    assert.ok(Math.abs(counts.epic / N - 0.08) < 0.02);
    assert.ok(Math.abs(counts.limited / N - 0.03) < 0.015);

    // Kiểm tra trùng pet Sử thi/Đặc biệt đổi +10 Gem
    const allReady = new Set(['bamboo', 'ginseng', 'leo', 'shadow', 'storm', 'bamboo_spirit', 'pumpkin', 'monk', 'draco', 'prisma']);
    const dupRes = rollStandardGachaOutcome({ ownedPetSpecies: allReady, streakShields: 2 }, () => 0.98);
    assert.equal(dupRes.isDuplicate, true);
    assert.equal(dupRes.rewardType, 'gem');
    assert.equal(dupRes.amount, GACHA_CONFIG.DUPLICATE_EPIC_GEM);
  });
});
