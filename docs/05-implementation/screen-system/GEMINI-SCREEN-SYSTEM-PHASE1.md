# GEMINI — Hệ thống màn, Đợt 1: registry, bộ trộn 6 màn, bọc màn Tập trung, T-08 Viết câu

> Giao cho: Gemini · Viết: Claude, 2026-11-27 (v1.1: sửa luật dự phòng khi bài thiếu dữ liệu, mục 4.2) · Chuẩn gốc: `STD-SCREEN-SYSTEM-v1.0.md` (đọc trước).
> Liên quan: `STD-LEARNING-UX-v1.0.md` (P0 ngân sách thao tác, P1 không cuộn, P4 pet), `PET-DIRECTOR-INTEGRATION.md` (§4 API `dispatch`), `GEMINI-FLASHCARD-AUDIO-UX.md` F3 (`wordProgress`), `GEMINI-LEARNING-GROUPS.md` (nhóm học, `lessonPassRate`, `pretest`), `AUDIT-LEARNING-UX-2026-11-27.md` (A1–A3 chấm điểm).
> Nhánh: `feat/screen-system-p1`. **Không merge khi chưa có Sonny duyệt.**

---

## 0. Mục tiêu và phạm vi

**Mục tiêu:** bài học của nhóm Trung bình và Luyện thi chạy theo **6 màn** (Màn 1 Gặp từ · 4 màn kỹ năng xáo thứ tự · Màn 6 Boss) bằng **các màn đang có**, qua một registry và một bộ trộn dùng lại được cho màn Thân thiện ở các đợt sau.

| Làm trong đợt này | Không làm (đợt sau) |
|---|---|
| Registry màn + `canRun` có lý do thiếu | Màn F-xx (Thân thiện) — Đợt 3, 4 |
| Bộ trộn thuần JS + test | Trang admin `/admin/screens` — Đợt 2 |
| Tách 6 màn T có sẵn ra component riêng, **giữ nguyên giao diện** | Bảng server `screen_config`, `screen_testers` — Đợt 2 |
| Màn mới **T-08 Viết câu** | Kho câu dẫn theo vùng, luật không lặp 10 ải — Đợt 3 |
| T-03 Ngữ pháp → mẹo pet + bottom sheet "Xem ngữ pháp" | Đổi công thức Sữa / sao |
| `ScreenHost`: thanh vòng kỹ năng, màn chuyển, sự kiện chung | Nhóm Mới học (giữ `PictureLesson` như cũ) |
| Bật/tắt bằng cờ `screenSystemV1` | Khách quen, 4 chấm của từ — Đợt 3 |

---

## Bước 0 — Kiểm tra trước khi code (bắt buộc, ghi kết quả vào PR)

1. AUDIT ghi rằng bản đang chạy có thể build từ nhánh khác `main` (`feat/flashcard-audio-ux`). Xác định nhánh nền. Nếu `feat/flashcard-audio-ux` chưa merge, **dựng nhánh này trên nó** và ghi rõ.
2. Kiểm xem A1–A3 (gộp chấm điểm vào `utils/speech.js`) đã merge chưa. T-06 và chấm gõ của T-08 dùng module này. Nếu chưa, làm A1–A3 trước trong một PR riêng.
3. Liệt kê trong PR: các hàm render từng tab trong `LessonDetailPage.jsx` (vocab, flashcard, grammar, reading, listen, speak, quiz), dòng bắt đầu và kết thúc, state mà mỗi tab dùng chung. Đây là bản đồ để tách ở mục 3.
4. Kiểm `wordProgress.js` (F3) đã có chưa. Nếu chưa, dùng hàm rỗng `recordWord(wordId, kind)` và ghi TODO; không tự viết lại F3 trong PR này.
5. **Chạy `canRun` của mọi màn trên toàn bộ bài** (script `scripts/report-screen-coverage.mjs`, xuất `docs/06-verification-validation/RPT-SCREEN-COVERAGE-<ngày>.md`): mỗi bài × mỗi màn ✓/✗ + trường thiếu; cuối báo cáo liệt kê **bài có slot không còn màn nào chạy được**. Báo cáo này dùng lại ở Đợt 2–4.

---

## 1. Cấu trúc file

