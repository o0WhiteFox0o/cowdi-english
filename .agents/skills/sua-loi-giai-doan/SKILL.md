---
name: sua-loi-giai-doan
description: Sửa lỗi phát hiện trong một giai đoạn Kinh tế v2 Cowdi đã làm xong, kèm test tái hiện và ghi Nhật ký trong TASK.md.
---

# Sửa lỗi ở giai đoạn đã xong

1. Lấy mô tả lỗi và số giai đoạn từ tin nhắn người dùng; nếu thiếu, hỏi lại.
2. Áp dụng quy tắc trong `.agents/rules/kinh-te-v2.md`.
3. Tìm nguyên nhân, báo người dùng nguyên nhân và cách sửa dự kiến trước khi sửa nếu thay đổi lớn hoặc đụng tới migration/ledger.
4. Sửa trên nhánh của giai đoạn đó hoặc nhánh `fix/<tên>`. Thêm test tái hiện lỗi trước, rồi sửa cho test qua.
5. Chạy test và `npm run build`.
6. Ghi một dòng vào "Nhật ký" của `TASK.md` với ghi chú "fix". Không đổi trạng thái `[x]` của giai đoạn trừ khi lỗi làm tiêu chí xong không còn đạt (khi đó đổi về `[~]` và ghi lý do).
7. Commit `fix(scope): ...`. Không push.
