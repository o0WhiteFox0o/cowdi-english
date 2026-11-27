# GEMINI — Hệ thống màn, Đợt 4: 6 màn Thân thiện còn lại, trường dữ liệu mới, thống kê màn, dọn code cũ

> Giao cho: Gemini · Viết: Claude, 2026-11-27 · Chuẩn gốc: `STD-SCREEN-SYSTEM-v1.0.md` mục 2.2, 5.
> Điều kiện bắt đầu: **Đợt 3 đã merge và chạy thử ≥ 1 tuần**; Sonny đã đọc kết quả thử (màn nào giữ, màn nào sửa). Phần nào Sonny yêu cầu đổi sau thử nghiệm Đợt 3 thì **ưu tiên hơn tài liệu này**.
> Mẫu giao diện: canvas "Cowdi — Giao diện vượt ải bài học": F-02 (Ghép chữ lên đò), F-04 (Gọi pet vượt suối), F-05 (Săn chữ trong sương), F-07 (Chợ nổi), F-10 (Trò chuyện với Ông Tư), F-11 (Đúng hay sai).
> Nhánh: chia 3 PR — `feat/screen-system-p4a` (thống kê + F-02, F-04, F-05), `p4b` (trường dữ liệu + F-07, F-10, F-11), `p4c` (dọn code cũ). **Không merge khi chưa có Sonny duyệt.**

---

## 0. Phạm vi

| PR | Nội dung | Phụ thuộc dữ liệu mới |
|---|---|---|
| 4a | Thống kê màn (mục 1) · F-02 · F-04 · F-05 | Không (F-05 cần `reading.highlights`, đã có ở nhiều bài) |
| 4b | Trường dữ liệu mới (mục 3) · F-07 · F-10 · F-11 · nội dung mẫu cho `int-u1`–`int-u3` | Có |
| 4c | Gỡ code tab cũ khỏi `LessonDetailPage` sau khi cờ `screenSystemV1` bật cho mọi người ≥ 2 tuần | — |

Khung chung, quy tắc chung, khách quen, 4 chấm, dẫn nhập: **như Đợt 3** (mục 1, 4, 5, 6). Mỗi màn mới cần câu dẫn cho 3 vùng BD, TG, VS (4 câu × 3 vùng, `draft`).

---

## 1. Thống kê màn (PR 4a)

### 1.1 Ghi nhận

- Client gom sự kiện theo màn, gửi một lần khi `screen_done` hoặc khi rời màn giữa chừng: `POST /api/screen-stats` (đăng nhập), body `{ code, group, outcome: 'done'|'quit', items, firstTryCorrect, durationMs, audioOff }`. Gửi lỗi thì bỏ qua (không thử lại vô hạn, không chặn học).
- Không gửi khi `sandbox = true`.

### 1.2 Lưu (không lưu theo người dùng)

```sql
CREATE TABLE IF NOT EXISTS screen_stat_daily (
  day        DATE NOT NULL,
  code       VARCHAR(8) NOT NULL,
  group_id   VARCHAR(16) NOT NULL,
  starts     INT NOT NULL DEFAULT 0,
  completes  INT NOT NULL DEFAULT 0,
  quits      INT NOT NULL DEFAULT 0,
  items      INT NOT NULL DEFAULT 0,
  first_try  INT NOT NULL DEFAULT 0,
  sum_ms     BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (day, code, group_id)
);
```

Server cộng dồn bằng `INSERT … ON DUPLICATE KEY UPDATE`. **Không lưu `user_id`, không lưu sự kiện thô.** `starts` tăng khi nhận `done` hoặc `quit`.

### 1.3 Tab admin "Thống kê"

- Chọn 7 / 30 ngày, nhóm học. Bảng mỗi mã: lượt chơi, % hoàn thành, % đúng lần đầu, thời gian trung bình.
- Cờ cảnh báo: hoàn thành < 80% (người học bỏ giữa màn) · đúng lần đầu < 50% (quá khó) hoặc > 97% (quá dễ) · thời gian trung bình > 120 giây.
- So sánh mức: trung bình màn Thân thiện vs Tập trung cùng slot.
- Ít hơn 30 lượt chơi: hiện "chưa đủ dữ liệu", không tô cảnh báo.

---

## 2. Sáu màn (thêm vào `registry.js`, `level: 'friendly'`, trạng thái khởi tạo `test`)

### F-02 Ghép chữ lên đò (slot `write`) — PR 4a

| Mục | Quy định |
|---|---|
| `canRun` | ≥ 4 từ **đơn** (không dấu cách) dài 3–10 chữ cái |
| Item | 6 từ (5 của bài + 1 khách quen nếu là từ đơn) |
| Một lượt | Hình + nghĩa tiếng Việt + nút loa (đọc từ). Ô chữ trên đò = số chữ cái. Bàn phím chữ: chữ cái của từ + chữ nhiễu cho đủ 8 ô, chữ trùng hiện đúng số lần |
| Thao tác | Chạm chữ → lên ô kế tiếp. Sai chữ ở vị trí → ô rung, chữ trả về; từ đó tính sai lần đầu. Gợi ý: sau 2 lần sai cùng ô, chữ đúng nhấp nháy |
| Nhóm Mới học | Hiện sẵn chữ cái đầu |

