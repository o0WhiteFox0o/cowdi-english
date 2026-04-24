# 🐮 Cowdi English

Ứng dụng học tiếng Anh tương tác dành cho người Việt, xây dựng bằng **React + Vite**, **Bootstrap 5** và **Express backend** với đăng nhập Google OAuth.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap) ![Node](https://img.shields.io/badge/Node.js-22-339933?logo=node.js) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)

---

## Số liệu hiện tại

| Hạng mục | Số liệu |
|---|---|
| Bài học | 21 bài (210+ từ vựng) |
| Từ vựng Mind Map | 13 chủ đề, 42 chủ đề con, 702 từ |
| Tổng từ vựng | ~912 từ (bài học + mind map) |
| Unit (Lộ trình) | 7 unit, checkpoint test |
| Ngân hàng câu hỏi | ~1300+ câu (vocab, grammar, listening, sentences) |
| 4 Kỹ năng ngôn ngữ | Nghe, Nói, Đọc, Viết — tính điểm riêng cho pet & người học |
| Dạng bài tập | 9 loại nhóm theo 4 kỹ năng |
| Pet | 15 con, 5 giai đoạn tiến hóa, 4 kỹ năng ngôn ngữ, 4 nhu cầu |
| Shop | 26 items (hats, outfits, rooms, effects, food) |
| Mini-games | 7 (Bắt từ, Ghép câu, Lật thẻ, Spelling Bee, Tốc độ, Xáo chữ, TyperShark 🦈) |
| Thành tích | 18 (10 user + 8 pet) |
| Level | 8 cấp (0 → 2500 XP) |
| Trang | 17 trang |
| API endpoints | 14 |

---

## Tính năng chính

| Tính năng | Mô tả |
|---|---|
| 📚 **Bài học** | 21 bài chia theo level (beginner/intermediate/advanced) + exam paths (IELTS/TOEIC/B1/B2) |
| 🎯 **Quiz** | MCQ, fill-in, matching, reorder, dictation — 1300+ câu hỏi |
| 🎧 **Luyện nghe** | TTS Web Speech API, nghe chuẩn tốc độ thường và chậm |
| 🗣️ **Luyện nói** | Web Speech Recognition, chấm điểm phát âm realtime |
| 🧠 **Ôn tập SRS** | Spaced repetition (SM-2) review thông minh |
| 🐮 **Pet system** | Nuôi pet, tiến hóa 5 giai đoạn, 4 skill language |
| ⚔️ **Duel** | Thách đấu quiz 1v1 theo league (Bronze → Master) |
| 🎮 **Mini-games** | 7 game luyện từ vựng tương tác |
| 🦈 **TyperShark** | Typing game — gõ tiêu diệt cá mập, 4 cấp độ tốc độ |
| 🏆 **Leaderboard** | Xếp hạng theo XP, streak, pet power |
| 🗺️ **Learning Path** | 7 Unit lộ trình học + checkpoint test |

---

## Cấu trúc dự án

```
src/
├── components/
│   └── layout/              # Navbar, CowdiChat, Toast
│
├── data/
│   ├── config/              # levels.js, units.js, achievements.js, messages.js
│   ├── lessons/             # Nội dung bài học
│   ├── exam/                # IELTS, TOEIC, B1, B2 content
│   ├── quiz/                # quiz-bank-extra, sentences-quiz, duel-quiz-pool
│   ├── pets.js
│   └── vocab-topics.js
│
├── features/                # Feature-based modules
│   ├── practice/            # PracticePage + hooks (listening/speaking/reading/writing)
│   ├── lesson/              # LessonDetailPage + hooks
│   ├── mini-games/          # MiniGamePage + TyperShark + các game khác
│   ├── duel/                # DuelPage
│   ├── pet/                 # PetPage, CollectionPage, ShopPage
│   └── review/              # ReviewPage
│
├── hooks/                   # useUser, usePet, useAuth, useSound
│
├── pages/                   # Thin re-exports + simple pages
│
└── styles/                  # CSS modules
```

### Nguyên tắc tổ chức

- **`features/`** — mỗi tính năng lớn là một thư mục riêng, tự đủ (component + hook + logic)
- **`data/config/`** — constants tách biệt: levels, units, achievements, messages
- **`data/quiz/`** — tất cả quiz data tập trung một chỗ
- **`pages/`** — chỉ là thin re-exports từ `features/` hoặc simple page
- **`components/layout/`** — shared UI (Navbar, Chat, Toast)

---
### Phân bố hiện tại:

CEFR: A1×10, A2×8, B1×28, B2×23, C1×5
IELTS: 6.0-7.0×9, 7.5+×5
TOEIC: 500-695×6, 700-895×3
VSTEP: B1×16, B2×20, C1×5
---

## Cài đặt & chạy

### Frontend

```bash
npm install
npm run dev          # localhost:5173
npm run build        # build → dist/
npm run build:prod   # build → dist-prod/
```

### Backend

```bash
cd server
npm install
# Tạo server/.env (xem mẫu bên dưới)
node index.js        # localhost:3001
```

### Yêu cầu

- Node.js >= 18
- MySQL 8+
- Google OAuth Client ID/Secret (xem [SETUP.md](SETUP.md))

---

## Biến môi trường (`server/.env`)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cowdi_english

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

JWT_SECRET=random_secret_string
SESSION_SECRET=random_secret_string

FRONTEND_URL=http://localhost:5173
PORT=3001
```

---

## Thêm bài học mới

```js
// src/data/lessons/beginner/my-lesson.js
export default {
  id: 'my-lesson',
  title: 'Tên bài học',
  level: 'beginner',
  icon: '📘',
  vocabulary: [ /* ... */ ],
  grammar:    [ /* ... */ ],
  quiz:       [ /* ... */ ],
};
```

## Thêm mini-game mới

```
src/features/mini-games/
└── MyGame/
    ├── MyGame.jsx        # Component game
    └── useMyGame.js      # Game logic hook (optional)
```

Đăng ký vào `GAMES` array và thêm `{game === 'my-game' && <MyGame />}` trong `MiniGamePage.jsx`.

---

## Tài liệu thêm

| File | Nội dung |
|---|---|
| [SETUP.md](SETUP.md) | Hướng dẫn cài đặt chi tiết |
| [GAME-DESIGN.md](GAME-DESIGN.md) | Thiết kế hệ thống game, XP, pet |
| [DUEL-BATTLE-DESIGN.md](DUEL-BATTLE-DESIGN.md) | Thiết kế hệ thống đấu |
| [VOCABULARY.md](VOCABULARY.md) | Danh sách từ vựng |
| [PET-IMAGE-GUIDE.md](PET-IMAGE-GUIDE.md) | Hướng dẫn thêm ảnh pet |
| [REPORT.md](REPORT.md) | Báo cáo tiến độ phát triển |

---

> Được tạo với ❤️ bởi **Hong Son Studio Team**