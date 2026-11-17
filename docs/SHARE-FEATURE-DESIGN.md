# 🎁 Thiết kế chức năng Share không làm phiền (Sprint 1)

> Ngày: 2026-05-14
> Trạng thái: **Design only — chưa code**
> Liên quan: [GROWTH-STRATEGY-2026-05.md](./GROWTH-STRATEGY-2026-05.md)

---

## 1. Triết lý thiết kế: "Quà tặng, không phải lời xin"

> ❌ Sai: "Hãy chia sẻ để giúp Cowdi phát triển!" (xin xỏ)
> ✅ Đúng: "Đây là **thẻ pet đẹp** bạn vừa tạo — tải về làm avatar hay khoe story nha 🐮" (tặng)

Người dùng phải cảm thấy **mình được nhận một thứ đẹp**, không phải đang giúp app làm marketing. Share là **hệ quả phụ tự nguyện**, không phải mục tiêu chính của UX.

### 4 nguyên tắc bất di bất dịch

1. **Không bao giờ chặn nội dung** (no gate, no paywall behind share).
2. **Không hỏi 2 lần cùng một thứ** — đã dismiss = im lặng tối thiểu 7 ngày.
3. **Tạo ra thứ đáng giữ kể cả khi không share** — ảnh đẹp, có thể tải về.
4. **Không có pop-up tự bật** trong lúc đang học (lesson, quiz đang chạy).

---

## 2. Tính năng đề xuất Sprint 1: **Pet Moment Card** 🐾

### 2.1. Định nghĩa "Moment"

Một **Moment** là khoảnh khắc đáng nhớ tự sinh ra trong quá trình chơi, gồm:

| Moment ID | Khi xảy ra | Tần suất ước tính |
|---|---|---|
| `evolution` | Pet tiến hóa lên stage 2/3/4 | Hiếm (vài lần/pet) |
| `perfect_quiz` | Đạt 10/10 quiz | Trung bình (1–3 lần/tuần) |
| `streak_milestone` | Streak 7 / 30 / 100 ngày | Hiếm |
| `new_pet` | Mở khóa pet mới | Hiếm (vài lần/tháng) |
| `duel_victory` | Thắng duel với điểm cao | Tùy người |
| `event_pet` | Nhận pet sự kiện (Pumpkin, Monk...) | Theo mùa |
| `boss_defeated` | Đánh bại boss mini-game | Hiếm |

Mỗi Moment tự sinh một **Card object** lưu trong `localStorage` + DB (để xem lại trong "Lịch sử khoảnh khắc").

### 2.2. Anatomy của một Pet Moment Card

Render bằng `<canvas>` thành ảnh 1080×1080 (vuông – chuẩn cho mọi mạng xã hội & story).

```
┌─────────────────────────────────────┐
│  [Nền gradient theo element pet]    │
│                                     │
│     🌟  Tiến hóa! 🌟                │  ← Loại moment + emoji
│                                     │
│         [Ảnh pet 400×400]           │  ← Webp từ pets.js
│                                     │
│        Monk · Thiền Sư              │  ← Tên + stage
│                                     │
│   👂 7  🗣️ 6  📖 8  ✍️ 7            │  ← 4 skill (bar mini)
│                                     │
│       🔥 Streak 14 ngày             │  ← Stat phụ (nếu có)
│                                     │
│   "Học tiếng Anh nuôi pet"          │  ← Tagline cố định
│        cowdi.net · @username        │  ← Watermark (nick ẩn được)
└─────────────────────────────────────┘
```

Tham số tùy biến:
- Người dùng có thể **tắt hiển thị username** (mặc định tắt — privacy first).
- Theme card theo `element` của pet (fire/water/cosmic...) đã có sẵn `ELEMENT_COLORS` trong `pets.js` — tái sử dụng.

### 2.3. UI Flow (3 layer, mỗi layer ít xâm nhập hơn)

#### Layer 1 — Inline (mặc định, không pop-up)

Sau khi moment xảy ra, ở góc phải dưới của trang hiện một **Toast Card mini** (dùng `Toast.jsx` đã có):

```
┌──────────────────────────────┐
│ 🎴 Khoảnh khắc mới đã lưu    │
│ "Monk tiến hóa Thiền Sư"     │
│ [Xem] [×]                    │
└──────────────────────────────┘
```

- Tự ẩn sau **6 giây** nếu không tương tác.
- Bấm `×` → ẩn vĩnh viễn cho moment đó.
- Bấm `[Xem]` → mở Layer 2.

**Không** chặn màn hình. **Không** âm thanh. **Không** rung.

#### Layer 2 — Modal "Khoảnh khắc của bạn"

Khi user chủ động bấm `[Xem]` (hoặc vào trang Moments):

```
┌─────────────────────────────────┐
│          🎴 Card preview         │
│         [Ảnh 1080×1080]          │
│                                  │
│  [💾 Tải về]  [🔗 Chia sẻ]      │
│  [✏️ Tùy chỉnh]                  │
│                                  │
│  ☐ Ẩn username trên ảnh         │
└─────────────────────────────────┘
```

