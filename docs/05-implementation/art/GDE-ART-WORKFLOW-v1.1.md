# GDE-ART-WORKFLOW v1.1 — Hướng dẫn Sử dụng Bộ chuẩn Mỹ thuật & Art Kit Cowdi English

| Mục | Giá trị |
|---|---|
| **Mã tài liệu** | `GDE-ART-WORKFLOW` |
| **Phiên bản** | `1.1` · **Ngày ban hành:** `2026-11-24` |
| **Trạng thái** | `Approved` |
| **Chuẩn tham chiếu** | ISO/IEC/IEEE 26514 (User Documentation) · Quy chuẩn gốc: [STD-ART-STYLE-v1.1.md](STD-ART-STYLE-v1.1.md) |
| **Đối tượng sử dụng** | Product Owner (Sonny), Họa sĩ 2D, Người vận hành AI tạo ảnh, Lập trình viên Frontend/Rig |

## Lịch sử sửa đổi

| Phiên bản | Ngày | Nội dung | Người sửa |
|---|---|---|---|
| 1.1 | 2026-11-24 | Soạn hướng dẫn thực hành từng bước theo 5 vai trò/tình huống cho `cowdi-art-kit v1.1` | Sonny + AI |

---

## 1. Chọn đúng luồng việc bạn đang cần

