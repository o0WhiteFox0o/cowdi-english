// Track: general — Đại từ (Pronouns)

export const PRONOUNS_LESSON = {
  id: "pronouns",
  title: "Đại từ nhân xưng & sở hữu",
  description: "I/me/my/mine — bộ đại từ đầy đủ và cách dùng",
  level: "beginner",
  icon: "👥",
  vocabulary: [
    { word: "I",      phonetic: "/aɪ/",  meaning: "Tôi (chủ ngữ)",          example: "I am a student.", illustration: "🙋" },
    { word: "Me",     phonetic: "/miː/", meaning: "Tôi (tân ngữ)",          example: "She loves me.", illustration: "👈" },
    { word: "My",     phonetic: "/maɪ/", meaning: "Của tôi (+ N)",          example: "This is my book.", illustration: "📕" },
    { word: "Mine",   phonetic: "/maɪn/", meaning: "Của tôi (đứng riêng)",  example: "This book is mine.", illustration: "🔒" },
    { word: "You",    phonetic: "/juː/",  meaning: "Bạn / các bạn",         example: "You are kind.", illustration: "👉" },
    { word: "Your",   phonetic: "/jʊər/", meaning: "Của bạn",               example: "Your name is nice.", illustration: "🪪" },
    { word: "Yours",  phonetic: "/jʊərz/", meaning: "Của bạn (đứng riêng)", example: "The pen is yours.", illustration: "🖊️" },
    { word: "He",     phonetic: "/hiː/",  meaning: "Anh ấy",                example: "He is my brother.", illustration: "👦" },
    { word: "Him",    phonetic: "/hɪm/",  meaning: "Anh ấy (tân ngữ)",      example: "I see him.", illustration: "👀" },
    { word: "His",    phonetic: "/hɪz/",  meaning: "Của anh ấy",            example: "His car is red.", illustration: "🚗" },
    { word: "She",    phonetic: "/ʃiː/",  meaning: "Cô ấy",                 example: "She is my sister.", illustration: "👧" },
    { word: "Her",    phonetic: "/hɜːr/", meaning: "Cô ấy / của cô ấy",     example: "I know her name.", illustration: "👩" },
    { word: "It",     phonetic: "/ɪt/",   meaning: "Nó (vật, con vật)",     example: "It is a cat.", illustration: "🐈" },
    { word: "We / Us / Our / Ours", phonetic: "/wiː/", meaning: "Chúng tôi/ta", example: "We are friends.", illustration: "👨‍👩‍👧" },
    { word: "They / Them / Their / Theirs", phonetic: "/ðeɪ/", meaning: "Họ", example: "They are happy.", illustration: "👫" },
  ],
  grammar: [
    {
      title: "Bảng đầy đủ 4 dạng",
      explanation: "Mỗi ngôi có 4 dạng: Subject (chủ ngữ) - Object (tân ngữ) - Possessive Adj (tính từ sở hữu, đứng trước N) - Possessive Pronoun (đại từ sở hữu, đứng riêng).",
      examples: [
        { en: "I  / me  / my   / mine",  vi: "Ngôi 1 số ít" },
        { en: "You / you / your / yours", vi: "Ngôi 2" },
        { en: "He / him / his  / his",   vi: "Ngôi 3 nam" },
        { en: "She / her / her  / hers", vi: "Ngôi 3 nữ" },
        { en: "It / it  / its  / —",     vi: "Vật / con vật" },
        { en: "We / us  / our  / ours",  vi: "Chúng ta" },
        { en: "They / them / their / theirs", vi: "Họ" },
      ]
    },
    {
      title: "Khi nào dùng dạng nào?",
      explanation: "1) Subject (I, he…) đứng TRƯỚC động từ. 2) Object (me, him…) đứng SAU động từ hoặc giới từ. 3) Possessive Adj (my, his…) đứng TRƯỚC danh từ. 4) Possessive Pronoun (mine, his…) đứng MỘT MÌNH thay cho \"adj + N\".",
      examples: [
        { en: "He likes me.",          vi: "me = tân ngữ" },
        { en: "Give it to him.",       vi: "him sau giới từ" },
        { en: "This is my book.",      vi: "my + N" },
        { en: "This book is mine.",    vi: "mine = my book" },
      ]
    },
    {
      title: "Lưu ý: its vs it's",
      explanation: "ITS = của nó (tính từ sở hữu, KHÔNG có dấu '). IT'S = it is hoặc it has (rút gọn). Đây là lỗi sai phổ biến NHẤT của cả người Anh.",
      examples: [
        { en: "The dog wags its tail.",   vi: "Của nó" },
        { en: "It's raining.",            vi: "= It is" },
        { en: "It's been a long day.",    vi: "= It has" },
      ]
    },
  ],
  quiz: [
    { question: "\"___ am a teacher.\"",                  options: ["I", "Me", "My", "Mine"], correct: 0 },
    { question: "\"She loves ___.\"",                      options: ["I", "me", "my", "mine"], correct: 1 },
    { question: "\"This is ___ pen.\" (cái bút của tôi)",  options: ["I", "me", "my", "mine"], correct: 2 },
    { question: "\"The pen is ___.\" (đứng riêng)",        options: ["I", "me", "my", "mine"], correct: 3 },
    { question: "\"Give the book to ___.\" (anh ấy)",      options: ["he", "him", "his", "he's"], correct: 1 },
    { question: "\"___ tail is long.\" (đuôi của nó)",     options: ["It's", "Its", "It", "Its'"], correct: 1 },
    { question: "Đại từ nào ĐỨNG RIÊNG, không có N?",    options: ["my", "your", "his", "ours"], correct: 3 },
  ]
};

export default PRONOUNS_LESSON;
