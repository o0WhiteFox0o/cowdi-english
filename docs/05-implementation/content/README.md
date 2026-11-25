# Bộ Chuẩn Nội dung Bài học Cowdi English — v1.0

> **Phiên bản:** 1.1 · **Ngày cập nhật:** 2026-11-26 · **Thuộc mục:** `05-implementation/content/` · **Đăng ký:** [REG-DOCUMENTS](../../00-general/REG-DOCUMENTS.md)

**Điểm bắt đầu khi soạn hoặc nâng cấp nội dung:** [PROMPT-GEMINI-CONTENT.md](PROMPT-GEMINI-CONTENT.md) · **Khi rà soát câu hỏi:** [GEMINI-QUESTION-QA.md](GEMINI-QUESTION-QA.md)

## Danh mục tài liệu & công cụ trong bộ chuẩn

| File | Vai trò |
|---|---|
| [SPMP-UPGRADE-CONTENT-LEARNING-GROUPS-v1.0.md](../../01-project-management/SPMP-UPGRADE-CONTENT-LEARNING-GROUPS-v1.0.md) | **Kế hoạch hợp nhất nâng cấp Lộ trình 3 nhóm & Chuẩn nội dung v2** |
| [SRS-LESSON-3-LEVELS-v1.0.md](../../02-requirements/SRS-LESSON-3-LEVELS-v1.0.md) | Yêu cầu xây dựng bài học theo 3 cấp (`LESSON-REQUIREMENTS-3-LEVELS`) |
| [SDD-LEARNING-GROUPS-v2.0.md](../../04-design/SDD-LEARNING-GROUPS-v2.0.md) | Thiết kế kỹ thuật tách 3 nhóm lộ trình & migration (`GEMINI-LEARNING-GROUPS` v2) |
| [STD-LESSON-CONTENT-v1.0.md](STD-LESSON-CONTENT-v1.0.md) | Chuẩn nội dung bắt buộc cho 3 cấp (Starter / Intermediate / Exam) |
| [STD-QUESTION-QUALITY-v1.0.md](STD-QUESTION-QUALITY-v1.0.md) | **Chuẩn chất lượng & rà soát câu hỏi trắc nghiệm** (5 luật cứng, 11 dạng câu, 14 mã validator) |
| [GEMINI-QUESTION-QA.md](GEMINI-QUESTION-QA.md) | Quy trình AI rà soát & sửa câu hỏi (`Q0–Q6`, đã hoàn tất Đợt 1 & Đợt 2) |
| [MAP-CURRENT-UI.md](MAP-CURRENT-UI.md) | Đối chiếu bài v2 với luồng học hiện tại (`LessonDetailPage`) + 10 việc sửa UI (`U1–U10`) + 2 lỗi dữ liệu có sẵn |
| [PROMPT-GEMINI-CONTENT.md](PROMPT-GEMINI-CONTENT.md) | Lời nhắc & quy trình bắt đầu cho Gemini khi soạn/nâng cấp từng unit |
| [CHK-LESSON-REVIEW.md](CHK-LESSON-REVIEW.md) | Danh sách kiểm tra chất lượng khi duyệt PR bài học |
| [TPL-STARTER.md](TPL-STARTER.md) | Mẫu brief & khung dữ liệu cấp 1 (`format: 'picture'`) |
| [TPL-INTERMEDIATE.md](TPL-INTERMEDIATE.md) | Mẫu brief & khung dữ liệu cấp 2 (`general` / `advanced`) |
| [TPL-EXAM.md](TPL-EXAM.md) | Mẫu brief & khung dữ liệu cấp 3 (`ielts` / `toeic` / `b1` / `b2`) |
| [briefs/int-u1.md](briefs/int-u1.md) | Brief mẫu cho unit đầu tiên (`int-u1 — Làm quen`) |
| [RPT-LESSON-CONTENT-2026-11-24.md](../../06-verification-validation/RPT-LESSON-CONTENT-2026-11-24.md) | Báo cáo kiểm tra kho bài học ban đầu (+ 3 bài golden) |
| [RPT-QUESTION-AUDIT-2026-11-26.md](../../06-verification-validation/RPT-QUESTION-AUDIT-2026-11-26.md) | **Báo cáo rà soát 2.829 câu hỏi (0 lỗi cứng · 54/54 bài v2 0 cảnh báo)** |
| [`src/data/lessons/schema.js`](../../../src/data/lessons/schema.js) | Chuẩn dạng mã: `RULES`, `validateLesson`, `toLegacyShape`, `examQuestionsToMcq` |
| [`shared/question-rules.js`](../../../shared/question-rules.js) | Validator câu hỏi dùng chung (14 mã + `Q-OPT-ALL`) & bảng `src/data/lexicon/` |
| [`src/data/lessons/_golden/`](../../../src/data/lessons/_golden/index.js) | 3 bài mẫu chuẩn golden (`s1-pets`, `greetings`, `ielts-read-rooftop-farms`) |
| [`scripts/validate-lessons.mjs`](../../../scripts/validate-lessons.mjs) | Công cụ kiểm tra tự động toàn kho bài học & câu hỏi (`--questions --fail-on-hard`) |
| [`scripts/check-lesson-ui-compat.mjs`](../../../scripts/check-lesson-ui-compat.mjs) | Công cụ chạy bài golden qua logic `LessonDetailPage` hiện tại |
| [`shared/lesson-schema.test.js`](../../../shared/lesson-schema.test.js) | Test schema & bài golden · cùng [`shared/question-rules.test.js`](../../../shared/question-rules.test.js) & [`shared/quiz-gen.test.js`](../../../shared/quiz-gen.test.js) |

## Lệnh kiểm tra nhanh

```bash
node --test shared/lesson-schema.test.js shared/question-rules.test.js shared/quiz-gen.test.js
npm run validate:lessons
npm run validate:questions
node scripts/check-lesson-ui-compat.mjs
```
