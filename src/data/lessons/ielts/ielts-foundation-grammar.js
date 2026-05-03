// Track: ielts — IELTS Foundation Grammar (Band 3.0 – 4.0)

export const IELTS_FOUNDATION_GRAMMAR_LESSON = {
  id: "ielts-foundation-grammar",
  title: "IELTS Foundation Grammar",
  description: "Ngữ pháp cơ bản: thì hiện tại, quá khứ, tương lai cho người mới",
  level: "beginner",
  icon: "📐",
  examTag: "ielts",
  ieltsBand: "3.0-4.0",
  vocabulary: [
    { word: "Yesterday",  phonetic: "/ˈjestədeɪ/",   meaning: "Hôm qua",       example: "I went to school yesterday.",            illustration: "📅" },
    { word: "Tomorrow",   phonetic: "/təˈmɒrəʊ/",    meaning: "Ngày mai",      example: "I will meet her tomorrow.",              illustration: "🌅" },
    { word: "Already",    phonetic: "/ɔːlˈredi/",    meaning: "Đã rồi",        example: "I have already finished my homework.",   illustration: "✅" },
    { word: "Never",      phonetic: "/ˈnevər/",      meaning: "Không bao giờ", example: "I have never been to London.",           illustration: "🚫" },
    { word: "Often",      phonetic: "/ˈɒfn/",        meaning: "Thường xuyên",  example: "She often visits her grandmother.",      illustration: "🔁" },
    { word: "Sometimes",  phonetic: "/ˈsʌmtaɪmz/",   meaning: "Thỉnh thoảng",  example: "Sometimes I cook dinner.",               illustration: "🤔" },
    { word: "Usually",    phonetic: "/ˈjuːʒuəli/",   meaning: "Thường",        example: "I usually wake up at 6 a.m.",            illustration: "⏰" },
    { word: "Rarely",     phonetic: "/ˈreəli/",      meaning: "Hiếm khi",      example: "He rarely eats fast food.",              illustration: "🥗" },
    { word: "Plan",       phonetic: "/plæn/",        meaning: "Kế hoạch",      example: "I plan to study abroad.",                illustration: "📋" },
    { word: "Finish",     phonetic: "/ˈfɪnɪʃ/",      meaning: "Hoàn thành",    example: "I finished my report last night.",       illustration: "🏁" },
    { word: "Start",      phonetic: "/stɑːt/",       meaning: "Bắt đầu",       example: "Class starts at 8 a.m.",                 illustration: "▶️" },
    { word: "Stop",       phonetic: "/stɒp/",        meaning: "Dừng",          example: "Please stop talking in class.",          illustration: "🛑" },
  ],
  grammar: [
    {
      title: "Past Simple — kể chuyện đã xảy ra",
      explanation: "Động từ thường thêm -ed ở quá khứ. Động từ bất quy tắc phải học thuộc (go → went, eat → ate, see → saw).",
      examples: [
        { en: "I visited my grandparents last weekend.", vi: "Tôi thăm ông bà vào cuối tuần trước." },
        { en: "She went to the market yesterday.",        vi: "Cô ấy đi chợ hôm qua." },
        { en: "We watched a movie two days ago.",         vi: "Chúng tôi xem phim hai ngày trước." },
      ],
    },
    {
      title: "Future Simple — nói về kế hoạch",
      explanation: "Dùng will + V hoặc be going to + V để nói về tương lai. \"Going to\" dùng cho kế hoạch đã định, \"will\" cho quyết định ngay lúc đó.",
      examples: [
        { en: "I will call you later.",                   vi: "Tôi sẽ gọi bạn sau." },
        { en: "She is going to study in Australia.",      vi: "Cô ấy sẽ đi học ở Úc." },
        { en: "It will rain tomorrow.",                   vi: "Mai trời sẽ mưa." },
      ],
    },
    {
      title: "Trạng từ tần suất (frequency adverbs)",
      explanation: "Always, usually, often, sometimes, rarely, never — đứng trước động từ thường, sau động từ to be.",
      examples: [
        { en: "I always brush my teeth in the morning.",  vi: "Tôi luôn đánh răng buổi sáng." },
        { en: "She is never late for class.",             vi: "Cô ấy không bao giờ trễ học." },
        { en: "We sometimes go camping in summer.",       vi: "Chúng tôi thỉnh thoảng đi cắm trại vào mùa hè." },
      ],
    },
  ],
  quiz: [
    { question: "Chia động từ: \"I ___ to school yesterday.\"",          options: ["go", "went", "going", "gone"],                          correct: 1 },
    { question: "\"Tomorrow\" thường dùng với thì nào?",                  options: ["Quá khứ", "Hiện tại đơn", "Tương lai", "Hiện tại tiếp diễn"], correct: 2 },
    { question: "Trạng từ \"never\" đứng ở đâu?",                          options: ["Cuối câu", "Trước động từ thường", "Sau danh từ", "Đầu câu"], correct: 1 },
    { question: "Quá khứ của \"eat\" là:",                                 options: ["eated", "ate", "eaten", "eats"],                        correct: 1 },
    { question: "\"She ___ going to study abroad.\"",                      options: ["is", "are", "be", "am"],                                correct: 0 },
    { question: "\"Often\" có nghĩa là:",                                  options: ["Hiếm khi", "Thường xuyên", "Không bao giờ", "Luôn luôn"], correct: 1 },
  ],
};

export default IELTS_FOUNDATION_GRAMMAR_LESSON;
