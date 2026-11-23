# Hướng dẫn sử dụng: Chỉnh động tác & Rig Pet (`/admin/pet-motion`)

Tài liệu hướng dẫn chi tiết dành cho **quản trị viên** để quản lý ảnh, tạo rig bộ phận, vẽ sửa trực tiếp PNG, chỉnh 34 động tác và duyệt hiển thị cho người học trong ứng dụng **Cowdi English**.

---

## 1. Quyền truy cập & quy tắc xuất bản

- **Chỉ quản trị viên (`users.is_admin = 1`)** mới truy cập được trang `/admin/pet-motion` và các API `/api/admin/pet-motion/*`.
- **Mọi chỉnh sửa đều lưu vào bản Nháp trên server** — người học **không bao giờ** thấy bản nháp chưa duyệt.
- Người học chỉ thấy hoạt ảnh động tác `X` của pet `P` cấp `N` khi đồng thời thoả 2 điều kiện:
  1. **Bộ phận (Rig)** của `P` cấp `N` đã bấm **Duyệt bộ phận**.
  2. **Động tác `X`** của `P` cấp `N` đã bấm **Đánh dấu hoàn thiện**.
- Nếu một pet-cấp **chưa duyệt rig**, các trang học tập sẽ tự động hiển thị **ảnh tĩnh mặc định** như bình thường, không lỗi.
- Nếu đã duyệt rig nhưng một động tác cụ thể chưa duyệt:
  - Clip nền (`attentive`, `battle_ready`, `prop_<kỹ năng>`) tự lùi về `idle` (nếu `idle` đã duyệt) hoặc đứng tư thế nghỉ.
  - `sleepy` / `sleep` chưa duyệt sẽ tự bỏ qua.
  - Clip sự kiện khác (vd `cheer_small`) chưa duyệt sẽ giữ nguyên clip đang chạy.

---

## 2. Màn hình Tổng quan — Kho Pet 23 loài × 5 cấp

Truy cập từ menu thanh bên **Chỉnh động tác pet** hoặc trang **Quản trị (`/admin`)** → `/admin/pet-motion`.

- Hiển thị toàn bộ **23 loài pet** (bao gồm `bamboo` gấu trúc đen-trắng và `bamboo_spirit` Linh trúc tách riêng) × **5 cấp tiến hoá (`C1 Trứng` → `C5 Huyền thoại`)** cùng ảnh đại diện hiện tại.
- **Lọc nhanh**: theo nhóm pet (Nông trại, Thảo mộc, Thú săn, Biển, Bầu trời, Rồng, Linh khí), theo trạng thái (`Đã có Rig` / `Chưa có Rig`), hoặc ô tìm kiếm theo tên.
- Trên mỗi thẻ cấp của pet:
  - **Đổi ảnh / + Bổ sung ảnh**: tải ảnh tĩnh mặc định (PNG/WebP ≤ 2 MB) hiển thị làm avatar cho cấp đó.
  - **Nút `Rig`**: mở thẳng tab **🦴 Bộ phận** (hoặc khung **Tạo rig mới** nếu cấp này chưa có rig).
  - **Nút `Motion`**: mở thẳng tab **🎬 Động tác** để chỉnh và duyệt 34 động tác.

---

## 3. Tạo Rig mới cho một pet-cấp chưa có rig

Khi mở một pet-cấp chưa có rig, màn hình hiện khung **Tạo rig mới**:

1. **Chọn bộ phận muốn tải**:
   - Chọn **Tự nhận theo tên file** nếu bạn tải cùng lúc nhiều file tách lớp đặt tên chuẩn (`body.png`, `head.png`, `crown.png`, `armL.png`, `armR.png`, `front.png`, `fx.png`, `aura.png`, `eye0.png`, `eye1.png`).
   - Hoặc chọn cụ thể một bộ phận (mặc định với 1 ảnh đơn như Trứng C1 sẽ gán thành `body`).
2. Hệ thống tự tính kích thước, khung hình, chân tiếp đất (`ground`), hộp mắt và điểm xoay mặc định (`pivot`).
3. Bấm **Tạo rig nháp** → chuyển thẳng sang bàn chỉnh động tác.

---

## 4. Bố cục Bàn chỉnh động tác

Bàn chỉnh được chia gọn thành **2 hàng khớp trên 1 màn hình** để vừa quan sát pet chuyển động vừa đặt keyframe mà không cần cuộn trang:

- **Hàng trên**:
  - **Trái**: **Sân khấu Pet** + thanh điều khiển phát (`Chạy/Dừng`, `◀ key`, `key ▶`, đồng hồ giây, tốc độ `0.25× / 0.5× / 1×`, `Bóng mờ`, `Nhịp`, và nút **`▲ Thu gọn bảng phụ`** để mở rộng sân khấu).
  - **Phải**: Thanh **Duyệt bộ phận** + **3 tab**:
    - `🎬 Động tác` — danh sách 34 động tác có tên tiếng Việt, lọc `Chỉ chưa duyệt`, nút **✓ Đánh dấu hoàn thiện** / **Bỏ duyệt**.
    - `🦴 Bộ phận` — quản lý từng lớp ảnh bộ phận, thứ tự trước/sau, vẽ sửa trực tiếp PNG, dời hình/điểm xoay.
    - `⚙️ Cài đặt` — phạm vi chỉnh (chung/riêng), độ dài & lặp, Emoji biểu cảm, về bản gốc, xuất JSON sao lưu.
