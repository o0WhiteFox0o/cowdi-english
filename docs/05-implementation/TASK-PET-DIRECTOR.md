# TASK-PET-DIRECTOR — Kế hoạch & Checklist triển khai Pet Director V2 (Giai đoạn 1–2)

> **Ngày lập:** 2026-11-25 · **Trạng thái:** ✅ Đã hoàn thành GĐ 1–2 (Gói A–E trên `feat/pet-director`) · **Nhánh:** `feat/pet-director`
> **Tài liệu gốc:** [SDD-PET-DIRECTOR-v1.1.md](../04-design/SDD-PET-DIRECTOR-v1.1.md) · [RPT-PET-DIRECTOR-SURVEY.md](RPT-PET-DIRECTOR-SURVEY.md) · [PET-MOTION.md](../PET-MOTION.md)

---

## Tổng quan lộ trình triển khai

Tận dụng tối đa hệ thống **Pet-motion** (34 clip duyệt động trên `/admin/pet-motion`, `PetRig`, `PetAvatar`, `motionCache`, FX hạt, emoji theo clip, nhép miệng TTS/mic) và chia thành **2 Giai đoạn / 5 Gói việc** rõ ràng:

| Giai đoạn | Gói | Nội dung chính | Phụ thuộc | Kiểm thử bắt buộc |
|---|---|---|---|---|
| **GĐ 1** | **Gói A** | Lõi `PetDirector` thuần JS (`rules.js`, `storage.js`, `lineSelector.js`, `PetDirector.js`, `common.js`, `index.js`) + test | — | `lines.test.mjs`, `pet-director.test.mjs` |
| **GĐ 1** | **Gói B** | Mở rộng `PetRig.js` & `PetAvatar.jsx` (`canvasBubble`, chuẩn hoá `tap` cho cả rig & ảnh tĩnh fallback, sửa câu `'Nhớ bạn quá!'`) | — | `pet-rig.test.mjs` |
| **GĐ 1** | **Gói C** | `DirectorContext`, `<PetSpeech>`, `<PetThought>`, `<PetStage>` (có `compact` giữ Zero-Scroll Quiz); tích hợp `LessonDetailPage`, `PictureLesson`, `PracticePage`, `LearningPathPage` (`app_open`); gỡ `CowdiChat` & xoá `.cowdi-chat-*` ở 3 file CSS | A, B | `npm test`, `npm run build`, kiểm tra UI 360px & 1280px |
| **GĐ 2** | **Gói E** | Kho câu thoại đầy đủ `src/data/pet-lines/cowdi.js` (~250–300 câu đạt chỉ tiêu GĐ2) + chuyển `PAGE_TIPS` + chỉnh `common.js` trung tính | A | `lines.test.mjs` (0 lỗi, 0 từ cấm, ≤ 60 ký tự) |
| **GĐ 2** | **Gói D** | `<PathPet>` + thẻ hành động trên `LearningPathPage` (hài hoà với bạn bè `FR-MAP-04`); chuyển `HomePage`, `PetPage`, `DuelPage` sang Director; xoá `CowdiChat.jsx`, `chatMessages`, `getPetMessage`; (tuỳ chọn) preview Director trong `StudyPreviewTab.jsx` | C, E | `npm test`, `npm run build`, nghiệm thu GĐ2 360px & 1280px |

---

## Điểm cần Product Owner chốt trước khi bắt đầu code

1. **Chiều cao `<PetStage>` trong chế độ Quiz (`Zero-Scroll Quiz` vs Mockup `160/200px`):**
   - *Đề xuất:* `<PetStage>` dùng chiều cao `156px` (mobile) / `184–200px` (desktop) ở bước học từ/flashcard/ngữ pháp/đọc/`PictureLesson`, và tự chuyển chế độ **`compact` (`112px` mobile / `128px` desktop)** khi đang làm Quiz 4 đáp án để bảo toàn **Zero-Scroll Quiz** (`SDD-PET-MANAGEMENT-v1.0`).
2. **Chiến lược nhánh Git:**
   - *Đề xuất:* Dùng **1 nhánh `feat/pet-director`** với 5 commit tuần tự (`A → B → C → E → D`), giống cách triển khai `feat/friends` vừa hoàn thành sạch gọn.
