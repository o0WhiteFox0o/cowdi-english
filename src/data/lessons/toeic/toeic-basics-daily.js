// Track: toeic — TOEIC Basics: Daily Phrases (Band 10 – 250)

export const TOEIC_BASICS_DAILY_LESSON = {
  id: "toeic-basics-daily",
  title: "TOEIC Basics: Daily Work Phrases",
  description: "Câu giao tiếp đơn giản: chào hỏi, xin phép, trả lời ngắn",
  level: "beginner",
  icon: "👋",
  examTag: "toeic",
  toeicBand: "10-250",
  vocabulary: [
    { word: "Good morning",  phonetic: "/ɡʊd ˈmɔːnɪŋ/",  meaning: "Chào buổi sáng",  example: "Good morning, everyone.",                   illustration: "🌅" },
    { word: "Please",         phonetic: "/pliːz/",         meaning: "Làm ơn",          example: "Please send me the file.",                   illustration: "🙏" },
    { word: "Thank you",      phonetic: "/θæŋk juː/",      meaning: "Cảm ơn",          example: "Thank you for your help.",                   illustration: "🙏" },
    { word: "Sorry",          phonetic: "/ˈsɒri/",         meaning: "Xin lỗi",         example: "Sorry, I'm late.",                            illustration: "😔" },
    { word: "Help",           phonetic: "/help/",          meaning: "Giúp đỡ",         example: "Can you help me?",                           illustration: "🆘" },
    { word: "Busy",           phonetic: "/ˈbɪzi/",         meaning: "Bận",             example: "She is busy right now.",                     illustration: "💼" },
    { word: "Ready",          phonetic: "/ˈredi/",         meaning: "Sẵn sàng",        example: "I'm ready for the meeting.",                 illustration: "✅" },
    { word: "Late",           phonetic: "/leɪt/",          meaning: "Muộn",            example: "Don't be late tomorrow.",                    illustration: "⏰" },
    { word: "Email",          phonetic: "/ˈiːmeɪl/",       meaning: "Email",           example: "Please send me an email.",                   illustration: "📧" },
    { word: "Call",           phonetic: "/kɔːl/",          meaning: "Gọi điện",        example: "I'll call you at 3 p.m.",                    illustration: "📞" },
  ],
  grammar: [
    {
      title: "Câu yêu cầu lịch sự (Could you / Can you)",
      explanation: "Could you + V? = lịch sự hơn Can you + V? — cả hai dùng để nhờ vả.",
      examples: [
        { en: "Can you send me the file?",              vi: "Bạn có thể gửi tôi tệp đó không?" },
        { en: "Could you help me with this?",           vi: "Bạn có thể giúp tôi việc này không?" },
        { en: "Could you call me back, please?",        vi: "Bạn gọi lại cho tôi nhé?" },
      ],
    },
    {
      title: "Câu trả lời ngắn (yes/no)",
      explanation: "Dùng trợ động từ để trả lời ngắn: Do you…? — Yes, I do / No, I don't.",
      examples: [
        { en: "Are you busy? — Yes, I am.",              vi: "Bạn bận không? — Có." },
        { en: "Do you have time? — No, I don't.",        vi: "Bạn có thời gian không? — Không." },
        { en: "Is he ready? — Yes, he is.",              vi: "Anh ấy sẵn sàng chưa? — Rồi." },
      ],
    },
  ],
  quiz: [
    { question: "\"Sorry, I'm ___.\" (muộn)",                    options: ["busy", "ready", "late", "sorry"],                     correct: 2 },
    { question: "Câu nào lịch sự nhất?",                          options: ["Give me the file!", "File now!", "Could you send me the file?", "Send file."], correct: 2 },
    { question: "\"I'm ___ for the meeting.\" (sẵn sàng)",        options: ["busy", "ready", "late", "sorry"],                     correct: 1 },
    { question: "Trả lời ngắn \"Are you busy?\" phù hợp nhất:",   options: ["Yes, I do.", "Yes, I am.", "Yes, I can.", "Yes, please."], correct: 1 },
    { question: "\"Thank you for your ___.\" (giúp đỡ)",          options: ["email", "help", "call", "break"],                    correct: 1 },
  ],
};

export default TOEIC_BASICS_DAILY_LESSON;
