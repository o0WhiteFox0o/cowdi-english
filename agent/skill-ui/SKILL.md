---
name: cowdi-ui-ux
description: Use when the user asks to polish, clean up, or restyle the CSS/UI of the cowdi.net ReactJS project so it looks tidy, uncluttered, and is self-explanatory without instructions, following the CUSC IEEE standard in docs/. Edits styling only. Dùng khi cần chỉnh CSS/giao diện cowdi.net cho gọn gàng, sạch mắt, ai nhìn cũng dùng được.
---

# cowdi.net UI/UX Polish (Chỉnh giao diện cowdi.net)

## Goal (Mục tiêu)
Take the finished cowdi.net React code and adjust **CSS/styling only** so that:
- A first-time visitor understands what to do without any guide (không cần hướng dẫn).
- The screen is clean, uncluttered, easy on the eyes (gọn gàng, sạch, không rối mắt).
- The result complies with the CUSC IEEE standard documents in `docs/`.

## Use this skill when (Dùng khi)
- The user asks to "clean up", "polish", "restyle", "làm gọn", "chỉnh CSS", "cho đẹp/dễ nhìn" for cowdi.net.
- The user asks for a UI/UX review followed by CSS fixes.

## Do not use when (Không dùng khi)
- The task is new features, bug fixes, API/routing, Node.js backend, or Mapbox/GIS logic.
- The user wants a redesign that changes page structure or content. Ask first.

## Hard constraints (Ràng buộc bắt buộc)
1. Change styling only: `.css/.scss` files, and `className` / `style` props where unavoidable. Never touch business logic, state, routes, API calls, GIS/Mapbox/Google Platform code.
2. Keep existing class names and component structure. Add new classes only when needed.
3. Do not add new dependencies (UI libraries, fonts via npm) unless the user approves.
4. Never invent clauses of the IEEE/CUSC standard. Quote only what is actually in `docs/`.
5. Make small, reviewable edits. Do not rewrite whole files. Tell the user which files changed.

## Workflow (Quy trình)

### Step 0: Read the standard (Đọc chuẩn)
Browse the `docs/` folder at the workspace root. Read every document about UI, interface, usability, or documentation style. Extract the UI-relevant requirements into `references/ieee-extracted.md` (use the template in that file). If a requirement conflicts with this skill's defaults, **the docs win**. If `docs/` is missing or unreadable, say so and continue with the defaults below.

### Step 1: Map the project (Khảo sát)
- Locate the style entry points (`src/index.css`, `App.css`, component CSS, CSS modules).
- List the main pages/screens and shared components (header, nav, forms, cards, map overlays).

### Step 2: Audit (Kiểm tra tự động)
Run from the project root:
```
node .agent/skills/cowdi-ui-ux/scripts/audit-css.mjs src
node .agent/skills/cowdi-ui-ux/scripts/contrast.mjs "#333333" "#ffffff"
```
(If the skill lives in `.agents/skills/`, adjust the path.) Use the audit to find: too many colors/font sizes/spacings, `!important`, missing focus styles, tiny text, fixed pixel widths, inline styles.

### Step 3: Plan with design tokens (Lập kế hoạch)
Create or update CSS variables from `references/css-tokens-template.css` (colors, type scale, spacing scale, radius, shadow). Map the existing scattered values onto these tokens. Show the user a short plan (what will change, per file) before large edits.

### Step 4: Apply changes (Chỉnh sửa)
Apply `references/ux-checklist.md` in this priority order:
1. Visual hierarchy: one clear primary action per screen; headings > body > captions.
2. Whitespace and alignment: consistent spacing scale; group related items; remove decoration that adds no meaning.
3. Color: one primary, one accent, neutrals. Text contrast at least 4.5:1.
4. Typography: max 2 font families, 5-6 sizes, line-height 1.4-1.6, readable line length.
5. Interactive states: hover, focus-visible, active, disabled, loading, error, empty.
6. Controls: touch targets at least 44x44px, labels visible, consistent button/input styles.
7. Responsive: mobile first, no horizontal scroll, readable at 360px width.
8. Map screens: overlays and controls must not cover the map's main content; keep panels compact and collapsible via CSS where possible.

### Step 5: Verify (Kiểm tra lại)
- Re-run the audit and compare before/after numbers.
- Make sure the project still builds/runs (`npm run build` or `npm start`) and that no logic file was modified.
- Spot-check key screens at 360px, 768px, 1280px if a browser is available.

### Step 6: Report (Báo cáo song ngữ)
Reply in Vietnamese first, then English. Include:
- Files changed and why (file nào, đổi gì).
- Before/after audit numbers.
- Which `docs/` requirements were applied (cite file name and section, only if real).
- Anything left for the user to decide.

## Output style (Phong cách)
Short, concrete, no jargon. Write code comments in English. Explain to the user in Vietnamese unless they write in English.
