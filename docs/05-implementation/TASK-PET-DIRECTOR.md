# TASK-PET-DIRECTOR — Kế hoạch & Checklist triển khai Pet Director V2 (Giai đoạn 1–2)

> **Ngày cập nhật:** 2026-11-26 · **Trạng thái:** ✅ Đã hoàn thành toàn bộ GĐ 1–2 (Gói A–E + Tinh chỉnh bố cục V2 trên `feat/pet-director`) · **Kiểm thử:** `170/170 PASS` · `npm run build` PASS
> **Tài liệu gốc:** [SDD-PET-DIRECTOR-v1.1.md](../04-design/SDD-PET-DIRECTOR-v1.1.md) · [RPT-PET-DIRECTOR-SURVEY.md](RPT-PET-DIRECTOR-SURVEY.md) · [PET-MOTION.md](../PET-MOTION.md)

---

## Tổng quan kết quả triển khai (`feat/pet-director`)

| Giai đoạn | Gói | Commit | Nội dung chính | Trạng thái |
|---|---|---|---|---|
| **Bước 0** | Khảo sát & Thiết kế | `edccdaf` | `SDD-PET-DIRECTOR-v1.1`, `RPT-PET-DIRECTOR-SURVEY`, `TASK-PET-DIRECTOR`, lưu mockups & đồng bộ tài liệu sống | ✅ Done |
| **GĐ 1** | **Gói A** | `6774126` | Lõi `PetDirector` thuần JS (`rules.js`, `storage.js`, `lineSelector.js`, `PetDirector.js`, `common.js`, `index.js`) + `lines.test.mjs` & `pet-director.test.mjs` + gắn vào `npm test` | ✅ Done |
| **GĐ 1** | **Gói B** | `f7df4d7` | Mở rộng `PetRig.js` & `PetAvatar.jsx` (`canvasBubble`, chuẩn hoá `tap` cho cả rig duyệt home/lesson & ảnh tĩnh fallback, sửa câu `'Nhớ bạn quá!'`) + 2 test trong `pet-rig.test.mjs` | ✅ Done |
| **GĐ 1** | **Gói C** | `c93e950` | `DirectorContext`, `<PetSpeech>`, `<PetThought>`, `<PetStage>`, `tts.js`, `pet-director.css`; tích hợp `App.jsx`, `LessonDetailPage`, `PictureLesson`, `PracticePage`, `LearningPathPage` (`app_open`); gỡ `CowdiChat` & xoá `.cowdi-chat-*` ở 3 file CSS | ✅ Done |
| **GĐ 2** | **Gói E** | `7b25f65` | Kho câu thoại đầy đủ `cowdi.js` (240+ câu đạt §5.2, kế thừa `PAGE_TIPS`) + trung tính hoá `common.js` (bỏ `"Moo~"`) + mở rộng `lines.test.mjs` | ✅ Done |
| **GĐ 2** | **Gói D** | `ee49eba` | `<PathPet>` + `<PathPetCard>` trên `LearningPathPage`; chuyển `HomePage`, `PetPage`, `DuelPage` (luôn Tầng 1) sang Director; công tắc preview `🎬 Director` trong `StudyPreviewTab.jsx`; xoá `CowdiChat.jsx` (cả re-export), `chatMessages`, `getPetMessage` | ✅ Done |
| **UI Polish** | **Bố cục V2** | `ae761cb`, `5278843` | Đưa Header + Stepper lên trên cùng; `<PetStage>` dạng cột đồng hành `sticky` cạnh nội dung học trên desktop & xếp dọc chuẩn V2 trên mobile; cân giữa cụm `[Cowdi + Thẻ học]` (`.pd-lesson-layout--centered` / `--flashcard`); đưa `.lesson-step-footer` full-width; xoá banner thừa `"Nói theo Cowdi!"` | ✅ Done |

---

## Quyết định đã chốt trong quá trình triển khai

1. **Bố cục `<PetStage>` & Zero-Scroll Quiz:** Desktop dùng cột đồng hành `sticky` `236–244px` (`min-height: 224px`), căn giữa cụm cho màn thẻ đơn (`890px` / Flashcard `780px`), footer full-width; Mobile xếp dọc (`144px` bình thường / `112px` `compact` trong Quiz).
2. **Chiến lược nhánh Git:** Gom 1 nhánh `feat/pet-director` với các commit tách bạch theo từng gói.
3. **Preview trong `/admin/pet-motion?view=preview`:** Đã tích hợp công tắc **`🎬 Director: Bật/Tắt`** trực tiếp trong `StudyPreviewTab.jsx`.

