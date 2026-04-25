// Track: advanced — C2 Philosophical Discussion

export const ADV_C2_PHILOSOPHY_LESSON = {
  id: "adv-c2-philosophy",
  title: "C2 Philosophical Discussion",
  description: "Bàn luận triết học: bản thể, nhận thức, đạo đức",
  level: "advanced",
  icon: "🤔",
  cefrLevel: "C2",
  vstepLevel: "C2",
  vocabulary: [
    { word: "Existence", phonetic: "/ɪɡˈzɪstəns/", meaning: "Sự tồn tại", example: "The meaning of existence puzzles many.", illustration: "🌌" },
    { word: "Consciousness", phonetic: "/ˈkɒnʃəsnəs/", meaning: "Ý thức", example: "Consciousness remains a mystery.", illustration: "🧠" },
    { word: "Ontology", phonetic: "/ɒnˈtɒlədʒi/", meaning: "Bản thể luận", example: "Ontology studies what exists.", illustration: "🌐" },
    { word: "Epistemology", phonetic: "/ɪˌpɪstɪˈmɒlədʒi/", meaning: "Nhận thức luận", example: "Epistemology asks how we know.", illustration: "🔍" },
    { word: "Determinism", phonetic: "/dɪˈtɜːmɪnɪzəm/", meaning: "Thuyết tất định", example: "Determinism denies free will.", illustration: "⛓️" },
    { word: "Free will", phonetic: "/friː wɪl/", meaning: "Tự do ý chí", example: "Free will is debated by philosophers.", illustration: "🕊️" },
    { word: "Relativism", phonetic: "/ˈrelətɪvɪzəm/", meaning: "Thuyết tương đối", example: "Moral relativism rejects universals.", illustration: "🔄" },
    { word: "Absolute", phonetic: "/ˈæbsəluːt/", meaning: "Tuyệt đối", example: "He believes in absolute truths.", illustration: "💎" },
    { word: "Dualism", phonetic: "/ˈdjuːəlɪzəm/", meaning: "Nhị nguyên luận", example: "Cartesian dualism splits mind and body.", illustration: "☯️" },
    { word: "Empirical", phonetic: "/ɪmˈpɪrɪkl/", meaning: "Thực nghiệm", example: "Empirical evidence trumps speculation.", illustration: "🔬" },
    { word: "A priori", phonetic: "/ˌeɪ praɪˈɔːri/", meaning: "Tiên nghiệm", example: "Math is often called a priori knowledge.", illustration: "📐" },
    { word: "Phenomenology", phonetic: "/fɪˌnɒmɪˈnɒlədʒi/", meaning: "Hiện tượng học", example: "Phenomenology studies lived experience.", illustration: "👁️" }
  ],
  grammar: [
    {
      title: "Mệnh đề danh từ trừu tượng",
      explanation: "Whether..., what..., that... làm chủ ngữ: \"Whether free will exists is debated.\".",
      examples: [
        { en: "Whether free will exists remains contested.", vi: "Liệu tự do ý chí có tồn tại hay không vẫn còn tranh cãi." },
        { en: "What constitutes consciousness is unclear.", vi: "Cái gì cấu thành ý thức vẫn chưa rõ." },
        { en: "That all events are determined seems counterintuitive.", vi: "Việc mọi sự kiện đều được định trước có vẻ phản trực giác." }
      ]
    },
    {
      title: "Tense và modality cho giả thuyết",
      explanation: "\"Suppose...\", \"Imagine...\", \"Consider that...\" + S + V; \"It would follow that...\".",
      examples: [
        { en: "Suppose consciousness were illusory — what then?", vi: "Giả sử ý thức là ảo — vậy thì sao?" },
        { en: "Imagine a world without free will.", vi: "Hãy tưởng tượng một thế giới không có tự do ý chí." },
        { en: "It would follow that morality is arbitrary.", vi: "Sẽ kéo theo rằng đạo đức là tùy tiện." }
      ]
    }
  ],
  quiz: [
    { question: "\"Ontology\" nghiên cứu:", options: ["Cách ta biết", "Cái gì tồn tại", "Đẹp xấu", "Đạo đức"], correct: 1 },
    { question: "\"Epistemology\" nghiên cứu:", options: ["Tri thức và sự hiểu biết", "Hành vi", "Vật chất", "Ngôn ngữ"], correct: 0 },
    { question: "\"Determinism\" phủ định:", options: ["Khoa học", "Tự do ý chí", "Sự tồn tại", "Thượng đế"], correct: 1 },
    { question: "\"A priori\" nghĩa:", options: ["Sau khi quan sát", "Tiên nghiệm — không cần kinh nghiệm", "Sai lầm", "Khoa học thực nghiệm"], correct: 1 },
    { question: "\"Whether free will exists ___ debated.\":", options: ["are", "is", "have", "be"], correct: 1 }
  ]
};

export default ADV_C2_PHILOSOPHY_LESSON;
