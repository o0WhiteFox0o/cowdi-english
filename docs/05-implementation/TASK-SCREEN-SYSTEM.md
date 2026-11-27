# TASK-SCREEN-SYSTEM — Kế hoạch & Checklist Triển khai Hệ thống Màn học (4 Đợt · WS-11)

> **Ngày lập:** 2026-11-27 · **Chuẩn gốc:** [STD-SCREEN-SYSTEM-v1.0.md](../04-design/STD-SCREEN-SYSTEM-v1.0.md)  
> **Khảo sát Bước 0:** [RPT-SCREEN-SYSTEM-SURVEY.md](RPT-SCREEN-SYSTEM-SURVEY.md) · **Gói giao việc:** [screen-system/README.md](screen-system/README.md)  
> **Trạng thái hiện tại:** ⏳ Chờ Product Owner (Sonny) xác nhận điểm chốt trước khi mở nhánh Đợt 1 (`feat/screen-system-p1`).

---

## 0. Lộ trình tổng thể & Cổng duyệt PO

```text
[Bước 0 & A1–A3] ──▶ [Đợt 1: feat/screen-system-p1] ──(Duyệt PO)──▶ [Đợt 2: feat/screen-system-p2]
                                                                            │
                                                                       (Duyệt PO)
                                                                            ▼
[Đợt 4c: dọn code] ◀──(bật mọi người ≥2 tuần)── [Đợt 4a + 4b] ◀──(thử ≥1 tuần)── [Đợt 3: feat/screen-system-p3]
```

| Đợt | Nhánh Git | Phạm vi chính | Cổng duyệt / Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| **0 (Pre)** | `feat/screen-system-p1` (hoặc PR riêng) | Gộp chấm điểm `speech.js` (A1–A3), xóa bản trùng ở `LessonDetailPage`, thêm test + chạy `report-screen-coverage.mjs` | PO xác nhận nhánh nền `main` (`74535c1`) & làm A1–A3 trước | `[ ]` |
| **Đợt 1** | `feat/screen-system-p1` | Registry 7 màn T, `items.js`, bộ trộn `mixer.js` + test M1–M9, tách 6 màn T, màn mới **T-08 Viết câu**, T-03 → mẹo pet + `GrammarSheet`, `ScreenHost` / `RouteHeader` / `ScreenIntro` / `useScreenEvents`, cờ `screenSystemV1`, đồng bộ `lessonMixLog` & `lastMix` | Sau khi xong: PO xem `RPT-SCREEN-COVERAGE` và test cờ trên máy thật | `[ ]` |
| **Đợt 2** | `feat/screen-system-p2` | Migration 4 bảng cấu hình (`RK-005` MySQL 5.6+), API `GET /api/screens/config` (ETag/304) + 7 API `/api/admin/screens*`, `ScreenConfigProvider`, trang `/admin/screens` (6 tab: Danh mục, Ma trận, Trộn thử + 1.000 lần, Xem trước sandbox, Tài khoản thử, Nhật ký) | Phụ thuộc Đợt 1 merge; sau Đợt 2: PO chọn 5–10 tài khoản thử | `[ ]` |
| **Đợt 3** | `feat/screen-system-p3` | Khung `friendly/`, 5 màn F đầu (**F-01, F-03, F-08, F-09, F-06** ở trạng thái `test`), màn **Mở ải**, bảng `screen_intro` + luật không lặp 10 ải + 156 câu dẫn nháp (`BD/TG/VS`) + tab admin Kho dẫn nhập, **Khách quen**, **4 chấm kỹ năng `skillsHit`**, **Sao ★ + Sữa theo sao** (`shared/lesson-stars.js`, Q13), màn **Tổng kết mới** | Phụ thuộc Đợt 2 + cần `STORY-BIBLE` (`UNIT_REGION`, `HUMAN_CAST`) & `AUDIO-DESIGN-BIBLE`; chạy thử ≥ 1 tuần | `[ ]` |
| **Đợt 4a** | `feat/screen-system-p4a` | Thống kê màn (`screen_stat_daily`, `POST /api/screen-stats`, tab admin Thống kê) + 3 màn F (**F-02, F-04, F-05**) + câu dẫn nháp | Phụ thuộc thử nghiệm Đợt 3 ≥ 1 tuần | `[ ]` |
| **Đợt 4b** | `feat/screen-system-p4b` | Trường dữ liệu mới (`vocabulary[].plural/countable`, `dialogPrompts[]`, `trueFalse[]`) + validator + nội dung mẫu `int-u1..u3` + 3 màn F (**F-07, F-10, F-11**) | Phụ thuộc PO duyệt nội dung & ảnh theo `sceneBrief` | `[ ]` |
| **Đợt 4c** | `feat/screen-system-p4c` | Gỡ code tab cũ khỏi `LessonDetailPage.jsx`, gỡ cờ `screenSystemV1` | Bật cho mọi người ≥ 2 tuần, không lỗi P0/P1 | `[ ]` |