```
src/features/lesson/screens/
  registry.js           // danh mục màn: code, level, slot, canRun, Component
  items.js              // listenItems, speakItems, writeItems, bossItems (dùng chung canRun + component)
  mixer.js              // mixLesson(): thuần JS, không import React
  seededRandom.js       // mulberry32(seed) + hashString()
  mixer.test.mjs        // node --test
  ScreenHost.jsx        // chạy chuỗi màn, header vòng kỹ năng, màn chuyển, kết thúc bài
  RouteHeader.jsx       // thanh vòng kỹ năng (Focus header)
  ScreenIntro.jsx       // màn chuyển 1,5–3 giây
  screenEvents.js       // useScreenEvents(): nối Pet Director + wordProgress + kết quả
  GrammarSheet.jsx      // bottom sheet "Xem ngữ pháp" (thay T-03)
  focus/
    T01Vocab.jsx  T02Flashcard.jsx  T04Reading.jsx
    T05Listen.jsx T06Speak.jsx      T07Quiz.jsx
    T08WriteSentence.jsx            // MỚI
src/data/config/screens.js          // cấu hình tĩnh đợt 1 (Đợt 2 chuyển lên server, file này thành dự phòng)
scripts/report-screen-coverage.mjs
```

---

## 2. Registry

```js
// registry.js
export const SLOTS = ['intro', 'listen', 'speak', 'read', 'write', 'boss'];

export const SCREENS = [
  { code: 'T-01', name: 'Từ vựng',   level: 'focus', slot: 'intro',  canRun: (l) => need(l.vocabulary?.length >= 4, 'vocabulary ≥ 4'), Component: T01Vocab },
  { code: 'T-02', name: 'Flashcard', level: 'focus', slot: 'intro',  canRun: (l) => need(l.vocabulary?.length >= 4, 'vocabulary ≥ 4'), Component: T02Flashcard },
  { code: 'T-04', name: 'Đoạn văn',  level: 'focus', slot: 'read',   canRun: (l) => need(!!l.reading?.passage, 'reading.passage'), Component: T04Reading },
  { code: 'T-05', name: 'Nghe câu',  level: 'focus', slot: 'listen', canRun: (l) => need(listenItems(l).length >= 3, 'câu nghe ≥ 3'), Component: T05Listen },
  { code: 'T-06', name: 'Nói theo',  level: 'focus', slot: 'speak',  canRun: (l) => need(speakItems(l).length >= 3, 'câu nói ≥ 3'), Component: T06Speak },
  { code: 'T-07', name: 'Quiz',      level: 'focus', slot: 'boss',   canRun: () => ok(), Component: T07Quiz }, // quiz tự sinh được
  { code: 'T-08', name: 'Viết câu',  level: 'focus', slot: 'write',  canRun: (l) => need(writeItems(l).length >= 3, 'câu 3–8 từ ≥ 3'), Component: T08WriteSentence },
];
// T-03 không có trong SCREENS: không chiếm vị trí (STD Q10).

const ok = () => ({ ok: true, missing: [] });
const need = (cond, label) => (cond ? ok() : { ok: false, missing: [label] });
export const getScreen = (code) => SCREENS.find((s) => s.code === code);
```

- `listenItems`, `speakItems`, `writeItems`, `bossItems`: **tách từ logic đang có** trong `LessonDetailPage` (Nghe câu lấy ví dụ ngữ pháp ≥2 từ; Nói theo lấy `vocabulary[].example` + ví dụ ngữ pháp; Boss dùng `generateQuizFromLesson`). Đặt trong `screens/items.js`, dùng chung cho `canRun` và component để hai nơi không lệch nhau.
- Mỗi component màn nhận đúng props: `{ lesson, group, items, onEvent, onDone, sandbox }`. Không đọc state toàn trang. `sandbox` (mặc định `false`) để trang admin Đợt 2 xem trước mà không ghi dữ liệu.

---

## 3. Tách 6 màn T (giữ nguyên giao diện)

- **Di chuyển code, không viết lại.** Mỗi tab trong `LessonDetailPage` thành một component `focus/T0x*.jsx`. Giao diện, chữ, CSS giữ như cũ, trừ các điểm ghi dưới.
- Bỏ khỏi từng màn: nút "Hoàn thành → …", tab chế độ, tab Nhóm 1/2 (STD-LEARNING-UX P0, P3). Khi màn xong, gọi `onDone(result)`.
- Điều kiện "xong màn":

