# Quy trình và thứ tự triển khai — Kinh tế, Cửa hàng, Đấu trường, Gacha (Cowdi v2)

23/11/2026 · Gom các chức năng đã bàn trong phiên 23/11/2026 thành thứ tự làm việc. Mỗi giai đoạn chỉ bắt đầu khi giai đoạn nó phụ thuộc đã xong.

## Tài liệu nguồn
| Tài liệu | Dùng cho |
|---|---|
| `TASK.md` (gốc repo) | **Tiến độ, quyết định đã chốt, nhật ký** |
| `docs/04-design/ECONOMY-BATTLE-V2-IMPLEMENTATION.md` | **Nguồn sự thật cho code** (chỉ số pet, tiến hoá, ledger, trận đấu) |
| `docs/Dac-ta-chien-dau-pet-Cowdi-v2.docx` | Đặc tả trận đấu, 10 hệ, 7 nhóm, độ hiếm |
| `docs/04-design/economy-v2/lenh-claude-code-2-can-bang-he-tuong-khac.md` | Lệnh cho giai đoạn 2 |
| `docs/04-design/economy-v2/de-xuat-vat-pham-cua-hang-v2.md` | Giữ nhịp, Gem theo unit, đổi Gem lấy đá |
| `docs/04-design/economy-v2/lo-trinh-kiem-tien-v2.md` | Nhịp kiếm tài nguyên, lộ trình bán hàng |
| `docs/04-design/economy-v2/de-xuat-trang-tri-nen-hao-quang.md` | Nền, hào quang, gói Gem |
| `docs/04-design/economy-v2/de-xuat-dau-truong-va-qua-tang.md` | Đấu trường |
| `docs/04-design/economy-v2/de-xuat-gacha-v2.md` | Gacha, thẻ tặng, thiệp mời, quay pet khởi đầu |
| `docs/01-project-management/PROMPT-CLAUDE-CODE-KINH-TE-V2.md` | Prompt cho Claude Code và cách sử dụng |

Thứ tự ưu tiên khi tài liệu khác nhau: `TASK.md` (Quyết định đã chốt) → hướng dẫn triển khai → `economy-v2/` → đặc tả .docx.

## Sơ đồ phụ thuộc

```
GĐ0 Chuẩn bị tài liệu & chốt
  └─► GĐ1 Nền tảng v2: ledger, chỉ số, tiến hoá, trận đấu server, Gem theo unit, đổi đá
        ├─► GĐ2 Mô phỏng cân bằng ───────────────┐
        ├─► GĐ3 Cửa hàng Giữ nhịp (streak server) │
        ├─► GĐ4 Hệ thống đồ trang trí ───────────┤
        │                                         ▼
        │                                  GĐ5 Đấu trường
        ├─► GĐ6 Lõi gacha + thiệp mời mới + quay pet khởi đầu
        │         └─► GĐ7 Gacha đầy đủ: banner, thẻ tặng, Bụi sao
        └─► GĐ8 Thanh toán: gói Gem, Thẻ tháng, Thẻ mùa (cần thiết kế Thẻ mùa trước)
GĐ9 Theo dõi chỉ số & điều chỉnh (chạy liên tục từ GĐ3)
```

Có thể làm song song: GĐ2, GĐ3, GĐ4 sau GĐ1. GĐ6 có thể làm song song với GĐ5.

---

## Giai đoạn 0 — Chuẩn bị tài liệu và chốt quyết định
**Mục tiêu:** Claude Code có đủ tài liệu trong repo; không còn điểm mở chặn giai đoạn 1.

**Việc cần làm**
1. ~~Chép các file đề xuất vào `docs/04-design/economy-v2/`~~ (đã làm 23/11/2026). Cập nhật `DOCUMENT-REGISTER.md`.
2. **Cập nhật `ECONOMY-BATTLE-V2-IMPLEMENTATION.md`** (nguồn sự thật) với quyết định mới:
   - Gem theo unit: `GEM_PER_UNIT = 1`, `GEM_PER_UNIT_PERFECT = 2`.
   - Đổi Gem lấy đá: `GEM_PER_STONE = 15`, `STONE_EXCHANGE_PER_WEEK = 1`.
   - Tài nguyên mới `stone_shard` (10 mảnh = 1 đá).
   - Sửa mục 7 "Shop tạm gác" → trỏ sang các giai đoạn ở tài liệu này.