---

## 1. Kế hoạch Chi tiết Đợt 1 (`feat/screen-system-p1`) — Sẵn sàng thực hiện sau khi PO duyệt

> Đặc tả chi tiết: [GEMINI-SCREEN-SYSTEM-PHASE1.md](screen-system/GEMINI-SCREEN-SYSTEM-PHASE1.md)

### 1.1 Việc làm theo thứ tự
- [ ] **1.0 — Tiền điều kiện A1–A3 & Báo cáo phủ dữ liệu**
  - Sửa `src/utils/speech.js`: fix `split(' ')` chuỗi rỗng (`.filter(Boolean)`), bổ sung chuẩn hoá rút gọn tiếng Anh (`I'm`↔`I am`, `don't`↔`do not`, `it's`↔`it is`, `you're`↔`you are`, `can't`↔`cannot`) và hỗ trợ dung sai chính tả 1 ký tự cho từ ≥ 5 chữ cái (phục vụ T-08).
  - Xoá 4 hàm nhân bản (`L44–113`) trong `src/features/lesson/LessonDetailPage.jsx`, import từ `src/utils/speech.js`.
  - Viết test đơn vị `src/utils/speech.test.js` (thêm vào `npm test`).
  - Viết `scripts/report-screen-coverage.mjs` và xuất `docs/06-verification-validation/RPT-SCREEN-COVERAGE-2026-11-27.md` trên toàn bộ 221 bài học.
- [ ] **1.1 — Lõi Registry, Items & Bộ trộn thuần JS**
  - Tạo `src/data/config/screens.js` (cấu hình tĩnh `SCREEN_CONFIG`: 7 mã T `on`, trọng số 3 nhóm theo Q9).
  - Tạo `src/features/lesson/screens/items.js` (`listenItems`, `speakItems`, `writeItems`, `bossItems` — dùng chung cho `canRun` và component).
  - Tạo `src/features/lesson/screens/seededRandom.js` (`mulberry32`, `hashString`).
  - Tạo `src/features/lesson/screens/mixer.js` (`mixLesson` thuần JS, không `Math.random()`, không import React).
  - Tạo `src/features/lesson/screens/registry.js` (7 màn T: `T-01, T-02, T-04, T-05, T-06, T-07, T-08`; `T-03` không chiếm slot).
  - Tạo `src/features/lesson/screens/mixer.test.mjs` — phủ đủ **M1–M9** (`node --test`).
- [ ] **1.2 — Tách 6 màn T hiện có (giữ nguyên giao diện, bỏ nút vận hành)**
  - `src/features/lesson/screens/focus/T01Vocab.jsx`
  - `src/features/lesson/screens/focus/T02Flashcard.jsx` (bọc `<Flashcard>` v1.4)
  - `src/features/lesson/screens/focus/T04Reading.jsx` (tách từ `ReadingPassage`)
  - `src/features/lesson/screens/focus/T05Listen.jsx`
  - `src/features/lesson/screens/focus/T06Speak.jsx` (xử lý từ chối mic đi tiếp được)
  - `src/features/lesson/screens/focus/T07Quiz.jsx`