- **Hàng dưới (toàn chiều rộng)**:
  - **Trái**: **Dòng thời gian Keyframe** (15 hàng có nhãn tiếng Việt).
  - **Phải**: **15 thanh trượt Thông số tại đầu đọc** xếp ngang hàng 1-1 với 15 hàng dòng thời gian, kèm nút **`◇ / ◆`** bật/xoá keyframe 1 chạm.

---

## 5. Quản lý Bộ phận, Thứ tự lớp (`z`) & Vẽ sửa trực tiếp PNG

Trong tab **🦴 Bộ phận**:

### 5.1. Đưa bộ phận lên trên / xuống dưới (thứ tự lớp `z`)
- Danh sách hiển thị từ **trên cùng (nổi nhất, `z` lớn)** xuống **dưới cùng (nằm sau, `z` nhỏ)** — giống danh sách Layer.
- Dùng nút **`▲`** (đưa lên trên) và **`▼`** (đưa xuống dưới) trên từng bộ phận:
  - *Ví dụ*: muốn **Tay trái (`armL`)** nằm đè lên trên **Thân (`body`)**, bấm **`▲`** ở dòng `Tay trái` cho tới khi `Tay trái` nằm phía trên `Thân` (`z: 1`).
- Hoặc chọn bộ phận rồi nhập trực tiếp số ở ô **`Lớp vẽ (z)`** phía dưới.

### 5.2. Chỉnh vị trí, tỉ lệ, điểm xoay & thêm/xoá bộ phận
- Chọn chế độ kéo trên sân khấu:
  - **Tạo dáng**: kéo bộ phận trên pet để đặt keyframe chuyển động.
  - **Dời hình**: kéo để chỉnh vị trí lệch X/Y của ảnh bộ phận.
  - **Điểm xoay**: kéo chấm cam để dời khớp xoay (cổ, vai, cuống lá).
- Dùng khu vực **`+ Thêm bộ phận`** để bổ sung thêm ảnh tách lớp mới vào rig đang có, nút **`Thay hình`** để đổi ảnh từ máy, hoặc **`✕`** để bỏ bộ phận khỏi rig.

### 5.3. Vẽ / tẩy trực tiếp lên file bộ phận (`✏️ Sửa`)
Bấm nút **`✏️ Sửa`** trên bất kỳ bộ phận nào để mở **Trình sửa ảnh Studio 3 cột**:
- **Thanh công cụ trái**:
  - `B` **Cọ vẽ** · `E` **Tẩy (về trong suốt)** · `G` **Tô vùng** · `I` **Hút màu** (hoặc giữ `Alt + Click` khi đang vẽ)
  - `M` **Chọn chữ nhật** · `O` **Chọn bầu dục** · `L` **Chọn tự do (Lasso)** · `W` **Đũa thần chọn theo màu** · `V` **Di chuyển nội dung lớp**
- **Sân khấu giữa**: nền tối tương phản cao, **📏 Thước đo pixel** trục X/Y bám con trỏ, **# Lưới pixel** (khi zoom ≥ 400%), thu phóng (`−` / `+` / `Vừa` / `Ctrl + cuộn chuột`).
- **Bảng thuộc tính & Layer phải**:
  - **Tuỳ chỉnh cọ**: 3 đầu cọ (`Tròn`, `Vuông pixel`, `Nét nghiêng`), cỡ cọ (`[ ]`), độ đậm, độ cứng viền, khoảng cách nét, làm mượt nét, khung xem trước nét cọ, bảng màu & màu vừa dùng.
  - **Thao tác vùng chọn**: Cọ/Tẩy/Tô tự giới hạn trong vùng chọn; hỗ trợ `Delete` xoá, `Ctrl+Shift+I` đảo ngược, `Ctrl+J` tách sang Layer mới, `Ctrl+D` bỏ chọn.
  - **Đa Layer**: tạo Layer mới (`+ Mới`), nhân đôi (`📋`), đổi thứ tự (`↑`/`↓`), gộp xuống (`⤓`), ẩn/hiện (`👁️`), khoá (`🔒`), chỉnh độ mờ từng Layer, Hoàn tác/Làm lại (`Ctrl+Z` / `Ctrl+Shift+Z`).
  - **Tham chiếu (`👻`)**: bật/tắt mờ các bộ phận khác của cùng pet để canh chuẩn mối nối cổ/vai khi vẽ bù phần bị cắt.