| Bạn đang muốn làm gì? | Nhảy thẳng tới mục |
|---|---|
| Tạo ảnh Pet / Biểu cảm / Comic bằng công cụ AI (Gemini, ChatGPT, Midjourney…) | [§2. Luồng tạo ảnh bằng AI](#2-luồng-tạo-ảnh-bằng-ai-prompt--hậu-kỳ) |
| Vẽ mới hoặc hoàn thiện vector trong Illustrator / Photoshop / Inkscape / Krita | [§3. Luồng họa sĩ vẽ & tách 13 layer PetRig](#3-luồng-họa-sĩ-vẽ--tách-13-layer-petrig) |
| Kiểm tra tự động (QC) & khóa màu trước khi duyệt ảnh | [§4. Chạy công cụ QC tự động & Khóa màu](#4-chạy-công-cụ-qc-tự-động--khóa-màu) |
| Đưa ảnh đã đạt chuẩn vào ứng dụng Cowdi (`.webp` tĩnh hoặc `/admin/pet-motion`) | [§5. Nén WebP & Đưa ảnh vào ứng dụng](#5-nén-webp--đưa-ảnh-vào-ứng-dụng) |
| Dev lấy đúng màu 10 hệ nguyên tố & token thương hiệu cho giao diện Web | [§6. Dùng 55 Token màu cho Frontend / CSS](#6-dùng-55-token-màu-cho-frontend--css) |
| Thêm một loài Pet mới (vd: Nấm Rơm, Pet giới hạn GĐ7) vào bộ chuẩn | [§7. Cách mở rộng bộ chuẩn khi thêm Pet mới](#7-cách-mở-rộng-bộ-chuẩn-khi-thêm-pet-mới) |

---

## 2. Luồng tạo ảnh bằng AI (Prompt → Hậu kỳ)

### Bước 1 — Chuẩn bị ảnh tham chiếu
- Chọn **2–3 sprite đã PASS QC** làm *Style Reference*: `Bamboo`, `Ricy (paddy)`, `Củ Cải (radish)`.
- Nếu vẽ biến thể (tiến hóa, biểu cảm, cầm đạo cụ) của pet đã có: đính thêm **sprite C3 gốc** của đúng pet đó làm *Character Reference*.

### Bước 2 — Ghép Prompt đúng công thức
Mở [prompts/AI_PROMPT_BLOCKS.md](prompts/AI_PROMPT_BLOCKS.md) và ghép **nguyên văn** 4 khối (không tự viết lại):

```text
[STYLE BLOCK]
+ [CHARACTER DNA của nhân vật]
+ [MẪU CỤ THỂ: A / B / C / D / E]
+ [NEGATIVE BLOCK]
```

| Mục đích | Chọn mẫu | Lưu ý bắt buộc |
|---|---|---|
| Thiết kế loài pet mới (bản chuẩn C3) | **Mẫu A** | Điền `{species}`, hình khối thân, vương miện/chỏm, 1 dấu ấn đặc trưng, 2 tính từ tính cách |
| Bảng tiến hóa 5 cấp (`Seed` → `Legendary`) | **Mẫu B** | Cấp 1 **trứng/mầm có mắt (`Q4`)**; C5 to hơn ~30%, vẫn dễ thương & hiền |
| Sinh biểu cảm (`E01–E11`) | **Mẫu C** | Thay câu mô tả mặt trong `STYLE BLOCK` bằng dòng biểu cảm tương ứng trong bảng 12 biểu cảm |
| Tư thế hành động / cầm 1 đạo cụ | **Mẫu D** | Đạo cụ phải có viền đen `#000000` + cel-shade phẳng, **không che mắt hay má hồng** |
| Khung truyện tranh / cảnh minh họa Starter | **Mẫu E** | Giữ tỉ lệ chiều cao tương đối (`Cowdi 100%`, `Củ Cải 98%`, `Ricy 90%`, `Bamboo 89%`, `Bé Bột 61%`); bóng thoại **để trống không chữ** |
| Sửa lỗi ảnh AI vừa tạo | **Mẫu F** | **Mỗi lượt chỉ sửa đúng 1 chi tiết, tối đa 3 lượt** — quá 3 lượt thì vẽ lại/chỉnh tay |

### Bước 3 — Hậu kỳ bắt buộc trước khi nộp Tầng A
1. Tách nền trắng thành **nền trong suốt** sạch (không viền halo trắng).
2. Soi màu lạc bằng `palette_lock.py` (xem §4.2) để thấy các vùng màu AI pha sai.
3. Mở file trong phần mềm đồ họa, **xóa mắt/má do AI vẽ** và kéo đúng `face_kit/face_kit_c{1-5}_{round|narrow}.svg` vào vị trí `45–55%` chiều cao thân.
4. Căn tâm nhân vật vào `x = 540`, đáy bóng đất vào `baseline y = 800`, thay bóng đất bằng `ground_shadow/ground_shadow_c{1-5}.svg` (`#A297AB`).

---

## 3. Luồng họa sĩ vẽ & tách 13 layer `PetRig`

### Bước 1 — Mở khung vẽ & nạp bảng màu
1. Mở file master **[templates/canvas_2160_template.svg](templates/canvas_2160_template.svg)** (`2160 × 2160 px`, gấp 2 lần kích thước xuất `1080 px`).
2. Nạp bảng 55 màu chuẩn:
   - **Illustrator / Photoshop:** `Swatches → Open Swatch Library →` [palettes/cowdi_palette.ase](palettes/cowdi_palette.ase).
   - **Inkscape / Krita / GIMP:** nạp [palettes/cowdi_palette.gpl](palettes/cowdi_palette.gpl).

### Bước 2 — Vẽ đúng thông số trên 13 layer có sẵn
- **Đường nét (`#000000`, `round` cap/join):**
  - Nét bao ngoài & cấu trúc lớn: **`12 px`** (@2160) → xuất 1080 sẽ thành `6 px`.
  - Nét chi tiết (gân lá, nếp bánh, miệng, mày): **`8 px`** (@2160) → xuất 1080 sẽ thành `4 px`.
- **Tô màu & đổ bóng:**
  - Dùng đúng swatch `base` và `shade` (đúng **1 tông** cel-shade hình lưỡi liềm cạnh trái-dưới chiếm `10–20%`, hướng sáng từ **trên-phải**). **Cấm gradient / bóng mềm.**
  - Vùng màu trắng luôn đổ bóng bằng **`#C2B8CA`**.
- **Gắn bộ mặt chuẩn:**
  - Thân tròn (Cowdi, Bé Bột, Củ Cải…): kéo `face_kit/face_kit_c{1-5}_round.svg`.
  - Thân hẹp (Bamboo, Ricy…): kéo `face_kit/face_kit_c{1-5}_narrow.svg`.
  - Đặt lớp `eye_0_open` vào layer `eye_0`, lớp `eye_1_closed` vào layer `eye_1`.
  - Biểu cảm `E01–E11`: lấy miệng/mày/mắt cung từ [face_kit/expression_parts.svg](face_kit/expression_parts.svg).
- **Đặt đúng 13 layer theo thứ tự từ dưới lên trên:**
  `aura` → `shadow_ground` → `arm_l` → `body` → `head` → `crown` → `eye_0` → `eye_1` → `mouth_*` → `arm_r` → `prop_*` → `fx` → `pivot_*`.

### Bước 3 — Xuất file kiểm duyệt
1. **Ẩn layer `GUIDES (hide before export)`** và `pivot_*`.
2. Xuất PNG nền trong suốt kích thước **`1080 × 1080 px`** (có khử răng cưa — anti-aliasing).
3. Đặt tên file nguồn chuẩn:
   ```text
   cowdi_{petId}_c{1-5}_{pose}_{E-code}_v{NN}.png
   # Ví dụ: cowdi_radish_c3_idle_E00_v01.png
   ```

---

## 4. Chạy công cụ QC tự động & Khóa màu

### Cài đặt môi trường Python (chỉ cần chạy 1 lần trên máy)
```bash
python3 -m pip install pillow numpy scipy
```

### 4.1. Kiểm duyệt tự động (`qc_check.py`)
Chạy lệnh từ thư mục gốc repo:
```bash
python3 docs/05-implementation/art/tools/qc_check.py <duong_dan_anh_1080.png> --char <petId> --stage <c1|c2|c3|c4|c5>
```
*Ví dụ:*
```bash
python3 docs/05-implementation/art/tools/qc_check.py cowdi_radish_c3_idle_E00_v01.png --char radish --stage c3
```

**Đọc kết quả & cách sửa lỗi thường gặp:**

| Dòng báo FAIL | Nguyên nhân | Cách khắc phục nhanh |
|---|---|---|
| `Canvas 1080x1080` | Ảnh không đúng `1080×1080` | Resize/xuất lại đúng `1080×1080` (giữ tỉ lệ 1:1) |
| `Flat areas use palette colors (<= 2% off)` | Có màu pha sai hoặc gradient | Chạy `palette_lock.py` để soi vùng lạc màu rồi tô lại phẳng bằng swatch |
| `Outline is black, not brown` | Viền bị ngả nâu hoặc xám | Đổi toàn bộ nét bao ngoài sang `#000000` |
| `Ground shadow #A297AB present/width` | Thiếu bóng đất, sai màu (`#D3BFD8`…) hoặc sai cỡ cấp | Kéo đúng `ground_shadow/ground_shadow_c{1-5}.svg` |
| `Center axis x=540 (+-10)` | Nhân vật lệch trái/phải | Căn tâm bóng đất & nhân vật về `x = 540` |
| `Baseline (shadow bottom ~ y=800+h/2, +-15)` | Đứng quá cao hoặc quá thấp | Dời toàn bộ nhân vật + bóng đất về tâm `y = 800` |
| `Inside safe area` / `Height near cX target` | Tràn khỏi `[160, 160, 920, 880]` hoặc sai chiều cao cấp | Thu phóng theo vạch xanh `C1–C5 top` trong template |

### 4.2. Soi & khóa màu hậu kỳ AI (`palette_lock.py`)
```bash
# Theo bảng màu nhân vật đã khai báo trong art-spec.json
python3 docs/05-implementation/art/tools/palette_lock.py ai_raw.png ai_locked.png --char ginseng

# Hoặc truyền thêm mã hex tùy chọn cho pet mới chưa có trong art-spec.json
python3 docs/05-implementation/art/tools/palette_lock.py ai_raw.png ai_locked.png --colors FFFFFF C2B8CA C49A6C 916E4A
```
> [!WARNING]
> `palette_lock.py` ép từng pixel về màu gần nhất nên **cạnh sẽ bị răng cưa**. Chỉ dùng ảnh `ai_locked.png` để đối chiếu màu lạc và đồ lại vector; bản xuất cuối cùng vào game phải xuất từ vector có khử răng cưa.

### 4.3. Duyệt tay bắt buộc sau khi `AUTO-QC: PASS`
- [ ] Thu nhỏ còn **`48 × 48 px`**: vẫn nhận rõ loài pet, không bết nét.
- [ ] Bóng cel-shade đúng hướng sáng trên-phải, chiếm `10–20%`, không loang/gradient.
- [ ] Biểu cảm hiền hòa, phù hợp trẻ 4–12 tuổi (không răng nanh, mắt đỏ, mặt dữ).

---

## 5. Nén WebP & Đưa ảnh vào ứng dụng

### Trường hợp A — Ảnh Pet tĩnh (`public/assets/images/pets/`)
1. Xuất phiên bản `512 × 512 px` (C1–C3) hoặc `640 × 640 px` (C4–C5) nền trong suốt, lưu vào thư mục tương ứng theo [GDE-PET-IMAGES-v1.0.md](../GDE-PET-IMAGES-v1.0.md) (pet mới dùng `{TenPet}_{Egg|Baby|Junior|Super|Legendary}.webp`).
2. Nén sang `.webp` (≤ 50 KB/file, giữ lại file PNG nguồn trong kho mỹ thuật):
   ```bash
   node scripts/convert-png-to-webp.mjs --keep
   ```
3. Khai báo/kiểm tra đường dẫn trong `src/data/pets.js` và chạy `npm run build`.

### Trường hợp B — Ảnh tách lớp động tác (`/admin/pet-motion`)
1. Xuất từng layer (`body.png`, `head.png`, `crown.png`, `armL.png`, `armR.png`, `eye0.png`, `eye1.png`, `fx.png`, `aura.png`) từ `canvas_2160_template.svg`.
2. Mở `/admin/pet-motion`, tải ảnh bộ phận lên, sắp thứ tự `z`, bấm **Duyệt bộ phận** → kiểm tra tại tab **Xem trước khi học** (chi tiết xem [HUONG-DAN-CHINH-DONG-TAC-PET.md](../../HUONG-DAN-CHINH-DONG-TAC-PET.md)).

---

## 6. Dùng 55 Token màu cho Frontend / CSS

- Toàn bộ CSS custom properties nằm tại **[palettes/cowdi_tokens.css](palettes/cowdi_tokens.css)** (tiền tố `--cowdi-*`), gồm 7 màu hệ thống, 28 màu nhân vật và 20 màu 10 hệ nguyên tố.
- Ví dụ dùng cho huy hiệu hệ nguyên tố hoặc hào quang trên giao diện:
  ```css
  .badge-elem-hoa {
    background: var(--cowdi-elem-hoa-glow);   /* #FFD2B0 */
    border-color: var(--cowdi-elem-hoa-accent); /* #F08A5D */
  }
  ```
- Khi cần đọc bằng JavaScript/Node (script, canvas, chart): đọc trực tiếp từ [palettes/cowdi_palette.json](palettes/cowdi_palette.json) hoặc [art-spec.json](art-spec.json).

---

## 7. Cách mở rộng bộ chuẩn khi thêm Pet mới

Khi bổ sung một loài pet mới (ví dụ `mushroom` — Nấm Rơm, `bun` mở rộng, hoặc Pet giới hạn GĐ7):
1. Chọn màu `base` có độ bão hòa **`S ≤ 50`**; tính màu `shade` theo công thức (`V × 0.70–0.80`, `S + 3–10`, `Hue ±5°`).
2. Thêm khối nhân vật mới vào `characters` trong **[art-spec.json](art-spec.json)**.
3. Cập nhật bảng màu tương ứng trong `palettes/` (`cowdi_tokens.css`, `cowdi_palette.json`, `cowdi_palette.gpl`, `cowdi_palette.ase`).
4. Thêm 1 dòng **Character DNA** mới vào **[prompts/AI_PROMPT_BLOCKS.md](prompts/AI_PROMPT_BLOCKS.md)** và bảng §5.2 trong **[STD-ART-STYLE-v1.1.md](STD-ART-STYLE-v1.1.md)**.
5. Chạy thử `qc_check.py --char <petId_moi> --stage c3` để xác nhận script tự động nhận loài mới.
