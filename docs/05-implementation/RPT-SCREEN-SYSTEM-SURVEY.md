# RPT-SCREEN-SYSTEM-SURVEY — Báo cáo Khảo sát Mã nguồn Bước 0 (Hệ thống Màn học 4 Đợt)

> **Ngày khảo sát:** 2026-11-27 · **Nhánh nền kiểm tra:** `main` tại commit `74535c1`  
> **Chuẩn gốc:** [STD-SCREEN-SYSTEM-v1.0.md](../04-design/STD-SCREEN-SYSTEM-v1.0.md) · **Gói đặc tả:** [screen-system/README.md](screen-system/README.md) (`PHASE1`–`PHASE4`)  
> **Mục tiêu:** Đối chiếu thực tế mã nguồn hiện hành với các yêu cầu Bước 0 của Đợt 1–4, phát hiện các điểm lệch / rủi ro kỹ thuật và tài liệu còn thiếu trước khi bắt tay viết code.

---

## 1. Xác nhận Nhánh nền & Tính năng sẵn có (Bước 0.1 & 0.4)

| Hạng mục kiểm tra | Thực tế trên `main` (`74535c1`) | Kết luận |
|---|---|---|
| **Nhánh nền** | `feat/flashcard-audio-ux` (`846fa75`) đã được gộp vào `main` (`74535c1`); `main` đã có đủ Arena, Gacha, Pet Director V2, Question QA (`0` lỗi cứng) và bản vá sync loop `7fe282e` | **Dựng `feat/screen-system-p1` trực tiếp từ `main`** (không cần dựng trên nhánh rời) |
| **F3 `wordProgress.js`** | Đã có sẵn tại `src/features/vocab/wordProgress.js` + 17 test PASS (`wordProgress.test.js`), đã đồng bộ `user_progress.word_progress` trong `server/routes/api.js` & `src/hooks/useUser.jsx` | Sẵn sàng nối thẳng từ `useScreenEvents` ở Đợt 1 và mở rộng `skillsHit` ở Đợt 3 |
| **Pet Director V2** | Đã có `src/pet-director/DirectorContext.jsx`, `PetStage.jsx`, `lineSelector.js`, `src/data/pet-lines/common.js` & `cowdi.js` | Dùng trực tiếp `dispatch(...)`, thêm nhóm câu `screen_intro` vào LineDB ở Đợt 1 |
| **Phân quyền Admin (Đợt 2)** | Server: `requireAuth` + `requireAdmin` tại `server/middleware/auth.js` (L35–55), kiểm tra DB `users.is_admin = 1`, mẫu chuẩn tại `server/routes/petMotionAdmin.js`. Client: `<RequireAdmin>` tại `src/App.jsx` (L99) | Tái sử dụng 100%, không tạo cơ chế phân quyền mới |
| **Vùng đất `shared/regions.js` (Đợt 3)** | **Chưa tồn tại** trong `shared/` | Cần tạo bản tối thiểu `shared/regions.js` (hoặc gộp Story Bible trước Đợt 3) |
| **Kiểm thử hiện tại** | `npm test`: **224/224 PASS** · `npm run build` & `npm run build:prod`: **PASS** | Nền ổn định |

---

## 2. Tình trạng A1–A3: Chấm phát âm & Chấm gõ (Bước 0.2)

| Vị trí | Hiện trạng | Vấn đề phát hiện |
|---|---|---|
| `src/utils/speech.js` (L1–70) | Đã export `SpeechRecognitionAPI`, `normalizeText`, `levenshtein`, `scorePronunciation`, `getScoreLabel`, `cleanSpeechText`, `speakWord`, `stopSpeaking`, `hasVietnameseVoice` | 1) **Bug chuỗi rỗng**: `normalizeText('').split(' ')` trả về `['']` (length 1) thay vì `[]` → kiểm tra `!spkWords.length` ở L29 không bao giờ kích hoạt.<br>2) Chưa có hàm chuẩn hoá **rút gọn tiếng Anh** (`I'm` ↔ `I am`, `don't` ↔ `do not`, `it's` ↔ `it is`, `you're` ↔ `you are`, `can't` ↔ `cannot`) phục vụ chấm gõ T-08.<br>3) Chưa có unit test tự động cho `speech.js`. |
| `src/features/lesson/LessonDetailPage.jsx` (L44–113) | Vẫn **nhân bản cục bộ** 4 hàm `normalizeText`, `scorePronunciation`, `levenshtein`, `getScoreLabel` và hằng `SpeechRecognitionAPI` thay vì import từ `src/utils/speech.js` | Phải xoá bản trùng và import duy nhất từ `src/utils/speech.js` (dọn A1–A3 trước hoặc ngay đầu Đợt 1). |

