const cron = require('node-cron');
const { Auction, Bid, User } = require('../models');
const { Op } = require('sequelize');
const emailService = require('./emailService');

class AuctionLifecycleService {
  constructor() {
    this.cronJob = null;
    this.io = null;
  }

  init(io) {
    this.io = io;
    // Run every minute to check for auctions that need status updates
    this.cronJob = cron.schedule('* * * * *', async () => {
      await this.updateAuctionStatuses();
    }, {
      scheduled: false
    });

    console.log('🕐 Auction lifecycle service initialized');
  }

  start() {
    if (this.cronJob) {
      this.cronJob.start();
      console.log('🚀 Auction lifecycle cron job started');
    }
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('⏹️ Auction lifecycle cron job stopped');
    }
  }

  async updateAuctionStatuses() {
    try {
      const now = new Date();
      
      // 1. Check for scheduled auctions that should go live
      await this.activateScheduledAuctions(now);
      
      // 2. Check for live auctions that should end
      await this.endExpiredAuctions(now);
      
    } catch (error) {
      console.error('Error updating auction statuses:', error);
    }
  }

  async activateScheduledAuctions(now) {
    try {
      const auctionsToActivate = await Auction.findAll({
        where: {
          status: 'scheduled',
          goLiveAt: {
            [Op.lte]: now
          }
        }
      });

      for (const auction of auctionsToActivate) {
        await auction.update({ status: 'live' });
        
        // Emit WebSocket event
        if (this.io) {
          this.io.to(`auction:${auction.id}`).emit('auction:status_changed', {
            auctionId: auction.id,
            status: 'live',
            message: 'Auction is now live!'
          });
        }
        
        console.log(`📍 Auction ${auction.id} (${auction.itemName}) is now LIVE`);
      }
    } catch (error) {
      console.error('Error activating scheduled auctions:', error);
    }
  }

  async endExpiredAuctions(now) {
    try {
      const expiredAuctions = await Auction.findAll({
        where: {
          status: 'live',
          [Op.and]: [
            {
              goLiveAt: {
                [Op.ne]: null
              }
            },
            {
              durationMins: {
                [Op.ne]: null
              }
            }
          ]
        },
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

      for (const auction of expiredAuctions) {
        const endTime = new Date(auction.goLiveAt.getTime() + (auction.durationMins * 60 * 1000));
        
        if (now >= endTime) {
          await this.endAuction(auction);
        }
      }
    } catch (error) {
      console.error('Error ending expired auctions:', error);
    }
  }

  async endAuction(auction) {
    try {
      // Update auction status to ended
      await auction.update({ status: 'ended' });
      
      // Emit to auction room that auction has ended
      if (this.io) {
        this.io.to(`auction:${auction.id}`).emit('auction:ended', {
          auctionId: auction.id,
          status: 'ended',
          highestBid: auction.highestBid ? {
            amount: auction.highestBid.amount,
            bidder: auction.highestBid.bidder.name
          } : null,
          message: 'Auction has ended!'
        });

        // Also emit auction state update for immediate UI refresh
        this.io.to(`auction:${auction.id}`).emit('auction_state', {
          ...auction.toJSON(),
          status: 'ended'
        });
      }

      // If there's a highest bid, notify seller for decision
      if (auction.highestBid) {
        // Emit to seller specifically for decision making
        if (this.io) {
          this.io.to(`user:${auction.sellerId}`).emit('auction:requires_decision', {
            auctionId: auction.id,
            auctionName: auction.itemName,
            highestBid: {
              id: auction.highestBid.id,
              amount: auction.highestBid.amount,
              bidder: {
                id: auction.highestBid.bidder.id,
                name: auction.highestBid.bidder.name,
                email: auction.highestBid.bidder.email
              }
            },
            message: 'Please make a decision on the highest bid'
          });
        }

        console.log(`🔨 Auction ${auction.id} (${auction.itemName}) ENDED with highest bid: $${auction.highestBid.amount} by ${auction.highestBid.bidder.name}`);
      } else {
        // No bids - mark as closed with no winner
        await auction.update({ status: 'closed_no_winner' });
        
        // Emit updated status to auction room
        if (this.io) {
          this.io.to(`auction:${auction.id}`).emit('auction_state', {
            ...auction.toJSON(),
            status: 'closed_no_winner'
          });
        }
        
        console.log(`🔨 Auction ${auction.id} (${auction.itemName}) ENDED with no bids`);
      }
      
    } catch (error) {
      console.error(`Error ending auction ${auction.id}:`, error);
    }
  }

  // Method to handle seller decision
  async processSellerDecision(auctionId, decision, sellerId, counterAmount = null) {
    try {
      const auction = await Auction.findByPk(auctionId, {
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

      if (!auction || auction.sellerId !== sellerId) {
        throw new Error('Auction not found or unauthorized');
      }

      if (auction.status !== 'ended') {
        throw new Error('Can only make decisions on ended auctions');
      }

      if (!auction.highestBid) {
        throw new Error('No bids to make a decision on');
      }

      switch (decision) {
        case 'accept':
          await auction.update({ status: 'sold' });
          
          // Send emails
          await emailService.sendBidAcceptedEmail(
            auction.highestBid.bidder,
            auction.seller,
            auction,
            auction.highestBid.amount
          );

          // Send invoices
          await emailService.sendInvoiceEmail(
            auction.highestBid.bidder.email,
            auction.highestBid.bidder.name,
            auction,
            auction.highestBid.amount,
            false // buyer invoice
          );

          await emailService.sendInvoiceEmail(
            auction.seller.email,
            auction.seller.name,
            auction,
            auction.highestBid.amount,
            true // seller invoice
          );

          // Notify buyer
          if (this.io) {
            this.io.to(`user:${auction.highestBid.bidderId}`).emit('bid:accepted', {
              auctionId: auction.id,
              auctionName: auction.itemName,
              amount: auction.highestBid.amount,
              message: 'Congratulations! Your bid has been accepted!'
            });
          }

          console.log(`✅ Auction ${auction.id} - Bid ACCEPTED - Sale confirmed`);
          break;

        case 'reject':
          await auction.update({ status: 'closed_no_winner' });
          
          // Send rejection email
          await emailService.sendBidRejectedEmail(
            auction.highestBid.bidder,
            auction,
            auction.highestBid.amount
          );

          // Notify buyer
          if (this.io) {
            this.io.to(`user:${auction.highestBid.bidderId}`).emit('bid:rejected', {
              auctionId: auction.id,
              auctionName: auction.itemName,
              amount: auction.highestBid.amount,
              message: 'Your bid was not accepted by the seller'
            });
          }

          console.log(`❌ Auction ${auction.id} - Bid REJECTED - No sale`);
          break;

        case 'counter':
          if (!counterAmount || counterAmount <= 0) {
            throw new Error('Valid counter amount is required');
          }

          // Create counter offer record
          const { CounterOffer } = require('../models');
          const counterOffer = await CounterOffer.create({
            auctionId: auction.id,
            sellerId: sellerId,
            buyerId: auction.highestBid.bidderId,
            amount: counterAmount,
            status: 'pending'
          });

          await auction.update({ status: 'ended' });

          // Send counter-offer email
          await emailService.sendCounterOfferEmail(
            auction.highestBid.bidder,
            auction,
            auction.highestBid.amount,
            counterAmount
          );

          // Create notification in database
          const { Notification } = require('../models');
          await Notification.create({
            userId: auction.highestBid.bidderId,
            type: 'counter_offer',
            payload: JSON.stringify({
              auctionId: auction.id,
              auctionName: auction.itemName,
              counterOfferId: counterOffer.id,
              originalBid: auction.highestBid.amount,
              counterAmount: counterAmount,
              sellerName: auction.seller.name
            })
          });

          // Notify buyer of counter-offer via WebSocket
          if (this.io) {
            // Send the standard notification event for toast
            this.io.to(`user:${auction.highestBid.bidderId}`).emit('notification:new', {
              userId: auction.highestBid.bidderId,
              type: 'counter_offer',
              payload: JSON.stringify({
                auctionId: auction.id,
                auctionName: auction.itemName,
                counterOfferId: counterOffer.id,
                originalBid: auction.highestBid.amount,
                counterAmount: counterAmount,
                sellerName: auction.seller.name
              }),
              createdAt: new Date().toISOString()
            });

            // Also send the specific counter-offer event
            this.io.to(`user:${auction.highestBid.bidderId}`).emit('counter_offer:received', {
              auctionId: auction.id,
              auctionName: auction.itemName,
              counterOfferId: counterOffer.id,
              originalBid: auction.highestBid.amount,
              counterAmount: counterAmount,
              message: 'You have received a counter-offer!'
            });
          }

          console.log(`💰 Auction ${auction.id} - COUNTER-OFFER sent: $${counterAmount}`);
          break;

        default:
          throw new Error('Invalid decision');
      }

      return { success: true, decision, auction };
    } catch (error) {
      console.error('Error processing seller decision:', error);
      throw error;
    }
  }

  // Method to handle counter-offer response
  async processCounterOfferResponse(counterOfferId, response, buyerId) {
    try {
      const { CounterOffer } = require('../models');
      
      const counterOffer = await CounterOffer.findByPk(counterOfferId, {
        include: [
          {
            model: Auction,
            as: 'auction',
            include: [
              {
                model: User,
                as: 'seller',
                attributes: ['id', 'name', 'email']
              }
            ]
          },
          {
            model: User,
            as: 'buyer',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!counterOffer || counterOffer.buyerId !== buyerId) {
        throw new Error('Counter-offer not found or unauthorized');
      }

      if (counterOffer.status !== 'pending') {
        throw new Error('Counter-offer already responded to');
      }

      if (response === 'accept') {
        // Accept counter-offer
        await counterOffer.update({ status: 'accepted' });
        await counterOffer.auction.update({ status: 'sold' });

        // Send acceptance emails
        await emailService.sendBidAcceptedEmail(
          counterOffer.buyer,
          counterOffer.auction.seller,
          counterOffer.auction,
          counterOffer.amount
        );

        // Send invoices
        await emailService.sendInvoiceEmail(
          counterOffer.buyer.email,
          counterOffer.buyer.name,
          counterOffer.auction,
          counterOffer.amount,
          false // buyer invoice
        );

        await emailService.sendInvoiceEmail(
          counterOffer.auction.seller.email,
          counterOffer.auction.seller.name,
          counterOffer.auction,
          counterOffer.amount,
          true // seller invoice
        );

        // Notify seller
        if (this.io) {
          this.io.to(`user:${counterOffer.sellerId}`).emit('counter_offer:accepted', {
            auctionId: counterOffer.auctionId,
            auctionName: counterOffer.auction.itemName,
            amount: counterOffer.amount,
            buyer: counterOffer.buyer.name,
            message: 'Counter-offer accepted! Sale confirmed.'
          });

          // Also emit standard notification event
          this.io.to(`user:${counterOffer.sellerId}`).emit('notification:new', {
            userId: counterOffer.sellerId,
            type: 'counter_accepted',
            payload: JSON.stringify({
              auctionId: counterOffer.auctionId,
              auctionName: counterOffer.auction.itemName,
              counterOfferId: counterOffer.id,
              amount: counterOffer.amount,
              buyerName: counterOffer.buyer.name,
              message: 'Counter-offer accepted! Sale confirmed.'
            })
          });
        }

        // Create notification for seller
        const { Notification } = require('../models');
        await Notification.create({
          userId: counterOffer.sellerId,
          type: 'counter_accepted',
          payload: JSON.stringify({
            auctionId: counterOffer.auctionId,
            auctionName: counterOffer.auction.itemName,
            counterOfferId: counterOffer.id,
            amount: counterOffer.amount,
            buyerName: counterOffer.buyer.name,
            message: 'Counter-offer accepted! Sale confirmed.'
          })
        });

        // Send response email to seller
        await emailService.sendCounterOfferResponseEmail(
          counterOffer.auction.seller,
          counterOffer.buyer,
          counterOffer.auction,
          counterOffer.amount,
          'accepted'
        );

        console.log(`✅ Counter-offer ${counterOfferId} ACCEPTED - Sale confirmed at $${counterOffer.amount}`);

      } else if (response === 'reject') {
        // Reject counter-offer
        await counterOffer.update({ status: 'rejected' });
        await counterOffer.auction.update({ status: 'closed_no_winner' });

        // Notify seller
        if (this.io) {
          this.io.to(`user:${counterOffer.sellerId}`).emit('counter_offer:rejected', {
            auctionId: counterOffer.auctionId,
            auctionName: counterOffer.auction.itemName,
            amount: counterOffer.amount,
            buyer: counterOffer.buyer.name,
            message: 'Counter-offer rejected. No sale.'
          });

          // Also emit standard notification event
          this.io.to(`user:${counterOffer.sellerId}`).emit('notification:new', {
            userId: counterOffer.sellerId,
            type: 'counter_rejected',
            payload: JSON.stringify({
              auctionId: counterOffer.auctionId,
              auctionName: counterOffer.auction.itemName,
              counterOfferId: counterOffer.id,
              amount: counterOffer.amount,
              buyerName: counterOffer.buyer.name,
              message: 'Counter-offer rejected. No sale.'
            })
          });
        }

        // Create notification for seller
        const { Notification } = require('../models');
        await Notification.create({
          userId: counterOffer.sellerId,
          type: 'counter_rejected',
          payload: JSON.stringify({
            auctionId: counterOffer.auctionId,
            auctionName: counterOffer.auction.itemName,
            counterOfferId: counterOffer.id,
            amount: counterOffer.amount,
            buyerName: counterOffer.buyer.name,
            message: 'Counter-offer rejected. No sale.'
          })
        });

        // Send response email to seller
        await emailService.sendCounterOfferResponseEmail(
          counterOffer.auction.seller,
          counterOffer.buyer,
          counterOffer.auction,
          counterOffer.amount,
          'rejected'
        );

        console.log(`❌ Counter-offer ${counterOfferId} REJECTED - No sale`);

      } else {
        throw new Error('Invalid response. Must be "accept" or "reject"');
      }

      return { success: true, response, counterOffer };
    } catch (error) {
      console.error('Error processing counter-offer response:', error);
      throw error;
    }
  }
}

module.exports = new AuctionLifecycleService();
