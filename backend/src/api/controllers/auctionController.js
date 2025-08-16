const { Auction, Bid, User, CounterOffer, Notification } = require('../../models');
const { Op } = require('sequelize');
const auctionLifecycleService = require('../../services/auctionLifecycleService');
const emailService = require('../../services/emailService');

/**
 * Create a new auction
 */
exports.createAuction = async (req, res) => {
  try {
    const { itemName, description, startPrice, bidIncrement, goLiveAt, durationMins } = req.body;
    
    // Validate required fields
    if (!itemName || !description || !startPrice || !bidIncrement || !goLiveAt || !durationMins) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create the auction
    const auction = await Auction.create({
      sellerId: req.user.id,
      itemName,
      description,
      startPrice,
      bidIncrement,
      goLiveAt: new Date(goLiveAt),
      durationMins,
      status: 'scheduled'
    });

    return res.status(201).json(auction);
  } catch (error) {
    console.error('Error creating auction:', error);
    return res.status(500).json({ error: 'Failed to create auction' });
  }
};

/**
 * Get all auctions with filters
 */
exports.getAuctions = async (req, res) => {
  try {
    const { status, sellerId, search } = req.query;
    
    // Build filter conditions
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (sellerId) {
      where.sellerId = sellerId;
    }
    
    if (search) {
      where[Op.or] = [
        { itemName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Get auctions with seller info and highest bid
    const auctions = await Auction.findAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name']
        },
        {
          model: Bid,
          as: 'highestBid',
          attributes: ['id', 'amount', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.json({
      auctions,
      total: auctions.length
    });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return res.status(500).json({ error: 'Failed to fetch auctions' });
  }
};

/**
 * Get auctions for the current user (seller)
 */
exports.getMyAuctions = async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    // Get auctions for the current seller with highest bid info
    const auctions = await Auction.findAll({
      where: { sellerId },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name']
        },
        {
          model: Bid,
          as: 'highestBid',
          attributes: ['id', 'amount', 'createdAt'],
          include: [{
            model: User,
            as: 'bidder',
            attributes: ['id', 'name']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.json(auctions);
  } catch (error) {
    console.error('Error fetching my auctions:', error);
    return res.status(500).json({ error: 'Failed to fetch auctions' });
  }
};

/**
 * Get auction by ID
 */
exports.getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const auction = await Auction.findByPk(id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name']
        },
        {
          model: Bid,
          as: 'highestBid',
          include: [
            {
              model: User,
              as: 'bidder',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    return res.json(auction);
  } catch (error) {
    console.error('Error fetching auction:', error);
    return res.status(500).json({ error: 'Failed to fetch auction' });
  }
};

/**
 * Place a bid on an auction
 */
exports.placeBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;
    
    // Validate bid amount
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid bid amount is required' });
    }
    
    // Get the auction
    const auction = await Auction.findByPk(id, {
      include: [{
        model: Bid,
        as: 'highestBid'
      }]
    });
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    // Check if auction is active
    if (auction.status !== 'active') {
      return res.status(400).json({ error: 'Auction is not active' });
    }
    
    // Check if user is not the seller
    if (auction.sellerId === userId) {
      return res.status(403).json({ error: 'Sellers cannot bid on their own auctions' });
    }
    
    // Check if bid is higher than current highest bid
    const minBidAmount = auction.highestBid 
      ? auction.highestBid.amount + auction.bidIncrement 
      : auction.startPrice;
    
    if (amount < minBidAmount) {
      return res.status(400).json({ 
        error: `Bid must be at least ${minBidAmount}` 
      });
    }
    
    // Create the bid
    const bid = await Bid.create({
      auctionId: id,
      bidderId: userId,
      amount
    });
    
    // Update auction with new highest bid
    await auction.update({ highestBidId: bid.id });
    
    // Create notification for seller
    await Notification.create({
      userId: auction.sellerId,
      type: 'new_bid',
      payload: JSON.stringify({
        auctionId: auction.id,
        auctionName: auction.itemName,
        bidAmount: amount,
        bidderId: userId
      })
    });
    
    // Return the created bid with bidder info
    const bidWithUser = await Bid.findByPk(bid.id, {
      include: [{
        model: User,
        as: 'bidder',
        attributes: ['id', 'name']
      }]
    });
    
    return res.status(201).json(bidWithUser);
  } catch (error) {
    console.error('Error placing bid:', error);
    return res.status(500).json({ error: 'Failed to place bid' });
  }
};

/**
 * Get bids for an auction
 */
exports.getAuctionBids = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if auction exists
    const auction = await Auction.findByPk(id);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    // Get all bids for the auction
    const bids = await Bid.findAll({
      where: { auctionId: id },
      include: [{
        model: User,
        as: 'bidder',
        attributes: ['id', 'name']
      }],
      order: [['amount', 'DESC']]
    });
    
    return res.json(bids);
  } catch (error) {
    console.error('Error fetching auction bids:', error);
    return res.status(500).json({ error: 'Failed to fetch auction bids' });
  }
};

/**
 * Seller decision on auction (accept/reject/counter)
 */
exports.makeDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, counterAmount } = req.body;
    const sellerId = req.user.id;
    
    // Validate decision
    if (!['accept', 'reject', 'counter'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision. Must be accept, reject, or counter' });
    }
    
    if (decision === 'counter' && (!counterAmount || isNaN(counterAmount) || counterAmount <= 0)) {
      return res.status(400).json({ error: 'Valid counter amount is required for counter-offers' });
    }

    // Use the auction lifecycle service to process the decision
    const result = await auctionLifecycleService.processSellerDecision(id, decision, sellerId, counterAmount);
    
    return res.json(result);
  } catch (error) {
    console.error('Error processing auction decision:', error);
    
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('ended auctions') || error.message.includes('No bids')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Failed to process auction decision' });
  }
};

