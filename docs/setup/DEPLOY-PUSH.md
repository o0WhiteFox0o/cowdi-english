# 🚀 Deploy Guide — Push Notification & Background Sync

> **Phiên bản này thay đổi nhiều file** ở cả frontend lẫn backend. Đọc kỹ trước khi deploy.

---

## 📋 Tóm tắt thay đổi

### Frontend (build vào `dist-prod/`)
| File | Loại | Mô tả |
|------|------|-------|
| `vite.config.prod.js` | sửa | Chuyển sang `injectManifest` mode |
| `src/sw.js` | **mới** | Custom Service Worker (push + bg-sync) |
| `src/hooks/usePush.jsx` | **mới** | Hook subscribe/unsubscribe |
| `src/pages/AccountPage.jsx` | sửa | Thêm `PushSettingsCard` |
| `src/App.jsx` | sửa | Lắng nghe message từ SW |
| `package.json` | sửa | Thêm 6 workbox-* dev deps |

### Backend (deploy `server/`)
| File | Loại | Mô tả |
|------|------|-------|
| `server/package.json` | sửa | Thêm `web-push` |
| `server/config/push.js` | **mới** | VAPID + sendPushToUser |
| `server/jobs/reminder.js` | **mới** | Streak reminder (1h/lần) |
| `server/utils/pet-icon.js` | **mới** | Resolver icon pet theo XP |
| `server/scripts/generate-vapid-keys.js` | **mới** | Tạo VAPID keys |
| `server/db/migrate-push.sql` | **mới** | Migration idempotent |
| `server/routes/api.js` | sửa | 4 endpoints + duel push trigger |
| `server/index.js` | sửa | Khởi động reminder job |

### DB schema thay đổi
- **Thêm bảng**: `push_subscriptions`
- **Thêm cột vào `user_progress`**: `push_enabled TINYINT(1)`, `last_reminder_at DATETIME`

---

## 🔧 Bước 1 — Build local

```bash
cd /path/to/cowdi-english
npm install                    # cài 6 workbox packages mới
npm run build:prod
```

**Kết quả mong đợi:**
```
dist-prod/sw.js                ~34 KB  ← custom SW (CHÚ Ý: phải có file này)
dist-prod/manifest.webmanifest
dist-prod/registerSW.js
dist-prod/index.html
dist-prod/assets/*
dist-prod/pwa-192x192.png
dist-prod/pwa-512x512.png
```

**Verify SW có đầy đủ handler:**
```bash
grep -o 'addEventListener("[a-z]*"' dist-prod/sw.js | sort -u
# Phải có: push, notificationclick, sync, message, fetch, install, activate
```

> ❌ Nếu thấy `dist-prod/sw.js` chỉ ~3KB hoặc tên khác (`workbox-*.js`) → vẫn đang dùng `generateSW` mode cũ. Kiểm tra `vite.config.prod.js` có dòng `strategies: 'injectManifest'`.

---

## 🔑 Bước 2 — Tạo VAPID keys (LẦN ĐẦU DUY NHẤT)

VAPID = chìa khoá để server ký push payload. **Phải tạo 1 lần và giữ nguyên** — đổi key sẽ làm mất hết subscription cũ.

### Cách A: Tạo trên local rồi copy lên server

```bash
cd server
npm install                                # cài web-push
node scripts/generate-vapid-keys.js
```

Output mẫu:
```
VAPID_PUBLIC_KEY=BN1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
VAPID_SUBJECT=mailto:admin@cowdi.net
```

### Cách B: Tạo trực tiếp trên server (khuyên dùng cho production)

```bash
ssh root@cowdi.net
cd /www/wwwroot/cowdi.net/server
node scripts/generate-vapid-keys.js >> .env
nano .env                                  # chỉnh format nếu cần
```

**Lưu vào `server/.env`:**
```env
# ... các biến cũ ...
VAPID_PUBLIC_KEY=BN1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
VAPID_SUBJECT=mailto:admin@cowdi.net
```

