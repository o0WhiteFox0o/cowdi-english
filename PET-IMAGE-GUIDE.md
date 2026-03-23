# 🎨 Hướng dẫn thiết kế & nâng cấp hình ảnh Pet — Cowdi English

> Tài liệu dành cho đội thiết kế. Cập nhật: 21/03/2026

---

## 1. Tổng quan hệ thống Pet

Cowdi English có **15 pet**, mỗi pet có **5 giai đoạn tiến hóa** (stage 0–4).  
Hiện tại **Cowdi** (4 stage) và **Foxie** (5 stage) đã có hình ảnh, 13 pet còn lại đang dùng emoji thay thế.

### Hệ thống bài học hiện tại

| Cấp độ | Số bài | Ghi chú |
|--------|--------|---------|
| Beginner | 10 | Chào hỏi, Gia đình, Màu sắc, Số đếm, Sinh hoạt, Thức ăn, Du lịch, Các thì, Trường học, Thời tiết |
| Intermediate | 8 | Nghề nghiệp, Cơ thể, Quần áo, Nhà cửa, Cảm xúc, Sở thích, Thiên nhiên, Công nghệ |
| Advanced | 3 | Mua sắm, Sức khỏe, So sánh |
| Unit Test | 5 | Cơ bản 1–2, Trung cấp 1–2, Nâng cao |
| **Tổng** | **26 bài** | |

→ Điều kiện mở khóa pet liên quan đến bài học: Foxie (5 bài), Bamboo (8 bài).

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
public/assets/images/pets/
```

### Quy tắc đặt tên

```
public/assets/images/pets/{TênPet}/
  ├── {TênPet}_egg.webp       ← Stage 0: Trứng
  ├── {TênPet}_baby.webp      ← Stage 1: Baby
  ├── {TênPet}_junior.webp    ← Stage 2: Junior
  ├── {TênPet}_super.webp     ← Stage 3: Super
  ├── {TênPet}_legendary.webp ← Stage 4: Legendary
  ├── {TênPet}_chat.webp      ← Dùng cho chat bubble (tuỳ chọn)
  └── {TênPet}_alt.webp       ← Biến thể phụ (tuỳ chọn)
```

**Quy tắc:**
- Tên thư mục: **viết hoa chữ cái đầu** (PascalCase) → `Cowdi`, `Foxie`, `Pingu`
- Tên file: **Prefix tên pet + underscore + stage**, không dấu, không khoảng trắng → `Cowdi_baby.webp`, `Foxie_egg.png`
- Định dạng: `.webp` (ưu tiên) hoặc `.png`
- Không dùng khoảng trắng hay ký tự đặc biệt trong tên file

### Ví dụ đầy đủ — Cấu trúc hiện tại

```
public/assets/images/pets/
  ├── Cowdi/
  │     ├── Cowdi_baby.webp      (14.9 KB) ← Stage 1
  │     ├── Cowdi_junior.webp    (23.2 KB) ← Stage 2
  │     ├── Cowdi_super.webp     (25.8 KB) ← Stage 3
  │     └── Cowdi_legandary.webp (45.1 KB) ← Stage 4
  │     ⚠️ Thiếu: Cowdi_egg.webp (Stage 0)
  │
  └── Foxie/
        ├── Foxie_egg.webp       (103 KB)  ← Stage 0
        ├── Foxie_baby.webp      (96 KB)   ← Stage 1
        ├── Foxie_junior.webp    (35 KB)   ← Stage 2
        ├── Foxie_super.webp     (54 KB)   ← Stage 3
        └── Foxie_legandary.webp (216 KB)  ← Stage 4
        ✅ Đã chuyển từ PNG sang WebP (giảm ~95% dung lượng)
