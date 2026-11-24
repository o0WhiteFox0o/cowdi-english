# Quy tắc: Chuẩn Mỹ thuật & Hình ảnh Toàn dự án (Art Style v1.1)

Áp dụng khi làm bất kỳ việc nào liên quan tới thiết kế/vẽ pet, tạo ảnh bằng AI, chỉnh sửa sprite, biểu cảm, bảng màu 10 hệ nguyên tố, màu CSS thương hiệu, tách lớp `PetRig`, đồ trang trí (cosmetics), minh họa bài học Starter/Comic hoặc kiểm duyệt tài sản hình ảnh.

## Nguồn sự thật bắt buộc (đọc trước khi làm)
1. `docs/05-implementation/art/STD-ART-STYLE-v1.1.md` — Quy chuẩn Mỹ thuật toàn dự án (Art Bible v1.1).
2. `docs/05-implementation/art/art-spec.json` — Thông số máy đọc được (canvas, nét, ánh sáng, 55 màu, Face Kit, C1–C5, 10 hệ, 13 layer, `Q1–Q7`).
3. `docs/05-implementation/art/prompts/AI_PROMPT_BLOCKS.md` — `STYLE BLOCK`, `NEGATIVE BLOCK`, Character DNA, mẫu `A–F` và bảng 12 biểu cảm `E00–E11`.
4. Thứ tự ưu tiên khi mâu thuẫn: `STD-ART-STYLE-v1.1.md` & `art-spec.json` > `GDE-PET-IMAGES-v1.0.md` / `REG-UI-ICONS.md` / `REG-IMAGE-CATALOG.md`.

## Nguyên tắc không được vi phạm
- **Phong cách (`Q1`, `Q6`):** Flat 2D vector chibi sạch như sticker, dễ thương và hiền hòa cho trẻ **4–12 tuổi**. Cấm gradient, airbrush, texture, 3D, viền nâu/màu, răng nanh, mắt đỏ, nét kinh dị.
- **Canvas & Căn chuẩn:** Xuất `1080×1080` (master vẽ `2160×2160`), trục tâm `x = 540`, baseline `y = 800`, vùng an toàn `[160, 160, 920, 880]`. Xuất vào app phải nền trong suốt.
- **Đường nét:** Duy nhất `#000000`, `round` cap/join; nét ngoài & cấu trúc `6 px` (@1080) / `12 px` (@2160), nét chi tiết `4 px` (@1080) / `8 px` (@2160). Không viền quanh mắt, má hồng hoặc bóng.
- **Ánh sáng & Đổ bóng:** Hướng sáng trên-phải (`top-right`), đúng **1 tông** cel-shade cứng hình lưỡi liềm cạnh trái-dưới (`10–20%`), bóng trên nền trắng luôn là `#C2B8CA`.
- **Màu sắc (`Q5`, `Q7`):** Chỉ dùng 55 token trong `docs/05-implementation/art/palettes/` (`cowdi_tokens.css` / `cowdi_palette.json`). Khi thêm màu nhân vật mới phải theo `shade_formula` (`base_sat_max ≤ 50`, `V × 0.70–0.80`, `S + 3–10`, `H ±5°`).
- **Bộ mặt (`Face Kit`, `Q3`, `Q4`):** Không tự vẽ lại mắt/má; dùng `docs/05-implementation/art/face_kit/face_kit_c{1-5}_{round,narrow}.svg`. Trạng thái `E00` không có miệng, mũi, mày (ngoại lệ duy nhất `Q3`: Nhân sâm giữ mày ngắn). Trứng C1 luôn có mắt (`Q4`).
- **Bóng đất:** Elip tỉ lệ `3:1`, màu `#A297AB`, `blur: 0`, lấy đúng kích thước `C1–C5` trong `docs/05-implementation/art/ground_shadow/`.
- **Tách lớp `PetRig`:** Đủ 13 layer chuẩn (`aura`, `shadow_ground`, `arm_l`, `body`, `head`, `crown`, `eye_0`, `eye_1`, `mouth_*`, `arm_r`, `prop_*`, `fx`, `pivot_*`) từ `templates/canvas_2160_template.svg`.
- **Sinh ảnh AI:** Dán nguyên văn `[STYLE BLOCK] + [CHARACTER DNA] + [MẪU A–F] + [NEGATIVE BLOCK]` từ `AI_PROMPT_BLOCKS.md`, không tự diễn đạt lại. Sửa ảnh dùng Mẫu F, mỗi lượt 1 thay đổi, tối đa 3 lượt.
- **Tên file nguồn:** `cowdi_{petId}_c{1-5}_{pose}_{E-code}_v{NN}.{ext}`.

## Kiểm duyệt trước khi bàn giao
- Chạy `python3 docs/05-implementation/art/tools/qc_check.py <file.png> --char <petId> --stage <c1..c5>` cho sprite Tầng A.
- Dùng `palette_lock.py` để soi màu lạc sau khi sinh ảnh AI (nhưng không lấy ảnh răng cưa làm bản cuối).
- Mọi thay đổi thông số chuẩn phải cập nhật đồng bộ cả `STD-ART-STYLE-v1.1.md`, `art-spec.json` và thư mục `palettes/` trong cùng một commit.
