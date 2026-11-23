# Lộ trình kiếm tiền Cowdi v2 (mô phỏng)

23/11/2026 · Mô phỏng nhịp kiếm Sữa, Gem, Đá và thời điểm tiến hoá sau khi thêm thưởng Gem theo unit, kèm các điểm bán hàng theo vòng đời người chơi.
**Lưu ý:** bảng dưới chưa tính Sữa từ Đấu trường (làm C5 của người thường sớm hơn, ~113 ngày — xem `de-xuat-dau-truong-va-qua-tang.md`) và giá gacha mới (50 Gem/vé — xem `de-xuat-gacha-v2.md`).

## Quy tắc đã chốt dùng trong mô phỏng
| Tài nguyên | Nguồn |
|---|---|
| 🥛 Sữa | Như hiện tại: thường ~200/ngày (1 bài), chăm ~350 (2 bài), cày ~500 (3 bài) |
| 💎 Gem | 1 Gem / 2 bài mới **+ 1 Gem khi hoàn thành unit + 2 Gem nữa khi hoàn thành 100% unit** |
| 💠 Đá | 1 đá / 10 bài mới (giữ nguyên) **+ đổi 15 Gem lấy 1 đá, tối đa 1 viên/tuần** |
| Tiến hoá | C1→C2: 500 Sữa · C2→C3: 1 500 Sữa + 1 Gem · C3→C4: 5 000 Sữa + 25 Gem + 1 đá · C4→C5: 20 000 Sữa + 50 Gem + 10 đá |

Giả định: lộ trình thật trong code (44 unit, 171 bài, trung bình 3,9 bài/unit; tổng 206 bài). Tỉ lệ unit đạt 100%: thường 30%, chăm 50%, cày 70%. Người chơi tiến hoá ngay khi đủ, đổi đá khi đá là thứ còn thiếu. **Chưa tính điều kiện điểm kỹ năng** từng pet (có thể làm chậm thêm C4–C5).

## 1. Thời điểm tiến hoá pet đầu tiên (ngày)
| Người chơi | Quy tắc cũ | Có Gem theo unit | + Thẻ tháng Sữa ×1.5 |
|---|---|---|---|
| Thường (1 bài/ngày) | C2: 3 · C3: 10 · C4: 52 · C5: 152 | C2: 3 · C3: 10 · **C4: 35** · C5: 135 | C2: 2 · C3: 7 · C4: 32 · **C5: 100** |
| Chăm (2 bài/ngày) | 2 · 6 · 26 · 78 | 2 · 6 · **20** · 78 | 1 · 4 · 14 · **52** |
| Cày (3 bài/ngày) | 1 · 4 · 18 · 54 | 1 · 4 · **14** · 54 | 1 · 3 · 10 · **36** |

Nạp thêm Gem (ví dụ 45 Gem/tuần) **không thay đổi** các mốc trên.

## 2. Tích luỹ (chưa trừ chi tiêu)
| Người chơi | Ngày 7 | Ngày 30 | Ngày 60 | Ngày 90 | Ngày 135 |
|---|---|---|---|---|---|
| Thường | 7 bài · 6 Gem · 0 đá · 1 400 Sữa | 30 · 25 · 3 · 6 000 | 60 · 50 · 6 · 12 000 | 90 · 88 · 9 · 18 000 | 135 · 129 · 13 · 27 000 |
| Chăm | 14 · 11 · 1 · 2 450 | 60 · 56 · 6 · 10 500 | 120 · 134 · 12 · 21 000 | 180 · 190 · 18 · 31 500 | 206 · 203 · 20 · 47 250 |
| Cày | 21 · 18 · 2 · 3 500 | 90 · 102 · 9 · 15 000 | 180 · 198 · 18 · 30 000 | 206 · 211 · 20 · 45 000 | (học hết) |

Tổng trong app: Gem khoảng **190–235** (tuỳ tỉ lệ 100%), Đá **~20**.

## 3. Nhận xét
1. **Gem không còn là nút thắt; Sữa thành nút thắt cho mọi người.** C5 của người thường = 27 000 Sữa ÷ 200/ngày = ngày 135. Thưởng Gem theo unit làm C4 đến sớm hơn 4–17 ngày, C5 gần như không đổi.
2. **Gem dư sau pet đầu tiên:** người thường dư ~50 Gem ở ngày 135, người chăm/cày dư 120–130 Gem khi học hết. Chỗ tiêu Gem dư: đồ trang trí, gacha và đổi đá.
3. **Đá là nút thắt cho pet thứ hai.** Cả app chỉ có ~20 đá, pet đầu dùng 11, còn ~9 → **đổi Gem lấy đá (1/tuần) là đường chính để nuôi thêm pet lên C5.**
4. **Nạp Gem không mua được tốc độ tiến hoá pet đầu** (vì Sữa chặn).
5. **Thẻ tháng Sữa ×1.5 là món trả tiền có giá trị nhất:** rút C5 từ 135 → 100 ngày (thường), 78 → 52 (chăm). Vẫn phải học mới có Sữa để nhân.
6. **Vật phẩm Giữ nhịp giá Sữa cạnh tranh với tiến hoá:** 400 Sữa ≈ chậm C5 2 ngày với người thường. Không nên tăng giá thêm.

## 4. Lộ trình bán hàng theo vòng đời người chơi (người chơi thường)
| Giai đoạn | Người chơi đang làm gì | Tài nguyên | Nên bán gì | Không nên |
|---|---|---|---|---|
| **Ngày 1–7** | Lên C2–C3, làm quen | Sữa ít, Gem 6 | Không bán gì. Tặng 1 khăn giữ lửa khi streak 7 ngày | Hiện quảng cáo nạp tiền |
| **Ngày 8–35** | Gom 5 000 Sữa + 25 Gem lên C4 | Sữa là thứ thiếu | **Thẻ tháng ×1.5** (ngay sau khi lên C3). Khăn giữ lửa, khế ước 7 ngày bằng Sữa | Gói Gem |
| **Ngày 35–135** | Gom 20 000 Sữa lên C5; Gem bắt đầu dư | Sữa thiếu, Gem dư dần | **Thẻ mùa học tập**, gia hạn thẻ tháng, đồ trang trí bằng Gem dư | — |
| **Sau C5 pet đầu** | Khoe pet, đấu trường, nuôi pet thứ 2 | Gem dư, đá thiếu | **Gói Gem** (đổi đá 1/tuần, đồ Huyền thoại, gacha), thẻ mùa | Bán đá trực tiếp |

## 5. Hai món trả tiền đã chọn (giá đề xuất, chưa thiết kế chi tiết)
| Món | Giá | Nội dung |
|---|---|---|
| **Thẻ tháng Sữa** | 29 000 đ / 30 ngày | ×1.5 Sữa từ mọi hoạt động học (không nhân Sữa Đấu trường); +1 khăn giữ lửa mỗi tuần (vẫn tối đa giữ 2) |
| **Thẻ mùa học tập** | 49 000 đ / mùa 4 tuần | 30 tầng thưởng; tầng miễn phí cho mọi người, tầng trả tiền mở thêm Sữa, Gem, vé gacha, 1 nền + 1 hào quang của mùa. Mỗi tầng mở bằng điểm mùa từ việc học và Đấu trường |

## Cần chốt
- Tỉ lệ unit 100% giả định (30/50/70%) có hợp lý với dữ liệu thật không.
- Giá thẻ tháng, thẻ mùa và gói Gem.
