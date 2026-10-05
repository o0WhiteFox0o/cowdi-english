# 📚 TRUNG TÂM TÀI LIỆU DỰ ÁN COWDI ENGLISH (DOCUMENTATION HUB)

Chào mừng bạn đến với trung tâm tài liệu của nền tảng **Cowdi English** (`cowdi.net`).  
Toàn bộ tài liệu kỹ thuật, kiến trúc, thiết kế trò chơi và kế hoạch phát triển được phân loại khoa học theo **5 danh mục chính** dưới đây.

---

## 🗂️ MỤC LỤC TỔNG QUAN HỆ THỐNG TÀI LIỆU

```
docs/
├── 01. setup/           ─ Hướng dẫn cài đặt môi trường, quy trình build, PWA và triển khai
├── 02. standards/       ─ Báo cáo tiêu chuẩn quốc tế IEEE, an toàn bảo mật, SEO và đặc tả kỹ thuật
├── 03. game-design/     ─ Thiết kế trò chơi, cơ chế nuôi pet, kinh tế XP, thuật toán SRS và ngôn ngữ
├── 04. growth/          ─ Chiến lược tăng trưởng người dùng, tính năng mời bạn bè và lan tỏa xã hội
└── 05. evaluation/      ─ Báo cáo đánh giá dự án, lịch sử phát triển và Checklist tối ưu hóa
```

---

## 🚀 1. THIẾT LẬP & VẬN HÀNH HỆ THỐNG (`docs/setup/`)

Tài liệu dành cho lập trình viên để cài đặt môi trường, đóng gói bản phát hành và vận hành máy chủ.

| Tài liệu | Định dạng | Mục đích & Nội dung |
| :--- | :---: | :--- |
| [**SETUP.md**](setup/SETUP.md) | Markdown | Hướng dẫn cài đặt từ đầu cho Frontend (Vite) và Backend (Express + MySQL), cấu hình Google OAuth Client ID/Secret. |
| [**BUILD.md**](setup/BUILD.md) | Markdown | Quy trình đóng gói sản phẩm (`npm run build:prod`), tạo PWA icons tự động và kiểm tra bundle. |
| [**DEPLOY-PUSH.md**](setup/DEPLOY-PUSH.md) | Markdown | Hướng dẫn triển khai tính năng Web Push Notification qua VAPID Keys và chạy cron daemon. |
| [**PWA-GUIDE.md**](setup/PWA-GUIDE.md) | Markdown | Cẩm nang chi tiết về cấu hình Service Worker Workbox, Offline Caching và Web App Manifest. |

---

## 🏛️ 2. TIÊU CHUẨN QUỐC TẾ, BẢO MẬT & SEO (`docs/standards/`)

Các báo cáo chuyên sâu chứng minh tính chuẩn hóa và an toàn của hệ thống.

| Báo cáo chuyên đề | Bản Markdown | Bản PDF In ấn | Trọng tâm phân tích |
| :--- | :---: | :---: | :--- |
| **Tiêu chuẩn Công nghệ v01** | [STANDARDS-REPORT-v01.md](standards/STANDARDS-REPORT-v01.md) | [STANDARDS-REPORT-v01.pdf](standards/STANDARDS-REPORT-v01.pdf) | Danh mục 16+ tiêu chuẩn quốc tế (W3C HTML5/CSS3, PWA Manifest, RFC 6749 OAuth2, RFC 7519 JWT, CEFR, SRS). |
| **Tiêu chuẩn IEEE & So sánh NestJS** | [IEEE-AND-NESTJS-REPORT-v01.md](standards/IEEE-AND-NESTJS-REPORT-v01.md) | [IEEE-AND-NESTJS-REPORT-v01.pdf](standards/IEEE-AND-NESTJS-REPORT-v01.pdf) | Phân tích chuẩn IEEE (754, 42010, 12207, POSIX) và ma trận so sánh chi tiết giữa cấu trúc hiện tại và NestJS. |
| **An toàn Bảo mật v01** | [SECURITY-REPORT-v01.md](standards/SECURITY-REPORT-v01.md) | [SECURITY-REPORT-v01.pdf](standards/SECURITY-REPORT-v01.pdf) | So sánh bảo mật kiến trúc Decoupled vs. Monolithic WordPress, mô hình phòng thủ 3 lớp và 6 đề xuất gia cố. |
| **Chiến lược & Hiện trạng SEO v01** | [SEO-REPORT-v01.md](standards/SEO-REPORT-v01.md) | [SEO-REPORT-v01.pdf](standards/SEO-REPORT-v01.pdf) | Báo cáo tối ưu On-page, ma trận từ khóa ngắn/dài, dữ liệu cấu trúc Schema.org JSON-LD và Sitemap XML. |

---

## 🎮 3. THIẾT KẾ TRÒ CHƠI & SƯ PHẠM NGÔN NGỮ (`docs/game-design/`)

Tài liệu thiết kế trải nghiệm người dùng, cơ chế tương tác pet và thuật toán học tập.

