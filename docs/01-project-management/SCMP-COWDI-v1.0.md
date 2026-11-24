# SCMP-COWDI — Kế hoạch Quản lý Cấu hình Phần mềm (Software Configuration Management Plan)

> **Chuẩn tham chiếu:** IEEE Std 828-2012 (Configuration Management in Systems and Software Engineering) · **Phiên bản:** 1.0 · **Trạng thái:** Approved · **Ngày phê duyệt:** 2026-11-24

## Lịch sử sửa đổi
| Phiên bản | Ngày | Nội dung | Người thực hiện |
|---|---|---|---|
| 0.1 | 2026-11-23 | Khung nháp ban đầu | Claude Code |
| 1.0 | 2026-11-24 | Hoàn thiện đầy đủ quy trình CI/CD, chiến lược nhánh Git, SemVer, kiểm soát thay đổi CCB, chuẩn migration MySQL 5.5/5.6+, chính sách sao lưu `server/storage/` | Production Director / PM |

---

## 1. Mục đích & Phạm vi (Configuration Items — CI)

Tài liệu này quy định cách nhận diện, kiểm soát phiên bản, hợp nhất, đóng gói và sao lưu mọi hạng mục cấu hình (Configuration Items — CI) của **Cowdi English** để đảm bảo nhiều thành viên và trợ lý AI có thể phát triển song song mà không làm hỏng bản production.

### Danh mục hạng mục cấu hình được kiểm soát
| Mã CI | Hạng mục | Vị trí lưu trữ | Công cụ kiểm soát |
|---|---|---|---|
| `CI-FE` | Mã nguồn Frontend React + PWA | `src/`, `public/`, `vite.config*.js` | Git (`main` + `feat/*`) |
| `CI-BE` | Mã nguồn Backend Express API | `server/routes/`, `server/utils/`, `server/middleware/`, `server/jobs/` | Git |
| `CI-SH` | Hằng số cân bằng, Battle Engine, 34 clip PetRig, danh mục bài/unit | `shared/` | Git (nguồn sự thật chung FE+BE) |
| `CI-DB` | Schema & Migration SQL + Migration Runners | `server/db/*.sql`, `scripts/run-v2-*.js` | Git (chỉ thêm mới, **idempotent**) |
| `CI-DOC` | Hệ thống tài liệu chuẩn IEEE & `TASK.md` | `docs/`, `README.md`, `TASK.md` | Git + [REG-DOCUMENTS](../00-general/REG-DOCUMENTS.md) |
| `CI-CFG` | Cấu hình bí mật môi trường | `server/.env` (**ngoài Git**) | Mẫu `server/.env.example`, giữ riêng trên server |
| `CI-AST` | Ảnh bộ phận & emoji pet admin tải lên trên production | `server/storage/pets/` (**ngoài Git**) | Backup định kỳ trên aaPanel, **cấm đưa vào `deploy.zip`** |

---

## 2. Chiến lược nhánh Git & Hợp nhất (Branching & Merging)

### 2.1. Quy ước nhánh
- **`main`**: nhánh tích hợp chính luôn ở trạng thái **sẵn sàng build & phát hành** (`npm test` xanh 100%, `npm run build` xanh).
- **`feat/<tên-giai-đoạn>`**: nhánh tính năng theo từng giai đoạn trong `TASK.md` (vd `feat/cosmetics`, `feat/arena`, `feat/gacha-core-invite`).
- **`fix/<mô-tả-ngắn>`**: nhánh sửa lỗi khẩn cấp (hotfix) tách từ `main`.

### 2.2. Quy tắc Commit (Conventional Commits)
Cú pháp bắt buộc: `<type>(<scope>): <mô tả ngắn>`
- `feat`: tính năng mới (`feat(shop): ...`, `feat(pet-motion): ...`)
- `fix`: sửa lỗi (`fix(wallet): ...`, `fix(db): ...`)
- `docs`: cập nhật tài liệu, `TASK.md`, `LOG-PROGRESS.md`
- `refactor`, `test`, `chore`, `build`

### 2.3. Quy trình Merge (Pull Request / Integration Gate)
Trước khi gộp bất kỳ nhánh `feat/*` nào vào `main`:
1. Kéo mới nhất từ `origin/main` và chạy thử `git merge-tree` / `git merge` để kiểm tra xung đột.
2. Kiểm tra không ghi đè mất tích hợp song song (vd `<PetAvatar>`, router mới trong `server/index.js`, script test trong `package.json`).
3. Bắt buộc pass `npm test` (100%) và `npm run build` (0 lỗi).
4. Kiểm tra các file SQL/script migration mới tuân thủ quy chuẩn MySQL 5.5/5.6+ ở §4.
5. Cập nhật `TASK.md` (cùng commit hoặc commit gộp) và `LOG-PROGRESS.md`.

