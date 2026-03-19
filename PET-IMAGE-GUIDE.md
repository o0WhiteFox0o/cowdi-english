# 🎨 Hướng dẫn thiết kế & nâng cấp hình ảnh Pet — Cowdi English

> Tài liệu dành cho đội thiết kế. Cập nhật: 19/03/2026

---

## 1. Tổng quan hệ thống Pet

Cowdi English có **10 pet**, mỗi pet có **5 giai đoạn tiến hóa** (stage 0–4).  
Hiện tại chỉ **Cowdi** có hình ảnh, 9 pet còn lại đang dùng emoji thay thế.

---

## 2. Yêu cầu kỹ thuật

| Thuộc tính | Yêu cầu |
|------------|---------|
| **Định dạng** | `.webp` (ưu tiên) hoặc `.png` |
| **Nền** | **Trong suốt (transparent)** — bắt buộc |
| **Kích thước canvas** | **512 × 512 px** (khuyến nghị) — tối thiểu 320 × 320 px |
| **Tỷ lệ** | 1:1 (vuông) |
| **Dung lượng** | ≤ 50 KB / file (WebP) — ≤ 100 KB nếu PNG |
| **Chất lượng WebP** | 80–90% |
| **Color space** | sRGB |

### Tại sao 512×512?

- Hiển thị chính trong app: **160×160 px** (desktop), **120×120 px** (mobile)
- Canvas 512px đảm bảo sắc nét trên màn hình Retina (3x)
- Dùng được cho cả thumbnail 48×48 mà không cần file riêng

---

## 3. Cách hình ảnh hiển thị trong app

```
┌─────────────────────────────────┐
│  Pet Display Card (PetPage)     │
│  ┌───────────────────────────┐  │
│  │   Nền gradient theo mood  │  │
│  │                           │  │
│  │      ┌──────────┐        │  │
│  │      │ 160×160  │ ← ảnh  │  │
│  │      │ pet nổi  │   pet  │  │
│  │      │ lên xuống│        │  │
│  │      └──────────┘        │  │
│  │                           │  │
│  └───────────────────────────┘  │
│  Tên pet — Stage — Power        │
│  💬 "Chào bạn! Học gì nhé?"    │
└─────────────────────────────────┘
```

| Vị trí hiển thị | Kích thước khung | Ghi chú |
|-----------------|-----------------|---------|
| **Pet chính** (PetPage) | 160×160 px (desktop) / 120×120 px (mobile) | Có animation float, drop-shadow |
| **Chat bubble** (CowdiChat) | ~64×64 px | Cạnh bong bóng chat |
| **Evolution preview** | 48×48 px | Thumbnail tiến hóa kế tiếp |
| **Collection grid** | ~80×80 px | Lưới pet đã mở khóa |

**Hiệu ứng CSS áp dụng lên hình:**
- `object-fit: contain` — hình co vừa khung, không bị crop
- `drop-shadow(0 8px 16px rgba(0,0,0,0.1))` — bóng đổ nhẹ
- Hover: `scale(1.08)` — phóng nhẹ khi rê chuột
- Float animation: nổi lên xuống nhẹ liên tục

**Nền gradient phía sau (KHÔNG nằm trong ảnh):**
- 😊 Happy: xanh lá → vàng nhạt
- 😢 Sad: xanh dương → tím nhạt
- 🤒 Sick: cam → hồng nhạt

→ **Hình pet KHÔNG cần vẽ nền**, chỉ cần nhân vật trên nền trong suốt.

---

## 4. Cấu trúc thư mục & quy tắc đặt tên

### Thư mục gốc

```
public/assets/images/Pet/
```

### Quy tắc đặt tên

```
public/assets/images/Pet/{TênPet}/
  ├── egg.webp            ← Stage 0: Trứng
  ├── baby.webp           ← Stage 1: Baby
  ├── junior.webp         ← Stage 2: Junior
  ├── super.webp          ← Stage 3: Super
  ├── legendary.webp      ← Stage 4: Legendary
  ├── chat.webp           ← Dùng cho chat bubble (tuỳ chọn)
  └── alt.webp            ← Biến thể phụ (tuỳ chọn)
```

**Quy tắc:**
- Tên thư mục: **viết hoa chữ cái đầu** (PascalCase) → `Cowdi`, `Foxie`, `Pingu`
- Tên file: **viết thường**, không dấu, không khoảng trắng → `egg.webp`, `baby.webp`
- Không dùng khoảng trắng hay ký tự đặc biệt trong tên file

### Ví dụ đầy đủ cho Cowdi

```
public/assets/images/Pet/
  └── Cowdi/
        ├── egg.webp
        ├── baby.webp
        ├── junior.webp
        ├── super.webp
        ├── legendary.webp
        ├── chat.webp
        └── alt.webp
```

