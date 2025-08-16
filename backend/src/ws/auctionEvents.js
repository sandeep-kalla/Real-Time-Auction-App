/**
 * WebSocket event handlers for auction-related events
 */
const { Auction, Bid, User, Notification } = require('../models');
const jwt = require('jsonwebtoken');

/**
 * Initialize auction WebSocket events
 * @param {Object} io - Socket.IO instance
 */
const initAuctionEvents = (io) => {
  const auctionNamespace = io.of('/ws');
  
  // Authentication middleware for WebSocket
  auctionNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      console.error('WebSocket auth error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });
  
  auctionNamespace.on('connection', (socket) => {
    // console.log('Client connected:', socket.id, 'User:', socket.user.name); // Commented out for cleaner logs
    
    // Join user-specific room for personal notifications
    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);
    // console.log(`Client ${socket.id} (${socket.user.name}) joined user room ${userRoom}`); // Commented out for cleaner logs
    
    // Join auction room
    socket.on('join', (auctionId) => {
      const room = `auction:${auctionId}`;
      socket.join(room);
      // console.log(`Client ${socket.id} (${socket.user.name}) joined room ${room}`); // Commented out for cleaner logs
      
      // Emit current auction state to the client
      emitAuctionState(auctionId, socket);
    });
    
    // Place bid
    socket.on('place_bid', async (data) => {
      try {
        const { auctionId, amount } = data;
        const userId = socket.userId;
        
        if (!auctionId || !amount) {
          return socket.emit('error', { message: 'Missing required fields' });
        }
        
        // Get the auction
        const auction = await Auction.findByPk(auctionId, {
          include: [{
            model: Bid,
            as: 'highestBid'
          }]
        });
        
        if (!auction) {
          return socket.emit('error', { message: 'Auction not found' });
        }
        
        // Check if auction is live (changed from 'active' to 'live')
        if (auction.status !== 'live') {
          return socket.emit('error', { message: 'Auction is not live' });
        }
        
        // Check if user is not the seller
        if (auction.sellerId === userId) {
          return socket.emit('error', { message: 'Sellers cannot bid on their own auctions' });
        }
        
        // Check if bid is higher than current highest bid
        const minBidAmount = auction.highestBid 
          ? auction.highestBid.amount + auction.bidIncrement 
          : auction.startPrice;
        
        if (amount < minBidAmount) {
          return socket.emit('error', { 
            message: `Bid must be at least ${minBidAmount}` 
          });
        }
        
        // Get bidder info
        const bidder = await User.findByPk(userId, {
          attributes: ['id', 'name']
        });
        
        // Create the bid in the database
        const bid = await Bid.create({
          auctionId,
          bidderId: userId,
          amount
        });
        
        // Update auction with new highest bid
        await auction.update({ highestBidId: bid.id });
        
        // Process bid data
        const bidData = {
          id: bid.id,
          amount: bid.amount,
          auctionId: auctionId,
          createdAt: bid.createdAt,
          bidder: bidder
        };
        
        // Broadcast the new bid to all clients in the auction room
        const room = `auction:${auctionId}`;
        auctionNamespace.to(room).emit('new_bid', bidData);
        
        // Create notifications for other interested users
        try {
          // Notify the seller (only if they're not the bidder)
          if (auction.sellerId !== userId) {
            const sellerNotification = await Notification.create({
              userId: auction.sellerId,
              type: 'new_bid',
              payload: JSON.stringify({
                auctionId: auctionId,
                auctionName: auction.itemName,
                bidAmount: bid.amount,
                bidderName: bidder.name
              })
            });
            
            // Emit notification via WebSocket to specific user
            const sellerSockets = Array.from(auctionNamespace.sockets.values()).filter(s => s.userId === auction.sellerId);
            sellerSockets.forEach(socket => {
              socket.emit('notification:new', sellerNotification);
            });
          }

          // Notify previous bidders (exclude current bidder and seller)
          const previousBidders = await Bid.findAll({
            where: { 
              auctionId,
              bidderId: { [require('sequelize').Op.ne]: userId } // Exclude current bidder
            },
            attributes: ['bidderId'],
            include: [{
              model: User,
              as: 'bidder',
              attributes: ['id', 'name']
            }],
            group: ['bidderId', 'bidder.id', 'bidder.name']
          });

          // Create a Set to avoid duplicate notifications to the same user
          const notifiedUsers = new Set();

          for (const prevBid of previousBidders) {
            if (prevBid.bidderId !== auction.sellerId && !notifiedUsers.has(prevBid.bidderId)) {
              notifiedUsers.add(prevBid.bidderId);
              
              const outbidNotification = await Notification.create({
                userId: prevBid.bidderId,
                type: 'outbid',
                payload: JSON.stringify({
                  auctionId: auctionId,
                  auctionName: auction.itemName,
                  newBidAmount: bid.amount,
                  newBidderName: bidder.name
                })
              });
              
              // Emit notification via WebSocket to specific user
              const bidderSockets = Array.from(auctionNamespace.sockets.values()).filter(s => s.userId === prevBid.bidderId);
              bidderSockets.forEach(socket => {
                socket.emit('notification:new', outbidNotification);
              });
            }
          }
        } catch (notificationError) {
          console.error('Error creating notifications:', notificationError);
        }
        
        // Emit updated auction state
        emitAuctionState(auctionId, auctionNamespace.to(room));
        
        // console.log(`New bid placed: ${amount} by ${bidder.name} on auction ${auctionId}`); // Commented out for cleaner logs
      } catch (error) {
        console.error('Error processing bid via WebSocket:', error);
        socket.emit('error', { message: 'Failed to process bid' });
      }
    });
    
    // Disconnect handler
    socket.on('disconnect', () => {
      // console.log('Client disconnected:', socket.id, socket.user?.name); // Commented out for cleaner logs
    });
  });
};

/**
 * Emit current auction state to clients
 * @param {string} auctionId - Auction ID
 * @param {Object} target - Socket or room to emit to
 */
const emitAuctionState = async (auctionId, target) => {
  try {
    const auction = await Auction.findByPk(auctionId, {
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
        },
        {
          model: Bid,
          as: 'bids',
          limit: 10,
          order: [['amount', 'DESC']],
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
      return target.emit('error', { message: 'Auction not found' });
    }
    
    target.emit('auction_state', auction);
  } catch (error) {
    console.error('Error emitting auction state:', error);
    target.emit('error', { message: 'Failed to get auction state' });
  }
};

module.exports = { initAuctionEvents };