// Track: general — Unit int-u10 · Khoa học & Phát minh (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const SCIENCE_LESSON = {
  id: 'science',
  contentVersion: 2,
  track: 'general',
  level: 'advanced',
  cefrLevel: 'B1',
  unit: 'int-u10',
  title: 'Khoa học & Phát minh',
  description: 'Khám phá thí nghiệm khoa học, phát minh, dữ liệu và công nghệ bằng câu điều kiện loại 2',
  icon: '🔬',
  objectives: [
    'Sử dụng chính xác 20 từ vựng về nghiên cứu, phòng thí nghiệm, vũ trụ và đổi mới sáng tạo',
    'Dùng Hiện tại Hoàn thành Tiếp diễn (have/has been + V-ing) để nhấn mạnh quá trình nghiên cứu đang diễn ra',
    'Đặt câu điều kiện loại 2 (If + Quá khứ Đơn / were, would + V) cho các giả định khoa học',
  ],

  vocabulary: [
    v('Science', '/ˈsaɪəns/', 'noun', 'Khoa học', 'Science encourages curiosity and careful testing.', 'Khoa học khuyến khích sự tò mò và kiểm chứng cẩn thận.', '🔬'),
    v('Experiment', '/ɪkˈsperəmənt/', 'noun', 'Thí nghiệm', 'Our class designed a safe water-filter experiment.', 'Lớp chúng mình thiết kế một thí nghiệm lọc nước an toàn.', '🧪'),
    v('Research', '/ˈriːsɜːrtʃ/', 'noun', 'Nghiên cứu (không đếm được)', 'Clean-energy research helps communities worldwide.', 'Nghiên cứu năng lượng sạch giúp ích cho cộng đồng toàn cầu.', '📊'),
    v('Discovery', '/dɪˈskʌvəri/', 'noun', 'Sự phát hiện (thứ có sẵn)', 'Every major discovery starts with a simple question.', 'Mỗi phát hiện lớn đều bắt đầu từ một câu hỏi đơn giản.', '💡'),
    v('Invention', '/ɪnˈvenʃən/', 'noun', 'Phát minh (tạo ra cái mới)', 'The printing press was a life-changing invention.', 'Máy in là một phát minh làm thay đổi cuộc sống.', '⚙️'),
    v('Scientist', '/ˈsaɪəntɪst/', 'noun', 'Nhà khoa học', 'A careful scientist records every measurement.', 'Một nhà khoa học cẩn thận luôn ghi chép mọi số đo.', '👩‍🔬'),
    v('Theory', '/ˈθɪri/', 'noun', 'Lý thuyết, học thuyết', 'Evidence helps confirm or revise a theory.', 'Bằng chứng giúp xác nhận hoặc điều chỉnh một lý thuyết.', '📐'),
    v('Laboratory', '/ˈlæbrətɔːri/', 'noun', 'Phòng thí nghiệm', 'Wear safety glasses inside the science laboratory.', 'Hãy đeo kính bảo hộ bên trong phòng thí nghiệm khoa học.', '🔬'),
    v('Data', '/ˈdeɪtə/', 'noun', 'Dữ liệu', 'We collected clear temperature data all week.', 'Chúng mình thu thập dữ liệu nhiệt độ rõ ràng suốt tuần.', '📈'),
    v('Robot', '/ˈroʊbɑːt/', 'noun', 'Người máy, robot', 'A small robot can sort recycled parts quickly.', 'Một con robot nhỏ có thể phân loại vật tái chế rất nhanh.', '🤖'),
    v('Artificial intelligence', '/ˌɑːrtɪˈfɪʃəl ɪnˈtelɪdʒəns/', 'noun', 'Trí tuệ nhân tạo', 'Artificial intelligence helps doctors read scans faster.', 'Trí tuệ nhân tạo giúp bác sĩ đọc phim chụp nhanh hơn.', '🧠'),
    v('Gravity', '/ˈɡrævəti/', 'noun', 'Trọng lực', 'Gravity keeps planets moving around the sun.', 'Trọng lực giữ các hành tinh chuyển động quanh mặt trời.', '🍎'),
    v('Cell', '/sel/', 'noun', 'Tế bào', 'Every living plant is made of tiny cells.', 'Mọi loài cây sống đều được tạo nên từ những tế bào nhỏ bé.', '🧬'),
    v('Electricity', '/ɪˌlekˈtrɪsəti/', 'noun', 'Điện năng', 'Solar panels turn sunlight into clean electricity.', 'Tấm pin mặt trời biến ánh nắng thành điện sạch.', '⚡'),
    v('Telescope', '/ˈtelɪskoʊp/', 'noun', 'Kính thiên văn', 'We spotted Jupiter through the school telescope.', 'Chúng mình nhìn thấy Sao Mộc qua kính thiên văn của trường.', '🔭'),
    v('Microscope', '/ˈmaɪkrəskoʊp/', 'noun', 'Kính hiển vi', 'A microscope lets students inspect leaf cells.', 'Kính hiển vi giúp học sinh quan sát tế bào lá cây.', '🔬'),
    v('Planet', '/ˈplænɪt/', 'noun', 'Hành tinh', 'Earth is the third planet from the sun.', 'Trái Đất là hành tinh thứ ba tính từ mặt trời.', '🌍'),
    v('Hypothesis', '/haɪˈpɑːθəsɪs/', 'noun', 'Giả thuyết khoa học', 'State your hypothesis before starting the test.', 'Hãy nêu giả thuyết của bạn trước khi bắt đầu thử nghiệm.', '🤔'),
    v('Satellite', '/ˈsætəlaɪt/', 'noun', 'Vệ tinh', 'Weather satellites help forecast storms earlier.', 'Vệ tinh thời tiết giúp dự báo bão sớm hơn.', '🛰️'),
    v('Innovation', '/ˌɪnəˈveɪʃən/', 'noun', 'Sự đổi mới sáng tạo', 'Student innovation shone at the science fair.', 'Sự sáng tạo của học sinh toả sáng tại hội chợ khoa học.', '🚀'),
  ],

  grammar: [
    {
      title: 'Hiện tại Hoàn thành Tiếp diễn: have / has been + V-ing',
      explanation: 'Dùng "have / has been + V-ing" để nhấn mạnh một hành động (như nghiên cứu, thử nghiệm) bắt đầu trong quá khứ, kéo dài liên tục và hiện vẫn đang tiếp diễn.',
      examples: [
        { en: 'Our club has been building a small robot for two months.', vi: 'Câu lạc bộ chúng mình đã chế tạo một con robot nhỏ suốt hai tháng nay.' },
        { en: 'Scientists have been studying clean electricity for decades.', vi: 'Các nhà khoa học đã nghiên cứu điện sạch qua nhiều thập kỷ.' },
        { en: 'Lan has been collecting plant data since October.', vi: 'Lan đã thu thập dữ liệu thực vật liên tục từ tháng Mười.' },
        { en: 'How long have you been testing that hypothesis?', vi: 'Bạn đã kiểm nghiệm giả thuyết đó bao lâu rồi?' },
      ],
      mistakes: [
        { wrong: 'She has been research solar cells for a year.', right: 'She has been researching solar cells for a year.', note: 'Sau "has been" phải dùng dạng V-ing ("researching").' },
        { wrong: 'They did three researches last month.', right: 'They did three research projects last month.', note: '"Research" là danh từ không đếm được, không thêm "-es".' },
      ],
    },
    {
      title: 'Câu điều kiện loại 2 (Second Conditional): If + Quá khứ Đơn, would + V',
      explanation: 'Dùng cho giả định không có thật hoặc khó xảy ra ở hiện tại: "If + S + V-quá khứ, S + would / could + V nguyên mẫu". Trong văn chuẩn, dùng "were" cho mọi ngôi (If I were a scientist…).',
      examples: [
        { en: 'If I were a scientist, I would study distant planets.', vi: 'Nếu mình là nhà khoa học, mình sẽ nghiên cứu các hành tinh xa xôi.' },
        { en: 'If we had a stronger telescope, we could see Saturn clearly.', vi: 'Nếu có kính thiên văn mạnh hơn, chúng mình có thể thấy Sao Thổ thật rõ.' },
        { en: 'If robots handled dangerous tasks, fewer workers would get hurt.', vi: 'Nếu robot đảm nhận việc nguy hiểm, ít công nhân sẽ bị thương hơn.' },
        { en: 'What invention would you build if you owned a laboratory?', vi: 'Bạn sẽ chế tạo phát minh gì nếu sở hữu một phòng thí nghiệm?' },
      ],
      mistakes: [
        { wrong: 'If I would be a scientist, I studied space.', right: 'If I were a scientist, I would study space.', note: 'Không đặt "would" trong mệnh đề "If"; "would + V" luôn ở mệnh đề kết quả.' },
      ],
    },
  ],

  reading: {
    title: 'Ngày hội khoa học sáng tạo của trường',
    passage: [
      'Lan: Minh, welcome to our science fair booth! My team has been running a clean-water experiment in the laboratory for three weeks.',
      'Minh: That looks like real innovation! Look—you can see tiny plant cells through that microscope, and your data chart is super clear.',
      'Lan: First we wrote a hypothesis, then we tested it until our discovery matched the theory!',
      'Minh: Amazing! My group built a solar robot that runs on clean electricity. We even used artificial intelligence to sort plastic.',
      'Lan: If I were a scientist, I would design a weather satellite or a giant telescope to explore another planet and study gravity!',
      'Minh: Keep doing research, Lan—your next invention might help everyone!',
    ].join('\n'),
    translation: [
      'Lan: Minh ơi, chào mừng đến gian hàng hội chợ khoa học của tụi mình! Nhóm mình đã chạy thí nghiệm lọc nước sạch trong phòng thí nghiệm suốt ba tuần nay.',
      'Minh: Trông đúng là sáng tạo thật sự! Nhìn kìa—có thể thấy tế bào thực vật tí hon qua kính hiển vi kia, mà biểu đồ dữ liệu của bạn rõ lắm.',
      'Lan: Ban đầu tụi mình viết giả thuyết, rồi kiểm nghiệm cho đến khi phát hiện khớp với lý thuyết!',
      'Minh: Tuyệt vời! Nhóm mình chế tạo một robot năng lượng mặt trời chạy bằng điện sạch. Tụi mình còn dùng trí tuệ nhân tạo để phân loại nhựa.',
      'Lan: Nếu mình là nhà khoa học, mình sẽ thiết kế một vệ tinh thời tiết hoặc kính thiên văn khổng lồ để khám phá hành tinh khác và nghiên cứu trọng lực!',
      'Minh: Cứ tiếp tục nghiên cứu nhé Lan—phát minh tiếp theo của bạn có thể giúp ích cho mọi người đấy!',
    ].join('\n'),
    highlights: ['Science', 'Experiment', 'Laboratory', 'Innovation', 'Cell', 'Microscope', 'Data', 'Hypothesis', 'Discovery', 'Theory', 'Robot', 'Electricity', 'Scientist', 'Satellite', 'Telescope', 'Planet', 'Gravity', 'Research', 'Invention'],
    questions: [
      {
        question: 'Nhóm của Lan đã thực hiện thí nghiệm lọc nước trong bao lâu?',
        options: ['Ba ngày', 'Ba tuần', 'Ba tháng', 'Một năm'],
        correct: 1,
        explanation: 'Lan nói: "My team has been running a clean-water experiment in the laboratory for three weeks."',
      },
      {
        question: 'Nhóm của Minh dùng trí tuệ nhân tạo trên robot để làm gì?',
        options: ['Quan sát tế bào lá cây', 'Phân loại nhựa', 'Dự báo bão', 'Vẽ biểu đồ dữ liệu'],
        correct: 1,
        explanation: 'Minh kể: "We even used artificial intelligence to sort plastic."',
      },
      {
        question: 'Nếu là nhà khoa học, Lan muốn thiết kế thứ gì?',
        options: [
          'Một vệ tinh thời tiết hoặc kính thiên văn khổng lồ',
          'Một chiếc xe buýt điện',
          'Một bộ lọc nước mới',
          'Một ứng dụng nghe nhạc',
        ],
        correct: 0,
        explanation: 'Lan nói: "If I were a scientist, I would design a weather satellite or a giant telescope".',
      },
      {
        question: 'Minh nhìn thấy gì qua chiếc kính hiển vi ở gian hàng của Lan?',
        options: ['Các hành tinh xa xôi', 'Những tế bào thực vật tí hon', 'Các vệ tinh thời tiết', 'Các linh kiện robot'],
        correct: 1,
        explanation: 'Minh nhận xét: "you can see tiny plant cells through that microscope".',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Điểm khác nhau giữa "discovery" và "invention" là gì?',
      options: [
        'Discovery là tìm ra thứ đã có trong tự nhiên; Invention là sáng chế ra thứ mới chưa từng có.',
        'Invention là tìm ra hành tinh; Discovery là chế tạo robot.',
        'Hai từ có nghĩa trái ngược nhau về kích thước.',
        'Hai từ chỉ dùng trong môn lịch sử.',
      ],
      correct: 0,
      explanation: 'Ví dụ: trọng lực là discovery (phát hiện); máy in, kính hiển vi là invention (phát minh).',
    },
    {
      skill: 'vocab',
      question: 'Dụng cụ phóng đại để nhìn các tế bào tí hon gọi là:',
      options: ['Telescope', 'Microscope', 'Satellite', 'Gravity'],
      correct: 1,
      explanation: '"Microscope" = kính hiển vi; còn "telescope" = kính thiên văn nhìn các vì sao.',
    },
    {
      skill: 'grammar',
      question: 'Điền dạng đúng (Hiện tại Hoàn thành Tiếp diễn): "Our team has been ___ this experiment for three weeks."',
      options: ['run', 'ran', 'running', 'runs'],
      correct: 2,
      explanation: 'Cấu trúc "has been + V-ing": "has been running".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu điều kiện loại 2 ĐÚNG:',
      options: [
        'If I would be a scientist, I studied planets.',
        'If I were a scientist, I would study planets.',
        'If I am a scientist, I would study planets.',
        'If I were a scientist, I will study planets.',
      ],
      correct: 1,
      explanation: 'Điều kiện loại 2: "If + Quá khứ Đơn / were, would + V nguyên mẫu".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng với danh từ "research":',
      options: [
        'They published two new researches.',
        'Clean-energy research helps communities.',
        'A research are very expensive.',
        'Many researches is needed.',
      ],
      correct: 1,
      explanation: '"Research" là danh từ không đếm được nên không thêm "-es" và chia số ít "helps".',
    },
    {
      skill: 'vocab',
      question: 'Dự đoán khoa học ban đầu mà bạn đặt ra để kiểm chứng bằng thí nghiệm gọi là:',
      options: ['Hypothesis', 'Electricity', 'Planet', 'Robot'],
      correct: 0,
      explanation: '"Hypothesis" = giả thuyết khoa học.',
    },
    {
      skill: 'usage',
      question: 'Trước khi bước vào phòng thí nghiệm hoá học, thầy giáo nhắc cả lớp:',
      options: [
        'Wear safety glasses inside the laboratory.',
        'Turn off gravity in the laboratory.',
        'Eat your hypothesis before class.',
        'Bring a telescope to see cells.',
      ],
      correct: 0,
      explanation: '"Wear safety glasses inside the laboratory." = Đeo kính bảo hộ trong phòng thí nghiệm.',
    },
    {
      skill: 'listening',
      audioText: 'Weather satellites help forecast heavy storms much earlier.',
      question: 'Nghe và chọn công dụng của vệ tinh thời tiết:',
      options: ['Giúp dự báo bão lớn sớm hơn nhiều', 'Giúp tạo ra điện mặt trời', 'Giúp quan sát tế bào lá cây', 'Giúp phân loại rác nhựa'],
      correct: 0,
      explanation: '"forecast heavy storms much earlier" = dự báo bão lớn sớm hơn nhiều.',
    },
    {
      skill: 'listening',
      audioText: 'If we had a stronger telescope, we could see Saturn clearly.',
      question: 'Nghe và chọn điều kiện giả định được nhắc đến:',
      options: ['Nếu có kính thiên văn mạnh hơn', 'Nếu có kính hiển vi mới hơn', 'Nếu trời không có mây', 'Nếu có thêm dữ liệu nhiệt độ'],
      correct: 0,
      explanation: '"If we had a stronger telescope" = Nếu chúng ta có kính thiên văn mạnh hơn.',
    },
  ],
};

export default SCIENCE_LESSON;
