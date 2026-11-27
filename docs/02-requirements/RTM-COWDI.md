# RTM-COWDI — Ma trận Truy vết Yêu cầu (Requirements Traceability Matrix)

> **Loại tài liệu:** Tài liệu sống · **Chuẩn tham chiếu:** ISO/IEC/IEEE 29148:2018 · **Cập nhật lần cuối:** 2026-11-27
> Mục đích: Đảm bảo mọi yêu cầu nghiệp vụ & phi chức năng đều truy vết xuyên suốt **Yêu cầu → Thiết kế → Mã nguồn → Kiểm thử → Trạng thái triển khai**.

---

## 1. Phân hệ Cốt lõi & Học tập (Core Learning)

| Req ID | Mô tả yêu cầu | Nguồn (SRS / SDD) | Mã nguồn chính | Kiểm thử / Nghiệm thu | Trạng thái |
|---|---|---|---|---|---|
| `FR-CORE-01` | Đăng nhập Google OAuth2 + phiên JWT (kèm dev-login khoá localhost) | SRS §3.1 | `server/routes/auth.js`, `src/hooks/useAuth.jsx` | Manual + `pet-motion-step1.test.mjs` | 🚀 Production |
| `FR-CORE-02` | Đồng bộ tiến độ học 221 bài / 54 unit (lộ trình 3 nhóm), từ vựng SRS SM-2, biểu đồ học tập | SRS §3.2–3.4 | `server/routes/api.js`, `src/hooks/useUser.jsx`, `shared/lesson-ids.json` | `npm run prebuild` + Manual | 🚀 Production |
| `FR-CORE-03` | Luyện 4 kỹ năng (Nghe, Nói, Đọc, Viết) & 7 mini-game (gồm TyperShark) | SRS §3.3 | `src/features/practice/`, `src/features/mini-games/` | Manual / UAT | 🚀 Production |
| `FR-CORE-04` | Lời mời bạn học (Invite) & Bảng xếp hạng cộng đồng | SDD-INVITE v1.0 | `server/routes/invites.js`, `src/pages/InvitePage.jsx`, `src/pages/LeaderboardPage.jsx` | Manual / UAT | 🚀 Production |

---

## 2. Phân hệ Kinh tế & Chiến đấu v2 (GĐ1 → GĐ4 đã triển khai · GĐ5 → GĐ8 kế hoạch)

