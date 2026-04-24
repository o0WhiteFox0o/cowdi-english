// Track: ielts — IELTS Pre-Intermediate Reading (Band 4.5 – 5.5)

export const IELTS_PRE_READING_LESSON = {
  id: "ielts-pre-reading",
  title: "IELTS Pre-Intermediate Reading",
  description: "Luyện đọc đoạn ngắn — tìm ý chính và thông tin chi tiết",
  level: "intermediate",
  icon: "📰",
  examTag: "ielts",
  ieltsBand: "4.5-5.5",
  vocabulary: [
    { word: "Article",       phonetic: "/ˈɑːtɪkl/",        meaning: "Bài báo",         example: "I read an article about health.",               illustration: "📰" },
    { word: "Headline",      phonetic: "/ˈhedlaɪn/",       meaning: "Tiêu đề",         example: "The headline was very catchy.",                  illustration: "🔠" },
    { word: "Main idea",     phonetic: "/meɪn aɪˈdɪə/",    meaning: "Ý chính",         example: "What is the main idea of this paragraph?",       illustration: "💡" },
    { word: "Detail",        phonetic: "/ˈdiːteɪl/",       meaning: "Chi tiết",        example: "Pay attention to small details.",                illustration: "🔍" },
    { word: "True",          phonetic: "/truː/",           meaning: "Đúng / Thật",     example: "The statement is true.",                         illustration: "✔️" },
    { word: "False",         phonetic: "/fɔːls/",          meaning: "Sai",             example: "This answer is false.",                          illustration: "❌" },
    { word: "Not given",     phonetic: "/nɒt ˈɡɪvn/",      meaning: "Không có thông tin", example: "If the text does not say, choose Not Given.", illustration: "❓" },
    { word: "Summary",       phonetic: "/ˈsʌməri/",        meaning: "Bản tóm tắt",     example: "Write a short summary of the text.",             illustration: "📝" },
    { word: "Purpose",       phonetic: "/ˈpɜːpəs/",        meaning: "Mục đích",        example: "The purpose of the article is to inform.",       illustration: "🎯" },
    { word: "Claim",         phonetic: "/kleɪm/",          meaning: "Nhận định",       example: "The writer claims that exercise saves time.",    illustration: "📢" },
    { word: "Evidence",      phonetic: "/ˈevɪdəns/",       meaning: "Bằng chứng",      example: "There is strong evidence for this idea.",        illustration: "🧾" },
    { word: "Conclude",      phonetic: "/kənˈkluːd/",      meaning: "Kết luận",        example: "The writer concludes that reading is important.", illustration: "✅" },
  ],
  grammar: [
    {
      title: "Dạng câu True / False / Not Given",
      explanation: "True = ý trùng bài đọc; False = ý trái với bài đọc; Not Given = bài không đề cập.",
      examples: [
        { en: "Text: 'Lan lives in Hanoi.' — Statement: 'Lan lives in Hanoi.' → True",           vi: "Câu trùng với bài → True" },
        { en: "Text: 'Lan lives in Hanoi.' — Statement: 'Lan lives in Da Nang.' → False",         vi: "Câu trái với bài → False" },
        { en: "Text: 'Lan lives in Hanoi.' — Statement: 'Lan has a brother.' → Not Given",        vi: "Không nhắc → Not Given" },
      ],
    },
    {
      title: "Từ đồng nghĩa & paraphrase",
      explanation: "Câu hỏi IELTS thường paraphrase bài đọc. Hãy học từ đồng nghĩa phổ biến.",
      examples: [
        { en: "big → large / huge",      vi: "lớn → to / khổng lồ" },
        { en: "start → begin",            vi: "bắt đầu" },
        { en: "show → illustrate / demonstrate", vi: "cho thấy → minh hoạ / chứng minh" },
      ],
    },
  ],
  quiz: [
    { question: "\"Headline\" nghĩa là:",                              options: ["Mục lục", "Tiêu đề", "Hình minh hoạ", "Chú thích"],         correct: 1 },
    { question: "Đáp án \"Not Given\" khi:",                           options: ["Câu trùng bài", "Câu trái bài", "Bài không đề cập", "Câu hỏi khó"], correct: 2 },
    { question: "\"Evidence\" nghĩa là:",                              options: ["Kết luận", "Bằng chứng", "Mục đích", "Câu chuyện"],         correct: 1 },
    { question: "\"Big\" có từ đồng nghĩa là:",                         options: ["small", "tiny", "large", "short"],                         correct: 2 },
    { question: "\"The writer ___ that reading is important.\"",        options: ["conclude", "concludes", "concluding", "concluded"],       correct: 1 },
    { question: "Mục đích (purpose) của bài báo khoa học thường là:",   options: ["Giải trí", "Quảng cáo", "Cung cấp thông tin", "Kể chuyện"], correct: 2 },
  ],
};

export default IELTS_PRE_READING_LESSON;
