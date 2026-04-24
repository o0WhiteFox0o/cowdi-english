// Track: advanced — C1 Academic Vocabulary

export const ADV_C1_ACADEMIC_VOCAB_LESSON = {
  id: "adv-c1-academic-vocab",
  title: "C1 Academic Vocabulary",
  description: "Từ vựng học thuật cao cấp: lập luận, phản biện, trích dẫn",
  level: "advanced",
  icon: "🎓",
  cefrLevel: "C1",
  vstepLevel: "C1",
  vocabulary: [
    { word: "Advocate",       phonetic: "/ˈædvəkeɪt/",      meaning: "Ủng hộ / biện hộ",       example: "She advocates for renewable energy policies.",      illustration: "📣" },
    { word: "Refute",         phonetic: "/rɪˈfjuːt/",       meaning: "Bác bỏ",                 example: "The study refutes the common assumption.",          illustration: "🚫" },
    { word: "Substantiate",   phonetic: "/səbˈstænʃieɪt/",  meaning: "Chứng minh bằng dẫn chứng", example: "The claim is substantiated by recent data.",     illustration: "📚" },
    { word: "Nuanced",        phonetic: "/ˈnjuːɑːnst/",     meaning: "Có sắc thái tinh tế",    example: "He gave a nuanced analysis of the issue.",          illustration: "🎨" },
    { word: "Discrepancy",    phonetic: "/dɪˈskrepənsi/",   meaning: "Sự chênh lệch",          example: "There is a discrepancy between the figures.",        illustration: "⚖️" },
    { word: "Preliminary",    phonetic: "/prɪˈlɪmɪnəri/",   meaning: "Sơ bộ",                  example: "These are preliminary findings only.",               illustration: "📝" },
    { word: "Extrapolate",    phonetic: "/ɪkˈstræpəleɪt/",  meaning: "Ngoại suy",              example: "We can extrapolate from historical trends.",         illustration: "📈" },
    { word: "Empirical",      phonetic: "/ɪmˈpɪrɪkl/",      meaning: "Dựa trên thực nghiệm",   example: "The theory lacks empirical support.",               illustration: "🔬" },
    { word: "Rigorous",       phonetic: "/ˈrɪɡərəs/",       meaning: "Chặt chẽ, nghiêm ngặt",  example: "The experiment followed a rigorous protocol.",       illustration: "📏" },
    { word: "Plausible",      phonetic: "/ˈplɔːzəbl/",      meaning: "Có vẻ hợp lý",           example: "That is a plausible explanation.",                   illustration: "🤔" },
    { word: "Caveat",         phonetic: "/ˈkæviæt/",        meaning: "Điều cảnh báo / lưu ý", example: "Every finding comes with a caveat.",                 illustration: "⚠️" },
    { word: "Corollary",      phonetic: "/kəˈrɒləri/",      meaning: "Hệ quả",                example: "Higher income is a corollary of education.",         illustration: "🔗" },
  ],
  grammar: [
    {
      title: "Inversion after negative adverbials",
      explanation: "Đảo ngữ sau trạng ngữ phủ định (Not only / Rarely / Hardly / Under no circumstances) — trang trọng, học thuật.",
      examples: [
        { en: "Rarely have we seen such rigorous methodology.",        vi: "Hiếm khi ta thấy một phương pháp chặt chẽ như vậy." },
        { en: "Not only does the theory explain X, but it also predicts Y.", vi: "Lý thuyết không chỉ giải thích X mà còn dự đoán Y." },
        { en: "Under no circumstances should the data be altered.",    vi: "Không được sửa đổi dữ liệu trong bất kỳ trường hợp nào." },
      ],
    },
    {
      title: "Relative clauses nâng cao (in which / whereby)",
      explanation: "Dùng 'in which', 'whereby', 'by which' thay who/that — trang trọng, phổ biến trong báo cáo khoa học.",
      examples: [
        { en: "A scenario in which demand exceeds supply.",            vi: "Một kịch bản mà cầu vượt cung." },
        { en: "A mechanism whereby cells regenerate.",                  vi: "Một cơ chế nhờ đó tế bào tái tạo." },
        { en: "The process by which knowledge is acquired.",            vi: "Quá trình mà qua đó kiến thức được tiếp thu." },
      ],
    },
  ],
  quiz: [
    { question: "\"Substantiate\" gần nghĩa nhất với:",           options: ["deny", "prove with evidence", "ignore", "translate"], correct: 1 },
    { question: "\"There is a ___ between the figures.\"",          options: ["caveat", "corollary", "discrepancy", "advocate"],    correct: 2 },
    { question: "\"Nuanced analysis\" nghĩa là phân tích:",          options: ["Sơ sài", "Có sắc thái tinh tế", "Máy móc", "Chủ quan"], correct: 1 },
    { question: "Đảo ngữ đúng:",                                     options: ["We rarely have seen…", "Rarely have we seen…", "Rarely we have seen…", "Have rarely we seen…"], correct: 1 },
    { question: "\"The theory lacks ___ support.\" (thực nghiệm)",   options: ["preliminary", "empirical", "plausible", "rigorous"],  correct: 1 },
    { question: "\"Caveat\" nghĩa là:",                              options: ["Hệ quả", "Điều cảnh báo", "Lời khen", "Đại diện"],    correct: 1 },
  ],
};

export default ADV_C1_ACADEMIC_VOCAB_LESSON;
