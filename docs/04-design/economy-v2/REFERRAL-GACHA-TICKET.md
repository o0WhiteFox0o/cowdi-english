# Cowdi English — Thưởng mời bạn & điều chỉnh Gacha v2

Phiên bản: 0.3 · Ngày: 25/11/2026 · **Thay toàn bộ bản 0.2** (bản 0.2 thiết kế "Hộp Bạn Bè" riêng mà không biết repo đã có thiết kế gacha).

Tài liệu gốc trong repo: `docs/04-design/economy-v2/de-xuat-gacha-v2.md` (23/11/2026), `TASK.md` GĐ6–GĐ7, thiệp mời đã chạy (`server/routes/invites.js`, `InviteSheet.jsx`, `InvitePage.jsx`).
Tài liệu này **chỉ ghi phần thay đổi** so với `de-xuat-gacha-v2.md`. Phần không nhắc tới giữ nguyên.

---

## 1. Quyết định của Sonny (24–25/11/2026)

| # | Nội dung | So với `de-xuat-gacha-v2.md` |
|---|---|---|
| Q1 | **Không có hộp quà riêng cho mời bạn.** Chỉ một gacha thường: 50 Gem/vé, tỷ lệ 67/22/8/3, banner 3 tuần. | Giữ nguyên |
| Q2 | **Không có bảo hiểm (pity).** | Giữ nguyên |
| Q3 | **Bỏ Bụi sao ✨ và Cửa hàng Bụi sao.** Game học tiếng Anh: càng ít loại tài nguyên càng tốt. Quà trùng đổi ra **Gem hoặc Sữa** (mục 3). | **Thay đổi** |
| Q4 | Người chọn quay pet khởi đầu (không có Cowdi) **lấy lại được Cowdi qua nhiệm vụ dạng sự kiện**, thiết kế sau. | **Thay đổi** (bản cũ: không bao giờ có lại) |
| Q5 | Thưởng mời bạn bằng Gem, Sữa và vé gacha thường theo mốc (mục 2). Không có tiền tệ riêng cho mời bạn. | **Thay đổi** |
| Q6 | Một loại tài khoản; chưa có nạp tiền, chưa có phụ huynh. | Bối cảnh |

---

## 2. Thưởng mời bạn **[R — chỉnh trong bảng cân bằng]**

"Học thật" (kích hoạt) = người được mời hoàn thành **3 bài mới** trên **ít nhất 2 ngày khác nhau**, trong **14 ngày** kể từ khi nhận thiệp.

| Sự kiện | Người mời | Người được mời |
|---|---|---|
| Người được mời học thật | **+3 Gem** (như thiết kế cũ) | **+500 Sữa** quà chào mừng |
| Mốc 3 bạn học thật (trọn đời) | **+1 vé gacha** + danh hiệu "Người dẫn đường" | — |
| Mốc 5 bạn | **+1 vé gacha** | — |
| Mốc 10 bạn | **+2 vé gacha** + danh hiệu "Người gieo mầm" | — |
| Mốc 20 bạn | **+2 vé gacha** + danh hiệu "Đại sứ Cowdi" | — |

- Giới hạn: người mời nhận tối đa **3 vé gacha/tháng** từ mời bạn. Vượt hạn mức thì mốc vẫn ghi nhận, vé dời sang tháng sau.
- Gem từ mời bạn: tối đa **10 người/tháng** được tính +3 Gem (≤30 Gem/tháng, dưới giá 1 vé).
- Giữ chống lạm dụng của thiệp mời: 5 thiệp/ngày, 20/tuần; cùng IP/thiết bị trong 24 giờ không tính thưởng.
- Danh hiệu "Người gieo mầm" của thẻ tặng pet (5 lần tặng thành công) gộp chung vào mốc 10 bạn ở bảng trên.

Lý do không thưởng 1 vé cho mỗi bạn: 1 vé = 50 Gem ≈ 12 giờ học. Thưởng vé theo đầu người sẽ khiến mời bạn đáng giá hơn học.

---

## 3. Quà trùng khi không còn Bụi sao

| Quà trùng | Đổi thành |
|---|---|
| Đồ trang trí Thường/Hiếm | Không xảy ra: bể chỉ rơi món **chưa có**. Có đủ hết thì rơi **600 Sữa** |
| Skin pet, nền, hào quang (Sử thi) | **+10 Gem** (20% giá vé) |
| Pet giới hạn | **🎁 Thẻ tặng pet** (giữ nguyên) |
| Thẻ tặng pet hết hạn 60 ngày chưa gửi | **+10 Gem** (thay 60 Bụi sao) |

- Không có cửa hàng đổi đồ gacha. Skin/nền/hào quang chỉ có từ gacha hoặc sự kiện.
- Ledger: dùng `reason='gacha_duplicate'` (Gem/Sữa), `'gift_card_expired'` (Gem). Bỏ `reason='stardust'`.

**[Cần Sonny xem]** Bể Hiếm của gacha thường còn "3 mảnh đá". Mảnh đá đã có sẵn trong kinh tế (10 mảnh = 1 Đá). Theo nguyên tắc Q3, có thể thay bằng **1 Đá nguyên tố với tỷ lệ thấp** hoặc giữ nguyên vì mảnh đá đã có từ trước.

---

## 4. Pet khởi đầu

Giữ nguyên mục 3 của `de-xuat-gacha-v2.md` (người tự đăng ký nhận Cowdi; người đến qua thiệp mời chọn Cowdi hoặc quay 1 lượt; người đến qua thẻ tặng nhận đúng pet được tặng), trừ:
- **Q4:** bỏ dòng "Tài khoản không có Cowdi không thể có Cowdi sau này". Thay bằng: lấy lại Cowdi qua nhiệm vụ sự kiện (thiết kế sau); ghi `source` khi cấp pet (`starter`, `starter_pull`, `gift_card`, `event:<id>`) để sự kiện không cấp Cowdi thứ hai.
- **Người chọn Cowdi** nhận thêm phụ kiện "Khăn Bạn Đầu Tiên", để lựa chọn này không bị coi là "không được gì".
- Tỷ lệ bể khởi đầu 50/30/13/5/2 (có cả Sự kiện và Huyền thoại) vẫn **chờ Sonny chốt**.

---

## 5. Việc cần sửa trong repo
- `de-xuat-gacha-v2.md`: bỏ Bụi sao và Cửa hàng Bụi sao; thêm mục 3 của tài liệu này; sửa dòng "không thể có Cowdi sau này"; thêm thưởng mời bạn ở mục 2; bỏ `'stardust'` khỏi ghi chú triển khai.
- `TASK.md` GĐ6–GĐ7: cập nhật theo các quyết định trên.
- `HowToEarnSheet.jsx`: dòng "Tặng pet qua thiệp mời (khi bạn học 3 bài) +3 Gem" giữ; thêm dòng mốc mời bạn khi tính năng xong.
