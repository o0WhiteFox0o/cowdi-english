# 🐮 Pet Interaction Redesign — Roadmap

> Mục tiêu: biến Pet từ "icon hiển thị" thành **người bạn đồng hành sống động** — gắn cảm xúc của người học với pet, tạo lý do quay lại app mỗi ngày.
>
> Tài liệu này **chỉ thiết kế**, chưa code. Mỗi phase đều liệt kê: ý tưởng, tương tác cụ thể, dữ liệu cần lưu, asset hình ảnh cần đặt vẽ, và độ ưu tiên.

---

## 1. Vấn đề hiện tại

| Khu vực | Trạng thái | Vấn đề |
|---|---|---|
| Trang Pet | Hiển thị tĩnh: 1 ảnh + tên + chỉ số + needs bars | Pet không "phản ứng" với hành vi người dùng |
| Trang bài học | Pet xuất hiện ở góc chat (CowdiChat) | Chỉ thoại random theo mood |
| Quiz / Mini-game | Không có Pet | Pet không "cổ vũ" hay phản ứng đúng/sai |
| Tiến hóa | Có animation Pokemon-style (vừa thêm) | Chỉ chạy 1 lần khi đủ XP — sau đó im lìm |
| Tương tác trực tiếp | Cho ăn XP, đổi tên, mặc đồ | Thiếu cảm giác "chăm sóc" thật sự |
| Phản hồi cảm xúc | Mood: happy / sad / sick | Quá thô — chỉ 3 trạng thái |
| Social | Tặng trứng cho bạn (vừa làm) | Không có tương tác giữa các pet |

---

## 2. Nguyên tắc thiết kế

1. **Sinh động không nhàm** — animation luôn ngắn (< 2s), không cản dòng học
2. **Pet là cái cớ, học là mục tiêu** — mọi tương tác phải dẫn đến hành động học tiếp theo
3. **Có cảm xúc, có trí nhớ** — pet nhớ những gì người dùng làm (perfect quiz, miss streak, đổi pet…)
4. **Cá nhân hóa** — pet "biết" tên người dùng, tên pet, khung giờ học, môn yếu
5. **Tiết kiệm asset** — ưu tiên dùng lại 5 stage + layer overlay (mắt/miệng/hiệu ứng) thay vì vẽ lại toàn bộ
6. **Có thể tắt** — người không thích phiền có nút tắt sound/voice/popup

---

## 3. Lộ trình (4 phase)

```
Phase 1: Cảm xúc & phản ứng tức thì       (1–2 tuần)  ⭐⭐⭐ Cao
Phase 2: Hoạt cảnh trong giờ học          (2–3 tuần)  ⭐⭐⭐ Cao
Phase 3: Trí nhớ & câu thoại thông minh   (2 tuần)    ⭐⭐  Trung
Phase 4: Tương tác xã hội giữa các pet    (3 tuần)    ⭐⭐  Trung-Cao
```

---

## 4. Phase 1 — Cảm xúc & phản ứng tức thì

### 4.1. Mở rộng mood 3 → 8 trạng thái

| Mood | Trigger | Hiệu ứng hình | Câu thoại |
|---|---|---|---|
| `excited` | Vừa lên cấp / perfect quiz | Nhảy lên + sparkle | "Wowww! Đỉnh quá!" |
| `happy` | Bình thường, needs >70 | Đu đưa nhẹ | (random pool hiện tại) |
| `proud` | Tiến hóa xong | Đứng thẳng, hào quang | "Mạnh hơn rồi đó!" |
| `focused` | Đang học/quiz | Ngồi yên, mắt sáng | "Tập trung nào…" |
| `tired` | Online lâu > 30p liên tục | Ngáp, dụi mắt | "Nghỉ chút đi bạn ơi" |
| `sad` | Miss streak / sai liên tiếp | Ủ rũ, đầu cúi | "Đừng nản, làm lại nha 🥺" |
| `sick` | Needs < 30 quá lâu | Sốt, run rẩy | "Tớ không khoẻ…" |
| `sleepy` | Sau 23h | Mắt nhắm hờ | "Khuya rồi, học nốt rồi đi ngủ nhé 🌙" |

