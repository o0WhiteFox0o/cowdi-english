# RPT-FRIENDS-SURVEY — Báo cáo Khảo sát Mã nguồn (Bước 0: Bạn bè & Thưởng mời bạn)

> **Ngày khảo sát:** 2026-11-25 · **Commit cơ sở:** `eb40fb3` (`main`) · **Tài liệu đối chiếu:** [SRS-FRIENDS-v1.1.md](../04-design/SRS-FRIENDS-v1.1.md) · [TASK-FRIENDS.md](TASK-FRIENDS.md)

---

## 1. Luồng `InvitePage` → Đăng nhập Google → `POST /api/invites/:code/claim`

- **Nhận thiệp và lưu mã chờ:** `src/pages/InvitePage.jsx` (dòng 24–26) lưu mã thiệp vào `localStorage.setItem('cowdi_pending_invite', code)` khi mở `/i/:code`.
- **Tải thông tin thiệp:** `src/pages/InvitePage.jsx` (dòng 29–46) gọi `GET ${API}/api/invites/${code}` không cần auth.
- **Tự động gọi claim:** `src/pages/InvitePage.jsx` (dòng 49–66) có `useEffect` theo dõi `[user, token, invite, claimed]`, khi đã đăng nhập thì tự gọi `POST /api/invites/${code}/claim` và xoá `cowdi_pending_invite` (dòng 54–58).
- **Lỗi đứt luồng OAuth đang tồn tại:** `src/pages/AuthCallbackPage.jsx` (dòng 36–40) sau khi lưu JWT và nhận `user` **luôn `navigate('/account', { replace: true })`**, không đọc `cowdi_pending_invite`. Tìm toàn repo xác nhận `cowdi_pending_invite` chỉ xuất hiện ở `InvitePage.jsx:25` và `InvitePage.jsx:58`.
  - **Hệ quả:** Người mới mở `/i/:code` → bấm "Nhận trứng (đăng nhập Google)" → quay về `/auth-callback` → bị chuyển sang `/account`, **không quay lại `/i/:code` nên không bao giờ claim được thiệp**.
- **Server `POST /api/invites/:code/claim`:** `server/routes/invites.js` (dòng 113–139) hiện chỉ kiểm tra hết hạn, tự nhận, đã bị người khác nhận rồi cập nhật `claimed_by`, `claimed_at`. **Chưa** kiểm tra tài khoản mới / đã từng nhận thiệp chưa, **chưa** lưu IP/device hash, **chưa** kiểm tra `flagged`, và **chưa** tự kết bạn.

## 2. Hàm cấp thưởng bài học & dữ liệu bài mới + ngày hoàn thành

- **Điểm gọi chính:** `PUT /api/progress` trong `server/routes/api.js` (dòng 220–363) gọi `grantLessonAndUnitRewards(...)` tại dòng 327–332, sau đó gọi `recordActivity(...)` (`server/utils/streak-manager.js`) tại dòng 340–345.
- **Chi tiết `grantLessonAndUnitRewards`:** `server/utils/wallet.js` (dòng 128–210) chỉ nhận mảng `completedLessons` (tổng danh sách ID bài đã học), lọc qua `validLessonIdsSet` (`shared/lesson-ids.json`), rồi lấy `validCompleted.length` chia cho `GEM_PER_NEW_LESSONS` (2) và `STONE_PER_NEW_LESSONS` (10).
- **Khoảng trống với BR-01:**
  - `PUT /api/progress` (dòng 240–243) hiện chỉ `SELECT learner_group, active_path, lesson_scores, placement`, **chưa đọc `completed_lessons` cũ** để phát hiện bài nào **vừa hoàn thành lần đầu**.
  - Server **chưa có bảng lưu ngày hoàn thành lần đầu của từng bài học** (không nên tin `active_days` gửi từ client vì client có thể giả mạo).
  - **Hướng xử lý:** Thêm bảng server `user_lesson_first_completions (user_id, lesson_id, completed_date DATE, completed_at DATETIME, PRIMARY KEY (user_id, lesson_id))`. Trong `PUT /api/progress`, diff `rawCompleted` với `existing.completed_lessons` (và `INSERT IGNORE` theo ngày giờ VN `getTodayInTz('Asia/Ho_Chi_Minh')` từ `server/utils/streak-manager.js:14-26`). Khi có bài mới, kiểm tra điều kiện BR-01 và cộng thưởng mời bạn trong cùng transaction.

## 3. Nơi lưu Vé gacha (GĐ6) và Danh hiệu (Title)

- **Vé gacha:** GĐ6 chưa triển khai.
  - `server/db/migrate-v2-foundation.sql` (dòng 35–46): `wallet_ledger.currency` đang là `ENUM('milk','gem','stone','stone_shard')`.
  - `server/utils/wallet.js` (dòng 86–122): `getWallet()` tổng hợp `{ milk, gem, stone, stone_shard }`.
  - `shared/game-config.js` (dòng 53–58, 80–84): `CURRENCIES` và `LEDGER_REASONS` chưa có `gacha_ticket` và các reason mời bạn.
  - **Hướng xử lý (khớp SRS mục 2.2 & 6):** Mở rộng `wallet_ledger.currency` thêm `'gacha_ticket'`, thêm `gacha_ticket` vào `getWallet()` và `CURRENCIES`, hiển thị trên UI là *"Vé gacha (sắp dùng được)"*. Thêm bảng theo dõi vé dời sang tháng sau (`invite_ticket_queue` hoặc ghi nhận mốc + giải ngân theo trần 3 vé/tháng dương lịch BR-04 khi vào tháng mới).
