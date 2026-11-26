    # TASK — Triển khai Kinh tế v2 (Cowdi English)

> File theo dõi tiến độ cho `docs/01-project-management/QUY-TRINH-TRIEN-KHAI-KINH-TE-V2.md`.
> **Claude Code đọc file này đầu mỗi phiên và cập nhật ngay khi xong mỗi việc.**
> Cách dùng: xem `docs/01-project-management/PROMPT-CLAUDE-CODE-KINH-TE-V2.md` (Claude Code và Antigravity).
> Antigravity: gõ `/tiep-tuc` để làm tiếp, `/kiem-tra-tien-do` để xem tiến độ.

## Ký hiệu
| Ký hiệu | Nghĩa |
|---|---|
| `[ ]` | Chưa làm |
| `[~]` | Đang làm |
| `[x]` | Xong (ghi ngày + commit ở cuối dòng) |
| `[!]` | Bị chặn (ghi lý do ở mục "Vấn đề đang chặn") |
| `[-]` | Bỏ, không làm (ghi lý do) |

Ví dụ dòng đã xong: `- [x] Tạo ledger milk/gem/stone — 2026-11-25 · a1b2c3d`

---

## Trạng thái tổng

| GĐ | Nội dung | Trạng thái | Nhánh | Ngày xong |
|---|---|---|---|---|
| 0 | Chuẩn bị tài liệu & chốt | `[x]` | — | 2026-11-23 |
| 1 | Nền tảng v2 | `[x]` | `feat/economy-battle-v2` | 2026-11-23 |
| 2 | Mô phỏng cân bằng | `[x]` | `feat/balance-sim-v2` | 2026-11-23 |
| 3 | Cửa hàng Giữ nhịp | `[x]` | `feat/shop-streak` | 2026-11-23 |
| 4 | Đồ trang trí | `[x]` | `feat/cosmetics-v2` | 2026-11-24 |
| 5 | Đấu trường | `[ ]` | `feat/arena` | |
| 6 | Lõi gacha + thiệp mời + quay khởi đầu | `[ ]` | `feat/gacha-core-invite` | |
| 7 | Gacha đầy đủ | `[ ]` | `feat/gacha-full` | |
| 8 | Thanh toán | `[ ]` | `feat/payments` | |
| 9 | Theo dõi & điều chỉnh | `[ ]` | — | Liên tục |

---

## Quyết định đã chốt (ưu tiên cao nhất khi tài liệu mâu thuẫn)

| # | Quyết định | Ngày |
|---|---|---|
| D1 | Vật phẩm Giữ nhịp giá Sữa: Khăn giữ lửa 400 · Vé quay lại 300 · Khế ước 7 ngày cọc 300/700/1 500 hoàn ×1.5 · Đồng hồ Cowdi 1 000 | 23/11/2026 |
| D2 | Gem theo unit: hoàn thành unit +1 Gem; hoàn thành 100% +2 Gem nữa (mỗi unit nhận 1 lần) | 23/11/2026 |
| D3 | Đá: giữ 1 đá / 10 bài mới; đổi 15 Gem lấy 1 đá, tối đa 1/tuần; không bán đá trực tiếp | 23/11/2026 |
| D4 | Đấu trường: vé từ học (3/ngày + 2/bài mới + 3/unit 100%, giữ tối đa 15); thưởng 8/5/2 Sữa; không trần Sữa/ngày; Thẻ tháng không nhân Sữa Đấu trường | 23/11/2026 |
| D5 | Gacha: 50 Gem/vé, không có gói 10, **không có bảo hiểm**; tỉ lệ 67/22/8/3 | 23/11/2026 |
| D6 | Không có bản lấp lánh; pet giới hạn trùng → Thẻ tặng pet (gửi qua Mời bạn, chỉ người mới nhận, người tặng +3 Gem khi người nhận học 3 bài, tối đa 3 thẻ/tháng) | 23/11/2026 |
| D7 | Thiệp mời chỉ cho người mới. Qua thiệp thường: chọn Cowdi **hoặc** quay pet khởi đầu (bể 21 pet trừ Cowdi, 50/30/13/5/2). Qua thẻ tặng: nhận pet được tặng. Tự đăng ký: Cowdi. Tài khoản không có Cowdi là cố ý | 23/11/2026 |
| D8 | Thẻ tháng Sữa ×1.5 và Thẻ mùa học tập là hướng kiếm tiền chính (chưa thiết kế chi tiết) | 23/11/2026 |
| D9 | Trận đấu pet: đánh đủ 10 câu (STOP_AT_ZERO = false, để cờ cấu hình); thắng thua theo % HP còn lại sau 10 câu | 23/11/2026 |
| D10 | Đá nguyên tố: dùng chung 1 loại (chưa tách theo 10 hệ) | 23/11/2026 |
| D11 | Hoàn thành 100% unit: toàn bộ bài học trong unit trọn điểm + kiểm tra cuối unit 100% (thưởng thêm 2 Gem) | 23/11/2026 |
| D12 | Bỏ Coins hoàn toàn khỏi giao diện và kinh tế. Coins hiện có đổi 1 lần sang Sữa (1 coin = 3 Sữa, ledger reason 'coin_migration', an toàn chạy lại). Mọi thưởng coins chuyển sang Sữa (×3: nhiệm vụ ngày 30/75, perfect quiz 45, streak 60/150, thành tựu 90, nhiệm vụ tuần ×3). Duel bỏ thưởng coins, giữ Sữa điểm trận. Cửa hàng: giữ đồ đã mua, tạm ngừng bán mũ/áo/phòng/hiệu ứng/đồ ăn chờ GĐ3/GĐ4; bỏ 5 đồ ăn; bỏ gift_egg thay bằng nút Mời bạn miễn phí (InviteSheet). | 23/11/2026 |
| D13 | Tặng 1 Khăn giữ lửa miễn phí khi đạt các mốc streak 7, 30, 100 ngày nếu số khăn trong kho chưa đủ 2 (tối đa 2 khăn). | 23/11/2026 |
| D14 | Đồ trang trí GĐ4: Bậc Thường (800 Sữa) và Hiếm (2 000 Sữa) bán bằng Sữa; Bậc Sử thi (40 Gem) và Huyền thoại (90 Gem) bán bằng Gem; Mốc học miễn phí theo thành tích; Mua cùng chủ đề giảm 20%. | 24/11/2026 |

