# Quản lý Pet & Khung chuyển động — hướng dẫn tích hợp

Trang quản trị **`/admin/pet-motion`** đã được nâng cấp thành **Trung tâm Quản lý Pet & Chuyển động** (xem đặc tả chi tiết tại [`SDD-PET-MANAGEMENT-v1.0.md`](04-design/SDD-PET-MANAGEMENT-v1.0.md) và hướng dẫn vận hành tại [`HUONG-DAN-CHINH-DONG-TAC-PET.md`](./HUONG-DAN-CHINH-DONG-TAC-PET.md)): cho phép Admin **thêm loài pet mới, chỉnh sửa metadata, upload ảnh 5 cấp `C1–C5`, xoá pet tự thêm**, dựng rig 13 layer và duyệt 34 động tác (`shared/pet-motion.js` + `src/pet-rig/PetRig.js`).

## Cấu trúc

| Đường dẫn | Nội dung |
| --- | --- |
| `shared/pet-motion.js` | Keyframe 34 động tác gốc, nhịp theo cấp, tính cách 7 nhóm, mốc gắn bó. |
| `shared/pet-motion-labels.js` | Tên tiếng Việt và emoji gợi ý cho 34 động tác. |
| `src/pet-rig/PetRig.js` | Runtime canvas cho người học (chỉ phát dữ liệu đã duyệt từ server). |
| `src/pet-rig/PetAvatar.jsx` | Component React + `topSkillOf`, `bondOf` (tự fallback ảnh tĩnh nếu chưa duyệt rig). |
| `src/pet-rig/motionCache.js` | Cache trong bộ nhớ theo `petId` cho `GET /api/pet-motion/:petId`. |
| `src/admin/pet-motion/` | Giao diện admin `/admin/pet-motion` (Quản lý toàn bộ pet gốc + pet tự thêm × 5 cấp, popup `PetFormModal.jsx` tạo/sửa/upload pet mới, bàn chỉnh keyframe, trình vẽ bộ phận `PartPaintModal.jsx`, tab `StudyPreviewTab.jsx`). |
| `server/routes/petMotionAdmin.js` | API quản trị (`requireAuth + requireAdmin`): CRUD `pet_catalog` (`/pets`), upload avatar/part, lưu nháp, duyệt rig/clip, emoji tự thiết kế. |
| `server/routes/petMotionPublic.js` | API công khai cho người học (`GET /api/pet-motion/catalog` đồng bộ `PET_REGISTRY`, `GET /api/pet-motion/:petId` + ảnh đã xuất bản). |
| `server/db/migrate-pet-motion.sql` · `migrate-pet-catalog.sql` | Migration 5 bảng DB (`pet_catalog`, `pet_motion_clips`, `pet_motion_approvals`, `pet_rigs`, `pet_motion_history`) tương thích MySQL 5.6+. |
| `scripts/run-pet-catalog-migration.js` | Script idempotent tạo bảng `pet_catalog` trên local/production. |
| `server/scripts/seed-pet-rigs.mjs` | Script nạp rig mẫu (`radish`, `bamboo_spirit`) vào trạng thái nháp. |
| `public/pets/<id>/rig.json`, `c1..c5/*.png` | Nguồn seed mẫu ban đầu cho `radish`, `bamboo_spirit`. |
| `tools/bake-clips.mjs` | Sinh lại `shared/pet-motion.js` từ `tools/src-clips.js`. |
| `tools/rig-from-image/` | Script mẫu tách bộ phận từ ảnh phẳng (khi chưa có file tách lớp). |

## Dùng trong React

```jsx
import { useRef } from 'react';
import { PetAvatar, bondOf, topSkillOf } from '@/pet-rig/PetAvatar';
import { PET_REGISTRY } from '@/data/pets';

function LessonPet({ pet }) {
  const ref = useRef();
  const reg = PET_REGISTRY[pet.id];
  return <PetAvatar ref={ref} petId={pet.id} stage={pet.evolution + 1} group={reg.group}
           bond={bondOf(pet.skills)} topSkill={topSkillOf(pet.skills)} mode="lesson" />;
}
// chấm bài: ref.current.emit(isCorrect ? 'answer_correct' : 'answer_wrong')
```

`stage` là 1–5 (`pet.evolution` 0–4 cộng 1). `group` là key nhóm: `farm, herb, hunter, sea, sky, dragon, spirit`.

## Sự kiện cần phát

| Sự kiện | Gọi ở đâu | Pet làm |
| --- | --- | --- |
| `app_open` `{daysAway}` | HomePage khi mở app | Vắng ≥ 1 ngày: `greet_return` (từ 200 điểm), từ 60 điểm: `wave` |
| `lesson_start` | LessonDetailPage, PracticePage khi vào bài | `attentive` |
| `question_shown` | Mỗi câu hỏi mới | Bắt đầu đếm 8 s để `think` |
| `answer_correct` | Chấm đúng | `cheer_small` |
| `streak` `{count}` | Chuỗi 3/5/10 câu đúng | `cheer_big` + pháo giấy |
| `answer_wrong` `{text?}` | Chấm sai | `encourage` + bong bóng động viên |
| `lesson_done` `{text?}` | Xong bài | `cheer_big` (Tri kỷ: `dance`) |
| `skill_level_up` | onQuizComplete khi lên cấp kỹ năng | `proud` |
| `evolve_ok` `{stage}` | API tiến hoá trả về thành công | `evolve`, đổi sang cấp mới giữa clip |
| `mic_start` / `mic_end` + `setMicLevel(0–1)` | Luyện nói, mỗi khung hình | `listen`, nhún theo âm lượng |
| `pet_speak_start` `{text}` / `pet_speak_end` + `setVoiceLevel` | CowdiChat, đọc mẫu | `talk` |
| `feed` | Cho ăn ở trang pet | `eat` |
| `battle_start`, `battle_attack`, `battle_crit`, `battle_dodge`, `battle_hit`, `battle_win`, `battle_lose` | DuelPage, theo danh sách sự kiện từng lượt từ server | Clip Đấu tương ứng |

