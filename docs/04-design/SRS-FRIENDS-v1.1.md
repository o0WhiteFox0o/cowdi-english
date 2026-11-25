# SRS — Phân hệ Bạn bè & Thưởng mời bạn · Cowdi English

| Mục | Nội dung |
|---|---|
| Mã tài liệu | SRS-FRIENDS |
| Phiên bản | **1.1** |
| Ngày | 25/11/2026 |
| Chủ sở hữu | Sonny (Nguyễn Hồng Sơn) |
| Trạng thái | Chờ duyệt |
| Tài liệu liên quan | Repo: `docs/04-design/economy-v2/de-xuat-gacha-v2.md`, `docs/04-design/SDD-INVITE-v1.0.md`, `TASK.md` (GĐ6–GĐ7). Project: `claude/REFERRAL-GACHA-TICKET.md` v0.3, `claude/GEMINI-LEARNING-GROUPS.md` |

**Bản 1.1 thay bản 1.0.** Bản 1.0 tự thiết kế hệ mời và hộp quà riêng, trùng với thiệp mời đã chạy và thiết kế gacha v2 trong repo. Bản 1.1 **xây trên thiệp mời có sẵn**, không làm gacha (thuộc GĐ6–GĐ7).

Khi tài liệu này đoán sai so với code thật, **theo code thật** và ghi lại trong mô tả PR.

---

## 1. Giới thiệu

### 1.1 Mục đích
Đặc tả yêu cầu cho: thưởng mời bạn, ảnh xem trước của link thiệp mời, hệ thống bạn bè, thăm pet và thách đấu bạn bè, và **bạn bè trên bản đồ lộ trình** (kiểu Candy Crush Saga).

### 1.2 Phạm vi
**Trong phạm vi:**
- Điều kiện "học thật" của người được mời; thưởng Gem/Sữa; thưởng vé gacha theo mốc.
- Ảnh xem trước (OG) do server trả cho `/i/:code`.
- Kết bạn: tự động qua thiệp mời; bằng mã bạn bè/QR cho người đã có tài khoản. Huỷ, chặn, báo cáo.
- Thăm pet của bạn; thách đấu bạn bè.
- Bạn bè trên bản đồ lộ trình.

**Ngoài phạm vi (làm ở GĐ6–GĐ7 theo `de-xuat-gacha-v2.md` + `REFERRAL-GACHA-TICKET.md` v0.3):**
- Lõi gacha, mua vé 50 Gem, banner, quà trùng, thẻ tặng pet.
- Màn chọn Cowdi / quay pet khởi đầu khi nhận thiệp.
- Nhiệm vụ sự kiện lấy lại Cowdi.

**Không làm:**
- Đồng bộ danh sách bạn bè từ Zalo/Facebook; đăng nhập Zalo/Facebook.
- Bụi sao hoặc bất kỳ tiền tệ mới nào.
- Chat tự do; tìm người dùng theo tên/email; bảng xếp hạng bạn bè; thông báo đẩy.
- Tài khoản phụ huynh; nạp tiền.

### 1.3 Thuật ngữ
| Thuật ngữ | Nghĩa |
|---|---|
| Thiệp mời | Bản ghi trong bảng `invites`, mỗi thiệp một mã, chỉ dành cho người mới |
| Người mời / người được mời | `invites.sender_id` / `invites.claimed_by` |
| Học thật (activation) | Người được mời đạt BR-01 |
| Mã bạn bè (`friend_code`) | Mã cố định của mỗi người, dùng để kết bạn với người **đã có** tài khoản |
| Node `current` | Node bài gợi ý học tiếp trên một lộ trình (`buildPathNodes`) |
| OG | Open Graph: thẻ meta để Zalo/Facebook hiện ảnh và tiêu đề |

### 1.4 Mức ưu tiên
**Must** · **Should** · **Could**.

---

## 2. Mô tả tổng quan

### 2.1 Hiện trạng (đã kiểm trên repo, commit `1b0400b`)
| Có sẵn | Vị trí |
|---|---|
| Bảng `invites` (mã, người gửi, `pet_species`, `claimed_by`, `rewarded_sender`, `expires_at`) | `server/db/migrate-invites.sql` |
| Tạo thiệp (giới hạn 5/ngày, 20/tuần), xem thiệp, nhận thiệp, danh sách thiệp của tôi | `server/routes/invites.js` |
| Sheet mời: QR, chia sẻ (`navigator.share`), sao chép | `src/features/invite/InviteSheet.jsx` |
| Trang nhận thiệp `/i/:code` (chỉ phía client) | `src/pages/InvitePage.jsx`, `src/App.jsx` |
| OG chung cho cả site (ảnh 512×512) | `index.html` |
| Dòng "Tặng pet qua thiệp mời (khi bạn học 3 bài) +3 Gem" | `HowToEarnSheet.jsx` |

