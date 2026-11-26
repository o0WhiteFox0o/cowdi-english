# Hướng dẫn sử dụng: Quản lý Pet, Rig & Chỉnh động tác (`/admin/pet-motion`)

Tài liệu hướng dẫn chi tiết dành cho **quản trị viên** để **thêm/sửa/xoá và upload loài pet mới**, quản lý ảnh 5 cấp, tạo rig bộ phận, vẽ sửa trực tiếp PNG, chỉnh 34 động tác và duyệt hiển thị cho người học trong ứng dụng **Cowdi English** (tuân thủ quy chuẩn mỹ thuật [`STD-ART-STYLE-v1.1.md`](05-implementation/art/STD-ART-STYLE-v1.1.md)).

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

## 2. Màn hình Tổng quan — Quản lý toàn bộ Pet × 5 cấp

Truy cập từ menu **Thêm & Hồ sơ ⋯ → Quản lý Pet** (Desktop) hoặc tab **Tôi → Quản lý Pet** (Mobile) → `/admin/pet-motion`.

- Hiển thị toàn bộ **23 loài pet gốc + các loài pet mới do Admin tạo** × **5 cấp tiến hoá (`C1 Trứng` → `C5 Huyền thoại`)** cùng ảnh đại diện hiện tại.
- **Thêm Pet mới (`+ Thêm Pet mới`):**
  1. Bấm nút **`+ Thêm Pet mới`** ở góc phải trên cùng.
  2. Điền **Tên hiển thị**, **Mã Pet (`petId`)** (tự sinh slug `a-z`, `0-9`, `_`), **Loài**, **Emoji**, chọn **Hệ (10 hệ)**, **Nhóm kỹ năng (7 nhóm)**, **Độ hiếm (5 bậc)** và **Mô tả ngắn**.
  3. Tại khung **Ảnh & Tên 5 cấp tiến hoá (`C1–C5`)**, bấm chọn trực tiếp ảnh PNG/WebP nền trong suốt cho từng cấp (nên giữ bật **Tự nén WebP chuẩn 512/640 px**).
  4. Bấm **`+ Tạo Pet mới`**: hệ thống tự lưu vào `pet_catalog`, tải lên các ảnh cấp đã chọn và đồng bộ ngay cho toàn bộ người học qua `/api/pet-motion/catalog`.
- **Chỉnh sửa & Xoá Pet:**
  - Bấm **`✏️ Sửa`** trên từng pet để đổi tên, hệ, nhóm, độ hiếm, mô tả, tên 5 cấp hoặc thay nhanh 5 ảnh `C1–C5`.
  - Với pet tự thêm (có nhãn **`Mới`**), có thể bấm **`🗑️ Xoá`** để xoá sạch dữ liệu & ảnh của pet đó (23 pet gốc được bảo vệ, không thể xoá nhầm).
- **Lọc nhanh**: theo nhóm pet (Nông trại, Thảo mộc, Thú săn, Biển, Bầu trời, Rồng, Linh khí), theo trạng thái (`Đã có Rig` / `Chưa có Rig`), hoặc ô tìm kiếm theo tên.
- Trên mỗi thẻ cấp của pet:
  - **Đổi ảnh / + Bổ sung ảnh**: tải ảnh tĩnh mặc định (PNG/WebP ≤ 2 MB) hiển thị làm avatar cho cấp đó.
  - **`✂️ Lấy ảnh pet` / `🎨 Tự vẽ / Mẫu`** *(khi cấp đó đang "Chưa có ảnh")*: lấy ngay ảnh hiện có từ cấp khác của cùng pet (hoặc phôi mẫu cùng nhóm / khung vẽ trống chuẩn) mở vào Studio để họa sĩ tự cắt, chỉnh sửa hoặc vẽ lại rồi lưu thẳng làm avatar.
  - **Nút `Rig`**: mở thẳng tab **🦴 Bộ phận** (hoặc khung **Tạo rig mới** nếu cấp này chưa có rig).
  - **Nút `Motion`**: mở thẳng tab **🎬 Động tác** để chỉnh và duyệt 34 động tác.

---

## 3. Tạo Rig mới cho một pet-cấp chưa có rig

### 3.1. Gợi ý kích thước ảnh chuẩn theo thiết kế

Khung hiển thị `PetRig` có kích thước logic **420 × 460 px** (vẽ sắc nét ở **2× Retina**). Quy cách ảnh khuyến nghị:

