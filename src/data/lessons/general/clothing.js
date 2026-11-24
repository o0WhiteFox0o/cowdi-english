// Track: general — Unit int-u3 · Quần áo (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const CLOTHING_LESSON = {
  id: 'clothing',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u3',
  title: 'Quần áo',
  description: 'Gọi tên trang phục, phụ kiện và cách nói mặc đồ phù hợp từng hoàn cảnh',
  icon: '👗',
  objectives: [
    'Gọi tên các loại quần áo, giày dép và phụ kiện quen thuộc',
    'Phân biệt đúng động từ wear (đang mặc) và put on / take off (mặc vào / cởi ra)',
    'Dùng đúng động từ số nhiều với các danh từ trang phục đi theo đôi hoặc cặp',
  ],

  vocabulary: [
    v('Shirt', '/ʃɜːrt/', 'noun', 'Áo sơ mi', 'Minh wears a clean white shirt.', 'Minh mặc một chiếc áo sơ mi trắng sạch sẽ.', '👔'),
    v('T-shirt', '/ˈtiː ʃɜːrt/', 'noun', 'Áo thun', 'I like wearing a cotton T-shirt.', 'Mình thích mặc áo thun cotton.', '👕'),
    v('Dress', '/dres/', 'noun', 'Váy liền thân', 'Mai wears a yellow dress today.', 'Hôm nay Mai mặc một chiếc váy vàng.', '👗'),
    v('Shoes', '/ʃuːz/', 'noun', 'Đôi giày', 'Take off your shoes at the door.', 'Hãy cởi giày ở cửa nhé.', '👟'),
    v('Hat', '/hæt/', 'noun', 'Mũ, nón', 'Wear a hat on sunny days.', 'Đội mũ vào những ngày nắng nhé.', '🎩'),
    v('Jacket', '/ˈdʒækɪt/', 'noun', 'Áo khoác', 'Put on your jacket before going out.', 'Mặc áo khoác vào trước khi ra ngoài.', '🧥'),
    v('Jeans', '/dʒiːnz/', 'noun', 'Quần jeans', 'These blue jeans are very comfortable.', 'Chiếc quần jeans xanh này rất thoải mái.', '👖'),
    v('Socks', '/sɑːks/', 'noun', 'Đôi tất, vớ', 'My warm socks are in the drawer.', 'Đôi tất ấm của mình ở trong ngăn kéo.', '🧦'),
    v('Scarf', '/skɑːrf/', 'noun', 'Khăn quàng cổ', 'She wears a red scarf in winter.', 'Cô ấy quàng khăn đỏ vào mùa đông.', '🧣'),
    v('Glasses', '/ˈɡlæsɪz/', 'noun', 'Kính mắt', 'Minh wears glasses when he reads.', 'Minh đeo kính khi đọc sách.', '👓'),
    v('Uniform', '/ˈjuːnɪfɔːrm/', 'noun', 'Đồng phục', 'Students wear a school uniform on Monday.', 'Học sinh mặc đồng phục trường vào thứ Hai.', '🎽'),
    v('Coat', '/koʊt/', 'noun', 'Áo choàng, áo khoác dày', 'Bring a heavy coat to Da Lat.', 'Mang theo áo khoác dày khi đi Đà Lạt nhé.', '🧥'),
  ],

  grammar: [
    {
      title: 'Phân biệt "wear" (trạng thái) và "put on / take off" (hành động)',
      explanation: '"Wear" diễn tả trạng thái đang mặc/đeo trên người (I am wearing a shirt). "Put on" là hành động mặc/đeo vào, còn "take off" là hành động cởi/tháo ra.',
      examples: [
        { en: 'Lan is wearing a blue jacket today.', vi: 'Hôm nay Lan đang mặc áo khoác xanh.' },
        { en: 'Put on your socks and shoes quickly.', vi: 'Mang tất và giày vào nhanh lên nào.' },
        { en: 'Please take off your hat in class.', vi: 'Vui lòng bỏ mũ ra khi ở trong lớp.' },
        { en: 'My father always wears glasses at work.', vi: 'Bố mình luôn đeo kính khi làm việc.' },
      ],
      mistakes: [
        { wrong: 'Wear your coat, it is cold!', right: 'Put on your coat, it is cold!', note: 'Khi bảo ai đó thực hiện hành động mặc vào, dùng "put on", không dùng "wear".' },
        { wrong: 'She is putting on a red dress all day.', right: 'She is wearing a red dress all day.', note: 'Mô tả trạng thái mặc suốt cả ngày phải dùng "is wearing".' },
      ],
    },
    {
      title: 'Danh từ trang phục luôn ở số nhiều (shoes, jeans, socks, glasses)',
      explanation: 'Các món đồ có 2 ống hoặc đi theo cặp như jeans, shoes, socks, glasses luôn dùng động từ số nhiều (are) và từ chỉ định số nhiều (these / those). Khi đếm, dùng "a pair of…" (một đôi/một chiếc).',
      examples: [
        { en: 'My new shoes are very light.', vi: 'Đôi giày mới của mình rất nhẹ.' },
        { en: 'Where are my glasses?', vi: 'Kính của mình ở đâu rồi?' },
        { en: 'These jeans are too long for me.', vi: 'Chiếc quần jeans này quá dài với mình.' },
        { en: 'I bought a pair of white socks.', vi: 'Mình đã mua một đôi tất trắng.' },
      ],
      mistakes: [
        { wrong: 'My jeans is blue.', right: 'My jeans are blue.', note: '"Jeans" luôn ở dạng số nhiều nên đi với "are", không dùng "is".' },
        { wrong: 'I need a new glasses.', right: 'I need a new pair of glasses.', note: 'Không dùng "a" trực tiếp trước "glasses"; dùng "a pair of glasses".' },
      ],
    },
  ],

  reading: {
    title: 'Chuẩn bị đồ cho chuyến đi Đà Lạt',
    passage: [
      'Lan: Minh, we do not have to wear our school uniform on Saturday. What are you packing?',
      'Minh: I am bringing blue jeans, a T-shirt, and a white shirt for daytime.',
      'Lan: Da Lat gets cold at night. Remember to bring a warm jacket or a thick coat.',
      'Minh: Good point! I will also pack a scarf and two pairs of socks.',
      'Lan: Are you taking your running shoes?',
      'Minh: Yes, my shoes are ready by the door. What about you, Lan?',
      'Lan: I am taking a pretty dress, a sun hat, and my glasses so I can see the mountains clearly.',
    ].join('\n'),
    translation: [
      'Lan: Minh ơi, thứ Bảy mình không phải mặc đồng phục trường đâu. Bạn đang xếp đồ gì thế?',
      'Minh: Mình mang quần jeans xanh, một chiếc áo thun và một áo sơ mi trắng cho ban ngày.',
      'Lan: Đà Lạt buổi tối lạnh lắm. Nhớ mang áo khoác ấm hoặc áo khoác dày nhé.',
      'Minh: Đúng rồi! Mình cũng sẽ xếp thêm một chiếc khăn quàng cổ và hai đôi tất.',
      'Lan: Bạn có mang giày chạy bộ không?',
      'Minh: Có, giày của mình đã để sẵn cạnh cửa rồi. Còn bạn thì sao, Lan?',
      'Lan: Mình mang một chiếc váy xinh, một cái mũ che nắng và kính mắt để ngắm núi thật rõ.',
    ].join('\n'),
    highlights: ['Uniform', 'Jeans', 'Shirt', 'Jacket', 'Coat', 'Scarf', 'Socks', 'Shoes', 'Dress', 'Hat', 'Glasses'],
    questions: [
      {
        question: 'Lan và Minh đang chuẩn bị quần áo để đi đâu?',
        options: ['Đi học ngày thứ Hai', 'Đi chơi Đà Lạt cuối tuần', 'Đi bơi ở biển', 'Đi thăm thư viện'],
        correct: 1,
        explanation: 'Lan nhắc: "Da Lat gets cold at night. Remember to bring a warm jacket or a thick coat."',
      },
      {
        question: 'Vì sao Lan khuyên Minh mang theo jacket hoặc coat?',
        options: ['Vì trường bắt mặc đồng phục', 'Vì Đà Lạt buổi tối trời lạnh', 'Vì trời nắng gắt', 'Vì họ sẽ đi dự tiệc'],
        correct: 1,
        explanation: '"Da Lat gets cold at night" — buổi tối ở Đà Lạt trời lạnh.',
      },
      {
        question: 'Đôi giày của Minh hiện đang để ở đâu?',
        options: ['Trong phòng học', 'Trong tủ bếp', 'Ngay cạnh cửa', 'Trong ba lô của Lan'],
        correct: 2,
        explanation: 'Minh nói: "my shoes are ready by the door."',
      },
      {
        question: 'Lan mang theo kính mắt để làm gì?',
        options: ['Để tránh gió', 'Để ngắm núi thật rõ', 'Để tặng cho Minh', 'Để đọc truyện trên xe'],
        correct: 1,
        explanation: 'Lan nói: "and my glasses so I can see the mountains clearly."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Món đồ nào quàng quanh cổ để giữ ấm vào mùa đông?',
      options: ['Scarf', 'Socks', 'Shoes', 'Shirt'],
      correct: 0,
      explanation: '"Scarf" nghĩa là khăn quàng cổ.',
    },
    {
      skill: 'vocab',
      question: '"Uniform" là trang phục gì?',
      options: ['Đồ đi biển', 'Đồng phục', 'Áo khoác mưa', 'Đồ ngủ'],
      correct: 1,
      explanation: '"Uniform" = đồng phục (như đồng phục học sinh).',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "It is cold outside. ___ your jacket!"',
      options: ['Wear', 'Put on', 'Take off', 'Wearing'],
      correct: 1,
      explanation: 'Nhắc ai đó hành động mặc áo vào dùng "Put on".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng khi nói về trạng thái hiện tại:',
      options: [
        'Lan is putting a blue dress all afternoon.',
        'Lan is wearing a blue dress today.',
        'Lan wearing a blue dress today.',
        'Lan wears on a blue dress today.',
      ],
      correct: 1,
      explanation: 'Trạng thái đang mặc dùng thì hiện tại tiếp diễn với "wear": "is wearing".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng với danh từ "jeans":',
      options: [
        'This jeans is comfortable.',
        'These jeans is comfortable.',
        'These jeans are comfortable.',
        'A jeans are comfortable.',
      ],
      correct: 2,
      explanation: '"Jeans" luôn chia số nhiều → "These jeans are…".',
    },
    {
      skill: 'grammar',
      question: 'Chọn cách nói đúng cho 1 chiếc kính mắt mới:',
      options: [
        'a new glasses',
        'a new pair of glasses',
        'two pair of glasses',
        'an glasses',
      ],
      correct: 1,
      explanation: 'Với "glasses", dùng cụm đếm "a pair of glasses".',
    },
    {
      skill: 'usage',
      question: 'Bạn bước vào nhà bạn thân ở Việt Nam và muốn nhắc em gái cởi giày. Bạn nói:',
      options: [
        'Put on your hat at the door.',
        'Take off your shoes at the door.',
        'Wear your uniform at the door.',
        'Where is your coat?',
      ],
      correct: 1,
      explanation: '"Take off your shoes" = cởi giày ra.',
    },
    {
      skill: 'listening',
      audioText: 'Please put on your warm coat and scarf.',
      question: 'Nghe và chọn 2 món đồ người nói nhắc mặc vào:',
      options: ['Áo sơ mi và quần jeans', 'Áo khoác dày và khăn quàng cổ', 'Váy và mũ', 'Kính mắt và tất'],
      correct: 1,
      explanation: 'Câu nghe nhắc "warm coat" (áo khoác dày) và "scarf" (khăn quàng cổ).',
    },
    {
      skill: 'listening',
      audioText: 'Where are my black shoes?',
      question: 'Nghe và chọn điều người nói đang tìm:',
      options: ['Đôi giày màu đen', 'Đôi tất màu trắng', 'Chiếc áo khoác đen', 'Cặp kính mắt'],
      correct: 0,
      explanation: '"my black shoes" = đôi giày màu đen của mình.',
    },
  ],
};

export default CLOTHING_LESSON;
