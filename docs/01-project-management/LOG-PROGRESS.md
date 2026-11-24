# LOG-PROGRESS — Bảng điều khiển Tiến trình Dự án Cowdi English

> **Loại tài liệu:** Tài liệu sống (Living Document) · **Chuẩn tham chiếu:** IEEE 16326:2019 (Project Status Reporting) · **Quy ước:** [DOCP-COWDI-v1.1](../00-general/DOCP-COWDI-v1.1.md)
> **Cập nhật lần cuối:** 2026-11-24 · **Phiên bản đang chạy Production:** `v2.1` (`main` @ `e3f3c36`) · **Người phụ trách:** Product Owner (Sonny) & Đội phát triển

---

## Cách dùng & quy ước cập nhật (cho Giám đốc sản xuất / PM / Dev / AI)

1. **Mục đích phân tách vai trò**:
   - File này (**`LOG-PROGRESS.md`**) là **bảng điều khiển cấp quản lý (Executive Dashboard)** cho **toàn bộ dự án** (Kinh tế v2, Pet Motion, Hạ tầng/Deploy, QA/IEEE).
   - File [**`TASK.md`**](../../TASK.md) là **checklist cấp triển khai chi tiết** riêng cho lộ trình Kinh tế v2 (GĐ0–GĐ9).
2. **Khi kết thúc một phiên / milestone / bản phát hành**:
   - Cập nhật trạng thái ở §1 và §2.
   - Đóng các quyết định đã chốt ở §3, cập nhật sổ rủi ro ở §4.
   - Thêm **1 dòng lên đầu bảng** §5 Nhật ký phát hành & hoạt động.
3. **Ký hiệu trạng thái**: ✅ Hoàn thành & đã gộp `main` · 🚀 Đã deploy Production · 🟡 Đang triển khai · ⏳ Chưa bắt đầu · ⛔ Bị chặn (cần chốt quyết định).

---

## 1. Bức tranh tổng thể các mảng công việc (Workstreams)

| # | Mảng công việc | Tài liệu gốc | Trạng thái | Tiến độ | Mốc kế tiếp |
|---|---|---|---|---|---|
| WS-1 | **Kinh tế & Chiến đấu v2** (GĐ0 → GĐ9) | [TASK.md](../../TASK.md) · [SDD-v2.1](../04-design/SDD-ECONOMY-BATTLE-v2.1.md) | 🟡 GĐ3/9 xong | **40% (GĐ0–3 🚀)** | Chốt giá đồ Thường/Hiếm → mở nhánh `feat/cosmetics` (GĐ4) |
| WS-2 | **Hệ thống Chỉnh động tác & Rig Pet** (`/admin/pet-motion`) | [PET-MOTION](../PET-MOTION.md) · [Hướng dẫn](../HUONG-DAN-CHINH-DONG-TAC-PET.md) | 🚀 Hoàn thành | **100%** | Duyệt dần rig & động tác cho 23 loài pet trên production |
| WS-3 | **Hạ tầng, MySQL 5.6 & Deploy Production** | [GDE-DEPLOY-PRODUCTION v1.0](../07-deployment-operations/GDE-DEPLOY-PRODUCTION-v1.0.md) | 🚀 Ổn định | **100%** | Thiết lập lịch backup tự động `server/storage/` + DB |
| WS-4 | **Chuẩn hoá Quản trị Dự án & Tài liệu IEEE** | [DOCP v1.1](../00-general/DOCP-COWDI-v1.1.md) · [SCMP v1.0](SCMP-COWDI-v1.0.md) · [STP v1.0](../06-verification-validation/STP-COWDI-v1.0.md) | ✅ Hoàn thành | **100%** | Duy trì cập nhật RTM, CR, Release Notes cho từng GĐ |
| WS-5 | **Lộ trình 3 Nhóm & Chuẩn hoá Nội dung v2** | [SPMP v1.0](SPMP-UPGRADE-CONTENT-LEARNING-GROUPS-v1.0.md) · [SRS 3 Cấp](../02-requirements/SRS-LESSON-3-LEVELS-v1.0.md) · [SDD 3 Nhóm v2.0](../04-design/SDD-LEARNING-GROUPS-v2.0.md) · [STD v1.0](../05-implementation/content/STD-LESSON-CONTENT-v1.0.md) | 🟡 Chốt thiết kế & plan | **Thiết kế 100%** | Bước 0 (vá `reading.js` + 2 lỗi cũ) → GĐ A–E trên nhánh `feat/learning-groups` |

