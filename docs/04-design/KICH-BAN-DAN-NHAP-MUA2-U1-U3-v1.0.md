# KỊCH BẢN DẪN NHẬP MÙA 2 · int-u1 → int-u3 · v1.0

> [!NOTE]
> **Cập nhật 28/11/2026:** Lời dẫn Mở ải (`intro_vi`) và hội thoại (`dialogue`) ưu tiên trực tiếp từ `lesson.story` trong từng file bài học theo chuẩn văn phong tại [HUONG-DAN-VAN-PHONG-LOI-DAN.md](HUONG-DAN-VAN-PHONG-LOI-DAN.md). File `shared/story-season2.js` giữ thoại màn con (`slots`), thoại Boss (`bossStory`) và fallback đồng bộ với `lesson.story`.

Ngày 28/11/2026 · Nguồn: Story Bible v1.0 (3.2, 4.3, 5.1–5.5, 6.2, 6.4, 7.2, 8) · Dữ liệu máy đọc: `shared/story-season2.js` · Trạng thái: **chờ Sonny duyệt**

## 0. Tóm tắt (Recommendation)

- Mỗi unit = **một tập phim** có một pet bị Sương Câm (The Hush) che phủ. Pet đó là **Boss C5 (Legendary)** của mọi Màn 6 trong unit.
- Mỗi bài = **một cảnh** gắn đúng đoạn đọc đã viết (không viết lại bài), thắp sáng **một điểm mốc** của vùng.
- Mỗi bài thắng Màn 6 → sương quanh Boss **mỏng đi 1/4**, Boss "lùi lại". Qua **kiểm tra unit** → Boss được giải sương, hiện màu thật, nói câu Truth.
- 12 bài × 6 màn = **72 câu dẫn nhập riêng**, không câu nào lặp (đã kiểm bằng script). Câu dẫn của màn 2–5 viết để đứng một mình được, vì thứ tự màn bị trộn.
- Tuyến phụ Shadow: mỗi tập để lại **1 manh mối**; đủ 3 manh mối trước int-u8 theo luật gài twist (Story Bible 5.5).

## 1. Luật hình ảnh pet (Sonny chốt 28/11)

| Vai | Hình dùng | Ghi chú |
|---|---|---|
| Pet đồng hành của người học | Đúng cấp hiện tại | Không đổi |
| Pet **khác** dẫn truyện | **C4 Super** (mặc định) hoặc C5 | Không bao giờ dùng C1–C3 |
| Boss Màn 6 | **C5 Legendary** + lớp sương phủ | Độ đậm sương = `bossFogLevel()` |
| Boss trùng loài với pet đồng hành | Dùng `boss.alt` (cũng C5) | Tránh "đánh nhau với chính pet mình" |
| Nhân vật người (ông Tư, Minh, Lan, Mai, thầy Tom, anh Khoa) | Hình người như hiện có | Không áp luật cấp |

Đối chiếu repo `src/data/pets.js`: `evolutions[i].stage = C − 1` → C4 = `evolutions[3]` (`*_Super.webp`/`*_super.webp`), C5 = `evolutions[4]` (`*_Legendary.webp`/`*_legendary.webp`). Đã kiểm có đủ ảnh C4/C5 cho: Flippy, Pingu, Owlbert, Mimi, Storm, Bamboo, Bamboo Spirit, Cowdi.

## 2. Vì sao chọn 3 Boss này

| Unit | Vùng | Boss C5 | Khớp Story Bible | Khớp bài học |
|---|---|---|---|---|
| int-u1 | Bến Đò Ông Tư | **Legendary Flippy** | Flippy là người đón khách; Lie "Hỏi lại là xấu hổ" → gật gù cho qua | Chào hỏi, giới thiệu, đếm khách: toàn câu "đón người lạ" |
| int-u2 | Tháp Gió | **Legendary Owlbert** | Thủ thư Tháp Gió, hay sửa lỗi; Lie "Đúng luật là đủ" | Ghi chú lớp, thư, bảng tin nghề: toàn chữ viết |
| int-u3 | Vườn Sữa | **Legendary Linh Trúc** (Bamboo Spirit) | "Linh hồn rừng trúc sau Vườn Sữa, bị sương lấy tiếng" | Cảm xúc + Bamboo học lắng nghe (twist 5.3 của Bamboo) |

