# 🎮 Cowdi Duel — Pokemon-Style Battle System Design

## Tổng quan

Biến trận thách đấu quiz từ giao diện trả lời câu hỏi đơn thuần → **trận chiến thị giác kiểu Pokemon**:
- Pet của bạn (góc dưới trái, quay lưng) vs Pet đối thủ (góc trên phải, quay mặt)
- Trả lời đúng → Pet tấn công (animation skill theo element)
- Trả lời sai → Bị đối thủ phản công
- HP bar giảm dần → Pet thua gục khi hết HP

## Architecture

### Flow: Quiz → Battle Action

```
[Câu hỏi hiện ra] → Chọn đáp án
  ├── Đúng → Pet tấn công (skill animation + trừ HP đối thủ)
  │         ├── Trả lời < 3s → Critical Hit (x1.5 damage, flash vàng)
  │         └── Combo streak 3+ → Special Move (hiệu ứng mạnh)
  ├── Sai  → Đối thủ phản công (bị trừ HP)
  └── Hết giờ → Bị trừ HP + skip
```

### HP System

- Mỗi bên bắt đầu: **100 HP**
- Trả lời đúng: gây **10 damage** (critical: 15)
- Trả lời sai: nhận **10 damage**
- Kết thúc 10 câu → so HP → xác định thắng/thua
- HP = 0 trước khi hết câu → KO sớm (bonus XP)

### Battle Layout

```
┌─────────────────────────────────────┐
│  [Đối thủ Name] Lv.3               │
│  HP ████████░░░░  70/100            │
│              🔥 [Đối thủ Pet →]     │
│                                     │
│  [← Pet của bạn] 🐮                │
│  HP ██████████░░  90/100            │
│  [Bạn Name] Lv.5                   │
├─────────────────────────────────────┤
│  Câu 3/10: "What is the meaning?"  │
│  [A. Option] [B. Option]           │
│  [C. Option] [D. Option]           │
└─────────────────────────────────────┘
```

## Skill Effects theo Element

| Element | Skill Name | CSS Animation |
|---------|-----------|---------------|
| 🔥 Fire | Ember | Gradient lửa cam→đỏ bay từ trái→phải, particles |
| 💧 Water | Aqua Jet | Sóng nước xanh sweep qua |
| 🌿 Nature | Leaf Storm | Lá xanh xoay bay qua màn hình |
| 🌙 Cosmic | Star Burst | Tia sáng tím + sparkle xoay |
| 🪨 Earth | Rock Smash | Đá nâu bay lên từ dưới |
| ⚪ Neutral | Tackle | Pet lao tới → bounce lại |

### Critical Hit
- Flash vàng toàn màn hình 0.3s
- Text "CRITICAL!" popup
- Damage x1.5

### Combo (3+ streak)
- Rainbow glow quanh pet
- "COMBO x3!" badge
- Hiệu ứng skill mạnh hơn (scale lớn hơn, particles nhiều hơn)

## Tài nguyên sử dụng

### Hình ảnh
- **Dùng ảnh pet .webp hiện có** (13 pet có ảnh, 5 stage/pet)
- Pet mình: hiển thị bình thường (nhìn sang phải)
- Pet đối thủ: `transform: scaleX(-1)` (flip ngang, nhìn sang trái)
- 5 pet chưa có ảnh → dùng emoji kích thước lớn

### CSS Animations (mới)
- `battleAttack` — pet lao tới
- `battleDamage` — pet bị đẩy lùi + flash đỏ
- `battleFaint` — pet ngã xuống + fade
- `skillFire/Water/Nature/Cosmic/Earth` — hiệu ứng skill
- `hpDrain` — HP bar giảm smooth
- `criticalFlash` — flash vàng toàn màn hình
- `damagePopup` — số damage bay lên

### Sound Effects (thêm vào useSound.jsx)
- `battleAttack` — swoosh
- `battleHit` — impact
- `battleCritical` — dramatic chord
- `battleFaint` — descending sad tone
- `battleVictory` — fanfare

## Reward System (giữ nguyên)

| Kết quả | XP | Coins | LP |
|---------|-----|-------|----|
| Tạo duel | score × 5 | 10 | +5 |
| Thắng | score × 5 | 50 | +30 |
| Hòa | score × 5 | 25 | +15 |
| Thua | score × 5 | 10 | +5 |
| KO sớm (bonus) | +20 | +10 | — |

## Định hướng phát triển (v2.0+)

- **Season System**: Mùa giải 2-4 tuần, reset LP, phần thưởng cuối mùa
- **ELO/MMR**: Matchmaking theo trình độ
- **Power-ups**: Shield, Time Freeze, 50/50 (mua từ Shop)
- **Coin Wager**: Đặt cọc coins trước trận
- **Live Duel**: WebSocket real-time
- **Clan Wars**: Nhóm 3-5 người, clan battles hàng tuần
- **Battle Sprites**: Sprite riêng cho từng pet (front/back)
- **Azure Speech SDK**: Pronunciation assessment cho speaking duels
