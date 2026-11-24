// Bài mẫu chuẩn (golden). Không đưa vào lộ trình; dùng làm khuôn cho Gemini và để
// scripts/validate-lessons.mjs kiểm tra rằng chuẩn v2 tự nó đạt được.
// Khi một bài golden được duyệt để dùng thật (ví dụ greetings v2), chuyển nó sang
// thư mục track tương ứng và xoá bản cũ.
import { S1_PETS_LESSON } from './s1-pets.js';
import { GREETINGS_LESSON_V2 } from './greetings.js';
import { IELTS_READ_ROOFTOP_FARMS_LESSON } from './ielts-read-rooftop-farms.js';

export const GOLDEN_LESSONS = [S1_PETS_LESSON, GREETINGS_LESSON_V2, IELTS_READ_ROOFTOP_FARMS_LESSON];