3. Kiểm tra hướng dẫn triển khai khớp với mục "Quyết định đã chốt" trong `TASK.md`.
4. Chốt các điểm chặn giai đoạn 1:
   - Pet hết HP giữa trận: dừng ngay hay đánh đủ 10 câu.
   - Đá dùng chung hay tách theo 10 hệ.
   - Định nghĩa "hoàn thành 100% unit".

**Xong khi:** tài liệu trong repo phản ánh đúng mọi quyết định đã chốt; các điểm chặn giai đoạn 1 đã ghi vào `TASK.md`.

---

## Giai đoạn 1 — Nền tảng kinh tế và trận đấu v2
**Làm theo:** `ECONOMY-BATTLE-V2-IMPLEMENTATION.md` (các phase trong đó) + mục "Quyết định đã chốt" trong `TASK.md`.

**Việc chính**
- Ledger trên server cho `milk`, `gem`, `stone`, `stone_shard`; `GET /api/wallet`.
- Chỉ số pet theo điểm kỹ năng (căn bậc hai), 10 hệ, 7 nhóm, độ hiếm.
- Tiến hoá thủ công qua API (trừ Sữa/Gem/Đá trong transaction).
- Gem/Đá cấp trên server khi hoàn thành bài mới; **Gem theo unit**; **đổi Gem lấy đá 1/tuần**.
- Engine trận đấu tính trên server, thắng thua theo HP; client chỉ phát lại.
- Migration dữ liệu người dùng cũ.

**Phụ thuộc:** GĐ0.
**Xong khi:** test Leafy C4 đúng số; Gem/Đá không cộng trùng khi làm lại bài; client sửa dữ liệu không đổi được kết quả trận; build thành công.

---

## Giai đoạn 2 — Mô phỏng cân bằng
**Làm theo:** `docs/04-design/economy-v2/lenh-claude-code-2-can-bang-he-tuong-khac.md`.

**Việc chính:** script `scripts/simulate-balance.js` gọi engine thật; ma trận 10 hệ, 7 nhóm, độ hiếm, 22 pet; các điểm còn lỏng (Leo–Leafy, Storm cày Nói, Bầu trời…); báo cáo và đề xuất chỉnh hằng số.

**Phụ thuộc:** GĐ1 (engine).
**Xong khi:** báo cáo `BALANCE-REPORT-v2.md` có; đã duyệt chỉnh số; cập nhật bảng cân bằng trên claude.ai.
**Vì sao trước Đấu trường:** Đấu trường có xếp hạng và thưởng; mất cân bằng lúc này sẽ ảnh hưởng thẳng tới phần thưởng.

---

## Giai đoạn 3 — Cửa hàng Giữ nhịp
**Tài liệu:** `de-xuat-vat-pham-cua-hang-v2.md`.

**Việc chính**
1. Chuyển tính streak lên server theo múi giờ người dùng.
2. 4 vật phẩm: Khăn giữ lửa (400 Sữa), Vé quay lại (300), Khế ước 7 ngày (cọc 300/700/1 500), Đồng hồ Cowdi (1 000).
3. Trang cửa hàng mới (tab Giữ nhịp); mua qua ledger.
4. Quyết định số phận coins và đồ cũ (mũ, áo, phòng, hiệu ứng, đồ ăn, `gift_egg`).

**Phụ thuộc:** GĐ1 (ledger, ví Sữa).
**Cần chốt trước:** tặng khăn ở mốc streak 7/30/100; xử lý coins và đồ cũ.
**Xong khi:** mua/hoàn Sữa đúng qua ledger; khăn tự dùng khi lỡ 1 ngày; khế ước hoàn ×1.5 đúng hạn.

---

## Giai đoạn 4 — Hệ thống đồ trang trí
**Tài liệu:** `de-xuat-trang-tri-nen-hao-quang.md`.

