# GEMINI — Hệ thống màn, Đợt 3: 5 màn Thân thiện đầu tiên, dẫn nhập không lặp, khách quen, 4 chấm của từ

> Giao cho: Gemini · Viết: Claude, 2026-11-27 · Chuẩn gốc: `STD-SCREEN-SYSTEM-v1.0.md` mục 2.2, 4.
> Điều kiện bắt đầu: **Đợt 1 và Đợt 2 đã merge**; `RPT-SCREEN-COVERAGE` mới nhất.
> Mẫu giao diện: canvas "Cowdi — Giao diện vượt ải bài học", trang **Thiết kế chính · trộn màn**: Mở ải, F-01 (Gặp từ), F-03 (Nghe nhận diện từ), F-08 (Lật cặp), F-09 (Đò chở câu), F-06 (Boss), Tổng kết, Dẫn nhập Ải 2 / Ải 3.
> Liên quan: `PET-DIRECTOR-INTEGRATION.md`, `GEMINI-FLASHCARD-AUDIO-UX.md` F3, `STORY-BIBLE-IMPLEMENTATION.md` mục 1.3b, 2b (vùng đất, `UNIT_REGION`), `COWDI-AI-PROMPT-BLOCKS.md`, `AUDIO-DESIGN-BIBLE.md`.
> Nhánh: `feat/screen-system-p3`. **Không merge khi chưa có Sonny duyệt.** Màn mới ra mắt ở trạng thái `test`.

---

## 0. Mục tiêu và phạm vi

| Làm | Không làm |
|---|---|
| Khung chung cho màn Thân thiện | F-02, F-04, F-05, F-07, F-10, F-11 (Đợt 4) |
| F-01 Gặp từ trình chiếu · F-03 Nghe nhận diện từ · F-08 Lật cặp đồng cỏ · F-09 Đò chở câu · F-06 Boss sương mù | Đổi Gem, Đá, điểm kỹ năng pet |
| Màn **Mở ải** (dẫn nhập ải) + **Dẫn nhập màn** theo vùng, không lặp 10 ải | Bật màn F cho mọi người (chỉ tài khoản thử) |
| Tab admin **Kho dẫn nhập** | Thống kê màn (Đợt 4) |
| Khách quen; 4 chấm Nghe/Đọc/Viết/Nói của từ; màn Tổng kết mới | Nhóm Mới học dùng hệ thống màn (xem mục 9) |
| **Sao ★ + Sữa theo sao** (mục 7b), sao trên node bản đồ | Trạng thái vùng "Rực rỡ" (chờ ảnh vùng) |
| Nội dung câu dẫn cho vùng của `int-u1`–`int-u3` (soạn bản nháp, Sonny duyệt) | |

---

## Bước 0

1. Đọc `RPT-SCREEN-COVERAGE`. Với 5 màn của đợt này, báo số bài chạy được trong PR. Màn nào chạy được < 50% bài của nhóm Trung bình: dừng, báo Sonny trước khi làm.
2. **[A]** Xác định nơi lấy vùng của bài: `getUnitRegion(unitId)` trong `shared/regions.js` (Story Bible 2b). Nếu nhánh vùng đất chưa merge, tạo `shared/regions.js` tối thiểu chỉ gồm `REGIONS` (tên vùng) và `UNIT_REGION` đúng như Story Bible 2b.1, ghi rõ trong PR.
3. **[A]** Trạng thái F3 (`wordProgress.js`) đã có chưa. Mục 6 cần F3; nếu chưa có thì làm F3 trước theo `GEMINI-FLASHCARD-AUDIO-UX.md`.

---

## 1. Khung chung màn Thân thiện

Thư mục `src/features/lesson/screens/friendly/`.

