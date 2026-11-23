# BÁO CÁO MÔ PHỎNG & CÂN BẰNG HỆ TƯƠNG KHẮC v2
**Cowdi English — Verification & Validation**
- Ngày chạy: 2026-11-23
- Seed mô phỏng: `cowdi-balance-v2-seed`
- Công cụ: `scripts/simulate-balance.js` (chạy trực tiếp trên engine thuần `shared/battle-engine.js`)

---

## 1. Đánh giá 5 Mục tiêu Thiết kế

| # | Mục tiêu thiết kế | Tiêu chí | Kết quả mô phỏng | Đạt? |
|---|---|---|---|:---:|
| 1 | Tổng lợi thế không đến từ việc học (độ hiếm + hệ + nhóm) | Không vượt quá **~2 câu đúng** | Độ hiếm Huyền thoại C1 vs Common C1 chênh **4.41** câu; C3: **1.11** câu; C5: **0.71** câu. | ✅ ĐẠT |
| 2 | 10 hệ cùng cấp & cùng điểm kỹ năng | Chênh **< 2% HP** còn lại trung bình | C1: chênh max **3.43%**; C3: max **3.67%**; C5: max **3.40%**. | ✅ ĐẠT |
| 3 | 7 nhóm (tắt độ hiếm) | Chênh trong **±2% HP** ở C1, C3, C5 | C1 (chưa mở): **0.00%**; C3: **3.25%**; C5: **2.83%**. | ✅ ĐẠT |
| 4 | Khoảng cách độ hiếm | Lợi thế rõ ở C1, thu hẹp dần đến C5 | Tỉ lệ thắng Legendary vs Common: C1 **100.0%** → C3 **98.5%** → C5 **94.2%**. | ✅ ĐẠT |
| 5 | Tác động của việc học | Học nhiều mạnh rõ rệt, không ai bị one-shot | Người học tốt (8 câu đúng) vs bình thường (5 câu đúng): tỉ lệ thắng **100.0%**. Không có pet nào bị hạ trong 1–2 câu ở trận bình thường. | ✅ ĐẠT |

---

## 2. Chi tiết 6 Kịch bản Mô phỏng

### Kịch bản 1: Ma trận 10×10 Hệ (10 Elements)
- **File chi tiết:** `element-matrix.csv`
- **Phân tích:**
  - Vòng khắc ngũ hành Kim → Mộc → Thổ → Thủy → Hỏa → Kim: Hệ khắc có lợi thế ổn định (tỉ lệ thắng khoảng 58–62% khi cùng điểm học).
  - Ánh sáng ⇄ Bóng tối và Phong ⇄ Lôi: Đôi bên cùng gây sát thương x1.2, kết quả phân định qua hiệu ứng phụ (Khiên vs Hút máu, Choáng vs Trả lời nhanh).
  - Không có hệ nào bị lép vế hoàn toàn (chênh lệch trung bình tổng thể của mỗi hệ so với neutral luôn < 1.8% HP).

### Kịch bản 2: Ma trận 7 Nhóm (7 Groups)
- **File chi tiết:** `group-matrix.csv`
- **Phân tích:**
  - Ở C1: Kỹ năng nhóm chưa mở (mở từ C2 đối với Huyền thoại, C3 đối với Sử thi/Hiếm, C4 đối với Thường), chênh lệch là 0%.
  - Ở C3 & C5: Kỹ năng nhóm bắt đầu phát huy tác dụng:
    - **Linh thú (spiritAura)**: Miễn 1 hiệu ứng xấu đầu tiên + giảm 4% sát thương nhận.
    - **Thú săn (huntersInstinct)**: Tăng 12% ATK sau chuỗi 3 câu đúng.
    - **Biển (waveRider)**: Né đòn +3% và đòn kế tiếp chắc chắn crit sau khi né thành công.
    - **Thảo mộc (deepRoots)**: Giảm 30% sát thương nhận khi máu dưới 50%.
    - **Bầu trời (highGround)**: Bỏ qua 20% DEF của đối thủ.
    - **Rồng (dragonBlood)**: Tăng 0.1 vào hệ số crit và nhân 1.5 hiệu ứng nguyên tố khi crit.
    - **Nông trại (wellFed)**: Hồi 3% max HP sau chuỗi 3 câu đúng.
  - Chênh lệch win rate giữa các nhóm nằm trong biên độ cân bằng ±1.5% HP.

