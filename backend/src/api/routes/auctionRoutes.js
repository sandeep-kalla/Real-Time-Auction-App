const express = require('express');
const { requireAuth, requireRole } = require('../../middleware/auth');
const auctionController = require('../controllers/auctionController');

const router = express.Router();

// Create a new auction (seller only)
router.post('/', requireAuth, requireRole('seller'), auctionController.createAuction);

// Get all auctions with filters
router.get('/', auctionController.getAuctions);

// Get my auctions (seller only)
router.get('/mine', requireAuth, requireRole('seller'), auctionController.getMyAuctions);

// Get auction by ID
router.get('/:id', auctionController.getAuctionById);

// Place a bid on an auction (buyer only)
router.post('/:id/bids', requireAuth, auctionController.placeBid);

// Get bids for an auction
router.get('/:id/bids', auctionController.getAuctionBids);

// Seller decision on auction (accept/reject/counter)
router.post('/:id/decision', requireAuth, auctionController.makeDecision);

// End auction early (seller only)
router.post('/:id/end', requireAuth, auctionController.endAuction);

// Send invoice email to buyer (seller only)
router.post('/:id/send-invoice', requireAuth, requireRole('seller'), auctionController.sendInvoice);

module.exports = router;