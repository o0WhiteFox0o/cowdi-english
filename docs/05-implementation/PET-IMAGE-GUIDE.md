# 🎨 Hướng dẫn thiết kế & quản lý hình ảnh Pet — Cowdi English

> Tài liệu dành cho đội thiết kế & developer. Cập nhật: 14/05/2026
> Đồng bộ với `src/data/pets.js` và thư mục `public/assets/images/pets/`.

---

## 1. Tổng quan

Cowdi English có **22 pet** trong `PET_REGISTRY`, mỗi pet có **5 giai đoạn tiến hóa** (stage 0 – egg → 4 – legendary).

- **19/22 pet** đã có bộ ảnh 5 stage (WebP) và đã wire vào code.
- **3/22 pet** mới thêm (5/2026) chưa có ảnh: **Nấm Rơm, Củ Cải Trắng, Bánh Bao** → đang fallback bằng emoji.
- Toàn bộ ảnh đã được chuyển sang **WebP** (tiết kiệm ~85% dung lượng so với PNG).

### Hệ thống bài học (ngữ cảnh unlock pet)

| Cấp độ | Số bài | Số từ/bài | Ghi chú |
|--------|--------|-----------|---------|
| Beginner | 10 | 10 từ | Chào hỏi, Gia đình, Màu sắc, Số đếm, Trường học, Thời tiết, Nghề nghiệp, Cơ thể, Quần áo, Nhà cửa |
| Intermediate | 8 | 20 từ | Sinh hoạt, Thức ăn, Du lịch, Cảm xúc, Sở thích, Thiên nhiên, Công nghệ, Mua sắm |
| Advanced | 9 | 30 từ | Thì, Sức khỏe, So sánh, Môi trường, Truyền thông, Văn hóa, Kinh doanh, Khoa học, Giáo dục |
| Unit Test | 6 | — | Cơ bản 1–2, Trung cấp 1–2, Nâng cao 1–2 |
| **Tổng** | **33 bài** | | |

---

## 2. Yêu cầu kỹ thuật

| Thuộc tính | Yêu cầu |
|------------|---------|
| **Định dạng** | `.webp` (**bắt buộc** — dự án đã chuẩn hóa 100% WebP) |
| **Nền** | **Trong suốt (transparent)** — bắt buộc |
| **Canvas** | **512 × 512 px** (khuyến nghị) — tối thiểu 320 × 320 px |
| **Tỷ lệ** | 1:1 (vuông) |
| **Dung lượng** | ≤ 50 KB / file (quality 80–90) |
| **Color space** | sRGB |

### Tại sao 512×512?

- Hiển thị chính: **160×160 px** (desktop), **120×120 px** (mobile).
- Canvas 512 đảm bảo sắc nét trên màn Retina (3x) và thumbnail 48×48.

### Chuyển PNG → WebP

Dự án đã có sẵn script:

```powershell
# Convert + xóa PNG gốc
node scripts/convert-png-to-webp.mjs

# Giữ PNG gốc
node scripts/convert-png-to-webp.mjs --keep

# Chỉ liệt kê, không ghi
node scripts/convert-png-to-webp.mjs --dry
```

Script quét toàn workspace (trừ `node_modules`, `dist*`, `.git`), bỏ qua các file đã có `.webp` song song, và log mức tiết kiệm dung lượng.

---

## 3. Hiển thị hình ảnh trong app

```
┌─────────────────────────────────┐
│  Pet Display Card (PetPage)     │
│  ┌───────────────────────────┐  │
│  │   Nền gradient theo mood  │  │
│  │                           │  │
│  │      ┌──────────┐         │  │
│  │      │ 160×160  │ ← ảnh   │  │
│  │      │ pet float│   pet   │  │
│  │      └──────────┘         │  │
│  │                           │  │
│  └───────────────────────────┘  │
│  Tên pet — Stage — Power        │
│  💬 "Chào bạn! Học gì nhé?"     │
└─────────────────────────────────┘
```

| Vị trí | Kích thước khung | Ghi chú |
|--------|------------------|---------|
| Pet chính (`PetPage`) | 160×160 (desktop) / 120×120 (mobile) | Float animation + drop-shadow |
| Chat bubble (`CowdiChat`) | ~64×64 | Cạnh bong bóng chat |
| Evolution preview | 48×48 | Thumbnail tiến hóa kế tiếp |
| Collection grid | ~80×80 | Lưới pet đã mở khóa |
| Mini-game TyperShark | 160×160 | Dùng `Cowdi_junior.webp` |

**CSS áp dụng:** `object-fit: contain`, `drop-shadow(0 8px 16px rgba(0,0,0,0.1))`, hover `scale(1.08)`, float animation.

**Nền gradient** phía sau **KHÔNG** nằm trong ảnh:
- 😊 Happy: xanh lá → vàng nhạt
- 😢 Sad: xanh dương → tím nhạt
- 🤒 Sick: cam → hồng nhạt

→ Ảnh pet **không vẽ nền**, chỉ nhân vật trên nền trong suốt.

---

## 4. Quy tắc đặt tên & cấu trúc thư mục

