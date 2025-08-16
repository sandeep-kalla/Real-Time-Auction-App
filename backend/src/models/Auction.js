const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Auction = sequelize.define('Auction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sellerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    startPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    bidIncrement: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    goLiveAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    durationMins: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'live', 'ended', 'closed_no_winner', 'sold'),
      allowNull: false,
      defaultValue: 'scheduled'
    },
    highestBidId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'bids',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'auctions',
    timestamps: true,
    indexes: [
      {
        name: 'auctions_go_live_at_idx',
        fields: ['goLiveAt']
      }
    ]
  });

  Auction.associate = (models) => {
    // An auction belongs to a seller (User)
    Auction.belongsTo(models.User, {
      foreignKey: 'sellerId',
      as: 'seller'
    });

    // An auction has many bids
    Auction.hasMany(models.Bid, {
      foreignKey: 'auctionId',
      as: 'bids'
    });

    // An auction has one highest bid
    Auction.belongsTo(models.Bid, {
      foreignKey: 'highestBidId',
      as: 'highestBid'
    });

    // An auction has many counter offers
    Auction.hasMany(models.CounterOffer, {
      foreignKey: 'auctionId',
      as: 'counterOffers'
    });
  };

  return Auction;
};