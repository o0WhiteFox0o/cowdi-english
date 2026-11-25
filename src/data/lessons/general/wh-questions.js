// Track: general — Unit int-u4 · Câu hỏi Wh- cơ bản (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const WH_QUESTIONS_LESSON = {
  id: 'wh-questions',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u4',
  title: 'Câu hỏi Wh- cơ bản',
  description: 'Đặt câu hỏi thông tin chính xác với What, Where, When, Who, Why, How, Which và Whose',
  icon: '❓',
  objectives: [
    'Chọn đúng từ hỏi (What, Where, When, Who, Why, How, Which, Whose) theo thông tin cần biết',
    'Đặt câu hỏi đúng trật tự với trợ động từ do / does / is / are và tránh thiếu trợ động từ',
    'Phân biệt câu hỏi dùng "Who / What" làm chủ ngữ (không cần do/does) và cụm "How + tính từ/trạng từ"',
  ],

  vocabulary: [
    v('What', '/wʌt/', 'pronoun', 'Cái gì', 'What is your favorite hobby?', 'Sở thích yêu thích của bạn là gì?', '❓'),
    v('Where', '/wer/', 'adverb', 'Ở đâu', 'Where do you usually study?', 'Bạn thường học bài ở đâu?', '📍'),
    v('When', '/wen/', 'adverb', 'Khi nào', 'When does the club meet?', 'Khi nào câu lạc bộ họp mặt?', '📅'),
    v('Who', '/huː/', 'pronoun', 'Ai', 'Who teaches your English class?', 'Ai dạy lớp tiếng Anh của bạn?', '👤'),
    v('Why', '/waɪ/', 'adverb', 'Tại sao', 'Why do you enjoy reading?', 'Tại sao bạn thích đọc sách?', '🤷'),
    v('How', '/haʊ/', 'adverb', 'Như thế nào', 'How do you go to school?', 'Bạn đi học bằng cách nào?', '🛠️'),
    v('Which', '/wɪtʃ/', 'determiner', 'Cái nào (trong nhóm giới hạn)', 'Which subject do you prefer?', 'Bạn thích môn học nào hơn?', '👈'),
    v('Whose', '/huːz/', 'determiner', 'Của ai', 'Whose backpack is on that chair?', 'Chiếc ba lô trên ghế kia là của ai?', '🎒'),
    v('Answer', '/ˈænsər/', 'noun', 'Câu trả lời', 'Thank you for your clear answer.', 'Cảm ơn câu trả lời rõ ràng của bạn.', '💬'),
    v('Question', '/ˈkwestʃən/', 'noun', 'Câu hỏi', 'May I ask one more question?', 'Mình hỏi thêm một câu hỏi nữa được không?', '❔'),
  ],

  grammar: [
    {
      title: 'Cấu trúc chuẩn: Wh- + trợ động từ (do/does/is/are) + chủ ngữ + động từ',
      explanation: 'Với động từ thường, bắt buộc mượn trợ động từ "do" (I/you/we/they) hoặc "does" (he/she/it), và động từ chính giữ nguyên mẫu. Với "be", đảo trực tiếp "is/are" lên trước chủ ngữ.',
      examples: [
        { en: 'Where does Minh live?', vi: 'Minh sống ở đâu?' },
        { en: 'What do you do after school?', vi: 'Bạn làm gì sau giờ học?' },
        { en: 'When is our English club meeting?', vi: 'Khi nào câu lạc bộ tiếng Anh của chúng mình họp?' },
        { en: 'Why are the students smiling?', vi: 'Tại sao các bạn học sinh đang cười?' },
      ],
      mistakes: [
        { wrong: 'Where you live?', right: 'Where do you live?', note: 'Câu hỏi với động từ thường "live" bắt buộc có trợ động từ "do".' },
        { wrong: 'What does she likes?', right: 'What does she like?', note: 'Khi đã dùng "does", động từ chính "like" trở về nguyên mẫu (bỏ -s).' },
      ],
    },
    {
      title: 'Cụm "How + tính từ/trạng từ" và "Who" làm chủ ngữ',
      explanation: 'Ghép "How" để hỏi mức độ: How old (tuổi), How many (số lượng đếm được), How much (giá / không đếm được), How often (tần suất). Khi "Who" hoặc "What" làm CHỦ NGỮ, không dùng do/does và chia động từ ngôi 3 số ít.',
      examples: [
        { en: 'How many books do you read a month?', vi: 'Mỗi tháng bạn đọc bao nhiêu quyển sách?' },
        { en: 'How often do you practice English?', vi: 'Bạn luyện tiếng Anh bao lâu một lần?' },
        { en: 'Who leads the school music club?', vi: 'Ai phụ trách câu lạc bộ âm nhạc của trường?' },
        { en: 'Who knows the correct answer?', vi: 'Ai biết câu trả lời đúng?' },
      ],
      mistakes: [
        { wrong: 'Who does teach this class?', right: 'Who teaches this class?', note: 'Khi "Who" là chủ ngữ của hành động, không mượn "does" mà chia thẳng "teaches".' },
        { wrong: 'How much books do you have?', right: 'How many books do you have?', note: '"Books" là danh từ đếm được số nhiều nên phải dùng "How many".' },
      ],
    },
  ],

  reading: {
    title: 'Phỏng vấn cho bản tin câu lạc bộ tiếng Anh',
    passage: [
      'Lan: Hi, Minh! May I ask you a few questions for our club newsletter?',
      'Minh: Sure! Go ahead.',
      'Lan: First, when do you usually practice English, and where do you study?',
      'Minh: I study in the library after class. I also watch short videos at home.',
      'Lan: Which skill do you enjoy most, and why?',
      'Minh: Speaking, because I love talking with friends. Who helps you with your writing, Lan?',
      'Lan: Mr. Tom! By the way, how do you get to the club, and whose camera is that?',
      'Minh: I ride my bike, and that camera is Mai\'s. Good answer?',
    ].join('\n'),
    translation: [
      'Lan: Chào Minh! Mình hỏi bạn vài câu hỏi cho bản tin câu lạc bộ được không?',
      'Minh: Chắc chắn rồi! Bạn hỏi đi.',
      'Lan: Đầu tiên, bạn thường luyện tiếng Anh khi nào và học ở đâu?',
      'Minh: Mình học ở thư viện sau giờ học. Mình cũng xem các video ngắn ở nhà.',
      'Lan: Bạn thích kỹ năng nào nhất và tại sao?',
      'Minh: Kỹ năng nói, vì mình thích trò chuyện với bạn bè. Ai giúp bạn luyện viết thế, Lan?',
      'Lan: Thầy Tom! Nhân tiện, bạn tới câu lạc bộ bằng gì, và chiếc máy ảnh kia là của ai?',
      'Minh: Mình đạp xe, còn chiếc máy ảnh kia là của Mai. Câu trả lời ổn chứ?',
    ].join('\n'),
    highlights: ['Question', 'When', 'Where', 'Which', 'Why', 'Who', 'How', 'Whose', 'Answer'],
    questions: [
      {
        question: 'Lan phỏng vấn Minh để làm gì?',
        options: ['Để viết bản tin câu lạc bộ', 'Để làm bài kiểm tra Toán', 'Để tìm người trông mèo', 'Để mua máy ảnh mới'],
        correct: 0,
        explanation: 'Lan nói: "May I ask you a few questions for our club newsletter?"',
      },
      {
        question: 'Minh thích kỹ năng tiếng Anh nào nhất?',
        options: ['Đọc', 'Nói', 'Viết', 'Ngữ pháp'],
        correct: 1,
        explanation: 'Minh trả lời: "Speaking, because I love talking with friends."',
      },
      {
        question: 'Ai là người giúp Lan luyện kỹ năng viết?',
        options: ['Minh', 'Mai', 'Thầy Tom', 'Cô Hoa'],
        correct: 2,
        explanation: 'Khi Minh hỏi "Who helps you with your writing, Lan?", Lan đáp "Mr. Tom!".',
      },
      {
        question: 'Chiếc máy ảnh mà Lan hỏi là của ai?',
        options: ['Của Minh', 'Của câu lạc bộ', 'Của thầy Tom', 'Của Mai'],
        correct: 3,
        explanation: 'Minh trả lời: "and that camera is Mai\'s."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Bạn muốn hỏi chiếc ô này là của ai. Từ hỏi đúng là:',
      options: ['Whose', 'Who', 'Which', 'Where'],
      correct: 0,
      explanation: '"Whose + danh từ" dùng để hỏi quyền sở hữu (của ai).',
    },
    {
      skill: 'vocab',
      question: 'Bạn muốn hỏi lý do bạn mình đến muộn. Dùng từ hỏi nào?',
      options: ['When', 'Why', 'Where', 'Which'],
      correct: 1,
      explanation: '"Why" dùng để hỏi lý do (tại sao).',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu hỏi đúng ngữ pháp:',
      options: [
        'Where you live?',
        'Where are you live?',
        'Where do you live?',
        'Where does you live?',
      ],
      correct: 2,
      explanation: 'Với động từ thường "live" và chủ ngữ "you", cần trợ động từ "do": "Where do you live?".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu hỏi đúng khi "Who" làm chủ ngữ:',
      options: [
        'Who does live in that yellow house?',
        'Who live does in that yellow house?',
        'Who is live in that yellow house?',
        'Who lives in that yellow house?',
      ],
      correct: 3,
      explanation: 'Khi "Who" là chủ ngữ, không dùng trợ động từ mà chia động từ số ít "lives".',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "___ books do you read every month?"',
      options: ['How many', 'How much', 'How old', 'How long'],
      correct: 0,
      explanation: '"Books" là danh từ đếm được số nhiều nên dùng "How many".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu hỏi đúng với "does":',
      options: [
        'What does Lan likes?',
        'What does Lan like?',
        'What do Lan like?',
        'What is Lan like doing?',
      ],
      correct: 1,
      explanation: 'Sau "does", động từ chính "like" ở dạng nguyên mẫu.',
    },
    {
      skill: 'usage',
      question: 'Có 2 cây bút xanh và đỏ trên bàn. Bạn muốn hỏi bạn mình chọn cây nào. Bạn hỏi:',
      options: [
        'Who pen do you want?',
        'Where pen do you want?',
        'Which pen do you want?',
        'When pen do you want?',
      ],
      correct: 2,
      explanation: '"Which" dùng khi lựa chọn trong một nhóm nhỏ xác định.',
    },
    {
      skill: 'listening',
      audioText: 'When does the English club meet?',
      question: 'Nghe và chọn thông tin người nói đang hỏi:',
      options: ['Địa điểm họp câu lạc bộ', 'Chi phí tham gia', 'Người phụ trách câu lạc bộ', 'Thời gian họp câu lạc bộ'],
      correct: 3,
      explanation: 'Câu hỏi bắt đầu bằng "When" (khi nào) để hỏi thời gian.',
    },
    {
      skill: 'listening',
      audioText: 'How often do you visit the library?',
      question: 'Nghe và chọn câu trả lời phù hợp nhất:',
      options: ['Twice a week.', 'Next to my school.', 'Because it is quiet.', 'It is Mr. Tom\'s.'],
      correct: 0,
      explanation: '"How often…?" hỏi tần suất → đáp bằng "Twice a week." (hai lần một tuần).',
    },
  ],
};

export default WH_QUESTIONS_LESSON;
