# RPT-PET-DIRECTOR-SURVEY — Báo cáo Khảo sát Mã nguồn (Pet Director V2 & Tích hợp Pet-motion)

> **Ngày khảo sát:** 2026-11-25 · **Commit cơ sở:** `20bea2d` (`main`) · **Tài liệu đối chiếu:** Gói bàn giao `cowdi-pet-director.zip` (`PET-DIRECTOR-INTEGRATION.md` v1.1, `PET-MOTION-INTEGRATION.md`) · [PET-MOTION.md](../PET-MOTION.md) · [SDD-PET-MANAGEMENT-v1.0.md](../04-design/SDD-PET-MANAGEMENT-v1.0.md)

---

## Tóm tắt nhanh

Hệ thống **Pet-motion** hiện tại trong repo đã tiến xa hơn mô tả trong `PET-MOTION-INTEGRATION.md` của gói bàn giao (đã có server API duyệt rig/clip, fallback ảnh tĩnh, emoji theo clip, `StudyPreviewTab`). Qua rà soát trực tiếp mã nguồn, phát hiện **9 điểm lệch / rủi ro tích hợp quan trọng** cần xử lý để **tận dụng tối đa hệ thống Pet-motion** và không làm hỏng các tính năng mới vừa hoàn thiện (`Zero-Scroll Quiz`, `PictureLesson`, `Bạn bè trên lộ trình`).

---

## 1. Hệ thống `Pet-motion` thật vs tài liệu `PET-MOTION-INTEGRATION.md` trong gói zip

| Khía cạnh | Tài liệu trong gói zip (bản cũ) | Mã nguồn thật (`main` @ `20bea2d`) |
|---|---|---|
| Nguồn rig & clip | Tĩnh: `public/pets/<id>/rig.json` + `shared/pet-motion-edits.js` + `/pet-editor/` | Động từ server: `GET /api/pet-motion/:petId` (cache qua `src/pet-rig/motionCache.js`), duyệt tại `/admin/pet-motion` (`server/routes/petMotionAdmin.js`, `petMotionPublic.js`) |
| Quy tắc phát clip | Phát thẳng clip từ `shared/pet-motion.js` | **Chỉ phát clip đã duyệt** (`resolveApprovedClipName` trong `src/pet-rig/PetRig.js:51-64`); pet-cấp chưa duyệt rig tự fallback sang `<img>` tĩnh (`src/pet-rig/PetAvatar.jsx:198-207`) |
| Biểu cảm theo clip | Chưa có | Đã có **`curClipObj.emoji`** (Unicode hoặc ảnh tự vẽ PNG/WebP, `PetRig.js:943-981`) dành riêng cho Trứng C1 & các clip đã duyệt |
| Công cụ kiểm thử | Chưa có | Đã có tab **Xem trước khi học 5.8** (`src/admin/pet-motion/StudyPreviewTab.jsx`) dùng chung `PetRig` thật |

**Hệ quả triển khai:**
- Giữ `docs/PET-MOTION.md` làm nguồn sự thật cho phần chuyển động; **không** thay thế bằng `PET-MOTION-INTEGRATION.md` cũ trong zip.
- Pet Director giao tiếp 100% qua `<PetAvatar ref={...}>` (`emit`, `setMicLevel`, `setVoiceLevel`, `hasApprovedRig`, `getCurrentClip`, `onClip`), không chạm `shared/pet-motion.js` hay API duyệt clip.

---

## 2. Lỗ hổng `onClip('tap')` với Pet chưa duyệt Rig & ở `mode="lesson"`

- **Vị trí code thật:**
  - `src/pet-rig/PetAvatar.jsx:198-207`: Khi `!stageApproved`, component trả về `<img src={staticSrc} ... />` **không có `onClick`**, khiến `onClip('tap')` không bao giờ chạy với pet-cấp chưa duyệt rig.
  - `src/pet-rig/PetRig.js:1195-1209`: Sự kiện `pointerup` chỉ kiểm tra chạm & gọi `this.o.onClip('tap', ...)` khi `this.o.mode === 'home'`. Ở `mode === 'lesson'`, chạm vào pet không gọi `onClip('tap')`.
- **Ảnh hưởng:** `<PathPet>` (GĐ2), `PetPage` và `<PetStage>` dựa vào `onClip('tap')` để gửi `dispatch('pet_tap')`. Nếu không vá, phần lớn pet chưa duyệt rig sẽ "trơ" khi bé chạm vào.
- **Giải pháp (Gói B):**
  - Thêm `onClick` trên fallback `<img>` của `PetAvatar.jsx` gọi `onClip?.('tap', null)` (khi có prop `onClip`).
  - Trong `PetRig.js`, cho phép chạm nhẹ ở `mode === 'lesson'` gọi `onClip('tap', ...)` (nhưng vẫn tắt kéo thả `drag` trong `lesson`).

