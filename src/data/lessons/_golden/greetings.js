// GOLDEN — bài mẫu chuẩn cấp 2 (Trung bình). Viết lại bài `greetings` (giữ nguyên id).
// Gemini: dùng bài này làm khuôn khi nâng cấp 39 bài của lộ trình intermediate.
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4.

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const GREETINGS_LESSON_V2 = {
  id: 'greetings',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u1',
  title: 'Chào hỏi cơ bản',
  description: 'Chào, giới thiệu tên, hỏi thăm và tạm biệt trong một cuộc gặp đầu tiên',
  icon: '👋',
  objectives: [
    'Chào hỏi phù hợp theo thời điểm trong ngày',
    'Giới thiệu tên và hỏi tên người khác',
    'Hỏi thăm sức khoẻ và đáp lại lời cảm ơn, lời xin lỗi',
  ],
  // Chuẩn lời dẫn Mở ải: docs/04-design/HUONG-DAN-VAN-PHONG-LOI-DAN.md
  story: {
    scene_id: 'bd_ben_go',
    intro_vi: 'Sương dày quá, đò chưa sang sông được. Con giúp ông chào khách trên bến gỗ nha!',
    dialogue: {
      speaker_id: 'ong_tu',
      text_en: 'Good morning! Nice to meet you.',
    },
  },

  vocabulary: [
    v('Hello', '/həˈloʊ/', 'interjection', 'Xin chào', 'Hello! My name is Lan.', 'Xin chào! Mình tên là Lan.', '🙋'),
    v('Hi', '/haɪ/', 'interjection', 'Chào (thân mật)', 'Hi, Minh! How are you?', 'Chào Minh! Bạn khoẻ không?', '👋'),
    v('Good morning', '/ɡʊd ˈmɔːrnɪŋ/', 'phrase', 'Chào buổi sáng', 'Good morning, Mr. Tom.', 'Chào buổi sáng thầy Tom.', '🌅'),
    v('Goodbye', '/ɡʊdˈbaɪ/', 'interjection', 'Tạm biệt', 'Goodbye, see you tomorrow!', 'Tạm biệt, hẹn gặp lại ngày mai!', '🙌'),
    v('See you later', '/siː juː ˈleɪtər/', 'phrase', 'Hẹn gặp lại sau', 'I have to go now. See you later!', 'Mình phải đi bây giờ. Hẹn gặp lại sau nhé!', '⏰'),
    v('Thank you', '/ˈθæŋk juː/', 'phrase', 'Cảm ơn', 'Thank you for your help.', 'Cảm ơn bạn đã giúp đỡ.', '🙏'),
    v("You're welcome", '/jʊr ˈwelkəm/', 'phrase', 'Không có gì (đáp lời cảm ơn)', '"Thank you!" – "You\'re welcome!"', '"Cảm ơn!" – "Không có gì!"', '😊'),
    v('Please', '/pliːz/', 'adverb', 'Làm ơn, vui lòng', 'Please sit down.', 'Mời bạn ngồi.', '🤲'),
    v('Sorry', '/ˈsɑːri/', 'adjective', 'Xin lỗi', "Sorry, I'm late.", 'Xin lỗi, mình đến trễ.', '😔'),
    v('Excuse me', '/ɪkˈskjuːz miː/', 'phrase', 'Xin lỗi, cho hỏi (để gây chú ý)', 'Excuse me, where is the library?', 'Cho mình hỏi, thư viện ở đâu?', '🙋‍♂️'),
    v('Name', '/neɪm/', 'noun', 'Tên', 'What is your name?', 'Bạn tên là gì?', '🏷️'),
    v('Friend', '/frend/', 'noun', 'Bạn bè', 'Minh is my new friend.', 'Minh là bạn mới của mình.', '🤝'),
    v('Nice to meet you', '/naɪs tə miːt juː/', 'phrase', 'Rất vui được gặp bạn', 'Hi, Lan. Nice to meet you!', 'Chào Lan. Rất vui được gặp bạn!', '🤗'),
  ],

  grammar: [
    {
      title: 'Giới thiệu tên: My name is… / I am… / I\'m…',
      explanation: 'Dùng "My name is + tên" hoặc "I am / I\'m + tên". Hỏi tên người khác: "What is your name?" hoặc "What\'s your name?".',
      examples: [
        { en: 'My name is Lan.', vi: 'Tên mình là Lan.' },
        { en: 'I am Minh.', vi: 'Mình là Minh.' },
        { en: "I'm a new student.", vi: 'Mình là học sinh mới.' },
        { en: 'What is your name?', vi: 'Bạn tên là gì?' },
        { en: "What's his name?", vi: 'Bạn ấy tên là gì?' },
      ],
      mistakes: [
        { wrong: 'My name are Lan.', right: 'My name is Lan.', note: '"My name" là số ít nên dùng "is".' },
        { wrong: 'I name is Minh.', right: 'My name is Minh.', note: 'Trước "name" dùng tính từ sở hữu "my", không dùng "I".' },
      ],
    },
    {
      title: 'Hỏi thăm sức khoẻ: How are you?',
      explanation: 'Hỏi "How are you?" và đáp "I\'m fine / good / great, thank you." Hỏi lại người kia bằng "And you?" hoặc "How about you?".',
      examples: [
        { en: 'How are you today?', vi: 'Hôm nay bạn khoẻ không?' },
        { en: "I'm fine, thank you.", vi: 'Mình khoẻ, cảm ơn bạn.' },
        { en: "I'm great. And you?", vi: 'Mình rất khoẻ. Còn bạn?' },
        { en: 'Not bad, thanks.', vi: 'Cũng ổn, cảm ơn.' },
      ],
      mistakes: [
        { wrong: 'How are you? – I fine.', right: "How are you? – I'm fine.", note: 'Câu trả lời cần động từ "am" (I\'m).' },
      ],
    },
    {
      title: 'Chào theo thời điểm trong ngày',
      explanation: 'Good morning (sáng), Good afternoon (chiều), Good evening (tối) dùng khi gặp. "Good night" chỉ dùng khi chia tay buổi tối hoặc đi ngủ.',
      examples: [
        { en: 'Good morning, everyone.', vi: 'Chào buổi sáng cả lớp.' },
        { en: 'Good afternoon, Ms. Hoa.', vi: 'Chào cô Hoa (buổi chiều).' },
        { en: 'Good evening, Grandpa.', vi: 'Chào ông (buổi tối).' },
        { en: 'Good night, Mom. See you tomorrow.', vi: 'Chúc mẹ ngủ ngon. Mai gặp lại mẹ.' },
      ],
      mistakes: [
        { wrong: 'Good night! (khi vừa gặp nhau lúc 8 giờ tối)', right: 'Good evening!', note: '"Good night" là lời chào tạm biệt, không phải lời chào khi gặp.' },
      ],
    },
  ],

  // Đoạn văn viết tay: hội thoại liền mạch, 60–120 từ, dùng ≥60% từ của bài.
  reading: {
    title: 'Ngày đầu ở lớp mới',
    passage: [
      "Lan: Good morning! Sorry, I'm late. Is this Mr. Tom's class?",
      'Minh: Hi! Yes, it is. Please sit here.',
      'Lan: Thank you. Hello, my name is Lan.',
      "Minh: I'm Minh. Nice to meet you, Lan!",
      'Lan: Nice to meet you, too. How are you today?',
      "Minh: I'm fine, thanks. And you?",
      "Lan: I'm great. Excuse me, where is the library?",
      "Minh: It's next to our classroom. I can show you after class.",
      "Lan: Thank you, Minh. You're a good friend.",
      "Minh: You're welcome! I have to go now. See you later!",
      'Lan: Goodbye, Minh!',
    ].join('\n'),
    translation: [
      'Lan: Chào buổi sáng! Xin lỗi, mình đến trễ. Đây có phải lớp của thầy Tom không?',
      'Minh: Chào bạn! Đúng rồi. Bạn ngồi đây nhé.',
      'Lan: Cảm ơn bạn. Xin chào, mình tên là Lan.',
      'Minh: Mình là Minh. Rất vui được gặp bạn, Lan!',
      'Lan: Mình cũng rất vui được gặp bạn. Hôm nay bạn khoẻ không?',
      'Minh: Mình khoẻ, cảm ơn. Còn bạn?',
      'Lan: Mình rất khoẻ. Cho mình hỏi, thư viện ở đâu vậy?',
      'Minh: Ở cạnh lớp mình. Tan học mình chỉ cho bạn.',
      'Lan: Cảm ơn Minh. Bạn tốt thật đấy.',
      'Minh: Không có gì! Mình phải đi bây giờ. Hẹn gặp lại sau nhé!',
      'Lan: Tạm biệt Minh!',
    ].join('\n'),
    // Chỉ từ đơn: UI hiện tại không tô được cụm từ.
    highlights: ['Hello', 'Hi', 'Goodbye', 'Please', 'Sorry', 'Friend', 'Name'],
    questions: [
      {
        question: 'Vì sao Lan nói "Sorry" ở đầu đoạn hội thoại?',
        options: ['Vì Lan quên tên Minh', 'Vì Lan đến trễ', 'Vì Lan làm rơi sách', 'Vì Lan muốn về sớm'],
        correct: 1,
        explanation: 'Lan nói "Sorry, I\'m late." – xin lỗi vì đến trễ.',
      },
      {
        question: 'Lan hỏi Minh điều gì bằng "Excuse me"?',
        options: ['Tên của thầy giáo', 'Mấy giờ rồi', 'Thư viện ở đâu', 'Minh bao nhiêu tuổi'],
        correct: 2,
        explanation: '"Excuse me, where is the library?" – Lan hỏi đường tới thư viện.',
      },
      {
        question: 'Minh đáp lại lời cảm ơn của Lan bằng câu nào?',
        options: ['Nice to meet you', 'Good morning', "I'm fine", "You're welcome"],
        correct: 3,
        explanation: '"You\'re welcome" là câu đáp chuẩn khi ai đó cảm ơn mình.',
      },
      {
        question: 'Cuộc nói chuyện diễn ra vào lúc nào trong ngày?',
        options: ['Buổi sáng', 'Buổi chiều', 'Buổi tối', 'Ban đêm'],
        correct: 0,
        explanation: 'Lan mở đầu bằng "Good morning" nên đây là buổi sáng.',
      },
    ],
  },

  // ≥8 câu, câu nào cũng có explanation. skill: vocab | grammar | listening | usage.
  quiz: [
    {
      skill: 'vocab',
      question: '"Excuse me" dùng khi nào?',
      options: ['Khi gặp nhau buổi sáng sớm', 'Khi muốn xin phép hỏi ai đó', 'Khi đáp lại lời cảm ơn', 'Khi chúc nhau đi ngủ'],
      correct: 1,
      explanation: '"Excuse me" mở đầu câu hỏi lịch sự, ví dụ hỏi đường.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng:',
      options: ['My name are Lan.', 'I name is Lan.', 'My name is Lan.', 'Me name is Lan.'],
      correct: 2,
      explanation: '"My name" là số ít → dùng "is".',
    },
    {
      skill: 'usage',
      question: 'Bạn của bạn nói: "Thank you!". Bạn đáp:',
      options: ['Sorry.', 'Good night.', "Hello!", 'You\'re welcome!'],
      correct: 3,
      explanation: '"You\'re welcome" = Không có gì.',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "How ___ you?"',
      options: ['are', 'am', 'is', 'do'],
      correct: 0,
      explanation: 'Với "you" ta dùng "are": How are you?',
    },
    {
      skill: 'usage',
      question: 'Gặp cô giáo lúc 3 giờ chiều, bạn chào:',
      options: ['Good morning', 'Good afternoon', 'Good night', 'Goodbye'],
      correct: 1,
      explanation: 'Buổi chiều (sau 12 giờ trưa đến khoảng 6 giờ tối) dùng "Good afternoon".',
    },
    {
      skill: 'listening',
      audioText: 'Nice to meet you.',
      question: 'Nghe và chọn nghĩa đúng:',
      options: ['Hẹn gặp lại sau', 'Bạn khoẻ không?', 'Rất vui được gặp bạn', 'Cho mình hỏi'],
      correct: 2,
      explanation: '"Nice to meet you" nói khi gặp ai đó lần đầu.',
    },
    {
      skill: 'listening',
      audioText: 'See you later!',
      question: 'Nghe và chọn tình huống phù hợp:',
      options: ['Khi vừa gặp nhau', 'Khi giới thiệu tên', 'Khi xin lỗi', 'Khi chia tay, hẹn gặp lại'],
      correct: 3,
      explanation: '"See you later" là lời tạm biệt, hẹn gặp lại sau.',
    },
    {
      skill: 'usage',
      question: 'Câu nào là câu trả lời đúng cho "How are you?"',
      options: ["I'm fine, thank you.", "I'm Lan.", "You're welcome.", 'Nice to meet you.'],
      correct: 0,
      explanation: 'Hỏi thăm sức khoẻ thì đáp "I\'m fine / good / great".',
    },
    {
      skill: 'vocab',
      question: 'Từ nào là cách chào thân mật, dùng với bạn bè?',
      options: ['Good evening', 'Hi', 'Excuse me', 'Goodbye'],
      correct: 1,
      explanation: '"Hi" thân mật hơn "Hello", hợp với bạn bè.',
    },
  ],
};
