# Kế hoạch Tài liệu (Documentation Plan)
**Chuẩn:** ISO/IEC/IEEE 15289:2019 · **Phiên bản:** 1.0 · **Trạng thái:** Draft

## 1. Quy ước đặt tên
`<MÃ>-<TÊN-NGẮN>-v<Major>.<Minor>.<ext>` — ví dụ `SRS-COWDI-v1.0.md`

| Mã | Loại tài liệu | Chuẩn |
|---|---|---|
| SPMP | Software Project Management Plan | IEEE 16326 |
| SRS | Software Requirements Specification | ISO/IEC/IEEE 29148 |
| SAD | Software Architecture Description | ISO/IEC/IEEE 42010 |
| SDD | Software Design Description | IEEE 1016 |
| STP | Software Test Plan | ISO/IEC/IEEE 29119-3 |
| STR | Software Test Report | ISO/IEC/IEEE 29119-3 |
| VVP | Verification & Validation Plan | IEEE 1012 |
| SQAP | Software Quality Assurance Plan | IEEE 730 |
| SCMP | Software Configuration Management Plan | IEEE 828 |
| RN | Release Notes | — |
| ADR | Architecture Decision Record | 42010 |

## 2. Quản lý phiên bản
- Semantic: **Major** (đổi cấu trúc/phạm vi), **Minor** (bổ sung nội dung). Bản nháp ghi `-draft`.
- Mỗi tài liệu có bảng **Revision History** ở đầu.
- Trạng thái: `Draft` → `Review` → `Approved` → `Obsolete` (chuyển vào `_archive/`).

## 3. Định dạng
- Nguồn chính: Markdown (`.md`). Bản phát hành: PDF/DOCX đặt cùng thư mục.
- Trích dẫn tham khảo theo kiểu IEEE: `[1] Tác giả, "Tiêu đề," Nguồn, năm.`
- Đánh ID: yêu cầu `FR-xxx`/`NFR-xxx`, thiết kế `DS-xxx`, test `TC-xxx`, rủi ro `RK-xxx`, quyết định `ADR-xxx`.

## 4. Vai trò
| Vai trò | Trách nhiệm |
|---|---|
| Author | Soạn thảo |
| Reviewer | Xem xét chéo |
| Approver | Phê duyệt (Product Owner) |