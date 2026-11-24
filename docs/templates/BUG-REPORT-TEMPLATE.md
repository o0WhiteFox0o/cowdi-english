# BUG-XXX — Phiếu Báo cáo Lỗi / Sự cố (Defect & Incident Report)

> **Chuẩn:** ISO/IEC/IEEE 29119-3 (Incident Report) · **Mã lỗi:** `BUG-XXX` · **Ngày phát hiện:** YYYY-MM-DD
> **Mức độ (SLA theo STP §5):** `[ ] P0 Blocker` / `[ ] P1 Critical` / `[ ] P2 Major` / `[ ] P3 Minor`
> **Môi trường:** `[ ] Production (cowdi.net)` / `[ ] Local Dev` · **Phiên bản / Commit:** `…`

---

## 1. Tóm tắt lỗi
*(1–2 câu mô tả ngắn gọn hiện tượng và đối tượng bị ảnh hưởng.)*

## 2. Các bước tái hiện (Steps to Reproduce)
1. Đăng nhập bằng tài khoản (mới / cũ / admin): …
2. Mở đường dẫn: `…`
3. Thực hiện thao tác: …

## 3. Kết quả thực tế vs. Kết quả mong đợi
- **Thực tế (Actual):** …
- **Mong đợi (Expected):** …

## 4. Bằng chứng kỹ thuật (Logs / Screenshots)
- **Console / Network HTTP status:**
  ```text
  (dán thông báo lỗi hoặc stack trace tại đây)
  ```
- **Backend / PM2 / MySQL log (nếu có):**
  ```text
  (dán log backend tại đây)
  ```

## 5. Phân tích nguyên nhân gốc & Khắc phục (Root Cause & Resolution)
- **Nguyên nhân gốc (Root Cause):** …
- **File đã sửa:** …
- **Test hồi quy đã thêm:** …
- **Commit sửa lỗi:** `xxxxxxx` · **Người xử lý:** … · **Trạng thái:** `[ ] Mở` / `[ ] Đang sửa` / `[ ] Đã xác minh & Đóng`