> Khi chốt thêm, thêm dòng D9, D10… và đánh dấu mục tương ứng ở "Cần chốt" là `[x]`.

## Cần chốt (chặn giai đoạn ghi trong ngoặc)
- [x] Pet hết HP giữa trận: dừng ngay hay đánh đủ 10 câu? (GĐ1 — chốt D9: đánh đủ 10 câu)
- [x] Đá dùng chung hay tách theo 10 hệ? (GĐ1 — chốt D10: dùng chung)
- [x] Định nghĩa "hoàn thành 100% unit" — đề xuất: mọi bài trọn điểm + kiểm tra cuối unit 100% (GĐ1 — chốt D11)
- [x] Tặng khăn giữ lửa ở mốc streak 7/30/100? (GĐ3 — chốt D13: có tặng nếu kho < 2)
- [x] Coins và đồ cũ (mũ, áo, phòng, hiệu ứng, đồ ăn, `gift_egg`) xử lý thế nào? (GĐ3 — chốt D12)
- [x] Đồ trang trí Thường/Hiếm giá Sữa hay chuyển sang Gem? (GĐ4 — chốt D14: Thường 800 Sữa, Hiếm 2 000 Sữa, Sử thi 40 Gem, Huyền thoại 90 Gem)
- [ ] Câu đúng trong Đấu trường có cộng điểm kỹ năng? Đối thủ AI có tính LP? Ngưỡng LP? (GĐ5)
- [ ] Tỉ lệ pet giới hạn 3% hay 5%? (GĐ7)
- [ ] Pet giới hạn đầu tiên: tên, hệ, nhóm, 8 mức điểm kỹ năng, 5 ảnh (GĐ7)
- [ ] Người chơi cũ lấy lại pet giới hạn mùa cũ bằng cách nào? (GĐ7)
- [ ] Thiết kế chi tiết Thẻ mùa và Thẻ tháng; giá gói Gem; giới hạn chi tiêu cho tài khoản nhỏ tuổi (GĐ8)
- [ ] Thời gian học trung bình mỗi bài (để chỉnh giá vé gacha) (GĐ9)

---

## GĐ0 — Chuẩn bị tài liệu & chốt
- [x] Chép đề xuất vào `docs/04-design/economy-v2/` — 2026-11-23 · afc4f52
- [x] Tạo `QUY-TRINH-TRIEN-KHAI-KINH-TE-V2.md`, `PROMPT-CLAUDE-CODE-KINH-TE-V2.md`, `TASK.md` — 2026-11-23 · afc4f52
- [x] Cấu hình Antigravity: `.agents/rules/kinh-te-v2.md` + 5 skill trong `.agents/skills/` — 2026-11-23 · afc4f52
- [x] Cập nhật `docs/04-design/ECONOMY-BATTLE-V2-IMPLEMENTATION.md` theo D2, D3 (hằng số `GEM_PER_UNIT`, `GEM_PER_UNIT_PERFECT`, `GEM_PER_STONE`, `STONE_EXCHANGE_PER_WEEK`, tài nguyên `stone_shard`) và sửa mục 7 "Shop tạm gác" — 2026-11-23 · afc4f52
- [x] Cập nhật `docs/00-general/DOCUMENT-REGISTER.md` (REG-DOCUMENTS.md) — 2026-11-23 · afc4f52
- [x] Chốt 3 điểm chặn GĐ1 (xem "Cần chốt") — 2026-11-23 · e15401f

## GĐ1 — Nền tảng v2
- [x] Khảo sát code, gửi kế hoạch theo phase của hướng dẫn triển khai, được duyệt — 2026-11-23 · e15401f
- [x] File cấu hình hằng số dùng chung (server + mô phỏng) — 2026-11-23 · e15401f
- [x] Ledger server: `milk`, `gem`, `stone`, `stone_shard`; `GET /api/wallet` — 2026-11-23 · 327d136
- [x] Chỉ số pet theo điểm kỹ năng (căn bậc hai), 10 hệ, 7 nhóm, độ hiếm; test Leafy C4 — 2026-11-23 · 327d136
- [x] Điểm kỹ năng: +1/câu đúng theo dạng câu, +5 trọn điểm, bỏ +5 cả 4 kỹ năng — 2026-11-23 · 327d136
- [x] Tiến hoá thủ công qua API (transaction) — 2026-11-23 · 327d136
- [x] Gem/Đá theo bài mới trên server — 2026-11-23 · 327d136
- [x] Gem theo unit (D2) — 2026-11-23 · 327d136
- [x] Đổi Gem lấy đá 1/tuần (D3) — 2026-11-23 · 327d136
- [x] Engine trận đấu server (hàm thuần, RNG seed), thắng thua theo HP; client phát lại — 2026-11-23 · 327d136
- [x] Migration dữ liệu cũ (chạy lại an toàn) — 2026-11-23 · 327d136
- [x] UI: PetPage (khối Tiến hoá, 4 chỉ số), AccountPage (ví), CollectionPage (hệ, nhóm) — 2026-11-23 · 327d136
- [x] Cập nhật SRS, thiết kế, test case, traceability — 2026-11-23 · 327d136

**Tiêu chí xong**
- [x] Test Leafy C4 đúng (HP 271, ATK 21.9, DEF 38.7, AGI 11.4, crit ×1.49)
- [x] Gem/Đá không cộng trùng khi làm lại bài hoặc chạy lại migration
- [x] Client sửa dữ liệu không đổi được kết quả trận
- [x] `npm run build` thành công

## GĐ2 — Mô phỏng cân bằng
- [x] `scripts/simulate-balance.js` gọi engine thật — 2026-11-23 · 55841d7
- [x] Chạy 6 nhóm kịch bản trong lệnh 2 (kể cả pet Huyền thoại/Sự kiện C1) — 2026-11-23 · 55841d7
- [x] Xuất CSV + `BALANCE-REPORT-v2.md` — 2026-11-23 · 55841d7
- [x] Đề xuất chỉnh hằng số được duyệt và áp dụng — 2026-11-23 · 55841d7
- [x] Test hồi quy cho kịch bản biên — 2026-11-23 · 55841d7
- [x] (Thủ công) Cập nhật bảng cân bằng trên claude.ai — 2026-11-23 · 55841d7

