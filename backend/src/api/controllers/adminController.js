const { Auction, Bid } = require('../../models');

/**
 * Get all auctions (admin only)
 */
exports.getAllAuctions = async (req, res) => {
  try {
    // Get all auctions with detailed information
    const auctions = await Auction.findAll({
      include: [
        {
          model: Bid,
          as: 'bids'
        },
        {
          model: Bid,
          as: 'highestBid'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.json(auctions);
  } catch (error) {
    console.error('Error fetching all auctions:', error);
    return res.status(500).json({ error: 'Failed to fetch auctions' });
  }
};

/**
 * Admin actions on auctions (reset/start)
 */
exports.performAuctionAction = async (req, res) => {
  try {
    const { id, action } = req.params;
    
    // Validate action
    if (!['reset', 'start'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be reset or start' });
    }
    
    // Get the auction
    const auction = await Auction.findByPk(id);
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    // Process the action
    switch (action) {
      case 'reset':
        // Reset auction to pending state
        await auction.update({
          status: 'pending',
          highestBidId: null
        });
        
        // Delete all bids for this auction
        await Bid.destroy({
          where: { auctionId: id }
        });
        
        return res.json({ success: true, message: 'Auction has been reset' });
        
      case 'start':
        // Check if auction is in pending state
        if (auction.status !== 'pending') {
          return res.status(400).json({ error: 'Only pending auctions can be started' });
        }
        
        // Start the auction
        await auction.update({
          status: 'active',
          goLiveAt: new Date() // Start immediately
        });
        
        return res.json({ success: true, message: 'Auction has been started' });
    }
  } catch (error) {
    console.error('Error performing auction action:', error);
    return res.status(500).json({ error: 'Failed to perform auction action' });
  }
};