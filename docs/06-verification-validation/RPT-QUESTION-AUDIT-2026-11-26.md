# Báo cáo rà soát chất lượng ngân hàng câu hỏi (2026-11-25)

| Mục | Giá trị |
|---|---|
| Chuẩn áp dụng | `STD-QUESTION-QUALITY v1.0` |
| Công cụ | `node scripts/validate-lessons.mjs --questions` |
| Tổng số câu hỏi kiểm tra | **2829** (+ 12 bài Starter `words[]`) |
| Tổng lỗi cứng (ERROR) | **28** |
| Tổng cảnh báo (WARNING) | **2668** |

---

## 1. Thống kê theo mã lỗi & cảnh báo

| Mức | Mã | Số lượng |
|---|---|---:|
| ⚠️ Cảnh báo | `Q-EXPL` | 2188 |
| ⚠️ Cảnh báo | `Q-LEN` | 247 |
| ⚠️ Cảnh báo | `Q-POS` | 233 |
| ❌ Lỗi cứng | `Q-OPT-DUP` | 9 |
| ❌ Lỗi cứng | `Q-OPT-ALL` | 7 |
| ❌ Lỗi cứng | `Q-L3-LEAK` | 6 |
| ❌ Lỗi cứng | `Q-L5-LANG` | 3 |
| ❌ Lỗi cứng | `Q-L1-SYN` | 2 |
| ❌ Lỗi cứng | `Q-L2-AUDIO` | 1 |

## 2. Chi tiết toàn bộ lỗi cứng (ưu tiên sửa ngay Đợt 1)

