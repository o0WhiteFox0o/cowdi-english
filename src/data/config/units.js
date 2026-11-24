// ── Learning Path Units (3 nhóm: Mới học · Trung bình · Luyện thi) ─────────
// Thiết kế: docs/04-design/SDD-LEARNING-GROUPS-v2.0.md §3

export const BEGINNER_UNITS = [
  {
    id: 's1-u1',
    title: 'S1 · Xin chào',
    subtitle: 'Chào hỏi, em là ai và số 1–10',
    icon: '👋',
    color: '#7DBE4B',
    lessons: ['s1-hello', 's1-me', 's1-num-1', 's1-num-2'],
    checkpoint: { title: 'Kiểm tra Unit S1' },
  },
  { id: 's1-u2',  title: 'S2 · Màu và hình',      subtitle: 'Màu sắc, hình khối và kích cỡ',     icon: '🎨', color: '#8BC34A', lessons: [], comingSoon: true, checkpoint: { title: 'Kiểm tra Unit S2' } },
  { id: 's1-u3',  title: 'S3 · Con vật',          subtitle: 'Thú cưng, nông trại, rừng và biển', icon: '🐱', color: '#66BB6A', lessons: [], comingSoon: true, checkpoint: { title: 'Kiểm tra Unit S3' } },
  { id: 's1-u4',  title: 'S4 · Gia đình & cơ thể', subtitle: 'Người thân, khuôn mặt và cơ thể',  icon: '👨‍👩‍👧', color: '#4CAF50', lessons: [], comingSoon: true, checkpoint: { title: 'Kiểm tra Unit S4' } },
  { id: 's1-u5',  title: 'S5 · Ăn uống',          subtitle: 'Trái cây, đồ ăn, nước uống và rau', icon: '🍎', color: '#43A047', lessons: [], comingSoon: true, checkpoint: { title: 'Kiểm tra Unit S5' } },
  { id: 's1-u6',  title: 'S6 · Chữ cái A–Z',      subtitle: '26 chữ cái kèm hình minh hoạ',      icon: '🔤', color: '#2E7D32', lessons: [], comingSoon: true, checkpoint: { title: 'Kiểm tra Unit S6' } },
  { id: 's1-u7',  title: 'S7 · Trường & đồ chơi', subtitle: 'Đồ dùng học tập, lớp học, đồ chơi', icon: '🎒', color: '#26A69A', lessons: [], comingSoon: true, checkpoint: { title: 'Kiểm tra Unit S7' } },
  { id: 's1-u8',  title: 'S8 · Quần áo & nhà em', subtitle: 'Trang phục, phòng ốc và nhà bếp',   icon: '👕', color: '#00ACC1', lessons: [], comingSoon: true, checkpoint: { title: 'Kiểm tra Unit S8' } },
  { id: 's1-u9',  title: 'S9 · Hành động & cảm xúc', subtitle: 'Chuyển động, sinh hoạt, cảm xúc', icon: '🏃', color: '#29B6F6', lessons: [], comingSoon: true, checkpoint: { title: 'Kiểm tra Unit S9' } },
  { id: 's1-u10', title: 'S10 · Ngoài trời',      subtitle: 'Thời tiết, thiên nhiên, phương tiện', icon: '☀️', color: '#42A5F5', lessons: [], comingSoon: true, checkpoint: { title: 'Kiểm tra Unit S10' } },
];

