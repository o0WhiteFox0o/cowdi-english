# SRS-ARENA-PVP-RULES — Đặc tả Nghiệp vụ Luật Thi đấu Đấu trường (PvP)

> **Phiên bản:** 1.0 · **Ngày lập:** 2026-11-26 · **Trạng thái:** Approved (Tổng hợp chuẩn Kinh tế v2 & GĐ5)
> **Tài liệu nguồn đối chiếu:**
> - [TASK.md](../../TASK.md) (Quyết định đã chốt: D4, D9, D15, D16, D17 — ưu tiên cao nhất)
> - [SDD-ECONOMY-BATTLE-v2.1.md](../04-design/SDD-ECONOMY-BATTLE-v2.1.md) (Mục 4–5: Chỉ số & Chiến đấu)
> - [de-xuat-dau-truong-va-qua-tang.md](../04-design/economy-v2/de-xuat-dau-truong-va-qua-tang.md) (Thể thức, Vé, LP, Rương, Mùa)
> - [SRS-FRIENDS-v1.1.md](../04-design/SRS-FRIENDS-v1.1.md) (Thách đấu bạn bè giao hữu)
> - Mã nguồn thực thi: `shared/game-config.js`, `shared/battle-engine.js`, `server/utils/arena-manager.js`, `server/routes/arena.js`

---

## 1. Mục tiêu & Nguyên tắc nghiệp vụ

1. **Học mở đường vào Đấu trường:** Trận đấu có thưởng (Xếp hạng) yêu cầu **Vé đấu**, và nguồn vé chính đến từ việc học bài mới và hoàn thành unit.
2. **Đấu trường là phần cộng thêm, không thay thế việc học:** Thu nhập Sữa từ Đấu trường chỉ chiếm khoảng **10–20%** tổng thu nhập Sữa của người chơi.
3. **Công bằng tuyệt đối (Authoritative Server):**
   - Toàn bộ tính toán sát thương, kích hoạt kỹ năng, RNG (có seed) và xác định thắng/thua thực hiện trên **Server** (`simulateBattle`); Client chỉ phát lại hoạt ảnh theo `battle_log`.
   - Mọi giao dịch cộng/trừ tài nguyên (Sữa, Gem, Mảnh đá) đều đi qua `wallet_ledger` trong database transaction.
4. **Không Pay-to-Win:** Không bán vé đấu, điểm hạng (LP), bảo vệ bậc, mảnh đá hay lượt thưởng. Tiền/Gem chỉ mua vật phẩm trang trí (hiệu ứng ra sân, hiệu ứng đòn đánh, biểu cảm).

---

## 2. Phân loại Chế độ Thi đấu

Theo định hướng vận hành Đấu trường (đảm bảo luôn có đối thủ nhanh chóng và khuyến khích đấu với người thật), Đấu trường gồm **2 chức năng chính** với tỉ lệ thưởng **Máy (1) : Người (2)**:

| Chức năng | Cơ chế ghép | Vé đấu | Tính LP | Thưởng Sữa trận | Chống lạm dụng |
|---|---|---|---|---|---|
| **1. Ghép cặp (Ngẫu nhiên)** | Tìm người đang ghép trong **10–15 giây**; hết giờ tự động ghép **Máy mang tên & pet người chơi** (Ghost Bot) | Tốn **1 vé** | Người thật: **100% LP**<br>Máy (Ghost Bot): **50% LP** | Người thật: **8 / 5 / 2 Sữa**<br>Máy: **4 / 2 / 1 Sữa** *(tỉ lệ 1:2)* | Tối đa **2 trận/ngày** tính thưởng với cùng 1 đối thủ |
| **2. Mời bạn (Đấu với Người)** | Mời trực tiếp từ danh sách **Bạn bè** (100% người vs người) | Tốn **1 vé** *(hoặc giao hữu 0 vé)* | Có vé: **100% LP**<br>Giao hữu 0 vé: **0 LP** | Có vé: **8 / 5 / 2 Sữa** *(100%)*<br>Giao hữu 0 vé: **0 Sữa** | Tối đa **2 trận/ngày** tính thưởng với cùng 1 người bạn (chống cày hộ) |
| **Luyện tập (Tuỳ chọn phụ)** | Tự chọn Máy (Dễ / Trung bình / Khó) | **0 vé** | **0 LP** | **0 Sữa** (không tính rương) | Thuần luyện tập phản xạ & test pet |

