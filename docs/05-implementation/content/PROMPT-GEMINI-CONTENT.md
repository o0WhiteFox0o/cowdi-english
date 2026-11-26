# PROMPT-GEMINI-CONTENT — Điểm bắt đầu cho Gemini khi soạn hoặc nâng cấp bài học

Dán phần "Lời nhắc" dưới đây vào Gemini (Antigravity / Gemini CLI) khi giao việc nội dung. Thay `<...>` bằng việc cụ thể.

## Lời nhắc

```text
Bạn soạn nội dung bài học cho repo Cowdi English. Trước khi viết bất cứ gì, đọc theo đúng thứ tự:

1. docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md   — chuẩn bắt buộc
2. docs/05-implementation/content/STD-QUESTION-QUALITY-v1.0.md — quy tắc chất lượng câu hỏi (5 luật cứng)
3. docs/05-implementation/content/MAP-CURRENT-UI.md             — UI hiện tại dùng trường nào
3. src/data/lessons/schema.js                                    — chuẩn dạng mã, chạy được
4. Bài golden của đúng cấp:
   - cấp 1: src/data/lessons/_golden/s1-pets.js
   - cấp 2: src/data/lessons/_golden/greetings.js
   - cấp 3: src/data/lessons/_golden/ielts-read-rooftop-farms.js
5. Mẫu của đúng cấp: docs/05-implementation/content/TPL-<STARTER|INTERMEDIATE|EXAM>.md
6. Brief của việc này: docs/05-implementation/content/briefs/<unitId>.md
7. Nếu nâng cấp bài cũ: đọc file bài cũ trong src/data/lessons/<track>/<id>.js
   và mục của bài đó trong docs/06-verification-validation/RPT-LESSON-CONTENT-*.md

Việc cần làm: <ví dụ: nâng cấp 4 bài của unit int-u1 lên contentVersion 2>

Quy tắc:
- Bắt chước bài golden về cấu trúc, độ dài, giọng văn và mức chi tiết của explanation.
- Một PR chỉ một unit. Không sửa schema.js, golden, hay code UI trong PR nội dung.
- Viết mới hoàn toàn. Không chép câu, đoạn, đề từ sách, website, PDF có bản quyền.
- Không bịa số liệu, nghiên cứu, trích dẫn như sự thật.
- Giữ nguyên id bài cũ. Thêm trường, không xoá trường UI đang dùng.
- Chạy `node scripts/validate-lessons.mjs --only <các id>` đến khi 0 lỗi, dán kết quả vào mô tả PR.
- Tự rà bài theo docs/05-implementation/content/CHK-LESSON-REVIEW.md, ghi những mục chưa chắc để Sonny xem.
- Chỗ nào brief mâu thuẫn với STD: theo STD và ghi lại trong PR.
```

## Hai loại việc, đừng trộn

| Loại | Ví dụ | Sửa file nào | Tài liệu chính |
|---|---|---|---|
| **Nội dung** | Nâng cấp unit `int-u1`, soạn unit `s1-u1`, viết bài IELTS Reading mới | `src/data/lessons/**`, `briefs/` | STD, TPL, golden |
| **Giao diện** | U1–U10 trong `MAP-CURRENT-UI.md` mục 3, bài `picture` | `src/features/lesson/**` | `MAP-CURRENT-UI.md`, `docs/04-design/SDD-LEARNING-GROUPS-v2.0.md` |

Nên làm **U1–U4 trước** (nhỏ, nhưng không có chúng thì phần lớn nội dung v2 không hiện cho người học), rồi mới nâng cấp nội dung hàng loạt.

## Thứ tự đợt nội dung đề xuất

1. Sửa 2 lỗi dữ liệu trong báo cáo validator, gắn validator vào `prebuild`.
2. `int-u1` (greetings đã có bản golden, chuyển vào `general/`; soạn family, colors, numbers).
3. `int-u2`, `int-u3`: các bài mỏng nhất (1 điểm ngữ pháp).
4. Cấp 1 `s1-u1`–`s1-u3` (sau khi có PictureLesson).
5. IELTS Reading: mỗi đợt 3 bài mới theo golden.
