// Track: advanced — C1 Register & Formality

export const ADV_C1_REGISTER_LESSON = {
  id: "adv-c1-register",
  title: "C1 Register & Formality",
  description: "Phân biệt informal/neutral/formal trong viết và nói",
  level: "advanced",
  icon: "🎚️",
  cefrLevel: "C1",
  vstepLevel: "C1",
  vocabulary: [
    { word: "Formal", phonetic: "/ˈfɔːml/", meaning: "Trang trọng", example: "Use formal English in cover letters.", illustration: "🎩" },
    { word: "Informal", phonetic: "/ɪnˈfɔːml/", meaning: "Thân mật", example: "Informal English is fine in messages.", illustration: "👕" },
    { word: "Colloquial", phonetic: "/kəˈləʊkwiəl/", meaning: "Khẩu ngữ", example: "Avoid colloquial words in essays.", illustration: "💬" },
    { word: "Slang", phonetic: "/slæŋ/", meaning: "Tiếng lóng", example: "Slang dates quickly.", illustration: "🤙" },
    { word: "Jargon", phonetic: "/ˈdʒɑːɡən/", meaning: "Thuật ngữ chuyên ngành", example: "Avoid unnecessary jargon.", illustration: "🛠️" },
    { word: "Euphemism", phonetic: "/ˈjuːfəmɪzəm/", meaning: "Lối nói giảm nhẹ", example: "\"Pass away\" is a euphemism for \"die\".", illustration: "🌸" },
    { word: "Tactful", phonetic: "/ˈtæktfl/", meaning: "Khéo léo", example: "She offered tactful feedback.", illustration: "🕊️" },
    { word: "Diplomatic", phonetic: "/ˌdɪpləˈmætɪk/", meaning: "Ngoại giao, khéo", example: "Be diplomatic when disagreeing.", illustration: "🤝" },
    { word: "Politeness marker", phonetic: "/pəˈlaɪtnəs/", meaning: "Dấu lịch sự", example: "\"Could you, please...\" is a politeness marker.", illustration: "🎀" },
    { word: "Contraction", phonetic: "/kənˈtrækʃən/", meaning: "Dạng rút gọn", example: "Avoid contractions in academic writing.", illustration: "✂️" },
    { word: "Idiomatic", phonetic: "/ˌɪdiəˈmætɪk/", meaning: "Thành ngữ, tự nhiên", example: "Idiomatic expressions sound native.", illustration: "💡" },
    { word: "Neutral", phonetic: "/ˈnjuːtrəl/", meaning: "Trung tính", example: "Use neutral tone in reports.", illustration: "⚖️" }
  ],
  grammar: [
    {
      title: "Cặp từ informal vs formal",
      explanation: "kids→children, get→obtain/receive, big→significant, lots of→a great deal of, but→however.",
      examples: [
        { en: "Informal: We got a lot of feedback. → Formal: We received a great deal of feedback.", vi: "Đổi từ informal sang formal." },
        { en: "Informal: But it's wrong. → Formal: However, it is incorrect.", vi: "Đổi liên từ và contraction." },
        { en: "Informal: Big problem. → Formal: A significant issue.", vi: "Đổi tính từ thành dạng formal." }
      ]
    },
    {
      title: "Modals lịch sự cho yêu cầu",
      explanation: "\"Could you possibly...\", \"Would it be possible to...\", \"I was wondering if...\".",
      examples: [
        { en: "Could you possibly review the draft?", vi: "Liệu bạn có thể xem qua bản nháp không?" },
        { en: "Would it be possible to extend the deadline?", vi: "Có thể gia hạn thời hạn không?" },
        { en: "I was wondering if you could help.", vi: "Tôi đang băn khoăn liệu bạn có thể giúp được không." }
      ]
    }
  ],
  quiz: [
    { question: "\"Slang\" phù hợp với:", options: ["Bài luận học thuật", "Trò chuyện thân mật", "Hợp đồng pháp lý", "Báo cáo tài chính"], correct: 1 },
    { question: "Formal hơn của \"get\":", options: ["got", "receive", "grab", "snag"], correct: 1 },
    { question: "\"Pass away\" là:", options: ["Tiếng lóng", "Lối nói giảm (euphemism) của \"die\"", "Thuật ngữ kỹ thuật", "Câu hỏi tu từ"], correct: 1 },
    { question: "Trong essay học thuật:", options: ["Dùng nhiều contractions", "Tránh contractions", "Bắt buộc dùng slang", "Dùng emoji"], correct: 1 },
    { question: "\"I was wondering if...\" là:", options: ["Yêu cầu thô lỗ", "Yêu cầu lịch sự, gián tiếp", "Câu khẳng định", "Câu hỏi tu từ"], correct: 1 }
  ]
};

export default ADV_C1_REGISTER_LESSON;
