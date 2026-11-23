---
name: tiep-tuc
description: Tiếp tục triển khai Kinh tế v2 Cowdi theo TASK.md — tìm giai đoạn và việc tiếp theo, gửi kế hoạch, làm và cập nhật TASK.md.
---

# Tiếp tục triển khai Kinh tế v2

1. Đọc `TASK.md` và `docs/01-project-management/QUY-TRINH-TRIEN-KHAI-KINH-TE-V2.md`.
2. Áp dụng toàn bộ quy tắc trong `.agents/rules/kinh-te-v2.md`.
3. Xác định giai đoạn tiếp theo: giai đoạn đầu tiên chưa `[x]` mà mọi giai đoạn phụ thuộc đã `[x]`. Trong giai đoạn đó, chọn việc `[~]` trước rồi việc `[ ]` đầu tiên.
4. Nếu đây là lần đầu vào giai đoạn này: khảo sát code (không sửa) và gửi kế hoạch ngắn (việc, file sẽ đổi, migration, rủi ro, điểm cần chốt). **Dừng lại chờ người dùng trả lời "ok".**
5. Sau khi được duyệt: làm lần lượt từng việc, mỗi việc:
   - đánh `[~]` trong `TASK.md`,
   - sửa code + test, chạy test và `npm run build`,
   - đánh `[x]` kèm ngày và commit, thêm dòng Nhật ký,
   - commit code cùng `TASK.md`.
6. Hết giai đoạn hoặc gặp điểm chặn: dừng lại, gửi báo cáo ngắn.
