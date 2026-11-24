# Bộ Quy chuẩn Mỹ thuật & Art Kit Cowdi English — v1.1

> **Phiên bản:** 1.1 · **Ngày cập nhật:** 2026-11-24 · **Thuộc mục:** `05-implementation/art/` · **Đăng ký:** [REG-DOCUMENTS](../../00-general/REG-DOCUMENTS.md)

**Điểm bắt đầu bắt buộc (Nguyên tắc mỹ thuật toàn dự án):** [STD-ART-STYLE-v1.1.md](STD-ART-STYLE-v1.1.md)

Bộ file mẫu và công cụ dùng chung đi kèm **Cowdi English — Art Bible & Visual Style Standard v1.1**. Số đo lấy từ 6 sprite gốc `1080 px`; file master vẽ ở `2160 px` (`×2`).

---

## Danh mục tài liệu & tài nguyên trong bộ chuẩn

| Thư mục / file | Vai trò | Đối tượng dùng |
|---|---|---|
| [STD-ART-STYLE-v1.1.md](STD-ART-STYLE-v1.1.md) | **Quy chuẩn Mỹ thuật & Nhận diện Hình ảnh toàn dự án** (`Q1–Q7`, canvas, nét, ánh sáng, 55 màu, Face Kit, C1–C5, 13 layer `PetRig`, QC) | Toàn đội (PO, Họa sĩ, Dev, AI) |
| [art-spec.json](art-spec.json) | Toàn bộ thông số máy đọc được (Single Source of Truth cho canvas, nét, màu, face kit, cấp C1–C5, 10 hệ, layer, QC) | Dev, AI, script |
| [prompts/AI_PROMPT_BLOCKS.md](prompts/AI_PROMPT_BLOCKS.md) | `STYLE BLOCK`, `NEGATIVE BLOCK`, Character DNA 6 nhân vật, 6 mẫu prompt (`A–F`), bảng 12 biểu cảm (`E00–E11`) | Người vận hành AI |
| `templates/canvas_2160_template.svg`, `templates/canvas_1080_template.svg` | Khung vẽ có sẵn trục `x`, baseline `y=800`, vùng an toàn, vạch chiều cao `C1–C5`, bóng đất `C3` và đủ 13 layer theo `PetRig` | Họa sĩ |
| `face_kit/face_kit_c{1-5}_{round,narrow}.svg` | Bộ mặt chuẩn (mắt mở `eye_0_open`, mắt nhắm `eye_1_closed`, má hồng) theo hệ số từng cấp (`round` = khoảng mắt `133 px` @1080, `narrow` = `95 px`) | Họa sĩ, hậu kỳ AI |
| `face_kit/expression_parts.svg` | Bộ phận miệng, mày, mắt cung cho biểu cảm `E01–E11` | Họa sĩ |
| `ground_shadow/ground_shadow_c{1-5}.svg` | Elip bóng đất `#A297AB` đúng kích thước từng cấp `C1–C5` | Họa sĩ, Dev |
| `palettes/` (`cowdi_tokens.css`, `cowdi_palette.json`, `cowdi_palette.ase`, `cowdi_palette.gpl`) | 55 token màu dùng chung cho Illustrator/Photoshop, Krita/GIMP/Inkscape, JSON và CSS Frontend | Mọi người |
| [tools/qc_check.py](tools/qc_check.py) | Script QC tự động phần đo được theo `art-spec.json` | Mọi người trước khi nộp |
| [tools/palette_lock.py](tools/palette_lock.py) | Script ép ảnh AI về đúng bảng màu nhân vật để kiểm tra màu lạc | Hậu kỳ AI |
| `preview/kit_overview.png`, `preview/ginseng_before_after.png` | Ảnh tổng quan bộ kit & ví dụ đối chiếu Nhân sâm trước/sau khóa màu | Tham chiếu nhanh |

---

## Quy trình làm việc nhanh

1. Mở `templates/canvas_2160_template.svg`, vẽ vào đúng 13 layer chuẩn. Nét ngoài/cấu trúc `12 px`, nét chi tiết `8 px`, màu `#000000`, đầu nét `round`.
2. Kéo `face_kit/face_kit_c{1-5}_{round|narrow}.svg` vào layer `eye_0` / `eye_1`, đặt đường mắt ở `45–55%` chiều cao thân. **Không tự vẽ lại mắt.**
3. Tô màu phẳng + đúng 1 tông bóng lưỡi liềm trái-dưới bằng swatch trong `palettes/`. Ẩn layer `GUIDES` trước khi xuất.
4. Chạy kiểm tra tự động trước khi bàn giao:
   ```bash
   pip install pillow numpy scipy
   python3 docs/05-implementation/art/tools/qc_check.py cowdi_radish_c3_idle_E00_v01.png --char radish --stage c3
   python3 docs/05-implementation/art/tools/palette_lock.py ai_output.png locked.png --char radish
   ```
   *(Lưu ý: `qc_check.py` chỉ kiểm phần đo được; silhouette ở `48 px`, bóng 1 tông đúng hướng sáng, biểu cảm và cảm giác "dễ thương trước" vẫn do người duyệt kiểm tra.)*

---

## Kết quả QC tự động trên 6 sprite gốc (24/11/2026)

| Sprite | Kết quả | Lỗi phát hiện | Hướng xử lý |
|---|---|---|---|
| Bamboo, Ricy, Củ Cải | **PASS** | — | Giữ nguyên làm mẫu tham chiếu |
| Cowdi | **FAIL** | Đứng thấp hơn baseline `~30 px` | Dời về `baseline y = 800` |
| Bé Bột | **FAIL** | Đứng cao hơn baseline `~42 px` | Dời về `baseline y = 800` |
| Nhân sâm | **FAIL** | `21.6%` mảng màu ngoài bảng; bóng đất sai màu (`#D3BFD8`) | Tô lại theo bảng màu `ginseng` & bóng `#A297AB` (xem `preview/ginseng_before_after.png`) |
