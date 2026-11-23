# Prompt cho Claude Code — Triển khai Kinh tế v2 theo quy trình

23/11/2026 · Dùng cùng `docs/01-project-management/QUY-TRINH-TRIEN-KHAI-KINH-TE-V2.md` và `TASK.md` (gốc repo).

---

## Cách sử dụng

### Chuẩn bị (làm 1 lần)
1. Kiểm tra các file đã có trong repo:
   - `TASK.md` (gốc repo)
   - `docs/01-project-management/QUY-TRINH-TRIEN-KHAI-KINH-TE-V2.md`
   - `docs/01-project-management/PROMPT-CLAUDE-CODE-KINH-TE-V2.md` (file này)
   - `docs/04-design/economy-v2/` (các đề xuất)
   - `docs/04-design/ECONOMY-BATTLE-V2-IMPLEMENTATION.md`
2. Commit các file này trước khi bắt đầu, ví dụ: `docs(economy-v2): thêm quy trình, TASK và đề xuất`.
3. Mở `TASK.md`, đọc mục **Cần chốt**. Điền câu trả lời cho các điểm chặn GĐ1 vào mục **Quyết định đã chốt** (thêm dòng D9, D10…). Nếu chưa chốt, Claude Code sẽ dùng mặc định được ghi kèm hoặc dừng lại hỏi.

### Mỗi phiên làm việc
1. Mở Claude Code trong thư mục `E:\cowdi-english`.
2. Dán **Prompt chính** (bên dưới). Claude Code sẽ đọc `TASK.md`, tìm việc tiếp theo, và gửi kế hoạch.
3. Đọc kế hoạch → trả lời "ok" hoặc sửa.
4. Claude Code làm từng việc; xong mỗi việc nó **tự đánh dấu `[x]` trong `TASK.md`** kèm ngày + commit và thêm dòng vào **Nhật ký**.
5. Hết giai đoạn, Claude Code dừng lại báo cáo. Bạn kiểm tra rồi dán **Prompt tiếp tục** để sang giai đoạn sau.

### Khi bạn chốt thêm quyết định
- Tự thêm vào mục **Quyết định đã chốt** trong `TASK.md`, **hoặc** dán **Prompt ghi quyết định** để Claude Code ghi giúp.
- Quyết định trong `TASK.md` được ưu tiên hơn mọi tài liệu khác.

### Đọc tiến độ nhanh
- Bảng **Trạng thái tổng** ở đầu `TASK.md`: giai đoạn nào xong/đang làm.
- Mục **Vấn đề đang chặn**: những gì cần bạn quyết.
- Mục **Nhật ký**: việc đã làm, mới nhất ở trên.

### Lưu ý
- Claude Code **không push, không deploy** khi chưa được bạn đồng ý.
- Nếu một phiên bị ngắt giữa chừng, việc đang làm sẽ ở trạng thái `[~]`; phiên sau Claude Code tiếp tục từ đó.
- Có thể làm song song GĐ2, GĐ3, GĐ4 sau khi GĐ1 xong: dùng **Prompt chọn giai đoạn**.

---

## Dùng với Antigravity

Repo đã có sẵn cấu hình cho Antigravity, không cần dán prompt:

| File | Vai trò |
|---|---|
| `.agents/rules/kinh-te-v2.md` | Quy tắc luôn bật (`trigger: always_on`) — nội dung tương đương **Prompt chính** |
| `.agents/skills/tiep-tuc/SKILL.md` | `/tiep-tuc` — tương đương Prompt chính + Prompt tiếp tục |
| `.agents/skills/chon-giai-doan/SKILL.md` | `/chon-giai-doan 3` — chỉ làm giai đoạn 3 |
| `.agents/skills/ghi-quyet-dinh/SKILL.md` | `/ghi-quyet-dinh` + danh sách quyết định |
| `.agents/skills/kiem-tra-tien-do/SKILL.md` | `/kiem-tra-tien-do` — chỉ đọc |
| `.agents/skills/sua-loi-giai-doan/SKILL.md` | `/sua-loi-giai-doan` + mô tả lỗi + số giai đoạn |

