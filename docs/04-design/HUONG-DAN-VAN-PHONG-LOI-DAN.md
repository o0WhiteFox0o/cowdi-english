# Hướng dẫn văn phong Lời dẫn & Hội thoại Mở ải (Cowdi English)

Ngày ban hành: **28/11/2026** · Nguồn chuẩn mực: 12 bài mẫu `lesson.story` gốc (`int-u1` → `int-u3`) · Áp dụng cho **toàn bộ 221+ bài học** (Mới học · Trung bình · Luyện thi / Nâng cao).

---

## 1. Nguồn sự thật & Cấu trúc dữ liệu tách bạch

Mỗi bài học khai báo trực tiếp khối `story` ngay trong file bài học (`src/data/lessons/.../*.js`). Khi hiển thị màn Mở ải (`StageIntro`), hệ thống đọc theo thứ tự ưu tiên:

1. **`lesson.story`** trong file bài học (**nguồn sự thật số 1**).
2. **`shared/story-season2.js`** (chỉ làm fallback nếu bài chưa khai báo trường tương ứng; giữ thoại màn con `slots` & thoại Boss theo tập).
3. **`shared/story-defaults.js`** (fallback mặc định theo unit/vùng cho bài chưa viết tay).

### Cấu trúc bắt buộc (3 trường tách bạch, không gộp)

```js
story: {
  scene_id: 'bd_ben_go', // Mã cảnh nền trong shared/regions.js (SCENES)
  intro_vi: 'Sương dày quá, đò chưa sang sông được. Con giúp ông chào khách trên bến gỗ nha!',
  dialogue: {
    speaker_id: 'ong_tu',                  // Người nói hiện trên ảnh hero (HUMAN_CAST hoặc pet chủ nhà vùng)
    text_en: 'Good morning! Nice to meet you.', // Chỉ câu tiếng Anh, TTS đọc lang="en-US"
  },
},
```

**Quy tắc cứng (kiểm tra tự động bởi `npm run validate:levels` và `node scripts/validate-lessons.mjs`):**
- **KHÔNG** gộp lời dẫn tiếng Việt vào câu thoại của nhân vật trong bong bóng trên ảnh hero.
- **KHÔNG** đưa ký tự tiếng Việt có dấu vào `dialogue.text_en` (nút loa bong bóng luôn đọc `en-US`).
- **KHÔNG** khai báo `boss` riêng trong bài học hoặc trong `lesson.story` — Boss luôn gắn với **Vùng** trong `shared/regions.js` (`REGIONS[code].boss`).

---

## 2. Văn phong `intro_vi` (Lời dẫn truyện tiếng Việt)

`intro_vi` hiển thị thành một khối riêng **ngay dưới ảnh hero**, có nút loa `vi-VN` riêng. Văn phong được chuẩn hoá từ 12 bài mẫu gốc (`greetings` → `hobbies`):

### Công thức 2 câu vàng (15–26 chữ, tối đa 30 chữ)

| Thành phần | Mục tiêu | Ví dụ chuẩn từ bài mẫu |
|---|---|---|
| **Câu 1 — Bối cảnh trực tiếp** | Đặt ngay vào không gian nhìn thấy trên ảnh `scene_id` (thời tiết, đồ vật, tình huống đời thường tại vùng). **Đứng độc lập được**, không bắt người học nhớ "tập trước". | *"Sương dày quá, đò chưa sang sông được."* / *"Gió Tháp Gió thổi bay mất ghi chú lớp học rồi."* / *"Ngôi nhà nhỏ gần Vườn Sữa có nhiều phòng ấm cúng lắm."* |
| **Câu 2 — Lời mời hành động** | Mời người học **cùng / giúp đúng nhân vật `speaker_id`** giải quyết đúng chủ đề bài học, giọng ấm áp, gần gũi. | *"Con giúp ông chào khách trên bến gỗ nha!"* / *"Con giúp thầy Tom sắp lại từ vựng trường học nhé!"* / *"Con cùng Minh gọi tên từng phòng và đồ đạc nha!"* |

### 6 nguyên tắc viết `intro_vi`