- **Danh hiệu ("Người dẫn đường", "Người gieo mầm", "Đại sứ Cowdi"):**
  - `TASK.md` (dòng 134): khung avatar & danh hiệu được dời từ GĐ4 sang GĐ5.
  - Tuy nhiên bảng `owned_cosmetics` đã tồn tại từ GĐ4 (`server/db/migrate-v2-cosmetics.sql`, dòng 7–19) với cấu trúc linh hoạt: `(user_id, cosmetic_id VARCHAR(64), category VARCHAR(32), currency VARCHAR(16), price_paid, acquired_from VARCHAR(32), created_at DATETIME, updated_at TIMESTAMP, UNIQUE (user_id, cosmetic_id))`.
  - `server/utils/cosmetics-manager.js` (dòng 25–102) đọc `owned_cosmetics` kết hợp `pet_data.ownedItems`.
  - **Hướng xử lý:** Lưu danh hiệu mời bạn vào ngay bảng `owned_cosmetics` với `category = 'title'`, `currency = 'free'`, `price_paid = 0`, `acquired_from = 'invite_milestone'` (tránh tạo bảng dư thừa, khớp định hướng GĐ5).

## 4. Cách Express & Nginx phục vụ `index.html` trên Production (KHÔNG BỊ CHẶN)

- **Cổng Express:** `server/index.js` (dòng 20): `PORT = process.env.PORT || 3001`, đã bật `app.set('trust proxy', 1)` (dòng 23).
- **Các route hiện tại của Express:** `server/index.js` (dòng 55–64) chỉ mount `/auth`, `/api/invites`, `/api/shop`, `/api/admin/pet-motion`, `/api/pet-motion`, `/api/admin`, `/api`, `/health`. Express hiện **không** serve static `dist/`.
- **Cấu trúc triển khai Production (`deploy.ps1` & `nginx-spa.conf`):**
  - `deploy.ps1` (dòng 35–43) chép toàn bộ nội dung `dist-prod/*` (bao gồm `index.html`) ra gốc `/www/wwwroot/cowdi.net/`, còn `server/` nằm tại `/www/wwwroot/cowdi.net/server/`.
  - `nginx-spa.conf` (dòng 55, 132–160): Nginx phục vụ trực tiếp file tĩnh từ `root /www/wwwroot/cowdi.net` và proxy `/auth/`, `^~ /api/`, `/health` sang `http://127.0.0.1:3001`.
- **Kết luận cho câu 4 (không cần dừng/đổi kiến trúc deploy):**
  - Express **hoàn toàn phục vụ được `GET /i/:code`** bằng cách đọc `index.html` theo chuỗi fallback: `process.env.INDEX_HTML_PATH` → `../dist-prod/index.html` → `../dist/index.html` → `../index.html` (trên production `/www/wwwroot/cowdi.net/server/` trỏ `../index.html` chính là `/www/wwwroot/cowdi.net/index.html`).
  - Trên aaPanel Nginx chỉ cần thêm 1 block `location ^~ /i/` trước `location /` để proxy về `http://127.0.0.1:3001` (tương tự `location ^~ /api/`).
- **Thẻ OG hiện tại:** `index.html` (phần `<head>`) có thẻ `og:title`, `og:description`, `og:image` (`https://cowdi.net/pwa-512x512.png`), `og:url`, `twitter:*` dùng chung. Thư mục `public/image/og/` hiện **chưa tồn tại** (ảnh pet tĩnh nằm tại `public/assets/images/pets/<TenPet>/`).

## 5. Luồng Duel & chỗ cộng League Points

- **Lưu ý sai khác tên route so với SRS:** SRS mục 7 ghi `POST /api/duels`, nhưng **code thật dùng số ít `/api/duel`**:
  - `POST /api/duel` — tạo thách đấu (`server/routes/api.js`, dòng 600–676).
  - `GET /api/duel/open` — danh sách kèo mở (`server/routes/api.js`, dòng 680–733).
  - `GET /api/duel` — danh sách kèo của tôi (`server/routes/api.js`, dòng 736–759).
  - `GET /api/duel/:id` — chi tiết câu hỏi (`server/routes/api.js`, dòng 762–814).
  - `POST /api/duel/:id/join` — đối thủ nộp bài & tính kết quả qua `simulateBattle` (`server/routes/api.js`, dòng 817–1042).
  - *Quyết định theo nguyên tắc `code thật > SRS`:* mở rộng trực tiếp `POST /api/duel` (thêm `opponentId` tuỳ chọn) thay vì tạo endpoint `/api/duels` trùng lặp.
