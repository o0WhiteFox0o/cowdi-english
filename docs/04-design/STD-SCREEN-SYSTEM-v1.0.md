# STD-SCREEN-SYSTEM v1.0 — Hệ thống màn học, luật trộn 6 màn, dẫn nhập, admin kiểm tra màn

> 2026-11-27 · Sonny chốt trong buổi thảo luận. Giao diện: canvas **Cowdi — Giao diện vượt ải bài học** (trang "Thiết kế chính · trộn màn").
> Cập nhật 27/11 21:38: Sonny đồng ý các đề xuất còn mở (trọng số, T-03, 10 ải). Nhóm thử nghiệm theo danh sách tài khoản là mặc định Claude đặt, đổi được.
> Cập nhật 27/11 22:05: Sonny chốt **sao ★ + thưởng Sữa theo sao** (Q13, mục 3.5).
> Cập nhật 28/11: Sonny chốt các điều chỉnh thực tế Đợt 3–4 — (1) Đổi tên `F-03` thành **Nghe nhận diện từ**; (2) Tên màn F trong §2.2 chỉ là ví dụ minh hoạ, tên thực tế quản lý theo kịch bản vùng tại `shared/screen-scenarios.js`; (3) Không bắt cuộn trang trong thao tác học/chơi (`360×640`), các xác nhận qua màn dùng popup (`ScreenActionModal`); (4) Màn nói `F-04`/`F-10` thử tự mở mic sau đếm `3-2-1`, chỉ hiện nút bật mic khi trình duyệt chặn, nhóm Mới học không chấm điểm (nói mic hoặc `"Con đã nói"` đều qua).
> Cập nhật 27/11 22:00: luật dự phòng khi bài thiếu dữ liệu (3.2); đặc tả triển khai chia 4 đợt `GEMINI-SCREEN-SYSTEM-PHASE1..4.md`.
> Thay thế phần luồng bài và danh sách game trong `SCRIPT-MINIGAME-IN-LESSON-v1.0.md` §1–2 và `SCRIPT-LESSON-WALKTHROUGH-v1.0.md` §3 (luồng 7–9 bước cũ). Luật sao và Sữa: mục 3.5 của tài liệu này (đã chốt, thay WALKTHROUGH §2.3–2.4).
> Ký hiệu: **[Chốt]** Sonny đã xác nhận · **[Mặc định]** đặt sẵn, đổi được.

---

## 1. Quyết định đã chốt

| # | Quyết định |
|---|---|
| Q1 | Các màn **đang có** trong app được đánh mã **T-xx**, gọi là mức **Tập trung**. **[Chốt]** |
| Q2 | Các màn **mới** (dạng game) đánh mã **F-xx**, gọi là mức **Thân thiện**. **[Chốt]** |
| Q3 | Không làm hai "chế độ" giao diện riêng. Hai mức chỉ là hai nhóm màn trong **cùng một kho**, được trộn chung. **[Chốt]** |
| Q4 | Mỗi bài (ải) có **6 màn**: Màn 1 Gặp từ · Màn 2–5 Nghe, Nói, Đọc, Viết theo thứ tự ngẫu nhiên · Màn 6 Boss. **[Chốt]** |
| Q5 | Mỗi màn có **dẫn nhập**. Sang bài khác thì **dẫn nhập phải mới**. **[Chốt]** |
| Q6 | Có chức năng **admin kiểm tra màn**. **[Chốt]** |
| Q7 | Pet là người giải thích: hướng dẫn, khen, giải thích khi sai. Không có khối chữ giải thích riêng. Mỗi màn vừa một màn hình, không cuộn. **[Chốt]** |
| Q8 | Bỏ "ôn hôm sau". Thay bằng **khách quen**: mỗi màn xen 2–3 từ của ải trước. **[Chốt]** |
| Q9 | Trọng số trộn theo nhóm học như mục 3.3. **[Chốt]** |
| Q10 | T-03 Ngữ pháp không là màn riêng: thành lời pet (mẹo) ở màn Viết + nút "Xem ngữ pháp" mở bảng tóm tắt. **[Chốt]** |
| Q11 | Câu dẫn không lặp trong **10 ải** gần nhất của mỗi user. **[Chốt]** |
| Q12 | Màn trạng thái "Thử nghiệm" chỉ hiện cho **danh sách tài khoản thử** do admin quản lý. **[Mặc định]** |
| Q13 | Có **sao ★ 1–3 mỗi ải** (đánh giá, không phải tiền, không tiêu được) và **thưởng Sữa theo sao** thay khoản +30 trọn điểm; Sữa tối đa mỗi ải không đổi. **[Chốt]** |