### F-04 Gọi pet vượt suối (slot `speak`) — PR 4a

| Mục | Quy định |
|---|---|
| `canRun` | `speakItems(lesson).length ≥ 3` |
| Item | 4–5 câu |
| Một lượt | Câu mẫu + IPA (ẩn với Mới học) + nghĩa. Đọc câu mẫu → đếm 3-2-1 → mic tự mở (như STD-LEARNING-UX P0) → chấm bằng module chung `utils/speech.js` |
| Đạt | Trung bình ≥ 50%, Luyện thi ≥ 70% (theo `groups.js`), Mới học không chấm: pet nhảy qua tảng đá; từ máy nghe được tô xanh |
| Chưa đạt | Pet đi vòng qua đá (không thua), mời thử lại; mic mở lại tối đa 2 lần rồi sang câu |
| Không mic / từ chối | "Nghe và nhắc lại", không chấm; vẫn tính xong màn; `skillsHit.speak` **không** ghi |

### F-05 Săn chữ trong sương (slot `read`) — PR 4a

| Mục | Quy định |
|---|---|
| `canRun` | có `reading.passage` và ≥ 4 mục `highlights` xuất hiện nguyên văn trong passage |
| Hiển thị | Đoạn văn (hội thoại: mỗi lượt lời một dòng); các mục `highlights` bị phủ sương (ô xám cùng độ rộng chữ). Đoạn dài hơn khung: **cuộn trong thẻ đoạn văn**, không cuộn trang |
| Một lượt | Đọc 1 mục → người học chạm đúng ô sương → sương tan, chữ hiện màu vàng. Chạm sai ô → ô rung, đọc lại |
| Xong phần săn | Hết sương → hiện bản dịch (`translation`) 1 lần + 2 câu trong `reading.questions` (dạng chọn đáp án như T-04) |
| Cụm từ | Cần hỗ trợ tô **cụm nhiều từ** (MAP-CURRENT-UI U5): so khớp cụm dài nhất trước |

### F-07 Chợ nổi (slot `listen`) — PR 4b

| Mục | Quy định |
|---|---|
| `canRun` | ≥ 4 danh từ đếm được có `image` (hoặc `illustration`) **và** có `plural` (mục 3.1) hoặc là dạng số nhiều thêm `s`/`es` theo quy tắc chuẩn |
| Item | 6 khách hàng |
| Một lượt | Cảnh ghe bán hàng. Câu đặt hàng: `"{n} {plural}, please."` hoặc `"One {word}, please."`, `n` = 1–5 (Mới học: 1–3). 4 giỏ: 1 đúng, 1 sai số lượng, 1 sai món, 1 sai cả hai |
| Đúng | Ghe giao hàng, khách vẫy tay |
| Âm thanh | TTS đọc câu; tốc độ `rules.ttsRate`; giữ nút loa để nghe chậm |
| Hình | Giỏ dùng lại ảnh từ (`public/image/words/`); cảnh chợ `public/image/scenes/market.webp` (Sonny cung cấp; chưa có thì nền màu như canvas) |

### F-10 Trò chuyện với Ông Tư (slot `speak`) — PR 4b

| Mục | Quy định |
|---|---|
| `canRun` | `dialogPrompts.length ≥ 2` (mục 3.2) |
| Item | 3 lượt hỏi–đáp |
| Một lượt | NPC (theo `prompt.npc`, mặc định ông Tư) hỏi bằng tiếng Anh (TTS) + dịch. Có thể có ảnh gợi ý. Hiện 2 câu trả lời gợi ý (EN + VI). Mic tự mở sau câu hỏi |
| Chấm (không dùng AI) | Chuẩn hoá bản nhận dạng. Đạt nếu (a) chứa **mọi** `keywords` của prompt, hoặc (b) trùng ≥ 60% số từ với một câu trong `answers`. Mới học: không chấm |
| Phản hồi | Đạt: NPC đáp lại 1 câu (`prompt.replyEn` + dịch) rồi sang lượt sau. Chưa đạt: pet nhắc 1 câu gợi ý, mic mở lại 1 lần |
| Không mic | Chọn câu trả lời bằng chạm (thành bài nghe–chọn), `skillsHit.speak` **không** ghi |
| AI chat | Ngoài phạm vi (giữ chỗ theo PET-DIRECTOR mục 11) |

### F-11 Đúng hay sai (slot `read`) — PR 4b

| Mục | Quy định |
|---|---|
| `canRun` | `trueFalse.length ≥ 4` (mục 3.3) |
| Item | 6–8 thẻ, tỉ lệ đúng/sai 40–60% |
| Một lượt | Tranh + câu tiếng Anh (chạm câu để nghe). Hai nút lớn **Sai** / **Đúng**, hoặc vuốt thẻ trái = Sai, phải = Đúng |
| Sai | Pet giải thích bằng `item.whyVi` (≤ 2 dòng) |

