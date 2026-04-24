// Auto-generated from scripts/split-vocab.mjs — đừng sửa trực tiếp file này
// Mỗi chủ đề được tách thành một file riêng trong thư mục này để dễ phát triển.

import { HUMAN_TOPIC } from './human.js';
import { EATING_TOPIC } from './eating.js';
import { DRINKING_TOPIC } from './drinking.js';
import { HOUSE_TOPIC } from './house.js';
import { TRANSPORTATION_TOPIC } from './transportation.js';
import { LOVE_TOPIC } from './love.js';
import { NUMBERS_TOPIC } from './numbers.js';
import { SPORTS_TOPIC } from './sports.js';
import { HOLIDAYS_TOPIC } from './holidays.js';
import { ANIMALS_TOPIC } from './animals.js';
import { NATURE_TOPIC } from './nature.js';
import { PUBLIC_PLACES_TOPIC } from './public-places.js';
import { COUNTRIES_TOPIC } from './countries.js';

export const VOCAB_TOPICS = [
  HUMAN_TOPIC,
  EATING_TOPIC,
  DRINKING_TOPIC,
  HOUSE_TOPIC,
  TRANSPORTATION_TOPIC,
  LOVE_TOPIC,
  NUMBERS_TOPIC,
  SPORTS_TOPIC,
  HOLIDAYS_TOPIC,
  ANIMALS_TOPIC,
  NATURE_TOPIC,
  PUBLIC_PLACES_TOPIC,
  COUNTRIES_TOPIC,
];

/** Lấy toàn bộ từ vựng (flat) */
export function getAllTopicWords() {
  return VOCAB_TOPICS.flatMap((topic) =>
    topic.subtopics.flatMap((sub) => sub.words)
  );
}

/** Tổng số từ trên tất cả chủ đề */
export function getTopicWordCount() {
  return VOCAB_TOPICS.reduce(
    (sum, topic) =>
      sum + topic.subtopics.reduce((s, sub) => s + sub.words.length, 0),
    0
  );
}

/** Số từ của một chủ đề */
export function getTopicSize(topicId) {
  const topic = VOCAB_TOPICS.find((t) => t.id === topicId);
  if (!topic) return 0;
  return topic.subtopics.reduce((sum, sub) => sum + sub.words.length, 0);
}

/** Số từ của một subtopic */
export function getSubtopicSize(topicId, subtopicId) {
  const topic = VOCAB_TOPICS.find((t) => t.id === topicId);
  if (!topic) return 0;
  const sub = topic.subtopics.find((s) => s.id === subtopicId);
  return sub ? sub.words.length : 0;
}
