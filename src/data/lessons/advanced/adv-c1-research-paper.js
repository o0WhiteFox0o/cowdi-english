// Track: advanced — C1 Research Paper Writing

export const ADV_C1_RESEARCH_PAPER_LESSON = {
  id: "adv-c1-research-paper",
  title: "C1 Research Paper Writing",
  description: "Cấu trúc và ngôn ngữ chuẩn IMRAD cho bài báo khoa học",
  level: "advanced",
  icon: "📄",
  cefrLevel: "C1",
  vstepLevel: "C1",
  vocabulary: [
    { word: "Abstract", phonetic: "/ˈæbstrækt/", meaning: "Tóm tắt nghiên cứu", example: "The abstract summarizes the entire paper.", illustration: "📑" },
    { word: "Methodology", phonetic: "/ˌmeθəˈdɒlədʒi/", meaning: "Phương pháp luận", example: "Describe your methodology in detail.", illustration: "🧪" },
    { word: "Hypothesis", phonetic: "/haɪˈpɒθəsɪs/", meaning: "Giả thuyết", example: "The hypothesis was supported by the data.", illustration: "💡" },
    { word: "Literature review", phonetic: "/ˈlɪtrətʃər rɪˈvjuː/", meaning: "Tổng quan tài liệu", example: "A thorough literature review is essential.", illustration: "📚" },
    { word: "Citation", phonetic: "/saɪˈteɪʃən/", meaning: "Trích dẫn", example: "Use APA-style citations.", illustration: "🔖" },
    { word: "Peer review", phonetic: "/pɪər rɪˈvjuː/", meaning: "Phản biện đồng nghiệp", example: "The article passed peer review.", illustration: "👥" },
    { word: "Findings", phonetic: "/ˈfaɪndɪŋz/", meaning: "Kết quả nghiên cứu", example: "Our findings challenge prior work.", illustration: "🎯" },
    { word: "Limitation", phonetic: "/ˌlɪmɪˈteɪʃən/", meaning: "Hạn chế", example: "Acknowledge limitations transparently.", illustration: "⚠️" },
    { word: "Implication", phonetic: "/ˌɪmplɪˈkeɪʃən/", meaning: "Hàm ý", example: "The implications are far-reaching.", illustration: "🔮" },
    { word: "Plagiarism", phonetic: "/ˈpleɪdʒərɪzəm/", meaning: "Đạo văn", example: "Avoid plagiarism through proper citation.", illustration: "🚫" },
    { word: "Replicate", phonetic: "/ˈreplɪkeɪt/", meaning: "Lặp lại (để xác minh)", example: "Other labs failed to replicate the result.", illustration: "🔁" },
    { word: "Significant", phonetic: "/sɪɡˈnɪfɪkənt/", meaning: "Có ý nghĩa thống kê", example: "The difference was statistically significant.", illustration: "📊" }
  ],
  grammar: [
    {
      title: "Bị động trong văn học thuật",
      explanation: "Học thuật ưu tiên bị động khi tác nhân không quan trọng: \"Data were collected\", \"It was found that\".",
      examples: [
        { en: "Data were collected over six months.", vi: "Dữ liệu được thu thập trong 6 tháng." },
        { en: "It was found that group A outperformed group B.", vi: "Người ta thấy rằng nhóm A vượt trội nhóm B." },
        { en: "The variables were controlled for age and gender.", vi: "Các biến được kiểm soát theo tuổi và giới tính." }
      ]
    },
    {
      title: "Reporting verbs (động từ tường thuật)",
      explanation: "argue, claim, suggest, demonstrate, posit + that-clause. Mỗi động từ thể hiện thái độ khác nhau với ý kiến gốc.",
      examples: [
        { en: "Smith (2020) argues that climate policy is inadequate.", vi: "Smith (2020) lập luận rằng chính sách khí hậu chưa đầy đủ." },
        { en: "The authors suggest that further research is needed.", vi: "Các tác giả gợi ý cần nghiên cứu thêm." },
        { en: "Recent data demonstrate a clear trend.", vi: "Dữ liệu gần đây chứng minh một xu hướng rõ ràng." }
      ]
    }
  ],
  quiz: [
    { question: "\"Abstract\" của bài báo là:", options: ["Phần kết luận", "Bản tóm tắt nghiên cứu", "Phần mở đầu giới thiệu lĩnh vực", "Trang bìa"], correct: 1 },
    { question: "\"Peer review\" là:", options: ["Tự đánh giá", "Đồng nghiệp phản biện độc lập", "Phỏng vấn xin việc", "Đăng tải bản nháp"], correct: 1 },
    { question: "\"Replicate the result\" nghĩa:", options: ["Sao chép văn bản", "Lặp lại nghiên cứu để xác minh", "Trích dẫn", "Phản biện"], correct: 1 },
    { question: "\"It was found that...\" thuộc dạng:", options: ["Chủ động", "Bị động học thuật", "Câu hỏi", "Câu mệnh lệnh"], correct: 1 },
    { question: "\"Statistically significant\" nghĩa:", options: ["Khác biệt do ngẫu nhiên", "Khác biệt có ý nghĩa thống kê", "Không có khác biệt", "Khó phát hiện"], correct: 1 }
  ]
};

export default ADV_C1_RESEARCH_PAPER_LESSON;
