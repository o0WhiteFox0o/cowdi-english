// Track: general — Phát âm nguyên âm (Vowel Sounds)

export const PRONUNCIATION_VOWELS_LESSON = {
  id: "pronunciation-vowels",
  title: "Phát âm nguyên âm",
  description: "Phân biệt nguyên âm ngắn / nguyên âm dài và nguyên âm đôi (diphthong)",
  level: "beginner",
  icon: "🗣️",
  vocabulary: [
    { word: "Cat",   phonetic: "/kæt/",   meaning: "Con mèo (âm /æ/ ngắn)",  example: "The cat is on the mat.", illustration: "🐱" },
    { word: "Cart",  phonetic: "/kɑːrt/", meaning: "Xe đẩy (âm /ɑː/ dài)",   example: "Put the box in the cart.", illustration: "🛒" },
    { word: "Sit",   phonetic: "/sɪt/",   meaning: "Ngồi (âm /ɪ/ ngắn)",     example: "Please sit down.", illustration: "🪑" },
    { word: "Seat",  phonetic: "/siːt/",  meaning: "Chỗ ngồi (âm /iː/ dài)", example: "Take a seat, please.", illustration: "💺" },
    { word: "Ship",  phonetic: "/ʃɪp/",   meaning: "Tàu thủy",               example: "The ship sails today.", illustration: "🚢" },
    { word: "Sheep", phonetic: "/ʃiːp/",  meaning: "Con cừu",                example: "The sheep is white.", illustration: "🐑" },
    { word: "Full",  phonetic: "/fʊl/",   meaning: "Đầy (âm /ʊ/ ngắn)",      example: "The cup is full.", illustration: "🥛" },
    { word: "Fool",  phonetic: "/fuːl/",  meaning: "Kẻ ngốc (âm /uː/ dài)",  example: "Don't be a fool.", illustration: "🤪" },
    { word: "Bed",   phonetic: "/bɛd/",   meaning: "Cái giường (/e/)",       example: "I sleep in my bed.", illustration: "🛏️" },
    { word: "Bird",  phonetic: "/bɜːrd/", meaning: "Con chim (/ɜː/)",        example: "The bird is singing.", illustration: "🐦" },
    { word: "Boat",  phonetic: "/boʊt/",  meaning: "Thuyền (đôi /oʊ/)",      example: "We row the boat.", illustration: "🚤" },
    { word: "Time",  phonetic: "/taɪm/",  meaning: "Thời gian (đôi /aɪ/)",   example: "What time is it?", illustration: "⏰" },
    { word: "House", phonetic: "/haʊs/",  meaning: "Ngôi nhà (đôi /aʊ/)",    example: "This is my house.", illustration: "🏠" },
    { word: "Boy",   phonetic: "/bɔɪ/",   meaning: "Cậu bé (đôi /ɔɪ/)",      example: "The boy is happy.", illustration: "👦" },
  ],
  grammar: [
    {
      title: "Nguyên âm ngắn vs dài",
      explanation: "Tiếng Anh phân biệt độ DÀI nguyên âm để đổi nghĩa. Sit (/ɪ/) khác Seat (/iː/). Người Việt thường phát âm bằng nhau → dễ hiểu nhầm.",
      examples: [
        { en: "ship /ʃɪp/  ≠  sheep /ʃiːp/", vi: "tàu  ≠  cừu" },
        { en: "live /lɪv/  ≠  leave /liːv/", vi: "sống ≠  rời đi" },
        { en: "full /fʊl/  ≠  fool /fuːl/",  vi: "đầy  ≠  ngốc" },
      ]
    },
    {
      title: "Nguyên âm đôi (Diphthong)",
      explanation: "Là âm ghép từ 2 nguyên âm trượt vào nhau. 8 nguyên âm đôi chính: /eɪ/, /aɪ/, /ɔɪ/, /aʊ/, /oʊ/, /ɪər/, /eər/, /ʊər/.",
      examples: [
        { en: "day /deɪ/, my /maɪ/, boy /bɔɪ/",   vi: "ngày, của tôi, cậu bé" },
        { en: "now /naʊ/, go /ɡoʊ/, here /hɪər/", vi: "bây giờ, đi, ở đây" },
      ]
    },
    {
      title: "Mẹo: kéo dài âm bằng cơ miệng",
      explanation: "Để có /iː/, /uː/, /ɑː/ → căng môi/mở miệng RỘNG hơn và giữ lâu hơn 2 lần so với âm ngắn. Quay clip tự kiểm tra khẩu hình.",
      examples: [
        { en: "Long: see, food, far",  vi: "Mở miệng to, kéo dài" },
        { en: "Short: sit, foot, fan", vi: "Miệng hẹp, dứt khoát" },
      ]
    },
  ],
  quiz: [
    { question: "Cặp từ nào CÓ phát âm khác nhau?",        options: ["read/red", "ship/sheep", "cả hai", "không cặp nào"], correct: 2 },
    { question: "Âm /iː/ có trong từ:",                    options: ["sit", "seat", "set", "sat"], correct: 1 },
    { question: "Nguyên âm đôi /aɪ/ có trong:",            options: ["dog", "time", "ten", "tap"], correct: 1 },
    { question: "\"Boy\" chứa nguyên âm đôi nào?",         options: ["/aɪ/", "/eɪ/", "/ɔɪ/", "/aʊ/"], correct: 2 },
    { question: "\"Full\" và \"Fool\" khác nhau ở chỗ:",   options: ["Phụ âm đầu", "Độ dài nguyên âm", "Số chữ cái", "Không khác"], correct: 1 },
    { question: "Để phát âm /iː/ chuẩn, miệng nên:",       options: ["Mở rộng", "Hẹp + môi căng + giữ lâu", "Tròn môi", "Chu môi ra"], correct: 1 },
  ]
};

export default PRONUNCIATION_VOWELS_LESSON;
