// Track: ielts — IELTS Pre-Intermediate Listening (Band 4.5 – 5.5)

export const IELTS_PRE_LISTENING_LESSON = {
  id: "ielts-pre-listening",
  title: "IELTS Pre-Intermediate Listening",
  description: "Luyện nghe Section 1–2: form-filling, multiple choice, map labelling",
  level: "intermediate",
  icon: "🎧",
  examTag: "ielts",
  ieltsBand: "4.5-5.5",
  vocabulary: [
    { word: "Booking",     phonetic: "/ˈbʊkɪŋ/",        meaning: "Đặt chỗ",         example: "I'd like to make a booking for two.",     illustration: "📋" },
    { word: "Reception",   phonetic: "/rɪˈsepʃn/",      meaning: "Lễ tân",          example: "Please ask at reception.",                illustration: "🛎️" },
    { word: "Discount",    phonetic: "/ˈdɪskaʊnt/",     meaning: "Giảm giá",        example: "Members get a 10% discount.",             illustration: "🏷️" },
    { word: "Deposit",     phonetic: "/dɪˈpɒzɪt/",      meaning: "Tiền đặt cọc",    example: "Please pay a deposit of $50.",            illustration: "💳" },
    { word: "Refund",      phonetic: "/ˈriːfʌnd/",      meaning: "Hoàn tiền",       example: "Refunds are available within 7 days.",    illustration: "💸" },
    { word: "Brochure",    phonetic: "/ˈbrəʊʃə/",       meaning: "Tờ rơi",          example: "Take a brochure from the desk.",          illustration: "📄" },
    { word: "Membership",  phonetic: "/ˈmembəʃɪp/",     meaning: "Tư cách thành viên", example: "Annual membership costs $120.",       illustration: "🪪" },
    { word: "Confirm",     phonetic: "/kənˈfɜːm/",      meaning: "Xác nhận",        example: "Please confirm your email address.",      illustration: "✅" },
    { word: "Spell",       phonetic: "/spel/",          meaning: "Đánh vần",        example: "Could you spell your surname?",           illustration: "🔤" },
    { word: "Surname",     phonetic: "/ˈsɜːneɪm/",      meaning: "Họ",              example: "My surname is Nguyen.",                   illustration: "👤" },
    { word: "Available",   phonetic: "/əˈveɪləbl/",     meaning: "Có sẵn",          example: "The room is available next week.",        illustration: "✔️" },
    { word: "Cancel",      phonetic: "/ˈkænsl/",        meaning: "Hủy",             example: "I want to cancel my order.",              illustration: "🚫" },
  ],
  grammar: [
    {
      title: "Câu hỏi Wh- thông dụng trong Section 1",
      explanation: "What's your name? Where do you live? When can you come? How much is it? — đây là dạng câu hỏi điền form rất hay gặp.",
      examples: [
        { en: "What's your full name and date of birth?",       vi: "Tên đầy đủ và ngày sinh của bạn?" },
        { en: "When would you like to start?",                  vi: "Bạn muốn bắt đầu khi nào?" },
        { en: "How would you like to pay?",                     vi: "Bạn muốn thanh toán bằng cách nào?" },
      ],
    },
    {
      title: "Câu mệnh đề bị động đơn giản",
      explanation: "S + is/are + V3: \"The room is reserved.\" Section 2 giới thiệu địa điểm thường dùng bị động.",
      examples: [
        { en: "The library is opened at 8 a.m.",                vi: "Thư viện mở cửa lúc 8 giờ." },
        { en: "Lunch is served between 12 and 2.",              vi: "Bữa trưa phục vụ từ 12 đến 2 giờ." },
        { en: "Tickets are sold at the entrance.",              vi: "Vé bán ở lối vào." },
      ],
    },
  ],
  quiz: [
    { question: "\"Could you spell your surname?\" — \"Surname\" là gì?",  options: ["Tên", "Họ", "Tên đệm", "Biệt danh"],                              correct: 1 },
    { question: "\"Deposit\" trong booking nghĩa là:",                      options: ["Tiền đặt cọc", "Tiền hoàn", "Tiền lãi", "Phí dịch vụ"],            correct: 0 },
    { question: "Khi nghe form-filling, lưu ý chú ý nhất:",                 options: ["Câu hỏi mở", "Số, tên, địa chỉ", "Cảm xúc người nói", "Ngữ pháp"],   correct: 1 },
    { question: "\"Available\" có nghĩa là:",                                options: ["Có sẵn / còn trống", "Đã hết", "Đắt", "Mới"],                       correct: 0 },
    { question: "\"Refund\" có nghĩa là:",                                  options: ["Đặt cọc", "Trả tiền lại / hoàn tiền", "Mua thêm", "Cho thuê"],     correct: 1 },
    { question: "Section 2 IELTS Listening thường về:",                      options: ["Hội thoại 2 người tại nhà", "Bài độc thoại về địa điểm/dịch vụ", "Thảo luận học thuật", "Bài giảng đại học"], correct: 1 },
  ],
};

export default IELTS_PRE_LISTENING_LESSON;
