# CHK-LESSON-REVIEW — Danh sách kiểm tra khi duyệt bài

Dùng cho người duyệt (Sonny) sau khi `npm run validate:lessons` và `npm run validate:questions` đều báo **0 lỗi**. Validator kiểm tra cấu trúc và 14 mã chuẩn ([STD-QUESTION-QUALITY-v1.0.md](STD-QUESTION-QUALITY-v1.0.md)); danh sách này kiểm tra **chất lượng ngữ nghĩa**, thứ máy không chấm hết được.

## 1. Mọi cấp

- [ ] Đạt 0 lỗi cứng và 0 cảnh báo `Q-LEN`/`Q-POS` trên bài v2 (`npm run validate:questions`)
- [ ] Mục tiêu bài rõ, mọi phần đều phục vụ mục tiêu đó
- [ ] Không có câu, đoạn nào chép từ nguồn có bản quyền (dán thử một câu bất kỳ vào Google trong ngoặc kép)
- [ ] Không có số liệu, trích dẫn bịa đặt như sự thật
- [ ] Tiếng Anh tự nhiên, đúng ngữ pháp, đúng chính tả Mỹ (hoặc Anh, nhất quán)
- [ ] Tiếng Việt tự nhiên, không phải dịch máy cứng
- [ ] Đáp án đúng là duy nhất; nhiễu hợp lý; giải thích nói được *vì sao*
- [ ] Không định kiến, không nội dung nhạy cảm với trẻ em

## 2. Cấp 1 — thêm

- [ ] Có trường `category` khớp nhóm nghĩa (bài màu có `swatch` hex + emoji ô vuông, không dùng hình tròn `🔴`)
- [ ] Thử với một đứa trẻ (hoặc tưởng tượng): nhìn hình có đoán ra từ không?
- [ ] Ảnh đúng phong cách, không chữ, nền sạch
- [ ] Âm thanh đúng, chậm, rõ

## 3. Cấp 2 — thêm

- [ ] Đoạn văn là một câu chuyện hoặc hội thoại có đầu có cuối
- [ ] Bài cũ nâng cấp không làm mất từ quan trọng của bài cũ
- [ ] `mistakes` là lỗi thật người Việt hay mắc

## 4. Cấp 3 — thêm

- [ ] Tự làm hết đề trong thời gian `timeLimitMin`, đối chiếu đáp án
- [ ] Mỗi câu TFNG có thể chỉ ra bằng chứng (hoặc chứng minh là không có, với NOT GIVEN)
- [ ] Độ khó tương xứng band mục tiêu (từ vựng, độ dài câu)
- [ ] Nếu được, nhờ một giáo viên luyện thi đọc thử một bài trong mỗi đợt

## 5. Trên thiết bị

- [ ] Mở bài trên điện thoại 375 px: không tràn chữ, nút bấm được
- [ ] Làm hết các bước tới khi bài được tính "xong"

Kết quả duyệt ghi vào mô tả PR: ✓ đạt / ✗ cần sửa (kèm dòng cụ thể).
