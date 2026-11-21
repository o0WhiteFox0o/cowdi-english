---
name: topic-card-illustrator
description: Chuyển thẻ chủ đề phẳng (emoji + tiêu đề + nghĩa tiếng Việt + số từ trên nền trắng) thành thẻ bài minh hoạ kiểu trading-card (viền màu đậm, tranh minh hoạ cartoon trong khung kính, banner tiêu đề, phụ đề tiếng Việt và số từ). Dùng khi người dùng yêu cầu "đổi style thẻ chủ đề", "làm card minh hoạ cho topic", "chuyển ảnh thẻ phẳng thành thẻ bài", hoặc gửi ảnh/danh sách topic từ vựng cần làm thẻ đẹp. Hỗ trợ 2 chế độ: trích dữ liệu từ ảnh thành `data/topics.json`, và tạo thẻ từ file đó.
---

# Topic Card Illustrator

Biến thẻ chủ đề **phẳng** (ảnh nguồn) thành thẻ **trading-card minh hoạ** (ảnh đích).

## Ảnh nguồn (INPUT) gồm
- Emoji/icon nhỏ ở giữa
- Tên tiếng Anh (chữ màu, font tròn)
- Nghĩa tiếng Việt (chữ xám)
- Số từ, ví dụ `169 từ`
- Nền trắng, bo góc, có thanh tiến độ mờ bên dưới

## Ảnh đích (OUTPUT) gồm
- Tỉ lệ thẻ dọc khoảng **260 x 420 px** (2:3.2), bo góc ~14px
- **Viền ngoài dày ~4px**, màu đậm theo chủ đề, nền thẻ cùng tông
- **Khung tranh** bo góc, viền mảnh cùng màu, phủ **vệt sáng chéo kiểu kính** (opacity ~15-20%)
- **Tranh minh hoạ cartoon** bên trong khung
- **Banner tiêu đề** (pill/chữ nhật bo góc) màu tối hơn nền thẻ, chữ trắng đậm, có 2 chấm hoặc điểm hình thoi `◆` hai bên
- Dòng dưới cùng: nghĩa tiếng Việt (trái, nhỏ, trắng ~70%) và `<N> TỪ` (phải, in đậm, viết hoa)

## Hai chế độ chạy

Người dùng có thể gọi từng chế độ riêng.

**Chế độ 1: Trích dữ liệu** (ví dụ: "đọc ảnh trong input/cards rồi tạo topics.json")
- Đọc mọi ảnh trong `input/cards/` (hoặc đường dẫn người dùng đưa).
- Ghi kết quả vào `data/topics.json`.
- Chữ bị cắt hoặc không chắc (ví dụ `Transportati...`) thì thêm trường `"note"` vào mục đó và hỏi lại người dùng, **không tự đoán**.
- **Dừng sau khi ghi file**, để người dùng duyệt và sửa. Không tạo ảnh ở chế độ này.

**Chế độ 2: Tạo thẻ** (ví dụ: "dùng skill topic-card-illustrator tạo thẻ bài")
- Mặc định đọc `data/topics.json`. Nếu chưa có file thì chạy chế độ 1 trước rồi dừng chờ người dùng duyệt.
- Mặc định xuất vào `output/cards/`. Nếu người dùng chỉ định thư mục khác thì xuất vào đó. Nếu thư mục nằm ngoài workspace mà không ghi được thì vẫn xuất vào `output/cards/` và báo lại đường dẫn.
- Làm **3 chủ đề đầu** cho người dùng duyệt phong cách, rồi mới làm phần còn lại. Bỏ qua bước duyệt nếu người dùng nói làm hết một lượt.
- Nếu có hơn 10 chủ đề, chia thành các lượt khoảng 5 đến 10 chủ đề để phong cách tranh không bị lệch.

## Quy trình

### Bước 1. Lấy dữ liệu
Đọc `data/topics.json`, một mảng gồm các mục:

```json
[
  { "id": "eating", "en": "Eating", "vi": "Ăn uống", "count": 154 }
]
```

- `id`: chữ thường, không dấu, dùng đặt tên file.
- Nếu người dùng đưa danh sách dạng chữ (`Human | Con người | 169`) thì chuyển thẳng thành JSON.
- Nếu chưa có dữ liệu thì chạy chế độ 1.

### Bước 2. Chọn bảng màu chủ đề
Mỗi chủ đề một màu chủ đạo, chọn theo ngữ nghĩa. Tham khảo:

| Chủ đề | Viền/nền thẻ | Banner (tối hơn) |
|---|---|---|
| Human | `#5B9BE0` xanh dương | `#1F4E9C` |
| Eating | `#FFE27A` vàng | `#C9830F` |
| Drinking | `#7A5240` nâu | `#4A2E22` |
| House | `#C0393B` đỏ | `#7E1418` |
| Transportation | `#6B7076` xám | `#2F3337` |

Chủ đề mới: chọn màu chủ đạo, banner = cùng hue, giảm độ sáng ~35-40%. Không dùng hai chủ đề trùng màu trong cùng bộ.

