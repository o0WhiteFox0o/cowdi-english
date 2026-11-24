# Cowdi English — Hệ thống Tài liệu Chuẩn IEEE

> 📌 **Bảng điều khiển tiến độ (PM):** [01-project-management/LOG-PROGRESS.md](01-project-management/LOG-PROGRESS.md) — trạng thái toàn dự án, quyết định mở, sổ rủi ro (`RK-xxx`).
> ✅ **Checklist triển khai Kinh tế v2:** [../TASK.md](../TASK.md) — chi tiết từng đầu việc GĐ0–GĐ9 & các quyết định đã chốt (`D1–D13`).
> 📚 **Sổ đăng ký tài liệu (Master Index):** [00-general/REG-DOCUMENTS.md](00-general/REG-DOCUMENTS.md) — danh mục kiểm soát toàn bộ tài liệu và phiên bản.
> 🚀 **Sổ tay Deploy Production:** [07-deployment-operations/GDE-DEPLOY-PRODUCTION-v1.0.md](07-deployment-operations/GDE-DEPLOY-PRODUCTION-v1.0.md)

---

## 1. Cấu trúc theo vòng đời ISO/IEC/IEEE 12207:2017

Quy ước đặt tên, đánh mã và kiểm soát phiên bản tuân thủ **ISO/IEC/IEEE 15289:2019** — xem chi tiết tại [DOCP-COWDI-v1.1.md](00-general/DOCP-COWDI-v1.1.md).

| # | Thư mục | Mục đích | Tài liệu trọng yếu hiện hành | Chuẩn IEEE |
|---|---|---|---|---|
| 00 | [00-general](00-general/) | Tổng quan, kế hoạch tài liệu, sổ đăng ký, thuật ngữ | [DOCP v1.1](00-general/DOCP-COWDI-v1.1.md), [REG-DOCUMENTS](00-general/REG-DOCUMENTS.md), [GLO-ECONOMY-BATTLE](00-general/GLO-ECONOMY-BATTLE-VI-EN.md) | ISO/IEC/IEEE 15289, 24765 |
| 01 | [01-project-management](01-project-management/) | Quản trị dự án, tiến độ, cấu hình Git/release, chiến lược | [LOG-PROGRESS](01-project-management/LOG-PROGRESS.md), [SCMP v1.0](01-project-management/SCMP-COWDI-v1.0.md), [QUY-TRINH-KINH-TE-V2](01-project-management/QUY-TRINH-TRIEN-KHAI-KINH-TE-V2.md) | IEEE 16326:2019, IEEE 828 |
| 02 | [02-requirements](02-requirements/) | Đặc tả yêu cầu (SRS), ma trận truy vết (RTM) | [SRS v1.0](02-requirements/SRS-COWDI-v1.0.docx), [RTM-COWDI](02-requirements/RTM-COWDI.md) | ISO/IEC/IEEE 29148:2018 |
| 03 | [03-architecture](03-architecture/) | Kiến trúc, bảo mật, quyết định kiến trúc (ADR) | [RPT-IEEE-NESTJS](03-architecture/RPT-IEEE-NESTJS-2026-09.md), [RPT-SECURITY](03-architecture/RPT-SECURITY-2026-09.md), [adr/](03-architecture/adr/) | ISO/IEC/IEEE 42010:2022 |
| 04 | [04-design](04-design/) | Thiết kế hệ thống, Kinh tế v2.1, ERD, WRD, Pet Motion | [SDD-ECONOMY-BATTLE-v2.1](04-design/SDD-ECONOMY-BATTLE-v2.1.md), [economy-v2/](04-design/economy-v2/), [PET-MOTION](PET-MOTION.md) | IEEE 1016-2009 |
| 05 | [05-implementation](05-implementation/) | Quy chuẩn lập trình, hướng dẫn setup/build/PWA/ảnh pet | [STD-CODING v1.0](05-implementation/STD-CODING-v1.0.md), [GDE-SETUP](05-implementation/GDE-SETUP-v1.0.md), [GDE-PET-IMAGES](05-implementation/GDE-PET-IMAGES-v1.0.md) | ISO/IEC/IEEE 12207, 26514 |
| 06 | [06-verification-validation](06-verification-validation/) | Kế hoạch kiểm thử, báo cáo cân bằng, đánh giá QA | [STP v1.0](06-verification-validation/STP-COWDI-v1.0.md), [BALANCE-REPORT-v2](06-verification-validation/balance-v2/BALANCE-REPORT-v2.md) | ISO/IEC/IEEE 29119, IEEE 1012 |
| 07 | [07-deployment-operations](07-deployment-operations/) | Triển khai production, vận hành, Release Notes | [GDE-DEPLOY-PRODUCTION v1.0](07-deployment-operations/GDE-DEPLOY-PRODUCTION-v1.0.md), [RN-v2.1](07-deployment-operations/RN-v2.1-2026-11-24.md) | ISO/IEC/IEEE 12207 |
| 08 | [08-reports](08-reports/) | Báo cáo tổng kết, roadmap, SEO | [RPT-PROJECT](08-reports/RPT-PROJECT-2026-04-27.md), [RPT-SEO](08-reports/RPT-SEO-2026-09.md) | — |
| 09 | [09-references](09-references/) | Tài liệu nghiên cứu & tham chiếu học thuật | [REF-BRAIN-MEMORY](09-references/REF-BRAIN-MEMORY.md) | IEEE Citation |
| — | [templates](templates/) | **15 biểu mẫu chuẩn IEEE** cho PM, Dev, QA, Ops | [Danh mục biểu mẫu](templates/README.md) | Toàn bộ chuẩn trên |
| — | [_archive](_archive/) | Tài liệu Obsolete & bản cũ lưu trữ đối chiếu | [README](_archive/README.md) | — |

