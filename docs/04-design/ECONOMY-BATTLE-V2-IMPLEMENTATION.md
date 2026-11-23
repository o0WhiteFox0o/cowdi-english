# Cowdi English — Hướng dẫn triển khai Kinh tế & Chiến đấu v2

> **Dành cho Claude Code.** Tài liệu này là nguồn sự thật (source of truth) để viết lại hệ thống tiền tệ, tiến hoá và chiến đấu pet. Chốt ngày 23/11/2026 với Sonny (chủ dự án).
> Đặt file này tại `docs/04-design/ECONOMY-BATTLE-V2-IMPLEMENTATION.md`.
> Tài liệu nguồn (chỉ để tham khảo, **file này thắng nếu mâu thuẫn**): Đặc tả hệ thống chiến đấu pet (claude.ai), bảng "Cowdi — Cân bằng hệ tương khắc" (claude.ai, **còn dùng công thức cũ**), `GAME-DESIGN.md`, `XP-REDESIGN-2026-05.md`, `DUEL-BATTLE-DESIGN.md` (đều đã lỗi thời ở các phần liên quan).

---

## 0. Cách làm việc

1. Đọc hết file này trước khi sửa code. Làm theo thứ tự các **Phase** ở mục 9; mỗi phase là một nhánh/PR riêng, build và test xanh rồi mới sang phase sau.
2. **Mọi hằng số cân bằng nằm trong một file cấu hình dùng chung** `shared/game-config.js` (ESM, import được từ cả `src/` (Vite) và `server/` (Node ESM, `"type": "module"`)). Không hard-code số trong logic.
3. Logic tính chỉ số và trận đấu là **hàm thuần** (pure functions) trong `shared/battle-engine.js`, dùng chung client/server. Server là nơi quyết định kết quả; client chỉ hiển thị.
4. Chỗ nào ghi **[MỞ]** là chưa chốt: làm theo **mặc định** ghi kèm, để giá trị trong config, và liệt kê lại trong mô tả PR.
5. Không đụng Shop (`ShopPage.jsx`, `SHOP_ITEMS`, coins) — **Shop tạm gác** (xem mục 7).
6. Commit message và PR viết tiếng Việt hoặc tiếng Anh đều được; giải thích nguyên nhân + ảnh hưởng.

---

## 1. Tóm tắt các quyết định

| # | Quyết định |
|---|---|
| 1 | Chỉ còn **2 loại tiền**: **Sữa** (đổi tên từ XP) và **Gem** (thay Coins về lâu dài). Thêm vật phẩm **Đá nguyên tố**. |
| 2 | **Gem** chỉ nhận khi đạt mốc bài học (hoặc nạp tiền — chưa làm). **Đá nguyên tố** nhận khi hoàn thành bài học. |
| 3 | Tiến hoá **không còn tự động** theo XP. Người chơi bấm "Tiến hoá" khi đủ Sữa + Gem + Đá + điều kiện điểm kỹ năng; hệ thống trừ tài nguyên. |
| 4 | **Không có chỉ số thân thiết.** Gắn bó = điểm Nghe/Nói/Đọc/Viết **của pet** (`pet.skills`), tích khi người chơi học với pet đó. |
| 5 | Không giới hạn điểm kỹ năng theo ngày (học nhiều được thưởng nhiều). |
| 6 | Từ C3 trở lên, **mỗi pet có mức điểm tối thiểu riêng cho từng kỹ năng** (mục 3.3). |
| 7 | Chỉ số chiến đấu tính **theo điểm kỹ năng, không theo cấp, không trần, giảm dần theo căn bậc hai**. Cấp 1–10 (`getSkillLevel`) chỉ để hiển thị. |
| 8 | **Nhanh nhẹn tính tương đối**: né và crit của hai bên triệt tiêu nhau; chỉ phần cộng phẳng từ hệ/nhóm không bị triệt tiêu. Bỏ trần né 25% và crit 40%. |
| 9 | **Nói** tăng cả Tấn công lẫn hệ số sát thương crit (khuyến khích luyện nói). |
| 10 | Hệ **Lôi** crit cộng sẵn hạ từ 27% → **15%**. |
| 11 | Nhóm "Trời" đổi tên **"Bầu trời"**; Tầm cao hạ từ 45–60% → **bỏ qua 20% phòng thủ**. |
| 12 | **Cùng nhóm thì cùng giá trị kỹ năng nhóm.** |
| 13 | Thắng thua theo **% HP còn lại**, tính trên **server**. |
| 14 | Mục tiêu nhịp chơi: đa số người chơi thường ở **C3**; C4–C5 cho người học rất nhiều hoặc nạp tiền. |

