# 🎣 Chiến thuật "dụ" người dùng share — Cowdi

> Ngày: 2026-05-14
> Mục tiêu: tăng share organic mà KHÔNG xin xỏ, KHÔNG khó chịu
> Phụ thuộc: tính năng [InviteSheet](src/features/invite/InviteSheet.jsx) đã hoàn thành

---

## Triết lý

**Đặt nút Share đúng lúc cảm xúc cao + tạo lý do tự nhiên để cần bạn → user tự bấm.**

Không bao giờ ép. Không bao giờ chặn nội dung. Mọi share đều là "khoe quà mình vừa nhận", không phải "giúp app làm marketing".

---

## 1. Bản đồ "cảm xúc cao" — chỗ NÊN gợi mời

| Khoảnh khắc | Vị trí code | Câu thoại |
|---|---|---|
| 🥚→🐮 **Pet tiến hóa** stage 3/4 | `usePet.js` evolution event | *"Wow! Cowdi vừa tiến hóa! Khoe với bạn bè?"* |
| 💯 **Perfect Quiz** 10/10 | `PracticePage.jsx` finish | *"Hoàn hảo! Thách bạn xem có làm được không 🎯"* |
| 🔥 **Streak** 7/30/100 | `useUser.js` | *"7 ngày liên tiếp! Rủ bạn cùng giữ streak?"* |
| 🎉 **Mở khóa pet mới** | `unlockPet` callback | *"Bạn vừa có thêm Foxie! Tặng bạn 1 quả trứng nha?"* |
| ⚔️ **Thắng Duel** | `DuelPage.jsx` finish | *"Chiến thắng! Mời thêm đối thủ?"* |
| 🪷 **Pet sự kiện** (Monk/Pumpkin) | event check | *"Hiếm có! 1 năm chỉ 3 ngày — rủ bạn nhận cùng?"* |
| 😢 **Pet "buồn"** sau 1 ngày offline | `getPetMood` | *"Cowdi nhớ bạn... có bạn cùng chơi pet sẽ vui hơn"* |

> **Quy tắc vàng**: chỉ 1 trong 7 cái này tối đa **1 lần/ngày**. Dismiss = im lặng 7 ngày cho moment đó.

---

## 2. Tạo "lý do bắt buộc cần bạn"

Đây là **đòn mạnh nhất** — user tự thấy cần mời, không phải app năn nỉ.

### 2.1. Duel theo link mời
- `cowdi.net/d/XYZ123` — phòng đấu cá nhân.
- Tâm lý: *"Tao muốn đấu với mày"* mạnh hơn *"Tao muốn rủ mày học"*.

### 2.2. Pet "Bondy" độc quyền qua mời
```js
unlockCondition: { type: 'invite_friends', value: 3 }
```
- Không mua được bằng coin, không tự đạt được.
- FOMO thật: *"Pet này phải có bạn mới có"*.

### 2.3. Lễ hội theo cặp
- **Pet Valentine** — 2 user phải claim cùng để nở.
- **Pet Trung Thu** — quà tặng gia đình.
- Tâm lý: *"Nhận một mình không nở"*.

---

## 3. Hệ thống thưởng 2 chiều VISIBLE

### 3.1. UI "Tiến độ mời" trong AccountPage
```
🎁 Mời bạn — Phần thưởng đang chờ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 1/3 bạn đã học → 50 coins ✅
👥 1/3 bạn → 🎁 Pet Bondy 🔒
👥 0/5 bạn → 💎 Skin Legendary 🔒

[ 🎁 Mời thêm bạn ]
```

### 3.2. Push notification khi bạn mới học
> 🎉 **Minh Hoàng** vừa học bài đầu tiên! Bạn nhận +50 coins.

Cảm giác *"đầu tư có lời"* → muốn mời tiếp.

### 3.3. Pet "Friendship Bond"
- Pet bạn xuất hiện trong PetPage của họ ở góc *"Bạn của Cowdi"*.
- Tặng nhau 1 quả táo XP mỗi ngày.
- Bond dài → unlock skin/animation.

---

## 4. "Easy share" — ma sát = 0

### 4.1. Quick share button TẠI moment, không phải Navbar
```
┌──────────────────────────────┐
│   🎉 Perfect Quiz!           │
│   10/10 từ vựng              │
│                              │
│   [🎁 Thách bạn làm thử]    │  ← Share = thách thức
│   [💾 Lưu thành tích]        │
└──────────────────────────────┘
```

### 4.2. Caption prefill cá nhân hoá theo moment

| Moment | Prefill text |
|---|---|
| Evolution | *"Cowdi của mình vừa tiến hóa Legendary! Bạn nuôi pet đến level nào rồi?"* |
| Perfect Quiz | *"Mình vừa 10/10 quiz [topic]! Mày thử xem 👇"* |
| Streak 30 | *"30 ngày liên tiếp học rồi 🔥 Cùng giữ streak với mình?"* |
| Event pet | *"Vừa nhận pet Monk 🪷 — pet này 1 năm chỉ có 3 ngày!"* |