| Chưa có | Hệ quả |
|---|---|
| Code cộng +3 Gem cho người mời (`rewarded_sender` chưa được dùng) | Giao diện đang hứa mà chưa làm |
| OG riêng cho từng thiệp | Link trong Zalo hiện ảnh chung |
| Bạn bè | — |
| QR tạo bằng dịch vụ ngoài `api.qrserver.com` | Phụ thuộc bên thứ ba, lộ link mời ra ngoài |

### 2.2 Phụ thuộc giai đoạn
| Phần | Phụ thuộc |
|---|---|
| FR-RWD (thưởng mời) cấp vé gacha theo mốc | Nơi lưu vé gacha của GĐ6. Nếu GĐ6 chưa xong: ghi vé vào ledger, hiện "Vé gacha (sắp dùng được)" |
| FR-FRD tự kết bạn qua thiệp | Không phụ thuộc |
| FR-MAP | Lộ trình theo nhóm học (`GEMINI-LEARNING-GROUPS`) đã có `buildPathNodes`, `getNextPathLesson` |

### 2.3 Tác nhân
Khách (chưa đăng nhập), Người dùng, Hệ thống (server), Quản trị viên (xử lý báo cáo, dùng cơ chế admin có sẵn).

### 2.4 Ràng buộc
- C-01: Không dùng API/thư viện Zalo không chính thức.
- C-02: Thưởng tính ở server; client không tự cộng tài nguyên.
- C-03: Migration idempotent kiểu `server/db/migrate-*.sql`.
- C-04: Chữ giao diện tiếng Việt; không dùng `window.alert/confirm/prompt`.
- C-05: Không thêm loại tài nguyên mới. Chỉ dùng Sữa, Gem, vé gacha (của GĐ6) và danh hiệu.

---

## 3. Yêu cầu chức năng

### 3.1 FR-LND — Ảnh xem trước của thiệp (Must)
| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-LND-01 | Express phục vụ `GET /i/:code`: trả `index.html` đã chèn OG riêng (`og:title` "<biệt danh> tặng bạn một quả trứng <tên pet>", `og:description`, `og:image` ảnh pet của thiệp 1200×630, `og:url`). Phần còn lại của trang chạy SPA như cũ (`InvitePage`). | Must |
| FR-LND-02 | Mã không tồn tại hoặc hết hạn: trả OG chung, không lỗi. | Must |
| FR-LND-03 | Nginx (aaPanel) chuyển `/i/*` về Express. | Must |
| FR-LND-04 | Thay QR `api.qrserver.com` bằng QR tạo tại client. | Should |

### 3.2 FR-RWD — Thưởng mời bạn (Must)
| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-RWD-01 | Khi nhận thiệp (`POST /api/invites/:code/claim`) ghi thêm `claim_ip`, `claim_device_hash`. Trùng IP hoặc thiết bị với lần tạo thiệp của người mời trong 24 giờ → đánh dấu `flagged = 1`. | Must |
| FR-RWD-02 | Mỗi lần ghi nhận bài hoàn thành (hàm cấp thưởng của `PUT /api/progress`), server kiểm tra người dùng có thiệp đã nhận, chưa thưởng, chưa quá 14 ngày, đạt BR-01. Đạt → trong một transaction: cộng thưởng theo BR-02, đặt `rewarded_sender = 1`, `rewarded_at`. | Must |
| FR-RWD-03 | Thiệp `flagged`: không thưởng ai, nhưng vẫn tự kết bạn (FR-FRD-02). | Must |
| FR-RWD-04 | Mốc người mời (BR-03) tính trên số thiệp `rewarded_sender = 1` trọn đời; cấp một lần mỗi mốc (`uq_grant`). | Must |
| FR-RWD-05 | Thông báo trong app một lần cho mỗi bên: "Bạn nhận 💎 +3 nhờ <biệt danh>", "Quà chào mừng 🥛 +500". | Must |
| FR-RWD-06 | Sheet mời hiển thị: số thiệp đã gửi / đã nhận / đã học thật; tiến độ tới mốc kế tiếp; vé đã nhận trong tháng (x/3). | Must |
| FR-RWD-07 | `HowToEarnSheet.jsx` thêm dòng thưởng mốc mời bạn; dòng +3 Gem giữ nguyên (nay đã đúng). | Must |

