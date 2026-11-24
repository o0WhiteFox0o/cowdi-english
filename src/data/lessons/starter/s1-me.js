// Track: starter — Unit S1 Xin chào · Bài 2: Em là ai (format: picture, v2)

export const S1_ME_LESSON = {
  id: 's1-me',
  contentVersion: 2,
  track: 'starter',
  format: 'picture',
  level: 'starter',
  cefrLevel: 'A1',
  unit: 's1-u1',
  title: 'Em là ai',
  description: 'Gọi tên 6 người quen xung quanh em',
  icon: '🧒',

  words: [
    { word: 'boy',    meaning: 'bé trai',   emoji: '👦', image: null, audio: null },
    { word: 'girl',   meaning: 'bé gái',    emoji: '👧', image: null, audio: null },
    { word: 'baby',   meaning: 'em bé',     emoji: '👶', image: null, audio: null },
    { word: 'man',    meaning: 'chú / ông', emoji: '👨', image: null, audio: null },
    { word: 'woman',  meaning: 'cô / bà',   emoji: '👩', image: null, audio: null },
    { word: 'friend', meaning: 'người bạn', emoji: '🤝', image: null, audio: null },
  ],

  pattern: {
    en: 'This is a ___.',
    vi: 'Đây là một ___.',
    image: null,
    sceneBrief: 'Cowdi đứng cạnh một bé trai, bé gái và em bé ở công viên sáng sủa, không có chữ.',
  },

  instructionsVi: {
    look:      'Chạm vào hình để nghe nhé!',
    listen:    'Nghe và chọn đúng hình.',
    match:     'Kéo chữ vào đúng hình.',
    pattern:   'Chọn hình để hoàn thành câu.',
    repeat:    'Nói theo Cowdi nào!',
    challenge: 'Thử thách: đúng 4 câu là qua!',
  },

  parentTip: 'Xem ảnh gia đình cùng con và chỉ vào từng người để con nói "boy", "girl", "baby" hay "friend".',
};

export default S1_ME_LESSON;