### Quy tắc chuẩn

```
public/assets/images/pets/{TênPet}/
  ├── {TênPet}_Egg.webp        ← Stage 0
  ├── {TênPet}_Baby.webp       ← Stage 1
  ├── {TênPet}_Junior.webp     ← Stage 2
  ├── {TênPet}_Super.webp      ← Stage 3
  └── {TênPet}_Legendary.webp  ← Stage 4
```

- Thư mục: **PascalCase** (`Cowdi`, `Foxie`, `Pingu`…).
- Tên file: **PascalCase cả prefix lẫn stage**, dùng underscore (khuyến nghị chuẩn mới).
- Không dấu, không khoảng trắng, không ký tự đặc biệt.

### ⚠️ Các ngoại lệ hiện có (đã hard-code trong `pets.js`)

Giữ nguyên để tránh phải đổi tên 60+ file:

| Pet | Thư mục | Quy ước thực tế |
|-----|---------|-----------------|
| Cowdi | `Cowdi/` | lowercase stage: `Cowdi_baby.webp`, và typo `Cowdi_legandary.webp` |
| Foxie | `Foxie/` | lowercase stage: `Foxie_egg.webp`, typo `Foxie_legandary.webp` |
| Ginseng | `Ginseng/` | PascalCase — chuẩn |
| Mimi | `Mimi/` | ⚠️ tên file bắt đầu bằng **`Mini_`** (`Mini_Egg.webp`…) |
| Paddy | `Lua/` | tên folder & file dùng **`Lua`** (tiếng Việt) |
| Sprout | `Mangtre/` | tên folder & file dùng **`Mangtre`** |
| Storm | `Storm/` | stage 1 có 2 biến thể: `Storm-Baby.webp` (dấu gạch ngang) đang được code sử dụng |

> Khi thêm pet mới, **dùng đúng chuẩn** `{Pet}_Stage.webp` (PascalCase + underscore).

---

## 5. Trạng thái hiện tại của 22 pet

> Cập nhật 14/05/2026: Monk + Shadow/Prisma/Draco/Pumpkin + Cowdi_egg + Pingu đã được bổ sung ảnh đầy đủ và wire vào `pets.js`. Còn 3 pet mới Nấm Rơm / Củ Cải Trắng / Bánh Bao chờ asset.

Nguồn: `src/data/pets.js` → `PET_REGISTRY` + thư mục `public/assets/images/pets/`.

### 5.1 Pet đã có ảnh đầy đủ và wire vào code (19)

| # | Pet | Emoji | Rarity | Element | Folder | Ghi chú |
|---|-----|-------|--------|---------|--------|---------|
| 1 | Cowdi | 🐮 | Starter | Neutral ⚡ | `Cowdi/` | ✅ 5 stage — file `Cowdi_{egg,baby,junior,super,legendary}.webp` (lowercase stage) |
| 2 | Foxie | 🦊 | Common | Fire 🔥 | `Foxie/` | ✅ 5 stage — typo `Foxie_legandary.webp` |
| 3 | Pingu | 🐧 | Common | Water 💧 | `Pingu/` | ✅ 5 stage |
| 4 | Leafy | 🐢 | Common | Nature 🌿 | `Leafy/` | ✅ 5 stage |
| 5 | Paddy | 🌾 | Common | Nature 🌿 | `Lua/` | ✅ 5 stage — folder/file = `Lua` |
| 6 | Sparky | 🐉 | Rare | Fire 🔥 | `Sparky/` | ✅ 5 stage |
| 7 | Mimi | 🐱 | Rare | Cosmic 🌙 | `Mimi/` | ✅ 5 stage — file prefix `Mini_` |
| 8 | Owlbert | 🦉 | Rare | Nature 🌿 | `Owlbert/` | ✅ 5 stage |
| 9 | Flippy | 🐬 | Rare | Water 💧 | `Flippy/` | ✅ 5 stage |
| 10 | Sprout | 🎋 | Rare | Nature 🌿 | `Mangtre/` | ✅ 5 stage — folder/file = `Mangtre` |
| 11 | Leo | 🦁 | Epic | Fire 🔥 | `Leo/` | ✅ 5 stage |
| 12 | Bamboo | 🐼 | Epic | Nature 🌿 | `Bamboo/` | ✅ 5 stage |
| 13 | Storm | 🦅 | Epic | Cosmic 🌙 | `Storm/` | ✅ 5 stage — baby dùng `Storm-Baby.webp` |
| 14 | Shadow | 🐺 | Epic | Cosmic 🌙 | `Shadow/` | ✅ 5 stage |
| 15 | Ginseng | 🥕 | Epic | Earth 🌱 | `Ginseng/` | ✅ 5 stage |
| 16 | Prisma | 🦄 | Legendary | Cosmic 🌙 | `Prisma/` | ✅ 5 stage |
| 17 | Draco | 🐲 | Legendary | Fire 🔥 | `Draco/` | ✅ 5 stage — file lowercase `Draco_egg.webp`… |
| 18 | Pumpkin | 🎃 | Event | Cosmic 🌙 | `Pumpkin/` | ✅ 5 stage — file lowercase `Pumpkin_egg.webp`… |
| 19 | **Monk** | 🧘 | Event | Cosmic 🌙 | `Monk/` | ✅ 5 stage — pet sự kiện lễ Phật giáo |

