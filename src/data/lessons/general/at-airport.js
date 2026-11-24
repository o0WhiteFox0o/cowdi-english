// Track: general — Unit int-u6 · Ở sân bay & du lịch (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const AIRPORT_LESSON = {
  id: 'at-airport',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u6',
  title: 'Ở sân bay & du lịch',
  description: 'Làm thủ tục check-in, xuất trình hộ chiếu, tìm cửa lên máy bay và xử lý khi chuyến bay trễ',
  icon: '✈️',
  objectives: [
    'Hiểu và dùng đúng từ vựng thủ tục sân bay (passport, boarding pass, check-in, carry-on, gate, customs)',
    'Trả lời nhanh các câu hỏi quen thuộc tại quầy check-in và chọn chỗ ngồi mong muốn',
    'Hỏi thông tin cửa bay và đề nghị hỗ trợ khi chuyến bay bị hoãn hoặc thất lạc hành lý',
  ],

  vocabulary: [
    v('Airport', '/ˈerpɔːrt/', 'noun', 'Sân bay', 'We arrived at the airport early.', 'Chúng mình đến sân bay sớm.', '🛫'),
    v('Flight', '/flaɪt/', 'noun', 'Chuyến bay', 'Our flight leaves at nine AM.', 'Chuyến bay của chúng mình cất cánh lúc chín giờ sáng.', '✈️'),
    v('Boarding pass', '/ˈbɔːrdɪŋ pæs/', 'noun', 'Thẻ lên máy bay', 'Keep your boarding pass ready at the gate.', 'Giữ sẵn thẻ lên máy bay ở cửa ra máy bay nhé.', '🎫'),
    v('Passport', '/ˈpæspɔːrt/', 'noun', 'Hộ chiếu', 'Please show your passport at check-in.', 'Vui lòng xuất trình hộ chiếu khi làm thủ tục.', '📘'),
    v('Visa', '/ˈviːzə/', 'noun', 'Thị thực nhập cảnh', 'Check whether you need a tourist visa.', 'Hãy kiểm tra xem bạn có cần thị thực du lịch không.', '🪪'),
    v('Check-in', '/ˈtʃek ɪn/', 'noun', 'Quầy / thủ tục làm vé', 'The check-in counter opens two hours early.', 'Quầy làm thủ tục mở cửa sớm hai tiếng.', '🧳'),
    v('Luggage', '/ˈlʌɡɪdʒ/', 'noun', 'Hành lý (không đếm được)', 'Place your luggage on the scale.', 'Đặt hành lý của bạn lên cân nhé.', '🧳'),
    v('Carry-on', '/ˈkæri ɑːn/', 'noun', 'Hành lý xách tay', 'I only brought one small carry-on bag.', 'Mình chỉ mang theo một túi xách tay nhỏ.', '🎒'),
    v('Gate', '/ɡeɪt/', 'noun', 'Cửa lên máy bay', 'Boarding begins soon at gate twelve.', 'Việc lên máy bay sắp bắt đầu ở cửa số mười hai.', '🚪'),
    v('Terminal', '/ˈtɜːrmɪnəl/', 'noun', 'Nhà ga sân bay', 'International flights depart from Terminal Two.', 'Các chuyến bay quốc tế khởi hành từ Nhà ga số 2.', '🏛️'),
    v('Departure', '/dɪˈpɑːrtʃər/', 'noun', 'Sự khởi hành', 'Check the departure board for updates.', 'Hãy xem bảng khởi hành để cập nhật thông tin.', '🛫'),
    v('Arrival', '/əˈraɪvəl/', 'noun', 'Sự đến nơi', 'Our arrival in Hanoi is at noon.', 'Chúng mình sẽ đến Hà Nội vào buổi trưa.', '🛬'),
    v('Customs', '/ˈkʌstəmz/', 'noun', 'Hải quan', 'Walk through customs after collecting your bags.', 'Đi qua khu hải quan sau khi lấy hành lý.', '🛂'),
    v('Delay', '/dɪˈleɪ/', 'verb', 'Hoãn, làm trễ', 'Heavy rain may delay our flight.', 'Mưa lớn có thể làm trễ chuyến bay của chúng mình.', '⏳'),
    v('Cancel', '/ˈkænsəl/', 'verb', 'Huỷ bỏ', 'The airline had to cancel the late flight.', 'Hãng bay phải huỷ chuyến bay muộn.', '❌'),
  ],

  grammar: [
    {
      title: 'Hỏi thông tin tại quầy check-in và cửa lên máy bay',
      explanation: 'Dùng "Can I have a window / aisle seat?" để chọn ghế, "Where is gate…?" để tìm cửa, và "Is my flight on time?" để hỏi giờ bay. Lưu ý: "luggage" là danh từ KHÔNG đếm được (không thêm -s, không dùng "a luggage").',
      examples: [
        { en: 'Can I have a window seat, please?', vi: 'Cho mình xin ghế gần cửa sổ được không?' },
        { en: 'Excuse me, where is gate twelve?', vi: 'Cho hỏi cửa số 12 ở đâu ạ?' },
        { en: 'Is the flight to Hanoi on time?', vi: 'Chuyến bay đi Hà Nội có đúng giờ không?' },
        { en: 'How much luggage can I bring?', vi: 'Mình được mang bao nhiêu hành lý?' },
      ],
      mistakes: [
        { wrong: 'I have two luggages.', right: 'I have two pieces of luggage. / I have two bags.', note: '"Luggage" là danh từ không đếm được nên không bao giờ thêm "-s".' },
        { wrong: 'Where gate twelve is?', right: 'Where is gate twelve?', note: 'Câu hỏi trực tiếp phải đảo động từ "is" lên trước chủ ngữ.' },
      ],
    },
    {
      title: 'Báo sự cố chuyến bay bằng bị động ngắn: is delayed / was canceled',
      explanation: 'Khi chuyến bay bị hoãn hoặc huỷ, dùng tính từ/phân từ bị động: "My flight is delayed" (bị trễ), "The flight was canceled" (đã bị huỷ). Khi cần giúp, hỏi lịch sự bằng "Could you help me…?".',
      examples: [
        { en: 'Our flight is delayed by thirty minutes.', vi: 'Chuyến bay của chúng mình bị trễ ba mươi phút.' },
        { en: 'The evening flight was canceled due to storms.', vi: 'Chuyến bay buổi tối bị huỷ do bão.' },
        { en: 'Could you tell me when the next flight leaves?', vi: 'Bạn cho mình biết chuyến tiếp theo bay lúc nào được không?' },
        { en: 'I have nothing to declare at customs.', vi: 'Mình không có gì cần khai báo ở hải quan.' },
      ],
      mistakes: [
        { wrong: 'My flight is delay.', right: 'My flight is delayed.', note: 'Cần dùng dạng bị động / tính từ đuôi "-ed": "is delayed".' },
        { wrong: 'My flight cancel today.', right: 'My flight was canceled today.', note: 'Chuyến bay bị huỷ dùng thể bị động "was canceled".' },
      ],
    },
  ],

  reading: {
    title: 'Làm thủ tục bay ra Hà Nội',
    passage: [
      'Staff: Good morning! Welcome to Terminal One. May I see your passport, please?',
      'Minh: Here you go. My dad and I are taking the morning flight to Hanoi.',
      'Staff: Great! How many pieces of luggage are you checking in today?',
      'Minh: Just one suitcase, plus one small carry-on bag. Could I have a window seat, please?',
      'Staff: Sure! Here is your boarding pass. Please go to gate twelve before departure.',
      'Minh: Thank you! Is our flight on time, or is there a delay?',
      'Staff: It is delayed by twenty minutes, not canceled. Your arrival in Hanoi will be around noon!',
    ].join('\n'),
    translation: [
      'Nhân viên: Chào buổi sáng! Chào mừng đến Nhà ga số 1. Cho mình xem hộ chiếu của bạn nhé?',
      'Minh: Của chị đây ạ. Bố và em đi chuyến bay sáng ra Hà Nội.',
      'Nhân viên: Tuyệt! Hôm nay hai bố con ký gửi mấy kiện hành lý?',
      'Minh: Chỉ một vali, thêm một túi xách tay nhỏ thôi ạ. Cho em xin ghế cạnh cửa sổ được không ạ?',
      'Nhân viên: Được chứ! Đây là thẻ lên máy bay của em. Hãy ra cửa số 12 trước giờ khởi hành nhé.',
      'Minh: Em cảm ơn! Chuyến bay của tụi em có đúng giờ không hay bị hoãn ạ?',
      'Nhân viên: Chuyến bị trễ hai mươi phút thôi, không bị huỷ đâu. Giờ đến Hà Nội sẽ vào khoảng buổi trưa!',
    ].join('\n'),
    highlights: ['Terminal', 'Passport', 'Flight', 'Luggage', 'Gate', 'Departure', 'Delay', 'Cancel', 'Arrival'],
    questions: [
      {
        question: 'Minh và bố đang làm thủ tục để bay tới đâu?',
        options: ['Đà Nẵng', 'Cần Thơ', 'Hà Nội', 'Hội An'],
        correct: 2,
        explanation: 'Minh nói: "My dad and I are taking the morning flight to Hanoi."',
      },
      {
        question: 'Minh xin chọn loại chỗ ngồi nào trên máy bay?',
        options: ['Ghế gần lối đi', 'Ghế cạnh cửa sổ', 'Ghế hàng cuối', 'Ghế giữa'],
        correct: 1,
        explanation: 'Minh hỏi lịch sự: "Could I have a window seat, please?"',
      },
      {
        question: 'Minh cần đến cửa số mấy để lên máy bay?',
        options: ['Cửa số 1', 'Cửa số 2', 'Cửa số 12', 'Cửa số 20'],
        correct: 2,
        explanation: 'Nhân viên hướng dẫn: "Please go to gate twelve before departure."',
      },
      {
        question: 'Tình trạng chuyến bay của Minh như thế nào?',
        options: ['Đúng giờ hoàn toàn', 'Bị huỷ vì bão', 'Bị trễ hai mươi phút', 'Đổi sang ngày mai'],
        correct: 2,
        explanation: 'Nhân viên trả lời: "It is delayed by twenty minutes, not canceled."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Tấm thẻ ghi số ghế và cửa ra máy bay gọi là gì?',
      options: ['Passport', 'Boarding pass', 'Visa', 'Customs'],
      correct: 1,
      explanation: '"Boarding pass" = thẻ lên máy bay.',
    },
    {
      skill: 'vocab',
      question: 'Túi nhỏ bạn được mang trực tiếp lên khoang hành khách gọi là:',
      options: ['Carry-on', 'Departure', 'Terminal', 'Arrival'],
      correct: 0,
      explanation: '"Carry-on" = hành lý xách tay.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng khi nói chuyến bay bị hoãn 30 phút:',
      options: [
        'Our flight is delay by thirty minutes.',
        'Our flight is delayed by thirty minutes.',
        'Our flight delaying thirty minutes.',
        'Our flight are delayed thirty minutes.',
      ],
      correct: 1,
      explanation: 'Dùng dạng bị động/tính từ "-ed": "Our flight is delayed".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng với danh từ "luggage":',
      options: [
        'I brought two luggages.',
        'I brought a luggage.',
        'I brought two pieces of luggage.',
        'I brought many luggages.',
      ],
      correct: 2,
      explanation: '"Luggage" không đếm được nên dùng "pieces of luggage" (không thêm -s).',
    },
    {
      skill: 'vocab',
      question: 'Khu vực kiểm tra hành lý và hàng hoá khi nhập cảnh gọi là:',
      options: ['Check-in', 'Customs', 'Gate', 'Window seat'],
      correct: 1,
      explanation: '"Customs" = khu hải quan.',
    },
    {
      skill: 'usage',
      question: 'Bạn thích ngắm mây qua cửa sổ máy bay. Tại quầy check-in bạn hỏi:',
      options: [
        'Can I have a window seat, please?',
        'Can I cancel the flight, please?',
        'Where is the arrival luggage?',
        'Is this a tourist visa?',
      ],
      correct: 0,
      explanation: '"a window seat" = ghế cạnh cửa sổ (ngược với "aisle seat" = ghế cạnh lối đi).',
    },
    {
      skill: 'vocab',
      question: 'Từ trái nghĩa với "departure" (khởi hành) là:',
      options: ['terminal', 'arrival', 'delay', 'check-in'],
      correct: 1,
      explanation: '"Arrival" (đến nơi) đối lập với "departure" (khởi hành).',
    },
    {
      skill: 'listening',
      audioText: 'Passengers for Hanoi, please go to gate twelve.',
      question: 'Nghe và chọn cửa lên máy bay được thông báo:',
      options: ['Cửa số 2', 'Cửa số 10', 'Cửa số 12', 'Cửa số 20'],
      correct: 2,
      explanation: '"gate twelve" = cửa số 12.',
    },
    {
      skill: 'listening',
      audioText: 'The evening flight was canceled because of heavy rain.',
      question: 'Nghe và chọn tình trạng chuyến bay buổi tối:',
      options: ['Bay sớm hơn dự kiến', 'Bị huỷ vì mưa lớn', 'Đổi sang nhà ga số 2', 'Đã hạ cánh an toàn'],
      correct: 1,
      explanation: '"was canceled because of heavy rain" = bị huỷ do mưa lớn.',
    },
  ],
};

export default AIRPORT_LESSON;