- **Chỗ cộng `league_points` hiện tại:**
  1. `server/routes/api.js` (dòng 663–669): cộng `+5` `league_points` ngay khi tạo thách đấu trong `POST /api/duel`.
  2. `server/routes/api.js` (dòng 930–986): cộng `+30` (thắng), `+5` (thua), `+15` (hoà) cho hai bên trong `POST /api/duel/:id/join`.
- **Chi tiết bảng `challenges`:** `server/db/migrate-social.sql` (dòng 10–29) đã có cột `opponent_id INT UNSIGNED DEFAULT NULL`, nhưng hiện chỉ ghi lúc `join`. Cần thêm cột `is_friend_duel TINYINT(1) NOT NULL DEFAULT 0` (và cho phép set `opponent_id` ngay lúc `POST /api/duel` nếu là thách đấu bạn bè):
  - `GET /api/duel/open`: lọc thêm `AND c.is_friend_duel = 0 AND c.opponent_id IS NULL`.
  - `GET /api/duel/:id` & `POST /api/duel/:id/join`: nếu `is_friend_duel = 1`, bắt buộc `req.user.id === challenge.opponent_id` và vẫn là bạn `accepted` (không chặn nhau), nếu không trả `403`.
  - Bỏ qua cộng/trừ `league_points` (ở cả `POST /api/duel` và `POST /api/duel/:id/join`) khi `is_friend_duel = 1` (BR-06).

## 6. Chữ ký thật của `buildPathNodes` và `getNextPathLesson`

- Vị trí: `src/data/path.js`
  - `getPathById(id)` (dòng 38–41): trả đối tượng `path` (`beginner`, `intermediate`, `ielts`, `b1`, `b2`, `toeic`, `advanced`).
  - `buildPathNodes(path, userData)` (dòng 66–174): trả mảng node `{ type: 'lesson'|'checkpoint', key, lessonId?, unit, unitIndex, status: 'done'|'current'|'open'|'placed'|'locked', index }`.
  - `getNextPathLesson(userData, pathId)` (dòng 238–245): trả `{ type: 'lesson', lessonId, unit }` | `{ type: 'checkpoint', unit }` | `null` (nếu đã hoàn thành toàn bộ lộ trình).
- **Trường `userData` cần thiết:**
  - `completedLessons`: `string[]` (dòng 70).
  - `checkpointScores`: `{ [unitId]: { passed: boolean, source?: string } }` (dòng 71, 90, 98–100).
  - `activePath`: `string` (dòng 239, dùng khi không truyền `pathId`).
- **Ánh xạ từ `GET /api/friends/path-progress`:** Server chỉ trả `passedUnits: string[]` (không trả điểm số theo BR-08). Client tạo `checkpointScores` giả lập `{ [unitId]: { passed: true } }` rồi gọi trực tiếp `buildPathNodes` / `getNextPathLesson` — đảm bảo 100% đồng nhất luật mở khoá 3 nhóm.

## 7. Cơ chế Admin & các ràng buộc kỹ thuật phát hiện thêm

- **Admin có sẵn:**
  - Backend: `requireAdmin` trong `server/middleware/auth.js` (dòng 34–55, kiểm tra `users.is_admin` trực tiếp từ DB), router gắn ở `/api/admin` (`server/routes/admin.js`, `server/index.js:60`).
  - Frontend: `src/components/RequireAdmin.jsx`, trang `/admin` (`src/pages/AdminPage.jsx`).
- **Biệt danh hiện có:**
  - `server/db/schema.sql` (dòng 49): `user_progress.nickname VARCHAR(20)` đã tồn tại và đang dùng ở `/api/duel` (`api.js:703,741,768`) và `/api/rankings` (`api.js:1048,1061`).
  - `PUT /api/me/nickname` cần cập nhật **đồng bộ cả `users.nickname` và `user_progress.nickname`** (và giữ giới hạn 2–20 ký tự đúng FR-FRD-05) để không bị lệch hiển thị giữa Bạn bè, Đấu trường và Bảng xếp hạng.
- **Ràng buộc MySQL < 5.6.5 trên Production (`RK-005` trong `LOG-PROGRESS.md`):**
  - **Cấm dùng kiểu cột `JSON`** (như `props JSON` gợi ý ở `TASK-FRIENDS.md` Bước 7) → phải đổi sang **`LONGTEXT`**.
  - **Tối đa 1 cột `TIMESTAMP` có `CURRENT_TIMESTAMP`** trên mỗi bảng → các cột thời gian còn lại (như `accepted_at`, `created_at` thứ hai) dùng `DATETIME DEFAULT NULL`.
  - **Không dùng `USE cowdi_english;`** trong file SQL migration mới; tạo thêm runner `scripts/run-friends-migration.js` để `deploy.ps1` tự đóng gói vào `deploy.zip`.
- **Thư viện QR phía client (FR-LND-04):**
  - `package.json` hiện chưa cài thư viện tạo QR (chỉ có `react`, `react-dom`, `react-router-dom`). Cần thêm gói nhẹ `qrcode` ở Bước 2 để thay hoàn toàn `api.qrserver.com` trong `src/features/invite/InviteSheet.jsx:23-25` và dùng chung cho QR mã bạn bè ở Bước 4.
