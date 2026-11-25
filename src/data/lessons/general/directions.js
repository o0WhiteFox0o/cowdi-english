// Track: general — Unit int-u5 · Hỏi đường & chỉ đường (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const DIRECTIONS_LESSON = {
  id: 'directions',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u5',
  title: 'Hỏi đường & chỉ đường',
  description: 'Hỏi đường lịch sự, hiểu chỉ dẫn đi thẳng – rẽ trái – băng qua và xác định vị trí địa điểm',
  icon: '🗺️',
  objectives: [
    'Hỏi đường và hỏi khoảng cách lịch sự bằng Excuse me…, How far is it?, Could you tell me…?',
    'Hiểu và đưa ra chỉ dẫn từng bước bằng câu mệnh lệnh (Go straight, Turn left/right, Cross)',
    'Xác định vị trí đích bằng các mốc quen thuộc (corner, traffic lights, crossroads, roundabout, opposite)',
  ],

  vocabulary: [
    v('Excuse me', '/ɪkˈskjuːz miː/', 'phrase', 'Cho mình hỏi (mở lời lịch sự)', 'Excuse me, where is the post office?', 'Cho mình hỏi, bưu điện ở đâu ạ?', '🙋'),
    v('Go straight', '/ɡoʊ streɪt/', 'phrase', 'Đi thẳng', 'Go straight for two blocks.', 'Đi thẳng qua hai dãy nhà.', '⬆️'),
    v('Turn left', '/tɜːrn left/', 'phrase', 'Rẽ trái', 'Turn left at the next corner.', 'Rẽ trái ở góc đường kế tiếp.', '⬅️'),
    v('Turn right', '/tɜːrn raɪt/', 'phrase', 'Rẽ phải', 'Turn right at the traffic lights.', 'Rẽ phải ở chỗ đèn giao thông.', '➡️'),
    v('Cross', '/krɔːs/', 'verb', 'Băng qua (đường, cầu)', 'Cross the street at the crosswalk.', 'Băng qua đường ở vạch sang đường.', '🚶'),
    v('Corner', '/ˈkɔːrnər/', 'noun', 'Góc đường', 'The bakery is on the corner.', 'Tiệm bánh nằm ngay góc đường.', '📐'),
    v('Traffic lights', '/ˈtræfɪk laɪts/', 'noun', 'Đèn giao thông', 'Stop when the traffic lights turn red.', 'Dừng lại khi đèn giao thông chuyển đỏ.', '🚦'),
    v('Crossroads', '/ˈkrɔːsroʊdz/', 'noun', 'Ngã tư', 'Go straight past the crossroads.', 'Đi thẳng qua ngã tư.', '✚'),
    v('Roundabout', '/ˈraʊndəbaʊt/', 'noun', 'Vòng xuyến, bùng binh', 'Take the first exit at the roundabout.', 'Đi lối ra đầu tiên ở vòng xuyến.', '⭕'),
    v('Block', '/blɑːk/', 'noun', 'Dãy nhà, ô phố', 'Walk one block and look right.', 'Đi bộ một dãy nhà rồi nhìn sang phải.', '🏘️'),
    v('Map', '/mæp/', 'noun', 'Bản đồ', 'Let me check the city map.', 'Để mình xem bản đồ thành phố.', '🗺️'),
    v('Far', '/fɑːr/', 'adjective', 'Xa', 'Is the museum far from here?', 'Bảo tàng có xa đây không?', '📏'),
    v('Next to', '/nekst tuː/', 'phrase', 'Bên cạnh', 'The pharmacy is next to the bank.', 'Hiệu thuốc ở ngay bên cạnh ngân hàng.', '👉'),
    v('Opposite', '/ˈɑːpəzɪt/', 'preposition', 'Đối diện', 'The bus stop is opposite the market.', 'Trạm xe buýt đối diện khu chợ.', '↔️'),
    v('Get lost', '/ɡet lɔːst/', 'phrase', 'Bị lạc đường', 'Carry a map so you do not get lost.', 'Mang theo bản đồ để bạn không bị lạc đường.', '🤷'),
  ],

  grammar: [
    {
      title: 'Cách hỏi đường và khoảng cách lịch sự',
      explanation: 'Mở đầu bằng "Excuse me", sau đó dùng "Where is…?", "Is there a … near here?" hoặc câu hỏi gián tiếp "Could you tell me how to get to…?" / "Could you tell me where the bank is?" (chú ý không đảo "is" lên trước danh từ ở vế sau!). Hỏi khoảng cách dùng "How far is it?".',
      examples: [
        { en: 'Excuse me, where is the central post office?', vi: 'Cho mình hỏi, bưu điện trung tâm ở đâu?' },
        { en: 'Could you tell me how to get to the park?', vi: 'Bạn chỉ giúp mình đường đến công viên được không?' },
        { en: 'Is there a bookstore near here?', vi: 'Gần đây có hiệu sách nào không?' },
        { en: 'How far is it from here on foot?', vi: 'Đi bộ từ đây tới đó bao xa?' },
      ],
      mistakes: [
        { wrong: 'Could you tell me where is the bank?', right: 'Could you tell me where the bank is?', note: 'Trong câu hỏi lịch sự mở đầu bằng "Could you tell me…", vế sau giữ trật tự câu trần thuật: "where the bank is".' },
        { wrong: 'How long is it from here to the market?', right: 'How far is it from here to the market?', note: 'Hỏi khoảng cách địa lý dùng "How far", còn "How long" dùng để hỏi thời lượng.' },
      ],
    },
    {
      title: 'Câu mệnh lệnh chỉ đường từng bước & mô tả vị trí đích',
      explanation: 'Dùng động từ nguyên mẫu ở đầu câu (Go straight, Turn left, Cross the street, Walk two blocks) và nối bằng "then", "after that". Kết thúc bằng vị trí đích: "It\'s on your left / right", "next to…", "opposite…".',
      examples: [
        { en: 'Go straight for two blocks, then turn left.', vi: 'Đi thẳng qua hai dãy nhà, rồi rẽ trái.' },
        { en: 'Cross the street at the traffic lights.', vi: 'Băng qua đường ở chỗ đèn giao thông.' },
        { en: 'Turn right at the crossroads.', vi: 'Rẽ phải ở ngã tư.' },
        { en: "It's on the corner, opposite the park.", vi: 'Nó nằm ngay góc đường, đối diện công viên.' },
      ],
      mistakes: [
        { wrong: 'Go straightly for two blocks.', right: 'Go straight for two blocks.', note: '"Straight" vừa là tính từ vừa là trạng từ, không thêm "-ly".' },
        { wrong: 'It is in your left.', right: 'It is on your left.', note: 'Chỉ phía bên trái/phải luôn dùng giới từ "on": "on your left / on your right".' },
      ],
    },
  ],

  reading: {
    title: 'Chỉ đường đến bưu điện thành phố',
    passage: [
      'Alex: Excuse me! I think I got lost even with my map. Could you tell me how to get to the post office?',
      'Minh: Do not worry! It is not far from here—about five minutes on foot.',
      'Alex: Great! Which way should I go?',
      'Minh: Go straight for one block until you reach the traffic lights at the crossroads.',
      'Alex: Okay, go straight to the traffic lights. Then what?',
      'Minh: Turn left and cross the street near the roundabout. Walk to the next corner.',
      'Alex: Will I see it easily?',
      'Minh: Yes! Turn right there. The post office is on your left, next to a bookstore and opposite the park.',
    ].join('\n'),
    translation: [
      'Alex: Cho mình hỏi! Hình như mình bị lạc dù có cầm bản đồ rồi. Bạn chỉ giúp mình đường đến bưu điện được không?',
      'Minh: Đừng lo! Nó không xa đây đâu—đi bộ khoảng năm phút thôi.',
      'Alex: Tuyệt quá! Mình nên đi hướng nào?',
      'Minh: Bạn đi thẳng qua một dãy nhà cho đến khi gặp đèn giao thông ở ngã tư.',
      'Alex: Rồi, đi thẳng tới đèn giao thông. Sau đó đi đâu nữa?',
      'Minh: Rẽ trái rồi băng qua đường gần vòng xuyến. Đi tiếp tới góc đường kế tiếp.',
      'Alex: Mình có dễ thấy nó không?',
      'Minh: Có chứ! Rẽ phải ở đó. Bưu điện nằm bên trái bạn, cạnh một hiệu sách và đối diện công viên.',
    ].join('\n'),
    highlights: ['Map', 'Far', 'Block', 'Crossroads', 'Cross', 'Roundabout', 'Corner', 'Opposite'],
    questions: [
      {
        question: 'Alex đang tìm đường đến địa điểm nào?',
        options: ['Hiệu sách', 'Bưu điện', 'Công viên', 'Trạm xe buýt'],
        correct: 1,
        explanation: 'Alex hỏi: "Could you tell me how to get to the post office?"',
      },
      {
        question: 'Đi bộ từ chỗ đứng hiện tại tới bưu điện mất khoảng bao lâu?',
        options: ['Khoảng nửa tiếng', 'Khoảng hai mươi phút', 'Khoảng năm phút', 'Phải đi xe buýt'],
        correct: 2,
        explanation: 'Minh nói: "It is not far from here—about five minutes on foot."',
      },
      {
        question: 'Khi đến đèn giao thông ở ngã tư, Alex cần làm gì tiếp theo?',
        options: ['Quay ngược lại con đường cũ', 'Rẽ phải ngay ở góc phố đầu', 'Đứng chờ xe buýt bên lề đường', 'Rẽ trái và qua đường gần vòng xuyến'],
        correct: 3,
        explanation: 'Minh hướng dẫn: "Turn left and cross the street near the roundabout."',
      },
      {
        question: 'Bưu điện nằm ở vị trí nào so với hiệu sách và công viên?',
        options: [
          'Cạnh hiệu sách và đối diện công viên',
          'Đối diện hiệu sách và bên trong công viên',
          'Phía sau công viên',
          'Giữa vòng xuyến và ngã tư',
        ],
        correct: 0,
        explanation: 'Minh mô tả: "The post office is on your left, next to a bookstore and opposite the park."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Roundabout" là đặc điểm giao thông nào?',
      options: ['Ngã tư lớn', 'Vòng xuyến', 'Đèn giao thông', 'Góc ngã rẽ'],
      correct: 1,
      explanation: '"Roundabout" = vòng xuyến, bùng binh.',
    },
    {
      skill: 'vocab',
      question: 'Cụm từ nào nghĩa là "bị lạc đường"?',
      options: ['get straight', 'turn cross', 'get lost', 'go far'],
      correct: 2,
      explanation: '"Get lost" = bị lạc đường (quá khứ: got lost).',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu hỏi đường lịch sự ĐÚNG ngữ pháp:',
      options: [
        'Could you tell me where is the library?',
        'Could you tell me is where the library?',
        'Could you tell me where does the library?',
        'Could you tell me where the library is?',
      ],
      correct: 3,
      explanation: 'Sau "Could you tell me where…", giữ trật tự chủ ngữ + động từ: "where the library is".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu chỉ đường ĐÚNG:',
      options: [
        'Go straight for two blocks.',
        'Go straightly for two blocks.',
        'Going straight for two blocks.',
        'Turn straight for two blocks.',
      ],
      correct: 0,
      explanation: '"Go straight" (không có -ly) là câu mệnh lệnh chuẩn để chỉ đi thẳng.',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "The bakery is ___ your right, ___ the corner."',
      options: ['in / in', 'on / on', 'at / in', 'to / on'],
      correct: 1,
      explanation: 'Dùng "on your right" (ở bên phải bạn) và "on the corner" (ở góc đường).',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn hỏi xem nhà ga có cách đây bao xa. Câu hỏi đúng là:',
      options: [
        'How much is the station?',
        'How many is the station?',
        'How far is the station from here?',
        'How often is the station?',
      ],
      correct: 2,
      explanation: '"How far is … from here?" dùng để hỏi khoảng cách.',
    },
    {
      skill: 'vocab',
      question: '"Cross the street" nghĩa là gì?',
      options: ['Đi dọc theo con phố', 'Dừng lại trước đèn đỏ', 'Rẽ phải ở cuối phố', 'Băng qua đường'],
      correct: 3,
      explanation: '"Cross" (động từ) = băng qua, sang đường.',
    },
    {
      skill: 'listening',
      audioText: 'Turn right at the traffic lights and walk one block.',
      question: 'Nghe và chọn chỉ dẫn đúng:',
      options: [
        'Rẽ phải ở đèn giao thông rồi đi bộ một dãy nhà.',
        'Rẽ trái ở vòng xuyến rồi đi hai dãy nhà.',
        'Đi thẳng qua ngã tư rồi dừng lại.',
        'Băng qua đường ngay cạnh công viên.',
      ],
      correct: 0,
      explanation: '"Turn right at the traffic lights" = rẽ phải ở đèn giao thông; "walk one block" = đi bộ một dãy nhà.',
    },
    {
      skill: 'listening',
      audioText: 'The museum is opposite the central park.',
      question: 'Nghe và chọn vị trí của bảo tàng:',
      options: ['Bên trong công viên', 'Đối diện công viên trung tâm', 'Phía sau bưu điện', 'Bên cạnh hiệu thuốc'],
      correct: 1,
      explanation: '"opposite the central park" = đối diện công viên trung tâm.',
    },
  ],
};

export default DIRECTIONS_LESSON;
