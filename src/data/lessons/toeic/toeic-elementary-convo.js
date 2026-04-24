// Track: toeic — TOEIC Elementary Conversations (Band 255 – 495)

export const TOEIC_ELEMENTARY_CONVO_LESSON = {
  id: "toeic-elementary-convo",
  title: "TOEIC Elementary Conversations",
  description: "Đối thoại cơ bản: đặt lịch hẹn, hỏi giá, đặt hàng, nghỉ phép",
  level: "beginner",
  icon: "💬",
  examTag: "toeic",
  toeicBand: "255-495",
  vocabulary: [
    { word: "Appointment",  phonetic: "/əˈpɔɪntmənt/",  meaning: "Cuộc hẹn",         example: "I have an appointment at 10.",                 illustration: "📅" },
    { word: "Schedule",     phonetic: "/ˈʃedjuːl/",     meaning: "Lịch trình",       example: "Let me check my schedule.",                    illustration: "🗓️" },
    { word: "Available",    phonetic: "/əˈveɪləbl/",    meaning: "Rảnh / Có sẵn",    example: "Are you available on Friday?",                 illustration: "🟢" },
    { word: "Reschedule",   phonetic: "/riːˈʃedjuːl/",  meaning: "Dời lịch",         example: "Can we reschedule the meeting?",               illustration: "🔄" },
    { word: "Order",        phonetic: "/ˈɔːdər/",       meaning: "Đặt hàng",         example: "I would like to order ten boxes.",             illustration: "📦" },
    { word: "Delivery",     phonetic: "/dɪˈlɪvəri/",    meaning: "Giao hàng",        example: "Free delivery within the city.",               illustration: "🚚" },
    { word: "Invoice",      phonetic: "/ˈɪnvɔɪs/",      meaning: "Hoá đơn",          example: "Please send me the invoice.",                  illustration: "🧾" },
    { word: "Day off",      phonetic: "/deɪ ɒf/",       meaning: "Ngày nghỉ",        example: "I'd like to take a day off on Monday.",        illustration: "🏖️" },
    { word: "Leave",        phonetic: "/liːv/",         meaning: "Nghỉ phép",        example: "She is on sick leave today.",                  illustration: "🤒" },
    { word: "Apologize",    phonetic: "/əˈpɒlədʒaɪz/",  meaning: "Xin lỗi (trang trọng)", example: "I apologize for the delay.",             illustration: "🙇" },
    { word: "Confirm",      phonetic: "/kənˈfɜːm/",     meaning: "Xác nhận",         example: "Please confirm your order.",                   illustration: "✔️" },
    { word: "Cancel",       phonetic: "/ˈkænsl/",       meaning: "Huỷ",              example: "I need to cancel my appointment.",             illustration: "❌" },
  ],
  grammar: [
    {
      title: "Would like to + V (ý muốn lịch sự)",
      explanation: "Thay cho 'want' trong ngữ cảnh công sở / dịch vụ khách hàng.",
      examples: [
        { en: "I would like to order ten boxes, please.",  vi: "Tôi muốn đặt 10 thùng hàng." },
        { en: "I'd like to reschedule the meeting.",        vi: "Tôi muốn dời lịch họp." },
        { en: "Would you like some coffee?",                vi: "Bạn có muốn uống cà phê không?" },
      ],
    },
    {
      title: "Câu hỏi Yes/No với 'Are you available…?'",
      explanation: "Đây là công thức đặt lịch cơ bản: Are you available on + thứ/ngày/giờ?",
      examples: [
        { en: "Are you available on Friday afternoon?",    vi: "Bạn có rảnh chiều thứ Sáu không?" },
        { en: "Is Mr. Kim available at 2 p.m.?",            vi: "Anh Kim có rảnh lúc 2 giờ chiều không?" },
        { en: "Are you free tomorrow morning?",             vi: "Bạn có rảnh sáng mai không?" },
      ],
    },
  ],
  quiz: [
    { question: "\"Can we ___ the meeting?\" (dời lịch)",              options: ["cancel", "reschedule", "confirm", "order"],            correct: 1 },
    { question: "\"Please send me the ___.\" (hoá đơn)",                 options: ["delivery", "invoice", "order", "leave"],                correct: 1 },
    { question: "Cách lịch sự nhất để nói 'tôi muốn đặt hàng':",        options: ["I want order.", "Order!", "I would like to order.", "Me order please."], correct: 2 },
    { question: "\"She is on sick ___ today.\"",                         options: ["off", "leave", "day", "break"],                        correct: 1 },
    { question: "\"Are you ___ on Friday?\" (rảnh)",                     options: ["busy", "schedule", "available", "order"],               correct: 2 },
    { question: "Trái nghĩa của \"confirm\" trong ngữ cảnh lịch hẹn:",   options: ["reschedule", "order", "apologize", "cancel"],           correct: 3 },
  ],
};

export default TOEIC_ELEMENTARY_CONVO_LESSON;
