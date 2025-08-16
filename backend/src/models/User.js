const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('buyer', 'seller', 'admin'),
      allowNull: false,
      defaultValue: 'buyer'
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
    tableName: 'users',
    timestamps: true
  });

  User.associate = (models) => {
    // A user can create many auctions as a seller
    User.hasMany(models.Auction, {
      foreignKey: 'sellerId',
      as: 'auctions'
    });

    // A user can place many bids as a buyer
    User.hasMany(models.Bid, {
      foreignKey: 'bidderId',
      as: 'bids'
    });

    // A user can have many notifications
    User.hasMany(models.Notification, {
      foreignKey: 'userId',
      as: 'notifications'
    });

    // A user can have many counter offers as a seller
    User.hasMany(models.CounterOffer, {
      foreignKey: 'sellerId',
      as: 'sellerCounterOffers'
    });

    // A user can have many counter offers as a buyer
    User.hasMany(models.CounterOffer, {
      foreignKey: 'buyerId',
      as: 'buyerCounterOffers'
    });
  };

  return User;
};