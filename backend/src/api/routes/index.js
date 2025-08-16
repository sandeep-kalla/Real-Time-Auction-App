const express = require('express');
const authRoutes = require('./authRoutes');
const auctionRoutes = require('./auctionRoutes');
const counterOfferRoutes = require('./counterOfferRoutes');
const notificationRoutes = require('./notificationRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/auctions', auctionRoutes);
router.use('/counter-offers', counterOfferRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

module.exports = router;