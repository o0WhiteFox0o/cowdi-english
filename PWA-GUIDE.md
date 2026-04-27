# 📱 HƯỚNG DẪN TRIỂN KHAI & SỬ DỤNG PWA — COWDI ENGLISH

> **Phiên bản:** 27/04/2026
> **Yêu cầu:** HTTPS (cowdi.net đã có SSL), Node.js 18+, aaPanel + Nginx
> **iOS:** Hỗ trợ từ iOS 11.3+ (Service Worker), cài Home Screen từ Safari (không phải Chrome iOS)

---

## 1. DEPLOY LÊN SERVER

### Bước 1 — Sinh PWA icons (chỉ cần làm 1 lần)

```bash
npm run pwa:icons
```

Output:
```
✅ Đã tạo: public/pwa-192x192.png (192×192)
✅ Đã tạo: public/pwa-512x512.png (512×512)
```

> Script sử dụng `sharp` để convert từ `public/assets/images/logo/MiniLogoCowdi.svg`.
> Nếu thay đổi logo, chạy lại lệnh này trước khi build.

---

### Bước 2 — Build production

```bash
npm run build:prod
```

Vite sẽ sinh thêm các file PWA trong `dist-prod/`:

```
dist-prod/
├── sw.js                   ← Service Worker (Workbox)
├── workbox-xxxxxxxx.js     ← Workbox runtime
├── manifest.webmanifest    ← Web App Manifest
├── registerSW.js           ← SW auto-registration
├── pwa-192x192.png         ← Icon Android/iOS
├── pwa-512x512.png         ← Icon splash screen
└── assets/...
```

---

### Bước 3 — Upload lên aaPanel

**Windows (PowerShell):**
```powershell
./deploy.ps1
```

**Thủ công qua SSH:**
```bash
# Upload dist-prod/ lên server (thay thế toàn bộ)
scp -r dist-prod/* user@cowdi.net:/www/wwwroot/cowdi.net/

# Restart backend
ssh user@cowdi.net "pm2 restart cowdi-backend"
```

---

### Bước 4 — Cấu hình Nginx ⚠️ Quan trọng

Thêm 2 block sau vào `nginx-spa.conf` (trước block `location /`):

```nginx
# Service Worker — KHÔNG được cache, phải luôn fetch mới nhất
location = /sw.js {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Service-Worker-Allowed "/";
    try_files $uri =404;
}

# Web App Manifest
location = /manifest.webmanifest {
    add_header Cache-Control "no-cache";
    types { application/manifest+json webmanifest; }
    try_files $uri =404;
}
```

> ⚠️ **Bắt buộc:** Nếu thiếu `no-cache` cho `sw.js`, browser cache SW cũ → user không nhận bản update mới sau khi deploy.

Reload Nginx:
```bash
nginx -s reload
# hoặc qua aaPanel: Website → Setting → Reload
```

---

### Bước 5 — Xác nhận HTTPS

PWA **chỉ hoạt động trên HTTPS**. `cowdi.net` đã có SSL từ aaPanel → không cần thêm gì.

Kiểm tra: truy cập `https://cowdi.net` → không có cảnh báo bảo mật.

---

## 2. KIỂM TRA PWA HOẠT ĐỘNG

### Chrome DevTools (F12 → Application)

| Mục kiểm tra | Kết quả mong đợi |
|---|---|
| **Manifest** | Tên "Cowdi English", icons 192/512 hiển thị đúng, theme color #FF6B9D |
| **Service Workers** | Status: `activated and is running` |
| **Cache Storage** | Có `cowdi-api-cache`, `google-fonts-stylesheets`, `cdn-cache` |
| **Offline test** | Tick ☑ "Offline" → reload → app vẫn load bình thường |

### Lighthouse Audit

```
F12 → Lighthouse tab → chọn "Progressive Web App" → Analyze page
```

