# Đề xuất Gacha và Vé gacha — Cowdi v2

23/11/2026 · Thay thiết kế gacha cũ (vé = 160 Sữa, 1 Gem = 3 Sữa, pity 50). Dựa trên `lo-trinh-kiem-tien-v2.md`, `de-xuat-dau-truong-va-qua-tang.md`, `de-xuat-trang-tri-nen-hao-quang.md`, `docs/04-design/INVITE-FEATURE-DESIGN.md`.

**Chốt 23/11/2026:**
- Không có bản lấp lánh. Pet giới hạn trùng → **Thẻ tặng pet**.
- **Thiệp mời chỉ dành cho người mới** (tài khoản đã có không nhận thiệp mời nữa, kể cả thiệp kèm thẻ tặng).
- Người mới vào qua **thiệp mời thường** được chọn: **nhận Cowdi** hoặc **quay pet khởi đầu**; bể quay có **tất cả pet trừ Cowdi** (kể cả Huyền thoại và Sự kiện). Vào qua **thẻ tặng** thì nhận đúng pet được tặng. **Tự vào app** thì nhận Cowdi. Sẽ có một số tài khoản không có Cowdi (cố ý).
- Giá vé: **50 Gem/vé** (≈ 12 giờ học với người không nạp). **Không có gói 10 vé.**
- **Không có bảo hiểm (pity).** Mọi lượt quay độc lập, tỉ lệ cố định.

## Nguyên tắc
1. **Gacha dùng Gem**, không dùng Sữa, không đổi Gem ra Sữa (Sữa là nút thắt tiến hoá).
2. **Pet trong Dex thường vẫn mở bằng học** (`unlockCondition`). Gacha thường chỉ có pet giới hạn theo mùa, skin pet, đồ trang trí và tài nguyên nhỏ. Ngoại lệ: lượt quay pet khởi đầu của người được mời.
3. **Pet từ gacha bắt đầu ở C1** và phải học cùng để tích điểm kỹ năng → không mua được sức mạnh.
4. **Pet giới hạn luôn có đường miễn phí** qua nhiệm vụ học trong sự kiện.
5. **Công khai tỉ lệ** và lịch sử quay.

## 1. Vé gacha

### Cách tính giá "12 giờ học"
- Gem kiếm từ học: 1 Gem / 2 bài mới + thưởng unit (1 Gem khi xong, +2 khi 100%) → **~0,9 Gem/bài** (giả định 30% unit đạt 100%).
- Giả định **1 bài ≈ 12 phút** → 5 bài/giờ → **~4,5 Gem/giờ** → 12 giờ ≈ **50–55 Gem**.
- (Bài thực tế 10 phút: 12 giờ ≈ 65 Gem; 15 phút: ≈ 45 Gem. Cần đo thời gian học thật để chỉnh.)

| Mục | Giá |
|---|---|
| 1 vé | **50 Gem** (≈ 12 giờ học; ≈ 19 000–25 000 đ nếu nạp) |
| Gói nhiều vé | **Không có** |

### Nguồn vé miễn phí
| Nguồn | Vé |
|---|---|
| Nhiệm vụ tuần "Hoàn thành 5 bài học mới" | 1 vé/tuần |
| Thẻ mùa – tầng miễn phí | 2 vé/mùa |
| Thẻ mùa – tầng trả tiền | +8 vé/mùa |
| Thưởng mùa Đấu trường | Vàng: 1 · Bạch kim: 2 · Kim cương trở lên: 3 |
| Hoàn thành một lộ trình (A1, B1, IELTS…) | 3 vé |

Người chơi thường không nạp: **~7 lượt/mùa** (4 tuần).

## 2. Bể gacha thường và tỉ lệ
| Bậc | Tỉ lệ | Nội dung (ngẫu nhiên trong bậc) |
|---|---|---|
| ⚪ Thường | 67% | 250 Sữa · 4 vé đấu · 1 khăn giữ lửa (nếu chưa đủ 2) |
| 🔵 Hiếm | 22% | 3 mảnh đá · đồ trang trí Thường/Hiếm chưa có · 600 Sữa |
| 🟣 Sử thi | 8% | Skin pet (biến thể màu của pet đã sở hữu) · nền hoặc hào quang chỉ có trong gacha |
| 🟡 Giới hạn | 3% | Pet giới hạn của banner; nếu đã có → **Thẻ tặng pet** |

