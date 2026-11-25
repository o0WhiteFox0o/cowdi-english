# GEMINI-QUESTION-QA — Hướng dẫn chạy AI rà soát và sửa câu hỏi · Cowdi English

| Mục | Giá trị |
|---|---|
| Phiên bản | 1.0 · 25/11/2026 (cập nhật 26/11/2026 sau khi gộp `feat/pet-director`) |
| Chuẩn phải theo | [STD-QUESTION-QUALITY-v1.0.md](STD-QUESTION-QUALITY-v1.0.md), [STD-LESSON-CONTENT-v1.0.md](STD-LESSON-CONTENT-v1.0.md) |
| Người chạy | Gemini (Antigravity / Gemini CLI). Sonny duyệt từng PR |

---

## 0. Kết quả kiểm tra trên code (Fact)

### 0.1 Nguyên nhân hai lỗi trên màn hình kiểm tra đầu vào

| Lỗi | Nguyên nhân thật | Vị trí |
|---|---|---|
| **Tầng 2: "Nghe và chọn câu đúng:" không có loa** | **Dữ liệu đúng**: có `audioText: 'The chef cooks delicious food for the guests.'`. Lỗi ở **giao diện**: `PlacementTest` chỉ hiện nút loa khi có `q.speak`, bỏ qua `q.audioText`, không tự phát âm khi sang câu mới. *(Lưu ý: `CowdiChat.jsx` đã được xoá hoàn toàn khi gộp `feat/pet-director`; vẫn cần đảm bảo `LearningPathPage` không mở thẻ Pet khi đang làm onboarding `PlacementTest`.)* | `src/features/placement/PlacementTest.jsx` dòng ~314; `src/data/lessons/general/jobs.js` dòng 185–196 |
| **Tầng 1: 🔴 với red / star / hi / buffalo** | (1) Tầng A gộp toàn bộ 67 từ của 12 bài Starter không có `category` rồi gọi `generatePictureChallenge`, nên nhiễu lấy ngẫu nhiên khác nhóm. (2) Câu hỏi chèn lặp emoji vào chữ: `` `${target.emoji} Hình này là từ tiếng Anh nào?` ``. (3) 6 màu dùng hình tròn (`🔴🔵🟡🟢🟠🟣`) dễ lẫn *circle*. (4) `s1-hello` có cả `hello` và `hi` gây cặp đồng nghĩa L1. | `PlacementTest.jsx` (`sampleTierQuestions`); `src/utils/quiz-gen.js` (`generatePictureChallenge`); `src/data/lessons/starter/*.js` |

### 0.2 Các nguồn sinh câu hỏi cần quản lý
- Câu soạn tay: `lesson.quiz[]` (1.316 câu trên 221 bài), `lesson.reading.questions[]` (182 câu), `QUIZ_BANK` (438 câu).
- Tự sinh từ vựng: `generateAutoQuestions` (`word2meaning`, `meaning2word`).
- Tự sinh ngữ pháp: `generateAutoQuestions` (`_type: 'grammar'`) — rủi ro cao, bỏ khỏi kiểm tra đầu vào và `buildCheckpointQuestions`.
- Tự sinh cấp 1: `generatePictureChallenge` (bài `picture`, checkpoint cấp 1, kiểm tra đầu vào Tầng A).

---

## 1. Thứ tự việc (Q0–Q6)

| # | Việc | Loại | Phụ thuộc | Kết quả |
|---|---|---|---|---|
| **Q0** | Đưa chuẩn vào repo | Tài liệu | — | `STD-QUESTION-QUALITY-v1.0.md`, `GEMINI-QUESTION-QA.md`, liên kết chéo |
| **Q1** | Sửa giao diện câu nghe ở `PlacementTest` | Mã (hotfix) | — | Hết lỗi Tầng 2 |
| **Q2** | Sửa bộ sinh câu tự động (`quiz-gen.js` + `category` 12 bài Starter + màu ô vuông) | Mã | — | Hết lỗi Tầng 1 + `shared/quiz-gen.test.js` |
| **Q3** | Validator câu hỏi dùng chung (`shared/question-rules.js` + `src/data/lexicon/`) | Mã + test | Q0 | 14 mã kiểm tra + `shared/question-rules.test.js` |
| **Q4** | Chạy rà toàn kho, xuất báo cáo chuẩn | Script + báo cáo | Q3 | `docs/06-verification-validation/RPT-QUESTION-AUDIT-2026-11-26.md` |
| **Q5** | Sửa nội dung theo báo cáo (đợt 1: lỗi cứng `s1-hello`, `ielts-foundation-listening#4`, `QUIZ_BANK`, `pronunciation-tricky#1`; đợt sau: `Q-LEN`/`Q-POS` theo unit) | Nội dung | Q4 | Kho câu hỏi hết lỗi cứng |
| **Q6** | Bật validator chặn build với lỗi cứng (`Q-L2-AUDIO`, `Q-OPT-DUP`, `Q-OPT-COUNT`, `Q-L1-SYN`) | Cấu hình | Q5 đợt 1 | Lỗi mới không lọt vào bản build |

---

## 2. Chi tiết thực hiện & Kiểm định

- Không trộn sửa mã (`Q1`, `Q2`, `Q3`) và sửa nội dung (`Q5`) trong cùng commit.
- Sau mỗi bước chạy `npm test` và `node scripts/validate-lessons.mjs` để xác nhận xanh 100%.
- Chi tiết quy tắc 14 mã kiểm tra xem tại [STD-QUESTION-QUALITY-v1.0.md](STD-QUESTION-QUALITY-v1.0.md).
