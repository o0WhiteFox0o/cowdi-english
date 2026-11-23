# Đề xuất cửa hàng Cowdi v2 — Giữ nhịp, Đồ trang trí, Đá nguyên tố và giao diện

23/11/2026 · 4 vật phẩm nhóm Giữ nhịp, đồ trang trí bán trong cửa hàng, cơ chế Đá nguyên tố, và thiết kế giao diện cửa hàng (mục "Giao diện cửa hàng" ở cuối file).
Số liệu kinh tế lấy từ `docs/04-design/ECONOMY-BATTLE-V2-IMPLEMENTATION.md` (mục 2 và mục 11) và `src/data/config/units.js`, `src/data/lessons/paths.js`.
Liên quan: `lo-trinh-kiem-tien-v2.md` (mô phỏng nhịp kiếm tiền), `de-xuat-trang-tri-nen-hao-quang.md` (đồ trang trí).

## Kết luận: vật phẩm Giữ nhịp định giá bằng Sữa, không dùng Gem

| | Sữa 🥛 | Gem 💎 |
|---|---|---|
| Nguồn | Mọi hoạt động học: bài mới ~150–200/bài, làm lại 1/3, mini-game, ôn tập, duel | 1 Gem / 2 bài mới + thưởng unit (1 Gem khi xong, +2 khi đạt 100%); sau này có thể nạp tiền |
| Tốc độ | Thường ~200/ngày, chăm ~350, cày ~500 | ~190–235 Gem trong toàn bộ app |
| Chỗ tiêu | Tiến hoá: tổng 27 000/pet | Tiến hoá: tổng 76/pet; đổi đá; đồ trang trí |
| Nút thắt | **Có** — sau khi thêm Gem theo unit, Sữa quyết định ngày lên C5 | Không, dư sau pet đầu |

Lý do vẫn chọn Sữa:
1. **Sữa chỉ kiếm được bằng cách học**, nên mua đồ giữ nhịp bằng Sữa nghĩa là "học hôm nay để được bảo vệ ngày mai".
2. **Không bán đồ giữ streak bằng Gem**, vì khi Gem bán bằng tiền thật, việc này dễ thành "trả tiền thay vì học".
3. Coins sẽ bị bỏ về lâu dài, nên không định giá vật phẩm mới bằng coins.
4. Lưu ý: vì Sữa giờ là nút thắt, mỗi món giữ nhịp làm chậm tiến hoá một chút (400 Sữa ≈ 2 ngày với người thường). Không nên tăng giá cao hơn mức dưới đây.

Quy đổi tham khảo: **1 bài học mới ≈ 175 Sữa**; người chơi thường kiếm ~200 Sữa/ngày.

## 4 vật phẩm Giữ nhịp

### 1. 🧣 Khăn giữ lửa (Streak Freeze)
- **Cơ chế:** tự dùng khi người học bỏ lỡ một ngày, giữ nguyên streak. Mỗi khăn che 1 ngày.
- **Giá:** **400 Sữa** (≈ 2 ngày học của người chơi thường).
- **Giới hạn:** sở hữu tối đa 2 khăn; mua tối đa 2 khăn/tuần.
- **Tặng kèm:** mỗi lần đạt mốc streak 7, 30, 100 ngày được tặng 1 khăn (nếu chưa đủ 2) — đã chốt D13.

### 2. 🔁 Vé quay lại
- **Cơ chế:** dùng khi streak đã đứt và người học nghỉ từ 2 đến 14 ngày. Sau khi kích hoạt, học xong **2 bài trong 24 giờ** thì khôi phục **50% streak cũ**.
- **Điều kiện:** streak cũ ≥ 7 ngày.
- **Giá:** **300 Sữa**. **Giới hạn:** 1 lần mỗi 30 ngày.

### 3. 📜 Khế ước 7 ngày
- **Cơ chế:** đặt cọc Sữa, cam kết học đủ 7 ngày liên tiếp. Thành công thì nhận lại ×1.5; đứt một ngày thì mất cọc. Khăn giữ lửa **không** dùng được cho khế ước.

| Mức | Cọc | Yêu cầu mỗi ngày | Nhận lại | Lãi |
|---|---|---|---|---|
| Khởi động | 300 Sữa | 1 bài | 450 | +150 |
| Chăm chỉ | 700 Sữa | 2 bài | 1 050 | +350 |
| Bứt phá | 1 500 Sữa | 3 bài | 2 250 | +750 |

- "Bài" tính là bài học mới, hoặc bài làm lại đạt ≥ 70%. Giới hạn 1 khế ước cùng lúc.

