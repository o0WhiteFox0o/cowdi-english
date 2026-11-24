// Track: general — Unit int-u8 · So sánh (contentVersion 2)
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 4

const v = (word, phonetic, pos, meaning, example, exampleVi, illustration) =>
  ({ word, phonetic, pos, meaning, example, exampleVi, illustration });

export const COMPARISONS_LESSON = {
  id: 'comparisons',
  contentVersion: 2,
  track: 'general',
  level: 'advanced',
  cefrLevel: 'B1',
  unit: 'int-u8',
  title: 'So sánh',
  description: 'Sử dụng thành thạo so sánh hơn, so sánh nhất, so sánh ngang bằng và tính từ bất quy tắc',
  icon: '⚖️',
  objectives: [
    'Dùng đúng 18 từ so sánh thông dụng gồm cả dạng bất quy tắc (better, worse, worst, further, less)',
    'Chuyển đổi chính xác giữa so sánh hơn (-er / more), so sánh nhất (the -est / the most) và so sánh ngang bằng (as…as)',
    'Tránh các lỗi ghép thừa (more better, as taller as) và dùng đúng giới từ "to" sau "superior"',
  ],

  vocabulary: [
    v('Bigger', '/ˈbɪɡər/', 'adjective', 'Lớn hơn', 'This backpack is bigger than my old one.', 'Chiếc ba lô này lớn hơn chiếc cũ của mình.', '📐'),
    v('Smallest', '/ˈsmɔːlɪst/', 'adjective', 'Nhỏ nhất', 'Choose the smallest case that fits your tablet.', 'Chọn chiếc túi nhỏ nhất vừa với máy tính bảng của bạn.', '🔬'),
    v('Better', '/ˈbetər/', 'adjective', 'Tốt hơn (của good)', 'Her pronunciation sounds much better this month.', 'Phát âm của bạn ấy nghe tốt hơn nhiều trong tháng này.', '👍'),
    v('Worse', '/wɜːrs/', 'adjective', 'Tệ hơn (của bad)', 'The traffic gets worse during heavy rain.', 'Giao thông trở nên tệ hơn khi trời mưa lớn.', '📉'),
    v('Worst', '/wɜːrst/', 'adjective', 'Tệ nhất (của bad)', 'Leaving homework late is the worst habit.', 'Để bài tập tới sát giờ là thói quen tệ nhất.', '👎'),
    v('Faster', '/ˈfæstər/', 'adjective', 'Nhanh hơn', 'The new laptop starts faster than the old one.', 'Chiếc laptop mới khởi động nhanh hơn máy cũ.', '🏎️'),
    v('More', '/mɔːr/', 'adverb', 'Hơn, nhiều hơn', 'This model is more durable for daily travel.', 'Mẫu này bền hơn cho việc đi lại hằng ngày.', '📈'),
    v('Most', '/moʊst/', 'adverb', 'Nhất, nhiều nhất', 'Reliability is the most useful feature here.', 'Độ bền là tính năng hữu ích nhất ở đây.', '🏆'),
    v('Less', '/les/', 'adverb', 'Ít hơn', 'The lighter bag costs less money.', 'Chiếc cặp nhẹ hơn tốn ít tiền hơn.', '📉'),
    v('Than', '/ðæn/', 'conjunction', 'Hơn (dùng trong so sánh)', 'This screen is brighter than my phone.', 'Màn hình này sáng hơn điện thoại của mình.', '↔️'),
    v('Equal', '/ˈiːkwəl/', 'adjective', 'Bằng nhau, ngang nhau', 'Both tablets offer equal storage space.', 'Cả hai máy tính bảng có dung lượng lưu trữ bằng nhau.', '⚖️'),
    v('Heavier', '/ˈheviər/', 'adjective', 'Nặng hơn', 'A thick textbook is heavier than a tablet.', 'Sách giáo khoa dày nặng hơn một chiếc máy tính bảng.', '⚖️'),
    v('Lighter', '/ˈlaɪtər/', 'adjective', 'Nhẹ hơn', 'The gray backpack feels much lighter on my shoulders.', 'Chiếc ba lô xám nhẹ hơn hẳn trên vai mình.', '🪶'),
    v('Cheaper', '/ˈtʃiːpər/', 'adjective', 'Rẻ hơn', 'Model A is cheaper than Model B.', 'Mẫu A rẻ hơn Mẫu B.', '🏷️'),
    v('Stronger', '/ˈstrɔːŋɡər/', 'adjective', 'Mạnh hơn, chắc hơn', 'The zipper on this bag looks stronger.', 'Khoá kéo trên chiếc cặp này trông chắc chắn hơn.', '💪'),
    v('Thinner', '/ˈθɪnər/', 'adjective', 'Mỏng hơn', 'The newer notebook is thinner and sleeker.', 'Quyển sổ mới mỏng hơn và gọn hơn.', '📱'),
    v('Brighter', '/ˈbraɪtər/', 'adjective', 'Sáng hơn', 'A brighter display helps when reading outdoors.', 'Màn hình sáng hơn rất có ích khi đọc ngoài trời.', '☀️'),
    v('Further', '/ˈfɜːrðər/', 'adverb', 'Xa hơn / sâu hơn', 'Read further before making your final choice.', 'Đọc kỹ thêm nữa trước khi đưa ra lựa chọn cuối cùng.', '🛣️'),
    v('Superior', '/suːˈpɪriər/', 'adjective', 'Vượt trội hơn (+ to)', 'Its battery life is superior to older models.', 'Thời lượng pin của nó vượt trội hơn các mẫu cũ.', '🥇'),
  ],

  grammar: [
    {
      title: 'So sánh hơn, so sánh nhất & tính từ bất quy tắc',
      explanation: 'Tính từ ngắn thêm "-er / the -est"; tính từ dài dùng "more / the most". Nhớ 4 cặp bất quy tắc quan trọng: good → better → the best; bad → worse → the worst; little → less → the least; far → further/farther → the furthest/farthest. Lưu ý: "superior" đi với giới từ "to" (KHÔNG dùng "than").',
      examples: [
        { en: 'The gray backpack is lighter and cheaper than the blue one.', vi: 'Ba lô xám nhẹ hơn và rẻ hơn ba lô xanh.' },
        { en: 'This is the most practical notebook in the shop.', vi: 'Đây là quyển sổ thực dụng nhất trong cửa hàng.' },
        { en: 'Your second essay is much better than the first.', vi: 'Bài luận thứ hai của bạn tốt hơn nhiều so với bài đầu.' },
        { en: 'Its sound quality is superior to the older speaker.', vi: 'Chất lượng âm thanh của nó vượt trội hơn chiếc loa cũ.' },
      ],
      mistakes: [
        { wrong: 'This tablet is more better than mine.', right: 'This tablet is better than mine. / much better than mine.', note: '"Better" đã là so sánh hơn nên không dùng "more"; muốn nhấn mạnh thì dùng "much better".' },
        { wrong: 'Model B is superior than Model A.', right: 'Model B is superior to Model A.', note: '"Superior" luôn đi với giới từ "to", không dùng "than".' },
      ],
    },
    {
      title: 'So sánh ngang bằng: as + tính từ nguyên mẫu + as',
      explanation: 'Dùng "as + tính từ/trạng từ nguyên mẫu + as" để nói ngang bằng, và "not as … as" để nói không bằng. Tuyệt đối KHÔNG chia đuôi "-er" hay "more" ở giữa hai chữ "as".',
      examples: [
        { en: 'Model A is as fast as Model B.', vi: 'Mẫu A nhanh ngang Mẫu B.' },
        { en: 'This backpack is not as heavy as my old one.', vi: 'Chiếc ba lô này không nặng bằng chiếc cũ của mình.' },
        { en: 'Lan runs as quickly as Minh.', vi: 'Lan chạy nhanh ngang Minh.' },
        { en: 'The cheaper bag is just as strong as the pricey one.', vi: 'Chiếc cặp rẻ hơn cũng bền ngang chiếc đắt tiền.' },
      ],
      mistakes: [
        { wrong: 'This bag is not as heavier as that one.', right: 'This bag is not as heavy as that one.', note: 'Giữa "as … as" luôn giữ nguyên tính từ gốc ("heavy"), không dùng "heavier".' },
      ],
    },
  ],

  reading: {
    title: 'Chọn máy tính bảng học tập nào?',
    passage: [
      'Lan: Minh, help me compare these two study tablets! Model A is thinner, lighter, and cheaper than Model B.',
      'Minh: True, and it costs less money. However, Model B has a brighter screen and runs faster than Model A.',
      'Lan: What about battery life? Is Model A equal to Model B?',
      'Minh: No, Model B is much better—in fact, its battery is superior to every other model here.',
      'Lan: The worst part of Model B is its weight—it feels heavier in a backpack. Still, it is the most reliable choice!',
      'Minh: Agreed! A stronger, bigger screen makes reading further notes easier, even if it is not the smallest.',
    ].join('\n'),
    translation: [
      'Lan: Minh ơi, giúp mình so sánh hai chiếc máy tính bảng học tập này với! Mẫu A mỏng hơn, nhẹ hơn và rẻ hơn Mẫu B.',
      'Minh: Đúng rồi, mà nó cũng tốn ít tiền hơn. Tuy nhiên Mẫu B có màn hình sáng hơn và chạy nhanh hơn Mẫu A.',
      'Lan: Còn thời lượng pin thì sao? Mẫu A có ngang bằng Mẫu B không?',
      'Minh: Không, Mẫu B tốt hơn nhiều—thực tế pin của nó vượt trội hơn mọi mẫu khác ở đây.',
      'Lan: Điểm tệ nhất của Mẫu B là cân nặng—bỏ vào ba lô thấy nặng hơn. Dù vậy nó vẫn là lựa chọn đáng tin cậy nhất!',
      'Minh: Đồng ý! Màn hình lớn hơn và chắc chắn hơn giúp đọc ghi chú dài dễ hơn, dù nó không phải chiếc nhỏ nhất.',
    ].join('\n'),
    highlights: ['Thinner', 'Lighter', 'Cheaper', 'Than', 'Less', 'Brighter', 'Faster', 'Equal', 'Better', 'Superior', 'Worst', 'Heavier', 'Most', 'Stronger', 'Bigger', 'Further', 'Smallest'],
    questions: [
      {
        question: 'Mẫu A có những ưu điểm nào so với Mẫu B?',
        options: ['Màn hình sáng hơn và pin lâu hơn', 'Mỏng hơn, nhẹ hơn và rẻ hơn', 'Chạy nhanh hơn và lớn hơn', 'Bền hơn và đắt hơn'],
        correct: 1,
        explanation: 'Lan nêu rõ: "Model A is thinner, lighter, and cheaper than Model B."',
      },
      {
        question: 'Điểm nào của Mẫu B vượt trội hơn mọi mẫu khác?',
        options: ['Giá bán', 'Trọng lượng', 'Thời lượng pin', 'Màu sắc vỏ máy'],
        correct: 2,
        explanation: 'Minh nói: "in fact, its battery is superior to every other model here."',
      },
      {
        question: 'Nhược điểm tệ nhất của Mẫu B theo nhận xét của Lan là gì?',
        options: ['Màn hình quá tối', 'Trọng lượng nặng hơn khi bỏ vào ba lô', 'Không kết nối được Wi-Fi', 'Kích thước quá nhỏ'],
        correct: 1,
        explanation: 'Lan nói: "The worst part of Model B is its weight—it feels heavier in a backpack."',
      },
      {
        question: 'Cuối cùng hai bạn nghiêng về lựa chọn nào?',
        options: ['Mẫu B vì đáng tin cậy nhất và màn hình lớn, sáng hơn', 'Mẫu A vì nhỏ nhất', 'Không mua chiếc nào', 'Mua cả hai chiếc'],
        correct: 0,
        explanation: 'Lan kết luận Mẫu B "is the most reliable choice!" và Minh đồng tình ("Agreed!").',
      },
    ],
  },

  quiz: [
    {
      skill: 'grammar',
      question: 'Chọn câu so sánh hơn ĐÚNG với tính từ bất quy tắc "good":',
      options: [
        'This notebook is more good than that one.',
        'This notebook is more better than that one.',
        'This notebook is much better than that one.',
        'This notebook is gooder than that one.',
      ],
      correct: 2,
      explanation: 'So sánh hơn của "good" là "better"; nhấn mạnh bằng "much better".',
    },
    {
      skill: 'grammar',
      question: 'Điền giới từ đúng: "This battery is superior ___ the older version."',
      options: ['than', 'to', 'from', 'with'],
      correct: 1,
      explanation: '"Superior" luôn đi với giới từ "to", không dùng "than".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu so sánh ngang bằng ĐÚNG:',
      options: [
        'This bag is not as heavier as my old bag.',
        'This bag is not as heavy as my old bag.',
        'This bag is not as more heavy as my old bag.',
        'This bag is not heavy as my old bag.',
      ],
      correct: 1,
      explanation: 'Giữa "as … as" dùng tính từ nguyên mẫu "heavy".',
    },
    {
      skill: 'vocab',
      question: '"Worse" và "Worst" lần lượt là dạng so sánh hơn và so sánh nhất của tính từ nào?',
      options: ['Good', 'Bad', 'Little', 'Far'],
      correct: 1,
      explanation: 'Bad → worse (tệ hơn) → the worst (tệ nhất).',
    },
    {
      skill: 'grammar',
      question: 'Điền dạng đúng: "A feather is ___ than a stone." (nhẹ hơn)',
      options: ['more light', 'lighter', 'lightest', 'more lighter'],
      correct: 1,
      explanation: '"Light" là tính từ ngắn → "lighter than".',
    },
    {
      skill: 'grammar',
      question: 'Chọn câu đúng khi so sánh chi phí ít hơn:',
      options: [
        'This model costs less money than that one.',
        'This model costs lesser money than that one.',
        'This model costs few money than that one.',
        'This model costs little money than that one.',
      ],
      correct: 0,
      explanation: 'Với danh từ không đếm được "money", so sánh ít hơn dùng "less".',
    },
    {
      skill: 'usage',
      question: 'Bạn muốn nói căn phòng mới sáng hơn và rộng hơn phòng cũ. Câu tự nhiên nhất là:',
      options: [
        'The new room is brighter and bigger than the old one.',
        'The new room is more bright and more big than the old one.',
        'The new room is brightest than the old one.',
        'The new room is superior than the old one.',
      ],
      correct: 0,
      explanation: '"Bright" → "brighter", "big" → "bigger" (nhân đôi "g").',
    },
    {
      skill: 'listening',
      audioText: 'This backpack is not as heavy as my old one.',
      question: 'Nghe và chọn ý đúng:',
      options: [
        'Chiếc ba lô này nặng hơn chiếc cũ.',
        'Chiếc ba lô này không nặng bằng chiếc cũ.',
        'Hai chiếc ba lô nặng bằng nhau.',
        'Chiếc ba lô này là chiếc nặng nhất.',
      ],
      correct: 1,
      explanation: '"not as heavy as" = không nặng bằng.',
    },
    {
      skill: 'listening',
      audioText: 'The new laptop starts faster and runs quieter than the old one.',
      question: 'Nghe và chọn ưu điểm của chiếc laptop mới:',
      options: ['Khởi động nhanh hơn và chạy êm hơn', 'Nặng hơn và đắt hơn', 'Màn hình tối hơn', 'Pin yếu hơn'],
      correct: 0,
      explanation: '"starts faster and runs quieter" = khởi động nhanh hơn và chạy êm hơn.',
    },
  ],
};

export default COMPARISONS_LESSON;
