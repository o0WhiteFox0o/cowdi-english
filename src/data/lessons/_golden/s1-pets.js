// GOLDEN — bài mẫu chuẩn cấp 1 (Mới học), định dạng `picture`.
// Gemini: bắt chước đúng cấu trúc, độ dài và giọng của bài này khi soạn bài s1-* khác.
// Chuẩn: docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md mục 3.

export const S1_PETS_LESSON = {
  id: 's1-pets',
  contentVersion: 2,
  track: 'starter',
  format: 'picture',
  level: 'starter',
  cefrLevel: 'A1',
  unit: 's1-u3',
  title: 'Thú cưng',
  description: 'Gọi tên 6 con vật nuôi trong nhà',
  icon: '🐱',

  // 5–6 từ, vẽ được, không phiên âm. image: ảnh 512×512 (chưa có thì để emoji).
  words: [
    { word: 'cat',    meaning: 'con mèo', emoji: '🐱', image: '/image/words/cat.webp' },
    { word: 'dog',    meaning: 'con chó', emoji: '🐶', image: '/image/words/dog.webp' },
    { word: 'fish',   meaning: 'con cá',  emoji: '🐟', image: '/image/words/fish.webp' },
    { word: 'bird',   meaning: 'con chim', emoji: '🐦', image: '/image/words/bird.webp' },
    { word: 'rabbit', meaning: 'con thỏ', emoji: '🐰', image: '/image/words/rabbit.webp' },
    { word: 'mouse',  meaning: 'con chuột', emoji: '🐭', image: '/image/words/mouse.webp' },
  ],

  // Một mẫu câu, chỗ trống ___ thay bằng hình khi học.
  pattern: {
    en: 'I have a ___.',
    vi: 'Em có một ___.',
    image: '/image/scenes/s1-pets.webp',
    sceneBrief: 'Cowdi đứng giữa phòng khách, quanh là 6 con vật của bài, mỗi con một ô rõ ràng, nền sáng, không có chữ.',
  },

  // Lời hướng dẫn tiếng Việt cho từng bước (≤8 chữ, có nút loa đọc).
  instructionsVi: {
    look:      'Chạm vào hình để nghe nhé!',
    listen:    'Nghe và chọn đúng hình.',
    match:     'Kéo chữ vào đúng hình.',
    pattern:   'Chọn hình để hoàn thành câu.',
    repeat:    'Nói theo Cowdi nào!',
    challenge: 'Thử thách: đúng 4 câu là qua!',
  },

  // Gợi ý cho phụ huynh, hiện ở cuối bài (tuỳ chọn).
  parentTip: 'Chỉ vào con vật thật hoặc tranh trong sách, hỏi con "What is it?" để con trả lời bằng tiếng Anh.',
};
