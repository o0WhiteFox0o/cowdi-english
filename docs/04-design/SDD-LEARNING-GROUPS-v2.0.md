# SDD-LEARNING-GROUPS — Thiết kế Tách Lộ trình Học thành 3 Nhóm Người học (Mới học · Trung bình · Luyện thi)

> **Mã tài liệu:** SDD-LEARNING-GROUPS · **Chuẩn tham chiếu:** IEEE 1016-2009 · **Phiên bản:** 2.0 · **Trạng thái:** Approved · **Ngày phê duyệt:** 2026-11-24
> **Tên gốc:** `GEMINI-LEARNING-GROUPS.md` (Bản 2) · **Tài liệu yêu cầu:** [SRS-LESSON-3-LEVELS-v1.0.md](../02-requirements/SRS-LESSON-3-LEVELS-v1.0.md) · **Kế hoạch triển khai hợp nhất:** [SPMP-UPGRADE-CONTENT-LEARNING-GROUPS-v1.0.md](../01-project-management/SPMP-UPGRADE-CONTENT-LEARNING-GROUPS-v1.0.md)

## Lịch sử sửa đổi

| Phiên bản | Ngày | Nội dung | Người phê duyệt |
|---|---|---|---|
| 1.0 | 2026-11-24 | Bản đầu (dựa trên commit `a6e87a7`) | Sonny |
| 2.0 | 2026-11-24 | Cập nhật theo `SRS-LESSON-3-LEVELS v1.0`: cấp Mới học xây mới `format: 'picture'`, toàn bộ bài cũ sang Trung bình, bài phát âm sang Luyện thi; PO chốt triển khai tái cấu trúc 3 nhóm kèm migration + bài Starter tính mốc Gem/Đá như bài thường | Sonny |

---

Tài liệu kỹ thuật triển khai trực tiếp trên repo Cowdi English: client React trong `src/`, server Express trong `server/` (`server/routes/api.js`), MySQL với migration `server/db/migrate-*.sql`, dữ liệu dùng chung trong `shared/` (sinh bởi `scripts/build-lesson-ids.mjs` ở bước `prebuild`). Đọc code trước khi sửa; chỗ nào tài liệu này đoán sai so với code thật thì **làm theo code thật và ghi lại trong mô tả PR**. Chữ hiển thị trên giao diện bằng tiếng Việt.

Tài liệu viết dựa trên commit `a6e87a7` (24/11/2026). **Bản 2 (24/11/2026):** cập nhật theo [SRS-LESSON-3-LEVELS-v1.0.md](../02-requirements/SRS-LESSON-3-LEVELS-v1.0.md): cấp Mới học xây mới bằng định dạng bài `picture`; mọi bài hiện có chuyển sang Trung bình; bài phát âm chuyển sang Luyện thi. Khi hai tài liệu mâu thuẫn về **nội dung bài**, theo tài liệu yêu cầu; về **kỹ thuật**, theo tài liệu này.

---

## 0. Bối cảnh: vì sao phải làm

Hiện trạng (đã kiểm tra trong code):

| # | Vấn đề | Vị trí |
|---|---|---|
| H1 | "Lộ trình chung" xếp ngược độ khó: Unit 1–2 (15–20 từ, 3 điểm ngữ pháp, nhà hàng/sân bay) đứng trước Unit 3 "Cơ bản 1" (chào hỏi, màu sắc, 10 từ). `tenses` (advanced, 30 từ) nằm ở Unit 4 "Cơ bản 2", còn Unit 5–6 "Trung cấp" lại toàn bài beginner. | `src/data/config/units.js` |
| H2 | 35 bài không thuộc lộ trình nào: `alphabet`, 4 bài `pronunciation-*`, 30 bài IELTS. | so `ALL_LESSONS` với `ALL_PATHS` |
| H3 | Mọi người dùng bị khoá tuyến tính từ bài đầu, không có kiểm tra đầu vào, không học vượt được. | `buildPathNodes` trong `src/data/path.js` |
| H4 | Bài học được tính "xong" kể cả khi quiz 0/5. | `goToNextQuestion` trong `src/features/lesson/LessonDetailPage.jsx` |
| H5 | Bài kiểm tra unit lấy câu từ `QUIZ_BANK` bằng khớp chuỗi con với từ vựng. Unit 1 có từ "I", "It" nên 214/248 câu khớp chữ "i", tức là đề gần như ngẫu nhiên. | `buildCheckpointQuestions` trong `src/pages/LearningPathPage.jsx` |
| H6 | Server cấp +1 Gem unit khi xong hết bài (chưa cần qua kiểm tra), nhưng giao diện chỉ báo "Đã nhận" khi đã qua kiểm tra. | `server/utils/wallet.js` mục 2a |
| H7 | +2 Gem "unit 100%" không bao giờ được cấp: client không gửi `lessonScores`, cột cũng không có. Nếu có thì điều kiện checkpoint lại sai (so `score` dạng số câu với `100`/`1.0`). | `wallet.js` mục 2b, whitelist `PUT /api/progress` |
| H8 | Gợi ý "~+170 Sữa" ghi cố định. Thực tế quiz 5 câu lần đầu tối đa 140. | `LearningPathPage.jsx` |

Mục tiêu: mỗi nhóm người học có lộ trình, luật mở khoá và trải nghiệm bài học riêng. Mỗi bài trong kho thuộc ít nhất một lộ trình.

---

## 1. Quyết định thiết kế (đã chốt, làm theo)

