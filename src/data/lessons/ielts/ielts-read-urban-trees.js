// Track: ielts — Unit ielts-unit-reading-v2 · The Quiet Work of Street Trees (contentVersion 2)
// Bài đọc do Cowdi tự viết mới hoàn toàn (không lấy từ nguồn có bản quyền).
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 5.

const PARAGRAPHS = [
  {
    label: 'A',
    en: 'For generations, rows of trees along city avenues were treated mainly as decoration, planted to soften rows of concrete and frame public squares. Today, urban planners increasingly view street trees as essential infrastructure rather than mere ornaments. As summers grow warmer in densely built districts, a healthy canopy performs physical tasks that engineered structures struggle to match at a reasonable cost.',
    vi: 'Qua nhiều thế hệ, hàng cây dọc các đại lộ thành phố chủ yếu được xem như vật trang trí, trồng để làm dịu những dãy bê tông và tôn dáng quảng trường công cộng. Ngày nay, các nhà quy hoạch đô thị ngày càng coi cây xanh đường phố là hạ tầng thiết yếu chứ không chỉ là đồ trang trí đơn thuần. Khi mùa hè trở nên nóng hơn ở các quận xây dựng dày đặc, một tán cây khoẻ mạnh thực hiện những nhiệm vụ vật lý mà các công trình nhân tạo khó sánh kịp với chi phí hợp lý.',
  },
  {
    label: 'B',
    en: 'The most immediate impact is local cooling. Broad leaves intercept direct sunlight before it reaches asphalt and brick, preventing pavements from storing excessive heat throughout the afternoon. At the same time, trees release moisture into the air through their foliage, creating a gentler microclimate for pedestrians and nearby shops. During heavy downpours, leaves and bark also slow falling rain, giving soil around the roots time to soak up runoff before it overwhelms street drains.',
    vi: 'Tác động tức thì nhất là làm mát cục bộ. Những tán lá rộng chắn ánh nắng trực tiếp trước khi chạm tới nhựa đường và gạch, ngăn vỉa hè tích tụ nhiệt quá mức suốt buổi chiều. Đồng thời, cây giải phóng hơi ẩm vào không khí qua tán lá, tạo ra vi khí hậu dễ chịu hơn cho người đi bộ và các cửa hàng gần đó. Trong những trận mưa lớn, lá và vỏ cây cũng làm chậm dòng mưa rơi, giúp đất quanh rễ có thời gian thấm nước chảy tràn trước khi nó làm quá tải cống đường phố.',
  },
  {
    label: 'C',
    en: 'Growing mature trees beside busy roads is nevertheless a technical challenge. Below ground, roots must compete for limited space with water pipes, electricity cables and compacted gravel that restricts air and water flow. When planting pits are too narrow, roots push upward and crack surrounding sidewalks, prompting costly repairs. Above ground, vehicle exhaust, road salt in cold climates and careless pruning can shorten a tree lifespan dramatically compared with specimens growing in open parks.',
    vi: 'Tuy vậy, việc nuôi cây trưởng thành bên cạnh những con đường đông đúc là một thách thức kỹ thuật. Dưới mặt đất, rễ cây phải tranh giành không gian hạn chế với ống nước, cáp điện và lớp sỏi nén chặt cản trở lưu thông không khí và nước. Khi hố trồng quá hẹp, rễ trồi lên trên và làm nứt vỉa hè xung quanh, kéo theo chi phí sửa chữa tốn kém. Trên mặt đất, khí thải xe cộ, muối rải đường ở vùng khí hậu lạnh và việc cắt tỉa cẩu thả có thể rút ngắn đáng kể tuổi thọ cây so với những cây mọc trong công viên rộng mở.',
  },
  {
    label: 'D',
    en: 'City foresters have also learned a hard lesson about variety. In the past, many municipalities lined entire neighbourhoods with a single fast-growing species because it created a uniform appearance and simplified buying from nurseries. Yet whenever a specialised pest or fungal disease arrived, whole streets lost their shade within a few seasons. Modern planting guidelines therefore favour a diverse mix of native and climate-tolerant species so that no single threat can wipe out an entire corridor.',
    vi: 'Các chuyên gia lâm nghiệp đô thị cũng đã rút ra một bài học đắt giá về sự đa dạng. Trong quá khứ, nhiều chính quyền địa phương trồng dọc cả khu phố bằng duy nhất một loài cây lớn nhanh vì nó tạo vẻ đồng đều và giúp việc mua từ vườn ươm đơn giản hơn. Thế nhưng mỗi khi sâu bệnh chuyên biệt hoặc nấm bệnh xuất hiện, cả con phố mất sạch bóng mát chỉ sau vài mùa. Vì thế, hướng dẫn trồng cây hiện đại ưu tiên kết hợp đa dạng các loài bản địa và loài chịu khí hậu tốt để không một mối đe doạ đơn lẻ nào có thể xoá sổ cả tuyến phố.',
  },
  {
    label: 'E',
    en: 'Ultimately, planting a sapling is only the beginning of the investment. Newly planted trees require regular watering during dry spells, protective guards against passing bicycles and periodic inspection as branches expand near overhead wires. While tree-planting ceremonies attract headlines, long-term care rarely receives the same public attention. Cities that treat maintenance budgets as permanent commitments, rather than optional extras, are the ones that enjoy thriving avenues decades later.',
    vi: 'Suy cho cùng, trồng một cây non mới chỉ là điểm khởi đầu của khoản đầu tư. Cây mới trồng cần được tưới nước đều đặn trong những đợt khô hạn, khung bảo vệ tránh xe đạp đi qua và kiểm tra định kỳ khi cành vươn gần đường dây trên cao. Trong khi các lễ phát động trồng cây dễ thu hút sự chú ý của báo chí, việc chăm sóc dài hạn hiếm khi nhận được sự quan tâm tương xứng từ công chúng. Những thành phố coi ngân sách bảo dưỡng là cam kết lâu dài, thay vì khoản chi phụ tuỳ chọn, mới là nơi được tận hưởng những hàng cây xanh tốt nhiều thập kỷ sau.',
  },
];

