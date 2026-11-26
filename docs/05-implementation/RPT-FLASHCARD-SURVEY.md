# RPT-FLASHCARD-SURVEY — Báo cáo Khảo sát Mã nguồn Bước 0 (Flashcard v1.4)

> **Ngày khảo sát:** 2026-11-26 · **Phạm vi:** Gói bàn giao `cowdi-flashcard-v1.4.zip` · **Đặc tả gốc:** [SDD-FLASHCARD-AUDIO-UX-v1.4.md](../04-design/SDD-FLASHCARD-AUDIO-UX-v1.4.md)
> **Trạng thái:** ✅ Hoàn thành khảo sát Bước 0 (chỉ đọc mã nguồn, chưa sửa code)

---

## 1. Trả lời 6 câu hỏi bắt buộc của Bước 0

### 1.1 Có mấy component flashcard? Đã gộp thành `src/components/learn/Flashcard.jsx` chưa?
- **Chưa gộp.** Trong repo **chưa tồn tại** `src/components/learn/Flashcard.jsx` và không có tài liệu `GEMINI-FLASHCARD-RESULT-FIX.md`.
- Hiện có **2 bản Flashcard độc lập**:
  1. [`src/features/lesson/LessonDetailPage.jsx`](../../src/features/lesson/LessonDetailPage.jsx) (dòng 1574–1661): tab `"Tuỳ chọn: Flashcard"` trong bài học. Hiện có `fcMastered`, dòng `"n đã thuộc"`, nút `"Đã thuộc / Thuộc rồi!"`, 3 nút loa dưới thẻ (`"Nghe phát âm"`, `"Nghe câu ví dụ"`, `"Nghe tiếng Việt"`), và đang gọi `speakWord` khi **lật thẻ** thay vì khi chuyển thẻ.
  2. [`src/pages/VocabularyPage.jsx`](../../src/pages/VocabularyPage.jsx) (dòng 834–950): chế độ Flashcard trong trang Từ vựng theo chủ đề. Hiện có nút `"Đã thuộc"` / `"Đang học"`, nút loa `Nghe` / `Chậm` / `Nói` (mic) trên mặt trước, chưa có tự đọc khi chuyển thẻ.
- **Hành động:** PR A sẽ xây dựng mới component dùng chung `src/components/learn/Flashcard.jsx` (kèm CSS chuẩn grid 2 mặt đồng chiều cao, không giật khi lật) và thay thế cả 2 màn trên.

### 1.2 Trạng thái "đã thuộc" cũ lưu ở đâu, khoá gì, dạng dữ liệu gì? Có đồng bộ server không?
- **Frontend (`src/hooks/useUser.jsx`):**
  - Khoá `localStorage`: `cowdi_english_data` (khách) hoặc `cowdi_english_data_<userId>` (đã đăng nhập).
  - Trường: `userData.wordStatus` dạng `{ [word: string]: 'learned' | 'learning' }` và bộ đếm `userData.wordsLearned`.
  - Hàm ghi cũ: `markWord(word, status)`, hàm đọc cũ: `getWordStatus(word)`.
- **Backend (`server/routes/api.js`):**
  - **Có đồng bộ server** qua `GET /api/progress` và `PUT /api/progress`, lưu ở cột `user_progress.word_status` (kiểu `LONGTEXT` JSON) và `user_progress.words_learned`.
  - Chưa có cột `word_progress` trên bảng `user_progress` và chưa whitelist `wordProgress` trong `PUT /api/progress`.
- **Điểm cần chốt (`DEC-09`, theo Quy tắc R6):** Không tự ý sửa schema DB server khi chưa được duyệt. Cần Product Owner chốt chọn phương án đồng bộ server (`word_progress LONGTEXT` + migration MySQL 5.6+ an toàn) hay lưu `localStorage` trước.

### 1.3 `speakWord` ở file nào, chữ ký hiện tại, có trả Promise / callback không? Loa tổng điều khiển bằng gì?
- [`src/utils/speech.js`](../../src/utils/speech.js) hiện **chưa có** `speakWord` hay `stopSpeaking` (chỉ có `SpeechRecognitionAPI`, `normalizeText`, `levenshtein`, `scorePronunciation`, `getScoreLabel`).
- Hai bản `speakWord` đang nằm cục bộ trong 2 page:
  - `LessonDetailPage.jsx:554`: `speakWord(text, rate = defaultTtsRate, opts = {})` → trả `Promise`, có `opts.lang`, gắn trực tiếp `dispatch('pet_speak_start/end')` & `petRef.setVoiceLevel`, **chưa có** `onStart`/`onEnd` hay reject khi lỗi/bị chặn.
  - `VocabularyPage.jsx:418`: `speakWord(text, rate = 0.85)` → không trả `Promise`, không có `onStart`/`onEnd`.
- Ngoài ra `src/pet-director/tts.js` có `speakEnglishText(text, { rate, onStart, onEnd })`.
- **Loa tổng (thanh trên cùng):** điều khiển bằng `useSound()` trong [`src/hooks/useSound.jsx`](../../src/hooks/useSound.jsx) — trả về `{ play, muted, toggleMute }`, lưu `localStorage` khoá `cowdi_sound_muted` (`'1'` = tắt).
- **Hành động:** Bổ sung `speakWord(text, opts)`, `stopSpeaking()`, `hasVietnameseVoice()` dùng chung vào `src/utils/speech.js` (trả `Promise`, hỗ trợ `{ rate, lang, onStart, onEnd }`, reject khi bị chặn/lỗi) và tái sử dụng cho `useAutoSpeak.js`, `Flashcard.jsx`, `LessonDetailPage.jsx`, `VocabularyPage.jsx`.