| # | Quyết định |
|---|---|
| L1 | Có 3 **nhóm** (`group`). Mỗi nhóm chứa 1 hoặc nhiều **lộ trình** (`path`). Người dùng chọn 1 nhóm đang học (`learnerGroup`) và 1 lộ trình đang học (`activePath`), đổi được bất cứ lúc nào, không mất tiến độ. |
| L2 | `completedLessons`, `lessonScores`, `checkpointScores` vẫn **dùng chung toàn tài khoản**. Bài đã học ở lộ trình này thì tính là đã học ở mọi lộ trình có bài đó. |
| L3 | Mở khoá theo **unit**: unit N mở khi unit N−1 đã "qua". Trong unit, nhóm Mới học học lần lượt từng bài. Hai nhóm còn lại học theo thứ tự tuỳ ý. |
| L4 | Bài học chỉ tính "xong" khi quiz đạt ngưỡng của nhóm (mục 4). Chưa đạt thì vẫn nhận Sữa theo số câu đúng, nhưng tính như làm lại (1/3), không có thưởng hoàn thành. |
| L5 | Bài kiểm tra unit chỉ lấy câu từ các bài trong unit đó, không dùng `QUIZ_BANK` khớp chuỗi nữa. |
| L6 | +1 Gem unit chỉ cấp khi **xong hết bài + qua kiểm tra unit thật** (`source: 'checkpoint'`). Unit được đánh dấu qua nhờ kiểm tra đầu vào (`placement`) hoặc chuyển đổi dữ liệu cũ (`legacy`) **không** được Gem. |
| L7 | Không đổi `id` của bài học nào. Không đổi `id` của lộ trình luyện thi `ielts`, `toeic`, `b1`, `b2`, `advanced`. Lộ trình `general` bị bỏ, thay bằng `beginner` và `intermediate`. |
| L8 | Không đổi công thức Sữa / Gem / Đá ngoài các điểm ghi rõ ở L4, L6 và mục 6. Không đổi `shared/game-config.js`. **(Sonny xác nhận 24/11/2026: bài Starter tính mốc Gem/Đá như bài thường.)** |
| L9 | Nhóm Mới học dùng bài **mới** định dạng `format: 'picture'` (id `s1-*`). **Không có bài cũ nào trong nhóm Mới học.** Mọi bài thuộc lộ trình chung cũ chuyển sang nhóm Trung bình. |
| L10 | Phát âm: Mới học không chấm; Trung bình chấm theo từ như hiện nay, không chặn; Luyện thi chấm mức âm vị, bắt buộc trong unit `exam-pron` (mục 4.5). |

**Giả định đã áp dụng (ghi nhận trong PR nếu có thay đổi):**

- A1: B1 và B2 (chứng chỉ CEFR/VSTEP — Vietnamese Standardized Test of English Proficiency) thuộc nhóm **Luyện thi**.
- A2: Lộ trình `advanced` (C1–C2) thuộc nhóm **Trung bình**, là chặng sau `intermediate`.
- A3 (đã chốt): Nhóm Mới học hướng tới cả trẻ em học cùng phụ huynh: bài ngắn, nhiều hình, chữ to, giọng đọc chậm, không chấm phát âm.

---

## 2. Mô hình dữ liệu

### 2.1 File mới `src/data/config/groups.js`

```js
export const LEARNER_GROUPS = [
  {
    id: 'beginner',
    title: 'Mới học',
    subtitle: 'Bắt đầu từ con số 0: nhìn hình, nghe và nhắc lại (Pre-A1–A1)',
    icon: 'sprout',
    color: '#7DBE4B',
    paths: ['beginner'],
    defaultPath: 'beginner',
    rules: {
      unitOrder: 'sequential',
      lessonOrder: 'sequential',          // trong unit phải học lần lượt
      lessonFormat: 'picture',            // mục 4.4; không dùng các bước LESSON_STEPS
      lessonPassRate: 4 / 6,              // thử thách 6 câu, đúng ≥4
      speakScoring: 'none',
      ttsRate: 0.8,
      checkpoint: { questionCount: 10, passRate: 0.7, allowTestOut: false, secondsPerQuestion: null },
      pretest: false,
    },
  },
  {
    id: 'intermediate',
    title: 'Trung bình',
    subtitle: 'Đã biết chút ít, muốn hiểu và dùng được câu (A2–C2)',
    icon: 'tree',
    color: '#4EA8E8',
    paths: ['intermediate', 'advanced'],
    defaultPath: 'intermediate',
    rules: {
      unitOrder: 'sequential',
      lessonOrder: 'free',
      lessonPassRate: 0.7,
      requiredSteps: ['vocab', 'grammar', 'reading', 'quiz'],
      optionalSteps: ['flashcard', 'listen', 'speak'],
      vocabBatchSize: 10,                 // bài 30 từ hiển thị theo nhóm 10
      speakScoring: 'word',               // cách chấm hiện tại, không chặn
      ttsRate: 0.85,
      checkpoint: { questionCount: 15, passRate: 0.7, allowTestOut: true, secondsPerQuestion: null },
      pretest: false,
    },
  },
  {
    id: 'exam',
    title: 'Luyện thi',
    subtitle: 'IELTS · TOEIC · B1 · B2',
    icon: 'medal',
    color: '#D32F2F',
    paths: ['ielts', 'toeic', 'b1', 'b2'],
    defaultPath: null,                    // bắt buộc chọn kỳ thi
    rules: {
      unitOrder: 'required-then-free',    // các unit trong path.requiredUnits học lần lượt, sau đó tuỳ chọn
      lessonOrder: 'free',
      lessonPassRate: 0.75,
      requiredSteps: ['quiz'],
      optionalSteps: ['vocab', 'flashcard', 'grammar', 'reading', 'listen', 'speak'],
      vocabBatchSize: null,
      speakScoring: 'phoneme',            // mục 4.5
      ttsRate: 0.95,
      checkpoint: { questionCount: 15, passRate: 0.75, allowTestOut: true, secondsPerQuestion: 45 },
      pretest: true,                      // "Làm thử trước", xem mục 4.3
    },
  },
];
export const getGroup = (id) => LEARNER_GROUPS.find((g) => g.id === id) || null;
export const getGroupOfPath = (pathId) => LEARNER_GROUPS.find((g) => g.paths.includes(pathId)) || null;
```

