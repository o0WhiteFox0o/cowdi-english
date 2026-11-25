// Track: general — Unit int-u4 · Số đếm & số thứ tự (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const NUMBERS_BASIC_LESSON = {
  id: 'numbers-basic',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u4',
  title: 'Số đếm & số thứ tự',
  description: 'Đọc số đếm lớn (trăm, nghìn, triệu) và dùng số thứ tự cho ngày tháng, tầng lầu và thứ hạng',
  icon: '🔢',
  objectives: [
    'Đọc và viết đúng số đếm đến hàng triệu (hundred, thousand, million) không thêm -s khi đi với số cụ thể',
    'Chuyển và dùng đúng số thứ tự (first, second, third, fourth, twentieth) cho ngày tháng, tầng nhà và xếp hạng',
    'Tránh các lỗi chính tả phổ biến như forty (không có u) và twentieth (đổi y → ie + th)',
  ],

  vocabulary: [
    v('Zero', '/ˈzɪroʊ/', 'number', 'Số không (0)', 'Five minus five equals zero.', 'Năm trừ năm bằng không.', '0️⃣'),
    v('Eleven', '/ɪˈlevən/', 'number', 'Số mười một (11)', 'Our soccer team has eleven players.', 'Đội bóng đá của chúng mình có mười một cầu thủ.', '1️⃣'),
    v('Twelve', '/twelv/', 'number', 'Số mười hai (12)', 'There are twelve months in a year.', 'Có mười hai tháng trong một năm.', '📅'),
    v('Thirteen', '/ˌθɜːrˈtiːn/', 'number', 'Số mười ba (13)', 'Minh turns thirteen next month.', 'Tháng sau Minh bước sang tuổi mười ba.', '🎂'),
    v('Twenty', '/ˈtwenti/', 'number', 'Số hai mươi (20)', 'Twenty students joined the race.', 'Hai mươi học sinh đã tham gia cuộc chạy đua.', '🏃'),
    v('Forty', '/ˈfɔːrti/', 'number', 'Số bốn mươi (40 — không có u)', 'The bus ticket costs forty thousand dong.', 'Vé xe buýt có giá bốn mươi nghìn đồng.', '🚌'),
    v('Hundred', '/ˈhʌndrəd/', 'number', 'Một trăm (100)', 'Two hundred guests attended the event.', 'Hai trăm khách mời đã tham dự sự kiện.', '💯'),
    v('Thousand', '/ˈθaʊzənd/', 'number', 'Một nghìn (1,000)', 'Our school has two thousand students.', 'Trường chúng mình có hai nghìn học sinh.', '🏫'),
    v('Million', '/ˈmɪljən/', 'number', 'Một triệu (1,000,000)', 'Can Tho has over one million people.', 'Cần Thơ có hơn một triệu dân.', '🌆'),
    v('First', '/fɜːrst/', 'adjective', 'Thứ nhất (1st)', 'Lan finished first in the race.', 'Lan về nhất trong cuộc chạy đua.', '🥇'),
    v('Second', '/ˈsekənd/', 'adjective', 'Thứ hai (2nd)', 'Our classroom is on the second floor.', 'Phòng học của chúng mình ở tầng hai.', '🥈'),
    v('Third', '/θɜːrd/', 'adjective', 'Thứ ba (3rd)', 'Minh won third place in chess.', 'Minh giành giải ba môn cờ vua.', '🥉'),
    v('Fourth', '/fɔːrθ/', 'adjective', 'Thứ tư (4th)', 'Today is the fourth of May.', 'Hôm nay là ngày mùng bốn tháng Năm.', '🏅'),
    v('Twentieth', '/ˈtwentiəθ/', 'adjective', 'Thứ hai mươi (20th)', 'This is our school\'s twentieth festival.', 'Đây là lễ hội lần thứ hai mươi của trường.', '🎉'),
    v('Last', '/læst/', 'adjective', 'Cuối cùng', 'Nobody wants to finish last.', 'Không ai muốn về cuối cùng cả.', '🏁'),
  ],

  grammar: [
    {
      title: 'Số đếm từ 20 đến 1,000,000 (không thêm -s sau số cụ thể)',
      explanation: 'Các số ghép 21–99 viết có dấu gạch nối (twenty-one, forty-five). Lưu ý 40 viết là "forty" (KHÔNG có "u"). Khi có con số cụ thể phía trước hundred / thousand / million, KHÔNG thêm "-s" (two hundred, three thousand).',
      examples: [
        { en: 'There are forty-five chairs in the hall.', vi: 'Có bốn mươi lăm cái ghế trong hội trường.' },
        { en: 'Three hundred students watched the match.', vi: 'Ba trăm học sinh đã xem trận đấu.' },
        { en: 'The book costs eighty thousand dong.', vi: 'Quyển sách giá tám mươi nghìn đồng.' },
        { en: 'Over two million visitors travel there yearly.', vi: 'Hơn hai triệu du khách tới đó mỗi năm.' },
      ],
      mistakes: [
        { wrong: 'Fourty students came today.', right: 'Forty students came today.', note: '40 viết là "forty" (không có chữ "u" như trong "four").' },
        { wrong: 'Two hundreds people are here.', right: 'Two hundred people are here.', note: 'Khi đứng sau số đếm cụ thể ("two"), "hundred" không thêm "-s".' },
      ],
    },
    {
      title: 'Số thứ tự (Ordinal Numbers) dùng cho thứ hạng, tầng lầu và ngày tháng',
      explanation: '1st = first, 2nd = second, 3rd = third. Từ 4 trở đi thêm "-th" (fourth, fifth, tenth). Với số tròn chục tận cùng bằng "-y" (twenty, thirty), đổi "y → ie" rồi thêm "-th" (twentieth). Thường đi kèm "the" trước số thứ tự.',
      examples: [
        { en: 'Lan won first prize in the English contest.', vi: 'Lan giành giải nhất cuộc thi tiếng Anh.' },
        { en: 'The library is on the third floor.', vi: 'Thư viện nằm ở tầng ba.' },
        { en: 'Our sports day is on May fourth.', vi: 'Ngày hội thể thao của chúng mình vào ngày 4 tháng 5.' },
        { en: 'This is the twentieth year of the festival.', vi: 'Đây là năm thứ hai mươi của lễ hội.' },
      ],
      mistakes: [
        { wrong: 'My room is on the two floor.', right: 'My room is on the second floor.', note: 'Nói số tầng phải dùng số thứ tự "second", không dùng số đếm "two".' },
        { wrong: 'Her twentyth birthday is tomorrow.', right: 'Her twentieth birthday is tomorrow.', note: 'Số thứ tự của 20 đổi "y" thành "ie" + "th": "twentieth".' },
      ],
    },
  ],

  reading: {
    title: 'Ngày hội thể thao lần thứ 20',
    passage: [
      'Minh: Welcome to our school\'s twentieth sports day on May fourth!',
      'Lan: Look at the crowd! Over one thousand students and three hundred parents are here today.',
      'Minh: My class has forty runners, and twenty of them are in the morning race.',
      'Lan: Did you see Mai? She is eleven, and she finished first in her group!',
      'Minh: Amazing! I came second, and my neighbor Nam took third place. Nobody gave up, even the last runner.',
      'Lan: Let us meet on the second floor at twelve to celebrate. My score was twelve, not zero!',
    ].join('\n'),
    translation: [
      'Minh: Chào mừng đến ngày hội thể thao lần thứ hai mươi của trường mình vào ngày 4 tháng 5!',
      'Lan: Nhìn đám đông kìa! Hơn một nghìn học sinh và ba trăm phụ huynh có mặt hôm nay.',
      'Minh: Lớp mình có bốn mươi vận động viên chạy, và hai mươi bạn tham gia lượt chạy buổi sáng.',
      'Lan: Bạn có thấy Mai không? Em ấy mười một tuổi và đã về nhất nhóm của em ấy đấy!',
      'Minh: Tuyệt quá! Mình về nhì, còn bạn hàng xóm Nam giành hạng ba. Không ai bỏ cuộc, kể cả người về cuối.',
      'Lan: Trưa nay lúc mười hai giờ mình gặp nhau ở tầng hai ăn mừng nhé. Điểm mình là mười hai chứ không phải không đâu!',
    ].join('\n'),
    highlights: ['Twentieth', 'Fourth', 'Thousand', 'Hundred', 'Forty', 'Twenty', 'Eleven', 'First', 'Second', 'Third', 'Last', 'Twelve', 'Zero'],
    questions: [
      {
        question: 'Ngày hội thể thao lần thứ 20 diễn ra vào ngày nào?',
        options: ['Ngày 4 tháng 5', 'Ngày 1 tháng 5', 'Ngày 12 tháng 5', 'Ngày 20 tháng 5'],
        correct: 0,
        explanation: 'Minh mở đầu: "Welcome to our school\'s twentieth sports day on May fourth!"',
      },
      {
        question: 'Có bao nhiêu phụ huynh tới tham dự ngày hội?',
        options: ['Bốn mươi người', 'Ba trăm người', 'Hai trăm người', 'Một nghìn người'],
        correct: 1,
        explanation: 'Lan nói: "Over one thousand students and three hundred parents are here today."',
      },
      {
        question: 'Ai đã về nhất trong nhóm chạy của mình?',
        options: ['Minh', 'Lan', 'Mai', 'Nam'],
        correct: 2,
        explanation: 'Lan kể: "Did you see Mai? She is eleven, and she finished first in her group!"',
      },
      {
        question: 'Lan và Minh hẹn gặp nhau ở đâu lúc 12 giờ?',
        options: ['Ở sân vận động', 'Ở thư viện', 'Ở tầng ba', 'Ở tầng hai'],
        correct: 3,
        explanation: 'Lan hẹn: "Let us meet on the second floor at twelve to celebrate."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Số 40 viết đúng chính tả tiếng Anh là:',
      options: ['forty', 'fourty', 'fourteen', 'fortie'],
      correct: 0,
      explanation: '40 là "forty" (không có chữ "u"), còn "fourteen" là 14.',
    },
    {
      skill: 'grammar',
      question: 'Chọn cách viết đúng cho số 300 học sinh:',
      options: [
        'three hundreds students',
        'three hundred students',
        'third hundred students',
        'three hundred student',
      ],
      correct: 1,
      explanation: 'Khi đứng sau số cụ thể, "hundred" không thêm "-s", còn danh từ "students" chia số nhiều.',
    },
    {
      skill: 'vocab',
      question: 'Số thứ tự của 3 (thứ ba) là:',
      options: ['threeth', 'thirth', 'third', 'thirty'],
      correct: 2,
      explanation: '3rd đọc và viết là "third".',
    },
    {
      skill: 'grammar',
      question: 'Số thứ tự đúng của 20 (thứ hai mươi) là:',
      options: ['twentyth', 'twentith', 'twenty-first', 'twentieth'],
      correct: 3,
      explanation: 'Đổi "y → ie" rồi thêm "-th": twenty → twentieth.',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "The library is on the ___ floor." (tầng 2)',
      options: ['second', 'two', 'twice', 'twelve'],
      correct: 0,
      explanation: 'Số tầng dùng số thứ tự: "the second floor".',
    },
    {
      skill: 'vocab',
      question: '1,000,000 đọc bằng tiếng Anh là:',
      options: ['one hundred thousand', 'one million', 'ten thousand', 'one billion'],
      correct: 1,
      explanation: '1,000,000 = one million (một triệu).',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn chúc mừng bạn vừa giành giải nhất cuộc thi chạy. Bạn nói:',
      options: [
        'Congratulations on winning one place!',
        'Congratulations on being last!',
        'Congratulations on finishing first!',
        'You scored zero today!',
      ],
      correct: 2,
      explanation: '"Finishing first" = về nhất.',
    },
    {
      skill: 'listening',
      audioText: 'Our school has two thousand students.',
      question: 'Nghe và chọn số lượng học sinh của trường:',
      options: ['200 học sinh', '12,000 học sinh', '20,000 học sinh', '2,000 học sinh'],
      correct: 3,
      explanation: '"two thousand" = 2,000 (hai nghìn).',
    },
    {
      skill: 'listening',
      audioText: 'The science room is on the third floor.',
      question: 'Nghe và chọn vị trí phòng khoa học:',
      options: ['Tầng 3', 'Tầng 2', 'Tầng 1', 'Tầng 4'],
      correct: 0,
      explanation: '"on the third floor" = ở tầng 3.',
    },
  ],
};

export default NUMBERS_BASIC_LESSON;
