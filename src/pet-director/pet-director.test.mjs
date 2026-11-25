// Kiểm thử lõi PetDirector (mục 10.3 SDD-PET-DIRECTOR-v1.1.md).
// Chạy: node --test src/pet-director/pet-director.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PetDirector } from './PetDirector.js';
import { createDirectorStorage, createMemoryStorage } from './storage.js';
import { BANNED_PHRASES, MAX_SPEECH_CHARS, REPEAT_BLOCK_MS } from './rules.js';
import { ALL_PET_LINES } from '../data/pet-lines/index.js';

function makeDirector({ now = new Date('2026-11-25T10:00:00').getTime(), linesProvider } = {}) {
  let current = now;
  const backend = createMemoryStorage();
  const storage = createDirectorStorage('u_test', backend);
  const director = new PetDirector({
    userId: 'u_test',
    clock: () => current,
    rng: () => 0,
    storage,
    linesProvider,
  });
  return {
    director,
    storage,
    advance: (ms) => { current += ms; },
    setTime: (ts) => { current = ts; },
  };
}

const LESSON_CTX = {
  screen: 'lesson',
  petId: 'cowdi',
  petName: 'Cowdi',
  mood: 'happy',
  stage: 2,
  bond: 250,
  group: 'farm',
  lessonId: 'greetings',
  lessonTitle: 'Xin chào',
  lessonsToday: 2,
};

