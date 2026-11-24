// Track: starter — Unit S3 Con vật · Bài 2: Nông trại (format: picture, v2)

export const S1_FARM_LESSON = {
  id: 's1-farm',
  contentVersion: 2,
  track: 'starter',
  format: 'picture',
  level: 'starter',
  cefrLevel: 'A1',
  unit: 's1-u3',
  title: 'Con vật nông trại',
  description: 'Gọi tên 6 con vật quen thuộc ở nông trại và đồng quê',
  icon: '🐄',

  words: [
    { word: 'cow',     meaning: 'con bò',   emoji: '🐄', image: null, audio: null },
    { word: 'pig',     meaning: 'con heo',  emoji: '🐷', image: null, audio: null },
    { word: 'duck',    meaning: 'con vịt',  emoji: '🦆', image: null, audio: null },
    { word: 'chicken', meaning: 'con gà',   emoji: '🐔', image: null, audio: null },
    { word: 'horse',   meaning: 'con ngựa', emoji: '🐴', image: null, audio: null },
    { word: 'buffalo', meaning: 'con trâu', emoji: '🐃', image: null, audio: null },
  ],

  pattern: {
    en: 'I see a ___.',
    vi: 'Em thấy một ___.',
    image: null,
    sceneBrief: 'Cowdi thăm cánh đồng quê Việt Nam nắng ấm có bò, heo, vịt, gà, ngựa và con trâu gặm cỏ, nền sáng, không có chữ.',
  },

  instructionsVi: {
    look:      'Chạm vào hình để nghe nhé!',
    listen:    'Nghe và chọn đúng hình.',
    match:     'Kéo chữ vào đúng hình.',
    pattern:   'Chọn hình để hoàn thành câu.',
    repeat:    'Nói theo Cowdi nào!',
    challenge: 'Thử thách: đúng 4 câu là qua!',
  },

  parentTip: 'Giả tiếng kêu của con vật ("Moo!", "Quack!") rồi đố con gọi tên con vật đó bằng tiếng Anh.',
};

export default S1_FARM_LESSON;