Bến Đò không có pet chủ nhà (chủ nhà là ông Tư), nên chọn Flippy: pet nước, vai "đón khách", hợp tập "thầy Tom cập bến". **Assumption:** chưa dùng Bánh Bao vì chưa có ảnh C4/C5 trong repo.

## 3. Cấu trúc dẫn nhập trong một unit

```
Tới vùng (1 câu, pet chủ nhà C4)  →  [Về quê nếu pet đồng hành là người vùng này]
  └─ Bài 1..4: Mở ải → Màn 1 Gặp từ → Màn 2–5 (trộn) → Màn 6 Boss (Boss C5, sương đậm dần nhạt)
                └─ Qua bài: điểm mốc sáng lên
Kiểm tra unit = giải sương: Boss hiện màu thật, nói Truth  →  Manh mối Shadow  →  Kết tập
```

Thứ tự ưu tiên câu dẫn của một màn: `SEASON2_LESSONS[bài].slots[slot]` → kho `screen_intro` theo mã màn × vùng → câu chung. Như vậy bài có kịch bản luôn có dẫn nhập mới, bài chưa có vẫn chạy.

## 4. Quy tắc thoại đã áp (Story Bible 8)

- Không có câu pet buồn/ốm vì người học vắng, không đếm ngược, không nhắc Gem.
- Sai không bị chê: thoại "Sai" của Boss luôn kèm "không sao, thử lại". Đây chính là chủ đề "nói sai không đáng sợ".
- Owlbert gạch đỏ là **hành vi của Lie** khi bị sương phủ; lúc giải sương Owlbert nói Truth "hỏi ý trước rồi mới sửa". Không để Owlbert gạch đỏ chữ của người học thật trong giao diện.
- Câu tiếng Việt ≤ 25 chữ; câu tiếng Anh ≤ 8 từ, ưu tiên từ của bài (cấp 2 = A2 có phụ đề Việt).
- Boss không bị "đánh bại": thắng = sương tan, pet được tự do.

## 5. Kịch bản từng tập và từng bài


## int-u1 · Tập 1 · Chuyến đò đầu tiên

**Tiền đề:** Thầy Tom vừa cập Bến Đò Ông Tư. Sương Câm phủ bến, ai cũng ngại mở lời chào người lạ.

**Tuyến Minh:** Minh lần đầu dám chào thầy Tom bằng tiếng Anh.

**Tới vùng** (Ông Tư): "Sương phủ kín bến rồi. Thầy Tom mới tới mà chưa ai dám chào." — *Hello! Welcome to the river.*

**Boss C5: Legendary Flippy** (trùng pet đồng hành → Legendary Pingu). Lie: "Hỏi lại là xấu hổ."

> Flippy ngược sông lên đón thầy Tom. Sương làm Flippy ngại hỏi lại, nên ai nói gì cũng gật đầu cho qua dù không hiểu.

| Lúc | Thoại |
|---|---|
| Vào trận | Flippy gật gù trong sương: "Yes… yes… yes…" mà mắt thì ngơ ngác. |
| Đúng | Đúng rồi! Sương quanh Flippy mỏng đi một chút.<br>Flippy ngẩng lên nghe con nói kìa!<br>Con nói rõ quá, Flippy thôi gật bừa rồi! |
| Sai | Flippy lại gật cho qua. Không sao, mình nói lại nha!<br>Sương dày thêm chút xíu. Sai cũng được, thử tiếp nào! |
| Thắng Màn 6 (bài thường) | Flippy lùi xuống sông, sương quanh bến tan thêm một khúc. |
| Qua kiểm tra unit (giải sương) | Flippy cười toe: hỏi lại không xấu hổ chút nào! — *Could you say that again?* |
| Thua | Flippy vẫn gật gù trong sương. Ôn lại rồi mình quay lại nha! |

**Manh mối Shadow:** Sương rút về phía tây, nơi Rừng Tràm. Xa xa có tiếng hú rất khẽ, rồi tắt.

**Kết tập** (Ông Tư): "Ông học được chữ "Hello" từ con đó. Học từ cháu cũng là học!"

### Bài greetings · Điểm mốc: Bến gỗ · Dẫn: Ông Tư

