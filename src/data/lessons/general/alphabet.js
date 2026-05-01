// Track: general — Bảng chữ cái & đánh vần (Alphabet & Spelling)

export const ALPHABET_LESSON = {
  id: "alphabet",
  title: "Bảng chữ cái & đánh vần",
  description: "Học 26 chữ cái tiếng Anh và cách đánh vần tên, địa chỉ, email",
  level: "beginner",
  icon: "🔤",
  vocabulary: [
    { word: "Alphabet", phonetic: "/ˈælfəbɛt/", meaning: "Bảng chữ cái", example: "The English alphabet has 26 letters.", illustration: "🔤" },
    { word: "Letter",   phonetic: "/ˈlɛtər/",    meaning: "Chữ cái",      example: "The letter A is the first letter.", illustration: "🅰️" },
    { word: "Vowel",    phonetic: "/ˈvaʊəl/",    meaning: "Nguyên âm",    example: "A, E, I, O, U are vowels.", illustration: "🅰️" },
    { word: "Consonant", phonetic: "/ˈkɒnsənənt/", meaning: "Phụ âm",     example: "B, C, D are consonants.", illustration: "🅱️" },
    { word: "Spell",    phonetic: "/spɛl/",      meaning: "Đánh vần",     example: "How do you spell your name?", illustration: "✍️" },
    { word: "Capital",  phonetic: "/ˈkæpɪtl/",   meaning: "Chữ hoa",      example: "Names start with a capital letter.", illustration: "🔠" },
    { word: "Small",    phonetic: "/smɔːl/",     meaning: "Chữ thường",   example: "Use small letters in emails.", illustration: "🔡" },
    { word: "Word",     phonetic: "/wɜːrd/",     meaning: "Từ",           example: "Cat is a three-letter word.", illustration: "📝" },
    { word: "Sound",    phonetic: "/saʊnd/",     meaning: "Âm thanh",     example: "Listen to the sound of the letter.", illustration: "🔊" },
    { word: "Repeat",   phonetic: "/rɪˈpiːt/",   meaning: "Lặp lại",      example: "Please repeat after me.", illustration: "🔁" },
    { word: "Read",     phonetic: "/riːd/",      meaning: "Đọc",          example: "Read the letters out loud.", illustration: "📖" },
    { word: "Write",    phonetic: "/raɪt/",      meaning: "Viết",         example: "Write your name in capital letters.", illustration: "✏️" },
  ],
  grammar: [
    {
      title: "26 chữ cái — chia thành 2 nhóm",
      explanation: "Tiếng Anh có 26 chữ cái: 5 nguyên âm (A, E, I, O, U) và 21 phụ âm. Y có thể là nguyên âm (sky) hoặc phụ âm (yes).",
      examples: [
        { en: "A B C D E F G", vi: "ây bi xi đi i ép gi" },
        { en: "H I J K L M N", vi: "ết-trờ ai giây kây eo em en" },
        { en: "O P Q R S T", vi: "âu pi kiu a-rờ ét ti" },
        { en: "U V W X Y Z", vi: "diu vi đắp-bồ-diu ếch quai dét" },
      ]
    },
    {
      title: "Hỏi cách đánh vần",
      explanation: "Khi không nghe rõ, dùng \"How do you spell...?\" để yêu cầu đánh vần.",
      examples: [
        { en: "How do you spell your name?", vi: "Tên bạn đánh vần như thế nào?" },
        { en: "Can you spell it, please?",   vi: "Bạn vui lòng đánh vần được không?" },
        { en: "C-O-W-D-I.",                  vi: "C-O-W-D-I." },
      ]
    },
    {
      title: "Double letter (chữ kép)",
      explanation: "Khi có chữ lặp lại, người Anh đọc \"double + tên chữ\". Ví dụ \"book\" = B-double O-K.",
      examples: [
        { en: "Coffee — C-O-double F-E-E.", vi: "Coffee đánh vần: C-O-FF-EE." },
        { en: "Apple — A-double P-L-E.",    vi: "Apple đánh vần: A-PP-L-E." },
      ]
    },
  ],
  quiz: [
    { question: "Có bao nhiêu chữ cái trong bảng chữ cái tiếng Anh?", options: ["24", "25", "26", "27"], correct: 2 },
    { question: "Chữ nào KHÔNG phải nguyên âm?", options: ["A", "E", "K", "O"], correct: 2 },
    { question: "\"Spell\" nghĩa là:", options: ["Đọc", "Viết", "Đánh vần", "Lặp lại"], correct: 2 },
    { question: "Câu hỏi nào để xin đánh vần?", options: ["What is your name?", "How do you spell it?", "Where are you?", "How old are you?"], correct: 1 },
    { question: "\"Coffee\" có chữ kép là:", options: ["FF", "OO", "EE và FF", "Không có"], correct: 2 },
    { question: "Chữ Y trong từ \"sky\" đóng vai trò là:", options: ["Phụ âm", "Nguyên âm", "Cả hai", "Không xác định"], correct: 1 },
  ]
};

export default ALPHABET_LESSON;
