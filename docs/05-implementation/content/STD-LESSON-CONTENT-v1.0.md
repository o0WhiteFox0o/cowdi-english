# STD-LESSON-CONTENT v1.0 — Chuẩn nội dung bài học Cowdi English

| Mục | Giá trị |
|---|---|
| Mã tài liệu | STD-LESSON-CONTENT |
| Phiên bản | 1.0 · 24/11/2026 |
| Phạm vi | Mọi bài trong `src/data/lessons/` |
| Liên quan | [SRS-LESSON-3-LEVELS-v1.0.md](../../02-requirements/SRS-LESSON-3-LEVELS-v1.0.md) (nhu cầu), [SDD-LEARNING-GROUPS-v2.0.md](../../04-design/SDD-LEARNING-GROUPS-v2.0.md) (lộ trình 3 nhóm), `src/data/lessons/schema.js` (kiểm tra tự động) |

Tài liệu này trả lời: **một bài đạt chuẩn trông thế nào**. Số liệu trong các bảng dưới đây khớp với `RULES` trong `schema.js`. Sửa chỗ này thì sửa chỗ kia trong cùng một commit.

---

## 1. Nguyên tắc chung (áp dụng mọi cấp)

1. **Một bài, một mục tiêu giao tiếp.** Ghi 2–3 câu `objectives` dạng "Người học làm được…". Mọi phần trong bài phục vụ mục tiêu đó.
2. **Viết mới, không chép.** Không chép đoạn văn, câu hỏi, đề thi từ sách, website hay tài liệu có bản quyền (Cambridge, ETS, IDP, British Council, sách in, PDF chia sẻ). Được học *cách trình bày* của tài liệu khác, không được dùng *chữ* của họ. Bài đọc luyện thi phải tự viết, ghi rõ ở đầu file.
3. **Không bịa số liệu như sự thật.** Bài đọc dùng mô tả định tính ("many", "a growing number") hoặc nhân vật, địa danh hư cấu. Không gán câu nói cho người thật.
4. **Từ trong ví dụ phải là đúng từ đang học**, đúng dạng hoặc biến thể ngữ pháp (`Head` → không dùng "headache").
5. **Mọi câu tiếng Anh có bản dịch**: ví dụ từ vựng (`exampleVi`), ví dụ ngữ pháp (`vi`), đoạn văn (`translation`, hoặc `paragraphs[].vi`).
6. **Mọi câu hỏi có lời giải thích** (`explanation`): một câu ngắn, nói *vì sao* đúng, không chỉ nhắc lại đáp án.
7. **Bối cảnh Việt Nam khi hợp lý**: tên Lan, Minh; Cần Thơ, chợ, xe máy, Tết. Không dùng định kiến vùng miền, giới tính, nghề nghiệp.
8. **Tiếng Anh Mỹ là chuẩn** (chính tả và phiên âm IPA theo General American). Luyện thi IELTS được dùng chính tả Anh nếu cả bài thống nhất.
9. **Đáp án nhiễu hợp lý**: cùng loại từ, cùng độ dài, không có đáp án "hiển nhiên sai". Không có hai đáp án giống nhau.
10. **Thêm trường, không đổi nghĩa trường cũ.** Bài v2 khai báo `contentVersion: 2`.

---

## 2. Bố cục thư mục

```
docs/05-implementation/content/
  STD-LESSON-CONTENT-v1.0.md      ← tài liệu này
  STD-QUESTION-QUALITY-v1.0.md    ← chuẩn chất lượng câu hỏi trắc nghiệm (5 luật cứng, 14 mã validator)
  GEMINI-QUESTION-QA.md           ← kịch bản chạy rà soát & sửa ngân hàng câu hỏi (Q0–Q6)
  PROMPT-GEMINI-CONTENT.md        ← điểm bắt đầu cho Gemini
  TPL-STARTER.md                  ← mẫu brief + khung dữ liệu cấp 1
  TPL-INTERMEDIATE.md             ← mẫu cấp 2
  TPL-EXAM.md                     ← mẫu cấp 3
  CHK-LESSON-REVIEW.md            ← danh sách kiểm tra khi duyệt
  MAP-CURRENT-UI.md               ← bài v2 hiện ra thế nào trên UI hiện tại
  briefs/<unitId>.md              ← yêu cầu của từng unit (Sonny viết hoặc duyệt)
src/data/lessons/
  schema.js                       ← chuẩn dạng mã + validateLesson + toLegacyShape
  _golden/                        ← 3 bài mẫu chuẩn (khuôn để bắt chước)
  starter/                        ← bài cấp 1 (mới)
  general/ ielts/ toeic/ b1/ b2/ advanced/   ← như hiện nay
scripts/validate-lessons.mjs      ← kiểm tra toàn kho, xuất báo cáo
scripts/check-lesson-ui-compat.mjs ← chạy bài golden qua logic LessonDetailPage hiện tại
shared/lesson-schema.test.js      ← test của schema (chạy cùng npm test)
docs/06-verification-validation/RPT-LESSON-CONTENT-<ngày>.md   ← báo cáo kiểm tra
```

