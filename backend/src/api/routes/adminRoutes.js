const express = require('express');
const { requireAuth, requireRole } = require('../../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Get all auctions (admin only)
router.get('/auctions', requireAuth, requireRole('admin'), adminController.getAllAuctions);

// Admin actions on auctions (reset/start)
router.post('/auctions/:id/:action', requireAuth, requireRole('admin'), adminController.performAuctionAction);

module.exports = router;