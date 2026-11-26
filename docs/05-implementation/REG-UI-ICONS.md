# REG-UI-ICONS — Danh mục & Hướng dẫn Bàn giao Tạo Bộ Icon UI (Thay thế Emoji)

> **Loại tài liệu:** Tài liệu sống (Living Document — Danh mục & Bàn giao Mỹ thuật/Frontend)
> **Chuẩn tham chiếu:** ISO/IEC/IEEE 12207 & 26514 · **Quy ước:** [DOCP-COWDI-v1.1](../00-general/DOCP-COWDI-v1.1.md)
> **Liên kết liên quan:** [STD-ART-STYLE-v1.1.md](art/STD-ART-STYLE-v1.1.md) · [art/palettes/cowdi_tokens.css](art/palettes/cowdi_tokens.css) · [REG-IMAGE-CATALOG.md](REG-IMAGE-CATALOG.md) · [GDE-PET-IMAGES-v1.0.md](GDE-PET-IMAGES-v1.0.md) · [LOG-PROGRESS.md](../01-project-management/LOG-PROGRESS.md) (`WS-5`, `RK-009`)
> **File Prompt Batch (Excel/Script):** [REG-UI-ICONS-PROMPTS.csv](REG-UI-ICONS-PROMPTS.csv)
> **Cập nhật lần cuối:** 2026-11-24 · **Trạng thái:** ⏳ Chưa bắt đầu (Sẵn sàng giao nhân sự)

---

## 0. Tóm tắt bàn giao nhanh (Quick Handoff cho nhân sự mới)

**Mục tiêu công việc:** Thay thế toàn bộ icon UI đang hiển thị bằng Emoji hệ điều hành / Twemoji CDN fallback sang một bộ icon `.webp` đồng bộ 100% theo phong cách mỹ thuật của Cowdi English.

### Người thực hiện làm đúng 4 bước sau
1. **Mở 3 ảnh mẫu chuẩn style** trong repo để làm ảnh tham chiếu (Image Reference / Style Reference cho AI):
   - `public/image/icon_pet/Attack.webp`
   - `public/image/icon_pet/HP.webp`
   - `public/image/icon_pet/Listening.webp`
2. **Tạo ảnh hàng loạt theo từng đợt** (ưu tiên làm xong **Đợt 1** trước, rồi **Đợt 2** phục vụ GĐ4 Đồ trang trí):
   - Mở file [REG-UI-ICONS-PROMPTS.csv](REG-UI-ICONS-PROMPTS.csv) (đã viết sẵn `subject_en` & `full_prompt_en` cho từng icon) hoặc copy trực tiếp từ các bảng bên dưới.
   - Tách nền sạch (transparent PNG), crop vừa khung vuông có lề 8–10%.
   - Nén và đặt tên **chính xác** theo cột `Mã file` vào thư mục `public/image/icons-ui/<ma_file>.webp` (kích thước `256×256` px, WebP lossless hoặc quality `90`, dung lượng mục tiêu `5–20 KB/icon`).
3. **Cập nhật trạng thái `[ ]` → `[x]`** ngay trong tài liệu này và trong [LOG-PROGRESS.md](../01-project-management/LOG-PROGRESS.md) (`WS-5`).
4. **Bàn giao cho Dev Frontend tích hợp** (mục §7 bên dưới): nâng cấp 1 điểm tập trung tại `src/components/Icon.jsx`, đồng thời sửa lỗi lệch icon Đá nguyên tố `🪨` / `💠` (`RK-009`).

---

## 1. Quy chuẩn Mỹ thuật & Master Prompt AI

### 1.1. Đặc tả Style chuẩn (khớp `public/image/icon_pet/*.webp`)
- **Đường viền ngoài**: Viền sticker đậm, mượt, bo tròn màu nâu-than tối (`#33262C` / `#3A3040`), độ dày đều bao quanh toàn bộ vật thể.
- **Đổ bóng & màu sắc**: 2D casual mobile game icon — cel-shaded kết hợp painterly mềm, màu tươi ấm, có điểm sáng highlight trắng hình oval bóng mượt (glossy specular) và vài tia sáng nhỏ nếu phù hợp.
- **Khung hình & nền**: Tỷ lệ **1:1** (`512×512` khi sinh ảnh → xuất `256×256` `.webp`), vật thể nằm chính giữa, lề an toàn `8–10%`, **nền trong suốt hoàn toàn**, **tuyệt đối không có chữ/số/watermark**, nhận diện rõ hình khối ở kích thước nhỏ `20–32px`.

