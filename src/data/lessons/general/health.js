// Track: general — Unit int-u7 · Sức khỏe (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const HEALTH_LESSON = {
  id: 'health',
  contentVersion: 2,
  track: 'general',
  level: 'advanced',
  cefrLevel: 'B1',
  unit: 'int-u7',
  title: 'Sức khỏe',
  description: 'Nêu triệu chứng bệnh, mua thuốc theo đơn và đưa ra lời khuyên chăm sóc sức khoẻ',
  icon: '🏥',
  objectives: [
    'Mô tả đúng triệu chứng thường gặp (fever, cough, headache, allergy) khi gặp bác sĩ hoặc dược sĩ',
    'Dùng đúng should / shouldn\'t + V nguyên mẫu để đưa ra lời khuyên chăm sóc sức khoẻ',
    'Dùng chính xác các cụm động từ y tế phổ biến (take medicine, have a check-up, stay healthy)',
  ],

  vocabulary: [
    v('Hospital', '/ˈhɑːspɪtəl/', 'noun', 'Bệnh viện', 'My uncle works at the local hospital.', 'Chú mình làm việc tại bệnh viện địa phương.', '🏥'),
    v('Medicine', '/ˈmedɪsən/', 'noun', 'Thuốc uống', 'Remember to take your medicine after meals.', 'Nhớ uống thuốc sau bữa ăn nhé.', '💊'),
    v('Sick', '/sɪk/', 'adjective', 'Bị ốm, không khoẻ', 'Minh stayed home because he felt sick.', 'Minh ở nhà vì bạn ấy thấy không khoẻ.', '🤒'),
    v('Healthy', '/ˈhelθi/', 'adjective', 'Khoẻ mạnh, lành mạnh', 'Sleep and vegetables keep you healthy.', 'Giấc ngủ và rau xanh giúp bạn khoẻ mạnh.', '💪'),
    v('Fever', '/ˈfiːvər/', 'noun', 'Cơn sốt', 'She had a mild fever last night.', 'Tối qua bạn ấy bị sốt nhẹ.', '🤕'),
    v('Cough', '/kɔːf/', 'noun', 'Cơn ho', 'Warm honey tea soothes a dry cough.', 'Trà mật ong ấm làm dịu cơn ho khan.', '😷'),
    v('Headache', '/ˈhedeɪk/', 'noun', 'Cơn đau đầu', 'Too much screen time gave me a headache.', 'Nhìn màn hình quá lâu khiến mình bị đau đầu.', '🤯'),
    v('Dentist', '/ˈdentɪst/', 'noun', 'Nha sĩ', 'Visit the dentist twice a year.', 'Hãy đi khám nha sĩ hai lần một năm.', '🦷'),
    v('Exercise', '/ˈeksərsaɪz/', 'noun', 'Tập thể dục', 'Daily exercise boosts your energy.', 'Tập thể dục hằng ngày tăng cường năng lượng.', '🏃'),
    v('Rest', '/rest/', 'verb', 'Nghỉ ngơi', 'You should rest until your fever drops.', 'Bạn nên nghỉ ngơi cho đến khi hạ sốt.', '🛌'),
    v('Allergy', '/ˈælərdʒi/', 'noun', 'Chứng dị ứng', 'Tell the doctor about any food allergy.', 'Hãy báo bác sĩ về mọi chứng dị ứng thức ăn.', '🤧'),
    v('Symptom', '/ˈsɪmptəm/', 'noun', 'Triệu chứng', 'Describe your symptoms clearly to the nurse.', 'Mô tả rõ các triệu chứng của bạn cho y tá.', '🔍'),
    v('Prescription', '/prɪˈskrɪpʃən/', 'noun', 'Đơn thuốc của bác sĩ', 'The doctor wrote a clear prescription.', 'Bác sĩ đã kê một đơn thuốc rõ ràng.', '📋'),
    v('Pharmacy', '/ˈfɑːrməsi/', 'noun', 'Nhà thuốc, hiệu thuốc', 'Mom picked up the medicine at the pharmacy.', 'Mẹ đã lấy thuốc ở nhà thuốc.', '💊'),
    v('Check-up', '/ˈtʃek ʌp/', 'noun', 'Buổi khám sức khoẻ tổng quát', 'An annual check-up catches problems early.', 'Khám tổng quát hằng năm giúp phát hiện sớm vấn đề.', '🩺'),
    v('Bandage', '/ˈbændɪdʒ/', 'noun', 'Băng gạc cá nhân', 'Put a clean bandage over the small cut.', 'Dán một miếng băng sạch lên vết cắt nhỏ.', '🩹'),
    v('Diet', '/ˈdaɪət/', 'noun', 'Chế độ ăn uống', 'A balanced diet includes fruit and grains.', 'Chế độ ăn cân bằng gồm trái cây và ngũ cốc.', '🥦'),
    v('Nutrition', '/nuːˈtrɪʃən/', 'noun', 'Dinh dưỡng', 'Good nutrition helps growing students stay focused.', 'Dinh dưỡng tốt giúp học sinh đang lớn tập trung hơn.', '🥗'),
    v('Stress', '/stres/', 'noun', 'Sự căng thẳng', 'Deep breathing helps lower daily stress.', 'Hít thở sâu giúp giảm căng thẳng hằng ngày.', '😌'),
    v('Wellness', '/ˈwelnəs/', 'noun', 'Sức khoẻ toàn diện (thể chất & tinh thần)', 'Good wellness balances work, play, and sleep.', 'Sức khoẻ toàn diện cân bằng giữa học, chơi và ngủ.', '🌿'),
  ],

  grammar: [
    {
      title: 'Đưa ra lời khuyên: should / shouldn\'t + động từ nguyên mẫu',
      explanation: 'Dùng "should + V" (nên) và "shouldn\'t + V" (không nên) để khuyên bảo nhẹ nhàng. Lưu ý: sau "should / shouldn\'t" luôn là động từ nguyên mẫu (KHÔNG có "to", KHÔNG thêm "-s").',
      examples: [
        { en: 'You should drink plenty of warm water.', vi: 'Bạn nên uống nhiều nước ấm.' },
        { en: "You shouldn't stay up late before exams.", vi: 'Bạn không nên thức khuya trước kỳ thi.' },
        { en: 'Should I take this medicine after breakfast?', vi: 'Mình có nên uống thuốc này sau bữa sáng không?' },
        { en: 'Everyone should get a regular check-up.', vi: 'Mọi người nên đi khám tổng quát định kỳ.' },
      ],
      mistakes: [
        { wrong: 'You should to rest more today.', right: 'You should rest more today.', note: 'Sau động từ khuyết thiếu "should" không bao giờ dùng "to".' },
        { wrong: 'He should drinks warm tea.', right: 'He should drink warm tea.', note: 'Sau "should", động từ luôn ở dạng nguyên mẫu dù chủ ngữ là "He/She".' },
      ],
    },
    {
      title: 'Cụm từ y tế chuẩn: have a + triệu chứng & take medicine',
      explanation: 'Khi nói bị triệu chứng đơn lẻ, dùng "have a fever / have a cough / have a headache / have an allergy". Đặc biệt: tiếng Anh dùng "take medicine" (uống thuốc), KHÔNG dùng "eat medicine" hay "drink medicine".',
      examples: [
        { en: 'Minh has a mild fever and a cough.', vi: 'Minh bị sốt nhẹ và ho.' },
        { en: 'I have a headache after working all afternoon.', vi: 'Mình bị đau đầu sau khi làm việc cả buổi chiều.' },
        { en: 'Take your medicine on time for three days.', vi: 'Hãy uống thuốc đúng giờ trong ba ngày.' },
        { en: 'A balanced diet and exercise improve wellness.', vi: 'Chế độ ăn cân bằng và tập thể dục nâng cao sức khoẻ toàn diện.' },
      ],
      mistakes: [
        { wrong: 'Remember to eat your medicine after lunch.', right: 'Remember to take your medicine after lunch.', note: 'Uống thuốc trong tiếng Anh luôn là "take medicine", không dịch từng chữ thành "eat" hay "drink".' },
      ],
    },
  ],

  reading: {
    title: 'Buổi khám sức khoẻ của Minh',
    passage: [
      'Dr. Nam: Hello, Minh! You look a little pale. What symptoms do you have today?',
      'Minh: I feel sick, doctor. I have a mild fever, a dry cough, and a headache since yesterday.',
      'Dr. Nam: Do you have any medicine allergy? Let me do a quick check-up.',
      'Minh: No allergies, doctor. Should I stay home from school?',
      'Dr. Nam: Yes, you should rest for two days and avoid stress. Here is a prescription—pick up the medicine at the pharmacy.',
      'Minh: Thank you! How can I stay healthy after I recover?',
      'Dr. Nam: Follow a balanced diet with good nutrition, do regular exercise, and visit your dentist twice a year for complete wellness!',
    ].join('\n'),
    translation: [
      'Bác sĩ Nam: Chào Minh! Trông cháu hơi xanh xao. Hôm nay cháu có những triệu chứng gì?',
      'Minh: Cháu thấy bị ốm ạ, bác sĩ. Cháu bị sốt nhẹ, ho khan và đau đầu từ hôm qua.',
      'Bác sĩ Nam: Cháu có dị ứng loại thuốc nào không? Để bác khám nhanh cho cháu nhé.',
      'Minh: Dạ cháu không bị dị ứng gì ạ. Cháu có nên nghỉ học ở nhà không bác?',
      'Bác sĩ Nam: Có, cháu nên nghỉ ngơi hai ngày và tránh căng thẳng. Đây là đơn thuốc—qua nhà thuốc lấy thuốc nhé.',
      'Minh: Cháu cảm ơn bác! Sau khi khoẻ lại cháu nên làm gì để giữ sức khoẻ ạ?',
      'Bác sĩ Nam: Cháu hãy giữ chế độ ăn cân bằng đủ dinh dưỡng, tập thể dục đều đặn và khám nha sĩ hai lần một năm để khoẻ mạnh toàn diện nhé!',
    ].join('\n'),
    highlights: ['Symptom', 'Sick', 'Fever', 'Cough', 'Headache', 'Medicine', 'Allergy', 'Rest', 'Stress', 'Prescription', 'Pharmacy', 'Healthy', 'Diet', 'Nutrition', 'Exercise', 'Dentist', 'Wellness'],
    questions: [
      {
        question: 'Minh đang gặp những triệu chứng nào?',
        options: ['Đau răng và đau chân', 'Sốt nhẹ, ho khan và đau đầu', 'Dị ứng thức ăn và đau bụng', 'Chỉ bị mệt nhẹ'],
        correct: 1,
        explanation: 'Minh mô tả: "I have a mild fever, a dry cough, and a headache since yesterday."',
      },
      {
        question: 'Bác sĩ Nam khuyên Minh nên nghỉ ngơi bao lâu?',
        options: ['Một tuần', 'Hai ngày', 'Một buổi sáng', 'Năm ngày'],
        correct: 1,
        explanation: 'Bác sĩ dặn: "Yes, you should rest for two days and avoid stress."',
      },
      {
        question: 'Minh cần mang đơn thuốc (prescription) tới đâu để lấy thuốc?',
        options: ['Thư viện', 'Nhà thuốc (pharmacy)', 'Phòng nha sĩ', 'Siêu thị'],
        correct: 1,
        explanation: 'Bác sĩ nói: "Here is a prescription—pick up the medicine at the pharmacy."',
      },
      {
        question: 'Bác sĩ Nam khuyên Minh đi khám nha sĩ bao lâu một lần?',
        options: ['Mỗi tháng một lần', 'Hai lần một năm', 'Ba năm một lần', 'Chỉ khi bị đau răng'],
        correct: 1,
        explanation: 'Câu cuối bác sĩ dặn: "visit your dentist twice a year for complete wellness!"',
      },
    ],
  },

  quiz: [
    {
      skill: 'vocab',
      question: 'Tờ giấy bác sĩ kê tên thuốc và liều dùng gọi là:',
      options: ['Symptom', 'Prescription', 'Bandage', 'Nutrition'],
      correct: 1,
      explanation: '"Prescription" = đơn thuốc của bác sĩ.',
    },
    {
      skill: 'vocab',
      question: 'Nơi bán thuốc theo đơn và không kê đơn gọi là:',
      options: ['Pharmacy', 'Dentist', 'Diet', 'Wellness'],
      correct: 0,
      explanation: '"Pharmacy" = nhà thuốc, hiệu thuốc.',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu khuyên ĐÚNG ngữ pháp:',
      options: [
        'You should to rest for two days.',
        'You should rests for two days.',
        'You should rest for two days.',
        'You should resting for two days.',
      ],
      correct: 2,
      explanation: 'Sau "should" luôn dùng động từ nguyên mẫu không "to": "should rest".',
    },
    {
      skill: 'grammar',
      question: 'Chọn động từ đúng cho cụm "uống thuốc": "Remember to ___ your medicine after meals."',
      options: ['eat', 'take', 'make', 'do'],
      correct: 1,
      explanation: 'Cụm từ chuẩn trong tiếng Anh là "take medicine".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu khuyên phủ định ĐÚNG khi bạn mình hay thức khuya:',
      options: [
        "You shouldn't stay up late.",
        "You shouldn't to stay up late.",
        "You don't should stay up late.",
        "You should not staying up late.",
      ],
      correct: 0,
      explanation: 'Phủ định của "should" là "shouldn\'t + V nguyên mẫu".',
    },
    {
      skill: 'usage',
      question: 'Bạn bị đứt tay nhẹ ở nhà bếp. Món đồ y tế bạn cần dùng là:',
      options: ['A prescription', 'A clean bandage', 'A high fever', 'A dentist'],
      correct: 1,
      explanation: '"Bandage" = băng gạc cá nhân dùng băng vết thương nhỏ.',
    },
    {
      skill: 'vocab',
      question: '"Check-up" trong lĩnh vực y tế nghĩa là:',
      options: ['Phẫu thuật khẩn cấp', 'Buổi khám sức khoẻ tổng quát', 'Đơn thuốc kháng sinh', 'Chế độ ăn kiêng'],
      correct: 1,
      explanation: '"An annual check-up" = buổi khám sức khoẻ tổng quát hằng năm.',
    },
    {
      skill: 'listening',
      audioText: 'You should drink warm water and get plenty of rest.',
      question: 'Nghe và chọn hai lời khuyên được nhắc đến:',
      options: [
        'Uống nước ấm và nghỉ ngơi nhiều',
        'Chạy bộ nhanh và ăn đồ cay',
        'Uống cà phê và thức khuya',
        'Đi khám nha sĩ và dán băng gạc',
      ],
      correct: 0,
      explanation: '"drink warm water" = uống nước ấm; "get plenty of rest" = nghỉ ngơi đầy đủ.',
    },
    {
      skill: 'listening',
      audioText: 'Minh has a mild fever and a dry cough.',
      question: 'Nghe và chọn triệu chứng của Minh:',
      options: ['Đau bụng và chóng mặt', 'Sốt nhẹ và ho khan', 'Đau răng và dị ứng', 'Đau chân và mệt mỏi'],
      correct: 1,
      explanation: '"a mild fever and a dry cough" = sốt nhẹ và ho khan.',
    },
  ],
};

export default HEALTH_LESSON;
