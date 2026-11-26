// Track: general — Unit int-u2 · Nghề nghiệp (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const JOBS_LESSON = {
  id: 'jobs',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u2',
  title: 'Nghề nghiệp',
  description: 'Hỏi nghề nghiệp, giới thiệu công việc của người thân và ước mơ tương lai',
  icon: '👨‍💼',
  objectives: [
    'Gọi tên các nghề nghiệp quen thuộc và công việc chính của từng nghề',
    'Dùng đúng mạo từ a / an trước danh từ chỉ nghề nghiệp',
    'Mô tả việc một người làm hằng ngày bằng động từ thì hiện tại đơn',
  ],

  vocabulary: [
    v('Doctor', '/ˈdɑːktər/', 'noun', 'Bác sĩ', 'A doctor helps sick people get well.', 'Bác sĩ giúp người bệnh khoẻ lại.', '👨‍⚕️'),
    v('Nurse', '/nɜːrs/', 'noun', 'Y tá, điều dưỡng', 'My aunt is a kind nurse.', 'Cô của mình là một y tá tốt bụng.', '👩‍⚕️'),
    v('Engineer', '/ˌendʒɪˈnɪr/', 'noun', 'Kỹ sư', 'Lan wants to be an engineer.', 'Lan muốn trở thành một kỹ sư.', '👷'),
    v('Police', '/pəˈliːs/', 'noun', 'Cảnh sát', 'The police officer keeps our street safe.', 'Chú cảnh sát giữ cho khu phố an toàn.', '👮'),
    v('Chef', '/ʃef/', 'noun', 'Đầu bếp', 'That chef cooks tasty Vietnamese noodles.', 'Người đầu bếp đó nấu phở và mì Việt rất ngon.', '👨‍🍳'),
    v('Driver', '/ˈdraɪvər/', 'noun', 'Tài xế', 'Our school bus driver is very friendly.', 'Chú tài xế xe buýt trường rất thân thiện.', '🚌'),
    v('Farmer', '/ˈfɑːrmər/', 'noun', 'Nông dân', 'A farmer grows rice and fresh fruit.', 'Người nông dân trồng lúa và trái cây tươi.', '👨‍🌾'),
    v('Artist', '/ˈɑːrtɪst/', 'noun', 'Họa sĩ, nghệ sĩ', 'She is an artist who paints landscapes.', 'Cô ấy là một họa sĩ chuyên vẽ phong cảnh.', '🎨'),
    v('Firefighter', '/ˈfaɪərˌfaɪtər/', 'noun', 'Lính cứu hỏa', 'A firefighter is brave and strong.', 'Lính cứu hỏa rất dũng cảm và mạnh mẽ.', '🧑‍🚒'),
    v('Pilot', '/ˈpaɪlət/', 'noun', 'Phi công', 'The pilot flies planes across the country.', 'Phi công lái máy bay đi khắp đất nước.', '👨‍✈️'),
    v('Hospital', '/ˈhɑːspɪtəl/', 'noun', 'Bệnh viện', 'Doctors and nurses work in a hospital.', 'Bác sĩ và y tá làm việc ở bệnh viện.', '🏥'),
    v('Office', '/ˈɔːfɪs/', 'noun', 'Văn phòng', 'My dad works in a small office.', 'Bố mình làm việc trong một văn phòng nhỏ.', '🏢'),
  ],

  grammar: [
    {
      title: 'Dùng a / an khi nói nghề nghiệp',
      explanation: 'Khi nói nghề nghiệp của một người, tiếng Anh luôn cần mạo từ "a" hoặc "an": dùng "an" trước từ bắt đầu bằng âm nguyên âm (an engineer, an artist), dùng "a" trước phụ âm (a doctor, a chef). Hỏi nghề bằng "What do you do?" hoặc "What does he/she do?".',
      examples: [
        { en: 'My mother is a doctor.', vi: 'Mẹ mình là bác sĩ.' },
        { en: 'My father is an engineer.', vi: 'Bố mình là kỹ sư.' },
        { en: 'What does your sister do?', vi: 'Chị gái bạn làm nghề gì?' },
        { en: 'She is an artist in Ho Chi Minh City.', vi: 'Chị ấy là họa sĩ ở Thành phố Hồ Chí Minh.' },
      ],
      mistakes: [
        { wrong: 'My uncle is farmer.', right: 'My uncle is a farmer.', note: 'Trước danh từ nghề nghiệp số ít bắt buộc phải có "a" hoặc "an".' },
        { wrong: 'She is a engineer.', right: 'She is an engineer.', note: '"Engineer" bắt đầu bằng nguyên âm /e/ nên dùng "an", không dùng "a".' },
      ],
    },
    {
      title: 'Mô tả công việc hằng ngày với động từ thêm -s / -es',
      explanation: 'Với chủ ngữ số ít (a doctor, a chef, he, she), động từ ở thì hiện tại đơn thêm "-s" (cooks, works, grows) hoặc "-es" / "-ies" (teaches, flies).',
      examples: [
        { en: 'A chef cooks meals in a restaurant.', vi: 'Đầu bếp nấu ăn trong nhà hàng.' },
        { en: 'A farmer grows rice in the fields.', vi: 'Nông dân trồng lúa trên cánh đồng.' },
        { en: 'A pilot flies large airplanes.', vi: 'Phi công lái những chiếc máy bay lớn.' },
        { en: 'A nurse works in a busy hospital.', vi: 'Y tá làm việc trong một bệnh viện bận rộn.' },
      ],
      mistakes: [
        { wrong: 'The chef cook good food.', right: 'The chef cooks good food.', note: 'Chủ ngữ số ít "The chef" cần thêm "-s" vào động từ: "cooks".' },
        { wrong: 'A pilot flys planes.', right: 'A pilot flies planes.', note: 'Động từ tận cùng phụ âm + "y" đổi thành "-ies": fly → flies.' },
      ],
    },
  ],

  reading: {
    title: 'Ước mơ nghề nghiệp của lớp mình',
    passage: [
      'Lan: Hi, Minh! What does your father do?',
      'Minh: He is an engineer. He works in an office. My mother is a nurse at the city hospital.',
      'Lan: That is wonderful. My parents are farmers. A farmer grows rice and mangoes near Can Tho.',
      'Minh: My uncle is a chef, and my older brother is a bus driver.',
      'Lan: What do you want to be in the future?',
      'Minh: I want to be a pilot or a brave firefighter. How about you, Lan?',
      'Lan: I want to be a doctor, or maybe an artist, because I love helping people and drawing.',
    ].join('\n'),
    translation: [
      'Lan: Chào Minh! Bố bạn làm nghề gì vậy?',
      'Minh: Bố mình là kỹ sư. Bố làm việc ở văn phòng. Mẹ mình là y tá ở bệnh viện thành phố.',
      'Lan: Tuyệt quá. Bố mẹ mình là nông dân. Nông dân trồng lúa và xoài gần Cần Thơ.',
      'Minh: Chú mình là đầu bếp, còn anh trai mình là tài xế xe buýt.',
      'Lan: Tương lai bạn muốn làm nghề gì?',
      'Minh: Mình muốn làm phi công hoặc lính cứu hỏa dũng cảm. Còn bạn thì sao, Lan?',
      'Lan: Mình muốn làm bác sĩ, hoặc có thể là họa sĩ, vì mình thích giúp mọi người và thích vẽ.',
    ].join('\n'),
    highlights: ['Engineer', 'Office', 'Nurse', 'Hospital', 'Farmer', 'Chef', 'Driver', 'Pilot', 'Firefighter', 'Doctor', 'Artist'],
    questions: [
      {
        question: 'Mẹ của Minh làm việc ở đâu?',
        options: ['Ở văn phòng', 'Ở nhà hàng', 'Ở sân bay', 'Ở bệnh viện thành phố'],
        correct: 3,
        explanation: 'Minh nói: "My mother is a nurse at the city hospital."',
      },
      {
        question: 'Bố mẹ của Lan trồng gì gần Cần Thơ?',
        options: ['Lúa và xoài', 'Hoa và trà', 'Cà phê và tiêu', 'Táo và nho'],
        correct: 0,
        explanation: 'Lan kể: "A farmer grows rice and mangoes near Can Tho."',
      },
      {
        question: 'Chú của Minh làm nghề gì?',
        options: ['Tài xế xe buýt', 'Đầu bếp', 'Kỹ sư', 'Cảnh sát'],
        correct: 1,
        explanation: 'Minh nói: "My uncle is a chef, and my older brother is a bus driver."',
      },
      {
        question: 'Vì sao Lan muốn trở thành bác sĩ hoặc họa sĩ?',
        options: [
          'Vì thích lái máy bay đi xa',
          'Vì muốn làm việc ở văn phòng',
          'Vì thích giúp người và thích vẽ',
          'Vì thích nấu các món ăn Việt',
        ],
        correct: 2,
        explanation: 'Lan giải thích: "because I love helping people and drawing."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Ai làm việc ở bệnh viện để chăm sóc bệnh nhân cùng bác sĩ?',
      options: ['Chef', 'Farmer', 'Pilot', 'Nurse'],
      correct: 3,
      explanation: '"Nurse" (y tá / điều dưỡng) chăm sóc bệnh nhân tại bệnh viện.',
    },
    {
      skill: 'vocab',
      question: '"Firefighter" nghĩa là nghề gì?',
      options: ['Lính cứu hỏa', 'Cảnh sát giao thông', 'Kỹ sư xây dựng', 'Phi công'],
      correct: 0,
      explanation: '"Firefighter" = lính cứu hỏa.',
    },
    {
      skill: 'grammar',
      question: 'Điền mạo từ đúng: "My sister is ___ artist."',
      options: ['a', 'an', 'the', 'is'],
      correct: 1,
      explanation: '"Artist" bắt đầu bằng nguyên âm /ɑː/ nên dùng "an".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng:',
      options: [
        'My uncle is driver.',
        'My uncle is an driver.',
        'My uncle is a driver.',
        'My uncle are a driver.',
      ],
      correct: 2,
      explanation: '"Driver" bắt đầu bằng phụ âm /d/ và là danh từ số ít nên dùng "a driver".',
    },
    {
      skill: 'grammar',
      question: 'Điền động từ đúng: "A pilot ___ airplanes."',
      options: ['fly', 'flys', 'flying', 'flies'],
      correct: 3,
      explanation: 'Với chủ ngữ số ít "A pilot", động từ "fly" đổi thành "flies".',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn hỏi nghề nghiệp của một người mới quen. Câu tự nhiên nhất là:',
      options: [
        'What do you do?',
        'What are you?',
        'How old are you?',
        'Where is your office?',
      ],
      correct: 0,
      explanation: '"What do you do?" là câu hỏi nghề nghiệp tự nhiên và lịch sự trong tiếng Anh.',
    },
    {
      skill: 'listening',
      audioText: 'My father is an engineer and works in an office.',
      question: 'Nghe và chọn nghề nghiệp của bố bạn ấy:',
      options: ['Bác sĩ', 'Kỹ sư', 'Đầu bếp', 'Nông dân'],
      correct: 1,
      explanation: 'Câu nghe nhắc rõ "an engineer" (kỹ sư).',
    },
    {
      skill: 'listening',
      audioText: 'The chef cooks delicious food for the guests.',
      question: 'Nghe và chọn câu đúng:',
      options: [
        'Chú tài xế đang lái xe.',
        'Người nông dân đang thu hoạch lúa.',
        'Đầu bếp nấu đồ ăn ngon cho khách.',
        'Cô y tá đang giúp bệnh nhân.',
      ],
      correct: 2,
      explanation: '"The chef cooks delicious food" = Đầu bếp nấu đồ ăn ngon.',
    },
    {
      skill: 'vocab',
      question: 'Nơi làm việc chính của bác sĩ và y tá là:',
      options: ['Park', 'Library', 'Classroom', 'Hospital'],
      correct: 3,
      explanation: '"Hospital" nghĩa là bệnh viện.',
    },
  ],
};

export default JOBS_LESSON;
