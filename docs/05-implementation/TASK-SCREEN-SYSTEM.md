# TASK-SCREEN-SYSTEM — Kế hoạch & Checklist Triển khai Hệ thống Màn học (4 Đợt · WS-11)

> **Ngày lập:** 2026-11-27 · **Chuẩn gốc:** [STD-SCREEN-SYSTEM-v1.0.md](../04-design/STD-SCREEN-SYSTEM-v1.0.md)  
> **Khảo sát Bước 0:** [RPT-SCREEN-SYSTEM-SURVEY.md](RPT-SCREEN-SYSTEM-SURVEY.md) · **Gói giao việc:** [screen-system/README.md](screen-system/README.md)  
> **Trạng thái hiện tại:** 🟡 **Đợt 1 (`aed7af9`), Đợt 2 (`1e0fffc`), Đợt 3 (`eaaa812`) & Đợt 4a+4b đã gộp `main` và đóng gói `deploy.zip`** (đủ 11/11 màn Thân thiện `F-01..F-11` trạng thái `'test'`, 228 câu dẫn `draft`, thống kê ẩn danh `screen_stat_daily` + Tab 8 Admin, `shared/screen-scenarios.js`, dữ liệu mẫu 12 bài `int-u1..u3`) — chờ Sonny kiểm tra trên server thật; **Đợt 4c** (gỡ tab cũ `LessonDetailPage`) giữ lại tới khi chạy ổn định ≥ 2 tuần.

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
| **0 (Pre)** | `feat/screen-system-p1` | Gộp chấm điểm `speech.js` (A1–A3), xóa bản trùng ở `LessonDetailPage`, thêm test + chạy `report-screen-coverage.mjs` | Đã hoàn tất 2026-11-27 | `[x]` |
| **Đợt 1** | `feat/screen-system-p1` → `main` | Registry 7 màn T, `items.js`, bộ trộn `mixer.js` + test M1–M9, tách 6 màn T giữ nguyên layout Cowdi + `PetStage`, màn mới **T-08 Viết câu**, T-03 → mẹo pet + `GrammarSheet`, `ScreenHost` / `RouteHeader` / `ScreenIntro` / `useScreenEvents`, cờ `screenSystemV1`, đồng bộ `lessonMixLog` & `lastMix` | Đã gộp `main` (`aed7af9`) 2026-11-27 | `[x]` |
| **Đợt 2** | `feat/screen-system-p2` → `main` | Migration 4 bảng cấu hình (`RK-005` MySQL 5.6+), API `GET /api/screens/config` (ETag/304) + 7 API `/api/admin/screens*`, `ScreenConfigProvider`, trang `/admin/screens` (6 tab: Danh mục, Ma trận, Trộn thử + 1.000 lần, Xem trước sandbox, Tài khoản thử, Nhật ký), test A1–A8 + fix mẹo ngữ pháp T-08 | Đã gộp `main` (`1e0fffc`) 2026-11-27 | `[x]` |
| **Đợt 3** | `feat/screen-system-p3` → `main` | Khung `friendly/`, 5 màn F đầu (**F-01, F-03, F-08, F-09, F-06** ở trạng thái `test`), màn **Mở ải**, bảng `screen_intro` + luật không lặp 10 ải + 156 câu dẫn nháp (`BD/TG/VS`) + tab admin Kho dẫn nhập, **Khách quen**, **4 chấm kỹ năng `skillsHit`**, **Sao ★ + Sữa theo sao** (`shared/lesson-stars.js`, Q13), màn **Tổng kết mới**, `story` cho 12 bài `int-u1..u3`, zero-scroll 360×640 + `ScreenActionModal` | Đã gộp `main` (`eaaa812`) 2026-11-28 | `[x]` |
| **Đợt 4a** | `feat/screen-system-p4a` → `main` | Thống kê màn ẩn danh (`screen_stat_daily`, `POST /api/screen-stats`, tab admin Thống kê) + kịch bản tên màn theo vùng (`shared/screen-scenarios.js`) + 3 màn F (**F-02, F-04, F-05** ở trạng thái `test`) + 36 câu dẫn `draft` | Đã gộp `main` (`3002163`) 2026-11-28 | `[x]` |
| **Đợt 4b** | `feat/screen-system-p4b` → `main` | Trường dữ liệu mới (`vocabulary[].plural/countable`, `dialogPrompts[]`, `trueFalse[]`) + validator Q8 + `STD-LESSON-CONTENT v1.1` + dữ liệu mẫu 12 bài `int-u1..u3` + 3 màn F (**F-07, F-10, F-11** trạng thái `test`) + 36 câu dẫn `draft` | Hoàn tất & gộp `main` 2026-11-28 · đóng gói `deploy.zip` cho Sonny test server | `[x]` |
| **Đợt 4c** | `feat/screen-system-p4c` | Gỡ code tab cũ khỏi `LessonDetailPage.jsx`, gỡ cờ `screenSystemV1` | Bật cho mọi người ≥ 2 tuần, không lỗi P0/P1 | `[ ]` |

