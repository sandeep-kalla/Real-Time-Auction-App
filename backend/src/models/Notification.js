const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        name: 'notifications_user_created_idx',
        fields: ['userId', 'createdAt']
      }
    ]
  });

  Notification.associate = (models) => {
    // A notification belongs to a user
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Notification;
};