### 1.2. Master Prompt (Copy-paste chạy hàng loạt)

**Positive Prompt:**
```text
2D mobile game UI icon of [SUBJECT], kawaii casual sticker art style matching cute pet RPG game, thick smooth dark charcoal-brown outer outline (#33262C), soft cel-shaded painterly coloring, glossy white specular highlights, warm vibrant pastel-rich palette, centered square composition with clean 10% margins, isolated on plain transparent background, no text, no letters, no watermark, crisp readable silhouette at small 24px icon size.
```

**Negative Prompt (nếu công cụ AI hỗ trợ):**
```text
text, letters, watermark, signature, realistic photo, 3d render, thin sketchy lines, messy background, square card frame, cropped edges, blurry, low contrast, dark muddy colors
```

---

## 2. Hiện trạng & Vấn đề cần xử lý

1. **8 icon WebP chuẩn đã có sẵn** tại `public/image/icon_pet/` (`Attack`, `Defense`, `HP`, `Speed`, `Listening`, `Speaking`, `Reading`, `Writing`) nhưng hiện **mới dùng trong `src/features/pet/CollectionPage.jsx`** — Dev cần nối dùng chung cho `PetPage`, `DuelPage`, `PracticePage`, `pets.js`.
2. **165 SVG vẽ tay phẳng** trong `src/components/Icon.jsx` đang map cho ~250 emoji khi đi qua `<Emoji>`/`<Icon>`, nhưng là vector phẳng (chưa có khối bóng như `icon_pet`).
3. **97 emoji UI/Pet/Shop/Admin chưa có trong `Icon.jsx`** (đang rơi về Twemoji CDN hoặc emoji thô theo OS).
4. **Lỗi lệch icon (`RK-009`)**: Tài nguyên **Đá nguyên tố (`stone`)** đang bị dùng lẫn 2 emoji:
   - `🪨` tại `shared/game-config.js`, `src/pages/AccountPage.jsx`, `src/features/pet/PetPage.jsx`
   - `💠` tại `src/features/pet/ShopPage.jsx`, `src/pages/LearningPathPage.jsx`, `src/features/lesson/LessonDetailPage.jsx`, `src/features/pet/HowToEarnSheet.jsx`
   - **Quyết định kỹ thuật**: Thống nhất về 1 icon duy nhất `res_stone.webp` (pha lê nguyên tố) và tách riêng `elem_earth.webp` (khối đá nâu hệ Thổ).

### Bảng theo dõi tiến độ tổng các đợt

| Đợt | Ưu tiên | Phạm vi | Số lượng | Trạng thái | Người phụ trách | Ghi chú |
|---|---|---|---:|:---:|---|---|
| **Đợt 1** | **P0 (Làm ngay)** | Kinh tế v2, HUD, Cửa hàng Giữ nhịp, 10 Hệ nguyên tố, Độ hiếm & UI thiếu | 34 | `[ ] 0/34` | — | Chặn thẩm mỹ HUD & Shop hiện tại |
| **Đợt 2** | **P1 (Cho GĐ4)** | 19 Nền, 15 Hào quang, 16 Mũ/Áo/Thức ăn/Quà | 50 | `[ ] 0/50` | — | Phục vụ trực tiếp GĐ4 Đồ trang trí |
| **Đợt 3** | **P2 (Đồng bộ)** | Nâng cấp icon UI từ SVG phẳng `Icon.jsx` sang WebP style `icon_pet` | ~45 | `[ ] 0/45` | — | Làm sau khi Đợt 1–2 xong |
| **Đợt 4** | **P3 (Nội bộ)** | Công cụ Admin (`PartPaintModal`, `PetMotionPage`, `AdminImageManager`) | ~22 | `[ ] 0/22` | — | Chỉ admin thấy, không gấp |

---

## 3. Đợt 1 — Ưu tiên cao nhất (P0 · 34 icon)