---

## 1. Kế hoạch Chi tiết Đợt 1 (`feat/screen-system-p1`) — Sẵn sàng thực hiện sau khi PO duyệt

> Đặc tả chi tiết: [GEMINI-SCREEN-SYSTEM-PHASE1.md](screen-system/GEMINI-SCREEN-SYSTEM-PHASE1.md)

### 1.1 Việc làm theo thứ tự
- [x] **1.0 — Tiền điều kiện A1–A3 & Báo cáo phủ dữ liệu** — 2026-11-27
  - Đã sửa `src/utils/speech.js` (fix `split(' ')` chuỗi rỗng, bổ sung `expandContractions` + `scoreTypedSentence`), xoá 4 hàm trùng trong `LessonDetailPage.jsx`, viết `src/utils/speech.test.js` (4 tests PASS), viết `scripts/report-screen-coverage.mjs` và xuất `docs/06-verification-validation/RPT-SCREEN-COVERAGE-2026-11-27.md` (`209` bài áp dụng; `T-01..T-07`: 100%, `T-08`: 175/209 = 84%, `34/209` bài chạy 5 màn).
- [x] **1.1 — Lõi Registry, Items & Bộ trộn thuần JS** — 2026-11-27
  - Tạo `src/data/config/screens.js`, `src/features/lesson/screens/{seededRandom,items,catalog,mixer,registry}.js` và `mixer.test.mjs` (**M1–M9 PASS**).
- [x] **1.2 — Tách 6 màn T hiện có (giữ nguyên giao diện, bỏ nút vận hành)** — 2026-11-27
  - `T01Vocab.jsx`, `T02Flashcard.jsx`, `T04Reading.jsx`, `T05Listen.jsx`, `T06Speak.jsx`, `T07Quiz.jsx`.
- [x] **1.3 — Màn mới T-08 Viết câu & T-03 → Mẹo pet + `GrammarSheet`** — 2026-11-27
  - `GrammarSheet.jsx` (native `<dialog>` + Safari light-dismiss fallback + vuốt xuống), `T08WriteSentence.jsx` (Xếp câu + 2 nhiễu & Gõ câu, mẹo pet, vùng phản hồi 64px).
- [x] **1.4 — `ScreenHost`, `RouteHeader`, `ScreenIntro`, `useScreenEvents` & Cờ bật/tắt** — 2026-11-27
  - `RouteHeader.jsx`, `ScreenIntro.jsx`, `screenEvents.js`, `ScreenHost.jsx`, `screens.css`, bổ sung 24 câu `screen_intro` (4/slot) vào `common.js` + `PetDirector.js`/`lineSelector.js`, gắn cờ `screenSystemV1` vào `LessonDetailPage.jsx` & nút chạm logo 5 lần trong `AccountPage.jsx`.
