# SDD-PET-DIRECTOR v1.1 — Hệ thống Điều phối Biểu đạt Pet ("Cowdi là nhân vật sống", Giai đoạn 1–2)

| Mục | Giá trị |
|---|---|
| **Mã tài liệu** | `SDD-PET-DIRECTOR` |
| **Phiên bản** | `1.1` · **Ngày tạo:** `2026-11-25` |
| **Trạng thái** | `Approved — Đã triển khai GĐ 1–2 (feat/pet-director)` |
| **Chuẩn tham chiếu** | IEEE 1016-2009 · Quy ước tài liệu: [DOCP-COWDI-v1.1](../00-general/DOCP-COWDI-v1.1.md) |
| **Tài liệu nguồn & liên quan** | Gói bàn giao `cowdi-pet-director.zip` (v1.1, 2026-11-25) · [PET-MOTION.md](../PET-MOTION.md) · [SDD-PET-MANAGEMENT-v1.0.md](SDD-PET-MANAGEMENT-v1.0.md) · [RPT-PET-DIRECTOR-SURVEY.md](../05-implementation/RPT-PET-DIRECTOR-SURVEY.md) · [TASK-PET-DIRECTOR.md](../05-implementation/TASK-PET-DIRECTOR.md) |
| **Mockup & Hình tham khảo** | [pet-director-mockups/](pet-director-mockups/) (`01-bai-hoc-pet-stage.html`, `02-lo-trinh-path-pet.html`, `03-he-thong-dao-dien.html`, `bug-chat-che-man-hinh.jpg`) |

---

## 0. Mục tiêu và phạm vi

**Mục tiêu:** Gỡ bỏ bong bóng chat nổi `CowdiChat` (hiện dùng `position: fixed`, tự bật ở mọi lần đổi trang và đè che màn hình bài học), thay bằng **Pet Director** — bộ điều phối tập trung quyết định pet phản ứng như thế nào với mọi sự kiện trong app. **Tận dụng tối đa hệ thống Pet-motion sẵn có** (`34` động tác đã duyệt trên `/admin/pet-motion`, `PetRig`, `PetAvatar`, hiệu ứng hạt, emoji biểu cảm theo clip, nhép miệng TTS/mic); chữ chỉ xuất hiện ngắn, có chừng mực và không bao giờ đè lên nội dung học.

**Trong phạm vi:**
- **Giai đoạn 1 (Gói A + B + C):** Lõi `PetDirector` (thuần JS), mở rộng tối thiểu `PetRig`/`PetAvatar` (`canvasBubble` + chuẩn hoá `tap` cho cả rig đã duyệt lẫn ảnh tĩnh fallback), tầng 1–2–3 cơ bản (59 câu `common.js`), sân khấu `<PetStage>` trong bài học (`LessonDetailPage`, `PictureLesson`, `PracticePage`), gỡ `CowdiChat` khỏi `App.jsx` và dọn sạch `.cowdi-chat-*` trên cả 3 file CSS.
- **Giai đoạn 2 (Gói E + D):** Kho câu thoại đầy đủ cho Cowdi (`cowdi.js` ~250–300 câu) và tinh chỉnh `common.js` trung tính; `<PathPet>` đứng trên bản đồ `LearningPathPage` kèm `<PetThought>` & thẻ hành động; chuyển `HomePage`, `PetPage`, `DuelPage` sang Director; xoá hoàn toàn `CowdiChat.jsx`, `chatMessages` & `getPetMessage`; tuỳ chọn thêm xem trước Pet Director trong `/admin/pet-motion?view=preview` (`StudyPreviewTab.jsx`).

**Ngoài phạm vi (KHÔNG làm ở v1.1):**
- Hội thoại AI (Tầng 4). Chỉ giữ chỗ trong interface (§11), không gọi API AI nào.
- Không thay đổi kinh tế v2 (Sữa, Gem, Đá, Vé gacha), chỉ số pet, logic chấm bài hay luật mở khoá lộ trình.
- Không sửa `shared/pet-motion.js` (file sinh tự động), không sửa cấu trúc DB/API duyệt rig của `/admin/pet-motion`.
- Không thêm file âm thanh mới; nếu cần âm, dùng `useSound().play` hiện có.

---

## 1. Nguyên tắc thiết kế bắt buộc (P1–P7)