export const INTERMEDIATE_UNITS = [
  {
    id: 'int-u1',
    title: 'Làm quen',
    subtitle: 'Chào hỏi, gia đình, màu sắc và số đếm',
    icon: '🌱',
    color: '#7DBE4B',
    lessons: ['greetings', 'family', 'colors', 'numbers'],
    checkpoint: { title: 'Kiểm tra Unit 1 · Làm quen' },
  },
  {
    id: 'int-u2',
    title: 'Quanh ta',
    subtitle: 'Trường học, thời tiết, nghề nghiệp và cơ thể',
    icon: '🏫',
    color: '#4EA8E8',
    lessons: ['school', 'weather', 'jobs', 'body'],
    checkpoint: { title: 'Kiểm tra Unit 2 · Quanh ta' },
  },
  {
    id: 'int-u3',
    title: 'Đời sống',
    subtitle: 'Quần áo, nhà cửa, cảm xúc và sở thích',
    icon: '🏡',
    color: '#F4A83A',
    lessons: ['clothing', 'house', 'emotions', 'hobbies'],
    checkpoint: { title: 'Kiểm tra Unit 3 · Đời sống' },
  },
  {
    id: 'int-u4',
    title: 'Ngữ pháp nền',
    subtitle: 'Đại từ, mạo từ, giới từ, câu hỏi WH và số đếm nền tảng',
    icon: '🧱',
    color: '#5ECFC0',
    lessons: ['pronouns', 'articles', 'prepositions-place', 'wh-questions', 'numbers-basic'],
    checkpoint: { title: 'Kiểm tra Unit 4 · Ngữ pháp nền' },
  },
  {
    id: 'int-u5',
    title: 'Giao tiếp hằng ngày',
    subtitle: 'Câu nói thường dùng, ngày giờ, chỉ đường và giá cả',
    icon: '💬',
    color: '#9C7BE0',
    lessons: ['daily-phrases', 'time-and-date', 'directions', 'money-prices'],
    checkpoint: { title: 'Kiểm tra Unit 5 · Giao tiếp hằng ngày' },
  },
  {
    id: 'int-u6',
    title: 'Tình huống',
    subtitle: 'Nhà hàng, sân bay, thói quen, ẩm thực và du lịch',
    icon: '✈️',
    color: '#EA5A5A',
    lessons: ['at-restaurant', 'at-airport', 'daily-routine', 'food', 'travel'],
    checkpoint: { title: 'Kiểm tra Unit 6 · Tình huống' },
  },
  {
    id: 'int-u7',
    title: 'Thế giới quanh ta',
    subtitle: 'Thiên nhiên, công nghệ, mua sắm và sức khoẻ',
    icon: '🌍',
    color: '#F48FB1',
    lessons: ['nature', 'technology', 'shopping', 'health'],
    checkpoint: { title: 'Kiểm tra Unit 7 · Thế giới quanh ta' },
  },
  {
    id: 'int-u8',
    title: 'Ngữ pháp và diễn đạt',
    subtitle: 'Các thì tiếng Anh, so sánh và kỹ năng giao tiếp',
    icon: '📐',
    color: '#7DBE4B',
    lessons: ['tenses', 'comparisons', 'communication-skills'],
    checkpoint: { title: 'Kiểm tra Unit 8 · Ngữ pháp và diễn đạt' },
  },
  {
    id: 'int-u9',
    title: 'Xã hội',
    subtitle: 'Môi trường, truyền thông và văn hoá',
    icon: '📰',
    color: '#4EA8E8',
    lessons: ['environment', 'media', 'culture'],
    checkpoint: { title: 'Kiểm tra Unit 9 · Xã hội' },
  },
  {
    id: 'int-u10',
    title: 'Công việc và tri thức',
    subtitle: 'Kinh doanh, khoa học và giáo dục',
    icon: '🏆',
    color: '#F4A83A',
    lessons: ['business', 'science', 'education'],
    checkpoint: { title: 'Kiểm tra tổng kết Trung bình' },
  },
];

// Unit dùng chung đầu các lộ trình Luyện thi (IELTS, TOEIC, B1, B2)
export const EXAM_INTRO_UNIT = {
  id: 'exam-intro',
  title: 'Nhập môn luyện thi',
  subtitle: 'Chiến lược làm bài và thực hành đề mẫu',
  icon: '🎯',
  color: '#D32F2F',
  lessons: ['exam-strategies', 'test-practice'],
  checkpoint: { title: 'Kiểm tra Nhập môn luyện thi' },
};

export const EXAM_PRON_UNIT = {
  id: 'exam-pron',
  title: 'Phát âm chuẩn',
  subtitle: 'Bảng chữ cái, nguyên âm, phụ âm, âm khó và trọng âm',
  icon: '🎙️',
  color: '#C62828',
  lessons: [
    'alphabet',
    'pronunciation-vowels',
    'pronunciation-consonants',
    'pronunciation-tricky',
    'pronunciation-stress',
  ],
  checkpoint: { title: 'Kiểm tra Phát âm chuẩn' },
};

// Giữ export UNITS để các import cũ (HomePage, v.v.) không bị vỡ
export const UNITS = [...BEGINNER_UNITS, ...INTERMEDIATE_UNITS];
