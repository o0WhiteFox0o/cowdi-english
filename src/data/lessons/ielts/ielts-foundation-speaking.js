// Track: ielts — IELTS Foundation Speaking Part 1 (Band 3.0 – 4.0)

export const IELTS_FOUNDATION_SPEAKING_LESSON = {
  id: "ielts-foundation-speaking",
  title: "IELTS Foundation Speaking",
  description: "Trả lời ngắn các câu hỏi Part 1: bản thân, gia đình, sở thích",
  level: "beginner",
  icon: "🗣️",
  examTag: "ielts",
  ieltsBand: "3.0-4.0",
  vocabulary: [
    { word: "Hometown",   phonetic: "/ˈhəʊmtaʊn/",   meaning: "Quê hương",      example: "My hometown is a small town.",                   illustration: "🏡" },
    { word: "Neighbour",  phonetic: "/ˈneɪbər/",     meaning: "Hàng xóm",       example: "My neighbour is very kind.",                     illustration: "👋" },
    { word: "Enjoy",      phonetic: "/ɪnˈdʒɔɪ/",     meaning: "Thích làm gì",   example: "I enjoy listening to music.",                    illustration: "🎧" },
    { word: "Prefer",     phonetic: "/prɪˈfɜːr/",    meaning: "Thích hơn",      example: "I prefer tea to coffee.",                        illustration: "🍵" },
    { word: "Usually",    phonetic: "/ˈjuːʒuəli/",   meaning: "Thường xuyên",   example: "I usually wake up at 6.",                        illustration: "🕕" },
    { word: "Weekend",    phonetic: "/ˈwiːkend/",    meaning: "Cuối tuần",      example: "On weekends I meet my friends.",                 illustration: "🎉" },
    { word: "Relax",      phonetic: "/rɪˈlæks/",     meaning: "Thư giãn",       example: "I relax by watching films.",                     illustration: "🛋️" },
    { word: "Childhood",  phonetic: "/ˈtʃaɪldhʊd/",  meaning: "Tuổi thơ",       example: "My childhood was happy.",                        illustration: "🧒" },
    { word: "Memory",     phonetic: "/ˈmeməri/",     meaning: "Kỷ niệm",        example: "I have a happy memory of that summer.",         illustration: "🧠" },
    { word: "Favourite",  phonetic: "/ˈfeɪvərɪt/",   meaning: "Yêu thích nhất", example: "My favourite colour is blue.",                   illustration: "⭐" },
  ],
  grammar: [
    {
      title: "Cấu trúc trả lời đơn giản (Answer + Reason)",
      explanation: "Công thức: \"Yes/No + vì sao\". Dùng because, so, and để mở rộng câu.",
      examples: [
        { en: "Yes, I enjoy reading because it is relaxing.", vi: "Có, tôi thích đọc sách vì nó thư giãn." },
        { en: "No, I don't like coffee because it is too bitter.", vi: "Không, tôi không thích cà phê vì nó quá đắng." },
        { en: "I like my hometown, and the people are friendly.",  vi: "Tôi thích quê mình, và người dân rất thân thiện." },
      ],
    },
    {
      title: "Trạng từ tần suất (frequency adverbs)",
      explanation: "always / usually / often / sometimes / rarely / never — đứng trước động từ thường.",
      examples: [
        { en: "I usually go jogging in the morning.",   vi: "Tôi thường đi chạy buổi sáng." },
        { en: "She rarely eats fast food.",             vi: "Cô ấy hiếm khi ăn đồ ăn nhanh." },
        { en: "We sometimes visit our grandparents.",   vi: "Chúng tôi thỉnh thoảng về thăm ông bà." },
      ],
    },
  ],
  quiz: [
    { question: "\"Hometown\" nghĩa là:",                           options: ["Nhà mới", "Quê hương", "Thành phố lớn", "Nhà ông bà"],        correct: 1 },
    { question: "\"I ___ listening to music.\" (thích)",             options: ["prefer", "enjoy", "relax", "usually"],                     correct: 1 },
    { question: "Trạng từ tần suất đặt ở đâu?",                      options: ["Cuối câu", "Đầu câu", "Trước động từ thường", "Sau tân ngữ"], correct: 2 },
    { question: "Chọn câu đúng:",                                    options: ["I go usually to school.", "I usually go to school.", "Usually I go school.", "I go to school usually."], correct: 1 },
    { question: "\"Favourite\" nghĩa là:",                           options: ["Buồn cười", "Đẹp nhất", "Yêu thích nhất", "Gần gũi"],       correct: 2 },
  ],
};

export default IELTS_FOUNDATION_SPEAKING_LESSON;