---

## 2. Danh mục màn

### 2.1 Mức Tập trung (màn đang có, đánh số theo thứ tự hiện tại trong `LessonDetailPage`)

| Mã | Màn hiện có | Vị trí trong 6 màn | Ghi chú |
|---|---|---|---|
| T-01 | Từ vựng | Màn 1 | |
| T-02 | Flashcard | Màn 1 | |
| T-03 | Ngữ pháp | **Không chiếm vị trí** | Thành lời pet (mẹo) ở màn Viết + nút "Xem ngữ pháp" mở bảng tóm tắt **[Chốt]** |
| T-04 | Đoạn văn | Đọc | |
| T-05 | Nghe câu | Nghe | |
| T-06 | Nói theo | Nói | |
| T-07 | Quiz | Màn 6 (Boss) | Cùng dữ liệu với F-06, khác lớp hiển thị |
| **T-08** | **Viết câu (mới, Đợt 1)** | Viết | App hiện **không có màn Viết nào** ở mức Tập trung. Mẫu thiết kế: trang "Chế độ người lớn (không dùng)", màn E |

### 2.2 Mức Thân thiện (màn mới)

| Mã | Tên | Kỹ năng | Thao tác học | Điều kiện dùng được (`canRun`) | Đợt |
|---|---|---|---|---|---|
| F-01 | Gặp từ trình chiếu | Màn 1 | xem, nghe (tự chạy) | ≥4 từ | 3 |
| F-02 | Ghép chữ lên đò | Viết | chạm chữ cái theo thứ tự | ≥4 từ đơn 3–10 chữ cái | 4 |
| F-03 | Nghe nhận diện từ *(đổi từ Bò hứng chữ, 28/11)* | Nghe | nghe từ, chọn đúng từ tiếng Anh | ≥6 từ | 3 |
| F-04 | Gọi pet vượt suối | Nói | nói câu mẫu | ≥3 câu nói | 4 |
| F-05 | Săn chữ trong sương | Đọc | nghe cụm, chạm đúng chỗ trong đoạn | có `reading.passage` + `highlights` ≥4 | 4 |
| F-06 | Boss sương mù | Màn 6 (Boss) | trả lời câu trộn 4 kỹ năng | luôn chạy được | 3 |
| F-07 | Chợ nổi | Nghe | nghe khách đặt hàng, chọn đúng giỏ | ≥4 danh từ đếm được có hình + số nhiều | 4 |
| F-08 | Lật cặp đồng cỏ | Đọc | lật cặp từ EN ↔ nghĩa VI | ≥6 từ | 3 |
| F-09 | Đò chở câu | Viết | chạm từ theo thứ tự thành câu | ≥3 câu 3–8 từ | 3 |
| F-10 | Trò chuyện với Ông Tư | Nói | trả lời câu hỏi của NPC bằng giọng nói | `dialogPrompts` ≥2 (trường mới) | 4 |
| F-11 | Đúng hay sai | Đọc | đọc câu + tranh, chọn Đúng/Sai | `trueFalse` ≥4 (trường mới) | 4 |

### 2.3 Kho theo vị trí

| Vị trí | Màn có thể chọn |
|---|---|
| Màn 1 | T-01, T-02, F-01 |
| Nghe | T-05, F-03, F-07 |
| Đọc | T-04, F-05, F-08, F-11 |
| Viết | T-08, F-02, F-09 |
| Nói | T-06, F-04, F-10 |
| Màn 6 | T-07, F-06 |

Mã màn **không bao giờ đổi hay dùng lại**. Màn bỏ đi thì đặt trạng thái "Ngừng dùng", giữ mã.

> **Quy ước tên hiển thị theo kịch bản (bổ sung 2026-11-28):** Các tên màn F trong bảng §2.2 chỉ là tên ví dụ minh họa. Trong triển khai, tên học thuật mặc định và tên biến thể theo bối cảnh vùng đất (`BD`, `TG`, `VS`…) được quản lý tập trung tại [`shared/screen-scenarios.js`](../../shared/screen-scenarios.js) (`getScreenTitle(code, region, fallback)`).

---

## 3. Luật trộn

### 3.1 Thứ tự

1. Màn 1 luôn là Gặp từ, màn cuối luôn là Boss.
2. Màn giữa: mỗi kỹ năng Nghe, Nói, Đọc, Viết đúng một lần, xáo ngẫu nhiên.
3. **Màn 2 không được là Nói** (người học cần nghe từ trước khi nói).
4. Làm lại bài thì xáo lại. Lưu kết quả trộn của mỗi lần học (`lessonMixLog`) để admin và thống kê đọc lại.