**Việc chính**
1. Bảng `owned_cosmetics` trên server; 6 bậc (Thường, Hiếm, Sử thi, Huyền thoại, Mốc học, Mùa).
2. Xếp lại bậc cho nền và hiệu ứng cũ; giữ đồ người dùng đã mua.
3. Đồ mốc học tự cấp: Lửa streak, 4 hào quang kỹ năng, Toàn năng, Phòng học theo trình độ.
4. Hiển thị ở trang pet, Đấu trường, bảng xếp hạng, thẻ chia sẻ.
5. Thêm chỗ cho khung avatar và danh hiệu (Đấu trường dùng).

**Phụ thuộc:** GĐ1.
**Cần chốt trước:** đồ trang trí bán bằng Sữa hay chuyển sang Gem (vì Sữa là nút thắt tiến hoá).
**Xong khi:** trang bị/tháo được trên mọi nơi hiển thị; đồ mốc học tự mở khi đạt điều kiện.
**Vì sao trước Đấu trường và Gacha:** thưởng mùa Đấu trường và bể gacha đều chứa đồ trang trí.

---

## Giai đoạn 5 — Đấu trường
**Tài liệu:** `de-xuat-dau-truong-va-qua-tang.md`.

**Việc chính**
1. Vé đấu gắn với học (3/ngày + 2/bài mới + 3/unit 100% + nhiệm vụ).
2. Ghép trận theo cấp ±1 và LP; đối thủ luyện tập (AI) khi thiếu người; bảo vệ người mới.
3. LP, 6 bậc, mùa 4 tuần, reset mềm.
4. Thưởng trận (8/5/2 Sữa, không trần), rương tuần, thưởng mùa (Gem, mảnh đá, đồ trang trí mùa).
5. Cỏ ba lá, mời bạn vào Đấu trường, nhiệm vụ Đấu trường.
6. Chống lạm dụng: tối đa 2 trận tính thưởng/ngày với cùng đối thủ.

**Phụ thuộc:** GĐ1 (engine server), GĐ2 (cân bằng), GĐ4 (đồ trang trí).
**Cần chốt trước:** câu đúng trong trận có cộng điểm kỹ năng không; đối thủ AI có tính LP không; ngưỡng LP.
**Ra mắt gợi ý:** mùa 0 (2 tuần, thưởng nhỏ) để đo tỉ lệ thắng và phân bố bậc, rồi mới mở mùa 1.

---

## Giai đoạn 6 — Lõi gacha, thiệp mời mới, quay pet khởi đầu
**Tài liệu:** `de-xuat-gacha-v2.md` (mục 1–3).

**Việc chính**
1. **Sửa `ensureInitialPet()`** trong `src/hooks/usePet.jsx`: chỉ tạo Cowdi khi tự đăng ký hoặc chọn Cowdi. Rà mọi chỗ mặc định `activePetId = 'cowdi_1'`.
2. Lõi gacha trên server: RNG an toàn, tỉ lệ theo config, lịch sử 100 lượt, công khai tỉ lệ.
3. Thiệp mời chỉ cho người mới; màn chọn **Cowdi** hoặc **quay pet khởi đầu** (bể 21 pet, 50/30/13/5/2).
4. Bảng `invites`: thêm `starter_choice`, `starter_species`, `gift_card_id`.

**Phụ thuộc:** GĐ1 (ledger).
**Cần chốt trước:** tỉ lệ bể khởi đầu.
**Xong khi:** người mới qua thiệp nhận đúng pet theo lựa chọn; không có Cowdi bị tạo nhầm; tài khoản cũ không nhận được thiệp.

---

## Giai đoạn 7 — Gacha đầy đủ
**Tài liệu:** `de-xuat-gacha-v2.md` (mục 2, 4, 5).

**Việc chính**
1. Vé gacha 50 Gem, mua lẻ; nguồn vé miễn phí (nhiệm vụ tuần, lộ trình, Đấu trường).
2. Bể gacha thường (67/22/8/3), không bảo hiểm.
3. Banner 3 tuần; pet giới hạn đầu tiên; nhiệm vụ sự kiện 15 bài (đường miễn phí).
4. Thẻ tặng pet qua `InviteSheet`; thưởng người tặng 3 Gem; giới hạn 3 thẻ/tháng.
5. Bụi sao và cửa hàng Bụi sao.