1. **Khớp 100% với nhân vật trên hình (`speaker_id`)**: Nếu ảnh hiện **ông Tư**, lời dẫn gọi là `"ông"`; nếu ảnh hiện **thầy Tom**, lời dẫn nhắc `"thầy Tom"`; nếu ảnh hiện **Owlbert**, lời dẫn nhắc `"Owlbert"`. Không để ảnh một nhân vật mà lời dẫn kể chuyện người khác.
2. **Đứng độc lập ở mọi ải**: Người học mở thẳng bài nào cũng hiểu ngay tình huống trong 1 lần đọc, không phụ thuộc màn cutscene hay tập trước.
3. **Gần gũi, cụ thể, đời thường**: Gắn trực tiếp với hành động thật (*chào khách, xem ảnh gia đình, gọi màu cờ, đếm khách lên đò, sắp ghi chú, quan sát thời tiết, chọn quần áo*). Tránh hình ảnh trừu tượng hoặc kịch tính quá đà (*"sương nuốt hết lời chào"*, *"sương làm quên tên"*).
4. **Không dọa, không chê, không tạo áp lực**: Không nhắc phạt, không nhắc hết giờ, không nhắc Gem/tiền. Luôn mang tinh thần đồng hành (*"giúp …"*, *"cùng …"*, *"chia sẻ …"*).
5. **Độ dài chuẩn**: 1–2 câu ngắn, **15–26 chữ** (giới hạn cứng **≤ 30 chữ** trong `schema.js`) để hiển thị gọn 2–3 dòng trên màn hình điện thoại `360px` mà không cần cuộn hay cắt chữ.
6. **Xưng hô phù hợp theo 3 nhóm học**:
   - **Mới học (`starter`, 5–8 tuổi)** & **Trung bình (`intermediate`, tiểu học–THCS)**: xưng `"con"` / `"mình"`, kết câu bằng `"nha!"` hoặc `"nhé!"`.
   - **Luyện thi & Nâng cao (`ielts`, `toeic`, `b1`, `b2`, `advanced`)**: xưng `"bạn"` / `"mình"`, giọng gọn gàng, thực tế, truyền động lực (*"Cùng anh Khoa đọc nhanh đoạn này để tìm ý chính nhé!"*), tránh giọng quá trẻ con nhưng vẫn giữ sự thân thiện của Cowdi.

---

## 3. Văn phong `dialogue.text_en` (Câu thoại tiếng Anh trên ảnh hero)

`dialogue.text_en` nằm trong bong bóng thoại trên ảnh hero (tối đa 2 dòng, tự co chữ, nút loa đọc `en-US`).

- **Độ dài**: **3–8 từ** (tối đa 10 từ, lý tưởng ≤ 40 ký tự để nằm gọn 1–2 dòng trên mobile).
- **Trình độ & nội dung**: Lấy ngay một câu giao tiếp ngắn chứa **từ vựng hoặc mẫu câu trọng tâm** của chính bài đó.
- **Đúng vai `speaker_id`**:
  - `ong_tu` chào khách trên bến: `"Good morning! Nice to meet you."`
  - `tom` (thầy Tom) nói ở lớp: `"Open your notebooks, please!"`
  - `owlbert` hỏi thời tiết: `"What's the weather like today?"`
  - `mai` chọn quần áo: `"What should I wear today?"`
- **Chỉ dùng tiếng Anh thuần**: Không chèn dấu tiếng Việt, không dùng ký hiệu `___` hay chú thích trong ngoặc (để TTS `en-US` đọc tự nhiên).

---

## 4. Quy tắc chọn `speaker_id` và `scene_id`

### Nhân vật (`speaker_id`)
Chỉ dùng nhân vật có trong một trong hai nguồn:
- **Nhân vật người** (`shared/human-cast.js`): `ong_tu` (ông Tư), `tom` (thầy Tom), `minh` (Minh), `lan` (Lan), `mai` (Mai), `khoa` (anh Khoa).
- **Pet** (`src/data/pets.js` — ưu tiên pet chủ nhà của vùng trong `REGIONS[code].hosts`): `cowdi`, `owlbert`, `bamboo`, `storm`, `mimi`, `foxie`, `sprout`, `leo`, `sparky`, `pingu`, `flippy`, `pumpkin`, `draco`, `banh_bao`…

### Cảnh nền (`scene_id`)
- Tra mã sẵn có trong `SCENES` của `shared/regions.js` (ví dụ `bd_ben_go`, `tg_hom_thu`, `vs_day_phoi`, hoặc cảnh vùng chung `region_BD`, `region_TG`, `region_VS`, `region_CN`, `region_RM`, `region_CNS`…).
- Nếu thêm `scene_id` mới cho địa điểm mới, khai báo trong `SCENES` ở `shared/regions.js` kèm `name_vi`, `region`, `image` (trỏ ảnh WebP thật trong `public/image/`).

