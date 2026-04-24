// Re-export từ thư mục vocab/ (mỗi chủ đề là 1 file riêng)
// Giữ file này để các import cũ `../data/vocab-topics` vẫn hoạt động.
export {
  VOCAB_TOPICS,
  getAllTopicWords,
  getTopicWordCount,
  getTopicSize,
  getSubtopicSize,
} from './vocab/index.js';
