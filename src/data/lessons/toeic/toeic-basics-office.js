// Track: toeic — TOEIC Basics: Office & Numbers (Band 10 – 250)

export const TOEIC_BASICS_OFFICE_LESSON = {
  id: "toeic-basics-office",
  title: "TOEIC Basics: Office & Numbers",
  description: "Từ vựng cơ bản nơi công sở: số, giờ, đồ dùng, chỉ đường",
  level: "beginner",
  icon: "🏢",
  examTag: "toeic",
  toeicBand: "10-250",
  vocabulary: [
    { word: "Office",     phonetic: "/ˈɒfɪs/",      meaning: "Văn phòng",      example: "I work in a small office.",                     illustration: "🏢" },
    { word: "Desk",       phonetic: "/desk/",       meaning: "Bàn làm việc",   example: "My laptop is on the desk.",                     illustration: "🪑" },
    { word: "Computer",   phonetic: "/kəmˈpjuːtər/",meaning: "Máy tính",       example: "Please turn off the computer.",                 illustration: "💻" },
    { word: "Meeting",    phonetic: "/ˈmiːtɪŋ/",    meaning: "Cuộc họp",       example: "The meeting starts at 9.",                      illustration: "📋" },
    { word: "Manager",    phonetic: "/ˈmænɪdʒər/",  meaning: "Quản lý",        example: "My manager is very kind.",                      illustration: "👔" },
    { word: "Colleague",  phonetic: "/ˈkɒliːɡ/",    meaning: "Đồng nghiệp",    example: "She is my new colleague.",                      illustration: "👥" },
    { word: "Floor",      phonetic: "/flɔːr/",      meaning: "Tầng",           example: "Our office is on the third floor.",             illustration: "🏗️" },
    { word: "Lift",       phonetic: "/lɪft/",       meaning: "Thang máy",      example: "Take the lift to the fifth floor.",             illustration: "🛗" },
    { word: "Entrance",   phonetic: "/ˈentrəns/",   meaning: "Lối vào",        example: "Meet me at the main entrance.",                 illustration: "🚪" },
    { word: "Break",      phonetic: "/breɪk/",      meaning: "Giờ nghỉ",       example: "Let's take a short break.",                     illustration: "☕" },
  ],
  grammar: [
    {
      title: "Giờ giấc — telling time",
      explanation: "It is + giờ. Dùng 'a.m.' (sáng) / 'p.m.' (chiều, tối).",
      examples: [
        { en: "The meeting starts at 9 a.m.",           vi: "Cuộc họp bắt đầu lúc 9 giờ sáng." },
        { en: "Lunch is at twelve thirty.",              vi: "Bữa trưa lúc 12h30." },
        { en: "The office closes at 6 p.m.",             vi: "Văn phòng đóng cửa lúc 6 giờ chiều." },
      ],
    },
    {
      title: "Giới từ chỉ vị trí (in, on, at)",
      explanation: "in (trong phòng/toà nhà), on (trên mặt phẳng, trên tầng), at (một điểm cụ thể).",
      examples: [
        { en: "My bag is on the desk.",                  vi: "Túi tôi ở trên bàn." },
        { en: "He is in the meeting room.",              vi: "Anh ấy ở trong phòng họp." },
        { en: "Meet me at the entrance.",                vi: "Gặp tôi ở lối vào." },
      ],
    },
  ],
  quiz: [
    { question: "\"Colleague\" nghĩa là:",                     options: ["Quản lý", "Đồng nghiệp", "Khách hàng", "Bảo vệ"],     correct: 1 },
    { question: "\"Take the ___ to the fifth floor.\"",          options: ["desk", "office", "lift", "break"],                    correct: 2 },
    { question: "Giới từ đúng: \"My bag is ___ the desk.\"",    options: ["in", "at", "on", "from"],                             correct: 2 },
    { question: "\"The office closes at 6 ___.\" (chiều)",        options: ["a.m.", "p.m.", "o'clock", "noon"],                   correct: 1 },
    { question: "\"Break\" ở công sở nghĩa là:",                 options: ["Bữa chính", "Giờ nghỉ ngắn", "Họp khẩn", "Lối thoát"], correct: 1 },
  ],
};

export default TOEIC_BASICS_OFFICE_LESSON;