| Loại ảnh | Kích thước khuyến nghị | Giới hạn hợp lý | Định dạng & dung lượng |
|---|---|---|---|
| **Rig tách lớp C1–C3** (`Trứng / Baby / Junior`) | **512 × 512 px** | 320 – 700 px | **WebP** (ưu tiên) hoặc **PNG** nền trong suốt, ≤ **2 MB/file** (khuyên 50–250 KB) |
| **Rig tách lớp C4–C5** (`Super / Huyền thoại`) | **640 × 640 px** | 480 – 800 px | **WebP** hoặc **PNG** nền trong suốt, ≤ **2 MB/file** |
| **Avatar tĩnh mặc định** (ngoài Tổng quan) | **512 × 512 px** (1:1) | ≥ 320 px | **WebP** nền trong suốt, khuyên ≤ 150 KB (tối đa 2 MB) |
| **Emoji tự thiết kế** | **128 × 128 – 256 × 256 px** (1:1) | ≤ 512 px | **PNG / WebP** nền trong suốt, ≤ 2 MB |

> **Lưu ý quan trọng:** Tất cả các lớp bộ phận trong cùng 1 cấp (`body`, `head`, `armL`, `armR`, `crown`, `eye0`, `eye1`…) nên xuất **cùng kích thước khung W×H** để tự khớp toạ độ. Nếu lỡ chọn ảnh quá lớn (> 2 MB hoặc > 800 px), bấm nút **✨ Thu gọn về chuẩn (WebP)** ngay trong khung tạo rig để tự động thu nhỏ & nén giữ nền trong suốt.

### 3.2. Các bước tạo rig (từ file tách lớp hoặc lấy ảnh Pet hiện có để tự cắt)

Khi mở một pet-cấp chưa có rig, màn hình hiện khung **Tạo rig mới**:

- **Cách A — Đề xuất khi chưa có file bộ phận tách lẻ (họa sĩ cắt/vẽ ngay trên web):**
  - Hộp vàng **`✂️ Chưa có ảnh bộ phận tách rời? Lấy ảnh hiện có của <Pet>`** tự động gom ảnh sẵn có của pet đó (`C1–C5`, hoặc phôi tham chiếu cùng nhóm / khung trống chuẩn).
  - Bấm **`⚡ Dùng ảnh này & Mở Studio cắt/vẽ ngay`** để khởi tạo nhanh Rig với `body` và mở thẳng Studio cho họa sĩ cắt sửa.
  - Hoặc bấm **`📥 + Đưa vào danh sách để tách nhiều lớp`** nhiều lần (`body`, `head`, `armL`, `armR`…) rồi bấm **`✂️ Cắt / Vẽ lại`** ngay trên từng dòng trước khi bấm **Tạo rig nháp**.
- **Cách B — Đã có sẵn file PNG/WebP tách lớp trên máy:**
  1. Chọn **`+ Chọn nhiều ảnh PNG / WebP`** — hệ thống tự nhận bộ phận theo tên file (`body, head, crown, armL, armR, front, fx, aura, eye0, eye1`).
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
- Ngay tại khung thêm bộ phận dưới danh sách lớp:
  - Chọn tên bộ phận muốn thêm (mặc định tự gợi ý bộ phận tiếp theo chưa có như `head (Đầu)` → `armL` → `armR` → `crown` → `eye0` → `eye1`).
  - Bấm **`✂️ + Lấy ảnh gốc`**: hệ thống lấy ngay **ảnh gốc nguyên bản của pet cấp hiện tại** (hoặc lớp `body` đang có — có thể đổi nhanh ở dòng `Nguồn gốc:` ngay bên dưới) đưa vào Studio, tự động bật sẵn công cụ **Chọn tự do (`L`)** để họa sĩ khoanh vùng Đầu/Tay/Mắt → bấm **`✂️ Giữ vùng chọn`** → bấm **`💾 Lưu bản nháp`** (với `eye0`/`eye1` hệ thống còn tự động lưu toạ độ mắt trên mặt rồi crop gọn ảnh mắt).
  - Hoặc bấm **`📁 + Tải file`** bên cạnh nếu muốn tải file PNG/WebP tách lẻ từ máy tính; nút **`Thay hình`** để đổi ảnh của lớp đang có, nút **`✂️ Lấy ảnh pet`** nếu bộ phận bị thiếu ảnh, hoặc **`✕`** để xoá lớp khỏi rig.

