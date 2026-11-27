# Hướng dẫn Rà soát & Phát hiện Lỗi Hệ thống (Cowdi English)

> **Mã tài liệu:** `GDE-SYSTEM-AUDIT-BUGS-v1.0`  
> **Phạm vi:** React SPA (`src/`), Shared Engine (`shared/`), Node API (`server/`), CSS Mobile & PWA.  
> **Mục tiêu:** Hệ thống hoá các mẫu lỗi thực tế đã từng xảy ra trong Cowdi English kèm lệnh kiểm tra nhanh và checklist rà soát trước khi deploy.

---

## 1. Lỗi React `useEffect` / `useRef` & Hydration State

### Dấu hiệu điển hình
- Số liệu trên HUD (Sữa, Gem, Đá) tự động nhảy popup `+9792`, `+9808`, `+1000` liên tục mỗi lần đồng bộ hoặc chuyển màn hình (lỗi thực tế tại `BookShell.jsx`).
- Dữ liệu mặc định tự tạo đè lên dữ liệu thật từ server hoặc thiệp mời (lỗi `ensureInitialPet()` trong `usePet.jsx` tự tạo `cowdi_1` trước khi `/api/invites/:code/claim` chạy xong).

### Nguyên nhân gốc
1. **Return sớm trước khi cập nhật `ref`**:
   ```js
   // ❌ SAI: return cleanup sớm làm prevRef.current không bao giờ được cập nhật
   useEffect(() => {
     if (val > prevRef.current) {
       setDelta(val - prevRef.current);
       const t = setTimeout(() => setDelta(null), 1800);
       return () => clearTimeout(t);
     }
     prevRef.current = val;
   }, [val]);
   ```
   ```js
   // ✅ ĐÚNG: luôn cập nhật prevRef trước khi return, và bỏ qua lần hydrate đầu từ 0
   useEffect(() => {
     const prev = prevRef.current;
     prevRef.current = val;
     if (!hydratedRef.current) {
       if (val > 0) hydratedRef.current = true;
       return;
     }
     if (prev !== undefined && val > prev) {
       setDelta(val - prev);
       const t = setTimeout(() => setDelta(null), 1800);
       return () => clearTimeout(t);
     }
   }, [val]);
   ```
2. **Client tự sinh dữ liệu khi chưa biết trạng thái chờ**: các hàm `ensure*` trong `src/hooks/` chạy đồng bộ trong `useState(() => ...)` khi `localStorage` rỗng, làm ghi đè luồng đặc biệt (như `cowdi_pending_invite`).

### Cách rà soát nhanh
- Tìm mọi `useEffect` có `Ref` và `return () =>`: kiểm tra xem dòng gán `ref.current = ...` có bị đặt sau `return` hay không.
- Kiểm tra mọi `useState(() => ...)` và `ensure*` trong `src/hooks/*.jsx` xem có tự ghi `localStorage` hoặc đẩy lên server trước khi nhận phản hồi `GET` ban đầu hay không.

---

## 2. Lỗi CSS Stacking Context (`z-index`) & Giao diện Di động

### Dấu hiệu điển hình
- Bong bóng Skill của pet bị **thanh HP / thẻ HUD che khuất** (lỗi thực tế tại `arena.css`).
- Trên điện thoại (`360px–390px`):
  - Hai thẻ HUD trái/phải đè lên nhau làm mất tên pet.
  - Hai pet đứng quá sát nhau ở giữa sân.
  - Phải cuộn trang mới bấm được đáp án A/B/C/D hoặc nút `← Quay về đấu trường` ở màn hình tổng hợp.

### Nguyên nhân gốc
1. **Bẫy Stacking Context**: một phần tử con có `z-index: 30` nhưng nằm trong phần tử cha có `z-index: 10` (ví dụ `.arena-pet-wrapper`) sẽ **bị nhốt trong tầng 10**, nên vẫn nằm dưới phần tử khác có `z-index: 20` (`.arena-hud-card`).
   - **Cách sửa**: đặt `z-index` của `.arena-pet-wrapper` cao hơn `.arena-hud-card` (ví dụ HUD `15`, Pet `25`, khi tung chiêu `40`, bong bóng `45`).
2. **Dùng `min-width` cố định trên mobile**: đặt `min-width: 145px` cho cả 2 thẻ HUD trên màn `360px` chắc chắn gây đè nhau.
   - **Cách sửa**: dùng `width: calc(50% - 12px); min-width: 0;` kèm `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` cho tên dài.
3. **Không kiểm soát chiều cao 1 màn hình (`100dvh`)**:
   - Đáp án xếp 1 cột 4 hàng dọc tốn quá nhiều chiều cao → chuyển sang lưới `2×2` trên mobile.
   - Màn hình tổng hợp kết quả đặt `max-height` cứng cho cả trang → dùng `flex: 1; min-height: 0; overflow-y: auto` riêng cho khối nhật ký để nút hành động chính luôn ghim ở đáy.

