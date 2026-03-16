# 🐮 Cowdi English

Ứng dụng học tiếng Anh tương tác dành cho người Việt, xây dựng bằng **React + Vite**, **Bootstrap 5** và **Express backend** với đăng nhập Google OAuth.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap) ![Node](https://img.shields.io/badge/Node.js-22-339933?logo=node.js) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)

---

## Số liệu hiện tại

| Hạng mục | Số liệu |
|---|---|
| Bài học | 21 bài (210+ từ vựng) |
| Unit (Lộ trình) | 5 unit, checkpoint test |
| Ngân hàng câu hỏi | ~500 câu (vocab, grammar, listening, sentences) |
| Dạng bài tập | 9 loại (MCQ, dictation, matching, fill-in, reorder, mixed...) |
| Pet | 15 con, 5 giai đoạn tiến hóa, 4 kỹ năng, 4 nhu cầu |
| Shop | 26 items (hats, outfits, rooms, effects, food) |
| Mini-games | 2 (Bắt từ, Ghép câu) |
| Thành tích | 18 (10 user + 8 pet) |
| Level | 8 cấp (0 → 2500 XP) |
| Trang | 17 trang |
| API endpoints | 14 |

---

## Tính năng

### 📖 Học tập
| Tính năng | Mô tả |
|---|---|
| 📖 **21 Bài học** | Từ cơ bản đến nâng cao: chào hỏi, gia đình, màu sắc, số đếm, thói quen, đồ ăn, du lịch, thì, trường học, thời tiết, nghề nghiệp, cơ thể, quần áo, nhà cửa, cảm xúc, sở thích, thiên nhiên, công nghệ, mua sắm, sức khỏe, so sánh |
| 🃏 **Flashcard 3D** | Lật thẻ 3D, nút phát âm (Web Speech API normal + slow) |
| 🎯 **9 dạng bài tập** | Vocabulary, Grammar, Listening, Sentences, Dictation, Matching, Fill-in-blank, Sentence Reorder, Mixed |
| 🧠 **SRS (Spaced Repetition)** | Thuật toán SM-2: ôn tập thông minh theo chu kỳ 1→3→7→14 ngày |
| 🗺️ **Learning Path** | 5 unit lộ trình, checkpoint test (≥70% mới mở unit tiếp) |
| 📋 **Từ vựng** | Tìm kiếm, lọc, đánh dấu trạng thái (mới/đang học/đã thuộc) |

### 🐾 Hệ thống Pet (Tamagotchi)
| Tính năng | Mô tả |
|---|---|
| 🐮 **15 Pet** | Cowdi, Foxie, Pingu, Leafy, Sparky, Mimi, Owlbert, Flippy, Leo, Bamboo, Storm, Shadow, Prisma, Draco, Pumpkin |
| ⚡ **Tiến hóa 5 giai đoạn** | Trứng → Baby → Junior → Adult → Legendary (theo XP) |
| 📊 **4 Kỹ năng** | Speech, Intelligence, Perception, Creativity (tăng qua quiz) |
| 💗 **4 Nhu cầu** | Năng lượng, Vui vẻ, Sức khỏe, Kiến thức (decay theo thời gian) |
| 🛍️ **Shop 26 items** | Hats, Outfits, Rooms, Effects, Food — trang trí & chăm sóc pet |
| 📦 **Bộ sưu tập** | Grid 15 pet với điều kiện mở khóa |

### ⚔️ Social Features
| Tính năng | Mô tả |
|---|---|
| ⚔️ **Pet Duel Quiz** | Thách đấu async — tạo 10 câu quiz, đối thủ chấp nhận, server chấm điểm chống gian lận |
| 🏅 **League System** | 5 hạng: Đồng → Bạc → Vàng → Kim cương → Cao thủ (League Points) |
| 📊 **Xếp hạng học tập** | Bảng xếp hạng theo 6 tiêu chí: XP, Streak, Bài học, Từ vựng, Quiz, Thành tích |
| 🏆 **Bảng xếp hạng Pet** | 4 tab: Sức mạnh, Kỹ năng, Bộ sưu tập, Giải đấu (League) |
| 💰 **Win/Loss record** | Thống kê thắng/thua/streak, lịch sử đấu |

### 🎮 Gamification
| Tính năng | Mô tả |
|---|---|
| ⭐ **XP & 8 Levels** | Từ "Người mới bắt đầu" đến "Huyền thoại Cowdi" |
| 🔥 **Streak** | Chuỗi ngày học + lịch 28 ngày |
| 🏅 **18 Thành tích** | 10 user + 8 pet — tự động check |
| 📋 **Daily Quests** | 3 nhiệm vụ/ngày + bonus hoàn thành tất cả |
| 🎮 **2 Mini-games** | Word Catch (bắt từ) + Sentence Puzzle (ghép câu) |
| 🪙 **Coins Economy** | Nhiều nguồn thu — dùng mua shop items |

### 🔐 Hệ thống
| Tính năng | Mô tả |
|---|---|
| 🔐 **Google OAuth + JWT** | Đăng nhập Google, cloud sync dữ liệu |
| 💾 **Sync** | localStorage + debounced PUT lên server (3s) |
| 🔊 **Sound Effects** | Web Audio API (correct/wrong/celebration) |
| 🗣️ **TTS** | Web Speech API (normal + slow speed) |
| 🎉 **Confetti** | Animation khi hoàn thành quiz |
| 📱 **Responsive** | Bootstrap 5 + custom CSS |

---

## Công nghệ

### Frontend
- **React 18** + React Router v6
- **Vite 5** — build tool (dev + prod configs)
- **Bootstrap 5.3** (CDN) — UI framework
- **Font Awesome 6** — icons
- **Web Speech API** — TTS phát âm tiếng Anh

### Backend (`server/`)
- **Node.js 22** + **Express 4** — REST API (14 endpoints)
- **Passport.js** (`google-oauth20`) — Google OAuth 2.0
- **JWT** (7 ngày) — xác thực stateless
- **MySQL2/promise** — kết nối MySQL/MariaDB với `utf8mb4`

---

## Cấu trúc thư mục

```
cowdi-english/
├── src/                          # Frontend React
│   ├── components/
│   │   ├── Navbar.jsx            # Thanh điều hướng (13 links + auth)
│   │   ├── CowdiChat.jsx         # Floating chat mascot
│   │   └── Toast.jsx             # Hệ thống thông báo toast
│   ├── pages/                    # 17 trang
│   │   ├── HomePage.jsx          # Trang chủ
│   │   ├── LessonsPage.jsx       # Danh sách 21 bài học
│   │   ├── LessonDetailPage.jsx  # Chi tiết bài + quiz + flashcard
│   │   ├── VocabularyPage.jsx    # Flashcard 3D + danh sách từ
│   │   ├── PracticePage.jsx      # 9 dạng bài tập quiz
│   │   ├── ReviewPage.jsx        # Ôn tập SRS (SM-2)
│   │   ├── LearningPathPage.jsx  # Lộ trình 5 unit + checkpoint
│   │   ├── ProgressPage.jsx      # Tiến trình + thành tích
│   │   ├── PetPage.jsx           # Chăm sóc pet + daily quests
│   │   ├── CollectionPage.jsx    # Bộ sưu tập 15 pet
│   │   ├── ShopPage.jsx          # Shop 26 items
│   │   ├── DuelPage.jsx          # ⚔️ Đấu trường Pet Duel
│   │   ├── LeaderboardPage.jsx   # 🏆 Bảng xếp hạng pet (4 tab)
│   │   ├── StudentRankingPage.jsx # 📊 Xếp hạng học tập (6 tiêu chí)
│   │   ├── MiniGamePage.jsx      # 2 mini-games
│   │   ├── AccountPage.jsx       # Tài khoản + settings
│   │   └── AuthCallbackPage.jsx  # OAuth callback
│   ├── hooks/
│   │   ├── useAuth.jsx           # JWT context: login/logout/authFetch
│   │   ├── useUser.jsx           # XP, streak, SRS, checkpoint (localStorage + sync)
│   │   └── usePet.jsx            # Pet system: collection, skills, needs, coins
│   ├── data/
│   │   ├── lessons.js            # 21 bài, 500 quiz, units, achievements, levels
│   │   ├── pets.js               # 15 pet, 26 shop items, quests, power score
│   │   └── quiz-bank-extra.js    # ~445 câu hỏi bổ sung
│   └── styles/
│       ├── styles.css            # Biến màu Cowdi + Bootstrap override
│       ├── components.css        # Flashcard 3D, floating chat, streak calendar
│       ├── pages.css             # Learning path, practice page styles
│       └── pet.css               # Pet display, evolution, cosmetics
├── server/                       # Backend Express
│   ├── index.js                  # Entry point
│   ├── config/
│   │   ├── database.js           # MySQL2 pool (utf8mb4)
│   │   └── passport.js           # Google OAuth strategy
│   ├── middleware/
│   │   └── auth.js               # JWT verify middleware
│   ├── routes/
│   │   ├── auth.js               # /auth/google, /auth/google/callback
│   │   └── api.js                # 14 API endpoints (CRUD + social)
│   └── db/
│       ├── schema.sql            # DDL: users + user_progress
│       ├── migrate-pet.sql       # Thêm pet_data + nickname
│       └── migrate-social.sql    # Thêm challenges table + league columns
├── dist-prod/                    # Build output (deploy lên server)
├── SETUP.md                      # Hướng dẫn cài đặt chi tiết
├── GAME-DESIGN.md                # Game design document
├── REPORT.md                     # Báo cáo phân tích & roadmap
└── vite.config.prod.js           # Vite production config
```

---

## API Endpoints

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/me` | ✅ | Thông tin user hiện tại |
| GET | `/api/progress` | ✅ | Lấy tiến trình học |
| PUT | `/api/progress` | ✅ | Lưu tiến trình học |
| GET | `/api/pet-data` | ✅ | Lấy dữ liệu pet |
| PUT | `/api/pet-data` | ✅ | Lưu dữ liệu pet |
| GET | `/api/leaderboard` | ❌ | Bảng xếp hạng pet (power/skill/collection) |
| GET | `/api/rankings` | ❌ | Xếp hạng giải đấu (League Points) |
| GET | `/api/student-rankings` | ❌ | Xếp hạng học tập (6 tiêu chí) |
| GET | `/api/my-stats` | ✅ | Thống kê đấu trường (LP/W/L/streak) |
| POST | `/api/duel` | ✅ | Tạo thách đấu mới |
| GET | `/api/duel/open` | ✅ | Danh sách thách đấu đang chờ |
| GET | `/api/duel` | ✅ | Lịch sử thách đấu của tôi |
| GET | `/api/duel/:id` | ✅ | Chi tiết thách đấu (câu hỏi) |
| POST | `/api/duel/:id/join` | ✅ | Chấp nhận + nộp bài thách đấu |

---

## Bài học (21 bài)

| Unit | Bài học | Cấp độ |
|---|---|---|
| **Unit 1: Cơ bản 1** | Chào hỏi, Gia đình, Màu sắc, Số đếm | 🌱 Beginner |
| **Unit 2: Cơ bản 2** | Thói quen, Đồ ăn, Du lịch, Thì | 🌱 Beginner |
| **Unit 3: Trung cấp 1** | Trường học, Thời tiết, Nghề nghiệp, Cơ thể | 🌿 Intermediate |
| **Unit 4: Trung cấp 2** | Quần áo, Nhà cửa, Cảm xúc, Sở thích | 🌿 Intermediate |
| **Unit 5: Nâng cao** | Thiên nhiên, Công nghệ, Mua sắm, Sức khỏe, So sánh | 🌳 Advanced |

---

## Cài đặt nhanh

> Xem [SETUP.md](SETUP.md) để biết hướng dẫn chi tiết bao gồm tạo database và cấu hình Google OAuth.

### Yêu cầu
- Node.js 18+
- MySQL / MariaDB
- Google Cloud Console project với OAuth 2.0 credentials

### Frontend

```bash
npm install
npm run dev          # http://localhost:5173
npm run build:prod   # Build production → dist-prod/
```

### Backend

```bash
cd server
npm install

# Tạo server/.env (xem mẫu bên dưới)
# Khởi tạo database:
mysql -u root -p cowdi_english < db/schema.sql
mysql -u root -p cowdi_english < db/migrate-pet.sql
mysql -u root -p cowdi_english < db/migrate-social.sql

# Khởi động:
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

FRONTEND_URL=http://localhost:5173
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

## Deploy (aaPanel)

1. Upload `dist-prod/` lên server (Nginx SPA)
2. Chạy backend: `node --env-file=".env" index.js` (PM2 recommended)
3. Chạy migrations: `mysql -u root -p cowdi_english < db/migrate-social.sql`
4. Domain: cowdi.net

---

> Được tạo với ❤️ bởi **Cowdi Team**
