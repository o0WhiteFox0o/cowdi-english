# Báo Cáo Cơ Chế Tính Điểm — Cowdi English

> Ngày: 23/04/2026  
> Phiên bản phân tích: hiện tại (dist-prod tháng 4/2026)

---

## 1. Tổng Quan Hệ Thống Điểm

Dự án có **4 loại điểm/giá trị** hoạt động song song:

| Loại | Ký hiệu | Mục đích |
|---|---|---|
| Experience Points | `totalXP` | Cấp độ người chơi |
| Skill XP | `skillXP` | Phân loại kỹ năng (4 kỹ năng) |
| Coins | `coins` | Tiền tệ mua vật phẩm |
| League Points | `leaguePoints` | Xếp hạng đấu |

---

## 2. Chi Tiết Cơ Chế Tính XP Người Chơi

### 2.1 XP Từ Luyện Tập (`PracticePage`)

| Loại bài | XP mỗi câu đúng | Bonus hoàn hảo |
|---|---|---|
| MCQ, dictation, listenPick, listenSentence, speedRound, contextClue, wordGuess, trueFalse | `correct × 10` | `+20` |
| True/False | `correct × 8` | `+20` |
| Reorder, Word Build | `correct × 12` | `+25` |
| Translate Write | `correct × 15` | `+30` |
| Speaking (speakWord, speakSentence, readAloud, speakFast) | `correct × 10` | `+20` |
| Matching | `pairs × 3` | không có |

### 2.2 XP Từ Bài Học (`LessonDetailPage`)

```
XP = score × 10
```
- `markLessonCompleted(lessonId)` được gọi
- `incrementQuizzes(isPerfect)` được gọi
- `addCoins(10)` được gọi
- Ngưỡng đánh giá: ≥ 80% → "Excellent", ≥ 50% → "Good", < 50% → "Try harder"

### 2.3 XP Từ Đấu (`DuelPage`)

| Tình huống | XP |
|---|---|
| Tạo thách đấu | `score × 5` |
| Tham gia (Win/Draw/Loss) | `own_score × 5` |

---

## 3. Skill XP — Phân Loại Kỹ Năng

### Bảng ánh xạ quiz → kỹ năng

| Kỹ năng | Các loại quiz |
|---|---|
| `speaking` | vocab, matching, speedRound, wordGuess, speakWord, speakSentence, readAloud, speakFast |
| `reading` | grammar, fillin, trueFalse, contextClue |
| `listening` | listening, dictation, listenPick, listenSentence |
| `writing` | sentences, reorder, wordBuild, translateWrite |
| `mixed` | XP chia đều 4 kỹ năng (`÷ 4`, tối thiểu 1) |

> **Vấn đề**: Quiz loại `vocab` và `matching` được map vào `speaking` nhưng thực tế chúng không luyện kỹ năng nói.

---

## 4. Hệ Thống Cấp Độ Người Chơi

| Level | Danh hiệu | XP Cần |
|---|---|---|
| 1 | Người mới bắt đầu | 0 |
| 2 | Học viên chăm chỉ | 100 |
| 3 | Người đam mê | 250 |
| 4 | Nhà khám phá | 500 |
| 5 | Chiến binh từ vựng | 800 |
| 6 | Cao thủ ngữ pháp | 1,200 |
| 7 | Bậc thầy tiếng Anh | 1,800 |
| 8 | Huyền thoại Cowdi | 2,500 |

**Khoảng cách XP giữa các cấp**: 100 → 150 → 250 → 300 → 400 → 600 → 700  
> **Vấn đề**: Không có cấp độ sau 8, người chơi đạt 2,500 XP sẽ không còn mục tiêu level nữa.

---

## 5. Hệ Thống Streak & Hoạt Động Hàng Ngày

- Streak tính theo ngày liên tiếp (so sánh `Date.toDateString()`)
- `activeDays[]` lưu chuỗi ngày tham gia
- Daily tasks reset khi ngày mới (`dailyDate !== today`)
- Mất streak nếu bỏ 1 ngày bất kỳ (không có cơ chế "streak freeze")

---

## 6. Hệ Thống Pet

### 6.1 Pet XP & Tiến Hóa

| Stage | Tên | XP Cần |
|---|---|---|
| 0 | Egg | 0 |
| 1 | Baby | 100 |
| 2 | Junior | 500 |
| 3 | Super | 1,200 |
| 4 | Legendary | 2,500 |

```
petXP += correct × 10 (+ 20 if perfect)
```

### 6.2 Pet Needs (0–100, hao 2/giờ hoặc 1/giờ)

| Hành động | Tác động |
|---|---|
| Quiz hoàn thành | `+20 happiness` (hoặc `+40` nếu perfect) |
| Lesson hoàn thành | `+30 energy` |
| Vocab review | `+25 knowledge` |

### 6.3 Pet Power Score

```
powerScore = floor((listening + speaking + reading + writing) × EVOLUTION_MULTIPLIER × RARITY_BONUS)
```