> **Thư mục đích:** `public/image/icons-ui/` · **Khuyến nghị làm đầu tiên** vì xuất hiện ngay trên thanh HUD (`BookShell`), Trang chủ, Lộ trình, Cửa hàng và Đấu trường.

### 3.1. Tiền tệ & Tài nguyên cốt lõi (5 icon)

| Xong | Mã file (`.webp`) | Emoji cũ | Tên / Ý nghĩa | Vị trí đang dùng | Mô tả vật thể (EN cho Prompt) |
|:---:|---|---|---|---|---|
| `[ ]` | `res_milk` | `🥛` (82 chỗ) | Sữa (tiền học tập) | `BookShell`, `ShopPage`, `HomePage`, `StreakTab`, `LearningPathPage`, `AccountPage`, `PetPage`, `DuelPage`, `LessonDetailPage`, `game-config.js` | `cute chubby glass milk bottle with sky-blue cap, creamy white milk inside, tiny playful cow spot label and a glossy milk drop` |
| `[ ]` | `res_gem` | `💎` (24 chỗ) | Gem (tiền cao cấp) | `BookShell`, `ShopPage`, `HomePage`, `LearningPathPage`, `LessonDetailPage`, `AccountPage`, `DuelPage` | `sparkling faceted cyan-aqua diamond gemstone with bright white specular shine and tiny golden sparkles` |
| `[ ]` | `res_stone` | `🪨` / `💠` | Đá nguyên tố (thống nhất `RK-009`) | `ShopPage`, `LearningPathPage`, `LessonDetailPage`, `HowToEarnSheet`, `AccountPage`, `PetPage`, `game-config.js` | `glowing mystical elemental evolution crystal stone, iridescent blue-violet faceted gem embedded in smooth dark stone base with glowing rune glow` |
| `[ ]` | `res_stone_shard` | `🧩` | Mảnh đá nguyên tố (10 mảnh = 1 đá) | `game-config.js`, `AccountPage` | `small glowing blue-violet crystal shard fragment broken from an elemental evolution stone, sparkling magical dust` |
| `[ ]` | `res_coin` | `🪙` | Xu thưởng mini-game | `MiniGamePage`, `PracticePage` | `shiny chunky golden game coin with an embossed five-pointed star in the center` |

### 3.2. Cửa hàng Giữ nhịp & Tab Cửa hàng (8 icon)

| Xong | Mã file (`.webp`) | Emoji cũ | Tên / Ý nghĩa | Vị trí đang dùng | Mô tả vật thể (EN cho Prompt) |
|:---:|---|---|---|---|---|
| `[ ]` | `shop_freeze_scarf` | `🧣` | Khăn giữ lửa (Streak Freeze) | `StreakTab.jsx` | `cozy warm knitted red-and-orange scarf wrapped neatly with a cute little golden flame emblem` |
| `[ ]` | `shop_return_ticket` | `🔁` | Vé quay lại (khôi phục streak) | `StreakTab.jsx` | `golden-emerald admission ticket with notched edges and a glowing curved rewind arrow emblem` |
| `[ ]` | `shop_contract` | `📜` | Khế ước 7 ngày | `StreakTab.jsx`, `ContractSelectSheet.jsx` | `rolled cream parchment scroll tied with a bright red ribbon and a golden star wax seal` |
| `[ ]` | `shop_study_clock` | `⏰` | Đồng hồ Cowdi nhắc học | `StreakTab.jsx` | `cute round red-and-gold twin-bell alarm clock with friendly clock face and ringing motion lines` |
| `[ ]` | `tab_streak` | `🔥` | Tab Giữ nhịp / Chuỗi ngày học | `ShopPage`, `BookShell`, `HomePage`, `AccountPage` | `vibrant warm orange-and-golden campfire flame with bright yellow inner core` |
| `[ ]` | `tab_cosmetics` | `✨` | Tab Trang trí / Hào quang | `ShopPage`, `CosmeticsTab`, `HomePage`, `AccountPage` | `cluster of three glossy four-pointed magic sparkles in golden yellow and lavender purple` |
| `[ ]` | `tab_inventory` | `🎒` | Tab Kho đồ / Ba lô | `ShopPage`, `InventoryTab`, `AccountPage`, `HomePage` | `cute chubby adventurer backpack in warm teal and tan leather straps with shiny gold buckle` |
| `[ ]` | `tab_background` | `🖼️` | Tab Nền phòng (Cosmetics) | `CosmeticsTab`, `AdminImageManager` | `wooden picture frame holding a cheerful miniature landscape painting of green hills and sunny blue sky` |