### 4. ⏰ Đồng hồ Cowdi
- **Cơ chế:** chọn một giờ học cố định; pet gửi lời nhắc kèm một câu tiếng Anh ngắn. Bài học bắt đầu trong khoảng ±1 giờ quanh giờ đã chọn được **+10% Sữa** (tối đa 3 bài/ngày).
- **Giá:** **1 000 Sữa**, mua một lần dùng mãi. Đổi giờ miễn phí 1 lần/tuần.

## ✨ Đồ trang trí trong cửa hàng

Chi tiết từng món, hình ảnh và nơi hiển thị: `de-xuat-trang-tri-nen-hao-quang.md`. Phần này chỉ liệt kê những gì **xuất hiện trong cửa hàng** và cách bán. Làm ở **GĐ4**.

### Đồ cũ (theo D12)
| Đồ cũ | Xử lý |
|---|---|
| Mũ (6 món), Trang phục (5 món) | **Không bán nữa.** Ai đã mua vẫn giữ, nằm trong tab **Kho đồ** để trang bị/tháo |
| Phòng (5 món) | Thành **Nền**, xếp bậc lại (bảng dưới). Ai đã mua giữ nguyên |
| Hiệu ứng (5 món) | Thành **Hào quang**, xếp bậc lại (bảng dưới). Ai đã mua giữ nguyên |
| Đồ ăn (5 món), Hộp trứng quà tặng | Đã bỏ |

### Bậc và giá
| Bậc | Chấm màu | Bán bằng | Giá |
|---|---|---|---|
| Thường | ⚪ xám | Sữa | 800 Sữa |
| Hiếm | 🔵 xanh dương | Sữa | 2 000 Sữa |
| Sử thi | 🟣 tím | Gem | 40 Gem |
| Huyền thoại | 🟡 vàng | Gem | 90 Gem |
| Mốc học | 🟢 xanh lá | **Không bán** — tự mở khi đạt mốc | Miễn phí |
| Mùa | 🟠 cam | Chỉ có trong Thẻ mùa / Đấu trường | — |

Mua nền và hào quang cùng chủ đề: giảm 20%.

### Danh mục bán trong cửa hàng
**🖼️ Nền (19)**

| Nền | Bậc | Giá / điều kiện |
|---|---|---|
| 🌲 Rừng xanh | Thường | 800 Sữa |
| 🏖️ Bãi biển | Thường | 800 Sữa |
| 🚀 Vũ trụ | Hiếm | 2 000 Sữa |
| 10 nền theo hệ: 🌋 Núi lửa · 🌊 Đáy biển · 🎋 Rừng trúc · ⚙️ Mỏ vàng · 🪨 Hang đá · ☀️ Đền ánh sáng · 🌑 Rừng đêm · 🌪️ Đỉnh mây · ⚡ Mây giông · 🥋 Võ đài | Hiếm | 2 000 Sữa; chỉ hiện nút mua khi có ít nhất 1 pet thuộc hệ đó |
| 🏰 Lâu đài | Sử thi | 40 Gem |
| 🌸 Vườn anh đào | Sử thi | 40 Gem |
| 🌌 Cực quang | Huyền thoại | 90 Gem |
| ☁️ Thiên đình | Huyền thoại | 90 Gem |
| 📚 Phòng học theo trình độ (thay Thư viện) | Mốc học | Tự mở theo cấp lộ trình A1 → C2 |
| 🛶 Chợ nổi | Mùa | Thẻ mùa |

**✨ Hào quang (15)**

| Hào quang | Bậc | Giá / điều kiện |
|---|---|---|
| 🍃 Lá rơi · 🫧 Bong bóng | Thường | 800 Sữa |
| ❄️ Tuyết rơi · ✨ Sao sáng · 🔥 Ngọn lửa | Hiếm | 2 000 Sữa |
| 🌸 Cánh hoa anh đào · 🪲 Đom đóm | Sử thi | 40 Gem |
| 🐉 Rồng vàng · 🌀 Thiên hà xoay | Huyền thoại | 90 Gem |
| 🔥 Lửa streak | Mốc học | Streak ≥ 7 (đổi màu ở 30/100/365) |
| 🎧 Sóng âm · 🎵 Nốt nhạc · 🔤 Chữ bay · 🖋️ Mực vẽ | Mốc học | Kỹ năng Nghe/Nói/Đọc/Viết của pet ≥ 600 (vàng ở 1 800) |
| 🌈 Toàn năng | Mốc học | Cả 4 kỹ năng ≥ 1 800 |

