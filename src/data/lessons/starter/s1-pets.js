// Track: starter — Unit S3 Con vật · Bài 1: Thú cưng (format: picture, v2)
// Bám sát bài golden src/data/lessons/_golden/s1-pets.js (dùng emoji tạm đến Đợt Media S1–S3)

export const S1_PETS_LESSON = {
  id: 's1-pets',
  contentVersion: 2,
  track: 'starter',
  format: 'picture',
  level: 'starter',
  cefrLevel: 'A1',
  unit: 's1-u3',
  category: 'animal',
  title: 'Thú cưng',
  description: 'Gọi tên 6 con vật nuôi quen thuộc trong nhà',
  icon: '🐱',

  words: [
    { word: 'cat',    meaning: 'con mèo',   emoji: '🐱', image: null, audio: null },
    { word: 'dog',    meaning: 'con chó',   emoji: '🐶', image: null, audio: null },
    { word: 'fish',   meaning: 'con cá',    emoji: '🐟', image: null, audio: null },
    { word: 'bird',   meaning: 'con chim',  emoji: '🐦', image: null, audio: null },
    { word: 'rabbit', meaning: 'con thỏ',   emoji: '🐰', image: null, audio: null },
    { word: 'mouse',  meaning: 'con chuột', emoji: '🐭', image: null, audio: null },
  ],

  pattern: {
    en: 'I have a ___.',
    vi: 'Em có một ___.',
    image: null,
    sceneBrief: 'Cowdi đứng giữa phòng khách, quanh là 6 con vật của bài (mèo, chó, cá, chim, thỏ, chuột), mỗi con một ô rõ ràng, nền sáng, không có chữ.',
  },

  instructionsVi: {
    look:      'Chạm vào hình để nghe nhé!',
    listen:    'Nghe và chọn đúng hình.',
    match:     'Kéo chữ vào đúng hình.',
    pattern:   'Chọn hình để hoàn thành câu.',
    repeat:    'Nói theo Cowdi nào!',
    challenge: 'Thử thách: đúng 4 câu là qua!',
  },

  parentTip: 'Chỉ vào con vật thật hoặc tranh trong sách, hỏi con "What is it?" để con trả lời bằng tiếng Anh.',
};

export default S1_PETS_LESSON;
