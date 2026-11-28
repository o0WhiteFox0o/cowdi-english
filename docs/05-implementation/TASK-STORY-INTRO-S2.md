# TASK-STORY-INTRO-S2 — Kế hoạch Triển khai Kịch bản Dẫn nhập Mùa 2 (`int-u1 → int-u3`)

> **Ngày lập:** 2026-11-28 · **Nhánh triển khai:** `feat/story-intro-s2` (tách từ `main`)  
> **Tài liệu gốc:** [KICH-BAN-DAN-NHAP-MUA2-U1-U3-v1.0.md](../04-design/KICH-BAN-DAN-NHAP-MUA2-U1-U3-v1.0.md) · [GEMINI-STORY-INTRO-S2.md](screen-system/GEMINI-STORY-INTRO-S2.md)  
> **Danh sách ảnh cho nhân sự:** [CHK-STORY-S2-IMAGES.md](art/CHK-STORY-S2-IMAGES.md)  
> **Trạng thái:** ✅ **Hoàn tất Bước 0–5 (2026-11-28)** · `npm test` **275/275 PASS** (`S1–S7` + toàn hệ thống) · `npm run build` xanh. Chờ Sonny UAT máy thật & duyệt gộp/commit.

---

## 0. Kết quả Khảo sát Bước 0 (đã kiểm chứng trên mã nguồn hiện tại)

### 0.1. Dữ liệu & Ảnh Pet C4/C5
- Gói `Cowdi-Story-Mua2-U1-U3.zip` gồm 12 bài × 6 slot = **72 câu dẫn nhập riêng**, 0 câu trùng, 3 tập (`int-u1` Bến Đò Ông Tư, `int-u2` Tháp Gió, `int-u3` Vườn Sữa), 3 Boss C5 (`flippy`/`pingu`, `owlbert`/`mimi`, `bamboo_spirit`/`bamboo`).
- **Ảnh Pet C4/C5**: Đã kiểm tra thực tế trên ổ đĩa — **16/16 ảnh** (8 loài × C4/C5) đều đã tồn tại trong `public/assets/images/pets/`.
- **Ảnh còn thiếu** (không chặn code vì có fallback, nhưng cần nhân sự mỹ thuật làm để hiển thị đúng chuẩn): 6 chân dung NPC người (`public/image/npc/*.webp`) và ảnh nền 3 vùng đất (`public/image/regions/BD|TG|VS-*.webp`). Chi tiết xem [CHK-STORY-S2-IMAGES.md](art/CHK-STORY-S2-IMAGES.md).

### 0.2. Các điểm mã nguồn đang đọc `lesson.story` & `ScreenIntro`
| File | Vai trò hiện tại | Cần đổi ở PR này |
|---|---|---|
| `src/features/lesson/screens/StageIntro.jsx` | Đọc `lesson.story.npc` & `lesson.story.introVi`; gọi `PET_REGISTRY[npcId].evolutions[0]` (đang lấy C1!) và ảnh nền `/image/regions/${region}-${variant.id}.webp` | Chuyển sang `getStoryPetImage()` (C4/C5), ưu tiên `SEASON2_LESSONS[lesson.id].introVi` + `introEn`, thêm thẻ **Tới vùng (`arrival` / `homecoming`)** ở bài đầu unit |
| `src/features/lesson/screens/ScreenHost.jsx` | Gọi `selectScreenIntro()` theo `screenCode × region`, truyền `petLine` xuống `ScreenIntro`, truyền `extra` xuống `F06FogBoss` | Dùng `getSlotIntro(lesson, slot, region)` (ưu tiên `lessonSlotIntro` → `screen_intro` → fallback), truyền `introEn`, `boss` (`unitBoss`), `bossFogLevel`, `landmark`, `afterVi` |
| `src/features/lesson/screens/ScreenIntro.jsx` | Chỉ hiển thị `petLine` (tiếng Việt), chưa có loa đọc và dòng `en` nhỏ | Hiện `vi` (kèm loa đọc TTS) + dòng nhỏ `en` bên dưới, giữ 0 cuộn `360×640` |
| `src/features/lesson/screens/friendly/F06FogBoss.jsx` | Hiển thị `<FogBossSvg>` chung theo màu vùng, lời thoại cố định | Thay bằng ảnh **Boss C5** (`unitBoss(unit, companionId)`) + lớp phủ `public/image/boss/fog.svg` với `opacity = bossFogLevel(...)`; dùng bộ thoại `enter / hit[] / wrong[] / retreat / fail` (không đổi tính sao/Sữa/HP) |
| `src/features/lesson/screens/RouteHeader.jsx` & `StageSummary.jsx` | Hiện tên bài, 6 chấm slot, kết quả sao/Sữa | Hiện tên điểm mốc `landmarks[lesson.landmark]`; qua bài hiện `afterVi` |
| `src/data/lessons/general/family.js` | `story.npc` đang là `'minh'` | Đổi `story.npc` thành `'lan'` khớp đoạn đọc |
| Checkpoint unit (kiểm tra cuối unit) | Hiện tổng kết khi qua checkpoint | Khi qua checkpoint `int-u1..u3` lần đầu: hiện màn kết tập (Boss C5 không sương + `freed` vi/en → `clueVi` → `epilogue`), ghi cờ `story_seen` cục bộ (không tạo bảng DB mới) |

