// Track: toeic — TOEIC Advanced Reports & Analytics (Band 900 – 990)

export const TOEIC_ADVANCED_REPORTS_LESSON = {
  id: "toeic-advanced-reports",
  title: "TOEIC Advanced Reports & Analytics",
  description: "Ngôn ngữ phân tích, báo cáo tài chính & dự báo xu hướng",
  level: "advanced",
  icon: "📊",
  examTag: "toeic",
  toeicBand: "900-990",
  vocabulary: [
    { word: "Fluctuate",      phonetic: "/ˈflʌktʃueɪt/",    meaning: "Dao động",              example: "The stock price fluctuated throughout Q4.",        illustration: "📈" },
    { word: "Plateau",        phonetic: "/ˈplætəʊ/",        meaning: "Chững lại",             example: "Sales plateaued after the peak.",                   illustration: "➖" },
    { word: "Surge",          phonetic: "/sɜːdʒ/",          meaning: "Tăng vọt",              example: "Demand surged unexpectedly.",                       illustration: "🚀" },
    { word: "Plummet",        phonetic: "/ˈplʌmɪt/",        meaning: "Lao dốc",               example: "Profits plummeted in January.",                     illustration: "📉" },
    { word: "Offset",         phonetic: "/ˈɒfset/",         meaning: "Bù trừ",                example: "Higher revenue offset the cost increase.",          illustration: "⚖️" },
    { word: "Forecast",       phonetic: "/ˈfɔːkɑːst/",      meaning: "Dự báo",                example: "The forecast indicates modest growth.",             illustration: "🔮" },
    { word: "Benchmark",      phonetic: "/ˈbentʃmɑːk/",     meaning: "Chuẩn đối chiếu",       example: "Our KPIs outperformed the industry benchmark.",     illustration: "🎯" },
    { word: "Margin",         phonetic: "/ˈmɑːdʒɪn/",       meaning: "Biên lợi nhuận",        example: "Gross margin rose by two points.",                  illustration: "💰" },
    { word: "Divest",         phonetic: "/daɪˈvest/",       meaning: "Thoái vốn",             example: "The firm divested its non-core assets.",            illustration: "🏦" },
    { word: "Amortize",       phonetic: "/əˈmɔːtaɪz/",      meaning: "Khấu hao / phân bổ",    example: "The loan is amortized over ten years.",             illustration: "📆" },
    { word: "Yield",          phonetic: "/jiːld/",          meaning: "Sinh lời / lợi suất",   example: "The bond yields 4.5% annually.",                    illustration: "💹" },
    { word: "Consolidate",    phonetic: "/kənˈsɒlɪdeɪt/",   meaning: "Hợp nhất",              example: "We will consolidate the two divisions.",            illustration: "🧩" },
  ],
  grammar: [
    {
      title: "Passive voice trong báo cáo",
      explanation: "Dùng bị động để nhấn mạnh kết quả hơn chủ thể, phổ biến trong báo cáo tài chính.",
      examples: [
        { en: "Revenue was driven by strong Q3 performance.",         vi: "Doanh thu được thúc đẩy nhờ kết quả Q3 tốt." },
        { en: "The decline has been attributed to supply issues.",     vi: "Sự suy giảm được cho là do vấn đề nguồn cung." },
        { en: "New policies are being implemented across regions.",    vi: "Các chính sách mới đang được triển khai khắp các khu vực." },
      ],
    },
    {
      title: "Mệnh đề nhượng bộ (despite / although / whereas)",
      explanation: "Nối hai ý trái ngược để phân tích dữ liệu đa chiều.",
      examples: [
        { en: "Despite weaker demand, profits rose 3%.",              vi: "Mặc dù nhu cầu yếu hơn, lợi nhuận tăng 3%." },
        { en: "Although costs increased, margins remained stable.",    vi: "Mặc dù chi phí tăng, biên lợi nhuận vẫn ổn định." },
        { en: "Exports rose, whereas imports contracted.",             vi: "Xuất khẩu tăng, trong khi nhập khẩu thu hẹp." },
      ],
    },
  ],
  quiz: [
    { question: "\"Plummet\" nghĩa là:",                                options: ["Tăng vọt", "Chững lại", "Lao dốc", "Ổn định"],             correct: 2 },
    { question: "\"Higher revenue ___ the cost increase.\" (bù trừ)",    options: ["divested", "offset", "consolidated", "amortized"],          correct: 1 },
    { question: "\"Gross ___ rose by two points.\"",                     options: ["yield", "benchmark", "margin", "forecast"],                correct: 2 },
    { question: "\"Divest\" nghĩa là:",                                  options: ["Đầu tư thêm", "Thoái vốn", "Sáp nhập", "Tái cơ cấu"],      correct: 1 },
    { question: "Chọn câu bị động phù hợp báo cáo:",                    options: ["We drove revenue.", "Revenue was driven by strong Q3.", "Revenue drive Q3.", "Revenue driving."], correct: 1 },
    { question: "\"___ weaker demand, profits rose 3%.\"",                options: ["Because", "Despite", "So", "If"],                          correct: 1 },
    { question: "\"The bond ___ 4.5% annually.\"",                        options: ["plateaus", "surges", "yields", "divests"],                  correct: 2 },
  ],
};

export default TOEIC_ADVANCED_REPORTS_LESSON;
