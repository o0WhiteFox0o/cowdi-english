# Báo cáo rà soát chất lượng ngân hàng câu hỏi (2026-11-25)

| Mục | Giá trị |
|---|---|
| Chuẩn áp dụng | `STD-QUESTION-QUALITY v1.0` |
| Công cụ | `node scripts/validate-lessons.mjs --questions` |
| Tổng số câu hỏi kiểm tra | **2829** (+ 12 bài Starter `words[]`) |
| Tổng lỗi cứng (ERROR) | **0** |
| Tổng cảnh báo (WARNING) | **2672** |

---

## 1. Thống kê theo mã lỗi & cảnh báo

| Mức | Mã | Số lượng |
|---|---|---:|
| ⚠️ Cảnh báo | `Q-EXPL` | 2187 |
| ⚠️ Cảnh báo | `Q-LEN` | 250 |
| ⚠️ Cảnh báo | `Q-POS` | 235 |

## 2. Chi tiết toàn bộ lỗi cứng (ưu tiên sửa ngay Đợt 1)

✅ Không còn lỗi cứng nào trong toàn bộ ngân hàng câu hỏi.

## 3. Thống kê theo nhóm / Unit

| Nhóm / Unit | Số câu | Lỗi cứng | Cảnh báo |
|---|---:|---:|---:|
| `ielts` | 558 | 0 | 621 |
| `toeic` | 419 | 0 | 511 |
| `advanced` | 211 | 0 | 277 |
| `QUIZ_BANK.vocab` | 250 | 0 | 254 |
| `QUIZ_EXTRA.VOCAB_EXTRA` | 235 | 0 | 239 |
| `b2` | 87 | 0 | 99 |
| `QUIZ_BANK.grammar` | 96 | 0 | 98 |
| `b1` | 80 | 0 | 91 |
| `QUIZ_EXTRA.GRAMMAR_EXTRA` | 81 | 0 | 83 |
| `general` | 62 | 0 | 70 |
| `QUIZ_BANK.listening` | 50 | 0 | 52 |
| `QUIZ_BANK.sentences` | 42 | 0 | 45 |
| `QUIZ_EXTRA.SENTENCES_EXTRA` | 42 | 0 | 45 |
| `QUIZ_EXTRA.LISTENING_EXTRA` | 40 | 0 | 42 |
| `int-u9` | 39 | 0 | 21 |
| `int-u5` | 52 | 0 | 20 |
| `int-u10` | 39 | 0 | 18 |
| `int-u6` | 65 | 0 | 16 |
| `int-u7` | 52 | 0 | 16 |
| `int-u8` | 39 | 0 | 12 |
| `int-u3` | 52 | 0 | 12 |
| `int-u2` | 52 | 0 | 11 |
| `int-u4` | 65 | 0 | 10 |
| `int-u1` | 52 | 0 | 9 |

## 4. Cần Sonny xem (Đợt sau)

- **Cảnh báo `Q-LEN` & `Q-POS` trên bài v2 và bài cũ:** không chặn người học nhưng nên cân chỉnh dần theo từng unit ở các đợt sau.
- **Cảnh báo `Q-EXPL` trên bài cũ (legacy):** hiện chỉ bài v2 mới bắt buộc `explanation`; bài cũ sẽ bổ sung theo lộ trình nâng cấp bài v2 (`SPMP-UPGRADE-CONTENT-LEARNING-GROUPS-v1.0`).
- **File trùng `src/data/quiz-bank-extra.js` ở gốc `src/data/`:** kiểm tra xem còn nơi nào dùng không, nếu không nên dọn để tránh hai bản sao song song với `src/data/quiz/quiz-bank-extra.js`.