---

## 1. Kế hoạch thực hiện chi tiết (`feat/story-intro-s2`)

| Bước | Nội dung | File tạo mới / chỉnh sửa | Trạng thái |
|---|---|---|---|
| **Bước 0** | Tạo nhánh `feat/story-intro-s2` từ `main`; chép `shared/story-season2.js` vào repo; chạy kiểm tra `SEASON2_LESSONS` = 12 bài và `check-story.mjs` = 0 lỗi | `shared/story-season2.js` | `[x]` |
| **Bước 1** | **Câu dẫn từng màn & Mở ải**: tạo `src/features/lesson/screens/intro.js` (`getSlotIntro(lesson, slot, region)` lấy theo `slot` kỹ năng); cập nhật `ScreenHost.jsx`, `ScreenIntro.jsx` (hiện `vi` có loa + dòng `en` nhỏ, 0 cuộn), `StageIntro.jsx` (dùng `introVi`/`introEn`), đổi `family.js` (`story.npc = 'lan'`) | `src/features/lesson/screens/intro.js`, `ScreenHost.jsx`, `ScreenIntro.jsx`, `StageIntro.jsx`, `src/data/lessons/general/family.js` | `[x]` |
| **Bước 2** | **Luật hình Pet C4/C5**: tạo `src/features/lesson/story/petImage.js` (`getStoryPetImage(petId, { companionId, companionC })`); kiểm tra toàn bộ điểm hiển thị pet không phải pet đồng hành trong Mở ải / Tới vùng / Kết tập đều đi qua hàm này (không dùng `evolutions[0..2]`) | `src/features/lesson/story/petImage.js`, `StageIntro.jsx`, `ScreenHost.jsx` | `[x]` |
| **Bước 3** | **Boss Màn 6 là Pet C5 + Màn kết tập Checkpoint**: nâng cấp `F06FogBoss.jsx` (ảnh Boss C5 + `fog.svg` theo `bossFogLevel`, thoại `enter/hit/wrong/retreat/fail`, đổi `alt` nếu trùng pet đồng hành); gắn màn kết tập sau khi qua kiểm tra unit (`freed` → `clueVi` → `epilogue`, lưu cờ `story_seen` cục bộ, không sửa DB) | `src/features/lesson/screens/friendly/F06FogBoss.jsx`, `src/features/lesson/story/UnitStoryEpilogue.jsx`, `src/pages/LearningPathPage.jsx` | `[x]` |
| **Bước 4** | **Tới vùng & Điểm mốc**: bài đầu tiên của unit hiện thẻ **Tới vùng** (`arrival` hoặc `homecoming` nếu trùng `homecoming.by`, pet C4) trước Mở ải; `RouteHeader.jsx` / `StageSummary.jsx` hiện tên điểm mốc `landmarks[lesson.landmark]` và `afterVi` khi qua bài | `StageIntro.jsx`, `RouteHeader.jsx`, `StageSummary.jsx`, `ScreenHost.jsx` | `[x]` |
| **Bước 5** | **Kiểm thử tự động & Kiểm chứng UI**: viết test `S1–S7` (`shared/story-season2.test.js`), chạy toàn bộ `npm test` (275/275 PASS gồm S1–S7 + `lesson-stars`, `regions`, `mixer`) và `npm run build` xanh | `shared/story-season2.test.js` | `[x]` |

---

## 2. Phạm vi KHÔNG làm (theo đặc tả)
- Không viết lại đoạn đọc, từ vựng, đáp án của 12 bài.
- Không đổi trạng thái 11 màn `F` khỏi `'test'`.
- Không tạo bảng DB mới (cờ `story_seen` lưu trong progress/localStorage hiện có).
- Không viết thoại cho `int-u4..u10` (chờ Sonny duyệt và thử nghiệm 3 tập đầu).
- Không thêm câu pet buồn/ốm/đếm ngược/nhắc Gem; giữ nguyên `ScreenActionModal` (bỏ mục P0.1 theo chỉ đạo mới của Sonny).

---

## 3. Rủi ro & Điểm cần lưu ý
1. **Migration DB**: Không cần migration DB mới.
2. **Checkpoint unit**: Cần kiểm tra chính xác luồng hoàn thành checkpoint hiện có trong `LearningPathPage.jsx` / `LessonDetailPage.jsx` trước khi gắn `UnitStoryEpilogue` để không làm gián đoạn cộng Gem/mở khoá unit.
3. **Ảnh thiếu**: Code vẫn chạy mượt ngay lập tức nhờ fallback màu vùng (`REGION_COLOR`) và avatar chữ/icon cho NPC người; khi nhân sự bàn giao ảnh theo [CHK-STORY-S2-IMAGES.md](art/CHK-STORY-S2-IMAGES.md) và chép đúng đường dẫn thì app sẽ tự hiển thị ảnh thật mà không cần sửa code.
