// shared/story-defaults.js — Lớp dẫn nhập & thoại Boss mặc định theo vùng.
// Nguồn sự thật duy nhất của Boss vùng (pet_id, alt_pet_id) nằm tại REGIONS[region].boss trong shared/regions.js.

import { REGIONS } from './regions.js';

// Kịch bản thoại của Boss theo từng vùng (không khai báo lặp pet_id ở đây — đọc từ REGIONS[code].boss).
const REGION_BOSS_STORY = {
  BD:  {
    lieVi: 'Hỏi lại là xấu hổ.',
    enterVi: 'Flippy gật gù trong sương, ai nói gì cũng "Yes… yes…" cho qua.',
    freed: { vi: 'Flippy cười toe: hỏi lại không xấu hổ chút nào!', en: 'Could you say that again?' },
  },
  VS:  {
    lieVi: 'Rừng cần im lặng mới bình yên.',
    enterVi: 'Linh Trúc mở miệng mà không ra tiếng. Lá trúc đứng im.',
    freed: { vi: 'Linh Trúc cất tiếng: rừng sống nhờ tiếng gọi nhau.', en: 'Can you hear me?' },
  },
  RM:  {
    lieVi: 'Phải lớn mới làm được.',
    enterVi: 'Sprout co mình trong sương: "Mình còn nhỏ, chưa nói được đâu…"',
    freed: { vi: 'Sprout vươn lên: bắt đầu nhỏ cũng là bắt đầu!', en: 'I can do a little.' },
  },
  RT:  {
    lieVi: 'Thủ lĩnh không được nói không biết.',
    enterVi: 'Leo đứng chắn lối, không chịu nói mình đang lạc trong sương.',
    freed: { vi: 'Leo gật đầu: nói "chưa biết" cũng là dũng cảm.', en: "I don't know yet." },
  },
  BS:  {
    lieVi: 'Nói ra thì bị cười; viết thì an toàn.',
    enterVi: 'Pingu chỉ viết lên cát rồi xoá, không dám cất tiếng.',
    freed: { vi: 'Pingu cất tiếng hát: sai thì mình thử lại!', en: 'Let me try again.' },
  },
  CN:  {
    lieVi: 'Nói chuyện là phải thắng.',
    enterVi: 'Foxie trả giá ai cũng phải thắng, cả chợ nổi im re.',
    freed: { vi: 'Foxie bật cười: hỏi ý người kia mới vui!', en: 'What do you think?' },
  },
  TG:  {
    lieVi: 'Đúng luật là đủ.',
    enterVi: 'Owlbert cầm bút đỏ lẩm bẩm "Sai… sai…", cả tháp im phăng phắc.',
    freed: { vi: 'Owlbert gác bút đỏ: hỏi ý người viết trước, rồi mới sửa.', en: 'What do you mean?' },
  },
  CNS: {
    lieVi: 'Phải chuẩn bị thật kỹ mới được nói.',
    enterVi: 'Sparky lẩm nhẩm mãi trong sương, chưa dám nói câu nào.',
    freed: { vi: 'Sparky hét vang: nói luôn, sai thì sửa!', en: 'Here I go!' },
  },
  DDL: {
    lieVi: 'Lễ của mình lạ, đừng kể.',
    enterVi: 'Pumpkin tắt đèn lồng, trốn sau sương, không kể về lễ của mình.',
    freed: { vi: 'Pumpkin thắp đèn: lễ của mình cũng đáng kể!', en: 'In my country, we…' },
  },
  CBL: {
    lieVi: 'Giọng chuẩn mới đáng nghe.',
    enterVi: 'Draco đứng giữa Cổng Biển Lớn, chỉ mở cổng cho giọng "chuẩn".',
    freed: { vi: 'Draco cúi đầu: mọi giọng đều đáng được nghe.', en: 'Words are bridges.' },
  },
};

// Export tổng hợp đọc pet_id/alt_pet_id từ REGIONS[code].boss (tương thích ngược cho test/caller cũ).
export const REGION_BOSS = Object.fromEntries(
  Object.entries(REGIONS).map(([code, reg]) => [
    code,
    {
      pet_id: reg.boss.pet_id,
      alt_pet_id: reg.boss.alt_pet_id,
      pet: reg.boss.pet_id,
      alt: reg.boss.alt_pet_id,
      ...(REGION_BOSS_STORY[code] || {}),
    },
  ]),
);

