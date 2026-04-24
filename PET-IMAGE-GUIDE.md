# 🎨 Hướng dẫn thiết kế & quản lý hình ảnh Pet — Cowdi English

> Tài liệu dành cho đội thiết kế & developer. Cập nhật: 24/04/2026
> Đồng bộ với `src/data/pets.js` và thư mục `public/assets/images/pets/`.

---

## 1. Tổng quan

Cowdi English có **18 pet** trong `PET_REGISTRY`, mỗi pet có **5 giai đoạn tiến hóa** (stage 0 – egg → 4 – legendary).

- **13/18 pet** đã có bộ ảnh 5 stage (WebP).
- **1/18 pet** (Cowdi — starter) có 4 stage, thiếu `egg`.
- **4/18 pet** chưa có ảnh: Shadow, Prisma, Draco, Pumpkin → đang fallback bằng emoji.
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

## 5. Trạng thái hiện tại của 18 pet

Nguồn: `src/data/pets.js` → `PET_REGISTRY` + thư mục `public/assets/images/pets/`.

### 5.1 Pet đã có ảnh đầy đủ (13)

| # | Pet | Emoji | Rarity | Element | Folder | Ghi chú |
|---|-----|-------|--------|---------|--------|---------|
| 1 | Foxie | 🦊 | Common | Fire 🔥 | `Foxie/` | ✅ 5 stage |
| 2 | Leafy | 🐢 | Common | Nature 🌿 | `Leafy/` | ✅ 5 stage |
| 3 | Sparky | 🐉 | Rare | Fire 🔥 | `Sparky/` | ✅ 5 stage |
| 4 | Mimi | 🐱 | Rare | Cosmic 🌙 | `Mimi/` | ✅ 5 stage — file name `Mini_*` |
| 5 | Owlbert | 🦉 | Rare | Nature 🌿 | `Owlbert/` | ✅ 5 stage |
| 6 | Flippy | 🐬 | Rare | Water 💧 | `Flippy/` | ✅ 5 stage |
| 7 | Leo | 🦁 | Epic | Fire 🔥 | `Leo/` | ✅ 5 stage |
| 8 | Bamboo | 🐼 | Epic | Nature 🌿 | `Bamboo/` | ✅ 5 stage |
| 9 | Storm | 🦅 | Epic | Cosmic 🌙 | `Storm/` | ✅ 5 stage (baby dùng `Storm-Baby.webp`) |
| 10 | Ginseng | 🥕 | Epic | Earth 🌱 | `Ginseng/` | ✅ 5 stage |
| 11 | Paddy | 🌾 | Common | Nature 🌿 | `Lua/` | ✅ 5 stage |
| 12 | Sprout | 🎋 | Rare | Nature 🌿 | `Mangtre/` | ✅ 5 stage |
| 13 | **Pingu** | 🐧 | Common | Water 💧 | `Pingu/` | ⚠️ có 5 file ảnh nhưng **chưa wire vào `pets.js`** |

### 5.2 Pet thiếu ảnh (5)

| # | Pet | Emoji | Rarity | Element | Trạng thái |
|---|-----|-------|--------|---------|-----------|
| 14 | **Cowdi** | 🐮 | Starter | Neutral ⚡ | 4/5 — **thiếu `egg`** |
| 15 | Shadow | 🐺 | Epic | Cosmic 🌙 | ❌ 0/5 — emoji |
| 16 | Prisma | 🦄 | Legendary | Cosmic 🌙 | ❌ 0/5 — emoji |
| 17 | Draco | 🐲 | Legendary | Fire 🔥 | ❌ 0/5 — emoji |
| 18 | Pumpkin | 🎃 | Event | Cosmic 🌙 | ❌ 0/5 — emoji |

### 5.3 Tổng kết file

| Mục | Số lượng |
|-----|----------|
| File `.webp` hiện có (bao gồm Pingu chưa wire + duplicate Mimi/Mini) | **74** |
| Cần bổ sung để đủ 18 pet × 5 stage | **21** (Cowdi egg + 4 pet × 5 stage) |
| Tổng mục tiêu | **90** |

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

`COWDI_IMAGES`, `FOXIE_IMAGES`, `GINSENG_IMAGES`, `BAMBOO_IMAGES`, `FLIPPY_IMAGES`, `LEAFY_IMAGES`, `LEO_IMAGES`, `SPARKY_IMAGES`, `OWLBERT_IMAGES`, `MIMI_IMAGES`, `PADDY_IMAGES`, `STORM_IMAGES`, `SPROUT_IMAGES`.