3. **Preview Pet Director trong `/admin/pet-motion?view=preview` (`StudyPreviewTab.jsx`):**
   - *Đề xuất:* Thêm công tắc nhỏ bật/tắt mô phỏng Pet Director ở cuối Gói D để admin test đồng thời 34 clip + lời thoại + độ dài bong bóng ngay trong công cụ Pet-motion sẵn có.

---

## Chi tiết các gói việc

### Gói A — Lõi `PetDirector` thuần JS (không đụng UI)
- [ ] Chép đúng 3 file khởi đầu từ `starter/` (không sửa giá trị trong `rules.js`):
  - `src/pet-director/rules.js`
  - `src/data/pet-lines/common.js`
  - `src/pet-director/lines.test.mjs`
- [ ] Viết `src/data/pet-lines/index.js`: gộp `common` + kho riêng từng pet (trả về `[...petSpecific, ...common]`, có `getLines(petId)` và `ALL_PET_LINES`).
- [ ] Viết `src/pet-director/storage.js`: bọc `localStorage` theo `cowdi.dir.<userId>.*` (`seenTips`, `recentLines`, `session`, `seenWords`) kèm adapter bộ nhớ (`createMemoryStorage`) để test thuần trên Node.
- [ ] Viết `src/pet-director/lineSelector.js`:
  - Lọc theo mọi khoá `when` (`screen`, `mood`, `stageMin/Max`, `bondMin`, `group`, `night`, `needs`, `daysAwayMin/Max`, `streak`, `perfect`).
  - Từ chối câu nếu thiếu biến được dùng trong `vi`/`en`.
  - Chống lặp 7 ngày (`recentLines`) và chống lặp 2 lần liên tiếp cùng `event`; chọn theo `weight`.
  - Điền biến sạch cho cả `vi` và `en`.
- [ ] Viết `src/pet-director/PetDirector.js`:
  - `dispatch(event, payload, ctx)` trả về `Decision | null`.
  - Thực thi đủ luật §4.3: ưu tiên & ngắt, cooldown theo loại (`8s`/`10s`), `answer_correct` chỉ có chữ ở lần đúng đầu tiên của `word` trong bài, giãn cách toàn cục `20s` (trừ `priority >= 50`), 1 lần/phiên (`app_open`, `mood_nudge`), 1 lần/màn/tài khoản (`page_tip`), giờ yên `21:00–06:00`, ghi đè tầng (`battle: 1`, `path:mood_nudge: 2`).
  - Giữ chỗ GĐ3: `beginConversation()` trả `Promise.reject(new Error('not_enabled'))`.
- [ ] Viết `src/pet-director/pet-director.test.mjs` phủ đủ toàn bộ ca kiểm thử mục 10.3:
  - Ưu tiên & ngắt (`lesson_done` thay `answer_correct`; `page_tip` không thay `answer_wrong`).
  - Cooldown (`2` lần `answer_correct` trong 8s → lần 2 tầng 1; cùng `word` lần 2 → tầng 1).
  - `page_tip` cùng màn hình lần 2 → không có `speech`.
  - Giờ yên 22:00 (`mood_nudge` → tier 2, `thought: 'zzz'`, không giục học).
  - Thiếu biến (`{word}`) → câu không bao giờ được chọn.
  - Chống lặp 7 ngày (giả lập đồng hồ).
  - `battle_*` luôn tier 1, `speech: null`, `thought: null`.
  - `pet_tap` 10 lần liên tiếp trong 15s → chữ ≤ 2 lần.
  - Đúng 10 câu liên tiếp trong 20s → chữ ≤ 4 lần, động tác 10/10 lần.
- [ ] Thêm `"src/pet-director/*.test.mjs"` vào `scripts.test` trong `package.json`.

### Gói B — Mở rộng `PetRig` & `PetAvatar` (Tận dụng tối đa Pet-motion)
- [ ] `src/pet-rig/PetRig.js`:
  - Thêm option `canvasBubble: true` trong `constructor`.
  - Trong `say()`: `if (!this.o.canvasBubble || !this.hasApprovedStage()) return;`.
  - Đổi `'Nhớ bạn quá!'` (dòng 417) thành `'Mừng bạn quay lại!'`.
  - Trong `_bindPointer()`: hỗ trợ chạm nhẹ ở `mode === 'lesson'` gọi `onClip('tap', ...)` (vẫn giữ tắt kéo thả trong `lesson`).
