# STD-QUESTION-QUALITY v1.0 — Quy tắc tạo và rà soát câu hỏi · Cowdi English

| Mục | Giá trị |
|---|---|
| Mã tài liệu | STD-QUESTION-QUALITY |
| Phiên bản | 1.0 · 25/11/2026 |
| Phạm vi | Mọi câu hỏi trắc nghiệm: quiz trong bài, bài kiểm tra Tầng, bài kiểm tra unit, câu tự sinh từ danh sách từ, câu do AI (Gemini, Claude) soạn |
| Bổ sung cho | `STD-LESSON-CONTENT-v1.0.md` (mục 1.6, 1.9), `schema.js`, `CHK-LESSON-REVIEW.md` |
| Người dùng | AI soạn câu hỏi, AI rà soát kho câu hỏi, người duyệt (Sonny), lập trình viên viết validator |

Tài liệu này trả lời: **một câu hỏi đạt chuẩn trông thế nào, và AI phải tự kiểm gì trước khi xuất câu hỏi.** Câu hỏi vi phạm một trong 5 luật cứng (mục 1) thì **không được xuất**, kể cả khi các phần khác đều tốt.

> Lưu ý tên trường: tài liệu dùng một khung câu hỏi chuẩn (mục 2.1). Nếu `schema.js` hoặc bộ sinh câu hỏi Tầng dùng tên trường khác, giữ **nghĩa** của trường, đổi tên cho khớp mã.

---

## 0. Hai lỗi thật đã gặp (25/11/2026)

| Màn hình | Hiện tượng | Vi phạm |
|---|---|---|
| Tầng 2 · Sơ trung cấp · Câu 6/6 | Lời dẫn "Nghe và chọn câu đúng:" nhưng **không có âm thanh**, không có nút loa, không có nội dung gì để dựa vào. Người học chỉ có thể đoán | L2 (thiếu dữ kiện), L4 (lời dẫn không nói chọn *nghĩa* hay chọn *câu*) |
| Tầng 1 · Nền tảng cơ bản · Câu 6/6 | Hình 🔴 hỏi "Hình này là từ tiếng Anh nào?". Hình tròn đỏ có thể là *red*, *circle*, *ball*, *dot*. Emoji 🔴 còn bị lặp lại trong lời dẫn. Đáp án nhiễu *star* (hình), *hi* (lời chào), *buffalo* (con vật) khác nhóm với *red* (màu), loại trừ được mà không cần biết từ | L1 (nguy cơ nhiều đáp án đúng), L4 (không nói hỏi màu hay hình), L5 (đáp án nhiễu khác nhóm) |

**Nguyên nhân gốc:** câu hỏi được sinh tự động bằng cách lấy ngẫu nhiên từ toàn kho làm đáp án nhiễu, không theo nhóm nghĩa; giao diện `PlacementTest` không đọc `audioText`; không có bước kiểm tra trước khi hiển thị. Vì vậy, sửa lời nhắc cho AI là **chưa đủ**: cần thêm validator (mục 5) và chặn ở giao diện (mục 5.3).

---

## 1. Năm luật cứng (vi phạm = loại câu)

| # | Luật | Kiểm thế nào |
|---|---|---|
| **L1** | **Một và chỉ một đáp án đúng.** Không có đáp án nhiễu nào mà người bản ngữ hoặc giáo viên có thể biện hộ là "cũng đúng". | Giải mù (mục 4, bước 1). Liệt kê mọi cách gọi khác của hình/câu; nếu có cách gọi nằm trong đáp án nhiễu thì sửa. |
| **L2** | **Đủ dữ kiện để trả lời.** Mọi thứ lời dẫn nhắc tới phải có trong dữ liệu câu hỏi: "Nghe" → có `audioText` (hoặc `audioUrl`); "Hình" → có `image` hoặc `emoji`; "Đọc đoạn" → có `passage`. | Đối chiếu động từ trong lời dẫn với trường của `stimulus`. |
| **L3** | **Không lộ đáp án.** Phần kích thích (`stimulus`) và lời dẫn không chứa chữ của đáp án đúng; không lặp emoji/hình vào lời dẫn; câu nghe không hiện `audioText` trước khi trả lời. | So chuỗi đáp án đúng với `promptVi` và `stimulus.text`. |
| **L4** | **Lời dẫn nói rõ việc cần làm và loại đáp án.** Người học biết phải chọn *từ*, *nghĩa*, *câu*, *màu*, *hình dạng*… mà không cần đoán ý người ra đề. | Đọc lời dẫn mà che các lựa chọn: có biết mình đang tìm loại gì không? |
| **L5** | **Đáp án nhiễu cùng nhóm.** Cùng loại từ, cùng nhóm nghĩa (`answerCategory`), cùng ngôn ngữ, cùng dạng viết, độ dài tương đương. Không loại trừ được chỉ bằng mẹo. | Kiểm `category` của từng đáp án; so độ dài. |

