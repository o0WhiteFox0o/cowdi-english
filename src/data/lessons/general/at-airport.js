// Track: general — Ở sân bay & du lịch (At the Airport)

export const AIRPORT_LESSON = {
  id: "at-airport",
  title: "Ở sân bay & du lịch",
  description: "Check-in, hộ chiếu, hành lý, lên máy bay — không lo lạc giữa sân bay",
  level: "beginner",
  icon: "✈️",
  vocabulary: [
    { word: "Airport",       phonetic: "/ˈɛəpɔːrt/",   meaning: "Sân bay",          example: "I'm at the airport.", illustration: "🛫" },
    { word: "Flight",        phonetic: "/flaɪt/",      meaning: "Chuyến bay",        example: "My flight is at 7 PM.", illustration: "✈️" },
    { word: "Boarding pass", phonetic: "/ˈbɔːrdɪŋ pɑːs/", meaning: "Thẻ lên máy bay", example: "Show your boarding pass.", illustration: "🎫" },
    { word: "Passport",      phonetic: "/ˈpɑːspɔːrt/", meaning: "Hộ chiếu",          example: "My passport, please.", illustration: "📘" },
    { word: "Visa",          phonetic: "/ˈviːzə/",     meaning: "Thị thực",          example: "Do I need a visa?", illustration: "🪪" },
    { word: "Check-in",      phonetic: "/ˈtʃɛk ɪn/",   meaning: "Làm thủ tục",       example: "Where is the check-in counter?", illustration: "🧳" },
    { word: "Luggage / Baggage", phonetic: "/ˈlʌɡɪdʒ/", meaning: "Hành lý",          example: "Where is my luggage?", illustration: "🧳" },
    { word: "Carry-on",      phonetic: "/ˈkæri ɒn/",   meaning: "Hành lý xách tay",  example: "Only one carry-on bag.", illustration: "🎒" },
    { word: "Gate",          phonetic: "/ɡeɪt/",       meaning: "Cửa lên máy bay",   example: "Boarding at gate 12.", illustration: "🚪" },
    { word: "Terminal",      phonetic: "/ˈtɜːrmɪnl/",  meaning: "Nhà ga",            example: "Terminal 2, please.", illustration: "🏛️" },
    { word: "Departure",     phonetic: "/dɪˈpɑːrtʃər/", meaning: "Khởi hành",        example: "Departure time: 9 AM.", illustration: "🛫" },
    { word: "Arrival",       phonetic: "/əˈraɪvəl/",   meaning: "Đến nơi",           example: "Arrival in Hanoi at noon.", illustration: "🛬" },
    { word: "Customs",       phonetic: "/ˈkʌstəmz/",   meaning: "Hải quan",          example: "Anything to declare at customs?", illustration: "🛂" },
    { word: "Delay",         phonetic: "/dɪˈleɪ/",     meaning: "Hoãn / trễ",        example: "The flight is delayed.", illustration: "⏳" },
    { word: "Cancel",        phonetic: "/ˈkænsəl/",    meaning: "Huỷ",               example: "My flight was cancelled.", illustration: "❌" },
  ],
  grammar: [
    {
      title: "Câu hỏi cửa miệng tại sân bay",
      explanation: "Tập 5 câu này thuộc lòng để không lúng túng: Where is …? / What time …? / Is the flight on time? / Can I have …? / Excuse me, …",
      examples: [
        { en: "Where is gate 12?",               vi: "Cửa 12 ở đâu?" },
        { en: "What time does the flight leave?", vi: "Mấy giờ máy bay khởi hành?" },
        { en: "Is the flight on time?",          vi: "Chuyến bay đúng giờ không?" },
        { en: "Can I have an aisle seat?",       vi: "Cho tôi ghế gần lối đi" },
      ]
    },
    {
      title: "Tại quầy check-in",
      explanation: "Nhân viên thường hỏi: Passport, please. / How many bags? / Window or aisle? / Anything fragile? Bạn chuẩn bị câu trả lời ngắn gọn.",
      examples: [
        { en: "— How many bags? — Just one.",     vi: "1 vali thôi" },
        { en: "— Window or aisle? — Window, please.", vi: "Ghế cửa sổ" },
        { en: "I have nothing to declare.",       vi: "Tôi không có gì khai báo" },
      ]
    },
    {
      title: "Khi gặp sự cố",
      explanation: "Trễ chuyến / mất hành lý / nhỡ chuyến — học cách báo: My flight is delayed. / I lost my luggage. / I missed my flight. Yêu cầu hỗ trợ: Could you help me, please?",
      examples: [
        { en: "I think I lost my luggage.",       vi: "Tôi nghĩ mình mất hành lý" },
        { en: "Could you help me, please?",       vi: "Bạn có thể giúp tôi không?" },
        { en: "When is the next flight?",         vi: "Chuyến tiếp theo lúc nào?" },
      ]
    },
  ],
  quiz: [
    { question: "Tài liệu BẮT BUỘC để bay quốc tế:",         options: ["Map", "Passport", "Receipt", "Ticket only"], correct: 1 },
    { question: "Thẻ \"Boarding pass\" để:",                  options: ["Vào nhà hàng", "Vào sân bay", "Lên máy bay", "Lấy hành lý"], correct: 2 },
    { question: "Hành lý xách tay là:",                       options: ["luggage", "carry-on", "checked bag", "trolley"], correct: 1 },
    { question: "Ghế cửa sổ là:",                              options: ["aisle seat", "window seat", "middle seat", "exit row"], correct: 1 },
    { question: "Câu \"My flight is delayed\" nghĩa là:",     options: ["Hoãn", "Đúng giờ", "Hủy", "Đến rồi"], correct: 0 },
    { question: "\"Customs\" là khu:",                         options: ["Mua sắm", "Hải quan", "Ăn uống", "Wifi"], correct: 1 },
    { question: "Hỏi cửa lên máy bay:",                        options: ["Where is the menu?", "Where is gate 12?", "Where is the bill?", "Where are you?"], correct: 1 },
  ]
};

export default AIRPORT_LESSON;
