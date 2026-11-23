# LOG-PROGRESS — Nhật ký tiến trình dự án Cowdi English
Tài liệu sống · Chuẩn tham chiếu: IEEE 16326 (báo cáo trạng thái) · Quy ước: [DOCP-COWDI-v1.1](../00-general/DOCP-COWDI-v1.1.md)
**Cập nhật lần cuối:** 2026-11-23

---

## Cách cập nhật file này
1. **Mỗi khi xong một việc** (một phase, một tính năng, một bản deploy): sửa cột *Trạng thái* ở §1/§2 và thêm **một dòng ở đầu** §5 Nhật ký (mới nhất ở trên).
2. **Khi Sonny chốt một mục ở §3**: chuyển dòng đó sang §5 với nội dung "Chốt: …", rồi sửa giá trị trong `shared/game-config.js` nếu cần.
3. **Khi phát hiện lỗi/rủi ro**: thêm vào §4 với mã `RK-xxx` tiếp theo; sửa xong thì ghi `Đã sửa (ngày)`.
4. Đổi ngày "Cập nhật lần cuối" ở đầu file.

Ký hiệu trạng thái: ✅ Xong · 🟡 Đang làm / xong một phần · ⏳ Chưa bắt đầu · ⛔ Bị chặn

---

## 1. Tổng quan các mảng việc
| Mảng | Tài liệu gốc | Trạng thái | Ghi chú |
|---|---|---|---|
| Kinh tế & Chiến đấu v2.1 | [SDD-ECONOMY-BATTLE-v2.1](../04-design/SDD-ECONOMY-BATTLE-v2.1.md) | 🟡 Phase 2/6 | Chi tiết ở §2 |
| Tổ chức lại tài liệu theo IEEE 15289 | [DOCP-COWDI-v1.1](../00-general/DOCP-COWDI-v1.1.md) | ✅ | 43 file đổi tên, sổ đăng ký [REG-DOCUMENTS](../00-general/REG-DOCUMENTS.md) |
| Shop / Coins / Nạp tiền Gem | SDD-ECONOMY-BATTLE-v2.1 §7 | ⏳ Tạm gác | Ngoài phạm vi đợt này |
| Kế hoạch kiểm thử (STP), RTM, SCMP | [STP](../06-verification-validation/STP-COWDI-v0.1.md), [RTM](../02-requirements/RTM-COWDI.md), [SCMP](SCMP-COWDI-v0.1.md) | ⏳ | Mới có khung rỗng |

## 2. Kinh tế & Chiến đấu v2.1 — theo Phase (SDD §9)
| Phase | Nội dung | Trạng thái | Ngày | Kết quả / file chính |
|---|---|---|---|---|
| 1 | Config & battle engine dùng chung | ✅ Code xong · ⚠ chưa commit | 2026-11-23 | `shared/game-config.js`, `shared/battle-engine.js`, test `npm test`; `deploy.ps1` copy `shared/` |
| 2 | Dữ liệu pet: 10 hệ, nhóm, `evolveReq`; power score v2; bỏ tính cấp theo XP | ✅ Code xong · ⚠ chưa build, chưa commit | 2026-11-23 | `src/data/pets.js`, 13 file UI, `server/routes/api.js`, `server/utils/pet-icon.js`; 44/44 test xanh |
| 3 | Điểm kỹ năng: nối lesson/practice/mini-game/checkpoint/duel vào `onQuizComplete`; bỏ +5 cả 4 kỹ năng | ⏳ | — | Xem SDD §0.5.3 |
| 4 | Ledger, Gem, Đá, Sữa trên server, API evolve, UI Tiến hoá, khoá `evolution` | ⏳ | — | SDD §0.5.4, §0.5.5, §6 |
| 5 | Trận đấu tính trên server, `battle_log`, ghép ±1 cấp, DuelPage phát lại | ⏳ | — | SDD §0.5.6 |
| 6 | Mô phỏng cân bằng `scripts/sim-battles.mjs` | ⏳ | — | SDD §9 Phase 6, tiêu chí ±5% |

> ⚠ **Không deploy Phase 2 riêng lẻ.** Phase 2 đã bỏ việc tự lên cấp theo XP và bỏ "Cho Pet ăn XP"; nút Tiến hoá mới có ở Phase 4. Deploy Phase 2 một mình → pet người chơi đứng yên ở cấp hiện tại.

**Việc cần làm trước khi merge Phase 1–2:** `npm install` → `npm run build` → `npm test` → commit (máy dev hiện chưa có `git` trong PATH và chưa có `node_modules`).

