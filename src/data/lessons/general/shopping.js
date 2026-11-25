// Track: general — Unit int-u7 · Mua sắm (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const SHOPPING_LESSON = {
  id: 'shopping',
  contentVersion: 2,
  track: 'general',
  level: 'intermediate',
  cefrLevel: 'A2',
  unit: 'int-u7',
  title: 'Mua sắm',
  description: 'Thử đồ, so sánh chất lượng, hỏi đổi trả – bảo hành và thanh toán tại cửa hàng lẫn trực tuyến',
  icon: '🛒',
  objectives: [
    'Dùng thành thạo 20 từ vựng mua sắm trực tiếp và trực tuyến (try on, size, exchange, refund, warranty, delivery)',
    'Phân biệt How much / How many và dùng đúng cấu trúc too + adj / adj + enough khi thử đồ',
    'Hỏi chính sách đổi hàng, hoàn tiền và bảo hành một cách lịch sự, tự tin',
  ],

  vocabulary: [
    v('Shop', '/ʃɑːp/', 'noun', 'Cửa hàng', 'We visited a sports shop downtown.', 'Chúng mình ghé một cửa hàng thể thao ở trung tâm.', '🏪'),
    v('Price', '/praɪs/', 'noun', 'Giá cả', 'Check the price before going to checkout.', 'Kiểm tra giá trước khi ra quầy thanh toán nhé.', '💰'),
    v('Expensive', '/ɪkˈspensɪv/', 'adjective', 'Đắt tiền', 'Famous brands are sometimes quite expensive.', 'Các thương hiệu nổi tiếng đôi khi khá đắt.', '💎'),
    v('Cheap', '/tʃiːp/', 'adjective', 'Rẻ tiền', 'Cheap shoes may wear out quickly.', 'Giày quá rẻ có thể nhanh hỏng.', '🏷️'),
    v('Discount', '/ˈdɪskaʊnt/', 'noun', 'Chiết khấu, giảm giá', 'Members receive a ten percent discount.', 'Thành viên được giảm giá mười phần trăm.', '🔖'),
    v('Cash', '/kæʃ/', 'noun', 'Tiền mặt', 'I prefer paying in cash at markets.', 'Mình thích trả bằng tiền mặt ở chợ.', '💵'),
    v('Size', '/saɪz/', 'noun', 'Kích cỡ', 'Do you have these sneakers in size thirty-eight?', 'Cửa hàng có đôi giày thể thao này cỡ 38 không?', '📏'),
    v('Receipt', '/rɪˈsiːt/', 'noun', 'Hoá đơn, biên lai', 'Keep your receipt in case you need a refund.', 'Giữ lại hoá đơn phòng khi bạn cần hoàn tiền.', '🧾'),
    v('Customer', '/ˈkʌstəmər/', 'noun', 'Khách hàng', 'Helpful staff make every customer smile.', 'Nhân viên tận tình khiến mọi khách hàng hài lòng.', '🧑'),
    v('Sale', '/seɪl/', 'noun', 'Đợt khuyến mãi', 'The shop holds a back-to-school sale.', 'Cửa hàng đang có đợt giảm giá mùa tựu trường.', '🛍️'),
    v('Refund', '/ˈriːfʌnd/', 'noun', 'Khoản hoàn tiền', 'Customers can request a refund within seven days.', 'Khách hàng có thể yêu cầu hoàn tiền trong bảy ngày.', '💸'),
    v('Exchange', '/ɪksˈtʃeɪndʒ/', 'verb', 'Đổi hàng', 'Can I exchange this jacket for a larger size?', 'Mình có thể đổi chiếc áo khoác này sang cỡ lớn hơn không?', '🔄'),
    v('Brand', '/brænd/', 'noun', 'Thương hiệu', 'This local brand is known for durability.', 'Thương hiệu nội địa này nổi tiếng về độ bền.', '™️'),
    v('Quality', '/ˈkwɑːləti/', 'noun', 'Chất lượng', 'Good quality matters more than low price.', 'Chất lượng tốt quan trọng hơn giá rẻ.', '⭐'),
    v('Warranty', '/ˈwɔːrənti/', 'noun', 'Chế độ bảo hành', 'The watch comes with a one-year warranty.', 'Chiếc đồng hồ đi kèm bảo hành một năm.', '🛡️'),
    v('Cart', '/kɑːrt/', 'noun', 'Giỏ hàng', 'Add the backpack to your online cart.', 'Thêm chiếc ba lô vào giỏ hàng trực tuyến của bạn.', '🛒'),
    v('Checkout', '/ˈtʃekaʊt/', 'noun', 'Quầy / bước thanh toán', 'Please review your items at checkout.', 'Vui lòng kiểm tra lại món đồ ở bước thanh toán.', '💳'),
    v('Delivery', '/dɪˈlɪvəri/', 'noun', 'Giao hàng', 'Online orders include free home delivery.', 'Đơn đặt trực tuyến được giao hàng tận nhà miễn phí.', '🚚'),
    v('Try on', '/traɪ ɑːn/', 'phrase', 'Mặc thử, đi thử', 'May I try on these running shoes?', 'Mình đi thử đôi giày chạy này được không?', '👟'),
    v('Bargain', '/ˈbɑːrɡɪn/', 'noun', 'Món hời (giá rất tốt)', 'Buying quality shoes on sale is a real bargain.', 'Mua được giày chất lượng lúc giảm giá đúng là món hời.', '🤑'),
  ],

  grammar: [
    {
      title: 'Phân biệt How much / How many & cấu trúc too / enough khi thử đồ',
      explanation: '"How much" hỏi giá hoặc danh từ không đếm được (How much money); "How many" hỏi số lượng đếm được (How many pairs). Khi nhận xét cỡ đồ: "too + tính từ" (quá chật: too tight) và "tính từ + enough" (đủ rộng: big enough — chú ý "enough" đứng SAU tính từ!).',
      examples: [
        { en: 'How much are these running shoes?', vi: 'Đôi giày chạy này giá bao nhiêu?' },
        { en: 'How many pairs of socks are in your cart?', vi: 'Có bao nhiêu đôi tất trong giỏ hàng của bạn?' },
        { en: 'This shirt is too tight for me.', vi: 'Chiếc áo này quá chật đối với mình.' },
        { en: 'These sneakers are comfortable and light enough.', vi: 'Đôi giày thể thao này êm và đủ nhẹ.' },
      ],
      mistakes: [
        { wrong: 'This jacket is enough big for me.', right: 'This jacket is big enough for me.', note: '"Enough" luôn đứng SAU tính từ: "big enough", không phải "enough big".' },
        { wrong: 'How much pairs do you need?', right: 'How many pairs do you need?', note: '"Pairs" là danh từ đếm được số nhiều nên phải dùng "How many".' },
      ],
    },
    {
      title: 'Mẫu câu lịch sự khi thử đồ, đổi hàng và hỏi bảo hành',
      explanation: 'Dùng "May I / Can I try this on?" khi thử đồ. Khi đổi cỡ dùng "exchange A for B" (đổi A lấy B), và dùng "keep the receipt" để bảo vệ quyền đổi trả hoặc bảo hành ("come with a warranty").',
      examples: [
        { en: 'May I try on a larger size, please?', vi: 'Mình thử cỡ lớn hơn một chút được không?' },
        { en: 'Can I exchange these shoes for size thirty-nine?', vi: 'Mình đổi đôi giày này sang cỡ 39 được không?' },
        { en: 'Does this backpack come with a warranty?', vi: 'Chiếc ba lô này có đi kèm bảo hành không?' },
        { en: 'Please keep your receipt for any refund.', vi: 'Vui lòng giữ biên lai nếu cần hoàn tiền.' },
      ],
      mistakes: [
        { wrong: 'I want to exchange this shirt to a blue one.', right: 'I would like to exchange this shirt for a blue one.', note: 'Động từ "exchange" đi với giới từ "for": "exchange A for B".' },
      ],
    },
  ],

  reading: {
    title: 'Chọn giày thể thao cho năm học mới',
    passage: [
      'Lan: Mom, look at this sports shop! They are having a big sale with a nice discount.',
      'Clerk: Welcome! Can I help you today?',
      'Lan: May I try on these white sneakers? I like this brand because the quality is great, and the price is a real bargain.',
      'Clerk: Of course! What size do you wear?',
      'Lan: Size thirty-seven—wait, it feels too tight. Can I exchange it for thirty-eight?',
      'Clerk: Certainly! Every customer gets a six-month warranty and a seven-day refund policy if you keep the receipt. Cash or card at checkout?',
      'Lan: Mom will pay in cash today. Next time we might order online for free delivery!',
    ].join('\n'),
    translation: [
      'Lan: Mẹ ơi, nhìn cửa hàng thể thao này kìa! Họ đang có đợt khuyến mãi lớn kèm giảm giá tốt lắm.',
      'Nhân viên: Chào hai mẹ con! Mình có thể giúp gì hôm nay ạ?',
      'Lan: Cho em đi thử đôi giày trắng này được không ạ? Em thích thương hiệu này vì chất lượng tốt, mà giá này đúng là món hời.',
      'Nhân viên: Tất nhiên rồi! Em đi cỡ bao nhiêu?',
      'Lan: Cỡ 37—khoan đã, hơi chật quá ạ. Em đổi sang cỡ 38 được không ạ?',
      'Nhân viên: Được chứ! Mọi khách hàng đều có bảo hành sáu tháng và chính sách hoàn tiền bảy ngày nếu giữ biên lai. Mình trả tiền mặt hay thẻ ở quầy thanh toán ạ?',
      'Lan: Hôm nay mẹ em trả tiền mặt ạ. Lần sau tụi em có thể đặt trực tuyến để được giao hàng miễn phí!',
    ].join('\n'),
    highlights: ['Shop', 'Sale', 'Discount', 'Brand', 'Quality', 'Price', 'Bargain', 'Size', 'Exchange', 'Customer', 'Warranty', 'Refund', 'Receipt', 'Cash', 'Checkout', 'Delivery'],
    questions: [
      {
        question: 'Vì sao Lan thích đôi giày của thương hiệu này?',
        options: ['Vì cửa hàng tặng kèm tất mới', 'Vì chất lượng tốt và đang giảm giá', 'Vì đôi giày có đế rất dày', 'Vì mẫu này chỉ bán trực tuyến'],
        correct: 1,
        explanation: 'Lan nói: "I like this brand because the quality is great, and the price is a real bargain."',
      },
      {
        question: 'Vì sao Lan xin đổi sang cỡ 38?',
        options: ['Vì Lan muốn đổi màu khác', 'Vì cỡ 37 bị quá rộng', 'Vì cỡ 37 bị quá chật', 'Vì giày bị rách'],
        correct: 2,
        explanation: 'Lan nói: "Size thirty-seven—wait, it feels too tight. Can I exchange it for thirty-eight?"',
      },
      {
        question: 'Khách hàng cần giữ lại vật gì để được áp dụng chính sách hoàn tiền 7 ngày?',
        options: ['Hộp giày cũ', 'Túi ni-lông', 'Thẻ ngân hàng', 'Biên lai (receipt)'],
        correct: 3,
        explanation: 'Nhân viên nhắc: "a seven-day refund policy if you keep the receipt."',
      },
      {
        question: 'Thời hạn bảo hành của đôi giày là bao lâu?',
        options: ['Sáu tháng', 'Một tháng', 'Bảy ngày', 'Hai năm'],
        correct: 0,
        explanation: 'Nhân viên nói rõ: "Every customer gets a six-month warranty".',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Warranty" khi mua đồ điện tử hoặc giày dép nghĩa là:',
      options: ['Phí giao hàng', 'Chế độ bảo hành', 'Giỏ hàng trực tuyến', 'Món hời'],
      correct: 1,
      explanation: '"Warranty" = bảo hành sản phẩm trong một thời hạn nhất định.',
    },
    {
      skill: 'vocab',
      question: 'Bạn muốn lấy lại tiền vì món hàng bị lỗi. Bạn yêu cầu một:',
      options: ['Discount', 'Brand', 'Refund', 'Cart'],
      correct: 2,
      explanation: '"Refund" = khoản hoàn tiền.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng khi dùng "enough":',
      options: [
        'These shoes are enough big for me.',
        'These shoes are too enough big.',
        'These shoes enough are big for me.',
        'These shoes are big enough for me.',
      ],
      correct: 3,
      explanation: '"Enough" đứng SAU tính từ: "big enough".',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "Can I exchange this shirt ___ a medium size?"',
      options: ['for', 'to', 'with', 'at'],
      correct: 0,
      explanation: 'Cấu trúc chuẩn là "exchange A for B" (đổi A lấy B).',
    },
    {
      skill: 'grammar',
      question: 'Điền từ hỏi đúng: "___ pairs of shoes did you add to your cart?"',
      options: ['How much', 'How many', 'How far', 'How often'],
      correct: 1,
      explanation: '"Pairs" là danh từ đếm được số nhiều → dùng "How many".',
    },
    {
      skill: 'usage',
      question: 'Bạn thấy một chiếc áo khoác đẹp ở cửa hàng và muốn mặc thử. Bạn hỏi:',
      options: [
        'May I refund this jacket before buying?',
        'May I delivery this jacket?',
        'May I try on this jacket, please?',
        'How many is this jacket?',
      ],
      correct: 2,
      explanation: '"Try on" = mặc thử / đi thử.',
    },
    {
      skill: 'vocab',
      question: 'Mua được một món đồ chất lượng tốt với giá rất rẻ gọi là một:',
      options: ['Checkout', 'Customer', 'Receipt', 'Bargain'],
      correct: 3,
      explanation: '"A real bargain" = một món hời.',
    },
    {
      skill: 'listening',
      audioText: 'Keep your receipt in case you want to exchange the shoes.',
      question: 'Nghe và chọn lý do cần giữ biên lai:',
      options: [
        'Phòng khi muốn đổi đôi giày',
        'Để được giảm giá thêm 50%',
        'Để nhận quà lưu niệm',
        'Để được giao hàng trong ngày',
      ],
      correct: 0,
      explanation: '"in case you want to exchange the shoes" = phòng khi bạn muốn đổi đôi giày.',
    },
    {
      skill: 'listening',
      audioText: 'Online orders include free home delivery.',
      question: 'Nghe và chọn ưu đãi khi đặt hàng trực tuyến:',
      options: ['Tặng thêm một đôi tất', 'Giao hàng tận nhà miễn phí', 'Bảo hành trọn đời', 'Giảm một nửa giá'],
      correct: 1,
      explanation: '"free home delivery" = giao hàng tận nhà miễn phí.',
    },
  ],
};

export default SHOPPING_LESSON;
