# Real-Time Auction App

[![Tech](https://img.shields.io/badge/Full--Stack-React%20%7C%20Vite%20%7C%20Express%20%7C%20Socket.IO%20%7C%20Postgres%20%7C%20Redis-6A5ACD)](./)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](#-license)
[![CI](https://img.shields.io/badge/CI-Coming%20Soon-lightgrey.svg)](./)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./)

<p align="center">
  <strong>Enjoying Real-Time Auction App?</strong><br/>
  Smash that <a href="https://github.com/sandeep-kalla/Real-Time-Auction-App" target="_blank">⭐ Star</a> to support the project and help others discover it!
  <br/><br/>
  <a href="https://github.com/sandeep-kalla/Real-Time-Auction-App" target="_blank">
    <img src="https://img.shields.io/github/stars/sandeep-kalla/Real-Time-Auction-App?style=social" alt="GitHub stars" />
  </a>
</p>

A production-ready, real-time auction platform that lets sellers host live auctions and buyers place bids with millisecond-latency updates. Built with modern web tooling, resilient WebSockets, and a clean API, it’s perfect for learning real-time systems, prototyping marketplaces, or running internal auctions.

- Why it’s useful: low-latency bidding, robust auction lifecycle, notifications, and a typed, modern frontend out of the box.
- Who can use it: developers, students, startups/companies evaluating real-time patterns (Socket.IO, Redis), and teams building PoCs.

---

## ✨ Features

### Frontend (Vite + React + TypeScript)

- ✅ Modern routing with TanStack Router (file-based routes, code-splitting)
- ✅ Real-time updates via Socket.IO client (join auction rooms, live bids)
- ✅ State & data fetching with TanStack Query (smart caching, refetch)
- ✅ Polished UI with Tailwind CSS 4 + custom components (badges, cards, modals, timers)
- ✅ Auth flows (register, login) and session storage
- ✅ Toast notifications (react-hot-toast) and in-app notifications panel
- ✅ Seller tools: create auctions, end auctions, send invoices
- ✅ Buyer tools: place bids, receive outbid alerts, counter-offer flows
- ✅ TypeScript-first DX and Vitest + Testing Library test harness

### Backend (Node.js + Express + Socket.IO)

- 🚀 REST API with role-based auth (JWT) and secure middleware (helmet, CORS)
- 🚀 PostgreSQL with Sequelize ORM and migrations
- 🚀 Redis integration (ioredis) for high-performance bid operations and caching
- 🚀 WebSockets (Socket.IO namespace `/ws`) with JWT handshake auth
- 🚀 Auction lifecycle service (cron) to start/end auctions automatically
- 🚀 Email service (SendGrid) for invoices and transactional emails
- 🚀 Notifications (DB + WebSocket push) for bids, outbids, counter-offers
- 🚀 Structured, testable codebase with services/controllers separation

---

## 🧰 Tech Stack

| Layer    | Technologies                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend | React 19, Vite 6, TypeScript, TanStack Router, TanStack Query, Tailwind CSS 4, Socket.IO client, react-hot-toast, dayjs, zod, Vitest + Testing Library |
| Backend  | Node.js, Express 5, Socket.IO 4, Sequelize 6 (Postgres), ioredis (Redis), jsonwebtoken, bcryptjs, node-cron, helmet, cors, SendGrid                    |

Badges:

- ![React](https://img.shields.io/badge/React-19-61dafb)
- ![Vite](https://img.shields.io/badge/Vite-6-646cff)
- ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
- ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)
- ![Express](https://img.shields.io/badge/Express-5-000000)
- ![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101)
- ![Postgres](https://img.shields.io/badge/Postgres-16-4169e1)
- ![Redis](https://img.shields.io/badge/Redis-7-dc382d)

---

## 📂 Project Structure

Top-level layout:

```
root/
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── backend/
│   ├── migrations/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   ├── jobs/              # (reserved)
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ws/
│   │
│   │   index.js               # Express + Socket.IO server entry
│   ├── package.json
│   └── README.md
└── README.md                  # You are here
```

What key folders do:

- `frontend/src` — React app (routes, components, hooks, providers). Uses TanStack Router + Query.
- `frontend/public` — static assets (icons, manifest, robots).
- `backend/src/api` — REST endpoints split into `controllers` (logic) and `routes` (routing).
- `backend/src/middleware` — JWT auth/role checks (`requireAuth`, `requireRole`).
- `backend/src/models` — Sequelize models (User, Auction, Bid, CounterOffer, Notification) and ORM bootstrap.
- `backend/src/services` — domain services (auction lifecycle cron, email via SendGrid, Redis helpers).
- `backend/src/ws` — Socket.IO namespace `/ws` for auction events and lifecycle pushes.
- `backend/src/utils` — utilities like `runMigrations.js`.
- `backend/migrations` — database schemas and seeders.

---

## ⚙️ Installation & Setup

Prerequisites:

- Node.js 18+
- PostgreSQL 14+ (local or hosted)
- Redis 6+ (local or hosted)
- Optional: SendGrid account for real emails (dev mode logs instead)

### 1) Clone the repository

```powershell
# Windows PowerShell
git clone https://github.com/sandeep-kalla/Real-Time-Auction-App.git
cd .\Real-Time-Auction-App
```

### 2) Backend setup

```powershell
cd .\backend
npm install
```

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database (Postgres)
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/auction_db

# Auth
JWT_SECRET=replace-with-a-strong-secret

# Redis
REDIS_URL=redis://localhost:6379

# Email (SendGrid)
SENDGRID_API_KEY= # optional in dev (emails are logged)
FROM_EMAIL=your-email@example.com

# Timezone (optional)
TZ=Asia/Kolkata
```

Initialize DB and run migrations:

```powershell
# In the backend folder
npm run migrate
```

Start the backend (choose one):

```powershell
# Dev with auto-reload (requires nodemon installed globally or as dev dep)
npm run dev

# Or production-style
npm start
```

The API will be available at `http://localhost:5000/api` and WebSockets at `http://localhost:5000/ws` (Socket.IO namespace).

### 3) Frontend setup

```powershell
cd ..\frontend
npm install
```

Create `frontend/.env` (Vite):

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
# Optional
VITE_APP_ENV=development
```

Run the frontend:

```powershell
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## ▶️ Usage Guide

### Run in development

- Terminal A: `backend` → `npm run dev`
- Terminal B: `frontend` → `npm run dev`

### Build & run for production

- Frontend build & preview:

```powershell
cd .\frontend
npm run build
npm run serve
```

- Backend production run:

```powershell
cd .\backend
$env:NODE_ENV="production"
npm start
```

You can deploy both parts independently. The backend includes a `deploy.js` helper for Render which runs `npm run migrate` before starting.

### Example API endpoints

Base URL: `http://localhost:5000/api`

Auth

```http
POST /auth/register
POST /auth/login
GET  /auth/me              # Authorization: Bearer <token>
PUT  /auth/profile         # Update profile (auth required)
```

Auctions & Bids

```http
POST /auctions                         # seller only (auth)
GET  /auctions?status=live&search=car  # list + filters
GET  /auctions/mine                    # seller only (auth)
GET  /auctions/:id                     # auction details
POST /auctions/:id/bids                # place bid (auth)
GET  /auctions/:id/bids                # list bids
POST /auctions/:id/decision            # seller decision: { decision: "accept"|"reject"|"counter", counterAmount? }
POST /auctions/:id/end                 # seller ends live auction
POST /auctions/:id/send-invoice        # seller sends invoice to buyer
```

Counter Offers & Notifications

```http
GET  /counter-offers                   # buyer's counter-offers (auth)
GET  /counter-offers/pending           # pending (as buyer & seller)
GET  /counter-offers/:id               # details (auth)
POST /counter-offers/:id/response      # { response: "accept"|"reject" }

GET  /notifications                    # list
GET  /notifications/unread/count       # badge count
PATCH/notifications/:id/read           # mark read
PATCH/notifications/read-all
```

Admin (protected)

```http
GET  /admin/auctions
POST /admin/auctions/:id/:action       # {action}=reset|start (see controller)
```

### WebSocket usage (Socket.IO)

Namespace: `/ws`

- Auth via handshake: `io("http://localhost:5000/ws", { auth: { token } })`
- Join an auction room: `socket.emit("join", auctionId)`
- Place a bid: `socket.emit("place_bid", { auctionId, amount })`

Events you can listen for:

- `auction_state` — full auction snapshot (seller, highestBid, recent bids)
- `new_bid` — new bid data `{ id, amount, bidder, createdAt }`
- `auction:ended` — auction concluded
- `notification:new` — application notifications (outbid, counter-offer, etc.)
- `counter_offer:received`, `bid:accepted`, `bid:rejected`, `counter_offer:accepted`, `counter_offer:rejected`

### UI demo

- Home page showcases featured/live/ended auctions and real-time status badges.
- Try the route `/websocket-test` to validate WebSocket connectivity.
- Try `/notifications` to see live notification toasts and counts.

Screenshots :

![Home Page](frontend/public/home-page.png)

![Auction Detail](frontend/public/auction-detail.png)

> Tip: Open two browsers, login as seller and buyer, join the same auction, and place bids to see real-time updates.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

- Branch naming: `feat/<scope>-<summary>`, `fix/<scope>-<summary>`, `chore/<scope>-<summary>`
- Commit style: Conventional Commits (e.g., `feat(auction): add counter-offer route`)
- PR process:
  1. Fork and create a feature branch
  2. Keep PRs focused and small; reference issues when applicable
  3. Include screenshots for UI changes and explain testing steps
  4. Ensure `frontend` builds (`npm run build`) and `backend` starts locally
- Code style: TypeScript on frontend; use descriptive names and add JSDoc where helpful
- Tests (where applicable):
  - Frontend: `cd frontend && npm test`
  - Backend: Jest configured; add tests under `backend` and run `npm test`

---

## 🛠️ Common Issues & Troubleshooting

1. Database connection error (Postgres)

- Symptom: `Unable to connect to the database`
- Fix: Verify `DATABASE_URL`, DB is running, correct SSL settings if in production. Ensure the DB user has rights and the DB exists.

2. Redis connection error

- Symptom: `Redis connection error`
- Fix: Start Redis locally or set `REDIS_URL`. For hosted Redis (Upstash/Redis Cloud), use the exact URL.

3. 401 Unauthorized on API or WebSocket

- Symptom: `Unauthorized - No token` or WebSocket handshake error
- Fix: Ensure you login first; pass `Authorization: Bearer <token>` to API and `auth: { token }` to Socket.IO. Check `JWT_SECRET` matches between runs.

4. CORS blocked in browser

- Symptom: CORS error in dev
- Fix: Set `CORS_ORIGIN=http://localhost:3000` in `backend/.env`. Restart backend.

5. Migrations not applying / models out-of-sync

- Symptom: Table/column missing
- Fix: Run `cd backend && npm run migrate`. Check `backend/migrations` order and logs.

6. Emails not sending

- Symptom: No email received
- Fix: In dev, emails log to console unless you set `SENDGRID_API_KEY`. Set `FROM_EMAIL` and check spam folder.

---

## 🔭 Future Improvements

- Integrated payments (Stripe) and payout workflows
- Image uploads & media CDN for auction items
- Rate limiting & audit logs
- Docker Compose for local Postgres/Redis and full stack
- CI/CD pipelines (GitHub Actions) with build/test/deploy
- Optimistic UI for bids with reconciliation from WebSocket events
- Advanced search & filters (facets, full-text)
- Multi-tenant support and org-level roles

---

## 📜 License

This project is licensed under the ISC License. See the LICENSE file (or package manifests) for details.

---

## 🧪 Quick Scripts Reference

Frontend

```powershell
cd .\frontend
npm run dev      # start dev server on :3000
npm run build    # production build
npm run serve    # preview production build
npm test         # run unit tests (Vitest)
```

Backend

```powershell
cd .\backend
npm run dev      # start dev server
npm start        # start server
npm run migrate  # run DB migrations
npm test         # (if tests are added)
```

---

## 🙌 Acknowledgments

- Built with ❤️ using React, Vite, Express, Socket.IO, Postgres, and Redis.
- Inspired by real-time marketplace patterns and production-ready architecture.