### 3.3. Bộ 10 Hệ Nguyên tố Pet (10 icon)

> Dùng đồng bộ tại `DuelPage.jsx`, `CosmeticsTab.jsx`, `CollectionPage.jsx`, `PetPage.jsx`, `Icon.jsx` (`ELEMENT_ICON`).

| Xong | Mã file (`.webp`) | Emoji cũ | Hệ | Mô tả vật thể (EN cho Prompt) |
|:---:|---|---|---|---|
| `[ ]` | `elem_metal` | `⚙️` / `🧲` | Hệ Kim | `gleaming silver steel gear emblem with metallic blue sheen and tiny shine glints` |
| `[ ]` | `elem_wood` | `🌿` | Hệ Mộc | `fresh vibrant green leaf sprout with two lush curved leaves and morning dewdrop` |
| `[ ]` | `elem_water` | `💧` | Hệ Thủy | `glossy translucent sky-blue water droplet with curved white highlight and tiny splash` |
| `[ ]` | `elem_fire` | `🔥` | Hệ Hỏa | `fierce cute swirling crimson-orange fire elemental flame emblem` |
| `[ ]` | `elem_earth` | `🪨` | Hệ Thổ | `chunky stylized warm-brown mountain boulder rock with golden amber mineral veins` |
| `[ ]` | `elem_dark` | `🌑` | Hệ Ám | `mystical deep indigo-purple crescent moon surrounded by dark violet shadow wisps` |
| `[ ]` | `elem_light` | `✨` / `☀️` | Hệ Quang | `radiant golden sun emblem with soft warm halo and crisp triangular sunbeams` |
| `[ ]` | `elem_neutral` | `⚪` | Hệ Vô | `smooth pearlescent ivory-white orb sphere with gentle silver ring glow` |
| `[ ]` | `elem_wind` | `🌪️` | Hệ Phong | `swirling mint-teal and white wind cyclone spiral with floating breeze ribbons` |
| `[ ]` | `elem_thunder` | `⚡` | Hệ Lôi | `bold jagged golden-yellow lightning bolt crackling with bright cyan electric sparks` |

### 3.4. UI bổ trợ & 6 Huy hiệu Độ hiếm (11 icon)

| Xong | Mã file (`.webp`) | Emoji cũ | Ý nghĩa | Vị trí đang dùng | Mô tả vật thể (EN cho Prompt) |
|:---:|---|---|---|---|---|
| `[ ]` | `flag_vn` | `🇻🇳` | Cờ Việt Nam (Xem dịch / TV) | `LessonDetailPage`, `PracticePage`, `LessonsPage` | `glossy rounded badge of the red Vietnam flag with bright golden five-pointed star` |
| `[ ]` | `flag_uk` | `🇬🇧` | Cờ Anh (English / Đọc to) | `PracticePage`, `LessonsPage` | `glossy rounded badge of the United Kingdom Union Jack flag` |
| `[ ]` | `status_medicine` | `💊` | Pet ốm / Cần chăm sóc | `HomePage.jsx` | `cute glossy red-and-white medicine capsule pill tilted diagonally with tiny sparkle` |
| `[ ]` | `ui_folder_tabs` | `🗂️` | Phân loại / Thư mục bài | `LessonsPage`, `AdminImageManager` | `tidy pastel-yellow card index folder box with colorful blue, green, and coral divider tabs` |
| `[ ]` | `ui_sort` | `↕` | Sắp xếp danh sách | `LessonsPage` | `paired chunky sky-blue up and down sorting arrows side by side` |
| `[ ]` | `rarity_common` | `⚪` | Độ hiếm: Thường | `CosmeticsTab` | `smooth glossy pearl-silver round rarity gem orb` |
| `[ ]` | `rarity_rare` | `🔵` | Độ hiếm: Hiếm | `CosmeticsTab` | `glossy sapphire sky-blue round rarity gem orb with crisp shine` |
| `[ ]` | `rarity_epic` | `🟣` | Độ hiếm: Sử thi | `CosmeticsTab` | `glossy royal amethyst purple round rarity gem orb with small star glint` |
| `[ ]` | `rarity_legendary` | `🟡` | Độ hiếm: Huyền thoại | `CosmeticsTab` | `radiant golden amber round rarity gem orb with twin four-point sparkles` |
| `[ ]` | `rarity_milestone` | `🟢` | Độ hiếm: Mốc học | `CosmeticsTab` | `glossy emerald green round rarity gem orb with fresh leaf-like shine` |
| `[ ]` | `rarity_season` | `🟠` | Độ hiếm: Mùa | `CosmeticsTab` | `glossy warm tangerine orange round rarity gem orb with sunny glow` |

