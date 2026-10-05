# BÁO CÁO CHIẾN LƯỢC & HIỆN TRẠNG TỐI ƯU SEO (v01)
**Dự án:** Cowdi English Platform (`cowdi.net`)  
**Ngày lập:** Tháng 09/2026  
**Phiên bản:** v01  
**Tác giả:** Đội ngũ Phát triển & Tăng trưởng Cowdi  

---

## I. TỔNG QUAN & MỤC TIÊU CHIẾN LƯỢC SEO

Cowdi English định vị là nền tảng học tiếng Anh theo mô hình **Gamification (Trò chơi hóa)** kết hợp nuôi pet ảo, luyện thi chứng chỉ (IELTS/TOEIC/VSTEP/CEFR) và đấu trí PvP (Duel bạn bè).

### Mục tiêu SEO:
1. **Chiếm lĩnh từ khóa Brand & Định vị:** Chiếm vị trí Top 1 cho các từ khóa gắn liền với thương hiệu và mô hình học tiếng Anh kết hợp game nuôi pet (`cowdi`, `cowdi english`, `nuôi pet học tiếng anh`).
2. **Khai thác từ khóa tìm kiếm dài (Long-tail Keywords):** Hướng đến tệp người dùng học sinh, sinh viên và người đi làm đang tìm kiếm giải pháp học tập miễn phí, linh hoạt (`web học tiếng anh miễn phí`, `web luyện từ vựng tiếng anh hàng ngày`, `game học từ vựng ielts`, `vừa chơi vừa học tiếng anh`).
3. **Tối ưu SEO Kỹ thuật (Technical SEO) cho nền tảng SPA:** Đảm bảo Googlebot có thể render, index đầy đủ metadata, schema và cấu trúc sitemap của toàn bộ các trang nội dung công khai.

---

## II. KIẾN TRÚC SEO KỸ THUẬT (TECHNICAL SEO) CỦA COWDI

```
+-------------------------------------------------------------------------------+
|                            KIẾN TRÚC SEO COWDI                                |
|                                                                               |
|  [Googlebot / Crawlers]                                                       |
|          │                                                                    |
|          ├──> robots.txt (Chỉ mục trang công khai, loại trừ /admin, /account) |
|          ├──> sitemap.xml (14 URLs chính có phân cấp priority & changefreq)   |
|          │                                                                    |
|          └──> HTML / Headless Render                                          |
|                     │                                                         |
|                     ├── Core Metadata tĩnh (index.html)                       |
|                     ├── Schema.org JSON-LD (WebSite, Org, WebApp)             |
|                     └── useSEO Hook (Dynamic meta & canonical theo route)     |
+-------------------------------------------------------------------------------+
```

### 1. Quản lý Meta Tags động (Dynamic Meta Management)
* Sử dụng custom hook `useSEO` và file cấu hình tập trung `src/data/seo-config.js`.
* Tự động cập nhật các thẻ quan trọng theo từng thay đổi URL trong Single-Page Application (SPA):
  - `<title>` kèm hậu tố thương hiệu chuẩn mực (`— Cowdi English`).
  - `<meta name="description">` (chuẩn độ dài 120 - 160 ký tự, có Call-To-Action).
  - `<meta name="keywords">` (đã cập nhật các từ khóa tìm kiếm dài).
  - `<link rel="canonical">` (chống trùng lặp nội dung duplicate content giữa các URL).
  - Toàn bộ thẻ mạng xã hội Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) và Twitter Card (`summary_large_image`).

### 2. Dữ liệu có cấu trúc (Structured Data / JSON-LD)
Được nhúng trực tiếp trong `index.html` theo chuẩn Schema.org:
* **@type: WebSite:** Khai báo tên website, URL gốc và tính năng `SearchAction` (`https://cowdi.net/vocabulary?q={search_term_string}`).
* **@type: EducationalOrganization:** Định danh tổ chức giáo dục Cowdi English, logo, và lĩnh vực đào tạo (`knowsAbout`: IELTS, TOEIC, CEFR, VSTEP, Từ vựng tiếng Anh).
* **@type: WebApplication:** Khai báo phân loại ứng dụng giáo dục (`EducationalApplication`), hỗ trợ Web/iOS/Android, miễn phí bản quyền (`price: 0 VND`).

