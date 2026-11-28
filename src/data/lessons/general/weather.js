// Track: general — Unit int-u2 · Thời tiết (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const WEATHER_LESSON = {
  id: 'weather',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u2',
  title: 'Thời tiết',
  description: 'Hỏi đáp về thời tiết hằng ngày, nhiệt độ và bốn mùa trong năm',
  icon: '🌤️',
  objectives: [
    'Hỏi và mô tả thời tiết hôm nay bằng cấu trúc It is…',
    'Gọi tên bốn mùa và nói hoạt động phù hợp với từng mùa',
    'Chọn đúng tính từ và động từ khi nói về nắng, mưa, gió, tuyết',
  ],
  story: {
    npc: 'owlbert',
    introVi: 'Trên đỉnh Tháp Gió trời đổi gió liên tục. Con cùng Owlbert quan sát rồi nói đúng thời tiết hôm nay nha!',
  },

  vocabulary: [
    v('Sunny', '/ˈsʌni/', 'adjective', 'Có nắng', 'It is bright and sunny today.', 'Hôm nay trời sáng và có nắng.', '☀️'),
    v('Rainy', '/ˈreɪni/', 'adjective', 'Có mưa', 'Take an umbrella on rainy days.', 'Hãy mang ô vào những ngày mưa.', '🌧️'),
    v('Cloudy', '/ˈklaʊdi/', 'adjective', 'Nhiều mây', 'The morning sky is cloudy.', 'Bầu trời buổi sáng nhiều mây.', '☁️'),
    v('Windy', '/ˈwɪndi/', 'adjective', 'Nhiều gió', 'It is very windy near the river.', 'Gần bờ sông trời rất nhiều gió.', '💨'),
    v('Hot', '/hɑːt/', 'adjective', 'Nóng', 'Can Tho is hot in April.', 'Cần Thơ rất nóng vào tháng Tư.', '🥵'),
    v('Cold', '/koʊld/', 'adjective', 'Lạnh', 'Wear a warm jacket when it is cold.', 'Hãy mặc áo khoác ấm khi trời lạnh.', '🥶'),
    v('Warm', '/wɔːrm/', 'adjective', 'Ấm áp', 'The weather is warm in spring.', 'Thời tiết ấm áp vào mùa xuân.', '🌼'),
    v('Snow', '/snoʊ/', 'noun', 'Tuyết', 'Children love playing in white snow.', 'Trẻ em thích chơi đùa dưới tuyết trắng.', '❄️'),
    v('Spring', '/sprɪŋ/', 'noun', 'Mùa xuân', 'Flowers bloom everywhere in spring.', 'Hoa nở khắp nơi vào mùa xuân.', '🌸'),
    v('Summer', '/ˈsʌmər/', 'noun', 'Mùa hè', 'We go swimming in summer.', 'Chúng mình đi bơi vào mùa hè.', '🏖️'),
    v('Winter', '/ˈwɪntər/', 'noun', 'Mùa đông', 'Hanoi is quite cold in winter.', 'Hà Nội khá lạnh vào mùa đông.', '🧣'),
    v('Temperature', '/ˈtemprətʃər/', 'noun', 'Nhiệt độ', 'The temperature is thirty degrees today.', 'Nhiệt độ hôm nay là ba mươi độ.', '🌡️'),
  ],

  grammar: [
    {
      title: 'Hỏi và mô tả thời tiết: What\'s the weather like? / It is…',
      explanation: 'Dùng "What\'s the weather like?" để hỏi thời tiết. Trả lời bằng chủ ngữ giả "It is + tính từ" (sunny, hot, cold) hoặc "It is + V-ing" (raining, snowing) cho việc đang diễn ra.',
      examples: [
        { en: "What's the weather like today?", vi: 'Thời tiết hôm nay thế nào?' },
        { en: 'It is sunny and warm outside.', vi: 'Bên ngoài trời có nắng và ấm áp.' },
        { en: 'It is raining heavily right now.', vi: 'Ngay lúc này trời đang mưa to.' },
        { en: 'It is cloudy, so bring a raincoat.', vi: 'Trời nhiều mây, nên hãy mang áo mưa.' },
      ],
      mistakes: [
        { wrong: 'How is the weather like?', right: "What's the weather like?", note: 'Khi đã có từ "like" ở cuối câu thì dùng "What", không dùng "How".' },
        { wrong: 'Today is raining.', right: 'It is raining today.', note: 'Tiếng Anh dùng chủ ngữ giả "It" cho thời tiết, đặt "today" ở cuối câu.' },
      ],
    },
    {
      title: 'Nói về các mùa và nối lý do với so / because',
      explanation: 'Dùng giới từ "in" trước tên mùa (in spring, in summer, in winter). Dùng "so" (vì vậy) để nêu kết quả và "because" (bởi vì) để nêu lý do.',
      examples: [
        { en: 'I like spring because it is warm.', vi: 'Mình thích mùa xuân vì trời ấm áp.' },
        { en: 'It is very hot in summer.', vi: 'Mùa hè trời rất nóng.' },
        { en: 'It is cold in winter, so we wear coats.', vi: 'Mùa đông trời lạnh nên chúng mình mặc áo khoác.' },
        { en: 'We stay home because it is rainy.', vi: 'Chúng mình ở nhà vì trời mưa.' },
      ],
      mistakes: [
        { wrong: 'I go swimming on summer.', right: 'I go swimming in summer.', note: 'Trước tên mùa luôn dùng "in", không dùng "on".' },
        { wrong: 'Because it is rainy, so we stay home.', right: 'Because it is rainy, we stay home.', note: 'Tiếng Anh không dùng đồng thời cả "because" và "so" trong cùng một câu.' },
      ],
    },
  ],

  reading: {
    title: 'Kế hoạch cuối tuần của Lan và Minh',
    passage: [
      "Minh: Hi, Lan! What's the weather like in Can Tho this weekend?",
      'Lan: Saturday looks sunny and warm. The temperature is around twenty-eight degrees.',
      'Minh: Great! Let us ride our bikes in the morning before it gets hot.',
      'Lan: Good idea. Sunday may be cloudy, windy, and rainy in the afternoon.',
      'Minh: Then we can stay inside on Sunday. Which season do you like best?',
      'Lan: I love spring because flowers bloom everywhere. Summer is too hot for me.',
      'Minh: I like winter! I want to see real snow in a cold mountain town one day.',
    ].join('\n'),
    translation: [
      'Minh: Chào Lan! Cuối tuần này thời tiết ở Cần Thơ thế nào?',
      'Lan: Thứ Bảy có vẻ nắng và ấm áp. Nhiệt độ khoảng hai mươi tám độ.',
      'Minh: Tuyệt quá! Mình đạp xe vào buổi sáng trước khi trời nóng nhé.',
      'Lan: Ý hay đấy. Chủ Nhật có thể nhiều mây, nhiều gió và có mưa vào buổi chiều.',
      'Minh: Vậy Chủ Nhật chúng mình ở trong nhà. Bạn thích mùa nào nhất?',
      'Lan: Mình thích mùa xuân vì hoa nở khắp nơi. Mùa hè quá nóng với mình.',
      'Minh: Mình thích mùa đông! Mình muốn một ngày nào đó được thấy tuyết thật ở thị trấn vùng núi lạnh.',
    ].join('\n'),
    highlights: ['Sunny', 'Warm', 'Temperature', 'Hot', 'Cloudy', 'Windy', 'Rainy', 'Spring', 'Summer', 'Winter', 'Snow', 'Cold'],
    questions: [
      {
        question: 'Thời tiết ngày thứ Bảy được dự báo thế nào?',
        options: ['Mưa và lạnh', 'Âm u cả ngày', 'Nhiều gió và có tuyết', 'Nắng và ấm áp'],
        correct: 3,
        explanation: 'Lan nói: "Saturday looks sunny and warm."',
      },
      {
        question: 'Vì sao Lan và Minh định đạp xe vào sáng thứ Bảy?',
        options: ['Trước khi trời trở nên nóng', 'Để kịp giờ học', 'Vì chiều thứ Bảy có tuyết', 'Vì công viên đóng cửa sớm'],
        correct: 0,
        explanation: 'Minh nói: "Let us ride our bikes in the morning before it gets hot."',
      },
      {
        question: 'Vì sao Lan thích mùa xuân nhất?',
        options: ['Vì được đi bơi', 'Vì hoa nở khắp nơi', 'Vì có tuyết rơi', 'Vì trời rất lạnh'],
        correct: 1,
        explanation: 'Lan giải thích: "I love spring because flowers bloom everywhere."',
      },
      {
        question: 'Minh mơ ước được thấy gì vào mùa đông?',
        options: ['Bãi biển nắng vàng', 'Cầu vồng sau mưa', 'Tuyết thật ở vùng núi lạnh', 'Cơn gió mùa hè'],
        correct: 2,
        explanation: 'Minh nói: "I want to see real snow in a cold mountain town one day."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Cloudy" mô tả bầu trời thế nào?',
      options: ['Nắng gắt', 'Rất nóng', 'Có tuyết', 'Nhiều mây'],
      correct: 3,
      explanation: '"Cloudy" là tính từ nghĩa là nhiều mây.',
    },
    {
      skill: 'vocab',
      question: '"Temperature" nghĩa là gì?',
      options: ['Nhiệt độ', 'Sức gió', 'Độ ẩm', 'Lượng mưa'],
      correct: 0,
      explanation: '"Temperature" = nhiệt độ (ví dụ: 30 degrees).',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu hỏi thời tiết đúng ngữ pháp:',
      options: [
        'How is the weather like?',
        "What's the weather like?",
        'What weather is like?',
        'How weather today?',
      ],
      correct: 1,
      explanation: 'Mẫu câu chuẩn là "What\'s the weather like?" (hoặc "How is the weather?" không có "like").',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng:',
      options: [
        'Today is raining outside.',
        'The day is rain outside.',
        'It is raining outside today.',
        'Is raining today.',
      ],
      correct: 2,
      explanation: 'Mô tả trời đang mưa cần chủ ngữ giả "It": "It is raining…".',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "We go swimming ___ summer."',
      options: ['on', 'at', 'to', 'in'],
      correct: 3,
      explanation: 'Trước tên bốn mùa luôn dùng giới từ "in" (in spring, in summer…).',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu nối lý do đúng:',
      options: [
        'It is cold, so I wear a coat.',
        'Because it is cold, so I wear a coat.',
        'It is cold because I wear a coat.',
        'So it is cold, because I wear a coat.',
      ],
      correct: 0,
      explanation: 'Dùng "so" để nối nguyên nhân → kết quả, không ghép chung cả "because" và "so".',
    },
    {
      skill: 'usage',
      question: 'Bạn thấy trời rất nhiều gió ngoài bờ sông. Bạn nói:',
      options: [
        'It is snowing in summer.',
        'It is very windy near the river.',
        'I have a new umbrella.',
        'Spring is my favorite subject.',
      ],
      correct: 1,
      explanation: '"Windy" dùng để mô tả trời nhiều gió.',
    },
    {
      skill: 'listening',
      audioText: 'It is cloudy and rainy this afternoon.',
      question: 'Nghe và chọn thời tiết buổi chiều nay:',
      options: ['Nắng và nóng', 'Lạnh và có tuyết', 'Nhiều mây và có mưa', 'Ấm áp và ít gió'],
      correct: 2,
      explanation: 'Câu nghe nhắc hai tính từ "cloudy" (nhiều mây) và "rainy" (có mưa).',
    },
    {
      skill: 'listening',
      audioText: 'I love spring because it is warm.',
      question: 'Nghe và chọn lý do người nói thích mùa xuân:',
      options: ['Vì nhiệt độ rất cao', 'Vì trời rất lạnh', 'Vì có nhiều gió', 'Vì trời ấm áp'],
      correct: 3,
      explanation: '"because it is warm" = bởi vì trời ấm áp.',
    },
  ],
};

export default WEATHER_LESSON;
