# 🐮 Cowdi English

Nền tảng học tiếng Anh tương tác (PWA) tích hợp hệ thống nuôi Pet tiến hoá 5 cấp, **Kinh tế & Chiến đấu v2**, **Cửa hàng Giữ nhịp**, và **Trình chỉnh động tác & Rig Pet (`/admin/pet-motion`)** dành cho người học Việt Nam.

> **Sản xuất:** `https://cowdi.net` · **Kiến trúc:** React 18 + Vite 5 + Bootstrap 5 + PWA · Express (Node.js ESM) + MySQL/MariaDB · **Chuẩn quản trị:** ISO/IEC/IEEE 12207, 15289, 16326, 828, 29148, 29119.

---

## 1. Bảng điều khiển nhanh cho Quản lý & Đội phát triển

| Bạn cần làm gì? | Mở ngay tài liệu này | Chuẩn IEEE |
|---|---|---|
| **Xem tiến độ tổng thể, rủi ro & quyết định mở** | [LOG-PROGRESS.md](docs/01-project-management/LOG-PROGRESS.md) | IEEE 16326 |
| **Theo dõi từng đầu việc Kinh tế v2 (GĐ0–GĐ9)** | [TASK.md](TASK.md) | IEEE 16326 |
| **Tra cứu toàn bộ tài liệu trong dự án** | [REG-DOCUMENTS.md](docs/00-general/REG-DOCUMENTS.md) | ISO/IEC/IEEE 15289 |
| **Xem thiết kế nguồn sự thật Kinh tế & Chiến đấu v2.1** | [SDD-ECONOMY-BATTLE-v2.1.md](docs/04-design/SDD-ECONOMY-BATTLE-v2.1.md) | IEEE 1016 |
| **Quản trị nhánh Git, PR, versioning, backup** | [SCMP-COWDI-v1.0.md](docs/01-project-management/SCMP-COWDI-v1.0.md) | IEEE 828 |
| **Kiểm soát yêu cầu ↔ code ↔ test** | [RTM-COWDI.md](docs/02-requirements/RTM-COWDI.md) | ISO/IEC/IEEE 29148 |
| **Chiến lược kiểm thử & tiêu chí ra bản (Go/No-Go)** | [STP-COWDI-v1.0.md](docs/06-verification-validation/STP-COWDI-v1.0.md) | ISO/IEC/IEEE 29119 |
| **Hướng dẫn triển khai Production (aaPanel + MySQL)** | [GDE-DEPLOY-PRODUCTION-v1.0.md](docs/07-deployment-operations/GDE-DEPLOY-PRODUCTION-v1.0.md) | ISO/IEC/IEEE 12207 |
| **Hướng dẫn vận hành `/admin/pet-motion`** | [HUONG-DAN-CHINH-DONG-TAC-PET.md](docs/HUONG-DAN-CHINH-DONG-TAC-PET.md) | ISO/IEC/IEEE 26514 |
| **Chuẩn Mỹ thuật & Art Kit toàn dự án (Pet, màu 10 hệ, AI Prompt, QC)** | [STD-ART-STYLE-v1.1.md](docs/05-implementation/art/STD-ART-STYLE-v1.1.md) · [Art Kit](docs/05-implementation/art/README.md) | ISO/IEC/IEEE 12207 |
| **Chuẩn nội dung bài học 3 cấp & chất lượng câu hỏi** | [STD-LESSON-CONTENT-v1.0.md](docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md) · [STD-QUESTION-QUALITY-v1.0.md](docs/05-implementation/content/STD-QUESTION-QUALITY-v1.0.md) · [MAP-CURRENT-UI.md](docs/05-implementation/content/MAP-CURRENT-UI.md) | ISO/IEC/IEEE 12207 |
| **Thiết kế Pet Director V2 & Phân hệ Bạn bè** | [SDD-PET-DIRECTOR-v1.1.md](docs/04-design/SDD-PET-DIRECTOR-v1.1.md) · [SRS-FRIENDS-v1.1.md](docs/04-design/SRS-FRIENDS-v1.1.md) | IEEE 1016 / 29148 |
| **Lấy biểu mẫu chuẩn IEEE (CR, Sprint, RAID, Bug, Release)** | [docs/templates/README.md](docs/templates/README.md) | Bộ chuẩn IEEE |

---

## 2. Ảnh chụp trạng thái sản phẩm (2026-11-26 · v2.1)

