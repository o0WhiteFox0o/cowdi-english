# Cowdi English — Hướng dẫn triển khai Kinh tế & Chiến đấu v2.1

> **Dành cho Claude Code.** Tài liệu này là nguồn sự thật (source of truth) để viết lại hệ thống tiền tệ, tiến hoá và chiến đấu pet. Chốt ngày 23/11/2026 với Sonny (chủ dự án). **v2.1** (23/11/2026): đã đối chiếu với code thật ở commit `4a62536`, bổ sung mục **0.5**. Mục 0.5 thắng các mục khác nếu mâu thuẫn.
> Đặt file này tại `docs/04-design/SDD-ECONOMY-BATTLE-v2.1.md`, kèm `docs/00-general/GLO-ECONOMY-BATTLE-VI-EN.md` (bảng thuật ngữ Việt–Anh).
> Tài liệu nguồn (chỉ để tham khảo, **file này thắng nếu mâu thuẫn**): Đặc tả hệ thống chiến đấu pet v2 (claude.ai), bảng "Cowdi — Cân bằng hệ tương khắc" (claude.ai — **đã dịch sang tiếng Anh nhưng vẫn dùng công thức cũ**, đừng lấy số từ đó), `SDD-GAME-PET-v1.0.md`, `SDD-XP-REDESIGN-v1.0.md`, `SDD-DUEL-BATTLE-v1.0.md` (đều đã lỗi thời ở các phần liên quan).

---

## 0.5 Đọc trước: những điểm code thực tế khác giả định của v2

Kiểm repo `o0WhiteFox0o/cowdi-english` commit `4a62536` (21/11/2026). Mỗi mục dưới đây là việc **bắt buộc** thêm vào phase tương ứng.

### 0.5.1 Khoá (key) trong code dùng tiếng Anh, nhãn UI dùng tiếng Việt
Bảng cân bằng trên claude.ai đã đổi toàn bộ sang tiếng Anh. Để code, bảng tính và bảng thuật ngữ dùng **một bộ từ**, mọi key trong `shared/game-config.js` là tiếng Anh; chữ hiển thị (tiếng Việt) để trong config dưới dạng `labelVi`. Không hard-code chữ trong component.

| Loại | Key code | Nhãn UI (labelVi) |
|---|---|---|
| Hệ | `metal` `wood` `water` `fire` `earth` `dark` `light` `neutral` `wind` `thunder` | Kim, Mộc, Thủy, Hỏa, Thổ, Bóng tối, Ánh sáng, Vô, Phong, Lôi |
| Nhóm | `farm` `herb` `hunter` `sea` `sky` `dragon` `spirit` | Nông trại, Thảo mộc, Thú săn, Biển, Bầu trời, Rồng, Linh thể |
| Kỹ năng nhóm | `wellFed` `deepRoots` `huntersInstinct` `waveRider` `highGround` `dragonBlood` `spiritAura` | No đủ, Bám rễ, Bản năng săn, Lướt sóng, Tầm cao, Long huyết, Linh khí |
| Độ hiếm (thiết kế) | `common` `rare` `event` `epic` `legendary` (`starter` → `common`) | Thường, Hiếm, Sự kiện, Sử thi, Huyền thoại |
| Tiền tệ | `milk` `gem` `stone` | Sữa 🥛, Gem 💎, Đá nguyên tố |
| Chỉ số | `hp` `atk` `def` `agi` `critMult` | HP, Tấn công, Phòng thủ, Nhanh nhẹn, Hệ số crit |

**Lưu ý trùng tên với 6 hệ cũ:** code cũ dùng `fire` `water` `nature` `earth` `cosmic` `neutral`. Bốn key `fire` `water` `earth` `neutral` giữ nguyên nghĩa; `nature` và `cosmic` **bị xoá**, mỗi pet lấy hệ mới theo bảng 5.7. Sau Phase 2, `grep -rn "'nature'\|'cosmic'" src server` phải ra rỗng. Các bảng 5.5–5.7 bên dưới ghi tên tiếng Việt; tra key ở bảng trên hoặc trong `GLO-ECONOMY-BATTLE-VI-EN.md`.

### 0.5.2 Cấp tiến hoá đang được tính lại từ XP ở khắp nơi
`getPetEvolution(speciesId, totalXpEarned)` đang được gọi ở **13 file client** (CowdiChat, BookShell, HomePage, PetPage, CollectionPage, DuelPage, MiniGamePage, LeaderboardPage, StudentRankingPage, LearningPathPage, ProgressPage, InviteSheet, usePet). Server cũng tự tính lại: `server/utils/pet-icon.js` (`evolutionStageFor(xp)`). Nguy hiểm nhất là `updateActivePet` trong `src/hooks/usePet.jsx` (~dòng 254–259): **mỗi lần pet được cập nhật, nó gán lại `evolution` theo XP**, đè lên mọi kết quả tiến hoá từ server.
- Thay bằng `getEvolutionInfo(speciesId, stage)`: nhận `pet.evolution` (0–4), trả tên/ảnh trong `evolutions[stage]`. Sửa **mọi** chỗ gọi, kể cả `pet-icon.js` (đọc `pet.evolution`).
- Xoá khối "Check evolution" trong `updateActivePet` và toàn bộ `feedXPToPet`.
- Hàm merge local/server trong `usePet.jsx` (~dòng 91) đang lấy `Math.max(evolution)`: đổi thành **giá trị của server luôn thắng**.
- `PUT /api/pet-data` lưu nguyên khối JSON `pet_data`: server phải đọc bản cũ rồi **ghi đè `collection[id].evolution` bằng giá trị đã lưu** trước khi lưu, để client không tự nâng cấp.
- Tiêu chí kiểm: `grep -rn "totalXpEarned" src server` chỉ còn ở chỗ hiển thị lịch sử, không còn ở chỗ quyết định cấp.