*(Ghi chú: 3 số bước `1️⃣ 2️⃣ 3️⃣` ở `ReviewPage.jsx` khuyến nghị thay bằng badge CSS tròn đánh số 1–2–3 cho sắc nét thay vì tạo ảnh.)*

---

## 4. Đợt 2 — Vật phẩm Cửa hàng & Trang trí Pet (P1 · 50 icon · Phục vụ GĐ4)

> **Thư mục đích:** `public/image/icons-ui/cosmetics/` (hoặc `public/image/icons-ui/` cùng prefix `bg_`, `aur_`, `hat_`, `outfit_`, `food_`, `gift_`).
> Nguồn: `src/features/pet/CosmeticsTab.jsx` & `SHOP_ITEMS` trong `src/data/pets.js` (đã gộp các món trùng giữa v1 và v2).

### 4.1. 19 Nền phòng (`bg_*`)

| Xong | Mã file | Emoji cũ | Tên hiển thị | Mô tả vật thể (EN cho Prompt) |
|:---:|---|---|---|---|
| `[ ]` | `bg_forest` | `🌲` | Rừng xanh | `miniature diorama icon of lush green pine trees on a grassy hill` |
| `[ ]` | `bg_beach` | `🏖️` | Bãi biển | `miniature sunny tropical beach icon with red-white umbrella, palm tree, golden sand and turquoise wave` |
| `[ ]` | `bg_space` | `🚀` | Vũ trụ | `miniature outer space icon with ringed pastel planet, tiny red-white rocket and starry indigo cloud` |
| `[ ]` | `bg_volcano` | `🌋` | Núi lửa | `cute stylized dark-brown volcano icon erupting glowing orange-red lava plume` |
| `[ ]` | `bg_ocean` | `🌊` | Đáy biển | `curling turquoise ocean wave icon with pink coral branch and rising water bubbles` |
| `[ ]` | `bg_bamboo` | `🎋` | Rừng trúc | `bundle of lush green bamboo stalks with delicate bamboo leaves` |
| `[ ]` | `bg_goldmine` | `⚙️` | Mỏ vàng | `wooden mine cart overflowing with gleaming golden nuggets and glowing lantern` |
| `[ ]` | `bg_cave` | `🪨` | Hang đá | `rocky cavern archway with glowing cyan crystals sprouting inside` |
| `[ ]` | `bg_temple` | `☀️` | Đền ánh sáng | `white marble sun temple gate with golden roof radiating warm light rays` |
| `[ ]` | `bg_nightforest` | `🌑` | Rừng đêm | `enchanted midnight forest silhouettes of pine trees beneath a glowing crescent moon` |
| `[ ]` | `bg_cloudpeak` | `🌪️` | Đỉnh mây | `tall serene mountain peak rising above fluffy white clouds with gentle wind swirl` |
| `[ ]` | `bg_stormcloud` | `⚡` | Mây giông | `puffy dark-purple thundercloud icon striking a bright golden lightning bolt` |
| `[ ]` | `bg_arena` | `🥋` | Võ đài | `miniature wooden martial arts dojo arena platform with red pillars and golden gong` |
| `[ ]` | `bg_castle` | `🏰` | Lâu đài cổ tích | `fairytale white stone castle with pastel-blue spires and tiny red pennant flags` |
| `[ ]` | `bg_sakura` | `🌸` | Vườn anh đào | `blooming cherry blossom branch with soft pink sakura flowers and falling petals` |
| `[ ]` | `bg_aurora` | `🌌` | Cực quang Bắc cực | `snowy mountain peaks beneath shimmering emerald-and-violet northern lights aurora ribbons` |
| `[ ]` | `bg_heaven` | `☁️` | Thiên đình | `ornate golden celestial gate resting atop fluffy glowing white clouds` |
| `[ ]` | `bg_study` | `📚` | Phòng học / Thư viện *(chung `room_library`)* | `neat stack of colorful hardcover study books with a warm glowing desk lamp` |
| `[ ]` | `bg_floatingmarket` | `🛶` | Chợ nổi miền Tây | `traditional Vietnamese wooden sampan boat filled with colorful tropical fruits on blue river ripples` |

