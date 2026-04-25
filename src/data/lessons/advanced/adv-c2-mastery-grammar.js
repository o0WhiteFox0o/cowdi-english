// Track: advanced — C2 Mastery Grammar (subtle nuances)

export const ADV_C2_MASTERY_GRAMMAR_LESSON = {
  id: "adv-c2-mastery-grammar",
  title: "C2 Mastery Grammar",
  description: "Sắc thái ngữ pháp tinh tế: subjunctive, inversion, ellipsis, fronting",
  level: "advanced",
  icon: "🏆",
  cefrLevel: "C2",
  vstepLevel: "C2",
  vocabulary: [
    { word: "Inversion", phonetic: "/ɪnˈvɜːʃən/", meaning: "Đảo ngữ", example: "Rarely have I encountered such talent.", illustration: "🔄" },
    { word: "Fronting", phonetic: "/ˈfrʌntɪŋ/", meaning: "Đưa thành phần lên đầu", example: "Off she went without a word.", illustration: "⬆️" },
    { word: "Ellipsis", phonetic: "/ɪˈlɪpsɪs/", meaning: "Lược bỏ", example: "She can play, and (she can) sing.", illustration: "✂️" },
    { word: "Concord", phonetic: "/ˈkɒŋkɔːd/", meaning: "Sự hòa hợp ngữ pháp", example: "Subject-verb concord is essential.", illustration: "🎶" },
    { word: "Cleft", phonetic: "/kleft/", meaning: "Câu chẻ", example: "It was John who decided.", illustration: "✂️" },
    { word: "Dangling modifier", phonetic: "/ˈdæŋɡlɪŋ/", meaning: "Phân từ lơ lửng", example: "Walking home, the rain started — dangling!", illustration: "⚠️" },
    { word: "Anaphoric reference", phonetic: "/ˌænəˈfɒrɪk/", meaning: "Quy chiếu lùi", example: "\"He\" is an anaphoric reference to John.", illustration: "↩️" },
    { word: "Cataphoric reference", phonetic: "/ˌkætəˈfɒrɪk/", meaning: "Quy chiếu tới", example: "\"Here he comes — John!\"", illustration: "➡️" },
    { word: "Hypotaxis", phonetic: "/ˌhaɪpəˈtæksɪs/", meaning: "Cấu trúc phụ thuộc", example: "Hypotaxis uses subordination.", illustration: "🪜" },
    { word: "Parataxis", phonetic: "/ˌpærəˈtæksɪs/", meaning: "Cấu trúc liệt kê", example: "I came. I saw. I conquered. — parataxis.", illustration: "🟰" },
    { word: "Mood", phonetic: "/muːd/", meaning: "Thức (ngữ pháp)", example: "The subjunctive is a verb mood.", illustration: "🎭" },
    { word: "Aspect", phonetic: "/ˈæspekt/", meaning: "Thể (perfect, progressive)", example: "Perfect aspect indicates completion.", illustration: "⏳" }
  ],
  grammar: [
    {
      title: "Inversion phong phú",
      explanation: "Sau cụm phủ định (Never, Rarely, Hardly, Not only, No sooner, Little, Seldom, Under no circumstances) đảo S-V.",
      examples: [
        { en: "Under no circumstances should the door be opened.", vi: "Trong bất kỳ trường hợp nào cánh cửa cũng không được mở." },
        { en: "No sooner had we left than the storm hit.", vi: "Vừa rời đi thì bão ập tới." },
        { en: "Little did he know that fame awaited him.", vi: "Anh ấy không hề biết rằng danh tiếng đang đợi mình." }
      ]
    },
    {
      title: "Fronting và emphatic structures",
      explanation: "Đảo bổ ngữ/trạng ngữ lên đầu để nhấn mạnh: \"So great was her joy that she cried.\".",
      examples: [
        { en: "So great was her joy that she wept.", vi: "Niềm vui của cô lớn đến nỗi cô khóc." },
        { en: "Such was his charm that everyone agreed.", vi: "Sức cuốn hút của anh đến mức ai cũng đồng ý." },
        { en: "Down came the rain in torrents.", vi: "Mưa trút xuống như thác." }
      ]
    }
  ],
  quiz: [
    { question: "\"Hardly ___ when phone rang.\":", options: ["I had sat down", "had I sat down", "I sat down", "did I sit down"], correct: 1 },
    { question: "\"So great ___ her joy that she cried.\":", options: ["was", "were", "is", "did"], correct: 0 },
    { question: "\"Walking home, the rain started.\" có lỗi:", options: ["Subject-verb concord", "Dangling modifier", "Inversion sai", "Tense"], correct: 1 },
    { question: "\"I came. I saw. I conquered.\" là:", options: ["Hypotaxis", "Parataxis", "Cleft", "Subjunctive"], correct: 1 },
    { question: "\"Little did he know\" có nghĩa:", options: ["Anh ấy biết ít", "Anh ấy không hề biết (nhấn mạnh)", "Anh ấy biết tất cả", "Anh ấy đoán"], correct: 1 }
  ]
};

export default ADV_C2_MASTERY_GRAMMAR_LESSON;
