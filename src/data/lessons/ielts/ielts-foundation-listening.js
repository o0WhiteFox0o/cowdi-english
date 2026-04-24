// Track: ielts — IELTS Foundation Listening (Band 3.0 – 4.0)

export const IELTS_FOUNDATION_LISTENING_LESSON = {
  id: "ielts-foundation-listening",
  title: "IELTS Foundation Listening",
  description: "Làm quen với dạng bài nghe đơn giản: số, tên, địa chỉ, lịch trình",
  level: "beginner",
  icon: "🎧",
  examTag: "ielts",
  ieltsBand: "3.0-4.0",
  vocabulary: [
    { word: "Spell",      phonetic: "/spel/",        meaning: "Đánh vần",       example: "Could you spell your name, please?",            illustration: "🔤" },
    { word: "Address",    phonetic: "/əˈdres/",      meaning: "Địa chỉ",        example: "Please write your address here.",                illustration: "🏠" },
    { word: "Postcode",   phonetic: "/ˈpəʊstkəʊd/",  meaning: "Mã bưu điện",    example: "What is your postcode?",                         illustration: "📮" },
    { word: "Repeat",     phonetic: "/rɪˈpiːt/",     meaning: "Nhắc lại",       example: "Could you repeat that, please?",                 illustration: "🔁" },
    { word: "Schedule",   phonetic: "/ˈʃedjuːl/",    meaning: "Lịch trình",     example: "Here is the train schedule.",                    illustration: "📅" },
    { word: "Platform",   phonetic: "/ˈplætfɔːm/",   meaning: "Sân ga",         example: "The train leaves from platform 3.",              illustration: "🚉" },
    { word: "Depart",     phonetic: "/dɪˈpɑːt/",     meaning: "Khởi hành",      example: "Flights depart every hour.",                     illustration: "🛫" },
    { word: "Arrive",     phonetic: "/əˈraɪv/",      meaning: "Đến nơi",        example: "The bus will arrive at 9 a.m.",                  illustration: "🛬" },
    { word: "Reserve",    phonetic: "/rɪˈzɜːv/",     meaning: "Đặt trước",      example: "I would like to reserve a table.",               illustration: "🗓️" },
    { word: "Confirm",    phonetic: "/kənˈfɜːm/",    meaning: "Xác nhận",       example: "Please confirm your booking.",                   illustration: "✅" },
  ],
  grammar: [
    {
      title: "Số đếm & số thứ tự trong Listening",
      explanation: "Phân biệt 13/30, 14/40... và cách đọc số điện thoại (double/triple).",
      examples: [
        { en: "My number is oh-seven-double-nine.",   vi: "Số của tôi là 0-7-9-9." },
        { en: "The meeting is on the thirteenth.",     vi: "Cuộc họp vào ngày 13." },
        { en: "It costs fifteen, not fifty, pounds.",  vi: "Nó giá 15, không phải 50 bảng." },
      ],
    },
    {
      title: "Câu hỏi thông tin cá nhân",
      explanation: "What / How / When + auxiliary dùng để hỏi thông tin.",
      examples: [
        { en: "What is your full name?",               vi: "Họ và tên đầy đủ của bạn là gì?" },
        { en: "How do you spell it?",                  vi: "Đánh vần thế nào?" },
        { en: "When does the train depart?",           vi: "Tàu khởi hành khi nào?" },
      ],
    },
  ],
  quiz: [
    { question: "\"Postcode\" nghĩa là:",                  options: ["Mã bưu điện", "Số điện thoại", "Địa chỉ email", "Mật khẩu"],   correct: 0 },
    { question: "Câu nào dùng để nhờ nhắc lại?",           options: ["Please sit down.", "Could you repeat that?", "Thank you.", "I'm busy."], correct: 1 },
    { question: "\"Depart\" trái nghĩa với:",              options: ["Reserve", "Confirm", "Arrive", "Spell"],                      correct: 2 },
    { question: "\"The train leaves from ___ 3.\"",        options: ["address", "platform", "postcode", "schedule"],                correct: 1 },
    { question: "Nghe \"oh-seven-double-nine\" là số:",    options: ["0799", "0779", "0779-9", "0709"],                             correct: 0 },
  ],
};

export default IELTS_FOUNDATION_LISTENING_LESSON;
