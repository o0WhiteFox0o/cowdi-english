# TASK-FRIENDS — Nhiệm vụ: Bạn bè & Thưởng mời bạn — Cowdi English

Bản 2 · 25/11/2026 · **Thay bản 1** (bản 1 dựng hệ mời và hộp gacha riêng, trùng với code có sẵn — không làm theo bản 1).

> **Trạng thái (25/11/2026): ĐÃ HOÀN THÀNH Bước 0–7 và gộp vào `main` (`9bb6320`, `78ab01b`).**
> Các điều chỉnh theo phản hồi PO sau test local đã áp dụng:
> 1. Bỏ form đặt biệt danh riêng, dùng thống nhất tên hiển thị sẵn có trong Tài khoản (`AccountPage`).
> 2. Thêm tìm kiếm & kết bạn bằng **email khớp chính xác** (`GET /api/friends/lookup`, rate limit 20/giờ, không trả email ra response).
> 3. Thêm máy quét QR trực tiếp trong App (`src/components/QrScannerModal.jsx` dùng `jsqr`, hỗ trợ cả camera sau lẫn chọn ảnh QR) và giữ `?add=CODE` qua Google OAuth cho người chưa cài App quét bằng Camera/Zalo.
> 4. Tương thích MySQL 5.5/5.6+ (`app_events.props` dùng `LONGTEXT`, tối đa 1 `TIMESTAMP` auto/bảng) và giữ route số ít `/api/duel`.

Bạn là lập trình viên làm việc trực tiếp trên repo Cowdi English (`https://github.com/o0WhiteFox0o/cowdi-english`): client React 18 + Vite trong `src/`, server Express trong `server/`, MySQL với migration `server/db/migrate-*.sql`, dữ liệu dùng chung trong `shared/`. Chữ giao diện tiếng Việt.

**Đặc tả gốc:** `docs/04-design/SRS-FRIENDS-v1.1.md`. Mọi mã `FR-*`, `BR-*`, `AT-*` trỏ về SRS. Khi tài liệu đoán sai so với code thật, **theo code thật** và ghi trong mô tả PR.

Nhánh `feat/friends`, **mỗi bước một commit**, `npm test` xanh trước khi sang bước sau. Ghi tiến độ vào `TASK.md` thành mục mới "Bạn bè & Thưởng mời bạn".

**Phạm vi:** chỉ phần trong SRS. **Không** làm lõi gacha, mua vé, banner, chọn Cowdi/quay pet khởi đầu (đó là GĐ6–GĐ7).

---

## Bước 0 — Khảo sát (chỉ viết báo cáo)

`docs/05-implementation/RPT-FRIENDS-SURVEY.md`, mỗi câu có đường dẫn + số dòng:
1. Luồng `InvitePage` → đăng nhập → `POST /api/invites/:code/claim`: client gọi claim ở đâu, lúc nào?
2. Hàm cấp thưởng khi hoàn thành bài (`grantLessonAndUnitRewards` hay tương đương): có biết bài **mới lần đầu** và **ngày** hoàn thành không?
3. Vé gacha của GĐ6 đã có nơi lưu chưa (`gacha_tickets` trong `users`, hay ledger)? Danh hiệu lưu ở đâu?
4. Express phục vụ `index.html` thế nào trong production (Nginx trả thẳng `dist/` hay qua Express)? Cổng Express?
5. Luồng tạo/tham gia Duel và chỗ cộng league points.
6. Chữ ký thật của `buildPathNodes`, `getNextPathLesson` và các trường `userData` chúng cần.
7. Cơ chế admin có sẵn.

Dừng và chờ Sonny duyệt nếu câu 4 cho thấy không thể cho Express phục vụ `/i/:code` mà không đổi cách triển khai.

---

## Bước 1 — Migration & cấu hình
- `server/db/migrate-friends.sql` (idempotent): thay đổi ở SRS mục 6.
- `shared/game-config.js`: `INVITE_REWARDS`, `FRIEND_LIMITS`.
- `shared/friends.js`: hàm thuần `isActivated(newLessonDates, claimedAt, now)` và `milestonesReached(count, alreadyGranted)`; test trong `shared/friends.test.js`.

## Bước 2 — OG cho thiệp & QR (FR-LND)
- Express `GET /i/:code`: đọc `dist/index.html` một lần (cache trong bộ nhớ), thay các thẻ `og:*` trong `<head>` theo thiệp, trả về. Escape mọi chuỗi chèn vào HTML. Đặt route **trước** static/SPA fallback.
- `og:image`: `public/image/og/<petSpecies>.png` nếu có, không thì ảnh chung. Liệt kê ảnh còn thiếu trong PR.
- Ghi đoạn cấu hình Nginx cho Sonny trong PR (không tự sửa server): `location ^~ /i/ { proxy_pass http://127.0.0.1:<PORT>; proxy_set_header Host $host; }`.
- Thay QR `api.qrserver.com` trong `InviteSheet.jsx` bằng thư viện QR chạy ở client (FR-LND-04).

