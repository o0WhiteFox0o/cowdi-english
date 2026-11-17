# Cowdi English — Báo cáo phân tích & Roadmap phát triển

> Ngày: 17/03/2026

---

## 1. Tổng quan dự án

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.3, React Router 6.26, Vite 5.4 |
| Backend | Express.js (Node), MySQL (via mysql2/promise) |
| Auth | Google OAuth 2.0 → JWT |
| Build | Vite (dev + prod configs) |
| Deployment | aaPanel, Nginx SPA, domain cowdi.net |
| Dependencies | Minimal — react, react-dom, react-router-dom |

### Số liệu hiện tại

| Hạng mục | Số liệu |
|---|---|
| Bài học | 8 (80 từ vựng, 40 quiz) |
| Ngân hàng câu hỏi | ~370 câu (4 loại) |
| Pet | 15 con, 5 giai đoạn tiến hóa |
| Shop | 27 items (5 danh mục) |
| Mini-games | 2 (Bắt từ, Ghép câu) |
| Thành tích | 18 (10 user + 8 pet) |
| Level | 8 cấp (0 → 2500 XP) |

---

## 2. Các tính năng đã hoàn thiện

### ✅ Fully Implemented
- **8 bài học** với vocab, grammar, quiz, flashcard 3D flip, speak-along
- **~370 câu quiz** (vocabulary, grammar, listening, sentences)
- **15 pets** — tiến hóa 5 giai đoạn, 4 skill, 4 nhu cầu tamagotchi, mood/chat
- **Collection page** — grid 15 pets, unlock conditions, detail modal
- **Shop** — 27 items (5 danh mục), equip/unequip/consume
- **Coins economy** — nhiều nguồn thu
- **Daily quests** — 3 nhiệm vụ/ngày + claim bonus
- **2 Mini-games** — Word Catch (10 rounds), Sentence Puzzle (8 rounds)
- **XP + 8 levels** — từ "Người mới bắt đầu" đến "Huyền thoại Cowdi"
- **Streak** — tracking + lịch 28 ngày
- **18 achievements** — tự động check
- **Leaderboard** — server-side, anonymous pet ranking, 3 chế độ
- **Google OAuth + JWT** — đăng nhập, cloud sync
- **Sound effects** — Web Audio API (correct/wrong/celebration)
- **TTS** — Web Speech API (normal + slow)
- **Confetti animation** — quiz completion
- **Responsive** — Bootstrap 5 + custom CSS

### ⚠️ Partially Implemented
- Weekly quests — data structures có nhưng thiếu UI
- Leaderboard entries — emoji fallback luôn là 🐮
- Room backgrounds — data có nhưng chưa hiện visual

### 📋 Not Implemented
- Không có pet visual art (tất cả là emoji)
- Không có animated pet sprites
- Không có push notifications
- Không có social features ngoài leaderboard

---

## 3. So sánh với Duolingo

| Tiêu chí | Duolingo | Cowdi English | Đánh giá |
|---|---|---|---|
| **Nội dung** | 100+ units, 2000+ từ | 8 bài, 80 từ | ❌ Cần nhiều hơn |
| **Bài tập đa dạng** | Nghe/Nói/Viết/Dịch/Ghép/Kéo thả | MCQ + Flashcard + Speak-along | ⚠️ Thiếu dạng bài |
| **Gamification** | Streak, XP, Leagues, Hearts, Gems | Streak, XP, Coins, Pets, Shop | ✅ Pet system hay hơn |
| **Spaced Repetition** | Thuật toán ôn tập thông minh | Chưa có | ❌ Thiếu quan trọng |
| **Adaptive Learning** | Điều chỉnh độ khó theo user | Không có | ❌ Thiếu |
| **Audio** | TTS + native recordings | Web Speech API | ⚠️ TTS tạm được |
| **Leaderboard** | Đấu trực tiếp | Pet power ranking | ✅ Ý tưởng tốt |
| **Progression** | Skill tree phân nhánh | Danh sách tuyến tính | ⚠️ Nên có roadmap |
| **Pet/Avatar** | Chỉ trang phục | 15 pets + tiến hóa + nhu cầu | ✅ **Vượt trội** |
| **Mobile** | Native app | Web responsive | ⚠️ Cần PWA |
| **Social** | Bạn bè, leagues, reactions | Chỉ leaderboard | ❌ Thiếu |
| **Offline** | Có | localStorage (partial) | ⚠️ Cần PWA |

**Competitive Advantage:** Hệ thống Pet Tamagotchi — không app nào làm tốt như vậy.

---

## 4. Đề xuất phát triển

### 🔴 Ưu tiên cao (Core Learning Experience)

**1. Thêm nội dung bài học (20+ bài)**
- Cơ bản: Trường học, Thời tiết, Nghề nghiệp, Cơ thể, Quần áo, Nhà cửa
- Trung cấp: Mua sắm, Bệnh viện, Cảm xúc, Sở thích, Thiên nhiên, Công nghệ
- Nâng cao: So sánh, Bị động, Câu điều kiện, Phrasal verbs, Idioms

**2. Spaced Repetition System (SRS)**
- Thuật toán SM-2: Từ mới → ôn sau 1 ngày → 3 ngày → 7 ngày → 14 ngày
- Track nextReview, interval, easeFactor per từ
- Trang "Ôn tập hôm nay"

**3. Thêm dạng bài tập**
- Nghe rồi viết (Dictation)
- Nối cặp (Matching) EN ↔ VN
- Điền vào chỗ trống
- Sắp xếp từ trong câu

**4. Learning Path / Skill Tree**
- Mỗi unit gồm 3-4 bài + checkpoint test
- Phải đạt ≥70% mới mở unit tiếp
- Visual roadmap

### 🟡 Ưu tiên trung bình (Engagement & Retention)

**5. Daily Challenge cải tiến**
**6. PWA (Progressive Web App)**
**7. Hệ thống Hearts/Lives**
**8. Weekly Quests UI**
**9. Pet Visuals (SVG/pixel art)**

### 🟢 Ưu tiên thấp (Polish & Social)

**10. Mini-games mới** (Hangman, Memory Match, Typing Race)
**11. Social Features** (Bạn bè, thách đấu)
**12. Stats & Analytics**
**13. Pronunciation Check** (Web Speech Recognition)

---

## 5. Roadmap

| Phase | Focus | Mục tiêu |
|---|---|---|
| **v1.1** | +12 bài → 20 lessons, SRS cơ bản, +2 dạng bài (Dictation + Matching) | Đủ nội dung giữ chân 2 tuần |
| **v1.2** | PWA, Learning Path/Skill Tree, Weekly Quests UI, Hearts system | Tạo thói quen quay lại mỗi ngày |
| **v1.3** | Pet SVG art, 2 mini-games mới, Stats dashboard | Polish trải nghiệm |
| **v2.0** | Social features, Pronunciation check, 40+ bài, Adaptive difficulty | Sản phẩm hoàn chỉnh |

---

## 6. Kết luận

Cowdi English đã có nền tảng rất tốt — hệ thống Pet + Economy + Quiz + Auth + Cloud sync đều hoạt động ổn định. So với MVP thì đã vượt mức.

**Điểm cần cải thiện nhất:**
1. **Nội dung** — 80 từ quá ít, cần ≥300 từ
2. **SRS** — Không ôn tập thông minh = quên nhanh
3. **Đa dạng bài tập** — MCQ lặp lại dễ nhàm
4. **PWA** — Web app không cài phone = mất 70% user mobile
