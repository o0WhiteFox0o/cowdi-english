// Track: general — Unit int-u2 · Trường học (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const SCHOOL_LESSON = {
  id: 'school',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u2',
  title: 'Trường học',
  description: 'Nói về trường lớp, môn học, đồ dùng học tập và vị trí ở trường',
  icon: '🏫',
  objectives: [
    'Gọi tên các phòng, môn học và đồ dùng quen thuộc ở trường',
    'Dùng đúng giới từ nơi chốn at, in, on khi nói vị trí đồ vật và người',
    'Nói về lịch học và môn học yêu thích của bản thân',
  ],

  vocabulary: [
    v('School', '/skuːl/', 'noun', 'Trường học', 'I go to school every morning.', 'Mình đi học mỗi sáng.', '🏫'),
    v('Teacher', '/ˈtiːtʃər/', 'noun', 'Giáo viên', 'Our teacher is very patient.', 'Thầy cô giáo của chúng mình rất kiên nhẫn.', '👩‍🏫'),
    v('Student', '/ˈstuːdənt/', 'noun', 'Học sinh', 'Minh is a hardworking student.', 'Minh là một học sinh chăm chỉ.', '🧑‍🎓'),
    v('Classroom', '/ˈklæsruːm/', 'noun', 'Phòng học', 'Our classroom has big windows.', 'Phòng học của chúng mình có cửa sổ lớn.', '🪑'),
    v('Book', '/bʊk/', 'noun', 'Quyển sách', 'Please open your English book.', 'Vui lòng mở sách tiếng Anh của bạn ra.', '📖'),
    v('Pencil', '/ˈpensəl/', 'noun', 'Bút chì', 'Can I borrow your pencil?', 'Cho mình mượn bút chì của bạn nhé?', '✏️'),
    v('Notebook', '/ˈnoʊtbʊk/', 'noun', 'Quyển vở', 'Write the new words in your notebook.', 'Viết các từ mới vào vở của bạn.', '📓'),
    v('Homework', '/ˈhoʊmwɜːrk/', 'noun', 'Bài tập về nhà', 'I always finish my homework early.', 'Mình luôn làm xong bài tập về nhà sớm.', '📝'),
    v('Subject', '/ˈsʌbdʒɪkt/', 'noun', 'Môn học', 'Math is my favorite subject.', 'Toán là môn học yêu thích của mình.', '📚'),
    v('Exam', '/ɪɡˈzæm/', 'noun', 'Bài kiểm tra, kỳ thi', 'We have an English exam tomorrow.', 'Ngày mai chúng mình có bài kiểm tra tiếng Anh.', '📋'),
    v('Library', '/ˈlaɪbreri/', 'noun', 'Thư viện', 'Lan likes reading in the library.', 'Lan thích đọc sách trong thư viện.', '🏛️'),
    v('Desk', '/desk/', 'noun', 'Bàn học', 'My pencil is on the desk.', 'Cây bút chì của mình ở trên bàn học.', '🪵'),
  ],

  grammar: [
    {
      title: 'Giới từ chỉ nơi chốn: at, in, on',
      explanation: 'Dùng "at" với địa điểm nói chung (at school, at home), "in" cho không gian khép kín bên trong (in the classroom, in the library, in my bag), và "on" cho bề mặt (on the desk, on the board).',
      examples: [
        { en: 'Lan and Minh are at school now.', vi: 'Lan và Minh hiện đang ở trường.' },
        { en: 'The students are in the classroom.', vi: 'Các bạn học sinh đang ở trong phòng học.' },
        { en: 'Your notebook is on the desk.', vi: 'Quyển vở của bạn ở trên bàn học.' },
        { en: 'We read quiet books in the library.', vi: 'Chúng mình đọc sách yên tĩnh trong thư viện.' },
        { en: 'Put your pencil in your bag.', vi: 'Cất bút chì vào cặp của bạn đi.' },
      ],
      mistakes: [
        { wrong: 'The book is in the desk. (khi sách nằm trên mặt bàn)', right: 'The book is on the desk.', note: 'Đồ vật đặt trên mặt bàn dùng "on", còn bên trong ngăn bàn mới dùng "in".' },
        { wrong: 'She is on the classroom.', right: 'She is in the classroom.', note: 'Phòng học là không gian bên trong nên phải dùng "in".' },
      ],
    },
    {
      title: 'Nói về lịch học và môn học: have / has + môn học',
      explanation: 'Dùng "I / You / We / They + have" và "He / She + has" để nói có môn học, bài kiểm tra hay đồ dùng gì. Dùng "on + thứ trong tuần" (on Monday, on Friday).',
      examples: [
        { en: 'We have English on Monday.', vi: 'Chúng mình có môn tiếng Anh vào thứ Hai.' },
        { en: 'Minh has a math exam today.', vi: 'Hôm nay Minh có bài kiểm tra Toán.' },
        { en: 'Do you have an extra pencil?', vi: 'Bạn có cây bút chì dự phòng nào không?' },
        { en: 'My favorite subject is science.', vi: 'Môn học yêu thích của mình là khoa học.' },
      ],
      mistakes: [
        { wrong: 'Minh have homework today.', right: 'Minh has homework today.', note: 'Chủ ngữ số ít "Minh" đi với "has", không dùng "have".' },
        { wrong: 'We have English in Monday.', right: 'We have English on Monday.', note: 'Trước các thứ trong tuần luôn dùng giới từ "on", không dùng "in".' },
      ],
    },
  ],

  reading: {
    title: 'Trước giờ kiểm tra tiếng Anh',
    passage: [
      'Minh: Hi, Lan! Are you ready for the English exam today?',
      'Lan: Yes! I finished my homework last night and studied in the library.',
      'Minh: That is great. English is my favorite subject, too.',
      'Lan: Oh no, where is my pencil? It is not in my bag.',
      'Minh: Look! Your pencil is on the desk next to your notebook and book.',
      'Lan: Thank you, Minh! You are a helpful student.',
      'Minh: Let us go into the classroom now. Our teacher, Mr. Tom, is already at school.',
    ].join('\n'),
    translation: [
      'Minh: Chào Lan! Hôm nay bạn đã sẵn sàng cho bài kiểm tra tiếng Anh chưa?',
      'Lan: Rồi! Tối qua mình đã làm xong bài tập về nhà và ôn bài ở thư viện.',
      'Minh: Tuyệt quá. Tiếng Anh cũng là môn học yêu thích của mình.',
      'Lan: Ôi không, bút chì của mình đâu rồi? Nó không có trong cặp.',
      'Minh: Nhìn kìa! Bút chì của bạn ở trên bàn học ngay cạnh quyển vở và sách đó.',
      'Lan: Cảm ơn Minh nhé! Bạn đúng là một học sinh hay giúp đỡ.',
      'Minh: Mình vào phòng học thôi. Thầy giáo của chúng mình, thầy Tom, đã có mặt ở trường rồi.',
    ].join('\n'),
    highlights: ['School', 'Teacher', 'Student', 'Classroom', 'Book', 'Pencil', 'Notebook', 'Homework', 'Subject', 'Exam', 'Library', 'Desk'],
    questions: [
      {
        question: 'Hôm nay Lan và Minh có bài kiểm tra môn gì?',
        options: ['Toán', 'Tiếng Anh', 'Khoa học', 'Lịch sử'],
        correct: 1,
        explanation: 'Minh hỏi: "Are you ready for the English exam today?".',
      },
      {
        question: 'Lan đã ôn bài ở đâu?',
        options: ['Ở nhà', 'Ở sân trường', 'Ở trong thư viện', 'Ở nhà sách'],
        correct: 2,
        explanation: 'Lan nói: "I finished my homework last night and studied in the library."',
      },
      {
        question: 'Cây bút chì của Lan nằm ở đâu?',
        options: ['Trong cặp sách của Lan', 'Trên bàn làm việc thầy Tom', 'Ở trong thư viện trường', 'Trên bàn học cạnh sách vở'],
        correct: 3,
        explanation: 'Minh chỉ cho Lan: "Your pencil is on the desk next to your notebook and book."',
      },
      {
        question: 'Ai đã có mặt ở trường rồi?',
        options: ['Thầy Tom', 'Em gái Mai', 'Cô Hoa', 'Mẹ của Lan'],
        correct: 0,
        explanation: 'Minh nói: "Our teacher, Mr. Tom, is already at school."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Library" là nơi nào trong trường?',
      options: ['Phòng y tế', 'Thư viện', 'Sân bóng', 'Nhà ăn'],
      correct: 1,
      explanation: '"Library" nghĩa là thư viện — nơi đọc và mượn sách.',
    },
    {
      skill: 'vocab',
      question: 'Món nào dùng để ghi chép bài giảng trên lớp?',
      options: ['Exam', 'Subject', 'Notebook', 'Classroom'],
      correct: 2,
      explanation: '"Notebook" là quyển vở ghi chép.',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "My notebook is ___ the desk."',
      options: ['in', 'at', 'to', 'on'],
      correct: 3,
      explanation: 'Đặt trên bề mặt bàn dùng giới từ "on".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng:',
      options: [
        'She is in the classroom.',
        'She is on the classroom.',
        'She is to the classroom.',
        'She are in the classroom.',
      ],
      correct: 0,
      explanation: 'Ở bên trong phòng học dùng "in the classroom", và "She" đi với "is".',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "Minh ___ an English exam ___ Friday."',
      options: ['have / in', 'has / on', 'has / in', 'have / on'],
      correct: 1,
      explanation: 'Chủ ngữ số ít "Minh" dùng "has"; trước thứ trong tuần dùng "on".',
    },
    {
      skill: 'usage',
      question: 'Bạn quên mang bút chì và muốn hỏi mượn bạn cùng bàn. Bạn nói:',
      options: [
        'Where is your school?',
        'My favorite subject is art.',
        'Can I borrow your pencil?',
        'I finished my homework.',
      ],
      correct: 2,
      explanation: '"Can I borrow your pencil?" là cách hỏi mượn lịch sự.',
    },
    {
      skill: 'listening',
      audioText: 'Math is my favorite subject.',
      question: 'Nghe và chọn câu đúng với điều bạn nghe được:',
      options: [
        'Bạn ấy có bài thi Toán ngày mai.',
        'Bạn ấy không thích môn Toán.',
        'Bạn ấy đang làm bài tập Toán.',
        'Toán là môn học yêu thích của bạn ấy.',
      ],
      correct: 3,
      explanation: '"Math is my favorite subject" nghĩa là Toán là môn học yêu thích của mình.',
    },
    {
      skill: 'listening',
      audioText: 'The students are studying in the library.',
      question: 'Nghe và chọn nơi các học sinh đang học:',
      options: ['Trong thư viện', 'Ở nhà', 'Trong phòng học', 'Ở sân trường'],
      correct: 0,
      explanation: 'Câu nghe nhắc rõ "in the library" (trong thư viện).',
    },
    {
      skill: 'vocab',
      question: 'Từ nào chỉ bài tập cô giáo giao về làm ở nhà?',
      options: ['Classroom', 'Homework', 'Teacher', 'Desk'],
      correct: 1,
      explanation: '"Homework" = bài tập về nhà.',
    },
  ],
};

export default SCHOOL_LESSON;
