const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bid = sequelize.define('Bid', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    auctionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'auctions',
        key: 'id'
      }
    },
    bidderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'bids',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        name: 'bids_auction_amount_created_idx',
        fields: ['auctionId', 'amount', 'createdAt'],
        order: [['amount', 'DESC'], ['createdAt', 'ASC']]
      }
    ]
  });

  Bid.associate = (models) => {
    // A bid belongs to an auction
    Bid.belongsTo(models.Auction, {
      foreignKey: 'auctionId',
      as: 'auction'
    });

    // A bid belongs to a bidder (User)
    Bid.belongsTo(models.User, {
      foreignKey: 'bidderId',
      as: 'bidder'
    });

    // A bid can be the highest bid for an auction
    Bid.hasOne(models.Auction, {
      foreignKey: 'highestBidId',
      as: 'highestBidForAuction'
    });
  };

  return Bid;
};