### 4.2. 15 Hào quang / Hiệu ứng (`aur_*`)

| Xong | Mã file | Emoji cũ | Tên hiển thị | Mô tả vật thể (EN cho Prompt) |
|:---:|---|---|---|---|
| `[ ]` | `aur_leaves` | `🍃` | Lá rơi | `swirling ring of fresh green leaves floating gently in the breeze` |
| `[ ]` | `aur_bubbles` | `🫧` | Bong bóng nước | `cluster of translucent iridescent soap bubbles with rainbow highlights` |
| `[ ]` | `aur_snow` | `❄️` | Tuyết rơi | `intricate glossy ice-blue crystal snowflake surrounded by tiny snow dots` |
| `[ ]` | `aur_stars` | `✨` | Sao sáng | `circular halo of twinkling golden stars and pastel sparkles` |
| `[ ]` | `aur_flame` | `🔥` | Ngọn lửa | `blazing circular aura ring of vibrant orange-and-gold flames` |
| `[ ]` | `aur_sakura` | `🌸` | Cánh hoa anh đào | `graceful swirl of soft pink cherry blossom petals floating in a circle` |
| `[ ]` | `aur_firefly` | `🪲` | Đom đóm | `cute little chibi firefly with glowing golden lantern tail and floating light motes` |
| `[ ]` | `aur_dragon` | `🐉` | Rồng vàng | `coiled chibi golden eastern dragon holding a glowing pearl` |
| `[ ]` | `aur_galaxy` | `🌀` | Thiên hà xoay | `swirling violet-and-teal spiral galaxy vortex filled with bright stardust` |
| `[ ]` | `aur_streakfire` | `🔥` | Lửa streak | `legendary tri-color flame aura blending orange, electric blue, and violet fire` |
| `[ ]` | `aur_soundwave` | `🎧` | Sóng âm (kỹ năng Nghe) | `cute purple studio headphones emitting golden curved sound wave arcs` |
| `[ ]` | `aur_musicnotes` | `🎵` | Nốt nhạc (kỹ năng Nói) | `pair of glowing coral-pink and golden musical eighth notes with sparkles` |
| `[ ]` | `aur_letters` | `🔤` | Chữ bay (kỹ năng Đọc) | `playful floating golden and blue ABC alphabet blocks swirling with magic sparkles` |
| `[ ]` | `aur_ink` | `🖋️` | Mực vẽ (kỹ năng Viết) | `ornate golden fountain pen nib trailing a graceful swirl of royal-blue ink droplets` |
| `[ ]` | `aur_almighty` | `🌈` | Toàn năng (4 kỹ năng) | `radiant rainbow halo ring crowned with four glowing golden stars` |

### 4.3. Trang phục, Mũ, Thức ăn & Quà (`SHOP_ITEMS` cũ còn trong Kho đồ · 16 icon)

> *Lưu ý theo quyết định `D12`: shop đã bỏ bán 5 đồ ăn & `gift_egg` mới, nhưng kho đồ người chơi cũ vẫn giữ mũ/áo đã mua nên ưu tiên vẽ 6 mũ + 5 áo trước; 5 món ăn/quà có thể để sau.*

