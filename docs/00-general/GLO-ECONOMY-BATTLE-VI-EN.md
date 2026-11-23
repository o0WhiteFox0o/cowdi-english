# Glossary Việt – Anh – key code (Cowdi Economy & Battle v2.1)

Dùng chung cho code (`shared/game-config.js`), bảng cân bằng trên claude.ai (đã dịch sang tiếng Anh) và tài liệu thiết kế. Key code là tiếng Anh; chữ hiển thị trên UI lấy cột *Tiếng Việt* (lưu ở `labelVi` trong config).

Trong bảng cân bằng, ký hiệu khắc là `S` (strong vs = khắc) và `W` (weak vs = bị khắc). Ba tên pet tiếng Việt giữ nguyên: Nấm Rơm (`mushroom`), Củ Cải Trắng (`radish`), Bánh Bao (`bun`).

| Nhóm | English | Key code | Tiếng Việt | Nghĩa |
|---|---|---|---|---|
| Sheet | Simulator |  | Mô phỏng | Quick 1-vs-1 battle simulator for any two pets (no element effects). |
| Sheet | Element Matchups |  | So hệ | Every element vs every element at equal level, with element effects. |
| Sheet | Pet Matchups |  | So pet | Round robin of all 22 pets, with element effects, group skills and rarity. |
| Sheet | Rarity |  | Độ hiếm | How much stronger a rarer version of the same pet is. |
| Sheet | Economy |  | Kinh tế | How many days a player needs to evolve a pet, by player type. |
| Sheet | Parameters |  | Tham số | Global battle constants used by every formula. |
| Sheet | Evolution |  | Tiến hoá | Base stats at each evolution level C1–C5. |
| Sheet | Elements |  | Hệ | Stat bonuses and special effect of each element. |
| Sheet | Counter Chart |  | Khắc chế | Which element is strong or weak against which. |
| Sheet | Pets |  | Pet | Master list of pets: element, rarity, group, skill minimums. |
| Sheet | Groups |  | Nhóm | Pet families and their shared group skill. |
| Element | Element |  | Hệ | A pet's type (like Pokémon types). Decides stat bonuses and counters. |
| Element | Metal | `metal` | Kim | Element. Crits hit harder (×1.7). Strong vs Wood, weak vs Fire. |
| Element | Wood | `wood` | Mộc | Element. Heals on correct answers. Strong vs Earth, weak vs Metal. |
| Element | Water | `water` | Thủy | Element. Heals when dodging. Strong vs Fire, weak vs Earth. |
| Element | Fire | `fire` | Hỏa | Element. Burns the opponent. Strong vs Metal, weak vs Water. |
| Element | Earth | `earth` | Thổ | Element. Takes less crit damage. Strong vs Water, weak vs Wood. |
| Element | Dark | `dark` | Bóng tối | Element. Lifesteal. Dark and Light counter each other. |
| Element | Light | `light` | Ánh sáng | Element. Shield blocks the first hit. Light and Dark counter each other. |
| Element | Neutral | `neutral` | Vô | Element with no counters either way; balanced stats. |
| Element | Wind | `wind` | Phong | Element. More fast answers (more crits). Wind and Thunder counter each other. |
| Element | Thunder | `thunder` | Lôi | Element. Crits stun the opponent. Thunder and Wind counter each other. |
| Counter | Strong vs (S) |  | Khắc (K) | Attacker deals ×1.2 damage to this element (Parameters!B3). |
| Counter | Weak vs (W) |  | Bị khắc (B) | Attacker deals ×0.8 damage to this element (Parameters!B4). |
| Counter | Multiplier |  | Hệ số | The number damage is multiplied by (1 = normal). |
| Rarity | Rarity |  | Độ hiếm | How rare a pet is. Rarer = small HP/ATK bonus and earlier group skill. |
| Rarity | Common | `common` | Thường | Lowest rarity. Group skill unlocks at C3. |
| Rarity | Rare | `rare` | Hiếm | Second rarity. +8 HP, +1 ATK; group skill at C2. |
| Rarity | Epic | `epic` | Sử thi | Third rarity. +15 HP, +2 ATK; group skill at C1. |
| Rarity | Legendary | `legendary` | Huyền thoại | Highest rarity. +25 HP, +3 ATK; group skill at C1. |
| Rarity | Event | `event` | Sự kiện | Limited-time pets. Same bonuses as Rare. |
| Group | Group |  | Nhóm | Pet family. Pets in the same family share one group skill. |
| Group | Farm | `farm` | Nông trại | Family: Cowdi, Bamboo, Bánh Bao. Skill: Well-Fed. |
| Group | Herb | `herb` | Thảo mộc | Family of plant pets. Skill: Deep Roots. |
| Group | Hunter | `hunter` | Thú săn | Family of predator pets. Skill: Hunter's Instinct. |
| Group | Sea | `sea` | Biển | Family of sea pets. Skill: Wave Rider. |
| Group | Sky | `sky` | Bầu trời | Family of flying pets. Skill: High Ground. |
| Group | Dragon | `dragon` | Rồng | Family of dragons. Skill: Dragon Blood. |
| Group | Spirit | `spirit` | Linh thể | Family of spirit pets. Skill: Spirit Aura. |
| Group skill | Well-Fed | `wellFed` | No đủ | From a 3-correct streak on, every correct answer heals HP. |
| Group skill | Deep Roots | `deepRoots` | Bám rễ | Takes less damage while HP is under 50%. |
| Group skill | Hunter's Instinct | `huntersInstinct` | Bản năng săn | After 3 correct in a row, ATK goes up for the rest of the battle. |
| Group skill | Wave Rider | `waveRider` | Lướt sóng | Extra dodge; after a dodge the next correct answer always crits. |
| Group skill | High Ground | `highGround` | Tầm cao | Attacks ignore part of the opponent's DEF. |
| Group skill | Armor pierce |  | Xuyên giáp | The DEF-ignoring part of High Ground (column name in matchup sheets). |
| Group skill | Dragon Blood | `dragonBlood` | Long huyết | Higher crit multiplier; crits double the element effect. |
| Group skill | Spirit Aura | `spiritAura` | Linh khí | Immune to the first negative effect; takes less damage. |
| Group skill | Streak heal |  | Hồi chuỗi | HP healed per correct answer by Well-Fed. |
| Stat | HP | `hp` | HP | Hit Points. Health; the pet loses when it reaches 0. |
| Stat | ATK | `atk` | Tấn công | Attack. Base damage of each hit. |
| Stat | DEF | `def` | Phòng thủ | Defense. Damage taken = ATK × 100 ÷ (100 + DEF). |
| Stat | AGI | `agi` | Nhanh nhẹn | Agility. Raises dodge and crit chance. |
| Stat | Crit |  | Crit / Chí mạng | Critical hit: a hit that deals ×1.4 damage (×1.7 for Metal). |
| Stat | Crit multiplier | `critMult` | Hệ số crit | How much a crit multiplies damage. |
| Stat | Dodge |  | Né | Chance to take no damage from a hit. |
| Stat | Dmg |  | Sát thương | Damage. |
| Effect | Burn |  | Bỏng | Damage over time: opponent loses % HP each turn for a few turns. |
| Effect | Lifesteal |  | Hút máu | Heals a % of the damage you deal. |
| Effect | Shield |  | Lá chắn | Blocks a number of hits completely. |
| Effect | Stun |  | Choáng | Stunned pet cannot crit on its next turn. |
| Effect | Immunity |  | Miễn nhiễm | Ignores a negative effect (burn, stun). |
| Skill | Listening | `listening` | Nghe | Player's English skill. Adds HP (v2: 4.9×√p). |
| Skill | Speaking | `speaking` | Nói | Player's English skill. Adds ATK and crit multiplier (v2: 0.5×√p and 0.012×√p). |
| Skill | Reading | `reading` | Đọc | Player's English skill. Adds DEF (v2: 2.45×√p). |
| Skill | Writing | `writing` | Viết | Player's English skill. Adds AGI (v2: 1.47×√p). |
| Skill | Bond |  | Độ gắn bó | v2 has no separate bond stat: bond = the pet's own Listening/Speaking/Reading/Writing points (`pet.skills`). |
| Battle | Fast answer |  | Trả lời nhanh | An answer given quickly; it is a guaranteed crit. |
| Battle | Correct answers |  | Số câu đúng | Questions answered correctly in a battle. Each one is a hit. |
| Battle | Draw |  | Hoà | Tie. |
| Battle | ⚠ Mismatch |  | ⚠ Lệch | The side with more correct answers still lost on HP. A balance warning. |
| Battle | Comeback win |  | Thắng ngược | Winning with 1 fewer correct answer, thanks to element/skill. |
| Battle | Row ↓ / Column → |  | Hàng ↓ / Cột → | In matrices: read the row as 'me', the column as 'opponent'. Positive = row wins. |
| Evolution | Level / C1–C5 |  | Cấp / C1–C5 | Evolution stage of a pet (C = stage). C1 is the baby form, C5 the final form. |
| Economy | Milk | `milk` | Sữa | Soft currency earned daily; pays for evolution. |
| Economy | Gem | `gem` | Gem | Hard currency; only from new lessons (first time) in this model. |
| Economy | Element Stone | `stone` | Đá nguyên tố | Rare item: 1 per 10 new lessons. Needed for C3→C4 and C4→C5. |
| Economy | New lesson |  | Bài mới | A lesson done for the first time (repeats give no Gem/Stone). |
| Economy | Casual |  | Thường | Player type: 1 new lesson/day. |
| Economy | Diligent |  | Chăm | Player type: 2 new lessons/day. |
| Economy | Grinder |  | Cày chay | Free-to-play player who grinds a lot: 3 new lessons/day, spends no money. |
| Economy | Bottleneck |  | Nút thắt | The resource that takes longest to collect, so it sets the evolution date. |
| Economy | Out of lessons |  | Hết bài | Needs more new lessons than the app has (206). |
| Sheet use | Yellow cell |  | Ô vàng | Input cell: change it to test a scenario. All other cells are formulas. |
| Sheet use | Reference pet |  | Pet tham chiếu | The pet used as the base for the Rarity comparison (Rarity!B1). |
| Sheet use | Element index |  | STT hệ | Helper number: position of the element in the Counter Chart. |
