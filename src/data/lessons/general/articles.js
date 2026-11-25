// Track: general — Unit int-u4 · Mạo từ A / An / The (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const ARTICLES_LESSON = {
  id: 'articles',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u4',
  title: 'Mạo từ A / An / The',
  description: 'Dùng đúng a, an theo âm đọc, dùng the cho đối tượng xác định và biết khi nào không dùng mạo từ',
  icon: '🔠',
  objectives: [
    'Chọn đúng a hoặc an dựa trên âm đọc đầu tiên (kể cả an hour, a university)',
    'Phân biệt a/an (nhắc lần đầu) và the (đã xác định hoặc duy nhất như the sun, the Earth)',
    'Tránh thêm thừa "the" trước danh từ chung không đếm được, bữa ăn, môn học và ngôn ngữ',
  ],

  vocabulary: [
    v('A book', '/ə bʊk/', 'phrase', 'Một quyển sách (chưa xác định)', 'Lan bought a book at the fair.', 'Lan đã mua một quyển sách ở hội chợ.', '📕'),
    v('An apple', '/ən ˈæpəl/', 'phrase', 'Một quả táo (trước âm nguyên âm)', 'I packed an apple for lunch.', 'Mình đã gói một quả táo cho bữa trưa.', '🍎'),
    v('An hour', '/ən ˈaʊər/', 'phrase', 'Một tiếng đồng hồ (âm h câm)', 'The bus ride takes an hour.', 'Chuyến xe buýt mất một tiếng đồng hồ.', '⏰'),
    v('An umbrella', '/ən ʌmˈbrelə/', 'phrase', 'Một chiếc ô', 'Please take an umbrella today.', 'Hôm nay bạn nhớ mang theo một chiếc ô nhé.', '☂️'),
    v('A university', '/ə ˌjuːnɪˈvɜːrsəti/', 'phrase', 'Một trường đại học (đọc âm /j/)', 'My cousin studies at a university.', 'Anh họ mình học ở một trường đại học.', '🎓'),
    v('An honest', '/ən ˈɑːnɪst/', 'phrase', 'Một (người) trung thực (h câm)', 'Minh is an honest friend.', 'Minh là một người bạn trung thực.', '🤝'),
    v('The sun', '/ðə sʌn/', 'phrase', 'Mặt trời (duy nhất)', 'The sun rises in the east.', 'Mặt trời mọc ở hướng đông.', '☀️'),
    v('The moon', '/ðə muːn/', 'phrase', 'Mặt trăng (duy nhất)', 'The moon looks bright tonight.', 'Tối nay mặt trăng trông thật sáng.', '🌕'),
    v('The Earth', '/ði ɜːrθ/', 'phrase', 'Trái Đất (duy nhất)', 'The Earth moves around the sun.', 'Trái Đất quay quanh mặt trời.', '🌍'),
    v('Music', '/ˈmjuːzɪk/', 'noun', 'Âm nhạc (không đếm được, không mạo từ)', 'I love listening to music.', 'Mình thích nghe nhạc.', '🎵'),
    v('Breakfast', '/ˈbrekfəst/', 'noun', 'Bữa sáng (bữa ăn, không mạo từ)', 'We eat breakfast at six thirty.', 'Chúng mình ăn sáng lúc sáu giờ rưỡi.', '🍳'),
    v('English', '/ˈɪŋɡlɪʃ/', 'noun', 'Tiếng Anh (ngôn ngữ, không mạo từ)', 'Lan practices English every day.', 'Lan luyện tập tiếng Anh mỗi ngày.', '🗣️'),
  ],

  grammar: [
    {
      title: 'A vs An: phụ thuộc vào ÂM ĐỌC, không phải chữ cái',
      explanation: 'Dùng "an" trước âm nguyên âm (/æ, e, ɪ, ɑː, ʌ, aʊ…/) và dùng "a" trước âm phụ âm. Vì vậy "hour" (/ˈaʊər/, h câm) và "honest" (/ˈɑːnɪst/) dùng "an"; còn "university" (/ˌjuː-/) và "uniform" (/ˈjuː-/) bắt đầu bằng âm phụ âm /j/ nên dùng "a".',
      examples: [
        { en: 'She eats an apple every morning.', vi: 'Bạn ấy ăn một quả táo mỗi sáng.' },
        { en: 'We waited for an hour at the station.', vi: 'Chúng mình đã đợi một tiếng ở nhà ga.' },
        { en: 'He dreams of studying at a university.', vi: 'Cậu ấy mơ ước được học ở một trường đại học.' },
        { en: 'Take an umbrella because the sky is cloudy.', vi: 'Mang theo một chiếc ô vì bầu trời nhiều mây.' },
      ],
      mistakes: [
        { wrong: 'Wait for a hour.', right: 'Wait for an hour.', note: 'Chữ "h" trong "hour" bị câm, đọc bắt đầu bằng nguyên âm /aʊ/ → dùng "an hour".' },
        { wrong: 'She goes to an university.', right: 'She goes to a university.', note: '"University" đọc là /ˌjuːnɪˈvɜːrsəti/, bắt đầu bằng âm phụ âm /j/ → dùng "a university".' },
      ],
    },
    {
      title: 'Phân biệt A/An, The và Không dùng mạo từ (Zero Article)',
      explanation: 'Dùng "a/an" khi nhắc lần đầu; dùng "the" khi nhắc lại lần hai hoặc vật duy nhất (the sun, the moon, the Earth). KHÔNG dùng mạo từ trước danh từ nói chung không đếm được (music, water), tên bữa ăn (breakfast, lunch), môn học, môn thể thao và ngôn ngữ (English).',
      examples: [
        { en: 'I bought a book. The book is very interesting.', vi: 'Mình mua một quyển sách. Quyển sách đó rất thú vị.' },
        { en: 'The Earth travels around the sun.', vi: 'Trái Đất quay quanh mặt trời.' },
        { en: 'We have breakfast before going to school.', vi: 'Chúng mình ăn sáng trước khi đến trường.' },
        { en: 'Minh loves music and speaks English well.', vi: 'Minh yêu âm nhạc và nói tiếng Anh tốt.' },
      ],
      mistakes: [
        { wrong: 'I love the music very much.', right: 'I love music very much.', note: 'Nói về âm nhạc nói chung không dùng "the".' },
        { wrong: 'We eat a breakfast at seven.', right: 'We eat breakfast at seven.', note: 'Trước tên bữa ăn thông thường (breakfast, lunch, dinner) không dùng "a/the".' },
      ],
    },
  ],

  reading: {
    title: 'Buổi sáng trên đường đi học',
    passage: [
      'Minh: Good morning, Lan! Did you eat breakfast before leaving home?',
      'Lan: Yes, I had bread and an apple. Look up—the sun is bright today, so I do not need an umbrella.',
      'Minh: My brother walks to a university near here. It takes him about half an hour.',
      'Lan: Nice! I bought a book yesterday about the moon and the Earth. The book has colorful maps.',
      'Minh: That sounds fun. Do you listen to music while studying English?',
      'Lan: Sometimes, because soft music helps me stay calm!',
    ].join('\n'),
    translation: [
      'Minh: Chào buổi sáng Lan! Bạn đã ăn sáng trước khi ra khỏi nhà chưa?',
      'Lan: Rồi, mình ăn bánh mì và một quả táo. Nhìn lên kìa—hôm nay mặt trời sáng rực nên mình không cần ô đâu.',
      'Minh: Anh trai mình đi bộ tới một trường đại học gần đây. Anh ấy đi mất khoảng nửa tiếng.',
      'Lan: Hay quá! Hôm qua mình mua một quyển sách về mặt trăng và Trái Đất. Quyển sách có nhiều bản đồ màu đẹp lắm.',
      'Minh: Nghe thú vị đấy. Bạn có nghe nhạc khi học tiếng Anh không?',
      'Lan: Thỉnh thoảng có, vì nhạc nhẹ giúp mình giữ bình tĩnh!',
    ].join('\n'),
    highlights: ['Breakfast', 'Apple', 'Sun', 'Umbrella', 'University', 'Hour', 'Book', 'Moon', 'Earth', 'Music', 'English'],
    questions: [
      {
        question: 'Sáng nay Lan đã ăn gì?',
        options: ['Bánh mì và một quả táo', 'Phở và sữa', 'Cơm và trứng', 'Lan chưa ăn sáng'],
        correct: 0,
        explanation: 'Lan nói: "Yes, I had bread and an apple."',
      },
      {
        question: 'Vì sao Lan không mang theo ô hôm nay?',
        options: ['Vì Lan quên ở nhà', 'Vì mặt trời sáng rực', 'Vì Lan đi bằng xe buýt', 'Vì ô bị hỏng'],
        correct: 1,
        explanation: 'Lan nói: "the sun is bright today, so I do not need an umbrella."',
      },
      {
        question: 'Anh trai của Minh đi bộ tới trường đại học mất bao lâu?',
        options: ['Mười phút', 'Một tiếng rưỡi', 'Khoảng nửa tiếng', 'Hai tiếng'],
        correct: 2,
        explanation: 'Minh kể: "It takes him about half an hour."',
      },
      {
        question: 'Quyển sách Lan mới mua nói về chủ đề gì?',
        options: ['Âm nhạc hiện đại', 'Bữa sáng quanh thế giới', 'Các trường đại học', 'Mặt trăng và Trái Đất'],
        correct: 3,
        explanation: 'Lan nói: "I bought a book yesterday about the moon and the Earth."',
      },
    ],
  },

  quiz: [
    {
      skill: 'grammar',
      question: 'Điền mạo từ đúng: "We waited for ___ hour."',
      options: ['an', 'a', 'the', 'không cần mạo từ'],
      correct: 0,
      explanation: '"Hour" có chữ "h" câm, đọc là /ˈaʊər/ (âm nguyên âm) nên dùng "an".',
    },
    {
      skill: 'grammar',
      question: 'Điền mạo từ đúng: "My sister studies at ___ university in Can Tho."',
      options: ['an', 'a', 'the', 'không cần mạo từ'],
      correct: 1,
      explanation: '"University" bắt đầu bằng âm phụ âm /j/ nên dùng "a".',
    },
    {
      skill: 'grammar',
      question: 'Điền mạo từ đúng: "Minh is ___ honest boy."',
      options: ['a', 'the', 'an', 'không cần mạo từ'],
      correct: 2,
      explanation: '"Honest" có âm "h" câm (/ˈɑːnɪst/) nên đi với "an".',
    },
    {
      skill: 'grammar',
      question: 'Điền mạo từ đúng: "I saw a kitten. ___ kitten was very cute."',
      options: ['A', 'An', 'Không cần mạo từ', 'The'],
      correct: 3,
      explanation: 'Khi danh từ đã được nhắc ở câu trước, câu sau dùng "The" vì đã xác định.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng:',
      options: [
        'I love music and play football.',
        'I love the music and play the football.',
        'I love a music and play a football.',
        'I love an music and play football.',
      ],
      correct: 0,
      explanation: 'Trước danh từ chung không đếm được (music) và môn thể thao (football) không dùng mạo từ.',
    },
    {
      skill: 'grammar',
      question: 'Điền cặp mạo từ đúng: "___ Earth goes around ___ sun."',
      options: ['A / a', 'The / the', 'An / a', 'Không mạo từ / the'],
      correct: 1,
      explanation: 'Trái Đất và mặt trời là đối tượng duy nhất nên đều dùng "the".',
    },
    {
      skill: 'usage',
      question: 'Trời nhiều mây sắp mưa, mẹ nhắc con mang ô bằng câu nào tự nhiên nhất?',
      options: [
        'Take a umbrella, please.',
        'Take umbrella, please.',
        'Take an umbrella, please.',
        'Take some umbrella, please.',
      ],
      correct: 2,
      explanation: '"Umbrella" bắt đầu bằng âm nguyên âm /ʌ/ nên dùng "an umbrella".',
    },
    {
      skill: 'listening',
      audioText: 'We eat breakfast at six thirty every morning.',
      question: 'Nghe và chọn câu đúng:',
      options: [
        'Họ đi đại học lúc sáu giờ.',
        'Họ ăn trưa lúc bảy giờ rưỡi.',
        'Họ nghe nhạc mỗi tối.',
        'Họ ăn sáng lúc sáu giờ rưỡi mỗi sáng.',
      ],
      correct: 3,
      explanation: '"eat breakfast at six thirty" = ăn sáng lúc 6 giờ 30.',
    },
    {
      skill: 'listening',
      audioText: 'Lan speaks English very clearly.',
      question: 'Nghe và chọn môn/ngôn ngữ được nhắc đến:',
      options: ['Tiếng Anh', 'Âm nhạc', 'Khoa học', 'Mỹ thuật'],
      correct: 0,
      explanation: 'Câu nghe nhắc rõ "English" (không dùng mạo từ trước tên ngôn ngữ).',
    },
  ],
};

export default ARTICLES_LESSON;