| # | Nguyên tắc | Hệ quả kỹ thuật |
|---|---|---|
| **P1** | **Động tác trước, chữ sau.** ~70% phản ứng chỉ có động tác (Tầng 1), ~15% có thêm 1 biểu tượng (Tầng 2), ~15% có câu ngắn (Tầng 3). | Director mặc định chọn tầng thấp nhất đủ diễn đạt; tận dụng trọn vẹn 34 clip + FX của `PetRig`. |
| **P2** | **Không che nội dung học & giữ Zero-Scroll Quiz.** | Trong bài học, pet chỉ đứng ở sân khấu `<PetStage>` đầu trang (trong luồng bố cục). Không có phần tử `position: fixed` nào của pet đè lên vùng bài tập. Ở màn Quiz (`.quiz-viewport-stage`), `<PetStage>` hỗ trợ chế độ `compact` để giữ nguyên trải nghiệm Zero-Scroll Quiz (`SDD-PET-MANAGEMENT-v1.0`). |
| **P3** | **Không trách móc, không gây áy náy.** | Cấm tuyệt đối các chuỗi: `ốm`, `yếu lắm`, `yếu quá`, `nhớ bạn lắm`, `sao lâu`, `sai rồi`, `bệnh`, `đau`, `😢`, `😷`, `🤒`, `😿`, `🥺` trong toàn bộ kho câu thoại pet & UI pet. Pet mệt chỉ nói nhẹ và gợi ý học 1 bài. |
| **P4** | **Ngắn gọn.** | Mỗi câu `vi` sau khi điền biến mẫu dài tối đa **60 ký tự**; tối đa 1 câu + tối đa 1 nút hành động (CTA). |
| **P5** | **Có chừng mực.** | Áp dụng giới hạn tần suất (cooldown theo loại, giãn cách toàn cục 20s, 1 lần/phiên cho `app_open`/`mood_nudge`, 1 lần/màn/tài khoản cho `page_tip`). Không tự bật lời nhắn lặp lại mỗi lần đổi trang. |
| **P6** | **Dùng số liệu thật của người học.** | Ưu tiên câu chứa biến thật `{lessonTitle}`, `{word}`, `{meaning}`, `{streak}`, `{lessonsToday}`, `{score}`, `{total}`, `{daysAway}` từ `useUser` / `usePet` / `path.js`. |
| **P7** | **Một nguồn sự thật (Single Source of Truth).** | Mọi màn hình người học gửi sự kiện qua `director.dispatch(event, payload)`. Không gọi `petRef.current.emit(...)` trực tiếp từ trang (trừ `setMicLevel` / `setVoiceLevel` theo khung hình). |

---

## 2. Chiến lược tận dụng tối đa hệ thống `Pet-motion` hiện hành

Hệ thống `Pet-motion` đang chạy Production (chi tiết tại [PET-MOTION.md](../PET-MOTION.md)) cung cấp nền tảng hoạt hoạ server-driven hoàn chỉnh. Pet Director **đứng ngay phía trên** và tái sử dụng 100% hạ tầng này thay vì xây mới:

1. **Dùng nguyên 34 clip & quy tắc duyệt động từ `/admin/pet-motion`:**
   - `PetAvatar` tự tải & cache (`motionCache.js`) dữ liệu đã duyệt theo `petId` từ `GET /api/pet-motion/:petId` và tự động lấy danh mục 23+ loài pet từ `GET /api/pet-motion/catalog`.
   - Director phát tiếp sự kiện chuẩn (`PET_EVENTS`) xuống `PetAvatar.emit(rigEvent, rigData)`. Mọi luật fallback clip chưa duyệt (`resolveApprovedClipName`), nhịp theo cấp `C1–C5` (`STAGE_FACTORS`), tính cách 7 nhóm (`GROUP_FACTORS`), mốc gắn bó `60/200/500/1200` (`bondOf`, `topSkillOf`) và `prefers-reduced-motion` (40% biên độ) đều chạy tự động qua `PetRig`.
2. **Tận dụng hiệu ứng hạt & biểu cảm emoji cấu hình trong `/admin/pet-motion`:**
   - `PetRig` đã tự vẽ hiệu ứng hạt (`spark`, `confetti`, `heart`, `dots`, `z`, `note`, `wave`, `doodle`, `stars`, `crumb`) và emoji biểu cảm do admin gắn cho từng clip (`curClipObj.emoji`, đặc biệt hữu ích cho Trứng C1).
   - Khi `canvasBubble={false}`, `PetRig` tắt bong bóng chữ thô trên canvas nhưng **giữ nguyên 100%** các hạt FX và emoji theo clip.
   - `<PetThought>` (Tầng 2 trên DOM) chỉ xuất hiện ở các ngữ cảnh điều phối (vd `mood_nudge` trên Lộ trình, giờ yên `zzz`, xong bài `trophy`), vị trí đặt phía trên đầu pet tách biệt, không chồng lên bong bóng DOM `<PetSpeech>`.
