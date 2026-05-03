// Track: ielts — IELTS Foundation Writing (Band 3.0 – 4.0)

export const IELTS_FOUNDATION_WRITING_LESSON = {
  id: "ielts-foundation-writing",
  title: "IELTS Foundation Writing",
  description: "Viết câu căn bản — câu đơn, câu ghép, dấu câu",
  level: "beginner",
  icon: "✏️",
  examTag: "ielts",
  ieltsBand: "3.0-4.0",
  vocabulary: [
    { word: "Sentence",    phonetic: "/ˈsentəns/",    meaning: "Câu",            example: "Write a complete sentence.",                  illustration: "📝" },
    { word: "Subject",     phonetic: "/ˈsʌbdʒɪkt/",   meaning: "Chủ ngữ",        example: "Every sentence needs a subject.",             illustration: "👤" },
    { word: "Verb",        phonetic: "/vɜːb/",        meaning: "Động từ",        example: "Find the verb in each sentence.",             illustration: "🏃" },
    { word: "Object",      phonetic: "/ˈɒbdʒɪkt/",    meaning: "Tân ngữ",        example: "The object comes after the verb.",            illustration: "📦" },
    { word: "Comma",       phonetic: "/ˈkɒmə/",       meaning: "Dấu phẩy",       example: "Use a comma after \"however\".",              illustration: "," },
    { word: "Period",      phonetic: "/ˈpɪəriəd/",    meaning: "Dấu chấm",       example: "End your sentence with a period.",            illustration: "." },
    { word: "Capital",     phonetic: "/ˈkæpɪtl/",     meaning: "Chữ in hoa",     example: "Start with a capital letter.",                illustration: "🅰️" },
    { word: "Linking word",phonetic: "/ˈlɪŋkɪŋ wɜːd/",meaning: "Từ nối",         example: "\"And\", \"but\", \"so\" are linking words.", illustration: "🔗" },
    { word: "Topic",       phonetic: "/ˈtɒpɪk/",      meaning: "Chủ đề",         example: "The topic of the essay is health.",           illustration: "🎯" },
    { word: "Example",     phonetic: "/ɪɡˈzɑːmpl/",   meaning: "Ví dụ",          example: "Give an example to support your idea.",       illustration: "📌" },
    { word: "Reason",      phonetic: "/ˈriːzn/",      meaning: "Lý do",          example: "Give a clear reason for your opinion.",       illustration: "❓" },
    { word: "Conclusion",  phonetic: "/kənˈkluːʒn/",  meaning: "Kết luận",       example: "End your essay with a short conclusion.",     illustration: "🏁" },
  ],
  grammar: [
    {
      title: "Câu đơn (simple sentence) — S + V + O",
      explanation: "Câu đơn có 1 chủ ngữ + 1 động từ. Luôn bắt đầu bằng chữ in hoa và kết thúc bằng dấu chấm.",
      examples: [
        { en: "I like reading books.",                vi: "Tôi thích đọc sách." },
        { en: "She studies English every day.",       vi: "Cô ấy học tiếng Anh mỗi ngày." },
        { en: "My family lives in Hanoi.",            vi: "Gia đình tôi sống ở Hà Nội." },
      ],
    },
    {
      title: "Câu ghép với \"and / but / so\"",
      explanation: "Dùng từ nối để ghép 2 câu đơn. \"And\" thêm ý, \"but\" tương phản, \"so\" kết quả.",
      examples: [
        { en: "I like coffee, and I drink it daily.",       vi: "Tôi thích cà phê, và tôi uống mỗi ngày." },
        { en: "She is busy, but she always smiles.",         vi: "Cô ấy bận, nhưng luôn cười tươi." },
        { en: "It rained heavily, so we stayed home.",       vi: "Trời mưa to, nên chúng tôi ở nhà." },
      ],
    },
  ],
  quiz: [
    { question: "Câu đơn cần có những thành phần nào?",                  options: ["Chỉ động từ", "Chủ ngữ + động từ", "Chỉ tân ngữ", "Tính từ"],     correct: 1 },
    { question: "Từ nào dùng để chỉ tương phản?",                         options: ["and", "so", "but", "because"],                                  correct: 2 },
    { question: "Câu nào viết đúng?",                                     options: ["i like english.", "I like english", "I like English.", "i Like English"], correct: 2 },
    { question: "Dấu nào kết thúc câu trần thuật?",                        options: ["Dấu phẩy (,)", "Dấu chấm (.)", "Dấu hỏi (?)", "Dấu chấm than (!)"], correct: 1 },
    { question: "\"It rained heavily, ___ we stayed home.\"",             options: ["and", "but", "so", "or"],                                       correct: 2 },
    { question: "\"Conclusion\" trong bài viết là phần nào?",              options: ["Mở bài", "Thân bài", "Kết bài", "Tiêu đề"],                     correct: 2 },
  ],
};

export default IELTS_FOUNDATION_WRITING_LESSON;
