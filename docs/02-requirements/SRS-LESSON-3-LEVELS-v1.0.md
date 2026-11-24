# SRS-LESSON-3-LEVELS — Nhu cầu xây dựng bài học theo 3 cấp (Cowdi English)

> **Mã tài liệu:** SRS-LESSON-3-LEVELS · **Chuẩn tham chiếu:** ISO/IEC/IEEE 29148:2018 · **Phiên bản:** 1.0 · **Trạng thái:** Approved · **Ngày phê duyệt:** 2026-11-24
> **Tên gốc:** `LESSON-REQUIREMENTS-3-LEVELS.md` · **Đi kèm:** [SDD-LEARNING-GROUPS-v2.0.md](../04-design/SDD-LEARNING-GROUPS-v2.0.md) (thiết kế kỹ thuật) · [STD-LESSON-CONTENT-v1.0.md](../05-implementation/content/STD-LESSON-CONTENT-v1.0.md) (chuẩn cấu trúc bài v2)
> **Dùng cho:** người soạn nội dung, người làm hình, và AI/Dev khi dựng dữ liệu mẫu.

## Lịch sử sửa đổi

| Phiên bản | Ngày | Nội dung | Người phê duyệt |
|---|---|---|---|
| 1.0 | 2026-11-24 | Bản chính thức: 3 quyết định gốc, yêu cầu 3 cấp (Starter / Intermediate / Exam), chương trình 10 unit Starter (40 bài), lộ trình nâng cấp Cấp 2, phát âm chuẩn Cấp 3 | Product Owner (Sonny) |

---

## 0. Nguyên tắc chung

| Cấp | Người học | Cảm giác cần đạt | Phát âm |
|---|---|---|---|
| **Cấp 1 · Mới học** (Starter, Pre-A1–A1) | Trẻ em học cùng phụ huynh, người lớn mất gốc | "Nhìn hình là hiểu, bấm là nghe" | **Nghe và nhắc lại, không chấm điểm** |
| **Cấp 2 · Trung bình** (A2–B1, rồi C1–C2) | Đã biết chút ít, muốn giao tiếp | "Hiểu, dùng được câu" | Có "Nói theo", **chấm nhẹ, không chặn** |
| **Cấp 3 · Luyện thi** (IELTS, TOEIC, B1, B2) | Có mục tiêu điểm số | "Đúng chuẩn đề thi" | **Phát âm đúng + chuẩn là yêu cầu bắt buộc**, chấm tới từng âm |

Ba quyết định gốc (Sonny chốt 24/11/2026):

1. Phát âm đúng quá khó với người Việt mới học, nên **bỏ yêu cầu phát âm khỏi cấp 1 và cấp 2**. Các bài phát âm đã bị loại khỏi lộ trình chung giờ chuyển sang **cấp 3**.
2. **Toàn bộ bài hiện có, kể cả bài dễ nhất, tính từ cấp 2.** Cấp 1 phải xây mới từ đầu: thật cơ bản, nhiều hình.
3. Luyện phát âm chuẩn là **nhu cầu riêng của người luyện thi**.

---

## 1. Hiện trạng nội dung (đo trên repo, commit `5187bf8`)

| Chỉ số | Giá trị | Ảnh hưởng |
|---|---|---|
| Bài trong lộ trình chung | 41 bài, 737 từ (704 từ không trùng) | Toàn bộ chuyển sang cấp 2 |
| Hình minh hoạ cho từ | **0 ảnh riêng cho từng từ**, chỉ có emoji (737/737). Ảnh `public/image/subtopics/*` là ảnh bìa chủ đề | Cấp 1 cần làm bộ ảnh mới |
| Đoạn văn (reading) | 19–40 từ, **41/41 bài không có bản dịch**, trung bình 2,9 câu hỏi. Đoạn là các câu rời ghép lại, không thành câu chuyện | Cấp 2 cần viết lại |
| Ngữ pháp | Unit cũ 3, 5, 6 chỉ có 1 điểm ngữ pháp, 3 ví dụ. Phần "Nghe câu" chỉ có 3 câu | Cấp 2 cần bổ sung |
| Quiz trong bài | 5–8 câu | Cấp 2 nâng lên ≥8 |
| Chấm "Nói theo" | Nhận dạng giọng nói của trình duyệt rồi so **từ** (khoảng cách Levenshtein ≤1). **Không chấm âm** | Đủ cho cấp 2; không đủ cho cấp 3 |
| Bài phát âm đang ngoài lộ trình | `alphabet`, `pronunciation-vowels`, `-consonants`, `-tricky`, `-stress` | Chuyển vào cấp 3 |

