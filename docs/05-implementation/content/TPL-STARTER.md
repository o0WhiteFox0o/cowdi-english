# TPL-STARTER — Mẫu brief và khung bài cấp 1 (Mới học)

Bài mẫu để bắt chước: `src/data/lessons/_golden/s1-pets.js`. Chuẩn: STD mục 3.

## A. Brief của unit (Sonny điền, lưu `briefs/s1-uN.md`)

```markdown
# Brief s1-uN — <Tên unit>
- Người học: trẻ 5–10 tuổi học cùng phụ huynh / người lớn mất gốc
- Mục tiêu unit: <1 câu: sau unit này người học nói/nhận ra được gì>
- Bài trong unit (4 bài):
  | id | Chủ đề | Từ (5–6) | Mẫu câu |
  |---|---|---|---|
  | s1-... | ... | ... | I like ___. |
- Bối cảnh tranh: <nhà, lớp, chợ… ; nhân vật Cowdi/pet nào xuất hiện>
- Từ cần tránh: <từ khó vẽ, từ dễ nhầm>
- Ghi chú: <nếu có>
```

## B. Khung dữ liệu (Gemini điền, lưu `src/data/lessons/starter/<id>.js`)

```js
export const S1_<ID>_LESSON = {
  id: 's1-<id>',
  contentVersion: 2,
  track: 'starter', format: 'picture', level: 'starter', cefrLevel: 'A1',
  unit: 's1-uN',
  title: '<Tên tiếng Việt>',
  description: '<1 câu: học gì>',
  icon: '<emoji>',
  words: [
    { word: '<en>', meaning: '<vi, có loại từ: con/cái/màu…>', emoji: '<emoji>', image: '/image/words/<slug>.webp' },
    // 5–6 mục
  ],
  pattern: { en: '<2–6 từ, có ___>', vi: '<bản dịch, có ___>', image: '/image/scenes/s1-<id>.webp', sceneBrief: '<1–2 câu tả tranh>' },
  instructionsVi: { look: '', listen: '', match: '', pattern: '', repeat: '', challenge: '' },
  parentTip: '<1 câu>',
};
```

## C. Tự kiểm trước khi nộp

- [ ] Mỗi từ vẽ được bằng **một** hình, trẻ nhìn là đoán ra
- [ ] `meaning` thay vào được chỗ trống của `pattern.vi` mà vẫn tự nhiên
- [ ] Không có phiên âm, không có ngữ pháp, không có đoạn văn
- [ ] `instructionsVi` mỗi câu ≤8 chữ, giọng thân thiện với trẻ
- [ ] `node scripts/validate-lessons.mjs --only s1-<id>` = 0 lỗi