| Req ID | Mô tả yêu cầu | Nguồn / Quyết định | Mã nguồn chính | Kiểm thử tự động | Trạng thái |
|---|---|---|---|---|---|
| `FR-ECO-01` | Sổ cái tài nguyên `wallet_ledger` (4 loại: `milk`, `gem`, `stone`, `stone_shard`), chỉ server ghi | SDD-v2.1 §2 | `server/utils/wallet.js`, `server/routes/api.js` | `shared/wallet-coins-migration.test.js` | 🚀 Production |
| `FR-ECO-02` | Chỉ số chiến đấu pet theo điểm kỹ năng (`sqrt`), 10 hệ tương khắc, 7 nhóm, 5 độ hiếm | SDD-v2.1 §4 | `shared/game-config.js`, `shared/battle-engine.js`, `src/features/pet/PetPage.jsx` | `shared/battle-engine.test.js` (Leafy C4, Cowdi C1, Storm C5) | 🚀 Production |
| `FR-ECO-03` | Cộng điểm kỹ năng pet theo dạng câu (+1/câu đúng, +5 trọn điểm) | SDD-v2.1 §3 | `src/hooks/usePet.jsx`, `src/features/lesson/`, `src/features/practice/` | Manual / UAT | 🚀 Production |
| `FR-ECO-04` | Tiến hoá pet thủ công C1→C5 qua API có transaction (kiểm tra Sữa/Gem/Đá + kỹ năng) | SDD-v2.1 §3 | `server/routes/api.js` (`POST /api/pet/evolve`), `src/features/pet/PetPage.jsx` | `shared/battle-engine.test.js` (6 evolution tests) | 🚀 Production |
| `FR-ECO-05` | Thưởng Gem & Đá theo mốc bài mới và hoàn thành unit / 100% unit (chống cộng trùng) | D2, D11 | `server/utils/wallet.js`, `shared/units.json` | `shared/wallet-coins-migration.test.js` | 🚀 Production |
| `FR-ECO-06` | Đổi 15 Gem → 1 Đá (tối đa 1/tuần) & ghép 10 mảnh đá → 1 Đá | D3 | `server/utils/wallet.js`, `src/pages/AccountPage.jsx` | `shared/battle-engine.test.js` | 🚀 Production |
| `FR-ECO-07` | Battle Engine thuần tuý trên server (RNG seed, đánh đủ 10 câu, thắng theo % HP) | D9, SDD-v2.1 §5 | `shared/battle-engine.js`, `server/routes/api.js`, `src/features/duel/DuelPage.jsx` | `shared/battle-engine.test.js` (20+ combat tests) | 🚀 Production |
| `FR-ECO-08` | Mô phỏng cân bằng 6 kịch bản (ma trận pet C3/C5, hệ, nhóm, độ hiếm, kịch bản biên) | GĐ2 | `scripts/simulate-balance.js`, `docs/06-verification-validation/balance-v2/` | `shared/battle-engine.test.js` (3 edge-case tests) | 🚀 Production |
| `FR-ECO-09` | Bỏ hoàn toàn Coins; di trú Coins cũ → Sữa ×3; chuyển mọi thưởng sang Sữa & HUD 2 chip | D12 | `scripts/run-v2-migration.js`, `src/components/layout/BookShell.jsx`, `src/hooks/useUser.jsx` | `shared/wallet-coins-migration.test.js` | 🚀 Production |
| `FR-ECO-10` | Streak tính trên server theo múi giờ; tặng Khăn giữ lửa mốc 7/30/100 ngày (tối đa 2) | D13, GĐ3 | `server/utils/streak-manager.js`, `scripts/run-v2-streak-migration.js` | `shared/streak-shop.test.js` | 🚀 Production |
| `FR-ECO-11` | Cửa hàng Giữ nhịp 3 tab (Khăn giữ lửa, Vé quay lại, Khế ước 7 ngày cọc hoàn ×1.5, Đồng hồ Cowdi +10% Sữa) | D1, GĐ3 | `server/routes/shop.js`, `src/features/pet/ShopPage.jsx`, `StreakTab.jsx`, `ContractSelectSheet.jsx` | `shared/streak-shop.test.js` | 🚀 Production |
| `FR-ECO-12` | Đồ trang trí 6 bậc (`owned_cosmetics`), đồ mốc học tự cấp, combo -20% | D14, GĐ4 | `shared/cosmetics-data.js`, `server/utils/cosmetics-manager.js`, `src/features/pet/CosmeticsTab.jsx` | `server/tests/cosmetics-v2.test.mjs` | ✅ Done (`main`) |
| `FR-ECO-13` | Đấu trường mùa 4 tuần (vé gắn học, LP 6 bậc, rương tuần, chống lạm dụng) | D4, GĐ5 (`DEC-02`) | `feat/arena` (chưa mở) | Sẽ bổ sung ở GĐ5 | ⏳ Planned (GĐ5) |
| `FR-ECO-14` | Lõi Gacha + Thiệp mời người mới chọn Cowdi / quay pet khởi đầu + Thẻ tặng pet | D5, D6, D7, GĐ6–7 | `feat/gacha-*` (chưa mở) | Mô phỏng 100k lượt | ⏳ Planned (GĐ6–7) |
| `FR-ECO-15` | Thanh toán (Thẻ tháng, Thẻ mùa 30 tầng, gói Gem, giới hạn chi tiêu tài khoản nhỏ tuổi) | D8, GĐ8 (`DEC-06`) | `feat/payments` (chưa mở) | Sandbox cổng thanh toán | ⏳ Planned (GĐ8) |

---

## 3. Phân hệ Chỉnh động tác & Rig Pet (`/admin/pet-motion` & `<PetAvatar>`)

