# Cowdi English — Phương án Hệ thống Bạn bè & Mời qua Zalo/Facebook

Phiên bản: 0.1 · 24/11/2026 · **Lưu ý 25/11/2026: phần kỹ thuật và thưởng đã được thay bởi `SRS-FRIENDS-v1.1.md` (xây trên thiệp mời có sẵn trong repo). Tài liệu này chỉ còn giá trị tham khảo về định hướng.**

---

## 0. Tóm tắt

- **Không** đồng bộ danh sách bạn bè (friend graph) từ Zalo/FB. Facebook chỉ trả về bạn bè *đã dùng app* và phải qua App Review. Zalo không có API chính thức ổn định cho web app ngoài (Mini App là ngoại lệ, chọn tối đa 10 người). Thư viện "Zalo personal" không chính thức thì **cấm dùng**.
- Cowdi **tự giữ social graph** (Long-term Asset). Zalo/FB chỉ là **kênh phát link mời** (distribution channel).
- Làm theo thứ tự: **Referral (mời) → Bạn bè cốt lõi → Tương tác bạn bè**. Có số liệu mới làm bước tiếp theo.

Phân loại: **Fact** = đã kiểm chứng · **Assumption** = giả định cần kiểm · **Recommendation** = đề xuất.

---

## 1. Mục tiêu & chỉ số

| Mục tiêu | Chỉ số (metric) | Ngưỡng để làm phase sau (Assumption, chỉnh theo thực tế) |
|---|---|---|
| Tăng người dùng mới qua giới thiệu | Số link mời được chia sẻ / người dùng hoạt động tuần | ≥ 0.3 |
| Người được mời thật sự học | Tỷ lệ kích hoạt (activation): đăng ký **và** xong 3 bài trong 7 ngày | ≥ 30% |
| Hệ số lan truyền | K-factor = lời mời/người × tỷ lệ kích hoạt | > 0.15 thì đáng đầu tư tiếp |
| Giữ chân (retention) | D7 của người có ≥ 1 bạn so với người không có bạn | Chênh ≥ 5 điểm % mới làm Phase 3 |

---

## 2. Phase 1 — Mời bạn (Referral) qua Zalo/FB · ~1 tuần

### 2.1 Luồng
1. Mỗi user có `friend_code` 6–8 ký tự (bỏ các ký tự dễ nhầm 0/O, 1/I).
2. Nút **"Mời bạn học cùng"** → link `https://cowdi.net/i/<code>`.
3. Chia sẻ:
   - **Web Share API** (`navigator.share`) — trên điện thoại mở bảng chia sẻ hệ điều hành, có sẵn Zalo, Messenger, FB. Đây là kênh chính, không cần SDK.
   - Dự phòng trên máy tính: nút "Sao chép link" + link `facebook.com/sharer/sharer.php?u=...`.
   - Nút chia sẻ Zalo chính thức (Zalo Social Plugin): **[MỞ — cần kiểm tra tài liệu Zalo hiện hành]**, không bắt buộc ở Phase 1.
4. Người nhận mở link → landing page → đăng ký (Google OAuth hiện có). Mã mời lưu vào cookie/localStorage 30 ngày để không bị mất qua bước OAuth.
5. Sau đăng ký: tạo bản ghi `referrals` trạng thái `pending`, **tự động kết bạn** hai người (khi Phase 2 đã có).
6. Khi người được mời **kích hoạt** (xong 3 bài) → `activated` → trao thưởng cho cả hai.

### 2.2 Xem trước link (link preview) — bắt buộc
Zalo/FB đọc thẻ Open Graph (`og:title`, `og:image`, `og:description`) **từ HTML trả về server**, không chạy JavaScript. App là SPA (React/Vite), nên:
- Express thêm route `GET /i/:code` trả HTML tĩnh có thẻ OG (ảnh pet của người mời + câu "Bé X mời bạn nuôi pet học tiếng Anh") rồi redirect phía client vào app.
- Nginx (aaPanel) chuyển `/i/*` về Express thay vì `index.html`.
- Kiểm tra bằng Facebook Sharing Debugger và gửi thử trong Zalo.

Không có bước này, link chia sẻ sẽ hiện trơn, tỷ lệ bấm thấp. Đây là việc có tác động lớn nhất với công nhỏ nhất.

### 2.3 Phần thưởng — **đã chọn: Vé gacha "Bạn Đồng Hành"**
Chi tiết ở `claude/REFERRAL-GACHA-TICKET.md` (pet khởi đầu, vé, mốc tình bạn, bể quà, pity, Mảnh). Không thưởng Gem hay Đá.