---

## 2. Tiền tệ & vật phẩm

### 2.1 Sữa (Milk) — đổi tên từ XP
- Ví tiêu được: `availableXP` → đổi tên khái niệm thành **Sữa** (`milk`). Giữ cột DB `available_xp` hoặc thêm `milk` rồi migrate — chọn cách ít rủi ro; UI hiển thị "Sữa 🥛".
- `totalXP` (lifetime) **giữ nguyên** cho cấp người chơi, leaderboard và điều kiện mở khoá pet (`unlockCondition.type === 'xp'`). Không gọi là Sữa trên UI chỗ này (gọi "Tổng điểm học" hoặc giữ "XP").
- Nguồn Sữa: giữ toàn bộ quy tắc `addXP` hiện tại (bài học lần đầu 10/câu + 60 (+30 trọn điểm), làm lại 1/3; mini-game trần 120/ngày, vượt trần 20%; practice, review, duel…). `addXP(n)` cộng cả `totalXP` và ví Sữa như hiện nay.
- Chỗ tiêu duy nhất: **tiến hoá pet** (mục 3). Bỏ card "Cho Pet ăn XP" (+50/+200/+500, `feedXPToPet`) — thay bằng nút **Tiến hoá**.

### 2.2 Gem
- Mới. Số dư lưu trên **server** (mục 6).
- Nguồn:
  - `GEM_PER_NEW_LESSONS = 2` → **1 Gem mỗi 2 bài học hoàn thành lần đầu** (đếm `completedLessons`, chỉ lần đầu).
  - **Gem theo unit (D2):**
    - `GEM_PER_UNIT = 1`: hoàn thành unit (toàn bộ bài học trong unit) nhận **1 Gem**.
    - `GEM_PER_UNIT_PERFECT = 2`: hoàn thành 100% unit nhận thêm **2 Gem** nữa.
    - Mỗi unit nhận tối đa 1 lần (chống cộng trùng qua `uq_grant`).
  - Nạp tiền: **chưa làm**, nhưng ledger phải có `reason = 'purchase'` sẵn.
- Chỗ tiêu: tiến hoá C2→C3 trở lên; đổi lấy Đá nguyên tố (mục 2.3).

### 2.3 Đá nguyên tố (Element Stone) & Mảnh đá (Stone Shard)
- Mới, lưu server. Mặc định **1 loại dùng chung** (**[MỞ]** có tách theo 10 hệ không — xem TASK.md).
- Nguồn:
  - `STONE_PER_NEW_LESSONS = 10` → **1 đá mỗi 10 bài học hoàn thành lần đầu** (D3: giữ 1 đá / 10 bài mới).
  - **Đổi Gem lấy đá (D3):**
    - `GEM_PER_STONE = 15` (15 Gem đổi được 1 đá).
    - `STONE_EXCHANGE_PER_WEEK = 1` (tối đa 1 lần/tuần, reset thứ Hai 00:00).
    - Không bán đá trực tiếp bằng tiền thật.
  - **Tài nguyên mới: Mảnh đá nguyên tố (`stone_shard`):**
    - 10 mảnh đá ghép thành 1 đá nguyên tố (`SHARDS_PER_STONE = 10`).
    - Nguồn nhận: thưởng Đấu trường (GĐ5), sự kiện...
- Gem nạp tiền **không** được thay đá trực tiếp (chỉ qua đổi Gem lấy đá có trần tuần).

### 2.4 Coins
- **Không sửa trong đợt này** (Shop tạm gác). Không thêm cách dùng coins mới. Không cho coins mua Sữa/Gem/Đá.

---

## 3. Tiến hoá

### 3.1 Ánh xạ cấp
C1–C5 = `pet.evolution` 0–4 (Trứng/Hạt mầm → Baby → Junior → Super → Legendary). Giữ tên/ảnh `evolutions[]` trong `PET_REGISTRY`, **bỏ trường `xp`** khỏi điều kiện (hoặc để lại nhưng không dùng). `getPetEvolution(speciesId, totalXP)` không còn quyết định cấp; cấp lưu trực tiếp ở `pet.evolution` và chỉ thay đổi qua API tiến hoá.

### 3.2 Chi phí

| Bước | Sữa | Gem | Đá | Điều kiện điểm kỹ năng của pet |
|---|---|---|---|---|
| C1 → C2 | 500 | 0 | 0 | Tổng 4 kỹ năng ≥ 60 |
| C2 → C3 | 1 500 | 1 | 0 | Tổng 4 kỹ năng ≥ 160 |
| C3 → C4 | 5 000 | 25 | 1 | Từng kỹ năng ≥ mức riêng của pet (3.3, cột C4) |
| C4 → C5 | 20 000 | 50 | 10 | Từng kỹ năng ≥ mức riêng của pet (3.3, cột C5) |

