// GOLDEN — bài mẫu chuẩn cấp 3 (Luyện thi), dạng IELTS Academic Reading.
// Bài đọc do Cowdi tự viết (không lấy từ Cambridge hay nguồn có bản quyền).
// Cách trình bày từ vựng (từ đồng nghĩa + định nghĩa theo từng đoạn) học theo
// phương pháp "đọc bài gốc – cột từ bên cạnh" của các tài liệu tự học IELTS.
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 5.

const PARAGRAPHS = [
  {
    label: 'A',
    en: 'In many crowded cities, the flat roofs of offices, schools and apartment blocks are among the largest areas of unused space. Over the past two decades, a growing number of urban planners have begun to ask whether these surfaces could be turned into productive gardens. Supporters of rooftop farming argue that it brings food production closer to consumers, while critics question whether the benefits justify the considerable cost of construction.',
    vi: 'Ở nhiều thành phố đông đúc, mái bằng của văn phòng, trường học và chung cư là một trong những khoảng trống bỏ không lớn nhất. Hai thập kỷ qua, ngày càng nhiều nhà quy hoạch đô thị bắt đầu đặt câu hỏi liệu các bề mặt này có thể biến thành vườn trồng cho năng suất hay không. Người ủng hộ nông nghiệp trên mái cho rằng nó đưa việc sản xuất thực phẩm đến gần người tiêu dùng hơn, còn người phản đối thì nghi ngờ lợi ích có xứng với chi phí xây dựng đáng kể hay không.',
  },
  {
    label: 'B',
    en: 'The earliest rooftop gardens were largely informal projects. Residents placed pots and wooden boxes on their roofs and grew herbs or vegetables for their own kitchens. More recent schemes are far more ambitious. Some commercial operators now install lightweight soil systems, while others use hydroponics, a method in which plants grow in water enriched with nutrients rather than in soil. Because hydroponic systems weigh considerably less than traditional beds, they can be fitted to buildings that were never designed to carry heavy loads.',
    vi: 'Những khu vườn trên mái đầu tiên phần lớn là dự án tự phát. Cư dân đặt chậu và thùng gỗ lên mái, trồng rau thơm hoặc rau ăn cho bếp nhà mình. Các mô hình gần đây tham vọng hơn nhiều. Một số đơn vị kinh doanh lắp hệ thống đất nhẹ, số khác dùng thuỷ canh – phương pháp cây mọc trong nước được bổ sung dưỡng chất thay vì trong đất. Vì hệ thống thuỷ canh nhẹ hơn đáng kể so với luống truyền thống, chúng có thể lắp trên những toà nhà vốn không được thiết kế để chịu tải nặng.',
  },
  {
    label: 'C',
    en: 'The environmental case for rooftop farms rests on several claims. A layer of plants can insulate the building beneath it, keeping upper floors cooler in summer and reducing the demand for air conditioning. Green roofs also absorb a portion of rainwater, which eases pressure on drainage systems during storms. In addition, vegetables harvested on a roof can reach a nearby market within hours, so less fuel is spent on transport and less produce is wasted on long journeys.',
    vi: 'Lập luận về môi trường của nông trại trên mái dựa trên vài điểm. Một lớp cây có thể cách nhiệt cho toà nhà bên dưới, giữ các tầng trên mát hơn vào mùa hè và giảm nhu cầu dùng điều hoà. Mái xanh còn hấp thụ một phần nước mưa, giúp giảm áp lực cho hệ thống thoát nước khi có bão. Ngoài ra, rau thu hoạch trên mái có thể tới chợ gần đó chỉ trong vài giờ, nên tốn ít nhiên liệu vận chuyển hơn và ít nông sản bị hỏng trên đường dài hơn.',
  },
  {
    label: 'D',
    en: 'However, the economics are less straightforward. Before any crops are planted, engineers must confirm that the structure is strong enough, and waterproofing must often be upgraded. Labour costs can also be high, since workers need safe access and equipment has to be carried up by lift or crane. As a result, many rooftop farms concentrate on high-value crops such as salad leaves, herbs and microgreens, which sell at a premium to restaurants, rather than staple foods like rice or potatoes.',
    vi: 'Tuy nhiên, bài toán kinh tế không đơn giản như vậy. Trước khi trồng bất cứ thứ gì, kỹ sư phải xác nhận kết cấu đủ chắc, và lớp chống thấm thường phải nâng cấp. Chi phí nhân công cũng có thể cao, vì người làm cần lối lên an toàn và thiết bị phải đưa lên bằng thang máy hoặc cần cẩu. Vì vậy, nhiều nông trại trên mái tập trung vào cây trồng giá trị cao như rau xà lách, rau thơm và rau mầm, bán giá cao cho nhà hàng, thay vì lương thực chính như gạo hay khoai tây.',
  },
  {
    label: 'E',
    en: 'Perhaps the most significant contribution of rooftop agriculture is not measured in tonnes of food at all. Many projects run workshops for schoolchildren, offer volunteering opportunities to local residents and give city dwellers a rare chance to see how food is grown. For this reason, a number of researchers suggest that rooftop farms should be judged as much by their social value as by their yield. Whether they become a permanent feature of urban life may depend less on technology than on the willingness of city authorities to support them.',
    vi: 'Có lẽ đóng góp lớn nhất của nông nghiệp trên mái hoàn toàn không đo bằng số tấn thực phẩm. Nhiều dự án tổ chức buổi học cho học sinh, tạo cơ hội tình nguyện cho cư dân và cho người dân thành phố một dịp hiếm hoi để thấy thực phẩm được trồng ra sao. Vì thế, một số nhà nghiên cứu cho rằng nông trại trên mái nên được đánh giá bằng giá trị xã hội ngang với sản lượng. Việc chúng có trở thành một phần lâu dài của đời sống đô thị hay không có lẽ phụ thuộc vào sự sẵn lòng hỗ trợ của chính quyền thành phố hơn là vào công nghệ.',
  },
];

