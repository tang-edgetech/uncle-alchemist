# CLAUDE.md — Uncle Alchemist (project overrides)

This project inherits `C:\xampp83\htdocs\CLAUDE.md` (stack, folder layout, code rules).
Uncle Alchemist is a **game**, not a back-office system, so the sections below **replace or remove** parts of the parent standard. Where this file is silent, the parent standard applies.

Game rules, elements and modes live in `docs/GAME_DESIGN.md`.

---

## 1. Stack (unchanged, with game additions)

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router) + Tailwind. Ant Design **only** for account, options and admin screens, never on the game board |
| Game board | React + CSS Grid + Motion (Framer Motion) animations, Howler.js audio |
| Game state | Zustand store, pure TS rules engine in `apps/web/lib/game/` (no React inside the engine) |
| Backend | Go + chi, MySQL 8 (`sqlx`), Redis (refresh-token revocation, rate limiting) |
| Puzzle generator | Go CLI `apps/api/cmd/puzzlegen/` that generates, solves (uniqueness check) and rates puzzles into MySQL |
| Mobile (later) | PWA first; Capacitor wrapping a static export of the game |

## 2. Removed from the parent standard

| Parent rule | Decision for this game |
|---|---|
| 2-hour inactivity → force logout (§0, §2.30, §5) | **Removed for players.** Players stay signed in (refresh token 30 days, rotated). A paused game never logs anyone out. Kept **only** for the admin panel. |
| `session_timeout_minutes`, `login_url` in Global Settings (§3) | **Removed.** Login is fixed at `/login`. |
| Roles `super_admin` / `admin` / `agent` (§2.8, §4) | **Replaced.** Players are a separate `players` table with no roles. Admin panel uses `admins` with roles `super_admin` (protected) and `admin`. `agent` dropped. |
| Toast on every mutating action (§5) | **Toasts only for account, options and admin actions.** In-game feedback is animation and sound. Progress saving is a silent background sync, with a toast only on failure. |
| Confirm modal on every state change (§0, §5) | **Only for:** Reset level, Quit / abandon a Survival run, Logout, Reset all progress, Delete account. Placing, clearing and undoing tiles never confirms. |
| Notification service, email/SMS/push (§2.33) | **Deferred.** Only password-reset email in MVP, sent through the job queue. |
| File upload strategy (§2.31) | **Not needed.** Avatars are a preset list; no player uploads. |
| DB read replicas plan, multi-tenancy (§2.14, §2.36) | **Deferred.** Keep the API stateless; no further planning now. |
| Rich-text sanitisation (§2.10) | **Not applicable.** The only free text is the display name (plain text, length + charset validated). |
| Monetisation / payments | **None in MVP.** |

## 3. Kept, adapted to the game

- **Auth:** email + password (bcrypt), access JWT 15 min + refresh token 30 days in httpOnly cookies, rotation and revocation in Redis. API also accepts `Authorization: Bearer` so a future Capacitor app works.
- **Guest play:** the full game works without an account; progress is stored locally. On sign-up or login, local progress is merged into the account (best result wins).
- **Anti-cheat:** the client never decides a record. On finishing, the client sends the final grid + elapsed time + mistake count; the server checks the grid against the stored solution and the time against a minimum plausible time before saving stars, bests or Survival scores.
- **Rate limits:** login, sign-up and result submission per IP and per player.
- **Audit log:** admin actions only (puzzle/stage edits, settings, player bans).
- **i18n:** `en.json` / `zh.json`, language stored per player and in Global Settings as default.
- **SEO:** `noindex, nofollow` stays the default until launch; then the landing page becomes indexable, game and admin routes stay `noindex`.
- **Global Settings (trimmed):** `site_title`, `site_description`, `site_logo`, `site_favicon`, `noindex_nofollow`, `timezone`, `default_language`, `maintenance_mode`.
- Envelope, `/api/v1`, modules = handler → service → repository → model, migrations, tests, CI, Docker: unchanged.

## 4. Backend modules

`auth`, `players`, `progress` (stage stars and bests), `survival` (runs and leaderboard), `puzzles` (puzzle bank, serving), `catalog` (elements, recipes, worlds, stages), `settings` (global + per-player options), `admins`.

## 5. Frontend routes

| Route | Purpose |
|---|---|
| `/` | Landing: Play Stages · Recipe Book · Survival · Options · (Account later) |
| `/stages`, `/stages/[world]` | World map and stage select |
| `/play/[stageId]` | Stage game screen, e.g. `/play/2-05` |
| `/play/survival` | Survival run |
| `/recipes` | Recipe book (one chapter per world) |
| `/options` | Settings (also available as an in-game modal) |
| `/login`, `/register`, `/forgot-password` | Account |
| `/admin/*` | Back office (2-hour idle timeout applies here only) |
