const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { Sequelize } = require('sequelize');
const fs = require('fs');
const auctionLifecycleService = require('./services/auctionLifecycleService');
require('dotenv').config();

/* 
 * LOGGING CLEANUP NOTES:
 * - Disabled Sequelize query logging (models/index.js, utils/runMigrations.js)  
 * - Commented out verbose WebSocket connection logs (ws/auctionEvents.js)
 * - Removed database connection success logs (index.js, models/index.js, utils/runMigrations.js)
 * - Cleaned up Redis connection logs (services/redisService.js)
 * - Reduced auction lifecycle verbose logs (ws/auctionLifecycle.js)
 * - Kept important logs: errors, auction decisions, server startup, migration progress
 */

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Initialize WebSocket for auctions
const { initAuctionEvents } = require('./ws/auctionEvents');
const { initAuctionLifecycle } = require('./ws/auctionLifecycle');

// Initialize WebSocket event handlers
initAuctionEvents(io);

// Initialize auction lifecycle management
initAuctionLifecycle(io);

// API routes
const apiRoutes = require('./api/routes');
app.use('/api', apiRoutes);

// Database setup
const db = require('./models');

// Function to test database connection
const testDatabaseConnection = async () => {
  try {
    await db.sequelize.authenticate();
    // console.log('Database connection has been established successfully'); // Commented out for cleaner logs
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Start server after testing database connection
const PORT = process.env.PORT || 5000;
testDatabaseConnection().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Note: If you need to run migrations, use: npm run migrate');
    
    // Initialize and start auction lifecycle service
    auctionLifecycleService.init(io);
    auctionLifecycleService.start();
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = { app, server, io, getIO: () => io };