> ⚠️ **VAPID_PRIVATE_KEY giữ bí mật như JWT secret.** Đừng commit Git, đừng share.
> ⚠️ **VAPID_SUBJECT** phải là URL hợp lệ (`mailto:...` hoặc `https://...`).

---

## 🗄️ Bước 3 — Chạy DB migration

Migration **idempotent** — chạy lại nhiều lần không lỗi.

```bash
ssh root@cowdi.net
cd /www/wwwroot/cowdi.net/server
mysql -u <db_user> -p <db_name> < db/migrate-push.sql
```

**Verify:**
```sql
SHOW TABLES LIKE 'push_subscriptions';
DESCRIBE push_subscriptions;
SHOW COLUMNS FROM user_progress LIKE 'push_%';
SHOW COLUMNS FROM user_progress LIKE 'last_reminder_at';
```

Nên thấy 4 dòng kết quả.

---

## 📦 Bước 4 — Deploy code

### 4.1. Đóng gói (Windows PowerShell)
```powershell
.\deploy.ps1
# Tạo deploy.zip ở root
```

### 4.2. Đóng gói thủ công (macOS/Linux)
```bash
cd /path/to/cowdi-english
npm run build:prod
zip -r deploy.zip dist-prod server nginx-spa.conf -x "server/node_modules/*" "server/.env"
```

### 4.3. Upload lên server
- Qua aaPanel File Manager → upload `deploy.zip` vào `/www/wwwroot/cowdi.net/`
- Hoặc `scp deploy.zip root@cowdi.net:/www/wwwroot/cowdi.net/`

### 4.4. Giải nén & cài deps
```bash
ssh root@cowdi.net
cd /www/wwwroot/cowdi.net/

# Backup .env trước!
cp server/.env /tmp/cowdi-env-backup

# Giải nén (ghi đè)
unzip -o deploy.zip

# Restore .env (deploy.zip không chứa)
cp /tmp/cowdi-env-backup server/.env

# Move dist-prod files lên web root (nếu cần)
# aaPanel mặc định trỏ vào /www/wwwroot/cowdi.net/
# → giữ nguyên dist-prod hoặc copy lên root tuỳ cấu hình Nginx

# Cài web-push (1 lần)
cd server
npm install --production
```

---

## ▶️ Bước 5 — Restart services

```bash
# Restart Node.js backend
pm2 restart cowdi-backend     # hoặc tên app của bạn
pm2 logs cowdi-backend --lines 50
```

**Log phải thấy:**
```
✅ Server running on port 3001
🔔 Push notifications: ENABLED
⏰ Reminder job: started (runs every 1h)
```

> Nếu thấy `🔔 Push notifications: DISABLED (missing VAPID keys)` → `.env` thiếu key, kiểm tra lại Bước 2.

```bash
# Reload Nginx (không cần đổi config nếu đã chuẩn)
nginx -t && nginx -s reload
```

---

## ✅ Bước 6 — Test end-to-end

### 6.1. Test Service Worker mới
```
1. Mở https://cowdi.net trên Chrome (incognito để clear cache cũ)
2. F12 → Application → Service Workers
3. Phải thấy 1 SW duy nhất tại scope "/" với script "sw.js" (KHÔNG phải workbox-*.js)
4. Status: activated and is running
```

> 🔄 **User cũ đã cài PWA**: SW tự update sau ~24h hoặc khi reload. Nếu cần force ngay → Application → Service Workers → "Update" + "Skip waiting".

### 6.2. Test Push Notification
```
1. Đăng nhập → /account
2. Cuộn xuống thẻ "🔔 Thông báo từ {petName}"
3. Bật toggle → Chrome xin quyền → Cho phép
4. Bấm "Gửi thử" → vài giây sau notification hiện ra với icon pet
```

**Verify trong DB:**
```sql
SELECT user_id, LEFT(endpoint, 50) AS ep, created_at 
FROM push_subscriptions 
ORDER BY id DESC LIMIT 5;
```

