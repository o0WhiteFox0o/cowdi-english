# 🐮 Cowdi English

Ứng dụng học tiếng Anh tương tác dành cho người Việt, xây dựng bằng **React + Vite**, **Bootstrap 5** và **Express backend** với đăng nhập Google OAuth.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap) ![Node](https://img.shields.io/badge/Node.js-22-339933?logo=node.js) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)

---

## Tính năng

| Tính năng | Mô tả |
|---|---|
| 📖 **Bài học tương tác** | 8 bài học từ cơ bản đến nâng cao (chào hỏi, gia đình, màu sắc, ...) |
| 🃏 **Flashcard** | Lật thẻ 3D để học từ vựng, có nút phát âm (Web Speech API) |
| 📋 **Danh sách từ vựng** | Tìm kiếm, lọc và đánh dấu trạng thái từng từ (đã thuộc / đang học) |
| 🎯 **Quiz** | Bài kiểm tra từ vựng, ngữ pháp và nghe hiểu với đồng hồ đếm ngược |
| 🏆 **Hệ thống XP & Cấp độ** | Nhận điểm XP sau mỗi bài, thăng cấp qua các danh hiệu |
| 🔥 **Streak hàng ngày** | Theo dõi chuỗi ngày học liên tiếp trên lịch 28 ngày |
| 🏅 **Thành tích** | Mở khóa huy hiệu khi đạt các mốc học tập |
| 🐮 **Cowdi Chatbot** | Mascot bò đáng yêu hiển thị câu động viên ngẫu nhiên |
| 🔐 **Google OAuth** | Đăng nhập bằng Google, dữ liệu học tập được lưu riêng theo tài khoản |

---

## Công nghệ

### Frontend
- **React 18** + React Router v6 (HashRouter)
- **Vite 5** — build tool
- **Bootstrap 5.3** (CDN) — UI framework
- **Font Awesome 6** — icons
- **Web Speech API** — phát âm tiếng Anh

### Backend (`server/`)
- **Node.js 22** + **Express 4** — REST API
- **Passport.js** (`google-oauth20`) — Google OAuth 2.0
- **JWT** (7 ngày) — xác thực stateless
- **MySQL2** — kết nối MariaDB/MySQL
- **mysql2/promise** với `utf8mb4` để lưu tiếng Việt đúng

---

## Cấu trúc thư mục

```
cowdi-react/
├── src/                          # Frontend React
│   ├── components/
│   │   ├── Navbar.jsx            # Thanh điều hướng (có avatar + logout)
│   │   ├── CowdiChat.jsx         # Floating chat mascot
│   │   └── Toast.jsx             # Thông báo Bootstrap toast
│   ├── pages/
│   │   ├── HomePage.jsx          # Trang chủ
│   │   ├── LessonsPage.jsx       # Danh sách bài học
│   │   ├── LessonDetailPage.jsx  # Chi tiết bài + quiz
│   │   ├── VocabularyPage.jsx    # Flashcard 3D + danh sách từ
│   │   ├── PracticePage.jsx      # Luyện tập quiz
│   │   ├── ProgressPage.jsx      # Tiến trình + thành tích
│   │   └── AuthCallbackPage.jsx  # Nhận JWT từ OAuth callback
│   ├── hooks/
│   │   ├── useAuth.jsx           # JWT context: login/logout/authFetch
│   │   └── useUser.jsx           # XP, streak, wordStatus (per-user localStorage + backend sync)
│   ├── data/
│   │   └── lessons.js            # Dữ liệu bài học, từ vựng, quiz, thành tích
│   └── styles/
│       ├── styles.css            # Biến màu Cowdi + override Bootstrap
│       ├── components.css        # Flashcard 3D, floating chat, lịch streak
│       └── pages.css
├── server/                       # Backend Express
│   ├── index.js                  # Entry point
│   ├── config/
│   │   ├── database.js           # MySQL2 pool (utf8mb4)
│   │   └── passport.js           # Google OAuth strategy
│   ├── middleware/
│   │   └── auth.js               # JWT verify middleware
│   ├── routes/
│   │   ├── auth.js               # /auth/google, /auth/google/callback
│   │   └── api.js                # /api/me, /api/progress
│   └── db/
│       └── schema.sql            # DDL: users + user_progress
├── .env                          # VITE_API_URL (frontend)
├── SETUP.md                      # Hướng dẫn cài đặt chi tiết
└── vite.config.js
```

---

## Cài đặt nhanh

> Xem [SETUP.md](SETUP.md) để biết hướng dẫn chi tiết bao gồm tạo database và cấu hình Google OAuth.

### Yêu cầu
- Node.js 18+
- MySQL / MariaDB (XAMPP hoặc standalone)
- Google Cloud Console project với OAuth 2.0 credentials

### Frontend

```bash
npm install
npm run dev          # http://localhost:5173/cowdi/
npm run build
```

### Backend

```bash
cd server
npm install

# Tạo server/.env (xem server/.env.example)
# Khởi tạo database:
mysql -u root -p cowdi_english < db/schema.sql

# Khởi động (phải dùng --env-file thay vì dotenv vì ESM hoisting):
node --env-file=".env" index.js
```

---

## Biến môi trường

### `server/.env`

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cowdi_english

GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

JWT_SECRET=<random-64-char-string>
SESSION_SECRET=<random-64-char-string>

FRONTEND_URL=http://localhost:5173/cowdi
PORT=3001
```

### `.env` (root — Vite)

```env
VITE_API_URL=http://localhost:3001
```

---

## Màu sắc chủ đề

| Tên | Màu | Mã hex |
|---|---|---|
| Primary (Cowdi Pink) | 🩷 | `#FF6B9D` |
| Primary Dark | 💗 | `#E0527E` |
| Secondary (Teal) | 🩵 | `#4ECDC4` |
| Background | 🟡 | `#FFF8F0` |

---

## Dữ liệu bài học hiện có

| ID | Tên bài | Cấp độ |
|---|---|---|
| `greetings` | Chào hỏi cơ bản | 🌱 Cơ bản |
| `family` | Gia đình | 🌱 Cơ bản |
| `colors` | Màu sắc | 🌱 Cơ bản |
| `numbers` | Số đếm | 🌱 Cơ bản |
| `food` | Đồ ăn & thức uống | 🌿 Trung cấp |
| `body` | Cơ thể người | 🌿 Trung cấp |
| `travel` | Du lịch | 🌳 Nâng cao |
| `business` | Kinh doanh | 🌳 Nâng cao |

---

> Được tạo với ❤️ bởi **Cowdi Team**
