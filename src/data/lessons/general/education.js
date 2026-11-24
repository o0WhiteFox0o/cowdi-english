// Track: general — Unit int-u10 · Giáo dục nâng cao (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const EDUCATION_LESSON = {
  id: 'education',
  contentVersion: 2,
  track: 'general',
  level: 'advanced',
  cefrLevel: 'B1',
  unit: 'int-u10',
  title: 'Giáo dục nâng cao',
  description: 'Từ vựng đại học, học bổng, phương pháp tự học và cấu trúc Wish / Despite – In spite of',
  icon: '🎓',
  objectives: [
    'Dùng chính xác 20 từ vựng về môi trường đại học, học bổng, kỹ năng học thuật và tinh thần tự học',
    'Diễn đạt điều ước ở hiện tại bằng "I wish + S + V-quá khứ / could / were"',
    'Diễn đạt sự nhượng bộ bằng "Despite / In spite of + danh từ / V-ing" mà không nhầm với "Although"',
  ],

  vocabulary: [
    v('University', '/ˌjuːnɪˈvɜːrsəti/', 'noun', 'Trường đại học', 'She plans to attend a national university.', 'Bạn ấy dự định theo học một trường đại học quốc gia.', '🏫'),
    v('Scholarship', '/ˈskɑːlərʃɪp/', 'noun', 'Học bổng', 'Strong grades helped him win a scholarship.', 'Điểm số tốt giúp anh ấy giành được học bổng.', '🎓'),
    v('Degree', '/dɪˈɡriː/', 'noun', 'Bằng cấp đại học', 'My cousin earned a degree in biology.', 'Anh họ mình nhận bằng cử nhân ngành sinh học.', '📜'),
    v('Lecture', '/ˈlektʃər/', 'noun', 'Bài giảng đại học', 'Take concise notes during every morning lecture.', 'Hãy ghi chép súc tích trong mỗi bài giảng buổi sáng.', '👨‍🏫'),
    v('Assignment', '/əˈsaɪnmənt/', 'noun', 'Bài tập được giao', 'Submit your writing assignment before Monday evening.', 'Nộp bài tập viết trước tối thứ Hai nhé.', '📝'),
    v('Graduation', '/ˌɡrædʒuˈeɪʃən/', 'noun', 'Lễ tốt nghiệp', 'Our whole family celebrated Linh\'s graduation.', 'Cả gia đình mình đã ăn mừng lễ tốt nghiệp của chị Linh.', '🎉'),
    v('Professor', '/prəˈfesər/', 'noun', 'Giáo sư, giảng viên đại học', 'The professor answered every student\'s question patiently.', 'Giáo sư trả lời kiên nhẫn từng câu hỏi của sinh viên.', '👨‍🏫'),
    v('Semester', '/sɪˈmestər/', 'noun', 'Học kỳ', 'The autumn semester begins in early September.', 'Học kỳ mùa thu bắt đầu vào đầu tháng Chín.', '📅'),
    v('Campus', '/ˈkæmpəs/', 'noun', 'Khuôn viên trường đại học', 'Tall trees shade the green university campus.', 'Những hàng cây cao toả bóng mát khuôn viên trường đại học.', '🏛️'),
    v('Curriculum', '/kəˈrɪkjələm/', 'noun', 'Chương trình đào tạo', 'The updated curriculum includes coding and debate.', 'Chương trình học mới bao gồm lập trình và tranh biện.', '📚'),
    v('Tuition', '/tuːˈɪʃən/', 'noun', 'Học phí', 'A full scholarship covers tuition and textbooks.', 'Học bổng toàn phần chi trả học phí và sách giáo khoa.', '💰'),
    v('Knowledge', '/ˈnɑːlɪdʒ/', 'noun', 'Kiến thức (không đếm được)', 'Sharing knowledge helps everyone grow faster.', 'Chia sẻ kiến thức giúp mọi người tiến bộ nhanh hơn.', '🧠'),
    v('Critical thinking', '/ˈkrɪtɪkəl ˈθɪŋkɪŋ/', 'noun', 'Tư duy phản biện', 'Critical thinking helps you evaluate online claims.', 'Tư duy phản biện giúp bạn đánh giá các thông tin trên mạng.', '🤔'),
    v('Thesis', '/ˈθiːsɪs/', 'noun', 'Luận văn tốt nghiệp', 'Linh spent six months writing her senior thesis.', 'Chị Linh dành sáu tháng để viết luận văn tốt nghiệp.', '📖'),
    v('Major', '/ˈmeɪdʒər/', 'noun', 'Chuyên ngành đại học', 'His chosen major is environmental science.', 'Chuyên ngành anh ấy chọn là khoa học môi trường.', '💻'),
    v('Textbook', '/ˈtekstbʊk/', 'noun', 'Sách giáo khoa', 'Review chapter four in your science textbook.', 'Ôn lại chương bốn trong sách giáo khoa khoa học nhé.', '📕'),
    v('Academic', '/ˌækəˈdemɪk/', 'adjective', 'Thuộc học thuật', 'Steady daily review improves academic confidence.', 'Ôn tập đều đặn mỗi ngày nâng cao sự tự tin học thuật.', '🎓'),
    v('Debate', '/dɪˈbeɪt/', 'noun', 'Buổi tranh biện', 'Our English debate taught us to listen closely.', 'Buổi tranh biện tiếng Anh dạy chúng mình biết lắng nghe kỹ.', '🗣️'),
    v('Fluent', '/ˈfluːənt/', 'adjective', 'Trôi chảy, thành thạo', 'Daily speaking practice makes you more fluent.', 'Luyện nói hằng ngày giúp bạn giao tiếp trôi chảy hơn.', '🗣️'),
    v('Mentor', '/ˈmentɔːr/', 'noun', 'Người cố vấn, người dìu dắt', 'A kind mentor guides students through tough choices.', 'Một người cố vấn tận tâm dẫn dắt học sinh qua những lựa chọn khó.', '🧑‍🏫'),
  ],

  grammar: [
    {
      title: 'Câu ước ở hiện tại: Wish + S + Quá khứ Đơn (V2 / could / were)',
      explanation: 'Dùng "I wish / She wishes + S + V-quá khứ" để diễn tả mong muốn khác với thực tế hiện tại (I wish I spoke fluently; I wish I had more time; I wish I were taller — ưu tiên "were" cho mọi ngôi).',
      examples: [
        { en: 'I wish I spoke English more fluently.', vi: 'Mình ước mình nói tiếng Anh trôi chảy hơn.' },
        { en: 'Minh wishes he had an extra hour to read.', vi: 'Minh ước cậu ấy có thêm một tiếng để đọc sách.' },
        { en: 'Lan wishes she could visit a university campus abroad.', vi: 'Lan ước bạn ấy có thể thăm một khuôn viên đại học nước ngoài.' },
        { en: 'I wish our semester were a little longer.', vi: 'Mình ước học kỳ của tụi mình dài hơn một chút.' },
      ],
      mistakes: [
        { wrong: 'I wish I can win a scholarship.', right: 'I wish I could win a scholarship.', note: 'Sau "wish" phải lùi thì động từ: "can → could", "speak → spoke", "have → had".' },
      ],
    },
    {
      title: 'Nhượng bộ: Despite / In spite of + danh từ / V-ing (khác Although + mệnh đề)',
      explanation: '"Despite" và "In spite of" đều có nghĩa là "mặc dù" và luôn theo sau bởi DANH TỪ hoặc V-ing (KHÔNG theo sau bởi S + V). Chú ý: tuyệt đối KHÔNG viết "Despite of"!',
      examples: [
        { en: 'Despite the heavy rain, everyone attended the lecture.', vi: 'Mặc dù mưa lớn, mọi người vẫn đến dự bài giảng.' },
        { en: 'In spite of feeling tired, Lan finished her assignment.', vi: 'Mặc dù thấy mệt, Lan vẫn làm xong bài tập.' },
        { en: 'Despite high tuition, scholarships open many doors.', vi: 'Mặc dù học phí cao, học bổng mở ra nhiều cánh cửa.' },
        { en: 'In spite of a tight schedule, she joined the debate club.', vi: 'Mặc dù lịch kín, bạn ấy vẫn tham gia câu lạc bộ tranh biện.' },
      ],
      mistakes: [
        { wrong: 'Despite of the rain, he walked to campus.', right: 'Despite the rain, he walked to campus. / In spite of the rain…', note: '"Despite" KHÔNG đi với "of"; chỉ có "In spite of" mới có "of".' },
        { wrong: 'Despite he was tired, he finished the thesis.', right: 'Despite being tired, he finished the thesis.', note: 'Sau "Despite" dùng V-ing ("being tired") hoặc danh từ, còn mệnh đề S+V phải dùng "Although".' },
      ],
    },
  ],

  reading: {
    title: 'Ước mơ đại học và học bổng của Lan và Minh',
    passage: [
      'Minh: Lan, Linh\'s graduation on the university campus looked inspiring! What major do you dream of studying?',
      'Lan: I love environmental science! I wish I had a scholarship so tuition would not worry my parents.',
      'Minh: With your strong academic habits and critical thinking, you have a real chance. How does Linh handle every lecture and assignment?',
      'Lan: Despite a busy semester, she reviews her textbook daily and asks her professor or mentor for feedback early.',
      'Minh: That is smart! In spite of feeling shy, I joined the debate club to become more fluent in English.',
      'Lan: Great choice! True knowledge matters even more than a degree or thesis!',
    ].join('\n'),
    translation: [
      'Minh: Lan ơi, lễ tốt nghiệp của chị Linh ở khuôn viên trường đại học trông truyền cảm hứng thật! Bạn mơ ước học chuyên ngành nào?',
      'Lan: Mình thích khoa học môi trường! Mình ước có được học bổng để bố mẹ không phải lo chuyện học phí.',
      'Minh: Với thói quen học thuật vững và tư duy phản biện của bạn, bạn hoàn toàn có cơ hội. Chị Linh xoay xở từng bài giảng và bài tập thế nào?',
      'Lan: Dù học kỳ rất bận rộn, chị ấy vẫn ôn sách giáo khoa hằng ngày và xin góp ý sớm từ giáo sư hoặc người cố vấn.',
      'Minh: Thông minh thật! Dù còn hơi ngại, mình đã tham gia câu lạc bộ tranh biện để nói tiếng Anh trôi chảy hơn.',
      'Lan: Lựa chọn tuyệt vời! Kiến thức thật sự còn quý giá hơn cả bằng cấp hay luận văn nữa!',
    ].join('\n'),
    highlights: ['Graduation', 'University', 'Campus', 'Major', 'Scholarship', 'Tuition', 'Academic', 'Lecture', 'Assignment', 'Semester', 'Textbook', 'Professor', 'Mentor', 'Debate', 'Fluent', 'Knowledge', 'Degree', 'Thesis'],
    questions: [
      {
        question: 'Lan mơ ước theo học chuyên ngành nào ở đại học?',
        options: ['Khoa học máy tính', 'Khoa học môi trường', 'Kinh doanh quốc tế', 'Kiến trúc cổ'],
        correct: 1,
        explanation: 'Lan nói: "I love environmental science!"',
      },
      {
        question: 'Chị Linh làm gì để học tốt dù học kỳ rất bận rộn?',
        options: [
          'Chỉ học dồn trước ngày thi',
          'Ôn sách giáo khoa hằng ngày và xin góp ý sớm từ giáo sư hoặc cố vấn',
          'Bỏ bớt các bài giảng buổi sáng',
          'Chỉ đọc ghi chú của bạn bè',
        ],
        correct: 1,
        explanation: 'Lan kể: "she reviews her textbook daily and asks her professor or mentor for feedback early."',
      },
      {
        question: 'Vì sao Minh tham gia câu lạc bộ tranh biện dù còn hơi ngại?',
        options: ['Để lấy học bổng ngay', 'Để nói tiếng Anh trôi chảy hơn', 'Để viết luận văn', 'Để gặp chị Linh'],
        correct: 1,
        explanation: 'Minh chia sẻ: "In spite of feeling shy, I joined the debate club to become more fluent in English."',
      },
      {
        question: 'Theo câu kết của Lan, điều gì còn quý giá hơn cả bằng cấp hay luận văn?',
        options: ['Học phí thấp', 'Kiến thức thật sự', 'Khuôn viên trường lớn', 'Số lượng bài tập'],
        correct: 1,
        explanation: 'Lan kết luận: "True knowledge matters even more than a degree or thesis!"',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Khoản hỗ trợ tài chính dành cho học sinh, sinh viên có thành tích tốt gọi là:',
      options: ['Tuition', 'Scholarship', 'Assignment', 'Semester'],
      correct: 1,
      explanation: '"Scholarship" = học bổng; còn "tuition" là học phí phải đóng.',
    },
    {
      skill: 'vocab',
      question: 'Người giàu kinh nghiệm hướng dẫn, dìu dắt bạn trong học tập và nghề nghiệp gọi là:',
      options: ['Thesis', 'Mentor', 'Campus', 'Major'],
      correct: 1,
      explanation: '"Mentor" = người cố vấn, người hướng dẫn.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu ước ở hiện tại ĐÚNG ngữ pháp:',
      options: [
        'I wish I speak English fluently.',
        'I wish I spoke English fluently.',
        'I wish I will speak English fluently.',
        'I wish I speaking English fluently.',
      ],
      correct: 1,
      explanation: 'Sau "wish" ước ở hiện tại phải lùi thì quá khứ đơn: "spoke".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu nhượng bộ ĐÚNG ngữ pháp:',
      options: [
        'Despite of the rain, Lan attended the lecture.',
        'Despite the rain, Lan attended the lecture.',
        'Despite it rained heavily, Lan attended the lecture.',
        'In spite the rain, Lan attended the lecture.',
      ],
      correct: 1,
      explanation: '"Despite + danh từ / V-ing" (không có "of"); "In spite of" mới có "of".',
    },
    {
      skill: 'grammar',
      question: 'Điền dạng đúng sau "In spite of": "In spite of ___ tired, Minh finished his assignment."',
      options: ['feel', 'felt', 'feeling', 'to feel'],
      correct: 2,
      explanation: '"In spite of" kết thúc bằng giới từ "of" nên theo sau là danh từ hoặc V-ing ("feeling").',
    },
    {
      skill: 'vocab',
      question: '"Curriculum" nghĩa là gì?',
      options: ['Lễ tốt nghiệp', 'Chương trình đào tạo', 'Sách giáo khoa', 'Học phí đại học'],
      correct: 1,
      explanation: '"Curriculum" = chương trình giảng dạy / đào tạo.',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn nói dù còn hơi ngại nhưng bạn vẫn quyết định tham gia câu lạc bộ tranh biện. Câu tự nhiên nhất là:',
      options: [
        'In spite of feeling shy, I joined the debate club.',
        'Despite of I am shy, I joined the debate club.',
        'I wish I joining the debate club.',
        'Tuition makes me fluent in campus.',
      ],
      correct: 0,
      explanation: '"In spite of feeling shy…" dùng đúng cấu trúc "In spite of + V-ing".',
    },
    {
      skill: 'listening',
      audioText: 'Despite a busy semester, she reviews her textbook every day.',
      question: 'Nghe và chọn thói quen học tập của bạn ấy:',
      options: [
        'Ôn sách giáo khoa mỗi ngày dù học kỳ bận rộn',
        'Chỉ ôn bài vào cuối học kỳ',
        'Nghỉ học khi trời mưa lớn',
        'Đổi chuyên ngành vào tháng Chín',
      ],
      correct: 0,
      explanation: '"Despite a busy semester, she reviews her textbook every day." = Dù học kỳ bận rộn, bạn ấy ôn sách giáo khoa mỗi ngày.',
    },
    {
      skill: 'listening',
      audioText: 'A full scholarship covers both tuition and textbooks.',
      question: 'Nghe và chọn những khoản mà học bổng toàn phần chi trả:',
      options: ['Cả học phí và sách giáo khoa', 'Chỉ tiền ăn trưa', 'Chỉ phí câu lạc bộ', 'Chỉ vé máy bay'],
      correct: 0,
      explanation: '"covers both tuition and textbooks" = chi trả cả học phí lẫn sách giáo khoa.',
    },
  ],
};

export default EDUCATION_LESSON;