Tài nguyên **trừ khi tiến hoá** (Sữa/Gem/Đá). Điểm kỹ năng **không bị trừ** (chỉ là điều kiện).

### 3.3 Điểm kỹ năng tối thiểu từng pet (C3→C4 và C4→C5)
Thứ tự **Nghe / Nói / Đọc / Viết**. Lưu trong `PET_REGISTRY[id].evolveReq = { c4: [n,s,r,w], c5: [n,s,r,w] }`.

| ID | Pet | Lên C4 | Lên C5 |
|---|---|---|---|
| cowdi | Cowdi | 250 / 60 / 150 / 60 | 600 / 150 / 400 / 150 |
| foxie | Foxie | 60 / 250 / 60 / 150 | 150 / 600 / 150 / 400 |
| pingu | Pingu | 150 / 60 / 60 / 250 | 400 / 150 / 150 / 600 |
| leafy | Leafy | 150 / 60 / 250 / 60 | 400 / 150 / 600 / 150 |
| sparky | Sparky | 60 / 250 / 60 / 150 | 150 / 600 / 150 / 400 |
| mimi | Mimi | 60 / 60 / 150 / 250 | 150 / 150 / 400 / 600 |
| owlbert | Owlbert | 60 / 60 / 250 / 150 | 150 / 150 / 600 / 400 |
| flippy | Flippy | 250 / 60 / 60 / 150 | 600 / 150 / 150 / 400 |
| leo | Leo | 150 / 250 / 60 / 60 | 400 / 600 / 150 / 150 |
| bamboo | Bamboo | 250 / 60 / 150 / 60 | 600 / 150 / 400 / 150 |
| storm | Storm | 60 / 150 / 60 / 250 | 150 / 400 / 150 / 600 |
| shadow | Shadow | 60 / 150 / 60 / 250 | 150 / 400 / 150 / 600 |
| prisma | Prisma | 250 / 60 / 150 / 60 | 600 / 150 / 400 / 150 |
| draco | Draco | 150 / 250 / 60 / 60 | 400 / 600 / 150 / 150 |
| pumpkin | Pumpkin | 60 / 60 / 150 / 250 | 150 / 150 / 400 / 600 |
| monk | Monk | 150 / 60 / 250 / 60 | 400 / 150 / 600 / 150 |
| ginseng | Ginseng | 250 / 60 / 150 / 60 | 600 / 150 / 400 / 150 |
| paddy | Paddy | 250 / 60 / 150 / 60 | 600 / 150 / 400 / 150 |
| sprout | Sprout | 150 / 60 / 60 / 250 | 400 / 150 / 150 / 600 |
| mushroom | Nấm Rơm | 150 / 60 / 250 / 60 | 400 / 150 / 600 / 150 |
| radish | Củ Cải Trắng | 150 / 60 / 250 / 60 | 400 / 150 / 600 / 150 |
| bun | Bánh Bao | 150 / 250 / 60 / 60 | 400 / 600 / 150 / 150 |

### 3.4 Điểm kỹ năng của pet — sửa cách cộng
- **Bỏ** `addAllSkillPoints(5)` trong `onLessonComplete` (`src/hooks/usePet.jsx`). Lý do: cộng đều 5 điểm cho cả 4 kỹ năng mỗi bài làm mọi pet đủ mọi điều kiện sau ~40 bài → điều kiện riêng theo pet vô nghĩa. Năng lượng (+30 energy) khi xong bài thì giữ.
- Giữ `addSkillPoints(quizCategory, correct, total)`: mỗi câu đúng +1 vào kỹ năng theo `QUIZ_TO_SKILL`, trọn điểm +5; dạng `mixed`/không map thì chia đều.
- Đảm bảo **mọi** chỗ làm quiz (lesson, practice, review, mini-game, learning path checkpoint, duel) đều gọi `addSkillPoints` cho **pet đang chọn** với đúng category.
- **Bỏ** XP pet thụ động: không cộng `totalXpEarned` trong `addSkillPoints`/`addAllSkillPoints` nữa (trường có thể giữ để hiển thị lịch sử, không dùng cho tiến hoá).
- **Bỏ** `userData.skillXP` / `addSkillXP` / cột `skill_xp` khỏi mọi tính toán (có thể giữ dữ liệu, không đọc). Chỉ số chiến đấu lấy từ `pet.skills`.
- Điểm kỹ năng **không trần**.

