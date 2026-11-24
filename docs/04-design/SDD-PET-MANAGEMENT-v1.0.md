# SDD-PET-MANAGEMENT v1.0 — Nâng cấp Quản lý Pet (từ Pet Motion) & Tối ưu UI/UX Không Cuộn Chuột

| Mục | Giá trị |
|---|---|
| **Mã tài liệu** | `SDD-PET-MANAGEMENT` |
| **Phiên bản** | `1.0` · **Ngày ban hành:** `2026-11-24` |
| **Trạng thái** | `Approved` |
| **Chuẩn tham chiếu** | IEEE 1016-2009 · Quy ước tài liệu: [DOCP-COWDI-v1.1](../00-general/DOCP-COWDI-v1.1.md) |
| **Tài liệu liên quan** | [PET-MOTION.md](../PET-MOTION.md) · [HUONG-DAN-CHINH-DONG-TAC-PET.md](../HUONG-DAN-CHINH-DONG-TAC-PET.md) · [STD-ART-STYLE-v1.1.md](../05-implementation/art/STD-ART-STYLE-v1.1.md) · [CHK-ART-UI-AUDIT.md](../05-implementation/art/CHK-ART-UI-AUDIT.md) |

## Lịch sử sửa đổi

| Phiên bản | Ngày | Nội dung | Người sửa |
|---|---|---|---|
| 1.0 | 2026-11-24 | Thiết kế & triển khai nâng cấp `/admin/pet-motion` thành Trung tâm Quản lý Pet (thêm/sửa/xoá/upload pet mới) và chuẩn hoá UI/UX gọn, popup tính năng phụ, Zero-Scroll Quiz | Sonny + AI |

---

## 1. Mục tiêu nâng cấp

1. **Thu gọn UI/UX tổng thể & giảm tối đa thao tác cuộn chuột:**
   - Hạ kích thước phông gốc quá lớn (`24px` → `17px` desktop, `16px` tablet, `15.5px` mobile), thu gọn khung sổ tay và thanh bước học.
   - Gom các chức năng ít dùng trên thanh bên Desktop (`Sổ tay cá nhân`, `Tiến trình`, `Bảng xếp hạng`, `Đấu bạn bè`, `Ôn nhanh SRS`, `Tài khoản`, `Mời bạn`, nhóm `Quản trị`, lời nhắn Pet) và thông tin/mục tiêu bài học vào **Popup mở khi cần**.
   - **Nguyên tắc bắt buộc khi trả lời câu hỏi (Zero-Scroll Quiz):** Câu hỏi, các lựa chọn (2×2) và thanh phản hồi + nút **Kiểm tra / Đồng ý / Câu tiếp theo → / Tiếp tục →** phải luôn hiển thị sẵn trong 1 khung nhìn qua `.quiz-viewport-stage` + `.quiz-sticky-action-bar`, tuyệt đối không bắt người học cuộn chuột xuống để bấm xác nhận.
2. **Phát triển `/admin/pet-motion` thành Trung tâm Quản lý Pet:**
   - Cho phép quản trị viên tạo loài Pet mới, chỉnh sửa thông tin (tên, loài, emoji, 10 hệ nguyên tố, 7 nhóm kỹ năng, 5 độ hiếm, mô tả, tên 5 cấp `C1–C5`), upload trực tiếp ảnh 5 cấp `C1–C5` (tự nén WebP chuẩn `512/640 px`), xoá pet tự thêm (bảo vệ 23 pet gốc), và tiếp tục dựng Rig 13 layer / 34 động tác / Xem trước khi học ngay lập tức.
   - Tự động đồng bộ danh mục pet mới & ảnh avatar lên toàn bộ ứng dụng người học qua API công khai `GET /api/pet-motion/catalog` mà không cần sửa code hay build lại.

---

## 2. Thiết kế Phần A — Tối ưu UI/UX Gọn & Zero-Scroll Quiz

### 2.1. Điều chỉnh tỷ lệ toàn hệ thống (`src/styles/styles.css`, `src/styles/book.css`)
- `--cowdi-font-base`: `17px` (desktop) · `16px` (`≤ 991px`) · `15.5px` (`≤ 575px`) · `15px` (`≤ 400px`).
- Thu gọn `.book-shell`, `.book-side` (`232px`), `.book-page`, `.book-plaque` (1 hàng ngang), `.lesson-steps` (`.lesson-step-dot` `34px`) và `.study-pet-dock` (`50×54px`).

### 2.2. Chuyển chức năng ít dùng thành Popup
- **`src/components/layout/BookShell.jsx`:** Sidebar Desktop chỉ giữ 7 mục dùng thường xuyên nhất (`Lộ trình học`, `Ôn tập & Bài tập`, `Từ vựng`, `Đấu trường game`, `Pet của tôi`, `Cowdi Dex`, `Cửa hàng`). Toàn bộ mục phụ & quản trị đưa vào popup **`Thêm & Hồ sơ ⋯`**; lời nhắn hàng ngày của Pet thu thành nút pill mở popup ở đáy sidebar. Hỗ trợ đóng bằng click ngoài hoặc `Esc`.
- **`src/features/lesson/LessonDetailPage.jsx`:** Thu gọn thẻ tiêu đề bài học thành 1 dòng ngắn; mô tả chi tiết, danh sách `objectives` và thông tin chế độ Luyện thi mở bằng nút **`ℹ️ Chi tiết`** trong popup `.cowdi-mini-modal`.

