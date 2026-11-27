# Hướng dẫn tạo hình ảnh AI cho Flashcard Cowdi English

> Tài liệu này hướng dẫn quy chuẩn phong cách, cách sử dụng danh sách flashcard đã xuất, prompt mẫu cho từng công cụ AI, và quy tắc đặt tên file để gắn trực tiếp vào ứng dụng.

---

## 1. Danh sách Flashcard đã xuất

Chạy lại bất cứ lúc nào khi có từ vựng mới:

```bash
node scripts/export-flashcards.mjs
```

Các file kết quả nằm trong `docs/05-implementation/flashcards-export/`:

| File | Nội dung | Số lượng | Công dụng |
|---|---|---:|---|
| `flashcards-p1-basic.csv` | Nhóm ưu tiên **P1** (Starter, A1, A2) | **535** từ | Làm đợt đầu tiên (người mới học / trẻ em) |
| `flashcards-all.csv` | Toàn bộ từ vựng (`VOCAB_TOPICS` + `ALL_LESSONS`, đã gộp trùng) | **3.623** từ | Mở bằng Excel / Google Sheets (UTF-8 BOM), lọc theo `priority` |
| `flashcards-all.json` | Dữ liệu JSON đầy đủ | **3.623** từ | Dùng cho script gọi API tạo ảnh hàng loạt (batch) |

Phân bố theo mức ưu tiên:
- **P1 (535 từ):** Starter, General A1/A2 — nên tạo ảnh **trước tiên**.
- **P2 (2.060 từ):** 13 chủ đề từ vựng (`VOCAB_TOPICS`) + General B1 / B1 / B2.
- **P3 (1.028 từ):** Luyện thi TOEIC, IELTS, Advanced C1/C2.

---

## 2. Quy chuẩn hình ảnh (Style Guide Cowdi)

Để toàn bộ bộ ảnh đồng bộ với giao diện Sổ tay & Mini Games của Cowdi English:

1. **Phong cách:** Kawaii 2D vector minh họa phẳng có đổ bóng nhẹ (`flat-shaded pastel`), đường viền gọn rõ, thân thiện.
2. **Bố cục:** 1 chủ thể chính nằm chính giữa khung hình, có khoảng thở (margin ~12–15%), nền trắng tinh (`#FFFFFF`) hoặc nền trong suốt.
3. **TUYỆT ĐỐI KHÔNG CÓ CHỮ:** Không chứa chữ cái, từ tiếng Anh/tiếng Việt, số không cần thiết hay watermark (vì mặt trước flashcard có thể dùng để đoán từ hoặc hiển thị chữ riêng bên dưới).
4. **Kích thước & Định dạng:**
   - Tỉ lệ vuông **1:1** (`512×512` hoặc `1024×1024` khi gen, resize về `512×512` khi đưa vào web).
   - Lưu định dạng **`.webp`** (chất lượng `80–85%`, mỗi ảnh chỉ ~15–35 KB để nhẹ cho PWA).
5. **Thư mục & Tên file:**
   - Lưu vào: `public/image/flashcards/<image_filename>` (ví dụ: `public/image/flashcards/dog.webp`, `public/image/flashcards/ice_cream.webp`).
   - Tên file chuẩn lấy đúng từ cột `image_filename` trong file CSV.

---

## 3. Prompt chuẩn dùng cho AI tạo ảnh

Mỗi dòng trong `flashcards-all.csv` đã có sẵn cột `ai_prompt`. Nếu muốn tự tinh chỉnh hoặc gom nhóm khi tạo bằng các công cụ khác nhau, dùng mẫu dưới đây:

### 3.1. Công thức chung (DALL-E 3 / ChatGPT / Gemini Imagen / Flux)

```text
<Mô tả chủ thể rõ ràng của từ>, cute kawaii 2D flat-shaded vector illustration, clean bold outlines, soft pastel colors, centered single subject on pure white background, sticker style, educational flashcard icon, NO text, NO letters, NO words, NO watermark
```

### 3.2. Cách xử lý theo từng loại từ

| Loại từ | Chiến lược vẽ dễ hiểu nhất | Ví dụ |
|---|---|---|
| **Danh từ cụ thể** (động vật, đồ ăn, đồ vật) | Vẽ đúng 1 vật thể chính diện, biểu cảm dễ thương | `cat` → con mèo mũm mĩm ngồi cười |
| **Động từ / Hành động** | Dùng nhân vật bò sữa **Cowdi** (chibi cute cow mascot) đang thực hiện hành động đó | `run` → Cowdi đang chạy bộ vui vẻ |
| **Tính từ / Cảm xúc** | Vẽ khuôn mặt/dáng vẻ của nhân vật thể hiện rõ trạng thái, hoặc cặp đối chiếu trực quan | `happy` → Cowdi cười tít mắt, xung quanh có ngôi sao nhỏ |
| **Từ trừu tượng** (P2, P3: *strategy, deadline, negotiate*) | Dùng biểu tượng ẩn dụ đơn giản (lịch + đồng hồ cát cho *deadline*, 2 nhân vật bắt tay cho *negotiate*) | Tránh cảnh quá nhiều chi tiết nhỏ |

### 3.3. Nếu dùng Midjourney (v6 / Niji 6)

Thêm tham số ở cuối prompt:
```text
--ar 1:1 --no text, letters, words, typography, watermark, signature, border
```
*(Gợi ý dùng `--niji 6` nếu muốn nét vẽ kawaii đồng đều nhất.)*

### 3.4. Nếu tạo hàng loạt bằng ChatGPT / Gemini (Grid 4 hoặc 9 ảnh 1 lần)

Nếu muốn tạo nhanh nhiều từ P1 cùng lúc rồi cắt ảnh:
```text
Create a clean 3x3 grid of 9 separate square flashcard stickers on a pure white background, with generous white space between each sticker. Style: cute kawaii 2D flat-shaded vector illustration, clean bold outlines, soft pastel colors, NO text, NO labels, NO letters anywhere.
Items (left to right, top to bottom):
1. apple
2. banana
3. bread
4. milk
5. water
6. coffee
7. egg
8. rice
9. cake
```
*(Lưu ý: cách grid rất tiết kiệm lượt tạo, sau đó dùng script Python/Photoshop cắt 9 ô và đặt tên theo `image_filename`.)*

---

## 4. Quy trình đưa ảnh vào app Cowdi English

1. Tạo ảnh theo cột `ai_prompt` (ưu tiên `flashcards-p1-basic.csv` trước).
2. Chuyển sang `.webp` (`512×512`) và đặt đúng tên ở cột `image_filename` vào thư mục `public/image/flashcards/`.
3. Khi đã có thư mục `public/image/flashcards/`, chỉ cần cập nhật `Flashcard.jsx` để tự động kiểm tra ảnh theo `slug` (nếu có ảnh thì hiển thị `<img>`, nếu chưa có thì giữ nguyên emoji `illustration` hiện tại).