### So sánh tên file cũ → mới (Cowdi)

| File cũ (hiện tại) | File mới | Stage |
|--------------------|----------|-------|
| `Group 8.webp` (36.5 KB) | `egg.webp` | 0 — Trứng |
| `baby 2.webp` (14.6 KB) | `baby.webp` | 1 — Baby |
| `Cowdi.webp` (14.2 KB) | `junior.webp` | 2 — Junior |
| `cowdi_2.webp` (22.7 KB) | `super.webp` | 3 — Super |
| `dad.webp` (26.3 KB) | `legendary.webp` | 4 — Legendary |
| `cowdi_doc.webp` (44.1 KB) | `chat.webp` | Chat bubble |
| `cow.webp` (25.2 KB) | `alt.webp` | Biến thể phụ |
| `Cow 6.webp` (12.6 KB) | *(loại bỏ hoặc giữ nếu cần)* | — |
| `Group 9.webp` (36.5 KB) | *(loại bỏ hoặc giữ nếu cần)* | — |

---

## 5. Danh sách 10 Pet cần thiết kế

### 5.1 Cowdi 🐮 — Bò sữa (Starter)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Neutral |
| **Rarity** | Starter (có sẵn từ đầu) |
| **Tính cách** | Hiền lành, yêu tiếng Anh, đồng hành từ ngày đầu |
| **Màu chủ đạo** | Trắng + đốm đen, mũi hồng |
| **Trạng thái** | ✅ Có hình (cần nâng cấp chất lượng) |

**Giai đoạn tiến hóa:**

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Cowdi | 0 | Quả trứng trắng có đốm đen kiểu bò sữa |
| 1 | Baby Cowdi | 100 | Bê con nhỏ xíu, mắt to tròn, dễ thương |
| 2 | Junior Cowdi | 500 | Bò sữa trẻ, rõ đặc trưng, vui vẻ |
| 3 | Super Cowdi | 1200 | Bò khỏe mạnh, thêm chi tiết (sừng, cơ bắp nhẹ) |
| 4 | Legendary Cowdi | 2500 | Bò oai vệ, vương miện/hào quang, mạnh mẽ |

---

### 5.2 Foxie 🦊 — Cáo lửa (Common)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Fire 🔥 |
| **Rarity** | Common |
| **Tính cách** | Thông minh, giỏi ngữ pháp, thích giải đố |
| **Màu chủ đạo** | Cam đỏ, bụng trắng |
| **Mở khóa** | Hoàn thành 5 bài học |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Foxie | 0 | Trứng cam có vân lửa |
| 1 | Baby Foxie | 100 | Cáo con nhỏ, đuôi bông xù |
| 2 | Junior Foxie | 500 | Cáo trẻ nhanh nhẹn, ánh mắt thông minh |
| 3 | Super Foxie | 1200 | Cáo lửa, đuôi có hiệu ứng lửa nhẹ |
| 4 | Legendary Foxie | 2500 | Cáo huyền thoại, bốc lửa, uy nghiêm |

---

### 5.3 Pingu 🐧 — Chim cánh cụt (Common)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Water 💧 |
| **Rarity** | Common |
| **Tính cách** | Chăm chỉ, thính giác siêu nhạy, yêu âm nhạc |
| **Màu chủ đạo** | Đen trắng, mỏ cam |
| **Mở khóa** | Hoàn thành 10 quiz Listening |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Pingu | 0 | Trứng trắng có vân băng tuyết |
| 1 | Baby Pingu | 100 | Cánh cụt con bé tí, đeo tai nghe nhỏ |
| 2 | Junior Pingu | 500 | Cánh cụt vui vẻ, quàng khăn |
| 3 | Super Pingu | 1200 | Cánh cụt mạnh, hiệu ứng băng xung quanh |
| 4 | Legendary Pingu | 2500 | Cánh cụt hoàng đế, vương miện băng |

---

### 5.4 Leafy 🐢 — Rùa lá (Common)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Nature 🌿 |
| **Rarity** | Common |
| **Tính cách** | Kiên nhẫn, nhớ từ vựng giỏi, chậm mà chắc |
| **Màu chủ đạo** | Xanh lá, nâu đất |
| **Mở khóa** | Học 50 từ vựng |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Leafy | 0 | Trứng xanh lá có vân lá cây |
| 1 | Baby Leafy | 100 | Rùa con nhỏ, mai có lá mọc |
| 2 | Junior Leafy | 500 | Rùa trẻ, mai phủ rêu xanh |
| 3 | Super Leafy | 1200 | Rùa lớn, cây mọc trên mai |
| 4 | Legendary Leafy | 2500 | Rùa cổ thụ, cả khu rừng nhỏ trên mai |

---

