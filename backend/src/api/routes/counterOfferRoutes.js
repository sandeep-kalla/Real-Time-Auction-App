const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const counterOfferController = require('../controllers/counterOfferController');

const router = express.Router();

// Get counter-offers for the current user
router.get('/', requireAuth, counterOfferController.getCounterOffers);

// Get pending counter-offers for the current user
router.get('/pending', requireAuth, counterOfferController.getPendingCounterOffers);

// Get counter-offer by ID
router.get('/:id', requireAuth, counterOfferController.getCounterOfferById);

// Respond to a counter offer (buyer)
router.post('/:id/response', requireAuth, counterOfferController.respondToCounterOffer);

module.exports = router;