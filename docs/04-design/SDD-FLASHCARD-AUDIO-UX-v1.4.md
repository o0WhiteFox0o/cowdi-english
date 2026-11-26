# SDD-FLASHCARD-AUDIO-UX v1.4 — Flashcard: Tự đọc khi chuyển thẻ, Loa trên thẻ & Trạng thái từ tự động

| Mục | Giá trị |
|---|---|
| **Mã tài liệu** | `SDD-FLASHCARD-AUDIO-UX` |
| **Phiên bản** | `1.4` · **Cập nhật:** `2026-11-26` |
| **Người duyệt** | Product Owner (Sonny) |
| **Trạng thái** | `Approved — Đã chốt, sẵn sàng triển khai (chờ duyệt kế hoạch & DEC-09)` |
| **Chuẩn tham chiếu** | IEEE 1016-2009 · Quy ước tài liệu: [DOCP-COWDI-v1.1](../00-general/DOCP-COWDI-v1.1.md) |
| **Tài liệu nguồn & liên quan** | Gói bàn giao `cowdi-flashcard-v1.4.zip` (26/11/2026) · [SDD-LEARNING-GROUPS-v2.0.md](SDD-LEARNING-GROUPS-v2.0.md) · [RPT-FLASHCARD-SURVEY.md](../05-implementation/RPT-FLASHCARD-SURVEY.md) · [TASK-FLASHCARD-v1.4.md](../05-implementation/TASK-FLASHCARD-v1.4.md) |
| **Demo tương tác** | [flashcard-mockups/flashcard-demo.html](flashcard-mockups/flashcard-demo.html) |

> **Ký hiệu:** `[F]` thấy trên ảnh chụp màn hình · `[A]` giả định đã được khảo sát & xác nhận tại [RPT-FLASHCARD-SURVEY.md](../05-implementation/RPT-FLASHCARD-SURVEY.md).

**Phạm vi:** Bước Flashcard trong bài học (`LessonDetailPage.jsx`, tab "Tuỳ chọn: Flashcard") và trang Flashcard chủ đề từ vựng (`VocabularyPage.jsx`) — gộp về cùng một component dùng chung `src/components/learn/Flashcard.jsx`. Bổ sung ghi kết quả câu hỏi vào trạng thái từ ở quiz bài học (`LessonDetailPage`, `PictureLesson`), tab Luyện (`PracticePage`), checkpoint (`LearningPathPage`), mini-game có chấm (`MiniGamePage`).

**Lịch sử phiên bản:**
- `v1.1`: Bỏ thao tác đánh dấu thủ công; trạng thái từ do hệ thống tự ghi.
- `v1.2`: "Đã thuộc" cần đúng ở 2–3 ngày khác nhau. **Đã huỷ.**
- `v1.3`: Mô hình **điểm nhớ** — 3–5 lượt tương tác là thuộc, chọn sai là quên, dự đoán theo thời gian chỉ là gợi ý.
- `v1.4`: Chốt toàn bộ quyết định (mục 6); bổ sung code tham chiếu (`wordProgress.js`, `useAutoSpeak.js`) và 16 ca kiểm thử.

---

## 0. Vấn đề hiện tại [F]

| # | Vấn đề | Ảnh hưởng |
|---|---|---|
| P1 | Chữ "thuộc" xuất hiện 2 lần mỗi màn ("2 đã thuộc" + nút "Đã thuộc"), nút "Đã thuộc" là **nút chính** | Người học tự chấm mình; trẻ em bấm "Đã thuộc" để đi tiếp → dữ liệu sai |
| P2 | "Tiếp ›" là nút viền mờ, trông như bị tắt | Hành động phổ biến nhất lại kém nổi nhất |
| P3 | Chuyển thẻ không phát âm | Mất cơ hội nghe thụ động |
| P4 | 3 nút loa dạng chữ nằm **ngoài** thẻ, luôn hiện kể cả khi chưa lật | Rối, xa nội dung nó đọc |
| P5 | Hai nút xanh cùng lúc: "Đã thuộc" và "Hoàn thành → Nghe câu" | Không rõ hành động chính |

---

## 1. Nguyên tắc thiết kế

1. **Nghe trước, nhìn sau:** mỗi thẻ mới tự đọc từ một lần; muốn nghe lại thì bấm loa ngay cạnh chữ.
2. **Âm thanh nằm cạnh thứ nó đọc.** Không còn nút loa dạng chữ ngoài thẻ.
3. **Một hành động chính mỗi màn:** "Tiếp ›".
4. **Người học không tự chấm mình.** Hệ thống tự ghi từ hành vi:
   - Tương tác đủ nhiều → **Đã thuộc**.
   - Chọn sai → **Cần ôn** (đã quên). Đây là bằng chứng duy nhất để nói "quên".
   - Lâu không gặp → chỉ là **gợi ý "Lâu chưa gặp"**. Không gặp lại từ (học chủ đề khác, không online) **không bao giờ** làm mất trạng thái.