`checkpoint.questionCount` / `passRate` trong từng unit (dữ liệu cũ) bị **bỏ qua**, luôn dùng giá trị của nhóm. Giữ `checkpoint.title`.

### 2.2 Trường mới trong `userData`

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `learnerGroup` | `'beginner' \| 'intermediate' \| 'exam' \| null` | `null` thì hiện màn chọn nhóm (mục 5.1) |
| `activePath` | `string \| null` | id lộ trình đang học, phải thuộc `learnerGroup` |
| `lessonScores` | `{ [lessonId]: number }` | % quiz cao nhất 0–100 (số nguyên) |
| `placement` | `{ date, tierScores: {A,B,C}, result: { group, placedUnits: [] } } \| null` | kết quả kiểm tra đầu vào gần nhất |
| `checkpointScores[unitId]` | thêm khoá `source: 'checkpoint' \| 'placement' \| 'legacy'` | bản ghi cũ không có `source` thì coi là `'checkpoint'` |

**Quy tắc ghi `checkpointScores`** (sửa `saveCheckpointScore` trong `src/hooks/useUser.jsx`):

- Bài kiểm tra thật (`source: 'checkpoint'`) **luôn ghi đè** bản ghi `placement`/`legacy`. Nếu bản ghi cũ cũng là `checkpoint` thì giữ bản có % cao hơn (như hiện nay).
- `placement`/`legacy` không bao giờ ghi đè `checkpoint`.
- `passed` tính theo `passRate` của nhóm chứa unit.

### 2.3 Server

Migration mới `server/db/migrate-learning-groups.sql`, idempotent theo đúng cách của `migrate-v2-foundation.sql` (thủ tục `cowdi_add_col_if_missing`, nhớ `DROP PROCEDURE` ở cuối; kèm runner Node tương thích MySQL 5.5/5.6+ trên aaPanel theo [SCMP-COWDI-v1.0](../01-project-management/SCMP-COWDI-v1.0.md)):

```sql
CALL cowdi_add_col_if_missing('user_progress', 'learner_group', 'VARCHAR(16) DEFAULT NULL');
CALL cowdi_add_col_if_missing('user_progress', 'active_path',   'VARCHAR(32) DEFAULT NULL');
CALL cowdi_add_col_if_missing('user_progress', 'lesson_scores', 'LONGTEXT DEFAULT NULL COMMENT ''JSON {lessonId: 0-100}''');
CALL cowdi_add_col_if_missing('user_progress', 'placement',     'LONGTEXT DEFAULT NULL COMMENT ''JSON kết quả kiểm tra đầu vào''');
```

`server/routes/api.js`:

- `PUT /api/progress`: thêm `learnerGroup`, `activePath`, `lessonScores`, `placement` vào whitelist, câu `INSERT … ON DUPLICATE KEY UPDATE` và mảng `params`. Kiểm tra giá trị: `learnerGroup` thuộc 3 id; `activePath` có trong `shared/units.json`; `lessonScores` chỉ giữ khoá có trong `lesson-ids.json`, giá trị kẹp 0–100. `lesson_scores` khi lưu lấy **max theo từng khoá** giữa giá trị cũ trong DB và giá trị mới (client cũ hoặc client chưa cập nhật không được làm tụt điểm).
- `GET /api/progress`: trả thêm 4 trường (camelCase).
- Truyền `lessonScores` đã gộp (từ DB) vào `grantLessonAndUnitRewards`, không dùng `d.lessonScores` thô.

`server/utils/wallet.js` → `grantLessonAndUnitRewards` (sửa H6, H7):

```text
với mỗi unit trong units.json:
  allDone   = mọi bài của unit ∈ completedLessons
  cp        = checkpointScores[unitId]
  cpReal    = cp && cp.passed && (cp.source ?? 'checkpoint') === 'checkpoint'
  nếu unit.hasCheckpoint và không cpReal → bỏ qua unit
  nếu không allDone → bỏ qua unit
  cấp unit_complete (+1 Gem, INSERT IGNORE như cũ)
  perfect = mọi bài có lessonScores[id] >= 100
            và (không có checkpoint hoặc cp.total > 0 và cp.score === cp.total)
  nếu perfect → cấp unit_perfect (+2 Gem)
```

Unit có mặt ở nhiều lộ trình (`exam-intro`, `exam-pron`) chỉ xuất hiện **một lần** trong `units.json` (mục 3.4), nên chỉ được Gem một lần.

---

## 3. Cấu trúc lộ trình (thay `src/data/config/units.js`)

Xuất ra `BEGINNER_UNITS`, `INTERMEDIATE_UNITS`, `EXAM_INTRO_UNIT`, `EXAM_PRON_UNIT`. Giữ `export const UNITS = [...BEGINNER_UNITS, ...INTERMEDIATE_UNITS]` để `HomePage.jsx` và các import cũ không vỡ, sau đó rà lại `HomePage.jsx` (đang dùng `getPathById('general')`) cho đúng lộ trình của người dùng.

### 3.1 Nhóm Mới học — lộ trình `beginner` (10 unit, 40 bài mới `s1-*`)

Danh sách unit, id bài và từ vựng: [SRS-LESSON-3-LEVELS-v1.0.md](../02-requirements/SRS-LESSON-3-LEVELS-v1.0.md) mục 2.4. Dữ liệu bài đặt trong `src/data/lessons/starter/<id>.js` theo định dạng mục 2.3 của tài liệu đó (bổ sung đầy đủ trường v2 theo `STD-LESSON-CONTENT-v1.0.md`), unit id `s1-u1` … `s1-u10`.