| Req ID | Mô tả yêu cầu | Nguồn | Mã nguồn chính | Kiểm thử tự động | Trạng thái |
|---|---|---|---|---|---|
| `FR-MOT-01` | Phân quyền quản trị viên (`requireAuth + requireAdmin` kiểm tra DB `is_admin = 1`), chặn ảnh nháp | PET-MOTION | `server/middleware/auth.js`, `server/routes/petMotionAdmin.js` | `server/tests/pet-motion-step1.test.mjs` (5 tests) | 🚀 Production |
| `FR-MOT-02` | Quản lý kho 23 pet × 5 cấp (tách riêng `bamboo` & `bamboo_spirit`), tải ảnh avatar & rig | PET-MOTION | `src/admin/pet-motion/PetMotionPage.jsx`, `api.js` | `server/tests/pet-motion-step2.test.mjs` | 🚀 Production |
| `FR-MOT-03` | Upload bộ phận PNG/WebP kiểm tra magic bytes + giới hạn 2 MB, gợi ý kích thước theo cấp & nén WebP tại trình duyệt | PET-MOTION | `server/utils/petMotion.js`, `src/admin/pet-motion/api.js`, `PetMotionPage.jsx` | `server/tests/pet-motion-step2.test.mjs` | 🚀 Production |
| `FR-MOT-04` | Bàn chỉnh keyframe 15 kênh (căn ngang 1-1), sắp thứ tự lớp `z`, emoji biểu cảm tự thiết kế | PET-MOTION | `src/admin/pet-motion/editor.js`, `shared/pet-motion-labels.js` | `server/tests/pet-motion-step2.test.mjs` | 🚀 Production |
| `FR-MOT-05` | Trình vẽ sửa trực tiếp PNG Studio 3 cột (đa Layer, 4 vùng chọn, thước pixel, tham chiếu mờ) | PET-MOTION | `src/admin/pet-motion/PartPaintModal.jsx` | Manual / UAT | 🚀 Production |
| `FR-MOT-06` | Quy trình duyệt rig & duyệt từng clip (chạy thử 1 vòng 1×); API công khai chỉ trả bản đã duyệt | PET-MOTION | `server/routes/petMotionAdmin.js`, `server/routes/petMotionPublic.js` | `server/tests/pet-motion-step2.test.mjs` (6 tests) | 🚀 Production |
| `FR-MOT-07` | Runtime `<PetAvatar>` / `PetRig` cho người học trên 6 trang, tuân thủ quy tắc fallback mục 4 & cache theo `petId` | PET-MOTION | `src/pet-rig/PetRig.js`, `PetAvatar.jsx`, `motionCache.js` | `src/pet-rig/pet-rig.test.mjs` (9 tests) | 🚀 Production |
| `FR-MOT-08` | Tab **Xem trước khi học (5.8)** chỉ đọc cho admin (Ở nhà, Quiz 8 câu + mic + đọc mẫu, Trận đấu, Gắn bó 0–1500, Nhật ký đỏ clip chưa duyệt) | Mục 5.8 | `src/admin/pet-motion/StudyPreviewTab.jsx`, `PetRig.js` | `src/pet-rig/pet-rig.test.mjs` (Nghiệm thu Bamboo C3) | 🚀 Production |

---

## 4. Phân hệ Bạn bè & Thưởng mời bạn (`SRS-FRIENDS v1.1.1`)