*Cảnh:* Thầy Tom lên bờ. Minh và Lan ngại chào. Sáng mai là ngày đầu lớp thầy Tom (đoạn đọc).

**Mở ải:** "Thầy Tom vừa cập bến mà sương nuốt hết lời chào. Con giúp Minh, Lan chào thầy cho đúng nha!" — *Good morning! Nice to meet you.*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Lời chào rơi xuống sông hết rồi. Mình gặp lại từng lời chào nha! | Hello! Hi! Good morning! |
| Nghe | Khách trên bến nói gì đó mà sương che mất. Con nghe giùm ông nha! | Nice to meet you! |
| Đọc | Sương xoá chữ trên tấm bảng chào khách. Đọc kỹ rồi tìm lại nha! | Welcome! Please sit here. |
| Viết | Bảng gỗ ở bến mất chữ rồi. Con viết lại lời chào giùm ông nha! | Good morning, Mr. Tom! |
| Nói | Đò sắp chạy rồi! Con chào thầy Tom thật to nha! | Hello! I'm Minh. |
| Màn 6 · Boss | Có ai đứng gật gù mãi trong sương kìa. Mình lại gần hỏi thử nha! | Excuse me, are you okay? |

**Qua bài:** Bến gỗ sáng lên! Thầy Tom chào lại cả lớp.

### Bài family · Điểm mốc: Ghế khách trên đò · Dẫn: Lan

*Cảnh:* Trên đò, Lan cho Minh xem ảnh gia đình (đoạn đọc). Sương làm mờ tấm ảnh.

**Mở ải:** "Trên đò, Lan cho Minh xem ảnh gia đình. Sương làm mờ tấm ảnh rồi, con giúp hai bạn giới thiệu nha!" — *This is my mother.*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Ai trong tấm ảnh vậy ta? Mình gặp từng người thân nha! | Father, mother, brother, sister. |
| Nghe | Lan kể về gia đình mà gió sông thổi lạc chữ. Nghe kỹ nha! | This is my father. |
| Đọc | Mặt sau tấm ảnh ghi tên mọi người, mà sương che rồi. Đọc thử nha! | My grandfather and grandmother. |
| Viết | Lan muốn viết lời giới thiệu gia đình gửi thầy Tom. Ghép giúp bạn nha! | I have one brother. |
| Nói | Ông Tư hỏi: "Ai đây con?" Con trả lời giùm Lan nha! | She is my mother. |
| Màn 6 · Boss | Sương lại kéo về phía mũi đò. Có ai đang đứng im ở đó… | Who is that? |

**Qua bài:** Ghế khách trên đò sáng lên! Ông Tư nhớ tên cả nhà Lan rồi.

### Bài colors · Điểm mốc: Cờ hiệu mũi đò · Dẫn: Lan

*Cảnh:* Đò chở gánh áo đi chợ; Lan chọn áo (đoạn đọc). Cờ hiệu mũi đò mất màu.

**Mở ải:** "Cờ hiệu trên đò mất hết màu trong sương. Con giúp Lan gọi lại tên từng màu nha!" — *What color do you like?*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Màu sắc trốn vào sương rồi. Mình gặp lại từng màu nha! | Red, blue, yellow, green. |
| Nghe | Cô bán áo trên đò gọi tên màu, mà sương che mất. Nghe giùm Lan nha! | I like the blue shirt. |
| Đọc | Tấm bảng giá áo bị phai chữ. Đọc kỹ tìm màu nha! | It is a pink T-shirt. |
| Viết | Lan muốn ghi màu áo cho bé Mai. Ghép chữ giúp Lan nha! | Mai loves pink and purple. |
| Nói | Hỏi thầy Tom thích màu gì đi con! | What color do you like? |
| Màn 6 · Boss | Cờ vừa có màu thì sương xám lại cuộn tới… | Where are the colors? |

**Qua bài:** Cờ hiệu bay đủ màu rồi! Chiếc đò sáng rực giữa sông.

### Bài numbers · Điểm mốc: Cọc đếm khách · Dẫn: Ông Tư

*Cảnh:* Ông Tư đếm khách và hàng; Minh đếm đồ trong cặp (đoạn đọc).

