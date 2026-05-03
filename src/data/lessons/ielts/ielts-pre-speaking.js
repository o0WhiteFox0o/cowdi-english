// Track: ielts — IELTS Pre-Intermediate Speaking (Band 4.5 – 5.5)

export const IELTS_PRE_SPEAKING_LESSON = {
  id: "ielts-pre-speaking",
  title: "IELTS Pre-Intermediate Speaking",
  description: "Speaking Part 1: trả lời câu hỏi cá nhân — work, study, hometown",
  level: "intermediate",
  icon: "🎤",
  examTag: "ielts",
  ieltsBand: "4.5-5.5",
  vocabulary: [
    { word: "Hometown",    phonetic: "/ˈhəʊmtaʊn/",     meaning: "Quê hương",       example: "My hometown is a small city.",            illustration: "🏘️" },
    { word: "Suburb",      phonetic: "/ˈsʌbɜːb/",       meaning: "Ngoại ô",         example: "I live in a quiet suburb.",               illustration: "🏡" },
    { word: "Workplace",   phonetic: "/ˈwɜːkpleɪs/",    meaning: "Nơi làm việc",     example: "My workplace is near the river.",         illustration: "🏢" },
    { word: "Subject",     phonetic: "/ˈsʌbdʒɪkt/",     meaning: "Môn học",         example: "My favourite subject is maths.",          illustration: "📚" },
    { word: "Major",       phonetic: "/ˈmeɪdʒə/",       meaning: "Chuyên ngành",    example: "My major is business.",                   illustration: "🎓" },
    { word: "Free time",   phonetic: "/friː taɪm/",     meaning: "Thời gian rảnh",   example: "In my free time, I watch films.",         illustration: "⏳" },
    { word: "Relax",       phonetic: "/rɪˈlæks/",       meaning: "Thư giãn",         example: "I relax by listening to music.",          illustration: "🛋️" },
    { word: "Prefer",      phonetic: "/prɪˈfɜː/",       meaning: "Thích hơn",        example: "I prefer tea to coffee.",                 illustration: "☕" },
    { word: "Enjoy",       phonetic: "/ɪnˈdʒɔɪ/",       meaning: "Thưởng thức",      example: "I enjoy travelling abroad.",              illustration: "😊" },
    { word: "Childhood",   phonetic: "/ˈtʃaɪldhʊd/",    meaning: "Tuổi thơ",         example: "I had a happy childhood.",                illustration: "🧒" },
    { word: "Atmosphere",  phonetic: "/ˈætməsfɪə/",     meaning: "Không khí",        example: "The atmosphere in this café is cosy.",   illustration: "🕯️" },
    { word: "Convenient",  phonetic: "/kənˈviːniənt/",  meaning: "Tiện lợi",         example: "Living near the bus stop is convenient.", illustration: "🚏" },
  ],
  grammar: [
    {
      title: "Mở rộng câu trả lời với \"because / which / when\"",
      explanation: "Đừng trả lời \"Yes\" hoặc \"No\" thôi — thêm 1–2 câu giải thích bằng \"because\", mệnh đề quan hệ, hoặc trạng ngữ thời gian.",
      examples: [
        { en: "Yes, I love my hometown because it has friendly people and beautiful beaches.", vi: "Có, tôi yêu quê vì có người dân thân thiện và bãi biển đẹp." },
        { en: "I prefer reading, which helps me relax after work.",                              vi: "Tôi thích đọc sách, điều giúp tôi thư giãn sau giờ làm." },
        { en: "When I was young, I used to play football every day.",                            vi: "Khi còn nhỏ, tôi hay chơi bóng đá mỗi ngày." },
      ],
    },
    {
      title: "Used to + V — nói về thói quen đã qua",
      explanation: "Dùng để mô tả điều thường xảy ra trong quá khứ nhưng giờ không còn nữa.",
      examples: [
        { en: "I used to live in a village.",                  vi: "Tôi từng sống ở một ngôi làng." },
        { en: "She used to play the piano when she was 10.",   vi: "Cô ấy từng chơi piano khi 10 tuổi." },
        { en: "We used to go camping every summer.",           vi: "Chúng tôi từng cắm trại mỗi mùa hè." },
      ],
    },
  ],
  quiz: [
    { question: "Cách trả lời tốt nhất cho \"Do you like your hometown?\"",     options: ["Yes.", "No.", "Yes, because it has friendly people and beautiful beaches.", "Maybe."], correct: 2 },
    { question: "\"Suburb\" nghĩa là:",                                          options: ["Trung tâm thành phố", "Ngoại ô", "Nông thôn", "Bãi biển"],                                correct: 1 },
    { question: "\"Used to play\" diễn tả:",                                     options: ["Hành động bây giờ", "Thói quen trong quá khứ", "Tương lai", "Mệnh lệnh"],                  correct: 1 },
    { question: "\"In my free time, I ___\":",                                    options: ["am watch", "watching", "watch", "watched"],                                              correct: 2 },
    { question: "\"Convenient\" gần nghĩa với:",                                  options: ["Đắt đỏ", "Tiện lợi", "Khó khăn", "Yên tĩnh"],                                            correct: 1 },
    { question: "Chiến lược cho Speaking Part 1:",                                options: ["Trả lời thật ngắn", "Mở rộng 2–3 câu với lý do và ví dụ", "Học thuộc câu mẫu", "Im lặng"], correct: 1 },
  ],
};

export default IELTS_PRE_SPEAKING_LESSON;
