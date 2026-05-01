// Track: general — Giới từ chỉ vị trí (Prepositions of Place)

export const PREPOSITIONS_PLACE_LESSON = {
  id: "prepositions-place",
  title: "Giới từ chỉ vị trí",
  description: "in / on / at / under / behind / next to … — mô tả vị trí mọi vật",
  level: "beginner",
  icon: "🧭",
  vocabulary: [
    { word: "In",       phonetic: "/ɪn/",       meaning: "Trong / ở trong",       example: "The cat is in the box.", illustration: "📦" },
    { word: "On",       phonetic: "/ɒn/",       meaning: "Trên (bề mặt)",         example: "The book is on the table.", illustration: "📚" },
    { word: "At",       phonetic: "/æt/",       meaning: "Tại (điểm)",            example: "She is at the door.", illustration: "🚪" },
    { word: "Under",    phonetic: "/ˈʌndər/",   meaning: "Dưới",                  example: "The dog is under the bed.", illustration: "🐕" },
    { word: "Above",    phonetic: "/əˈbʌv/",    meaning: "Phía trên (không chạm)", example: "A lamp hangs above the table.", illustration: "💡" },
    { word: "Below",    phonetic: "/bɪˈloʊ/",   meaning: "Phía dưới",             example: "Sign your name below the line.", illustration: "🖊️" },
    { word: "Behind",   phonetic: "/bɪˈhaɪnd/", meaning: "Phía sau",              example: "The garden is behind the house.", illustration: "🌳" },
    { word: "In front of", phonetic: "/ɪn frʌnt əv/", meaning: "Phía trước",      example: "A car is in front of the house.", illustration: "🚗" },
    { word: "Next to",  phonetic: "/nɛkst tuː/", meaning: "Bên cạnh",             example: "The chair is next to the desk.", illustration: "🪑" },
    { word: "Between",  phonetic: "/bɪˈtwiːn/", meaning: "Giữa (2 vật)",          example: "The cat sits between two dogs.", illustration: "🐈" },
    { word: "Among",    phonetic: "/əˈmʌŋ/",    meaning: "Giữa (nhiều vật)",      example: "She is among friends.", illustration: "👥" },
    { word: "Near",     phonetic: "/nɪər/",     meaning: "Gần",                   example: "I live near the school.", illustration: "🏫" },
    { word: "Opposite", phonetic: "/ˈɒpəzɪt/",  meaning: "Đối diện",              example: "The bank is opposite the park.", illustration: "🏦" },
    { word: "Inside",   phonetic: "/ɪnˈsaɪd/",  meaning: "Bên trong",             example: "Stay inside the house.", illustration: "🏠" },
    { word: "Outside",  phonetic: "/aʊtˈsaɪd/", meaning: "Bên ngoài",             example: "Wait outside, please.", illustration: "🚶" },
  ],
  grammar: [
    {
      title: "IN — ON — AT (3 giới từ \"thần\")",
      explanation: "IN: bên trong KHÔNG GIAN có ranh giới (in the room, in Vietnam, in a car). ON: trên BỀ MẶT (on the table, on the wall, on the bus). AT: ĐIỂM xác định (at the door, at the bus stop, at home).",
      examples: [
        { en: "in the box / in the room / in Hanoi",   vi: "Bên trong" },
        { en: "on the desk / on the floor / on a ship", vi: "Trên bề mặt" },
        { en: "at the door / at school / at 5pm",      vi: "Tại điểm" },
      ]
    },
    {
      title: "Cặp đối lập",
      explanation: "Học theo cặp giúp dễ nhớ: in/out, on/off, above/below, in front of/behind, inside/outside, near/far.",
      examples: [
        { en: "above ↔ below",        vi: "Trên (không chạm) ↔ Dưới" },
        { en: "in front of ↔ behind", vi: "Trước ↔ Sau" },
        { en: "next to ≈ beside",     vi: "Đồng nghĩa: bên cạnh" },
      ]
    },
    {
      title: "Between vs Among",
      explanation: "Between dùng cho 2 vật / 2 người cụ thể. Among dùng cho 3 trở lên hoặc một nhóm không đếm rõ.",
      examples: [
        { en: "between you and me",       vi: "2 người" },
        { en: "between the bank and the post office", vi: "2 vật" },
        { en: "among the students",        vi: "Nhóm nhiều" },
      ]
    },
  ],
  quiz: [
    { question: "The cat is ___ the box. (bên trong)",         options: ["on", "in", "at", "under"], correct: 1 },
    { question: "The cup is ___ the table. (trên mặt bàn)",    options: ["in", "on", "at", "above"], correct: 1 },
    { question: "She is waiting ___ the bus stop.",             options: ["in", "on", "at", "between"], correct: 2 },
    { question: "The dog hides ___ the bed.",                   options: ["under", "on", "at", "in front of"], correct: 0 },
    { question: "The shop is ___ the bank and the post office.", options: ["among", "between", "next", "near"], correct: 1 },
    { question: "A car is ___ ___ the house. (phía trước)",     options: ["behind", "in front of", "next to", "opposite"], correct: 1 },
    { question: "We live ___ the school. (gần)",                options: ["far", "near", "in", "at"], correct: 1 },
  ]
};

export default PREPOSITIONS_PLACE_LESSON;