| Thành phần | Mô tả |
|---|---|
| `FriendlyFrame.jsx` | Nhận `skill`, `title`, `code`, `counter` (ví dụ "Lượt 5/8"). Vẽ nhãn kỹ năng dưới RouteHeader (chip màu kỹ năng + tên màn + mã) và vùng nội dung `flex:1; min-height:0; overflow:hidden` |
| `PetLine.jsx` | Pet nhỏ (dùng `PetAvatar` qua `PetStage` thu gọn) + bong bóng 1–2 dòng ở **chân màn**, vùng cao cố định 72px. Câu do Director chọn; màn chỉ gửi sự kiện |
| `useItemQueue.js` | Hàng đợi item: item sai quay lại sau 2–4 item (ngẫu nhiên theo `rng` của bài), tối đa 1 lần; `firstTry` theo item |
| `friendly.css` | Màu theo canvas: nền kem `#FFF8E7`, thẻ trắng viền `#F0E2C4`, chữ `#4A3420`; màu kỹ năng như Đợt 1. Chữ dùng font hệ thống app; bong bóng pet theo `PET-DIRECTOR-INTEGRATION` 6.3 |

Quy tắc chung (mọi màn F):

- Không cuộn ở 360×640; vùng chạm ≥ 48px; chữ tiếng Anh chính ≥ 20px.
- Đúng: tự sang item sau 1,2 giây. Sai: hiện đáp án đúng + pet giải thích ≤ 2 dòng, chờ 1 chạm.
- Không có trạng thái thua; màn xong khi mọi item đúng ít nhất 1 lần (item sai được làm lại tối đa 1 lần, sau đó tính xong).
- Âm thanh: queue audio chung; SFX đúng/sai/combo theo `AUDIO-DESIGN-BIBLE`. Tắt tiếng thiết bị: màn có nghe (F-03) hiện chữ thay âm và ghi `audioOff` vào kết quả.
- `prefers-reduced-motion`: bỏ bay/trôi, chỉ đổi trạng thái tĩnh.
- Gửi sự kiện như Đợt 1 (`item_shown`, `item_correct`, `item_wrong`, `screen_done`), payload luôn có `wordIds` và `skill` của màn.

---

## 2. Năm màn

Mỗi màn thêm vào `registry.js` với `level: 'friendly'`. Trạng thái khởi tạo trên server: `test`.

### F-01 Gặp từ trình chiếu (slot `intro`)

| Mục | Quy định |
|---|---|
| `canRun` | `vocabulary.length ≥ 4` |
| Item | Mọi từ của bài (tối đa 13 mỗi lượt; > 13 thì chia 2 lượt, giữa hai lượt có 3 câu F-03 ngắn — **không** làm trong đợt này, chỉ cắt còn 13 từ đầu và ghi TODO) |
| Một thẻ | Hình (`image` → `illustration` → emoji lớn), từ ≥ 34px, IPA (ẩn với nhóm `beginner`), nghĩa, câu ví dụ có từ được tô, dịch câu |
| Nhịp | Tự đọc từ (300ms) → câu ví dụ → chờ 1,5s → thẻ sau. Thanh tiến độ mảnh dưới thẻ. Chạm thẻ = dừng/tiếp; nút loa: chạm đọc lại, giữ đọc chậm |
| Dưới thẻ | "Từ này sẽ gặp lại trong ải" + 4 chấm kỹ năng của từ (mục 6) |
| Sự kiện | `item_shown` mỗi thẻ (không có đúng/sai) |
| Xong | Hết thẻ |

### F-03 Nghe nhận diện từ (slot `listen` — đổi từ "Bò hứng chữ" 28/11 theo hướng học thuật)

| Mục | Quy định |
|---|---|
| `canRun` | ≥ 6 từ (TTS dùng được cho mọi từ) |
| Item | 8 lượt: 6 từ của bài + 2 khách quen (mục 5); không đủ khách quen thì lấy từ của bài |
| Một lượt | Đọc từ → 3 bong bóng (1 đúng + 2 nhiễu cùng bài, cùng loại từ nếu có `pos`) hiện ở 3 vị trí cố định, trôi nhẹ. Nút loa lớn: đọc lại; giữ: đọc chậm |
| Đúng | Bong bóng bay về pet, pet há miệng "hứng" (`answer_correct`), chip "+1" |
| Sai | Bong bóng vỡ, đọc lại từ đúng, bong bóng đúng sáng 1s |
| Combo | 3/5 liền: chip "3 liền!" + `streak` |
| Tắt tiếng | Hiện nghĩa tiếng Việt thay âm thanh (chọn từ tiếng Anh theo nghĩa) |

### F-08 Lật cặp đồng cỏ (slot `read`)

