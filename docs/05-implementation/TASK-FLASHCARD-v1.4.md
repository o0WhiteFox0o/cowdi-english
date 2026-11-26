# TASK-FLASHCARD-v1.4 — Kế hoạch & Checklist triển khai Flashcard Audio UX & Điểm nhớ

> **Ngày lập:** 2026-11-26 · **Trạng thái:** ✅ Đã triển khai trọn bộ Bước 0 + PR A + PR B + PR C trên nhánh `feat/flashcard-audio-ux` (`205/205` test PASS · `npm run build` PASS · chờ UAT thiết bị thật) · **Nhánh Git:** `feat/flashcard-audio-ux`
> **Tài liệu gốc:** [SDD-FLASHCARD-AUDIO-UX-v1.4.md](../04-design/SDD-FLASHCARD-AUDIO-UX-v1.4.md) · [RPT-FLASHCARD-SURVEY.md](RPT-FLASHCARD-SURVEY.md) · [Demo](../04-design/flashcard-mockups/flashcard-demo.html)

---

## 1. Lộ trình triển khai (Bước 0 → PR A → PR B → PR C)

| Giai đoạn | Phạm vi | File dự kiến tạo / sửa | Trạng thái |
|---|---|---|---|
| **Bước 0** | Khảo sát mã nguồn, xác nhận 6 câu hỏi & giả định `[A]`, đo tỉ lệ `targetWords`, cập nhật tài liệu | `SDD-FLASHCARD-AUDIO-UX-v1.4.md`, `RPT-FLASHCARD-SURVEY.md`, `TASK-FLASHCARD-v1.4.md`, `REG-DOCUMENTS.md`, `LOG-PROGRESS.md` | ✅ Xong |
| **PR A — Âm thanh & Bố cục** | Tách `speakWord`/`stopSpeaking`/`hasVietnameseVoice` vào `src/utils/speech.js`; thêm `useAutoSpeak.js`; gộp & xây `src/components/learn/Flashcard.jsx` + CSS (F1, F2, F4, hiển thị chấm F3.7, vuốt trái/phải, bỏ nút "Đã thuộc" & 3 nút loa ngoài thẻ); tích hợp `LessonDetailPage.jsx` & `VocabularyPage.jsx`; đổi banner gợi ý thành `"Nghe rồi chạm để lật!"` | `src/utils/speech.js`, `src/components/learn/useAutoSpeak.js`, `src/components/learn/Flashcard.jsx`, `src/components/learn/flashcard.css`, `src/features/lesson/LessonDetailPage.jsx`, `src/pages/VocabularyPage.jsx` | ✅ Xong |
| **PR B — Điểm nhớ & Thứ tự thẻ** | Thêm `src/features/vocab/wordProgress.js` + `wordProgress.test.js` (17 ca: 16/16 gốc + 1 ca bổ sung, gắn vào `npm test`); thêm `knownAtPoints` & `maybeForgetDays` vào `src/data/config/groups.js`; thêm migration idempotent `cowdi.wordProgress.v` + debounce 1s + đồng bộ server (`word_progress LONGTEXT`, `DEC-09` Phương án 1); nối `applyEncounter`, `orderCards` (giữ nhóm `vocabBatchSize`) và màn hoàn thành F5 | `src/features/vocab/wordProgress.js`, `src/features/vocab/wordProgress.test.js`, `src/data/config/groups.js`, `src/hooks/useUser.jsx`, `package.json`, `server/db/migrate-word-progress.sql`, `scripts/run-word-progress-migration.js`, `server/routes/api.js` | ✅ Xong |
| **PR C — Nối câu hỏi (`targetWords`)** | Gắn `targetWords: [wordId]` cho câu tự sinh trong `src/utils/quiz-gen.js` (bao gồm `generatePictureChallenge`); thêm kiểm định trường tuỳ chọn `targetWords: string[]` trong `src/data/lessons/schema.js`; gọi `applyQuestionResult` ngay khi chấm từng câu ở Quiz bài học, `PictureLesson`, `PracticePage`, Checkpoint (`LearningPathPage`), `MiniGamePage` | `src/utils/quiz-gen.js`, `src/data/lessons/schema.js`, `src/features/lesson/LessonDetailPage.jsx`, `src/features/lesson/PictureLesson.jsx`, `src/features/practice/PracticePage.jsx`, `src/pages/LearningPathPage.jsx`, `src/features/mini-games/MiniGamePage.jsx` | ✅ Xong |

---

## 2. Quyết định đã chốt (`DEC-09`)

- **Đã chốt (Sonny, 26/11/2026) — Phương án 1:** Thêm cột `word_progress LONGTEXT` trên bảng `user_progress` (`server/db/migrate-word-progress.sql` + runner idempotent `scripts/run-word-progress-migration.js` chuẩn MySQL 5.6+), giữ nguyên `word_status` cũ, whitelist `wordProgress` trong `GET/PUT /api/progress` và gộp 2 thiết bị bằng `mergeProgressMap` (`S-15`).

---

## 3. Rủi ro & Biện pháp kiểm soát

