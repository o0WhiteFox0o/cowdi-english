// Track: general — Số đếm & số thứ tự (Numbers — Cardinal & Ordinal)

export const NUMBERS_BASIC_LESSON = {
  id: "numbers-basic",
  title: "Số đếm & số thứ tự",
  description: "Đếm 1-100, 1000, 1 triệu — và số thứ tự cho ngày tháng/thứ hạng",
  level: "beginner",
  icon: "🔢",
  vocabulary: [
    { word: "Zero",      phonetic: "/ˈzɪəroʊ/",   meaning: "Số không (0)",       example: "Three minus three is zero.", illustration: "0️⃣" },
    { word: "One … Ten", phonetic: "/wʌn/ /tɛn/", meaning: "1 → 10",              example: "Count from one to ten.", illustration: "🔟" },
    { word: "Eleven",    phonetic: "/ɪˈlɛvən/",   meaning: "11",                  example: "I have eleven books.", illustration: "1️⃣1️⃣" },
    { word: "Twelve",    phonetic: "/twɛlv/",     meaning: "12",                  example: "There are twelve months.", illustration: "1️⃣2️⃣" },
    { word: "Thirteen",  phonetic: "/ˌθɜːˈtiːn/", meaning: "13 (lưu ý trọng âm)", example: "I am thirteen.", illustration: "1️⃣3️⃣" },
    { word: "Twenty",    phonetic: "/ˈtwɛnti/",   meaning: "20",                  example: "She is twenty.", illustration: "2️⃣0️⃣" },
    { word: "Hundred",   phonetic: "/ˈhʌndrəd/",  meaning: "Trăm",                example: "One hundred dollars.", illustration: "💯" },
    { word: "Thousand",  phonetic: "/ˈθaʊzənd/",  meaning: "Nghìn",               example: "Two thousand people.", illustration: "🔢" },
    { word: "Million",   phonetic: "/ˈmɪljən/",   meaning: "Triệu",               example: "One million dong.", illustration: "💰" },
    { word: "First",     phonetic: "/fɜːrst/",    meaning: "Thứ nhất",            example: "She is first in class.", illustration: "🥇" },
    { word: "Second",    phonetic: "/ˈsɛkənd/",   meaning: "Thứ hai",             example: "He is second.", illustration: "🥈" },
    { word: "Third",     phonetic: "/θɜːrd/",     meaning: "Thứ ba",              example: "I came third.", illustration: "🥉" },
    { word: "Fourth … Tenth", phonetic: "/fɔːrθ/", meaning: "4th → 10th",         example: "The fourth of July.", illustration: "🏅" },
    { word: "Twentieth", phonetic: "/ˈtwɛntiəθ/", meaning: "Thứ 20",              example: "Her twentieth birthday.", illustration: "🎂" },
    { word: "Last",      phonetic: "/lɑːst/",     meaning: "Cuối cùng",           example: "He came last.", illustration: "🏁" },
  ],
  grammar: [
    {
      title: "Số đếm 0–100",
      explanation: "11–19 là số đặc biệt, học thuộc. 20, 30, …, 90 đuôi -ty. Số có 2 chữ số viết kèm dấu gạch nối: 21 = twenty-one, 47 = forty-seven.",
      examples: [
        { en: "11 eleven, 12 twelve, 13 thirteen", vi: "Học thuộc" },
        { en: "20 twenty, 30 thirty, 40 forty",    vi: "Lưu ý: 40 KHÔNG có chữ u" },
        { en: "21 = twenty-one, 99 = ninety-nine", vi: "Có dấu gạch nối" },
      ]
    },
    {
      title: "Số đếm lớn",
      explanation: "Đọc theo nhóm: hundred, thousand, million, billion. Khi đếm cụ thể, KHÔNG thêm s (two hundred — đúng; two hundreds — sai). Trong tiếng Anh-Anh thường thêm \"and\" trước hàng chục: 235 = two hundred and thirty-five.",
      examples: [
        { en: "100 = one hundred",                 vi: "Một trăm" },
        { en: "1,500 = one thousand five hundred", vi: "Một nghìn rưỡi" },
        { en: "2,025 = two thousand and twenty-five", vi: "Năm 2025" },
      ]
    },
    {
      title: "Số thứ tự (Ordinal)",
      explanation: "1st, 2nd, 3rd đặc biệt. Còn lại thêm -th: 4th, 5th, 6th, … Quy tắc: y → ie + th (twenty → twentieth). Dùng cho ngày tháng, thứ hạng, tầng.",
      examples: [
        { en: "1st first, 2nd second, 3rd third",  vi: "Học thuộc" },
        { en: "4th, 5th, 6th, 7th, 8th, 9th, 10th", vi: "Thêm -th" },
        { en: "It's on the 5th floor.",            vi: "Tầng 5" },
        { en: "May 1st = the first of May",        vi: "Ngày 1 tháng 5" },
      ]
    },
  ],
  quiz: [
    { question: "Số 14 đọc là:",                       options: ["four-teen", "fourty", "fourteen", "fortyfour"], correct: 2 },
    { question: "40 viết là:",                         options: ["fourty", "fourteen", "forty", "fourdy"], correct: 2 },
    { question: "215 đọc là:",                          options: ["two fifteen", "two hundred fifteen", "two hundred and fifteen", "Cả 2 và 3 đúng"], correct: 3 },
    { question: "Số thứ tự của 3:",                     options: ["threeth", "third", "thirth", "threed"], correct: 1 },
    { question: "Ngày 1/5 trong tiếng Anh-Anh:",        options: ["one of May", "the first of May", "the first May", "1 May"], correct: 1 },
    { question: "1,000,000 đọc là:",                    options: ["one milion", "one million", "ten hundred thousand", "one bilion"], correct: 1 },
    { question: "Số thứ tự của 20:",                    options: ["twentyth", "twentieth", "twenty-first", "twentyieth"], correct: 1 },
  ]
};

export default NUMBERS_BASIC_LESSON;