### Quy tắc Bảo vệ người mới
- **10 trận đầu tiên** của tài khoản chỉ ghép với người mới khác hoặc Máy luyện tập.
- Pet **Cấp 1 (C1)** chỉ gặp đối thủ có pet **C1 hoặc C2** (tuân theo giới hạn chênh lệch ±1 cấp tiến hoá).

---

## 3. Vé đấu (Arena Tickets)

### 3.1 Nguồn cấp vé
| Nguồn | Số vé | Ghi chú |
|---|---|---|
| Miễn phí mỗi ngày | **3 vé** | Tự động cấp khi sang ngày mới |
| Hoàn thành 1 bài học mới | **+2 vé** | Chỉ tính lần đầu hoàn thành bài |
| Hoàn thành 100% một Unit | **+3 vé** | Toàn bộ bài trọn điểm + kiểm tra cuối unit 100% (D11) |
| Nhiệm vụ ngày: *"Thắng 1 trận có vé"* | **+1 vé** | Tối đa 1 lần/ngày |

### 3.2 Giới hạn tích trữ & Tiêu hao
- **Trần giữ tối đa (`MAX_CAP`):** **15 vé**. Nếu đang có ≥ 15 vé sẽ không nhận thêm cho đến khi tiêu bớt.
- **Tiêu hao:** Trừ **1 vé** cho mỗi trận Đấu Xếp hạng.
- **Trường hợp bất đồng bộ (nếu áp dụng):** Vé trừ lúc tạo/bắt đầu trận; nếu đối thủ không phản hồi trong **24 giờ**, hệ thống hoàn vé và xử thắng.

---

## 4. Luật Ghép trận (Matchmaking)

### 4.1 Chức năng 1 — Ghép cặp ngẫu nhiên (10–15 giây)
1. **Giai đoạn tìm người chơi thực (0s – 15s):**
   - **Khác người chơi:** `opponent_id != challenger_id`.
   - **Chênh lệch cấp tiến hoá pet:** Tối đa **±1 cấp** (`|evo_A - evo_B| <= 1`).
   - **Chênh lệch điểm hạng (LP):** Trong khoảng **±150 LP** (ưu tiên người có `|LP_A - LP_B|` nhỏ nhất).
   - **Chống cày/lạm dụng cùng đối thủ:** Số trận đã đấu giữa cặp `(challenger_id, opponent_id)` trong ngày hôm nay **< 2 trận** (`MAX_DAILY_REWARDED_MATCHES_PER_OPPONENT = 2`).
2. **Giai đoạn Fallback sau 10–15 giây — Máy mang tên người chơi (Ghost/Shadow Bot):**
   - Nếu sau **10–15 giây** không có người chơi thực nào đang ghép cặp phù hợp, hệ thống tự động chọn hồ sơ (tên hiển thị, ảnh chụp pet cùng cấp tiến hoá ±1 và LP tương đương) của một người chơi trong hệ thống và cho **AI điều khiển** vào đấu thay.
   - Tỉ lệ trả lời đúng của Máy: ~72%, thời gian trả lời ngẫu nhiên 2.5s – 5.5s mỗi câu.
   - Trận gặp Máy tính **tỉ lệ thưởng 1:2** so với gặp người (50% Sữa trận & 50% LP).

### 4.2 Chức năng 2 — Mời bạn (Phòng đấu đồng bộ 2 người)
- Người chơi chọn bạn từ danh sách **Bạn bè** (`/api/friends`) để gửi lời mời thách đấu trực tiếp.
- Hệ thống tạo **Phòng đấu chung (`friend-room`)** kèm bộ 10 câu hỏi chung và hiển thị thông báo lời mời theo thời gian thực trên màn hình của người được mời.
- Khi người được mời bấm **Đồng ý vào phòng**, **cả hai người chơi cùng vào chung 1 trận đấu** với cùng bộ 10 câu hỏi; server chờ cả hai trả lời xong rồi chạy `simulateBattle` bằng **đáp án thật và thời gian thật của cả hai** để phân định thắng thua.
- Nếu chọn **Đấu 1 vé**: cả hai tính **100% thưởng Sữa** (8/5/2) và **100% LP** (+20/+5/−12), giới hạn tối đa **2 trận tính thưởng/ngày** với cùng một người bạn để chống nhường điểm (win-trading).
- Nếu chọn **Đấu giao hữu (0 vé)**: không tốn vé, không giới hạn số trận, **0 LP – 0 Sữa – 0 Rương**.

