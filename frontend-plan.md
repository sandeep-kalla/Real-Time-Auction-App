# Frontend Plan — Mini Auction System (Real‑Time Bidding)

> Tech: **React + Vite + JavaScript**, React Router, React Query, Socket.IO client (or native WS), Tailwind (or your preferred CSS utility), Zod/Yup for validation, Day.js for time.

## Milestone 0 — Project & Repo

- [ ] Create monorepo or two repos (`frontend/`, `backend/`). If single repo, ensure CI/CD and Docker can build both.
- [ ] Initialize React + Vite + TypeScript project.
- [ ] Set base environment variables (read from `.env` at build time):
  - [ ] `VITE_API_BASE_URL`
  - [ ] `VITE_WS_URL`
  - [ ] `VITE_APP_ENV` (`development`/`production`)
- [ ] Install core deps: React Router, React Query (or SWR), Socket.IO client (or native `WebSocket`), Zod/Yup, Day.js, Tailwind (optional), a toast/notification lib.
- [ ] Establish commit hooks (Prettier, ESLint) and conventional commits.

## Milestone 1 — Routing, Layout & Design System

- [ ] App shell with header, left nav (optional), main content, footer.
- [ ] Theming + typography scale, buttons, inputs, badge, modal, tooltip, card components.
- [ ] Route structure:
  - `/` — Home / Public auction listings
  - `/auction/:id` — Public auction room (live highest bid + timer)
  - `/sell/new` — Create auction (seller)
  - `/sell/mine` — Seller dashboard (my auctions + statuses)
  - `/notifications` — Inbox (persisted notifications)
  - `/admin` — Admin (bonus)
  - `/auth/*` — Login/Register/Logout (if using Supabase Auth UI, wrap screens)

## Milestone 2 — Authentication (Required for sellers/bidders)

- [ ] Choose auth: **Supabase Auth** (email/password or magic link).
- [ ] Implement auth pages (login/register/forgot).
- [ ] Store auth session securely; refresh/restore on reload.
- [ ] Role tagging in profile metadata (`buyer`, `seller`, both).
- [ ] Route guards: private routes for seller/admin; public access to listing/auction view.
- [ ] Attach JWT to API requests (Authorization header).

## Milestone 3 — Data Fetching & State

- [ ] Configure React Query client with retry/backoff and query keys.
- [ ] API layer: typed fetchers for auctions, bids, notifications, decisions, counter‑offers.
- [ ] Cache strategies:
  - [ ] List queries (`/auctions`, `/auctions?status=active|upcoming|ended`).
  - [ ] Detail query (`/auction/:id`), merged with WS events.
- [ ] Global stores (if needed) for session, toasts, and real‑time connection status.

## Milestone 4 — Public Auction Listing (Home)

- [ ] Filters: status (upcoming/active/ended), text search, sort by go‑live time.
- [ ] Auction card: item name, thumbnail, start price, bid increment, go‑live, duration, status badge.
- [ ] CTA to view auction room.
- [ ] Empty/loading/error states.

## Milestone 5 — Auction Creation (Seller)

- [ ] Form fields: item name, description, starting price, bid increment, go‑live date/time, duration (minutes/hours).
- [ ] Client-side validation (Zod/Yup): positive numbers, increment > 0, duration > 0, go‑live in future.
- [ ] Submit to backend; display success/failure.
- [ ] Post‑create redirect to seller dashboard.
- [ ] UX affordances: helper text for increment rules; time zone hint (IST shown and UTC normalized).

## Milestone 6 — Auction Room (Public + Authenticated Actions)

- [ ] Read-only view for anonymous; “Login to bid” prompt.
- [ ] Real‑time highest bid display.
- [ ] Countdown timer to start and to end; handle phases: **scheduled → live → ended**.
- [ ] Bidding panel (for logged‑in users during live phase):
  - [ ] Input next bid (pre-fill with `current + increment`), disable when invalid.
  - [ ] Place bid action; inline validation errors from server.
- [ ] Participants count + connection status.
- [ ] Live events feed (new bids, outbid notices, system messages).
- [ ] Accessibility: aria-live regions for real-time messages.

## Milestone 7 — WebSocket Integration

- [ ] Connect to WS on room mount; join `auction:{id}` room.
- [ ] Handle inbound events:
  - `auction:state` (scheduled/live/ended + times)
  - `bid:placed` (amount, user, timestamp)
  - `bid:outbid` (targeted notification to losing bidder)
  - `auction:ended`
  - `seller:decision_required`
  - `seller:accepted` / `seller:rejected`
  - `counter:offer` (seller→highest bidder)
  - `counter:accepted` / `counter:rejected`
- [ ] Optimistic UI for own bids; rollback on server rejection.
- [ ] Reconnect/backoff, and buffer events while offline.
- [ ] Sync WS updates into React Query cache.

## Milestone 8 — Notifications (In‑App)

- [ ] Toasts for immediate alerts (new bid, outbid, decisions, counter‑offers).
- [ ] Notifications center page:
  - [ ] Paginated list of persisted notifications (from backend).
  - [ ] Mark read/unread; mark all read.
- [ ] Badge counter in header; live updates via WS.

## Milestone 9 — Seller Dashboard & Post‑Auction Flow

- [ ] “My Auctions” table with statuses, highest bid (if any), next action.
- [ ] Ended auction with highest bid → show **Accept**, **Reject**, **Counter‑Offer** buttons.
- [ ] Counter‑offer modal: input proposed amount; client‑side validation.
- [ ] Show decision history and timestamps.

## Milestone 10 — Buyer Counter‑Offer UX

- [ ] When counter‑offer arrives via WS, open action modal with **Accept**/**Reject**.
- [ ] Show countdown (optional) or note that auction is closed but negotiation is ongoing.
- [ ] Reflect final outcome (accepted/rejected) and lock further actions.

## Milestone 11 — Errors, Edge Cases & Guards

- [ ] Disallow bidding before start/after end (UI + server errors surfaced).
- [ ] Enforce min increment on client side; still rely on server validation.
- [ ] Handle simultaneous bids → show “You were outbid” quickly.
- [ ] Handle auction cancelled/invalidated scenarios (rare).

## Milestone 12 — Accessibility, i18n & Responsiveness

- [ ] Keyboard navigation for forms and modals.
- [ ] Proper labels, aria attributes for live regions.
- [ ] Responsive layout for mobile/desktop; test small screens.
- [ ] Optional: i18n scaffolding for strings.

## Milestone 13 — Testing

- [ ] Unit tests for form validation and helpers (e.g., next-min-bid calculation).
- [ ] Component tests for AuctionCard, AuctionRoom header, BidPanel.
- [ ] Mock WS for tests; verify event handling and cache merging.
- [ ] E2E tests (Playwright/Cypress): happy path bidding, outbid flow, seller decision, counter‑offer accept/reject.

## Milestone 14 — Build, Docker & Deployment Integration

- [ ] Build static assets (`/dist`).
- [ ] Ensure backend serves `/dist` as static files in production.
- [ ] Use a **single Dockerfile** (multi-stage): build frontend, copy to backend image.
- [ ] Configure Render service URL(s) and envs; verify WS works behind Render.
- [ ] Health check page `/health` or `/` loads index.html.

## Milestone 15 — Observability & UX Polish

- [ ] Basic analytics (page views, conversion to bid—optional).
- [ ] Error boundary pages and friendly empty states.
- [ ] Loading skeletons and optimistic transitions.

## Milestone 16 — Handover

- [ ] README with run/build/deploy instructions and screenshots.
- [ ] Known limitations + future improvements.
- [ ] Checklist vs assignment requirements.