Ngoài 5 luật cứng là các quy tắc ở mục 3: vi phạm thì sửa hoặc ghi chú để duyệt, chưa tới mức loại câu.

---

## 2. Khung dữ liệu và hợp đồng theo dạng câu

### 2.1 Khung một câu hỏi

```json
{
  "id": "t1-q006",
  "type": "image-pick-word",
  "tier": 1,
  "skill": "vocab",
  "promptVi": "Màu này là gì?",
  "stimulus": {
    "text": null,
    "audioText": null,
    "audioUrl": null,
    "image": null,
    "emoji": "🟥",
    "swatch": "#E53935"
  },
  "answerCategory": "color",
  "options": ["red", "blue", "yellow", "green"],
  "correct": 0,
  "explanation": "Ô màu đỏ là \"red\". Blue là xanh dương, yellow là vàng, green là xanh lá.",
  "sourceWords": ["red"],
  "review": { "blindAnswer": 0, "ambiguityRisk": "none", "notes": "" }
}
```

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `type` | ✓ | Một trong các dạng ở 2.2. Không tự đặt dạng mới |
| `tier` / `level` | ✓ | Tầng hoặc cấp; quyết định phạm vi từ vựng (3.6) |
| `skill` | ✓ | `vocab \| grammar \| usage \| listening \| reading \| strategy` |
| `promptVi` | ✓ | Lời dẫn tiếng Việt (3.1) |
| `stimulus` | ✓ | Ít nhất một trường khác `null`, đúng với dạng câu |
| `answerCategory` | ✓ với câu từ vựng | `color, shape, animal, food, job, body, number, greeting, action, feeling, place, object…` |
| `options` | ✓ | 4 lựa chọn (3 với cấp Starter có hình) |
| `correct` | ✓ | Chỉ số đáp án đúng |
| `explanation` | ✓ | Một câu, nói vì sao đúng và vì sao đáp án nhiễu hấp dẫn nhất sai |
| `review` | ✓ khi AI soạn | Kết quả tự rà (mục 4). Có thể bỏ khi đưa vào kho |

### 2.2 Hợp đồng theo dạng câu

| `type` | Lời dẫn chuẩn | `stimulus` bắt buộc | `options` là | Cấm |
|---|---|---|---|---|
| `image-pick-word` | "Đây là con gì?", "Đây là cái gì?", "Màu này là gì?", "Hình dạng này là gì?" | `image` hoặc `emoji` (màu: `swatch`) | Từ tiếng Anh cùng `answerCategory` | Lời dẫn chung chung "Hình này là từ nào?" khi hình có >1 cách gọi |
| `word-pick-image` | "Chọn hình đúng với từ: **cat**" | `text` (từ EN) | Hình/emoji cùng nhóm | Hình nhiễu có thể gọi bằng chính từ đó |
| `listen-pick-image` | "Nghe và chọn hình đúng" | `audioText` (từ EN) | Hình/emoji cùng nhóm | Hiện chữ của từ đang nghe |
| `listen-pick-word` | "Nghe và chọn từ bạn nghe được" | `audioText` | Từ EN gần âm hoặc cùng nhóm | Hiện `audioText` |
| `listen-pick-meaning` | "Nghe câu tiếng Anh, chọn nghĩa đúng" | `audioText` (câu EN) | Câu tiếng Việt | Hiện `audioText`; đáp án nhiễu khác chủ đề hoàn toàn |
| `listen-pick-sentence` | "Nghe và chọn câu bạn nghe được" | `audioText` (câu EN) | Câu EN, khác nhau 1–2 từ | Đáp án nhiễu sai ngữ pháp rõ ràng |
| `word-pick-meaning` | "**chef** nghĩa là gì?" | `text` (từ EN) | Nghĩa tiếng Việt cùng nhóm | Nghĩa nhiễu đồng nghĩa với nghĩa đúng |
| `meaning-pick-word` | "\"đầu bếp\" tiếng Anh là gì?" | `text` (nghĩa VI) | Từ EN cùng nhóm | Từ nhiễu đồng nghĩa (cook / chef) |
| `fill-blank` | "Chọn từ điền vào chỗ trống" | `text` có **đúng một** `___` | Từ/cụm cùng loại từ | Hơn một đáp án đúng ngữ pháp và đúng nghĩa |
| `grammar-choice` | "Chọn câu đúng ngữ pháp" | — hoặc `text` | Câu EN | Hai câu cùng đúng ở các biến thể Anh-Mỹ |
| `reading-mcq` | "Đọc đoạn văn và trả lời" | `text` (đoạn) + `evidence` | Câu trả lời | Câu trả lời không có căn cứ trong đoạn |