---

## 3. Đánh phiên bản & Quản lý Baseline (Versioning & Tagging)

Áp dụng **Semantic Versioning (`vMAJOR.MINOR.PATCH`)**:
- **`MAJOR`**: thay đổi lớn về kiến trúc hoặc hệ kinh tế cốt lõi (vd `v2.0.0`).
- **`MINOR`**: hoàn thành một giai đoạn lớn hoặc phân hệ mới (vd `v2.1.0` = Kinh tế v2 GĐ1–3 + Pet Motion; `v2.2.0` = GĐ4 Đồ trang trí).
- **`PATCH`**: sửa lỗi không đổi giao diện/schema lớn (vd `v2.1.1`).

Mỗi bản phát hành lên `https://cowdi.net` **bắt buộc** có:
1. Tag Git tương ứng (khuyến nghị `git tag -a v2.1.0 -m "..."`).
2. Bản ghi [Release Notes](../templates/RELEASE-NOTES-TEMPLATE.md) lưu tại `docs/07-deployment-operations/RN-v<M>.<m>-<YYYY-MM-DD>.md`.
3. Phiếu [Deployment Checklist](../templates/DEPLOYMENT-CHECKLIST-TEMPLATE.md) đã kiểm duyệt.

---

## 4. Quy chuẩn Migration DB & Tương thích Production (Bắt buộc)

Dựa trên kinh nghiệm vận hành thực tế trên server aaPanel (MySQL < 5.6.5):
1. **Idempotent 100%**: mọi file `.sql` và script `scripts/run-*.js` phải chạy lại nhiều lần an toàn (`CREATE TABLE IF NOT EXISTS`, `INSERT IGNORE`, kiểm tra `information_schema.COLUMNS` trước khi `ALTER TABLE`).
2. **Không dùng tính năng MySQL 5.7+ trong SQL**:
   - Dùng `LONGTEXT` thay vì kiểu cột `JSON`.
   - Không dùng hàm `JSON_EXTRACT` / `JSON_VALID` / `JSON_UNQUOTE` trong SQL (nếu cần xử lý JSON, đọc về Node rồi `JSON.parse()`).
   - Mỗi bảng chỉ được có **tối đa 1 cột `TIMESTAMP` với `CURRENT_TIMESTAMP`** (cột còn lại như `created_at` dùng `DATETIME DEFAULT NULL`).
   - Không ghi cứng `USE cowdi_english;` trong file SQL (để import được vào mọi tên DB trên phpMyAdmin).
3. **Không bao giờ xoá/reset dữ liệu người dùng thật** trong migration tự động.
4. **ESM trong `scripts/`**: luôn duy trì `scripts/package.json` (`{"type":"module"}`) và đưa vào gói `deploy.zip`.

---

## 5. Kiểm soát Thay đổi (Change Control — CCB)

| Mức độ thay đổi | Ví dụ | Quy trình phê duyệt |
|---|---|---|
| **Nhỏ (Minor)** | Sửa copy UI, sửa bug nhỏ, thêm test | Dev tự thực hiện trên nhánh, chạy test xanh, ghi nhật ký |
| **Trung bình (Normal)** | Đổi hằng số cân bằng, thêm cột DB, thêm API | Lập phiếu [Change Request](../templates/CHANGE-REQUEST-TEMPLATE.md) → PO (Sonny) duyệt → cập nhật `TASK.md` (mục D#) & `RTM-COWDI.md` |
| **Lớn (Major)** | Đổi kiến trúc, thêm cổng thanh toán, đổi luật chơi cốt lõi | Lập [CR](../templates/CHANGE-REQUEST-TEMPLATE.md) + [ADR](../templates/ADR-TEMPLATE.md) + cập nhật SDD → PO phê duyệt trước khi viết code |

---

## 6. Chính sách Đóng gói & Sao lưu (Backup & Recovery)

1. **Gói `deploy.zip`** chỉ chứa: `dist-prod/*`, `server/` (**loại trừ** `.env`, `storage/`, `node_modules/`, `tests/`), `shared/` (loại trừ `*.test.js`), `scripts/run-v2-*.js`, `scripts/package.json`, `nginx-spa.conf`.
2. **Không commit `server/.env` hay `server/storage/` lên Git**.
3. **Sao lưu bắt buộc trên aaPanel**:
   - **Database `cowdi_english`**: backup tự động hàng ngày + backup thủ công ngay trước mỗi lần deploy có migration.
   - **Thư mục ảnh `server/storage/pets/`**: backup định kỳ hàng ngày/tuần (giữ tối thiểu 7 bản gần nhất) vì chứa toàn bộ ảnh rig & emoji do admin vẽ/tải lên.
