# Hướng dẫn thiết lập Google OAuth + MySQL

## Yêu cầu

- Node.js 18+
- MySQL đang chạy (XAMPP hoặc cài riêng)
- Tài khoản Google (để tạo OAuth credentials)

---

## Bước 1 — Tạo Google OAuth Credentials

1. Vào **[Google Cloud Console](https://console.cloud.google.com)**
2. Tạo project mới (hoặc chọn project có sẵn)
3. Vào **APIs & Services → OAuth consent screen**
   - User Type: **External**
   - App name: `Cowdi English`
   - Điền email → Save
4. Vào **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client IDs**
   - Application type: **Web application**
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3001/auth/google/callback
     ```
5. Nhấn **Create** → copy **Client ID** và **Client Secret**

---

## Bước 2 — Thiết lập Database MySQL

> Đảm bảo MySQL/MariaDB đang chạy. Nếu XAMPP chưa có thư mục `php/`, chỉ cần chạy MySQL riêng — Apache không bắt buộc.

**Chạy từ PowerShell** (KHÔNG chạy bên trong MariaDB monitor):

```powershell
# Dùng mysql.exe của XAMPP (MariaDB)
& "K:\xampp\mysql\bin\mysql.exe" -u root --password="" -e "source K:/WebProjects/Cowdi-React/server/db/schema.sql"

# Hoặc nếu MariaDB cài riêng:
& "C:\Program Files\MariaDB 10.4\bin\mysql.exe" -u root -p -e "source K:/WebProjects/Cowdi-React/server/db/schema.sql"
```

Lệnh này sẽ tạo:
- Database `cowdi_english`
- Bảng `users` (lưu thông tin Google profile)
- Bảng `user_progress` (lưu tiến trình học)

> ⚠️ **Lỗi thường gặp:** Không gõ lệnh này bên trong `MariaDB [(none)]>` monitor. Phải chạy từ PowerShell hoặc Command Prompt.

---

## Bước 3 — Cấu hình Backend

```bash
cd k:\WebProjects\Cowdi-React\server

# Copy file cấu hình mẫu
copy .env.example .env
```

Mở `server/.env` và điền:

```env
GOOGLE_CLIENT_ID=<Client ID lấy từ bước 1>
GOOGLE_CLIENT_SECRET=<Client Secret lấy từ bước 1>
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

JWT_SECRET=<chuỗi ngẫu nhiên dài ≥32 ký tự, ví dụ: mở terminal chạy: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_EXPIRES_IN=7d

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<mật khẩu MySQL của bạn, để trống nếu không có>
DB_NAME=cowdi_english

PORT=3001
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=<chuỗi ngẫu nhiên khác>
```

---

## Bước 4 — Chạy hệ thống

### Terminal 1 — Backend

```bash
cd k:\WebProjects\Cowdi-React\server
npm run dev
```

Kết quả thành công:
```
✅ Database kết nối thành công
🚀 Backend chạy tại http://localhost:3001
```

### Terminal 2 — Frontend

```bash
cd k:\WebProjects\Cowdi-React
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

---

## Bước 5 — Test đăng nhập

1. Vào http://localhost:5173
2. Nhấn nút **Đăng nhập** (góc trên phải)
3. Chọn tài khoản Google
4. Sau khi đồng ý → tự động redirect về trang chủ với tên + avatar hiển thị

---

## Cấu trúc thư mục đã tạo

```
server/
├── index.js              ← Entry point Express
├── package.json
├── .env.example          ← Template cấu hình (KHÔNG chứa secret)
├── .env                  ← Cấu hình thực (tạo từ .env.example, không commit)
├── config/
│   ├── database.js       ← MySQL connection pool
│   └── passport.js       ← Google OAuth Strategy
├── middleware/
│   └── auth.js           ← JWT verification middleware
├── routes/
│   ├── auth.js           ← /auth/google, /auth/google/callback
│   └── api.js            ← /api/me, /api/progress (GET + PUT)
└── db/
    └── schema.sql        ← Tạo database + tables

src/ (frontend – thêm mới)
├── hooks/useAuth.jsx     ← JWT storage + loginWithGoogle + logout
└── pages/AuthCallbackPage.jsx  ← Nhận JWT sau OAuth redirect
```

---

## Luồng đăng nhập

```
User nhấn "Đăng nhập"
    │
    ▼
window.location.href = http://localhost:3001/auth/google
    │
    ▼
Google hiện màn hình chọn tài khoản
    │
    ▼
Google redirect → http://localhost:3001/auth/google/callback?code=xxx
    │
Backend: exchange code → lấy profile → lưu MySQL → tạo JWT
    │
    ▼
Redirect → http://localhost:5173/#/auth-callback?token=JWT
    │
Frontend: lưu JWT vào localStorage → redirect về trang chủ
    │
    ▼
Mọi thay đổi tiến trình học → tự động sync lên /api/progress sau 3 giây
```

---

## Deploy Production

Khi deploy lên server thật (VPS / Railway / Render):

1. Đổi `FRONTEND_URL` thành domain thật: `https://yourdomain.com`
2. Đổi `GOOGLE_CALLBACK_URL` thành: `https://api.yourdomain.com/auth/google/callback`
3. Thêm cả 2 URL trên vào **Authorized redirect URIs** trong Google Console
4. Bật `NODE_ENV=production` (cookie sẽ chỉ gửi qua HTTPS)
5. Dùng HTTPS (bắt buộc – Google OAuth không chấp nhận HTTP trên production)

---

## Troubleshooting

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|---------|
| `❌ Không kết nối được database` | MySQL chưa chạy hoặc sai password | Khởi động MySQL, kiểm tra .env |
| `redirect_uri_mismatch` | URL callback không khớp Google Console | Kiểm tra `GOOGLE_CALLBACK_URL` trong .env |
| `Token hết hạn` | JWT quá 7 ngày | Đăng nhập lại |
| Không thấy nút Đăng nhập | Frontend chưa restart sau khi thêm .env | Restart `npm run dev` |