**Quy tắc chuyển dạng:** nếu không có âm thanh (không `audioText`, không `audioUrl`) thì **không được sinh dạng `listen-*`**. Chuyển sang dạng đọc tương ứng: `listen-pick-meaning` → `sentence-pick-meaning` (hiện câu EN, chọn nghĩa).

---

## 3. Quy tắc theo từng phần

### 3.1 Lời dẫn (`promptVi`)
1. Tiếng Việt có dấu đủ, ≤12 chữ, bắt đầu bằng động từ hoặc câu hỏi.
2. Nêu loại đáp án: *từ, nghĩa, câu, hình, màu, hình dạng, con vật, nghề…*
3. Chữ "Nghe" chỉ xuất hiện khi `type` bắt đầu bằng `listen-`. Chữ "Hình" chỉ khi có `image`/`emoji`/`swatch`.
4. Không kết thúc bằng dấu hai chấm treo mà sau đó không có nội dung.
5. Không chèn emoji trang trí vào lời dẫn (emoji chỉ nằm ở `stimulus`).
6. Từ tiếng Anh cần hỏi trong lời dẫn được in đậm: "**chef** nghĩa là gì?"

### 3.2 Hình và emoji
1. **Một vật, một tên chính.** Trước khi dùng, liệt kê mọi từ tiếng Anh người học có thể gọi hình đó. Nếu >1 từ nằm trong phạm vi tầng thì: hoặc đổi hình, hoặc khoá loại đáp án trong lời dẫn và đảm bảo các tên khác không có trong `options`.
2. **Màu** dùng ô màu (`swatch` hoặc 🟥🟦🟨🟩🟧🟪⬛⬜🟫) với lời dẫn "Màu này là gì?". Không dùng vật có màu (🍎, 🔴, ❤️) để hỏi màu.
3. **Hình dạng** dùng hình viền một màu trung tính, lời dẫn "Hình dạng này là gì?". Đáp án nhiễu toàn là hình dạng.
4. **Emoji dễ hiểu nhầm** (không dùng khi hỏi "đây là gì" nếu chưa khoá loại đáp án):

| Emoji | Có thể hiểu là |
|---|---|
| 🔴 | red, circle, ball, dot |
| ❤️ | heart, red, love |
| ⭐ | star, yellow |
| 🍎 | apple, red, fruit |
| 🐃 / 🐂 / 🐄 | buffalo, ox, cow (khác nhau theo máy) |
| 🏠 / 🏡 | house, home |
| 👦 / 🧒 | boy, child, kid |
| 🚗 / 🚕 | car, taxi |
| ☀️ | sun, sunny, hot |
| 🌧️ | rain, rainy, cloud |

5. Emoji hiện khác nhau giữa Android, iOS, Windows. Con vật đặc thù Việt Nam (trâu, xe máy, nón lá) **ưu tiên ảnh riêng** `/image/words/<slug>.webp`, không dựa vào emoji.
6. Ảnh không chứa chữ (STD-LESSON-CONTENT mục 6).

