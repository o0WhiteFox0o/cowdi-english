# GEMINI · Gắn kịch bản dẫn nhập Mùa 2 (int-u1 → int-u3)

Repo: o0WhiteFox0o/cowdi-english · nhánh từ `main` (d7c5302 trở về sau) · PR riêng tên `feat/story-intro-s2`.
Đọc trước: `docs/KICH-BAN-DAN-NHAP-MUA2-U1-U3-v1.0.md` (bản cho người), `shared/story-season2.js` (dữ liệu, chép nguyên file vào repo).

> **Thay đổi so với GEMINI-FIX-AFTER-P4:** BỎ mục P0.1 (popup ScreenActionModal). Sonny đã thử và giữ nguyên. Các mục còn lại của bản review (bug skillsHit Mới học ở F04, mic tự mở, tên theo vùng) vẫn giữ.

## Bước 0 — Kiểm tra, báo lại trước khi sửa
1. Chép `shared/story-season2.js` vào repo, chạy `node -e "import('./shared/story-season2.js').then(m=>console.log(Object.keys(m.SEASON2_LESSONS).length))"` → phải in `12`.
2. Liệt kê nơi đang đọc `lesson.story` (`npc`, `introVi`) và nơi `ScreenIntro` lấy câu dẫn. Dán danh sách file vào PR.

## Bước 1 — Câu dẫn từng màn
- Viết `getSlotIntro(lesson, slot, region)` trong `src/features/lesson/screens/intro.js`:
  1. `lessonSlotIntro(lesson.id, slot)` (từ story-season2) → nếu có thì dùng.
  2. Không có → kho `screen_intro` hiện tại (mã màn × vùng, luật không lặp 10 ải giữ nguyên).
  3. Không có → `getScenario(code, region).generic`.
- `slot` = `intro` (Màn 1), `listen|read|write|speak` theo kỹ năng của màn được trộn vào, `boss` (Màn 6). **Lấy theo kỹ năng, không theo số thứ tự**, vì màn 2–5 bị trộn.
- `ScreenIntro` hiện `vi` (có loa đọc), dòng nhỏ bên dưới là `en`. Không thêm nút, không cuộn.
- Màn hình "Mở ải" dùng `introVi` / `introEn` của bài; ghi đè `lesson.story.introVi` cũ. Đổi `story.npc` của `family` từ `minh` → `lan`.

## Bước 2 — Luật hình pet (bắt buộc, có test)
- Hàm `getStoryPetImage(petId, { companionId, companionC })` trong `src/features/lesson/story/petImage.js`:
  - `c = narratorStage(petId, companionId, companionC)`; ảnh = `PET_REGISTRY[petId].evolutions[evolutionIndex(c)].image`.
  - `companionC = pet.stage + 1` (pet.stage trong repo đếm từ 0).
- Mọi chỗ hiện pet **không phải** pet đồng hành trong dẫn nhập, Tới vùng, Kết tập: đi qua hàm này. Cấm gọi thẳng `evolutions[0..2]` cho pet khác.
- Nhân vật người (`ong_tu, minh, lan, mai, tom, khoa`) giữ hình hiện có.

## Bước 3 — Boss Màn 6 là pet C5
- F-06 / màn Boss: thay sprite sương chung bằng `unitBoss(lesson.unit, companionId)` → ảnh `evolutions[4]` (Legendary) + lớp `public/image/boss/fog.svg` phủ lên, `opacity = bossFogLevel(unit, passedLessonIds, checkpointPassed)`.
- Thoại: `enter` khi vào; mỗi câu đúng xoay vòng `hit[]`; câu sai xoay vòng `wrong[]`; thắng Màn 6 → `retreat`; thua → `fail`.
- Qua **kiểm tra unit** (checkpoint hiện có): màn kết hiện Boss không sương + `freed` (vi + en) → `clueVi` → `epilogue`. Chỉ hiện 1 lần (ghi cờ `story_seen` trong wordProgress/progress cục bộ, không cần bảng mới).
- Giữ nguyên cách tính sao/Sữa. Không thêm máu, không thêm sát thương. Boss không "chết", chỉ sương tan.

## Bước 4 — Tới vùng & điểm mốc
- Bài đầu tiên của unit: trước "Mở ải" hiện thẻ Tới vùng (`arrival`, pet C4). Nếu `homecoming` có và pet đồng hành trùng `homecoming.by` → dùng câu Về quê.
- RouteHeader (hoặc màn kết quả) hiện tên điểm mốc `landmarks[lesson.landmark]`; qua bài → hiện `afterVi`.

## Bước 5 — Test (vitest), dán kết quả vào PR
| # | Kiểm |
|---|---|
| S1 | 12 bài × 6 slot đều có `vi`; không trùng câu |
| S2 | `narratorStage('storm','cowdi',2) === 4`; `narratorStage('cowdi','cowdi',2) === 2` |
| S3 | `unitBoss('int-u1','flippy').pet === 'pingu'`; stage luôn 5 |
| S4 | `getStoryPetImage` với pet khác không bao giờ trả ảnh egg/baby/junior |
| S5 | `bossFogLevel('int-u3',['clothing','house']) === 0.5`; checkpoint → 0 |
| S6 | Bài có kịch bản: `getSlotIntro` trả câu kịch bản; bài không có: rơi về kho `screen_intro` |
| S7 | Các test cũ (lesson-stars, regions, mixer) vẫn 18/18 |

## Không làm
- Không viết lại đoạn đọc, từ vựng, đáp án.
- Không đổi trạng thái màn F khỏi `test`.
- Không viết thoại mới cho int-u4…u10 (chờ Sonny duyệt 3 tập này).
- Không thêm câu pet buồn/ốm/đếm ngược/nhắc Gem.
