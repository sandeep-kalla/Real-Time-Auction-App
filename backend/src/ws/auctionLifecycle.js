/**
 * WebSocket service for auction lifecycle management
 */
const { Auction, Notification } = require('../models');
const { Op } = require('sequelize');

/**
 * Initialize auction lifecycle events
 * @param {Object} io - Socket.IO instance
 */
const initAuctionLifecycle = (io) => {
  const auctionNamespace = io.of('/ws');
  
  // Start scheduled auctions
  const startScheduledAuctions = async () => {
    try {
      const now = new Date();
      
      // Find auctions that should start now
      const auctionsToStart = await Auction.findAll({
        where: {
          status: 'scheduled',
          goLiveAt: { [Op.lte]: now }
        }
      });
      
      // Start each auction
      for (const auction of auctionsToStart) {
        await auction.update({ status: 'live' });
        
        // Notify clients in the auction room
        const room = `auction:${auction.id}`;
        auctionNamespace.to(room).emit('auction_started', {
          auctionId: auction.id,
          startTime: now
        });
        
        // console.log(`Auction ${auction.id} started automatically`); // Commented out for cleaner logs
      }
    } catch (error) {
      console.error('Error starting scheduled auctions:', error);
    }
  };
  
  // End active auctions that have reached their duration
  const endExpiredAuctions = async () => {
    try {
      const now = new Date();
      const redisService = require('../services/redisService');
      
      // Find active auctions
      const activeAuctions = await Auction.findAll({
        where: {
          status: 'live'
        }
      });
      
      // Check each auction's duration
      for (const auction of activeAuctions) {
        const startTime = new Date(auction.goLiveAt);
        const endTime = new Date(startTime.getTime() + (auction.durationMins * 60 * 1000));
        
        // If auction should end
        if (now >= endTime) {
          await auction.update({ status: 'ended' });
          
          // Clear Redis data for this auction
          await redisService.clearAuctionData(auction.id);
          
          // Notify clients in the auction room
          const room = `auction:${auction.id}`;
          auctionNamespace.to(room).emit('auction_ended', {
            auctionId: auction.id,
            endTime: now
          });
          
          // Notify the seller
          if (auction.highestBidId) {
            await Notification.create({
              userId: auction.sellerId,
              type: 'auction_ended_with_bids',
              payload: JSON.stringify({
                auctionId: auction.id,
                auctionName: auction.itemName
              })
            });
          } else {
            await Notification.create({
              userId: auction.sellerId,
              type: 'auction_ended_no_bids',
              payload: JSON.stringify({
                auctionId: auction.id,
                auctionName: auction.itemName
              })
            });
          }
          
          // console.log(`Auction ${auction.id} ended automatically`); // Commented out for cleaner logs
        }
      }
    } catch (error) {
      console.error('Error ending expired auctions:', error);
    }
  };
  
  // Run lifecycle checks periodically
  const INTERVAL_MS = 60 * 1000; // Check every minute
  setInterval(() => {
    startScheduledAuctions();
    endExpiredAuctions();
  }, INTERVAL_MS);
  
  // Run immediately on startup
  startScheduledAuctions();
  endExpiredAuctions();
};

module.exports = { initAuctionLifecycle };