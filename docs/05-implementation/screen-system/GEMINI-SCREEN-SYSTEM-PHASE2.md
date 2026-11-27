# GEMINI — Hệ thống màn, Đợt 2: cấu hình trên server + trang admin kiểm tra màn

> Giao cho: Gemini · Viết: Claude, 2026-11-27 · Chuẩn gốc: `STD-SCREEN-SYSTEM-v1.0.md` mục 5–6.
> Điều kiện bắt đầu: **Đợt 1 đã merge** (registry, `mixLesson`, `ScreenHost` có prop `sandbox`, báo cáo `RPT-SCREEN-COVERAGE`).
> Mẫu giao diện: canvas "Cowdi — Giao diện vượt ải bài học", artboard **Admin · Kiểm tra màn**.
> Nhánh: `feat/screen-system-p2`. **Không merge khi chưa có Sonny duyệt.**
> Ký hiệu **[A]**: giả định, kiểm trong code ở Bước 0.

---

## 0. Mục tiêu và phạm vi

| Làm | Không làm |
|---|---|
| Bảng server: trạng thái màn, trọng số, tài khoản thử, nhật ký | Màn F-xx (Đợt 3–4) |
| API đọc cấu hình cho client + API admin | Kho câu dẫn (tab thêm ở Đợt 3) |
| Client tải cấu hình từ server, dự phòng bằng file tĩnh | Thống kê từng màn (tab thêm ở Đợt 4) |
| Trang `/admin/screens`: Danh mục · Ma trận dữ liệu · Trộn thử · Xem trước · Tài khoản thử · Nhật ký | Đổi luật trộn |

---

## Bước 0 — Kiểm tra trước khi code

1. **[A]** Cơ chế phân quyền admin hiện có: middleware phía server (ví dụ `requireAdmin`) và cách client chặn route admin. Trang quản lý ảnh và `GEMINI-PET-MOTION-ADMIN.md` đã có trang admin: dùng đúng cơ chế đó, không tạo cơ chế mới.
2. **[A]** Nơi khai báo route admin phía client và layout admin đang dùng (để trang mới cùng giao diện các trang admin khác, không theo giao diện bài học).
3. Đọc lại `registry.js`, `mixer.js`, `items.js` của Đợt 1. Mọi chỗ lệch với tài liệu này: theo code Đợt 1, ghi trong PR.

---

## 1. Cơ sở dữ liệu

Migration `server/db/migrate-screen-system.sql`, idempotent theo cách các migration hiện có (`CREATE TABLE IF NOT EXISTS`, thủ tục thêm cột nếu cần, `DROP PROCEDURE` ở cuối).

```sql
CREATE TABLE IF NOT EXISTS screen_config (
  code        VARCHAR(8)  PRIMARY KEY,                  -- 'T-01', 'F-03'
  status      ENUM('on','test','off','todo','retired') NOT NULL DEFAULT 'off',
  note        VARCHAR(255) NULL,
  updated_by  INT NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS screen_weights (
  group_id    VARCHAR(16) NOT NULL,                     -- 'beginner' | 'intermediate' | 'exam'
  level       ENUM('focus','friendly') NOT NULL,
  weight      DECIMAL(4,3) NOT NULL,                    -- 0.000–1.000
  updated_by  INT NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, level)
);

CREATE TABLE IF NOT EXISTS screen_testers (
  user_id     INT PRIMARY KEY,
  note        VARCHAR(255) NULL,
  added_by    INT NULL,
  added_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS screen_config_log (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  target      VARCHAR(48) NOT NULL,                     -- 'status:F-03', 'weight:exam', 'tester:123'
  old_value   TEXT NULL,                                -- JSON
  new_value   TEXT NULL,                                -- JSON
  changed_by  INT NOT NULL,
  changed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Seed (chạy lại an toàn, `INSERT IGNORE`): 8 mã T với trạng thái theo `SCREEN_CONFIG` Đợt 1 (`T-08` = `on`), 11 mã F với `todo`, trọng số 3 nhóm theo STD 3.3. Ghi trạng thái theo bảng mã trong STD mục 2.

---

## 2. API

### 2.1 Client học viên

`GET /api/screens/config` (đăng nhập):

```json
{ "version": "2026-11-27T15:00:00Z",
  "status":  { "T-01": "on", "F-03": "test", "...": "..." },
  "weights": { "beginner": { "friendly": 1, "focus": 0 }, "intermediate": { "friendly": 0.5, "focus": 0.5 }, "exam": { "friendly": 0.25, "focus": 0.75 } },
  "isTester": false }
