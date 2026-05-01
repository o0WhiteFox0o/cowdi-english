// Track: general — Hỏi đường & chỉ đường (Asking for Directions)

export const DIRECTIONS_LESSON = {
  id: "directions",
  title: "Hỏi đường & chỉ đường",
  description: "Đi thẳng, rẽ trái, rẽ phải — kỹ năng sống còn khi du lịch",
  level: "beginner",
  icon: "🗺️",
  vocabulary: [
    { word: "Excuse me",     phonetic: "/ɪkˈskjuːz miː/", meaning: "Xin lỗi (mở đầu)", example: "Excuse me, where is the bank?", illustration: "🙋" },
    { word: "Go straight",   phonetic: "/ɡoʊ streɪt/",    meaning: "Đi thẳng",         example: "Go straight for 100 meters.", illustration: "⬆️" },
    { word: "Turn left",     phonetic: "/tɜːrn lɛft/",    meaning: "Rẽ trái",          example: "Turn left at the corner.", illustration: "⬅️" },
    { word: "Turn right",    phonetic: "/tɜːrn raɪt/",    meaning: "Rẽ phải",          example: "Turn right at the lights.", illustration: "➡️" },
    { word: "Cross",         phonetic: "/krɒs/",          meaning: "Băng qua",         example: "Cross the street.", illustration: "🚶" },
    { word: "Corner",        phonetic: "/ˈkɔːrnər/",      meaning: "Góc đường",        example: "The shop is on the corner.", illustration: "📐" },
    { word: "Traffic lights", phonetic: "/ˈtræfɪk laɪts/", meaning: "Đèn giao thông",  example: "Stop at the traffic lights.", illustration: "🚦" },
    { word: "Crossroads",    phonetic: "/ˈkrɒsroʊdz/",    meaning: "Ngã tư",           example: "Turn right at the crossroads.", illustration: "✚" },
    { word: "Roundabout",    phonetic: "/ˈraʊndəbaʊt/",   meaning: "Vòng xuyến",       example: "Take the second exit at the roundabout.", illustration: "⭕" },
    { word: "Block",         phonetic: "/blɒk/",          meaning: "Dãy nhà / khu phố", example: "Walk two blocks.", illustration: "🏘️" },
    { word: "Map",           phonetic: "/mæp/",           meaning: "Bản đồ",            example: "I have a map.", illustration: "🗺️" },
    { word: "Far / Near",    phonetic: "/fɑːr/ /nɪər/",   meaning: "Xa / gần",          example: "Is it far from here?", illustration: "📏" },
    { word: "Next to",       phonetic: "/nɛkst tə/",      meaning: "Bên cạnh",          example: "It's next to the bank.", illustration: "👉" },
    { word: "Opposite",      phonetic: "/ˈɒpəzɪt/",       meaning: "Đối diện",          example: "It's opposite the park.", illustration: "↔️" },
    { word: "Get lost",      phonetic: "/ɡɛt lɒst/",      meaning: "Bị lạc",            example: "I got lost in the city.", illustration: "🤷" },
  ],
  grammar: [
    {
      title: "Cách hỏi đường lịch sự",
      explanation: "Bắt đầu bằng \"Excuse me, …\" rồi dùng các mẫu: Where is …? / Could you tell me how to get to …? / Is there a … near here?",
      examples: [
        { en: "Excuse me, where is the post office?",            vi: "Xin lỗi, bưu điện ở đâu?" },
        { en: "Could you tell me how to get to the station?",   vi: "Bạn chỉ tôi đến ga được không?" },
        { en: "Is there a hospital near here?",                  vi: "Quanh đây có bệnh viện không?" },
        { en: "How far is it?",                                  vi: "Nó cách đây bao xa?" },
      ]
    },
    {
      title: "Cách chỉ đường",
      explanation: "Dùng câu mệnh lệnh ngắn gọn: Go / Turn / Take / Cross / Walk + chi tiết. Nối các bước bằng then, after that, finally.",
      examples: [
        { en: "Go straight for 200 meters.",            vi: "Đi thẳng 200m" },
        { en: "Then turn left at the lights.",          vi: "Sau đó rẽ trái ở đèn" },
        { en: "After that, take the first right.",      vi: "Tiếp theo rẽ phải đầu tiên" },
        { en: "It's on your left, opposite the park.",  vi: "Nó nằm bên trái, đối diện công viên" },
      ]
    },
    {
      title: "Mô tả vị trí đích",
      explanation: "Sau khi chỉ đường, mô tả vị trí cuối: It's on the left/right. It's next to / opposite / between … You can't miss it!",
      examples: [
        { en: "It's on the right, next to a café.",       vi: "Bên phải, cạnh quán cà phê" },
        { en: "It's between the bank and the bookshop.",  vi: "Nằm giữa ngân hàng và hiệu sách" },
        { en: "You can't miss it!",                       vi: "Không thể nhầm được đâu!" },
      ]
    },
  ],
  quiz: [
    { question: "Câu lịch sự để hỏi đường:",                       options: ["Hey, where is the bank?", "Excuse me, where is the bank?", "Bank where?", "I want bank!"], correct: 1 },
    { question: "\"Đi thẳng\" trong tiếng Anh là:",                 options: ["Go up", "Go straight", "Go right", "Go far"], correct: 1 },
    { question: "\"Turn left\" nghĩa là:",                          options: ["Quay lại", "Rẽ phải", "Rẽ trái", "Đi thẳng"], correct: 2 },
    { question: "\"Ngã tư\" trong tiếng Anh là:",                   options: ["roundabout", "corner", "crossroads", "block"], correct: 2 },
    { question: "Để hỏi khoảng cách, dùng:",                        options: ["How long?", "How far?", "How tall?", "How big?"], correct: 1 },
    { question: "\"Đối diện\" là:",                                  options: ["next to", "behind", "opposite", "between"], correct: 2 },
    { question: "\"Bị lạc đường\" là:",                              options: ["get lost", "lost get", "lose road", "miss way"], correct: 0 },
  ]
};

export default DIRECTIONS_LESSON;