| Hạng mục | Thực tế hiện tại |
|---|---|
| **Nội dung & Chất lượng câu hỏi** | **221 bài học** · **54 unit** lộ trình 3 nhóm (`shared/lesson-ids.json`, `shared/units.json`, **54/54 bài chuẩn v2 đạt 0 lỗi · 0 cảnh báo**: 12 Starter S1–S3 có `category` & ô màu `swatch`, **39/39 trọn bộ Intermediate `int-u1..u10`**, 3 IELTS Reading v2) · **2.829 câu hỏi: 0 lỗi cứng** (validator 14 mã `shared/question-rules.js` chặn build) · SRS SM-2 · 7 mini-game |
| **Hệ thống Pet & Pet Director V2** | **23 loài pet × 5 cấp (`115` pet-cấp)** · 10 hệ tương khắc · 7 nhóm kỹ năng · 5 độ hiếm · 34 động tác `PetRig` · **Pet Director V2** (`<PetStage>` đồng hành 2 cột Desktop, `<PathPet>` trên Lộ trình, 240+ câu thoại, đã gỡ hoàn toàn `CowdiChat`) |
| **Kinh tế & Chiến đấu v2** | **Hoàn thành GĐ0–GĐ4** (đã merge `main`): Ledger 4 loại (`milk`, `gem`, `stone`, `stone_shard`), bỏ Coins (`×3` Sữa), Battle Engine server-side có seed, Cửa hàng Giữ nhịp, Streak v2 theo múi giờ, **Đồ trang trí 6 bậc** (19 nền, 15 hào quang, 10 nền hệ, combo -20%) |
| **Bạn bè & Thưởng mời bạn** | **Hoàn thành 100%** (đã merge `main`): OG `/i/:code`, QR client + máy quét QR trong App, kết bạn theo mã 8 ký tự / email, chống gian lận IP/thiết bị, thưởng +3 Gem / +500 Sữa / mốc vé gacha, thăm pet, thách đấu bạn bè 0 LP, bạn bè trên bản đồ lộ trình |
| **Chỉnh động tác & Rig Pet** | **Hoàn thành 100%** (`/admin/pet-motion`): Kho 23×5, Quản lý Pet `pet_catalog`, Bàn chỉnh keyframe 15 kênh, Trình vẽ PNG Studio đa Layer, Tab **Xem trước khi học (5.8)** có công tắc preview `🎬 Director` |
| **Kiến trúc Backend** | 9 nhóm router Express (`auth`, `api`, `shop`, `invites`, `inviteLanding`, `friends`, `admin`, `petMotionAdmin`, `petMotionPublic`) · migration idempotent tương thích MySQL 5.5/5.6+ |
| **Chất lượng & Kiểm thử** | **188/188 test tự động đạt** (`npm test`: `shared/`, `server/tests/`, `src/pet-rig/`, `src/pet-director/`) · `npm run build` (`validate:lessons` + `validate:questions` 0 lỗi) & `deploy.zip` (39.42 MB) xanh |
| **Giai đoạn kế tiếp** | Deploy gói `deploy.zip` mới lên Production · Chốt `DEC-02` → mở nhánh **GĐ5 — Đấu trường (`feat/arena`)** |

---

## 3. Kiến trúc tổng quan

```text
cowdi-english/
├── src/                      # React 18 SPA + PWA (features/, pet-rig/, pet-director/, admin/pet-motion/)
├── server/                   # Express API (Node ESM), MySQL pool, RBAC admin, jobs, storage/
│   ├── routes/               # auth, api, shop, invites, inviteLanding, friends, admin, petMotion*
│   ├── utils/                # wallet (ledger), streak-manager, cosmetics, friends, petMotion
│   └── db/                   # schema.sql + các file migration idempotent (tương thích MySQL 5.5/5.6+)
├── shared/                   # Nguồn sự thật dùng chung Frontend + Backend + Simulation
│   ├── game-config.js        # Hằng số cân bằng, kinh tế, 23 pet, 10 hệ, 7 nhóm
│   ├── battle-engine.js      # Engine tính trận thuần tuý (deterministic RNG seed)
│   ├── pet-motion.js         # 34 clip động tác gốc
│   ├── question-rules.js     # Validator 14 mã chất lượng câu hỏi (STD-QUESTION-QUALITY v1.0)
│   └── lesson-ids.json       # Danh sách 221 bài & 54 unit (tự sinh khi build)
├── scripts/                  # Build helpers, migration runners, balance simulator
├── docs/                     # Kho tài liệu chuẩn IEEE (00 → 09, templates/, _archive/)
├── TASK.md                   # Checklist triển khai chi tiết Kinh tế v2 (GĐ0 → GĐ9)
└── deploy.ps1                # Script đóng gói deploy.zip cho aaPanel
```

---