| Xong | Mã file | Emoji cũ | Tên vật phẩm | Mô tả vật thể (EN cho Prompt) |
|:---:|---|---|---|---|
| `[ ]` | `hat_graduation` | `🎓` | Mũ tốt nghiệp | `navy-blue square academic graduation cap with hanging golden tassel` |
| `[ ]` | `hat_crown` | `👑` | Vương miện | `shiny royal golden crown studded with ruby red and sapphire blue jewels` |
| `[ ]` | `hat_cowboy` | `🤠` | Nón cao bồi | `classic warm-brown leather cowboy hat with golden star hatband` |
| `[ ]` | `hat_wizard` | `🧙` | Mũ phù thủy | `pointed midnight-purple wizard hat decorated with golden stars and crescent moon` |
| `[ ]` | `hat_santa` | `🎅` | Mũ Noel | `festive bright red Santa Claus hat with fluffy white fur trim and pom-pom` |
| `[ ]` | `hat_party` | `🥳` | Mũ tiệc | `colorful striped cone birthday party hat with pom-pom and floating confetti` |
| `[ ]` | `outfit_hero` | `🦸` | Áo siêu nhân | `billowing crimson superhero cape fastened with a golden lightning bolt clasp` |
| `[ ]` | `outfit_explorer` | `🧭` | Áo thám hiểm | `khaki adventure explorer vest with pockets and a shiny brass compass` |
| `[ ]` | `outfit_wizard` | `🔮` | Áo phù thủy | `starry violet wizard robe with glowing crystal orb emblem` |
| `[ ]` | `outfit_sport` | `⚽` | Áo thể thao | `vibrant blue-and-white athletic jersey shirt with tiny soccer ball badge` |
| `[ ]` | `outfit_star` | `⭐` | Áo ngôi sao | `cozy pastel-yellow hoodie sweater featuring a big glowing golden star on the chest` |
| `[ ]` | `food_pizza` | `🍕` | Pizza XP *(legacy)* | `appetizing gooey cheese pepperoni pizza slice with glossy highlights` |
| `[ ]` | `food_cake` | `🎂` | Bánh sinh nhật *(legacy)* | `cute frosted strawberry birthday cake with colorful sprinkles and a lit candle` |
| `[ ]` | `food_apple` | `🍎` | Táo thần *(legacy)* | `glossy ruby-red enchanted apple with crisp green leaf and tiny magic sparkle` |
| `[ ]` | `food_book` | `📖` | Sách phép *(legacy)* | `open purple spellbook radiating warm golden magic light from its pages` |
| `[ ]` | `gift_egg` | `🎁` | Hộp trứng quà *(legacy)* | `wrapped pink gift box with golden ribbon and a cute spotted Cowdi egg peeking out` |

*(Ghi chú: `food_milk` dùng chung `res_milk.webp`.)*

---

## 5. Đợt 3 & Đợt 4 — Nâng cấp đồng bộ & Công cụ Admin (P2 / P3)

### 5.1. Đợt 3 — Nâng cấp SVG phẳng trong `Icon.jsx` sang WebP đồng bộ (P2 · Tùy chọn)
- **Đã có sẵn 8 icon chuẩn ở `public/image/icon_pet/`**: `Attack`, `Defense`, `HP`, `Speed`, `Listening`, `Speaking`, `Reading`, `Writing` → Dev chỉ cần tái sử dụng thay cho SVG phẳng `swords`, `heart`, `ear`, `speak`, `book`, `pencil`!
- **Điều hướng `BookShell` (15 icon cần vẽ lại nếu muốn đồng bộ 100%)**: `road`, `target`, `map`, `book`, `gamepad`, `redbook`, `home`, `ranking`, `user`, `bag`, `gift`, `medal`, `flag`, `sound`, `mute`, `dumbbell`, `wrench`, `brain`, `chart`.
- **Xếp hạng, Mini-game, Bài học & Thành tích (~28 icon)**: `gold`, `silver`, `bronze`, `crown`, `trophy`, `star`, `paw`, `dice`, `box`, `calendar`, `info`, `note`, `headphones`, `mic`, `link`, `abc`, `puzzle`, `music`, `check`, `x`, `search`, `bricks`, `chat`, `megaphone`, `hundred`, `party`, `cards`, `bee`, `keyboard`, `sprout`, `tree`, `clover`, `grad`, `briefcase`, `lock`, `hourglass`, `egg`, `pumpkin`, `christmas`, `lotus`, `bulb`, `muscle`, `thumb`, `refresh`, `cloud`, `sleep`, `smile`, `question`, `warning`.