**Mở ải:** "Khách lên đò đông quá mà sương làm ông đếm lộn. Con đếm giúp ông trước khi đò chạy nha!" — *How many people are there?*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Mình gặp lại các con số nha, từ zero tới hundred! | One, two, three… |
| Nghe | Khách nói số vé mà ông nghe không rõ. Con nghe giúp nha! | Two tickets, please. |
| Đọc | Sổ đếm khách của ông bị sương thấm ướt. Đọc lại giúp ông nha! | There are twelve people. |
| Viết | Ông cần ghi số khách lên cọc gỗ. Con viết giúp ông nha! | Fifteen people on the boat. |
| Nói | Bé Mai hỏi con mấy tuổi kìa. Trả lời bằng tiếng Anh nha! | I am … years old. |
| Màn 6 · Boss | Đủ khách rồi, nhưng giữa sông có ai cứ gật đầu mãi trong sương… | Hello? Are you okay? |

**Qua bài:** Cọc đếm khách sáng lên! Đò rời bến, sương mỏng dần.

## int-u2 · Tập 2 · Lá thư không tới

**Tiền đề:** Tháp Gió là nơi gửi thư của cù lao. Thư lớp thầy Tom kẹt trên đỉnh tháp vì ai viết sai một chữ cũng bị gạch đỏ.

**Tuyến Minh:** Minh gửi được lá thư tiếng Anh đầu tiên dù còn lỗi.

**Tới vùng** (Storm): "Gió vẫn thổi mà thư không bay được. Sương kẹt trên đỉnh tháp rồi!" — *Let's do it together.*

**Boss C5: Legendary Owlbert** (trùng pet đồng hành → Legendary Mimi). Lie: "Đúng luật là đủ."

> Owlbert là thủ thư Tháp Gió. Sương làm Owlbert gạch đỏ mọi chữ sai, nên không ai dám viết thư nữa và tháp im lặng.

| Lúc | Thoại |
|---|---|
| Vào trận | Owlbert cầm bút đỏ, lẩm bẩm: "Sai… sai… sai…" Cả tháp im phăng phắc. |
| Đúng | Đúng ý rồi! Mắt Owlbert sáng lên một chút.<br>Owlbert dừng bút, đọc lại câu của con kìa.<br>Một lá thư vừa bay khỏi tháp! |
| Sai | Owlbert gạch một nét. Không sao, mình viết tiếp nha!<br>Sai một chút thôi, ý của con vẫn rõ mà. Thử lại nào! |
| Thắng Màn 6 (bài thường) | Owlbert bay vào thư viện, ôm theo một lá thư chưa gạch. |
| Qua kiểm tra unit (giải sương) | Owlbert gác bút đỏ: hỏi ý người viết trước, rồi mới sửa. — *What do you mean?* |
| Thua | Sương còn quanh đỉnh tháp. Ôn lại rồi mình leo lên tiếp nha! |

**Manh mối Shadow:** Trong chồng thư có một lá không tên, nét chữ như vết cào trên thân tràm.

**Kết tập** (Storm): "Thư bay hết rồi! Lần sau mình cùng đi đưa thư nha."

### Bài school · Điểm mốc: Hòm thư lớp học · Dẫn: Storm

*Cảnh:* Thầy Tom gửi lịch kiểm tra qua Storm; thư bị sương xoá. Minh và Lan trước giờ kiểm tra (đoạn đọc).

**Mở ải:** "Thầy Tom gửi lịch kiểm tra qua Storm, mà sương xoá hết chữ trong thư. Con giúp viết lại nha!" — *The exam is in the classroom.*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Mình gặp lại đồ dùng ở trường nha: book, pencil, desk… | Book, pencil, notebook. |
| Nghe | Thầy Tom đọc lịch học theo gió. Con nghe kỹ giúp Minh nha! | English is my favorite subject. |
| Đọc | Lá thư của thầy bị sương phủ mấy chỗ. Đọc tìm chữ nha! | The library is next to the classroom. |
| Viết | Storm chờ thư mới để bay đi. Con ghép câu giúp thầy nha! | The pencil is on the desk. |
| Nói | Lan tìm không ra cây bút chì. Con nói cho Lan biết nó ở đâu nha! | Your pencil is on the desk. |
| Màn 6 · Boss | Thư lên tới đỉnh tháp thì bị giữ lại. Có ai đang gạch đỏ từng chữ… | Who is in the tower? |

