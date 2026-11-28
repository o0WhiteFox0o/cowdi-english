# CHK-STORY-S2-IMAGES — Hướng dẫn & Danh sách Ảnh cần làm cho Kịch bản Mùa 2 (`int-u1 → int-u3`)

> **Ngày lập:** 2026-11-28 · **Dành cho:** Nhân sự Mỹ thuật / Designer / AI Artist  
> **Quy chuẩn bắt buộc:** [STD-ART-STYLE-v1.1.md](STD-ART-STYLE-v1.1.md) (Flat vector, thân thiện trẻ 4–12 tuổi, cấm 3D/tả thực/yếu tố đáng sợ)  
> **Tài liệu liên quan:** [KICH-BAN-DAN-NHAP-MUA2-U1-U3-v1.0.md](../../04-design/KICH-BAN-DAN-NHAP-MUA2-U1-U3-v1.0.md) · [TASK-STORY-INTRO-S2.md](../TASK-STORY-INTRO-S2.md)

---

## 1. Tóm tắt kiểm kho ảnh hiện tại (2026-11-28)

| Nhóm tài sản | Trạng thái | Chi tiết |
|---|---|---|
| **Pet dẫn truyện (C4) & Boss (C5)** — 8 loài (`cowdi`, `flippy`, `pingu`, `owlbert`, `mimi`, `bamboo`, `bamboo_spirit`, `storm`) | ✅ **ĐÃ ĐỦ 16/16** | Đã có sẵn đủ `*_Super.webp` (C4) và `*_Legendary.webp` (C5) trong `public/assets/images/pets/`. **Không cần vẽ thêm.** |
| **Lớp Sương Câm phủ Boss** | ✅ **ĐÃ CÓ** | Đã có `public/image/boss/fog.svg`. |
| **Nhóm A · Chân dung 6 Nhân vật người (`HUMAN_CAST`)** | ✅ **ĐÃ ĐỦ 6/6** | Đã cắt viền & xuất WebP `512×512` nền trong suốt vào `public/image/npc/` (`ong_tu`, `minh`, `lan`, `mai`, `tom`, `khoa`) ngày 2026-11-28. |
| **Nhóm B · Ảnh nền Vùng đất & Bối cảnh (`public/image/regions/`, `scenes/`)** | ✅ **Đợt 1 ĐÃ ĐỦ** (`7` vùng + `2` cảnh trường) | Đã cắt dải thừa & xuất WebP `1200×675` (16:9): `BD-sang-suong`, `BD-nuoc-noi`, `VS-sang-suong`, `TG-sang-suong` *(tạm dùng ảnh cánh đồng rộng — có thể thay bằng ảnh Tháp điện gió riêng sau)*, `RM-sang-suong`, `CN-sang-suong`, `CNS-sang-suong` + `scenes/classroom.webp`, `scenes/schoolyard.webp`. |
| **Nhóm C · Ảnh minh hoạ 12 Điểm mốc (`landmarks`)** | 🟡 **TÙY CHỌN (Ưu tiên 2)** | Hiện có thể hiển thị tên điểm mốc dạng badge chữ; có ảnh nhỏ sẽ đẹp hơn khi thắp sáng điểm mốc cuối bài. |
| **Nhóm D · Ảnh thẻ Đúng/Sai `F-11` (`sceneBrief` của `int-u1..u3`)** | 🟡 **TÙY CHỌN (Ưu tiên 3)** | Hiện `F-11` đang dùng tạm ảnh chung `/image/art/*.webp` hoặc emoji; vẽ riêng theo `sceneBrief` sẽ trực quan hơn (69 thẻ trên 12 bài). |

> **Lưu ý:** Nếu đặt đúng **tên file và thư mục** dưới đây, hệ thống sẽ tự động nhận ảnh ngay mà không cần sửa code.

---

## 2. Quy chuẩn kỹ thuật chung (bắt buộc theo `STD-ART-STYLE-v1.1`)

