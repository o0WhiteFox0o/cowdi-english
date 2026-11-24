# CHK-ART-UI-AUDIT — Danh sách Công việc Thay thế Hình ảnh & Kiểm tra Khung UI/UX

> **Loại tài liệu:** Tài liệu sống (Living Document — Checklist Công việc Mỹ thuật & UI/UX)
> **Chuẩn áp dụng:** [STD-ART-STYLE-v1.1.md](STD-ART-STYLE-v1.1.md) · [GDE-ART-WORKFLOW-v1.1.md](GDE-ART-WORKFLOW-v1.1.md) · [REG-UI-ICONS.md](../REG-UI-ICONS.md)
> **Cập nhật lần cuối:** 2026-11-24

---

## 1. Danh mục Công việc Hình ảnh cần bổ sung / sửa / thay thế

### Ưu tiên P0 — Lỗi ảnh 404 & Pet khai báo trong code nhưng chưa có file

- [ ] **ART-01 · 2 ảnh thẻ Từ vựng bị thiếu file trên đĩa (404)** (`VocabularyPage.jsx`, `AdminImageManager.jsx`):
  - `public/image/subtopics/numbers/basic.webp`
  - `public/image/subtopics/numbers/more.webp`
- [ ] **ART-02 · 5 ảnh tiến hóa Pet Bánh Bao (`bun`)** — đã khai báo trong `src/data/pets.js` nhưng thiếu file (hiện rơi về Emoji):
  - `public/assets/images/pets/BanhBao/BanhBao_{Egg,Baby,Junior,Super,Legendary}.webp`
  - Vẽ theo `STD-ART-STYLE-v1.1.md` (chiều cao C3 riêng `390 px`, `bun` palette `#FFFFFF` / `#C2B8CA`, Trứng C1 có mắt `Q4`) → chạy `qc_check.py --char bun`.
- [ ] **ART-03 · 5 ảnh tiến hóa Pet Nấm Rơm (`mushroom`)** — đã khai báo trong `src/data/pets.js` nhưng thiếu file (hiện rơi về Emoji):
  - `public/assets/images/pets/NamRom/NamRom_{Egg,Baby,Junior,Super,Legendary}.webp`
  - Bổ sung bảng màu `mushroom` vào `art-spec.json` + `palettes/` theo công thức `shade_formula` (`base_sat_max ≤ 50`), sau đó chạy `qc_check.py --char mushroom`.

### Ưu tiên P1 — Sửa 3 sprite gốc FAIL QC tự động & Bộ Icon UI thay thế Emoji

- [ ] **ART-04 · Sửa 3 sprite gốc không đạt `qc_check.py` (audit 24/11/2026)**:
  - `cowdi` (Cowdi): đứng thấp hơn baseline `~30 px` → dời tâm bóng đất & nhân vật lên `y = 800`.
  - `bun` (Bé Bột): đứng cao hơn baseline `~42 px` → dời xuống `y = 800`.
  - `ginseng` (Nhân sâm): `21.6%` mảng màu ngoài bảng & bóng đất sai màu (`#D3BFD8` thay vì `#A297AB`) → tô lại chuẩn bảng `ginseng` (đối chiếu `preview/ginseng_before_after.png`), giữ lông mày idle theo `Q3`.
- [ ] **ART-05 · Thay thế toàn bộ Emoji HUD / Shop / 10 Hệ nguyên tố (`REG-UI-ICONS.md` Đợt 1 — 34 icon)**:
  - Đang dùng Emoji thô trên `BookShell` (`🥛`, `💎`), `ShopPage` (`🔥`, `✨`, `🎒`, `💠`), `PetPage` (`🪨`), `AccountPage` (`🪨`), `LearningPathPage` (`💠`), `DuelPage` (10 hệ).
  - Đồng thời thống nhất lỗi lệch 2 emoji Đá nguyên tố (`🪨` vs `💠`) về 1 icon duy nhất `res_stone.webp` và đồng bộ bảng màu 10 hệ theo `palettes/cowdi_tokens.css`.
- [ ] **ART-06 · Bộ 50 icon Đồ trang trí cho GĐ4 (`REG-UI-ICONS.md` Đợt 2)**:
  - 19 Nền, 15 Hào quang, 16 Mũ/Áo/Phụ kiện phục vụ nhánh `feat/cosmetics`.

### Ưu tiên P2 — Minh họa bài học Starter (`G10`) & Chuẩn hóa cuốn chiếu Pet cũ

- [ ] **ART-07 · 79 ảnh minh họa bài học Starter S1–S3 (`image: null`) + 7 ảnh mẫu `_golden/s1-pets.js`**:
  - 12 bài Starter (`s1-hello`, `s1-me`, `s1-pets`, `s1-farm`, `s1-wild`, `s1-water`, `s1-color-1`, `s1-color-2`, `s1-num-1`, `s1-num-2`, `s1-shape`, `s1-size`): mỗi bài 5–6 ảnh từ đơn (`public/image/words/<slug>.webp`, `512×512`, ≤ 40 KB, không chữ) + 1 tranh tình huống `sceneBrief` (`public/image/scenes/<lessonId>.webp`, vẽ theo Mẫu E của `AI_PROMPT_BLOCKS.md`).
