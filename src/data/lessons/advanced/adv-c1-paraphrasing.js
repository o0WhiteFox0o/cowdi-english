// Track: advanced — C1 Paraphrasing Skills

export const ADV_C1_PARAPHRASING_LESSON = {
  id: "adv-c1-paraphrasing",
  title: "C1 Paraphrasing",
  description: "Diễn đạt lại ý tưởng mà không thay đổi nghĩa, tránh đạo văn",
  level: "advanced",
  icon: "🔄",
  cefrLevel: "C1",
  vstepLevel: "C1",
  vocabulary: [
    { word: "Synonym", phonetic: "/ˈsɪnənɪm/", meaning: "Từ đồng nghĩa", example: "Use synonyms to vary your writing.", illustration: "🔁" },
    { word: "Restate", phonetic: "/riːˈsteɪt/", meaning: "Phát biểu lại", example: "Restate the question in your own words.", illustration: "💬" },
    { word: "Rephrase", phonetic: "/riːˈfreɪz/", meaning: "Diễn đạt lại", example: "Could you rephrase that?", illustration: "✏️" },
    { word: "Equivalent", phonetic: "/ɪˈkwɪvələnt/", meaning: "Tương đương", example: "Find an equivalent expression.", illustration: "⚖️" },
    { word: "Nominalization", phonetic: "/ˌnɒmɪnəlaɪˈzeɪʃən/", meaning: "Danh từ hóa", example: "Nominalization makes writing formal.", illustration: "📝" },
    { word: "Antonym", phonetic: "/ˈæntənɪm/", meaning: "Từ trái nghĩa", example: "Use antonyms with negation creatively.", illustration: "↔️" },
    { word: "Connotation", phonetic: "/ˌkɒnəˈteɪʃən/", meaning: "Hàm ý", example: "Watch the connotation of synonyms.", illustration: "💭" },
    { word: "Concise", phonetic: "/kənˈsaɪs/", meaning: "Súc tích", example: "Make your paraphrase concise.", illustration: "✂️" },
    { word: "Verbose", phonetic: "/vɜːˈbəʊs/", meaning: "Dài dòng", example: "Avoid verbose paraphrases.", illustration: "📏" },
    { word: "Acknowledge", phonetic: "/əkˈnɒlɪdʒ/", meaning: "Ghi nhận nguồn", example: "Always acknowledge the original author.", illustration: "🙏" },
    { word: "Verbatim", phonetic: "/vɜːˈbeɪtɪm/", meaning: "Nguyên văn", example: "Don't copy verbatim without quotes.", illustration: "📋" },
    { word: "Synthesize", phonetic: "/ˈsɪnθəsaɪz/", meaning: "Tổng hợp", example: "Synthesize ideas from multiple sources.", illustration: "🔗" }
  ],
  grammar: [
    {
      title: "Đổi cấu trúc khi paraphrase",
      explanation: "Thay đổi: (1) word class — verb→noun; (2) active↔passive; (3) word order. Giữ nguyên ý.",
      examples: [
        { en: "Original: Scientists discovered a new species. → Paraphrase: A new species was discovered by scientists.", vi: "Đổi sang bị động." },
        { en: "Original: They reduced costs. → Paraphrase: A reduction in costs was achieved.", vi: "Đổi verb \"reduce\" thành noun \"reduction\"." },
        { en: "Original: The plan succeeded. → Paraphrase: The success of the plan was evident.", vi: "Danh từ hóa và đổi cấu trúc." }
      ]
    },
    {
      title: "Paraphrase phrases",
      explanation: "\"In other words,...\", \"That is to say,...\", \"To put it differently,...\".",
      examples: [
        { en: "In other words, the policy backfired.", vi: "Nói cách khác, chính sách phản tác dụng." },
        { en: "That is to say, results were mixed.", vi: "Tức là, kết quả lẫn lộn." },
        { en: "To put it differently, action is overdue.", vi: "Nói theo cách khác, hành động đã quá muộn." }
      ]
    }
  ],
  quiz: [
    { question: "\"Verbatim\" nghĩa:", options: ["Diễn đạt lại bằng từ khác", "Nguyên văn từng chữ", "Tóm tắt", "Phản biện"], correct: 1 },
    { question: "Paraphrase tốt KHÔNG được:", options: ["Đổi cấu trúc câu", "Sử dụng từ đồng nghĩa", "Sao chép nguyên văn", "Giữ nguyên nghĩa"], correct: 2 },
    { question: "\"Nominalization\" là:", options: ["Đặt tên", "Danh từ hóa cấu trúc câu", "Bị động hóa", "Phủ định"], correct: 1 },
    { question: "\"In other words\" giới thiệu:", options: ["Ví dụ trái ngược", "Cách diễn đạt lại", "Tương phản", "Kết luận"], correct: 1 },
    { question: "\"Connotation\" là:", options: ["Nghĩa đen", "Hàm ý/ngữ cảm", "Phát âm", "Chính tả"], correct: 1 }
  ]
};

export default ADV_C1_PARAPHRASING_LESSON;
