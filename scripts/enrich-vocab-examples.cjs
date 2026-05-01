/**
 * Enrich vocabulary examples
 * For each word in src/data/vocab/*.js, ensure an `examples` field with 3 contextual sentences:
 *   1. The original `example` (kept).
 *   2. + 2 additional sentences chosen by topic-aware templates.
 *
 * Templates pick by:
 *   - topic id (animals, eating, drinking, sports, house, nature, transportation, public-places,
 *     human, love, holidays, countries, numbers)
 *   - subtopic id (e.g. eating-fruits, animals-pets) when finer context is useful
 *
 * Each template provides {en, vi, context} where {word} and {meaning} are interpolated.
 *
 * Idempotent: if a word already has `examples` array length >= 3, it's skipped.
 *
 * Run: node scripts/enrich-vocab-examples.cjs
 */
const fs = require('fs');
const path = require('path');

const VOCAB_DIR = path.join(__dirname, '..', 'src', 'data', 'vocab');

// ─── Topic-specific templates ────────────────────────────────────────────
// Each entry: [{ en, vi, context }]
// {word} = the English word (lowercased in en)
// {WORD} = the English word (capitalized at sentence start)
// {meaning} = Vietnamese meaning (already in VN)
const TEMPLATES = {
  animals: [
    { en: 'I saw a {word} at the zoo last weekend.',                vi: 'Cuối tuần trước tôi đã thấy {meaning} ở sở thú.', context: '🏞️ Sở thú' },
    { en: 'Do you have a {word} as a pet?',                          vi: 'Bạn có nuôi {meaning} làm thú cưng không?',          context: '🏠 Thú cưng' },
    { en: 'The {word} is a fascinating animal.',                     vi: '{meaning} là một loài vật thú vị.',                     context: '📚 Mô tả' },
  ],
  eating: [
    { en: 'I usually eat {word} for breakfast.',                     vi: 'Tôi thường ăn {meaning} vào bữa sáng.',                 context: '🍳 Bữa sáng' },
    { en: 'Could I have some {word}, please?',                       vi: 'Cho tôi xin một ít {meaning} nhé?',                       context: '🍽️ Đặt món' },
    { en: 'This {word} tastes really delicious.',                    vi: '{meaning} này ăn rất ngon.',                              context: '😋 Bình luận' },
  ],
  drinking: [
    { en: 'Would you like a glass of {word}?',                       vi: 'Bạn có muốn một ly {meaning} không?',                     context: '🥤 Mời uống' },
    { en: 'I drink {word} every morning.',                            vi: 'Tôi uống {meaning} mỗi sáng.',                            context: '☀️ Thói quen' },
    { en: 'Can I order a {word}, please?',                            vi: 'Cho tôi gọi một {meaning} nhé?',                          context: '🍷 Quán bar' },
  ],
  sports: [
    { en: 'I play {word} every weekend with my friends.',             vi: 'Tôi chơi {meaning} mỗi cuối tuần với bạn bè.',             context: '🏆 Cuối tuần' },
    { en: 'My favorite sport is {word}.',                             vi: 'Môn thể thao yêu thích của tôi là {meaning}.',             context: '❤️ Sở thích' },
    { en: 'Have you ever tried {word}?',                              vi: 'Bạn đã từng thử {meaning} chưa?',                          context: '❓ Hỏi đáp' },
  ],
  house: [
    { en: 'There is a {word} in my room.',                            vi: 'Có một {meaning} trong phòng tôi.',                       context: '🏠 Mô tả phòng' },
    { en: 'We need to buy a new {word} for the house.',               vi: 'Chúng ta cần mua một {meaning} mới cho ngôi nhà.',         context: '🛒 Mua sắm' },
    { en: 'Please clean the {word} before guests arrive.',            vi: 'Hãy lau dọn {meaning} trước khi khách đến.',               context: '🧹 Dọn dẹp' },
  ],
  nature: [
    { en: 'We watched the {word} during our hike.',                   vi: 'Chúng tôi đã ngắm {meaning} khi đi bộ đường dài.',         context: '🥾 Đi dã ngoại' },
    { en: 'The {word} looks beautiful at sunset.',                    vi: '{meaning} trông rất đẹp lúc hoàng hôn.',                   context: '🌅 Cảnh quan' },
    { en: 'Many people love the sound of the {word}.',                vi: 'Nhiều người yêu âm thanh của {meaning}.',                  context: '🎵 Cảm nhận' },
  ],
  transportation: [
    { en: 'I take the {word} to work every day.',                     vi: 'Tôi đi {meaning} đến chỗ làm mỗi ngày.',                   context: '🚦 Đi làm' },
    { en: 'How long does the {word} ride take?',                      vi: 'Đi bằng {meaning} mất bao lâu?',                            context: '⏰ Hỏi giờ' },
    { en: 'The {word} is my favorite way to travel.',                 vi: '{meaning} là cách di chuyển tôi yêu thích nhất.',          context: '✈️ Du lịch' },
  ],
  'public-places': [
    { en: 'I often go to the {word} on weekends.',                    vi: 'Tôi thường đi {meaning} vào cuối tuần.',                    context: '📅 Cuối tuần' },
    { en: 'The {word} is just around the corner.',                    vi: '{meaning} ở ngay góc đường thôi.',                          context: '🗺️ Chỉ đường' },
    { en: 'Could you tell me how to get to the {word}?',              vi: 'Bạn chỉ cho tôi đường tới {meaning} được không?',           context: '❓ Hỏi đường' },
  ],
  human: [
    { en: 'My {word} hurts a little today.',                          vi: '{meaning} của tôi hôm nay hơi đau.',                       context: '🏥 Sức khỏe' },
    { en: 'She has very kind {word}.',                                 vi: 'Cô ấy có {meaning} rất hiền.',                             context: '👀 Mô tả' },
    { en: 'Please describe his {word} to me.',                         vi: 'Hãy tả cho tôi {meaning} của anh ấy.',                     context: '🔎 Nhận diện' },
  ],
  love: [
    { en: 'They are really in {word} with each other.',                vi: 'Họ thật sự đang {meaning} nhau.',                          context: '💕 Cặp đôi' },
    { en: 'You make me feel so much {word}.',                          vi: 'Em làm anh cảm thấy thật {meaning}.',                       context: '💖 Tình cảm' },
    { en: 'I will always remember your {word}.',                       vi: 'Tôi sẽ luôn nhớ {meaning} của bạn.',                        context: '🥰 Kỷ niệm' },
  ],
  holidays: [
    { en: 'We celebrate {word} every year with family.',               vi: 'Chúng tôi tổ chức {meaning} hàng năm cùng gia đình.',      context: '🎉 Lễ hội' },
    { en: 'Happy {word} to you and your family!',                      vi: 'Chúc bạn và gia đình {meaning} vui vẻ!',                    context: '🎊 Chúc mừng' },
    { en: 'What do you usually do on {word}?',                         vi: 'Bạn thường làm gì vào dịp {meaning}?',                      context: '❓ Hỏi đáp' },
  ],
  countries: [
    { en: 'I have always wanted to visit {word}.',                     vi: 'Tôi luôn muốn đi {meaning}.',                              context: '✈️ Du lịch' },
    { en: 'Have you ever been to {word}?',                             vi: 'Bạn đã từng đến {meaning} chưa?',                          context: '❓ Hỏi đáp' },
    { en: 'The food in {word} is amazing.',                            vi: 'Đồ ăn ở {meaning} cực kỳ ngon.',                            context: '🍜 Văn hóa' },
  ],
  numbers: [
    { en: 'Can you count to {word}?',                                  vi: 'Bạn đếm tới {meaning} được không?',                         context: '🔢 Đếm số' },
    { en: 'There are {word} people in my class.',                      vi: 'Lớp tôi có {meaning} người.',                               context: '🏫 Mô tả' },
    { en: 'I will be back in {word} minutes.',                         vi: 'Tôi quay lại trong {meaning} phút nữa.',                    context: '⏰ Thời gian' },
  ],
};