### 3.3 Âm thanh
1. `audioText` là câu tiếng Anh tự nhiên, chính tả Mỹ. Tầng/cấp 1: 1–6 từ; cấp 2: ≤12 từ; luyện thi: ≤25 từ.
2. Câu nghe phải **tự phát một lần khi hiện câu** và có **nút nghe lại** (hợp đồng giao diện, mục 5.3).
3. Không dùng tên riêng khó đọc, số liệu, ký hiệu (%, &, $) trong `audioText`: giọng đọc máy đọc sai.
4. Với `listen-pick-meaning`, đáp án nhiễu nên khác câu nghe ở **một ý then chốt** (người, hành động, hoặc vật) để kiểm tra việc nghe thật, không chỉ bắt một từ khoá.

### 3.4 Đáp án và đáp án nhiễu
1. Số lựa chọn: 4 (Starter có hình: 3). Không trùng nhau, kể cả khác hoa/thường hoặc khác dấu câu.
2. **Nguồn lấy đáp án nhiễu, theo thứ tự ưu tiên:** cùng bài và cùng `answerCategory` → cùng unit và cùng nhóm → cùng nhóm trong kho, đúng phạm vi tầng. **Không lấy ngẫu nhiên toàn kho.**
3. Không dùng từ đồng nghĩa, gần nghĩa hoặc cũng đúng làm đáp án nhiễu: *hi/hello*, *cook/chef*, *mom/mother*, *big/large*, *home/house*.
4. Không dùng biến thể chính tả của đáp án đúng (*color/colour*).
5. Không dùng "Tất cả đều đúng", "Không có đáp án nào".
6. Đáp án đúng **không** được luôn là câu dài nhất hoặc chi tiết nhất. Độ dài các lựa chọn lệch nhau không quá khoảng 50%.
7. Ngôn ngữ thống nhất: hoặc cả 4 tiếng Anh, hoặc cả 4 tiếng Việt.
8. Trong một bộ câu (một bài kiểm tra), vị trí đáp án đúng phân bố đều: mỗi vị trí khoảng 20–30%, không quá 2 câu liên tiếp cùng vị trí.

### 3.5 Ngôn ngữ
1. Tiếng Anh Mỹ (STD-LESSON-CONTENT 1.8). Câu EN đúng ngữ pháp, tự nhiên, có mạo từ đúng.
2. Tiếng Việt có dấu đầy đủ, tự nhiên, cùng mức trang trọng giữa các lựa chọn.
3. Bản dịch đúng nghĩa và đúng thì: "The chef **is cooking**" → "Đầu bếp **đang** nấu", không phải "Đầu bếp nấu".
4. Không định kiến giới, nghề, vùng miền (STD-LESSON-CONTENT 1.7).

### 3.6 Phạm vi và độ khó
1. Từ và cấu trúc dùng trong câu hỏi (kể cả trong đáp án nhiễu) phải nằm trong phạm vi đã dạy tới tầng/cấp đó. Ghi các từ dùng vào `sourceWords`.
2. Độ khó đến từ **nội dung cần biết**, không đến từ lời dẫn mơ hồ, hình xấu hay bẫy chữ.
3. Một câu kiểm tra **một** điều (một từ, một điểm ngữ pháp, một ý nghe).

### 3.7 Giải thích (`explanation`)
Một câu tiếng Việt, ≤30 chữ: vì sao đáp án đúng đúng, và vì sao đáp án nhiễu hấp dẫn nhất sai. Không chỉ nhắc lại đáp án.

---

## 4. Quy trình AI tự rà trước khi xuất

1. **Bước 1 · Giải mù:** Chỉ dùng những gì người học thấy và nghe, **không nhìn `correct`**, tự chọn đáp án và ghi vào `review.blindAnswer`.
2. **Bước 2 · Thử loại trừ bằng mẹo:** Chỉ nhìn hình thức (độ dài, loại từ, nhóm nghĩa, ngôn ngữ), có loại được ≥2 đáp án nhiễu không? Có → vi phạm L5.
3. **Bước 3 · Đối chiếu 5 luật cứng và mục 3:** Ghi rủi ro vào `review.ambiguityRisk`: `none | low | high` (`high` → không xuất, đưa vào "Cần Sonny xem").
4. **Bước 4 · Rà cả bộ:** Phân bố vị trí đáp án đúng, không lặp từ/ý, câu sau không lộ đáp án câu trước, đủ dạng câu & `skill`.
5. **Bước 5 · Báo cáo:** Số câu xuất, số câu loại, số câu `low` cần xem, lý do từng câu bị loại.

---