---

## 2. Quy tắc ưu tiên khi tài liệu có khác biệt

1. **`TASK.md` §"Quyết định đã chốt" (`D1–D13`)** — ưu tiên cao nhất cho mọi hằng số/luật Kinh tế v2.
2. **Tài liệu `Approved` có phiên bản mới hơn** trong [REG-DOCUMENTS.md](00-general/REG-DOCUMENTS.md) (vd `SDD-ECONOMY-BATTLE-v2.1.md` thắng `v2.0` và các SDD v1.0).
3. Nếu còn điểm chưa rõ → ghi vào mục **Quyết định cần chốt** trong `LOG-PROGRESS.md` / `TASK.md`, không tự phỏng đoán.

---

## 3. Quy trình 5 bước quản trị tài liệu (bắt buộc cho mọi thay đổi)

1. **Tạo tài liệu mới**: sao chép mẫu từ [templates/](templates/) vào đúng thư mục `00–09`, đặt tên theo [DOCP-COWDI-v1.1 §1](00-general/DOCP-COWDI-v1.1.md) (`<MÃ>-<CHỦ-ĐỀ>-v<M>.<m>.md`, tài liệu sống `<MÃ>-<CHỦ-ĐỀ>.md`, hoặc báo cáo `RPT-<CHỦ-ĐỀ>-<YYYY-MM-DD>.md`).
2. **Đăng ký**: thêm/cập nhật 1 dòng trong [REG-DOCUMENTS.md](00-general/REG-DOCUMENTS.md).
3. **Truy vết yêu cầu**: nếu thay đổi chức năng hoặc luật nghiệp vụ → cập nhật [RTM-COWDI.md](02-requirements/RTM-COWDI.md).
4. **Cập nhật tiến độ**: ghi vào [LOG-PROGRESS.md](01-project-management/LOG-PROGRESS.md) (mức Quản lý) và [TASK.md](../TASK.md) (mức triển khai Kinh tế v2).
5. **Phát hành**: lập [Release Notes](templates/RELEASE-NOTES-TEMPLATE.md) + kiểm tra [Deployment Checklist](templates/DEPLOYMENT-CHECKLIST-TEMPLATE.md) lưu vào `07-deployment-operations/`.