**Asset cần:** mỗi pet × mỗi stage → thêm **3 overlay PNG nhỏ (~80×80px, transparent)**:
- `_eyes_normal.png` / `_eyes_sleepy.png` / `_eyes_excited.png`
- `_mouth_normal.png` / `_mouth_smile.png` / `_mouth_sad.png`
- `_accent_zZz.png` / `_accent_sparkle.png` / `_accent_heart.png`

→ Ghép lên ảnh gốc bằng CSS layer thay vì vẽ lại toàn pet. **Tiết kiệm 80% công vẽ.**

### 4.2. Micro-animation phản hồi

Mỗi pet luôn có 1 trong 4 loop nhẹ chạy ngầm:
- **Idle Breath** — phình to/nhỏ 2% mỗi 2.5s
- **Idle Bob** — nhún nhẹ ±4px mỗi 1.8s
- **Idle Blink** — chớp mắt (overlay eyes) random 3–6s
- **Idle Tail/Ear Twitch** — tuỳ pet (ví dụ Foxie vẫy tai)

→ Thực hiện bằng CSS keyframes, **0 thêm asset** nếu chỉ dùng transform.

### 4.3. Phản ứng tức thì (event-based reactions)

| Sự kiện | Phản ứng pet (≤ 1.5s) | Sound |
|---|---|---|
| Trả lời đúng quiz | Nhảy 1 cái + ⭐ sparkle | "ting" ngắn |
| Trả lời sai | Lắc đầu nhẹ + "?" pop | "blip" |
| Perfect quiz | Pet xoay 360° + confetti mini | "yay" |
| Lên cấp | Hào quang vàng 1s | "level-up" |
| Vào trang lần đầu mỗi ngày | Pet vẫy tay + "Chào lại nha!" | "hello" |
| Streak +1 | Pet đeo dải băng 🔥 trên đầu 5s | "fire" |
| Miss streak | Pet ngồi cúi đầu 3s | "sad" |
| Nhận quà từ bạn | Pet ôm hộp quà | "gift" |

→ Component dùng chung: `<PetReaction trigger="correct" />` → tự mount → tự unmount sau animation.

### 4.4. Pet companion bar (sticky)

Một thanh nhỏ luôn xuất hiện ở **góc dưới bên phải** khi đang học/quiz:
- Ảnh pet thu nhỏ 60×60
- Speech bubble bên trái pet
- Bấm vào → mở chat đầy đủ (CowdiChat hiện tại)

```
┌─────────────────────────┐
│ Cố lên! Sai 1 thôi mà ✨ │ ← speech bubble (2s rồi mờ)
└─────────────────────────┘
                    🐮     ← pet 60×60 (clickable)
```

---

## 5. Phase 2 — Hoạt cảnh trong giờ học

### 5.1. Pet "live" trong LessonDetailPage / QuizPage

Thay vì chỉ có ở góc chat, pet **xuất hiện cạnh khu vực câu hỏi**:
- Pet "nhìn" về phía text khi bạn đọc
- Pet "gật đầu" khi bạn chọn đáp án
- Pet "khoanh tay chờ" khi bạn dừng lâu
- Sau 5 câu liên tục đúng → pet làm gesture "high-five"

### 5.2. Quest đối thoại (Daily Dialogue)

Mỗi ngày pet "yêu cầu" 1 thứ:
- "Hôm nay tớ muốn nghe bạn đọc 5 từ mới" → unlock food
- "Cho tớ học bài Listening đi, lâu rồi tớ không tập nghe…"
- "Hôm nay tớ buồn vì hôm qua bạn không qua… học bù giúp tớ nha 🥺"

Đáp ứng → pet "vui" cả ngày, được +XP bonus.

### 5.3. Phòng pet (Pet Room) — màn hình toàn cảnh

