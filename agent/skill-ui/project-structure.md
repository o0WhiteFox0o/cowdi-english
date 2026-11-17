# cowdi.net project structure (Cấu trúc dự án, CỐ ĐỊNH / FIXED)

This is the official structure. The skill must NOT add, move, rename, or delete any folder or file listed here, and must NOT create new folders or files outside it without explicit user approval.

```
src/
├── assets/                       # Ảnh, SVG nội bộ (cowdi-notes, cowdi-reading, ...)
├── components/                   # Các component giao diện dùng chung
│   ├── charts/                   # Biểu đồ đánh giá kỹ năng (RadarChart.jsx)
│   ├── layout/                   # Layout khung sách, chat, thông báo (BookShell, CowdiChat, Toast)
│   ├── CowdiBetaBanner.jsx       # Banner trạng thái Beta
│   ├── Emoji.jsx                 # Component hiển thị emoji
│   ├── ForestBanner.jsx          # Banner sự kiện
│   ├── Icon.jsx                  # Icon UI
│   └── PWAInstallPrompt.jsx      # Popup gợi ý cài đặt PWA
│
├── data/                         # Dữ liệu tĩnh, ngân hàng câu hỏi, bài học & lộ trình
│   ├── config/                   # Cấu hình hệ thống (achievements, levels, messages, units)
│   ├── lessons/                  # Lộ trình & nội dung bài học theo chứng chỉ
│   │   ├── b1/                   # Bài học cấp độ B1
│   │   ├── b2/                   # Bài học cấp độ B2
│   │   ├── advanced/             # Bài học nâng cao C1 / C2 (học thuật, nghiên cứu)
│   │   ├── ielts/                # Chuyên đề luyện thi IELTS
│   │   ├── toeic/                # Chuyên đề luyện thi TOEIC (Business, Reading, ...)
│   │   ├── quiz-bank.js          # Ngân hàng đề thi
│   │   └── reading.js            # Bài tập đọc hiểu
│   ├── quiz/                     # Bộ câu hỏi luyện tập & đấu trường đối kháng (Duel)
│   └── vocab/                    # Từ vựng theo chủ đề (animals, countries, sports, ...)
│
├── features/                     # Các module tính năng chuyên biệt (Feature-based)
│   ├── duel/                     # Tính năng đấu trường đối kháng 1vs1 (DuelPage.jsx)
│   ├── invite/                   # Tính năng mời bạn bè nhận quà (InviteSheet.jsx)
│   ├── lesson/                   # Chi tiết bài học tương tác (LessonDetailPage.jsx)
│   ├── mini-games/               # Mini game luyện gõ (TyperSharkGame.jsx)
│   ├── pet/                      # Nuôi pet ảo, tiến hoá & shop (PetPage, ShopPage, EvolutionAnimation)
│   ├── practice/                 # Phòng luyện bài tập trắc nghiệm
│   └── review/                   # Ôn tập kiến thức & nhật ký học tập (StudyJournalCard)
│
├── hooks/                        # Custom React Hooks
│   ├── useAuth.jsx               # Quản lý phiên đăng nhập & xác thực
│   ├── usePet.jsx                # Trạng thái, cấp độ & tương tác pet
│   ├── usePush.jsx               # Quản lý Web Push Notification
│   ├── useSchedule.jsx           # Lập lịch học & nhắc nhở
│   ├── useSEO.js                 # Tối ưu thẻ meta SEO linh hoạt
│   ├── useSound.jsx              # Hiệu ứng âm thanh khi trả lời đúng/sai/level-up
│   └── useUser.jsx               # Thông tin profile, kinh nghiệm (XP), streak
│
├── pages/                        # Các trang chính định tuyến (Routing)
│   ├── AccountPage.jsx           # Trang tài khoản cá nhân
│   ├── AdminPage.jsx             # Trang quản trị CMS
│   ├── AuthCallbackPage.jsx      # Callback xử lý OAuth (Google / Social)
│   ├── CollectionPage.jsx        # Bộ sưu tập pet / huy hiệu
│   ├── DuelPage.jsx              # Trang sảnh chờ & chiến đấu
│   ├── HomePage.jsx              # Trang chủ / Dashboard người học
│   ├── LeaderboardPage.jsx       # Bảng xếp hạng tuần / tháng
│   ├── LearningPathPage.jsx      # Bản đồ lộ trình học tập
│   ├── LessonDetailPage.jsx      # Chi tiết bài học
│   ├── LessonsPage.jsx           # Danh sách bài học
│   ├── MiniGamePage.jsx          # Danh sách mini game
│   ├── PetPage.jsx               # Trang chi tiết thú cưng
│   ├── PracticePage.jsx          # Trang luyện tập
│   ├── ProgressPage.jsx          # Thống kê tiến độ & biểu đồ năng lực
│   ├── ReviewPage.jsx            # Trang ôn tập ngắt quãng (SRS)
│   ├── ShopPage.jsx              # Cửa hàng vật phẩm cho Pet
│   ├── StudentRankingPage.jsx    # Bảng xếp hạng học viên
│   ├── TypingPage.jsx            # Luyện gõ phím từ vựng
│   └── VocabularyPage.jsx        # Sổ tay từ vựng
│
├── styles/                       # CSS Stylesheet phân theo module
│   ├── book.css / components.css / dex.css / pages.css
│   ├── path.css / pet.css / styles.css
│
├── utils/                        # Tiện ích bổ trợ (speech.js - Text-to-Speech)
├── App.jsx                       # Thiết lập Router & Provider gốc
├── main.jsx                      # Entry script render ReactDOM
└── sw.js                         # Service Worker tùy biến cho PWA offline
```

## Where styling edits are allowed (Được sửa ở đâu)
- Primary: the 7 files in `src/styles/`: `book.css`, `components.css`, `dex.css`, `pages.css`, `path.css`, `pet.css`, `styles.css`.
- Secondary, only when a style cannot live in those files: `className` / `style` props in `.jsx` files under `components/`, `features/`, `pages/`.
- Put design tokens (`:root` variables) at the top of the existing `src/styles/styles.css`. Do NOT create a new `tokens.css` or any new file.
- Before editing a stylesheet, search which components import it and which classes it styles. Do not guess from the file name.

## Read-only zones (Không đụng vào)
`src/data/**`, `src/hooks/**`, `src/utils/**`, `src/sw.js`, `src/main.jsx`, `src/App.jsx`, and all logic inside `.jsx` files (state, effects, handlers, routing, auth, push, sound).

## Structure rules (Quy tắc cấu trúc)
1. Do not create, move, rename, or delete any folder or file.
2. Do not split a CSS file into several files or merge files. Reorganize inside the existing file with section comments.
3. Do not add a CSS-in-JS library, CSS modules, or a new styling approach.
4. Do not move styles between the feature folders and `src/styles/`. Keep the current separation.
5. If a change would need a new file or folder, stop and ask the user first.
6. After editing, run `git status` (or list changed files) and confirm that only existing files under `src/styles/` (and, where unavoidable, `.jsx` styling props) changed, with no added or deleted files.
