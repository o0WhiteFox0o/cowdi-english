---
name: kiem-tra-tien-do
description: Tóm tắt tiến độ Kinh tế v2 Cowdi từ TASK.md và git log, phát hiện chỗ TASK.md không khớp với code; chỉ đọc, không sửa file.
---

# Kiểm tra tiến độ (chỉ đọc)

1. Đọc `TASK.md` và `git log --oneline -30` (cùng các nhánh `feat/*`).
2. Tóm tắt cho người dùng:
   - giai đoạn đã xong, đang làm, việc tiếp theo;
   - các vấn đề đang chặn và điểm "Cần chốt" còn mở;
   - chỗ `TASK.md` không khớp thực tế (việc ghi `[x]` mà không thấy commit, commit có mà `TASK.md` chưa ghi, việc `[~]` bị bỏ dở lâu).
3. **Không sửa, không commit file nào.** Nếu cần sửa `TASK.md`, đề xuất và chờ người dùng đồng ý.