3. **Đồng bộ nhép miệng (`talk`) và lắng nghe (`listen`):**
   - Khi `<PetSpeech>` hiển thị câu thoại (Tầng 3), Provider tự gửi `pet_speak_start` (không text canvas) + `setVoiceLevel(0.65)` trong khoảng ~1.2–2.2s (hoặc theo TTS nếu người học bấm nút Nghe) rồi trả `setVoiceLevel(0)` + `pet_speak_end`.
   - Khi bài học gọi `speakWord()` (TTS đọc từ vựng) hoặc thu âm micro (`mic_start`/`mic_end` + `setMicLevel`), sự kiện đi qua Director ở **Tầng 1 (rig-only)** để pet nhép miệng / lắng nghe mượt mà mà không làm gián đoạn bong bóng chữ.
4. **Hỗ trợ đồng nhất cả Pet đã duyệt Rig lẫn Pet ảnh tĩnh fallback:**
   - Vì nhiều loài/cấp pet trên production chưa duyệt rig (`!stageApproved`), `PetAvatar` hiện render `<img>` tĩnh.
   - Bản mở rộng Gói B thêm `onClick` trên fallback `<img>` để kích hoạt `onClip?.('tap', null)`, đồng thời cho phép `PetRig` bắn `onClip('tap', ...)` ở cả `mode="home"` lẫn `mode="lesson"` (trừ `battle`). Nhờ đó, chạm vào pet trên `<PathPet>`, `<PetStage>` hay `PetPage` luôn hoạt động kể cả khi pet-cấp chưa duyệt rig.
5. **Tận dụng `StudyPreviewTab.jsx` (`/admin/pet-motion?view=preview`) — mở rộng GĐ2:**
   - Có thể thêm công tắc *"Mô phỏng Pet Director"* trong tab Xem trước khi học để Admin kiểm thử cùng lúc cả 34 clip duyệt (đỏ/xanh) lẫn phản ứng 3 tầng của Director ngay trong môi trường giả lập 8 câu hỏi đã có sẵn.

---

## 3. Kiến trúc hệ thống

```text
  Trang người học (LessonDetail / PictureLesson / Practice / LearningPath / Home / Pet / Duel)
                                   │  dispatch(event, payload)
                                   ▼
  ┌───────────────────────── PetDirector (thuần JS, không React) ─────────────────────────┐
  │ 1. Chuẩn hoá ngữ cảnh (screen, mood, bond, group, stage, petId, giờ, số liệu học)     │
  │ 2. Xét ưu tiên & luật ngắt  →  3. Giới hạn tần suất (cooldown/session/seenTips)       │
  │ 4. Chọn tầng (1 | 2 | 3)    →  5. Chọn câu & điền biến (lineSelector + LineDB)        │
  └───────────────┬───────────────────────────────────────────────────────┬───────────────┘
                  │ Decision.rigEvent / rigData                           │ Decision.speech / thought
                  ▼                                                       ▼
        PetAvatar.emit(rigEvent, rigData)                      <PetSpeech> / <PetThought> (DOM)
        (Pet-motion: 34 clip + FX + emoji + nhép miệng)        (font Mali, nút Nghe TTS, CTA)
```

### 3.1 Cấu trúc thư mục mới

```text
src/pet-director/
  rules.js               // Bảng luật đã chốt từ starter/ (KHÔNG tự ý đổi giá trị)
  storage.js             // Lưu/đọc localStorage theo userId (try/catch an toàn)
  lineSelector.js        // Lọc câu theo `when`, điền biến, chống lặp 7 ngày & liên tiếp
  PetDirector.js         // Lớp điều phối thuần JS, tiêm clock/storage để test bằng node
  DirectorContext.jsx    // <PetDirectorProvider> + hook usePetDirector()
  PetStage.jsx           // Sân khấu pet trong bài học & luyện tập (standard + compact)
  PathPet.jsx            // Pet đứng cạnh node current trên Lộ trình + thẻ hành động (GĐ2)
  PetSpeech.jsx          // Bong bóng chữ DOM (Mali, nút Nghe TTS, nút đóng khi có CTA)
  PetThought.jsx         // Bong bóng suy nghĩ 1 icon SVG nét (Tầng 2)
  pet-director.css       // Toàn bộ style cho PetStage, PathPet, PetSpeech, PetThought
  lines.test.mjs         // Kiểm định kho câu (độ dài ≤ 60, từ cấm, trùng id, when.needs)
  pet-director.test.mjs  // Unit test lõi Director (mục 10.3)

src/data/pet-lines/
  index.js               // Gộp & xuất getLines(petId), ALL_PET_LINES
  common.js              // 59 câu dùng chung mọi pet (từ starter/; GĐ2 chỉnh trung tính)
  cowdi.js               // Kho câu riêng Cowdi (~250–300 câu ở GĐ2)
```