Trong PR đầu tiên **chỉ soạn dữ liệu Unit S1** (`s1-hello`, `s1-me`, `s1-num-1`, `s1-num-2`) bằng emoji, chưa cần ảnh. Unit S2–S10 khai báo trong `units.js` với `lessons: []` và `comingSoon: true`. Trên trang Lộ trình, unit `comingSoon` hiện thẻ "Sắp ra mắt", không khoá luồng (bỏ qua khi tính unit kế tiếp). Kiểm tra "mỗi bài thuộc ít nhất một unit" của `build-lesson-ids.mjs` vẫn áp dụng cho bài `s1-*` đã có.

### 3.2 Nhóm Trung bình — lộ trình `intermediate` (10 unit, 39 bài cũ) và `advanced` (giữ nguyên)

| Unit id | Tên | Bài |
|---|---|---|
| `int-u1` | Làm quen | `greetings`, `family`, `colors`, `numbers` |
| `int-u2` | Quanh ta | `school`, `weather`, `jobs`, `body` |
| `int-u3` | Đời sống | `clothing`, `house`, `emotions`, `hobbies` |
| `int-u4` | Ngữ pháp nền | `pronouns`, `articles`, `prepositions-place`, `wh-questions`, `numbers-basic` |
| `int-u5` | Giao tiếp hằng ngày | `daily-phrases`, `time-and-date`, `directions`, `money-prices` |
| `int-u6` | Tình huống | `at-restaurant`, `at-airport`, `daily-routine`, `food`, `travel` |
| `int-u7` | Thế giới quanh ta | `nature`, `technology`, `shopping`, `health` |
| `int-u8` | Ngữ pháp và diễn đạt | `tenses`, `comparisons`, `communication-skills` |
| `int-u9` | Xã hội | `environment`, `media`, `culture` |
| `int-u10` | Công việc và tri thức | `business`, `science`, `education` |

Lộ trình `advanced` (6 unit hiện có trong `src/data/lessons/paths.js`) mở khi người dùng **đã qua `int-u10`** hoặc kiểm tra đầu vào qua tầng C (mục 5.2). Trước đó, trong bộ chọn lộ trình nó hiện ở trạng thái khoá kèm dòng "Hoàn thành lộ trình Trung bình để mở".

### 3.3 Nhóm Luyện thi — `ielts`, `toeic`, `b1`, `b2`

1. Thêm unit dùng chung **`exam-intro`** "Nhập môn luyện thi", bài `exam-strategies`, `test-practice`, vào **đầu** cả 4 lộ trình (cùng một object, cùng id).
1b. Thêm unit dùng chung **`exam-pron`** "Phát âm chuẩn" ngay sau `exam-intro` ở cả 4 lộ trình. Bài: `alphabet`, `pronunciation-vowels`, `pronunciation-consonants`, `pronunciation-tricky`, `pronunciation-stress` (có sẵn). 5 bài `pron-*` mới trong tài liệu yêu cầu mục 4.1 thêm vào sau khi được soạn. Mỗi path thi có thêm `requiredUnits`: `ielts`, `b1`, `b2` = `['exam-intro', 'exam-pron']`; `toeic` = `['exam-intro']` (với TOEIC, `exam-pron` là unit tuỳ chọn).
2. Bổ sung 30 bài IELTS đang không thuộc lộ trình nào vào cuối lộ trình `ielts`:

| Unit id | Tên | Bài |
|---|---|---|
| `ielts-unit-topics-1` | Chủ đề Speaking & Writing 1 | `ielts-vocab-technology`, `-media`, `-tourism`, `-globalization`, `-crime`, `-economy`, `-family`, `-culture`, `-transport`, `-urbanization` |
| `ielts-unit-topics-2` | Chủ đề Speaking & Writing 2 | `ielts-vocab-employment`, `-art`, `-food`, `-government`, `-science`, `-language`, `-sports`, `-history`, `-architecture`, `-agriculture` |
| `ielts-unit-topics-3` | Chủ đề 3 & kỹ năng bổ sung | `ielts-vocab-energy`, `-shopping`, `-childhood`, `-aging`, `ielts-grammar-conditionals`, `ielts-grammar-passive`, `ielts-writing-task1-maps`, `ielts-writing-task1-process`, `ielts-speaking-part2-cue`, `ielts-speaking-part3-discussion` |

(`-media` nghĩa là `ielts-vocab-media`; tiền tố giống dòng đầu.) Mỗi unit có `checkpoint: { title: 'Kiểm tra <tên unit>' }`.

3. Với luật `required-then-free`: các unit trong `requiredUnits` mở lần lượt; qua hết thì mọi unit còn lại của lộ trình mở cùng lúc.

### 3.4 `src/data/path.js` và `scripts/build-lesson-ids.mjs`

- `ALL_PATHS` = `beginner`, `intermediate`, `advanced`, `ielts`, `toeic`, `b1`, `b2`. Mỗi path có thêm `groupId`.
- Mọi hàm nhận thêm `pathId`, **bỏ suy đoán bằng `findPathForLesson`** (bài `exam-intro` có ở 4 lộ trình):
  - `buildPathNodes(path, userData)`: viết lại theo L3, luật lấy từ `getGroupOfPath(path.id).rules`.
  - `getLessonAccess(lessonId, userData, pathId)`: nếu không truyền `pathId` thì dùng `userData.activePath`; nếu bài không thuộc lộ trình đó thì dùng lộ trình đầu tiên **thuộc `learnerGroup`** có bài; nếu vẫn không có thì `findPathForLesson` như cũ.
  - `getNextPathLesson(userData, pathId = userData.activePath)`.
- `build-lesson-ids.mjs`: khử trùng unit theo `unitId` (giữ `pathId` đầu tiên, thêm mảng `pathIds`). Thêm kiểm tra: **mỗi bài trong `ALL_LESSONS` thuộc ít nhất một unit**, không thì `process.exit(1)` kèm danh sách bài thiếu. Thêm kiểm tra không có `unitId` trùng giữa các unit khác nhau.