### 0.5.3 Bài học và luyện tập hiện KHÔNG cộng điểm kỹ năng cho pet
Hiện tại chỉ `MiniGamePage.jsx` gọi `onQuizComplete` → `addSkillPoints`, và luôn truyền cứng `'vocab'` hoặc `'sentences'`. `LessonDetailPage.jsx` và `PracticePage.jsx` gọi `addSkillXP` (điểm của **người chơi**, sắp bỏ). Bài học chỉ cho pet điểm qua `addAllSkillPoints(5)`.
→ Nếu chỉ làm đúng 3.4 (bỏ +5) thì **pet sẽ gần như không nhận điểm từ bài học**: 0 điểm Nghe/Nói, và không ai lên được C2.
Phase 3 phải làm đủ ba việc:
1. Ở mọi chỗ đang gọi `addSkillXP(skill, xp)` (LessonDetailPage ~dòng 832, 850; PracticePage ~dòng 719–1082), thay bằng `onQuizComplete(category, correct, total)` với **category thật của dạng câu** (theo `QUIZ_TO_SKILL`), không truyền XP.
2. MiniGamePage: truyền category thật của từng game (ví dụ `speedRound`, `wordGuess`) thay vì cứng `'vocab'`. Việc này cũng giải quyết một phần chuyện thiếu nguồn điểm Nói (3.5).
3. Learning path checkpoint và Duel cũng gọi `onQuizComplete` cho pet đang chọn.
Thêm bảng "hoạt động → kỹ năng → điểm/câu" vào mô tả PR. Kiểm tra cảm giác: người chơi Thường (1 bài/ngày) phải được khoảng **20 điểm kỹ năng/ngày**, đúng giả định ở trang Economy của bảng cân bằng.

### 0.5.4 Sữa: ví do client ghi, nếu làm như v2 sẽ bị "hoàn tiền" khi tiến hoá
`availableXP` đang được client gửi lên qua `PUT /api/progress` và server lưu nguyên giá trị. Nếu API evolve trừ `available_xp`, lần đồng bộ kế tiếp client sẽ gửi lại số cũ, và **Sữa đã tiêu sẽ quay lại**.
**Mặc định v2.1 (thay mục 2.1 về cách lưu):**
- Mọi khoản tiêu Sữa ghi vào ledger (`currency='milk'`, số âm).
- `milk = total_xp − (tổng Sữa đã tiêu trong ledger) − legacy_spent`. Lúc migrate: `legacy_spent = total_xp − available_xp` (ghi một dòng ledger `reason='migration'`).
- `PUT /api/progress` **bỏ qua `availableXP`** từ client. `GET /api/progress` và `GET /api/wallet` trả `availableXP`/`milk` do server tính, để UI cũ vẫn đọc được.
- `total_xp` vẫn do client báo (rủi ro cũ, ghi trong PR như 6.3).

### 0.5.5 Gem/Đá: chưa có endpoint "hoàn thành bài", và danh sách bài do client gửi
Bài đã hoàn thành đi lên qua `PUT /api/progress` (`completedLessons`). **Mặc định:**
- Thêm `shared/lesson-ids.json`, sinh từ `src/data/lessons*` bằng script `scripts/build-lesson-ids.mjs`, chạy trong `npm run build`.
- Trong `PUT /api/progress` (hoặc trong endpoint mới ở 6.2), server lọc `completedLessons` chỉ giữ ID có trong danh sách, đếm `n`, rồi cấp đủ mốc còn thiếu: Gem `floor(n / GEM_PER_NEW_LESSONS)`, Đá `floor(n / STONE_PER_NEW_LESSONS)`.
- Ledger `reason='lesson_milestone'`, `ref_id='gem:<k>'` hoặc `'stone:<k>'` (k là số thứ tự mốc). Nhờ khoá `uq_grant`, gửi lại hay chạy migration nhiều lần đều không cấp trùng.
- Trần tự nhiên: tối đa 103 Gem và 20 Đá từ bài học, kể cả khi bị gian lận. Ghi rõ trong PR.

### 0.5.6 Duel: ba lỗi/giới hạn cần xử lý ở Phase 5
1. `POST /api/duel` **không đọc `questionTimes`** (client có gửi, xem DuelPage ~dòng 449), nên `challenger_question_times` luôn rỗng. Hệ quả với v2: người tạo trận **không bao giờ được crit vì trả lời nhanh**. Sửa: lưu cột này khi tạo trận.
2. Số câu đang cho chọn 10/20/30 (`QUESTION_COUNT_OPTIONS`), trong khi cân bằng v2 tính cho 10 câu. **[MỞ] mặc định:** trận mới cố định 10 câu (`DUEL_QUESTIONS = 10` trong config; server từ chối số khác; ẩn lựa chọn trên UI). Engine vẫn viết tổng quát theo N câu.
3. Nội dung quiz (kể cả đáp án đúng) do challenger gửi lên. Đây là rủi ro có sẵn, chỉ ghi vào PR, không sửa đợt này.
Trận đang `pending` từ trước v2 (không có snapshot): chấm theo luật cũ, hoặc snapshot pet hiện tại lúc join. Mặc định: **snapshot lúc join cho cả hai bên**, ghi chú trong PR.

### 0.5.7 Triển khai và test
- `deploy.ps1` hiện chỉ đóng gói `dist-prod/` + `server/`. Nếu không sửa, `shared/` **không lên server** và server sẽ lỗi import khi chạy production. Thêm bước copy `shared/` vào thư mục deploy, cùng cấp với `server/`, để `server/` import được `../shared/...`. Nội dung `shared/` không có bí mật (client cũng bundle nó).
- Repo chưa có test runner. Dùng `node --test` (không cần thêm dependency); thêm script `"test": "node --test shared/"` vào `package.json` gốc.
- Đã kiểm: độ hiếm 22 pet trong `src/data/pets.js` khớp bảng 5.7. Ba ví dụ ở 4.4 đã tính tay bằng công thức 4.1, khớp đến 0.1.