### 3.5 Thiếu nguồn điểm Nói (ghi chú, không chặn phase)
Hiện chỉ Speed Round, Word Guess và luyện Nói cộng điểm Nói. Kiểm tra `QUIZ_TO_SKILL` và các trang practice; báo lại trong PR danh sách hoạt động cộng từng kỹ năng để Sonny bổ sung nội dung Nói.

---

## 4. Chỉ số pet

### 4.1 Công thức
```
HP    = round( (HP_cấp  + 4.9  × √Nghe + HP_hiếm ) × (1 + %HP_hệ ) )
ATK   = round1((ATK_cấp + 0.5  × √Nói  + ATK_hiếm) × (1 + %ATK_hệ))
DEF   = 2.45 × √Đọc + DEF_hệ
AGI   = 1.47 × √Viết + AGI_hệ
CRITX = (hệ Kim ? 1.7 : 1.4) + 0.012 × √Nói + (nhóm Rồng & đã mở kỹ năng ? 0.1 : 0)
```
`√` = căn bậc hai của điểm kỹ năng thô (số nguyên ≥ 0). Không có trần.

### 4.2 Gốc theo cấp tiến hoá
| Cấp | HP | ATK |
|---|---|---|
| C1 | 100 | 10 |
| C2 | 120 | 12 |
| C3 | 150 | 15 |
| C4 | 180 | 18 |
| C5 | 200 | 20 |
DEF và AGI gốc = 0.

### 4.3 Độ hiếm
Ánh xạ code → thiết kế: `starter`, `common` → Thường · `rare` → Hiếm · `event` → Sự kiện · `epic` → Sử thi · `legendary` → Huyền thoại.

| Độ hiếm | + HP | + ATK | Mở kỹ năng nhóm từ |
|---|---|---|---|
| Thường | 0 | 0 | C3 |
| Hiếm | 8 | 1 | C2 |
| Sự kiện | 8 | 1 | C2 |
| Sử thi | 15 | 2 | C1 |
| Huyền thoại | 25 | 3 | C1 |

Bỏ `RARITY_BONUS` nhân 1.0–1.3 trong `calculatePowerScore`. Power score mới (cho leaderboard) = gợi ý: `round(HP/10 + ATK + DEF/2 + AGI/2)` theo chỉ số mục 4.1 — ghi rõ trong PR, dễ đổi.

### 4.4 Ví dụ kiểm thử (phải khớp ±0.1)
| Trường hợp | HP | ATK | DEF | AGI | CRITX |
|---|---|---|---|---|---|
| Cowdi C1 (Vô, Thường), skills 0/0/0/0 | 113 | 10.4 | 4.0 | 3.0 | 1.4 |
| Leafy C4 (Mộc, Thường), skills 150/60/250/60 | 271 | 21.9 | 38.7 | 11.4 | 1.493 |
| Storm C5 (Lôi, Sử thi), skills 150/400/150/600 | 275 | 34.2 | 30.0 | 41.0 | 1.64 |

---

## 5. Chiến đấu

### 5.1 Luật chung
- Trận = 10 câu quiz. Mỗi câu **đúng** = 1 đòn đánh vào đối thủ. Thứ tự xử lý: lần lượt câu 1→10; trong mỗi câu, bên thách đấu (challenger) đánh trước, rồi đến bên nhận (opponent). Ghi lại để client phát lại animation.
- Sau câu 10, bên còn **% HP** cao hơn thắng. Bằng nhau → tổng thời gian trả lời ít hơn thắng (như hiện tại).
- **[MỞ]** Pet về 0 HP giữa trận: mặc định `STOP_AT_ZERO = false` — HP không xuống dưới 0, vẫn chấm hết 10 câu (để không phạt người trả lời sau). Để flag trong config.
- Mọi sát thương là **số nguyên**.
- Ghép trận: chênh tối đa **1 cấp tiến hoá**.
- Lưu **ảnh chụp chỉ số pet** (snapshot: speciesId, evolution, skills, element, group, rarity) của challenger lúc tạo trận; opponent snapshot lúc tham gia.

### 5.2 Công thức đòn
```
DEF_hiệu_lực = DEF_thủ × (1 − ignore)              // ignore = 0.20 nếu bên đánh thuộc nhóm Bầu trời và đã mở kỹ năng, ngược lại 0
Đòn thường   = round( ATK × Khắc × 100 / (100 + DEF_hiệu_lực) )
Đòn crit     = round( Đòn thường × CRITX )
  // bên bị đánh hệ Thổ: Đòn crit = Đòn thường + round((Đòn crit − Đòn thường) × 0.5)
Khắc         = 1.2 khi khắc, 0.8 khi bị khắc, 1 còn lại
```

