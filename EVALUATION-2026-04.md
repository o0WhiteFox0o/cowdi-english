# 📊 BẢNG ĐÁNH GIÁ DỰ ÁN COWDI-REACT — THÁNG 4/2026

> **Thời điểm đánh giá:** 24/04/2026 · **Cập nhật:** 27/04/2026 (PWA)
> **Phạm vi:** Toàn bộ codebase FE + BE + Data + Deployment
> **Trạng thái tổng quan:** ✅ Vượt MVP, cần tối ưu & mở rộng

---

## 1. TỔNG QUAN KIẾN TRÚC

### Stack công nghệ
- **Frontend:** React 18.3 · React Router 6.26 · Vite 5.4 · Bootstrap 5 (CDN)
- **Backend:** Express.js · MySQL 5.5+ (mysql2/promise) · Passport Google OAuth 2.0 · JWT (7 ngày)
- **Deploy:** aaPanel + Nginx SPA · domain `cowdi.net`
- **Build:** `npm run build:prod` → `dist-prod/`

### Luồng dữ liệu chính
```
Google OAuth → JWT → useAuth hook
  ↓
useUser / usePet hooks  →  user_progress (JSON cols: pet_data, word_status, srs_data, league_points)
  ↓
REST API: /api/progress, /api/pet-data, /api/duel*, /api/rankings
```

### Cấu trúc thư mục
- `src/pages/` — **ACTIVE** (App.jsx import từ đây)
- `src/features/` — nửa orphan (duel/, lesson/, pet/, practice/, review/, mini-games/)
- `src/components/layout/` — ACTIVE (Navbar, Toast, CowdiChat)
- `src/components/` (root) — **duplicate orphan**
- `src/data/` — lessons, vocab-topics, pets, quiz bank, config
- `server/` — routes, middleware, db migrations

---

## 2. TÍNH NĂNG HIỆN CÓ

| Nhóm | Tính năng | Trạng thái |
|---|---|---|
| 📚 **Học tập** | 62 bài lesson, 80+ vocab topic, ~370 quiz (MCQ/grammar/listening/sentences), flashcard 3D, TTS + speak-along, Learning Paths (IELTS/TOEIC/B1/B2/Advanced) | ✅ Đầy đủ |
| 🐮 **Pet system** | 15 pet × 5 evolution × 4 skill (speech/intelligence/perception/creativity), 4 nhu cầu Tamagotchi, custom name, evolution images | ✅ Đầy đủ |
| 💰 **Economy** | 27 shop item (5 category), coins, equipment | ✅ Đầy đủ |
| 🎮 **Competitive** | **Duel v2** (10/20/30 câu, 4 category, lời nhắn, per-question time, round-win scoring), Leaderboard ẩn danh, Student Ranking, League (Bronze→Master) | ✅ Nâng cấp 4/2026 |
| ✨ **Gamification** | Streak 28 ngày, 18 achievements auto-check, Daily Quests, XP 8 level (0→2500), sound FX | ✅ Đầy đủ |
| 🎯 **Mini-games** | Word Catch, Sentence Puzzle, TyperShark | ✅ 3 game |
| 📊 **Persistence** | Google OAuth, JWT, MySQL cloud sync, SM-2 schema sẵn sàng | ⚠️ SRS chưa triển khai UI |
| 📱 **PWA** | Service worker (Workbox), Web Manifest, install prompt Android/iOS, offline API cache, OG meta, Apple touch icons | ✅ Triển khai 27/04/2026 |

### Nâng cấp tháng 4/2026
- ✅ LearningPath: thêm IELTS Foundation/Pre, TOEIC Basics/Elementary/Advanced, track C1-C2
- ✅ LessonsPage: gỡ bộ lọc Chương trình trùng
- ✅ ReviewPage: 3-state landing, SM-2 preview, UX không ép suy nghĩ
- ✅ Duel v2: per-question timing, chọn 10/20/30 câu, chọn chủ đề, gửi lời nhắn, round-win scoring
- ✅ Listening TTS: tự phát + nút 🔊 Nghe lại/🐢 Chậm
- ✅ **PWA** (27/04): `vite-plugin-pwa` Workbox generateSW, Web Manifest (name/icons/shortcuts/categories), install prompt Android + iOS, offline cache API (StaleWhileRevalidate cho progress/pet-data, NetworkFirst cho rankings), Google Fonts/CDN cache, OG/Twitter meta, Apple touch icons 192px/512px, `pwa:icons` npm script

---

## 3. ĐIỂM MẠNH

### 🎮 Thiết kế gamification
- **Pet + ngôn ngữ là USP**: chưa app nào kết hợp tốt như vậy (Duolingo không có pet system sâu)
- **Leaderboard ẩn danh**: so pet thay vì người → tránh toxic
- **Multi-axis progression**: XP (level), Coins (shop), Skill XP (4 trục), Pet evolution