## GĐ3 — Cửa hàng Giữ nhịp
- [x] Bỏ Coins, đổi coins sang Sữa — 2026-11-23 · ac3b700
- [x] Streak tính trên server theo múi giờ người dùng — 2026-11-23 · 6adecd0
- [x] Khăn giữ lửa (tự dùng, giữ tối đa 2, mua 2/tuần) — 2026-11-23 · 6adecd0
- [x] Vé quay lại — 2026-11-23 · 6adecd0
- [x] Khế ước 7 ngày (3 mức, cọc/hoàn qua ledger) — 2026-11-23 · 6adecd0
- [x] Đồng hồ Cowdi (+10% Sữa, nhắc qua `usePush`) — 2026-11-23 · 6adecd0
- [x] Trang cửa hàng mới (tab Giữ nhịp) — 2026-11-23 · 6adecd0
- [x] Xử lý coins và đồ cũ theo quyết định đã chốt — 2026-11-23 · ac3b700
- [x] Làm lại UI cửa hàng theo mục Giao diện cửa hàng — 2026-11-23 · 7340b95
- [ ] Hoàn thiện Đá nguyên tố trên giao diện
- [x] Sửa xem trước pet trong Cửa hàng + nút Quay lại — 2026-11-24 · 67ae58f
- [x] Đồng bộ chữ Cửa hàng + chip Đá trên HUD — 2026-11-24 · 8b0ef39
- [x] Đấu trường game: Sửa HUD máu trực quan + bỏ giới hạn từ, đấu sinh tử tới khi KO — 2026-11-24 · fa30e85

**Tiêu chí xong**
- [x] Mua/hoàn Sữa đúng qua ledger; khăn tự dùng khi lỡ 1 ngày; khế ước hoàn ×1.5 đúng hạn

## GĐ4 — Đồ trang trí
- [x] Bảng `owned_cosmetics`; 6 bậc; xếp lại đồ cũ, giữ đồ đã mua — 2026-11-24 · 284d9a5
- [x] Đồ mốc học tự cấp: Lửa streak, 4 hào quang kỹ năng, Toàn năng, Phòng học theo trình độ — 2026-11-24 · 284d9a5
- [x] Nền và hào quang mới (10 nền hệ, đồ Gem) — 2026-11-24 · 284d9a5
- [-] Khung avatar, danh hiệu — Chuyển sang GĐ5 Đấu trường (phần thưởng bậc xếp hạng Đồng → Cao thủ theo thiết kế)
- [x] Hiển thị ở trang pet, Đấu trường, bảng xếp hạng, thẻ chia sẻ — 2026-11-24 · 284d9a5

**Tiêu chí xong**
- [x] Trang bị/tháo được ở mọi nơi hiển thị; đồ mốc học tự mở khi đạt điều kiện

## GĐ5 — Đấu trường
- [ ] Vé đấu gắn với học (D4)
- [ ] Ghép trận cấp ±1 + LP; đối thủ luyện tập; bảo vệ người mới
- [ ] LP, 6 bậc, mùa 4 tuần, reset mềm
- [ ] Thưởng trận, rương tuần, thưởng mùa (Gem, mảnh đá, vé gacha, đồ trang trí mùa)
- [ ] Cỏ ba lá, mời bạn vào Đấu trường, nhiệm vụ Đấu trường
- [ ] Chống lạm dụng (2 trận tính thưởng/ngày với cùng đối thủ)
- [ ] Mùa 0 thử nghiệm 2 tuần

**Tiêu chí xong**
- [ ] Sữa Đấu trường ≈ 10–20% Sữa từ học trên dữ liệu thử

## GĐ6 — Lõi gacha + thiệp mời + quay khởi đầu
- [ ] Sửa `ensureInitialPet()` (`src/hooks/usePet.jsx`): chỉ tạo Cowdi khi tự đăng ký hoặc chọn Cowdi; ghi `source` (`starter`/`starter_pull`/`gift_card`/`event:<id>`) để sau này lấy lại Cowdi qua sự kiện không bị trùng; rà `activePetId = 'cowdi_1'`
- [ ] Lõi gacha server: RNG an toàn, tỉ lệ theo config, lịch sử 100 lượt, công khai tỉ lệ
- [ ] Thiệp mời chỉ cho người mới; màn chọn Cowdi (+ phụ kiện "Khăn Bạn Đầu Tiên") / quay pet khởi đầu (D7 + `REFERRAL-GACHA-TICKET.md` v0.3)
- [ ] Bảng `invites`: `starter_choice`, `starter_species`, `gift_card_id`

**Tiêu chí xong**
- [ ] Người mới qua thiệp nhận đúng pet theo lựa chọn; không tạo nhầm Cowdi; tài khoản cũ không nhận được thiệp

## GĐ7 — Gacha đầy đủ
- [ ] Vé gacha 50 Gem mua lẻ; nguồn vé miễn phí (dùng chung `wallet_ledger.currency = 'gacha_ticket'` đã có từ phân hệ Bạn bè)
- [ ] Bể gacha thường (D5), không bảo hiểm; quà trùng đổi sang Gem/Sữa (`gacha_duplicate`: Thường/Hiếm đủ hết → 600 Sữa, Sử thi → +10 Gem)
- [ ] Banner 3 tuần + pet giới hạn đầu tiên + nhiệm vụ sự kiện 15 bài (+ nhiệm vụ sự kiện lấy lại Cowdi)
- [ ] Thẻ tặng pet qua `InviteSheet` (D6); bảng `pet_gift_cards`; hết hạn 60 ngày đổi +10 Gem (`gift_card_expired`)
- [-] Bụi sao và cửa hàng Bụi sao — Bỏ theo quyết định Q3 trong `REFERRAL-GACHA-TICKET.md` v0.3 (đổi quà trùng thẳng sang Gem/Sữa)

**Tiêu chí xong**
- [ ] Mô phỏng 100 000 lượt ra đúng tỉ lệ; thẻ tặng chỉ người mới nhận được

