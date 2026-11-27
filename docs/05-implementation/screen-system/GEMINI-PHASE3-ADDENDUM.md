# Đợt 3 — Bổ sung và đính chính (trả lời báo cáo Bước 0)

> Từ Sonny/Claude, 27/11/2026. Áp dụng cho nhánh `feat/screen-system-p3`. Ưu tiên hơn `GEMINI-SCREEN-SYSTEM-PHASE3.md` ở các điểm dưới đây.

## 1. Đính chính tên vùng và NPC (quan trọng)

Tên đề xuất trong báo cáo Bước 0 **sai**. Không dùng "Thảo Nguyên Gió", "Cô Ba", "Bác Bảy".

| Mã | Tên đúng | Ai được làm NPC |
|---|---|---|
| BD | **Bến Đò Ông Tư** | `ong_tu` (ông Tư) + nhân vật người trong `HUMAN_CAST` |
| TG | **Tháp Gió** | pet chủ nhà `mimi`, `owlbert`, `storm` + nhân vật người trong `HUMAN_CAST` |
| VS | **Vườn Sữa** | pet chủ nhà `cowdi`, `bamboo`, `bamboo_spirit` + nhân vật người trong `HUMAN_CAST` |

**Luật:** NPC chỉ được là người trong `HUMAN_CAST` (Mai, Minh, Lan, thầy Tom, anh Khoa, ông Tư) hoặc pet chủ nhà của vùng. Không tạo nhân vật mới. Thêm test dùng `isValidNpc()`.

## 2. File đi kèm (chép vào repo, không sửa nội dung dữ liệu)

| File | Ghi chú |
|---|---|
| `shared/regions.js` | Bản **đầy đủ** theo Story Bible (không phải bản tối thiểu): `REGIONS`, `RING`, `VARIANTS`, `UNIT_REGION` (mọi unit), `getUnitRegion`, `getRegionVariant`, cộng phần bổ sung cho Đợt 3: `REGION_COLOR` (nền khi chưa có ảnh vùng), `BOSS_TINT` (màu Boss theo vùng), `REGION_BRIEF` (tóm tắt để soạn câu dẫn BD/TG/VS) |
| `shared/human-cast.js` | `HUMAN_CAST` + `isValidNpc(npcId, region, REGIONS)` |
| `public/image/boss/fog.svg` | Sprite Boss sương. Tô màu bằng CSS variables `--fog-body`, `--fog-shade`, `--fog-eye` lấy từ `BOSS_TINT[region]`. **Phải nhúng inline** (component React / `?raw` + `dangerouslySetInnerHTML` sau khi kiểm nội dung tĩnh, hoặc chuyển thành component JSX) để biến CSS áp được; dùng `<img>` thì chỉ có màu mặc định |

- Ưu tiên `fog.webp` nếu sau này Sonny thêm; nếu không có thì dùng `fog.svg`; không có cả hai thì bản CSS.
- Trạng thái Boss bằng CSS: rung khi bị đánh (`transform`), thu nhỏ + mờ dần khi "tan biến", trượt ra phải khi "bỏ chạy". Tôn trọng `prefers-reduced-motion`.
- Test thêm cho `regions.js` theo STORY-BIBLE 2b.4 mục 1, 3 (mọi `unitId` trong `shared/units.json` có trong `UNIT_REGION` và ngược lại; `BD` chỉ ở `s1-u10`, `int-u1`, `exam-intro`). Nếu `units.json` có unit không có trong bảng: **dừng, báo Sonny**, không tự gán vùng.

## 3. NPC mặc định cho 12 bài `int-u1`–`int-u3` (`story.npc`)

Trước khi gán: **đọc `reading` của từng bài**. Nếu đoạn văn đã có nhân vật trong `HUMAN_CAST`, ưu tiên nhân vật đó. Không có thì dùng bảng dưới.

| Unit / vùng | Bài | `story.npc` |
|---|---|---|
| int-u1 · BD | greetings | `ong_tu` |
| | family | `minh` |
| | colors | `lan` |
| | numbers | `ong_tu` |
| int-u2 · TG | school | `tom` |
| | weather | `owlbert` |
| | jobs | `khoa` |
| | body | `lan` |
| int-u3 · VS | clothing | `mai` |
| | house | `minh` |
| | emotions | `bamboo` |
| | hobbies | `cowdi` |

`story.introVi` (≤ 30 chữ): NPC nêu một chuyện nhỏ ở vùng cần người học giúp, liên quan chủ đề bài. Ví dụ `greetings`: "Sương dày quá, ghe không qua được. Con giúp ông chào khách nha!" (ông Tư). Không đổ lỗi, không nhắc Gem/tiền.

## 4. Câu dẫn (156 câu `draft`)

- Mỗi câu phải dựa trên `REGION_BRIEF` của vùng và việc của màn. Không bịa địa danh, món ăn, nhân vật ngoài Story Bible.
- Câu chuyện ở BD xoay quanh bến đò, đò, sông, khách qua sông; TG quanh tháp gió và gió; VS quanh vườn, đàn gà, rừng trúc.
- Giữ `status = 'draft'`. Sonny duyệt trong tab Kho dẫn nhập.

## 5. Không cần `STORY-BIBLE-IMPLEMENTATION.md` cho Đợt 3

Mọi dữ liệu Đợt 3 cần từ tài liệu đó đã có trong `shared/regions.js` và `shared/human-cast.js`. Phần còn lại của Story Bible (nhiệm vụ tiến hoá, bỏ trạng thái `sick`…) **không** thuộc Đợt 3, không làm.

## 6. Ghi chú cho Đợt 4

Artboard F-07 Chợ nổi trên canvas có nhãn "Cô Ba bán trái cây": đó là mô tả tạm, **không** phải nhân vật chính thức. Khi làm F-07, người bán hàng không có tên, hoặc dùng pet chủ nhà vùng Chợ Nổi (`bun`).

## 7. Đã đồng ý trong báo cáo

- Kế hoạch 3.1–3.5 của báo cáo: đồng ý, với các đính chính trên.
- Sửa `MatrixTab.jsx` (`u.lessons || u.lessonIds`): đồng ý, ghi trong PR.
- SFX bằng Web Audio API (`useSound.jsx`): đồng ý.
