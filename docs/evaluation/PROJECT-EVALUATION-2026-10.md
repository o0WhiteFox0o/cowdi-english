# BÁO CÁO ĐÁNH GIÁ TOÀN DIỆN DỰ ÁN COWDI ENGLISH (10/2026)
**Dự án:** Cowdi English Platform (`cowdi.net`)  
**Ngày lập báo cáo:** 05/10/2026  
**Phiên bản:** v1.0.0  
**Đối tượng đánh giá:** Toàn bộ kiến trúc Frontend (React 18 + Vite), Backend (Express + MySQL), PWA, Cơ sở dữ liệu và Hiệu năng hệ thống.

---

## I. TỔNG QUAN HỆ THỐNG

**Cowdi English** là nền tảng học tiếng Anh tương tác dành cho người Việt, được xây dựng dựa trên triết lý **Gamification sâu sắc (Microlearning + Pet ảo)** kết hợp cùng các phương pháp khoa học ngôn ngữ chuẩn quốc tế.

### 1. Số liệu thống kê hệ thống (Tháng 10/2026)

| Hạng mục | Quy mô / Số liệu | Ghi chú kỹ thuật |
| :--- | :--- | :--- |
| **Nội dung từ vựng** | ~912 từ vựng | 21 bài học chính + 13 chủ đề Mindmap (702 từ) |
| **Ngân hàng câu hỏi** | ~1,300+ câu hỏi | Trắc nghiệm, điền từ, nghe chép, phản xạ nói |
| **Dạng bài tập** | 9 nhóm lớn, 21 biến thể | Bao phủ toàn diện 4 kỹ năng: Nghe, Nói, Đọc, Viết |
| **Lộ trình học tập** | 7 Unit cốt lõi + Checkpoint tests | Chuẩn hóa theo CEFR (A1–C1), IELTS, TOEIC, VSTEP |
| **Hệ thống Pet ảo** | 15 loài pet, 5 giai đoạn tiến hóa | Điểm sức mạnh (Power) tính theo 4 kỹ năng ngôn ngữ |
| **Cửa hàng & Kinh tế** | 26 vật phẩm (mũ, trang phục, phòng, đồ ăn) | Hệ thống 2 ví XP (`totalXP` và `availableXP`) |
| **Mini-games** | 7 trò chơi giáo dục | Nổi bật: TyperShark (gõ phím diệt cá mập), Spelling Bee |
| **Trang giao diện** | 19 trang (Route) | 100% Lazy-loaded (ngoại trừ trang chủ) |
| **Công nghệ PWA** | Workbox 7 + InjectManifest | Cài đặt như Native App, Background Sync, VAPID Push |

### 2. Kiến trúc tổng thể (Architecture Stack)
```
+──────────────────────────────────────────────────────────────────────────+
|                       KIẾN TRÚC COWDI ENGLISH                            |
|                                                                          |
|  [Trình duyệt / PWA Client]                                              |
|    ├── React 18 SPA + React Router v6 + Bootstrap 5.3                    |
|    ├── Web Audio API (Tổng hợp âm thanh synth nội bộ, không tải MP3)     |
|    ├── Web Speech API (TTS chuẩn + SpeechRecognition phát âm)            |
|    └── Service Worker (Workbox precache + Network-first API cache)       |
|                             │                                            |
|                 (HTTPS / REST JSON + Bearer JWT)                         |
|                             ▼                                            |
|  [Hạ tầng Máy chủ aaPanel / Nginx]                                       |
|    └── Nginx Reverse Proxy (HTTP/2, SSL TLSv1.3, gzip, SPA try_files)    |
|                             │                                            |
|                             ▼                                            |
|  [Backend Node.js - Express 4]                                           |
|    ├── Google OAuth2 (Passport.js) + JWT Stateless                       |
|    ├── Web-Push Notification Daemon (VAPID Key)                          |
|    └── Background Cron Jobs (Nhắc nhở học tập & lịch trình)             |
|                             │                                            |
|                             ▼                                            |
|  [Cơ sở dữ liệu MySQL 8.0]                                               |
|    └── mysql2/promise connection pool, utf8mb4_unicode_ci                |
+──────────────────────────────────────────────────────────────────────────+
```

---

## II. ĐIỂM SÁNG VÀ ƯU THẾ VƯỢT TRỘI (KEY STRENGTHS)