- [x] **1.5 — Đồng bộ `lessonMixLog` & `lastMix` lên Server (chuẩn `RK-005`)** — 2026-11-27
  - `server/db/migrate-screen-system-p1.sql` + `scripts/run-screen-system-p1-migration.js`, `server/routes/api.js`, `src/hooks/useUser.jsx`.
- [x] **1.6 — Kiểm chứng tự động (`npm test` + `npm run build`)** — 2026-11-27
  - `npm test`: **237/237 PASS** · `npm run build`: **PASS** (`✓ built in 2.41s`). Chờ UAT thiết bị thật 360×640 & 800×1280 và duyệt merge của Sonny.

---

## 2. Tóm tắt File & Migration các Đợt 2–4

### Đợt 2 (`feat/screen-system-p2`) — [Chi tiết](screen-system/GEMINI-SCREEN-SYSTEM-PHASE2.md)
- **Migration DB (`RK-005`)**: `server/db/migrate-screen-system-p2.sql` + `scripts/run-screen-system-p2-migration.js` tạo 4 bảng `screen_config`, `screen_weights`, `screen_testers`, `screen_config_log` + seed 19 mã (8 T + 11 F `todo`) & 3 nhóm trọng số.
- **Backend**: `server/routes/screens.js` (`GET /api/screens/config` ETag/304) + `server/routes/screensAdmin.js` (`requireAuth + requireAdmin`, 7 endpoint ghi giao dịch + log).
- **Frontend**: `ScreenConfigProvider` (cache `localStorage`, fallback `SCREEN_CONFIG` tĩnh), route `<RequireAdmin>` `/admin/screens` với 6 tab + test A1–A8.

### Đợt 3 (`feat/screen-system-p3` → `main` `eaaa812`) — [Chi tiết](screen-system/GEMINI-SCREEN-SYSTEM-PHASE3.md) · [Bổ sung & Đính chính](screen-system/GEMINI-PHASE3-ADDENDUM.md)
- **Đã hoàn tất & gộp `main` (`eaaa812`, 2026-11-28)**:
  - **Story Bible & Assets**: nhập nguyên vẹn `shared/regions.js` (kèm `REGION_COLOR`, `BOSS_TINT`, `REGION_BRIEF`), `shared/human-cast.js` (`HUMAN_CAST`, `isValidNpc`), `public/image/boss/fog.svg` + `shared/regions.test.js` (kiểm khớp `units.json` & luật `BD`).
  - **Sao ★ 1–3 & Sữa theo sao (Q13)**: `shared/lesson-stars.js` + `lesson-stars.test.js` (S1–S5), cập nhật `LessonDetailPage.jsx`, `src/data/path.js`, `useUser.jsx`, `server/routes/api.js` (gộp MAX `lessonStars`/`lessonStarPaid`), hiển thị 1–3 sao dưới node đã xong ở `LearningPathPage.jsx`.
  - **Khách quen & 4 chấm `skillsHit`**: `src/features/vocab/wordProgress.js` + `wordProgress.test.js` (P7), `src/features/lesson/screens/guestWords.js`, `screenEvents.js`.
  - **Khung & 5 màn Thân thiện (trạng thái khởi tạo `'test'`)**: `friendly/{friendly.css,friendlyLogic.js,useItemQueue.js,f08Logic.js,FriendlyFrame.jsx,PetLine.jsx,WordSkillDots.jsx,FogBossSvg.jsx,F01Slideshow.jsx,F03CatchWord.jsx,F08MemoryPairs.jsx,F09BoatSentence.jsx,F06FogBoss.jsx}` + Web Audio SFX trong `useSound.jsx`. Đổi tên `F-03` thành **Nghe nhận diện từ** (28/11), áp dụng CSS Container Queries (`@container screen-stage`) để zero-scroll trên 360×640, và chuẩn hoá popup xác nhận/phản hồi bằng `ScreenActionModal.jsx` (native `<dialog>`). Coverage nhóm Trung bình: **5/5 màn F = 39/39 bài (100%)**.
  - **Mở ải, Tổng kết mới & Kho dẫn nhập**: `StageIntro.jsx`, `StageSummary.jsx`, `introSelector.js`, `ScreenHost.jsx`, `server/db/{migrate-screen-system-p3.sql,seed-screen-intros-p3.js,seed-screen-intros-p3.sql}` (156 câu `draft`, ≤ 25 chữ), `scripts/run-screen-system-p3-migration.js`, API `GET /api/screen-intros` (ETag/304) + 4 API admin, tab admin **Kho dẫn nhập** (`IntrosTab.jsx`), thêm `story: { npc, introVi }` cho 12 bài `int-u1..u3` + `schema.js`.
  - **Kiểm chứng**: `server/tests/screen-system-p3.test.mjs` (P1–P10), `npm test` **259/259 PASS**, `npm run build` xanh.

