# CHECKLIST-DEPLOY-vX.Y — Phiếu Nghiệm thu & Phát hành Production (Go / No-Go)

> **Chuẩn:** ISO/IEC/IEEE 12207 & 29119 · **Phiên bản phát hành:** `vX.Y.Z` · **Commit `main`:** `xxxxxxx`
> **Ngày dự kiến deploy:** YYYY-MM-DD HH:mm · **Người thực hiện:** … · **Người duyệt (PO):** …

---

## 1. Tiêu chí Đóng băng & Kiểm thử (Pre-Deploy Gate)
- [ ] Tất cả nhánh tính năng đã gộp sạch vào `main`, không còn xung đột.
- [ ] `npm test` đạt **100% PASS** (`…/…` test).
- [ ] `npm run build` và `npm run build:prod` hoàn tất không lỗi.
- [ ] Đã kiểm thử local với **tài khoản mới tinh (0 bài)** và **tài khoản cũ có dữ liệu** (0 lỗi console).
- [ ] Mọi file migration SQL / script mới đều **idempotent** và tuân thủ **MySQL 5.5/5.6+** (không cột `JSON`, không `JSON_EXTRACT`, tối đa 1 `TIMESTAMP` auto, không `USE <db>;`).
- [ ] Gói `deploy.zip` đã xác minh **KHÔNG chứa** `server/.env`, `server/storage/`, `server/node_modules/`.
- [ ] Đã lập [Release Notes](RELEASE-NOTES-TEMPLATE.md) lưu vào `docs/07-deployment-operations/`.

## 2. Sao lưu trước khi Deploy (BẮT BUỘC)
- [ ] Đã backup **Database `cowdi_english`** trên aaPanel (ghi tên file backup: `…`).
- [ ] Đã kiểm tra backup thư mục **`server/storage/pets/`** còn nguyên vẹn.
- [ ] Xác nhận `server/.env` trên production có `NODE_ENV=production` và **KHÔNG** bật `ENABLE_DEV_LOGIN`.

## 3. Thực thi trên Server (`/www/wwwroot/cowdi.net/`)
- [ ] Upload & giải nén đè `deploy.zip`; đã xoá file `deploy.zip` sau khi giải nén.
- [ ] Chạy `cd server && npm install --production`.
- [ ] Chạy các migration mới (ghi kết quả): `…`
- [ ] Khởi động lại Backend (PM2 / aaPanel Node Project); log hiển thị `✅ Database kết nối thành công`.

## 4. Kiểm tra sau Deploy (Post-Deploy Smoke Test)
- [ ] `https://cowdi.net` (Ctrl+Shift+R) tải bình thường, HUD Sữa/Gem hiển thị đúng, 0 lỗi console.
- [ ] Luồng học thử 1 bài + đồng bộ `PUT /api/progress` thành công (HTTP 200).
- [ ] Trang `/shop`, `/pet`, `/duel` hoạt động ổn định.
- [ ] Trang `/admin/pet-motion` & `/admin/pet-motion?view=preview` hoạt động bình thường với tài khoản Admin và trả 403 với tài khoản thường.

## 5. Kết luận Phát hành
- **Quyết định:** `[ ] GO — Phát hành thành công` / `[ ] NO-GO — Đã Rollback`
- **Ghi chú / Sự cố phát sinh:** …