| Req ID | Mô tả yêu cầu | Nguồn | Mã nguồn chính | Kiểm thử tự động | Trạng thái |
|---|---|---|---|---|---|
| `FR-LND-01..04` | Route Express `GET /i/:code` chèn OG riêng (escape XSS, fallback OG chung), mẫu Nginx `/i/`, thay `api.qrserver.com` bằng QR tạo tại client | SRS-FRIENDS §3.1 | `server/routes/inviteLanding.js`, `src/utils/qr.js`, `src/features/invite/InviteSheet.jsx`, `nginx-spa.conf` | `server/tests/friends-og.test.mjs` (4 tests) | ✅ Sẵn sàng deploy |
| `FR-RWD-01..07` | Chống gian lận IP/thiết bị 24h (`flagged`), điều kiện "học thật" BR-01, thưởng +3 Gem / +500 Sữa / mốc vé gacha (trần 3 vé/tháng + dời tháng sau + danh hiệu), thông báo 1 lần, thống kê `InviteSheet` & `HowToEarnSheet` | SRS-FRIENDS §3.2 | `server/utils/invite-rewards.js`, `server/routes/invites.js`, `src/features/invite/InviteRewardNotice.jsx`, `src/pages/AuthCallbackPage.jsx` | `shared/friends.test.js`, `server/tests/friends-rewards.test.mjs` (`AT-02..AT-05`) | ✅ Sẵn sàng deploy |
| `FR-FRD-01..06` | Tự kết bạn khi nhận thiệp, mã bạn bè 8 ký tự, tìm & kết bạn bằng email khớp chính xác hoặc mã (`GET /api/friends/lookup`), máy quét QR trong App (camera + ảnh) & hỗ trợ quét qua Camera/Zalo cho người chưa cài App, dùng tên hiển thị tài khoản, chặn & báo cáo | SRS-FRIENDS §3.3 | `server/utils/friends-manager.js`, `server/routes/friends.js`, `server/routes/admin.js`, `src/pages/FriendsPage.jsx`, `src/components/QrScannerModal.jsx` | `server/tests/friends-core.test.mjs` (`AT-06`, `AT-07`) | ✅ Sẵn sàng deploy |
| `FR-VIS-01..03` | Trang thăm pet chỉ xem (BR-08) & thách đấu giao hữu bạn bè (`opponentId`, `is_friend_duel`, không cộng/trừ LP) | SRS-FRIENDS §3.4 | `src/pages/FriendPetPage.jsx`, `server/routes/api.js`, `src/features/duel/DuelPage.jsx` | `server/tests/friends-visit-duel.test.mjs` (`AT-10`) | ✅ Sẵn sàng deploy |
| `FR-MAP-01..09` | `GET /api/friends/path-progress` (2 truy vấn, không N+1), tính vị trí bằng `buildPathNodes`/`getNextPathLesson`, avatar cạnh node + `+N` + vương miện 👑 + chip lộ trình khác + toast vượt bạn (không báo khi học lại bài cũ) | SRS-FRIENDS §3.5 | `src/features/friends/friendPathLogic.js`, `useFriendPositions.js`, `src/pages/LearningPathPage.jsx` | `server/tests/friends-path.test.mjs` (`AT-08`, `AT-09`) | ✅ Sẵn sàng deploy |
| `NFR-FRD` | Ghi 5 sự kiện `app_events` (NFR-06, `LONGTEXT`), rà soát không rò email/ảnh Google/IP/điểm số (`AT-11`), không dùng `alert/confirm/prompt` (C-04) | SRS-FRIENDS §8 | Toàn bộ routes & UI phân hệ Bạn bè | `server/tests/friends-privacy-events.test.mjs` (`AT-11`) | ✅ Sẵn sàng deploy |

---

## 5. Phân hệ Pet Director V2 (`SDD-PET-DIRECTOR v1.1.1` — Tích hợp trên nền `Pet-motion`)