---

## 2. Cấp 1 · Mới học — xây mới

### 2.1 Yêu cầu nội dung

| Hạng mục | Yêu cầu |
|---|---|
| Thời lượng một bài | 5–7 phút |
| Số từ một bài | **5–6 từ**, chỉ chọn từ **vẽ được** (đồ vật, con vật, màu, số, hành động nhìn thấy) |
| Mẫu câu | 1 mẫu câu/bài, 2–5 từ, có chỗ trống thay bằng hình. Ví dụ `I like ___.`, `This is a ___.` |
| Ngữ pháp | **Không giải thích ngữ pháp.** Chỉ học qua mẫu câu |
| Đọc | Không có đoạn văn. Chữ tiếng Anh luôn đi kèm hình |
| Phiên âm IPA (International Phonetic Alphabet) | **Ẩn** ở cấp 1 |
| Nghĩa tiếng Việt | Luôn hiện, chữ nhỏ hơn chữ tiếng Anh |
| Âm thanh | Mỗi từ và mẫu câu có tiếng đọc. Bấm hình là nghe |
| Phát âm | Bước "Nhắc lại" là **tuỳ chọn**: bấm micro hoặc nút "Con đã nói", pet cổ vũ, **không chấm điểm, không chặn** |
| Lời hướng dẫn | Tiếng Việt, ngắn ≤8 chữ, có nút loa đọc bằng giọng Việt (trẻ chưa đọc thạo) |

### 2.2 Cấu trúc một bài (định dạng `picture`)

1. **Xem và nghe**: 5–6 thẻ hình, bấm từng thẻ để nghe từ. Phải bấm hết mới sang bước sau.
2. **Nghe chọn hình**: nghe từ, chọn 1 trong 3–4 hình (6 lượt).
3. **Ghép hình với chữ**: kéo chữ vào hình (1 màn, đủ số từ của bài).
4. **Mẫu câu**: tranh có câu mẫu. Bấm hình để điền chỗ trống, nghe cả câu.
5. **Nhắc lại** (tuỳ chọn): như 2.1.
6. **Thử thách**: 6 câu, toàn bằng hình hoặc âm thanh; **đúng ≥4/6 là qua bài**.

Câu hỏi bước 2, 3, 6 **sinh tự động từ danh sách từ**. Người soạn chỉ nhập từ, nghĩa, hình, mẫu câu. Đây là điểm then chốt để làm được 40 bài với ít công.

### 2.3 Dữ liệu một bài

```js
{
  id: 's1-pets', track: 'starter', level: 'starter', format: 'picture',
  title: 'Thú cưng', icon: '🐱',
  words: [
    { word: 'cat',  meaning: 'con mèo', image: '/image/words/cat.webp',  emoji: '🐱', audio: null },
    { word: 'dog',  meaning: 'con chó', image: '/image/words/dog.webp',  emoji: '🐶', audio: null },
    // 5–6 từ
  ],
  pattern: { en: 'I have a ___.', vi: 'Em có một ___.', image: '/image/scenes/s1-pets.webp' },
}
```

> Lưu ý đồng bộ với [STD-LESSON-CONTENT-v1.0.md](../05-implementation/content/STD-LESSON-CONTENT-v1.0.md): bài v2 khai báo thêm `contentVersion: 2`, `unit: 's1-uN'`, `description`, `instructionsVi` (6 bước) và `parentTip` để đạt chuẩn `validate-lessons.mjs`.

`emoji` dùng thay ảnh khi ảnh chưa làm xong, để dựng và thử bài trước khi có đủ hình. `audio: null` thì dùng giọng đọc của máy.