Mục tiêu: **PWA badge màu xanh** (tất cả tiêu chí passed).

---

## 3. CÀI ĐẶT NHƯ APP TRÊN ĐIỆN THOẠI

### Android — Chrome

1. Vào `https://cowdi.net` trên Chrome
2. Banner **"Cài Cowdi như app"** 🐮 tự xuất hiện ở dưới màn hình
3. Nhấn **"Cài đặt"** → confirm
4. Icon Cowdi xuất hiện trên màn hình chính
5. Mở app → full-screen, không có thanh địa chỉ trình duyệt

Hoặc thủ công: menu Chrome (⋮) → **"Add to Home Screen"**

---

### iOS — Safari (iPhone / iPad)

> ⚠️ **Phải dùng Safari**, không phải Chrome iOS.
> Tất cả browser trên iOS (Chrome, Firefox, Edge) đều dùng WebKit engine của Apple → chỉ Safari mới cài được PWA.

1. Mở `https://cowdi.net` trên **Safari**
2. Banner hướng dẫn xuất hiện sau ~30 giây (component `PWAInstallPrompt`)
3. Nhấn nút **Share** (biểu tượng ô vuông + mũi tên ↑) ở thanh dưới
4. Cuộn xuống → chọn **"Add to Home Screen"**
5. Đặt tên (mặc định: "Cowdi") → nhấn **"Add"**
6. Icon Cowdi xuất hiện trên Home Screen
7. Mở app → full-screen, không có thanh Safari

#### Tính năng PWA trên iOS

| Tính năng | iOS 16.4+ | Ghi chú |
|---|---|---|
| Cài Home Screen | ✅ | Safari |
| Full-screen standalone | ✅ | |
| Service Worker / Offline | ✅ | Từ iOS 11.3 |
| Web Manifest (icon, name, theme) | ✅ | |
| `apple-touch-icon` | ✅ | Đã có trong `index.html` |
| Shortcuts trong manifest | ✅ | iOS 16+ |
| **Push Notification** | ⚠️ | iOS 16.4+ và chỉ khi đã cài lên Home Screen, chưa ổn định |
| `beforeinstallprompt` event | ❌ | Safari không fire — banner phải hướng dẫn thủ công |
| Background sync | ❌ | Không hỗ trợ |

> **Fallback cho Push Notification iOS:** Dùng email khi streak sắp đứt hoặc có duel invite — sẽ triển khai ở Phase B.

---

### Desktop — Chrome / Edge

- Thanh địa chỉ → icon ⊕ góc phải → "Install Cowdi English"
- Hoặc: menu Chrome (⋮) → "Save and share" → "Install page as app"

---

## 4. OFFLINE HOẠT ĐỘNG NHƯ THẾ NÀO

### Những gì hoạt động được offline

| Tính năng | Offline | Ghi chú |
|---|---|---|
| Mở app | ✅ | Precache toàn bộ JS/CSS/HTML |
| Trang `/practice` | ✅ | Quiz từ JS bundle, không cần API |
| Trang `/vocabulary` | ✅ | Data nhúng trong bundle |
| Trang `/lessons` | ✅ | Data nhúng trong bundle |
| Xem progress cũ | ✅ | `StaleWhileRevalidate` — trả cache (max 1h) |
| Xem pet data cũ | ✅ | `StaleWhileRevalidate` — trả cache (max 1h) |
| Xem leaderboard cũ | ✅ | `NetworkFirst` — trả cache nếu timeout >5s |
| Google Fonts | ✅ | `CacheFirst` 365 ngày |
| Bootstrap CDN | ✅ | `CacheFirst` 30 ngày |

### Những gì cần kết nối mạng

| Tính năng | Cần mạng | Lý do |
|---|---|---|
| Lưu progress mới | ✅ | PUT /api/progress |
| Tạo / tham gia Duel | ✅ | POST /api/duel |
| Leaderboard real-time | ✅ | GET /api/leaderboard (quá cache) |
| Đăng nhập Google | ✅ | OAuth flow |

