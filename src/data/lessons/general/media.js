// Track: general — Unit int-u9 · Truyền thông & Mạng xã hội (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const MEDIA_LESSON = {
  id: 'media',
  contentVersion: 2,
  track: 'general',
  level: 'advanced',
  cefrLevel: 'B1',
  unit: 'int-u9',
  title: 'Truyền thông & Mạng xã hội',
  description: 'Đọc tin tức có chọn lọc, tường thuật lại thông tin và bảo vệ quyền riêng tư trực tuyến',
  icon: '📰',
  objectives: [
    'Sử dụng 20 từ vựng chủ đề báo chí, truyền thông số, tin giả và an toàn trực tuyến',
    'Thuật lại lời nói bằng Câu tường thuật (Reported Speech: said / told me that + lùi thì)',
    'Nối câu mạch lạc bằng Mệnh đề quan hệ (who cho người, which/that cho vật)',
  ],

  vocabulary: [
    v('News', '/nuːz/', 'noun', 'Tin tức (danh từ không đếm được)', 'Good news travels quickly among friends.', 'Tin tốt lan truyền rất nhanh giữa bạn bè.', '📰'),
    v('Article', '/ˈɑːrtɪkəl/', 'noun', 'Bài báo', 'Read the whole article, not just the title.', 'Hãy đọc cả bài báo, đừng chỉ đọc tiêu đề.', '📄'),
    v('Reporter', '/rɪˈpɔːrtər/', 'noun', 'Phóng viên', 'A careful reporter checks every source.', 'Một phóng viên cẩn thận luôn kiểm tra mọi nguồn tin.', '🎤'),
    v('Broadcast', '/ˈbrɔːdkæst/', 'verb', 'Phát sóng', 'The local channel will broadcast the festival live.', 'Kênh địa phương sẽ phát sóng trực tiếp lễ hội.', '📡'),
    v('Social media', '/ˈsoʊʃəl ˈmiːdiə/', 'noun', 'Mạng xã hội', 'Social media helps classmates share study tips.', 'Mạng xã hội giúp bạn cùng lớp chia sẻ mẹo học tập.', '📱'),
    v('Follower', '/ˈfɑːloʊər/', 'noun', 'Người theo dõi', 'The science page gained many young followers.', 'Trang khoa học thu hút nhiều người theo dõi trẻ.', '👥'),
    v('Post', '/poʊst/', 'verb', 'Đăng bài', 'Think carefully before you post personal photos.', 'Suy nghĩ kỹ trước khi bạn đăng ảnh cá nhân.', '📝'),
    v('Share', '/ʃer/', 'verb', 'Chia sẻ', 'Verify facts before you share an online story.', 'Kiểm chứng sự thật trước khi chia sẻ câu chuyện trên mạng.', '🔗'),
    v('Trending', '/ˈtrendɪŋ/', 'adjective', 'Đang thịnh hành, xu hướng', 'That study-hack video is trending today.', 'Video mẹo học tập đó đang thịnh hành hôm nay.', '📈'),
    v('Comment', '/ˈkɑːment/', 'noun', 'Lời bình luận', 'Write a respectful comment under the post.', 'Hãy viết lời bình luận tôn trọng dưới bài đăng.', '💬'),
    v('Subscribe', '/səbˈskraɪb/', 'verb', 'Đăng ký theo dõi kênh', 'I subscribed to two English listening channels.', 'Mình đã đăng ký hai kênh luyện nghe tiếng Anh.', '🔔'),
    v('Content', '/ˈkɑːntent/', 'noun', 'Nội dung', 'Helpful content makes learning enjoyable.', 'Nội dung hữu ích khiến việc học trở nên thú vị.', '📋'),
    v('Viral', '/ˈvaɪrəl/', 'adjective', 'Lan truyền nhanh chóng', 'Her clever drawing clip went viral overnight.', 'Đoạn phim vẽ tranh thông minh của bạn ấy lan truyền chỉ sau một đêm.', '🔥'),
    v('Headline', '/ˈhedlaɪn/', 'noun', 'Tiêu đề bài báo', 'Dramatic headlines can sometimes be misleading.', 'Những tiêu đề giật gân đôi khi có thể gây hiểu lầm.', '📌'),
    v('Podcast', '/ˈpɑːdkæst/', 'noun', 'Chương trình âm thanh podcast', 'Minh listens to a short podcast while walking.', 'Minh nghe một podcast ngắn trong lúc đi bộ.', '🎧'),
    v('Privacy', '/ˈprɪvəsi/', 'noun', 'Quyền riêng tư', 'Adjust your privacy settings on every platform.', 'Điều chỉnh cài đặt quyền riêng tư trên mọi nền tảng.', '🔒'),
    v('Fake news', '/feɪk nuːz/', 'noun', 'Tin giả', 'Check reliable websites to spot fake news.', 'Kiểm tra các trang uy tín để phát hiện tin giả.', '⚠️'),
    v('Notification', '/ˌnoʊtɪfɪˈkeɪʃən/', 'noun', 'Thông báo trên máy', 'Mute phone notifications while doing homework.', 'Tắt thông báo điện thoại trong lúc làm bài tập.', '🔔'),
    v('Platform', '/ˈplætfɔːrm/', 'noun', 'Nền tảng số', 'Choose a safe platform for online classes.', 'Chọn một nền tảng an toàn cho lớp học trực tuyến.', '📲'),
    v('Digital', '/ˈdɪdʒɪtəl/', 'adjective', 'Kỹ thuật số', 'Digital literacy is vital for modern students.', 'Hiểu biết kỹ thuật số rất quan trọng với học sinh hiện đại.', '💻'),
  ],

  grammar: [
    {
      title: 'Câu tường thuật (Reported Speech): said / told + người + that + lùi thì',
      explanation: 'Khi thuật lại lời ai đó đã nói, lùi động từ về một bậc quá khứ (is → was, like → liked, will → would). Phân biệt: "said (that)…" (KHÔNG có tân ngữ người ngay sau), còn "told + người + (that)…" (BẮT BUỘC có người nghe).',
      examples: [
        { en: 'Lan said that the headline looked suspicious.', vi: 'Lan nói rằng tiêu đề bài báo trông đáng ngờ.' },
        { en: 'Ms. Hoa told us that fake news spreads quickly.', vi: 'Cô Hoa nói với chúng mình rằng tin giả lan rất nhanh.' },
        { en: 'Minh said he would mute his notifications.', vi: 'Minh nói rằng cậu ấy sẽ tắt thông báo.' },
        { en: 'The reporter told viewers that the show was live.', vi: 'Phóng viên nói với khán giả rằng chương trình đang phát trực tiếp.' },
      ],
      mistakes: [
        { wrong: 'He said me that the article was fake.', right: 'He told me that the article was fake.', note: 'Khi có tân ngữ người nghe ("me"), phải dùng "told me", không dùng "said me".' },
        { wrong: 'The news are very interesting today.', right: 'The news is very interesting today.', note: '"News" dù tận cùng bằng "-s" nhưng là danh từ không đếm được số ít → dùng "is".' },
      ],
    },
    {
      title: 'Mệnh đề quan hệ (Relative Clauses): who, which, that',
      explanation: 'Dùng "who" (hoặc "that") để bổ sung thông tin cho NGƯỜI, và dùng "which" (hoặc "that") cho VẬT / SỰ VIỆC. Nhờ mệnh đề quan hệ, hai câu ngắn được gộp thành một câu tự nhiên hơn.',
      examples: [
        { en: 'The reporter who wrote this article verified every fact.', vi: 'Phóng viên viết bài báo này đã kiểm chứng mọi dữ kiện.' },
        { en: 'The podcast which Minh recommended is very clear.', vi: 'Chương trình podcast mà Minh gợi ý rất rõ ràng.' },
        { en: 'Avoid platforms that ignore user privacy.', vi: 'Hãy tránh những nền tảng phớt lờ quyền riêng tư người dùng.' },
        { en: 'Students who mute notifications focus much better.', vi: 'Học sinh tắt thông báo sẽ tập trung tốt hơn nhiều.' },
      ],
      mistakes: [
        { wrong: 'The reporter which interviewed Lan was kind.', right: 'The reporter who interviewed Lan was kind.', note: '"Reporter" là người nên phải dùng "who" (hoặc "that"), không dùng "which".' },
      ],
    },
  ],

  reading: {
    title: 'Kiểm chứng tin tức trên mạng xã hội',
    passage: [
      'Minh: Lan, look at this trending post on social media! The headline says schools will close next week. It went viral!',
      'Lan: Wait—do not share it yet! Ms. Hoa told us that fake news often uses dramatic headlines.',
      'Minh: Let me read the full article. Hmm, there is no real reporter or trusted news channel listed.',
      'Lan: Exactly! Good digital habits mean checking the platform and the content before leaving a comment.',
      'Minh: You are right. I prefer the science podcast that Mr. Tom recommended—I already subscribed!',
      'Lan: Smart move! Also check your privacy settings and mute notifications while studying.',
    ].join('\n'),
    translation: [
      'Minh: Lan ơi, nhìn bài đăng đang thịnh hành trên mạng xã hội này kìa! Tiêu đề nói tuần sau trường sẽ đóng cửa. Nó lan truyền nhanh lắm!',
      'Lan: Khoan đã—đừng chia sẻ vội! Cô Hoa đã dặn tụi mình rằng tin giả thường dùng tiêu đề giật gân.',
      'Minh: Để mình đọc cả bài báo xem. Ừm, chẳng có tên phóng viên thật hay kênh tin tức uy tín nào được ghi cả.',
      'Lan: Chính xác! Thói quen số tốt là kiểm tra nền tảng và nội dung trước khi để lại bình luận.',
      'Minh: Bạn nói đúng. Mình thích podcast khoa học mà thầy Tom gợi ý hơn—mình đã đăng ký theo dõi rồi!',
      'Lan: Rất thông minh! Nhớ kiểm tra cài đặt quyền riêng tư và tắt thông báo khi đang học bài nhé.',
    ].join('\n'),
    highlights: ['Trending', 'Post', 'Headline', 'Viral', 'Share', 'Article', 'Reporter', 'News', 'Digital', 'Platform', 'Content', 'Comment', 'Podcast', 'Subscribe', 'Privacy', 'Notification'],
    questions: [
      {
        question: 'Bài đăng lan truyền trên mạng xã hội mà Minh thấy có nội dung gì?',
        options: ['Giới thiệu podcast khoa học mới', 'Nói rằng các trường học sẽ đóng cửa tuần sau', 'Hướng dẫn cài đặt quyền riêng tư', 'Kêu gọi tham gia Ngày Xanh'],
        correct: 1,
        explanation: 'Minh kể: "The headline says schools will close next week."',
      },
      {
        question: 'Minh nhận ra dấu hiệu nào cho thấy bài viết đó không đáng tin?',
        options: [
          'Bài viết quá dài',
          'Không có tên phóng viên thật hay kênh tin tức uy tín nào',
          'Không có ai bình luận',
          'Không có hình ảnh đi kèm',
        ],
        correct: 1,
        explanation: 'Minh đọc kỹ và thấy: "there is no real reporter or trusted news channel listed."',
      },
      {
        question: 'Minh đã đăng ký theo dõi nội dung nào theo gợi ý của thầy Tom?',
        options: ['Một kênh tin giải trí', 'Một chương trình podcast khoa học', 'Một trang bán hàng trực tuyến', 'Một kênh phát sóng thể thao'],
        correct: 1,
        explanation: 'Minh nói: "I prefer the science podcast that Mr. Tom recommended—I already subscribed!"',
      },
      {
        question: 'Cuối đoạn, Lan nhắc Minh làm hai việc gì để học tốt và an toàn hơn?',
        options: [
          'Đăng thêm ảnh và tăng người theo dõi',
          'Kiểm tra cài đặt quyền riêng tư và tắt thông báo khi học',
          'Xoá toàn bộ ứng dụng trên máy',
          'Bình luận dưới mọi bài đăng',
        ],
        correct: 1,
        explanation: 'Lan nhắc: "check your privacy settings and mute notifications while studying."',
      },
    ],
  },

  quiz: [
    {
      skill: 'grammar',
      question: 'Chọn câu tường thuật ĐÚNG:',
      options: [
        'Ms. Hoa said us that the news was fake.',
        'Ms. Hoa told us that the news was fake.',
        'Ms. Hoa told that the news was fake.',
        'Ms. Hoa said to that the news was fake.',
      ],
      correct: 1,
      explanation: 'Khi có người nghe ("us"), dùng "told us that…".',
    },
    {
      skill: 'grammar',
      question: 'Chọn đại từ quan hệ đúng: "The reporter ___ wrote this article checked every source."',
      options: ['which', 'who', 'where', 'when'],
      correct: 1,
      explanation: '"The reporter" chỉ người nên dùng "who".',
    },
    {
      skill: 'grammar',
      question: 'Chọn động từ chia ĐÚNG cho danh từ "news":',
      options: [
        'The news on this website are helpful.',
        'The news on this website is helpful.',
        'A news on this website is helpful.',
        'Many news are trending today.',
      ],
      correct: 1,
      explanation: '"News" luôn là danh từ không đếm được số ít → chia với "is".',
    },
    {
      skill: 'vocab',
      question: 'Khi một đoạn video lan truyền cực nhanh tới hàng triệu người xem, ta nói nó:',
      options: ['went viral', 'went offline', 'went private', 'went silent'],
      correct: 0,
      explanation: '"Go viral" = lan truyền nhanh chóng trên mạng.',
    },
    {
      skill: 'vocab',
      question: 'Dòng chữ lớn in đậm ở đầu mỗi bài báo gọi là:',
      options: ['Comment', 'Headline', 'Podcast', 'Follower'],
      correct: 1,
      explanation: '"Headline" = tiêu đề bài báo.',
    },
    {
      skill: 'usage',
      question: 'Bạn thấy một tin gây sốc trên mạng nhưng chưa rõ nguồn gốc. Hành động khôn ngoan nhất là:',
      options: [
        'Verify the source before you share the article.',
        'Share the headline immediately without reading.',
        'Post your home address in the comments.',
        'Turn off all privacy settings.',
      ],
      correct: 0,
      explanation: '"Verify the source before you share" = kiểm chứng nguồn tin trước khi chia sẻ.',
    },
    {
      skill: 'vocab',
      question: '"Mute notifications while studying" nghĩa là:',
      options: ['Tắt tiếng thông báo trong lúc học', 'Bật phát sóng trực tiếp', 'Xoá hồ sơ cá nhân', 'Viết bài báo mới'],
      correct: 0,
      explanation: '"Notification" = thông báo trên điện thoại/máy tính.',
    },
    {
      skill: 'listening',
      audioText: 'Lan said that the viral post looked like fake news.',
      question: 'Nghe và chọn nhận xét của Lan về bài đăng lan truyền:',
      options: ['Trông giống tin giả', 'Rất hữu ích cho môn Toán', 'Do thầy Tom viết', 'Là một podcast hay'],
      correct: 0,
      explanation: '"looked like fake news" = trông giống tin giả.',
    },
    {
      skill: 'listening',
      audioText: 'Protect your online privacy by checking your settings.',
      question: 'Nghe và chọn lời khuyên an toàn số:',
      options: [
        'Bảo vệ quyền riêng tư trực tuyến bằng cách kiểm tra cài đặt',
        'Đăng nhiều bài hơn mỗi ngày',
        'Đăng ký thật nhiều kênh quảng cáo',
        'Không bao giờ đọc tin tức',
      ],
      correct: 0,
      explanation: '"Protect your online privacy" = bảo vệ quyền riêng tư trực tuyến.',
    },
  ],
};

export default MEDIA_LESSON;