### 2.4 Chương trình cấp 1 (10 unit · 40 bài · ~210 từ + 26 chữ cái)

| Unit | Bài (id · chủ đề · từ) |
|---|---|
| **S1 Xin chào** (`s1-u1`) | `s1-hello` chào hỏi: hello, hi, bye, yes, no, thank you · `s1-me` em là ai: boy, girl, baby, man, woman, friend · `s1-num-1` số 1–5 · `s1-num-2` số 6–10 |
| **S2 Màu và hình** (`s1-u2`) | `s1-color-1`: red, blue, yellow, green, orange, pink · `s1-color-2`: black, white, brown, purple, gray · `s1-shape`: circle, square, triangle, star, heart, rectangle · `s1-size`: big, small, long, short, fast, slow |
| **S3 Con vật** (`s1-u3`) | `s1-pets`: cat, dog, fish, bird, rabbit, mouse · `s1-farm`: cow, pig, duck, chicken, horse, buffalo · `s1-wild`: lion, tiger, elephant, monkey, bear, snake · `s1-water`: frog, turtle, crab, shrimp, shark, whale |
| **S4 Gia đình và cơ thể** (`s1-u4`) | `s1-family-1`: mom, dad, brother, sister, baby, family · `s1-family-2`: grandma, grandpa, uncle, aunt, cousin · `s1-face`: head, eye, ear, nose, mouth, hair · `s1-body`: hand, arm, leg, foot, finger, tummy |
| **S5 Ăn uống** (`s1-u5`) | `s1-fruit`: apple, banana, mango, watermelon, grape, coconut · `s1-food`: rice, bread, egg, noodles, cake, candy · `s1-drink`: water, milk, juice, tea, soda · `s1-veg`: carrot, tomato, potato, corn, cucumber, cabbage |
| **S6 Chữ cái A–Z** (`s1-u6`) | `s1-abc-1` A–F · `s1-abc-2` G–L · `s1-abc-3` M–R · `s1-abc-4` S–Z. Mỗi chữ đi với 1 từ đã học có hình (A–apple, B–ball, C–cat…). **Không chấm phát âm** |
| **S7 Trường và đồ chơi** (`s1-u7`) | `s1-school`: book, pen, pencil, ruler, eraser, bag · `s1-class`: desk, chair, board, door, window, clock · `s1-toy`: ball, doll, kite, teddy bear, robot, toy car · `s1-class-do`: sit down, stand up, open, close, look, listen |
| **S8 Quần áo và nhà em** (`s1-u8`) | `s1-clothes`: shirt, T-shirt, dress, pants, skirt, shoes · `s1-wear`: hat, socks, jacket, scarf, gloves, glasses · `s1-home`: house, room, bed, table, TV, lamp · `s1-kitchen`: cup, bowl, plate, spoon, fork, chopsticks |
| **S9 Hành động và cảm xúc** (`s1-u9`) | `s1-move`: run, jump, walk, swim, dance, sing · `s1-daily`: eat, drink, sleep, read, write, draw · `s1-play`: play, fly a kite, ride a bike, climb, kick, throw · `s1-feel`: happy, sad, angry, tired, hungry, scared |
| **S10 Ngoài trời** (`s1-u10`) | `s1-weather`: sunny, rainy, cloudy, windy, hot, cold · `s1-nature`: tree, flower, river, mountain, sky, sea · `s1-go`: bike, bus, motorbike, boat, plane, train · `s1-place`: home, school, park, shop, market, hospital |

Mỗi unit kết thúc bằng bài kiểm tra unit 10 câu, cũng toàn bằng hình hoặc âm thanh.

### 2.5 Yêu cầu hình ảnh