---

## 2. Thay đổi

### F1. Tự đọc khi chuyển thẻ

- Thẻ trở thành thẻ đang xem (mở bước Flashcard, bấm Tiếp/Trước, vuốt, bấm chấm tiến độ) → sau **300 ms** đọc **từ tiếng Anh một lần**, tốc độ `rules.ttsRate` của nhóm.
- Chuyển thẻ trước khi đọc xong → huỷ câu đang đọc, hẹn giờ mới. Vuốt nhanh qua nhiều thẻ thì chỉ thẻ dừng lại cuối cùng được đọc.
- **Lật thẻ không tự đọc.** Rời trang, ẩn tab, đổi tab bước → huỷ âm thanh.
- Không tự đọc khi loa tổng ở thanh trên cùng đang tắt (`useSound().muted`), hoặc người dùng tắt "Tự đọc" (F4).
- Lần đọc bị trình duyệt chặn hoặc lỗi → không báo lỗi; nút 🔊 trên thẻ **nhấp nháy nhẹ 2 lần** để gợi ý bấm.
- Mọi nhóm đọc **1 lần** (kể cả Mới học).
- Dùng `speakWord` / `stopSpeaking` dùng chung trong `src/utils/speech.js` (hỗ trợ `rate`, `lang`, `onStart`, `onEnd` và trả `Promise`), không viết TTS riêng trong Flashcard.

### F2. Loa trên thẻ

**Mặt trước:**

```text
┌──────────────────────────────┐
│            😀 (nếu có hình)   │
│        How are you?          │
│          phrase              │
│       /haʊ ɑːr juː/          │
│       ( 🔊 )  ( 🐢 )          │
│        Chạm để lật           │
└──────────────────────────────┘
```

- **🔊 56 px**: đọc lại từ với `rules.ttsRate`. **🐢 40 px**: đọc chậm, rate `0.55`.
- Khi đang đọc: nút có hiệu ứng (tắt nếu `prefers-reduced-motion`). Bấm lại khi đang đọc → dừng rồi đọc lại từ đầu.

**Mặt sau** (chia tầng, thêm loa cạnh từng dòng):

```text
┌──────────────────────────────┐
│ How are you? /haʊ ɑːr juː/ 🔊 │
│   Bạn khoẻ không?        🔊  │  ← giọng vi-VN
│ "How are you today, Tom?" 🔊 │
│ → Hôm nay bạn khoẻ không?    │
│ 💡 Mẹo nhớ …                 │
│ Xem thêm ▾                   │
└──────────────────────────────┘
```

- Máy không có giọng `vi-VN` → **ẩn** loa cạnh nghĩa (không đọc tiếng Việt bằng giọng Anh).
- Mọi nút loa: `e.stopPropagation()` (không lật thẻ), `aria-label` ("Nghe lại từ", "Nghe chậm", "Nghe nghĩa tiếng Việt", "Nghe câu ví dụ"), vùng chạm ≥ 44 px.
- **Xoá** 3 nút dưới thẻ: "Nghe phát âm", "Nghe câu ví dụ", "Nghe tiếng Việt".

### F3. Trạng thái từ tự động — mô hình điểm nhớ

**Bỏ:** nút "Đã thuộc", nút "Đang học" (ở trang chủ đề), dòng "✓ n đã thuộc", mọi thao tác đánh dấu thủ công trên màn flashcard.

Toàn bộ logic nằm trong module thuần `src/features/vocab/wordProgress.js`. Component **không** tự tính điểm.

#### F3.1 Điểm nhớ

| Hành vi | Điểm | Giới hạn |
|---|---|---|
| **Gặp trên flashcard**: lật thẻ hoặc bấm loa trên thẻ (🔊, 🐢, loa mặt sau) | **+1** | Tối đa +1 cho mỗi từ **trong một lượt mở flashcard** |
| **Trả lời đúng** câu hỏi kiểm tra từ đó | **+2** | Tối đa +2 cho mỗi từ **trong một lượt làm bài** |
| **Trả lời sai** | về **0**, chuyển `review` | — |
| Tự đọc khi chuyển thẻ (F1) | 0 | — |
| Nói theo / chấm phát âm | 0 | — |

- **Lượt (run)** = một lần mở màn flashcard, hoặc một lần bắt đầu một bài làm (một quiz, một lượt Luyện, một checkpoint, một ván mini-game). Màn đó giữ một `Set` các `wordId` đã cộng điểm; thoát ra mở lại là lượt mới. Không cần khác ngày, không cần online.
- `points` chặn trên ở `knownAtPoints + 5`.

#### F3.2 Trạng thái (suy ra, không lưu)

