// Track: general — Câu hỏi Wh- cơ bản

export const WH_QUESTIONS_LESSON = {
  id: "wh-questions",
  title: "Câu hỏi Wh- cơ bản",
  description: "What, Where, When, Who, Why, How — 6 từ hỏi quan trọng nhất",
  level: "beginner",
  icon: "❓",
  vocabulary: [
    { word: "What",   phonetic: "/wɒt/",   meaning: "Cái gì",       example: "What is your name?", illustration: "❓" },
    { word: "Where",  phonetic: "/wɛər/",  meaning: "Ở đâu",        example: "Where do you live?", illustration: "📍" },
    { word: "When",   phonetic: "/wɛn/",   meaning: "Khi nào",      example: "When is your birthday?", illustration: "📅" },
    { word: "Who",    phonetic: "/huː/",   meaning: "Ai",           example: "Who is that man?", illustration: "👤" },
    { word: "Why",    phonetic: "/waɪ/",   meaning: "Tại sao",      example: "Why are you late?", illustration: "🤷" },
    { word: "How",    phonetic: "/haʊ/",   meaning: "Như thế nào",  example: "How are you?", illustration: "🛠️" },
    { word: "Which",  phonetic: "/wɪtʃ/",  meaning: "Cái nào",      example: "Which one do you like?", illustration: "👈" },
    { word: "Whose",  phonetic: "/huːz/",  meaning: "Của ai",       example: "Whose pen is this?", illustration: "🖊️" },
    { word: "Answer", phonetic: "/ˈɑːnsər/", meaning: "Trả lời",    example: "Please answer my question.", illustration: "💬" },
    { word: "Question", phonetic: "/ˈkwɛstʃən/", meaning: "Câu hỏi", example: "I have a question.", illustration: "❔" },
  ],
  grammar: [
    {
      title: "Cấu trúc Wh-question",
      explanation: "Wh + trợ động từ (do/does/is/are/was/were) + chủ ngữ + động từ chính + ...?",
      examples: [
        { en: "What do you do?",     vi: "Bạn làm nghề gì?" },
        { en: "Where does she live?", vi: "Cô ấy sống ở đâu?" },
        { en: "When are you free?",  vi: "Khi nào bạn rảnh?" },
        { en: "Why did he leave?",   vi: "Tại sao anh ấy đi?" },
      ]
    },
    {
      title: "How + tính từ / trạng từ",
      explanation: "How thường ghép với từ khác để hỏi mức độ: How old (bao nhiêu tuổi), How many (bao nhiêu — đếm được), How much (bao nhiêu — không đếm), How long (bao lâu / dài), How often (thường xuyên thế nào).",
      examples: [
        { en: "How old are you?",        vi: "Bạn bao nhiêu tuổi?" },
        { en: "How many books do you have?", vi: "Bạn có bao nhiêu cuốn sách?" },
        { en: "How much is this?",       vi: "Cái này giá bao nhiêu?" },
        { en: "How often do you study?", vi: "Bạn học bao thường xuyên?" },
      ]
    },
    {
      title: "Who làm chủ ngữ",
      explanation: "Khi Who/What là CHỦ NGỮ, KHÔNG dùng trợ động từ và động từ chia ngôi 3 số ít.",
      examples: [
        { en: "Who lives here?",        vi: "Ai sống ở đây?" },
        { en: "What happened?",         vi: "Chuyện gì đã xảy ra?" },
        { en: "Who knows the answer?",  vi: "Ai biết câu trả lời?" },
      ]
    },
  ],
  quiz: [
    { question: "Hỏi tên: \"___ is your name?\"",         options: ["Where", "What", "How", "Who"], correct: 1 },
    { question: "Hỏi địa chỉ: \"___ do you live?\"",      options: ["When", "Why", "Where", "What"], correct: 2 },
    { question: "Hỏi tuổi: \"How ___ are you?\"",         options: ["many", "much", "old", "long"], correct: 2 },
    { question: "\"___ books do you have?\" (đếm được)",  options: ["How much", "How many", "How long", "How often"], correct: 1 },
    { question: "Câu \"Who ___ here?\" (Who là chủ ngữ)", options: ["do live", "lives", "are live", "is lives"], correct: 1 },
    { question: "Hỏi lý do dùng từ:",                     options: ["When", "Where", "Why", "Who"], correct: 2 },
  ]
};

export default WH_QUESTIONS_LESSON;
