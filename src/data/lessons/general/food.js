// Track: general — Unit int-u6 · Thức ăn & Đồ uống (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const FOOD_LESSON = {
  id: 'food',
  contentVersion: 2,
  track: 'general',
  level: 'intermediate',
  cefrLevel: 'A2',
  unit: 'int-u6',
  title: 'Thức ăn & Đồ uống',
  description: 'Mô tả món ăn, đồ uống, hương vị và dùng đúng danh từ đếm được / không đếm được',
  icon: '🍕',
  objectives: [
    'Gọi tên 20 từ vựng về món ăn, đồ uống, hương vị (sweet, sour, salty, spicy) và công thức nấu ăn',
    'Phân biệt danh từ đếm được (an apple, two bowls) và không đếm được (some water, much rice, a little soup)',
    'Gọi món, khen ngợi và nhận xét hương vị món ăn một cách tự nhiên',
  ],

  vocabulary: [
    v('Water', '/ˈwɔːtər/', 'noun', 'Nước uống', 'Can I have some cold water?', 'Cho mình xin một ít nước mát được không?', '💧'),
    v('Rice', '/raɪs/', 'noun', 'Cơm, gạo', 'Most Vietnamese meals include steamed rice.', 'Hầu hết bữa cơm Việt Nam đều có cơm trắng.', '🍚'),
    v('Chicken', '/ˈtʃɪkɪn/', 'noun', 'Thịt gà', 'Lan cooked ginger chicken for lunch.', 'Lan đã nấu gà kho gừng cho bữa trưa.', '🍗'),
    v('Fruit', '/fruːt/', 'noun', 'Trái cây', 'Fresh tropical fruit is full of vitamins.', 'Trái cây nhiệt đới tươi có nhiều vitamin.', '🍎'),
    v('Vegetable', '/ˈvedʒtəbəl/', 'noun', 'Rau củ', 'Add green vegetables to every meal.', 'Hãy thêm rau xanh vào mỗi bữa ăn.', '🥦'),
    v('Coffee', '/ˈkɔːfi/', 'noun', 'Cà phê', 'My uncle drinks iced coffee every morning.', 'Chú mình uống cà phê đá mỗi sáng.', '☕'),
    v('Milk', '/mɪlk/', 'noun', 'Sữa', 'Cowdi loves drinking fresh milk!', 'Cowdi rất thích uống sữa tươi!', '🥛'),
    v('Bread', '/bred/', 'noun', 'Bánh mì', 'We bought warm bread from the bakery.', 'Chúng mình đã mua bánh mì nóng ở tiệm bánh.', '🍞'),
    v('Delicious', '/dɪˈlɪʃəs/', 'adjective', 'Ngon miệng', 'Grandma\'s noodle soup tastes delicious!', 'Món bún nước của bà ăn thật ngon!', '😋'),
    v('Hungry', '/ˈhʌŋɡri/', 'adjective', 'Đói bụng', 'I feel hungry after soccer practice.', 'Mình thấy đói sau buổi tập bóng đá.', '🤤'),
    v('Soup', '/suːp/', 'noun', 'Canh, súp', 'Hot sour soup warms you up.', 'Canh chua nóng giúp bạn ấm bụng.', '🍲'),
    v('Noodle', '/ˈnuːdəl/', 'noun', 'Mì, bún, phở', 'Minh enjoys eating beef noodles.', 'Minh rất thích ăn phở bò.', '🍜'),
    v('Steak', '/steɪk/', 'noun', 'Thịt bò bít tết', 'He ordered a grilled steak for dinner.', 'Anh ấy gọi một phần bít tết nướng cho bữa tối.', '🥩'),
    v('Dessert', '/dɪˈzɜːrt/', 'noun', 'Món tráng miệng', 'We shared sweet mango for dessert.', 'Chúng mình ăn chung xoài ngọt tráng miệng.', '🍰'),
    v('Spicy', '/ˈspaɪsi/', 'adjective', 'Cay', 'This dipping sauce is slightly spicy.', 'Nước chấm này hơi cay một chút.', '🌶️'),
    v('Sweet', '/swiːt/', 'adjective', 'Ngọt', 'Ripe bananas taste naturally sweet.', 'Chuối chín có vị ngọt tự nhiên.', '🍌'),
    v('Sour', '/ˈsaʊər/', 'adjective', 'Chua', 'Fresh lime juice is quite sour.', 'Nước chanh tươi khá chua.', '🍋'),
    v('Salty', '/ˈsɔːlti/', 'adjective', 'Mặn', 'Be careful not to make the soup too salty.', 'Cẩn thận đừng nấu canh mặn quá nhé.', '🧂'),
    v('Recipe', '/ˈresəpi/', 'noun', 'Công thức nấu ăn', 'Lan followed her grandmother\'s secret recipe.', 'Lan làm theo công thức bí truyền của bà.', '📋'),
    v('Appetizer', '/ˈæpɪtaɪzər/', 'noun', 'Món khai vị', 'We served fresh salad as an appetizer.', 'Chúng mình dọn xà lách tươi làm món khai vị.', '🥗'),
  ],

  grammar: [
    {
      title: 'Danh từ đếm được (Countable) & không đếm được (Uncountable)',
      explanation: 'Danh từ đếm được dùng được với a/an, số đếm và "many" (an apple, two bowls, many vegetables). Danh từ không đếm được như water, rice, milk, bread, soup, coffee KHÔNG dùng a/an hay -s; ta dùng "some", "much" hoặc đơn vị chứa ("a glass of water", "a bowl of rice").',
      examples: [
        { en: 'Can I have a glass of cold water?', vi: 'Cho mình một ly nước mát được không?' },
        { en: 'We need some rice and fresh vegetables.', vi: 'Chúng mình cần một ít gạo và rau tươi.' },
        { en: 'How much milk does Cowdi drink?', vi: 'Cowdi uống bao nhiêu sữa?' },
        { en: 'How many oranges did you buy?', vi: 'Bạn đã mua bao nhiêu quả cam?' },
      ],
      mistakes: [
        { wrong: 'I would like a water and two breads.', right: 'I would like a glass of water and two loaves of bread.', note: '"Water" và "bread" không đếm được, phải dùng kèm đơn vị (a glass of, a slice/loaf of) hoặc "some".' },
        { wrong: 'How many rice do you want?', right: 'How much rice do you want?', note: '"Rice" là danh từ không đếm được nên phải hỏi bằng "How much".' },
      ],
    },
    {
      title: 'Động từ giác quan "taste / smell / look + tính từ" & "too + tính từ"',
      explanation: 'Dùng "taste / smell + tính từ" để mô tả hương vị và mùi (tastes delicious, smells wonderful — KHÔNG dùng trạng từ). Dùng "too + tính từ" để nói vị quá mức (too spicy, too salty).',
      examples: [
        { en: 'This chicken soup tastes delicious!', vi: 'Món canh gà này nếm thật ngon!' },
        { en: 'The fresh bread smells amazing.', vi: 'Bánh mì mới nướng thơm tuyệt vời.' },
        { en: 'The sauce is too spicy for Mai.', vi: 'Nước chấm quá cay đối với Mai.' },
        { en: 'The soup is not too salty today.', vi: 'Hôm nay món canh không bị quá mặn.' },
      ],
      mistakes: [
        { wrong: 'This soup tastes deliciously.', right: 'This soup tastes delicious.', note: 'Sau động từ liên kết "taste / smell / look", dùng tính từ ("delicious"), không dùng trạng từ.' },
      ],
    },
  ],

  reading: {
    title: 'Bữa cơm trưa theo công thức của bà',
    passage: [
      'Minh: Mmm, something smells wonderful! I am so hungry, Lan.',
      'Lan: Welcome! Today I cooked using my grandmother\'s recipe. We have salad as an appetizer, grilled chicken, steamed rice, and sour vegetable soup.',
      'Minh: Let me try the soup. Wow, it tastes delicious—not too salty and just a little spicy!',
      'Lan: Would you like some iced water, fresh milk, or a cup of coffee?',
      'Minh: Just some water, please. What is for dessert?',
      'Lan: Sweet mango and banana! Fresh fruit is great after a warm meal. Save some bread and noodles for tomorrow!',
    ].join('\n'),
    translation: [
      'Minh: Ưm, có món gì thơm tuyệt vời thế! Mình đói bụng quá, Lan ơi.',
      'Lan: Chào mừng bạn! Hôm nay mình nấu theo công thức của bà mình. Có xà lách khai vị, gà nướng, cơm trắng và canh chua rau củ.',
      'Minh: Để mình nếm thử canh nhé. Ôi, ngon thật—không quá mặn mà chỉ hơi cay nhẹ thôi!',
      'Lan: Bạn muốn uống chút nước mát, sữa tươi hay một tách cà phê?',
      'Minh: Cho mình chút nước thôi nhé. Tráng miệng có món gì thế?',
      'Lan: Xoài chín ngọt và chuối! Trái cây tươi rất hợp sau bữa cơm ấm nóng. Còn bánh mì và mì để dành ngày mai nhé!',
    ].join('\n'),
    highlights: ['Hungry', 'Recipe', 'Appetizer', 'Chicken', 'Rice', 'Sour', 'Vegetable', 'Soup', 'Delicious', 'Salty', 'Spicy', 'Water', 'Milk', 'Coffee', 'Dessert', 'Sweet', 'Fruit', 'Bread', 'Noodle'],
    questions: [
      {
        question: 'Lan đã nấu bữa trưa dựa theo công thức của ai?',
        options: ['Của thầy Tom', 'Của một nhà hàng', 'Của mẹ Minh', 'Của bà Lan'],
        correct: 3,
        explanation: 'Lan kể: "Today I cooked using my grandmother\'s recipe."',
      },
      {
        question: 'Minh nhận xét vị của món canh như thế nào?',
        options: ['Ngon, vừa miệng, hơi cay', 'Khá mặn và cay nồng', 'Khá ngọt và bị nguội', 'Hơi nhạt và chưa chín'],
        correct: 0,
        explanation: 'Minh khen: "Wow, it tastes delicious—not too salty and just a little spicy!"',
      },
      {
        question: 'Minh chọn uống đồ uống nào?',
        options: ['Cà phê', 'Nước mát', 'Sữa tươi', 'Nước chanh'],
        correct: 1,
        explanation: 'Minh trả lời: "Just some water, please."',
      },
      {
        question: 'Món tráng miệng của bữa trưa là gì?',
        options: ['Bánh ngọt và kem', 'Bánh mì nướng', 'Xoài chín ngọt và chuối', 'Súp gà'],
        correct: 2,
        explanation: 'Lan nói: "Sweet mango and banana! Fresh fruit is great after a warm meal."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Từ nào có nghĩa là "công thức nấu ăn" (đừng nhầm với biên lai)?',
      options: ['receipt', 'appetizer', 'dessert', 'recipe'],
      correct: 3,
      explanation: '"Recipe" (/ˈresəpi/) = công thức nấu ăn; "receipt" = biên lai.',
    },
    {
      skill: 'vocab',
      question: 'Quả chanh tươi thường có vị nào?',
      options: ['Sour', 'Salty', 'Sweet', 'Spicy'],
      correct: 0,
      explanation: '"Sour" nghĩa là vị chua.',
    },
    {
      skill: 'grammar',
      question: 'Điền từ đúng cho danh từ không đếm được: "Can I have ___ water, please?"',
      options: ['a', 'some', 'an', 'many'],
      correct: 1,
      explanation: '"Water" không đếm được nên dùng "some" trong lời đề nghị lịch sự.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu hỏi ĐÚNG ngữ pháp:',
      options: [
        'How many rice do we need?',
        'How many milk is in the fridge?',
        'How much rice do we need?',
        'How much vegetables did you buy?',
      ],
      correct: 2,
      explanation: '"Rice" là danh từ không đếm được nên dùng "How much".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu khen món ăn ĐÚNG ngữ pháp:',
      options: [
        'This noodle soup tastes deliciously!',
        'This noodle soup is taste delicious!',
        'This noodle soup taste delicious!',
        'This noodle soup tastes delicious!',
      ],
      correct: 3,
      explanation: 'Sau "tastes" (ngôi 3 số ít) dùng tính từ "delicious".',
    },
    {
      skill: 'usage',
      question: 'Bạn nếm thử canh và thấy hơi mặn quá. Bạn nhận xét nhẹ nhàng:',
      options: [
        'The soup is a little too salty.',
        'The soup is too hungry.',
        'The soup is a recipe.',
        'The soup is many salt.',
      ],
      correct: 0,
      explanation: '"a little too salty" = hơi mặn một chút.',
    },
    {
      skill: 'vocab',
      question: 'Trong tiếng Anh, "mì / bún / phở" gọi chung bằng từ nào?',
      options: ['Bread', 'Noodle', 'Steak', 'Soup'],
      correct: 1,
      explanation: '"Noodle" (thường dùng số nhiều "noodles") chỉ các món sợi như mì, bún, phở.',
    },
    {
      skill: 'listening',
      audioText: 'We need some rice, chicken, and fresh vegetables.',
      question: 'Nghe và chọn 3 nguyên liệu cần mua:',
      options: ['Bít tết, xoài và nước chanh', 'Bánh mì, cà phê và sữa', 'Gạo, thịt gà và rau tươi', 'Mì, cá và bánh ngọt'],
      correct: 2,
      explanation: 'Câu nghe nhắc rõ "rice, chicken, and fresh vegetables".',
    },
    {
      skill: 'listening',
      audioText: 'This fresh bread smells wonderful.',
      question: 'Nghe và chọn câu đúng:',
      options: ['Bạn ấy đang tìm công thức làm bánh.', 'Bánh mì này quá cay.', 'Bữa tối đã hết bánh mì.', 'Bánh mì tươi này thơm tuyệt vời.'],
      correct: 3,
      explanation: '"smells wonderful" = có mùi thơm tuyệt vời.',
    },
  ],
};

export default FOOD_LESSON;