| Màn | Xong khi |
|---|---|
| T-01 Từ vựng | đã trình chiếu/nghe hết từ (mỗi từ ≥ 1 lần) |
| T-02 Flashcard | đã vuốt hết thẻ một lượt; thẻ "chưa nhớ" quay lại tối đa 1 lần |
| T-04 Đoạn văn | trả lời hết câu hỏi hiểu bài |
| T-05 Nghe câu | hết câu (tối đa 6 câu) |
| T-06 Nói theo | hết câu (tối đa 4 câu), hoặc từ chối mic (chuyển "nghe và nhắc lại", không chấm) |
| T-07 Quiz | hết câu → kết thúc bài (mục 6) |

- `LessonDetailPage`: khi cờ bật và nhóm ≠ `beginner`, render `<ScreenHost lesson group />` thay cho khu tab. Cờ tắt thì chạy y như cũ. **Không xoá code cũ trong đợt này.**
- Nhóm Luyện thi có `pretest`: giữ màn "Làm thử trước" như hiện tại. Chọn "Học từ đầu" thì vào `ScreenHost`.

---

## 4. Bộ trộn

### 4.1 Hợp đồng

```js
// mixer.js
export function mixLesson({ lesson, group, lastMix = {}, config, isTester = false, registry = SCREENS, seed }) {
  // → { screens: [{ slot, code }], order: ['intro', …, 'boss'], skipped: ['read'?], log: [...] }
}
```

- Thuần JS, không đọc `localStorage`, không `Math.random()`. Ngẫu nhiên lấy từ `mulberry32(seed)`.
- `seed` khi học thật: `hashString(userId + ':' + lessonId + ':' + attemptNo)`. Làm lại bài thì `attemptNo + 1` → xáo mới (STD 3.1.4).
- `registry` truyền vào được để test bằng registry giả.
- `log`: mảng chuỗi giải thích từng bước chọn (trang admin Đợt 2 hiển thị "vì sao chọn màn này").

### 4.2 Thuật toán

```
1. order = ['intro', ...hoán vị(listen, speak, read, write), 'boss']
   nếu order[1] === 'speak' → đổi chỗ speak với một vị trí ngẫu nhiên trong 2..4
2. với mỗi slot trong order:
     ứng viên = registry lọc slot,
                status ∈ ('on') hoặc ('on','test') nếu isTester,
                canRun(lesson).ok
     nếu > 1 ứng viên: bỏ ứng viên có code === lastMix[slot]
     trọng số = config.weights[group][level của màn]   // focus | friendly
     nếu tổng trọng số = 0 → chọn đều
     chọn theo trọng số bằng rng
     nếu không còn ứng viên:
        slot là 'intro' hoặc 'boss' → dùng T-01 / T-07 (luôn chạy được; log "fallback")
        slot kỹ năng → BỎ QUA slot này: không đưa vào screens, thêm vào skipped, log "skip: <lý do thiếu>"
3. Ràng buộc nhóm (STD 3.3):
     intermediate: các màn giữa phải có ≥1 friendly và ≥1 focus — chỉ áp khi có slot đủ ứng viên của mức thiếu;
                   nếu vi phạm, chọn lại slot có nhiều ứng viên nhất, ép mức thiếu.
     exam: boss = 'T-07'.
4. Sau khi bỏ slot, nếu order[1] trở thành 'speak' → đổi speak với slot kỹ năng kế tiếp (nếu có).
```

- Bài có slot bị bỏ chạy **5 màn** (hiếm khi 4). Không chặn bài, không báo lỗi cho người học. Trang admin Đợt 2 liệt kê các bài này để bổ sung nội dung.
- Đợt 1 chưa có màn friendly nên ràng buộc "≥1 friendly" tự bỏ qua (ghi `log`).

### 4.3 Cấu hình tĩnh

```js
// src/data/config/screens.js
export const SCREEN_CONFIG = {
  status: { 'T-01': 'on', 'T-02': 'on', 'T-04': 'on', 'T-05': 'on', 'T-06': 'on', 'T-07': 'on', 'T-08': 'on' },
  weights: {
    beginner:     { friendly: 1.0,  focus: 0.0  },
    intermediate: { friendly: 0.5,  focus: 0.5  },
    exam:         { friendly: 0.25, focus: 0.75 },
  },
};
```

