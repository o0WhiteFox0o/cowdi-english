# 📘 BÁO CÁO TỔNG QUAN DỰ ÁN COWDI-ENGLISH

> **Ngày báo cáo:** 27/04/2026
> **Phiên bản phân tích:** Sau cập nhật Duel v2 (4/2026)
> **Phạm vi:** Toàn bộ codebase FE + BE + Data + Deployment + Roadmap thu hút người dùng
> **Tác giả:** GitHub Copilot (auto-analysis)

---

## 0. TÓM TẮT ĐIỀU HÀNH (TL;DR)

Cowdi-English là một SPA học tiếng Anh kết hợp **gamification pet system** + **Duel PvP** + **SRS** — một USP hiếm thấy trên thị trường. Codebase đã **vượt MVP**, nền tảng ổn, content phong phú (61 lesson, ~912 từ, 1300+ quiz, 15 pet × 5 evo).

- **Điểm mạnh nổi bật:** Pet evolution + 4-skill tracking, Duel League, Anonymous Leaderboard, Google OAuth + JWT, Feature-based architecture, TTS speak-along.
- **Yếu nhất:** 0% test, không TypeScript, chưa có rate-limit/helmet, bundle chưa lazy-load, chưa PWA, chưa real-time duel, SRS schema có nhưng chưa khai thác hết.
- **Lực kéo người dùng tiếp theo cần đến từ:** Real-time PvP Pokemon-style → social loop (friends/guild) → AI tutor (Cowdi Chat thực sự thông minh) → Mobile/PWA → Streak hooks viral (challenge bạn bè).

---

## 1. KIẾN TRÚC TỔNG THỂ

### 1.1 Stack công nghệ

| Lớp | Công nghệ |
|---|---|
| **Frontend** | React 18.3 · Vite 5.4 · React Router 6.26 · Bootstrap 5 (CDN) · Web Audio API |
| **State** | Context API (Auth, User, Pet, Sound, Toast) — không Redux/Zustand |
| **Backend** | Express 4.18 · Passport (Google OAuth 2.0) · JWT 9 (7 ngày) · mysql2/promise (pool 10) |
| **Database** | MySQL 8 · UTF8MB4 · 2 bảng (users, user_progress) · LONGTEXT JSON columns |
| **Deploy** | aaPanel + Nginx SPA · PM2 backend port 3001 · domain `cowdi.net` |
| **Build** | `npm run build:prod` → [dist-prod/](dist-prod/) (vendor chunk tách, không sourcemap) |

### 1.2 Sơ đồ luồng dữ liệu

```
Browser (React SPA, base /)
   │
   ├─ /auth/google ──► Express ──► Passport ──► Google OAuth
   │                                   │
   │                                   ▼
   │                       INSERT/UPDATE users (MySQL)
   │                                   │
   │                                   ▼
   │                       JWT signed (7d) ──► /auth-callback?token=...
   │
   └─ /api/* (Bearer JWT)
         ├─ /api/progress  (PUT/GET)  → user_progress.JSON cols
         ├─ /api/pet-data  (PUT/GET)  → user_progress.pet_data JSON
         ├─ /api/word-status (PUT)    → lightweight sync wordStatus
         ├─ /api/duel*                → duel CRUD (v2 schema)
         ├─ /api/leaderboard          → ẩn danh, sort by power/skill
         └─ /api/rankings             → public student board
```

### 1.3 Cấu trúc thư mục (đã verify)

```
cowdi-english/
├─ src/
│  ├─ pages/         ← 17 page (App.jsx import từ đây — ACTIVE)
│  ├─ features/      ← 6 module (duel, lesson, pet, practice, mini-games, review)
│  ├─ components/    ← root files là re-export, layout/ là canonical
│  ├─ hooks/         ← useAuth, useUser, usePet, useSound
│  ├─ data/          ← lessons/, vocab/, quiz/, config/, pets.js, ...
│  └─ styles/        ← styles, components, pages, pet (4 CSS)
├─ server/
│  ├─ index.js       ← Express bootstrap, port 3001, trust proxy 1
│  ├─ routes/        ← auth.js (3 endpoint), api.js (15 endpoint)
│  ├─ middleware/    ← auth.js (requireAuth JWT)
│  ├─ config/        ← env, database, passport
│  └─ db/            ← schema.sql + 5 migration .sql
├─ scripts/          ← 5 utility (convert WebP, split vocab/lessons, ...)
├─ public/           ← static assets (images/events|Icons|logo|pets/)
├─ dist-prod/        ← output build production (1 chunk hashed)
└─ docs: README, BUILD, SETUP, GAME-DESIGN, DUEL-BATTLE-DESIGN,
         VOCABULARY, PET-IMAGE-GUIDE, SCORING-REPORT, EVALUATION-2026-04
```

