// Track: advanced — C2 Academic Publishing

export const ADV_C2_ACADEMIC_PUBLISHING_LESSON = {
  id: "adv-c2-academic-publishing",
  title: "C2 Academic Publishing",
  description: "Quy trình xuất bản học thuật, đạo đức nghiên cứu và giao tiếp với biên tập viên",
  level: "advanced",
  icon: "📰",
  cefrLevel: "C2",
  vstepLevel: "C2",
  vocabulary: [
    { word: "Manuscript", phonetic: "/ˈmænjʊskrɪpt/", meaning: "Bản thảo", example: "Submit the manuscript via the portal.", illustration: "📜" },
    { word: "Submission", phonetic: "/səbˈmɪʃən/", meaning: "Việc nộp bài", example: "Submission deadline is March 15.", illustration: "📤" },
    { word: "Revision", phonetic: "/rɪˈvɪʒən/", meaning: "Bản chỉnh sửa", example: "Major revisions were requested.", illustration: "✏️" },
    { word: "Acceptance", phonetic: "/əkˈseptəns/", meaning: "Sự chấp nhận đăng", example: "We received the acceptance letter.", illustration: "✅" },
    { word: "Rejection", phonetic: "/rɪˈdʒekʃən/", meaning: "Sự từ chối", example: "Rejection is part of academia.", illustration: "❌" },
    { word: "Reviewer", phonetic: "/rɪˈvjuːə/", meaning: "Người phản biện", example: "Reviewer 2 was harsh.", illustration: "👨‍⚖️" },
    { word: "Impact factor", phonetic: "/ˈɪmpækt/", meaning: "Hệ số ảnh hưởng", example: "The journal has a high impact factor.", illustration: "📈" },
    { word: "Open access", phonetic: "/ˈəʊpən ˈækses/", meaning: "Truy cập mở", example: "Open access papers reach more readers.", illustration: "🔓" },
    { word: "Predatory journal", phonetic: "/ˈpredətəri/", meaning: "Tạp chí săn mồi", example: "Avoid predatory journals.", illustration: "🦈" },
    { word: "Conflict of interest", phonetic: "/ˈkɒnflɪkt/", meaning: "Xung đột lợi ích", example: "Disclose any conflict of interest.", illustration: "⚠️" },
    { word: "Authorship", phonetic: "/ˈɔːθəʃɪp/", meaning: "Tác quyền", example: "Authorship order matters.", illustration: "✍️" },
    { word: "Retraction", phonetic: "/rɪˈtrækʃən/", meaning: "Sự rút lại bài", example: "The paper faced retraction.", illustration: "↩️" }
  ],
  grammar: [
    {
      title: "Văn phong cover letter cho biên tập viên",
      explanation: "\"We are pleased to submit...\", \"We believe this work would be of interest to...\", \"We confirm that this manuscript has not been published elsewhere.\".",
      examples: [
        { en: "We are pleased to submit our manuscript for consideration.", vi: "Chúng tôi hân hạnh gửi bản thảo để xem xét." },
        { en: "We believe this work aligns with the journal's scope.", vi: "Chúng tôi tin tác phẩm này phù hợp phạm vi của tạp chí." },
        { en: "We confirm that all authors have approved the submission.", vi: "Chúng tôi xác nhận tất cả tác giả đã đồng ý nộp." }
      ]
    },
    {
      title: "Phản hồi reviewer (response to reviewers)",
      explanation: "\"We thank the reviewer for the insightful comment.\", \"As suggested, we have...\", \"We respectfully disagree because...\".",
      examples: [
        { en: "We thank the reviewer for this valuable suggestion.", vi: "Chúng tôi cảm ơn phản biện vì gợi ý quý báu này." },
        { en: "As suggested, we have revised Section 3.2 to clarify the methodology.", vi: "Theo gợi ý, chúng tôi đã sửa Mục 3.2 để làm rõ phương pháp." },
        { en: "We respectfully disagree, as our preliminary tests support the model.", vi: "Chúng tôi xin được không đồng tình, vì các thử nghiệm sơ bộ ủng hộ mô hình." }
      ]
    }
  ],
  quiz: [
    { question: "\"Predatory journal\" là:", options: ["Tạp chí uy tín", "Tạp chí thu phí, kém kiểm duyệt", "Tạp chí mở", "Tạp chí ngành sinh học"], correct: 1 },
    { question: "\"Impact factor\" đo:", options: ["Số trang", "Mức độ trích dẫn/tầm ảnh hưởng", "Lương biên tập", "Phí xuất bản"], correct: 1 },
    { question: "\"Retraction\" nghĩa:", options: ["Đăng lại", "Rút lại bài đã xuất bản", "Phản biện", "Trích dẫn"], correct: 1 },
    { question: "Khi đáp lại reviewer nên:", options: ["Tránh trả lời", "Cảm ơn và phản hồi cụ thể", "Chỉ trích reviewer", "Im lặng và nộp lại"], correct: 1 },
    { question: "\"Open access\":", options: ["Truy cập mở miễn phí", "Chỉ dành cho tác giả", "Đóng phí trọn đời", "Cần đăng nhập viện"], correct: 0 }
  ]
};

export default ADV_C2_ACADEMIC_PUBLISHING_LESSON;
