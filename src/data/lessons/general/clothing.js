// Track: general — Unit int-u3 · Quần áo (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration, extra = {}) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration, ...extra });

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
  story: {
    scene_id: 'vs_day_phoi',
    intro_vi: 'Hôm nay Mai ra Vườn Sữa thăm Cowdi mà chưa biết chọn đồ gì. Con giúp Mai gọi tên quần áo nhé!',
    dialogue: {
      speaker_id: 'mai',
      text_en: 'What should I wear today?',
    },
  },

  vocabulary: [
    v('Shirt', '/ʃɜːrt/', 'noun', 'Áo sơ mi', 'Minh wears a clean white shirt.', 'Minh mặc một chiếc áo sơ mi trắng sạch sẽ.', '👔', { countable: true, plural: 'shirts' }),
    v('T-shirt', '/ˈtiː ʃɜːrt/', 'noun', 'Áo thun', 'I like wearing a cotton T-shirt.', 'Mình thích mặc áo thun cotton.', '👕', { countable: true, plural: 'T-shirts' }),
    v('Dress', '/dres/', 'noun', 'Váy liền thân', 'Mai wears a yellow dress today.', 'Hôm nay Mai mặc một chiếc váy vàng.', '👗', { countable: true, plural: 'dresses' }),
    v('Shoes', '/ʃuːz/', 'noun', 'Đôi giày', 'Take off your shoes at the door.', 'Hãy cởi giày ở cửa nhé.', '👟'),
    v('Hat', '/hæt/', 'noun', 'Mũ, nón', 'Wear a hat on sunny days.', 'Đội mũ vào những ngày nắng nhé.', '🎩', { countable: true, plural: 'hats' }),
    v('Jacket', '/ˈdʒækɪt/', 'noun', 'Áo khoác', 'Put on your jacket before going out.', 'Mặc áo khoác vào trước khi ra ngoài.', '🧥', { countable: true, plural: 'jackets' }),
    v('Jeans', '/dʒiːnz/', 'noun', 'Quần jeans', 'These blue jeans are very comfortable.', 'Chiếc quần jeans xanh này rất thoải mái.', '👖'),
    v('Socks', '/sɑːks/', 'noun', 'Đôi tất, vớ', 'My warm socks are in the drawer.', 'Đôi tất ấm của mình ở trong ngăn kéo.', '🧦'),
    v('Scarf', '/skɑːrf/', 'noun', 'Khăn quàng cổ', 'She wears a red scarf in winter.', 'Cô ấy quàng khăn đỏ vào mùa đông.', '🧣', { countable: true, plural: 'scarves' }),
    v('Glasses', '/ˈɡlæsɪz/', 'noun', 'Kính mắt', 'Minh wears glasses when he reads.', 'Minh đeo kính khi đọc sách.', '👓'),
    v('Uniform', '/ˈjuːnɪfɔːrm/', 'noun', 'Đồng phục', 'Students wear a school uniform on Monday.', 'Học sinh mặc đồng phục trường vào thứ Hai.', '🎽', { countable: true, plural: 'uniforms' }),
    v('Coat', '/koʊt/', 'noun', 'Áo choàng, áo khoác dày', 'Bring a heavy coat to Da Lat.', 'Mang theo áo khoác dày khi đi Đà Lạt nhé.', '🧥', { countable: true, plural: 'coats' }),
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
        options: ['Vì trường bắt mặc đồng phục', 'Vì trời nắng gắt', 'Vì Đà Lạt buổi tối trời lạnh', 'Vì họ sẽ đi dự tiệc'],
        correct: 2,
        explanation: '"Da Lat gets cold at night" — buổi tối ở Đà Lạt trời lạnh.',
      },
      {
        question: 'Đôi giày của Minh hiện đang để ở đâu?',
        options: ['Trong phòng học', 'Trong tủ bếp', 'Trong ba lô của Lan', 'Ngay cạnh cửa'],
        correct: 3,
        explanation: 'Minh nói: "my shoes are ready by the door."',
      },
      {
        question: 'Lan mang theo kính mắt để làm gì?',
        options: ['Để ngắm núi thật rõ', 'Để tránh gió', 'Để tặng cho Minh', 'Để đọc truyện trên xe'],
        correct: 0,
        explanation: 'Lan nói: "and my glasses so I can see the mountains clearly."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Món đồ nào quàng quanh cổ để giữ ấm vào mùa đông?',
      options: ['Socks', 'Scarf', 'Shoes', 'Shirt'],
      correct: 1,
      explanation: '"Scarf" nghĩa là khăn quàng cổ.',
    },
    {
      skill: 'vocab',
      question: '"Uniform" là trang phục gì?',
      options: ['Đồ đi biển', 'Áo khoác mưa', 'Đồng phục', 'Đồ ngủ'],
      correct: 2,
      explanation: '"Uniform" = đồng phục (như đồng phục học sinh).',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "It is cold outside. ___ your jacket!"',
      options: ['Wear', 'Wearing', 'Take off', 'Put on'],
      correct: 3,
      explanation: 'Nhắc ai đó hành động mặc áo vào dùng "Put on".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng khi nói về trạng thái hiện tại:',
      options: [
        'Lan is wearing a blue dress today.',
        'Lan is putting a blue dress all afternoon.',
        'Lan wearing a blue dress today.',
        'Lan wears on a blue dress today.',
      ],
      correct: 0,
      explanation: 'Trạng thái đang mặc dùng thì hiện tại tiếp diễn với "wear": "is wearing".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng với danh từ "jeans":',
      options: [
        'This jeans is comfortable.',
        'These jeans are comfortable.',
        'These jeans is comfortable.',
        'A jeans are comfortable.',
      ],
      correct: 1,
      explanation: '"Jeans" luôn chia số nhiều → "These jeans are…".',
    },
    {
      skill: 'grammar',
      question: 'Chọn cách nói đúng cho 1 chiếc kính mắt mới:',
      options: [
        'a new glasses',
        'two pair of glasses',
        'a new pair of glasses',
        'an glasses',
      ],
      correct: 2,
      explanation: 'Với "glasses", dùng cụm đếm "a pair of glasses".',
    },
    {
      skill: 'usage',
      question: 'Bạn bước vào nhà bạn thân ở Việt Nam và muốn nhắc em gái cởi giày. Bạn nói:',
      options: [
        'Put on your hat at the door.',
        'Where is your coat?',
        'Wear your uniform at the door.',
        'Take off your shoes at the door.',
      ],
      correct: 3,
      explanation: '"Take off your shoes" = cởi giày ra.',
    },
    {
      skill: 'listening',
      audioText: 'Please put on your warm coat and scarf.',
      question: 'Nghe và chọn 2 món đồ người nói nhắc mặc vào:',
      options: ['Áo khoác dày và khăn quàng', 'Áo sơ mi và quần jeans', 'Váy ngắn và mũ rộng vành', 'Kính râm và đôi tất ngắn'],
      correct: 0,
      explanation: 'Câu nghe nhắc "warm coat" (áo khoác dày) và "scarf" (khăn quàng cổ).',
    },
    {
      skill: 'listening',
      audioText: 'Where are my black shoes?',
      question: 'Nghe và chọn điều người nói đang tìm:',
      options: ['Đôi tất màu trắng', 'Đôi giày màu đen', 'Chiếc áo khoác đen', 'Cặp kính mắt'],
      correct: 1,
      explanation: '"my black shoes" = đôi giày màu đen của mình.',
    },
  ],

  dialogPrompts: [
    {
      id: 'clo-1',
      npc: 'lan',
      askEn: 'What are you wearing today?',
      askVi: 'Hôm nay bạn đang mặc gì vậy?',
      image: null,
      answers: [
        { en: 'I am wearing a white shirt.', vi: 'Mình đang mặc áo sơ mi trắng.' },
        { en: 'I wear a blue T-shirt.', vi: 'Mình mặc một chiếc áo thun xanh.' },
      ],
      keywords: ['wearing'],
      replyEn: 'You look very neat today!',
      replyVi: 'Hôm nay nhìn bạn gọn gàng lắm!',
    },
    {
      id: 'clo-2',
      npc: 'ong_tu',
      askEn: 'What should we wear on cold days?',
      askVi: 'Ngày lạnh chúng ta nên mặc gì nhỉ?',
      image: null,
      answers: [
        { en: 'Wear a warm jacket and scarf.', vi: 'Mặc áo khoác ấm và quàng khăn.' },
        { en: 'Put on a heavy coat.', vi: 'Mặc một chiếc áo khoác dày.' },
      ],
      keywords: ['jacket'],
      replyEn: 'Good idea! Stay warm!',
      replyVi: 'Ý hay lắm! Nhớ giữ ấm nha!',
    },
  ],

  trueFalse: [
    {
      en: 'We wear a hat on sunny days.',
      vi: 'Ta đội mũ vào những ngày nắng.',
      image: null,
      illustration: '🎩',
      sceneBrief: 'Chiếc mũ rộng vành che nắng dưới bầu trời sáng, không chữ.',
      isTrue: true,
      wordIds: ['hat'],
    },
    {
      en: 'We wear shoes on our hands.',
      vi: 'Ta mang giày lên tay.',
      image: null,
      illustration: '👟',
      sceneBrief: 'Đôi giày thể thao đặt gọn cạnh thảm cửa, không chữ.',
      isTrue: false,
      whyVi: 'Ta mang giày ("shoes") ở chân, không phải ở tay.',
      wordIds: ['shoes'],
    },
    {
      en: 'Students wear a school uniform on Monday.',
      vi: 'Học sinh mặc đồng phục trường vào thứ Hai.',
      image: null,
      illustration: '🎽',
      sceneBrief: 'Bộ đồng phục học sinh phẳng phiu trên móc gỗ, không chữ.',
      isTrue: true,
      wordIds: ['uniform'],
    },
    {
      en: 'We put on a heavy winter coat on a very hot beach.',
      vi: 'Ta mặc áo khoác mùa đông dày trên bãi biển rất nóng.',
      image: null,
      illustration: '🧥',
      sceneBrief: 'Chiếc áo khoác dày ấm áp dành cho trời lạnh Đà Lạt, không chữ.',
      isTrue: false,
      whyVi: 'Áo khoác dày ("coat") dùng khi trời lạnh, không dùng trên bãi biển nóng.',
      wordIds: ['coat'],
    },
    {
      en: 'A scarf keeps our neck warm in winter.',
      vi: 'Khăn quàng giữ ấm cổ vào mùa đông.',
      image: null,
      illustration: '🧣',
      sceneBrief: 'Chiếc khăn quàng cổ màu đỏ ấm áp, không chữ.',
      isTrue: true,
      wordIds: ['scarf'],
    },
    {
      en: 'We wear socks over our glasses.',
      vi: 'Ta đeo tất lên trên kính mắt.',
      image: null,
      illustration: '👓',
      sceneBrief: 'Cặp kính mắt đặt gọn trên quyển sách mở, không chữ.',
      isTrue: false,
      whyVi: 'Tất ("socks") mang ở bàn chân, còn kính ("glasses") đeo ở mắt.',
      wordIds: ['socks', 'glasses'],
    },
  ],
};

export default CLOTHING_LESSON;