- **Phong cách:** Flat vector 2D (tầng B — *dễ thương, sạch như sticker, hiền hòa* cho trẻ 4–12 tuổi). **Không dùng 3D, không tả thực, không airbrush/gradient loang lổ trên nhân vật.**
- **Ánh sáng & đổ bóng:** Hướng sáng từ **trên-phải**, đúng 1 tông bóng cel-shade cứng.
- **Đường nét:**
  - Nhân vật (Nhóm A): nét đen `#000000` bo tròn đầu nét, mặt hiền/vui, không yếu tố đáng sợ.
  - Cảnh nền vùng (Nhóm B): nét mảnh hơn hoặc không viền, màu pastel bão hòa thấp (dịu mắt) để làm nền nổi chữ và nhân vật phía trước.
- **Định dạng xuất file:** `.webp` (chất lượng 85–90%, tối ưu dung lượng web).

---

## 3. Danh sách chi tiết từng ảnh cần bàn giao

### Nhóm A — 6 Chân dung Nhân vật người (🔴 Ưu tiên 1 · Cần gấp)

- **Thư mục lưu:** `public/image/npc/`
- **Kích thước:** `512 × 512 px` (tỉ lệ `1:1`, căn giữa từ vai trở lên, **nền trong suốt `transparent`**).
- **Dung lượng mục tiêu:** `< 60 KB` / ảnh.

| # | Tên file bắt buộc | Nhân vật | Vai trò & Gợi ý tạo hình (khớp Story Bible) |
|---|---|---|---|
| A1 | `public/image/npc/ong_tu.webp` | **Ông Tư** | Chú/ông chèo đò ngang miền Tây (~55–65 tuổi), nụ cười hiền hậu, đội nón lá hoặc khăn rằn vắt vai, áo bà ba nâu nhạt/xanh lam dịu. |
| A2 | `public/image/npc/minh.webp` | **Minh** | Học sinh THCS (~11–12 tuổi, nam), tóc gọn, áo thun/sơ mi học sinh năng động, ánh mắt tò mò, nụ cười thân thiện (nhân vật chính Mùa 2). |
| A3 | `public/image/npc/lan.webp` | **Lan** | Bạn cùng lớp của Minh (~11–12 tuổi, nữ), tóc buộc gọn hoặc kẹp tóc nhỏ, tươi tắn, tự tin, mang nét ham học hỏi. |
| A4 | `public/image/npc/mai.webp` | **Bé Mai** | Em gái Minh (~6 tuổi, nữ), má phúng phính dễ thương, tóc buộc hai bên, áo màu sáng ấm áp (nhân vật chính Mùa 1). |
| A5 | `public/image/npc/tom.webp` | **Thầy Tom** | Thầy giáo tiếng Anh trẻ trung (~28–35 tuổi), nụ cười ấm áp, đeo kính nhẹ hoặc cầm quyển sách nhỏ, trang phục lịch sự gần gũi (không gắn quốc kỳ/quốc tịch cụ thể). |
| A6 | `public/image/npc/khoa.webp` | **Anh Khoa** | Anh trai Minh (~19–21 tuổi, sinh viên), chững chạc, thân thiện, áo sơ mi/hoodie gọn gàng (nhân vật chính Mùa 3). |

---

### Nhóm B — Ảnh nền 3 Vùng đất Mùa 2 (`BD`, `TG`, `VS`) (🔴 Ưu tiên 1)

- **Thư mục lưu:** `public/image/regions/`
- **Kích thước:** `1200 × 675 px` (tỉ lệ `16:9` ngang, **nền đầy khung**, ảnh phong cảnh dịu mắt vì đặt sau chữ `opacity: 0.25–0.35` ở màn Mở ải).
- **Dung lượng mục tiêu:** `< 150 KB` / ảnh.