### 1. Thiết kế Gamification và kinh tế game (Game Economy) thông minh
* **Kiến trúc 2 ví XP (Dual-XP Architecture):**
  * `totalXP` (Lifetime XP): Đại diện cho cấp bậc và danh tiếng của người học, chỉ tăng theo thời gian, không bao giờ bị trừ. Được bảo vệ chống rollback ở cả client và câu lệnh SQL (`GREATEST(total_xp, VALUES(total_xp))`).
  * `availableXP` (Spendable XP): Ví dùng để tiêu dùng (nuôi pet, mua đồ trang trí, tiến hóa). Logic tính số XP đã tiêu `(totalXP - availableXP)` luôn tăng đơn điệu, giải quyết triệt để lỗi "hồi tiền" sau khi F5/reload trang.
* **Cơ chế chống cày cuốc (Anti-Farming Daily Cap):**
  * Mini-game áp dụng trần `GAME_XP_DAILY_CAP = 120 XP/ngày`. Sau khi chạm trần, người học chỉ nhận 20% XP nhằm khuyến khích chuyển sang học bài chính và ôn tập SRS.

### 2. Phương pháp giáo dục dựa trên nền tảng khoa học
* **Thuật toán Spaced Repetition (SRS SM-2):**
  * Triển khai trực tiếp thuật toán SuperMemo-2 kinh điển trong `src/hooks/useUser.jsx`. Tự động tính toán chu kỳ lặp lại (`interval`), hệ số dễ nhớ (`easeFactor`) và số lần lặp lại (`repetitions`) theo các mức đánh giá chất lượng (1 đến 5).
* **Chấm điểm phát âm bằng khoảng cách Levenshtein:**
  * Hàm `scorePronunciation` trong `src/utils/speech.js` chuẩn hóa chuỗi, tách từ ngữ nghĩa và tính toán dung sai (cho phép sai 1 ký tự đối với từ dài $\ge 4$ ký tự), giúp người học nhận phản hồi phát âm thời gian thực mà không tốn chi phí gọi API AI ngoài.

### 3. Đồng bộ dữ liệu Offline-First & Giải quyết xung đột (Conflict Resolution) mẫu mực
* Ứng dụng hỗ trợ học tập liên tục cả khi mất kết nối mạng.
* Hàm `mergeProgress()` trong `src/hooks/useUser.jsx` xử lý hợp nhất dữ liệu đa thiết bị xuất sắc:
  * Trạng thái từ vựng ưu tiên cấp độ cao nhất: `learned > learning > new`.
  * Bộ đếm XP, quiz, bài học hoàn thành lấy `Math.max()`.
  * Hợp nhất tiến trình SRS dựa trên phiên bản có số lần lặp lại cao hơn.
  * Bộ đệm đồng bộ (Debounce 3 giây) đi kèm cơ chế lắng nghe sự kiện `visibilitychange` và `pagehide` với `keepalive: true` đảm bảo không bao giờ thất thoát dữ liệu khi người dùng tắt trình duyệt đột ngột.

### 4. Tối ưu trải nghiệm Web & PWA
* Tích hợp **Service Worker Workbox**: Lưu cache tĩnh toàn diện, tự động phục vụ trang khi offline.
* Cấu hình **Web Audio API Synth**: Phát âm thanh hiệu ứng (click, chiến thắng, thăng cấp) bằng thuật toán dao động sóng âm, giảm 100% dung lượng tải các tệp âm thanh `.mp3` bên ngoài.
* Đầy đủ dữ liệu cấu trúc **Schema.org JSON-LD**, Open Graph, Sitemap v0.9 và meta tags thân thiện với các công cụ tìm kiếm toàn cầu.

---

## III. HẠN CHẾ & NGUY CƠ KỸ THUẬT CẦN CẢI THIỆN

### 1. Nút thắt hiệu năng bộ nhớ tại Database & API Leaderboard (Cấp bách)
* **Thực trạng:** Toàn bộ tiến trình học, SRS, trạng thái từ và thông tin pet được lưu trong các cột `LONGTEXT` dưới dạng chuỗi JSON thô (`user_progress.pet_data`).
* **Vấn đề nghiêm trọng tại `GET /api/leaderboard`:**
  * Endpoint thực hiện `SELECT` toàn bộ các dòng có `pet_data IS NOT NULL`.
  * Kéo hàng ngàn chuỗi JSON lớn về RAM của Node.js, duyệt qua từng con pet trong bộ sưu tập của từng user để tính toán điểm `power`, rồi mới sắp xếp `entries.sort()` và cắt `slice(0, 50)`.
  * **Hậu quả:** Khi hệ thống đạt 1,000 – 10,000 người dùng, mỗi lượt truy cập bảng xếp hạng sẽ gây nghẽn RAM, nghẽn Event Loop và có nguy cơ gây Crash tiến trình backend.