## GĐ8 — Thanh toán
- [ ] Thiết kế chi tiết Thẻ mùa (30 tầng, điểm mùa) và Thẻ tháng
- [ ] Chốt gói Gem
- [ ] Tích hợp cổng thanh toán; ledger `purchase`; hoàn tiền; chống gian lận
- [ ] Giới hạn chi tiêu theo tháng cho tài khoản nhỏ tuổi
- [ ] Công khai tỉ lệ gacha và điều khoản mua

## GĐ9 — Theo dõi & điều chỉnh
- [ ] Dashboard/truy vấn cho các chỉ số trong quy trình (thời gian học/bài, tỉ lệ unit 100%, Sữa Đấu trường, khế ước, phân bố bậc, lượt gacha trước khi trúng, giữ chân ngày 7)

---

## Lộ trình 3 nhóm & Chuẩn Nội dung v2 (`feat/learning-groups`)

> Tài liệu nguồn: [SPMP-UPGRADE-CONTENT-LEARNING-GROUPS-v1.0.md](docs/01-project-management/SPMP-UPGRADE-CONTENT-LEARNING-GROUPS-v1.0.md) · [SRS-LESSON-3-LEVELS-v1.0.md](docs/02-requirements/SRS-LESSON-3-LEVELS-v1.0.md) · [SDD-LEARNING-GROUPS-v2.0.md](docs/04-design/SDD-LEARNING-GROUPS-v2.0.md) · [STD-LESSON-CONTENT-v1.0.md](docs/05-implementation/content/STD-LESSON-CONTENT-v1.0.md)

- [x] Bước 0 — Vá `reading.js` giữ trường v2, sửa 2 lỗi dữ liệu cũ (`ielts-pre-grammar`, `ielts-pre-writing`), thêm test hồi quy & gắn `validate-lessons.mjs` vào `prebuild` — 2026-11-24
- [x] GĐ A — Dữ liệu & luật lộ trình 3 nhóm (`groups.js`, `units.js`, `paths.js`, Unit S1 `starter/`, `path.js`, `build-lesson-ids.mjs`, `shared/learning-path.test.js`) — 2026-11-24
- [x] GĐ B — Server migration MySQL 5.6+ (`migrate-learning-groups.sql` + runner), `api.js`, `wallet.js` (sửa H6/H7), `guard-unit-gems.mjs` & server tests — 2026-11-24
- [x] GĐ C — Trải nghiệm bài học 3 nhóm (`PictureLesson.jsx`, `LessonDetailPage` + `U1–U7`, `U10`, `quiz-gen.js` & `buildCheckpointQuestions` mới, `useUser.jsx`) — 2026-11-24
- [x] GĐ D — `GroupPicker.jsx`, `PlacementTest.jsx` (`/placement`), `LearningPathPage`, `HomePage`, `BookShell`, `LessonsPage`, `AccountPage` — 2026-11-24
- [x] GĐ E — Chuyển đổi người dùng cũ (`migrateLegacyProgress`, gợi ý nhóm, `guard-unit-gems.mjs`), E2E & xác minh toàn bộ test/build — 2026-11-24
- [x] UI U8 — Màn hình `ExamReading.jsx` (chia đôi màn hình, cột từ `glossary`, đồng hồ `timeLimitMin`, đủ 6 dạng đề thi gồm `sentence-completion` + `maxWords`, tô `evidence.quote` & bảng `paraphrasePairs`) — 2026-11-24 · b19057a
- [x] Nội dung `int-u1` v2 — Nâng cấp toàn bộ 4 bài (`greetings`, `family`, `colors`, `numbers`) lên `contentVersion: 2` đạt 0 lỗi 0 cảnh báo theo `briefs/int-u1.md` — 2026-11-24 · 30369fa
- [x] Nội dung `int-u2` v2 — Tạo `briefs/int-u2.md` & nâng cấp 4 bài (`school`, `weather`, `jobs`, `body`) lên `contentVersion: 2` đạt 0 lỗi 0 cảnh báo — 2026-11-24 · 33cebea
- [x] Nội dung `int-u3` v2 — Tạo `briefs/int-u3.md` & nâng cấp 4 bài (`clothing`, `house`, `emotions`, `hobbies`) lên `contentVersion: 2` đạt 0 lỗi 0 cảnh báo — 2026-11-24 · af76a96
- [x] Nội dung Starter `s1-u2` & `s1-u3` v2 — Tạo 2 brief + 8 bài `picture` (`s1-color-1..s1-size`, `s1-pets..s1-water`) & mở khoá 2 unit trong `units.js` (0 lỗi, 0 cảnh báo) — 2026-11-24 · 7a55d0c
- [x] Nội dung IELTS Reading v2 (Đợt 1) — Đưa `ielts-read-rooftop-farms` vào lộ trình + viết 2 bài học thuật mới (`ielts-read-urban-trees`, `ielts-read-sleep-memory`), phủ đủ 6 dạng `ExamReading` (`ielts-unit-reading-v2`, 0 lỗi 0 cảnh báo) — 2026-11-24 · ab82bd8
- [x] Nội dung `int-u4` v2 — Tạo `briefs/int-u4.md` & nâng cấp 5 bài (`pronouns`, `articles`, `prepositions-place`, `wh-questions`, `numbers-basic`) lên `contentVersion: 2` đạt 0 lỗi 0 cảnh báo — 2026-11-24 · 38b0042
- [x] Nội dung `int-u5` v2 — Tạo `briefs/int-u5.md` & nâng cấp 4 bài (`daily-phrases`, `time-and-date`, `directions`, `money-prices`) lên `contentVersion: 2` đạt 0 lỗi 0 cảnh báo — 2026-11-24 · ed078ea
- [x] Nội dung `int-u6` v2 — Tạo `briefs/int-u6.md` & nâng cấp 5 bài (`at-restaurant`, `at-airport`, `daily-routine`, `food`, `travel`) lên `contentVersion: 2` đạt 0 lỗi 0 cảnh báo — 2026-11-24 · 300f79f
- [x] Nội dung `int-u7` v2 — Tạo `briefs/int-u7.md` & nâng cấp 4 bài (`nature`, `technology`, `shopping`, `health`) lên `contentVersion: 2` đạt 0 lỗi 0 cảnh báo — 2026-11-24 · 0987478
- [x] Nội dung `int-u8` v2 — Tạo `briefs/int-u8.md` & nâng cấp 3 bài (`tenses`, `comparisons`, `communication-skills`) lên `contentVersion: 2` đạt 0 lỗi 0 cảnh báo — 2026-11-24 · e44ff26
- [x] Nội dung `int-u9` v2 — Tạo `briefs/int-u9.md` & nâng cấp 3 bài (`environment`, `media`, `culture`) lên `contentVersion: 2` đạt 0 lỗi 0 cảnh báo — 2026-11-24 · b53adb2
- [x] Nội dung `int-u10` v2 — Tạo `briefs/int-u10.md` & nâng cấp 3 bài (`business`, `science`, `education`) lên `contentVersion: 2` — **hoàn thành 100% lộ trình Trung bình `int-u1..u10` (39/39 bài, 0 lỗi 0 cảnh báo)** — 2026-11-24

