// Track: general — Unit int-u6 · Sinh hoạt hàng ngày (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const DAILY_ROUTINE_LESSON = {
  id: 'daily-routine',
  contentVersion: 2,
  track: 'general',
  level: 'intermediate',
  cefrLevel: 'A2',
  unit: 'int-u6',
  title: 'Sinh hoạt hàng ngày',
  description: 'Kể lịch trình từ sáng đến tối bằng thì Hiện tại Đơn và trạng từ chỉ tần suất',
  icon: '⏰',
  objectives: [
    'Mô tả trọn vẹn thời gian biểu một ngày với 20 từ và cụm động từ sinh hoạt quen thuộc',
    'Chia đúng động từ thì Hiện tại Đơn cho ngôi thứ 3 số ít (wakes, studies, brushes, goes)',
    'Đặt đúng vị trí trạng từ tần suất (always, usually, often, sometimes, never) trong câu',
  ],

  vocabulary: [
    v('Wake up', '/weɪk ʌp/', 'phrase', 'Thức dậy', 'I usually wake up at six.', 'Mình thường thức dậy lúc sáu giờ.', '⏰'),
    v('Alarm', '/əˈlɑːrm/', 'noun', 'Chuông báo thức', 'My alarm rings before sunrise.', 'Chuông báo thức của mình reo trước bình minh.', '⏰'),
    v('Brush', '/brʌʃ/', 'verb', 'Đánh (răng), chải', 'I brush my teeth twice a day.', 'Mình đánh răng hai lần mỗi ngày.', '🪥'),
    v('Shower', '/ˈʃaʊər/', 'noun', 'Tắm vòi sen', 'Minh takes a quick shower every morning.', 'Minh tắm vòi sen nhanh mỗi buổi sáng.', '🚿'),
    v('Get dressed', '/ɡet drest/', 'phrase', 'Mặc quần áo', 'I get dressed before eating breakfast.', 'Mình mặc quần áo trước khi ăn sáng.', '👔'),
    v('Breakfast', '/ˈbrekfəst/', 'noun', 'Bữa sáng', 'Lan eats warm noodles for breakfast.', 'Lan ăn phở nóng vào bữa sáng.', '🥣'),
    v('Commute', '/kəˈmjuːt/', 'verb', 'Đi lại (đi học, đi làm)', 'My dad commutes to work by motorbike.', 'Bố mình đi làm hằng ngày bằng xe máy.', '🛵'),
    v('Walk', '/wɔːk/', 'verb', 'Đi bộ', 'We walk to school together every morning.', 'Chúng mình cùng đi bộ tới trường mỗi sáng.', '🚶'),
    v('Study', '/ˈstʌdi/', 'verb', 'Học tập', 'I study English with Cowdi daily.', 'Mình học tiếng Anh cùng Cowdi mỗi ngày.', '📚'),
    v('Work', '/wɜːrk/', 'verb', 'Làm việc', 'My parents work from eight to five.', 'Bố mẹ mình làm việc từ tám giờ đến năm giờ.', '💼'),
    v('Lunch', '/lʌntʃ/', 'noun', 'Bữa trưa', 'Students eat lunch at school at noon.', 'Học sinh ăn trưa ở trường vào buổi trưa.', '🍱'),
    v('Nap', '/næp/', 'noun', 'Giấc ngủ trưa ngắn', 'A short nap helps me stay alert.', 'Một giấc ngủ trưa ngắn giúp mình tỉnh táo.', '💤'),
    v('Snack', '/snæk/', 'noun', 'Đồ ăn nhẹ, bữa phụ', 'Mai eats fruit as an afternoon snack.', 'Mai ăn trái cây làm bữa phụ buổi chiều.', '🍎'),
    v('Exercise', '/ˈeksərsaɪz/', 'verb', 'Tập thể dục', 'We exercise in the park after class.', 'Chúng mình tập thể dục ở công viên sau giờ học.', '🏃'),
    v('Chore', '/tʃɔːr/', 'noun', 'Việc nhà', 'I finish my chores before dinner.', 'Mình làm xong việc nhà trước bữa tối.', '🧹'),
    v('Cook', '/kʊk/', 'verb', 'Nấu ăn', 'My mom cooks tasty soup every evening.', 'Mẹ mình nấu canh rất ngon mỗi tối.', '👩‍🍳'),
    v('Dinner', '/ˈdɪnər/', 'noun', 'Bữa tối', 'Our whole family eats dinner at seven.', 'Cả gia đình mình ăn tối lúc bảy giờ.', '🍽️'),
    v('Relax', '/rɪˈlæks/', 'verb', 'Thư giãn', 'I relax by reading a comic book.', 'Mình thư giãn bằng cách đọc truyện tranh.', '🧘'),
    v('Tidy up', '/ˈtaɪdi ʌp/', 'phrase', 'Dọn dẹp gọn gàng', 'Please tidy up your desk before bed.', 'Hãy dọn gọn bàn học trước khi đi ngủ nhé.', '🧽'),
    v('Sleep', '/sliːp/', 'verb', 'Ngủ', 'I try to sleep by ten every night.', 'Mình cố gắng đi ngủ trước mười giờ mỗi tối.', '😴'),
  ],

  grammar: [
    {
      title: 'Thì Hiện tại Đơn (Simple Present) cho thói quen hằng ngày',
      explanation: 'Dùng thì Hiện tại Đơn để nói lịch trình lặp lại hằng ngày. Với I/you/we/they giữ động từ nguyên mẫu; với he/she/it thêm "-s", "-es" (goes, brushes) hoặc đổi "y → ies" (studies, tidies).',
      examples: [
        { en: 'Lan wakes up when her alarm rings.', vi: 'Lan thức dậy khi chuông báo thức reo.' },
        { en: 'Minh brushes his teeth and takes a shower.', vi: 'Minh đánh răng và tắm vòi sen.' },
        { en: 'She studies English for twenty minutes daily.', vi: 'Bạn ấy học tiếng Anh hai mươi phút mỗi ngày.' },
        { en: 'They eat dinner together at seven o\'clock.', vi: 'Họ ăn tối cùng nhau lúc bảy giờ đúng.' },
      ],
      mistakes: [
        { wrong: 'She wake up at six every day.', right: 'She wakes up at six every day.', note: 'Chủ ngữ số ít "She" phải chia động từ thêm "-s": "wakes up".' },
        { wrong: 'He studys math after dinner.', right: 'He studies math after dinner.', note: 'Động từ tận cùng phụ âm + "y" đổi thành "-ies": study → studies.' },
      ],
    },
    {
      title: 'Vị trí trạng từ tần suất (always, usually, often, sometimes, never)',
      explanation: 'Trạng từ tần suất đứng TRƯỚC động từ thường (I always wake up early) nhưng đứng SAU động từ "to be" (She is never late).',
      examples: [
        { en: 'I always eat breakfast before school.', vi: 'Mình luôn ăn sáng trước khi đi học.' },
        { en: 'Minh usually takes a short nap at noon.', vi: 'Minh thường ngủ trưa một lát vào buổi trưa.' },
        { en: 'Lan is never late for English class.', vi: 'Lan không bao giờ đến trễ lớp tiếng Anh.' },
        { en: 'We sometimes cook dinner on Sundays.', vi: 'Chủ Nhật chúng mình thỉnh thoảng cùng nấu bữa tối.' },
      ],
      mistakes: [
        { wrong: 'I wake up always at six.', right: 'I always wake up at six.', note: 'Trạng từ tần suất "always" phải đặt TRƯỚC động từ thường "wake up".' },
        { wrong: 'He never is tired in the morning.', right: 'He is never tired in the morning.', note: 'Với động từ "to be" (is/am/are), trạng từ tần suất đứng SAU "be".' },
      ],
    },
  ],

  reading: {
    title: 'Một ngày học tập của Lan và Minh',
    passage: [
      'Minh: What is your daily routine like, Lan?',
      'Lan: My alarm rings at six. I wake up, brush my teeth, take a shower, and get dressed quickly.',
      'Minh: Do you eat breakfast at home?',
      'Lan: Always! Then I walk to school while my dad commutes to work. After lunch, I take a short nap.',
      'Minh: Same here! In the afternoon, I have a fruit snack, exercise in the park, and do my chores.',
      'Lan: At night, I help Mom cook dinner, study English, tidy up my desk, and relax before I sleep at ten.',
    ].join('\n'),
    translation: [
      'Minh: Sinh hoạt hằng ngày của bạn thế nào, Lan?',
      'Lan: Chuông báo thức của mình reo lúc sáu giờ. Mình thức dậy, đánh răng, tắm vòi sen rồi mặc quần áo thật nhanh.',
      'Minh: Bạn có ăn sáng ở nhà không?',
      'Lan: Luôn luôn! Sau đó mình đi bộ tới trường còn bố mình đi làm. Sau bữa trưa, mình ngủ trưa một lát.',
      'Minh: Mình cũng vậy! Buổi chiều mình ăn nhẹ trái cây, tập thể dục ở công viên và làm việc nhà.',
      'Lan: Buổi tối mình phụ mẹ nấu bữa tối, học tiếng Anh, dọn gọn bàn học và thư giãn trước khi đi ngủ lúc mười giờ.',
    ].join('\n'),
    highlights: ['Alarm', 'Brush', 'Shower', 'Breakfast', 'Walk', 'Work', 'Lunch', 'Nap', 'Snack', 'Exercise', 'Chore', 'Cook', 'Dinner', 'Study', 'Relax', 'Sleep'],
    questions: [
      {
        question: 'Lan đến trường bằng cách nào mỗi sáng?',
        options: ['Đi xe buýt', 'Đạp xe đạp', 'Đi xe máy cùng bố', 'Đi bộ'],
        correct: 3,
        explanation: 'Lan nói: "Then I walk to school while my dad commutes to work."',
      },
      {
        question: 'Sau bữa trưa, Lan thường làm gì?',
        options: ['Ngủ trưa một lát', 'Làm bài tập ngay', 'Tập thể dục ở công viên', 'Phụ mẹ nấu ăn'],
        correct: 0,
        explanation: 'Lan kể: "After lunch, I take a short nap."',
      },
      {
        question: 'Buổi chiều Minh thường làm những việc nào?',
        options: [
          'Đi tắm vòi sen rồi lên giường ngủ sớm',
          'Ăn nhẹ, tập thể dục và làm việc nhà',
          'Đi làm cùng bố rồi chuẩn bị bữa tối',
          'Ở lại thư viện đọc sách đến tối muộn',
        ],
        correct: 1,
        explanation: 'Minh nói: "In the afternoon, I have a fruit snack, exercise in the park, and do my chores."',
      },
      {
        question: 'Lan thường đi ngủ vào lúc mấy giờ?',
        options: ['9 giờ tối', '11 giờ tối', '10 giờ tối', '8 giờ rưỡi tối'],
        correct: 2,
        explanation: 'Lan kết thúc: "and relax before I sleep at ten."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Chore" dùng để chỉ nhóm công việc nào?',
      options: ['Bài kiểm tra trên lớp', 'Món ăn nhẹ', 'Chuyến đi du lịch', 'Việc nhà hằng ngày'],
      correct: 3,
      explanation: '"Chore" = việc nhà (như quét nhà, rửa bát).',
    },
    {
      skill: 'vocab',
      question: '"Commute" có nghĩa là gì?',
      options: ['Đi lại hằng ngày đi làm/học', 'Ngủ trưa một lúc ngắn', 'Dọn dẹp lại phòng ngủ', 'Chuẩn bị đồ ăn buổi sáng'],
      correct: 0,
      explanation: '"Commute" = di chuyển đều đặn hằng ngày đi làm hoặc đi học.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng ở thì Hiện tại Đơn:',
      options: [
        'Lan wake up at six and study English.',
        'Lan wakes up at six and studies English.',
        'Lan waking up at six and studies English.',
        'Lan wakes up at six and studys English.',
      ],
      correct: 1,
      explanation: 'Với chủ ngữ ngôi 3 số ít "Lan", chia "wakes up" và "studies".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu có vị trí trạng từ tần suất ĐÚNG:',
      options: [
        'Minh eats always breakfast at home.',
        'Always Minh eats breakfast at home every.',
        'Minh always eats breakfast at home.',
        'Minh eats breakfast always home.',
      ],
      correct: 2,
      explanation: '"Always" đứng trước động từ thường "eats".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng với động từ "to be":',
      options: [
        'Lan never is late for class.',
        'Never is Lan late for class.',
        'Lan is late never for class.',
        'Lan is never late for class.',
      ],
      correct: 3,
      explanation: 'Trạng từ tần suất "never" đứng SAU động từ "is".',
    },
    {
      skill: 'usage',
      question: 'Bàn học của em gái đang rất bừa bộn trước giờ ngủ. Bạn nhắc em:',
      options: [
        'Please tidy up your desk before bed.',
        'Please commute your desk now.',
        'Please wake up your desk.',
        'Please nap on your desk.',
      ],
      correct: 0,
      explanation: '"Tidy up" = dọn dẹp cho gọn gàng.',
    },
    {
      skill: 'vocab',
      question: 'Cụm từ nào nghĩa là "mặc quần áo"?',
      options: ['wake up', 'get dressed', 'tidy up', 'take a nap'],
      correct: 1,
      explanation: '"Get dressed" = mặc quần áo.',
    },
    {
      skill: 'listening',
      audioText: 'I usually take a short nap after lunch.',
      question: 'Nghe và chọn hoạt động người nói thường làm sau bữa trưa:',
      options: ['Tập thể dục', 'Đi dạo công viên', 'Ngủ trưa ngắn', 'Dọn dẹp phòng'],
      correct: 2,
      explanation: '"take a short nap" = ngủ trưa một giấc ngắn.',
    },
    {
      skill: 'listening',
      audioText: 'My father commutes to work by motorbike.',
      question: 'Nghe và chọn phương tiện bố bạn ấy dùng để đi làm:',
      options: ['Xe buýt', 'Xe đạp', 'Tàu hoả', 'Xe máy'],
      correct: 3,
      explanation: '"by motorbike" = bằng xe máy.',
    },
  ],
};

export default DAILY_ROUTINE_LESSON;
