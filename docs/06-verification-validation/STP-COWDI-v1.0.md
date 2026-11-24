# STP-COWDI — Kế hoạch Kiểm thử Tổng thể (Software Test Plan)

> **Chuẩn tham chiếu:** ISO/IEC/IEEE 29119-3:2021 (Test Documentation) & IEEE 1012 (V&V) · **Phiên bản:** 1.0 · **Trạng thái:** Approved · **Ngày phê duyệt:** 2026-11-24

## Lịch sử sửa đổi
| Phiên bản | Ngày | Nội dung | Người thực hiện |
|---|---|---|---|
| 0.1 | 2026-11-23 | Khung nháp rỗng | Claude Code |
| 1.0 | 2026-11-24 | Hoàn thiện chiến lược kiểm thử 4 tầng, danh mục 83 test tự động, tiêu chí Go/No-Go, bảng SLA phân loại lỗi | Production Director / PM |

---

## 1. Mục tiêu & Phạm vi kiểm thử

Đảm bảo mọi phiên bản phát hành của **Cowdi English** đạt độ ổn định cao về **kinh tế học tập (không thất thoát/nhân đôi tài nguyên)**, **cân bằng chiến đấu**, **bảo mật phân quyền quản trị**, **hiển thị động tác PetRig**, và **tương thích môi trường MySQL 5.5/5.6+ trên aaPanel**.

---

## 2. Chiến lược kiểm thử 4 tầng

| Tầng | Mục tiêu | Công cụ / Lệnh chạy | Khi nào chạy |
|---|---|---|---|
| **Tầng 1 — Unit & Logic Tests** | Công thức chỉ số pet, 10 hệ, Battle Engine RNG seed, luật Streak/Shop, fallback `PetRig` | `npm test` (`node:test`) | Sau mọi thay đổi logic & trước khi commit |
| **Tầng 2 — API & Security Tests** | Phân quyền admin (401/403, chống giả mạo JWT), upload magic bytes/2 MB, duyệt xuất bản rig/clip | `npm test` (`server/tests/*.test.mjs`) | Trước khi commit & trước khi gộp nhánh |
| **Tầng 3 — Balance Simulation** | Kiểm tra cân bằng 23 pet × 5 cấp qua 6 kịch bản ma trận (độ lệch tỉ lệ thắng trong ngưỡng thiết kế) | `node scripts/simulate-balance.js` | Mỗi khi chỉnh hằng số trong `shared/game-config.js` |
| **Tầng 4 — Build, Migration & Smoke UAT** | Build SPA+PWA (`dist-prod/`), chạy migration idempotent 2 lần liên tiếp, kiểm tra thực tế trên trình duyệt & tab **Xem trước khi học (5.8)** | `npm run build:prod`, local/prod smoke checklist | Trước & ngay sau mỗi lần phát hành Production |

---

## 3. Danh mục Bộ Test Tự động Hiện hành (`npm test` — 83 tests)

Lệnh chạy chuẩn cross-platform:
```bash
npm test
# Thực thi: node --test "shared/*.test.js" "server/tests/*.test.mjs" "src/pet-rig/*.test.mjs"
```