- **Tải về** = mặc định ưu tiên. Đây là "quà tặng".
- **Chia sẻ** = chỉ là tùy chọn ngang hàng, không nổi bật hơn.
- Trên mobile: `[Chia sẻ]` gọi `navigator.share({ files: [pngBlob], text, url })` — chia sẻ **ảnh + link** trong 1 thao tác.
- Trên desktop: nếu không có Web Share API → fallback 4 nút: Tải về / Copy link / Facebook / Zalo.

#### Layer 3 — Trang Moments (trong `AccountPage` hoặc tab mới)

Toàn bộ moment lịch sử có thể xem lại bất kỳ lúc nào. Tránh áp lực "phải share ngay bây giờ".

### 2.4. Khi nào KHÔNG hiện gì cả

- Trong lúc đang ở `LessonDetailPage`, `PracticePage`, `MiniGamePage` (mid-session) → moment được **đẩy vào queue**, hiện sau khi user về `HomePage` hoặc kết thúc session.
- Khi user vừa dismiss 1 moment trong vòng **10 phút** → không hiện toast tiếp theo (tránh dồn dập).
- Đã hiện 3 toast moment trong ngày → moment thứ 4 trở đi chỉ lưu, không toast (xem ở trang Moments).
- Settings có toggle: **Tắt thông báo khoảnh khắc** (default ON).

### 2.5. Pre-fill text khi share

Text gửi kèm khi user bấm Share:

```
Mình vừa nuôi được Monk – Thiền Sư trên Cowdi 🪷
Học tiếng Anh kiểu nuôi pet, vui hơn nhiều!
👉 cowdi.net/?ref=ABC123
```

Tham số động: `{petName}`, `{stage}`, `{refCode}`.
Người dùng **được sửa text trước khi gửi** (không bị khoá).

---

## 3. Vì sao thiết kế này không gây khó chịu

| Lo ngại thường gặp | Cách giải quyết |
|---|---|
| "App spam tôi bắt share" | Toast mini, auto-hide, dismiss = im lặng |
| "Tôi không muốn lộ tên/avatar" | Default ẩn username, không hiện avatar |
| "Đang học bị ngắt" | Queue moment, chỉ hiện khi rảnh |
| "Share xong không có gì nhận" | Phần thưởng đến **gián tiếp** khi bạn mới học (Sprint 2), không phải đổi share lấy quà |
| "Ảnh xấu, ngại share" | Card render đẹp, có theme, có thể tải về kể cả không share |
| "Quá nhiều moment vô nghĩa" | Chỉ 7 loại moment chọn lọc, mỗi loại hiếm |

---

## 4. Metrics đo lường (success criteria)

Theo dõi qua `server/routes/api.js`:

| Metric | Mục tiêu Sprint 1 |
|---|---|
| % moment được xem (Layer 2 mở) | ≥ 30% |
| % moment được tải về | ≥ 15% |
| % moment được share | ≥ 5% |
| % user tắt thông báo moment | ≤ 8% (chỉ số khó chịu) |
| Số khiếu nại "app phiền" | 0 |

Nếu **tỷ lệ tắt > 8%** → giảm tần suất toast hoặc tăng threshold (vd. chỉ moment hiếm mới toast).

---

## 5. Phạm vi kỹ thuật (cho dev sau này tham khảo)

> ⚠️ Phần này **chưa implement** — chỉ liệt kê để estimate.

### Files mới đề xuất

- `src/features/share/MomentCard.jsx` — component render canvas.
- `src/features/share/MomentToast.jsx` — toast nhỏ góc phải dưới.
- `src/features/share/MomentModal.jsx` — modal Layer 2.
- `src/features/share/useMoments.js` — hook quản lý queue + dismiss state.
- `src/data/moments.js` — định nghĩa 7 loại moment, template, threshold.

### Files cần chỉnh sửa nhẹ

- `src/hooks/usePet.js` — emit event khi pet tiến hóa / mở khóa.
- `src/features/practice/PracticePage.jsx` — emit khi perfect quiz.
- `src/features/duel/` — emit khi thắng duel.
- `src/pages/AccountPage.jsx` — thêm tab "Khoảnh khắc".

### Phụ thuộc

- Web Share API (native, không cần lib).
- Canvas API (native).
- Không cần lib chia sẻ bên thứ 3.

### Ước lượng

- Card render + 2 moment đầu (evolution, perfect_quiz): **1.5 ngày**
- Mở rộng đủ 7 moment + Modal + History: **2 ngày**
- Polish + analytics: **0.5 ngày**

**Tổng**: ~4 ngày dev, có thể release từng moment một (incremental).

---

## 6. Câu hỏi mở (cần quyết định trước khi code)

1. Card 1080×1080 vuông, hay làm thêm bản 1080×1920 (story)?
2. Có cho phép user thêm **caption tự viết** lên card không, hay text chỉ ở phần share?
3. Watermark `cowdi.net` cố định, hay user trả coins để **gỡ watermark**? (Monetize nhẹ.)
4. Trang Moments để trong `AccountPage` tab hay tách route `/moments`?

---

**Quyết định triển khai gợi ý**:
- Bắt đầu với **1 moment duy nhất**: `evolution` (cảm xúc cao nhất, hiếm nhất).
- Đo phản hồi 1 tuần.
- Nếu metric tốt → mở rộng dần các moment còn lại.
