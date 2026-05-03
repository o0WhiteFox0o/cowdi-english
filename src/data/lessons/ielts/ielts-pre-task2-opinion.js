// Track: ielts — IELTS Pre-Intermediate Task 2: Opinion Essay (Band 4.5 – 5.5)

export const IELTS_PRE_TASK2_OPINION_LESSON = {
  id: "ielts-pre-task2-opinion",
  title: "IELTS Task 2 — Opinion Essay",
  description: "Viết bài luận đưa ý kiến — cấu trúc 4 đoạn, linking words, lý do & ví dụ",
  level: "intermediate",
  icon: "💭",
  examTag: "ielts",
  ieltsBand: "4.5-5.5",
  vocabulary: [
    { word: "Opinion",      phonetic: "/əˈpɪnjən/",      meaning: "Ý kiến",          example: "In my opinion, exercise is essential.",  illustration: "💭" },
    { word: "Argue",        phonetic: "/ˈɑːɡjuː/",       meaning: "Lập luận",         example: "Some people argue that…",                  illustration: "🗣️" },
    { word: "Claim",        phonetic: "/kleɪm/",         meaning: "Khẳng định",       example: "Critics claim that the cost is too high.", illustration: "📢" },
    { word: "Support",      phonetic: "/səˈpɔːt/",       meaning: "Ủng hộ",          example: "I strongly support this idea.",           illustration: "👍" },
    { word: "Oppose",       phonetic: "/əˈpəʊz/",        meaning: "Phản đối",         example: "Many parents oppose the new rule.",       illustration: "👎" },
    { word: "Evidence",     phonetic: "/ˈevɪdəns/",      meaning: "Bằng chứng",       example: "There is strong evidence to support this.", illustration: "🔍" },
    { word: "Furthermore",  phonetic: "/ˌfɜːðəˈmɔː/",    meaning: "Hơn nữa",         example: "Furthermore, it saves time and money.",   illustration: "➕" },
    { word: "However",      phonetic: "/haʊˈevə/",       meaning: "Tuy nhiên",        example: "However, there are some drawbacks.",      illustration: "↩️" },
    { word: "Therefore",    phonetic: "/ˈðeəfɔː/",       meaning: "Vì vậy",          example: "Therefore, I believe this is the best choice.", illustration: "➡️" },
    { word: "Conclude",     phonetic: "/kənˈkluːd/",     meaning: "Kết luận",         example: "To conclude, I think the benefits outweigh the drawbacks.", illustration: "🏁" },
    { word: "Outweigh",     phonetic: "/ˌaʊtˈweɪ/",      meaning: "Vượt trội hơn",    example: "The advantages outweigh the disadvantages.", illustration: "⚖️" },
    { word: "Issue",        phonetic: "/ˈɪʃuː/",         meaning: "Vấn đề",          example: "Climate change is a global issue.",        illustration: "❗" },
  ],
  grammar: [
    {
      title: "Cấu trúc 4 đoạn cho Opinion Essay",
      explanation: "1) Introduction: paraphrase đề + nêu quan điểm. 2) Body 1: lý do 1 + ví dụ. 3) Body 2: lý do 2 + ví dụ. 4) Conclusion: nhắc lại quan điểm.",
      examples: [
        { en: "In my opinion, working from home is more productive than working in an office.", vi: "Theo tôi, làm việc tại nhà năng suất hơn ở văn phòng." },
        { en: "Firstly, it saves commuting time. For example, I save 2 hours a day.",            vi: "Thứ nhất, tiết kiệm thời gian đi lại. Ví dụ, tôi tiết kiệm 2 giờ/ngày." },
        { en: "In conclusion, I firmly believe working from home brings more benefits.",         vi: "Tóm lại, tôi tin chắc làm việc tại nhà mang lại nhiều lợi ích hơn." },
      ],
    },
    {
      title: "Cụm từ thể hiện quan điểm",
      explanation: "Tránh lặp \"I think\". Dùng đa dạng: In my opinion, From my perspective, I firmly believe, It seems to me that, I would argue that.",
      examples: [
        { en: "From my perspective, education is the key to success.",          vi: "Theo quan điểm của tôi, giáo dục là chìa khóa thành công." },
        { en: "I firmly believe that exercise improves mental health.",          vi: "Tôi tin chắc rằng tập thể dục cải thiện sức khỏe tinh thần." },
        { en: "It seems to me that technology is changing too quickly.",         vi: "Theo tôi thấy, công nghệ đang thay đổi quá nhanh." },
      ],
    },
  ],
  quiz: [
    { question: "Bài Opinion Essay nên có mấy đoạn?",                       options: ["2", "3", "4", "5"],                                                          correct: 2 },
    { question: "\"Furthermore\" gần nghĩa với:",                            options: ["Tuy nhiên", "Hơn nữa", "Vì vậy", "Ví dụ"],                                  correct: 1 },
    { question: "\"Outweigh\" nghĩa là:",                                    options: ["Vượt trội hơn", "Bằng nhau", "Thiếu", "Chia đôi"],                          correct: 0 },
    { question: "Cụm thay thế \"I think\" hay nhất:",                         options: ["I love", "I firmly believe", "I want", "I have"],                            correct: 1 },
    { question: "Đoạn body nên có:",                                          options: ["Chỉ ý kiến", "Lý do + ví dụ cụ thể", "Số liệu thống kê", "Câu hỏi"],         correct: 1 },
    { question: "Câu kết bài nên:",                                          options: ["Đưa thông tin mới", "Nhắc lại quan điểm và tóm tắt", "Đặt câu hỏi", "Để trống"], correct: 1 },
  ],
};

export default IELTS_PRE_TASK2_OPINION_LESSON;
