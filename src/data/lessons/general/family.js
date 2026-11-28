// Track: general — Unit int-u1: Làm quen · Bài 2: Gia đình (v2)
// Soạn theo docs/05-implementation/content/briefs/int-u1.md và STD-LESSON-CONTENT-v1.0.

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration, extra = {}) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration, ...extra });

export const FAMILY_LESSON = {
  id: 'family',
  contentVersion: 2,
  track: 'general',
  level: 'beginner',
  cefrLevel: 'A1',
  unit: 'int-u1',
  title: 'Gia đình',
  description: 'Giới thiệu các thành viên trong gia đình, tuổi tác và nghề nghiệp đơn giản',
  icon: '👨‍👩‍👧‍👦',
  objectives: [
    'Gọi tên các thành viên chính trong gia đình bằng tiếng Anh',
    'Giới thiệu người thân với mẫu câu "This is my…", "He/She is…"',
    'Dùng đúng "have / has" để nói về anh chị em và thành viên gia đình',
  ],
  story: {
    npc: 'minh',
    introVi: 'Mình mang tấm ảnh gia đình qua Bến Đò Ông Tư. Cùng mình giới thiệu người thân bằng tiếng Anh nhé!',
  },

  vocabulary: [
    v('Family', '/ˈfæməli/', 'noun', 'Gia đình', 'I love my warm family.', 'Mình rất yêu gia đình ấm áp của mình.', '👨‍👩‍👧‍👦', { countable: true, plural: 'families' }),
    v('Father', '/ˈfɑːðər/', 'noun', 'Bố, cha', 'My father is a teacher.', 'Bố mình là một giáo viên.', '👨', { countable: true, plural: 'fathers' }),
    v('Mother', '/ˈmʌðər/', 'noun', 'Mẹ', 'My mother cooks very well.', 'Mẹ mình nấu ăn rất ngon.', '👩', { countable: true, plural: 'mothers' }),
    v('Parents', '/ˈperənts/', 'noun', 'Bố mẹ', 'My parents live in Can Tho.', 'Bố mẹ mình sống ở Cần Thơ.', '👫'),
    v('Brother', '/ˈbrʌðər/', 'noun', 'Anh / em trai', 'I have one older brother.', 'Mình có một anh trai.', '👦', { countable: true, plural: 'brothers' }),
    v('Sister', '/ˈsɪstər/', 'noun', 'Chị / em gái', 'Minh has a little sister named Mai.', 'Minh có một em gái tên là Mai.', '👧', { countable: true, plural: 'sisters' }),
    v('Son', '/sʌn/', 'noun', 'Con trai', 'Minh is their only son.', 'Minh là con trai duy nhất của họ.', '🧒', { countable: true, plural: 'sons' }),
    v('Daughter', '/ˈdɔːtər/', 'noun', 'Con gái', 'Mai is their young daughter.', 'Mai là con gái nhỏ của họ.', '👶', { countable: true, plural: 'daughters' }),
    v('Grandfather', '/ˈɡrænfɑːðər/', 'noun', 'Ông (nội / ngoại)', 'My grandfather drinks tea every morning.', 'Ông mình uống trà mỗi sáng.', '👴', { countable: true, plural: 'grandfathers' }),
    v('Grandmother', '/ˈɡrænmʌðər/', 'noun', 'Bà (nội / ngoại)', 'My grandmother makes sweet cakes for Tet.', 'Bà mình làm bánh ngọt dịp Tết.', '👵', { countable: true, plural: 'grandmothers' }),
    v('Uncle', '/ˈʌŋkl/', 'noun', 'Chú, bác, cậu', 'My uncle drives a blue motorbike.', 'Chú mình đi một chiếc xe máy màu xanh.', '🧔', { countable: true, plural: 'uncles' }),
    v('Aunt', '/ænt/', 'noun', 'Cô, dì, bác gái', 'My aunt works at a local clinic.', 'Cô mình làm việc ở phòng khám địa phương.', '👩‍⚕️', { countable: true, plural: 'aunts' }),
  ],

  grammar: [
    {
      title: 'Giới thiệu người thân: This is my… / He is… / She is…',
      explanation: 'Dùng "This is my + người thân" khi chỉ vào người hoặc ảnh. Sau đó dùng "He is…" (nam) hoặc "She is…" (nữ) để nói tuổi hoặc nghề nghiệp.',
      examples: [
        { en: 'This is my father.', vi: 'Đây là bố mình.' },
        { en: 'He is forty years old.', vi: 'Bố bốn mươi tuổi.' },
        { en: 'This is my mother. She is a doctor.', vi: 'Đây là mẹ mình. Mẹ là bác sĩ.' },
        { en: 'This is my sister, Mai. She is ten.', vi: 'Đây là em gái mình, Mai. Em ấy mười tuổi.' },
      ],
      mistakes: [
        { wrong: 'This is I mother.', right: 'This is my mother.', note: 'Trước danh từ chỉ người thân phải dùng tính từ sở hữu "my / his / her".' },
        { wrong: 'She a doctor.', right: 'She is a doctor.', note: 'Câu giới thiệu nghề nghiệp luôn cần động từ "is" và mạo từ "a/an".' },
      ],
    },
    {
      title: 'Nói về thành viên gia đình với have / has',
      explanation: 'Dùng "have" với I, you, we, they. Dùng "has" với he, she, it hoặc tên một người (Lan, Minh).',
      examples: [
        { en: 'I have one brother and one sister.', vi: 'Mình có một anh trai và một em gái.' },
        { en: 'Minh has a younger sister named Mai.', vi: 'Minh có một em gái tên là Mai.' },
        { en: 'She has a very big family.', vi: 'Bạn ấy có một gia đình rất đông.' },
        { en: 'We have dinner with our parents.', vi: 'Chúng mình ăn tối cùng bố mẹ.' },
      ],
      mistakes: [
        { wrong: 'He have one sister.', right: 'He has one sister.', note: 'Với chủ ngữ ngôi thứ 3 số ít (he, she, Minh) phải chia thành "has", không dùng "have".' },
        { wrong: 'I has two brothers.', right: 'I have two brothers.', note: 'Với "I" luôn dùng "have".' },
      ],
    },
  ],

  reading: {
    title: 'Xem ảnh gia đình',
    passage: [
      'Minh: Is this a photo of your family, Lan?',
      'Lan: Yes! Look, this is my father. He is a teacher at a high school.',
      'Minh: And who is next to him?',
      'Lan: That is my mother. My parents are very kind. They have one son and one daughter.',
      'Minh: Oh, so you have a brother!',
      'Lan: Right. My brother is twenty. And here are my grandfather and grandmother. They live near our uncle and aunt.',
      'Minh: What a nice family! I have a little sister, Mai. She wants to meet you.',
    ].join('\n'),
    translation: [
      'Minh: Đây là ảnh gia đình bạn à, Lan?',
      'Lan: Đúng rồi! Nhìn này, đây là bố mình. Bố là giáo viên trường cấp ba.',
      'Minh: Còn ai đứng cạnh bố bạn thế?',
      'Lan: Đó là mẹ mình. Bố mẹ mình rất hiền. Hai người có một con trai và một con gái.',
      'Minh: Ồ, vậy là bạn có anh trai!',
      'Lan: Đúng rồi. Anh trai mình hai mươi tuổi. Còn đây là ông và bà mình. Ông bà sống gần nhà chú và cô mình.',
      'Minh: Gia đình bạn dễ thương quá! Mình có một em gái nhỏ là Mai. Em ấy muốn gặp bạn lắm.',
    ].join('\n'),
    highlights: ['family', 'father', 'mother', 'parents', 'son', 'daughter', 'brother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'sister'],
    questions: [
      {
        question: 'Bố của Lan làm nghề gì?',
        options: ['Bác sĩ', 'Giáo viên', 'Tài xế', 'Kỹ sư'],
        correct: 1,
        explanation: 'Lan nói "this is my father. He is a teacher at a high school."',
      },
      {
        question: 'Bố mẹ của Lan có mấy người con?',
        options: ['Một người con', 'Ba người con', 'Hai người con', 'Bốn người con'],
        correct: 2,
        explanation: 'Lan kể "They have one son and one daughter." — tức 2 người con.',
      },
      {
        question: 'Ông bà của Lan sống ở gần ai?',
        options: ['Thầy Tom', 'Nhà Minh', 'Trường học của Lan', 'Chú và cô của Lan'],
        correct: 3,
        explanation: 'Câu "They live near our uncle and aunt." cho biết ông bà sống gần chú và cô.',
      },
      {
        question: 'Mai là ai trong đoạn hội thoại?',
        options: ['Em gái của Minh', 'Chị gái của Lan', 'Cô của Lan', 'Bạn cùng lớp của thầy Tom'],
        correct: 0,
        explanation: 'Minh nói "I have a little sister, Mai." — Mai là em gái của Minh.',
      },
    ],
  },

  quiz: [
    {
      skill: 'grammar',
      question: 'Chọn câu ĐÚNG ngữ pháp:',
      options: ['He have a little sister.', 'He has a little sister.', 'He having a little sister.', 'He are a little sister.'],
      correct: 1,
      explanation: 'Với chủ ngữ "He" (số ít), động từ phải chia là "has", không dùng "have".',
    },
    {
      skill: 'vocab',
      question: '"Parents" dùng để gọi ai?',
      options: ['Ông bà', 'Cô chú', 'Bố mẹ', 'Anh chị em'],
      correct: 2,
      explanation: '"Parents" nghĩa là cả bố và mẹ.',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "This is ___ mother. She is a doctor." (Mẹ tôi)',
      options: ['I', 'me', 'mine', 'my'],
      correct: 3,
      explanation: 'Trước danh từ "mother" cần tính từ sở hữu "my".',
    },
    {
      skill: 'vocab',
      question: 'Từ nào nghĩa là "con gái" của bố mẹ?',
      options: ['Daughter', 'Son', 'Aunt', 'Sister'],
      correct: 0,
      explanation: '"Daughter" = con gái (của bố mẹ); "Son" = con trai.',
    },
    {
      skill: 'usage',
      question: 'Lan muốn giới thiệu anh trai mình với thầy Tom. Lan nói:',
      options: ['He have my brother.', 'This is my brother.', 'My brother are here.', 'I am my brother.'],
      correct: 1,
      explanation: 'Mẫu câu chuẩn để giới thiệu người thân là "This is my + người thân".',
    },
    {
      skill: 'listening',
      audioText: 'Minh has a little sister named Mai.',
      question: 'Nghe và chọn thông tin đúng:',
      options: ['Minh có một anh trai tên Mai', 'Minh có hai em gái', 'Minh có một em gái tên Mai', 'Mai là cô của Minh'],
      correct: 2,
      explanation: '"a little sister named Mai" nghĩa là một em gái nhỏ tên là Mai.',
    },
    {
      skill: 'listening',
      audioText: 'My grandfather drinks tea every morning.',
      question: 'Nghe và chọn người được nhắc tới:',
      options: ['Bà', 'Bố', 'Chú', 'Ông'],
      correct: 3,
      explanation: '"grandfather" nghĩa là ông.',
    },
    {
      skill: 'grammar',
      question: 'Điền vào chỗ trống: "Lan and Minh ___ big families."',
      options: ['have', 'has', 'is', 'am'],
      correct: 0,
      explanation: '"Lan and Minh" là 2 người (số nhiều = they) nên dùng "have".',
    },
    {
      skill: 'vocab',
      question: 'Từ nào chỉ "chú / bác / cậu"?',
      options: ['Aunt', 'Uncle', 'Grandfather', 'Brother'],
      correct: 1,
      explanation: '"Uncle" là chú/bác/cậu; "Aunt" là cô/dì/bác gái.',
    },
  ],

  dialogPrompts: [
    {
      id: 'fam-1',
      npc: 'ong_tu',
      askEn: 'How many people are in your family?',
      askVi: 'Gia đình con có mấy người?',
      image: null,
      answers: [
        { en: 'There are four people in my family.', vi: 'Nhà con có bốn người.' },
        { en: 'My family has five people.', vi: 'Gia đình con có năm người.' },
      ],
      keywords: ['family'],
      replyEn: 'What a warm family!',
      replyVi: 'Một gia đình thật ấm áp!',
    },
    {
      id: 'fam-2',
      npc: 'lan',
      askEn: 'Do you have a brother or a sister?',
      askVi: 'Bạn có anh em trai hay chị em gái không?',
      image: null,
      answers: [
        { en: 'Yes, I have one sister.', vi: 'Có, mình có một em gái.' },
        { en: 'I have an older brother.', vi: 'Mình có một anh trai.' },
      ],
      keywords: ['have'],
      replyEn: 'That sounds great!',
      replyVi: 'Nghe thật tuyệt!',
    },
  ],

  trueFalse: [
    {
      en: 'This is a picture of a family.',
      vi: 'Đây là bức tranh một gia đình.',
      image: '/image/art/human_family.webp',
      isTrue: true,
      wordIds: ['family'],
    },
    {
      en: 'My sister is a boy.',
      vi: 'Chị/em gái tôi là con trai.',
      image: null,
      illustration: '👧',
      sceneBrief: 'Bé gái cười tươi đứng bên cạnh Cowdi, không chữ.',
      isTrue: false,
      whyVi: '"Sister" là chị hoặc em gái (nữ); con trai là "brother".',
      wordIds: ['sister', 'brother'],
    },
    {
      en: 'My father and mother are my parents.',
      vi: 'Bố và mẹ là bố mẹ của tôi.',
      image: null,
      illustration: '👫',
      sceneBrief: 'Bố và mẹ nắm tay đi dạo cùng con, không chữ.',
      isTrue: true,
      wordIds: ['father', 'mother', 'parents'],
    },
    {
      en: 'My grandfather is my mother\'s little sister.',
      vi: 'Ông tôi là em gái nhỏ của mẹ tôi.',
      image: null,
      illustration: '👴',
      sceneBrief: 'Ông già râu bạc mỉm cười uống trà trên hiên gỗ, không chữ.',
      isTrue: false,
      whyVi: '"Grandfather" là ông nội hoặc ông ngoại, không phải em gái của mẹ (aunt).',
      wordIds: ['grandfather', 'aunt'],
    },
    {
      en: 'My grandmother makes sweet cakes for Tet.',
      vi: 'Bà tôi làm bánh ngọt cho dịp Tết.',
      image: null,
      illustration: '👵',
      sceneBrief: 'Bà hiền hậu bày đĩa bánh mứt Tết trên bàn gỗ, không chữ.',
      isTrue: true,
      wordIds: ['grandmother'],
    },
    {
      en: 'My uncle is my father\'s sister.',
      vi: 'Chú/bác trai tôi là chị/em gái của bố tôi.',
      image: null,
      illustration: '🧔',
      sceneBrief: 'Người chú thân thiện đứng cạnh chiếc xe máy xanh, không chữ.',
      isTrue: false,
      whyVi: '"Uncle" là chú/bác/cậu (nam); chị/em gái của bố là "aunt".',
      wordIds: ['uncle', 'aunt'],
    },
  ],
};

export default FAMILY_LESSON;
