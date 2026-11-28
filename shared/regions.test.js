import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { REGIONS, UNIT_REGION, REGION_COLOR, BOSS_TINT } from './regions.js';
import { HUMAN_CAST, isValidNpc } from './human-cast.js';

test('Story Bible 2b.4: mọi unit trong shared/units.json đều có trong UNIT_REGION và vùng hợp lệ', () => {
  const unitsJson = JSON.parse(fs.readFileSync(new URL('./units.json', import.meta.url), 'utf8'));
  const unitIds = unitsJson.map((u) => u.unitId || u.id);
  for (const uid of unitIds) {
    assert.ok(uid in UNIT_REGION, `Unit ${uid} thiếu trong UNIT_REGION`);
    const reg = UNIT_REGION[uid];
    assert.ok(reg in REGIONS, `Mã vùng ${reg} của ${uid} không có trong REGIONS`);
    assert.ok(reg in REGION_COLOR, `Thiếu REGION_COLOR cho ${reg}`);
    assert.ok(reg in BOSS_TINT, `Thiếu BOSS_TINT cho ${reg}`);
  }
});

test('Story Bible 2b.4: BD chỉ ở s1-u10, int-u1, exam-intro', () => {
  const bdUnits = Object.entries(UNIT_REGION)
    .filter(([, reg]) => reg === 'BD')
    .map(([uid]) => uid)
    .sort();
  assert.deepEqual(bdUnits, ['exam-intro', 'int-u1', 's1-u10']);
});

test('isValidNpc chỉ chấp nhận nhân vật trong HUMAN_CAST hoặc pet chủ nhà của vùng', () => {
  // HUMAN_CAST hợp lệ mọi vùng
  for (const id of Object.keys(HUMAN_CAST)) {
    assert.equal(isValidNpc(id, 'BD', REGIONS), true);
    assert.equal(isValidNpc(id, 'TG', REGIONS), true);
    assert.equal(isValidNpc(id, 'VS', REGIONS), true);
  }
  // Pet chủ nhà chỉ hợp lệ đúng vùng
  assert.equal(isValidNpc('owlbert', 'TG', REGIONS), true);
  assert.equal(isValidNpc('owlbert', 'VS', REGIONS), false);
  assert.equal(isValidNpc('cowdi', 'VS', REGIONS), true);
  assert.equal(isValidNpc('bamboo', 'VS', REGIONS), true);
  // Nhân vật ngoài Story Bible bị từ chối
  assert.equal(isValidNpc('co_ba', 'TG', REGIONS), false);
  assert.equal(isValidNpc('bac_bay', 'VS', REGIONS), false);
});