- [ ] **1.3 — Màn mới T-08 Viết câu & T-03 → Mẹo pet + `GrammarSheet`**
  - `src/features/lesson/screens/GrammarSheet.jsx` (bottom sheet cuộn trong sheet, đóng bằng ✕ hoặc vuốt xuống).
  - `src/features/lesson/screens/focus/T08WriteSentence.jsx` (2 kiểu: Xếp câu có 2 từ nhiễu + Gõ câu cho `exam` và câu 4 `intermediate`; bố cục không cuộn 360×640; mẹo pet từ `grammar[].mistakes[0]`).
- [ ] **1.4 — `ScreenHost`, `RouteHeader`, `ScreenIntro`, `useScreenEvents` & Cờ bật/tắt**
  - `src/features/lesson/screens/RouteHeader.jsx` (vòng tròn kỹ năng + màu chuẩn + `aria-label`).
  - `src/features/lesson/screens/ScreenIntro.jsx` (1,5s / 3s, chạm để bỏ qua, câu pet `screen_enter` + ≥ 4 câu `screen_intro`/slot trong LineDB).
  - `src/features/lesson/screens/screenEvents.js` (`useScreenEvents` nối Pet Director + `wordProgress` + `pet.skills`, tôn trọng `sandbox`).
  - `src/features/lesson/screens/ScreenHost.jsx` (100dvh không cuộn cấp trang, lưu phiên vào `sessionStorage`, xác nhận thoát trong app).
  - Gắn cờ `screenSystemV1` (`localStorage.cowdi_ff_screenSystemV1` → `VITE_FF_SCREEN_SYSTEM_V1` → `false`) vào `LessonDetailPage.jsx` (chỉ áp cho `intermediate`/`exam`, giữ nguyên code tab cũ khi cờ tắt và giữ `PictureLesson` cho `beginner`) + mục ẩn chạm logo 5 lần trong Cài đặt (`AccountPage.jsx`).
- [ ] **1.5 — Đồng bộ `lessonMixLog` & `lastMix` lên Server (chuẩn `RK-005`)**
  - Migration SQL `server/db/migrate-screen-system-p1.sql` + runner Node idempotent `scripts/run-screen-system-p1-migration.js` (thêm `lesson_mix_log LONGTEXT`, `last_mix LONGTEXT` vào `user_progress`).
  - Cập nhật `server/routes/api.js` (whitelist + merge `lessonMixLog` 30 bản gần nhất theo `(lessonId, at)` + `lastMix` mới nhất; giữ nguyên guard `isLesson` `7fe282e`).
  - Cập nhật `src/hooks/useUser.jsx` (merge + persist `lessonMixLog`, `lastMix`; giữ nguyên `skipNextSyncRef`).
- [ ] **1.6 — Kiểm chứng & Báo cáo PR Đợt 1**
  - `npm test` (toàn bộ cũ + `speech.test.js` + `mixer.test.mjs` M1–M9) → 100% PASS.
  - `npm run build` → PASS.
  - Kiểm tra responsive 360×640 & 800×1280 không cuộn trang, ghi số chạm vận hành trước/sau và xác nhận cờ tắt chạy giống hệt cũ trên 3 bài golden.

---

## 2. Tóm tắt File & Migration các Đợt 2–4

### Đợt 2 (`feat/screen-system-p2`) — [Chi tiết](screen-system/GEMINI-SCREEN-SYSTEM-PHASE2.md)
- **Migration DB (`RK-005`)**: `server/db/migrate-screen-system-p2.sql` + `scripts/run-screen-system-p2-migration.js` tạo 4 bảng `screen_config`, `screen_weights`, `screen_testers`, `screen_config_log` + seed 19 mã (8 T + 11 F `todo`) & 3 nhóm trọng số.
- **Backend**: `server/routes/screens.js` (`GET /api/screens/config` ETag/304) + `server/routes/screensAdmin.js` (`requireAuth + requireAdmin`, 7 endpoint ghi giao dịch + log).
- **Frontend**: `ScreenConfigProvider` (cache `localStorage`, fallback `SCREEN_CONFIG` tĩnh), route `<RequireAdmin>` `/admin/screens` với 6 tab + test A1–A8.