### 0.5.8 Bảng cân bằng (claude.ai) sau khi dịch
Tên trang: Glossary, Simulator, Element Matchups, Pet Matchups, Rarity, Economy, Parameters, Evolution, Elements, Counter Chart, Pets, Groups. Ký hiệu khắc trong trang Counter Chart: `S` = khắc, `W` = bị khắc. Bảng vẫn dùng **công thức v1** (cộng theo cấp kỹ năng, né/crit tuyệt đối). Chỉ dùng để tra tên và dữ liệu tĩnh (hệ/nhóm/độ hiếm từng pet, `evolveReq`, chi phí tiến hoá), **không** dùng để kiểm số trận đấu.

---

## 0. Cách làm việc

1. Đọc hết file này trước khi sửa code. Làm theo thứ tự các **Phase** ở mục 9; mỗi phase là một nhánh/PR riêng, build và test xanh rồi mới sang phase sau.
2. **Mọi hằng số cân bằng nằm trong một file cấu hình dùng chung** `shared/game-config.js` (ESM, import được từ cả `src/` (Vite) và `server/` (Node ESM, `"type": "module"`)). Không hard-code số trong logic.
3. Logic tính chỉ số và trận đấu là **hàm thuần** (pure functions) trong `shared/battle-engine.js`, dùng chung client/server. Server là nơi quyết định kết quả; client chỉ hiển thị.
4. Chỗ nào ghi **[MỞ]** là chưa chốt: làm theo **mặc định** ghi kèm, để giá trị trong config, và liệt kê lại trong mô tả PR.
5. Không đụng Shop (`ShopPage.jsx`, `SHOP_ITEMS`, coins) — **Shop tạm gác** (xem mục 7).
6. Commit message và PR viết tiếng Việt hoặc tiếng Anh đều được; giải thích nguyên nhân + ảnh hưởng.

---

## 1. Tóm tắt các quyết định

| # | Quyết định |
|---|---|
| 1 | Chỉ còn **2 loại tiền**: **Sữa** (đổi tên từ XP) và **Gem** (thay Coins về lâu dài). Thêm vật phẩm **Đá nguyên tố**. |
| 2 | **Gem** chỉ nhận khi đạt mốc bài học (hoặc nạp tiền — chưa làm). **Đá nguyên tố** nhận khi hoàn thành bài học. |
| 3 | Tiến hoá **không còn tự động** theo XP. Người chơi bấm "Tiến hoá" khi đủ Sữa + Gem + Đá + điều kiện điểm kỹ năng; hệ thống trừ tài nguyên. |
| 4 | **Không có chỉ số thân thiết.** Gắn bó = điểm Nghe/Nói/Đọc/Viết **của pet** (`pet.skills`), tích khi người chơi học với pet đó. |
| 5 | Không giới hạn điểm kỹ năng theo ngày (học nhiều được thưởng nhiều). |
| 6 | Từ C3 trở lên, **mỗi pet có mức điểm tối thiểu riêng cho từng kỹ năng** (mục 3.3). |
| 7 | Chỉ số chiến đấu tính **theo điểm kỹ năng, không theo cấp, không trần, giảm dần theo căn bậc hai**. Cấp 1–10 (`getSkillLevel`) chỉ để hiển thị. |
| 8 | **Nhanh nhẹn tính tương đối**: né và crit của hai bên triệt tiêu nhau; chỉ phần cộng phẳng từ hệ/nhóm không bị triệt tiêu. Bỏ trần né 25% và crit 40%. |
| 9 | **Nói** tăng cả Tấn công lẫn hệ số sát thương crit (khuyến khích luyện nói). |
| 10 | Hệ **Lôi** crit cộng sẵn hạ từ 27% → **15%**. |
| 11 | Nhóm "Trời" đổi tên **"Bầu trời"**; Tầm cao hạ từ 45–60% → **bỏ qua 20% phòng thủ**. |
| 12 | **Cùng nhóm thì cùng giá trị kỹ năng nhóm.** |
| 13 | Thắng thua theo **% HP còn lại**, tính trên **server**. |
| 14 | Mục tiêu nhịp chơi: đa số người chơi thường ở **C3**; C4–C5 cho người học rất nhiều hoặc nạp tiền. |

---

## 2. Tiền tệ & vật phẩm

### 2.1 Sữa (Milk) — đổi tên từ XP
- Ví tiêu được: `availableXP` → đổi tên khái niệm thành **Sữa** (`milk`). **v2.1:** số dư Sữa do server tính từ `total_xp` trừ ledger (xem 0.5.4); client không còn ghi `availableXP`. UI hiển thị "Sữa 🥛".
- `totalXP` (lifetime) **giữ nguyên** cho cấp người chơi, leaderboard và điều kiện mở khoá pet (`unlockCondition.type === 'xp'`). Không gọi là Sữa trên UI chỗ này (gọi "Tổng điểm học" hoặc giữ "XP").
- Nguồn Sữa: giữ toàn bộ quy tắc `addXP` hiện tại (bài học lần đầu 10/câu + 60 (+30 trọn điểm), làm lại 1/3; mini-game trần 120/ngày, vượt trần 20%; practice, review, duel…). `addXP(n)` cộng cả `totalXP` và ví Sữa như hiện nay.
- Chỗ tiêu duy nhất: **tiến hoá pet** (mục 3). Bỏ card "Cho Pet ăn XP" (+50/+200/+500, `feedXPToPet`) — thay bằng nút **Tiến hoá**.

