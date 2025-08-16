'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create test users
    const users = [
      {
        id: uuidv4(),
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        email: 'seller@example.com',
        name: 'Test Seller',
        role: 'seller',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        email: 'buyer@example.com',
        name: 'Test Buyer',
        role: 'buyer',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});

    // Create test auctions
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const auctions = [
      {
        id: uuidv4(),
        sellerId: users[1].id, // seller@example.com
        itemName: 'Vintage Watch',
        description: 'A beautiful vintage watch in excellent condition.',
        startPrice: 100.00,
        bidIncrement: 10.00,
        goLiveAt: tomorrow,
        durationMins: 60,
        status: 'scheduled',
        highestBidId: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        sellerId: users[1].id, // seller@example.com
        itemName: 'Antique Vase',
        description: 'A rare antique vase from the 18th century.',
        startPrice: 200.00,
        bidIncrement: 20.00,
        goLiveAt: new Date(now.getTime() - 30 * 60000), // 30 minutes ago
        durationMins: 120,
        status: 'live',
        highestBidId: null,
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('auctions', auctions, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove seed data
    await queryInterface.bulkDelete('auctions', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};