// Track: general — Mạo từ A / An / The

export const ARTICLES_LESSON = {
  id: "articles",
  title: "Mạo từ A / An / The",
  description: "Khi nào dùng a, an, the và khi nào KHÔNG dùng mạo từ",
  level: "beginner",
  icon: "🔠",
  vocabulary: [
    { word: "A book",     phonetic: "/ə bʊk/",     meaning: "Một cuốn sách (chưa xác định)", example: "I bought a book.", illustration: "📕" },
    { word: "An apple",   phonetic: "/ən ˈæpəl/",  meaning: "Một quả táo (đứng trước nguyên âm)", example: "I ate an apple.", illustration: "🍎" },
    { word: "The sun",    phonetic: "/ðə sʌn/",    meaning: "Mặt trời (duy nhất)",          example: "The sun is bright.", illustration: "☀️" },
    { word: "The moon",   phonetic: "/ðə muːn/",   meaning: "Mặt trăng",                    example: "The moon is full.", illustration: "🌕" },
    { word: "An hour",    phonetic: "/ən ˈaʊər/",  meaning: "Một giờ (h câm)",              example: "Wait an hour.", illustration: "⏰" },
    { word: "A university", phonetic: "/ə ˌjuːnɪˈvɜːrsɪti/", meaning: "Một trường ĐH (u đọc /ju/)", example: "He studies at a university.", illustration: "🎓" },
    { word: "The Earth",  phonetic: "/ði ɜːrθ/",   meaning: "Trái Đất",                     example: "The Earth is round.", illustration: "🌍" },
    { word: "An umbrella", phonetic: "/ən ʌmˈbrɛlə/", meaning: "Một cái ô",                 example: "Take an umbrella.", illustration: "☂️" },
    { word: "Music",      phonetic: "/ˈmjuːzɪk/",  meaning: "Âm nhạc (không đếm)",          example: "I love music. (no article)", illustration: "🎵" },
    { word: "Breakfast",  phonetic: "/ˈbrɛkfəst/", meaning: "Bữa sáng (bữa ăn — không mạo từ)", example: "I have breakfast at 7.", illustration: "🍳" },
  ],
  grammar: [
    {
      title: "A vs An",
      explanation: "Dùng A trước phụ âm ĐỌC, AN trước nguyên âm ĐỌC. Phụ thuộc ÂM, không phải chữ cái! \"hour\" /aʊər/ bắt đầu bằng nguyên âm → an hour. \"university\" /juː-/ bắt đầu bằng /j/ phụ âm → a university.",
      examples: [
        { en: "a cat, a dog, a house",      vi: "Phụ âm" },
        { en: "an apple, an egg, an idea",  vi: "Nguyên âm" },
        { en: "an hour, an honest man",     vi: "h câm" },
        { en: "a university, a European",   vi: "u/eu đọc /j/" },
      ]
    },
    {
      title: "A/An vs The",
      explanation: "A/An: lần đầu nhắc đến, chưa xác định, đếm được số ít. The: đã nhắc đến rồi, hoặc đối tượng duy nhất / cụ thể cả người nói và nghe đều biết.",
      examples: [
        { en: "I saw a dog. The dog was big.", vi: "Lần đầu: a; lần sau: the" },
        { en: "Open the door, please.",        vi: "Cái cửa cụ thể" },
        { en: "The sun rises in the east.",    vi: "Duy nhất" },
      ]
    },
    {
      title: "Khi KHÔNG dùng mạo từ",
      explanation: "Trước danh từ chung không đếm được nói chung (music, water, love), trước tên riêng (Vietnam, John), tên bữa ăn (breakfast, lunch, dinner), môn học, ngôn ngữ, môn thể thao.",
      examples: [
        { en: "I love music.",       vi: "Không phải \"the music\"" },
        { en: "I play football.",    vi: "Môn thể thao" },
        { en: "She speaks English.", vi: "Ngôn ngữ" },
        { en: "Vietnam is beautiful.", vi: "Tên nước (trừ \"the United States\"...)" },
      ]
    },
  ],
  quiz: [
    { question: "___ apple a day keeps the doctor away.", options: ["A", "An", "The", "—"], correct: 1 },
    { question: "She is ___ honest girl.",                options: ["a", "an", "the", "—"], correct: 1 },
    { question: "He goes to ___ university every day.",   options: ["a", "an", "the", "—"], correct: 0 },
    { question: "I love ___ music.",                      options: ["a", "an", "the", "—"], correct: 3 },
    { question: "I saw a cat. ___ cat was black.",        options: ["A", "An", "The", "—"], correct: 2 },
    { question: "We have ___ breakfast at 7am.",          options: ["a", "an", "the", "—"], correct: 3 },
    { question: "___ Earth goes around ___ sun.",         options: ["A — a", "The — the", "An — the", "— —"], correct: 1 },
  ]
};

export default ARTICLES_LESSON;