| Mục | Quy định |
|---|---|
| `canRun` | ≥ 6 từ |
| Item | 6 cặp (12 thẻ) = 5 từ của bài + 1 khách quen; lưới 3×4 |
| Thao tác | Chạm thẻ → lật (thẻ EN tự đọc). Thẻ thứ 2: cùng cặp → hai thẻ xanh, mờ dần, giữ chỗ; khác cặp → lật úp sau 0,9s |
| `firstTry` | Một cặp tính đúng lần đầu nếu **lần đầu cả hai thẻ đã từng lật** người học ghép đúng ngay (không có lần lật sai liên quan cặp đó sau khi đã thấy cả hai) |
| Chỉ số trên màn | "Lật đúng cặp x/6", 3 chấm "lượt lật sai" chỉ để hiển thị (không thua) |
| Pet | Sau 2 lần lật sai liên tiếp: pet gợi ý nghĩa của thẻ vừa lật |

### F-09 Đò chở câu (slot `write`)

| Mục | Quy định |
|---|---|
| `canRun` | `writeItems(lesson).length ≥ 3` (cùng nguồn câu với T-08) |
| Item | 4 câu |
| Thao tác | Câu tiếng Việt + nút loa (đọc câu tiếng Anh **sau khi** trả lời). Chỗ trống trên đò bằng số từ; thẻ từ trên bến (từ của câu + 2 nhiễu cùng bài). Chạm thẻ → lên chỗ trống kế tiếp; chạm thẻ trên đò → trả về bến |
| Chấm | Từng thẻ: đặt sai vị trí → thẻ rung, bật về bến, **câu đó tính sai lần đầu**; đúng hết → đò chạy qua sông, đọc cả câu |
| Mẹo pet | Như T-08 (Đợt 1 mục 7); nút "Xem ngữ pháp" ở nhãn màn |

### F-06 Boss sương mù (slot `boss`)

| Mục | Quy định |
|---|---|
| `canRun` | luôn đúng (dùng `bossItems` như T-07) |
| Item | Giống T-07: 8–10 câu, trộn kỹ năng; chèn 1–2 câu khách quen |
| Khung trận | Thanh HP pet (trái) và Boss (phải). Đúng: pet tấn công, Boss −(100/số câu)%. Sai: Boss phun sương, pet −10%, **tối thiểu còn 10%**; hiện đáp án đúng, chờ 1 chạm |
| Combo 3 | Kỹ năng của pet tự kích (chỉ hiệu ứng), `streak` |
| Kết thúc | Đạt `lessonPassRate`: Boss "tan biến" khi trọn điểm, "bỏ chạy" khi chưa trọn. Chưa đạt: Boss còn lại, nút "Ôn từ sai" (chạy F-03 với các từ sai) và "Đánh lại" |
| Hình | 1 sprite sương dùng chung `public/image/boss/fog.webp` (Sonny cung cấp; chưa có thì vẽ bằng các vòng tròn CSS như canvas), tô màu theo vùng bằng bảng `BOSS_TINT[regionId]` |
| Pet | `PetAvatar mode="battle"`; Director luôn tầng 1 trong trận (như `battle_*`) |
| Qua bài | Như Đợt 1 mục 6 (theo `lessonPassRate`) |

---

## 3. Màn Mở ải (dẫn nhập ải)

Hiện **trước màn 1**, thay màn "bắt đầu bài" hiện có khi cờ bật. Theo artboard **Mở ải · lộ trình 6 màn**.

| Phần | Nguồn |
|---|---|
| Cảnh vùng | ảnh vùng `public/image/regions/<region>-<variant>.webp` (Story Bible 2b.5); chưa có thì nền màu vùng |
| NPC + câu chuyện | `lesson.story.introVi` (≤ 30 chữ) + `lesson.story.npc` (id trong `HUMAN_CAST`); thiếu thì câu chung của vùng từ kho dẫn nhập (mã `DN-OPEN-<region>-nn`) |
| "Qua ải này, con sẽ" | `lesson.objectives` (2–3 dòng ngắn) |
| 6 màn của ải | Vòng kỹ năng theo đúng kết quả `mixLesson` + tên màn dưới mỗi vòng; dòng "Ải sau xáo thứ tự khác" |
| Boss | "Boss Sương <tên vùng> chờ ở cuối ải. Trả lời đúng {ngưỡng}% để giải sương." |
| Nút | **"Bắt đầu vượt ải"**: thao tác vận hành duy nhất của bài, dùng để mở khoá audio |

