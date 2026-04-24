// Track: ielts — IELTS Pre-Intermediate Writing (Band 4.5 – 5.5)

export const IELTS_PRE_WRITING_LESSON = {
  id: "ielts-pre-writing",
  title: "IELTS Pre-Intermediate Writing",
  description: "Viết đoạn mô tả và đoạn ý kiến đơn giản, có liên từ",
  level: "intermediate",
  icon: "✏️",
  examTag: "ielts",
  ieltsBand: "4.5-5.5",
  vocabulary: [
    { word: "Introduction",  phonetic: "/ˌɪntrəˈdʌkʃn/",   meaning: "Mở bài",           example: "Write a clear introduction.",                  illustration: "🎬" },
    { word: "Conclusion",    phonetic: "/kənˈkluːʒn/",     meaning: "Kết bài",          example: "Sum up your ideas in the conclusion.",         illustration: "🎯" },
    { word: "Paragraph",     phonetic: "/ˈpærəɡrɑːf/",     meaning: "Đoạn văn",         example: "Each paragraph has one main idea.",             illustration: "📄" },
    { word: "However",       phonetic: "/haʊˈevər/",       meaning: "Tuy nhiên",        example: "I agree; however, some details need care.",     illustration: "🔀" },
    { word: "Moreover",      phonetic: "/mɔːrˈəʊvər/",     meaning: "Hơn nữa",          example: "It is cheap; moreover, it is safe.",            illustration: "➕" },
    { word: "For example",   phonetic: "/fər ɪɡˈzɑːmpl/",  meaning: "Ví dụ",            example: "Many sports, for example football, are popular.", illustration: "💡" },
    { word: "Overall",       phonetic: "/ˌəʊvərˈɔːl/",     meaning: "Nhìn chung",       example: "Overall, sales went up.",                       illustration: "🌍" },
    { word: "Illustrate",    phonetic: "/ˈɪləstreɪt/",     meaning: "Minh hoạ",         example: "The chart illustrates changes in population.",  illustration: "🖼️" },
    { word: "Trend",         phonetic: "/trend/",          meaning: "Xu hướng",         example: "The trend has been upward since 2010.",         illustration: "📈" },
    { word: "Proportion",    phonetic: "/prəˈpɔːʃn/",      meaning: "Tỉ lệ",            example: "A large proportion of students use phones.",    illustration: "📊" },
  ],
  grammar: [
    {
      title: "Cấu trúc mở bài Task 1 đơn giản",
      explanation: "\"The chart / graph shows / illustrates ... (from ... to ...)\". Đổi từ trong đề để paraphrase.",
      examples: [
        { en: "The bar chart shows the number of tourists from 2015 to 2020.", vi: "Biểu đồ cột cho thấy số du khách từ 2015 đến 2020." },
        { en: "The graph illustrates changes in population in three cities.",    vi: "Biểu đồ mô tả sự thay đổi dân số ở ba thành phố." },
        { en: "The table provides information about weekly expenses.",           vi: "Bảng cung cấp thông tin về chi tiêu hằng tuần." },
      ],
    },
    {
      title: "Liên từ liên kết (linking words)",
      explanation: "However (tuy nhiên), moreover (hơn nữa), overall (nhìn chung), for example (ví dụ) — giúp đoạn văn mạch lạc.",
      examples: [
        { en: "The cost is low; however, quality is also low.",          vi: "Giá thấp; tuy nhiên, chất lượng cũng thấp." },
        { en: "Reading is fun; moreover, it improves vocabulary.",       vi: "Đọc sách thú vị; hơn nữa, nó giúp tăng từ vựng." },
        { en: "Overall, the figure increased by 20%.",                    vi: "Nhìn chung, con số tăng 20%." },
      ],
    },
  ],
  quiz: [
    { question: "\"Conclusion\" nghĩa là:",                           options: ["Mở bài", "Kết bài", "Thân bài", "Tiêu đề"],                correct: 1 },
    { question: "\"Moreover\" có nghĩa gần với:",                      options: ["Tuy nhiên", "Hơn nữa", "Nhưng", "Vì"],                     correct: 1 },
    { question: "Mở bài Task 1 nên bắt đầu bằng:",                     options: ["I think...", "The chart shows...", "In conclusion...", "Firstly..."], correct: 1 },
    { question: "\"Overall\" thường đứng ở:",                          options: ["Thân bài", "Mở bài", "Câu kết / Overview", "Trong ví dụ"], correct: 2 },
    { question: "\"A large ___ of students use phones.\" (tỉ lệ)",      options: ["trend", "proportion", "paragraph", "paragraph"],           correct: 1 },
    { question: "Từ nào dùng để đưa ví dụ?",                           options: ["However", "Moreover", "For example", "Overall"],           correct: 2 },
  ],
};

export default IELTS_PRE_WRITING_LESSON;