```

### Trạng thái hình ảnh hiện tại

| Pet | Trạng thái | Stage có hình | Ghi chú |
|-----|-----------|---------------|----------|
| Cowdi | ✅ Có hình | 1, 2, 3, 4 | Thiếu egg (stage 0) |
| Foxie | ✅ Có hình | 0, 1, 2, 3, 4 | Đầy đủ — đã chuyển WebP |
| 13 pet khác | ❌ Emoji | — | Chưa có hình |

---

## 5. Danh sách 15 Pet cần thiết kế

### 5.1 Cowdi 🐮 — Bò sữa (Starter)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Neutral |
| **Rarity** | Starter (có sẵn từ đầu) |
| **Tính cách** | Hiền lành, yêu tiếng Anh, đồng hành từ ngày đầu |
| **Màu chủ đạo** | Trắng + đốm đen, mũi hồng |
| **Trạng thái** | ✅ Có hình (4/5 stage — thiếu egg) |

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
| **Mở khóa** | Hoàn thành 5 bài học (hiện có 26 bài) |
| **Trạng thái** | ✅ Có hình đầy đủ 5 stage (WebP) |

| Stage | Tên | XP | Hướng dẫn visual | File |
|-------|-----|----|-----------------|------|
| 0 | Trứng Foxie | 0 | Trứng cam có vân lửa | `Foxie_egg.webp` ✅ |
| 1 | Baby Foxie | 100 | Cáo con nhỏ, đuôi bông xù | `Foxie_baby.webp` ✅ |
| 2 | Junior Foxie | 500 | Cáo trẻ nhanh nhẹn, ánh mắt thông minh | `Foxie_junior.webp` ✅ |
| 3 | Super Foxie | 1200 | Cáo lửa, đuôi có hiệu ứng lửa nhẹ | `Foxie_super.webp` ✅ |
| 4 | Legendary Foxie | 2500 | Cáo huyền thoại, bốc lửa, uy nghiêm | `Foxie_legandary.webp` ✅ |

---

### 5.3 Pingu 🐧 — Chim cánh cụt (Common)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Water 💧 |
| **Rarity** | Common |
| **Tính cách** | Chăm chỉ, thính giác siêu nhạy, yêu âm nhạc |
| **Màu chủ đạo** | Đen trắng, mỏ cam |
| **Mở khóa** | Hoàn thành 10 quiz Listening |
| **Trạng thái** | ❌ Chưa có hình |

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
| **Mở khóa** | Hoàn thành 8 bài học (hiện có 26 bài) |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Bamboo | 0 | Trứng trắng quấn lá tre |
| 1 | Baby Bamboo | 100 | Gấu trúc con ôm cây tre |
| 2 | Junior Bamboo | 500 | Gấu trúc vui, ngồi ăn tre |
| 3 | Super Bamboo | 1200 | Gấu trúc kung fu, rừng tre |
| 4 | Legendary Bamboo | 2500 | Gấu trúc tiên, hào quang thiên nhiên |

---

### 5.11 Storm 🦅 — Đại bàng (Epic)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Cosmic 🌙 |
| **Rarity** | Epic |
| **Tính cách** | Kiên cường, bay qua mọi giông bão, sáng tạo vô tận |
| **Màu chủ đạo** | Xám bạc, tím sấm sét |
| **Mở khóa** | Streak 30 ngày liên tục |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Storm | 0 | Trứng xám có tia sét |
| 1 | Baby Storm | 100 | Đại bàng con, lông bông |
| 2 | Junior Storm | 500 | Đại bàng trẻ, cánh rộng |
| 3 | Super Storm | 1200 | Đại bàng bão, sấm sét quanh mình |
| 4 | Legendary Storm | 2500 | Đại bàng huyền thoại, cánh sấm chớp |

---

### 5.12 Shadow 🐺 — Sói bóng (Epic)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Cosmic 🌙 |
| **Rarity** | Epic |
| **Tính cách** | Huyền bí, trí tuệ sâu sắc, sáng tạo trong bóng tối |
| **Màu chủ đạo** | Đen, tím đậm |
| **Mở khóa** | Hoàn thành 50 quiz |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Shadow | 0 | Trứng đen có vân bóng tối |
| 1 | Baby Shadow | 100 | Sói con đen, mắt sáng |
| 2 | Junior Shadow | 500 | Sói trẻ, bóng tối nhẹ quanh |
| 3 | Super Shadow | 1200 | Sói bóng đêm, hiệu ứng tối |
| 4 | Legendary Shadow | 2500 | Sói huyền bí, áo choàng bóng tối |

---

### 5.13 Prisma 🦄 — Kỳ lân (Legendary)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Cosmic 🌙 |
| **Rarity** | Legendary |
| **Tính cách** | Tỏa sáng bởi kiến thức toàn diện |
| **Màu chủ đạo** | Cầu vồng, trắng lấp lánh |
| **Mở khóa** | Đạt 2,500 XP tổng |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Prisma | 0 | Trứng trắng lấp lánh cầu vồng |
| 1 | Baby Prisma | 100 | Kỳ lân con, sừng nhỏ |
| 2 | Junior Prisma | 500 | Kỳ lân trẻ, bờm cầu vồng nhẹ |
| 3 | Super Prisma | 1200 | Kỳ lân mạnh, hào quang 7 sắc |
| 4 | Legendary Prisma | 2500 | Kỳ lân huyền thoại, toàn thân tỏa sáng |

---

### 5.14 Draco 🐲 — Rồng cổ đại (Legendary)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Fire 🔥 |
| **Rarity** | Legendary |
| **Tính cách** | Cổ đại, sức mạnh tối thượng, stats x2 |
| **Màu chủ đạo** | Đỏ sẫm, vàng kim |
| **Mở khóa** | Sở hữu tất cả pet khác |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Draco | 0 | Trứng đỏ sẫm có vảy rồng cổ |
| 1 | Baby Draco | 100 | Rồng cổ con, cánh nhỏ |
| 2 | Junior Draco | 500 | Rồng trẻ, bắt đầu oai vệ |
| 3 | Super Draco | 1200 | Rồng mạnh, lửa cổ đại |
| 4 | Legendary Draco | 2500 | Rồng cổ đại huyền thoại, vương miện lửa |

---

### 5.15 Pumpkin 🎃 — Bí ngô (Event)

| Thuộc tính | Giá trị |
|------------|---------|
| **Nguyên tố** | Cosmic 🌙 |
| **Rarity** | Event |
| **Tính cách** | Vui nhộn, bonus XP, chỉ xuất hiện trong sự kiện |
| **Màu chủ đạo** | Cam bí ngô, tím Halloween |
| **Mở khóa** | Sự kiện Halloween |

| Stage | Tên | XP | Hướng dẫn visual |
|-------|-----|----|-----------------|
| 0 | Trứng Pumpkin | 0 | Trứng cam có mặt bí ngô |
| 1 | Baby Pumpkin | 100 | Bí ngô con dễ thương |
| 2 | Junior Pumpkin | 500 | Bí ngô cười, đội mũ phù thủy nhỏ |
| 3 | Super Pumpkin | 1200 | Bí ngô lửa, hiệu ứng Halloween |
| 4 | Legendary Pumpkin | 2500 | Vua bí ngô, hào quang ma thuật |

---
5.16 Mushroom 🍄 — Nấm rơm
Thuộc tính	Giá trị
Nguyên tố	Earth 🌱
Rarity	Common
Tính cách	Nhút nhát nhưng hồi phục tốt, hỗ trợ team
Màu chủ đạo	Đỏ chấm trắng, xanh rêu
Mở khóa	Map rừng
Stage	Tên	XP	Hướng dẫn visual
0	Trứng Nấm	0	Trứng hình nấm nhỏ, có đốm
1	Baby Mushroom	100	Nấm con mắt to, hơi run
2	Junior Mushroom	500	Nấm cao hơn, phát sáng nhẹ
3	Super Mushroom	1200	Nấm phát tán bào tử, aura xanh
4	Legendary Mushroom	2500	Nấm khổng lồ, hệ sinh thái mini xung quanh

5.17 Bamboo 🎋 — Tre
Thuộc tính	Giá trị
Nguyên tố	Wind 🌪️
Rarity	Rare
Tính cách	Kiên cường, linh hoạt, phản đòn tốt
Màu chủ đạo	Xanh lá, xanh đậm
Mở khóa	Map rừng tre / châu Á
Stage	Tên	XP	Hướng dẫn visual
0	Trứng Tre	0	Trứng xanh có vân tre
1	Baby Bamboo	100	Măng tre nhỏ có mặt
2	Junior Bamboo	500	Tre mọc cao, có khớp rõ
3	Super Bamboo	1200	Tre uốn cong, hiệu ứng gió
4	Legendary Bamboo	2500	Tre thần, xoay gió, aura lốc xoáy

5.18 Bao 🥟 — Bánh bao
Thuộc tính	Giá trị
Nguyên tố	Fire 🔥
Rarity	Common
Tính cách	Ấm áp, hồi máu, dễ gần
Màu chủ đạo	Trắng, vàng nhẹ
Mở khóa	Shop / Food map
Stage	Tên	XP	Hướng dẫn visual
0	Trứng Bao	0	Trứng trắng mềm
1	Baby Bao	100	Bánh bao nhỏ, mặt cười
2	Junior Bao	500	Có nhân lộ nhẹ, bốc hơi nóng
3	Super Bao	1200	Bánh bao nóng hổi, aura nhiệt
4	Legendary Bao	2500	Bao thần, ánh sáng vàng, hồi phục mạnh

5.19 Rice 🌾 — Lúa
Thuộc tính	Giá trị
Nguyên tố	Earth 🌱
Rarity	Common
Tính cách	Chăm chỉ, tích lũy tài nguyên
Màu chủ đạo	Vàng lúa, xanh nhạt
Mở khóa	Map đồng ruộng
Stage	Tên	XP	Hướng dẫn visual
0	Trứng Lúa	0	Hạt giống
1	Baby Rice	100	Mầm lúa nhỏ
2	Junior Rice	500	Lúa cao, có bông
3	Super Rice	1200	Lúa vàng rực, hiệu ứng gió
4	Legendary Rice	2500	Thần lúa, aura mùa màng

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
- [ ] Tên file đúng quy tắc: `{TênPet}_egg.webp`, `{TênPet}_baby.webp`, ...
- [ ] Thư mục đúng: `public/assets/images/pets/{TênPet}/`
- [ ] Hình rõ ràng ở kích thước thu nhỏ **48×48 px** (zoom out kiểm tra)
- [ ] Các stage có **sự khác biệt rõ ràng** và **tăng dần độ hoành tráng**
- [ ] File phụ `{TênPet}_chat.webp` (nếu có) — phù hợp hiển thị nhỏ cạnh chat bubble

### Tổng số file cần bàn giao

| Loại | Số lượng |
|------|----------|
| 15 pet × 5 stage | **75 file** (bắt buộc) |
| 15 pet × 1 chat | **15 file** (tuỳ chọn) |
| 15 pet × 1 alt | **15 file** (tuỳ chọn) |
| **Đã hoàn thành** | **9 file** (Cowdi 4 + Foxie 5) |
| **Tổng tối thiểu còn lại** | **66 file** |
| **Tổng đầy đủ** | **~105 file** |

---

## 8. Cấu trúc thư mục hoàn chỉnh sau khi bàn giao

```
public/assets/images/pets/
  ├── Cowdi/                    ← ✅ có hình (thiếu egg)
  │     ├── Cowdi_baby.webp
  │     ├── Cowdi_junior.webp
  │     ├── Cowdi_super.webp
  │     └── Cowdi_legandary.webp
  └── Foxie/                    ← ✅ có hình đầy đủ
  │     ├── Foxie_egg.webp
  │     ├── Foxie_baby.webp
  │     ├── Foxie_junior.webp
  │     ├── Foxie_super.webp
  │     └── Foxie_legandary.webp
  ├── Pingu/                    ← ❌ chưa có
  │     └── ...
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
  ├── Bamboo/
  │     └── ...
  ├── Storm/
  │     └── ...
  ├── Shadow/
  │     └── ...
  ├── Prisma/
  │     └── ...
  ├── Draco/
  │     └── ...
  └── Pumpkin/
        └── ...
