# GDE-DEPLOY-PRODUCTION — Sổ tay Triển khai Production (aaPanel + MySQL)

> **Chuẩn tham chiếu:** ISO/IEC/IEEE 12207 & 26514 · **Phiên bản:** 1.0 · **Trạng thái:** Approved · **Cập nhật:** 2026-11-24
> **Môi trường đích:** `https://cowdi.net` · Thư mục web root: `/www/wwwroot/cowdi.net/` · Backend port: `3001` (Nginx reverse proxy `/api/` & `/auth/`).

## Lịch sử sửa đổi
| Phiên bản | Ngày | Nội dung | Người thực hiện |
|---|---|---|---|
| 1.0 | 2026-11-24 | Chuẩn hoá quy trình build, đóng gói `deploy.zip`, chạy migration an toàn MySQL 5.5/5.6+, rollback và bảng xử lý sự cố thực tế | Production Director / PM |

---

## 1. Kiểm tra trước khi phát hành (Pre-Deploy Gate)

Thực hiện trên máy dev trước khi tạo `deploy.zip` (chi tiết phiếu kiểm duyệt: [DEPLOYMENT-CHECKLIST-TEMPLATE.md](../templates/DEPLOYMENT-CHECKLIST-TEMPLATE.md)):

1. `npm test` → **100% PASS**.
2. `npm run build:prod` → hoàn tất không lỗi, sinh `dist-prod/sw.js`.
3. Kiểm tra `server/.env` trên production **KHÔNG** bật `ENABLE_DEV_LOGIN=true` và `NODE_ENV=production`.
4. **Sao lưu trên aaPanel (BẮT BUỘC)**:
   - **Database**: aaPanel → Databases → `cowdi_english` → **Backup**.
   - **Thư mục ảnh pet**: sao lưu `/www/wwwroot/cowdi.net/server/storage/pets/` định kỳ.

---

## 2. Đóng gói `deploy.zip` chuẩn

### Trên macOS / Linux
```bash
npm run build:prod
rm -rf deploy-package deploy.zip
mkdir -p deploy-package/scripts
cp -R dist-prod/. deploy-package/
cp -R server deploy-package/server
rm -rf deploy-package/server/storage deploy-package/server/node_modules deploy-package/server/.env deploy-package/server/package-lock.json deploy-package/server/tests
cp -R shared deploy-package/shared
rm -f deploy-package/shared/*.test.js
cp scripts/package.json scripts/run-v2-migration.js scripts/run-v2-streak-migration.js scripts/run-v2-cosmetics-migration.js scripts/run-learning-groups-migration.js scripts/run-pet-catalog-migration.js deploy-package/scripts/
cp nginx-spa.conf deploy-package/nginx-spa.conf
(cd deploy-package && zip -rq ../deploy.zip .)
rm -rf deploy-package
```

### Xác minh an toàn gói `deploy.zip` (BẮT BUỘC)
```bash
# Phải trả về RỖNG (không được chứa .env, storage hay node_modules):
unzip -l deploy.zip | grep -E "(server/\.env$|server/storage/|server/node_modules/)"
```

---

## 3. Các bước triển khai trên Server aaPanel

### Bước 1 — Upload & giải nén
1. Mở **aaPanel → Files → `/www/wwwroot/cowdi.net/`**.
2. Upload `deploy.zip` và chọn **Unzip (giải nén đè)** vào `/www/wwwroot/cowdi.net/`.
3. Xoá file `deploy.zip` trên server sau khi giải nén để tránh người ngoài tải nhầm.

### Bước 2 — Cài dependencies & chạy Migration DB (idempotent)
Mở **SSH / Terminal** trên server:
```bash
cd /www/wwwroot/cowdi.net/server
npm install --production

# Chỉ chạy khi bản phát hành có thay đổi DB (an toàn chạy lại nhiều lần):
node ../scripts/run-v2-migration.js
node ../scripts/run-v2-streak-migration.js
node ../scripts/run-v2-cosmetics-migration.js
node ../scripts/run-learning-groups-migration.js
node ../scripts/run-pet-catalog-migration.js

# Nếu lần đầu bật Pet Motion (chỉ cần chạy 1 lần):
# Import server/db/migrate-pet-motion.sql trong phpMyAdmin, rồi:
# node scripts/seed-pet-rigs.mjs
```