### Bước 3. Tạo tranh minh hoạ (dùng công cụ tạo ảnh)
Gọi tool tạo ảnh cho **từng chủ đề**, **không có chữ trong ảnh**. Dùng mẫu prompt:

```
Cute flat cartoon sticker illustration for the vocabulary topic "{en}" ({vi}).
Main subject: {mô tả 1 nhân vật/vật thể chính, rõ ràng, dễ nhận ra}.
2-3 small supporting objects related to the topic.
Style: bold clean dark outlines, soft cel shading, pastel-saturated colors,
kawaii Asian mobile-game art, consistent line weight.
Background: soft solid or gentle gradient in {màu nền nhạt cùng tông chủ đề}.
Composition: portrait 3:4, subject centered, filling the frame, slight overflow
of small items at corners.
NO text, NO letters, NO watermark, NO frame, NO border.
```

Gợi ý chủ thể mẫu: Human = cậu bé cầm kính lúp; Eating = bánh mì + đĩa + miếng bánh; Drinking = ly trà sữa trân châu + tách trà; House = sofa, đèn, cây, cửa sổ; Transportation = xe máy Vespa vàng + biển báo.

Giữ **cùng một phong cách** cho cả bộ: dùng chung đoạn "Style" ở trên, không đổi từ ngữ giữa các lần gọi.

Lưu ảnh vào `assets/cards/art/{id}.png`.

### Bước 4. Ghép thẻ bằng code (KHÔNG nhờ AI vẽ chữ)
Chữ phải chính xác và đúng dấu tiếng Việt nên ghép bằng HTML/CSS (hoặc React) rồi chụp bằng Playwright. Dùng font có hỗ trợ tiếng Việt: **Baloo 2** hoặc **Fredoka** cho tiêu đề, **Nunito** cho chữ nhỏ.

```html
<div class="card" style="--bg:#FFE27A; --banner:#C9830F">
  <div class="frame"><img src="art/eating.png"></div>
  <div class="banner"><i>◆</i><span>Eating</span><i>◆</i></div>
  <div class="meta"><span>Ăn uống</span><b>154 TỪ</b></div>
</div>
```

```css
.card{
  width:260px;height:420px;border-radius:14px;padding:26px 24px 12px;
  background:var(--bg);border:4px solid color-mix(in srgb,var(--bg) 70%,#000);
  position:relative;display:flex;flex-direction:column;gap:12px;
  box-shadow:0 4px 10px rgba(0,0,0,.18);
}
.frame{height:280px;border-radius:12px;overflow:hidden;position:relative;
  border:2px solid color-mix(in srgb,var(--bg) 65%,#000);background:#fff3}
.frame img{width:100%;height:100%;object-fit:cover}
.frame::after{content:"";position:absolute;inset:0;
  background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.22) 35% 50%,transparent 50% 62%,rgba(255,255,255,.14) 62% 70%,transparent 70%)}
.banner{background:var(--banner);color:#fff;border-radius:8px;height:46px;
  display:flex;align-items:center;justify-content:space-between;padding:0 10px;
  font:800 30px/1 "Baloo 2",sans-serif}
.banner i{font-size:9px;font-style:normal}
.meta{display:flex;justify-content:space-between;align-items:center;
  color:rgba(255,255,255,.75);font:600 13px "Nunito",sans-serif}
.meta b{color:#fff;font-weight:800}
```

Quy tắc chữ:
- Tên dài (như `Transportation`) → tự co cỡ chữ bằng JS (giảm font-size đến khi vừa banner), **không cắt chữ**.
- Nền card vàng sáng → chữ dòng meta dùng màu nâu đậm thay vì trắng để đủ tương phản.

### Bước 5. Xuất file
Trước khi chụp, kiểm tra Playwright. Nếu chưa có thì chạy `npm i -D playwright` và `npx playwright install chromium` (xin phép người dùng nếu được hỏi).

Dùng Playwright chụp từng `.card` (`omitBackground: true`, `deviceScaleFactor: 2`):

```
output/cards/{id}.png      # từng thẻ
output/cards/_preview.png  # hàng ngang tất cả thẻ, khoảng cách 24px
output/cards.zip           # nén tất cả thẻ để người dùng tải về một lần
```

Cuối cùng báo cho người dùng đường dẫn tuyệt đối của thư mục xuất và file zip.

### Bước 6. Kiểm tra trước khi giao
- [ ] Chữ tiếng Việt đúng dấu, không bị cắt
- [ ] Số từ khớp dữ liệu nguồn
- [ ] Cả bộ cùng một phong cách tranh và cùng kích thước thẻ
- [ ] Màu banner đủ tương phản với chữ trắng
- [ ] Không có chữ lạ hay watermark trong tranh AI (nếu có, tạo lại ảnh đó)

## Lưu ý
- Nếu người dùng muốn dùng trong web (React/TS), xuất thêm component `TopicCard.tsx` nhận props `{ en, vi, count, color, banner, art }` với CSS ở trên.
- Không bịa số từ hoặc tên chủ đề; thiếu dữ liệu thì hỏi lại.
- Chỉ đổi style thẻ, giữ nguyên nội dung dữ liệu.
