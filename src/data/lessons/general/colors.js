// Track: general — Unit int-u1: Làm quen · Bài 3: Màu sắc (v2)
// Soạn theo docs/05-implementation/content/briefs/int-u1.md và STD-LESSON-CONTENT-v1.0.

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const COLORS_LESSON = {
  id: 'colors',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u1',
  title: 'Màu sắc',
  description: 'Nói màu sắc của đồ vật, hỏi màu và chia sẻ màu yêu thích khi mua sắm',
  icon: '🎨',
  objectives: [
    'Gọi tên 12 màu sắc cơ bản trong tiếng Anh',
    'Mô tả màu của đồ vật với "It is + màu" và "a + màu + danh từ"',
    'Hỏi và trả lời về màu yêu thích bằng "What color do you like?"',
  ],
  story: {
    npc: 'lan',
    introVi: 'Sương sớm che mất màu cờ trên bến đò rồi. Con giúp Lan gọi đúng tên các màu sắc nhé!',
  },

  vocabulary: [
    v('Red', '/red/', 'adjective', 'Màu đỏ', 'This apple is bright red.', 'Quả táo này có màu đỏ tươi.', '🔴'),
    v('Blue', '/bluː/', 'adjective', 'Màu xanh dương', 'The morning sky is blue.', 'Bầu trời buổi sáng có màu xanh dương.', '🔵'),
    v('Green', '/ɡriːn/', 'adjective', 'Màu xanh lá', 'Minh has a green backpack.', 'Minh có một chiếc ba lô xanh lá.', '🟢'),
    v('Yellow', '/ˈjeloʊ/', 'adjective', 'Màu vàng', 'The warm sun is yellow.', 'Mặt trời ấm áp có màu vàng.', '🟡'),
    v('White', '/waɪt/', 'adjective', 'Màu trắng', 'Lan wears a white shirt.', 'Lan mặc một chiếc áo sơ mi trắng.', '⚪'),
    v('Black', '/blæk/', 'adjective', 'Màu đen', 'My school shoes are black.', 'Đôi giày đi học của mình màu đen.', '⚫'),
    v('Orange', '/ˈɔːrɪndʒ/', 'adjective', 'Màu cam', 'She drinks fresh orange juice.', 'Bạn ấy uống nước cam tươi.', '🟠'),
    v('Purple', '/ˈpɜːrpl/', 'adjective', 'Màu tím', 'Mai likes that purple hat.', 'Mai thích chiếc mũ màu tím đó.', '🟣'),
    v('Pink', '/pɪŋk/', 'adjective', 'Màu hồng', 'Lan chooses a pink shirt.', 'Lan chọn một chiếc áo màu hồng.', '🩷'),
    v('Brown', '/braʊn/', 'adjective', 'Màu nâu', 'Cowdi has white and brown spots.', 'Cowdi có đốm màu trắng và nâu.', '🟤'),
    v('Gray', '/ɡreɪ/', 'adjective', 'Màu xám', 'The rainy clouds are gray.', 'Những đám mây mưa có màu xám.', '🩶'),
    v('Color', '/ˈkʌlər/', 'noun', 'Màu sắc', 'What is your favorite color?', 'Màu sắc yêu thích của bạn là gì?', '🎨'),
  ],

  grammar: [
    {
      title: 'Nói màu sắc của đồ vật: It is + màu / a + màu + danh từ',
      explanation: 'Từ chỉ màu sắc có thể đứng sau "is / are" (The shirt is blue) hoặc đứng TRƯỚC danh từ (a blue shirt) — ngược vị trí so với tiếng Việt.',
      examples: [
        { en: 'It is a red shirt.', vi: 'Đó là một chiếc áo màu đỏ.' },
        { en: 'The shirt is red.', vi: 'Chiếc áo có màu đỏ.' },
        { en: 'I have a green bag.', vi: 'Mình có một chiếc túi màu xanh lá.' },
        { en: 'These shoes are white and black.', vi: 'Đôi giày này màu trắng và đen.' },
      ],
      mistakes: [
        { wrong: 'It is a shirt red.', right: 'It is a red shirt.', note: 'Trong tiếng Anh, tính từ màu sắc đứng TRƯỚC danh từ.' },
      ],
    },
    {
      title: 'Hỏi màu và màu yêu thích: What color is…? / What color do you like?',
      explanation: 'Hỏi màu của một vật: "What color is + vật?". Hỏi màu yêu thích: "What color do you like?" hoặc "What is your favorite color?" và trả lời "My favorite color is…".',
      examples: [
        { en: 'What color is your bag?', vi: 'Chiếc túi của bạn màu gì?' },
        { en: 'What color do you like?', vi: 'Bạn thích màu gì?' },
        { en: 'My favorite color is blue.', vi: 'Màu yêu thích của mình là xanh dương.' },
        { en: 'Mai likes pink and yellow.', vi: 'Mai thích màu hồng và màu vàng.' },
      ],
      mistakes: [
        { wrong: 'What color you like?', right: 'What color do you like?', note: 'Câu hỏi với động từ thường "like" bắt buộc phải có trợ động từ "do" (hoặc "does" với he/she).' },
        { wrong: 'My color favorite is green.', right: 'My favorite color is green.', note: '"favorite" là tính từ nên đứng trước "color".' },
      ],
    },
  ],

  reading: {
    title: 'Chọn áo ở chợ',
    passage: [
      'Lan: Look at these shirts in the market, Minh! What color do you like?',
      'Minh: My favorite color is blue. That blue shirt looks cool!',
      'Lan: Yes, and this white shirt is nice, too. What about Mai?',
      'Minh: Mai loves pink and purple. Let us check that yellow dress or the pink T-shirt.',
      'Lan: The pink one is very cute! I want a green cap and a brown bag for school.',
      'Minh: Look, there is a red hat and a black bag over there.',
      'Lan: Great! Today we see every color in the market.',
    ].join('\n'),
    translation: [
      'Lan: Nhìn mấy chiếc áo ở chợ này, Minh! Bạn thích màu gì?',
      'Minh: Màu yêu thích của mình là xanh dương. Chiếc áo xanh dương kia trông ngầu lắm!',
      'Lan: Ừ, chiếc áo trắng này cũng đẹp nữa. Còn Mai thì sao?',
      'Minh: Mai thích màu hồng và tím. Mình xem thử chiếc váy vàng hoặc áo phông hồng kia đi.',
      'Lan: Chiếc áo hồng dễ thương quá! Mình muốn một chiếc mũ xanh lá và túi nâu để đi học.',
      'Minh: Nhìn kìa, đằng kia có chiếc mũ đỏ và cái túi đen nữa.',
      'Lan: Tuyệt quá! Hôm nay tụi mình thấy đủ mọi màu sắc ngoài chợ luôn.',
    ].join('\n'),
    highlights: ['color', 'blue', 'white', 'pink', 'purple', 'yellow', 'green', 'brown', 'red', 'black'],
    questions: [
      {
        question: 'Lan và Minh đang chọn áo ở đâu?',
        options: ['Ở lớp học', 'Ở chợ', 'Ở thư viện', 'Ở nhà Minh'],
        correct: 1,
        explanation: 'Lan nói "Look at these shirts in the market, Minh!" — hai bạn đang ở chợ.',
      },
      {
        question: 'Màu yêu thích của Minh là màu nào?',
        options: ['Đỏ', 'Xanh lá', 'Xanh dương', 'Nâu'],
        correct: 2,
        explanation: 'Minh trả lời "My favorite color is blue."',
      },
      {
        question: 'Em gái Minh (Mai) thích hai màu nào?',
        options: ['Xám và nâu', 'Trắng và đen', 'Vàng và cam', 'Hồng và tím'],
        correct: 3,
        explanation: 'Minh cho biết "Mai loves pink and purple."',
      },
      {
        question: 'Lan muốn mua gì để đi học?',
        options: ['Mũ xanh lá và túi màu nâu', 'Mũ đỏ và váy vàng', 'Áo sơ mi trắng', 'Túi màu đen'],
        correct: 0,
        explanation: 'Lan nói "I want a green cap and a brown bag for school."',
      },
    ],
  },

  quiz: [
    {
      skill: 'grammar',
      question: 'Câu hỏi nào ĐÚNG ngữ pháp khi hỏi màu yêu thích?',
      options: ['What color you like?', 'What color do you like?', 'What color are you like?', 'You like what color?'],
      correct: 1,
      explanation: 'Với động từ thường "like", câu hỏi phải mượn trợ động từ "do": What color do you like?',
    },
    {
      skill: 'grammar',
      question: 'Chọn cụm từ ĐÚNG cho "một chiếc túi màu xanh lá":',
      options: ['a bag green', 'green a bag', 'a green bag', 'bag is green a'],
      correct: 2,
      explanation: 'Tính từ màu sắc "green" phải đứng trước danh từ "bag".',
    },
    {
      skill: 'vocab',
      question: '"The sky is ___" (màu xanh dương):',
      options: ['red', 'yellow', 'green', 'blue'],
      correct: 3,
      explanation: '"blue" là màu xanh dương; "green" là màu xanh lá.',
    },
    {
      skill: 'vocab',
      question: '"Purple" nghĩa là màu gì?',
      options: ['Tím', 'Cam', 'Hồng', 'Xám'],
      correct: 0,
      explanation: '"Purple" = màu tím; "Orange" = cam; "Pink" = hồng; "Gray" = xám.',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn nói màu yêu thích của mình là màu vàng. Câu nào tự nhiên nhất?',
      options: ['My color favorite is yellow.', 'My favorite color is yellow.', 'I favorite yellow color.', 'Yellow is favorite my.'],
      correct: 1,
      explanation: 'Mẫu câu chuẩn là "My favorite color is + tên màu".',
    },
    {
      skill: 'listening',
      audioText: 'My favorite color is blue.',
      question: 'Nghe và chọn màu được nhắc tới:',
      options: ['Màu nâu', 'Màu xanh lá', 'Màu xanh dương', 'Màu đen'],
      correct: 2,
      explanation: 'Câu nghe là "My favorite color is blue." → màu xanh dương.',
    },
    {
      skill: 'listening',
      audioText: 'Lan chooses a pink shirt.',
      question: 'Nghe và chọn đáp án đúng:',
      options: ['Lan chọn áo màu tím', 'Lan chọn áo màu trắng', 'Lan chọn túi màu hồng', 'Lan chọn áo màu hồng'],
      correct: 3,
      explanation: '"a pink shirt" nghĩa là một chiếc áo màu hồng.',
    },
    {
      skill: 'vocab',
      question: '"Gray" là màu gì?',
      options: ['Màu xám', 'Màu nâu', 'Màu đen', 'Màu cam'],
      correct: 0,
      explanation: '"Gray" (Anh-Mỹ) = màu xám.',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "What color ___ your shoes?"',
      options: ['is', 'are', 'am', 'do'],
      correct: 1,
      explanation: '"your shoes" (đôi giày) là danh từ số nhiều nên dùng "are".',
    },
  ],
};

export default COLORS_LESSON;