---

## 3. Canvas Bubble (`PetRig.say`) & chuỗi vi phạm nguyên tắc P3

- **Vị trí code thật:**
  - `src/pet-rig/PetRig.js:295-298`: `say(text, ms)` vẽ trực tiếp lên canvas (`PetRig.js:983-997`, font `sans-serif`, không xuống dòng).
  - Được gọi tự động trong `emit()` tại: `app_open` (`PetRig.js:417` — chuỗi cứng **`'Nhớ bạn quá!'`**), `answer_wrong` (`PetRig.js:457`), `lesson_done` (`PetRig.js:467`), `pet_speak_start` (`PetRig.js:492`).
- **Giải pháp (Gói B):**
  - Thêm option `canvasBubble: true` vào `PetRig` & prop `canvasBubble = true` vào `PetAvatar` (mặc định `true` để không vỡ nơi chưa dùng Director như `StudyPreviewTab`). Mọi nơi dùng Director truyền `canvasBubble={false}`.
  - Đổi fallback text ở `PetRig.js:417` thành `'Mừng bạn quay lại!'` cho phù hợp nguyên tắc P3.

---

## 4. `PictureLesson.jsx` (Starter Cấp 1) bị thiếu trong gói bàn giao

- **Vị trí code thật:**
  - `src/features/lesson/LessonDetailPage.jsx:1143-1158` render `<PictureLesson ... petRef={petRef} />` cho toàn bộ 12+ bài nhóm Mới học (`format: 'picture'`).
  - `src/features/lesson/PictureLesson.jsx` gọi trực tiếp `petRef?.current?.emit('answer_correct' | 'answer_wrong')` tại **6 chỗ** (dòng `143, 150, 174, 215, 218, 428, 431`).
- **Ảnh hưởng:** Nhóm trẻ nhỏ Starter chính là đối tượng cần nguyên tắc P1–P4 (động tác nhiều, chữ ít, không che màn hình) nhất. Nếu chỉ sửa `LessonDetailPage` mà quên `PictureLesson`, bài Starter sẽ lọt khỏi Director (vi phạm P7).
- **Giải pháp (Gói C):** Chuyển toàn bộ 6 chỗ trong `PictureLesson.jsx` sang gọi `onPetAnswer(isCorrect, { word, meaning })` (hoặc `usePetDirector().dispatch`) truyền đủ `{ word, meaning }` từ dữ liệu bài hình ảnh!

---

## 5. Xung đột tiềm ẩn giữa `<PetStage>` (`160/200px`) và chuẩn **Zero-Scroll Quiz**

- **Vị trí code thật:**
  - `docs/04-design/SDD-PET-MANAGEMENT-v1.0.md:25, 36, 42-45`: Dự án đã chốt chuẩn **Zero-Scroll Quiz** — thu `.study-pet-dock` xuống `50×54px` (`src/styles/pet.css:724-762`) và dùng `.quiz-viewport-stage` + `.quiz-sticky-action-bar` để người học không phải cuộn chuột khi làm câu hỏi.
  - Mockup `01-bai-hoc-pet-stage.html` & spec §6.1 đặt `<PetStage>` cao `160px` mobile / `200px` desktop.
- **Rủi ro:** Trên màn hình mobile `360×640` hoặc laptop `1366×768`, thẻ cao `160–200px` khi bật chế độ Quiz có thể đẩy nút đáp án/thanh hành động vượt quá 1 khung nhìn.
- **Giải pháp đề xuất (cần PO xác nhận ở Plan):**
  - `<PetStage>` hỗ trợ prop `compact` (tự động bật khi `quizMode && !finished` hoặc màn hình thấp `max-height: 760px`):
    - `standard`: `156px` mobile / `184–200px` desktop (khi học từ, flashcard, ngữ pháp, đọc, `PictureLesson`, màn kết quả).
    - `compact`: `112px` mobile / `128px` desktop (khi làm Quiz câu hỏi 4 lựa chọn) — vẫn giữ trọn sân khấu cỏ + `PetAvatar` sống động + `<PetSpeech>` bên phải + chip chuỗi đúng, nhưng **giữ vững Zero-Scroll Quiz**.

---

## 6. CSS `.cowdi-chat-*` nằm rải rác ở **3 file** (không chỉ `book.css`)

Gói bàn giao chỉ liệt kê `src/styles/book.css`, nhưng `grep` toàn bộ `src/styles/` tìm thấy đủ 3 file:
1. `src/styles/book.css`: dòng `1264–1277`, `1602–1613`, `1819–1825`.
2. `src/styles/components.css`: dòng `59–106`, `182–186`, `418`.
3. `src/styles/pet.css`: dòng `522–531` (`.cowdi-chat-img`, `canvas.cowdi-chat-img`).

