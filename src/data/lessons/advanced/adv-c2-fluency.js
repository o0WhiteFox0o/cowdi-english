// Track: advanced — C2 Native-like Fluency

export const ADV_C2_FLUENCY_LESSON = {
  id: "adv-c2-fluency",
  title: "C2 Native-like Fluency",
  description: "Cách tiếp cận tiếng Anh tự nhiên: discourse markers, fillers, intonation",
  level: "advanced",
  icon: "🌊",
  cefrLevel: "C2",
  vstepLevel: "C2",
  vocabulary: [
    { word: "Discourse marker", phonetic: "/ˈdɪskɔːs/", meaning: "Dấu phát ngôn", example: "\"Anyway\" is a discourse marker.", illustration: "🚦" },
    { word: "Filler", phonetic: "/ˈfɪlə/", meaning: "Từ đệm", example: "\"Um\" and \"like\" are common fillers.", illustration: "💬" },
    { word: "Intonation", phonetic: "/ˌɪntəˈneɪʃən/", meaning: "Ngữ điệu", example: "Rising intonation signals a question.", illustration: "🎵" },
    { word: "Stress", phonetic: "/stres/", meaning: "Trọng âm", example: "Word stress changes meaning.", illustration: "💥" },
    { word: "Linking", phonetic: "/ˈlɪŋkɪŋ/", meaning: "Nối âm", example: "Linking makes speech flow naturally.", illustration: "🔗" },
    { word: "Reduction", phonetic: "/rɪˈdʌkʃən/", meaning: "Rút gọn âm", example: "Native speakers use vowel reduction.", illustration: "🔻" },
    { word: "Schwa", phonetic: "/ʃwɑː/", meaning: "Âm /ə/ trung tính", example: "Schwa is the most common vowel.", illustration: "ə" },
    { word: "Contraction", phonetic: "/kənˈtrækʃən/", meaning: "Dạng rút gọn", example: "Use contractions in casual speech.", illustration: "✂️" },
    { word: "Idiomatic", phonetic: "/ˌɪdiəˈmætɪk/", meaning: "Thành ngữ tự nhiên", example: "Idiomatic phrasing sounds native.", illustration: "💎" },
    { word: "Hedge word", phonetic: "/hedʒ/", meaning: "Từ giảm nhẹ", example: "\"Sort of\" and \"kind of\" are hedge words.", illustration: "🛡️" },
    { word: "Backchannel", phonetic: "/ˈbæktʃænl/", meaning: "Phản hồi nghe", example: "\"Mhm\" is a backchannel signal.", illustration: "🔄" },
    { word: "Connected speech", phonetic: "/kəˈnektɪd/", meaning: "Lời nói liền mạch", example: "Connected speech blurs word boundaries.", illustration: "〰️" }
  ],
  grammar: [
    {
      title: "Discourse markers thông dụng",
      explanation: "well, anyway, by the way, mind you, having said that, on second thought.",
      examples: [
        { en: "Well, that's an interesting question.", vi: "À, đó là câu hỏi thú vị đấy." },
        { en: "By the way, did you call her back?", vi: "À nhân tiện, cậu đã gọi lại cô ấy chưa?" },
        { en: "Mind you, he's been very supportive.", vi: "Mà nói thật, anh ấy rất ủng hộ." }
      ]
    },
    {
      title: "Liên kết âm và rút gọn",
      explanation: "\"What are you doing?\" → \"Whatcha doin'?\". \"Going to\" → \"gonna\". \"Want to\" → \"wanna\".",
      examples: [
        { en: "I'm gonna grab a coffee.", vi: "Tôi sẽ đi lấy cà phê." },
        { en: "Whatcha up to?", vi: "Cậu đang làm gì vậy?" },
        { en: "I dunno what to say.", vi: "Tôi không biết nói gì." }
      ]
    }
  ],
  quiz: [
    { question: "\"Schwa\" là:", options: ["Phụ âm cứng", "Nguyên âm /ə/ trung tính", "Trọng âm chính", "Ngữ điệu lên"], correct: 1 },
    { question: "\"By the way\" là:", options: ["Hedge word", "Discourse marker", "Filler", "Idiom"], correct: 1 },
    { question: "\"Gonna\" là dạng rút gọn của:", options: ["Going to", "Got to", "Want to", "Have to"], correct: 0 },
    { question: "Backchannel có chức năng:", options: ["Cắt lời", "Phản hồi để cho thấy đang nghe", "Đổi chủ đề", "Tóm tắt"], correct: 1 },
    { question: "\"Sort of\" là:", options: ["Discourse marker", "Hedge word (giảm nhẹ)", "Filler trống nghĩa", "Idiom"], correct: 1 }
  ]
};

export default ADV_C2_FLUENCY_LESSON;