### 5.2 Pet chưa có ảnh (3 pet mới, cần thiết kế)

| # | Pet | Emoji | Rarity | Element | Folder dự kiến | Trạng thái |
|---|-----|-------|--------|---------|----------------|-----------|
| 20 | **Nấm Rơm** (`mushroom`) | 🍄 | Rare | Earth 🌱 | `NamRom/` | ❌ 0/5 — file `NamRom_{Egg,Baby,Junior,Super,Legendary}.webp` |
| 21 | **Củ Cải Trắng** (`radish`) | 🥬 | Rare | Earth 🌱 | `CuCaiTrang/` | ❌ 0/5 — file `CuCaiTrang_{Egg,Baby,Junior,Super,Legendary}.webp` |
| 22 | **Bánh Bao** (`bun`) | 🥟 | Epic | Neutral ⚡ | `BanhBao/` | ❌ 0/5 — file `BanhBao_{Egg,Baby,Junior,Super,Legendary}.webp` |

### 5.3 Tổng kết file

| Mục | Số lượng |
|-----|----------|
| File `.webp` hiện có (19 pet × 5 stage, chưa tính duplicate Mimi/Mini) | **~95** |
| Cần bổ sung để đủ 22 pet × 5 stage | **15** (3 pet mới × 5 stage) |
| Tổng mục tiêu | **110** |

---

## 6. Mapping code trong `src/data/pets.js`

Mỗi pet khai báo theo pattern:

```js
// ── <Pet> Image Paths ─────────────────────────────────────────
const FOXIE_IMG = '/assets/images/pets/Foxie';
export const FOXIE_IMAGES = {
  egg: `${FOXIE_IMG}/Foxie_egg.webp`,
  baby: `${FOXIE_IMG}/Foxie_baby.webp`,
  junior: `${FOXIE_IMG}/Foxie_junior.webp`,
  super: `${FOXIE_IMG}/Foxie_super.webp`,
  legendary: `${FOXIE_IMG}/Foxie_legandary.webp`,
};

// ...

foxie: {
  // ...
  evolutions: [
    { stage: 0, name: 'Trứng Foxie', xp: 0, emoji: '🥚', image: FOXIE_IMAGES.egg },
    { stage: 1, name: 'Baby Foxie', xp: 100, emoji: '🦊', image: FOXIE_IMAGES.baby },
    { stage: 2, name: 'Junior Foxie', xp: 500, emoji: '🦊', image: FOXIE_IMAGES.junior },
    { stage: 3, name: 'Super Foxie', xp: 1200, emoji: '🔥', image: FOXIE_IMAGES.super },
    { stage: 4, name: 'Legendary Foxie', xp: 2500, emoji: '👑', image: FOXIE_IMAGES.legendary },
  ],
  // ...
},
```

Evolution không có `image` → app fallback sang emoji.

### Các hằng đang được export

`COWDI_IMAGES`, `FOXIE_IMAGES`, `PINGU_IMAGES`, `LEAFY_IMAGES`, `PADDY_IMAGES`, `SPARKY_IMAGES`, `MIMI_IMAGES`, `OWLBERT_IMAGES`, `FLIPPY_IMAGES`, `SPROUT_IMAGES`, `LEO_IMAGES`, `BAMBOO_IMAGES`, `STORM_IMAGES`, `SHADOW_IMAGES`, `GINSENG_IMAGES`, `PRISMA_IMAGES`, `DRACO_IMAGES`, `PUMPKIN_IMAGES`, `MONK_IMAGES`.

**Chờ asset (đã khai báo đường dẫn, chưa có file):** `MUSHROOM_IMAGES`, `RADISH_IMAGES`, `BUN_IMAGES`.

### Việc cần làm

- [ ] Thiết kế 5 stage cho **Nấm Rơm** → `public/assets/images/pets/NamRom/`.
- [ ] Thiết kế 5 stage cho **Củ Cải Trắng** → `public/assets/images/pets/CuCaiTrang/`.
- [ ] Thiết kế 5 stage cho **Bánh Bao** → `public/assets/images/pets/BanhBao/`.

---

## 7. Danh sách thiết kế 22 pet

### 7.1 Cowdi 🐮 — Bò sữa *(Starter / Neutral)*

| | |
|---|---|
| Rarity | Starter (có sẵn) |
| Tính cách | Hiền lành, yêu tiếng Anh, đồng hành từ ngày đầu |
| Màu chủ đạo | Trắng + đốm đen, mũi hồng |
| Trạng thái | ✅ 5 stage đầy đủ — file `Cowdi_{egg,baby,junior,super,legendary}.webp` (lowercase stage) |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng trắng có đốm đen kiểu bò sữa |
| 1 Baby | 100 | Bê con nhỏ xíu, mắt to tròn |
| 2 Junior | 500 | Bò sữa trẻ, vui vẻ |
| 3 Super | 1200 | Bò khỏe, sừng, cơ bắp nhẹ |
| 4 Legendary | 2500 | Bò oai vệ, vương miện/hào quang |

