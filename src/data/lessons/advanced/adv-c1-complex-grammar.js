// Track: advanced — C1 Complex Grammar Structures

export const ADV_C1_COMPLEX_GRAMMAR_LESSON = {
  id: "adv-c1-complex-grammar",
  title: "C1 Complex Grammar",
  description: "Cấu trúc phức: cleft, subjunctive, mixed conditionals, participle clauses",
  level: "advanced",
  icon: "📐",
  cefrLevel: "C1",
  vstepLevel: "C1",
  vocabulary: [
    { word: "Cleft sentence", phonetic: "/kleft/", meaning: "Câu chẻ nhấn mạnh", example: "It was John who solved the problem.", illustration: "✂️" },
    { word: "Inversion", phonetic: "/ɪnˈvɜːʃən/", meaning: "Đảo ngữ", example: "Never have I seen such talent.", illustration: "🔄" },
    { word: "Subjunctive", phonetic: "/səbˈdʒʌŋktɪv/", meaning: "Thức giả định", example: "I suggest that he be informed.", illustration: "💭" },
    { word: "Mixed conditional", phonetic: "/mɪkst/", meaning: "Câu điều kiện hỗn hợp", example: "If I had studied harder, I would be a doctor now.", illustration: "🔀" },
    { word: "Participle clause", phonetic: "/ˈpɑːtɪsɪpl/", meaning: "Mệnh đề phân từ", example: "Having finished the report, she left.", illustration: "📎" },
    { word: "Gerund phrase", phonetic: "/ˈdʒerənd/", meaning: "Cụm danh động từ", example: "Winning the race required dedication.", illustration: "🏆" },
    { word: "Reduced clause", phonetic: "/rɪˈdjuːst/", meaning: "Mệnh đề rút gọn", example: "The book published last year sold out.", illustration: "✂️" },
    { word: "Nominalization", phonetic: "/ˌnɒmɪnəlaɪˈzeɪʃən/", meaning: "Danh từ hóa", example: "The investigation revealed the cause.", illustration: "📝" },
    { word: "Ellipsis", phonetic: "/ɪˈlɪpsɪs/", meaning: "Lược bỏ", example: "She can sing and (she can) dance.", illustration: "✏️" },
    { word: "Cohesion", phonetic: "/kəʊˈhiːʒən/", meaning: "Sự liên kết", example: "Use referencing for cohesion.", illustration: "🔗" },
    { word: "Apposition", phonetic: "/ˌæpəˈzɪʃən/", meaning: "Đồng cách", example: "Einstein, a renowned physicist, said...", illustration: "🪪" },
    { word: "Hedging", phonetic: "/ˈhedʒɪŋ/", meaning: "Phỏng định", example: "Hedging softens claims.", illustration: "🛡️" }
  ],
  grammar: [
    {
      title: "Mixed conditional",
      explanation: "Loại 3 + loại 2: If S + had V3, S + would V — quá khứ ảnh hưởng hiện tại. Ngược lại cũng có.",
      examples: [
        { en: "If I had taken the job, I would be in Tokyo now.", vi: "Nếu tôi đã nhận công việc đó, giờ tôi đang ở Tokyo." },
        { en: "If she were more patient, she wouldn't have left.", vi: "Nếu cô ấy kiên nhẫn hơn (bản tính), cô ấy đã không bỏ đi." },
        { en: "If they had invested earlier, they would be rich now.", vi: "Nếu họ đầu tư sớm hơn, giờ họ đã giàu." }
      ]
    },
    {
      title: "Participle clauses (Having + V3 / V-ing)",
      explanation: "Rút gọn mệnh đề chỉ thời gian/lý do: \"Having finished, she left.\".",
      examples: [
        { en: "Having reviewed the data, the team made a decision.", vi: "Sau khi xem xét dữ liệu, nhóm đã quyết định." },
        { en: "Walking through the park, I met an old friend.", vi: "Đang đi trong công viên, tôi gặp một người bạn cũ." },
        { en: "Encouraged by the results, they expanded the trial.", vi: "Được khích lệ bởi kết quả, họ mở rộng thử nghiệm." }
      ]
    }
  ],
  quiz: [
    { question: "\"If I had studied medicine, I ___ a doctor now.\":", options: ["would be", "would have been", "will be", "am"], correct: 0 },
    { question: "\"Never ___ such an idea.\":", options: ["I have heard", "have I heard", "I had heard", "did I have heard"], correct: 1 },
    { question: "\"It was the manager ___ approved the plan.\":", options: ["which", "who", "whom", "whose"], correct: 1 },
    { question: "\"Having finished the report\" là:", options: ["Subordinate clause", "Participle clause", "Cleft sentence", "Direct object"], correct: 1 },
    { question: "\"I suggest that he ___ informed.\":", options: ["is", "be", "was", "being"], correct: 1 }
  ]
};

export default ADV_C1_COMPLEX_GRAMMAR_LESSON;