Hiện tại trong PetPage pet đứng giữa khung trắng. Đề xuất:
- Background thay đổi theo **room đã mua** (đã có data, chưa hiển thị nền)
- Thêm furniture nhỏ: chén ăn, đệm ngủ, kệ sách, ảnh chủ
- Pet đi qua đi lại trong khung (CSS `translateX` random keyframes)

**Asset cần:** mỗi room → 1 ảnh nền 1024×768 + 3–5 furniture PNG.

### 5.4. Lịch sinh hoạt (Pet Schedule)

Pet có thời gian biểu:
| Giờ | Hoạt động | Hiển thị |
|---|---|---|
| 6:00–9:00 | Buổi sáng tươi tỉnh | Pet vươn vai |
| 9:00–11:30 | Học cùng bạn | Bình thường + động viên |
| 12:00–13:30 | Ăn trưa | Pet cầm chén / ngủ trưa |
| 13:30–17:00 | Học buổi chiều | Bình thường |
| 17:00–19:00 | Chiều tà — cảm xúc | Pet ngắm hoàng hôn |
| 19:00–22:00 | Học cùng bạn (prime time) | Bình thường + chủ động bắt chuyện |
| 22:00–23:30 | Sắp ngủ | "Khuya rồi đó, học 1 bài nữa rồi đi ngủ nha" |
| 23:30–6:00 | Đang ngủ | Pet nằm + 💤 — chỉ hiện thoại "Ssssh tớ đang ngủ" |

---

## 6. Phase 3 — Trí nhớ & câu thoại thông minh

### 6.1. Pet Memory Bank (lưu trong localStorage / DB)

```js
petMemory = {
  lastSawUser: ISO date,            // ngày cuối tương tác
  daysAway: int,                    // số ngày chủ vắng
  recentMood: 'sad' | 'happy' | ...,
  weakSkill: 'listening',           // môn yếu nhất → pet nhắc
  strongSkill: 'reading',
  favoriteFood: 'food_apple',       // food được cho ăn nhiều nhất
  favoriteLesson: 'L12',
  totalHugs: int,                   // số lần bấm vào pet
  bestStreak: int,
  lastEvolveAt: ISO date,
  petBirthday: ISO date,            // ngày unlock
}
```

### 6.2. Câu thoại thông minh dựa trên Memory

| Trigger memory | Câu thoại |
|---|---|
| `daysAway >= 3` | "Bạn đi đâu mà lâu vậy 🥺 tớ nhớ bạn quá!" |
| `daysAway >= 7` | "Tớ tưởng bạn quên tớ luôn rồi… nhưng tớ vẫn chờ 💛" |
| `weakSkill = listening` | "Listening hôm nay nha? Tớ muốn tập nghe cùng bạn 👂" |
| `bestStreak vừa bị phá` | "Streak 12 ngày bị mất rồi 😢 nhưng đừng nản, làm lại nha!" |
| `petBirthday hôm nay` | "Hôm nay là sinh nhật tớ đó! 🎂 +50 coins quà nè!" |
| `Cùng giờ học mọi ngày sắp tới` | "Tớ chờ bạn 5 phút nữa nha — giờ học quen rồi đó ⏰" |
| `lastEvolveAt > 14 ngày` | "Lâu rồi tớ không tiến hóa… cho tớ ăn XP với 🥺" |

→ Mỗi pet có **5–10 template thoại** cho mỗi trigger để không lặp.

### 6.3. Pet Diary — Nhật ký cùng pet

Cuối mỗi tuần, pet "viết" tóm tắt:
```
📔 Tuần của Cowdi #14

📅 06–12/05/2026
⭐ XP học được: 850
🔥 Streak: 7 ngày (kỷ lục mới!)
💬 Câu chuyện của tớ:
   "Tuần này bạn chăm thật đấy! Hôm thứ 3 quên đến nhưng
   thứ 4 đã bù 2 bài. Tớ tiến hóa lên Junior nhờ bạn 🎉"
🎯 Tuần sau cùng nhau: hoàn thành 3 bài Listening
```