---

## 3. Bản đồ `LessonDetailPage.jsx` (2.241 dòng — Bước 0.3)

| Khu vực / Tab | Dòng trong `LessonDetailPage.jsx` | Ghi chú tách thành component màn T |
|---|---|---|
| Helper phát âm trùng (A1–A3) | `L44–113` | Xoá, import từ `src/utils/speech.js` |
| `ReadingPassage` (nội bộ file) | `L140–399` | Tách thành `focus/T04Reading.jsx` (giữ `U3` giải thích & `U10` chống farm thưởng) |
| State & khởi tạo bước học | `L400–850` | Chứa `tab`, `stepDone`, `vocab`, `listenPool` (`L851–896`), `listenQs`, `speakIdx`, `quizQuestions`, `pretest` (Luyện thi) |
| Logic Nghe câu (`buildLessonListenQuestions`, `startLessonListen`, `handleListenPick`, `handleListenNext`) | `L851–946` | Tách pool sang `screens/items.js` (`listenItems`), UI sang `focus/T05Listen.jsx` |
| Logic Nói theo (`finalizeSpeak`, `resetSpeak`) | `L947–986` | Tách pool sang `screens/items.js` (`speakItems`), UI sang `focus/T06Speak.jsx` |
| Logic Quiz & Kết thúc bài (`handleAnswer`, `finishLessonAttempt`, `goToNextQuestion`, `restartQuiz`) | `L987–1130` | `finishLessonAttempt` (`L1034–1100`) là nơi tính `base = finalScore * 10 + (isPerfect ? 30 : 0)` và cộng Sữa qua `addXP(xp)` — Đợt 1 giữ nguyên, Đợt 3 thay bằng `shared/lesson-stars.js` (Q13) |
| Top chrome & Stepper cũ | `L1200–1334` | Chỉ render khi cờ `screenSystemV1` **tắt** |
| Tab `vocab` (T-01) | `L1540–1607` | Tách sang `focus/T01Vocab.jsx` |
| Tab `flashcard` (T-02) | `L1608–1665` | Đã dùng `<Flashcard>` v1.4 — bọc sang `focus/T02Flashcard.jsx` |
| Tab `grammar` (T-03) | `L1666–1708` | **Không chiếm vị trí màn** (Q10) → chuyển thành mẹo pet ở T-08 + `<GrammarSheet>` |
| Tab `reading` (T-04) | `L1709–1731` | Bọc `<ReadingPassage>` sang `focus/T04Reading.jsx` |
| Tab `speak` (T-06) | `L1732–1979` + footer `L2228–2239` | Tách sang `focus/T06Speak.jsx` (nhớ xử lý từ chối mic đi tiếp được) |
| Tab `listen` (T-05) | `L1980–2165` | Tách sang `focus/T05Listen.jsx` |
| Tab `quiz` (T-07) | `L2166–2197` | Tách sang `focus/T07Quiz.jsx` |

---

## 4. Điểm lệch & Rủi ro Kỹ thuật Cần Xử lý (Không tự đoán)

### R1 — Tương thích MySQL 5.5/5.6 (`RK-005` — **Nghiêm trọng**)
Trong đặc tả `PHASE2.md`, `PHASE3.md`, `PHASE4.md`, các bảng SQL mẫu dùng:
```sql
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```
**Lệch với production (`RK-005`)**: MySQL Production `< 5.6.5` **không cho phép `DEFAULT CURRENT_TIMESTAMP` / `ON UPDATE CURRENT_TIMESTAMP` trên cột kiểu `DATETIME`** (chỉ hỗ trợ trên tối đa 1 cột `TIMESTAMP` mỗi bảng, hoặc dùng `DATETIME DEFAULT NULL` và cập nhật bằng `NOW()` trong câu query).
- **Đề xuất**: Toàn bộ migration Đợt 1–4 tuân thủ chuẩn `RK-005` (dùng `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` duy nhất 1 cột/bảng hoặc `DATETIME DEFAULT NULL` + runner Node idempotent `scripts/run-screen-system-*.js`, không dùng `CREATE PROCEDURE` nếu quyền DB hạn chế).