- [ ] `src/pet-rig/PetAvatar.jsx`:
  - Thêm prop `canvasBubble = true`, truyền vào `PetRig` và cập nhật khi prop thay đổi.
  - Gắn `onClick` cho nhánh fallback `<img>` (`!stageApproved`) gọi `onClip?.('tap', null)` để pet chưa duyệt rig vẫn tương tác đồng nhất.
- [ ] `src/pet-rig/pet-rig.test.mjs`:
  - Thêm test xác nhận `canvasBubble: false` chặn `this.bubble` trên `answer_wrong`, `lesson_done`, `pet_speak_start`, `app_open`, `say()` nhưng vẫn phát đúng clip đã duyệt.
- [ ] Không sửa `shared/pet-motion.js`.

### Gói C — Provider, UI sân khấu bài học & gỡ `CowdiChat` (Hoàn thành GĐ 1)
- [ ] Viết `src/pet-director/tts.js`: helper đọc tiếng Anh ngắn cho nút Nghe trong `<PetSpeech>`, đồng bộ nhép miệng `pet_speak_start`/`pet_speak_end` + `setVoiceLevel`.
- [ ] Viết `src/pet-director/DirectorContext.jsx`:
  - `<PetDirectorProvider>` lấy ngữ cảnh sống từ `useAuth`, `usePet`, `useUser`, `getNextPathLesson`.
  - `register(slot, petRef, extraRefs?)`, `dispatch(event, payload)`, `speech`, `thought`, `dismissSpeech`, `dismissThought`, `speakText(en)`.
  - Tự gửi `idle_tick` mỗi `30s` khi tab đang mở.
  - Tự phát `pet_speak_start` (không text canvas) + `setVoiceLevel(0.65)` khi `<PetSpeech>` xuất hiện và `pet_speak_end` + `setVoiceLevel(0)` khi kết thúc.
- [ ] Viết `src/pet-director/PetSpeech.jsx`, `src/pet-director/PetThought.jsx`, `src/pet-director/PetStage.jsx`, `src/pet-director/pet-director.css` (font `Mali`, không `position: fixed`, không xoay, hỗ trợ `prefers-reduced-motion`, có `compact` cho Quiz).
- [ ] Tích hợp vào màn hình GĐ 1:
  - `src/App.jsx`: bọc `<PetDirectorProvider>`, gỡ `<CowdiChat />`.
  - `src/features/lesson/LessonDetailPage.jsx`: thay `petDock` bằng `<PetStage>` (giữ mount xuyên suốt bài học/quiz/kết quả, bật `compact` khi `quizMode && !finished`), chuyển toàn bộ ~15 chỗ `petRef.current?.emit` sang `dispatch` (truyền `{ word, meaning }` khi có, bỏ text cứng ở `lesson_done`, giữ `setMicLevel` / `setVoiceLevel`).
  - `src/features/lesson/PictureLesson.jsx`: chuyển 6 chỗ `petRef?.current?.emit` sang Director kèm `{ word, meaning }`.
  - `src/features/practice/PracticePage.jsx`: thay `petDock` bằng `<PetStage>`, chuyển toàn bộ `emit` sang `dispatch`.
  - `src/pages/LearningPathPage.jsx`: gửi `app_open` và `screen_enter({ screen: 'path' })`.
- [ ] Dọn sạch CSS `.cowdi-chat-*` trên **cả 3 file**: `src/styles/book.css`, `src/styles/components.css`, `src/styles/pet.css`.
- [ ] Kiểm thử & nghiệm thu GĐ 1 (`npm test`, `npm run build`, chụp/kiểm tra bài học ở `360px` & `1280px`).