**Trạng thái node** (thay cho `done/current/locked`):

| Trạng thái | Nghĩa |
|---|---|
| `done` | bài có trong `completedLessons`, hoặc checkpoint có `passed` |
| `current` | node gợi ý học tiếp (đúng 1 node trên mỗi lộ trình) |
| `open` | mở nhưng không phải gợi ý (nhóm `free`) |
| `placed` | bài thuộc unit đã qua nhờ `placement`/`legacy` mà chưa học: mở, hiện ngôi sao mờ, không bắt buộc |
| `locked` | chưa mở |

Luật mở unit: unit đầu luôn mở. Unit k mở khi unit k−1 có checkpoint `passed` (mọi `source`). Riêng `required-then-free`: unit trong `requiredUnits` mở lần lượt; mọi unit khác mở khi tất cả `requiredUnits` đã qua. Unit `comingSoon` (lộ trình beginner) bỏ qua khi xét unit trước/sau. Trong unit mở: `sequential` thì bài i mở khi bài i−1 `done`; `free` thì mọi bài mở. Checkpoint mở khi mọi bài `done`, hoặc khi `allowTestOut` là true (khi đó nút ghi "Kiểm tra vượt unit").

Node `current` = theo thứ tự: bài chưa `done` đầu tiên trong unit mở đầu tiên chưa qua; nếu unit đó đã xong hết bài thì là checkpoint của unit.

---

## 4. Trải nghiệm bài học theo nhóm (`src/features/lesson/LessonDetailPage.jsx`)

Lấy nhóm bằng `getGroupOfPath(access.path.id)`. Bài không thuộc lộ trình nào thì dùng luật `intermediate` (bài `picture` luôn theo 4.4).

### 4.1 Các phần trong bài

- Thanh phần học hiện **phần bắt buộc** trước, theo thứ tự của `LESSON_STEPS`, rồi tới nhóm "Tuỳ chọn" (chữ nhỏ, không khoá, không tính vào %).
- Phần bắt buộc: nhóm `sequential` khoá phần sau tới khi xong phần trước (như hiện nay). Nhóm `free` không khoá.
- Phần không có nội dung (lọc như `steps` hiện tại) thì bỏ khỏi cả hai danh sách.
- `speak`: tuỳ chọn ở nhóm Trung bình (chấm theo từ như hiện nay, ≥50% hiện lời khen, không chặn). Ở nhóm Luyện thi, `speak` **bắt buộc** với bài thuộc `exam-pron` và các bài Speaking của IELTS, B1, B2 (id chứa `speaking`), chấm theo mục 4.5.
- `vocabBatchSize` (Trung bình = 10): tab Từ vựng và Flashcard chia thành "Nhóm 1/2/3…" khi bài nhiều hơn 10 từ. Không tách bài, không đổi id.
- Mục 4.1–4.3 chỉ áp dụng cho bài định dạng cũ (nhóm Trung bình, Luyện thi). Bài `picture` theo mục 4.4.
- Gọi `speakWord` với tốc độ mặc định `rules.ttsRate`, nút "Đọc chậm" vẫn dùng 0.55.

### 4.2 Hoàn thành bài (sửa H4)

Trong `goToNextQuestion` khi xong quiz:

```text
pct    = finalScore / quiz.length
passed = pct >= rules.lessonPassRate
ghi lessonScores[id] = max(cũ, round(pct*100))
nếu passed:
   isFirst = id ∉ completedLessons
   xp = isFirst ? base + 60 : max(5, round(base/3))      // giữ công thức cũ
   markLessonCompleted(id) …(như cũ)
ngược lại:
   xp = max(5, round(base/3))                            // L4
   không markLessonCompleted, không onLessonComplete
   màn kết quả: "Chưa đạt — cần ≥{ngưỡng}%". Liệt kê câu sai kèm đáp án đúng,
   nút "Ôn lại Từ vựng" (về tab vocab) và "Làm lại quiz"
```

`base` giữ như hiện nay (`finalScore * 10 + (isPerfect ? 30 : 0)`). Thêm `lessonScores` vào lần đồng bộ `PUT /api/progress` kế tiếp.

### 4.3 "Làm thử trước" (chỉ nhóm Luyện thi, `pretest: true`)

- Bài chưa `done`: màn đầu có 2 nút "Làm thử quiz (vượt bài)" và "Học từ đầu".
- Làm thử dùng đúng quiz của bài. Đạt ≥ `lessonPassRate` thì xử lý y như 4.2 trường hợp đạt (bài `done`, nhận thưởng lần đầu). Không đạt thì 4.2 trường hợp không đạt, rồi mở tab Từ vựng.

### 4.4 Bài định dạng `picture` (nhóm Mới học)

Component mới `src/features/lesson/PictureLesson.jsx`, `LessonDetailPage` chuyển sang khi `lesson.format === 'picture'`. Luồng 6 bước, câu hỏi **sinh tự động từ `words`**, theo đúng mục 2.2 tài liệu yêu cầu:

1. Xem và nghe: lưới thẻ hình (ảnh `image`, chưa có ảnh thì emoji cỡ lớn), bấm để nghe; bấm hết thẻ mới mở bước 2.
2. Nghe chọn hình: 6 lượt, 3–4 lựa chọn hình, tự phát âm khi hiện câu, có nút nghe lại.
3. Ghép hình với chữ: kéo thả (có thêm chế độ bấm hai lần cho máy không kéo được).
4. Mẫu câu: tranh `pattern.image`, bấm hình để điền chỗ trống, đọc cả câu.
5. Nhắc lại (tuỳ chọn): micro hoặc nút "Con đã nói", pet phát `cheer_small`. Không gọi chấm điểm.
6. Thử thách: 6 câu trộn 3 dạng `listen-pick-image`, `image-pick-word`, `pattern-fill`; đúng ≥4 thì bài `done` (xử lý thưởng như 4.2).

