// Track: general — Thời gian, ngày tháng (Time & Dates)

export const TIME_AND_DATE_LESSON = {
  id: "time-and-date",
  title: "Thời gian & ngày tháng",
  description: "Hỏi giờ, ngày, tháng, năm, thứ — và mọi giới từ thời gian",
  level: "beginner",
  icon: "🕐",
  vocabulary: [
    { word: "What time is it?", phonetic: "/wɒt taɪm ɪz ɪt/", meaning: "Mấy giờ rồi?", example: "What time is it now?", illustration: "⏰" },
    { word: "O'clock",      phonetic: "/əˈklɒk/", meaning: "Đúng giờ (chẵn)",  example: "It's 7 o'clock.", illustration: "🕖" },
    { word: "Half past",    phonetic: "/hɑːf pɑːst/", meaning: "Rưỡi (30 phút)", example: "It's half past six. (6:30)", illustration: "🕡" },
    { word: "Quarter past", phonetic: "/ˈkwɔːtər pɑːst/", meaning: "Hơn 15'", example: "It's quarter past 8. (8:15)", illustration: "🕗" },
    { word: "Quarter to",   phonetic: "/ˈkwɔːtər tə/", meaning: "Kém 15'",   example: "It's quarter to 9. (8:45)", illustration: "🕘" },
    { word: "AM / PM",      phonetic: "/eɪ ɛm/",  meaning: "Sáng / Chiều",  example: "Meet at 10 AM / 3 PM.", illustration: "🌞" },
    { word: "Today",        phonetic: "/təˈdeɪ/", meaning: "Hôm nay",       example: "Today is Monday.", illustration: "📅" },
    { word: "Tomorrow",     phonetic: "/təˈmɒroʊ/", meaning: "Ngày mai",   example: "See you tomorrow.", illustration: "➡️" },
    { word: "Yesterday",    phonetic: "/ˈjɛstərdeɪ/", meaning: "Hôm qua", example: "I met him yesterday.", illustration: "⬅️" },
    { word: "Week",         phonetic: "/wiːk/",   meaning: "Tuần",          example: "Next week is busy.", illustration: "📆" },
    { word: "Month",        phonetic: "/mʌnθ/",   meaning: "Tháng",         example: "This month is May.", illustration: "🗓️" },
    { word: "Year",         phonetic: "/jɪər/",   meaning: "Năm",           example: "Happy new year!", illustration: "🎊" },
    { word: "Monday",       phonetic: "/ˈmʌndeɪ/", meaning: "Thứ Hai",      example: "I work on Monday.", illustration: "1️⃣" },
    { word: "Tuesday",      phonetic: "/ˈtjuːzdeɪ/", meaning: "Thứ Ba",     example: "Tuesday is busy.", illustration: "2️⃣" },
    { word: "Wednesday",    phonetic: "/ˈwɛnzdeɪ/", meaning: "Thứ Tư (e câm)", example: "It's Wednesday today.", illustration: "3️⃣" },
    { word: "Thursday",     phonetic: "/ˈθɜːrzdeɪ/", meaning: "Thứ Năm",   example: "I'll see you Thursday.", illustration: "4️⃣" },
    { word: "Friday",       phonetic: "/ˈfraɪdeɪ/", meaning: "Thứ Sáu",     example: "Friday is fun!", illustration: "5️⃣" },
    { word: "Saturday",     phonetic: "/ˈsætərdeɪ/", meaning: "Thứ Bảy",    example: "Saturday is for family.", illustration: "6️⃣" },
    { word: "Sunday",       phonetic: "/ˈsʌndeɪ/", meaning: "Chủ Nhật",     example: "Sunday is a rest day.", illustration: "7️⃣" },
  ],
  grammar: [
    {
      title: "Cách đọc giờ",
      explanation: "Cách 1 (truyền thống): minutes + past/to + hour. 8:15 = a quarter past 8; 8:45 = a quarter to 9; 8:30 = half past 8. Cách 2 (digital): đọc số trực tiếp. 8:15 = eight fifteen; 8:45 = eight forty-five.",
      examples: [
        { en: "7:00 → seven o'clock",         vi: "7 giờ" },
        { en: "7:15 → quarter past seven",   vi: "7 giờ 15" },
        { en: "7:30 → half past seven",      vi: "7 giờ 30" },
        { en: "7:45 → quarter to eight",     vi: "8 giờ kém 15" },
      ]
    },
    {
      title: "Giới từ thời gian: AT / ON / IN",
      explanation: "AT giờ cụ thể (at 7, at noon, at midnight). ON ngày / thứ / ngày tháng (on Monday, on July 4th). IN tháng / mùa / năm / thế kỷ (in May, in summer, in 2025, in the morning).",
      examples: [
        { en: "at 5 o'clock, at night, at the weekend", vi: "Giờ / đêm" },
        { en: "on Monday, on May 5",                    vi: "Ngày / thứ" },
        { en: "in 2025, in May, in the morning",        vi: "Năm / tháng / buổi" },
      ]
    },
    {
      title: "Đọc ngày tháng",
      explanation: "Anh-Anh: 5 May 2025 → \"the fifth of May, twenty twenty-five\". Anh-Mỹ: May 5, 2025 → \"May fifth, twenty twenty-five\". Năm đọc thành 2 cặp số: 1999 = nineteen ninety-nine; 2025 = twenty twenty-five hoặc two thousand twenty-five.",
      examples: [
        { en: "1/1/2025 → January first, twenty twenty-five", vi: "Cách đọc Mỹ" },
        { en: "1st January 2025 → the first of January…",    vi: "Cách đọc Anh" },
      ]
    },
  ],
  quiz: [
    { question: "Hỏi giờ:",                            options: ["What is the time it?", "What time is it?", "How time?", "When is time?"], correct: 1 },
    { question: "8:30 đọc là:",                         options: ["eight thirty / half past eight", "half to eight", "quarter past eight", "eight quarter"], correct: 0 },
    { question: "Giới từ với 7 o'clock:",               options: ["in", "on", "at", "for"], correct: 2 },
    { question: "Giới từ với Monday:",                  options: ["in", "on", "at", "for"], correct: 1 },
    { question: "Giới từ với May:",                     options: ["in", "on", "at", "for"], correct: 0 },
    { question: "\"Hôm qua\" trong tiếng Anh là:",       options: ["tomorrow", "today", "yesterday", "last day"], correct: 2 },
    { question: "Thứ tư trong tuần là:",                 options: ["Tuesday", "Thursday", "Wednesday", "Saturday"], correct: 2 },
    { question: "Năm 2025 đọc là:",                      options: ["two zero two five", "twenty twenty-five", "two thousand and twenty-five", "Cả 2 và 3 đúng"], correct: 3 },
  ]
};

export default TIME_AND_DATE_LESSON;
