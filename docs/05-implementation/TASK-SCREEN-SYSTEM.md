# TASK-SCREEN-SYSTEM — Kế hoạch & Checklist Triển khai Hệ thống Màn học (4 Đợt · WS-11)

> **Ngày lập:** 2026-11-27 · **Chuẩn gốc:** [STD-SCREEN-SYSTEM-v1.0.md](../04-design/STD-SCREEN-SYSTEM-v1.0.md)  
> **Khảo sát Bước 0:** [RPT-SCREEN-SYSTEM-SURVEY.md](RPT-SCREEN-SYSTEM-SURVEY.md) · **Gói giao việc:** [screen-system/README.md](screen-system/README.md)  
> **Trạng thái hiện tại:** 🟡 **Đợt 1 (`aed7af9`) & Đợt 2 (`1e0fffc`) đã gộp `main`** · **Đợt 3 (`feat/screen-system-p3`) đã hoàn tất code + test S1–S5 & P1–P10 (`259/259` PASS) + `npm run build` xanh** — chờ Sonny duyệt & UAT (5 màn F khởi tạo `'test'`, 156 câu dẫn khởi tạo `'draft'`).

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
| **Đợt 3** | `feat/screen-system-p3` | Khung `friendly/`, 5 màn F đầu (**F-01, F-03, F-08, F-09, F-06** ở trạng thái `test`), màn **Mở ải**, bảng `screen_intro` + luật không lặp 10 ải + 156 câu dẫn nháp (`BD/TG/VS`) + tab admin Kho dẫn nhập, **Khách quen**, **4 chấm kỹ năng `skillsHit`**, **Sao ★ + Sữa theo sao** (`shared/lesson-stars.js`, Q13), màn **Tổng kết mới**, `story` cho 12 bài `int-u1..u3` | Đã hoàn tất trên nhánh `feat/screen-system-p3` theo `GEMINI-PHASE3-ADDENDUM.md` — chờ Sonny UAT & duyệt merge | `[x]` |
| **Đợt 4a** | `feat/screen-system-p4a` | Thống kê màn (`screen_stat_daily`, `POST /api/screen-stats`, tab admin Thống kê) + 3 màn F (**F-02, F-04, F-05**) + câu dẫn nháp | Phụ thuộc thử nghiệm Đợt 3 ≥ 1 tuần | `[ ]` |
| **Đợt 4b** | `feat/screen-system-p4b` | Trường dữ liệu mới (`vocabulary[].plural/countable`, `dialogPrompts[]`, `trueFalse[]`) + validator + nội dung mẫu `int-u1..u3` + 3 màn F (**F-07, F-10, F-11**) | Phụ thuộc PO duyệt nội dung & ảnh theo `sceneBrief` | `[ ]` |
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

### Đợt 3 (`feat/screen-system-p3`) — [Chi tiết](screen-system/GEMINI-SCREEN-SYSTEM-PHASE3.md) · [Bổ sung & Đính chính](screen-system/GEMINI-PHASE3-ADDENDUM.md)
- **Đã hoàn tất 2026-11-27 trên nhánh `feat/screen-system-p3`** (chưa gộp `main`, chờ Sonny duyệt & UAT):
  - **Story Bible & Assets**: nhập nguyên vẹn `shared/regions.js` (kèm `REGION_COLOR`, `BOSS_TINT`, `REGION_BRIEF`), `shared/human-cast.js` (`HUMAN_CAST`, `isValidNpc`), `public/image/boss/fog.svg` + `shared/regions.test.js` (kiểm khớp `units.json` & luật `BD`).
  - **Sao ★ 1–3 & Sữa theo sao (Q13)**: `shared/lesson-stars.js` + `lesson-stars.test.js` (S1–S5), cập nhật `LessonDetailPage.jsx`, `src/data/path.js`, `useUser.jsx`, `server/routes/api.js` (gộp MAX `lessonStars`/`lessonStarPaid`), hiển thị 1–3 sao dưới node đã xong ở `LearningPathPage.jsx`.
  - **Khách quen & 4 chấm `skillsHit`**: `src/features/vocab/wordProgress.js` + `wordProgress.test.js` (P7), `src/features/lesson/screens/guestWords.js`, `screenEvents.js`.
  - **Khung & 5 màn Thân thiện (trạng thái khởi tạo `'test'`)**: `friendly/{friendly.css,friendlyLogic.js,useItemQueue.js,f08Logic.js,FriendlyFrame.jsx,PetLine.jsx,WordSkillDots.jsx,FogBossSvg.jsx,F01Slideshow.jsx,F03CatchWord.jsx,F08MemoryPairs.jsx,F09BoatSentence.jsx,F06FogBoss.jsx}` + Web Audio SFX trong `useSound.jsx`. Đổi tên `F-03` thành **Nghe nhận diện từ** (28/11), áp dụng CSS Container Queries (`@container screen-stage`) để zero-scroll trên 360×640, và chuẩn hoá popup xác nhận/phản hồi bằng `ScreenActionModal.jsx` (native `<dialog>`). Coverage nhóm Trung bình: **5/5 màn F = 39/39 bài (100%)**.
  - **Mở ải, Tổng kết mới & Kho dẫn nhập**: `StageIntro.jsx`, `StageSummary.jsx`, `introSelector.js`, `ScreenHost.jsx`, `server/db/{migrate-screen-system-p3.sql,seed-screen-intros-p3.js,seed-screen-intros-p3.sql}` (156 câu `draft`, ≤ 25 chữ), `scripts/run-screen-system-p3-migration.js`, API `GET /api/screen-intros` (ETag/304) + 4 API admin, tab admin **Kho dẫn nhập** (`IntrosTab.jsx`), thêm `story: { npc, introVi }` cho 12 bài `int-u1..u3` + `schema.js`.
  - **Kiểm chứng**: `server/tests/screen-system-p3.test.mjs` (P1–P10), `npm test` **259/259 PASS**, `npm run build` xanh.

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