### 1.4 Từ vựng có id ổn định không (trường nào)?
- Khảo sát trên toàn bộ `221` bài học (`2.741` mục từ vựng): **`0 / 2.741` từ có trường `id`**.
- Mỗi mục chỉ có `word` (chuỗi tiếng Anh), `phonetic`, `meaning`, `pos`, `example`, `exampleVi`, `illustration`, `memoryTip`...
- **Hành động (theo F3.4):** Dùng `normalizeWordId(word) = String(word || '').trim().toLowerCase()` làm `wordId` ổn định và nhất quán giữa Flashcard, Quiz và Migration từ `wordStatus` cũ.

### 1.5 Những nơi nào chấm câu hỏi đúng/sai?
| Màn hình | File | Cơ chế chấm hiện tại |
|---|---|---|
| Quiz bài học (Trung bình & Luyện thi) | `src/features/lesson/LessonDetailPage.jsx` | Chọn đáp án trong bước `quiz` (từ `generateQuizFromLesson`) |
| Bài học tranh (Mới học) | `src/features/lesson/PictureLesson.jsx` | Thử thách 6 câu tự sinh từ `words[]` |
| Tab Luyện tập | `src/features/practice/PracticePage.jsx` | Các chế độ quiz/trắc nghiệm luyện từ & câu |
| Kiểm tra mở khoá Unit (Checkpoint) | `src/pages/LearningPathPage.jsx` | Bộ câu hỏi checkpoint theo `generateCheckpointQuestions` |
| Mini-game có chấm | `src/features/mini-games/MiniGamePage.jsx` | Các game ghép từ / chọn nghĩa có chấm đúng-sai |

### 1.6 Tỉ lệ câu hỏi xác định được `targetWords` theo từng nhóm (đo tự động từ `ALL_LESSONS`)

| Nhóm người học | Số bài (v2) | Câu tự sinh từ vựng (gắn được `targetWords`) | Câu tự sinh grammar | Câu soạn tay (`lesson.quiz`) | Câu soạn tay đã có `targetWords` | **Tỉ lệ xác định được `targetWords`** |
|---|---:|---:|---:|---:|---:|---:|
| **`beginner` (Mới học)** | 12 (12) | 72 | 0 | 0 | 0 | **100.0%** (72 / 72) |
| **`intermediate` (Trung bình)** | 65 (39) | 183 | 49 | 418 | 0 | **28.2%** (183 / 650) |
| **`exam` (Luyện thi)** | 144 (3) | 823 | 234 | 383 | 0 | **57.2%** (823 / 1.440) |
| **Tổng cộng** | **221 (54)** | **1.078** | **283** | **801** | **0** | **49.9%** (1.078 / 2.162) |

> **Nhận xét rủi ro chính:** Ở nhóm **Trung bình** (`39` bài v2 ưu tiên dùng 100% câu soạn tay trong `lesson.quiz`), tỉ lệ có `targetWords` ban đầu chỉ là **28.2%** do `0/801` câu soạn tay đã gắn `targetWords`. Đúng theo đặc tả F3.6 & R5, đợt này **không** tự điền hàng loạt `targetWords` cho câu soạn tay; sau PR C sẽ trình báo cáo chi tiết để Sonny quyết định đợt bổ sung dữ liệu riêng nếu cần.

---

## 2. Bảng xác nhận giả định `[A]` trong đặc tả

| Giả định `[A]` | Kết quả khảo sát | Cách xử lý trong triển khai |
|---|---|---|
| Đã có `src/components/learn/Flashcard.jsx` (PR 1 FIX) | **Chưa có**; còn 2 bản riêng ở `LessonDetailPage` & `VocabularyPage` | Tạo mới `src/components/learn/Flashcard.jsx` ngay trong PR A, dùng chung cho cả 2 màn |
| Đã có `speakWord` / `stopSpeaking` ở `src/utils/speech.js` | **Chưa có**; đang viết trùng ở 2 page | Tách `speakWord`, `stopSpeaking`, `hasVietnameseVoice` vào `src/utils/speech.js` |
| Loa tổng ở thanh trên cùng | **Có**: `useSound().muted` (`cowdi_sound_muted`) | Truyền `!muted && autoSpeak` vào `useAutoSpeak` |
| Từ vựng có `id` ổn định | **Không** (`0/2.741` có `id`) | Dùng `normalizeWordId(word) = word.trim().toLowerCase()` |
| Tiến độ từ lưu local hay đồng bộ server | **Cả hai**: `useUser.jsx` + `user_progress.word_status` | Chốt `DEC-09`: thêm cột `word_progress LONGTEXT` (MySQL 5.6+) hay giữ localStorage trước |
| Test framework (Vitest/Jest) | Repo dùng **`node --test`** (`package.json`) | Chạy thẳng `src/features/vocab/wordProgress.test.js` trong `npm test` (16/16 ca giữ nguyên) |
