---
name: ghi-quyet-dinh
description: Ghi quyết định mới của người dùng vào mục "Quyết định đã chốt" trong TASK.md và cập nhật tài liệu thiết kế Kinh tế v2 liên quan.
---

# Ghi quyết định đã chốt

1. Lấy các quyết định từ tin nhắn của người dùng. Nếu một quyết định mơ hồ, hỏi lại trước khi ghi.
2. Mở `TASK.md`:
   - thêm mỗi quyết định thành một dòng mới trong bảng "Quyết định đã chốt", đánh số tiếp theo (D9, D10…), ngày hôm nay;
   - đánh `[x]` mục tương ứng trong "Cần chốt";
   - nếu quyết định gỡ một điểm chặn: đổi các việc `[!]` liên quan về `[ ]` và cập nhật "Vấn đề đang chặn".
3. Nếu quyết định làm thay đổi thiết kế: cập nhật file liên quan trong `docs/04-design/economy-v2/` hoặc `docs/04-design/ECONOMY-BATTLE-V2-IMPLEMENTATION.md`.
4. Thêm một dòng vào "Nhật ký".
5. Commit với message `docs(task): ghi quyết định ...`. Không sửa code.
6. Báo lại người dùng: đã ghi gì, file nào đã đổi.
