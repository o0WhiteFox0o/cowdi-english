# TPL-INTERMEDIATE — Mẫu brief và khung bài cấp 2 (Trung bình)

Bài mẫu để bắt chước: `src/data/lessons/_golden/greetings.js`. Chuẩn: STD mục 4.

## A. Brief của unit (lưu `briefs/int-uN.md`)

```markdown
# Brief int-uN — <Tên unit>
- Cấp độ: A1 / A2 / B1
- Mục tiêu unit: <tình huống giao tiếp người học làm được>
- Bài trong unit:
  | id (giữ id cũ nếu nâng cấp) | Mục tiêu bài | Điểm ngữ pháp (≥2) | Bối cảnh đoạn văn |
  |---|---|---|---|
  | greetings | Chào, giới thiệu, hỏi thăm | My name is…; How are you?; Good morning… | Ngày đầu ở lớp mới, Lan và Minh |
- Từ bắt buộc giữ (từ bài cũ): <...>
- Lỗi người Việt hay mắc cần đưa vào `mistakes`: <...>
```

## B. Khung dữ liệu

```js
export const <ID>_LESSON = {
  id: '<id>', contentVersion: 2, track: 'general', level: 'beginner|intermediate|advanced', cefrLevel: 'A1|A2|B1',
  unit: 'int-uN', title: '', description: '', icon: '',
  objectives: ['', ''],
  vocabulary: [
    { word: '', phonetic: '/.../', pos: 'noun|verb|adj|adverb|phrase|interjection', meaning: '', example: '<4–10 từ, chứa đúng từ>', exampleVi: '', illustration: '<emoji>' },
    // 10–20 mục
  ],
  grammar: [
    { title: '', explanation: '', examples: [{ en: '', vi: '' } /* ≥4 */], mistakes: [{ wrong: '', right: '', note: '' }] },
    // ≥2 điểm
  ],
  reading: {
    title: '',
    passage: ['Tên: câu…', 'Tên: câu…'].join('\n'),      // 60–120 từ, dùng ≥60% từ của bài
    translation: ['Tên: …', 'Tên: …'].join('\n'),
    highlights: ['<chỉ từ đơn>'],
    questions: [{ question: '', options: ['', '', '', ''], correct: 0, explanation: '' } /* 3–5 câu */],
  },
  quiz: [
    { skill: 'vocab|grammar|usage|listening', question: '', options: ['', '', '', ''], correct: 0, explanation: '' },
    { skill: 'listening', audioText: '<câu được đọc>', question: 'Nghe và chọn…', options: [], correct: 0, explanation: '' },
    // ≥8 câu, ≥2 câu listening
  ],
};
```

## C. Tự kiểm trước khi nộp

- [ ] Đoạn văn đọc lên tự nhiên, có mở đầu và kết thúc, không phải các câu rời
- [ ] Mỗi câu quiz kiểm tra **một** điều; nhiễu cùng loại, cùng độ dài
- [ ] Có ít nhất 1 câu quiz kiểm tra từ của bài trong **ngữ cảnh** (chọn câu đáp phù hợp), không chỉ dịch nghĩa
- [ ] `mistakes` là lỗi thật của người Việt, không bịa lỗi khó xảy ra
- [ ] `node scripts/validate-lessons.mjs --only <id>` = 0 lỗi