| File test | Phân hệ | Trọng tâm kiểm chứng |
|---|---|---|
| `shared/battle-engine.test.js` | Kinh tế & Chiến đấu v2 (GĐ1–2) | Chỉ số Leafy C4 / Cowdi C1 / Storm C5, tiến hoá C1→C5, vòng khắc 10 hệ, né/crit tương đối, kỹ năng 7 nhóm, replay RNG seed, 3 kịch bản biên |
| `shared/pets-data.test.js` | Danh mục 23 pet | Toàn vẹn `PET_BATTLE_DATA`, nhóm, hệ, độ hiếm, ngưỡng kỹ năng tiến hoá |
| `shared/wallet-coins-migration.test.js` | Di trú Coins → Sữa (D12) | Chuyển đổi 1 coin = 3 Sữa, quy đổi thưởng nhiệm vụ ngày/tuần, không cộng âm |
| `shared/streak-shop.test.js` | Cửa hàng Giữ nhịp & Streak v2 (GĐ3) | Khăn giữ lửa (tự dùng, giới hạn 2/tuần, mốc 7/30/100), Vé quay lại, Khế ước 7 ngày (300/700/1500 hoàn ×1.5), Đồng hồ Cowdi (+10%) |
| `server/tests/pet-motion-step1.test.mjs` | Admin RBAC & DB Migration | Chặn 401/403 (kể cả JWT giả `is_admin=1`), seed 10 rig mẫu idempotent, ma trận 23×5, hợp lệ SQL 4 bảng |
| `server/tests/pet-motion-step2.test.mjs` | Admin API & Quy tắc xuất bản | Magic bytes PNG/WebP, chặn file > 2 MB (413) & `.exe` đổi đuôi (400), chặn ảnh nháp, ưu tiên riêng > chung > gốc, emoji tự thiết kế |
| `src/pet-rig/pet-rig.test.mjs` | Runtime người học & Mục 5.8 | Quy tắc fallback clip mục 4, cache `fetchPetMotion`, tỉ lệ hiển thị trứng C1, **test nghiệm thu Bamboo C3** (`idle` + `cheer_small` duyệt → sai báo `encourage chưa duyệt` & giữ `idle`), `timeScale ×10` |

---

## 4. Tiêu chí Ra bản (Exit Criteria / Go–No-Go Gate)

Một bản phát hành chỉ được gắn nhãn **GO (Đạt chuẩn phát hành Production)** khi thoả mãn **100%** các tiêu chí sau:

- [ ] `npm test` đạt **100% PASS** (0 fail, 0 skipped bất thường).
- [ ] `npm run build` và `npm run build:prod` hoàn tất không lỗi.
- [ ] **0 lỗi P0 (Blocker)** và **0 lỗi P1 (Critical)** đang mở.
- [ ] Đã kiểm thử bằng **tài khoản mới tinh (0 bài học)** và **tài khoản cũ có dữ liệu** ở môi trường local (không lỗi console, HUD hiển thị đúng Sữa/Gem).
- [ ] Mọi migration mới đã kiểm tra chạy **2 lần liên tiếp (idempotent)** và tuân thủ chuẩn MySQL 5.5/5.6+ trong [SCMP-COWDI-v1.0](../01-project-management/SCMP-COWDI-v1.0.md).
- [ ] Đã kiểm tra gói `deploy.zip` không chứa `server/.env` và `server/storage/`.

---

## 5. Phân loại Mức độ Lỗi & Cam kết Xử lý (Defect Severity SLA)

| Mức độ | Định nghĩa | Ví dụ | Thời gian xử lý mục tiêu |
|---|---|---|---|
| **P0 — Blocker** | Sập toàn trang, không đăng nhập được, mất/sai lệch dữ liệu ví, lỗi migration production | Crash `<BookShell>` cho user mới (`f8baa29`), lỗi 500 `/api/progress` | **Ngay lập tức (< 4 giờ)**, dừng phát hành nếu ở staging |
| **P1 — Critical** | Hỏng một tính năng chính (không mua được đồ shop, không tiến hoá được, lộ bản nháp pet) | Lỗi transaction ví, lỗi phân quyền admin | **Trong 24 giờ** |
| **P2 — Major** | Chức năng chạy được nhưng sai lệch hiển thị/UX rõ rệt, có cách đi vòng | Ảnh pet 404 do hoa/thường (`RK-002`), dropdown bị cắt chữ | **Trong Sprint / GĐ hiện tại** |
| **P3 — Minor** | Lỗi chính tả, căn lề nhỏ, cảnh báo không ảnh hưởng người dùng | React Router v7 future warning | **Đưa vào backlog dọn dẹp** |

Báo cáo lỗi mới sử dụng mẫu [BUG-REPORT-TEMPLATE.md](../templates/BUG-REPORT-TEMPLATE.md) và ghi lỗi tồn đọng vào [LOG-PROGRESS §4](../01-project-management/LOG-PROGRESS.md).