| Req ID | Mô tả yêu cầu | Nguồn | Mã nguồn chính | Kiểm thử / Nghiệm thu | Trạng thái |
|---|---|---|---|---|---|
| `FR-DIR-01` | Lõi điều phối `PetDirector` thuần JS (ưu tiên, ngắt, cooldown, giãn cách 20s, 1 lần/phiên, giờ yên 21:00–06:00, chống lặp 7 ngày, giữ chỗ GĐ3) | SDD-PET-DIRECTOR §3–4, §11 | `src/pet-director/PetDirector.js`, `rules.js`, `lineSelector.js`, `storage.js` | `src/pet-director/pet-director.test.mjs` | ✅ Done (`main`) |
| `FR-DIR-02` | Tận dụng `Pet-motion`: thêm `canvasBubble` (`false` khi dùng Director), chuẩn hoá `onClip('tap')` cho cả rig duyệt & ảnh tĩnh fallback, tuân thủ P3 | SDD-PET-DIRECTOR §2, §9 | `src/pet-rig/PetRig.js`, `src/pet-rig/PetAvatar.jsx` | `src/pet-rig/pet-rig.test.mjs` | ✅ Done (`main`) |
| `FR-DIR-03` | Sân khấu `<PetStage>` đồng hành chuẩn V2 (Desktop `sticky` 2 cột + căn giữa thẻ đơn/Flashcard + `.lesson-step-footer` full-width; Mobile xếp dọc `compact` giữ Zero-Scroll Quiz), `<PetSpeech>` (Mali + nút Nghe TTS + nhép miệng), `<PetThought>` SVG | SDD-PET-DIRECTOR §6.1, §6.3–6.4 | `src/pet-director/DirectorContext.jsx`, `PetStage.jsx`, `PetSpeech.jsx`, `PetThought.jsx`, `pet-director.css` | `188/188` test PASS, `npm run build` PASS, UAT local | ✅ Done (`main`) |
| `FR-DIR-04` | Gỡ hoàn toàn bong bóng nổi `CowdiChat` khỏi `App.jsx` & dọn `.cowdi-chat-*` trên 3 file CSS; chuyển `LessonDetailPage`, `PictureLesson`, `PracticePage` sang `dispatch` | SDD-PET-DIRECTOR §1 (P2, P7), §7 | `src/App.jsx`, `LessonDetailPage.jsx`, `PictureLesson.jsx`, `PracticePage.jsx`, `book.css`, `components.css`, `pet.css` | 0 `position: fixed` pet trên bài học | ✅ Done (`main`) |
| `FR-DIR-05` | Kho câu thoại LineDB đạt chuẩn giọng văn P3–P6 (`common.js` trung tính + `cowdi.js` 240+ câu GĐ2 + chuyển `PAGE_TIPS`, 0 từ cấm, ≤ 60 ký tự) | SDD-PET-DIRECTOR §5 | `src/data/pet-lines/index.js`, `common.js`, `cowdi.js` | `src/pet-director/lines.test.mjs` | ✅ Done (`main`) |
| `FR-DIR-06` | `<PathPet>` trên bản đồ `LearningPathPage` (kèm `<PetThought>` & thẻ hành động `Học tiếp`/`Để sau`, hài hoà với bạn bè `FR-MAP-04`, chặn kích hoạt khi đang onboarding) | SDD-PET-DIRECTOR §6.2 | `src/pet-director/PathPet.jsx`, `src/pages/LearningPathPage.jsx` | `npm test` + `npm run build` | ✅ Done (`main`) |
| `FR-DIR-07` | Chuyển `HomePage`, `PetPage`, `DuelPage` (luôn Tầng 1) sang Director; thêm preview Director trong `StudyPreviewTab`; xoá `CowdiChat.jsx`, `chatMessages`, `getPetMessage` | SDD-PET-DIRECTOR §7, §10 | `HomePage.jsx`, `PetPage.jsx`, `DuelPage.jsx`, `StudyPreviewTab.jsx`, `src/data/pets.js` | `grep` 0 chuỗi cấm P3 trong kho thoại & UI pet | ✅ Done (`main`) |

---

## 6. Chuẩn chất lượng & Rà soát Ngân hàng câu hỏi (`STD-QUESTION-QUALITY v1.0`)

