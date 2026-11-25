// Track: ielts — Unit ielts-unit-reading-v2 · Why Rest Shapes What We Remember (contentVersion 2)
// Bài đọc do Cowdi tự viết mới hoàn toàn (không lấy từ nguồn có bản quyền).
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 5.

const PARAGRAPHS = [
  {
    label: 'A',
    en: 'For much of the twentieth century, sleep was widely assumed to be a passive pause during which the brain simply powered down to recover energy. Brain-imaging techniques have overturned that assumption. Far from resting idly, a sleeping brain cycles through distinct phases of electrical activity, sorting through experiences from the waking day and deciding which impressions are worth preserving in long-term memory.',
    vi: 'Trong phần lớn thế kỷ hai mươi, giấc ngủ thường bị mặc định là quãng nghỉ thụ động khi bộ não đơn giản tắt bớt hoạt động để hồi phục năng lượng. Các kỹ thuật ghi hình não bộ đã lật ngược giả định đó. Không hề nghỉ ngơi nhàn rỗi, bộ não khi ngủ luân chuyển qua nhiều giai đoạn hoạt động điện rõ rệt, phân loại những trải nghiệm của ban ngày và quyết định ấn tượng nào đáng được lưu giữ vào trí nhớ dài hạn.',
  },
  {
    label: 'B',
    en: 'Researchers commonly highlight two complementary stages. Deep slow-wave sleep, which dominates the first half of the night, appears particularly valuable for stabilising factual knowledge, new vocabulary and clear sequences of steps. Rapid eye movement sleep, more abundant toward morning, is closely associated with vivid dreaming and appears to integrate fresh material with older memories. Together, these stages help learners not merely store isolated facts but also recognise unexpected links between ideas.',
    vi: 'Các nhà nghiên cứu thường nhấn mạnh hai giai đoạn bổ trợ cho nhau. Giấc ngủ sóng chậm sâu, chiếm ưu thế trong nửa đầu đêm, tỏ ra đặc biệt giá trị trong việc củng cố kiến thức thực tế, từ vựng mới và các chuỗi bước rõ ràng. Giấc ngủ chuyển động mắt nhanh, nhiều hơn về gần sáng, gắn liền với những giấc mơ sống động và dường như hoà nhập thông tin mới với ký ức cũ. Kết hợp lại, các giai đoạn này giúp người học không chỉ lưu trữ dữ kiện rời rạc mà còn nhận ra mối liên hệ bất ngờ giữa các ý tưởng.',
  },
  {
    label: 'C',
    en: 'The cost of cutting sleep short is therefore far greater than feeling sluggish the next morning. Students who stay awake late to cram before an examination often manage to recall definitions briefly, yet they tend to lose those details quickly and struggle when asked to apply them in unfamiliar contexts. Worse still, sleep-deprived learners frequently overestimate how accurately they performed, because fatigue blunts the very self-monitoring skills needed to notice errors.',
    vi: 'Do đó, cái giá của việc cắt xén giấc ngủ lớn hơn nhiều so với cảm giác uể oải vào sáng hôm sau. Những học sinh thức khuya học nhồi trước kỳ thi thường chỉ nhớ định nghĩa trong thời gian ngắn, nhưng lại nhanh quên các chi tiết đó và chật vật khi cần áp dụng chúng vào ngữ cảnh lạ. Tệ hơn nữa, người học thiếu ngủ thường đánh giá quá cao độ chính xác bài làm của mình, bởi sự mệt mỏi làm cùn mòn chính kỹ năng tự giám sát cần thiết để nhận ra lỗi sai.',
  },
  {
    label: 'D',
    en: 'Short daytime naps are sometimes promoted as a convenient remedy, though their value depends heavily on timing and duration. A brief rest in the early afternoon can restore alertness and aid simple recall without leaving the sleeper disoriented. By contrast, lengthy naps taken late in the day often produce heavy grogginess upon waking and make it harder to fall asleep at night, creating a cycle that undermines deep overnight consolidation.',
    vi: 'Những giấc ngủ ngắn ban ngày đôi khi được quảng bá như giải pháp tiện lợi, dù giá trị của chúng phụ thuộc rất lớn vào thời điểm và thời lượng. Một giấc nghỉ ngắn vào đầu giờ chiều có thể khôi phục sự tỉnh táo và hỗ trợ ghi nhớ đơn giản mà không khiến người ngủ bị mất phương hướng. Ngược lại, những giấc ngủ dài vào cuối ngày thường gây trạng thái choáng váng nặng nề khi thức dậy và khiến tối khó vào giấc hơn, tạo vòng luẩn quẩn làm suy yếu quá trình củng cố sâu vào ban đêm.',
  },
  {
    label: 'E',
    en: 'These findings carry practical implications for schools and workplaces alike. Shifting secondary school start times slightly later, for instance, aligns more closely with the natural biological clock of adolescents and has been linked in several districts to steadier attendance and calmer classrooms. Although changing timetables inevitably complicates transport and family routines, insisting that young people learn effectively on chronic sleep deficits may be the far more expensive choice.',
    vi: 'Những phát hiện này mang lại hệ quả thực tiễn cho cả trường học lẫn nơi làm việc. Chẳng hạn, lùi giờ vào học bậc trung học muộn hơn một chút sẽ khớp hơn với đồng hồ sinh học tự nhiên của thanh thiếu niên và ở nhiều khu vực đã gắn liền với tỷ lệ đi học đều hơn cùng lớp học điềm tĩnh hơn. Dù việc điều chỉnh thời khoá biểu chắc chắn làm phức tạp lịch di chuyển và sinh hoạt gia đình, việc ép người trẻ học hiệu quả trong tình trạng thiếu ngủ kinh niên có thể mới là lựa chọn đắt giá hơn nhiều.',
  },
];