### Chỉ số sức khoẻ kỹ thuật hiện tại (2026-11-24)
- **Automated Tests (`npm test`)**: **91 / 91 PASS** (12 suites + top-level tests: Kinh tế v2, Battle Engine, Streak/Shop v2, Wallet/Coins migration, Lesson Schema v2, Pet Motion API & RBAC, PetRig Runtime & Study Preview 5.8).
- **Build Production (`npm run build:prod`)**: PASS · PWA precache `293 entries` · gói `deploy.zip` (`39 MB`, không chứa `.env` & `storage/`).
- **Nội dung & Dữ liệu**: `206` bài học hiện có (kiểm tra validator: `2` lỗi dữ liệu cũ, `3817` cảnh báo chuẩn v2) + `3` bài mẫu golden v2 (`s1-pets`, `greetings`, `ielts-read-rooftop-farms`) · `44` unit · `23` loài pet × `5` cấp (`115` pet-cấp) · `34` clip động tác.

---

## 2. Lộ trình Kinh tế & Chiến đấu v2 (đồng bộ với `TASK.md`)

| GĐ | Hạng mục | Nhánh Git | Trạng thái | Ngày xong | Bằng chứng / Ghi chú |
|---|---|---|---|---|---|
| GĐ0 | Chuẩn bị tài liệu, quy trình & chốt D1–D11 | `main` | ✅ | 2026-11-23 | `afc4f52`, `e15401f` |
| GĐ1 | Nền tảng v2 (Ledger 4 loại, Battle Engine seed, Tiến hoá API, UI Pet/Account/Dex) | `feat/economy-battle-v2` → `main` | 🚀 | 2026-11-23 | `327d136`, gộp `e432864` |
| GĐ2 | Mô phỏng cân bằng (6 kịch bản, 6 CSV, `BALANCE-REPORT-v2.md`, 3 test biên) | `feat/balance-sim-v2` → `main` | 🚀 | 2026-11-23 | `457b570`, gộp `e432864` |
| GĐ3 | Cửa hàng Giữ nhịp, bỏ Coins (`×3` Sữa, D12), Streak server-side (D13), UI Shop 3 tab | `feat/shop-streak` → `main` | 🚀 | 2026-11-23 | `16bab9b`, gộp `e432864`, sửa crash ví `f8baa29`, deploy `2026-11-24` |
| **GĐ4** | **Đồ trang trí** (`owned_cosmetics`, 6 bậc, mốc học tự cấp, khung avatar, danh hiệu) | `feat/cosmetics` | ⛔ Chờ chốt | — | Cần PO chốt `DEC-01` (giá đồ Thường/Hiếm) |
| GĐ5 | Đấu trường (vé gắn học D4, LP 6 bậc, mùa 4 tuần, rương tuần, chống lạm dụng) | `feat/arena` | ⏳ | — | Chờ chốt `DEC-02` |
| GĐ6 | Lõi Gacha + Thiệp mời người mới + Quay pet khởi đầu (D7) | `feat/gacha-core-invite` | ⏳ | — | Phụ thuộc GĐ4/GĐ5 |
| GĐ7 | Gacha đầy đủ (50 Gem/vé D5, banner 3 tuần, Thẻ tặng pet D6, Bụi sao) | `feat/gacha-full` | ⏳ | — | Chờ chốt `DEC-03`, `DEC-04`, `DEC-05` |
| GĐ8 | Thanh toán (Thẻ tháng Sữa ×1.5, Thẻ mùa 30 tầng, gói Gem, giới hạn chi tiêu) | `feat/payments` | ⏳ | — | Chờ chốt `DEC-06` |
| GĐ9 | Theo dõi chỉ số & tinh chỉnh cân bằng vận hành | `main` | ⏳ | Liên tục | Chờ dữ liệu học thực tế (`DEC-07`) |