### 2. Kích thước bundle Frontend bị phình to do dữ liệu tĩnh
* Khi đóng gói môi trường sản xuất (`npm run build:prod`):
  * `dist-prod/assets/data-lessons-*.js`: ~**757 KB** (gzip 256 KB)
  * `dist-prod/assets/data-vocab-*.js`: ~**841 KB** (gzip 150 KB)
* **Nguyên nhân:** File `src/hooks/useUser.jsx` import trực tiếp `LESSONS` và `getAllTopicWords()` để tạo tập hợp `VALID_WORDS` phục vụ việc lọc dữ liệu rác. Do `UserProvider` nằm ở tầng gốc (`main.jsx`), toàn bộ ~1.6MB dữ liệu bài học này bị kéo vào gói bundle tải ban đầu của trang chủ (`/`), ảnh hưởng trực tiếp đến chỉ số LCP/FCP trên thiết bị di động.

### 3. Tồn tại nhiều "Mega-Components" vượt quá kích thước chuẩn
* Một số file component có dung lượng quá lớn:
  * `src/features/practice/PracticePage.jsx`: **1,946 dòng**
  * `src/features/lesson/LessonDetailPage.jsx`: **1,831 dòng**
  * `src/features/review/ReviewPage.jsx`: **1,397 dòng**
  * `src/features/duel/DuelPage.jsx`: **1,213 dòng**
  * `src/features/mini-games/MiniGamePage.jsx`: **1,166 dòng**
* **Hậu quả:** Khó kiểm thử độc lập từng chức năng, chi phí bảo trì cao và dễ phát sinh lỗi hồi quy (regression bugs) khi thêm tính năng mới.

### 4. Thiếu vắng bộ kiểm thử tự động (Automated Testing)
* Dự án chưa có cấu hình Unit Test (`vitest`/`jest`) hay E2E Test (`playwright`).
* Đối với một ứng dụng chứa nhiều logic tính toán nhạy cảm (SM-2, Levenshtein, chống rollback XP, tính rank PvP), việc thiếu test suite tự động khiến việc tái cấu trúc mã nguồn tiềm ẩn nhiều rủi ro.

### 5. Điểm lưu ý về bảo mật & Quản trị rủi ro
* Token JWT hiện đang được lưu tại `localStorage` (`cowdi_jwt`), tiềm ẩn rủi ro nếu ứng dụng dính lỗ hổng XSS.
* Các endpoint nhạy cảm như `/api/duel`, `/api/progress`, `/api/word-status` chưa được trang bị Rate Limiting để ngăn chặn hành vi spam hoặc cào dữ liệu tự động.

---

## IV. BẢNG ĐÁNH GIÁ ĐIỂM HỆ THỐNG

| Tiêu chí đánh giá | Trọng số | Điểm số (Thang 10) | Nhận xét vắn tắt |
| :--- | :---: | :---: | :--- |
| **Ý tưởng & Gamification** | 25% | **9.5** | Rất lôi cuốn, sáng tạo, cơ chế kinh tế 2 ví XP giải quyết tốt bài toán giữ chân người học. |
| **Giao diện & Trải nghiệm (UI/UX)** | 20% | **9.0** | Tông màu ấm áp, phong cách hoạt họa dễ thương, tối ưu hiển thị tốt trên thiết bị di động. |
| **Công nghệ Frontend & PWA** | 20% | **8.5** | PWA và Service Worker hiện đại, cần tối ưu việc chia tách dữ liệu tĩnh để giảm bundle size. |
| **Kiến trúc Backend & Database** | 20% | **7.5** | Chạy tốt ở quy mô hiện tại nhưng cần chuẩn hóa bảng dữ liệu và bỏ tính toán in-memory ở Leaderboard. |
| **Độ tin cậy & Kiểm thử (QA)** | 15% | **7.0** | Code xử lý conflict rất kỹ lưỡng nhưng chưa có automated test suite để bảo vệ hệ thống. |
| **TỔNG THỂ DỰ ÁN** | **100%** | **8.4 / 10** | **Xếp loại: Xuất sắc về ý tưởng & sản phẩm, cần gia cố hạ tầng để sẵn sàng mở rộng.** |

---

## V. KẾT LUẬN
Cowdi English là một dự án EdTech có chất lượng hoàn thiện rất cao, kết hợp hài hòa giữa yếu tố giải trí và hiệu quả sư phạm. Bằng việc thực hiện các cải tiến kỹ thuật theo lộ trình tối ưu hóa (đặc biệt là xử lý truy vấn bảng xếp hạng và chia nhỏ các component lớn), hệ thống sẽ đạt độ ổn định vững chắc để phục vụ hàng chục ngàn người học thường xuyên.