### 📈 Content coverage
- 8+ dạng bài: MCQ, flashcard, dictation, T/F, matching, speaking, reading, listening
- 5 exam paths thực tế (IELTS 7u/20L, B1 5u/10L, B2 5u/11L, TOEIC 7u/15L, Advanced 2u/6L)

### 🛡️ Foundation kỹ thuật
- Parameterized queries (mysql2 prepare) → **SQL injection protected**
- JWT stateless → dễ scale horizontal
- CORS + httpOnly session cookies
- Feature-based folder structure
- Duel v2 dùng migration idempotent (an toàn chạy lại)

### ✨ Duel Arena độc đáo
- HP bar, elemental skill (fire/water/nature/cosmic/earth), critical hit <3s, combo ≥3
- Round-win scoring theo tốc độ per-question (mới 4/2026)
- Lời nhắn thách đấu (giới hạn 280 ký tự)

---

## 4. ĐIỂM YẾU / NỢ KỸ THUẬT

### 🔥 Critical
| # | Vấn đề | Impact |
|---|---|---|
| 1 | **Duplicate `src/pages/` vs `src/features/`** — 8 page trùng trong features/ nhưng App.jsx dùng pages/ | +800KB source rác, confusion |
| 2 | **Bundle single chunk 998KB** — 0 route code splitting | LCP +2-3s |
| 3 | **Duplicate components** — `components/{CowdiChat,Navbar,Toast}.jsx` trùng `components/layout/` | Import lộn, build rác |
| 4 | **0% test coverage** — pet evolution, duel scoring, SRS chưa test | Regression risk cao |
| 5 | **Không TypeScript** — `pet_data` JSON có thể null/string/object | `undefined.property` bugs |

### ⚡ High
| # | Vấn đề | Impact |
|---|---|---|
| 6 | Không rate-limit `/api/*` | Spam duel, OAuth abuse |
| 7 | Thiếu `helmet` (CSP, X-Frame, X-Content-Type) | Security baseline yếu |
| 8 | Thiếu DB indexes: `league_points`, `challenger_id+created_at`, `user_id` | Leaderboard chậm khi scale |
| 9 | **SRS chưa dùng** — schema SM-2 có sẵn nhưng Review chỉ loop | Bỏ phí data structure |
| 10 | Duel vẫn async — UI Pokemon nhưng 2 người không cùng thời điểm | Chưa thật sự real-time |

### 💡 Medium
| # | Vấn đề | Impact |
|---|---|---|
| 11 | Accessibility ~Level A, thiếu aria-label cho quiz options | WCAG chưa đạt AA |
| 12 | i18n hard-code tiếng Việt, không có framework | Khó mở rộng EN/vi-vi UI |
| 13 | ~~Không PWA/offline~~ | ✅ **Đã xử lý 27/04/2026** — vite-plugin-pwa, service worker, install prompt |
| 14 | Không `.env.example` | Dev mới khó bootstrap |
| 15 | Không ErrorBoundary | 1 crash = trắng trang |

---

## 5. METRICS HIỆN TẠI

| Chỉ số | Giá trị | Status |
|---|---|---|
| Bundle size (main JS) | **998 KB / 1 chunk** | 🔴 |
| Pages count | 17 | ✅ |
| Quiz questions | ~370 | ⚠️ (cần 1000+) |
| Pet count | 15 × 5 evo | ✅ |
| Exam paths | 5 (62 lessons) | ✅ |
| Test coverage | **0%** | 🔴 |
| TypeScript | 0% | 🔴 |
| Accessibility (WCAG) | ~Level A | ⚠️ |
| Mobile responsive | Partial | ⚠️ |
| PWA (installable) | **✅ Đã có** — sw.js + manifest | 🟢 |
| DB indexes (critical tables) | Thiếu 4 | 🔴 |
| Rate limiting | Không | 🔴 |

---

## 6. ROADMAP ĐỀ XUẤT

### 🚀 Ngắn hạn (1-2 tuần — Polish & Stabilize)
| # | Task | Effort | Impact |
|---|---|---|---|
| S1 | Xoá `src/features/` (orphan) + 3 component trùng | 1h | -30% code rác |
| S2 | `React.lazy()` 17 pages + `<Suspense>` + ErrorBoundary | 4h | **-60% LCP** |
| S3 | `express-rate-limit` + `helmet` cho `/api/*` | 1h | Bảo mật baseline |
| S4 | Thêm 4 DB indexes (league_points, challenger_id+created_at, user_id) | 30m | Leaderboard 10× |
| S5 | `.env.example` + validate startup | 30m | Dev bootstrap |
| S6 | ErrorBoundary page-level + loading skeletons | 2h | UX pro |
| S7 | Bundle analyzer (`rollup-plugin-visualizer`) | 30m | Track size per route |