- Giá trị kỳ vọng mỗi lượt: ~100 Sữa và ~0,2 mảnh đá → rất nhỏ so với nút thắt Sữa (27 000/pet).
- Không có Gem trong bể gacha.

### Không có bảo hiểm — hệ quả cần biết
| Với tỉ lệ Giới hạn 3% | |
|---|---|
| Số lượt trung bình để ra Giới hạn | ~33 lượt ≈ 1 650 Gem ≈ **~640 000 đ** |
| Xác suất quay 33 lượt vẫn chưa ra | ~37% |
| Xác suất quay 50 lượt vẫn chưa ra | ~22% |
| Xác suất quay 100 lượt vẫn chưa ra | ~5% |
| Người không nạp (~7 lượt/mùa) | trung bình ~5 mùa mới trúng; nhiều người không bao giờ trúng |

- Pet giới hạn vẫn có **đường miễn phí** qua nhiệm vụ sự kiện 15 bài.
- Nếu thấy quá khó, có thể tăng tỉ lệ Giới hạn lên 5% (trung bình 20 lượt ≈ 385 000 đ; 50 lượt chưa ra ≈ 8%).

### Trùng
**Pet giới hạn:** chưa có → nhận pet; đã có → nhận **🎁 Thẻ tặng pet**.

**🎁 Thẻ tặng pet**
- Chứa **1 trứng của pet giới hạn đó**.
- **Gửi bằng chức năng "Mời bạn" hiện có** (`InviteSheet`, link `/i/:code`, QR). Khi có thẻ tặng, sheet mời thêm bước chọn: thiệp mời thường hoặc thiệp kèm thẻ tặng (dùng 1 thẻ).
- **Chỉ người mới nhận được.**
- **Thưởng người tặng:** khi người nhận học xong 3 bài mới, người tặng nhận **3 Gem**. Tặng thành công 5 lần được danh hiệu "Người gieo mầm".
- **Giới hạn:** mỗi người tặng tối đa **3 thẻ/tháng**. Thẻ không bán, không đổi ra Gem.
- **Hết hạn:** thẻ chưa tặng sau 60 ngày tự đổi thành 60 Bụi sao. Link mời mang thẻ hết hạn sau 7 ngày; không ai nhận thì thẻ trả lại người tặng.

**Đồ không phải pet** (skin, nền, hào quang trùng) → **Bụi sao ✨**: Hiếm 5 · Sử thi 20.
- **Cửa hàng Bụi sao:** skin pet 100; nền/hào quang gacha 80. Không bán pet giới hạn.

## 3. Pet đầu tiên của người mới

| Cách vào app | Lựa chọn | Có Cowdi? |
|---|---|---|
| Tự đăng ký | Nhận Cowdi | Có |
| **Qua thiệp mời thường** | **Chọn 1 trong 2:** nhận **Cowdi** hoặc **quay pet khởi đầu** (1 lượt miễn phí) | Chỉ khi chọn Cowdi |
| **Qua thiệp kèm thẻ tặng** | Nhận đúng pet giới hạn được tặng, nở ngay | Không |
| Tài khoản đã có | Không nhận thiệp mời | — |

### Lượt quay pet khởi đầu
- **1 lượt duy nhất, miễn phí**, dùng giao diện và hoạt ảnh gacha.
- Chọn quay thì **bỏ quyền nhận Cowdi**; màn chọn ghi rõ điều này trước khi quay.
- **Bể quay: tất cả 21 pet trong Dex trừ Cowdi:**

| Độ hiếm | Tỉ lệ | Pet |
|---|---|---|
| Thường | 50% | Paddy, Foxie, Pingu, Leafy |
| Hiếm | 30% | Sprout, Nấm Rơm, Củ Cải Trắng, Flippy, Mimi, Owlbert, Sparky |
| Sử thi | 13% | Bamboo, Bánh Bao, Ginseng, Leo, Shadow, Storm |
| Sự kiện | 5% | Pumpkin, Monk |
| Huyền thoại | 2% | Draco, Prisma |