---

## Bạn bè & Thưởng mời bạn (`feat/friends`)

> Tài liệu nguồn: [SRS-FRIENDS-v1.1.md](docs/04-design/SRS-FRIENDS-v1.1.md) · [TASK-FRIENDS.md](docs/05-implementation/TASK-FRIENDS.md) · [RPT-FRIENDS-SURVEY.md](docs/05-implementation/RPT-FRIENDS-SURVEY.md) · [REFERRAL-GACHA-TICKET.md](docs/04-design/economy-v2/REFERRAL-GACHA-TICKET.md)

- [x] Bước 0 — Bổ sung tài liệu phân hệ Bạn bè & Thưởng mời bạn, khảo sát mã nguồn và viết `RPT-FRIENDS-SURVEY.md` — 2026-11-25
- [x] Bước 1 — Migration `migrate-friends.sql` (+ runner MySQL 5.5/5.6+), cấu hình `shared/game-config.js`, hàm thuần `shared/friends.js` + test — 2026-11-25
- [x] Bước 2 — OG riêng cho `/i/:code` phía Express, cấu hình Nginx mẫu & thay QR ngoài bằng QR tạo tại client — 2026-11-25
- [x] Bước 3 — Biệt danh, vá redirect OAuth `cowdi_pending_invite`, chống gian lận IP/thiết bị, thưởng mời bạn (+3 Gem, +500 Sữa, mốc vé gacha/danh hiệu) + AT-02..AT-05 — 2026-11-25
- [x] Bước 4 — Hệ thống Bạn bè (tự kết bạn qua thiệp, `friend_code`, lời mời, huỷ, chặn, báo cáo) + `FriendsPage.jsx` + AT-06..AT-07 — 2026-11-25
- [x] Bước 5 — Thăm pet bạn bè (`FriendPetPage.jsx`) & thách đấu bạn bè (không tính league points) + AT-10 — 2026-11-25
- [x] Bước 6 — Bạn bè trên bản đồ lộ trình (`GET /api/friends/path-progress`, `useFriendPositions.js`, UI `LearningPathPage.jsx`, toast vượt qua) + AT-08..AT-09 — 2026-11-25
- [x] Bước 7 — Ghi sự kiện `app_events` (NFR-06), rà payload bảo mật API (AT-11) & hoàn tất kiểm định build/test — 2026-11-25

---

## Pet Director V2 — Điều phối biểu đạt Pet (`feat/pet-director`)

> Tài liệu nguồn: [SDD-PET-DIRECTOR-v1.1.md](docs/04-design/SDD-PET-DIRECTOR-v1.1.md) · [RPT-PET-DIRECTOR-SURVEY.md](docs/05-implementation/RPT-PET-DIRECTOR-SURVEY.md) · [TASK-PET-DIRECTOR.md](docs/05-implementation/TASK-PET-DIRECTOR.md) · [PET-MOTION.md](docs/PET-MOTION.md)

- [x] Bước 0 — Tiếp nhận gói `cowdi-pet-director.zip`, khảo sát mã nguồn (`Pet-motion`, `PictureLesson`, `Zero-Scroll Quiz`, CSS 3 file, Lộ trình + Bạn bè), viết SDD v1.1 + Báo cáo khảo sát + Plan 5 gói A–E — 2026-11-25 · edccdaf
- [x] GĐ1 · Gói A — Lõi `PetDirector` thuần JS (`rules.js`, `storage.js`, `lineSelector.js`, `PetDirector.js`, `common.js`, `index.js`) + `lines.test.mjs` & `pet-director.test.mjs` + thêm vào `npm test` — 2026-11-25 · 6774126
- [x] GĐ1 · Gói B — Mở rộng `PetRig.js` & `PetAvatar.jsx` (`canvasBubble`, chuẩn hoá `tap` cho cả rig duyệt & ảnh tĩnh fallback, sửa text P3) + test `pet-rig.test.mjs` — 2026-11-25 · f7df4d7
- [x] GĐ1 · Gói C — `DirectorContext`, `<PetStage>` (có `compact` giữ Zero-Scroll Quiz), `<PetSpeech>`, `<PetThought>`; tích hợp `LessonDetailPage`, `PictureLesson`, `PracticePage`, `LearningPathPage` (`app_open`); gỡ `CowdiChat` & xoá `.cowdi-chat-*` trên 3 file CSS — 2026-11-25 · c93e950
- [x] GĐ2 · Gói E — Kho câu thoại `cowdi.js` (240+ câu đạt §5.2, chuyển `PAGE_TIPS`) + trung tính hoá `common.js` + `lines.test.mjs` — 2026-11-25 · 7b25f65
- [x] GĐ2 · Gói D — `<PathPet>` + thẻ hành động trên `LearningPathPage`; chuyển `HomePage`, `PetPage`, `DuelPage` sang Director; thêm preview Director trong `StudyPreviewTab`; xoá `CowdiChat.jsx`, `chatMessages`, `getPetMessage` — 2026-11-25 · ee49eba
- [x] Tinh chỉnh UI V2 — Đưa Header/Stepper lên trên, chuyển `<PetStage>` sang bố cục đồng hành `sticky` (cân giữa cụm Flashcard/Nghe/Nói/Quiz/Practice, `.lesson-step-footer` full-width, bỏ banner thừa `"Nói theo Cowdi!"`) — 2026-11-26 · ae761cb, 5278843

---

## Vấn đề đang chặn
| Ngày | GĐ | Vấn đề | Cần ai quyết | Trạng thái |
|---|---|---|---|---|
| | | | | |