**Tổng: ~9.5h** — Có thể hoàn thành trong 2-3 ngày làm việc.

### 📈 Trung hạn (1-2 tháng — Features)
- **Real-time duel (Socket.io)**: đồng bộ answers → battle animation, ghost replay (dùng `questionTimes` đã có)
- **SRS thực sự trong ReviewPage**: triển khai SM-2 (interval, easeFactor, nextReview)
- **Social**: friends list, private duel invite, chat lobby
- **Pet AI companion**: gợi ý trong lesson, động viên khi streak thấp
- **Testing foundation**: Vitest + RTL, cover useAuth/usePet/useUser + duel scoring
- **TypeScript incremental**: allowJs=true, hooks → .ts trước
- ~~**PWA**: service worker offline review, push notif duel invite~~ → ✅ Hoàn thành 27/04/2026 (service worker + manifest + install prompt + offline API cache)
- **PWA Push Notification**: Web Push API cho streak reminder & duel invite (bước tiếp theo)
- **Progress analytics dashboard**: biểu đồ XP/streak/win-rate theo tuần

### 🌟 Dài hạn (3-6 tháng — Scale)
- **Backend**: tách microservice (auth/duel/content), Redis cache leaderboard, read replica MySQL
- **AI content**: sinh quiz từ vocab level user (OpenAI embed)
- **React Native**: share 70% logic (hooks, data, api client)
- **Monetization**: Premium (unlimited pets, exclusive skins, ads-free)
- **UGC community**: user-created lessons/quiz + moderation
- **Pronunciation scoring**: Whisper API thực sự (hiện chỉ Web Speech đơn giản)
- **Adaptive difficulty**: theo win/loss + response time

---

## 7. QUICK WINS — TOP 5 TUẦN NÀY

| Ưu tiên | Task | Giờ | Kết quả |
|---|---|---|---|
| 🔥 1 | Xoá `src/features/` + `components/{CowdiChat,Navbar,Toast}.jsx` trùng | 1h | Code clean, -30% rác |
| 🔥 2 | Lazy load 17 pages + Suspense + ErrorBoundary | 4h | LCP giảm 60% |
| ⚡ 3 | `helmet` + `express-rate-limit` (100 req/15min) | 1h | Security baseline |
| ⚡ 4 | 4 DB indexes qua migration file | 30m | Leaderboard 10× |
| 💡 5 | `.env.example` + startup validation | 30m | Dev onboard nhanh |

**Tổng: ~7h** — Impact cực lớn so với effort.

---

## 8. KẾT LUẬN

Cowdi-React đã **vượt mức MVP**, foundation vững, gamification pet system là USP thực sự khác biệt.

- **Muốn scale 10k+ users** → ưu tiên: bundle splitting + SRS thực sự + real-time duel (WebSocket)
- **Muốn maintain bền vững** → TypeScript incremental + test coverage + cleanup orphan code
- **Content** tốt nhưng cần **×3 quiz** (~1000 câu) để SRS có giá trị thực sự
- **Security** cần baseline (rate limit + helmet) trước khi public rộng

Với 2 developer + 6 tháng theo roadmap trên, dự án có thể đạt **production-grade** và monetize được.

---

*Đánh giá bởi: GitHub Copilot · Phiên bản: 2026-04-24*

---

## 9. CHANGELOG CẬP NHẬT

### 27/04/2026 — PWA Implementation
- **`vite-plugin-pwa` v1.2.0** — generateSW mode (Workbox)
- **Web Manifest** (`dist-prod/manifest.webmanifest`): name, short_name, theme_color, icons 192/512, shortcuts (/practice, /duel), categories education/games
- **Service Worker** (`dist-prod/sw.js` + `workbox-*.js`): precache 17 entries (1748 KiB), navigateFallback /index.html, exclude /api /auth /health
- **Runtime cache**: StaleWhileRevalidate cho progress/pet-data (1h), NetworkFirst cho rankings (5 phút), CacheFirst cho Fonts/CDN (365/30 ngày)
- **PWAInstallPrompt component** (`src/components/PWAInstallPrompt.jsx`): Android `beforeinstallprompt`, iOS hướng dẫn Share→Add, dismiss persist vào localStorage
- **index.html**: theme-color, apple-mobile-web-app-*, OG/Twitter meta, apple-touch-icon, `pwaSlideUp` animation
- **`scripts/generate-pwa-icons.mjs`** + `npm run pwa:icons`: tự sinh pwa-192×192.png, pwa-512×512.png từ SVG logo bằng sharp
- **Loại trừ icon lớn** khỏi precache: `/assets/images/Icons/` và `/assets/images/pets/` (SVG 4.87MB→ không precache, cached on demand)