### Đợt 3 (`feat/screen-system-p3`) — [Chi tiết](screen-system/GEMINI-SCREEN-SYSTEM-PHASE3.md)
- **Cần chuẩn bị trước**: cung cấp `STORY-BIBLE-IMPLEMENTATION.md` (`UNIT_REGION`, `HUMAN_CAST`, `BOSS_TINT`) và `AUDIO-DESIGN-BIBLE.md` (SFX); hoặc chốt bản tối thiểu `shared/regions.js`.
- **Migration DB (`RK-005`)**: bảng `screen_intro`, seed 156 câu nháp (`status = 'draft'`) cho 3 vùng `BD/TG/VS`, cột `recent_intros`, `lesson_stars`, `lesson_star_paid` (`LONGTEXT`) trên `user_progress`.
- **Code mới**: `shared/lesson-stars.js` + test S1–S5; khung `screens/friendly/` (`FriendlyFrame`, `PetLine`, `useItemQueue`, `friendly.css`); 5 màn F (`F-01, F-03, F-08, F-09, F-06`, khởi tạo `test`); màn **Mở ải** + **Tổng kết mới**; tab admin **Kho dẫn nhập**; **Khách quen**; **4 chấm `skillsHit`** trong `wordProgress.js`; sao ★ trên node `LearningPathPage` + test P1–P10.

### Đợt 4 (`p4a`, `p4b`, `p4c`) — [Chi tiết](screen-system/GEMINI-SCREEN-SYSTEM-PHASE4.md)
- **4a**: `screen_stat_daily` (không lưu `user_id`), `POST /api/screen-stats`, tab admin **Thống kê**, 3 màn `F-02, F-04, F-05`.
- **4b**: Mở rộng `schema.js` + `validate-lessons.mjs` + `STD-LESSON-CONTENT` lên v1.1 (`plural`/`countable`, `dialogPrompts[]`, `trueFalse[]`), soạn dữ liệu mẫu `int-u1..u3`, 3 màn `F-07, F-10, F-11`.
- **4c**: Gỡ code tab cũ trong `LessonDetailPage.jsx` và gỡ cờ `screenSystemV1` sau khi chạy ổn định ≥ 2 tuần.

---

## 3. Điểm Cần PO (Sonny) Xác nhận Trước Khi Chạy Đợt 1

1. **Xác nhận bắt đầu Đợt 1 trên `main` (`74535c1`)**: mở nhánh `feat/screen-system-p1`, gộp luôn dọn **A1–A3 (`src/utils/speech.js`)** ở đầu nhánh (hoặc muốn tách A1–A3 thành 1 PR riêng trước?).
2. **Tài liệu tham chiếu còn thiếu trong repo**:
   - Đợt 1: có file `STD-LEARNING-UX-v1.0.md` và `AUDIT-LEARNING-UX-2026-11-27.md` (chi tiết A5 câu template) để nạp vào repo không, hay cho phép triển khai Đợt 1 theo các quy tắc đã trích dẫn sẵn trong `STD-SCREEN-SYSTEM-v1.0` & `PHASE1`?
   - Đợt 3–4 (chưa chặn Đợt 1–2): cần bổ sung `STORY-BIBLE-IMPLEMENTATION.md` và `AUDIO-DESIGN-BIBLE.md` trước khi vào Đợt 3.
3. **Chuẩn SQL MySQL 5.6 (`RK-005`)**: xác nhận chuyển các cột `DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` trong đặc tả sang chuẩn tương thích MySQL 5.5/5.6+ đã áp dụng toàn dự án.
4. **Hạng mục mở dài hạn (không chặn Đợt 1–3)**: nhóm Mới học (`PictureLesson`) giữ nguyên ở Đợt 1–3, xem xét chuyển ở Đợt 4.
