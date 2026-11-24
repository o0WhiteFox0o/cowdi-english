# RAID-LOG — Biểu mẫu Quản trị Rủi ro, Giả định, Vấn đề & Phụ thuộc (RAID Log)

> **Chuẩn:** IEEE 16326:2019 (Risk & Issue Management) · **Phạm vi / Giai đoạn:** GĐ… · **Cập nhật:** YYYY-MM-DD

---

## 1. Rủi ro (Risks — `RK-xxx`)
*Sự kiện **chưa xảy ra**, nhưng nếu xảy ra sẽ ảnh hưởng tiến độ, chi phí, dữ liệu hoặc trải nghiệm.*

| Mã | Mô tả rủi ro | Xác suất (1–5) | Tác động (1–5) | Điểm (P×I) | Kế hoạch phòng ngừa (Mitigation) | Kế hoạch ứng phó (Contingency) | Phụ trách | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| RK-… | | | | | | | | Mở / Đã giảm thiểu / Đóng |

## 2. Vấn đề đang xảy ra (Issues — `IS-xxx`)
*Sự cố **đã xảy ra**, cần xử lý ngay.*

| Mã | Mô tả vấn đề | Mức độ (P0–P3) | Ảnh hưởng | Hướng xử lý | Hạn xong | Phụ trách | Trạng thái |
|---|---|---|---|---|---|---|---|
| IS-… | | | | | | | |

## 3. Giả định (Assumptions — `AS-xxx`)
*Điều kiện được mặc định là đúng khi lập kế hoạch — cần xác nhận sớm.*

| Mã | Giả định | Nếu sai thì sao? | Cách kiểm chứng | Trạng thái |
|---|---|---|---|---|
| AS-… | | | | Chưa xác nhận / Đã xác nhận |

## 4. Phụ thuộc (Dependencies — `DP-xxx`)
*Hạng mục chờ đội khác, họa sĩ, đối tác hoặc giai đoạn trước.*

| Mã | Việc bị phụ thuộc | Phụ thuộc vào ai / cái gì | Hạn cần có | Rủi ro trễ | Trạng thái |
|---|---|---|---|---|---|
| DP-… | | | | | |