#### B.1 — Đợt 1 (3 ảnh bắt buộc cho lượt chơi đầu — biến thể `Sáng sương`)
| # | Tên file bắt buộc | Vùng đất | Bảng màu chuẩn (`REGION_COLOR`) | Bối cảnh tham chiếu (Story Bible) |
|---|---|---|---|---|
| B1 | `public/image/regions/BD-sang-suong.webp` | **Bến Đò Ông Tư** (`int-u1`) | Trời `#CFE8E4` · Nước `#8EC7D6` | Bến đò gỗ nhỏ bên sông miền Tây (Cồn Sơn, Cần Thơ), chiếc đò ngang neo bến, mặt sông phẳng lặng có làn sương sớm mỏng. |
| B2 | `public/image/regions/TG-sang-suong.webp` | **Tháp Gió** (`int-u2`) | Trời `#E6F0FA` · Cỏ `#C8DCA0` | Cánh đồng gió lộng (điện gió Bạc Liêu), những tháp gió quay chậm giữa trời sương sớm, có vài phong thư nhỏ bay trong gió. |
| B3 | `public/image/regions/VS-sang-suong.webp` | **Vườn Sữa** (`int-u3`) | Trời `#E8F3DA` · Cỏ `#B9DDA8` | Khu vườn xanh mướt trên cù lao (Cồn Sơn), ngôi nhà mái đỏ ấm cúng, rặng trúc xanh phía sau vườn, nắng sớm len qua sương nhẹ. |

#### B.2 — Đợt 2 (9 ảnh mở rộng cho các vòng giải sương tiếp theo — làm sau khi xong B.1)
| Vùng | `nuoc-noi` (Mùa nước nổi) | `dem-den-long` (Đêm đèn lồng) | `mua-tet` (Mùa Tết) |
|---|---|---|---|
| **Bến Đò (`BD`)** | `BD-nuoc-noi.webp` | `BD-dem-den-long.webp` | `BD-mua-tet.webp` |
| **Tháp Gió (`TG`)** | `TG-nuoc-noi.webp` | `TG-dem-den-long.webp` | `TG-mua-tet.webp` |
| **Vườn Sữa (`VS`)** | `VS-nuoc-noi.webp` | `VS-dem-den-long.webp` | `VS-mua-tet.webp` |

---

### Nhóm C — 12 Biểu tượng Điểm mốc (🟡 Ưu tiên 2 · Tùy chọn nâng cấp UI)

- **Thư mục lưu:** `public/image/landmarks/`
- **Kích thước:** `256 × 256 px` (tỉ lệ `1:1`, nền trong suốt, phong cách icon sticker).

| Unit | File đề xuất | Điểm mốc |
|---|---|---|
| `int-u1` | `bd-0-ben-go.webp`, `bd-1-ghe-do.webp`, `bd-2-co-hieu.webp`, `bd-3-coc-dem.webp` | Bến gỗ · Ghế khách trên đò · Cờ hiệu mũi đò · Cọc đếm khách |
| `int-u2` | `tg-0-hom-thu.webp`, `tg-1-chong-chong.webp`, `tg-2-bang-tin.webp`, `tg-3-san-tap.webp` | Hòm thư lớp học · Chong chóng đo gió · Bảng tin nghề nghiệp · Sân tập dưới chân tháp |
| `int-u3` | `vs-0-day-phoi.webp`, `vs-1-nha-mai-do.webp`, `vs-2-rung-truc.webp`, `vs-3-san-hoi.webp` | Dây phơi đồ · Ngôi nhà mái đỏ · Lối vào rừng trúc · Sân hội cuối tuần |

---

## 4. Quy trình bàn giao & kiểm tra
1. Nhân sự xuất file đúng tên và kích thước ở §3, gửi theo từng đợt (ưu tiên hoàn thành **Nhóm A: 6 ảnh NPC** + **Nhóm B.1: 3 ảnh vùng `sang-suong`** = **9 ảnh trước**).
2. Kiểm tra nhanh: nền trong suốt không còn viền trắng (Nhóm A), kích thước đúng, dung lượng nhẹ (`< 60 KB` / `< 150 KB`), màu dịu mắt không chói.
3. Chép thẳng vào `public/image/npc/` và `public/image/regions/` → chạy `npm run build` là giao diện tự nhận ảnh mới.
