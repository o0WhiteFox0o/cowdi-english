// Track: general — Trọng âm & ngữ điệu (Stress & Intonation)

export const PRONUNCIATION_STRESS_LESSON = {
  id: "pronunciation-stress",
  title: "Trọng âm & ngữ điệu",
  description: "Đặt trọng âm đúng và lên-xuống giọng tự nhiên như người bản xứ",
  level: "beginner",
  icon: "📈",
  vocabulary: [
    { word: "Present (n)", phonetic: "/ˈprɛzənt/", meaning: "Món quà (TA đầu)",      example: "I got a birthday present.", illustration: "🎁" },
    { word: "Present (v)", phonetic: "/prɪˈzɛnt/", meaning: "Trình bày (TA cuối)",   example: "I will present the plan.", illustration: "📊" },
    { word: "Record (n)",  phonetic: "/ˈrɛkərd/",  meaning: "Bản ghi (TA đầu)",      example: "She broke the record.", illustration: "🏆" },
    { word: "Record (v)",  phonetic: "/rɪˈkɔːrd/", meaning: "Ghi âm (TA cuối)",      example: "They will record the song.", illustration: "🎙️" },
    { word: "Stress",      phonetic: "/strɛs/",    meaning: "Trọng âm / căng thẳng", example: "Word stress is important.", illustration: "💢" },
    { word: "Syllable",    phonetic: "/ˈsɪləbəl/", meaning: "Âm tiết",               example: "\"Banana\" has 3 syllables.", illustration: "🔢" },
    { word: "Rise",        phonetic: "/raɪz/",     meaning: "Lên giọng",             example: "Your voice should rise.", illustration: "📈" },
    { word: "Fall",        phonetic: "/fɔːl/",     meaning: "Xuống giọng",           example: "Let your voice fall.", illustration: "📉" },
    { word: "Rhythm",      phonetic: "/ˈrɪðəm/",   meaning: "Nhịp điệu",             example: "English has a clear rhythm.", illustration: "🎵" },
    { word: "Pause",       phonetic: "/pɔːz/",     meaning: "Ngừng",                 example: "Pause between phrases.", illustration: "⏸️" },
    { word: "Loud",        phonetic: "/laʊd/",     meaning: "To",                    example: "Stress = louder + longer.", illustration: "🔊" },
    { word: "Schwa",       phonetic: "/ʃwɑː/",     meaning: "Âm /ə/ — nguyên âm yếu", example: "About has a schwa: /əˈbaʊt/.", illustration: "💤" },
  ],
  grammar: [
    {
      title: "Trọng âm = TO + DÀI + RÕ",
      explanation: "Âm tiết được nhấn sẽ phát âm TO hơn, DÀI hơn và rõ hơn. Các âm khác đọc lướt — đó là lý do người mới khó nghe người bản xứ.",
      examples: [
        { en: "BAnana → buh-NA-nuh",       vi: "Trọng âm rơi vào âm thứ 2" },
        { en: "comPUter → com-PYU-tər",    vi: "Trọng âm vào PYU" },
        { en: "INternet → IN-tər-net",     vi: "Trọng âm vào IN" },
      ]
    },
    {
      title: "Quy tắc dễ nhớ",
      explanation: "1) Danh từ 2 âm tiết → thường nhấn âm ĐẦU (TAble, MOther). 2) Động từ 2 âm tiết → thường nhấn âm CUỐI (deCIDE, beGIN). 3) Tính từ thì-V-tính từ -tion/-sion/-ic → trọng âm ngay TRƯỚC đuôi (eduCAtion, fanTAStic).",
      examples: [
        { en: "Noun: TAble, MOther, DOctor",         vi: "Nhấn âm 1" },
        { en: "Verb: deCIDE, foLLOW, beGIN",         vi: "Nhấn âm 2" },
        { en: "-tion: eduCAtion, infomAtion",        vi: "Nhấn ngay trước -tion" },
      ]
    },
    {
      title: "Ngữ điệu cơ bản",
      explanation: "Câu hỏi YES/NO → giọng LÊN ở cuối. Câu hỏi WH (what, where…) → giọng XUỐNG ở cuối. Câu trần thuật → giọng XUỐNG. Liệt kê → lên ở từng mục, xuống ở mục cuối.",
      examples: [
        { en: "Are you ready? ↑",              vi: "Yes/No → lên" },
        { en: "Where are you going? ↓",        vi: "WH → xuống" },
        { en: "Apple ↑, banana ↑, and pear ↓", vi: "Liệt kê" },
      ]
    },
    {
      title: "Schwa /ə/ — bí mật của English thật sự",
      explanation: "Hầu hết âm tiết KHÔNG có trọng âm sẽ giảm về /ə/ (gọi là schwa). Đây là âm phổ biến NHẤT trong tiếng Anh. Đừng đọc rõ từng âm — phải biết \"nuốt\".",
      examples: [
        { en: "about → /əˈbaʊt/  (a → ə)",   vi: "Âm a giảm về schwa" },
        { en: "banana → /bəˈnɑːnə/",         vi: "2 schwa ở 2 đầu" },
        { en: "computer → /kəmˈpjuːtər/",    vi: "com → kəm" },
      ]
    },
  ],
  quiz: [
    { question: "Trọng âm là âm tiết được:",                       options: ["Đọc nhỏ và nhanh", "Đọc to, dài, rõ", "Đọc với giọng cao", "Bỏ qua"], correct: 1 },
    { question: "Danh từ 2 âm tiết thường nhấn âm:",               options: ["Đầu", "Cuối", "Cả hai", "Tuỳ ý"], correct: 0 },
    { question: "Trong \"educAtion\", trọng âm rơi vào:",          options: ["e", "du", "CA", "tion"], correct: 2 },
    { question: "Câu hỏi YES/NO có ngữ điệu:",                     options: ["Xuống cuối", "Lên cuối", "Đều đều", "Lên rồi xuống"], correct: 1 },
    { question: "Schwa /ə/ là âm:",                                options: ["Mạnh, nhấn", "Yếu, không nhấn", "Phụ âm", "Chỉ có ở cuối từ"], correct: 1 },
    { question: "\"PRESENT\" (món quà) khác \"preSENT\" (tặng) ở:", options: ["Số âm tiết", "Vị trí trọng âm", "Phụ âm", "Nghĩa hoàn toàn không liên quan"], correct: 1 },
    { question: "Với câu \"What is your name?\", giọng cuối câu:",  options: ["Lên", "Xuống", "Giữ nguyên", "Lên rồi xuống"], correct: 1 },
  ]
};

export default PRONUNCIATION_STRESS_LESSON;
