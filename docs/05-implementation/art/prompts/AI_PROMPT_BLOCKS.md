# Cowdi — AI prompt blocks (Art Bible v1.1, mục 11)

Cách dùng: `[STYLE BLOCK] + [CHARACTER DNA] + [VIỆC CỤ THỂ] + [NEGATIVE BLOCK]`.
Luôn đính 2–3 sprite chuẩn làm style reference và sprite của nhân vật làm character reference.
Dán nguyên văn, không tự diễn đạt lại. Sửa ảnh thì dùng mẫu F (edit), mỗi lượt 1 thay đổi, tối đa 3 lượt.

## STYLE BLOCK
```text
COWDI STYLE: flat 2D vector chibi mascot illustration for a children's English-learning app. One single character, centered, standing on a plain pure white background. Front view turned slightly three-quarter to the viewer's right. Thick uniform pure black outline of constant width (about 0.6% of the image width) with rounded ends on every outer contour; no outline around eyes, blush or shadows. Flat solid fill colors in a muted pastel palette with exactly ONE hard-edged darker cel-shade tone, shaped as a crescent along the left and bottom edges of each form; light comes from the top right. Shadows on white areas are pale lavender (#C2B8CA). Face: two solid black vertical oval eyes set low and wide apart, the right eye slightly narrower, each with one small round white highlight in its upper-right; two soft pink (#FF86A8) horizontal oval blush marks just below and outside the eyes; no mouth, no nose, no eyebrows. One rounded body that is both head and torso, no neck. Tiny teardrop-shaped arms, two short rounded stubby legs. A solid flat lavender-grey (#A297AB) ellipse ground shadow under the feet, three times wider than tall. Clean sticker-like look, gentle and cute.
```

## NEGATIVE BLOCK
```text
AVOID: gradients, soft or airbrushed shading, multiple shade tones, texture, painterly, watercolor, sketchy or rough lines, brown or colored outlines, thin or tapering lines, variable line weight, 3D render, realistic anatomy, anime eyes, eyelashes, pupils with color, nose, teeth, fangs, drool, scary or angry face, glowing red eyes, detailed fur, background scenery, props not requested, multiple characters, text, letters, watermark, signature, frame, border, blurred drop shadow, glow, sparkles (unless requested), cropped body.
```

## CHARACTER DNA
| ID | Tên hiển thị | Descriptor |
|---|---|---|
| cowdi | Cowdi | a chibi baby dairy cow mascot, big round white head merged with a short rounded white body, one large dark brown patch covering the left eye and upper-left of the head, small brown patch on the right cheek, two short beige horns, two floppy horizontal ears with lavender inner side, pink oval belly patch, tiny stubby arms and legs with brown tips, small tail with a brown tuft |
| bun | Bé Bột | a tiny chibi steamed bun (bao) mascot, round white dough body slightly wider than tall, soft pointed top with four small pleat lines, tiny teardrop arms, two short stubby legs |
| radish | Củ Cải | a chibi white radish (daikon) mascot, upright egg-shaped white body, a fan of four to five wavy-edged green leaves on top with white veined stems, tiny teardrop arms, two short stubby legs |
| bamboo | Bamboo | a chibi bamboo shoot mascot, cone-shaped body wrapped in three overlapping diagonal green husk layers, a small tuft of three pointed tips on top, arms formed by the husk edges, two short stubby legs |
| paddy | Ricy | a chibi rice grain mascot, upright olive-shaped golden-beige body with a small pointed nub on top and one vertical husk crease on the left side, thin stick arms with three tiny fingers, thin stick legs with small feet |
| ginseng | Nhân sâm | a chibi ginseng root mascot, short egg-shaped pale yellow body with a few curved horizontal root rings, three palmate five-lobed green leaves and one stem with a small cluster of red berries on top, short calm eyebrows, tiny teardrop arms, two short stubby legs |

## A — Pet mới (bản gốc C3)
```text
[STYLE BLOCK]
CHARACTER: a chibi {species} mascot, {egg / teardrop / cone / bun}-shaped body in {base color name}, crown on top: {crown description}, signature mark: {one mark}. Personality: {2 adjectives}. Idle pose: standing straight, arms slightly away from the body, looking at the viewer.
Use the attached reference images ONLY for drawing style, outline, face and shadow treatment; do not copy their species.
[NEGATIVE BLOCK]
```

## B — Bảng tiến hoá 5 cấp
```text
[STYLE BLOCK, but replace "One single character, centered" with "An evolution lineup of the same character in five stages, left to right on one shared ground line, evenly spaced"]
CHARACTER: [DNA]. Stage 1 {egg with eyes and a {species} pattern / tiny seedling with two sprout leaves}: very small and round. Stage 2 Baby: small, clumsy, chubby. Stage 3 Junior: the reference design. Stage 4 Super: about 15% wider, bigger crown, confident open pose, a few small {element} accents. Stage 5 Legendary: about 30% wider, grand crown, soft {element} aura behind the body, still cute and gentle. Keep the same face, base color, crown motif and {signature mark} in all five stages. Small label under each: "Seed" "Baby" "Junior" "Super" "Legendary".
[NEGATIVE BLOCK]
```

## C — Biểu cảm
```text
[STYLE BLOCK, but replace the face sentence with the expression below]
CHARACTER: [DNA]. Same design as the attached character reference, unchanged.
EXPRESSION {E-code}: eyes {shape}, mouth {shape}, extra {FX}. Keep blush, outline and colors identical.
[NEGATIVE BLOCK]
```

## D — Tư thế / phụ kiện
```text
[STYLE BLOCK]
CHARACTER: [DNA]. Same design as the attached character reference.
ACTION: {pose}, holding {one prop}. The prop uses the same black outline and flat cel-shading. The prop must not cover the eyes or blush.
[NEGATIVE BLOCK]
```

## E — Khung comic (tầng B)
```text
COWDI COMIC STYLE: same character rules as COWDI STYLE, plus a simple flat background of {Mekong Delta location} with lower saturation and thinner or no outlines, so the characters stand out. Mouths and eyebrows allowed for expression. Characters: {list with DNA}, heights relative to each other: Cowdi 100%, Củ Cải 98%, Ricy 90%, Bamboo 89%, Bé Bột 61%. Scene: {action}. No speech-bubble text (bubbles left empty).
[NEGATIVE BLOCK without "background scenery" and "multiple characters"]
```

## F — Sửa ảnh đã có
```text
Use the attached image as the exact base. Keep the character design, proportions, outline thickness, colors, face, ground shadow and composition exactly unchanged. Change ONLY: {one change}.
```

## Bảng 12 biểu cảm
| Mã | Mắt | Miệng | Mày / FX |
|---|---|---|---|
| E00 idle | oval | none | none |
| E01 happy small | oval | small "u" smile | none |
| E02 joyful | upward arcs ^ ^ | open "D" with pink tongue | blush 20% bigger |
| E03 excited | ovals 115%, two highlights each | wide open "D" | small 4-point sparkles |
| E04 proud | upward arcs | small "u" | raised brows, chest out |
| E05 surprised | ovals 120% | small "o" | "!" mark |
| E06 thinking | ovals looking up to one side | small side line | "?" or three dots |
| E07 worried / encouraging | ovals, brows "/ \" | wavy line | blue sweat drop |
| E08 sad | ovals half lower | inverted "u" | one small tear |
| E09 determined | ovals, brows "\ /" | straight line | none |
| E10 sleepy / asleep | half-lid → curved lines | none / small "o" | "z" |
| E11 dizzy / hit | ">" "<" | wavy line | stars around head |
