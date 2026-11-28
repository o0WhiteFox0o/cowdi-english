// Track: general — Unit int-u1: Làm quen · Bài 4: Số đếm (v2)
// Soạn theo docs/05-implementation/content/briefs/int-u1.md và STD-LESSON-CONTENT-v1.0.

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const NUMBERS_LESSON = {
  id: 'numbers',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u1',
  title: 'Số đếm',
  description: 'Đếm số, hỏi số lượng với How many / There is–are và hỏi tuổi',
  icon: '🔢',
  objectives: [
    'Đọc và dùng chính xác các số đếm cơ bản từ 0 đến 100',
    'Hỏi và trả lời về số lượng đồ vật bằng "How many…?" và "There is / There are"',
    'Hỏi và trả lời tuổi tự nhiên bằng "How old are you? – I am … years old"',
  ],
  story: {
    scene_id: 'bd_coc_dem',
    intro_vi: 'Khách lên đò đông quá, ông đếm chưa kịp. Con phụ ông đếm số thật chuẩn trước khi qua sông nha!',
    dialogue: {
      speaker_id: 'ong_tu',
      text_en: 'How many people are there?',
    },
  },

  vocabulary: [
    v('Zero', '/ˈzɪroʊ/', 'number', 'Số 0 (không)', 'The game score is zero.', 'Tỉ số trận đấu là không.', '0️⃣'),
    v('One', '/wʌn/', 'number', 'Số 1 (một)', 'I have one blue pen.', 'Mình có một cây bút xanh.', '1️⃣'),
    v('Two', '/tuː/', 'number', 'Số 2 (hai)', 'There are two notebooks here.', 'Có hai quyển vở ở đây.', '2️⃣'),
    v('Three', '/θriː/', 'number', 'Số 3 (ba)', 'Lan has three English books.', 'Lan có ba quyển sách tiếng Anh.', '3️⃣'),
    v('Four', '/fɔːr/', 'number', 'Số 4 (bốn)', 'There are four chairs in the room.', 'Có bốn chiếc ghế trong phòng.', '4️⃣'),
    v('Five', '/faɪv/', 'number', 'Số 5 (năm)', 'I have five pencils in my bag.', 'Mình có năm cây bút chì trong cặp.', '5️⃣'),
    v('Eight', '/eɪt/', 'number', 'Số 8 (tám)', 'Mai is eight years old.', 'Mai tám tuổi.', '8️⃣'),
    v('Ten', '/ten/', 'number', 'Số 10 (mười)', 'There are ten students in our group.', 'Có mười học sinh trong nhóm mình.', '🔟'),
    v('Twelve', '/twelv/', 'number', 'Số 12 (mười hai)', 'One year has twelve months.', 'Một năm có mười hai tháng.', '🕛'),
    v('Fifteen', '/ˌfɪfˈtiːn/', 'number', 'Số 15 (mười lăm)', 'Minh counts fifteen color cards.', 'Minh đếm được mười lăm thẻ màu.', '🔢'),
    v('Twenty', '/ˈtwenti/', 'number', 'Số 20 (hai mươi)', 'My brother is twenty years old.', 'Anh trai mình hai mươi tuổi.', '2️⃣'),
    v('Fifty', '/ˈfɪfti/', 'number', 'Số 50 (năm mươi)', 'Mr. Tom has fifty storybooks.', 'Thầy Tom có năm mươi quyển truyện.', '5️⃣'),
    v('Hundred', '/ˈhʌndrəd/', 'number', '100 (một trăm)', 'She gets one hundred points today.', 'Hôm nay bạn ấy đạt một trăm điểm.', '💯'),
  ],

  grammar: [
    {
      title: 'Hỏi số lượng: How many…? và trả lời với There is / There are',
      explanation: 'Dùng "How many + danh từ số nhiều + are there?" để hỏi số lượng. Trả lời: "There is + 1 vật" (số ít) và "There are + từ 2 vật trở lên" (số nhiều).',
      examples: [
        { en: 'How many books are there in your bag?', vi: 'Có bao nhiêu quyển sách trong cặp của bạn?' },
        { en: 'There is one ruler in my bag.', vi: 'Có một cây thước trong cặp mình.' },
        { en: 'There are three books on the desk.', vi: 'Có ba quyển sách trên bàn.' },
        { en: 'How many pencils do you have?', vi: 'Bạn có bao nhiêu cây bút chì?' },
      ],
      mistakes: [
        { wrong: 'There is two books.', right: 'There are two books.', note: '"two books" là số nhiều (≥2) nên phải dùng "There are", không dùng "There is".' },
        { wrong: 'How many book do you have?', right: 'How many books do you have?', note: 'Sau "How many" danh từ luôn ở dạng số nhiều (thêm -s/-es).' },
      ],
    },
    {
      title: 'Hỏi và nói tuổi: How old are you?',
      explanation: 'Hỏi tuổi: "How old are you?" (hoặc "How old is he/she?"). Trả lời: "I am + số" hoặc đầy đủ "I am + số + years old".',
      examples: [
        { en: 'How old are you, Lan?', vi: 'Lan ơi, bạn bao nhiêu tuổi?' },
        { en: 'I am ten years old.', vi: 'Mình mười tuổi.' },
        { en: 'How old is your little sister?', vi: 'Em gái của bạn bao nhiêu tuổi?' },
        { en: 'She is eight years old.', vi: 'Em ấy tám tuổi.' },
      ],
      mistakes: [
        { wrong: 'I am 10 years.', right: 'I am 10 years old.', note: 'Nếu đã dùng "years" thì phải có đủ "years old" (hoặc nói gọn "I am 10.").' },
        { wrong: 'I have ten years old.', right: 'I am ten years old.', note: 'Nói tuổi trong tiếng Anh dùng động từ "to be" (am/is/are), không dùng "have".' },
      ],
    },
  ],

  reading: {
    title: 'Đếm đồ trong cặp sách',
    passage: [
      'Lan: Your school bag looks heavy, Minh! How many books are there in your bag?',
      'Minh: Let me count. There is one notebook, two dictionaries, and three English books.',
      'Lan: Wow! And how many pencils do you have?',
      'Minh: I have five pencils and four pens. Mr. Tom gave us ten flashcards today, too.',
      'Lan: That is a lot! Are these twelve stickers for you?',
      'Minh: No, they are for my sister, Mai. She is eight years old and she loves stickers.',
      'Lan: How cute! I am ten years old, and I still like stickers, too.',
    ].join('\n'),
    translation: [
      'Lan: Cặp sách của bạn trông nặng thế, Minh! Trong cặp bạn có bao nhiêu quyển sách vậy?',
      'Minh: Để mình đếm xem. Có một quyển vở, hai quyển từ điển và ba quyển sách tiếng Anh.',
      'Lan: Ồ! Thế bạn có bao nhiêu cây bút chì?',
      'Minh: Mình có năm cây bút chì và bốn cây bút mực. Hôm nay thầy Tom còn phát cho tụi mình mười thẻ từ nữa.',
      'Lan: Nhiều thật đấy! Mười hai miếng dán này là của bạn à?',
      'Minh: Không, của em gái mình là Mai. Em ấy tám tuổi và rất thích miếng dán.',
      'Lan: Dễ thương quá! Mình mười tuổi rồi mà vẫn thích miếng dán lắm.',
    ].join('\n'),
    highlights: ['one', 'two', 'three', 'four', 'five', 'ten', 'twelve', 'eight'],
    questions: [
      {
        question: 'Trong cặp của Minh có bao nhiêu quyển sách tiếng Anh?',
        options: ['Một quyển', 'Ba quyển', 'Hai quyển', 'Bốn quyển'],
        correct: 1,
        explanation: 'Minh đếm "one notebook, two dictionaries, and three English books."',
      },
      {
        question: 'Thầy Tom đã phát cho lớp bao nhiêu thẻ từ (flashcards)?',
        options: ['5 thẻ', '8 thẻ', '10 thẻ', '12 thẻ'],
        correct: 2,
        explanation: 'Minh nói "Mr. Tom gave us ten flashcards today."',
      },
      {
        question: 'Em gái của Minh (Mai) bao nhiêu tuổi?',
        options: ['5 tuổi', '12 tuổi', '10 tuổi', '8 tuổi'],
        correct: 3,
        explanation: 'Câu "She is eight years old" cho biết Mai 8 tuổi.',
      },
      {
        question: '12 miếng dán (stickers) được Minh mang về cho ai?',
        options: ['Cho em gái Mai', 'Cho thầy Tom', 'Cho Lan', 'Cho anh trai Lan'],
        correct: 0,
        explanation: 'Minh nói "they are for my sister, Mai."',
      },
    ],
  },

  quiz: [
    {
      skill: 'grammar',
      question: 'Chọn câu ĐÚNG ngữ pháp:',
      options: ['There is two books on the desk.', 'There are two books on the desk.', 'There am two books on the desk.', 'There be two books on the desk.'],
      correct: 1,
      explanation: '"two books" là số nhiều nên phải dùng "There are".',
    },
    {
      skill: 'grammar',
      question: 'Cách nói "Mình 10 tuổi" nào ĐÚNG?',
      options: ['I am 10 years.', 'I have 10 years old.', 'I am 10 years old.', 'I 10 years old.'],
      correct: 2,
      explanation: 'Nói tuổi dùng "I am + số + years old" (hoặc ngắn gọn "I am 10.").',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "How many ___ do you have?"',
      options: ['book', 'a book', 'bookes', 'books'],
      correct: 3,
      explanation: 'Sau "How many" luôn dùng danh từ đếm được số nhiều ("books").',
    },
    {
      skill: 'vocab',
      question: 'Số "12" trong tiếng Anh là:',
      options: ['Twelve', 'Twenty', 'Two', 'Ten'],
      correct: 0,
      explanation: '"Twelve" = 12; "Twenty" = 20.',
    },
    {
      skill: 'vocab',
      question: '"One hundred" là số mấy?',
      options: ['10', '100', '50', '1000'],
      correct: 1,
      explanation: '"Hundred" = trăm → "One hundred" = 100.',
    },
    {
      skill: 'listening',
      audioText: 'There are four chairs in the room.',
      question: 'Nghe và chọn số lượng ghế trong phòng:',
      options: ['3 cái ghế', '5 cái ghế', '4 cái ghế', '14 cái ghế'],
      correct: 2,
      explanation: '"four chairs" nghĩa là bốn chiếc ghế.',
    },
    {
      skill: 'listening',
      audioText: 'Mai is eight years old.',
      question: 'Nghe và chọn tuổi của Mai:',
      options: ['5 tuổi', '18 tuổi', '10 tuổi', '8 tuổi'],
      correct: 3,
      explanation: 'Câu nghe là "Mai is eight years old." → Mai 8 tuổi.',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn hỏi tuổi em gái của bạn mình. Bạn hỏi:',
      options: ['How old is your sister?', 'How many is your sister?', 'What old is your sister?', 'How old are your sister?'],
      correct: 0,
      explanation: 'Hỏi tuổi một người dùng "How old is + người đó?".',
    },
    {
      skill: 'vocab',
      question: '"Zero" nghĩa là:',
      options: ['Số 1', 'Số 0', 'Số 10', 'Số 20'],
      correct: 1,
      explanation: '"Zero" = số 0.',
    },
  ],

  dialogPrompts: [
    {
      id: 'num-1',
      npc: 'ong_tu',
      askEn: 'How many books do you have?',
      askVi: 'Con có bao nhiêu quyển sách?',
      image: null,
      answers: [
        { en: 'I have five books.', vi: 'Con có năm quyển sách.' },
        { en: 'I have ten books.', vi: 'Con có mười quyển sách.' },
      ],
      keywords: ['have'],
      replyEn: 'Good job counting!',
      replyVi: 'Con đếm giỏi lắm!',
    },
    {
      id: 'num-2',
      npc: 'tom',
      askEn: 'How old are you?',
      askVi: 'Con bao nhiêu tuổi rồi?',
      image: null,
      answers: [
        { en: 'I am ten years old.', vi: 'Con mười tuổi.' },
        { en: 'I am twelve years old.', vi: 'Con mười hai tuổi.' },
      ],
      keywords: ['years'],
      replyEn: 'Wonderful! Keep learning every day.',
      replyVi: 'Tuyệt vời! Cố gắng học mỗi ngày nhé.',
    },
  ],

  trueFalse: [
    {
      en: 'Two plus three equals five.',
      vi: 'Hai cộng ba bằng năm.',
      image: '/image/art/numbers.webp',
      isTrue: true,
      wordIds: ['two', 'three', 'five'],
    },
    {
      en: 'Ten is smaller than four.',
      vi: 'Mười nhỏ hơn bốn.',
      image: null,
      illustration: '🔟',
      sceneBrief: 'Mười quả cam đặt cạnh bốn quả cam, không chữ.',
      isTrue: false,
      whyVi: 'Mười ("ten") lớn hơn bốn ("four"), không phải nhỏ hơn.',
      wordIds: ['ten', 'four'],
    },
    {
      en: 'One hand has five fingers.',
      vi: 'Một bàn tay có năm ngón tay.',
      image: null,
      illustration: '5️⃣',
      sceneBrief: 'Bàn tay xòe đủ năm ngón thân thiện, không chữ.',
      isTrue: true,
      wordIds: ['one', 'five'],
    },
    {
      en: 'Twelve is the number 20.',
      vi: 'Twelve là số 20.',
      image: null,
      illustration: '🕛',
      sceneBrief: 'Mặt đồng hồ chỉ 12 giờ rõ ràng, không chữ.',
      isTrue: false,
      whyVi: '"Twelve" là số 12; số 20 là "twenty".',
      wordIds: ['twelve', 'twenty'],
    },
    {
      en: 'Fifty plus fifty equals one hundred.',
      vi: 'Năm mươi cộng năm mươi bằng một trăm.',
      image: null,
      illustration: '💯',
      sceneBrief: 'Hai chồng 50 hạt sỏi gộp thành 100, không chữ.',
      isTrue: true,
      wordIds: ['fifty', 'hundred'],
    },
    {
      en: 'Zero comes after eight.',
      vi: 'Số không đứng sau số tám.',
      image: null,
      illustration: '0️⃣',
      sceneBrief: 'Chiếc giỏ trống rỗng bên cạnh giỏ tám quả táo, không chữ.',
      isTrue: false,
      whyVi: 'Số 0 ("zero") đứng trước số 1, nhỏ hơn số 8 ("eight").',
      wordIds: ['zero', 'eight'],
    },
  ],
};

export default NUMBERS_LESSON;
