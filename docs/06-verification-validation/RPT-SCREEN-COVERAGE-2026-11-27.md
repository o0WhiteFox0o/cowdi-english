# RPT-SCREEN-COVERAGE — Báo cáo Độ phủ Dữ liệu Màn học (2026-11-27)

> Sinh tự động bởi `node scripts/report-screen-coverage.mjs` (Bước 0.5 `GEMINI-SCREEN-SYSTEM-PHASE1`).
> Tổng kho: **221** bài (**209** bài áp dụng Hệ thống Màn học Đợt 1; **12** bài `picture` nhóm Mới học giữ nguyên `PictureLesson`).

## 1. Tổng hợp độ phủ theo mã màn (Đợt 1 — 7 màn T)

| Mã | Tên | Slot | Số bài chạy được | Tỉ lệ |
|---|---|---|---|---|
| `T-01` | Từ vựng | `intro` | 209 / 209 | **100%** |
| `T-02` | Flashcard | `intro` | 209 / 209 | **100%** |
| `T-04` | Đoạn văn | `read` | 209 / 209 | **100%** |
| `T-05` | Nghe câu | `listen` | 209 / 209 | **100%** |
| `T-06` | Nói theo | `speak` | 209 / 209 | **100%** |
| `T-07` | Quiz | `boss` | 209 / 209 | **100%** |
| `T-08` | Viết câu | `write` | 175 / 209 | **84%** |

## 2. Dự báo độ phủ 5 màn Thân thiện Đợt 3 (tham khảo)

| Mã | Slot | Số bài chạy được | Tỉ lệ |
|---|---|---|---|
| `F-01` | `intro` | 209 / 209 | **100%** |
| `F-03` | `listen` | 209 / 209 | **100%** |
| `F-08` | `read` | 209 / 209 | **100%** |
| `F-09` | `write` | 175 / 209 | **84%** |
| `F-06` | `boss` | 209 / 209 | **100%** |

## 3. Danh sách bài có slot không còn màn T nào chạy được (34 / 209 bài)

| Lesson ID | Cấp | Slot bị bỏ (chạy < 6 màn) | Lý do thiếu |
|---|---|---|---|
| `test-practice` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-pre-speaking` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-pre-task2-opinion` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-reading` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-writing` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-vocab-globalization` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-grammar-advanced` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-writing-task1-maps` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-task2-essays` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-speaking-advanced` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-speaking-part2-cue` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-speaking-part3-discussion` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-listening-advanced` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `ielts-reading-advanced` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `b1-reading-writing` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `b1-listening-1` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `b1-listening-2` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `b1-speaking-1` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `b1-speaking-2` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `b1-vocab-daily-life` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `b2-advanced-topics` | upper-intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `b2-writing-essay` | upper-intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `toeic-listening-reading` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `toeic-vocab-marketing-logistics` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `toeic-vocab-banking` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `toeic-listening-part34` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `toeic-reading-part6` | intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `toeic-reading-part7` | upper-intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `toeic-grammar-conditionals` | upper-intermediate | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `toeic-vocab-negotiations` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `toeic-part6-text-completion-advanced` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `adv-c1-complex-grammar` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `adv-c2-debate` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |
| `adv-c2-academic-publishing` | advanced | `write` | write (T-08: câu 3–8 từ ≥ 3) |

## 4. Ma trận chi tiết từng bài × 7 màn T

