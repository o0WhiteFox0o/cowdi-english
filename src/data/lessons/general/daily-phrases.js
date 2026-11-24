// Track: general — Unit int-u5 · Cụm từ giao tiếp hàng ngày (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const DAILY_PHRASES_LESSON = {
  id: 'daily-phrases',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u5',
  title: 'Cụm từ giao tiếp hàng ngày',
  description: 'Các câu giao tiếp lịch sự, câu nhờ nhắc lại và mẫu câu thiết yếu khi trò chuyện thực tế',
  icon: '💬',
  objectives: [
    'Mở đầu, cảm ơn, xin lỗi và kết thúc hội thoại tự nhiên, đúng mức độ lịch sự',
    'Dùng thành thạo các câu "cứu nguy" khi nghe chưa rõ (I don\'t understand, Can you repeat, Speak slowly)',
    'Gọi đồ uống và hỏi giá, hỏi đường cơ bản bằng I would like…, How much is it?, Where is…?',
  ],

  vocabulary: [
    v('Hello', '/həˈloʊ/', 'interjection', 'Xin chào', 'Hello! Welcome to our café.', 'Xin chào! Chào mừng bạn đến quán cà phê của chúng mình.', '👋'),
    v('How are you?', '/haʊ ɑːr juː/', 'phrase', 'Bạn khoẻ không?', 'Hi, Alex! How are you today?', 'Chào Alex! Hôm nay bạn khoẻ không?', '🙂'),
    v("I'm fine, thanks", '/aɪm faɪn θæŋks/', 'phrase', 'Mình khoẻ, cảm ơn', "I'm fine, thanks. And you?", 'Mình khoẻ, cảm ơn. Còn bạn?', '👌'),
    v('Nice to meet you', '/naɪs tə miːt juː/', 'phrase', 'Rất vui được gặp bạn', 'Nice to meet you, Lan!', 'Rất vui được gặp bạn, Lan!', '🤝'),
    v('Thank you', '/ˈθæŋk juː/', 'phrase', 'Cảm ơn', 'Thank you very much for helping.', 'Cảm ơn bạn rất nhiều vì đã giúp đỡ.', '🙏'),
    v("You're welcome", '/jʊr ˈwelkəm/', 'phrase', 'Không có gì', "You're welcome! Enjoy your drink.", 'Không có gì! Chúc bạn ngon miệng.', '💞'),
    v('Sorry', '/ˈsɑːri/', 'adjective', 'Xin lỗi', "Sorry, I didn't catch that word.", 'Xin lỗi, mình chưa nghe rõ từ đó.', '😔'),
    v('Excuse me', '/ɪkˈskjuːz miː/', 'phrase', 'Cho mình hỏi / xin lỗi (gây chú ý)', 'Excuse me, is this seat free?', 'Cho mình hỏi, chỗ này còn trống không?', '🙋'),
    v('Please', '/pliːz/', 'adverb', 'Làm ơn, vui lòng', 'Could you speak slowly, please?', 'Bạn có thể nói chậm lại được không?', '🥺'),
    v('See you later', '/siː juː ˈleɪtər/', 'phrase', 'Hẹn gặp lại sau', 'Have a nice day. See you later!', 'Chúc một ngày tốt lành. Hẹn gặp lại sau!', '👋'),
    v('Goodbye', '/ɡʊdˈbaɪ/', 'interjection', 'Tạm biệt', 'Goodbye, and safe travels!', 'Tạm biệt, chúc bạn thượng lộ bình an!', '✋'),
    v("I don't understand", '/aɪ doʊnt ˌʌndərˈstænd/', 'phrase', 'Mình không hiểu', "Sorry, I don't understand that phrase.", 'Xin lỗi, mình không hiểu cụm từ đó.', '🤔'),
    v('Can you repeat', '/kæn juː rɪˈpiːt/', 'phrase', 'Bạn có thể nhắc lại không', 'Can you repeat your order, please?', 'Bạn có thể nhắc lại món đã gọi không?', '🔁'),
    v('Speak slowly', '/spiːk ˈsloʊli/', 'phrase', 'Nói chậm lại', 'Please speak slowly for me.', 'Vui lòng nói chậm lại giúp mình.', '🐢'),
    v('How much is it?', '/haʊ mʌtʃ ɪz ɪt/', 'phrase', 'Cái này giá bao nhiêu?', 'I like this cup. How much is it?', 'Mình thích chiếc cốc này. Nó giá bao nhiêu?', '💰'),
    v('I would like', '/aɪ wʊd laɪk/', 'phrase', 'Mình muốn (lịch sự)', 'I would like an iced coffee, please.', 'Mình muốn một ly cà phê đá, làm ơn.', '☕'),
    v('Help', '/help/', 'verb', 'Giúp đỡ', 'Can I help you find something?', 'Mình có thể giúp bạn tìm gì không?', '🆘'),
    v('No problem', '/noʊ ˈprɑːbləm/', 'phrase', 'Không sao đâu / Không có gì', 'No problem! Take your time.', 'Không sao đâu! Bạn cứ từ từ nhé.', '👍'),
  ],

  grammar: [
    {
      title: 'Cảm ơn, xin lỗi và gọi món lịch sự (I would like…)',
      explanation: 'Khi gọi đồ ăn hoặc nhờ vả, dùng "I would like + danh từ / to V" lịch sự hơn nhiều so với "I want". Dùng "Excuse me" để mở lời với người lạ, "Sorry" để xin lỗi, và đáp lại bằng "You\'re welcome" hoặc "No problem".',
      examples: [
        { en: 'I would like a glass of orange juice, please.', vi: 'Mình muốn một ly nước cam, làm ơn.' },
        { en: 'Excuse me, where is the nearest café?', vi: 'Cho mình hỏi, quán cà phê gần nhất ở đâu?' },
        { en: 'Thank you very much! — You\'re welcome.', vi: 'Cảm ơn bạn rất nhiều! — Không có gì.' },
        { en: 'I\'m so sorry for being late. — No problem!', vi: 'Mình thật sự xin lỗi vì đến trễ. — Không sao đâu!' },
      ],
      mistakes: [
        { wrong: 'Give me a coffee!', right: 'I would like a coffee, please.', note: '"Give me…" nghe cộc lốc, thiếu lịch sự; hãy dùng "I would like…, please."' },
        { wrong: 'I would like drink tea.', right: 'I would like to drink tea.', note: 'Sau "would like" nếu có động từ thì phải thêm "to": "would like to V".' },
      ],
    },
    {
      title: 'Các câu "cứu nguy" khi nghe chưa rõ trong hội thoại thật',
      explanation: 'Khi nói chuyện với người nước ngoài mà nghe chưa kịp, đừng im lặng! Dùng: "Sorry, I don\'t understand", "Can you repeat that, please?", "Please speak slowly", "How do you spell that?" hoặc "What does … mean?".',
      examples: [
        { en: "Sorry, I don't understand. Can you repeat that?", vi: 'Xin lỗi, mình không hiểu. Bạn nhắc lại được không?' },
        { en: 'Could you speak slowly, please?', vi: 'Bạn có thể nói chậm lại được không?' },
        { en: 'How do you spell your last name?', vi: 'Họ của bạn đánh vần như thế nào?' },
        { en: 'What does this Vietnamese word mean?', vi: 'Từ tiếng Việt này nghĩa là gì?' },
      ],
      mistakes: [
        { wrong: 'Sorry, I not understand.', right: "Sorry, I don't understand.", note: 'Phủ định với động từ thường "understand" cần trợ động từ "don\'t".' },
        { wrong: 'Please speak slow.', right: 'Please speak slowly.', note: 'Bổ nghĩa cho động từ "speak" cần trạng từ "slowly", không dùng tính từ "slow".' },
      ],
    },
  ],

  reading: {
    title: 'Trò chuyện với du khách ở quán cà phê',
    passage: [
      'Alex: Excuse me, can you help me? Hello, my name is Alex.',
      'Lan: Hello, Alex! Nice to meet you. I am Lan. How are you?',
      "Alex: I'm fine, thanks. I would like a cup of lotus tea, please. How much is it?",
      "Lan: Sorry, I don't understand that fast. Can you repeat and speak slowly, please?",
      'Alex: No problem! I would like one lotus tea. How much is it?',
      'Lan: Oh, it is thirty thousand dong. Here you go!',
      "Alex: Thank you so much, Lan! Goodbye, see you later!",
      "Lan: You're welcome! Have a great trip in Can Tho!",
    ].join('\n'),
    translation: [
      'Alex: Cho mình hỏi, bạn có thể giúp mình không? Xin chào, mình tên là Alex.',
      'Lan: Xin chào Alex! Rất vui được gặp bạn. Mình là Lan. Bạn khoẻ không?',
      'Alex: Mình khoẻ, cảm ơn. Mình muốn một tách trà sen. Nó giá bao nhiêu vậy?',
      'Lan: Xin lỗi, bạn nói nhanh quá mình chưa hiểu. Bạn có thể nhắc lại và nói chậm thôi được không?',
      'Alex: Không sao đâu! Mình muốn một tách trà sen. Nó giá bao nhiêu vậy?',
      'Lan: Ồ, nó giá ba mươi nghìn đồng. Của bạn đây!',
      'Alex: Cảm ơn Lan nhiều lắm! Tạm biệt, hẹn gặp lại sau!',
      'Lan: Không có gì! Chúc bạn có chuyến đi thật vui ở Cần Thơ!',
    ].join('\n'),
    highlights: ['Hello', 'Sorry', 'Please', 'Goodbye', 'Help'],
    questions: [
      {
        question: 'Alex muốn gọi món đồ uống nào?',
        options: ['Cà phê sữa đá', 'Một tách trà sen', 'Nước cam ép', 'Nước dừa tươi'],
        correct: 1,
        explanation: 'Alex nói: "I would like a cup of lotus tea, please."',
      },
      {
        question: 'Vì sao Lan phải nhờ Alex nhắc lại?',
        options: ['Vì quán quá ồn', 'Vì Alex nói hơi nhanh nên Lan chưa hiểu kịp', 'Vì hết trà sen', 'Vì Lan quên giá tiền'],
        correct: 1,
        explanation: 'Lan nói: "Sorry, I don\'t understand that fast. Can you repeat and speak slowly, please?"',
      },
      {
        question: 'Tách trà sen có giá bao nhiêu?',
        options: ['Hai mươi nghìn đồng', 'Ba mươi nghìn đồng', 'Năm mươi nghìn đồng', 'Mười lăm nghìn đồng'],
        correct: 1,
        explanation: 'Lan trả lời: "Oh, it is thirty thousand dong."',
      },
      {
        question: 'Alex phản ứng thế nào khi Lan nhờ nói chậm lại?',
        options: ['Tỏ ra bực bội', 'Vui vẻ nói "No problem!" và nhắc lại chậm rãi', 'Đi sang quán khác', 'Nhờ người khác dịch'],
        correct: 1,
        explanation: 'Alex đáp rất thân thiện: "No problem! I would like one lotus tea."',
      },
    ],
  },

  quiz: [
    {
      skill: 'usage',
      question: 'Bạn muốn gọi một ly nước cam ở quán một cách lịch sự. Bạn nói:',
      options: [
        'Give me orange juice now.',
        'I would like an orange juice, please.',
        'Orange juice how much?',
        'You give orange juice.',
      ],
      correct: 1,
      explanation: '"I would like…, please" là cách gọi món lịch sự và tự nhiên nhất.',
    },
    {
      skill: 'usage',
      question: 'Người đối diện nói quá nhanh và bạn không hiểu kịp. Câu nói đúng là:',
      options: [
        'Sorry, I not understand.',
        "Sorry, I don't understand. Can you speak slowly, please?",
        'No problem, goodbye!',
        "You're welcome, please repeat!",
      ],
      correct: 1,
      explanation: 'Dùng "I don\'t understand" (có trợ động từ don\'t) kèm "Can you speak slowly, please?".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng ngữ pháp:',
      options: [
        'Please speak slow.',
        'Please speak slowly.',
        'Please slowly speaks.',
        'Please speaking slow.',
      ],
      correct: 1,
      explanation: 'Trạng từ "slowly" đứng sau động từ "speak" để bổ nghĩa cách thức.',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "I would like ___ some Vietnamese tea."',
      options: ['try', 'to try', 'trying', 'tried'],
      correct: 1,
      explanation: 'Cấu trúc là "would like + to V": "would like to try".',
    },
    {
      skill: 'vocab',
      question: 'Khi muốn gây chú ý một người lạ một cách lịch sự để hỏi đường, bạn mở lời bằng:',
      options: ['Hey you!', 'Excuse me', 'Goodbye', 'No problem'],
      correct: 1,
      explanation: '"Excuse me" là cách mở lời lịch sự khi muốn hỏi ai đó.',
    },
    {
      skill: 'usage',
      question: 'Ai đó vô tình va nhẹ vào bạn rồi nói "I\'m sorry!". Bạn đáp thân thiện:',
      options: ['No problem!', 'Thank you!', 'How much is it?', 'See you later!'],
      correct: 0,
      explanation: '"No problem!" (Không sao đâu!) là câu đáp phổ biến cho lời xin lỗi nhẹ.',
    },
    {
      skill: 'vocab',
      question: 'Bạn không biết cách viết một từ tiếng Anh. Bạn hỏi:',
      options: [
        'How do you spell that?',
        'How much is that?',
        'How old is that?',
        'Where is that?',
      ],
      correct: 0,
      explanation: '"How do you spell that?" = Từ đó đánh vần như thế nào?',
    },
    {
      skill: 'listening',
      audioText: 'Can you repeat that, please?',
      question: 'Nghe và chọn ý của người nói:',
      options: [
        'Bạn có thể nhắc lại câu đó được không?',
        'Bạn có thể thanh toán giúp mình không?',
        'Bạn sống ở đâu?',
        'Hôm nay bạn khoẻ không?',
      ],
      correct: 0,
      explanation: '"repeat" = nhắc lại, lặp lại.',
    },
    {
      skill: 'listening',
      audioText: 'I would like a cup of green tea, please.',
      question: 'Nghe và chọn món người nói gọi:',
      options: ['Một ly cà phê đen', 'Một tách trà xanh', 'Một chai nước suối', 'Một ly sữa nóng'],
      correct: 1,
      explanation: '"a cup of green tea" = một tách trà xanh.',
    },
  ],
};

export default DAILY_PHRASES_LESSON;
