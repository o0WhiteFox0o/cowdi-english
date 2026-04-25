// Track: advanced — C1 Phrasal Verbs nâng cao

export const ADV_C1_PHRASAL_VERBS_LESSON = {
  id: "adv-c1-phrasal-verbs",
  title: "C1 Phrasal Verbs",
  description: "Cụm động từ ít gặp, sắc thái mạnh ở trình độ C1",
  level: "advanced",
  icon: "🔗",
  cefrLevel: "C1",
  vstepLevel: "C1",
  vocabulary: [
    { word: "Account for", phonetic: "/əˈkaʊnt fɔː/", meaning: "Lý giải, chiếm tỉ lệ", example: "Renewables account for 30% of energy.", illustration: "📊" },
    { word: "Stem from", phonetic: "/stem frɒm/", meaning: "Bắt nguồn từ", example: "The conflict stems from miscommunication.", illustration: "🌱" },
    { word: "Bring about", phonetic: "/brɪŋ əˈbaʊt/", meaning: "Gây ra, dẫn đến", example: "The reform brought about major change.", illustration: "🔄" },
    { word: "Carry out", phonetic: "/ˈkæri aʊt/", meaning: "Thực hiện", example: "Carry out a feasibility study.", illustration: "✅" },
    { word: "Pin down", phonetic: "/pɪn daʊn/", meaning: "Xác định chính xác", example: "It's hard to pin down the cause.", illustration: "📌" },
    { word: "Rule out", phonetic: "/ruːl aʊt/", meaning: "Loại trừ", example: "We can rule out coincidence.", illustration: "🚫" },
    { word: "Boil down to", phonetic: "/bɔɪl daʊn tə/", meaning: "Quy về, tóm lại là", example: "It boils down to leadership.", illustration: "♨️" },
    { word: "Spell out", phonetic: "/spel aʊt/", meaning: "Giải thích rõ", example: "Let me spell out the implications.", illustration: "🔤" },
    { word: "Phase out", phonetic: "/feɪz aʊt/", meaning: "Dần loại bỏ", example: "Coal will be phased out by 2040.", illustration: "📉" },
    { word: "Roll out", phonetic: "/rəʊl aʊt/", meaning: "Triển khai rộng", example: "We rolled out the platform globally.", illustration: "🚀" },
    { word: "Mull over", phonetic: "/mʌl ˈəʊvə/", meaning: "Cân nhắc kỹ", example: "Let me mull it over tonight.", illustration: "🤔" },
    { word: "Iron out", phonetic: "/ˈaɪən aʊt/", meaning: "Giải quyết các trục trặc", example: "We need to iron out the details.", illustration: "🛠️" }
  ],
  grammar: [
    {
      title: "Phrasal verb tách được vs không tách",
      explanation: "Separable: \"figure it out\" (đại từ phải ở giữa). Inseparable: \"come across her\" (giữ nguyên trật tự).",
      examples: [
        { en: "We carried out the survey. / We carried it out.", vi: "Chúng tôi tiến hành khảo sát. / Chúng tôi đã tiến hành nó." },
        { en: "The findings stem from the data. (NOT stem the data from)", vi: "Kết quả bắt nguồn từ dữ liệu (không tách)." },
        { en: "Spell it out for me, please.", vi: "Hãy giải thích cụ thể cho tôi nhé." }
      ]
    },
    {
      title: "Phrasal verbs trong văn formal",
      explanation: "Một số phrasal verbs vẫn thích hợp trong văn formal: account for, bring about, carry out, give rise to.",
      examples: [
        { en: "These factors give rise to inflation.", vi: "Những yếu tố này gây ra lạm phát." },
        { en: "The committee carried out an audit.", vi: "Ủy ban đã tiến hành một cuộc kiểm toán." },
        { en: "Several variables account for the variation.", vi: "Một số biến lý giải sự biến thiên này." }
      ]
    }
  ],
  quiz: [
    { question: "\"Boil down to\" nghĩa:", options: ["Đun sôi", "Tóm lại là, quy về", "Phớt lờ", "Giảm giá"], correct: 1 },
    { question: "\"Phase out\" nghĩa:", options: ["Bắt đầu giai đoạn", "Dần loại bỏ", "Tăng tốc", "Đóng băng"], correct: 1 },
    { question: "\"Rule out\" có nghĩa:", options: ["Đặt ra quy tắc", "Loại trừ khả năng", "Quản lý chặt", "Phớt lờ"], correct: 1 },
    { question: "\"We carried ___ out yesterday.\" (đại từ \"it\"):", options: ["it", "out it", "carried out it", "out"], correct: 0 },
    { question: "\"Stem from\" gần nghĩa:", options: ["originate from", "lead to", "ignore", "complete"], correct: 0 }
  ]
};

export default ADV_C1_PHRASAL_VERBS_LESSON;
