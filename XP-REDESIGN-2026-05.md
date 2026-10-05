# 🎯 Thiết kế lại cơ chế tính điểm XP — Cowdi English

> Ngày: 2026-05-14  
> Mục tiêu: Biến XP từ một chỉ số "chỉ để hiển thị" thành tài nguyên người chơi **chủ động tiêu** để nuôi và tiến hóa Pet.

---

## 1. Vấn đề trước đây

| Thành phần | Trạng thái cũ |
|---|---|
| `userData.totalXP` | Tích lũy từ Practice, Review, … nhưng **chỉ dùng hiển thị** trên AccountPage / ProgressPage / Leaderboard cho "Cấp độ user". |
| `pet.totalXpEarned` | Tăng **tự động** từ `addSkillPoints` / `addAllSkillPoints` mỗi khi user học bài, làm quiz. Người chơi không có lựa chọn. |
| Kết quả | XP không có giá trị sử dụng. Người chơi không cảm nhận được "phần thưởng" vì không có gì để chi tiêu. |

## 2. Thiết kế mới

### 2.1 Hai loại XP độc lập trên user
| Field | Ý nghĩa | Tăng khi | Giảm khi |
|---|---|---|---|
| `userData.totalXP` | **Lifetime XP** – chỉ tăng, dùng cho cấp độ + leaderboard | `addXP(n)` | Không bao giờ |
| `userData.availableXP` | **Ví XP có thể tiêu** | `addXP(n)` | `spendXP(n)` (cho Pet ăn) |

→ Một hành động `addXP(n)` luôn cộng vào **cả hai** field.  
→ Người chơi không bị mất "thành tích" khi tiêu XP — totalXP cho leaderboard vẫn nguyên.

### 2.2 Cho Pet ăn XP
- API mới `usePet().feedXPToPet(amount)` — atomic:
  1. Gọi `spendXP(amount)` (trừ ví user).
  2. Cộng `amount` vào `activePet.totalXpEarned` (tỉ lệ 1:1).
  3. Tự kiểm tra mốc tiến hóa (`getPetEvolution`) và update `pet.evolution`.
  4. Tặng kèm `+happiness`, `+knowledge` (max +30 mỗi need).
  5. Trả về `{ ok, evolved, newEvoStage }` để UI hiển thị toast.

### 2.3 Mốc tiến hóa (giữ nguyên từ `src/data/pets.js`)
| Stage | XP cần |
|---|---|
| 0 Trứng | 0 |
| 1 Baby | 100 |
| 2 Junior | 500 |
| 3 Super | 1 200 |
| 4 Legendary | 2 500 |

### 2.4 UI mới trong **Pet Page**
Card "Cho Pet ăn XP":
- Hiển thị ví XP hiện tại.
- Nút nhanh: `+50` `+200` `+500`.
- Nút **🚀 Tiến hóa ngay** xuất hiện khi ví đủ XP để vượt mốc kế tiếp.
- Nút **Tiêu tất cả**.
- Toast thông báo khi pet tiến hóa.

### 2.5 Di trú dữ liệu (Migration)
- **Client** (`sanitizeData`): nếu `availableXP` chưa có → khởi tạo `= totalXP`. User cũ có thể tiêu toàn bộ XP đã tích lũy.
- **Server**: file `server/db/migrate-available-xp.sql`:
  ```sql
  ALTER TABLE user_progress ADD COLUMN available_xp INT UNSIGNED NOT NULL DEFAULT 0 AFTER total_xp;
  UPDATE user_progress SET available_xp = total_xp WHERE available_xp = 0 AND total_xp > 0;
  ```
- Endpoint `/api/progress` (GET + PUT) đã được cập nhật để đọc/ghi `available_xp`.
- Cơ chế merge giữa local/remote: lấy giá trị mới nhất theo `_lastModified` (vì ví có thể giảm).

### 2.6 Tương thích cơ chế cũ
- `addSkillPoints` / `addAllSkillPoints` **vẫn** tăng `pet.totalXpEarned` từ skill activity → pet vẫn có tiến độ "thụ động". Người chơi tiêu thêm XP từ ví để bứt tốc khi muốn.
- Coins, Pet Needs, Daily Quests không thay đổi.

## 3. Các file đã chỉnh sửa

| File | Mô tả |
|---|---|
| [src/hooks/useUser.jsx](src/hooks/useUser.jsx) | `DEFAULT_DATA.availableXP`, sanitize migration, `addXP` cộng cả ví, hàm mới `spendXP`, merge logic |
| [src/hooks/usePet.jsx](src/hooks/usePet.jsx) | `feedXPToPet(amount)` mới, tự kích hoạt tiến hóa |
| [src/features/pet/PetPage.jsx](src/features/pet/PetPage.jsx) | Card "Cho Pet ăn XP" + toast |
| [src/pages/AccountPage.jsx](src/pages/AccountPage.jsx) | Hiển thị thêm thẻ Ví XP |
| [server/routes/api.js](server/routes/api.js) | Đọc/ghi `available_xp` qua `/api/progress` |
| [server/db/schema.sql](server/db/schema.sql) | Cột `available_xp` trong schema mới |
| [server/db/migrate-available-xp.sql](server/db/migrate-available-xp.sql) | Migration cho DB hiện hữu |

## 4. Hướng dẫn deploy
```bash
# 1. Chạy migration trên DB sản phẩm
mysql -u <user> -p cowdi_english < server/db/migrate-available-xp.sql

# 2. Build & deploy như bình thường
npm run build
./deploy.ps1
```

## 5. Cải tiến tương lai (gợi ý)
- Hệ số bonus khi cho ăn lần đầu trong ngày (×1.5).
- "XP Boost" mua bằng coin: trong 30 phút mọi XP nhận được ×2.
- Cộng skill points (listening/speaking/…) khi feed XP, người chơi chọn skill.
- Achievement: "Đầu bếp 5★" — tiêu 10 000 XP cho Pet.