---

## 5. Luật Diễn biến Trận đấu (Combat Rules v2.1 + Trigger v0.2)

### 5.1 Cấu trúc & Dữ liệu đầu vào
- **Số câu hỏi:** **10 câu** trắc nghiệm tiếng Anh mỗi trận.
- **Không cộng điểm kỹ năng học tập:** Câu trả lời đúng trong Đấu trường **không** cộng điểm kỹ năng (`listening`, `speaking`, `reading`, `writing`) cho pet (Quyết định D15).
- **Ảnh chụp chỉ số (Snapshot):** Trước khi vào trận, server chốt snapshot của cả 2 pet (`speciesId`, `evolution`, `skills`, `element`, `group`, `rarity`) để tính chỉ số chiến đấu (`HP`, `ATK`, `DEF`, `AGI`, `CRITX`). Thay đổi bên ngoài trong lúc trận diễn ra không ảnh hưởng kết quả.

### 5.2 Thứ tự xử lý trong mỗi lượt (1 câu hỏi = 1 lượt)
Mỗi câu hỏi $q \in [1..10]$ được xử lý tuần tự qua 5 bước:

1. **Chấm đáp án & Tích luỹ trạng thái:**
   - Trả lời đúng: `energy = min(5, energy + 1)`, `comboCount += 1`, `streak += 1`.
   - Trả lời sai / hết giờ: `comboCount = 0`, `streak = 0`.
2. **Đòn đánh cơ bản:**
   - **Challenger (Bên thách đấu)** đánh trước → **Opponent (Bên nhận)** đánh sau.
   - Trả lời sai → bỏ lượt đánh (`miss`).
   - Trả lời đúng → thực hiện 1 đòn tấn công theo công thức sát thương, tương khắc, né, crit và hiệu ứng hệ/nhóm (Mục 5.3).
3. **Xét kích hoạt Kỹ năng riêng của Pet (Trigger v0.2 — Quyết định D16):**
   - Áp dụng cho pet từ cấp Bé trở lên (`evolution >= 1`); pet cấp Trứng (`evolution = 0`) chưa có kỹ năng.
   - Mỗi bên kích hoạt tối đa **1 kỹ năng / lượt**, không kích hoạt nếu `hp <= 0`, đang trong thời gian hồi chiêu (`cooldownTurns > 0`), hoặc đã hết số lần dùng/trận (`uses_per_battle`).
   - **5 loại Trigger & Thứ tự ưu tiên** (khi cả 2 bên cùng kích hoạt trong 1 lượt):
     1. `energy_full` — Thanh năng lượng đầy `5/5` sau câu trả lời đúng (tối đa 1 lần/trận, dùng xong reset `energy = 0`).
     2. `low_hp` — HP pet giảm xuống `≤ 30%` lần đầu sau khi vừa nhận sát thương ở lượt hiện tại (tối đa 1 lần/trận).
     3. `combo_streak` — Trả lời đúng `3` câu liên tiếp (kích hoạt xong reset `comboCount = 0`, hồi chiêu 2 lượt).
     4. `skill_match` — Trả lời đúng câu hỏi thuộc kỹ năng sở trường của pet (`listening` / `speaking` / `reading` / `writing`, hồi chiêu 2 lượt).
     5. `fast_answer` — Trả lời đúng trong `≤ 5 giây` (`5000 ms`, hồi chiêu 2 lượt).
   - **Hàng đợi thực thi:** Các kỹ năng kích hoạt được xếp vào hàng đợi theo thứ tự ưu tiên trên và thi triển lần lượt. **Nếu pet đã về 0 HP trước khi đến lượt thi triển trong hàng đợi → kỹ năng đang chờ bị huỷ.**
4. **Giảm hồi chiêu:** Giảm `cooldownTurns` đi 1 cho cả 2 bên (nếu > 0).
5. **Tính sát thương Bỏng (`burn`) cuối lượt:** Nếu pet đang bị Bỏng, trừ sát thương bỏng theo số lượt còn lại.

