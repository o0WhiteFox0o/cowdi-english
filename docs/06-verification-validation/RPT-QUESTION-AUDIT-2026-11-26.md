# Báo cáo rà soát chất lượng ngân hàng câu hỏi (2026-11-26)

| Mục | Giá trị |
|---|---|
| Chuẩn áp dụng | `STD-QUESTION-QUALITY v1.0` |
| Công cụ | `npm run validate:questions` (`scripts/validate-lessons.mjs --questions --fail-on-hard`) |
| Tổng số câu hỏi kiểm tra | **2.829** (+ 12 bài Starter `words[]`) |
| Tổng lỗi cứng (ERROR) | **0** *(đã sửa 29/29 lỗi cứng Đợt 1)* |
| Bài đạt chuẩn v2 (54 bài) | **0 lỗi · 0 cảnh báo** *(đã xử lý 70/70 `Q-LEN` & 89/89 `Q-POS` Đợt 2)* |
| Tổng cảnh báo bài cũ (legacy & `QUIZ_BANK`) | **2.500** (`2.187 Q-EXPL`, `170 Q-LEN`, `143 Q-POS`) |

---

## 1. Thống kê theo mã lỗi & cảnh báo

| Mức | Mã | Số lượng |
|---|---|---:|
| ⚠️ Cảnh báo | `Q-EXPL` | 2187 |
| ⚠️ Cảnh báo | `Q-LEN` | 170 |
| ⚠️ Cảnh báo | `Q-POS` | 143 |

## 2. Chi tiết toàn bộ lỗi cứng (ưu tiên sửa ngay Đợt 1)

✅ Không còn lỗi cứng nào trong toàn bộ ngân hàng câu hỏi.

## 3. Thống kê theo nhóm / Unit

| Nhóm / Unit | Số câu | Lỗi cứng | Cảnh báo |
|---|---:|---:|---:|
| `ielts` | 558 | 0 | 600 |
| `toeic` | 419 | 0 | 506 |
| `advanced` | 211 | 0 | 275 |
| `QUIZ_BANK.vocab` | 250 | 0 | 254 |
| `QUIZ_EXTRA.VOCAB_EXTRA` | 235 | 0 | 239 |
| `QUIZ_BANK.grammar` | 96 | 0 | 98 |
| `b2` | 87 | 0 | 97 |
| `b1` | 80 | 0 | 94 |
| `QUIZ_EXTRA.GRAMMAR_EXTRA` | 81 | 0 | 83 |
| `general` | 62 | 0 | 70 |
| `QUIZ_BANK.listening` | 50 | 0 | 52 |
| `QUIZ_BANK.sentences` | 42 | 0 | 45 |
| `QUIZ_EXTRA.SENTENCES_EXTRA` | 42 | 0 | 45 |
| `QUIZ_EXTRA.LISTENING_EXTRA` | 40 | 0 | 42 |

## 4. Cần Sonny xem (Đợt sau)

- **Cảnh báo `Q-LEN` & `Q-POS` trên bài cũ (legacy):** không chặn người học; tiếp tục cân chỉnh cuốn chiếu khi nâng cấp bài cũ lên v2.
- **Cảnh báo `Q-EXPL` trên bài cũ (legacy):** hiện chỉ bài v2 mới bắt buộc `explanation`; bài cũ sẽ bổ sung theo lộ trình nâng cấp bài v2 (`SPMP-UPGRADE-CONTENT-LEARNING-GROUPS-v1.0`).