```

- `version` = `MAX(updated_at)` của hai bảng cấu hình; trả header `ETag` theo `version`, hỗ trợ `If-None-Match` → `304`.
- Client: `ScreenConfigProvider` tải sau khi đăng nhập, cache trong bộ nhớ + `localStorage` (`cowdi.screenConfig`), làm mới khi app trở lại foreground nếu cache > 10 phút.
- Lỗi mạng / chưa có cache → dùng `SCREEN_CONFIG` tĩnh của Đợt 1. **Không bao giờ chặn bài học vì không tải được cấu hình.**
- `mixLesson` nhận `config` và `isTester` từ provider (đã có tham số từ Đợt 1).
- Mã có trong cấu hình nhưng chưa có trong registry phía client (ví dụ F-xx khi client cũ) → bỏ qua.

### 2.2 Admin (mọi route qua middleware admin)

| Method | Route | Body / query | Ghi chú |
|---|---|---|---|
| GET | `/api/admin/screens` | — | Cấu hình đầy đủ + `note`, `updated_by` (tên), `updated_at` |
| PUT | `/api/admin/screens/:code` | `{ status, note? }` | Kiểm `code` khớp `^[TF]-\d{2}$`, status hợp lệ. Không cho đặt `on`/`test` cho mã mà client hiện hành chưa có component (client gửi danh sách `supportedCodes` khi tải trang admin; server lưu tạm 1 giờ) |
| PUT | `/api/admin/screen-weights/:group` | `{ friendly, focus }` | Mỗi giá trị 0–1, tổng > 0 |
| GET | `/api/admin/screen-testers` | `?q=` | Tìm theo email/tên, trả 20 dòng |
| POST | `/api/admin/screen-testers` | `{ userId, note? }` | |
| DELETE | `/api/admin/screen-testers/:userId` | — | |
| GET | `/api/admin/screen-log` | `?limit=50&before=` | |

Mọi lệnh ghi: một giao dịch gồm cập nhật bảng + một dòng `screen_config_log`.

---

## 3. Trang `/admin/screens`

Giao diện theo layout admin hiện có (Bước 0.2), bố cục theo artboard **Admin · Kiểm tra màn**. Thanh trên cùng: chọn **Bài**, **Nhóm học**, **Seed**, nút **Trộn thử**. Các tab:

### 3.1 Danh mục

- Bảng mọi mã T/F: Mã · Tên · Mức · Kỹ năng/vị trí (chip màu kỹ năng) · **Bài này** (✓ đủ dữ liệu / ✗ trường thiếu, theo bài đang chọn) · **Dùng được x/N bài** (toàn kho) · Trạng thái · Ghi chú · nút Xem.
- Đổi trạng thái: dropdown → hộp xác nhận trong trang (không `window.confirm`) ghi rõ hệ quả ("F-03 sẽ hiện cho tài khoản thử").
- Lọc: mức, kỹ năng, "chỉ màn thiếu dữ liệu ở bài này".
- Hàng **T-03 Ngữ pháp** hiện với nhãn "Không chiếm vị trí · dùng làm mẹo pet", không đổi trạng thái được.

### 3.2 Ma trận dữ liệu

- Hàng = bài (lọc theo lộ trình, unit), cột = mã màn; ô ✓ / ✗ (hover/chạm: trường thiếu).
- Cột tổng kết mỗi slot: số màn chạy được. **Bài có slot = 0 tô đỏ** (bài đó sẽ chạy 5 màn).
- Hàng tổng cuối: mỗi mã dùng được ở bao nhiêu bài.
- Nút **Xuất CSV**. Tính toàn bộ phía client từ dữ liệu bài tĩnh (không cần API).

### 3.3 Trộn thử

- Input: bài, nhóm, `isTester` (bật/tắt), `lastMix` (6 ô chọn, mặc định trống), seed (ô số + nút ngẫu nhiên).
- Kết quả: danh sách màn theo thứ tự (vòng màu kỹ năng + mã + tên), `skipped`, và `log` của `mixLesson`.
- **Kiểm luật** (mỗi dòng ✓/✗): (1) màn đầu là Gặp từ; (2) màn cuối là Boss; (3) mỗi kỹ năng có trong bài xuất hiện đúng 1 lần; (4) màn 2 không là Nói; (5) không lặp `lastMix` khi có lựa chọn; (6) ràng buộc nhóm; (7) không màn `test` khi `isTester = false`.
- Nút **Chạy 1 000 lần**: bảng phân bố % mỗi mã ở mỗi slot, % thứ tự mỗi kỹ năng ở vị trí 2–5, số lần vi phạm luật (phải là 0).

### 3.4 Xem trước

- Khung điện thoại 390×844 (thu nhỏ vừa khung), render `Component` của màn đang chọn với dữ liệu bài đang chọn, `sandbox = true`.
- Bảng bên phải: luồng sự kiện `onEvent` theo thời gian thực (type, payload), lý do `canRun`.
- Nút **Chơi thử cả bài**: chạy `ScreenHost` với seed đang chọn, `sandbox = true` (không ghi `wordProgress`, điểm pet, Sữa, `lessonMixLog`).
- Nút đổi khung: 360×640 / 390×844 / 800×1280 để kiểm "không cuộn".

### 3.5 Tài khoản thử

Ô tìm người dùng, danh sách hiện tại (tên, email, ghi chú, ngày thêm), nút thêm/bỏ.

### 3.6 Nhật ký

50 thay đổi gần nhất: thời gian, người đổi, đối tượng, cũ → mới. Nút "Xem thêm".

Tab dành sẵn (ẩn trong đợt này): **Kho dẫn nhập** (Đợt 3), **Thống kê** (Đợt 4).

---

## 4. Test

| # | Kiểm |
|---|---|
| A1 | Người không phải admin gọi API admin → 403; vào `/admin/screens` → chuyển trang |
| A2 | Đổi trạng thái → có 1 dòng log; `GET /api/screens/config` trả `version` mới |
| A3 | `If-None-Match` đúng version → 304 |
| A4 | Tắt server: app vẫn học được bằng cấu hình tĩnh |
| A5 | Tài khoản thử thấy màn `test` trong Trộn thử và trong bài thật; tài khoản thường không thấy |
| A6 | Chơi thử cả bài trong admin: `wordProgress`, `pet.skills`, ví Sữa, `lessonMixLog` **không đổi** (so trước/sau) |
| A7 | Ma trận dữ liệu khớp với `RPT-SCREEN-COVERAGE` của Đợt 1 |
| A8 | Trọng số sai (âm, > 1, tổng = 0) → 400 |

## 5. Definition of Done

- [ ] Migration chạy 2 lần không lỗi; seed đủ 19 mã + 3 nhóm trọng số
- [ ] A1–A8 qua
- [ ] Trang admin dùng được trên màn 1280px và 768px
- [ ] Ảnh chụp 6 tab trong PR
- [ ] Hướng dẫn ngắn cho Sonny trong PR: cách bật một màn cho tài khoản thử, cách đọc Ma trận dữ liệu

## 6. Không được làm

- Không cho học viên thường đọc danh sách tài khoản thử hay nhật ký.
- Không đổi luật trộn, không đổi registry ngoài việc đọc cấu hình.
- Không dùng `window.alert/confirm/prompt`.
- Không lưu cấu hình trong `userData`.