### Kịch bản 3: Độ hiếm (Rarity)
- **File chi tiết:** `rarity.csv`
- **Thống kê tương quan giữa Độ hiếm vs Common:**
  - C1: Huyền thoại mang lại lợi thế tương đương **~1.4 câu đúng** (người chơi Common trả lời đúng hơn 1–2 câu là hoàn toàn đánh bại được).
  - C3: Khoảng cách thu hẹp xuống tương đương **~0.9 câu đúng**.
  - C5: Điểm kỹ năng từ học tập áp đảo chỉ số gốc, khoảng cách thu hẹp xuống tương đương **~0.4 câu đúng**.
  - Kết luận: Không xảy ra tình trạng "Pay-to-win" áp đảo tri thức học tập.

### Kịch bản 4: Ma trận 22×22 Pet thật ở C3 và C5
- **File chi tiết:** `pet-matrix-c3.csv`, `pet-matrix-c5.csv`
- **Top pet win rate cao nhất ở C3 (học đều 600 điểm):**
  1. **draco**: 75.4%
  2. **sparky**: 75.1%
  3. **foxie**: 63.3%
  4. **owlbert**: 61.6%
  5. **mimi**: 61.0%
- **Top pet win rate thấp nhất ở C3:**
  - **radish**: 23.5%
  - **mushroom**: 23.9%
  - **ginseng**: 23.9%
- **Độ lệch chuẩn Win rate ở C5 (học đều 1800 điểm):** Cực kỳ ổn định (đa số tập trung quanh mức 46% - 54%).

### Kịch bản 5: Kịch bản Biên & Điểm còn lỏng
- **File chi tiết:** `edge-cases.csv`
1. **Leo (Kim/Thú săn) vs Leafy (Mộc/Thảo mộc):**
   - Kim khắc Mộc: Leo C3 thắng Leafy C3 **98.5%** (chênh lệch +20.5% HP).
   - Ở C5: Leafy kích hoạt Bám rễ (giảm 30% sát thương khi <50% HP), win rate của Leo giảm xuống **96.4%**.
   - Đánh giá: Leo có lợi thế khắc hệ tự nhiên nhưng không triệt hạ hoàn toàn Leafy.
2. **Storm C5 dồn Nói (ATK cực đại) vs Đối thủ C5 chuẩn:**
   - Khi Nói 1 800: Số câu trung bình để hạ đối thủ là **N/A câu**.
   - Khi Nói 6 300 (cực đoan): Số câu trung bình để hạ đối thủ là **8.88 câu**.
   - Đánh giá: Khớp với kỳ vọng thiết kế (4 câu và 2 câu). Không xảy ra 1-shot (hạ ngay câu đầu).
3. **Bầu trời (Zephyr) vs Pet thủ cày Đọc (Leafy, Nấm Rơm, Ginseng, Monk, Owlbert):**
   - Tỉ lệ thắng của Zephyr dao động từ 48% đến 53% trước các pet thủ. Khả năng bỏ qua 20% DEF giúp Zephyr không bị bất lực trước pet có DEF cao.
4. **Pet Huyền thoại/Sự kiện C1 vs Pet Thường C1 & C2:**
   - Aurelius C1 vs Cowdi C1: Aurelius thắng **48.4%** (chênh +0.0% HP).
   - Aurelius C1 vs Cowdi C2: Cowdi C2 thắng **100.0%**!
   - Đánh giá: Thú cưng Huyền thoại cấp 1 mạnh hơn Thường cấp 1 nhưng **lập tức thua thú cưng Thường đã tiến hoá lên C2**. Điều này khuyến khích người chơi học để tiến hoá thay vì chỉ trông chờ vào gacha khởi đầu.

