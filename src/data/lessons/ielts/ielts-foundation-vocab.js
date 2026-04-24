// Track: ielts — IELTS Foundation Vocabulary (Band 3.0 – 4.0)

export const IELTS_FOUNDATION_VOCAB_LESSON = {
  id: "ielts-foundation-vocab",
  title: "IELTS Foundation Vocabulary",
  description: "Từ vựng nền tảng cho người mới bắt đầu luyện IELTS",
  level: "beginner",
  icon: "🌱",
  examTag: "ielts",
  ieltsBand: "3.0-4.0",
  vocabulary: [
    { word: "Daily",      phonetic: "/ˈdeɪli/",      meaning: "Hằng ngày",    example: "I read English daily to improve.",              illustration: "📅" },
    { word: "Routine",    phonetic: "/ruːˈtiːn/",    meaning: "Thói quen",    example: "My morning routine is simple.",                  illustration: "⏰" },
    { word: "Weather",    phonetic: "/ˈweðər/",      meaning: "Thời tiết",    example: "The weather is nice today.",                     illustration: "🌤️" },
    { word: "Hobby",      phonetic: "/ˈhɒbi/",       meaning: "Sở thích",     example: "Reading is my favourite hobby.",                 illustration: "🎨" },
    { word: "Friendly",   phonetic: "/ˈfrendli/",    meaning: "Thân thiện",   example: "My neighbours are very friendly.",               illustration: "😊" },
    { word: "Busy",       phonetic: "/ˈbɪzi/",       meaning: "Bận rộn",      example: "I am busy on weekdays.",                         illustration: "📚" },
    { word: "Quiet",      phonetic: "/ˈkwaɪət/",     meaning: "Yên tĩnh",     example: "The library is a quiet place.",                  illustration: "🤫" },
    { word: "Crowded",    phonetic: "/ˈkraʊdɪd/",    meaning: "Đông đúc",     example: "The bus is crowded at 8 a.m.",                   illustration: "👥" },
    { word: "Useful",     phonetic: "/ˈjuːsfl/",     meaning: "Hữu ích",      example: "This app is useful for students.",               illustration: "✅" },
    { word: "Cheap",      phonetic: "/tʃiːp/",       meaning: "Rẻ",           example: "Street food is cheap and tasty.",                illustration: "💵" },
    { word: "Expensive",  phonetic: "/ɪkˈspensɪv/",  meaning: "Đắt",          example: "New phones are expensive.",                      illustration: "💰" },
    { word: "Relaxing",   phonetic: "/rɪˈlæksɪŋ/",   meaning: "Thư giãn",     example: "Walking in the park is relaxing.",              illustration: "🧘" },
  ],
  grammar: [
    {
      title: "Present Simple — mô tả thói quen",
      explanation: "Dùng thì hiện tại đơn để nói về thói quen và sự thật. Động từ thêm -s với ngôi thứ 3 số ít.",
      examples: [
        { en: "I go to school every day.",          vi: "Tôi đi học mỗi ngày." },
        { en: "She plays badminton on Sundays.",    vi: "Cô ấy chơi cầu lông vào Chủ nhật." },
        { en: "The weather is warm in summer.",     vi: "Thời tiết ấm vào mùa hè." },
      ],
    },
    {
      title: "Tính từ miêu tả (descriptive adjectives)",
      explanation: "Tính từ đứng trước danh từ hoặc sau động từ to be để mô tả người/vật.",
      examples: [
        { en: "My city is crowded and noisy.",      vi: "Thành phố tôi đông đúc và ồn ào." },
        { en: "It is a quiet village.",             vi: "Đó là một ngôi làng yên tĩnh." },
        { en: "The book is useful for my exam.",    vi: "Cuốn sách hữu ích cho kỳ thi của tôi." },
      ],
    },
  ],
  quiz: [
    { question: "\"Hobby\" nghĩa là gì?",                        options: ["Sở thích", "Công việc", "Thói quen", "Kỳ nghỉ"],           correct: 0 },
    { question: "Điền từ: \"She ___ English every day.\"",        options: ["study", "studies", "studying", "studied"],                correct: 1 },
    { question: "Từ nào trái nghĩa với \"expensive\"?",           options: ["useful", "crowded", "cheap", "quiet"],                    correct: 2 },
    { question: "\"The library is a ___ place.\" (yên tĩnh)",     options: ["crowded", "busy", "quiet", "friendly"],                   correct: 2 },
    { question: "\"Routine\" có nghĩa là:",                       options: ["Thời tiết", "Thói quen hằng ngày", "Sở thích", "Người bạn"], correct: 1 },
  ],
};

export default IELTS_FOUNDATION_VOCAB_LESSON;