**Qua bài:** Hòm thư lớp học sáng lên! Storm bay đi đưa thư rồi.

### Bài weather · Điểm mốc: Chong chóng đo gió · Dẫn: Mimi

*Cảnh:* Mimi từ nơi rất xa tới, hỏi thời tiết ở cù lao; Minh và Lan lên kế hoạch cuối tuần (đoạn đọc).

**Mở ải:** "Mimi từ nơi rất xa tới, chưa biết gọi thời tiết ở đây. Con kể Mimi nghe trời hôm nay nha!" — *What's the weather like today?*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Nắng, mưa, gió, mây… mình gặp từng kiểu trời nha! | Sunny, rainy, windy, cloudy. |
| Nghe | Chong chóng trên tháp đang báo thời tiết. Nghe giùm Mimi nha! | It is sunny and warm. |
| Đọc | Bảng dự báo của tháp mờ sương rồi. Đọc xem cuối tuần ra sao nha! | Sunday may be cloudy. |
| Viết | Mimi muốn ghi thời tiết vào sổ tay. Con ghép giúp nha! | It is windy today. |
| Nói | Mimi hỏi con thích mùa nào nhất. Trả lời Mimi nha! | I like spring. |
| Màn 6 · Boss | Gió đổi hướng, kéo sương lên đỉnh tháp… | The fog is coming! |

**Qua bài:** Chong chóng quay tít! Mimi nhớ được cả bốn mùa rồi.

### Bài jobs · Điểm mốc: Bảng tin nghề nghiệp · Dẫn: Anh Khoa

*Cảnh:* Bảng tin dưới chân tháp mất tên nghề; lớp Minh kể ước mơ nghề nghiệp (đoạn đọc).

**Mở ải:** "Bảng tin dưới chân tháp mất hết tên nghề. Con cùng anh Khoa gắn lại cho đúng nha!" — *What does your father do?*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Mình gặp các nghề quen nha: doctor, nurse, chef… | Doctor, nurse, farmer. |
| Nghe | Storm đọc thư mời các cô chú làm nghề. Nghe kỹ nha! | He is an engineer. |
| Đọc | Mấy tấm thẻ nghề bị sương phủ. Đọc tìm đúng nghề nha! | A farmer grows rice. |
| Viết | Anh Khoa viết thiệp cảm ơn cô y tá. Ghép giúp anh nha! | She is a nurse. |
| Nói | Anh Khoa hỏi con muốn làm nghề gì. Trả lời anh nha! | I want to be a pilot. |
| Màn 6 · Boss | Tấm thiệp vừa viết xong đã bị gạch đỏ. Ai vậy ta? | Is it wrong? |

**Qua bài:** Bảng tin nghề sáng lên! Ai cũng tìm được thư của mình.

### Bài body · Điểm mốc: Sân tập dưới chân tháp · Dẫn: Lan

*Cảnh:* Giờ thể dục của thầy Tom dưới chân tháp (đoạn đọc).

**Mở ải:** "Gió lộng dưới chân tháp, thầy Tom cho cả lớp khởi động. Con giúp Lan làm đúng lời thầy nha!" — *Raise your arm, please.*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Mình gặp các bộ phận cơ thể nha: head, arm, leg… | Head, eye, ear, nose. |
| Nghe | Thầy Tom hô theo gió. Nghe đúng bộ phận nha! | Turn your head slowly. |
| Đọc | Tấm hướng dẫn khởi động bị sương che. Đọc tìm chữ nha! | Stretch your legs. |
| Viết | Lan ghi lại bài khởi động. Con ghép giúp Lan nha! | Wash your hands. |
| Nói | Minh bị đau chân rồi. Con nói giúp Minh với thầy nha! | My foot hurts. |
| Màn 6 · Boss | Khởi động xong rồi! Giờ mình leo lên đỉnh tháp nha! | Let's go up the tower! |

**Qua bài:** Sân tập sáng lên! Cả lớp đứng chờ dưới chân tháp.

## int-u3 · Tập 3 · Rừng trúc không lên tiếng

