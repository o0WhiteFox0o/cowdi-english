# KẾ HOẠCH & CHECKLIST TỐI ƯU HÓA DỰ ÁN COWDI ENGLISH (THÁNG 10/2026)
**Dự án:** Cowdi English Platform (`cowdi.net`)  
**Ngày lập kế hoạch:** 05/10/2026  
**Mục tiêu:** Tối ưu hóa hiệu năng Database, giảm kích thước bundle Frontend, tái cấu trúc mã nguồn theo Clean Architecture, thiết lập kiểm thử tự động và gia cố an toàn bảo mật.

---

## 📅 BẢNG THEO DÕI TIẾN ĐỘ TỔNG QUAN

| Giai đoạn | Nội dung trọng tâm | Ước lượng | Trạng thái |
| :--- | :--- | :---: | :---: |
| **Giai đoạn 1** | Tối ưu Cơ sở dữ liệu & Bảo vệ Backend | 4 – 5 giờ | `[ ] Chưa bắt đầu` |
| **Giai đoạn 2** | Tối ưu Bundle Size & Tốc độ tải trang Frontend | 4 – 5 giờ | `[ ] Chưa bắt đầu` |
| **Giai đoạn 3** | Tái cấu trúc các Mega-Components (>1,000 dòng) | 8 – 11 giờ | `[ ] Chưa bắt đầu` |
| **Giai đoạn 4** | Thiết lập Bộ kiểm thử tự động (Unit Test Vitest) | 3 – 4 giờ | `[ ] Chưa bắt đầu` |
| **Giai đoạn 5** | Bảo mật nâng cao & Chuẩn hóa kiến trúc dài hạn | 1 – 2 tuần | `[ ] Kế hoạch` |

---

## 🔴 GIAI ĐOẠN 1: TỐI ƯU DATABASE & BẢO VỆ BACKEND (ƯU TIÊN KHẨN CẤP)

### [ ] Nhiệm vụ 1.1: Khắc phục nghẽn bộ nhớ O(N) tại API Leaderboard
* **Mục tiêu:** Thay vì kéo toàn bộ chuỗi JSON `pet_data` của mọi user về RAM Node.js để tính `power`, lưu sẵn các giá trị số nguyên vào bảng `user_progress` và đánh INDEX.
* **Thời gian ước tính:** 2 – 3 giờ
* **Mức độ rủi ro:** Thấp (không thay đổi cấu trúc trả về của API).
* **Các file tác động:** `server/db/`, `server/routes/api.js`.

> [!TIP]
> #### 📋 Câu Prompt thực thi (Copy & Paste vào khung chat):
> ```text
> Hãy giúp tôi tối ưu hóa endpoint GET /api/leaderboard trong file server/routes/api.js:
> 
> 1. Tạo file migration SQL `server/db/migrate-leaderboard-index.sql` để bổ sung các cột phẳng vào bảng `user_progress`:
>    - `best_pet_power` (INT UNSIGNED NOT NULL DEFAULT 0)
>    - `pet_count` (SMALLINT UNSIGNED NOT NULL DEFAULT 0)
>    - `active_species_id` (VARCHAR(32) DEFAULT NULL)
>    - `active_pet_name` (VARCHAR(64) DEFAULT 'Pet')
>    - Thêm chỉ mục: `INDEX idx_pet_power (best_pet_power DESC)`
> 
> 2. Trong router `PUT /api/pet-data` (server/routes/api.js):
>    - Bổ sung hàm tính toán `best_pet_power` từ payload pet_data trước khi lưu.
>    - Cập nhật đồng thời các cột `best_pet_power`, `pet_count`, `active_species_id`, `active_pet_name` vào DB.
> 
> 3. Cập nhật truy vấn `GET /api/leaderboard`:
>    - Truy vấn trực tiếp các cột phẳng đã có index:
>      `SELECT up.best_pet_power, up.pet_count, up.active_species_id, up.active_pet_name, up.league_points, up.duel_wins, up.duel_losses, u.display_name FROM user_progress up JOIN users u ON u.id = up.user_id WHERE up.best_pet_power > 0 ORDER BY up.best_pet_power DESC LIMIT 50`
>    - Loại bỏ hoàn toàn vòng lặp parse JSON và tính toán in-memory trong Node.js.
> 
> 4. Giữ nguyên định dạng JSON trả về cho frontend để không làm gãy giao diện LeaderboardPage.
> ```