### 2.2 Gem
- Mới. Số dư lưu trên **server** (mục 6).
- Nguồn (mặc định, để trong config):
  - `GEM_PER_NEW_LESSONS = 2` → **1 Gem mỗi 2 bài học hoàn thành lần đầu** (đếm `completedLessons`, chỉ lần đầu). **[MỞ]** quy tắc chính thức; thêm thưởng bài kiểm tra cuối unit nếu Sonny chốt.
  - Nạp tiền: **chưa làm**, nhưng ledger phải có `reason = 'purchase'` sẵn.
- Chỗ tiêu: tiến hoá C2→C3 trở lên.

### 2.3 Đá nguyên tố (Element Stone)
- Mới, lưu server. Mặc định **1 loại dùng chung** (**[MỞ]** có tách theo 10 hệ không).
- Nguồn: `STONE_PER_NEW_LESSONS = 10` → **1 đá mỗi 10 bài học hoàn thành lần đầu**.
- **[MỞ]** Gem nạp tiền có được thay đá không → mặc định **không**.

### 2.4 Coins
- **Không sửa trong đợt này** (Shop tạm gác). Không thêm cách dùng coins mới. Không cho coins mua Sữa/Gem/Đá.

---

## 3. Tiến hoá

### 3.1 Ánh xạ cấp
C1–C5 = `pet.evolution` 0–4 (Trứng/Hạt mầm → Baby → Junior → Super → Legendary). Giữ tên/ảnh `evolutions[]` trong `PET_REGISTRY`, **bỏ trường `xp`** khỏi điều kiện (hoặc để lại nhưng không dùng). `getPetEvolution(speciesId, totalXP)` không còn quyết định cấp; cấp lưu trực tiếp ở `pet.evolution` và chỉ thay đổi qua API tiến hoá.

### 3.2 Chi phí

| Bước | Sữa | Gem | Đá | Điều kiện điểm kỹ năng của pet |
|---|---|---|---|---|
| C1 → C2 | 500 | 0 | 0 | Tổng 4 kỹ năng ≥ 60 |
| C2 → C3 | 1 500 | 1 | 0 | Tổng 4 kỹ năng ≥ 160 |
| C3 → C4 | 5 000 | 25 | 1 | Từng kỹ năng ≥ mức riêng của pet (3.3, cột C4) |
| C4 → C5 | 20 000 | 50 | 10 | Từng kỹ năng ≥ mức riêng của pet (3.3, cột C5) |

Tài nguyên **trừ khi tiến hoá** (Sữa/Gem/Đá). Điểm kỹ năng **không bị trừ** (chỉ là điều kiện).

### 3.3 Điểm kỹ năng tối thiểu từng pet (C3→C4 và C4→C5)
Thứ tự **Nghe / Nói / Đọc / Viết**. Lưu trong `PET_REGISTRY[id].evolveReq = { c4: [n,s,r,w], c5: [n,s,r,w] }`.

| ID | Pet | Lên C4 | Lên C5 |
|---|---|---|---|
| cowdi | Cowdi | 250 / 60 / 150 / 60 | 600 / 150 / 400 / 150 |
| foxie | Foxie | 60 / 250 / 60 / 150 | 150 / 600 / 150 / 400 |
| pingu | Pingu | 150 / 60 / 60 / 250 | 400 / 150 / 150 / 600 |
| leafy | Leafy | 150 / 60 / 250 / 60 | 400 / 150 / 600 / 150 |
| sparky | Sparky | 60 / 250 / 60 / 150 | 150 / 600 / 150 / 400 |
| mimi | Mimi | 60 / 60 / 150 / 250 | 150 / 150 / 400 / 600 |
| owlbert | Owlbert | 60 / 60 / 250 / 150 | 150 / 150 / 600 / 400 |
| flippy | Flippy | 250 / 60 / 60 / 150 | 600 / 150 / 150 / 400 |
| leo | Leo | 150 / 250 / 60 / 60 | 400 / 600 / 150 / 150 |
| bamboo | Bamboo | 250 / 60 / 150 / 60 | 600 / 150 / 400 / 150 |
| storm | Storm | 60 / 150 / 60 / 250 | 150 / 400 / 150 / 600 |
| shadow | Shadow | 60 / 150 / 60 / 250 | 150 / 400 / 150 / 600 |
| prisma | Prisma | 250 / 60 / 150 / 60 | 600 / 150 / 400 / 150 |
| draco | Draco | 150 / 250 / 60 / 60 | 400 / 600 / 150 / 150 |
| pumpkin | Pumpkin | 60 / 60 / 150 / 250 | 150 / 150 / 400 / 600 |
| monk | Monk | 150 / 60 / 250 / 60 | 400 / 150 / 600 / 150 |
| ginseng | Ginseng | 250 / 60 / 150 / 60 | 600 / 150 / 400 / 150 |
| paddy | Paddy | 250 / 60 / 150 / 60 | 600 / 150 / 400 / 150 |
| sprout | Sprout | 150 / 60 / 60 / 250 | 400 / 150 / 150 / 600 |
| mushroom | Nấm Rơm | 150 / 60 / 250 / 60 | 400 / 150 / 600 / 150 |
| radish | Củ Cải Trắng | 150 / 60 / 250 / 60 | 400 / 150 / 600 / 150 |
| bun | Bánh Bao | 150 / 250 / 60 / 60 | 400 / 600 / 150 / 150 |