// Thoại chung khi Boss vùng chưa có thoại riêng. {boss} = tên Boss.
export const GENERIC_BOSS_LINES = {
  hit: [
    { vi: 'Đúng rồi! Sương quanh {boss} mỏng đi một chút.' },
    { vi: '{boss} ngẩng lên nghe con nói kìa!' },
    { vi: 'Một mảng sương vừa tan!' },
  ],
  wrong: [
    { vi: 'Sương dày thêm chút xíu. Sai cũng được, thử tiếp nào!' },
    { vi: 'Không sao đâu, mình nói lại nha!' },
  ],
  retreat: { vi: '{boss} lùi lại, sương quanh đây tan thêm một khúc.' },
  fail: { vi: '{boss} vẫn còn trong sương. Ôn lại rồi mình quay lại nha!' },
};

// Người dẫn & thoại mặc định theo unit đặc biệt (tách bạch intro_vi và dialogue.text_en).
export const UNIT_NARRATOR = {
  'exam-pron': {
    by: 'storm',
    intro_vi: 'Storm dạy "giọng của gió": nghe kỹ từng âm, rồi nói theo nha!',
    dialogue: { speaker_id: 'storm', text_en: 'Listen to the wind!' },
    introVi: 'Storm dạy "giọng của gió": nghe kỹ từng âm, rồi nói theo nha!',
    introEn: 'Listen to the wind!',
  },
  'exam-intro': {
    by: 'ong_tu',
    intro_vi: 'Ông Tư chở anh Khoa tới Cổng Biển Lớn. Con đi cùng anh nha!',
    dialogue: { speaker_id: 'ong_tu', text_en: "Let's go to the gate!" },
    introVi: 'Ông Tư chở anh Khoa tới Cổng Biển Lớn. Con đi cùng anh nha!',
    introEn: "Let's go to the gate!",
  },
};

// Người dẫn mặc định của vùng: host đầu tiên KHÔNG trùng Boss vùng; vùng không có pet host → người chủ nhà.
export function defaultNarrator(region, regions, companionId) {
  const reg = regions?.[region];
  if (!reg) return 'ong_tu';
  const bossPetId = reg.boss?.pet_id;
  const host = (reg.hosts || []).find((h) => h !== bossPetId && h !== companionId)
            || (reg.hosts || []).find((h) => h !== bossPetId);
  return host || reg.humanHost || 'ong_tu';
}

// Boss vùng (C5), đổi sang alt_pet_id nếu trùng pet đồng hành.
export function regionBoss(region, companionId, bossName = null) {
  const regBoss = REGIONS[region]?.boss;
  const story = REGION_BOSS_STORY[region];
  if (!regBoss) return null;
  const petId = regBoss.pet_id === companionId ? regBoss.alt_pet_id : regBoss.pet_id;
  const name = bossName || petId;
  const fill = (o) => ({ ...o, vi: o.vi.replaceAll('{boss}', name) });
  const usingAlt = petId !== regBoss.pet_id;
  return {
    pet_id: petId,
    pet: petId,
    stage: 5,
    lieVi: story?.lieVi || '',
    lines: {
      enter: { vi: usingAlt ? `${name} đứng im trong sương, không nói một lời.` : (story?.enterVi || `${name} xuất hiện trong sương.`) },
      hit: GENERIC_BOSS_LINES.hit.map(fill),
      wrong: GENERIC_BOSS_LINES.wrong.map(fill),
      retreat: fill(GENERIC_BOSS_LINES.retreat),
      fail: fill(GENERIC_BOSS_LINES.fail),
      freed: usingAlt ? { vi: `${name} bước ra khỏi sương, mỉm cười với con.` } : (story?.freed || { vi: `${name} mỉm cười với con.` }),
    },
  };
}

// Câu Mở ải mặc định (tách rõ intro_vi dẫn truyện & dialogue.text_en lời nhân vật).
export function defaultOpenIntro({ unitId, regionName, companionName, speakerId = 'ong_tu' }) {
  const u = UNIT_NARRATOR[unitId];
  if (u) {
    return {
      intro_vi: u.intro_vi,
      dialogue: { speaker_id: u.dialogue.speaker_id, text_en: u.dialogue.text_en },
      by: u.by,
      vi: u.intro_vi,
      en: u.dialogue.text_en,
    };
  }
  const intro_vi = `Sương Câm đang phủ ${regionName}. Con cùng ${companionName} gọi chữ về lại nha!`;
  const text_en = "Let's learn together!";
  return {
    intro_vi,
    dialogue: { speaker_id: speakerId, text_en },
    by: speakerId,
    vi: intro_vi,
    en: text_en,
  };
}