describe('PetDirector — ưu tiên, cooldown, giờ yên, biến & chống lặp (mục 10.3)', () => {
  it('Ưu tiên: lesson_done thay bong bóng answer_correct; page_tip không thay answer_wrong', () => {
    const { director, advance } = makeDirector();

    const d1 = director.dispatch('answer_correct', { word: 'hello', meaning: 'xin chào' }, LESSON_CTX);
    assert.equal(d1.tier, 3);
    assert.ok(d1.speech?.vi.includes('hello'));

    advance(1000);
    // lesson_done (90) > answer_correct (50) -> thay bong bóng
    const d2 = director.dispatch('lesson_done', { score: 9, total: 10, perfect: false }, LESSON_CTX);
    assert.equal(d2.tier, 3);
    assert.ok(d2.speech);
    assert.notEqual(d2.speech.id, d1.speech.id);

    // Chờ hết TTL -> answer_wrong hiện -> page_tip ưu tiên thấp hơn không thay
    advance(10000);
    const d3 = director.dispatch('answer_wrong', { word: 'bye', meaning: 'tạm biệt' }, LESSON_CTX);
    assert.equal(d3.tier, 3);
    advance(500);
    const d4 = director.dispatch('screen_enter', { screen: 'lesson' }, LESSON_CTX);
    assert.equal(d4.tier, 1);
    assert.equal(d4.speech, null);
  });

  it('Giới hạn cooldown: 2 lần answer_correct trong 8 giây -> lần 2 là tầng 1; cùng từ trong bài -> tầng 1', () => {
    const { director, advance } = makeDirector();

    const d1 = director.dispatch('answer_correct', { word: 'apple', meaning: 'quả táo' }, LESSON_CTX);
    assert.equal(d1.tier, 3);
    assert.equal(d1.rigEvent, 'answer_correct');

    advance(3000);
    const d2 = director.dispatch('answer_correct', { word: 'banana', meaning: 'quả chuối' }, LESSON_CTX);
    assert.equal(d2.tier, 1);
    assert.equal(d2.speech, null);
    assert.equal(d2.rigEvent, 'answer_correct'); // động tác vẫn luôn phát

    // Sau 9 giây nhưng lặp lại từ 'apple' đã đúng trong bài -> vẫn tầng 1
    advance(9000);
    const d3 = director.dispatch('answer_correct', { word: 'apple', meaning: 'quả táo' }, LESSON_CTX);
    assert.equal(d3.tier, 1);
    assert.equal(d3.speech, null);

    // Từ mới 'orange' sau > 8 giây -> lên tầng 3
    const d4 = director.dispatch('answer_correct', { word: 'orange', meaning: 'quả cam' }, LESSON_CTX);
    assert.equal(d4.tier, 3);
    assert.ok(d4.speech?.vi.includes('orange'));
  });

  it('page_tip cùng màn hình lần 2 -> không có speech (chỉ hiện 1 lần / màn hình / tài khoản)', () => {
    const { director, advance } = makeDirector();

    const first = director.dispatch('screen_enter', { screen: 'path' }, { ...LESSON_CTX, screen: 'path' });
    assert.equal(first.tier, 3);
    assert.ok(first.speech?.id.includes('tip'));

    advance(60000);
    const second = director.dispatch('screen_enter', { screen: 'path' }, { ...LESSON_CTX, screen: 'path' });
    assert.equal(second, null);
  });

  it('Giờ yên 22:00: mood_nudge -> tier 2 với thought zzz, không giục học; app_open chọn nhóm night', () => {
    const nightTs = new Date('2026-11-25T22:00:00').getTime();
    const { director } = makeDirector({ now: nightTs });

    const nudge = director.dispatch('idle_tick', {}, { ...LESSON_CTX, screen: 'path', mood: 'sick' });
    assert.equal(nudge.tier, 2);
    assert.equal(nudge.thought, 'zzz');
    assert.equal(nudge.speech, null);

    const open = director.dispatch('app_open', { daysAway: 2 }, { ...LESSON_CTX, screen: 'path', mood: 'sick' });
    assert.equal(open.tier, 3);
    assert.equal(open.thought, 'zzz');
    assert.ok(open.speech?.id.includes('night'));
  });

  it('Câu thiếu biến ({word} khi payload không có word) không bao giờ được chọn', () => {
    const onlyWordLines = () => [
      { id: 'test.word.01', event: 'answer_correct', vi: 'Đúng! {word} = {meaning}', en: '{word}', when: { needs: ['word', 'meaning'] }, weight: 1 },
    ];
    const { director } = makeDirector({ linesProvider: onlyWordLines });

    const d = director.dispatch('answer_correct', {}, LESSON_CTX);
    assert.equal(d.tier, 1);
    assert.equal(d.speech, null);
    assert.equal(d.rigEvent, 'answer_correct');
  });

  it('Chống lặp: cùng id không xuất hiện lại trong 7 ngày (giả lập đồng hồ)', () => {
    const oneLine = () => [
      { id: 'test.feed.only', event: 'feed', vi: 'Ngon quá!', when: {}, weight: 1 },
    ];
    const { director, advance } = makeDirector({ linesProvider: oneLine });

    const d1 = director.dispatch('feed', {}, { ...LESSON_CTX, screen: 'pet' });
    assert.equal(d1.tier, 3);
    assert.equal(d1.speech.id, 'test.feed.only');

    // Sau 6 ngày -> vẫn bị chặn lặp
    advance(6 * 24 * 60 * 60 * 1000);
    const d2 = director.dispatch('feed', {}, { ...LESSON_CTX, screen: 'pet' });
    assert.equal(d2.tier, 1);
    assert.equal(d2.speech, null);

    // Qua mốc 7 ngày -> được chọn lại
    advance(REPEAT_BLOCK_MS + 1000);
    const d3 = director.dispatch('feed', {}, { ...LESSON_CTX, screen: 'pet' });
    assert.equal(d3.tier, 3);
    assert.equal(d3.speech.id, 'test.feed.only');
  });

  it('Đấu trường (battle_*) luôn tầng 1; mood_nudge trên Lộ trình tối đa tầng 2 (biểu tượng)', () => {
    const { director } = makeDirector();

    const battle = director.dispatch('battle_crit', {}, { ...LESSON_CTX, screen: 'battle' });
    assert.equal(battle.tier, 1);
    assert.equal(battle.rigEvent, 'battle_crit');
    assert.equal(battle.speech, null);
    assert.equal(battle.thought, null);

    const pathNudge = director.dispatch('idle_tick', {}, { ...LESSON_CTX, screen: 'path', mood: 'sick' });
    assert.equal(pathNudge.tier, 2);
    assert.equal(pathNudge.thought, 'book');
    assert.equal(pathNudge.speech, null);

    // Lần 2 trong cùng phiên không hiện lại mood_nudge
    const pathNudge2 = director.dispatch('idle_tick', {}, { ...LESSON_CTX, screen: 'path', mood: 'sick' });
    assert.equal(pathNudge2.tier, 1);
    assert.equal(pathNudge2.thought, null);
  });

  it('Nghiệm thu GĐ1 & GĐ2: đúng 10 câu liên tiếp chữ ≤ 4 lần; chạm pet 10 lần liên tiếp chữ ≤ 2 lần', () => {
    const { director, advance } = makeDirector();
    let speechCount = 0;
    for (let i = 1; i <= 10; i++) {
      const ev = i === 3 || i === 5 || i === 10 ? 'streak' : 'answer_correct';
      const payload = ev === 'streak' ? { count: i } : { word: `word${i}`, meaning: `nghĩa ${i}` };
      const d = director.dispatch(ev, payload, LESSON_CTX);
      assert.equal(d.rigEvent, ev); // động tác luôn chạy cả 10 lần
      if (d.speech) speechCount++;
      advance(2000);
    }
    assert.ok(speechCount <= 4, `Mong đợi ≤ 4 lần có chữ, thực tế ${speechCount}`);

    // Chạm pet 10 lần trong 10 giây
    const { director: dTap, advance: advTap } = makeDirector();
    let tapSpeeches = 0;
    for (let i = 0; i < 10; i++) {
      const d = dTap.dispatch('pet_tap', {}, { ...LESSON_CTX, screen: 'path' });
      if (d?.speech) tapSpeeches++;
      advTap(1000);
    }
    assert.ok(tapSpeeches <= 2, `Mong đợi ≤ 2 lần có chữ khi chạm 10 lần, thực tế ${tapSpeeches}`);
  });

  it('Giữ chỗ GĐ3: beginConversation() trả Promise reject not_enabled', async () => {
    const { director } = makeDirector();
    await assert.rejects(() => director.beginConversation(), /not_enabled/);
  });

  it('Quét toàn bộ LineDB: không từ cấm P3 và độ dài ≤ 60 ký tự', () => {
    const sample = {
      petName: 'Cowdi', word: 'thanks', meaning: 'cảm ơn', lessonTitle: 'Xin chào',
      streak: 5, lessonsToday: 2, score: 9, total: 10, daysAway: 3,
    };
    const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => String(sample[k] ?? `{${k}}`));
    for (const l of ALL_PET_LINES) {
      const text = fill(l.vi);
      assert.ok([...text].length <= MAX_SPEECH_CHARS, `${l.id} quá dài: ${text}`);
      for (const b of BANNED_PHRASES) {
        assert.ok(!text.toLowerCase().includes(b), `${l.id} chứa từ cấm "${b}"`);
      }
    }
  });
});
