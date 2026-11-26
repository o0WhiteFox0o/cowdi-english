// Track: general — Unit int-u9 · Văn hóa & Lễ hội (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const CULTURE_LESSON = {
  id: 'culture',
  contentVersion: 2,
  track: 'general',
  level: 'advanced',
  cefrLevel: 'B1',
  unit: 'int-u9',
  title: 'Văn hóa & Lễ hội',
  description: 'Giới thiệu di sản, phong tục, ẩm thực và lễ hội truyền thống bằng Hiện tại Hoàn thành và Used to',
  icon: '🎭',
  objectives: [
    'Giới thiệu văn hoá, lễ hội, ẩm thực và nghệ thuật thủ công bằng 20 từ vựng cốt lõi',
    'Dùng Hiện tại Hoàn thành (have/has + V3) để kể trải nghiệm văn hoá cho đến hiện tại',
    'Dùng "used to + V" để so sánh thói quen, phong tục xưa và nay',
  ],

  vocabulary: [
    v('Culture', '/ˈkʌltʃər/', 'noun', 'Văn hoá', 'Traveling helps us appreciate every culture.', 'Du lịch giúp chúng ta trân trọng mỗi nền văn hoá.', '🎭'),
    v('Tradition', '/trəˈdɪʃən/', 'noun', 'Truyền thống', 'Making banh chung is a warm family tradition.', 'Gói bánh chưng là một truyền thống gia đình ấm áp.', '🏮'),
    v('Festival', '/ˈfestɪvəl/', 'noun', 'Lễ hội', 'The Mid-Autumn Festival delights children everywhere.', 'Tết Trung Thu làm trẻ em khắp nơi thích thú.', '🎉'),
    v('Ceremony', '/ˈserəmoʊni/', 'noun', 'Nghi lễ', 'The tea ceremony teaches patience and respect.', 'Nghi lễ trà đạo dạy sự kiên nhẫn và tôn trọng.', '🍵'),
    v('Costume', '/ˈkɑːstuːm/', 'noun', 'Trang phục (truyền thống/lễ hội)', 'Dancers wore colorful traditional costumes.', 'Các vũ công mặc trang phục truyền thống rực rỡ.', '👘'),
    v('Heritage', '/ˈherɪtɪdʒ/', 'noun', 'Di sản', 'Hoi An Old Town is a world heritage site.', 'Phố cổ Hội An là một di sản thế giới.', '🏛️'),
    v('Custom', '/ˈkʌstəm/', 'noun', 'Phong tục tập quán', 'Removing shoes indoors is a polite local custom.', 'Cởi giày khi vào nhà là phong tục lịch sự ở địa phương.', '🙇'),
    v('Language', '/ˈlæŋɡwɪdʒ/', 'noun', 'Ngôn ngữ', 'Learning a language opens doors to new customs.', 'Học một ngôn ngữ mở ra cánh cửa đến những phong tục mới.', '🗣️'),
    v('Cuisine', '/kwɪˈziːn/', 'noun', 'Ẩm thực', 'Vietnamese cuisine balances herbs, broth, and spice.', 'Ẩm thực Việt Nam cân bằng giữa rau thơm, nước dùng và gia vị.', '🍜'),
    v('Celebrate', '/ˈseləbreɪt/', 'verb', 'Ăn mừng, tổ chức kỷ niệm', 'Families gather to celebrate Lunar New Year.', 'Các gia đình sum họp để đón Tết Nguyên Đán.', '🥳'),
    v('Symbol', '/ˈsɪmbəl/', 'noun', 'Biểu tượng', 'The lotus flower is a symbol of purity.', 'Hoa sen là biểu tượng của sự thuần khiết.', '🪷'),
    v('Legend', '/ˈledʒənd/', 'noun', 'Truyền thuyết', 'Grandpa told us the legend of Hoan Kiem Lake.', 'Ông nội kể cho tụi mình nghe truyền thuyết Hồ Hoàn Kiếm.', '📜'),
    v('Diversity', '/daɪˈvɜːrsəti/', 'noun', 'Sự đa dạng', 'Cultural diversity enriches our shared world.', 'Sự đa dạng văn hoá làm phong phú thế giới chung của chúng ta.', '🌈'),
    v('Architecture', '/ˈɑːrkɪtektʃər/', 'noun', 'Kiến trúc', 'Ancient wooden architecture lines the narrow street.', 'Kiến trúc gỗ cổ kính chạy dọc con phố nhỏ.', '🏛️'),
    v('Craft', '/kræft/', 'noun', 'Nghề thủ công', 'Pottery is an age-old village craft.', 'Làm gốm là một nghề thủ công lâu đời của làng quê.', '🏺'),
    v('Ancestor', '/ˈænsestər/', 'noun', 'Tổ tiên', 'Families honor their ancestors during Tet.', 'Các gia đình tưởng nhớ tổ tiên trong dịp Tết.', '🕯️'),
    v('Folk', '/foʊk/', 'adjective', 'Thuộc dân gian', 'Folk music tells stories of river life.', 'Nhạc dân gian kể những câu chuyện về đời sống sông nước.', '🎶'),
    v('Parade', '/pəˈreɪd/', 'noun', 'Đoàn diễu hành', 'A lively lantern parade filled the square.', 'Một đoàn diễu hành đèn lồng sôi động tràn ngập quảng trường.', '🎊'),
    v('Calligraphy', '/kəˈlɪɡrəfi/', 'noun', 'Nghệ thuật thư pháp', 'People ask for calligraphy wishes at spring fairs.', 'Mọi người xin chữ thư pháp chúc năm mới ở hội xuân.', '✒️'),
    v('Lantern', '/ˈlæntərn/', 'noun', 'Đèn lồng', 'Glowing silk lanterns brighten the riverfront.', 'Những chiếc đèn lồng lụa toả sáng dọc bờ sông.', '🏮'),
  ],

  grammar: [
    {
      title: 'Hiện tại Hoàn thành (Present Perfect) kể trải nghiệm văn hoá',
      explanation: 'Dùng "have / has + V3" để kể trải nghiệm từ trước đến nay (không nêu mốc quá khứ cụ thể) hoặc truyền thống kéo dài từ xưa đến hiện tại (for centuries, for generations).',
      examples: [
        { en: 'Alex has visited three heritage sites in Vietnam.', vi: 'Alex đã tham quan ba địa điểm di sản ở Việt Nam.' },
        { en: 'Have you ever tried traditional Vietnamese cuisine?', vi: 'Bạn đã bao giờ thử ẩm thực truyền thống Việt Nam chưa?' },
        { en: 'Families have celebrated Tet for centuries.', vi: 'Các gia đình đã đón Tết qua hàng thế kỷ.' },
        { en: 'She has never seen a lantern parade before.', vi: 'Cô ấy chưa từng xem lễ diễu hành đèn lồng trước đây.' },
      ],
      mistakes: [
        { wrong: 'I have visit the national museum twice.', right: 'I have visited the national museum twice.', note: 'Sau "have / has" phải dùng quá khứ phân từ V3 ("visited"), không để nguyên mẫu.' },
        { wrong: 'She have tried lotus tea.', right: 'She has tried lotus tea.', note: 'Chủ ngữ số ít "She" đi với "has", không dùng "have".' },
      ],
    },
    {
      title: 'Used to + V nguyên mẫu (Thói quen trong quá khứ nay đã đổi)',
      explanation: 'Dùng "used to + V" để nói thói quen hoặc trạng thái từng phổ biến trong quá khứ nhưng nay không còn hoặc đã thay đổi. Phủ định: "didn\'t use to + V", câu hỏi: "Did … use to + V?" (bỏ -d khi có did).',
      examples: [
        { en: 'People used to make paper lanterns entirely by hand.', vi: 'Ngày xưa mọi người thường làm đèn lồng giấy hoàn toàn bằng tay.' },
        { en: 'This quiet museum used to be an old wooden house.', vi: 'Bảo tàng yên tĩnh này từng là một ngôi nhà gỗ cổ.' },
        { en: 'Did your grandparents use to celebrate Tet in the countryside?', vi: 'Ông bà bạn ngày xưa có thường đón Tết ở quê không?' },
        { en: "Children didn't use to watch folk songs on phones.", vi: 'Trẻ em ngày xưa không xem nhạc dân gian trên điện thoại.' },
      ],
      mistakes: [
        { wrong: 'People use to wear traditional costumes every day.', right: 'People used to wear traditional costumes every day.', note: 'Ở câu khẳng định quá khứ phải viết "used to" (có chữ -d).' },
        { wrong: 'Did they used to hold a parade here?', right: 'Did they use to hold a parade here?', note: 'Khi đã có trợ động từ "Did", viết "use to" (bỏ -d).' },
      ],
    },
  ],

  reading: {
    title: 'Giới thiệu nét đẹp Tết và lễ hội Việt Nam',
    passage: [
      'Alex: Lan, I have fallen in love with Vietnamese culture and cuisine! Have you celebrated many festivals here?',
      'Lan: Yes! My favorite is Tet, our Lunar New Year tradition. Families honor their ancestors, enjoy folk music, and ask artists for calligraphy wishes.',
      'Alex: That sounds meaningful! What about those glowing lanterns I saw in Hoi An?',
      'Lan: Hoi An is a famous heritage town with old wooden architecture. Villagers used to make every lantern by hand—a proud local craft!',
      'Alex: Did people also wear traditional costumes during the lantern parade?',
      'Lan: Yes! Each custom, symbol, and legend adds to our cultural diversity.',
    ].join('\n'),
    translation: [
      'Alex: Lan ơi, mình mê mẩn văn hoá và ẩm thực Việt Nam rồi! Bạn đã tham dự nhiều lễ hội ở đây chưa?',
      'Lan: Rồi chứ! Mình thích nhất là Tết Nguyên Đán, truyền thống đầu năm của tụi mình. Các gia đình tưởng nhớ tổ tiên, thưởng thức nhạc dân gian và xin chữ thư pháp chúc năm mới.',
      'Alex: Nghe thật ý nghĩa! Thế còn những chiếc đèn lồng rực rỡ mình thấy ở Hội An thì sao?',
      'Lan: Hội An là phố cổ di sản nổi tiếng với kiến trúc gỗ xưa. Người dân làng từng làm mọi chiếc đèn lồng hoàn toàn thủ công—một nghề truyền thống đáng tự hào!',
      'Alex: Mọi người cũng mặc trang phục truyền thống trong đoàn diễu hành đèn lồng phải không?',
      'Lan: Đúng rồi! Mỗi phong tục, biểu tượng và truyền thuyết đều góp phần tạo nên sự đa dạng văn hoá của chúng mình.',
    ].join('\n'),
    highlights: ['Culture', 'Cuisine', 'Celebrate', 'Festival', 'Tradition', 'Ancestor', 'Folk', 'Calligraphy', 'Lantern', 'Heritage', 'Architecture', 'Craft', 'Costume', 'Parade', 'Custom', 'Symbol', 'Legend', 'Diversity'],
    questions: [
      {
        question: 'Lễ hội yêu thích nhất của Lan là dịp nào?',
        options: ['Lễ hội hoa anh đào', 'Tết Nguyên Đán', 'Lễ hội mùa đông', 'Ngày hội thể thao'],
        correct: 1,
        explanation: 'Lan nói: "My favorite is Tet, our Lunar New Year tradition."',
      },
      {
        question: 'Trong dịp Tết, các gia đình thường làm những hoạt động nào theo lời Lan?',
        options: [
          'Đi cắm trại qua đêm trên núi',
          'Ở nhà chơi cờ vua suốt cả ngày',
          'Nhớ tổ tiên, nghe nhạc và xin chữ',
          'Tổ chức buổi triển lãm công nghệ',
        ],
        correct: 2,
        explanation: 'Lan kể: "Families honor their ancestors, enjoy folk music, and ask artists for calligraphy wishes."',
      },
      {
        question: 'Phố cổ Hội An nổi tiếng với đặc điểm nào được Lan nhắc tới?',
        options: ['Sân bay quốc tế lớn nhất khu vực', 'Các toà nhà chọc trời cao hiện đại', 'Những vùng sa mạc cát rộng mênh mông', 'Kiến trúc gỗ xưa và nghề làm đèn lồng'],
        correct: 3,
        explanation: 'Lan mô tả: "Hoi An is a famous heritage town with old wooden architecture. Villagers used to make every lantern by hand—a proud local craft!"',
      },
      {
        question: 'Câu nào mô tả đúng thái độ của Alex đối với văn hoá Việt Nam?',
        options: ['Yêu thích và hào hứng tìm hiểu', 'Thấy rất khó hiểu', 'Không quan tâm tới ẩm thực', 'Chỉ thích kiến trúc hiện đại'],
        correct: 0,
        explanation: 'Alex nói ngay đầu bài: "I have fallen in love with Vietnamese culture and cuisine!"',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Heritage" trong cụm "World Heritage site" nghĩa là:',
      options: ['Ẩm thực đường phố', 'Di sản văn hoá, tự nhiên', 'Đoàn diễu hành lễ hội', 'Nghệ thuật viết thư pháp'],
      correct: 1,
      explanation: '"Heritage" = di sản được truyền lại qua nhiều thế hệ.',
    },
    {
      skill: 'vocab',
      question: 'Nghệ thuật viết chữ đẹp bằng bút lông vào dịp xuân gọi là:',
      options: ['Architecture', 'Ceremony', 'Calligraphy', 'Legend'],
      correct: 2,
      explanation: '"Calligraphy" = nghệ thuật thư pháp.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu Hiện tại Hoàn thành ĐÚNG:',
      options: [
        'Alex have visited three heritage sites.',
        'Alex has visit three heritage sites.',
        'Alex has visiting three heritage sites.',
        'Alex has visited three heritage sites.',
      ],
      correct: 3,
      explanation: 'Chủ ngữ số ít "Alex" dùng "has + V3" ("has visited").',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu khẳng định ĐÚNG với "used to":',
      options: [
        'Villagers used to make lanterns by hand.',
        'Villagers use to make lanterns by hand.',
        'Villagers used to making lanterns by hand.',
        'Villagers are used to make lanterns ago.',
      ],
      correct: 0,
      explanation: 'Thói quen trong quá khứ: "used to + động từ nguyên mẫu".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu hỏi ĐÚNG với "used to":',
      options: [
        'Did people used to wear traditional costumes daily?',
        'Did people use to wear traditional costumes daily?',
        'Do people used to wear traditional costumes daily?',
        'Were people use to wear traditional costumes?',
      ],
      correct: 1,
      explanation: 'Sau "Did", động từ trở về nguyên mẫu "use to" (không có -d).',
    },
    {
      skill: 'vocab',
      question: '"Cuisine" dùng để chỉ lĩnh vực nào của một nền văn hoá?',
      options: ['Kiến trúc cổ', 'Âm nhạc dân gian', 'Ẩm thực truyền thống', 'Ngôn ngữ bản địa'],
      correct: 2,
      explanation: '"Cuisine" = nền ẩm thực (ví dụ: Vietnamese cuisine).',
    },
    {
      skill: 'usage',
      question: 'Một người bạn nước ngoài hỏi vì sao hoa sen hay xuất hiện trong tranh Việt Nam. Bạn giải thích:',
      options: [
        'The lotus is a calligraphy custom.',
        'The lotus is a ceremony of architecture.',
        'The lotus used to be a parade.',
        'The lotus is a symbol of purity in our culture.',
      ],
      correct: 3,
      explanation: '"a symbol of purity" = biểu tượng của sự thuần khiết.',
    },
    {
      skill: 'listening',
      audioText: 'Families gather to honor their ancestors during Tet.',
      question: 'Nghe và chọn ý nghĩa câu nói:',
      options: [
        'Các gia đình sum họp tưởng nhớ tổ tiên dịp Tết.',
        'Các gia đình đi xem diễu hành đèn lồng.',
        'Mọi người học viết thư pháp ở bảo tàng.',
        'Du khách thăm phố cổ Hội An.',
      ],
      correct: 0,
      explanation: '"honor their ancestors during Tet" = tưởng nhớ tổ tiên trong dịp Tết.',
    },
    {
      skill: 'listening',
      audioText: 'This quiet museum used to be an old wooden house.',
      question: 'Nghe và chọn thông tin về ngôi nhà bảo tàng này:',
      options: ['Nó sắp được xây mới', 'Nó từng là một ngôi nhà gỗ cổ', 'Nó là một nhà hàng nổi tiếng', 'Nó tổ chức lễ hội mỗi tuần'],
      correct: 1,
      explanation: '"used to be an old wooden house" = từng là một ngôi nhà gỗ cổ.',
    },
  ],
};

export default CULTURE_LESSON;