---

### 7.2 Foxie 🦊 — Cáo lửa *(Common / Fire)* ✅

| | |
|---|---|
| Mở khóa | Hoàn thành 5 bài học |
| Stats | Listening 4 · Speaking 3 · Reading 8 · Writing 5 |
| Tính cách | Thông minh, giỏi ngữ pháp, thích giải đố |
| Màu chủ đạo | Cam đỏ, bụng trắng |
| Trạng thái | ✅ 5 stage đầy đủ — typo `Foxie_legandary.webp` |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng cam có vân lửa nhỏ |
| 1 Baby | 100 | Cáo con bụng trắng, mắt tròn |
| 2 Junior | 500 | Cáo trẻ, đuôi xù |
| 3 Super | 1200 | Cáo lửa, đuôi bốc cháy nhẹ |
| 4 Legendary | 2500 | Cáo 9 đuôi rực lửa, vương miện vàng |

---

### 7.3 Pingu 🐧 — Chim cánh cụt *(Common / Water)* ✅

| | |
|---|---|
| Mở khóa | 10 quiz Listening |
| Stats | Listening 8 · Speaking 4 · Reading 4 · Writing 4 |
| Tính cách | Chăm chỉ, thính giác nhạy, yêu âm nhạc |
| Màu chủ đạo | Đen trắng, mỏ cam |
| Trạng thái | ✅ 5 stage đầy đủ, đã wire vào code |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng trắng có vân băng tuyết |
| 1 Baby | 100 | Cánh cụt con, đeo tai nghe nhỏ |
| 2 Junior | 500 | Cánh cụt vui vẻ, quàng khăn |
| 3 Super | 1200 | Cánh cụt mạnh, băng xung quanh |
| 4 Legendary | 2500 | Cánh cụt hoàng đế, vương miện băng |

---

### 7.4 Leafy 🐢 — Rùa lá *(Common / Nature)* ✅

| | |
|---|---|
| Mở khóa | Học 50 từ vựng |
| Stats | Listening 4 · Speaking 8 · Reading 4 · Writing 4 |
| Tính cách | Kiên nhẫn, chậm mà chắc, nhớ từ vựng cực giỏi |
| Màu chủ đạo | Xanh lá + nâu đất |
| Trạng thái | ✅ 5 stage đầy đủ |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng xanh có vân lá |
| 1 Baby | 100 | Rùa con mai mềm, lá nhỏ trên đầu |
| 2 Junior | 500 | Rùa vui tươi, mai vẽ hoa văn lá |
| 3 Super | 1200 | Rùa mai có cây nhỏ mọc lên |
| 4 Legendary | 2500 | Rùa thần lá, mai có cả khu rừng mini |

---

### 7.5 Sparky 🐉 — Rồng nhỏ *(Rare / Fire)* ✅

| | |
|---|---|
| Mở khóa | Streak 7 ngày |
| Stats | Listening 4 · Speaking 4 · Reading 5 · Writing 8 |
| Tính cách | Đầy năng lượng, sáng tạo vô hạn, thích viết câu |
| Màu chủ đạo | Đỏ cam + vàng |
| Trạng thái | ✅ 5 stage đầy đủ |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng đỏ cam có vân lửa |
| 1 Baby | 100 | Rồng con nhỏ xíu, cánh chưa mọc |
| 2 Junior | 500 | Rồng trẻ, cánh nhỏ, đốm lửa |
| 3 Super | 1200 | Rồng cánh rộng, phun lửa nhẹ |
| 4 Legendary | 2500 | Rồng huyền thoại, hào quang lửa rực |

---

### 7.6 Mimi 🐱 — Mèo mây *(Rare / Cosmic)* ✅

| | |
|---|---|
| Mở khóa | 3 quiz đạt 100% |
| Stats | Listening 5 · Speaking 5 · Reading 6 · Writing 4 |
| Tính cách | Thần bí, giỏi phân tích, tinh nghịch ban đêm |
| Màu chủ đạo | Tím pastel + trắng mây |
| Trạng thái | ✅ 5 stage đầy đủ (file prefix `Mini_`) |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng tím pastel, ngôi sao nhỏ |
| 1 Baby | 100 | Mèo con tròn xoe, đuôi mây |
| 2 Junior | 500 | Mèo trẻ, lông trắng mây, mắt sao |
| 3 Super | 1200 | Mèo bay trên đám mây tím |
| 4 Legendary | 2500 | Mèo thiên thần, vầng trăng phía sau |

---

### 7.7 Owlbert 🦉 — Cú vọ *(Rare / Nature)* ✅

