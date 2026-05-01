// Track: general — Cụm từ giao tiếp hàng ngày (Daily Phrases)

export const DAILY_PHRASES_LESSON = {
  id: "daily-phrases",
  title: "Cụm từ giao tiếp hàng ngày",
  description: "50+ câu cửa miệng để bắt đầu nói tiếng Anh ngay hôm nay",
  level: "beginner",
  icon: "💬",
  vocabulary: [
    { word: "Hello / Hi",     phonetic: "/həˈloʊ/", meaning: "Xin chào",             example: "Hello! Nice to meet you.", illustration: "👋" },
    { word: "How are you?",   phonetic: "/haʊ ɑːr juː/", meaning: "Bạn khoẻ không?", example: "Hi! How are you?", illustration: "🙂" },
    { word: "I'm fine, thanks", phonetic: "/aɪm faɪn θæŋks/", meaning: "Tôi khoẻ, cảm ơn", example: "I'm fine, thanks. And you?", illustration: "👌" },
    { word: "Nice to meet you", phonetic: "/naɪs tə miːt juː/", meaning: "Rất vui được gặp bạn", example: "Nice to meet you, John.", illustration: "🤝" },
    { word: "Thank you / Thanks", phonetic: "/θæŋk juː/", meaning: "Cảm ơn", example: "Thank you very much!", illustration: "🙏" },
    { word: "You're welcome", phonetic: "/jʊər ˈwɛlkəm/", meaning: "Không có gì",   example: "— Thanks! — You're welcome.", illustration: "💞" },
    { word: "Sorry",          phonetic: "/ˈsɒri/",       meaning: "Xin lỗi",         example: "Sorry, I'm late.", illustration: "😔" },
    { word: "Excuse me",      phonetic: "/ɪkˈskjuːz miː/", meaning: "Xin lỗi (gây chú ý)", example: "Excuse me, where is the toilet?", illustration: "🙋" },
    { word: "Please",         phonetic: "/pliːz/",       meaning: "Làm ơn",          example: "Help me, please.", illustration: "🥺" },
    { word: "Yes / No",       phonetic: "/jɛs/ /noʊ/",   meaning: "Có / Không",      example: "Yes, I do. / No, thanks.", illustration: "✅" },
    { word: "See you later",  phonetic: "/siː juː ˈleɪtər/", meaning: "Hẹn gặp lại", example: "Bye! See you later.", illustration: "👋" },
    { word: "Goodbye / Bye",  phonetic: "/ɡʊdˈbaɪ/",     meaning: "Tạm biệt",        example: "Goodbye, take care!", illustration: "✋" },
    { word: "I don't understand", phonetic: "/aɪ doʊnt ˌʌndərˈstænd/", meaning: "Tôi không hiểu", example: "Sorry, I don't understand.", illustration: "🤔" },
    { word: "Can you repeat?",phonetic: "/kæn juː rɪˈpiːt/", meaning: "Bạn có thể nhắc lại?", example: "Can you repeat that, please?", illustration: "🔁" },
    { word: "Speak slowly, please", phonetic: "/spiːk ˈsloʊli/", meaning: "Nói chậm thôi", example: "Please speak slowly.", illustration: "🐢" },
    { word: "How much is it?", phonetic: "/haʊ mʌtʃ ɪz ɪt/", meaning: "Cái này giá bao nhiêu?", example: "How much is this shirt?", illustration: "💰" },
    { word: "Where is the …?", phonetic: "/wɛər ɪz ðə/",  meaning: "… ở đâu?",        example: "Where is the bathroom?", illustration: "📍" },
    { word: "I would like …", phonetic: "/aɪ wʊd laɪk/",  meaning: "Tôi muốn …",      example: "I would like a coffee.", illustration: "☕" },
    { word: "Help!",          phonetic: "/hɛlp/",         meaning: "Giúp tôi với!",    example: "Help! I'm lost.", illustration: "🆘" },
    { word: "No problem",     phonetic: "/noʊ ˈprɒbləm/", meaning: "Không sao",       example: "— Sorry. — No problem!", illustration: "👍" },
  ],
  grammar: [
    {
      title: "Chào hỏi theo thời điểm",
      explanation: "Good morning (trước 12h trưa), Good afternoon (12h - 17h), Good evening (sau 17h, gặp lần đầu trong tối). Good night chỉ dùng khi TẠM BIỆT vào buổi tối / đi ngủ.",
      examples: [
        { en: "Good morning, sir!",     vi: "Chào buổi sáng" },
        { en: "Good afternoon!",        vi: "Chào buổi chiều" },
        { en: "Good night, sleep well", vi: "Chúc ngủ ngon (chia tay)" },
      ]
    },
    {
      title: "Cảm ơn / Xin lỗi đa cấp",
      explanation: "Thanks < Thank you < Thank you very much < Thanks a million / I really appreciate it. Sorry < I'm sorry < I'm so sorry < I apologize.",
      examples: [
        { en: "Thanks a lot!",          vi: "Cảm ơn nhiều" },
        { en: "I really appreciate it.", vi: "Tôi rất cảm kích" },
        { en: "I'm so sorry.",          vi: "Thành thật xin lỗi" },
      ]
    },
    {
      title: "5 câu sống còn cho người mới",
      explanation: "Học thuộc 5 câu này sẽ tự tin trò chuyện ngay: 1) Sorry, I don't understand. 2) Can you repeat, please? 3) Speak slowly, please. 4) How do you spell that? 5) What does … mean?",
      examples: [
        { en: "What does \"awesome\" mean?", vi: "\"awesome\" nghĩa là gì?" },
        { en: "How do you spell your name?", vi: "Tên bạn đánh vần như thế nào?" },
      ]
    },
  ],
  quiz: [
    { question: "Đáp lại \"Thank you\" lịch sự nhất:",      options: ["OK", "You're welcome", "No", "Yes please"], correct: 1 },
    { question: "Câu chào lúc 9h sáng:",                    options: ["Good night", "Good evening", "Good morning", "Goodbye"], correct: 2 },
    { question: "Khi không nghe rõ, bạn nói:",              options: ["I'm fine", "Can you repeat, please?", "Goodbye", "Yes"], correct: 1 },
    { question: "Cách lịch sự để gây chú ý người lạ:",      options: ["Hey!", "Excuse me", "What?", "Hello!"], correct: 1 },
    { question: "Đáp lại \"How are you?\":",                options: ["Where are you?", "I'm fine, thanks. And you?", "Yes, I am", "Goodbye"], correct: 1 },
    { question: "Hỏi giá:",                                  options: ["What time is it?", "How much is it?", "Where is it?", "Who is it?"], correct: 1 },
    { question: "Khi tạm biệt buổi tối / trước khi ngủ:",   options: ["Good morning", "Good night", "Good evening", "Hello"], correct: 1 },
  ]
};

export default DAILY_PHRASES_LESSON;