| Req ID | Mô tả yêu cầu | Nguồn | Mã nguồn chính | Kiểm thử / Nghiệm thu | Trạng thái |
|---|---|---|---|---|---|
| `FR-QA-01` | Giao diện câu hỏi nghe `PlacementTest`: hỗ trợ `audioText \|\| speak`, tự phát 1 lần khi sang câu, nút `Nghe lại` & `🐢 Nghe chậm` (0.55×), badge `🎧 Câu hỏi nghe`, không lộ `audioText`, lọc câu nghe hỏng / trình duyệt thiếu TTS | STD-QUESTION-QUALITY §3.3, §5.3 | `src/features/placement/PlacementTest.jsx`, `src/pages/LearningPathPage.jsx` | `npm run build` + UAT | ✅ Done (`main`) |
| `FR-QA-02` | Sinh câu Starter cùng nhóm `category`, bỏ lặp emoji trong lời dẫn, không sinh `image-pick-word` cho `greeting`, hiển thị ô màu `swatch` + emoji vuông, bỏ tự sinh `_type === 'grammar'` khỏi checkpoint & chống trùng nghĩa `reading.js` | STD-QUESTION-QUALITY §3.2, §3.4, §5.2 | `src/utils/quiz-gen.js`, `src/data/lessons/starter/*.js`, `PictureLesson.jsx`, `reading.js` | `shared/quiz-gen.test.js` (4 tests, chạy 500 lượt) | ✅ Done (`main`) |
| `FR-QA-03` | Validator dùng chung 14 mã (`Q-L2-AUDIO`..`Q-EXPL` + `Q-OPT-ALL`) & 3 bảng lexicon (`categories`, `synonyms`, `ambiguous-emoji`), tích hợp retry 3× trong `generatePictureChallenge` | STD-QUESTION-QUALITY §5.1–5.2 | `shared/question-rules.js`, `src/data/lexicon/*.js` | `shared/question-rules.test.js` (14 tests) | ✅ Done (`main`) |
| `FR-QA-04` | Chế độ `--questions` / `--json` / `--fail-on-hard` trong `validate-lessons.mjs`, chặn build ở `prebuild` & báo cáo rà soát toàn kho | STD-QUESTION-QUALITY §5.1, `GEMINI-QUESTION-QA` | `scripts/validate-lessons.mjs`, `package.json`, `RPT-QUESTION-AUDIT-2026-11-26.md` | `npm run validate:questions` (**0 lỗi cứng / 2.829 câu**) | ✅ Done (`main`) |
| `FR-QA-05` | Sửa dứt điểm toàn bộ 29 lỗi cứng Đợt 1 (`s1-hello`, `ielts-foundation-listening`, `QUIZ_BANK`, ...) & cân chỉnh toàn bộ 70 `Q-LEN` + 89 `Q-POS` trên 54 bài v2 (Đợt 2) | `RPT-QUESTION-AUDIT-2026-11-26.md` | 44 file bài v2 + `quiz-bank.js` + `quiz-bank-extra.js` | **54/54 bài v2: 0 lỗi · 0 cảnh báo** | ✅ Done (`main`) |

---

## 7. Hệ thống Màn học Cowdi 4 Đợt (`STD-SCREEN-SYSTEM v1.0` — `WS-11`)

| Req ID | Mô tả yêu cầu | Nguồn | Mã nguồn chính | Kiểm thử / Nghiệm thu | Trạng thái |
|---|---|---|---|---|---|
| `FR-SCR-01` | Registry 18 mã màn (T-01..T-08 Tập trung, F-01..F-11 Thân thiện; T-03 thành mẹo pet + `GrammarSheet`), bộ trộn thuần JS `mixLesson` 6 màn (màn 1 Gặp từ, màn 2 không phải Nói, màn 6 Boss, trọng số nhóm, fallback 5 màn, `lastMix`) | STD-SCREEN-SYSTEM §1–3, Phase 1 | `src/features/lesson/screens/{registry,items,mixer,seededRandom}.js` | `mixer.test.mjs` (M1–M9) + `RPT-SCREEN-COVERAGE` | ⏳ Planned (Đợt 1) |
| `FR-SCR-02` | Tách 6 màn T hiện có giữ nguyên UI + thêm màn **T-08 Viết câu** (Xếp câu & Gõ câu chuẩn hoá `speech.js`), `ScreenHost` 100dvh không cuộn, `RouteHeader`, `ScreenIntro`, `useScreenEvents`, cờ `screenSystemV1`, đồng bộ `lessonMixLog`/`lastMix` | STD-SCREEN-SYSTEM §2.1, §4.3, Phase 1 | `src/features/lesson/screens/focus/T01..T08`, `ScreenHost.jsx`, `GrammarSheet.jsx`, `server/routes/api.js` | `speech.test.js`, 360×640 & 800×1280 không cuộn | ⏳ Planned (Đợt 1) |
| `FR-SCR-03` | Cấu hình màn trên server (`screen_config`, `screen_weights`, `screen_testers`, `screen_config_log` chuẩn `RK-005`), API `GET /api/screens/config` (ETag/304) + 7 API admin, trang `/admin/screens` (6 tab: Danh mục, Ma trận, Trộn thử 1.000 lần, Xem trước sandbox, Tài khoản thử, Nhật ký) | STD-SCREEN-SYSTEM §5–6, Phase 2 | `server/routes/screens*.js`, `src/admin/screens/`, `ScreenConfigProvider` | Test A1–A8 | ⏳ Planned (Đợt 2) |
| `FR-SCR-04` | Khung màn Thân thiện + 5 màn F đầu (`F-01`, `F-03`, `F-08`, `F-09`, `F-06` Boss sương mù, trạng thái `test`), màn **Mở ải**, kho dẫn nhập `screen_intro` không lặp 10 ải + 156 câu nháp (`BD/TG/VS`) + tab admin Kho dẫn nhập | STD-SCREEN-SYSTEM §2.2, §4, Phase 3 | `src/features/lesson/screens/friendly/`, `server/db/seed-screen-intros-p3.sql` | Test P1–P10 | ⏳ Planned (Đợt 3) |
| `FR-SCR-05` | **Khách quen** (xen 2–3 từ cũ `learning`/`review` ≤ 30%), **4 chấm kỹ năng `skillsHit`** trong `wordProgress`, **Sao ★ 1–3 & Sữa theo sao** (`shared/lesson-stars.js`, Q13, tối đa vẫn 190 Sữa), màn **Tổng kết mới** & sao trên node bản đồ | STD-SCREEN-SYSTEM §1 (Q8, Q13), §3.5, Phase 3 | `shared/lesson-stars.js`, `wordProgress.js`, `LearningPathPage.jsx`, `server/routes/api.js` | Test S1–S5, P6–P7 | ⏳ Planned (Đợt 3) |
| `FR-SCR-06` | Thống kê màn ẩn danh (`screen_stat_daily`, không `user_id`, tab admin Thống kê) + 6 màn F còn lại (`F-02`, `F-04`, `F-05`, `F-07`, `F-10`, `F-11`), mở rộng schema bài (`plural`/`countable`, `dialogPrompts[]`, `trueFalse[]`) + dọn code tab cũ `LessonDetailPage` | STD-SCREEN-SYSTEM §2.2, §5, Phase 4 | `src/features/lesson/screens/friendly/`, `schema.js`, `validate-lessons.mjs`, `server/routes/screens.js` | Test Q1–Q9 | ⏳ Planned (Đợt 4a–4c) |