| Tài liệu | Định dạng | Mục đích & Nội dung |
| :--- | :---: | :--- |
| [**GAME-DESIGN.md**](game-design/GAME-DESIGN.md) | Markdown | Tài liệu thiết kế trò chơi tổng thể (GDD): vòng lặp cốt lõi (Core Loop), hệ thống cấp bậc và thành tích. |
| [**DUEL-BATTLE-DESIGN.md**](game-design/DUEL-BATTLE-DESIGN.md) | Markdown | Thiết kế cơ chế Đấu trường PvP 1v1: hệ thống League (Bronze → Master), tính điểm thách đấu và ngân hàng câu hỏi. |
| [**PET-INTERACTION-REDESIGN.md**](game-design/PET-INTERACTION-REDESIGN.md) | MD & [PDF](game-design/PET-INTERACTION-REDESIGN.pdf) | Tái cấu trúc cơ chế tương tác với Pet ảo: 4 nhu cầu cơ bản (Đói, Vui, Năng lượng, Vệ sinh) và 5 giai đoạn tiến hóa. |
| [**PET-IMAGE-GUIDE.md**](game-design/PET-IMAGE-GUIDE.md) | Markdown | Hướng dẫn định chuẩn hình ảnh, kích thước, định dạng WebP tối ưu cho 15 loài pet trong bộ sưu tập Cowdi Dex. |
| [**XP-REDESIGN-2026-05.md**](game-design/XP-REDESIGN-2026-05.md) | Markdown | Thiết kế kiến trúc kinh tế 2 ví XP (`totalXP` trọn đời và `availableXP` tiêu dùng) cùng trần cày cuốc Daily Cap. |
| [**VOCABULARY.md**](game-design/VOCABULARY.md) | Markdown | Danh mục và phân loại cấu trúc từ vựng theo khung CEFR, bài học và chủ đề mindmap. |
| [**brain's-Memory-Mechanisms.md**](game-design/brain's-Memory-Mechanisms.md) | Markdown | Cơ sở lý thuyết về đường cong lãng quên Ebbinghaus và nguyên lý vận hành thuật toán Spaced Repetition (SM-2). |

---

## 📈 4. CHIẾN LƯỢC TĂNG TRƯỞNG & LAN TỎA (`docs/growth/`)

Tài liệu về các tính năng tương tác cộng đồng và chiến dịch phát triển người dùng.

| Tài liệu | Định dạng | Mục đích & Nội dung |
| :--- | :---: | :--- |
| [**GROWTH-STRATEGY-2026-05.md**](growth/GROWTH-STRATEGY-2026-05.md) | Markdown | Chiến lược tăng trưởng người dùng tổng thể, phễu chuyển đổi và các cột mốc mục tiêu. |
| [**INVITE-FEATURE-DESIGN.md**](growth/INVITE-FEATURE-DESIGN.md) | Markdown | Đặc tả tính năng thiệp mời thông minh (`/i/:code`), cơ chế thưởng XP và giới hạn chống spam rate-limit. |
| [**SHARE-FEATURE-DESIGN.md**](growth/SHARE-FEATURE-DESIGN.md) | Markdown | Thiết kế tính năng tạo thẻ thành tích học tập và chia sẻ kết quả học lên mạng xã hội. |
| [**SHARE-TACTICS-2026-05.md**](growth/SHARE-TACTICS-2026-05.md) | Markdown | Các chiến thuật kích thích người học chia sẻ chuỗi streak, level pet và chiến thắng PvP. |

---

## 📊 5. ĐÁNH GIÁ DỰ ÁN & KẾ HOẠCH TỐI ƯU HÓA (`docs/evaluation/`)

Hồ sơ đánh giá chất lượng sản phẩm và các checklist thực thi kỹ thuật.

| Tài liệu | Định dạng | Mục đích & Nội dung |
| :--- | :---: | :--- |
| [**OPTIMIZATION-CHECKLIST-2026-10.md**](evaluation/OPTIMIZATION-CHECKLIST-2026-10.md) | Markdown | **Checklist hành động & các câu Prompt mẫu** để tối ưu hóa Database, Bundle, Clean Code và Unit Test trong tháng 10/2026. |
| [**PROJECT-EVALUATION-2026-10.md**](evaluation/PROJECT-EVALUATION-2026-10.md) | Markdown | **Báo cáo đánh giá toàn diện dự án tháng 10/2026**: phân tích ưu điểm, nút thắt kỹ thuật và ma trận chấm điểm hệ thống (8.4/10). |
| [**PROJECT-REPORT-2026-04-27.md**](evaluation/PROJECT-REPORT-2026-04-27.md) | Markdown | Báo cáo tiến độ và cột mốc phát triển ngày 27/04/2026. |
| [**EVALUATION-2026-04.md**](evaluation/EVALUATION-2026-04.md) | Markdown | Đánh giá tổng kết đợt phát triển tháng 04/2026. |
| [**SCORING-REPORT.md**](evaluation/SCORING-REPORT.md) | Markdown | Báo cáo phương pháp tính điểm và trọng số kỹ năng của hệ thống. |
| [**REPORT.md**](evaluation/REPORT.md) | Markdown | Báo cáo khởi động dự án ban đầu (tháng 03/2026). |

---

> 💡 *Mẹo: Khi cần đọc hoặc tra cứu bất kỳ tài liệu nào, bạn chỉ cần mở file này để truy cập nhanh theo đường dẫn.*