### 5.3 Crit & né (tương đối)
```
P_né   = max(0, (AGI_thủ − AGI_công) × 0.005) + né_phẳng_thủ        // né_phẳng: nhóm Biển 0.03 (nếu đã mở)
P_crit = max(0, (AGI_công − AGI_thủ) × 0.005) + crit_phẳng_hệ_công  // xem bảng 5.5
```
- **Trả lời nhanh (< 3 giây) → luôn crit**, không bị triệt tiêu (vẫn có thể bị né).
- Hệ **Phong**: thêm 2 câu đúng (2 câu đúng đầu tiên chưa nhanh) được tính là trả lời nhanh.
- Không trần cho P_né, P_crit (kẹp vào [0, 1] khi gieo xác suất).
- Ngẫu nhiên dùng **RNG có seed** (seed = challengeId + câu + bên) để server tính lại được và có thể replay.

### 5.4 Vòng khắc
Ngũ hành: **Kim → Mộc → Thổ → Thủy → Hỏa → Kim** (A → B: A khắc B).
**Ánh sáng ⇄ Bóng tối**, **Phong ⇄ Lôi** khắc lẫn nhau (cả hai chiều ×1.2).
**Vô** không khắc, không bị khắc.

### 5.5 10 hệ
| Hệ | key | %HP | %ATK | +DEF | +AGI | +Crit phẳng | Hiệu ứng |
|---|---|---|---|---|---|---|---|
| Kim | kim | – | 12% | – | – | 8% | CRITX gốc 1.7 thay 1.4 |
| Mộc | moc | 13% | – | – | – | – | Hồi 1% HP tối đa mỗi câu đúng |
| Thủy | thuy | 12% | – | – | 6 | – | Hồi 5% HP tối đa mỗi lần né |
| Hỏa | hoa | – | 11% | – | – | 3% | Mỗi đòn trúng gây bỏng 1% HP tối đa của đối thủ/lượt trong 2 lượt |
| Thổ | tho | 5% | – | 12 | – | – | Giảm 50% phần sát thương cộng thêm khi bị crit |
| Bóng tối | bong_toi | – | 8% | – | 9 | 6% | Hút 10% sát thương gây ra |
| Ánh sáng | anh_sang | 3% | – | 4 | – | – | Lá chắn chặn đòn trúng đầu tiên |
| Vô | vo | 13% | 4% | 4 | 3 | – | Không khắc, không bị khắc |
| Phong | phong | 3% | – | – | 14 | 8% | +2 câu tính là trả lời nhanh |
| Lôi | loi | – | 7% | – | 5 | **15%** | Crit gây choáng: đối thủ không crit được ở đòn kế tiếp của họ |

"Lượt" = mỗi câu (1 câu = 1 lượt cho cả hai bên).

### 5.6 7 nhóm (giá trị chung cả nhóm)
| Nhóm | key | Kỹ năng | Hiệu ứng | Giá trị |
|---|---|---|---|---|
| Nông trại | nong_trai | No đủ | Từ câu đúng thứ 3 liên tiếp trở đi, mỗi câu đúng hồi % HP tối đa | 2% |
| Thảo mộc | thao_moc | Bám rễ | Khi HP < 50%, giảm sát thương nhận | 30% |
| Thú săn | thu_san | Bản năng săn | Sau chuỗi 3 câu đúng liên tiếp, +% ATK đến hết trận | 10% |
| Biển | bien | Lướt sóng | +né phẳng; né được thì câu đúng kế tiếp chắc chắn crit | 3% |
| Bầu trời | bau_troi | Tầm cao | Đòn đánh bỏ qua % phòng thủ đối thủ | 20% |
| Rồng | rong | Long huyết | CRITX +0.1; crit làm hiệu ứng hệ (bỏng, hồi, hút…) mạnh gấp đôi ở đòn đó | +0.1 |
| Linh thể | linh_the | Linh khí | Miễn hiệu ứng xấu đầu tiên (bỏng, choáng); giảm sát thương nhận | 4% |

Kỹ năng nhóm chỉ có hiệu lực khi pet đã đạt cấp mở theo độ hiếm (4.3).