const HEADINGS = [
  'i. Why planting only one type of tree is risky',
  'ii. How trees improve comfort and manage rain',
  'iii. The hidden costs of caring for trees over time',
  'iv. Physical barriers to healthy tree growth in cities',
  'v. Why residents prefer decorative flowers to tall trees',
];

const v = (word, phonetic, pos, meaning, example, exampleVi) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration: '🌳' });

export const IELTS_READ_URBAN_TREES_LESSON = {
  id: 'ielts-read-urban-trees',
  contentVersion: 2,
  track: 'ielts',
  examTag: 'IELTS Academic Reading',
  level: 'upper-intermediate',
  ieltsBand: '6.0-7.0',
  cefrLevel: 'B2',
  skill: 'reading',
  title: 'IELTS Reading: The Quiet Work of Street Trees',
  description: 'Bài đọc học thuật 5 đoạn về cây xanh đô thị: luyện TFNG, Matching Headings và Sentence Completion',
  icon: '🌳',
  objectives: [
    'Nhận diện cặp câu đối lập (nevertheless, yet, while) để tách ý chính từng đoạn',
    'Phân biệt câu FALSE (trái ngược dữ kiện) với NOT GIVEN (ngoài phạm vi bài đọc)',
    'Trích xuất chính xác cụm danh từ ngắn từ bài đọc cho dạng điền từ giới hạn 2 từ',
  ],

  vocabulary: [
    v('Infrastructure', '/ˈɪnfrəstrʌktʃər/', 'noun', 'Cơ sở hạ tầng', 'Planners view street trees as essential infrastructure.', 'Các nhà quy hoạch coi cây đường phố là hạ tầng thiết yếu.'),
    v('Ornament', '/ˈɔːrnəmənt/', 'noun', 'Vật trang trí', 'Trees are more than mere ornaments along avenues.', 'Cây xanh không chỉ là những vật trang trí đơn thuần dọc đại lộ.'),
    v('Canopy', '/ˈkænəpi/', 'noun', 'Tán cây', 'A healthy canopy cools crowded city streets.', 'Một tán cây khoẻ mạnh làm mát những con phố đông đúc.'),
    v('Intercept', '/ˌɪntərˈsept/', 'verb', 'Chặn lại, ngăn giữa chừng', 'Broad leaves intercept direct sunlight before it hits asphalt.', 'Lá rộng chắn ánh nắng trực tiếp trước khi chạm mặt đường nhựa.'),
    v('Excessive', '/ɪkˈsesɪv/', 'adj', 'Quá mức', 'Shade prevents pavements from storing excessive heat.', 'Bóng râm ngăn vỉa hè tích tụ nhiệt quá mức.'),
    v('Runoff', '/ˈrʌnɔːf/', 'noun', 'Nước mưa chảy tràn', 'Soil around the roots can soak up runoff.', 'Đất quanh rễ có thể thấm bớt nước mưa chảy tràn.'),
    v('Compacted', '/kəmˈpæktɪd/', 'adj', 'Bị nén chặt', 'Compacted gravel restricts air and water flow.', 'Sỏi bị nén chặt cản trở dòng không khí và nước.'),
    v('Uniform', '/ˈjuːnɪfɔːrm/', 'adj', 'Đồng đều, giống nhau', 'Planting one species created a uniform appearance.', 'Trồng một loài cây tạo ra vẻ ngoài đồng đều.'),
    v('Diverse', '/daɪˈvɜːrs/', 'adj', 'Đa dạng', 'Modern guidelines favour a diverse mix of species.', 'Hướng dẫn hiện đại ưu tiên sự kết hợp đa dạng các loài.'),
    v('Sapling', '/ˈsæplɪŋ/', 'noun', 'Cây non', 'Planting a sapling is only the beginning.', 'Trồng một cây non mới chỉ là bước khởi đầu.'),
    v('Periodic', '/ˌpɪriˈɑːdɪk/', 'adj', 'Định kỳ', 'Branches need periodic inspection near wires.', 'Cành cây cần được kiểm tra định kỳ gần đường dây điện.'),
    v('Commitment', '/kəˈmɪtmənt/', 'noun', 'Sự cam kết lâu dài', 'Cities should treat maintenance budgets as permanent commitments.', 'Các thành phố nên coi ngân sách bảo dưỡng là cam kết lâu dài.'),
  ],

  grammar: [
    {
      title: 'Từ nối chuyển hướng ý (nevertheless, yet, while, rather than)',
      explanation: 'Trong IELTS Academic Reading, các từ nối tương phản như "nevertheless", "yet", "while", "rather than" thường đánh dấu câu chủ đề hoặc điểm bẫy cho câu TRUE/FALSE.',
      examples: [
        { en: 'Growing mature trees beside busy roads is nevertheless a technical challenge.', vi: 'Tuy vậy, nuôi cây trưởng thành bên đường đông đúc là một thách thức kỹ thuật.' },
        { en: 'Yet whenever a specialised pest arrived, whole streets lost their shade.', vi: 'Thế nhưng mỗi khi sâu bệnh chuyên biệt xuất hiện, cả con phố mất bóng mát.' },
        { en: 'While planting ceremonies attract headlines, long-term care rarely gets attention.', vi: 'Trong khi lễ trồng cây hút truyền thông, việc chăm sóc lâu dài hiếm khi được chú ý.' },
        { en: 'Cities view trees as essential infrastructure rather than mere ornaments.', vi: 'Thành phố coi cây là hạ tầng thiết yếu thay vì vật trang trí đơn thuần.' },
      ],
      mistakes: [
        { wrong: 'Chỉ đọc nửa đầu câu có "rather than" rồi kết luận cả hai vế đều đúng.', right: 'Nhận rõ A rather than B nghĩa là chọn A và phủ định B.', note: 'Cấu trúc "A rather than B" hay xuất hiện trong câu hỏi FALSE.' },
      ],
    },
    {
      title: 'Động từ nguyên nhân – kết quả (prevent … from, prompt, shorten, overwhelm)',
      explanation: 'Bài đọc khoa học hay mô tả chuỗi nguyên nhân → kết quả bằng các động từ mạnh thay vì lặp lại "because" hay "make". Nhận ra quan hệ này giúp làm tốt dạng điền từ và TFNG.',
      examples: [
        { en: 'Leaves prevent pavements from storing excessive heat.', vi: 'Tán lá ngăn vỉa hè tích tụ nhiệt quá mức.' },
        { en: 'Narrow planting pits prompt costly sidewalk repairs.', vi: 'Hố trồng hẹp kéo theo chi phí sửa vỉa hè tốn kém.' },
        { en: 'Careless pruning can shorten a tree lifespan.', vi: 'Cắt tỉa cẩu thả có thể rút ngắn tuổi thọ cây.' },
        { en: 'Heavy runoff can overwhelm street drains during storms.', vi: 'Nước chảy tràn lớn có thể làm quá tải cống đường phố khi bão.' },
      ],
      mistakes: [
        { wrong: 'Đổi nhầm chiều nguyên nhân và kết quả khi đọc nhanh.', right: 'Xác định rõ chủ ngữ gây ra tác động gì lên tân ngữ.', note: 'Ví dụ: rễ làm nứt vỉa hè, không phải vỉa hè làm hỏng rễ.' },
      ],
    },
  ],

  reading: {
    title: 'The Quiet Work of Street Trees',
    timeLimitMin: 20,
    paragraphs: PARAGRAPHS,
    passage: PARAGRAPHS.map((p) => p.en).join('\n\n'),
    translation: PARAGRAPHS.map((p) => `${p.label}. ${p.vi}`).join('\n\n'),
    highlights: ['infrastructure', 'ornaments', 'canopy', 'intercept', 'excessive', 'runoff', 'compacted', 'uniform', 'diverse', 'sapling', 'periodic', 'commitments'],

    glossary: [
      { term: 'decoration', paragraph: 'A', synonyms: ['ornament', 'adornment'], meaningVi: 'đồ trang trí' },
      { term: 'infrastructure', paragraph: 'A', synonyms: ['public systems', 'core facilities'], definitionEn: 'basic systems and services a city needs to run smoothly', meaningVi: 'cơ sở hạ tầng' },
      { term: 'canopy', paragraph: 'A', synonyms: ['leaf cover', 'tree crown'], definitionEn: 'the upper layer of branches and leaves formed by trees', meaningVi: 'tán cây' },
      { term: 'intercept', paragraph: 'B', synonyms: ['block', 'catch', 'stop'], meaningVi: 'chặn lại trước khi tới đích' },
      { term: 'excessive', paragraph: 'B', synonyms: ['extreme', 'too much', 'undue'], meaningVi: 'quá mức' },
      { term: 'microclimate', paragraph: 'B', synonyms: ['local climate'], definitionEn: 'the climate of a very small or restricted area', meaningVi: 'vi khí hậu' },
      { term: 'overwhelms', paragraph: 'B', synonyms: ['overloads', 'floods', 'swamps'], meaningVi: 'làm quá tải' },
      { term: 'compacted', paragraph: 'C', synonyms: ['tightly packed', 'compressed'], meaningVi: 'bị nén chặt' },
      { term: 'pruning', paragraph: 'C', synonyms: ['trimming', 'cutting back'], meaningVi: 'việc cắt tỉa cành' },
      { term: 'lifespan', paragraph: 'C', synonyms: ['lifetime', 'longevity'], meaningVi: 'tuổi thọ' },
      { term: 'municipalities', paragraph: 'D', synonyms: ['city councils', 'local authorities'], meaningVi: 'chính quyền đô thị' },
      { term: 'uniform', paragraph: 'D', synonyms: ['consistent', 'identical', 'even'], meaningVi: 'đồng đều' },
      { term: 'diverse', paragraph: 'D', synonyms: ['varied', 'mixed', 'assorted'], meaningVi: 'đa dạng' },
      { term: 'sapling', paragraph: 'E', synonyms: ['young tree', 'seedling'], meaningVi: 'cây non' },
      { term: 'periodic', paragraph: 'E', synonyms: ['regular', 'recurring', 'scheduled'], meaningVi: 'định kỳ' },
    ],

    paraphrasePairs: [
      { inQuestion: 'purely visual feature', inPassage: 'treated mainly as decoration', paragraph: 'A', relation: 'same' },
      { inQuestion: 'harder for drains to cope', inPassage: 'overwhelms street drains', paragraph: 'B', relation: 'same' },
      { inQuestion: 'live longer than park trees', inPassage: 'shorten a tree lifespan dramatically compared with specimens growing in open parks', paragraph: 'C', relation: 'opposite' },
      { inQuestion: 'easier to purchase', inPassage: 'simplified buying from nurseries', paragraph: 'D', relation: 'same' },
      { inQuestion: 'media coverage', inPassage: 'attract headlines', paragraph: 'E', relation: 'same' },
      { inQuestion: 'regular care', inPassage: 'maintenance budgets', paragraph: 'E', relation: 'same' },
    ],

    examQuestions: [
      {
        type: 'tfng',
        prompt: 'In earlier times, street trees were mostly regarded as a purely visual feature.',
        answer: 'TRUE',
        evidence: { paragraph: 'A', quote: 'rows of trees along city avenues were treated mainly as decoration' },
        explanation: '"For generations" = "In earlier times"; "treated mainly as decoration" khớp với "mostly regarded as a purely visual feature".',
      },
      {
        type: 'tfng',
        prompt: 'Trees planted beside busy streets usually live longer than park trees.',
        answer: 'FALSE',
        evidence: { paragraph: 'C', quote: 'shorten a tree lifespan dramatically compared with specimens growing in open parks' },
        explanation: 'Bài nói các yếu tố ven đường rút ngắn tuổi thọ cây so với cây công viên → trái ngược với "live longer" → FALSE.',
      },
      {
        type: 'tfng',
        prompt: 'Using a single tree species across a neighbourhood made trees easier to purchase.',
        answer: 'TRUE',
        evidence: { paragraph: 'D', quote: 'simplified buying from nurseries' },
        explanation: '"simplified buying" = "made trees easier to purchase".',
      },
      {
        type: 'tfng',
        prompt: 'Native tree species are always cheaper to buy than imported ones.',
        answer: 'NOT GIVEN',
        explanation: 'Đoạn D có nhắc "native and climate-tolerant species" nhưng hoàn toàn không so sánh giá mua giữa cây bản địa và cây nhập khẩu → NOT GIVEN.',
      },
      {
        type: 'tfng',
        prompt: 'Ongoing tree maintenance usually receives as much media coverage as planting events.',
        answer: 'FALSE',
        evidence: { paragraph: 'E', quote: 'While tree-planting ceremonies attract headlines, long-term care rarely receives the same public attention.' },
        explanation: 'Bài nói chăm sóc dài hạn "rarely receives the same public attention" → trái ngược với "receives as much" → FALSE.',
      },
      {
        type: 'heading',
        prompt: 'Chọn tiêu đề cho đoạn B',
        options: HEADINGS,
        answer: 1,
        evidence: { paragraph: 'B', quote: 'The most immediate impact is local cooling.' },
        explanation: 'Đoạn B trình bày hai lợi ích: làm mát vi khí hậu cho người đi bộ và giảm nước mưa chảy tràn → ii.',
      },
      {
        type: 'heading',
        prompt: 'Chọn tiêu đề cho đoạn C',
        options: HEADINGS,
        answer: 3,
        evidence: { paragraph: 'C', quote: 'Growing mature trees beside busy roads is nevertheless a technical challenge.' },
        explanation: 'Ống nước, cáp điện, sỏi nén chặt, khí thải và muối đường đều là rào cản vật lý cho cây phát triển → iv.',
      },
      {
        type: 'heading',
        prompt: 'Chọn tiêu đề cho đoạn D',
        options: HEADINGS,
        answer: 0,
        evidence: { paragraph: 'D', quote: 'Yet whenever a specialised pest or fungal disease arrived, whole streets lost their shade within a few seasons.' },
        explanation: 'Đoạn D giải thích rủi ro khi cả khu phố chỉ trồng một loài cây duy nhất → i. Tiêu đề v là bẫy (bài không nhắc cư dân thích hoa hơn cây cao).',
      },
      {
        type: 'heading',
        prompt: 'Chọn tiêu đề cho đoạn E',
        options: HEADINGS,
        answer: 2,
        evidence: { paragraph: 'E', quote: 'Ultimately, planting a sapling is only the beginning of the investment.' },
        explanation: 'Đoạn E nhấn mạnh tưới nước, kiểm tra định kỳ và ngân sách bảo dưỡng lâu dài → iii.',
      },
      {
        type: 'sentence-completion',
        maxWords: 2,
        prompt: 'Leaves stop sunlight from heating up pavements and release ______ that improves local comfort.',
        answer: 'moisture',
        evidence: { paragraph: 'B', quote: 'trees release moisture into the air through their foliage' },
        explanation: 'Cụm nguyên văn "release moisture" khớp trực tiếp với chỗ trống (1 từ, trong giới hạn 2 từ).',
      },
      {
        type: 'sentence-completion',
        maxWords: 2,
        prompt: 'When roots lack underground space, they can push upward and damage nearby ______.',
        answer: 'sidewalks',
        evidence: { paragraph: 'C', quote: 'roots push upward and crack surrounding sidewalks' },
        explanation: '"damage nearby" diễn đạt lại "crack surrounding"; từ cần điền là "sidewalks".',
      },
      {
        type: 'sentence-completion',
        maxWords: 2,
        prompt: 'Cities enjoy healthy tree-lined avenues for decades when they treat ______ as permanent commitments.',
        answer: 'maintenance budgets',
        evidence: { paragraph: 'E', quote: 'Cities that treat maintenance budgets as permanent commitments' },
        explanation: 'Cụm danh từ 2 từ nguyên văn là "maintenance budgets".',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Từ nào đồng nghĩa với "intercept" trong ngữ cảnh "leaves intercept direct sunlight"?',
      options: ['block', 'create', 'measure', 'reflect completely'],
      correct: 0,
      explanation: '"Intercept" trong câu này có nghĩa là chặn lại trước khi ánh nắng chiếu xuống mặt đường.',
    },
    {
      skill: 'vocab',
      question: '"Compacted gravel" mô tả lớp sỏi như thế nào?',
      options: ['Rời rạc và thoáng khí', 'Bị nén chặt', 'Có chứa phân bón', 'Mới được đào xới'],
      correct: 1,
      explanation: 'Compacted = compressed / tightly packed (bị nén chặt).',
    },
    {
      skill: 'vocab',
      question: '"Municipalities" trong đoạn D đồng nghĩa với:',
      options: ['local authorities', 'private nurseries', 'urban residents', 'road builders'],
      correct: 0,
      explanation: 'Municipality = chính quyền thành phố / chính quyền địa phương (local authorities).',
    },
    {
      skill: 'vocab',
      question: 'Từ "sapling" chỉ đối tượng nào?',
      options: ['Cây cổ thụ nhiều năm', 'Cây non mới trồng', 'Rễ cây dưới lòng đất', 'Loại nấm gây bệnh'],
      correct: 1,
      explanation: 'Sapling = young tree (cây non).',
    },
    {
      skill: 'strategy',
      question: 'Trong câu "Cities view trees as essential infrastructure rather than mere ornaments", tác giả khẳng định điều gì?',
      options: [
        'Cây xanh chủ yếu chỉ dùng để trang trí.',
        'Cây xanh được xem là hạ tầng thiết yếu, không chỉ là đồ trang trí.',
        'Thành phố không còn trồng cây nữa.',
        'Đồ trang trí quan trọng hơn hạ tầng.',
      ],
      correct: 1,
      explanation: 'Cấu trúc "A rather than B" nhấn mạnh A và bác bỏ việc chỉ coi là B.',
    },
    {
      skill: 'strategy',
      question: 'Vì sao câu "Native tree species are always cheaper than imported ones" có đáp án NOT GIVEN?',
      options: [
        'Vì bài nói cây bản địa đắt hơn.',
        'Vì bài không hề so sánh giá cả giữa hai loại cây này.',
        'Vì bài không nhắc đến cây bản địa.',
        'Vì câu hỏi có từ "native".',
      ],
      correct: 1,
      explanation: 'Bài có nhắc "native species" nhưng không có dữ kiện về giá tiền → NOT GIVEN.',
    },
    {
      skill: 'grammar',
      question: 'Câu nào diễn đạt đúng quan hệ nhân quả của "Narrow planting pits prompt costly repairs"?',
      options: [
        'Costly repairs cause narrow planting pits.',
        'Narrow planting pits lead to expensive repairs.',
        'Narrow planting pits prevent expensive repairs.',
        'Repairs make planting pits wider.',
      ],
      correct: 1,
      explanation: '"Prompt" = gây ra / dẫn tới (lead to); "costly" = expensive.',
    },
    {
      skill: 'strategy',
      question: 'Với câu điền từ "NO MORE THAN TWO WORDS", đáp án nào đúng nếu đoạn văn ghi "treat maintenance budgets as permanent commitments"?',
      options: [
        'their maintenance budgets',
        'maintenance budgets',
        'long-term maintenance budgets',
        'budgets for tree maintenance',
      ],
      correct: 1,
      explanation: '"maintenance budgets" gồm đúng 2 từ nguyên văn trong bài; các phương án khác đều ≥3 từ.',
    },
    {
      skill: 'vocab',
      question: 'Từ nào trái nghĩa với "diverse"?',
      options: ['varied', 'uniform', 'periodic', 'essential'],
      correct: 1,
      explanation: 'Diverse (đa dạng) trái nghĩa với uniform (đồng đều, đơn nhất).',
    },
  ],
};

export default IELTS_READ_URBAN_TREES_LESSON;
