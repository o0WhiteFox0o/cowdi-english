# Cowdi English — Tài liệu dự án (IEEE Documentation Framework)

> 📌 **Theo dõi tiến độ:** [01-project-management/LOG-PROGRESS.md](01-project-management/LOG-PROGRESS.md) — xem đang làm gì, chờ quyết định gì, lỗi nào còn mở.
> 📚 **Danh sách mọi tài liệu:** [00-general/REG-DOCUMENTS.md](00-general/REG-DOCUMENTS.md) (có cột tên file cũ để tra link cũ).
> 🎯 **Thiết kế hiện hành Kinh tế & Chiến đấu:** [04-design/SDD-ECONOMY-BATTLE-v2.1.md](04-design/SDD-ECONOMY-BATTLE-v2.1.md)

Cấu trúc thư mục theo vòng đời phần mềm **ISO/IEC/IEEE 12207:2017**; tên file theo **ISO/IEC/IEEE 15289:2019** ([DOCP-COWDI-v1.1](00-general/DOCP-COWDI-v1.1.md)).

| # | Thư mục | Mục đích | Tiêu chuẩn tham chiếu |
|---|---|---|---|
| 00 | [00-general](00-general/) | Tổng quan, kế hoạch tài liệu, sổ đăng ký, thuật ngữ, báo cáo chuẩn | ISO/IEC/IEEE 15289:2019 |
| 01 | [01-project-management](01-project-management/) | Kế hoạch dự án, **nhật ký tiến trình**, chiến lược, cấu hình | IEEE 16326:2019, IEEE 828 |
| 02 | [02-requirements](02-requirements/) | Đặc tả yêu cầu (SRS), ma trận truy vết | ISO/IEC/IEEE 29148:2018 |
| 03 | [03-architecture](03-architecture/) | Kiến trúc, bảo mật, quyết định kiến trúc (ADR) | ISO/IEC/IEEE 42010:2022 |
| 04 | [04-design](04-design/) | Thiết kế (SDD toàn hệ thống + từng tính năng, ERD, WRD) | IEEE 1016-2009 |
| 05 | [05-implementation](05-implementation/) | Hướng dẫn cài đặt/build/PWA, quy ước code, danh mục ảnh | ISO/IEC/IEEE 12207, 26514 |
| 06 | [06-verification-validation](06-verification-validation/) | Kế hoạch kiểm thử, báo cáo đánh giá | ISO/IEC/IEEE 29119, IEEE 1012, IEEE 730 |
| 07 | [07-deployment-operations](07-deployment-operations/) | Triển khai, vận hành, release notes | ISO/IEC/IEEE 12207 |
| 08 | [08-reports](08-reports/) | Báo cáo tổng kết, roadmap, SEO | — |
| 09 | [09-references](09-references/) | Nghiên cứu, nguồn tham khảo | Trích dẫn kiểu IEEE |
| — | [templates](templates/) | Mẫu tài liệu chuẩn IEEE | — |
| — | [_archive](_archive/) | Bản trùng lặp / tài liệu Obsolete | — |

## Đặt tên file (tóm tắt)
| Dạng | Mẫu | Ví dụ |
|---|---|---|
| Có phiên bản | `<MÃ>-<CHỦ-ĐỀ>-v<M>.<m>.md` | `SDD-INVITE-v1.0.md`, `GDE-BUILD-v1.0.md` |
| Tài liệu sống | `<MÃ>-<CHỦ-ĐỀ>.md` | `LOG-PROGRESS.md`, `REG-DOCUMENTS.md` |
| Báo cáo theo ngày | `RPT-<CHỦ-ĐỀ>-<YYYY-MM[-DD]>.md` | `RPT-PROJECT-2026-04-27.md` |

Bảng mã đầy đủ: [DOCP-COWDI-v1.1 §2](00-general/DOCP-COWDI-v1.1.md).

## Cách dùng
1. Cần tài liệu mới → copy mẫu từ [templates](templates/) vào thư mục đúng vòng đời, đặt tên theo bảng trên.
2. Thêm 1 dòng vào [REG-DOCUMENTS.md](00-general/REG-DOCUMENTS.md).
3. Có tiến triển → ghi vào [LOG-PROGRESS.md](01-project-management/LOG-PROGRESS.md).
4. Thêm yêu cầu → cập nhật [RTM-COWDI.md](02-requirements/RTM-COWDI.md).