| # | Nguồn | Mã | Mô tả |
|---:|---|---|---|
| 1 | `s1-hello:words` | `Q-L1-SYN` | Bài Starter có cặp từ đồng nghĩa "hello" và "hi" trong cùng danh sách words[] |
| 2 | `s1-hello:quiz#0` | `Q-L1-SYN` | Đáp án nhiễu "hi" đồng nghĩa / biến thể chính tả với đáp án đúng "hello" |
| 3 | `pronunciation-tricky:quiz#1` | `Q-OPT-ALL` | Không dùng phương án "Tất cả đều đúng" (STD §3.4.5) |
| 4 | `ielts-foundation-listening:quiz#4` | `Q-L2-AUDIO` | Câu hỏi yêu cầu nghe ("Nghe "oh-seven-double-nine" là số:") nhưng thiếu audioText/audioUrl/speak |
| 5 | `ielts-speaking-advanced:quiz#3` | `Q-L5-LANG` | Lựa chọn lẫn tiếng Anh và tiếng Việt: [Chỉ Yes/No \| Answer + Explain + Example \| Đọc thuộc lòng \| Nói thật ngắn] |
| 6 | `b1-grammar-essentials:reading.questions#1` | `Q-OPT-DUP` | Trùng lựa chọn "Tuy nhiên" (vị trí 2 và 3) |
| 7 | `b1-listening-2:quiz#4` | `Q-L5-LANG` | Lựa chọn lẫn tiếng Anh và tiếng Việt: [Ngữ pháp câu \| Spelling, numbers, dates \| Giọng điệu \| Tốc độ nói] |
| 8 | `b2-writing-review-report:quiz#2` | `Q-L5-LANG` | Lựa chọn lẫn tiếng Anh và tiếng Việt: [Thân mật \| Impersonal/Formal \| Hài hước \| Thơ ca] |
| 9 | `QUIZ_BANK.vocab#23` | `Q-L3-LEAK` | Lộ đáp án: câu hỏi ""Yoga" nghĩa là:" có đáp án đúng trùng nguyên từ hỏi "Yoga" |
| 10 | `QUIZ_BANK.vocab#105` | `Q-L3-LEAK` | Lộ đáp án: câu hỏi ""Taxi" nghĩa là:" có đáp án đúng trùng nguyên từ hỏi "Taxi" |
| 11 | `QUIZ_BANK.vocab#197` | `Q-L3-LEAK` | Lộ đáp án trong gợi ý ngoặc đơn (độ cứng): đáp án đúng là "Cứng" |
| 12 | `QUIZ_BANK.grammar#72` | `Q-OPT-ALL` | Không dùng phương án "cả A và B đều đúng" (STD §3.4.5) |
| 13 | `QUIZ_BANK.listening#14` | `Q-OPT-DUP` | Trùng lựa chọn "Internett" (vị trí 0 và 3) |
| 14 | `QUIZ_BANK.listening#26` | `Q-OPT-DUP` | Trùng lựa chọn "Intresting" (vị trí 1 và 3) |
| 15 | `QUIZ_BANK.listening#35` | `Q-OPT-DUP` | Trùng lựa chọn "Especialy" (vị trí 0 và 3) |
| 16 | `QUIZ_BANK.listening#42` | `Q-OPT-DUP` | Trùng lựa chọn "Goverment" (vị trí 0 và 3) |
| 17 | `QUIZ_BANK.sentences#14` | `Q-OPT-ALL` | Không dùng phương án "Cả A và B đều đúng" (STD §3.4.5) |
| 18 | `QUIZ_BANK.sentences#26` | `Q-OPT-ALL` | Không dùng phương án "Cả A và C đúng" (STD §3.4.5) |
| 19 | `QUIZ_EXTRA.GRAMMAR_EXTRA#57` | `Q-OPT-ALL` | Không dùng phương án "cả A và B đều đúng" (STD §3.4.5) |
| 20 | `QUIZ_EXTRA.LISTENING_EXTRA#4` | `Q-OPT-DUP` | Trùng lựa chọn "Internett" (vị trí 0 và 3) |
| 21 | `QUIZ_EXTRA.LISTENING_EXTRA#16` | `Q-OPT-DUP` | Trùng lựa chọn "Intresting" (vị trí 1 và 3) |
| 22 | `QUIZ_EXTRA.LISTENING_EXTRA#25` | `Q-OPT-DUP` | Trùng lựa chọn "Especialy" (vị trí 0 và 3) |
| 23 | `QUIZ_EXTRA.LISTENING_EXTRA#32` | `Q-OPT-DUP` | Trùng lựa chọn "Goverment" (vị trí 0 và 3) |
| 24 | `QUIZ_EXTRA.SENTENCES_EXTRA#14` | `Q-OPT-ALL` | Không dùng phương án "Cả A và B đều đúng" (STD §3.4.5) |
| 25 | `QUIZ_EXTRA.SENTENCES_EXTRA#26` | `Q-OPT-ALL` | Không dùng phương án "Cả A và C đúng" (STD §3.4.5) |
| 26 | `QUIZ_EXTRA.VOCAB_EXTRA#8` | `Q-L3-LEAK` | Lộ đáp án: câu hỏi ""Yoga" nghĩa là:" có đáp án đúng trùng nguyên từ hỏi "Yoga" |
| 27 | `QUIZ_EXTRA.VOCAB_EXTRA#90` | `Q-L3-LEAK` | Lộ đáp án: câu hỏi ""Taxi" nghĩa là:" có đáp án đúng trùng nguyên từ hỏi "Taxi" |
| 28 | `QUIZ_EXTRA.VOCAB_EXTRA#182` | `Q-L3-LEAK` | Lộ đáp án trong gợi ý ngoặc đơn (độ cứng): đáp án đúng là "Cứng" |

## 3. Thống kê theo nhóm / Unit

| Nhóm / Unit | Số câu | Lỗi cứng | Cảnh báo |
|---|---:|---:|---:|
| `QUIZ_BANK.listening` | 50 | 4 | 52 |
| `QUIZ_EXTRA.LISTENING_EXTRA` | 40 | 4 | 42 |
| `QUIZ_BANK.vocab` | 250 | 3 | 254 |
| `QUIZ_EXTRA.VOCAB_EXTRA` | 235 | 3 | 239 |
| `ielts` | 558 | 2 | 621 |
| `b1` | 80 | 2 | 91 |
| `QUIZ_BANK.sentences` | 42 | 2 | 45 |
| `QUIZ_EXTRA.SENTENCES_EXTRA` | 42 | 2 | 45 |
| `s1-u1` | 22 | 2 | 0 |
| `QUIZ_BANK.grammar` | 96 | 1 | 99 |
| `b2` | 87 | 1 | 97 |
| `QUIZ_EXTRA.GRAMMAR_EXTRA` | 81 | 1 | 84 |
| `general` | 62 | 1 | 69 |
| `toeic` | 419 | 0 | 508 |
| `advanced` | 211 | 0 | 277 |
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