→ Gói C phải xoá sạch rule `.cowdi-chat-*` ở **cả 3 file** để không để lại CSS chết hoặc quy tắc `position: fixed` thừa.

---

## 7. Định tuyến thật (`/` là Lộ trình) & Avatar Bạn bè trên `LearningPathPage`

- `src/App.jsx:74-77`: Route `/` và `/learning-path` đều render **`LearningPathPage`**; còn **`HomePage`** nằm ở `/overview`.
  - Vì phần lớn người dùng mở app vào thẳng `/`, `LearningPathPage` phải gửi `app_open` ngay từ GĐ1 (kết hợp cơ chế 1 lần/phiên của Director để không phát trùng khi chuyển sang `/overview`).
- `src/pages/LearningPathPage.jsx:674-736`: Tại node `current`, hiện có `<img className="path-mascot">` (dòng `675-685`, `src/styles/path.css:250-261` có `pointer-events: none` và `transform: scaleX(-1)` ở `.right`) **và** ngay phía dưới là dải avatar bạn bè `FR-MAP-04` (dòng `698-736`).
  - Khi làm `<PathPet>` ở GĐ2 (Gói D): phải bỏ `pointer-events: none` để chạm mở thẻ hành động; không áp `scaleX(-1)` lên cả wrapper chứa `<PetThought>` (tránh lật ngược icon); giữ khoảng cách thoáng với `.path-node-tip` và dải avatar bạn bè.

---

## 8. Rà soát chuỗi vi phạm P3 (`"ốm"`, `"yếu lắm"`, `"nhớ bạn lắm"`) & `common.js`

- Kết quả `grep -rn` toàn bộ `src/`:
  - **20 chuỗi vi phạm P3 nằm tập trung trong `src/data/pets.js`** (`chatMessages` của 21 loài pet, dòng `268–1011`). Sẽ bị xoá hoàn toàn khi bỏ `chatMessages` & `getPetMessage` ở cuối GĐ2 (Gói D).
  - Các kết quả khác khớp chữ `"ốm"` nằm trong dữ liệu bài học tiếng Anh (`src/data/vocab/animals.js` — "Báo đốm", `src/data/lessons/general/health.js` — `Sick = Bị ốm`, `toeic-vocab-healthcare.js` — "Nghỉ ốm"): **hợp lệ, không xoá**.
  - `src/data/config/messages.js` (`COWDI_MESSAGES`, dùng cho popup "Lời nhắn hôm nay" ở sidebar `BookShell.jsx:160-163`): đã kiểm tra toàn bộ 10 câu — **sạch, 0 từ cấm P3**.
- **Lưu ý nhỏ ở `starter/src/data/pet-lines/common.js`:** dòng 47 (`'Moo~ Sẵn sàng học chưa nè?'`) và dòng 69 (`'Moo~ {petName} đây!'`) mang tiếng kêu đặc trưng của bò Cowdi. GĐ1 giữ nguyên đúng file starter; đến GĐ2 (Gói E) chuyển 2 câu `"Moo~"` sang `cowdi.js` và đổi `common.js` sang trung tính cho mọi loài pet.

---

## 9. Tích hợp kiểm thử & nguồn dữ liệu thật

- **`package.json:15`:** `"test": "node --test \"shared/*.test.js\" \"server/tests/*.test.mjs\" \"src/pet-rig/*.test.mjs\""`. Cần bổ sung `"src/pet-director/*.test.mjs"` để `npm test` chạy trọn bộ tự động.
- **Nguồn số liệu thật cho biến LineDB (P6):**
  - `userId`: `useAuth().user?.id || 'guest'`
  - `lessonsToday`: `useUser().userData.dailyJournal?.[todayKey()]?.lessons || 0` (`src/hooks/useUser.jsx:44`)
  - `daysAway`: tính từ `userData.lastActiveDate || activePet?.needsUpdatedAt` (`src/pages/HomePage.jsx:16-21`)
  - `lessonTitle` & `nextLessonHref`: lấy trực tiếp từ `getNextPathLesson(userData)` (`src/data/path.js:238-245`) + `ALL_LESSONS`
  - `petName`, `stage`, `group`, `mood`, `bond`, `topSkill`: từ `usePet().getActivePetWithDecay()`, `PET_REGISTRY`, `getPetMood`, `bondOf`, `topSkillOf`.
- **TTS đọc từ tiếng Anh (`speech.en`) trong `<PetSpeech>`:** Tạo helper nhẹ `src/pet-director/tts.js` (hoặc tái sử dụng `speechSynthesis` chuẩn `en-US` rate `0.85` kèm gọi `pet_speak_start`/`pet_speak_end` + `setVoiceLevel(0.65)` để pet nhép miệng đồng bộ khi bé bấm nút Loa trên bong bóng).
