// Phase 2 — dữ liệu pet (src/data/pets.js) khớp tài liệu v2.1 mục 3.3 / 5.7.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PET_REGISTRY, ELEMENT_COLORS, getEvolutionInfo, calculatePowerScore, getGroupInfo, getPetSnapshot,
} from '../src/data/pets.js';
import { ELEMENTS, GROUPS } from './game-config.js';
import { computeStats } from './battle-engine.js';

// Bảng 5.7: id → [hệ, nhóm, độ hiếm (code)]
const TABLE_5_7 = {
  cowdi: ['neutral', 'farm', 'starter'], bamboo: ['neutral', 'farm', 'epic'], bun: ['metal', 'farm', 'epic'],
  paddy: ['wood', 'herb', 'common'], sprout: ['wood', 'herb', 'rare'], mushroom: ['earth', 'herb', 'rare'],
  radish: ['earth', 'herb', 'rare'], ginseng: ['earth', 'herb', 'epic'],
  foxie: ['fire', 'hunter', 'common'], leo: ['metal', 'hunter', 'epic'], shadow: ['dark', 'hunter', 'epic'],
  pingu: ['water', 'sea', 'common'], leafy: ['wood', 'sea', 'common'], flippy: ['water', 'sea', 'rare'],
  mimi: ['wind', 'sky', 'rare'], owlbert: ['wind', 'sky', 'rare'], storm: ['thunder', 'sky', 'epic'],
  sparky: ['fire', 'dragon', 'rare'], draco: ['fire', 'dragon', 'legendary'],
  pumpkin: ['dark', 'spirit', 'event'], monk: ['light', 'spirit', 'event'], prisma: ['light', 'spirit', 'legendary'],
  bamboo_spirit: ['wood', 'spirit', 'epic'],
};

test('23 pet: hệ, nhóm, độ hiếm khớp bảng 5.7 + bamboo_spirit', () => {
  assert.deepEqual(Object.keys(PET_REGISTRY).sort(), Object.keys(TABLE_5_7).sort());
  for (const [id, [element, group, rarity]] of Object.entries(TABLE_5_7)) {
    const sp = PET_REGISTRY[id];
    assert.equal(sp.element, element, `${id} element`);
    assert.equal(sp.group, group, `${id} group`);
    assert.equal(sp.rarity, rarity, `${id} rarity`);
    assert.equal(sp.evolveReq.c4.length, 4, `${id} evolveReq`);
  }
});

test('không còn hệ cũ nature/cosmic; ELEMENT_COLORS đủ 10 hệ, tên lấy từ config', () => {
  assert.deepEqual(Object.keys(ELEMENT_COLORS).sort(), Object.keys(ELEMENTS).sort());
  for (const [k, c] of Object.entries(ELEMENT_COLORS)) assert.equal(c.name, ELEMENTS[k].labelVi);
  for (const sp of Object.values(PET_REGISTRY)) assert.ok(!['nature', 'cosmic'].includes(sp.element));
});

test('getEvolutionInfo theo pet.evolution, không theo XP', () => {
  assert.equal(getEvolutionInfo('cowdi', 0).name, 'Trứng Cowdi');
  assert.equal(getEvolutionInfo('cowdi', 3).name, 'Super Cowdi');
  assert.equal(getEvolutionInfo('cowdi', 99).stage, 4);
  assert.equal(getEvolutionInfo('cowdi', undefined).stage, 0);
  assert.equal(getEvolutionInfo('nope', 1), null);
});

test('calculatePowerScore v2 = round(HP/10 + ATK + DEF/2 + AGI/2), không đọc totalXpEarned', () => {
  const pet = { speciesId: 'leafy', evolution: 3, skills: { listening: 150, speaking: 60, reading: 250, writing: 60 }, totalXpEarned: 999999 };
  const st = computeStats(getPetSnapshot(pet));
  assert.equal(calculatePowerScore(pet, PET_REGISTRY.leafy), Math.round(st.hp / 10 + st.atk + st.def / 2 + st.agi / 2));
  assert.equal(calculatePowerScore({ ...pet, totalXpEarned: 0 }, PET_REGISTRY.leafy), calculatePowerScore(pet, PET_REGISTRY.leafy));
});

test('getGroupInfo trả tên & mô tả kỹ năng nhóm từ config', () => {
  for (const g of Object.keys(GROUPS)) {
    const info = getGroupInfo(g);
    assert.ok(info.name && info.skillName && info.skillDesc, g);
  }
});