---

## Checklist chi tiết (đã hoàn thành 100%)

### Gói A — Lõi `PetDirector` thuần JS
- [x] Chép `starter/` (`rules.js`, `common.js`, `lines.test.mjs`), không đổi giá trị trong `rules.js` — `6774126`
- [x] Viết `src/data/pet-lines/index.js`, `storage.js`, `lineSelector.js`, `PetDirector.js` (kèm giữ chỗ `beginConversation()` cho GĐ3) — `6774126`
- [x] Viết `src/pet-director/pet-director.test.mjs` phủ đủ §10.3 & thêm vào `package.json` `npm test` — `6774126`

### Gói B — Mở rộng `PetRig` & `PetAvatar` (Tận dụng tối đa Pet-motion)
- [x] Thêm option/prop `canvasBubble` (mặc định `true`), chuẩn hoá `onClip('tap')` cho cả rig (home/lesson) lẫn fallback `<img>`, đổi `'Nhớ bạn quá!'` → `'Mừng bạn quay lại!'` — `f7df4d7`
- [x] Thêm 2 unit test vào `src/pet-rig/pet-rig.test.mjs`; giữ nguyên `shared/pet-motion.js` — `f7df4d7`

### Gói C — Provider, `<PetStage>` & gỡ `CowdiChat`
- [x] Viết `tts.js`, `DirectorContext.jsx`, `PetSpeech.jsx`, `PetThought.jsx`, `PetStage.jsx`, `pet-director.css` — `c93e950`
- [x] Tích hợp `App.jsx` (gỡ `<CowdiChat />`), `LessonDetailPage.jsx`, `PictureLesson.jsx`, `PracticePage.jsx`, `LearningPathPage.jsx` — `c93e950`
- [x] Dọn sạch `.cowdi-chat-*` trên cả 3 file CSS (`book.css`, `components.css`, `pet.css`) — `c93e950`

### Gói E — Kho câu thoại đầy đủ Cowdi
- [x] Viết `src/data/pet-lines/cowdi.js` (240+ câu đạt toàn bộ chỉ tiêu §5.2, kế thừa `PAGE_TIPS`) — `7b25f65`
- [x] Trung tính hoá `common.js`, đăng ký `cowdi.js` trong `index.js`, mở rộng `lines.test.mjs` — `7b25f65`

### Gói D — `<PathPet>`, hoàn thiện màn còn lại & dọn mã cũ
- [x] Viết `src/pet-director/PathPet.jsx` (`<PathPet>` + `<PathPetCard>`) và tích hợp `LearningPathPage.jsx` — `ee49eba`
- [x] Chuyển `HomePage.jsx`, `PetPage.jsx`, `DuelPage.jsx` (luôn Tầng 1) sang Director — `ee49eba`
- [x] Thêm công tắc xem thử **`🎬 Director`** trong `src/admin/pet-motion/StudyPreviewTab.jsx` — `ee49eba`
- [x] Xoá `src/components/layout/CowdiChat.jsx`, `src/components/CowdiChat.jsx`, re-export ở `components/layout/index.js`, `chatMessages` & `getPetMessage` trong `src/data/pets.js` — `ee49eba`

### Tinh chỉnh UI V2 sau kiểm thử thực tế trên Local
- [x] Chuyển `<PetStage>` sang bố cục đồng hành chuẩn V2 (Header + Stepper trên cùng, Cowdi sticky cạnh bài trên desktop / xếp dọc trên mobile), xoá banner thừa `"Nói theo Cowdi!"` — `ae761cb`
- [x] Cân bằng toàn bộ màn hình: đưa `.lesson-step-footer` full-width, căn giữa cụm `[Cowdi + Thẻ học]` cho Flashcard / Nghe / Nói / Quiz / Practice, thu gọn chiều cao thẻ Cowdi desktop (`min-height: 224px`) — `5278843`

### Nghiệm thu tự động
- [x] `npm test`: **170 / 170 PASS** (22 suites)
- [x] `npm run build`: **PASS** (`prebuild`: 221 bài / 54 unit / 0 lỗi)
- [x] Kiểm toán P2, P3, P7: `0` `position: fixed` của pet trên bài học, `0` từ cấm P3 trong kho thoại & mã pet, `0` `Ref.current?.emit(...)` trực tiếp từ trang, `shared/pet-motion.js` nguyên vẹn