**Phụ thuộc:** GĐ4 (đồ trang trí cho bể), GĐ6 (lõi gacha, thiệp mời).
**Cần chốt trước:** tỉ lệ Giới hạn 3% hay 5%; thiết kế và ảnh pet giới hạn đầu tiên (hệ, nhóm, 8 mức điểm kỹ năng, 5 ảnh tiến hoá); đường lấy lại pet giới hạn mùa cũ cho người chơi cũ.
**Xong khi:** quay đúng tỉ lệ (kiểm bằng mô phỏng 100 000 lượt); thẻ tặng chỉ người mới nhận được.

---

## Giai đoạn 8 — Thanh toán và gói trả phí
**Việc chính**
1. **Thiết kế chi tiết Thẻ mùa học tập** (30 tầng, điểm mùa, tầng miễn phí/trả tiền) và **Thẻ tháng Sữa ×1.5** — chưa có tài liệu.
2. Chốt gói Gem (đề xuất 10k = 20 · 20k = 45 · 50k = 120 · 100k = 260 Gem).
3. Tích hợp cổng thanh toán; ledger `reason = 'purchase'`; hoàn tiền; chống gian lận.
4. **Giới hạn chi tiêu theo tháng cho tài khoản nhỏ tuổi.**
5. Công khai tỉ lệ gacha và điều khoản mua.

**Phụ thuộc:** GĐ1 (ledger), GĐ3–GĐ7 (có thứ để bán).
**Vì sao làm cuối:** mọi món trả tiền cần các hệ thống khác chạy ổn trước; không nên nhận tiền khi kinh tế chưa cân bằng.

---

## Giai đoạn 9 — Theo dõi và điều chỉnh (liên tục)
| Chỉ số | Ngưỡng cần xử lý |
|---|---|
| Thời gian học thật mỗi bài | Chỉnh giá vé gacha "12 giờ" |
| Tỉ lệ unit đạt 100% | Chỉnh giả định 30/50/70% và mô phỏng lại |
| Sữa từ Đấu trường / Sữa từ học | Ngoài 10–20% |
| Hoàn thành khế ước theo mức | < 40% thì hạ yêu cầu |
| Phân bố bậc cuối mùa | Lệch xa mục tiêu 40/35/20/5 |
| Số lượt trước khi trúng pet giới hạn | Nhiều người > 50 lượt chưa trúng → tăng tỉ lệ |
| Giữ chân ngày 7: người chọn Cowdi vs quay pet | |

---

## Bảng tổng hợp
| GĐ | Nội dung | Phụ thuộc | Quy mô ước tính | Điểm cần chốt trước |
|---|---|---|---|---|
| 0 | Tài liệu & chốt | — | Nhỏ | HP hết giữa trận, đá chung/tách hệ, định nghĩa 100% unit |
| 1 | Nền tảng v2 | 0 | Lớn | — |
| 2 | Mô phỏng cân bằng | 1 | Vừa | — |
| 3 | Cửa hàng Giữ nhịp | 1 | Vừa | Khăn tặng mốc streak; coins & đồ cũ |
| 4 | Đồ trang trí | 1 | Vừa | Giá Sữa hay Gem |
| 5 | Đấu trường | 1, 2, 4 | Lớn | Điểm kỹ năng trong trận; LP với AI |
| 6 | Lõi gacha + thiệp mời | 1 | Vừa | Tỉ lệ bể khởi đầu |
| 7 | Gacha đầy đủ | 4, 6 | Vừa | Tỉ lệ 3%/5%; pet giới hạn đầu; pet mùa cũ |
| 8 | Thanh toán | 1, 3–7 | Lớn | Thiết kế Thẻ mùa/Thẻ tháng; gói Gem; giới hạn chi tiêu |
| 9 | Theo dõi | 3+ | Liên tục | — |

## Quy tắc chung khi triển khai
- Mỗi giai đoạn một nhánh `feat/<tên>`; commit theo quy ước `type(scope): message`.
- Mọi tài nguyên đi qua ledger trên server; client không tự cộng/trừ.
- Hằng số cân bằng đặt trong một file config dùng chung, không hard-code.
- Mỗi giai đoạn cập nhật SRS, thiết kế, test case, traceability (theo `CODING-STANDARDS.md`).
- Tính năng mới bật bằng cờ (feature flag) để có thể tắt nhanh nếu lỗi.
- Không push, không deploy khi chưa duyệt.