### Bước 3 — Khởi động lại Backend
- **Cách A (aaPanel UI — khuyến nghị nếu tạo bằng Node Project / PM2 Manager):**
  Vào **aaPanel → Website → Node project** (hoặc **App Store → PM2 Manager**) → bấm **Restart**.
- **Cách B (PM2 qua SSH):**
  ```bash
  pm2 list
  pm2 restart <tên-hoặc-id-process>
  pm2 logs <tên-hoặc-id-process> --lines 30
  ```
  Log phải hiển thị `✅ Database kết nối thành công` và không có lỗi khởi động.

### Bước 4 — Kiểm tra cấu hình Nginx
Đảm bảo file cấu hình site trong aaPanel giữ nguyên khối `location ^~ /api/` và `location ^~ /auth/` từ [nginx-spa.conf](../../nginx-spa.conf) để các URL ảnh `/api/pet-motion/assets/*.png|*.webp` được chuyển đúng về Node backend thay vì rơi vào rule file tĩnh.

---

## 4. Kiểm tra sau Deploy (Post-Deploy Smoke Test)

1. Mở `https://cowdi.net`, nhấn **Ctrl+Shift+R / Cmd+Shift+R** để làm mới Service Worker PWA.
2. Kiểm tra `/health` (`https://cowdi.net/api/...` hoặc `curl http://localhost:3001/health`).
3. Đăng nhập tài khoản người học: kiểm tra HUD hiện **🥛 Sữa** & **💎 Gem**, vào `/shop` (3 tab) và `/pet` không lỗi console.
4. Đăng nhập tài khoản Admin (`is_admin = 1`): mở `/admin/pet-motion` (thấy 23 loài pet) và `/admin/pet-motion?view=preview` (Tab Xem trước khi học).

---

## 5. Quy trình Rollback khẩn cấp (khi phát hiện lỗi P0)

1. Khôi phục bản backup code cũ trong `/www/wwwroot/cowdi.net/` (giữ nguyên `server/.env` và `server/storage/`).
2. Nếu lỗi liên quan đến schema/dữ liệu DB → khôi phục bản **Backup DB** đã tạo ở Bước 1 trong **aaPanel → Databases**.
3. **Restart** lại tiến trình Node backend.
4. Ghi nhận sự cố bằng mẫu [BUG-REPORT-TEMPLATE.md](../templates/BUG-REPORT-TEMPLATE.md) và cập nhật [LOG-PROGRESS §4](../01-project-management/LOG-PROGRESS.md).

---

## 6. Bảng xử lý các sự cố thực tế hay gặp

| Triệu chứng | Nguyên nhân | Cách xử lý nhanh |
|---|---|---|
| `Cannot GET /api/admin/pet-motion/overview` | Backend chưa restart sau khi giải nén hoặc Nginx chưa proxy `/api/` | Restart Node backend; kiểm tra `location ^~ /api/` trong Nginx |
| `#1064 ... near 'JSON NOT NULL'` khi import SQL | MySQL server < 5.7 không có kiểu `JSON` | Dùng `LONGTEXT` (đã sửa trong `migrate-pet-motion.sql`) |
| `ER_TOO_MUCH_AUTO_TIMESTAMP_COLS` | MySQL < 5.6.5 chỉ cho 1 cột `TIMESTAMP` có `CURRENT_TIMESTAMP` | Dùng `created_at DATETIME DEFAULT NULL` (đã sửa ở `e3f3c36`) |
| `SyntaxError: Cannot use import statement outside a module` khi chạy `scripts/*.js` | Thư mục `scripts/` thiếu `package.json` | Đảm bảo có `scripts/package.json` với `{"type":"module"}` |
| `[PM2][ERROR] Process cowdi-backend not found` | Tiến trình chạy dưới tên khác hoặc quản lý qua aaPanel Node Project | Chạy `pm2 list` để xem tên thật hoặc Restart trực tiếp trong aaPanel UI |
| Giao diện vẫn hiện bản cũ sau khi deploy | Trình duyệt đang cache Service Worker PWA cũ | Nhấn **Ctrl+Shift+R** hoặc Application → Service Workers → Unregister |