---

### [ ] Nhiệm vụ 1.2: Bổ sung Rate Limiting cho các API cốt lõi
* **Mục tiêu:** Ngăn chặn bot hoặc người dùng xấu spam ghi đè dữ liệu tiến trình học, spam tạo thách đấu PvP làm cạn kiệt tài nguyên máy chủ.
* **Thời gian ước tính:** 1 – 2 giờ
* **Mức độ rủi ro:** Rất thấp.
* **Các file tác động:** `server/package.json`, `server/index.js`, `server/middleware/`.

> [!TIP]
> #### 📋 Câu Prompt thực thi (Copy & Paste vào khung chat):
> ```text
> Hãy cấu hình Rate Limiting để bảo vệ Backend Express của dự án cowdi-english:
> 
> 1. Thêm gói `express-rate-limit` vào server/package.json và cài đặt.
> 2. Tạo middleware `server/middleware/rate-limiter.js` với các bộ giới hạn:
>    - `globalLimiter`: Tối đa 300 requests / 1 phút / IP.
>    - `progressSyncLimiter` (dành cho /api/progress và /api/word-status): Tối đa 60 requests / 1 phút / IP (đủ cho debounce 3s của frontend).
>    - `duelLimiter` (dành cho POST /api/duel): Tối đa 15 requests / 1 phút / IP.
> 3. Tích hợp các middleware này vào server/index.js và server/routes/api.js.
> 4. Lưu ý: Cần giữ nguyên thiết lập `app.set('trust proxy', 1)` để rate limiter nhận diện đúng địa chỉ IP thực từ reverse proxy Nginx trên aaPanel.
> ```

---

## 🟡 GIAI ĐOẠN 2: TỐI ƯU BUNDLE SIZE & TỐC ĐỘ TẢI TRANG (FRONTEND)

### [ ] Nhiệm vụ 2.1: Tách dữ liệu bài học & từ vựng ra khỏi Initial Bundle của trang chủ
* **Mục tiêu:** Ngăn không cho trang chủ `/` tải 1.6MB dữ liệu JS tĩnh (`data-lessons` 757KB và `data-vocab` 841KB), cải thiện đáng kể chỉ số FCP và LCP trên mạng di động.
* **Thời gian ước tính:** 3 – 4 giờ
* **Mức độ rủi ro:** Trung bình (cần kiểm tra kỹ hàm `sanitizeData`).
* **Các file tác động:** `src/hooks/useUser.jsx`, `src/main.jsx`.

> [!TIP]
> #### 📋 Câu Prompt thực thi (Copy & Paste vào khung chat):
> ```text
> Hiện tại file `src/hooks/useUser.jsx` đang import trực tiếp `LESSONS` và `getAllTopicWords()` để tạo danh sách `VALID_WORDS` phục vụ việc lọc dữ liệu rác. Do `UserProvider` nằm ở gốc `src/main.jsx`, việc này khiến toàn bộ ~1.6MB dữ liệu bài học và từ vựng bị tải ngay lập tức tại trang chủ (`/`).
> 
> Hãy giúp tôi tối ưu:
> 1. Tách logic lọc `VALID_WORDS` ra khỏi quá trình khởi tạo ban đầu của useUser. Chỉ nạp danh sách từ hợp lệ theo cơ chế Dynamic Import (`import()`) khi thực sự có thao tác cập nhật từ vựng, hoặc chuyển danh sách từ khóa hợp lệ thành một tập Set tối giản/nhẹ.
> 2. Đảm bảo khi người dùng chỉ vào trang chủ (`/`), trình duyệt không tải hai chunk lớn `data-lessons` và `data-vocab`.
> 3. Chạy `npm run build:prod` để đối chiếu kích thước các bundle trước và sau khi tối ưu.
> 4. Kiểm tra lại việc lưu trữ tiến trình học tập, không để phát sinh lỗi mất dữ liệu người dùng.
> ```

