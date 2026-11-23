/**
 * Tên tiếng Việt, mô tả ngắn và emoji biểu cảm gợi ý cho 34 động tác pet.
 * Tách riêng khỏi shared/pet-motion.js (file sinh tự động bởi tools/bake-clips.mjs).
 */

export const CLIP_LABELS = Object.freeze({
  idle:           { vi: 'Nghỉ · Thở bình thường',          emoji: '😊' },
  look_around:    { vi: 'Nhìn quanh tò mò',                emoji: '👀' },
  fidget:         { vi: 'Vươn vai thư giãn',               emoji: '✨' },
  sleepy:         { vi: 'Buồn ngủ (60s rảnh)',             emoji: '😪' },
  sleep:          { vi: 'Ngủ say (120s rảnh)',             emoji: '💤' },
  wake_up:        { vi: 'Tỉnh giấc',                       emoji: '☀️' },
  attentive:      { vi: 'Chú ý nghe bài',                  emoji: '👀' },
  think:          { vi: 'Suy nghĩ (chờ 8s)',               emoji: '🤔' },
  cheer_small:    { vi: 'Ăn mừng nhẹ (đúng 1 câu)',        emoji: '✨' },
  cheer_big:      { vi: 'Ăn mừng lớn (chuỗi / xong bài)',  emoji: '🎉' },
  dance:          { vi: 'Nhảy múa ăn mừng (Tri kỷ)',       emoji: '🎶' },
  encourage:      { vi: 'Động viên (trả lời sai)',         emoji: '💪' },
  listen:         { vi: 'Lắng nghe (luyện nói)',           emoji: '👂' },
  talk:           { vi: 'Nói chuyện / Đọc mẫu',            emoji: '💬' },
  proud:          { vi: 'Tự hào (lên cấp kỹ năng)',        emoji: '🌟' },
  tap_head:       { vi: 'Xoa đầu vui vẻ',                  emoji: '💖' },
  tap_body:       { vi: 'Chạm thân nhột nhẹ',              emoji: '😄' },
  drag:           { vi: 'Đang bị nhấc lên',                emoji: '😮' },
  dizzy:          { vi: 'Chóng mặt (chạm nhiều lần)',      emoji: '💫' },
  wave:           { vi: 'Vẫy tay chào',                    emoji: '👋' },
  eat:            { vi: 'Ăn ngon (cho ăn)',                emoji: '😋' },
  greet_return:   { vi: 'Mừng bạn quay lại',               emoji: '🥰' },
  evolve:         { vi: 'Tiến hoá toả sáng',               emoji: '🌟' },
  prop_listening: { vi: 'Đeo tai nghe (giỏi Nghe)',        emoji: '🎧' },
  prop_speaking:  { vi: 'Hát / Luyện nói (giỏi Nói)',      emoji: '🎤' },
  prop_reading:   { vi: 'Đọc sách (giỏi Đọc)',             emoji: '📖' },
  prop_writing:   { vi: 'Viết bài (giỏi Viết)',            emoji: '✏️' },
  battle_ready:   { vi: 'Vào thế chiến đấu',               emoji: '🔥' },
  attack:         { vi: 'Tấn công thường',                 emoji: '💥' },
  crit:           { vi: 'Đòn chí mạng (Crit)',             emoji: '⚡' },
  dodge:          { vi: 'Né đòn nhanh',                    emoji: '💨' },
  hit:            { vi: 'Bị trúng đòn',                    emoji: '💢' },
  win:            { vi: 'Chiến thắng Đấu trường',          emoji: '🏆' },
  lose_proud:     { vi: 'Thua nhưng vẫn tự hào',           emoji: '❤️‍🔥' },
});

export const EMOJI_PRESETS = Object.freeze([
  '✨', '🎉', '💖', '💪', '🤔', '❓', '👀', '😊',
  '😄', '🥰', '😮', '😪', '💤', '☀️', '👋', '😋',
  '🌟', '🎶', '💬', '👂', '💫', '🔥', '💥', '⚡',
  '💨', '💢', '🏆', '❤️‍🔥', '🎧', '🎤', '📖', '✏️',
]);

export const EMOJI_POSITIONS = Object.freeze([
  { id: 'top-right',  labelVi: 'Trên phải' },
  { id: 'top-center', labelVi: 'Trên đầu' },
  { id: 'top-left',   labelVi: 'Trên trái' },
]);

export function getClipLabelVi(clipName) {
  return CLIP_LABELS[clipName]?.vi || clipName;
}

export function getDefaultClipEmoji(clipName) {
  return CLIP_LABELS[clipName]?.emoji || '✨';
}
