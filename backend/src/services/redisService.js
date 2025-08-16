/**
 * Redis service for high-performance bid operations
 */
const Redis = require('ioredis');
require('dotenv').config();

// Initialize Redis client
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

/**
 * Get the current highest bid for an auction
 * @param {string} auctionId - Auction ID
 * @returns {Promise<Object>} - Highest bid data
 */
const getHighestBid = async (auctionId) => {
  try {
    const bidData = await redisClient.get(`auction:${auctionId}:highest_bid`);
    return bidData ? JSON.parse(bidData) : null;
  } catch (error) {
    console.error('Redis error getting highest bid:', error);
    return null;
  }
};

/**
 * Set the highest bid for an auction
 * @param {string} auctionId - Auction ID
 * @param {Object} bidData - Bid data to store
 * @returns {Promise<boolean>} - Success status
 */
const setHighestBid = async (auctionId, bidData) => {
  try {
    await redisClient.set(
      `auction:${auctionId}:highest_bid`,
      JSON.stringify(bidData)
    );
    return true;
  } catch (error) {
    console.error('Redis error setting highest bid:', error);
    return false;
  }
};

/**
 * Add a bid to the auction's bid history
 * @param {string} auctionId - Auction ID
 * @param {Object} bidData - Bid data to store
 * @returns {Promise<boolean>} - Success status
 */
const addBidToHistory = async (auctionId, bidData) => {
  try {
    await redisClient.lpush(
      `auction:${auctionId}:bids`,
      JSON.stringify(bidData)
    );
    // Trim the list to keep only the most recent bids
    await redisClient.ltrim(`auction:${auctionId}:bids`, 0, 99);
    return true;
  } catch (error) {
    console.error('Redis error adding bid to history:', error);
    return false;
  }
};

/**
 * Get recent bids for an auction
 * @param {string} auctionId - Auction ID
 * @param {number} count - Number of bids to retrieve
 * @returns {Promise<Array>} - Recent bids
 */
const getRecentBids = async (auctionId, count = 10) => {
  try {
    const bids = await redisClient.lrange(`auction:${auctionId}:bids`, 0, count - 1);
    return bids.map(bid => JSON.parse(bid));
  } catch (error) {
    console.error('Redis error getting recent bids:', error);
    return [];
  }
};

/**
 * Process a new bid with Redis
 * @param {string} auctionId - Auction ID
 * @param {Object} bidData - Bid data
 * @returns {Promise<Object>} - Result with status and message
 */
const processBid = async (auctionId, bidData) => {
  try {
    // Get current highest bid
    const currentHighestBid = await getHighestBid(auctionId);
    
    // Check if this bid is higher
    if (currentHighestBid && bidData.amount <= currentHighestBid.amount) {
      return {
        success: false,
        message: `Bid must be higher than current highest bid of ${currentHighestBid.amount}`
      };
    }
    
    // Set as highest bid
    await setHighestBid(auctionId, bidData);
    
    // Add to bid history
    await addBidToHistory(auctionId, bidData);
    
    return {
      success: true,
      message: 'Bid processed successfully',
      bid: bidData
    };
  } catch (error) {
    console.error('Redis error processing bid:', error);
    return {
      success: false,
      message: 'Error processing bid'
    };
  }
};

/**
 * Clear auction data from Redis when auction ends
 * @param {string} auctionId - Auction ID
 * @returns {Promise<boolean>} - Success status
 */
const clearAuctionData = async (auctionId) => {
  try {
    await redisClient.del(`auction:${auctionId}:highest_bid`);
    await redisClient.del(`auction:${auctionId}:bids`);
    return true;
  } catch (error) {
    console.error('Redis error clearing auction data:', error);
    return false;
  }
};

module.exports = {
  getHighestBid,
  setHighestBid,
  addBidToHistory,
  getRecentBids,
  processBid,
  clearAuctionData,
  redisClient
};