---

### [ ] Nhiệm vụ 2.2: Tối ưu tải Font chữ và CDN Resources
* **Mục tiêu:** Ngăn hiện tượng giật layout/nhấp nháy chữ (FOIT/FOUT) và tối ưu độ trễ render trang đầu tiên.
* **Thời gian ước tính:** 1 – 2 giờ
* **Mức độ rủi ro:** Rất thấp.
* **Các file tác động:** `index.html`.

> [!TIP]
> #### 📋 Câu Prompt thực thi (Copy & Paste vào khung chat):
> ```text
> Hãy kiểm tra và tinh chỉnh file index.html của dự án cowdi-english:
> 1. Kiểm tra các Google Fonts đang nạp (Mali, Patrick Hand, Itim, Sriracha):
>    - Bổ sung tham số `&display=swap` nếu còn thiếu.
>    - Giới hạn các weights thực sự cần thiết, cân nhắc thêm tham số `&subset=vietnamese` để giảm kích thước font.
> 2. Tối ưu thứ tự tải của CSS Bootstrap và FontAwesome từ CDN để hạn chế Render-blocking resources.
> 3. Đảm bảo toàn bộ thẻ PWA meta, JSON-LD Schema.org và Open Graph không bị ảnh hưởng.
> ```

---

## 🟢 GIAI ĐOẠN 3: TÁI CẤU TRÚC "MEGA-COMPONENTS" (CLEAN CODE)

### [ ] Nhiệm vụ 3.1: Chia nhỏ PracticePage (~1,946 dòng)
* **Mục tiêu:** Tách file luyện tập khổng lồ thành các component con chuyên biệt theo 4 kỹ năng (Nghe, Nói, Đọc, Viết) và 1 custom hook quản lý câu hỏi.
* **Thời gian ước tính:** 4 – 6 giờ
* **Mức độ rủi ro:** Trung bình (cần bảo toàn luồng âm thanh và tính điểm `skillXP`).
* **Các file tác động:** `src/features/practice/`.

> [!TIP]
> #### 📋 Câu Prompt thực thi (Copy & Paste vào khung chat):
> ```text
> File `src/features/practice/PracticePage.jsx` hiện có gần 2,000 dòng mã với hơn 20 dạng bài tập. Hãy giúp tôi tái cấu trúc (refactor) file này theo chuẩn Clean Architecture:
> 
> 1. Tạo thư mục `src/features/practice/components/` và tách các chế độ bài tập thành các component con độc lập:
>    - `VocabQuizMode.jsx`: Các dạng trắc nghiệm từ vựng, điền từ, đoán từ, ghép chữ.
>    - `ListeningQuizMode.jsx`: Nghe chọn từ, nghe câu, nghe chép chính tả (dictation).
>    - `SpeakingQuizMode.jsx`: Luyện phát âm từ, đọc to câu, phản xạ nói nhanh.
>    - `SentenceQuizMode.jsx`: Hoàn thành câu, sắp xếp từ, dịch câu.
> 2. Tạo custom hook `src/features/practice/hooks/usePracticeEngine.js` để quản lý logic chọn câu hỏi, tính điểm streak, timer và cập nhật `skillXP` cho người học và pet.
> 3. Giữ nguyên 100% giao diện, hiệu ứng âm thanh Web Audio và luồng tương tác của người dùng.
> 4. Chạy `npm run build` để đảm bảo không có lỗi cú pháp hoặc đứt gãy import.
> ```

---

