---
name: chon-giai-doan
description: Chỉ làm một giai đoạn cụ thể của Kinh tế v2 Cowdi (ví dụ GĐ3) do người dùng chỉ định, dùng khi làm song song hoặc nhảy giai đoạn.
---

# Làm một giai đoạn cụ thể

1. Lấy số giai đoạn từ tin nhắn của người dùng (ví dụ "/chon-giai-doan 3"). Nếu không có số, hỏi lại.
2. Đọc `TASK.md` và `docs/01-project-management/QUY-TRINH-TRIEN-KHAI-KINH-TE-V2.md`; áp dụng quy tắc trong `.agents/rules/kinh-te-v2.md`.
3. Kiểm tra các giai đoạn mà giai đoạn này phụ thuộc. Nếu có giai đoạn chưa `[x]`: báo người dùng danh sách và **dừng lại chờ xác nhận** trước khi làm.
4. Kiểm tra mục "Cần chốt" của giai đoạn này; báo điểm nào chưa chốt.
5. Khảo sát code, gửi kế hoạch, chờ "ok", rồi làm và cập nhật `TASK.md` như `/tiep-tuc`.
6. Chỉ làm việc thuộc giai đoạn được chỉ định.