### 3.2 Chọn màn cho từng vị trí

```
ứng viên = kho[vị trí]
  lọc: trạng thái = Bật (hoặc Thử nghiệm nếu tài khoản nằm trong danh sách thử)
  lọc: canRun(bài) = true
  lọc: khác màn đã dùng cho cùng vị trí ở bài trước của user (nếu còn ≥1 ứng viên)
chọn ngẫu nhiên theo trọng số mức (3.3)
nếu không còn ứng viên:
  Màn 1 / Boss → T-01 / T-07 (luôn chạy được)
  vị trí kỹ năng → bỏ vị trí đó, bài chạy 5 màn; admin liệt kê bài này để bổ sung nội dung
```

### 3.3 Trọng số theo nhóm học **[Chốt]**

| Nhóm | Thân thiện | Tập trung | Ràng buộc thêm |
|---|---|---|---|
| Mới học | 100% | 0% | — |
| Trung bình | 50% | 50% | các màn giữa có ít nhất 1 màn F và 1 màn T (khi đủ ứng viên) |
| Luyện thi | 25% | 75% | Màn 6 luôn T-07 (gần dạng đề) |

Trọng số đặt trong cấu hình server, chỉnh được ở trang admin, không cần sửa code.

### 3.5 Sao ★ và Sữa **[Chốt]**

**Độ chính xác lần đầu** = số item đúng ngay lần đầu / số item có chấm. Không tính: Màn 1 (trình chiếu, flashcard tự khai), item khách quen, màn Nói ở nhóm Trung bình (chấm theo từ chưa đủ tin cậy). Boss có tính.

| Sao | Điều kiện (Trung bình, Luyện thi) | Mới học |
|---|---|---|
| 0 | Chưa qua ải | Chưa qua ải |
| ★ | Qua ải (Boss ≥ `lessonPassRate`) | Qua ải |
| ★★ | Qua ải + chính xác ≥ 80% | ≥ 75% |
| ★★★ | Qua ải + chính xác ≥ 95% + Boss đúng hết | ≥ 90% + Boss đúng hết |

- Sao lưu theo **kết quả tốt nhất**, không bao giờ tụt. Sao không tính tốc độ.
- **Sữa:** câu Boss đúng × 10 + thưởng sao (★ 0 · ★★ +15 · ★★★ +30) + 60 khi qua ải lần đầu. Thay khoản "+30 trọn điểm" cũ, nên Sữa tối đa mỗi ải (quiz 10 câu) vẫn là **190**.
- Làm lại: `max(5, round(đúng×10 / 3))` + **phần chênh thưởng sao** nếu lên mức sao mới (ví dụ ★★ → ★★★: +15), mỗi mức chỉ trả một lần.
- Hiển thị: node ải trên bản đồ (1–3 sao), màn Tổng kết (sao hiện lần lượt; sao thiếu kèm 1 dòng điều kiện). **Không hiện sao trong lúc học.**
- Unit đủ 3 sao mọi ải: vùng đất trạng thái "Rực rỡ" (chỉ trang trí, làm khi có ảnh vùng).

### 3.4 Ví dụ

| Bài | Màn 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Ải 2 | T-01 | Viết F-02 | Nghe F-03 | Nói T-06 | Đọc T-04 | F-06 |
| Ải 3 | F-01 | Đọc F-08 | Nghe T-05 | Viết F-09 | Nói F-10 | T-07 |

---

## 4. Dẫn nhập

### 4.1 Hai lớp

| Lớp | Khi nào | Nội dung | Thay đổi theo |
|---|---|---|---|
| **Dẫn nhập ải** | Màn "Mở ải" | NPC của vùng nêu chuyện + mục tiêu "Qua ải này con sẽ…" + các màn của ải | Mỗi bài một câu chuyện |
| **Dẫn nhập màn** | 1,5–3 giây trước mỗi màn | Cảnh vùng đất + pet nói 1 câu dẫn chuyện + thẻ luật chơi bằng hình + đếm 3-2-1 | Câu dẫn chuyện đổi theo bài; **thẻ luật chơi cố định** theo mã màn |

Luật chơi giống nhau mỗi lần để người học không phải học lại cách chơi; câu chuyện mới để không nhàm.

### 4.2 Luật "không lặp" **[Chốt]**