### [ ] Nhiệm vụ 3.2: Chia nhỏ LessonDetailPage (~1,831 dòng) & DuelPage (~1,213 dòng)
* **Mục tiêu:** Tách biệt giao diện hiển thị bài học, bài thi checkpoint và màn hình thi đấu PvP.
* **Thời gian ước tính:** 4 – 5 giờ
* **Mức độ rủi ro:** Trung bình.
* **Các file tác động:** `src/features/lesson/`, `src/features/duel/`.

> [!TIP]
> #### 📋 Câu Prompt thực thi (Copy & Paste vào khung chat):
> ```text
> Hãy hỗ trợ tôi tái cấu trúc hai file `LessonDetailPage.jsx` và `DuelPage.jsx`:
> 
> 1. Trong `src/features/lesson/`:
>    - Tách tab Từ vựng & Lý thuyết ngữ pháp thành `components/LessonTheoryView.jsx`.
>    - Tách phần làm bài kiểm tra Unit Checkpoint thành `components/LessonCheckpointQuiz.jsx`.
> 2. Trong `src/features/duel/`:
>    - Tách phần sàn đấu tương tác (Battle Arena & Animation) thành `components/DuelArena.jsx`.
>    - Tách danh sách phòng thách đấu mở & lịch sử đối đầu thành `components/DuelChallengeList.jsx`.
> 3. Đảm bảo toàn bộ prop, state và sự kiện điều hướng vẫn hoạt động trơn tru.
> 4. Chạy kiểm tra build để xác thực mã nguồn.
> ```

---

## 🔵 GIAI ĐOẠN 4: THIẾT LẬP KIỂM THỬ TỰ ĐỘNG (AUTOMATED TESTING)

### [ ] Nhiệm vụ 4.1: Cấu hình Vitest và viết Unit Test cho các thuật toán cốt lõi
* **Mục tiêu:** Bảo vệ các thuật toán nhạy cảm (SM-2, Levenshtein, chống rollback ví XP) không bao giờ bị tính sai khi cập nhật code trong tương lai.
* **Thời gian ước tính:** 3 – 4 giờ
* **Mức độ rủi ro:** Rất thấp.
* **Các file tác động:** `package.json`, `src/utils/speech.test.js`, `src/hooks/useUser.test.js`.

> [!TIP]
> #### 📋 Câu Prompt thực thi (Copy & Paste vào khung chat):
> ```text
> Hãy thiết lập bộ kiểm thử tự động (Unit Test) cho dự án cowdi-english:
> 
> 1. Cài đặt `vitest` vào devDependencies và thêm script `"test": "vitest run"` vào package.json.
> 2. Viết file test `src/utils/speech.test.js`:
>    - Kiểm tra hàm `levenshtein` tính đúng khoảng cách giữa hai từ.
>    - Kiểm tra hàm `scorePronunciation` chấm đúng điểm cho các trường hợp: phát âm đúng 100%, sai 1 từ, đảo từ, từ dài có dung sai 1 ký tự.
> 3. Viết file test `src/hooks/useUser.test.js` (hoặc tách file helper test riêng):
>    - Kiểm tra thuật toán SM-2 (`srsGrade`): chu kỳ tăng interval khi điểm $\ge 3$ và reset về 1 khi trả lời sai ($< 3$).
>    - Kiểm tra hàm `mergeProgress`: đảm bảo ví `availableXP` không bị tăng ảo sau khi merge và trạng thái từ vựng ưu tiên đúng 'learned' > 'learning'.
> 4. Chạy lệnh `npm test` và đảm bảo toàn bộ các bài kiểm thử đều PASS.
> ```

---

## 🟣 GIAI ĐOẠN 5: BẢO MẬT NÂNG CAO & CHUẨN HÓA DÀI HẠN

### [ ] Nhiệm vụ 5.1: Chuyển đổi xác thực JWT sang HttpOnly Cookie
* **Mục tiêu:** Triệt tiêu hoàn toàn nguy cơ rò rỉ token người dùng qua các cuộc tấn công XSS.
* **Thời gian ước tính:** 3 – 4 giờ
* **Mức độ rủi ro:** Trung bình (cần cấu hình đồng bộ giữa server và client).
* **Các file tác động:** `server/routes/auth.js`, `server/middleware/auth.js`, `src/hooks/useAuth.jsx`.