> **Lưu ý:** Khi có mạng trở lại, SW tự sync và refresh cache ở background. User không cần làm gì.

---

## 5. CẬP NHẬT APP (Auto Update)

`registerType: 'autoUpdate'` đã được cấu hình trong [vite.config.prod.js](vite.config.prod.js).

**Luồng tự động:**
```
Deploy version mới lên server
  ↓
SW detect file sw.js thay đổi (nhờ Nginx no-cache header)
  ↓
SW tải về version mới ở background (user không hay biết)
  ↓
Lần reload tiếp theo → version mới được áp dụng tự động
```

**Tùy chọn: Hiện thông báo "Có cập nhật"** — thêm vào [src/main.jsx](src/main.jsx):

```js
import { registerSW } from 'virtual:pwa-register';

registerSW({
  onNeedRefresh() {
    // Gọi toast để thông báo user
    console.log('Có phiên bản mới, tải lại trang để cập nhật!');
  },
  onOfflineReady() {
    console.log('Cowdi đã sẵn sàng hoạt động offline!');
  },
});
```

---

## 6. CẤU TRÚC FILES PWA

```
cowdi-english/
├── public/
│   ├── pwa-192x192.png         ← Icon cài đặt (sinh bởi pwa:icons)
│   └── pwa-512x512.png         ← Icon splash / maskable
├── scripts/
│   └── generate-pwa-icons.mjs  ← Script sinh icon từ SVG
├── src/
│   └── components/
│       └── PWAInstallPrompt.jsx ← Banner "Cài đặt app"
├── index.html                  ← Meta PWA: theme-color, apple-touch-icon, OG
└── vite.config.prod.js         ← VitePWA plugin config (Workbox)
```

---

## 7. TROUBLESHOOTING

| Vấn đề | Nguyên nhân | Cách fix |
|---|---|---|
| Banner cài đặt không hiện (Android) | Chạy trên `http://` | Phải HTTPS |
| iOS không có banner tự động | Safari không fire `beforeinstallprompt` | Banner hiện sau 30s, hướng dẫn Share → Add to Home Screen |
| iOS dùng Chrome/Firefox không cài được | Tất cả browser iOS dùng WebKit | Phải dùng Safari |
| App không update sau deploy | `sw.js` bị Nginx cache | Thêm `no-cache` header (xem §1 bước 4) |
| PWA install không có trên desktop | Chưa đủ Lighthouse criteria | Chạy audit, sửa theo gợi ý |
| Cache cũ sau deploy khẩn | SW chưa activate ngay | DevTools → Application → Service Workers → "Skip waiting" |
| Offline không load | SW chưa activate lần đầu | Phải online lần đầu để SW cài đặt |
| `manifest.webmanifest` 404 | Nginx không phục vụ đúng MIME | Thêm block `location = /manifest.webmanifest` trước `location /` |
| Web trắng sau khi thêm config Nginx | `location /` có cả `try_files` lẫn `return 301` | Xoá `return 301` trong block HTTPS, xem [nginx-spa.conf](nginx-spa.conf) |
| Google OAuth callback lỗi 404 | Nginx proxy `/auth/` có trailing slash | Đổi thành `/auth` (không có `/`), xem [nginx-spa.conf](nginx-spa.conf) |
| Push notification iOS không nhận | iOS cần cài Home Screen trước | Đảm bảo user đã Add to Home Screen, iOS 16.4+ |

---

## 8. KIỂM TRA NHANH SAU MỖI DEPLOY

```bash
# 1. Build
npm run build:prod

# 2. Kiểm tra output
ls dist-prod/sw.js dist-prod/manifest.webmanifest dist-prod/pwa-192x192.png

# 3. Verify manifest content
cat dist-prod/manifest.webmanifest

# 4. Verify SW precache list (đầu file sw.js)
head -5 dist-prod/sw.js
```