### 3.3 FR-FRD — Bạn bè (Must)
| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-FRD-01 | Nhận thiệp thành công → tự tạo quan hệ bạn bè `accepted` giữa người gửi và người nhận (`source='invite'`). | Must |
| FR-FRD-02 | Mỗi người dùng có `friend_code` 8 ký tự (bảng chữ giống mã thiệp), cấp lười. Kết bạn với người **đã có tài khoản** bằng nhập mã bạn bè, nhập **email khớp chính xác** (không gợi ý/autocomplete, giới hạn 20 lần/giờ, không trả email ra response), hoặc quét QR (bằng máy quét QR trong app hỗ trợ camera + ảnh, hoặc bằng Camera điện thoại/Zalo mở `/friends?add=<code>`). | Must |
| FR-FRD-03 | Lời mời kết bạn: chấp nhận / từ chối. Hai bên cùng gửi → tự `accepted`. | Must |
| FR-FRD-04 | Huỷ kết bạn; chặn (không gửi lời mời được, ẩn khỏi tìm kiếm và bản đồ của nhau); bỏ chặn; báo cáo. | Must |
| FR-FRD-05 | **Cập nhật 25/11/2026 (PO chốt):** Bỏ bước bắt buộc đặt biệt danh riêng ở trang Bạn bè / InviteSheet; dùng thống nhất **tên hiển thị sẵn có trong Tài khoản** (`AccountPage`, đồng bộ `pet_data.nickname` → `users.nickname` → `users.display_name`). | Must |
| FR-FRD-06 | Trang Bạn bè: tab Bạn bè (pet chính, cấp, nhóm học, ngày học gần nhất) · Lời mời · Thêm bạn (mã, QR, nút "Gửi thiệp cho người mới" mở `InviteSheet`). | Must |

### 3.4 FR-VIS — Thăm pet & thách đấu (Must)
| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-VIS-01 | Trang thăm pet của bạn: pet chính (cấp, trang phục), biệt danh, nhóm học, lộ trình đang học. Chỉ xem. | Must |
| FR-VIS-02 | Thách đấu: tạo trận Duel có `opponentId` (phải là bạn `accepted`, không chặn nhau), dùng nguyên luồng Duel. | Must |
| FR-VIS-03 | Trận bạn bè không cộng/trừ league points (BR-06). | Must |

### 3.5 FR-MAP — Bạn bè trên lộ trình (Must)
| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-MAP-01 | `GET /api/friends/path-progress`: tối đa 100 bạn `accepted`, không chặn; mỗi bạn `{ userId, nickname, petId, petEvolution, learnerGroup, activePath, completedLessons[], passedUnits[] }`. | Must |
| FR-MAP-02 | Client tính vị trí của bạn trên lộ trình P bằng `getNextPathLesson(friendData, P)`. Xong cả lộ trình → node cuối + vương miện 👑. | Must |
| FR-MAP-03 | Bạn hiện trên P khi P là `activePath` của họ hoặc họ đã xong ≥1 bài thuộc P. | Must |
| FR-MAP-04 | Avatar bạn = icon pet chính + biệt danh, cạnh node; cùng node tối đa 3 avatar + "+N"; avatar người dùng nổi bật hơn. | Must |
| FR-MAP-05 | Dải chip "Bạn bè ở lộ trình khác" đầu trang; bấm → trang thăm pet. | Should |
| FR-MAP-06 | "<biệt danh> đang đi trước bạn N bài" với bạn gần nhất phía trước, cùng lộ trình. | Must |
| FR-MAP-07 | Xong bài mà node `current` mới vượt qua vị trí một hay nhiều bạn → toast "🎉 Bạn vừa vượt qua <biệt danh>!". Học lại bài cũ không hiện. | Must |
| FR-MAP-08 | Bấm avatar → trang thăm pet. Cache 5 phút; tải lại khi mở trang Lộ trình và sau khi xong bài. | Must |
| FR-MAP-09 | `InviteSheet` có dòng gợi ý "Mời bạn cùng lớp hoặc cùng mục tiêu học để gặp nhau trên lộ trình". | Should |

---

## 4. Ca sử dụng chính
- **UC-01 Gửi thiệp qua Zalo:** mở sheet mời → Chia sẻ → Zalo → link hiện ảnh pet + tiêu đề riêng (FR-LND-01).
- **UC-02 Người mới nhận thiệp:** mở link → đăng nhập → nhận thiệp → (GĐ6: chọn Cowdi/quay) → tự thành bạn với người gửi (FR-FRD-01).
- **UC-03 Học thật:** người mới học bài mới thứ 3 ở ngày thứ 2 khác nhau, trong 14 ngày → người gửi +3 Gem, người mới +500 Sữa, kiểm tra mốc.
- **UC-04 Kết bạn với người đã có tài khoản:** quét QR mã bạn bè → gửi lời mời → bên kia chấp nhận.
- **UC-05 Vượt bạn trên lộ trình:** thấy "Mai đang đi trước bạn 2 bài" → học 3 bài → toast "Bạn vừa vượt qua Mai!".