### 5.7 Hệ & nhóm từng pet (thay 6 hệ cũ)
| ID | Hệ | Nhóm | Độ hiếm (code) |
|---|---|---|---|
| cowdi | Vô | Nông trại | starter |
| bamboo | Vô | Nông trại | epic |
| bun | Kim | Nông trại | epic |
| paddy | Mộc | Thảo mộc | common |
| sprout | Mộc | Thảo mộc | rare |
| mushroom | Thổ | Thảo mộc | rare |
| radish | Thổ | Thảo mộc | rare |
| ginseng | Thổ | Thảo mộc | epic |
| foxie | Hỏa | Thú săn | common |
| leo | Kim | Thú săn | epic |
| shadow | Bóng tối | Thú săn | epic |
| pingu | Thủy | Biển | common |
| leafy | Mộc | Biển | common |
| flippy | Thủy | Biển | rare |
| mimi | Phong | Bầu trời | rare |
| owlbert | Phong | Bầu trời | rare |
| storm | Lôi | Bầu trời | epic |
| sparky | Hỏa | Rồng | rare |
| draco | Hỏa | Rồng | legendary |
| pumpkin | Bóng tối | Linh thể | event |
| monk | Ánh sáng | Linh thể | event |
| prisma | Ánh sáng | Linh thể | legendary |

Kiểm tra lại độ hiếm từng pet trong `PET_REGISTRY` khớp cột cuối; nếu lệch, **giữ giá trị trong code** và báo lại trong PR. Bỏ `baseStats` theo loài khỏi mọi phép tính (giữ trường nếu UI cũ còn đọc).

---

## 6. Server & dữ liệu

### 6.1 Ledger (bắt buộc trước khi có Gem)
Bảng mới `wallet_ledger`:
```sql
CREATE TABLE wallet_ledger (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  currency    ENUM('milk','gem','stone','stone_shard') NOT NULL,
  amount      INT NOT NULL,              -- dương = nhận, âm = tiêu
  reason      VARCHAR(40) NOT NULL,      -- lesson_first, lesson_milestone, unit_complete, unit_perfect, stone_exchange, shard_combine, evolve, purchase, migration, admin…
  ref_id      VARCHAR(64) DEFAULT NULL,  -- lessonId, unitId, petInstanceId, orderId…
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id, currency),
  UNIQUE KEY uq_grant (user_id, currency, reason, ref_id)  -- chống cộng trùng
);
```
Số dư = `SUM(amount)` theo user + currency (có thể cache cột `gem_balance`, `stone_balance`, `stone_shard_balance` trong `user_progress`, cập nhật trong cùng transaction).
Migration theo kiểu idempotent như các file `server/db/migrate-*.sql` hiện có.

### 6.2 API mới / sửa
- `POST /api/lessons/:lessonId/complete` (hoặc mở rộng endpoint hiện có): server ghi nhận bài hoàn thành lần đầu, tính Gem/Đá theo mốc (`GEM_PER_NEW_LESSONS`, `STONE_PER_NEW_LESSONS`) và ghi ledger. Client không tự cộng Gem/Đá.
- Cấp Gem theo unit (D2): khi hoàn thành tất cả bài trong unit, cấp 1 Gem (`reason='unit_complete'`); hoàn thành 100% cấp thêm 2 Gem (`reason='unit_perfect'`).
- `GET /api/wallet` → `{ milk, gem, stone, stone_shard }`.
- `POST /api/wallet/exchange-stone`: đổi 15 Gem lấy 1 đá (`GEM_PER_STONE = 15`), kiểm tra trần tối đa 1 lần/tuần (`STONE_EXCHANGE_PER_WEEK = 1`, reset thứ Hai 00:00).
- `POST /api/wallet/combine-shards`: ghép 10 mảnh đá thành 1 đá nguyên tố.
- `POST /api/pets/:instanceId/evolve` → server kiểm tra: pet thuộc user, cấp hiện tại < 5, đủ Sữa/Gem/Đá, đủ điều kiện điểm kỹ năng (3.2–3.3); trừ tài nguyên qua ledger trong **transaction**, tăng `evolution`; trả trạng thái mới. Client không tự đổi `pet.evolution`.
- `PUT /api/pet-data` (`server/routes/api.js` ~dòng 186–200): **không nhận** `evolution` và (về sau) `coins` từ client nữa — server giữ giá trị hiện có. Giữ các trường khác.
- Duel (`server/routes/api.js` ~dòng 340–600):
  - Tạo trận: lưu snapshot pet challenger (thêm cột `challenger_pet_snapshot` JSON).
  - Tham gia: lưu snapshot opponent, gọi `shared/battle-engine.js` để tính trận theo HP, lưu `battle_log` (JSON từng đòn) + `challenger_hp_pct`, `opponent_hp_pct`; winner theo mục 5.1. League points giữ nguyên quy tắc hiện tại (+30 thắng, +15 hoà, +5 thua, +5 tạo trận).
  - Ghép trận chênh tối đa 1 cấp (lọc ở danh sách thách đấu/lúc join).

