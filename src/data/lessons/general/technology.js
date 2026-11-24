// Track: general — Unit int-u7 · Công nghệ (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const TECHNOLOGY_LESSON = {
  id: 'technology',
  contentVersion: 2,
  track: 'general',
  level: 'intermediate',
  cefrLevel: 'A2',
  unit: 'int-u7',
  title: 'Công nghệ',
  description: 'Từ vựng thiết bị số, thao tác trên mạng và hướng dẫn dùng công nghệ an toàn',
  icon: '💻',
  objectives: [
    'Gọi tên 20 từ vựng thiết bị, phần mềm và thao tác số (download, upload, cloud, screenshot, update)',
    'Dùng câu mệnh lệnh khẳng định và phủ định (Download…, Don\'t share…) để hướng dẫn kỹ thuật rõ ràng',
    'Dùng động từ khuyết thiếu (need to, must, can) khi trao đổi về bảo mật và sự cố thiết bị',
  ],

  vocabulary: [
    v('Computer', '/kəmˈpjuːtər/', 'noun', 'Máy tính', 'I use a computer for school projects.', 'Mình dùng máy tính cho các dự án ở trường.', '💻'),
    v('Phone', '/foʊn/', 'noun', 'Điện thoại', 'Please charge your phone before leaving.', 'Hãy sạc điện thoại trước khi ra ngoài nhé.', '📱'),
    v('Internet', '/ˈɪntərnet/', 'noun', 'Mạng Internet', 'We search for study guides on the internet.', 'Chúng mình tìm tài liệu học trên internet.', '🌐'),
    v('Website', '/ˈwebsaɪt/', 'noun', 'Trang web', 'This learning website works well on mobile.', 'Trang web học tập này chạy rất tốt trên điện thoại.', '🖥️'),
    v('Email', '/ˈiːmeɪl/', 'noun', 'Thư điện tử', 'Send your homework by email tonight.', 'Gửi bài tập qua email tối nay nhé.', '📧'),
    v('Password', '/ˈpæswɜːrd/', 'noun', 'Mật khẩu', 'Never share your password with strangers.', 'Đừng bao giờ chia sẻ mật khẩu với người lạ.', '🔑'),
    v('Download', '/ˈdaʊnloʊd/', 'verb', 'Tải xuống', 'Download the study file to your device.', 'Tải tệp học tập xuống thiết bị của bạn.', '⬇️'),
    v('Upload', '/ʌpˈloʊd/', 'verb', 'Tải lên', 'Upload your finished slides before noon.', 'Tải bài trình chiếu đã xong lên trước buổi trưa.', '⬆️'),
    v('Search', '/sɜːrtʃ/', 'verb', 'Tìm kiếm', 'Search for trusted sources online.', 'Hãy tìm kiếm các nguồn đáng tin cậy trên mạng.', '🔍'),
    v('Camera', '/ˈkæmərə/', 'noun', 'Máy ảnh, camera', 'Clean the camera lens before taking photos.', 'Lau sạch ống kính camera trước khi chụp ảnh.', '📸'),
    v('Battery', '/ˈbætəri/', 'noun', 'Pin', 'My phone battery is almost empty.', 'Pin điện thoại của mình sắp cạn rồi.', '🔋'),
    v('Software', '/ˈsɔːftwer/', 'noun', 'Phần mềm', 'Keep your antivirus software up to date.', 'Luôn cập nhật phần mềm diệt virus của bạn.', '💿'),
    v('Hardware', '/ˈhɑːrdwer/', 'noun', 'Phần cứng', 'Good hardware helps the laptop run smoothly.', 'Phần cứng tốt giúp máy tính chạy mượt mà.', '🖥️'),
    v('App', '/æp/', 'noun', 'Ứng dụng', 'Open the Cowdi app to review words.', 'Mở ứng dụng Cowdi để ôn từ vựng nhé.', '📲'),
    v('Cloud', '/klaʊd/', 'noun', 'Lưu trữ đám mây', 'Back up important notes on the cloud.', 'Sao lưu ghi chú quan trọng lên đám mây nhé.', '☁️'),
    v('Wi-Fi', '/ˈwaɪfaɪ/', 'noun', 'Mạng không dây Wi-Fi', 'Connect to the library Wi-Fi first.', 'Kết nối với Wi-Fi thư viện trước nhé.', '📶'),
    v('Update', '/ʌpˈdeɪt/', 'verb', 'Cập nhật', 'Remember to update the app regularly.', 'Nhớ cập nhật ứng dụng thường xuyên nhé.', '🔄'),
    v('Screenshot', '/ˈskriːnʃɑːt/', 'noun', 'Ảnh chụp màn hình', 'Take a screenshot of the error message.', 'Chụp ảnh màn hình thông báo lỗi nhé.', '📱'),
    v('Keyboard', '/ˈkiːbɔːrd/', 'noun', 'Bàn phím', 'Type slowly on the new keyboard.', 'Gõ chậm rãi trên chiếc bàn phím mới.', '⌨️'),
    v('Bluetooth', '/ˈbluːtuːθ/', 'noun', 'Kết nối không dây Bluetooth', 'Pair your headphones using Bluetooth.', 'Ghép đôi tai nghe bằng Bluetooth.', '🔵'),
  ],

  grammar: [
    {
      title: 'Câu mệnh lệnh hướng dẫn kỹ thuật (Imperatives: V nguyên mẫu / Don\'t + V)',
      explanation: 'Dùng động từ nguyên mẫu ở đầu câu (không cần chủ ngữ) để chỉ dẫn thao tác từng bước. Câu cấm đoán/cảnh báo dùng "Don\'t + V" hoặc "Never + V". Thêm "Please" để lịch sự hơn.',
      examples: [
        { en: 'Connect to the Wi-Fi before downloading.', vi: 'Kết nối Wi-Fi trước khi tải xuống.' },
        { en: 'Click the button to upload your assignment.', vi: 'Nhấn nút để tải bài tập của bạn lên.' },
        { en: "Don't share your password with anyone.", vi: 'Đừng chia sẻ mật khẩu của bạn với bất kỳ ai.' },
        { en: 'Please update your software every month.', vi: 'Vui lòng cập nhật phần mềm mỗi tháng.' },
      ],
      mistakes: [
        { wrong: 'No share your password online!', right: "Don't share your password online!", note: 'Câu mệnh lệnh phủ định phải dùng "Don\'t + động từ nguyên mẫu", không dùng "No + V".' },
        { wrong: 'Downloading the app now!', right: 'Download the app now!', note: 'Câu mệnh lệnh dùng động từ nguyên mẫu "Download", không dùng V-ing.' },
      ],
    },
    {
      title: 'Phân biệt động từ đối ngược trong công nghệ & động từ khuyết thiếu need to / must',
      explanation: 'Chú ý cặp đối lập: download (tải từ mạng về máy) ↔ upload (đưa từ máy lên mạng); software (phần mềm, không đếm được) ↔ hardware (phần cứng, không đếm được). Dùng "need to + V" để nói việc cần làm và "must not + V" cho quy tắc an toàn.',
      examples: [
        { en: 'You need to charge the battery soon.', vi: 'Bạn cần sạc pin sớm đấy.' },
        { en: 'We must protect our personal passwords.', vi: 'Chúng ta phải bảo vệ mật khẩu cá nhân.' },
        { en: 'Students can save homework safely on the cloud.', vi: 'Học sinh có thể lưu bài tập an toàn trên đám mây.' },
        { en: 'You must not click unknown email links.', vi: 'Bạn không được bấm vào đường link email lạ.' },
      ],
      mistakes: [
        { wrong: 'I bought two new softwares.', right: 'I bought two new software programs.', note: '"Software" và "hardware" là danh từ không đếm được, không thêm "-s".' },
      ],
    },
  ],

  reading: {
    title: 'Minh giúp cô Hoa cập nhật thiết bị',
    passage: [
      'Ms. Hoa: Minh, my phone battery drops quickly and this learning app feels slow. Can you help?',
      'Minh: Sure, Ms. Hoa! First, connect to the school Wi-Fi and update your software.',
      'Ms. Hoa: Should I save my photos before I update?',
      'Minh: Yes! Upload your photos to the cloud so nothing gets lost. You can also search the website on your computer.',
      'Ms. Hoa: Great idea. Do I need a new password for my email?',
      'Minh: Choose a strong password, and do not share it! If an error appears, take a screenshot and send it to me.',
    ].join('\n'),
    translation: [
      'Cô Hoa: Minh ơi, pin điện thoại cô tụt nhanh quá mà ứng dụng học tập này chạy hơi chậm. Em giúp cô được không?',
      'Minh: Dạ được cô Hoa! Trước tiên cô kết nối Wi-Fi trường rồi cập nhật phần mềm nhé.',
      'Cô Hoa: Cô có nên lưu ảnh lại trước khi cập nhật không?',
      'Minh: Có ạ! Cô tải ảnh lên đám mây để không bị mất gì. Cô cũng có thể tìm trên trang web bằng máy tính.',
      'Cô Hoa: Ý hay đấy. Cô có cần đặt mật khẩu mới cho email không?',
      'Minh: Cô chọn mật khẩu mạnh và đừng chia sẻ nó nhé! Nếu có lỗi hiện ra, cô chụp ảnh màn hình rồi gửi em xem ạ.',
    ].join('\n'),
    highlights: ['Phone', 'Battery', 'App', 'Update', 'Software', 'Upload', 'Cloud', 'Search', 'Website', 'Computer', 'Password', 'Email', 'Screenshot'],
    questions: [
      {
        question: 'Cô Hoa đang gặp hai vấn đề nào với điện thoại của mình?',
        options: [
          'Hỏng camera và không có bàn phím',
          'Pin tụt nhanh và ứng dụng học tập chạy chậm',
          'Quên mật khẩu Wi-Fi và mất kết nối Bluetooth',
          'Không gửi được email',
        ],
        correct: 1,
        explanation: 'Cô Hoa nói: "my phone battery drops quickly and this learning app feels slow."',
      },
      {
        question: 'Minh khuyên cô Hoa làm gì để ảnh không bị mất trước khi cập nhật?',
        options: ['In hết ảnh ra giấy', 'Tải ảnh lên lưu trữ đám mây (cloud)', 'Gửi ảnh qua Bluetooth', 'Xoá bớt ứng dụng'],
        correct: 1,
        explanation: 'Minh hướng dẫn: "Upload your photos to the cloud so nothing gets lost."',
      },
      {
        question: 'Minh dặn cô Hoa điều gì về mật khẩu email?',
        options: ['Dùng ngày sinh cho dễ nhớ', 'Chọn mật khẩu mạnh và không chia sẻ', 'Viết mật khẩu lên trang web', 'Không cần đặt mật khẩu'],
        correct: 1,
        explanation: 'Minh nói: "Choose a strong password, and do not share it!"',
      },
      {
        question: 'Nếu gặp thông báo lỗi, cô Hoa nên làm gì?',
        options: ['Tắt máy ngay', 'Chụp ảnh màn hình rồi gửi cho Minh', 'Mua điện thoại mới', 'Đổi sang mạng khác'],
        correct: 1,
        explanation: 'Minh dặn ở câu cuối: "If an error appears, take a screenshot and send it to me."',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Hành động đưa tệp hoặc ảnh từ máy của bạn lên mạng gọi là:',
      options: ['Download', 'Upload', 'Screenshot', 'Search'],
      correct: 1,
      explanation: '"Upload" = tải lên; ngược lại "download" = tải xuống.',
    },
    {
      skill: 'vocab',
      question: '"Screenshot" có nghĩa là gì?',
      options: ['Bàn phím rời', 'Ảnh chụp màn hình', 'Dung lượng pin', 'Phần cứng máy tính'],
      correct: 1,
      explanation: '"Take a screenshot" = chụp ảnh màn hình.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu cảnh báo an toàn mạng ĐÚNG ngữ pháp:',
      options: [
        'No share your password with strangers!',
        "Don't share your password with strangers!",
        'Not sharing your password with strangers!',
        'Does not share your password!',
      ],
      correct: 1,
      explanation: 'Câu mệnh lệnh phủ định dùng "Don\'t + động từ nguyên mẫu".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng với danh từ "software":',
      options: [
        'We installed two useful softwares.',
        'This software is very useful.',
        'A software helps us learn fast.',
        'These softwares are free.',
      ],
      correct: 1,
      explanation: '"Software" là danh từ không đếm được nên chia động từ số ít "is" và không thêm "-s".',
    },
    {
      skill: 'vocab',
      question: 'Kết nối không dây tầm ngắn để ghép đôi tai nghe với điện thoại gọi là:',
      options: ['Keyboard', 'Bluetooth', 'Hardware', 'Email'],
      correct: 1,
      explanation: '"Bluetooth" dùng để kết nối tai nghe, loa không dây tầm gần.',
    },
    {
      skill: 'usage',
      question: 'Điện thoại chỉ còn 5% pin. Câu nói tự nhiên nhất là:',
      options: [
        'My phone battery is almost empty. I need to charge it.',
        'My phone keyboard is hungry.',
        'My phone cloud is spicy.',
        'I must upload my battery.',
      ],
      correct: 0,
      explanation: '"battery is almost empty / low" = pin sắp hết.',
    },
    {
      skill: 'vocab',
      question: 'Trái ngược với "software" (phần mềm) là:',
      options: ['Website', 'Hardware', 'Internet', 'App'],
      correct: 1,
      explanation: '"Hardware" = phần cứng (màn hình, bàn phím, linh kiện máy tính).',
    },
    {
      skill: 'listening',
      audioText: 'Please update the app and save your files on the cloud.',
      question: 'Nghe và chọn hai việc được nhắc làm:',
      options: [
        'Cập nhật ứng dụng và lưu tệp lên đám mây',
        'Mua bàn phím mới và tắt Wi-Fi',
        'Đổi mật khẩu và chụp ảnh màn hình',
        'Xoá email và gọi điện thoại',
      ],
      correct: 0,
      explanation: '"update the app" = cập nhật ứng dụng; "save your files on the cloud" = lưu tệp lên đám mây.',
    },
    {
      skill: 'listening',
      audioText: 'Connect your headphones using Bluetooth.',
      question: 'Nghe và chọn cách kết nối tai nghe:',
      options: ['Qua dây cáp', 'Qua Bluetooth', 'Qua Wi-Fi', 'Qua email'],
      correct: 1,
      explanation: '"using Bluetooth" = dùng kết nối Bluetooth.',
    },
  ],
};

export default TECHNOLOGY_LESSON;