---

## 5. Quy tắc nghiệp vụ

| ID | Quy tắc |
|---|---|
| BR-01 | **Học thật** = người nhận thiệp hoàn thành ≥3 bài **mới** trên ≥2 ngày khác nhau (giờ Việt Nam), trong 14 ngày kể từ `claimed_at`. |
| BR-02 | Thưởng khi học thật: người gửi **+3 Gem** (`reason='invite_activated'`, `ref_id=<code>`), tối đa 10 lần/tháng dương lịch; người nhận **+500 Sữa** (`reason='invite_welcome'`, `ref_id=<code>`). |
| BR-03 | Mốc người gửi (số thiệp học thật, trọn đời): 3 → 1 vé gacha + "Người dẫn đường" · 5 → 1 vé · 10 → 2 vé + "Người gieo mầm" · 20 → 2 vé + "Đại sứ Cowdi". `reason='invite_milestone'`, `ref_id='<mốc>'`. |
| BR-04 | Vé gacha từ mời bạn tối đa **3 vé/tháng dương lịch**; phần vượt dời sang tháng sau (cấp khi người dùng mở app tháng sau). |
| BR-05 | Giữ giới hạn thiệp: 5/ngày, 20/tuần. Thiệp chỉ dành cho người mới (theo `de-xuat-gacha-v2.md`). |
| BR-06 | Trận Duel giữa hai bạn không tính league points. |
| BR-07 | 100 bạn/người; 20 lời mời kết bạn đang chờ; 20 lời mời kết bạn/giờ. |
| BR-08 | Thông tin bạn bè thấy được: biệt danh, pet chính, cấp, trang phục, nhóm học, lộ trình, bài/unit đã xong, ngày học gần nhất. Không có tên thật, email, ảnh Google, ví, điểm bài. |

---

## 6. Yêu cầu dữ liệu

| Đối tượng | Thay đổi |
|---|---|
| `invites` | + `claim_ip VARCHAR(45)`, `claim_device_hash CHAR(64)`, `flagged TINYINT(1) DEFAULT 0`, `creator_ip VARCHAR(45)`, `creator_device_hash CHAR(64)` (ghi khi tạo thiệp) |
| `users` | + `friend_code CHAR(8) UNIQUE`, `nickname VARCHAR(32)` |
| `friendships` (mới) | Khoá (`user_low`, `user_high`); `status ENUM('pending','accepted','blocked')`; `requested_by`; `blocked_by`; `source ENUM('invite','code','qr')`; `created_at`; `accepted_at`; `INDEX(user_high, status)` |
| `friend_reports` (mới) | `id`, `reporter_id`, `reported_id`, `reason VARCHAR(40)`, `created_at`, `handled TINYINT(1)` |
| `wallet_ledger` | `reason` mới: `invite_activated`, `invite_welcome`, `invite_milestone`. Vé gacha: dùng cách lưu của GĐ6; chưa có thì thêm `'gacha_ticket'` vào ENUM `currency` (thống nhất với GĐ6) |
| `shared/game-config.js` | `INVITE_REWARDS` (BR-01..04), `FRIEND_LIMITS` (BR-07) |

Danh hiệu: dùng cơ chế danh hiệu/vật phẩm có sẵn nếu có; không có thì lưu trong `pet_data` theo cách repo đang lưu đồ trang trí **[cần đối chiếu code]**.

---

## 7. API

| Method | Path | FR |
|---|---|---|
| GET | `/i/:code` (HTML + OG) | FR-LND-01..02 |
| POST | `/api/invites` (sửa: ghi IP/thiết bị, dùng biệt danh) | FR-RWD-01, FR-FRD-05 |
| POST | `/api/invites/:code/claim` (sửa: ghi IP/thiết bị, `flagged`, tự kết bạn) | FR-RWD-01, FR-FRD-01 |
| GET | `/api/invites/mine/stats` | FR-RWD-06 |
| GET/PUT | `/api/me/friend-code`, `/api/me/nickname` | FR-FRD-02, 05 |
| GET | `/api/friends` | FR-FRD-06 |
| POST | `/api/friends/requests` `{ code }` | FR-FRD-02 |
| POST | `/api/friends/requests/:userId/accept` · `/decline` | FR-FRD-03 |
| DELETE | `/api/friends/:userId` | FR-FRD-04 |
| POST/DELETE | `/api/friends/:userId/block` · POST `/report` | FR-FRD-04 |
| GET | `/api/friends/:userId/pet` | FR-VIS-01 |
| POST | `/api/duels` (thêm `opponentId`) | FR-VIS-02 |
| GET | `/api/friends/path-progress` | FR-MAP-01 |