Trường mới trong bài: `story: { npc, introVi }`. Thêm vào `schema.js` (tuỳ chọn, không bắt buộc với bài cũ).

---

## 4. Dẫn nhập màn (không lặp)

### 4.1 Dữ liệu

```sql
CREATE TABLE IF NOT EXISTS screen_intro (
  id          VARCHAR(32) PRIMARY KEY,        -- 'DN-F03-BD-01'
  screen_code VARCHAR(8)  NOT NULL,            -- 'F-03', 'T-05', hoặc 'OPEN' cho Mở ải
  region      VARCHAR(4)  NOT NULL,            -- 'BD', 'TG', 'VS', ... hoặc '*' (dùng mọi vùng)
  text_vi     VARCHAR(160) NOT NULL,
  audio_url   VARCHAR(255) NULL,
  status      ENUM('draft','approved','disabled') NOT NULL DEFAULT 'draft',
  updated_by  INT NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY (screen_code, region, status)
);
```

API: `GET /api/screen-intros?region=BD` → câu `approved` của vùng + vùng `*` (cache theo vùng, ETag). Admin: CRUD + đổi trạng thái, ghi `screen_config_log`.

### 4.2 Chọn câu

```
ứng viên = câu approved, đúng screen_code, region ∈ {vùng của bài, '*'}
bỏ câu có id ∈ userData.recentIntros (của 10 ải gần nhất)
ưu tiên câu đúng vùng hơn câu '*'
chọn bằng rng của bài (seed như mixLesson)
nếu rỗng → câu dùng lâu nhất trong recentIntros; vẫn rỗng → câu chung của Director (Đợt 1)
```

- `userData.recentIntros = [{ lessonAttemptAt, ids: [...] }]` giữ 10 ải gần nhất; whitelist `PUT /api/progress`.
- Biến được phép trong câu: `{npc}`, `{region}`, `{word1}`, `{word2}` (từ đầu của bài). Thiếu biến thì bỏ câu.
- Màn chuyển (`ScreenIntro`) dùng câu này thay câu chung; thẻ luật chơi vẫn cố định theo mã màn (STD 4.1).

### 4.3 Nội dung cần soạn (bản nháp, Sonny duyệt trong admin)

- Vùng của `int-u1`, `int-u2`, `int-u3` theo `UNIT_REGION`: **BD, TG, VS**.
- Mỗi mã đang bật (T-01, T-02, T-04, T-05, T-06, T-07, T-08, F-01, F-03, F-06, F-08, F-09) × 3 vùng × **4 câu** = 144 câu + `OPEN` × 3 vùng × 4 = 12 câu.
- `story.introVi` cho 12 bài của `int-u1`–`int-u3`.
- Seed vào `server/db/seed-screen-intros-p3.sql` với `status = 'draft'`.

Luật viết (bắt buộc):

1. ≤ 25 chữ tiếng Việt; giọng pet theo `PET-DIRECTOR-INTEGRATION` 5.3 (xưng "bò"/"Cowdi", gọi "con"/"bạn" theo nhóm).
2. Câu dẫn **gắn với vùng** (cảnh, NPC, vật quen của vùng trong Story Bible) và **gắn với việc của màn** (nghe, xếp chữ, lật thẻ…).
3. Không chứa đáp án; không đổ lỗi; không nhắc tiền, Gem.
4. Không lặp ý giữa 4 câu của cùng mã × vùng.
5. NPC chỉ lấy từ `HUMAN_CAST` và pet chủ nhà của vùng.

Ví dụ đã duyệt hướng (từ canvas):

| id | Câu |
|---|---|
| `DN-F03-BD-01` | Gió thổi lời chào của Ông Tư bay lên trời rồi! Hứng lại giúp bò nha! |
| `DN-F03-VS-01` | Đàn gà ở Vườn Sữa kêu tên từng bạn. Nghe kỹ rồi hứng đúng nha! |

### 4.4 Tab admin "Kho dẫn nhập"

