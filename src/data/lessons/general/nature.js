// Track: general — Unit int-u7 · Thiên nhiên (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const NATURE_LESSON = {
  id: 'nature',
  contentVersion: 2,
  track: 'general',
  level: 'intermediate',
  cefrLevel: 'A2',
  unit: 'int-u7',
  title: 'Thiên nhiên',
  description: 'Mô tả cảnh quan thiên nhiên, hệ sinh thái và so sánh đặc điểm địa lý',
  icon: '🌳',
  objectives: [
    'Gọi tên 20 từ vựng về địa hình, cảnh quan và sinh vật trong tự nhiên',
    'Dùng đúng câu so sánh hơn (-er than / more … than) khi đối chiếu hai địa điểm',
    'Dùng đúng câu so sánh nhất (the -est / the most …) để nêu điểm nổi bật nhất',
  ],

  vocabulary: [
    v('Mountain', '/ˈmaʊntən/', 'noun', 'Ngọn núi', 'Fansipan is the highest mountain in Vietnam.', 'Fansipan là ngọn núi cao nhất ở Việt Nam.', '⛰️'),
    v('River', '/ˈrɪvər/', 'noun', 'Con sông', 'The Mekong River flows through Can Tho.', 'Sông Mê Kông chảy qua Cần Thơ.', '🏞️'),
    v('Ocean', '/ˈoʊʃən/', 'noun', 'Đại dương', 'The ocean looks deeper than the lake.', 'Đại dương trông sâu hơn mặt hồ.', '🌊'),
    v('Forest', '/ˈfɔːrɪst/', 'noun', 'Khu rừng', 'Cool fresh air fills the green forest.', 'Không khí mát lành tràn ngập khu rừng xanh.', '🌲'),
    v('Flower', '/ˈflaʊər/', 'noun', 'Bông hoa', 'Wild flowers bloom along the trail.', 'Hoa dại nở dọc theo con đường mòn.', '🌺'),
    v('Tree', '/triː/', 'noun', 'Cái cây', 'Tall ancient trees shade the path.', 'Những cây cổ thụ cao toả bóng mát cho lối đi.', '🌳'),
    v('Bird', '/bɜːrd/', 'noun', 'Con chim', 'Bright forest birds sing at sunrise.', 'Những chú chim rừng rực rỡ hót lúc bình minh.', '🐦'),
    v('Fish', '/fɪʃ/', 'noun', 'Con cá', 'Colorful fish swim near the reef.', 'Những chú cá đầy màu sắc bơi gần rạn san hô.', '🐟'),
    v('Butterfly', '/ˈbʌtərflaɪ/', 'noun', 'Con bướm', 'A yellow butterfly landed on a flower.', 'Một con bướm vàng đậu lên bông hoa.', '🦋'),
    v('Sky', '/skaɪ/', 'noun', 'Bầu trời', 'The evening sky turned soft orange.', 'Bầu trời buổi chiều chuyển sang sắc cam dịu.', '🌌'),
    v('Waterfall', '/ˈwɔːtərfɔːl/', 'noun', 'Thác nước', 'We hiked to a cool mountain waterfall.', 'Chúng mình leo núi tới một thác nước mát lạnh.', '🌊'),
    v('Desert', '/ˈdezərt/', 'noun', 'Sa mạc', 'A desert is much drier than a forest.', 'Sa mạc khô hơn rừng rất nhiều.', '🏜️'),
    v('Island', '/ˈaɪlənd/', 'noun', 'Hòn đảo', 'Phu Quoc is a sunny green island.', 'Phú Quốc là một hòn đảo xanh ngập nắng.', '🏝️'),
    v('Cave', '/keɪv/', 'noun', 'Hang động', 'Phong Nha has an enormous limestone cave.', 'Phong Nha có hang động đá vôi khổng lồ.', '🪨'),
    v('Volcano', '/vɑːlˈkeɪnoʊ/', 'noun', 'Núi lửa', 'An old volcano shaped that rocky island.', 'Một ngọn núi lửa cổ đã tạo nên hòn đảo đá đó.', '🌋'),
    v('Rainbow', '/ˈreɪnboʊ/', 'noun', 'Cầu vồng', 'A bright rainbow appeared after the shower.', 'Một chiếc cầu vồng rực rỡ hiện ra sau cơn mưa rào.', '🌈'),
    v('Valley', '/ˈvæli/', 'noun', 'Thung lũng', 'A peaceful valley lies between two hills.', 'Một thung lũng yên bình nằm giữa hai ngọn đồi.', '🏔️'),
    v('Cliff', '/klɪf/', 'noun', 'Vách đá dựng đứng', 'Stay back from the steep rocky cliff.', 'Hãy đứng lùi lại khỏi vách đá dốc nhé.', '🪨'),
    v('Pebble', '/ˈpebəl/', 'noun', 'Viên sỏi nhẵn', 'Smooth white pebbles cover the stream bed.', 'Những viên sỏi trắng nhẵn phủ kín lòng suối.', '🪨'),
    v('Coral', '/ˈkɔːrəl/', 'noun', 'San hô', 'Healthy coral reefs shelter many sea creatures.', 'Rạn san hô khoẻ mạnh che chở cho nhiều sinh vật biển.', '🪸'),
  ],

  grammar: [
    {
      title: 'So sánh hơn (Comparative): adj-er than & more + adj + than',
      explanation: 'Với tính từ ngắn (1 âm tiết, hoặc 2 âm tiết tận cùng -y), thêm "-er" + "than" (higher, deeper, drier, hotter — nhân đôi phụ âm cuối ở hot → hotter, big → bigger). Với tính từ dài (≥2 âm tiết), dùng "more + adj + than".',
      examples: [
        { en: 'The mountain is higher than the hill.', vi: 'Ngọn núi cao hơn ngọn đồi.' },
        { en: 'The ocean is much deeper than the river.', vi: 'Đại dương sâu hơn con sông rất nhiều.' },
        { en: 'A desert is hotter and drier than a valley.', vi: 'Sa mạc nóng hơn và khô hơn thung lũng.' },
        { en: 'The waterfall is more spectacular than I expected.', vi: 'Thác nước ngoạn mục hơn mình tưởng.' },
      ],
      mistakes: [
        { wrong: 'The ocean is more deep than the lake.', right: 'The ocean is deeper than the lake.', note: '"Deep" là tính từ ngắn (1 âm tiết) nên dùng "deeper", không dùng "more deep".' },
        { wrong: 'This mountain is more higher than that one.', right: 'This mountain is higher than that one.', note: 'Không bao giờ ghép cả "more" lẫn "-er" cùng lúc.' },
      ],
    },
    {
      title: 'So sánh nhất (Superlative): the adj-est & the most + adj',
      explanation: 'Khi so sánh từ 3 đối tượng trở lên, luôn có "the" ở trước: "the + adj-est" cho tính từ ngắn (the highest, the deepest, the largest) và "the most + adj" cho tính từ dài (the most beautiful).',
      examples: [
        { en: 'Son Doong is the largest cave we know.', vi: 'Sơn Đoòng là hang động lớn nhất chúng ta biết.' },
        { en: 'This valley is the most peaceful place here.', vi: 'Thung lũng này là nơi yên bình nhất ở đây.' },
        { en: 'Spring is the nicest season for wild flowers.', vi: 'Mùa xuân là mùa đẹp nhất cho hoa dại.' },
        { en: 'That rocky cliff gives the widest view of the sea.', vi: 'Vách đá kia cho tầm nhìn rộng nhất ra biển.' },
      ],
      mistakes: [
        { wrong: 'Fansipan is highest mountain in Vietnam.', right: 'Fansipan is the highest mountain in Vietnam.', note: 'So sánh nhất luôn cần mạo từ "the" đứng trước: "the highest".' },
      ],
    },
  ],

  reading: {
    title: 'Cuốn sổ ảnh thiên nhiên Việt Nam',
    passage: [
      'Lan: Look at my uncle\'s nature album, Minh! This photo shows a tall mountain rising above a green valley and a deep forest.',
      'Minh: Wow! Look at that waterfall pouring over smooth pebbles into the clear river below.',
      'Lan: On the next page, there is a bright rainbow across the sky near a huge limestone cave.',
      'Minh: Which place is more colorful—the forest with wild flowers, trees, birds, and butterflies, or the island?',
      'Lan: The sunny island! Beneath the blue ocean, coral reefs shelter tiny fish—way cooler than a dry desert!',
    ].join('\n'),
    translation: [
      'Lan: Nhìn cuốn sổ ảnh thiên nhiên của chú mình kìa, Minh! Bức này chụp một ngọn núi cao vươn lên trên thung lũng xanh và khu rừng sâu.',
      'Minh: Ôi! Nhìn thác nước kia đổ xuống những viên sỏi nhẵn vào dòng sông trong bên dưới kìa.',
      'Lan: Sang trang sau còn có cầu vồng rực rỡ ngang bầu trời gần một hang động đá vôi khổng lồ.',
      'Minh: Nơi nào nhiều màu sắc hơn—khu rừng có hoa dại, cây cối, chim và bướm, hay hòn đảo?',
      'Lan: Hòn đảo ngập nắng chứ! Dưới đại dương xanh, rạn san hô che chở cho những chú cá nhỏ—mát mẻ hơn sa mạc khô cằn nhiều!',
    ].join('\n'),
    highlights: ['Mountain', 'Valley', 'Forest', 'Waterfall', 'Pebble', 'River', 'Rainbow', 'Sky', 'Cave', 'Flower', 'Tree', 'Bird', 'Butterfly', 'Island', 'Ocean', 'Coral', 'Fish', 'Desert'],
    questions: [
      {
        question: 'Cuốn sổ ảnh thiên nhiên mà Lan cho Minh xem là của ai?',
        options: ['Của thầy Tom', 'Của chú Lan', 'Của anh trai Minh', 'Của thư viện trường'],
        correct: 1,
        explanation: 'Lan nói: "Look at my uncle\'s nature album, Minh!"',
      },
      {
        question: 'Trong bức ảnh thứ hai, cầu vồng hiện ra ở gần đâu?',
        options: ['Gần một ngọn núi lửa', 'Gần một hang động đá vôi khổng lồ', 'Giữa sa mạc khô cằn', 'Trên vách đá ven biển'],
        correct: 1,
        explanation: 'Lan mô tả: "a bright rainbow across the sky near a huge limestone cave."',
      },
      {
        question: 'Lan chọn nơi nào nhiều màu sắc hơn?',
        options: ['Sa mạc', 'Hòn đảo ngập nắng', 'Thung lũng', 'Hang động'],
        correct: 1,
        explanation: 'Lan trả lời ngay: "The sunny island! Beneath the blue ocean, coral reefs shelter tiny fish".',
      },
      {
        question: 'Rạn san hô dưới đại dương có vai trò gì theo lời Lan?',
        options: ['Làm nước ấm hơn', 'Che chở cho những chú cá nhỏ', 'Tạo ra cầu vồng', 'Chặn dòng thác nước'],
        correct: 1,
        explanation: '"coral reefs shelter tiny fish" = rạn san hô che chở cho các chú cá nhỏ.',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: '"Valley" là vùng địa hình nào?',
      options: ['Đỉnh núi lửa', 'Thung lũng nằm giữa các đồi núi', 'Vách đá ven biển', 'Rạn san hô'],
      correct: 1,
      explanation: '"Valley" nghĩa là thung lũng.',
    },
    {
      skill: 'vocab',
      question: 'Những viên đá nhỏ, tròn nhẵn dọc bờ suối gọi là:',
      options: ['Cliffs', 'Caves', 'Pebbles', 'Coral'],
      correct: 2,
      explanation: '"Pebble" = viên sỏi nhỏ nhẵn.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu so sánh hơn ĐÚNG:',
      options: [
        'The ocean is more deep than the river.',
        'The ocean is deeper than the river.',
        'The ocean is deepest than the river.',
        'The ocean is more deeper than the river.',
      ],
      correct: 1,
      explanation: '"Deep" là tính từ 1 âm tiết → so sánh hơn là "deeper than".',
    },
    {
      skill: 'grammar',
      question: 'Điền dạng đúng: "A desert is ___ than a forest." (khô hơn)',
      options: ['dryer', 'drier', 'more dry', 'driest'],
      correct: 1,
      explanation: 'Tính từ "dry" tận cùng phụ âm + "y" đổi thành "-ier": "drier".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu so sánh nhất ĐÚNG:',
      options: [
        'This waterfall is most beautiful in the region.',
        'This waterfall is the most beautiful in the region.',
        'This waterfall is the beautifullest in the region.',
        'This waterfall is more beautiful in the region.',
      ],
      correct: 1,
      explanation: 'Tính từ dài ở so sánh nhất cần "the most + adj": "the most beautiful".',
    },
    {
      skill: 'vocab',
      question: 'Cầu vồng thường xuất hiện sau cơn mưa có tên tiếng Anh là:',
      options: ['Waterfall', 'Rainbow', 'Volcano', 'Island'],
      correct: 1,
      explanation: '"Rainbow" = cầu vồng.',
    },
    {
      skill: 'usage',
      question: 'Bạn đi leo núi cùng bạn bè và thấy một vách đá rất dốc phía trước. Bạn cảnh báo:',
      options: [
        'Stay back from the steep cliff!',
        'Swim near the coral desert!',
        'The pebble is taller than the sky!',
        'Look at the butterfly cave!',
      ],
      correct: 0,
      explanation: '"Stay back from the steep cliff!" = Hãy đứng lùi khỏi vách đá dốc!',
    },
    {
      skill: 'listening',
      audioText: 'A peaceful valley lies between two green mountains.',
      question: 'Nghe và chọn địa hình nằm giữa hai ngọn núi xanh:',
      options: ['Một sa mạc nóng', 'Một thung lũng yên bình', 'Một hang động tối', 'Một hòn đảo nhỏ'],
      correct: 1,
      explanation: '"A peaceful valley" = một thung lũng yên bình.',
    },
    {
      skill: 'listening',
      audioText: 'The ocean is much deeper than the lake.',
      question: 'Nghe và chọn câu so sánh đúng:',
      options: [
        'Đại dương sâu hơn hồ rất nhiều.',
        'Hồ sâu hơn đại dương.',
        'Hồ và đại dương sâu bằng nhau.',
        'Thác nước cao hơn đại dương.',
      ],
      correct: 0,
      explanation: '"much deeper than the lake" = sâu hơn hồ rất nhiều.',
    },
  ],
};

export default NATURE_LESSON;
