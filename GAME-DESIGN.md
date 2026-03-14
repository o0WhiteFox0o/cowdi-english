# 🐮 COWDI PET — Game Design Document

## Tổng quan

Biến **Cowdi English** thành game nuôi pet giáo dục. Người chơi nuôi dưỡng pet bằng kiến thức tiếng Anh.
Cowdi là pet starter, nhưng có thể mở khóa thêm 14 pet khác.

> **Triết lý:** "Bạn giỏi hơn → Pet mạnh hơn. Bạn lười → Pet buồn."
> **Bảng xếp hạng so sánh PET, không so sánh người chơi.**

---

## Hệ thống kỹ năng Pet (4 Skills)

| Quiz Category | Pet Skill | Icon | Mô tả |
|---|---|---|---|
| Vocabulary | Speech (Giao tiếp) | 🗣️ | Pet nói nhiều ngôn ngữ hơn |
| Grammar | Intelligence (Trí tuệ) | 🧠 | Pet giải câu đố phức tạp |
| Listening | Perception (Thính giác) | 👂 | Pet nghe hiểu nhiều âm thanh |
| Sentences | Creativity (Sáng tạo) | ✍️ | Pet viết thư, kể chuyện |

- Mỗi câu quiz đúng → +1 skill tương ứng
- Perfect quiz (10/10) → +15 skill (bonus x1.5)
- Hoàn thành bài học → +5 tất cả skills
- Mỗi skill có 10 cấp

---

## Tiến hóa Pet (5 giai đoạn)

| Stage | XP cần | Tên | Multiplier |
|---|---|---|---|
| 0 | 0 | Trứng | 0.5x |
| 1 | 100 | Baby | 0.8x |
| 2 | 500 | Junior | 1.0x |
| 3 | 1200 | Super | 1.3x |
| 4 | 2500 | Legendary | 1.5x |

---

## Nhu cầu Pet (Tamagotchi-style)

| Nhu cầu | Giảm | Tăng |
|---|---|---|
| 🍎 Năng lượng | -2/giờ | Hoàn thành bài học +30 |
| 😊 Vui vẻ | -2/giờ | Chơi quiz +20, Perfect +40 |
| 💤 Sức khỏe | -1/giờ | Streak liên tục +10 |
| 📚 Kiến thức | -2/giờ | Ôn từ vựng +25 |

Trạng thái: >70% vui vẻ, <40% buồn, <15% ốm

---

## 15 Pet

| Pet | Element | Rarity | Thế mạnh | Unlock |
|---|---|---|---|---|
| 🐮 Cowdi | Neutral | Starter | Cân bằng | Có sẵn |
| 🦊 Foxie | Fire | Common | Intelligence | 5 bài học |
| 🐧 Pingu | Water | Common | Perception | 10 quiz Listening |
| 🐢 Leafy | Nature | Common | Speech | 50 từ vựng |
| 🐉 Sparky | Fire | Rare | Creativity | Streak 7 |
| 🐱 Mimi | Cosmic | Rare | Intelligence+Perception | 3 Perfect Quiz |
| 🦉 Owlbert | Nature | Rare | Intelligence++ | Tất cả bài Grammar |
| 🐬 Flippy | Water | Rare | Perception+Speech | 100 từ learned |
| 🦁 Leo | Fire | Epic | Tất cả cao | 1000 XP |
| 🐼 Bamboo | Nature | Epic | Speech++ | 8/8 bài học |
| 🦅 Storm | Cosmic | Epic | Creativity+Perception | Streak 30 |
| 🐺 Shadow | Cosmic | Epic | Intelligence+Creativity | 50 quiz |
| 🦄 Prisma | Cosmic | Legendary | Tất cả max | 2500 XP |
| 🐲 Draco | Fire | Legendary | Stats x2 | Tất cả pet khác |
| 🎃 Pumpkin | Cosmic | Event | Bonus XP | Sự kiện Halloween |

---

## Bảng xếp hạng Pet (ẩn danh)

- Chỉ hiện: Tên pet + Loài + Evolution + Stats
- KHÔNG hiện: Tên người chơi, email, avatar
- 3 tab: Tổng sức mạnh, Theo kỹ năng, Bộ sưu tập

### Power Score
```
Power = (speech + intelligence + perception + creativity) × evolutionMultiplier × rarityBonus
```

---

## Shop & Coins

| Loại | Ví dụ | Giá |
|---|---|---|
| 🎩 Mũ | Tốt nghiệp, Vương miện | 50-200 |
| 👔 Trang phục | Siêu nhân, Thám hiểm | 80-300 |
| 🏠 Phòng | Thư viện, Bãi biển | 150-500 |
| ✨ Hiệu ứng | Bong bóng, Sao sáng | 200 |
| 🍕 Đồ ăn | Pizza XP, Sữa thần | 100 |

Kiếm coins: Daily tasks +10, Streak 3d +20, Streak 7d +50, Achievement +30, Perfect quiz +15

---

## Phases

| Phase | Nội dung |
|---|---|
| 1 | Pet Registry + Active Pet + Skills + Evolution + Pet Dashboard + Needs |
| 2 | 14 pets + Collection Page + Unlock system |
| 3 | Bảng xếp hạng pet (server-side) + Nickname |
| 4 | Shop + Coins + Cosmetics |
| 5 | Mini-games (Word Catch, Sentence Puzzle) + Events |
