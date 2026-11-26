// Track: general — Unit int-u6 · Ở nhà hàng (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const RESTAURANT_LESSON = {
  id: 'at-restaurant',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u6',
  title: 'Ở nhà hàng',
  description: 'Đặt bàn, xem thực đơn, gọi món, báo dị ứng và thanh toán lịch sự tại nhà hàng',
  icon: '🍽️',
  objectives: [
    'Đặt bàn, hỏi gợi ý món ăn và gọi món lịch sự bằng I\'d like… và Could I have…?',
    'Diễn đạt yêu cầu đặc biệt về chế độ ăn chay, độ cay và dị ứng thực phẩm',
    'Yêu cầu hoá đơn và thanh toán tự nhiên khi kết thúc bữa ăn',
  ],

  vocabulary: [
    v('Menu', '/ˈmenjuː/', 'noun', 'Thực đơn', 'Could we see the menu, please?', 'Cho chúng mình xem thực đơn được không?', '📋'),
    v('Order', '/ˈɔːrdər/', 'verb', 'Gọi món, đặt món', 'Are you ready to order now?', 'Bạn đã sẵn sàng gọi món chưa?', '📝'),
    v('Waiter', '/ˈweɪtər/', 'noun', 'Nhân viên phục vụ', 'The waiter brought fresh menus quickly.', 'Nhân viên phục vụ mang thực đơn mới ra rất nhanh.', '🤵'),
    v('Reserve', '/rɪˈzɜːrv/', 'verb', 'Đặt bàn trước', 'We should reserve a quiet table.', 'Chúng mình nên đặt trước một bàn yên tĩnh.', '📅'),
    v('Table for two', '/ˈteɪbəl fɔːr tuː/', 'phrase', 'Bàn cho hai người', 'Hello, a table for two, please.', 'Xin chào, cho mình một bàn cho hai người nhé.', '🪑'),
    v('Appetizer', '/ˈæpɪtaɪzər/', 'noun', 'Món khai vị', 'Let us share spring rolls as an appetizer.', 'Mình gọi chung gỏi cuốn làm món khai vị nhé.', '🥗'),
    v('Main course', '/meɪn kɔːrs/', 'noun', 'Món chính', 'I will have grilled fish as my main course.', 'Mình chọn cá nướng làm món chính.', '🐟'),
    v('Dessert', '/dɪˈzɜːrt/', 'noun', 'Món tráng miệng', 'Would you like fruit for dessert?', 'Bạn có muốn ăn trái cây tráng miệng không?', '🍰'),
    v('Drink', '/drɪŋk/', 'noun', 'Đồ uống', 'What drink would you like tonight?', 'Tối nay bạn muốn gọi đồ uống gì?', '🥤'),
    v('Bill', '/bɪl/', 'noun', 'Hoá đơn tính tiền', 'Excuse me, could we have the bill?', 'Cho mình hỏi, cho tụi mình xin hoá đơn nhé?', '🧾'),
    v('Tip', '/tɪp/', 'noun', 'Tiền boa', 'They left a small tip for good service.', 'Họ để lại một ít tiền boa vì phục vụ tốt.', '💸'),
    v('Spicy', '/ˈspaɪsi/', 'adjective', 'Cay', 'Please make the soup not too spicy.', 'Làm ơn nấu món canh đừng cay quá nhé.', '🌶️'),
    v('Vegetarian', '/ˌvedʒəˈteriən/', 'adjective', 'Chay (không thịt cá)', 'This restaurant offers many vegetarian dishes.', 'Nhà hàng này có nhiều món chay lắm.', '🥦'),
    v('Allergic', '/əˈlɜːrdʒɪk/', 'adjective', 'Bị dị ứng', 'Alex is allergic to peanuts.', 'Alex bị dị ứng với đậu phộng.', '⚠️'),
  ],

  grammar: [
    {
      title: 'Gọi món và yêu cầu lịch sự: I\'d like… / Could I have…?',
      explanation: 'Trong nhà hàng, dùng "I\'d like…" (= I would like), "I\'ll have…" hoặc "Could I have…, please?" thay vì "I want…" hay "Give me…". Hỏi gợi ý món ngon bằng "What do you recommend?".',
      examples: [
        { en: 'A table for two near the window, please.', vi: 'Cho mình một bàn hai người gần cửa sổ nhé.' },
        { en: "I'd like the grilled chicken, please.", vi: 'Cho mình gọi món gà nướng nhé.' },
        { en: 'What vegetarian dish do you recommend?', vi: 'Bạn gợi ý món chay nào ngon?' },
        { en: 'Could we have the bill, please?', vi: 'Cho chúng mình xin hoá đơn tính tiền nhé?' },
      ],
      mistakes: [
        { wrong: 'I want the menu now.', right: 'Could I see the menu, please?', note: 'Dùng "Could I…?" hoặc "I\'d like…" sẽ lịch sự hơn nhiều so với "I want".' },
        { wrong: "I'd like order a soup.", right: "I'd like to order a soup.", note: 'Sau "I\'d like" cần có "to" trước động từ nguyên mẫu: "I\'d like to order".' },
      ],
    },
    {
      title: 'Báo dị ứng và chỉnh món: be allergic to… / without…',
      explanation: 'Dùng "I\'m allergic to + thực phẩm" (luôn dùng giới từ "to") để báo dị ứng. Dùng "without + nguyên liệu" hoặc "not too spicy/salty" để điều chỉnh hương vị món ăn.',
      examples: [
        { en: "I'm allergic to peanuts and shrimp.", vi: 'Mình bị dị ứng với đậu phộng và tôm.' },
        { en: 'Can I have the noodles without onions?', vi: 'Cho mình tô mì không hành được không?' },
        { en: 'Please make my dish not too spicy.', vi: 'Vui lòng làm món của mình đừng cay quá.' },
        { en: 'Do you have any vegetarian appetizers?', vi: 'Quán có món khai vị chay nào không?' },
      ],
      mistakes: [
        { wrong: "I'm allergic with seafood.", right: "I'm allergic to seafood.", note: 'Tính từ "allergic" luôn đi với giới từ "to", không dùng "with".' },
        { wrong: 'No put onions, please.', right: 'Without onions, please. / No onions, please.', note: 'Yêu cầu bỏ nguyên liệu nói gọn là "No onions, please" hoặc "without onions".' },
      ],
    },
  ],

  reading: {
    title: 'Bữa tối ở nhà hàng món Việt',
    passage: [
      'Waiter: Good evening! Did you reserve a table?',
      'Lan: Yes, a table for two under Lan. Could we see the menu, please?',
      'Waiter: Of course. Are you ready to order a drink first?',
      'Alex: I would like iced lotus tea. Also, I am vegetarian and allergic to peanuts.',
      'Waiter: Noted! Our fresh tofu rolls make a great appetizer, and they are not spicy.',
      'Lan: Sounds wonderful. For our main course, we will have mushroom hotpot, plus mango for dessert.',
      'Alex: Everything was delicious! Excuse me, could we have the bill? Let us leave a small tip, Lan.',
    ].join('\n'),
    translation: [
      'Phục vụ: Chào buổi tối! Hai bạn đã đặt bàn trước chưa ạ?',
      'Lan: Rồi ạ, bàn cho hai người tên Lan. Cho tụi mình xem thực đơn nhé?',
      'Phục vụ: Dạ vâng. Hai bạn đã sẵn sàng gọi đồ uống trước chưa ạ?',
      'Alex: Mình muốn trà sen đá. Với lại mình ăn chay và bị dị ứng đậu phộng.',
      'Phục vụ: Mình ghi chú rồi ạ! Gỏi cuốn đậu hũ tươi là món khai vị rất ngon và không cay.',
      'Lan: Nghe tuyệt quá. Món chính tụi mình gọi lẩu nấm, thêm xoài làm món tráng miệng nhé.',
      'Alex: Món nào cũng ngon! Cho mình xin hoá đơn nhé? Mình để lại một ít tiền boa nhé Lan.',
    ].join('\n'),
    highlights: ['Waiter', 'Reserve', 'Menu', 'Order', 'Drink', 'Vegetarian', 'Allergic', 'Appetizer', 'Spicy', 'Dessert', 'Bill', 'Tip'],
    questions: [
      {
        question: 'Alex có hai yêu cầu đặc biệt nào về món ăn?',
        options: [
          'Ăn chay và bị dị ứng đậu phộng',
          'Thích ăn rất cay và không uống trà',
          'Chỉ ăn hải sản và không ăn tráng miệng',
          'Dị ứng nấm và không ăn rau',
        ],
        correct: 0,
        explanation: 'Alex báo rõ: "I am vegetarian and allergic to peanuts."',
      },
      {
        question: 'Nhân viên phục vụ gợi ý món khai vị nào?',
        options: ['Súp gà cay nóng', 'Gỏi cuốn đậu hũ tươi', 'Cá nướng mật ong', 'Bánh mì bơ tỏi'],
        correct: 1,
        explanation: 'Phục vụ gợi ý: "Our fresh tofu rolls make a great appetizer, and they are not spicy."',
      },
      {
        question: 'Hai bạn chọn món gì làm món chính và tráng miệng?',
        options: [
          'Cơm gà và kem',
          'Phở bò và chuối',
          'Lẩu nấm và xoài',
          'Bún chả và bánh ngọt',
        ],
        correct: 2,
        explanation: 'Lan gọi: "For our main course, we will have mushroom hotpot, plus mango for dessert."',
      },
      {
        question: 'Cuối bữa ăn, Alex muốn làm thêm điều gì ngoài việc xin hoá đơn?',
        options: ['Đặt bàn cho ngày mai', 'Đổi sang bàn khác', 'Gọi thêm trà sen', 'Để lại một ít tiền boa'],
        correct: 3,
        explanation: 'Alex nói với Lan: "Let us leave a small tip, Lan."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Appetizer" là phần nào trong bữa ăn ở nhà hàng?',
      options: ['Món khai vị', 'Món chính', 'Món tráng miệng', 'Hoá đơn'],
      correct: 0,
      explanation: '"Appetizer" (hoặc starter) = món khai vị ăn mở đầu bữa.',
    },
    {
      skill: 'vocab',
      question: '"Dessert" nghĩa là gì?',
      options: ['Sa mạc', 'Món tráng miệng', 'Món khai vị', 'Tiền boa'],
      correct: 1,
      explanation: '"Dessert" (hai chữ s) = món tráng miệng; "desert" (một chữ s) mới là sa mạc.',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "My friend is allergic ___ peanuts."',
      options: ['with', 'for', 'to', 'at'],
      correct: 2,
      explanation: 'Cụm từ cố định là "be allergic to + chất gây dị ứng".',
    },
    {
      skill: 'grammar',
      question: 'Chọn cách gọi món lịch sự và ĐÚNG ngữ pháp:',
      options: [
        "I'd like order a bowl of soup.",
        "Give me a soup now.",
        'I want to you bring soup.',
        'I\'d like to order a bowl of soup.',
      ],
      correct: 3,
      explanation: 'Sau "I\'d like" dùng "to + động từ nguyên mẫu": "I\'d like to order…".',
    },
    {
      skill: 'usage',
      question: 'Bạn không ăn được hành và muốn dặn phục vụ khi gọi mì. Câu nào tự nhiên nhất?',
      options: [
        'Can I have the noodles without onions, please?',
        'Do not put any onions into my noodles now!',
        'I am very allergic not to onions today.',
        'Where is the onion bill for our table?',
      ],
      correct: 0,
      explanation: '"Can I have … without …, please?" là cách chỉnh món lịch sự.',
    },
    {
      skill: 'usage',
      question: 'Ăn xong và bạn muốn thanh toán, bạn gọi nhân viên và nói:',
      options: [
        'Could we reserve a menu?',
        'Could we have the bill, please?',
        'What is the main course?',
        'A table for two, please.',
      ],
      correct: 1,
      explanation: '"Could we have the bill, please?" = Cho chúng mình xin hoá đơn nhé?',
    },
    {
      skill: 'vocab',
      question: 'Bạn muốn đặt trước một bàn cho tối thứ Bảy. Động từ đúng là:',
      options: ['tip', 'allergic', 'reserve', 'spicy'],
      correct: 2,
      explanation: '"Reserve a table" (hoặc book a table) = đặt bàn trước.',
    },
    {
      skill: 'listening',
      audioText: 'Please make my soup not too spicy.',
      question: 'Nghe và chọn yêu cầu của khách hàng:',
      options: ['Tính tiền ngay', 'Thêm thật nhiều ớt', 'Đổi sang món tráng miệng', 'Nấu món canh đừng cay quá'],
      correct: 3,
      explanation: '"not too spicy" = đừng cay quá.',
    },
    {
      skill: 'listening',
      audioText: 'Do you have any vegetarian dishes on the menu?',
      question: 'Nghe và chọn loại món khách đang hỏi:',
      options: ['Món chay', 'Món hải sản', 'Món ăn nhanh', 'Món tráng miệng'],
      correct: 0,
      explanation: '"vegetarian dishes" = các món ăn chay.',
    },
  ],
};

export default RESTAURANT_LESSON;