### 5.3 Tóm tắt Công thức & Hiệu ứng Chiến đấu
- **Điều kiện dừng trận (`STOP_AT_ZERO = false` — Quyết định D9):** Trận đấu **luôn chạy đủ 10 câu** ngay cả khi HP một bên về 0 giữa trận (HP kẹp tối thiểu ở 0, không âm) nhằm đảm bảo công bằng cho người trả lời sau.
- **Vòng tương khắc 10 hệ:**
  - Ngũ hành: **Kim → Mộc → Thổ → Thủy → Hỏa → Kim** (khắc: `×1.2`, bị khắc: `×0.8`).
  - Đối kháng hai chiều (`×1.2` cả hai chiều): **Ánh sáng ⇄ Bóng tối**, **Phong ⇄ Lôi**.
  - Trung tính (`×1.0`): **Vô**.
- **Sát thương đòn cơ bản (làm tròn số nguyên):**
  - `DEF_hiệu_lực = DEF_thủ × (1 − ignore)` (`ignore = 0.20` nếu bên đánh thuộc nhóm Bầu trời đã mở kỹ năng nhóm).
  - `Đòn thường = round(ATK × Khắc × 100 / (100 + DEF_hiệu_lực))`
  - `Đòn crit = round(Đòn thường × CRITX)` (nếu bên thủ hệ Thổ: phần sát thương tăng thêm từ crit giảm 50%).
- **Chí mạng (Crit) & Né tránh (Dodge):**
  - Trả lời nhanh **< 3 giây (`3000 ms`)** → **chắc chắn Crit** (trừ khi đang bị **Choáng** từ hệ Lôi; đòn vẫn có thể bị né).
  - `P_né = max(0, (AGI_thủ − AGI_công) × 0.005) + né_phẳng_thủ`
  - `P_crit = max(0, (AGI_công − AGI_thủ) × 0.005) + crit_phẳng_hệ_công`
- **Hiệu ứng đặc biệt 10 hệ & 7 nhóm:** Tuân theo bảng 5.5 và 5.6 trong [SDD-ECONOMY-BATTLE-v2.1.md](../04-design/SDD-ECONOMY-BATTLE-v2.1.md). Kỹ năng nhóm chỉ mở khi pet đạt cấp tiến hoá theo độ hiếm (Thường: C2, Hiếm: C2, Sử thi: C3, Huyền thoại/Sự kiện: C1).

---

## 6. Xác định Kết quả (Thắng / Hoà / Thua)

Sau khi kết thúc đủ 10 câu hỏi, server xác định kết quả theo thứ tự ưu tiên sau:

1. **So sánh tỉ lệ % HP còn lại** (dùng phép nhân chéo `HP_A × MaxHP_B` vs `HP_B × MaxHP_A` để tránh sai số số thực):
   - Bên có **% HP còn lại cao hơn** → **Thắng**.
2. **Nếu % HP còn lại bằng nhau:**
   - So sánh **tổng thời gian trả lời 10 câu** (`totalTimeMs`): bên có **tổng thời gian ít hơn** → **Thắng**.
3. **Nếu cả % HP và tổng thời gian bằng nhau:**
   - Kết quả **Hoà (`draw`)**.

> [!NOTE]
> **Giải thích thiết kế: Vì sao đánh đủ 10 câu (không dừng ngay khi hết máu) và vẫn giữ luật Hoà?**
> 1. **Tránh bất công "ai đánh trước thắng trước":** Trong mỗi câu, bên A (người thách đấu) luôn ra đòn trước bên B. Nếu cho dừng ngay khi về 0 HP (ví dụ ở câu 8 cả A và B đều còn rất ít máu và **cả hai cùng trả lời đúng câu 8**), A đánh trước hạ B về 0 HP sẽ thắng ngay, dù B cũng trả lời đúng câu đó và đáng lẽ có thể phản công. Đánh đủ 10 câu (kẹp HP tối thiểu ở 0) giúp kết quả công bằng tuyệt đối cho cả hai bên, đồng thời giúp người chơi hoàn thành trọn vẹn 10 câu tiếng Anh.
> 2. **99,9% trận đấu vẫn phân định Thắng – Thua rõ ràng:** Dù có luật Hoà, nhưng trước khi xét Hoà, hệ thống đã so **tổng thời gian trả lời tính đến mili-giây (`totalTimeMs`)**. Ví dụ cả hai cùng về 0 HP (0% vs 0%) hoặc cùng còn 35% HP, ai trả lời nhanh hơn dù chỉ 0.1 giây vẫn thắng. Trạng thái **Hoà** chỉ là phương án dự phòng hiếm gặp khi cả hai bằng nhau từng phần trăm máu lẫn từng mili-giây.

