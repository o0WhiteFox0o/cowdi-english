# 🌱 Chiến lược tăng người dùng qua chia sẻ tự nhiên cho Cowdi

> Ngày soạn: 2026-05-14
> Tác giả: Đề xuất từ phân tích cấu trúc dự án [Cowdi-React](./)
> Mục tiêu: Biến người dùng đang **thích app trong im lặng** thành **người tự kéo bạn mới đến**, không cần quảng cáo trả phí.

---

## 1. Hiện trạng & "đòn bẩy viral" sẵn có

Dự án đã có rất nhiều "vật liệu" tốt cho viral nhưng chưa được kích hoạt:

| Tài sản | Vị trí | Tiềm năng viral |
|---|---|---|
| Pet collection (20 loài, 5 stage tiến hóa) | `src/data/pets.js` | Cảm xúc cá nhân – ai cũng muốn khoe |
| Duel battle PvP | `src/features/duel/`, `DUEL-BATTLE-DESIGN.md` | Cần đối thủ ⇒ tự nhiên rủ bạn |
| Leaderboard / Student Ranking | `src/pages/LeaderboardPage.jsx`, `StudentRankingPage.jsx` | So sánh xã hội |
| Mini-games & Event pet (Halloween/Pumpkin, Buddhist/Monk) | `src/features/mini-games/`, `pets.js` | FOMO theo mùa |
| PWA cài đặt 1-chạm | `PWA-GUIDE.md` | Link là dùng được, không cần app store |
| Cowdi Chat + nhân vật pet | `src/components/CowdiChat.jsx`, pet evolutions | Brand face – content cute sinh sẵn |

**Vấn đề cốt lõi**: Người dùng không có **lý do**, không có **cách**, và không có **phần thưởng** để mời người khác. Thiếu cả 3 ⇒ dù họ thích cũng chỉ thích trong im lặng.

---

## 2. Ba trục chiến lược chính

### Trục A — Tạo lý do để KHOE (Show-off loop)

Biến mỗi thành tích nhỏ thành một **sản phẩm chia sẻ được**.

- **Pet Card shareable**: từ `PetPage` / `CollectionPage`, render canvas → ảnh PNG/WebP gồm: ảnh pet, tên, stage, 4 thanh skill, "🔥 Streak X ngày", QR/short-link `cowdi.net`. Nút "Chia sẻ" gọi `navigator.share` → đăng Zalo/Messenger/Facebook/TikTok.
- **Quiz Result Card**: sau Perfect Quiz, Duel thắng, Boss đánh bại → modal "Khoe thành tích" với ảnh sẵn. Điểm chia sẻ vàng vì người dùng đang phấn khích.
- **Evolution moment**: pet tiến hóa stage 3/4 là cảm xúc cao nhất — **bắt buộc** gắn nút Share ngay tại animation.
- **Streak milestone**: 7, 30, 100 ngày → tự sinh "huy hiệu streak" tải/đăng story được.

**Quy tắc**: mỗi ảnh share phải mang **nhân vật Cowdi/Pet** + watermark `cowdi.net`. Không cần copy quảng cáo — hình ảnh tự bán nó.

### Trục B — Tạo lý do để MỜI cụ thể (Referral loop)

Không trao thưởng cho việc share chung chung; trao thưởng cho **bạn mới thực sự học**.

- **Mã mời cá nhân**: mỗi tài khoản có `inviteCode` (hệ auth đã có ở `server/routes/auth.js`). Link: `cowdi.net/?ref=ABC123`.
- **Phần thưởng 2 chiều**:
  - Bạn mới đăng ký bằng ref → **Friendship Egg** + 100 coins.
  - Người mời nhận thưởng theo **cột mốc của người được mời** (chống spam):
    - Mời 1 + bạn mới hoàn thành 1 bài → 50 coins
    - Mời 3 bạn cùng học → mở khoá **pet "Bondy" rarity event** (chỉ có qua mời)
    - Mời 10 → skin/effect huyền thoại
- **Co-op pet (Pet bond)**: 2 người dùng cùng ref có thể "kết bạn pet" — mỗi ngày tặng nhau 1 quà nhỏ (năng lượng, food). Tận dụng **Pet needs** (Tamagotchi) sẵn có để tạo **daily return** cho cả hai phía. Đây là loop bền nhất.

### Trục C — Tạo lý do để CHƠI CÙNG (Multiplayer pull)

Duel là vũ khí mạnh nhất nhưng đang bị "chôn".