### 6.3 Chống gian lận tối thiểu
- Điểm kỹ năng pet vẫn đang do client gửi (`pet_data.collection`). Đợt này: server **kẹp** để không giảm (lấy max với giá trị cũ) và ghi chú rủi ro trong PR. Chuyển hẳn sang server tính là việc sau.

### 6.4 Di trú người chơi cũ **[MỞ — mặc định]**
- Ví Sữa = `available_xp` hiện tại (1:1).
- Gem/Đá ban đầu = tính lại theo số bài đã hoàn thành lần đầu (`completedLessons.length`) với quy tắc 2.2–2.3, ghi ledger `reason='migration'`.
- Pet đã ở cấp cao: **giữ nguyên cấp** (không hạ).
- Coins giữ nguyên, không đổi sang Gem (chờ quyết định Shop).
- Migration chạy được nhiều lần không cộng trùng (dựa vào `uq_grant`).

---

## 7. Lộ trình tính năng tiếp theo (Shop & các hệ thống khác)
Mục "Shop tạm gác" được tách thành các giai đoạn triển khai chi tiết theo `docs/01-project-management/QUY-TRINH-TRIEN-KHAI-KINH-TE-V2.md`:
- **GĐ2 — Mô phỏng cân bằng**: script `scripts/simulate-balance.js` gọi engine thật, ma trận 10 hệ, 7 nhóm, điều chỉnh hằng số (`docs/04-design/economy-v2/lenh-claude-code-2-can-bang-he-tuong-khac.md`).
- **GĐ3 — Cửa hàng Giữ nhịp**: chuyển tính streak lên server theo múi giờ; 4 vật phẩm Giữ nhịp mua bằng Sữa (Khăn giữ lửa 400, Vé quay lại 300, Khế ước 7 ngày cọc 300/700/1500 hoàn ×1.5, Đồng hồ Cowdi 1000); xử lý coins và đồ cũ (`docs/04-design/economy-v2/de-xuat-vat-pham-cua-hang-v2.md`).
- **GĐ4 — Hệ thống đồ trang trí**: bảng `owned_cosmetics`, 6 bậc, đồ mốc học tự cấp, nền và hào quang mới, khung avatar, danh hiệu (`docs/04-design/economy-v2/de-xuat-trang-tri-nen-hao-quang.md`).
- **GĐ5 — Đấu trường**: vé đấu từ học (3/ngày + 2/bài mới + 3/unit 100%), ghép trận cấp ±1 + LP, 6 bậc, thưởng trận 8/5/2 Sữa, rương tuần, thưởng mùa có Gem, mảnh đá (`docs/04-design/economy-v2/de-xuat-dau-truong-va-qua-tang.md`).
- **GĐ6 — Lõi gacha + thiệp mời + quay khởi đầu**: sửa `ensureInitialPet` trong `src/hooks/usePet.jsx`, thiệp mời chọn Cowdi hoặc quay khởi đầu (bể 21 pet, 50/30/13/5/2) (`docs/04-design/economy-v2/de-xuat-gacha-v2.md`).
- **GĐ7 — Gacha đầy đủ**: vé gacha 50 Gem mua lẻ, không bảo hiểm (67/22/8/3), banner 3 tuần + pet giới hạn, Thẻ tặng pet qua `InviteSheet`, Bụi sao (`docs/04-design/economy-v2/de-xuat-gacha-v2.md`).
- **GĐ8 — Thanh toán & gói trả phí**: Thẻ mùa học tập (30 tầng), Thẻ tháng Sữa ×1.5, gói Gem, giới hạn chi tiêu cho tài khoản nhỏ tuổi (`docs/04-design/economy-v2/lo-trinh-kiem-tien-v2.md`).
- **GĐ9 — Theo dõi & điều chỉnh liên tục**: dashboard và theo dõi chỉ số người dùng.

**Vẫn ngoài phạm vi:**
- Đội 3 pet, thanh năng lượng chiêu, hệ tăng sức mạnh theo tuần, ấn ký.
- Cập nhật bảng cân bằng trên claude.ai (Sonny làm riêng).

---

## 8. UI cần sửa
- **PetPage.jsx**: bỏ card "Cho Pet ăn XP". Thêm khối **Tiến hoá**: hiển thị cấp hiện tại → cấp kế, từng điều kiện (Sữa, Gem, Đá, điểm từng kỹ năng) có ✓/✗ và thanh tiến độ; nút "Tiến hoá" bật khi đủ, gọi API 6.2.
- Hiển thị 4 chỉ số chiến đấu (HP/ATK/DEF/AGI) tính bằng `shared/battle-engine.js`, kèm điểm kỹ năng thô và cấp hiển thị.
- **AccountPage.jsx**: "Ví XP" → "Sữa 🥛"; thêm Gem 💎 và Đá nguyên tố.
- **CollectionPage.jsx**: hiển thị hệ (10 hệ) + nhóm + kỹ năng nhóm (mô tả lấy từ config, không hard-code chữ).
- **DuelPage.jsx**: trước trận hiện "Hiệu quả!" / "Bất lợi" theo khắc hệ; khi phát lại hiện sát thương số nguyên, crit, né, bỏng, choáng, lá chắn, hồi máu theo `battle_log` từ server; HP bar theo kết quả server.
- Thông báo trao thưởng Gem/Đá sau khi hoàn thành bài mới.