### 3.2 Provider & cơ chế đăng ký Slot (`DirectorContext.jsx`)

- `<PetDirectorProvider>` bọc trong `src/App.jsx` bên trong `<SoundProvider>` và `<ToastProvider>` (thay thế vị trí của `<CowdiChat />`).
- Provider đọc ngữ cảnh sống từ:
  - `useAuth()` → `user?.id || 'guest'`
  - `usePet()` → `getActivePetWithDecay()` (`speciesId`, `customName`, `evolution`, `skills`, `needs`, `needsUpdatedAt`) + `PET_REGISTRY[speciesId]` (`group`, `name`) + `getPetMood(needs)` + `bondOf(skills)`
  - `useUser()` → `userData.dailyJournal?.[todayKey()]?.lessons || 0` (`lessonsToday`), `userData.lastActiveDate` (`daysAway`), `userData.activePath`, `getNextPathLesson(userData)` → `lessonTitle`, `nextLessonHref`.
- Mỗi trang có pet đăng ký avatar hiện tại:
  ```js
  const { register, dispatch, speech, thought, dismissSpeech, dismissThought } = usePetDirector();
  useEffect(() => register('lesson', petRef), [register]);
  // slot: 'lesson' | 'path' | 'home' | 'pet' | 'battle'
  ```
- Hỗ trợ đăng ký đa ref cho trang có >1 avatar (như `HomePage` có 2 avatar hoặc `DuelPage` có `myPetRef` & `oppPetRef`): `register(slot, primaryRef, extraRefs?)` hoặc truyền `targetRef` trong `dispatch` đối với sự kiện `battle_*`.
- Khi unmount tự huỷ đăng ký. Tại một thời điểm chỉ có **một slot hoạt động** (slot đăng ký sau cùng). Sự kiện đến khi không có slot hoạt động sẽ bị bỏ qua.
- Provider tự đặt interval `IDLE_TICK_MS` (`30000ms`) gửi `idle_tick` khi tab đang hiển thị (`document.visibilityState === 'visible'`) để xét `mood_nudge`.

---

## 4. Hợp đồng API của Director

### 4.1 Danh sách sự kiện `dispatch(event, payload)`

| `event` | Payload | Ai gửi | Chuyển xuống `PetAvatar.emit` |
|---|---|---|---|
| `app_open` | `{ daysAway? }` | `LearningPathPage` (`/`) & `HomePage` (`/overview`) khi mount lần đầu | `app_open` (`wave`/`greet_return`) |
| `screen_enter` | `{ screen }` | Mỗi trang có pet khi mount | Không gửi rig; xét `page_tip` & `mood_nudge` |
| `lesson_start` | `{ lessonId, lessonTitle }` | `LessonDetailPage`, `PracticePage` | `lesson_start` (`attentive`) |
| `question_shown` | `{ lessonId? }` | Mỗi câu mới | `question_shown` (rig tự `think` sau 8s) |
| `answer_correct` | `{ word?, meaning?, lessonId? }` | `LessonDetailPage`, `PictureLesson`, `PracticePage` | `answer_correct` (`cheer_small` + `spark`) |
| `answer_wrong` | `{ word?, meaning?, lessonId? }` | `LessonDetailPage`, `PictureLesson`, `PracticePage` | `answer_wrong` (`encourage`) |
| `streak` | `{ count }` (`3/5/10/...`) | Chuỗi trả lời đúng | `streak` (`cheer_big` + `confetti`) |
| `lesson_done` | `{ perfect, score, total, lessonTitle? }` | Hoàn thành bài / phần nghe / phần nói / luyện tập | `lesson_done` (`cheer_big` / `dance` + `confetti`) |
| `skill_level_up` | `{ skill? }` | Lên cấp kỹ năng | `skill_level_up` (`proud`) |
| `evolve_ok` | `{ stage }` | `PetPage` sau khi API tiến hoá thành công | `evolve_ok` (`evolve` + `spark`) |
| `mic_start` / `mic_end` | — | Luyện nói | `mic_start` (`listen`) / `mic_end` (Tầng 1) |
| `pet_speak_start` / `pet_speak_end` | `{ ms? }` | Đọc TTS từ vựng hoặc `<PetSpeech>` hiện | `pet_speak_start` (`talk`) / `pet_speak_end` (Tầng 1, không vẽ canvasBubble) |
| `feed` | — | `PetPage` khi cho ăn | `feed` (`eat`) |
| `pet_tap` | — | `onClip('tap')` (từ `PetRig` hoặc fallback `<img>`) | Không gọi lại rig (tránh vòng lặp); xét chữ/thẻ |
| `battle_*` | `{ target?: 'mine'\|'opp' }` | `DuelPage` | Gửi thẳng clip trận, **luôn Tầng 1 (không bao giờ có chữ)** |
| `idle_tick` | — | Provider mỗi 30 giây | Không gửi rig; xét `mood_nudge` |

