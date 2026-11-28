// Track: general — Unit int-u2 · Cơ thể người (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration, extra = {}) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration, ...extra });

export const BODY_LESSON = {
  id: 'body',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u2',
  title: 'Cơ thể người',
  description: 'Gọi tên các bộ phận cơ thể, số ít – số nhiều và cách chăm sóc sức khoẻ cơ bản',
  icon: '🦴',
  objectives: [
    'Gọi tên đúng các bộ phận cơ thể thường dùng hằng ngày',
    'Chuyển đúng danh từ số ít sang số nhiều, gồm cả dạng bất quy tắc (foot → feet, tooth → teeth)',
    'Hiểu và nói các câu hướng dẫn vận động, giữ vệ sinh và báo đau nhức đơn giản',
  ],
  story: {
    scene_id: 'tg_san_tap',
    intro_vi: 'Gió lộng ở Tháp Gió mát quá, mình khởi động cơ thể nào! Con gọi đúng tên từng bộ phận cùng Lan nhé!',
    dialogue: {
      speaker_id: 'lan',
      text_en: 'Raise your arm, please.',
    },
  },

  vocabulary: [
    v('Head', '/hed/', 'noun', 'Cái đầu', 'Put a hat on your head.', 'Đội mũ lên đầu của bạn đi.', '🗣️', { countable: true, plural: 'heads' }),
    v('Eye', '/aɪ/', 'noun', 'Mắt', 'She has bright brown eyes.', 'Cô ấy có đôi mắt nâu sáng.', '👁️', { countable: true, plural: 'eyes' }),
    v('Ear', '/ɪr/', 'noun', 'Tai', 'We listen carefully with our ears.', 'Chúng ta lắng nghe cẩn thận bằng đôi tai.', '👂', { countable: true, plural: 'ears' }),
    v('Nose', '/noʊz/', 'noun', 'Mũi', 'Touch your nose during the game.', 'Chạm vào mũi của bạn trong trò chơi.', '👃', { countable: true, plural: 'noses' }),
    v('Mouth', '/maʊθ/', 'noun', 'Miệng', 'Open your mouth and say "ah".', 'Há miệng ra và nói "a" nào.', '👄', { countable: true, plural: 'mouths' }),
    v('Tooth', '/tuːθ/', 'noun', 'Cái răng (số nhiều: teeth)', 'Brush every tooth twice a day.', 'Đánh sạch từng chiếc răng hai lần mỗi ngày.', '🦷', { countable: true, plural: 'teeth' }),
    v('Hand', '/hænd/', 'noun', 'Bàn tay', 'Wash your hands before every meal.', 'Rửa tay trước mỗi bữa ăn nhé.', '🤚', { countable: true, plural: 'hands' }),
    v('Arm', '/ɑːrm/', 'noun', 'Cánh tay', 'Raise your right arm high.', 'Giơ cao cánh tay phải của bạn lên.', '💪', { countable: true, plural: 'arms' }),
    v('Leg', '/leɡ/', 'noun', 'Cẳng chân', 'Running makes your legs strong.', 'Chạy bộ giúp đôi chân bạn khoẻ mạnh.', '🦵', { countable: true, plural: 'legs' }),
    v('Foot', '/fʊt/', 'noun', 'Bàn chân (số nhiều: feet)', 'My left foot hurts after soccer.', 'Bàn chân trái của mình đau sau khi đá bóng.', '🦶', { countable: true, plural: 'feet' }),
    v('Heart', '/hɑːrt/', 'noun', 'Trái tim', 'Your heart beats faster when you run.', 'Tim bạn đập nhanh hơn khi chạy.', '❤️', { countable: true, plural: 'hearts' }),
    v('Stomach', '/ˈstʌmək/', 'noun', 'Bụng, dạ dày', 'My stomach feels full after lunch.', 'Bụng mình thấy no sau bữa trưa.', '🫃', { countable: true, plural: 'stomachs' }),
  ],

  grammar: [
    {
      title: 'Danh từ số ít và số nhiều (quy tắc & bất quy tắc)',
      explanation: 'Phần lớn danh từ thêm "-s" ở số nhiều (eye → eyes, hand → hands, leg → legs). Một số bộ phận cơ thể đổi nguyên âm bất quy tắc: foot → feet, tooth → teeth.',
      examples: [
        { en: 'I have two eyes and two ears.', vi: 'Mình có hai mắt và hai tai.' },
        { en: 'Mai brushes her teeth every night.', vi: 'Mai đánh răng mỗi tối.' },
        { en: 'Wash both hands with soap.', vi: 'Rửa cả hai bàn tay bằng xà phòng.' },
        { en: 'My feet are tired after walking.', vi: 'Đôi bàn chân của mình mỏi sau khi đi bộ.' },
      ],
      mistakes: [
        { wrong: 'I have two foots.', right: 'I have two feet.', note: '"Foot" là danh từ bất quy tắc, số nhiều là "feet" (không thêm -s).' },
        { wrong: 'Brush your tooths before bed.', right: 'Brush your teeth before bed.', note: 'Số nhiều của "tooth" là "teeth", không phải "tooths".' },
      ],
    },
    {
      title: 'Câu mệnh lệnh giữ sức khoẻ và cấu trúc hurt / hurts',
      explanation: 'Dùng động từ nguyên mẫu đứng đầu câu để hướng dẫn (Wash your hands, Stretch your arms). Khi nói bị đau: 1 bộ phận dùng "hurts" (My arm hurts), 2 bộ phận dùng "hurt" (My legs hurt).',
      examples: [
        { en: 'Raise both arms above your head.', vi: 'Giơ cả hai cánh tay lên trên đầu.' },
        { en: 'Wash your hands before lunch.', vi: 'Rửa tay trước bữa trưa.' },
        { en: 'My left foot hurts a little.', vi: 'Bàn chân trái của mình hơi đau.' },
        { en: 'My legs hurt after the race.', vi: 'Hai chân của mình đau sau cuộc chạy đua.' },
      ],
      mistakes: [
        { wrong: 'My head hurt today.', right: 'My head hurts today.', note: '"My head" là số ít nên động từ "hurt" phải thêm "-s": "hurts".' },
        { wrong: 'My feet hurts.', right: 'My feet hurt.', note: '"My feet" là số nhiều nên dùng "hurt" không thêm "-s".' },
      ],
    },
  ],

  reading: {
    title: 'Giờ thể dục cùng thầy Tom',
    passage: [
      'Mr. Tom: Good morning, class! Before we run, let us warm up our body.',
      'Lan: What should we move first, Mr. Tom?',
      'Mr. Tom: Turn your head slowly, then raise each arm and stretch your legs.',
      'Minh: My heart is already beating fast! My right foot hurts a little.',
      'Mr. Tom: Rest for a minute, Minh. Close your eyes and take a deep breath through your nose and mouth.',
      'Lan: After class, my stomach is always hungry.',
      'Mr. Tom: Wash your hands well before eating, and remember to brush every tooth tonight!',
    ].join('\n'),
    translation: [
      'Thầy Tom: Chào buổi sáng cả lớp! Trước khi chạy, chúng ta cùng khởi động cơ thể nhé.',
      'Lan: Thưa thầy Tom, chúng em nên cử động phần nào trước ạ?',
      'Thầy Tom: Xoay đầu chậm rãi, rồi giơ từng cánh tay và giãn cơ chân.',
      'Minh: Tim em đã đập nhanh rồi! Bàn chân phải của em hơi đau một chút.',
      'Thầy Tom: Nghỉ một phút nhé Minh. Hít thở sâu bằng mũi và miệng nào.',
      'Lan: Sau giờ học, bụng em lúc nào cũng thấy đói.',
      'Thầy Tom: Nhớ rửa tay thật sạch trước khi ăn, và tối nay nhớ đánh sạch từng chiếc răng nhé!',
    ].join('\n'),
    highlights: ['Head', 'Arm', 'Leg', 'Heart', 'Foot', 'Eye', 'Nose', 'Mouth', 'Stomach', 'Hand', 'Tooth'],
    questions: [
      {
        question: 'Thầy Tom bảo cả lớp làm gì trước khi chạy?',
        options: ['Đọc sách trong thư viện', 'Ngồi yên tại chỗ', 'Đi ăn trưa ngay', 'Khởi động cơ thể'],
        correct: 3,
        explanation: 'Thầy Tom nói: "Before we run, let us warm up our body."',
      },
      {
        question: 'Bộ phận nào của Minh hơi bị đau?',
        options: ['Bàn chân phải', 'Cánh tay trái', 'Cái đầu', 'Cái bụng'],
        correct: 0,
        explanation: 'Minh nói: "My right foot hurts a little."',
      },
      {
        question: 'Thầy Tom khuyên Minh làm gì khi bị đau chân?',
        options: ['Chạy nhanh hơn nữa', 'Nghỉ ngắn và hít thở sâu', 'Quay về nhà ngay lập tức', 'Uống ngay một cốc nước lạnh'],
        correct: 1,
        explanation: 'Thầy Tom bảo Minh: "Rest for a minute, Minh… take a deep breath through your nose and mouth."',
      },
      {
        question: 'Thầy Tom nhắc học sinh làm gì trước khi ăn?',
        options: ['Đội mũ lên đầu', 'Chạy thêm một vòng', 'Rửa tay thật sạch', 'Đóng cửa sổ'],
        correct: 2,
        explanation: 'Thầy dặn: "Wash your hands well before eating".',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Bộ phận nào giúp chúng ta nghe âm thanh?',
      options: ['Eye', 'Nose', 'Mouth', 'Ear'],
      correct: 3,
      explanation: '"Ear" (tai) là bộ phận dùng để nghe.',
    },
    {
      skill: 'vocab',
      question: '"Stomach" nghĩa là gì?',
      options: ['Bụng / dạ dày', 'Cánh tay', 'Trái tim', 'Bàn chân'],
      correct: 0,
      explanation: '"Stomach" = bụng, dạ dày.',
    },
    {
      skill: 'grammar',
      question: 'Số nhiều đúng của "foot" là:',
      options: ['foots', 'feet', 'feets', 'footes'],
      correct: 1,
      explanation: '"Foot" là danh từ số nhiều bất quy tắc → "feet".',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "Mai brushes her ___ every night."',
      options: ['tooth', 'tooths', 'teeth', 'teeths'],
      correct: 2,
      explanation: 'Khi đánh răng ta nói "brush one\'s teeth" ("teeth" là số nhiều của "tooth").',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng khi bạn bị đau một cánh tay:',
      options: [
        'My arm hurt.',
        'My arm are hurt.',
        'My arms hurts.',
        'My arm hurts.',
      ],
      correct: 3,
      explanation: '"My arm" là số ít nên động từ thêm "-s": "My arm hurts."',
    },
    {
      skill: 'usage',
      question: 'Trước giờ ăn trưa, cô giáo nhắc cả lớp:',
      options: [
        'Wash your hands before lunch.',
        'Open your book to page ten.',
        'Wear a coat in winter.',
        'Turn your head slowly.',
      ],
      correct: 0,
      explanation: '"Wash your hands before lunch" = Rửa tay trước bữa trưa.',
    },
    {
      skill: 'listening',
      audioText: 'Your heart beats fast when you run.',
      question: 'Nghe và chọn bộ phận cơ thể được nhắc đến:',
      options: ['Bàn tay', 'Trái tim', 'Cái mũi', 'Cái răng'],
      correct: 1,
      explanation: 'Câu nghe nhắc đến "heart" (trái tim).',
    },
    {
      skill: 'listening',
      audioText: 'My legs hurt after the race.',
      question: 'Nghe và chọn tình huống đúng:',
      options: [
        'Bạn ấy đội chiếc mũ lên đầu.',
        'Bạn ấy đang rửa sạch hai tay.',
        'Bạn ấy đau chân sau khi chạy.',
        'Bạn ấy cảm thấy rất đói bụng.',
      ],
      correct: 2,
      explanation: '"My legs hurt after the race" = Hai chân mình đau sau cuộc chạy đua.',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "My two ___ are tired."',
      options: ['foot', 'foots', 'feets', 'feet'],
      correct: 3,
      explanation: 'Sau số đếm "two" cần danh từ số nhiều bất quy tắc "feet".',
    },
  ],

  dialogPrompts: [
    {
      id: 'body-1',
      npc: 'tom',
      askEn: 'What do we use to listen?',
      askVi: 'Chúng ta dùng bộ phận nào để nghe?',
      image: null,
      answers: [
        { en: 'We listen with our ears.', vi: 'Chúng ta nghe bằng đôi tai.' },
        { en: 'We use two ears.', vi: 'Chúng ta dùng hai tai.' },
      ],
      keywords: ['ears'],
      replyEn: 'Right! Take good care of your ears.',
      replyVi: 'Đúng rồi! Hãy giữ gìn đôi tai thật tốt nhé.',
    },
    {
      id: 'body-2',
      npc: 'mai',
      askEn: 'What should we wash before meals?',
      askVi: 'Chúng mình cần rửa gì trước bữa ăn?',
      image: null,
      answers: [
        { en: 'We wash our hands.', vi: 'Chúng mình rửa tay.' },
        { en: 'Wash your hands before lunch.', vi: 'Rửa tay trước bữa trưa.' },
      ],
      keywords: ['hands'],
      replyEn: 'Clean hands keep us healthy!',
      replyVi: 'Tay sạch giúp chúng mình khoẻ mạnh!',
    },
  ],

  trueFalse: [
    {
      en: 'We have two eyes and two ears.',
      vi: 'Chúng ta có hai mắt và hai tai.',
      image: '/image/art/human_body.webp',
      isTrue: true,
      wordIds: ['eye', 'ear'],
    },
    {
      en: 'We walk and run with our ears.',
      vi: 'Chúng ta đi và chạy bằng đôi tai.',
      image: null,
      illustration: '🦵',
      sceneBrief: 'Cowdi vui vẻ chạy bộ trên đường cỏ xanh, không chữ.',
      isTrue: false,
      whyVi: 'Chúng ta đi và chạy bằng chân ("legs" / "feet"), còn tai ("ears") dùng để nghe.',
      wordIds: ['leg', 'foot', 'ear'],
    },
    {
      en: 'We should brush our teeth twice a day.',
      vi: 'Chúng ta nên đánh răng hai lần mỗi ngày.',
      image: null,
      illustration: '🦷',
      sceneBrief: 'Chiếc răng trắng sáng lấp lánh bên bàn chải dễ thương, không chữ.',
      isTrue: true,
      wordIds: ['tooth'],
    },
    {
      en: 'The plural of "foot" is "foots".',
      vi: 'Số nhiều của "foot" là "foots".',
      image: null,
      illustration: '🦶',
      sceneBrief: 'Hai bàn chân nhỏ bước trên thảm cỏ, không chữ.',
      isTrue: false,
      whyVi: '"Foot" là danh từ bất quy tắc: số nhiều là "feet", không phải "foots".',
      wordIds: ['foot'],
    },
    {
      en: 'We wash our hands before every meal.',
      vi: 'Chúng ta rửa tay trước mỗi bữa ăn.',
      image: null,
      illustration: '🤚',
      sceneBrief: 'Đôi bàn tay rửa sạch dưới vòi nước có bọt xà phòng, không chữ.',
      isTrue: true,
      wordIds: ['hand'],
    },
    {
      en: 'We put a hat on our stomach.',
      vi: 'Chúng ta đội mũ lên bụng.',
      image: null,
      illustration: '🗣️',
      sceneBrief: 'Cowdi đội chiếc mũ rộng vành lên đầu, không chữ.',
      isTrue: false,
      whyVi: 'Ta đội mũ lên đầu ("head"), không phải lên bụng ("stomach").',
      wordIds: ['head', 'stomach'],
    },
  ],
};

export default BODY_LESSON;