---

## 9. Thứ tự triển khai (Phase)

**Phase 1 — Config & engine (không đổi hành vi app)**
- Tạo `shared/game-config.js` (mọi bảng mục 2–5) và `shared/battle-engine.js`: `computeStats(snapshot)`, `canEvolve(pet, wallet)`, `simulateBattle(snapA, snapB, answersA, answersB, seed)`.
- Unit test (Vitest hoặc `node --test`): ví dụ 4.4, chi phí 3.2, khắc 5.4, tương đối né/crit, Thổ giảm crit, Bầu trời 20%, choáng Lôi, lá chắn Ánh sáng, Bám rễ < 50% HP, No đủ từ chuỗi 3.

**Phase 2 — Dữ liệu pet**
- `src/data/pets.js`: thêm `element` (10 hệ mới), `group`, `evolveReq` cho 22 pet; giữ `rarity`. Mọi chỗ dùng 6 hệ cũ (`ELEMENT_COLORS`, filter, UI) chuyển sang 10 hệ.
- Thay `calculatePowerScore`.

**Phase 3 — Điểm kỹ năng**
- Mục 3.4: bỏ +5 cả 4 kỹ năng khi xong bài, bỏ XP pet thụ động, bỏ `skillXP` khỏi tính toán, rà mọi nơi gọi `addSkillPoints`.

**Phase 4 — Ledger, Gem, Đá, tiến hoá**
- Migration 6.1, API 6.2 (wallet, lesson complete, evolve), di trú 6.4, UI tiến hoá (mục 8). Khoá `evolution` phía server.

**Phase 5 — Trận đấu trên server**
- Snapshot, `simulateBattle` trên server, `battle_log`, winner theo HP, ghép trận ±1 cấp, DuelPage phát lại.

**Phase 6 — Kiểm thử cân bằng**
- Script `scripts/sim-battles.mjs`: chạy vài nghìn trận ngẫu nhiên (22 pet × cấp C1–C5 × hồ sơ điểm: vừa đủ điều kiện / +1 800 vào kỹ năng cao nhất; mỗi bên 5–9 câu đúng). Xuất CSV: tỉ lệ thắng theo hệ, nhóm, độ hiếm; độ lệch chuẩn (độ may rủi). Báo lại các điểm lệch > ±5%.

Mỗi phase: `npm run build` cho client, chạy test, mô tả PR liệt kê file đổi, giả định, và mục **[MỞ]** đã dùng mặc định.

---

## 10. Tiêu chí chấp nhận
- Ví dụ 4.4 khớp.
- Không còn đường nào tự tăng `pet.evolution` ngoài API evolve.
- Hoàn thành 1 bài mới **không** cộng điểm cho cả 4 kỹ năng; chỉ cộng theo câu đúng.
- Gem/Đá chỉ tăng qua server, không cộng trùng khi làm lại bài hay chạy lại migration.
- Duel: kết quả do server tính; client sửa dữ liệu cục bộ không đổi được kết quả trận.
- Mô phỏng (Phase 6): cùng cấp + cùng độ hiếm + mỗi bên đúng 7 câu → không hệ/nhóm nào có tỉ lệ thắng trung bình lệch quá ±5% so với 50% (nếu lệch, báo cáo, **không tự chỉnh số**).

## 11. Tham chiếu nhanh: nhịp chơi kỳ vọng (để kiểm tra cảm giác)
Giả định 0.5 Gem/bài mới, 1 đá/10 bài mới, 206 bài trong app.

| Người chơi | Học/ngày | C2 | C3 | C4 | C5 |
|---|---|---|---|---|---|
| Thường | 1 bài, ~200 Sữa | ngày 3 | ngày 10 | ngày 52 | ngày 152 |
| Chăm | 2 bài, ~350 Sữa | ngày 2 | ngày 6 | ngày 26 | ngày 78 |
| Cày | 3 bài, ~500 Sữa | ngày 2 | ngày 4 | ngày 18 | ngày 54 |

C4/C5 bị chặn chủ yếu bởi số bài mới (Gem/Đá) — đúng thiết kế.