---

## 5. So sánh Nên viết vs Tránh viết

| Bài | ❌ Tránh viết (rời rạc / lệ thuộc cốt truyện ngoài) | ✅ Nên viết (chuẩn `lesson.story`) |
|---|---|---|
| `greetings` | *"Thầy Tom vừa cập bến mà sương nuốt hết lời chào. Con giúp Minh, Lan chào thầy cho đúng nha!"* *(nhảy đột ngột, lệch hình ông Tư)* | *"Sương dày quá, đò chưa sang sông được. Con giúp ông chào khách trên bến gỗ nha!"* *(khớp ngay hình ông Tư + bến gỗ)* |
| `school` | *"Thầy Tom gửi lịch kiểm tra qua Storm, mà sương xoá hết chữ trong thư."* *(nhiều chi tiết phụ, ảnh lại là Storm)* | *"Gió Tháp Gió thổi bay mất ghi chú lớp học rồi. Con giúp thầy Tom sắp lại từ vựng trường học nhé!"* *(ảnh là thầy Tom)* |
| `weather` | *"Mimi từ nơi rất xa tới, chưa biết gọi thời tiết ở đây."* *(tự dưng xuất hiện nhân vật lạ chưa giới thiệu)* | *"Trên đỉnh Tháp Gió trời đổi gió liên tục. Con cùng Owlbert quan sát rồi nói đúng thời tiết hôm nay nha!"* *(ảnh là Owlbert)* |
| `clothing` | *"Mai soạn đồ cho anh Minh đi Đà Lạt, mà sương làm Mai quên tên quần áo."* *(lệch bối cảnh Vườn Sữa)* | *"Hôm nay Mai ra Vườn Sữa thăm Cowdi mà chưa biết chọn đồ gì. Con giúp Mai gọi tên quần áo nhé!"* *(đúng Vườn Sữa + đúng chủ đề)* |

---

## 6. Mẫu chuẩn để áp dụng cho các bài sau

### Mẫu 1 — Bài Mới học (`starter`, xem file mẫu `src/data/lessons/_golden/s1-pets.js`)

```js
  story: {
    scene_id: 'region_VS',
    intro_vi: 'Trong phòng khách Vườn Sữa có nhiều bạn thú cưng đáng yêu lắm. Con cùng Mai gọi tên từng bạn nha!',
    dialogue: {
      speaker_id: 'mai',
      text_en: 'I have a cute cat!',
    },
  },
```

### Mẫu 2 — Bài Trung bình (`intermediate`, xem file mẫu `src/data/lessons/_golden/greetings.js` và 12 bài `src/data/lessons/general/*.js`)

```js
  story: {
    scene_id: 'bd_ben_go',
    intro_vi: 'Sương dày quá, đò chưa sang sông được. Con giúp ông chào khách trên bến gỗ nha!',
    dialogue: {
      speaker_id: 'ong_tu',
      text_en: 'Good morning! Nice to meet you.',
    },
  },
```

### Mẫu 3 — Bài Luyện thi / Nâng cao (`ielts`, `toeic`, `b1`, `b2`, `advanced`, xem `src/data/lessons/_golden/ielts-read-rooftop-farms.js`)

```js
  story: {
    scene_id: 'region_CN',
    intro_vi: 'Nhiều thành phố lớn đang trồng rau ngay trên mái nhà. Cùng anh Khoa đọc bài và bắt từ khoá paraphrase nhé!',
    dialogue: {
      speaker_id: 'khoa',
      text_en: 'Can rooftops become productive farms?',
    },
  },
```

---

## 7. Checklist trước khi commit bài mới

1. Khối `story` nằm ngay trong file bài học với đủ `scene_id`, `intro_vi`, `dialogue: { speaker_id, text_en }`.
2. `intro_vi` dài 15–28 chữ (≤ 30 chữ), khớp nhân vật `speaker_id`, đứng độc lập được.
3. `dialogue.text_en` dài 3–8 từ (≤ 10 từ), 100% tiếng Anh không dấu tiếng Việt, đúng chủ đề bài.
4. Không khai báo `boss` trong bài học.
5. Chạy xác thực tự động:
   ```bash
   npm run validate:levels
   node scripts/validate-lessons.mjs
   ```
   Cả hai phải báo **0 lỗi**.