---

## 3. Quyết định chờ Product Owner chốt (Open Decisions)

> Các quyết định cũ (`Q-01` đến `Q-07`) đã được chốt thành `D1–D13` trong [TASK.md](../../TASK.md) và đã cài đặt trong mã nguồn. Danh sách dưới đây chỉ giữ các mục **còn mở thực sự**:

| Mã | GĐ bị chặn | Câu hỏi cần chốt | Đề xuất của PM / Mặc định tạm | Trạng thái |
|---|---|---|---|---|
| **DEC-01** | **GĐ4 (Kế tiếp)** | Đồ trang trí bậc Thường / Hiếm bán bằng **Sữa** hay **Gem**? | Thường = Sữa (tạo đầu ra Sữa); Hiếm trở lên = Gem | 🔴 Cần chốt sớm |
| DEC-02 | GĐ5 | Câu đúng Đấu trường có cộng điểm kỹ năng? Đối thủ AI có tính LP? Ngưỡng LP từng bậc? | Không cộng kỹ năng trực tiếp; AI không tăng LP ở bậc cao | 🟡 Chờ trước GĐ5 |
| DEC-03 | GĐ7 | Tỉ lệ pet giới hạn trên banner: **3%** hay **5%**? | 3% (khớp `D5`: 67/22/8/3) | 🟡 Chờ trước GĐ7 |
| DEC-04 | GĐ7 | Hồ sơ Pet giới hạn đầu tiên (tên, hệ, nhóm, 8 mức kỹ năng, 5 ảnh) | Chuẩn bị cùng đội họa sĩ từ GĐ5 | 🟡 Chờ trước GĐ7 |
| DEC-05 | GĐ7 | Cách người chơi cũ lấy lại pet giới hạn mùa cũ (rerun hay cửa hàng Bụi sao)? | Rerun theo mùa + đổi Bụi sao giá cao | 🟡 Chờ trước GĐ7 |
| DEC-06 | GĐ8 | Thiết kế chi tiết Thẻ mùa 30 tầng, Thẻ tháng, gói Gem & trần chi tiêu học sinh nhỏ tuổi | Soạn SDD Thanh toán riêng trước GĐ8 | 🟡 Chờ trước GĐ8 |
| DEC-07 | GĐ9 | Thời gian học trung bình mỗi bài thực tế (để cân giá vé Gacha) | Đo từ dữ liệu thật 2 tuần sau GĐ3 | 🟡 Theo dõi |
| DEC-08 | Chung | Thành tựu "Sức mạnh 100" với công thức power score v2 rất khó đạt (gần C5) — có hạ ngưỡng không? | Đề xuất điều chỉnh ngưỡng phù hợp C3–C4 | 🟢 Tuỳ chọn |

---

## 4. Sổ đăng ký Rủi ro & Lỗi tồn đọng (Risk & Issue Register — IEEE 16326)