| Hạng mục | Yêu cầu |
|---|---|
| Số lượng | ~210 ảnh từ + 36 tranh mẫu câu (1 tranh/bài, trừ 4 bài chữ cái) + 26 thẻ chữ cái ≈ **270 ảnh** |
| Ảnh từ | 512×512 px, WebP, ≤40 KB, một vật ở giữa, nền trơn sáng hoặc trong suốt, **không có chữ trong ảnh** (để dùng lại cho mọi ngôn ngữ) |
| Tranh mẫu câu | 1024×640 px, WebP, ≤90 KB, có Cowdi hoặc pet trong tranh |
| Phong cách | Thống nhất một phong cách, khớp tranh pet Cowdi; viết 1 trang hướng dẫn phong cách trước khi làm hàng loạt |
| Đặt tên | `public/image/words/<từ-viết-thường-nối-gạch>.webp`, `public/image/scenes/<lessonId>.webp` |
| Nội dung | Thân thiện với trẻ; người trong hình đa dạng; bối cảnh Việt Nam khi hợp (chợ, xe máy, con trâu) |
| Quản lý | Giữ file gốc và ghi nguồn tạo, giấy phép từng ảnh. Duyệt trong trang quản lý ảnh trước khi đưa lên |

Bộ ảnh này là **tài sản dài hạn (long-term asset)**: dùng lại cho flashcard, mini-game, đấu pet, sách in hay sản phẩm khác.

### 2.6 Âm thanh cấp 1

- Giọng đọc của trình duyệt khác nhau giữa các máy, có máy Android không có giọng tiếng Anh. Trẻ nhắc lại đúng cái nghe được, nên **cấp 1 nên dùng file âm thanh dựng sẵn** (tổng hợp giọng nói chất lượng cao, tạo một lần, lưu `public/audio/words/<từ>.mp3`).
- Tốc độ chậm vừa phải (khoảng 0,8×), một giọng thống nhất cho cả cấp.
- Lời hướng dẫn tiếng Việt cũng làm sẵn file âm thanh.

### 2.7 Làm theo đợt (đừng sản xuất hết 270 ảnh ngay)

| Đợt | Nội dung | Điều kiện sang đợt sau |
|---|---|---|
| Đợt 0 | Engine bài `picture` + Unit S1 dùng **emoji** | Chạy ổn trên điện thoại |
| Đợt 1 | Ảnh + âm thanh cho S1–S3 (12 bài, ~80 ảnh). Thử với 10–20 gia đình | ≥60% hoàn thành ≥5 bài trong 7 ngày; phụ huynh không phàn nàn về độ khó |
| Đợt 2 | S4–S10 (28 bài, ~190 ảnh) | — |

**Lý do:** chi phí lớn nhất của cấp 1 là hình, chưa phải code. Thử với người dùng thật trước khi chuẩn hoá cả bộ, vì nếu định dạng bài chưa hợp với trẻ thì 270 ảnh phải làm lại.

---

## 3. Cấp 2 · Trung bình — dùng bài hiện có, nâng chất lượng

### 3.1 Thứ tự mới (39 bài cũ, xếp từ dễ tới khó) + lộ trình `advanced` C1–C2

| Unit | Bài |
|---|---|
| `int-u1` Làm quen | `greetings`, `family`, `colors`, `numbers` |
| `int-u2` Quanh ta | `school`, `weather`, `jobs`, `body` |
| `int-u3` Đời sống | `clothing`, `house`, `emotions`, `hobbies` |
| `int-u4` Ngữ pháp nền | `pronouns`, `articles`, `prepositions-place`, `wh-questions`, `numbers-basic` |
| `int-u5` Giao tiếp hằng ngày | `daily-phrases`, `time-and-date`, `directions`, `money-prices` |
| `int-u6` Tình huống | `at-restaurant`, `at-airport`, `daily-routine`, `food`, `travel` |
| `int-u7` Thế giới quanh ta | `nature`, `technology`, `shopping`, `health` |
| `int-u8` Ngữ pháp và diễn đạt | `tenses`, `comparisons`, `communication-skills` |
| `int-u9` Xã hội | `environment`, `media`, `culture` |
| `int-u10` Công việc và tri thức | `business`, `science`, `education` |

`exam-strategies`, `test-practice` chuyển sang cấp 3.

### 3.2 Chuẩn tối thiểu cho mỗi bài cấp 2