**Thiếu:** `PINGU_IMAGES` — tuy đã có file nhưng chưa khai báo.

### Việc cần làm trong code (tách khỏi tài liệu thiết kế)

- [ ] Thêm `PINGU_IMAGES` + gán `image` vào 5 evolution của `pingu`.
- [ ] Bổ sung `Cowdi_egg.webp` + key `egg` trong `COWDI_IMAGES` + evolution `stage: 0`.
- [ ] Khi có ảnh Shadow/Prisma/Draco/Pumpkin → thêm block `*_IMAGES` tương ứng.

---

## 7. Danh sách thiết kế 18 pet

### 7.1 Cowdi 🐮 — Bò sữa *(Starter / Neutral)*

| | |
|---|---|
| Rarity | Starter (có sẵn) |
| Tính cách | Hiền lành, yêu tiếng Anh, đồng hành từ ngày đầu |
| Màu chủ đạo | Trắng + đốm đen, mũi hồng |
| Trạng thái | ⚠️ 4/5 stage — thiếu `egg` |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 Egg | 0 | **CẦN VẼ** — trứng trắng có đốm đen kiểu bò sữa |
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

---

### 7.3 Pingu 🐧 — Chim cánh cụt *(Common / Water)* ⚠️

| | |
|---|---|
| Mở khóa | 10 quiz Listening |
| Tính cách | Chăm chỉ, thính giác nhạy, yêu âm nhạc |
| Màu chủ đạo | Đen trắng, mỏ cam |
| Trạng thái | Ảnh đã có nhưng **chưa wire vào code** → vẫn hiện emoji |

| Stage | XP | Hướng dẫn visual |
|-------|----|------------------|
| 0 | 0 | Trứng trắng có vân băng tuyết |
| 1 | 100 | Cánh cụt con, đeo tai nghe nhỏ |
| 2 | 500 | Cánh cụt vui vẻ, quàng khăn |
| 3 | 1200 | Cánh cụt mạnh, băng xung quanh |
| 4 | 2500 | Cánh cụt hoàng đế, vương miện băng |

---

### 7.4 Leafy 🐢 — Rùa lá *(Common / Nature)* ✅

Mở khóa: học 50 từ vựng. Kiên nhẫn, chậm mà chắc. Xanh lá + nâu đất.

### 7.5 Sparky 🐉 — Rồng nhỏ *(Rare / Fire)* ✅

Mở khóa: streak 7 ngày. Đầy năng lượng, thích viết câu. Đỏ cam + vàng.

### 7.6 Mimi 🐱 — Mèo mây *(Rare / Cosmic)* ✅

Mở khóa: 3 quiz 100%. Thần bí, giỏi phân tích. Tím pastel + trắng mây.

### 7.7 Owlbert 🦉 — Cú vọ *(Rare / Nature)* ✅

Mở khóa: 15 quiz Grammar. Thông thái. Nâu + vàng mật ong.

### 7.8 Flippy 🐬 — Cá heo *(Rare / Water)* ✅

Mở khóa: 100 từ vựng. Vui vẻ, nghe hiểu siêu nhanh. Xanh dương + bụng trắng.

### 7.9 Leo 🦁 — Sư tử *(Epic / Fire)* ✅

Mở khóa: 1,000 XP. Dũng mãnh toàn diện. Vàng + cam đậm.

### 7.10 Bamboo 🐼 — Gấu trúc *(Epic / Nature)* ✅

Mở khóa: 8 bài học. Bậc thầy giao tiếp. Đen trắng + tre xanh.

### 7.11 Storm 🦅 — Đại bàng *(Epic / Cosmic)* ✅

Mở khóa: streak 30 ngày. Kiên cường, sáng tạo. Xám bạc + tím sấm.

### 7.12 Shadow 🐺 — Sói bóng *(Epic / Cosmic)* ❌

| | |
|---|---|
| Mở khóa | 50 quiz |
| Tính cách | Huyền bí, trí tuệ sâu sắc |
| Màu chủ đạo | Đen + tím đậm |
| Trạng thái | **Chưa có ảnh — cần vẽ 5 stage** |