### Đợt 4 (`p4a`, `p4b`, `p4c`) — [Chi tiết](screen-system/GEMINI-SCREEN-SYSTEM-PHASE4.md)
- **4a (`feat/screen-system-p4a` → `main` `1cbc9fb`, 2026-11-28)**:
  - **Kịch bản tên màn theo vùng**: `shared/screen-scenarios.js` (`getScreenTitle(code, region, fallback)`), áp dụng đồng bộ trên `ScreenHost`, `RouteHeader`, `StageIntro`, `ScreenIntro`, `catalog.js`, `PreviewTab`, và toàn bộ 8 màn F (`F-01..F-06, F-08, F-09`).
  - **Thống kê ẩn danh (`screen_stat_daily`)**: `server/db/migrate-screen-system-p4a.sql` + `scripts/run-screen-system-p4a-migration.js` (RK-005, **không có `user_id`**), `POST /api/screen-stats` (bỏ qua khi `sandbox = true`), `GET /api/admin/screen-stats?days=7|30&group=`, Tab 8 **"Thống kê"** (`src/admin/screens/StatsTab.jsx`, ngưỡng cảnh báo ≥ 30 lượt, so sánh Thân thiện vs Tập trung theo slot).
  - **3 màn Thân thiện mới (khởi tạo `'test'`, 0 cuộn ở 360×640)**:
    - `F-02` (`F02SpellWord.jsx` + `f02Logic.js`, slot `write`, độ phủ **192/209 = 92%**, Trung bình **38/39 = 97%**).
    - `F-04` (`F04SpeakBridge.jsx` + `f04Logic.js`, slot `speak`, độ phủ **209/209 = 100%**): đọc mẫu → đếm 3-2-1 → **thử tự mở mic**, **chỉ hiện nút mic khi trình duyệt chặn**; nhóm Mới học không chấm (nói mic hoặc `"Con đã nói"` đều qua); không mic/từ chối mic không ghi `skillsHit.speak` (Q3).
    - `F-05` (`F05FogReading.jsx` + `f05Logic.js`, slot `read`, độ phủ **187/209 = 89%**, Trung bình **39/39 = 100%**): hỗ trợ cụm nhiều từ dài nhất trước, chỉ cuộn trong thẻ đoạn văn `.ff-f05-passage`, xong săn hiện bản dịch + 2 câu hỏi hiểu bài.
  - **36 câu dẫn `draft`**: `server/db/seed-screen-intros-p4a.{js,sql}` (`F-02, F-04, F-05` × `BD, TG, VS` × 4 câu, ≤ 25 chữ).
  - **Checklist UAT thiết bị thật (cần ghi kết quả trước khi bật `F-04` sang `'on'`)**:
    - [ ] **iPhone Safari thật** (iOS): sau đếm `3-2-1`, xác nhận tự mở mic hoặc hiện nút *"Chạm để bật Mic"* ngay khi iOS chặn gesture; từ chối mic chuyển sang *"Nghe và nhắc lại"* và qua màn trơn tru.
    - [ ] **Android Chrome thật**: sau đếm `3-2-1`, xác nhận mic tự mở mượt mà không hiện nút mic thừa; nhóm Mới học bấm mic hoặc *"Con đã nói"* đều qua; kiểm tra bố cục `360×640` không cuộn trang trên `F-02`, `F-04`, `F-05`.
