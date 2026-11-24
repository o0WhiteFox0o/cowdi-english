// Track: general — Unit int-u10 · Kinh doanh & Công việc (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const BUSINESS_LESSON = {
  id: 'business',
  contentVersion: 2,
  track: 'general',
  level: 'advanced',
  cefrLevel: 'B1',
  unit: 'int-u10',
  title: 'Kinh doanh & Công việc',
  description: 'Từ vựng công sở, ứng tuyển, làm việc nhóm và mẫu câu giao tiếp chuyên nghiệp',
  icon: '💼',
  objectives: [
    'Sử dụng chính xác 20 từ vựng về công ty, tuyển dụng, dự án, ngân sách và hợp đồng',
    'Phân biệt đúng động từ đi với V-ing (enjoy, finish, avoid) và động từ đi với to V (want, plan, decide)',
    'Dùng Could / Would để đề xuất, xin xác nhận và giao tiếp chuyên nghiệp nơi công sở',
  ],

  vocabulary: [
    v('Company', '/ˈkʌmpəni/', 'noun', 'Công ty', 'Linh works for a green energy company.', 'Chị Linh làm việc cho một công ty năng lượng xanh.', '🏢'),
    v('Manager', '/ˈmænɪdʒər/', 'noun', 'Người quản lý', 'A supportive manager listens to every idea.', 'Một người quản lý tận tâm luôn lắng nghe mọi ý kiến.', '👨‍💼'),
    v('Employee', '/ɪmˈplɔɪiː/', 'noun', 'Nhân viên', 'Every new employee attends a training week.', 'Mỗi nhân viên mới đều tham gia một tuần đào tạo.', '🧑‍💻'),
    v('Interview', '/ˈɪntərvjuː/', 'noun', 'Buổi phỏng vấn xin việc', 'Prepare thoughtful questions before your interview.', 'Hãy chuẩn bị câu hỏi sâu sắc trước buổi phỏng vấn.', '🤝'),
    v('Resume', '/ˈrezəmeɪ/', 'noun', 'Hồ sơ xin việc (CV)', 'Keep your resume clear and well organized.', 'Giữ hồ sơ xin việc của bạn rõ ràng và mạch lạc.', '📄'),
    v('Salary', '/ˈsæləri/', 'noun', 'Mức lương', 'The role offers a fair monthly salary.', 'Vị trí này có mức lương hằng tháng hợp lý.', '💰'),
    v('Meeting', '/ˈmiːtɪŋ/', 'noun', 'Cuộc họp', 'Our weekly project meeting starts at nine.', 'Cuộc họp dự án hằng tuần bắt đầu lúc chín giờ.', '📊'),
    v('Deadline', '/ˈdedlaɪn/', 'noun', 'Hạn chót', 'Good planning helps teams meet every deadline.', 'Lập kế hoạch tốt giúp nhóm kịp mọi hạn chót.', '⏰'),
    v('Project', '/ˈprɑːdʒekt/', 'noun', 'Dự án', 'Our team finished the solar project ahead of time.', 'Nhóm chúng mình hoàn thành dự án điện mặt trời trước hạn.', '📋'),
    v('Client', '/ˈklaɪənt/', 'noun', 'Khách hàng (doanh nghiệp)', 'Clear updates build trust with each client.', 'Cập nhật rõ ràng tạo niềm tin với từng khách hàng.', '🤵'),
    v('Contract', '/ˈkɑːntrækt/', 'noun', 'Hợp đồng', 'Read every line before signing a contract.', 'Đọc kỹ từng dòng trước khi ký hợp đồng.', '📝'),
    v('Profit', '/ˈprɑːfɪt/', 'noun', 'Lợi nhuận', 'Careful budgeting helped the shop grow its profit.', 'Quản lý ngân sách cẩn thận giúp cửa hàng tăng lợi nhuận.', '📈'),
    v('Budget', '/ˈbʌdʒɪt/', 'noun', 'Ngân sách', 'The manager reviewed our travel budget carefully.', 'Người quản lý xem xét kỹ ngân sách công tác của chúng mình.', '💵'),
    v('Colleague', '/ˈkɑːliːɡ/', 'noun', 'Đồng nghiệp', 'My colleague helped me rehearse the pitch.', 'Đồng nghiệp của mình đã giúp mình tập dượt bài trình bày.', '👫'),
    v('Promotion', '/prəˈmoʊʃən/', 'noun', 'Sự thăng chức', 'Hard work and leadership earned her a promotion.', 'Sự chăm chỉ và khả năng lãnh đạo giúp chị ấy được thăng chức.', '🎖️'),
    v('Teamwork', '/ˈtiːmwɜːrk/', 'noun', 'Làm việc nhóm', 'Strong teamwork solves tough problems faster.', 'Làm việc nhóm tốt giải quyết vấn đề khó nhanh hơn.', '🤝'),
    v('Experience', '/ɪkˈspɪriəns/', 'noun', 'Kinh nghiệm', 'Internships give students valuable work experience.', 'Kỳ thực tập mang lại cho sinh viên kinh nghiệm làm việc quý giá.', '📈'),
    v('Apply', '/əˈplaɪ/', 'verb', 'Ứng tuyển, nộp đơn', 'Linh decided to apply for the coordinator role.', 'Chị Linh quyết định ứng tuyển vị trí điều phối viên.', '✉️'),
    v('Strategy', '/ˈstrætədʒi/', 'noun', 'Chiến lược', 'We planned a simple strategy for local outreach.', 'Chúng mình lập một chiến lược đơn giản để tiếp cận địa phương.', '🎯'),
    v('Target', '/ˈtɑːrɡɪt/', 'noun', 'Mục tiêu cần đạt', 'The sales team reached its quarterly target.', 'Nhóm kinh doanh đã đạt mục tiêu quý.', '🎯'),
  ],

  grammar: [
    {
      title: 'Danh động từ (V-ing) vs Động từ nguyên mẫu có "to" (to V)',
      explanation: 'Sau enjoy, finish, avoid, consider, suggest dùng V-ing (enjoy working, finish preparing). Sau want, plan, decide, hope, agree, expect dùng "to V" (decide to apply, plan to launch).',
      examples: [
        { en: 'Linh enjoys working with a creative colleague.', vi: 'Chị Linh thích làm việc cùng đồng nghiệp sáng tạo.' },
        { en: 'We finished reviewing the quarterly budget.', vi: 'Chúng mình đã xem xong ngân sách quý.' },
        { en: 'She decided to apply for the manager role.', vi: 'Chị ấy quyết định ứng tuyển vị trí quản lý.' },
        { en: 'The company plans to expand its green strategy.', vi: 'Công ty dự định mở rộng chiến lược xanh của mình.' },
      ],
      mistakes: [
        { wrong: 'I enjoy to work in a supportive team.', right: 'I enjoy working in a supportive team.', note: 'Sau động từ "enjoy" luôn dùng V-ing ("working"), không dùng "to V".' },
        { wrong: 'She decided applying for the job.', right: 'She decided to apply for the job.', note: 'Sau "decide" dùng "to + động từ nguyên mẫu" ("decided to apply").' },
      ],
    },
    {
      title: 'Động từ khuyết thiếu lịch sự nơi công sở: Could / Would',
      explanation: 'Dùng "Could you + V nguyên mẫu…?" để nhờ đồng nghiệp hoặc khách hàng, "Would you mind + V-ing…?" để hỏi thật lịch sự, và "I would like to + V" để trình bày đề xuất. Sau "could" luôn là động từ nguyên mẫu.',
      examples: [
        { en: 'Could you review my resume before Friday?', vi: 'Bạn có thể xem giúp hồ sơ xin việc của mình trước thứ Sáu không?' },
        { en: 'Would you mind confirming the client meeting?', vi: 'Bạn có phiền xác nhận buổi họp khách hàng không?' },
        { en: 'I would like to discuss our project target.', vi: 'Mình muốn trao đổi về mục tiêu dự án của chúng ta.' },
        { en: 'Could we check the contract details together?', vi: 'Chúng ta cùng kiểm tra chi tiết hợp đồng được không?' },
      ],
      mistakes: [
        { wrong: 'Could you sending me the updated budget?', right: 'Could you send me the updated budget?', note: 'Sau "Could you" luôn dùng động từ nguyên mẫu ("send"), không thêm "-ing".' },
      ],
    },
  ],

  reading: {
    title: 'Buổi chuẩn bị phỏng vấn của chị Linh',
    passage: [
      'Lan: Linh, congratulations on getting an interview at that green technology company!',
      'Linh: Thanks, Lan! I spent all week updating my resume and reviewing my past project experience.',
      'Lan: Are you nervous about discussing salary or the contract?',
      'Linh: Not really. Right now I want to focus on teamwork, budget planning, and our client strategy. My former colleague helped me practice!',
      'Lan: That is awesome. If you get hired, could you earn a promotion to manager one day?',
      'Linh: I hope so! Every employee learns best by hitting each target before the deadline and keeping the company\'s profit healthy.',
    ].join('\n'),
    translation: [
      'Lan: Chị Linh ơi, chúc mừng chị được mời phỏng vấn ở công ty công nghệ xanh đó nhé!',
      'Linh: Cảm ơn Lan! Chị dành cả tuần cập nhật hồ sơ xin việc và xem lại kinh nghiệm dự án trước đây.',
      'Lan: Chị có lo lúc bàn về lương hay hợp đồng không?',
      'Linh: Không hẳn đâu. Bây giờ chị muốn tập trung vào làm việc nhóm, lập ngân sách và chiến lược khách hàng. Đồng nghiệp cũ đã giúp chị tập dượt rồi!',
      'Lan: Tuyệt quá. Nếu chị trúng tuyển, có ngày nào chị được thăng chức lên quản lý không?',
      'Linh: Chị cũng hy vọng vậy! Mỗi nhân viên học tốt nhất khi hoàn thành từng mục tiêu trước hạn chót và giúp lợi nhuận công ty vững mạnh.',
    ].join('\n'),
    highlights: ['Interview', 'Company', 'Resume', 'Project', 'Experience', 'Salary', 'Contract', 'Teamwork', 'Budget', 'Client', 'Strategy', 'Colleague', 'Promotion', 'Manager', 'Employee', 'Target', 'Deadline', 'Profit'],
    questions: [
      {
        question: 'Chị Linh đã dành cả tuần để chuẩn bị những gì cho buổi phỏng vấn?',
        options: [
          'Mua quần áo mới và đi du lịch',
          'Cập nhật hồ sơ xin việc và xem lại kinh nghiệm dự án cũ',
          'Ký hợp đồng mới với khách hàng',
          'Đàm phán mức lương cao hơn',
        ],
        correct: 1,
        explanation: 'Chị Linh nói: "I spent all week updating my resume and reviewing my past project experience."',
      },
      {
        question: 'Ai đã giúp chị Linh tập dượt cho buổi phỏng vấn?',
        options: ['Thầy Tom', 'Một người đồng nghiệp cũ', 'Giám đốc công ty mới', 'Em gái Lan'],
        correct: 1,
        explanation: 'Chị Linh kể: "My former colleague helped me practice!"',
      },
      {
        question: 'Trong buổi phỏng vấn sắp tới, chị Linh muốn tập trung nói về những điểm nào?',
        options: [
          'Làm việc nhóm, lập ngân sách và chiến lược khách hàng',
          'Chỉ nói về mức lương và kỳ nghỉ',
          'Kể chuyện sở thích cá nhân',
          'Hỏi về giờ làm thêm',
        ],
        correct: 0,
        explanation: 'Chị Linh nói rõ: "I want to focus on teamwork, budget planning, and our client strategy."',
      },
      {
        question: 'Theo chị Linh, nhân viên học hỏi và phát triển tốt nhất bằng cách nào?',
        options: [
          'Tránh làm việc nhóm',
          'Hoàn thành từng mục tiêu trước hạn chót và đóng góp cho lợi nhuận công ty',
          'Đổi công ty mỗi tháng',
          'Không cần lập ngân sách',
        ],
        correct: 1,
        explanation: 'Câu cuối: "hitting each target before the deadline and keeping the company\'s profit healthy."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Colleague" dùng để gọi ai nơi công sở?',
      options: ['Khách hàng bên ngoài', 'Đồng nghiệp làm cùng nhau', 'Đối thủ cạnh tranh', 'Bản hợp đồng'],
      correct: 1,
      explanation: '"Colleague" = đồng nghiệp.',
    },
    {
      skill: 'vocab',
      question: 'Bản tóm tắt học vấn, kỹ năng và kinh nghiệm gửi khi xin việc gọi là:',
      options: ['Budget', 'Resume', 'Target', 'Profit'],
      correct: 1,
      explanation: '"Resume" (hoặc CV) = hồ sơ xin việc.',
    },
    {
      skill: 'grammar',
      question: 'Điền dạng đúng: "Linh enjoys ___ on green energy projects."',
      options: ['work', 'to work', 'working', 'worked'],
      correct: 2,
      explanation: 'Sau "enjoy" luôn dùng V-ing ("working").',
    },
    {
      skill: 'grammar',
      question: 'Điền dạng đúng: "She decided ___ for the coordinator position."',
      options: ['apply', 'to apply', 'applying', 'applied'],
      correct: 1,
      explanation: 'Sau "decide" dùng "to + động từ nguyên mẫu" ("to apply").',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu nhờ đồng nghiệp ĐÚNG ngữ pháp:',
      options: [
        'Could you sending me the project budget?',
        'Could you send me the project budget?',
        'Could you to send me the project budget?',
        'Could you sends me the project budget?',
      ],
      correct: 1,
      explanation: 'Sau động từ khuyết thiếu "Could" luôn dùng động từ nguyên mẫu ("send").',
    },
    {
      skill: 'vocab',
      question: 'Khi một nhân viên làm tốt và được giao vị trí cao hơn, họ nhận được một:',
      options: ['Deadline', 'Promotion', 'Contract', 'Salary'],
      correct: 1,
      explanation: '"Promotion" = sự thăng chức.',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn lịch sự xin thêm thời gian để kiểm tra kỹ bản hợp đồng trước khi ký. Câu tự nhiên nhất là:',
      options: [
        'Could I have a day to review the contract details?',
        'I enjoy to sign no contract.',
        'Give me profit immediately.',
        'My resume is a deadline.',
      ],
      correct: 0,
      explanation: '"Could I have a day to review the contract details?" lịch sự và chuyên nghiệp.',
    },
    {
      skill: 'listening',
      audioText: 'We finished preparing our strategy before the Friday deadline.',
      question: 'Nghe và chọn kết quả công việc của nhóm:',
      options: [
        'Hoàn thành chiến lược trước hạn chót thứ Sáu',
        'Bị trễ hạn chót ba ngày',
        'Huỷ cuộc họp với khách hàng',
        'Đổi ngân sách sang tuần sau',
      ],
      correct: 0,
      explanation: '"finished preparing our strategy before the Friday deadline" = hoàn thành chiến lược trước hạn thứ Sáu.',
    },
    {
      skill: 'listening',
      audioText: 'Strong teamwork helps the company reach every target.',
      question: 'Nghe và chọn yếu tố giúp công ty đạt mọi mục tiêu:',
      options: ['Làm việc nhóm vững mạnh', 'Tăng giá sản phẩm', 'Cắt giảm đào tạo', 'Làm việc một mình'],
      correct: 0,
      explanation: '"Strong teamwork" = làm việc nhóm vững mạnh.',
    },
  ],
};

export default BUSINESS_LESSON;
