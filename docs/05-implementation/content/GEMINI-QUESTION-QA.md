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

## 1. Thứ tự việc (Q0–Q6 + Đợt 2) — Trạng thái

| # | Việc | Loại | Trạng thái | Kết quả |
|---|---|---|---|---|
| **Q0** | Đưa chuẩn vào repo | Tài liệu | ✅ Đã xong (`f66a981`) | `STD-QUESTION-QUALITY-v1.0.md`, `GEMINI-QUESTION-QA.md`, liên kết chéo |
| **Q1** | Sửa giao diện câu nghe ở `PlacementTest` | Mã (hotfix) | ✅ Đã xong (`efc3308`) | Hết lỗi Tầng 2 (`audioText`, tự phát, nghe chậm 0.55×, lọc câu hỏng) |
| **Q2** | Sửa bộ sinh câu tự động (`quiz-gen.js` + `category` 12 bài Starter + màu ô vuông) | Mã | ✅ Đã xong (`2aad0b6`) | Hết lỗi Tầng 1 + `shared/quiz-gen.test.js` (500 lượt) |
| **Q3** | Validator câu hỏi dùng chung (`shared/question-rules.js` + `src/data/lexicon/`) | Mã + test | ✅ Đã xong (`0d063e5`) | 14 mã kiểm tra + `shared/question-rules.test.js` |
| **Q4** | Chạy rà toàn kho, xuất báo cáo chuẩn | Script + báo cáo | ✅ Đã xong (`a0704cf`) | `docs/06-verification-validation/RPT-QUESTION-AUDIT-2026-11-26.md` |
| **Q5 (Đợt 1)** | Sửa nội dung lỗi cứng toàn kho (29 lỗi cứng) | Nội dung | ✅ Đã xong (`51bca1f`) | **0 lỗi cứng / 2.829 câu** |
| **Q6** | Bật validator chặn build (`prebuild`) + chống trùng nghĩa `reading.js` | Cấu hình + mã | ✅ Đã xong (`64738ec`) | `npm run validate:questions` chạy bắt buộc trong `prebuild` |
| **Q5 (Đợt 2)** | Dọn file trùng `src/data/quiz-bank-extra.js` & cân chỉnh 70 `Q-LEN` + 89 `Q-POS` trên 54 bài v2 | Nội dung | ✅ Đã xong (`c10fd5d`, `8c74ea8` → gộp `main` `5edeb56`) | **54/54 bài v2: 0 lỗi · 0 cảnh báo** |

---

## 2. Chi tiết thực hiện & Kiểm định

- Không trộn sửa mã (`Q1`, `Q2`, `Q3`) và sửa nội dung (`Q5`) trong cùng commit.
- Sau mỗi bước chạy `npm test` và `node scripts/validate-lessons.mjs` để xác nhận xanh 100%.
- Chi tiết quy tắc 14 mã kiểm tra xem tại [STD-QUESTION-QUALITY-v1.0.md](STD-QUESTION-QUALITY-v1.0.md).