/**
 * End auction early (seller only)
 */
exports.endAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    
    // Get the auction
    const auction = await Auction.findByPk(id, {
      include: [
        {
          model: Bid,
          as: 'highestBid',
          include: [
            {
              model: User,
              as: 'bidder',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    // Check if user is the seller
    if (auction.sellerId !== sellerId) {
      return res.status(403).json({ error: 'Only the seller can end this auction' });
    }
    
    // Check if auction is live
    if (auction.status !== 'live') {
      return res.status(400).json({ error: 'Can only end live auctions' });
    }
    
    // Use the auction lifecycle service to end the auction
    await auctionLifecycleService.endAuction(auction);
    
    return res.json({ success: true, message: 'Auction ended successfully' });
  } catch (error) {
    console.error('Error ending auction:', error);
    return res.status(500).json({ error: 'Failed to end auction' });
  }
};

/**
 * Send invoice email to buyer (seller only)
 */
exports.sendInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    
    // Get the auction with buyer information
    const auction = await Auction.findByPk(id, {
      include: [
        {
          model: Bid,
          as: 'highestBid',
          include: [
            {
              model: User,
              as: 'bidder',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    // Check if user is the seller
    if (auction.sellerId !== sellerId) {
      return res.status(403).json({ error: 'Only the seller can send invoices for this auction' });
    }
    
    // Check if auction is sold
    if (auction.status !== 'sold') {
      return res.status(400).json({ error: 'Can only send invoices for sold auctions' });
    }
    
    // Check if there's a highest bid (buyer)
    if (!auction.highestBid || !auction.highestBid.bidder) {
      return res.status(400).json({ error: 'No buyer found for this auction' });
    }
    
    // Send invoice email to buyer
    const result = await emailService.sendInvoiceEmail(
      auction.highestBid.bidder.email,
      auction.highestBid.bidder.name,
      auction,
      auction.highestBid.amount,
      false // buyer invoice
    );
    
    if (result.success) {
      return res.json({ 
        success: true, 
        message: `Invoice sent successfully to ${auction.highestBid.bidder.email}` 
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to send invoice email',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending invoice:', error);
    return res.status(500).json({ error: 'Failed to send invoice' });
  }
};