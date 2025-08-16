const { CounterOffer, Auction, User } = require('../../models');
const auctionLifecycleService = require('../../services/auctionLifecycleService');

/**
 * Get counter-offers for a buyer
 */
exports.getCounterOffers = async (req, res) => {
  try {
    const buyerId = req.user.id;
    
    const counterOffers = await CounterOffer.findAll({
      where: { buyerId },
      include: [
        {
          model: Auction,
          as: 'auction',
          attributes: ['id', 'itemName', 'description']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.json(counterOffers);
  } catch (error) {
    console.error('Error fetching counter-offers:', error);
    return res.status(500).json({ error: 'Failed to fetch counter-offers' });
  }
};

/**
 * Get counter-offer by ID
 */
exports.getCounterOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const counterOffer = await CounterOffer.findByPk(id, {
      include: [
        {
          model: Auction,
          as: 'auction',
          attributes: ['id', 'itemName', 'description'],
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!counterOffer) {
      return res.status(404).json({ error: 'Counter-offer not found' });
    }
    
    // Check if user is involved in this counter-offer (buyer or seller)
    if (counterOffer.buyerId !== userId && counterOffer.sellerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    return res.json(counterOffer);
  } catch (error) {
    console.error('Error fetching counter-offer:', error);
    return res.status(500).json({ error: 'Failed to fetch counter-offer' });
  }
};

/**
 * Respond to a counter offer (buyer)
 */
exports.respondToCounterOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const buyerId = req.user.id;
    
    // Validate response
    if (!['accept', 'reject'].includes(response)) {
      return res.status(400).json({ error: 'Invalid response. Must be accept or reject' });
    }
    
    // Use the auction lifecycle service to process the response
    const result = await auctionLifecycleService.processCounterOfferResponse(id, response, buyerId);
    
    return res.json(result);
  } catch (error) {
    console.error('Error responding to counter-offer:', error);
    
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('already responded')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Failed to respond to counter-offer' });
  }
};

/**
 * Get pending counter-offers for a user (both as buyer and seller)
 */
exports.getPendingCounterOffers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get counter-offers where user is the buyer (needs to respond)
    const asBuyer = await CounterOffer.findAll({
      where: { 
        buyerId: userId,
        status: 'pending'
      },
      include: [
        {
          model: Auction,
          as: 'auction',
          attributes: ['id', 'itemName', 'description']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name']
        }
      ]
    });
    
    // Get counter-offers where user is the seller (waiting for response)
    const asSeller = await CounterOffer.findAll({
      where: { 
        sellerId: userId,
        status: 'pending'
      },
      include: [
        {
          model: Auction,
          as: 'auction',
          attributes: ['id', 'itemName', 'description']
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name']
        }
      ]
    });
    
    return res.json({
      asBuyer,
      asSeller,
      total: asBuyer.length + asSeller.length
    });
  } catch (error) {
    console.error('Error fetching pending counter-offers:', error);
    return res.status(500).json({ error: 'Failed to fetch pending counter-offers' });
  }
};