| Phần | Chuẩn | Hiện trạng |
|---|---|---|
| Từ vựng | 10–20 từ, có IPA, ví dụ, nghĩa | Đạt (một số bài 30 từ: chia theo nhóm 10 khi hiển thị) |
| Ngữ pháp | ≥2 điểm, mỗi điểm ≥4 ví dụ có câu dịch | Unit cũ 3, 5, 6 chưa đạt |
| Đoạn văn | **60–120 từ, thành câu chuyện hoặc hội thoại liền mạch**, dùng ≥60% từ của bài, có bản dịch, 3–5 câu hỏi | 41/41 bài chưa đạt |
| Nghe câu | ≥6 câu (lấy từ ví dụ ngữ pháp) | Chưa đạt ở bài 1 điểm ngữ pháp |
| Quiz | ≥8 câu, có ≥2 câu nghe, ≥2 câu dùng từ trong câu | 5–8 câu |
| Nói theo | Giữ nguyên cách chấm theo từ. Hiện %, **≥50% là khen, không chặn hoàn thành bài** | Đang có |
| Hình | Emoji là đủ; mỗi bài thêm 1 ảnh bìa (tuỳ chọn, dùng lại ảnh chủ đề có sẵn) | — |

### 3.3 Thứ tự nâng cấp nội dung

1. Viết lại đoạn văn có bản dịch cho `int-u1`–`int-u3` (12 bài). Đây là cửa vào cấp 2, người học mới từ cấp 1 sang sẽ gặp trước.
2. Bổ sung ngữ pháp cho các bài chỉ có 1 điểm (unit 3, 5, 6 cũ; chủ yếu nằm ở `int-u1`–`int-u3`, `int-u6`, `int-u7`).
3. Nâng quiz lên ≥8 câu cho cả 39 bài.
4. Lộ trình `advanced` (26 bài) kiểm lại theo cùng chuẩn sau.

---

## 4. Cấp 3 · Luyện thi — phát âm đúng và chuẩn

### 4.1 Unit mới bắt buộc `exam-pron` "Phát âm chuẩn"

Đặt ngay sau `exam-intro` ở các lộ trình **IELTS, B1, B2** (bắt buộc). Với **TOEIC**: tuỳ chọn, vì bài thi TOEIC Listening & Reading không có phần nói; thay vào đó luyện **nhận diện âm** (nghe phân biệt cặp âm).

| Bài | Trạng thái | Nội dung |
|---|---|---|
| `alphabet` | có sẵn | Đánh vần tên, địa chỉ (gặp ở IELTS Listening phần 1) |
| `pronunciation-vowels` | có sẵn | Nguyên âm ngắn/dài, nguyên âm đôi |
| `pronunciation-consonants` | có sẵn | /θ/ /ð/, /ʃ/ /tʃ/ |
| `pronunciation-tricky` | có sẵn | R/L, V/B/W, F/P, phụ âm cuối |
| `pronunciation-stress` | có sẵn | Trọng âm, ngữ điệu, âm /ə/ |
| `pron-endings` | **cần soạn** | Âm cuối -s/-es (/s/ /z/ /ɪz/), -ed (/t/ /d/ /ɪd/) |
| `pron-clusters` | **cần soạn** | Cụm phụ âm (str, spl, -sts, -lfth…) |
| `pron-linking` | **cần soạn** | Nối âm, nuốt âm, dạng yếu (weak forms) |
| `pron-intonation` | **cần soạn** | Ngữ điệu câu hỏi, câu liệt kê, nhấn câu (sentence stress) |
| `pron-minimal-pairs` | **cần soạn** | 40 cặp từ dễ nhầm với người Việt (ship/sheep, light/right, think/sink…), dạng nghe chọn và nói |

Các lỗi trên là lỗi thường gặp của người Việt học tiếng Anh theo kinh nghiệm giảng dạy chung (bỏ âm cuối, -s/-ed, cụm phụ âm, /θ ð/, trọng âm, ngữ điệu). Nên nhờ một giáo viên luyện thi duyệt danh sách trước khi soạn.

### 4.2 Yêu cầu chấm phát âm ở cấp 3

