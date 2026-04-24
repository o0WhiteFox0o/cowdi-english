// Track: advanced — C2 Advanced Discourse & Debate

export const ADV_C2_DEBATE_LESSON = {
  id: "adv-c2-debate",
  title: "C2 Advanced Discourse & Debate",
  description: "Ngôn ngữ tranh biện cấp cao: phản bác, giả định, mỉa mai tinh tế",
  level: "advanced",
  icon: "🗣️",
  cefrLevel: "C2",
  vstepLevel: "C1",
  vocabulary: [
    { word: "Concede",        phonetic: "/kənˈsiːd/",       meaning: "Thừa nhận (điểm yếu)",    example: "I concede that the data is limited.",              illustration: "🤝" },
    { word: "Retort",         phonetic: "/rɪˈtɔːt/",        meaning: "Đáp trả sắc bén",         example: "She retorted that correlation isn't causation.",    illustration: "💬" },
    { word: "Strawman",       phonetic: "/ˈstrɔːmæn/",      meaning: "Ngụy biện bù nhìn",       example: "Don't build a strawman of my position.",            illustration: "🚨" },
    { word: "Ad hominem",     phonetic: "/æd ˈhɒmɪnəm/",    meaning: "Công kích cá nhân",       example: "Attacking his character is an ad hominem fallacy.", illustration: "⚠️" },
    { word: "Equivocate",     phonetic: "/ɪˈkwɪvəkeɪt/",    meaning: "Nói nước đôi",            example: "Stop equivocating and give a clear answer.",         illustration: "🎭" },
    { word: "Vindicate",      phonetic: "/ˈvɪndɪkeɪt/",     meaning: "Minh oan / chứng minh đúng", example: "The evidence vindicates his earlier claim.",     illustration: "⚖️" },
    { word: "Poignant",       phonetic: "/ˈpɔɪnjənt/",      meaning: "Sâu sắc, xúc động",        example: "She made a poignant point about grief.",            illustration: "💔" },
    { word: "Discerning",     phonetic: "/dɪˈsɜːnɪŋ/",      meaning: "Tinh tường",              example: "Discerning readers will spot the bias.",             illustration: "🔍" },
    { word: "Ostensibly",     phonetic: "/ɒˈstensəbli/",    meaning: "Bề ngoài thì",            example: "Ostensibly a reform, it is really a rollback.",      illustration: "🎭" },
    { word: "Tacit",          phonetic: "/ˈtæsɪt/",         meaning: "Ngầm hiểu",               example: "There was tacit agreement among the panel.",         illustration: "🤫" },
    { word: "Paradox",        phonetic: "/ˈpærədɒks/",      meaning: "Nghịch lý",               example: "It's a paradox that freedom requires rules.",        illustration: "🔄" },
    { word: "Vindictive",     phonetic: "/vɪnˈdɪktɪv/",     meaning: "Hằn học, báo thù",        example: "His tone was sharp but not vindictive.",             illustration: "😠" },
  ],
  grammar: [
    {
      title: "Conditional phản thực tại (2nd) & mixed",
      explanation: "Dùng để tranh biện các giả định — thể hiện mức độ chắc chắn tinh tế.",
      examples: [
        { en: "If data were available, we would reconsider.",       vi: "Nếu có dữ liệu, chúng tôi sẽ xem xét lại." },
        { en: "Had she intervened, the outcome would be different today.", vi: "Nếu cô ấy đã can thiệp, kết quả hôm nay đã khác." },
        { en: "Were it not for public pressure, nothing would have changed.", vi: "Nếu không có áp lực dư luận, đã chẳng có gì thay đổi." },
      ],
    },
    {
      title: "Cleft sentences để nhấn mạnh",
      explanation: "It-cleft & what-cleft → làm nổi bật một thành phần, phổ biến trong debate & speech.",
      examples: [
        { en: "It was the methodology, not the intent, that was flawed.", vi: "Chính phương pháp, không phải ý định, mới có sai sót." },
        { en: "What matters is transparency, not speed.",                  vi: "Điều quan trọng là minh bạch, không phải tốc độ." },
        { en: "It is only by listening that we truly learn.",              vi: "Chỉ qua lắng nghe ta mới thực sự học được." },
      ],
    },
  ],
  quiz: [
    { question: "\"Equivocate\" nghĩa là:",                               options: ["Giải thích rõ", "Nói nước đôi", "Bác bỏ", "Đồng ý"],  correct: 1 },
    { question: "\"Ostensibly a reform, it is really a rollback.\" dịch là:", options: ["Thực sự là cải cách", "Bề ngoài là cải cách, thực chất là thụt lùi", "Vừa cải cách vừa tiến lên", "Không phải cải cách"], correct: 1 },
    { question: "Chọn câu cleft đúng:",                                    options: ["The methodology was flawed.", "It was the methodology that was flawed.", "Methodology flawed was.", "Was methodology the flawed."], correct: 1 },
    { question: "\"Tacit agreement\" = ___:",                              options: ["Văn bản rõ", "Thoả thuận ngầm", "Tranh cãi", "Phản đối công khai"], correct: 1 },
    { question: "\"Ad hominem\" là lỗi ngụy biện:",                         options: ["Công kích cá nhân", "Sai thống kê", "Lặp ý", "Ví dụ hẹp"], correct: 0 },
    { question: "Conditional nào thể hiện giả định trái hiện tại?",        options: ["If + present, will", "If + past, would", "If + present, present", "If + will, would"], correct: 1 },
    { question: "\"Vindicate\" gần nghĩa với:",                            options: ["Trả thù", "Minh oan", "Che giấu", "Phủ nhận"],          correct: 1 },
  ],
};

export default ADV_C2_DEBATE_LESSON;
