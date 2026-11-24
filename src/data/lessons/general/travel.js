// Track: general — Unit int-u6 · Du lịch & Phương tiện (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const TRAVEL_LESSON = {
  id: 'travel',
  contentVersion: 2,
  track: 'general',
  level: 'intermediate',
  cefrLevel: 'A2',
  unit: 'int-u6',
  title: 'Du lịch & Phương tiện',
  description: 'Lên kế hoạch du lịch, chọn phương tiện di chuyển và kể lại chuyến đi đáng nhớ',
  icon: '✈️',
  objectives: [
    'Gọi tên 20 từ vựng về phương tiện, địa điểm tham quan, hành lý và dịch vụ du lịch',
    'Dùng đúng giới từ phương tiện (by train/bus, on foot) và cụm từ du lịch (on vacation, go sightseeing)',
    'Kể lại kỷ niệm chuyến đi bằng thì Quá khứ Đơn với động từ có quy tắc và bất quy tắc',
  ],

  vocabulary: [
    v('Airport', '/ˈerpɔːrt/', 'noun', 'Sân bay', 'We reached the airport two hours early.', 'Chúng mình đến sân bay sớm hai tiếng.', '✈️'),
    v('Hotel', '/hoʊˈtel/', 'noun', 'Khách sạn', 'Our hotel was right near the coast.', 'Khách sạn của chúng mình ở ngay gần bờ biển.', '🏨'),
    v('Train', '/treɪn/', 'noun', 'Tàu hoả', 'Traveling by train lets you enjoy views.', 'Đi bằng tàu hoả giúp bạn ngắm phong cảnh.', '🚂'),
    v('Bus', '/bʌs/', 'noun', 'Xe buýt', 'A local bus stops outside the hotel.', 'Một chuyến xe buýt địa phương dừng ngay trước khách sạn.', '🚌'),
    v('Ticket', '/ˈtɪkɪt/', 'noun', 'Vé (tàu, xe, vào cổng)', 'We booked our train tickets online.', 'Chúng mình đã đặt vé tàu trực tuyến.', '🎫'),
    v('Map', '/mæp/', 'noun', 'Bản đồ', 'The hotel gave us a free city map.', 'Khách sạn tặng chúng mình một bản đồ thành phố miễn phí.', '🗺️'),
    v('Passport', '/ˈpæspɔːrt/', 'noun', 'Hộ chiếu', 'Keep your passport in a safe pocket.', 'Cất hộ chiếu vào túi an toàn nhé.', '🛂'),
    v('Luggage', '/ˈlʌɡɪdʒ/', 'noun', 'Hành lý', 'Pack light luggage for a short trip.', 'Gói hành lý gọn nhẹ cho chuyến đi ngắn nhé.', '🧳'),
    v('Direction', '/dəˈrekʃən/', 'noun', 'Hướng đi, chỉ đường', 'Friendly locals gave us clear directions.', 'Người dân thân thiện đã chỉ đường rất rõ cho tụi mình.', '🧭'),
    v('Restaurant', '/ˈrestərɑːnt/', 'noun', 'Nhà hàng', 'We tried a seafood restaurant by the sea.', 'Chúng mình đã thử một nhà hàng hải sản bên biển.', '🍽️'),
    v('Beach', '/biːtʃ/', 'noun', 'Bãi biển', 'Children built sandcastles on the beach.', 'Trẻ em xây lâu đài cát trên bãi biển.', '🏖️'),
    v('Tourist', '/ˈtʊrɪst/', 'noun', 'Khách du lịch', 'Hoi An welcomes many tourists each year.', 'Hội An đón rất nhiều khách du lịch mỗi năm.', '🧳'),
    v('Souvenir', '/ˌsuːvəˈnɪr/', 'noun', 'Quà lưu niệm', 'Lan bought a lantern souvenir for Mai.', 'Lan đã mua một chiếc đèn lồng lưu niệm tặng Mai.', '🎁'),
    v('Currency', '/ˈkɜːrənsi/', 'noun', 'Tiền tệ', 'Travelers exchange currency at the airport.', 'Du khách đổi tiền tệ tại sân bay.', '💱'),
    v('Sightseeing', '/ˈsaɪtˌsiːɪŋ/', 'noun', 'Hoạt động tham quan ngắm cảnh', 'We spent the whole afternoon sightseeing.', 'Chúng mình dành cả buổi chiều đi tham quan ngắm cảnh.', '📸'),
    v('Vacation', '/veɪˈkeɪʃən/', 'noun', 'Kỳ nghỉ', 'Our family goes on vacation every July.', 'Gia đình mình đi nghỉ mát mỗi tháng Bảy.', '🌴'),
    v('Guide', '/ɡaɪd/', 'noun', 'Hướng dẫn viên', 'Our tour guide told fascinating local stories.', 'Hướng dẫn viên của tụi mình kể nhiều câu chuyện địa phương rất hay.', '🗣️'),
    v('Landmark', '/ˈlændmɑːrk/', 'noun', 'Địa danh nổi tiếng', 'Dragon Bridge is a famous Da Nang landmark.', 'Cầu Rồng là một địa danh nổi tiếng của Đà Nẵng.', '🌉'),
    v('Destination', '/ˌdestɪˈneɪʃən/', 'noun', 'Điểm đến', 'Da Nang is a popular coastal destination.', 'Đà Nẵng là một điểm đến ven biển được yêu thích.', '📍'),
    v('Departure', '/dɪˈpɑːrtʃər/', 'noun', 'Giờ khởi hành', 'Check the departure time before packing.', 'Kiểm tra giờ khởi hành trước khi xếp đồ nhé.', '🛫'),
  ],

  grammar: [
    {
      title: 'Cụm từ cố định về du lịch & phương tiện (by train, on vacation, go sightseeing)',
      explanation: 'Dùng "by + phương tiện" (KHÔNG có a/the: by train, by bus, by plane), nhưng đi bộ dùng "on foot". Cụm đi nghỉ: "be on vacation / go on vacation". Tham quan: "go sightseeing" (KHÔNG có "to").',
      examples: [
        { en: 'We traveled to Da Nang by train.', vi: 'Chúng mình đi Đà Nẵng bằng tàu hoả.' },
        { en: 'My family is on vacation this week.', vi: 'Tuần này gia đình mình đang đi nghỉ.' },
        { en: 'Tourists love to go sightseeing in the old town.', vi: 'Du khách thích đi tham quan trong phố cổ.' },
        { en: 'We explored the night market on foot.', vi: 'Chúng mình khám phá chợ đêm bằng cách đi bộ.' },
      ],
      mistakes: [
        { wrong: 'We went to sightseeing yesterday.', right: 'We went sightseeing yesterday.', note: 'Cấu trúc "go + V-ing" (go sightseeing, go swimming) không thêm "to" ở giữa.' },
        { wrong: 'I go to school by foot.', right: 'I go to school on foot.', note: 'Đi bộ luôn dùng "on foot", không dùng "by foot".' },
      ],
    },
    {
      title: 'Kể lại chuyến đi bằng thì Quá khứ Đơn (Past Simple)',
      explanation: 'Khi kể một chuyến đi đã kết thúc (last summer, last month), dùng động từ quá khứ: thêm "-ed" (visited, stayed, booked) hoặc dùng dạng bất quy tắc (go → went, buy → bought, take → took, see → saw). Câu hỏi dùng "Did + S + V nguyên mẫu?".',
      examples: [
        { en: 'Last summer, we visited Hoi An and Da Nang.', vi: 'Mùa hè năm ngoái, chúng mình đã thăm Hội An và Đà Nẵng.' },
        { en: 'Lan bought a handmade souvenir for her sister.', vi: 'Lan đã mua một món quà lưu niệm thủ công cho em gái.' },
        { en: 'We took a local bus to the sandy beach.', vi: 'Chúng mình đi xe buýt địa phương ra bãi biển cát trắng.' },
        { en: 'Did you enjoy your summer vacation?', vi: 'Bạn có thích kỳ nghỉ hè của mình không?' },
      ],
      mistakes: [
        { wrong: 'Did you went to the beach?', right: 'Did you go to the beach?', note: 'Sau trợ động từ "Did", động từ chính trở về nguyên mẫu: "go".' },
        { wrong: 'I buyed a ticket yesterday.', right: 'I bought a ticket yesterday.', note: '"Buy" là động từ bất quy tắc, quá khứ là "bought".' },
      ],
    },
  ],

  reading: {
    title: 'Kỳ nghỉ hè ở Đà Nẵng và Hội An',
    passage: [
      'Minh: How was your summer vacation, Lan? Which destination did you choose?',
      'Lan: We visited Da Nang and Hoi An! We booked our tickets early and traveled there by train so we could watch the sea.',
      'Minh: Sounds relaxing! Where did you stay?',
      'Lan: At a cozy hotel near the beach. After checking our luggage in, we took a bus with a friendly tour guide.',
      'Minh: What did you see?',
      'Lan: We went sightseeing at every famous landmark, used a city map to find a great seafood restaurant, and bought a colorful lantern souvenir before our departure!',
    ].join('\n'),
    translation: [
      'Minh: Kỳ nghỉ hè của bạn thế nào, Lan? Bạn đã chọn điểm đến nào vậy?',
      'Lan: Gia đình mình đi Đà Nẵng và Hội An! Tụi mình đặt vé sớm và đi bằng tàu hoả để có thể ngắm biển.',
      'Minh: Nghe thư giãn quá! Gia đình bạn ở đâu thế?',
      'Lan: Ở một khách sạn ấm cúng gần bãi biển. Sau khi gửi hành lý, tụi mình đi xe buýt cùng một hướng dẫn viên thân thiện.',
      'Minh: Bạn đã đi xem những gì?',
      'Lan: Tụi mình đi tham quan mọi địa danh nổi tiếng, dùng bản đồ thành phố tìm một nhà hàng hải sản ngon, và mua chiếc đèn lồng lưu niệm nhiều màu trước giờ khởi hành!',
    ].join('\n'),
    highlights: ['Vacation', 'Destination', 'Ticket', 'Train', 'Hotel', 'Beach', 'Luggage', 'Bus', 'Guide', 'Sightseeing', 'Landmark', 'Map', 'Restaurant', 'Souvenir', 'Departure'],
    questions: [
      {
        question: 'Vì sao gia đình Lan chọn đi Đà Nẵng bằng tàu hoả?',
        options: ['Vì vé máy bay đã hết', 'Để có thể ngắm biển trên đường đi', 'Vì bố Lan lái tàu', 'Vì khách sạn nằm trong nhà ga'],
        correct: 1,
        explanation: 'Lan giải thích: "traveled there by train so we could watch the sea."',
      },
      {
        question: 'Khách sạn của gia đình Lan nằm ở đâu?',
        options: ['Gần sân bay', 'Gần bãi biển', 'Trên đỉnh núi', 'Ở ngoại ô'],
        correct: 1,
        explanation: 'Lan nói: "At a cozy hotel near the beach."',
      },
      {
        question: 'Gia đình Lan dùng gì để tìm nhà hàng hải sản ngon?',
        options: ['Hộ chiếu', 'Bản đồ thành phố', 'Vé tàu hoả', 'Đèn lồng'],
        correct: 1,
        explanation: 'Lan kể: "used a city map to find a great seafood restaurant".',
      },
      {
        question: 'Lan đã mua món quà lưu niệm nào trước khi khởi hành về?',
        options: ['Một chiếc mũ cói', 'Một chiếc đèn lồng nhiều màu', 'Một tấm bưu thiếp', 'Một bức tranh cát'],
        correct: 1,
        explanation: 'Lan nói: "and bought a colorful lantern souvenir before our departure!"',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Souvenir" nghĩa là gì?',
      options: ['Hành lý ký gửi', 'Quà lưu niệm', 'Hướng dẫn viên', 'Giờ khởi hành'],
      correct: 1,
      explanation: '"Souvenir" = món quà lưu niệm mua khi đi du lịch.',
    },
    {
      skill: 'vocab',
      question: 'Một công trình hoặc cảnh đẹp nổi tiếng đặc trưng của thành phố gọi là:',
      options: ['Landmark', 'Currency', 'Ticket', 'Luggage'],
      correct: 0,
      explanation: '"Landmark" = địa danh, công trình tiêu biểu (như Cầu Rồng, Tháp Eiffel).',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng:',
      options: [
        'We went to sightseeing in Hoi An.',
        'We went sightseeing in Hoi An.',
        'We go to sightseeing yesterday.',
        'We went sightsee in Hoi An.',
      ],
      correct: 1,
      explanation: 'Cụm từ đúng là "go / went sightseeing" (không dùng "to").',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "We traveled ___ train, then explored the old street ___ foot."',
      options: ['on / by', 'by / on', 'in / by', 'by / by'],
      correct: 1,
      explanation: 'Dùng "by train" (phương tiện) và "on foot" (đi bộ).',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu hỏi Quá khứ Đơn ĐÚNG:',
      options: [
        'Did you went to Da Nang last summer?',
        'Did you go to Da Nang last summer?',
        'Do you went to Da Nang last summer?',
        'Were you go to Da Nang last summer?',
      ],
      correct: 1,
      explanation: 'Sau "Did", động từ chính ở dạng nguyên mẫu "go".',
    },
    {
      skill: 'grammar',
      question: 'Điền dạng quá khứ đúng của "buy": "Lan ___ a lantern souvenir for Mai."',
      options: ['buyed', 'bought', 'buys', 'buying'],
      correct: 1,
      explanation: '"Buy" là động từ bất quy tắc, quá khứ đơn là "bought".',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn nói tuần sau gia đình bạn đang trong kỳ nghỉ. Câu tự nhiên nhất là:',
      options: [
        'My family will be on vacation next week.',
        'My family is by vacation next week.',
        'My family does sightseeing vacation.',
        'My family buys departure next week.',
      ],
      correct: 0,
      explanation: 'Cụm từ cố định là "be on vacation" (đang trong kỳ nghỉ).',
    },
    {
      skill: 'listening',
      audioText: 'Our tour guide showed us three famous landmarks.',
      question: 'Nghe và chọn ai là người dẫn đoàn đi xem 3 địa danh nổi tiếng:',
      options: ['Tài xế xe buýt', 'Hướng dẫn viên du lịch', 'Nhân viên khách sạn', 'Người bán hàng lưu niệm'],
      correct: 1,
      explanation: '"tour guide" = hướng dẫn viên du lịch.',
    },
    {
      skill: 'listening',
      audioText: 'We stayed at a quiet hotel near the beach.',
      question: 'Nghe và chọn nơi họ đã ở lại:',
      options: ['Khách sạn yên tĩnh gần bãi biển', 'Nhà ga tàu hoả', 'Nhà hàng trung tâm', 'Sân bay quốc tế'],
      correct: 0,
      explanation: '"a quiet hotel near the beach" = một khách sạn yên tĩnh gần bãi biển.',
    },
  ],
};

export default TRAVEL_LESSON;
