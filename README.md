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

## 📑 Báo cáo Kỹ thuật & Tiêu chuẩn Hệ thống

Hệ thống Cowdi English được chuẩn hóa toàn diện theo các đặc tả kỹ thuật quốc tế và đã được đánh giá qua các báo cáo chuyên đề:

| Báo cáo chuyên đề | Bản Markdown | Bản PDF In ấn | Mô tả trọng tâm |
|---|:---:|:---:|---|
| **Tiêu chuẩn Công nghệ v01** | [STANDARDS-REPORT-v01.md](STANDARDS-REPORT-v01.md) | [STANDARDS-REPORT-v01.pdf](STANDARDS-REPORT-v01.pdf) | Danh mục 16+ chuẩn quốc tế (W3C, PWA, RFC OAuth2/JWT, Schema.org, CEFR, SRS) |
| **Tiêu chuẩn IEEE & So sánh NestJS** | [IEEE-AND-NESTJS-REPORT-v01.md](IEEE-AND-NESTJS-REPORT-v01.md) | [IEEE-AND-NESTJS-REPORT-v01.pdf](IEEE-AND-NESTJS-REPORT-v01.pdf) | Tổng hợp các chuẩn IEEE (754, 42010, 12207, POSIX) & so sánh đa chiều với NestJS |
| **An toàn Bảo mật v01** | [SECURITY-REPORT-v01.md](SECURITY-REPORT-v01.md) | [SECURITY-REPORT-v01.pdf](SECURITY-REPORT-v01.pdf) | So sánh kiến trúc Decoupled vs. WordPress, ma trận bảo vệ 3 lớp, 6 đề xuất kỹ thuật |
| **Chiến lược & Hiện trạng SEO v01** | [SEO-REPORT-v01.md](SEO-REPORT-v01.md) | [SEO-REPORT-v01.pdf](SEO-REPORT-v01.pdf) | Ma trận từ khóa cốt lõi, từ khóa tìm kiếm dài (Long-tail), PWA SEO, Sitemap & Robots |

---

## 📜 Tiêu chuẩn Sử dụng, Đạo đức & Trách nhiệm Nhóm Phát triển

Đội ngũ phát triển **Cowdi English** cam kết xây dựng một môi trường giáo dục công nghệ số minh bạch, nhân văn và an toàn tối đa cho người học với các nguyên tắc đạo đức cốt lõi sau:

### 1. Tôn chỉ Sản phẩm & Bình đẳng Tiếp cận (Mission & Fairness)
* **Giáo dục miễn phí & Công bằng:** Chúng tôi cam kết duy trì nền tảng học tiếng Anh miễn phí, chất lượng cao dành cho mọi đối tượng học sinh, sinh viên và người đi làm tại Việt Nam.
* **Nói không với Pay-to-Win:** Mọi tính năng, trang phục pet và vật phẩm trong cửa hàng đều được quy đổi bằng nỗ lực học tập (XP, Điểm thưởng kiếm được qua bài học và Quiz). Không áp dụng các cơ chế thương mại hóa gây mất cân bằng trải nghiệm.

### 2. Đạo đức Dữ liệu & Quyền Riêng tư (Data Ethics & Privacy by Design)
* **Thu thập dữ liệu tối thiểu (Data Minimization):** Hệ thống chỉ lưu trữ các thông tin định danh cơ bản do Google OAuth cung cấp (Email, Tên hiển thị, Avatar) để phục vụ việc lưu trữ tiến độ học tập và hiển thị bảng xếp hạng. Tuyệt đối không yêu cầu các quyền truy cập nhạy cảm.
* **Xử lý âm thanh trên máy khách (Local Processing):** Tính năng nhận diện giọng nói luyện phát âm (`Web Speech Recognition`) và đọc mẫu (`Speech Synthesis`) được xử lý trực tiếp trên trình duyệt thiết bị người dùng. Chúng tôi **không ghi âm lén**, không lưu trữ tệp âm thanh giọng nói của người học lên máy chủ.
* **Cam kết không thương mại hóa dữ liệu:** Tuyệt đối không bán, chia sẻ hoặc cung cấp thông tin cá nhân của người học cho bất kỳ bên thứ ba hay mạng lưới quảng cáo nào.

### 3. Trách nhiệm Thiết kế Trò chơi hóa Lành mạnh (Ethical Gamification)
* **Khuyến khích thói quen tích cực:** Tính năng nuôi pet ảo, duy trì chuỗi học (Streak) và thi đấu bạn bè (Duel 1v1) được thiết kế xoay quanh mục tiêu duy trì động lực học 5–15 phút mỗi ngày, không tạo các cơ chế bẫy tâm lý gây nghiện tiêu cực hoặc ảnh hưởng đến thời gian sinh hoạt của người học.
* **Môi trường cạnh tranh văn minh:** Các trận thách đấu kiến thức (Duel) được điều phối ngẫu nhiên theo League trình độ, tôn trọng tinh thần học hỏi lẫn nhau, nghiêm cấm các hành vi gian lận (cheat bot, can thiệp mã nguồn điểm số).

### 4. Tính Chuẩn xác & Liêm chính Học thuật (Academic Integrity)
* **Chuẩn hóa nội dung:** Nội dung từ vựng, ngữ pháp và bài thi được biên soạn bám sát khung năng lực chuẩn quốc tế (CEFR A1–C1, IELTS, TOEIC) và khung năng lực ngoại ngữ 6 bậc Việt Nam (VSTEP).
* **Nội dung văn minh, không định kiến:** Ngân hàng bài tập và câu chuyện minh họa được kiểm duyệt kỹ lưỡng, đảm bảo tính trong sáng của ngôn ngữ, tôn trọng sự đa dạng văn hóa, không chứa nội dung phân biệt giới tính, tôn giáo hay sắc tộc.

### 5. Trách nhiệm Bảo mật & Vận hành Kỹ thuật (Security & Operational Duty)
* **Bảo vệ hệ thống liên tục:** Nhóm phát triển chịu trách nhiệm giám sát mã nguồn, tuân thủ các hướng dẫn phòng chống lỗ hổng của OWASP Top 10, cập nhật bản vá bảo mật định kỳ cho cả Frontend và Backend.
* **Tiếp nhận phản hồi có đạo đức (Responsible Vulnerability Disclosure):** Chúng tôi luôn lắng nghe và sẵn sàng phối hợp xử lý các báo cáo về lỗi hệ thống hoặc lỗ hổng bảo mật do cộng đồng đóng góp trong vòng 24–48 giờ làm việc.

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

> Được xây dựng với tinh thần trách nhiệm và ❤️ bởi **Hong Son Studio Team**