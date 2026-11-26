// Track: general — Unit int-u5 · Tiền & giá cả (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const MONEY_PRICES_LESSON = {
  id: 'money-prices',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u5',
  title: 'Tiền & giá cả',
  description: 'Hỏi giá, đọc số tiền, xin giảm giá lịch sự và thanh toán tiền mặt hoặc thẻ khi mua sắm',
  icon: '💵',
  objectives: [
    'Hỏi và trả lời giá cả chính xác cho danh từ số ít và số nhiều (How much is/are…?, How much does… cost?)',
    'Gọi tên đúng các phương thức thanh toán và giấy tờ mua bán (cash, card, receipt, change, discount)',
    'Giao tiếp lịch sự khi hỏi khuyến mãi, trả tiền và nhận lại tiền thừa ở cửa hàng hoặc chợ',
  ],

  vocabulary: [
    v('Money', '/ˈmʌni/', 'noun', 'Tiền bạc', 'I brought enough money for gifts.', 'Mình mang đủ tiền để mua quà rồi.', '💰'),
    v('Cash', '/kæʃ/', 'noun', 'Tiền mặt', 'Can I pay in cash here?', 'Ở đây mình trả bằng tiền mặt được không?', '💵'),
    v('Card', '/kɑːrd/', 'noun', 'Thẻ ngân hàng', 'This store accepts both cash and card.', 'Cửa hàng này nhận cả tiền mặt và thẻ.', '💳'),
    v('Coin', '/kɔɪn/', 'noun', 'Đồng xu', 'Keep your small coins in a pouch.', 'Cất những đồng xu nhỏ vào túi nhé.', '🪙'),
    v('Bill', '/bɪl/', 'noun', 'Tờ tiền giấy / hoá đơn tính tiền', 'I paid with a twenty-dollar bill.', 'Mình đã trả bằng một tờ hai mươi đô.', '💵'),
    v('Price', '/praɪs/', 'noun', 'Giá cả', 'The price is clearly shown on the tag.', 'Giá được ghi rõ trên nhãn mác.', '🏷️'),
    v('Cheap', '/tʃiːp/', 'adjective', 'Rẻ', 'Fresh fruit at the local market is cheap.', 'Trái cây tươi ở chợ địa phương rất rẻ.', '🍍'),
    v('Expensive', '/ɪkˈspensɪv/', 'adjective', 'Đắt tiền', 'That leather backpack is too expensive.', 'Chiếc ba lô da kia quá đắt.', '👜'),
    v('Discount', '/ˈdɪskaʊnt/', 'noun', 'Khoản giảm giá, chiết khấu', 'Students get a small discount here.', 'Học sinh được giảm giá một chút ở đây.', '🎟️'),
    v('Sale', '/seɪl/', 'noun', 'Đợt giảm giá', 'These summer T-shirts are on sale.', 'Những chiếc áo thun mùa hè này đang giảm giá.', '🏷️'),
    v('Receipt', '/rɪˈsiːt/', 'noun', 'Biên lai, hoá đơn (chữ p câm)', 'Would you like a printed receipt?', 'Bạn có muốn lấy biên lai in không?', '🧾'),
    v('Change', '/tʃeɪndʒ/', 'noun', 'Tiền thối, tiền thừa', 'Here is your change and your bag.', 'Đây là tiền thừa và túi đồ của bạn.', '💱'),
    v('Total', '/ˈtoʊtəl/', 'noun', 'Tổng số tiền', 'The total comes to fifteen dollars.', 'Tổng cộng là mười lăm đô la.', '🧮'),
    v('Currency', '/ˈkɜːrənsi/', 'noun', 'Đơn vị tiền tệ', 'The local currency in Vietnam is the dong.', 'Đơn vị tiền tệ ở Việt Nam là đồng.', '💱'),
  ],

  grammar: [
    {
      title: 'Hỏi giá số ít & số nhiều: How much is/are…? & How much does… cost?',
      explanation: 'Với 1 món (số ít) dùng "How much is this/that + N?" hoặc "How much does it cost?". Với nhiều món hoặc đồ đi theo đôi (shoes, socks, jeans) dùng "How much are these/those + N?" hoặc "How much do they cost?".',
      examples: [
        { en: 'How much is this blue notebook?', vi: 'Quyển vở màu xanh này giá bao nhiêu?' },
        { en: 'How much are these cotton socks?', vi: 'Những đôi tất cotton này giá bao nhiêu?' },
        { en: 'How much does that T-shirt cost?', vi: 'Chiếc áo thun kia có giá bao nhiêu?' },
        { en: 'They cost twelve dollars in total.', vi: 'Chúng có tổng giá là mười hai đô la.' },
      ],
      mistakes: [
        { wrong: 'How much this notebook?', right: 'How much is this notebook?', note: 'Câu hỏi giá luôn cần động từ "is" (số ít) hoặc "are" (số nhiều).' },
        { wrong: 'How much is these shoes?', right: 'How much are these shoes?', note: '"Shoes" là danh từ số nhiều nên phải dùng "are", không dùng "is".' },
      ],
    },
    {
      title: 'Hỏi giảm giá và thanh toán lịch sự (in cash / by card / on sale)',
      explanation: 'Dùng "pay in cash" (trả tiền mặt) và "pay by card" (trả bằng thẻ). Nói món đồ đang giảm giá: "be on sale". Hỏi giảm giá lịch sự: "Is there a student discount?" và chốt mua: "I\'ll take it / them!".',
      examples: [
        { en: 'Are these T-shirts on sale today?', vi: 'Hôm nay những chiếc áo thun này có đang giảm giá không?' },
        { en: 'Is there a discount if I buy two?', vi: 'Nếu mình mua hai cái thì có được giảm giá không?' },
        { en: 'I would like to pay in cash, please.', vi: 'Mình muốn thanh toán bằng tiền mặt.' },
        { en: 'Could I have the receipt, please?', vi: 'Cho mình xin biên lai được không?' },
      ],
      mistakes: [
        { wrong: 'Can I have the recipe, please? (khi xin hoá đơn)', right: 'Can I have the receipt, please?', note: '"Recipe" là công thức nấu ăn; hoá đơn / biên lai là "receipt" (đọc /rɪˈsiːt/, chữ p câm).' },
        { wrong: 'I pay by cash.', right: 'I pay in cash. / I pay by card.', note: 'Tiền mặt dùng "in cash", còn thẻ dùng "by card".' },
      ],
    },
  ],

  reading: {
    title: 'Mua quà lưu niệm ở cửa hàng nhỏ',
    passage: [
      'Lan: Excuse me, how much is this green T-shirt? I do not see a price tag.',
      'Clerk: It is twelve dollars, but all summer shirts are on sale today with a small discount.',
      'Lan: Great! That is quite cheap, not expensive at all. I will also take this notebook.',
      'Clerk: Your total is fifteen dollars. Would you like to pay in cash or by card?',
      'Lan: I brought cash—here is a twenty-dollar bill. Do you accept local currency too?',
      'Clerk: Yes, we accept Vietnamese dong! Here is your five-dollar change and your receipt.',
      'Lan: Thank you very much!',
    ].join('\n'),
    translation: [
      'Lan: Cho em hỏi, chiếc áo thun màu xanh lá này giá bao nhiêu ạ? Em không thấy nhãn giá.',
      'Nhân viên: Mười hai đô la em nhé, nhưng hôm nay tất cả áo mùa hè đều đang giảm giá có chiết khấu nhẹ.',
      'Lan: Tuyệt quá! Vậy khá rẻ chứ không đắt chút nào. Em lấy thêm quyển sổ tay này nữa ạ.',
      'Nhân viên: Tổng của em là mười lăm đô la. Em muốn trả bằng tiền mặt hay thẻ?',
      'Lan: Em mang tiền mặt—đây là tờ hai mươi đô ạ. Cửa hàng mình có nhận tiền tệ địa phương không ạ?',
      'Nhân viên: Có chứ, bên chị nhận cả tiền đồng Việt Nam! Đây là năm đô tiền thừa và biên lai của em.',
      'Lan: Em cảm ơn chị nhiều ạ!',
    ].join('\n'),
    highlights: ['Price', 'Sale', 'Discount', 'Cheap', 'Expensive', 'Total', 'Cash', 'Card', 'Bill', 'Currency', 'Change', 'Receipt'],
    questions: [
      {
        question: 'Vì sao Lan phải hỏi nhân viên giá chiếc áo thun xanh?',
        options: ['Vì chiếc áo quá đắt tiền', 'Vì Lan quên mang theo ví', 'Vì áo không có nhãn giá', 'Vì cửa hàng sắp đóng cửa'],
        correct: 2,
        explanation: 'Lan nói: "how much is this green T-shirt? I do not see a price tag."',
      },
      {
        question: 'Tổng số tiền Lan cần thanh toán cho áo thun và sổ tay là bao nhiêu?',
        options: ['12 đô la', '5 đô la', '20 đô la', '15 đô la'],
        correct: 3,
        explanation: 'Nhân viên báo: "Your total is fifteen dollars."',
      },
      {
        question: 'Lan thanh toán bằng cách nào?',
        options: ['Trả tiền mặt tờ 20 đô', 'Trả bằng tiền xu lẻ', 'Quẹt thẻ ngân hàng', 'Chuyển khoản qua máy'],
        correct: 0,
        explanation: 'Lan nói: "I brought cash—here is a twenty-dollar bill."',
      },
      {
        question: 'Nhân viên đưa lại cho Lan những gì sau khi thanh toán?',
        options: ['Một phiếu giảm giá mới', '5 đô tiền thừa và biên lai', 'Một chiếc mũ tặng kèm', '10 đô tiền thừa'],
        correct: 1,
        explanation: 'Nhân viên nói: "Here is your five-dollar change and your receipt."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Từ tiếng Anh nào có nghĩa là "biên lai / hoá đơn" (lưu ý âm p câm)?',
      options: ['recipe', 'change', 'receipt', 'currency'],
      correct: 2,
      explanation: '"Receipt" (/rɪˈsiːt/) = biên lai; "recipe" là công thức nấu ăn.',
    },
    {
      skill: 'vocab',
      question: 'Số tiền người bán trả lại khi bạn đưa tờ tiền lớn hơn giá món hàng gọi là:',
      options: ['discount', 'total', 'sale', 'change'],
      correct: 3,
      explanation: '"Change" nghĩa là tiền thừa / tiền thối.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu hỏi giá ĐÚNG cho một đôi giày:',
      options: [
        'How much are these shoes?',
        'How much is these shoes?',
        'How many are these shoes?',
        'How much these shoes?',
      ],
      correct: 0,
      explanation: '"These shoes" là số nhiều nên dùng "How much are these shoes?".',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "I would like to pay ___ cash, or can I pay ___ card?"',
      options: ['by / in', 'in / by', 'on / by', 'in / at'],
      correct: 1,
      explanation: 'Cụm chuẩn là "pay in cash" (tiền mặt) và "pay by card" (thẻ).',
    },
    {
      skill: 'vocab',
      question: 'Từ trái nghĩa với "expensive" (đắt) là:',
      options: ['total', 'high', 'cheap', 'coin'],
      correct: 2,
      explanation: '"Cheap" (rẻ) trái nghĩa với "expensive" (đắt).',
    },
    {
      skill: 'usage',
      question: 'Bạn thấy chiếc áo hơi đắt và muốn hỏi giảm giá một cách lịch sự. Bạn nói:',
      options: [
        'Make this shirt cheap right now!',
        'Give me back my change right now!',
        'Why is your shirt price so high?',
        'Is there a discount on this shirt?',
      ],
      correct: 3,
      explanation: '"Is there a discount on…?" là cách hỏi giảm giá lịch sự.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng để nói món hàng đang trong đợt giảm giá:',
      options: [
        'These bags are on sale today.',
        'These bags are in sale today.',
        'These bags are at sale today.',
        'These bags are by sale today.',
      ],
      correct: 0,
      explanation: 'Cụm từ cố định "be on sale" nghĩa là đang được bán giảm giá.',
    },
    {
      skill: 'listening',
      audioText: 'The total is twenty dollars. Here is your receipt.',
      question: 'Nghe và chọn tổng số tiền cần trả:',
      options: ['12 đô la', '20 đô la', '15 đô la', '25 đô la'],
      correct: 1,
      explanation: '"The total is twenty dollars" = Tổng cộng là hai mươi đô la.',
    },
    {
      skill: 'listening',
      audioText: 'Do you accept cards or only cash?',
      question: 'Nghe và chọn điều khách hàng đang hỏi:',
      options: [
        'Đường đi tới ngân hàng ở đâu.',
        'Cửa hàng đóng mở cửa lúc mấy giờ.',
        'Cửa hàng nhận thẻ hay chỉ tiền mặt.',
        'Chiếc túi này có màu xanh không.',
      ],
      correct: 2,
      explanation: '"accept cards or only cash" = nhận thẻ hay chỉ nhận tiền mặt.',
    },
  ],
};

export default MONEY_PRICES_LESSON;
