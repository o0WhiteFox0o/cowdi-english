# Ma trận Truy vết Yêu cầu (Requirements Traceability Matrix)

| Req ID | Mô tả | Nguồn (SRS / SDD) | Thiết kế (SDD §) | Mã nguồn | Test Case | Trạng thái |
|---|---|---|---|---|---|---|
| FR-001 | Đăng nhập Google OAuth | SRS §3.1 | SDD-COWDI §2 | `server/routes/auth.js` | TC-001 | Implemented |
| FR-ECO-01 | Ledger 4 loại tài nguyên (`wallet_ledger`), server quản lý | SDD-ECONOMY-BATTLE-v2.1 §2 | SDD-v2.1 §2 | `server/utils/wallet.js`, `server/routes/api.js` | `shared/battle-engine.test.js` | Implemented |
| FR-ECO-02 | Chỉ số chiến đấu pet theo điểm kỹ năng (căn bậc 2), 10 hệ, 7 nhóm | SDD-ECONOMY-BATTLE-v2.1 §4 | SDD-v2.1 §4 | `shared/battle-engine.js`, `src/features/pet/PetPage.jsx` | `shared/battle-engine.test.js` (Leafy C4) | Implemented |
| FR-ECO-03 | Điểm kỹ năng pet: +1/câu đúng, +5 trọn điểm, bỏ +5 cả 4 kỹ năng | SDD-ECONOMY-BATTLE-v2.1 §3 | SDD-v2.1 §3 | `src/hooks/usePet.jsx` | Manual / UI | Implemented |
| FR-ECO-04 | Tiến hoá thủ công qua server API có transaction | SDD-ECONOMY-BATTLE-v2.1 §3 | SDD-v2.1 §3 | `server/routes/api.js`, `src/features/pet/PetPage.jsx` | `shared/battle-engine.test.js` | Implemented |
| FR-ECO-05 | Thưởng Gem & Đá bài mới & hoàn thành unit (D2, D11) | SDD-ECONOMY-BATTLE-v2.1 §2 | SDD-v2.1 §2 | `server/utils/wallet.js`, `server/routes/api.js` | Unit tests | Implemented |
| FR-ECO-06 | Đổi Gem lấy đá 1 lần/tuần (D3) & ghép 10 mảnh đá | SDD-ECONOMY-BATTLE-v2.1 §2 | SDD-v2.1 §2 | `server/utils/wallet.js`, `src/pages/AccountPage.jsx` | Unit tests | Implemented |
| FR-ECO-07 | Engine trận đấu server (hàm thuần, seed, thắng theo % HP) | SDD-ECONOMY-BATTLE-v2.1 §5 | SDD-v2.1 §5 | `shared/battle-engine.js`, `server/routes/api.js`, `src/features/duel/DuelPage.jsx` | `shared/battle-engine.test.js` (12 duel tests) | Implemented |
| FR-ECO-08 | Migration DB an toàn không mất dữ liệu cũ | SDD-ECONOMY-BATTLE-v2.1 §6 | SDD-v2.1 §6 | `server/db/migrate-v2-foundation.sql` | Idempotent SQL | Implemented |