- Evolution Multiplier: [0.5, 0.8, 1.0, 1.3, 1.5]
- Rarity Bonus: common=1.0, rare=1.1, epic=1.2, legendary=1.3, event=1.1

---

## 7. Hệ Thống Đấu (Duel)

### 7.1 Tính điểm kết quả

| Kết quả | League Points (LP) | Coins |
|---|---|---|
| Win | `+30 LP`, `duel_streak +1` | +50 |
| Draw | `+15 LP` | +25 |
| Loss | `+5 LP`, `duel_streak = 0` | +10 |
| Tạo duel | `+5 LP` | +10 |

### 7.2 League Tiers

| League | LP Cần |
|---|---|
| Bronze 🥉 | 0 |
| Silver 🥈 | 100 |
| Gold 🥇 | 300 |
| Diamond 💎 | 600 |
| Master 👑 | 1,000 |

### 7.3 Critical Hit
- Trả lời **đúng trong < 3 giây** → Critical hit → đối thủ mất **15 HP** thay vì 10

---

## 8. Thành Tích (Achievements)

| ID | Điều kiện | Ghi chú |
|---|---|---|
| `first_lesson` | Hoàn thành 1 bài học | — |
| `five_lessons` | Hoàn thành 5 bài học | — |
| `first_quiz` | Hoàn thành 1 quiz | — |
| `perfect_quiz` | 1 lần perfect quiz | — |
| `word_master_10` | 10 từ học | — |
| `word_master_50` | 50 từ học | — |
| `streak_3` | Streak 3 ngày | — |
| `streak_7` | Streak 7 ngày | — |
| `xp_100` | 100 XP | — |
| `xp_500` | 500 XP | — |

---

## 9. Xếp Hạng (Leaderboard)

| Bảng | Tiêu chí | Hiển thị |
|---|---|---|
| Pet Power | Power Score cao nhất của 1 pet | Top 50 |
| Pet Collection | Số pet sở hữu | Top 50 |
| Pet Skill | Raw skill điểm cao nhất | Top 50 |
| Duel Ranking | `league_points` DESC | Top 50 |
| Student Ranking | Chọn 1 trong 6 tiêu chí | Top 50 |

---

---

# ĐỀ XUẤT CẢI TIẾN

## 🔴 Ưu Tiên Cao

### P1. Sửa Ánh Xạ Kỹ Năng Sai — `vocab` và `matching` → `vocabulary` thay vì `speaking`

**Vấn đề hiện tại:**
```js
// src/data/config/achievements.js hoặc useUser.jsx
const QUIZ_TO_SKILL = {
  vocab: 'speaking',     // ❌ Sai — vocab không phải speaking
  matching: 'speaking',  // ❌ Sai
  ...
}
```

**Đề xuất:** Tạo kỹ năng thứ 5 `vocabulary` hoặc map `vocab`/`matching` vào `reading`.

```js
const QUIZ_TO_SKILL = {
  vocab: 'reading',      // ✅ Từ vựng gần với đọc hiểu hơn
  matching: 'reading',   // ✅
  ...
}
```

---

### P2. Bổ Sung Cấp Độ Sau Level 8 (Prestige / Endless)

**Vấn đề:** Người chơi đạt 2,500 XP không còn tiến trình level. Mất động lực.

**Đề xuất A — Thêm cấp 9–15:**
```js
{ level: 9,  title: 'Đại Sư Nhân Loại',   minXP: 3500 },
{ level: 10, title: 'Thiên Tài Ngôn Ngữ', minXP: 5000 },
{ level: 11, title: 'Thần Tiếng Anh',     minXP: 7000 },
```

**Đề xuất B — Prestige System:**  
Sau level 8, người chơi có thể "Prestige" (reset về level 1 nhưng giữ pet/thành tích) để nhận danh hiệu đặc biệt và nhân đôi XP rate.

---

### P3. Thêm "Streak Freeze" / Bảo Vệ Streak

**Vấn đề:** Bỏ 1 ngày bất kỳ → mất toàn bộ streak. Người dùng mất động lực khi lỡ.

**Đề xuất:**
```js
// Người chơi có thể dùng tối đa 1 streak freeze/tuần
// Mua bằng coins (ví dụ: 100 coins/lần)
// Tự động áp dụng nếu có hoặc kích hoạt thủ công
userData.streakFreezes = 1; // số lần còn lại
```

---

### P4. Cải Thiện Scoring Đấu — Phá Vỡ Sự Bất Cân Xứng

**Vấn đề:** Bên thua chỉ mất `duel_streak` nhưng vẫn nhận `+5 LP`. Không có hình phạt LP khi thua.

**Đề xuất:**
```
Win:  +30 LP
Draw: +10 LP
Loss:  -5 LP  (trừ LP nhẹ để tạo thêm tension)
```
> Lưu ý: Chỉ trừ LP khi user ≥ Silver (tránh stuck tại Bronze).

---

## 🟡 Ưu Tiên Trung Bình

### P5. Coins Từ Duel Quá Chênh Lệch