Giao diện: chữ tiếng Anh ≥28 px, nghĩa tiếng Việt nhỏ hơn bên dưới, **không hiện IPA**, nút chạm ≥56 px. Âm thanh: dùng `audio` nếu có, không thì `speakWord(word, rules.ttsRate)`. Lời hướng dẫn mỗi bước có nút loa đọc giọng `vi-VN` (máy không có giọng Việt thì ẩn nút). Bài kiểm tra unit nhóm Mới học dùng cùng 3 dạng câu, sinh từ từ vựng của cả unit.

### 4.5 Chấm phát âm mức âm vị (nhóm Luyện thi)

Làm theo nhánh thử riêng `feat/pron-assessment`, **không chặn** việc gộp PR chính. Khi chưa có dịch vụ, bước `speak` bắt buộc của nhóm Luyện thi tạm dùng cách chấm theo từ với ngưỡng 70%.

- Server: `POST /api/pron/assess` (đăng nhập, giới hạn 15 giây âm thanh, ≤N lượt/người/ngày, cấu hình `PRON_DAILY_FREE`), gọi Azure AI Speech Pronunciation Assessment với `referenceText` là câu mẫu, locale `en-US`. Khoá dịch vụ chỉ để trong biến môi trường server. Không lưu file âm thanh. Trả `{ accuracy, fluency, completeness, prosody, words: [{ word, accuracy, phonemes: [{ phoneme, accuracy }] }] }`.
- Đặt hạn mức chi phí tháng (`PRON_MONTHLY_CAP`): vượt hạn mức thì trả `503 { fallback: 'word' }`, client chuyển sang chấm theo từ và ghi "chưa chấm phát âm".
- Ngưỡng qua: `exam-pron` accuracy ≥70; bài Speaking khác ≥60 (cấu hình trong `groups.js`).
- Giao diện: tô màu từng từ theo điểm, bấm từ để xem âm sai, nút nghe lại câu mẫu.
- Không có micro: bài vẫn hoàn thành được qua quiz; `lessonScores` ghi bình thường, thêm cờ `pronSkipped` cục bộ.

### 4.6 Gợi ý thưởng (sửa H8)

Thêm hàm `estimateLessonMilk(lesson, { isRepeat })` trong `src/data/path.js` dùng đúng công thức 4.2 (điểm tối đa, chưa tính nghe/nói), dùng ở `path-node-tip` và nút "Học tiếp". Bỏ chuỗi cố định `~+170` và `~+57`.

---

## 5. Luồng chọn nhóm, kiểm tra đầu vào, lộ trình

### 5.1 Luồng onboarding: Kiểm tra đầu vào trước → Bỏ qua thì chọn nhóm (`GroupPicker.jsx`)

- **Người dùng mới hoàn toàn** (`learnerGroup === null`, `completedLessons` rỗng, chưa làm `placement`) khi vào `/` hoặc `/learning-path`: hiện **Kiểm tra đầu vào 5 phút** (`PlacementTest`) trước. Nếu bấm **"Bỏ qua, tự chọn nhóm học →"** (hoặc thoát giữa chừng) thì chuyển sang màn chọn nhóm (`GroupPicker`).
- **Người dùng cũ có tiến độ** (`learnerGroup === null`, đã xong ≥1 bài): hiện trực tiếp `GroupPicker` kèm nhãn **"Gợi ý cho bạn"** theo mục 6.2 (vẫn có nút làm bài kiểm tra 5 phút nếu muốn).
- Nút **"Đổi nhóm học"** ở đầu trang Lộ trình và trang Tài khoản luôn mở `GroupPicker`.
- 3 thẻ (tên, phụ đề, 1 dòng ví dụ bài đầu tiên, số bài) và nút phụ **"Chưa chắc? Làm bài kiểm tra 5 phút"** → `/placement`.
- Chọn Luyện thi thì hiện tiếp 4 thẻ kỳ thi để chọn `activePath`.
- Đổi nhóm không xoá dữ liệu, chỉ đổi `learnerGroup` + `activePath`.

### 5.2 Kiểm tra đầu vào — route `/placement`, `src/features/placement/PlacementTest.jsx`

- 3 tầng, mỗi tầng 6 câu trắc nghiệm, lấy ngẫu nhiên từ `quiz` của các bài thuộc:
  - Tầng A: từ vựng `s1-*` đã có (dạng nghe chọn hình, như bài `picture`)
  - Tầng B: `int-u1`–`int-u4`
  - Tầng C: `int-u5`–`int-u10`
- Mỗi tầng lấy câu rải đều các unit (tối thiểu 1 câu/unit). Câu có `speak` thì có nút nghe.
- Đạt ≥5/6 thì lên tầng tiếp, không thì dừng. Không hiện đáp án đúng trong lúc làm.

| Kết quả | Nhóm | `activePath` | Unit đánh dấu `placed` |
|---|---|---|---|
| Trượt A | beginner | beginner | — |
| Qua A, trượt B | intermediate | intermediate | mọi unit `s1-*` đã có bài |
| Qua B, trượt C | intermediate | intermediate | `s1-*`, `int-u1`–`int-u4` |
| Qua C | intermediate | intermediate | `s1-*`, `int-u1`–`int-u10` (mở luôn `advanced`); màn kết quả gợi ý thêm nhóm Luyện thi |

- "Đánh dấu placed" = ghi `checkpointScores[unitId] = { passed: true, source: 'placement', score: 0, total: 0, date }` theo quy tắc 2.2 (không đè `checkpoint` thật).
- Lưu `placement` vào `userData`. Làm lại được bất cứ lúc nào; kết quả mới chỉ **thêm** unit placed, không khoá lại unit đã mở.
- Thưởng: không có Sữa / Gem cho bài kiểm tra đầu vào.

