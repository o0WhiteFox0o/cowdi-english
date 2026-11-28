# GEMINI · Dẫn nhập mặc định cho bài chưa có kịch bản

Repo: o0WhiteFox0o/cowdi-english · từ `main` 01200af · PR `feat/story-fallback`.
Chép `shared/story-defaults.js` (đính kèm) vào repo, giữ nguyên nội dung.

## Bối cảnh (đọc trước, không sửa)
Commit 01200af đã gắn đúng `story-season2.js`, nhưng chỉ 12 bài int-u1..u3 có kịch bản (greetings, family, colors, numbers, school, weather, jobs, body, clothing, house, emotions, hobbies). Mọi bài khác (ví dụ `alphabet` thuộc `exam-pron`, vùng TG) đang rơi vào câu chung:
- StageIntro.jsx:127 ghi cứng "Cùng Cowdi vượt qua…" dù người dẫn là pet khác.
- F06FogBoss: `storyBoss` = null → hiện sprite sương chung "Boss Sương {vùng}", không phải pet C5.
- Người dẫn = `hosts[0]` của vùng, bỏ qua người dẫn theo unit (exam-pron phải là Storm).

## Thứ tự ưu tiên mới (áp ở mọi chỗ)
`SEASON2_LESSONS[lesson.id]` → `story-defaults` (unit → vùng) → kho `screen_intro` / `getScenario().generic`.

## Bước 1 — Hàm gom một chỗ
Tạo `src/features/lesson/story/resolveStory.js`:
```js
resolveLessonStory({ lesson, unitId, region, companionId, companionC, companionName })
→ { narratorId, openVi, openEn, landmarkName|null,
    boss: { pet, name, image /* evolutions[4] */, lines, lieVi } }
```
- Có `SEASON2_LESSONS[lesson.id]` → dùng như hiện tại (`npc`, `introVi`, `unitBoss`).
- Không có → `narratorId = UNIT_NARRATOR[unitId]?.by ?? defaultNarrator(region, REGIONS, companionId)`; câu mở = `defaultOpenIntro({ unitId, regionName, companionName })`; boss = `regionBoss(region, companionId, PET_REGISTRY[pet].name)` + ảnh `evolutions[evolutionIndex(BOSS_STAGE)]`.
- `unitId` lấy từ `findPathForLesson(lesson.id)` (đã có ở PreviewTab) hoặc unit đang học; **không** dựa vào `lesson.unit` (bài general không có trường này).

## Bước 2 — Thay 3 chỗ dùng
1. `StageIntro.jsx`: bỏ chuỗi ghi cứng ở dòng 127; lấy `narratorId`, `openVi/openEn` từ `resolveLessonStory`. Ảnh người dẫn vẫn qua `getStoryPetImage` (C4).
2. `F06FogBoss.jsx`: `storyBoss = resolveLessonStory(...).boss` — luôn có Boss C5 với mọi vùng có trong `REGION_BOSS`. Chỉ vùng không có trong bảng mới dùng `FogBossSvg`. Mức sương bài thường (không thuộc 12 bài) giữ 0.7.
3. `RouteHeader` / dòng "Boss Sương {vùng}" ở StageIntro: đổi thành tên Boss thật, ví dụ "Boss: Legendary Owlbert".
4. ScreenHost / PreviewTab: truyền `unitId` + `companionName` xuống.

## Bước 3 — Test (vitest), dán kết quả vào PR
| # | Kiểm |
|---|---|
| D1 | `alphabet` (exam-pron, TG): người dẫn `storm`, ảnh Storm C4, câu mở chứa "giọng của gió" |
| D2 | `alphabet`, pet đồng hành `cowdi`: Boss = owlbert, ảnh `Owlbert_Legendary.webp` |
| D3 | Pet đồng hành `owlbert`: Boss TG đổi sang `mimi` C5, thoại `enter` không nhắc "Owlbert" |
| D4 | Bài bất kỳ không có kịch bản: chuỗi Mở ải không chứa "Cowdi" khi pet đồng hành khác Cowdi |
| D5 | Mọi `REGION_BOSS[*].pet/alt` có trong `PET_REGISTRY` và có `evolutions[4].image` |
| D6 | 12 bài int-u1..u3 vẫn ra đúng câu kịch bản (test cũ `story-season2.test.js` pass) |
| D7 | Sandbox: chụp 3 ảnh `greetings`, `school`, `alphabet` ở 390×844 dán vào PR |

## Không làm
- Không sửa nội dung `story-season2.js`, `story-defaults.js`.
- Không viết kịch bản riêng cho bài mới; không đổi trạng thái màn F khỏi `test`.
- Không dùng Shadow, Monk, Ginseng, Prisma làm Boss.
- Không sửa popup ScreenActionModal (đã bỏ qua theo Sonny).