## 3. Chờ Sonny quyết định
| # | Câu hỏi | Mặc định đang dùng | Nguồn |
|---|---|---|---|
| Q-01 | Quy tắc Gem chính thức (có thưởng bài kiểm tra cuối unit?) | 1 Gem / 2 bài mới (`GEM_PER_NEW_LESSONS = 2`) | SDD §2.2 [MỞ] |
| Q-02 | Đá nguyên tố tách theo 10 hệ? | 1 loại dùng chung | SDD §2.3 [MỞ] |
| Q-03 | Gem nạp tiền thay được Đá? | Không | SDD §2.3 [MỞ] |
| Q-04 | Pet về 0 HP giữa trận thì dừng? | Không dừng, chấm hết câu (`STOP_AT_ZERO = false`) | SDD §5.1 [MỞ] |
| Q-05 | Số câu mỗi trận | Cố định 10 (`DUEL_QUESTIONS`) | SDD §0.5.6 [MỞ] |
| Q-06 | Trận pending cũ không có snapshot | Snapshot lúc join cho cả hai bên | SDD §0.5.6 |
| Q-07 | Di trú người chơi cũ (Sữa = `available_xp`, Gem/Đá tính lại theo bài đã học) | Theo SDD §6.4 | SDD §6.4 [MỞ] |
| Q-08 | Xác nhận 13 cách hiểu luật trận đấu khi SDD chưa nói rõ (bỏng, choáng, lá chắn, Bản năng săn, hồi máu, Long huyết, giảm sát thương, Phong, thời gian, RNG, hoà, làm tròn, icon Đá 🪨) | Như đã cài trong `shared/battle-engine.js` | Báo cáo Phase 1 |
| Q-09 | Thành tựu "Sức mạnh 100" — với power score v2 gần như phải C5 mới đạt. Hạ ngưỡng? | Giữ 100 | Báo cáo Phase 2 |
| Q-10 | Chuyển file bảng cân bằng `Cowdi — v2 Cân bằng hệ tương khắc.xlsx` từ gốc repo vào `docs/04-design/`? | Để nguyên ở gốc | Sắp xếp docs 2026-11-23 |

## 4. Lỗi & rủi ro đã phát hiện
| Mã | Mô tả | Mức | Trạng thái |
|---|---|---|---|
| RK-001 | `server/utils/pet-icon.js` tạo URL ảnh sai (`Cowdi/super.webp`, file thật là `Cowdi_super.webp`) và tra loài theo `activePetId` (`cowdi_1`) → icon push notification có thể 404, luôn là Cowdi | Trung bình | Mở |
| RK-002 | Ảnh Paddy: `pets.js` trỏ `Lua_egg.webp` nhưng file thật `Lua_Egg.webp` → lỗi trên server Linux (phân biệt hoa/thường) | Trung bình | Mở |
| RK-003 | `POST /api/duel` không lưu `questionTimes` → người tạo trận không bao giờ được crit nhanh | Cao (Phase 5) | Mở — sửa ở Phase 5 |
| RK-004 | Nội dung quiz duel (kể cả đáp án) do challenger gửi lên | Trung bình | Chấp nhận, ghi PR (SDD §0.5.6) |
| RK-005 | Điểm kỹ năng pet và `total_xp` do client gửi → có thể gian lận | Trung bình | Phase 4 kẹp không giảm; chuyển server là việc sau |
| RK-006 | `shared/` nằm trong web root khi deploy → tải công khai được (không có bí mật) | Thấp | Tuỳ chọn: thêm `location /shared/ { deny all; }` vào nginx |
| RK-007 | Máy dev chưa có `git` trong PATH, chưa `npm install` → chưa build/commit được | Cao (quy trình) | Mở |

## 5. Nhật ký (mới nhất ở trên)
| Ngày | Việc | Người |
|---|---|---|
| 2026-11-23 | Sắp xếp lại `docs/` theo ISO/IEC/IEEE 15289: đổi tên 43 file theo DOCP v1.1, chuyển `GLOSSARY-VI-EN` vào 00-general, chuyển đặc tả chiến đấu `.docx` vào 04-design, lưu trữ bản v2.0 cũ vào `_archive/obsolete/`, sửa 56 link tương đối hỏng từ trước, viết lại REG-DOCUMENTS, tạo LOG-PROGRESS | Claude Code |
| 2026-11-23 | Phase 2 xong (code): hệ/nhóm/độ hiếm/evolveReq 22 pet lấy từ `PET_BATTLE_DATA`; 10 hệ trên UI; `getEvolutionInfo(stage)` thay `getPetEvolution(XP)` ở 13 file + server; power score v2; bỏ "Cho Pet ăn XP" | Claude Code |
| 2026-11-23 | Phase 1 xong: `shared/game-config.js`, `shared/battle-engine.js`, 39 test (`npm test`), 3 ví dụ SDD §4.4 khớp; `deploy.ps1` copy `shared/` | Claude Code |
| 2026-11-23 | Chốt SDD Kinh tế & Chiến đấu v2.1 với Sonny | Sonny |