| Trạng thái | Nhãn UI | Màu chấm | Điều kiện |
|---|---|---|---|
| `new` | Chưa gặp | xám `#D3D1C7` | 0 điểm, không có cờ sai |
| `learning` | Đang nhớ | xanh nhạt `#97C459` | 1 đến `knownAtPoints − 1` điểm |
| `known` | Đã thuộc | xanh đậm `#3B6D11` | ≥ `knownAtPoints` điểm |
| `review` | Cần ôn | cam `#EF9F27` | Có cờ sai (`wrongPending`) |

- Ở `review`: lượt gặp trên flashcard **vẫn cộng điểm**, nhưng trạng thái **giữ `review` cho tới khi có một câu trả lời đúng**.
- Câu đúng đầu tiên sau khi sai: `+2`, bỏ cờ sai, trạng thái tính theo điểm.

```text
new ─(gặp/đúng)─▶ learning ─(đủ điểm)─▶ known
  │                  │                    │
  └──────(sai)───────┴────────(sai)───────┴──▶ review ─(trả lời đúng)─▶ learning / known theo điểm
```

#### F3.3 Cấu hình theo nhóm

Thêm vào `rules` của từng nhóm trong `src/data/config/groups.js`:

| Nhóm | `knownAtPoints` | `maybeForgetDays` |
|---|---|---|
| `beginner` (Mới học) | **5** | **7** |
| `intermediate` (Trung bình) | **4** | **14** |
| `exam` (Luyện thi) | **3** | **14** |

Nhóm áp dụng = nhóm của lộ trình đang học (`getGroupOfPath`). Từ dùng ở nhiều lộ trình: dùng chung một bản ghi, ngưỡng theo nhóm của màn đang hiển thị. Đổi cấu hình là áp dụng ngay, không migration.

#### F3.4 Lưu dữ liệu

```js
// wordProgress[wordId]
{ points: 0, wrongPending: false,
  lastSeenAt: null, lastCorrectAt: null, lastWrongAt: null,   // ISO string
  encounterTotal: 0, correctTotal: 0, wrongTotal: 0 }
```

- `wordId`: `normalizeWordId(word) = String(word || '').trim().toLowerCase()` (do `0/2.741` từ hiện tại có trường `id` riêng).
- Lưu local trước (debounce 1 s, bọc `try/catch`); đồng bộ server theo quyết định `DEC-09` (xem [RPT-FLASHCARD-SURVEY.md](../05-implementation/RPT-FLASHCARD-SURVEY.md)) và gộp 2 thiết bị bằng `mergeProgress`.
- **Migration idempotent**: dữ liệu `userData.wordStatus[word] === 'learned'` cũ → `migrateLegacyKnown` (`learning`, 1 điểm), đánh dấu cờ phiên bản `cowdi.wordProgress.v = '1'`. Không chạy cộng điểm 2 lần.

#### F3.5 Gợi ý "Lâu chưa gặp" (dự đoán, không phải trạng thái)

- Điều kiện: `known` **và** số ngày kể từ `max(lastSeenAt, lastCorrectAt)` ≥ `maybeForgetDays` (`isMaybeForgotten`).
- **Không đổi `points`, không đổi trạng thái, không gọi là "quên".**
- Hiển thị: chấm xanh đậm có viền cam mảnh. Nhãn (nếu cần chữ) là **"Lâu chưa gặp"**.
- Dùng để sắp thứ tự thẻ (F5). Gặp lại từ → cờ tự mất.

#### F3.6 Câu hỏi phải biết nó kiểm tra từ nào

- Câu tự sinh từ `vocabulary` (`generateQuizFromLesson`, `generateAutoQuestions`, câu picture `PictureLesson`) → gán `targetWords: [wordId]`.
- Câu soạn tay (`lesson.quiz` v2) → thêm trường tuỳ chọn `targetWords: string[]` vào schema và validator (`scripts/validate-lessons.mjs`). Câu **không có** `targetWords` thì **không cập nhật** trạng thái từ (không đoán bằng so khớp chuỗi).
- Nguồn tính: quiz bài học, tab Luyện, checkpoint, mini-game có chấm đúng/sai. Gọi `applyQuestionResult` ngay khi chấm từng câu.
- **Không** tự điền `targetWords` hàng loạt cho câu soạn tay trong đợt này.

#### F3.7 Hiển thị trên flashcard

- Bộ đếm chỉ còn `"2 / 18"`.
- Chấm tiến độ tô theo màu F3.2 (+ viền cam cho "Lâu chưa gặp"); thẻ đang xem có viền đậm. Không có chữ trạng thái trên thẻ, không có chữ "thuộc" trên màn flashcard.
- Bấm chấm → nhảy tới thẻ đó. Chấm có `aria-label` `"Thẻ 3: Đang nhớ"`.