### 5.2. Đợt 4 — Công cụ Admin nội bộ (P3 · Không gấp · ~22 icon)
- `src/admin/pet-motion/PartPaintModal.jsx` (16): `🖌️ 🧽 🪣 💉 ➰ 🪄 📏 💾 🎨 📚 📋 👁️ 🙈 🔒 🔓 👻`
- `src/admin/pet-motion/PetMotionPage.jsx` & `StudyPreviewTab.jsx`: `📐 🧪 🦴 🎬 ⚙️ 🗑 💢 ❤️‍🔥 ⏩ 🌅 ◀ ▶ ✎ ↗`
- `src/features/admin/AdminImageManager.jsx`: `🖼️ 📂 🗂️` (13 chủ đề từ vựng đã có sẵn ở `public/image/icon/`).

---

## 6. Danh sách KHÔNG CẦN tạo Icon (giữ nguyên Emoji)

| Khu vực | Lý do giữ nguyên |
|---|---|
| `index.html`, `src/sw.js`, `server/jobs/*.js`, `server/routes/api.js`, `server/index.js` | Thông báo đẩy OS (Web Push), `<title>`, thẻ meta OpenGraph và log terminal bắt buộc dùng ký tự Unicode thuần. |
| `src/data/pets.js` (`PET_REGISTRY.*.emoji` & `chatMessages`) | 23 loài pet đã có ảnh nhân vật/rig thật ở `public/pets/`; emoji chỉ là fallback text & biểu cảm câu thoại. |
| `src/data/vocab/*.js` (801 emoji) & `src/data/lessons/*.js` (621 emoji) | Hình minh họa gắn theo từng từ vựng/câu ví dụ (đã có `<Emoji>` render Twemoji sticker); 13 chủ đề & 57 subtopic lớn đã có ảnh `.webp` riêng trong `public/image/`. |
| `src/pet-rig/PetRig.js` (`♪`) | Ký tự vẽ trực tiếp bằng `ctx.fillText` trên Canvas khi pet ngủ/hát. |

---

## 7. Checklist tích hợp cho Dev Frontend (sau khi nhận đủ ảnh Đợt 1)

- [ ] Kiểm tra toàn bộ file `.webp` đặt trong `public/image/icons-ui/` đúng tên chuẩn chữ thường + gạch dưới (tương thích Linux server).
- [ ] Nâng cấp `src/components/Icon.jsx`: thêm bảng `WEBP_ICONS` trỏ tới `/image/icons-ui/<name>.webp` và 8 ảnh có sẵn `/image/icon_pet/*.webp`; giữ fallback về SVG cũ nếu file chưa có.
- [ ] Cập nhật `EMOJI_ICON` trong `src/components/Icon.jsx` để map thêm các emoji mới (`🥛`, `💠`, `🧣`, `🎒`, `🖼️`, `⚙️`, `🌑`, `🌪️`, `🇻🇳`, `🇬🇧`, `💊`, `🗂️`, `🔵`, `🟣`, `🟠`…).
- [ ] Thay toàn bộ Emoji thô bằng `<Icon name="..." />` tại các file:
  - `src/components/layout/BookShell.jsx` (`🥛`, `💎`)
  - `src/features/pet/ShopPage.jsx`, `StreakTab.jsx`, `CosmeticsTab.jsx`, `InventoryTab.jsx`, `HowToEarnSheet.jsx`, `ContractSelectSheet.jsx`, `ItemDetailSheet.jsx`, `PetPage.jsx`
  - `src/pages/HomePage.jsx`, `LearningPathPage.jsx`, `AccountPage.jsx`, `LessonsPage.jsx`
  - `src/features/duel/DuelPage.jsx`, `src/features/lesson/LessonDetailPage.jsx`, `src/features/invite/InviteSheet.jsx`
- [ ] Thống nhất `stone` (`🪨` và `💠`) về chung 1 icon `res_stone` (`RK-009`), đóng `RK-009` trong `LOG-PROGRESS.md`.
- [ ] Chạy `npm test` + `npm run build` và chụp ảnh kiểm tra trên mobile + desktop (`20px–32px`).