- [ ] **ART-08 · Kiểm định & chuẩn hóa cuốn chiếu 19 bộ ảnh Pet hiện có + Củ Cải Trắng**:
  - Chạy `qc_check.py` và rà soát độ nhất quán nét `#000000`, Face Kit, bóng `#A297AB`, và tách 13 layer chuẩn `PetRig` cho các pet chưa lên rig trên `/admin/pet-motion`.
  - Xác nhận tên file `public/assets/images/pets/` hoàn toàn khớp chữ hoa/thường trên Linux *(đã rà soát ngày 24/11/2026: 0 lỗi lệch chữ hoa/thường hiện tại)*.

---

## 2. Kết quả Kiểm tra & Điều chỉnh Khung Giao diện Web (2026-11-24)

| Phạm vi / Trang | Vấn đề khung UI/UX phát hiện | Trạng thái xử lý |
|---|---|---|
| **Khung tổng (`BookShell`, `book.css`, `index.html`, `styles.css`)** | (1) Ruy-băng `.book-ribbons` (`right: -30px`) tràn mép phải viewport ở `992–1480px`; (2) Mobile top bar nhét 8 mục `nowrap` gây tràn ngang trên `360–420px`; (3) 2 nút nổi `.cowdi-invite-fab` & `.cowdi-chat-btn` đè nhau ở góc dưới phải mobile và che nút Tiếp tục bài học; (4) `overflow-x: hidden` trên `html/body` làm hỏng `position: sticky` (`.path-fab`); (5) Thiếu `viewport-fit=cover` & `scroll-padding` cho thanh cố định mobile; (6) Sidebar Desktop ẩn mất 2 mục `Pet của tôi` & `Cửa hàng`; (7) Chưa nạp 55 CSS token chuẩn mỹ thuật `cowdi-tokens.css` vào ứng dụng. | ✅ Đã sửa toàn bộ (2026-11-24) |
| **Lộ trình học (`LearningPathPage`, `path.css`)** | Chữ `.text-muted` / `.text-primary` trên nền màu đậm `.path-unit-head` bị mất tương phản; `.path-node-tip` dễ tràn ngang trên mobile 360px; `.path-picker` không co giãn tốt ở `< 576px`. | ✅ Đã sửa (2026-11-24) |
| **Cửa hàng (`ShopPage`)** | Khung hẹp `640px` lệch tổng thể notebook; chữ hard-code `13px`/`14px` quá nhỏ so với base `20–24px`; nút `?` chỉ `28×28px` dưới chuẩn chạm; 3 tab chưa `flex-wrap` cho màn hẹp. | ✅ Đã sửa (2026-11-24) |
| **Pet của tôi (`PetPage`, `pet.css`)** | 4 chỉ số chiến đấu dùng `col-3` cố định bị bóp nghẹt trên mobile; `.pet-character-img` trên mobile ép `width: 120px; height: 120px` làm méo tỉ lệ ảnh không vuông. | ✅ Đã sửa (2026-11-24) |
| **Cowdi Dex (`CollectionPage`, `dex.css`)** | `.dex-badges` đặt `flex-wrap: nowrap` gây tràn 4 badge ra ngoài khung đỏ; `.dex-combat-grid` 4 cột chật cứng trên mobile nhỏ; modal chi tiết chưa dùng `dvh` & `overscroll-behavior: contain`. | ✅ Đã sửa (2026-11-24) |
| **Đấu trường (`DuelPage`, `pet.css`)** | Trên mobile `< 576px`, hộp HP `.battle-hud` (`min-width: 170px`) đè lên ảnh Pet trong `.battle-arena`; màu `ELEMENT_FX` chưa khớp bảng màu 10 hệ `STD-ART-STYLE-v1.1`. | ✅ Đã sửa (2026-11-24) |
| **Xếp hạng học tập (`StudentRankingPage`)** | 8 thẻ chỉ số dùng `col-3` cố định vỡ khung trên mobile (đặc biệt chuỗi streak dài); dòng bảng xếp hạng thiếu `min-width: 0` nên tên dài đẩy lệch cột điểm. | ✅ Đã sửa (2026-11-24) |
| **Kiểm tra trực quan trên trình duyệt thực** | Chưa kết nối được Chrome DevTools Remote Debugging trên máy (chưa bật `chrome://inspect/#remote-debugging`). Khuyến nghị mở thực tế 2 kích thước Desktop `1280×800` & Mobile `390×844` để nghiệm thu trực quan sau bản sửa này. | ⏳ Khuyến nghị kiểm tra tay/visual |