## Nhật ký
> Claude Code thêm 1 dòng mỗi khi xong một việc hoặc kết thúc phiên. Mới nhất ở trên cùng.

| Ngày | GĐ | Việc đã làm | Commit | Ghi chú |
|---|---|---|---|---|
| 2026-11-26 | Question QA (Đợt 2 & Merge) | Dọn file trùng `src/data/quiz-bank-extra.js`, cân chỉnh toàn bộ **70 cảnh báo `Q-LEN` và 89 cảnh báo `Q-POS`** trên trọn bộ 44 file bài v2 (`int-u1..u10` + 3 bài IELTS Reading v2 + golden) → **54/54 bài v2 đạt 0 lỗi · 0 cảnh báo**, cập nhật `RPT-QUESTION-AUDIT-2026-11-26.md` và gộp `feat/question-qa` vào `main` | `c10fd5d`, `main` | 188/188 test pass, build + prebuild pass |
| 2026-11-26 | Question QA (Q0–Q6) | Gộp `feat/pet-director` vào `main` (`b04cb1c`), mở `feat/question-qa` hoàn tất Q0–Q6: đưa `STD-QUESTION-QUALITY v1.0` & `GEMINI-QUESTION-QA` vào repo, sửa `PlacementTest` hỗ trợ `audioText`/tự phát/nút nghe chậm/lọc câu nghe hỏng + chặn Pet Director khi onboarding, nâng cấp `quiz-gen.js` lọc nhiễu cùng `category` + gắn `category` & ô màu `swatch` cho 12 bài Starter + test 500 lượt (`shared/quiz-gen.test.js`), tạo `shared/question-rules.js` (14 mã) + `src/data/lexicon/*` + 14 test, thêm `--questions --fail-on-hard` vào `validate-lessons.mjs` & `prebuild`, xuất `RPT-QUESTION-AUDIT-2026-11-26.md`, sửa dứt điểm toàn bộ 29 lỗi cứng trên bài học & `QUIZ_BANK` (**0 lỗi cứng / 2.829 câu**) | `f66a981` → `51bca1f` (`feat/question-qa`) | 188/188 test pass, build + prebuild pass |
| 2026-11-26 | Pet Director UI | Hoàn thiện bố cục đồng hành V2 (`<PetStage>` `sticky` bên trái trên Desktop, cân giữa cụm Flashcard/Nghe/Nói/Quiz/Practice, `.lesson-step-footer` full-width, bỏ banner thừa `"Nói theo Cowdi!"`) và đồng bộ toàn bộ tài liệu SDD v1.1.1 / TASK / LOG / REG / RTM | `ae761cb`, `5278843` | 170/170 test pass, build pass, UAT local OK |
| 2026-11-25 | 4 / Wallet & Sync | Khắc phục triệt để lỗi lệch số dư ví (Nav hiện 961 Sữa, server báo 131 Sữa): chạy an toàn migration bổ sung 4 cột thiếu (`learner_group`, `active_path`, `lesson_scores`, `placement`) trong bảng `user_progress` giải quyết dứt điểm lỗi 500 của API `/api/progress`, gỡ `Math.max` trong `CosmeticsTab`, đồng bộ ví server tức thì khi mua bị từ chối và khi tải Cửa hàng | 5e0057f | 120/120 test pass, build pass |
| 2026-11-25 | 4 / Wallet & Pet | Sửa lỗi thanh toán không trừ Sữa (bỏ Math.max đè ví server, syncWallet chuẩn), sửa lỗi trang bị không lưu (chuẩn hóa instanceId cowdi_1 và đồng bộ DB equip-cosmetic, xóa background-image gradient đè nền pet) | e3ec995 | 120/120 test pass, build pass |
| 2026-11-25 | Fix | Sửa lỗi trắng trang tại /pet (ReferenceError activePetId) và /account (vi phạm thứ tự React Hook), thêm ErrorBoundary bảo vệ giao diện | 2299cf3 | 120/120 test pass, build pass |
| 2026-11-25 | Pet Director A–E | Hoàn thành trọn bộ Pet Director V2 (GĐ1–2, Gói A/B/C/E/D) trên nhánh `feat/pet-director`: lõi thuần JS + 16 test (`rules`, `storage`, `lineSelector`, `PetDirector`), mở rộng `PetRig`/`PetAvatar` (`canvasBubble` + chuẩn hoá `tap` cả ảnh tĩnh), `<PetStage>` (có `compact` giữ Zero-Scroll Quiz), `<PathPet>` + thẻ hành động, 240+ câu thoại `cowdi.js` + `common.js` trung tính, chuyển 7 màn hình sang Director, thêm công tắc preview Director trong `StudyPreviewTab`, gỡ hoàn toàn `CowdiChat.jsx`, `.cowdi-chat-*` (3 file CSS), `chatMessages` & `getPetMessage` | `feat/pet-director` | 170/170 test pass, build pass |
| 2026-11-25 | Pet Director B0 | Khảo sát gói `cowdi-pet-director.zip` đối chiếu mã nguồn & hệ `Pet-motion`, soạn `SDD-PET-DIRECTOR-v1.1.md`, `RPT-PET-DIRECTOR-SURVEY.md`, `TASK-PET-DIRECTOR.md` (Plan 5 gói A–E), lưu mockups và đồng bộ `PET-MOTION.md`, `REG-DOCUMENTS.md`, `LOG-PROGRESS.md`, `RTM-COWDI.md` | — | Chờ PO duyệt Plan trước khi code |
| 2026-11-25 | Bạn bè UX | Bỏ form đặt biệt danh riêng (dùng thẳng tên hiển thị tài khoản), thêm tìm & kết bạn bằng email khớp chính xác (`GET /api/friends/lookup`), thêm máy quét QR trong App (`QrScannerModal` camera + chọn ảnh qua `jsqr`), giữ `?add=CODE` qua OAuth cho người chưa cài App, định dạng ngày VN `dd/mm/yyyy` | `main` | 152/152 test pass, build & deploy.zip pass |
| 2026-11-25 | Bạn bè B1–B7 | Hoàn thiện toàn bộ Phân hệ Bạn bè & Thưởng mời bạn trên nhánh `feat/friends`: migration MySQL 5.5/5.6+, OG `/i/:code` + QR client, biệt danh + chống gian lận + thưởng +3 Gem/+500 Sữa/mốc vé gacha (trần 3/tháng), bạn bè + chặn/báo cáo, thăm pet + thách đấu giao hữu không LP, bạn bè trên bản đồ lộ trình + toast vượt qua, ghi 5 sự kiện `app_events` và kiểm định AT-02..AT-11 | `feat/friends` | 152/152 test pass, build pass |
| 2026-11-25 | Bạn bè B0 | Bổ sung tài liệu Bạn bè & Thưởng mời bạn (`SRS-FRIENDS-v1.1`, `REFERRAL-GACHA-TICKET`, `TASK-FRIENDS`), đăng ký `REG-DOCUMENTS` và viết báo cáo khảo sát `RPT-FRIENDS-SURVEY.md` | `feat/friends` | Khảo sát 7 điểm, không sửa code |
| 2026-11-24 | 4 / Fix | Sửa lỗi không nhận đủ số dư Sữa trong cửa hàng: chạy migration owned_cosmetics, đồng bộ effectiveWallet useUser và chống lệch total_xp | 414d3fe | 120/120 test pass, build pass |
| 2026-11-24 | 4 / UI | Đồng bộ chiều cao nút Mốc học (36px), hiện rõ điều kiện mở và thêm Modal chi tiết mốc học & tiến độ người dùng | 151261f | 120/120 test pass, build pass |
| 2026-11-24 | 4 / UI | Tăng cỡ chữ bộ lọc & phòng thử đồ, hiện đầy đủ nhãn phẩm chất góc trái card (Thường, Hiếm, Sử thi, Mốc học...), nâng phân trang lên 12 card/trang | f8ba703 | 120/120 test pass, build pass |
| 2026-11-24 | Lộ trình / UI | Tinh chỉnh Card ngang cha của Unit cho phép thu gọn/mở rộng nút bài học (accordion), nhớ trạng thái localStorage, thêm thanh tiện ích Thu gọn/Mở rộng tất cả | 873afbc | 120/120 test pass, build pass |
| 2026-11-24 | 4 / UI | Đồng bộ font thanh lọc Cửa hàng chuẩn website, tăng kích thước chữ/số card sản phẩm và kho đồ, thêm phân trang sổ tay 8 món/trang | bccef00 | 120/120 test pass, build pass |
| 2026-11-24 | 4 / UI | Tối ưu UI/UX Cửa hàng siêu gọn gàng: thu gọn PetPreview thành Popup phòng thử đồ `PetDressingModal`, gộp 18 nút lọc thành `CosmeticFilterSheet`, card món đồ compact RPG hạn chế cuộn chuột | 2e01b80 | 120/120 test pass, build pass |
| 2026-11-24 | Wallet / Fix | Khắc phục triệt để lỗi không nhận Sữa trong bài học (race condition sync/refreshWallet) & đấu trường (thiếu cộng total_xp DB và trả ví chuẩn D4) | da7c5f8 | 120/120 test pass, build pass |
| 2026-11-24 | 4 / UI | Sửa lỗi không cộng thưởng Sữa sau khi học / đấu trường (`useUser.jsx` đồng bộ `wallet.milk` tức thì + tự flush progress trước `refreshWallet`) & xoay mặt bò bên trái sang phải (`pet.css` `scaleX(-1)`) | f38de8a | 120/120 test pass, build pass |
| 2026-11-24 | 4 | Mở bán Đồ trang trí thật (19 Nền, 15 Hào quang, 10 nền hệ), bảng owned_cosmetics, ledger mua Sữa/Gem, combo -20%, trang bị/tháo mượt mà | 1276060 | 120/120 test pass, build pass |
| 2026-11-24 | 4 | Chốt quyết định D14: Giá đồ trang trí GĐ4 (Thường 800 Sữa, Hiếm 2 000 Sữa, Sử thi 40 Gem, Huyền thoại 90 Gem, giảm 20% combo) | 00be7f2 | Cập nhật TASK.md và chuẩn bị GĐ4 |
| 2026-11-24 | Nội dung `int-u6..u10` | Hoàn tất cuốn chiếu 5 unit cuối (`int-u6` 5 bài, `int-u7` 4 bài, `int-u8` 3 bài, `int-u9` 3 bài, `int-u10` 3 bài — 18 bài) lên `contentVersion: 2`, khép lại **100% trọn bộ lộ trình Trung bình `int-u1..u10` (39/39 bài, 0 lỗi, 0 cảnh báo)** | `300f79f`, `0987478`, `e44ff26`, `b53adb2` + `int-u10` | 221 bài / 54 unit / 54 bài đạt chuẩn v2 (0 lỗi), 110/110 test pass, build pass |
| 2026-11-24 | Nội dung `int-u4`, `int-u5` | Nâng cấp trọn 5 bài `int-u4` (`pronouns`, `articles`, `prepositions-place`, `wh-questions`, `numbers-basic`) và 4 bài `int-u5` (`daily-phrases`, `time-and-date`, `directions`, `money-prices`) lên `contentVersion: 2` (0 lỗi, 0 cảnh báo) — hoàn tất nửa đầu lộ trình Trung bình `int-u1..u5` | `38b0042`, `ed078ea` | 221 bài / 54 unit / 36 bài đạt chuẩn v2 (0 lỗi), 110/110 test pass, build pass |
| 2026-11-24 | Nội dung v2 Đợt 2 | Hoàn tất tuần tự theo Plan trên `feat/content-v2-wave2`: nâng cấp `int-u2` (4 bài) + `int-u3` (4 bài), mở mới Starter `s1-u2` & `s1-u3` (8 bài `picture`), và đưa unit `ielts-unit-reading-v2` (3 bài IELTS Academic Reading phủ đủ 6 dạng đề) vào lộ trình `ielts` | `33cebea`, `af76a96`, `7a55d0c`, `ab82bd8` | 221 bài / 54 unit / 27 bài đạt chuẩn v2 (0 lỗi), 110/110 test pass, build pass |
| 2026-11-24 | U8 + int-u1 | Xây `ExamReading.jsx` (hoàn tất 10/10 hạng mục UI `U1–U10` — 100% ✓ `check-lesson-ui-compat`), nâng cấp trọn unit `int-u1` (`greetings`, `family`, `colors`, `numbers`) lên `contentVersion: 2` (0 lỗi, 0 cảnh báo), điều chỉnh onboarding người mới hiện kiểm tra đầu vào trước | `1744823`, `b19057a`, `30369fa` | Gộp `main` (`558cd7c`) & push `origin/main` |
| 2026-11-24 | 3-nhóm A–E | Hoàn thành toàn bộ Lộ trình 3 nhóm + Chuẩn nội dung UI v2 (`groups.js`, Unit S1 Starter, `path.js`, 0 bài mồ côi, migration MySQL 5.6+ & `guard-unit-gems.mjs`, `PictureLesson`, `LessonDetailPage` U1–U7/U10, `GroupPicker`, `PlacementTest`, `LearningPathPage`, di trú user cũ) | `feat/learning-groups` | 109/109 test pass, 210 bài / 51 unit, 0 lỗi validator, build pass |
| 2026-11-24 | 3-nhóm B0 | Tích hợp bộ chuẩn nội dung v1.0, SRS 3 cấp, SDD Lộ trình 3 nhóm v2.0, SPMP hợp nhất; vá `reading.js` giữ trường v2, sửa 2 lỗi dữ liệu cũ, gắn `validate-lessons` vào `prebuild` | — | 92/92 test pass, 0 lỗi validator, build pass |
| 2026-11-24 | 3 | Đấu trường game: Sửa HUD máu trực quan (Tôi bên trái, Bot bên phải) + bỏ giới hạn từ, chuyển sang đấu sinh tử tới khi KO | fa30e85 | 86 test pass, build pass |
| 2026-11-24 | 3 | Đồng bộ chữ Cửa hàng (phong cách sổ tay, Patrick Hand/Itim/Mali) + thêm chip Đá 💠 trên HUD mobile & desktop | a732841 | 86 test pass, build pass, screenshots |
| 2026-11-24 | 3 | Sửa 3 lỗi Cửa hàng: PetPreview dùng PetAvatar chuẩn ảnh/rig + bộ chọn pet + nút Quay lại thông minh | 7f5a48b | 85 test pass, build pass, screenshots desktop & mobile |
| 2026-11-24 | 1–3 | Sửa tương thích MySQL < 5.6.5 cho `run-v2-streak-migration.js` (`created_at DATETIME`) + thêm `scripts/package.json` và chạy thành công migration GĐ1–3 trên production | e3f3c36 | Production DB đã di trú xong |
| 2026-11-24 | 3 | Sửa lỗi P0 crash `<BookShell>` cho user mới (`PUT /api/progress` luôn trả ví chuẩn `{ milk, gem, stone, stone_shard }`) | f8baa29 | 83/83 test pass, build pass |
| 2026-11-24 | 1–3 | Gộp `origin/feat/shop-streak` (toàn bộ GĐ1–3) vào `main`, sửa tương thích MySQL 5.6 cho `run-v2-migration.js` / SQL & sửa glob `npm test` | e432864, d57f593, ea9903b | 0 xung đột, 83/83 test pass |
| 2026-11-23 | 3 | Tích hợp bộ icon pet WebP (Attack, Defense, HP, Speed, 4 kỹ năng) cho Chỉ số chiến đấu & Chỉ số gốc | cd17746 | 62 test pass, build pass, screenshots |
| 2026-11-23 | 3 | Thêm nút Shop cạnh icon điện trên thẻ pet & bổ sung 19 nền + 15 hào quang vào tab Trang trí | 39f76ba | 62 test pass, build pass, screenshots |
| 2026-11-23 | 3 | Làm lại UI Cửa hàng theo chuẩn: 3 tab (Giữ nhịp, Trang trí, Kho đồ), danh sách phẳng, 3 bottom sheet (Cách kiếm, Chi tiết, Khế ước), HUD link | 7340b95 | 62 test pass, build pass, screenshots |
| 2026-11-23 | 3 | Hoàn thành GĐ3: Cửa hàng Giữ nhịp (Khăn giữ lửa, Vé quay lại, Khế ước 7 ngày, Đồng hồ Cowdi, streak server-side theo múi giờ, chốt D13) | 6adecd0 | 61 test pass, build pass |
| 2026-11-23 | 3 | Bỏ hẳn Coins, thay bằng Sữa (x3) & Gem, migration DB, HUD 2 chip (Sữa/Gem), cập nhật Lộ trình, Cửa hàng & Bài học | ac3b700 | 53 test pass, build pass |
| 2026-11-23 | 2 | Hoàn thành GĐ2: Mô phỏng 6 kịch bản cân bằng, xuất 6 CSV & BALANCE-REPORT-v2.md, cập nhật tài liệu tương khắc & 3 test hồi quy | 55841d7 | 48 test pass, build pass |
| 2026-11-23 | 1 | Hoàn thành GĐ1: Ledger server, ví v2, tiến hoá API, battle engine seed & duel v2, UI PetPage/AccountPage/CollectionPage | 327d136 | 45 test pass, build pass |
| 2026-11-23 | 1 | Cập nhật game-config.js: thêm stone_shard, hằng số D2/D3, lý do ledger mới | e15401f | 45 test pass |
| 2026-11-23 | 0 | Chốt D9 (đánh đủ 10 câu), D10 (đá dùng chung), D11 (unit 100%); hoàn thành GĐ0 | e15401f | Nhánh feat/economy-battle-v2 |
| 2026-11-23 | 0 | Cập nhật REG-DOCUMENTS.md: đăng ký quy trình, prompt, TASK.md và các đề xuất economy-v2 | afc4f52 | Đã cập nhật sổ đăng ký |
| 2026-11-23 | 0 | Cập nhật ECONOMY-BATTLE-V2-IMPLEMENTATION.md và SDD-ECONOMY-BATTLE-v2.1.md theo D2, D3, stone_shard, shop roadmap | afc4f52 | Đồng bộ tài liệu thiết kế v2 |
| 2026-11-23 | 0 | Thêm cấu hình Antigravity (rule + 5 skill) | afc4f52 | Đã commit git |
| 2026-11-23 | 0 | Tạo TASK.md, quy trình, prompt; chép đề xuất vào `docs/04-design/economy-v2/` | afc4f52 | Đã commit git |