### Gói E — Kho câu thoại đầy đủ Cowdi (GĐ 2 — Nội dung)
- [ ] Viết `src/data/pet-lines/cowdi.js` đạt tối thiểu toàn bộ cột GĐ 2 (§5.2):
  - `answer_correct` (≥ 30), `answer_wrong` (≥ 30), `streak` (≥ 15), `lesson_done` (≥ 20), `app_open` (≥ 25), `mood_nudge` (≥ 20), `page_tip` (≥ 2/màn cho `lesson`, `path`, `home`, `pet` — kế thừa & viết lại từ `PAGE_TIPS`), `pet_tap` (≥ 60 chia theo mood + mốc gắn bó 0/60/200/500/1200 + đêm), `skill_level_up` (≥ 10), `evolve_ok` (≥ 10), `feed` (≥ 10).
- [ ] Tinh chỉnh `src/data/pet-lines/common.js`: bỏ `"Moo~"` khỏi `common.js` (chuyển sang `cowdi.js`) để trung tính cho 22+ loài pet khác.
- [ ] Đăng ký `cowdi.js` trong `src/data/pet-lines/index.js` và cập nhật `src/pet-director/lines.test.mjs` quét toàn bộ `ALL_PET_LINES` + kiểm tra đủ số lượng tối thiểu theo §5.2.

### Gói D — `<PathPet>`, hoàn thiện các màn còn lại & dọn mã cũ (Hoàn thành GĐ 2)
- [ ] Viết `src/pet-director/PathPet.jsx`:
  - Thay `<img className="path-mascot">` trong `src/pages/LearningPathPage.jsx` bằng `<PathPet>` dùng `<PetAvatar mode="home" canvasBubble={false} />` (`90×90` desktop, `72×72` mobile) + `<PetThought>` + thẻ hành động (`Học tiếp` → bài/checkpoint `current`, `Để sau`; ẩn nút `"Nói chuyện"`).
  - Đóng thẻ khi bấm `"Để sau"`, chạm ngoài, cuộn bản đồ, hoặc hết `ttlMs`.
  - Đảm bảo không va chạm `.path-node-tip` và dải avatar bạn bè `FR-MAP-04`.
  - Cập nhật `src/styles/path.css` (bỏ `pointer-events: none` cũ của `.path-mascot`, tinh chỉnh vị trí cho `<PathPet>`).
- [ ] Chuyển các trang còn lại sang Director:
  - `src/pages/HomePage.jsx`: đăng ký slot `'home'` (hỗ trợ cả 2 avatar), chuyển `app_open` sang `dispatch`.
  - `src/features/pet/PetPage.jsx`: đăng ký slot `'pet'`, chuyển `feed`, `pet_tap`, `evolve_ok` sang `dispatch`, thay `.pet-speech-bubble` cũ bằng `<PetSpeech>` gắn trong khung pet (hết dùng `getPetMessage`).
  - `src/features/duel/DuelPage.jsx`: đăng ký slot `'battle'`, chuyển `battle_*` sang `dispatch` (luôn Tầng 1, không bao giờ có chữ).
- [ ] (Tuỳ chọn nếu PO đồng ý) Bổ sung công tắc xem thử Pet Director trong `src/admin/pet-motion/StudyPreviewTab.jsx`.
- [ ] Dọn sạch mã cũ sau khi `grep` xác nhận 0 nơi gọi:
  - Xoá `src/components/layout/CowdiChat.jsx`.
  - Xoá `chatMessages` và `getPetMessage` trong `src/data/pets.js` (giữ `getPetMood`).
- [ ] Nghiệm thu cuối toàn bộ GĐ 1 + GĐ 2:
  - Không còn `position: fixed` của pet trên màn bài học.
  - `grep` toàn bộ kho thoại & UI pet: 0 chuỗi `"ốm"`, `"yếu lắm"`, `"nhớ bạn lắm"`, `"sao lâu"`.
  - Mở app khi pet `sick`: Lộ trình hiện `<PetThought>` sách 1 lần; chạm pet mở thẻ có nút `"Học tiếp"` đi đúng bài `current`.
  - Sau 21:00: không có câu giục học; `mood_nudge` thành `zzz`.
  - Chạm pet 10 lần liên tiếp: chữ ≤ 2 lần, động tác chạy mỗi lần.
  - `npm test` 100% PASS, `npm run build` PASS.