**Quy tắc vàng:** Sự kiện rig (`!DIRECTOR_ONLY_EVENTS.includes(event)`) **luôn** được gửi xuống `PetAvatar.emit` (động tác không bao giờ bị cooldown chặn). Chỉ lớp **chữ (`speech`) / biểu tượng (`thought`)** đi qua bộ lọc ưu tiên, tần suất và giờ yên.

### 4.2 Cấu trúc `Decision`

```ts
type Decision = {
  rigEvent: string | null;
  rigData?: object;
  tier: 1 | 2 | 3;
  thought?: 'book' | 'milk' | 'trophy' | 'zzz' | 'heart' | 'question' | 'music' | null;
  speech?: {
    id: string;
    vi: string;
    en?: string | null;
    cta?: { label: string; to?: string; action?: 'continue_lesson' | 'open_pet' | 'dismiss' | 'open_talk' } | null;
    ttlMs: number;
  } | null;
  priority: number;
};
```

### 4.3 Luật ưu tiên, tần suất & chọn tầng (`src/pet-director/rules.js`)

Giữ nguyên 100% số liệu đã chốt trong `starter/src/pet-director/rules.js`:
- **Ưu tiên:** `evolve_ok (100)` > `lesson_done (90)` > `streak (80)` > `skill_level_up (70)` > `answer_correct (50)` = `answer_wrong (50)` > `app_open (40)` > `pet_tap (35)` > `feed (30)` > `mood_nudge (20)` > `page_tip (10)`.
- **Ngắt bong bóng đang hiện:** Chỉ sự kiện có `priority` **lớn hơn hẳn** (`>`) bong bóng đang còn hạn mới được thay thế.
- **Giới hạn chữ theo loại:**
  - `answer_correct`: tối đa 1 lần / `8000ms` **và** khi payload có `word`, chỉ hiện chữ ở **lần đúng đầu tiên của từ đó trong bài** (`seenWords[lessonId]`), các lần đúng lại của cùng từ hạ xuống Tầng 1. (Nếu bài tập không truyền `word`, chỉ áp cooldown `8000ms`).
  - `answer_wrong`: tối đa 1 lần / `8000ms`.
  - `pet_tap`: tối đa 1 lần / `10000ms`; chạm liên tiếp vẫn chạy động tác rig, không hiện chữ.
  - `app_open`, `mood_nudge`: tối đa **1 lần / phiên** (phiên mới khi vắng > 30 phút).
  - `page_tip`: tối đa **1 lần / màn hình / tài khoản** (lưu vĩnh viễn trong `seenTips`).
- **Giãn cách Tầng 3 toàn cục:** chữ cách nhau tối thiểu `20000ms`, ngoại trừ sự kiện có `priority >= 50`.
- **Giờ yên (`21:00–06:00` giờ thiết bị):**
  - `mood_nudge` và `page_tip` hạ xuống **Tầng 2** với `thought: 'zzz'`, không bao giờ giục học.
  - `app_open` và `pet_tap` lọc câu có `when.night === true`.
- **Ghi đè tầng theo màn hình:** `battle` luôn `tier = 1`; `'path:mood_nudge'` tối đa `tier = 2` (chỉ lên Tầng 3 khi bé chủ động chạm pet → `pet_tap`).
- **Chống lặp câu:** cùng `speech.id` bị khoá **7 ngày** (`REPEAT_BLOCK_MS`); cùng `event` không chọn 2 lần liên tiếp cùng 1 id.

---

## 5. Kho câu thoại (LineDB)

### 5.1 Cấu trúc bản ghi câu thoại

Mỗi bản ghi trong `src/data/pet-lines/*.js`:
```js
{
  id: 'cowdi.correct.first.01',
  event: 'answer_correct',
  when: {
    screen: ['lesson'],
    mood: ['happy', 'sad', 'sick'],
    stageMin: 1, stageMax: 5,
    bondMin: 0,
    group: ['farm'],
    night: false,
    needs: ['word', 'meaning'],
    daysAwayMin: 1, daysAwayMax: 3,
    streak: 5,
    perfect: true,
  },
  vi: 'Đúng rồi! {word} = {meaning}.',
  en: '{word}',
  thought: null,
  cta: null,
  weight: 1,
}
```