### 2.3. Kiến trúc Zero-Scroll Quiz (`src/styles/components.css`)
- `.quiz-viewport-stage`: gom bố cục câu hỏi thành `flex-column` với khoảng cách gọn `0.65rem`.
- `.quiz-sticky-action-bar`: thanh hành động (`Kiểm tra`, `Câu tiếp theo →`, `Tiếp →`, `Tiếp tục →`) ghim `position: sticky; bottom: 8px` trên desktop và `position: fixed` phía trên bottom nav trên mobile (tự ẩn `.cowdi-invite-fab` khi xuất hiện).
- Áp dụng thống nhất trên: `LessonDetailPage` (Quiz tổng kết + Luyện nghe 2×2), `LearningPathPage` (Kiểm tra Checkpoint Unit), `PlacementTest` (`/placement`), `PracticePage` (Dictation, Fill-in, Reorder, WordGuess, WordBuild, TranslateWrite), `PictureLesson` (Starter bước 1/3/4), và `.battle-arena` của `DuelPage`.

---

## 3. Thiết kế Phần B — Trung tâm Quản lý Pet & Upload Pet mới

### 3.1. Cơ sở dữ liệu (`server/db/migrate-pet-catalog.sql`)
Tương thích **MySQL 5.5/5.6+** (`LONGTEXT`, tối đa 1 `TIMESTAMP` auto, không `USE`, idempotent):

| Cột | Kiểu | Mô tả |
|---|---|---|
| `pet_id` | `VARCHAR(40) PK` | Mã slug duy nhất (`^[a-z][a-z0-9_]{1,31}$`) |
| `name`, `species`, `emoji` | `VARCHAR` | Tên hiển thị, tên loài, emoji dự phòng |
| `element`, `pet_group`, `rarity` | `VARCHAR(24)` | Thuộc 10 hệ, 7 nhóm kỹ năng, 5 độ hiếm trong `shared/game-config.js` |
| `description` | `TEXT` | Mô tả tính cách/vai trò |
| `evolutions_json` | `LONGTEXT` | Mảng 5 cấp `[{stage, name, xp, emoji, image}]` |
| `unlock_json`, `skill_req_json` | `LONGTEXT` | Điều kiện mở khoá & mốc kỹ năng tuỳ chọn |
| `is_custom`, `is_active` | `TINYINT(1)` | `1` = pet tự thêm từ admin (được phép xoá); `0` = metadata sửa đè pet gốc |
| `created_by`, `updated_by`, `created_at`, `updated_at` | Audit | Dấu vết người tạo/sửa |

Script chạy migration: `node scripts/run-pet-catalog-migration.js`.

### 3.2. Danh sách API Backend

| Method & Endpoint | Quyền | Chức năng |
|---|---|---|
| `GET /api/admin/pet-motion/overview` | Admin | Trả ma trận **23 pet gốc + toàn bộ pet tự thêm trong `pet_catalog`** × 5 cấp kèm avatar, rig, clip duyệt |
| `POST /api/admin/pet-motion/pets` | Admin | Tạo loài Pet mới (`is_custom = 1`), validate trùng pet gốc (`409`), hệ/nhóm/độ hiếm hợp lệ |
| `PUT /api/admin/pet-motion/pets/:petId` | Admin | Cập nhật thông tin Pet (cả pet tự thêm lẫn override metadata pet gốc) |
| `DELETE /api/admin/pet-motion/pets/:petId` | Admin | Xoá Pet tự thêm + dọn `pet_rigs`, `pet_motion_clips`, `pet_motion_approvals` và file ảnh trên đĩa (**chặn xoá 23 pet gốc — trả `400`**) |
| `POST /api/admin/pet-motion/:petId/:stage/avatar` | Admin | Upload ảnh tĩnh PNG/WebP (≤ 2 MB, kiểm tra magic bytes) cho từng cấp `1–5` của cả pet gốc & pet mới |
| `GET /api/pet-motion/catalog` | Công khai | Trả danh mục `pet_catalog` (`is_active = 1`) + map `avatars` để app người học hợp nhất vào `PET_REGISTRY` qua `mergeDynamicPetCatalog()` |

### 3.3. Giao diện Quản trị (`/admin/pet-motion`)
- Component mới: **[src/admin/pet-motion/PetFormModal.jsx](../../src/admin/pet-motion/PetFormModal.jsx)** — Popup tạo mới / chỉnh sửa thông tin Pet + khu vực chọn upload trực tiếp 5 ảnh `C1–C5` (có tuỳ chọn tự nén WebP chuẩn `512/640 px` và nhắc quy chuẩn [STD-ART-STYLE-v1.1.md](../05-implementation/art/STD-ART-STYLE-v1.1.md)).
- Trang **[src/admin/pet-motion/PetMotionPage.jsx](../../src/admin/pet-motion/PetMotionPage.jsx)**: nâng cấp tiêu đề thành **"Quản lý Pet · Rig & Động tác"**, bổ sung nút **`+ Thêm Pet mới`**, nút **`✏️ Sửa`** trên từng pet, huy hiệu `Mới` và nút **`🗑️ Xoá`** (có modal xác nhận) cho pet tự thêm; toàn bộ bộ chọn Rig/Motion và `StudyPreviewTab` tự động nhận danh sách pet động.

---

## 4. Kiểm thử & Triển khai Production

- Bộ test tự động mới: `server/tests/pet-management.test.mjs` (5 nhóm test: validation, CRUD + chặn trùng pet gốc, upload avatar pet mới + `/catalog`, sửa + chặn xoá pet gốc + xoá sạch pet tự thêm, kiểm tra SQL MySQL 5.6+).
- Khi triển khai lên Production (`aaPanel`), chạy thêm 1 lệnh migration idempotent:
  ```bash
  cd /www/wwwroot/cowdi.net/server
  node ../scripts/run-pet-catalog-migration.js
  ```
  *(Hoặc import `server/db/migrate-pet-catalog.sql` trong phpMyAdmin. Nếu chưa chạy migration, API vẫn fallback an toàn với 23 pet gốc không gây lỗi 500.)*