| Mã | Loại | Mô tả | Mức độ | Biện pháp xử lý / Giảm thiểu | Trạng thái |
|---|---|---|---|---|---|
| RK-001 | Lỗi | `server/utils/pet-icon.js` tạo sai tên file (`Cowdi/super.webp` thay vì `Cowdi_super.webp`) và tra theo `activePetId` → icon push notification dễ 404 | Trung bình | Chuẩn hoá hàm tra ảnh dùng chung với `PET_REGISTRY` | 🟡 Mở |
| RK-002 | Lỗi | `src/data/pets.js` kiểm tra hoa/thường tên ảnh trên Linux (vd `Lua_egg.webp` vs `Lua_Egg.webp`) | Trung bình | Rà soát toàn bộ 115 đường dẫn ảnh pet khớp chữ hoa/thường trên Linux | 🟡 Mở |
| RK-003 | Rủi ro | `POST /api/duel` và nội dung quiz duel vẫn nhận từ client challenger | Trung bình | Chấp nhận tạm ở GĐ1–3; chuyển tạo đề duel hoàn toàn phía server ở GĐ5 | 🟡 Theo dõi (GĐ5) |
| RK-004 | Rủi ro | Điểm kỹ năng pet và `total_xp` do client đồng bộ lên `PUT /api/progress` | Trung bình | Đã khoá `evolution` & `wallet_ledger` trên server; sẽ chấm điểm hoàn toàn phía server ở giai đoạn sau | 🟡 Theo dõi |
| RK-005 | Vận hành | **MySQL Production phiên bản cũ (< 5.6.5)**: không hỗ trợ cột `JSON`, hàm `JSON_EXTRACT`, và tối đa 1 cột `TIMESTAMP` có `CURRENT_TIMESTAMP` | **Cao** | **Quy chuẩn bắt buộc trong [SCMP v1.0](SCMP-COWDI-v1.0.md)**: mọi migration mới chỉ dùng `LONGTEXT`, tối đa 1 `TIMESTAMP` auto, không dùng `USE <db>;`, parse JSON bằng Node | ✅ Đã kiểm soát (`a8c9860`, `d57f593`, `e3f3c36`) |
| RK-006 | Vận hành | Thư mục ảnh upload của admin (`server/storage/pets/`) nằm trên đĩa server, không nằm trong Git | **Cao** | Đã loại trừ khỏi `deploy.zip` để tránh ghi đè; **cần bật cron sao lưu định kỳ hàng ngày** trên aaPanel cùng DB | 🟡 Cần cấu hình cron |
| RK-007 | Lỗi | `PUT /api/progress` trả `{ grantedGem: 0, grantedStone: 0 }` thay vì ví chuẩn khi user mới chưa xong bài nào → crash `<BookShell>` | **Nghiêm trọng (P0)** | Đã sửa triệt để cả backend & frontend (`wallet.js`, `api.js`, `useUser.jsx`, `BookShell.jsx`) | ✅ Đã đóng (`f8baa29`, 2026-11-24) |
| RK-008 | Hạ tầng | `deploy.ps1` chưa copy thư mục `scripts/` (`run-v2-*.js`, `scripts/package.json`) | Thấp | Cần bổ sung copy `scripts/` vào `deploy.ps1` để lần đóng gói trên Windows đồng bộ với Mac | 🟡 Mở |
| RK-009 | Lỗi | Flashcard trong `LessonDetailPage.jsx` gọi `translateEnToVi(example)` chưa định nghĩa/import → lật thẻ ném lỗi, không hiện dịch | Trung bình | Xoá lời gọi `translateEnToVi`, dùng `exampleVi` (việc `U1` trong [MAP-CURRENT-UI](../05-implementation/content/MAP-CURRENT-UI.md)) | 🟡 Mở |
| RK-010 | Dữ liệu | 2 bài cũ lỗi cấu trúc validator bắt được: `ielts-pre-grammar` trùng từ `"Whose"`, `ielts-pre-writing` `quiz[4]` trùng lựa chọn `"paragraph"` | Thấp | Sửa 2 lỗi này ở Bước 0 trước khi gắn `validate-lessons.mjs` vào `prebuild` | 🟡 Mở |
| RK-011 | Lỗi | `buildPassage()` trong `src/data/lessons/reading.js` không spread `...r` nên xoá sạch `paragraphs`, `glossary`, `paraphrasePairs`, `examQuestions`, `timeLimitMin` của bài v2 | **Cao (P0 với v2)** | Vá ngay ở Bước 0 (`return { ...r, ... }`) kèm unit test hồi quy | 🟡 Mở |

---

## 5. Nhật ký hoạt động & mốc phát hành (mới nhất ở trên)

