// Track: general — Unit int-u4 · Đại từ nhân xưng & sở hữu (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const PRONOUNS_LESSON = {
  id: 'pronouns',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u4',
  title: 'Đại từ nhân xưng & sở hữu',
  description: 'Làm chủ bộ đại từ I / me / my / mine và cách tránh nhầm lẫn sở hữu trong giao tiếp',
  icon: '👥',
  objectives: [
    'Phân biệt và dùng đúng 4 dạng đại từ: chủ ngữ, tân ngữ, tính từ sở hữu và đại từ sở hữu',
    'Thay thế cụm "tính từ sở hữu + danh từ" bằng đại từ sở hữu (mine, yours, ours, theirs)',
    'Phân biệt chính xác "its" (của nó) và "it\'s" (it is / it has)',
  ],

  vocabulary: [
    v('I', '/aɪ/', 'pronoun', 'Tôi, mình (chủ ngữ)', 'I study English every evening.', 'Mình học tiếng Anh mỗi buổi tối.', '🙋'),
    v('Me', '/miː/', 'pronoun', 'Tôi, mình (tân ngữ)', 'Please pass the ruler to me.', 'Vui lòng đưa cây thước cho mình.', '👈'),
    v('My', '/maɪ/', 'determiner', 'Của tôi (+ danh từ)', 'This is my favorite notebook.', 'Đây là quyển vở yêu thích của mình.', '📕'),
    v('Mine', '/maɪn/', 'pronoun', 'Của tôi (đứng một mình)', 'That blue backpack is mine.', 'Chiếc ba lô màu xanh kia là của mình.', '🔒'),
    v('You', '/juː/', 'pronoun', 'Bạn, các bạn', 'You are a very helpful classmate.', 'Bạn là một bạn cùng lớp rất hay giúp đỡ.', '👉'),
    v('Your', '/jʊr/', 'determiner', 'Của bạn (+ danh từ)', 'Your desk is neat and clean.', 'Bàn học của bạn thật gọn gàng và sạch sẽ.', '🪪'),
    v('Yours', '/jʊrz/', 'pronoun', 'Của bạn (đứng một mình)', 'Is this green pen yours?', 'Cây bút xanh lá này là của bạn phải không?', '🖊️'),
    v('He', '/hiː/', 'pronoun', 'Anh ấy, cậu ấy (chủ ngữ)', 'He sits beside me in class.', 'Cậu ấy ngồi cạnh mình trong lớp.', '👦'),
    v('Him', '/hɪm/', 'pronoun', 'Anh ấy, cậu ấy (tân ngữ)', 'I called him after school.', 'Mình đã gọi cho cậu ấy sau giờ học.', '👀'),
    v('His', '/hɪz/', 'determiner', 'Của anh ấy / cậu ấy', 'His bicycle is parked outside.', 'Xe đạp của cậu ấy dựng ở bên ngoài.', '🚲'),
    v('She', '/ʃiː/', 'pronoun', 'Cô ấy, bạn ấy (chủ ngữ)', 'She likes painting landscapes.', 'Bạn ấy thích vẽ tranh phong cảnh.', '👧'),
    v('Her', '/hɜːr/', 'pronoun', 'Cô ấy (tân ngữ) / của cô ấy', 'I returned her textbook this morning.', 'Sáng nay mình đã trả sách giáo khoa cho bạn ấy.', '👩'),
    v('It', '/ɪt/', 'pronoun', 'Nó (đồ vật, con vật)', 'It sleeps near the warm window.', 'Nó ngủ gần cửa sổ ấm áp.', '🐈'),
    v('We', '/wiː/', 'pronoun', 'Chúng tôi, chúng ta (chủ ngữ)', 'We share our notes before exams.', 'Chúng mình chia sẻ ghi chép trước kỳ thi.', '👨‍👩‍👧'),
    v('They', '/ðeɪ/', 'pronoun', 'Họ, chúng (chủ ngữ)', 'They left their umbrellas by the door.', 'Họ để ô của họ ở cạnh cửa.', '👫'),
  ],

  grammar: [
    {
      title: '4 vị trí của đại từ: Subject – Object – Possessive Adj – Possessive Pronoun',
      explanation: '1) Chủ ngữ (I, he, she, we, they) đứng trước động từ. 2) Tân ngữ (me, him, her, us, them) đứng sau động từ hoặc giới từ. 3) Tính từ sở hữu (my, your, his, her, our, their) luôn đi kèm danh từ phía sau. 4) Đại từ sở hữu (mine, yours, his, hers, ours, theirs) đứng một mình thay cho cả cụm "tính từ sở hữu + danh từ".',
      examples: [
        { en: 'She always helps me with math.', vi: 'Bạn ấy luôn giúp mình môn Toán.' },
        { en: 'Give this pencil case to him.', vi: 'Hãy đưa hộp bút này cho cậu ấy.' },
        { en: 'This is my book, and that one is yours.', vi: 'Đây là sách của mình, còn quyển kia là của bạn.' },
        { en: 'Our classroom is bright, and theirs is big.', vi: 'Phòng học của chúng mình sáng, còn của họ thì rộng.' },
      ],
      mistakes: [
        { wrong: 'This blue pen is my.', right: 'This blue pen is mine.', note: 'Khi đứng một mình ở cuối câu không có danh từ theo sau, dùng "mine", không dùng "my".' },
        { wrong: 'Give the notebook to he.', right: 'Give the notebook to him.', note: 'Sau giới từ "to" phải dùng đại từ tân ngữ "him", không dùng "he".' },
      ],
    },
    {
      title: 'Phân biệt "its" (sở hữu) và "it\'s" (rút gọn)',
      explanation: '"Its" (KHÔNG có dấu nháy đơn) nghĩa là "của nó", đứng trước danh từ (its tail, its color). "It\'s" (CÓ dấu nháy đơn) là dạng viết tắt của "it is" hoặc "it has".',
      examples: [
        { en: 'The puppy wags its tail happily.', vi: 'Chú cún vẫy đuôi vui vẻ.' },
        { en: "It's sunny and warm today.", vi: 'Hôm nay trời nắng và ấm áp. (= It is)' },
        { en: 'This bag lost its zipper.', vi: 'Chiếc cặp này bị hỏng khoá kéo của nó.' },
        { en: "It's been a wonderful afternoon.", vi: 'Đây thật là một buổi chiều tuyệt vời. (= It has)' },
      ],
      mistakes: [
        { wrong: "The cat cleans it's paws.", right: 'The cat cleans its paws.', note: 'Khi nói "của nó" không bao giờ dùng dấu nháy đơn; viết là "its".' },
        { wrong: 'Its raining outside right now.', right: "It's raining outside right now.", note: 'Nghĩa là "It is raining" nên phải có dấu nháy đơn: "It\'s".' },
      ],
    },
  ],

  reading: {
    title: 'Đồ của ai để quên trong lớp?',
    passage: [
      'Lan: Minh, wait for me! I found a red notebook on your desk. Is it yours?',
      'Minh: No, mine is blue. Look inside! Maybe it belongs to Mai because she sat here.',
      'Lan: Let me check. Yes, her name is on the cover! I will give it to her later.',
      'Minh: What about this water bottle? He left it here—that must be Mr. Tom, because his bag is green.',
      'Lan: Good catch! Look at that kitten outside—its fur is snow white.',
      'Minh: We should ask our classmates if they know its owner.',
    ].join('\n'),
    translation: [
      'Lan: Minh ơi, đợi mình với! Mình thấy một quyển vở đỏ trên bàn bạn. Có phải của bạn không?',
      'Minh: Không, quyển của mình màu xanh dương cơ. Xem bên trong thử! Có thể là của Mai vì bạn ấy ngồi ở đây.',
      'Lan: Để mình kiểm tra. Đúng rồi, tên bạn ấy ở ngay bìa! Lát mình sẽ đưa lại cho bạn ấy.',
      'Minh: Còn bình nước này thì sao? Thầy ấy để quên ở đây—chắc chắn là của thầy Tom, vì cặp của thầy màu xanh lá.',
      'Lan: Tinh mắt thật! Nhìn chú mèo con bên ngoài kìa—bộ lông của nó trắng như tuyết.',
      'Minh: Chúng mình nên hỏi các bạn cùng lớp xem họ có biết chủ của nó không.',
    ].join('\n'),
    highlights: ['Me', 'Your', 'Yours', 'Mine', 'She', 'Her', 'He', 'His', 'We', 'They'],
    questions: [
      {
        question: 'Quyển vở màu đỏ Lan nhặt được thực ra là của ai?',
        options: ['Của Minh', 'Của Mai', 'Của thầy Tom', 'Của Lan'],
        correct: 1,
        explanation: 'Lan kiểm tra bìa và nói: "Maybe it belongs to Mai… Yes, her name is on the cover!"',
      },
      {
        question: 'Vì sao Minh biết quyển vở đỏ không phải của mình?',
        options: ['Vì Minh không mang vở', 'Vì vở của Minh màu xanh dương', 'Vì Minh ngồi ở bàn khác', 'Vì vở của Minh ở trong thư viện'],
        correct: 1,
        explanation: 'Minh trả lời: "No, mine is blue." ("mine" = my notebook).',
      },
      {
        question: 'Minh đoán bình nước là của ai?',
        options: ['Của Mai', 'Của Lan', 'Của thầy Tom', 'Của cô Hoa'],
        correct: 2,
        explanation: 'Minh nói: "that must be Mr. Tom, because his bag is green."',
      },
      {
        question: 'Hai bạn dự định làm gì với chú mèo con bên ngoài?',
        options: ['Mang về nhà ngay', 'Hỏi các bạn cùng lớp xem ai biết chủ của nó', 'Tặng cho thầy Tom', 'Cho nó vào phòng học'],
        correct: 1,
        explanation: 'Minh đề nghị: "We should ask our classmates if they know its owner."',
      },
    ],
  },

  quiz: [
    {
      skill: 'grammar',
      question: 'Điền đại từ đúng: "Please pass the English dictionary to ___."',
      options: ['I', 'me', 'my', 'mine'],
      correct: 1,
      explanation: 'Sau giới từ "to" dùng đại từ tân ngữ "me".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng khi đại từ sở hữu đứng một mình:',
      options: [
        'This backpack is my.',
        'This backpack is mine.',
        'This backpack is me.',
        'This backpack is I.',
      ],
      correct: 1,
      explanation: '"Mine" = "my backpack", dùng khi đứng riêng không kèm danh từ.',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "Minh forgot his pen, so I lent ___ a spare one."',
      options: ['he', 'his', 'him', 'himself'],
      correct: 2,
      explanation: 'Sau động từ "lent" cần đại từ tân ngữ "him".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng về "its" và "it\'s":',
      options: [
        "The puppy wags it's tail.",
        'The puppy wags its tail.',
        "The puppy wags its' tail.",
        'The puppy wags it tail.',
      ],
      correct: 1,
      explanation: '"Its" (không dấu nháy đơn) là tính từ sở hữu nghĩa là "của nó".',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "___ raining heavily outside."',
      options: ['Its', "It's", 'It', 'His'],
      correct: 1,
      explanation: '"It\'s" là dạng rút gọn của "It is".',
    },
    {
      skill: 'vocab',
      question: 'Đại từ nào có thể đứng một mình thay cho "our classroom"?',
      options: ['us', 'our', 'ours', 'we'],
      correct: 2,
      explanation: '"Ours" là đại từ sở hữu, thay cho "our + danh từ".',
    },
    {
      skill: 'usage',
      question: 'Bạn nhặt được một chiếc mũ và muốn hỏi bạn bên cạnh xem có phải của bạn ấy không. Bạn hỏi:',
      options: [
        'Is this hat you?',
        'Is this hat your?',
        'Is this hat yours?',
        'Is this hat me?',
      ],
      correct: 2,
      explanation: '"Is this hat yours?" = Chiếc mũ này là của bạn phải không?',
    },
    {
      skill: 'listening',
      audioText: 'That green notebook is mine, not yours.',
      question: 'Nghe và chọn ý đúng:',
      options: [
        'Quyển vở xanh là của mình, không phải của bạn.',
        'Quyển vở xanh là của bạn, không phải của mình.',
        'Cả hai quyển vở đều là của thầy giáo.',
        'Không ai biết quyển vở của ai.',
      ],
      correct: 0,
      explanation: '"mine, not yours" = của mình, không phải của bạn.',
    },
    {
      skill: 'listening',
      audioText: 'They left their umbrellas by the door.',
      question: 'Nghe và chọn họ đã để quên vật gì cạnh cửa:',
      options: ['Ba lô của họ', 'Ô của họ', 'Sách của họ', 'Giày của họ'],
      correct: 1,
      explanation: '"their umbrellas" = những chiếc ô của họ.',
    },
  ],
};

export default PRONOUNS_LESSON;
