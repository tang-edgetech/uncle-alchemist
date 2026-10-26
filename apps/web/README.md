# Uncle Alchemist — web

Next.js 16 (App Router) + Tailwind 4 + Motion + Zustand. Phase 1 prototype: everything runs in the browser, nothing is saved to a server yet.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install pinned dependencies |
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build` then `npm run start` | Production build and server |
| `npm test` | Rules engine, generator and game store tests (Vitest) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run templates` | Regenerate the puzzle frames in `lib/game/templates.json` |

## Routes

| Route | Screen |
|---|---|
| `/` | Landing |
| `/stages` | World map (locked worlds need stars from the previous one) |
| `/stages/[1-4]` | Stage list for a world |
| `/play/[world-stage]` | Game, e.g. `/play/2-05` |
| `/play/survival` | Survival run (unlocks with World 2) |
| `/recipes` | Recipe book, one chapter per world |
| `/options` | Options (also in-game from the pause screen) |

Progress lives in `localStorage` (`uncle-alchemist-progress`). Remove that key to start over.

## Layout

| Path | Contents |
|---|---|
| `lib/game/` | Pure TS engine: elements and recipes, layouts, solver, generator, rules, scoring, board geometry |
| `lib/stores/` | Zustand stores: game state, settings (language, persisted locally) |
| `lib/i18n/` | `en.json`, `zh.json`, `useT()` |
| `lib/hooks/` | Game clock and keyboard shortcuts |
| `components/ui/` | Medallion, gold buttons and frames, icons |
| `components/features/game/` | Board, cell, palette, recipe peek, dialogs, game screen |
| `components/features/menu/` | Landing, grid picker, language toggle |

## Keyboard

`1`–`7` place an element · `Backspace`/`0` erase · `N` notes · `Ctrl+Z` undo · arrows move · `P` pause.
