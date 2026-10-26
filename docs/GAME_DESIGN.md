# Uncle Alchemist — Game Design

Status: v0.4 (2026-10-26). Art direction: **round medallions with metal rims**: bronze = base element, silver = two-element compound, gold = three-element compound. Element art and recipes live in `apps/web/lib/game/elements.ts`. Phase 0 and Phase 1 are done.

### Board style

- **Regions:** gold lines between regions.
- **Recipe cages (option A):** a rounded tray tinted in the compound's colour, with a solid border and soft glow in that colour (its lighter tint when the colour is too dark for the wooden board). L-shaped 3-cell cages follow the cell outline with square corners. No dashed lines, no corner badges.
- **Hints:** every empty cell inside a cage shows the cage's compound medallion faded (≈42% opacity, desaturated), e.g. a faded Ice in both cells of an Ice cage. The recipe peek card (tap a cage cell) shows the ingredients. Hints never say which cell gets which ingredient.
- **Input:** drag an element from the palette onto a hole, or select a hole and tap an element.

### Puzzle templates

Challenges come from fixed **frames** (`apps/web/lib/game/templates.json`, 6 per grid size). A frame fixes the regions, the cage positions and which cells are given. Each challenge picks a frame and swaps which element plays which role, so the same frame becomes many different puzzles. Swaps keep the solution unique; for 3-cell cages only swaps that land on a defined three-element compound are used. Rebuild frames with `npm run templates`.

## 1. Concept

A Sudoku-style logic puzzle where the symbols are alchemical elements. Players place **base elements** so that every row, column and region holds each one exactly once. From 5×5 up, **recipe cages** show a **compound** (for example Ice); the cells inside the cage must hold that compound's ingredients (Wind + Water) in some order.

## 2. Rules

