// Track: ielts — IELTS Foundation Numbers, Time & Dates (Band 3.0 – 4.0)

export const IELTS_FOUNDATION_NUMBERS_LESSON = {
  id: "ielts-foundation-numbers",
  title: "IELTS Foundation: Numbers, Time & Dates",
  description: "Số, ngày tháng, giờ — kỹ năng cốt lõi cho IELTS Listening Section 1",
  level: "beginner",
  icon: "🔢",
  examTag: "ielts",
  ieltsBand: "3.0-4.0",
  vocabulary: [
    { word: "Hundred",   phonetic: "/ˈhʌndrəd/",   meaning: "Một trăm",        example: "There are one hundred students.",     illustration: "💯" },
    { word: "Thousand",  phonetic: "/ˈθaʊznd/",    meaning: "Một nghìn",       example: "The book costs ten thousand dong.",   illustration: "🔟" },
    { word: "Million",   phonetic: "/ˈmɪljən/",    meaning: "Một triệu",       example: "The city has 9 million people.",      illustration: "🏙️" },
    { word: "Quarter",   phonetic: "/ˈkwɔːtə/",    meaning: "Một phần tư",     example: "It is a quarter past six.",           illustration: "¼" },
    { word: "Half",      phonetic: "/hɑːf/",       meaning: "Một nửa",         example: "Half of the class passed the test.",  illustration: "½" },
    { word: "Decade",    phonetic: "/ˈdekeɪd/",    meaning: "Thập kỷ",         example: "The shop opened a decade ago.",       illustration: "📆" },
    { word: "Century",   phonetic: "/ˈsentʃəri/",  meaning: "Thế kỷ",          example: "We live in the 21st century.",        illustration: "🕰️" },
    { word: "Date",      phonetic: "/deɪt/",       meaning: "Ngày tháng",      example: "What is the date today?",             illustration: "📅" },
    { word: "Address",   phonetic: "/əˈdres/",     meaning: "Địa chỉ",         example: "My address is 12 Tran Hung Dao.",     illustration: "🏠" },
    { word: "Phone",     phonetic: "/fəʊn/",       meaning: "Điện thoại",      example: "Could I have your phone number?",     illustration: "📱" },
    { word: "Postcode",  phonetic: "/ˈpəʊstkəʊd/", meaning: "Mã bưu điện",     example: "The postcode is SW1A 2AA.",           illustration: "✉️" },
    { word: "Twice",     phonetic: "/twaɪs/",      meaning: "Hai lần",         example: "I go to the gym twice a week.",       illustration: "2️⃣" },
  ],
  grammar: [
    {
      title: "Đọc số lớn trong tiếng Anh",
      explanation: "Tách thành nhóm 3 chữ số. 1,234 → \"one thousand, two hundred and thirty-four\". 1,000,000 = one million.",
      examples: [
        { en: "There are 365 days in a year.",                 vi: "Một năm có 365 ngày." },
        { en: "The population is 5 million.",                   vi: "Dân số là 5 triệu." },
        { en: "She earned 12,500 dollars last year.",           vi: "Cô ấy kiếm 12.500 đô năm ngoái." },
      ],
    },
    {
      title: "Cách đọc giờ — past & to",
      explanation: "Phút ≤ 30 dùng \"past\" (sau giờ): 6:15 = a quarter past six. Phút > 30 dùng \"to\" (đến giờ kế): 6:45 = a quarter to seven.",
      examples: [
        { en: "It's half past seven.",                          vi: "7 giờ rưỡi." },
        { en: "The meeting starts at a quarter to nine.",       vi: "Cuộc họp bắt đầu lúc 8:45." },
        { en: "I wake up at seven o'clock.",                    vi: "Tôi thức dậy lúc 7 giờ đúng." },
      ],
    },
    {
      title: "Cách đọc ngày tháng (date)",
      explanation: "Anh: the 5th of May, 2024 / Mỹ: May 5th, 2024. Năm: 1990 = nineteen ninety, 2024 = twenty twenty-four.",
      examples: [
        { en: "My birthday is on the 12th of June.",            vi: "Sinh nhật tôi vào ngày 12 tháng 6." },
        { en: "She was born in 1998.",                          vi: "Cô ấy sinh năm 1998." },
        { en: "The exam is on March 3rd.",                       vi: "Kỳ thi vào ngày 3 tháng 3." },
      ],
    },
  ],
  quiz: [
    { question: "Đọc \"6:15\" theo cách Anh-Anh:",                       options: ["six fifteen", "a quarter past six", "a quarter to six", "half past six"], correct: 1 },
    { question: "1,000,000 là:",                                         options: ["one thousand", "one hundred", "one million", "one billion"],            correct: 2 },
    { question: "\"Decade\" nghĩa là:",                                  options: ["1 năm", "10 năm", "100 năm", "1000 năm"],                                correct: 1 },
    { question: "Năm 1990 đọc là:",                                      options: ["one nine nine zero", "nineteen ninety", "ten ninety", "nineteen hundred ninety"], correct: 1 },
    { question: "\"6:45\" theo cách Anh-Anh:",                           options: ["six forty-five", "a quarter past seven", "a quarter to seven", "half past six"], correct: 2 },
    { question: "\"Twice a week\" nghĩa là:",                            options: ["1 lần/tuần", "2 lần/tuần", "3 lần/tuần", "Hằng ngày"],                  correct: 1 },
  ],
};

export default IELTS_FOUNDATION_NUMBERS_LESSON;