**Tiền đề:** Sương Câm lấy mất tiếng của Linh Trúc, linh hồn rừng trúc sau Vườn Sữa. Bamboo nói liên tục để khỏi nghe sự im lặng.

**Tuyến Minh:** Minh mời Lan về nhà mới và nói tiếng Anh cả buổi.

**Tới vùng** (Bamboo): "Rừng trúc im quá, mình phải nói liên tục cho đỡ sợ!" — *How do you feel?*

**Về quê** (nếu pet đồng hành là Cowdi): "Về nhà rồi! Mà sao Vườn Sữa im ắng vậy ta?"

**Boss C5: Legendary Linh Trúc (Bamboo Spirit)** (trùng pet đồng hành → Legendary Bamboo). Lie: "Rừng cần im lặng mới bình yên."

> Linh Trúc tin rằng rừng phải im mới yên. Sương lấy mất tiếng của Linh Trúc, cả rừng không ai gọi nhau nữa.

| Lúc | Thoại |
|---|---|
| Vào trận | Linh Trúc mở miệng mà không ra tiếng. Lá trúc đứng im. |
| Đúng | Con nói rồi! Một cây trúc rung lá đáp lại.<br>Nghe kìa, có tiếng lá rì rào!<br>Linh Trúc quay về phía tiếng của con. |
| Sai | Lá trúc còn im. Nói tiếp nha, sai cũng được!<br>Không sao đâu. Tiếng nhỏ cũng là tiếng mà! |
| Thắng Màn 6 (bài thường) | Linh Trúc lùi vào rừng, nhưng lá trúc đã bắt đầu rì rào. |
| Qua kiểm tra unit (giải sương) | Linh Trúc cất tiếng: rừng sống nhờ tiếng gọi nhau. — *Can you hear me?* |
| Thua | Rừng vẫn còn im. Ôn lại rồi mình quay lại gọi nha! |

**Manh mối Shadow:** Sương rút về phía Rừng Tràm. Lần này tiếng hú gần hơn, rồi lại tắt.

**Kết tập** (Bamboo): "Mình im một chút… và nghe thấy cả rừng. Cảm ơn con!"

### Bài clothing · Điểm mốc: Dây phơi đồ · Dẫn: Bé Mai

*Cảnh:* Mai giúp anh Minh soạn đồ đi Đà Lạt (đoạn đọc); dây phơi đồ ở Vườn Sữa mờ sương.

**Mở ải:** "Mai soạn đồ cho anh Minh đi Đà Lạt, mà sương làm Mai quên tên quần áo. Con giúp Mai nha!" — *Bring a warm jacket.*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Dây phơi đầy quần áo nè. Mình gặp tên từng món nha! | Shirt, jeans, socks, hat. |
| Nghe | Anh Minh gọi ra vườn cần mang gì. Nghe giúp Mai nha! | Two pairs of socks, please. |
| Đọc | Tờ danh sách đồ bị sương làm nhoè. Đọc lại giúp Mai nha! | Da Lat gets cold at night. |
| Viết | Mai muốn ghi tên đồ dán lên vali. Con ghép chữ giúp nha! | My shoes are by the door. |
| Nói | Mai hỏi: "Anh đang mặc gì vậy?" Con trả lời giùm nha! | I am wearing a T-shirt. |
| Màn 6 · Boss | Gió từ rừng trúc thổi tới, lạnh và im lặng lạ thường… | Why is it so quiet? |

**Qua bài:** Dây phơi đồ sáng lên! Vali của anh Minh đã đủ đồ.

### Bài house · Điểm mốc: Ngôi nhà mái đỏ · Dẫn: Minh

*Cảnh:* Minh dẫn Lan xem nhà mới mái đỏ cạnh Vườn Sữa (đoạn đọc).

**Mở ải:** "Nhà mới của Minh ở cạnh Vườn Sữa. Sương che tên các phòng, con dẫn Lan đi xem giùm Minh nha!" — *Welcome to our new house!*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Mình gặp tên các phòng và đồ đạc nha! | Kitchen, bedroom, living room. |
| Nghe | Minh nói phòng nào ở đâu, mà sương che mất. Nghe kỹ nha! | The kitchen is next to the living room. |
| Đọc | Bản vẽ ngôi nhà bị sương phủ. Đọc tìm đúng phòng nha! | There is a big sofa. |
| Viết | Minh viết thiệp mời Lan tới chơi. Ghép câu giúp Minh nha! | There are six chairs. |
| Nói | Lan hỏi phòng ngủ ở đâu. Con chỉ đường cho Lan nha! | Walk up the stairs. |
| Màn 6 · Boss | Nhìn qua cửa sổ, rừng trúc đứng im phăng phắc. Không một tiếng lá… | Listen… nothing. |

