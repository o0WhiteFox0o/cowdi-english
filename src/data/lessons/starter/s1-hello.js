// Track: starter — Unit S1 Xin chào · Bài 1: Chào hỏi (format: picture, v2)

export const S1_HELLO_LESSON = {
  id: 's1-hello',
  contentVersion: 2,
  track: 'starter',
  format: 'picture',
  level: 'starter',
  cefrLevel: 'A1',
  unit: 's1-u1',
  title: 'Xin chào',
  description: 'Chào hỏi và nói cảm ơn bằng 6 từ đơn giản',
  icon: '👋',

  words: [
    { word: 'hello',     meaning: 'xin chào',   emoji: '👋', image: null, audio: null },
    { word: 'hi',        meaning: 'chào bạn',   emoji: '😊', image: null, audio: null },
    { word: 'bye',       meaning: 'tạm biệt',   emoji: '🖐️', image: null, audio: null },
    { word: 'yes',       meaning: 'có / vâng',  emoji: '✅', image: null, audio: null },
    { word: 'no',        meaning: 'không',      emoji: '❌', image: null, audio: null },
    { word: 'thank you', meaning: 'cảm ơn',     emoji: '🙏', image: null, audio: null },
  ],

  pattern: {
    en: 'Say ___!',
    vi: 'Nói ___ nào!',
    image: null,
    sceneBrief: 'Cowdi vẫy tay chào bạn nhỏ trước cổng nhà nắng đẹp, nền sáng, không có chữ.',
  },

  instructionsVi: {
    look:      'Chạm vào hình để nghe nhé!',
    listen:    'Nghe và chọn đúng hình.',
    match:     'Kéo chữ vào đúng hình.',
    pattern:   'Chọn hình để hoàn thành câu.',
    repeat:    'Nói theo Cowdi nào!',
    challenge: 'Thử thách: đúng 4 câu là qua!',
  },

  parentTip: 'Mỗi sáng thức dậy và trước khi đi học, vẫy tay nói "Hello!" và "Bye!" cùng con để tạo thói quen.',
};

export default S1_HELLO_LESSON;
