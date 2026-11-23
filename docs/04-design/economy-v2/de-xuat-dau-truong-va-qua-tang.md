# Đề xuất hệ thống Đấu trường và quà tặng Đấu trường — Cowdi v2

23/11/2026 · Dựa trên `lo-trinh-kiem-tien-v2.md` (Sữa là nút thắt tiến hoá, Gem dư sau pet đầu, đá khan hiếm từ pet thứ hai) và luật trận đấu v2 trong `docs/Dac-ta-chien-dau-pet-Cowdi-v2.docx`.
**Cập nhật 23/11/2026:** giảm thưởng Sữa mỗi trận và rương tuần; bỏ trần 150 Sữa/ngày (số trận có thưởng đã bị giới hạn bởi vé, mà vé đến từ việc học).

## Nguyên tắc
1. **Học mở đường vào Đấu trường.** Trận có thưởng cần **vé**, và vé chủ yếu đến từ việc học bài. Đấu tự do (không thưởng) thì không giới hạn.
2. **Đấu trường là phần cộng thêm, không thay việc học.** Sữa từ Đấu trường chiếm khoảng **10–20%** thu nhập Sữa.
3. **Thưởng đúng thứ đang khan hiếm theo giai đoạn:** Sữa (ít), mảnh đá, đồ trang trí và danh hiệu chỉ kiếm được ở Đấu trường. Gem ít, vì Gem đã dư.
4. **Không bán sức mạnh, không bán vé, không bán điểm hạng.** Tiền chỉ mua được đồ nhìn.
5. **Công bằng:** ghép trận chênh tối đa 1 cấp tiến hoá và điểm hạng gần nhau; server tính trận (luật v2).

## 1. Thể thức
- Giữ trận v2: 10 câu, mỗi câu đúng là một đòn, server tính bằng ảnh chụp chỉ số pet và RNG có seed, client phát lại.
- **Xếp hạng (có vé):** ghép theo cấp tiến hoá (±1) và điểm hạng (LP). Không đủ người thì ghép với **đối thủ luyện tập** (pet AI cùng cấp), thưởng 50%.
- **Đấu tự do:** không tốn vé, không thưởng, không tính LP.
- **Thách đấu bạn bè:** không tính LP; cả hai nhận điểm mùa (dùng cho Thẻ mùa).
- **Bảo vệ người mới:** 10 trận đầu chỉ gặp người mới hoặc đối thủ luyện tập; pet C1 chỉ gặp C1–C2.

## 2. Vé đấu (gắn với việc học)
| Nguồn | Vé |
|---|---|
| Mỗi ngày miễn phí | 3 |
| Mỗi bài học mới hoàn thành | +2 |
| Hoàn thành 100% một unit | +3 |
| Nhiệm vụ ngày "Thắng 1 trận có vé" | +1 |
| Giữ tối đa | 15 (dùng hết thì học tiếp để có thêm) |

Ước tính số trận có vé mỗi ngày: người thường (1 bài) **5 trận**, chăm (2 bài) **7**, cày (3 bài) **9**.
- **Không có trần Sữa theo ngày.**
- Câu đúng trong trận **không cộng điểm kỹ năng** (đề xuất, chờ chốt).

## 3. Bậc xếp hạng và mùa
- **Mùa đấu = 4 tuần**, trùng với mùa của Thẻ mùa học tập.
- **Điểm hạng (LP):** thắng **+20**, hoà **+5**, thua **−12**. Bậc Đồng không bị trừ. Vừa lên bậc mới được bảo vệ 3 trận.
- Chỉ trận có vé mới tính LP.

| Bậc | LP | Ước tính đạt được (thắng 50%) |
|---|---|---|
| 🥉 Đồng | 0 | Mọi người |
| 🥈 Bạc | 200 | Người thường sau ~2 tuần |
| 🥇 Vàng | 500 | Người thường cuối mùa (~560 LP) |
| 💠 Bạch kim | 900 | Người cày cuối mùa (~1 000 LP) |
| 💎 Kim cương | 1 400 | Cần học đều **và** thắng > 50% |
| 👑 Cao thủ | Top 100 Kim cương | |

- **Đầu mùa mới:** LP về 50% của LP cuối mùa trước, tối đa bằng ngưỡng Vàng.

## 4. Quà tặng Đấu trường

### 4.1 Thưởng mỗi trận có vé
| Kết quả | Sữa | Điểm mùa |
|---|---|---|
| Thắng | **8** | 10 |
| Hoà | **5** | 6 |
| Thua | **2** | 4 |

- **Không có trần Sữa theo ngày.** **Thẻ tháng ×1.5 không nhân Sữa Đấu trường.**
- Cùng một đối thủ chỉ tính thưởng tối đa 2 trận/ngày.

### 4.2 Rương tuần (theo số trận **thắng** có vé trong tuần)
| Rương | Số trận thắng | Nội dung |
|---|---|---|
| 🟫 Rương Đồng | 5 | 30 Sữa |
| ⬜ Rương Bạc | 15 | 60 Sữa + 1 Gem |
| 🟨 Rương Vàng | 30 | 100 Sữa + 2 Gem + **2 mảnh đá** |

