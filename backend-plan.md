# Backend Plan — Mini Auction System (Real‑Time Bidding)

> Tech: **Node.js (Express/Fastify)**, **Socket.IO** (or native WS), **Sequelize** (PostgreSQL on Supabase), **Upstash Redis**, **SendGrid** for email, **PDFKit**/**pdf-lib** for invoices. Deployed to **Render.com** in a **single Dockerfile** (serves frontend build + API + WS).

## Milestone 0 — Project, Env & Repo

- [ ] Initialize Node project with JS.
- [ ] Directory layout: `/src` (api, ws, services, models, jobs, utils), `/public` (static), `/migrations`.
- [ ] Environment variables (Render dashboard + `.env.example`):
  - [ ] `DATABASE_URL` (Supabase Postgres)
  - [ ] `REDIS_URL` (Upstash)
  - [ ] `SENDGRID_API_KEY`
  - [ ] `APP_BASE_URL`
  - [ ] `JWT_PUBLIC_KEYS` (if verifying Supabase Auth)
  - [ ] `PORT`, `NODE_ENV`, `TZ=Asia/Kolkata`
- [ ] Create health endpoint `/health`.

## Milestone 1 — Database Models (Sequelize)

- [ ] `User` (id, email, name, role: buyer/seller/admin, createdAt/updatedAt).
- [ ] `Auction` (id, sellerId, itemName, description, startPrice, bidIncrement, goLiveAt, durationMins, status: scheduled|live|ended|closed_no_winner|sold, highestBidId nullable, createdAt/updatedAt).
- [ ] `Bid` (id, auctionId, bidderId, amount, createdAt).
- [ ] `Notification` (id, userId, type, payload JSON, readAt nullable, createdAt).
- [ ] `CounterOffer` (id, auctionId, sellerId, buyerId, amount, status: pending|accepted|rejected, createdAt/updatedAt).
- [ ] **Indexes**: on `Bid(auctionId, amount desc, createdAt)`, `Auction(goLiveAt)`, `Notification(userId, createdAt)`.
- [ ] Migrations + seed minimal test data.

## Milestone 2 — Authentication & Authorization

- [ ] Use **Supabase Auth** for identity; backend verifies incoming JWTs (JWKs) and extracts `userId` & roles.
- [ ] Middleware for `requireAuth`, `requireRole('seller'|'admin')`.
- [ ] Attach `req.user` to requests; log user id in audit trail.

## Milestone 3 — Core REST API

- [ ] `POST /api/auctions` (seller) — create auction (server-side validation).
- [ ] `GET /api/auctions` — list with filters: status=scheduled|live|ended.
- [ ] `GET /api/auctions/:id` — details + current highest bid and timebox.
- [ ] `POST /api/auctions/:id/bids` (buyer) — place bid.
- [ ] `GET /api/auctions/:id/bids` — (optional) history, paginated.
- [ ] `POST /api/auctions/:id/decision` (seller) — body: `{action: 'accept'|'reject'|'counter', amount?}`.
- [ ] `POST /api/counter/:id/response` (buyer) — accept/reject seller counter‑offer.
- [ ] `GET /api/notifications` — list my notifications; `POST /api/notifications/:id/read`.
- [ ] `GET /api/admin/auctions` (bonus) — admin panel list; `POST /api/admin/auctions/:id/reset|start` (bonus).

## Milestone 4 — Validation Rules (Shared Constants)

- [ ] Auction creation:
  - [ ] `startPrice > 0`, `bidIncrement > 0`, `durationMins >= 1`, `goLiveAt` > now.
- [ ] Bidding:
  - [ ] Auction must be **live** (`now` between start and end).
  - [ ] Bid must be `>= currentHighest + bidIncrement`.
  - [ ] Reject self‑outbidding rule if disallowed (optional).
- [ ] Counter‑offer:
  - [ ] Only allowed when auction ended with at least one bid and not yet accepted/rejected.
  - [ ] Amount must be `>= highestBid` (or define business rule).

## Milestone 5 — Real‑Time (WebSockets)

- [ ] Socket namespace `/ws`; room per auction: `auction:{id}`.
- [ ] On client connect to `auction:{id}` send snapshot: status, current highest bid, remaining time.
- [ ] Broadcast events:
  - [ ] `bid:placed` to room.
  - [ ] `bid:outbid` targeted to previous highest bidder.
  - [ ] `auction:started`, `auction:ended` to room.
  - [ ] `seller:decision_required` to seller at end.
  - [ ] `seller:accepted`/`seller:rejected` to winner + seller.
  - [ ] `counter:offer` to highest bidder; `counter:accepted`/`counter:rejected` to both.
- [ ] Handle reconnection; rejoin rooms; idempotent event emission (use bid ids).

## Milestone 6 — High‑Performance Bid Path (Redis + DB)

- [ ] Keep **authoritative status** and **highest bid** in Redis for fast reads:
  - [ ] Key `auction:{id}:state` → `scheduled|live|ended` + times.
  - [ ] Key `auction:{id}:highest` → JSON `{bidId, userId, amount, ts}`.
- [ ] Place bid flow (atomic):
  1. Check `state === live` and time window.
  2. Fetch `highest` from Redis; validate `amount >= highest.amount + increment`.
  3. **Atomic update** (Lua or Upstash transaction): if still valid, set new highest.
  4. Persist `Bid` in Postgres (transaction); on success, broadcast events.
  5. If DB fails after Redis set, roll back Redis (or reconcile via outbox/saga).
- [ ] Persist **all** bids to Postgres; Redis used as cache/coordination.
- [ ] Rate limit bids per user per auction to mitigate spam (Redis token bucket).

## Milestone 7 — Auction Lifecycle & Scheduling

- [ ] On create: set `status=scheduled`. Compute `endAt = goLiveAt + durationMins`.
- [ ] Scheduler design (resilient to cold starts):
  - [ ] Maintain Redis ZSETs: `auctions:start` and `auctions:end` (score = epoch ms).
  - [ ] Background worker tick (every 1–5s): move due auctions to `live`/`ended`, update DB & Redis, emit events.
  - [ ] On server boot: **rebuild schedule** by scanning DB for `scheduled|live` with unprocessed times.
  - [ ] Idempotent transitions (guard by status + processed flags).
- [ ] On `ended`: compute highest bid (from Redis/DB); notify seller (`seller:decision_required`).

## Milestone 8 — Seller Decision & Counter‑Offer

- [ ] `accept`:
  - [ ] Mark auction `sold`; record winning `Bid`.
  - [ ] Create notifications for buyer & seller; WS broadcast `seller:accepted`.
  - [ ] Trigger **confirmation emails** (SendGrid) to both parties.
  - [ ] Generate **PDF invoice** and email as attachment to both.
- [ ] `reject`:
  - [ ] Mark auction `closed_no_winner`.
  - [ ] Notify highest bidder (WS + persisted notification + optional email).
- [ ] `counter`:
  - [ ] Create `CounterOffer(pending)` with amount.
  - [ ] Notify highest bidder (WS + notification).
  - [ ] On buyer response:
    - [ ] `accept` → treat as sale; send emails + invoices.
    - [ ] `reject` → close as no winner; notify both.

## Milestone 9 — Notifications (Persisted + Real‑Time)

- [ ] Service to create notifications (type, payload, recipients).
- [ ] Persist to DB and fan‑out via WS to online users.
- [ ] Endpoints to list and mark read.
- [ ] Types: `new_bid`, `outbid`, `auction_started`, `auction_ended`, `decision_required`, `accepted`, `rejected`, `counter_offer`, `counter_accepted`, `counter_rejected`.

## Milestone 10 — Emails & Invoices

- [ ] SendGrid setup (from domain or verified sender).
- [ ] Email templates: confirmation (sale), rejection, counter‑offer invite, counter‑accepted.
- [ ] Invoice generation service:
  - [ ] Data: seller, buyer, auction item, final price, timestamp, invoice number.
  - [ ] PDF generation (PDFKit/pdf-lib); store temp file; attach to email; delete temp.
  - [ ] Optional: store invoice metadata in DB.
- [ ] Retry policy for email failures (dead‑letter queue via Redis list or simple retry).

## Milestone 11 — Admin (Bonus)

- [ ] List all auctions with statuses; view bids per auction.
- [ ] Manual `start`/`reset` endpoints with audit logs.
- [ ] WS dashboard: monitor active rooms and online users (optional).

## Milestone 12 — Security, Logging & Errors

- [ ] Input validation on **all** endpoints (celebrate/zod).
- [ ] Central error handler with problem+json responses.
- [ ] Request logging (pino/winston) with user id correlation.
- [ ] CORS config for frontend origin.
- [ ] Rate limiting for write endpoints; helmet; size limits.
- [ ] Protect WS with auth (JWT on connection); kick unauthenticated users from write events.

## Milestone 13 — Tests

- [ ] Unit tests: bidding rules, state transitions, counter‑offer rules.
- [ ] Integration tests: place bid → outbid → end auction → seller accept → invoices emailed.
- [ ] WS tests: join room, receive broadcasts, reconnection idempotency.
- [ ] DB tests with test containers or Supabase test schema (truncate between runs).

## Milestone 14 — Build, Docker & Deployment

- [ ] Single **multi‑stage Dockerfile**:
  - [ ] Stage 1: build frontend.
  - [ ] Stage 2: install backend deps, copy server code + built frontend to `/public`.
  - [ ] Start single process serving API + static + WS.
- [ ] Render.com service configuration (ports, env vars, health check).
- [ ] Migrate DB on boot (sequelize `sync` or migrations runner).
- [ ] Seed admin user (optional).

## Milestone 15 — Reliability on Free Tiers

- [ ] **Keep‑alive** endpoint and set **cron-job.org** pings to avoid cold starts.
- [ ] Rebuild auction schedule on every boot.
- [ ] Store authoritative timestamps in DB; never trust client clocks.
- [ ] Graceful shutdown: flush metrics, close DB/Redis/WS.

## Milestone 16 — Documentation & Handover

- [ ] OpenAPI (Swagger) spec for REST endpoints.
- [ ] README with local/dev/prod instructions, env var table, Render deploy notes.
- [ ] Operational runbook: how to restart, rotate keys, handle failed emails.
- [ ] Final checklist vs assignment features and evaluation criteria.