→ Lưu vào tab **Lịch sử** trong PetPage, có thể share thành ảnh.

---

## 7. Phase 4 — Tương tác xã hội giữa các pet

### 7.1. Pet visits — Pet bạn bè ghé thăm

Khi 2 user là bạn nhau (đã invite/duel):
- 1 lần/ngày, pet bạn "ghé" PetPage của mình
- "👋 Foxie của Nam vừa đi qua! Nó để lại 1 món quà 🎁"
- Nhận → +10 coins hoặc 1 food random

### 7.2. Pet Photo / Selfie cùng pet

- Trên PetPage có nút **📷 Chụp ảnh cùng pet**
- Render canvas 1080×1080:
  - Pet ở giữa
  - Avatar user góc trên
  - Khung viền + caption "Tớ và [tên pet] đã học [tổng XP] cùng nhau"
  - Watermark cowdi.net
- Share thẳng → tự nhiên hơn thiệp invite

### 7.3. Pet Duel cosmetics

Khi duel:
- Pet 2 bên đứng đối đầu trên màn hình quiz
- Mỗi câu đúng → pet mình "đánh" 1 đòn (hoạt ảnh tia sáng)
- Mỗi câu sai → pet mình bị "vấp"
- Thắng → pet đeo huy chương 🥇

### 7.4. Pet Forum mini (nhẹ)

Trong AccountPage / Leaderboard:
- 1 cột "Câu nói của pet hôm nay" — random 5–10 pet người dùng khác đang post
- Click → vào profile public của user đó (xem pet, không gửi tin nhắn — tránh moderation)

---

## 8. Asset Plan — Hình cần đặt vẽ

> Bạn đã mua AI tạo ảnh → đây là spec để feed prompt.

### 8.1. Overlay layers (cho mọi pet × stage 1–4)
| File | Kích thước | Mô tả prompt |
|---|---|---|
| `<pet>_eyes_blink.webp` | 80×80 transparent | mắt nhắm dạng "_ _", cùng style chibi |
| `<pet>_eyes_excited.webp` | 80×80 | mắt to hình sao ✨ |
| `<pet>_eyes_sleepy.webp` | 80×80 | mí mắt nửa khép |
| `<pet>_zZz.webp` | 60×60 | chữ Z chồng nhau lơ lửng |
| `<pet>_sparkle.webp` | 60×60 | cụm ✨ vàng |
| `<pet>_heart.webp` | 40×40 | trái tim hồng nhỏ |
| `<pet>_sweat.webp` | 30×60 | giọt mồ hôi xanh dương |
| `<pet>_question.webp` | 50×50 | dấu "?" vàng cong vẽ tay |

→ **Tổng: 8 overlay × dùng chung cho tất cả pet** = chỉ ~8 file (không nhân với pet vì overlay là chung).

### 8.2. Pose phụ (chỉ cần cho TOP 5 pet phổ biến để giảm chi phí)

`cowdi`, `foxie`, `monk`, `prisma`, `pumpkin` × 4 pose:
- `_pose_wave.webp` (vẫy tay chào)
- `_pose_sleep.webp` (nằm ngủ)
- `_pose_jump.webp` (nhảy ăn mừng)
- `_pose_sad.webp` (cúi đầu buồn)

→ 5 pet × 4 pose × 5 stage = **100 ảnh** — nhiều, nên ưu tiên **stage 3 (super) là stage user nhìn nhiều nhất**, giảm còn 20 ảnh.

### 8.3. Room backgrounds (5 rooms × 1 ảnh nền)

- `room_library_bg.webp` 1024×768
- `room_beach_bg.webp`
- `room_space_bg.webp`
- `room_forest_bg.webp`
- `room_castle_bg.webp`

### 8.4. Furniture decorations (PNG transparent ~200px)
- `furn_bowl.webp` (chén ăn)
- `furn_bed.webp` (đệm ngủ)
- `furn_books.webp` (chồng sách)
- `furn_trophy.webp` (cúp)
- `furn_photo.webp` (khung ảnh chủ)