### 4.4 Test bắt buộc (`node --test`)

| # | Kiểm |
|---|---|
| M1 | 1 000 seed × 3 bài golden: màn đầu slot `intro`, màn cuối slot `boss`, các màn giữa không trùng kỹ năng, đủ 4 kỹ năng khi bài đủ dữ liệu |
| M2 | Không seed nào cho màn thứ 2 là `speak` (kể cả khi có slot bị bỏ) |
| M3 | Cùng input + cùng seed → cùng kết quả |
| M4 | `lastMix` được tôn trọng khi slot có ≥ 2 ứng viên (registry giả có 2 màn/slot) |
| M5 | Trọng số: registry giả, nhóm `exam`, 10 000 seed → tỉ lệ focus 72–78% |
| M6 | Bài thiếu `reading` → slot `read` nằm trong `skipped`, `screens` có 5 màn, `log` có "skip", không ném lỗi |
| M7 | Ràng buộc intermediate với registry giả có cả hai mức: 1 000 seed đều có ≥1 focus và ≥1 friendly ở các màn giữa |
| M8 | Nhóm `exam` → boss luôn `T-07` |
| M9 | Màn trạng thái `test`: không bao giờ được chọn khi `isTester = false`; được chọn khi `true` |

---

## 5. ScreenHost, header, màn chuyển, sự kiện

### 5.1 ScreenHost

- Gọi `mixLesson` **một lần** khi vào bài (lưu vào state + `sessionStorage` theo `lessonId`, để xoay màn hình hay tải lại trang không xáo lại giữa chừng).
- Chạy lần lượt: `ScreenIntro` → màn → `ScreenIntro` → … → Boss → kết thúc.
- Thoát giữa bài (✕): hộp xác nhận trong app (không `window.confirm`). Vào lại: tiếp từ màn đang dở, cùng thứ tự.
- Layout theo STD-LEARNING-UX P1: `height:100dvh; display:grid; grid-template-rows:auto 1fr auto`; ẩn header tiền tệ, bottom nav, nút "Mời bạn". **Không cuộn cấp trang.**
- Prop `sandbox`: truyền xuống mọi màn và `useScreenEvents` (Đợt 2 dùng).

### 5.2 RouteHeader (vòng kỹ năng)

Theo canvas "Thiết kế chính · trộn màn": ✕ · một vòng tròn biểu tượng kỹ năng cho **mỗi màn trong `screens`** (thường 6, có thể 5) theo đúng thứ tự · ⏸.

| Trạng thái vòng | Hiển thị |
|---|---|
| đã xong | nền màu kỹ năng, mờ 50% |
| đang học | nền màu kỹ năng, viền trắng + vòng ngoài cùng màu, lớn hơn |
| chưa tới | nền trắng, viền màu kỹ năng |

Màu: Gặp từ `#E9A400` · Nghe `#2F7FD1` · Đọc `#B26B00` · Viết `#6D4FC2` · Nói `#C43D7A` · Boss `#4A3420`. Mỗi vòng có `aria-label` ("Màn 3, Nghe, đang học"). Dưới header: nhãn kỹ năng + "Màn x/n".

### 5.3 ScreenIntro (tạm thời cho Đợt 1)

- Hiện 1,5 giây (Mới học 3 giây): biểu tượng kỹ năng + tên màn + **1 dòng luật chơi cố định theo mã màn** + pet nói 1 câu.
- Câu của pet: gọi `dispatch('screen_enter', { screen: code, slot })`. Thêm loại câu `screen_intro` vào LineDB với **≥ 4 câu chung cho mỗi slot** để không lặp liền nhau (chống lặp của `lineSelector` đã có).
- Chạm màn hình = bỏ qua. Đợt 3 thay bằng kho câu dẫn theo vùng, không lặp 10 ải (STD 4.2).

### 5.4 Sự kiện chung — `useScreenEvents`

Mọi màn chỉ gọi `onEvent(type, payload)`. ScreenHost chuyển tiếp:

