// Track: advanced — C1 Listening: Academic Lectures

export const ADV_C1_LISTENING_LESSON = {
  id: "adv-c1-listening",
  title: "C1 Listening: Academic Lectures",
  description: "Nghe bài giảng đại học — theo dõi cấu trúc, ghi chú, hiểu hàm ý",
  level: "advanced",
  icon: "🎧",
  cefrLevel: "C1",
  vstepLevel: "C1",
  vocabulary: [
    { word: "Lecture",        phonetic: "/ˈlektʃər/",       meaning: "Bài giảng",              example: "Today's lecture is on genetics.",                   illustration: "🏫" },
    { word: "Outline",        phonetic: "/ˈaʊtlaɪn/",       meaning: "Dàn ý",                  example: "Let me outline three main points.",                 illustration: "📋" },
    { word: "Digress",        phonetic: "/daɪˈɡres/",       meaning: "Lạc đề",                 example: "Sorry, I've digressed from the main topic.",        illustration: "🔀" },
    { word: "Emphasize",      phonetic: "/ˈemfəsaɪz/",      meaning: "Nhấn mạnh",              example: "I want to emphasize this key finding.",             illustration: "💥" },
    { word: "Illustrate",     phonetic: "/ˈɪləstreɪt/",     meaning: "Minh hoạ",               example: "Let me illustrate with an example.",                 illustration: "🖼️" },
    { word: "Recap",          phonetic: "/ˈriːkæp/",        meaning: "Tóm tắt lại",            example: "To recap, we covered three theories.",              illustration: "🔁" },
    { word: "Implication",    phonetic: "/ˌɪmplɪˈkeɪʃn/",   meaning: "Hàm ý",                  example: "Consider the implications for policy.",              illustration: "💭" },
    { word: "Distinguish",    phonetic: "/dɪˈstɪŋɡwɪʃ/",    meaning: "Phân biệt",              example: "We must distinguish correlation from causation.",    illustration: "🔍" },
    { word: "Tangential",     phonetic: "/tænˈdʒenʃl/",     meaning: "Lan man / không trọng tâm", example: "That point is rather tangential.",               illustration: "🧭" },
    { word: "Premise",        phonetic: "/ˈpremɪs/",        meaning: "Tiền đề",                example: "The argument rests on a flawed premise.",            illustration: "🏗️" },
  ],
  grammar: [
    {
      title: "Signpost language của giảng viên",
      explanation: "Các cụm chỉ dẫn cấu trúc bài giảng — giúp người nghe định vị nội dung.",
      examples: [
        { en: "Moving on to our next point…",                 vi: "Chuyển sang ý tiếp theo…" },
        { en: "As I mentioned earlier…",                       vi: "Như tôi đã đề cập trước đó…" },
        { en: "To sum up this section…",                       vi: "Tóm tắt phần này…" },
      ],
    },
    {
      title: "Câu phức với 'given that' / 'provided that'",
      explanation: "Dùng thay 'because' hay 'if' trong văn nói học thuật, thể hiện điều kiện/lý do rõ ràng.",
      examples: [
        { en: "Given that the data is limited, we proceed cautiously.", vi: "Do dữ liệu còn hạn chế, ta tiến hành thận trọng." },
        { en: "Provided that funding continues, the study will expand.", vi: "Với điều kiện tài trợ tiếp tục, nghiên cứu sẽ mở rộng." },
        { en: "Assuming the results hold, we can generalize.",            vi: "Giả sử kết quả vẫn đúng, ta có thể tổng quát hoá." },
      ],
    },
  ],
  quiz: [
    { question: "\"Digress\" nghĩa là:",                                 options: ["Tóm tắt", "Lạc đề", "Nhấn mạnh", "Chuyển ý"],     correct: 1 },
    { question: "\"To recap\" = \"___\":",                                options: ["To introduce", "To summarize", "To oppose", "To hedge"], correct: 1 },
    { question: "\"That point is ___\" = không trọng tâm",               options: ["premise", "tangential", "rigorous", "compelling"], correct: 1 },
    { question: "Signpost nào báo hiệu chuyển sang ý mới?",              options: ["As I said…", "Moving on to…", "To recap…", "For example…"], correct: 1 },
    { question: "\"Given that\" gần nghĩa với:",                          options: ["Although", "Because", "However", "Whereas"],      correct: 1 },
    { question: "\"Premise\" trong lập luận nghĩa là:",                   options: ["Kết luận", "Tiền đề", "Ví dụ", "Bằng chứng"],      correct: 1 },
  ],
};

export default ADV_C1_LISTENING_LESSON;