Biến hỗ trợ: `{petName}`, `{word}`, `{meaning}`, `{lessonTitle}`, `{streak}`, `{lessonsToday}`, `{score}`, `{total}`, `{daysAway}`. Nếu câu yêu cầu biến trong `when.needs` (hoặc có `{var}` trong `vi`/`en`) mà ngữ cảnh/payload thiếu giá trị hợp lệ → **bỏ qua câu đó**, không bao giờ in nguyên `{word}` ra màn hình.

### 5.2 Chỉ tiêu số lượng theo giai đoạn

| `event` | Giai đoạn 1 (`common.js`) | Giai đoạn 2 (`cowdi.js` riêng) |
|---|---|---|
| `answer_correct` | 8 | ≥ 30 |
| `answer_wrong` | 8 | ≥ 30 |
| `streak` (`3/5/10`) | 6 | ≥ 15 |
| `lesson_done` (thường / trọn điểm) | 6 | ≥ 20 |
| `app_open` (`0` / `1–3` / `≥4` ngày / đêm) | 8 | ≥ 25 |
| `mood_nudge` (`sad` / `sick`) | 4 | ≥ 20 |
| `page_tip` (4 màn có pet: `lesson`, `path`, `home`, `pet`) | 1/màn (4) | ≥ 2/màn (≥ 8) |
| `pet_tap` (theo mood, mốc gắn bó, đêm) | 6 | ≥ 60 |
| `skill_level_up`, `evolve_ok`, `feed` | 3 mỗi loại (9) | ≥ 10 mỗi loại (≥ 30) |
| **Tổng tối thiểu** | **59 câu** (đã có trong `starter/`) | **~240–300 câu** |

### 5.3 Chuẩn giọng văn (kiểm định tự động bằng `lines.test.mjs`)

- Xưng `{petName}` / `"mình"`, gọi người học là `"bạn"`. Dùng `"nha"`, `"nè"` vừa phải.
- Khen cụ thể theo từ / chuỗi đúng / số bài hôm nay.
- Khi sai: tuyệt đối không nói `"sai rồi"`; dùng `"Gần đúng rồi!"`, `"Thử lại nha!"` kèm nghĩa đúng nếu có.
- `mood === 'sad'`: nhẹ nhàng mời học (`"{petName} hơi buồn chán, học chung 1 bài nha?"`).
- `mood === 'sick'`: tích cực (`"{petName} hơi mệt, xong 1 bài là khoẻ lại!"`). **Cấm** toàn bộ `BANNED_PHRASES`.
- Tối đa 1 emoji mỗi câu, không đặt emoji ở đầu câu. Từ tiếng Anh trong `vi` luôn kèm nghĩa tiếng Việt.
- **Lưu ý GĐ2 cho `common.js`:** Chuyển các câu chứa âm thanh đặc trưng bò (`"Moo~"`) sang `cowdi.js` để `common.js` hoàn toàn trung tính cho cả 22+ loài pet khác (Foxie, Leafy, Bamboo, Ginseng, Monk…).

---

## 6. Thành phần giao diện

Dùng token màu & font từ `src/styles/styles.css` (`--leaf #7DBE4B`, `--leaf-dark #5E9A35`, `--leaf-light #DDF1C8`, `--leaf-pale #EEF8E4`, `--ink #3B4A5C`, `--ink-soft #5F6E80`, `--paper-line #BFDBEF`). Bong bóng và thẻ pet dùng `font-family: 'Mali', cursive` (đủ dấu tiếng Việt, không dùng `Patrick Hand`).

### 6.1 `<PetStage>` — Sân khấu trong bài học & luyện tập (thay `.study-pet-dock`)

- **Chế độ `standard`** (mặc định ở bước học từ/flashcard/ngữ pháp/đọc/PictureLesson): cao `156px` mobile / `184px` desktop (tối đa `200px`), bo góc `22px`, nền `--leaf-light`, viền `2px solid #CFE8B6`, dải cỏ cong `#A9D97A` cao `44px` ở đáy.
- **Chế độ `compact`** (tự bật khi đang ở Quiz `.quiz-viewport-stage` hoặc màn hình thấp `max-height: 760px` để **bảo toàn Zero-Scroll Quiz** theo `SDD-PET-MANAGEMENT-v1.0`): cao `112px` mobile / `128px` desktop, dải cỏ cao `30px`, avatar gọn `96–112px`.
- Bên trái: `<PetAvatar mode={finished ? 'home' : 'lesson'} canvasBubble={false} />` đứng trên dải cỏ.
- Bên phải (chiếm sẵn vùng rộng tối đa `60%` thẻ → **layout không nhảy (CLS = 0)** khi bong bóng xuất hiện/ẩn):
  - Khi có `speech`: hiện `<PetSpeech placement="right" />` (đuôi chỉ về pet).
  - Khi không có `speech`: hiện dòng phụ nhạt (tên bài + bước hiện tại, thay cho `.study-pet-hint`).