### 6.3. Test Background Sync
```
1. Đang ở trang Practice với pet
2. F12 → Network → Offline
3. Trả lời 1 câu (trigger PUT /api/progress)
4. Console thấy response 202 { queued: true }
5. Tắt Offline → vài giây sau Console: "[Cowdi] Đã đồng bộ N thay đổi offline"
6. Refresh → data có trong DB
```

### 6.4. Test reminder job (chờ hoặc giả lập)
Giả lập user vắng:
```sql
UPDATE user_progress 
SET last_seen_at = DATE_SUB(NOW(), INTERVAL 20 HOUR),
    push_enabled = 1,
    last_reminder_at = NULL
WHERE user_id = <test_user_id>;
```
Đợi tối đa 1h hoặc restart pm2 (job chạy sau 5 phút khởi động).

---

## 🔥 Rollback nhanh (nếu deploy lỗi)

```bash
ssh root@cowdi.net
cd /www/wwwroot/cowdi.net/

# Khôi phục code cũ từ backup git/zip
# (Bạn nên tag git trước mỗi deploy: git tag pre-push-$(date +%Y%m%d))

# Riêng SW cũ: xoá để browser không cache nhầm
# (User sẽ tự update khi reload)

# DB rollback (nếu cần — KHÔNG bắt buộc, schema mới tương thích ngược):
# DROP TABLE push_subscriptions;
# ALTER TABLE user_progress DROP COLUMN push_enabled, DROP COLUMN last_reminder_at;
```

---

## 🐛 Troubleshooting

| Triệu chứng | Nguyên nhân | Fix |
|-------------|-------------|-----|
| Build fail: `Cannot find module 'workbox-precaching'` | Thiếu dev deps | `npm install` lại ở root |
| Build fail: `Unable to find a place to inject the manifest` | `src/sw.js` thiếu `self.__WB_MANIFEST` | Đã fix sẵn, kiểm tra dòng 21 |
| `dist-prod/sw.js` size <5KB | Còn dùng `generateSW` mode cũ | Check `vite.config.prod.js` có `strategies: 'injectManifest'` |
| Server log: `Push notifications: DISABLED` | VAPID env chưa đủ 3 biến | Check `.env`, restart pm2 |
| Toggle bật xong không có push | SW chưa update / VAPID sai | Hard reload (Ctrl+Shift+R) + check Network tab |
| `404 /api/push/vapid-public-key` | Code backend cũ | Pull mới + `pm2 restart` |
| iOS không hiện toggle xin quyền | Chưa Add to Home Screen | UI tự hướng dẫn — bắt buộc cài về home |
| Reminder không gửi | streak<3, vắng <18h, hoặc đã gửi <20h trước | Check điều kiện trong [server/jobs/reminder.js](server/jobs/reminder.js) |
| `Multiple exports with the same name "default"` khi build | `vite.config.prod.js` bị trùng nội dung | Đã fix, file chỉ còn 73 dòng |

---

## 📊 Checklist deploy

- [ ] `npm install` ở root (frontend deps mới)
- [ ] `npm run build:prod` thành công, có `dist-prod/sw.js` ~34KB
- [ ] VAPID keys đã thêm vào `server/.env`
- [ ] Migration `db/migrate-push.sql` đã chạy
- [ ] `cd server && npm install --production` (cài web-push)
- [ ] Upload `dist-prod/` + `server/` lên server
- [ ] `pm2 restart` backend, log thấy "Push notifications: ENABLED"
- [ ] Nginx reload
- [ ] Test SW trên Chrome incognito (`/account` → bật toggle → gửi thử)
- [ ] Test offline → online (background sync)

---

📚 Xem thêm:
- [PWA-GUIDE.md](PWA-GUIDE.md) — chi tiết kiến trúc PWA
- [BUILD.md](BUILD.md) — hướng dẫn build chung
- [nginx-spa.conf](nginx-spa.conf) — cấu hình reverse proxy
