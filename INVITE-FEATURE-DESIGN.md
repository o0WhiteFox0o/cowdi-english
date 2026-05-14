# 🎁 Thiết kế: "Gửi trứng pet cho bạn" — Invite Feature

> Ngày: 2026-05-14
> Trạng thái: **Design + chuẩn bị implement**
> Liên quan: [GROWTH-STRATEGY-2026-05.md](./GROWTH-STRATEGY-2026-05.md), [SHARE-FEATURE-DESIGN.md](./SHARE-FEATURE-DESIGN.md)

---

## 1. Mục tiêu

Chuyển từ *"share một cái URL"* sang **"tặng một con pet"**.
- Phía gửi: **≤ 2 chạm** để gửi xong.
- Phía nhận: **thiệp mời sống động**, không phải HomePage trần.
- Mỗi thiệp có **QR code** để dùng được cả offline (in/chiếu màn hình/show trực tiếp).

---

## 2. Use case chính

| Tình huống | Cách dùng |
|---|---|
| Rủ bạn qua chat (Zalo/Messenger) | Web Share API → link `/i/:code` |
| Rủ bạn trực diện (lớp, café) | Mở Sheet → show **QR code** → bạn quét bằng camera |
| Treo QR trong lớp học (giáo viên) | Tải thiệp PNG có QR → in ra |
| Đăng story / post | Tải thiệp PNG có QR → đăng |

→ Vì thế **QR phải có trên cả 3 surface**: trong sheet gửi, trong thiệp share PNG, và trong landing page nhận.

---

## 3. Flow phía người gửi (2 chạm)

### Chạm 1: Bấm "🎁 Mời bạn" (Navbar / AccountPage)

Mở **Invite Sheet** (bottom sheet trên mobile, modal trên desktop):

```
┌──────────────────────────────────────┐
│   🎁 Tặng bạn một quả trứng pet      │
│                                      │
│      [🥚 Trứng động đậy]             │
│                                      │
│   ┌────────────────────────────┐    │
│   │     ▓▓▓▓ QR CODE ▓▓▓▓     │    │  ← Hiện ngay
│   │     ▓▓        ▓▓▓▓▓▓     │    │     để bạn show
│   │     ▓▓ ▓▓▓▓ ▓▓▓▓▓▓▓     │    │     trực tiếp
│   │     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     │    │
│   └────────────────────────────┘    │
│   cowdi.net/i/AB12CD                 │
│                                      │
│   Lời nhắn (tuỳ chọn):               │
│   [Học cùng tao đi nha! ___________] │
│                                      │
│   [🚀 Gửi qua chat] [💾 Tải thiệp] │
│   [📋 Copy link]    [🔗 QR fullscreen]│
└──────────────────────────────────────┘
```

- QR code render ngay khi mở sheet (tạo `code` ngẫu nhiên 6 ký tự client-side, gửi backend tạo invite).
- Người ở cạnh có thể **quét trực tiếp** mà không cần đợi gửi gì.

### Chạm 2: Chọn kênh

- `🚀 Gửi qua chat` → `navigator.share()` → bật OS share sheet (Zalo, Messenger, SMS...).
- `💾 Tải thiệp` → download PNG 1080×1080 có QR.
- `📋 Copy link` → copy URL ngắn.
- `🔗 QR fullscreen` → phóng to QR full màn hình để bạn dễ quét.

---

## 4. Anatomy: Thiệp mời PNG 1080×1080

```
┌────────────────────────────────────┐
│ [Gradient theo element pet]        │
│                                    │
│   "Minh Hoàng tặng bạn"            │  ← Tên người gửi (có thể ẩn)
│                                    │
│         [🥚 Pet egg 400px]         │
│                                    │
│      "Một quả trứng Cowdi"         │
│                                    │
│   💬 "Học cùng tao đi nha!"        │  ← Lời nhắn nếu có
│                                    │
│   ┌─────────────┐                  │
│   │ ▓▓▓ QR ▓▓▓ │   cowdi.net/i/   │
│   │ ▓▓ ▓▓ ▓▓▓ │   AB12CD          │
│   └─────────────┘                  │
│                                    │
│   ⏰ Hết hạn sau 7 ngày            │
└────────────────────────────────────┘
```

QR ở **góc dưới**, đủ to (~280px) để quét từ camera khi xem trên màn hình điện thoại khác.

---

## 5. Flow phía người nhận

### Landing `/i/:code`

```
┌─────────────────────────────────┐
│  [Gradient + sao lấp lánh]      │
│                                 │
│  "Minh Hoàng tặng bạn..."       │
│                                 │
│      [🥚 Egg shake animate]     │
│                                 │
│  💬 "Học cùng tao đi nha!"      │
│                                 │
│  [👉 CHẠM ĐỂ NHẬN TRỨNG]       │
│                                 │
│  ⏰ Còn 6 ngày 23 giờ           │
└─────────────────────────────────┘
```