### 5.3 Trang Lộ trình (`src/pages/LearningPathPage.jsx`)

- Đầu trang: chip nhóm (màu nhóm) + "Đổi nhóm học". Bộ chọn lộ trình chỉ liệt kê lộ trình của nhóm hiện tại. Đổi lộ trình thì ghi `activePath`.
- `?tab=<pathId>` vẫn hoạt động. `?tab=general` hoặc không có `tab` → `activePath`. Path thuộc nhóm khác → mở bình thường kèm thanh báo "Lộ trình này thuộc nhóm X. Đặt làm nhóm học chính?".
- Node `placed`: ngôi sao viền mờ, nhãn "Đã vượt". Unit placed có dòng "Bạn đã vượt unit này qua kiểm tra đầu vào. Làm bài kiểm tra unit để nhận 💎".
- Huy hiệu Gem unit hiển thị đúng luật L6: chưa xong hết bài hoặc chưa qua kiểm tra thật → "💎 +1 khi xong bài và qua kiểm tra"; đủ cả hai → "✓ Đã nhận 💎 1"; đủ điều kiện perfect (mục 2.3) → "⭐ 100% · đã nhận 💎 3".
- Dòng "💎 Gem kế tiếp x/2 bài mới · 💠 Đá kế tiếp x/10" giữ nguyên.

### 5.4 Bài kiểm tra unit (sửa H5 và các lỗi nhỏ)

Viết lại `buildCheckpointQuestions(unit, count)`:

1. Gom `quiz` của mọi bài trong unit.
2. Nếu ít hơn `count`, sinh thêm câu từ từ vựng của unit bằng `generateQuizFromLesson` (đang nằm trong `LessonDetailPage.jsx`; chuyển ra `src/utils/quiz-gen.js` để dùng chung).
3. Khử trùng theo `question`, xáo, lấy `min(count, số câu có)`. Tối thiểu 8 câu; ít hơn thì ghi `console.warn` có tên unit.
4. Rải đều: mỗi bài trong unit có ít nhất 1 câu nếu đủ.

Màn làm bài:

- `secondsPerQuestion` (Luyện thi 45 giây): hiện đồng hồ, hết giờ tính sai.
- Nút "✕ Thoát" hỏi xác nhận bằng modal trong app (không dùng `window.confirm`).
- Trả lời sai: hiện đáp án đúng (và `explanation` nếu câu có) tới khi bấm "Tiếp".
- Màn kết quả: unit cuối của lộ trình thì báo "Bạn đã hoàn thành lộ trình!" thay cho "Unit tiếp theo đã mở". Kiểm tra vượt unit (`allowTestOut`) mà đạt thì báo "Đã mở unit tiếp theo. Học xong các bài trong unit này để nhận 💎".
- Thưởng Sữa giữ nguyên công thức hiện tại.

### 5.5 Menu và Thư viện

- `src/components/layout/BookShell.jsx`: thay 2 mục "Luyện thi IELTS"/"Luyện thi TOEIC" bằng một mục **"Luyện thi"** → `/learning-path?tab=<activePath nếu là lộ trình thi, không thì 'ielts'>`. Mục "Lộ trình học" giữ nguyên.
- `src/pages/LessonsPage.jsx` (Thư viện bài): thêm bộ lọc nhóm (mặc định nhóm hiện tại, có "Tất cả"). Trạng thái khoá tính bằng `getLessonAccess(id, userData)` theo mục 3.4. Bài khoá: thẻ ghi "Thuộc <lộ trình> · <unit>" và nút "Xem trên lộ trình".

---

## 6. Chuyển đổi người dùng cũ

### 6.1 Phía client — `migrateLegacyProgress(userData)` trong `src/data/path.js`

Chạy một lần sau khi tải tiến độ từ server (cờ `userData.learningGroupsMigrated = true`, đưa vào whitelist hoặc suy ra từ `learnerGroup !== null`). Hàm idempotent:

1. Với mỗi unit của `intermediate`, `exam-intro`, `exam-pron`, `ielts-unit-topics-*`: nếu **mọi bài** đã có trong `completedLessons` và unit chưa có `checkpointScores` → ghi `{ passed: true, source: 'legacy', score: 0, total: 0 }`.
2. Bản ghi `checkpointScores` của unit cũ `unit-1`…`unit-9` **giữ nguyên** (không xoá, không dùng nữa).
3. Không tự đặt `learnerGroup`, để màn chọn nhóm hỏi (kèm gợi ý 6.2).

### 6.2 Gợi ý nhóm cho người dùng cũ

- Có bài thuộc `ielts`/`toeic`/`b1`/`b2` trong `completedLessons` → gợi ý Luyện thi, chọn sẵn lộ trình có nhiều bài xong nhất.
- Ngược lại, đã xong ≥1 bài bất kỳ → gợi ý Trung bình (mọi bài cũ đều thuộc nhóm này).
- Chưa học bài nào → không gợi ý, mời làm kiểm tra đầu vào.

### 6.3 Phía server — chặn cấp Gem lại cho nội dung đã học

Script `server/scripts/guard-unit-gems.mjs` (chạy một lần lúc triển khai, chạy lại an toàn):

- Đọc `shared/units.json` mới. Unit "mới" = `unitId` chưa có trong `units.json` của commit `a6e87a7` (đưa danh sách id cũ vào script dưới dạng hằng).
- Với mỗi user, mỗi unit mới mà mọi bài đã có trong `completed_lessons`: `INSERT IGNORE wallet_ledger (user_id, 'gem', 0, 'unit_complete', unitId)` và tương tự `'unit_perfect'`. Dòng 0 Gem chiếm khoá `uq_grant`, nên học lại không được cấp lần nữa.
- Mọi chỗ hiển thị lịch sử ví lọc bỏ dòng `amount = 0`.
- In tổng kết: số user, số dòng chặn đã chèn.