---

## 8. Yêu cầu Phi chức năng (Non-Functional Requirements — NFR)

| Req ID | Hạng mục | Yêu cầu cụ thể | Cách kiểm chứng | Trạng thái |
|---|---|---|---|---|
| `NFR-01` | Bảo mật & Chống gian lận | Mọi biến động ví đi qua `wallet_ledger` trên server; admin API xác thực `users.is_admin` từ DB (không tin JWT payload) | `pet-motion-step1.test.mjs`, code review | ✅ Đạt |
| `NFR-02` | Tương thích Database | Toàn bộ migration SQL & Node runners chạy idempotent trên MySQL 5.5/5.6 → 8.0 & MariaDB (`LONGTEXT`, ≤ 1 `TIMESTAMP` auto, không `JSON_EXTRACT`) | Đã chạy thành công trên production (`cowdi.net`) & local XAMPP | ✅ Đạt |
| `NFR-03` | An toàn dữ liệu deploy | Gói `deploy.zip` không bao giờ chứa `server/.env` hoặc `server/storage/` | Kiểm tra tự động bằng `unzip -l` khi build gói | ✅ Đạt |
| `NFR-04` | Chất lượng hiển thị & Accessibility | `PetRig` vẽ tối thiểu `2× DPR`, tôn trọng `prefers-reduced-motion` (biên độ 40%), hỗ trợ fallback ảnh tĩnh không lỗi | `pet-rig.test.mjs` + kiểm tra trực quan | ✅ Đạt |
| `NFR-05` | Hiệu năng PWA & Cache | `dist-prod/sw.js` precache tài nguyên chính (loại trừ nguồn seed thô `pets/**`), API `GET /api/pet-motion/:petId` cache bộ nhớ | `npm run build:prod`, `pet-rig.test.mjs` | ✅ Đạt |
| `NFR-06` | Độ tin cậy đồng bộ | `PUT /api/progress` luôn trả ví chuẩn cho cả tài khoản mới lẫn cũ, không bao giờ gây lỗi render `<BookShell>` | `f8baa29`, kiểm thử thực tế tài khoản mới | ✅ Đạt |
