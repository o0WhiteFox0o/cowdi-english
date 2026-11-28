# Gói giao việc: Hệ thống màn học Cowdi (4 đợt)

Ngày đóng gói: 27/11/2026 · Cập nhật trạng thái: **28/11/2026** · Người duyệt: Sonny · Người soạn: Claude

## 0. Trạng thái triển khai thực tế trên `main` (28/11/2026)

| Đợt | Trạng thái | Commit trên `main` | Ghi chú triển khai & điều chỉnh của Sonny |
|---|---|---|---|
| **Đợt 1** | ✅ Đã gộp `main` | `aed7af9` | 7 màn T + T-08 Viết câu, T-03 → mẹo pet + `GrammarSheet`, bộ trộn M1–M9, `ScreenHost` + cờ `screenSystemV1` |
| **Đợt 2** | ✅ Đã gộp `main` | `1e0fffc` | 4 bảng cấu hình (`RK-005`), `/admin/screens` (6 tab), test A1–A8 |
| **Đợt 3** | ✅ Đã gộp `main` | `eaaa812` | 5 màn F (`F-01, F-03, F-06, F-08, F-09`), Mở ải, Tổng kết mới, 156 câu dẫn `draft`, Sao ★ & Sữa Q13, Khách quen, 4 chấm `skillsHit`; **đổi tên F-03 → Nghe nhận diện từ**, zero-scroll `360×640` bằng Container Queries + `ScreenActionModal` |
| **Đợt 4a** | ✅ Đã gộp `main` | `1cbc9fb` | Thống kê ẩn danh `screen_stat_daily` (không `user_id`) + Tab 8 **Thống kê**, file kịch bản tên màn `shared/screen-scenarios.js`, 3 màn F (`F-02, F-04, F-05`) + 36 câu dẫn `draft`; **F-04 tự mở mic sau 3-2-1, chỉ hiện nút mic khi trình duyệt chặn, Mới học không chấm** |
| **Đợt 4b** | ✅ Đã gộp `main` | `285ba12` | Schema v1.1 + validator (`imageExists`, Q8), dữ liệu mẫu `int-u1..u3` (12 bài), 3 màn F cuối (`F-07, F-10, F-11`) + 36 câu dẫn `draft` (tổng **228 câu dẫn**); runner gộp `scripts/run-screen-system-p4b-migration.js`; **269/269 test PASS**, đã đóng gói `deploy.zip` |
| **Đợt 4c** | ⏳ Chờ chạy thật ≥ 2 tuần | — | Giữ code tab cũ trong `LessonDetailPage.jsx` và cờ `screenSystemV1` để an toàn trong giai đoạn UAT trên server `cowdi.net` |

---

## 1. Trong gói

| File | Vai trò |
|---|---|
| `STD-SCREEN-SYSTEM-v1.0.md` | **Chuẩn gốc**: mã màn T/F, hai mức Tập trung / Thân thiện, luật trộn 6 màn, dẫn nhập, admin. Đọc đầu tiên |
| `GEMINI-SCREEN-SYSTEM-PHASE1.md` | Đợt 1: registry, bộ trộn có test, tách 6 màn T, màn T-08 Viết câu, T-03 thành mẹo pet |
| `GEMINI-SCREEN-SYSTEM-PHASE2.md` | Đợt 2: cấu hình trên server, trang `/admin/screens` |
| `GEMINI-SCREEN-SYSTEM-PHASE3.md` | Đợt 3: 5 màn Thân thiện đầu, Mở ải, dẫn nhập không lặp, khách quen, 4 chấm của từ, sao + Sữa theo sao, Tổng kết mới |
| `GEMINI-SCREEN-SYSTEM-PHASE4.md` | Đợt 4: 6 màn Thân thiện còn lại, trường dữ liệu mới, thống kê màn, dọn code cũ |

Mẫu giao diện: canvas **Cowdi — Giao diện vượt ải bài học** https://claude.ai/artifact/VJ892VhfN5q4z3E6HZKTrR (trang "Thiết kế chính · trộn màn"). Hai trang "không dùng" chỉ để tham khảo; riêng màn E của trang "Chế độ người lớn" là mẫu cho T-08.

## 2. Tài liệu tham chiếu (có trong Project "Cowdi English", thư mục `claude/`; đặt cùng chỗ trong repo)