// Generic fallback
const GENERIC = [
  { en: 'I want to learn more about {word}.',                          vi: 'Tôi muốn tìm hiểu thêm về {meaning}.',                     context: '📚 Học tập' },
  { en: 'Could you explain {word} to me?',                             vi: 'Bạn giải thích {meaning} cho tôi được không?',              context: '❓ Hỏi đáp' },
  { en: '{WORD} is something I see every day.',                        vi: '{meaning} là điều tôi gặp hàng ngày.',                     context: '🌟 Hằng ngày' },
];

function interp(tpl, word, meaning) {
  return tpl
    .replace(/\{word\}/g, word.toLowerCase())
    .replace(/\{WORD\}/g, word.charAt(0).toUpperCase() + word.slice(1))
    .replace(/\{meaning\}/g, meaning);
}

function buildExamples(word, meaning, originalExample, topicId) {
  const pool = TEMPLATES[topicId] || GENERIC;
  // Pick 2 templates that don't visually duplicate the original example
  const lowerOrig = (originalExample || '').toLowerCase();
  const picked = [];
  for (const t of pool) {
    if (picked.length >= 2) break;
    const en = interp(t.en, word, meaning);
    if (en.toLowerCase() === lowerOrig) continue;
    picked.push({ en, vi: interp(t.vi, word, meaning), context: t.context });
  }
  while (picked.length < 2) {
    // top up from generic
    const t = GENERIC[picked.length % GENERIC.length];
    picked.push({
      en: interp(t.en, word, meaning),
      vi: interp(t.vi, word, meaning),
      context: t.context,
    });
  }
  const examples = [];
  if (originalExample) examples.push({ en: originalExample, vi: '', context: '✏️ Cơ bản' });
  examples.push(...picked);
  return examples;
}

function processFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  // Detect topic id from "id: \"xxx\"," near top
  const topicIdMatch = src.match(/id:\s*"([^"]+)"/);
  const topicId = topicIdMatch ? topicIdMatch[1] : '';
  if (!TEMPLATES[topicId]) {
    console.log(`  → topic "${topicId}" — using GENERIC templates`);
  }

  // Walk through each subtopic block to detect more granular id (optional) — skipped, top-level is enough
  let added = 0;
  let skipped = 0;

  // Match each word object: { word: "X", phonetic: ..., meaning: "Y", example: "Z", ...optional fields... }
  // We use a regex on the {} blocks that contain "word:" and "meaning:" and add `examples: [...]` if missing.
  const newSrc = src.replace(/\{\s*word:\s*"([^"]+)",[\s\S]*?\}(?=\s*[,\]])/g, (block, wordVal) => {
    if (/examples\s*:/.test(block)) { skipped++; return block; }
    const meaningMatch = block.match(/meaning:\s*"((?:[^"\\]|\\.)*)"/);
    const exampleMatch = block.match(/example:\s*"((?:[^"\\]|\\.)*)"/);
    const meaning = meaningMatch ? meaningMatch[1] : '';
    const example = exampleMatch ? exampleMatch[1].replace(/\\"/g, '"') : '';
    const examples = buildExamples(wordVal, meaning, example, topicId);
    const examplesJson = JSON.stringify(examples, null, 0)
      .replace(/^\[/, '[\n            ')
      .replace(/\},\{/g, '},\n            {')
      .replace(/\]$/, '\n          ]');
    // Insert before the closing `}`
    const insertion = `,\n          examples: ${examplesJson}`;
    added++;
    return block.replace(/\}$/, `${insertion}\n        }`);
  });

  if (added > 0) {
    fs.writeFileSync(filePath, newSrc, 'utf8');
  }
  return { added, skipped };
}

function main() {
  const files = fs.readdirSync(VOCAB_DIR).filter((f) => f.endsWith('.js') && f !== 'index.js');
  let totalAdded = 0;
  let totalSkipped = 0;
  files.forEach((f) => {
    const fp = path.join(VOCAB_DIR, f);
    console.log(`Processing ${f}…`);
    const { added, skipped } = processFile(fp);
    console.log(`  +${added} enriched, ${skipped} already had examples`);
    totalAdded += added;
    totalSkipped += skipped;
  });
  console.log(`\n✅ Done. Enriched ${totalAdded} words. Skipped ${totalSkipped} (already enriched).`);
}

main();