### 3.4 Điểm kỹ năng của pet — sửa cách cộng
- **Bỏ** `addAllSkillPoints(5)` trong `onLessonComplete` (`src/hooks/usePet.jsx`). Lý do: cộng đều 5 điểm cho cả 4 kỹ năng mỗi bài làm mọi pet đủ mọi điều kiện sau ~40 bài → điều kiện riêng theo pet vô nghĩa. Năng lượng (+30 energy) khi xong bài thì giữ.
- Giữ `addSkillPoints(quizCategory, correct, total)`: mỗi câu đúng +1 vào kỹ năng theo `QUIZ_TO_SKILL`, trọn điểm +5; dạng `mixed`/không map thì chia đều.
- Đảm bảo **mọi** chỗ làm quiz (lesson, practice, review, mini-game, learning path checkpoint, duel) đều gọi `addSkillPoints` cho **pet đang chọn** với đúng category.
- **Bỏ** XP pet thụ động: không cộng `totalXpEarned` trong `addSkillPoints`/`addAllSkillPoints` nữa (trường có thể giữ để hiển thị lịch sử, không dùng cho tiến hoá).
- **Bỏ** `userData.skillXP` / `addSkillXP` / cột `skill_xp` khỏi mọi tính toán (có thể giữ dữ liệu, không đọc). Chỉ số chiến đấu lấy từ `pet.skills`.
- Điểm kỹ năng **không trần**.

### 3.5 Thiếu nguồn điểm Nói (ghi chú, không chặn phase)
Hiện chỉ Speed Round, Word Guess và luyện Nói cộng điểm Nói (và trên thực tế mini-game còn truyền cứng `'vocab'`, xem 0.5.3). Kiểm tra `QUIZ_TO_SKILL` và các trang practice; báo lại trong PR danh sách hoạt động cộng từng kỹ năng để Sonny bổ sung nội dung Nói.

---

## 4. Chỉ số pet

### 4.1 Công thức
```
HP    = round( (HP_cấp  + 4.9  × √Nghe + HP_hiếm ) × (1 + %HP_hệ ) )
ATK   = round1((ATK_cấp + 0.5  × √Nói  + ATK_hiếm) × (1 + %ATK_hệ))
DEF   = 2.45 × √Đọc + DEF_hệ
AGI   = 1.47 × √Viết + AGI_hệ
CRITX = (hệ Kim ? 1.7 : 1.4) + 0.012 × √Nói + (nhóm Rồng & đã mở kỹ năng ? 0.1 : 0)
```
`√` = căn bậc hai của điểm kỹ năng thô (số nguyên ≥ 0). Không có trần.

### 4.2 Gốc theo cấp tiến hoá
| Cấp | HP | ATK |
|---|---|---|
| C1 | 100 | 10 |
| C2 | 120 | 12 |
| C3 | 150 | 15 |
| C4 | 180 | 18 |
| C5 | 200 | 20 |
DEF và AGI gốc = 0.

### 4.3 Độ hiếm
Ánh xạ code → thiết kế: `starter`, `common` → Thường · `rare` → Hiếm · `event` → Sự kiện · `epic` → Sử thi · `legendary` → Huyền thoại.

| Độ hiếm | + HP | + ATK | Mở kỹ năng nhóm từ |
|---|---|---|---|
| Thường | 0 | 0 | C3 |
| Hiếm | 8 | 1 | C2 |
| Sự kiện | 8 | 1 | C2 |
| Sử thi | 15 | 2 | C1 |
| Huyền thoại | 25 | 3 | C1 |

Bỏ `RARITY_BONUS` nhân 1.0–1.3 trong `calculatePowerScore`. Power score mới (cho leaderboard) = gợi ý: `round(HP/10 + ATK + DEF/2 + AGI/2)` theo chỉ số mục 4.1 — ghi rõ trong PR, dễ đổi.

### 4.4 Ví dụ kiểm thử (phải khớp ±0.1)
| Trường hợp | HP | ATK | DEF | AGI | CRITX |
|---|---|---|---|---|---|
| Cowdi C1 (Vô, Thường), skills 0/0/0/0 | 113 | 10.4 | 4.0 | 3.0 | 1.4 |
| Leafy C4 (Mộc, Thường), skills 150/60/250/60 | 271 | 21.9 | 38.7 | 11.4 | 1.493 |
| Storm C5 (Lôi, Sử thi), skills 150/400/150/600 | 275 | 34.2 | 30.0 | 41.0 | 1.64 |

---

## 5. Chiến đấu

### 5.1 Luật chung
- Trận = 10 câu quiz. Mỗi câu **đúng** = 1 đòn đánh vào đối thủ. Thứ tự xử lý: lần lượt câu 1→10; trong mỗi câu, bên thách đấu (challenger) đánh trước, rồi đến bên nhận (opponent). Ghi lại để client phát lại animation.
- Sau câu 10, bên còn **% HP** cao hơn thắng. Bằng nhau → tổng thời gian trả lời ít hơn thắng (như hiện tại).
- **[MỞ]** Pet về 0 HP giữa trận: mặc định `STOP_AT_ZERO = false` — HP không xuống dưới 0, vẫn chấm hết 10 câu (để không phạt người trả lời sau). Để flag trong config.
- Mọi sát thương là **số nguyên**.
- Ghép trận: chênh tối đa **1 cấp tiến hoá**.
- Lưu **ảnh chụp chỉ số pet** (snapshot: speciesId, evolution, skills, element, group, rarity) của challenger lúc tạo trận; opponent snapshot lúc tham gia.

### 5.2 Công thức đòn
```
DEF_hiệu_lực = DEF_thủ × (1 − ignore)              // ignore = 0.20 nếu bên đánh thuộc nhóm Bầu trời và đã mở kỹ năng, ngược lại 0
Đòn thường   = round( ATK × Khắc × 100 / (100 + DEF_hiệu_lực) )
Đòn crit     = round( Đòn thường × CRITX )
  // bên bị đánh hệ Thổ: Đòn crit = Đòn thường + round((Đòn crit − Đòn thường) × 0.5)
Khắc         = 1.2 khi khắc, 0.8 khi bị khắc, 1 còn lại
```