---

## 5. Social proof — không có cũng tự share

### 5.1. Bảng "Bạn của tôi" trong PetPage
```
👥 Pet bạn bè (3)
[Avatar1] Foxie Lv.12 🔥
[Avatar2] Pingu Lv.8 ❄️
[Avatar3] Leo Lv.20 ⚡  ← inspire "ủa nó hơn mình rồi!"
```

### 5.2. Toast khi bạn của mình có thành tích
> ✨ Foxie của Minh vừa tiến hóa Legendary!

→ *"Tao cũng phải chăm pet hơn"* + *"Bạn này active"*.

---

## 6. Cảnh báo (đừng làm)

| ❌ Tránh | ✅ Thay bằng |
|---|---|
| Pop-up share giữa lesson | Toast nhẹ sau khi xong |
| Khóa bài học sau X ngày | Chỉ khóa pet/skin cosmetic |
| Nag mỗi lần mở app | Dismiss = 7 ngày silence |
| Thưởng coin cao bất thường | Pet độc quyền + reward vừa phải |
| Bắt share kênh cụ thể | Mọi kênh OK, thưởng theo người mới HỌC |

---

## 7. Thứ tự triển khai

### Tuần 1 — Quick wins
1. **Share button sau pet tiến hóa** + hoạt ảnh tiến hóa kiểu Pokemon ⭐ (ĐANG LÀM)
2. **Nút "🎁 Thách bạn"** trong card Perfect Quiz
3. **Caption prefill** theo moment

### Tuần 2 — Phần thưởng visible
4. UI **"Tiến độ mời"** trong AccountPage
5. Logic reward 2 chiều khi `claimed_by` hoàn thành bài đầu
6. Push notification "bạn mới đã học"

### Tuần 3 — Multiplayer
7. **Duel theo link mời** — `/d/:roomCode`
8. **Pet Bondy** — unlock điều kiện mời 3 người

### Tuần 4 — Bond dài hạn
9. **Bạn của tôi** trong PetPage

---

## 8. Metrics

```
sheet_open    → created    ≥ 80%
created       → shared     ≥ 60%
shared        → claimed    ≥ 15%
claimed       → activated  ≥ 40%
```

Chỗ nào tụt → tối ưu chỗ đó.

K-factor target: **0.3** giai đoạn 1, **0.5** mới có growth hữu cơ.

---

## 9. Pokemon-style Evolution Animation (Sprint hiện tại)

### Flow

```
[Đạt XP đủ]
   ↓
Pet hiện badge "Sẵn sàng tiến hóa!" trên PetPage
   ↓
User bấm nút [⚡ Tiến hóa]
   ↓
┌────────────────────────────────────┐
│ Modal toàn màn hình, nền tối       │
│                                    │
│  [Pet cũ silhouette → trắng → mới] │
│                                    │
│  Hiệu ứng:                         │
│  - Pet nhấp nháy trắng/đen         │
│  - Phóng to dần                    │
│  - Light rays xoay tròn            │
│  - Sparkles + sound (optional)     │
│  - Tổng thời gian: ~3.5s           │
└────────────────────────────────────┘
   ↓
[Pet mới hiện rõ + tên "Tiến hóa: Super Cowdi!"]
   ↓
┌────────────────────────────────────┐
│  🎉 Tên Pet vừa tiến hóa!          │
│  [Ảnh pet mới full HD]             │
│                                    │
│  [🎁 Khoe & mời bạn] [Đóng]        │
└────────────────────────────────────┘
   ↓
Nếu bấm Khoe → mở InviteSheet với pet này
```

### Yêu cầu kỹ thuật

- Component `EvolutionAnimation.jsx` toàn màn hình, z-index cao.
- CSS keyframes: `flashWhite`, `scaleUp`, `lightRays`, `sparkleFloat`.
- Logic: bấm "Tiến hóa" → set `evolving=true` → animation chạy → set `evolved=true` → hiện pet mới + nút share.
- Có thể bỏ qua animation (nút "Skip") để không gây khó chịu.

### Integration

- Sửa `usePet.js` để **không tự tiến hóa**. Khi đủ XP, set flag `readyToEvolve=true`.
- `PetPage.jsx` đọc flag → hiện nút "⚡ Tiến hóa" thay vì tự đổi stage.
- Bấm nút → mount `EvolutionAnimation` → callback khi xong → thực sự gọi `evolvePet()` → hiện modal kết quả.

---

**Đề xuất bắt đầu ngay**: Hoạt ảnh tiến hóa Pokemon-style + share button — đòn rẻ nhất, mạnh nhất, ra ngay tuần này.
