// Track: general — Unit int-u4 · Giới từ chỉ vị trí (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const PREPOSITIONS_PLACE_LESSON = {
  id: 'prepositions-place',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u4',
  title: 'Giới từ chỉ vị trí',
  description: 'Mô tả vị trí chính xác của người và đồ vật với in, on, at, under, behind, next to, between và opposite',
  icon: '🧭',
  objectives: [
    'Phân biệt rõ bộ 3 giới từ in (bên trong), on (trên bề mặt), at (tại một điểm)',
    'Dùng đúng các cặp giới từ đối lập (above/below, in front of/behind, inside/outside)',
    'Phân biệt chính xác between (giữa 2 vật) và among (giữa từ 3 vật trở lên)',
  ],

  vocabulary: [
    v('In', '/ɪn/', 'preposition', 'Ở trong (không gian)', 'The keys are in my pocket.', 'Chìa khoá ở trong túi áo của mình.', '📦'),
    v('On', '/ɑːn/', 'preposition', 'Ở trên (chạm bề mặt)', 'The cup sits on the table.', 'Chiếc cốc đặt trên mặt bàn.', '📚'),
    v('At', '/æt/', 'preposition', 'Tại (điểm cụ thể)', 'Minh is waiting at the gate.', 'Minh đang đợi ở cổng.', '🚪'),
    v('Under', '/ˈʌndər/', 'preposition', 'Ở phía dưới', 'Our cat hides under the chair.', 'Con mèo nhà mình trốn dưới gầm ghế.', '🐕'),
    v('Above', '/əˈbʌv/', 'preposition', 'Ở phía trên (không chạm)', 'A clock hangs above the board.', 'Một chiếc đồng hồ treo phía trên bảng.', '💡'),
    v('Below', '/bɪˈloʊ/', 'preposition', 'Ở phía dưới (thấp hơn)', 'Write your name below the line.', 'Viết tên bạn ở phía dưới dòng kẻ.', '🖊️'),
    v('Behind', '/bɪˈhaɪnd/', 'preposition', 'Ở phía sau', 'There is a yard behind the house.', 'Có một cái sân phía sau ngôi nhà.', '🌳'),
    v('In front of', '/ɪn frʌnt əv/', 'phrase', 'Ở phía trước', 'A bicycle is in front of the shop.', 'Một chiếc xe đạp dựng phía trước cửa hàng.', '🚲'),
    v('Next to', '/nekst tuː/', 'phrase', 'Ở bên cạnh', 'Lan sits next to me in class.', 'Lan ngồi cạnh mình trong lớp.', '🪑'),
    v('Between', '/bɪˈtwiːn/', 'preposition', 'Ở giữa (2 đối tượng)', 'The bakery is between two banks.', 'Tiệm bánh nằm giữa hai ngân hàng.', '🥐'),
    v('Among', '/əˈmʌŋ/', 'preposition', 'Ở giữa (từ 3 trở lên)', 'The bench sits among tall trees.', 'Chiếc ghế đá nằm giữa những hàng cây cao.', '🌲'),
    v('Near', '/nɪr/', 'preposition', 'Ở gần', 'We live near the public library.', 'Chúng mình sống gần thư viện công cộng.', '🏫'),
    v('Opposite', '/ˈɑːpəzɪt/', 'preposition', 'Đối diện', 'The bookstore is opposite the park.', 'Hiệu sách nằm đối diện công viên.', '🏦'),
    v('Inside', '/ˌɪnˈsaɪd/', 'preposition', 'Bên trong', 'Stay inside the house during rain.', 'Ở bên trong nhà khi trời mưa nhé.', '🏠'),
    v('Outside', '/ˌaʊtˈsaɪd/', 'preposition', 'Bên ngoài', 'Leave your wet umbrella outside.', 'Để chiếc ô ướt của bạn ở bên ngoài.', '🚶'),
  ],

  grammar: [
    {
      title: 'Bộ ba IN – ON – AT cho vị trí',
      explanation: '"In" dùng cho không gian có ranh giới (in the room, in a box, in Hanoi). "On" dùng cho bề mặt tiếp xúc (on the desk, on the wall). "At" dùng cho một điểm xác định (at the door, at the bus stop, at school).',
      examples: [
        { en: 'My pencils are in the wooden box.', vi: 'Bút chì của mình ở trong chiếc hộp gỗ.' },
        { en: 'A world map hangs on the wall.', vi: 'Một tấm bản đồ thế giới treo trên tường.' },
        { en: 'Lan is waiting at the bus stop.', vi: 'Lan đang đợi tại trạm xe buýt.' },
        { en: 'They live in a quiet town near the river.', vi: 'Họ sống ở một thị trấn yên tĩnh gần sông.' },
      ],
      mistakes: [
        { wrong: 'Meet me in the bus stop.', right: 'Meet me at the bus stop.', note: 'Trạm xe buýt là một điểm hẹn cụ thể nên dùng "at", không dùng "in".' },
        { wrong: 'The picture is in the wall.', right: 'The picture is on the wall.', note: 'Tranh treo trên bề mặt tường phải dùng "on".' },
      ],
    },
    {
      title: 'Phân biệt Between / Among và các cặp giới từ đối lập',
      explanation: 'Dùng "between" khi nằm giữa 2 vật/người cụ thể (between A and B); dùng "among" khi ở giữa 3 vật trở lên hoặc một nhóm. Học theo cặp đối lập: above ↔ below, in front of ↔ behind, inside ↔ outside.',
      examples: [
        { en: 'The café sits between the bank and the school.', vi: 'Quán cà phê nằm giữa ngân hàng và trường học.' },
        { en: 'I found my keys among the old papers.', vi: 'Mình tìm thấy chìa khoá giữa đống giấy cũ.' },
        { en: 'A bright lamp hangs above the dining table.', vi: 'Một chiếc đèn sáng treo phía trên bàn ăn.' },
        { en: 'The garden is behind the house, not in front of it.', vi: 'Khu vườn ở phía sau nhà, không phải phía trước.' },
      ],
      mistakes: [
        { wrong: 'The shop is next the park.', right: 'The shop is next to the park.', note: 'Cụm "bên cạnh" luôn có "to": "next to".' },
        { wrong: 'The post office is among the bank and the school.', right: 'The post office is between the bank and the school.', note: 'Giữa đúng 2 địa điểm cụ thể phải dùng "between", không dùng "among".' },
      ],
    },
  ],

  reading: {
    title: 'Tìm chìa khoá và hẹn ở hiệu sách',
    passage: [
      'Lan: Minh, I cannot find my bike key! Is it on the table?',
      'Minh: No, look under the chair. Oh, I see it in your pencil box next to the lamp!',
      'Lan: Thank you! Wait—a bright lamp hangs above your desk, and your books sit below the shelf.',
      'Minh: Shall we meet outside the bookstore near the park? It is opposite the bakery.',
      'Lan: Is the bookstore between the bank and the post office?',
      'Minh: Yes! There is a small bench among the trees right in front of it. I will wait at the gate.',
    ].join('\n'),
    translation: [
      'Lan: Minh ơi, mình không tìm thấy chìa khoá xe đạp! Nó có trên bàn không?',
      'Minh: Không, nhìn dưới gầm ghế thử xem. À, mình thấy nó trong hộp bút của bạn ngay cạnh chiếc đèn kìa!',
      'Lan: Cảm ơn bạn! Ồ—chiếc đèn sáng treo phía trên bàn học của bạn, còn sách của bạn xếp phía dưới kệ.',
      'Minh: Mình hẹn nhau bên ngoài hiệu sách gần công viên nhé? Nó nằm đối diện tiệm bánh.',
      'Lan: Có phải hiệu sách nằm giữa ngân hàng và bưu điện không?',
      'Minh: Đúng rồi! Có một chiếc ghế đá nhỏ giữa hàng cây ngay phía trước nó. Mình sẽ đợi ở cổng nhé.',
    ].join('\n'),
    highlights: ['On', 'Under', 'In', 'Above', 'Below', 'Outside', 'Near', 'Opposite', 'Between', 'Among', 'At'],
    questions: [
      {
        question: 'Cuối cùng Minh tìm thấy chìa khoá xe đạp của Lan ở đâu?',
        options: ['Trên mặt bàn', 'Dưới gầm ghế', 'Trong hộp bút cạnh chiếc đèn', 'Ngoài công viên'],
        correct: 2,
        explanation: 'Minh nói: "Oh, I see it in your pencil box next to the lamp!"',
      },
      {
        question: 'Hiệu sách nằm đối diện nơi nào?',
        options: ['Ngân hàng', 'Tiệm bánh', 'Trường học', 'Bưu điện'],
        correct: 1,
        explanation: 'Minh mô tả: "the bookstore near the park? It is opposite the bakery."',
      },
      {
        question: 'Hiệu sách nằm giữa hai địa điểm nào?',
        options: ['Công viên và tiệm bánh', 'Ngân hàng và bưu điện', 'Trường học và thư viện', 'Quán cà phê và rạp phim'],
        correct: 1,
        explanation: 'Lan hỏi "between the bank and the post office?" và Minh xác nhận "Yes!".',
      },
      {
        question: 'Minh hẹn đứng đợi Lan ở đâu?',
        options: ['Trong tiệm bánh', 'Tại cổng', 'Phía sau hiệu sách', 'Ở trạm xe buýt'],
        correct: 1,
        explanation: 'Câu cuối Minh nói: "I will wait at the gate."',
      },
    ],
  },

  quiz: [
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "A clock hangs ___ the whiteboard." (treo phía trên, không chạm)',
      options: ['on', 'above', 'under', 'between'],
      correct: 1,
      explanation: '"Above" chỉ vị trí ở phía trên nhưng không chạm trực tiếp vào vật bên dưới.',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "Lan is waiting ___ the bus stop."',
      options: ['in', 'on', 'at', 'among'],
      correct: 2,
      explanation: 'Điểm hẹn cụ thể (the bus stop, the gate) dùng giới từ "at".',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "The bookstore sits ___ the bank and the post office."',
      options: ['among', 'between', 'opposite', 'under'],
      correct: 1,
      explanation: 'Ở giữa đúng 2 địa điểm cụ thể dùng "between".',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "There is a wooden bench ___ the tall trees."',
      options: ['between', 'among', 'above', 'below'],
      correct: 1,
      explanation: 'Ở giữa nhiều cây (≥3) dùng "among".',
    },
    {
      skill: 'vocab',
      question: '"Opposite" nghĩa là gì?',
      options: ['Bên cạnh', 'Phía sau', 'Đối diện', 'Phía dưới'],
      correct: 2,
      explanation: '"Opposite" = đối diện (across from).',
    },
    {
      skill: 'vocab',
      question: 'Từ trái nghĩa với "behind" (phía sau) là:',
      options: ['in front of', 'under', 'below', 'inside'],
      correct: 0,
      explanation: '"In front of" (phía trước) đối lập với "behind" (phía sau).',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn nhắc bạn cùng nhà đừng để ô ướt trong phòng khách mà để ở ngoài cửa. Bạn nói:',
      options: [
        'Leave your wet umbrella outside.',
        'Put your umbrella under the lamp.',
        'Stand between the door.',
        'Hang the umbrella below the roof.',
      ],
      correct: 0,
      explanation: '"Leave your wet umbrella outside" = Hãy để chiếc ô ướt ở bên ngoài.',
    },
    {
      skill: 'listening',
      audioText: 'The cat is sleeping under the wooden chair.',
      question: 'Nghe và chọn vị trí của con mèo:',
      options: ['Trên mặt ghế', 'Dưới gầm ghế gỗ', 'Phía sau cái bàn', 'Trong chiếc hộp'],
      correct: 1,
      explanation: '"under the wooden chair" = dưới gầm chiếc ghế gỗ.',
    },
    {
      skill: 'listening',
      audioText: 'Our school is opposite the public park.',
      question: 'Nghe và chọn vị trí ngôi trường:',
      options: ['Bên trong công viên', 'Đối diện công viên công cộng', 'Phía sau ngân hàng', 'Cách xa công viên'],
      correct: 1,
      explanation: '"opposite the public park" = đối diện công viên công cộng.',
    },
  ],
};

export default PREPOSITIONS_PLACE_LESSON;
