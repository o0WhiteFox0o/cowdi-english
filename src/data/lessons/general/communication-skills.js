// Track: general — Unit int-u8 · Kỹ năng giao tiếp thực tế (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const COMMUNICATION_SKILLS_LESSON = {
  id: 'communication-skills',
  contentVersion: 2,
  track: 'general',
  level: 'advanced',
  cefrLevel: 'B1',
  unit: 'int-u8',
  title: 'Kỹ năng giao tiếp thực tế',
  description: 'Giao tiếp chuyên nghiệp trong thuyết trình, phỏng vấn, lên lịch họp và từ chối lịch sự',
  icon: '🗣️',
  objectives: [
    'Dùng 15 từ vựng giao tiếp công việc và học thuật (agenda, clarify, confirm, follow up, summarize, deadline)',
    'Đưa ra yêu cầu và đề nghị lịch sự bằng Would you mind + V-ing?, Could you possibly…? và I\'d be happy to…',
    'Đặt câu hỏi gián tiếp đúng trật tự không đảo ngữ (Could you tell me where…?, Do you know if…?)',
  ],

  vocabulary: [
    v('Presentation', '/ˌprezənˈteɪʃən/', 'noun', 'Bài thuyết trình', 'Lan prepared clear slides for her presentation.', 'Lan đã chuẩn bị trang trình chiếu rõ ràng cho bài thuyết trình.', '📊'),
    v('Interview', '/ˈɪntərvjuː/', 'noun', 'Buổi phỏng vấn', 'She practiced answering questions before the interview.', 'Bạn ấy tập trả lời câu hỏi trước buổi phỏng vấn.', '🤝'),
    v('Negotiate', '/nɪˈɡoʊʃieɪt/', 'verb', 'Thương lượng, đàm phán', 'Both teams negotiated a fair timeline.', 'Cả hai nhóm đã thương lượng một mốc thời gian hợp lý.', '💼'),
    v('Clarify', '/ˈklerəfaɪ/', 'verb', 'Làm rõ', 'Could you clarify the second point, please?', 'Bạn có thể làm rõ ý thứ hai được không?', '🔍'),
    v('Confirm', '/kənˈfɜːrm/', 'verb', 'Xác nhận', 'Please confirm our meeting time by email.', 'Vui lòng xác nhận giờ họp của chúng ta qua email.', '✅'),
    v('Apologize', '/əˈpɑːlədʒaɪz/', 'verb', 'Xin lỗi (trang trọng)', 'I apologize for the short delay today.', 'Mình xin lỗi vì sự chậm trễ ngắn hôm nay.', '🙏'),
    v('Schedule', '/ˈskedʒuːl/', 'verb', 'Lên lịch, sắp xếp lịch', 'Let us schedule a brief call tomorrow.', 'Chúng ta hãy lên lịch một cuộc gọi ngắn vào ngày mai.', '📅'),
    v('Agenda', '/əˈdʒendə/', 'noun', 'Chương trình cuộc họp', 'Minh sent today\'s agenda before class.', 'Minh đã gửi chương trình họp hôm nay trước giờ học.', '📋'),
    v('Follow up', '/ˈfɑːloʊ ʌp/', 'phrase', 'Theo dõi tiếp, gửi phản hồi sau đó', 'I will follow up with a short email.', 'Mình sẽ gửi một email ngắn để trao đổi tiếp.', '📧'),
    v('Summarize', '/ˈsʌməraɪz/', 'verb', 'Tóm tắt', 'Let me summarize our three main decisions.', 'Để mình tóm tắt ba quyết định chính của chúng ta.', '📝'),
    v('Persuade', '/pərˈsweɪd/', 'verb', 'Thuyết phục', 'Good examples help persuade your listeners.', 'Ví dụ hay giúp thuyết phục người nghe.', '💬'),
    v('Small talk', '/smɔːl tɔːk/', 'noun', 'Trò chuyện xã giao mở đầu', 'Brief small talk helps everyone feel relaxed.', 'Vài câu xã giao ngắn giúp mọi người thấy thoải mái.', '☕'),
    v('Deadline', '/ˈdedlaɪn/', 'noun', 'Hạn chót', 'Can we finish the draft before the deadline?', 'Chúng ta có thể xong bản nháp trước hạn chót không?', '⏰'),
    v('Compliment', '/ˈkɑːmplɪmənt/', 'noun', 'Lời khen ngợi', 'A sincere compliment builds team confidence.', 'Một lời khen chân thành tạo thêm tự tin cho nhóm.', '😊'),
    v('Politely decline', '/pəˈlaɪtli dɪˈklaɪn/', 'phrase', 'Từ chối lịch sự', 'I have to politely decline because of exams.', 'Mình đành từ chối lịch sự vì đang có kỳ thi.', '🙅'),
  ],

  grammar: [
    {
      title: 'Yêu cầu và đề nghị lịch sự: Would you mind + V-ing? / Could you possibly…?',
      explanation: 'Dùng "Would you mind + V-ing?" (Bạn có phiền… không? — luôn đi với V-ing!), "Could you possibly + V?" để nhờ vả mềm mỏng, và "I\'d be happy to + V" khi sẵn lòng nhận lời giúp.',
      examples: [
        { en: 'Would you mind sending me today\'s agenda?', vi: 'Bạn có phiền gửi cho mình chương trình họp hôm nay không?' },
        { en: 'Could you possibly clarify the project deadline?', vi: 'Bạn có thể làm rõ hạn chót dự án giúp mình được không?' },
        { en: "I'd be happy to review your presentation slides.", vi: 'Mình rất sẵn lòng xem giúp các trang thuyết trình của bạn.' },
        { en: "I'm afraid I'll have to politely decline this week.", vi: 'Mình e rằng tuần này mình phải từ chối lịch sự.' },
      ],
      mistakes: [
        { wrong: 'Would you mind to send me the file?', right: 'Would you mind sending me the file?', note: 'Sau "Would you mind" luôn dùng động từ đuôi "-ing" ("sending"), không dùng "to V".' },
      ],
    },
    {
      title: 'Câu hỏi gián tiếp lịch sự (Indirect Questions — không đảo ngữ)',
      explanation: 'Mở đầu bằng "Could you tell me…", "Do you know if…", "I was wondering if…". Quan trọng: mệnh đề phía sau giữ trật tự câu trần thuật (chủ ngữ + động từ), KHÔNG đảo trợ động từ do/does/is lên trước chủ ngữ.',
      examples: [
        { en: 'Could you tell me where the interview room is?', vi: 'Bạn có thể cho mình biết phòng phỏng vấn ở đâu không?' },
        { en: 'Do you know when the presentation starts?', vi: 'Bạn có biết khi nào buổi thuyết trình bắt đầu không?' },
        { en: 'I was wondering if you could confirm the schedule.', vi: 'Mình tự hỏi liệu bạn có thể xác nhận lịch trình được không.' },
        { en: 'Could you tell me whether Mr. Tom received my email?', vi: 'Bạn có biết liệu thầy Tom đã nhận được email của mình chưa?' },
      ],
      mistakes: [
        { wrong: 'Do you know when does the meeting start?', right: 'Do you know when the meeting starts?', note: 'Trong câu hỏi gián tiếp, bỏ "does" và chia động từ theo chủ ngữ: "when the meeting starts".' },
      ],
    },
  ],

  reading: {
    title: 'Chuẩn bị buổi thuyết trình và phỏng vấn câu lạc bộ',
    passage: [
      'Minh: Hi, Lan! Great compliment from Ms. Hoa on your presentation draft!',
      'Lan: Thanks, Minh! Before we start with small talk, could you tell me what is on today\'s agenda?',
      'Minh: First, let us confirm the deadline and schedule your mock interview.',
      'Lan: Could you clarify one thing? Should I summarize my experience in two minutes?',
      'Minh: Yes! Short, clear stories persuade listeners best. Also, apologize briefly if you pause, and follow up by email afterward.',
      'Lan: Would you mind timing me now? If they ask about Saturday shifts, I may have to politely decline because of math class.',
    ].join('\n'),
    translation: [
      'Minh: Chào Lan! Cô Hoa vừa dành lời khen tuyệt vời cho bản nháp bài thuyết trình của bạn đấy!',
      'Lan: Cảm ơn Minh! Trước khi trò chuyện xã giao, bạn cho mình biết chương trình họp hôm nay gồm những gì không?',
      'Minh: Đầu tiên, tụi mình xác nhận hạn chót và lên lịch buổi phỏng vấn thử của bạn.',
      'Lan: Bạn làm rõ giúp mình một ý được không? Mình có nên tóm tắt kinh nghiệm trong hai phút không?',
      'Minh: Có chứ! Câu chuyện ngắn, rõ ràng sẽ thuyết phục người nghe tốt nhất. Nếu bị ngắt quãng thì xin lỗi ngắn gọn, rồi gửi email theo dõi tiếp sau đó nhé.',
      'Lan: Bạn có phiền bấm giờ giúp mình bây giờ không? Nếu họ hỏi ca trực thứ Bảy, chắc mình phải từ chối lịch sự vì có lớp Toán.',
    ].join('\n'),
    highlights: ['Compliment', 'Presentation', 'Agenda', 'Confirm', 'Deadline', 'Schedule', 'Interview', 'Clarify', 'Summarize', 'Persuade', 'Apologize'],
    questions: [
      {
        question: 'Ai đã dành lời khen cho bản nháp bài thuyết trình của Lan?',
        options: ['Thầy Tom', 'Cô Hoa', 'Em gái Mai', 'Hiệu trưởng'],
        correct: 1,
        explanation: 'Minh nói: "Great compliment from Ms. Hoa on your presentation draft!"',
      },
      {
        question: 'Theo Minh, điều gì giúp thuyết phục người nghe tốt nhất trong phỏng vấn?',
        options: ['Nói càng dài càng tốt', 'Những câu chuyện ngắn và rõ ràng', 'Đọc thuộc lòng toàn bộ tài liệu', 'Tránh trả lời câu hỏi'],
        correct: 1,
        explanation: 'Minh khuyên: "Short, clear stories persuade listeners best."',
      },
      {
        question: 'Minh khuyên Lan nên làm gì sau buổi phỏng vấn?',
        options: ['Gửi email theo dõi tiếp (follow up)', 'Gọi điện mỗi tiếng', 'Bỏ qua kết quả', 'Thay đổi hạn chót'],
        correct: 0,
        explanation: 'Minh nói: "and follow up by email afterward."',
      },
      {
        question: 'Vì sao Lan có thể phải từ chối lịch sự nếu được hỏi về ca trực thứ Bảy?',
        options: ['Vì Lan đi du lịch', 'Vì Lan có lớp học Toán', 'Vì Lan bị ốm', 'Vì Lan chưa nhận được lịch'],
        correct: 1,
        explanation: 'Lan giải thích: "I may have to politely decline because of math class."',
      },
    ],
  },

  quiz: [
    {
      skill: 'grammar',
      question: 'Điền dạng đúng của động từ: "Would you mind ___ me the meeting agenda?"',
      options: ['send', 'to send', 'sending', 'sent'],
      correct: 2,
      explanation: 'Sau "Would you mind" luôn dùng V-ing ("sending").',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu hỏi gián tiếp ĐÚNG ngữ pháp:',
      options: [
        'Do you know when does the interview start?',
        'Do you know when the interview starts?',
        'Do you know when is the interview start?',
        'Do you know when starts the interview?',
      ],
      correct: 1,
      explanation: 'Câu hỏi gián tiếp không đảo trợ động từ "does": "when the interview starts".',
    },
    {
      skill: 'vocab',
      question: 'Danh sách các nội dung sẽ bàn trong một cuộc họp gọi là:',
      options: ['Deadline', 'Agenda', 'Compliment', 'Small talk'],
      correct: 1,
      explanation: '"Agenda" = chương trình nghị sự / nội dung cuộc họp.',
    },
    {
      skill: 'vocab',
      question: 'Cụm động từ "follow up" trong công việc có nghĩa là:',
      options: ['Huỷ bỏ kế hoạch', 'Theo dõi tiếp hoặc gửi email phản hồi sau đó', 'Nói chuyện xã giao', 'Từ chối ngay lập tức'],
      correct: 1,
      explanation: '"Follow up" = tiếp nối, theo dõi tiến độ hoặc gửi phản hồi sau cuộc họp.',
    },
    {
      skill: 'vocab',
      question: 'Khi bạn chưa hiểu rõ một yêu cầu và muốn đối phương giải thích rõ hơn, động từ phù hợp là:',
      options: ['Apologize', 'Clarify', 'Decline', 'Schedule'],
      correct: 1,
      explanation: '"Clarify" = làm rõ ý.',
    },
    {
      skill: 'usage',
      question: 'Bạn không thể dự buổi họp tối nay và muốn từ chối thật lịch sự. Câu phù hợp nhất là:',
      options: [
        "No, I don't want to go.",
        "I'm afraid I'll have to politely decline because of a class.",
        'Cancel your meeting now.',
        'I summarize your agenda.',
      ],
      correct: 1,
      explanation: '"I\'m afraid I\'ll have to politely decline…" là cách từ chối chuyên nghiệp và lịch sự.',
    },
    {
      skill: 'vocab',
      question: '"Summarize the key points" nghĩa là:',
      options: ['Tóm tắt những ý chính', 'Kéo dài hạn chót', 'Đặt lịch phỏng vấn', 'Khen ngợi người nói'],
      correct: 0,
      explanation: '"Summarize" = tóm tắt ngắn gọn các điểm chính.',
    },
    {
      skill: 'listening',
      audioText: 'Could you tell me where the interview room is?',
      question: 'Nghe và chọn thông tin người nói đang hỏi:',
      options: ['Giờ bắt đầu cuộc họp', 'Vị trí phòng phỏng vấn', 'Tên người phỏng vấn', 'Hạn chót nộp bài'],
      correct: 1,
      explanation: '"where the interview room is" = phòng phỏng vấn ở đâu.',
    },
    {
      skill: 'listening',
      audioText: 'I will follow up with an email to confirm our schedule.',
      question: 'Nghe và chọn mục đích của email sắp gửi:',
      options: ['Để xác nhận lịch trình', 'Để xin lỗi vì đến trễ', 'Để từ chối lời mời', 'Để gửi lời khen'],
      correct: 0,
      explanation: '"to confirm our schedule" = để xác nhận lịch trình của chúng ta.',
    },
  ],
};

export default COMMUNICATION_SKILLS_LESSON;
