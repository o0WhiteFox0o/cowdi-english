// Track: ielts — IELTS Foundation Reading (Band 3.0 – 4.0)

export const IELTS_FOUNDATION_READING_LESSON = {
  id: "ielts-foundation-reading",
  title: "IELTS Foundation Reading",
  description: "Đọc hiểu căn bản — đoạn ngắn, câu hỏi True/False/Not Given",
  level: "beginner",
  icon: "📖",
  examTag: "ielts",
  ieltsBand: "3.0-4.0",
  vocabulary: [
    { word: "Article",     phonetic: "/ˈɑːtɪkl/",     meaning: "Bài báo",          example: "I read an article about health.",              illustration: "📰" },
    { word: "Title",       phonetic: "/ˈtaɪtl/",      meaning: "Tiêu đề",          example: "The title is on the first line.",              illustration: "🏷️" },
    { word: "Paragraph",   phonetic: "/ˈpærəɡrɑːf/",  meaning: "Đoạn văn",         example: "Each paragraph has one main idea.",            illustration: "📄" },
    { word: "Main idea",   phonetic: "/meɪn aɪˈdɪə/", meaning: "Ý chính",          example: "Find the main idea of each paragraph.",        illustration: "💡" },
    { word: "Detail",      phonetic: "/ˈdiːteɪl/",    meaning: "Chi tiết",         example: "Underline important details.",                 illustration: "🔍" },
    { word: "True",        phonetic: "/truː/",        meaning: "Đúng",             example: "The statement is true.",                       illustration: "✅" },
    { word: "False",       phonetic: "/fɔːls/",       meaning: "Sai",              example: "This information is false.",                   illustration: "❌" },
    { word: "Mention",     phonetic: "/ˈmenʃn/",      meaning: "Đề cập",           example: "The text does not mention this fact.",         illustration: "💬" },
    { word: "Skim",        phonetic: "/skɪm/",        meaning: "Đọc lướt",         example: "Skim the article to find the topic.",          illustration: "👀" },
    { word: "Scan",        phonetic: "/skæn/",        meaning: "Đọc quét",         example: "Scan for numbers and names.",                  illustration: "🔎" },
    { word: "Keyword",     phonetic: "/ˈkiːwɜːd/",    meaning: "Từ khóa",          example: "Underline keywords in each question.",         illustration: "🔑" },
    { word: "Passage",     phonetic: "/ˈpæsɪdʒ/",     meaning: "Đoạn văn dài",     example: "The passage has 3 paragraphs.",                illustration: "📜" },
  ],
  grammar: [
    {
      title: "Câu hỏi Yes/No với động từ to be",
      explanation: "Đảo to be ra trước chủ ngữ để hỏi: Is/Are/Was/Were + S + ...?",
      examples: [
        { en: "Is the article about food?",        vi: "Bài báo có phải về thức ăn không?" },
        { en: "Are the students busy today?",      vi: "Học sinh có bận hôm nay không?" },
        { en: "Was the weather nice yesterday?",   vi: "Hôm qua thời tiết có đẹp không?" },
      ],
    },
    {
      title: "Đại từ chỉ định: this, that, these, those",
      explanation: "This/these (gần) – That/those (xa). Đọc IELTS thường dùng để liên kết câu.",
      examples: [
        { en: "This idea is interesting.",          vi: "Ý này thú vị." },
        { en: "Those statements are not correct.",  vi: "Những câu đó không đúng." },
        { en: "These books are useful for IELTS.",  vi: "Những cuốn sách này hữu ích cho IELTS." },
      ],
    },
  ],
  quiz: [
    { question: "Đọc lướt để tìm chủ đề chung gọi là:",         options: ["scan", "skim", "translate", "guess"],         correct: 1 },
    { question: "Đọc quét để tìm số / tên gọi là:",              options: ["skim", "scan", "memorize", "ignore"],         correct: 1 },
    { question: "\"Paragraph\" có nghĩa là:",                    options: ["Tiêu đề", "Câu", "Đoạn văn", "Trang"],        correct: 2 },
    { question: "Khi câu hỏi True/False/Not Given, \"Not Given\" nghĩa là:", options: ["Đúng", "Sai", "Không được nhắc đến trong bài", "Khó hiểu"], correct: 2 },
    { question: "\"Keyword\" có nghĩa là:",                      options: ["Từ vựng mới", "Từ khóa quan trọng", "Câu hỏi", "Tiêu đề"], correct: 1 },
    { question: "Trước khi trả lời câu hỏi, bạn nên:",           options: ["Đọc kỹ từng từ", "Skim/scan để tìm vị trí", "Dịch toàn bài", "Đoán bừa"], correct: 1 },
  ],
};

export default IELTS_FOUNDATION_READING_LESSON;
