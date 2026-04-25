// Track: advanced — C2 Etymology & Word History

export const ADV_C2_ETYMOLOGY_LESSON = {
  id: "adv-c2-etymology",
  title: "C2 Etymology",
  description: "Nguồn gốc từ Latin/Hy Lạp/German/Pháp giúp đoán nghĩa",
  level: "advanced",
  icon: "🏛️",
  cefrLevel: "C2",
  vstepLevel: "C2",
  vocabulary: [
    { word: "Etymology", phonetic: "/ˌetɪˈmɒlədʒi/", meaning: "Từ nguyên học", example: "Etymology reveals word origins.", illustration: "📚" },
    { word: "Root", phonetic: "/ruːt/", meaning: "Gốc từ", example: "\"Bio\" is a Greek root meaning life.", illustration: "🌱" },
    { word: "Prefix", phonetic: "/ˈpriːfɪks/", meaning: "Tiền tố", example: "\"Un-\" is a negative prefix.", illustration: "➕" },
    { word: "Suffix", phonetic: "/ˈsʌfɪks/", meaning: "Hậu tố", example: "\"-tion\" turns verbs into nouns.", illustration: "➖" },
    { word: "Cognate", phonetic: "/ˈkɒɡneɪt/", meaning: "Từ cùng gốc", example: "\"Night\" and German \"Nacht\" are cognates.", illustration: "🤝" },
    { word: "Loanword", phonetic: "/ˈləʊnwɜːd/", meaning: "Từ vay mượn", example: "\"Sushi\" is a loanword from Japanese.", illustration: "🛂" },
    { word: "Calque", phonetic: "/kælk/", meaning: "Dịch sao phỏng", example: "\"Skyscraper\" → French \"gratte-ciel\" is a calque.", illustration: "🪞" },
    { word: "Archaic", phonetic: "/ɑːˈkeɪɪk/", meaning: "Cổ xưa", example: "\"Thou\" is an archaic pronoun.", illustration: "📜" },
    { word: "Neologism", phonetic: "/niˈɒlədʒɪzəm/", meaning: "Từ mới sáng tạo", example: "\"Selfie\" was a recent neologism.", illustration: "✨" },
    { word: "Semantic shift", phonetic: "/sɪˈmæntɪk/", meaning: "Biến đổi nghĩa", example: "\"Awful\" once meant \"awe-inspiring\".", illustration: "🔄" },
    { word: "Indo-European", phonetic: "/ˌɪndəʊ jʊərəˈpiːən/", meaning: "Họ ngôn ngữ Ấn-Âu", example: "English belongs to the Indo-European family.", illustration: "🌍" },
    { word: "Latinate", phonetic: "/ˈlætɪneɪt/", meaning: "Có gốc Latin", example: "Latinate words sound formal.", illustration: "🏛️" }
  ],
  grammar: [
    {
      title: "Tiền tố Latin/Hy Lạp phổ biến",
      explanation: "ante- (trước), post- (sau), inter- (giữa), trans- (xuyên qua), bio- (sự sống), geo- (đất).",
      examples: [
        { en: "\"Antecedent\" — that which comes before.", vi: "antecedent — cái có trước (tiền tố ante-)." },
        { en: "\"Postpone\" — to put after.", vi: "postpone — hoãn lại (tiền tố post-)." },
        { en: "\"Biology\" — the study of life.", vi: "biology — sinh học (gốc bio = sự sống)." }
      ]
    },
    {
      title: "Cặp từ Anglo-Saxon vs Latinate",
      explanation: "Từ gốc Anglo-Saxon (ngắn, đời thường) vs Latinate (dài, trang trọng): begin/commence, ask/inquire, end/terminate.",
      examples: [
        { en: "Casual: We will begin shortly. → Formal: The session will commence at 9.", vi: "Đối chiếu begin (Saxon) với commence (Latinate)." },
        { en: "Casual: Ask the manager. → Formal: Inquire with the manager.", vi: "ask vs inquire — informal vs formal." },
        { en: "Casual: It will end at 5. → Formal: It will terminate at 5.", vi: "end vs terminate." }
      ]
    }
  ],
  quiz: [
    { question: "\"Cognate\" là:", options: ["Từ trái nghĩa", "Từ cùng gốc giữa các ngôn ngữ", "Từ vay mượn", "Từ cổ"], correct: 1 },
    { question: "\"Bio-\" có nghĩa gốc:", options: ["Đất", "Sự sống", "Nước", "Lửa"], correct: 1 },
    { question: "\"Awful\" trải qua:", options: ["Loanword", "Semantic shift (đổi nghĩa)", "Calque", "Cognate"], correct: 1 },
    { question: "Từ Latinate thường:", options: ["Ngắn, đời thường", "Dài hơn, trang trọng hơn", "Tục tĩu", "Lỗi thời"], correct: 1 },
    { question: "\"Selfie\" là:", options: ["Archaic", "Neologism", "Calque", "Cognate"], correct: 1 }
  ]
};

export default ADV_C2_ETYMOLOGY_LESSON;
