const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CounterOffer = sequelize.define('CounterOffer', {
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
    sellerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    buyerId: {
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
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
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
    tableName: 'counter_offers',
    timestamps: true
  });

  CounterOffer.associate = (models) => {
    // A counter offer belongs to an auction
    CounterOffer.belongsTo(models.Auction, {
      foreignKey: 'auctionId',
      as: 'auction'
    });

    // A counter offer belongs to a seller (User)
    CounterOffer.belongsTo(models.User, {
      foreignKey: 'sellerId',
      as: 'seller'
    });

    // A counter offer belongs to a buyer (User)
    CounterOffer.belongsTo(models.User, {
      foreignKey: 'buyerId',
      as: 'buyer'
    });
  };

  return CounterOffer;
};