### 3. File điều hướng bọ tìm kiếm (Robots.txt & Sitemap.xml)
* **Robots.txt (`public/robots.txt`):**
  - Cho phép cào toàn bộ các trang nội dung công khai (`Allow: /`).
  - Chặn các trang nhạy cảm hoặc nội bộ người dùng (`Disallow: /admin`, `/auth-callback`, `/account`).
  - Khai báo đường dẫn Sitemap chính thức.
* **Sitemap.xml (`public/sitemap.xml`):**
  - Khai báo 14 URLs công khai với mức độ ưu tiên từ cao đến thấp (Trang chủ: `1.0`, Lộ trình & Bài học: `0.9`, Từ vựng & Luyện tập: `0.8`, Mini Games & Pet: `0.7`).

---

## III. MA TRẬN TỪ KHÓA SEO ĐÃ TRIỂN KHAI

### 1. Phân loại từ khóa theo nhóm nhu cầu

| Nhóm từ khóa | Danh sách từ khóa trọng tâm | Mục đích chuyển đổi |
| :--- | :--- | :--- |
| **Thương hiệu & Định vị** | `cowdi`, `cowdi english`, `cowdi duel`, `cowdi pet`, `cowdi game` | Tăng nhận diện thương hiệu, khách hàng quay lại |
| **Học thuật & Chứng chỉ** | `ielts`, `toeic`, `cefr`, `vstep`, `ielts vocabulary`, `lộ trình học tiếng anh` | Thu hút người học có mục tiêu thi cử cụ thể |
| **Gamification & Trải nghiệm** | `nuôi pet`, `pet ảo`, `tamagotchi`, `duel tiếng anh`, `thách đấu từ vựng`, `mini game tiếng anh` | Thu hút đối tượng học sinh - sinh viên thích vừa chơi vừa học |
| **Từ khóa tìm kiếm dài (Long-tail)** | `web học tiếng anh miễn phí`, `web luyện từ vựng tiếng anh hàng ngày`, `game học từ vựng ielts`, `vừa chơi vừa học tiếng anh` | Tỷ lệ chuyển đổi cao, độ cạnh tranh vừa phải, tiếp cận đúng "pain point" |

### 2. Phân bổ từ khóa chi tiết theo từng Route

| Tuyến đường (Route) | Tiêu đề SEO (Title) | Từ khóa trọng tâm (Keywords) |
| :--- | :--- | :--- |
| **Trang chủ (`/`)** | Cowdi — Nuôi pet, học tiếng Anh, đấu bạn bè 🐮 | `học tiếng anh`, `nuôi pet`, `cowdi`, `ielts`, `toeic`, `từ vựng tiếng anh`, `game học tiếng anh`, `cowdi english`, `web học tiếng anh miễn phí`, `web luyện từ vựng tiếng anh hàng ngày`, `game học từ vựng ielts`, `vừa chơi vừa học tiếng anh` |
| **Bài học (`/lessons`)** | Thư viện bài học tiếng Anh — Cowdi | `bài học tiếng anh`, `ielts`, `toeic`, `cefr`, `vstep`, `từ vựng`, `ngữ pháp`, `kỹ năng tiếng anh`, `web học tiếng anh miễn phí` |
| **Từ vựng (`/vocabulary`)** | Từ vựng tiếng Anh — Cowdi | `từ vựng tiếng anh`, `flashcard`, `học từ mới`, `luyện phát âm`, `chủ đề từ vựng`, `ielts vocabulary`, `web luyện từ vựng tiếng anh hàng ngày`, `game học từ vựng ielts` |
| **Luyện tập (`/practice`)** | Luyện tập tiếng Anh — Cowdi | `luyện tập tiếng anh`, `quiz tiếng anh`, `spaced repetition`, `ôn tập từ vựng`, `kiểm tra tiếng anh`, `web luyện từ vựng tiếng anh hàng ngày`, `vừa chơi vừa học tiếng anh` |
| **Duel bạn bè (`/duel`)** | Duel bạn bè — Cowdi | `duel tiếng anh`, `thách đấu từ vựng`, `pvp tiếng anh`, `cowdi duel`, `battle tiếng anh`, `vừa chơi vừa học tiếng anh`, `game học từ vựng ielts` |
| **Mini Games (`/mini-games`)** | Mini Games — Cowdi | `mini game tiếng anh`, `game từ vựng`, `học qua game`, `cowdi game`, `vừa chơi vừa học tiếng anh`, `game học từ vựng ielts` |
| **Lộ trình (`/learning-path`)** | Lộ trình học tiếng Anh — Cowdi | `lộ trình học tiếng anh`, `học tiếng anh theo cấp độ`, `ielts roadmap`, `toeic roadmap`, `cefr` |
| **Pet (`/pet`)** | Pet của tôi — Cowdi | `pet ảo`, `nuôi pet`, `thú cưng`, `tiến hóa`, `cowdi pet`, `tamagotchi` |
| **Bảng xếp hạng (`/leaderboard`)**| Bảng xếp hạng — Cowdi | `bảng xếp hạng`, `leaderboard tiếng anh`, `top học viên`, `cowdi ranking` |