| Lesson ID | Cấp | T-01 | T-02 | T-04 | T-05 | T-06 | T-07 | T-08 | Kết luận |
|---|---|---|---|---|---|---|---|---|---|
| `alphabet` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `pronunciation-vowels` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `pronunciation-consonants` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `pronunciation-tricky` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `pronunciation-stress` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `numbers-basic` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `pronouns` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `articles` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `prepositions-place` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `wh-questions` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `daily-phrases` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `time-and-date` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `directions` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `money-prices` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `at-restaurant` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `at-airport` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `greetings` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `family` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `colors` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `numbers` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `daily-routine` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `food` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `travel` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `tenses` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `school` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `weather` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `jobs` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `body` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `clothing` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `house` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `emotions` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `hobbies` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `nature` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `technology` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `shopping` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `health` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `comparisons` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `environment` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `media` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `culture` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `business` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `science` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `education` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `exam-strategies` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `communication-skills` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `test-practice` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-foundation-vocab` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-foundation-grammar` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-foundation-reading` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-foundation-writing` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-foundation-listening` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-foundation-speaking` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-foundation-pronunciation` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-foundation-numbers` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-pre-vocab` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-pre-grammar` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-pre-reading` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-pre-listening` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-pre-speaking` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-pre-writing` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-pre-task1-bar` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-pre-task2-opinion` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-academic-vocab` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-listening` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-reading` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-writing` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-speaking` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-environment` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-education` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-health` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-technology` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-media` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-tourism` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-globalization` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-vocab-crime` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-economy` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-family` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-culture` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-transport` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-urbanization` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-employment` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-art` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-food` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-government` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-science` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-language` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-sports` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-history` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-architecture` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-agriculture` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-energy` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-shopping` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-childhood` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-vocab-aging` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-grammar-advanced` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-grammar-conditionals` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-grammar-passive` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-task1-practice` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-writing-task1-maps` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-writing-task1-process` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-task2-essays` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-speaking-advanced` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-speaking-part2-cue` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-speaking-part3-discussion` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-listening-advanced` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-reading-advanced` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `ielts-read-rooftop-farms` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-read-urban-trees` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `ielts-read-sleep-memory` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b1-everyday` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b1-travel-services` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b1-work-study` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b1-grammar-essentials` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b1-reading-writing` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `b1-listening-1` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `b1-listening-2` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `b1-speaking-1` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `b1-speaking-2` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `b1-vocab-daily-life` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `b2-advanced-topics` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `b2-formal-writing` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b2-advanced-grammar` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b2-use-of-english` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b2-reading-comprehension` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b2-listening-skills` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b2-speaking-part1` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b2-speaking-part34` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b2-writing-essay` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `b2-writing-review-report` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `b2-vocab-collocations` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-basics-office` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-basics-daily` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-office-equipment` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-elementary-convo` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-elementary-emails` | beginner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-telephoning` | elementary | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-schedules` | elementary | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-retail` | elementary | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-part1-photos` | elementary | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-business-comm` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-listening-reading` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `toeic-listening-part12` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-reading-part5` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-hr-finance` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-marketing-logistics` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `toeic-vocab-interview` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-emails-business` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-meetings` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-business-travel` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-hotel` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-banking` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `toeic-vocab-customer-service` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-healthcare` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-technology` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-shipping` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-invoicing` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-part2-qa` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-part5-tenses` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-part5-prepositions` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-grammar-passive` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-grammar-gerund-infinitive` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-training` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-corporate-events` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-listening-part34` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `toeic-reading-part6` | intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `toeic-reading-part7` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `toeic-vocab-contracts` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-manufacturing` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-real-estate` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-advertising` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-performance-review` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-business-news` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-part3-conversations-advanced` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-part4-talks-advanced` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-grammar-conditionals` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `toeic-grammar-relative-clauses` | upper-intermediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-advanced-meetings` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-advanced-reports` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-vocab-negotiations` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `toeic-vocab-csr` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-part6-text-completion-advanced` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `toeic-part7-double-passages` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `toeic-part7-triple-passages` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-academic-vocab` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-collocations` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-phrasal-verbs` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-register` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-writing-essays` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-listening` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-presentations` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-paraphrasing` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-summarizing` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-critical-thinking` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-research-paper` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-abstract-topics` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c1-complex-grammar` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `adv-c2-idioms` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c2-advanced-idioms` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c2-literary` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c2-cultural-refs` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c2-debate` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `adv-c2-rhetoric` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c2-satire-irony` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c2-public-speaking` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c2-fluency` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c2-etymology` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c2-philosophy` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
| `adv-c2-academic-publishing` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (câu 3–8 từ ≥ 3) | ⚠️ thiếu: write |
| `adv-c2-mastery-grammar` | advanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6/6 ✓ |