Quy tắc chống gian lận:
- Người mời chỉ nhận thưởng khi người được mời **kích hoạt** (3 bài trong ít nhất 2 ngày khác nhau). Người được mời được chọn pet khởi đầu lúc đăng ký (Cowdi hoặc Vé Pet Khởi Đầu, xem mục 1A của tài liệu vé).
- Tối đa **10 lượt thưởng/tháng** cho người mời.
- Ghi qua `wallet_ledger` với `reason='referral'`, `ref_id='<invitee_user_id>'` → khoá `uq_grant` có sẵn chặn cộng trùng.
- Ghi IP/thiết bị lúc đăng ký. Trùng với người mời thì vẫn kết bạn nhưng **không thưởng**.

---

## 3. Phase 2 — Bạn bè cốt lõi · ~1–2 tuần

### 3.1 Cách kết bạn
- Nhập mã bạn bè, hoặc quét **QR** (QR chứa link `/i/<code>`, dùng chung với Phase 1).
- Tự kết bạn qua referral.
- **Không** có tìm kiếm theo tên/email (tránh trẻ bị người lạ tìm ra).
- Lời mời cần người kia chấp nhận. Giới hạn 100 bạn/người, 20 lời mời đang chờ.

### 3.2 Một loại tài khoản cho mọi người **[ĐÃ CHỐT 24/11/2026]**
App chưa có tính năng phụ huynh → thiết kế đại chúng, không tách tài khoản trẻ em. Các mặc định an toàn áp dụng cho **mọi** tài khoản (không tốn thêm công, sau này thêm phụ huynh không phải làm lại):
- Chỉ hiển thị **biệt danh + avatar pet**, không hiển thị tên thật, ảnh Google, email.
- Không tìm kiếm theo tên/email; không chat tự do.
- Tính năng phụ huynh duyệt kết bạn: để sau, khi app có tài khoản phụ huynh.
- Pháp lý dữ liệu cá nhân (đặc biệt của trẻ em): **cần tra văn bản hiện hành trước khi ra mắt**, chưa kiểm chứng trong tài liệu này.

### 3.3 Tính năng Phase 2
- Danh sách bạn: pet chính, cấp, hệ, chuỗi ngày học (streak), online gần nhất.
- **Thăm pet của bạn** (chỉ xem).
- **Thách đấu bạn bè**: dùng hệ Duel hiện có, thêm `opponent_id` chỉ định. Trận bạn bè **không tính league points** để tránh hai người quen "đổi điểm" cho nhau. **[MỞ]**
- Huỷ kết bạn, chặn (block), báo cáo.
- **Không có chat tự do.** Chỉ có biểu cảm/sticker dựng sẵn (Phase 3).

---

## 4. Phase 3 — Tương tác bạn bè (chỉ làm khi số liệu ở mục 1 đạt) · ~1–2 tuần

- **Tặng Sữa mỗi ngày**: mỗi người tặng mỗi bạn 1 lần/ngày, Sữa do **hệ thống tạo** (không trừ ví người tặng), giới hạn nhận 10 lần/ngày. Không cho chuyển Gem/Đá giữa tài khoản (chặn farm bằng nhiều nick).
- ~~Bảng xếp hạng bạn bè tuần~~ → **bỏ** (Sonny, 24/11/2026). Yếu tố cạnh tranh thay bằng **Bạn bè trên lộ trình** (mục 4.1).
- **Sticker/biểu cảm** dựng sẵn trên trang thăm pet.
- **Nhóm lớp** (class group) cho giáo viên/phụ huynh: mã nhóm, bảng xếp hạng lớp. Đây là cầu nối tự nhiên với nhóm Zalo lớp học, có thể là hướng B2B (bán cho trường/trung tâm) sau này.

### 4.1 Bạn bè trên lộ trình (kiểu Candy Crush Saga) **[ĐÃ CHỐT hướng, 24/11/2026]**

Mục tiêu: người học **nhìn thấy bạn mình đang ở đâu trên bản đồ lộ trình**, muốn đuổi kịp hoặc vượt lên. Không có bảng xếp hạng, không có điểm riêng. Thước đo duy nhất là **tiến độ học thật** trên lộ trình.