const v = (word, phonetic, pos, meaning, example, exampleVi) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration: '🧠' });

export const IELTS_READ_SLEEP_MEMORY_LESSON = {
  id: 'ielts-read-sleep-memory',
  contentVersion: 2,
  track: 'ielts',
  examTag: 'IELTS Academic Reading',
  level: 'advanced',
  ieltsBand: '6.5-7.5',
  cefrLevel: 'C1',
  skill: 'reading',
  title: 'IELTS Reading: Why Rest Shapes What We Remember',
  description: 'Bài đọc học thuật 5 đoạn về giấc ngủ và trí nhớ: luyện YES/NO/NOT GIVEN, Matching Information và MCQ',
  icon: '🧠',
  objectives: [
    'Phân biệt quan điểm của tác giả (YES / NO / NOT GIVEN) với dữ kiện không được đề cập',
    'Dò nhanh thông tin chi tiết nằm rải rác trong các đoạn (Matching Information)',
    'Loại trừ phương án nhiễu trong dạng trắc nghiệm học thuật (Multiple Choice)',
  ],

  vocabulary: [
    v('Overturn', '/ˌoʊvərˈtɜːrn/', 'verb', 'Lật ngược, bác bỏ', 'Brain-imaging techniques have overturned that old assumption.', 'Các kỹ thuật ghi hình não đã lật ngược giả định cũ đó.'),
    v('Complementary', '/ˌkɑːmpləˈmentəri/', 'adj', 'Bổ trợ cho nhau', 'Researchers highlight two complementary sleep stages.', 'Các nhà nghiên cứu nhấn mạnh hai giai đoạn ngủ bổ trợ cho nhau.'),
    v('Stabilise', '/ˈsteɪbəlaɪz/', 'verb', 'Làm ổn định, củng cố', 'Deep sleep helps stabilise factual knowledge.', 'Giấc ngủ sâu giúp củng cố kiến thức thực tế.'),
    v('Integrate', '/ˈɪntɪɡreɪt/', 'verb', 'Hoà nhập, kết nối thành một thể', 'Dreaming stages integrate fresh material with older memories.', 'Giai đoạn mơ hoà nhập thông tin mới với ký ức cũ.'),
    v('Sluggish', '/ˈslʌɡɪʃ/', 'adj', 'Uể oải, chậm chạp', 'Lack of sleep does more than make people feel sluggish.', 'Thiếu ngủ không chỉ khiến mọi người cảm thấy uể oải.'),
    v('Overestimate', '/ˌoʊvərˈestɪmeɪt/', 'verb', 'Đánh giá quá cao', 'Sleep-deprived learners often overestimate their accuracy.', 'Người học thiếu ngủ thường đánh giá quá cao độ chính xác của mình.'),
    v('Fatigue', '/fəˈtiːɡ/', 'noun', 'Sự mệt mỏi kéo dài', 'Fatigue blunts the skills needed to spot errors.', 'Sự mệt mỏi làm cùn mòn kỹ năng nhận ra lỗi sai.'),
    v('Remedy', '/ˈremədi/', 'noun', 'Giải pháp, phương thuốc', 'Short daytime naps are promoted as a convenient remedy.', 'Giấc ngủ trưa ngắn được quảng bá như giải pháp tiện lợi.'),
    v('Disoriented', '/dɪsˈɔːrientɪd/', 'adj', 'Mất phương hướng, choáng váng', 'A brief nap restores alertness without leaving you disoriented.', 'Giấc ngủ ngắn phục hồi tỉnh táo mà không khiến bạn choáng váng.'),
    v('Undermine', '/ˌʌndərˈmaɪn/', 'verb', 'Làm suy yếu dần', 'Late naps can undermine deep overnight consolidation.', 'Ngủ trưa muộn có thể làm suy yếu quá trình củng cố ban đêm.'),
    v('Implication', '/ˌɪmplɪˈkeɪʃən/', 'noun', 'Hệ quả, tác động thực tiễn', 'These findings carry practical implications for schools.', 'Những phát hiện này mang lại hệ quả thực tiễn cho trường học.'),
    v('Deficit', '/ˈdefɪsɪt/', 'noun', 'Sự thiếu hụt', 'Learning on chronic sleep deficits carries hidden costs.', 'Học tập trong tình trạng thiếu ngủ kinh niên kéo theo cái giá ẩn.'),
  ],

  grammar: [
    {
      title: 'Ngôn ngữ rào đón (Hedging) trong văn bản học thuật',
      explanation: 'Tác giả học thuật dùng "appears to", "tend to", "may", "widely assumed" để phân biệt giả thuyết, xu hướng và kết luận chắc chắn. Khi làm YES/NO/NOT GIVEN, phải chú ý mức độ khẳng định của tác giả.',
      examples: [
        { en: 'Deep sleep appears particularly valuable for factual knowledge.', vi: 'Giấc ngủ sâu dường như đặc biệt giá trị cho kiến thức thực tế.' },
        { en: 'Students who cram tend to lose those details quickly.', vi: 'Học sinh học nhồi có xu hướng nhanh quên các chi tiết đó.' },
        { en: 'Insisting on chronic sleep deficits may be the more expensive choice.', vi: 'Ép học trong tình trạng thiếu ngủ kinh niên có thể mới là lựa chọn đắt giá hơn.' },
        { en: 'Sleep was widely assumed to be a passive pause.', vi: 'Giấc ngủ từng được mặc định rộng rãi là quãng nghỉ thụ động.' },
      ],
      mistakes: [
        { wrong: 'Nhầm ý "was widely assumed" (quan điểm cũ bị bác bỏ) là quan điểm của tác giả.', right: 'Đọc câu tiếp theo xem tác giả ủng hộ hay lật ngược giả định đó.', note: 'Cụm "overturned that assumption" báo hiệu tác giả bác bỏ ý ở câu trước.' },
      ],
    },
    {
      title: 'Cấu trúc đối chiếu "not merely … but also" và "although"',
      explanation: 'Dùng "not merely A but also B" để mở rộng chức năng từ mức cơ bản lên mức cao hơn; dùng "although" để thừa nhận một nhược điểm nhưng vẫn giữ lập luận chính ở mệnh đề sau.',
      examples: [
        { en: 'Sleep helps learners not merely store facts but also recognise links.', vi: 'Giấc ngủ giúp người học không chỉ lưu dữ kiện mà còn nhận ra mối liên hệ.' },
        { en: 'Although changing timetables complicates routines, chronic sleep loss costs more.', vi: 'Dù đổi thời khoá biểu làm phức tạp sinh hoạt, thiếu ngủ kinh niên còn tốn kém hơn.' },
        { en: 'By contrast, lengthy late naps often produce heavy grogginess.', vi: 'Ngược lại, giấc ngủ dài cuối ngày thường gây choáng váng nặng.' },
        { en: 'Far from resting idly, a sleeping brain cycles through distinct phases.', vi: 'Không hề nghỉ nhàn rỗi, bộ não khi ngủ luân chuyển qua nhiều giai đoạn.' },
      ],
      mistakes: [
        { wrong: 'Chọn mệnh đề phụ sau "Although" làm quan điểm chính của tác giả.', right: 'Trọng tâm lập luận của tác giả luôn nằm ở mệnh đề chính sau dấu phẩy.', note: 'Đoạn E thừa nhận khó khăn giao thông nhưng vẫn ủng hộ lùi giờ học.' },
      ],
    },
  ],

  reading: {
    title: 'Why Rest Shapes What We Remember',
    timeLimitMin: 20,
    paragraphs: PARAGRAPHS,
    passage: PARAGRAPHS.map((p) => p.en).join('\n\n'),
    translation: PARAGRAPHS.map((p) => `${p.label}. ${p.vi}`).join('\n\n'),
    highlights: ['overturned', 'complementary', 'stabilising', 'integrate', 'sluggish', 'overestimate', 'fatigue', 'remedy', 'disoriented', 'undermines', 'implications', 'deficits'],

    glossary: [
      { term: 'passive', paragraph: 'A', synonyms: ['inactive', 'idle', 'inert'], meaningVi: 'thụ động' },
      { term: 'overturned', paragraph: 'A', synonyms: ['disproved', 'reversed', 'refuted'], meaningVi: 'lật ngược, bác bỏ' },
      { term: 'preserving', paragraph: 'A', synonyms: ['retaining', 'storing', 'keeping'], meaningVi: 'lưu giữ' },
      { term: 'complementary', paragraph: 'B', synonyms: ['mutually supportive', 'matching'], definitionEn: 'combining well to improve each other', meaningVi: 'bổ trợ cho nhau' },
      { term: 'abundant', paragraph: 'B', synonyms: ['plentiful', 'rich', 'concentrated'], meaningVi: 'dồi dào, chiếm tỷ trọng lớn' },
      { term: 'integrate', paragraph: 'B', synonyms: ['combine', 'merge', 'blend'], meaningVi: 'hoà nhập, kết nối' },
      { term: 'sluggish', paragraph: 'C', synonyms: ['lethargic', 'slow', 'drowsy'], meaningVi: 'uể oải, chậm chạp' },
      { term: 'overestimate', paragraph: 'C', synonyms: ['overrate', 'exaggerate'], meaningVi: 'đánh giá quá cao' },
      { term: 'blunts', paragraph: 'C', synonyms: ['weakens', 'dulls', 'impairs'], meaningVi: 'làm cùn mòn, suy giảm' },
      { term: 'remedy', paragraph: 'D', synonyms: ['solution', 'fix', 'cure'], meaningVi: 'giải pháp khắc phục' },
      { term: 'disoriented', paragraph: 'D', synonyms: ['confused', 'dazed'], meaningVi: 'mất phương hướng' },
      { term: 'undermines', paragraph: 'D', synonyms: ['weakens', 'damages', 'erodes'], meaningVi: 'làm suy yếu' },
      { term: 'implications', paragraph: 'E', synonyms: ['consequences', 'effects', 'lessons'], meaningVi: 'hệ quả thực tiễn' },
      { term: 'adolescents', paragraph: 'E', synonyms: ['teenagers', 'young people'], meaningVi: 'thanh thiếu niên' },
      { term: 'chronic', paragraph: 'E', synonyms: ['persistent', 'long-term', 'ongoing'], meaningVi: 'kinh niên, kéo dài' },
    ],

    paraphrasePairs: [
      { inQuestion: 'shuts down completely', inPassage: 'simply powered down', paragraph: 'A', relation: 'same' },
      { inQuestion: 'connect new learning with existing knowledge', inPassage: 'integrate fresh material with older memories', paragraph: 'B', relation: 'same' },
      { inQuestion: 'judge their own performance accurately', inPassage: 'overestimate how accurately they performed', paragraph: 'C', relation: 'opposite' },
      { inQuestion: 'depends on when and how long', inPassage: 'depends heavily on timing and duration', paragraph: 'D', relation: 'same' },
      { inQuestion: 'disrupts family schedules', inPassage: 'complicates transport and family routines', paragraph: 'E', relation: 'same' },
      { inQuestion: 'teenagers', inPassage: 'adolescents', paragraph: 'E', relation: 'same' },
    ],

    examQuestions: [
      {
        type: 'ynng',
        prompt: 'The writer agrees with the twentieth-century view that the brain simply shuts down completely during sleep.',
        answer: 'NO',
        evidence: { paragraph: 'A', quote: 'Brain-imaging techniques have overturned that assumption.' },
        explanation: 'Tác giả nêu rõ kỹ thuật ghi hình não đã lật ngược giả định cũ và bộ não không hề nghỉ nhàn rỗi → NO.',
      },
      {
        type: 'ynng',
        prompt: 'Cramming late at night prevents students from judging their own performance accurately.',
        answer: 'YES',
        evidence: { paragraph: 'C', quote: 'sleep-deprived learners frequently overestimate how accurately they performed' },
        explanation: 'Người học thiếu ngủ đánh giá quá cao độ chính xác vì mệt mỏi làm suy giảm khả năng tự nhận lỗi → YES.',
      },
      {
        type: 'ynng',
        prompt: 'Short early-afternoon naps are more effective for vocabulary memorisation than overnight sleep.',
        answer: 'NOT GIVEN',
        explanation: 'Đoạn D nói ngủ ngắn đầu chiều giúp tỉnh táo và nhớ đơn giản, nhưng không hề so sánh hiệu quả học từ vựng giữa ngủ trưa và ngủ đêm → NOT GIVEN.',
      },
      {
        type: 'ynng',
        prompt: 'The writer suggests that keeping early school start times may ultimately carry a higher hidden cost than adjusting schedules.',
        answer: 'YES',
        evidence: { paragraph: 'E', quote: 'insisting that young people learn effectively on chronic sleep deficits may be the far more expensive choice.' },
        explanation: 'Tác giả thừa nhận đổi lịch làm phức tạp sinh hoạt nhưng cho rằng để học sinh thiếu ngủ kinh niên mới là lựa chọn đắt giá hơn → YES.',
      },
      {
        type: 'matching-info',
        prompt: 'Đoạn nào nêu lý do học sinh thiếu ngủ khó tự nhận ra lỗi sai trong bài làm?',
        answer: 'C',
        evidence: { paragraph: 'C', quote: 'because fatigue blunts the very self-monitoring skills needed to notice errors.' },
        explanation: 'Đoạn C giải thích trực tiếp nguyên nhân người thiếu ngủ đánh giá quá cao bản thân.',
      },
      {
        type: 'matching-info',
        prompt: 'Đoạn nào phân biệt hai giai đoạn ngủ theo thời điểm trong đêm và chức năng với trí nhớ?',
        answer: 'B',
        evidence: { paragraph: 'B', quote: 'Deep slow-wave sleep, which dominates the first half of the night' },
        explanation: 'Đoạn B đối chiếu giấc ngủ sóng chậm sâu (nửa đầu đêm) và REM (gần sáng).',
      },
      {
        type: 'matching-info',
        prompt: 'Đoạn nào cảnh báo một thói quen ban ngày có thể làm hại chất lượng giấc ngủ đêm?',
        answer: 'D',
        evidence: { paragraph: 'D', quote: 'creating a cycle that undermines deep overnight consolidation.' },
        explanation: 'Đoạn D cảnh báo ngủ dài vào cuối ngày gây khó ngủ tối và làm suy yếu củng cố ban đêm.',
      },
      {
        type: 'matching-info',
        prompt: 'Đoạn nào nhắc đến trở ngại thực tế khi trường học điều chỉnh khung giờ buổi sáng?',
        answer: 'E',
        evidence: { paragraph: 'E', quote: 'Although changing timetables inevitably complicates transport and family routines' },
        explanation: 'Đoạn E đề cập lịch di chuyển và sinh hoạt gia đình trở nên phức tạp hơn.',
      },
      {
        type: 'mcq',
        prompt: 'According to Paragraph B, what is a key function of rapid eye movement (REM) sleep?',
        options: [
          'Replacing the need for deep slow-wave sleep',
          'Connecting new learning with existing knowledge',
          'Allowing students to memorise long lists in minutes',
          'Reducing the amount of dreaming before dawn',
        ],
        answer: 1,
        evidence: { paragraph: 'B', quote: 'appears to integrate fresh material with older memories.' },
        explanation: '"integrate fresh material with older memories" = kết nối kiến thức mới với hiểu biết sẵn có.',
      },
      {
        type: 'mcq',
        prompt: 'What problem do students who cram overnight face according to Paragraph C?',
        options: [
          'They cannot remember a single definition the next morning.',
          'They underestimate how well they performed.',
          'They always sleep through their examinations.',
          'They struggle to transfer memorised facts to new situations.',
        ],
        answer: 3,
        evidence: { paragraph: 'C', quote: 'struggle when asked to apply them in unfamiliar contexts.' },
        explanation: 'Bài nêu rõ họ vẫn có thể nhớ định nghĩa ngắn hạn nhưng chật vật khi áp dụng vào ngữ cảnh lạ (unfamiliar contexts).',
      },
      {
        type: 'mcq',
        prompt: 'According to Paragraph D, when is a daytime nap most likely to be helpful?',
        options: [
          'When it is long and taken right before dinner',
          'When it replaces deep sleep on busy nights',
          'When it is brief and taken in the early afternoon',
          'When it happens immediately after waking up in the morning',
        ],
        answer: 2,
        evidence: { paragraph: 'D', quote: 'A brief rest in the early afternoon can restore alertness and aid simple recall' },
        explanation: 'Giấc nghỉ ngắn đầu buổi chiều giúp khôi phục tỉnh táo mà không gây choáng váng.',
      },
      {
        type: 'mcq',
        prompt: 'Why does the writer mention later secondary school start times in Paragraph E?',
        options: [
          'To prove that transport problems are impossible to solve',
          'To show that workplaces cannot learn from school schedules',
          'To argue that teenagers need fewer hours of sleep than adults',
          'To illustrate how sleep research can guide institutional policy',
        ],
        answer: 3,
        evidence: { paragraph: 'E', quote: 'These findings carry practical implications for schools and workplaces alike.' },
        explanation: 'Ví dụ lùi giờ học trung học minh hoạ hệ quả thực tiễn của nghiên cứu giấc ngủ đối với chính sách tổ chức.',
      },
    ],
  },

  quiz: [
    {
      skill: 'strategy',
      question: 'Điểm khác nhau cốt lõi giữa TRUE/FALSE/NOT GIVEN và YES/NO/NOT GIVEN là gì?',
      options: [
        'TFNG kiểm tra sự thật; YNNG kiểm tra quan điểm tác giả.',
        'YNNG không bao giờ có phương án NOT GIVEN trong đề.',
        'TFNG chỉ áp dụng cho bài đọc ngắn dưới 200 từ.',
        'Hai dạng giống hệt nhau, đổi tên tuỳ theo đề thi.',
      ],
      correct: 0,
      explanation: 'TFNG đối chiếu thông tin thực tế (facts); YNNG đối chiếu quan điểm/lập luận của tác giả (views/claims).',
    },
    {
      skill: 'vocab',
      question: 'Từ nào đồng nghĩa với "overturn an assumption"?',
      options: ['confirm a belief', 'disprove a belief', 'repeat a belief', 'ignore a belief'],
      correct: 1,
      explanation: '"Overturn" = lật ngược, bác bỏ (disprove / refute).',
    },
    {
      skill: 'vocab',
      question: '"Fatigue blunts self-monitoring skills" nghĩa là sự mệt mỏi:',
      options: [
        'làm sắc bén hơn kỹ năng tự kiểm tra',
        'tạo thêm kỹ năng học mới',
        'làm suy giảm kỹ năng tự nhận ra lỗi sai',
        'không ảnh hưởng tới kỹ năng làm bài',
      ],
      correct: 2,
      explanation: '"Blunt" (động từ) = làm cùn mòn, suy yếu (weaken / impair).',
    },
    {
      skill: 'vocab',
      question: 'Từ "complementary" mô tả hai giai đoạn ngủ như thế nào?',
      options: ['Đối lập và triệt tiêu nhau', 'Chỉ xảy ra khi uống cà phê', 'Giống hệt nhau hoàn toàn', 'Bổ trợ cho nhau cùng tạo hiệu quả'],
      correct: 3,
      explanation: 'Complementary = bổ trợ nhau (mutually supportive).',
    },
    {
      skill: 'vocab',
      question: '"Undermine deep overnight consolidation" đồng nghĩa gần nhất với:',
      options: [
        'weaken deep overnight memory storage',
        'accelerate overnight recovery',
        'measure overnight brain waves',
        'guarantee deep sleep every night',
      ],
      correct: 0,
      explanation: '"Undermine" = làm suy yếu dần (weaken / erode).',
    },
    {
      skill: 'strategy',
      question: 'Khi làm dạng Matching Information (tìm đoạn chứa chi tiết), chiến lược hiệu quả là:',
      options: [
        'Chỉ đọc lướt câu đầu tiên mỗi đoạn rồi chọn ngay.',
        'Gạch từ khoá, tìm paraphrase trong đoạn rồi kiểm chi tiết.',
        'Điền các chữ cái A, B, C, D theo đúng thứ tự câu hỏi.',
        'Dự đoán đoạn chứa thông tin dựa vào độ dài đoạn văn.',
      ],
      correct: 1,
      explanation: 'Matching Information thường không theo thứ tự đoạn và chi tiết có thể nằm ở giữa hoặc cuối đoạn.',
    },
    {
      skill: 'grammar',
      question: 'Trong câu "Although changing timetables complicates routines, chronic sleep loss costs more", tác giả nghiêng về ý nào?',
      options: [
        'Không bao giờ nên điều chỉnh thời khoá biểu trường học.',
        'Lịch di chuyển xe buýt quan trọng hơn sức khoẻ học sinh.',
        'Đổi lịch có bất tiện nhưng vẫn tốt hơn để học sinh thiếu ngủ.',
        'Giấc ngủ ban đêm không liên quan đến kết quả ở trường.',
      ],
      correct: 2,
      explanation: 'Mệnh đề sau "Although" chỉ thừa nhận nhược điểm; lập luận chính nằm ở vế sau dấu phẩy.',
    },
    {
      skill: 'vocab',
      question: 'Từ "adolescents" trong đoạn E đồng nghĩa với:',
      options: ['infants', 'university professors', 'retired adults', 'teenagers'],
      correct: 3,
      explanation: 'Adolescents = thanh thiếu niên (teenagers).',
    },
    {
      skill: 'strategy',
      question: 'Khi câu hỏi MCQ có một phương án dùng từ cực đoan như "always" hoặc "cannot remember a single definition", bạn nên:',
      options: [
        'Đối chiếu xem bài dùng từ rào đón hay khẳng định tuyệt đối.',
        'Chọn TRUE ngay lập tức vì câu nghe rất chắc chắn.',
        'Bỏ qua đoạn văn tương ứng để tiết kiệm thời gian đọc.',
        'Chọn luôn phương án có số lượng chữ dài nhất trong đề.',
      ],
      correct: 0,
      explanation: 'Bẫy cực đoan (extreme qualifiers) thường sai vì văn học thuật dùng từ rào đón ("often", "briefly").',
    },
  ],
};

export default IELTS_READ_SLEEP_MEMORY_LESSON;
