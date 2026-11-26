// Track: general — Unit int-u8 · Các thì cơ bản (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const TENSES_LESSON = {
  id: 'tenses',
  contentVersion: 2,
  track: 'general',
  level: 'advanced',
  cefrLevel: 'B1',
  unit: 'int-u8',
  title: 'Các thì cơ bản',
  description: 'Phân biệt Quá khứ Đơn, Hiện tại Hoàn thành và Tương lai Đơn qua dấu hiệu thời gian rõ ràng',
  icon: '⏳',
  objectives: [
    'Nhận diện 18 từ chỉ mốc và trạng thái thời gian (yesterday, ago, already, yet, just, since, for, soon)',
    'Phân biệt Quá khứ Đơn (mốc đã khép lại) với Hiện tại Hoàn thành (kết quả còn nối tới hiện tại)',
    'Dùng đúng Tương lai Đơn (will / won\'t) và không chia "will" sau before, after, until',
  ],

  vocabulary: [
    v('Yesterday', '/ˈjestərdeɪ/', 'adverb', 'Hôm qua', 'We practiced our speech yesterday afternoon.', 'Chiều hôm qua chúng mình đã tập bài phát biểu.', '📅'),
    v('Tomorrow', '/təˈmɑːroʊ/', 'adverb', 'Ngày mai', 'The team will present tomorrow morning.', 'Sáng mai cả nhóm sẽ thuyết trình.', '🌅'),
    v('Already', '/ɔːlˈredi/', 'adverb', 'Đã xong rồi', 'Lan has already finished the slides.', 'Lan đã hoàn thành các trang trình chiếu rồi.', '✔️'),
    v('Just', '/dʒʌst/', 'adverb', 'Vừa mới', 'I have just checked the final notes.', 'Mình vừa mới kiểm tra các ghi chú cuối cùng.', '✨'),
    v('Yet', '/jet/', 'adverb', 'Chưa (cuối câu phủ định/hỏi)', 'Minh has not printed the handout yet.', 'Minh vẫn chưa in tài liệu phát tay.', '⏳'),
    v('Still', '/stɪl/', 'adverb', 'Vẫn còn', 'She is still reviewing the opening line.', 'Bạn ấy vẫn đang xem lại câu mở đầu.', '🔄'),
    v('Recently', '/ˈriːsəntli/', 'adverb', 'Gần đây', 'We recently joined the English debate club.', 'Gần đây chúng mình đã tham gia câu lạc bộ tranh biện.', '🕐'),
    v('Ago', '/əˈɡoʊ/', 'adverb', 'Cách đây (dùng Quá khứ Đơn)', 'Our group started this project two weeks ago.', 'Nhóm mình bắt đầu dự án này cách đây hai tuần.', '⏪'),
    v('Since', '/sɪns/', 'preposition', 'Kể từ mốc thời gian', 'Lan has studied here since September.', 'Lan đã học ở đây kể từ tháng Chín.', '⏳'),
    v('For', '/fɔːr/', 'preposition', 'Trong khoảng thời gian', 'They have worked together for three months.', 'Họ đã làm việc cùng nhau được ba tháng.', '📅'),
    v('Ever', '/ˈevər/', 'adverb', 'Đã từng (trong câu hỏi)', 'Have you ever spoken on stage?', 'Bạn đã từng phát biểu trên sân khấu chưa?', '❓'),
    v('Never', '/ˈnevər/', 'adverb', 'Chưa bao giờ', 'Minh has never missed a team rehearsal.', 'Minh chưa bao giờ bỏ lỡ buổi tập nhóm nào.', '🚫'),
    v('While', '/waɪl/', 'conjunction', 'Trong khi', 'While I was writing, Minh designed charts.', 'Trong khi mình viết, Minh đã vẽ biểu đồ.', '⏱️'),
    v('Before', '/bɪˈfɔːr/', 'conjunction', 'Trước khi', 'Check the microphone before you begin.', 'Kiểm tra micro trước khi bạn bắt đầu nhé.', '⬅️'),
    v('After', '/ˈæftər/', 'conjunction', 'Sau khi', 'We will celebrate after class ends.', 'Chúng mình sẽ ăn mừng sau khi tiết học kết thúc.', '➡️'),
    v('During', '/ˈdʊrɪŋ/', 'preposition', 'Trong suốt (cộng danh từ)', 'Stay calm during the question session.', 'Hãy giữ bình tĩnh trong suốt phần hỏi đáp.', '🎬'),
    v('Until', '/ʌnˈtɪl/', 'conjunction', 'Cho đến khi', 'Wait here until the teacher arrives.', 'Đợi ở đây cho đến khi thầy giáo tới nhé.', '⏰'),
    v('Soon', '/suːn/', 'adverb', 'Sớm thôi, sắp sửa', 'Our turn will start very soon.', 'Lượt của chúng mình sẽ bắt đầu rất sớm thôi.', '⏩'),
  ],

  grammar: [
    {
      title: 'Quá khứ Đơn (Past Simple) vs Hiện tại Hoàn thành (Present Perfect)',
      explanation: 'Dùng Quá khứ Đơn (V-ed / V2, phủ định "didn\'t + V nguyên mẫu") khi có mốc thời gian đã chấm dứt (yesterday, last week, two days ago). Dùng Hiện tại Hoàn thành ("have/has + V3") với already, just, yet, ever, since + mốc, for + khoảng thời gian.',
      examples: [
        { en: 'We finished the draft two days ago.', vi: 'Chúng mình hoàn thành bản nháp cách đây hai ngày.' },
        { en: 'Minh didn\'t forget his cue cards yesterday.', vi: 'Hôm qua Minh đã không quên thẻ gợi ý.' },
        { en: 'Lan has already rehearsed her part twice.', vi: 'Lan đã tập dượt phần của mình hai lần rồi.' },
        { en: 'They have practiced together for three weeks.', vi: 'Họ đã luyện tập cùng nhau được ba tuần.' },
      ],
      mistakes: [
        { wrong: "They didn't came to practice yesterday.", right: "They didn't come to practice yesterday.", note: 'Sau trợ động từ "didn\'t", động từ chính luôn ở dạng nguyên mẫu ("come").' },
        { wrong: 'I have lived in Can Tho since five years.', right: 'I have lived in Can Tho for five years.', note: '"For" đi với khoảng thời gian (five years); "since" đi với mốc cụ thể (since 2021).' },
      ],
    },
    {
      title: 'Tương lai Đơn (will / won\'t) và mệnh đề thời gian (before / after / until)',
      explanation: 'Dùng "will / won\'t + V nguyên mẫu" để hứa hẹn, quyết định tức thì hoặc dự đoán (tomorrow, soon). Lưu ý quan trọng: trong mệnh đề bắt đầu bằng before, after, until, when, dùng thì HIỆN TẠI ĐƠN thay vì "will".',
      examples: [
        { en: 'I will bring the extra slides tomorrow.', vi: 'Ngày mai mình sẽ mang theo các trang trình chiếu dự phòng.' },
        { en: "Don't worry—we won't forget your name.", vi: 'Đừng lo—chúng mình sẽ không quên tên bạn đâu.' },
        { en: 'We will rest after the contest finishes.', vi: 'Chúng mình sẽ nghỉ ngơi sau khi cuộc thi kết thúc.' },
        { en: 'Stay ready until your group enters the room.', vi: 'Hãy sẵn sàng cho đến khi nhóm bạn vào phòng.' },
      ],
      mistakes: [
        { wrong: 'I will call you after I will arrive.', right: 'I will call you after I arrive.', note: 'Không dùng "will" ngay sau liên từ thời gian "after / before / until / when".' },
      ],
    },
  ],

  reading: {
    title: 'Đếm ngược trước buổi thuyết trình nhóm',
    passage: [
      'Lan: Minh, have you finished our poster yet? We started this project two weeks ago!',
      'Minh: Relax! I have already printed the charts, and I have just checked every caption. Yesterday I practiced twice, and I never skipped a single line.',
      'Lan: Amazing! While you were printing, I edited our script. We have worked hard for two weeks since September began.',
      'Minh: Have you ever spoken before the whole school?',
      'Lan: No, I am still a little nervous, so I will review my notes until ten tonight. Tomorrow will go smoothly, and we will celebrate soon after class ends!',
    ].join('\n'),
    translation: [
      'Lan: Minh ơi, bạn đã làm xong áp phích của tụi mình chưa? Tụi mình bắt đầu dự án này cách đây hai tuần rồi đó!',
      'Minh: Bình tĩnh nào! Mình đã in biểu đồ rồi và vừa mới kiểm tra từng chú thích xong. Hôm qua mình tập hai lần và chưa từng bỏ sót dòng nào.',
      'Lan: Tuyệt quá! Trong lúc bạn đi in, mình đã chỉnh kịch bản. Tụi mình đã cố gắng suốt hai tuần kể từ đầu tháng Chín.',
      'Minh: Bạn đã từng nói trước toàn trường bao giờ chưa?',
      'Lan: Chưa, mình vẫn còn hơi hồi hộp, nên tối nay mình sẽ ôn ghi chú đến mười giờ. Ngày mai sẽ suôn sẻ thôi, và tụi mình sẽ sớm ăn mừng sau khi hết tiết!',
    ].join('\n'),
    highlights: ['Yet', 'Ago', 'Already', 'Just', 'Yesterday', 'Never', 'While', 'For', 'Since', 'Ever', 'Still', 'Until', 'Tomorrow', 'Soon', 'After'],
    questions: [
      {
        question: 'Nhóm của Lan và Minh bắt đầu dự án từ lúc nào?',
        options: ['Hôm qua', 'Cách đây hai tuần', 'Tháng trước', 'Sáng nay'],
        correct: 1,
        explanation: 'Lan nhắc: "We started this project two weeks ago!"',
      },
      {
        question: 'Trong khi Minh đi in biểu đồ, Lan đã làm gì?',
        options: ['In tài liệu phát tay', 'Nghỉ ngơi ở thư viện', 'Chỉnh sửa kịch bản thuyết trình', 'Gọi điện cho thầy Tom'],
        correct: 2,
        explanation: 'Lan nói: "While you were printing, I edited our script."',
      },
      {
        question: 'Lan đã từng thuyết trình trước toàn trường chưa?',
        options: ['Rồi, hai lần', 'Bài không đề cập', 'Chỉ nói ở lớp khác', 'Chưa bao giờ'],
        correct: 3,
        explanation: 'Khi Minh hỏi "Have you ever spoken before the whole school?", Lan đáp "No, I am still a little nervous".',
      },
      {
        question: 'Hai bạn dự định làm gì sau khi tiết học ngày mai kết thúc?',
        options: ['Đi ăn mừng', 'Làm lại áp phích mới', 'Bắt đầu dự án khác ngay', 'Ở lại thư viện đến tối'],
        correct: 0,
        explanation: 'Lan nói: "we will celebrate soon after class ends!"',
      },
    ],
  },

  quiz: [
    {
      skill: 'grammar',
      question: 'Điền dạng đúng của động từ: "Minh didn\'t ___ his notes yesterday."',
      options: ['forgot', 'forget', 'forgets', 'forgetting'],
      correct: 1,
      explanation: 'Sau trợ động từ "didn\'t", động từ trở về nguyên mẫu "forget".',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "Lan has studied English ___ five years, ___ 2021."',
      options: ['since / for', 'during / ago', 'for / since', 'until / since'],
      correct: 2,
      explanation: '"For" + khoảng thời gian (five years); "since" + mốc bắt đầu (2021).',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng với "yet":',
      options: [
        'I have already not finished yet.',
        'I will finish yet yesterday.',
        'I finished yet the poster.',
        'I have not finished the poster yet.',
      ],
      correct: 3,
      explanation: '"Yet" đứng cuối câu phủ định hoặc câu hỏi ở thì Hiện tại Hoàn thành.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng khi dùng mệnh đề thời gian với "after":',
      options: [
        'We will celebrate after class ends.',
        'We will celebrate after class will end.',
        'We celebrate after class ended tomorrow.',
        'We will celebrate after class ending.',
      ],
      correct: 0,
      explanation: 'Sau liên từ thời gian "after", dùng Hiện tại Đơn ("class ends") để chỉ tương lai.',
    },
    {
      skill: 'vocab',
      question: 'Từ nào chỉ một việc VỪA MỚI xảy ra cách đây vài phút?',
      options: ['Ago', 'Just', 'Until', 'Never'],
      correct: 1,
      explanation: '"Just" (have/has just + V3) = vừa mới.',
    },
    {
      skill: 'grammar',
      question: 'Điền từ đúng: "We moved to Can Tho three years ___."',
      options: ['since', 'for', 'ago', 'yet'],
      correct: 2,
      explanation: '"Three years ago" (cách đây 3 năm) là dấu hiệu chuẩn của thì Quá khứ Đơn.',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn hỏi bạn mới xem bạn ấy đã từng đi thăm Đà Lạt chưa. Bạn hỏi:',
      options: [
        'Did you ever been to Da Lat?',
        'Will you ever went to Da Lat?',
        'Are you ever go to Da Lat?',
        'Have you ever been to Da Lat?',
      ],
      correct: 3,
      explanation: 'Hỏi trải nghiệm trong đời dùng "Have you ever + V3…?".',
    },
    {
      skill: 'listening',
      audioText: 'Lan has already finished the presentation slides.',
      question: 'Nghe và chọn tình trạng của các trang trình chiếu:',
      options: ['Lan đã hoàn thành xong rồi', 'Lan vẫn chưa làm xong', 'Ngày mai Lan mới bắt đầu', 'Minh sẽ làm thay Lan'],
      correct: 0,
      explanation: '"has already finished" = đã hoàn thành xong rồi.',
    },
    {
      skill: 'listening',
      audioText: 'Please stay calm during the question session.',
      question: 'Nghe và chọn thời điểm cần giữ bình tĩnh:',
      options: ['Trước khi đến trường', 'Trong suốt phần hỏi đáp', 'Sau khi tan học', 'Vào ngày hôm qua'],
      correct: 1,
      explanation: '"during the question session" = trong suốt phần hỏi đáp.',
    },
  ],
};

export default TENSES_LESSON;