Chạm → animation crack 1.5s → hiện baby pet → đặt tên → login (Google) → pet vào tài khoản.

---

## 6. Phần thưởng (kích hoạt khi backend sẵn sàng)

| Mốc | Người gửi | Người nhận |
|---|---|---|
| Mở thiệp | – | Trứng trong tài khoản |
| Học bài đầu | 50 coins + notify | Trứng nở thành baby |
| Học 7 ngày liên tiếp | – | Skin đặc biệt |
| Mời thành công 3 người | Pet **Bondy** (event rarity, chỉ qua mời) | – |

---

## 7. Anti-spam

- Giới hạn **5 thiệp/ngày**, 20/tuần.
- Cùng IP/device trong 24h → không tính reward.
- Link đã có tài khoản → redirect HomePage + thông báo nhẹ.
- Thiệp hết hạn **7 ngày** không claim.

---

## 8. Cấu trúc kỹ thuật

### Frontend (mới)

| File | Nhiệm vụ |
|---|---|
| `src/features/invite/InviteSheet.jsx` | Bottom sheet/modal gửi thiệp |
| `src/features/invite/InviteCard.jsx` | Render canvas 1080×1080 + QR |
| `src/features/invite/QRCode.jsx` | Component QR (dùng lib `qrcode` hoặc tự vẽ canvas) |
| `src/features/invite/EggCrack.jsx` | Animation nở trứng (CSS @keyframes) |
| `src/pages/InvitePage.jsx` | Landing `/i/:code` |
| `src/hooks/useInvite.js` | API calls + state |

### Backend (mới)

| File | Nhiệm vụ |
|---|---|
| `server/routes/invites.js` | `POST /api/invites`, `GET /api/invites/:code`, `POST /api/invites/:code/claim` |
| `server/db/migrate-invites.sql` | Bảng `invites` |

### Schema DB

```sql
CREATE TABLE invites (
  code            VARCHAR(8) PRIMARY KEY,
  sender_id       INTEGER NOT NULL REFERENCES users(id),
  pet_species     VARCHAR(32) DEFAULT 'cowdi',
  message         VARCHAR(200),
  claimed_by      INTEGER REFERENCES users(id),
  claimed_at      TIMESTAMP,
  rewarded_sender BOOLEAN DEFAULT FALSE,
  rewarded_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at      TIMESTAMP NOT NULL
);
CREATE INDEX idx_invites_sender ON invites(sender_id);
CREATE INDEX idx_invites_claimed_by ON invites(claimed_by);
```

### Routes

| Method | Path | Mô tả |
|---|---|---|
| `POST` | `/api/invites` | Tạo thiệp mới, trả `{ code, url, expiresAt }` |
| `GET` | `/api/invites/:code` | Đọc thông tin thiệp (cho landing) |
| `POST` | `/api/invites/:code/claim` | Nhận thiệp (sau khi đăng nhập) |
| `GET` | `/api/invites/mine` | Lịch sử thiệp đã gửi |

### Route frontend

| Path | Component |
|---|---|
| `/i/:code` | `InvitePage` |

---

## 9. QR Code

- Thư viện: `qrcode` (npm) – nhỏ, render được vào canvas.
- Kích thước: 280×280 trong sheet, 320×320 trong PNG thiệp.
- Logo Cowdi nhỏ ở giữa (optional, dùng error correction level H).
- Nội dung: `https://cowdi.net/i/{CODE}`.

---

## 10. MVP — phạm vi triển khai lần này

✅ **Có trong MVP**:
- Nút "🎁 Mời bạn" trong Navbar
- InviteSheet với QR code + Web Share API + Copy link + Tải thiệp
- InviteCard PNG (canvas) với QR
- Landing page `/i/:code` với animation egg shake (CSS)
- Backend: tạo + đọc + claim invite
- DB migration

⏳ **Để sau (Sprint 2)**:
- Chọn pet để tặng (chỉ Cowdi trong MVP)
- Reward 2 chiều
- Pet Bondy
- Anti-spam rate limit chi tiết
- OG image động

---

## 11. UX rules

- ❌ Không tự bật sheet mời. User phải chủ động bấm.
- ❌ Không nag "share để được X". Sheet hiện đúng 1 lần khi bấm, không ép.
- ✅ Có thể đóng sheet bất kỳ lúc nào.
- ✅ QR luôn hiện sẵn — không cần thêm thao tác.
- ✅ Lời nhắn optional — bỏ trống vẫn gửi được.