1. **Tương thích Pet Director V2:** Khi `LessonDetailPage` dùng `Flashcard.jsx` mới, vẫn giữ bố cục cột đồng hành `.pd-lesson-layout--flashcard` và đồng bộ `pet_speak_start/end` + `setVoiceLevel` khi đọc từ.
2. **Tỉ lệ `targetWords` thấp ở nhóm Trung bình (28.2%):** Giữ đúng nguyên tắc F3.6 & R5 — câu thiếu `targetWords` không đoán chuỗi, không tự điền hàng loạt; báo cáo số liệu cuối PR C để quyết định đợt bổ sung dữ liệu riêng.
3. **An toàn dữ liệu người học (R6):** Migration `wordStatus` cũ sang `wordProgress` (`learning`, 1 điểm) phải idempotent với khoá phiên bản `cowdi.wordProgress.v = '1'`, không xoá `wordStatus` trước khi ghi thành công.
4. **Chuẩn MySQL 5.6+ (`RK-005`):** Nếu thêm cột `word_progress`, bắt buộc dùng `LONGTEXT` (không dùng `JSON`), script migration chạy lại an toàn.

---

## 4. Checklist nghiệm thu chi tiết (`03-ACCEPTANCE-CHECKLIST.md`)

### U — Âm thanh và bố cục (PR A)
- [ ] **U-1:** Mở bước Flashcard từ tab bài học → từ thẻ 1 tự đọc 1 lần trong ~0.5 s
- [ ] **U-2:** Bấm Tiếp 5 lần thật nhanh → chỉ thẻ cuối được đọc; không chồng tiếng
- [ ] **U-3:** Lật thẻ → không tự đọc
- [ ] **U-4:** Bấm 🔊 / 🐢 mặt trước → đọc lại / đọc chậm (`0.55`); thẻ không lật; có hiệu ứng khi đang đọc
- [ ] **U-5:** Tắt loa tổng (`useSound().muted`), chuyển thẻ → không tự đọc (ghi rõ hành vi 🔊 khi loa tổng tắt)
- [ ] **U-6:** Tắt "Tự đọc", tải lại trang, chuyển thẻ → không tự đọc; công tắc vẫn Tắt
- [ ] **U-7:** Rời trang / ẩn tab khi đang đọc → âm thanh dừng ngay
- [ ] **U-8:** `grep -rn "Nghe phát âm\|Nghe câu ví dụ\|Nghe tiếng Việt" src/components/learn` → rỗng
- [ ] **U-9:** Màn flashcard cả hai mặt → không có nút đánh dấu, không có chữ "thuộc"
- [ ] **U-10:** Thẻ cuối → nút chính `"Hoàn thành → {bước kế} ▷"`; không còn nút xanh thứ hai
- [ ] **U-11:** Máy không có giọng `vi-VN` → ẩn loa cạnh nghĩa, không lỗi console
- [ ] **U-12:** 360×640 và 412×915 → loa không đè chữ; thẻ không đổi chiều cao khi lật; nút Tiếp không nhảy

### S — Điểm nhớ và trạng thái (PR B, PR C)
- [ ] **S-1:** Lướt qua thẻ X chỉ nhờ tự đọc → X vẫn `new`, 0 điểm
- [ ] **S-2:** Trong **1** lượt flashcard: lật X 5 lần, bấm loa 3 lần → X = 1 điểm, `learning`, chấm xanh nhạt
- [ ] **S-3:** Mở flashcard thêm 3 lượt, mỗi lượt lật X 1 lần (cùng ngày, tắt mạng) → X = 4 điểm, `known`, chấm xanh đậm
- [ ] **S-4:** Từ Y chưa từng xem thẻ; đúng Y ở 2 lượt quiz khác nhau → Y = 4 điểm, `known`
- [ ] **S-5:** Một quiz có 2 câu cùng kiểm tra Y, đúng cả 2 → Y chỉ +2
- [ ] **S-6:** Sai câu kiểm tra X → X = 0 điểm, `review`; mở flashcard thấy X đầu bộ thẻ, chấm cam
- [ ] **S-7:** Sau đó lật thẻ X → X = 1 điểm nhưng vẫn `review`
- [ ] **S-8:** Sau đó đúng câu kiểm tra X → X = 3 điểm, `learning`
- [ ] **S-9:** X `known`, giả lập 15 ngày không tương tác → X vẫn `known`, điểm không đổi, chấm có viền cam; mở flashcard X nằm ngay sau nhóm `review`
- [ ] **S-10:** Lật lại X → viền cam mất
- [ ] **S-11:** Nhóm Mới học: 4 lượt gặp → `learning`; lượt thứ 5 → `known`
- [ ] **S-12:** Câu quiz không có `targetWords` → không đổi trạng thái từ nào
- [ ] **S-13:** Bài Nói theo chấm đạt → không đổi điểm
- [ ] **S-14:** Người dùng có dữ liệu "đã thuộc" cũ; tải app 2 lần → các từ đó là `learning` 1 điểm (không thành 2 điểm)
- [ ] **S-15:** Tắt mạng, học flashcard, bật mạng lại (nếu bật đồng bộ server theo `DEC-09`) → điểm được giữ và đồng bộ

### R — Kỹ thuật (đã kiểm tự động)
- [x] **R-1:** Test `wordProgress` trong `npm test` → **17/17 PASS** (16/16 ca gốc + 1 ca `normalizeWordId`/`mergeProgressMap`; toàn repo **205/205 PASS**)
- [x] **R-2:** `points +=` trong `src/components` → rỗng (component không tự tính điểm)
- [x] **R-3:** `knownAtPoints|maybeForgetDays` trong `src` → chỉ có trong `groups.js` và `wordProgress.js` (`+ wordProgress.test.js`)
- [x] **R-4:** Trợ năng → nút loa, nút `‹`, chấm tiến độ có đủ `aria-label`, vùng chạm ≥ 44 px (chờ kiểm lại bằng TalkBack thực tế)
- [x] **R-5:** Bật `prefers-reduced-motion` → đã tắt transition lật & animation nhịp loa trong `flashcard.css`