**10 mảnh đá = 1 đá nguyên tố.**

### 4.3 Thưởng cuối mùa (theo bậc cao nhất đạt được trong mùa)
| Bậc | Gem | Mảnh đá | Vé gacha | Đồ trang trí (chỉ có ở Đấu trường) |
|---|---|---|---|---|
| 🥉 Đồng | 2 | – | – | Khung avatar Đồng của mùa |
| 🥈 Bạc | 4 | 2 | – | Khung Bạc |
| 🥇 Vàng | 6 | 4 | 1 | Khung Vàng + danh hiệu "Đấu sĩ Vàng" |
| 💠 Bạch kim | 8 | 6 | 2 | + Hào quang Đấu trường của mùa (bản thường) |
| 💎 Kim cương | 10 | 8 | 3 | + Hào quang Đấu trường bản lấp lánh |
| 👑 Cao thủ | 12 | 10 (= 1 đá) | 3 | + Nền sân đấu của mùa + danh hiệu "Cao thủ mùa X" |

- Đồ trang trí Đấu trường đổi theo từng mùa và **không bán lại**.

### 4.4 Quà tặng giữa người chơi
- **Tặng cỏ ba lá 🍀** sau trận (miễn phí, 5 lần/ngày): người nhận được +5 Sữa (tối đa 50 Sữa/ngày từ cỏ ba lá).
- **Mời bạn vào Đấu trường:** khi bạn mới đấu trận có vé đầu tiên, cả hai nhận 1 vé thêm và 50 Sữa.

### 4.5 Nhiệm vụ Đấu trường
- Ngày: "Thắng 1 trận có vé" → +1 vé.
- Tuần: "Thắng 3 trận khi đối thủ khắc hệ mình" → 1 Gem.

## 5. Tác động lên kinh tế (pet đầu tiên, thắng 50%)
| Người chơi | Trận có vé/ngày | Sữa từ Đấu trường/ngày (gồm rương) | Tỉ lệ so với Sữa từ học | Ngày lên C5: chỉ học → có Đấu trường |
|---|---|---|---|---|
| Thường | 5 | ~38 | ~19% | 135 → **~113** |
| Chăm | 7 | ~48 | ~14% | 77 → **~68** |
| Cày | 9 | ~72 | ~14% | 54 → **~47** |
| Học rất nhiều (6 bài/ngày) | 15 | ~100 | ~11% | — |

## 6. Kiếm tiền gắn với Đấu trường (không ảnh hưởng thắng thua)
| Món | Giá | Ghi chú |
|---|---|---|
| Hiệu ứng ra sân | 40 Gem (Sử thi) / 90 Gem (Huyền thoại) | Hoạt ảnh khi pet bước vào sân |
| Hiệu ứng đòn đánh theo hệ | 40 Gem | Không đổi sát thương |
| Biểu cảm trong trận (gói 4) | 20 Gem | |
| Nhánh Đấu trường trong Thẻ mùa | Có trong Thẻ mùa | |

**Không bán:** vé đấu, LP, bảo vệ bậc, mảnh đá, thêm lượt thưởng.

## 7. Ghi chú triển khai
- Vé, LP, rương, thưởng mùa lưu và tính trên server; ledger `reason = 'arena_match'`, `'arena_weekly_chest'`, `'arena_season'`, `'clover_gift'`.
- Tài nguyên `stone_shard` (mảnh đá); tự gộp 10 mảnh thành 1 đá.
- Ghép trận: hàng đợi theo cấp tiến hoá ±1 và LP ±150, nới dần sau 30 giây; quá 60 giây thì gặp đối thủ luyện tập.
- Trận bất đồng bộ: vé bị trừ khi bắt đầu trận; đối thủ không trả lời trong 24 giờ thì hoàn vé và tính thắng.
- Hằng số: `ARENA_MILK_WIN = 8`, `ARENA_MILK_DRAW = 5`, `ARENA_MILK_LOSS = 2`, không có trần ngày.

## Chỉ số theo dõi
- Số bài/ngày trước và sau khi ra mắt Đấu trường.
- Phân bố bậc cuối mùa; mục tiêu ~40% Đồng–Bạc, ~35% Vàng, ~20% Bạch kim, ~5% Kim cương trở lên.
- Tỉ lệ Sữa từ Đấu trường so với từ học (giữ 10–20%).
- Người nhận nhiều Sữa từ Đấu trường nhất mỗi tuần (phát hiện lạm dụng).
- Tỉ lệ thắng theo hệ và nhóm.

## Cần chốt
- Câu đúng trong trận có cộng điểm kỹ năng không (đề xuất: không).
- Ngưỡng LP các bậc và mức thưởng mùa.
- Đối thủ luyện tập (AI) có tính LP không (đề xuất: có, thưởng 50%).