**Hiển thị trên `LearningPathPage.jsx`:**
- Avatar tròn = icon pet chính của bạn (đúng cấp tiến hoá) + biệt danh nhỏ, đặt cạnh node mà bạn đó đang đứng.
- Vị trí của bạn trên lộ trình P = `getNextPathLesson(friendData, P)` (node `current` của họ trên P). Học xong cả lộ trình → đứng ở node cuối, có vương miện 👑.
- Một bạn xuất hiện trên lộ trình P nếu: P là `activePath` của họ, **hoặc** họ đã xong ít nhất 1 bài thuộc P. Lộ trình dùng chung unit (`exam-intro`, `exam-pron`) tính bình thường theo `pathIds`.
- Nhiều bạn cùng một node: hiện tối đa 3 avatar xếp chồng + "+N". Bấm vào mở danh sách.
- Avatar của chính người dùng nổi bật hơn (viền màu nhóm, lớn hơn).
- Bạn bè đang ở lộ trình khác: một dải chip nhỏ đầu trang "Bạn bè ở lộ trình khác: Mai (IELTS), Nam (Mới học)…". Bấm chip → xem trang thăm pet, **không** tự đổi lộ trình của mình.
- Bấm avatar bạn trên bản đồ → trang thăm pet (xem pet, thách đấu, tặng Sữa).

**Khoảnh khắc cạnh tranh (nhẹ, không gây áp lực):**
- Đầu trang: "Mai đang đi trước bạn 3 bài" (chỉ bạn gần nhất phía trước, cùng lộ trình).
- Khi người dùng xong bài và node mới **vượt qua** vị trí một hay nhiều bạn: hiện thông báo trong app "🎉 Bạn vừa vượt qua Mai!" kèm avatar pet của Mai. So sánh vị trí trước và sau khi xong bài, không cần server đẩy realtime.
- Không gửi thông báo cho người bị vượt (chưa có Web Push; tránh tạo cảm giác bị bỏ lại).

**Dữ liệu & API:**
- `GET /api/friends/path-progress` → mỗi bạn đã `accepted`:
  `{ userId, nickname, petId, petEvolution, learnerGroup, activePath, completedLessons: [...], passedUnits: [...] }`
  - `passedUnits` = các `unitId` có checkpoint/placement `passed` (không trả điểm số).
  - Không trả tên thật, email, ảnh Google, ví, điểm bài.
- Client tính vị trí bằng chính `buildPathNodes`/`getNextPathLesson` trong `src/data/path.js` (cùng luật mở khoá với người dùng, không viết lại logic ở server).
- Cache phía client 5 phút; tải lại khi mở trang Lộ trình hoặc sau khi xong bài.
- Giới hạn trả về 100 bạn (bằng giới hạn số bạn).

**Lưu ý thiết kế:**
- Bạn bè **khác nhóm học** sẽ hiếm khi cùng lộ trình. Hiệu quả cạnh tranh phụ thuộc vào việc mời được người **cùng trình độ** → nên gợi ý trong màn mời: "Mời bạn cùng lớp / cùng mục tiêu thi".
- Người vượt unit nhờ kiểm tra đầu vào (`placed`) sẽ "nhảy" xa trên bản đồ. Đây là đúng luật, không cần chặn.
- Test: bạn ở lộ trình `free` (Luyện thi) có đúng 1 node `current`; bạn đã xong lộ trình hiện vương miện ở node cuối; thông báo "vượt qua" không hiện khi học lại bài cũ (vị trí không đổi).

---

## 5. Phase 4 — Tuỳ chọn, không làm mặc định

| Việc | Khi nào làm |
|---|---|
| Đăng nhập bằng Zalo/Facebook | Khi số liệu cho thấy phụ huynh bỏ cuộc ở bước đăng nhập Google |
| Zalo Mini App (có bộ chọn bạn bè gốc, tối đa 10 người) | Khi Zalo là kênh chính và sẵn sàng duy trì thêm một bản build |
| Facebook `user_friends` | Không khuyến nghị: phải App Review, chỉ trả về bạn đã dùng app, trẻ em không dùng FB |

---

## 6. Dữ liệu (MySQL, migration idempotent như `server/db/migrate-*.sql`)

```sql
ALTER TABLE users
  ADD COLUMN friend_code  CHAR(8) NULL UNIQUE,
  ADD COLUMN nickname     VARCHAR(32) NULL,
  ADD COLUMN referred_by  INT UNSIGNED NULL,
  ADD COLUMN starter_choice ENUM('default','cowdi','ticket') NOT NULL DEFAULT 'default',
  ADD COLUMN starter_pet_id VARCHAR(32) NULL;

-- Một dòng cho mỗi cặp; user_low < user_high để không trùng chiều
CREATE TABLE friendships (
  user_low     INT UNSIGNED NOT NULL,
  user_high    INT UNSIGNED NOT NULL,
  status       ENUM('pending','accepted','blocked') NOT NULL,
  requested_by INT UNSIGNED NOT NULL,
  blocked_by   INT UNSIGNED NULL,
  source       ENUM('code','qr','referral') NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at  TIMESTAMP NULL,
  PRIMARY KEY (user_low, user_high),
  INDEX (user_high, status)
);

CREATE TABLE referrals (
  invitee_id   INT UNSIGNED PRIMARY KEY,      -- mỗi người chỉ được mời bởi 1 người
  inviter_id   INT UNSIGNED NOT NULL,
  status       ENUM('pending','activated','rewarded','rejected') NOT NULL DEFAULT 'pending',
  signup_ip    VARCHAR(45) NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP NULL,
  INDEX (inviter_id, status, activated_at)
);

-- Phase 3
CREATE TABLE friend_gifts (
  sender_id   INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  gift_date   DATE NOT NULL,
  PRIMARY KEY (sender_id, receiver_id, gift_date),
  INDEX (receiver_id, gift_date)
);
```