---

---

## 9. SO SÁNH TRẢI NGHIỆM iOS vs ANDROID

| Tiêu chí | Android Chrome | iOS Safari | Ghi chú |
|---|---|---|---|
| Cài App | ✅ Banner tự động | ✅ Thủ công (Share) | iOS không có auto-prompt |
| Offline | ✅ | ✅ | Như nhau |
| Full-screen | ✅ | ✅ | Như nhau |
| Icon Home Screen | ✅ | ✅ | `apple-touch-icon` đã có |
| Splash screen | ✅ | ✅ | Dùng `background_color` #FFF8F0 |
| Push Notification | ✅ | ⚠️ iOS 16.4+ không ổn định | Fallback email cho iOS |
| Background sync | ✅ | ❌ | Không critical với Cowdi |
| **Tổng thể** | **100%** | **~85%** | Đủ dùng tốt |

> Điểm thiếu duy nhất quan trọng với Cowdi là Push Notification trên iOS. Giải pháp tạm: email reminder khi streak sắp đứt (triển khai Phase B).

---

## 10. Push Notification & Background Sync (đã triển khai)

### 10.1. Tóm tắt

Cowdi đã chuyển PWA sang chế độ **`injectManifest`** với Service Worker tuỳ biến tại `src/sw.js`, hỗ trợ:

- 🔔 **Web Push Notification** với VAPID — gửi nhắc học có hình **pet** (ấp/baby/junior/super/legendary tự đổi theo XP).
- 📶 **Background Sync** — các request `POST/PUT/PATCH/DELETE` đến `/api/progress`, `/api/word-status`, `/api/pet-data`, `/api/my-stats`, `/api/skill-xp` khi mất mạng sẽ vào queue `cowdi-write-queue` và auto retry trong 24h.
- 🐾 **Streak reminder job** trên server — mỗi giờ quét user có `push_enabled=1`, streak ≥ 3, không hoạt động 18-26h, gửi push từ pet.
- ⚔️ **Duel notification** — khi đối thủ hoàn thành duel, người tạo thách đấu nhận push kèm icon pet của họ.

### 10.2. Cài đặt server lần đầu

```bash
cd server
npm install                  # cài web-push (đã có trong package.json)

# 1. Tạo VAPID keys (1 lần duy nhất)
node scripts/generate-vapid-keys.js

# 2. Copy 3 dòng output vào server/.env
#    VAPID_PUBLIC_KEY=...
#    VAPID_PRIVATE_KEY=...
#    VAPID_SUBJECT=mailto:admin@cowdi.net

# 3. Chạy migration (idempotent — chạy nhiều lần OK)
mysql -u <user> -p <db> < db/migrate-push.sql

# 4. Restart server
pm2 restart cowdi-api
```

> ⚠️ **VAPID keys phải giữ bí mật** giống JWT secret. Không commit vào Git.

### 10.3. Frontend đã sẵn sàng

- `src/hooks/usePush.jsx` — hook `subscribe / unsubscribe / sendTest`.
- `src/pages/AccountPage.jsx` — thẻ "🔔 Thông báo từ {Pet}" với toggle on/off và nút **Gửi thử**.
- `src/sw.js` — SW xử lý sự kiện `push`, `notificationclick`, `message`.

User flow:

1. Đăng nhập → vào `/account`.
2. Bật toggle **"Thông báo từ Pet"** → trình duyệt xin quyền → user "Cho phép".
3. Endpoint subscription được lưu vào bảng `push_subscriptions`.
4. Bấm **Gửi thử** để thấy notification tức thời (kèm icon pet hiện tại).
5. Khi user vắng mặt 18-26h và còn streak → reminder job gửi push từ pet.

### 10.4. Bảng `push_subscriptions`