- Pet quay được tính là **đã mở khoá**; nếu sau này đạt `unlockCondition` của pet đó thì không nhận thêm.
- Pet quay ra bắt đầu ở C1, điểm kỹ năng = 0.
- Lưu ý cân bằng: pet Huyền thoại ở C1 hơn pet thường 25% HP và 30% ATK. Đấu trường có bảo vệ người mới.

### Tài khoản không có Cowdi
- Cowdi vẫn là **nhân vật hướng dẫn / linh vật** nhưng không có trong bộ sưu tập.
- Tài khoản không có Cowdi **không thể có Cowdi sau này** (cố ý).
- Không có điều kiện mở khoá nào bắt buộc sở hữu Cowdi.

### Chống lạm dụng
- Mỗi tài khoản chỉ có 1 pet khởi đầu, không chuyển được.
- Giữ giới hạn thiệp mời hiện có: 5 thiệp/ngày, 20/tuần; cùng IP/thiết bị trong 24 giờ không tính thưởng cho người mời.

## 4. Banner và sự kiện
- **Mỗi banner 3 tuần:** 1 pet giới hạn + 2 skin được tăng tỉ lệ (×2 trong bậc Sử thi).
- **Đường miễn phí:** nhiệm vụ sự kiện "Hoàn thành 15 bài học mới trong thời gian banner" → nhận **trứng pet giới hạn**.
- Lịch gợi ý: Tết (Cowdi áo dài đỏ), Halloween (Owlbert Halloween), Giáng Sinh (Pingu Giáng Sinh), sự kiện IELTS/TOEIC (pet "Scholar").
- Pet giới hạn mới cần: hệ, nhóm, độ hiếm **Sự kiện**, 8 mức điểm kỹ năng để lên C4–C5.

## 5. Ghi chú triển khai
- Quay gacha trên **server**; lưu lịch sử 100 lượt; công khai tỉ lệ (cả bể khởi đầu).
- Ledger: `reason = 'gacha_ticket_purchase'`, `'gacha_pull'`, `'starter_pull'`, `'stardust'`, `'gift_card_reward'`.
- Bảng `pet_gift_cards`: `id`, `owner_id`, `species_id`, `status` (`held`/`sent`/`claimed`/`expired`), `invite_code`, `recipient_id`, `created_at`, `expires_at`.
- Bảng `invites` hiện có: dùng cột `pet_species` (mặc định `'cowdi'`), thêm `gift_card_id`, `starter_choice` (`'cowdi'` / `'pull'`), `starter_species`.
- `POST /api/invites/:code/claim`: từ chối tài khoản đã có pet; nhận `starter_choice`; nếu `'pull'` thì server quay bể khởi đầu; nếu thiệp có `gift_card_id` thì tạo pet được tặng.
- **Quan trọng:** `ensureInitialPet()` trong `src/hooks/usePet.jsx` đang tự tạo `cowdi_1` khi bộ sưu tập trống. Phải sửa để **chỉ tạo Cowdi khi tự đăng ký hoặc chọn Cowdi**; người đến từ thiệp mời chờ claim trên server xong. Rà các chỗ mặc định `activePetId = 'cowdi_1'`.
- Hằng số: `GACHA_TICKET_GEM = 50`, `GACHA_RATES = { common: 0.67, rare: 0.22, epic: 0.08, limited: 0.03 }`, `STARTER_POOL_RATES = { common: 0.50, rare: 0.30, epic: 0.13, event: 0.05, legendary: 0.02 }`. Không có hằng số pity.
- Cân nhắc giới hạn chi tiêu theo tháng cho tài khoản người dùng nhỏ tuổi.

## Chỉ số theo dõi
- Thời gian học thật trung bình mỗi bài (để chỉnh giá "12 giờ").
- Tỉ lệ người được mời chọn Cowdi so với quay pet; giữ chân ngày 7 của hai nhóm.
- Phân bố số lượt trước khi trúng Giới hạn; số người quay > 50 lượt chưa trúng.
- Số thẻ tặng được gửi, tỉ lệ nhận, tỉ lệ người mới học đủ 3 bài.
- Doanh thu theo banner.

## Cần chốt
- Tỉ lệ bể khởi đầu 50/30/13/5/2.
- Giữ tỉ lệ Giới hạn 3% hay tăng lên 5% khi không có bảo hiểm.
