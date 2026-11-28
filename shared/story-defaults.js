// shared/story-defaults.js — Lớp dẫn nhập MẶC ĐỊNH cho mọi bài CHƯA có kịch bản riêng
// (mọi bài ngoài 12 bài int-u1..u3 trong story-season2.js).
// Thứ tự ưu tiên: SEASON2_LESSONS[bài] → story-defaults (vùng / unit) → kho screen_intro.
// Luật hình giữ nguyên: người dẫn là pet khác → C4; Boss → C5 Legendary, trùng pet đồng hành → alt.
//
// Boss mỗi vùng chọn theo Story Bible 5.2 (pet có Lie, có ảnh Legendary trong repo).
// Không dùng: Shadow (lộ twist int-u8), Monk (không đánh trong chùa), Ginseng/Prisma (cung phẳng),
// Bánh Bao (chưa có ảnh C5 — khi có ảnh thì đổi CN sang 'bun').

export const REGION_BOSS = {
  BD:  { pet: 'flippy',        alt: 'pingu',  lieVi: 'Hỏi lại là xấu hổ.',
         enterVi: 'Flippy gật gù trong sương, ai nói gì cũng "Yes… yes…" cho qua.',
         freed: { vi: 'Flippy cười toe: hỏi lại không xấu hổ chút nào!', en: 'Could you say that again?' } },
  VS:  { pet: 'bamboo_spirit', alt: 'bamboo', lieVi: 'Rừng cần im lặng mới bình yên.',
         enterVi: 'Linh Trúc mở miệng mà không ra tiếng. Lá trúc đứng im.',
         freed: { vi: 'Linh Trúc cất tiếng: rừng sống nhờ tiếng gọi nhau.', en: 'Can you hear me?' } },
  RM:  { pet: 'sprout',        alt: 'paddy',  lieVi: 'Phải lớn mới làm được.',
         enterVi: 'Sprout co mình trong sương: "Mình còn nhỏ, chưa nói được đâu…"',
         freed: { vi: 'Sprout vươn lên: bắt đầu nhỏ cũng là bắt đầu!', en: 'I can do a little.' } },
  RT:  { pet: 'leo',           alt: 'foxie',  lieVi: 'Thủ lĩnh không được nói không biết.',
         enterVi: 'Leo đứng chắn lối, không chịu nói mình đang lạc trong sương.',
         freed: { vi: 'Leo gật đầu: nói "chưa biết" cũng là dũng cảm.', en: "I don't know yet." } },
  BS:  { pet: 'pingu',         alt: 'leafy',  lieVi: 'Nói ra thì bị cười; viết thì an toàn.',
         enterVi: 'Pingu chỉ viết lên cát rồi xoá, không dám cất tiếng.',
         freed: { vi: 'Pingu cất tiếng hát: sai thì mình thử lại!', en: 'Let me try again.' } },
  CN:  { pet: 'foxie',         alt: 'leo',    lieVi: 'Nói chuyện là phải thắng.',
         enterVi: 'Foxie trả giá ai cũng phải thắng, cả chợ nổi im re.',
         freed: { vi: 'Foxie bật cười: hỏi ý người kia mới vui!', en: 'What do you think?' } },
  TG:  { pet: 'owlbert',       alt: 'mimi',   lieVi: 'Đúng luật là đủ.',
         enterVi: 'Owlbert cầm bút đỏ lẩm bẩm "Sai… sai…", cả tháp im phăng phắc.',
         freed: { vi: 'Owlbert gác bút đỏ: hỏi ý người viết trước, rồi mới sửa.', en: 'What do you mean?' } },
  CNS: { pet: 'sparky',        alt: 'draco',  lieVi: 'Phải chuẩn bị thật kỹ mới được nói.',
         enterVi: 'Sparky lẩm nhẩm mãi trong sương, chưa dám nói câu nào.',
         freed: { vi: 'Sparky hét vang: nói luôn, sai thì sửa!', en: 'Here I go!' } },
  DDL: { pet: 'pumpkin',       alt: 'mimi',   lieVi: 'Lễ của mình lạ, đừng kể.',
         enterVi: 'Pumpkin tắt đèn lồng, trốn sau sương, không kể về lễ của mình.',
         freed: { vi: 'Pumpkin thắp đèn: lễ của mình cũng đáng kể!', en: 'In my country, we…' } },
  CBL: { pet: 'draco',         alt: 'sparky', lieVi: 'Giọng chuẩn mới đáng nghe.',
         enterVi: 'Draco đứng giữa Cổng Biển Lớn, chỉ mở cổng cho giọng "chuẩn".',
         freed: { vi: 'Draco cúi đầu: mọi giọng đều đáng được nghe.', en: 'Words are bridges.' } },
};

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

// Người dẫn theo unit (ghi đè người dẫn mặc định của vùng). Story Bible 6.3: exam-pron = Storm dạy "giọng của gió".
export const UNIT_NARRATOR = {
  'exam-pron':  { by: 'storm',  introVi: 'Storm dạy "giọng của gió": nghe kỹ từng âm, rồi nói theo nha!', introEn: 'Listen to the wind.' },
  'exam-intro': { by: 'ong_tu', introVi: 'Ông Tư chở anh Khoa tới Cổng Biển Lớn. Con đi cùng anh nha!', introEn: "Let's go to the gate." },
};

// Người dẫn mặc định của vùng: host đầu tiên KHÔNG trùng Boss vùng; vùng không có pet host → người chủ nhà.
export function defaultNarrator(region, regions, companionId) {
  const reg = regions?.[region];
  if (!reg) return 'ong_tu';
  const boss = REGION_BOSS[region]?.pet;
  const host = (reg.hosts || []).find((h) => h !== boss && h !== companionId)
            || (reg.hosts || []).find((h) => h !== boss);
  return host || reg.humanHost || 'ong_tu';
}

// Boss vùng (C5), đổi alt nếu trùng pet đồng hành. Kèm thoại chung đã thay {boss}.
export function regionBoss(region, companionId, bossName = null) {
  const b = REGION_BOSS[region];
  if (!b) return null;
  const pet = b.pet === companionId ? b.alt : b.pet;
  const name = bossName || pet;
  const fill = (o) => ({ ...o, vi: o.vi.replaceAll('{boss}', name) });
  const usingAlt = pet !== b.pet;
  return {
    pet, stage: 5, lieVi: b.lieVi,
    lines: {
      // Thoại riêng chỉ hợp với pet chính; khi dùng alt thì dùng thoại chung.
      enter: { vi: usingAlt ? `${name} đứng im trong sương, không nói một lời.` : b.enterVi },
      hit: GENERIC_BOSS_LINES.hit.map(fill),
      wrong: GENERIC_BOSS_LINES.wrong.map(fill),
      retreat: fill(GENERIC_BOSS_LINES.retreat),
      fail: fill(GENERIC_BOSS_LINES.fail),
      freed: usingAlt ? { vi: `${name} bước ra khỏi sương, mỉm cười với con.` } : b.freed,
    },
  };
}

// Câu Mở ải mặc định — KHÔNG được ghi cứng "Cowdi"; dùng tên pet đồng hành.
export function defaultOpenIntro({ unitId, regionName, companionName }) {
  const u = UNIT_NARRATOR[unitId];
  if (u) return { by: u.by, vi: u.introVi, en: u.introEn };
  return {
    by: null,
    vi: `Sương Câm đang phủ ${regionName}. Con cùng ${companionName} gọi chữ về lại nha!`,
    en: "Let's go!",
  };
}
