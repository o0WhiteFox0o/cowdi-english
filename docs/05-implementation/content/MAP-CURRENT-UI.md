# MAP-CURRENT-UI — Bài v2 hiện ra thế nào trên luồng học hiện tại

Đối chiếu ngày 24/11/2026 với `src/features/lesson/LessonDetailPage.jsx` (commit `5187bf8`). Cách kiểm: nạp 3 bài golden qua `toLegacyShape → withStandards → withReading`, chạy lại đúng logic chọn bước, Nghe câu, Nói theo, ReadingPassage và `generateQuizFromLesson` của trang (200 lần cho quiz). Chạy lại: `node scripts/check-lesson-ui-compat.mjs` (sau mỗi việc U1–U10, các dòng ✗ phải chuyển dần sang ✓).

## 1. Luồng học hiện tại (7 bước)

`Từ vựng → Flashcard → Ngữ pháp → Đoạn văn → Nghe câu → Nói theo → Quiz`. Bước nào không có dữ liệu thì bị ẩn. Bài chỉ "xong" khi làm xong Quiz.

| Bước | Lấy dữ liệu từ | Trường v2 mới có được dùng không |
|---|---|---|
| Từ vựng | `vocabulary[].word, phonetic, meaning, example, illustration` | `pos`, `exampleVi`, `image` **chưa hiện** |
| Flashcard | như trên; mặt sau gọi `translateEnToVi(example)` | **Hàm này không được định nghĩa hay import ở đâu cả** (có cả trong bản build `dist-prod`). Lật thẻ sẽ ném lỗi, câu dịch không bao giờ hiện. `exampleVi` sửa được việc này |
| Ngữ pháp | `grammar[].title, explanation, examples[]` | `mistakes[]` **chưa hiện** |
| Đoạn văn | `reading.passage, translation, highlights, questions` | `paragraphs`, `glossary`, `paraphrasePairs`, `examQuestions`, `timeLimitMin` **chưa hiện**; `questions[].explanation` **chưa hiện** |
| Nghe câu | ví dụ ngữ pháp ≥2 từ, tối đa 10 câu | Đủ dùng |
| Nói theo | `vocabulary[].example` + ví dụ ngữ pháp | Dùng `meaning` của từ làm "nghĩa" của câu ví dụ, nên nghĩa hiển thị sai. Nên dùng `exampleVi` |
| Quiz | `generateQuizFromLesson`: trộn câu tự sinh + **tối đa 3 câu** trong `lesson.quiz`, lấy 10 câu | `explanation`, `skill`, `audioText` **chưa dùng** |

## 2. Kết quả chạy 3 bài golden

| | s1-pets (cấp 1) | greetings v2 (cấp 2) | ielts-read-rooftop-farms (cấp 3) |
|---|---|---|---|
| Chạy không lỗi | ✓ (qua `toLegacyShape`) | ✓ | ✓ |
| Các bước hiện | Từ vựng, Flashcard, Đoạn văn, Nói theo, Quiz | đủ 7 | đủ 7 |
| Đoạn văn | **Tự ghép** từ câu mẫu (cấp 1 không cần đoạn văn) | Viết tay, có dịch, 4 câu hỏi | Viết tay, có dịch, 9/12 câu đề thi hiện dạng trắc nghiệm |
| Xuống dòng | — | Hội thoại **bị gộp thành một khối** | 5 đoạn A–E **bị gộp thành một khối**, mất nhãn đoạn |
| Câu soạn tay trong Quiz | 3/6 | **~2,5/9** | **~2,5/9** |
| Giải thích đáp án | không hiện | không hiện | không hiện |
| Câu điền từ (sentence completion) | — | — | 3 câu **chưa có giao diện** |

Kết luận: dữ liệu v2 **an toàn** với UI hiện tại (không vỡ, không mất bài), nhưng phần lớn công soạn (giải thích, câu quiz soạn tay, đoạn, cột từ) **chưa hiện cho người học**. Cần các thay đổi giao diện dưới đây.

## 3. Việc sửa UI để dùng hết nội dung v2 (theo thứ tự ưu tiên)

| # | Việc | Vị trí | Công |
|---|---|---|---|
| U1 | Xoá lời gọi `translateEnToVi`; mặt sau flashcard hiện `exampleVi` (bài cũ chưa có thì ẩn dòng dịch) | Flashcard, dòng ~1368 và ~1428 | Nhỏ |
| U2 | Quiz: nếu `contentVersion === 2` thì dùng **toàn bộ** `lesson.quiz` (xáo), chỉ thêm câu tự sinh khi ít hơn 10 câu | `generateQuizFromLesson` | Nhỏ |
| U3 | Hiện `explanation` sau mỗi câu Quiz và câu hiểu bài (đúng hay sai đều hiện) | Quiz, `ReadingPassage` | Nhỏ |
| U4 | Đoạn văn `white-space: pre-line`; nếu có `paragraphs` thì vẽ từng đoạn với nhãn A, B, C… | `ReadingPassage` | Nhỏ |
| U5 | Tô và bấm được **cụm từ** trong đoạn văn (so khớp cụm dài nhất trước) | `ReadingPassage` | Vừa |
| U6 | Câu `audioText`: phát câu đó, ẩn chữ, thêm nút nghe lại | Quiz | Nhỏ |
| U7 | Từ vựng: hiện `exampleVi`, `pos`, `mistakes` của ngữ pháp | tab Từ vựng, Ngữ pháp | Nhỏ |
| U8 | Màn Reading luyện thi: chia đôi màn hình, bài bên trái, câu hỏi bên phải (điện thoại: hai tab). Cột từ `glossary` theo đoạn, đồng hồ `timeLimitMin`, câu điền từ, bấm "Xem bằng chứng" để tô `evidence.quote` trong bài | component mới `ExamReading.jsx` | Lớn |
| U9 | Bài `picture` cấp 1 | `PictureLesson.jsx` (theo [SDD-LEARNING-GROUPS-v2.0.md](../../04-design/SDD-LEARNING-GROUPS-v2.0.md) mục 4.4) | Lớn |
| U10 | Mini-quiz đoạn văn đang cộng XP mỗi lần mở lại (biến `rewarded` chỉ sống trong một lần mở trang). Chỉ cộng lần đầu, giống cách tính 1/3 của bài | `ReadingPassage.submitQuiz` | Nhỏ |

Trước khi U9 xong, bài cấp 1 vẫn học được nhờ `toLegacyShape` (từ → vocabulary, sinh quiz dạng chữ), nhưng **không đúng trải nghiệm cấp 1**. Không mở nhóm Mới học cho người dùng thật trước khi U9 xong.

## 4. Lỗi dữ liệu có sẵn validator đã bắt

| Bài | Lỗi |
|---|---|
| `ielts-pre-grammar` | `vocabulary[7] "Whose"` trùng từ |
| `ielts-pre-writing` | `quiz[4]` có hai lựa chọn "paragraph" giống nhau |

Sửa hai lỗi này trước khi gắn validator vào `prebuild`.