**Qua bài:** Ngôi nhà mái đỏ sáng đèn! Lan thích khu vườn nhỏ lắm.

### Bài emotions · Điểm mốc: Lối vào rừng trúc · Dẫn: Bamboo

*Cảnh:* Lan hồi hộp trước buổi thuyết trình (đoạn đọc); Bamboo nói liên tục vì sợ rừng im.

**Mở ải:** "Bamboo nói liên tục vì sợ rừng im. Con giúp Bamboo gọi đúng tên từng cảm xúc nha!" — *How do you feel?*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Vui, buồn, lo, tự hào… mình gặp từng cảm xúc nha! | Happy, sad, nervous, proud. |
| Nghe | Lá trúc rì rào kể tâm trạng các bạn. Nghe giùm Bamboo nha! | I feel nervous. |
| Đọc | Lan viết nhật ký trước buổi thuyết trình, sương che mất chữ. Đọc giúp nha! | I am grateful for your support. |
| Viết | Bamboo muốn viết lời động viên cho Lan. Ghép giúp nha! | Stay calm and be confident. |
| Nói | Bamboo hỏi hôm nay con thấy sao. Kể Bamboo nghe nha! | I feel happy today. |
| Màn 6 · Boss | Suỵt… Bamboo vừa im lặng, và nghe thấy một tiếng gọi rất nhỏ… | Did you hear that? |

**Qua bài:** Lối vào rừng trúc sáng lên! Bamboo học được cách lắng nghe.

### Bài hobbies · Điểm mốc: Sân hội cuối tuần · Dẫn: Cowdi

*Cảnh:* Vườn Sữa mở hội sở thích cuối tuần; Lan và Minh kể sở thích (đoạn đọc).

**Mở ải:** "Cuối tuần, Vườn Sữa mở hội sở thích. Kể Cowdi nghe con thích làm gì nha!" — *Tell me more!*

| Màn | Dẫn nhập (vi) | Câu tiếng Anh |
|---|---|---|
| Màn 1 · Gặp từ | Vẽ, bơi, nấu ăn… mình gặp các sở thích nha! | Reading, cooking, swimming. |
| Nghe | Các bạn ở hội kể sở thích. Nghe kỹ giúp Cowdi nha! | I enjoy playing chess. |
| Đọc | Tờ đăng ký câu lạc bộ bị sương nhoè. Đọc giúp nha! | Lan loves reading and drawing. |
| Viết | Cowdi muốn ghi sở thích của con vào sổ. Ghép giúp nha! | I am good at swimming. |
| Nói | Cowdi hỏi cuối tuần con hay làm gì. Kể nghe đi! | I go cycling on Sunday. |
| Màn 6 · Boss | Cả vườn đã lên tiếng rồi. Giờ tới lượt rừng trúc… | Let's go into the forest. |

**Qua bài:** Sân hội sáng lên! Đàn gà cũng ríu rít theo.

## 6. Fact – Assumption – Câu hỏi mở

- **Fact:** 12 bài, 72 câu dẫn, 0 trùng; mọi pet dẫn và Boss có ảnh C4/C5 trong repo.
- **Fact:** Trường `story.npc` cũ của bài `family` (minh) đổi thành `lan` để khớp đoạn đọc (Lan cho xem ảnh). Các bài khác giữ nhân vật cũ hoặc đổi sang pet có vai trong vùng (school → Storm, weather → Mimi).
- **Assumption:** Trẻ hiểu "Boss quay lại mỗi bài, sương mỏng dần" mà không cần giải thích. Cần quan sát ở đợt thử.
- **Câu hỏi mở:** int-u4…u10 viết tiếp theo cùng khung sau khi Sonny duyệt 3 tập này (cảnh báo chuẩn hoá sớm: nên cho vợ và 2–3 bé thử int-u1 trước).