Lý do: không có bước này, người đã học xong các bài cũ sẽ nhận +1 Gem lần nữa cho mỗi unit mới chỉ vì đổi id unit, đi ngược mục tiêu giữ Gem khan hiếm.

---

## 7. Không được làm

- Không đổi `id` bài học, không xoá bài, không sửa nội dung bài (từ vựng, quiz, ngữ pháp) trong PR tái cấu trúc lộ trình (trừ 2 lỗi cấu trúc trong giai đoạn cổng validator riêng).
- Không đổi công thức Sữa / Gem / Đá ngoài L4, L6, 6.3. Không đổi `shared/game-config.js`, hệ chiến đấu, cửa hàng.
- Không xoá dữ liệu cũ trong `checkpointScores`, `completedLessons`, `wallet_ledger`.
- Không dùng `window.alert/confirm/prompt`.
- Không đưa đáp án quiz/kiểm tra đầu vào lên server để chấm trong PR này (giữ chấm phía client như hiện nay; ghi trong PR như một rủi ro đã biết).

---

## 8. Thứ tự làm và tiêu chí nghiệm thu

Mỗi giai đoạn một commit riêng trên nhánh `feat/learning-groups`. Ghi tiến độ vào `TASK.md` thành mục mới "Lộ trình 3 nhóm" (ký hiệu giống mục Kinh tế v2).

**GĐ A — Dữ liệu và luật lộ trình**
`groups.js`, `units.js` mới, `paths.js` (thêm `exam-intro`, `exam-pron`, `requiredUnits`, 3 unit IELTS), dữ liệu Unit S1 `src/data/lessons/starter/`, `path.js` viết lại, `build-lesson-ids.mjs`.
Kiểm:
- `npm run prebuild` không lỗi; script báo 0 bài mồ côi; `units.json` có `exam-intro` và `exam-pron` mỗi unit đúng 1 lần.
- Test mới `shared/learning-path.test.js`: (1) user rỗng, beginner: chỉ `s1-hello` là `current`, còn lại `locked`, unit `comingSoon` không chặn; (2) intermediate: cả 4 bài `int-u1` `open`/`current`, `int-u2` `locked`; (3) exam: IELTS sau khi qua `exam-intro` chỉ mở `exam-pron`; qua `exam-pron` thì mọi unit mở; TOEIC qua `exam-intro` là mở hết; (4) unit `placed` mở unit sau; (5) `getLessonAccess('exam-strategies', u, 'toeic')` trả path `toeic`.

**GĐ B — Server**
Migration (`migrate-learning-groups.sql` + runner Node tương thích MySQL 5.6+), `api.js`, `wallet.js`, `guard-unit-gems.mjs`.
Kiểm (thêm vào `server/tests/`):
- Unit xong hết bài nhưng chưa qua kiểm tra → không có `unit_complete`.
- Qua kiểm tra `source: 'placement'` → không có Gem.
- Mọi bài 100% + kiểm tra 15/15 → có `unit_perfect`; kiểm tra 14/15 → không.
- Gửi `lessonScores` thấp hơn DB → DB giữ giá trị cao.
- Chạy `guard-unit-gems.mjs` 2 lần → lần 2 chèn 0 dòng.

**GĐ C — Bài học và bài kiểm tra unit**
Mục 4.1–4.4, 4.6, 5.4 (4.5 làm ở nhánh riêng sau).
Kiểm:
- Bài `picture` `s1-hello`: thử thách 3/6 → bài không `done`, `s1-me` vẫn khoá; 4/6 → `done`. Bước 5 không gọi API chấm nào.
- Bài `greetings` (Trung bình): quiz 3/5 → không `done` (cần 70%), nhận Sữa 1/3; 4/5 → `done`.
- Nhóm Luyện thi, "Làm thử" đạt 4/5 → bài `done` không qua các tab khác.
- Kiểm tra `int-u4` chỉ chứa câu thuộc 5 bài của unit (kiểm bằng test cho `buildCheckpointQuestions`).
- Bài `pronunciation-tricky` (IELTS) không cho hoàn thành khi bỏ qua `speak` nếu máy có micro; máy không có micro thì hoàn thành được qua quiz.
- Hết 45 giây ở kiểm tra IELTS → câu tính sai, tự sang câu tiếp.

**GĐ D — Chọn nhóm, kiểm tra đầu vào, giao diện**
Mục 5.1–5.3, 5.5.
Kiểm:
- Tài khoản mới vào `/` → thấy màn chọn nhóm.
- Làm kiểm tra đầu vào trượt A → nhóm Mới học, `s1-hello` là bài hiện tại. Qua B, trượt C → nhóm Trung bình, `int-u5` là unit mở đầu tiên chưa qua, bài `int-u1`–`u4` hiện "Đã vượt".
- Đổi nhóm rồi đổi lại → tiến độ không đổi.
- Trên điện thoại 375 px: màn chọn nhóm và kiểm tra đầu vào không cuộn ngang.

**GĐ E — Chuyển đổi người dùng cũ**
Mục 6.
Kiểm: tài khoản mẫu đã xong `unit-3` cũ (`greetings`, `family`, `colors`, `numbers`) → sau khi tải, `int-u1` được đánh dấu legacy, `int-u2` mở; được gợi ý nhóm Trung bình; ví Gem không tăng.

Chạy `npm test` toàn bộ trước khi mở PR.

Mô tả PR liệt kê:
- Chỗ code thật khác tài liệu này.
- Giả định A1–A3 đã dùng.
- Cách chạy migration và `guard-unit-gems.mjs` trên server thật (thứ tự: migration → deploy code → script).
- Ảnh chụp: màn chọn nhóm, kiểm tra đầu vào, trang Lộ trình của 3 nhóm, màn quiz chưa đạt.