- Góc trên phải: chip chuỗi đúng `"{n} câu liền"` khi `streak >= 2`.
- Giữ mount xuyên suốt giữa các tab bài học, quiz và màn kết quả để `PetRig` không tải lại.
- Không có bất kỳ phần tử `position: fixed` nào của pet trên màn bài học.

### 6.2 `<PathPet>` — Pet trên bản đồ Lộ trình (Giai đoạn 2)

- Thay `<img className="path-mascot">` tại node `current` trong `LearningPathPage.jsx` bằng `<PathPet>`:
  - Render `<PetAvatar mode="home" canvasBubble={false} />` kích thước `90×90` desktop (`72×72` mobile `≤575px`), bỏ `pointer-events: none` cũ và bỏ `transform: scaleX(-1)` đè chữ/bóng (chỉ lật canvas nếu cần hướng về node).
  - Đặt `<PetThought>` (Tầng 2) nổi gọn ngay phía trên đầu pet, tránh va chạm `.path-node-tip` và dải avatar bạn bè `FR-MAP-04` bên dưới node.
- Khi bé chạm pet (`onClip('tap')` → `dispatch('pet_tap')`) hoặc khi `app_open` / `mood_nudge` hợp lệ mở thẻ:
  - Hiện **Thẻ hành động (`PathPetCard`)** ở đáy vùng bản đồ (phía trên bottom nav, `position: sticky` trong vùng bản đồ hoặc neo trong container `.path-page` — không đè lên bottom nav): 1 câu thoại Mali + nút **`Học tiếp`** (điều hướng đúng bài/checkpoint `current`) + nút **`Để sau`**. Nút `"Nói chuyện"` **ẩn** ở GĐ1–2.
  - Đóng thẻ khi: bấm `"Để sau"`, chạm ra ngoài, cuộn bản đồ (`scroll`), hoặc hết `ttlMs`.

### 6.3 `<PetSpeech>` & `<PetThought>`

- **`<PetSpeech>`:**
  - Nền `#fff`, viền `2px solid #CFE8B6`, bo góc `16px` (góc gần pet bo `4px`), bóng `0 4px 10px rgba(59,74,92,0.12)`, **không xoay**.
  - Chữ `Mali` `14–15px`, `line-height: 1.4`, tối đa 3 dòng (`-webkit-line-clamp: 3`).
  - Hiệu ứng hiện: fade + trượt `6px` trong `180ms`; `prefers-reduced-motion`: chỉ fade.
  - Nút **Nghe** (`30×30px`, icon loa SVG): chỉ hiện khi `speech.en` có giá trị, gọi hàm TTS đang dùng.
  - Nút **Đóng**: chỉ hiện khi có `cta`, vùng chạm `≥ 44×44px`, `aria-label="Đóng"`.
  - Truy cập: `role="status"`, `aria-live="polite"`.
- **`<PetThought>`:**
  - Hình tròn trắng `50px` + chấm tròn `10px` nối về đầu pet, chứa 1 icon SVG nét `26px` màu `--leaf-dark` (`book`, `milk`, `trophy`, `zzz`, `heart`, `question`, `music`). Tự ẩn sau `6000ms`; mỗi icon tối đa 1 lần/phiên.

---

## 7. Ánh xạ tích hợp từng màn hình

| Màn hình | Route thật | Slot | GĐ1 | GĐ2 |
|---|---|---|---|---|
| `src/App.jsx` | Toàn app | — | Bọc `<PetDirectorProvider>`, gỡ `<CowdiChat />` | — |
| `src/features/lesson/LessonDetailPage.jsx` | `/lessons/:id` | `lesson` | Thay `petDock` bằng `<PetStage>`, chuyển 15+ chỗ `emit` → `dispatch` (truyền `word`/`meaning`, bỏ text cứng ở `lesson_done`) | Dùng kho câu `cowdi.js` |
| `src/features/lesson/PictureLesson.jsx` | `/lessons/:id` (Starter) | `lesson` | Chuyển 6 chỗ `petRef.current.emit` sang callback/Director kèm `{ word, meaning }` | Dùng kho câu `cowdi.js` |
| `src/features/practice/PracticePage.jsx` | `/practice` | `lesson` | Thay `petDock` bằng `<PetStage>`, chuyển toàn bộ `emit` → `dispatch` | Dùng kho câu `cowdi.js` |
| `src/pages/LearningPathPage.jsx` | `/`, `/learning-path` | `path` | Gửi `app_open` + `screen_enter({ screen: 'path' })` | Thay `path-mascot` bằng `<PathPet>` + thẻ hành động |
| `src/pages/HomePage.jsx` | `/overview` | `home` | Giữ ổn định | Chuyển `app_open` & 2 avatar sang Director |
| `src/features/pet/PetPage.jsx` | `/pet` | `pet` | Giữ ổn định | Chuyển `feed`, `pet_tap`, `evolve_ok` sang Director; thay `.pet-speech-bubble` cũ bằng `<PetSpeech>` |
| `src/features/duel/DuelPage.jsx` | `/duel` | `battle` | Giữ ổn định | Chuyển `battle_*` sang Director (luôn Tầng 1, không chữ) |
| `src/admin/pet-motion/StudyPreviewTab.jsx` | `/admin/pet-motion?view=preview` | — | Giữ nguyên `canvasBubble` mặc định `true` (hoặc không ảnh hưởng) | (Tuỳ chọn) Thêm toggle xem thử Pet Director |
| Các trang khác (`Shop`, `Account`, `Friends`, `Leaderboard`…) | — | — | Không có pet nổi, không có bong bóng | Như GĐ1 |