const HEADINGS = [
  'i. Practical and financial obstacles',
  'ii. From home projects to commercial systems',
  'iii. A benefit beyond food production',
  'iv. Environmental advantages',
  'v. The decline of traditional farming',
];

const v = (word, phonetic, pos, meaning, example, exampleVi) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration: '📗' });

export const IELTS_READ_ROOFTOP_FARMS_LESSON = {
  id: 'ielts-read-rooftop-farms',
  contentVersion: 2,
  track: 'ielts',
  examTag: 'IELTS Academic Reading',
  level: 'upper-intermediate',
  ieltsBand: '6.0-7.0',
  cefrLevel: 'B2',
  skill: 'reading',
  title: 'IELTS Reading: Farming Above the Streets',
  description: 'Bài đọc học thuật 5 đoạn về nông nghiệp trên mái nhà: luyện TRUE/FALSE/NOT GIVEN, nối tiêu đề và điền câu',
  icon: '🏙️',
  objectives: [
    'Nhận ra paraphrase giữa câu hỏi và bài đọc',
    'Phân biệt FALSE (trái ngược) với NOT GIVEN (không nhắc tới)',
    'Chọn tiêu đề theo ý chính của cả đoạn, không theo một từ khoá',
  ],
  // Chuẩn lời dẫn Mở ải: docs/04-design/HUONG-DAN-VAN-PHONG-LOI-DAN.md
  story: {
    scene_id: 'region_CN',
    intro_vi: 'Nhiều thành phố lớn đang trồng rau ngay trên mái nhà. Cùng anh Khoa đọc bài và bắt từ khoá paraphrase nhé!',
    dialogue: {
      speaker_id: 'khoa',
      text_en: 'Can rooftops become productive farms?',
    },
  },

  vocabulary: [
    v('Productive', '/prəˈdʌktɪv/', 'adj', 'Cho năng suất, hiệu quả', 'These surfaces could be turned into productive gardens.', 'Các bề mặt này có thể biến thành vườn trồng cho năng suất.'),
    v('Considerable', '/kənˈsɪdərəbl/', 'adj', 'Đáng kể', 'Critics point to the considerable cost of construction.', 'Người phản đối chỉ ra chi phí xây dựng đáng kể.'),
    v('Informal', '/ɪnˈfɔːrml/', 'adj', 'Không chính thức, tự phát', 'The earliest rooftop gardens were largely informal projects.', 'Những khu vườn trên mái đầu tiên phần lớn là dự án tự phát.'),
    v('Ambitious', '/æmˈbɪʃəs/', 'adj', 'Tham vọng, quy mô lớn', 'More recent schemes are far more ambitious.', 'Các mô hình gần đây tham vọng hơn nhiều.'),
    v('Enriched', '/ɪnˈrɪtʃt/', 'adj', 'Được bổ sung (dưỡng chất)', 'Plants grow in water enriched with nutrients.', 'Cây mọc trong nước được bổ sung dưỡng chất.'),
    v('Insulate', '/ˈɪnsəleɪt/', 'verb', 'Cách nhiệt, cách ly', 'A layer of plants can insulate the building beneath it.', 'Một lớp cây có thể cách nhiệt cho toà nhà bên dưới.'),
    v('Absorb', '/əbˈzɔːrb/', 'verb', 'Hấp thụ', 'Green roofs absorb a portion of rainwater.', 'Mái xanh hấp thụ một phần nước mưa.'),
    v('Ease', '/iːz/', 'verb', 'Làm giảm, xoa dịu', 'This eases pressure on drainage systems.', 'Việc này làm giảm áp lực cho hệ thống thoát nước.'),
    v('Straightforward', '/ˌstreɪtˈfɔːrwərd/', 'adj', 'Đơn giản, dễ hiểu', 'The economics are less straightforward.', 'Bài toán kinh tế không đơn giản như vậy.'),
    v('Premium', '/ˈpriːmiəm/', 'noun', 'Giá cao hơn bình thường', 'Microgreens sell at a premium to restaurants.', 'Rau mầm được bán giá cao cho nhà hàng.'),
    v('Staple', '/ˈsteɪpl/', 'adj', 'Chủ yếu, thiết yếu (lương thực)', 'Rice is a staple food in Viet Nam.', 'Gạo là lương thực chính ở Việt Nam.'),
    v('Yield', '/jiːld/', 'noun', 'Sản lượng', 'Farms should be judged by more than their yield.', 'Nông trại nên được đánh giá bằng nhiều thứ hơn là sản lượng.'),
  ],

  grammar: [
    {
      title: 'Paraphrase: đổi từ đồng nghĩa và đổi loại từ',
      explanation: 'Câu hỏi IELTS hiếm khi lặp nguyên chữ của bài. Hãy tìm từ đồng nghĩa (judged ↔ assessed) hoặc cùng ý nhưng đổi loại từ (reduce the demand ↔ a reduction in demand).',
      examples: [
        { en: 'Farms should be judged by their social value.', vi: 'Nông trại nên được đánh giá bằng giá trị xã hội.' },
        { en: 'Farms should be assessed by their social value.', vi: '(cùng nghĩa) Nông trại nên được thẩm định bằng giá trị xã hội.' },
        { en: 'Plants reduce the demand for air conditioning.', vi: 'Cây làm giảm nhu cầu dùng điều hoà.' },
        { en: 'Plants lead to a reduction in the use of air conditioning.', vi: '(cùng nghĩa) Cây dẫn tới việc giảm dùng điều hoà.' },
      ],
      mistakes: [
        { wrong: 'Chỉ dò từ khoá giống hệt trong bài rồi chọn TRUE.', right: 'So nghĩa của cả câu, kể cả từ chỉ mức độ.', note: 'Từ khoá trùng nhưng nghĩa ngược lại thì là FALSE.' },
      ],
    },
    {
      title: 'Từ chỉ mức độ quyết định TRUE / FALSE / NOT GIVEN',
      explanation: 'Các từ như all, most, many, some, always, often, may, can thay đổi mức độ chắc chắn. "Many farms grow herbs" không có nghĩa là "All farms grow herbs".',
      examples: [
        { en: 'Many rooftop farms grow high-value crops.', vi: 'Nhiều nông trại trên mái trồng cây giá trị cao.' },
        { en: 'All rooftop farms grow high-value crops.', vi: 'Tất cả nông trại trên mái trồng cây giá trị cao. (mạnh hơn bài đọc → FALSE hoặc NOT GIVEN)' },
        { en: 'Plants can keep upper floors cooler.', vi: 'Cây có thể giữ các tầng trên mát hơn.' },
        { en: 'Plants always keep upper floors cooler.', vi: 'Cây luôn giữ các tầng trên mát hơn. (bài chỉ nói "can")' },
      ],
    },
  ],

  reading: {
    title: 'Farming Above the Streets',
    timeLimitMin: 20,
    paragraphs: PARAGRAPHS,
    passage: PARAGRAPHS.map((p) => p.en).join('\n\n'),
    translation: PARAGRAPHS.map((p) => `${p.label}. ${p.vi}`).join('\n\n'),
    highlights: ['productive', 'considerable', 'informal', 'ambitious', 'enriched', 'insulate', 'absorb', 'straightforward', 'premium', 'staple', 'yield'],

    // Cột từ kiểu "Boost your vocabulary": từ trong bài = từ đồng nghĩa / định nghĩa.
    glossary: [
      { term: 'unused', paragraph: 'A', synonyms: ['empty', 'vacant', 'idle'], meaningVi: 'bỏ không' },
      { term: 'productive', paragraph: 'A', synonyms: ['fruitful', 'fertile', 'high-yielding'], meaningVi: 'cho năng suất' },
      { term: 'consumers', paragraph: 'A', synonyms: ['buyers', 'customers', 'shoppers'], meaningVi: 'người tiêu dùng' },
      { term: 'considerable', paragraph: 'A', synonyms: ['significant', 'substantial', 'large'], meaningVi: 'đáng kể' },
      { term: 'informal', paragraph: 'B', synonyms: ['casual', 'unofficial', 'small-scale'], meaningVi: 'tự phát, không chính thức' },
      { term: 'ambitious', paragraph: 'B', synonyms: ['large-scale', 'bold', 'far-reaching'], meaningVi: 'tham vọng' },
      { term: 'hydroponics', paragraph: 'B', synonyms: [], definitionEn: 'growing plants in water containing nutrients, without soil', meaningVi: 'thuỷ canh' },
      { term: 'insulate', paragraph: 'C', synonyms: ['protect', 'shield'], definitionEn: 'to stop heat, sound or electricity from passing through', meaningVi: 'cách nhiệt' },
      { term: 'absorb', paragraph: 'C', synonyms: ['soak up', 'take in'], meaningVi: 'hấp thụ' },
      { term: 'eases', paragraph: 'C', synonyms: ['reduces', 'relieves', 'lessens'], meaningVi: 'làm giảm' },
      { term: 'straightforward', paragraph: 'D', synonyms: ['simple', 'clear-cut', 'easy'], meaningVi: 'đơn giản' },
      { term: 'premium', paragraph: 'D', synonyms: ['high price', 'mark-up'], definitionEn: 'a price higher than usual', meaningVi: 'giá cao' },
      { term: 'staple', paragraph: 'D', synonyms: ['basic', 'main', 'essential'], meaningVi: 'lương thực chính' },
      { term: 'dwellers', paragraph: 'E', synonyms: ['residents', 'inhabitants', 'citizens'], meaningVi: 'cư dân' },
      { term: 'yield', paragraph: 'E', synonyms: ['output', 'harvest', 'production'], meaningVi: 'sản lượng' },
      { term: 'willingness', paragraph: 'E', synonyms: ['readiness', 'eagerness'], meaningVi: 'sự sẵn lòng' },
    ],

    // Cách câu hỏi diễn đạt lại bài đọc. relation: same (cùng nghĩa) | opposite (ngược nghĩa).
    paraphrasePairs: [
      { inQuestion: 'for their own use', inPassage: 'for their own kitchens', paragraph: 'B', relation: 'same' },
      { inQuestion: 'heavier than', inPassage: 'weigh considerably less than', paragraph: 'B', relation: 'opposite' },
      { inQuestion: 'reduce the energy used to cool buildings', inPassage: 'reducing the demand for air conditioning', paragraph: 'C', relation: 'same' },
      { inQuestion: 'obstacles', inPassage: 'less straightforward', paragraph: 'D', relation: 'same' },
      { inQuestion: 'home projects', inPassage: 'informal projects', paragraph: 'B', relation: 'same' },
      { inQuestion: 'assessed', inPassage: 'judged', paragraph: 'E', relation: 'same' },
    ],

    // Câu hỏi đúng dạng đề. answer: TRUE|FALSE|NOT GIVEN (tfng), chỉ số option (mcq/heading), chuỗi (sentence-completion).
    examQuestions: [
      { type: 'tfng', prompt: 'The first rooftop gardens were mainly created by people growing food for their own use.', answer: 'TRUE',
        evidence: { paragraph: 'B', quote: 'grew herbs or vegetables for their own kitchens' },
        explanation: '"for their own kitchens" = "for their own use"; "largely informal projects" khớp với "mainly".' },
      { type: 'tfng', prompt: 'Hydroponic systems are heavier than traditional soil beds.', answer: 'FALSE',
        evidence: { paragraph: 'B', quote: 'hydroponic systems weigh considerably less than traditional beds' },
        explanation: 'Bài nói nhẹ hơn đáng kể → ngược với "heavier" → FALSE.' },
      { type: 'tfng', prompt: 'Rooftop farms can reduce the energy used to cool buildings.', answer: 'TRUE',
        evidence: { paragraph: 'C', quote: 'reducing the demand for air conditioning' },
        explanation: 'Giảm nhu cầu điều hoà = giảm năng lượng làm mát.' },
      { type: 'tfng', prompt: 'Most rooftop farms make a profit within their first year.', answer: 'NOT GIVEN',
        explanation: 'Đoạn D nói về chi phí nhưng không nhắc lợi nhuận hay "năm đầu". Không có thông tin → NOT GIVEN, không phải FALSE.' },
      { type: 'tfng', prompt: 'Rooftop farms mainly grow staple crops such as rice.', answer: 'FALSE',
        evidence: { paragraph: 'D', quote: 'rather than staple foods like rice or potatoes' },
        explanation: '"rather than" cho biết họ KHÔNG tập trung vào lương thực chính → FALSE.' },
      { type: 'heading', prompt: 'Chọn tiêu đề cho đoạn B', options: HEADINGS, answer: 1,
        evidence: { paragraph: 'B', quote: 'More recent schemes are far more ambitious.' },
        explanation: 'Đoạn B đi từ vườn tự phát của cư dân tới hệ thống của đơn vị kinh doanh → ii.' },
      { type: 'heading', prompt: 'Chọn tiêu đề cho đoạn C', options: HEADINGS, answer: 3,
        evidence: { paragraph: 'C', quote: 'The environmental case for rooftop farms rests on several claims.' },
        explanation: 'Câu chủ đề "The environmental case…" → iv.' },
      { type: 'heading', prompt: 'Chọn tiêu đề cho đoạn D', options: HEADINGS, answer: 0,
        evidence: { paragraph: 'D', quote: 'However, the economics are less straightforward.' },
        explanation: 'Kết cấu, chống thấm, nhân công = trở ngại thực tế và tài chính → i. Đoạn có nhắc "rice" nhưng không nói về sự suy giảm của nông nghiệp truyền thống, nên v là bẫy.' },
      { type: 'heading', prompt: 'Chọn tiêu đề cho đoạn E', options: HEADINGS, answer: 2,
        evidence: { paragraph: 'E', quote: 'is not measured in tonnes of food at all' },
        explanation: 'Đóng góp không đo bằng tấn thực phẩm = lợi ích ngoài sản xuất thực phẩm → iii.' },
      { type: 'sentence-completion', maxWords: 2, prompt: 'Plants on a roof take in some ______, which helps drainage systems during storms.', answer: 'rainwater',
        evidence: { paragraph: 'C', quote: 'Green roofs also absorb a portion of rainwater' },
        explanation: '"take in" = "absorb". Chỉ điền 1 từ "rainwater".' },
      { type: 'sentence-completion', maxWords: 2, prompt: 'Many rooftop farms sell high-value crops to ______ at a higher price.', answer: 'restaurants',
        evidence: { paragraph: 'D', quote: 'which sell at a premium to restaurants' },
        explanation: '"at a higher price" = "at a premium".' },
      { type: 'sentence-completion', maxWords: 2, prompt: 'Some researchers think rooftop farms should be assessed by their ______ as well as their yield.', answer: 'social value',
        evidence: { paragraph: 'E', quote: 'should be judged as much by their social value as by their yield' },
        explanation: '"assessed" = "judged"; "as well as" = "as much by … as by". Đáp án 2 từ, đúng giới hạn.' },
    ],
  },

  quiz: [
    { skill: 'strategy', question: 'Khi một câu TFNG có ý mà bài đọc không hề nhắc tới, đáp án là:',
      options: ['TRUE', 'NOT GIVEN', 'FALSE', 'Bỏ trống'], correct: 1,
      explanation: 'Không có thông tin để xác nhận hay bác bỏ → NOT GIVEN.' },
    { skill: 'strategy', question: 'Khi bài đọc nói điều NGƯỢC với câu hỏi, đáp án là:',
      options: ['TRUE', 'NOT GIVEN', 'FALSE', 'YES'], correct: 2,
      explanation: 'Thông tin mâu thuẫn trực tiếp → FALSE.' },
    { skill: 'vocab', question: 'Từ nào đồng nghĩa với "considerable"?',
      options: ['tiny', 'temporary', 'informal', 'substantial'], correct: 3,
      explanation: 'considerable = significant = substantial (đáng kể).' },
    { skill: 'vocab', question: '"Absorb a portion of rainwater" có thể viết lại là:',
      options: ['soak up some rainwater', 'produce rainwater', 'block all rainwater', 'measure rainwater'], correct: 0,
      explanation: 'absorb = soak up; a portion of = some.' },
    { skill: 'vocab', question: '"Sell at a premium" nghĩa là:',
      options: ['bán với giá ưu đãi', 'bán với giá cao hơn thường', 'tặng miễn phí cho khách', 'bán theo số lượng thật lớn'], correct: 1,
      explanation: 'premium = giá cao hơn mức thông thường.' },
    { skill: 'vocab', question: 'Từ nào KHÔNG đồng nghĩa với "dwellers"?',
      options: ['residents', 'inhabitants', 'visitors', 'citizens'], correct: 2,
      explanation: '"visitors" là khách ghé thăm, không phải người sống ở đó.' },
    { skill: 'strategy', question: 'Làm dạng nối tiêu đề (matching headings), nên dựa vào:',
      options: ['Một từ khoá trùng khớp tiêu đề', 'Tổng số từ và độ dài của đoạn', 'Câu kết cuối cùng của toàn bài', 'Ý chính cả đoạn, thường ở câu chủ đề'], correct: 3,
      explanation: 'Tiêu đề tóm ý cả đoạn; từ khoá trùng thường là bẫy (như "rice" ở đoạn D).' },
    { skill: 'grammar', question: 'Câu nào MẠNH hơn câu "Plants can keep upper floors cooler"?',
      options: ['Plants always keep upper floors cooler.', 'Plants sometimes keep upper floors cooler.', 'Plants may keep upper floors cooler.', 'Plants could keep upper floors cooler.'], correct: 0,
      explanation: '"always" khẳng định chắc chắn hơn "can" → nếu câu hỏi dùng "always" mà bài chỉ nói "can" thì không phải TRUE.' },
    { skill: 'strategy', question: 'Đề ghi "NO MORE THAN TWO WORDS". Đáp án nào hợp lệ?',
      options: ['the social value', 'social value', 'their social value of farms', 'value that is social'], correct: 1,
      explanation: 'Tối đa 2 từ: "social value". Thêm "the" là 3 từ → sai.' },
  ],
};
