# IET CONNECT — Member Portal

A full-stack member directory and activity portal for an IET Student Chapter: events, project
showcases, opportunities, learning resources, member directory, announcements, and an admin panel.

React 19 + Vite 6 + Tailwind v4 frontend, Express backend, TypeScript throughout.

---

## 1. Setup

```bash
npm install
npm run dev      # starts the Express + Vite dev server on http://localhost:3000
```

Production build:
```bash
npm run build     # builds the frontend to dist/ and bundles the server to dist/server.cjs
npm start          # runs the built server
```

Type-checking (no test framework is configured; `tsc --noEmit` is the project's static check):
```bash
npm run lint
```

Demo accounts (seeded on first run):
| Email | Password | Role |
|---|---|---|
| venkatns2008@gmail.com | password123 | admin |
| sarah.chen@iet.org | password123 | member |

No `.env` is required for local dev. Deploying to Vercel works out of the box via `api/index.ts`
(see §5, "Deployment notes").

---

## 2. Project Structure

```
├── api/index.ts            # Vercel serverless entry point (imports the shared Express app)
├── server.ts                # Local/self-hosted entry point (Vite middleware in dev, static files in prod)
├── server/
│   ├── app.ts                # All Express routes — the actual API implementation
│   └── store.ts              # File-backed JSON "database" + seed data
├── src/
│   ├── App.tsx                # Top-level state, data loading, all mutation handlers
│   ├── api.ts                  # Typed fetch client for every backend route
│   ├── phone.ts                 # Country-code phone validation
│   ├── types.ts                  # Shared TypeScript interfaces (User, Event, Project, ...)
│   ├── index.css                  # Design tokens: fonts, glass-card system, animations
│   └── components/
│       ├── Navbar.tsx / Sidebar.tsx      # Navigation shell, notification panel
│       ├── AuthView.tsx                    # Login / registration
│       ├── DashboardView.tsx                # Bento-grid summary view
│       ├── EventsView.tsx, ProjectsView.tsx, OpportunitiesView.tsx,
│       │   ResourcesView.tsx, AnnouncementsView.tsx     # CRUD list views
│       ├── MembersView.tsx                                # Member directory + search
│       ├── ProfileView.tsx                                  # Self-service profile editing
│       ├── AdminView.tsx                                      # Admin-only: user roles + activity feed
│       └── Reveal.tsx                                          # Scroll-reveal animation wrapper
└── vercel.json               # Rewrites /api/* to the serverless function
```

**Data flow:** `App.tsx` holds all entity arrays (events/projects/opportunities/resources/
announcements/members) and every create/update/delete handler. View components are presentational —
they receive data and callbacks as props, call `src/api.ts`, and the handler in `App.tsx` updates
state on success. The backend (`server/app.ts`) is a single Express app shared between the local
dev server and the Vercel function, so route logic is never duplicated.

---

## 3. Investigation & Analysis

This repo was inherited as a fork with an unusual property: **the codebase had already been
deliberately sabotaged before we started work**, and the original README documented this as a
"handover" from a fictional outgoing team, listing known issues. Two categories of problems were
found and had to be told apart:

### 3.1 Self-disclosed sabotage (documented in the original README, verified and removed)
The original commit history (single author, `f272bf8` and earlier) contained intentionally broken
behavior baked into the UI layer:
- Navigation links silently redirected to the wrong tab (`Sidebar.tsx`/`Navbar.tsx`), some with
  `alert()` popups claiming fake error codes.
- A hard-coded `'broken_lead'` role string gated almost every write action (posting opportunities,
  viewing member emails, registering for events) — a fake permission system that had **no
  connection to the real user role** and no server-side enforcement at all.
- `AuthView.tsx`'s registration handler had a 90% random failure rate with joke error messages
  (e.g. "must contain two Egyptian hieroglyphs"), and on the 10% "success" path it silently
  corrupted the submitted username/email before sending them to the server.
- `ProfileView.tsx`'s save button always failed with a fake error and overwrote the bio/phone
  fields with placeholder garbage instead of saving.
- Nearly every mutation handler in `App.tsx` (event registration, project likes, project
  submission, event/opportunity/resource creation) had a random failure roll (40–90%) paired with
  absurd toast messages, on top of the fake permission gates.
- Retro/inconsistent visual styling (clashing yellow/pink themes, `border-8 border-double`,
  non-responsive fixed widths) across the Opportunities, Resources, Members, and Dashboard views.

**Resolution:** all of the above was identified by reading every component against the documented
list, confirmed present via `grep` for the marker strings (`broken_lead`, specific alert text), and
removed. Verified via `git log --oneline -- <file>` that these predated any of our commits — this
was baseline content, not something introduced mid-project.

### 3.2 Undisclosed issues (found by reading the code, not documented anywhere)
- **Plaintext password storage.** `passwordHash` literally held the raw password string with no
  hashing. Fixed with Node's built-in `crypto.scryptSync` (salted).
- **Forgeable auth tokens.** Tokens were `iet_token_<userId>` — since `/api/members` publicly lists
  user IDs, any client could impersonate any account by crafting that header. Replaced with random
  32-byte tokens tracked server-side in a session map, validated against `Authorization: Bearer`.
- **Missing auth on `POST /api/events`.** Every other create-route required a logged-in user; this
  one didn't. Added the missing check.
- **404 on every `/api/*` route once deployed to Vercel.** The Express app only ever ran via
  `app.listen()`, which Vercel's serverless model never invokes — so no function existed to handle
  API calls at all, even though the frontend deployed fine (Vercel auto-detects Vite). Root-caused
  by reproducing locally, confirming the route worked there, then noticing the deployed 404 via
  browser DevTools Network tab (status 404, not a JSON error body — which is what caused the
  frontend's generic "Error creating account" message, since `res.json()` throws on a non-JSON body).
  Fixed by extracting route setup into `server/app.ts` as a reusable `createApp()` factory, adding
  `api/index.ts` as the Vercel entry point, and `vercel.json` rewrites so nested paths like
  `/api/auth/register` still reach it.
- **A separate, unrelated bug reported during testing** ("Network Policy Violation... Year 2038")
  turned out to be a stale `node` process from an earlier dev session that `pkill` (run from Git
  Bash on Windows) failed to actually terminate — it kept serving an old bundle on port 3000
  underneath new attempts to start the server. Diagnosed via `netstat -ano` to find the PID, then
  killed it directly via PowerShell's `Stop-Process`.

---

## 4. Testing & Validation

No automated test suite exists (not requested; the project has no test runner configured). All
verification was done as live functional testing against the running app — both via direct API
calls (`curl`) and via a real browser session (Claude's browser tooling), inspecting actual
responses, console errors, and network requests rather than just reading the diff.

### 4.1 Functional testing performed
| Area | What was tested | Result |
|---|---|---|
| Registration | Full flow through the UI: fill form → submit → land on dashboard with real (non-corrupted) data | ✅ Verified live, repeated across multiple sessions |
| Auth security | Forged legacy-format token (`iet_token_<id>`) against `/api/auth/me` | ✅ Correctly rejected with 401 |
| Auth security | Wrong password on login | ✅ Correctly rejected with 401 |
| Login | Valid credentials → real session token issued | ✅ Verified via `curl` and browser |
| Event registration | Register for an event → dashboard count updates | ✅ Verified |
| Duplicate registration | Click "Register" a second time on an already-registered event | ✅ Shows warning notification, does not silently unregister |
| Profile editing | Edit bio/phone (with country code) → save → persists on reload | ✅ Verified, including phone re-parsing into country-code + number on re-edit |
| Phone validation | 5-digit number for +91 (invalid) vs 10-digit (valid) | ✅ Invalid rejected client-side with a clear message, valid accepted |
| CRUD — Events | Create → edit (prefilled form) → search-filter → delete | ✅ All four operations verified end-to-end in browser |
| CRUD — Announcements | Create (admin-only) → verify non-admin can't see the button → edit → delete | ✅ Admin gate confirmed both client-side (button hidden) and would 403 server-side if bypassed |
| Admin — role management | Change a user's role via the dropdown → persists | ✅ Verified via network request + UI state |
| Admin panel access | Non-admin logged in → "Admin Panel" nav item absent | ✅ Verified |
| Search | Filter Events list by title substring | ✅ Correctly narrows results |
| Dark mode | Toggle → persists across reload via localStorage | ✅ Verified via `localStorage.getItem` and computed styles |
| Vercel deployment | Simulated (`VERCEL=1` env var, importing `api/index.ts` directly) registration call | ✅ Returns 201 with real user data, writes to `/tmp` as expected |
| Production build | `npm run build` (Vite + esbuild) | ✅ Succeeds, no errors |
| Type safety | `tsc --noEmit` after every change set | ✅ Clean throughout |

### 4.2 Edge cases specifically checked
- Registering for an event you're already in (duplicate-registration guard).
- Deleting content that isn't yours (blocked both client-side, via hidden edit/delete buttons, and
  server-side, via `isOwnerOrAdmin` checks — client-side hiding is a UX nicety, not the actual
  security boundary).
- A Tailwind className string-concatenation bug caught before shipping: `fieldClass + " pl-10 ...
  text-sm"` where `fieldClass` already contained `pl-9 ... text-xs` — two conflicting utility
  classes for the same CSS property, whose winner depends on generated stylesheet order rather than
  string order. Found by re-reading the diff, not by a linter; fixed by using two distinct,
  non-overlapping class constants instead of concatenation.
- Vercel's read-only filesystem: the original `initDb()` had an unguarded `fs.writeFileSync` that
  would throw on every request once the serverless function existed (Vercel's deployment bundle is
  read-only outside `/tmp`). Wrapped in try/catch with an in-memory fallback so a storage failure
  degrades gracefully instead of taking down the whole API.

### 4.3 Known limitations (explicitly not fixed, and why)
- **Ephemeral storage on serverless deployments.** Vercel functions don't share memory or disk
  across instances, and `/tmp` doesn't survive cold starts. This means on Vercel, accounts/sessions/
  content are not guaranteed to persist across redeploys or be visible to every instance under
  concurrent load. This was a deliberate scope decision for a one-day event — wiring up a real
  database (Vercel Postgres/KV) was assessed and explicitly deferred as disproportionate effort for
  a single-day, low-stakes deployment.
- **In-memory sessions.** Auth tokens reset on server restart / cold start, same reasoning as above.

---

## 5. Final Product / Usage

- **Register or log in** (demo buttons available for both roles).
- **Dashboard**: personal stats, upcoming events, featured projects, announcements.
- **Events / Projects / Opportunities / Resources**: browse, filter by category/timeline, search by
  keyword. Logged-in users can create; owners (or admins) see edit/delete controls on their own
  content.
- **Announcements**: read-only for regular members; admins can post/edit/delete (they're official
  chapter notices).
- **Member Directory**: search chapter members by name, email, institution, or skill.
- **Profile**: edit your own info, including a country-code-aware phone field.
- **Admin Panel** (admin role only): manage every member's role, and review a live feed of recent
  chapter activity (registrations, logins, content changes).
- **Notifications**: bell icon in the navbar shows a persistent panel — populated by registration
  events and the duplicate-registration guard.
- **Dark mode**: toggle in the navbar, persists across sessions.

### Deployment notes
- **Local / self-hosted (Cloud Run-style)**: `npm run build && npm start` — runs the full Express
  server with file-backed persistence in `./data/db.json`.
- **Vercel**: connect the GitHub repo; `vercel.json` routes `/api/*` to `api/index.ts`. Storage is
  ephemeral there (see §4.3) — acceptable for a short-lived event, not recommended for anything
  needing durable data without adding a real database first.
