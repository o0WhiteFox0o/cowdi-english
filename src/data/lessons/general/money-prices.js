// Track: general — Tiền tệ & mua bán (Money & Shopping basics)

export const MONEY_PRICES_LESSON = {
  id: "money-prices",
  title: "Tiền & giá cả",
  description: "Đọc giá, mặc cả, thanh toán — đủ dùng khi đi siêu thị và chợ",
  level: "beginner",
  icon: "💵",
  vocabulary: [
    { word: "Money",     phonetic: "/ˈmʌni/",   meaning: "Tiền",            example: "I don't have much money.", illustration: "💰" },
    { word: "Cash",      phonetic: "/kæʃ/",     meaning: "Tiền mặt",        example: "I'll pay in cash.", illustration: "💵" },
    { word: "Card",      phonetic: "/kɑːrd/",   meaning: "Thẻ",             example: "Do you accept cards?", illustration: "💳" },
    { word: "Coin",      phonetic: "/kɔɪn/",    meaning: "Đồng xu",         example: "I need some coins.", illustration: "🪙" },
    { word: "Note / Bill", phonetic: "/noʊt/",  meaning: "Tờ tiền / hoá đơn", example: "A 10-dollar note.", illustration: "🧾" },
    { word: "Price",     phonetic: "/praɪs/",   meaning: "Giá",             example: "The price is too high.", illustration: "🏷️" },
    { word: "Cheap",     phonetic: "/tʃiːp/",   meaning: "Rẻ",              example: "This shirt is cheap.", illustration: "👕" },
    { word: "Expensive", phonetic: "/ɪkˈspɛnsɪv/", meaning: "Đắt",          example: "That bag is expensive.", illustration: "👜" },
    { word: "Discount",  phonetic: "/ˈdɪskaʊnt/", meaning: "Giảm giá",      example: "Is there a discount?", illustration: "🎟️" },
    { word: "Sale",      phonetic: "/seɪl/",    meaning: "Đợt giảm giá",     example: "The shop is on sale.", illustration: "🏷️" },
    { word: "Receipt",   phonetic: "/rɪˈsiːt/", meaning: "Hoá đơn (p câm)", example: "Can I have the receipt?", illustration: "🧾" },
    { word: "Change",    phonetic: "/tʃeɪndʒ/", meaning: "Tiền thối",       example: "Here's your change.", illustration: "💱" },
    { word: "Total",     phonetic: "/ˈtoʊtl/",  meaning: "Tổng cộng",       example: "The total is $25.", illustration: "🧮" },
    { word: "Currency",  phonetic: "/ˈkʌrənsi/", meaning: "Tiền tệ",        example: "The local currency is VND.", illustration: "💱" },
  ],
  grammar: [
    {
      title: "Hỏi giá",
      explanation: "How much + is/are + N? hoặc How much does/do + S + cost?",
      examples: [
        { en: "How much is this shirt?",        vi: "Áo này giá bao nhiêu?" },
        { en: "How much are these shoes?",      vi: "Đôi giày này giá bao nhiêu?" },
        { en: "How much does it cost?",         vi: "Cái này giá bao nhiêu?" },
      ]
    },
    {
      title: "Trả lời giá & đọc số tiền",
      explanation: "It's + giá. Đô-la đọc \"dollars\", lẻ đọc \"cents\". $25.50 = twenty-five dollars (and) fifty cents — hoặc nói tắt \"twenty-five fifty\".",
      examples: [
        { en: "It's $5.",                       vi: "5 đô" },
        { en: "It's twenty-five dollars fifty.", vi: "25.5 đô" },
        { en: "It costs 100,000 VND.",          vi: "Một trăm nghìn đồng" },
      ]
    },
    {
      title: "Mặc cả & yêu cầu giảm giá",
      explanation: "Khi cảm thấy đắt, lịch sự đề nghị: Can you give me a discount? / Is there a sale? / Can you make it cheaper?",
      examples: [
        { en: "Can you give me a discount?",    vi: "Giảm giá được không?" },
        { en: "It's too expensive.",            vi: "Đắt quá" },
        { en: "I'll take it!",                  vi: "Tôi lấy món này!" },
      ]
    },
  ],
  quiz: [
    { question: "Hỏi giá 1 món:",                  options: ["What much?", "How much is it?", "How many?", "Where is it?"], correct: 1 },
    { question: "\"Cheap\" là trái nghĩa của:",     options: ["small", "expensive", "fast", "old"], correct: 1 },
    { question: "Tiền thối là:",                    options: ["change", "tip", "bill", "discount"], correct: 0 },
    { question: "\"Hoá đơn\" tiếng Anh là:",        options: ["recipe", "receipt", "ticket", "menu"], correct: 1 },
    { question: "Câu hỏi mặc cả:",                   options: ["Make me cheap!", "Can you give me a discount?", "Why so much?", "I no money"], correct: 1 },
    { question: "$10.50 đọc đầy đủ là:",             options: ["ten point five", "ten dollars fifty cents", "ten fifty dollar", "ten and half dollar"], correct: 1 },
  ]
};

export default MONEY_PRICES_LESSON;
