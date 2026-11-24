// Track: general — Unit int-u9 · Môi trường (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const ENVIRONMENT_LESSON = {
  id: 'environment',
  contentVersion: 2,
  track: 'general',
  level: 'advanced',
  cefrLevel: 'B1',
  unit: 'int-u9',
  title: 'Môi trường',
  description: 'Thảo luận về biến đổi khí hậu, năng lượng tái tạo và thói quen sống bền vững',
  icon: '🌍',
  objectives: [
    'Dùng chính xác 20 từ vựng chủ đề môi trường, năng lượng sạch và bảo tồn thiên nhiên',
    'Sử dụng Câu bị động (be + V3, should be + V3) để nhấn mạnh giải pháp bảo vệ môi trường',
    'Đặt câu điều kiện loại 1 (If + Hiện tại Đơn, will + V) nêu hệ quả và lợi ích của hành động xanh',
  ],

  vocabulary: [
    v('Environment', '/ɪnˈvaɪrənmənt/', 'noun', 'Môi trường', 'Everyone shares responsibility for the environment.', 'Mọi người đều có chung trách nhiệm với môi trường.', '🌍'),
    v('Pollution', '/pəˈluːʃən/', 'noun', 'Sự ô nhiễm', 'Public buses help reduce air pollution.', 'Xe buýt công cộng giúp giảm ô nhiễm không khí.', '🏭'),
    v('Recycle', '/riːˈsaɪkəl/', 'verb', 'Tái chế', 'Our class recycles paper and glass bottles.', 'Lớp chúng mình tái chế giấy và chai thuỷ tinh.', '♻️'),
    v('Climate', '/ˈklaɪmət/', 'noun', 'Khí hậu', 'A changing climate brings hotter summers.', 'Khí hậu thay đổi mang đến những mùa hè nóng hơn.', '🌡️'),
    v('Deforestation', '/ˌdiːˌfɔːrɪˈsteɪʃən/', 'noun', 'Nạn phá rừng', 'Deforestation threatens many forest animals.', 'Nạn phá rừng đe doạ nhiều loài động vật rừng.', '🪓'),
    v('Endangered', '/ɪnˈdeɪndʒərd/', 'adjective', 'Có nguy cơ tuyệt chủng', 'Strict laws help protect endangered turtles.', 'Luật nghiêm ngặt giúp bảo vệ loài rùa nguy cấp.', '🐢'),
    v('Renewable', '/rɪˈnuːəbəl/', 'adjective', 'Có thể tái tạo (năng lượng)', 'Solar and wind are renewable energy sources.', 'Mặt trời và gió là nguồn năng lượng tái tạo.', '☀️'),
    v('Fossil fuel', '/ˈfɑːsəl fjuːəl/', 'noun', 'Nhiên liệu hoá thạch', 'Burning fossil fuel releases harmful gases.', 'Đốt nhiên liệu hoá thạch thải ra khí độc hại.', '⛽'),
    v('Carbon', '/ˈkɑːrbən/', 'noun', 'Cacbon', 'Cycling to school lowers your carbon footprint.', 'Đạp xe đi học giúp giảm dấu chân cacbon của bạn.', '💨'),
    v('Ecosystem', '/ˈiːkoʊˌsɪstəm/', 'noun', 'Hệ sinh thái', 'A healthy river ecosystem supports local fish.', 'Hệ sinh thái sông khoẻ mạnh nuôi dưỡng cá địa phương.', '🐠'),
    v('Drought', '/draʊt/', 'noun', 'Hạn hán', 'A long drought hurts rice farmers.', 'Đợt hạn hán kéo dài gây hại cho nông dân trồng lúa.', '🏜️'),
    v('Flood', '/flʌd/', 'noun', 'Lũ lụt', 'Green parks help absorb water during a flood.', 'Công viên xanh giúp thấm nước khi có lũ lụt.', '🌊'),
    v('Conservation', '/ˌkɑːnsərˈveɪʃən/', 'noun', 'Sự bảo tồn', 'Water conservation starts with small daily habits.', 'Bảo tồn nước bắt đầu từ những thói quen nhỏ hằng ngày.', '💧'),
    v('Waste', '/weɪst/', 'noun', 'Rác thải, sự lãng phí', 'Sorting trash cuts household waste in half.', 'Phân loại rác giúp giảm một nửa rác thải gia đình.', '🗑️'),
    v('Sustainable', '/səˈsteɪnəbəl/', 'adjective', 'Bền vững', 'Cities are building more sustainable transport.', 'Các thành phố đang xây dựng giao thông bền vững hơn.', '🌱'),
    v('Habitat', '/ˈhæbɪtæt/', 'noun', 'Môi trường sống tự nhiên', 'Mangrove forests provide a rich habitat.', 'Rừng ngập mặn cung cấp môi trường sống phong phú.', '🌲'),
    v('Emission', '/ɪˈmɪʃən/', 'noun', 'Khí thải', 'Electric buses produce zero tailpipe emissions.', 'Xe buýt điện không tạo ra khí thải ống xả.', '🚌'),
    v('Solar', '/ˈsoʊlər/', 'adjective', 'Thuộc năng lượng mặt trời', 'Our school installed solar panels on the roof.', 'Trường mình đã lắp tấm pin mặt trời trên mái.', '☀️'),
    v('Plastic', '/ˈplæstɪk/', 'noun', 'Nhựa', 'Avoid single-use plastic cups whenever possible.', 'Tránh dùng ly nhựa một lần bất cứ khi nào có thể.', '🥤'),
    v('Reusable', '/riːˈjuːzəbəl/', 'adjective', 'Tái sử dụng được', 'Carry a reusable bottle and cloth bag.', 'Hãy mang theo bình nước và túi vải tái sử dụng.', '🛍️'),
  ],

  grammar: [
    {
      title: 'Câu bị động (Passive Voice): be + V3 & modal + be + V3',
      explanation: 'Dùng Câu bị động khi muốn nhấn mạnh đối tượng chịu tác động hoặc giải pháp cần làm (không cần nêu ai làm): "am/is/are + V3" hoặc "should / must + be + V3".',
      examples: [
        { en: 'Plastic bottles are recycled at our school.', vi: 'Chai nhựa được tái chế tại trường chúng mình.' },
        { en: 'Natural habitats are threatened by deforestation.', vi: 'Môi trường sống tự nhiên bị đe doạ bởi nạn phá rừng.' },
        { en: 'Single-use waste should be reduced every day.', vi: 'Rác thải dùng một lần nên được giảm thiểu mỗi ngày.' },
        { en: 'Endangered wildlife must be protected by law.', vi: 'Động vật hoang dã nguy cấp phải được bảo vệ bởi pháp luật.' },
      ],
      mistakes: [
        { wrong: 'Plastic should recycle carefully.', right: 'Plastic should be recycled carefully.', note: 'Nhựa không tự tái chế mà ĐƯỢC tái chế → dùng bị động "should be recycled".' },
        { wrong: 'Many trees is planted every spring.', right: 'Many trees are planted every spring.', note: '"Many trees" là số nhiều nên trợ động từ "be" chia là "are".' },
      ],
    },
    {
      title: 'Câu điều kiện loại 1 (First Conditional): If + Hiện tại Đơn, will + V',
      explanation: 'Diễn tả nguyên nhân – kết quả có thật hoặc rất dễ xảy ra trong tương lai. Chú ý: mệnh đề "If" chia thì HIỆN TẠI ĐƠN, chỉ mệnh đề kết quả mới dùng "will / can + V nguyên mẫu".',
      examples: [
        { en: 'If students bring reusable bottles, waste will drop.', vi: 'Nếu học sinh mang bình tái sử dụng, rác thải sẽ giảm.' },
        { en: 'If we use solar energy, carbon emissions will fall.', vi: 'Nếu ta dùng năng lượng mặt trời, khí thải cacbon sẽ giảm.' },
        { en: 'If pollution rises, river ecosystems will suffer.', vi: 'Nếu ô nhiễm tăng, hệ sinh thái sông sẽ chịu ảnh hưởng.' },
        { en: 'If cities plant more trees, floods will be less severe.', vi: 'Nếu thành phố trồng thêm cây, lũ lụt sẽ bớt nghiêm trọng.' },
      ],
      mistakes: [
        { wrong: 'If we will recycle more, the town will be cleaner.', right: 'If we recycle more, the town will be cleaner.', note: 'Không dùng "will" trong mệnh đề có "If"; dùng Hiện tại Đơn "recycle".' },
      ],
    },
  ],

  reading: {
    title: 'Kế hoạch Ngày Xanh ở trường',
    passage: [
      'Lan: Minh, Ms. Hoa asked our class to organize Green Day for the environment. What ideas do you have?',
      'Minh: First, single-use plastic should be replaced! If every student carries a reusable bottle, school waste will drop fast.',
      'Lan: Great! We can also set up bins so paper and cans are recycled properly.',
      'Minh: Let us make a display on climate, pollution, and renewable solar power. Burning less fossil fuel lowers carbon emissions.',
      'Lan: I will add a poster on forest conservation, because deforestation harms endangered wildlife and every fragile habitat.',
      'Minh: If everyone builds sustainable habits, we can protect our river ecosystem from drought and flood!',
    ].join('\n'),
    translation: [
      'Lan: Minh ơi, cô Hoa nhờ lớp mình tổ chức Ngày Xanh vì môi trường. Bạn có ý tưởng gì không?',
      'Minh: Trước hết, đồ nhựa dùng một lần nên được thay thế! Nếu mỗi học sinh mang bình tái sử dụng, rác trường học sẽ giảm nhanh.',
      'Lan: Hay quá! Mình cũng đặt thùng phân loại để giấy và lon được tái chế đúng cách.',
      'Minh: Tụi mình làm góc trưng bày về khí hậu, ô nhiễm và năng lượng mặt trời tái tạo nhé. Đốt ít nhiên liệu hoá thạch hơn giúp giảm khí thải cacbon.',
      'Lan: Mình sẽ làm áp phích về bảo tồn rừng, vì phá rừng gây hại cho động vật nguy cấp và mọi môi trường sống mong manh.',
      'Minh: Nếu mọi người xây dựng thói quen bền vững, chúng ta có thể bảo vệ hệ sinh thái sông khỏi hạn hán và lũ lụt!',
    ].join('\n'),
    highlights: ['Environment', 'Plastic', 'Reusable', 'Waste', 'Recycle', 'Climate', 'Pollution', 'Renewable', 'Solar', 'Carbon', 'Emission', 'Conservation', 'Deforestation', 'Endangered', 'Habitat', 'Sustainable', 'Ecosystem', 'Drought', 'Flood'],
    questions: [
      {
        question: 'Ý tưởng đầu tiên Minh đề xuất cho Ngày Xanh là gì?',
        options: [
          'Lắp thêm điều hoà trong lớp',
          'Thay thế nhựa dùng một lần bằng bình tái sử dụng',
          'Tổ chức cuộc thi chạy bộ',
          'Mua thêm giấy mới cho thư viện',
        ],
        correct: 1,
        explanation: 'Minh nói: "First, single-use plastic should be replaced! If every student carries a reusable bottle, school waste will drop fast."',
      },
      {
        question: 'Theo Minh, việc đốt ít nhiên liệu hoá thạch hơn mang lại kết quả gì?',
        options: ['Làm tăng lượng rác giấy', 'Giảm khí thải cacbon', 'Làm giảm diện tích công viên', 'Tăng chi phí điện'],
        correct: 1,
        explanation: 'Minh nêu rõ: "Burning less fossil fuel lowers carbon emissions."',
      },
      {
        question: 'Áp phích của Lan tập trung vào chủ đề nào?',
        options: ['Xe buýt điện', 'Bảo tồn rừng và tác hại của phá rừng', 'Năng lượng gió ngoài khơi', 'Tái chế thiết bị điện tử'],
        correct: 1,
        explanation: 'Lan nói: "I will add a poster on forest conservation, because deforestation harms endangered wildlife and every fragile habitat."',
      },
      {
        question: 'Theo câu cuối của Minh, thói quen bền vững giúp bảo vệ điều gì?',
        options: ['Hệ sinh thái sông khỏi hạn hán và lũ lụt', 'Các toà nhà văn phòng', 'Đường cao tốc', 'Các nhà máy công nghiệp'],
        correct: 0,
        explanation: 'Minh kết thúc: "we can protect our river ecosystem from drought and flood!"',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Renewable energy" dùng để chỉ nhóm nguồn năng lượng nào?',
      options: ['Than đá và dầu mỏ', 'Năng lượng mặt trời và gió (tái tạo được)', 'Rác thải nhựa', 'Khí thải xe cộ'],
      correct: 1,
      explanation: '"Renewable" = tái tạo được, không bị cạn kiệt nhanh như nhiên liệu hoá thạch.',
    },
    {
      skill: 'vocab',
      question: 'Nơi sinh sống tự nhiên của một loài động thực vật gọi là:',
      options: ['Emission', 'Habitat', 'Drought', 'Plastic'],
      correct: 1,
      explanation: '"Habitat" = môi trường sống tự nhiên.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu bị động ĐÚNG:',
      options: [
        'Plastic bottles should recycle carefully.',
        'Plastic bottles should be recycled carefully.',
        'Plastic bottles should be recycle carefully.',
        'Plastic bottles are recycling carefully.',
      ],
      correct: 1,
      explanation: 'Bị động với động từ khuyết thiếu: "should be + V3" ("should be recycled").',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu điều kiện loại 1 ĐÚNG:',
      options: [
        'If we will save water, the river will stay clean.',
        'If we save water, the river will stay clean.',
        'If we saved water, the river will stay clean.',
        'If we saving water, the river will stay clean.',
      ],
      correct: 1,
      explanation: 'Cấu trúc loại 1: "If + Hiện tại Đơn (save), will + V (will stay)".',
    },
    {
      skill: 'vocab',
      question: 'Tình trạng thiếu mưa kéo dài gây khô hạn đồng ruộng gọi là:',
      options: ['Flood', 'Drought', 'Conservation', 'Solar'],
      correct: 1,
      explanation: '"Drought" = hạn hán; trái với "flood" = lũ lụt.',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn khuyên bạn mình giảm rác nhựa khi đi chợ. Câu tự nhiên nhất là:',
      options: [
        'Bring a reusable bag when you go shopping.',
        'Buy more fossil fuel at the market.',
        'Increase deforestation in the park.',
        'Produce more emissions today.',
      ],
      correct: 0,
      explanation: '"Bring a reusable bag" = mang theo túi tái sử dụng.',
    },
    {
      skill: 'vocab',
      question: '"Sustainable" có nghĩa gần nhất với:',
      options: ['Dùng một lần rồi bỏ', 'Bền vững, thân thiện lâu dài', 'Gây ô nhiễm nặng', 'Sắp tuyệt chủng'],
      correct: 1,
      explanation: '"Sustainable" = bền vững.',
    },
    {
      skill: 'listening',
      audioText: 'Solar panels on the roof help reduce carbon emissions.',
      question: 'Nghe và chọn lợi ích của tấm pin mặt trời trên mái:',
      options: ['Giúp giảm khí thải cacbon', 'Giúp tăng lượng nhựa tái chế', 'Giúp ngăn mưa lớn', 'Giúp trồng thêm hoa'],
      correct: 0,
      explanation: '"reduce carbon emissions" = giảm khí thải cacbon.',
    },
    {
      skill: 'listening',
      audioText: 'Endangered sea turtles must be protected by strict laws.',
      question: 'Nghe và chọn đối tượng cần được bảo vệ bằng luật nghiêm ngặt:',
      options: ['Rùa biển có nguy cơ tuyệt chủng', 'Xe buýt công cộng', 'Tấm pin mặt trời', 'Cánh đồng lúa'],
      correct: 0,
      explanation: '"Endangered sea turtles" = rùa biển nguy cấp.',
    },
  ],
};

export default ENVIRONMENT_LESSON;