1. Grid N×N uses N base elements.
2. Each row, each column and each region contains every base element exactly once.
3. A recipe cage (2 or 3 orthogonally connected cells) shows a compound. Its cells hold exactly that compound's ingredients, with no element repeated inside the cage.
4. Every puzzle has exactly one solution (enforced by the generator's solver).

## 3. Grids and regions

| Grid | Base elements | Regions | Clues |
|---|---|---|---|
| 4×4 | Wind, Water, Soil, Fire | 2×2 boxes | Givens only |
| 5×5 | + Nature | Irregular (jigsaw) | Givens + 2-cell cages |
| 6×6 | + Light | 2×3 boxes | Givens + 2-cell cages |
| 7×7 | + Shadow | Irregular (jigsaw) | Givens + 2-cell and 3-cell cages |

## 4. Elements

### 4.1 Base elements

| Key | Name | Introduced |
|---|---|---|
| `wind` | Wind | 4×4 |
| `water` | Water | 4×4 |
| `soil` | Soil | 4×4 |
| `fire` | Fire | 4×4 |
| `nature` | Nature | 5×5 |
| `light` | Light | 6×6 |
| `shadow` | Shadow | 7×7 |

### 4.2 Tier 1 compounds (2-cell cages)

| | Wind | Water | Soil | Fire | Nature | Light |
|---|---|---|---|---|---|---|
| **Water** | Ice | | | | | |
| **Soil** | Sand | Mud | | | | |
| **Fire** | Lightning | Steam | Iron | | | |
| **Nature** | Seed | Tree | Mushroom | Campfire | | |
| **Light** | Aurora | Rainbow | Crystal | Sun | Flower | |
| **Shadow** | Ghost | Poison | Cave | Smoke | Thorn | Eclipse |

21 compounds; each pair of base elements maps to exactly one compound.

### 4.3 Tier 2 compounds (3-cell cages, 7×7)

| Compound | Ingredients | Story recipe |
|---|---|---|
| Brick | Water + Soil + Fire | Mud + Fire |
| Glass | Wind + Soil + Fire | Sand + Fire |
| Storm | Wind + Water + Fire | Lightning + Water |
| Glacier | Wind + Water + Soil | Ice + Soil |
| Sword | Soil + Fire + Nature | Iron + Nature |
| Forest | Water + Soil + Nature | Tree + Soil |
| Lantern | Fire + Nature + Light | Campfire + Light |
| Prism | Soil + Light + Shadow | Crystal + Shadow |
| Nightmare | Wind + Shadow + Light | Ghost + Light |
| Swamp | Water + Soil + Shadow | Mud + Shadow |

Every set of three different base elements maps to at most one tier 2 compound. More can be added per world.

## 5. Modes

### 5.1 Stages

Defined in `apps/web/lib/game/stages.ts`. The prototype has 10 stages per world (later target: 20–30).

| World | Grid | Stages | Unlocks with | Teaches |
|---|---|---|---|---|
| 1 — Uncle's Workshop | 4×4 | 10 | Open from the start | Basic rules |
| 2 — The Greenhouse | 5×5 | 10 | 12 ★ in World 1 (of 30) | Nature, jigsaw regions, 2-cell cages |
| 3 — The Observatory | 6×6 | 10 | 15 ★ in World 2 (of 30) | Light, more recipes |
| 4 — The Cellar | 7×7 | 10 | 18 ★ in World 3 (of 30) | Shadow, 3-cell cages |

- **Inside a world**, stages open one at a time: a stage opens once the previous one is solved (any stars).
- **Between worlds**, the next world needs a star total in the previous one, so players must clear a fair number of easier stages, and play them well, before moving up.
- **Difficulty ramp:** every stage is a fixed frame plus a fixed element swap. Early stages reveal extra givens (stage 1 of a 4×4 world: +3, 5×5: +6, 6×6: +8, 7×7: +10), shrinking to none by stage 10.
- Stars (0–3): 0 not yet solved · ★ solved · ★★ solved with ≤ 2 mistakes · ★★★ solved with 0 mistakes under par time. Replaying keeps the best result.
- A mistake is a wrong full-board check, or a placement that breaks a row/column/region/cage rule.
- Progress (stars, best times) is stored on the device until accounts arrive.

### 5.2 Survival

- Endless chain of generated puzzles: 3 at 4×4, then 3 at 5×5, then 3 at 6×6, then 7×7 forever.
- One shared countdown starts at 3:00. Each solve adds time (+45s / +60s / +90s / +120s by size).
- 3 lives. A rule-breaking placement costs a life and 10 seconds.
- Score = Σ (N² × 10) per solved puzzle + remaining-time bonus. Personal best plus a global top 100.

## 6. In-game controls

- Tap a cell, then tap an element in the bottom palette (drag-and-drop optional).
- Notes (pencil marks), Undo, Erase.
- **Recipe peek:** tapping (mobile) or clicking (web) an empty cell inside a recipe cage opens a small card showing the cage's compound and its ingredients (e.g. Ice = Wind + Water). It never shows which cell gets which ingredient. Free, unlimited, and does not affect stars.
- **Pause** (hides the board, stops the timer) and **Reset** (confirm dialog, clears the board, timer restarts).
- No hints in MVP.

## 7. Options

Music volume · SFX volume · Language (EN / 中文) · Highlight rule conflicts · Show timer · Input mode (tap / drag) · Vibration (mobile) · Reduce motion · Account (sign in, sign out, reset progress, delete account).

## 8. Accounts and saving

- Guest by default, with progress in local storage.
- Account: email + password, display name, preset avatar.
- Saved: stage stars and best time, Survival personal best, Codex discoveries, options.
- Local progress merges into the account on sign-in (best result wins).

## 9. Alchemy Codex

The recipe book is organised in **chapters, one per world**: each chapter lists only the base elements and recipes that world introduces (World 1: the four base elements, no recipes; World 2: Nature + 10 recipes; World 3: Light + 5 recipes; World 4: Shadow + 6 two-element and 10 three-element recipes). Chapters for locked worlds show their elements and recipes greyed out under a lock notice. Every element and compound colour is at least ΔE2000 15 from every other, enforced by `lib/game/palette.test.ts`. Later: solving a cage for a compound the first time adds it to the Codex with its recipe and a short line of lore. The Codex screen shows the discovered compounds and silhouettes for the undiscovered ones. It opens from the landing page and from the pause menu during a game. In-game recipe peek (§6) works for every compound, discovered or not.

## 10. Data model (sketch)

`players`, `player_refresh_tokens`, `player_options`, `elements`, `recipes`, `recipe_ingredients`, `worlds`, `stages`, `puzzles` (grid size, regions, cages, givens, solution, difficulty), `stage_progress`, `survival_runs`, `codex_entries`, `admins`, `admin_roles`, `audit_logs`, `global_settings`, `jobs`.

## 11. Build plan

| Phase | Deliverable |
|---|---|
| 0 ✅ | C3 chosen; all 7 bases and 21 + 10 compounds drawn |
| 1 ✅ | Playable prototype (`apps/web`): TS rules engine, seeded generator with uniqueness check, 4×4–7×7 boards, palette, notes, undo, erase, recipe peek, pause, reset, win with 0–3 stars, EN/中文 (local only) |
| 2 | Difficulty rating + tuning; Go port of the generator; seed 100 stage puzzles |
| 3 | Monorepo scaffold, MySQL migrations, auth (guest + account), progress sync |
| 4 | Stages mode end-to-end: world map, stars, unlocks, server-validated results |
| 5 | Survival mode + leaderboard |
| 6 | Codex, Options, i18n (EN/中文), audio, animations |
| 7 | Admin panel (stages, puzzles, players, settings), Docker, CI, PWA |
| Later | Capacitor Android/iOS, Daily Challenge, 8×8/9×9 worlds |
