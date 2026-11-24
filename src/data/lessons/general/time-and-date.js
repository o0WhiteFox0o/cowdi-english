// Track: general — Unit int-u5 · Thời gian & ngày tháng (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const TIME_AND_DATE_LESSON = {
  id: 'time-and-date',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u5',
  title: 'Thời gian & ngày tháng',
  description: 'Hỏi đáp giờ giấc, gọi tên 7 thứ trong tuần và dùng đúng giới từ thời gian at, on, in',
  icon: '🕐',
  objectives: [
    'Đọc giờ bằng cả hai cách: giờ số (eight fifteen) và giờ truyền thống (quarter past, half past, quarter to)',
    'Gọi tên và viết đúng 7 ngày trong tuần cùng các mốc today, tomorrow, yesterday',
    'Chọn đúng giới từ thời gian at (giờ), on (thứ/ngày) và in (tháng/mùa/năm/buổi)',
  ],

  vocabulary: [
    v('What time is it?', '/wʌt taɪm ɪz ɪt/', 'phrase', 'Mấy giờ rồi?', 'Excuse me, what time is it now?', 'Cho hỏi, bây giờ mấy giờ rồi?', '⏰'),
    v("O'clock", '/əˈklɑːk/', 'adverb', 'Đúng giờ (giờ chẵn)', "School starts at seven o'clock.", 'Trường bắt đầu vào lúc bảy giờ đúng.', '🕖'),
    v('Half past', '/hæf pæst/', 'phrase', 'Rưỡi (hơn 30 phút)', "It's half past six already.", 'Đã sáu giờ rưỡi rồi.', '🕡'),
    v('Quarter past', '/ˈkwɔːrtər pæst/', 'phrase', 'Hơn 15 phút', "Our break begins at quarter past nine.", 'Giờ ra chơi bắt đầu lúc chín giờ mười lăm.', '🕗'),
    v('Quarter to', '/ˈkwɔːrtər tuː/', 'phrase', 'Kém 15 phút', "The bus arrives at quarter to eight.", 'Xe buýt tới lúc tám giờ kém mười lăm.', '🕘'),
    v('Today', '/təˈdeɪ/', 'noun', 'Hôm nay', 'Today is a sunny Wednesday.', 'Hôm nay là một ngày thứ Tư có nắng.', '📅'),
    v('Tomorrow', '/təˈmɑːroʊ/', 'noun', 'Ngày mai', 'We have a quiz tomorrow morning.', 'Sáng mai chúng mình có bài kiểm tra ngắn.', '➡️'),
    v('Yesterday', '/ˈjestərdeɪ/', 'noun', 'Hôm qua', 'I visited my grandma yesterday.', 'Hôm qua mình đã đi thăm bà nội.', '⬅️'),
    v('Week', '/wiːk/', 'noun', 'Tuần lễ', 'This week is full of activities.', 'Tuần này có rất nhiều hoạt động.', '📆'),
    v('Month', '/mʌnθ/', 'noun', 'Tháng', 'Next month is my birthday.', 'Tháng sau là sinh nhật của mình.', '🗓️'),
    v('Year', '/jɪr/', 'noun', 'Năm', 'There are twelve months in a year.', 'Có mười hai tháng trong một năm.', '🎊'),
    v('Monday', '/ˈmʌndeɪ/', 'noun', 'Thứ Hai', 'We wear our uniform on Monday.', 'Chúng mình mặc đồng phục vào thứ Hai.', '1️⃣'),
    v('Tuesday', '/ˈtuːzdeɪ/', 'noun', 'Thứ Ba', 'Lan has art class on Tuesday.', 'Lan có lớp mỹ thuật vào thứ Ba.', '2️⃣'),
    v('Wednesday', '/ˈwenzdeɪ/', 'noun', 'Thứ Tư (chữ d câm)', 'Our club meets every Wednesday.', 'Câu lạc bộ của chúng mình họp mỗi thứ Tư.', '3️⃣'),
    v('Thursday', '/ˈθɜːrzdeɪ/', 'noun', 'Thứ Năm', 'Minh plays chess on Thursday.', 'Minh chơi cờ vua vào thứ Năm.', '4️⃣'),
    v('Friday', '/ˈfraɪdeɪ/', 'noun', 'Thứ Sáu', 'Everyone feels cheerful on Friday.', 'Mọi người đều thấy vui vẻ vào thứ Sáu.', '5️⃣'),
    v('Saturday', '/ˈsætərdeɪ/', 'noun', 'Thứ Bảy', 'We ride bikes on Saturday morning.', 'Chúng mình đạp xe vào sáng thứ Bảy.', '6️⃣'),
    v('Sunday', '/ˈsʌndeɪ/', 'noun', 'Chủ Nhật', 'Sunday is our family rest day.', 'Chủ Nhật là ngày nghỉ của cả gia đình.', '7️⃣'),
  ],

  grammar: [
    {
      title: 'Hai cách nói giờ: truyền thống (past / to) và giờ số',
      explanation: 'Với giờ chẵn dùng "o\'clock" (seven o\'clock). Hơn 15 phút: "quarter past + giờ" (8:15 = quarter past eight). Rưỡi: "half past + giờ" (8:30 = half past eight). Kém 15 phút: "quarter to + giờ kế tiếp" (8:45 = quarter to nine). Hoặc đọc số trực tiếp: eight fifteen, eight thirty, eight forty-five.',
      examples: [
        { en: "It is seven o'clock in the morning.", vi: 'Bây giờ là bảy giờ sáng đúng.' },
        { en: 'The train leaves at quarter past eight.', vi: 'Chuyến tàu rời ga lúc tám giờ mười lăm.' },
        { en: 'Dinner is ready at half past six.', vi: 'Bữa tối sẵn sàng lúc sáu giờ rưỡi.' },
        { en: 'Please arrive by quarter to nine.', vi: 'Vui lòng có mặt trước chín giờ kém mười lăm (8:45).' },
      ],
      mistakes: [
        { wrong: '8:45 is quarter to eight.', right: '8:45 is quarter to nine.', note: '"Quarter to" tính ngược từ giờ SẮP TỚI (8:45 = 9 giờ kém 15 → quarter to nine).' },
        { wrong: "It's 7:30 o'clock.", right: "It's seven thirty. / It's half past seven.", note: '"O\'clock" chỉ dùng cho giờ chẵn (:00), không dùng kèm số phút lẻ.' },
      ],
    },
    {
      title: 'Giới từ thời gian: AT – ON – IN',
      explanation: '"AT" dùng cho giờ cụ thể và mốc ngắn (at 7 o\'clock, at noon, at night). "ON" dùng cho thứ và ngày tháng cụ thể (on Monday, on May 5th). "IN" dùng cho khoảng dài hơn như tháng, mùa, năm và buổi trong ngày (in May, in summer, in 2026, in the morning).',
      examples: [
        { en: "Our English class starts at eight o'clock.", vi: 'Lớp tiếng Anh bắt đầu lúc tám giờ đúng.' },
        { en: 'We have a test on Wednesday morning.', vi: 'Chúng mình có bài kiểm tra vào sáng thứ Tư.' },
        { en: 'Mai was born in May.', vi: 'Mai sinh vào tháng Năm.' },
        { en: 'I usually study in the evening.', vi: 'Mình thường học bài vào buổi tối.' },
      ],
      mistakes: [
        { wrong: 'See you in Monday.', right: 'See you on Monday.', note: 'Trước thứ trong tuần luôn dùng "on", không dùng "in".' },
        { wrong: 'The show starts on 8 PM.', right: 'The show starts at 8 PM.', note: 'Trước giờ cụ thể luôn dùng "at".' },
      ],
    },
  ],

  reading: {
    title: 'Lịch hẹn tuần bận rộn của Lan và Minh',
    passage: [
      'Minh: Hi, Lan! What time is it now?',
      "Lan: It is quarter past four. Yesterday was Tuesday, so today is Wednesday—time for our English club!",
      "Minh: Right! The club meets from half past four to six o'clock. What is your plan for the rest of this week?",
      'Lan: Tomorrow is Thursday, so I have math review. On Friday, I help Mom at home.',
      'Minh: Are you free on Saturday or Sunday? My birthday is next month, and we start planning early this year!',
      "Lan: Let us meet on Saturday at quarter to nine in the morning. Remember, Monday comes fast!",
    ].join('\n'),
    translation: [
      'Minh: Chào Lan! Bây giờ mấy giờ rồi?',
      'Lan: Bốn giờ mười lăm rồi. Hôm qua là thứ Ba, nên hôm nay là thứ Tư—đến giờ câu lạc bộ tiếng Anh rồi!',
      'Minh: Đúng rồi! Câu lạc bộ họp từ bốn giờ rưỡi đến sáu giờ đúng. Kế hoạch phần còn lại trong tuần của bạn thế nào?',
      'Lan: Ngày mai là thứ Năm, mình có buổi ôn Toán. Thứ Sáu mình phụ mẹ ở nhà.',
      'Minh: Thứ Bảy hay Chủ Nhật bạn có rảnh không? Tháng sau là sinh nhật mình, năm nay tụi mình lên kế hoạch sớm nhé!',
      'Lan: Gặp nhau vào sáng thứ Bảy lúc chín giờ kém mười lăm (8:45) nhé. Nhớ đấy, thứ Hai tới nhanh lắm!',
    ].join('\n'),
    highlights: ['Yesterday', 'Tuesday', 'Today', 'Wednesday', 'Week', 'Tomorrow', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Month', 'Year', 'Monday'],
    questions: [
      {
        question: 'Cuộc trò chuyện diễn ra vào thứ mấy trong tuần?',
        options: ['Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Bảy'],
        correct: 1,
        explanation: 'Lan nói: "Yesterday was Tuesday, so today is Wednesday".',
      },
      {
        question: 'Câu lạc bộ tiếng Anh họp từ mấy giờ đến mấy giờ?',
        options: ['Từ 4:15 đến 5:30', 'Từ 4:30 đến 6:00', 'Từ 8:45 đến 10:00', 'Từ 6:00 đến 7:30'],
        correct: 1,
        explanation: 'Minh nói: "The club meets from half past four to six o\'clock."',
      },
      {
        question: 'Vào ngày thứ Năm (ngày mai), Lan làm gì?',
        options: ['Phụ mẹ ở nhà', 'Ôn tập môn Toán', 'Tổ chức sinh nhật', 'Đi bơi'],
        correct: 1,
        explanation: 'Lan nói: "Tomorrow is Thursday, so I have math review."',
      },
      {
        question: 'Hai bạn hẹn gặp nhau lúc mấy giờ sáng thứ Bảy?',
        options: ['8:15', '8:30', '8:45', '9:15'],
        correct: 2,
        explanation: '"quarter to nine" nghĩa là chín giờ kém mười lăm (8:45).',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '8:45 đọc theo cách truyền thống là:',
      options: ['quarter past eight', 'quarter to eight', 'quarter to nine', 'half past eight'],
      correct: 2,
      explanation: '8:45 là 9 giờ kém 15 → "quarter to nine".',
    },
    {
      skill: 'vocab',
      question: '6:30 đọc theo cách truyền thống là:',
      options: ['half to six', 'half past six', 'quarter past six', 'six o\'clock'],
      correct: 1,
      explanation: '"Half past six" = sáu giờ rưỡi (6:30).',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ thời gian đúng: "School begins ___ seven o\'clock."',
      options: ['in', 'on', 'at', 'to'],
      correct: 2,
      explanation: 'Trước giờ cụ thể luôn dùng giới từ "at".',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "Our club meets ___ Wednesday, and Mai\'s birthday is ___ May."',
      options: ['in / on', 'on / in', 'at / in', 'on / at'],
      correct: 1,
      explanation: 'Trước thứ dùng "on" (on Wednesday), trước tháng dùng "in" (in May).',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu nói giờ ĐÚNG:',
      options: [
        "It's 7:15 o'clock.",
        "It's seven o'clock.",
        "It's half past seven o'clock.",
        "It's quarter to eight o'clock.",
      ],
      correct: 1,
      explanation: '"O\'clock" chỉ đi với giờ chẵn, không kết hợp với số phút lẻ.',
    },
    {
      skill: 'vocab',
      question: 'Thứ Tư trong tiếng Anh viết đúng là (chú ý chữ d câm khi đọc):',
      options: ['Wensday', 'Wednesday', 'Wendsday', 'Whensday'],
      correct: 1,
      explanation: 'Viết là "Wednesday", đọc là /ˈwenzdeɪ/.',
    },
    {
      skill: 'usage',
      question: 'Hôm nay là thứ Hai. Bạn muốn nói về ngày Chủ Nhật vừa qua. Từ đúng là:',
      options: ['Tomorrow', 'Today', 'Yesterday', 'Next week'],
      correct: 2,
      explanation: '"Yesterday" nghĩa là ngày hôm qua.',
    },
    {
      skill: 'listening',
      audioText: 'The movie starts at quarter past seven.',
      question: 'Nghe và chọn giờ bắt đầu bộ phim:',
      options: ['6:45', '7:15', '7:30', '7:45'],
      correct: 1,
      explanation: '"quarter past seven" = bảy giờ mười lăm (7:15).',
    },
    {
      skill: 'listening',
      audioText: 'We will visit Grandpa on Sunday morning.',
      question: 'Nghe và chọn thời điểm họ đi thăm ông nội:',
      options: ['Sáng thứ Bảy', 'Sáng Chủ Nhật', 'Tối thứ Hai', 'Chiều thứ Năm'],
      correct: 1,
      explanation: '"on Sunday morning" = vào sáng Chủ Nhật.',
    },
  ],
};

export default TIME_AND_DATE_LESSON;