### 5.3 Crit & né (tương đối)
```
P_né   = max(0, (AGI_thủ − AGI_công) × 0.005) + né_phẳng_thủ        // né_phẳng: nhóm Biển 0.03 (nếu đã mở)
P_crit = max(0, (AGI_công − AGI_thủ) × 0.005) + crit_phẳng_hệ_công  // xem bảng 5.5
```
- **Trả lời nhanh (< 3 giây) → luôn crit**, không bị triệt tiêu (vẫn có thể bị né).
- Hệ **Phong**: thêm 2 câu đúng (2 câu đúng đầu tiên chưa nhanh) được tính là trả lời nhanh.
- Không trần cho P_né, P_crit (kẹp vào [0, 1] khi gieo xác suất).
- Ngẫu nhiên dùng **RNG có seed** (seed = challengeId + câu + bên) để server tính lại được và có thể replay.

### 5.4 Vòng khắc
Ngũ hành: **Kim → Mộc → Thổ → Thủy → Hỏa → Kim** (A → B: A khắc B).
**Ánh sáng ⇄ Bóng tối**, **Phong ⇄ Lôi** khắc lẫn nhau (cả hai chiều ×1.2).
**Vô** không khắc, không bị khắc.

### 5.5 10 hệ
| Hệ | key | %HP | %ATK | +DEF | +AGI | +Crit phẳng | Hiệu ứng |
|---|---|---|---|---|---|---|---|
| Kim | metal | – | 12% | – | – | 8% | CRITX gốc 1.7 thay 1.4 |
| Mộc | wood | 13% | – | – | – | – | Hồi 1% HP tối đa mỗi câu đúng |
| Thủy | water | 12% | – | – | 6 | – | Hồi 5% HP tối đa mỗi lần né |
| Hỏa | fire | – | 11% | – | – | 3% | Mỗi đòn trúng gây bỏng 1% HP tối đa của đối thủ/lượt trong 2 lượt |
| Thổ | earth | 5% | – | 12 | – | – | Giảm 50% phần sát thương cộng thêm khi bị crit |
| Bóng tối | dark | – | 8% | – | 9 | 6% | Hút 10% sát thương gây ra |
| Ánh sáng | light | 3% | – | 4 | – | – | Lá chắn chặn đòn trúng đầu tiên |
| Vô | neutral | 13% | 4% | 4 | 3 | – | Không khắc, không bị khắc |
| Phong | wind | 3% | – | – | 14 | 8% | +2 câu tính là trả lời nhanh |
| Lôi | thunder | – | 7% | – | 5 | **15%** | Crit gây choáng: đối thủ không crit được ở đòn kế tiếp của họ |

"Lượt" = mỗi câu (1 câu = 1 lượt cho cả hai bên).

### 5.6 7 nhóm (giá trị chung cả nhóm)
| Nhóm | key | Kỹ năng | Hiệu ứng | Giá trị |
|---|---|---|---|---|
| Nông trại | farm | No đủ | Từ câu đúng thứ 3 liên tiếp trở đi, mỗi câu đúng hồi % HP tối đa | 2% |
| Thảo mộc | herb | Bám rễ | Khi HP < 50%, giảm sát thương nhận | 30% |
| Thú săn | hunter | Bản năng săn | Sau chuỗi 3 câu đúng liên tiếp, +% ATK đến hết trận | 10% |
| Biển | sea | Lướt sóng | +né phẳng; né được thì câu đúng kế tiếp chắc chắn crit | 3% |
| Bầu trời | sky | Tầm cao | Đòn đánh bỏ qua % phòng thủ đối thủ | 20% |
| Rồng | dragon | Long huyết | CRITX +0.1; crit làm hiệu ứng hệ (bỏng, hồi, hút…) mạnh gấp đôi ở đòn đó | +0.1 |
| Linh thể | spirit | Linh khí | Miễn hiệu ứng xấu đầu tiên (bỏng, choáng); giảm sát thương nhận | 4% |

Kỹ năng nhóm chỉ có hiệu lực khi pet đã đạt cấp mở theo độ hiếm (4.3).

### 5.7 Hệ & nhóm từng pet (thay 6 hệ cũ)
| ID | Hệ | Nhóm | Độ hiếm (code) |
|---|---|---|---|
| cowdi | Vô | Nông trại | starter |
| bamboo | Vô | Nông trại | epic |
| bun | Kim | Nông trại | epic |
| paddy | Mộc | Thảo mộc | common |
| sprout | Mộc | Thảo mộc | rare |
| mushroom | Thổ | Thảo mộc | rare |
| radish | Thổ | Thảo mộc | rare |
| ginseng | Thổ | Thảo mộc | epic |
| foxie | Hỏa | Thú săn | common |
| leo | Kim | Thú săn | epic |
| shadow | Bóng tối | Thú săn | epic |
| pingu | Thủy | Biển | common |
| leafy | Mộc | Biển | common |
| flippy | Thủy | Biển | rare |
| mimi | Phong | Bầu trời | rare |
| owlbert | Phong | Bầu trời | rare |
| storm | Lôi | Bầu trời | epic |
| sparky | Hỏa | Rồng | rare |
| draco | Hỏa | Rồng | legendary |
| pumpkin | Bóng tối | Linh thể | event |
| monk | Ánh sáng | Linh thể | event |
| prisma | Ánh sáng | Linh thể | legendary |

Kiểm tra lại độ hiếm từng pet trong `PET_REGISTRY` khớp cột cuối; nếu lệch, **giữ giá trị trong code** và báo lại trong PR. Bỏ `baseStats` theo loài khỏi mọi phép tính (giữ trường nếu UI cũ còn đọc).

