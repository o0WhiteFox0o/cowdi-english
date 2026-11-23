# Lệnh Claude Code 2 — Mô phỏng & cân bằng hệ tương khắc v2

> Dùng cho **Giai đoạn 2** trong `docs/01-project-management/QUY-TRINH-TRIEN-KHAI-KINH-TE-V2.md`. Chạy sau khi giai đoạn 1 xong và engine trận đấu v2 đã có test.
> Bảng tính "Cowdi — Cân bằng hệ tương khắc" trên claude.ai vẫn dùng công thức v1; Claude Code không sửa được bảng này — lệnh xuất CSV để cập nhật bảng thủ công.

## Lệnh

Engine trận đấu v2 đã có (xem `docs/04-design/ECONOMY-BATTLE-V2-IMPLEMENTATION.md`). Nhiệm vụ: **chạy lại mô phỏng cân bằng với engine v2**, báo cáo và đề xuất chỉnh hằng số.

### 0. Nguyên tắc
- **Gọi trực tiếp engine và file cấu hình hằng số của server**, không viết lại công thức trong script — mô phỏng phải khớp 100% với trận thật.
- Mọi đề xuất chỉnh số chỉ sửa trong file cấu hình hằng số, kèm lý do và số liệu trước/sau. **Không tự áp dụng thay đổi cân bằng**: đề xuất trước, chờ duyệt.
- Mục tiêu thiết kế cần kiểm:
  1. Hai pet cùng cấp tiến hoá: tổng lợi thế không đến từ việc học (độ hiếm + hệ + kỹ năng nhóm) **không vượt quá ~2 câu đúng**.
  2. 10 hệ, cùng cấp, cùng điểm kỹ năng: chênh **< 2% HP** còn lại trung bình.
  3. 7 nhóm, tắt độ hiếm: chênh trong **±2% HP** ở C1, C3, C5.
  4. Độ hiếm: lợi thế lớn ở C1, thu hẹp dần đến C5.
  5. Học nhiều mạnh rõ nhưng không có pet nào hạ đối thủ trong 1–2 câu.

### 1. Viết script `scripts/simulate-balance.js`
- Chạy bằng `node scripts/simulate-balance.js [--runs N] [--seed S] [--out docs/06-verification-validation/balance-v2/]`.
- Hai chế độ: **kỳ vọng** và **Monte Carlo** (mặc định 10 000 trận/cặp, seed cố định): báo cáo tỉ lệ thắng, trung vị và p10/p90 % HP còn lại.
- Hồ sơ người chơi mặc định: mỗi bên đúng 7/10 câu, 2 câu nhanh (< 3s); cho phép đổi qua tham số. Bật đầy đủ hiệu ứng.
- Hồ sơ điểm kỹ năng: "vừa đủ điều kiện" từng cấp, "học đều" (200/600/1 800 điểm mỗi kỹ năng), và "cày lệch".

### 2. Các kịch bản phải chạy
1. **Ma trận 10×10 hệ** ở C1, C3, C5 (tắt độ hiếm và kỹ năng nhóm).
2. **7 nhóm** với độ hiếm tắt, ở C1, C3, C5.
3. **Độ hiếm**: Cowdi tham chiếu ở 5 độ hiếm × 5 cấp; quy đổi chênh lệch ra số câu đúng tương đương.
4. **Ma trận 22×22 pet thật** ở C3 và C5, hồ sơ "học đều".
5. **Các điểm còn lỏng:**
   - Leo (Kim, Thú săn) vs Leafy (Mộc): thử bỏ phạt ×0.8 khi bị khắc và hạ crit Kim xuống ×1.6.
   - Storm C5 (Lôi) dồn Nói 1 800 và 6 300 vs đối thủ vừa đủ điều kiện: số câu để hạ (kỳ vọng: 4 và 2).
   - Bầu trời (bỏ qua 20%) vs pet thủ cày Đọc (Leafy, Nấm Rơm, Ginseng, Monk, Owlbert).
   - Nông trại và Thảo mộc: giá trị kỹ năng ở C5.
   - Thủy/Biển (dựa vào né) khi gặp đối thủ nhanh ngang hoặc nhanh hơn.
   - **Pet Huyền thoại/Sự kiện ở C1** (có thể có ngay từ quay pet khởi đầu) gặp pet Thường C1–C2.
6. **Pet hết HP giữa trận**: so sánh "dừng ngay" và "đánh đủ 10 câu".

### 3. Kết quả đầu ra
Trong `docs/06-verification-validation/balance-v2/`:
- `element-matrix.csv`, `group-matrix.csv`, `rarity.csv`, `pet-matrix-c3.csv`, `pet-matrix-c5.csv`, `edge-cases.csv`.
- `BALANCE-REPORT-v2.md`: kết quả từng mục tiêu, các cặp lệch nhất, điểm còn lỏng, so sánh hai luật hết HP, **bảng đề xuất chỉnh hằng số**.

### 4. Cập nhật tài liệu
- `docs/04-design/nhan-xet-he-thong-tuong-khac.md`: thêm mục "Cập nhật v2".
- Liệt kê con số trong `Dac-ta-chien-dau-pet-Cowdi-v2.docx` cần sửa (không sửa .docx).
- Thêm test hồi quy cho các kịch bản biên với seed cố định.

### 5. Hoàn thành khi
- Script tái lập được (cùng seed → cùng kết quả), CSV và báo cáo đã sinh.
- Báo cáo trả lời rõ 5 mục tiêu và 6 kịch bản.
