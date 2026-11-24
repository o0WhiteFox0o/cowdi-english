# TPL-EXAM — Mẫu brief và khung bài cấp 3 (Luyện thi)

Bài mẫu để bắt chước: `src/data/lessons/_golden/ielts-read-rooftop-farms.js`. Chuẩn: STD mục 5.

## A. Brief của bài (lưu `briefs/<pathId>-<unitId>.md`)

```markdown
# Brief <id> — <Tên bài>
- Kỳ thi / phần: IELTS Academic Reading | TOEIC Part 5 | VSTEP B1 Reading …
- Band mục tiêu: 6.0–7.0
- Chủ đề bài đọc: <chủ đề học thuật phổ thông, không cần kiến thức chuyên ngành>
- Dạng câu hỏi (≥2): TFNG ×5, Matching headings ×4, Sentence completion ×3
- Kỹ năng trọng tâm: <paraphrase, phân biệt FALSE/NOT GIVEN, tìm câu chủ đề…>
- Độ dài: 350–450 từ, 5 đoạn
- Lưu ý: bài viết mới hoàn toàn; không dựa sát cấu trúc hay ý của một bài thi có thật
```

## B. Khung dữ liệu

```js
// Bài đọc do Cowdi tự viết (không lấy từ nguồn có bản quyền).
const PARAGRAPHS = [
  { label: 'A', en: '', vi: '' },
  // 4–7 đoạn
];
const HEADINGS = ['i. …', 'ii. …' /* nhiều hơn số đoạn cần nối, có ≥1 bẫy */];

export const <ID>_LESSON = {
  id: '<id>', contentVersion: 2, track: 'ielts|toeic|b1|b2', examTag: '', level: '', ieltsBand: '', cefrLevel: '', skill: 'reading',
  title: '', description: '', icon: '', objectives: [],
  vocabulary: [ /* 10–20, lấy từ glossary, example nên là câu trong bài */ ],
  grammar: [ /* ≥2 điểm phục vụ kỹ năng làm bài, mỗi điểm ≥4 ví dụ */ ],
  reading: {
    title: '', timeLimitMin: 20,
    paragraphs: PARAGRAPHS,
    passage: PARAGRAPHS.map((p) => p.en).join('\n\n'),
    translation: PARAGRAPHS.map((p) => `${p.label}. ${p.vi}`).join('\n\n'),
    highlights: [ /* từ đơn */ ],
    glossary: [{ term: '<nguyên văn trong đoạn>', paragraph: 'A', synonyms: ['', ''], definitionEn: '', meaningVi: '' }],
    paraphrasePairs: [{ inQuestion: '', inPassage: '<nguyên văn>', paragraph: 'B', relation: 'same|opposite' }],
    examQuestions: [
      { type: 'tfng', prompt: '', answer: 'TRUE|FALSE|NOT GIVEN', evidence: { paragraph: '', quote: '<nguyên văn>' }, explanation: '' },
      { type: 'heading', prompt: 'Chọn tiêu đề cho đoạn B', options: HEADINGS, answer: 1, evidence: {}, explanation: '' },
      { type: 'sentence-completion', maxWords: 2, prompt: '… ______ …', answer: '<nằm trong quote>', evidence: {}, explanation: '' },
    ],
  },
  quiz: [ /* ≥8, skill: strategy | vocab | grammar, có explanation */ ],
};
```

## C. Quy tắc viết bài đọc luyện thi

1. Giọng văn học thuật phổ thông như báo khoa học, câu dài vừa phải, có từ nối (however, as a result, in addition).
2. Mỗi đoạn một ý chính, câu chủ đề rõ để làm dạng nối tiêu đề.
3. Mỗi câu hỏi phải dựa vào **một chỗ cụ thể** trong bài; câu NOT GIVEN phải liên quan đến chủ đề nhưng không được nhắc.
4. Câu hỏi diễn đạt lại bài đọc (paraphrase), không chép nguyên câu. Ghi lại từng cặp trong `paraphrasePairs`.
5. Không dùng số liệu, tên tổ chức, nghiên cứu có thật như thể đó là sự thật. Mô tả định tính.

## D. Tự kiểm trước khi nộp

- [ ] Tự làm hết câu hỏi mà không xem đáp án: mỗi câu chỉ có một đáp án bảo vệ được
- [ ] TFNG có đủ TRUE, FALSE, NOT GIVEN
- [ ] Tiêu đề bẫy có lý do bẫy rõ (ghi trong `explanation`)
- [ ] `glossary` chỉ chọn từ quan trọng để hiểu bài, không liệt kê từ quá phổ thông
- [ ] `node scripts/validate-lessons.mjs --only <id>` = 0 lỗi