> ✅ **Cập nhật so với báo cáo 4/2026:** `src/components/{CowdiChat,Navbar,Toast}.jsx` ở root **không còn duplicate** — chỉ là re-export từ `layout/`. Đã xác nhận `src/features/` **không phải orphan** — pages thin chỉ làm proxy đến features. Như vậy 2 critical issue trong [EVALUATION-2026-04.md](EVALUATION-2026-04.md) (#1 & #3) đã được giải quyết hoặc đánh giá chưa chính xác.

---

## 2. CHI TIẾT FRONTEND

### 2.1 Pages (17) — vai trò

| Page | Vai trò | Module thực thi |
|---|---|---|
| [HomePage.jsx](src/pages/HomePage.jsx) | Dashboard: quick action, XP bar, active pet, stats | self-contained |
| [LessonsPage.jsx](src/pages/LessonsPage.jsx) | Browser lesson, filter standard/track/band | self-contained |
| [LessonDetailPage.jsx](src/pages/LessonDetailPage.jsx) | Lesson player + quiz | re-export `features/lesson/` |
| [VocabularyPage.jsx](src/pages/VocabularyPage.jsx) | Topic → Subtopic → Words; flashcard 3D + list | self-contained |
| [PracticePage.jsx](src/pages/PracticePage.jsx) | Quiz engine 4 category | re-export `features/practice/` |
| [ReviewPage.jsx](src/pages/ReviewPage.jsx) | SRS spaced repetition | re-export `features/review/` |
| [ProgressPage.jsx](src/pages/ProgressPage.jsx) | Stats, calendar streak, skill XP, achievements | self-contained |
| [DuelPage.jsx](src/pages/DuelPage.jsx) | PvP Arena | re-export `features/duel/` |
| [PetPage.jsx](src/pages/PetPage.jsx) | Active pet UI, needs/skill | re-export `features/pet/` |
| [CollectionPage.jsx](src/pages/CollectionPage.jsx) | Owned pets gallery | re-export `features/pet/` |
| [ShopPage.jsx](src/pages/ShopPage.jsx) | Mua hat/outfit/room/effect/food | re-export `features/pet/` |
| [LeaderboardPage.jsx](src/pages/LeaderboardPage.jsx) | 4 tab: power/skill/collection/league (ẩn danh) | self-contained |
| [StudentRankingPage.jsx](src/pages/StudentRankingPage.jsx) | Player board theo XP/streak/word… | self-contained |
| [MiniGamePage.jsx](src/pages/MiniGamePage.jsx) | Launcher 7 mini-game | re-export `features/mini-games/` |
| [LearningPathPage.jsx](src/pages/LearningPathPage.jsx) | 7 unit + checkpoint | self-contained |
| [AccountPage.jsx](src/pages/AccountPage.jsx) | Profile, OAuth, nickname, logout | self-contained |
| [AuthCallbackPage.jsx](src/pages/AuthCallbackPage.jsx) | Nhận JWT từ URL → localStorage → redirect | self-contained |

### 2.2 Hooks — quản lý state

- **[useAuth.jsx](src/hooks/useAuth.jsx)** — JWT lifecycle: parse (UTF-8 cho tiếng Việt), validate expiry, fetch wrapper Bearer, `loginWithGoogle()`, `logout()`.
- **[useUser.jsx](src/hooks/useUser.jsx)** — Trung tâm progress: totalXP, streak, completed lessons/quizzes, wordStatus (`new|learning|learned`), achievements, dailyTasks, activeDays, srsData, checkpointScores, skillXP (4 trục), perfectQuizzes. Dirty-flag sync queue → `PUT /api/progress` & `PUT /api/word-status` (lightweight). VALID_WORDS whitelist từ LESSONS + VOCAB_TOPICS để chống ghi nhận từ rác.
- **[usePet.jsx](src/hooks/usePet.jsx)** — Collection per-pet: speciesId, totalXpEarned, skills, needs (energy/happiness/health/knowledge). Decay theo giờ. Migration tên skill cũ (`speech→speaking`...). Power score = (Σskills) × evoMul × rarityBonus. Sync `pet_data` JSON.
- **[useSound.jsx](src/hooks/useSound.jsx)** — Web Audio API singleton. Oscillator + noise buffer. Không file mp3, footprint cực nhỏ. Mute toggle.

### 2.3 Routing — [App.jsx](src/App.jsx)

18 route + fallback `*` → home. Chưa có `React.lazy()` → toàn bộ app load 1 chunk.

### 2.4 Data — số liệu thực tế

| Loại dữ liệu | Số lượng | File |
|---|---|---|
| General lessons | 21 | [src/data/lessons/general/](src/data/lessons/general/) |
| Exam lessons | ~40 (IELTS, B1, B2, TOEIC, Advanced) | [src/data/lessons/](src/data/lessons/) |
| Vocab topics | 13 (animals, countries, drinking, eating, holidays, house, human, love, nature, numbers, public-places, sports, transportation) | [src/data/vocab/](src/data/vocab/) |
| Tổng từ vựng | ~912 | aggregated |
| Quiz pool | 1300+ (vocab, grammar, listening, sentences) | [src/data/lessons/quiz-bank.js](src/data/lessons/quiz-bank.js), [src/data/quiz/](src/data/quiz/) |
| Pets | 15 species × 5 evolution × 4 skill | [src/data/pets.js](src/data/pets.js) |
| Achievements | 18 (10 user + 8 pet) | [src/data/config/achievements.js](src/data/config/achievements.js) |
| Levels | 8 (0→2500 XP) | [src/data/config/levels.js](src/data/config/levels.js) |
| Learning path units | 7 (có checkpoint test) | [src/data/config/units.js](src/data/config/units.js) |
| Shop items | 26 (5 category) | (data trong feature pet) |

---

## 3. CHI TIẾT BACKEND

### 3.1 Endpoints

**[server/routes/auth.js](server/routes/auth.js)** (3):
- `GET /auth/google` — start OAuth (`prompt=select_account`)
- `GET /auth/google/callback` — sign JWT 7d, redirect `${FRONTEND_URL}/auth-callback?token=...`
- `GET /auth/status` — verify Bearer JWT

**[server/routes/api.js](server/routes/api.js)** (15):

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/me` | ✅ | User info |
| GET/PUT | `/api/progress` | ✅ | Toàn bộ progress (JSON cols) |
| PUT | `/api/word-status` | ✅ | Lightweight sync wordStatus |
| GET/PUT | `/api/pet-data` | ✅ | Pet collection + coins + items |
| GET | `/api/my-stats` | ✅ | Aggregate stats |
| POST/GET | `/api/duel` | ✅ | Tạo / list duel |
| GET | `/api/duel/open` | ✅ | Duel chưa nhận |
| GET | `/api/duel/:id` | ✅ | Detail |
| POST | `/api/duel/:id/join` | ✅ | Join + scoring |
| GET | `/api/leaderboard` | ❌ | Pet ẩn danh (power/skill/collection) |
| GET | `/api/rankings` | ❌ | Player league/global |
| GET | `/api/student-rankings` | ❌ | Lớp học |

### 3.2 Database — [server/db/schema.sql](server/db/schema.sql)

```sql
users (id PK, google_sub UNIQUE, email UNIQUE, display_name, avatar_url, created_at, last_seen_at)
user_progress (
  id PK, user_id UNIQUE FK CASCADE,
  -- counters
  total_xp, streak, lessons_completed, quizzes_completed, perfect_quizzes,
  words_learned, league_points, duel_wins, duel_losses, duel_streak,
  -- JSON LONGTEXT
  completed_lessons, word_status, active_days, achievements, daily_tasks,
  srs_data, checkpoint_scores, skill_xp, pet_data,
  -- meta
  last_active_date, daily_date, nickname, updated_at
)
```

5 migration: pet, skill_xp, social, duel-v2, persistence-fix (idempotent).

### 3.3 Auth & Security

- ✅ Parameterized queries (mysql2 prepare) → SQL injection safe
- ✅ JWT stateless 7d, session 5 phút chỉ cho OAuth dance
- ✅ CORS giới hạn `FRONTEND_URL` + credentials
- ✅ Whitelist field PUT `/api/progress` & `/api/pet-data`
- ❌ **Không** `helmet` (CSP, X-Frame, X-Content-Type)
- ❌ **Không** `express-rate-limit`
- ❌ **Không** validate JSON size per field (chỉ giới hạn body 10MB tổng)
- ❌ **Không** request logging có cấu trúc (Winston/Pino)

---

## 4. ƯU ĐIỂM HIỆN TẠI

### 4.1 USP — Differentiators thực sự

1. **Pet × Language Learning** — chưa app phổ biến nào (Duolingo, Memrise, Cake) tích hợp pet evolution + 4-skill tracking sâu như vậy.
2. **Duel PvP** — Pokemon-style với HP bar, elemental skill (fire/water/nature/cosmic/earth), critical <3s, combo ≥3, round-win scoring per question — đặc sản 4/2026.
3. **Anonymous Leaderboard** — so pet thay vì người, tránh toxic, bảo vệ user yếu khỏi tự ti.
4. **Multi-axis progression** — XP (level player), Coins (kinh tế), Skill XP (4 trục), Pet evolution, League (5 tier) → vòng lặp engagement đa dạng.

### 4.2 Content & UX

- 8+ dạng bài tập (MCQ, flashcard 3D, dictation, T/F, matching, speaking với TTS, reading passage, listening + nút 🐢 Chậm)
- 5 exam path thực tế (IELTS Foundation→Advanced, TOEIC Basic→Advanced, B1, B2, Advanced C1-C2)
- Cowdi Chat mascot context-aware tip
- Sound FX bằng Web Audio API → không cần file mp3, build siêu nhẹ
- TyperShark mini-game `requestAnimationFrame` 60fps thật

### 4.3 Foundation kỹ thuật

- Feature-based folder → scale dễ
- Hook tách biệt rõ (auth/user/pet/sound) → test được
- JSON column linh hoạt, migration idempotent
- Vite vendor chunk tách (react/react-dom/react-router-dom)
- WebP image, Nginx cache 1 năm cho hashed asset

---

## 5. KHUYẾT ĐIỂM & NỢ KỸ THUẬT

### 5.1 🔴 Critical (chặn scale)

| # | Vấn đề | Impact | Effort fix |
|---|---|---|---|
| C1 | **Bundle 1 chunk app code** (~700-1000KB) — chưa `React.lazy()` cho 17 page | LCP chậm 2-3s trên 3G | 4h |
| C2 | **0% test** — pet evolution, duel scoring, SRS, useUser sync chưa cover | Regression risk cực cao | 1-2 tuần setup baseline |
| C3 | **Không TypeScript** — `pet_data` JSON có thể null/string/object → `undefined.property` bug | Bug ẩn nhiều | Migration dần dần |
| C4 | **SRS schema có nhưng UI loop đơn giản** — không tận dụng SM-2 (interval, easeFactor, nextReview) | Bỏ phí ROI vốn có | 1 tuần |

### 5.2 ⚡ High (chặn production-grade)

| # | Vấn đề | Impact | Effort |
|---|---|---|---|
| H1 | Không `express-rate-limit` `/auth/*` & `/api/*` | Spam duel, OAuth abuse, DoS | 1h |
| H2 | Không `helmet` middleware | Thiếu CSP, X-Frame, X-Content-Type | 30m |
| H3 | Thiếu DB index: `league_points`, `duel(challenger_id, created_at)`, `user_progress(user_id)` | Leaderboard chậm khi >5k user | 30m |
| H4 | Duel async — UI Pokemon nhưng không real-time | Không có cảm giác PK trực diện | 2-3 tuần Socket.io |
| H5 | Không Error Boundary | 1 component crash = trắng trang | 2h |
| H6 | Không log có cấu trúc (Pino/Winston) | Khó debug production | 2h |
| H7 | JSON cột không validate schema → có thể chứa garbage từ phiên bản cũ | Migration drift | 1 ngày |

### 5.3 💡 Medium (UX & maintain)

| # | Vấn đề | Impact |
|---|---|---|
| M1 | Accessibility ~Level A — thiếu `aria-label`, `role`, focus trap modal | WCAG AA chưa đạt |
| M2 | i18n hard-code tiếng Việt — không có framework `i18next` | Khó mở rộng EN/ja UI |
| M3 | Không PWA — không offline review, không install icon | Mất user khi mất mạng |
| M4 | Không `.env.example` | Dev mới onboard chậm |
| M5 | Sync 2 chiều có conflict — user mở 2 tab/máy có thể overwrite | Mất progress hiếm gặp |
| M6 | Pronunciation chỉ Web Speech đơn giản — không scoring | Speaking phần nào hời hợt |
| M7 | Quiz pool 1300+ chưa đủ cho SRS thực sự (cần 3-5k) | SRS lặp sớm |
| M8 | Cowdi Chat hiện chỉ tip tĩnh — không AI thật | Bỏ phí brand mascot |

---

## 6. KẾ HOẠCH PHÁT TRIỂN — THU HÚT NGƯỜI DÙNG

> **Triết lý:** Người dùng đến vì **content phong phú**, ở lại vì **gamification**, mời bạn vì **social loop**, trả tiền vì **sự khác biệt**. Cowdi đã có #1, đang tốt #2, **chưa có #3 và #4**.

### 6.1 🚀 Phase A — Polish & Performance (2 tuần, ~12h thực thi)

Mục tiêu: Cảm giác "ứng dụng pro", giảm bounce rate landing.

| # | Task | File chính | Effort | Tác động |
|---|---|---|---|---|
| A1 | `React.lazy()` 17 page + `<Suspense fallback={Skeleton}/>` | [src/App.jsx](src/App.jsx) | 4h | LCP -60%, FCP -40% |
| A2 | `<ErrorBoundary>` page-level + fallback UI thân thiện | new component | 2h | Không trắng trang |
| A3 | `helmet()` + `express-rate-limit` (100 req/15p `/api`, 10 req/15p `/auth`) | [server/index.js](server/index.js) | 1h | Security baseline |
| A4 | 4 DB indexes qua migration mới | [server/db/](server/db/) | 30m | Leaderboard 10× |
| A5 | `.env.example` + startup validate (chặn boot nếu thiếu key) | [server/config/env.js](server/config/env.js) | 30m | Onboard nhanh |
| A6 | `rollup-plugin-visualizer` cho bundle analyzer | [vite.config.prod.js](vite.config.prod.js) | 30m | Track size |
| A7 | Loading skeletons cho lesson/quiz/pet | components | 2h | UX cao cấp |
| A8 | Pino structured log + request ID | [server/index.js](server/index.js) | 1.5h | Debug production |

**Output:** Lighthouse 85+ → 95+ trên cả Performance & Best Practices.

### 6.2 📈 Phase B — Real-time Social Loop (1-2 tháng) — *Đòn bẩy lớn nhất kéo user*

Đây là phase **quyết định viral**: chuyển Cowdi từ "ứng dụng học cá nhân" → "cộng đồng".

#### B1. Real-time Duel với Socket.io (3 tuần) 🌟

- WebSocket room theo `duelId`, đồng bộ answer trong < 200ms
- Battle animation khi cả 2 cùng trả lời 1 câu
- **Live opponent cursor** (đang chọn đáp án nào)
- Ghost replay cho duel async (dùng `questionTimes` đã lưu)
- Emoji react trong battle (👏😢🔥)
- **Spectator mode** — bạn bè xem trực tiếp

**Tại sao hút user:** Cảm giác PK thật → screenshot/clip lên TikTok/Facebook → viral organic.

#### B2. Friends & Guild (2 tuần)

- Bảng `friends` (user_id, friend_id, status: pending/accepted)
- Invite bằng email/QR code/link
- **Private Duel Lobby** — challenge bạn cụ thể
- **Guild (clan)** — 10-30 thành viên, tổng XP guild → leaderboard guild
- Guild quest tuần (cùng học 100 từ → reward chung)

#### B3. Streak Hooks viral (1 tuần)

- **Streak share card** đẹp (như Spotify Wrapped) → share Facebook/Zalo/IG story
- **Streak Freeze** (item mua bằng coin, bảo vệ 1 ngày)
- **Streak Challenge bạn bè** — ai đứt streak trước thua → loser pay coin cho winner
- **Daily Notification** (push qua PWA hoặc email) "🔥 Streak 14 ngày của bạn còn 2h…"

#### B4. UGC nhẹ — Custom Quiz (2 tuần)

- User tự tạo quiz set 10-20 câu, share link
- Tag chủ đề, voting, top hôm nay
- Moderation: report → ẩn tự động khi 5 report
- **Hút user mới:** "Bạn vừa được mời thử quiz của Mai tạo!" → conversion cực cao

### 6.3 🌟 Phase C — AI & Content Differentiator (2-3 tháng)

#### C1. Cowdi AI Tutor (real, không tip tĩnh) — 4 tuần

- LLM (OpenAI / Gemini / Claude) tích hợp chat sidebar
- Context: lesson hiện tại + word học gần nhất + level user
- **Use case:**
  - Giải thích grammar bằng tiếng Việt khi user sai quiz
  - Sinh ví dụ thêm với từ mới
  - Tạo quiz custom theo level user (adaptive)
  - Speaking partner: roleplay hội thoại
- **Limit:** 20 message/ngày miễn phí, premium unlimited

#### C2. Pronunciation Scoring thực sự — 2 tuần

- Whisper API (cheap với whisper-1) hoặc on-device `whisper.cpp`
- Score 0-100 + highlight âm sai (phoneme level)
- Pet skill `speaking` chỉ +XP khi score ≥ 70 → chống cheat

#### C3. Adaptive Difficulty — 2 tuần

- Tracking win-rate + response time per category
- Quiz auto-tune độ khó (easy/medium/hard) theo Elo-like rating
- Pet AI gợi ý: "Bạn yếu Listening, học bài X nhé"

#### C4. Content × 3 — ongoing

- Mục tiêu **3000-5000 quiz** để SRS thực sự đáng giá
- Sinh tự động bằng LLM + human review (tốn ~$50 cho 3k quiz qua GPT-4o-mini)
- 5 chủ đề nóng mới: Business English, Travel, Tech vocab, Movie/Music, Daily Conversation
- 2-3 lesson/tuần do AI sinh + 1 editor duyệt

### 6.4 📱 Phase D — Mobile & Reach (2-3 tháng)

#### D1. PWA hoàn chỉnh — 1 tuần

- `vite-plugin-pwa`: service worker offline review, lesson cache
- Install prompt → icon home screen iOS/Android
- Push notification (Web Push API) — streak reminder, duel invite

#### D2. React Native / Expo — 2 tháng

- Share 70% logic (hooks, data, api client)
- Native: pet animation 60fps tốt hơn, haptic, native sound, microphone tốt hơn cho speaking
- Submit App Store / Google Play → kênh discovery mới

#### D3. SEO & Content Marketing — ongoing

- Landing page (`/`) hiện rỗng cho user chưa login → thêm hero "Học tiếng Anh cùng pet ảo"
- Blog `/blog` với 50 bài SEO ("100 từ vựng IELTS", "TOEIC 500 câu hay gặp") → traffic Google
- Mở public lesson preview (không cần login đọc 30% lesson) → ăn long-tail keyword
- OG image dynamic cho duel result → share Facebook đẹp

### 6.5 💰 Phase E — Monetization & Sustainability (3-6 tháng)

| Gói | Giá | Tính năng |
|---|---|---|
| **Free** | 0đ | Tất cả lesson cơ bản, 3 pet, 5 duel/ngày, 20 AI tutor msg/ngày |
| **Cowdi+** | 49k/tháng hoặc 399k/năm | Unlimited duel, unlimited AI tutor, exclusive pet (Legendary), exclusive room/skin, ads-free, ưu tiên matchmaking |
| **Cowdi Family** | 99k/tháng | 4 account, parent dashboard xem progress con |
| **Cowdi School** | B2B liên hệ | Lớp 30-100 hs, teacher dashboard, custom quiz, export grade |

> Tham khảo: Duolingo Super 89k/tháng VN. Cowdi rẻ hơn 40% với pet system khác biệt → easy decision.

### 6.6 🛡️ Phase F — Quality & Compliance (xuyên suốt)

- **Test foundation:** Vitest + RTL cho hooks (useAuth/useUser/usePet) + Playwright cho 3 happy path (login, làm 1 lesson, duel). Mục tiêu: 40% coverage trong 2 tháng.
- **TypeScript incremental:** `allowJs=true`, đổi hooks → `.ts` trước, sau đó data layer.
- **A11y AA:** axe-core CI, alt text, contrast ratio 4.5+, focus visible.
- **GDPR/Privacy:** Trang `/privacy`, `/terms`, button "Xoá tài khoản" gọi `DELETE /api/me` (cascade).
- **GitHub Actions CI:** lint + test + build trên PR.

---

## 7. ROADMAP TỔNG HỢP — 6 THÁNG

```
Tháng 5         │ Tháng 6        │ Tháng 7-8       │ Tháng 9-10      │ Tháng 11-12
─────────────── │ ────────────── │ ─────────────── │ ─────────────── │ ─────────────
Phase A         │ Phase B (B1-B2)│ Phase B (B3-B4) │ Phase C (C1-C2) │ Phase D + E
Polish + Perf   │ Real-time +    │ Streak viral +  │ AI Tutor +      │ PWA, Mobile,
Security        │ Friends/Guild  │ UGC custom quiz │ Pronunciation   │ Monetization
                │                │                 │ Adaptive        │
─────────────── │ ────────────── │ ─────────────── │ ─────────────── │ ─────────────
KPI: Lighthouse │ KPI: 30% MAU   │ KPI: viral coef │ KPI: AI msg/    │ KPI: 5%
95+, 0 critical │ duel weekly,   │ k≥0.3, share/   │ user/day ≥ 3,   │ premium conv,
bug, p95 < 300ms│ +50% retention │ user ≥ 0.5/tuần │ NPS ≥ 50        │ MRR ≥ 50tr
```

### 7.1 Top 5 Quick Wins tuần này (~7h tổng)

| # | Task | Giờ | Đầu ra |
|---|---|---|---|
| 🔥 1 | `React.lazy()` 17 page + Suspense | 4h | LCP -60% |
| 🔥 2 | `helmet` + `express-rate-limit` | 1h | Security baseline |
| ⚡ 3 | 4 DB indexes migration | 30m | Leaderboard 10× |
| ⚡ 4 | ErrorBoundary page-level | 1h | Không trắng trang |
| 💡 5 | `.env.example` + startup validate | 30m | Dev onboard |

---

## 8. METRICS THEO DÕI ĐỀ XUẤT

### 8.1 Engagement
- **DAU/MAU** (target 30%+ → sticky)
- **Streak median** (target 7+ ngày)
- **Duel/user/tuần** (target 5+)
- **Share/user/tuần** (target 0.5+)

### 8.2 Learning
- **Words learned/user/tuần** (target 30+)
- **Quiz accuracy theo skill** (track 4 trục để adaptive)
- **Lesson completion rate** (target 70%+ trong unit)

### 8.3 Technical
- **Lighthouse Performance** (target 95+)
- **p95 API latency** (target <300ms)
- **Error rate** (target <0.1%)
- **Bundle size route lớn nhất** (target <250KB gzipped)

### 8.4 Business
- **CAC** (cost acquire user) — track theo channel
- **Premium conversion** (target 3-5%)
- **Viral coefficient k** (target ≥0.3 để self-growth)

---

## 9. KẾT LUẬN

Cowdi-English có **nền tảng cực vững** và **ý tưởng khác biệt thật sự** (Pet × Language). Báo cáo cũ ([EVALUATION-2026-04.md](EVALUATION-2026-04.md)) đã cảnh báo đúng các vấn đề kỹ thuật, nhưng để **bùng nổ user**, riêng kỹ thuật thôi không đủ — cần **3 đòn bẩy chiến lược**:

1. **Real-time Duel + Social Loop** (Phase B) → biến mỗi user thành kênh marketing miễn phí.
2. **AI Tutor thông minh** (Phase C1) → định vị Cowdi là "Duolingo có pet và có gia sư AI" — vừa tốt hơn Cake về gamification, vừa tốt hơn Duolingo về AI tutor.
3. **PWA + Mobile** (Phase D) → vào kênh phân phối App Store / Google Play.

Với roadmap 6 tháng + 1-2 dev fulltime + ngân sách AI ~$200/tháng, Cowdi có thể đạt:
- **10k MAU** (cuối tháng 8)
- **500 premium subscriber** ≈ 25tr MRR (cuối tháng 12)
- **Sản phẩm production-grade** sẵn sàng gọi vốn seed nếu muốn.

> **Khẩu hiệu đề xuất:** *"Học tiếng Anh — Nuôi pet — Đấu bạn bè."* Ba động từ, ba vòng lặp engagement, một câu hook duy nhất.

---

*Báo cáo lập bởi: GitHub Copilot · Phiên bản: 2026-04-27*