| | |
|---|---|
| Mở khóa | 15 quiz Grammar |
| Stats | Listening 5 · Speaking 4 · Reading 8 · Writing 5 |
| Tính cách | Thông thái, bậc thầy ngữ pháp |
| Màu chủ đạo | Nâu + vàng mật ong |
| Trạng thái | ✅ 5 stage đầy đủ |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng nâu vân lông cú |
| 1 Baby | 100 | Cú con tròn vo, mắt to |
| 2 Junior | 500 | Cú trẻ ôm sách nhỏ |
| 3 Super | 1200 | Cú đeo kính, giáo trình bay quanh |
| 4 Legendary | 2500 | Cú giáo sư, mũ tốt nghiệp + cánh sáng |

---

### 7.8 Flippy 🐬 — Cá heo *(Rare / Water)* ✅

| | |
|---|---|
| Mở khóa | Học 100 từ vựng |
| Stats | Listening 7 · Speaking 6 · Reading 5 · Writing 4 |
| Tính cách | Vui vẻ, năng động, nghe hiểu siêu nhanh |
| Màu chủ đạo | Xanh dương + bụng trắng |
| Trạng thái | ✅ 5 stage đầy đủ |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng xanh có bọt nước |
| 1 Baby | 100 | Cá heo con nhỏ xinh |
| 2 Junior | 500 | Cá heo nhảy sóng |
| 3 Super | 1200 | Cá heo cưỡi sóng lớn |
| 4 Legendary | 2500 | Cá heo huyền thoại, đại dương rực sáng |

---

### 7.9 Leo 🦁 — Sư tử *(Epic / Fire)* ✅

| | |
|---|---|
| Mở khóa | 1.000 XP |
| Stats | Listening 6 · Speaking 7 · Reading 6 · Writing 6 |
| Tính cách | Dũng mãnh toàn diện, lãnh đạo bẩm sinh |
| Màu chủ đạo | Vàng + cam đậm |
| Trạng thái | ✅ 5 stage đầy đủ |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng vàng có vân bờm |
| 1 Baby | 100 | Sư tử con bờm tơ, mắt to |
| 2 Junior | 500 | Sư tử trẻ, bờm dày hơn |
| 3 Super | 1200 | Sư tử oai, lửa bốc quanh bờm |
| 4 Legendary | 2500 | Vua sư tử, vương miện vàng, lửa thiêng |

---

### 7.10 Bamboo 🐼 — Gấu trúc *(Epic / Nature)* ✅

| | |
|---|---|
| Mở khóa | Hoàn thành 8 bài học |
| Stats | Listening 5 · Speaking 8 · Reading 6 · Writing 5 |
| Tính cách | Hiền lành, bậc thầy giao tiếp |
| Màu chủ đạo | Đen trắng + tre xanh |
| Trạng thái | ✅ 5 stage đầy đủ |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng trắng có đốm đen |
| 1 Baby | 100 | Gấu trúc con ôm búp tre |
| 2 Junior | 500 | Gấu trúc trẻ, gặm tre |
| 3 Super | 1200 | Gấu trúc võ sĩ, gậy tre |
| 4 Legendary | 2500 | Gấu trúc đại sư, rừng tre nền |

---

### 7.11 Storm 🦅 — Đại bàng *(Epic / Cosmic)* ✅

| | |
|---|---|
| Mở khóa | Streak 30 ngày |
| Stats | Listening 6 · Speaking 5 · Reading 6 · Writing 7 |
| Tính cách | Kiên cường, sáng tạo, không khuất phục bão tố |
| Màu chủ đạo | Xám bạc + tím sấm |
| Trạng thái | ✅ 5 stage đầy đủ (baby dùng `Storm-Baby.webp`) |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng xám có tia sét |
| 1 Baby | 100 | Đại bàng con xù lông, mây nhỏ quanh |
| 2 Junior | 500 | Đại bàng trẻ, cánh xòe |
| 3 Super | 1200 | Đại bàng bay trong bão, sấm chớp |
| 4 Legendary | 2500 | Đại bàng vương, hào quang sét tím |

---

### 7.12 Shadow 🐺 — Sói bóng *(Epic / Cosmic)* ✅

| | |
|---|---|
| Mở khóa | Hoàn thành 50 quiz |
| Stats | Listening 6 · Speaking 5 · Reading 7 · Writing 6 |
| Tính cách | Huyền bí, trí tuệ sâu sắc, lặng lẽ quan sát |
| Màu chủ đạo | Đen + tím đậm |
| Trạng thái | ✅ 5 stage đầy đủ |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng đen vân bóng tối |
| 1 Baby | 100 | Sói con đen, mắt sáng |
| 2 Junior | 500 | Sói trẻ, bóng tối nhẹ |
| 3 Super | 1200 | Sói bóng đêm, hiệu ứng tối |
| 4 Legendary | 2500 | Sói huyền bí, áo choàng bóng tối |

---

### 7.13 Prisma 🦄 — Kỳ lân *(Legendary / Cosmic)* ✅

| | |
|---|---|
| Mở khóa | Đạt 2.500 XP |
| Stats | Listening 7 · Speaking 7 · Reading 7 · Writing 7 |
| Tính cách | Phép màu, mang đến cảm hứng học tập |
| Màu chủ đạo | Cầu vồng + trắng lấp lánh |
| Trạng thái | ✅ 5 stage đầy đủ |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng lấp lánh 7 sắc |
| 1 Baby | 100 | Kỳ lân con sừng nhỏ |
| 2 Junior | 500 | Kỳ lân trẻ, bờm cầu vồng |
| 3 Super | 1200 | Kỳ lân hào quang 7 sắc |
| 4 Legendary | 2500 | Kỳ lân toàn thân tỏa sáng, sao quanh |