### 5.5 Sparky 🐉 — Rồng nhỏ (Rare)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Fire 🔥 |
| **Rarity** | Rare |
| **Tính cách** | Đầy năng lượng, sáng tạo vô hạn, thích viết câu |
| **Màu chủ đạo** | Đỏ cam, vàng |
| **Mở khóa** | Streak 7 ngày liên tục |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Sparky | 0 | Trứng đỏ có vảy rồng |
| 1 | Baby Sparky | 100 | Rồng con siêu nhỏ, cánh nhỏ xíu |
| 2 | Junior Sparky | 500 | Rồng trẻ, biết phun lửa nhỏ |
| 3 | Super Sparky | 1200 | Rồng mạnh, cánh lớn, lửa bốc |
| 4 | Legendary Sparky | 2500 | Rồng huyền thoại, áo giáp lửa |

---

### 5.6 Mimi 🐱 — Mèo mây (Rare)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Cosmic 🌙 |
| **Rarity** | Rare |
| **Tính cách** | Thần bí, giỏi phân tích, lắng nghe |
| **Màu chủ đạo** | Tím pastel, trắng mây |
| **Mở khóa** | Đạt 3 quiz hoàn hảo (100%) |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Mimi | 0 | Trứng tím nhạt có lấp lánh sao |
| 1 | Baby Mimi | 100 | Mèo con trên đám mây nhỏ |
| 2 | Junior Mimi | 500 | Mèo bông xù, mắt sáng ngời |
| 3 | Super Mimi | 1200 | Mèo mây, đuôi có sao lấp lánh |
| 4 | Legendary Mimi | 2500 | Mèo thiên hà, cả vũ trụ quanh mình |

---

### 5.7 Owlbert 🦉 — Cú vọ (Rare)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Nature 🌿 |
| **Rarity** | Rare |
| **Tính cách** | Thông thái, bậc thầy ngữ pháp, biết mọi quy tắc |
| **Màu chủ đạo** | Nâu, vàng mật ong |
| **Mở khóa** | Hoàn thành 15 quiz Grammar |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Owlbert | 0 | Trứng nâu có hoa văn lông vũ |
| 1 | Baby Owlbert | 100 | Cú con mắt to, lông bông |
| 2 | Junior Owlbert | 500 | Cú đeo kính tròn, cầm sách |
| 3 | Super Owlbert | 1200 | Cú giáo sư, mũ tốt nghiệp |
| 4 | Legendary Owlbert | 2500 | Cú pháp sư thông thái, áo choàng |

---

### 5.8 Flippy 🐬 — Cá heo (Rare)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Water 💧 |
| **Rarity** | Rare |
| **Tính cách** | Vui vẻ, giao tiếp tuyệt vời, nghe hiểu siêu nhanh |
| **Màu chủ đạo** | Xanh dương, bụng trắng |
| **Mở khóa** | Học 100 từ vựng |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Flippy | 0 | Trứng xanh dương có bọt nước |
| 1 | Baby Flippy | 100 | Cá heo con nhỏ, nhảy qua sóng |
| 2 | Junior Flippy | 500 | Cá heo trẻ, nhanh nhẹn |
| 3 | Super Flippy | 1200 | Cá heo mạnh, sóng nước bao quanh |
| 4 | Legendary Flippy | 2500 | Cá heo đại dương, vương miện san hô |

---

### 5.9 Leo 🦁 — Sư tử (Epic)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Fire 🔥 |
| **Rarity** | Epic |
| **Tính cách** | Dũng mãnh, mạnh mẽ toàn diện, vua muôn loài |
| **Màu chủ đạo** | Vàng, cam đậm, bờm sư tử |
| **Mở khóa** | Đạt 1,000 XP tổng |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Leo | 0 | Trứng vàng có vân bờm sư tử |
| 1 | Baby Leo | 100 | Sư tử con, bờm nhỏ, mắt to |
| 2 | Junior Leo | 500 | Sư tử trẻ, bờm bắt đầu rõ |
| 3 | Super Leo | 1200 | Sư tử uy vũ, bờm lửa bốc cháy |
| 4 | Legendary Leo | 2500 | Vua sư tử, vương miện vàng, hào quang |

---

### 5.10 Bamboo 🐼 — Gấu trúc (Epic)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Nature 🌿 |
| **Rarity** | Epic |
| **Tính cách** | Dễ thương, bậc thầy giao tiếp, nói chuyện suốt ngày |
| **Màu chủ đạo** | Đen trắng, tre xanh |
| **Mở khóa** | Hoàn thành 8 bài học |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Bamboo | 0 | Trứng trắng quấn lá tre |
| 1 | Baby Bamboo | 100 | Gấu trúc con ôm cây tre |
| 2 | Junior Bamboo | 500 | Gấu trúc vui, ngồi ăn tre |
| 3 | Super Bamboo | 1200 | Gấu trúc kung fu, rừng tre |
| 4 | Legendary Bamboo | 2500 | Gấu trúc tiên, hào quang thiên nhiên |