Lọc theo mã màn × vùng × trạng thái; bảng câu (id, câu, trạng thái, người sửa); sửa trực tiếp; duyệt hàng loạt; cảnh báo ô (mã × vùng) có < 4 câu `approved`.

---

## 5. Khách quen

- Nguồn: từ của các bài **đã hoàn thành** trong cùng lộ trình, trạng thái F3 là `learning` hoặc `review` (không lấy `known`, không lấy `new`). Ưu tiên `review`, rồi từ có `lastSeenAt` cũ nhất.
- Mỗi màn có item từ vựng chèn **2–3** khách quen, không quá 30% số item. Màn câu (F-09, T-08) không chèn.
- Hiển thị: nhãn nhỏ "khách quen" trên item (không đổi luật chơi).
- Kết quả của item khách quen: cập nhật F3 bình thường; trong `results` ghi riêng `guestTotal`, `guestCorrect` (không gộp vào `firstTryCorrect` của bài).
- Bài đầu tiên của người học (chưa có từ cũ) → không có khách quen.

---

## 6. Bốn chấm kỹ năng của từ ("vào đầu")

Bổ sung F3 (`wordProgress.js`), **thêm trường, không đổi luật cũ**:

```js
wordProgress[wordId].skillsHit = { listen: ISOString|null, read: …, write: …, speak: … }
```

- Ghi khi `item_correct` của màn có `skill` tương ứng chứa từ đó (T-01/F-01/T-02 không ghi; Boss ghi theo `skill` của câu nếu câu có `skill`).
- **Vào đầu** = đủ 4 chấm. Khi vừa đủ: `points = max(points, knownAtPoints)` → trạng thái `known` theo F3.
- Trả lời sai (F3: về `review`): **giữ** `skillsHit` (chấm không mất), trạng thái theo luật F3.
- Hiển thị: F-01 dưới thẻ; màn Tổng kết.

---

## 7. Màn Tổng kết mới

Theo artboard **Tổng kết**, thay màn kết quả khi cờ bật:

1. Kết quả qua/chưa qua + câu pet (`lesson_done`).
2. "Bây giờ con có thể": `lesson.objectives`.
3. "Từ đã vào đầu x / n" + thanh từng từ; danh sách từ sẽ gặp lại ở ải sau (thiếu kỹ năng nào) và từ sai nhiều.
4. Sao (hiện lần lượt, âm tăng dần; sao thiếu kèm 1 dòng điều kiện, ví dụ "★ thứ 3: đúng 95% lần đầu và Boss trọn điểm") · Sữa theo mục 7b · Gem như hiện hành.
5. Điểm kỹ năng pet vừa cộng (Nghe/Đọc/Viết/Nói).
6. Nút "Tiếp" về lộ trình; "Xem ngữ pháp".

---

## 7b. Sao ★ và Sữa theo sao (STD 3.5, Sonny chốt 27/11)

**Bước 0 bổ sung [A]:** xác định nơi đang tính Sữa của bài (client `goToNextQuestion` / `addXP`, và server có kiểm lại không). Đổi công thức ở **đúng chỗ đó**; nếu server có kiểm, đổi cả server trong cùng PR.

Hàm thuần `shared/lesson-stars.js`:

```js
export function computeLessonResult({ group, results, bossCorrect, bossTotal, passRate }) {
  // results: [{ code, slot, total, firstTryCorrect, guestTotal }] từ lessonMixLog
  // Không tính: slot 'intro'; item khách quen; slot 'speak' khi group === 'intermediate'
  // → { passed, accuracy, stars }
}
export function lessonMilk({ bossCorrect, stars, isFirstPass, prevStarsPaid = 0 }) {
  // lần đầu qua ải: bossCorrect*10 + STAR_BONUS[stars] + 60
  // làm lại: max(5, round(bossCorrect*10/3)) + (STAR_BONUS[stars] - STAR_BONUS[prevStarsPaid] nếu stars > prevStarsPaid)
  // chưa qua: max(5, round(bossCorrect*10/3))
}
export const STAR_BONUS = [0, 0, 15, 30];
export const STAR_RULES = {
  beginner:     { two: 0.75, three: 0.90 },
  intermediate: { two: 0.80, three: 0.95 },
  exam:         { two: 0.80, three: 0.95 },
}; // ★★★ còn cần Boss đúng hết
```