- Cách chấm hiện tại (so từ) **không đo được phát âm**: nói sai âm nhưng máy vẫn nhận đúng từ thì vẫn được điểm.
- Cần chấm ở **mức âm vị (phoneme)**. Phương án đã kiểm: Azure AI Speech **Pronunciation Assessment** (tài liệu Microsoft Learn): chấm độ chính xác tới từng âm vị, trả về điểm chính xác, độ trôi chảy, độ đầy đủ và ngữ điệu (prosody), nhưng chấm ngữ điệu chỉ có cho giọng en-US. Về giá, tài liệu ghi chi phí cơ bản bằng giá speech-to-text (gói Standard hoặc commitment); con số cụ thể theo VNĐ/phút cần tra lại trước khi chốt.
- Khoá API chỉ nằm trên server. Client gửi đoạn ghi âm qua `server/` (giới hạn ≤15 giây/lần). **Mặc định không lưu file ghi âm.**
- Ngưỡng qua cho bài trong `exam-pron`: độ chính xác ≥70 trên câu mẫu (đặt thành cấu hình). Hiện từng âm sai (tô đỏ) và cho nghe lại câu mẫu.
- Không có micro hoặc dịch vụ lỗi: vẫn hoàn thành bài bằng phần nghe chọn cặp âm, đánh dấu "chưa chấm phát âm".
- Các bài thi khác (IELTS Speaking, B1/B2 nói) có bước "Nói theo" **bắt buộc**, cùng cách chấm âm vị, ngưỡng thấp hơn (≥60).

### 4.3 Chi phí và mô hình doanh thu (Recommendation)

Chấm phát âm bằng AI có **chi phí tăng theo lượt dùng**, khác với nội dung tĩnh. Đề xuất:

- Miễn phí: N lượt chấm/ngày (ví dụ 20 câu) cho mọi người trong nhóm Luyện thi.
- Không giới hạn: gói trong **Thẻ mùa học tập / Thẻ tháng** (khớp quyết định D8).
- Đặt hạn mức chi tiêu tháng phía server, chạm hạn mức thì tự chuyển về chế độ "chưa chấm".

### 4.4 Các bài thi còn lại

Giữ nội dung lộ trình IELTS, TOEIC, B1, B2 hiện có + 30 bài IELTS bổ sung (theo [SDD-LEARNING-GROUPS-v2.0.md](../04-design/SDD-LEARNING-GROUPS-v2.0.md) mục 3.3). Chuẩn tối thiểu như cấp 2 mục 3.2, cộng thêm: quiz có giải thích đáp án, câu hỏi theo đúng dạng đề (T/F/NG, Part 5…).

---

## 5. Tổng hợp việc cần làm

| # | Việc | Ai | Khối lượng |
|---|---|---|---|
| 1 | Engine bài `picture` + Unit S1 bằng emoji | Dev / AI | theo `SDD-LEARNING-GROUPS-v2.0.md` |
| 2 | Hướng dẫn phong cách hình cấp 1 | Sonny | 1 trang |
| 3 | Ảnh + âm thanh S1–S3 | làm hình / âm thanh | ~80 ảnh, ~90 file âm thanh |
| 4 | Thử cấp 1 với 10–20 gia đình | Sonny | 1–2 tuần |
| 5 | Viết lại đoạn văn + ngữ pháp `int-u1`–`int-u3` | soạn nội dung | 12 bài |
| 6 | Soạn 5 bài phát âm mới cho `exam-pron` | soạn nội dung + giáo viên duyệt | 5 bài |
| 7 | Thử Azure Pronunciation Assessment, đo chi phí/lượt | Dev / Sonny | 1 nhánh thử |
| 8 | Ảnh + âm thanh S4–S10 | làm hình / âm thanh | ~190 ảnh (sau khi #4 đạt) |

## 6. Điều cần theo dõi sau khi ra mắt

- Cấp 1: % hoàn thành bài, số lần bấm nghe mỗi từ, câu thử thách hay sai nhất (để sửa hình gây hiểu nhầm).
- Cấp 2: % bài đạt ngưỡng quiz lần đầu. Dưới 50% thì bài đó quá khó so với vị trí trong lộ trình.
- Cấp 3: điểm phát âm trung bình theo từng âm, chi phí chấm/người/tháng.