---

## 3. Cấp 1 · Starter (`format: 'picture'`)

Bài mẫu: `src/data/lessons/_golden/s1-pets.js`.

| Trường | Bắt buộc | Chuẩn |
|---|---|---|
| `id` | ✓ | `s1-<chủ đề>` |
| `contentVersion` | ✓ | `2` |
| `track` / `format` / `level` | ✓ | `'starter'` / `'picture'` / `'starter'` |
| `unit` | ✓ | `s1-u1` … `s1-u10` |
| `title`, `description`, `icon` | ✓ | Tiếng Việt, ngắn |
| `words[]` | ✓ | **5–6 từ**, mỗi từ ≤3 chữ, vẽ được. `{ word, meaning, emoji, image }`. **Không có `phonetic`** |
| `words[].image` | khi có ảnh | `/image/words/<slug>.webp`, 512×512, ≤40 KB, một vật, không chữ |
| `pattern` | ✓ | `{ en, vi, image, sceneBrief }`. `en` 2–6 từ, có đúng một chỗ trống `___` |
| `instructionsVi` | ✓ | 6 bước `look, listen, match, pattern, repeat, challenge`, mỗi câu ≤8 chữ |
| `parentTip` | nên có | 1 câu gợi ý phụ huynh luyện ngoài app |
| `grammar`, `reading`, `quiz` | **không** | Câu hỏi sinh tự động từ `words` |

Chọn từ: danh từ cụ thể, màu, số, hành động nhìn thấy. Tránh từ trừu tượng, từ đồng âm dễ nhầm trong cùng bài (`sea`/`see`), từ có hai cách vẽ khác nhau.

`sceneBrief`: 1–2 câu tả tranh cho người làm hình (Cowdi/pet có mặt, các vật của bài, nền, không chữ).

---

## 4. Cấp 2 · Intermediate (bài chuẩn, `track: 'general'` hoặc `'advanced'`)

Bài mẫu: `src/data/lessons/_golden/greetings.js`.

| Phần | Chuẩn |
|---|---|
| `objectives` | 2–3 câu |
| `vocabulary` | **10–20 mục**. Mỗi mục: `word, phonetic, pos, meaning, example, exampleVi, illustration`. `example` 4–10 từ, chứa đúng từ |
| `grammar` | **≥2 điểm**, mỗi điểm `title, explanation, examples[≥4] {en, vi}`, nên có `mistakes[] {wrong, right, note}` (lỗi người Việt hay mắc) |
| Nghe câu | Tự lấy từ ví dụ ngữ pháp có ≥2 từ: **cần ≥6 câu** |
| `reading` | **Viết tay**, 60–120 từ, là câu chuyện hoặc hội thoại liền mạch, dùng **≥60% từ của bài**. Có `title, passage, translation, highlights, questions` |
| `reading.highlights` | Chỉ **từ đơn** (UI hiện tại không tô được cụm từ) |
| `reading.questions` | **3–5 câu** trắc nghiệm hiểu bài, có `explanation` |
| `quiz` | **≥8 câu**, 100% có `explanation`, gắn `skill: vocab | grammar | usage | listening`. Ít nhất 2 câu `listening` có `audioText` (câu được đọc lên) |

Hội thoại: mỗi lượt lời một dòng, dạng `Tên: câu nói`, nối bằng `\n`.

Bài cũ: nâng cấp **giữ nguyên `id`**, giữ các từ cũ còn phù hợp, bổ sung các phần còn thiếu theo bảng trên rồi đặt `contentVersion: 2`.

---

## 5. Cấp 3 · Exam (`track: 'ielts' | 'toeic' | 'b1' | 'b2'`)

Bài mẫu: `src/data/lessons/_golden/ielts-read-rooftop-farms.js` (dạng Reading). Bài kỹ năng khác (Listening, Writing, Speaking) dùng chung phần 5.1 và thay 5.2 bằng phần đặc thù kỹ năng (sẽ bổ sung ở v1.1).

### 5.1 Phần chung

Như cấp 2 (vocabulary 10–20, grammar ≥2×4, quiz ≥8 có giải thích), cộng thêm:

| Trường | Chuẩn |
|---|---|
| `examTag` | ví dụ `IELTS Academic Reading`, `TOEIC Part 5` |
| `ieltsBand` / `toeicBand` / `vstepLevel` | band mục tiêu (xem `standards.js`) |
| `skill` | `reading | listening | writing | speaking` |
| `quiz` | thiên về chiến lược làm bài và từ đồng nghĩa (`skill: strategy | vocab | grammar`) |