---

### 7.14 Draco 🐲 — Rồng cổ đại *(Legendary / Fire)* ✅

| | |
|---|---|
| Mở khóa | Sưu tầm đủ tất cả các pet khác |
| Stats | Listening 8 · Speaking 8 · Reading 8 · Writing 8 |
| Tính cách | Cổ đại, oai vệ, bậc thầy ngàn năm |
| Màu chủ đạo | Đỏ sẫm + vàng kim |
| Trạng thái | ✅ 5 stage đầy đủ (file lowercase `Draco_egg.webp`…) |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng đỏ vảy rồng cổ |
| 1 Baby | 100 | Rồng con cánh nhỏ |
| 2 Junior | 500 | Rồng trẻ oai vệ, vảy sáng |
| 3 Super | 1200 | Rồng cổ đại phun lửa |
| 4 Legendary | 2500 | Vương miện lửa huyền thoại |

---

### 7.15 Pumpkin 🎃 — Bí ngô ma *(Event / Cosmic)* ✅

| | |
|---|---|
| Mở khóa | Sự kiện Halloween |
| Stats | Listening 5 · Speaking 5 · Reading 6 · Writing 6 |
| Tính cách | Tinh nghịch, mang không khí lễ hội |
| Màu chủ đạo | Cam bí ngô + tím Halloween |
| Trạng thái | ✅ 5 stage đầy đủ (file lowercase `Pumpkin_egg.webp`…) |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng cam mặt bí ngô |
| 1 Baby | 100 | Bí ngô con, mặt cười |
| 2 Junior | 500 | Bí ngô đội mũ phù thủy nhỏ |
| 3 Super | 1200 | Bí ngô lửa Halloween bốc cháy |
| 4 Legendary | 2500 | Vua bí ngô, hào quang ma thuật |

---

### 7.16 Monk 🧘 — Tiểu hòa thượng *(Event / Cosmic)* ✅ *(mới)*

| | |
|---|---|
| Mở khóa | Sự kiện Phật giáo (lễ Phật Đản, Vu Lan…) |
| Stats | Listening 7 · Speaking 6 · Reading 8 · Writing 7 |
| Tính cách | Thanh tịnh, an lạc, mang đến trí tuệ và bonus học tập |
| Màu chủ đạo | Vàng nghệ + nâu áo cà sa, sen hồng |
| Trạng thái | ✅ 5 stage đầy đủ — file `Monk_{Egg,Baby,Junior,Super,Legendary}.webp` |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng vàng nghệ có hoa văn sen |
| 1 Baby — Tiểu Monk | 100 | Bé hòa thượng trọc đầu, áo cà sa nhỏ |
| 2 Junior — Sa Di | 500 | Cầm chuỗi tràng hạt, mặt tĩnh tâm |
| 3 Super — Đại Đức | 1200 | Ngồi thiền trên đài sen, hào quang nhẹ |
| 4 Legendary — Thiền Sư | 2500 | Bánh xe pháp luân ☸️ phía sau, phước lành tỏa ánh vàng |

---

### 7.17 Ginseng 🥕 — Nhân sâm *(Epic / Earth)* ✅

| | |
|---|---|
| Mở khóa | Sưu tầm đủ `leafy` + `bamboo` + `paddy` + `mushroom` |
| Stats | Listening 6 · Speaking 5 · Reading 7 · Writing 6 |
| Tính cách | Sống lâu, trí tuệ cổ xưa, hồi phục năng lượng |
| Màu chủ đạo | Vàng nhạt + trắng kem + rễ tua rua |
| Trạng thái | ✅ 5 stage đầy đủ |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Củ sâm con nằm trong đất |
| 1 Baby | 100 | Sâm con có chân tay nhỏ |
| 2 Junior | 500 | Sâm vui tươi, rễ dài hơn |
| 3 Super | 1200 | Sâm già hơn, hào quang vàng |
| 4 Legendary | 2500 | Sâm cổ ngàn năm, vương miện rễ |

---

### 7.18 Paddy 🌾 — Lúa *(Common / Nature)* ✅

| | |
|---|---|
| Mở khóa | Hoàn thành 12 bài học |
| Stats | Listening 4 · Speaking 5 · Reading 6 · Writing 5 |
| Tính cách | Chăm chỉ, tích lũy tài nguyên, gắn với đồng quê Việt |
| Màu chủ đạo | Vàng lúa + xanh nhạt |
| Trạng thái | ✅ 5 stage đầy đủ — folder `Lua/`, file `Lua_*.webp` |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Hạt lúa tròn nâu |
| 1 Baby | 100 | Mầm lúa non, lá xanh nhỏ |
| 2 Junior | 500 | Cây lúa con, vài bông |
| 3 Super | 1200 | Bông lúa chín vàng |
| 4 Legendary | 2500 | Cánh đồng lúa vàng rực, vương miện rơm |

