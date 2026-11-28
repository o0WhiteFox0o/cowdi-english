import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolvePetStageFacing,
  shouldFlipPetHorizontal,
  mergeTransformWithFlip,
} from './pet-facing.js';

test('shouldFlipPetHorizontal: tính toán lật ngang chính xác cho cả 3 hướng gốc', () => {
  // Ảnh gốc nhìn trái
  assert.equal(shouldFlipPetHorizontal('left', 'right'), true);
  assert.equal(shouldFlipPetHorizontal('left', 'left'), false);

  // Ảnh gốc nhìn phải (ví dụ Cowdi C3)
  assert.equal(shouldFlipPetHorizontal('right', 'left'), true);
  assert.equal(shouldFlipPetHorizontal('right', 'right'), false);

  // Ảnh chính diện (front) không lật
  assert.equal(shouldFlipPetHorizontal('front', 'left'), false);
  assert.equal(shouldFlipPetHorizontal('front', 'right'), false);

  // Không truyền targetFacing → không lật
  assert.equal(shouldFlipPetHorizontal('left', null), false);
  assert.equal(shouldFlipPetHorizontal('right', undefined), false);
});

test('resolvePetStageFacing: ưu tiên evolutions[stage-1], sau đó default đã biết, cuối cùng left', () => {
  assert.deepEqual(resolvePetStageFacing({ id: 'cowdi', evolutions: [{}, {}, {}] }, 3), {
    nativeFacing: 'right',
    facingVerified: false,
  });

  assert.deepEqual(
    resolvePetStageFacing(
      { id: 'cowdi', evolutions: [{}, {}, { nativeFacing: 'left', facingVerified: true }] },
      3
    ),
    { nativeFacing: 'left', facingVerified: true }
  );

  assert.deepEqual(resolvePetStageFacing({ id: 'foxie', evolutions: [{}, {}] }, 2), {
    nativeFacing: 'left',
    facingVerified: false,
  });
});

test('mergeTransformWithFlip: giữ nguyên transform cũ khi ghép scaleX(-1)', () => {
  assert.equal(mergeTransformWithFlip('', true), 'scaleX(-1)');
  assert.equal(mergeTransformWithFlip('translateY(2px)', true), 'translateY(2px) scaleX(-1)');
  assert.equal(mergeTransformWithFlip('translateY(2px)', false), 'translateY(2px)');
  assert.equal(mergeTransformWithFlip('', false), undefined);
});
