# Nhận xét hệ thống tương khắc pet — Cowdi English (22/11/2026)

Dựa trên ghi chú tay ngày 21/10/2026 và code repo o0WhiteFox0o/cowdi-english (commit 4a62536).

## Ghi chú (cách đọc)
10 hệ: Kim (dame cao/crit), Mộc (HP cao/chữa trị), Thủy (né tránh/chữa trị), Hỏa (bỏng → khống chế; dame cao/khuếch tán/thiêu đốt), Thổ (thủ cao/phòng thủ), Bóng tối/Ma, Ánh sáng/Siêu linh, Võ, Phong (khuếch tán), Lôi (crit/khuếch tán nhẹ/thiêu đốt).
Chỉ số ↔ kỹ năng: Tấn công ↔ Nói, HP ↔ Nghe, Phòng thủ ↔ Đọc, Nhanh nhẹn ↔ Viết. Sơ đồ: pet ở giữa, skill + hào quang.

## Hiện trạng code
- 22 pet, 6 element: fire 4, water 2, nature 5, cosmic 6, earth 3, neutral 2 (src/data/pets.js).
- Element chỉ đổi màu/animation (DuelPage.jsx ELEMENT_THEME). Damage cố định: baseDmg = floor(70/số câu), crit x1.4 khi trả lời < 3s.
- HP chỉ hiển thị phía client. Server (server/routes/api.js ~dòng 520) quyết định thắng thua theo điểm từng câu (đúng + nhanh hơn), không dùng HP.
- baseStats nghe/nói/đọc/viết đã có nhưng chưa dùng trong trận.

## Điểm mạnh
- Ngũ hành quen thuộc với người Việt, dễ nhớ.
- Gắn chỉ số với 4 kỹ năng khuyến khích học đều.
- Nền móng sẵn: mỗi pet đã có element và baseStats.

## Vấn đề cần xử lý
1. Xung đột HP vs điểm: nếu thêm khắc chế chỉ vào HP client, pet có thể gục mà vẫn thắng. Cần quyết định HP có quyết định thắng không, và tính trên server.
2. Vai trò trùng: Kim & Lôi đều crit; Mộc & Thủy đều hồi máu; Hỏa/Phong/Lôi đều khuếch tán. Bóng tối, Ánh sáng, Võ chưa có vai trò.
3. Khuếch tán (đánh lan) vô nghĩa trong trận 1v1.
4. Né tránh: trả lời đúng mà đòn trượt gây ức chế trong game học. Đổi thành giảm sát thương.
5. Hệ số khắc nên nhẹ (x1.2 / x0.85), không x2 như Pokémon, để người trả lời đúng nhiều hơn vẫn thắng.
6. Đề duel chủ yếu là từ vựng/ngữ pháp (đọc) → chỉ số Phòng thủ (Đọc) sẽ áp đảo.
7. 10 hệ → 45 cặp, khó nhớ; 4 hệ mới chưa có pet nào.

## Đề xuất
- Vòng khắc: Kim > Mộc > Thổ > Thủy > Hỏa > Kim; Ánh sáng ⇄ Bóng tối; tam giác Phong > Lôi > Võ > Phong.
- Chuyển đổi: fire→Hỏa, water→Thủy, nature→Mộc, earth→Thổ, cosmic→chia Ánh sáng/Bóng tối, neutral (Cowdi)→Võ hoặc giữ Trung tính.
- Giai đoạn 1: chỉ khắc chế ±20% sát thương + hiện "Hiệu quả!" trước trận, tính trên server. Giai đoạn 2: hiệu ứng riêng mỗi hệ (bỏng, hồi máu, hào quang).
