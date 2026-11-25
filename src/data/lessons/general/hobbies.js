// Track: general — Unit int-u3 · Sở thích (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const HOBBIES_LESSON = {
  id: 'hobbies',
  contentVersion: 2,
  track: 'general',
  level: 'intermediate',
  cefrLevel: 'A2',
  unit: 'int-u3',
  title: 'Sở thích',
  description: 'Chia sẻ sở thích, thói quen cuối tuần và cấu trúc nói về điều yêu thích',
  icon: '🎸',
  objectives: [
    'Gọi tên 20 sở thích và hoạt động giải trí trong nhà lẫn ngoài trời',
    'Dùng đúng cấu trúc like / enjoy / love + V-ing và be good at + V-ing',
    'Hỏi và trả lời về tần suất thực hiện sở thích hằng tuần',
  ],

  vocabulary: [
    v('Reading', '/ˈriːdɪŋ/', 'noun', 'Đọc sách', 'Reading before bed helps me relax.', 'Đọc sách trước khi ngủ giúp mình thư giãn.', '📖'),
    v('Cooking', '/ˈkʊkɪŋ/', 'noun', 'Nấu ăn', 'I enjoy cooking dinner with Mom.', 'Mình thích nấu bữa tối cùng mẹ.', '🍳'),
    v('Swimming', '/ˈswɪmɪŋ/', 'noun', 'Bơi lội', 'Swimming keeps your body strong.', 'Bơi lội giúp cơ thể bạn khoẻ mạnh.', '🏊'),
    v('Playing', '/ˈpleɪɪŋ/', 'verb', 'Chơi (nhạc cụ, thể thao)', 'Minh likes playing the guitar.', 'Minh thích chơi đàn guitar.', '🎸'),
    v('Drawing', '/ˈdrɔːɪŋ/', 'noun', 'Vẽ nét', 'Lan is very good at drawing.', 'Lan rất giỏi vẽ nét.', '🎨'),
    v('Singing', '/ˈsɪŋɪŋ/', 'noun', 'Ca hát', 'Mai loves singing cheerful folk songs.', 'Mai thích hát những bài dân ca vui tươi.', '🎤'),
    v('Dancing', '/ˈdænsɪŋ/', 'noun', 'Nhảy múa', 'Dancing with friends is great exercise.', 'Nhảy múa cùng bạn bè là bài tập rất tốt.', '💃'),
    v('Traveling', '/ˈtrævəlɪŋ/', 'noun', 'Du lịch', 'Our family enjoys traveling every summer.', 'Gia đình mình thích đi du lịch mỗi mùa hè.', '✈️'),
    v('Photography', '/fəˈtɑːɡrəfi/', 'noun', 'Nhiếp ảnh', 'Photography teaches you to notice details.', 'Nhiếp ảnh dạy bạn chú ý đến từng chi tiết.', '📷'),
    v('Gardening', '/ˈɡɑːrdənɪŋ/', 'noun', 'Làm vườn', 'Gardening makes our yard look green.', 'Làm vườn giúp sân nhà mình thêm xanh mát.', '🌱'),
    v('Hiking', '/ˈhaɪkɪŋ/', 'noun', 'Đi bộ leo núi', 'They go hiking in the hills.', 'Họ đi bộ đường dài trên những ngọn đồi.', '🥾'),
    v('Camping', '/ˈkæmpɪŋ/', 'noun', 'Cắm trại', 'Camping under the stars feels peaceful.', 'Cắm trại dưới bầu trời sao thật yên bình.', '⛺'),
    v('Fishing', '/ˈfɪʃɪŋ/', 'noun', 'Câu cá', 'My grandfather enjoys fishing by the river.', 'Ông nội mình thích câu cá bên sông.', '🎣'),
    v('Painting', '/ˈpeɪntɪŋ/', 'noun', 'Vẽ tranh màu', 'She spends Sunday afternoon painting landscapes.', 'Bạn ấy dành chiều Chủ Nhật để vẽ tranh phong cảnh.', '🖼️'),
    v('Knitting', '/ˈnɪtɪŋ/', 'noun', 'Đan len', 'Grandma enjoys knitting warm wool scarves.', 'Bà nội thích đan những chiếc khăn len ấm.', '🧶'),
    v('Yoga', '/ˈjoʊɡə/', 'noun', 'Tập yoga', 'My aunt practices yoga every morning.', 'Cô mình tập yoga mỗi buổi sáng.', '🧘‍♀️'),
    v('Cycling', '/ˈsaɪklɪŋ/', 'noun', 'Đạp xe', 'Cycling along the park is refreshing.', 'Đạp xe dọc công viên thật sảng khoái.', '🚴'),
    v('Collecting', '/kəˈlektɪŋ/', 'noun', 'Sưu tầm', 'He enjoys collecting old postcards.', 'Bạn ấy thích sưu tầm bưu thiếp cũ.', '📬'),
    v('Chess', '/tʃes/', 'noun', 'Cờ vua', 'Playing chess sharpens your thinking.', 'Chơi cờ vua rèn luyện tư duy rất tốt.', '♟️'),
    v('Skateboarding', '/ˈskeɪtbɔːrdɪŋ/', 'noun', 'Trượt ván', 'Skateboarding requires balance and practice.', 'Trượt ván đòi hỏi giữ thăng bằng và luyện tập.', '🛹'),
  ],

  grammar: [
    {
      title: 'Nói về sở thích: like / love / enjoy / hate + V-ing',
      explanation: 'Sau các động từ chỉ cảm nhận (enjoy, love, like, hate) ta dùng động từ đuôi "-ing" (danh động từ). Lưu ý: sau "enjoy" chỉ dùng V-ing, không dùng "to V".',
      examples: [
        { en: 'I enjoy cooking Vietnamese dishes.', vi: 'Mình thích nấu các món ăn Việt Nam.' },
        { en: 'Minh loves playing chess after school.', vi: 'Minh thích chơi cờ vua sau giờ học.' },
        { en: 'They like cycling around the lake.', vi: 'Họ thích đạp xe quanh hồ.' },
        { en: 'My grandfather enjoys fishing on Sundays.', vi: 'Ông nội mình thích câu cá vào Chủ Nhật.' },
      ],
      mistakes: [
        { wrong: 'I enjoy to cook with my mom.', right: 'I enjoy cooking with my mom.', note: 'Động từ "enjoy" luôn đi với V-ing, không đi với "to V".' },
        { wrong: 'She likes read books at night.', right: 'She likes reading books at night.', note: 'Sau "likes" cần chia thành "reading" (hoặc "to read"), không để nguyên mẫu "read".' },
      ],
    },
    {
      title: 'Nói về thế mạnh và tần suất: be good at + V-ing & How often…?',
      explanation: 'Dùng "be good at + V-ing / danh từ" để nói giỏi việc gì. Dùng "How often do you…?" để hỏi tần suất và trả lời bằng "every weekend", "twice a week", "on Sundays".',
      examples: [
        { en: 'Lan is good at drawing and painting.', vi: 'Lan rất giỏi vẽ nét và vẽ tranh màu.' },
        { en: 'How often do you go swimming?', vi: 'Bạn đi bơi thường xuyên thế nào?' },
        { en: 'I practice yoga three times a week.', vi: 'Mình tập yoga ba lần một tuần.' },
        { en: 'Are you good at playing chess?', vi: 'Bạn có giỏi chơi cờ vua không?' },
      ],
      mistakes: [
        { wrong: 'She is good in drawing.', right: 'She is good at drawing.', note: 'Cấu trúc đúng là "good at + V-ing / danh từ", không dùng "in".' },
        { wrong: 'She is good at draw.', right: 'She is good at drawing.', note: 'Sau giới từ "at", động từ phải thêm "-ing".' },
      ],
    },
  ],

  reading: {
    title: 'Ngày hội câu lạc bộ cuối tuần',
    passage: [
      'Ms. Hoa: Welcome to our weekend club fair! What hobbies do you enjoy, Lan?',
      'Lan: I love reading, drawing, and painting. I also enjoy photography when my family goes traveling.',
      'Minh: That sounds creative! I like playing chess, cycling, and swimming. On holidays, my uncle takes me fishing and camping.',
      'Ms. Hoa: How often do you practice your hobbies?',
      'Lan: I draw twice a week, and on Sunday mornings I help my mom with cooking and gardening.',
      'Minh: My little sister Mai loves singing and dancing, while my grandma enjoys knitting and yoga!',
    ].join('\n'),
    translation: [
      'Cô Hoa: Chào mừng các em đến ngày hội câu lạc bộ cuối tuần! Lan thích những sở thích nào?',
      'Lan: Em thích đọc sách, vẽ nét và vẽ tranh màu ạ. Em cũng thích nhiếp ảnh khi gia đình đi du lịch.',
      'Minh: Nghe sáng tạo thật! Mình thích chơi cờ vua, đạp xe và bơi lội. Dịp nghỉ lễ, chú mình dẫn mình đi câu cá và cắm trại.',
      'Cô Hoa: Các em dành thời gian cho sở thích bao lâu một lần?',
      'Lan: Em vẽ hai lần một tuần, còn sáng Chủ Nhật em phụ mẹ nấu ăn và làm vườn.',
      'Minh: Em gái Mai của em thích hát và nhảy, còn bà nội em thích đan len và tập yoga ạ!',
    ].join('\n'),
    highlights: ['Reading', 'Drawing', 'Painting', 'Photography', 'Traveling', 'Playing', 'Chess', 'Cycling', 'Swimming', 'Fishing', 'Camping', 'Cooking', 'Gardening', 'Singing', 'Dancing', 'Knitting', 'Yoga'],
    questions: [
      {
        question: 'Lan thường chụp ảnh (photography) vào dịp nào?',
        options: ['Mỗi sáng trước khi đi học', 'Trong giờ thể dục', 'Khi đi câu cá với chú', 'Khi gia đình đi du lịch'],
        correct: 3,
        explanation: 'Lan nói: "I also enjoy photography when my family goes traveling."',
      },
      {
        question: 'Vào các dịp nghỉ lễ, chú của Minh thường dẫn Minh đi làm gì?',
        options: ['Câu cá và cắm trại', 'Đạp xe và trượt ván', 'Đan len và làm vườn', 'Chơi cờ vua và nấu ăn'],
        correct: 0,
        explanation: 'Minh kể: "On holidays, my uncle takes me fishing and camping."',
      },
      {
        question: 'Sáng Chủ Nhật Lan thường làm gì cùng mẹ?',
        options: ['Đi bơi và đi bộ leo núi', 'Nấu ăn và làm vườn', 'Hát và nhảy múa', 'Tập yoga ở công viên'],
        correct: 1,
        explanation: 'Lan nói: "on Sunday mornings I help my mom with cooking and gardening."',
      },
      {
        question: 'Bà nội của Minh thích hai hoạt động nào?',
        options: ['Đọc sách và nhiếp ảnh', 'Bơi lội và đạp xe', 'Đan len và tập yoga', 'Hát và nhảy múa'],
        correct: 2,
        explanation: 'Minh kể: "my grandma enjoys knitting and yoga!"',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Photography" là sở thích nào?',
      options: ['Làm vườn', 'Trượt ván', 'Đan len', 'Nhiếp ảnh'],
      correct: 3,
      explanation: '"Photography" = nhiếp ảnh (chụp ảnh).',
    },
    {
      skill: 'vocab',
      question: 'Hoạt động đi bộ đường dài qua đồi núi trong thiên nhiên gọi là:',
      options: ['Hiking', 'Knitting', 'Cooking', 'Chess'],
      correct: 0,
      explanation: '"Hiking" nghĩa là đi bộ đường dài / leo núi nhẹ.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng:',
      options: [
        'I enjoy to cook dinner.',
        'I enjoy cooking dinner.',
        'I enjoy cook dinner.',
        'I enjoying cook dinner.',
      ],
      correct: 1,
      explanation: 'Sau "enjoy" bắt buộc dùng V-ing: "enjoy cooking".',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "Lan is very good ___ drawing."',
      options: ['in', 'on', 'at', 'for'],
      correct: 2,
      explanation: 'Cụm từ chuẩn là "be good at + V-ing / danh từ".',
    },
    {
      skill: 'grammar',
      question: 'Điền dạng đúng của động từ: "Minh is good at ___ chess."',
      options: ['play', 'plays', 'played', 'playing'],
      correct: 3,
      explanation: 'Sau giới từ "at", động từ phải chia ở dạng V-ing: "playing".',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn hỏi bạn mình bao lâu thì đi bơi một lần. Bạn hỏi:',
      options: [
        'How often do you go swimming?',
        'How many do you go swimming?',
        'What color is swimming?',
        'Where are you swimming at?',
      ],
      correct: 0,
      explanation: '"How often do you…?" dùng để hỏi tần suất thực hiện một hoạt động.',
    },
    {
      skill: 'listening',
      audioText: 'My grandfather enjoys fishing by the river.',
      question: 'Nghe và chọn sở thích của ông nội:',
      options: ['Làm vườn', 'Câu cá bên sông', 'Cắm trại trong rừng', 'Sưu tầm tem'],
      correct: 1,
      explanation: '"enjoys fishing by the river" = thích câu cá bên sông.',
    },
    {
      skill: 'listening',
      audioText: 'I go cycling in the park every weekend.',
      question: 'Nghe và chọn tần suất người nói đi đạp xe:',
      options: ['Mỗi sáng sớm', 'Mỗi tháng một lần', 'Mỗi cuối tuần', 'Chỉ vào mùa hè'],
      correct: 2,
      explanation: '"every weekend" = mỗi cuối tuần.',
    },
    {
      skill: 'vocab',
      question: '"Collecting" nghĩa là gì?',
      options: ['Đạp xe', 'Bơi lội', 'Cắm trại', 'Sưu tầm'],
      correct: 3,
      explanation: '"Collecting" = sưu tầm (như sưu tầm tem, bưu thiếp).',
    },
  ],
};

export default HOBBIES_LESSON;
