# Release Notes — Cowdi English v2.1

- **Phiên bản:** `v2.1.0`
- **Ngày phát hành:** 2026-11-24
- **Nhánh / Commit baseline:** `main` @ `a6e87a7` (cùng bản vá migration `e3f3c36`)
- **Môi trường:** Production (`https://cowdi.net`)
- **Trạng thái kiểm thử:** 83/83 unit & integration tests PASS · `npm run build:prod` PASS

---

## 1. Tính năng mới nổi bật

### A. Kinh tế & Chiến đấu v2 (GĐ1 → GĐ3)
- **Hệ thống sổ cái tài nguyên (`wallet_ledger`) trên server**: quản lý minh bạch 4 loại tài nguyên (`milk` Sữa, `gem` Gem, `stone` Đá nguyên tố, `stone_shard` Mảnh đá); chống cộng trùng khi làm lại bài.
- **Loại bỏ hoàn toàn Coins (`D12`)**: quy đổi tự động Coins cũ sang Sữa (`1 coin = 3 Sữa`), cập nhật HUD thành 2 chip gọn gàng (**🥛 Sữa** & **💎 Gem**), bỏ đồ ăn cũ & chuyển nút Mời bạn miễn phí.
- **Chiến đấu & Chỉ số Pet v2**: chỉ số chiến đấu tính theo điểm kỹ năng (`sqrt`), 10 hệ tương khắc, 7 nhóm kỹ năng, 5 độ hiếm, tiến hoá thủ công C1→C5 qua API có transaction, Battle Engine thuần tuý chạy trên server có RNG seed và replay phía client.
- **Cân bằng học thuật (GĐ2)**: mô phỏng 6 kịch bản ma trận pet C3/C5, xuất 6 CSV & [BALANCE-REPORT-v2.md](../06-verification-validation/balance-v2/BALANCE-REPORT-v2.md).
- **Cửa hàng Giữ nhịp & Streak v2 (GĐ3)**: tính streak phía server theo múi giờ người dùng; tự tặng Khăn giữ lửa ở mốc streak 7/30/100 ngày (`D13`); giao diện Shop 3 tab (**Giữ nhịp**, **Trang trí**, **Kho đồ**) với Khăn giữ lửa, Vé quay lại, Khế ước 7 ngày (cọc 300/700/1500 hoàn ×1.5) và Đồng hồ Cowdi (+10% Sữa).

### B. Hệ thống Chỉnh động tác & Rig Pet (`/admin/pet-motion` & `<PetAvatar>`)
- **Kho quản trị 23 loài pet × 5 cấp**: quản lý avatar mặc định, tạo rig từ nhiều ảnh tách lớp, tự tính bbox/ground/eyes/pivot.
- **Bàn chỉnh keyframe 15 kênh** căn ngang 1-1, điều khiển thứ tự lớp `z` (`▲`/`▼`), gắn Emoji biểu cảm (gồm kho Emoji tự thiết kế).
- **Trình vẽ sửa PNG Studio 3 cột** (`PartPaintModal`): đa Layer, 4 công cụ vùng chọn, thước pixel, tham chiếu mờ các bộ phận khác.
- **Quy trình duyệt xuất bản an toàn**: tách biệt bản nháp & bản người học; runtime `<PetAvatar>` trên 6 trang học tập chỉ hiển thị rig & clip đã duyệt.
- **Tab Xem trước khi học (5.8)** (chỉ đọc, dùng chung `PetRig` thật): mô phỏng 3 chế độ (Ở nhà, Quiz 8 câu + mic + đọc mẫu, Trận đấu), thanh Gắn bó 0–1500, Tua nhanh ×10 và Nhật ký sự kiện đánh dấu đỏ các clip chưa duyệt.
- **Gợi ý kích thước ảnh theo thiết kế & Nén WebP tại trình duyệt**: tự đo kích thước ảnh, cảnh báo vượt 2 MB / lệch khung và thu gọn 1 chạm về chuẩn `512px`/`640px` WebP nền trong suốt.

---

## 2. Sửa lỗi quan trọng đã bao gồm

- **`f8baa29` (P0)**: sửa lỗi trắng trang `<BookShell>` (`Cannot read properties of undefined (reading 'toLocaleString')`) với tài khoản mới khi `PUT /api/progress` đồng bộ ví lần đầu.
- **`a8c9860`, `d57f593`, `ea9903b`, `e3f3c36`**: chuẩn hoá 100% migration DB tương thích MySQL 5.5/5.6 (`LONGTEXT`, bỏ `JSON_EXTRACT`, tối đa 1 `TIMESTAMP` auto, guard cột tuỳ chọn `available_xp`/`checkpoint_scores`, thêm `scripts/package.json`).

---

## 3. Thay đổi Database & Yêu cầu vận hành

- **Bảng mới tạo**: `wallet_ledger`, `user_streak_state`, `user_contracts`, `pet_motion_clips`, `pet_motion_approvals`, `pet_rigs`, `pet_motion_history`.
- **Cột mới thêm**: 7 cột snapshot & log trận đấu trong `challenges`, cột `avatar_path` trong `pet_rigs`.
- **Lệnh migration đã chạy thành công trên production**:
  - `server/db/migrate-pet-motion.sql`
  - `scripts/run-v2-migration.js`
  - `scripts/run-v2-streak-migration.js`

---

## 4. Hạn chế biết trước & Kế hoạch v2.2

- **GĐ4 — Đồ trang trí** sẽ mở sau khi Product Owner chốt `DEC-01` (giá đồ Thường/Hiếm bằng Sữa hay Gem).
- Còn mở lỗi nhẹ `RK-001` (URL icon push notification) và `RK-002` (chữ hoa/thường tên ảnh Paddy trên Linux) — xem chi tiết tại [LOG-PROGRESS §4](../01-project-management/LOG-PROGRESS.md).
