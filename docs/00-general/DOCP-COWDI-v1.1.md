# DOCP-COWDI — Kế hoạch Tài liệu (Documentation Plan)
**Chuẩn:** ISO/IEC/IEEE 15289:2019 · **Phiên bản:** 1.1 · **Trạng thái:** Approved

## Lịch sử sửa đổi
| Phiên bản | Ngày | Nội dung | Người sửa |
|---|---|---|---|
| 1.0 | — | Bản đầu: quy ước `<MÃ>-<TÊN>-v<M>.<m>` | — |
| 1.1 | 2026-11-23 | Thêm 3 loại tên (có version / tài liệu sống / báo cáo theo ngày), bảng mã mở rộng, áp dụng cho toàn bộ `docs/`, thêm nhật ký tiến trình `LOG-PROGRESS` | Claude Code |

## 1. Quy ước đặt tên
Tên file viết **IN HOA, nối bằng gạch ngang**, không dấu, không khoảng trắng. Có 3 dạng:

| Dạng | Mẫu | Dùng cho | Ví dụ |
|---|---|---|---|
| A. Tài liệu có phiên bản | `<MÃ>-<CHỦ-ĐỀ>-v<Major>.<Minor>.<ext>` | Kế hoạch, đặc tả, thiết kế, hướng dẫn | `SDD-ECONOMY-BATTLE-v2.1.md` |
| B. Tài liệu sống | `<MÃ>-<CHỦ-ĐỀ>.<ext>` | Hồ sơ cập nhật liên tục (sổ đăng ký, thuật ngữ, ma trận truy vết, nhật ký) — lịch sử ghi bên trong | `LOG-PROGRESS.md` |
| C. Báo cáo theo thời điểm | `RPT-<CHỦ-ĐỀ>-<YYYY-MM[-DD]>.<ext>` | Báo cáo chụp hiện trạng tại một ngày; không sửa sau khi phát hành | `RPT-PROJECT-2026-04-27.md` |

- `<CHỦ-ĐỀ>` là `COWDI` nếu tài liệu nói về toàn hệ thống; nếu chỉ một tính năng thì ghi tên tính năng (`SDD-INVITE-v1.0.md`).
- Bản PDF/DOCX xuất từ Markdown **trùng tên** với bản `.md`, đặt cùng thư mục.
- `README.md` trong mỗi thư mục là trang mục lục, không phải tài liệu kiểm soát.
- Ảnh/hình: chữ thường, gạch ngang, có version: `images/cowdi-erd-physical-v1.0.png`.
- Mẫu tài liệu: `templates/<MÃ>-TEMPLATE.md`.

## 2. Bảng mã tài liệu
| Mã | Loại tài liệu | Chuẩn | Thư mục |
|---|---|---|---|
| OVW | Tổng quan dự án (Overview) | ISO/IEC/IEEE 15289 | 00 |
| DOCP | Kế hoạch tài liệu (Documentation Plan) | ISO/IEC/IEEE 15289 | 00 |
| REG | Sổ đăng ký / danh mục (Register, Catalog) | ISO/IEC/IEEE 15289 (record) | 00, 05 |
| GLO | Thuật ngữ (Glossary) | ISO/IEC/IEEE 24765 | 00 |
| SPMP | Kế hoạch quản lý dự án | IEEE 16326 | 01 |
| SCMP | Kế hoạch quản lý cấu hình | IEEE 828 | 01 |
| STRAT | Chiến lược sản phẩm / tăng trưởng | — | 01 |
| LOG | Nhật ký tiến trình (Progress Log) | IEEE 16326 §(status reporting) | 01 |
| SRS | Đặc tả yêu cầu phần mềm | ISO/IEC/IEEE 29148 | 02 |
| RTM | Ma trận truy vết yêu cầu | ISO/IEC/IEEE 29148 | 02 |
| SAD | Mô tả kiến trúc phần mềm | ISO/IEC/IEEE 42010 | 03 |
| ADR | Bản ghi quyết định kiến trúc | ISO/IEC/IEEE 42010 | 03/adr |
| SDD | Mô tả thiết kế phần mềm (toàn hệ thống hoặc từng tính năng) | IEEE 1016 | 04 |
| ERD | SDD — góc nhìn dữ liệu (Data view) | IEEE 1016 | 04 |
| WRD | SDD — góc nhìn giao diện/điều hướng | IEEE 1016 | 04 |
| GDE | Hướng dẫn (cài đặt, build, vận hành) | ISO/IEC/IEEE 26514 | 05, 07 |
| STD | Quy chuẩn (coding standard) | ISO/IEC/IEEE 12207 | 05 |
| STP | Kế hoạch kiểm thử | ISO/IEC/IEEE 29119-3 | 06 |
| STR | Báo cáo kiểm thử | ISO/IEC/IEEE 29119-3 | 06 |
| VVP | Kế hoạch V&V | IEEE 1012 | 06 |
| SQAP | Kế hoạch đảm bảo chất lượng | IEEE 730 | 06 |
| RN | Ghi chú phát hành (Release Notes) | — | 07 |
| RPT | Báo cáo (đánh giá, tổng kết, phân tích) | — | 00, 03, 06, 08 |
| REF | Tài liệu tham khảo / nghiên cứu | — | 09 |

## 3. Quản lý phiên bản
- **Major** khi đổi cấu trúc/phạm vi, **Minor** khi bổ sung nội dung. Nâng version → **đổi tên file** và cập nhật [REG-DOCUMENTS.md](REG-DOCUMENTS.md).
- Mỗi tài liệu dạng A có bảng **Lịch sử sửa đổi** ở đầu.
- Trạng thái: `Draft` → `Review` → `Approved` → `Superseded` (còn tham khảo, có bản mới thay) → `Obsolete` (chuyển vào `_archive/obsolete/`).
- Khi hai tài liệu mâu thuẫn, tài liệu có **trạng thái Approved và version mới hơn** thắng; ghi rõ trong REG.

## 4. Định dạng
- Nguồn chính: Markdown (`.md`). Bản phát hành: PDF/DOCX cùng tên, cùng thư mục (`scripts/export-pdf.mjs`).
- Link nội bộ dùng **đường dẫn tương đối** từ chính file đó (ví dụ `../../src/data/pets.js`), không dùng `file:///`.
- Trích dẫn tham khảo kiểu IEEE: `[1] Tác giả, "Tiêu đề," Nguồn, năm.`
- Đánh ID: yêu cầu `FR-xxx`/`NFR-xxx`, thiết kế `DS-xxx`, test `TC-xxx`, rủi ro `RK-xxx`, quyết định `ADR-xxx`.

## 5. Vai trò
| Vai trò | Trách nhiệm |
|---|---|
| Author | Soạn thảo |
| Reviewer | Xem xét chéo |
| Approver | Phê duyệt (Product Owner — Sonny) |

## 6. Quy trình khi thêm / sửa tài liệu
1. Copy mẫu từ [../templates/](../templates/) vào thư mục đúng vòng đời, đặt tên theo §1.
2. Thêm 1 dòng vào [REG-DOCUMENTS.md](REG-DOCUMENTS.md).
3. Nếu có thay đổi tiến độ → ghi vào [../01-project-management/LOG-PROGRESS.md](../01-project-management/LOG-PROGRESS.md).
4. Nếu thêm yêu cầu → cập nhật [../02-requirements/RTM-COWDI.md](../02-requirements/RTM-COWDI.md).