### F4. Hàng nút dưới thẻ

```text
   [ ‹ ]          [      Tiếp ›      ]
   ● ● ◉ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○
   🔁 Tự đọc: Bật                Bỏ qua → Nghe câu
```

- **"Tiếp ›"** là nút chính (nền xanh, rộng ~60%). **"‹"** là nút phụ chỉ có biểu tượng, `aria-label="Thẻ trước"`, ẩn ở thẻ đầu.
- **Thẻ cuối**: nút chính đổi thành **"Hoàn thành → {tên bước kế} ▷"** (theo `LESSON_STEPS`). Bỏ nút xanh luôn hiện ở đáy; trước thẻ cuối thay bằng link chữ nhỏ **"Bỏ qua → {tên bước kế}"**. Trang chủ đề từ vựng (không có bước kế) → **"Hoàn thành"**.
- **Công tắc "Tự đọc"**, lưu `localStorage` khoá `cowdi.flashcard.autoSpeak`, mặc định **Bật**.
- Vuốt trái/phải trên thẻ = Tiếp/Trước (ngưỡng 50 px; chạm không vuốt vẫn là lật).

### F5. Thứ tự thẻ và màn hoàn thành

- **Thứ tự khi mở flashcard** (`orderCards`): `review` → `known` có cờ "Lâu chưa gặp" → `new` → `learning` → `known`. Giữ thứ tự gốc trong mỗi nhóm. Chốt lúc mở, **không** đổi giữa chừng.
- Trong bài học có chia "Nhóm 1/2/3" (`vocabBatchSize`): sắp xếp **trong từng nhóm**, không trộn nhóm.
- Bấm "Hoàn thành" ở thẻ cuối → một dòng (toast 2 s hoặc banner Cowdi):
  - Bộ thẻ có từ `review` (đếm lúc mở): `"Xong 18 thẻ! Có 3 từ cần ôn"` + link `"Ôn 3 từ này"` (flashcard chỉ với các từ đó).
  - Không có: `"Xong 18 thẻ!"`.
- Không thưởng thêm Sữa (không đổi luật thưởng).

---

## 3. Bố cục mục tiêu (màn 360 px, mặt trước)

```text
┌────────────────────────────────┐
│ Tuỳ chọn: [Flashcard] Nghe câu…│
│ [Cowdi] "Nghe rồi chạm để lật!" │
│            2 / 18              │
│ ┌────────────────────────────┐ │
│ │          😀 (nếu có hình)  │ │
│ │      How are you?          │ │
│ │        phrase              │ │
│ │     /haʊ ɑːr juː/          │ │
│ │     (🔊)   (🐢)            │ │
│ │      Chạm để lật           │ │
│ └────────────────────────────┘ │
│  [‹]     [     Tiếp ›     ]    │
│  ● ◉ ● ● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○    │
│  🔁 Tự đọc: Bật   Bỏ qua → Nghe câu
└────────────────────────────────┘
```

Câu gợi ý trên banner: **"Nghe rồi chạm để lật!"**.

---

## 4. Tiêu chí nghiệm thu

Xem trọn bộ 32 tiêu chí (`U-1..U-12`, `S-1..S-15`, `R-1..R-5`) trong [TASK-FLASHCARD-v1.4.md](../05-implementation/TASK-FLASHCARD-v1.4.md).

---

## 5. Ngoài phạm vi

- Lên lịch ôn tập tự động theo cờ "Lâu chưa gặp" (thông báo, bài ôn hằng ngày).
- Màn "Sổ từ" liệt kê từ theo trạng thái.
- Tự điền `targetWords` cho câu soạn tay.
- Ghi âm / chấm phát âm trên thẻ.
- Đổi luật thưởng Sữa/Gem/Đá.

---

## 6. Quyết định đã chốt (Sonny, 26/11/2026)

| # | Nội dung |
|---|---|
| D1 | Bỏ đánh dấu thủ công; trạng thái từ do hệ thống tự ghi |
| D2 | Không yêu cầu khác ngày. Đủ điểm từ 3–5 lượt tương tác là thuộc; chọn sai là quên |
| D3 | Dự đoán theo thời gian chỉ là gợi ý "Lâu chưa gặp", không đổi trạng thái |
| D4 | +1 mỗi từ mỗi lượt flashcard; trả lời đúng +2 mỗi từ mỗi lượt bài; tự đọc không tính |
| D5 | `knownAtPoints`: Mới học 5, Trung bình 4, Luyện thi 3. `maybeForgetDays`: 7 / 14 / 14 |
| D6 | Ở `review`, nhìn lại thẻ vẫn cộng điểm nhưng phải có 1 câu đúng mới thoát `review` |
| D7 | Mọi nhóm tự đọc 1 lần |
| D8 | Dữ liệu "đã thuộc" cũ → `learning` 1 điểm |
