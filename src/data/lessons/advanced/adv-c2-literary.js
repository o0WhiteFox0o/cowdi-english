// Track: advanced — C2 Literary & Rhetorical Devices

export const ADV_C2_LITERARY_LESSON = {
  id: "adv-c2-literary",
  title: "C2 Literary & Rhetorical Devices",
  description: "Các biện pháp tu từ và phong cách văn chương của người bản ngữ thành thạo",
  level: "advanced",
  icon: "📖",
  cefrLevel: "C2",
  vstepLevel: "C1",
  vocabulary: [
    { word: "Metaphor",       phonetic: "/ˈmetəfə/",        meaning: "Ẩn dụ",                   example: "'Time is a thief' is a famous metaphor.",           illustration: "🎨" },
    { word: "Simile",         phonetic: "/ˈsɪməli/",        meaning: "So sánh tu từ",           example: "'As brave as a lion' is a simile.",                  illustration: "🦁" },
    { word: "Irony",          phonetic: "/ˈaɪrəni/",        meaning: "Mỉa mai",                 example: "The irony is that the critic became the author.",    illustration: "🎭" },
    { word: "Hyperbole",      phonetic: "/haɪˈpɜːbəli/",    meaning: "Phóng đại",               example: "'I've told you a million times' is hyperbole.",      illustration: "💥" },
    { word: "Alliteration",   phonetic: "/əˌlɪtəˈreɪʃn/",   meaning: "Điệp phụ âm đầu",         example: "'Silent sea' uses alliteration.",                    illustration: "🔤" },
    { word: "Personify",      phonetic: "/pəˈsɒnɪfaɪ/",     meaning: "Nhân hoá",                example: "The poem personifies the wind as a wanderer.",       illustration: "🌬️" },
    { word: "Juxtapose",      phonetic: "/ˌdʒʌkstəˈpəʊz/",  meaning: "Đặt cạnh nhau đối chiếu", example: "The author juxtaposes war and childhood.",           illustration: "⚖️" },
    { word: "Allusion",       phonetic: "/əˈluːʒn/",        meaning: "Ám chỉ (điển tích)",      example: "The title is an allusion to Homer's Odyssey.",       illustration: "📚" },
    { word: "Motif",          phonetic: "/məʊˈtiːf/",       meaning: "Mô-típ lặp lại",          example: "Water is a recurring motif in the novel.",           illustration: "🔁" },
    { word: "Connotation",    phonetic: "/ˌkɒnəˈteɪʃn/",    meaning: "Nghĩa hàm ẩn",            example: "The word 'home' has warm connotations.",             illustration: "💭" },
    { word: "Euphemism",      phonetic: "/ˈjuːfəmɪzəm/",    meaning: "Uyển ngữ",                example: "'Passed away' is a euphemism for 'died'.",           illustration: "🕊️" },
    { word: "Oxymoron",       phonetic: "/ˌɒksɪˈmɔːrɒn/",   meaning: "Nghịch hợp (2 từ trái nghĩa)", example: "'Bittersweet' and 'deafening silence' are oxymorons.", illustration: "☯️" },
  ],
  grammar: [
    {
      title: "Parallelism — cấu trúc song song",
      explanation: "Lặp cùng kiểu ngữ pháp ở nhiều mệnh đề/vế → tạo nhịp điệu hùng biện, dễ nhớ.",
      examples: [
        { en: "We came, we saw, we conquered.",                        vi: "Ta đến, ta thấy, ta chinh phục." },
        { en: "Reading widely, thinking deeply, writing clearly.",      vi: "Đọc rộng, nghĩ sâu, viết rõ." },
        { en: "Not by force, but by reason; not by fear, but by hope.", vi: "Không bằng sức ép mà bằng lý trí; không bằng nỗi sợ mà bằng hy vọng." },
      ],
    },
    {
      title: "Understatement vs Hyperbole",
      explanation: "Understatement = nói giảm (it wasn't half bad); Hyperbole = nói quá. Dùng để tạo hiệu ứng châm biếm / nhấn mạnh.",
      examples: [
        { en: "It's just a scratch. (vết thương sâu) — understatement", vi: "Chỉ là vết xước nhỏ thôi." },
        { en: "I'm starving to death! — hyperbole",                       vi: "Tôi đói chết mất!" },
        { en: "This book is a bit long. (1200 trang) — understatement",   vi: "Cuốn sách này hơi dày một chút." },
      ],
    },
  ],
  quiz: [
    { question: "\"Time is a thief\" là ví dụ của:",                       options: ["Simile", "Metaphor", "Hyperbole", "Alliteration"],    correct: 1 },
    { question: "\"As brave as a lion\" là:",                              options: ["Metaphor", "Simile", "Irony", "Motif"],                correct: 1 },
    { question: "\"Bittersweet\" là kiểu:",                                options: ["Allusion", "Oxymoron", "Euphemism", "Motif"],           correct: 1 },
    { question: "\"Passed away\" là:",                                      options: ["Hyperbole", "Euphemism", "Allusion", "Simile"],          correct: 1 },
    { question: "\"We came, we saw, we conquered\" dùng kỹ thuật:",         options: ["Alliteration", "Parallelism", "Hyperbole", "Motif"],   correct: 1 },
    { question: "\"I'm starving to death!\" là:",                           options: ["Understatement", "Hyperbole", "Metaphor", "Irony"],     correct: 1 },
    { question: "\"The title is an allusion to Homer's Odyssey\" nghĩa là:", options: ["Trích nguyên văn", "Ám chỉ tới tác phẩm khác", "Dịch Odyssey", "Chỉ trích Homer"], correct: 1 },
  ],
};

export default ADV_C2_LITERARY_LESSON;
