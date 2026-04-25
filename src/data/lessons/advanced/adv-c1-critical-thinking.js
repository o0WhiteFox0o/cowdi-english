// Track: advanced — C1 Critical Thinking & Argumentation

export const ADV_C1_CRITICAL_THINKING_LESSON = {
  id: "adv-c1-critical-thinking",
  title: "C1 Critical Thinking",
  description: "Lập luận, đánh giá quan điểm và phân tích lỗi logic ở trình độ C1",
  level: "advanced",
  icon: "🧠",
  cefrLevel: "C1",
  vstepLevel: "C1",
  vocabulary: [
    { word: "Premise", phonetic: "/ˈpremɪs/", meaning: "Tiền đề", example: "The argument rests on a flawed premise.", illustration: "📐" },
    { word: "Inference", phonetic: "/ˈɪnfərəns/", meaning: "Suy luận", example: "Draw an inference from the data.", illustration: "🔍" },
    { word: "Bias", phonetic: "/ˈbaɪəs/", meaning: "Định kiến", example: "Researchers must avoid confirmation bias.", illustration: "⚖️" },
    { word: "Fallacy", phonetic: "/ˈfæləsi/", meaning: "Lỗi ngụy biện", example: "That is a classic ad hominem fallacy.", illustration: "❌" },
    { word: "Assumption", phonetic: "/əˈsʌmpʃən/", meaning: "Giả định", example: "Question the underlying assumption.", illustration: "❓" },
    { word: "Counterargument", phonetic: "/ˈkaʊntərˌɑːɡjumənt/", meaning: "Phản biện", example: "Anticipate counterarguments in your essay.", illustration: "↔️" },
    { word: "Coherent", phonetic: "/kəʊˈhɪərənt/", meaning: "Mạch lạc", example: "Present a coherent argument.", illustration: "🧩" },
    { word: "Refutation", phonetic: "/ˌrefjuˈteɪʃən/", meaning: "Sự bác bỏ", example: "Her refutation was decisive.", illustration: "🛑" },
    { word: "Subjective", phonetic: "/səbˈdʒektɪv/", meaning: "Chủ quan", example: "Aesthetic judgment is subjective.", illustration: "🪞" },
    { word: "Objective", phonetic: "/əbˈdʒektɪv/", meaning: "Khách quan", example: "Strive for objective evaluation.", illustration: "🔭" },
    { word: "Cogent", phonetic: "/ˈkəʊdʒənt/", meaning: "Thuyết phục, chặt chẽ", example: "She made a cogent case for reform.", illustration: "💎" },
    { word: "Spurious", phonetic: "/ˈspjʊəriəs/", meaning: "Giả tạo, không có cơ sở", example: "The correlation turned out to be spurious.", illustration: "🚫" }
  ],
  grammar: [
    {
      title: "Hedging language (ngôn ngữ phỏng định)",
      explanation: "Dùng \"may/might/could\", \"tend to\", \"appears to\", \"it is likely that\" để giảm tính tuyệt đối.",
      examples: [
        { en: "The data may suggest a causal link.", vi: "Dữ liệu có thể gợi ý một mối liên hệ nhân quả." },
        { en: "This finding tends to support the hypothesis.", vi: "Kết quả này có xu hướng ủng hộ giả thuyết." },
        { en: "It appears that bias has influenced the outcome.", vi: "Có vẻ như định kiến đã ảnh hưởng đến kết quả." }
      ]
    },
    {
      title: "Cleft sentences nhấn mạnh lập luận",
      explanation: "It is X that... / What ... is ... — nhấn mạnh thông tin then chốt.",
      examples: [
        { en: "It is the methodology that undermines the conclusion.", vi: "Chính phương pháp luận làm suy yếu kết luận." },
        { en: "What matters most is the quality of the evidence.", vi: "Điều quan trọng nhất là chất lượng bằng chứng." },
        { en: "It was only after peer review that the flaw emerged.", vi: "Chỉ sau khi phản biện đồng nghiệp, lỗi mới xuất hiện." }
      ]
    }
  ],
  quiz: [
    { question: "\"Premise\" gần nghĩa với:", options: ["conclusion", "starting assumption", "hypothesis test", "rebuttal"], correct: 1 },
    { question: "\"Confirmation bias\" là:", options: ["Khuynh hướng tìm dẫn chứng ủng hộ niềm tin sẵn có", "Phương pháp khoa học", "Lập luận chặt chẽ", "Phản biện"], correct: 0 },
    { question: "\"Cogent argument\" nghĩa:", options: ["Yếu, lủng củng", "Chặt chẽ, thuyết phục", "Mơ hồ", "Cảm tính"], correct: 1 },
    { question: "Hedging dùng để:", options: ["Khẳng định tuyệt đối", "Giảm tính tuyệt đối, thận trọng", "Phủ nhận hoàn toàn", "Khoe kiến thức"], correct: 1 },
    { question: "\"It is the data that proves...\" là:", options: ["Câu bị động", "Câu cleft nhấn mạnh", "Câu điều kiện", "Câu so sánh"], correct: 1 }
  ]
};

export default ADV_C1_CRITICAL_THINKING_LESSON;