---

### 7.19 Sprout 🎋 — Măng tre *(Rare / Nature)* ✅

| | |
|---|---|
| Mở khóa | Streak 14 ngày |
| Stats | Listening 5 · Speaking 6 · Reading 5 · Writing 6 |
| Tính cách | Kiên cường, vươn cao không ngừng, gió lớn không gãy |
| Màu chủ đạo | Xanh lá + xanh đậm |
| Trạng thái | ✅ 5 stage đầy đủ — folder `Mangtre/`, file `Mangtre_*.webp` |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Hạt măng nằm trong đất |
| 1 Baby | 100 | Búp măng non nhú khỏi đất |
| 2 Junior | 500 | Măng tre trẻ, cao vừa |
| 3 Super | 1200 | Cây tre cao, lá xòe |
| 4 Legendary | 2500 | Rừng tre nền, vương miện lá tre |

---

### 7.20 Nấm Rơm 🍄 — Nấm rơm *(Rare / Earth)* ❌ *(mới — chờ asset)*

| | |
|---|---|
| Mở khóa | Học 80 từ vựng |
| Stats | Listening 6 · Speaking 4 · Reading 7 · Writing 5 |
| Tính cách | Khiêm nhường, lặng lẽ tích lũy như mùa rơm rạ sau gặt |
| Màu chủ đạo | Nâu rơm + trắng kem + chấm xám trên mũ nấm |
| Folder dự kiến | `public/assets/images/pets/NamRom/` |
| Trạng thái | ❌ **Chưa có ảnh — cần thiết kế 5 stage** |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Trứng nâu nằm trên đụn rơm vàng |
| 1 Baby | 100 | Nấm con mũ tròn xíu, mắt to ngơ ngác |
| 2 Junior | 500 | Nấm trẻ, mũ nâu vàng, thân trắng |
| 3 Super | 1200 | Nấm lớn, có vài cây nhỏ mọc quanh |
| 4 Legendary | 2500 | Nấm tiên, mũ tỏa hào quang vàng + bào tử sáng |

---

### 7.21 Củ Cải Trắng 🥬 — Củ cải trắng *(Rare / Earth)* ❌ *(mới — chờ asset)*

| | |
|---|---|
| Mở khóa | Hoàn thành 10 bài học |
| Stats | Listening 5 · Speaking 5 · Reading 6 · Writing 7 |
| Tính cách | Cắm rễ sâu, viết chữ chắc nịch như củ trắng giòn ngọt |
| Màu chủ đạo | Trắng + xanh lá trên ngọn |
| Folder dự kiến | `public/assets/images/pets/CuCaiTrang/` |
| Trạng thái | ❌ **Chưa có ảnh — cần thiết kế 5 stage** |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Hạt củ cải trắng nhỏ |
| 1 Baby | 100 | Mầm xanh nhú lên, củ tí xíu |
| 2 Junior | 500 | Củ cải non, lá xanh tươi |
| 3 Super | 1200 | Củ cải lớn, lá xòe rộng, tay cầm bút |
| 4 Legendary | 2500 | Củ cải huyền thoại, hào quang trắng + cuộn giấy chữ vàng |

---

### 7.22 Bánh Bao 🥟 — Bánh bao *(Epic / Neutral)* ❌ *(mới — chờ asset)*

| | |
|---|---|
| Mở khóa | 5 quiz đạt điểm tuyệt đối |
| Stats | Listening 6 · Speaking 7 · Reading 5 · Writing 5 |
| Tính cách | Mũm mĩm, ấm áp, hào phóng — sẵn sàng kể chuyện cùng bạn |
| Màu chủ đạo | Trắng kem + hơi nước hồng nhạt |
| Folder dự kiến | `public/assets/images/pets/BanhBao/` |
| Trạng thái | ❌ **Chưa có ảnh — cần thiết kế 5 stage** |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | Cục bột trắng tròn xoe |
| 1 Baby | 100 | Bánh bao mini, mặt cười |
| 2 Junior | 500 | Bánh bao nhân thịt, hơi nước bốc lên |
| 3 Super | 1200 | Bánh bao đại sư, đeo dải lụa |
| 4 Legendary | 2500 | Bánh bao vương, lò hấp vàng + hào quang ấm áp |



---

## 8. Nguyên tắc thiết kế

### Phong cách

- **Art style:** Chibi / cute cartoon — phù hợp học sinh cấp 2–3, đại học.
- **Line art:** Sạch, rõ ràng, dễ nhận diện ở 48 px.
- **Biểu cảm:** Vui vẻ, thân thiện, khích lệ.

### Độ phức tạp theo stage

| Stage | Mức độ | Đặc điểm |
|-------|--------|----------|
| 0 Egg | ★☆☆☆☆ | Trứng có vân/màu đặc trưng loài |
| 1 Baby | ★★☆☆☆ | Tỷ lệ đầu to, mắt to tròn, dễ thương tối đa |
| 2 Junior | ★★★☆☆ | Tỷ lệ cân đối, rõ đặc trưng loài |
| 3 Super | ★★★★☆ | Thêm phụ kiện + hiệu ứng nguyên tố |
| 4 Legendary | ★★★★★ | Vương miện / hào quang, chi tiết tối đa |