- **Duel theo lời mời**: link `cowdi.net/duel/JOIN/XYZ`. Người nhận chưa có tài khoản → 1 nút Google login → vào trận. **Đây là conversion path ngắn nhất.**
- **Classroom mode**: giáo viên có "Mã lớp 6 ký tự". 1 GV = 30–50 user. Vector tăng trưởng **B2B2C** dễ kiểm soát.
- **Element war**: chia 6 element (fire/water/nature/earth/cosmic/neutral) sẵn có → tuần nào phe có tổng XP cao nhất nhận thưởng cộng đồng. Người chơi tự rủ bạn vào phe mình.

---

## 3. Tận dụng sự kiện theo mùa

Vừa có cơ chế **event-locked pet** (Halloween/Pumpkin, Buddhist/Monk). Đóng gói mỗi sự kiện thành **chiến dịch viral riêng**:

- Landing page tạm thời trong `HomePage` + countdown ⇒ FOMO.
- Ảnh chia sẻ chuyên đề: "Tôi vừa nhận Monk – chỉ có hôm nay 🪷" + link `cowdi.net/event/buddhist`.
- Một số sự kiện chỉ unlock khi **online + có 1 bạn cùng online** → buộc rủ thêm 1 người (bắt buộc nhẹ).
- **Roadmap sự kiện cả năm**: Tết, Valentine, 8/3, Phật Đản, Quốc tế thiếu nhi, Trung Thu, Halloween, Noel. Mỗi tháng 1 lý do quay lại + share mới.

---

## 4. Hạng mục dev cần thêm

| Ưu tiên | Hạng mục | Vị trí phù hợp |
|---|---|---|
| ⭐⭐⭐ | Share Card (canvas → image) + Web Share API | `src/components/share/` (mới) |
| ⭐⭐⭐ | Referral code + bảng `referrals` DB | `server/db/schema.sql`, `server/routes/auth.js` |
| ⭐⭐⭐ | Duel theo link mời | `src/features/duel/` |
| ⭐⭐ | Classroom code (giáo viên) | `AdminPage.jsx`, `server/routes/admin.js` |
| ⭐⭐ | OG tags động cho `?ref=` và `/duel/...` | `index.html` + tag injector |
| ⭐ | Event landing & countdown | `HomePage.jsx` |
| ⭐ | Pet bond (co-op) | `src/hooks/usePet.js` |

---

## 5. Đo lường

Sự kiện log (qua `server/routes/api.js`):

- `share_click` — nơi nào, pet gì, kết quả gì
- `share_completed` — Web Share API resolve thành công
- `ref_register` — mã ref nào dẫn về
- `ref_activated` — người mới hoàn thành bài đầu tiên

**K-factor** mục tiêu giai đoạn 1: ≥ 0.3 (1 user kéo 0.3 user mới / 14 ngày). Đạt 0.5 → có tăng trưởng hữu cơ.

---

## 6. Roadmap 3 sprint ngắn

1. **Sprint 1 — Khoe được**: Share Card cho pet & quiz result + nút Share trong moment tiến hóa / Perfect / Duel-win. *Không động DB.* Quick win 2–3 ngày.
2. **Sprint 2 — Mời được**: Referral code + thưởng 2 chiều + Friendship Egg / Bondy pet.
3. **Sprint 3 — Chơi cùng**: Duel-by-link + Classroom + 1 event theo mùa hoàn chỉnh.

---

## 7. Cảnh báo (đừng làm)

- ❌ Ép share để mở tính năng học cốt lõi → mất thiện cảm. Chỉ gate **pet/skin event**, **không gate bài học**.
- ❌ Thưởng theo "số click share" → spam. Luôn thưởng theo **hành vi của người mới** (đăng ký + học 1 bài).
- ❌ Pop-up share spam nhiều lần. Mỗi "moment" chỉ hỏi 1 lần, dismiss = im lặng cả tuần.
- ❌ Link `?ref=` thiếu OG image → trông như rác khi dán Facebook/Zalo, giảm CTR mạnh.
- ⚠️ iOS chia sẻ **ảnh sạch hơn chia sẻ link** → ưu tiên ảnh có watermark `cowdi.net` hơn URL trần.

---

**Tóm tắt 1 câu**: Cowdi đã có "hàng để khoe" — điều thiếu là **3 vòng lặp**: *Khoe → Mời → Chơi cùng*. Làm **Share Card trước** (rẻ, nhanh), rồi Referral pet, rồi Duel-by-link/Classroom.

---

> 📎 Xem thêm thiết kế chi tiết Sprint 1 ở [`SHARE-FEATURE-DESIGN.md`](./SHARE-FEATURE-DESIGN.md)