- Bấm **`💾 Lưu bản nháp`** → hệ thống gộp phẳng các Layer đang bật thành file PNG chuẩn kích thước gốc và lưu thẳng lên server.

---

## 6. Đặt, sửa & xoá Keyframe

Mọi thay đổi keyframe tự động lưu nháp lên server sau ~0,8 giây (trạng thái hiển thị ở góc trên: `Đang lưu…` → `Đã lưu nháp lúc HH:mm`).

- **Đặt keyframe**:
  - Kéo trực tiếp bộ phận trên sân khấu (ở chế độ `Tạo dáng`), **hoặc**
  - Kéo thanh trượt thông số bên phải, **hoặc**
  - Bấm nút **`◇`** cuối dòng thông số tương ứng, **hoặc**
  - Bấm **`+ Đặt key`** trên thanh timeline / **bấm đúp** vào hàng trên timeline.
- **Dời keyframe**: kéo hình thoi cam `◆` sang trái/phải trên dòng thời gian.
- **Xoá keyframe**:
  - Bấm vào nút **`◆`** màu cam cuối dòng thông số tương ứng, **hoặc**
  - **Chuột phải** trực tiếp lên hình thoi `◆` trên dòng thời gian, **hoặc**
  - Chọn keyframe rồi bấm **`✕ Xoá key`** / phím **`Delete`**.
  - Muốn xoá sạch toàn bộ key trên một kênh: chọn kênh rồi bấm **`🗑 Xoá kênh`**.
- **Đổi kiểu chuyển**: chọn `Mượt (smooth)`, `Đều (linear)` hoặc `Nhảy (step)` cho keyframe đang chọn.

---

## 7. Emoji biểu cảm theo động tác (hữu ích cho Trứng C1)

Trong tab **⚙️ Cài đặt** → **Emoji biểu cảm**:
- Bật **Hiện emoji khi phát** để gắn biểu cảm nổi cạnh pet cho động tác hiện tại (mặc định đặt ở phạm vi **Riêng pet-cấp này**).
- Chọn vị trí nổi: `Góc trên phải`, `Chính giữa trên`, `Góc trên trái`.
- Chọn từ bộ emoji gợi ý, nhập tự do, hoặc tải **Emoji tự thiết kế (PNG/WebP nền trong suốt)** vào kho dùng chung cho mọi pet.
- Emoji chỉ hiển thị cho người học sau khi động tác đó được bấm **Đánh dấu hoàn thiện**.

---

## 8. Quy trình Duyệt & Xem như người học

1. Sau khi chỉnh xong bộ phận/ảnh/thứ tự lớp (`z`): bấm **Duyệt bộ phận** → server sao chép ảnh nháp sang `published/` và mở khoá rig cho người học.
2. Với từng động tác muốn bật cho người học:
   - Chọn động tác → bấm **✓ Đánh dấu hoàn thiện**.
   - Hệ thống sẽ tự phát thử đúng **1 vòng ở tốc độ 1×** để bạn kiểm tra, sau đó hiện nút **Xác nhận**.
   - Nếu có bản nháp **Riêng pet-cấp này**, bước xác nhận sẽ tự xuất bản bản riêng đó.
3. Nếu bạn sửa ở phạm vi **Mọi pet (bản chung)** và muốn áp dụng rộng rãi:
   - Vào tab **⚙️ Cài đặt** → bấm **Xuất bản bản chung**.
   - Hộp thoại liệt kê mọi pet-cấp đang duyệt động tác đó và cho chọn **Chuyển về chờ duyệt lại (mặc định)** hoặc **Giữ nguyên trạng thái duyệt**.
4. Bấm **Xem như người học** trên thanh công cụ trên cùng để kiểm tra chính xác những gì học sinh sẽ thấy từ API công khai `GET /api/pet-motion/:petId`.

---

## 9. Cài đặt & vận hành trên server (dành cho kỹ thuật)

```bash
# 1. Cài dependencies backend (có multer)
cd server && npm install

# 2. Chạy migration DB (an toàn chạy lại nhiều lần)
mysql -u <user> -p <database> < server/db/migrate-pet-motion.sql

# 3. Nạp 2 rig mẫu (radish & bamboo_spirit ở trạng thái nháp)
node server/scripts/seed-pet-rigs.mjs

# 4. Chạy bộ test kiểm tra toàn bộ (shared + server + runtime pet-rig)
npm test

# 5. Build giao diện
npm run build
```

- **Lưu trữ file ảnh**: `server/storage/pets/` (không commit vào git, không nén vào `deploy.zip`; cần sao lưu định kỳ thư mục này trên server production cùng với DB).
- **Cấu hình Nginx**: giữ `location ^~ /api/` trong [nginx-spa.conf](file:///Users/mac/Documents/GitHub/cowdi-english/nginx-spa.conf) để các URL `/api/pet-motion/assets/*.png|*.webp` được chuyển đúng về Node backend thay vì rơi vào rule file tĩnh.
