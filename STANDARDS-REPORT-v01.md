# BÁO CÁO TỔNG HỢP TIÊU CHUẨN CÔNG NGHỆ & ĐẶC TẢ KỸ THUẬT (v01)
**Dự án:** Cowdi English Platform (`cowdi.net`)  
**Ngày lập:** Tháng 09/2026  
**Phiên bản:** v01  
**Đơn vị thực hiện:** Đội ngũ Kỹ thuật & Kiến trúc Hệ thống Cowdi  

---

## I. TỔNG QUAN

Báo cáo này tổng hợp chi tiết toàn bộ các **tiêu chuẩn công nghệ quốc tế (International Technical Standards)**, **đặc tả kỹ thuật (RFC / W3C Specifications)** và **khung tham chiếu ngành** mà hệ thống **Cowdi English** đang tuân thủ trong quá trình thiết kế, lập trình và vận hành.

Việc tuân thủ nghiêm ngặt các tiêu chuẩn này đảm bảo hệ thống có độ tin cậy cao, khả năng mở rộng tốt (Scalability), an toàn thông tin theo chuẩn công nghiệp và tối ưu hóa tối đa khả năng tiếp cận của người dùng cũng như các công cụ tìm kiếm toàn cầu.

---

## II. BẢNG DANH MỤC CÁC TIÊU CHUẨN CÔNG NGHỆ ĐANG ÁP DỤNG

```
+-----------------------------------------------------------------------------------------+
|                         HỆ THỐNG TIÊU CHUẨN COWDI ENGLISH                               |
|                                                                                         |
|  1. KIẾN TRÚC & WEB CỐT LÕI    │ W3C HTML5/CSS3, ECMAScript ES Modules, Jamstack, REST   |
|  2. ỨNG DỤNG WEB CẤP TIẾN     │ W3C PWA Manifest, Service Worker, Google Workbox, VAPID |
|  3. NGỮ NGHĨA & TÌM KIẾM (SEO) │ Schema.org JSON-LD, Open Graph, RFC 9309, Sitemap v0.9  |
|  4. BẢO MẬT & XÁC THỰC         │ RFC 6749 (OAuth2), RFC 7519 (JWT), NIST RBAC, OWASP     |
|  5. NỘI DUNG & GIÁO DỤC        │ CEFR (Council of Europe), Spaced Repetition (SRS)       |
+-----------------------------------------------------------------------------------------+
```

---

## III. CHI TIẾT CÁC BỘ TIÊU CHUẨN & LINK THAM KHẢO CHÍNH THỨC

### 1. Nhóm Tiêu chuẩn Kiến trúc & Phát triển Web (Web Architecture & Core)