---

## 8. Lưu trữ cục bộ (`src/pet-director/storage.js`)

Lưu trên `localStorage`, phân tách theo `userId` (`cowdi.dir.<userId>.<key>`), bọc mọi thao tác trong `try/catch`:

| Khoá | Nội dung | Thời hạn |
|---|---|---|
| `seenTips` | `{ [screen]: true }` | Vĩnh viễn |
| `recentLines` | `{ [lineId]: timestampMs }` | Dọn mục cũ hơn 7 ngày mỗi lần đọc |
| `session` | `{ id, startedAt, lastActiveAt, moodNudged, appOpened, lastSpeechAt, shownThoughts }` | Reset phiên mới khi vắng `> 30 phút` |
| `seenWords` | `{ lessonId, words: string[] }` | Xoá/đổi mới khi chuyển `lessonId` |

Không gửi dữ liệu trạng thái Director lên server ở GĐ1–2.

---

## 9. Mở rộng tối thiểu trong `PetRig` & `PetAvatar`

1. `PetRig.js`:
   - Thêm option `canvasBubble: true` trong `constructor`.
   - Trong `say(text, ms)`: `if (!this.o.canvasBubble || !this.hasApprovedStage()) return;`.
   - Đổi câu mặc định trong `emit('app_open')` (dòng 417) từ `'Nhớ bạn quá!'` → `'Mừng bạn quay lại!'` để tuân thủ P3 ngay cả khi `canvasBubble` bật ở nơi khác.
   - Trong `_bindPointer()` (`up`): hỗ trợ chạm nhẹ ở `mode === 'lesson'` (phát `tap_head`/`tap_body` nếu có hoặc gọi `onClip('tap', curClip)`) tương tự `mode === 'home'`, không kéo thả trong `lesson`.
2. `PetAvatar.jsx`:
   - Thêm prop `canvasBubble = true`, truyền vào `new PetRig(...)` và đồng bộ qua `useEffect`.
   - Trên fallback `<img>` (khi `!stageApproved`): thêm `onClick` gọi `onClip?.('tap', null)` (chỉ khi `onClip` được truyền, thêm `cursor: 'pointer'` và `role="button"`/`tabIndex={0}` hợp lý khi có tương tác) để pet chưa duyệt rig vẫn tương tác đầy đủ với Director.
3. `src/pet-rig/pet-rig.test.mjs`:
   - Bổ sung test: khi `canvasBubble: false`, gọi `emit('answer_wrong', { text: 'abc' })`, `emit('lesson_done', { text: 'ok' })`, `emit('pet_speak_start', { text: 'hi' })`, `say('x')` đều giữ `rig.bubble === null`.

---

## 10. Kiểm định & Nghiệm thu

- Chạy `npm test` (đã thêm `"src/pet-director/*.test.mjs"` vào `package.json`): 100% test cũ (152+) và test mới (`lines.test.mjs`, `pet-director.test.mjs`, `pet-rig.test.mjs`) đều PASS.
- Chạy `npm run build` (gồm `prebuild` validate bài học) thành công, 0 lỗi.
- Checklist nghiệm thu chi tiết từng gói xem tại [TASK-PET-DIRECTOR.md](../05-implementation/TASK-PET-DIRECTOR.md).

---

## 11. Giữ chỗ cho Giai đoạn 3 (AI Chat — chưa triển khai)

- `Decision.speech.cta.action` dự phòng sẵn giá trị `'open_talk'` (không dùng ở GĐ1–2).
- `PetDirector.prototype.beginConversation()` trả về `Promise.reject(new Error('not_enabled'))`.
- Không tạo UI hay API cho hội thoại AI ở bản v1.1.