Tự động, không cần gọi: chớp mắt, nhìn quanh, `fidget` (từ 200 điểm), `sleepy` sau 60 s và `sleep` sau 120 s ở nhà, `think` sau 8 s chờ trả lời, chạm/kéo/chóng mặt, mắt nhìn theo ngón tay (từ 60 điểm), cử chỉ theo kỹ năng mạnh nhất (từ 500 điểm), hào quang (từ 1 200 điểm). `prefers-reduced-motion` giảm biên độ còn 40%.

## Quy trình chỉnh từng pet

Xem hướng dẫn thao tác đầy đủ tại [`docs/HUONG-DAN-CHINH-DONG-TAC-PET.md`](./HUONG-DAN-CHINH-DONG-TAC-PET.md):

1. Đăng nhập tài khoản quản trị viên, mở `/admin/pet-motion`.
2. Chọn pet và cấp tiến hoá (tạo rig mới hoặc chỉnh rig có sẵn, chỉnh thứ tự lớp `z`, vẽ sửa trực tiếp PNG qua nút `✏️ Sửa`).
3. Bấm **Duyệt bộ phận** khi bộ phận đã chuẩn.
4. Chỉnh keyframe & emoji biểu cảm cho từng động tác (tự động lưu nháp lên server), sau đó bấm **Đánh dấu hoàn thiện** để xuất bản cho người học.
5. Bật **Xem như người học** hoặc mở tab **🧪 Xem trước khi học** (`/admin/pet-motion?view=preview`) để kiểm thử đầy đủ 3 chế độ (Ở nhà, Bài học 8 câu + mic + đọc mẫu, Trận đấu), thanh Gắn bó 0–1500, Kỹ năng mạnh nhất và Nhật ký sự kiện đánh dấu đỏ các clip chưa duyệt (chỉ đọc, dùng chung `PetRig` với app người học).

## Thêm pet mới

1. Họa sĩ mở template chuẩn [`docs/05-implementation/art/templates/canvas_2160_template.svg`](05-implementation/art/templates/canvas_2160_template.svg), tuân thủ toàn bộ quy chuẩn tại [`STD-ART-STYLE-v1.1.md`](05-implementation/art/STD-ART-STYLE-v1.1.md) (13 layer chuẩn: `aura`, `shadow_ground`, `arm_l`, `body`, `head`, `crown`, `eye_0`, `eye_1`, `mouth_*`, `arm_r`, `prop_*`, `fx`, `pivot_*`) và chạy `qc_check.py` trước khi bàn giao.
2. Đặt PNG vào `public/pets/<id>/c1..c5/` (tên: `body, head, crown, armL, armR, fx, aura, eye0, eye1`) và viết `rig.json` theo mẫu `public/pets/bamboo/rig.json`.
3. Thêm một dòng vào `public/pets/index.json`.
4. Chưa có file tách lớp: dùng `tools/rig-from-image/prep_pet_template.py` (Python, Pillow, numpy, scipy, opencv) với toạ độ bộ phận khai báo ở đầu file.

## rig.json

```json
{ "c3": {
  "size": [203, 274], "ground": [93, 273],
  "slots": [
    { "name": "body", "img": "body", "z": 0, "kind": "body" },
    { "name": "armL", "img": "armL", "z": -1, "kind": "arm", "drive": "armL", "pivot": [40, 146] },
    { "name": "head", "img": "head", "z": 2, "kind": "head", "pivot": [95, 130], "face": true }
  ],
  "eyes": [{ "c": [40, 85], "w": 16, "h": 17, "box": [30, 75, 21, 21] }],
  "mouth": [66, 108, 12],
  "ellipse": [95, 150, 180, 270], "headBox": [95, 65, 190, 130], "headLine": 130 } }
```

`kind`: `body` · `head` (xoay quanh cổ) · `arm` (xoay quanh vai, `maxRot` giới hạn góc) · `bend` (chỏm lá/tai, uốn) · `float` (hiệu ứng trôi) · `flicker` (hào quang chập chờn). `z` âm vẽ sau thân, dương vẽ trước. `face: true` là bộ phận mang mắt và miệng.

## Emoji biểu cảm theo động tác (đặc biệt cho Trứng C1)

Vì cấp C1 (Trứng) chưa có tay, mắt hay miệng tách lớp nên nhiều động tác dễ giống nhau. Mỗi bản chỉnh clip trên server hỗ trợ thêm trường tuỳ chọn `emoji`:

```json
{
  "dur": 0.6,
  "loop": false,
  "tracks": { ... },
  "emoji": { "enabled": true, "char": "✨", "pos": "top-right" }
}
```

- `enabled`: bật/tắt bong bóng emoji biểu cảm cho động tác này (có thể bật riêng cho từng pet-cấp như `bamboo_spirit/c1` ở phạm vi **Riêng pet-cấp này**, hoặc áp dụng chung).
- `char`: ký tự emoji hiển thị (chọn từ bộ biểu cảm gợi ý hoặc nhập tự do, tối đa 16 ký tự).
- `pos`: vị trí nổi quanh pet — `top-right` (mặc định), `top-center`, `top-left`.
- Tên hiển thị tiếng Việt và emoji gợi ý cho cả 34 động tác đặt tại `shared/pet-motion-labels.js`.
- Chỉ hiển thị cho người học khi động tác đó đã được quản trị viên **Đánh dấu hoàn thiện**.
