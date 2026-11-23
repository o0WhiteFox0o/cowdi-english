import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { PetRig, REST_POSE, resolveApprovedClipName } from './PetRig.js';
import { fetchPetMotion, invalidatePetMotionCache } from './motionCache.js';
import { CLIPS } from '../../shared/pet-motion.js';

function createStubCanvas() {
  return {
    width: 420,
    height: 460,
    getContext: () => null,
    getBoundingClientRect: () => ({ width: 420, height: 460, left: 0, top: 0 }),
  };
}

const SAMPLE_RIG = {
  size: [203, 274],
  ground: [93, 273],
  slots: [
    { name: 'body', img: 'body', z: 0, kind: 'body' },
    { name: 'head', img: 'head', z: 2, kind: 'head', pivot: [95, 130], face: true },
  ],
  eyes: [{ c: [40, 85], w: 16, h: 17, box: [30, 75, 21, 21] }],
  mouth: [66, 108, 12],
};

describe('Bước 4 — Runtime người học: quy tắc fallback clip, trạng thái duyệt & cache', () => {
  it('PetRig.js không còn import shared/pet-motion-edits.js', async () => {
    const src = await fs.readFile(path.resolve(import.meta.dirname, 'PetRig.js'), 'utf8');
    assert.doesNotMatch(src, /^import\b.*pet-motion-edits/m);
  });

  it('resolveApprovedClipName áp dụng đúng thứ tự fallback theo mục 4', () => {
    // 1. Có clip duyệt -> dùng đúng clip
    assert.equal(resolveApprovedClipName('cheer_small', { cheer_small: CLIPS.cheer_small }), 'cheer_small');

    // 2. prop_<skill> -> idle -> null (tư thế nghỉ đứng yên)
    assert.equal(resolveApprovedClipName('prop_reading', { prop_reading: CLIPS.prop_reading, idle: CLIPS.idle }), 'prop_reading');
    assert.equal(resolveApprovedClipName('prop_reading', { idle: CLIPS.idle }), 'idle');
    assert.equal(resolveApprovedClipName('prop_reading', {}), null);
    assert.equal(resolveApprovedClipName('prop_listening', { idle: CLIPS.idle }), 'idle');

    // 3. attentive / battle_ready -> idle -> null
    assert.equal(resolveApprovedClipName('attentive', { attentive: CLIPS.attentive, idle: CLIPS.idle }), 'attentive');
    assert.equal(resolveApprovedClipName('attentive', { idle: CLIPS.idle }), 'idle');
    assert.equal(resolveApprovedClipName('attentive', {}), null);
    assert.equal(resolveApprovedClipName('battle_ready', { idle: CLIPS.idle }), 'idle');

    // 4. sleepy / sleep chưa duyệt -> bỏ qua (null), KHÔNG đổi sang idle
    assert.equal(resolveApprovedClipName('sleepy', { idle: CLIPS.idle }), null);
    assert.equal(resolveApprovedClipName('sleep', { idle: CLIPS.idle }), null);
    assert.equal(resolveApprovedClipName('sleep', { sleep: CLIPS.sleep }), 'sleep');

    // 5. Clip sự kiện chưa duyệt -> null (không phát)
    assert.equal(resolveApprovedClipName('cheer_small', { idle: CLIPS.idle }), null);
    assert.equal(resolveApprovedClipName('attack', { idle: CLIPS.idle }), null);
    assert.equal(resolveApprovedClipName('wave', { idle: CLIPS.idle }), null);
  });

  it('Pet-cấp chưa có rig đã duyệt: bỏ qua emit, không lỗi', async () => {
    const rig = new PetRig(createStubCanvas(), {
      petId: 'bamboo',
      stage: 3,
      group: 'farm',
      motion: {},
    });
    await rig.load();
    assert.equal(rig.hasApprovedStage(), false);
    assert.equal(rig.cur, null);
    assert.doesNotThrow(() => {
      rig.emit('answer_correct');
      rig.emit('lesson_start');
      rig.say('Hello');
    });
    assert.equal(rig.cur, null);
    assert.equal(rig.bubble, null);
    rig.destroy();
  });

  it('Duyệt rig Bamboo C3 + idle: thở (idle), trả lời đúng khi cheer_small chưa duyệt thì KHÔNG nhảy', async () => {
    const rig = new PetRig(createStubCanvas(), {
      petId: 'bamboo',
      stage: 3,
      group: 'farm',
      mode: 'lesson',
      motion: {
        c3: {
          rig: SAMPLE_RIG,
          images: {},
          clips: { idle: CLIPS.idle },
        },
      },
    });
    await rig.load();

    // mode='lesson' muốn 'attentive', nhưng chưa duyệt -> fallback sang 'idle'
    assert.equal(rig.hasApprovedStage(), true);
    assert.equal(rig.cur?.name, 'idle');

    // Trả lời đúng khi cheer_small chưa duyệt -> giữ nguyên 'idle', không nhảy
    rig.emit('answer_correct');
    assert.equal(rig.cur?.name, 'idle');

    // Thử sleepy khi chưa duyệt -> bỏ qua, vẫn giữ 'idle'
    assert.equal(rig.play('sleepy'), false);
    assert.equal(rig.cur?.name, 'idle');
    rig.destroy();
  });

  it('Duyệt thêm cheer_small -> trả lời đúng thì nhảy cheer_small', async () => {
    const rig = new PetRig(createStubCanvas(), {
      petId: 'bamboo',
      stage: 3,
      group: 'farm',
      mode: 'lesson',
      motion: {
        c3: {
          rig: SAMPLE_RIG,
          images: {},
          clips: { idle: CLIPS.idle, cheer_small: CLIPS.cheer_small },
        },
      },
    });
    await rig.load();
    assert.equal(rig.cur?.name, 'idle');

    rig.emit('answer_correct');
    assert.equal(rig.cur?.name, 'cheer_small');
    rig.destroy();
  });

  it('Duyệt rig nhưng 0 clip duyệt -> đứng tư thế nghỉ REST_POSE, không lỗi', async () => {
    const rig = new PetRig(createStubCanvas(), {
      petId: 'bamboo',
      stage: 3,
      group: 'farm',
      motion: {
        c3: {
          rig: SAMPLE_RIG,
          images: {},
          clips: {},
        },
      },
    });
    await rig.load();
    assert.equal(rig.hasApprovedStage(), true);
    assert.equal(rig.cur, null);
    const ch = rig._channels(performance.now());
    assert.equal(ch.rot, REST_POSE.rot);
    assert.equal(ch.sx, REST_POSE.sx);
    assert.equal(ch.eyes, REST_POSE.eyes);
    rig.destroy();
  });

  it('fetchPetMotion cache trong bộ nhớ theo petId, chỉ gọi API 1 lần', async () => {
    invalidatePetMotionCache();
    let calls = 0;
    const mockFetch = async () => {
      calls++;
      return {
        ok: true,
        json: async () => ({ c3: { rig: SAMPLE_RIG, images: {}, clips: { idle: CLIPS.idle } } }),
      };
    };

    // Chưa đăng nhập -> không gọi API
    const anon = await fetchPetMotion('bamboo', null, { fetchImpl: mockFetch });
    assert.deepEqual(anon, {});
    assert.equal(calls, 0);

    // Gọi lần 1 -> 1 request; gọi lần 2 -> lấy từ cache
    const d1 = await fetchPetMotion('bamboo', 'tok_1', { fetchImpl: mockFetch });
    const d2 = await fetchPetMotion('bamboo', 'tok_1', { fetchImpl: mockFetch });
    assert.equal(calls, 1);
    assert.deepEqual(d1, d2);
    assert.ok(d1.c3?.clips?.idle);

    // Xoá cache cho petId -> gọi lại API
    invalidatePetMotionCache('bamboo');
    await fetchPetMotion('bamboo', 'tok_1', { fetchImpl: mockFetch });
    assert.equal(calls, 2);

    invalidatePetMotionCache();
  });

  it('Sự kiện đấu trường & cho ăn tuân thủ quy tắc chỉ phát clip đã duyệt', async () => {
    const rig = new PetRig(createStubCanvas(), {
      petId: 'bamboo_spirit',
      stage: 1,
      group: 'spirit',
      mode: 'battle',
      motion: {
        c1: {
          rig: SAMPLE_RIG,
          images: {},
          clips: {
            idle: CLIPS.idle,
            attack: CLIPS.attack,
            eat: CLIPS.eat,
          },
        },
      },
    });
    await rig.load();

    // battle_ready chưa duyệt -> fallback sang idle
    assert.equal(rig.cur?.name, 'idle');

    // battle_attack đã duyệt (attack) -> phát attack
    rig.emit('battle_attack');
    assert.equal(rig.cur?.name, 'attack');

    // battle_crit (crit) chưa duyệt -> không ghi đè sang clip chưa duyệt
    rig.emit('battle_crit');
    assert.equal(rig.cur?.name, 'attack');

    // feed (eat) đã duyệt -> phát eat
    rig.emit('feed');
    assert.equal(rig.cur?.name, 'eat');

    rig.destroy();
  });

  it('Rig đơn lớp có viền trong suốt (như Trứng C1 500x500) tự tính vùng hình thật để không bị thu nhỏ vỡ nét', async () => {
    const paddedEggRig = {
      size: [500, 500],
      ground: [249.5, 416],
      slots: [{ name: 'body', img: 'body', z: 0, kind: 'body', face: true }],
      eyes: [],
      mouth: null,
      ellipse: [249.5, 244, 288, 345],
    };
    const rig = new PetRig(createStubCanvas(), {
      petId: 'cowdi',
      stage: 1,
      group: 'farm',
      motion: {
        c1: { rig: paddedEggRig, images: {}, clips: { idle: CLIPS.idle } },
      },
    });
    await rig.load();

    const cs = rig._contentSize();
    assert.deepEqual(cs, { w: 288, h: 345 });
    // Tỉ lệ scale phải đủ lớn (> 0.65 thay vì ~0.28 như cũ)
    assert.ok(rig._scale() > 0.65);
    rig.destroy();
  });
});