### Bảng màu nguyên tố

| Nguyên tố | Màu chính | Màu phụ | Hiệu ứng |
|-----------|-----------|---------|----------|
| 🔥 Fire | `#FF5722` | `#FF9800` | Lửa, tia lửa |
| 💧 Water | `#2196F3` | `#00BCD4` | Sóng, bọt nước |
| 🌿 Nature | `#4CAF50` | `#8BC34A` | Lá, hoa, dây leo |
| 🌙 Cosmic | `#9C27B0` | `#E1BEE7` | Sao, mây, ánh trăng |
| 🌱 Earth | `#8D6E63` | `#D7CCC8` | Đất, đá, rễ cây |
| ⚡ Neutral | `#FF9800` | `#FFC107` | Không hiệu ứng |

---

## 9. Checklist bàn giao

Khi designer hoàn thành một pet:

- [ ] Đủ **5 file** (`_Egg`, `_Baby`, `_Junior`, `_Super`, `_Legendary`)
- [ ] **Nền trong suốt**, không halo/viền mờ
- [ ] Canvas **512×512 px**, tỷ lệ 1:1
- [ ] Định dạng **`.webp`**, quality 80–90, ≤ **50 KB/file**
- [ ] Tên file đúng quy ước: `{TênPet}_Egg.webp`…
- [ ] Thư mục đúng: `public/assets/images/pets/{TênPet}/`
- [ ] Rõ ràng ở thumbnail 48×48 (zoom out kiểm tra)
- [ ] Chạy `node scripts/convert-png-to-webp.mjs --dry` để đảm bảo không còn PNG
- [ ] Cập nhật `src/data/pets.js` → thêm `{PET}_IMAGES` + gán vào `evolutions[].image`
- [ ] `npm run build` pass, test mở `PetPage` / `CollectionPage`

---

## 10. Cấu trúc thư mục hiện tại

```
public/assets/images/pets/
├── Bamboo/      ✅  Bamboo_{Egg,Baby,Junior,Super,Legendary}.webp
├── Cowdi/       ✅  Cowdi_{egg,baby,junior,super,legendary}.webp     (file lowercase)
├── Draco/       ✅  Draco_{egg,baby,junior,super,legendary}.webp     (file lowercase)
├── Flippy/      ✅  Flippy_{Egg,Baby,Junior,Super,Legendary}.webp
├── Foxie/       ✅  Foxie_{egg,baby,junior,super,legandary}.webp     (typo `legandary`)
├── Ginseng/     ✅  Ginseng_{Egg,Baby,Junior,Super,Legendary}.webp
├── Leafy/       ✅  Leafy_{Egg,Baby,Junior,Super,Legendary}.webp
├── Leo/         ✅  Leo_{Egg,Baby,Junior,Super,Legendary}.webp
├── Lua/         ✅  Lua_{Egg,Baby,Junior,Super,Legendary}.webp       (pet = Paddy)
├── Mangtre/     ✅  Mangtre_{Egg,Baby,Junior,Super,Legendary}.webp   (pet = Sprout)
├── Mimi/        ✅  Mini_{Egg,Baby,Junior,Super,Legendary}.webp      (prefix file = "Mini_")
├── Monk/        ✅  Monk_{Egg,Baby,Junior,Super,Legendary}.webp
├── Owlbert/     ✅  Owlbert_{Egg,Baby,Junior,Super,Legendary}.webp
├── Pingu/       ✅  Pingu_{egg,baby,junior,super,legendary}.webp
├── Prisma/      ✅  Prisma_{Egg,Baby,Junior,Super,Legendary}.webp
├── Pumpkin/     ✅  Pumpkin_{egg,baby,junior,super,legendary}.webp   (file lowercase)
├── Shadow/      ✅  Shadow_{Egg,Baby,Junior,Super,Legendary}.webp
├── Sparky/      ✅  Sparky_{Egg,Baby,Junior,Super,Legendary}.webp
└── Storm/       ✅  Storm_{Egg,Junior,Super,Legendary}.webp + Storm-Baby.webp

(Chưa có — cần thiết kế 5 stage cho 3 pet mới):
   NamRom/      ❌  NamRom_{Egg,Baby,Junior,Super,Legendary}.webp     (pet = Nấm Rơm)
   CuCaiTrang/  ❌  CuCaiTrang_{Egg,Baby,Junior,Super,Legendary}.webp (pet = Củ Cải Trắng)
   BanhBao/     ❌  BanhBao_{Egg,Baby,Junior,Super,Legendary}.webp    (pet = Bánh Bao)
```

---

*Cập nhật lần cuối: 14/05/2026 — đồng bộ với `PET_REGISTRY` (22 pet); Monk + Shadow/Prisma/Draco/Pumpkin/Cowdi-egg/Pingu đã hoàn thiện asset; còn 3 pet mới chờ ảnh.*
