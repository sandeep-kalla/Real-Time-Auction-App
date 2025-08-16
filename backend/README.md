# Real-Time Auction Application Backend

A robust backend for a real-time auction platform built with Node.js, Express, Socket.IO, Sequelize, and Redis.

## Features

- **Real-time bidding** with Socket.IO
- **High-performance bid processing** with Redis
- **RESTful API** for auction management
- **Authentication** with JWT
- **Role-based access control** (admin, seller, buyer)
- **Auction lifecycle management**
- **Notifications system**
- **Counter offer functionality**

## Project Structure

```
├── migrations/           # Database migrations and seed data
├── public/              # Static files
├── src/
│   ├── api/             # REST API endpoints
│   │   ├── controllers/ # Request handlers
│   │   └── routes/      # API routes
│   ├── middleware/      # Express middleware
│   ├── models/          # Sequelize models
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── ws/              # WebSocket handlers
│   └── index.js         # Application entry point
├── .env                 # Environment variables
├── .env.example        # Example environment variables
└── package.json        # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL
- Redis

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Run database migrations:
   ```
   npm run migrate
   ```
5. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Auctions

- `POST /api/auctions` - Create a new auction (seller only)
- `GET /api/auctions` - Get all auctions with filters
- `GET /api/auctions/:id` - Get auction by ID
- `POST /api/auctions/:id/bids` - Place a bid on an auction (buyer only)
- `GET /api/auctions/:id/bids` - Get bids for an auction
- `POST /api/auctions/:id/decision` - Seller decision on auction (accept/reject/counter)

### Counter Offers

- `POST /api/counter/:id/response` - Respond to a counter offer (buyer)

### Notifications

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read

### Admin

- `GET /api/admin/auctions` - Get all auctions (admin only)
- `POST /api/admin/auctions/:id/:action` - Admin actions on auctions (reset/start)

## WebSocket Events

### Client to Server

- `join` - Join an auction room
- `place_bid` - Place a bid on an auction

### Server to Client

- `new_bid` - New bid placed on an auction
- `auction_state` - Current state of an auction
- `auction_started` - Auction has started
- `auction_ended` - Auction has ended
- `error` - Error message

## License

MIT