### Cách rà soát nhanh
- Mở Chrome DevTools → Device Toolbar với 2 kích thước chuẩn: **`360×700`** (Android nhỏ) và **`390×844`** (iPhone).
- Kiểm tra không có thanh cuộn ngang (`document.documentElement.scrollWidth <= window.innerWidth`), không có chữ/thẻ nào bị cắt, và toàn bộ màn hình thao tác chính (Đấu trường, Tổng hợp kết quả, Quiz) vừa khít trong 1 màn hình.

---

## 3. Lỗi Đồng bộ Thiết kế ↔ Code & Tài nguyên Thiếu

### Dấu hiệu điển hình
- Tính năng đã có trong thiết kế/server (`PET_SKILLS` trong `shared/game-config.js`, `shared/battle-engine.js`) nhưng giao diện không hiển thị chip kỹ năng, thiếu trigger (`low_hp`, `skill_match` khớp chuỗi sai), hoặc chỉ hiện cho một bên.
- Pet chưa đủ 5/5 hình (`mushroom`, `bun` đang `0/5`) vẫn nằm trong danh sách có thể rơi từ Gacha / Quay khởi đầu, gây lỗi hiển thị hình ảnh.

### Cách rà soát nhanh
Chạy script kiểm tra tính toàn vẹn `PET_REGISTRY` (toàn bộ pet trong bể quay phải đủ 5/5 ảnh và có `PET_SKILLS` khớp ID):
```powershell
node -e "
import('./src/data/pets.js').then(({ PET_REGISTRY }) => {
  import('./shared/game-config.js').then(({ PET_SKILLS, isPetImageComplete }) => {
    for (const [id, p] of Object.entries(PET_REGISTRY)) {
      const okImg = isPetImageComplete(p);
      const hasSkill = Boolean(PET_SKILLS[id]);
      if (!okImg || !hasSkill) {
        console.log('CẦN KIỂM TRA:', id, { okImg, hasSkill });
      }
    }
  });
});
"
```
- Mọi bể quay thưởng (Gacha, Quay khởi đầu, Sự kiện) **bắt buộc** đi qua `isPetImageComplete(petOrId)` trước khi chọn ngẫu nhiên hoặc hiển thị ra UI.
- Khi thiết kế thêm trigger/hiệu ứng mới trên server (`shared/battle-engine.js`), phải kiểm tra đối chiếu 1-1 ở client (`DuelPage.jsx`) để đảm bảo cả **mình** và **đối thủ** đều hiển thị đủ nhãn và hiệu ứng.

---

## 4. Lỗi Kinh tế, Ví & Giao dịch Server (`wallet_ledger`)

### Dấu hiệu điển hình
- Cộng trùng tài nguyên khi người dùng bấm lại hoặc refresh.
- Client tự cộng/trừ số dư rồi gửi lên server khiến số dư lệch nhau giữa thiết bị.

### Nguyên tắc rà soát
1. Mọi thay đổi `milk`, `gem`, `stone`, `stone_shard`, `gacha_ticket` phải đi qua `wallet_ledger` trên server trong **transaction** (`conn.beginTransaction()` → kiểm tra số dư → `INSERT` ledger → `commit()`).
2. Các phần thưởng 1 lần/mốc phải có `UNIQUE KEY uq_grant (user_id, currency, reason, ref_id)` và dùng `INSERT IGNORE` (hoặc `ref_id` duy nhất cho giao dịch tiêu dùng/quay thưởng).
3. Mọi SQL migration (`server/db/migrate-*.sql`) phải **idempotent** (chạy lại nhiều lần không lỗi trên MySQL 5.5/5.6+, không dùng 2 cột `CURRENT_TIMESTAMP` trong cùng 1 bảng).

---

## 5. Checklist Kiểm tra Bắt buộc Trước Khi Chạy `deploy.ps1`

1. **Test tự động**: chạy `npm test` → 100% suite & test case phải `pass` (`fail 0`).
2. **Build & Kiểm định nội dung**: chạy `npm run build` → `prebuild` (`validate-lessons.mjs --questions --fail-on-hard`) báo **0 lỗi cứng**, Vite build thành công.
3. **Kiểm tra tài nguyên & ảnh**: rà các pet/icon/card mới thêm xem có thiếu ảnh hoặc sai đường dẫn không.
4. **Kiểm tra Mobile `360×700`**: kiểm tra các màn hình vừa sửa (Đấu trường, Tổng hợp, Cửa hàng, Gacha, Thiệp mời) không bị tràn/đè/che khuất.
5. **Kiểm tra Git & Migration**: nếu có file `server/db/migrate-*.sql` mới, đảm bảo có cơ chế tự chạy an toàn hoặc chạy trên DB production ngay khi deploy.