## Bước 3 — Biệt danh, IP/thiết bị, thưởng mời (FR-RWD, FR-FRD-05)
- Biệt danh: `PUT /api/me/nickname`, màn nhập biệt danh lần đầu tạo thiệp. `POST /api/invites` dùng biệt danh cho `sender_name`.
- `device_hash` = SHA-256 của user-agent + id ngẫu nhiên client lưu ở localStorage (`cowdi_device`). Ghi khi tạo và khi nhận thiệp; tính `flagged` theo FR-RWD-01.
- Kiểm tra học thật trong **đúng** hàm cấp thưởng bài học (bước 0 câu 2), cùng transaction. Thưởng theo BR-02..04 qua `wallet_ledger` (`uq_grant`). Vé gacha ghi theo bước 0 câu 3.
- Thông báo một lần (FR-RWD-05); thống kê trong `InviteSheet` (FR-RWD-06, `GET /api/invites/mine/stats`); cập nhật `HowToEarnSheet.jsx` (FR-RWD-07).
- Test: AT-02..05.

## Bước 4 — Bạn bè (FR-FRD)
- Bảng `friendships` luôn lưu `user_low < user_high`; giới hạn BR-07.
- Sửa claim thiệp: thành công → tạo `friendships` `accepted`, `source='invite'` (FR-FRD-01), kể cả thiệp `flagged`.
- API kết bạn, chặn, báo cáo theo SRS mục 7.
- Trang `src/pages/FriendsPage.jsx` 3 tab; QR mã bạn bè (cùng thư viện QR bước 2); nút "Gửi thiệp cho người mới" mở `InviteSheet`.
- Test: AT-06, AT-07.

## Bước 5 — Thăm pet & thách đấu (FR-VIS)
- `src/pages/FriendPetPage.jsx`; API chỉ trả trường ở BR-08.
- Duel thêm `opponentId` (phải là bạn, không chặn); không cộng/trừ league points.
- Test: AT-10.

## Bước 6 — Bạn bè trên lộ trình (FR-MAP)
- `GET /api/friends/path-progress`: 2 truy vấn (danh sách bạn; tiến độ `WHERE user_id IN (...)`), không N+1.
- `src/features/friends/useFriendPositions.js`: cache 5 phút; tính vị trí bằng **chính** `getNextPathLesson`/`buildPathNodes`, không viết lại luật mở khoá.
- `LearningPathPage.jsx`: avatar cạnh node, "+N", avatar người dùng nổi bật, chip lộ trình khác, dòng "đang đi trước bạn N bài".
- "Vượt qua": lưu vị trí `current` trước khi vào bài, so khi quay lại trang Lộ trình → toast. Vị trí không đổi thì không hiện.
- Gợi ý trong `InviteSheet` (FR-MAP-09).
- Test: AT-08, AT-09; bạn bị chặn không hiện.

## Bước 7 — Kiểm tra cuối
- Ghi sự kiện NFR-06 (dùng hệ thống có sẵn; chưa có thì bảng `app_events (id, user_id, name, props JSON, created_at)`).
- Rà payload mọi API của phân hệ (AT-11), ghi kết quả vào PR.
- Mô tả PR: chỗ code khác tài liệu, ảnh OG còn thiếu, cấu hình Nginx, AT-01 để Sonny thử trên Zalo thật.

---

## Không được làm
- Không làm lõi gacha, mua vé, banner, màn chọn Cowdi/quay pet khởi đầu (GĐ6–GĐ7).
- Không thêm loại tài nguyên mới (không Bụi sao, không Mảnh, không vé riêng cho mời bạn).
- Không gọi API Zalo/Facebook lấy danh sách bạn bè; không dùng thư viện Zalo không chính thức.
- Không cộng tài nguyên ở client.
- Không trả email, tên thật, ảnh Google, IP của người khác.
- Không thêm chat, tìm người theo tên/email, bảng xếp hạng bạn bè, thông báo đẩy.
- Không đổi giới hạn thiệp hiện có (5/ngày, 20/tuần) và luật "thiệp chỉ cho người mới".
- Không sửa `shared/battle-engine.js`, công thức Sữa/Gem/Đá, luật mở khoá lộ trình.
- Không dùng `window.alert/confirm/prompt`.

## Định nghĩa "xong"
8 commit (bước 0–7); `npm test` xanh; build không lỗi; AT-02..AT-11 đạt; `TASK.md` và mô tả PR cập nhật.