| `type` | payload | Chuyển tới |
|---|---|---|
| `item_shown` | `{ itemId, wordIds }` | `dispatch('question_shown')`; `recordWord(id, 'seen')` |
| `item_correct` | `{ itemId, wordIds, firstTry }` | `dispatch('answer_correct', { word, meaning })`; `recordWord(id, 'correct')`; đếm chuỗi → `dispatch('streak', { count })` ở 3/5/10 |
| `item_wrong` | `{ itemId, wordIds, correct }` | `dispatch('answer_wrong', …)`; `recordWord(id, 'wrong')` |
| `mic_start` / `mic_end` | — | `dispatch` cùng tên |
| `screen_done` | `{ code, slot, total, firstTryCorrect, durationMs }` | ghi `attempt.screens[]` |

- `sandbox = true`: vẫn `dispatch` cho pet, **không** gọi `recordWord`, không cộng điểm kỹ năng, không ghi `attempt`.
- Điểm kỹ năng `pet.skills`: **giữ cách cộng hiện có** của từng tab; chỉ chuyển lời gọi vào `useScreenEvents` để một chỗ quản lý. Không đổi lượng điểm.

---

## 6. Kết thúc bài

- **Qua bài** dựa trên màn Boss, giữ công thức trong `GEMINI-LEARNING-GROUPS.md` §4.2 (`lessonPassRate`, Sữa lần đầu / làm lại). **Không** đổi công thức Sữa trong đợt này; sao và Sữa theo sao làm ở Đợt 3 (STD 3.5). Đợt 1 chỉ cần ghi đủ `results[].firstTryCorrect` để Đợt 3 tính sao.
- Ghi lần học:

```js
userData.lessonMixLog = [ // giữ 30 lần gần nhất
  { lessonId, at, seed, order, screens: ['T-01','T-08','T-05','T-06','T-04','T-07'], skipped: [],
    results: [{ code, total, firstTryCorrect, durationMs }], passed }
]
userData.lastMix = { intro: 'T-01', listen: 'T-05', speak: 'T-06', read: 'T-04', write: 'T-08', boss: 'T-07' }
```

- Thêm `lessonMixLog`, `lastMix` vào whitelist `PUT /api/progress` + migration cột `LONGTEXT` JSON (theo cách `migrate-learning-groups.sql`). Server gộp `lessonMixLog` theo `(lessonId, at)`, cắt còn 30; `lastMix` lấy bản mới nhất theo `at`.
- Màn tổng kết hiện có giữ nguyên; thêm hàng vòng kỹ năng (màu theo kết quả: xanh nếu `firstTryCorrect/total ≥ 0,8`, vàng nếu ≥ 0,5, cam nếu thấp hơn). Màn tổng kết mới theo canvas làm ở Đợt 3.

---

## 7. T-03 Ngữ pháp → mẹo pet + "Xem ngữ pháp"

- Bỏ bước Ngữ pháp khỏi luồng khi cờ bật.
- **Mẹo pet** ở đầu T-08 (và câu sai trong T-08): lấy `grammar[i].mistakes[0]` → "Không nói “{wrong}”, nói “{right}”." Không có `mistakes` thì lấy câu đầu của `grammar[i].explanation`, cắt ≤ 80 ký tự tại ranh giới từ.
- Nút **"Xem ngữ pháp"** (icon sách, 44px) ở góc phải nhãn màn T-08 và trên màn tổng kết → `GrammarSheet`: bottom sheet, mỗi điểm ngữ pháp một thẻ (`title`, `explanation`, 2 ví dụ đầu, `mistakes`), **cuộn bên trong sheet**, nền chặn chạm. Đóng bằng vuốt xuống hoặc ✕.

---

## 8. T-08 Viết câu (màn mới)

### 8.1 Nguồn câu (`writeItems`)

1. Ví dụ ngữ pháp `grammar[].examples[]` có `en` 3–8 từ và có `vi`.
2. Thiếu thì thêm `vocabulary[].example` 3–8 từ có `exampleVi` (bỏ câu template, xem AUDIT A5).
3. Lấy **4 câu**, ưu tiên câu chứa nhiều từ của bài; không trùng câu.

### 8.2 Hai kiểu làm