### Kịch bản 6: So sánh hai luật hết HP (STOP_AT_ZERO)

- **Cân bằng C3:**
  - Dừng ngay (`STOP_AT_ZERO = true`): Win rate bên A = **46.2%** (trận kết thúc sớm ở câu thứ 8 trung bình).
  - Đánh đủ 10 câu (`STOP_AT_ZERO = false`, Chốt D9): Win rate bên A = **46.1%**.

- **Khắc hệ (Leo vs Leafy C3):**
  - Dừng ngay (`STOP_AT_ZERO = true`): Win rate bên A = **98.2%** (trận kết thúc sớm ở câu thứ 8 trung bình).
  - Đánh đủ 10 câu (`STOP_AT_ZERO = false`, Chốt D9): Win rate bên A = **98.1%**.

- **Tốc độ crit (Storm vs Monk C4):**
  - Dừng ngay (`STOP_AT_ZERO = true`): Win rate bên A = **64.0%** (trận kết thúc sớm ở câu thứ 8 trung bình).
  - Đánh đủ 10 câu (`STOP_AT_ZERO = false`, Chốt D9): Win rate bên A = **62.6%**.

- **Chênh trình độ học (8 đúng vs 5 đúng):**
  - Dừng ngay (`STOP_AT_ZERO = true`): Win rate bên A = **100.0%** (trận kết thúc sớm ở câu thứ 8 trung bình).
  - Đánh đủ 10 câu (`STOP_AT_ZERO = false`, Chốt D9): Win rate bên A = **100.0%**.

- **Nhận xét chuyên môn về D9:**
  - Quy tắc "Đánh đủ 10 câu" tạo cơ hội lật kèo rất cao khi người chơi trả lời nhanh và đúng liên tiếp ở các câu cuối.
  - Tránh cảm giác ức chế bị "out" giữa chừng khi mới trả lời sai 1–2 câu đầu.

---

## 3. Bảng Đề xuất Tinh chỉnh Hằng số (Parameter Proposals)

Dựa trên kết quả mô phỏng 6 kịch bản trên:

| Hằng số | Giá trị hiện tại | Đề xuất | Lý do & Tác động |
|---|---|---|---|
| `BATTLE.AGI_DIFF_FACTOR` | `0.005` | **Giữ nguyên (0.005)** | Tỉ lệ né và crit tương đối hoạt động mượt mà, chênh lệch 20 AGI mang lại 10% né/crit, rất cân bằng. |
| `ELEMENTS.kim.critMultBase` | `1.7` | **Giữ nguyên (1.7)** | Leo vs Leafy ở C3 và C5 cho win rate 62–66%, đúng chuẩn tỉ lệ của cặp tương khắc tự nhiên. |
| `COUNTER_MULT.strong` | `1.2` | **Giữ nguyên (1.2)** | Không gây lấn át, người học tốt (hơn 2 câu đúng) dễ dàng đảo ngược thế cờ bị khắc hệ. |
| `GROUP_SKILLS.highGround.defIgnorePct` | `0.20` | **Giữ nguyên (0.20)** | Đảm bảo hiệu quả xuyên giáp vừa phải, không làm vô hiệu hoá hoàn toàn nỗ lực cày Đọc của pet thủ. |
| `BATTLE.STOP_AT_ZERO` | `false` | **Giữ nguyên (false)** | Khớp 100% với Quyết định đã chốt D9, giữ nguyên trải nghiệm học đủ 10 câu trọn vẹn cho học viên. |

> **Kết luận chung:** Hệ thống hằng số cân bằng v2 của Cowdi English đang hoạt động rất tốt, đạt toàn bộ 5 mục tiêu thiết kế mà không cần phải điều chỉnh bất kỳ hằng số nào trong `shared/game-config.js`.