---

## 6. Nguyên tắc thiết kế chung

### Phong cách

- **Art style:** Chibi / cute cartoon — phù hợp học sinh cấp 2–3 và đại học
- **Nét vẽ:** Rõ ràng, line art sạch, dễ nhận diện ở kích thước nhỏ (48px)
- **Biểu cảm:** Vui vẻ, thân thiện, khích lệ — phù hợp ứng dụng giáo dục
- **Độ phức tạp tăng dần:** Trứng đơn giản → Legendary chi tiết nhất

### Quy tắc tiến hóa visual

| Stage | Độ phức tạp | Chi tiết |
|-------|-------------|----------|
| 0 — Egg | ★☆☆☆☆ | Quả trứng có đặc điểm loài (vân, màu). Đơn giản nhất |
| 1 — Baby | ★★☆☆☆ | Nhỏ, tỷ lệ đầu to, mắt to tròn. Dễ thương tối đa |
| 2 — Junior | ★★★☆☆ | Tỷ lệ cân đối hơn, rõ đặc trưng loài. Hình "chuẩn" |
| 3 — Super | ★★★★☆ | Thêm phụ kiện, hiệu ứng nguyên tố (lửa/nước/lá/sao) |
| 4 — Legendary | ★★★★★ | Hoàn chỉnh nhất, vương miện/hào quang, chi tiết tối đa |

### Bảng màu nguyên tố (tham khảo)

| Nguyên tố | Màu chính | Màu phụ | Hiệu ứng |
|-----------|-----------|---------|-----------|
| 🔥 Fire | `#FF5722` cam đỏ | `#FF9800` vàng cam | Lửa, tia lửa |
| 💧 Water | `#2196F3` xanh dương | `#00BCD4` cyan | Sóng, bọt nước |
| 🌿 Nature | `#4CAF50` xanh lá | `#8BC34A` xanh nhạt | Lá, hoa, dây leo |
| 🌙 Cosmic | `#9C27B0` tím | `#E1BEE7` tím nhạt | Sao, mây, ánh trăng |
| ⚡ Neutral | `#FF9800` cam | `#FFC107` vàng | Không hiệu ứng đặc biệt |

---

## 7. Checklist bàn giao

Khi designer hoàn thành, kiểm tra:

- [ ] Mỗi pet có đủ **5 file** (egg, baby, junior, super, legendary)
- [ ] Tất cả file đều **nền trong suốt**
- [ ] Kích thước canvas **512×512 px**
- [ ] Định dạng **WebP**, dung lượng **≤ 50 KB/file**
- [ ] Tên file đúng quy tắc: `egg.webp`, `baby.webp`, `junior.webp`, `super.webp`, `legendary.webp`
- [ ] Thư mục đúng: `public/assets/images/Pet/{TênPet}/`
- [ ] Hình rõ ràng ở kích thước thu nhỏ **48×48 px** (zoom out kiểm tra)
- [ ] Các stage có **sự khác biệt rõ ràng** và **tăng dần độ hoành tráng**
- [ ] File phụ `chat.webp` (nếu có) — phù hợp hiển thị nhỏ cạnh chat bubble

### Tổng số file cần bàn giao

| Loại | Số lượng |
|------|----------|
| 10 pet × 5 stage | **50 file** (bắt buộc) |
| 10 pet × 1 chat | **10 file** (tuỳ chọn) |
| 10 pet × 1 alt | **10 file** (tuỳ chọn) |
| **Tổng tối thiểu** | **50 file** |
| **Tổng đầy đủ** | **~70 file** |

---

## 8. Cấu trúc thư mục hoàn chỉnh sau khi bàn giao

```
public/assets/images/Pet/
  ├── Cowdi/
  │     ├── egg.webp
  │     ├── baby.webp
  │     ├── junior.webp
  │     ├── super.webp
  │     ├── legendary.webp
  │     └── chat.webp
  ├── Foxie/
  │     ├── egg.webp
  │     ├── baby.webp
  │     ├── junior.webp
  │     ├── super.webp
  │     └── legendary.webp
  ├── Pingu/
  │     └── ... (tương tự)
  ├── Leafy/
  │     └── ...
  ├── Sparky/
  │     └── ...
  ├── Mimi/
  │     └── ...
  ├── Owlbert/
  │     └── ...
  ├── Flippy/
  │     └── ...
  ├── Leo/
  │     └── ...
  └── Bamboo/
        └── ...
```

---

*Sau khi nhận hình mới, dev sẽ cập nhật code trong `src/data/pets.js` để map đường dẫn hình ảnh cho từng pet và stage.*