| Kiểu | Khi nào | Thao tác |
|---|---|---|
| **Xếp câu** | mặc định | Hiện câu tiếng Việt. Thẻ từ tiếng Anh xáo + **2 từ nhiễu** cùng bài. Chạm thẻ → bay lên dòng trả lời; chạm thẻ trên dòng → trả về. Đủ số từ thì tự chấm (không cần nút) |
| **Gõ câu** | nhóm `exam`, hoặc câu thứ 4 với nhóm `intermediate` | Ô nhập 1 dòng, nút "Kiểm tra" (thao tác học, không phải vận hành) |

- Dấu câu cuối câu không tính khi chấm xếp câu; thẻ từ không mang dấu câu cuối.
- Chấm gõ: chuẩn hoá bằng `utils/speech.js` (sau A1). Chấp nhận dạng rút gọn tương đương: `I'm`↔`I am`, `don't`↔`do not`, `it's`↔`it is`, `you're`↔`you are`, `can't`↔`cannot`. Sai 1 ký tự trong từ ≥ 5 chữ: tính đúng nhưng pet nhắc chính tả.
- Đúng: tô xanh, pet khen, tự sang câu sau sau 1,2 giây.
- Sai: dòng trả lời hiện câu đúng, từ sai tô cam; pet nói mẹo (mục 7); chờ **1 chạm** "Tiếp". Câu sai quay lại cuối màn **một lần**.

### 8.3 Bố cục (không cuộn, 360×640 vẫn vừa)

```
[RouteHeader 56]
[Nhãn: VIẾT · Viết câu · Màn x/n ........ (Xem ngữ pháp)]
[Câu tiếng Việt 1–2 dòng + nút loa (đọc câu tiếng Anh, chỉ sau khi trả lời)]
[Dòng trả lời: cao tối thiểu 2 hàng thẻ]
[Kho thẻ từ: flex-wrap, thẻ cao 48px]
[Pet nhỏ + bong bóng (vùng phản hồi cao cố định 64px)]
```

Mẫu giao diện tham khảo: canvas trang "Chế độ người lớn (không dùng)", màn E; bỏ thẻ ngữ pháp to ở đầu màn vì đã chuyển thành mẹo pet.

---

## 9. Cờ bật tắt

- `screenSystemV1`: đọc theo thứ tự `localStorage.cowdi_ff_screenSystemV1` → biến môi trường `VITE_FF_SCREEN_SYSTEM_V1` → mặc định `false`.
- Thêm vào trang Cài đặt mục ẩn (chạm logo 5 lần) để bật thử trên máy thật.

---

## 10. Definition of Done

- [ ] Bước 0 có kết quả trong PR, kèm `RPT-SCREEN-COVERAGE-<ngày>.md`
- [ ] `node --test` chạy qua M1–M9
- [ ] Cờ tắt: bài học chạy **giống hệt** trước (so sánh 3 bài golden: số bước, điểm, Sữa)
- [ ] Cờ bật, nhóm Trung bình và Luyện thi: 6 màn (5 nếu bài thiếu dữ liệu), thứ tự đổi khi làm lại, màn 2 không bao giờ là Nói
- [ ] 360×640 và 800×1280: mỗi màn, kể cả T-08 và `GrammarSheet` đóng, **không cuộn cấp trang**
- [ ] Không còn nút "Hoàn thành", tab chế độ, tab Nhóm trong luồng mới; PR ghi số chạm vận hành mỗi màn trước/sau
- [ ] Từ chối mic ở T-06 vẫn đi tiếp được; tắt tiếng thiết bị vẫn học được
- [ ] Pet phản ứng ở `screen_enter`, đúng, sai, chuỗi trong **cả 7 màn**
- [ ] Tải lại trang giữa bài: quay lại đúng màn, đúng thứ tự
- [ ] `lessonMixLog`, `lastMix` đồng bộ lên server và đọc lại được trên máy khác
- [ ] Nhóm Mới học không bị ảnh hưởng

## 11. Không được làm

- Không viết lại giao diện các màn T (chỉ tách và bỏ nút vận hành).
- Không đổi công thức Sữa, Gem, Đá, điểm kỹ năng pet.
- Không thêm thư viện game hay thư viện ngẫu nhiên.
- Không dùng `Math.random()` trong `mixer.js`.
- Không xoá code tab cũ trong `LessonDetailPage` (xoá ở Đợt 4, mục dọn dẹp).

## 12. Khi tài liệu không khớp code

Dừng, ghi rõ chỗ lệch và đề xuất trong PR, không tự đoán.
