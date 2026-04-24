// Track: ielts — IELTS Pre-Intermediate Vocabulary (Band 4.5 – 5.5)

export const IELTS_PRE_VOCAB_LESSON = {
  id: "ielts-pre-vocab",
  title: "IELTS Pre-Intermediate Vocabulary",
  description: "Từ vựng học thuật cơ bản — mô tả biểu đồ, đưa quan điểm",
  level: "intermediate",
  icon: "📊",
  examTag: "ielts",
  ieltsBand: "4.5-5.5",
  vocabulary: [
    { word: "Increase",      phonetic: "/ɪnˈkriːs/",       meaning: "Tăng",              example: "The population increased slightly last year.", illustration: "📈" },
    { word: "Decrease",      phonetic: "/dɪˈkriːs/",       meaning: "Giảm",              example: "Sales decreased in winter.",                  illustration: "📉" },
    { word: "Remain",        phonetic: "/rɪˈmeɪn/",        meaning: "Giữ nguyên",        example: "Prices remain stable this month.",            illustration: "➖" },
    { word: "Significant",   phonetic: "/sɪɡˈnɪfɪkənt/",   meaning: "Đáng kể",           example: "There was a significant rise in 2020.",       illustration: "⬆️" },
    { word: "Gradual",       phonetic: "/ˈɡrædʒuəl/",      meaning: "Dần dần",           example: "A gradual change is easier to accept.",       illustration: "🐢" },
    { word: "Opinion",       phonetic: "/əˈpɪnjən/",       meaning: "Ý kiến",            example: "In my opinion, exercise is important.",       illustration: "💭" },
    { word: "Agree",         phonetic: "/əˈɡriː/",         meaning: "Đồng ý",            example: "I agree with this statement.",                illustration: "👍" },
    { word: "Disagree",      phonetic: "/ˌdɪsəˈɡriː/",     meaning: "Không đồng ý",      example: "Some people disagree with the plan.",         illustration: "👎" },
    { word: "Benefit",       phonetic: "/ˈbenɪfɪt/",       meaning: "Lợi ích",           example: "Reading has many benefits.",                  illustration: "🎁" },
    { word: "Drawback",      phonetic: "/ˈdrɔːbæk/",       meaning: "Nhược điểm",        example: "One drawback is the high cost.",              illustration: "⚠️" },
    { word: "Environment",   phonetic: "/ɪnˈvaɪrənmənt/",  meaning: "Môi trường",        example: "We must protect the environment.",            illustration: "🌳" },
    { word: "Education",     phonetic: "/ˌedʒuˈkeɪʃn/",    meaning: "Giáo dục",          example: "Education opens many doors.",                 illustration: "🎓" },
  ],
  grammar: [
    {
      title: "So sánh hơn & hơn nhất (comparatives)",
      explanation: "Tính từ ngắn + -er / -est, tính từ dài dùng more / most. Dùng nhiều trong Writing Task 1.",
      examples: [
        { en: "Prices in 2020 were higher than in 2019.",       vi: "Giá năm 2020 cao hơn năm 2019." },
        { en: "Reading is more useful than watching TV.",        vi: "Đọc sách hữu ích hơn xem TV." },
        { en: "This is the most popular sport in my country.",   vi: "Đây là môn thể thao phổ biến nhất ở nước tôi." },
      ],
    },
    {
      title: "Liên từ so sánh (while, whereas)",
      explanation: "Dùng để so sánh hai nhóm / hai số liệu trong mô tả biểu đồ.",
      examples: [
        { en: "Men prefer football, while women prefer yoga.",          vi: "Đàn ông thích bóng đá, trong khi phụ nữ thích yoga." },
        { en: "Sales rose in Europe, whereas they fell in Asia.",       vi: "Doanh số tăng ở châu Âu, trong khi giảm ở châu Á." },
        { en: "Summer is hot, while winter is cold.",                   vi: "Mùa hè nóng, còn mùa đông lạnh." },
      ],
    },
  ],
  quiz: [
    { question: "\"Significant\" nghĩa là:",                            options: ["Nhỏ", "Đáng kể", "Chậm", "Không đổi"],                     correct: 1 },
    { question: "\"Prices ___ stable this month.\" (giữ nguyên)",         options: ["increase", "decrease", "remain", "rise"],                  correct: 2 },
    { question: "Trái nghĩa của \"benefit\" là:",                         options: ["opinion", "drawback", "agree", "gradual"],                 correct: 1 },
    { question: "\"Reading is ___ than watching TV.\"",                  options: ["more useful", "usefuler", "most useful", "as useful"],     correct: 0 },
    { question: "Chọn liên từ phù hợp: \"Men prefer football, ___ women prefer yoga.\"", options: ["because", "while", "so", "and"],              correct: 1 },
    { question: "\"In my opinion\" thường dùng ở đầu câu để:",            options: ["Hỏi ý", "Đưa ý kiến", "Từ chối", "Chào hỏi"],              correct: 1 },
  ],
};

export default IELTS_PRE_VOCAB_LESSON;
