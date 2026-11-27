# Danh sách Card Ôn tập & Bài tập cần tạo ảnh mới (`PracticePage.jsx`)

> **Thư mục chứa ảnh:** `public/image/practice/`  
> **Định dạng khuyến nghị:** `.webp` (nền pastel tím/xanh/cam nhẹ, phong cách sticker chibi dễ thương đồng bộ với các ảnh hiện có, tỉ lệ vuông `1:1` hoặc `512x512` / `1024x1024`).

Hiện tại trang **Ôn tập & Bài tập** ([PracticePage.jsx](../../src/features/practice/PracticePage.jsx)) có **21 card**, nhưng mới có **15 file ảnh** trong `public/image/practice/`. Do đó có **6 card đang bị dùng trùng ảnh** và cần tạo thêm **6 ảnh mới** dưới đây:

---

## Danh sách 6 ảnh cần tạo mới

| STT | Key trong code | Tên trên Card (Anh / Việt) | Mô tả chức năng (để vẽ đúng chủ đề) | Ảnh đang bị dùng trùng | Tên file mới cần đặt vào `public/image/practice/` |
|---|---|---|---|---|---|
| **1** | `listenPick` | **Listen Pick** · Nghe chọn từ | Nghe phát âm và chọn từ đúng | `practice_nghe_hieu.webp` *(trùng `Listening`)* | `nghe_chon_tu.webp` |
| **2** | `listenSentence` | **Audio Sentence** · Nghe câu | Nghe cả câu tiếng Anh và chọn nghĩa đúng | `noi_cau.webp` *(trùng `Speak Sentence`)* | `nghe_hieu_cau.webp` |
| **3** | `speakWord` | **Speak Word** · Nói từ | Nhìn nghĩa tiếng Việt → nói từ tiếng Anh | `doc_to.webp` *(trùng `Read Aloud`)* | `noi_tu.webp` |
| **4** | `speedRound` | **Speed Reflex** · Nhanh trí | Chọn nhanh từ đúng trong thời gian ngắn (đồng hồ/tia sét) | `phan_xa_noi.webp` *(trùng `Fast Reflex`)* | `nhanh_tri.webp` |
| **5** | `fillin` | **Fill Blanks** · Điền từ | Điền từ còn thiếu vào ô trống trong câu | `ghep_chu.webp` *(trùng `Word Builder`)* | `dien_tu.webp` |
| **6** | `wordGuess` | **Word Guess** · Đoán từ | Nhìn nghĩa và gợi ý ô chữ, đoán từ tiếng Anh | `doan_nghia.webp` *(trùng `Context Clue`)* | `doan_tu.webp` |

---

## Bảng đối chiếu 15 card đã có ảnh riêng (không cần tạo lại)

| Key | Tên trên Card | File ảnh hiện tại (`public/image/practice/`) |
|---|---|---|
| `listening` | Listening · Nghe hiểu | `practice_nghe_hieu.webp` |
| `dictation` | Dictation · Nghe chép | `nghe_cau.webp` |
| `speakSentence` | Speak Sentence · Nói câu | `noi_cau.webp` |
| `readAloud` | Read Aloud · Đọc to | `doc_to.webp` |
| `speakFast` | Fast Reflex · Phản xạ nói | `phan_xa_noi.webp` |
| `grammar` | Grammar · Ngữ pháp | `ngu_phap.webp` |
| `trueFalse` | True False · Đúng/Sai | `dung_sai.webp` |
| `contextClue` | Context Clue · Đoán nghĩa | `doan_nghia.webp` |
| `sentences` | Sentences · Hoàn thành câu | `hoan_thanh_cau.webp` |
| `reorder` | Sentence Order · Sắp xếp câu | `xap_xep_cau.webp` |
| `wordBuild` | Word Builder · Ghép chữ | `ghep_chu.webp` |
| `translateWrite` | Translate · Viết câu | `viet_cau.webp` |
| `mixed` | Mixed Master · Tổng hợp | `tong_hop.webp` |
| `matching` | Word Match · Nối cặp | `noi_cap.webp` |
| `vocab` | Vocabulary · Từ vựng | `tu_dien.webp` |

---

## 3. Danh sách 6 Card Mini Games (`public/image/minigames/`)

Tất cả 6 card trong [MiniGamePage.jsx](../../src/features/mini-games/MiniGamePage.jsx#L160-L230) đều đã có ảnh riêng:

| STT | ID | Tên trên Card (Anh / Việt) | Mô tả | File ảnh (`public/image/minigames/`) |
|---|---|---|---|---|
| 1 | `word-catch` | **Word Catch** · Cowdi Bắt Từ | Bắt từ rơi | `minigame_cowdi_bat_tu.webp` |
| 2 | `sentence-puzzle` | **Sentence** · Ghép câu | Ghép thành câu | `minigame_ghep_cau.webp` |
| 3 | `memory-match` | **Memory Match** · Lật thẻ nhớ | Ghép cặp từ nhớ | `minigame_lat_the_nho.webp` |
| 4 | `spelling-bee` | **Spelling Bee** · Spelling Bee | Đánh vần từ | `minigame_spelling_bee.webp` |
| 5 | `speed-match` | **Speed Match** · Tốc độ ánh sáng | Ghép từ 60s | `minigame_toc_do_anh_sang.webp` |
| 6 | `word-scramble` | **Scramble** · Xáo chữ | Xếp lại chữ cái | `minigame_xao_chu.webp` |

---

## 4. Ảnh Card Chủ đề Từ vựng (`public/image/topics/`)

Các file ảnh chủ đề hiện có trong `public/image/topics/`:
`animals.webp`, `countries.webp`, `drinking.webp`, `eating.webp`, `holidays.webp`, `house.webp`, `human.webp`, `love.webp`, `nature.webp`, `numbers.webp`, `public-places.webp`, `public_places.webp`, `sports.webp`, `transportation.webp`.

---

## Lưu ý
- Sau khi bạn tạo 6 ảnh mới ở Mục 1 (hoặc thay ảnh mới cho các card khác) và chép vào đúng thư mục `public/image/practice/` hoặc `public/image/minigames/`, báo mình cập nhật lại `PRACTICE_ART_MAP` trong [PracticePage.jsx](../../src/features/practice/PracticePage.jsx#L18-L40) là xong ngay.