```sql
CREATE TABLE push_subscriptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth_key VARCHAR(255) NOT NULL,
  user_agent VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used DATETIME,
  UNIQUE KEY uk_endpoint (endpoint(255)),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

`user_progress` thêm 2 cột:
- `push_enabled TINYINT(1) DEFAULT 0` — flag nhanh để query reminder.
- `last_reminder_at DATETIME` — chống spam (≥ 20h mới gửi lại).

### 10.5. API endpoints

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET    | `/api/push/vapid-public-key` | — | Trả `{ publicKey }` cho client subscribe |
| POST   | `/api/push/subscribe` | ✅ | Upsert subscription, set `push_enabled=1` |
| DELETE | `/api/push/subscribe` | ✅ | Xoá subscription (theo endpoint hoặc tất cả) |
| POST   | `/api/push/test` | ✅ | Gửi notification thử kèm icon pet |

Server tự **xoá subscription hết hạn** (HTTP 404/410) khi push fail — tránh queue rác.

### 10.6. Background Sync logic

`src/sw.js` đăng ký route handler cho method `POST/PUT/PATCH/DELETE` đến các endpoint write API. Khi `fetch` ném lỗi network:

1. Request vào `cowdi-write-queue` (Workbox IndexedDB queue).
2. Service Worker trả response giả `202 { queued: true }` để app không crash.
3. Khi browser lấy lại mạng (`sync` event) → queue tự retry tuần tự.
4. Sync xong → SW gửi message `BG_SYNC_DONE` lên các tab đang mở (xem console).

### 10.7. Test Push trên Android (Chrome)

```
1. npm run build:prod && rsync dist-prod/ → server
2. Mở https://cowdi.net trên Chrome Android
3. Cài về home screen
4. Vào Tài khoản → bật toggle "Thông báo từ Pet"
5. Bấm "Gửi thử" → nhận notification trong vài giây
```

### 10.8. Test trên iOS

iOS yêu cầu **app phải mở từ icon home** (standalone) trước khi xin quyền:

```
1. Safari iOS 16.4+ → Share → "Thêm vào Màn hình chính"
2. Mở app từ icon vừa thêm (KHÔNG mở từ Safari)
3. Vào Tài khoản → toggle hiện bình thường (UI tự ẩn ở Safari tab)
4. Bật toggle → iOS xin quyền → Cho phép
```

### 10.9. Troubleshooting

| Triệu chứng | Nguyên nhân | Fix |
|-------------|-------------|-----|
| Toggle bật xong mà không có push | VAPID chưa cấu hình | Check `server/.env` + restart |
| `Server chưa cấu hình VAPID` | `isPushReady()` false | Chạy `generate-vapid-keys.js` |
| `404 /api/push/vapid-public-key` | Server chưa deploy code mới | Pull + `pm2 restart` |
| Notification không có icon pet | User chưa có active pet | Fallback dùng `/pwa-192x192.png` |
| Đã subscribe nhưng không nhận reminder | Streak < 3 hoặc đã hoạt động <18h | Đợi điều kiện, hoặc dùng `/api/push/test` |
| iOS không thấy permission prompt | Chưa cài về home screen | Bắt buộc bước "Add to Home Screen" |

### 10.10. Cấu trúc file

```
server/
  config/push.js              # VAPID setup + sendPushToUser helper
  jobs/reminder.js            # setInterval 1h — streak reminder
  utils/pet-icon.js           # pickPetIcon(pet_data) → icon URL
  scripts/generate-vapid-keys.js
  db/migrate-push.sql
  routes/api.js               # 4 push endpoints + duel push trigger

src/
  sw.js                       # Custom Service Worker (precache + bg-sync + push)
  hooks/usePush.jsx           # React hook
  pages/AccountPage.jsx       # PushSettingsCard component
```

---

*Tài liệu lập bởi: GitHub Copilot · Phiên bản: 2026-04-27 (cập nhật: iOS support, Nginx troubleshooting)*
