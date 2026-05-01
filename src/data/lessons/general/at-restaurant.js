// Track: general — Ở nhà hàng (At the Restaurant)

export const RESTAURANT_LESSON = {
  id: "at-restaurant",
  title: "Ở nhà hàng",
  description: "Đặt bàn, gọi món, gọi nước, thanh toán — kịch bản hoàn chỉnh",
  level: "beginner",
  icon: "🍽️",
  vocabulary: [
    { word: "Menu",       phonetic: "/ˈmɛnjuː/",  meaning: "Thực đơn",      example: "Can I see the menu?", illustration: "📋" },
    { word: "Order",      phonetic: "/ˈɔːrdər/",  meaning: "Gọi món / đặt", example: "I'd like to order now.", illustration: "📝" },
    { word: "Waiter / Waitress", phonetic: "/ˈweɪtər/", meaning: "Bồi bàn nam/nữ", example: "Excuse me, waiter!", illustration: "🤵" },
    { word: "Reserve",    phonetic: "/rɪˈzɜːrv/", meaning: "Đặt trước",     example: "I'd like to reserve a table.", illustration: "📅" },
    { word: "Table for two", phonetic: "/ˈteɪbl fər tuː/", meaning: "Bàn cho 2 người", example: "A table for two, please.", illustration: "🪑" },
    { word: "Starter / Appetizer", phonetic: "/ˈstɑːrtər/", meaning: "Món khai vị", example: "What's a good starter?", illustration: "🥗" },
    { word: "Main course", phonetic: "/meɪn kɔːrs/", meaning: "Món chính",  example: "I'll have the steak as a main course.", illustration: "🥩" },
    { word: "Dessert",    phonetic: "/dɪˈzɜːrt/",  meaning: "Tráng miệng",   example: "What's for dessert?", illustration: "🍰" },
    { word: "Drink",      phonetic: "/drɪŋk/",    meaning: "Đồ uống",       example: "What would you like to drink?", illustration: "🥤" },
    { word: "Bill / Check", phonetic: "/bɪl/",    meaning: "Hoá đơn",       example: "Can I have the bill, please?", illustration: "🧾" },
    { word: "Tip",        phonetic: "/tɪp/",      meaning: "Tiền boa",       example: "I left a $5 tip.", illustration: "💸" },
    { word: "Spicy",      phonetic: "/ˈspaɪsi/",  meaning: "Cay",            example: "Is it spicy?", illustration: "🌶️" },
    { word: "Vegetarian", phonetic: "/ˌvɛdʒəˈtɛəriən/", meaning: "Ăn chay", example: "Do you have vegetarian dishes?", illustration: "🥦" },
    { word: "Allergic",   phonetic: "/əˈlɜːdʒɪk/", meaning: "Dị ứng",        example: "I'm allergic to nuts.", illustration: "⚠️" },
  ],
  grammar: [
    {
      title: "I'd like vs I want",
      explanation: "I'd like (= I would like) lịch sự hơn rất nhiều I want. Khi gọi món / nói nhu cầu trong dịch vụ, LUÔN dùng I'd like.",
      examples: [
        { en: "I'd like a coffee, please.",      vi: "Cho tôi 1 cà phê" },
        { en: "I'd like to book a table.",       vi: "Tôi muốn đặt bàn" },
        { en: "Could I have the menu?",          vi: "Cho tôi xem menu được không?" },
      ]
    },
    {
      title: "Kịch bản nhà hàng — 5 bước",
      explanation: "1) Vào: \"A table for X, please.\" 2) Xem menu + hỏi: \"What do you recommend?\" 3) Gọi món: \"I'd like the …, please.\" 4) Trong bữa: \"Could I have some water?\" 5) Thanh toán: \"Can I have the bill?\"",
      examples: [
        { en: "What do you recommend?",          vi: "Bạn gợi ý món gì?" },
        { en: "I'll have the chicken, please.",  vi: "Tôi gọi gà" },
        { en: "Could I have some more bread?",   vi: "Cho thêm bánh mì" },
        { en: "The bill, please.",                vi: "Tính tiền" },
      ]
    },
    {
      title: "Lưu ý dị ứng & yêu cầu đặc biệt",
      explanation: "Để an toàn: \"I'm allergic to … (nuts/seafood/dairy)\". Để chỉnh món: \"No onions, please.\" / \"Can I have it without …?\"",
      examples: [
        { en: "I'm allergic to peanuts.",         vi: "Tôi dị ứng đậu phộng" },
        { en: "Can I have it without onions?",    vi: "Cho tôi không hành" },
        { en: "Not too spicy, please.",           vi: "Đừng cay quá" },
      ]
    },
  ],
  quiz: [
    { question: "Cách lịch sự gọi món:",                       options: ["I want…", "I'd like…", "Give me…", "Bring…"], correct: 1 },
    { question: "Hỏi xin thực đơn:",                            options: ["Where menu?", "Can I see the menu?", "Menu now!", "What is menu?"], correct: 1 },
    { question: "\"Tính tiền\" trong nhà hàng:",                options: ["Pay now", "The bill, please", "Money please", "Total!"], correct: 1 },
    { question: "\"Vegetarian\" có nghĩa:",                     options: ["Cay", "Ăn chay", "Ngọt", "Nóng"], correct: 1 },
    { question: "Để báo dị ứng đậu phộng:",                     options: ["I love peanuts", "I'm allergic to peanuts", "No peanut me", "Peanut bad"], correct: 1 },
    { question: "Món tráng miệng tiếng Anh là:",                options: ["Starter", "Main course", "Dessert", "Side"], correct: 2 },
    { question: "\"A table for two\" nghĩa là:",                options: ["Bàn 2 ghế", "Bàn cho 2 người", "Bàn số 2", "Bàn nhỏ"], correct: 1 },
  ]
};

export default RESTAURANT_LESSON;