| Stage | Hướng dẫn |
|-------|-----------|
| 0 | Trứng đen vân bóng tối |
| 1 | Sói con đen, mắt sáng |
| 2 | Sói trẻ, bóng tối nhẹ |
| 3 | Sói bóng đêm, hiệu ứng tối |
| 4 | Sói huyền bí, áo choàng bóng tối |

---

### 7.13 Prisma 🦄 — Kỳ lân *(Legendary / Cosmic)* ❌

| | |
|---|---|
| Mở khóa | 2,500 XP |
| Màu chủ đạo | Cầu vồng + trắng lấp lánh |
| Trạng thái | **Chưa có ảnh — cần vẽ 5 stage** |

Stage: trứng lấp lánh → kỳ lân con sừng nhỏ → bờm cầu vồng → hào quang 7 sắc → toàn thân tỏa sáng.

---

### 7.14 Draco 🐲 — Rồng cổ đại *(Legendary / Fire)* ❌

| | |
|---|---|
| Mở khóa | Sưu tầm đủ 17 pet khác |
| Màu chủ đạo | Đỏ sẫm + vàng kim |
| Trạng thái | **Chưa có ảnh — cần vẽ 5 stage** |

Stage: trứng đỏ vảy rồng cổ → rồng con cánh nhỏ → rồng trẻ oai vệ → lửa cổ đại → vương miện lửa huyền thoại.

---

### 7.15 Pumpkin 🎃 — Bí ngô ma *(Event / Cosmic)* ❌

| | |
|---|---|
| Mở khóa | Sự kiện Halloween |
| Màu chủ đạo | Cam bí ngô + tím Halloween |
| Trạng thái | **Chưa có ảnh — cần vẽ 5 stage** |

Stage: trứng cam mặt bí ngô → bí ngô con → mũ phù thủy nhỏ → lửa Halloween → vua bí ngô hào quang ma thuật.

---

### 7.16 Ginseng 🥕 — Nhân sâm *(Epic / Earth)* ✅

Mở khóa: sưu tầm `leafy + bamboo + rice + mushroom`. Sống lâu, trí tuệ cổ xưa. Vàng nhạt + trắng kem + rễ tua rua.

### 7.17 Paddy 🌾 — Lúa *(Common / Nature)* ✅

Mở khóa: 12 bài học. Chăm chỉ, tích lũy tài nguyên. Vàng lúa + xanh nhạt. Folder `Lua/`, file `Lua_*.webp`.

### 7.18 Sprout 🎋 — Măng tre *(Rare / Nature)* ✅

Mở khóa: streak 14 ngày. Kiên cường, vươn cao. Xanh lá + xanh đậm. Folder `Mangtre/`, file `Mangtre_*.webp`.

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
├── Cowdi/       ⚠️  Cowdi_{baby,junior,super,legandary}.webp  (thiếu egg)
├── Flippy/      ✅  Flippy_{Egg,Baby,Junior,Super,Legendary}.webp
├── Foxie/       ✅  Foxie_{egg,baby,junior,super,legandary}.webp
├── Ginseng/     ✅  Ginseng_{Egg,Baby,Junior,Super,Legendary}.webp
├── Leafy/       ✅  Leafy_{Egg,Baby,Junior,Super,Legendary}.webp
├── Leo/         ✅  Leo_{Egg,Baby,Junior,Super,Legendary}.webp
├── Lua/         ✅  Lua_{Egg,Baby,Junior,Super,Legendary}.webp       (pet = Paddy)
├── Mangtre/     ✅  Mangtre_{Egg,Baby,Junior,Super,Legendary}.webp   (pet = Sprout)
├── Mimi/        ✅  Mini_{Egg,Baby,Junior,Super,Legendary}.webp      (prefix file = "Mini_")
├── Owlbert/     ✅  Owlbert_{Egg,Baby,Junior,Super,Legendary}.webp
├── Pingu/       ⚠️  Pingu_{Egg,Baby,Junior,Super,Legendary}.webp     (có file nhưng chưa wire)
├── Sparky/      ✅  Sparky_{Egg,Baby,Junior,Super,Legendary}.webp
└── Storm/       ✅  Storm_{Egg,Junior,Super,Legendary}.webp + Storm-Baby.webp

(Chưa có): Shadow/, Prisma/, Draco/, Pumpkin/
```

---

*Cập nhật lần cuối: 24/04/2026 — đồng bộ với `PET_REGISTRY` (18 pet), chuẩn hóa toàn bộ sang WebP.*