| Ngày | Mảng | Nội dung chính | Commit / Tag | Người thực hiện |
|---|---|---|---|---|
| **2026-11-24** | Lộ trình 3 Nhóm & Nội dung v2 | Bổ sung `SRS-LESSON-3-LEVELS-v1.0.md`, `SDD-LEARNING-GROUPS-v2.0.md`, lập Kế hoạch hợp nhất `SPMP-UPGRADE-CONTENT-LEARNING-GROUPS-v1.0.md`; PO chốt tái cấu trúc lộ trình 3 nhóm kèm migration + bài Starter tính mốc Gem/Đá như bài thường; cập nhật `REG-DOCUMENTS` & các mục lục `docs/` | — | Sonny + AI |
| **2026-11-24** | Nội dung v2 | Tích hợp Bộ chuẩn nội dung bài học v1.0 (`STD-LESSON-CONTENT-v1.0`, `MAP-CURRENT-UI`, `TPL-*`, `CHK-LESSON-REVIEW`, `PROMPT-GEMINI-CONTENT`, brief `int-u1`, `schema.js`, 3 bài `_golden`, validator + compat script, 8 test → 91/91 PASS, báo cáo kiểm tra 206 bài `RPT-LESSON-CONTENT-2026-11-24.md`) | — | Sonny + AI |
| **2026-11-24** | Governance / IEEE | Chuẩn hoá toàn diện tài liệu quản trị theo IEEE: tạo `README.md` gốc, cập nhật `LOG-PROGRESS.md`, nâng cấp `SCMP v1.0`, `RTM`, `STP v1.0`, viết Sổ tay Deploy Production + Release Notes `v2.1`, bổ sung 5 biểu mẫu PM/QA | — | Production Director / PM (AI) |
| **2026-11-24** | Deploy / Ops | Đóng gói `deploy.zip` (`39 MB`), chạy thành công migration Kinh tế v2 + GĐ3 trên Production (`cowdi.net`); sửa lỗi MySQL < 5.6.5 (`created_at DATETIME`) & thêm `scripts/package.json` | `e3f3c36` | Sonny + AI |
| **2026-11-24** | Pet Motion | Bổ sung hộp gợi ý kích thước ảnh chuẩn theo thiết kế (C1–C3 `512×512`, C4–C5 `640×640`) và công cụ nén WebP nền trong suốt ngay trên trình duyệt | `a6e87a7` | Sonny + AI |
| **2026-11-24** | Kinh tế v2 (Fix P0) | Sửa lỗi crash trắng trang `<BookShell>` với tài khoản mới (`PUT /api/progress` luôn trả ví chuẩn `{ milk, gem, stone, stone_shard }`) | `f8baa29` | Sonny + AI |
| **2026-11-24** | Tích hợp & DB | Gộp sạch 3 nhánh Kinh tế v2 GĐ1–3 của Trọng Phúc (`feat/shop-streak`) vào `main`; sửa tương thích MySQL 5.6 cho migration & glob `npm test` (83/83 test xanh) | `e432864`, `d57f593`, `ea9903b` | Sonny + Trọng Phúc + AI |
| **2026-11-24** | Pet Motion (5.8) | Bổ sung tab **Xem trước khi học** (`/admin/pet-motion?view=preview`, chỉ đọc, dùng chung `PetRig` thật: Ở nhà, Bài học 8 câu + mic + đọc mẫu, Trận đấu, Gắn bó 0–1500, Nhật ký sự kiện đỏ) | `4d3dfc1` | Sonny + AI |
| **2026-11-24** | Pet Motion | Hoàn thiện & push toàn bộ hệ thống Chỉnh động tác & Rig Pet (`/admin/pet-motion`, Studio vẽ PNG đa Layer, sắp lớp `z`, `<PetAvatar>` trên 6 trang người học, sửa MySQL 5.6 `LONGTEXT`) | `d02a77c`, `a8c9860` | Sonny + AI |
| **2026-11-23** | Kinh tế v2 (GĐ1–3) | Hoàn thành GĐ1 (Nền tảng v2), GĐ2 (Mô phỏng cân bằng 6 CSV + báo cáo), GĐ3 (Bỏ Coins D12, Cửa hàng Giữ nhịp 3 tab, Streak server-side D13, icon chiến đấu) | `327d136` → `16bab9b` | Trần Trọng Phúc |
| **2026-11-23** | Governance / IEEE | Tái cấu trúc `docs/` theo ISO/IEC/IEEE 15289 (đổi tên 43 file theo DOCP v1.1, lập `REG-DOCUMENTS.md`, chốt `SDD-ECONOMY-BATTLE-v2.1.md`) | `afc4f52` | Sonny + Claude Code |