Gemini cần đọc các file này khi đợt tương ứng nhắc tới:

| File | Đợt dùng |
|---|---|
| `STD-LEARNING-UX-v1.0.md` | 1–4 (không cuộn, ngân sách thao tác, pet dẫn nhịp) |
| `AUDIT-LEARNING-UX-2026-11-27.md` | 1 (lỗi chấm điểm A1–A3 phải sửa trước) |
| `PET-DIRECTOR-INTEGRATION.md` | 1–4 (`dispatch`, giọng văn pet) |
| `GEMINI-FLASHCARD-AUDIO-UX.md` | 1, 3 (F3 `wordProgress`) |
| `GEMINI-LEARNING-GROUPS.md` | 1–4 (nhóm học, `lessonPassRate`, `pretest`, migration mẫu) |
| `STD-LESSON-CONTENT-v1.0.md` | 1, 4 (schema bài, validator) |
| `MAP-CURRENT-UI.md` | 1, 4 (luồng tab hiện tại, tô cụm từ U5) |
| `STORY-BIBLE-IMPLEMENTATION.md` | 3, 4 (vùng đất `UNIT_REGION`, `HUMAN_CAST`) |
| `COWDI-AI-PROMPT-BLOCKS.md` | 3, 4 (soạn câu dẫn, prompt hình) |
| `AUDIO-DESIGN-BIBLE.md` | 3, 4 (SFX) |
| `GEMINI-PET-MOTION-ADMIN.md` | 2 (cách làm trang admin hiện có) |

## 3. Thứ tự và cổng duyệt

```
Đợt 1 ──merge──▶ Đợt 2 ──merge──▶ Đợt 3 ──thử ≥1 tuần──▶ Đợt 4a ─▶ 4b ─▶ (bật cho mọi người ≥2 tuần) ─▶ 4c
```

| Cổng | Sonny cần làm |
|---|---|
| Trước Đợt 1 | Xác nhận nhánh nền (mục Bước 0 Đợt 1); đồng ý làm A1–A3 trước nếu chưa có |
| Sau Đợt 1 | Đọc `RPT-SCREEN-COVERAGE`: bài nào chỉ chạy 5 màn; thử cờ trên máy thật |
| Sau Đợt 2 | Thử trang admin; chọn 5–10 tài khoản thử |
| Sau Đợt 3 | Kiểm Sữa theo sao trên bảng cân bằng (trang Kinh tế) · Duyệt câu dẫn (`draft` → `approved`) trong admin; cung cấp ảnh Boss sương (hoặc chấp nhận bản CSS); sau ≥1 tuần quyết bật `on` từng màn |
| Trước Đợt 4b | Duyệt nội dung `dialogPrompts`, `trueFalse`; làm ảnh còn thiếu theo `sceneBrief` |
| Trước Đợt 4c | Bật cờ cho mọi người, theo dõi 2 tuần |

Đợt 1 và Đợt 2 có thể giao song song cho hai phiên làm việc nếu Đợt 2 chỉ làm phần server + trang admin trên nhánh dựng từ Đợt 1 đang mở.

## 4. Còn chờ Sonny chốt (không chặn Đợt 1–3)

- ~~Sao và thưởng Sữa theo sao~~ → **đã chốt 27/11** (STD 3.5), làm ở Đợt 3.
- Có chuyển nhóm Mới học (`PictureLesson`) sang hệ thống màn không (Đợt 3 mục 9).

## 5. Lời nhắc giao cho Gemini (dán kèm mỗi đợt)

```text
Bạn làm việc trên repo cowdi-english (React 18 + Vite, server Express + MySQL).
Đọc STD-SCREEN-SYSTEM-v1.0.md, rồi GEMINI-SCREEN-SYSTEM-PHASE{N}.md, rồi các tài liệu tham chiếu mà file đó nhắc tới.
Chỉ làm ĐỢT {N}. Làm Bước 0 trước và ghi kết quả vào mô tả PR.
Không merge. Mỗi PR: danh sách file đổi, cách test, kết quả node --test / npm test,
ảnh chụp 360×640 các màn đã làm, số chạm vận hành mỗi màn trước/sau.
Chỗ nào tài liệu không khớp code thật: dừng, ghi rõ chỗ lệch và đề xuất, không tự đoán.
```