- Đồ **Mốc học** vẫn hiện trong cửa hàng (để người học thấy mục tiêu), ở trạng thái khoá kèm thanh tiến độ, ví dụ "🎧 Nghe 320 / 600".
- Hào quang kỹ năng gắn với từng pet.
- Còn chờ chốt: đồ Thường/Hiếm giữ giá Sữa hay chuyển sang Gem (Sữa đang là nút thắt tiến hoá). Đề xuất: **giữ Sữa** — đây là lựa chọn "tiến hoá chậm hơn một chút để có đồ đẹp", và tạo chỗ tiêu Sữa cho người đã lên C5.

## 💠 Đá nguyên tố và Gem theo unit (chốt 23/11/2026)

### Quyết định
1. **Đá:** giữ nguồn **1 đá / 10 bài mới** (~20 đá trong toàn app).
2. **Đổi Gem lấy đá:** **15 Gem / 1 đá**, tối đa **1 đá/tuần**. Không bán đá bằng Sữa, coins hay tiền thật trực tiếp.
3. **Gem theo unit:** hoàn thành unit (qua bài kiểm tra cuối unit ≥ 70%) → **+1 Gem**; hoàn thành **100%** unit → **+2 Gem nữa**.

### Định nghĩa đề xuất
- **Hoàn thành 100%:** mọi bài trong unit đạt trọn điểm **và** bài kiểm tra cuối unit đạt 100%. Được làm lại để đạt 100%, nhưng mỗi unit chỉ nhận thưởng 100% **một lần**.
- Gem theo unit do server cấp, ghi ledger `reason = 'unit_complete'` / `'unit_perfect'`, không cộng lại khi làm lại.

### Tác động (chi tiết trong `lo-trinh-kiem-tien-v2.md`)
- Gem gần gấp đôi → C4 đến sớm hơn 4–17 ngày; C5 vẫn do Sữa quyết định.
- Pet đầu dùng 11 / ~20 đá; từ pet thứ hai, **đổi Gem lấy đá là đường chính**, bị giới hạn 1/tuần nên vẫn phải học (và chờ).
- 15 Gem ≈ 15–30 bài học mới, hoặc khoảng 7 000 đ nếu nạp.

### Nếu tách đá theo 10 hệ
- Đá theo hệ của pet đang học cùng.
- Bàn đổi đá: 2 đá hệ bất kỳ → 1 đá hệ tuỳ chọn, miễn phí, tối đa 2 lần/tuần.
- Đổi Gem lấy đá: 15 Gem / 1 đá hệ tuỳ chọn, vẫn 1/tuần.

## Tổng quan giá

| Vật phẩm | Giá | Ghi chú |
|---|---|---|
| Khăn giữ lửa | 400 Sữa | ≈ 2 ngày học |
| Vé quay lại | 300 Sữa | ≈ 1,5 ngày học |
| Khế ước 7 ngày | Cọc 300 / 700 / 1 500 Sữa | Hoàn ×1.5 nếu thành công |
| Đồng hồ Cowdi | 1 000 Sữa | ≈ 5 ngày học |
| Đổi Gem lấy đá | 15 Gem / viên, 1/tuần | |

## Ghi chú triển khai
- Mua và hoàn Sữa, đổi đá, thưởng unit đều đi qua **ledger trên server** (`reason = 'shop'`, `'contract_deposit'`, `'contract_payout'`, `'stone_exchange'`, `'unit_complete'`, `'unit_perfect'`).
- Cần thêm vào hướng dẫn triển khai: `GEM_PER_UNIT = 1`, `GEM_PER_UNIT_PERFECT = 2`, `GEM_PER_STONE = 15`, `STONE_EXCHANGE_PER_WEEK = 1` (giữ `STONE_PER_NEW_LESSONS = 10`, `GEM_PER_NEW_LESSONS = 2`). Migration cộng Gem theo unit đã hoàn thành.
- Streak, khăn, khế ước tính trên server theo múi giờ của người dùng.
- Lời nhắc của Đồng hồ Cowdi dùng `usePush` hiện có.

## Chỉ số theo dõi
- Tỉ lệ giữ streak 7/30 ngày của người có khăn so với người không có.
- Tỉ lệ người dùng Vé quay lại học tiếp ít nhất 7 ngày sau đó.
- Tỉ lệ hoàn thành khế ước theo từng mức; nếu một mức < 40% thì hạ yêu cầu bài/ngày.
- Tỉ lệ unit đạt 100% và số lần làm lại để đạt 100%.
- Số đá đổi từ Gem mỗi tuần.

## Cần chốt
- Có tặng khăn miễn phí ở các mốc streak 7/30/100 không.
- Đá dùng chung hay tách theo 10 hệ.