---

## 6. Server & dữ liệu

### 6.1 Ledger (bắt buộc trước khi có Gem)
Bảng mới `wallet_ledger`:
```sql
CREATE TABLE wallet_ledger (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  currency    ENUM('milk','gem','stone') NOT NULL,
  amount      INT NOT NULL,              -- dương = nhận, âm = tiêu
  reason      VARCHAR(40) NOT NULL,      -- lesson_first, lesson_milestone, evolve, purchase, migration, admin…
  ref_id      VARCHAR(64) DEFAULT NULL,  -- lessonId, petInstanceId, orderId…
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id, currency),
  UNIQUE KEY uq_grant (user_id, currency, reason, ref_id)  -- chống cộng trùng
);
```
Số dư = `SUM(amount)` theo user + currency (có thể cache cột `gem_balance`, `stone_balance` trong `user_progress`, cập nhật trong cùng transaction).
Migration theo kiểu idempotent như các file `server/db/migrate-*.sql` hiện có.

### 6.2 API mới / sửa
- Cấp Gem/Đá: mặc định làm trong `PUT /api/progress` theo 0.5.5 (lọc theo `shared/lesson-ids.json`, `ref_id` theo số mốc). Có thể thêm `POST /api/lessons/:lessonId/complete` để UI nhận thông báo thưởng ngay, nhưng dùng chung một hàm cấp thưởng. Client không tự cộng Gem/Đá.
- `GET /api/wallet` → `{ milk, gem, stone }` (milk tính theo 0.5.4).
- `POST /api/pets/:instanceId/evolve` → server kiểm tra: pet thuộc user, cấp hiện tại < 5, đủ Sữa/Gem/Đá, đủ điều kiện điểm kỹ năng (3.2–3.3); trừ tài nguyên qua ledger trong **transaction**, tăng `evolution`; trả trạng thái mới. Client không tự đổi `pet.evolution`.
- `PUT /api/pet-data` (`server/routes/api.js` ~dòng 186–207): `pet_data` là một khối JSON lưu nguyên. Server đọc bản đang lưu, **ghi đè `collection[*].evolution`** bằng giá trị cũ, và kẹp `collection[*].skills` không giảm (6.3) rồi mới lưu. Coins để nguyên (Shop tạm gác).
- `PUT /api/progress` (~dòng 75): bỏ `availableXP` và `skillXP` khỏi whitelist ghi (0.5.4).
- Duel (`server/routes/api.js` ~dòng 340–600):
  - Tạo trận: lưu snapshot pet challenger (thêm cột `challenger_pet_snapshot` JSON) **và `challenger_question_times`** (đang bị bỏ sót, 0.5.6). Trận mới cố định `DUEL_QUESTIONS` câu.
  - Tham gia: lưu snapshot opponent, gọi `shared/battle-engine.js` để tính trận theo HP, lưu `battle_log` (JSON từng đòn) + `challenger_hp_pct`, `opponent_hp_pct`; winner theo mục 5.1. League points giữ nguyên quy tắc hiện tại (+30 thắng, +15 hoà, +5 thua, +5 tạo trận).
  - Ghép trận chênh tối đa 1 cấp (lọc ở danh sách thách đấu/lúc join).

### 6.3 Chống gian lận tối thiểu
- Điểm kỹ năng pet vẫn đang do client gửi (`pet_data.collection`). Đợt này: server **kẹp** để không giảm (lấy max với giá trị cũ) và ghi chú rủi ro trong PR. Chuyển hẳn sang server tính là việc sau.

### 6.4 Di trú người chơi cũ **[MỞ — mặc định]**
- Ví Sữa = `available_xp` hiện tại (1:1), thực hiện qua dòng ledger `legacy_spent` (0.5.4).
- Gem/Đá ban đầu = chạy **đúng hàm cấp thưởng của 0.5.5** trên `completedLessons` hiện có (cùng `reason='lesson_milestone'`, `ref_id='gem:<k>'`/`'stone:<k>'`). **Không** dùng `reason='migration'` cho Gem/Đá: vì `uq_grant` có chứa `reason`, nếu dùng hai reason khác nhau thì lần đồng bộ sau sẽ cấp thêm một lần nữa. `reason='migration'` chỉ dùng cho dòng `legacy_spent` của Sữa (0.5.4).
- Pet đã ở cấp cao: **giữ nguyên cấp** (không hạ).
- Coins giữ nguyên, không đổi sang Gem (chờ quyết định Shop).
- Migration chạy được nhiều lần không cộng trùng (dựa vào `uq_grant`).

---

## 7. Ngoài phạm vi đợt này
- Shop, đồ trang trí, coins, quà trứng (`gift_egg`) — giữ nguyên.
- Nạp tiền mua Gem (chỉ chuẩn bị ledger).
- Đội 3 pet, thanh năng lượng chiêu, hệ tăng sức mạnh theo tuần, ấn ký.
- Cập nhật bảng cân bằng trên claude.ai (Sonny làm riêng).

---

## 8. UI cần sửa
- **PetPage.jsx**: bỏ card "Cho Pet ăn XP". Thêm khối **Tiến hoá**: hiển thị cấp hiện tại → cấp kế, từng điều kiện (Sữa, Gem, Đá, điểm từng kỹ năng) có ✓/✗ và thanh tiến độ; nút "Tiến hoá" bật khi đủ, gọi API 6.2.
- Hiển thị 4 chỉ số chiến đấu (HP/ATK/DEF/AGI) tính bằng `shared/battle-engine.js`, kèm điểm kỹ năng thô và cấp hiển thị.
- **AccountPage.jsx**: "Ví XP" → "Sữa 🥛"; thêm Gem 💎 và Đá nguyên tố.
- **CollectionPage.jsx**: hiển thị hệ (10 hệ) + nhóm + kỹ năng nhóm (mô tả lấy từ config, không hard-code chữ).
- **DuelPage.jsx**: trước trận hiện "Hiệu quả!" / "Bất lợi" theo khắc hệ; khi phát lại hiện sát thương số nguyên, crit, né, bỏng, choáng, lá chắn, hồi máu theo `battle_log` từ server; HP bar theo kết quả server.
- Thông báo trao thưởng Gem/Đá sau khi hoàn thành bài mới.

