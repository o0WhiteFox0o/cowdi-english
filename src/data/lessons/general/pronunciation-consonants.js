// Track: general — Phát âm phụ âm (Consonant Sounds: TH / SH / CH)

export const PRONUNCIATION_CONSONANTS_LESSON = {
  id: "pronunciation-consonants",
  title: "Phát âm phụ âm cơ bản",
  description: "Phân biệt 3 cụm phụ âm khó nhất với người Việt: TH, SH và CH",
  level: "beginner",
  icon: "👄",
  vocabulary: [
    { word: "Think", phonetic: "/θɪŋk/",  meaning: "Suy nghĩ (TH /θ/ vô thanh)", example: "I think you are right.", illustration: "🤔" },
    { word: "This",  phonetic: "/ðɪs/",   meaning: "Cái này (TH /ð/ hữu thanh)", example: "This is my book.", illustration: "👇" },
    { word: "Three", phonetic: "/θriː/",  meaning: "Số ba",                       example: "I have three pens.", illustration: "3️⃣" },
    { word: "That",  phonetic: "/ðæt/",   meaning: "Cái đó",                      example: "That is a cat.", illustration: "👉" },
    { word: "Thank", phonetic: "/θæŋk/",  meaning: "Cảm ơn",                      example: "Thank you so much.", illustration: "🙏" },
    { word: "Mother", phonetic: "/ˈmʌðər/", meaning: "Mẹ",                        example: "My mother is kind.", illustration: "👩" },
    { word: "Ship",  phonetic: "/ʃɪp/",   meaning: "Tàu (SH /ʃ/)",                example: "The ship is big.", illustration: "🚢" },
    { word: "Shop",  phonetic: "/ʃɒp/",   meaning: "Cửa hàng",                    example: "Let's go to the shop.", illustration: "🏪" },
    { word: "Fish",  phonetic: "/fɪʃ/",   meaning: "Cá",                          example: "I like to eat fish.", illustration: "🐟" },
    { word: "Chair", phonetic: "/tʃɛər/", meaning: "Ghế (CH /tʃ/)",               example: "Sit on the chair.", illustration: "🪑" },
    { word: "Cheese",phonetic: "/tʃiːz/", meaning: "Phô mai",                     example: "I love cheese.", illustration: "🧀" },
    { word: "Watch", phonetic: "/wɒtʃ/",  meaning: "Đồng hồ / xem",               example: "I watch TV at night.", illustration: "📺" },
  ],
  grammar: [
    {
      title: "Âm TH có 2 dạng",
      explanation: "TH /θ/ vô thanh (think, three, thank) — đặt LƯỠI giữa 2 hàm răng và đẩy hơi RA, không rung dây thanh. TH /ð/ hữu thanh (this, that, mother) — cùng khẩu hình nhưng RUNG dây thanh.",
      examples: [
        { en: "Vô thanh /θ/: thin, thick, three, mouth", vi: "Đẩy hơi, không rung họng" },
        { en: "Hữu thanh /ð/: this, that, then, them",   vi: "Đặt tay vào cổ thấy rung" },
      ]
    },
    {
      title: "Âm SH /ʃ/ vs CH /tʃ/",
      explanation: "SH = chu môi tròn, đẩy hơi LIÊN TỤC như khi suỵt. CH = giống SH nhưng có thêm âm /t/ NGẮT ở đầu (như tiếng \"ch\" Việt nhưng mạnh hơn).",
      examples: [
        { en: "SH: she, ship, fish, wash",   vi: "Hơi liên tục, kéo dài" },
        { en: "CH: chip, cheese, watch, much", vi: "Có chặn ngắn ở đầu" },
      ]
    },
    {
      title: "Lỗi thường gặp của người Việt",
      explanation: "1) Đọc TH thành \"th\" nhẹ kiểu Việt → thành /t/ hoặc /s/. 2) Đọc SH thành /s/. 3) Đọc CH thành \"ch\" Việt nhẹ → thiếu hơi.",
      examples: [
        { en: "❌ \"sink\" thay vì \"think\"",  vi: "Phải đặt lưỡi giữa răng" },
        { en: "❌ \"sip\" thay vì \"ship\"",    vi: "Phải chu môi tròn" },
        { en: "❌ \"cheap\" thay vì \"sheep\"", vi: "SH liên tục, không có /t/" },
      ]
    },
  ],
  quiz: [
    { question: "Âm /θ/ (think) khác /ð/ (this) ở:",  options: ["Vị trí lưỡi", "Rung dây thanh", "Số chữ cái", "Trọng âm"], correct: 1 },
    { question: "Từ nào có TH hữu thanh /ð/?",         options: ["think", "thank", "thin", "mother"], correct: 3 },
    { question: "SH /ʃ/ và CH /tʃ/ khác nhau vì:",     options: ["SH có /t/ chặn đầu", "CH có /t/ chặn đầu", "Cả hai giống nhau", "SH dài hơn"], correct: 1 },
    { question: "Từ \"ship\" thường bị đọc nhầm thành:", options: ["sheep", "sip", "chip", "tip"], correct: 1 },
    { question: "Khi phát âm TH, lưỡi phải:",           options: ["Cong lên vòm miệng", "Đặt giữa 2 hàm răng", "Đụng môi dưới", "Đặt sát răng cửa"], correct: 1 },
    { question: "Từ nào KHÔNG có âm CH /tʃ/?",         options: ["chair", "watch", "cheese", "ship"], correct: 3 },
  ]
};

export default PRONUNCIATION_CONSONANTS_LESSON;