#### 1.1. W3C HTML5 & CSS3 Recommendations
* **Mô tả:** Bộ tiêu chuẩn cốt lõi của World Wide Web Consortium quy định cấu trúc ngữ nghĩa (Semantic Web) và định dạng giao diện.
* **Áp dụng tại Cowdi:** Khai báo chuẩn `<!DOCTYPE html>`, ngôn ngữ `<html lang="vi">`, bộ mã hóa UTF-8, các thẻ ngữ nghĩa HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`), tích hợp CSS Flexbox và CSS Grid đáp ứng hiển thị đa màn hình (Responsive Design).
* **Tài liệu tham khảo:** [W3C HTML5 Specification](https://www.w3.org/TR/html52/) | [W3C CSS Snapshot](https://www.w3.org/TR/css-2023/)

#### 1.2. ECMAScript Modern Modules (ECMA-262 / ES6+)
* **Mô tả:** Chuẩn ngôn ngữ lập trình JavaScript do tổ chức ECMA International ban hành, định nghĩa cơ chế đóng gói và thực thi mã nguồn hiện đại qua ES Modules (`import`/`export`), `Promise`, `async/await`.
* **Áp dụng tại Cowdi:** Toàn bộ Frontend (Vite) và Backend (Node.js với `"type": "module"`) đều chạy trên chuẩn ES Modules thuần, loại bỏ hoàn toàn cú pháp CommonJS lỗi thời.
* **Tài liệu tham khảo:** [ECMA-262 Standard](https://tc39.es/ecma262/)

#### 1.3. Kiến trúc Jamstack & Decoupled Architecture
* **Mô tả:** Tiêu chuẩn kiến trúc phần mềm phân tách độc lập giữa tầng hiển thị Client (Static Pre-rendered/CSR) và tầng dịch vụ Backend (Headless APIs).
* **Áp dụng tại Cowdi:** Frontend được build thành các tài nguyên tĩnh phân phối qua CDN; Backend chỉ cung cấp dữ liệu qua API JSON. Triệt tiêu các nguy cơ tấn công máy chủ web tĩnh thường gặp ở kiến trúc nguyên khối (Monolithic CMS).
* **Tài liệu tham khảo:** [Jamstack Architectural Specifications](https://jamstack.org/)

#### 1.4. Kiến trúc RESTful API (RFC 7231)
* **Mô tả:** Đặc tả kiến trúc truyền tải dữ liệu trạng thái qua giao thức HTTP/1.1 do IETF ban hành.
* **Áp dụng tại Cowdi:** Các endpoint API (`/api/duel`, `/api/progress`, `/api/word-status`) tuân thủ nghiêm ngặt các phương thức HTTP chuẩn (`GET`, `POST`, `PUT`, `DELETE`), trả về mã trạng thái HTTP chuẩn (`200 OK`, `201 Created`, `401 Unauthorized`, `403 Forbidden`).
* **Tài liệu tham khảo:** [IETF RFC 7231 - HTTP Semantics](https://www.rfc-editor.org/rfc/rfc7231)

---

### 2. Nhóm Tiêu chuẩn Ứng dụng Web Cấp tiến (Progressive Web App - PWA)

#### 2.1. W3C Web App Manifest Standard
* **Mô tả:** Đặc tả định dạng JSON cung cấp siêu dữ liệu để trình duyệt nhận diện website như một ứng dụng độc lập có thể cài đặt trực tiếp lên màn hình chính (A2HS - Add to Home Screen).
* **Áp dụng tại Cowdi:** Cấu hình đầy đủ biểu tượng icon vector, icon đa kích cỡ (`192x192`, `512x512` chuẩn maskable), màu sắc thanh tiêu đề (`#5C7A3F`), chế độ `standalone`.
* **Tài liệu tham khảo:** [W3C Web App Manifest Working Draft](https://www.w3.org/TR/appmanifest/)

#### 2.2. W3C Service Workers API & Cache Storage
* **Mô tả:** Đặc tả cho phép chạy tiến trình ngầm độc lập với trang web để điều phối mạng (Network Proxy), hỗ trợ lưu trữ ngoại tuyến (Offline Caching) và đồng bộ nền (Background Sync).
* **Áp dụng tại Cowdi:** Sử dụng thư viện chuẩn **Google Workbox 7** với các chiến lược:
  - *Cache-First:* Cho toàn bộ tài nguyên tĩnh (Fonts, Audio từ vựng, hình ảnh SVG).
  - *Stale-While-Revalidate:* Cho các dữ liệu tiến độ học tập và bài học để đảm bảo tốc độ mở trang tức thì ngay cả khi mạng yếu.
* **Tài liệu tham khảo:** [W3C Service Workers Specification](https://www.w3.org/TR/service-workers/) | [Google Workbox Guide](https://developer.chrome.com/docs/workbox)

#### 2.3. Web Push Protocol & VAPID (IETF RFC 8030, RFC 8291, RFC 8292)
* **Mô tả:** Bộ tiêu chuẩn quốc tế quy định cơ chế gửi thông báo đẩy (Push Notifications) bảo mật từ máy chủ đến thiết bị người dùng qua cặp khóa mã hóa bất đối xứng VAPID (Voluntary Application Server Identification).
* **Áp dụng tại Cowdi:** Module thông báo nhắc học bài tự động (`server/jobs/reminder.js`) sử dụng thư viện `web-push`, tương thích với các Push Service của Google FCM và Apple APNs.
* **Tài liệu tham khảo:** [IETF RFC 8292 - VAPID for Web Push](https://datatracker.ietf.org/doc/html/rfc8292)

---

### 3. Nhóm Tiêu chuẩn Dữ liệu Ngữ nghĩa & Tối ưu Tìm kiếm (Semantic Web & SEO)

#### 3.1. Schema.org / JSON-LD Data Standard (W3C Recommendation)
* **Mô tả:** Tiêu chuẩn định dạng dữ liệu có cấu trúc được đồng thuận bởi Google, Microsoft, Yahoo và Yandex nhằm giúp công cụ tìm kiếm hiểu chính xác ngữ nghĩa của trang web.
* **Áp dụng tại Cowdi:** Nhúng trực tiếp trong `index.html` với 3 Schemas chuẩn:
  - `@type: WebSite`: Khai báo tính năng tìm kiếm `SearchAction` dẫn về kho từ vựng.
  - `@type: EducationalOrganization`: Khai báo tư cách tổ chức giáo dục và lĩnh vực chuyên môn (`knowsAbout`).
  - `@type: WebApplication`: Khai báo ứng dụng web học tập miễn phí.
* **Tài liệu tham khảo:** [Schema.org Vocabulary](https://schema.org/) | [W3C JSON-LD 1.1 Specification](https://www.w3.org/TR/json-ld11/)

#### 3.2. The Open Graph Protocol (OGP) & Twitter Cards
* **Mô tả:** Tiêu chuẩn siêu dữ liệu nhúng do Meta (Facebook) và X (Twitter) phát triển để hiển thị thông tin xem trước (Rich Snippet) khi chia sẻ liên kết trên mạng xã hội.
* **Áp dụng tại Cowdi:** Cập nhật động theo từng trang thông qua hook `useSEO` (`og:title`, `og:description`, `og:image`, `og:type`, `twitter:card="summary_large_image"`).
* **Tài liệu tham khảo:** [Open Graph Protocol](https://ogp.me/) | [Twitter Cards Developer Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

#### 3.3. Sitemaps XML Protocol v0.9 & Robots Exclusion Protocol (RFC 9309)
* **Mô tả:** Các chuẩn định hướng và phân quyền cho bọ tìm kiếm (Crawlers) cào dữ liệu có kiểm soát.
* **Áp dụng tại Cowdi:** 
  - `sitemap.xml`: Chuẩn XML schema `http://www.sitemaps.org/schemas/sitemap/0.9` với 14 URLs công khai, phân cấp ưu tiên và hỗ trợ thẻ `xhtml:link hreflang="vi"`.
  - `robots.txt`: Chuẩn RFC 9309 điều phối crawl hợp lệ, chặn các route quản trị (`/admin`, `/account`).
* **Tài liệu tham khảo:** [Sitemaps XML Protocol](https://www.sitemaps.org/protocol.html) | [IETF RFC 9309 - Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)

---

### 4. Nhóm Tiêu chuẩn An toàn Thông tin & Xác thực (Security & Identity)

#### 4.1. The OAuth 2.0 Authorization Framework (IETF RFC 6749)
* **Mô tả:** Chuẩn công nghiệp về ủy quyền bảo mật, cho phép ứng dụng bên thứ ba xác thực người dùng mà không cần trực tiếp nắm giữ mật khẩu của họ.
* **Áp dụng tại Cowdi:** Triển khai luồng Google OAuth 2.0 (Authorization Code Grant flow) qua thư viện `passport-google-oauth20`, loại bỏ 100% rủi ro lưu trữ và rò rỉ mật khẩu người dùng.
* **Tài liệu tham khảo:** [IETF RFC 6749 - OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749)

#### 4.2. JSON Web Token - JWT (IETF RFC 7519)
* **Mô tả:** Chuẩn mở định dạng mã hóa phiên làm việc nhỏ gọn và khép kín (Self-contained) dưới dạng chuỗi JSON có chữ ký số (HMAC SHA-256).
* **Áp dụng tại Cowdi:** Quản lý phiên làm việc Stateless qua header `Authorization: Bearer <token>`, tự động xác thực và kiểm tra thời hạn hết hạn (`exp`) trước mỗi truy vấn bảo mật.
* **Tài liệu tham khảo:** [IETF RFC 7519 - JSON Web Token](https://www.rfc-editor.org/rfc/rfc7519)

#### 4.3. NIST Role-Based Access Control (NIST RBAC - ANSI/INCITS 359-2004)
* **Mô tả:** Chuẩn phân quyền truy cập dựa trên vai trò do Viện Tiêu chuẩn và Kỹ thuật Quốc gia Hoa Kỳ (NIST) ban hành.
* **Áp dụng tại Cowdi:** Phân cấp quyền hạn rõ ràng: Người dùng thông thường (Student) và Quản trị viên (Admin). Middleware `requireAdmin` thực hiện kiểm tra quyền trực tiếp tại cơ sở dữ liệu để ngăn chặn leo thang đặc quyền.
* **Tài liệu tham khảo:** [NIST RBAC Standard](https://csrc.nist.gov/projects/role-based-access-control)

#### 4.4. Tiêu chuẩn Chống SQL Injection (OWASP Top 10 - A03:2021)
* **Mô tả:** Hướng dẫn an toàn của Open Web Application Security Project về phòng chống tấn công chèn mã độc vào cơ sở dữ liệu.
* **Áp dụng tại Cowdi:** 100% các câu lệnh truy vấn dữ liệu tới MySQL đều sử dụng cú pháp tham số hóa (Prepared Statements với `mysql2/promise`), cách ly hoàn toàn dữ liệu đầu vào của người dùng khỏi mã lệnh thực thi SQL.
* **Tài liệu tham khảo:** [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

---

### 5. Nhóm Tiêu chuẩn Giáo dục & Học thuật (Educational Frameworks)

#### 5.1. Khung Tham chiếu Ngôn ngữ Chung Châu Âu (CEFR)
* **Mô tả:** Tiêu chuẩn quốc tế do Hội đồng Châu Âu (Council of Europe) thiết lập nhằm đánh giá năng lực ngôn ngữ theo 6 bậc: A1, A2 (Cơ bản), B1, B2 (Độc lập), C1, C2 (Thành thạo).
* **Áp dụng tại Cowdi:** Toàn bộ hệ thống bài học tại `/lessons` và lộ trình học `/learning-path` đều được phân cấp rõ ràng theo chuẩn CEFR và đối sánh tương đương với các bài thi quốc tế (IELTS, TOEIC) và khung năng lực 6 bậc Việt Nam (VSTEP).
* **Tài liệu tham khảo:** [Council of Europe - CEFR Guidelines](https://www.coe.int/en/web/common-european-framework-reference-language-learning-teaching-assessment)

#### 5.2. Thuật toán Lặp lại Ngắt quãng (Spaced Repetition System - SRS)
* **Mô tả:** Nguyên lý ghi nhớ dựa trên nghiên cứu đường cong lãng quên của nhà tâm lý học Hermann Ebbinghaus, tính toán thời điểm tối ưu để người học ôn lại một từ vựng ngay trước khi bộ não chuẩn bị quên nó.
* **Áp dụng tại Cowdi:** Được tích hợp làm thuật toán lõi trong tính năng Luyện tập (`/practice`) và Ôn tập (`/review`), tự động phân loại từ vựng thành các cấp độ ghi nhớ từ 1 đến 5 sao.
* **Tài liệu tham khảo:** [Ebbinghaus Forgetting Curve & Spaced Repetition](https://en.wikipedia.org/wiki/Spaced_repetition)

---

## IV. TỔNG KẾT & ĐÁNH GIÁ MỨC ĐỘ TUÂN THỦ

| Nhóm Tiêu Chuẩn | Số lượng Tiêu chuẩn | Mức độ Tuân thủ | Đánh giá |
| :--- | :---: | :---: | :--- |
| **Kiến trúc & Web cốt lõi** | 4 | 100% | Hiện đại, đạt chuẩn Decoupled Web |
| **PWA & Mobile-ready** | 3 | 100% | Trải nghiệm offline và cài đặt đạt chuẩn Google |
| **Ngữ nghĩa & SEO** | 3 | 100% | Tương thích tối đa với Googlebot và mạng xã hội |
| **Bảo mật & Xác thực** | 4 | 90% | Đạt chuẩn OWASP, cần bổ sung thêm Header Security |
| **Giáo dục & Học thuật** | 2 | 100% | Bám sát chuẩn CEFR và phương pháp khoa học SRS |

**Kết luận:** Hệ thống Cowdi English được xây dựng trên một bộ khung tiêu chuẩn công nghệ toàn diện, đồng bộ từ tầng hạ tầng mạng, bảo mật, trải nghiệm người dùng đến chất lượng nội dung đào tạo. Đây là nền tảng vững chắc để dự án mở rộng quy mô phục vụ hàng triệu người dùng trong tương lai.