---

## 7. Điểm hạng (LP), Bậc xếp hạng & Mùa giải

### 7.1 Biến động điểm LP (Chỉ áp dụng cho trận Xếp hạng có vé)
| Kết quả | Đấu với Người chơi thực | Đấu với AI luyện tập (50% LP — D15) |
|---|---|---|
| **Thắng** | **+20 LP** | **+10 LP** |
| **Hoà** | **+5 LP** | **+2 LP** *(code hiện tại làm tròn `+3 LP`)* |
| **Thua** | **−12 LP** | **−6 LP** |

- **Bảo vệ bậc Đồng:** Người chơi đang ở bậc **Đồng** không bị trừ LP khi thua (`LP >= 0`).
- **Bảo vệ khi lên bậc mới (theo thiết kế):** 3 trận đầu sau khi vừa thăng bậc mới không bị tụt bậc.

### 7.2 Bậc xếp hạng (6 Bậc — Quyết định D15)
| Bậc | Key | Ngưỡng LP | Ghi chú |
|---|---|---|---|
| 🥉 Đồng | `bronze` | `0` | Không bị trừ LP |
| 🥈 Bạc | `silver` | `200` | — |
| 🥇 Vàng | `gold` | `500` | — |
| 💠 Bạch kim | `platinum` | `900` | — |
| 💎 Kim cương | `diamond` | `1 400` | — |
| 👑 Cao thủ | `master` | **Top 100 Kim cương** | Code config tạm đặt ngưỡng `minLp = 2000` |

### 7.3 Chu kỳ Mùa giải
- **Thời lượng:** **4 tuần / mùa** (Mùa 0 thử nghiệm dự kiến **2 tuần**).
- **Reset đầu mùa mới:** LP đặt về **50%** LP cuối mùa trước, tối đa không vượt quá ngưỡng **Vàng (500 LP)**.

---

## 8. Phần thưởng & Quà tặng Đấu trường

### 8.1 Thưởng mỗi trận có vé (Tỉ lệ Máy 1 : Người 2)
| Kết quả | Đấu với Người chơi (100%) | Đấu với Máy / Ghost Bot (50%) | Điểm mùa (khi có Thẻ mùa) |
|---|---|---|---|
| **Thắng** | **+8 Sữa** | **+4 Sữa** | +10 |
| **Hoà** | **+5 Sữa** | **+2 Sữa** | +6 |
| **Thua** | **+2 Sữa** | **+1 Sữa** | +4 |

- **Không có trần Sữa theo ngày** cho Đấu trường.
- **Thẻ tháng ×1.5 KHÔNG nhân Sữa từ Đấu trường.**

### 8.2 Rương tuần (Theo số trận thắng có vé trong tuần — Reset Thứ Hai)
| Rương | Điều kiện | Phần thưởng |
|---|---|---|
| 🟫 Rương Đồng | **5 trận thắng** | **30 Sữa** |
| ⬜ Rương Bạc | **15 trận thắng** | **60 Sữa + 1 Gem** |
| 🟨 Rương Vàng | **30 trận thắng** | **100 Sữa + 2 Gem + 2 Mảnh đá** (`stone_shard`) |

> **Quy đổi:** `10 Mảnh đá = 1 Đá nguyên tố` (tự động gộp).

