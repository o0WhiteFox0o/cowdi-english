# 05 — Triển khai mã (Implementation)

Hướng dẫn cài đặt, build, PWA, tài nguyên hình ảnh, nội dung từ vựng. Quy ước code: [STD-CODING-v1.0.md](STD-CODING-v1.0.md).

<!-- file-index -->
## Tài liệu trong thư mục
Trạng thái & phiên bản: xem [REG-DOCUMENTS](../00-general/REG-DOCUMENTS.md).

- [STD-CODING-v1.0.md](STD-CODING-v1.0.md)
- [art/README.md](art/README.md) — **Bộ Quy chuẩn Mỹ thuật & Art Kit v1.1** ([STD-ART-STYLE-v1.1.md](art/STD-ART-STYLE-v1.1.md), [GDE-ART-WORKFLOW-v1.1.md](art/GDE-ART-WORKFLOW-v1.1.md), `art-spec.json`, `prompts/AI_PROMPT_BLOCKS.md`, `palettes/`, `templates/`, `face_kit/`, `ground_shadow/`, `tools/qc_check.py`, `tools/palette_lock.py`)
- [content/README.md](content/README.md) — **Bộ chuẩn nội dung bài học v1.0** (`STD-LESSON-CONTENT-v1.0`, `MAP-CURRENT-UI`, `PROMPT-GEMINI-CONTENT`, `CHK-LESSON-REVIEW`, `TPL-*`, `briefs/int-u1`)
- [REG-IMAGE-CATALOG.md](REG-IMAGE-CATALOG.md)
- [REG-UI-ICONS.md](REG-UI-ICONS.md) · [REG-UI-ICONS-PROMPTS.csv](REG-UI-ICONS-PROMPTS.csv)
- [GDE-PET-IMAGES-v1.0.md](GDE-PET-IMAGES-v1.0.md)
- [GDE-PWA-v1.0.md](GDE-PWA-v1.0.md)
- [GDE-BUILD-v1.0.md](GDE-BUILD-v1.0.md)
- [GDE-SETUP-v1.0.md](GDE-SETUP-v1.0.md)
- [GDE-VOCABULARY-v1.0.md](GDE-VOCABULARY-v1.0.md)
- [TASK-FRIENDS.md](TASK-FRIENDS.md) — **Hướng dẫn & checklist 8 bước triển khai Phân hệ Bạn bè & Thưởng mời bạn**
- [RPT-FRIENDS-SURVEY.md](RPT-FRIENDS-SURVEY.md) — **Báo cáo khảo sát mã nguồn Bước 0 cho Phân hệ Bạn bè & Thưởng mời bạn**
- [TASK-PET-DIRECTOR.md](TASK-PET-DIRECTOR.md) — **Kế hoạch & checklist triển khai Pet Director V2 (Gói A–E, GĐ 1–2)**
- [RPT-PET-DIRECTOR-SURVEY.md](RPT-PET-DIRECTOR-SURVEY.md) — **Báo cáo khảo sát mã nguồn Bước 0 cho Pet Director V2**
- [TASK-FLASHCARD-v1.4.md](TASK-FLASHCARD-v1.4.md) — **Kế hoạch & checklist nghiệm thu Flashcard Audio UX & Điểm nhớ v1.4 (PR A–C)**
- [RPT-FLASHCARD-SURVEY.md](RPT-FLASHCARD-SURVEY.md) — **Báo cáo khảo sát mã nguồn Bước 0 cho Flashcard v1.4**
- [screen-system/README.md](screen-system/README.md) — **Gói giao việc Hệ thống Màn học 4 Đợt** ([Phase 1](screen-system/GEMINI-SCREEN-SYSTEM-PHASE1.md) · [Phase 2](screen-system/GEMINI-SCREEN-SYSTEM-PHASE2.md) · [Phase 3](screen-system/GEMINI-SCREEN-SYSTEM-PHASE3.md) · [Phase 4](screen-system/GEMINI-SCREEN-SYSTEM-PHASE4.md))
- [TASK-SCREEN-SYSTEM.md](TASK-SCREEN-SYSTEM.md) — **Kế hoạch & checklist triển khai Hệ thống Màn học 4 Đợt (`WS-11`)**
- [RPT-SCREEN-SYSTEM-SURVEY.md](RPT-SCREEN-SYSTEM-SURVEY.md) — **Báo cáo khảo sát mã nguồn Bước 0 cho Hệ thống Màn học 4 Đợt**
- [GDE-SYSTEM-AUDIT-BUGS-v1.0.md](GDE-SYSTEM-AUDIT-BUGS-v1.0.md) — **Hướng dẫn Rà soát & Phát hiện Lỗi Hệ thống trước khi deploy**