**Cách dùng**
1. Mở thư mục `E:\cowdi-english` trong Antigravity.
2. Mở khung Agent, gõ `/tiep-tuc`. Agent đọc `TASK.md`, gửi kế hoạch; trả lời "ok" để bắt đầu.
3. Hết giai đoạn, agent dừng báo cáo; kiểm tra xong gõ lại `/tiep-tuc`.
4. Chốt thêm quyết định: `/ghi-quyet-dinh` rồi liệt kê quyết định, ví dụ:
   `/ghi-quyet-dinh Pet hết HP thì dừng trận ngay; đá dùng chung; 100% unit = mọi bài trọn điểm + kiểm tra cuối 100%`
5. Xem tiến độ nhanh: `/kiem-tra-tien-do`.

**Lưu ý**
- Dùng skill (`.agents/skills/`) thay vì workflow (`.agents/workflows/`): Antigravity chỉ chạy workflow đến 01/11/2026 và đã chuyển sang skill.
- Nên đặt chế độ chạy lệnh terminal của Antigravity ở mức "hỏi trước" để agent không tự chạy lệnh nguy hiểm.
- Nếu không thấy lệnh gạch chéo, kiểm tra Antigravity đã nhận thư mục `.agents/` (một số bản cũ dùng `.agent/`).
- Task list trong giao diện Antigravity chỉ dùng trong phiên; tiến độ chính vẫn ghi ở `TASK.md`.
- Có thể dùng xen kẽ Claude Code và Antigravity: cả hai cùng đọc/ghi `TASK.md`.

---

## Prompt chính (dán đầu mỗi phiên)

```
Bạn đang làm việc trên repo Cowdi English (React SPA + PWA ở src/, API Node ở server/).
Nhiệm vụ: triển khai Kinh tế v2 theo đúng thứ tự trong quy trình, và ghi tiến độ vào TASK.md.

## Đọc trước khi làm (theo thứ tự)
1. TASK.md (gốc repo) — tiến độ, "Quyết định đã chốt", "Cần chốt", "Vấn đề đang chặn".
2. docs/01-project-management/QUY-TRINH-TRIEN-KHAI-KINH-TE-V2.md — thứ tự giai đoạn, phụ thuộc, tiêu chí xong.
3. Tài liệu của giai đoạn đang làm (được liệt kê trong quy trình), gồm:
   - docs/04-design/ECONOMY-BATTLE-V2-IMPLEMENTATION.md (nguồn sự thật cho code)
   - docs/04-design/economy-v2/*.md (đề xuất cửa hàng, trang trí, Đấu trường, gacha, lệnh mô phỏng)
   - docs/05-implementation/CODING-STANDARDS.md
4. Thứ tự ưu tiên khi tài liệu mâu thuẫn:
   TASK.md "Quyết định đã chốt" > ECONOMY-BATTLE-V2-IMPLEMENTATION.md > docs/04-design/economy-v2/ > docs/Dac-ta-chien-dau-pet-Cowdi-v2.docx.
   Nếu vẫn không rõ: dừng lại và hỏi tôi, không tự đoán.

## Chọn việc
- Tìm giai đoạn đầu tiên chưa xong trong "Trạng thái tổng" mà các giai đoạn nó phụ thuộc đều đã [x].
- Trong giai đoạn đó, làm việc [~] trước (nếu có), rồi đến việc [ ] đầu tiên.
- Kiểm tra mục "Cần chốt": nếu có điểm chặn giai đoạn này mà chưa chốt và không có mặc định ghi kèm → ghi vào "Vấn đề đang chặn", đánh [!] cho việc liên quan, và hỏi tôi. Có thể làm tiếp các việc khác không bị chặn trong cùng giai đoạn.

## Trước khi sửa code
- Khảo sát code liên quan (không sửa), rồi gửi tôi kế hoạch ngắn cho giai đoạn: các việc, file sẽ đổi, migration DB, rủi ro.
- Chờ tôi trả lời "ok" mới bắt đầu sửa.
- Tạo/chuyển sang nhánh ghi trong "Trạng thái tổng" (ví dụ feat/economy-battle-v2).

## Khi làm
- Mọi tài nguyên (Sữa, Gem, Đá, mảnh đá, vé…) đi qua ledger trên server; client không tự cộng/trừ.
- Hằng số cân bằng/kinh tế đặt trong file cấu hình dùng chung, không hard-code.
- Migration phải chạy lại an toàn, không xoá dữ liệu người dùng.
- Tính năng mới đặt sau cờ bật/tắt (feature flag) khi hợp lý.
- Viết test cho logic mới; chạy test + `npm run build` trước khi đánh dấu xong.

## Cập nhật TASK.md (bắt buộc)
- Bắt đầu một việc: đổi [ ] → [~].
- Xong một việc: đổi → [x] và thêm cuối dòng "— YYYY-MM-DD · <commit ngắn>".
- Bỏ một việc: [-] kèm lý do. Bị chặn: [!] và thêm dòng vào "Vấn đề đang chặn".
- Thêm 1 dòng vào đầu bảng "Nhật ký" cho mỗi việc xong (ngày, GĐ, việc, commit, ghi chú).
- Khi mọi việc và "Tiêu chí xong" của giai đoạn đều [x]: cập nhật dòng giai đoạn trong "Trạng thái tổng" thành [x] + ngày xong.
- Không tự sửa mục "Quyết định đã chốt" trừ khi tôi yêu cầu.
- Commit TASK.md cùng commit với code của việc đó.

## Commit và giới hạn
- Commit theo quy ước `type(scope): message` (feat, fix, docs, refactor, test, chore), mỗi việc một hoặc vài commit.
- Không push, không deploy, không chạy deploy.ps1 khi chưa hỏi tôi.
- Không làm việc của giai đoạn sau khi giai đoạn hiện tại chưa xong (trừ khi tôi bảo).

## Kết thúc
- Hết giai đoạn hoặc hết phiên: dừng lại, gửi tôi báo cáo ngắn gồm: việc đã xong, commit, việc còn lại, vấn đề đang chặn, câu hỏi cần tôi chốt.
```

