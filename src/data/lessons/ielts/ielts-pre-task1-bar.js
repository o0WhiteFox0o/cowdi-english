// Track: ielts — IELTS Pre-Intermediate Task 1: Bar Charts (Band 4.5 – 5.5)

export const IELTS_PRE_TASK1_BAR_LESSON = {
  id: "ielts-pre-task1-bar",
  title: "IELTS Task 1 — Bar Charts",
  description: "Mô tả biểu đồ cột — cấu trúc, từ so sánh, ngôn ngữ xu hướng",
  level: "intermediate",
  icon: "📊",
  examTag: "ielts",
  ieltsBand: "4.5-5.5",
  vocabulary: [
    { word: "Bar chart",    phonetic: "/bɑː tʃɑːt/",     meaning: "Biểu đồ cột",     example: "The bar chart shows sales by quarter.",  illustration: "📊" },
    { word: "Category",     phonetic: "/ˈkætəɡri/",      meaning: "Loại / nhóm",     example: "There are four categories in the chart.", illustration: "🗂️" },
    { word: "Highest",      phonetic: "/ˈhaɪɪst/",       meaning: "Cao nhất",        example: "The highest figure is 80%.",              illustration: "🔝" },
    { word: "Lowest",       phonetic: "/ˈləʊɪst/",       meaning: "Thấp nhất",       example: "The lowest value is in 2010.",            illustration: "🔽" },
    { word: "Compared",     phonetic: "/kəmˈpeəd/",      meaning: "So với",          example: "Compared to 2010, sales doubled.",        illustration: "⚖️" },
    { word: "Approximately",phonetic: "/əˈprɒksɪmətli/", meaning: "Khoảng",          example: "Approximately 60% of students passed.",    illustration: "≈" },
    { word: "Twice",        phonetic: "/twaɪs/",         meaning: "Gấp đôi",         example: "Sales were twice as high in 2020.",       illustration: "✖️2" },
    { word: "Triple",       phonetic: "/ˈtrɪpl/",        meaning: "Gấp ba",          example: "Production tripled over a decade.",       illustration: "✖️3" },
    { word: "Outnumber",    phonetic: "/ˌaʊtˈnʌmbə/",    meaning: "Đông hơn",        example: "Men outnumber women in this field.",     illustration: "👥" },
    { word: "Followed by",  phonetic: "/ˈfɒləʊd baɪ/",   meaning: "Theo sau là",     example: "France leads, followed by Germany.",      illustration: "➡️" },
    { word: "Account for",  phonetic: "/əˈkaʊnt fɔː/",   meaning: "Chiếm",           example: "Tea accounts for 40% of consumption.",   illustration: "🥧" },
    { word: "Overview",     phonetic: "/ˈəʊvəvjuː/",     meaning: "Tổng quan",       example: "Always include an overview paragraph.",    illustration: "🔭" },
  ],
  grammar: [
    {
      title: "Cấu trúc bài Task 1 (4 đoạn)",
      explanation: "1) Introduction — paraphrase đề bài. 2) Overview — 2–3 đặc điểm nổi bật chung. 3+4) Body — mô tả số liệu chi tiết, so sánh.",
      examples: [
        { en: "The bar chart illustrates sales of three products from 2010 to 2020.", vi: "Biểu đồ cột minh họa doanh số 3 sản phẩm từ 2010 đến 2020." },
        { en: "Overall, product A was always the most popular.",                       vi: "Tổng quan, sản phẩm A luôn phổ biến nhất." },
        { en: "In 2010, sales of A reached 50 units, compared to just 20 for B.",      vi: "Năm 2010, A đạt 50 đơn vị, so với chỉ 20 của B." },
      ],
    },
    {
      title: "Ngôn ngữ so sánh & số liệu",
      explanation: "Dùng cấu trúc: twice as high as, three times more than, X% higher than. Số liệu xấp xỉ: approximately, around, just over, just under, nearly.",
      examples: [
        { en: "Sales of A were twice as high as B.",                vi: "Doanh số A gấp đôi B." },
        { en: "Approximately 60% of students chose science.",        vi: "Khoảng 60% học sinh chọn khoa học." },
        { en: "Just over half of respondents agreed.",               vi: "Hơn một nửa người trả lời đồng ý." },
      ],
    },
  ],
  quiz: [
    { question: "Mở bài Task 1 nên:",                                       options: ["Sao chép đề bài", "Paraphrase (viết lại) đề bài", "Đưa ý kiến cá nhân", "Bỏ qua"],          correct: 1 },
    { question: "\"Approximately\" gần nghĩa với:",                         options: ["Chính xác", "Khoảng / xấp xỉ", "Gấp đôi", "Ít nhất"],                                       correct: 1 },
    { question: "\"Sales were twice as high as\" nghĩa là:",                options: ["Cao hơn 1 ít", "Cao hơn 2 lần", "Thấp hơn 2 lần", "Bằng nhau"],                            correct: 1 },
    { question: "Đoạn \"overview\" trong Task 1 chứa:",                     options: ["Số liệu cụ thể", "2–3 xu hướng chung nổi bật", "Lập luận", "Kết luận cá nhân"],              correct: 1 },
    { question: "\"Tea accounts for 40%\" nghĩa là:",                        options: ["Trà chiếm 40%", "Trà đắt 40%", "Trà thiếu 40%", "Trà tăng 40%"],                            correct: 0 },
    { question: "\"Just over half\" nghĩa là:",                              options: ["Đúng 50%", "Hơn 50% một chút", "Ít hơn 50%", "Khoảng 90%"],                                 correct: 1 },
  ],
};

export default IELTS_PRE_TASK1_BAR_LESSON;
