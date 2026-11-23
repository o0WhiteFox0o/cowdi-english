---
trigger: always_on
---

# Quy tắc: Triển khai Kinh tế v2 (Cowdi English)

Áp dụng khi làm bất kỳ việc nào liên quan tới `TASK.md`, Kinh tế v2, cửa hàng, Đấu trường, gacha, thiệp mời, tiến hoá, ledger. Repo: React SPA + PWA ở `src/`, API Node ở `server/`.

## Đọc trước khi làm (theo thứ tự)
1. `TASK.md` (gốc repo) — tiến độ, "Quyết định đã chốt", "Cần chốt", "Vấn đề đang chặn".
2. `docs/01-project-management/QUY-TRINH-TRIEN-KHAI-KINH-TE-V2.md` — thứ tự giai đoạn, phụ thuộc, tiêu chí xong.
3. Tài liệu của giai đoạn đang làm:
   - `docs/04-design/ECONOMY-BATTLE-V2-IMPLEMENTATION.md` (nguồn sự thật cho code)
   - `docs/04-design/economy-v2/*.md`
   - `docs/05-implementation/CODING-STANDARDS.md`
4. Thứ tự ưu tiên khi tài liệu mâu thuẫn: `TASK.md` "Quyết định đã chốt" > `ECONOMY-BATTLE-V2-IMPLEMENTATION.md` > `docs/04-design/economy-v2/` > `docs/Dac-ta-chien-dau-pet-Cowdi-v2.docx`. Vẫn không rõ thì dừng lại và hỏi, không tự đoán.

## Chọn việc
- Giai đoạn đầu tiên chưa xong trong "Trạng thái tổng" mà các giai đoạn nó phụ thuộc đều đã `[x]`.
- Trong giai đoạn đó: việc `[~]` trước, rồi việc `[ ]` đầu tiên.
- Điểm "Cần chốt" chặn giai đoạn này mà chưa chốt và không có mặc định ghi kèm → ghi vào "Vấn đề đang chặn", đánh `[!]` việc liên quan, hỏi người dùng; vẫn làm tiếp các việc khác không bị chặn.

## Trước khi sửa code
- Khảo sát code liên quan (không sửa), gửi kế hoạch ngắn cho giai đoạn: các việc, file sẽ đổi, migration DB, rủi ro.
- Chờ người dùng trả lời "ok" mới sửa.
- Tạo/chuyển sang nhánh ghi trong "Trạng thái tổng".

## Khi làm
- Mọi tài nguyên (Sữa, Gem, Đá, mảnh đá, vé…) đi qua ledger trên server; client không tự cộng/trừ.
- Hằng số cân bằng/kinh tế đặt trong file cấu hình dùng chung, không hard-code.
- Migration chạy lại an toàn, không xoá dữ liệu người dùng.
- Tính năng mới đặt sau cờ bật/tắt khi hợp lý.
- Viết test cho logic mới; chạy test + `npm run build` trước khi đánh dấu xong.

## Cập nhật TASK.md (bắt buộc)
- Bắt đầu một việc: `[ ]` → `[~]`.
- Xong: `[x]` và thêm cuối dòng `— YYYY-MM-DD · <commit ngắn>`.
- Bỏ: `[-]` kèm lý do. Bị chặn: `[!]` + dòng trong "Vấn đề đang chặn".
- Mỗi việc xong thêm 1 dòng vào đầu bảng "Nhật ký".
- Mọi việc và "Tiêu chí xong" của giai đoạn đều `[x]` → cập nhật dòng giai đoạn trong "Trạng thái tổng".
- Không tự sửa "Quyết định đã chốt" trừ khi người dùng yêu cầu.
- Commit `TASK.md` cùng commit với code của việc đó.
- Danh sách việc (task list) của Antigravity chỉ để theo dõi trong phiên; `TASK.md` mới là nơi ghi tiến độ chính.

## Commit và giới hạn
- Quy ước `type(scope): message` (feat, fix, docs, refactor, test, chore).
- Không push, không deploy, không chạy `deploy.ps1` khi chưa được đồng ý.
- Không tự chạy lệnh xoá dữ liệu, reset DB hay `git reset --hard`.
- Không làm việc của giai đoạn sau khi giai đoạn hiện tại chưa xong (trừ khi được bảo).

## Kết thúc
- Hết giai đoạn hoặc hết phiên: dừng lại, báo cáo ngắn: việc đã xong, commit, việc còn lại, vấn đề đang chặn, câu hỏi cần chốt.