---

## Prompt tiếp tục (sau khi duyệt một giai đoạn)

```
Tôi đã kiểm tra giai đoạn vừa xong. Đọc lại TASK.md và tiếp tục theo Prompt chính với giai đoạn tiếp theo. Gửi kế hoạch trước khi sửa code.
```

## Prompt chọn giai đoạn (làm song song hoặc nhảy giai đoạn)

```
Đọc TASK.md và quy trình. Chỉ làm Giai đoạn <số> (ví dụ: 3). Kiểm tra các giai đoạn nó phụ thuộc đã xong chưa; nếu chưa thì báo tôi trước. Các quy tắc khác giữ như Prompt chính.
```

## Prompt ghi quyết định

```
Ghi các quyết định sau vào mục "Quyết định đã chốt" trong TASK.md (đánh số tiếp theo, ngày hôm nay), đánh dấu [x] mục tương ứng trong "Cần chốt", và nếu quyết định làm thay đổi tài liệu thiết kế trong docs/04-design/economy-v2/ hoặc ECONOMY-BATTLE-V2-IMPLEMENTATION.md thì cập nhật luôn. Commit với message docs(task): ...
- <quyết định 1>
- <quyết định 2>
```

## Prompt kiểm tra tiến độ (không sửa gì)

```
Đọc TASK.md và git log. Tóm tắt cho tôi: giai đoạn nào đã xong, đang làm gì, việc tiếp theo, các vấn đề đang chặn, và có chỗ nào TASK.md không khớp với code/commit thực tế không. Không sửa file.
```

## Prompt sửa lỗi trong giai đoạn đã xong

```
Phát hiện lỗi: <mô tả>. Thuộc giai đoạn <số>. Sửa trên nhánh của giai đoạn đó (hoặc nhánh fix/<tên>), thêm test tái hiện lỗi, ghi vào Nhật ký trong TASK.md với ghi chú "fix". Không đổi trạng thái [x] của giai đoạn trừ khi lỗi làm tiêu chí xong không còn đạt.
```