---

## 9. Thứ tự triển khai (Phase)

**Phase 1 — Config & engine (không đổi hành vi app)**
- Tạo `shared/game-config.js` (mọi bảng mục 2–5, key tiếng Anh + `labelVi` theo 0.5.1) và `shared/battle-engine.js`: `computeStats(snapshot)`, `canEvolve(pet, wallet)`, `simulateBattle(snapA, snapB, answersA, answersB, seed)`.
- Sửa `deploy.ps1` copy `shared/`; thêm script `test` dùng `node --test` (0.5.7).
- Unit test (Vitest hoặc `node --test`): ví dụ 4.4, chi phí 3.2, khắc 5.4, tương đối né/crit, Thổ giảm crit, Bầu trời 20%, choáng Lôi, lá chắn Ánh sáng, Bám rễ < 50% HP, No đủ từ chuỗi 3.

**Phase 2 — Dữ liệu pet**
- `src/data/pets.js`: thêm `element` (10 hệ mới), `group`, `evolveReq` cho 22 pet; giữ `rarity`. Mọi chỗ dùng 6 hệ cũ (`ELEMENT_COLORS`, filter, UI) chuyển sang 10 hệ; xoá `nature`/`cosmic` (0.5.1).
- Thay `calculatePowerScore` (cả bản copy ở `server/routes/api.js` ~dòng 240, `evoMul`).
- Thay `getPetEvolution(…, totalXpEarned)` bằng `getEvolutionInfo(speciesId, pet.evolution)` ở mọi chỗ gọi (0.5.2). Chưa khoá server ở phase này, nhưng client đã thôi tự tính cấp.

**Phase 3 — Điểm kỹ năng**
- Mục 3.4 **cộng với 0.5.3**: nối lesson/practice/mini-game/checkpoint/duel vào `onQuizComplete` với category thật **trước**, rồi mới bỏ +5 cả 4 kỹ năng. Bỏ XP pet thụ động, bỏ `skillXP` khỏi tính toán.

**Phase 4 — Ledger, Gem, Đá, tiến hoá**
- Migration 6.1, `shared/lesson-ids.json` (0.5.5), API 6.2 (wallet, cấp Gem/Đá, evolve), Sữa tính trên server (0.5.4), di trú 6.4, UI tiến hoá (mục 8). Khoá `evolution` phía server (0.5.2).

**Phase 5 — Trận đấu trên server**
- Snapshot, `simulateBattle` trên server, `battle_log`, winner theo HP, ghép trận ±1 cấp, DuelPage phát lại. Sửa `challenger_question_times`, cố định 10 câu, xử lý trận pending cũ (0.5.6).

**Phase 6 — Kiểm thử cân bằng**
- Script `scripts/sim-battles.mjs`: chạy vài nghìn trận ngẫu nhiên (22 pet × cấp C1–C5 × hồ sơ điểm: vừa đủ điều kiện / +1 800 vào kỹ năng cao nhất; mỗi bên 5–9 câu đúng). Xuất CSV: tỉ lệ thắng theo hệ, nhóm, độ hiếm; độ lệch chuẩn (độ may rủi). Báo lại các điểm lệch > ±5%.

Mỗi phase: `npm run build` cho client, chạy test, mô tả PR liệt kê file đổi, giả định, và mục **[MỞ]** đã dùng mặc định.

---

## 10. Tiêu chí chấp nhận
- Ví dụ 4.4 khớp.
- Không còn đường nào tự tăng `pet.evolution` ngoài API evolve; `getPetEvolution` theo XP đã bị xoá.
- Sau khi tiến hoá và đồng bộ lại, Sữa không quay về số cũ.
- Một bài học mới cộng điểm vào đúng kỹ năng của dạng câu; ngày học 1 bài cho khoảng 20 điểm kỹ năng.
- Hoàn thành 1 bài mới **không** cộng điểm cho cả 4 kỹ năng; chỉ cộng theo câu đúng.
- Gem/Đá chỉ tăng qua server, không cộng trùng khi làm lại bài hay chạy lại migration.
- Duel: kết quả do server tính; client sửa dữ liệu cục bộ không đổi được kết quả trận.
- Mô phỏng (Phase 6): cùng cấp + cùng độ hiếm + mỗi bên đúng 7 câu → không hệ/nhóm nào có tỉ lệ thắng trung bình lệch quá ±5% so với 50% (nếu lệch, báo cáo, **không tự chỉnh số**).

## 11. Tham chiếu nhanh: nhịp chơi kỳ vọng (để kiểm tra cảm giác)
Giả định 0.5 Gem/bài mới, 1 đá/10 bài mới, 206 bài trong app.

| Người chơi | Học/ngày | C2 | C3 | C4 | C5 |
|---|---|---|---|---|---|
| Thường | 1 bài, ~200 Sữa | ngày 3 | ngày 10 | ngày 52 | ngày 152 |
| Chăm | 2 bài, ~350 Sữa | ngày 2 | ngày 6 | ngày 26 | ngày 78 |
| Cày | 3 bài, ~500 Sữa | ngày 2 | ngày 4 | ngày 18 | ngày 54 |

C4/C5 bị chặn chủ yếu bởi số bài mới (Gem/Đá) — đúng thiết kế.
