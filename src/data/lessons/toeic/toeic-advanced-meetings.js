// Track: toeic — TOEIC Advanced Meetings & Negotiation (Band 900 – 990)

export const TOEIC_ADVANCED_MEETINGS_LESSON = {
  id: "toeic-advanced-meetings",
  title: "TOEIC Advanced Meetings & Negotiation",
  description: "Ngôn ngữ học thuật & sắc thái cho họp & đàm phán cấp cao",
  level: "advanced",
  icon: "🤝",
  examTag: "toeic",
  toeicBand: "900-990",
  vocabulary: [
    { word: "Stipulate",      phonetic: "/ˈstɪpjuleɪt/",     meaning: "Quy định rõ (hợp đồng)",  example: "The contract stipulates a 30-day notice.",           illustration: "📜" },
    { word: "Contingency",    phonetic: "/kənˈtɪndʒənsi/",   meaning: "Tình huống bất ngờ",       example: "We need a contingency plan for delays.",            illustration: "⚠️" },
    { word: "Leverage",       phonetic: "/ˈliːvərɪdʒ/",      meaning: "Tận dụng",                 example: "We leverage our network to expand.",                 illustration: "🎯" },
    { word: "Concede",        phonetic: "/kənˈsiːd/",        meaning: "Nhượng bộ",                example: "He conceded on the payment terms.",                  illustration: "🤲" },
    { word: "Mitigate",       phonetic: "/ˈmɪtɪɡeɪt/",       meaning: "Giảm thiểu rủi ro",        example: "Insurance mitigates financial risk.",                illustration: "🛡️" },
    { word: "Stakeholder",    phonetic: "/ˈsteɪkhəʊldər/",   meaning: "Bên liên quan",            example: "All stakeholders must sign off.",                    illustration: "👥" },
    { word: "Scalable",       phonetic: "/ˈskeɪləbl/",       meaning: "Có khả năng mở rộng",      example: "The solution is highly scalable.",                   illustration: "📈" },
    { word: "Viable",         phonetic: "/ˈvaɪəbl/",         meaning: "Khả thi",                  example: "Is this proposal commercially viable?",              illustration: "✅" },
    { word: "Synergy",        phonetic: "/ˈsɪnədʒi/",        meaning: "Hiệu ứng cộng hưởng",      example: "The merger will create strong synergy.",             illustration: "🔗" },
    { word: "Paradigm",       phonetic: "/ˈpærədaɪm/",       meaning: "Mô hình tư duy",           example: "This marks a paradigm shift in the industry.",       illustration: "🧭" },
    { word: "Comprehensive",  phonetic: "/ˌkɒmprɪˈhensɪv/",  meaning: "Toàn diện",                example: "We provide a comprehensive review.",                 illustration: "📚" },
    { word: "Reciprocal",     phonetic: "/rɪˈsɪprəkl/",      meaning: "Có đi có lại",             example: "Both parties agreed on a reciprocal arrangement.",   illustration: "↔️" },
  ],
  grammar: [
    {
      title: "Mệnh đề điều kiện hỗn hợp (mixed conditionals)",
      explanation: "Kết hợp quá khứ & hiện tại để nói điều giả định phức tạp — thường xuất hiện trong đàm phán.",
      examples: [
        { en: "If we had signed earlier, we would be profitable now.", vi: "Nếu đã ký sớm hơn, giờ chúng ta đã có lãi." },
        { en: "If she were CEO, the outcome would have been different.", vi: "Nếu cô ấy là CEO, kết quả đã khác." },
        { en: "Had we diversified, the loss would be smaller today.",   vi: "Nếu đã đa dạng hoá, khoản lỗ giờ sẽ nhỏ hơn." },
      ],
    },
    {
      title: "Softeners & hedging — giảm nhẹ lời nói",
      explanation: "I'm afraid / I'm inclined to think / with all due respect — giữ lịch sự khi bất đồng.",
      examples: [
        { en: "With all due respect, the figures seem optimistic.", vi: "Thưa ngài, các số liệu có vẻ lạc quan quá." },
        { en: "I'm inclined to think we should reconsider.",          vi: "Tôi nghĩ chúng ta nên xem xét lại." },
        { en: "I'm afraid we cannot accept these terms.",             vi: "Rất tiếc, chúng tôi không thể chấp nhận các điều khoản này." },
      ],
    },
  ],
  quiz: [
    { question: "\"Stipulate\" trong hợp đồng có nghĩa là:",                           options: ["Gợi ý", "Quy định rõ", "Bỏ qua", "Đàm phán"],       correct: 1 },
    { question: "\"We need a ___ plan for delays.\"",                                    options: ["reciprocal", "contingency", "viable", "scalable"],   correct: 1 },
    { question: "\"The merger will create strong ___.\"",                                options: ["synergy", "paradigm", "leverage", "concession"],    correct: 0 },
    { question: "Mixed conditional thường được dùng khi:",                               options: ["Kể chuyện cổ tích", "Mô tả hiện tại", "Giả định hỗn hợp quá khứ & hiện tại", "Câu mệnh lệnh"], correct: 2 },
    { question: "\"All ___ must sign off.\" (bên liên quan)",                            options: ["managers", "stakeholders", "directors", "lawyers"],   correct: 1 },
    { question: "\"With all due respect\" dùng để:",                                     options: ["Chê trực diện", "Bày tỏ bất đồng lịch sự", "Ca ngợi", "Đe doạ"], correct: 1 },
    { question: "Trái nghĩa của \"viable\" (khả thi):",                                   options: ["scalable", "impractical", "reciprocal", "comprehensive"], correct: 1 },
  ],
};

export default TOEIC_ADVANCED_MEETINGS_LESSON;