- Mỗi câu dẫn có mã `DN-<mã màn>-<vùng>-<số>`, ví dụ `DN-F03-BD-01`.
- Chọn câu: đúng mã màn + đúng vùng của bài, **chưa dùng với user này trong 10 ải gần nhất**.
- Câu dẫn có thể chèn từ của bài, tên NPC, tên vùng.
- Kho tối thiểu: **mỗi mã màn × mỗi vùng ≥ 4 câu**. Sinh bằng AI theo `COWDI-AI-PROMPT-BLOCKS.md`, Sonny duyệt rồi mới bật. Hết câu chưa dùng thì lấy câu dùng lâu nhất.
- Giới hạn: ≤ 25 chữ tiếng Việt, không chứa đáp án, không đổ lỗi.
- Nhóm Mới học: câu dẫn có file audio giọng Việt.

### 4.3 Giải thích bằng pet

| Lúc | Pet nói | Giới hạn |
|---|---|---|
| Đầu màn | câu dẫn (4.2) | 1 câu |
| Đúng | khen ngắn, đôi khi nhắc nghĩa | ≤ 8 chữ, không cooldown animation |
| Sai | đáp án đúng + lý do | ≤ 2 dòng |
| Mẹo ngữ pháp (màn Viết) | lấy từ `grammar[].mistakes` của bài (thay cho T-03) | 1 câu; nút "Xem ngữ pháp" mở bảng tóm tắt |

---

## 5. Admin kiểm tra màn

Route `/admin/screens` (chỉ admin). Mẫu giao diện: artboard "Admin · Kiểm tra màn". Chi tiết: `GEMINI-SCREEN-SYSTEM-PHASE2.md` (+ tab Kho dẫn nhập ở Đợt 3, Thống kê ở Đợt 4).

| Chức năng | Mô tả |
|---|---|
| Danh mục màn | Mã T/F, mức, kỹ năng/vị trí, trạng thái (Bật · Thử nghiệm · Tắt · Chưa làm · Ngừng dùng) |
| Kiểm dữ liệu theo bài | Mỗi màn ✓ đủ dữ liệu hoặc ✗ thiếu trường gì |
| Ma trận toàn bộ | Bài × màn; bài chỉ chạy được 5 màn tô đỏ |
| Trộn thử | Bài + nhóm + seed → các màn, câu dẫn, kiểm luật; chạy 1 000 lần xem phân bố |
| Xem trước / Chơi thử | Dữ liệu thật trong khung điện thoại, không ghi điểm |
| Kho dẫn nhập | Xem, sửa, duyệt câu dẫn theo mã màn × vùng |
| Trọng số, tài khoản thử, nhật ký | Đổi có ghi log |
| Thống kê | % hoàn thành, % đúng lần đầu, thời gian trung bình theo mã màn (không lưu theo người dùng) |

---

## 6. Dữ liệu và code (tóm tắt)

| Thành phần | Vị trí |
|---|---|
| Registry màn | `src/features/lesson/screens/registry.js` |
| Bộ trộn | `src/features/lesson/screens/mixer.js` (thuần JS, có test) |
| Cấu hình | bảng `screen_config`, `screen_weights`, `screen_testers`, `screen_config_log` (Đợt 2); file tĩnh dự phòng |
| Câu dẫn | bảng `screen_intro` (Đợt 3); `lesson.story.introVi` cho dẫn nhập ải |
| Lịch sử user | `userData.lastMix`, `userData.lessonMixLog`, `userData.recentIntros` |
| Từ | `wordProgress[...].skillsHit` (4 chấm, Đợt 3) |
| Trường bài mới | `vocabulary[].plural/countable`, `dialogPrompts[]`, `trueFalse[]` (Đợt 4) |
| Thống kê | bảng `screen_stat_daily` (Đợt 4) |

Mọi màn phát cùng một bộ sự kiện: `item_shown`, `item_correct`, `item_wrong`, `screen_done`.

---

## 7. Thứ tự làm

| Đợt | Việc | File |
|---|---|---|
| 1 | Registry + mixer + sự kiện chung; bọc 6 màn T; T-03 → mẹo pet; T-08 Viết câu | `GEMINI-SCREEN-SYSTEM-PHASE1.md` |
| 2 | Cấu hình server + trang admin | `GEMINI-SCREEN-SYSTEM-PHASE2.md` |
| 3 | F-01, F-03, F-08, F-09, F-06; Mở ải; dẫn nhập không lặp; khách quen; 4 chấm; sao + Sữa theo sao; Tổng kết | `GEMINI-SCREEN-SYSTEM-PHASE3.md` |
| 4 | F-02, F-04, F-05, F-07, F-10, F-11; trường dữ liệu mới; thống kê; dọn code cũ | `GEMINI-SCREEN-SYSTEM-PHASE4.md` |

Gói giao việc: `README.md` trong gói zip (thứ tự, cổng duyệt, tài liệu tham chiếu, lời nhắc cho Gemini).