## 5. Kiểm tra tự động và chặn ở giao diện

### 5.1 Validator (`shared/question-rules.js` + `scripts/validate-lessons.mjs`)

| Mã | Điều kiện | Mức |
|---|---|---|
| `Q-L2-AUDIO` | `type` bắt đầu `listen-` hoặc lời dẫn ra lệnh nghe mà không có `audioText` lẫn `audioUrl` | Lỗi |
| `Q-L2-PROMPT` | Lời dẫn ra lệnh nghe mà `type` không bắt đầu `listen-` | Lỗi |
| `Q-L2-IMAGE` | Lời dẫn hỏi "Hình này"/"Màu này"/"Hình dạng này" mà không có `image`/`emoji`/`swatch` | Lỗi |
| `Q-L3-LEAK` | Chữ của đáp án đúng xuất hiện trong `promptVi` hoặc `stimulus.text` (trừ dạng `word-pick-meaning`) | Lỗi |
| `Q-L3-EMOJI` | `stimulus.emoji` xuất hiện trong `promptVi` | Lỗi |
| `Q-OPT-COUNT` | Số lựa chọn ngoài 3–4 (5 cho `heading`/`matching-info`), hoặc `correct` ngoài phạm vi | Lỗi |
| `Q-OPT-DUP` | Hai lựa chọn trùng sau khi chuẩn hoá | Lỗi |
| `Q-L5-CAT` | Có từ điển nhóm nghĩa: lựa chọn khác `answerCategory` | Lỗi |
| `Q-L5-LANG` | Lựa chọn lẫn tiếng Anh và tiếng Việt (trừ siêu ngôn ngữ/tên riêng) | Lỗi |
| `Q-L1-SYN` | Lựa chọn nằm trong bảng từ đồng nghĩa của đáp án đúng | Lỗi |
| `Q-AMBIG-EMOJI` | `emoji` nằm trong bảng 3.2.4 mà lời dẫn không khoá loại đáp án | Cảnh báo |
| `Q-LEN` | Đáp án đúng dài nhất và dài hơn trung bình nhiễu >50% | Cảnh báo |
| `Q-POS` | Trong một bộ, một vị trí đáp án đúng >35% hoặc ≥3 câu liền cùng vị trí | Cảnh báo |
| `Q-EXPL` | Thiếu `explanation` hoặc `explanation` chỉ lặp đáp án | Lỗi (bài v2), cảnh báo (bài cũ) |

### 5.2 Bộ sinh câu tự động
- Lấy đáp án nhiễu theo 3.4.2 (cùng `category`), không lấy ngẫu nhiên toàn kho.
- Chạy validator **trên từng câu vừa sinh**; câu lỗi thì sinh lại (tối đa 3 lần), vẫn lỗi thì bỏ, không hiển thị.

### 5.3 Hợp đồng giao diện
- Component câu hỏi `listen-*`: tự phát âm khi hiện câu, có nút loa nghe lại (≥56 px với cấp 1). Thiếu nguồn âm thanh, hoặc máy không có giọng tiếng Anh → **không hiển thị câu đó**, ghi log, thay bằng câu khác.
- Không cho toast/thông báo che vùng câu hỏi và lựa chọn trong lúc làm bài.

---

## 6. Sửa hai lỗi thật

### 6.1 Câu nghe thiếu âm thanh (Tầng 2)
Đúng: `type: "listen-pick-meaning"`, `promptVi: "Nghe câu tiếng Anh, chọn nghĩa đúng"`, có `audioText`, 4 đáp án nhiễu cùng chủ đề khác nhau ở một ý then chốt, có `explanation`.

### 6.2 Câu hình mơ hồ (Tầng 1)
Đúng (hỏi màu): `type: "image-pick-word"`, `promptVi: "Màu này là gì?"`, `emoji: "🟥"`, `swatch: "#E53935"`, `answerCategory: "color"`, `options: ["red", "blue", "yellow", "green"]`.

---

## 7. Lịch sử thay đổi

| Phiên bản | Ngày | Nội dung |
|---|---|---|
| 1.0 | 25/11/2026 | Bản đầu: 5 luật cứng, hợp đồng 11 dạng câu, quy trình tự rà 5 bước, 14 mã kiểm tra validator, sửa 2 lỗi thật ở Tầng 1 và Tầng 2 |
