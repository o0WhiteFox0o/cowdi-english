# Cowdi English — Tài liệu dự án (IEEE Documentation Framework)

Cấu trúc thư mục tài liệu được tổ chức theo vòng đời phần mềm **ISO/IEC/IEEE 12207:2017**, mỗi nhóm bám theo một tiêu chuẩn IEEE tương ứng.

| # | Thư mục | Mục đích | Tiêu chuẩn tham chiếu |
|---|---|---|---|
| 00 | [00-general](00-general/) | Tổng quan, kế hoạch tài liệu, thuật ngữ, báo cáo chuẩn | ISO/IEC/IEEE 15289:2019 |
| 01 | [01-project-management](01-project-management/) | Kế hoạch quản lý dự án, chiến lược, rủi ro | IEEE 16326:2019 (SPMP), IEEE 1058 |
| 02 | [02-requirements](02-requirements/) | Đặc tả yêu cầu phần mềm (SRS) | ISO/IEC/IEEE 29148:2018 |
| 03 | [03-architecture](03-architecture/) | Mô tả kiến trúc, bảo mật, quyết định kiến trúc | ISO/IEC/IEEE 42010:2022 |
| 04 | [04-design](04-design/) | Thiết kế chi tiết (SDD), thiết kế tính năng | IEEE 1016-2009 |
| 05 | [05-implementation](05-implementation/) | Hướng dẫn cài đặt, build, coding, tài nguyên | ISO/IEC/IEEE 12207 §6.4.7 |
| 06 | [06-verification-validation](06-verification-validation/) | Kế hoạch kiểm thử, V&V, đánh giá chất lượng | ISO/IEC/IEEE 29119, IEEE 1012, IEEE 730 |
| 07 | [07-deployment-operations](07-deployment-operations/) | Triển khai, vận hành, release notes | IEEE 12207 (Transition/Operation) |
| 08 | [08-reports](08-reports/) | Báo cáo tiến độ, SEO, tổng kết | — |
| 09 | [09-references](09-references/) | Tài liệu nghiên cứu, nguồn tham khảo | IEEE 830 / citation IEEE |
| — | [templates](templates/) | **Mẫu tài liệu chuẩn IEEE** để tạo tài liệu mới | — |
| — | [_archive](_archive/) | Bản trùng lặp / tài liệu lỗi thời | — |

## Cách dùng
1. Cần tài liệu mới → copy mẫu từ [templates](templates/) vào thư mục đúng vòng đời.
2. Đặt tên và đánh version theo [00-general/DOCUMENTATION-PLAN.md](00-general/DOCUMENTATION-PLAN.md).
3. Cập nhật bảng [00-general/DOCUMENT-REGISTER.md](00-general/DOCUMENT-REGISTER.md) và [02-requirements/TRACEABILITY-MATRIX.md](02-requirements/TRACEABILITY-MATRIX.md).