### R2 — Tài liệu tham chiếu chưa có trong repo `docs/`
So với danh mục mục 2 của [screen-system/README.md](screen-system/README.md):

| Tài liệu được nhắc | Trạng thái trong repo | Ảnh hưởng theo đợt |
|---|---|---|
| `PET-DIRECTOR-INTEGRATION.md` | Có bản tương đương: [SDD-PET-DIRECTOR-v1.1.md](../04-design/SDD-PET-DIRECTOR-v1.1.md) | Đủ thông tin |
| `GEMINI-FLASHCARD-AUDIO-UX.md` | Có bản tương đương: [SDD-FLASHCARD-AUDIO-UX-v1.4.md](../04-design/SDD-FLASHCARD-AUDIO-UX-v1.4.md) | Đủ thông tin |
| `GEMINI-LEARNING-GROUPS.md` | Có bản tương đương: [SDD-LEARNING-GROUPS-v2.0.md](../04-design/SDD-LEARNING-GROUPS-v2.0.md) | Đủ thông tin |
| `STD-LESSON-CONTENT-v1.0.md` & `MAP-CURRENT-UI.md` | Đã có trong `docs/05-implementation/content/` | Đủ thông tin |
| `COWDI-AI-PROMPT-BLOCKS.md` | Có một phần tại `docs/05-implementation/art/prompts/AI_PROMPT_BLOCKS.md` | Đợt 3–4 (nếu có thêm block câu dẫn thì cần bổ sung) |
| **`STD-LEARNING-UX-v1.0.md`** | **Chưa có trong repo** | Đợt 1–4 (hiện các quy tắc chính P0/P1/P4 đã được trích dẫn khá rõ trong `STD-SCREEN-SYSTEM` & `PHASE1`) |
| **`AUDIT-LEARNING-UX-2026-11-27.md`** | **Chưa có trong repo** | Đợt 1 (chi tiết A1–A3 & A5 câu template — đã xác định lỗi cốt lõi trong `speech.js`/`LessonDetailPage.jsx`, nhưng nếu PO có file này nên bổ sung để khớp 100% tiêu chí A5) |
| **`STORY-BIBLE-IMPLEMENTATION.md`** | **Chưa có trong repo** | **Chặn Đợt 3–4**: cần danh sách `UNIT_REGION` (BD, TG, VS...), `HUMAN_CAST` (Ông Tư, v.v.), và `BOSS_TINT` |
| **`AUDIO-DESIGN-BIBLE.md`** | **Chưa có trong repo** | Đợt 3–4: mapping SFX đúng/sai/combo/sao tăng dần |

### R3 — Công thức Sữa server-side & Sync Loop (`7fe282e`)
- Trong Đợt 1, khi thêm `lessonMixLog` và `lastMix` vào `PUT /api/progress` (`server/routes/api.js` + `src/hooks/useUser.jsx`), bắt buộc giữ nguyên guard `skipNextSyncRef` và điều kiện `isLesson = newlyCompletedValidIds.length > 0 || Number(d.lastMilkEarned) > 0` để **không tái phát vòng lặp sync 3 giây**.
- Trong Đợt 3 (mục 7b Sao & Sữa theo sao), cần kiểm tra đồng bộ cả `LessonDetailPage`/`ScreenHost` và `server/routes/api.js` (nơi ghi `wallet_ledger` cho `lastMilkEarned`) để đảm bảo Sữa tối đa lần đầu vẫn đúng **190** và mỗi mức sao (`★★ +15`, `★★★ +30`) chỉ trả thưởng 1 lần trên server (`lessonStarPaid`).

### R4 — Chưa chạy script phủ dữ liệu (`RPT-SCREEN-COVERAGE`)
- Bước 0.5 yêu cầu tạo `scripts/report-screen-coverage.mjs` để quét toàn bộ 221 bài học (đặc biệt 39 bài Trung bình `int-u1..u10` và bài Luyện thi) xem bài nào thiếu dữ liệu cho từng màn T/F. Đây sẽ là việc đầu tiên khi mở nhánh Đợt 1.