Thưởng referral và quà Sữa đều ghi vào `wallet_ledger` có sẵn (`reason='referral'` / `'friend_gift'`).

---

## 7. API

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/i/:code` | HTML có thẻ OG + redirect vào app |
| GET | `/api/me/invite` | Trả `friend_code`, link, số lượt mời/kích hoạt/thưởng tháng này |
| POST | `/api/referrals/claim` | Gọi sau đăng ký với mã đã lưu; idempotent |
| GET | `/api/friends` | Danh sách bạn + lời mời đang chờ |
| POST | `/api/friends/requests` | Body `{ code }`; rate limit 20/giờ |
| POST | `/api/friends/requests/:userId/accept` · `/decline` | |
| DELETE | `/api/friends/:userId` | Huỷ kết bạn |
| POST | `/api/friends/:userId/block` · `/report` | |
| GET | `/api/friends/:userId/pet` | Chỉ khi đã là bạn; trả dữ liệu hiển thị tối thiểu |
| POST | `/api/duels` (sửa) | Thêm `opponentId` tuỳ chọn, phải là bạn |
| POST | `/api/friends/:userId/gift` | Phase 3 |

Kích hoạt referral: kiểm tra trong cùng hàm cấp thưởng khi hoàn thành bài (`PUT /api/progress`), không cần cron.

---

## 8. UI

- **AccountPage**: thẻ "Mời bạn" (link, nút chia sẻ, QR, đếm lượt mời/thưởng).
- **Trang Bạn bè** mới: tab Bạn bè · Lời mời · Thêm bạn (nhập mã / quét QR).
- **Trang thăm pet** của bạn: pet, cấp, nút Thách đấu, (Phase 3) Tặng Sữa, sticker.
- **Màn chọn pet khởi đầu** (chỉ người được mời): Cowdi hoặc Vé Pet Khởi Đầu.
- **Landing `/i/:code`**: ảnh pet người mời, 1 câu giới thiệu, nút "Bắt đầu học".

---

## 9. Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Farm thưởng bằng nhiều tài khoản | Cao | Thưởng khi kích hoạt, giới hạn tháng, kiểm IP, không chuyển Gem/Đá |
| Người lạ tiếp cận người học nhỏ tuổi | Cao | Không tìm kiếm, không chat, chỉ biệt danh; phụ huynh duyệt khi có tài khoản phụ huynh |
| Pháp lý dữ liệu cá nhân | Cao | Tra văn bản hiện hành, chính sách quyền riêng tư |
| Ít người dùng → danh sách bạn trống | Trung bình | Làm Referral trước; bạn bè có ý nghĩa khi đi kèm lời mời |
| Link preview không hiện trên Zalo | Trung bình | Route `/i/:code` render phía server, test thật trên Zalo |
| Trận bạn bè làm lệch bảng xếp hạng | Thấp | Không tính league points |

---

## 10. Quyết định cần chốt

1. ~~Tài khoản trẻ em~~ → đã chốt: một loại tài khoản, phụ huynh để sau.
2. ~~Phần thưởng referral~~ → đã chốt: xem `REFERRAL-GACHA-TICKET.md` mục 5.
3. **Trận bạn bè** có tính league points không? (đề xuất: không)
4. **Nhóm lớp** (Phase 3) có phải hướng ưu tiên để đi B2B không?

## 11. Thứ tự giao việc (mỗi bước một commit, nhánh `feat/friends`)

1. Migration `users.friend_code` + `referrals` + route `/i/:code` có OG + nút chia sẻ → **ra mắt, đo 2–4 tuần**.
2. Migration `friendships` + API kết bạn + trang Bạn bè.
3. Thách đấu bạn bè.
4. Bạn bè trên lộ trình (mục 4.1) — làm ngay sau bước 2 vì đây là yếu tố cạnh tranh chính.
5. (Theo số liệu) Tặng Sữa, sticker, nhóm lớp.

Nghiệm thu mỗi bước: test idempotent (gọi claim/accept 2 lần không cộng trùng), test không API nào trả tên thật/email/ảnh Google của người khác, test link chia sẻ trên Zalo Android/iOS hiện đủ ảnh và tiêu đề.