```

---

---

## 9. Mapping code hiện tại (`src/data/pets.js`)

Đường dẫn hình ảnh đã được cập nhật trong code:

```js
// Cowdi — 4 stage có hình (thiếu egg)
const COWDI_IMG = '/assets/images/pets/Cowdi';
export const COWDI_IMAGES = {
  baby: `${COWDI_IMG}/Cowdi_baby.webp`,
  junior: `${COWDI_IMG}/Cowdi_junior.webp`,
  super: `${COWDI_IMG}/Cowdi_super.webp`,
  legendary: `${COWDI_IMG}/Cowdi_legandary.webp`,
};

// Foxie — 5 stage đầy đủ (WebP)
const FOXIE_IMG = '/assets/images/pets/Foxie';
export const FOXIE_IMAGES = {
  egg: `${FOXIE_IMG}/Foxie_egg.webp`,
  baby: `${FOXIE_IMG}/Foxie_baby.webp`,
  junior: `${FOXIE_IMG}/Foxie_junior.webp`,
  super: `${FOXIE_IMG}/Foxie_super.webp`,
  legendary: `${FOXIE_IMG}/Foxie_legandary.webp`,
};
```

Khi thêm pet mới, tạo block tương tự và gán `image` vào mỗi evolution stage.

---

*Cập nhật lần cuối: 21/03/2026 — Đã cập nhật Cowdi (4 stage) + Foxie (5 stage) lên giao diện.*