### 8.3 Thưởng cuối mùa (Theo bậc cao nhất đạt được trong mùa)
| Bậc | Gem | Mảnh đá | Vé gacha | Đồ trang trí độc quyền Đấu trường (không bán lại) |
|---|---|---|---|---|
| 🥉 Đồng | 2 | – | – | Khung avatar Đồng của mùa |
| 🥈 Bạc | 4 | 2 | – | Khung avatar Bạc của mùa |
| 🥇 Vàng | 6 | 4 | 1 | Khung Vàng + Danh hiệu *"Đấu sĩ Vàng"* |
| 💠 Bạch kim | 8 | 6 | 2 | + Hào quang Đấu trường của mùa (bản thường) |
| 💎 Kim cương | 10 | 8 | 3 | + Hào quang Đấu trường bản lấp lánh |
| 👑 Cao thủ | 12 | 10 (= 1 đá) | 3 | + Nền sân đấu của mùa + Danh hiệu *"Cao thủ mùa X"* |

### 8.4 Quà tặng & Nhiệm vụ gắn với Đấu trường
- **Tặng Cỏ ba lá 🍀 sau trận:**
  - Miễn phí cho người tặng; tối đa **5 lần tặng/ngày** và tối đa **1 lần/ngày** cho cùng một đối thủ (không tự tặng cho bản thân).
  - Người nhận được **+5 Sữa** qua ledger (`arena_clover`), tối đa **50 Sữa/ngày** từ cỏ ba lá.
- **Nhiệm vụ Đấu trường:**
  - Ngày: *"Thắng 1 trận có vé"* → **+1 Vé đấu**.
  - Tuần: *"Thắng 3 trận khi đối thủ khắc hệ mình"* → **+1 Gem**.
- **Mời bạn vào Đấu trường (theo đề xuất):** Khi bạn mới được mời hoàn thành trận có vé đầu tiên, cả hai nhận +1 vé và +50 Sữa.

---

## 9. Quy tắc Chống gian lận & Lạm dụng

1. **Giới hạn cày cùng đối thủ:** Cùng một cặp người chơi chỉ được tính thưởng và ghép trận tối đa **2 trận/ngày**.
2. **Bảo toàn dữ liệu & chống giả mạo:**
   - Client không tự tính kết quả hoặc cộng Sữa/LP.
   - Server kiểm tra quyền sở hữu pet, số dư vé, và chạy lại `simulateBattle` với `seed` lưu trong `arena_matches`.
3. **Kiểm tra thời gian trả lời:** Thời gian từng câu do client gửi lên được chuẩn hoá; giá trị âm/không hợp lệ bị loại bỏ về mặc định.

---

## 10. Ghi chú trạng thái triển khai & Đối chiếu (`feat/arena`)

1. **Đã hoàn thành trên `feat/arena` (2026-11-27):**
   - Tách rõ 3 chế độ trên giao diện: **Ghép cặp (1 vé)**, **Mời bạn đấu trực tiếp**, **Luyện tập AI (0 vé · 0 LP · 0 Sữa)** (đã bỏ mục Tạo phòng tự do / Thách đấu đang chờ cũ).
   - Ghép cặp chờ **12 giây** tìm người chơi thực; nếu có người ghép cùng → tự động vào **Phòng đấu đồng bộ 2 người**; nếu hết 12s → ghép **Ghost Bot** mang tên & pet thật của người chơi khác (thưởng 50%: 4/2/1 Sữa, +10/+2/−6 LP).
   - Phòng đấu đồng bộ 2 người (cho cả **Ghép cặp gặp người** và **Mời bạn**): đồng bộ từng câu (lock-step), phát hoạt ảnh đối thủ phản công, đứng im khi Hoà, giữ đúng cấp Trứng (`evolution = 0`), **rời trận giữa chừng bị xử thua (`forfeit`)**.
   - Trận không vé (`useTicket === false`) trả về **0 Sữa, 0 LP, 0 Rương tuần**.
2. **Các điểm nhỏ còn lại / Backlog cuối GĐ5 trên `TASK.md`:**
   - Làm tròn điểm Hoà với AI: `Math.round(5 * 0.5) = +3 LP` (tài liệu ghi `+2`).
   - Ngưỡng bậc Cao thủ: D15 chốt *"Top 100 Kim cương"*, `game-config.js` tạm đặt `minLp: 2000`.
   - Mùa 0 thử nghiệm 2 tuần, phát thưởng cuối mùa, bảo vệ người mới 10 trận đầu, bảo vệ 3 trận khi lên bậc mới, nhiệm vụ Đấu trường (Ngày +1 vé, Tuần +1 Gem).
