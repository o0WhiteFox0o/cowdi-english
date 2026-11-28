// Track: general — Unit int-u3 · Nhà cửa (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration, extra = {}) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration, ...extra });

export const HOUSE_LESSON = {
  id: 'house',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u3',
  title: 'Nhà cửa',
  description: 'Giới thiệu các phòng, đồ đạc trong nhà và mô tả vị trí đồ vật',
  icon: '🏠',
  objectives: [
    'Gọi tên các phòng và đồ vật quen thuộc trong ngôi nhà',
    'Dùng đúng cấu trúc There is / There are ở thể khẳng định, phủ định và câu hỏi',
    'Mô tả vị trí đồ đạc trong phòng bằng các giới từ in, on, under, next to',
  ],
  story: {
    npc: 'minh',
    introVi: 'Ngôi nhà nhỏ gần Vườn Sữa có nhiều phòng ấm cúng lắm. Con cùng Minh gọi tên từng phòng và đồ đạc nha!',
  },

  vocabulary: [
    v('Kitchen', '/ˈkɪtʃɪn/', 'noun', 'Nhà bếp', 'Mom is cooking soup in the kitchen.', 'Mẹ đang nấu canh trong nhà bếp.', '🍳', { countable: true, plural: 'kitchens' }),
    v('Bedroom', '/ˈbedruːm/', 'noun', 'Phòng ngủ', 'My bedroom is bright and quiet.', 'Phòng ngủ của mình sáng và yên tĩnh.', '🛏️', { countable: true, plural: 'bedrooms' }),
    v('Bathroom', '/ˈbæθruːm/', 'noun', 'Phòng tắm', 'The bathroom is next to my room.', 'Phòng tắm ở ngay cạnh phòng mình.', '🚿', { countable: true, plural: 'bathrooms' }),
    v('Living room', '/ˈlɪvɪŋ ruːm/', 'noun', 'Phòng khách', 'Our family watches TV in the living room.', 'Gia đình mình xem TV trong phòng khách.', '🛋️', { countable: true, plural: 'living rooms' }),
    v('Door', '/dɔːr/', 'noun', 'Cửa ra vào', 'Please close the front door softly.', 'Vui lòng đóng nhẹ cửa trước nhé.', '🚪', { countable: true, plural: 'doors' }),
    v('Window', '/ˈwɪndoʊ/', 'noun', 'Cửa sổ', 'Open the window for fresh air.', 'Mở cửa sổ ra cho thoáng khí nhé.', '🪟', { countable: true, plural: 'windows' }),
    v('Table', '/ˈteɪbəl/', 'noun', 'Cái bàn', 'Dinner is ready on the table.', 'Bữa tối đã sẵn sàng trên bàn rồi.', '🪵', { countable: true, plural: 'tables' }),
    v('Chair', '/tʃer/', 'noun', 'Cái ghế', 'There are four chairs around the table.', 'Có bốn cái ghế quanh chiếc bàn.', '🪑', { countable: true, plural: 'chairs' }),
    v('Sofa', '/ˈsoʊfə/', 'noun', 'Ghế sofa', 'Grandpa is reading on the sofa.', 'Ông nội đang đọc báo trên ghế sofa.', '🛋️', { countable: true, plural: 'sofas' }),
    v('Garden', '/ˈɡɑːrdən/', 'noun', 'Khu vườn', 'We grow flowers in the front garden.', 'Nhà mình trồng hoa ở khu vườn trước.', '🌻', { countable: true, plural: 'gardens' }),
    v('Stairs', '/sterz/', 'noun', 'Cầu thang', 'Walk carefully down the stairs.', 'Đi xuống cầu thang cẩn thận nhé.', '🪜'),
    v('Roof', '/ruːf/', 'noun', 'Mái nhà', 'Our house has a bright red roof.', 'Nhà mình có mái ngói màu đỏ tươi.', '🏠', { countable: true, plural: 'roofs' }),
  ],

  grammar: [
    {
      title: 'There is / There are (Có cái gì ở đâu)',
      explanation: 'Dùng "There is + a/an + danh từ số ít" và "There are + danh từ số nhiều". Phủ định dùng "There isn\'t / There aren\'t". Câu hỏi đảo "Is there…?" / "Are there…?".',
      examples: [
        { en: 'There is a wooden table in the kitchen.', vi: 'Có một chiếc bàn gỗ trong nhà bếp.' },
        { en: 'There are two bedrooms upstairs.', vi: 'Có hai phòng ngủ ở tầng trên.' },
        { en: 'Is there a garden behind your house?', vi: 'Có khu vườn phía sau nhà bạn không?' },
        { en: 'There are no stairs in our apartment.', vi: 'Căn hộ của chúng mình không có cầu thang.' },
      ],
      mistakes: [
        { wrong: 'There have three chairs in the room.', right: 'There are three chairs in the room.', note: 'Tiếng Anh không dịch "có" thành "There have"; phải dùng "There is / There are".' },
        { wrong: 'There is two windows in my bedroom.', right: 'There are two windows in my bedroom.', note: '"Two windows" là số nhiều nên phải dùng "There are".' },
      ],
    },
    {
      title: 'Giới từ chỉ vị trí đồ vật: in, on, under, next to',
      explanation: 'Mô tả đồ vật nằm ở đâu trong nhà: "in" (bên trong), "on" (ở trên bề mặt), "under" (ở dưới), "next to" (bên cạnh).',
      examples: [
        { en: 'The sofa is in the living room.', vi: 'Ghế sofa ở trong phòng khách.' },
        { en: 'The keys are on the kitchen table.', vi: 'Chìa khoá ở trên bàn bếp.' },
        { en: 'Our cat sleeps under the chair.', vi: 'Con mèo nhà mình ngủ dưới gầm ghế.' },
        { en: 'The bathroom is next to the stairs.', vi: 'Phòng tắm ở cạnh cầu thang.' },
      ],
      mistakes: [
        { wrong: 'The chair is next the table.', right: 'The chair is next to the table.', note: 'Cụm giới từ đúng là "next to" (không bỏ chữ "to").' },
      ],
    },
  ],

  reading: {
    title: 'Thăm ngôi nhà mới của Minh',
    passage: [
      'Minh: Welcome to our new house, Lan! Come in through the front door.',
      'Lan: Wow, I love the red roof and the little garden outside!',
      'Minh: Thank you. Here is our living room. There is a big sofa near the window.',
      'Lan: The room is so bright. Where is the kitchen?',
      'Minh: It is next to the living room. There is a round table with six chairs inside.',
      'Lan: Are there any rooms upstairs?',
      'Minh: Yes! Walk up the stairs and you will see two bedrooms and a clean bathroom.',
    ].join('\n'),
    translation: [
      'Minh: Chào mừng bạn đến ngôi nhà mới của mình, Lan! Mời bạn đi qua cửa trước vào nhà.',
      'Lan: Ôi, mình thích mái nhà màu đỏ và khu vườn nhỏ bên ngoài quá!',
      'Minh: Cảm ơn bạn. Đây là phòng khách nhà mình. Có một chiếc ghế sofa lớn gần cửa sổ.',
      'Lan: Căn phòng sáng sủa thật. Nhà bếp ở đâu thế?',
      'Minh: Ở ngay cạnh phòng khách. Bên trong có một chiếc bàn tròn với sáu cái ghế.',
      'Lan: Ở tầng trên có phòng nào không?',
      'Minh: Có chứ! Đi lên cầu thang bạn sẽ thấy hai phòng ngủ và một phòng tắm sạch sẽ.',
    ].join('\n'),
    highlights: ['Door', 'Roof', 'Garden', 'Sofa', 'Window', 'Kitchen', 'Table', 'Chair', 'Stairs', 'Bedroom', 'Bathroom'],
    questions: [
      {
        question: 'Lan khen điều gì ngay khi nhìn thấy bên ngoài ngôi nhà của Minh?',
        options: ['Chiếc sofa và cầu thang', 'Cửa sổ tầng trên', 'Phòng tắm và bàn ăn', 'Mái nhà đỏ và khu vườn nhỏ'],
        correct: 3,
        explanation: 'Lan nói: "I love the red roof and the little garden outside!"',
      },
      {
        question: 'Nhà bếp nằm ở vị trí nào?',
        options: ['Ngay cạnh phòng khách', 'Ở ngoài vườn', 'Ở tầng trên', 'Bên dưới cầu thang'],
        correct: 0,
        explanation: 'Minh trả lời: "It is next to the living room."',
      },
      {
        question: 'Trong nhà bếp có bao nhiêu cái ghế?',
        options: ['Bốn cái', 'Sáu cái', 'Năm cái', 'Hai cái'],
        correct: 1,
        explanation: 'Minh kể: "There is a round table with six chairs inside."',
      },
      {
        question: 'Trên tầng có những phòng nào?',
        options: [
          'Ba phòng ngủ và một khu vườn',
          'Một phòng khách và một nhà bếp',
          'Hai phòng ngủ và một phòng tắm',
          'Một thư viện và hai phòng tắm',
        ],
        correct: 2,
        explanation: 'Minh nói: "you will see two bedrooms and a clean bathroom."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Nơi cả gia đình nấu ăn là phòng nào?',
      options: ['Bedroom', 'Bathroom', 'Roof', 'Kitchen'],
      correct: 3,
      explanation: '"Kitchen" = nhà bếp.',
    },
    {
      skill: 'vocab',
      question: 'Bạn dùng gì để đi từ tầng trệt lên tầng hai?',
      options: ['Stairs', 'Window', 'Garden', 'Sofa'],
      correct: 0,
      explanation: '"Stairs" nghĩa là cầu thang.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng:',
      options: [
        'There have two chairs in the kitchen.',
        'There are two chairs in the kitchen.',
        'There is two chairs in the kitchen.',
        'There be two chairs in the kitchen.',
      ],
      correct: 1,
      explanation: 'Với danh từ số nhiều "two chairs", dùng "There are".',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "___ there a garden behind your house?"',
      options: ['Are', 'Do', 'Is', 'Have'],
      correct: 2,
      explanation: '"A garden" là số ít nên câu hỏi đảo thành "Is there…?".',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "The bathroom is ___ the bedroom."',
      options: ['next', 'in to', 'under to', 'next to'],
      correct: 3,
      explanation: 'Cụm giới từ chỉ vị trí "bên cạnh" là "next to".',
    },
    {
      skill: 'usage',
      question: 'Phòng hơi bí và bạn muốn nhờ bạn mở cửa sổ cho thoáng. Bạn nói:',
      options: [
        'Open the window, please.',
        'Close the roof, please.',
        'Sit under the door, please.',
        'Go up the garden, please.',
      ],
      correct: 0,
      explanation: '"Open the window, please." = Vui lòng mở cửa sổ giúp mình.',
    },
    {
      skill: 'listening',
      audioText: 'There is a big sofa in the living room.',
      question: 'Nghe và chọn món đồ trong phòng khách:',
      options: ['Một chiếc bàn tròn', 'Một chiếc ghế sofa lớn', 'Hai cái giường ngủ', 'Một cái cửa sổ nhỏ'],
      correct: 1,
      explanation: 'Câu nghe nhắc rõ "a big sofa in the living room".',
    },
    {
      skill: 'listening',
      audioText: 'The cat is sleeping under the kitchen table.',
      question: 'Nghe và chọn vị trí của con mèo:',
      options: ['Trên mái nhà', 'Ngoài khu vườn', 'Dưới gầm bàn bếp', 'Trên cầu thang'],
      correct: 2,
      explanation: '"under the kitchen table" = dưới gầm bàn bếp.',
    },
    {
      skill: 'vocab',
      question: '"Roof" là bộ phận nào của ngôi nhà?',
      options: ['Cửa trước', 'Cầu thang', 'Phòng khách', 'Mái nhà'],
      correct: 3,
      explanation: '"Roof" nghĩa là mái nhà.',
    },
  ],

  dialogPrompts: [
    {
      id: 'hou-1',
      npc: 'minh',
      askEn: 'Where do you cook dinner?',
      askVi: 'Nhà bạn nấu bữa tối ở phòng nào?',
      image: null,
      answers: [
        { en: 'We cook in the kitchen.', vi: 'Nhà mình nấu trong nhà bếp.' },
        { en: 'In our bright kitchen.', vi: 'Trong nhà bếp sáng sủa.' },
      ],
      keywords: ['kitchen'],
      replyEn: 'I love warm family dinners!',
      replyVi: 'Mình thích những bữa cơm gia đình ấm cúng lắm!',
    },
    {
      id: 'hou-2',
      npc: 'ong_tu',
      askEn: 'What is in your front garden?',
      askVi: 'Trước vườn nhà con có trồng gì không?',
      image: null,
      answers: [
        { en: 'There are yellow flowers in the garden.', vi: 'Trong vườn có hoa màu vàng ạ.' },
        { en: 'We grow green trees.', vi: 'Nhà con trồng nhiều cây xanh.' },
      ],
      keywords: ['garden'],
      replyEn: 'A garden makes every house fresh!',
      replyVi: 'Có khu vườn là nhà lúc nào cũng mát mẻ!',
    },
  ],

  trueFalse: [
    {
      en: 'We cook food in the kitchen.',
      vi: 'Ta nấu ăn trong nhà bếp.',
      image: '/image/art/house_rooms.webp',
      isTrue: true,
      wordIds: ['kitchen'],
    },
    {
      en: 'We sleep on the roof every night.',
      vi: 'Ta ngủ trên mái nhà mỗi tối.',
      image: '/image/art/house.webp',
      isTrue: false,
      whyVi: 'Ta ngủ trong phòng ngủ ("bedroom"), không phải trên mái nhà ("roof").',
      wordIds: ['bedroom', 'roof'],
    },
    {
      en: 'We open the window to let in fresh air.',
      vi: 'Ta mở cửa sổ để đón không khí trong lành.',
      image: null,
      illustration: '🪟',
      sceneBrief: 'Cửa sổ gỗ mở rộng đón nắng sớm vào phòng, không chữ.',
      isTrue: true,
      wordIds: ['window'],
    },
    {
      en: 'People usually take a shower on the sofa.',
      vi: 'Mọi người thường tắm trên ghế sofa.',
      image: '/image/art/house_furniture.webp',
      isTrue: false,
      whyVi: 'Ta tắm trong phòng tắm ("bathroom"), còn ghế sofa ("sofa") đặt ở phòng khách.',
      wordIds: ['bathroom', 'sofa'],
    },
    {
      en: 'There are chairs around the dining table.',
      vi: 'Có những chiếc ghế đặt quanh bàn ăn.',
      image: null,
      illustration: '🪑',
      sceneBrief: 'Bốn chiếc ghế gỗ xếp ngay ngắn quanh chiếc bàn ăn, không chữ.',
      isTrue: true,
      wordIds: ['chair', 'table'],
    },
    {
      en: 'A garden is inside the bathroom.',
      vi: 'Khu vườn nằm bên trong phòng tắm.',
      image: null,
      illustration: '🌻',
      sceneBrief: 'Khu vườn hoa hướng dương nắng ấm phía trước ngôi nhà, không chữ.',
      isTrue: false,
      whyVi: 'Khu vườn ("garden") ở ngoài trời quanh nhà, không nằm trong phòng tắm.',
      wordIds: ['garden', 'bathroom'],
    },
  ],
};

export default HOUSE_LESSON;