- Lưu: `lessonScores[id]` giữ % như cũ; thêm `lessonStars[id]` (0–3, lấy max) và `lessonStarPaid[id]` (mức sao đã trả thưởng, tránh trả hai lần). Whitelist `PUT /api/progress`, server gộp **max theo từng khoá**.
- Bỏ khoản `+30 trọn điểm` cũ. Sữa tối đa lần đầu (Boss 10 câu) vẫn 190 — có test.
- Node bản đồ (`LearningPathPage`): 1–3 sao dưới node đã qua; sao trống viền mờ cho mức chưa đạt. **Không hiện sao trong lúc học.**
- `estimateLessonMilk` (gợi ý thưởng trên bản đồ) dùng công thức mới.

| # | Kiểm |
|---|---|
| S1 | Boss 10/10, chính xác 96% → ★★★, lần đầu 190 Sữa |
| S2 | Boss 9/10, chính xác 88% → ★★, lần đầu 165 Sữa |
| S3 | Làm lại từ ★★ lên ★★★ → +15 thưởng sao một lần; làm lại lần nữa vẫn ★★★ → không thêm |
| S4 | Chưa qua → 0 sao lần này, Sữa 1/3, `lessonStars` không tụt nếu trước đó đã có sao |
| S5 | Item khách quen và Màn 1 không ảnh hưởng `accuracy`; Nói không tính ở nhóm Trung bình |

---

## 8. Ra mắt

1. Merge với 5 màn F ở trạng thái `test`; thêm 5–10 tài khoản thử (Sonny chọn).
2. Sonny duyệt câu dẫn trong admin (`draft` → `approved`).
3. Sau ≥ 1 tuần dùng thử, Sonny quyết bật `on` từng màn.

---

## 9. Nhóm Mới học

Đợt này **chưa** chuyển `PictureLesson` sang hệ thống màn. Lý do: bài `picture` có cấu trúc dữ liệu khác (`words`, `pattern`), cần màn riêng cho hình. Ghi đề xuất cho Đợt 4 nếu Sonny muốn.

---

## 10. Test

| # | Kiểm |
|---|---|
| P1 | Mỗi màn F: 360×640 không cuộn; xong màn khi item sai được làm lại tối đa 1 lần |
| P2 | `firstTry` của F-08 theo đúng định nghĩa (test đơn vị với chuỗi lật giả) |
| P3 | F-09: đặt sai 1 thẻ → câu tính sai lần đầu; vẫn hoàn thành được |
| P4 | F-06: pet không bao giờ < 10% HP; đạt/chưa đạt khớp `lessonPassRate` |
| P5 | Chọn câu dẫn: 11 ải liên tiếp cùng vùng → không câu nào lặp trong 10 ải gần nhất khi kho đủ 4 câu |
| P6 | Khách quen: ≤ 30% item; không lấy từ `known`; bài đầu tiên không có khách quen |
| P7 | `skillsHit` đủ 4 → trạng thái `known`; trả lời sai sau đó → `review`, chấm vẫn giữ |
| P8 | Tài khoản thường không gặp màn F (`test`); tài khoản thử gặp |
| P9 | Tắt tiếng: F-03 vẫn chơi được bằng nghĩa tiếng Việt |
| P10 | Mở ải: chỉ 1 chạm vận hành trước khi vào màn 1 |

## 11. Definition of Done

- [ ] P1–P10 qua; `node --test` toàn bộ xanh
- [ ] Ảnh chụp 360×640 của Mở ải, 5 màn F (trạng thái đang chơi + đúng + sai), Tổng kết
- [ ] Seed câu dẫn đủ số lượng mục 4.3 ở trạng thái `draft`
- [ ] Báo cáo trong PR: số bài chạy được mỗi màn F (từ ma trận admin)

## 12. Không được làm

- Không bật `on` màn F trong PR.
- Không đổi Gem, Đá, điểm kỹ năng pet; Sữa chỉ đổi đúng như mục 7b.
- Không thêm thư viện game (PixiJS, Phaser…). Dùng React + CSS transform.
- Không dùng tên người thật, không dùng NPC ngoài `HUMAN_CAST`.