### 8.5. Effect frames (cho reaction animation)
- `fx_confetti.webp` (3 frame loop)
- `fx_levelup_aura.webp`
- `fx_fire_streak.webp`
- `fx_gift_box.webp`

---

## 9. Data schema mới (chỉ liệt kê, chưa migrate)

### 9.1. Bảng `pet_memory` (mới)
```sql
CREATE TABLE pet_memory (
  user_id INT,
  pet_instance_id VARCHAR(64),
  last_seen_at DATETIME,
  total_hugs INT DEFAULT 0,
  favorite_food VARCHAR(32),
  weak_skill VARCHAR(16),
  strong_skill VARCHAR(16),
  best_streak INT DEFAULT 0,
  pet_birthday DATE,
  diary_entries JSON,  -- array of weekly entries
  PRIMARY KEY (user_id, pet_instance_id)
);
```

### 9.2. Bảng `pet_visits` (mới)
```sql
CREATE TABLE pet_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_user_id INT,
  to_user_id INT,
  gift_type VARCHAR(32),  -- 'coins' | 'food'
  gift_value INT,
  claimed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 9.3. Field thêm cho mỗi pet instance trong JSON
```js
{
  // ...existing fields
  currentMood: 'happy',           // computed mỗi 5 phút
  lastReactionAt: ISO date,
  schedule: { wakeAt: '06:00', sleepAt: '23:30' },  // user có thể tuỳ chỉnh
}
```

---

## 10. UX Guidelines

1. **Animation budget** — tổng mọi animation trên 1 màn hình ≤ 3 cái cùng lúc
2. **Không cản học** — pet reaction luôn ở góc, không che vùng câu hỏi
3. **Tắt được** — Settings → "Pet effects" có 3 mức: Full / Quiet / Off
4. **Loading first** — chưa load xong asset thì hiển thị emoji fallback (đã có)
5. **A11y** — `aria-live="polite"` cho speech bubble, không tự động phát âm
6. **Performance** — overlay PNG dùng `loading="lazy"`, room background dùng CSS `background-image` (cache tốt hơn)

---

## 11. Metric đo lường thành công

| Metric | Hiện tại | Mục tiêu sau 4 phase |
|---|---|---|
| Avg session duration | ~6 phút | +40% → 8.5 phút |
| D1 retention | ~25% | +30% → 32% |
| D7 retention | ~12% | +50% → 18% |
| Pet feed XP/tuần/user | ~200 | +100% → 400 |
| Share invite created/user/tháng | 0.15 | +200% → 0.5 |
| User bấm vào pet > 5 lần/session | 18% | 50% |

---

## 12. Thứ tự triển khai đề xuất

```
Tuần 1     ▶  Phase 1.1 (mood overlay) + 1.2 (idle anim)        ⚡ Quick win
Tuần 2     ▶  Phase 1.3 (reaction system) + 1.4 (companion bar)
Tuần 3–4   ▶  Phase 2.1 (pet trong lesson) + 2.2 (daily dialogue)
Tuần 5     ▶  Phase 2.3 (room background)
Tuần 6–7   ▶  Phase 3 (memory + diary)
Tuần 8–10  ▶  Phase 4 (visits + photo + duel cosmetics)
```

**Quick win đầu tiên (3 ngày):** chỉ Phase 1.1 + 1.2 — đã đủ làm pet "sống" rõ rệt, gần như 0 backend changes.

---

## 13. Câu hỏi cần quyết trước khi code

1. **Asset budget** — AI tạo ảnh có giới hạn không? Số file tối đa?
2. **Room background priority** — làm 5 room ngay hay chỉ 1–2?
3. **Pet schedule** — có cho user tuỳ chỉnh hay theo VN timezone cứng?
4. **Pet visits** — bật ngay hay sau khi có > 100 user thật?
5. **Voice** — có thêm voice clip ngắn (1–2s) cho mỗi pet không?

---

*— Cowdi English · Pet Interaction Redesign v1 · May 2026*
