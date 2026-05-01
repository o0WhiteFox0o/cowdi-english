// Track: general — Phụ âm khó với người Việt (R, L, V, W, F, P, B)

export const PRONUNCIATION_TRICKY_LESSON = {
  id: "pronunciation-tricky",
  title: "Phụ âm khó: R, L, V, W, F, P",
  description: "Khắc phục các lỗi phát âm kinh điển của người Việt nói tiếng Anh",
  level: "beginner",
  icon: "🎯",
  vocabulary: [
    { word: "Rice",   phonetic: "/raɪs/",  meaning: "Gạo / cơm (R /r/)",     example: "I eat rice every day.", illustration: "🍚" },
    { word: "Lice",   phonetic: "/laɪs/",  meaning: "Chấy (L /l/)",          example: "Lice live in hair.", illustration: "🦠" },
    { word: "Right",  phonetic: "/raɪt/",  meaning: "Đúng / phải",           example: "You are right.", illustration: "✅" },
    { word: "Light",  phonetic: "/laɪt/",  meaning: "Ánh sáng",              example: "Turn on the light.", illustration: "💡" },
    { word: "Very",   phonetic: "/ˈvɛri/", meaning: "Rất (V /v/)",           example: "It is very hot.", illustration: "🔥" },
    { word: "Berry",  phonetic: "/ˈbɛri/", meaning: "Quả mọng (B /b/)",      example: "I love strawberry.", illustration: "🍓" },
    { word: "Wet",    phonetic: "/wɛt/",   meaning: "Ướt (W /w/)",           example: "The floor is wet.", illustration: "💧" },
    { word: "Vet",    phonetic: "/vɛt/",   meaning: "Bác sĩ thú y",          example: "Take the dog to the vet.", illustration: "🐶" },
    { word: "Fan",    phonetic: "/fæn/",   meaning: "Quạt (F /f/)",          example: "Turn on the fan.", illustration: "🌀" },
    { word: "Pan",    phonetic: "/pæn/",   meaning: "Cái chảo (P /p/)",      example: "Cook in the pan.", illustration: "🍳" },
    { word: "Pet",    phonetic: "/pɛt/",   meaning: "Thú cưng",              example: "I have a pet.", illustration: "🐾" },
    { word: "Bet",    phonetic: "/bɛt/",   meaning: "Cá cược (B /b/)",       example: "Don't bet on it.", illustration: "🎲" },
    { word: "World",  phonetic: "/wɜːrld/", meaning: "Thế giới",             example: "Hello, world!", illustration: "🌍" },
    { word: "Love",   phonetic: "/lʌv/",   meaning: "Tình yêu",              example: "I love you.", illustration: "❤️" },
  ],
  grammar: [
    {
      title: "Phân biệt R và L",
      explanation: "R: cong LƯỠI lên trên (không chạm vòm miệng), môi hơi tròn. L: ĐẶT đầu lưỡi vào lợi sau răng cửa trên. Việt rất hay đọc R thành L hoặc R-rung kiểu tiếng Việt.",
      examples: [
        { en: "rice ≠ lice", vi: "gạo ≠ chấy" },
        { en: "right ≠ light", vi: "đúng ≠ ánh sáng" },
        { en: "red ≠ led",     vi: "đỏ ≠ dẫn dắt" },
      ]
    },
    {
      title: "V và B / W",
      explanation: "V /v/: cắn nhẹ MÔI DƯỚI vào RĂNG TRÊN, đẩy hơi rung. B /b/: hai môi mím chặt rồi bật. W /w/: chu môi TRÒN, không cắn.",
      examples: [
        { en: "very ≠ berry", vi: "rất ≠ quả mọng (V cắn môi)" },
        { en: "vet ≠ wet",    vi: "thú y ≠ ướt (V cắn, W chu)" },
        { en: "vest ≠ best",  vi: "áo ghi-lê ≠ tốt nhất" },
      ]
    },
    {
      title: "F vs P (rất hay nhầm)",
      explanation: "F /f/: tương tự V nhưng KHÔNG rung dây thanh. P /p/: hai môi mím rồi BẬT mạnh kèm hơi (đặt giấy mỏng trước miệng phải bay).",
      examples: [
        { en: "fan ≠ pan", vi: "quạt ≠ chảo" },
        { en: "fool ≠ pool", vi: "kẻ ngốc ≠ hồ bơi" },
        { en: "fast ≠ past", vi: "nhanh ≠ quá khứ" },
      ]
    },
    {
      title: "Phụ âm cuối — đừng bỏ!",
      explanation: "Người Việt rất hay nuốt âm cuối: \"book\" thành \"bóc\", \"good\" thành \"gút\". Phải bật rõ /k/, /d/, /t/, /s/ ở cuối từ — dù chỉ là hơi nhẹ.",
      examples: [
        { en: "book → /bʊk/  (bật /k/)",  vi: "Không phải \"bóc\"" },
        { en: "good → /ɡʊd/  (bật /d/)",  vi: "Không phải \"gút\"" },
        { en: "cats → /kæts/ (bật /ts/)", vi: "Không phải \"két\"" },
      ]
    },
  ],
  quiz: [
    { question: "Để phát âm /r/ tiếng Anh chuẩn, lưỡi phải:",   options: ["Rung như tiếng Việt", "Cong lên không chạm vòm", "Chạm vào lợi", "Thè ra giữa răng"], correct: 1 },
    { question: "Cặp từ nào CHỈ khác nhau ở R và L?",            options: ["right/light", "rich/lick", "rip/lip", "Tất cả đều đúng"], correct: 3 },
    { question: "Phát âm /v/ khác /b/ vì:",                      options: ["V cắn môi", "B cắn môi", "Giống nhau", "V tròn môi"], correct: 0 },
    { question: "Để bật âm /p/ chuẩn, hai môi phải:",            options: ["Hé nhẹ", "Mím chặt rồi bật mạnh", "Chu tròn", "Cắn răng"], correct: 1 },
    { question: "Lỗi phổ biến nhất với phụ âm cuối là:",         options: ["Đọc quá to", "Bỏ luôn", "Đổi vị trí", "Thay bằng phụ âm khác"], correct: 1 },
    { question: "Từ \"world\" có mấy phụ âm phát ra ở cuối?",   options: ["1", "2", "3", "0"], correct: 2 },
    { question: "\"vet\" và \"wet\" khác nhau ở:",               options: ["Nguyên âm", "Cách đặt môi (cắn vs chu)", "Trọng âm", "Số âm tiết"], correct: 1 },
  ]
};

export default PRONUNCIATION_TRICKY_LESSON;