### 5.2 Bài Reading

Học theo cách "bài đọc + cột từ" của các tài liệu tự học IELTS: từ khó trong bài đi kèm **từ đồng nghĩa và định nghĩa**, đặt theo từng đoạn. Đây là nền cho kỹ năng nhận ra paraphrase.

| Trường | Chuẩn |
|---|---|
| `reading.paragraphs[]` | **4–7 đoạn** `{ label: 'A'…, en, vi }` |
| `reading.passage` | **250–700 từ**. Luôn viết `PARAGRAPHS.map(p => p.en).join('\n\n')`, không gõ lại tay |
| `reading.translation` | Sinh từ `paragraphs[].vi` |
| `reading.timeLimitMin` | Thời gian gợi ý (IELTS: khoảng 20 phút/bài) |
| `reading.glossary[]` | **10–20 mục** `{ term, paragraph, synonyms[≥2] hoặc definitionEn, meaningVi }`. `term` phải xuất hiện nguyên văn trong đoạn `paragraph` |
| `reading.paraphrasePairs[]` | **≥5 cặp** `{ inQuestion, inPassage, paragraph, relation: same|opposite }`. `inPassage` nguyên văn trong đoạn |
| `reading.examQuestions[]` | **≥10 câu, ≥2 dạng**. Dạng: `tfng, ynng, mcq, heading, sentence-completion, matching-info` |
| `examQuestions[].evidence` | `{ paragraph, quote }`, `quote` **khớp nguyên văn** bài đọc. Bắt buộc trừ câu NOT GIVEN |
| `examQuestions[].explanation` | Chỉ rõ cặp paraphrase hoặc bẫy |
| `sentence-completion` | Có `maxWords`; đáp án nằm nguyên văn trong `evidence.quote` và không dài hơn `maxWords`; `prompt` có `______` |
| `heading` | `options` là danh sách tiêu đề chung, `answer` là chỉ số; nên có ≥1 tiêu đề bẫy |

Cân bằng TFNG: trong 5 câu nên có cả TRUE, FALSE, NOT GIVEN; câu NOT GIVEN phải "gần" nội dung bài (cùng chủ đề nhưng không được nhắc), không lạc đề.

---

## 6. Hình ảnh và âm thanh

| Loại | Đường dẫn | Kích thước | Ghi chú |
|---|---|---|---|
| Ảnh từ cấp 1 | `public/image/words/<slug>.webp` | 512×512, ≤40 KB | Một vật, nền trơn hoặc trong suốt, không chữ |
| Tranh mẫu câu | `public/image/scenes/<lessonId>.webp` | 1024×640, ≤90 KB | Có Cowdi/pet |
| Âm thanh từ | `public/audio/words/<slug>.mp3` | — | Khi chưa có thì dùng giọng đọc của máy |

Ghi mọi ảnh mới vào `docs/05-implementation/REG-IMAGE-CATALOG.md` (nguồn, giấy phép, người duyệt).

---

## 7. Kiểm tra tự động

```bash
node scripts/validate-lessons.mjs                 # tóm tắt toàn kho
node scripts/validate-lessons.mjs --only greetings --verbose
node scripts/validate-lessons.mjs --md docs/06-verification-validation/RPT-LESSON-CONTENT-<ngày>.md
```

- Bài `contentVersion: 2`: vi phạm bất kỳ chuẩn nào = **lỗi**, build hỏng.
- Bài cũ: chỉ lỗi cấu trúc (thiếu trường, từ trùng, đáp án trùng, `correct` sai) là lỗi; phần còn lại là cảnh báo để lên kế hoạch nâng cấp.
- Bài v2 còn phải qua `toLegacyShape` (chạy được trên UI hiện tại).

Khi kho hết lỗi (hiện còn 2 bài, xem báo cáo), thêm vào `package.json`: `"prebuild": "node scripts/build-lesson-ids.mjs && node scripts/validate-lessons.mjs"`.

---

## 8. Quy trình soạn

1. Sonny viết (hoặc duyệt) `briefs/<unitId>.md` theo mẫu TPL của cấp.
2. Gemini soạn **một unit mỗi PR**, theo brief và bài golden.
3. Chạy `validate-lessons` đến khi 0 lỗi.
4. Sonny duyệt theo `CHK-LESSON-REVIEW.md`, thử trên điện thoại.
5. Gộp PR. Cập nhật `TASK.md` / `LOG-PROGRESS.md`.

## 9. Lịch sử thay đổi

| Phiên bản | Ngày | Nội dung |
|---|---|---|
| 1.0 | 24/11/2026 | Bản đầu: chuẩn 3 cấp, schema v2, 3 bài golden, validator |