---

## IV. ĐÁNH GIÁ CHỈ SỐ ON-PAGE & ĐỘ PHỦ TÌM KIẾM

* **Điểm mạnh:**
  1. Thẻ Meta Title và Description được viết thủ công rất tỉ mỉ, có yếu tố kích thích hành động (CTA: *"Vào nhận trứng miễn phí"*, *"Học 5 phút mỗi ngày"*).
  2. Hình ảnh Open Graph chuẩn tỷ lệ, có sẵn phiên bản `pwa-512x512.png` hiển thị đẹp khi chia sẻ link lên Facebook, Zalo, Telegram.
  3. Hệ thống PWA giúp giữ chân người dùng (Retention) và cải thiện tín hiệu trải nghiệm người dùng (UX signals) - một trong những yếu tố xếp hạng quan trọng của thuật toán Google.
* **Hạn chế cần cải thiện:**
  1. Ứng dụng là Client-Side Rendering (CSR), cần duy trì thời gian phản hồi máy chủ (TTFB) cực nhanh để Googlebot không bị timeout khi cào dữ liệu.
  2. Chưa có chuyên mục Blog / Bài viết tin tức chuẩn SEO để kéo lượng organic traffic tự nhiên khổng lồ.

---

## V. ĐỀ XUẤT NÂNG CẤP CHIẾN LƯỢC SEO TIẾP THEO

### 1. Xây dựng phân hệ Blog / Kiến thức tiếng Anh (Content Hub)
* Tạo thư mục `/blog` với các bài viết chia sẻ: *"Top 500 từ vựng IELTS thường gặp nhất"*, *"Cách nhớ từ vựng tiếng Anh theo phương pháp Spaced Repetition"*.
* Đây là "mỏ vàng" để thu hút hàng chục ngàn lượt truy cập miễn phí từ Google Tìm kiếm mỗi tháng và chuyển đổi thành người dùng ứng dụng Cowdi.

### 2. Bổ sung Schema BreadcrumbList & FAQPage
* **BreadcrumbList:** Giúp đường link trên kết quả Google hiển thị dạng cây phân cấp trực quan: `cowdi.net > Bài học > IELTS Cơ bản`.
* **FAQPage Schema:** Nhúng ở các trang Lộ trình và Trang chủ để hiển thị các câu hỏi thường gặp ngay dưới snippet Google, tăng gấp đôi diện tích hiển thị trên trang 1 tìm kiếm.

### 3. Tối ưu Pre-rendering cho các trang tĩnh quan trọng
* Cân nhắc sử dụng Vite SSG hoặc giải pháp Pre-render (kết xuất tĩnh HTML trước khi deploy) cho các trang `/lessons`, `/vocabulary`, `/learning-path` để Googlebot và các mạng xã hội luôn đọc được HTML đầy đủ mà không cần chờ Javascript thực thi.

---

## VI. KẾT LUẬN

Nền tảng SEO kỹ thuật của **Cowdi English** đã được thiết lập rất đồng bộ và khoa học từ cấp độ root HTML, JSON-LD cho đến từng Route trong React Router. Việc bổ sung bộ **từ khóa tìm kiếm dài** gần đây giúp ứng dụng mở rộng phễu tiếp cận khách hàng tiềm năng một cách nhanh chóng và chính xác.