- **4b (`feat/screen-system-p4b` → `main` `285ba12`, 2026-11-28)**:
  - Mở rộng `src/data/lessons/schema.js` + `scripts/validate-lessons.mjs` (kiểm `imageExists`) + `STD-LESSON-CONTENT` v1.1 (`vocabulary[].plural/countable`, `dialogPrompts[]`, `trueFalse[]`).
  - Bổ sung dữ liệu mẫu cho trọn bộ **12 bài `int-u1..u3`**: `plural`/`countable` (6 bài có ≥ 8 danh từ đếm được), `dialogPrompts[]` (12/12 bài), `trueFalse[]` (12/12 bài, dùng ảnh `/image/art/...webp` có sẵn + `sceneBrief` cho phần chưa có tranh).
  - 3 màn Thân thiện cuối (khởi tạo `'test'`, zero-scroll `360×640`): **F-07** (`F07MarketListen.jsx` + `f07Logic.js`, Q4), **F-10** (`F10NpcDialog.jsx` + `f10Logic.js`, chấm tất định không AI, Q3/Q5), **F-11** (`F11TrueFalse.jsx` + `f11Logic.js`, vuốt/chạm Đúng-Sai, Q6).
  - 36 câu dẫn `draft` (`seed-screen-intros-p4b.{js,sql}`) + runner gộp Đợt 4 `scripts/run-screen-system-p4b-migration.js` + bộ kiểm thử `server/tests/screen-system-p4b.test.mjs` (Q4–Q6, Q8). Toàn bộ kiểm thử: **269/269 PASS**, đã đóng gói `deploy.zip`.
- **4c (giữ lại theo chuẩn §4)**: Gỡ code tab cũ trong `LessonDetailPage.jsx` và gỡ cờ `screenSystemV1` **sau khi bật cho mọi người chạy ổn định ≥ 2 tuần**.

---

## 3. Hạng mục mở sau khi lên server (`cowdi.net`)

1. **UAT thiết bị thật sau deploy**: kiểm tra `F-04` & `F-10` (auto-open mic sau `3-2-1` + nút mic dự phòng khi bị chặn) trên **iPhone Safari** & **Android Chrome** thật, ghi kết quả vào mục Checklist §2 trước khi chuyển trạng thái từ `'test'` sang `'on'`.
2. **Duyệt 228 câu dẫn `draft`** trong `/admin/screens` → Tab **Kho dẫn nhập** (`156` Đợt 3 + `72` Đợt 4) và theo dõi Tab **Thống kê** (ngưỡng ≥ 30 lượt).
3. **Bổ sung ảnh minh hoạ theo `sceneBrief`** cho các thẻ `trueFalse[]` của `int-u1..u3` chưa có ảnh vẽ riêng (hiện dùng ảnh `/image/art/` sẵn có hoặc emoji).
4. **Hạng mục dài hạn**: quyết định chuyển nhóm Mới học (`PictureLesson`) sang hệ thống màn, và mở Đợt 4c dọn code tab cũ sau ≥ 2 tuần vận hành ổn định.
5. **Kịch bản Dẫn nhập Mùa 2 (`int-u1 → int-u3`)**: đã tiếp nhận gói `Cowdi-Story-Mua2-U1-U3.zip`, xem kế hoạch triển khai riêng tại [TASK-STORY-INTRO-S2.md](TASK-STORY-INTRO-S2.md) và danh sách ảnh cần làm tại [CHK-STORY-S2-IMAGES.md](art/CHK-STORY-S2-IMAGES.md).