**Vấn đề:** Thắng duel được `+50 coins`, thua chỉ `+10 coins`. Người mới thua nhiều sẽ không thể tích coins.

**Đề xuất:**
```
Win:  +50 coins
Draw: +25 coins
Loss: +20 coins  (tăng từ 10 → 20)
```

---

### P6. Thiếu XP Bonus Cho Streak

**Vấn đề hiện tại:** Streak không ảnh hưởng đến lượng XP nhận được.

**Đề xuất — Streak Multiplier:**
```
Streak 3–6 ngày: +10% XP
Streak 7–13 ngày: +20% XP
Streak 14+ ngày: +30% XP
```

---

### P7. Checkpoint Pass Rate Qua Cứng (70%)

**Vấn đề:** Ngưỡng pass là 70% cho tất cả 7 units. Không có điều chỉnh theo độ khó.

**Đề xuất:**
```js
const CHECKPOINT_PASS_RATE = {
  unit_1: 0.65,  // Dễ hơn cho unit đầu
  unit_2: 0.65,
  unit_3: 0.70,
  unit_4: 0.70,
  unit_5: 0.75,  // Khó dần
  unit_6: 0.75,
  unit_7: 0.80,
};
```

---

### P8. Thiếu Thành Tích Nhiều Level Hơn

**Vấn đề:** Chỉ có 2 mốc XP achievement (`xp_100`, `xp_500`). Sau 500 XP không có gì.

**Đề xuất bổ sung:**
```js
{ id: 'xp_1000',  title: 'Ngàn XP', condition: totalXP >= 1000 },
{ id: 'xp_2500',  title: 'Đỉnh Cao', condition: totalXP >= 2500 },
{ id: 'quiz_10',  title: 'Quiz Thủ',  condition: quizzesCompleted >= 10 },
{ id: 'quiz_50',  title: 'Quiz Cuồng', condition: quizzesCompleted >= 50 },
{ id: 'perfect_5', title: '5 Lần Hoàn Hảo', condition: perfectQuizzes >= 5 },
{ id: 'duel_10',  title: 'Chiến Binh Đấu', condition: duelWins >= 10 },
```

---

### P9. Pet Needs Decay Không Phản Ánh Việc Học

**Vấn đề:** Pet mất 2 energy/happiness mỗi giờ ngay cả khi user không online. Cảm giác như "punishment" thay vì reward.

**Đề xuất:** Thay đổi mô hình:
- Decay chỉ xảy ra trong giờ học (khi user active)
- Hoặc giảm tốc độ decay: `1/giờ` thay vì `2/giờ`
- Thêm cooldown: decay dừng nếu pet đã đủ needs (> 80)

---

## 🟢 Ưu Tiên Thấp / Nice-to-Have

### P10. Leaderboard Chỉ Top 50 — Thiếu Trang Cá Nhân

**Đề xuất:** Thêm API endpoint trả về **rank cụ thể của user hiện tại**, kể cả khi không vào top 50.

```js
GET /api/leaderboard/my-rank?type=power
// Returns: { rank: 87, value: 234, total_users: 312 }
```

---

### P11. Matching Quiz Thiếu Perfect Bonus

**Vấn đề:** Matching là loại quiz duy nhất không có perfect bonus (chỉ `pairs × 3`).

**Đề xuất:**
```js
case 'matching':
  xp = pairs * 3 + (isPerfect ? 15 : 0);
  coins = pairs * 2 + (isPerfect ? 10 : 0);
```

---

### P12. Duel Critical Hit Threshold Cứng (3 giây)

**Đề xuất:** Cân nhắc thay đổi thành % thời gian còn lại thay vì giá trị tuyệt đối, để phù hợp với độ khó câu hỏi.

```js
// Thay vì: timeLeft > (totalTime - 3)
// Dùng: timeLeft > totalTime * 0.8  (trả lời trong 20% thời gian đầu)
```

---

## Tóm Tắt Ma Trận Ưu Tiên

| # | Vấn đề | Ưu tiên | Độ phức tạp |
|---|---|---|---|
| P1 | Sửa map vocab/matching → reading | 🔴 Cao | Thấp |
| P2 | Thêm cấp độ sau level 8 | 🔴 Cao | Thấp |
| P3 | Streak Freeze | 🔴 Cao | Trung bình |
| P4 | Trừ LP khi thua duel | 🔴 Cao | Thấp |
| P5 | Tăng coins thua duel lên 20 | 🟡 Trung | Thấp |
| P6 | Streak XP Multiplier | 🟡 Trung | Trung bình |
| P7 | Checkpoint pass rate theo độ khó | 🟡 Trung | Thấp |
| P8 | Bổ sung thêm achievement | 🟡 Trung | Thấp |
| P9 | Cải thiện pet decay model | 🟡 Trung | Trung bình |
| P10 | My-rank API endpoint | 🟢 Thấp | Thấp |
| P11 | Perfect bonus cho Matching | 🟢 Thấp | Thấp |
| P12 | Critical hit % thay vì giây | 🟢 Thấp | Thấp |
