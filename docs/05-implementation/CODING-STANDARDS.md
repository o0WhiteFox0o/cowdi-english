# Quy ước Lập trình (Coding Standards)
**Tham chiếu:** ISO/IEC/IEEE 12207, IEEE 1016

## Cấu trúc mã nguồn
| Thư mục | Vai trò |
|---|---|
| `src/` | Client (React SPA + PWA) |
| `server/routes`, `middleware`, `utils`, `jobs` | API / nghiệp vụ |
| `server/db`, `server/config` | Persistence |
| `scripts/` | Công cụ build/dữ liệu |

## Quy ước
- Đặt tên: component `PascalCase`, hàm/biến `camelCase`, hằng `UPPER_SNAKE`.
- Commit: `type(scope): message` (feat, fix, docs, refactor, test, chore).
- Mỗi tính năng mới: cập nhật SRS (FR), thiết kế (feature design), test case, traceability.