## 4. Cài đặt & chạy nhanh (Local Development)

### Yêu cầu môi trường
- **Node.js** `>= 18` (khuyến nghị Node 20/22 LTS)
- **MySQL / MariaDB** (XAMPP hoặc MySQL 5.6–8.0)

### 4.1. Khởi tạo lần đầu
```bash
# 1. Cài đặt dependencies
npm install
cd server && npm install && cd ..

# 2. Tạo file cấu hình backend (điền thông số DB, Google OAuth, JWT_SECRET)
cp server/.env.example server/.env
# Lưu ý local dev: đặt FRONTEND_URL=http://localhost:5173
# (Tuỳ chọn test nhanh không cần Google OAuth: thêm ENABLE_DEV_LOGIN=true — KHÔNG bật trên production)

# 3. Khởi tạo DB & chạy các migration nền tảng
# Import server/db/schema.sql + các file migrate-*.sql vào database cowdi_english, sau đó chạy:
cd server
node ../scripts/run-v2-migration.js
node ../scripts/run-v2-streak-migration.js
node scripts/seed-pet-rigs.mjs
```

### 4.2. Chạy hàng ngày
```bash
# Terminal 1 — Backend API (http://localhost:3001)
cd server && npm start

# Terminal 2 — Frontend Vite (http://localhost:5173)
npm run dev
```

*(Khi bật `ENABLE_DEV_LOGIN=true` ở localhost: vào nhanh Admin bằng `http://localhost:3001/auth/dev-login?role=admin`, Học viên bằng `?role=user`.)*

---

## 5. Lệnh thường dùng

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Chạy frontend dev server tại `http://localhost:5173` |
| `npm test` | Chạy toàn bộ **188 test tự động** (`shared/`, `server/tests/`, `src/pet-rig/`, `src/pet-director/`) |
| `npm run validate:lessons` | Kiểm tra chuẩn nội dung toàn bộ 221 bài học theo `schema.js` |
| `npm run validate:questions` | Rà soát toàn bộ 2.829 câu hỏi theo 14 mã `STD-QUESTION-QUALITY v1.0` (chặn lỗi cứng) |
| `npm run build` | Chạy `prebuild` (`lesson-ids.json` + `validate:lessons` + `validate:questions`) + build `dist/` |
| `npm run build:prod` | Build production + PWA Service Worker ra `dist-prod/` |
| `node scripts/simulate-balance.js` | Chạy mô phỏng cân bằng 6 kịch bản Chiến đấu v2 |
| `cd server && node scripts/seed-pet-rigs.mjs` | Nạp 10 rig mẫu (`radish`, `bamboo_spirit`) vào trạng thái nháp |

---

## 6. Quy trình làm việc chuẩn (Governance & AI-Assisted Workflow)

1. **Đầu phiên làm việc**: đọc [LOG-PROGRESS.md](docs/01-project-management/LOG-PROGRESS.md) → [TASK.md](TASK.md) → thiết kế SDD của hạng mục sắp làm.
2. **Quản lý nhánh & thay đổi**: tuân thủ [SCMP-COWDI-v1.0.md](docs/01-project-management/SCMP-COWDI-v1.0.md) (nhánh `feat/*` hoặc `fix/*`, Conventional Commits, không push trực tiếp thay đổi chưa qua kiểm thử lên `main`).
3. **Thay đổi phạm vi / cân bằng / kiến trúc**: ghi quyết định vào `TASK.md` (hoặc tạo phiếu [CR](docs/templates/CHANGE-REQUEST-TEMPLATE.md) / [ADR](docs/templates/ADR-TEMPLATE.md)), cập nhật [RTM-COWDI.md](docs/02-requirements/RTM-COWDI.md).
4. **Trước khi hoàn thành (Definition of Done)**: viết/cập nhật test → `npm test` xanh 100% → `npm run build` xanh → cập nhật `TASK.md` + `LOG-PROGRESS.md` cùng commit.
5. **Phát hành Production**: thực hiện đủ [GDE-DEPLOY-PRODUCTION-v1.0.md](docs/07-deployment-operations/GDE-DEPLOY-PRODUCTION-v1.0.md) và lập phiếu [Deployment Checklist](docs/templates/DEPLOYMENT-CHECKLIST-TEMPLATE.md) + [Release Notes](docs/templates/RELEASE-NOTES-TEMPLATE.md).

---

> Xây dựng & vận hành bởi **Hong Son Studio Team** · Mọi tài liệu trong `docs/` tuân thủ [DOCP-COWDI-v1.1.md](docs/00-general/DOCP-COWDI-v1.1.md).