### 5.3. Vẽ / cắt / tẩy trực tiếp lên file bộ phận (`✏️ Sửa` · `✂️ Lấy ảnh pet`)
Bấm nút **`✏️ Sửa`** (hoặc **`✂️ Lấy ảnh pet`**) trên bộ phận để mở **Trình sửa ảnh Studio 3 cột**:
- **Thanh công cụ trái**:
  - `B` **Cọ vẽ** · `E` **Tẩy (về trong suốt)** · `G` **Tô vùng** · `I` **Hút màu** (hoặc giữ `Alt + Click` khi đang vẽ)
  - `M` **Chọn chữ nhật** · `O` **Chọn bầu dục** · `L` **Chọn tự do (Lasso)** · `W` **Đũa thần chọn theo màu** · `V` **Di chuyển nội dung lớp**
- **Sân khấu giữa**: nền tối tương phản cao, **📏 Thước đo pixel** trục X/Y bám con trỏ, **# Lưới pixel** (khi zoom ≥ 400%), thu phóng (`−` / `+` / `Vừa` / `Ctrl + cuộn chuột`).
- **Bảng thuộc tính & Layer phải**:
  - **Tuỳ chỉnh cọ**: 3 đầu cọ (`Tròn`, `Vuông pixel`, `Nét nghiêng`), cỡ cọ (`[ ]`), độ đậm, độ cứng viền, khoảng cách nét, làm mượt nét, khung xem trước nét cọ, bảng màu & màu vừa dùng.
  - **Thao tác vùng chọn**: nút **`✂️ Giữ vùng chọn`** (1 chạm giữ lại phần vừa khoanh Lasso/Đũa thần và xoá sạch toàn bộ bên ngoài để tách Đầu/Tay cực nhanh), `Delete` xoá vùng chọn, `Ctrl+Shift+I` đảo ngược, `Ctrl+J` tách sang Layer mới, `Ctrl+D` bỏ chọn.
  - **Mục `✂️ Ảnh pet hiện có`**: chọn bất kỳ ảnh sẵn có nào của pet và bấm **`📥 Chèn để cắt`** (đưa vào Layer mới + bật Lasso) hoặc **`👻 Làm phôi vẽ lại`** (đặt làm lớp phôi mờ `38%` khoá ở dưới + tạo sẵn Layer trống ở trên để họa sĩ đi nét lại).
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

### 8.1. Tab **🧪 Xem trước khi học** (chỉ quản trị viên, chỉ đọc)

Bấm nút **🧪 Xem trước khi học** (từ màn hình Tổng quan hoặc thanh công cụ Bàn chỉnh) để mở phòng kiểm thử dùng chung runtime `PetRig` thật với app người học:

- **Chọn pet, cấp & công tắc nguồn dữ liệu**: chuyển đổi giữa **👁 Bản người học thấy** (`GET /api/pet-motion/:petId`, chỉ phát động tác đã duyệt theo đúng quy tắc fallback) và **📝 Bản nháp** (dữ liệu đang chỉnh).
- **3 chế độ ngữ cảnh**:
  - **🏠 Ở nhà**: chạm đầu/thân, kéo thả, chạm 6 lần liên tục (chóng mặt) trực tiếp trên pet; nút **Cho ăn**, **Vắng 1 ngày rồi mở app**, **Tiến hoá** và công tắc **⏩ Tua nhanh ×10** để kiểm tra `sleepy` (6s) / `sleep` (12s).
  - **📚 Bài học**: quiz mẫu 8 câu từ vựng phát đúng chuỗi sự kiện thật (`lesson_start`, `question_shown`, `answer_correct`, `answer_wrong`, `streak`, `lesson_done`), nút **🎤 Giữ để nói** giả lập micro và nút **🔊 Pet đọc mẫu** (`speechSynthesis`).
  - **⚔️ Trận đấu**: nút phát đủ 7 sự kiện Đấu trường (`battle_start` → `battle_lose`).
- **Thanh Gắn bó (0–1500) & Kỹ năng mạnh nhất**: xem trước cử chỉ theo mốc (`60 / 200 / 500 / 1200`) và đạo cụ `prop_<kỹ năng>`.
- **📋 Nhật ký sự kiện**: hiển thị `sự kiện → clip đã phát`, **đánh dấu đỏ** các clip bị bỏ qua vì chưa duyệt kèm phím tắt mở thẳng bàn chỉnh cho clip còn thiếu. Tab hoàn toàn **chỉ đọc**, không ghi gì lên server.

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
- **Cấu hình Nginx & cơ chế `/raw`**: giữ `location ^~ /api/` trong [nginx-spa.conf](../nginx-spa.conf). Đồng thời toàn bộ URL ảnh động do API trả về đã tự gắn hậu tố `/raw` (`/api/.../*.webp/raw`, vẫn hỗ trợ song song URL cũ) để không bao giờ bị rule regex ảnh tĩnh `\.(png|webp)$` của Nginx chặn nhầm thành `404`.