> [!TIP]
> #### 📋 Câu Prompt thực thi (Copy & Paste vào khung chat):
> ```text
> Hiện tại sau khi đăng nhập Google OAuth, token JWT đang được trả về qua query string và lưu vào localStorage ('cowdi_jwt'). Hãy giúp tôi nâng cấp cơ chế xác thực sang HttpOnly Cookie an toàn theo chuẩn OWASP:
> 
> 1. Trong `server/routes/auth.js`: Sau khi xác thực Google thành công, lưu JWT vào cookie phản hồi với các thuộc tính: `httpOnly: true`, `secure: true` (trên production), `sameSite: 'lax'`, `maxAge: 7 * 24 * 60 * 60 * 1000`.
> 2. Trong `server/middleware/auth.js`: Đọc token từ header Cookie song song với hỗ trợ fallback `Authorization: Bearer` để tương thích ngược.
> 3. Trong `src/hooks/useAuth.jsx`: Loại bỏ việc lưu token thủ công vào localStorage, chuyển tất cả các lời gọi API nội bộ sang dạng có gửi kèm cookie (`credentials: 'include'`).
> 4. Kiểm tra hoạt động đăng nhập/đăng xuất trên môi trường dev và cấu hình Nginx reverse proxy.
> ```

---

### [ ] Nhiệm vụ 5.2: Chuẩn hóa Cơ sở dữ liệu quan hệ (RDBMS Normalization)
* **Mục tiêu:** Chuyển đổi từ việc lưu JSON string sang các bảng quan hệ MySQL chuẩn (3NF) để phục vụ phân tích báo cáo và quản lý dữ liệu lớn.
* **Thời gian ước tính:** 1 – 2 tuần (Triển khai khi ứng dụng đạt cột mốc > 5,000 người dùng tích cực).
* **Các file tác động:** Toàn bộ thư mục `server/db/` và `server/routes/api.js`.

> [!TIP]
> #### 📋 Câu Prompt thực thi (Copy & Paste vào khung chat):
> ```text
> Hãy thiết kế kế hoạch chuyển đổi cơ sở dữ liệu từ dạng JSON Blob sang mô hình quan hệ chuẩn (RDBMS) cho dự án cowdi-english:
> 
> 1. Thiết kế schema mới cho các bảng quan hệ:
>    - `user_words`: user_id, word, status, srs_interval, srs_ease_factor, repetitions, next_review_at.
>    - `user_pets`: user_id, pet_id, species_id, xp, evolution_stage, hunger, mood, energy, cleanliness.
>    - `user_daily_journals`: user_id, date, lessons_done, quizzes_done, words_learned, xp_earned.
> 2. Viết migration script Node.js để tự động giải nén dữ liệu từ các cột JSON cũ trong `user_progress` sang các bảng mới một cách an toàn.
> 3. Cập nhật các endpoint trong server/routes/api.js để đọc/ghi dữ liệu theo quan hệ mới.
> ```

---

## 🛠️ QUY TRÌNH KIỂM TRA & XÁC THỰC SAU MỖI BƯỚC

Mỗi khi hoàn thành một nhiệm vụ tối ưu, hãy chạy lần lượt các lệnh sau trên terminal để đảm bảo an toàn tuyệt đối:

1. **Kiểm tra Frontend không có lỗi đóng gói:**
   ```bash
   npm run build:prod
   ```
2. **Kiểm tra Backend khởi động bình thường:**
   ```bash
   cd server && node -e "import('./index.js')"
   ```
3. **Commit mã nguồn theo chuẩn Conventional Commits:**
   ```bash
   git add .
   git commit -m "perf(task-id): mô tả ngắn gọn cải tiến đã làm"
   ```
