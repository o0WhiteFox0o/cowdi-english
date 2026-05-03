// Track: ielts — IELTS Foundation Pronunciation (Band 3.0 – 4.0)

export const IELTS_FOUNDATION_PRONUNCIATION_LESSON = {
  id: "ielts-foundation-pronunciation",
  title: "IELTS Foundation Pronunciation",
  description: "Phát âm chuẩn — âm cuối, trọng âm, intonation cơ bản",
  level: "beginner",
  icon: "🗣️",
  examTag: "ielts",
  ieltsBand: "3.0-4.0",
  vocabulary: [
    { word: "Stress",      phonetic: "/stres/",         meaning: "Trọng âm",        example: "Put stress on the second syllable.",        illustration: "🔊" },
    { word: "Syllable",    phonetic: "/ˈsɪləbl/",       meaning: "Âm tiết",         example: "\"Banana\" has three syllables.",           illustration: "🎵" },
    { word: "Vowel",       phonetic: "/ˈvaʊəl/",        meaning: "Nguyên âm",       example: "A, E, I, O, U are vowels.",                 illustration: "🅰️" },
    { word: "Consonant",   phonetic: "/ˈkɒnsənənt/",    meaning: "Phụ âm",          example: "B, C, D are consonants.",                   illustration: "🅱️" },
    { word: "Sound",       phonetic: "/saʊnd/",         meaning: "Âm",              example: "The /θ/ sound is difficult for me.",        illustration: "🔉" },
    { word: "Ending",      phonetic: "/ˈendɪŋ/",        meaning: "Âm cuối",         example: "Don't forget the -s ending.",               illustration: "🔚" },
    { word: "Silent",      phonetic: "/ˈsaɪlənt/",      meaning: "Âm câm",          example: "The \"k\" in \"knife\" is silent.",         illustration: "🤫" },
    { word: "Linking",     phonetic: "/ˈlɪŋkɪŋ/",       meaning: "Nối âm",          example: "Use linking sounds in fluent speech.",      illustration: "🔗" },
    { word: "Rhythm",      phonetic: "/ˈrɪðəm/",        meaning: "Nhịp",            example: "English has a strong rhythm pattern.",      illustration: "🥁" },
    { word: "Intonation",  phonetic: "/ˌɪntəˈneɪʃn/",   meaning: "Ngữ điệu",        example: "Rising intonation shows a question.",       illustration: "🎶" },
    { word: "Practice",    phonetic: "/ˈpræktɪs/",      meaning: "Luyện tập",       example: "I practice speaking every morning.",        illustration: "💪" },
    { word: "Repeat",      phonetic: "/rɪˈpiːt/",       meaning: "Lặp lại",         example: "Listen and repeat after the audio.",        illustration: "🔁" },
  ],
  grammar: [
    {
      title: "Âm cuối -s và -ed",
      explanation: "-s đọc /s/ (sau âm vô thanh: books), /z/ (sau âm hữu thanh: bags), /ɪz/ (sau âm xuýt: buses). -ed đọc /t/ (worked), /d/ (played), /ɪd/ (wanted, needed).",
      examples: [
        { en: "Books, cats, maps → /s/.",          vi: "Books, cats, maps đọc /s/." },
        { en: "Played, lived, opened → /d/.",      vi: "Played, lived, opened đọc /d/." },
        { en: "Wanted, needed, decided → /ɪd/.",   vi: "Wanted, needed, decided đọc /ɪd/." },
      ],
    },
    {
      title: "Trọng âm trong từ 2 âm tiết",
      explanation: "Hầu hết danh từ/tính từ 2 âm tiết: trọng âm rơi vào âm tiết 1 (TAble, HAPPY). Hầu hết động từ 2 âm tiết: trọng âm rơi vào âm tiết 2 (deCIDE, beGIN).",
      examples: [
        { en: "TAble, MUsic, HAPpy (noun/adj — stress 1).",  vi: "Danh từ/tính từ — trọng âm 1." },
        { en: "deCIDE, agREE, beGIN (verb — stress 2).",      vi: "Động từ — trọng âm 2." },
        { en: "REcord (noun) vs reCORD (verb).",              vi: "Cùng từ, khác trọng âm — khác từ loại." },
      ],
    },
  ],
  quiz: [
    { question: "Số âm tiết trong từ \"banana\":",                        options: ["1", "2", "3", "4"],                                                correct: 2 },
    { question: "Đuôi -ed trong \"wanted\" đọc là:",                       options: ["/t/", "/d/", "/ɪd/", "/s/"],                                       correct: 2 },
    { question: "Trọng âm của \"happy\" rơi vào:",                         options: ["Âm tiết 1", "Âm tiết 2", "Cả hai", "Không có trọng âm"],           correct: 0 },
    { question: "\"Knife\" — chữ nào câm?",                                options: ["k", "n", "i", "f"],                                                 correct: 0 },
    { question: "Đuôi -s trong \"books\" đọc là:",                         options: ["/s/", "/z/", "/ɪz/", "/d/"],                                       correct: 0 },
    { question: "Câu hỏi Yes/No thường có ngữ điệu:",                       options: ["Đi xuống ↓", "Đi lên ↑", "Bằng phẳng", "Không quan trọng"],         correct: 1 },
  ],
};

export default IELTS_FOUNDATION_PRONUNCIATION_LESSON;
