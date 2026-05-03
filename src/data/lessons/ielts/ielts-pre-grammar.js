// Track: ielts — IELTS Pre-Intermediate Grammar (Band 4.5 – 5.5)

export const IELTS_PRE_GRAMMAR_LESSON = {
  id: "ielts-pre-grammar",
  title: "IELTS Pre-Intermediate Grammar",
  description: "Hiện tại hoàn thành, mệnh đề quan hệ, câu điều kiện loại 1",
  level: "intermediate",
  icon: "🧩",
  examTag: "ielts",
  ieltsBand: "4.5-5.5",
  vocabulary: [
    { word: "Already",     phonetic: "/ɔːlˈredi/",      meaning: "Đã rồi",          example: "I have already eaten.",                   illustration: "✅" },
    { word: "Yet",         phonetic: "/jet/",           meaning: "Chưa / vẫn",      example: "Have you finished yet?",                  illustration: "❓" },
    { word: "Since",       phonetic: "/sɪns/",          meaning: "Từ khi",          example: "I have lived here since 2020.",           illustration: "📍" },
    { word: "For",         phonetic: "/fɔː/",           meaning: "Trong (khoảng)",  example: "I have studied English for 5 years.",     illustration: "⏱️" },
    { word: "Recently",    phonetic: "/ˈriːsntli/",     meaning: "Gần đây",         example: "I have recently moved house.",            illustration: "🆕" },
    { word: "Whose",       phonetic: "/huːz/",          meaning: "Của ai",          example: "The girl whose bag is red is my friend.", illustration: "👜" },
    { word: "Whom",        phonetic: "/huːm/",          meaning: "Người mà",        example: "The man whom I met is a doctor.",         illustration: "👨" },
    { word: "Whose",       phonetic: "/huːz/",          meaning: "Mà của",          example: "The boy whose dog is missing cried.",     illustration: "🐶" },
    { word: "Possible",    phonetic: "/ˈpɒsəbl/",       meaning: "Có thể",          example: "It is possible to learn English fast.",   illustration: "💡" },
    { word: "Likely",      phonetic: "/ˈlaɪkli/",       meaning: "Có khả năng",     example: "It is likely to rain tomorrow.",          illustration: "🌧️" },
    { word: "Cause",       phonetic: "/kɔːz/",          meaning: "Gây ra",          example: "Pollution causes health problems.",       illustration: "💥" },
    { word: "Effect",      phonetic: "/ɪˈfekt/",        meaning: "Hậu quả",         example: "Stress has a bad effect on health.",      illustration: "📉" },
  ],
  grammar: [
    {
      title: "Hiện tại hoàn thành (Present Perfect)",
      explanation: "S + have/has + V3. Diễn tả hành động bắt đầu trong quá khứ và còn liên quan đến hiện tại. Dấu hiệu: just, already, yet, ever, never, since, for, recently.",
      examples: [
        { en: "I have just finished my homework.",          vi: "Tôi vừa làm xong bài tập." },
        { en: "She has lived in Hanoi for 10 years.",        vi: "Cô ấy sống ở Hà Nội được 10 năm rồi." },
        { en: "Have you ever been to Japan?",                 vi: "Bạn đã từng đến Nhật chưa?" },
      ],
    },
    {
      title: "Mệnh đề quan hệ (relative clauses)",
      explanation: "Who (người), which (vật), that (cả hai), whose (sở hữu). Bổ nghĩa cho danh từ đứng trước.",
      examples: [
        { en: "The woman who lives next door is a teacher.",        vi: "Người phụ nữ sống cạnh nhà là giáo viên." },
        { en: "The book which I bought yesterday is interesting.",   vi: "Cuốn sách tôi mua hôm qua thật thú vị." },
        { en: "I have a friend whose father is a doctor.",           vi: "Tôi có một người bạn có bố là bác sĩ." },
      ],
    },
    {
      title: "Câu điều kiện loại 1 (First Conditional)",
      explanation: "If + present simple, will + V — diễn tả khả năng có thật trong tương lai.",
      examples: [
        { en: "If it rains, I will stay at home.",          vi: "Nếu trời mưa, tôi sẽ ở nhà." },
        { en: "If you study hard, you will pass.",          vi: "Nếu bạn học chăm chỉ, bạn sẽ đỗ." },
        { en: "If she is free, she will come.",             vi: "Nếu cô ấy rảnh, cô ấy sẽ đến." },
      ],
    },
  ],
  quiz: [
    { question: "Chia: \"I ___ (live) here for 5 years.\"",                options: ["live", "lived", "have lived", "am living"],                correct: 2 },
    { question: "Mệnh đề quan hệ với người dùng:",                          options: ["which", "who", "where", "when"],                            correct: 1 },
    { question: "\"If it rains, I ___ at home.\"",                          options: ["stay", "stayed", "will stay", "would stay"],                correct: 2 },
    { question: "\"Since\" và \"for\" — chọn đúng: \"I've worked here ___ 3 years.\"", options: ["since", "for", "in", "at"],                          correct: 1 },
    { question: "Câu nào dùng đúng hiện tại hoàn thành?",                  options: ["I have see him yesterday.", "I have seen him before.", "I have saw him.", "I has seen him."], correct: 1 },
    { question: "Câu điều kiện loại 1 dùng để:",                            options: ["Nói chuyện không có thật", "Diễn tả khả năng có thật trong tương lai", "Kể chuyện quá khứ", "Đưa lời khuyên"], correct: 1 },
  ],
};

export default IELTS_PRE_GRAMMAR_LESSON;