Lỗi: `400` · `403` (không phải bạn / bị chặn) · `404` · `409` (vượt giới hạn) · `429`. Thân lỗi `{ error: '<mã>', messageVi }` hoặc theo quy ước lỗi hiện có của `invites.js`.

---

## 8. Yêu cầu phi chức năng

| ID | Yêu cầu |
|---|---|
| NFR-01 | `/api/friends/path-progress` với 100 bạn < 500 ms (p95), không truy vấn N+1. `/i/:code` < 300 ms. |
| NFR-02 | Cộng thưởng trong transaction; chống cấp trùng bằng `uq_grant` và `rewarded_sender`. |
| NFR-03 | Không API nào trả tên thật, email, ảnh Google, IP của người khác. IP/thiết bị chỉ dùng chống gian lận. **Tra quy định bảo vệ dữ liệu cá nhân trước khi ra mắt.** |
| NFR-04 | JWT cho mọi API trừ `/i/:code`, `GET /api/invites/:code`. Rate limit lời mời kết bạn 20/giờ. |
| NFR-05 | Link thiệp hiện đúng ảnh/tiêu đề trên Zalo Android/iOS, Messenger, Facebook. |
| NFR-06 | Ghi sự kiện: `invite_shared`, `invite_claimed`, `invite_activated`, `friend_added`, `path_friend_passed`. |
| NFR-07 | Mọi con số ở mục 5 nằm trong `shared/game-config.js`. |

---

## 9. Tiêu chí nghiệm thu

| # | Kiểm tra | Liên quan |
|---|---|---|
| AT-01 | Gửi link thiệp vào Zalo (Android, iOS) hiện ảnh pet + tiêu đề riêng | FR-LND-01 |
| AT-02 | Người nhận học 3 bài mới trong 1 ngày → chưa thưởng; ngày khác học thêm → người gửi +3 Gem, người nhận +500 Sữa | BR-01, BR-02 |
| AT-03 | Nhận thiệp cùng IP với người gửi → là bạn, không ai được thưởng | FR-RWD-03 |
| AT-04 | Người gửi đạt mốc 3 → +1 vé, chỉ một lần | BR-03 |
| AT-05 | 4 vé mốc trong cùng tháng → nhận 3, vé thứ 4 tháng sau | BR-04 |
| AT-06 | Nhận thiệp → hai người là bạn ngay | FR-FRD-01 |
| AT-07 | Kết bạn bằng mã; bị chặn → không gửi lời mời được, không thấy nhau trên bản đồ | FR-FRD-02, 04 |
| AT-08 | Bạn ở lộ trình Luyện thi có đúng một vị trí; bạn xong lộ trình có vương miện | FR-MAP-02 |
| AT-09 | Học lại bài cũ không hiện "vượt qua"; học bài mới vượt bạn thì hiện | FR-MAP-07 |
| AT-10 | Trận Duel bạn bè không đổi league points | BR-06 |
| AT-11 | Rà payload mọi API của phân hệ: không có email, tên thật, ảnh Google | NFR-03 |

---

## 10. Vấn đề còn mở
| # | Vấn đề | Người quyết |
|---|---|---|
| O-01 | Tỷ lệ bể pet khởi đầu 50/30/13/5/2 (GĐ6) | Sonny |
| O-02 | "3 mảnh đá" trong bể Hiếm của gacha thường: giữ hay thay (xem `REFERRAL-GACHA-TICKET.md` v0.3 mục 3) | Sonny |
| O-03 | Cơ chế lưu danh hiệu hiện có | Lập trình viên |
| O-04 | Tra quy định bảo vệ dữ liệu cá nhân, vật phẩm ngẫu nhiên trong game | Sonny, trước khi ra mắt |

## 11. Lịch sử thay đổi
| Phiên bản | Ngày | Nội dung |
|---|---|---|
| 1.0 | 24/11/2026 | Bản đầu (hệ mời và hộp quà riêng) |
| 1.1 | 25/11/2026 | Xây trên thiệp mời có sẵn; bỏ Hộp Bạn Bè, Mảnh, pity, màn chọn pet (chuyển về GĐ6–GĐ7); thưởng bằng Gem/Sữa + vé gacha theo mốc |
