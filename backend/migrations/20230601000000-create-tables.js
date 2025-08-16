'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('buyer', 'seller', 'admin'),
        allowNull: false,
        defaultValue: 'buyer'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create auctions table
    await queryInterface.createTable('auctions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      sellerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      itemName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      startPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      bidIncrement: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      goLiveAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      durationMins: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'live', 'ended', 'closed_no_winner', 'sold'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      highestBidId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create bids table
    await queryInterface.createTable('bids', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      auctionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'auctions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      bidderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create notifications table
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create counter_offers table
    await queryInterface.createTable('counter_offers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      auctionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'auctions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sellerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      buyerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add foreign key constraint for highestBidId in auctions table
    await queryInterface.addConstraint('auctions', {
      fields: ['highestBidId'],
      type: 'foreign key',
      name: 'auctions_highest_bid_fk',
      references: {
        table: 'bids',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Add indexes
    await queryInterface.addIndex('auctions', ['goLiveAt'], {
      name: 'auctions_go_live_at_idx'
    });

    await queryInterface.addIndex('bids', ['auctionId', 'amount', 'createdAt'], {
      name: 'bids_auction_amount_created_idx'
    });

    await queryInterface.addIndex('notifications', ['userId', 'createdAt'], {
      name: 'notifications_user_created_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to avoid foreign key constraints
    await queryInterface.dropTable('counter_offers');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('bids');
    await queryInterface.dropTable('auctions');
    await queryInterface.dropTable('users');
  }
};