---

## 3. Trường dữ liệu mới (PR 4b)

Thêm vào `src/data/lessons/schema.js` + `validate-lessons.mjs` + `STD-LESSON-CONTENT` (tăng lên v1.1, mục mới "Dữ liệu cho màn Thân thiện"). Tất cả **tuỳ chọn**: bài không có thì màn tương ứng không chạy (`canRun` false), không lỗi build.

### 3.1 `vocabulary[].plural` và `vocabulary[].countable`

```js
{ word: 'mango', plural: 'mangoes', countable: true, image: '/image/words/mango.webp', ... }
```

### 3.2 `dialogPrompts[]`

```js
dialogPrompts: [
  { id: 'greet-1', npc: 'ong_tu',
    askEn: 'How are you today?', askVi: 'Hôm nay con khoẻ không?',
    image: null,
    answers: [ { en: "I'm fine, thank you.", vi: 'Con khoẻ, cảm ơn ông.' },
               { en: "I'm good. And you?",   vi: 'Con ổn. Còn ông?' } ],
    keywords: ['fine'],                       // hoặc ['good'] — đạt nếu đủ mọi từ khoá
    replyEn: "I'm fine too. Thank you!", replyVi: 'Ông cũng khoẻ. Cảm ơn con!' },
]
```

Kiểm tự động: `npc` có trong `HUMAN_CAST`; mọi `keywords` xuất hiện trong ít nhất một `answers[].en`; mỗi câu ≤ 12 từ.

### 3.3 `trueFalse[]`

```js
trueFalse: [
  { en: 'This is my sister.', vi: 'Đây là chị/em gái tôi.', image: '/image/scenes/family-brother.webp',
    isTrue: false, whyVi: 'Trong tranh là anh trai, nên phải là "brother".', wordIds: ['sister', 'brother'] },
]
```

Kiểm tự động: ảnh tồn tại; `whyVi` có khi `isTrue: false`; trong bài có cả câu đúng và câu sai.

### 3.4 Nội dung mẫu

Soạn cho 12 bài `int-u1`–`int-u3`: `plural`/`countable` cho danh từ, 2–3 `dialogPrompts`/bài, 4–6 `trueFalse`/bài (chỉ ở bài đã có ảnh phù hợp; thiếu ảnh thì ghi `sceneBrief` để Sonny làm hình theo `COWDI-AI-PROMPT-BLOCKS`, không tự lấy ảnh trên mạng). Ghi ảnh mới vào `REG-IMAGE-CATALOG.md`.

---

## 4. Dọn code cũ (PR 4c)

Điều kiện: cờ `screenSystemV1` bật cho mọi người ≥ 2 tuần, không có lỗi nghiêm trọng mở.

- Gỡ code tab cũ trong `LessonDetailPage.jsx` (vocab, flashcard, grammar, reading, listen, speak, quiz) đã được thay bằng màn T trong registry.
- Gỡ cờ `screenSystemV1` và mục bật thử ẩn.
- Giữ `PictureLesson` (nhóm Mới học) nếu chưa chuyển.
- PR ghi số dòng gỡ, `npm run build` + `npm test` xanh, 3 bài golden chạy đủ 6 màn.

---

## 5. Test

| # | Kiểm |
|---|---|
| Q1 | Mọi màn mới: 360×640 không cuộn trang (F-05 chỉ cuộn trong thẻ đoạn văn) |
| Q2 | F-02: bàn phím luôn đủ chữ để ghép đúng; chữ trùng đúng số lần |
| Q3 | F-04, F-10: từ chối mic → hoàn thành được, `skillsHit.speak` không ghi |
| Q4 | F-07: 4 giỏ luôn khác nhau, đúng 1 giỏ đúng; số nhiều đúng với 20 danh từ mẫu |
| Q5 | F-10: bộ test chấm với 20 câu mẫu (đạt / không đạt) khớp kỳ vọng |
| Q6 | F-11: tỉ lệ đúng/sai trong 40–60% |
| Q7 | `screen_stat_daily` không có cột người dùng; gửi khi sandbox → không ghi |
| Q8 | Validator báo lỗi đúng với dữ liệu `dialogPrompts`, `trueFalse` sai mẫu |
| Q9 | PR 4c: không còn tham chiếu tới tab cũ (`grep`), golden chạy đủ |

## 6. Definition of Done (mỗi PR)

- [ ] Test của PR đó xanh; `npm test` toàn bộ xanh
- [ ] Ảnh chụp 360×640 mỗi màn mới (đang chơi + đúng + sai)
- [ ] Câu dẫn `draft` đủ 4 × 3 vùng cho mỗi màn mới
- [ ] Màn mới ở trạng thái `test`; Sonny bật `on` sau khi xem thống kê

## 7. Không được làm

- Không gọi dịch vụ AI để chấm hay tạo hội thoại.
- Không lưu ghi âm.
- Không lưu thống kê theo người dùng.
- Không đổi công thức Sữa, Gem, Đá, điểm kỹ năng pet.
- Không tự lấy ảnh trên mạng.
